import { postLogout, getFetch } from "./api.js";

document.addEventListener('DOMContentLoaded', ()=>{
    //!admin btn
    checkAdmin();

    //!logout
    const logoutBtn = document.getElementById('logout');
    logoutBtn.addEventListener('click', ()=>{
        const confirmLogout = confirm('Biztosan ki szeretnél jelentkezni?');

        if(!confirmLogout){
            return;
        }

        logout();
    });
});
async function logout() {
    try {
        const data = await postLogout('http://127.0.0.1:3000/api/auth/logout');
        window.location.href = '/bejelentkezes';
    } catch (error) {
        console.error(error.message)
    }
}
async function checkAdmin() {
    //? side-nav-list
    //? mobil-nav-list
    try {
        const data = await getFetch('http://127.0.0.1:3000/api/auth/is-admin');
        const sn = document.getElementById('side-nav-list');
        const mn = document.getElementById('mobil-nav-list');
        if(data.admin == 1){
            // side navconst 
            const li1 = document.createElement('li');
            li1.className = 'nav-item';
            li1.style.border = '1px solid white'

            const a1 = document.createElement('a');
            a1.className = 'nav-link';
            a1.href = '/admin';
            a1.innerHTML = 'Admin';

            li1.appendChild(a1);
            sn.appendChild(li1);

            // mobil navconst 
            const li2 = document.createElement('li');
            li2.className = 'nav-item';
            li2.style.border = '1px solid white'

            const a2 = document.createElement('a');
            a2.className = 'nav-link';
            a2.href = '/admin';
            a2.innerHTML = 'Admin';

            li2.appendChild(a2);
            mn.appendChild(li2);
        }
    } catch (error) {
        console.error(error.message);
    }
}