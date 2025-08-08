

export function switchForm(to: "login" | "register") {
	const loginBtn = document.getElementById("login")
	const registerBtn = document.getElementById("register")
	const loginForm = document.getElementById("loginForm");
	const registerForm = document.getElementById("registerForm");
	if (to === "login")
	{	
		registerForm?.classList.add("hidden");
		loginForm?.classList.remove("hidden");
		registerBtn?.classList.remove("bg-blue-500", "text-white");
		registerBtn?.classList.add("bg-gray-200", "text-black");
		loginBtn?.classList.remove("bg-gray-200", "text-black");
		loginBtn?.classList.add("bg-blue-500", "text-white");
	}
	else
	{
		registerForm?.classList.remove("hidden");
		loginForm?.classList.add("hidden");
		registerBtn?.classList.remove("bg-gray-200", "text-black");
		registerBtn?.classList.add("bg-blue-500", "text-white");
		loginBtn?.classList.remove("bg-blue-500", "text-white");
		loginBtn?.classList.add("bg-gray-200", "text-black");
	}
}