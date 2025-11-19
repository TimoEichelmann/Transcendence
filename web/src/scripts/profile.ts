const API_BASE = `${window.location.origin}/api`;

export async function updateUsername() {
    const username = (document.getElementById('username') as HTMLInputElement)?.value;
    
    try {
        const jwt = localStorage.getItem('jwtToken');
        const response = await fetch(`${API_BASE}/players/updateusername`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
            },
            body: JSON.stringify({
                jwt,
                username
            })
        });

        const data = await response.json();
        if (data.error){
            showToast(data.error, "error");
        }
        else if (data.success){
            showToast(data.msg, "success");
        }
        else {
            showToast("Something went wrong", "error");
        }
    } catch (error) {
        showToast("Something went wrong", "error");
        console.error('Error on fetch:', error);
    }
}

export async function updateDisplayname() {
    const displayname = (document.getElementById('displayname') as HTMLInputElement)?.value;
    
    try {
        const jwt = localStorage.getItem('jwtToken');
        const response = await fetch(`${API_BASE}/players/updatedisplayname`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
            },
            body: JSON.stringify({
                jwt,
                displayname
            })
        });

        const data = await response.json();
        if (data.error){
            showToast(data.error, "error");
        }
        else if (data.success){
            showToast(data.msg, "success");
        }
        else {
            showToast("Something went wrong", "error");
        }
    } catch (error) {
        showToast("Something went wrong", "error");
        console.error('Error on fetch:', error);
    }
}

export async function updateEmail() {
    const email = (document.getElementById('email') as HTMLInputElement)?.value;
    
    try {
        const jwt = localStorage.getItem('jwtToken');
        const response = await fetch(`${API_BASE}/players/updateemail`, {
            method: `POST`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
            },
            body: JSON.stringify({
                jwt,
                email
            })
        });

        const data = await response.json();
        if (data.error){
            showToast(data.error, "error");
        }
        else if (data.success){
            showToast(data.msg, "success");
        }
        else {
            showToast("Something went wrong", "error");
        }
    } catch (error) {
        showToast("Something went wrong", "error");
        console.error('Error on fetch:', error);
    }
}

export async function updatePassword() {
    const oldpw = (document.getElementById('oldpw') as HTMLInputElement)?.value;
    const newpw = (document.getElementById('newpw') as HTMLInputElement)?.value;
    const renewpw = (document.getElementById('renewpw') as HTMLInputElement)?.value;
    
    try {
        const jwt = localStorage.getItem('jwtToken');
        const response = await fetch(`${API_BASE}/players/updatepassword`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
            },
            body: JSON.stringify({
                jwt,
                oldpw,
                newpw,
                renewpw
            })
        });

        const data = await response.json();
        if (data.error){
            showToast(data.error, "error");
        }
        else if (data.success){
            showToast(data.msg, "success");
        }
        else {
            showToast("Something went wrong", "error");
        }
    } catch (error) {
        showToast("Something went wrong", "error");
        console.error('Error on fetch:', error);
    }
}

export async function deleteUser() {
    try {
        const jwt = localStorage.getItem('jwtToken');
        const response = await fetch(`${API_BASE}/players/deleteuser`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
            },
            body: JSON.stringify({})
        });

        const data = await response.json();
        if (data.error){
            showToast(data.error, "error");
            console.log(data.error);
        }
        else if (data.success){
            showToast(data.msg, "success");
        }
        else {
            showToast("Something went wrong", "error");
        }
        localStorage.clear();
    } catch (error) {
        showToast("Something went wrong", "error");
        console.error('Error on fetch:', error);
    }
}

export async function updateInputfields() {
    const jwt = localStorage.getItem('jwtToken');
    const response = await fetch(`${API_BASE}/players/profiledata`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${jwt}`
        }
    });
    const data = await response.json();
    const username = document.getElementById('username') as HTMLInputElement;
    username.value = data.username;
    const displayname = document.getElementById('displayname') as HTMLInputElement;
    displayname.value = data.displayname;
    const email = document.getElementById("email") as HTMLInputElement;
    email.value = data.email;
    const preview = document.createElement("img");
    if (data.image){
        preview.src = data.image;
    }
    preview.className = "w-[200px] h-[200px] border-4 border-slate-700 rounded-full";
    const placeholder = document.getElementById("imagewrapper") as HTMLElement;
    placeholder.innerHTML = "";
    placeholder.appendChild(preview);
}

export function chooseImage() {
  return new Promise<File | null>((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.style.display = "none";

    input.onchange = () => {
      const file = input.files?.[0] || null;
      resolve(file);
    };

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  });
}

export async function updateProfileImg(){
    try {
        const formData = new FormData();
        formData.append("image", (window as any).selectedProfileImg);
        const jwt = localStorage.getItem('jwtToken');
        const response = await fetch(`${API_BASE}/players/uploadprofileimage`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwt}`
            },
            body: formData
        });

        const data = await response.json();
        if (data.error){
            showToast(data.error, "error");
        }
        else if (data.success){
            showToast(data.msg, "success");
        }
        else {
            showToast("Something went wrong", "error");
        }
    } catch (error) {
        showToast("Something went wrong", "error");
        console.error('Error on fetch:', error);
    }
}

function showToast(message:string, type:string) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.className = `
    fixed top-[120px] left-1/2 -translate-x-1/2 px-4 py-2 rounded shadow 
    transition-opacity duration-300 z-[9999]
    ${type === "success" ? "bg-green-500" : "bg-red-500"}
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("opacity-0");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}