import {Tournament} from "../pages/Tournament.js"
import {Friends} from "../pages/Friends.js"
import {Home} from "../pages/Home.js"
import {Login} from "../pages/Login.js"
import {Game, leaveGamePage} from "../pages/Game.js"
import {Icon} from "../pages/components/Icon.js"
import {logout} from "../pages/components/Navbar.js"
import { Profile } from "../pages/Profile.js"
import { Tournamentdetail } from "../pages/Tournamentdetail.js"
import { setData } from "./tournamentdetails.js"
import { Gamedetail } from "../pages/Gamedetail.js"
import {JwtExpired} from "./jwtExpired.js"


const routes: Record<string, (username: string | null) => HTMLElement> = {
    "#home": Home,
    "#login": Login,
    "#logout": Home,
    "#tournament": Tournament,
    "#friends": Friends,
	  "#play": Game,
    "#profile": Profile,
    "#tournamentdetail": Tournamentdetail,
    "#gamedetail": Gamedetail,
};




let previousPath: string | null = null;

export async function loadRoute() {
  const app = document.getElementById("app")!;
    const path = location.hash || "#home";
    if (previousPath === "#play")
      leaveGamePage();
  
    app.innerHTML = ""; // clear old content

    const [route, ...params] = path.split("/");

    //const route_param = ;
    const pageFn = routes[route];

    if (pageFn) {
      app.appendChild(pageFn(params[0] || null)); // Übergib erste Param (z. B. Turnier-ID)
    } else {
      app.appendChild(Home(null)); // Fallback
    }
    previousPath = path;
    updateNavbar();
}

    export async function updateNavbar() {
      const bottomIcons = document.getElementById("bottomIcons")!;
      const topIcons = document.getElementById("topIcons")!;
      const friends = document.getElementById("friendsIcon");
      if (friends)
        topIcons.removeChild(friends);
      bottomIcons.innerHTML = "";
      const jwt = await JwtExpired(localStorage.getItem("jwtToken"));
      if (!jwt)
      {
          const logoutBtn = Icon("logout", 30, "red");
          logoutBtn.addEventListener("click", logout);
          bottomIcons.append(Icon("profile", 30, "black"), logoutBtn);
          topIcons.append(Icon("friends", 30, "black"));
      }
      else {
        bottomIcons.append(Icon("login", 30, "black"));
      }
      highlightActiveIcon();
    }

async function highlightActiveIcon() {
  let current = location.hash || "#home";
  if (current === "#logout")
  {
    current = "#home";
  }
  const navLinks = document.querySelectorAll('div a');
  navLinks.forEach((link) => {
    const wrapper = link.querySelector(".wrapper");
    if ((link as HTMLElement).dataset.route === current) {
         wrapper?.classList.add("bg-yellow-200");
         wrapper?.classList.add("rounded-xl");
         wrapper?.classList.add("inset-shadow-sm");
         wrapper?.classList.add("inset-shadow-yellow-900");
         wrapper?.classList.remove("bg-yellow-400");
         wrapper?.classList.remove("shadow-lg");
         wrapper?.classList.remove("shadow-purple-950");
         wrapper?.classList.remove("rounded-3xl")
    } else {
         wrapper?.classList.remove("bg-yellow-200") ;
         wrapper?.classList.remove("rounded-xl");
         wrapper?.classList.remove("inset-shadow-sm");
         wrapper?.classList.remove("inset-shadow-yellow-900");
         wrapper?.classList.add("bg-yellow-400");
         wrapper?.classList.add("shadow-lg");
         wrapper?.classList.add("shadow-purple-950");
         wrapper?.classList.add("rounded-3xl")
    }
  });
}