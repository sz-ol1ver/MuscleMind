import { postLogout, getFetch } from "./api.js";

document.addEventListener('DOMContentLoaded', ()=>{
    //!admin btn
    checkAdmin();

    //!theme switch
    initThemeSwitch();

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

function initThemeSwitch() {
    const themeSwitch = document.getElementById('theme-switch');

    if (!themeSwitch) {
        return;
    }

    const root = document.documentElement;
    const body = document.body;

    function updateTitleAnimation(isLight) {
        let title1Id = 'shifting-textForLightTheme1';
        let title2Id = 'shifting-textForLightTheme2';
        let nextTitle1Id = 'shifting-text1';
        let nextTitle2Id = 'shifting-text2';

        if (isLight) {
            title1Id = 'shifting-text1';
            title2Id = 'shifting-text2';
            nextTitle1Id = 'shifting-textForLightTheme1';
            nextTitle2Id = 'shifting-textForLightTheme2';
        }

        const title1 = document.getElementById(title1Id);
        const title2 = document.getElementById(title2Id);

        if (title1) {
            title1.id = nextTitle1Id;
        }

        if (title2) {
            title2.id = nextTitle2Id;
        }
    }

    function applyTheme(isLight) {
        root.classList.toggle('light-theme', isLight);
        body.classList.toggle('light-theme', isLight);
        updateTitleAnimation(isLight);
    }

    const savedTheme = localStorage.getItem('mm-theme');
    const isLight = savedTheme === 'light';

    themeSwitch.checked = isLight;
    applyTheme(isLight);

    themeSwitch.addEventListener('change', (event) => {
        const enableLight = event.target.checked;
        if (enableLight) {
            localStorage.setItem('mm-theme', 'light');
        } else {
            localStorage.setItem('mm-theme', 'dark');
        }
        applyTheme(enableLight);
    });
}
async function logout() {
    try {
        const data = await postLogout('/api/auth/logout');
        window.location.href = '/bejelentkezes';
    } catch (error) {
        console.error(error.message)
    }
}
async function checkAdmin() {
    //? side-nav-list
    //? mobil-nav-list
    try {
        const data = await getFetch('/api/auth/is-admin');
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