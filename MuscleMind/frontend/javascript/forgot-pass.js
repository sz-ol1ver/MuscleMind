import {postRequestPass} from './api.js';
let email;
let send_btn;
let feedback;

document.addEventListener('DOMContentLoaded', ()=>{
    email = document.getElementById('email');
    send_btn = document.getElementById('button-send');
    feedback = document.getElementById('feedback');

    send_btn.addEventListener('click', ()=>{
        if(email.value != ''){
            const postObj = {
                email: email.value
            };
            requestSend(postObj);
        }
    })
})

async function requestSend(value) {
    try {
        const data = await postRequestPass('http://127.0.0.1:3000/api/auth/request-password', value);
        feedback.style.color = "lightgreen";
        feedback.innerHTML = data.message;
        setTimeout(() => {
            email.value = '';
            feedback.innerHTML = '';
        }, 2000);
    } catch (error) {
        console.error(error.message);
        feedback.style.color = "red";
        feedback.innerHTML = error.message;
        setTimeout(() => {
            feedback.innerHTML = '';
        }, 2000);
    }
}