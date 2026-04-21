import {login} from './api.js';

document.addEventListener('DOMContentLoaded', ()=>{
    //! id
    //? email --> email-login
    //? passw --> password-login
    //? loginBtn --> login-in

    // mezok lekérdezése
    const form = document.getElementById('login-form'); //? .email && .pass
    const email = document.getElementById('email-login');
    const password = document.getElementById('password-login');
    const loginBtn = document.getElementById('login-in');
    const feedback = document.getElementById('password-feedback');

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
            const formDataLogin = new FormData(form);
            const data = await login('http://127.0.0.1:3000/api/auth/login', formDataLogin)
            feedback.style.color = 'lightgreen';
            feedback.innerHTML = data.message;
            setTimeout(()=>{
                feedback.innerHTML = '';
                form.reset();
                password.disabled = true;
                setTimeout(()=>{
                    window.location.href = '/kerdoiv'
                }, 400)
            }, 2000)
        } catch (error) {
            feedback.style.color = 'rgba(255, 30, 30, 1)';
            feedback.style.fontWeight = 'bolder';
            switch(error.id){
                case 1:
                    feedback.innerHTML = error.message;
                    break;
                case 2:
                    switch(error.error){
                        case 1:
                            feedback.innerHTML = 'Helytelen email cim megadás!'
                            break;
                        case 2:
                            feedback.innerHTML = "A jelszónak legalább 8, de legfeljebb 64 karakter hosszúnak kell lennie, és tartalmazhat betűket, számokat és speciális karaktereket (pl. ! @ # $ % ^ & * _ -)."
                            break;
                    }
                    break;
                case 3:
                    feedback.innerHTML = error.message;
                    break;
                case 4:
                    feedback.innerHTML = error.message;
                    break;
                case 5:
                    feedback.innerHTML = error.message;
                    break;
            }
        }
    })

    password.addEventListener('keydown', async(e)=>{
        if(e.key == 'Enter'){
            try {
                const formDataLogin = new FormData(form);
                const data = await login('http://127.0.0.1:3000/api/auth/login', formDataLogin);
                feedback.style.color = 'lightgreen';
                feedback.innerHTML = data.message;
                setTimeout(()=>{
                    feedback.innerHTML = '';
                    form.reset();
                    password.disabled = true;
                    setTimeout(()=>{
                        window.location.href = '/kerdoiv'
                    }, 400)
                }, 2000)
            } catch (error) {
                feedback.style.color = 'rgba(255, 30, 30, 1)';
                feedback.style.fontWeight = 'bolder';
                switch(error.id){
                    case 1:
                        feedback.innerHTML = error.message;
                        break;
                    case 2:
                        switch(error.error){
                            case 1:
                                feedback.innerHTML = 'Helytelen email cim megadás!'
                                break;
                            case 2:
                                feedback.innerHTML = "Jelszó: 8–64 karakter, betűk, számok és '#' '?' '!' '-' engedélyezett"
                                break;
                        }
                        break;
                    case 3:
                        feedback.innerHTML = error.message;
                        break;
                    case 4:
                        feedback.innerHTML = error.message;
                        break;
                    case 5:
                        feedback.innerHTML = error.message;
                        break;
                }
            }
        }
    })
})