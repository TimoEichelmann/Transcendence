import { FastifyInstance } from 'fastify';
import { JwtPayload, PlayerService } from '../db/playerService';
import { TournamentService } from '../db/tournamentService';
import { createGame, startGame } from '../../game/pong/utils/gameManager';
import { request } from 'http';
// import { request } from 'http'; // <- here

export default async function tournamentRoutes(fastify: FastifyInstance) {
  // Create a new tournament
  fastify.post<{
      Body: { jwt: String, tournamentName: string, maxPlayer: number, tournamentStart: string }
    }>('/create', async (request, reply) => {
    try {
      const name = request.body.tournamentName;
      const maxPlayers = request.body.maxPlayer;
      const starttime = request.body.tournamentStart;
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

      if (!name) {
        return reply.status(400).send({
          error: 'Tournament name is required'
        });
      }

      if (!starttime) {
        return reply.status(400).send({
          error: 'Tournament start time is required'
        });
      }

      const tournament = TournamentService.createTournament(decoded.userkey, name, maxPlayers, starttime);
      
      return reply.status(201).send({
        success: true,
        data: tournament
      });
    } catch (error) {
      return reply.status(500).send({
        error: 'Failed to create tournament',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  fastify.post<{
    Body: { jwt: String, tournamentName: string, maxPlayer: number, tournamentStart: string }
  }>('/createnew', async (request, reply) => {
    try {
      const name = request.body.tournamentName;
      const maxPlayers = request.body.maxPlayer;
      const starttime = request.body.tournamentStart;

      let decoded: JwtPayload;
      try {
        decoded = await request.jwtVerify();
        PlayerService.updateLastActivity(decoded.userkey);
      } catch (error) {
        return reply.status(400).send({
          error: 'You are not logged in!'
        });
      }

      if (!name) {
        return reply.status(400).send({
          error: 'Tournament name is required'
        });
      }

      if (!starttime) {
        return reply.status(400).send({
          error: 'Tournament start time is required'
        });
      }

      const res = TournamentService.createTournamentNew(decoded.userkey, name, maxPlayers, starttime);
      if (res)
      {
        return reply.status(201).send({
          success: true,
        });
      }
      else{
        return reply.status(500).send({
          error: 'Failed to create tournament',
        });
      }
    } catch (error) {
      console.log(error);
      return reply.status(500).send({
        error: 'Failed to create tournament222',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Create tournament with random players from database
  fastify.post('/create-with-random-players', async (request, reply) => {
    try {
      const { name, playerCount } = request.body as {
        name: string;
        playerCount?: number;
      };

      if (!name) {
        return reply.status(400).send({
          error: 'Tournament name is required'
        });
      }

      const maxPlayers = playerCount || 8;
      
      // Get all players from database
      const allPlayers = PlayerService.getAllPlayers();
      
      if (allPlayers.length < 2) {
        return reply.status(400).send({
          error: 'Not enough players in database. Need at least 2 players.'
        });
      }

      // Create tournament
      const tournament = TournamentService.createTournament(name, maxPlayers);
      
      // Randomly select players (up to maxPlayers or all available)
      const selectedPlayers = allPlayers
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(maxPlayers, allPlayers.length));

      // Add players to tournament
      for (const player of selectedPlayers) {
        TournamentService.joinTournament(tournament.id, player.id);
      }

      // Get updated tournament with players
      const updatedTournament = TournamentService.getTournament(tournament.id);
      const tournamentPlayers = TournamentService.getTournamentPlayers(tournament.id);

      return reply.status(201).send({
        success: true,
        data: {
          tournament: updatedTournament,
          players: tournamentPlayers
        }
      });
    } catch (error) {
      return reply.status(500).send({
        error: 'Failed to create tournament with random players',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Join tournament
  fastify.post('/join', async (request, reply) => {
    try {
      const { tournament_id, player_id } = request.body as {
        tournament_id: number;
        player_id: number;
      };

      const success = TournamentService.joinTournament(tournament_id, player_id);
      
      if (!success) {
        return reply.status(400).send({
          error: 'Failed to join tournament. Tournament may be full or not accepting players.'
        });
      }

      return reply.send({
        success: true,
        message: 'Successfully joined tournament'
      });
    } catch (error) {
      return reply.status(500).send({
        error: 'Failed to join tournament',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // register (new join) tournament
  fastify.post<{ Body: { t_id: number } }>('/register', async (request, reply) => {
      let decoded: JwtPayload;

      // logged in?
      try {
        decoded = await request.jwtVerify();
        PlayerService.updateLastActivity(decoded.userkey);
      } catch (error) {
      if (Error.name === "TokenExpiredError")
        return reply.status(401).send({ error: 'Session Expired, please log in again!'});
      else
        return reply.status(401).send({ error: 'Invalid Token'});
    }
      // user is not registered to the tournament?
      if (TournamentService.isUserRegisteredToTournament(request.body.t_id, decoded.userkey)) {
        return reply.status(400).send({
          error: 'You are already registered to the tournamnt!'
        });
      }

      // tournament has still places?
      if (!TournamentService.tournamentHasEmptyPlaces(request.body.t_id)) {
        return reply.status(400).send({
          error: 'No free spots in Tournament!'
        });
      }

      // register
      if (TournamentService.registerPlayerToTournament(request.body.t_id, decoded.userkey)) {
        return reply.status(200).send({
          msg: 'Successfully registered to tournamnet'
        });
      }
      else{
        return reply.status(500).send({
          error: 'Something went horribly wrong!'
        });
      }
  });

  // Start tournament
  fastify.post('/start', async (request, reply) => {
    try {
      const { tournament_id } = request.body as { tournament_id: number };

      const success = TournamentService.startTournament(tournament_id);
      
      if (!success) {
        return reply.status(400).send({
          error: 'Failed to start tournament. Need at least 2 players.'
        });
      }

      // Get first round matches
      const matches = TournamentService.getTournamentMatches(tournament_id, 1);
      
      // Create games for each match
      for (const match of matches) {
        const game = createGame(match.player1_name, match.player2_name);
        
        // Update match with game ID
        // You'll need to add this method to TournamentService
        // TournamentService.updateMatchGameId(match.id, game.id);
      }

      return reply.send({
        success: true,
        message: 'Tournament started successfully',
        matches: matches
      });
    } catch (error) {
      return reply.status(500).send({
        error: 'Failed to start tournament',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get tournament details
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const tournament = TournamentService.getTournament(parseInt(id));
      
      if (!tournament) {
        return reply.status(404).send({
          error: 'Tournament not found'
        });
      }

      const players = TournamentService.getTournamentPlayers(parseInt(id));
      const matches = TournamentService.getTournamentMatches(parseInt(id));

      return reply.send({
        success: true,
        data: {
          tournament,
          players,
          matches
        }
      });
    } catch (error) {
      return reply.status(500).send({
        error: 'Failed to fetch tournament',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // List all tournaments
  fastify.get('/list', async (request, reply) => {
    try {
      const tournaments = TournamentService.getAllTournaments();
      
      return reply.send({
        success: true,
        data: tournaments
      });
    } catch (error) {
      console.log(error);
      return reply.status(500).send({
        error: 'Failed to fetch tournaments',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  fastify.get('/infolist', async (request, reply) => {
    try {
      const tournaments = TournamentService.getAllTournaments();
      return reply.send({
        success: true,
        data: tournaments
      });
    } catch (error) {
      return reply.status(500).send({
        error: 'Failed to fetch tournaments',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  fastify.post<{ Body: { id: number } }>('/tournamenttree', async (request, reply) => {
    const data = TournamentService.getTournamentTreeData(request.body.id);
    return reply.status(200).send({
      success: true,
      data: data
    });
  });

  fastify.post<{ Body: { id: number } }>('/tournamentdetails', async (request, reply) => {
    try {
      const tournamentdetails = TournamentService.getTournamentDetails(request.body.id);
      return reply.status(200).send({
        success: true,
        tournament: tournamentdetails
      });
    } catch (error) {
      return reply.status(500).send({
        success: false,
        error: error
      });
    }
  });

  fastify.get('/starttournamentgame/:g_id', async (request, reply) => {
    const { g_id } = request.params as { g_id: number };
    let decoded: JwtPayload;
    try {
      decoded = await request.jwtVerify();
      PlayerService.updateLastActivity(decoded.userkey);
    } catch (error) {
      if (Error.name === "TokenExpiredError")
        return reply.status(401).send({ success: false, error: 'Session Expired, please log in again!'});
      else
      {
        console.log(error);
        return reply.status(401).send({ success: false, serror: 'Invalid Token'});
      
      }
      }
    try {
      const result = TournamentService.startTournamentGame(decoded.userkey, g_id);
      return reply.send(result);
    } catch (error) {
      return reply.status(500).send({
        success: false,
        error: 'You doin shit, no joke!!!',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  fastify.post<{ Body: { g_id: number, p1_score: number, p2_score: number } }>('/finishtournamentgame', async (request, reply) => {
    let decoded: JwtPayload;
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
      const res = TournamentService.finishTournamentGame(request.body.g_id, request.body.p1_score, request.body.p2_score);
      return (res);
    } catch (error) {
      return {
        success: false,
        msg: error
      }
    }
  });
}