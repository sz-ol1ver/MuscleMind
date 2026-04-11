import {getFetch, postForm} from './api.js';
let form;

document.addEventListener('DOMContentLoaded', ()=>{
    const sndBtn = document.getElementById('send-msg');
    form = document.getElementById('support-form');
    getEmail(); //? user email betoltese
    sndBtn.addEventListener('click', ()=>{
        const ticketForm = new FormData(form);
        postTicket(ticketForm);
    })
    

});
async function getEmail() {
    try {
        const data = await getFetch('http://127.0.0.1:3000/api/tickets/user-email');
        form.email.value = data.email;
    } catch (error) {
        console.error(error.message)
    }
};
async function postTicket(formObj) {
    try {
        const data = await postForm('http://127.0.0.1:3000/api/tickets/new-ticket', formObj);
        console.log(data);
    } catch (error) {
        console.error(error.message);
    }
}