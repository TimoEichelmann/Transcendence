import {Navbar} from "./components/Navbar.js"
import {Search, removeFriend, routeFriendsPage} from "../scripts/friends.js"
import {JwtExpired} from "../scripts/jwtExpired.js"

export function Friends(username : string | null) : HTMLElement
{
  const wrapper = document.createElement("div");
  const main_authorized = document.createElement("div");
  main_authorized.className = "flex flex-col p-4 items-center gap-3 text-white hidden";
  main_authorized.textContent = "This Site is unavailable to logged out Users";
  main_authorized.id = "non_logged_in_div";

  const main = document.createElement("div");
  //const main = document.createElement("div"); 
  main.className = "flex flex-col p-4 items-center gap-3 hidden";
  main.id = "logged_in";

  const title = document.createElement("h1");
  title.className = "text-white text-3xl text-center font-bold my-5";
  title.textContent = "Add Friends";
  main.appendChild(title);

  const formContainer = document.createElement("div");
  formContainer.className = "flex gap-3 w-full justify-center";
  const displaynameInput = document.createElement("input");
  displaynameInput.id = "displayname";
  displaynameInput.className = "px-5 rounded-2xl bg-white text-black";
  formContainer.appendChild(displaynameInput);
  const searchBtn = document.createElement("div");
  searchBtn.innerText = "Search";
  searchBtn.className = "flex px-4 py-2 rounded-2xl cursor-pointer text-black-500 bg-btnbg hover:bg-btnbghover items-center";
  searchBtn.addEventListener("click", Search);
  formContainer.appendChild(searchBtn);
  main.appendChild(formContainer);

  const foundContainer = document.createElement("div");
  foundContainer.className = "flex w-10/12 rounded-2xl items-center justify-center my-4 py-5 hidden";
  foundContainer.id = "result";
  
  const friendContainer = document.createElement("div");
  friendContainer.className = "flex w-full runded 2xl items-center text-white justify-center py-5 gap-2";
  friendContainer.id = "friendContainer";
  
  main.append(foundContainer, friendContainer);
  wrapper.appendChild(main);
  wrapper.appendChild(main_authorized);



	setTimeout(() => {
      routeFriendsPage();
			//updateFriendlist();
		}, 0);

 
  return wrapper;
}

export function createFriendNode(username: string, isOnline: number, friendAvatar: string, friend_id: string): HTMLDivElement {
  
	//const friendContainer = document.getElementById("friendContainer")!;
	const friendNode = document.createElement("div");
  friendNode.className = "flex flex-col items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800 text-white text-sm shadow-md";


	const header = document.createElement("div");
	header.className = "flex gap-2 justify-center items-center";
  // Status dot
  const statusDot = document.createElement("span");
  statusDot.className = `w-3 h-3 rounded-full ${
    isOnline ? "bg-green-500" : "bg-gray-500"
  }`;

  // Name
  const name = document.createElement("span");
  name.textContent = username;
  name.className = "font-medium";

	header.append(statusDot, name);

  const avatar = document.createElement("img");
	avatar.src = friendAvatar;
	avatar.alt = "Avatar";
	avatar.className = "w-[40] h-[40] rounded-full";


	const removeBtn = document.createElement("button");
	removeBtn.className = "flex px-2 py-1 rounded-2xl cursor-pointer text-black bg-red-500 hover:bg-btnbghover items-center";
	removeBtn.textContent = "Unadd";
	removeBtn.id = username;
	removeBtn.addEventListener("click", () => removeFriend(friend_id));
  // Combine
  friendNode.append(avatar, header, removeBtn);
//   friendContainer.append(friendNode);
  return friendNode;
}