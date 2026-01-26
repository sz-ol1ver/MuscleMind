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

document.addEventListener('DOMContentLoaded',()=>{
    //! id
    //?password-regist -- jelszo
    //?password-confirm-regist -- jelszo megerosites
    //?password-feedback -- jelszo egyezes visszajelzo
    //?regist-in -- regisztracio gomb

    // mezok lekérdezése
    const password = document.getElementById('password-regist');// jelszó input
    const passwordConfirm = document.getElementById('password-confirm-regist');// jelszó megerősítés input
    const passFeedback = document.getElementById('password-feedback');// visszajelzés szöveg
    const registBtn = document.getElementById('regist-in');// regisztráció gomb

    //jelszo mezo vizsgalata, ha ures = megerosito mezo disabled
    password.addEventListener('input', ()=>{
        if(password.value!=''){
            //jelszo megerosito aktivalas
            passwordConfirm.disabled = false;
        }else{
            //jelszo megerosito tiltas
            passwordConfirm.disabled = true;
        }
    })

    // folyamatos ellenőrzés minden karakter után
    // input event: minden billentyű
    passwordConfirm.addEventListener('input', ()=>{      
        // ha van érték a jelszó mezőben                
        if(password.value != ''){
            // egyezés ellenőrzés
            if(password.value == passwordConfirm.value){                  
                passFeedback.style.color = "rgb(62, 255, 104)";// jó -> zöld
                passFeedback.innerHTML = "Megegyezik a jelszó!";// visszajelzés
                registBtn.disabled = false;// gomb aktiválás
            }
            else{
                passFeedback.style.color = "red";// rossz -> piros
                passFeedback.innerHTML = "Nem egyezik meg a jelszó!";// visszajelzés
                registBtn.disabled = true;// gomb tiltás
            }
        }
    })
})
