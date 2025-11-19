import { setGameStats } from "../scripts/gamedetail.js";


export function Gamedetail(g_id : string | null) : HTMLElement{
    const main = document.createElement("div");
    main.className = "flex flex-col p-4 items-center gap-3";

    const pageLabel = document.createElement("h1");
    pageLabel.className = "text-3xl font-bold text-center mt-5 text-white";
    pageLabel.innerText = "Gamedetails";
    main.appendChild(pageLabel);

    const infoContainer = document.createElement("div");
    infoContainer.className = "flex w-full gap-3";

    const statusContainer = document.createElement("div");
    statusContainer.className = "flex flex-col w-full rounded-2xl bg-btnbgselected p-5 gap-3";
    const statusLabel = document.createElement("h1");
    statusLabel.className = "text-2xl text-center";
    statusLabel.innerText = "Status";
    statusContainer.appendChild(statusLabel);
    const status = document.createElement("div");
    status.id = "status";
    status.className = "w-full flex justify-center items-center h-full text-xl text-bold";
    status.innerText = "Finished";
    statusContainer.appendChild(status);
    infoContainer.appendChild(statusContainer);

    const dateContainer = document.createElement("div");
    dateContainer.className = "flex flex-col w-full rounded-2xl bg-btnbgselected p-5 gap-3";
    const dateLabel = document.createElement("h1");
    dateLabel.className = "text-2xl text-center";
    dateLabel.innerText = "Date";
    dateContainer.appendChild(dateLabel);
    const date = document.createElement("div");
    date.className = "w-full flex justify-center items-center h-full text-xl text-bold";
    date.id = "date";
    date.innerText = "2025-01-01";
    dateContainer.appendChild(date);
    infoContainer.appendChild(dateContainer);

    const matchContainer = document.createElement("div");
    matchContainer.className = "flex flex-col w-full rounded-2xl bg-btnbgselected p-5 gap-3";
    const matchLabel = document.createElement("h1");
    matchLabel.className = "text-2xl text-center";
    matchLabel.innerText = "Match";
    matchContainer.appendChild(matchLabel);

    const matchWrapper = document.createElement("div");
    matchWrapper.className = "flex w-full justify-center items-center";
    const matchPlayer1Container = document.createElement("div");
    matchPlayer1Container.className = "flex flex-col";
    const matchImagePlayer1 = document.createElement("img");
    matchImagePlayer1.id = "avatar1";
    matchImagePlayer1.className = "h-[100px] w-[100px] rounded-full border-3 mr-5";
    matchPlayer1Container.appendChild(matchImagePlayer1);
    const matchPlayer1Name = document.createElement("h1");
    matchPlayer1Name.id = "match-player1-name";
    matchPlayer1Name.className = "text-center mr-5";
    matchPlayer1Name.innerText = "User1";
    matchPlayer1Container.appendChild(matchPlayer1Name);
    matchWrapper.appendChild(matchPlayer1Container);

    const matchSeperator = document.createElement("h1");
    matchSeperator.id = "matchseperator";
    matchSeperator.className = "text-center text-5xl text-bold mb-6";
    matchSeperator.innerText = "3-5"
    matchWrapper.appendChild(matchSeperator);

    const matchPlayer2Container = document.createElement("div");
    matchPlayer2Container.className = "flex flex-col";
    const matchImagePlayer2 = document.createElement("img");
    matchImagePlayer2.id = "avatar2";
    matchImagePlayer2.className = "h-[100px] w-[100px] rounded-full border-3 ml-5";
    matchPlayer2Container.appendChild(matchImagePlayer2);
    
    const matchPlayer2Name = document.createElement("h1");
    matchPlayer2Name.id = "match-player2-name";
    matchPlayer2Name.className = "text-center ml-5";
    matchPlayer2Name.innerText = "User2";
    matchPlayer2Container.appendChild(matchPlayer2Name);
    matchWrapper.appendChild(matchPlayer2Container);

    matchContainer.appendChild(matchWrapper);
    infoContainer.appendChild(matchContainer);
    main.appendChild(infoContainer);

    const h2hContainer = document.createElement("div");
    h2hContainer.className = "flex w-full gap-3";

    const h2hstatsContainer = document.createElement("div");
    h2hstatsContainer.className = "flex flex-col w-full rounded-2xl bg-btnbgselected p-5 gap-3";
    const h2hStatsLabel = document.createElement("h1");
    h2hStatsLabel.className = "text-2xl text-center";
    h2hStatsLabel.innerText = "Head-to-Head Stats";
    h2hstatsContainer.appendChild(h2hStatsLabel);
    const playernamesContainer = document.createElement("div");
    playernamesContainer.className = "w-full flex";
    const p1Label = document.createElement("h1");
    p1Label.id = "p1-label";
    p1Label.className = "w-full text-center text-xl text-bold";
    p1Label.innerText = "User1";
    playernamesContainer.appendChild(p1Label);
    const spaceholder = document.createElement("div");
    spaceholder.className = "w-full";
    playernamesContainer.appendChild(spaceholder);
    const p2Label = document.createElement("h1");
    p2Label.id = "p2-label";
    p2Label.className = "w-full text-center text-xl text-bold";
    p2Label.innerText = "User2";
    playernamesContainer.appendChild(p2Label);
    h2hstatsContainer.appendChild(playernamesContainer);

    const totalGamesGamedateRow = document.createElement("div");
    totalGamesGamedateRow.className = "w-full flex";
    const p1GamesGd = document.createElement("h1");
    p1GamesGd.id = "p1-games-gd";
    p1GamesGd.className = "text-center w-full";
    p1GamesGd.innerText = "25";
    totalGamesGamedateRow.appendChild(p1GamesGd);

    const totalGamesLabelGamedate = document.createElement("h1");
    totalGamesLabelGamedate.className = "text-center w-full";
    totalGamesLabelGamedate.id = "games-date";
    totalGamesLabelGamedate.innerText = "Total games before 2025-01-01";
    totalGamesGamedateRow.appendChild(totalGamesLabelGamedate);

    const p2GamesGd = document.createElement("h1");
    p2GamesGd.id = "p2-games-gd";
    p2GamesGd.className = "text-center w-full";
    p2GamesGd.innerText = "55";
    totalGamesGamedateRow.appendChild(p2GamesGd);

    h2hstatsContainer.appendChild(totalGamesGamedateRow);

    const totalGamesNowRow = document.createElement("div");
    totalGamesNowRow.className = "w-full flex";
    const p1GamesNow = document.createElement("h1");
    p1GamesNow.id = "p1-games-now";
    p1GamesNow.className = "text-center w-full";
    p1GamesNow.innerText = "25";
    totalGamesNowRow.appendChild(p1GamesNow);

    const totalGamesLabelNow = document.createElement("h1");
    totalGamesLabelNow.className = "text-center w-full";
    totalGamesLabelNow.innerText = "Total games";
    totalGamesNowRow.appendChild(totalGamesLabelNow);

    const p2GamesNow = document.createElement("h1");
    p2GamesNow.id = "p2-games-now";
    p2GamesNow.className = "text-center w-full";
    p2GamesNow.innerText = "55";
    totalGamesNowRow.appendChild(p2GamesNow);

    h2hstatsContainer.appendChild(totalGamesNowRow);

    const rankpointsGdRow = document.createElement("div");
    rankpointsGdRow.className = "w-full flex";
    const p1RankGd = document.createElement("h1");
    p1RankGd.id = "p1-rank-gd";
    p1RankGd.className = "text-center w-full";
    p1RankGd.innerText = "25";
    rankpointsGdRow.appendChild(p1RankGd);

    const rankpointsGdLabel = document.createElement("h1");
    rankpointsGdLabel.id = "rank-gd";
    rankpointsGdLabel.className = "text-center w-full";
    rankpointsGdLabel.innerText = "Rankpoints at 2025-01-01";
    rankpointsGdRow.appendChild(rankpointsGdLabel);

    const p2RankGd = document.createElement("h1");
    p2RankGd.id = "p2-rank-gd";
    p2RankGd.className = "text-center w-full";
    p2RankGd.innerText = "55";
    rankpointsGdRow.appendChild(p2RankGd);

    h2hstatsContainer.appendChild(rankpointsGdRow);

    const rankpointsNowRow = document.createElement("div");
    rankpointsNowRow.className = "w-full flex";
    const p1RankNow = document.createElement("h1");
    p1RankNow.id = "p1-rank-now";
    p1RankNow.className = "text-center w-full";
    p1RankNow.innerText = "25";
    rankpointsNowRow.appendChild(p1RankNow);

    const rankpointsNowLabel = document.createElement("h1");
    rankpointsNowLabel.className = "text-center w-full";
    rankpointsNowLabel.innerText = "Rankpoints now";
    rankpointsNowRow.appendChild(rankpointsNowLabel);

    const p2RankNow = document.createElement("h1");
    p2RankNow.id = "p2-rank-now";
    p2RankNow.className = "text-center w-full";
    p2RankNow.innerText = "55";
    rankpointsNowRow.appendChild(p2RankNow);

    h2hstatsContainer.appendChild(rankpointsNowRow);

    const winrateGdRow = document.createElement("div");
    winrateGdRow.className = "w-full flex";
    const p1WinrateGd = document.createElement("h1");
    p1WinrateGd.id = "p1-winrate-gd";
    p1WinrateGd.className = "text-center w-full";
    p1WinrateGd.innerText = "25";
    winrateGdRow.appendChild(p1WinrateGd);

    const winrateGdLabel = document.createElement("h1");
    winrateGdLabel.id = "winrate-gd";
    winrateGdLabel.className = "text-center w-full";
    winrateGdLabel.innerText = "Winrate at 2025-01-01";
    winrateGdRow.appendChild(winrateGdLabel);

    const p2WinrateGd = document.createElement("h1");
    p2WinrateGd.id = "p2-winrate-gd";
    p2WinrateGd.className = "text-center w-full";
    p2WinrateGd.innerText = "55";
    winrateGdRow.appendChild(p2WinrateGd);

    h2hstatsContainer.appendChild(winrateGdRow);

    const winrateNowRow = document.createElement("div");
    winrateNowRow.className = "w-full flex";
    const p1WinrateNow = document.createElement("h1");
    p1WinrateNow.id = "p1-winrate-now";
    p1WinrateNow.className = "text-center w-full";
    p1WinrateNow.innerText = "25";
    winrateNowRow.appendChild(p1WinrateNow);

    const winrateNowLabel = document.createElement("h1");
    winrateNowLabel.className = "text-center w-full";
    winrateNowLabel.innerText = "Winrate now";
    winrateNowRow.appendChild(winrateNowLabel);

    const p2WinrateNow = document.createElement("h1");
    p2WinrateNow.id = "p2-winrate-now";
    p2WinrateNow.className = "text-center w-full";
    p2WinrateNow.innerText = "55";
    winrateNowRow.appendChild(p2WinrateNow);

    h2hstatsContainer.appendChild(winrateNowRow);

    const vsWinrateNowRow = document.createElement("div");
    vsWinrateNowRow.className = "w-full flex";
    const p1VsWinrateNow = document.createElement("h1");
    p1VsWinrateNow.id = "p1-vswinrate";
    p1VsWinrateNow.className = "text-center w-full";
    p1VsWinrateNow.innerText = "25";
    vsWinrateNowRow.appendChild(p1VsWinrateNow);

    const vsWinrateNowLabel = document.createElement("h1");
    vsWinrateNowLabel.className = "text-center w-full";
    vsWinrateNowLabel.innerText = "VS Winrate";
    vsWinrateNowRow.appendChild(vsWinrateNowLabel);

    const p2VsWinrateNow = document.createElement("h1");
    p2VsWinrateNow.id = "p2-vswinrate";
    p2VsWinrateNow.className = "text-center w-full";
    p2VsWinrateNow.innerText = "55";
    vsWinrateNowRow.appendChild(p2VsWinrateNow);
    h2hstatsContainer.appendChild(vsWinrateNowRow);
    main.appendChild(h2hstatsContainer);

    const h2hMatchesContainer = document.createElement("div");
    h2hMatchesContainer.id = "played-games";
    h2hMatchesContainer.className = "flex flex-col w-full rounded-2xl bg-btnbgselected p-5 gap-3";
    const h2hMatchesLabel = document.createElement("h1");
    h2hMatchesLabel.className = "text-2xl text-center";
    h2hMatchesLabel.innerText = "Head-to-Head Matches";
    h2hMatchesContainer.appendChild(h2hMatchesLabel);

    main.appendChild(h2hMatchesContainer);


    if (g_id){
        setTimeout(() => setGameStats(g_id), 0);
    }
    return main;
}