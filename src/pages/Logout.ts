import {Navbar} from "./components/Navbar.js"

export function Logout(username : string | null) : HTMLElement
{
	const div = document.createElement("div");
	const main = document.createElement("div"); 
	main.className = "ml-18 p-4";


    const Title = document.createElement("h1");
    Title.textContent = "Logout?";
    Title.className = "text-3xl font-bold";

    const Logout = document.createElement("button");
    Logout.id = "logoutBtn";
    Logout.textContent = "Logout";

    main.append(Title, Logout);
    div.appendChild(main);
	return div;
}