let form;
let feedback;
let sendBtn;

const params = new URLSearchParams(window.location.search);
const token = params.get('token');

document.addEventListener('DOMContentLoaded', ()=>{
    form = document.getElementById('new-pass');
    feedback = document.getElementById('feedback');
    sendBtn = document.getElementById('saveNew');

    
});