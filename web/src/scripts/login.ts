import { updateNavbar } from "./router.js";

const API_BASE = `${window.location.origin}/api`;

export async function login () {
  const username = (document.getElementById('username') as HTMLInputElement)?.value;
  const password = (document.getElementById('password') as HTMLInputElement)?.value;
  const errdiv = document.getElementById('login_errdiv') as HTMLInputElement;
  const err = document.getElementById('login_err') as HTMLInputElement;

  try {
    const twofa_token = (document.getElementById('twofa_token') as HTMLInputElement)?.value;
    const response = await fetch(`${API_BASE}/players/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password, twofa_token })
    });

    const data = await response.json();
    if (data.error){
      err.textContent = data.error;
      errdiv.classList.remove('hidden');
    }
    else{
      localStorage.setItem('jwtToken', data.jwtToken);
      //updateNavbar();
      window.location.href = '#home'
    }

    
  } catch (error) {
    console.error('Fehler beim Senden:', error);
  }
}