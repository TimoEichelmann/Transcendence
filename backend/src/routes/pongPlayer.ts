import {FastifyInstance} from 'fastify';
import {PlayerService, Player, JwtPayload} from '../db/playerService';
import { request } from 'http';
import { error } from 'console';
import fs from "fs";
import path from "path";
import { pipeline } from "stream";
import { promisify } from "util";
import fastifyJwt from '@fastify/jwt';
import * as speakeasy from "speakeasy";

export default async function playerRoutes(fastify: FastifyInstance) {
  fastify.post('/create', async (request, reply) => {
    try {
      const { username, email, display_name, password, repassword } = request.body as any;

      if (!username || !email || !display_name || !password || !repassword)
        return reply.code(400).send({ error: 'Missing required fields: username, email, display_name, password, repassword' });
      if (password !== repassword)
        return reply.code(400).send({ error: 'Passwords are not equal!' });

      const existing = PlayerService.getPlayerByUsername(username);
      if (existing)
        return reply.code(409).send({ error: 'Player with this username already exists' });

      const secret = speakeasy.generateSecret({ name: `PongApp(${username})` });

      // const newPlayer = await PlayerService.createPlayer({ username, email, display_name, password });
      const newPlayer = await PlayerService.createPlayer({
        username, email, display_name, password, twofa_secret: secret.base32
      });

      // create 2FA secret for the user and return the QR code URL
      return reply.code(201).send({ 
        success: true,
        data: newPlayer,
        twofa_qr: secret.otpauth_url
      });
    } catch (e:any) {
      return reply.code(500).send({ error: 'Failed to create player', details: e?.message ?? 'Unknown error' });
    }
  });

  // Create a new player
  fastify.post('/create_old', async (request, reply) => {
    try {
      const playerData = request.body as Omit<Player, 'id'>;
      
      // Validate required fields
      if (!playerData.username || !playerData.email || !playerData.display_name) {
        return reply.status(400).send({
          error: 'Missing required fields: username, email, display_name'
        });
      }

      // Check if player already exists
      const existingPlayer = PlayerService.getPlayerByUsername(playerData.username);
      if (existingPlayer) {
        return reply.status(409).send({
          error: 'Player with this username already exists'
        });
      }

      // Check if passwords are the same
      if (request.body.repassword != playerData.password){
        return reply.status(400).send({
          error: 'Passwords are not equal!'
        });
      }

      const newPlayer = PlayerService.createPlayer(playerData);
      return reply.status(200).send({
        success: true,
        data: newPlayer
      });
    } catch (error) {
      return reply.status(500).send({
        error: 'Failed to create player',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  fastify.post<{
    Body: { username: string }
  }>('/updateusername', async (request, reply) =>{
    let decoded: JwtPayload;
    try {
      decoded = await request.jwtVerify();
      PlayerService.updateLastActivity(decoded.userkey);
    } catch (error) {
      if (Error.name === "TokenExpiredError")
        return reply.status(401).send({ error: 'Session Expired, please log in again!'});
      else
        return reply.status(401).send({ error: 'Invalid Token'});
    }
    try {
      if (!request.body.username) {
        return reply.status(400).send({
          error: 'Missing required fields: username'
        });
      }
      const existingPlayer = PlayerService.getPlayerByUsername(request.body.username);
      if (existingPlayer) {
        return reply.status(409).send({
          error: 'Player with this username already exists'
        });
      }
      const res = PlayerService.updateUsername(decoded.userkey, request.body.username)
      if (res == true) {
        return reply.status(200).send({
          success: 'true',
          msg: "Successfully updated username"
        });
      }
      return reply.status(400).send({
        error: 'Unable to update username!'
      });
    } catch (error) {
      return reply.status(500).send({
        error: error
      });
    }
  })

  fastify.post<{
    Body: { displayname: string }
  }>('/updatedisplayname', async (request, reply) =>{
    let decoded: JwtPayload;
    try {
      decoded = await request.jwtVerify();
      PlayerService.updateLastActivity(decoded.userkey);
    } catch (error) {
      if (Error.name === "TokenExpiredError")
        return reply.status(401).send({ error: 'Session Expired, please log in again!'});
      else
        return reply.status(401).send({ error: 'Invalid Token'});
    }
    try {
      if (!request.body.displayname) {
        return reply.status(400).send({
          error: 'Missing required fields: displayname'
        });
      }
      const res = PlayerService.updateDisplayname(decoded.userkey, request.body.displayname)
      if (res == true) {
        return reply.status(200).send({
          success: 'true',
          msg: "Successfully updated displayname"
        });
      }
      return reply.status(400).send({
        error: 'Unable to update displayname!'
      });
    } catch (error) {
      return reply.status(500).send({
        error: error
      });
    }
  })

  fastify.post<{
    Body: { email: string }
  }>('/updateemail', async (request, reply) =>{
    let decoded: JwtPayload;
    try {
      decoded = await request.jwtVerify();
      PlayerService.updateLastActivity(decoded.userkey);
    } catch (error) {
      if (Error.name === "TokenExpiredError")
        return reply.status(401).send({ error: 'Session Expired, please log in again!'});
      else
        return reply.status(401).send({ error: 'Invalid Token'});
    }
    try {
      if (!request.body.email) {
        return reply.status(400).send({
          error: 'Missing required fields: email'
        });
      }
      const existingPlayer = PlayerService.getPlayerByEmail(request.body.email);
      if (existingPlayer) {
        return reply.status(409).send({
          error: 'Player with this email already exists'
        });
      }
      const res = PlayerService.updateEmail(decoded.userkey, request.body.email);
      if (res == true) {
        return reply.status(200).send({
          success: 'true',
          msg: "Successfully updated email"
        });
      }
      return reply.status(400).send({
        error: 'Unable to update email!'
      });
    } catch (error) {
      return reply.status(500).send({
        error: error
      });
    }
  })

  fastify.post<{
    Body: { oldpw: string, newpw: string, renewpw: string }
  }>('/updatepassword', async (request, reply) =>{
    let decoded: JwtPayload;
    try {
      decoded = await request.jwtVerify();
      PlayerService.updateLastActivity(decoded.userkey);
    } catch (error) {
      if (Error.name === "TokenExpiredError")
        return reply.status(401).send({ error: 'Session Expired, please log in again!'});
      else
        return reply.status(401).send({ error: 'Invalid Token'});
    }
    try {
      if (!request.body.oldpw || !request.body.newpw || !request.body.renewpw) {
        return reply.status(400).send({
          error: 'Missing at least 1 required fields: old password, new password, retype new password'
        });
      }
      if (request.body.newpw !== request.body.renewpw){
        return reply.status(400).send({
          error: 'New password and retype new password are not the same.'
        });
      }
      const check = await PlayerService.checkPass(decoded.username, request.body.oldpw);
      if (check == false){
        return reply.status(400).send({
          error: 'Old password incorrect!'
        });
      }
      const res = await PlayerService.updatePassword(decoded.userkey, request.body.newpw);
      if (res == true) {
        return reply.status(200).send({
          success: 'true',
          msg: "Successfully updated password"
        });
      }
      return reply.status(400).send({
        error: 'Unable to update password!'
      });
    } catch (error) {
      return reply.status(500).send({
        error: error
      });
    }
  })

  fastify.post<{
    Body: {}
  }>('/deleteuser', async (request, reply) =>{
    let decoded: JwtPayload;
    try {
      decoded = await request.jwtVerify();
      PlayerService.updateLastActivity(decoded.userkey);
    } catch (error) {
      if (Error.name === "TokenExpiredError")
        return reply.status(401).send({ error: 'Session Expired, please log in again!'});
      else
        return reply.status(401).send({ error: 'Invalid Token'});
    }
    try {
      const res = await PlayerService.deleteUser(decoded.userkey);
      if (res == true) {
        return reply.status(200).send({
          success: 'true',
          msg: "Sucessfully deleted profile"
        });
      }
      return reply.status(400).send({
        error: 'Unable to delete profile!'
      });
    } catch (error) {
      return reply.status(500).send({
        error: error
      });
    }
  })

  fastify.get('/profiledata', async (request, reply) => {
    let decoded: JwtPayload;
    try {
      decoded = await request.jwtVerify();
      PlayerService.updateLastActivity(decoded.userkey);
    } catch (error) {
      if (Error.name === "TokenExpiredError")
        return reply.status(401).send({ error: 'Session Expired, please log in again!'});
      else
        return reply.status(401).send({ error: 'Invalid Token'});
    }
    try {
      let data = await PlayerService.getPlayerById(decoded.userkey);
      if (data){
        return reply.status(200).send({
          userid: data.id,
          username: data.username,
          displayname: data.display_name,
          email: data.email,
          image: data.avatar_url
        });
      }
      return reply.status(400).send({
        error: "Can't find user"
      });
    } catch (error) {
      return reply.status(500).send({
        error: "Unknown error"
      })
    }
  });

  fastify.post("/uploadprofileimage", async (request, reply) => {
    try {
      let decoded: JwtPayload;
      try {
        decoded = await request.jwtVerify();
        PlayerService.updateLastActivity(decoded.userkey);
      } catch (error) {
      if (Error.name === "TokenExpiredError")
        return reply.status(401).send({ error: 'Session Expired, please log in again!'});
      else
        return reply.status(401).send({ error: 'Invalid Token'});
    }
      const userId = decoded.userkey;            // oder was immer dein Token hat

      const data = await request.file(); // einzelne Datei holen (Name "image")
      if (!data) {
        return reply.status(400).send({ error: "No file uploaded" });
      }
      // Zielpfad (z. B. userId.jpg)
      const uploadDir = path.resolve("/profile-images"); // im Container
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileName = `${userId}.jpg`;
      const filePath = path.join(uploadDir, fileName);

      // Datei speichern
      const pump = promisify(pipeline);
      await pump(data.file, fs.createWriteStream(filePath));

      const res = PlayerService.updateProfileImage(decoded.userkey, filePath);
      
      if (res){
        return reply.send({
          success: true,
          msg: "Successfully updated profile image"
        });
      }
      return reply.send({
        error: "Image could not be uploaded!"
      });
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: "Upload failed" });
    }
  })

  fastify.post<{
      Body: { username: string, password: string, twofa_token?: string }
  }>('/login', async (request, reply) => {
    try {
      const loginData = { 
        username: request.body.username,
        password: request.body.password,
        twofa_token: request.body.twofa_token
      };
      
      // Validate required fields
      if (request.body.username == "" || request.body.password == "") {
        return reply.status(400).send({
          error: 'Missing required fields: username, password'
        });
      }

      const user = PlayerService.getPlayerByUsername(loginData.username);
      if (!user) {
        return reply.code(400).send({ error: 'User not found' });
      }

      const ok = await PlayerService.verifyPassword(user, loginData.password);
      if (!ok) {
        return reply.code(400).send({ error: 'Wrong password' });
      }

      if (user.twofa_secret) {
        if (!loginData.twofa_token) {
          return reply.code(400).send({ error: '2FA code required' });
        }

        const verified = speakeasy.totp.verify({
          secret: user.twofa_secret,
          encoding: 'base32',
          token: loginData.twofa_token,
          window: 1
        });

        if (!verified) {
          return reply.code(400).send({ error: 'Invalid 2FA code' });
        }
      }

      const jwtToken = await PlayerService.loginUser(loginData, fastify);
      if (jwtToken.jwtToken != "") {
        return reply.status(200).send({
          jwtToken: jwtToken.jwtToken
        }); 
      }
      else{
        return reply.status(400).send({
          jwtToken: jwtToken.jwtToken,
          error: 'Username or password incorrect!'
        });
      }
    } catch (error) {
      return reply.status(500).send({
        error: 'Failed to login player',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  fastify.get('/isauthanticated', async (request, reply) => {
    let decoded: JwtPayload;
    try {
      decoded = await request.jwtVerify();
      PlayerService.updateLastActivity(decoded.userkey);
      return {success: true};
    } catch (error) {
      if (Error.name === "TokenExpiredError")
        return reply.status(401).send({ success: false, error: 'Session Expired, please log in again!'});
      else
        return reply.status(401).send({ success: false, serror: 'Invalid Token'});
    }
  });

  // Get all players
  fastify.get('/list', async (request, reply) => {
    try {
      const players = PlayerService.getAllPlayers();
      return reply.send({
        success: true,
        data: players
      });
    } catch (error) {
      return reply.status(500).send({
        error: 'Failed to fetch players',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get player by ID
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const player = PlayerService.getPlayerById(parseInt(id));
      
      if (!player) {
        return reply.status(404).send({
          error: 'Player not found'
        });
      }

      return reply.send({
        success: true,
        data: player
      });
    } catch (error) {
      return reply.status(500).send({
        error: 'Failed to fetch player',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Update player stats
  fastify.put('/:id/stats', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { wins, losses, rank_points } = request.body as {
        wins: number;
        losses: number;
        rank_points: number;
      };

      const success = PlayerService.updatePlayerStats(
        parseInt(id),
        wins,
        losses,
        rank_points
      );

      if (!success) {
        return reply.status(404).send({
          error: 'Player not found or update failed'
        });
      }

      return reply.send({
        success: true,
        message: 'Player stats updated successfully'
      });
    } catch (error) {
      return reply.status(500).send({
        error: 'Failed to update player stats',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Delete player
  fastify.delete('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const success = PlayerService.deletePlayer(parseInt(id));

      if (!success) {
        return reply.status(404).send({
          error: 'Player not found'
        });
      }

      return reply.send({
        success: true,
        message: 'Player deleted successfully'
      });
    } catch (error) {
      return reply.status(500).send({
        error: 'Failed to delete player',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  fastify.get("/playerstats", async (request, reply) => {
    try {
      let decoded: JwtPayload;
      try {
        decoded = await request.jwtVerify();
        PlayerService.updateLastActivity(decoded.userkey);
      } catch (error) {
      if (Error.name === "TokenExpiredError")
        return reply.status(401).send({ error: 'Session Expired, please log in again!'});
      else
        return reply.status(401).send({ error: 'Invalid Token'});
    }
      const userId = decoded.userkey;
      let data = await PlayerService.getPlayerStats(decoded.userkey);
      return reply.status(200).send(data);
    } catch (error) {
      return reply.status(500).send({
        error: 'Failed to fetch data',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  fastify.get("/gamestats/:id", async (request, reply) => {
    const { id } = request.params as { id: number };
    try {
      let decoded: JwtPayload;
      try {
        decoded = await request.jwtVerify();
        PlayerService.updateLastActivity(decoded.userkey);
      } catch (error) {
      if (Error.name === "TokenExpiredError")
        return reply.status(401).send({ error: 'Session Expired, please log in again!'});
      else
        return reply.status(401).send({ error: 'Invalid Token'});
    }
      const userId = decoded.userkey;
      let data = await PlayerService.getGameStats(decoded.userkey, id);
      return reply.status(200).send(data);
    } catch (error) {
      return reply.status(500).send({
        error: 'Failed to fetch data',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  fastify.post<{
      Body: { displayname: string }
  }>('/getuserbydisplayname', async (request, reply) => {
    try {
      const userdata = await PlayerService.getUserByDisplayname(request.body.displayname);
      return reply.status(200).send(userdata);
    } catch (error) {
      return reply.status(500).send({
        error: 'Failed to login player',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  fastify.post<{
      Body: { displayname: string }
  }>('/addfriend', async (request, reply) => {
    let decoded: JwtPayload;
    try {
      decoded = await request.jwtVerify();
      PlayerService.updateLastActivity(decoded.userkey);
    } catch (error) {
      if (Error.name === "TokenExpiredError")
        return reply.status(401).send({ error: 'Session Expired, please log in again!'});
      else
        return reply.status(401).send({ error: 'Invalid Token'});
    }
    try {
      const result = await PlayerService.addFriend(decoded.userkey, request.body.displayname);
      return reply.status(200).send(result);
    } catch (error) {
      return reply.status(500).send({
        error: 'Something went wrong',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  fastify.post<{
      Body: { friend_id: string }
  }>('/removefriend', async (request, reply) => {
    let decoded: JwtPayload;
    try {
      decoded = await request.jwtVerify();
      PlayerService.updateLastActivity(decoded.userkey);
    } catch (error) {
      if (Error.name === "TokenExpiredError")
        return reply.status(401).send({ error: 'Session Expired, please log in again!'});
      else
        return reply.status(401).send({ error: 'Invalid Token'});
    }
    try {
      const result = await PlayerService.removeFriend(decoded.userkey, request.body.friend_id);
      return reply.status(200).send(result);
    } catch (error) {
      return reply.status(500).send({
        error: 'Something went wrong',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  fastify.get('/getfriends', async (request, reply) => {
    let decoded: JwtPayload;
    try {
      decoded = await request.jwtVerify();
      PlayerService.updateLastActivity(decoded.userkey);
    } catch (error) {
      if (Error.name === "TokenExpiredError")
        return reply.status(401).send({ error: 'Session Expired, please log in again!'});
      else
        return reply.status(401).send({ error: 'Invalid Token'});
    }
    try {
      const result = await PlayerService.getFriends(decoded.userkey);
      return reply.status(200).send(result);
    } catch (error) {
      return reply.status(500).send({
        error: 'Something went wrong',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });


  fastify.get('/createremotegame/:remote_id', async (request, reply) => {
    let decoded: JwtPayload;
    const { remote_id } = request.params as { remote_id: string };
    try {
      decoded = await request.jwtVerify();
      PlayerService.updateLastActivity(decoded.userkey);
    } catch (error) {
      if (Error.name === "TokenExpiredError")
        return reply.status(401).send({ success: false, error: 'Session Expired, please log in again!'});
      else
        return reply.status(401).send({ success: false, serror: 'Invalid Token'});
    }
    try {
      const result = await PlayerService.createRemoteGame(decoded.userkey, remote_id);
      return reply.status(200).send(result);
    } catch (error) {
      return reply.status(500).send({
        error: 'Something went wrong',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  fastify.get('/setremotegamep2/:remote_id', async (request, reply) => {
    const { remote_id } = request.params as { remote_id: string };
    //console.log("REMOTEID: " + remote_id);
    let decoded: JwtPayload;
    try {
      decoded = await request.jwtVerify();
      PlayerService.updateLastActivity(decoded.userkey);
     // console.log("USERKEY: " + decoded.userkey);
    } catch (error) {
      if (Error.name === "TokenExpiredError")
        return reply.status(401).send({ success: false, error: 'Session Expired, please log in again!'});
      else
        return reply.status(401).send({ success: false, serror: 'Invalid Token'});
    }
    try {
      const result = await PlayerService.setRemoteGameP2(decoded.userkey, remote_id);
      return reply.status(200).send(result);
    } catch (error) {
      return reply.status(500).send({
        error: 'Something went wrong',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

}