import {userAns} from './api.js';

const custom_qtn = [
    'Mennyi a testsúlyod? (kg)',
    'Mikor születtél?',
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
    birthDate: null,
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
    const successCon = document.getElementById('success');
    const messageCon = document.getElementById('message');
    const kerdoivCon = document.getElementById('kerdoiv-con');

    let currentIndex = 0;
    let selectedValue = null;

    next.addEventListener('click', async()=>{
        if(currentIndex < custom_qtn.length){
            switch (currentIndex){
                case 0: {
                    const rangeValue = document.getElementById("range_input").value;
                    userProfile.weight = Number(rangeValue);
                    break;
                }

                case 1: {
                    const birthDateValue = document.getElementById('date_input').value;

                    if(!birthDateValue){
                        window.alert('Add meg a születési dátumodat!');
                        return;
                    }

                    userProfile.birthDate = birthDateValue;
                    break;
                }

                case 2: {
                    const rangeValue = document.getElementById("range_input").value;
                    userProfile.height = Number(rangeValue);
                    break;
                }
            }
        }else if(currentIndex >= custom_qtn.length){
            if(!selectedValue){
                window.alert('Válassz egy lehetőséget');
                return;
            }
            const answIndex = currentIndex - custom_qtn.length;
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
                console.log(userProfile)
                const data = await userAns('http://127.0.0.1:3000/api/question', userProfile);
                kerdoivCon.style.display = 'none';
                successCon.style.display = 'block';
                messageCon.innerHTML = data.message;
                setTimeout(()=>{
                    successCon.style.display = 'none';
                    setTimeout(()=>{
                        window.location.href = '/';
                    }, 200)
                }, 3000)
            } catch (error) {
                console.log(error)
                currentIndex = error.id;
                loadQuestion();
                window.alert('Hibás választ adtál meg!\nA hibás választól újra indul a kérdőív!');
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
            question.innerHTML = custom_qtn[currentIndex];

            if(currentIndex === 1){
                const dateInput = document.createElement('input');
                dateInput.type = 'date';
                dateInput.id = 'date_input';
                dateInput.classList.add('w-25','d-block','mx-auto','mt-2','form-control','bg-dark','text-white');

                const today = new Date();
                const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
                const minDate = new Date(today.getFullYear() - 99, today.getMonth(), today.getDate());

                dateInput.max = maxDate.toISOString().split('T')[0];
                dateInput.min = minDate.toISOString().split('T')[0];
                dateInput.value = maxDate.toISOString().split('T')[0];

                answer.appendChild(dateInput);
                return;
            }

            const rangeIn = document.createElement('input');
            rangeIn.type = 'range';
            rangeIn.id = 'range_input';

            let rangeFeedback;

            if(currentIndex === 0){
                rangeIn.step = 0.1;
                rangeIn.min = 40;
                rangeIn.max = 200;
                rangeIn.value = 70;

                rangeFeedback = document.createElement('input');
                rangeFeedback.type = 'number';
                rangeFeedback.min = 40;
                rangeFeedback.max = 200;
                rangeFeedback.step = 0.1;
                rangeFeedback.value = rangeIn.value;
                rangeFeedback.classList.add('w-25','d-block','mx-auto','mt-2','form-control','bg-dark','text-white');

                rangeFeedback.addEventListener('change', ()=>{
                    const value = Number(rangeFeedback.value);

                    if(value >= 40 && value <= 200){
                        rangeIn.value = value;
                    }else{
                        rangeFeedback.value = rangeIn.value;
                    }
                });
            }

            if(currentIndex === 2){
                rangeIn.min = 140;
                rangeIn.max = 220;
                rangeIn.value = 175;

                rangeFeedback = document.createElement('h3');
                rangeFeedback.style.fontWeight = 'bold';
                rangeFeedback.innerHTML = rangeIn.value + ' cm';
            }

            rangeIn.addEventListener('input', ()=>{
                if(currentIndex === 0){
                    rangeFeedback.value = rangeIn.value;
                }

                if(currentIndex === 2){
                    rangeFeedback.innerHTML = rangeIn.value + ' cm';
                }
            });

            answer.appendChild(rangeIn);
            answer.appendChild(rangeFeedback);
            return;
        }

        const answIndex = currentIndex - custom_qtn.length;
        question.innerHTML = ans_qtn[answIndex];

        if(!ans[answIndex]){
            return;
        }

        const optionsDiv = document.createElement('div');
        optionsDiv.classList.add('d-flex','flex-wrap','gap-3','justify-content-center');

        for(let i = 0; i < ans[answIndex].length; i++){
            const option = ans[answIndex][i];

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.innerHTML = option;
            btn.classList.add('btn','btn-outline-light','btn-lg');

            btn.addEventListener('click', ()=>{
                selectedValue = option;

                document.querySelectorAll('#answ button').forEach(button => {
                    button.classList.remove('active');
                });

                btn.classList.add('active');
            });

            optionsDiv.appendChild(btn);
        }

        answer.appendChild(optionsDiv);
    }
    if(currentIndex == 0){
        loadQuestion();
    }
    
})