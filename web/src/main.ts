import {Navbar} from "./pages/components/Navbar.js"
import {loadRoute} from "./scripts/router.js"



window.addEventListener("DOMContentLoaded", async () => {
     const frame = document.getElementById("frame")!;
	  // Log dimensions after appending
	const navbar = await Navbar(""); // Create the Navbar
  	frame.appendChild(navbar); // Append it to the DOM
  	const innerFrame = document.getElementById("inner-frame")!;
     loadRoute();
     window.addEventListener("hashchange", loadRoute);
});