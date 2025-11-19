import {Icon} from "./Icon.js"
import {updateNavbar} from "../../scripts/router.js"
import {JwtExpired} from "../../scripts/jwtExpired.js"

export async function Navbar(username: string | null) : Promise<HTMLElement>{
	const nav = document.createElement("div");
	const frame = document.createElement("div");
	const app = document.createElement("div");
	nav.className = 
	`fixed top-0 left-0 h-full w-18 z-30
	flex flex-col 
	items-center justify-between
	gap-6
	p-2
	ml-1
	bg-slate-700`;
	nav.id = "navbar";
	app.id = "app";
	frame.className = "flex h-full w-full bg-slate-700 p-6 z-30";
	frame.id = "inner-frame";
	frame.style.height = "100%";
	frame.style.width = "100%";

	app.className = "overflow-y-auto no-scrollbar border-4 border-slate-900 box-border [box-shadow:inset_0_0_30px_rgba(0,0,0,0.9)] flex-1 h-full w-full ml-14  bg-black rounded-[2rem] overflow-auto";
	const topIcons = document.createElement("div");
	topIcons.className = "flex flex-col items-center gap-5 mt-4";
	topIcons.id = "topIcons";
	

	const home = Icon("home", 30, "black");
	const play = Icon("play", 30, "black");
	const tournament = Icon("tournament", 30, "black");
	const friends = Icon("friends", 30, "black");


	topIcons.append(home, play, tournament);

	const bottomIcons = document.createElement("div");
	bottomIcons.id = "bottomIcons";
	bottomIcons.className = "flex flex-col items-center gap-6 mb-6";
    const jwt = await JwtExpired(localStorage.getItem("jwtToken"));
    if (!jwt) {
		const logoutBtn = Icon("logout", 30, "red");
		logoutBtn.addEventListener("click", logout);
		bottomIcons.append(Icon("profile", 30, "black"), logoutBtn);
		topIcons.append(friends);
	}
	else {
		bottomIcons.append(Icon("login", 30, "black"));
	}
	nav.append(topIcons, bottomIcons);
	frame.append(nav, app);
	return frame;
  }

  export function logout()
  {
	localStorage.clear();
	updateNavbar();
  }