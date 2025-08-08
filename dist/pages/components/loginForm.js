export function loginForm(username) {
    const Login = document.createElement("div");
    Login.id = "loginForm";
    const Title = document.createElement("h1");
    Title.textContent = "Login";
    Title.className = "text-3xl font-bold";
    const uname = document.createElement("h2");
    uname.textContent = "Username:";
    const pword = document.createElement("h2");
    pword.textContent = "Password:";
    const uname_enter = document.createElement("input");
    uname_enter.type = "text";
    uname_enter.id = "username";
    uname_enter.className = "";
    const pword_enter = document.createElement("input");
    pword_enter.type = "text";
    pword_enter.id = "password";
    pword_enter.className = "";
    const submit = document.createElement("button");
    submit.id = "submitBtn";
    submit.id = "Login";
    Login.append(Title, uname, uname_enter, pword, pword_enter, submit);
    return Login;
}
