import { createGame, sendAvatar, createTableGame, joinTableGame, createTournamentGame, sendEndState} from "../scripts/gameAPI.js";
import {loadRoute} from "../scripts/router.js"
import {JwtExpired} from "../scripts/jwtExpired.js"


const API_BASE = `${window.location.origin}/api`;

let tableGameId: string;

let currentState: any;

let ws: WebSocket | null = null;

interface GameAvatars {
  player1: HTMLImageElement | null;
  player2: HTMLImageElement | null;
}

const gameAvatars: GameAvatars = {
  player1: null,
  player2: null,
};

export function leaveGamePage()
{
	if (ws)
		ws.close();
	ws = null;
}

interface gameAliases {player1alias: string, player2alias: string};

function loadAvatar(src: string): Promise <HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.src = src;
		// console.log("Image source", img.src);
		img.onload = () => resolve(img);
		img.onerror = reject;
	});
}

async function preloadAvatars(p1Src: string, p2Src: string)
{
	try {
		gameAvatars.player1 = await loadAvatar(p1Src);
		gameAvatars.player2 = await loadAvatar(p2Src);
	}
	catch (err) {
		console.error("Avatar loading failed:", err);
	}
}

let playerName: string | null = null;
let avatar: string | null = null;

async function getUserData() {
	const jwt = localStorage.getItem('jwtToken');
	if (!jwt)
		return null;
		const response = await fetch(`${API_BASE}/players/profiledata`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${jwt}`
        }
    });
    const data = await response.json();
	playerName = data.displayname ?? null;
	avatar = data.image;
	return data;
}


export function Game(uname: string | null): HTMLElement {
	const protocol = window.location.protocol === "https:" ? "wss" : "ws";

	let stopconfetti = false;
	let gameType: string;
	const canvasWrap = document.createElement("div");
	canvasWrap.className = "relative w-full z-10 h-full bg-black rounded-xl overflow-hidden flex items-center justify-center";
	const canvas = document.createElement("canvas");
	canvas.id = "game-canvas";
	canvas.className = "block w-full h-full";

	const {containerBtn: endButtons, button1: playAgain, button2: returnHome} = createTwoButtons("Play Again", "Return");
	endButtons.style.display = "none";

	requestAnimationFrame(() => {
		resizeCanvas(); // runs after layout/paint
  	});

  	const keys: Record<string, boolean> = {};

	// Track key presses and releases
	window.addEventListener("keydown", (e) => {
	keys[e.key.toLowerCase()] = true;
	});

	window.addEventListener("keyup", (e) => {
	keys[e.key.toLowerCase()] = false;
	});

	const ctx = canvas.getContext("2d")!;
	let gameId: string | null = null;
  
	function resizeCanvas() {
	  canvas.width = canvasWrap.clientWidth;
	  canvas.height = canvasWrap.clientHeight;
	}
  
	resizeCanvas();
	window.addEventListener("resize", resizeCanvas);

	if (uname && uname.length !== 0)
	{
		let p1name: string;
		let p2name: string;
		let p1avatar: string;
		let p2avatar: string;
		let tournamentId: string;
		canvasWrap.append(canvas);
		gameType = "multiplayer";
		startTournamentGame();
		async function startTournamentGame() {
			try {
				const res = await createTournamentGame(uname);
				p1name = res.p1_name;
				p2name = res.p2_name;

				p1avatar = res.p1_avatar;
				p2avatar = res.p2_avatar;

				tournamentId = res.g_id;
				const resGame = await createGame("Player1", 'local', undefined, "Player2");
				gameId = resGame.gameId;
			} catch (error) {
				console.error("Error starting the game:", error); // Debugging log
				singleplayerButton.style.display = "block"; // Show the button again if there's an error
			}
			ws = new WebSocket(`${protocol}://${window.location.host}/game/pong/ws/${gameId}`);
			ws.onopen = () => {
				
				startInputLoop(ws, null);
				preloadAvatars(p1avatar, p2avatar);
			};
			ws.onmessage = (event) => {
				const data = JSON.parse(event.data);
				if (data.type === "game_state" && ws) {
					currentState = data;
					if (currentState.state === 'player1_wins') {
						drawEndMessage(currentState, "#00b0fc", p1name, p2name);
						const res = sendEndState(currentState, tournamentId);
						location.hash = "#home";
						ws.close();
					}
					else if (currentState.state === 'player2_wins') {
						drawEndMessage(currentState, "#f7363d", p1name, p2name);
						const res = sendEndState(currentState, tournamentId);
						location.hash = "#home";
						ws.close();
					}
					else if (currentState.state === 'connection_lost') {
						// drawEndMessage(currentState, "white", p1name, p2name);
						// sendEndState(currentState, tournamentId);
						location.hash = "#home";
						ws.close();
					}
					else {
						draw(currentState, p1name, p2name);
					}
				}
			};
			ws.onerror = (event) => {
				console.error("Websocket error:", event);
				alert("Connection to the Game Server failed, please try again.");
				location.hash = "#home";
			};
		}
		return canvasWrap;
	};
	setTimeout(() => {
        getUserData();
    }, 0);

    function chooseDifficulty() : Promise<'easy' | 'medium' | 'hard'> {
		return new Promise((resolve) => {
			const levels: Record<string, 'easy' | 'medium' | 'hard'> = {
				"1": "easy",
				"2": "medium",
				"3": "hard"
			};
		const container = document.createElement("div");
		container.className = "absolute flex flex-col items-center gap-4 z-10";

		const label = document.createElement("label");
		label.textContent = "Select Difficulty";
		label.className = "text-lg font-semibold text-white";

		const slider = document.createElement("input");
		slider.type = "range";
		slider.min = "1";
		slider.max = "3";
		slider.step = "1";
		slider.value = "2"; // default: Medium
		slider.className = "w-64 accent-yellow-400"; // Tailwind: width + color

		const difficultyText = document.createElement("span");
		difficultyText.textContent = "Medium";
		difficultyText.className = "text-white mt-2";

		slider.addEventListener("input", () => {
		const levels = { "1": "Easy", "2": "Medium", "3": "Hard" };
		difficultyText.textContent = levels[slider.value as "1" | "2" | "3"];
		});
		const confirmBtn = document.createElement("button");
		confirmBtn.textContent = "Confirm";
		confirmBtn.className = "bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-600";
		confirmBtn.addEventListener("click", () => {
			container.classList.add("hidden"); // Hide slider after confirmation
			resolve(levels[slider.value]);
		});
		container.append(label, slider, difficultyText, confirmBtn);
		canvasWrap.appendChild(container);	
		});
	}
	
	function createTwoButtons(text1: string, text2: string)
	{
		const containerBtn = document.createElement("div");
		containerBtn.className = "absolute flex justify-center gap-8 items-center z-10"; // flexbox + spacing

		const button1 = document.createElement("button");
		button1.className = "bg-yellow-400 text-black px-6 py-2 rounded hover:bg-yellow-600";
		button1.textContent = text1;

		const button2 = document.createElement("button");
		button2.className = "bg-yellow-400 text-black px-6 py-2 rounded hover:bg-yellow-600";
		button2.textContent = text2;

		containerBtn.append(button1, button2);

		return {containerBtn, button1, button2};
	}


	const {containerBtn: gameTypeButtons, button1: singleplayerButton, button2: multiplayerButton} = createTwoButtons("Singleplayer", "Multiplayer");
	
	multiplayerButton.addEventListener("click", async () => {
		gameTypeButtons.style.display = "none";
      	const jwt = await JwtExpired(localStorage.getItem("jwtToken"));
      	if (!jwt)
			multiplayerTypeButtons.style.display = "flex";
		else
		{
			gameType = "multiplayer";
			startMultiplayerGame();
		}
	});

	singleplayerButton.addEventListener("click", async () => {
		gameType = "singleplayer";	
		startSingleplayerGame();
	});


	const {containerBtn: multiplayerTypeButtons, button1: local, button2: remote} = createTwoButtons("Local Multiplayer", "Online Multiplayer");
	multiplayerTypeButtons.style.display = "none";

	local.addEventListener("click", async () => {
		gameType = "multiplayer";
		startMultiplayerGame();
	});

	remote.addEventListener("click", async () => {
		gameType = "room";
		multiplayerTypeButtons.style.display = "none";
		remoteAccessButtons.style.display = "flex";
	});
	let player: "player1" | "player2";
	const {containerBtn: remoteAccessButtons, button1: create, button2: join} = createTwoButtons("Create a Gameroom", "Join a Gameroom");
	remoteAccessButtons.style.display = "none";

	create.addEventListener("click", async () => {
		let player2name: string;
		remoteAccessButtons.style.display = "none";
		try {
			const res = await createGame("player1", 'remote', undefined, undefined);
			gameId = res.gameId;
			player = "player1";
			const resTable = await createTableGame(gameId);
			// const data = await resTable.json();
			// if (!data.success)
			// {
			// 	//redirect Home
			// }
			// tableGameId = data.table_g_id;
		} 
		catch (error) {
			console.error("Error starting the game:", error); // Debugging log
			singleplayerButton.style.display = "block"; // Show the button again if there's an error
		}
		let src: string;
		if (avatar)
			src = avatar;
		else
			src = "/profile-images/default.jpg";
		try {
			const res = await sendAvatar(gameId, 'player1', src, playerName);
		} catch (error)
		{
			console.error("Error sending the Avatar:", error);
			singleplayerButton.style.display = "block"; // Show the button again if there's an erro
		}
		const messageDiv = document.createElement("div");
		messageDiv.textContent = `Invite Player 2 to join a Room using the Key: ${gameId?.slice(5)}`;
		messageDiv.className = `
		fixed inset-0 flex
		items-center justify-center  /* center content */
		text-white text-2xl font-bold
		z-50                  /* make sure it overlays other elements */
		`;
		canvasWrap.append(messageDiv);
		ws = new WebSocket(`${protocol}://${window.location.host}/game/pong/ws/${gameId}`);
		ws.onopen = () => {
			//console.log("Connected to WS for creating");
			startInputLoop(ws, player);
		};
		ws.onmessage = (event) => {
			messageDiv.remove();
			const data = JSON.parse(event.data);
			if (data.type === "game_state" && ws) {
				currentState = data;
				if (currentState.state === 'player1_wins') {
					drawEndMessage(currentState, "#00b0fc", playerName, player2name);
					ws.close();
				}
				else if (currentState.state === 'player2_wins') {
					drawEndMessage(currentState, "#f7363d", playerName, player2name);
					ws.close();
				}
				else if (currentState.state === 'connection_lost') {
					drawEndMessage(currentState, "#ffffff", playerName, player2name);
					ws.close();
				}
				else {
					draw(currentState, playerName, player2name);
				}
			}
			if (data.type === "avatars")
			{
				if (avatar)
					preloadAvatars(avatar, data.player2);
				else
					preloadAvatars("/profile-images/default.jpg", data.player2);
				player2name = data.player2name;
			};
		};
		ws.onerror = (event) => {
			console.error("Websocket error:", event);
			alert("Connection to the Game Server failed, please try again.");
			location.hash = "#home";
		};
	});

	join.addEventListener("click", async () => {
		remoteAccessButtons.style.display = "none";
		player = "player2";
		const joinInput = document.createElement("input");
		joinInput.type = "text";
		joinInput.placeholder = "Enter 4-Digit Game Key";
		joinInput.className = "px-4 py-2 rounded border border-gray-300 text-white w-48"
		const joinButton = document.createElement("button");
		joinButton.textContent = "Join Game";
		joinButton.className = `bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700`;
		const joinContainer = document.createElement("div");
		joinContainer.className = `
		absolute fixed inset-0 
		flex flex-col items-center justify-center 
		gap-4
		bg-black bg-opacity-50
		z-50
		`;
		joinContainer.append(joinInput, joinButton);
		canvasWrap.append(joinContainer);
		joinButton.addEventListener("click", async () => {
			let player1name: string;
			gameId = "game_" + joinInput.value.trim();
			//console.log("Joining game raw:", gameId, Array.from(gameId).map(c => c.charCodeAt(0)));
			if (!gameId) {
				alert("Please enter a valid Game ID");
				return;
			}
			let src: string;
			if (avatar)
				src = avatar;
			else
				src = "/profile-images/default.jpg";
			try {
				const res = await sendAvatar(gameId, 'player2', src, playerName);
				const resTable = await joinTableGame(gameId);
			} catch (error)
			{
				console.error("Error sending the Avatar:", error);
				singleplayerButton.style.display = "block"; // Show the button again if there's an erro
			}
			joinContainer.remove();
			ws = new WebSocket(`${protocol}://${window.location.host}/game/pong/ws/${gameId}`);
			ws.onopen = () => {
				//console.log("Connected to WS for joining");
				startInputLoop(ws, "player2");
			};
		ws.onmessage = (event) => {
			const data = JSON.parse(event.data);
			if (data.type === "game_state" && ws) {
				currentState = data;
				if (currentState.state === 'player1_wins') {
					drawEndMessage(currentState, "#00b0fc", player1name, playerName);
					ws.close();
				}
				else if (currentState.state === 'player2_wins') {
					drawEndMessage(currentState, "#f7363d", player1name, playerName);
					ws.close();
				}
				else if (currentState.state === 'connection_lost') {
					drawEndMessage(currentState, "white", player1name, playerName);
					ws.close();
				}
				else {
					draw(currentState, player1name, playerName);
				}
			}
			if (data.type === "avatars")
			{
				if (avatar)
					preloadAvatars(data.player1, avatar);
				else	
					preloadAvatars(data.player1, "/profile-images/default.jpg");
				player1name = data.player1name;
			};
		};
		ws.onerror = (event) => {
			console.error("Websocket error:", event);
			alert("Connection to the Game Server failed, please try again.");
			location.hash = "#home";
		};
		});

	});

	canvasWrap.append(canvas, gameTypeButtons, endButtons, multiplayerTypeButtons, remoteAccessButtons);
  
	playAgain.addEventListener("click", async () => {
		stopconfetti = true;
		endButtons.style.display = "none";
		loadRoute();
	});
	returnHome.addEventListener("click", async () => {
		location.hash = "#home";
	});

	async function startMultiplayerGame() {
		multiplayerTypeButtons.style.display = "none";
		try {
			const res = await createGame("Player1", 'local', undefined, "Player2");
			gameId = res.gameId;
		} catch (error) {
			console.error("Error starting the game:", error); // Debugging log
			singleplayerButton.style.display = "block"; // Show the button again if there's an error
		}
		ws = new WebSocket(`${protocol}://${window.location.host}/game/pong/ws/${gameId}`);
		ws.onopen = () => {
			//console.log("Connected to WS for multiplayer");
			startInputLoop(ws, null);
			if (avatar)
				preloadAvatars(avatar, "/profile-images/default.jpg");
			else
				preloadAvatars("/profile-images/default.jpg", "/profile-images/default.jpg");
		};
		ws.onmessage = (event) => {
			const data = JSON.parse(event.data);
			if (data.type === "game_state" && ws) {
				currentState = data;
				if (currentState.state === 'player1_wins') {
					drawEndMessage(currentState, "#00b0fc", playerName);
					ws.close();
				}
				else if (currentState.state === 'player2_wins') {
					drawEndMessage(currentState, "#f7363d", playerName);
					ws.close();
				}
				else if (currentState.state === 'connection_lost') {
					drawEndMessage(currentState, "white", playerName);
					ws.close();
				}
				else {
					draw(currentState, playerName);
				}
			}
		};
		ws.onerror = (event) => {
			console.error("Websocket error:", event);
			alert("Connection to the Game Server failed, please try again.");
			location.hash = "#home";
		};
	};

	async function startSingleplayerGame() {
		ctx.fillStyle = "black";
		

		ctx.fillRect(0, canvas.height * 0.1, canvas.width, canvas.height * 0.9);
		gameType = "room";
		gameTypeButtons.style.display = "none";
		const difficulty =  await chooseDifficulty();
		try {
			const res = await createGame("Player1", "ai", difficulty, undefined);
			gameId = res.gameId;
		}
		catch (error) {
			console.error("Error starting the game:", error); // Debugging log
			singleplayerButton.style.display = "block"; // Show the button again if there's an error
		}
		ws = new WebSocket(`${protocol}://${window.location.host}/game/pong/ws/${gameId}`);
		ws.onopen = () => {
			//console.log("Connected to WS for singleplayer game");
			startInputLoop(ws, "player1");
			if (avatar)
				preloadAvatars(avatar, "/profile-images/default.jpg");
			else
				preloadAvatars("/profile-images/default.jpg", "/profile-images/default.jpg");
			};
		ws.onmessage = (event) => {
			const data = JSON.parse(event.data);
			if (data.type === "game_state" && ws) {
				currentState = data;
				if (currentState.state === 'player1_wins') {
					drawEndMessage(currentState, "#00b0fc", playerName);
					ws.close();
				}
				else if (currentState.state === 'player2_wins') {
					drawEndMessage(currentState, "#f7363d", playerName);
					ws.close();
				}
				else if (currentState.state === 'connection_lost') {
					drawEndMessage(currentState, "white", playerName);
					ws.close();
				}
				else {
					draw(currentState, playerName);
				}
			}
		};
		ws.onerror = (event) => {
			console.error("Websocket error:", event);
			alert("Connection to the Game Server failed, please try again.");
			location.hash = "#home";
		};
	}
  

	function renderScatteringConfetti(message: string, color: string, messageText: Record<string, string>) {
		const confetti: any = []
		const start = performance.now() // To keep track of time
		for (let i = 0; i < 40; i++) {
		const radius = Math.floor(Math.random() * 50) - 10
		const tilt = Math.floor(Math.random() * 10) - 10
		const x = Math.random() * canvas.width;
		const y = Math.random() * (canvas.height * 0.9) + canvas.height * 0.1;
		let color: string = "#f7363d";	
		if (message === "player1_wins")
				color ="#00b0fc"
		confetti.push({
			x,
			y,
			radius,
			tilt,
			color: color,
			yVelocity: Math.random() * 3,
			xVelocity: Math.random() * 2 - 1
		})
		}
		function update() {
		// Run for at most 10 seconds
		if (stopconfetti === true)
				return;
		if (performance.now() - start > 13000) 
		{	
			endButtons.style.display = "flex";
			return;
		}
			ctx.clearRect(0, canvas.height * 0.1, canvas.width, canvas.height * 0.9);
		ctx.fillStyle = color;      // text color
		ctx.font = "bold 48px 'Fredoka One', sans-serif";       // font style/size
		ctx.textAlign = "center";       // align text
		ctx.fillText(
			messageText[message],
			canvas.width / 2,             // center horizontally
			canvas.height / 3             // center vertically
		);
		confetti.forEach((piece: any) => {
			piece.y += piece.yVelocity;
			piece.x += piece.xVelocity;
			ctx.beginPath();
			ctx.lineWidth = piece.radius / 2;
			ctx.strokeStyle = piece.color;
			ctx.moveTo(piece.x + piece.tilt + piece.radius / 4, piece.y);
			ctx.lineTo(piece.x + piece.tilt, piece.y + piece.tilt + piece.radius / 4);
			ctx.stroke();
		})
		requestAnimationFrame(update);
		}
		update();
	}
	
	function drawEndMessage(state: any, color: string, player1Name: string | null, player2Name?:string | null) {
		//console.log("Ending state: ", state.state);
		if (state.state === 'connection_lost')
		{
			ctx.fillStyle = "white";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText("The second Player has disconnected\nThe Game has been ended.", canvas.width / 2, canvas.height / 2);
		}
		else
		{
			drawScores(ctx, state.player1.score, state.player2.score, canvas.width, canvas.height * 0.1, player1Name, player2Name);
			ctx.fillStyle = "black";
			ctx.fillRect(0, canvas.height * 0.1, canvas.width, canvas.height * 0.9);
			if (!player1Name)
				player1Name = "Player 1";
			if (!player2Name)
				player2Name = "Player 2";
			const messageText: Record<string, string> = {
				'player1_wins': `${player1Name} Wins!`,
				'player2_wins': `${player2Name} Wins!`,
			}
			renderScatteringConfetti(state.state, color, messageText);
		}
	}
		
	// Movement loop (runs ~60 times per second)
	function startInputLoop(ws: WebSocket | null, player: "player1" | "player2" | null) {
	setInterval(async () => {
		if (!gameId) 
			return;
		if (!ws) 
			return;
		if (gameType === "multiplayer")
		{
			// Player 1 (arrow keys)
			if (keys["arrowup"]) {
				sendMove(ws, "up", "player2");
			}
			if (keys["arrowdown"]) {
				sendMove(ws, "down", "player2");
			}

			// Player 2 (W/S keys)
			if (keys["w"]) {
				sendMove(ws, "up", "player1");
			}
			if (keys["s"]) {
				sendMove(ws, "down", "player1");
			}
		}
		if (gameType === "room")
		{
			if (keys["arrowup"]) {
				sendMove(ws, "up", player);
			}
			if (keys["arrowdown"]) {
				sendMove(ws, "down", player);
			}

			// Player 2 (W/S keys)
			if (keys["w"]) {
				sendMove(ws, "up", player);
			}
			if (keys["s"]) {
				sendMove(ws, "down", player);
			}
		}
	}, 24); // ~60fps
	}

	function sendMove(socket: any, direction: "up" | "down", player: "player1" | "player2" | null) {
		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.send(JSON.stringify({
				type: "move",
				player,
				direction
			}));
		}
	}

	function drawScores(ctx: CanvasRenderingContext2D, scorePlayer1: number,scorePlayer2: number,
	canvasWidth: number,scoreboardHeight: number,
	player1Name: string | null, player2Name?: string | null) {
		if (!player1Name)
			player1Name = "Player 1";
		if (!player2Name)
			player2Name = "Player 2";
		const fontSize = 20;
		const boxPaddingX = 10;
		const boxPaddingY = 6;
		const avatarRadius = 20; // radius for profile circle
		const avatarMargin = 15; // spacing between avatar and box
		const radius = 6; // corner radius for box

		ctx.font = `${fontSize}px Arial`;
		ctx.textBaseline = "middle";

		// Compose text
		const text1 = `${player1Name}: ${scorePlayer1}`;
		const text2 = `${scorePlayer2} :${player2Name}`;
		const text1Width = ctx.measureText(text1).width;
		const text2Width = ctx.measureText(text2).width;

		const yCenter = scoreboardHeight / 2;

		// 🎯 Left Avatar (Player 1)
		const avatar1X = avatarMargin + avatarRadius;
		ctx.beginPath();
		ctx.arc(avatar1X, yCenter, avatarRadius, 0, Math.PI * 2);
		ctx.strokeStyle = "#94a3b8"; // slate border
		ctx.lineWidth = 3;
		ctx.stroke();
		ctx.closePath();

		ctx.save();
		ctx.beginPath();
		ctx.arc(avatar1X, yCenter, avatarRadius, 0, Math.PI * 2);
		ctx.closePath();
		ctx.clip();
		if (gameAvatars.player1)
			ctx.drawImage(gameAvatars.player1, avatar1X - avatarRadius, yCenter - avatarRadius, avatarRadius * 2, avatarRadius * 2);
		ctx.restore();

		// 🎯 Right Avatar (Player 2)
		const avatar2X = canvasWidth - avatarMargin - avatarRadius;
		ctx.beginPath();
		ctx.arc(avatar2X, yCenter, avatarRadius, 0, Math.PI * 2);
		ctx.strokeStyle = "#94a3b8";
		ctx.lineWidth = 3;
		ctx.stroke();
		ctx.closePath();

		ctx.save();
		ctx.beginPath();
		ctx.arc(avatar2X, yCenter, avatarRadius, 0, Math.PI * 2);
		ctx.closePath();
		ctx.clip();
		if (gameAvatars.player2)
			ctx.drawImage(gameAvatars.player2, avatar2X - avatarRadius, yCenter - avatarRadius, avatarRadius * 2, avatarRadius * 2);
		ctx.restore();

		// 🎁 Player 1 box (grows inward)
		const box1X = avatar1X + avatarRadius + avatarMargin; // right after avatar
		ctx.beginPath();
		ctx.roundRect(
			box1X,
			yCenter - fontSize / 2 - boxPaddingY,
			text1Width + boxPaddingX * 2,
			fontSize + boxPaddingY * 2,
			radius
		);
		ctx.fillStyle = "#00b0fc";
		ctx.fill();
		ctx.closePath();

		// 🎁 Player 2 box (grows inward)
		const box2X =
			avatar2X - avatarRadius - avatarMargin - (text2Width + boxPaddingX * 2);
		ctx.beginPath();
		ctx.roundRect(
			box2X,
			yCenter - fontSize / 2 - boxPaddingY,
			text2Width + boxPaddingX * 2,
			fontSize + boxPaddingY * 2,
			radius
		);
		ctx.fillStyle = "#f7363d";
		ctx.fill();
		ctx.closePath();

		// 📝 Draw Text
		ctx.fillStyle = "white";
		ctx.textAlign = "left";
		ctx.fillText(text1, box1X + boxPaddingX, yCenter);
		ctx.textAlign = "right";
		ctx.fillText(text2, box2X + text2Width + boxPaddingX, yCenter);
	}
	function draw(state: any, player1Name: string | null, player2Name?:string | null) {
		const scoreboardHeight = canvas.height * 0.1;
		const gameHeight = canvas.height - scoreboardHeight;

		// clear entire canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// 🎨 draw scoreboard background
		ctx.setLineDash([15, 5]);
		ctx.beginPath();
		ctx.strokeStyle = "white";
		ctx.moveTo(0, scoreboardHeight);
		ctx.lineTo(canvas.width, scoreboardHeight);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(0, scoreboardHeight + 1);
		ctx.lineTo(canvas.width, scoreboardHeight + 1);
		ctx.stroke();
		ctx.setLineDash([]);

		// ball position
		const ballX = (state.ball.x / 100) * canvas.width;
		const ballY = (state.ball.y / 100) * gameHeight + scoreboardHeight; 
		// add scoreboardHeight offset so ball sits below the score area

		if (state.state === "playing")
		{
			ctx.fillStyle = "white";
			ctx.beginPath();
			ctx.arc(ballX, ballY, 8, 0, Math.PI * 2);
			ctx.fill();
			ctx.closePath();
		}
		// 🕒 Draw countdown if ball is counting down
		if (state.ball.isCountingDown && state.state === "playing") {
			// Handle both server-calculated and client-calculated countdown
			let countdown = 0;
			if (typeof state.ball.getCountdownNumber === 'function') {
				countdown = state.ball.getCountdownNumber();
			} else if (state.ball.countdownTime) {
				countdown = Math.ceil(state.ball.countdownTime / 1000);
			}
			
			// Choose color based on which side ball will go
			let activeStrokeColor = "#d1a700"; // Default yellow stroke
			let activeFillColor = "#fcc800";   // Default yellow fill
			
			if (state.ball.side === 'left') {
				// Blue for Player 1 (left side)
				activeStrokeColor = "#0080ff";
				activeFillColor = "#00b0fc";
			} else if (state.ball.side === 'right') {
				// Red for Player 2 (right side)
				activeStrokeColor = "#cc0000";
				activeFillColor = "#f7363d";
			}
			
			for (let i = -40; i <= 40; i += 40)
			{
				let strokeColor = "#e5e4e2";
				let fillColor = "#ffffff"
				if ((i == -40 && countdown <= 3) || (i == 0 && countdown <= 2) || (i === 40 && countdown <= 1))
				{
					strokeColor = activeStrokeColor;
					fillColor = activeFillColor;
				}
				ctx.beginPath();
				ctx.arc((canvas.width / 2) + i, (gameHeight / 2) + scoreboardHeight, 10, 0, 2 * Math.PI);
				ctx.strokeStyle = strokeColor;
				ctx.fillStyle = fillColor;
				ctx.fill();
				ctx.lineWidth = 4;
				ctx.stroke();
			}
		}

		const paddlePixelWidth = (1.25 / 100) * canvas.width;
		const paddleX = (1 / 100) * canvas.width; // left paddle

		drawPaddle(ctx, state.player1, paddleX, "#00b0fc");
		drawPaddle(ctx, state.player2, canvas.width - paddlePixelWidth - paddleX, "#f7363d");

		drawScores(ctx, state.player1.score, state.player2.score, canvas.width, scoreboardHeight, player1Name, player2Name);

		// === helpers ===
		function drawPaddle(ctx: any, player: any, x: number, color: string) {
			const centerY = (player.paddle / 100) * gameHeight + scoreboardHeight;
			const halfHeight = (player.paddleLen / 100) * gameHeight;
			const topY = centerY - halfHeight;
			const height = halfHeight * 2;

			ctx.beginPath();
			ctx.roundRect(x, topY, paddlePixelWidth, height, 8);
			ctx.fillStyle = color;
			ctx.fill();
		}

	}
	return canvasWrap;
  }