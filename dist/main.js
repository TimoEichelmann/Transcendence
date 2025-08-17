import { Home } from "./pages/Home.js";
import { Login } from "./pages/Login.js";
import { Logout } from "./pages/Logout.js";
import { Navbar } from "./pages/components/Navbar.js";
import { Tournament } from "./pages/Tournament.js";
import { Settings } from "./pages/Settings.js";
//import {Register} from "./pages/Register.js"
const routes = {
    "#home": Home,
    "#login": Login,
    "#logout": Logout,
    "#tournament": Tournament,
    "#settings": Settings
};
const frame = document.getElementById("frame");
frame.appendChild(Navbar("")); // Only once
const navbar = document.getElementById("navbar");
const app = document.getElementById("app");
function loadRoute() {
    const path = location.hash || "#home";
    const pageFn = routes[path];
    app.innerHTML = ""; // clear old content
    app.appendChild(pageFn(""));
    highlightActiveIcon();
}
function highlightActiveIcon() {
    const current = location.hash || "#home";
    const navLinks = document.querySelectorAll('div a');
    navLinks.forEach((link) => {
        const wrapper = link.querySelector(".wrapper");
        console.log("Found wrapper: ", wrapper);
        if (link.dataset.route === current) {
            wrapper === null || wrapper === void 0 ? void 0 : wrapper.classList.add("bg-yellow-200");
            wrapper === null || wrapper === void 0 ? void 0 : wrapper.classList.add("rounded-xl");
            wrapper === null || wrapper === void 0 ? void 0 : wrapper.classList.add("inset-shadow-sm");
            wrapper === null || wrapper === void 0 ? void 0 : wrapper.classList.add("inset-shadow-yellow-900");
            wrapper === null || wrapper === void 0 ? void 0 : wrapper.classList.remove("bg-yellow-400");
            wrapper === null || wrapper === void 0 ? void 0 : wrapper.classList.remove("shadow-lg");
            wrapper === null || wrapper === void 0 ? void 0 : wrapper.classList.remove("shadow-purple-950");
            wrapper === null || wrapper === void 0 ? void 0 : wrapper.classList.remove("rounded-3xl");
        }
        else {
            wrapper === null || wrapper === void 0 ? void 0 : wrapper.classList.remove("bg-yellow-200");
            wrapper === null || wrapper === void 0 ? void 0 : wrapper.classList.remove("rounded-xl");
            wrapper === null || wrapper === void 0 ? void 0 : wrapper.classList.remove("inset-shadow-sm");
            wrapper === null || wrapper === void 0 ? void 0 : wrapper.classList.remove("inset-shadow-yellow-900");
            wrapper === null || wrapper === void 0 ? void 0 : wrapper.classList.add("bg-yellow-400");
            wrapper === null || wrapper === void 0 ? void 0 : wrapper.classList.add("shadow-lg");
            wrapper === null || wrapper === void 0 ? void 0 : wrapper.classList.add("shadow-purple-950");
            wrapper === null || wrapper === void 0 ? void 0 : wrapper.classList.add("rounded-3xl");
        }
    });
}
window.addEventListener("hashchange", loadRoute);
window.addEventListener("DOMContentLoaded", () => {
    loadRoute();
});
