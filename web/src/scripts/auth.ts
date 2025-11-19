(function () {
  const TOKEN_KEY = "jwtToken";

  function setToken(t: string): void {
    localStorage.setItem(TOKEN_KEY, t);
  }

  function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  function clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  async function authFetch(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const token = getToken();
    const headers = new Headers(options.headers || {});
    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      clearToken();
      location.hash = "#/login";
      throw new Error("Unauthorized");
    }
    return res;
  }

  // Expose globally
  (window as any).Auth = { setToken, getToken, clearToken, authFetch };
})();
