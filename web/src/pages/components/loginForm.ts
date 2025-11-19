import {login} from "../../scripts/login.js"

export function loginForm(username : string | null) : HTMLElement
{
    const Login = document.createElement("div");
    Login.className = "flex flex-col w-[80%]";
    Login.id = "loginForm";

    const Title = document.createElement("h1");
    Title.textContent = "Login";
    Title.className = "text-3xl font-bold mb-5";

    const errdiv = document.createElement('div');
    errdiv.id = "login_errdiv";
    errdiv.className = 'bg-red-500 rounded-2xl mb-5 hidden';

    const err = document.createElement('h1');
    err.className = 'text-center py-5';
    err.id = "login_err";
    err.textContent = 'ERROR';

    errdiv.appendChild(err);

    const uname = document.createElement("h2");
    uname.textContent = "Username:";
    uname.className = "text-white";

    const pword = document.createElement("h2");
    pword.textContent = "Password:";
    pword.className = "text-white";

    const twofa = document.createElement("h2");
    twofa.textContent = "2FA Code:";
    twofa.className = "text-white";

    const uname_enter = document.createElement("input");
    uname_enter.type = "text";
    uname_enter.id = "username";
    uname_enter.className = 'bg-white border border-gray-400 rounded px-3 py-2 mb-5';

    const pword_enter = document.createElement("input");
    pword_enter.type = "password";
    pword_enter.id = "password";
    pword_enter.className = 'bg-white border border-gray-400 rounded px-3 py-2 mb-5';

    const twofa_enter = document.createElement("input");
    twofa_enter.type = "text";
    twofa_enter.id = "twofa_token";
    twofa_enter.placeholder = "Enter 6-digit code";
    twofa_enter.className = 'bg-white border border-gray-400 rounded px-3 py-2 mb-5';

    const submit = document.createElement("button");
    submit.id = "submitBtn";
    submit.textContent = "Login";
    submit.className = "py-3 px-20 mb-5 border rounded-2xl cursor-pointer text-txthighlight hover:bg-bglight";
    submit.addEventListener("click", login);

    Login.append(Title, errdiv, uname, uname_enter, pword, pword_enter, twofa, twofa_enter, submit);

    return Login;
}



// import {login} from "../../scripts/login.js"

// export function loginForm(username : string | null) : HTMLElement
// {
//     const Login = document.createElement("div");
//     Login.className = "flex flex-col w-[80%]";
// 	Login.id = "loginForm";

//     const Title = document.createElement("h1");
//     Title.textContent = "Login";
//     Title.className = "text-3xl font-bold mb-5";

//     const errdiv = document.createElement('div');
//     errdiv.id = "login_errdiv";
//     errdiv.className = 'bg-red-500 rounded-2xl mb-5 hidden';

//     const err = document.createElement('h1');
//     err.className = 'text-center py-5';
//     err.id = "login_err";
//     err.textContent = 'ERROR';

//     errdiv.appendChild(err);

//     const uname = document.createElement("h2");
//     uname.textContent = "Username:";

//     const pword = document.createElement("h2");
//     pword.textContent = "Password:";

//     const twofa = document.createElement("h2");
//     twofa.textContent = "2FA Code:";

//     const uname_enter = document.createElement("input");
//     uname_enter.type = "text";
//     uname_enter.id = "username";
//     uname_enter.className = 'bg-white border border-gray-400 rounded px-3 py-2 mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500';

//     const pword_enter = document.createElement("input");
//     pword_enter.type = "password";
//     pword_enter.id = "password";
//     pword_enter.className = 'bg-white border border-gray-400 rounded px-3 py-2 mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500';

//     const twofa_enter = document.createElement("input");
//     twofa_enter.type = "text";
//     twofa_enter.id = "twofa_token";
//     twofa_enter.placeholder = "Enter 2FA code";
//     twofa_enter.className = 'bg-white border border-gray-400 rounded px-3 py-2 mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500';

//     const submit = document.createElement("button");
//     submit.id = "submitBtn";
//     submit.textContent = "Login";
//     submit.className = "py-3 px-20 mb-5 border rounded-2xl cursor-pointer text-txthighlight hover:bg-bglight";
//     submit.addEventListener("click", login);
    
//     Login.append(Title, errdiv, uname, uname_enter, pword, pword_enter, twofa, twofa_enter, submit);

// 	return Login;
// }