import Fastify from 'fastify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import Database from 'better-sqlite3';
import fastifyWebsocket from '@fastify/websocket';
import { registerGameRoutes } from './game';
import playerRoutes from './src/routes/pongPlayer';
import tournamentRoutes from './src/routes/pongTournament';
import { PlayerService } from './src/db/playerService';
import bcrypt from 'bcrypt';
// import jwt from '@fastify/jwt'; // <- here
import fastifyMultipart from "@fastify/multipart";
import { gameAvatars } from './game/pong/routes/game';


import { getAllGames, updateStatus, removeGame } from './game/pong/utils/gameManager';
import { broadcastPongGameState } from './game/pong/websocket/gameSocket';

const server = Fastify({ logger: false });
const dbPath = process.env.DB_PATH || '/db/db.db';
const db = new Database(dbPath);

function ensureSchema() {
  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT,
      display_name TEXT,
      twofa_secret TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tournaments (
      key INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      maxUser INTEGER NOT NULL,
      creatorKey INTEGER,
      starttime TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (creatorKey) REFERENCES Users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS tournamentUsers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournamentKey INTEGER NOT NULL,
      userKey INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (tournamentKey, userKey),
      FOREIGN KEY (tournamentKey) REFERENCES tournaments(key) ON DELETE CASCADE,
      FOREIGN KEY (userKey) REFERENCES Users(id) ON DELETE CASCADE
    );
  `);
  server.log.info({ dbPath }, "DB schema ensured");
}

// Register jwt module for testing purposes // <- here
// server.register(jwt, {
//   secret: 'supersecret'
// });
// server.decorate("authenticate", async function (request, reply) {
//   try {
//     await request.jwtVerify(); // prüft den Token aus dem Authorization Header
//   } catch (err) {
//     reply.status(200).send({ authorized: false, err: err });
//   }
// });

// Store WebSocket connections by game ID
const gameConnections = new Map<string, Set<any>>();

(async () => {
  ensureSchema();
  // Register WebSocket support
  await server.register(fastifyWebsocket);

  // CORS
  await server.register(cors, {
    origin: (process.env.CORS_ORIGIN ?? 'https://localhost').split(','),
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  });
  await server.register(cookie);

  // JWT（supersecret -> from .env）
  await server.register(jwt, {
    secret: process.env.JWT_SECRET || 'dev-change-me',
    sign: { issuer: 'pong-app' },
  });

  // Register jwt module for testing purposes
  // server.register(jwt, {
  //   secret: 'supersecret'
  // });
  // server.decorate("authenticate", async function (request, reply) {
  //   try {
  //     await request.jwtVerify(); // prüft den Token aus dem Authorization Header
  //   } catch (err) {
  //     reply.status(200).send({ authorized: false, err: err });
  //   }
  // });

  // decorater
  server.decorate('authenticate', async function (request, reply) {
    try { await request.jwtVerify(); }
    catch (error) {
      if (Error.name === "TokenExpiredError")
        return reply.status(401).send({ error: 'Session Expired, please log in again!'});
      else
        return reply.status(401).send({ error: 'Invalid Token'});
    }
  });

  // Root endpoint <- here
  server.get('/', async (_req, reply) => {
    return { message: 'API is up. See /health. Frontend at https://localhost' };
    // Or: reply.redirect('/health')
  });

  // Health check endpoint
  server.get('/health', async () => ({ status: 'ok', message: 'Transcendence backend is running', services: ['pong-game','users','auth'] }));

  //login route to login a user
  server.post('/login', async (request: FastifyRequest<{ Body: LoginBody }>, reply) => {
    const { username, password } = request.body;

    if (!username || !password) {
      return reply.code(400).send({ error: 'Username or password input empty!' });
    }

    // id も欲しいので SELECT に id を含める
    const stmt = db.prepare('SELECT id, username, password, email FROM Users WHERE username=?');
    const user = stmt.get(username);

    if (!user) return reply.code(400).send({ error: 'Username not found!' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok)   return reply.code(400).send({ error: 'Wrong password!' });

    const token = server.jwt.sign(
      { sub: user.id, username: user.username, role: 'player' },
      { expiresIn: process.env.TOKEN_EXPIRES_IN || '1h' }
    );

    return reply.code(200).send({ jwtToken: token });
  });

  server.post(
    '/createTournament',
    { preHandler: [server.authenticate] },
    async (request: FastifyRequest<{ Body: createTournament }>, reply) => {
      const { tournamentName, maxPlayer } = request.body;
      if (!tournamentName || !maxPlayer) {
        return reply.code(400).send({ error: 'At least one input field is empty!' });
      }
      const creatorId = (request as any).user?.sub; // JWT から
      try {
        const insert = db.prepare('INSERT INTO tournaments (name, maxUser, creatorKey) VALUES (?, ?, ?)');
        insert.run(tournamentName, maxPlayer, creatorId);
        return reply.code(201).send({ status: 'ok' });
      } catch (error) {
        return reply.code(500).send({ status: 'fail', error: String(error) });
      }
    }
  );

  server.post(
    '/registerToTournament',
    { preHandler: [server.authenticate] },
    async (request: FastifyRequest<{ Body: registerToTournament }>, reply) => {
      const { tournamentKey } = request.body;
      if (!tournamentKey) return reply.code(400).send({ error: 'tournamentKey is required' });

      const userId = (request as any).user?.sub;
      try {
        const insert = db.prepare('INSERT INTO tournamentUsers (tournamentKey, userKey) VALUES (?, ?)');
        insert.run(tournamentKey, userId);
        return reply.code(201).send({ status: 'ok' });
      } catch (error) {
        return reply.code(500).send({ status: 'fail', error: String(error) });
      }
    }
  );

  server.get('/getTournaments',async (request, reply) => { 
    let status = 'ok';
    let errorMsg = "";

    const getTournamentsStmt = db.prepare('SELECT * FROM tournaments');
    const result = getTournamentsStmt.all();

    if (result == undefined) {
      status= 'fail';
      errorMsg = 'No Tournaments available!'
    }
    console.log(result);

    reply.send({
      status: status,
      errorMsg: errorMsg,
      tournaments: result
    });
  });

  server.get('/getTournaments/:id', async (request, reply) => {
    const getTournamentByIdStmt = db.prepare(`
      SELECT 
        tournaments.*,
        COUNT(tournamentUsers.userKey) AS registeredUsers
      FROM tournaments
      LEFT JOIN tournamentUsers ON tournamentUsers.tournamentKey = tournaments.key
      WHERE tournaments.key = ?
      GROUP BY tournaments.key
    `);
    const { id } = request.params as { id: string }
    const tournament = getTournamentByIdStmt.get(id);
    console.log(tournament);
    reply.send(tournament);
  });


  await server.register(fastifyMultipart, {
    limits: {
      fileSize: 10 * 1024 * 1024 // max 10 MB z. B.
    }
  });

  // Register player routes
  server.register(playerRoutes, { prefix: '/api/players' });
  // Register tournament routes - Use the separate tournament routes file
  server.register(tournamentRoutes, { prefix: '/api/tournament' });
  // Register game route
  server.register(async (fastify) => { await registerGameRoutes(fastify, gameConnections); }, { prefix: '/game' });

  await server.listen({ port: 3000, host: '0.0.0.0' });
  console.log('Transcendence Backend started on port 3000');
  console.log('Pong game available at /game/pong/*');

  startGameLoop();
  
})().catch(err => {
  server.log.error(err);
  process.exit(1);
});

function startGameLoop(){
  const GAME_TICK_RATE = 60; // 60 FPS for smooth gameplay
  const TICK_INTERVAL = 1000 / GAME_TICK_RATE; 
  let frameCount = 0; // For occasional logging

  setInterval(async () => {
    try {
      const games = getAllGames();
      frameCount++;

      games.forEach(game => {
        if (game.state === 'playing') {
          updateStatus(game);

          // Only log every 5 seconds (300 frames) instead of every frame
          // if (frameCount % 300 === 0) {
          //   console.log(`[GAME LOOP] Game ${game.id} running - Ball at (${game.ball.x.toFixed(1)}, ${game.ball.y.toFixed(1)})`);
          // }
          
          const connections = gameConnections.get(game.id);
          if (connections && connections.size > 0) {
            const avatars = gameAvatars.get(game.id);
            if (avatars)
            {
              const message = {
                type: "avatars",
                player1: avatars.player1,
                player2: avatars.player2,
                player1name: avatars.player1alias,
                player2name: avatars.player2alias,
              }
              connections.forEach(connection => {
                try {
                  connection.send(JSON.stringify(message));
                } catch (error) {
                  console.error('Error sending WebSocket message:', error);
                }
              });
              gameAvatars.delete(game.id);
            }
            broadcastPongGameState(game.id, game, gameConnections);
          }
        }
        else if (game.state === 'player1_wins' || game.state === 'player2_wins' || game.state === 'connection_lost') {
          //relevant if statement for Data entry
          console.log(game.state);
          if (game.state === 'connection_lost')
          {
            if (PlayerService.removeRemoteGame(game.id) == false){
              console.log("Something went wrong");
            }
            else{
              console.log("Hurrrayy worked");
            }
          }
          if ((game.state === 'player1_wins' || game.state === 'player2_wins') && game.mode === 'remote')
          {
            if (PlayerService.updateRemoteScore(game.id, game.player1.score, game.player2.score) == false){
              console.log("Something went wrong");
            }
            else{
              console.log("Hurrrayy worked");
            }
          }
          broadcastPongGameState(game.id, game, gameConnections);
          const connections = gameConnections.get(game.id);
          if (connections)
          {
            connections.forEach(ws => {
              ws.close();
            })
            gameConnections.delete(game.id);
            removeGame(game.id);
          }
          gameConnections.delete(game.id);
        }
      });
    }catch (error) {
      console.error('Error in game loop:', error);
    }
  }, TICK_INTERVAL);
  console.log(`Game loop started with tick rate of ${GAME_TICK_RATE} FPS`);
}

//interface for login route
interface LoginBody { username: string; password: string; }

interface createTournament { tournamentName: string; maxPlayer: string; }

interface registerToTournament { tournamentKey: string; }
