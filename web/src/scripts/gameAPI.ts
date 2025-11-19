// src/api/gameApi.ts
import {JwtExpired} from "./jwtExpired.js"

const BASE_URL = `${window.location.protocol}//${window.location.host}/game/pong`;
const API_BASE = `${window.location.origin}/api`;

export async function createGame(player1: string, mode: 'local' | 'ai' | 'remote', difficulty?: 'easy' | 'medium' | 'hard', player2?: string ) {

  const res = await fetch(`${BASE_URL}/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ player1, mode, difficulty, player2}),
  });
  return res.json();
}

export async function createTableGame(gameId: string | null) {
    const jwt = await JwtExpired(localStorage.getItem("jwtToken"));
    if (jwt)
      return null;
    const res = await fetch(`${API_BASE}/players/createremotegame/${gameId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${localStorage.getItem("jwtToken")}`},
  });
  return res.json();
}

export async function createTournamentGame(uname: string | null) {
    const jwt = await JwtExpired(localStorage.getItem("jwtToken"));
    if (jwt)
      return null;
    const res = await fetch(`${API_BASE}/tournament/starttournamentgame/${uname}`, {
    method: "GET",
    headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${localStorage.getItem("jwtToken")}`},
  });
  const data = await res.json();
  return data;
}

export async function joinTableGame(gameId: string | null) {

    const jwt = await JwtExpired(localStorage.getItem("jwtToken"));
    if (jwt)
      return null;
    const res = await fetch(`${API_BASE}/players/setremotegamep2/${gameId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${localStorage.getItem("jwtToken")}`},
  });
  const data = await res.json();
  return data;
}

export async function sendEndState(gameState: any, tournamentId: string) {
    const jwt = await JwtExpired(localStorage.getItem("jwtToken"));
    if (jwt)
      return null;
    const res = await fetch(`${API_BASE}/tournament/finishtournamentgame`, {
    method: "POST",
    headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${localStorage.getItem("jwtToken")}`},
    body: JSON.stringify({ g_id: tournamentId, p1_score: gameState.player1.score, p2_score: gameState.player2.score})
  });
  const data = await res.json();
  return data;
}

export async function sendAvatar(gameId: string | null, player: 'player1' | 'player2', src: string, playerName: string | null) {
  try {
    const res = await fetch(`${BASE_URL}/avatar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId, player, src, playerName}),
    });
    return res.json();
  }
  catch (err){
    console.error("Avaatr API:", err);
  }
  }


// export async function removeGame(gameId: string) {
//   const res = await fetch(`${BASE_URL}/remove`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ gameId }),
//   });
//   return res.json();
// }