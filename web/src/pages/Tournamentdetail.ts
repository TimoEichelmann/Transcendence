import { setData, setTournamentData } from "../scripts/tournamentdetails.js";

export function Tournamentdetail(t_id : string | null) : HTMLElement{
    const main = document.createElement("div");
    main.className = "flex flex-col p-4 items-center gap-5";
    
    const t_name = document.createElement("h1");
    t_name.className = "text-3xl font-bold text-center text-white mt-5";
    t_name.id = "tournament-name";
    main.appendChild(t_name);

    const creator_name = document.createElement("h1");
    creator_name.className = "text-white";
    creator_name.id = "creator-name";
    main.appendChild(creator_name);

    const time_players_container = document.createElement("div");
    time_players_container.className = "flex gap-5 justify-center min-w-[80%]";
    const timecontainer = document.createElement("div");
    timecontainer.className = "flex flex-col w-full rounded-2xl py-5 px-5 bg-btnbgselected";
    const timelabel = document.createElement("h1");
    timelabel.className = "text-2xl text-center";
    timelabel.innerText = "Starttime";
    timecontainer.appendChild(timelabel);
    const starttime = document.createElement("h1");
    starttime.className = "text-center mt-3"
    starttime.id = "starttime";
    timecontainer.appendChild(starttime);
    time_players_container.appendChild(timecontainer);
    const numberplayersContainer = document.createElement("div");
    numberplayersContainer.className = "flex flex-col w-full rounded-2xl py-5 px-5 bg-btnbgselected";
    const numberinfoLabel = document.createElement("h1");
    numberinfoLabel.className = "text-2xl text-center";
    numberinfoLabel.innerText = "Number registered player";
    numberplayersContainer.appendChild(numberinfoLabel);
    const totalNumber = document.createElement("h1");
    totalNumber.className = "text-center mt-3";
    totalNumber.id = "number-players";
    numberplayersContainer.appendChild(totalNumber);
    time_players_container.appendChild(numberplayersContainer);
    main.appendChild(time_players_container);

    const playernamesContainer = document.createElement("div");
    playernamesContainer.className = "flex flex-col min-w-[80%] rounded-2xl bg-btnbgselected gap-5 items-center py-5";

    const playernamesLabel = document.createElement("h1");
    playernamesLabel.className = "text-center text-2xl";
    playernamesLabel.innerText = "Registered players";
    playernamesContainer.appendChild(playernamesLabel);

    const nameRows = document.createElement("div");
    nameRows.className = "flex flex-wrap w-full";
    nameRows.id = "namerows";
    
    playernamesContainer.appendChild(nameRows);
    main.appendChild(playernamesContainer);

    const bracketsContainer = document.createElement("div");
    bracketsContainer.className = "flex flex-col min-w-[80%] bg-btnbgselected rounded-2xl gap-5 items-center py-5";
    const bracketsLabel = document.createElement("h1");
    bracketsLabel.innerText = "Tournament tree";
    bracketsLabel.className = "text-2xl";
    bracketsContainer.appendChild(bracketsLabel);

    const bracketsWrapper = document.createElement("div");
    bracketsWrapper.className = "flex w-full bg-btnbgselected text-white justify-center";
    bracketsWrapper.id = "brackets";
    bracketsContainer.appendChild(bracketsWrapper);
    main.appendChild(bracketsContainer);

    setTimeout(() => {
		setTournamentData(t_id);
        setData(t_id);
	}, 0);
    return main;
}