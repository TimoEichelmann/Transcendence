import { showDashboard } from "../scripts/home.js";
import {Navbar} from "./components/Navbar.js"

export function Home(username : string | null) : HTMLElement
{
	const div = document.createElement("div");

	div.className = "z-10 h-full bg-black p-8 overflow-y-auto no-scrollbar text-center text-white space-y-14 ";
	div.style.scrollbarWidth = "none";
	const title = document.createElement("h1");
	title.className = "text-white text-4xl p-5 rounded text-center font-extrabold text";
	title.textContent = "Welcome to 42 Transcendence!";

	const introduction = document.createElement("p");
	introduction.className = "text-xl text-white p-5 rounded text-center";
	introduction.innerText = `This is the final Project of the 42 Software Academy.
	It combines the knowledge of basic development and networking with modern web technologies and gives freedom to create and choose from features the students are interested in.
	The concept is based on the original Pong Game from the 70s, but with a modern twist and many additional features. So hop on and have fun!`;

	const major = "Major";
	const minor = "Minor";
	const modulesTitle = document.createElement("p");
	modulesTitle.className = "text-xl text-white p-5 rounded text-center";
	modulesTitle.innerHTML = `The project modules we chose to implement are the following, divided into <span class="text-yellow-400">${major}</span> and <span class="text-yellow-200">${minor}</span> modules:`;
	const table = document.createElement("table");
	table.className =
		"min-w-[80%] border border-black border-collapse text-white text-center rounded-lg overflow-hidden shadow-lg mx-auto";

	const thead = document.createElement("thead");
	thead.innerHTML = `
		<tr class="bg-gray-700">
			<th class="border border-black px-4 py-2 text-lg font-semibold">Module</th>
			<th class="border border-black px-4 py-2 text-lg font-semibold">Description</th>
		</tr>
	`;

	const tbody = document.createElement("tbody");

	const modules = [
		{
			id: "Using a Framework for the Backend",
			desc: "The Backend is built with NodeJS and Fastify integrating the WebSocket protocol.",
			color: "bg-yellow-400",
		},
		{
			id: "Using a Framework for the Frontend",
			desc: "The Frontend is built using TypeScript and TailwindCSS to generate a SinglePageApplication.",
			color: "bg-yellow-200",
		},
		{
			id: "Server-Side Pong",
			desc: "To make the game run smoother the Backend provides the Game Loop and holds all the logic.",
			color: "bg-yellow-400",
		},
		{
			id: "AI Opponent",
			desc: "Expands the Game by the Singleplayer Game Mode in which you can choose from 3 difficulty Levels for an AI Opponent.",
			color: "bg-yellow-400",
		},
		{
			id: "Database Integration",
			desc: "To save User data the Backend integrates a SQLite Database.",
			color: "bg-yellow-200",
		},
		{
			id: "2FactorAuthentication and JWT Tokens",
			desc: "For Security Purposes the login uses the Google Authentication System and JWT Tokens for session management.",
			color: "bg-yellow-400",
		},
		{
			id: "Remote Players",
			desc: "Integrates the possibility to play against other users on the same network.",
			color: "bg-yellow-400",
		},
		{
			id: "User Management",
			desc: "Users can create an account, login, change their username and avatar and see their stats.",
			color: "bg-yellow-400",
		},
	];

	modules.forEach((mod) => {
		const row = document.createElement("tr");
		row.className = "hover:bg-gray-600 transition-colors";

		row.innerHTML = `
			<td class="border text-black border-black px-4 ${mod.color} py-2">${mod.id}</td>
			<td class="border text-black border-black px-4 ${mod.color} py-2">${mod.desc}</td>
			`;

		tbody.appendChild(row);
	});

	table.append(thead, tbody);



	div.append(title, introduction, modulesTitle, table);
	setTimeout(() => {
		showDashboard();
	}, 0);

	return div;
}