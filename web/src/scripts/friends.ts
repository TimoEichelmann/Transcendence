import { createFriendNode } from "../pages/Friends.js";
import { JwtExpired } from "./jwtExpired.js";

const API_BASE = `${window.location.origin}/api`;

export async function Search() {
	const displayname = (document.getElementById("displayname") as HTMLInputElement)?.value;
    const resContainer = document.getElementById("result") as HTMLElement;
    resContainer.innerHTML = "";
    try {
        const res = await fetch(`${API_BASE}/players/getuserbydisplayname`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ displayname}),
        });
        const data = await res.json();
        if (data.success == true)
        {
            resContainer.classList.remove("bg-red-500");
            resContainer.classList.add("bg-btnbgselected");
            const profileImage = document.createElement("img");
            profileImage.className = "h-[100px] w-[100px] rounded-full";
            profileImage.src = data.avatar;
            resContainer.appendChild(profileImage);
            const displayname = document.createElement("h1");
            displayname.id = "found-displayname";
            displayname.className = "text-black text-center mx-5";
            displayname.innerText = data.displayname;
            resContainer.appendChild(displayname);
            const addBtn = document.createElement("div");
            addBtn.className = "flex px-4 py-2 rounded-2xl cursor-pointer text-black-500 bg-btnbg hover:bg-btnbghover items-center";
            addBtn.innerText = "Add";
            addBtn.addEventListener("click", async () => {
                const displayname = document.getElementById("found-displayname") as HTMLElement;
                const jwt = localStorage.getItem('jwtToken');
                try {
                    const res = await fetch(`${API_BASE}/players/addfriend`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            'Authorization': `Bearer ${jwt}`
                        },
                        body: JSON.stringify({
                            displayname: displayname.innerText
                        })
                    });
                    const data = await res.json();
                    const resContainer = document.getElementById("result") as HTMLElement;
                    resContainer.classList.add("hidden");
                    if (data.success)
                    {
                        updateFriendlist();
                    }
                }
                catch{

                }
            });
            resContainer.classList.remove("hidden");
            resContainer.appendChild(addBtn);
        }
        else{
            resContainer.classList.remove("hidden");
            resContainer.classList.remove("bg-btnbgselected");
            resContainer.classList.add("bg-red-500");
            resContainer.innerText = displayname + " not found!";
        }
    }
    catch (err){
        console.error("Search API:", err);
    }

}

export async function removeFriend(friend_id: any)
{
    const jwt = localStorage.getItem('jwtToken');
    try {    
        const res = await fetch(`${API_BASE}/players/removefriend`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${jwt}`
            },
            body: JSON.stringify({ friend_id: friend_id}),
        });
        updateFriendlist();
    }
    catch (err) {
        console.log("Failed to remove Friend: ", err);
    }
}

export async function updateFriendlist()
{
    const jwt = localStorage.getItem('jwtToken');
    try {
        const res = await fetch(`${API_BASE}/players/getfriends`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${jwt}`
            },
        });
        const data = await res.json();
        const friendContainer = document.getElementById("friendContainer") as HTMLElement;
        friendContainer.innerHTML = "";
        if (data.length === 0)
        {
            friendContainer.innerText = "No Friends yet?  :`(   AAAAAWWWWWWWWW";
        }
        else
        {
            data.forEach((element:any) => {
                friendContainer.appendChild(createFriendNode(element.friend_display_name, element.is_online, element.friend_avatar, element.friend_id));
            });
        }
    }
    catch(err) {
        console.log("Update Fail:", err);
    }
}

export async function routeFriendsPage(){
    const jwt = await JwtExpired(localStorage.getItem("jwtToken"));
    const main_unauthorized = document.getElementById("non_logged_in_div")!; 
    const main = document.getElementById("logged_in")!;
    if (!jwt) {
        main.classList.remove("hidden");
        updateFriendlist();
        // setTimeout(() => {
        //     updateFriendlist()
		// }, 0);
    }
    else{
        main_unauthorized.classList.remove("hidden");
    }

}