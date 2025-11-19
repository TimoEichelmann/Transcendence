import { register } from "../../scripts/regist.js";

export function registerForm(username : string | null) : HTMLElement
{
    const Register = document.createElement("div");
	Register.className = "flex flex-col w-[80%] hidden";
	Register.id = "registerForm";

	const Title = document.createElement("h1");
    Title.textContent = "Register";
    Title.className = "text-3xl font-bold mb-5 text-white";

    const errdiv = document.createElement('div');
    errdiv.id = "errdiv";
    errdiv.className = 'bg-red-500 rounded-2xl mb-5 hidden';

    const err = document.createElement('h1');
    err.className = 'text-center py-5';
    err.id = "err";
    err.textContent = 'ERROR';

    errdiv.appendChild(err);

    const uname = document.createElement("h2");
    uname.textContent = "Username:";
    uname.className = "text-white";

    const dname = document.createElement("h2");
    dname.textContent = "Displayname:";
    dname.className = "text-white";

    const pword = document.createElement("h2");
    pword.textContent = "Password:";
    pword.className = "text-white";

    const rpword = document.createElement("h2");
    rpword.textContent = "Repeat Password:";
    rpword.className = "text-white";

	const email = document.createElement("h2");
    email.textContent = "Email:";
    email.className = "text-white";

    const uname_enter = document.createElement("input");
    uname_enter.type = "text";
    uname_enter.id = "uname";
    uname_enter.className = 'bg-white border border-gray-400 rounded px-3 py-2 mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500';

    const dname_enter = document.createElement("input");
    dname_enter.type = "text";
    dname_enter.id = "dname";
    dname_enter.className = 'bg-white border border-gray-400 rounded px-3 py-2 mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500';

    const pword_enter = document.createElement("input");
    pword_enter.type = "password";
    pword_enter.id = "regpassword";
    pword_enter.className = 'bg-white border border-gray-400 rounded px-3 py-2 mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500';

    const rpword_enter = document.createElement("input");
    rpword_enter.type = "password";
    rpword_enter.id = "repassword";
    rpword_enter.className = 'bg-white border border-gray-400 rounded px-3 py-2 mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500';
	
    const email_enter = document.createElement("input");
    email_enter.type = "email";
    email_enter.id = "email";
    email_enter.className = 'bg-white border border-gray-400 rounded px-3 py-2 mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500';

    const submit = document.createElement("button");
    submit.textContent = "Submit";
    submit.id = "submitBtn";
    submit.className = "py-3 px-20 mb-5 border rounded-2xl cursor-pointer text-txthighlight hover:bg-bglight";
    submit.addEventListener("click", register);

	Register.append(Title, errdiv, uname, uname_enter, dname, dname_enter, pword, pword_enter, rpword, rpword_enter, email, email_enter, submit);
	    return Register;
	}