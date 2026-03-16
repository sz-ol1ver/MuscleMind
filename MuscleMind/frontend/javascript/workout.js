import {getWorkout, postNewPlan} from './api.js';

let workoutPlan = null; //? edzesterv obj
let currentDay = 0; //? selected day

document.addEventListener('DOMContentLoaded', ()=>{
    //? id
    const plan_name = document.getElementById('routine-name');
    const plan_days = document.getElementById('routine-day');
    const next = document.getElementById('next');
    const day_name = document.getElementById('day_name');
    const select = document.getElementById('gyakorlat');
    const rest = document.getElementById('rest');
    const save = document.getElementById('save');
    const cancel = document.getElementById('cancel');
    const create = document.getElementById('create');
    const info = document.getElementById('info');
    //* id: day-1 ... day-7

    //! start
    loadWorkouts();

    cancel.addEventListener('click', ()=>{
        workoutPlan = null;
        location.reload();
    });
    next.addEventListener('click', ()=>{
        if(plan_name.value && plan_days.value){
            if(plan_days.value >= 1 && plan_days.value <=7){
                workoutPlan = {
                    name: plan_name.value,
                    days: []
                };
                for(let i = 1; i <= plan_days.value; i++){
                    workoutPlan.days.push({
                        dayNumber: i,
                        name: "Nap " + i,
                        restDay: false,
                        exercises: []
                    });
                }
                loadExercises();
                document.querySelectorAll(".day-box").forEach(button => {
                    if(button.value > plan_days.value){
                        button.classList.add("d-none");
                    }
                    button.addEventListener("click", () => {
                        currentDay = Number(button.value) - 1;
                        renderTable();
                        if(workoutPlan.days[currentDay].restDay == false){
                            rest.checked = false;
                            workoutPlan.days[currentDay].restDay = false;
                            select.disabled = false;
                        }else{
                            rest.checked = true;
                        }
                        day_name.value = workoutPlan.days[currentDay].name;
                        document.querySelectorAll(".day-box").forEach(button => {
                            button.classList.remove('active');
                        });
                        button.classList.add('active');
                    });
                });
                day_name.value = workoutPlan.days[currentDay].name;
                create.classList.add('d-none');
                info.classList.remove('d-none');
                save.classList.remove('d-none');
                cancel.classList.remove('d-none');
            }
        }
    });
    day_name.addEventListener('change', ()=>{
        workoutPlan.days[currentDay].name = day_name.value;
    })
    select.addEventListener('change', ()=>{
        for(let i = 0; i<workoutPlan.days[currentDay].exercises.length;i++){
            if(select.value == workoutPlan.days[currentDay].exercises[i].exerciseId){
                select.value = 0;
                return alert('Ez a gyakorlat már hozzá van adva ehhez a naphoz.');
            }
        }
        workoutPlan.days[currentDay].exercises.push({
            exerciseId: Number(select.value),
            name: select.options[select.selectedIndex].text,
            order: workoutPlan.days[currentDay].exercises.length + 1
        });
        renderTable();
        select.value = 0;
    })
    rest.addEventListener('change', ()=>{
        if(rest.checked){
            workoutPlan.days[currentDay].restDay = true;
            workoutPlan.days[currentDay].exercises = [];
            workoutPlan.days[currentDay].exercises.push({
                exerciseId: 0,
                name: 'REST DAY',
                order: null
            })
            select.disabled = true;
            renderTable();
        }else{
            workoutPlan.days[currentDay].restDay = false;
            workoutPlan.days[currentDay].exercises = [];
            select.disabled = false;
            renderTable();
        }
    })
    save.addEventListener('click', ()=>{
        if(create.classList.contains('d-none') && !info.classList.contains('d-none')){
            const days = workoutPlan.days.length;
            let db = 0;
            for(let i = 0; i<workoutPlan.days.length;i++){
                if(workoutPlan.days[i].restDay == false && workoutPlan.days[i].exercises.length == 0){
                    return alert('Az edzésterv nem teljes!')
                }
                if(workoutPlan.days[i].restDay == true){
                    db++
                }
            }
            if(days == db){
                return alert('Edzésterv nem állhat csak pihenőnapból!')
            }
            postPlan(workoutPlan);
        }
        
    })
});

async function postPlan(obj) {
    const alert = document.getElementById('alert');
    try {
        const data = await postNewPlan('http://127.0.0.1:3000/api/workout/newPlan', obj);
        alert.innerHTML = data.message;
        alert.classList.add('alert-success');
        alert.classList.remove('d-none');
        setTimeout(()=>{
            location.reload();
        }, 2000)
    } catch (error) {
        alert.innerHTML = error.message+ "\n"+error.error;
        alert.classList.add('alert-danger');
        alert.classList.remove('d-none');
        setTimeout(()=>{
            location.reload();
        }, 2000)
    }
}

async function loadExercises() {
    const select = document.getElementById('gyakorlat');
    try {
        const data = await getWorkout('http://127.0.0.1:3000/api/workout/exercises');
        const exercises = data.message;
        for(let gyakorlat of exercises){
            let option = document.createElement('option');
            option.value = gyakorlat.id;
            option.innerHTML = '['+gyakorlat.muscle_group+'] - '+gyakorlat.name;
            select.appendChild(option);
        }
    } catch (error) {
        console.error(error.message + "\n"+error.error);
    }
}

async function loadWorkouts() {
    try {
        const workoutDiv = document.getElementById('personal-items');
        const data = await getWorkout('http://127.0.0.1:3000/api/workout/my-plans');

        workoutDiv.innerHTML = '';

        for (let i = 0; i < data.plans.length; i++) {
            const card = document.createElement('div');
            card.className = 'mainCard card p-3 shadow-sm plan-card mx-2';
            card.style.minWidth = 'auto';

            const title = document.createElement('h2');
            title.className = 'mb-1 d-block fw-bold';
            title.textContent = data.plans[i].name;

            const day = document.createElement('p');
            day.className = 'mb-4 d-block';
            day.textContent = "Napok száma: "+data.plans[i].days_count;

            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'd-flex gap-2';

            const detailsBtn = document.createElement('button');
            detailsBtn.className = 'btn btn-primary';
            detailsBtn.type = 'button';
            detailsBtn.value = data.plans[i].id;
            detailsBtn.textContent = 'Részletek';
            detailsBtn.setAttribute('data-bs-toggle', 'collapse');
            detailsBtn.setAttribute('data-bs-target', `#workout-details-${data.plans[i].id}`);
            detailsBtn.setAttribute('aria-expanded', 'false');
            detailsBtn.setAttribute('aria-controls', `workout-details-${data.plans[i].id}`);
            //? load details
            detailsBtn.addEventListener('click', ()=>{
                loadWorkoutDetail(detailsBtn.value);
            })

            const selectBtn = document.createElement('button');
            selectBtn.className = 'btn btn-outline-light';
            selectBtn.type = 'button';
            selectBtn.textContent = 'Kiválasztás';

            const collapseDiv = document.createElement('div');
            collapseDiv.className = 'detailCard collapse mt-3 card p-3';
            collapseDiv.id = `workout-details-${data.plans[i].id}`;

            buttonContainer.appendChild(detailsBtn);
            buttonContainer.appendChild(selectBtn);

            card.appendChild(title);
            card.appendChild(day);
            card.appendChild(buttonContainer);
            card.appendChild(collapseDiv);

            workoutDiv.appendChild(card);
        }
    } catch (error) {
        console.error(error.message + '\n' + error.error);
    }
}
async function loadWorkoutDetail(id) {
    try {
        const detailDiv = document.getElementById(`workout-details-${id}`);
        detailDiv.innerHTML = '';

        const data = await getWorkout('http://127.0.0.1:3000/api/workout/my-plan/' + id);
        const details = data.details;

        for (const day of details) {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'workout-day fw-bold mt-2';
            dayDiv.textContent = `Day ${day.dayNumber} - ${day.name}`;
            detailDiv.appendChild(dayDiv);

            const exerciseContainer = document.createElement('div');
            exerciseContainer.className = 'ms-3';

            if (day.isRestDay) {
                const rest = document.createElement('div');
                rest.textContent = 'Pihenőnap';
                exerciseContainer.appendChild(rest);
            } else {
                for (let i = 0; i < day.exercises.length; i++) {
                    const ex = day.exercises[i];

                    const exDiv = document.createElement('div');
                    exDiv.textContent = `${ex.order}. ${ex.name}`;

                    exerciseContainer.appendChild(exDiv);
                }
            }

            detailDiv.appendChild(exerciseContainer);
        }
    } catch (error) {
        console.error(error.message + '\n' + error.error);
    }
}
function renderTable(){
    const tbody = document.getElementById('exercise');
    tbody.innerHTML = "";

    const exercises = workoutPlan.days[currentDay].exercises;

    for(let i = 0; i < exercises.length; i++){

        const tr = document.createElement("tr");

        const tdName = document.createElement("td");
        tdName.textContent = exercises[i].name;
        tdName.classList.add('text-start')

        const tdOrder = document.createElement("td");
        tdOrder.textContent = exercises[i].order;

        const tdDelete = document.createElement("td");

        const btn = document.createElement("button");
        btn.textContent = "Törlés";
        btn.classList.add('btn', 'btn-outline-danger');

        btn.addEventListener("click", () => {
            exercises.splice(i,1);
            // order újraszámolása
            for(let j = 0; j < exercises.length; j++){
                exercises[j].order = j + 1;
            }
            renderTable();
        });
        if(exercises[i].exerciseId != 0){
            tdDelete.appendChild(btn);
        }
        tr.appendChild(tdName);
        tr.appendChild(tdOrder);
        tr.appendChild(tdDelete);

        tbody.appendChild(tr);
    }
}