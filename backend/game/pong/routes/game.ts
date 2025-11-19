import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createGame, updateStatus, getGame, movePaddle, getAllGames, removeGame } from '../utils/gameManager';
import { broadcastPongGameState } from '../websocket/gameSocket';

interface CreateGameRequest {
  player1: string;
  player2: string;
}

interface MoveRequest {
  gameId: string;
  player: 'player1' | 'player2';
  direction: 'up' | 'down';
}

interface Avatars {
  gameId: string;
  player: 'player1' | 'player2';
  src: string;
}

export const gameAvatars = new Map<string, { player1?: string, player2?: string, player1alias?:string, player2alias?:string}>();

async function gameRoutes(fastify: FastifyInstance, gameConnections: Map<string, Set<any>>) {
  // Create a new game
  fastify.post<{ Body: CreateGameRequest }>('/create', async (request, reply) => {
    const { player1, mode, player2, difficulty} = request.body as {
      player1: string;
      mode: "ai" | "local" | "remote";
      difficulty?: "medium" | "easy" | "hard" | undefined;
      player2?: string;
    };
    
    if (!player1) {
      return reply.status(400).send({ error: 'Both player1 and player2 are required' });
    }

    if (mode === 'ai')
    {
      const game = createGame(player1, player2, mode, difficulty || 'medium');
      return reply.send({
        gameId: game.id,
        message: 'AI game created successfully',
        aiDifficulty: difficulty || 'medium'
      });
    }
    
    const game = createGame(player1, player2, mode);
    return { gameId: game.id, message: 'Game created successfully' };
  });

  fastify.post<{Body: Avatars}>('/avatar', async (request, reply) => {
    const {gameId, player, src, playerName} = request.body as {
        gameId: string;
        player: string;
        src: string;
        playerName: string;
      };

    if (!gameAvatars.has(gameId))
        gameAvatars.set(gameId, {});

    const avatars = gameAvatars.get(gameId);
    if (player === 'player1')
    {
      avatars.player1 = src;
      if (playerName)
        avatars.player1alias = playerName;
      else
        avatars.player1alias = "Player 1";
    }
      else
    {
      avatars.player2 = src;
      if (playerName)
        avatars.player2alias = playerName;
      else  
        avatars.player2alias = "Player 2";
    }
    reply.send( {ok: true});
  });

  // // Add AI game creation endpoint
  // fastify.post('/create-ai', async (request, reply) => {
  //   const { player1, difficulty } = request.body as { 
  //     player1: string; 
  //     difficulty?: 'easy' | 'medium' | 'hard'
  //   };

  //   if (!player1) {
  //     return reply.status(400).send({ error: 'Player1 name is required' });
  //   }

   
    

  // });

  // Get game state
  // fastify.get<{ Params: { gameId: string } }>('/state/:gameId', async (request, reply) => {
  //   const { gameId } = request.params;
  //   const game = getGame(gameId);
    
  //   if (!game) {
  //     return reply.status(404).send({ error: 'Game not found' });
  //   }
    
  //   return game;
  // });

//   // Start a game
//   fastify.post<{ Body: { gameId: string } }>('/start', async (request, reply) => {
//     const { gameId } = request.body;
//     const success = startGame(gameId);
    
//     if (!success) {
//       return reply.status(400).send({ error: 'Could not start game' });
//     }
    
//     return { message: 'Game started successfully' };
//   });

//   // Move paddle
//   fastify.post<{ Body: MoveRequest }>('/move', async (request, reply) => {
//     const { gameId, player, direction } = request.body;
//     const game = getGame(gameId);
    
//     if (!game) {
//       return reply.status(404).send({ error: 'Game not found' });
//     }
    
//     if (player === 'player1') {
//       game.player1.move(direction);
//     } else {
//       game.player2.move(direction);
//     }
    
//     return { message: ' moved successfully' };
//   });

//   // Update game (simulate one frame)
//   fastify.post<{ Body: { gameId: string } }>('/update', async (request, reply) => {
//     const { gameId } = request.body;
//     const game = getGame(gameId);
    
//     if (!game) {
//       return reply.status(404).send({ error: 'Game not found' });
//     }
    
//     updateStatus(game);
//     return { message: 'Game updated successfully', state: game };
//   });
//   // list all active games
//   fastify.get('/list', async (request, reply) => {
//     const games = getAllGames();
//     return { games };
//   });
  
//   // Remove a game
//   fastify.delete<{ Params: { gameId: string } }>('/remove/:gameId', async (request, reply) => {
//     const { gameId } = request.params;
//     const success = removeGame(gameId); 
  
//     if (!success) {
//       return reply.status(404).send({ error: 'Game not found' });
//     }
//     return { message: 'Game removed successfully' };
//   });

//   fastify.post<{ Body: { player1: string } }>('/create-room', async (request, reply) => {
//   const { player1 } = request.body;
//   if (!player1) return reply.status(400).send({ error: 'player1 required' });

//   const game = createGame(player1, undefined); // player2 undefined
//   game.state = 'waiting'; // mark as waiting for second player

//   return { gameId: game.id, message: 'Game room created. Waiting for another player...' };
// });

// // Join an existing room
// fastify.post<{ Body: { player2: string; gameId: string } }>('/join-room', async (request, reply) => {
//   const { player2, gameId } = request.body;
//   const game = getGame(gameId);

//   if (!game) return reply.status(404).send({ error: 'Game not found' });
//   if (game.player2) return reply.status(400).send({ error: 'Room already full' });

//   game.player2 = { alias: player2, paddle: 50, score: 0 }; // initialize player2
//   game.state = 'ready'; // ready to start

//   return { message: 'Joined game successfully', gameId };
// });
}




export default gameRoutes;
			
