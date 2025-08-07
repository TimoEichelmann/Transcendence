import {Navbar} from "./components/Navbar.js"

export function Tournament(username : string | null) : HTMLElement
{
	const div = document.createElement("div");
	const main = document.createElement("div"); 
	main.className = "ml-18 p-4";

	const input_name  = document.createElement("input");
	input_name.inputMode = "text";
	input_name.id = "tournamentName";
	input_name.value = "Name";

	const input_player  = document.createElement("input");
	input_player.inputMode = "text";	
	input_player.id = "maxPlayer";
	input_player.value = "max Player";

	main.append(input_name, input_player);
    return div;
}