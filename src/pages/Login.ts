import {Navbar} from "./components/Navbar.js"

export function Login(username : string | null) : HTMLElement
{
	const div = document.createElement("div");
	const main = document.createElement("div"); 
	main.className = "ml-18 p-4";


    const Switch = document.createElement("div");
    Switch.className = "flex gap-4 mb-4";
    const loginForm = document.createElement("button");
    loginForm.className = "px-4 py-2 bg-blue-500 text-white rounded";
    loginForm.textContent = "Login";
    const registerForm = document.createElement("button");
    registerForm.className = "px-4 py-2 bg-gray-200 text-black rounded";
    registerForm.textContent = "Register";

    Switch.append(loginForm, registerForm);
    main.append(Switch, Form);
    div.appendChild(main);
	return div;
}


