#!/usr/bin/env node
const Websocket = require("ws");
const readline = require("readline");

const args = process.argv.slice(2);
if (args.length < 1)
{
    console.error("Usage: pong-cli <game-key> (<-l>)");
    process.exit();
}
const gameKey = args[0];

const ws = new Websocket(`wss://localhost:443/game/pong/ws/game_${gameKey}`, {rejectUnauthorized: false});

ws.on("open", () => {
    console.log("Connected to game room: ", gameKey);
    console.log("Controls: w = up, s = down, q = quit");
})

// ws.send(JSON.stringify( {
//     type: "join",
//     player: "player2"
// }));

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on("keypress", (str, key) => {
    if (key.name === "q") {
        console.log("Leaving game");
        ws.close();
        process.exit();
    }
    else if (key.name === "w") {
        ws.send(JSON.stringify( {
            type: "move", player: "player2", direction: "up"
        }));
    }
    else if (key.name === "s") {
        ws.send(JSON.stringify( {
            type: "move", player: "player2", direction: "down"
        }));
    }
});

ws.on("message", (data) => {
    if (args[1] === "-l")
    console.log("Server: ", data.toString());
});

ws.on("close", () => {
    console.log("Disconnected");
    process.exit();
});