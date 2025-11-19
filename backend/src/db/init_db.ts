import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
const db = new Database('/db/db.db');

type User = {
  key: number;
  nickname: string;
  password: string;
  email: string;
};

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT DEFAULT "/profile-images/default.jpg",
    rank_points INTEGER DEFAULT 1000,
    twofa_secret TEXT,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    last_activity INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS tournaments(
    t_key INTEGER PRIMARY KEY,
    creator_key INTEGER,
    name TEXT,
    max_player INTEGER,
    starttime TEXT,
    status TEXT DEFAULT "not started",
    winner INTEGER,
    result TEXT DEFAULT ""
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS tournament_registrations(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tournament_key INTEGER,
    user_key INTEGER
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS games(
    g_id INTEGER PRIMARY KEY,
    t_key INTEGER DEFAULT 0,
    round INTEGER,
    match_nbr INTEGER,
    p1_key INTEGER,
    p2_key INTEGER,
    p1_points INTEGER,
    p2_points INTEGER,
    winner INTEGER,
    remote_id TEXT,
    game_date TEXT DEFAULT CURRENT_DATE
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS rankpoints(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    u_id INTEGER NOT NULL,
    g_id INTEGER NOT NULL,
    value INTEGER NOT NULL,
    date TEXT DEFAULT CURRENT_DATE
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS friends(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    u1_id INTEGER NOT NULL,
    u2_id INTEGER NOT NULL
  )
`);

async function init() {
  const insert = db.prepare('INSERT OR REPLACE INTO users (id, username, display_name, password, email) VALUES (?, ?, ?, ?, ?)');
  const hashedPassword = await bcrypt.hash("123456", 10);
  try {
    insert.run(2, 'admin', 'admindisplay', hashedPassword, 'abc@abc');
  } catch (err) {
    console.error('Error on insert: ', err);
  }
}

init();
export default db;