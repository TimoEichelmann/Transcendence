import { createGame } from "../scripts/gameAPI.js";
import { chooseImage, deleteUser, updateDisplayname, updateEmail, updateInputfields, updatePassword, updateProfileImg, updateUsername } from "../scripts/profile.js";

export function Profile(username : string | null) : HTMLElement
{
	const main = document.createElement("div"); 
	main.className = "flex flex-col p-4 items-center";

	const header = document.createElement("h1");
	header.className = "text-3xl font-bold text-center my-5";
	header.textContent = "Profile";
    header.className = "text-white";
	main.appendChild(header);

    const profileImageWrappe = document.createElement("div");
    profileImageWrappe.className = "flex";
    
    const placeholder = document.createElement("div");
    placeholder.className = "w-[200px] h-[200px]";
    placeholder.id = "imagewrapper";
    profileImageWrappe.appendChild(placeholder);
    main.appendChild(profileImageWrappe);

    const profileImageContainer = document.createElement("div");
    profileImageContainer.className = "flex gap-5 mt-5";
    const editProfileImgBtn = document.createElement("div")
    editProfileImgBtn.className = "flex px-4 py-2 rounded-2xl cursor-pointer text-black-500 bg-btnbg hover:bg-btnbghover items-center";
    editProfileImgBtn.innerText = "Add/Change profile image";
    editProfileImgBtn.addEventListener("click", async () => {
    const file = await chooseImage();
        if (file) {
            const preview = document.createElement("img");
            preview.src = URL.createObjectURL(file);
            preview.className = "w-[200px] h-[200px] border-4 border-slate-700 rounded-full";
            placeholder.innerHTML = "";
            placeholder.appendChild(preview);
            (window as any).selectedProfileImg = file;
        }
    });
    profileImageContainer.appendChild(editProfileImgBtn);
    const imgUpdateBtn = document.createElement("div");
    imgUpdateBtn.className = "flex px-4 py-2 rounded-2xl cursor-pointer text-black-500 bg-btnbg hover:bg-btnbghover items-center";
    imgUpdateBtn.innerText = "Update";
    imgUpdateBtn.addEventListener("click", updateProfileImg);
    profileImageContainer.appendChild(imgUpdateBtn);
    main.appendChild(profileImageContainer);

    //password old/new/retype, delete user
    const usernameContainer = document.createElement("div");
    usernameContainer.className = "flex flex-col mt-5";
    const usernameLabel = document.createElement("h1");
    usernameLabel.innerText = "Username:";
    usernameLabel.className = "text-white";
    usernameContainer.appendChild(usernameLabel);
    const usernameRow = document.createElement("div");
    usernameRow.className = "flex";
    const usernameInput = document.createElement("input");
    usernameInput.className = "bg-white px-4 py-2 rounded-2xl";
    usernameInput.id = "username";
    usernameRow.appendChild(usernameInput);
    const usernameUpdateBtn = document.createElement("div");
    usernameUpdateBtn.className = "flex px-4 py-2 rounded-2xl cursor-pointer text-black-500 bg-btnbg hover:bg-btnbghover items-center ml-5";
    usernameUpdateBtn.innerText = "Update";
    usernameUpdateBtn.addEventListener("click", updateUsername);
    usernameRow.appendChild(usernameUpdateBtn);
    usernameContainer.appendChild(usernameRow);
    main.appendChild(usernameContainer);

    const displaynameContainer = document.createElement("div");
    displaynameContainer.className = "flex flex-col mt-5";
    const displaynameLabel = document.createElement("h1");
    displaynameLabel.className = "text-white";
    displaynameLabel.innerText = "Displayname:";
    displaynameContainer.appendChild(displaynameLabel);
    const displaynameRow = document.createElement("div");
    displaynameRow.className = "flex";
    const displaynameInput = document.createElement("input");
    displaynameInput.className = "bg-white px-4 py-2 rounded-2xl";
    displaynameInput.id = "displayname";
    displaynameRow.appendChild(displaynameInput);
    const displaynameUpdateBtn = document.createElement("div");
    displaynameUpdateBtn.className = "flex px-4 py-2 rounded-2xl cursor-pointer text-black-500 bg-btnbg hover:bg-btnbghover items-center ml-5";
    displaynameUpdateBtn.innerText = "Update";
    displaynameUpdateBtn.addEventListener("click", updateDisplayname);
    displaynameRow.appendChild(displaynameUpdateBtn);
    displaynameContainer.appendChild(displaynameRow);
    main.appendChild(displaynameContainer);

    const emailContainer = document.createElement("div");
    emailContainer.className = "flex flex-col mt-5";
    const emailLabel = document.createElement("h1");
    emailLabel.innerText = "Email:";
    emailLabel.className = "text-white";
    emailContainer.appendChild(emailLabel);
    const emailRow = document.createElement("div");
    emailRow.className = "flex";
    const emailInput = document.createElement("input");
    emailInput.className = "bg-white px-4 py-2 rounded-2xl";
    emailInput.id = "email";
    emailRow.appendChild(emailInput);
    const emailUpdateBtn = document.createElement("div");
    emailUpdateBtn.className = "flex px-4 py-2 rounded-2xl cursor-pointer text-black-500 bg-btnbg hover:bg-btnbghover items-center ml-5";
    emailUpdateBtn.innerText = "Update";
    emailUpdateBtn.addEventListener("click", updateEmail);
    emailRow.appendChild(emailUpdateBtn);
    emailContainer.appendChild(emailRow);
    main.appendChild(emailContainer);

    const passwordContainer = document.createElement("div");
    passwordContainer.className = "flex gap-5 mt-5";
    const oldpwContainer = document.createElement("div");
    oldpwContainer.className = "flex flex-col";
    const oldpwLabel = document.createElement("h1");
    oldpwLabel.innerText = "Old password:";
    oldpwLabel.className = "text-white";
    oldpwContainer.appendChild(oldpwLabel);
    const oldpwInput = document.createElement("input");
    oldpwInput.className = "bg-white px-4 py-2 rounded-2xl";
    oldpwInput.type = "password";
    oldpwInput.id ="oldpw";
    oldpwContainer.appendChild(oldpwInput);
    passwordContainer.appendChild(oldpwContainer);
    const newpwContainer = document.createElement("div");
    newpwContainer.className = "flex flex-col";
    const newpwLabel = document.createElement("h1");
    newpwLabel.innerText = "New password";
    newpwLabel.className = "text-white";
    newpwContainer.appendChild(newpwLabel);
    const newpwInput = document.createElement("input");
    newpwInput.className = "bg-white px-4 py-2 rounded-2xl";
    newpwInput.type = "password";
    newpwInput.id = "newpw";
    newpwContainer.appendChild(newpwInput);
    passwordContainer.appendChild(newpwContainer);
    const renewpwContainer = document.createElement("div");
    renewpwContainer.className = "flex flex-col";
    const renewpwLabel = document.createElement("h1");
    renewpwLabel.innerText = "Retype new password";
    renewpwLabel.className = "text-white";
    renewpwContainer.appendChild(renewpwLabel);
    const renewpwInput = document.createElement("input");
    renewpwInput.className = "bg-white px-4 py-2 rounded-2xl";
    renewpwInput.type = "password";
    renewpwInput.id = "renewpw";
    renewpwContainer.appendChild(renewpwInput);
    passwordContainer.appendChild(renewpwContainer);

    const newpwBtnContainer = document.createElement("div");
    newpwBtnContainer.className = "flex flex-col";
    const test = document.createElement("div");
    test.className = "h-full";
    newpwBtnContainer.appendChild(test);
    const newpwUpdateBtn = document.createElement("div");
    newpwUpdateBtn.className = "flex px-4 py-2 rounded-2xl cursor-pointer text-black-500 bg-btnbg hover:bg-btnbghover items-center";
    newpwUpdateBtn.innerText = "Update";
    newpwUpdateBtn.addEventListener("click", updatePassword);
    newpwBtnContainer.appendChild(newpwUpdateBtn);
    passwordContainer.appendChild(newpwBtnContainer);
    main.appendChild(passwordContainer);


    updateInputfields();
    return main;
}