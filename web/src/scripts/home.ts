import {loadRoute} from "./router.js"

const API_BASE = `${window.location.origin}/api`;
declare const Chart: any;

export async function showDashboard() {
    try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch(`${API_BASE}/players/isauthanticated`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const resdata = await response.json();
        if (resdata.success == true) {
            setDashboard();
        }
        
    } catch (error) {
        console.log(error);
    }
}

function setDashboard(){
    const app = document.getElementById("app") as HTMLElement;
    app.innerHTML = "";
    const main = document.createElement("div");
	main.className = "flex flex-col gap-3 px-5 mb-5";

	const title = document.createElement("h1");
	title.className = "text-3xl font-bold text-center mt-5 text-white";
	title.innerText = "Dashboard";
	main.appendChild(title);

	const matchesContainer = document.createElement("div");
	matchesContainer.className = "flex gap-3";

	const gamesPlayedContainer = document.createElement("div");
	gamesPlayedContainer.className = "flex flex-col bg-btnbgselected rounded-2xl w-full py-5 gap-3";
	const gamesPlayedTitle = document.createElement("h1");
	gamesPlayedTitle.className = "text-2xl text-center";
	gamesPlayedTitle.innerText = "Matches";
	gamesPlayedContainer.appendChild(gamesPlayedTitle);
	const totalCount = document.createElement("h1");
	totalCount.className = "text-xl text-center";
	totalCount.innerText = "Total matches played: 0";
	totalCount.id = "matches-count";
	gamesPlayedContainer.appendChild(totalCount);
	const chartCanvas = document.createElement("canvas");
    chartCanvas.id = "winlossChart";
    chartCanvas.className = "mx-auto w-[250px] h-[250px]";
	gamesPlayedContainer.appendChild(chartCanvas);
	matchesContainer.appendChild(gamesPlayedContainer);

	const profileContainer = document.createElement("div");
	profileContainer.className = "flex flex-col bg-btnbgselected rounded-2xl w-full py-5 gap-3 justify-center items-center";
	const profileTitle = document.createElement("h1");
	profileTitle.className = "text-2xl text-center";
	profileTitle.id = "display-name";
	profileContainer.appendChild(profileTitle);
	const profileImage = document.createElement("img");
	profileImage.className = "w-[250px] h-[250px] border-4 border-slate-700 rounded-full";
	profileImage.id = "profile-image";
	profileContainer.appendChild(profileImage);
	matchesContainer.appendChild(profileContainer);

	const tournamentCotainer = document.createElement("div");
	tournamentCotainer.className = "flex flex-col rounded-2xl bg-btnbgselected w-full py-5 gap-3";
	const tournamentTitle = document.createElement("h1");
	tournamentTitle.className = "text-2xl text-center";
	tournamentTitle.innerText = "Tournaments";
	tournamentCotainer.appendChild(tournamentTitle);
	const tournamentCount = document.createElement("h1");
	tournamentCount.className = "text-xl text-center";
	tournamentCount.innerText = "Total tournaments played: 0";
	tournamentCount.id = "tournament-count";
	tournamentCotainer.appendChild(tournamentCount);
	const tournamentCanvas = document.createElement("canvas");
    tournamentCanvas.id = "tournamentChart";
    tournamentCanvas.className = "mx-auto w-[250px] h-[250px]";
	tournamentCotainer.appendChild(tournamentCanvas);
	matchesContainer.appendChild(tournamentCotainer);
	main.appendChild(matchesContainer);

	const rankContainer = document.createElement("div");
	rankContainer.className = "flex flex-col w-full bg-btnbgselected rounded-2xl py-5 px-5";
	const rankTitle = document.createElement("h1");
	rankTitle.className = "text-2xl text-center mb-2";
	rankTitle.innerText = "Rank Points over Time";
	rankContainer.appendChild(rankTitle);

	const rankCanvasWrapper = document.createElement("div");
	rankCanvasWrapper.className = "relative w-full h-[300px]"; 

	const rankCanvas = document.createElement("canvas");
	rankCanvas.id = "rankChart";
	rankCanvas.className = "w-full h-full"; 
	rankCanvasWrapper.appendChild(rankCanvas);
	rankContainer.appendChild(rankCanvasWrapper);
	main.appendChild(rankContainer);

	const gamesContainer = document.createElement("div");
	gamesContainer.className = "flex gap-3";

	const upcomingGamesContainer = document.createElement("div");
	upcomingGamesContainer.className = "flex flex-col w-full gap-3 p-5 bg-btnbgselected rounded-2xl";
	upcomingGamesContainer.id = "upcoming-games";
	gamesContainer.appendChild(upcomingGamesContainer);

	const playedGamesContainer = document.createElement("div");
	playedGamesContainer.className = "flex flex-col w-full gap-3 p-5 bg-btnbgselected rounded-2xl";
	playedGamesContainer.id = "played-games";
	gamesContainer.appendChild(playedGamesContainer);
	main.appendChild(gamesContainer);

    app.appendChild(main);
    getStats();
	// setTimeout(() => {
	// 	getStats();
	// }, 0);
}

async function getStats() {
    const matchesCount = document.getElementById("matches-count") as HTMLElement;
    const displayName = document.getElementById("display-name") as HTMLElement;
    const tournamentCount = document.getElementById("tournament-count") as HTMLElement;
    
    try {
        const jwt = localStorage.getItem('jwtToken');
        const response = await fetch(`${API_BASE}/players/playerstats`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${jwt}`
            }
        });
        const data = await response.json();
        matchesCount.innerText = "Total matches played: " + data.totalGames;
        displayName.innerText = data.displayName;
        tournamentCount.innerText = "Total tournaments played: " + data.totalTournaments;

        setUpWinlossChart(data);
        setUpProfileImg(data);
        setupTournamentChart(data);
        setUpRankpointsChart(data);
        setUpGamesContainers(data);


    } catch (error) {
        console.error('Error on fetch:', error);
    }
}

function setUpWinlossChart(data: any){
    const winlossCanvas = document.getElementById("winlossChart") as HTMLCanvasElement;
    const ctx = winlossCanvas.getContext("2d");
    new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Wins", "Losses"],
            datasets: [{
                label: "Match Results",
                data: [data.wonGames, data.totalGames - data.wonGames], // Beispielwerte
                backgroundColor: ["#4ade80", "#f87171"], // Grün / Rot
                borderColor: "#ffffff",
                borderWidth: 2
            }]
        },
        options: {
            plugins: {
                legend: {
                    display: true,
                    labels: { color: "#000" } // Schriftfarbe im Chart
                }
            }
        }
    });
}

function setUpProfileImg(data: any){
    const image = document.getElementById("profile-image") as HTMLImageElement;
    if (data.image){
        image.src = data.image;
    }
}

function setupTournamentChart(data: any){
    const tournamentCanvas = document.getElementById("tournamentChart") as HTMLCanvasElement;
    const ctx3 = tournamentCanvas.getContext("2d");
    new Chart(ctx3, {
        type: "doughnut",
        data: {
            labels: ["1st place", "Other"],
            datasets: [{
                label: "Match Results",
                data: [data.wonTournaments, data.totalTournaments - data.wonTournaments],
                backgroundColor: ["#4ade80", "#f87171"],
                borderColor: "#ffffff",
                borderWidth: 2
            }]
        },
        options: {
            plugins: {
                legend: {
                    display: true,
                    labels: { color: "#000" }
                }
            }
        }
    });
}

function setUpRankpointsChart(data:any) {
    const rankCanvas = document.getElementById("rankChart") as HTMLCanvasElement;
    const ctx = rankCanvas.getContext("2d");
    new Chart(ctx, {
        type: "line",
        data: {
            labels: data.rankLabels,
            datasets: [{
                label: "Rank Points",
                data: data.rankData,
                borderColor: "#4ade80",
                backgroundColor: "rgba(74, 222, 128, 0.3)",
                tension: 0.3, // smoother line
                fill: true,
                pointRadius: 5,
                pointBackgroundColor: "#4ade80",
                pointBorderColor: "#fff",
                borderWidth: 2,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    ticks: { color: "#000" },
                    grid: { color: "rgba(255,255,255,0.2)" },
                },
                y: {
                    beginAtZero: false,
                    ticks: { color: "#000" },
                    grid: { color: "rgba(255,255,255,0.2)" },
                }
            },
            plugins: {
                legend: {
                    labels: { color: "#000" },
                },
            },
        },
    });
}

function setUpGamesContainers(data:any) {
    const upcomingContainer = document.getElementById("upcoming-games") as HTMLElement;
    const playedContainer = document.getElementById("played-games") as HTMLElement;

    const upcomingLabel = document.createElement("h1");
    upcomingLabel.className = "text-center text-2xl";
    upcomingLabel.innerText = "Upcoming matches";
    upcomingContainer.appendChild(upcomingLabel);

    const finishedLabel = document.createElement("h1");
    finishedLabel.className = "text-center text-2xl";
    finishedLabel.innerText = "Finished matches";
    playedContainer.appendChild(finishedLabel);

    data.games.forEach((element:any) => {
        const card = document.createElement("div");
        card.className = "flex flex-col border-3 border-black rounded-2xl py-5 gap-3 hover:cursor-pointer";

        const dateLabel = document.createElement("h1");
        dateLabel.className = "w-full text-center";
        dateLabel.innerText = element.game_date;
        card.appendChild(dateLabel);

        const vsRow = document.createElement("div");
        vsRow.className = "flex gap-3 items-center";

        const p1Label = document.createElement("h1");
        p1Label.className = "text-2xl text-center w-full";
        p1Label.innerText = element.p1_name;
        vsRow.appendChild(p1Label);

        if (element.winner != null) {
            const p1Score = document.createElement("h1");
            p1Score.className = "text-2xl text-center";
            p1Score.innerText = element.p1_points;
            vsRow.appendChild(p1Score);
        }

        const vsImage = document.createElement("img");
        vsImage.className = "h-[100px] w-[100px]";
        vsImage.src = "/profile-images/vs.png";
        vsRow.appendChild(vsImage);

        if (element.winner != null) {
            const p2Score = document.createElement("h1");
            p2Score.className = "text-2xl text-center";
            p2Score.innerText = element.p2_points;
            vsRow.appendChild(p2Score);
        }

        const p2Label = document.createElement("h1");
        p2Label.className = "text-2xl text-center w-full";
        if (element.p2_name == null) {
            p2Label.innerText = "TBD";
        }
        else{
            p2Label.innerText = element.p2_name;
        }
        vsRow.appendChild(p2Label);

        card.appendChild(vsRow);

        if (element.t_key != null) {
            const tournamentNameLabel = document.createElement("h1");
            tournamentNameLabel.className = "w-full text-center";
            tournamentNameLabel.innerText = element.tournament_name;
            card.appendChild(tournamentNameLabel);
        }

        const gameInfoBtn = document.createElement("div");
        gameInfoBtn.className = "flex px-4 py-2 rounded-2xl cursor-pointer text-black-500 bg-btnbg hover:bg-btnbghover justify-center mx-5";
        gameInfoBtn.innerText = "Game Info";
        gameInfoBtn.addEventListener("click", () => {
            window.location.hash = `#gamedetail/${element.g_id}`;
        });
        card.appendChild(gameInfoBtn);

        if (element.winner == null) {
            if (element.p2_name != null) {
                const startGameBtn = document.createElement("div");
                startGameBtn.className = "flex px-4 py-2 rounded-2xl cursor-pointer text-black-500 bg-btnbg hover:bg-btnbghover justify-center mx-5";
                startGameBtn.innerText = "Start Game";
                startGameBtn.addEventListener("click", (event) => {
                    //redirect to gmepgae start game 
                    location.hash = `#play/${element.g_id}`;
                });
                card.appendChild(startGameBtn);
            }
            upcomingContainer.appendChild(card);
        }
        else{
            playedContainer.appendChild(card);
        }
    });
}