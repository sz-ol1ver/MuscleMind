import {userAns} from './api.js';

const custom_qtn = [
    'Mennyi a testsúlyod? (kg)',
    'Hány éves vagy?',
    'Mekkora a testmagasságod? (cm)'
];

const ans_qtn = [
    'Mi a nemed?',
    'Mi a fő célod az edzéssel?',
    'Milyen az edzettségi szinted?',
    'Hetente hány napot tudsz edzésre szánni?',
    'Hol edzel leggyakrabban?',
    'Milyen étrendet követsz?',
    'Naponta általában hányszor étkezel?'
];

const ans = [
    [
        "férfi",
        "nő"
    ],

    [
        "tömegnövelés",
        "szálkásítás",
        "szintentartás"
    ],

    [
        "kezdő (0–6 hónap)",
        "középhaladó (6–24 hónap)",
        "haladó (2+ év)"
    ],

    [
        "2–3 nap",
        "4 nap",
        "5–6 nap"
    ],

    [
        "konditeremben",
        "otthon, súlyzókkal",
        "otthon, saját testsúllyal"
    ],

    [
        "mindenevő",
        "vegetáriánus",
        "vegán"
    ],

    [
        "2–3 alkalom",
        "4–5 alkalom",
        "6 vagy több alkalom"
    ]
];

const userProfile = {
    weight: null,
    age: null,
    height: null,
    gender: null,
    goal: null,
    experienceLevel: null,
    trainingDays: null,
    trainingLocation: null,
    dietType: null,
    mealsPerDay: null
};

//? id
// #question -- kerdesek helye (h3)
// #answ -- valaszok helye
// #submit-qtn -- kovetkezo kerdes

document.addEventListener('DOMContentLoaded', ()=>{
    const question = document.getElementById('question');
    const answer = document.getElementById('answ');
    const next = document.getElementById('submit-qtn');

    let currentIndex = 0;
    let selectedValue = null;

    next.addEventListener('click', ()=>{
        if(currentIndex < custom_qtn.length){
            const rangeValue = document.getElementById("range_input").value;
            switch (currentIndex){
                case 0: userProfile.weight = Number(rangeValue); break;
                case 1: userProfile.age = Number(rangeValue); break;
                case 2: userProfile.height = Number(rangeValue); break;
            }
        }else if(currentIndex >= custom_qtn.length){
            if(!selectedValue){
                window.alert('Válassz egy lehetőséget');
                return;
            }
            const answIndex = currentIndex-3;
            switch (answIndex){
                case 0: userProfile.gender = selectedValue; break;
                case 1: userProfile.goal = selectedValue; break;
                case 2: userProfile.experienceLevel = selectedValue; break;
                case 3: userProfile.trainingDays = selectedValue; break;
                case 4: userProfile.trainingLocation = selectedValue; break;
                case 5: userProfile.dietType = selectedValue; break;
                case 6: userProfile.mealsPerDay = selectedValue; break;
        }}
        if(currentIndex+1 == 10){
            try {
                const data = userAns('http://127.0.0.1:3000/api/question', userProfile);
            } catch (error) {
                console.log(error);
            }
        }else{
            currentIndex++;
            loadQuestion();
        }
    })

    function loadQuestion(){
        answer.innerHTML = '';
        selectedValue = null;

        if(currentIndex < custom_qtn.length){
            question.innerHTML = custom_qtn[currentIndex]

            const rangeIn = document.createElement('input');
            rangeIn.type = 'range';
            rangeIn.id = 'range_input';
            

            if(currentIndex == 0){
                rangeIn.step = 0.1;
                rangeIn.min = 40;
                rangeIn.max = 200;
                rangeIn.value = 70;
            }else if(currentIndex == 1){
                rangeIn.min = 18;
                rangeIn.max = 99;
                rangeIn.value = 25;
            }else if(currentIndex == 2){
                rangeIn.min = 140;
                rangeIn.max = 220;
                rangeIn.value = 175;
            }
            
            let rangeFeedback = document.createElement('h3');
            rangeFeedback.id = 'rangeValue';

            switch(currentIndex){
                case 0: 
                rangeFeedback = document.createElement('input');
                rangeFeedback.type = 'number';
                rangeFeedback.min = 40;
                rangeFeedback.max = 200;
                rangeFeedback.step = 0.1;
                rangeFeedback.classList.add('w-25', 'd-block', 'mx-auto', 'mt-2','form-control', 'bg-dark', 'text-white');
                rangeFeedback.value = rangeIn.value
                rangeFeedback.addEventListener('change', ()=>{
                    if(rangeFeedback.value <= 200 && rangeFeedback.value >=40){
                        rangeIn.value = rangeFeedback.value;
                    }else{
                        rangeFeedback.value = rangeIn.value;
                    }
                })
                break;
                case 1: rangeFeedback.innerHTML = rangeIn.value; break;
                case 2: rangeFeedback.innerHTML = rangeIn.value + " cm"; break;
            }
            rangeFeedback.style.fontWeight = "bold";    

            rangeIn.addEventListener('input', ()=>{
                switch(currentIndex){
                case 0: rangeFeedback.value = rangeIn.value; break;
                case 1: rangeFeedback.innerHTML = rangeIn.value; break;
                case 2: rangeFeedback.innerHTML = rangeIn.value + " cm"; break;
            }
            })

            answer.appendChild(rangeIn);
            answer.appendChild(rangeFeedback);
        }else{
            const answIndex = currentIndex-3;
            question.innerHTML = ans_qtn[answIndex];

            const optionsDiv = document.createElement("div");
            optionsDiv.classList.add(
                "d-flex",
                "flex-wrap",
                "gap-3",
                "justify-content-center"
            );

            for(let i = 0; i< ans[answIndex].length; i++){
                const option = ans[answIndex][i];

                const btn = document.createElement('button');
                btn.type = 'button';
                btn.innerHTML = option;
                btn.classList.add('btn', 'btn-outline-light', "btn-lg");

                btn.addEventListener('click', ()=>{
                    selectedValue = option;

                    let buttons = document.querySelectorAll('button');
                    for(let j = 0; j<buttons.length;j++){
                        buttons[j].classList.remove('active');
                    }
                    btn.classList.add('active');
                })
                optionsDiv.appendChild(btn)
            }
            answer.appendChild(optionsDiv);
        }
    }
    loadQuestion();
})