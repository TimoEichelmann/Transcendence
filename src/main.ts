import {Home} from "./pages/Home.js"
import {Login} from "./pages/Login.js"
import {Logout} from "./pages/Logout.js"
import {Navbar} from "./pages/components/Navbar.js"
import {Tournament} from "./pages/Tournament.js"
import {Settings} from "./pages/Settings.js"
//import {Register} from "./pages/Register.js"

const routes: Record<string, (username: string | null) => HTMLElement> = {
    "#home": Home,
    "#login": Login,
    "#logout": Logout,
    "#tournament": Tournament,
    "#settings": Settings
};


const app = document.getElementById("app")!;
const navbar = document.getElementById("navbar")!;

function loadRoute() {
    const path = location.hash || "#home";
    console.log(path);
    const pageFn = routes[path];
    app.innerHTML = ""; // clear old content
    app.appendChild(pageFn(""));
    highlightActiveIcon();
}

function highlightActiveIcon() {
  const current = location.hash || "#home";
  const navLinks = document.querySelectorAll('nav a');

  navLinks.forEach((link) => {
    const wrapper = link.querySelector(".wrapper");
    console.log("Found wrapper: ", wrapper);
    if ((link as HTMLElement).dataset.route === current) {
         wrapper?.classList.add("bg-amber-800");
         wrapper?.classList.add("rounded-xl");
         wrapper?.classList.add("inset-shadow-sm");
         wrapper?.classList.add("inset-shadow-blue-900");
         wrapper?.classList.remove("bg-amber-300");
         wrapper?.classList.remove("shadow-lg");
         wrapper?.classList.remove("shadow-blue-600");
         wrapper?.classList.remove("rounded-3xl")
    } else {
         wrapper?.classList.remove("bg-amber-800") ;
         wrapper?.classList.remove("rounded-xl");
         wrapper?.classList.remove("inset-shadow-sm");
         wrapper?.classList.remove("inset-shadow-blue-900");
         wrapper?.classList.add("bg-amber-300");
         wrapper?.classList.add("shadow-lg");
         wrapper?.classList.add("shadow-blue-600");
         wrapper?.classList.add("rounded-3xl")
    }
  });
}


window.addEventListener("hashchange", loadRoute);
window.addEventListener("DOMContentLoaded", () => {
     navbar.appendChild(Navbar("")); // Only once
     loadRoute();
});