import { FastifyInstance } from 'fastify';
import { getAllGames, getGame, updateStatus, removeGame } from '../utils/gameManager';

export function setupPongWebSocket(fastify: FastifyInstance, gameConnections: Map<string, Set<any>>) {
  // WebSocket for real-time pong game updates
  fastify.get('/pong/ws/:gameId', { websocket: true }, (connection, req) => {
    const gameId = req.params.gameId;
    const game = getGame(gameId);

    if (!game) {
      connection.socket.close();
      return;
    }

    if (!gameConnections.has(gameId)) {
      gameConnections.set(gameId, new Set());
    }
    const conns = gameConnections.get(gameId)!;
    conns.add(connection);

    if (((conns.size > 2 && game.mode === 'remote') || (conns.size >= 2 && game.mode === 'ai')) || (game.mode === 'local' && conns.size > 1)) //check for ai and remote
    {
      console.log("Rejected full game room");
      connection.socket.send(JSON.stringify({ error: "Game already full"}));
      connection.socket.close();
      return;
    } // Voller Gamreoom
    if (game.state === 'waiting' && conns.size === 2)
    {
      game.start();
      console.log("2nd player connected");
    }
    if (game && game.state === 'playing') {
      console.log("sent intial", gameId);
      broadcastPongGameState(gameId, game, gameConnections);
    }
    // Handle incoming messages from client
    connection.on('message', (message) => {
      const data = JSON.parse(message.toString());

      if (data.type === 'move') {
        const game = getGame(gameId);
        if (game) {
          if (data.player === 'player1') game.player1.move(data.direction);
          else game.player2.move(data.direction);
          
          // Broadcast updated game state after move
          broadcastPongGameState(gameId, game, gameConnections);
        }
      }

    });
        
    // Remove connection when client disconnects
    connection.on('close', () => {
      const connections = gameConnections.get(gameId);
      if (connections) {
        if (connections.size === 2)
        {
          console.log("one player left, ending");
          const game = getGame(gameId)!;
          if (game.state === 'playing')
            game.state = 'connection_lost';
          connections.forEach(ws => {
            ws.send(JSON.stringify({type: "game_state", state: game.state}));
            console.log("sent final game state as: ",game.state);
          })
          // gameConnections.delete(gameId);
          // removeGame(gameId);
        }
        // connections.delete(connection);
        if (connections.size === 0) {
          console.log("no player left, ending");
          gameConnections.delete(gameId);
          removeGame(gameId);
        }
      }
      console.log(`Player disconnected from pong game ${gameId}`);
    });
  });
}

export function broadcastPongGameState(gameId: string, game: any, gameConnections: Map<string, Set<any>>) {
  const connections = gameConnections.get(gameId);
  if (!connections || connections.size === 0) return;

  // if (game.state === 'player2_wins')
  //   console.log("Sent final message with: ", game.state);
  const gameState = {
    type: 'game_state',
    gameId: gameId,
    ball: {
      x: game.ball.x,
      y: game.ball.y,
      isCountingDown: game.ball.isCountingDown,
      countdownTime: game.ball.countdownTime,
      side: game.ball.side
    },
    player1: {
      alias: game.player1.alias,
      paddle: game.player1.paddle,
      score: game.player1.score,
      paddleLen: game.player1.paddleLen
    },
    player2: {
      alias: game.player2.alias,
      paddle: game.player2.paddle,
      paddleLen: game.player2.paddleLen,
      score: game.player2.score
    },
    state: game.state
  };

  connections.forEach(connection => {
    try {
      connection.send(JSON.stringify(gameState));
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
    }
  });
}