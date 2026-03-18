import {getWorkout, postNewPlan, deleteWorkout, putPlan} from './api.js';

let workoutPlan = null; //? edzesterv obj
let originalWorkoutPlan = null;
let currentDay = 0; //? selected day
let mode = "save" //! save / edit
let planEditId = null;
let recommendedPlans = [];
let filteredPlans = [];
let exercisesList = [];
let filteredExercisesList = [];
let muscle_groups = [];
const filters = {
    level: 'all',
    location: 'all',
    goal: 'all',
    days: 'all'
};
const exerciseFilter = {
    muscle: 'all'
};

let plan_name;
let plan_days;
let next;
let day_name;
let select;
let muscleSelect;
let rest;
let save;
let cancel;
let create;
let info;
let level;
let goal;
let wLocation;
let days;
let reset;

document.addEventListener('DOMContentLoaded', ()=>{
    //? id
    plan_name = document.getElementById('routine-name');
    plan_days = document.getElementById('routine-day');
    next = document.getElementById('next');
    day_name = document.getElementById('day_name');
    select = document.getElementById('gyakorlat');
    muscleSelect = document.getElementById('muscle-group');
    rest = document.getElementById('rest');
    save = document.getElementById('save');
    cancel = document.getElementById('cancel');
    create = document.getElementById('create');
    info = document.getElementById('info');
    level = document.getElementById('filter-level');
    wLocation = document.getElementById('filter-location');
    goal = document.getElementById('filter-goal');
    days = document.getElementById('filter-days');
    reset = document.getElementById('filter-reset-btn')
    //* id: day-1 ... day-7

    //! start
    loadWorkouts();
    loadRecWorkouts();

    //! addeventlistener
    level.addEventListener('change', ()=>{
        filters.level = level.value;
        filterPlans();
    });
    wLocation.addEventListener('change', ()=>{
        filters.location = wLocation.value;
        filterPlans();
    });
    goal.addEventListener('change', ()=>{
        filters.goal = goal.value;
        filterPlans();
    });
    days.addEventListener('change', ()=>{
        filters.days = days.value;
        filterPlans();
    });
    reset.addEventListener('click', ()=>{
        resetFilters();
    })
    muscleSelect.addEventListener('change', ()=>{
        exerciseFilter.muscle = muscleSelect.value;
        filterMuscleGroups();
    })
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
        renderExercises(filteredExercisesList);
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
            if(mode == 'save'){
                postPlan(workoutPlan);
            }else if(mode == 'edit'){
                updatePlan(workoutPlan)
            }
            
        }
        
    })
});
async function deletePlan(id) {
    try {
        const alertDelete = document.getElementById('alert-delete-'+id);
        const data = await deleteWorkout('http://127.0.0.1:3000/api/workout/my-plan/delete/'+id);
        alertDelete.innerHTML = data.message;
        alertDelete.classList.add('alert-success');
        alertDelete.classList.remove('d-none');
        setTimeout(()=>{
            location.reload();
        }, 2000);
    } catch (error) {
        console.error(error.message);
        alertDelete.innerHTML = data.message;
        alertDelete.classList.add('alert-danger');
        alertDelete.classList.remove('d-none');
        setTimeout(()=>{
            alertDelete.innerHTML = '';
            alertDelete.classList.add('d-none');
            alertDelete.classList.remove('alert-danger');
        }, 2000);
    }
}
async function postPlan(obj) {
    const alert = document.getElementById('alert-save');
    
    try {
        const data = await postNewPlan('http://127.0.0.1:3000/api/workout/newPlan', obj);
        alert.innerHTML = data.message;
        alert.classList.add('alert-success', 'w-100');
        alert.classList.remove('d-none');
        setTimeout(()=>{
            location.reload();
        }, 2000)
    } catch (error) {
        alert.innerHTML = error.message+ "\n"+error.error;
        alert.classList.add('alert-danger', 'w-100');
        alert.classList.remove('d-none');
        setTimeout(()=>{
            location.reload();
        }, 2000)
    }
}
async function updatePlan(obj) {
    const alert = document.getElementById('alert-save');
    if(JSON.stringify(workoutPlan) === JSON.stringify(originalWorkoutPlan)){
        alert.innerHTML = 'Nem történt változás!';
        alert.classList.add('alert-warning', 'w-100');
        alert.classList.remove('d-none');
        setTimeout(()=>{
            location.reload();
        }, 3000);
        return;
    }
    try {
        for(let i = 0; i<obj.days.length;i++){
            if(obj.days[i].name == ''){
                obj.days[i].name = 'Nap '+(i+1);
            }
        }
        const data = await putPlan('http://127.0.0.1:3000/api/workout/my-plan/update/'+planEditId, obj);
        alert.innerHTML = data.message;
        alert.classList.add('alert-success', 'w-100');
        alert.classList.remove('d-none');
        setTimeout(()=>{
            location.reload();
        }, 3000)
    } catch (error) {
        alert.innerHTML = error.message+ "\n"+error.error;
        alert.classList.add('alert-danger', 'w-100');
        alert.classList.remove('d-none');
        setTimeout(()=>{
            location.reload();
        }, 3000)
    }
}
async function loadExercises() {
    try {
        const data = await getWorkout('http://127.0.0.1:3000/api/workout/exercises');
        exercisesList = data.message;
        renderExercises(exercisesList);
        for(let row of data.message){
            if(!muscle_groups.includes(row.muscle_group)){
                muscle_groups.push(row.muscle_group)
            }
        }
        for(let i = 0; i<muscle_groups.length;i++){
            let option = document.createElement('option');
            option.value = muscle_groups[i];
            option.innerHTML = muscle_groups[i].replace("_", " ");
            muscleSelect.appendChild(option);
        }
    } catch (error) {
        console.error(error.message + "\n"+error.error);
    }
}
function renderExercises(exercises){
    select.innerHTML = '';

    let optionSelect = document.createElement('option');
    optionSelect.value = '';
    optionSelect.innerHTML = 'Gyakorlat kiválasztása ▼';
    optionSelect.selected = true;
    optionSelect.disabled = true;
    select.appendChild(optionSelect);

    for(let gyakorlat of exercises){
        let option = document.createElement('option');
        option.value = gyakorlat.id;
        option.innerHTML = '['+gyakorlat.muscle_group.replace("_", " ")+'] - '+gyakorlat.name;
        select.appendChild(option);
    }
}
function filterMuscleGroups(){
    filteredExercisesList.length = 0;
    for(let row of exercisesList){
        if(exerciseFilter.muscle !== 'all' && row.muscle_group !== exerciseFilter.muscle){
            continue;
        }
        filteredExercisesList.push(row);
    }
    console.log(filteredExercisesList)
    renderExercises(filteredExercisesList);
}
async function loadWorkouts() {
    try {
        const userPlans = document.getElementById('user-plan');
        const workoutDiv = document.getElementById('personal-items');
        const data = await getWorkout('http://127.0.0.1:3000/api/workout/my-plans');

        workoutDiv.innerHTML = '';

        if(data.plans.length == 0){
            userPlans.classList.add('d-none')
        }else{
            userPlans.classList.remove('d-none');
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
            buttonContainer.className = 'd-flex gap-2 mt-auto';

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
            selectBtn.value = data.plans[i].id;

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
        }};
        
    } catch (error) {
        console.error(error.message + '\n' + error.error);
    }
}
function renderRecWorkouts(plans){
    const userPlans = document.getElementById('recommended-plan');
    const workoutDiv = document.getElementById('recommended-items');

    workoutDiv.innerHTML = '';

    if(plans.length === 0){
        userPlans.classList.remove('d-none');
        workoutDiv.innerHTML = '<p class="text-center w-100">Nincs találat.</p>';
        return;
    }

    userPlans.classList.remove('d-none');

    for (let i = 0; i < plans.length; i++) {
        const card = document.createElement('div');
        card.className = 'mainCard card p-3 shadow-sm plan-card mx-2';
        card.style.minWidth = 'auto';

        const title = document.createElement('h2');
        title.className = 'mb-1 d-block fw-bold workout-title';
        title.textContent = plans[i].name;

        const day = document.createElement('p');
        day.className = 'mb-4 d-block';
        day.textContent = "Napok száma: " + plans[i].days_count;

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'd-flex gap-2 mt-auto';

        const detailsBtn = document.createElement('button');
        detailsBtn.className = 'btn btn-primary';
        detailsBtn.type = 'button';
        detailsBtn.value = plans[i].id;
        detailsBtn.textContent = 'Részletek';
        detailsBtn.setAttribute('data-bs-toggle', 'collapse');
        detailsBtn.setAttribute('data-bs-target', `#workout-details-${plans[i].id}`);
        detailsBtn.setAttribute('aria-expanded', 'false');
        detailsBtn.setAttribute('aria-controls', `workout-details-${plans[i].id}`);
        detailsBtn.addEventListener('click', ()=>{
            loadRecWorkoutDetail(detailsBtn.value);
        });

        const selectBtn = document.createElement('button');
        selectBtn.className = 'btn btn-outline-light';
        selectBtn.type = 'button';
        selectBtn.textContent = 'Kiválasztás';
        selectBtn.value = plans[i].id;

        const collapseDiv = document.createElement('div');
        collapseDiv.className = 'detailCard collapse mt-3 card p-3';
        collapseDiv.id = `workout-details-${plans[i].id}`;

        buttonContainer.appendChild(detailsBtn);
        buttonContainer.appendChild(selectBtn);

        card.appendChild(title);
        card.appendChild(day);
        card.appendChild(buttonContainer);
        card.appendChild(collapseDiv);

        workoutDiv.appendChild(card);
    }
}
async function loadRecWorkouts() {
    try {
        const userPlans = document.getElementById('recommended-plan');
        const data = await getWorkout('http://127.0.0.1:3000/api/workout/default-plans');

        recommendedPlans = data.plans;

        if(recommendedPlans.length === 0){
            userPlans.classList.add('d-none');
            return;
        }

        userPlans.classList.remove('d-none');
        renderRecWorkouts(recommendedPlans);

    } catch (error) {
        console.error(error.message + '\n' + error.error);
    }
}
async function loadWorkoutDetail(id) {
    try {
        const detailDiv = document.getElementById(`workout-details-${id}`);
        detailDiv.innerHTML = '';

        const data = await getWorkout('http://127.0.0.1:3000/api/workout/my-plan/' + id);
        const details = data.details.days;

        for (const day of details) {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'workout-day fw-bold mt-2';
            if(day.name != 'Nap '+day.dayNumber){
                dayDiv.textContent = `Nap ${day.dayNumber} - ${day.name}`;
            }else{
                dayDiv.textContent = `${day.name}`;
            }
            
            detailDiv.appendChild(dayDiv);

            const exerciseContainer = document.createElement('div');
            exerciseContainer.className = 'ms-3';

            if (day.restDay) {
                const rest = document.createElement('div');
                rest.textContent = '- Pihenőnap';
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
        let hr = document.createElement('hr');

        let alertDiv = document.createElement('div');
        alertDiv.className = 'alert d-block mx-auto d-none col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 text-center fw-bold';
        alertDiv.id = 'alert-delete-'+id;

        let editDiv = document.createElement('div');
        editDiv.className = 'text-end'
        let deleteDiv = document.createElement('div');
        deleteDiv.className = 'text-end mt-2'

        let deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-outline-danger w-50';
        deleteButton.id = 'deleteBtn';
        deleteButton.textContent = 'Törlés';
        deleteButton.addEventListener('click', ()=>{
            deletePlan(id);
        })
        let editButton = document.createElement('button');
        editButton.className = 'btn btn-outline-warning w-50';
        editButton.id = 'editBtn';
        editButton.textContent = 'Szerkesztés';
        editButton.addEventListener('click', ()=>{
            mode = 'edit';
            editWorkout(id);
        })

        editDiv.appendChild(editButton);
        deleteDiv.appendChild(deleteButton);
        
        detailDiv.appendChild(hr);
        detailDiv.appendChild(alertDiv);
        detailDiv.appendChild(editDiv);
        detailDiv.appendChild(deleteDiv);
    } catch (error) {
        console.error(error.message + '\n' + error.error);
    }
}
async function loadRecWorkoutDetail(id) {
    try {
        const detailDiv = document.getElementById(`workout-details-${id}`);
        detailDiv.innerHTML = '';

        const data = await getWorkout('http://127.0.0.1:3000/api/workout/default-plan/' + id);
        const details = data.details.days;

        const descDiv = document.createElement('div');
        const descLabel = document.createElement('h4');
        descLabel.className = 'fw-bold mb-3';
        descLabel.innerHTML = 'Nap leírása'
        descDiv.appendChild(descLabel);

        if(data.details.description){
            const descP = document.createElement('p');

            descP.className = 'text-wrap card bg-secondary text-light p-3 text-justify';
            descP.innerHTML = data.details.description;
            
            descDiv.appendChild(descP);
        }
        detailDiv.appendChild(descDiv);

        for (const day of details) {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'workout-day fw-bold mt-2';
            if(day.name != 'Nap '+day.dayNumber){
                dayDiv.textContent = `Nap ${day.dayNumber} - ${day.name}`;
            }else{
                dayDiv.textContent = `${day.name}`;
            }
            
            detailDiv.appendChild(dayDiv);

            const exerciseContainer = document.createElement('div');
            exerciseContainer.className = 'ms-3';

            if (day.restDay) {
                const rest = document.createElement('div');
                rest.textContent = '- Pihenőnap';
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
async function editWorkout(id) {
    const data = await getWorkout('http://127.0.0.1:3000/api/workout/my-plan/' + id);
    planEditId = id;
    workoutPlan = data.details;
    originalWorkoutPlan = JSON.parse(JSON.stringify(data.details));
    for(let i = 0; i<workoutPlan.days.length; i++){
        if(workoutPlan.days[i].restDay == true){
            workoutPlan.days[i].exercises.push({
                exerciseId: 0,
                name: 'REST DAY',
                order: null
            })
        }
    }
    const editTitle = document.getElementById('newPlanTitle');
    editTitle.innerHTML = workoutPlan.name + " - szerkesztés";
    //? display
    create.classList.add('d-none');
    info.classList.remove('d-none');
    save.classList.remove('d-none');
    cancel.classList.remove('d-none');
    location.href = '#action';


    loadExercises();
    currentDay = 0;
    renderTable();
    if(workoutPlan.days[currentDay].restDay == false){
        rest.checked = false;
        select.disabled = false;
    }else{
        rest.checked = true;
        select.disabled = true;
    }
    day_name.value = workoutPlan.days[currentDay].name;
    document.querySelectorAll(".day-box").forEach(button => {
        if(button.value > workoutPlan.days_count){
            button.classList.add("d-none");
        }
        button.addEventListener("click", () => {
            currentDay = Number(button.value) - 1;
            renderTable();
            if(workoutPlan.days[currentDay].restDay == false){
                rest.checked = false;
                select.disabled = false;
            }else{
                rest.checked = true;
                select.disabled = true;
            }
            day_name.value = workoutPlan.days[currentDay].name;
            document.querySelectorAll(".day-box").forEach(button => {
                button.classList.remove('active');
            });
            button.classList.add('active');
        });
    });
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
function filterPlans(){
    filteredPlans.length = 0;
    for(let row of recommendedPlans){

        if(filters.location !== 'all' && row.location != filters.location){
            continue;
        }

        if(filters.goal !== 'all' && row.goal != filters.goal){
            continue;
        }

        if(filters.level !== 'all' && row.level != filters.level){
            continue;
        }

        if(filters.days !== 'all' && row.days_count != Number(filters.days)){
            continue;
        }

        filteredPlans.push(row);
    }
    renderRecWorkouts(filteredPlans);
}
function resetFilters(){
    filters.level = 'all';
    filters.location = 'all';
    filters.goal = 'all';
    filters.days = 'all';

    level.value = 'all';
    wLocation.value = 'all';
    goal.value = 'all';
    days.value = 'all';

    renderRecWorkouts(recommendedPlans);
}