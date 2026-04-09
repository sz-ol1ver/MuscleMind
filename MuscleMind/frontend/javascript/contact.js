import {getFetch} from './api.js';
let form;

document.addEventListener('DOMContentLoaded', ()=>{
    form = document.getElementById('support-form');
    getEmail();

});
async function getEmail() {
    try {
        const data = await getFetch('http://127.0.0.1:3000/api/tickets/user-email');
        form.email.value = data.email;
    } catch (error) {
        console.error(error.message)
    }
};