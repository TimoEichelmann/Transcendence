import {Icon} from "./Icon.js"

export function Navbar(username: string | null): HTMLElement {
	const nav = document.createElement("div");
	nav.className = 
	`fixed top-0 left-0 h-screen w-18
	flex flex-col 
	items-center justify-between
	gap-6
	p-2
	bg-blue-300`;

	const topIcons = document.createElement("div");
	topIcons.className = "flex flex-col items-center gap-5 mt-4";
	
	const home = Icon("home", 30, "black");
	const play = Icon("play", 30, "black");
	const tournament = Icon("tournament", 30, "black");
	const settings = Icon("settings", 30, "black");

	topIcons.append(home, play, tournament, settings);

	const bottomIcons = document.createElement("div");
	bottomIcons.className = "flex flex-col items-center gap-6 mt-6";
	if (username) {
		bottomIcons.append(Icon("profile", 30, "black"), Icon("logout", 30, "red"));
	}
	else {
		bottomIcons.append(Icon("login", 30, "black"));
	}
	nav.append(topIcons, bottomIcons);
	return nav;
  }