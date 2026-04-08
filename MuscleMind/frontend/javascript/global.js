import { postLogout } from "./api.js";

document.addEventListener('DOMContentLoaded', ()=>{
    const logoutBtn = document.getElementById('logout');
    logoutBtn.addEventListener('click', ()=>{
        logout();
    })
});
async function logout() {
    try {
        const data = await postLogout('http://127.0.0.1:3000/api/auth/logout')
        alert(data.message);
        window.location.href = '/bejelentkezes';
    } catch (error) {
        console.error(error.message)
    }
}