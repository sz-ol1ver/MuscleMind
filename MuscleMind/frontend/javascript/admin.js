import {deleteFetch, getFetch, patchFetch, postRequest, postForm} from './api.js';

let openT = [];
let closedT = [];

let users = [];

let containerOpen;
let containerClosed;

let containerUsers;

let containerFoods;
let adminFoods = [];
let userFoods = [];
// szűrt tömbök
let filteredAdminFoods = [];
let filteredUserFoods = [];
let newFoodForm;

document.addEventListener('DOMContentLoaded', ()=>{
    const dashRefresh = document.getElementById('refresh-dash');
    const allSeen = document.getElementById('ticket-seen');
    const adminBtn = document.getElementById('user-admin');
    containerOpen = document.getElementById('open-tickets');
    containerClosed = document.getElementById('closed-tickets');
    containerUsers = document.getElementById('users-container');
    containerFoods = document.getElementById('foods-container');
    newFoodForm = document.getElementById('food-create-form');

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
    // filter reset btn
    document.getElementById("filter-reset-btn").addEventListener("click", () => {
        resetFilters();
        applyFilters();
    });
    // filter addeventlisteners
    document.querySelectorAll(
    "#filter-level, #filter-location, #filter-goal, #filter-difficulty, #highProtein, #lowCarb, #bulking, #cutting"
    ).forEach(filter => {
        filter.addEventListener("change", applyFilters);
    });
    newFoodForm.addEventListener('submit', (e)=>{
        e.preventDefault();
        postNewFood();
    })
});

//? refresh section data
function refreshSections(){
    loadDash();
    loadTickets();
    loadUsers();
    resetFilters();
    loadFoods();
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

        const separator3 = document.createElement('span');
        separator3.className = 'card-separator';
        separator3.textContent = '|';

        const bodyWrap = document.createElement('div');
        bodyWrap.className = 'd-flex align-items-start gap-3';

        const email = document.createElement('h5');
        email.innerHTML = ticket.email;
        email.className = 'mb-0';

        const preId = document.createElement('p');
        preId.innerHTML = 'Kapcsolódó ticket id: '+ticket.related_request_id;
        preId.className = 'mb-0';

        bodyWrap.appendChild(email);
        if(ticket.related_request_id){
            bodyWrap.appendChild(separator3)
            bodyWrap.appendChild(preId);
        }

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

        body.appendChild(bodyWrap);
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
    let usernameDef = '';
    usernameValue.addEventListener('click', () => {
        usernameValue.contentEditable = true;
        usernameDef = usernameValue.innerText.trim();
        usernameValue.focus();
    });
    usernameValue.addEventListener('focusout', async()=>{
        const newValue = usernameValue.innerText.trim();

        if (newValue === usernameDef) {
            usernameValue.innerText = usernameDef;
            usernameValue.contentEditable = false;
            return;
        }
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
            const newValue = usernameValue.innerText.trim();

            if (newValue === usernameDef) {
                usernameValue.innerText = usernameDef;
                usernameValue.contentEditable = false;
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

    let emailDef = '';
    emailValue.addEventListener('click', () => {
        emailValue.contentEditable = true;
        emailDef = emailValue.innerText.trim();
        emailValue.focus();
    });
    emailValue.addEventListener('focusout', async()=>{
        const newValue = emailValue.innerText.trim();

        if (newValue === emailDef) {
            emailValue.innerText = emailDef;
            emailValue.contentEditable = false;
            return;
        }
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
            const newValue = emailValue.innerText.trim();

            if (newValue === emailDef) {
                emailValue.innerText = emailDef;
                emailValue.contentEditable = false;
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

//? foods
async function postNewFood() {
    try {
        const newFood = new FormData(newFoodForm)
        const data = await postForm('http://127.0.0.1:3000/api/admin/foods/new-food', newFood);
        console.log(data);
        setTimeout(() => {
            newFoodForm.reset();
        }, 5000);
    } catch (error) {
        console.error(error.message);
    }
}
async function loadFoods(){
    try {
        const data = await getFetch('http://127.0.0.1:3000/api/admin/foods/all-foods');
        renderFoods(data.foods, containerFoods);
    } catch (error) {
        console.error(error.message);
    }
}
function renderFoods(foods, container){
    container.innerHTML = '';

    adminFoods = [];
    userFoods = [];

    for(const food of foods){
        if(food.user_id === null || food.user_id === undefined){
            adminFoods.push(food);
        }else{
            userFoods.push(food);
        }
    }

    const adminSection = document.createElement('div');
    adminSection.className = 'foods-split-section';

    const userSection = document.createElement('div');
    userSection.className = 'foods-split-section';

    const adminTitle = document.createElement('h6');
    adminTitle.className = 'ticket-section-title';
    adminTitle.textContent = 'Admin receptek';

    const userTitle = document.createElement('h6');
    userTitle.className = 'ticket-section-title';
    userTitle.textContent = 'Felhasználói receptek';

    const adminList = document.createElement('div');
    adminList.className = 'foods-scroll';

    const userList = document.createElement('div');
    userList.className = 'foods-scroll';

    adminSection.appendChild(adminTitle);
    adminSection.appendChild(adminList);

    userSection.appendChild(userTitle);
    userSection.appendChild(userList);

    container.appendChild(adminSection);
    container.appendChild(userSection);

    renderFoodCards(adminFoods, adminList, 'admin');
    renderFoodCards(userFoods, userList, 'user');
}
function renderFilteredFoods(container){
    container.innerHTML = '';

    const adminSection = document.createElement('div');
    adminSection.className = 'foods-split-section';

    const userSection = document.createElement('div');
    userSection.className = 'foods-split-section';

    const adminTitle = document.createElement('h6');
    adminTitle.className = 'ticket-section-title';
    adminTitle.textContent = 'Admin receptek';

    const userTitle = document.createElement('h6');
    userTitle.className = 'ticket-section-title';
    userTitle.textContent = 'Felhasználói receptek';

    const adminList = document.createElement('div');
    adminList.className = 'foods-scroll';

    const userList = document.createElement('div');
    userList.className = 'foods-scroll';

    adminSection.appendChild(adminTitle);
    adminSection.appendChild(adminList);

    userSection.appendChild(userTitle);
    userSection.appendChild(userList);

    container.appendChild(adminSection);
    container.appendChild(userSection);

    renderFoodCards(filteredAdminFoods, adminList, 'admin');
    renderFoodCards(filteredUserFoods, userList, 'user');
}
function renderFoodCards(foods, container, prefix){
    container.innerHTML = '';

    if(!foods || foods.length === 0){
        const empty = document.createElement('p');
        empty.className = 'text-center text-secondary';
        empty.textContent = 'Nincs megjeleníthető recept.';
        container.appendChild(empty);
        return;
    }

    for(const food of foods){
        const card = document.createElement('div');
        card.className = 'card admin-card mb-3 w-100';

        const header = document.createElement('div');
        header.className = 'card-header admin-card-header';
        header.style.cursor = 'pointer';
        header.setAttribute('data-bs-toggle', 'collapse');
        header.setAttribute('data-bs-target', `#food-${prefix}-${food.id}`);
        header.setAttribute('aria-expanded', 'false');
        header.setAttribute('aria-controls', `food-${prefix}-${food.id}`);

        const headerTop = document.createElement('div');
        headerTop.className = 'd-flex justify-content-between align-items-start gap-3 flex-wrap';

        const leftTop = document.createElement('div');
        leftTop.className = 'd-flex align-items-center gap-2 flex-wrap ticket-title-wrap';

        const foodId = document.createElement('span');
        foodId.className = 'card-content-id fw-bold';
        foodId.textContent = `#${food.id}`;

        const separator = document.createElement('span');
        separator.className = 'card-separator';
        separator.textContent = '|';

        const name = document.createElement('span');
        name.className = 'card-subject fw-bold';
        name.textContent = food.name;

        leftTop.appendChild(foodId);
        leftTop.appendChild(separator);
        leftTop.appendChild(name);

        const badgeWrap = document.createElement('div');
        badgeWrap.className = 'd-flex align-items-center gap-2 flex-wrap';

        const approvedBadge = document.createElement('span');
        approvedBadge.className = food.is_approved ? 'badge bg-success' : 'badge bg-danger';
        approvedBadge.textContent = food.is_approved ? 'Jóváhagyva' : 'Nincs jóváhagyva';
        badgeWrap.appendChild(approvedBadge);

        headerTop.appendChild(leftTop);
        headerTop.appendChild(badgeWrap);

        const createdDate = document.createElement('div');
        createdDate.className = 'card-content-date mt-2';
        createdDate.textContent = `Létrehozva: ${formatDate(food.created_at)}`;

        header.appendChild(headerTop);
        header.appendChild(createdDate);

        const collapse = document.createElement('div');
        collapse.className = 'collapse';
        collapse.id = `food-${prefix}-${food.id}`;

        const body = document.createElement('div');
        body.className = 'card-body admin-card-body';

        const topInfoWrap = document.createElement('div');
        topInfoWrap.className = 'd-flex flex-wrap gap-3';

        topInfoWrap.appendChild(createFoodInfoItem('Kategória', food.category));
        topInfoWrap.appendChild(createFoodInfoItem('Diéta', food.diet_tag));
        topInfoWrap.appendChild(createFoodInfoItem('Cél', food.goal_tag));
        topInfoWrap.appendChild(createFoodInfoItem('Nehézség', food.difficulty));
        topInfoWrap.appendChild(createFoodInfoItem('Elkészítési idő', food.prep_time_min ? `${food.prep_time_min} perc` : '-'));
        topInfoWrap.appendChild(createFoodInfoItem('Adag', `${food.serving_size} ${food.serving_unit}`));

        if(food.user_id !== null && food.user_id !== undefined){
            topInfoWrap.appendChild(createFoodInfoItem('Beküldő user id', `#${food.user_id}`));
        }

        const hr1 = document.createElement('hr');
        hr1.className = 'ticket-divider';

        const tagTitle = document.createElement('h6');
        tagTitle.className = 'ticket-section-title';
        tagTitle.textContent = 'Címkék';

        const tagWrap = document.createElement('div');
        tagWrap.className = 'd-flex flex-wrap gap-2';

        let hasTags = false;

        if(food.high_protein){
            const badge = document.createElement('span');
            badge.className = 'badge bg-primary';
            badge.textContent = 'Magas fehérje';
            tagWrap.appendChild(badge);
            hasTags = true;
        }

        if(food.low_carb){
            const badge = document.createElement('span');
            badge.className = 'badge bg-warning text-dark';
            badge.textContent = 'Low carb';
            tagWrap.appendChild(badge);
            hasTags = true;
        }

        if(food.bulk_friendly){
            const badge = document.createElement('span');
            badge.className = 'badge bg-info text-dark';
            badge.textContent = 'Tömegeléshez';
            tagWrap.appendChild(badge);
            hasTags = true;
        }

        if(food.cut_friendly){
            const badge = document.createElement('span');
            badge.className = 'badge bg-secondary';
            badge.textContent = 'Szálkásításhoz';
            tagWrap.appendChild(badge);
            hasTags = true;
        }

        if(!hasTags){
            const emptyTags = document.createElement('div');
            emptyTags.className = 'ticket-empty-message';
            emptyTags.textContent = 'Nincs megadott címke.';
            tagWrap.appendChild(emptyTags);
        }

        const hr2 = document.createElement('hr');
        hr2.className = 'ticket-divider';

        const allergenTitle = document.createElement('h6');
        allergenTitle.className = 'ticket-section-title';
        allergenTitle.textContent = 'Allergének';

        const allergenWrap = document.createElement('div');
        allergenWrap.className = 'd-flex flex-wrap gap-2';

        if(food.allergens && food.allergens.length > 0){
            for(const allergen of food.allergens){
                const badge = document.createElement('span');
                badge.className = 'badge food-allergen-badge';
                badge.textContent = typeof allergen === 'string' ? allergen : allergen.name;
                allergenWrap.appendChild(badge);
            }
        }else{
            const emptyAllergen = document.createElement('div');
            emptyAllergen.className = 'ticket-empty-message';
            emptyAllergen.textContent = 'Nincs megadott allergén.';
            allergenWrap.appendChild(emptyAllergen);
        }

        const hr3 = document.createElement('hr');
        hr3.className = 'ticket-divider';

        const descTitle = document.createElement('h6');
        descTitle.className = 'ticket-section-title';
        descTitle.textContent = 'Leírás';

        const descBox = document.createElement('div');
        descBox.className = 'ticket-message-box';
        descBox.textContent = food.description;

        const hr4 = document.createElement('hr');
        hr4.className = 'ticket-divider';

        const nutritionTitle = document.createElement('h6');
        nutritionTitle.className = 'ticket-section-title';
        nutritionTitle.textContent = 'Tápértékek';

        const nutritionBox = document.createElement('div');
        nutritionBox.className = 'ticket-message-box';

        const nutritionGrid = document.createElement('div');
        nutritionGrid.className = 'd-flex flex-wrap gap-3';

        nutritionGrid.appendChild(createFoodInfoItem('Kalória', `${food.calories_kcal} kcal`));
        nutritionGrid.appendChild(createFoodInfoItem('Fehérje', `${food.protein_g} g`));
        nutritionGrid.appendChild(createFoodInfoItem('Szénhidrát', `${food.carbs_g} g`));
        nutritionGrid.appendChild(createFoodInfoItem('Zsír', `${food.fat_g} g`));
        nutritionGrid.appendChild(createFoodInfoItem('Rost', `${food.fiber_g} g`));
        nutritionGrid.appendChild(createFoodInfoItem('Cukor', `${food.sugar_g} g`));
        nutritionGrid.appendChild(createFoodInfoItem('Só', `${food.salt_g} g`));

        nutritionBox.appendChild(nutritionGrid);

        const hr5 = document.createElement('hr');
        hr5.className = 'ticket-divider';

        const footerWrap = document.createElement('div');
        footerWrap.className = 'd-flex flex-wrap justify-content-between align-items-end gap-3';

        const datesWrap = document.createElement('div');
        datesWrap.className = 'ticket-dates';

        const createdInfo = document.createElement('div');
        createdInfo.textContent = `Létrehozva: ${formatDate(food.created_at)}`;

        const updatedInfo = document.createElement('div');
        updatedInfo.textContent = `Szerkesztve: ${formatDate(food.updated_at)}`;

        datesWrap.appendChild(createdInfo);
        datesWrap.appendChild(updatedInfo);

        footerWrap.appendChild(datesWrap);

        const actionWrap = document.createElement('div');
        actionWrap.className = 'd-flex flex-wrap gap-2';

        if(food.user_id !== null && food.user_id !== undefined){
            const approveBtn = document.createElement('button');
            approveBtn.className = food.is_approved ? 'btn btn-outline-warning' : 'btn btn-outline-success';
            approveBtn.textContent = food.is_approved ? 'Jóváhagyás visszavonása' : 'Jóváhagyás';

            approveBtn.addEventListener('click', async(e)=>{
                e.stopPropagation();
                try {
                    const patchObj = {
                        is_approved: food.is_approved
                    };
                    const data = await patchFetch('http://127.0.0.1:3000/api/admin/foods/toggle-approved/' + food.id, patchObj);
                    alert(data.message);
                    loadFoods();
                } catch (error) {
                    console.error(error.message);
                    alert(error.message);
                }
            });

            actionWrap.appendChild(approveBtn);
        }

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-outline-danger';
        deleteBtn.textContent = 'Törlés';

        deleteBtn.addEventListener('click', async(e)=>{
            e.stopPropagation();
            try {
                const data = await deleteFetch('http://127.0.0.1:3000/api/admin/foods/delete-food/' + food.id);
                alert(data.message);
                loadFoods();
            } catch (error) {
                console.error(error.message);
                alert(error.message);
            }
        });

        actionWrap.appendChild(deleteBtn);
        footerWrap.appendChild(actionWrap);

        body.appendChild(topInfoWrap);
        body.appendChild(hr1);
        body.appendChild(tagTitle);
        body.appendChild(tagWrap);
        body.appendChild(hr2);
        body.appendChild(allergenTitle);
        body.appendChild(allergenWrap);
        body.appendChild(hr3);
        body.appendChild(descTitle);
        body.appendChild(descBox);
        body.appendChild(hr4);
        body.appendChild(nutritionTitle);
        body.appendChild(nutritionBox);
        body.appendChild(hr5);
        body.appendChild(footerWrap);

        collapse.appendChild(body);
        card.appendChild(header);
        card.appendChild(collapse);

        container.appendChild(card);
    }
}
function createFoodInfoItem(label, value){
    const item = document.createElement('div');
    item.className = 'd-flex flex-column px-2 py-1';
    item.style.minWidth = '140px';

    const span1 = document.createElement('span');
    span1.className = 'card-content-date';
    span1.textContent = label;

    const span2 = document.createElement('span');
    span2.className = 'fw-semibold';
    span2.textContent = value ?? '-';

    item.appendChild(span1);
    item.appendChild(span2);

    return item;
}
function applyFilters() {
    // SELECT értékek
    const category = document.getElementById("filter-level").value;
    const diet = document.getElementById("filter-location").value;
    const goal = document.getElementById("filter-goal").value;
    const difficulty = document.getElementById("filter-difficulty").value;

    // CHECKBOX értékek
    const highProtein = document.getElementById("highProtein").checked;
    const lowCarb = document.getElementById("lowCarb").checked;
    const bulking = document.getElementById("bulking").checked;
    const cutting = document.getElementById("cutting").checked;

    // reset
    filteredAdminFoods = [];
    filteredUserFoods = [];

    adminFoods.forEach(food => {
        let match = true;

        // SELECT SZŰRŐK
        if (category !== "all" && food.category !== category) match = false;
        if (diet !== "all" && food.diet_tag !== diet) match = false;
        if (goal !== "all" && food.goal_tag !== goal) match = false;
        if (difficulty !== "all" && food.difficulty !== difficulty) match = false;

        // CHECKBOX SZŰRŐK
        if (highProtein && !food.high_protein) match = false;
        if (lowCarb && !food.low_carb) match = false;
        if (bulking && !food.bulk_friendly) match = false;
        if (cutting && !food.cut_friendly) match = false;

        // HA MEGFELEL
        if (match) {
            filteredAdminFoods.push(food);
        }
    });
    userFoods.forEach(food => {
        let match = true;

        // SELECT SZŰRŐK
        if (category !== "all" && food.category !== category) match = false;
        if (diet !== "all" && food.diet_tag !== diet) match = false;
        if (goal !== "all" && food.goal_tag !== goal) match = false;
        if (difficulty !== "all" && food.difficulty !== difficulty) match = false;

        // CHECKBOX SZŰRŐK
        if (highProtein && !food.high_protein) match = false;
        if (lowCarb && !food.low_carb) match = false;
        if (bulking && !food.bulk_friendly) match = false;
        if (cutting && !food.cut_friendly) match = false;

        // HA MEGFELEL
        if (match) {
            filteredUserFoods.push(food);
        }
    });
    renderFilteredFoods(containerFoods);
}
function resetFilters(){
    // selectek reset
    document.getElementById("filter-level").value = "all";
    document.getElementById("filter-location").value = "all";
    document.getElementById("filter-goal").value = "all";
    document.getElementById("filter-difficulty").value = "all";

    // checkboxok reset
    document.getElementById("highProtein").checked = false;
    document.getElementById("lowCarb").checked = false;
    document.getElementById("bulking").checked = false;
    document.getElementById("cutting").checked = false;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('hu-HU');
}