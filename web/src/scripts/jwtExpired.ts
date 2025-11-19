const API_BASE = `${window.location.origin}/api`;

export async function JwtExpired(token: any) {
    if(!token)
        return true;
    try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch(`${API_BASE}/players/isauthanticated`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const resdata = await response.json();
        if (resdata.success == true) {
            return false;
        }
        else{
            return true;
        }
    } catch (error){
        console.log(error);
        return true;
    }
}