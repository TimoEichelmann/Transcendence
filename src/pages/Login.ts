import { switchForm } from "../logic/switchForm.js";
import {Navbar} from "./components/Navbar.js"
import {loginForm} from "./components/loginForm.js"
import {registerForm} from "./components/registerForm.js"
export function Login(username : string | null) : HTMLElement
{
	const div = document.createElement("div");
	const main = document.createElement("div"); 
	main.className = "ml-18 p-4";


    const Switch = document.createElement("div");
    Switch.className = "flex gap-4 mb-4";
    const loginFormBtn = document.createElement("button");
    loginFormBtn.className = "px-4 py-2 bg-blue-500 text-white rounded";
    loginFormBtn.textContent = "Login";
	loginFormBtn.id = "login";
    const registerFormBtn = document.createElement("button");
    registerFormBtn.className = "px-4 py-2 bg-gray-200 text-black rounded";
    registerFormBtn.textContent = "Register";
	registerFormBtn.id=  "register";
	loginFormBtn.addEventListener("click", () => switchForm("login"));
	registerFormBtn.addEventListener("click", () => switchForm("register"));
    Switch.append(loginFormBtn, registerFormBtn);
	const loginform = loginForm(username);
	const registerform = registerForm(username);
    main.append(Switch, loginFormBtn, registerFormBtn, loginform, registerform);
    div.appendChild(main);
	return div;
}


