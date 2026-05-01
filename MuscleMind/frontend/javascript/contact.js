import {getFetch, postForm} from './api.js';
let form;
let fb;

document.addEventListener('DOMContentLoaded', ()=>{
    const sndBtn = document.getElementById('send-msg');
    form = document.getElementById('support-form');
    fb = document.getElementById('feedback');
    getEmail(); //? user email betoltese
    sndBtn.addEventListener('click', ()=>{
        const ticketForm = new FormData(form);
        postTicket(ticketForm);
    })
    

});
async function getEmail() {
    try {
        const data = await getFetch('/api/tickets/user-email');
        form.email.value = data.email;
    } catch (error) {
        console.error(error.message)
    }
};
async function postTicket(formObj) {
    try {
        const data = await postForm('/api/tickets/new-ticket', formObj);
        form.reset();
        fb.style.color = 'lightgreen';
        fb.innerHTML = data.message;
        setTimeout(() => {
            fb.innerHTML ='';
            window.location.href = '/tickets';
        }, 3000);
    } catch (error) {
        console.error(error);
        fb.style.color = 'red';
        fb.innerHTML = error.message;
        setTimeout(() => {
            fb.innerHTML = '';
        }, 5000);
    }
}