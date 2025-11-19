import { switchForm } from "../scripts/switchForm.js";
import { Navbar } from "./components/Navbar.js"
import { loginForm } from "./components/loginForm.js"
import { registerForm } from "./components/registerForm.js"

export function Login(username : string | null) : HTMLElement
{
    const main = document.createElement("div"); 
	main.className = "flex flex-col min-h-full items-center justify-center";

    const Switch = document.createElement("div");
    Switch.className = "flex gap-4 my-4";

    const loginFormBtn = document.createElement("button");
    loginFormBtn.className = "px-4 py-2 bg-yellow-400 text-black rounded";
    loginFormBtn.textContent = "Login";
	loginFormBtn.id = "login";
    loginFormBtn.addEventListener("click", () => switchForm("login"));

    const registerFormBtn = document.createElement("button");
    registerFormBtn.className = "px-4 py-2 bg-gray-200 text-black rounded";
    registerFormBtn.textContent = "Register";
	registerFormBtn.id=  "register";
	registerFormBtn.addEventListener("click", () => switchForm("register"));
    
    Switch.append(loginFormBtn, registerFormBtn);

	const loginform = loginForm(username);
	const registerform = registerForm(username);
    main.append(Switch, loginform, registerform);
	return main;
}


