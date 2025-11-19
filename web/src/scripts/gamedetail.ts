const API_BASE = `${window.location.origin}/api`;

export async function setGameStats(id: string) {
    try {
        const jwt = localStorage.getItem('jwtToken');
        const response = await fetch(`${API_BASE}/players/gamestats/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${jwt}`
            }
        });
        const data = await response.json();

        const status = document.getElementById("status") as HTMLElement;
        const date = document.getElementById("date") as HTMLElement;
        const matchPlayer1Name = document.getElementById("match-player1-name") as HTMLElement;
        const matchPlayer2Name = document.getElementById("match-player2-name") as HTMLElement;
        const avatar1 = document.getElementById("avatar1") as HTMLImageElement;
        const avatar2 = document.getElementById("avatar2") as HTMLImageElement;
        const score = document.getElementById("matchseperator") as HTMLElement;
        const p1Label = document.getElementById("p1-label") as HTMLElement;
        const p2Label = document.getElementById("p2-label") as HTMLElement;
        const gamesDate = document.getElementById("games-date") as HTMLElement;
        const totalGamesP1Gamedate = document.getElementById("p1-games-gd") as HTMLElement;
        const totalGamesP2Gamedate = document.getElementById("p2-games-gd") as HTMLElement;
        const totalGamesP1Now = document.getElementById("p1-games-now") as HTMLElement;
        const totalGamesP2Now = document.getElementById("p2-games-now") as HTMLElement;
        const winrateP1Gamedate = document.getElementById("p1-winrate-gd") as HTMLElement;
        const winrateP2Gamedate = document.getElementById("p2-winrate-gd") as HTMLElement;
        const winrateP1Now = document.getElementById("p1-winrate-now") as HTMLElement;
        const winrateP2Now = document.getElementById("p2-winrate-now") as HTMLElement;
        const rankpointsP1Gamedate = document.getElementById("p1-rank-gd") as HTMLElement;
        const rankpointsP2Gamedate = document.getElementById("p2-rank-gd") as HTMLElement;
        const rankpointsP1Now = document.getElementById("p1-rank-now") as HTMLElement;
        const rankpointsP2Now = document.getElementById("p2-rank-now") as HTMLElement;
        const rankLabel = document.getElementById("rank-gd") as HTMLElement;
        const winrateLabel = document.getElementById("winrate-gd") as HTMLElement;
        const vsWinrateP1 = document.getElementById("p1-vswinrate") as HTMLElement;
        const vsWinrateP2 = document.getElementById("p2-vswinrate") as HTMLElement;

        status.innerText = data.gameStatus;
        date.innerText = data.date;
        avatar1.src = data.p1Avatar;
        avatar2.src = data.p2Avatar;
        matchPlayer1Name.innerText = data.p1Displayname;
        matchPlayer2Name.innerText = data.p2Displayname;
        score.innerText = data.score;
        p1Label.innerText = data.p1Displayname;
        p2Label.innerText = data.p2Displayname;
        totalGamesP1Gamedate.innerText = data.totalGamesP1Gamedate;
        gamesDate.innerText = "Total games before " + data.date;
        totalGamesP2Gamedate.innerText = data.totalGamesP2Gamedate;
        totalGamesP1Now.innerText = data.totalGamesP1;
        totalGamesP2Now.innerText = data.totalGamesP2;
        if (data.winrateP1Gamedate != null) {
            winrateP1Gamedate.innerText = data.winrateP1Gamedate + "%";
        }
        else{
            winrateP1Gamedate.innerText = "0%";
        }
        if (data.winrateP2Gamedate != null) {
            winrateP2Gamedate.innerText = data.winrateP2Gamedate + "%";
        }
        else {
            winrateP2Gamedate.innerText = "0%";
        }
        if (data.winrateP1Now != null) {
            winrateP1Now.innerText = data.winrateP1Now + "%";
        }
        else {
            winrateP1Now.innerText = "0%";
        }
        if (data.winrateP2Now != null) {
            winrateP2Now.innerText = data.winrateP2Now + "%";
        }
        else {
            winrateP2Now.innerText = "0%";
        }
        rankpointsP1Gamedate.innerText = data.rankpointsP1Gamedate;
        rankpointsP2Gamedate.innerText = data.rankpointsP2Gamedate;
        rankpointsP1Now.innerText = data.rankpointsP1Now;
        rankpointsP2Now.innerText = data.rankpointsP2Now;
        rankLabel.innerText = "Rankpoints before " + data.date;
        winrateLabel.innerText = "Winrate before " + data.date;
        if (data.h2hGames[0]){
            vsWinrateP1.innerText = data.h2hGames[0].p1_winrate + "%";
            vsWinrateP2.innerText = data.h2hGames[0].p2_winrate + "%";
        }
        else{
            vsWinrateP1.innerText = "0%";
            vsWinrateP2.innerText = "0%";
        }
        setUpH2HGames(data);

    } catch (error) {
        console.error('Error on fetch:', error);
    }
}

function setUpH2HGames(data:any) {
    const playedContainer = document.getElementById("played-games") as HTMLElement;

    data.h2hGames.forEach((element:any) => {
        const card = document.createElement("div");
        
        card.addEventListener("click", () => {
            window.location.hash = `#gamedetail/${element.g_id}`;
        });

        const dateLabel = document.createElement("h1");
        dateLabel.className = "w-full text-center";
        dateLabel.innerText = element.game_date;
        card.appendChild(dateLabel);

        const vsRow = document.createElement("div");
        vsRow.className = "flex gap-5 items-center";

        if (data.u_id == element.winner) {
            const wrapper = document.createElement("div");
            wrapper.className = "flex w-full justify-end";
            const win = document.createElement("div");
            win.className = "flex h-[100px] w-[100px] rounded-full bg-green-500 justify-center items-center text-bold text-white text-3xl";
            win.innerText = "W";
            wrapper.appendChild(win);
            card.className = "flex flex-col border-3 border-green-500 rounded-2xl py-5 gap-3 hover:cursor-pointer";
            vsRow.appendChild(wrapper);
        }
        else{
            const wrapper = document.createElement("div");
            wrapper.className = "flex w-full justify-end";
            const loss = document.createElement("div");
            loss.className = "flex h-[100px] w-[100px] rounded-full bg-red-500 justify-center items-center text-bold text-white text-3xl";
            loss.innerText = "L";
            wrapper.appendChild(loss);
            card.className = "flex flex-col border-3 border-red-500 rounded-2xl py-5 gap-3 hover:cursor-pointer";
            vsRow.appendChild(wrapper);
        }

        const p1Label = document.createElement("h1");
        p1Label.className = "text-2xl text-center w-full";
        p1Label.innerText = element.p1_display_name;
        vsRow.appendChild(p1Label);

        const p1Score = document.createElement("h1");
        p1Score.className = "text-2xl text-center";
        p1Score.innerText = element.p1_points;
        vsRow.appendChild(p1Score);

        const vsImage = document.createElement("img");
        vsImage.className = "h-[100px] w-[100px]";
        vsImage.src = "/profile-images/vs.png";
        vsRow.appendChild(vsImage);

        const p2Score = document.createElement("h1");
        p2Score.className = "text-2xl text-center";
        p2Score.innerText = element.p2_points;
        vsRow.appendChild(p2Score);

        const p2Label = document.createElement("h1");
        p2Label.className = "text-2xl text-center w-full";
        p2Label.innerText = element.p2_display_name;
        vsRow.appendChild(p2Label);

        card.appendChild(vsRow);

        if (element.t_key != null) {
            const tournamentNameLabel = document.createElement("h1");
            tournamentNameLabel.className = "w-full text-center";
            tournamentNameLabel.innerText = element.tournament_name;
            card.appendChild(tournamentNameLabel);
        }

        playedContainer.appendChild(card);
    });
}