import { FastifyInstance } from 'fastify';
import pongRoutes from './pong/routes/game';
import { setupPongWebSocket } from './pong/websocket/gameSocket';

export async function registerGameRoutes(fastify: FastifyInstance, gameConnections: Map<string, Set<any>>) {
  // Register pong game routes under /game/pong
fastify.register((instance: any) => pongRoutes(instance, gameConnections), { prefix: '/pong' });
  // Setup pong WebSocket
  setupPongWebSocket(fastify, gameConnections);

  
  // Future: Add other games here
  // fastify.register(tetrisRoutes, { prefix: '/tetris' });
}