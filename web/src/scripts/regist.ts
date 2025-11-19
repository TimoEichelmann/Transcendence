import { switchForm } from "./switchForm.js";
// import * as QRCode from "qrcode";
// import QRCode from "qrcode";

const API_BASE = `${window.location.origin}/api`;
declare const QRCode: any;


function showQrCodeOverlay(twofa_qr: string, onClose: () => void)
{
  const overlay = document.createElement('div');
  overlay.style.position = "fixed";
  overlay.style.inset = '0';
  overlay.style.backgroundColor = 'rgba(0,0,0,0.7)';
  overlay.style.display = 'flex';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = "center";
  overlay.style.zIndex = "1000";

  const container = document.createElement("div");
	container.style.display = "flex";
	container.style.flexDirection = "column";
	container.style.alignItems = "center";
	container.style.justifyContent = "center";
	container.style.gap = "1rem";
	container.style.backgroundColor = "white";
	container.style.padding = "2rem";
	container.style.borderRadius = "1rem";
	container.style.boxShadow = "0 0 20px rgba(0,0,0,0.3)";
	container.style.maxWidth = "300px";

  const qrCanvas = document.createElement("canvas");
  qrCanvas.id = "qrcode";
  qrCanvas.width = 200;
  qrCanvas.height = 200;
  qrCanvas.className = "border my-4";
  
  const infoText = document.createElement("div");
  infoText.style.textAlign = "center";
	infoText.style.fontSize = "1rem";
	infoText.style.color = "#333";
	infoText.style.margin = "0";
	infoText.style.lineHeight = "1.4";
  infoText.textContent = "Please scan this QrCode with Google Authenticator.";

  container.append(qrCanvas, infoText);
  overlay.append(container);
  document.body.append(overlay);
  QRCode.toCanvas(qrCanvas, twofa_qr, (err: any) => {
    if (err) console.error(err);
  });

  function closeOverlay() {
   document.body.removeChild(overlay);
   onClose();
  }
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay)
      closeOverlay();
  });

}

export async function register ()
{
  const username = (document.getElementById('uname') as HTMLInputElement)?.value?.trim();
  const display_name = (document.getElementById('dname') as HTMLInputElement)?.value?.trim();
  const password = (document.getElementById('regpassword') as HTMLInputElement)?.value ?? "";
  const repassword = (document.getElementById('repassword') as HTMLInputElement)?.value ?? "";
  const email = (document.getElementById('email') as HTMLInputElement)?.value?.trim();
  const errdiv = document.getElementById('errdiv');
  const err = document.getElementById('err');

  if (err) err.textContent = "";
  if (errdiv) errdiv.classList.add('hidden');

  // if (!username || !display_name || !email || !password || !repassword)
  // {
  //   if (err)
  //     err.textContent = "All fields are required";
  //   if (errdiv)
  //     errdiv.classList.remove('hidden');
  //   return;
  // }

  try {
    const response = await fetch(`${API_BASE}/players/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, display_name, password, repassword, email })
    });

    const data = await response.json();
    if (data.error) {
      showToast(data.error, "fail");
      return;
    }
    else {
      showToast("Successfully registered account.", "success");
    }

    // const qrCanvas = document.getElementById("qrcode") as HTMLCanvasElement;

    if (data.twofa_qr) {

      showQrCodeOverlay(data.twofa_qr, () => {
        switchForm("login");
      });
    }
  } catch (e) {
    console.error('Error on fetch:', e);
    if (err)
      err.textContent = "Network error";
    if (errdiv)
      errdiv.classList.remove('hidden');
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
