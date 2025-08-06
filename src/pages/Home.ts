import {Navbar} from "./components/Navbar"

export function Home(username : string | null) : HTMLElement
{
	const div = document.createElement("div");
	const navbar = Navbar(username);
	div.appendChild(navbar);
	
	const main = document.createElement("main"); 
	main.className = "p-4";

	const title = document.createElement("h1");
	title.className = "text-2xl font-bold mb-4";
	title.textContent = "Welcome to the Tournament Game!";
	main.appendChild(title);

	const description = document.createElement("p");
	description.className = "mb-4";
	description.textContent = "Compete in tournaments, play matches, and climb the leaderboard!";
	main.appendChild(description);

	const startButton = document.createElement("button");
	startButton.className = "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600";
	startButton.textContent = "Create Tournament";
	startButton.onclick = () => {
	  alert("Go to tournament creation page!");
	};
	main.appendChild(startButton);

	div.appendChild(main);

	return div;
}