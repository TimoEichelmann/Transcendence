import { createTournament } from "../scripts/tournament.js";
import { getTournaments } from "../scripts/tournament.js";
import {Navbar} from "./components/Navbar.js"

export function Tournament(username : string | null) : HTMLElement
{
	const main = document.createElement("div");
	main.className = "flex flex-col p-4 items-center";

	const header = document.createElement("h1");
	header.className = "text-3xl font-bold text-center my-5 text-white";
	header.textContent = "Tournament";
	main.appendChild(header);

	const createInputs = document.createElement("div");
	createInputs.className = "flex w-full justify-center gap-4 bg-blue flex-wrap mb-5";
	const datediv = document.createElement("div");
	datediv.className = "flex flex-col";
	const datetimeLabel = document.createElement("h1");
	datetimeLabel.textContent = "Date and Time:";
	datetimeLabel.className = "text-white";
	datediv.appendChild(datetimeLabel);
	const datetimeInput = document.createElement("input");
	datetimeInput.id = "datetime";
	datetimeInput.type = "date";
	datetimeInput.className = "bg-white px-4 py-2 rounded-2xl";
	datediv.appendChild(datetimeInput);
	createInputs.appendChild(datediv);

	const namediv = document.createElement("div");
	namediv.className = "flex flex-col";
	const nameLabel = document.createElement("h1");
	nameLabel.textContent = "Name:";
	nameLabel.className = "text-white";
	namediv.appendChild(nameLabel);
	const nameInput = document.createElement("input");
	nameInput.id = "t_name";
	nameInput.className = "bg-white px-4 py-2 rounded-2xl";
	namediv.appendChild(nameInput);
	createInputs.appendChild(namediv);

	const maxPlayerdiv = document.createElement("div");
	maxPlayerdiv.className = "flex flex-col";
	const maxPlayerLabel = document.createElement("h1");
	maxPlayerLabel.textContent = "Max Player:";
	maxPlayerLabel.className = "text-white";
	maxPlayerdiv.appendChild(maxPlayerLabel);
	const maxPlayerInput = document.createElement("select");
	maxPlayerInput.id = "t_maxplayer";
	maxPlayerInput.className = "bg-white px-4 py-2 rounded-2xl";
	for (let index = 2; index < 6; index++) {
		let option = document.createElement("option");
		option.value = (2 ** index).toString();
		option.textContent = (2 ** index).toString();
		maxPlayerInput.appendChild(option);
	}
	maxPlayerdiv.appendChild(maxPlayerInput);
	createInputs.appendChild(maxPlayerdiv);

	const createBtnContainer = document.createElement("div");
	createBtnContainer.className = "flex flex-col";
	const ph = document.createElement("div");
	ph.className = "h-full";
	createBtnContainer.appendChild(ph);
	const createBtn = document.createElement("div");
	createBtn.className = "flex px-4 py-2 rounded-2xl cursor-pointer text-black-500 bg-btnbg hover:bg-btnbghover items-center";
	createBtn.textContent = "Create tournament";
	createBtn.addEventListener("click", createTournament);
	createBtnContainer.appendChild(createBtn);	
	createInputs.appendChild(createBtnContainer);

	main.appendChild(createInputs);

	const listWrapper = document.createElement("div");
	listWrapper.className = "flex flex-col w-full";

	const labels = document.createElement("div");
	labels.className = "flex w-full text-xl font-bold text-center mb-5";
	const upcomingHeader = document.createElement("h1");
	upcomingHeader.className = "w-full text-center text-white";
	upcomingHeader.textContent = "Upcoming";
	labels.appendChild(upcomingHeader);
	const finishedHeaer = document.createElement("h1");
	finishedHeaer.className = "w-full text-center text-white";
	finishedHeaer.textContent = "Finished";
	labels.appendChild(finishedHeaer);
	listWrapper.appendChild(labels);

	const lists = document.createElement("div");
	lists.className = "flex w-full gap-3 items-start";

	const upcomingList = document.createElement("div");
	upcomingList.id = "upcoming-tournaments"
	upcomingList.className = "flex w-full flex-wrap gap-3 justify-center overflow-auto";

	lists.appendChild(upcomingList)


	const finishedList = document.createElement("div");
	finishedList.id = "finished-tournaments";
	finishedList.className = "flex w-full flex-wrap gap-3 justify-center overflow-auto";

	lists.appendChild(finishedList)
	listWrapper.appendChild(lists);


	main.appendChild(listWrapper);
	getTournaments();

    return main;
}