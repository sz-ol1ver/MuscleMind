document.addEventListener('DOMContentLoaded', ()=>{
    const dayButtons = document.querySelectorAll('.day-box');
    const active = document.querySelectorAll('.active');
    const rest = document.getElementById('rest');
    const select = document.getElementById('gyakorlat');

    if(active.length != 1){
        rest.disabled = true;
        select.disabled = true;
        add.disabled = true;
    }

    for (let i = 0; i < dayButtons.length; i++) {
    dayButtons[i].addEventListener('click', function() {

        for (let j = 0; j < dayButtons.length; j++) {
            dayButtons[j].classList.remove('active');
        }
        this.classList.add('active');
        rest.disabled = false;
        select.disabled = false;
        add.disabled = false;
    });

    rest.addEventListener('change', ()=>{
        if(rest.checked == true){
            select.disabled = true;
        }else{
            select.disabled = false;
        }
    })
    
}
})