import {deleteFetch, getFetch, patchFetch, postRequest} from './api.js';

let openT = [];
let closedT = [];

let users = [];

let containerOpen;
let containerClosed;

let containerUsers;

document.addEventListener('DOMContentLoaded', ()=>{
    const dashRefresh = document.getElementById('refresh-dash');
    const allSeen = document.getElementById('ticket-seen');
    const adminBtn = document.getElementById('user-admin');
    containerOpen = document.getElementById('open-tickets');
    containerClosed = document.getElementById('closed-tickets');
    containerUsers = document.getElementById('users-container');

    refreshSections();

    dashRefresh.addEventListener('click', ()=>{
        loadDash();
    });
    allSeen.addEventListener('click', async()=>{
        try {
            const data = await patchFetch('http://127.0.0.1:3000/api/admin/all-tickets/seen');
            console.log(data.message);
            loadTickets();
        } catch (error) {
            console.error(error.message);
        }
    });
    adminBtn.addEventListener('click', ()=>{
        
    })
});

//? refresh section data
function refreshSections(){
    loadDash();
    loadTickets();
    loadUsers();
}

//? dashboard
async function loadDash() {
    try {
        const allUser = document.getElementById('stat-allUser');
        const newReg = document.getElementById('stat-todayReg');
        const todayLog = document.getElementById('stat-todayLog');
        const todayTicket = document.getElementById('stat-todayTicket');
        const todayWorkout = document.getElementById('stat-todayWorkout');
        const todayError = document.getElementById('stat-todayError');
        const {dashStats} = await getFetch('http://127.0.0.1:3000/api/admin/dashboard');
        
        allUser.innerHTML = '';
        newReg.innerHTML = '';
        todayLog.innerHTML = '';
        todayTicket.innerHTML = '';
        todayWorkout.innerHTML = '';
        todayError.innerHTML = '';

        allUser.innerHTML = dashStats.allUser;
        newReg.innerHTML = dashStats.todayReg;
        todayLog.innerHTML = dashStats.todayLog;
        todayTicket.innerHTML = dashStats.todayTicket;
        todayWorkout.innerHTML = dashStats.todayWorkout;
        todayError.innerHTML = dashStats.todayError;
    } catch (error) {
        console.error(error.message);
    }
}

//? tickets
async function loadTickets() {
    try {
        openT.length = 0;
        closedT.length = 0;
        const data = await getFetch('http://127.0.0.1:3000/api/admin/all-tickets');
        for(let ticket of data.tickets){
            if(ticket.status == 'open' || ticket.status == 'seen'){
                openT.push(ticket)
            }else{
                closedT.push(ticket);
            }
        }
        renderTickets(openT, containerOpen);
        renderTickets(closedT, containerClosed);
    } catch (error) {
        console.error(error.message);
    }
}
function renderTickets(tickets, container) {
    // törlés
    container.innerHTML = '';

    if (!tickets || tickets.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'text-center text-secondary';
        empty.textContent = 'Nincs megjeleníthető ticket.';
        container.appendChild(empty);
        return;
    }
    for (let ticket of tickets) {
        const card = document.createElement('div');
        card.className = 'card admin-card mb-3 w-100';

        const header = document.createElement('div');
        header.className = 'card-header admin-card-header';
        header.style.cursor = 'pointer';
        header.setAttribute('data-bs-toggle', 'collapse');
        header.setAttribute('data-bs-target', `#ticket-${ticket.id}`);
        header.setAttribute('aria-expanded', 'false');
        header.setAttribute('aria-controls', `ticket-${ticket.id}`);

        // felső sor
        const headerTop = document.createElement('div');
        headerTop.className = 'd-flex justify-content-between align-items-start gap-3 flex-wrap';

        const leftTop = document.createElement('div');
        leftTop.className = 'd-flex align-items-center gap-2 flex-wrap ticket-title-wrap';

        const ticketId = document.createElement('span');
        ticketId.className = 'card-content-id fw-bold';
        ticketId.textContent = `#${ticket.id}`;

        const userId = document.createElement('span');
        userId.className = 'card-content-id fw-bold';
        userId.textContent = `user id: #${ticket.user_id}`;

        const separator = document.createElement('span');
        separator.className = 'card-separator';
        separator.textContent = '|';

        const separator2 = document.createElement('span');
        separator2.className = 'card-separator';
        separator2.textContent = '|';

        const subject = document.createElement('span');
        subject.className = 'card-subject fw-bold';
        subject.textContent = ticket.subject;

        const badge = document.createElement('span');
        switch (ticket.status) {
            case 'open': {
                badge.className = 'badge bg-danger';
                badge.innerHTML = 'Folyamatban';
                break;
            }
            case 'seen': {
                badge.className = 'badge bg-warning text-dark';
                badge.innerHTML = 'Megtekintve';
                break;
            }
            case 'closed': {
                badge.className = 'badge bg-success';
                badge.innerHTML = 'Lezárva';
                break;
            }
            case 'closed_no_reply': {
                badge.className = 'badge bg-info text-dark';
                badge.innerHTML = 'Lezárva (válasz nélkül)';
                break;
            }
        }

        // kategória badge
        const categoryBadge = document.createElement('span');
        switch (ticket.category) {
            case 'contact': {
                categoryBadge.className = 'badge bg-primary';
                categoryBadge.textContent = 'Kapcsolat';
                break;
            }
            case 'bug': {
                categoryBadge.className = 'badge bg-danger';
                categoryBadge.textContent = 'Hiba';
                break;
            }
            case 'idea': {
                categoryBadge.className = 'badge bg-success';
                categoryBadge.textContent = 'Ötlet';
                break;
            }
        }

        const badgeDiv = document.createElement('div');
        badgeDiv.className = 'd-flex gap-3'
        badgeDiv.appendChild(categoryBadge);
        badgeDiv.appendChild(badge);

        leftTop.appendChild(ticketId);
        leftTop.appendChild(separator);
        leftTop.appendChild(subject);
        leftTop.appendChild(separator2);
        leftTop.appendChild(userId);

        headerTop.appendChild(leftTop);
        headerTop.appendChild(badgeDiv);

        // alsó sor a headerben
        const createdDate = document.createElement('div');
        createdDate.className = 'card-content-date mt-2';
        createdDate.textContent = `Létrehozva: ${ formatDate(ticket.created_at)}`;

        header.appendChild(headerTop);
        header.appendChild(createdDate);

        const collapse = document.createElement('div');
        collapse.className = 'collapse';
        collapse.id = `ticket-${ticket.id}`;

        const body = document.createElement('div');
        body.className = 'card-body admin-card-body';

        // user üzenet rész
        const userMessageTitle = document.createElement('h6');
        userMessageTitle.className = 'ticket-section-title';
        userMessageTitle.textContent = 'Üzenet';

        const userMessageBox = document.createElement('div');
        userMessageBox.className = 'ticket-message-box';
        userMessageBox.textContent = ticket.message;

        // admin üzenet rész
        const adminMessageTitle = document.createElement('h6');
        adminMessageTitle.className = 'ticket-section-title mt-4';
        adminMessageTitle.textContent = 'Admin üzenet';

        const adminMessageBox = document.createElement('div');
        adminMessageBox.className = 'ticket-message-box';

        if (ticket.admin_reply && ticket.admin_reply.trim()) {
            adminMessageBox.textContent = ticket.admin_reply;
        } else {
            adminMessageBox.textContent = 'Erre a ticketre nem válaszoltál.';
            adminMessageBox.classList.add('ticket-empty-message');
        }

        // dátum elválasztás
        const hr = document.createElement('hr');
        hr.className = 'ticket-divider';

        const hr2 = document.createElement('hr');
        hr2.className = 'ticket-divider';

        const adminUsername = document.createElement('p');
        adminUsername.innerHTML = 'Válaszadó: '+ticket.admin_username + ' (#'+ticket.replied_by_admin_id+')';

        const hr3 = document.createElement('hr');
        hr3.className = 'ticket-divider';

        const email = document.createElement('h5');
        email.innerHTML = ticket.email;

        const cardFooter = document.createElement('div');
        cardFooter.className = 'd-flex flex-row justify-content-between';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'btn btn-outline-success my-auto';
        closeBtn.innerHTML = 'Lezárás';
        closeBtn.id = 'closeBtn';
        closeBtn.addEventListener('click', async()=>{
            try {
                const data = await patchFetch('http://127.0.0.1:3000/api/admin/ticket-close/'+ticket.id);
                alert(data.message);
                refreshSections();
            } catch (error) {
                console.error(error.message);
            }
        })

        const datesWrap = document.createElement('div');
        datesWrap.className = 'ticket-dates';

        const createdInfo = document.createElement('div');
        createdInfo.textContent = `Létrehozva: ${ formatDate(ticket.created_at)}`;

        const updatedInfo = document.createElement('div');
        updatedInfo.textContent = `Szerkesztve: ${ formatDate(ticket.updated_at)}`;

        const repliedInfo = document.createElement('div');
        repliedInfo.textContent = `Válasz: ${ formatDate(ticket.replied_at)}`;

        datesWrap.appendChild(createdInfo);
        datesWrap.appendChild(updatedInfo);
        if(ticket.status == 'closed'){
            datesWrap.appendChild(repliedInfo);
        }

        cardFooter.appendChild(datesWrap);
        if(ticket.status != 'closed' && ticket.status != 'closed_no_reply'){
            cardFooter.appendChild(closeBtn);

            let skipFocusoutSave = false;
            adminMessageBox.addEventListener('click', () => {
                adminMessageBox.contentEditable = true;
                adminMessageBox.innerText = '';
                adminMessageBox.focus();
            });
            adminMessageBox.addEventListener('focusout', async()=>{
                if(skipFocusoutSave){
                    skipFocusoutSave = false;
                    return;
                }
                try {
                    const patchObj = {
                        admin_reply: adminMessageBox.innerText.trim()
                    }
                    if(!patchObj.admin_reply){
                        return;
                    }
                    const data = await patchFetch('http://127.0.0.1:3000/api/admin/ticket-answer/'+ticket.id, patchObj);
                    alert(data.message);
                    adminMessageBox.contentEditable = false;
                    adminMessageBox.blur();
                } catch (error) {
                    console.error(error.message);
                }
            });
            adminMessageBox.addEventListener('keydown', async(e)=>{
                if(e.key == 'Enter'){
                    e.preventDefault();
                    skipFocusoutSave = true;
                    try {
                        const patchObj = {
                            admin_reply: adminMessageBox.innerText.trim()
                        }
                        if(!patchObj.admin_reply){
                            return;
                        }
                        const data = await patchFetch('http://127.0.0.1:3000/api/admin/ticket-answer/'+ticket.id, patchObj);
                        alert(data.message);
                        adminMessageBox.contentEditable = false;
                        adminMessageBox.blur();
                    } catch (error) {
                        console.error(error.message);
                    }
                }
            });
            //? status = 'seen'
            card.addEventListener('click', async()=>{
                if(ticket.status == 'seen'){
                    return;
                }
                try {
                    const data = await patchFetch('http://127.0.0.1:3000/api/admin/ticket-seen/'+ticket.id);
                    console.log(data.message);
                    badge.className = 'badge bg-warning text-dark';
                    badge.innerHTML = 'Megtekintve';
                    ticket.status = 'seen';
                } catch (error) {
                    console.error(error.message);
                }
            })
        }

        body.appendChild(email);
        body.appendChild(hr3);
        body.appendChild(userMessageTitle);
        body.appendChild(userMessageBox);
        body.appendChild(adminMessageTitle);
        body.appendChild(adminMessageBox);
        body.appendChild(hr);
        if(ticket.status == 'closed'){
            body.appendChild(adminUsername);
            body.appendChild(hr2);
        }
        body.appendChild(cardFooter);

        collapse.appendChild(body);
        card.appendChild(header);
        card.appendChild(collapse);

        container.appendChild(card);
    }
}

//? users
async function loadUsers(){
    try {
        users.length = 0;
        const data = await getFetch('http://127.0.0.1:3000/api/admin/all-user');
        for(let user of data.users){
            users.push(user);
        }
        renderUsers(users, containerUsers);
    } catch (error) {
        console.error(error.message);
    }
}
function renderUsers(users, container) {
    // törlés
    container.innerHTML = '';

    if (!users || users.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'text-center text-secondary';
        empty.textContent = 'Nincs megjeleníthető ticket.';
        container.appendChild(empty);
        return;
    }
    for (let user of users) {
        const card = document.createElement('div');
        card.className = 'card admin-card mb-3 w-100';

        const header = document.createElement('div');
        header.className = 'card-header admin-card-header';
        header.style.cursor = 'pointer';
        header.setAttribute('data-bs-toggle', 'collapse');
        header.setAttribute('data-bs-target', `#ticket-${user.id}`);
        header.setAttribute('aria-expanded', 'false');
        header.setAttribute('aria-controls', `ticket-${user.id}`);

        // felső sor
        const headerTop = document.createElement('div');
        headerTop.className = 'd-flex justify-content-between align-items-start gap-3 flex-wrap';

        const leftTop = document.createElement('div');
        leftTop.className = 'd-flex align-items-center gap-2 flex-wrap ticket-title-wrap';

        const userId = document.createElement('span');
        userId.className = 'card-content-id fw-bold';
        userId.textContent = `#${user.id}`;

        const separator = document.createElement('span');
        separator.className = 'card-separator';
        separator.textContent = '|';

        const username = document.createElement('span');
        username.className = 'card-subject fw-bold';
        username.textContent = user.username;

        const badge = document.createElement('span');
        switch (user.active) {
            case 0: {
                badge.className = 'badge bg-danger';
                badge.innerHTML = 'Letiltva';
                break;
            }
            case 1: {
                badge.className = 'badge bg-success';
                badge.innerHTML = 'Aktív';
                break;
            }
        }

        leftTop.appendChild(userId);
        leftTop.appendChild(separator);
        leftTop.appendChild(username);

        headerTop.appendChild(leftTop);
        headerTop.appendChild(badge);

        
        // alsó sor a headerben
        const createdDate = document.createElement('div');
        createdDate.className = 'card-content-date mt-2';
        createdDate.textContent = `Létrehozva: ${ formatDate(user.created_at)}`;

        header.appendChild(headerTop);
        header.appendChild(createdDate);
        
        const collapse = document.createElement('div');
        collapse.className = 'collapse';
        collapse.id = `ticket-${user.id}`;

        const body = document.createElement('div');
        body.className = 'card-body admin-card-body';

        let loaded = false;

        card.addEventListener('click', async () => {
            if(loaded){return;}

            body.innerHTML = '<div class="text-secondary">Betöltés...</div>';
            try {
                await userAllData(user.id, body);
                loaded = true;
            } catch (error) {
                console.error(error.message);
                body.innerHTML = '<div class="text-danger">Sikertelen betöltés.</div>';
            }
        });
        
        collapse.appendChild(body);
        card.appendChild(header);
        card.appendChild(collapse);

        container.appendChild(card);
    }
}
async function userAllData(id, container) {
    try {
        const user = await getFetch('http://127.0.0.1:3000/api/admin/user/'+id);
        renderUserBody(user.user, container);
    } catch (error) {
        console.error(error.message)
    }
}
function renderUserBody(user, container) {
    container.innerHTML = '';

    const topRow = document.createElement('div');
    topRow.className = 'd-flex justify-content-between align-items-start gap-3 flex-wrap';

    const nameWrap = document.createElement('div');
    nameWrap.className = 'd-flex flex-column gap-2';

    const fullName = document.createElement('h5');
    fullName.className = 'mb-0';
    fullName.textContent = `${user.first_name} ${user.last_name}`;

    const usernameRow = document.createElement('div');
    usernameRow.className = 'd-flex align-items-center gap-2 flex-wrap';

    const usernameLabel = document.createElement('span');
    usernameLabel.className = 'card-content-date';
    usernameLabel.textContent = 'Felhasználónév:';

    const usernameValue = document.createElement('div');
    usernameValue.className = 'ticket-message-box py-2 px-3';
    usernameValue.style.cursor = 'text';
    usernameValue.textContent = user.username;
    usernameValue.contentEditable = false;

    let skipFocusoutSave = false;
    usernameValue.addEventListener('click', () => {
        usernameValue.contentEditable = true;
        usernameValue.focus();
    });
    usernameValue.addEventListener('focusout', async()=>{
        if(skipFocusoutSave){
            skipFocusoutSave = false;
            return;
        }
        skipFocusoutSave = true;
        try {
            let patchObj = {
                new_username: usernameValue.innerText.trim()
            }
            const data = await patchFetch('http://127.0.0.1:3000/api/admin/user/username/'+user.id, patchObj);
            alert(data.message);
            usernameValue.blur();
            usernameValue.contentEditable = false;
            refreshSections();
        } catch (error) {
            console.error(error.message);
            alert(error.message);
        }

    });
    usernameValue.addEventListener('keydown', async(e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            skipFocusoutSave = true;
            try {
                let patchObj = {
                    new_username: usernameValue.innerText.trim()
                }
                const data = await patchFetch('http://127.0.0.1:3000/api/admin/user/username/'+user.id, patchObj);
                alert(data.message);
                usernameValue.blur();
                usernameValue.contentEditable = false;
                refreshSections();
            } catch (error) {
                console.error(error.message);
                alert(error.message);
            }
        }
    });

    const emailRow = document.createElement('div');
    emailRow.className = 'd-flex align-items-center gap-2 flex-wrap';

    const emailLabel = document.createElement('span');
    emailLabel.className = 'card-content-date';
    emailLabel.textContent = 'Email:';

    const emailValue = document.createElement('div');
    emailValue.className = 'ticket-message-box py-2 px-3';
    emailValue.style.cursor = 'text';
    emailValue.textContent = user.email;
    emailValue.contentEditable = false;

    emailValue.addEventListener('click', () => {
        emailValue.contentEditable = true;
        emailValue.focus();
    });
    emailValue.addEventListener('focusout', async()=>{
        if(skipFocusoutSave){
            skipFocusoutSave = false;
            return;
        }
        skipFocusoutSave = true;
        try {
            let patchObj = {
                new_email: emailValue.innerText.trim()
            }
            const data = await patchFetch('http://127.0.0.1:3000/api/admin/user/email/'+user.id, patchObj);
            alert(data.message);
            emailValue.blur();
            emailValue.contentEditable = false;
            refreshSections();
        } catch (error) {
            console.error(error.message);
            alert(error.message);
        }

    });
    emailValue.addEventListener('keydown', async(e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            skipFocusoutSave = true;
            try {
                let patchObj = {
                    new_email: emailValue.innerText.trim()
                }
                const data = await patchFetch('http://127.0.0.1:3000/api/admin/user/email/'+user.id, patchObj);
                alert(data.message);
                emailValue.blur();
                emailValue.contentEditable = false;
                refreshSections();
            } catch (error) {
                console.error(error.message);
                alert(error.message);
            }
        }
    });

    nameWrap.appendChild(fullName);
    usernameRow.appendChild(usernameLabel);
    usernameRow.appendChild(usernameValue);
    emailRow.appendChild(emailLabel);
    emailRow.appendChild(emailValue);
    nameWrap.appendChild(usernameRow);
    nameWrap.appendChild(emailRow);

    const badgeWrap = document.createElement('div');
    badgeWrap.className = 'd-flex gap-2 flex-wrap';

    const activeBadge = document.createElement('span');
    activeBadge.className = user.active ? 'badge bg-success' : 'badge bg-danger';
    activeBadge.textContent = user.active ? 'Aktív' : 'Letiltva';

    const adminBadge = document.createElement('span');
    adminBadge.className = user.admin ? 'badge bg-warning text-dark' : 'badge bg-secondary';
    adminBadge.textContent = user.admin ? 'Admin' : 'Felhasználó';

    const registeredBadge = document.createElement('span');
    registeredBadge.className = user.registered ? 'badge bg-primary' : 'badge bg-dark';
    registeredBadge.textContent = user.registered ? 'Regisztrált' : 'Nincs kész';

    badgeWrap.appendChild(activeBadge);
    badgeWrap.appendChild(adminBadge);
    badgeWrap.appendChild(registeredBadge);

    topRow.appendChild(nameWrap);
    topRow.appendChild(badgeWrap);

    const hr1 = document.createElement('hr');
    hr1.className = 'ticket-divider';

    const profileTitle = document.createElement('h6');
    profileTitle.className = 'ticket-section-title';
    profileTitle.textContent = 'Profil adatok';

    const profileBox = document.createElement('div');
    profileBox.className = 'ticket-message-box';

    const grid = document.createElement('div');
    grid.className = 'd-flex flex-wrap gap-3';

    function createItem(label, value) {
        const item = document.createElement('div');
        item.className = 'd-flex flex-column px-2 py-1';
        item.style.minWidth = '140px';

        const l = document.createElement('span');
        l.className = 'card-content-date';
        l.textContent = label;

        const v = document.createElement('span');
        v.className = 'fw-semibold';
        v.textContent = value ?? '-';

        item.appendChild(l);
        item.appendChild(v);

        return item;
    }

    grid.appendChild(createItem('Kor', user.age));
    grid.appendChild(createItem('Magasság', user.height ? user.height + ' cm' : '-'));
    grid.appendChild(createItem('Nem', user.gender));
    grid.appendChild(createItem('Cél', user.goal));
    grid.appendChild(createItem('Szint', user.experience_level));
    grid.appendChild(createItem('Edzésnapok', user.training_days));
    grid.appendChild(createItem('Hely', user.training_location));
    grid.appendChild(createItem('Étrend', user.diet_type));
    grid.appendChild(createItem('Étkezés/nap', user.meals_per_day));

    profileBox.appendChild(grid);

    const hr2 = document.createElement('hr');
    hr2.className = 'ticket-divider';

    const weightTitle = document.createElement('h6');
    weightTitle.className = 'ticket-section-title';
    weightTitle.textContent = 'Utolsó mentett súly';

    const weightBox = document.createElement('div');
    weightBox.className = 'ticket-message-box';

    const weight = document.createElement('div');
    weight.textContent = user.weight ? `${user.weight} kg` : '-';

    const weightDate = document.createElement('div');
    weightDate.className = 'card-content-date mt-2';
    weightDate.textContent = `Mentve: ${user.weight_date ? formatDate(user.weight_date) : '-'}`;

    weightBox.appendChild(weight);
    weightBox.appendChild(weightDate);

    const hr3 = document.createElement('hr');
    hr3.className = 'ticket-divider';

    const datesWrap = document.createElement('div');
    datesWrap.className = 'ticket-dates';

    const registrationDate = document.createElement('div');
    registrationDate.textContent = `Regisztráció befejezése: ${user.registration_date ? formatDate(user.registration_date) : '-'}`;

    const profileDate = document.createElement('div');
    profileDate.textContent = `Profil mentve: ${user.profil_date ? formatDate(user.profil_date) : '-'}`;

    datesWrap.appendChild(registrationDate);
    datesWrap.appendChild(profileDate);

    const hr4 = document.createElement('hr');
    hr4.className = 'ticket-divider';

    const actionWrap = document.createElement('div');
    actionWrap.className = 'd-flex flex-wrap gap-2 justify-content-end';

    const resetPassBtn = document.createElement('button');
    resetPassBtn.className = 'btn btn-outline-info';
    resetPassBtn.textContent = 'Új jelszó email';

    const adminBtn = document.createElement('button');
    adminBtn.className = 'btn btn-outline-warning';
    adminBtn.textContent = user.admin ? 'Admin jog elvétele' : 'Adminná tétel';

    const disableBtn = document.createElement('button');
    disableBtn.className = user.active ? 'btn btn-outline-danger' : 'btn btn-outline-success';
    disableBtn.textContent = user.active ? 'Letiltás' : 'Aktiválás';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-outline-danger';
    deleteBtn.textContent = 'Törlés';

    resetPassBtn.addEventListener('click', async() => {
        try {
            let postObj = {
                email: user.email
            }
            const data = await postRequest('http://127.0.0.1:3000/api/auth/request-password', postObj);
            alert(data.message);
        } catch (error) {
            console.error(error.message);
            alert(error.message);
        }
    });

    adminBtn.addEventListener('click', async() => {
        try {
            let postObj = {
                adminStatus: user.admin
            }
            const data = await patchFetch('http://127.0.0.1:3000/api/admin/user/toggle-admin/'+user.id, postObj);
            alert(data.message);
            refreshSections();
        } catch (error) {
            console.error(error.message);
            alert(error.message);
        }
    });

    disableBtn.addEventListener('click', async() => {
        try {
            let postObj = {
                active: user.active
            }
            const data = await patchFetch('http://127.0.0.1:3000/api/admin/user/toggle-block/'+user.id, postObj);
            alert(data.message);
            refreshSections();
        } catch (error) {
            console.error(error.message);
            alert(error.message);
        }
    });

    deleteBtn.addEventListener('click', async() => {
        try {
            const data = await deleteFetch('http://127.0.0.1:3000/api/admin/user/delete/'+user.id);
            alert(data.message);
            refreshSections();
        } catch (error) {
            console.error(error.message);
            alert(error.message);
        }
    });

    actionWrap.appendChild(resetPassBtn);
    actionWrap.appendChild(adminBtn);
    actionWrap.appendChild(disableBtn);
    actionWrap.appendChild(deleteBtn);

    container.appendChild(topRow);
    container.appendChild(hr1);
    container.appendChild(profileTitle);
    container.appendChild(profileBox);
    container.appendChild(hr2);
    container.appendChild(weightTitle);
    container.appendChild(weightBox);
    container.appendChild(hr3);
    container.appendChild(datesWrap);
    container.appendChild(hr4);
    container.appendChild(actionWrap);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('hu-HU');
}