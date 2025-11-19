//import db from './initDb';
import db from './init_db';

export interface Tournament {
  id: number;
  name: string;
  max_players: number;
  current_players: number;
  status: 'waiting' | 'in_progress' | 'finished';
  created_at: string;
  winner_id?: number;
}

export interface TournamentNew {
  t_key: number;
  creator_key: number;
  name: string;
  max_player: number;
  starttime: string;
  status: string;
  result: string;
}

export interface TournamentPlayer {
  id: number;
  tournament_id: number;
  player_id: number;
  joined_at: string;
  eliminated_at?: string;
  final_rank?: number;
}

export interface TournamentMatch {
  id: number;
  tournament_id: number;
  round: number;
  player1_id: number;
  player2_id: number;
  winner_id?: number;
  game_id?: string;
  status: 'pending' | 'in_progress' | 'finished';
  created_at: string;
}

export class TournamentService {

  static createTournament(userkey: number, name: string, maxPlayers: number, starttime: string): TournamentNew | null {
    const stmt = db.prepare(`
      INSERT INTO tournaments (creator_key, name, max_player, starttime)
      VALUES (?, ?, ?, ?)
    `);
    const datetime_formatted = starttime.replace("T", " ") + ":00";
    
    try {
      const result = stmt.run(userkey, name, maxPlayers, datetime_formatted);
      const createdTournament = this.getTournamentNew(result.lastInsertRowid);
      return createdTournament;
    } catch (error) {
      console.log(error);
    }
    return null;
  }

  static getTournamentNew(id: number): TournamentNew {
    const stmt = db.prepare('SELECT * FROM tournaments WHERE t_key = ?');
    return stmt.get(id) as TournamentNew;
  }

  static createTournamentNew(userkey: number, name: string, maxPlayers: number, starttime: string): boolean {
    const stmt = db.prepare(`
      INSERT INTO tournaments (creator_key, name, max_player, starttime)
      VALUES (?, ?, ?, ?)
    `);
    
    try {
      const result = stmt.run(userkey, name, maxPlayers, starttime);
      return true;
    } catch (error) {
      console.log(error);
    }
    return false;
  }

  static getTournament(id: number): Tournament | null {
    const stmt = db.prepare('SELECT * FROM tournaments WHERE id = ?');
    return stmt.get(id) as Tournament | null;
  }

  static getAllTournaments(): (TournamentNew & { registered_players: number })[] {
    const stmt = db.prepare(`
      SELECT 
        t.*,
        COUNT(tr.user_key) AS registered_players
      FROM tournaments t
      LEFT JOIN tournament_registrations tr 
        ON t.t_key = tr.tournament_key
      GROUP BY t.t_key
      ORDER BY t.starttime ASC
    `);

    return stmt.all() as (TournamentNew & { registered_players: number })[];
  }

  static joinTournament(tournamentId: number, playerId: number): boolean {
    const tournament = this.getTournament(tournamentId);
    if (!tournament || tournament.status !== 'waiting') {
      return false;
    }

    if (tournament.current_players >= tournament.max_players) {
      return false;
    }

    try {
      const stmt = db.prepare(`
        INSERT INTO tournament_players (tournament_id, player_id)
        VALUES (?, ?)
      `);
      stmt.run(tournamentId, playerId);

      const updateStmt = db.prepare(`
        UPDATE tournaments 
        SET current_players = current_players + 1 
        WHERE id = ?
      `);
      updateStmt.run(tournamentId);

      return true;
    } catch (error) {
      return false;
    }
  }

  static registerPlayerToTournament(tournamentId: number, userId: number) : boolean {
    const stmt = db.prepare(`
      INSERT INTO tournament_registrations (tournament_key, user_key) VALUES (?, ?)
    `);

    const stmtNumberRegisteredPlayers = db.prepare(`
      SELECT *
      FROM tournament_registrations
      WHERE tournament_key = ?
      ORDER BY id DESC
    `);

    const stmtCreateMatch = db.prepare(`
      INSERT INTO games (t_key, round, match_nbr, p1_key, p2_key) VALUES (?, ?, ?, ?, ?)  
    `);

    try {
      const result = stmt.run(tournamentId, userId);
      const registrations = stmtNumberRegisteredPlayers.all(tournamentId);
      if (registrations.length % 2 == 0){
        stmtCreateMatch.run(tournamentId, 0, ((registrations.length / 2) - 1), registrations[1].user_key, registrations[0].user_key);
      }
      return true;
    } catch (error) {
      console.log(error);
    }
    return false;
  }

  static tournamentHasEmptyPlaces(tournamentId: number) : boolean {
    const maxPlayerStmt = db.prepare<{ max_player: number }>(`
      SELECT max_player
      FROM tournaments
      WHERE t_key = ?  
    `)

    const resultMaxPlayer = maxPlayerStmt.get(tournamentId);
    if (!resultMaxPlayer) {
      return false;
    }

    const registeredPlayerStmt = db.prepare<{ count: number }>(`
      SELECT COUNT(*) AS count
      FROM tournament_registrations
      WHERE tournament_key = ?
    `)
    const resultRegisteredPlayer = registeredPlayerStmt.get(tournamentId); 

    return resultRegisteredPlayer.count < resultMaxPlayer.max_player;
  }

  static isUserRegisteredToTournament(tournamentId: number, userId:number) : boolean{
    const stmt = db.prepare(`
      SELECT *
      FROM tournament_registrations
      WHERE tournament_key = ?
      AND user_key = ?
    `);

    const result = stmt.get(tournamentId, userId);
    return result !== undefined;
  }

  static getTournamentPlayers(tournamentId: number) {
    const stmt = db.prepare(`
      SELECT p.*, tp.joined_at, tp.eliminated_at, tp.final_rank
      FROM tournament_players tp
      JOIN players p ON tp.player_id = p.id
      WHERE tp.tournament_id = ?
      ORDER BY tp.joined_at
    `);
    return stmt.all(tournamentId);
  }

  static startTournament(tournamentId: number): boolean {
    const tournament = this.getTournament(tournamentId);
    if (!tournament || tournament.status !== 'waiting') {
      return false;
    }

    const players = this.getTournamentPlayers(tournamentId);
    if (players.length < 2) {
      return false;
    }

    // Generate first round matches
    this.generateMatches(tournamentId, players, 1);

    // Update tournament status
    const stmt = db.prepare(`
      UPDATE tournaments 
      SET status = 'in_progress' 
      WHERE id = ?
    `);
    stmt.run(tournamentId);

    return true;
  }

  private static generateMatches(tournamentId: number, players: any[], round: number) {
    const stmt = db.prepare(`
      INSERT INTO tournament_matches (tournament_id, round, player1_id, player2_id)
      VALUES (?, ?, ?, ?)
    `);

    const shuffled = [...players].sort(() => Math.random() - 0.5);

    for (let i = 0; i < shuffled.length; i += 2) {
      if (i + 1 < shuffled.length) {
        stmt.run(tournamentId, round, shuffled[i].id, shuffled[i + 1].id);
      }
    }
  }

  static getTournamentMatches(tournamentId: number, round?: number) {
    let query = `
      SELECT m.*, 
             p1.username as player1_name, p1.display_name as player1_display,
             p2.username as player2_name, p2.display_name as player2_display,
             winner.username as winner_name
      FROM tournament_matches m
      JOIN players p1 ON m.player1_id = p1.id
      JOIN players p2 ON m.player2_id = p2.id
      LEFT JOIN players winner ON m.winner_id = winner.id
      WHERE m.tournament_id = ?
    `;

    if (round) {
      query += ' AND m.round = ?';
    }

    query += ' ORDER BY m.round, m.id';

    const stmt = db.prepare(query);
    return round ? stmt.all(tournamentId, round) : stmt.all(tournamentId);
  }

  static updateMatchGameId(matchId: number, gameId: string): boolean {
    try {
      const stmt = db.prepare(`
        UPDATE tournament_matches 
        SET game_id = ?, status = 'in_progress' 
        WHERE id = ?
      `);
      const result = stmt.run(gameId, matchId);
      return result.changes > 0;
    } catch (error) {
      console.error('Error updating match game ID:', error);
      return false;
    }
  }

  static finishMatch(matchId: number, winnerId: number): boolean {
    try {
      const stmt = db.prepare(`
        UPDATE tournament_matches 
        SET winner_id = ?, status = 'finished' 
        WHERE id = ?
      `);
      const result = stmt.run(winnerId, matchId);
      return result.changes > 0;
    } catch (error) {
      console.error('Error finishing match:', error);
      return false;
    }
  }

  static getMatch(matchId: number) {
    const stmt = db.prepare(`
      SELECT m.*, 
             p1.username as player1_name, p1.display_name as player1_display,
             p2.username as player2_name, p2.display_name as player2_display,
             winner.username as winner_name, winner.display_name as winner_display
      FROM tournament_matches m
      JOIN players p1 ON m.player1_id = p1.id
      JOIN players p2 ON m.player2_id = p2.id
      LEFT JOIN players winner ON m.winner_id = winner.id
      WHERE m.id = ?
    `);
    return stmt.get(matchId);
  }

  static getMatchByGameId(gameId: string) {
    const stmt = db.prepare(`
      SELECT m.*, 
             p1.username as player1_name, p1.display_name as player1_display,
             p2.username as player2_name, p2.display_name as player2_display,
             winner.username as winner_name, winner.display_name as winner_display
      FROM tournament_matches m
      JOIN players p1 ON m.player1_id = p1.id
      JOIN players p2 ON m.player2_id = p2.id
      LEFT JOIN players winner ON m.winner_id = winner.id
      WHERE m.game_id = ?
    `);
    return stmt.get(gameId);
  }

  static getNextRoundMatches(tournamentId: number): any[] {
    const finishedMatches = db.prepare(`
      SELECT * FROM tournament_matches 
      WHERE tournament_id = ? AND status = 'finished'
      ORDER BY round DESC, id
    `).all(tournamentId);

    if (finishedMatches.length === 0) return [];

    const matchesByRound = finishedMatches.reduce((acc: any, match: any) => {
      if (!acc[match.round]) acc[match.round] = [];
      acc[match.round].push(match);
      return acc;
    }, {});

    const rounds = Object.keys(matchesByRound).map(Number).sort((a, b) => b - a);
    const lastRound = rounds[0];
    const lastRoundMatches = matchesByRound[lastRound];

    if (lastRoundMatches.length < 2) return [];

    const nextRound = lastRound + 1;
    const nextRoundMatches: { tournament_id: number; round: number; player1_id: number; player2_id: number }[] = [];

    for (let i = 0; i < lastRoundMatches.length; i += 2) {
      if (i + 1 < lastRoundMatches.length) {
        const match1 = lastRoundMatches[i];
        const match2 = lastRoundMatches[i + 1];
        
        if (match1.winner_id && match2.winner_id) {
          nextRoundMatches.push({
            tournament_id: tournamentId,
            round: nextRound,
            player1_id: match1.winner_id,
            player2_id: match2.winner_id
          });
        }
      }
    }

    return nextRoundMatches;
  }

  static createNextRound(tournamentId: number): boolean {
    const nextRoundMatches = this.getNextRoundMatches(tournamentId);
    
    if (nextRoundMatches.length === 0) return false;

    const stmt = db.prepare(`
      INSERT INTO tournament_matches (tournament_id, round, player1_id, player2_id)
      VALUES (?, ?, ?, ?)
    `);

    try {
      for (const match of nextRoundMatches) {
        stmt.run(match.tournament_id, match.round, match.player1_id, match.player2_id);
      }
      return true;
    } catch (error) {
      console.error('Error creating next round:', error);
      return false;
    }
  }

  static checkTournamentCompletion(tournamentId: number): boolean {
    const matches = db.prepare(`
      SELECT * FROM tournament_matches 
      WHERE tournament_id = ? AND status = 'finished'
      ORDER BY round DESC
    `).all(tournamentId);

    if (matches.length === 0) return false;

    const lastRoundMatches = matches.filter((m: any) => m.round === matches[0].round);
    
    if (lastRoundMatches.length === 1) {
      const winner = lastRoundMatches[0].winner_id;
      const stmt = db.prepare(`
        UPDATE tournaments 
        SET status = 'finished', winner_id = ? 
        WHERE id = ?
      `);
      stmt.run(winner, tournamentId);
      return true;
    }

    return false;
  }

  static getTournamentDetails(id: number){
    const tournamentStmt = db.prepare(`
      SELECT
        t.t_key,
        t.name,
        t.max_player,
        t.starttime,
        t.status,
        t.result,
        t.creator_key,
        u.display_name AS creator_displayname,
        COUNT(tr.user_key) AS registered_count
      FROM tournaments t
      LEFT JOIN users u
        ON t.creator_key = u.id
      LEFT JOIN tournament_registrations tr
        ON t.t_key = tr.tournament_key
      WHERE t.t_key = ?
      GROUP BY t.t_key
    `);

    const playersStmt = db.prepare(`
      SELECT
        u.id,
        u.username,
        u.display_name
      FROM tournament_registrations tr
      JOIN users u
        ON tr.user_key = u.id
      WHERE tr.tournament_key = ?
    `);

    const tournament = tournamentStmt.get(id);
    const players = playersStmt.all(id);
    return {
      ...tournament,
      registered_players: players,
    };
  }

  static getTournamentTreeData(tournamentKey: number){
    const stmtTournament = db.prepare(`
      SELECT max_player FROM tournaments WHERE t_key = ?
    `);
    const tournament = stmtTournament.get(tournamentKey);
    const maxPlayers = tournament?.max_player ?? 4;

    const stmtGames = db.prepare(`
      SELECT 
        g.round,
        g.match_nbr,
        g.p1_points,
        g.p2_points,
        u1.display_name AS p1_name,
        u2.display_name AS p2_name
      FROM games g
      LEFT JOIN users u1 ON g.p1_key = u1.id
      LEFT JOIN users u2 ON g.p2_key = u2.id
      WHERE g.t_key = ?
      ORDER BY g.round ASC, g.match_nbr ASC
    `);
    const playedGames = stmtGames.all(tournamentKey);

    const stmtPlayers = db.prepare(`
      SELECT u.display_name
      FROM tournament_registrations r
      LEFT JOIN users u ON r.user_key = u.id
      WHERE r.tournament_key = ?
      ORDER BY r.id ASC
    `);
    const registeredPlayers = stmtPlayers.all(tournamentKey).map(p => p.display_name);

    const totalRounds = Math.log2(maxPlayers);
    const rounds = Array.from({length: totalRounds}, (_, i) => ({ name: `Round ${i + 1}` }));

    const matches: any[] = [];
    for (let round = 0; round < totalRounds; round++) {
      const matchesInRound = Math.pow(2, totalRounds - round - 1);

      for (let matchNbr = 0; matchNbr < matchesInRound; matchNbr++) {
        let sides;
        if (round === 0) {
          const idx1 = matchNbr * 2;
          const idx2 = matchNbr * 2 + 1;
          sides = [
            {
              title: registeredPlayers[idx1] || "TBD",
              scores: [{ mainScore: 0 }]
            },
            {
              title: registeredPlayers[idx2] || "TBD",
              scores: [{ mainScore: 0 }]
            }
          ];
        } else {
          sides = [
            { title: "TBD", scores: [{ mainScore: 0 }] },
            { title: "TBD", scores: [{ mainScore: 0 }] }
          ];
        }

        const playedMatch = playedGames.find(g => g.round === round && g.match_nbr === matchNbr);
        if (playedMatch) {
          sides = [
            { title: playedMatch.p1_name || "TBD", scores: [{ mainScore: playedMatch.p1_points ?? 0 }] },
            { title: playedMatch.p2_name || "TBD", scores: [{ mainScore: playedMatch.p2_points ?? 0 }] }
          ];
        }

        matches.push({
          id: `r${round}m${matchNbr}`,
          roundIndex: round,
          order: matchNbr,
          sides
        });
      }
    }

    return { rounds, matches };
  }

  static startTournamentGame(u_id: number, g_id: number){
    const stmtGameData = db.prepare(`
      SELECT 
        g.*,
        u1.display_name AS p1_display_name,
        u1.avatar_url   AS p1_avatar_url,
        u2.display_name AS p2_display_name,
        u2.avatar_url   AS p2_avatar_url
      FROM games g
      LEFT JOIN users u1 ON g.p1_key = u1.id
      LEFT JOIN users u2 ON g.p2_key = u2.id
      WHERE g.g_id = ?
    `);

    const game = stmtGameData.get(g_id);
    if (game.p1_key != u_id && game.p2_key != u_id){
      return {
        success: false,
        msg: "User id is not matching!"
      }
    }
    return {
      success: true,
      g_id: g_id,
      p1_name: game.p1_display_name,
      p2_name: game.p2_display_name,
      p1_avatar: game.p1_avatar_url,
      p2_avatar: game.p2_avatar_url,
    }
  }

  static finishTournamentGame(g_id: number, p1_score: number, p2_score: number) {
    const stmtGetGameData = db.prepare(`
      SELECT *
      FROM games
      WHERE g_id = ?
    `);

    const stmtUpdateGame = db.prepare(`
      UPDATE games
      SET 
        p1_points = ?,
        p2_points = ?,
        winner = CASE
          WHEN ? > ? THEN p1_key
          WHEN ? < ? THEN p2_key
          ELSE NULL
        END
      WHERE g_id = ?
    `);

    const stmtGetTournamentData = db.prepare(`
      SELECT *
      FROM tournaments
      WHERE t_key = ?
    `);

    const stmtGetNextGame = db.prepare(`
      SELECT *
      FROM games
      WHERE t_key = ? AND round = ? AND match_nbr = ?
    `);

    const stmtCreateNextGame = db.prepare(`
      INSERT INTO games (t_key, round, match_nbr, p1_key, p2_key)
      VALUES (?, ?, ?, ?, ?)
    `);

    const stmtUpdateNextGame = db.prepare(`
      UPDATE games
      SET p1_key = COALESCE(p1_key, ?),
          p2_key = CASE WHEN p1_key IS NOT NULL THEN ? ELSE p2_key END
      WHERE g_id = ?
    `);

    const stmtSetWinnerTournament = db.prepare(`
      UPDATE tournaments
      SET winner = ?, status = ?
      WHERE t_key = ?
    `);

    const stmtSetRankpoints = db.prepare(`
      INSERT INTO rankpoints (u_id, g_id, value)
      VALUES (?, ?, ?)
    `);

    const stmtUpdateRankpoints = db.prepare(`
      UPDATE users
      SET rank_points = rank_points + ?
      WHERE id = ?
    `);

    try {
      stmtUpdateGame.run(p1_score, p2_score, p1_score, p2_score, p1_score, p2_score, g_id);

      const game = stmtGetGameData.get(g_id);
      if (!game || !game.t_key) return { success: false, msg: "No tournament game" };

      const tournament = stmtGetTournamentData.get(game.t_key);
      if (!tournament) return { success: false, msg: "Tournament not found" };

      const maxPlayers = Number(tournament.max_player);
      const totalRounds = Math.log2(maxPlayers);
      const currentRound = Number(game.round);
      const matchNbr = Number(game.match_nbr);

      if (game.winner == game.p1_key) {
        stmtSetRankpoints.run(game.p1_key, game.g_id, 2);
        stmtSetRankpoints.run(game.p2_key, game.g_id, -2);
        stmtUpdateRankpoints.run(2, game.p1_key);
        stmtUpdateRankpoints.run(-2, game.p2_key);
      } else {
        stmtSetRankpoints.run(game.p2_key, game.g_id, 2);
        stmtSetRankpoints.run(game.p1_key, game.g_id, -2);
        stmtUpdateRankpoints.run(-2, game.p1_key);
        stmtUpdateRankpoints.run(2, game.p2_key);
      }

      if (currentRound >= totalRounds - 1) {
        stmtSetWinnerTournament.run(game.winner, "finished", tournament.t_key);
        stmtSetRankpoints.run(game.winner, game.g_id, 10);
        return { success: true, msg: "Tournament finished" };
      }

      const nextRound = currentRound + 1;
      const nextMatchNbr = Math.floor(matchNbr / 2);

      const nextGame = stmtGetNextGame.get(tournament.t_key, nextRound, nextMatchNbr);

      if (nextGame) {
        stmtUpdateNextGame.run(game.winner, game.winner, nextGame.g_id);
      } else {
        stmtCreateNextGame.run(tournament.t_key, nextRound, nextMatchNbr, game.winner, null);
      }

      return { success: true };

    } catch (error) {
      console.error("finishTournamentGame error:", error);
      return { success: false, msg: error };
    }
  }

}