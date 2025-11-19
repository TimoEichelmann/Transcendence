import { FastifyInstance } from 'fastify';
import db from './init_db';
import bcrypt from 'bcrypt';

export interface Player {
  id?: number;
  username: string;
  password: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  wins?: number;
  losses?: number;
  rank_points?: number;
  twofa_secret?: string;
  created_at?: string;
  updated_at?: string;
}

export interface JwtPayload {
	userkey: number;
	username: string;
	display_name: string;
}

export class PlayerService {

	static async createPlayer(player: Omit<Player, 'id'>): Promise<Player> {
		const hashedPassword = await bcrypt.hash(player.password, 10);
		const stmt = db.prepare(`
			INSERT INTO users (username, password, email, display_name, avatar_url, wins, losses, rank_points, twofa_secret)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
		`);

		const result = stmt.run(
			player.username,
			hashedPassword,
			player.email,
			player.display_name,
			player.avatar_url || "/profile-images/default.jpg",
			player.wins || 0,
			player.losses || 0,
			player.rank_points || 1000,
      		player.twofa_secret || null
		);
		return this.getPlayerById(result.lastInsertRowid as number)!;
	}

	static async verifyPassword(user: Player, password: string): Promise<boolean> {
		return bcrypt.compare(password, user.password);
	}

	static async loginUser(
		{ username, password }: { username: string; password: string },
		fastify: FastifyInstance
	): Promise<{ jwtToken: string }> {
		const userJWT = this.getPlayerByUsername(username);

		if (!userJWT) {
			return ({jwtToken: ""});

		const ok = await bcrypt.compare(password, userJWT.password);
    	if (!ok)
			return { jwtToken: "" };
		}
		const jwtToken = fastify.jwt.sign({ userkey: userJWT.id ,username: userJWT.username, display_name: userJWT.display_name }, { expiresIn: '8h' });
		return ({jwtToken: jwtToken});
	}

	static getPlayerById(id: number): Player | null {
		const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
		return stmt.get(id) as Player | null;
	}

	static getPlayerByUsername(username: string): Player | null {
		const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
		return stmt.get(username) as Player | null;
	}

	static getPlayerByEmail(email: string): Player | null {
		const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
		return stmt.get(email) as Player | null;
	}

	static getAllPlayers(): Player[] {
		const stmt = db.prepare('SELECT * FROM users ORDER BY rank_points DESC');
		return stmt.all() as Player[];
	}

	static updatePlayerStats(playerId: number, wins: number, losses: number, rankPoints: number): boolean {
		const stmt = db.prepare(`
			UPDATE users
			SET wins = wins + ?, losses = losses + ?, rank_points = ?, updated_at = CURRENT_TIMESTAMP
			WHERE id = ?
		`);

		const result = stmt.run(wins, losses, rankPoints, playerId);
		return result.changes > 0;
	}

	static deletePlayer(id: number): boolean {
		const stmt = db.prepare('DELETE FROM users WHERE id = ?');
		const result = stmt.run(id);
		return result.changes > 0;
	}

	static updateProfileImage(id: number, link: string): boolean {
		const stmt = db.prepare(`
			UPDATE users
			SET avatar_url = ?
			WHERE id = ?
		`)
		const result = stmt.run(link, id);
		if (result.changes > 0){
			return true;
		}
		return false;
	}

	static updateUsername(id: number, username: string): boolean {
		const stmt = db.prepare(`
			UPDATE users
			SET username = ?
			WHERE id = ?
		`)
		const result = stmt.run(username, id);
		if (result.changes > 0){
			return true;
		}
		return false;
	}

	static updateDisplayname(id: number, displayname: string): boolean {
		const stmt = db.prepare(`
			UPDATE users
			SET display_name = ?
			WHERE id = ?
		`)
		const result = stmt.run(displayname, id);
		if (result.changes > 0){
			return true;
		}
		return false;
	}

	static updateEmail(id: number, email: string): boolean {
		const stmt = db.prepare(`
			UPDATE users
			SET email = ?
			WHERE id = ?
		`)
		const result = stmt.run(email, id);
		if (result.changes > 0){
			return true;
		}
		return false;
	}

	static async updatePassword(id: number, password: string): Promise<boolean> {
		const stmt = db.prepare(`
			UPDATE users
			SET password = ?
			WHERE id = ?
		`)
		const hashedPassword = await bcrypt.hash(password, 10);
		const result = stmt.run(hashedPassword, id);
		if (result.changes > 0){
			return true;
		}
		return false;
	}

	static async deleteUser(id: number): Promise<boolean> {
		const stmt = db.prepare(`
			UPDATE users
			SET password = ?, display_name = ?, avatar_url = ?
			WHERE id = ?
		`)
		const result = stmt.run("", "DeletedUser", "", id);
		if (result.changes > 0){
			return true;
		}
		return false;
	}

	static async checkPass(username: string, password: string): Promise<boolean>{
		const userJWT = this.getPlayerByUsername(username);
		if (!userJWT) {
			return false;
		}
		else if(await bcrypt.compare(password, userJWT.password) == true){
			return true;
		}
		return false;
	}

	static getPlayerStats(userId: number){
		const stmtTotalGames = db.prepare(`
			SELECT COUNT(*) AS total_games
			FROM games
			WHERE (p1_key = ? OR p2_key = ?)
			AND winner IS NOT NULL;
		`);

		const stmtWonGames = db.prepare(`
			SELECT COUNT(*) AS won_games
			FROM games
			WHERE (p1_key = ? OR p2_key = ?)
			AND winner = ?;
		`);

		const stmtProfileInfo = db.prepare(`
			SELECT avatar_url, display_name, created_at
			FROM users
			WHERE id = ?
		`);

		const stmtTotalTournaments = db.prepare(`
			SELECT COUNT(*) AS total
			FROM tournament_registrations tr
			JOIN tournaments t ON tr.tournament_key = t.t_key
			WHERE tr.user_key = ?
			AND t.winner IS NOT NULL
		`);

		const stmtWonTournaments = db.prepare(`
			SELECT COUNT(*) AS total
			FROM tournaments
			WHERE winner = ?
		`)

		const stmtRankHistory = db.prepare(`
			SELECT date, value
			FROM rankpoints
			WHERE u_id = ?
			ORDER BY date ASC, id ASC
		`);

		const stmtGames = db.prepare(`
			SELECT
				g.*,
				t.name AS tournament_name,
				u1.display_name AS p1_name,
				u2.display_name AS p2_name
			FROM games g
			LEFT JOIN tournaments t ON g.t_key = t.t_key
			LEFT JOIN users u1 ON g.p1_key = u1.id
			LEFT JOIN users u2 ON g.p2_key = u2.id
			WHERE g.p1_key = ? OR g.p2_key = ?
			ORDER BY g.game_date DESC
		`);
				
		const resTotalGames = stmtTotalGames.get(userId, userId);
		const resWonGames = stmtWonGames.get(userId, userId, userId);
		const resProfileInfo = stmtProfileInfo.get(userId);
		const resTotalTournaments = stmtTotalTournaments.get(userId);
		const resWonTournaments = stmtWonTournaments.get(userId);
		const resRankHistory = stmtRankHistory.all(userId);
		const resGames = stmtGames.all(userId, userId);

		const rankLabels: string[] = [];
  		const rankData: number[] = [];

		let currentPoints = 1000;

		if (resProfileInfo?.created_at) {
			rankLabels.push(resProfileInfo.created_at.split(" ")[0]);
			rankData.push(currentPoints);
		}

		for (const entry of resRankHistory) {
			currentPoints += entry.value;
			rankLabels.push(entry.date);
			rankData.push(currentPoints);
		}

		return {
			totalGames: resTotalGames.total_games,
			wonGames: resWonGames.won_games,
			displayName: resProfileInfo.display_name,
			image: resProfileInfo.avatar_url,
			totalTournaments: resTotalTournaments.total,
			wonTournaments: resWonTournaments.total,
			rankLabels: rankLabels,
			rankData: rankData,
			games: resGames
		};
	}

	static getGameStats(userId: number, gameId:number){
		const stmtGame = db.prepare(`
			SELECT 
				g.*,
				t.name AS tournament_name,
				u1.display_name AS p1_display_name,
				u2.display_name AS p2_display_name,
				u1.avatar_url AS p1_avatar,
				u2.avatar_url AS p2_avatar
			FROM games g
			LEFT JOIN tournaments t ON g.t_key = t.t_key
			LEFT JOIN users u1 ON g.p1_key = u1.id
			LEFT JOIN users u2 ON g.p2_key = u2.id
			WHERE g.g_id = ?
		`);

		const stmtPreviousGames = db.prepare(`
			SELECT 
				g1.p1_key,
				g1.p2_key,
				g1.game_date,

				(
					SELECT COUNT(*)
					FROM games g2
					WHERE (g2.p1_key = g1.p1_key OR g2.p2_key = g1.p1_key)
					AND g2.winner IS NOT NULL
					AND g2.game_date < g1.game_date
				) AS p1_total_before,

				(
					SELECT COUNT(*)
					FROM games g2
					WHERE g2.winner = g1.p1_key
					AND g2.game_date < g1.game_date
				) AS p1_wins_before,

				(
					SELECT COUNT(*)
					FROM games g2
					WHERE (g2.p1_key = g1.p1_key OR g2.p2_key = g1.p1_key)
					AND g2.winner IS NOT NULL
					AND g2.winner != g1.p1_key
					AND g2.game_date < g1.game_date
				) AS p1_losses_before,

				(
					SELECT COUNT(*)
					FROM games g3
					WHERE (g3.p1_key = g1.p2_key OR g3.p2_key = g1.p2_key)
					AND g3.game_date < g1.game_date
				) AS p2_total_before,

				(
					SELECT COUNT(*)
					FROM games g3
					WHERE g3.winner = g1.p2_key
					AND g3.game_date < g1.game_date
				) AS p2_wins_before,

				(
					SELECT COUNT(*)
					FROM games g3
					WHERE (g3.p1_key = g1.p2_key OR g3.p2_key = g1.p2_key)
					AND g3.winner IS NOT NULL
					AND g3.winner != g1.p2_key
					AND g3.game_date < g1.game_date
				) AS p2_losses_before

			FROM games g1
			WHERE g1.g_id = ?
		`);

		const stmtTotalGames = db.prepare(`
			SELECT 
				g1.p1_key,
				g1.p2_key,
				g1.game_date,

				(
					SELECT COUNT(*)
					FROM games g2
					WHERE (g2.p1_key = g1.p1_key OR g2.p2_key = g1.p1_key)
					AND g2.winner IS NOT NULL
				) AS p1_total,

				(
					SELECT COUNT(*)
					FROM games g2
					WHERE g2.winner = g1.p1_key
				) AS p1_wins,

				(
					SELECT COUNT(*)
					FROM games g2
					WHERE (g2.p1_key = g1.p1_key OR g2.p2_key = g1.p1_key)
					AND g2.winner IS NOT NULL
					AND g2.winner != g1.p1_key
				) AS p1_losses,

				(
					SELECT COUNT(*)
					FROM games g3
					WHERE (g3.p1_key = g1.p2_key OR g3.p2_key = g1.p2_key) AND g3.winner IS NOT NULL
				) AS p2_total,

				(
					SELECT COUNT(*)
					FROM games g3
					WHERE g3.winner = g1.p2_key
				) AS p2_wins,

				(
					SELECT COUNT(*)
					FROM games g3
					WHERE (g3.p1_key = g1.p2_key OR g3.p2_key = g1.p2_key)
					AND g3.winner IS NOT NULL
					AND g3.winner != g1.p2_key
				) AS p2_losses

			FROM games g1
			WHERE g1.g_id = ?
		`);
		
		const stmtRankpointsBefore = db.prepare(`
			SELECT 
				g.p1_key,
				g.p2_key,
				g.game_date,
				(
					SELECT SUM(r.value)
					FROM rankpoints r
					WHERE r.u_id = g.p1_key
					AND r.date < g.game_date
				) AS p1_rankpoints_before,
				(
					SELECT SUM(r.value)
					FROM rankpoints r
					WHERE r.u_id = g.p2_key
					AND r.date < g.game_date
				) AS p2_rankpoints_before
			FROM games g
			WHERE g.g_id = ?
		`);

		const stmtRankpoints = db.prepare(`
			SELECT 
				g.p1_key,
				g.p2_key,
				g.game_date,
				(
					SELECT SUM(r.value)
					FROM rankpoints r
					WHERE r.u_id = g.p1_key
				) AS p1_rankpoints,
				(
					SELECT SUM(r.value)
					FROM rankpoints r
					WHERE r.u_id = g.p2_key
				) AS p2_rankpoints
			FROM games g
			WHERE g.g_id = ?
		`);

		const stmtHeadToHeadGames = db.prepare(`
			SELECT 
				g.*,
				t.name AS tournament_name,
				u1.display_name AS p1_display_name,
				u2.display_name AS p2_display_name,
				u1.avatar_url AS p1_avatar,
				u2.avatar_url AS p2_avatar,

				(
					SELECT COUNT(*)
					FROM games gx
					WHERE (
						(gx.p1_key = g.p1_key AND gx.p2_key = g.p2_key)
						OR (gx.p1_key = g.p2_key AND gx.p2_key = g.p1_key)
					)
					AND gx.winner IS NOT NULL
				) AS total_matches,

				(
					SELECT COUNT(*)
					FROM games gx
					WHERE (
						(gx.p1_key = g.p1_key AND gx.p2_key = g.p2_key)
						OR (gx.p1_key = g.p2_key AND gx.p2_key = g.p1_key)
					)
					AND gx.winner = g.p1_key
				) AS p1_wins,

				(
					SELECT COUNT(*)
					FROM games gx
					WHERE (
						(gx.p1_key = g.p1_key AND gx.p2_key = g.p2_key)
						OR (gx.p1_key = g.p2_key AND gx.p2_key = g.p1_key)
					)
					AND gx.winner = g.p2_key
				) AS p2_wins,

				ROUND(
					(
						(
							SELECT COUNT(*)
							FROM games gx
							WHERE (
								(gx.p1_key = g.p1_key AND gx.p2_key = g.p2_key)
								OR (gx.p1_key = g.p2_key AND gx.p2_key = g.p1_key)
							)
							AND gx.winner = g.p1_key
						) * 100.0
						/
						NULLIF((
							SELECT COUNT(*)
							FROM games gx
							WHERE (
								(gx.p1_key = g.p1_key AND gx.p2_key = g.p2_key)
								OR (gx.p1_key = g.p2_key AND gx.p2_key = g.p1_key)
							)
							AND gx.winner IS NOT NULL
						), 0)
					), 1
				) AS p1_winrate,

				ROUND(
					(
						(
							SELECT COUNT(*)
							FROM games gx
							WHERE (
								(gx.p1_key = g.p1_key AND gx.p2_key = g.p2_key)
								OR (gx.p1_key = g.p2_key AND gx.p2_key = g.p1_key)
							)
							AND gx.winner = g.p2_key
						) * 100.0
						/
						NULLIF((
							SELECT COUNT(*)
							FROM games gx
							WHERE (
								(gx.p1_key = g.p1_key AND gx.p2_key = g.p2_key)
								OR (gx.p1_key = g.p2_key AND gx.p2_key = g.p1_key)
							)
							AND gx.winner IS NOT NULL
						), 0)
					), 1
				) AS p2_winrate

			FROM games g
			LEFT JOIN tournaments t ON g.t_key = t.t_key
			LEFT JOIN users u1 ON g.p1_key = u1.id
			LEFT JOIN users u2 ON g.p2_key = u2.id
			WHERE 
				(g.p1_key = ? AND g.p2_key = ? AND g.winner IS NOT NULL)
				OR (g.p1_key = ? AND g.p2_key = ? AND g.winner IS NOT NULL)
			ORDER BY g.game_date DESC
		`);

		const resGame = stmtGame.get(gameId);
		const resPreviousGames = stmtPreviousGames.get(gameId);
		const resTotalGames = stmtTotalGames.get(gameId);
		const resRankpointsBefore = stmtRankpointsBefore.get(gameId);
		const resRankpoints = stmtRankpoints.get(gameId);
		const resHeadToHeadGames = stmtHeadToHeadGames.all(resGame.p1_key, resGame.p2_key, resGame.p2_key, resGame.p1_key);

		let gameStatus: string;
		let score: string;
		if (resGame.winner == null) {
			gameStatus = "Upcoming";
			score = "-";
		}
		else{
			gameStatus = "Finished";
			score = resGame.p1_points + " - " + resGame.p2_points;
		}

		return {
			gameStatus: gameStatus,
			date: resGame.game_date,
			p1Displayname: resGame.p1_display_name,
			p2Displayname: resGame.p2_display_name,
			p1Avatar: resGame.p1_avatar,
			p2Avatar: resGame.p2_avatar,
			score: score,
			totalGamesP1Gamedate: resPreviousGames.p1_total_before,
			totalGamesP2Gamedate: resPreviousGames.p2_total_before,
			totalGamesP1: resTotalGames.p1_total,
			totalGamesP2: resTotalGames.p2_total,
			winrateP1Gamedate: Math.round((resPreviousGames.p1_wins_before / resPreviousGames.p1_total_before) * 100),
			winrateP2Gamedate: Math.round((resPreviousGames.p2_wins_before / resPreviousGames.p2_total_before) * 100),
			winrateP1Now: Math.round((resTotalGames.p1_wins / resTotalGames.p1_total) * 100),
			winrateP2Now: Math.round((resTotalGames.p2_wins / resTotalGames.p2_total) * 100),
			rankpointsP1Gamedate: 1000 + resRankpointsBefore.p1_rankpoints_before,
			rankpointsP2Gamedate: 1000 + resRankpointsBefore.p2_rankpoints_before,
			rankpointsP1Now: 1000 + resRankpoints.p1_rankpoints,
			rankpointsP2Now: 1000 + resRankpoints.p2_rankpoints,
			h2hGames: resHeadToHeadGames,
			u_id: userId
		};
	}

	static getUserByDisplayname(displayname: string){
		const stmtUser = db.prepare(`
			SELECT *
			FROM users
			WHERE display_name = ?
		`);
		const resUser = stmtUser.get(displayname);

		if (resUser){
			return {
				success: true,
				displayname: resUser.display_name,
				avatar: resUser.avatar_url
			};
		}
		else{
			return {
				success: false
			}
		}
	}

	static addFriend(u_id: number, displayname: string){
		const stmtUser = db.prepare(`
			SELECT *
			FROM users
			WHERE display_name = ?
		`);

		const stmtAlreadyFriends = db.prepare(`
			SELECT *
			FROM friends
			WHERE (u1_id = ? AND u2_id = ?)
			OR (u1_id = ? AND u2_id = ?)
		`);

		const resUser = stmtUser.get(displayname);

		if (resUser && resUser.id != u_id){
			const resAlreadyFriends = stmtAlreadyFriends.get(u_id, resUser.id, resUser.id, u_id);
			if (resAlreadyFriends) {
				return {
					success: false,
					msg: "You are already a friend of " + resUser.display_name
				};
			}
			const stmtAddFriend = db.prepare(`
				INSERT INTO friends (u1_id, u2_id)
				VALUES (?, ?)
			`)
			stmtAddFriend.run(u_id, resUser.id);
			return {
				success: true
			};
		}
		else{
			return {
				success: false,
				msg: "Idk what happened!"
			};
		}
	}

	//Modify Online Status here
	static getFriends(u_id: number){
		const stmtFriends = db.prepare(`
			SELECT 
				f.id,
				CASE 
					WHEN f.u1_id = ? THEN f.u2_id 
					ELSE f.u1_id 
				END AS friend_id,
				u.display_name AS friend_display_name,
				u.avatar_url AS friend_avatar,
				CASE 
					WHEN u.last_activity >= strftime('%s','now') - 120 THEN 1
					ELSE 0
				END AS is_online
			FROM friends f
			JOIN users u 
				ON u.id = CASE 
					WHEN f.u1_id = ? THEN f.u2_id 
					ELSE f.u1_id 
				END
			WHERE f.u1_id = ? OR f.u2_id = ?
		`);

		const resFriends = stmtFriends.all(u_id, u_id, u_id, u_id);
		return (resFriends);
	}

	static updateLastActivity(u_id: number){
		const stmtUpdate = db.prepare(`
			UPDATE users
			SET last_activity = ?
			WHERE id = ?	
		`);
		stmtUpdate.run(Math.floor(Date.now() / 1000), u_id);
	}

	static removeFriend(u_id: number, f_id: number){
		const stmtDelete = db.prepare(`
			DELETE FROM friends
			WHERE 
				(u1_id = ? AND u2_id = ?)
				OR (u1_id = ? AND u2_id = ?)
		`);
		try {
			const result = stmtDelete.run(u_id, f_id, f_id, u_id);
			return {
				success: true
			};
		} catch (error) {
			return {
				success: false,
				msg: error
			};
		}
	}

	static createRemoteGame(u_id: number, remote_id: string){
		const stmtCreate = db.prepare(`
			INSERT INTO games (p1_key, remote_id)
			VALUES (?, ?)
		`)
		try {
			const result = stmtCreate.run(u_id, remote_id);
			return {
				success: true,
				table_g_id: result.lastInsertRowid
			};
		} catch (error) {
			return {
				success: false,
				msg: error
			};
		}
	}

	static setRemoteGameP2(u_id: number, remote_id: string){
		const stmtUpdateGame = db.prepare(`
			UPDATE games
			SET p2_key = ?
			WHERE remote_id = ?
		`)
		try {
			const res = stmtUpdateGame.run(u_id, remote_id);
			return {
				sucess: true
			}
		} catch (error) {
			return {
				sucess: false,
				msg: error
			}
		}
	}

	static updateRemoteScore(remote_id: string, p1_score: number, p2_score: number){
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
			WHERE remote_id = ?
		`);

		const stmtGetGame = db.prepare(`
			SELECT *
			FROM games
			WHERE remote_id = ?
		`)

		const stmtSetRankpoints = db.prepare(`
			INSERT INTO rankpoints (u_id, g_id, value)
			VALUES (?, ?, ?)
		`)

		const stmtUpdateRankpoints = db.prepare(`
			UPDATE users
			SET rank_points = rank_points + ?
			WHERE id = ?
		`)

		try {
			const res = stmtUpdateGame.run(
				p1_score,
				p2_score,
				p1_score,
				p2_score,
				p1_score,
				p2_score,
				remote_id
			);
			const game = stmtGetGame.get(remote_id);
			if (game.winner == game.p1_key){
				stmtSetRankpoints.run(game.p1_key, game.g_id, 2);
				stmtSetRankpoints.run(game.p2_key, game.g_id, -2);
				stmtUpdateRankpoints.run(2, game.p1_key);
				stmtUpdateRankpoints.run(-2, game.p2_key)
			}
			else{
				stmtSetRankpoints.run(game.p2_key, game.g_id, 2);
				stmtSetRankpoints.run(game.p1_key, game.g_id, -2);
				stmtUpdateRankpoints.run(-2, game.p1_key);
				stmtUpdateRankpoints.run(2, game.p2_key)
			}
			return true;
		} catch (error) {
			console.log(error);
			return false;
		}
	}

	static removeRemoteGame(remote_id: string){
		const stmtRemoveGame = db.prepare(`DELETE FROM games WHERE remote_id = ?`);
		try {
			const res = stmtRemoveGame.run(remote_id);
			return true;
		} catch (error) {
			console.log(error);
			return false;
		}
	}
}