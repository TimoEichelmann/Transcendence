export function switchForm(to) {
    const loginBtn = document.getElementById("login");
    const registerBtn = document.getElementById("register");
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    if (to === "login") {
        registerForm === null || registerForm === void 0 ? void 0 : registerForm.classList.add("hidden");
        loginForm === null || loginForm === void 0 ? void 0 : loginForm.classList.remove("hidden");
        registerBtn === null || registerBtn === void 0 ? void 0 : registerBtn.classList.remove("bg-blue-500", "text-white");
        registerBtn === null || registerBtn === void 0 ? void 0 : registerBtn.classList.add("bg-gray-200", "text-black");
        loginBtn === null || loginBtn === void 0 ? void 0 : loginBtn.classList.remove("bg-gray-200", "text-black");
        loginBtn === null || loginBtn === void 0 ? void 0 : loginBtn.classList.add("bg-blue-500", "text-white");
    }
    else {
        registerForm === null || registerForm === void 0 ? void 0 : registerForm.classList.remove("hidden");
        loginForm === null || loginForm === void 0 ? void 0 : loginForm.classList.add("hidden");
        registerBtn === null || registerBtn === void 0 ? void 0 : registerBtn.classList.remove("bg-gray-200", "text-black");
        registerBtn === null || registerBtn === void 0 ? void 0 : registerBtn.classList.add("bg-blue-500", "text-white");
        loginBtn === null || loginBtn === void 0 ? void 0 : loginBtn.classList.remove("bg-blue-500", "text-white");
        loginBtn === null || loginBtn === void 0 ? void 0 : loginBtn.classList.add("bg-gray-200", "text-black");
    }
}
