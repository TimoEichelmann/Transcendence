
//These are the SVGs for the icons, change second string to change appearence
const iconPaths: Record<string, string> = {
//   "arrow-left": "M15 18l-6-6 6-6",
//   "arrow-right": "M9 6l6 6-6 6",
//   "check": "M5 13l4 4L19 7",
//   "x": "M6 18L18 6M6 6l12 12",
  "settings": "M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75",
  "home": "m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25",
  "login": "M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z",
  "profile": "M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z",
  "logout": "m11.25 9-3 3m0 0 3 3m-3-3h7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  "play": "M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z",
  "tournament": "M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0",
};

//These are the tooltip mesaages
const toolTips: Record<string, string> = {
  "settings": "Settings",
  "home": "Home",
  "login": "Login",
  "profile": "Profile",
  "logout": "Log out",
  "play": "Start a game",
  "tournament": "Create a Tournament"
};

export function Icon(name: keyof typeof iconPaths, size = 24, color = "currentColor"): HTMLElement {
  const wrapper = document.createElement("div");
  const navbar = document.createElement("div");
  const hashlink = document.createElement("a");
  const tooltip = document.createElement("div");
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");

  hashlink.href = "#" + name;
  hashlink.dataset.route = "#" + name;
  navbar.className = `wrapper relative group w-14 h-14 
                    bg-yellow-400 hover:bg-orange-400
                      rounded-3xl hover:rounded-xl
                      transition-all duration-300
                      flex items-center justify-center
                    shadow-lg shadow-purple-950`;
  tooltip.textContent = toolTips[name];
  tooltip.className = `absolute left-full ml-2
                      pointer-events-none
                      group-hover:opacity-100 
                      rounded-md shadow-md
                      px-3 py-1 whitespace-nowrap
                      text-white bg-gray-900
                      text-xs font-bold
                      transition-all duration-500 origin-left opacity-0`
  svg.setAttribute("width", size.toString());
  svg.setAttribute("height", size.toString());
  svg.setAttribute("fill", color);
  svg.setAttribute("viewBox", "0 0 24 24");

  const path = document.createElementNS(svgNS, "path");
  path.setAttribute("d", iconPaths[name]);
  path.setAttribute("stroke", color);
  path.setAttribute("stroke-width", "1.5");
  path.setAttribute("fill", "none");

  svg.appendChild(path);
  navbar.appendChild(svg);
  navbar.appendChild(tooltip);
  hashlink.appendChild(navbar);
  return hashlink;
}