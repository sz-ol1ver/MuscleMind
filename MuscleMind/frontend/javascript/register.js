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
document.addEventListener('DOMContentLoaded',()=>{
    //! id
    //? last-name -- Vezeteknev
    //? first-name -- Keresztnev
    //? userName -- felhasznalonev
    //? email-regist -- email cim
    //? password-regist -- jelszo
    //? password-confirm-regist -- jelszo megerosites
    //? password-feedback -- jelszo egyezes visszajelzo
    //? regist-in -- regisztracio gomb

    const lastN = document.getElementById('last-name');
    const firstN = document.getElementById('first-name');
    const userName = document.getElementById('userName');
    const email = document.getElementById('email-regist');
    const pass = document.getElementById('password-regist');
    const passConf = document.getElementById('password-confirm-regist');
    const feedBack = document.getElementById('password-feedback');
    const registBtn = document.getElementById('regist-in');

    const patterUser = /^[a-z0-9]*$/
    const patterPass = /^[a-zA-Z0-9]*$/
    
    pass.addEventListener('input', ()=>{
        if(lastN.value != '' && firstN.value !=''){
            feedBack.innerHTML='';
            lastN.style.border = '1px solid white';
            firstN.style.border = '1px solid white';
            if(userName.value!=''){
                feedBack.innerHTML ='';
                userName.style.border = '1px solid white';
                if(patterUser.test(userName.value)==true){
                    userName.style.border = '1px solid white';
                    feedBack.innerHTML = '';
                    if(email.value!=''){
                        feedBack.innerHTML = '';
                        email.style.border = '1px solid white';
                        if(pass.value!=''){
                            feedBack.innerHTML = '';
                            pass.style.border = '1px solid white';
                            if(patterPass.test(pass.value)==true){
                                feedBack.innerHTML = '';
                                pass.style.border = '1px solid white';
                                passConf.disabled = false;
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
            feedBack.innerHTML = 'Hiányos név!';
            lastN.style.border = '2px solid red';
            firstN.style.border = '2px solid red';
            pass.value = '';
            passConf.value =''
            passConf.disabled = true;
        }
    })
    passConf.addEventListener('input', ()=>{
        if(lastN.value == '' || firstN.value=='' || userName.value=='' || email.value==''){
            passConf.value = '';
            passConf.disabled = true;
            pass.value = '';
        }else if(pass.value == passConf.value){
            feedBack.style.color = 'lightgreen';
            feedBack.innerHTML = 'A jelszó megegyezik!';
            registBtn.disabled = false;
        }else if(passConf.value == ''){
            feedBack.innerHTML ='';
        }else{
            feedBack.style.color = 'red';
            feedBack.innerHTML = 'A két jelszó különbözik!';
        }
    })
})
