import { GameState, Player, Ball } from '../models/class';
import { FastifyInstance } from 'fastify';
import { AiPlayer } from '../ai/aiPlayer';
import { broadcastPongGameState } from '../websocket/gameSocket';

const games = new Map<string, GameState>();

function generateDigitId()
{
  const timestamp = Date.now();
  const numerciPart = timestamp % (10 ** 4);
  return (numerciPart.toString().padStart(4, '0'));
}

export function createGame(player1: string, player2: string | undefined, mode: 'local' | 'ai' | 'remote', /*tabelGameId: string | null,*/ aiDifficulty?: 'easy' | 'medium' | 'hard'): GameState {
  const gameId = `game_${generateDigitId()}`;
  
  // if (!tabelGameId)
  // {
  //     //Backend Call
  // }
  // Configure paddle speeds (you can adjust these values)
  const PLAYER_PADDLE_SPEED = 4;  // Normal player speed
  const AI_PADDLE_SPEED = 2.0;      // AI paddle speed (slightly slower)
  
  const p1 = new Player(player1, PLAYER_PADDLE_SPEED);
  
  // If no player2 provided, create AI opponent
  let p2: Player;
  let aiPlayer: AiPlayer | null = null;
  
  if (mode === 'ai') {
    p2 = new Player('AI Opponent', AI_PADDLE_SPEED);
    aiPlayer = new AiPlayer(aiDifficulty || 'easy');
  } else {
    p2 = new Player(player2, PLAYER_PADDLE_SPEED);
  }
  
  const game = new GameState(gameId, p1, p2, mode);
  // Store AI reference if this is an AI game
  if (aiPlayer) {
    (game as any).aiPlayer = aiPlayer;
    (game as any).isAiGame = true;
  }

  if (mode === 'local' || mode === 'ai')
    game.start();
  games.set(gameId, game);
  return game;
}

export function getGame(gameId: string): GameState | undefined {
	return games.get(gameId);
}




export function movePaddle(gameId: string, player: 'player1' | 'player2', direction: 'up' | 'down'): boolean {
	const game = games.get(gameId);
	if (!game) return false;
	
	if (player === 'player1') {
		game.player1.move(direction);
	} else {
		game.player2.move(direction);
	}
	
	return true;
}

export function updateStatus(game: GameState) {
  if (game.state !== 'playing') return;

  // Update countdown timer
  game.ball.updateCountdown();

  // Handle AI movement if this is an AI game
  if ((game as any).isAiGame && (game as any).aiPlayer) {
    const aiPlayer = (game as any).aiPlayer as AiPlayer;
    
    // NEW AI METHOD: Get keyboard input simulation
    const aiInput = aiPlayer.getKeyboardInput(game);
    
    if (aiInput) {
      game.player2.move(aiInput);
    }
  }

  // Existing game physics
  game.ball.move();
  game.bounceWall();
  game.bouncePaddle();
  game.reachEnd();
}

export function getAllGames(): GameState[] {
	return Array.from(games.values());
}

export function removeGame(gameId: string): boolean {
	return games.delete(gameId);
}

