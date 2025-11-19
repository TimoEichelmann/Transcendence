

export function switchForm(to: "login" | "register") {
	const loginBtn = document.getElementById("login")
	const registerBtn = document.getElementById("register")
	const loginForm = document.getElementById("loginForm");
	const registerForm = document.getElementById("registerForm");
	if (to === "login")
	{	
		registerForm?.classList.add("hidden");
		loginForm?.classList.remove("hidden");
		registerBtn?.classList.remove("bg-yellow-400");
		registerBtn?.classList.add("bg-gray-200");
		loginBtn?.classList.remove("bg-gray-200");
		loginBtn?.classList.add("bg-yellow-400");
	}
	else
	{
		registerForm?.classList.remove("hidden");
		loginForm?.classList.add("hidden");
		registerBtn?.classList.remove("bg-gray-200");
		registerBtn?.classList.add("bg-yellow-400");
		loginBtn?.classList.remove("bg-yellow-400");
		loginBtn?.classList.add("bg-gray-200");
	}
}