import {login} from './api.js';

document.addEventListener('DOMContentLoaded', ()=>{
    //! id
    //? email --> email-login
    //? passw --> password-login
    //? loginBtn --> login-in

    // mezok lekérdezése
    const email = document.getElementById('email-login');
    const password = document.getElementById('password-login');
    const loginBtn = document.getElementById('login-in');

    //! login btn tiltas / aktivalas
    // folyamatos ellenőrzés minden karakter után 
    password.addEventListener('input', ()=>{
        //email mezo ures-e
        if(email.value != ''){
            //jelszo mezo ures-e
            if(password.value != ''){
                //login btn aktivalas
                loginBtn.disabled = false;
            }else{
                //login btn tiltas
                loginBtn.disabled = true;
            }
        }else{
            //login btn tiltas
            loginBtn.disabled = true;
        }
    })
    //! password aktivalas / tiltas
    email.addEventListener('input', ()=>{
        if(email.value != ''){
            password.disabled = false;
        }else{
            password.value = '';
            password.disabled = true;
            loginBtn.disabled = true;
        }
    })
    //! login button - click
    loginBtn.addEventListener('click', async()=>{
        try {
            const postObj = {
                email: email.value,
                pass: password.value
            }
            const data = await login('http://127.0.0.1:3000/api/login', postObj)
            console.log(data.message)
            setTimeout(()=>{
                email.value = '';
                password.value = '';
                password.disabled = true;
            }, 3000)
        } catch (error) {
            console.error(error);
        }
    })
})