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
            password.disabled = true;
        }
    })
})