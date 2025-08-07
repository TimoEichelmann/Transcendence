export function Home(username) {
    const div = document.createElement("div");
    const main = document.createElement("div");
    main.className = "ml-18 p-4";
    const title = document.createElement("h1");
    title.className = "bg-blue-500 text-white p-5 rounded text-center font-extrabold text";
    title.textContent = "Welcome to 42 Transcendence!";
    main.appendChild(title);
    const description = document.createElement("p");
    description.className = "mb-5 text-center";
    description.textContent = "Compete in tournaments, play matches, and climb the leaderboard!";
    main.appendChild(description);
    const startButton = document.createElement("button");
    startButton.className = "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600";
    startButton.textContent = "Create Tournament";
    startButton.onclick = () => {
        alert("Go to tournament creation page!");
    };
    main.appendChild(startButton);
    div.appendChild(main);
    return div;
}
