const API_BASE = `${window.location.origin}/api`;

export async function createTournament() {
    const tournamentStart = (document.getElementById('datetime') as HTMLInputElement)?.value;
    const tournamentName = (document.getElementById('t_name') as HTMLInputElement)?.value;
    const maxPlayer = (document.getElementById('t_maxplayer') as HTMLInputElement)?.value;
    const errdiv = document.getElementById("errdiv") as HTMLInputElement;
    const err = document.getElementById("err") as HTMLInputElement;
    
    try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch(`${API_BASE}/tournament/createnew`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                tournamentName,
                maxPlayer,
                tournamentStart
            })
        });

        const data = await response.json();
        if (data.error){
          showToast("Failed: " + data.error, "fail");
        }
        else{
          showToast("Successfully created tournament: " + tournamentName, "success");
        }
        getTournaments();
    } catch (error) {
        console.error('Error on fetch:', error);
    }
}

export async function getTournaments() {
  try {
    const res = await fetch(`${API_BASE}/tournament/infolist`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    const data = await res.json();
    const tournaments = data?.data ?? [];

    const upcomingTournaments = document.getElementById("upcoming-tournaments");
    const finishedTournaments = document.getElementById("finished-tournaments");
    if (!upcomingTournaments || !finishedTournaments) return;

    upcomingTournaments.innerHTML = "";
    finishedTournaments.innerHTML = "";

    if (tournaments.length > 0) {
      tournaments.forEach((tournament:any) => {
        if (tournament.status == "not started") {
          const card = document.createElement("div");
          card.className = "flex flex-col w-[48%] rounded-2xl bg-btnbgselected py-5";

          const t_name = document.createElement("h1");
          t_name.className = "w-full text-center";
          t_name.textContent = tournament.name;
          card.appendChild(t_name);

          const t_starttime = document.createElement("h1");
          t_starttime.className = "w-full text-center";
          t_starttime.textContent = tournament.starttime ?? "";
          card.appendChild(t_starttime);

          const t_players = document.createElement("h1");
          t_players.className = "w-full text-center";
          t_players.textContent = `${tournament.registered_players}/${tournament.max_player}`;
          card.appendChild(t_players);

          const buttonsDiv = document.createElement("div");
          buttonsDiv.className = "flex flex-wrap w-full gap-3 justify-center mt-3";

          const regBtn = document.createElement("div");
          regBtn.className = "flex py-2 px-4 text-black rounded-2xl cursor-pointer bg-btnbg hover:bg-btnbghover text-center";
          regBtn.dataset.tournamentId = tournament.t_key;
          regBtn.textContent = "Register";
          regBtn.addEventListener("click", async (e) => {
            const id = (e.currentTarget as HTMLElement)?.dataset.tournamentId;
            try {
              const token = localStorage.getItem('jwtToken');
              const res = await fetch(`${API_BASE}/tournament/register`, {
                method: "POST",
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ t_id: Number(id) })
              });
              const data = await res.json();
              if (!res.ok) {
                showToast(data.error || "Register failed", "error");
                return;
              }
              showToast(data.msg || "Registered", "success");
              getTournaments();
            } catch (err) {
              console.error("Request failed:", err);
            }
          });
          buttonsDiv.appendChild(regBtn);

          const infoBtn = document.createElement("a");
          infoBtn.href = "/#tournamentdetail/" + tournament.t_key;
          infoBtn.className = "flex py-2 px-4 text-black rounded-2xl cursor-pointer bg-btnbg hover:bg-btnbghover text-center";
          infoBtn.textContent = "Info";
          buttonsDiv.appendChild(infoBtn);

          card.appendChild(buttonsDiv);
          upcomingTournaments.appendChild(card);
        }

        else if (tournament.status == "finished") {
          const card = document.createElement("div");
          card.className = "flex flex-col w-[48%] rounded-2xl bg-btnbgselected py-5";

          const t_name = document.createElement("h1");
          t_name.className = "w-full text-center";
          t_name.textContent = tournament.name;
          card.appendChild(t_name);

          const t_starttime = document.createElement("h1");
          t_starttime.className = "w-full text-center";
          t_starttime.textContent = tournament.starttime ?? "";
          card.appendChild(t_starttime);

          const t_players = document.createElement("h1");
          t_players.className = "w-full text-center";
          t_players.textContent = `${tournament.registered_players}/${tournament.max_player}`;
          card.appendChild(t_players);

          const buttonsDiv = document.createElement("div");
          buttonsDiv.className = "flex flex-wrap w-full gap-3 justify-center mt-3";

          const infoBtn = document.createElement("a");
          infoBtn.href = "/#tournamentdetail/" + tournament.t_key;
          infoBtn.className = "flex py-2 px-4 text-black rounded-2xl cursor-pointer bg-btnbg hover:bg-btnbghover text-center";
          infoBtn.textContent = "Info";
          buttonsDiv.appendChild(infoBtn);

          card.appendChild(buttonsDiv);
          finishedTournaments.appendChild(card);
        }

      });
    }

    if (upcomingTournaments.children.length === 0) {
      const empty = document.createElement("h1");
      empty.className = "text-center text-white";
      empty.textContent = "No upcoming tournaments";
      upcomingTournaments.appendChild(empty);
    }
    if (finishedTournaments.children.length === 0) {
      const empty = document.createElement("h1");
      empty.className = "text-center text-white";
      empty.textContent = "No finished tournaments";
      finishedTournaments.appendChild(empty);
    }
  } catch (err) {
    console.error('Fehler beim Abrufen:', err);
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