/*
  Username validáció / karakter szűrés

  Regex:
    pattern = /^[a-zA-Z0-9]*$/
      ^        -> a szöveg elejétől vizsgál
      [a-zA-Z0-9] -> engedélyezett karakterek: a-z, A-Z, 0-9
      *        -> nulla vagy több karakter
      $        -> a szöveg végéig vizsgál

  test() -> boolean
    pl: pattern.test("Oliver123") -> true
        pattern.test("Oliver_123") -> false

  replace() -> tiltott karakterek törlése/csere
    /[^a-zA-Z0-9]/g -> minden, ami nem betű vagy szám
    g -> globális, az összes előfordulásra
    i -> ignore case, kis/nagy betűt nem különböztet
    m -> multi-line, sorvégek kezelésére
    y -> sticky, pontosan a cursor pozíciótól
    pl: "Oliver_123!".replace(/[^a-zA-Z0-9]/g,"") -> "Oliver123"

  Cél:
    - csak betű és szám engedélyezett
    - tiltott karakterek automatikus törlése
    - vizsgára rövid, kulcsszavas, áttekinthető
*/

/* 
    ?Regisztacio urlap vizsgalat
        *Vezeteknev - Keresztnev
            *Felhasznalonev
                *email cim
                    *password
                        *password confirm
                            !regist btn activation
*/
import {registration} from './api.js';

document.addEventListener('DOMContentLoaded',()=>{
    

    //! id
    //? last-name -- Vezeteknev --> lastN
    //? first-name -- Keresztnev --> fistN
    //? userName -- felhasznalonev --> userName
    //? email-regist -- email cim --> email
    //? password-regist -- jelszo --> pass
    //? password-confirm-regist -- jelszo megerosites --> passConf
    //? password-feedback -- jelszo egyezes visszajelzo --> feedBack
    //? regist-in -- regisztracio gomb --> registBtn

    //? mezok lekérdezése
    const lastN = document.getElementById('last-name'); 
    const firstN = document.getElementById('first-name');
    const userName = document.getElementById('userName');
    const email = document.getElementById('email-regist');
    const pass = document.getElementById('password-regist');
    const passConf = document.getElementById('password-confirm-regist');
    const feedBack = document.getElementById('password-feedback');
    const registBtn = document.getElementById('regist-in');

    //? Nev megengedett karakterei
    const patterName = /^[a-zA-Z]*$/ 
    //? Felhasznalonev megengedett karakterei
    const patterUser = /^[a-z0-9]*$/ 
    //? Jelszo megengedett karakterei
    const patterPass = /^[a-zA-Z0-9]*$/
    
    //! jelszo ill. jelszo elotti mezok vizsgalata
    // folyamatos ellenőrzés minden karakter után a jelszo mezoben
    pass.addEventListener('input', ()=>{
        //* Vezeteknev - Keresztnev ures-e
        if(lastN.value != '' && firstN.value !=''){
            feedBack.innerHTML='';
            lastN.style.border = '1px solid white';
            firstN.style.border = '1px solid white';
            //* Nev karakter ellenorzes
            if(patterName.test(lastN.value) == true && patterName.test(firstN.value) == true){
                feedBack.innerHTML='';
                lastN.style.border = '1px solid white';
                firstN.style.border = '1px solid white';
                //* Felhasznalonev ures-e
                if(userName.value!=''){
                    feedBack.innerHTML ='';
                    userName.style.border = '1px solid white';
                    //* Felhasznalonev karakter vizsgalata
                    if(patterUser.test(userName.value)==true){
                        userName.style.border = '1px solid white';
                        feedBack.innerHTML = '';
                        //* Email cim ures-e
                        if(email.value!=''){
                            feedBack.innerHTML = '';
                            email.style.border = '1px solid white';
                            //* Jelszo ures-e
                            if(pass.value!=''){
                                feedBack.innerHTML = '';
                                pass.style.border = '1px solid white';
                                //* Jelszo karakter vizsgalata
                                if(patterPass.test(pass.value)==true){
                                    feedBack.innerHTML = '';
                                    pass.style.border = '1px solid white';
                                    passConf.disabled = false;
                                    if(pass.value != passConf.value){
                                        registBtn.disabled=true;
                                    }else{
                                        registBtn.disabled=false;
                                    }
                                }else{
                                    feedBack.style.color = 'red';
                                    feedBack.innerHTML = 'Jelszó: a-z & A-Z & 0-9!'
                                    pass.style.border = '2px solid red';
                                    passConf.value ='';
                                    passConf.disabled = true;
                                }
                            }else{
                                feedBack.style.color = 'red';
                                feedBack.innerHTML = 'Nincs megadva jelszó!'
                                pass.style.border = '2px solid red';
                                passConf.value ='';
                                passConf.disabled = true;
                            }
                        }else{
                            feedBack.style.color = 'red';
                            feedBack.innerHTML = 'Nincs megadva e-mail cím!'
                            email.style.border = '2px solid red';
                            pass.value = '';
                            passConf.value ='';
                            passConf.disabled = true;
                        }
                    }else{
                        feedBack.style.color = 'red';
                        feedBack.innerHTML = 'Felhasználónév: a-z & 0-9!'
                        userName.style.border = '2px solid red';
                        pass.value = '';
                        passConf.value ='';
                        passConf.disabled = true;
                    }
                }else{
                    feedBack.style.color = 'red';
                    feedBack.innerHTML = 'Nincs megadva felhasználónév!'
                    userName.style.border = '2px solid red';
                    pass.value = '';
                    passConf.value ='';
                    passConf.disabled = true;
                }
            }else{
                feedBack.style.color = 'red';
                feedBack.innerHTML = 'Csak a-z & A-Z';
                lastN.style.border = '2px solid red';
                firstN.style.border = '2px solid red';
                pass.value = '';
                passConf.value =''
                passConf.disabled = true;
            }
        }else{
            feedBack.style.color = 'red';
            feedBack.innerHTML = 'Hiányos név!';
            lastN.style.border = '2px solid red';
            firstN.style.border = '2px solid red';
            pass.value = '';
            passConf.value =''
            passConf.disabled = true;
        }
    })

    //! jelszo megerosito folyamatos vizsgalata
    passConf.addEventListener('input', ()=>{
        //* Ures-e barmelyik jelszo elotti mezo
        if(lastN.value == '' || firstN.value=='' || userName.value=='' || email.value==''){
            passConf.value = '';
            passConf.disabled = true;
            pass.value = '';
        }else if(pass.value == passConf.value){//* Egyezik-e a jelszo
            feedBack.style.color = 'lightgreen';
            feedBack.innerHTML = 'A jelszó megegyezik!';
            registBtn.disabled = false;
        }else if(passConf.value != pass.value){//* Ha kulonbozik a ketto
            feedBack.style.color = 'red';
            feedBack.innerHTML ='A két jelszó különbözik!';
            registBtn.disabled = true;
        }else{//* Ures jelszo megerosito / barmi mas
            feedBack.style.color = 'red';
            feedBack.innerHTML = '';
            registBtn.disabled = true;
        }
    })

    //! input final validation
    registBtn.addEventListener('click', ()=>{
        if(lastN.value == '' || firstN.value == ''){
            feedBack.style.color = 'red';
            feedBack.innerHTML = 'Hiányos név!';
            lastN.style.border = '2px solid red';
            firstN.style.border = '2px solid red';
            passConf.value ='';
            pass.value ='';
            registBtn.disabled = true;
        }else if(userName.value == ''){
            feedBack.style.color = 'red';
            feedBack.innerHTML = 'Nincs megadva felhasználónév!'
            userName.style.border = '2px solid red';
            passConf.value ='';
            pass.value ='';
            registBtn.disabled = true;
        }else if(email.value == ''){
            feedBack.style.color = 'red';
            feedBack.innerHTML = 'Nincs megadva e-mail cím!'
            email.style.border = '2px solid red';
            passConf.value ='';
            pass.value ='';
            registBtn.disabled = true;
        }else{
            const postData = async()=>{
                try {
                    const postObj = {
                        firstN: firstN.value,
                        lastN: lastN.value,
                        userN: userName.value,
                        email: email.value,
                        pass: pass.value
                    }
                    const data = await registration('http://127.0.0.1:3000/api/auth/registration', postObj);
                    feedBack.style.color = 'lightgreen';
                    feedBack.innerHTML = data.message;
                    lastN.value ='';
                    firstN.value = '';
                    userName.value = '';
                    email.value = '';
                    pass.value = '';
                    passConf.value = '';
                    passConf.disabled = true;
                    registBtn.disabled = true;
                    setTimeout(()=>{
                        feedBack.innerHTML = '';
                        setTimeout(()=>{
                            window.location.href = '/kerdoiv'
                        }, 300)
                    }, 2000)
                } catch (error) {
                    //?error.obj - ?hiban beluli sorszam
                    //?error.id - hiba sorszama
                    switch(error.id){
                        case 1:
                            feedBack.style.color = 'red';
                            feedBack.innerHTML = 'Hiányos név!';
                            pass.value = '';
                            passConf.value = '';
                            passConf.disabled = true;
                            registBtn.disabled = true;
                            break;
                        case 2:
                            switch(error.obj){
                                case 1:
                                    feedBack.style.color = 'red';
                                    feedBack.innerHTML = 'Nev: a-z & A-Z';
                                    pass.value = '';
                                    passConf.value = '';
                                    passConf.disabled = true;
                                    registBtn.disabled = true;
                                    break;
                                case 2:
                                    feedBack.style.color = 'red';
                                    feedBack.innerHTML = 'Felhasználónév: 3–20 karakter, csak kisbetű és szám';
                                    pass.value = '';
                                    passConf.value = '';
                                    passConf.disabled = true;
                                    registBtn.disabled = true;
                                    break;
                                case 3:
                                    feedBack.style.color = 'red';
                                    feedBack.innerHTML = 'Helytelen email cim megadás!';
                                    pass.value = '';
                                    passConf.value = '';
                                    passConf.disabled = true;
                                    registBtn.disabled = true;
                                    break;
                                case 4:
                                    feedBack.style.color = 'red';
                                    feedBack.innerHTML = "Jelszó: 8–64 karakter, betűk, számok és '#' '?' '!' '-' engedélyezett";
                                    pass.value = '';
                                    passConf.value = '';
                                    passConf.disabled = true;
                                    registBtn.disabled = true;
                                    break;
                                default:
                                    feedBack.style.color = 'red';
                                    feedBack.innerHTML = "Érvénytelen adat(ok)";
                                    pass.value = '';
                                    passConf.value = '';
                                    passConf.disabled = true;
                                    registBtn.disabled = true;
                                    break;
                            }
                            break;
                        case 3:
                            switch(error.obj){
                                case 1:
                                    feedBack.style.color = 'red';
                                    feedBack.innerHTML = 'Foglalt felhasználónév!';
                                    pass.value = '';
                                    passConf.value = '';
                                    passConf.disabled = true;
                                    registBtn.disabled = true;
                                    break;
                                case 2:
                                    feedBack.style.color = 'red';
                                    feedBack.innerHTML = 'Már regisztrált e-mail cím!';
                                    pass.value = '';
                                    passConf.value = '';
                                    passConf.disabled = true;
                                    registBtn.disabled = true;
                                    break;
                                default:
                                    feedBack.style.color = 'red';
                                    feedBack.innerHTML = 'Ütközés a meglévő felhasználóval';
                                    pass.value = '';
                                    passConf.value = '';
                                    passConf.disabled = true;
                                    registBtn.disabled = true;
                                    break;
                            }
                            break;
                    }
                }
            }
            postData();
        }
    })
})