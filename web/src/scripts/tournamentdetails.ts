// @ts-ignore 
import { createBracket } from "https://cdn.jsdelivr.net/npm/bracketry@1.1.3/dist/esm/index.min.js";
const API_BASE = `${window.location.origin}/api`;

export async function setData(id: string | null) {
    const bracketsWrapper = document.getElementById("brackets") as HTMLDivElement;
    try {
        const response = await fetch(`${API_BASE}/tournament/tournamenttree`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id
            })
        });
        const resdata = await response.json();
        const styleoptions = {
            matchTextColor: "#000000",
            roundTitleColor: "#000000"
        }
        createBracket(resdata.data, bracketsWrapper, styleoptions);
    } catch (error) {
        console.log(error);
    }
}

export async function setTournamentData(id: string | null) {
    const starttime = document.getElementById("starttime") as HTMLElement;
    const numberPlayers = document.getElementById("number-players") as HTMLElement;
    const tournamentName = document.getElementById("tournament-name") as HTMLElement;
    const creatorName = document.getElementById("creator-name") as HTMLElement;
    const namerows = document.getElementById("namerows") as HTMLElement;

    try {
        const response = await fetch(`${API_BASE}/tournament/tournamentdetails`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id
            })
        });

        const data = await response.json();
        tournamentName.innerText = data.tournament.name;
        creatorName.innerText = "created by " + data.tournament.creator_displayname;
        starttime.innerText = data.tournament.starttime;
        numberPlayers.innerText = data.tournament.registered_count + "/" + data.tournament.max_player;
        for (let i = 0; i < data.tournament.registered_players.length; i++) {
            const display_name = document.createElement("h1");
            display_name.className = "basis-1/4 px-5 text-center";
            display_name.innerText = data.tournament.registered_players[i].display_name;
            namerows.appendChild(display_name);
        }
        
    } catch (error) {
        console.log(error);
    }
}