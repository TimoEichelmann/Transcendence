export function Navbar(username: string | null): HTMLElement {
	const nav = document.createElement("nav");
	nav.className = "bg-gray-800 text-white p-4";
  
	const title = document.createElement("span");
	title.className = "font-bold";
	title.textContent = "My Game";
	nav.appendChild(title);
  
	if (username) {
	  const userSpan = document.createElement("span");
	  userSpan.className = "ml-4";
	  userSpan.textContent = `Hi, ${username}`;
	  nav.appendChild(userSpan);
	} else {
	  const loginLink = document.createElement("a");
	  loginLink.href = "#login";
	  loginLink.textContent = "Login";
	  nav.appendChild(loginLink);
	}
  
	return nav;
  }