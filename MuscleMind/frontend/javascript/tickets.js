import { getFetch } from "./api.js";

document.addEventListener('DOMContentLoaded', ()=>{
    getTickets();
});
async function getTickets() {
    try {
        const data = await getFetch('http://127.0.0.1:3000/api/tickets/my-tickets');
        renderTickets(data.tickets)
    } catch (error) {
        console.error(error);
        setTimeout(() => {
            window.location.reload();
        }, 10000);
    }
}

function renderTickets(tickets) {
    const container = document.getElementById('list-tickets');

    // törlés
    container.innerHTML = '';

    if (!tickets || tickets.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'text-center text-secondary';
        empty.textContent = 'Nincs megjeleníthető ticket.';
        container.appendChild(empty);
        return;
    }

    tickets.forEach(ticket => {

        // 🔲 CARD
        const card = document.createElement('div');
        card.className = 'card mb-3 bg-dark text-white border';

        // 🔹 HEADER (collapse trigger)
        const header = document.createElement('div');
        header.className = 'card-header';
        header.style.cursor = 'pointer';
        header.setAttribute('data-bs-toggle', 'collapse');
        header.setAttribute('data-bs-target', `#ticket-${ticket.id}`);

        // header flex
        const headerFlex = document.createElement('div');
        headerFlex.className = 'd-flex justify-content-between align-items-center';

        // bal oldal
        const left = document.createElement('div');

        const title = document.createElement('div');
        title.className = 'fw-bold';
        title.textContent = ticket.subject;

        const meta = document.createElement('div');
        meta.className = 'small text-secondary';
        meta.textContent = `#${ticket.id} • ${ticket.category} • ${formatDate(ticket.created_at)}`;

        left.appendChild(title);
        left.appendChild(meta);

        // jobb oldal badge
        const badge = document.createElement('span');
        badge.className = `badge ${getStatusBadgeClass(ticket.status)}`;
        badge.textContent = ticket.status;

        headerFlex.appendChild(left);
        headerFlex.appendChild(badge);
        header.appendChild(headerFlex);

        // 🔽 COLLAPSE
        const collapse = document.createElement('div');
        collapse.className = 'collapse';
        collapse.id = `ticket-${ticket.id}`;

        const body = document.createElement('div');
        body.className = 'card-body';

        // message
        const message = document.createElement('p');
        message.innerHTML = `<strong>Üzenet:</strong> ${ticket.message}`;

        body.appendChild(message);

        // admin reply (ha van)
        if (ticket.admin_reply) {
            const reply = document.createElement('p');
            reply.innerHTML = `<strong>Admin válasz:</strong> ${ticket.admin_reply}`;
            body.appendChild(reply);
        }

        // dátumok
        const dates = document.createElement('div');
        dates.className = 'small text-secondary';
        dates.innerHTML = `
            Created: ${formatDate(ticket.created_at)}<br>
            Updated: ${formatDate(ticket.updated_at)}
        `;

        body.appendChild(dates);

        collapse.appendChild(body);

        // összerakás
        card.appendChild(header);
        card.appendChild(collapse);

        container.appendChild(card);
    });
}
function getStatusBadgeClass(status) {
    if (status === 'open') return 'bg-warning text-dark';
    if (status === 'seen') return 'bg-primary';
    if (status === 'closed') return 'bg-success';
    if (status === 'closed_no_reply') return 'bg-secondary';
    return 'bg-light text-dark';
}
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('hu-HU');
}