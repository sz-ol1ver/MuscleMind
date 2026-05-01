import {postRequest} from './api.js';
let form;
let feedback;
let sendBtn;

const params = new URLSearchParams(window.location.search);
const token = params.get('token');

document.addEventListener('DOMContentLoaded', ()=>{
    form = document.getElementById('new-pass');
    feedback = document.getElementById('feedback');
    sendBtn = document.getElementById('saveNew');

    const patterPass = /^[a-zA-Z0-9]*$/ //? jelszo karakter ellenorzes
    
    //? check if token is valid or expired
    tokenOnLoadCheck();

    sendBtn.addEventListener('click', ()=>{
        if(form.newPass.value == form.newPassConf.value){
            if(patterPass.test(form.newPass.value) && patterPass.test(form.newPassConf.value)){
                sendNewPassword(form.newPass.value, form.newPassConf.value);
            }else{
                feedback.style.color = 'red';
                feedback.innerHTML = 'Jelszó: a-z & A-Z & 0-9!';
            }
        }else{
            feedback.style.color = 'red';
            feedback.innerHTML = 'Nem egyezik a két jelszó!';
        }
    })
});

async function tokenOnLoadCheck() {
    try {
        const postObj = {
            token: token
        }
        const data = await postRequest('/api/auth/check-token', postObj);
        console.log(data);
    } catch (error) {
        feedback.style.color = 'red';
        feedback.innerHTML = error.message;
        form.newPass.disabled = true;
        form.newPassConf.disabled = true;
        form.newPass.placeholder = '';
        form.newPassConf.placeholder = '';
    }
}
async function sendNewPassword(pass, passConf) {
    try {
        const postObj = {
            password: pass,
            confirm: passConf,
            token: token
        };
        const data = await postRequest('/api/auth/new-password', postObj);
        feedback.style.color = 'lightgreen';
        feedback.innerHTML = data.message;
        setTimeout(() => {
            window.location.href = '/bejelentkezes'
        }, 3000);
    } catch (error) {
        feedback.style.color = 'red';
        feedback.innerHTML = error.message;
    }
}