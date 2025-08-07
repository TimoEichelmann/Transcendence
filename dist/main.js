import { Home } from "./pages/Home.js";
const app = document.getElementById("app");
app.innerHTML = ""; // clear old content
app.appendChild(Home("Timo"));
