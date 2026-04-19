import {getFetch, patchFetch} from './api.js';

let openT = [];
let closedT = [];
let containerOpen;
let containerClosed;

document.addEventListener('DOMContentLoaded', ()=>{
    const dashRefresh = document.getElementById('refresh-dash');
    const allSeen = document.getElementById('ticket-seen');
    containerOpen = document.getElementById('open-tickets');
    containerClosed = document.getElementById('closed-tickets');

    loadDash();
    loadTickets();

    dashRefresh.addEventListener('click', ()=>{
        loadDash();
    })
    allSeen.addEventListener('click', async()=>{
        try {
            const data = await patchFetch('http://127.0.0.1:3000/api/admin/all-tickets/seen');
            console.log(data.message);
            loadTickets();
        } catch (error) {
            console.error(error.message);
        }
    })
});

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
        card.className = 'card ticket-card mb-3 w-100';

        const header = document.createElement('div');
        header.className = 'card-header ticket-card-header';
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
        ticketId.className = 'ticket-id fw-bold';
        ticketId.textContent = `#${ticket.id}`;

        const userId = document.createElement('span');
        userId.className = 'ticket-id fw-bold';
        userId.textContent = `user id: #${ticket.user_id}`;

        const separator = document.createElement('span');
        separator.className = 'ticket-separator';
        separator.textContent = '|';

        const separator2 = document.createElement('span');
        separator2.className = 'ticket-separator';
        separator2.textContent = '|';

        const subject = document.createElement('span');
        subject.className = 'ticket-subject fw-bold';
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
        createdDate.className = 'ticket-created-date mt-2';
        createdDate.textContent = `Létrehozva: ${ formatDate(ticket.created_at)}`;

        header.appendChild(headerTop);
        header.appendChild(createdDate);

        const collapse = document.createElement('div');
        collapse.className = 'collapse';
        collapse.id = `ticket-${ticket.id}`;

        const body = document.createElement('div');
        body.className = 'card-body ticket-card-body';

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
                loadTickets();
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
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('hu-HU');
}