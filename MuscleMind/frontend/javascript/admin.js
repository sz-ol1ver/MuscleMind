import {deleteFetch, getFetch, patchFetch, postRequest, postForm, putForm} from './api.js';

let adminToggleForm;
let adminToggleUserIdInput;

let openT = [];
let closedT = [];
let containerOpen;
let containerClosed;

let users = [];
let containerUsers;

let containerFoods;
let adminFoods = [];
let userFoods = [];
let approvalFoods = [];
// szűrt tömbök
let filteredAdminFoods = [];
let filteredUserFoods = [];
let filteredApprovalFoods = [];
let newFoodForm;

let workoutContainer;
let adminWorkouts = [];
let usersWorkouts = [];
let filteredAdminWorkouts = [];
let filteredUsersWorkouts = [];
let workoutForm;
let workoutDaysCountInput;
let workoutDaysBuilder;
let allExercises = [];
let workoutEditMode = false;
let editingWorkoutId = null;
let workoutCancelEditBtn = null;

document.addEventListener('DOMContentLoaded', ()=>{
    const dashRefresh = document.getElementById('refresh-dash');
    const allSeen = document.getElementById('ticket-seen');
    const adminBtn = document.getElementById('user-admin');
    const allRefresh = document.getElementById('refresh-datas');
    containerOpen = document.getElementById('open-tickets');
    containerClosed = document.getElementById('closed-tickets');
    containerUsers = document.getElementById('users-container');
    containerFoods = document.getElementById('foods-container');
    newFoodForm = document.getElementById('food-create-form');
    workoutContainer = document.getElementById('workout-container');
    workoutForm = document.getElementById('workout-create-form');
    workoutDaysCountInput = document.getElementById('workout-days-count');
    workoutDaysBuilder = document.getElementById('workout-days-builder');
    const adminModalElement = document.getElementById('adminToggleModal');
    adminToggleForm = document.getElementById('admin-toggle-form');
    adminToggleUserIdInput = document.getElementById('admin-toggle-user-id');

    refreshSections();

    adminModalElement.addEventListener('hide.bs.modal', () => {
        if(adminModalElement.contains(document.activeElement)){
            document.activeElement.blur();
        }
    });
    workoutDaysCountInput.addEventListener('change', () => {
        const currentWorkout = collectWorkoutFormData();
        generateWorkoutDays();
        refillWorkoutDays(currentWorkout);
    });
    adminToggleForm.addEventListener('submit', async(e)=>{
        e.preventDefault();
        await toggleAdminById();
    });
    dashRefresh.addEventListener('click', ()=>{
        loadDash();
    });
    allSeen.addEventListener('click', async()=>{
        if(openT.length == 0){
            return;
        }
        try {
            const data = await patchFetch('http://127.0.0.1:3000/api/admin/tickets/all/seen');
            console.log(data.message);
            loadTickets();
        } catch (error) {
            console.error(error.message);
        }
    });
    allRefresh.addEventListener('click', ()=>{
        refreshSections();
    });

    //? filters
    document.getElementById("filter-food-reset-btn").addEventListener("click", () => {
        resetFilters();
        applyFilters();
    });
    document.querySelectorAll(
    "#filter-food-category, #filter-food-type, #filter-food-goal, #filter-food-difficulty, #highProtein, #lowCarb, #bulking, #cutting"
    ).forEach(filter => {
        filter.addEventListener("change", applyFilters);
    });
    document.getElementById("filter-reset-btn").addEventListener("click", () => {
        resetWorkoutFilters();
        applyWorkoutFilters();
    });

    document.querySelectorAll(
        "#filter-level, #filter-location, #filter-goal, #filter-days"
    ).forEach(filter => {
        filter.addEventListener("change", applyWorkoutFilters);
    });

    //? new forms
    newFoodForm.addEventListener('submit', (e)=>{
        e.preventDefault();
        postNewFood();
    });
    workoutForm.addEventListener('submit', async(e)=>{
    e.preventDefault();
        if(workoutEditMode){
            await updateAdminWorkout();
        }else{
            await createAdminWorkout();
        }
    });
});

//? refresh section data
function refreshSections(){
    loadDash();
    loadTickets();
    loadUsers();
    resetFilters();
    resetWorkoutFilters();
    loadFoods();
    loadWorkouts();
    loadExercises();
}

//? admin modal
async function toggleAdminById(){
    try {
        const userId = Number(adminToggleUserIdInput.value);

        if(!Number.isInteger(userId) || userId < 1){
            return alert('Adj meg érvényes felhasználó ID-t!');
        }

        const data = await patchFetch('http://127.0.0.1:3000/api/admin/user/toggle-admin/' + userId);

        alert(data.message);

        adminToggleForm.reset();

        const modalElement = document.getElementById('adminToggleModal');
        const modal = bootstrap.Modal.getInstance(modalElement);

        modal.hide();

        refreshSections();
    } catch (error) {
        console.error(error.message);
        alert(error.message);
    }
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
        const data = await getFetch('http://127.0.0.1:3000/api/admin/tickets/all');
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
                const data = await patchFetch('http://127.0.0.1:3000/api/admin/ticket/close/'+ticket.id);
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
                    const data = await patchFetch('http://127.0.0.1:3000/api/admin/ticket/answer/'+ticket.id, patchObj);
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
                        const data = await patchFetch('http://127.0.0.1:3000/api/admin/ticket/answer/'+ticket.id, patchObj);
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
                    const data = await patchFetch('http://127.0.0.1:3000/api/admin/ticket/seen/'+ticket.id);
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
        const data = await getFetch('http://127.0.0.1:3000/api/admin/users/all');
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

    grid.appendChild(createItem('Születési dátum', formatOnlyDate(user.birth_date)));
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

    const hrMetrics = document.createElement('hr');
    hrMetrics.className = 'ticket-divider';

    const metricsTitle = document.createElement('h6');
    metricsTitle.className = 'ticket-section-title';
    metricsTitle.textContent = 'Kalkulált adatok';

    const metricsBox = document.createElement('div');
    metricsBox.className = 'ticket-message-box';

    const metricsGrid = document.createElement('div');
    metricsGrid.className = 'd-flex flex-wrap gap-3';

    metricsGrid.appendChild(createItem('BMI', user.bmi ?? '-'));
    metricsGrid.appendChild(createItem('BMR', user.bmr ? `${user.bmr} kcal` : '-'));
    metricsGrid.appendChild(createItem('TDEE', user.tdee ? `${user.tdee} kcal` : '-'));
    metricsGrid.appendChild(createItem('Cél kalória', user.goal_calories ? `${user.goal_calories} kcal` : '-'));
    metricsGrid.appendChild(createItem('Ajánlott fehérje', user.protein_recommended ? `${user.protein_recommended} g` : '-'));

    metricsBox.appendChild(metricsGrid);

    const metricsDate = document.createElement('div');
    metricsDate.className = 'card-content-date mt-2';
    metricsDate.textContent = `Kiszámítva: ${user.calculated_at ? formatDate(user.calculated_at) : '-'}`;

    metricsBox.appendChild(metricsDate);

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
            const data = await patchFetch('http://127.0.0.1:3000/api/admin/user/toggle-admin/'+user.id);
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

    container.appendChild(hrMetrics);
    container.appendChild(metricsTitle);
    container.appendChild(metricsBox);

    container.appendChild(hr3);
    container.appendChild(datesWrap);
    container.appendChild(hr4);
    container.appendChild(actionWrap);
}

//? foods
async function postNewFood() {
    try {
        const newFood = new FormData(newFoodForm)
        const data = await postForm('http://127.0.0.1:3000/api/admin/foods/new', newFood);
        console.log(data);
        alert(data.message);
        setTimeout(() => {
            newFoodForm.reset();
            loadFoods()
        }, 2000);
    } catch (error) {
        alert(error.message);
        console.error(error.message);
    }
}
async function loadFoods(){
    try {
        resetFilters();
        const data = await getFetch('http://127.0.0.1:3000/api/admin/foods/all');
        renderFoods(data.foods, containerFoods);
    } catch (error) {
        console.error(error.message);
    }
}
function renderFoods(foods, container){
    container.innerHTML = '';

    adminFoods = [];
    userFoods = [];
    approvalFoods = [];

    for (const food of foods) {
        if (food.share === 1 && !food.is_approved) {
            approvalFoods.push(food);
        } else if (food.user_id === null || food.user_id === undefined) {
            adminFoods.push(food);
        } else {
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

    const approvalSection = document.createElement('div');
    approvalSection.className = 'foods-split-section';

    const approvalTitle = document.createElement('h6');
    approvalTitle.className = 'ticket-section-title';
    approvalTitle.textContent = 'Jóváhagyásra váró receptek';

    const approvalList = document.createElement('div');
    approvalList.className = 'foods-scroll';

    approvalSection.appendChild(approvalTitle);
    approvalSection.appendChild(approvalList);

    adminSection.appendChild(adminTitle);
    adminSection.appendChild(adminList);

    userSection.appendChild(userTitle);
    userSection.appendChild(userList);

    container.appendChild(approvalSection);
    container.appendChild(adminSection);
    container.appendChild(userSection);

    renderFoodCards(adminFoods, adminList, 'admin');
    renderFoodCards(approvalFoods, approvalList, 'approval');
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

    const approvalSection = document.createElement('div');
    approvalSection.className = 'foods-split-section';

    const approvalTitle = document.createElement('h6');
    approvalTitle.className = 'ticket-section-title';
    approvalTitle.textContent = 'Jóváhagyásra váró receptek';

    const approvalList = document.createElement('div');
    approvalList.className = 'foods-scroll';

    approvalSection.appendChild(approvalTitle);
    approvalSection.appendChild(approvalList);

    adminSection.appendChild(adminTitle);
    adminSection.appendChild(adminList);

    userSection.appendChild(userTitle);
    userSection.appendChild(userList);

    container.appendChild(approvalSection);
    container.appendChild(adminSection);
    container.appendChild(userSection);
    
    renderFoodCards(filteredAdminFoods, adminList, 'admin');renderFoodCards(filteredApprovalFoods, approvalList, 'approval');
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

        headerTop.appendChild(leftTop);

        if(prefix === 'approval' || (food.is_approved == 1 && food.user_id !== null)){
            const badgeWrap = document.createElement('div');
            badgeWrap.className = 'd-flex align-items-center gap-2 flex-wrap';

            const prefixBadge = document.createElement('span');

            prefixBadge.className = food.is_approved ? 'badge bg-success' : 'badge bg-danger';

            prefixBadge.textContent = food.is_approved ? 'Jóváhagyva' : 'Nincs jóváhagyva';

            badgeWrap.appendChild(prefixBadge);
            headerTop.appendChild(badgeWrap);
        }

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
            badge.textContent = 'Alacsony szénhidrát';
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

        if (prefix === 'approval' || food.is_approved == 1) {
            const approveBtn = document.createElement('button');

            approveBtn.className = food.is_approved
                ? 'btn btn-outline-warning'
                : 'btn btn-outline-success';

            approveBtn.textContent = food.is_approved
                ? 'Jóváhagyás visszavonása'
                : 'Jóváhagyás';

            approveBtn.addEventListener('click', async(e)=>{
                e.stopPropagation();

                try {
                    const patchObj = {
                        is_approved: food.is_approved
                    };

                    const data = await patchFetch(
                        'http://127.0.0.1:3000/api/admin/foods/toggle-approved/' + food.id,
                        patchObj
                    );

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
            const confirmDelete = confirm('Biztosan törölni szeretnéd ezt az edzéstervet?');

            if(!confirmDelete){
                return;
            }
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
    const category = document.getElementById("filter-food-category").value;
    const diet = document.getElementById("filter-food-type").value;
    const goal = document.getElementById("filter-food-goal").value;
    const difficulty = document.getElementById("filter-food-difficulty").value;

    // CHECKBOX értékek
    const highProtein = document.getElementById("highProtein").checked;
    const lowCarb = document.getElementById("lowCarb").checked;
    const bulking = document.getElementById("bulking").checked;
    const cutting = document.getElementById("cutting").checked;

    // reset
    filteredAdminFoods = [];
    filteredUserFoods = [];
    filteredApprovalFoods = [];

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
    approvalFoods.forEach(food => {
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
            filteredApprovalFoods.push(food);
        }
    });
    renderFilteredFoods(containerFoods);
}
function resetFilters(){
    // selectek reset
    document.getElementById("filter-food-category").value = "all";
    document.getElementById("filter-food-type").value = "all";
    document.getElementById("filter-food-goal").value = "all";
    document.getElementById("filter-food-difficulty").value = "all";

    // checkboxok reset
    document.getElementById("highProtein").checked = false;
    document.getElementById("lowCarb").checked = false;
    document.getElementById("bulking").checked = false;
    document.getElementById("cutting").checked = false;
}

//? workouts
//? workouts
async function loadWorkouts(){
    try {
        adminWorkouts.length = 0;
        usersWorkouts.length = 0;
        filteredAdminWorkouts.length = 0;
        filteredUsersWorkouts.length = 0;

        const data = await getFetch('http://127.0.0.1:3000/api/admin/workouts/all');

        for(const workout of data.default){
            adminWorkouts.push(workout);
        }

        for(const workout of data.users){
            usersWorkouts.push(workout);
        }

        renderWorkouts(workoutContainer);

    } catch (error) {
        console.error(error.message);
    }
}
function renderWorkouts(container){
    container.innerHTML = '';

    const adminSection = document.createElement('div');
    adminSection.className = 'foods-split-section pt-3 px-3';

    const userSection = document.createElement('div');
    userSection.className = 'foods-split-section pt-3 px-3';

    const adminTitle = document.createElement('h6');
    adminTitle.className = 'ticket-section-title';
    adminTitle.textContent = 'Alap edzéstervek';

    const userTitle = document.createElement('h6');
    userTitle.className = 'ticket-section-title mt-4';
    userTitle.textContent = 'Felhasználói edzéstervek';

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

    renderWorkoutCards(adminWorkouts, adminList, 'admin');
    renderWorkoutCards(usersWorkouts, userList, 'user');
}
function renderFilteredWorkouts(container){
    container.innerHTML = '';

    const adminSection = document.createElement('div');
    adminSection.className = 'foods-split-section pt-3 px-3';

    const userSection = document.createElement('div');
    userSection.className = 'foods-split-section pt-3 px-3';

    const adminTitle = document.createElement('h6');
    adminTitle.className = 'ticket-section-title';
    adminTitle.textContent = 'Alap edzéstervek';

    const userTitle = document.createElement('h6');
    userTitle.className = 'ticket-section-title mt-4';
    userTitle.textContent = 'Felhasználói edzéstervek';

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

    renderWorkoutCards(filteredAdminWorkouts, adminList, 'admin');
    renderWorkoutCards(filteredUsersWorkouts, userList, 'user');
}
function renderWorkoutCards(workouts, container, prefix){
    container.innerHTML = '';

    if(!workouts || workouts.length === 0){
        const empty = document.createElement('p');
        empty.className = 'text-center text-secondary';
        empty.textContent = 'Nincs megjeleníthető edzésterv.';
        container.appendChild(empty);
        return;
    }

    for(const workout of workouts){
        const card = document.createElement('div');
        card.className = 'card admin-card mb-3 w-100';

        const header = document.createElement('div');
        header.className = 'card-header admin-card-header';
        header.style.cursor = 'pointer';
        header.setAttribute('data-bs-toggle', 'collapse');
        header.setAttribute('data-bs-target', `#workout-${prefix}-${workout.planId}`);
        header.setAttribute('aria-expanded', 'false');
        header.setAttribute('aria-controls', `workout-${prefix}-${workout.planId}`);

        const headerTop = document.createElement('div');
        headerTop.className = 'd-flex justify-content-between align-items-start gap-3 flex-wrap';

        const leftTop = document.createElement('div');
        leftTop.className = 'd-flex align-items-center gap-2 flex-wrap ticket-title-wrap';

        const workoutId = document.createElement('span');
        workoutId.className = 'card-content-id fw-bold';
        workoutId.textContent = `#${workout.planId}`;

        const separator = document.createElement('span');
        separator.className = 'card-separator';
        separator.textContent = '|';

        const name = document.createElement('span');
        name.className = 'card-subject fw-bold';
        name.textContent = workout.name;

        leftTop.appendChild(workoutId);
        leftTop.appendChild(separator);
        leftTop.appendChild(name);

        if(prefix === 'user'){
            const separatorUser = document.createElement('span');
            separatorUser.className = 'card-separator';
            separatorUser.textContent = '|';

            const userId = document.createElement('span');
            userId.className = 'card-content-id fw-bold';
            userId.textContent = `user id: #${workout.user_id}`;

            leftTop.appendChild(separatorUser);
            leftTop.appendChild(userId);
        }

        const badgeWrap = document.createElement('div');
        badgeWrap.className = 'd-flex align-items-center gap-2 flex-wrap';

        const typeBadge = document.createElement('span');
        typeBadge.className = prefix === 'admin' ? 'badge bg-primary' : 'badge bg-secondary';
        typeBadge.textContent = prefix === 'admin' ? 'Alap terv' : 'Felhasználói terv';

        const daysBadge = document.createElement('span');
        daysBadge.className = 'badge bg-info text-dark';
        daysBadge.textContent = `${workout.daysCount} nap`;

        badgeWrap.appendChild(typeBadge);
        badgeWrap.appendChild(daysBadge);

        headerTop.appendChild(leftTop);
        headerTop.appendChild(badgeWrap);

        header.appendChild(headerTop);

        const collapse = document.createElement('div');
        collapse.className = 'collapse';
        collapse.id = `workout-${prefix}-${workout.planId}`;

        const body = document.createElement('div');
        body.className = 'card-body admin-card-body';

        const topInfoWrap = document.createElement('div');
        topInfoWrap.className = 'd-flex flex-wrap gap-3';

        topInfoWrap.appendChild(createWorkoutInfoItem('Szint', workout.level));
        topInfoWrap.appendChild(createWorkoutInfoItem('Hely', workout.location));
        topInfoWrap.appendChild(createWorkoutInfoItem('Cél', workout.goal));
        topInfoWrap.appendChild(createWorkoutInfoItem('Napok száma', workout.daysCount));

        const hr1 = document.createElement('hr');
        hr1.className = 'ticket-divider';

        const descTitle = document.createElement('h6');
        descTitle.className = 'ticket-section-title';
        descTitle.textContent = 'Leírás';

        const descBox = document.createElement('div');
        descBox.className = 'ticket-message-box';
        descBox.textContent = workout.description || 'Nincs megadott leírás.';

        const hr2 = document.createElement('hr');
        hr2.className = 'ticket-divider';

        const daysTitle = document.createElement('h6');
        daysTitle.className = 'ticket-section-title';
        daysTitle.textContent = 'Edzésnapok';

        const daysWrap = document.createElement('div');
        daysWrap.className = 'd-flex flex-column gap-3';

        if(workout.days && workout.days.length > 0){
            for(const day of workout.days){
                const dayBox = document.createElement('div');
                dayBox.className = 'ticket-message-box';

                const dayHeader = document.createElement('div');
                dayHeader.className = 'd-flex justify-content-between align-items-center gap-2 flex-wrap mb-2';

                const dayName = document.createElement('h6');
                dayName.className = 'mb-0 fw-bold';
                dayName.textContent = `${day.dayNumber}. nap - ${day.name}`;

                const restBadge = document.createElement('span');
                restBadge.className = day.isRestDay ? 'badge bg-warning text-dark' : 'badge bg-success';
                restBadge.textContent = day.isRestDay ? 'Pihenőnap' : 'Edzésnap';

                const hr6 = document.createElement('hr');

                dayHeader.appendChild(dayName);
                dayHeader.appendChild(restBadge);

                dayBox.appendChild(dayHeader);
                dayBox.appendChild(hr6);

                if(day.imageUrl){
                    const imageInfo = document.createElement('div');
                    imageInfo.className = 'card-content-date mb-2';
                    imageInfo.textContent = `Kép: ${day.imageUrl}`;
                    dayBox.appendChild(imageInfo);
                }

                if(day.exercises && day.exercises.length > 0){
                    const exerciseList = document.createElement('div');
                    exerciseList.className = 'd-flex flex-column gap-2';

                    for(const exercise of day.exercises){
                        const exerciseRow = document.createElement('div');
                        exerciseRow.className = 'd-flex justify-content-between align-items-center gap-2 flex-wrap';

                        const exerciseName = document.createElement('span');
                        exerciseName.className = 'fw-semibold';
                        exerciseName.textContent = `${exercise.order}. ${exercise.name}`;

                        const muscleBadge = document.createElement('span');
                        muscleBadge.className = 'badge bg-dark';
                        muscleBadge.textContent = formatMuscleGroup(exercise.muscleGroup);

                        exerciseRow.appendChild(exerciseName);
                        exerciseRow.appendChild(muscleBadge);

                        exerciseList.appendChild(exerciseRow);
                    }

                    dayBox.appendChild(exerciseList);
                }else{
                    const emptyExercise = document.createElement('div');
                    emptyExercise.className = 'ticket-empty-message';
                    emptyExercise.textContent = day.isRestDay ? 'Pihenőnap, nincs gyakorlat.' : 'Nincs megadott gyakorlat.';
                    dayBox.appendChild(emptyExercise);
                }

                daysWrap.appendChild(dayBox);
            }
        }else{
            const emptyDays = document.createElement('p');
            emptyDays.className = 'text-center text-secondary';
            emptyDays.textContent = 'Nincs megadott edzésnap.';
            daysWrap.appendChild(emptyDays);
        }

        const hr3 = document.createElement('hr');
        hr3.className = 'ticket-divider';

        const footerWrap = document.createElement('div');
        footerWrap.className = 'd-flex flex-wrap justify-content-end gap-2';

        if(prefix === 'admin'){
            const editBtn = document.createElement('button');
            editBtn.className = 'btn btn-outline-warning';
            editBtn.textContent = 'Szerkesztés';

            editBtn.addEventListener('click', (e)=>{
                e.stopPropagation();
                loadWorkoutToForm(workout);
            });

            footerWrap.appendChild(editBtn);
        }

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-outline-danger';
        deleteBtn.textContent = 'Törlés';

        deleteBtn.addEventListener('click', async(e)=>{
            e.stopPropagation();

            const confirmDelete = confirm('Biztosan törölni szeretnéd ezt az edzéstervet?');

            if(!confirmDelete){
                return;
            }

            try {
                const data = await deleteFetch('http://127.0.0.1:3000/api/admin/workout/delete/' + workout.planId);
                alert(data.message);
                loadWorkouts();
            } catch (error) {
                console.error(error.message);
                alert(error.message);
            }
        });

        footerWrap.appendChild(deleteBtn);

        body.appendChild(topInfoWrap);
        body.appendChild(hr1);
        body.appendChild(descTitle);
        body.appendChild(descBox);
        body.appendChild(hr2);
        body.appendChild(daysTitle);
        body.appendChild(daysWrap);
        body.appendChild(hr3);
        body.appendChild(footerWrap);

        collapse.appendChild(body);

        card.appendChild(header);
        card.appendChild(collapse);

        container.appendChild(card);
    }
}
function createWorkoutInfoItem(label, value){
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
function formatMuscleGroup(group){
    if(!group) return '-';

    const muscles = {
        mell: 'Mell',
        hát: 'Hát',
        váll: 'Váll',
        bicepsz: 'Bicepsz',
        tricepsz: 'Tricepsz',
        alkar: 'Alkar',
        has: 'Has',
        ferde_has: 'Ferde has',
        alsó_hát: 'Alsó hát',
        comb_első: 'Combfeszítő',
        comb_hátsó: 'Combhajlító',
        farizom: 'Farizom',
        vádli: 'Vádli',
        teljes_test: 'Teljes test',
        cardio: 'Cardio'
    };

    return muscles[group] || group;
}
async function loadExercises(){
    try {
        allExercises.length = 0;

        const data = await getFetch('http://127.0.0.1:3000/api/workout/exercises');

        for(const exercise of data.message){
            allExercises.push(exercise);
        }

    } catch (error) {
        console.error(error.message);
        alert('Gyakorlatok betöltése sikertelen!');
    }
}
function generateWorkoutDays(){
    workoutDaysBuilder.innerHTML = '';

    let daysCount = Number(workoutDaysCountInput.value);

    if(daysCount < 1){
        return;
    }

    if(daysCount > 7){
        daysCount = 7;
        workoutDaysCountInput.value = 7;
    }

    for(let i = 1; i <= daysCount; i++){

        const dayCard = document.createElement('div');
        dayCard.className = 'card admin-card';

        // HEADER
        const header = document.createElement('div');
        header.className = 'card-header admin-card-header';
        header.style.cursor = 'pointer';
        header.setAttribute('data-bs-toggle', 'collapse');
        header.setAttribute('data-bs-target', `#new-workout-day-${i}`);
        header.setAttribute('aria-expanded', 'false');
        header.setAttribute('aria-controls', `new-workout-day-${i}`);

        const headerWrap = document.createElement('div');
        headerWrap.className = 'd-flex justify-content-between align-items-center';

        const title = document.createElement('span');
        title.className = 'fw-bold';
        title.textContent = `${i}. nap`;

        const badge = document.createElement('span');
        badge.className = 'badge bg-primary';
        badge.textContent = 'Lenyitás';

        headerWrap.appendChild(title);
        headerWrap.appendChild(badge);
        header.appendChild(headerWrap);

        // COLLAPSE
        const collapse = document.createElement('div');
        collapse.className = 'collapse';
        collapse.id = `new-workout-day-${i}`;

        // BODY
        const body = document.createElement('div');
        body.className = 'card-body admin-card-body';

        // ROW
        const row = document.createElement('div');
        row.className = 'row g-3';

        // NAME
        const nameCol = document.createElement('div');
        nameCol.className = 'col-md-4';

        const nameLabel = document.createElement('label');
        nameLabel.className = 'food-form-label';
        nameLabel.textContent = 'Nap neve';

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.className = 'form-control food-form-control day-name';
        nameInput.placeholder = 'Pl.: Mell-tricepsz';
        nameInput.required = true;

        nameCol.appendChild(nameLabel);
        nameCol.appendChild(nameInput);

        // REST DAY
        const restCol = document.createElement('div');
        restCol.className = 'col-md-4 d-flex align-items-end';

        const restWrap = document.createElement('div');
        restWrap.className = 'form-check food-check-item';

        const restInput = document.createElement('input');
        restInput.className = 'form-check-input day-rest';
        restInput.type = 'checkbox';
        restInput.id = `rest-day-${i}`;

        const restLabel = document.createElement('label');
        restLabel.className = 'form-check-label';
        restLabel.setAttribute('for', `rest-day-${i}`);
        restLabel.textContent = 'Pihenőnap';

        restWrap.appendChild(restInput);
        restWrap.appendChild(restLabel);
        restCol.appendChild(restWrap);

        row.appendChild(nameCol);
        row.appendChild(restCol);

        // HR
        const hr = document.createElement('hr');
        hr.className = 'ticket-divider';

        // EXERCISE HEADER
        const exerciseHeader = document.createElement('div');
        exerciseHeader.className = 'd-flex justify-content-between align-items-center mb-2';

        const exerciseTitle = document.createElement('h6');
        exerciseTitle.className = 'ticket-section-title mb-0';
        exerciseTitle.textContent = 'Gyakorlatok';

        const addBtn = document.createElement('button');
        addBtn.type = 'button';
        addBtn.className = 'btn btn-outline-info btn-sm add-exercise-btn';
        addBtn.textContent = 'Gyakorlat hozzáadása';

        exerciseHeader.appendChild(exerciseTitle);
        exerciseHeader.appendChild(addBtn);

        // EXERCISE LIST
        const exerciseList = document.createElement('div');
        exerciseList.className = 'exercise-list d-flex flex-column gap-2';

        // EVENTEK
        addBtn.addEventListener('click', () => {
            addExerciseRow(exerciseList);
        });

        restInput.addEventListener('change', () => {
            if(restInput.checked){
                exerciseList.innerHTML = '';
                addBtn.disabled = true;
            }else{
                addBtn.disabled = false;
            }
        });

        // BUILD BODY
        body.appendChild(row);
        body.appendChild(hr);
        body.appendChild(exerciseHeader);
        body.appendChild(exerciseList);

        collapse.appendChild(body);
        dayCard.appendChild(header);
        dayCard.appendChild(collapse);

        workoutDaysBuilder.appendChild(dayCard);
    }
}
function addExerciseRow(container){
    const row = document.createElement('div');
    row.className = 'ticket-message-box';

    const order = container.children.length + 1;

    const rowWrap = document.createElement('div');
    rowWrap.className = 'row g-2 align-items-end';

    const orderCol = document.createElement('div');
    orderCol.className = 'col-md-2';

    const orderLabel = document.createElement('label');
    orderLabel.className = 'food-form-label';
    orderLabel.textContent = 'Sorrend';

    const orderInput = document.createElement('input');
    orderInput.type = 'number';
    orderInput.className = 'form-control food-form-control exercise-order';
    orderInput.value = order;
    orderInput.min = '1';
    orderInput.required = true;

    orderCol.appendChild(orderLabel);
    orderCol.appendChild(orderInput);

    const exerciseCol = document.createElement('div');
    exerciseCol.className = 'col-md-8';

    const exerciseLabel = document.createElement('label');
    exerciseLabel.className = 'food-form-label';
    exerciseLabel.textContent = 'Gyakorlat';

    const exerciseSelect = document.createElement('select');
    exerciseSelect.className = 'form-select food-form-control exercise-id';
    exerciseSelect.required = true;

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Válassz gyakorlatot';
    exerciseSelect.appendChild(defaultOption);

    for(const exercise of allExercises){
        const option = document.createElement('option');
        option.value = exercise.id;
        option.textContent = `${exercise.name} (${formatMuscleGroup(exercise.muscle_group)})`;
        exerciseSelect.appendChild(option);
    }

    exerciseCol.appendChild(exerciseLabel);
    exerciseCol.appendChild(exerciseSelect);

    const btnCol = document.createElement('div');
    btnCol.className = 'col-md-2';

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn btn-outline-danger w-100';
    removeBtn.textContent = 'Törlés';

    removeBtn.addEventListener('click', () => {
        row.remove();
        refreshExerciseOrders(container);
    });

    btnCol.appendChild(removeBtn);

    rowWrap.appendChild(orderCol);
    rowWrap.appendChild(exerciseCol);
    rowWrap.appendChild(btnCol);

    row.appendChild(rowWrap);
    container.appendChild(row);
}
function refreshExerciseOrders(container){
    const rows = container.querySelectorAll('.ticket-message-box');

    for(let i = 0; i < rows.length; i++){
        const orderInput = rows[i].querySelector('.exercise-order');
        orderInput.value = i + 1;
    }
}
function loadWorkoutToForm(workout){
    workoutEditMode = true;
    editingWorkoutId = workout.planId;

    workoutForm.querySelector('[name="name"]').value = workout.name ?? '';
    workoutForm.querySelector('[name="days_count"]').value = workout.daysCount ?? 1;
    workoutForm.querySelector('[name="level"]').value = workout.level ?? '';
    workoutForm.querySelector('[name="location"]').value = workout.location ?? '';
    workoutForm.querySelector('[name="goal"]').value = workout.goal ?? '';
    workoutForm.querySelector('[name="description"]').value = workout.description ?? '';

    const publicInput = workoutForm.querySelector('[name="is_public"]');
    if(publicInput){
        publicInput.checked = true;
    }

    generateWorkoutDays();

    for(let i = 0; i < workout.days.length; i++){
        const day = workout.days[i];
        const dayCard = workoutDaysBuilder.children[i];

        if(!dayCard){
            continue;
        }

        const nameInput = dayCard.querySelector('.day-name');
        const restInput = dayCard.querySelector('.day-rest');
        const addBtn = dayCard.querySelector('.add-exercise-btn');
        const exerciseList = dayCard.querySelector('.exercise-list');

        nameInput.value = day.name ?? `Nap ${i + 1}`;
        restInput.checked = Boolean(day.isRestDay);

        exerciseList.innerHTML = '';

        if(restInput.checked){
            addBtn.disabled = true;
        }else{
            addBtn.disabled = false;

            for(let j = 0; j < day.exercises.length; j++){
                addExerciseRow(exerciseList);

                const row = exerciseList.children[j];
                const exerciseSelect = row.querySelector('.exercise-id');
                const orderInput = row.querySelector('.exercise-order');

                exerciseSelect.value = day.exercises[j].exerciseId;
                orderInput.value = day.exercises[j].order;
            }
        }
    }

    const submitBtn = workoutForm.querySelector('[type="submit"]');
    if(submitBtn){
        submitBtn.textContent = 'Módosítás mentése';
        submitBtn.className = 'btn btn-warning';
    }

    const createCollapse = document.getElementById('workoutCreateCollapse');
    if(createCollapse && !createCollapse.classList.contains('show')){
        const bsCollapse = new bootstrap.Collapse(createCollapse, {
            show: true
        });
    }

    workoutForm.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
    showWorkoutCancelEditButton();
}
function refillWorkoutDays(workout){
    const dayCards = workoutDaysBuilder.querySelectorAll('.admin-card');

    for(let i = 0; i < dayCards.length; i++){
        const oldDay = workout.days[i];

        if(!oldDay){
            continue;
        }

        const dayCard = dayCards[i];

        const nameInput = dayCard.querySelector('.day-name');
        const restInput = dayCard.querySelector('.day-rest');
        const addBtn = dayCard.querySelector('.add-exercise-btn');
        const exerciseList = dayCard.querySelector('.exercise-list');

        nameInput.value = oldDay.name ?? `Nap ${i + 1}`;
        restInput.checked = Boolean(oldDay.restDay);

        exerciseList.innerHTML = '';

        if(restInput.checked){
            addBtn.disabled = true;
        }else{
            addBtn.disabled = false;

            for(let j = 0; j < oldDay.exercises.length; j++){
                addExerciseRow(exerciseList);

                const row = exerciseList.children[j];
                const exerciseSelect = row.querySelector('.exercise-id');
                const orderInput = row.querySelector('.exercise-order');

                exerciseSelect.value = oldDay.exercises[j].exerciseId;
                orderInput.value = oldDay.exercises[j].order;
            }
        }
    }
}
function collectWorkoutFormData(){
    const workout = {
        name: workoutForm.querySelector('[name="name"]').value,
        days_count: Number(workoutDaysCountInput.value),
        days: []
    };

    const dayCards = workoutDaysBuilder.querySelectorAll('.admin-card');

    for(let i = 0; i < dayCards.length; i++){
        const dayCard = dayCards[i];

        const name = dayCard.querySelector('.day-name').value;
        const restDay = dayCard.querySelector('.day-rest').checked;

        const day = {
            dayNumber: i + 1,
            name: name,
            restDay: restDay,
            exercises: []
        };

        const rows = dayCard.querySelectorAll('.exercise-list .ticket-message-box');

        for(let j = 0; j < rows.length; j++){
            const row = rows[j];

            const exerciseId = Number(row.querySelector('.exercise-id').value);
            const order = Number(row.querySelector('.exercise-order').value);

            if(exerciseId){
                day.exercises.push({
                    exerciseId,
                    order
                });
            }
        }

        workout.days.push(day);
    }

    return workout;
}
function showWorkoutCancelEditButton(){
    if(workoutCancelEditBtn){
        return;
    }

    const submitBtn = workoutForm.querySelector('[type="submit"]');

    if(!submitBtn){
        return;
    }

    workoutCancelEditBtn = document.createElement('button');
    workoutCancelEditBtn.type = 'button';
    workoutCancelEditBtn.className = 'btn btn-outline-danger ms-2';
    workoutCancelEditBtn.textContent = 'Mégse';

    workoutCancelEditBtn.addEventListener('click', () => {
        resetWorkoutForm();
    });

    submitBtn.parentElement.appendChild(workoutCancelEditBtn);
}
function resetWorkoutForm(){
    workoutEditMode = false;
    editingWorkoutId = null;

    workoutForm.reset();
    workoutDaysBuilder.innerHTML = '';

    const submitBtn = workoutForm.querySelector('[type="submit"]');

    if(submitBtn){
        submitBtn.textContent = 'Edzésterv létrehozása';
        submitBtn.className = 'btn btn-success';
    }

    if(workoutCancelEditBtn){
        workoutCancelEditBtn.remove();
        workoutCancelEditBtn = null;
    }
}
async function createAdminWorkout() {
    try {
        const workout = collectWorkoutFormData();

        const formData = new FormData();

        const isPublicInput = workoutForm.querySelector('[name="is_public"]');

        formData.append('name', workout.name);
        formData.append('days_count', workout.days_count);
        formData.append('level', workoutForm.querySelector('[name="level"]').value || '');
        formData.append('location', workoutForm.querySelector('[name="location"]').value || '');
        formData.append('goal', workoutForm.querySelector('[name="goal"]').value || '');
        formData.append('description', workoutForm.querySelector('[name="description"]').value || '');
        formData.append('days', JSON.stringify(workout.days));

        const data = await postForm('http://127.0.0.1:3000/api/admin/workout/new', formData);

        alert(data.message);
        resetWorkoutForm();
        loadWorkouts();

    } catch (error) {
        console.error(error.message);
        alert(error.message);
    }
}
async function updateAdminWorkout() {
    try {
        const workout = collectWorkoutFormData();

        const formData = new FormData();

        const isPublicInput = workoutForm.querySelector('[name="is_public"]');

        formData.append('plan_id', editingWorkoutId);
        formData.append('name', workout.name);
        formData.append('days_count', workout.days_count);
        formData.append('level', workoutForm.querySelector('[name="level"]').value || '');
        formData.append('location', workoutForm.querySelector('[name="location"]').value || '');
        formData.append('goal', workoutForm.querySelector('[name="goal"]').value || '');
        formData.append('description', workoutForm.querySelector('[name="description"]').value || '');
        formData.append('days', JSON.stringify(workout.days));

        const data = await putForm('http://127.0.0.1:3000/api/admin/workout/edit/' + editingWorkoutId, formData);

        alert(data.message);
        resetWorkoutForm();
        loadWorkouts();

    } catch (error) {
        console.error(error.message);
        alert(error.message);
    }
}
function applyWorkoutFilters(){
    const level = document.getElementById("filter-level").value;
    const location = document.getElementById("filter-location").value;
    const goal = document.getElementById("filter-goal").value;
    const days = document.getElementById("filter-days").value;

    filteredAdminWorkouts = [];
    filteredUsersWorkouts = [];

    for(const workout of adminWorkouts){
        let match = true;

        if(level !== "all" && workout.level !== level) match = false;
        if(location !== "all" && workout.location !== location) match = false;
        if(goal !== "all" && workout.goal !== goal) match = false;
        if(days !== "all" && workout.daysCount !== Number(days)) match = false;

        if(match){
            filteredAdminWorkouts.push(workout);
        }
    }

    for(const workout of usersWorkouts){
        let match = true;

        if(level !== "all" && workout.level !== level) match = false;
        if(location !== "all" && workout.location !== location) match = false;
        if(goal !== "all" && workout.goal !== goal) match = false;
        if(days !== "all" && workout.daysCount !== Number(days)) match = false;

        if(match){
            filteredUsersWorkouts.push(workout);
        }
    }

    renderFilteredWorkouts(workoutContainer);
}
function resetWorkoutFilters(){
    document.getElementById("filter-level").value = "all";
    document.getElementById("filter-location").value = "all";
    document.getElementById("filter-goal").value = "all";
    document.getElementById("filter-days").value = "all";
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('hu-HU');
}
function formatOnlyDate(dateString) {
    const date = new Date(dateString);

    return date.toLocaleDateString('hu-HU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}