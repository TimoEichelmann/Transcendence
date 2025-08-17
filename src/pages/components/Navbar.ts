import {Icon} from "./Icon.js"

export function Navbar(username: string | null): HTMLElement {
	const nav = document.createElement("div");
	const frame = document.createElement("div");
	const app = document.createElement("div");
	nav.className = 
	`fixed top-0 left-0 h-screen w-18
	flex flex-col 
	items-center justify-between
	gap-6
	p-2
	ml-1
	bg-purple-700`;
	nav.id = "navbar";
	app.id = "app";
	frame.className = "flex h-screen w-screen bg-purple-700 p-6 z-0";
	app.className = "border-4 border-purple-900 [box-shadow:inset_0_0_30px_rgba(0,0,0,0.9)] flex-1 h-full w-full ml-14  bg-gradient-to-b from-purple-400 to-purple-200 rounded-[2rem] overflow-auto";
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
	frame.append(nav, app);
	return frame;
  }