import {getFetch, postNewPlan, deleteFetch, putPlan, patchFetch} from './api.js';

let workoutDaysBuilder;

let workoutPlan = null; //? edzesterv obj
let originalWorkoutPlan = null;
let currentDay = 0; //? selected day

let mode = "save" //! save / edit
let planEditId = null;

let activePlan = null;

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
let selectedDiv;
let selectedDivItems;

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
    reset = document.getElementById('filter-reset-btn');
    selectedDiv = document.getElementById('selected-plan');
    selectedDivItems = document.getElementById('selected-items');
    workoutDaysBuilder = document.getElementById('workout-days-builder');
    //* id: day-1 ... day-7

    //! start
    getActive();

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
    cancel.addEventListener('click', () => {
        resetWorkoutEditor();
    });
    next.addEventListener('click', async () => {
        if(!plan_name.value.trim()){
            return alert('Adj nevet az edzéstervnek!');
        }

        let daysCount = Number(plan_days.value);

        if(!Number.isInteger(daysCount) || daysCount < 1 || daysCount > 7){
            return alert('A napok száma 1 és 7 között lehet!');
        }

        await loadExercises();

        workoutPlan = {
            name: plan_name.value.trim(),
            days: []
        };

        for(let i = 1; i <= daysCount; i++){
            workoutPlan.days.push({
                dayNumber: i,
                name: 'Nap ' + i,
                restDay: false,
                exercises: []
            });
        }

        renderWorkoutDayCards();

        create.classList.add('d-none');
        info.classList.remove('d-none');
        save.classList.remove('d-none');
        cancel.classList.remove('d-none');
    });
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
                postPlan({
                    name: workoutPlan.name,
                    days: workoutPlan.days
                });
            }else if(mode == 'edit'){
                workoutPlan.days_count = workoutPlan.days.length;
                updatePlan(workoutPlan);
            }
            
        }
        
    })
});
function resetWorkoutEditor(){
    workoutPlan = null;
    originalWorkoutPlan = null;
    currentDay = 0;
    mode = 'save';
    planEditId = null;

    plan_name.value = 'new_workout';
    plan_days.value = '';

    workoutDaysBuilder.innerHTML = '';

    document.getElementById('newPlanTitle').innerHTML = 'Új edzésterv';

    create.classList.remove('d-none');
    info.classList.add('d-none');
    save.classList.add('d-none');
    cancel.classList.add('d-none');
}
function renderWorkoutDayCards(){
    workoutDaysBuilder.innerHTML = '';

    for(let i = 0; i < workoutPlan.days.length; i++){
        const day = workoutPlan.days[i];

        const dayCard = document.createElement('div');
        dayCard.className = 'workout-form-card';

        const header = document.createElement('div');
        header.className = 'd-flex justify-content-between align-items-center flex-wrap gap-2 mb-3';

        const title = document.createElement('h5');
        title.className = 'mb-0 fw-bold';
        title.textContent = `${day.dayNumber}. nap`;

        const restWrap = document.createElement('div');
        restWrap.className = 'form-check';

        const restInput = document.createElement('input');
        restInput.className = 'form-check-input day-rest';
        restInput.type = 'checkbox';
        restInput.id = `rest-day-${i}`;
        restInput.checked = day.restDay;

        const restLabel = document.createElement('label');
        restLabel.className = 'form-check-label fw-bold';
        restLabel.setAttribute('for', `rest-day-${i}`);
        restLabel.textContent = 'Pihenőnap';

        restWrap.appendChild(restInput);
        restWrap.appendChild(restLabel);

        header.appendChild(title);
        header.appendChild(restWrap);

        const nameBox = document.createElement('div');
        nameBox.className = 'mb-3';

        const nameLabel = document.createElement('label');
        nameLabel.className = 'form-label fw-bold';
        nameLabel.textContent = 'Nap neve';

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.className = 'form-control workout-input day-name';
        nameInput.value = day.name;
        nameInput.placeholder = 'Pl.: Mell-tricepsz';

        nameBox.appendChild(nameLabel);
        nameBox.appendChild(nameInput);

        const row = document.createElement('div');
        row.className = 'row g-3';

        const tableCol = document.createElement('div');
        tableCol.className = 'col-12 col-lg-8';

        const table = document.createElement('table');
        table.className = 'table workout-table';

        const thead = document.createElement('thead');
        const headTr = document.createElement('tr');

        const thExercise = document.createElement('th');
        thExercise.textContent = 'Gyakorlat';

        const thOrder = document.createElement('th');
        thOrder.textContent = 'Sorrend';

        const thAction = document.createElement('th');
        thAction.textContent = '';

        headTr.appendChild(thExercise);
        headTr.appendChild(thOrder);
        headTr.appendChild(thAction);
        thead.appendChild(headTr);

        const tbody = document.createElement('tbody');
        tbody.className = 'day-exercise-list';

        table.appendChild(thead);
        table.appendChild(tbody);
        tableCol.appendChild(table);

        const controlsCol = document.createElement('div');
        controlsCol.className = 'col-12 col-lg-4';

        const controlsCard = document.createElement('div');
        controlsCard.className = 'workout-form-card h-100';

        const muscleLabel = document.createElement('label');
        muscleLabel.className = 'form-label fw-bold';
        muscleLabel.textContent = 'Izomcsoport';

        const muscleSelect = document.createElement('select');
        muscleSelect.className = 'form-control workout-input muscle-filter mb-3';

        const allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.textContent = 'Összes izomcsoport';
        muscleSelect.appendChild(allOption);

        for(const group of muscle_groups){
            const option = document.createElement('option');
            option.value = group;
            option.textContent = formatMuscleGroup(group);
            muscleSelect.appendChild(option);
        }

        const exerciseLabel = document.createElement('label');
        exerciseLabel.className = 'form-label fw-bold';
        exerciseLabel.textContent = 'Gyakorlat';

        const exerciseSelect = document.createElement('select');
        exerciseSelect.className = 'form-control workout-input exercise-select mb-3';

        const addBtn = document.createElement('button');
        addBtn.type = 'button';
        addBtn.className = 'btn btn-outline-info w-100';
        addBtn.textContent = 'Gyakorlat hozzáadása';

        controlsCard.appendChild(muscleLabel);
        controlsCard.appendChild(muscleSelect);
        controlsCard.appendChild(exerciseLabel);
        controlsCard.appendChild(exerciseSelect);
        controlsCard.appendChild(addBtn);

        controlsCol.appendChild(controlsCard);

        row.appendChild(tableCol);
        row.appendChild(controlsCol);

        dayCard.appendChild(header);
        dayCard.appendChild(nameBox);
        dayCard.appendChild(row);

        workoutDaysBuilder.appendChild(dayCard);

        renderExerciseSelect(exerciseSelect, 'all');
        renderDayExerciseTable(i, tbody);

        nameInput.addEventListener('change', () => {
            workoutPlan.days[i].name = nameInput.value.trim() || `Nap ${i + 1}`;
        });

        muscleSelect.addEventListener('change', () => {
            renderExerciseSelect(exerciseSelect, muscleSelect.value);
        });

        addBtn.addEventListener('click', () => {
            addExerciseToDay(i, exerciseSelect);
        });

        restInput.addEventListener('change', () => {
            workoutPlan.days[i].restDay = restInput.checked;

            if(restInput.checked){
                workoutPlan.days[i].exercises = [{
                    exerciseId: 0,
                    name: 'REST DAY',
                    order: null
                }];

                muscleSelect.disabled = true;
                exerciseSelect.disabled = true;
                addBtn.disabled = true;
            }else{
                workoutPlan.days[i].exercises = [];

                muscleSelect.disabled = false;
                exerciseSelect.disabled = false;
                addBtn.disabled = false;
            }

            renderWorkoutDayCards();
        });

        if(day.restDay){
            muscleSelect.disabled = true;
            exerciseSelect.disabled = true;
            addBtn.disabled = true;
        }
    }
}
function renderExerciseSelect(selectElement, muscleGroup){
    selectElement.innerHTML = '';

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Gyakorlat kiválasztása ▼';
    defaultOption.selected = true;
    defaultOption.disabled = true;
    selectElement.appendChild(defaultOption);

    for(const exercise of exercisesList){
        if(muscleGroup !== 'all' && exercise.muscle_group !== muscleGroup){
            continue;
        }

        const option = document.createElement('option');
        option.value = exercise.id;
        option.textContent = `[${formatMuscleGroup(exercise.muscle_group)}] - ${exercise.name}`;
        selectElement.appendChild(option);
    }
}
function addExerciseToDay(dayIndex, exerciseSelect){
    const exerciseId = Number(exerciseSelect.value);

    if(!exerciseId){
        return alert('Válassz gyakorlatot!');
    }

    const day = workoutPlan.days[dayIndex];

    for(const exercise of day.exercises){
        if(exercise.exerciseId === exerciseId){
            exerciseSelect.value = '';
            return alert('Ez a gyakorlat már hozzá van adva ehhez a naphoz.');
        }
    }

    const selectedExercise = exercisesList.find(ex => ex.id === exerciseId);

    if(!selectedExercise){
        return alert('Nem található gyakorlat!');
    }

    day.exercises.push({
        exerciseId: selectedExercise.id,
        name: selectedExercise.name,
        order: day.exercises.length + 1
    });

    exerciseSelect.value = '';
    renderWorkoutDayCards();
}
function renderDayExerciseTable(dayIndex, tbody){
    tbody.innerHTML = '';

    const exercises = workoutPlan.days[dayIndex].exercises;

    for(let i = 0; i < exercises.length; i++){
        const tr = document.createElement('tr');

        const tdName = document.createElement('td');
        tdName.className = 'text-start';
        tdName.textContent = exercises[i].name;

        const tdOrder = document.createElement('td');
        tdOrder.textContent = exercises[i].order ?? '-';

        const tdAction = document.createElement('td');

        if(exercises[i].exerciseId !== 0){
            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'btn btn-outline-danger btn-sm';
            deleteBtn.textContent = 'Törlés';

            deleteBtn.addEventListener('click', () => {
                workoutPlan.days[dayIndex].exercises.splice(i, 1);

                for(let j = 0; j < workoutPlan.days[dayIndex].exercises.length; j++){
                    workoutPlan.days[dayIndex].exercises[j].order = j + 1;
                }

                renderWorkoutDayCards();
            });

            tdAction.appendChild(deleteBtn);
        }

        tr.appendChild(tdName);
        tr.appendChild(tdOrder);
        tr.appendChild(tdAction);

        tbody.appendChild(tr);
    }
}
function formatMuscleGroup(group){
    if(!group){
        return '-';
    }

    const muscles = {
        mell: 'Mell',
        hát: 'Hát',
        váll: 'Váll',
        bicepsz: 'Bicepsz',
        tricepsz: 'Tricepsz',
        alkar: 'Alkar',
        has: 'Has',
        ferde_has: 'Ferde has',
        alsó_hát: 'Alsó hát',
        comb_első: 'Combfeszítő',
        comb_hátsó: 'Combhajlító',
        farizom: 'Farizom',
        vádli: 'Vádli',
        teljes_test: 'Teljes test',
        cardio: 'Cardio'
    };

    return muscles[group] || group;
}
async function deletePlan(id) {
    const alertDelete = document.getElementById('alert-delete-'+id);
    try {
        const data = await deleteFetch('http://127.0.0.1:3000/api/workout/my-plan/delete/'+id);
        alertDelete.innerHTML = data.message;
        alertDelete.classList.add('alert-success');
        alertDelete.classList.remove('d-none');
        setTimeout(()=>{
            location.reload();
        }, 2000);
    } catch (error) {
        console.error(error.message);
        alertDelete.innerHTML = error.message || 'Hiba történt törlés közben.';
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
        const data = await getFetch('http://127.0.0.1:3000/api/workout/exercises');

        exercisesList = data.message;
        filteredExercisesList = [...exercisesList];

        muscle_groups.length = 0;

        for(const exercise of exercisesList){
            if(!muscle_groups.includes(exercise.muscle_group)){
                muscle_groups.push(exercise.muscle_group);
            }
        }
    } catch (error) {
        console.error(error.message + "\n" + error.error);
        alert('Gyakorlatok betöltése sikertelen!');
    }
}
async function getActive() {
    try {
        const data = await getFetch('http://127.0.0.1:3000/api/workout/plans/active');
        activePlan = data.active;
        if(activePlan == null){
            selectedDivItems.innerHTML = '<p class="text-center w-100">Nincs kiválasztva edzésterv!</p>';
        }else{
            selectedDivItems.innerHTML = '';
        }
        
        await loadWorkouts();
        await loadRecWorkouts();
    } catch (error) {
        return console.error(error.message);
    }
}
async function updateActive(id) {
    try {
        const obj = {
            active: id
        }
        const data = await patchFetch('http://127.0.0.1:3000/api/workout/plans/active', obj);
        await getActive();
    } catch (error) {
        console.error(error.message);
    }
}
async function loadWorkouts() {
    try {
        const workoutDiv = document.getElementById('personal-items');
        const data = await getFetch('http://127.0.0.1:3000/api/workout/my-plans');

        workoutDiv.innerHTML = '';

        
        for (let i = 0; i < data.plans.length; i++) {
            const card = document.createElement('div');
            card.className = 'mainCard card p-3 shadow-sm plan-card mx-2';
            card.style.minWidth = 'auto';
            card.id = 'mainCard-'+data.plans[i].id;

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
            detailsBtn.addEventListener('click', async () => {
                const detailDiv = document.getElementById(`workout-details-${data.plans[i].id}`);

                if (!detailDiv.dataset.loaded) {
                    detailDiv.innerHTML = '<div class="text-center py-3">Betöltés...</div>';
                    
                    setTimeout(async () => {
                        await loadWorkoutDetail(data.plans[i].id);
                        detailDiv.dataset.loaded = 'true';
                    }, 150);
                }
            });

            const selectBtn = document.createElement('button');
            selectBtn.className = 'btn btn-outline-light';
            selectBtn.type = 'button';
            selectBtn.textContent = 'Kiválasztás';
            selectBtn.value = data.plans[i].id;
            selectBtn.addEventListener('click', ()=>{
                if(activePlan === Number(selectBtn.value)){
                    updateActive(null);
                }else{
                    updateActive(Number(selectBtn.value));
                }
                resetFilters();
            })

            const collapseDiv = document.createElement('div');
            collapseDiv.className = 'detailCard collapse mt-3 card p-3';
            collapseDiv.id = `workout-details-${data.plans[i].id}`;

            buttonContainer.appendChild(detailsBtn);
            buttonContainer.appendChild(selectBtn);

            card.appendChild(title);
            card.appendChild(day);
            card.appendChild(buttonContainer);
            card.appendChild(collapseDiv);

            if(activePlan == data.plans[i].id){
                selectBtn.classList.remove('btn-outline-light');
                selectBtn.classList.add('btn-outline-warning');
                selectBtn.textContent = 'Visszavonás';
                card.id = 'selectedPlan';
                selectedDivItems.innerHTML = '';
                selectedDivItems.appendChild(card);
                if(data.plans.length == 1){
                    workoutDiv.innerHTML = '<p class="text-center w-100">Nincs további edzésterved.</p>';
                    workoutDiv.style.overflowX = 'hidden';
                }
            }else{
                workoutDiv.appendChild(card);
            }
        }
        
    } catch (error) {
        console.error(error.message + '\n' + error.error);
    }
}
function renderRecWorkouts(plans){
    const workoutDiv = document.getElementById('recommended-items');

    workoutDiv.innerHTML = '';

    if(plans.length === 0){
        workoutDiv.style.overflowX = 'hidden';
        workoutDiv.innerHTML = '<p class="text-center w-100">Nincs találat.</p>';
        return;
    }

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
        detailsBtn.addEventListener('click', async () => {
            const detailDiv = document.getElementById(`workout-details-${plans[i].id}`);

            if (!detailDiv.dataset.loaded) {
                detailDiv.innerHTML = '<div class="text-center py-3">Betöltés...</div>';

                setTimeout(async () => {
                    await loadRecWorkoutDetail(plans[i].id);
                    detailDiv.dataset.loaded = 'true';
                }, 150);
            }
        });

        const selectBtn = document.createElement('button');
        selectBtn.className = 'btn btn-outline-light';
        selectBtn.type = 'button';
        selectBtn.textContent = 'Kiválasztás';
        selectBtn.value = plans[i].id;
        selectBtn.addEventListener('click', ()=>{
            if(activePlan === Number(selectBtn.value)){
                updateActive(null);
            }else{
                updateActive(Number(selectBtn.value));
            }
            resetFilters();
        })

        const collapseDiv = document.createElement('div');
        collapseDiv.className = 'detailCard collapse mt-3 card p-3';
        collapseDiv.id = `workout-details-${plans[i].id}`;

        buttonContainer.appendChild(detailsBtn);
        buttonContainer.appendChild(selectBtn);

        card.appendChild(title);
        card.appendChild(day);
        card.appendChild(buttonContainer);
        card.appendChild(collapseDiv);

        if(activePlan == plans[i].id){
            selectBtn.classList.remove('btn-outline-light');
            selectBtn.classList.add('btn-outline-warning');
            selectBtn.textContent = 'Visszavonás';
            card.id = 'selectedPlan';
            selectedDivItems.innerHTML = '';
            selectedDivItems.appendChild(card);
            if(plans.length == 1){
                workoutDiv.innerHTML = '<p class="text-center w-100">Nincs további edzésterved.</p>';
                workoutDiv.style.overflowX = 'hidden';
            }
        }else{
            workoutDiv.appendChild(card);
        }
    }
}
async function loadRecWorkouts() {
    try {
        const data = await getFetch('http://127.0.0.1:3000/api/workout/default-plans');

        recommendedPlans = data.plans;

        if(recommendedPlans.length === 0){
            return;
        }
        await setRecommendedFiltersFromUserPreferences();

    } catch (error) {
        console.error(error.message + '\n' + error.error);
    }
}
async function setRecommendedFiltersFromUserPreferences(){
    try {
        const pref = await getFetch('http://127.0.0.1:3000/api/workout/user-preferences');

        console.log(pref)

        filters.level = levelConv(pref.level) || 'all';
        filters.location = locationConv(pref.location) || 'all';
        filters.goal = goalConv(pref.goal) || 'all';

        level.value = filters.level;
        wLocation.value = filters.location;
        goal.value = filters.goal;

        filterPlans();
    } catch (error) {
        console.error(error.message);
        renderRecWorkouts(recommendedPlans);
    }
}
function levelConv(level){
    switch(level){
        case 'kezdő (0-6 hónap)':
            return 'kezdo';
        case 'középhaladó (6-24 hónap)':
            return 'kozep';
        case 'haladó (2+ év)':
            return 'halado';
        default:
            return 'all';
    }
}
function locationConv(location){
    switch(location){
        case 'konditeremben':
            return 'gym';
        case 'otthon, súlyzókkal':
            return 'home_weights';
        case 'otthon, saját testsúllyal':
            return 'home_bodyweight';
        default:
            return 'all';
    }
}
function goalConv(goal){
    switch(goal){
        case 'tömegnövelés':
            return 'tomeg';
        case 'szálkásítás':
            return 'szalkasitas';
        case 'szintentartás':
            return 'szintentartas';
        default:
            return 'all';
    }
}
async function loadWorkoutDetail(id) {
    try {
        const detailDiv = document.getElementById(`workout-details-${id}`);
        detailDiv.innerHTML = '';

        const data = await getFetch('http://127.0.0.1:3000/api/workout/my-plan/' + id);
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
            const confirmDelete = confirm('Biztosan törölni szeretnéd ezt az edzéstervet?');

            if(!confirmDelete){
                return;
            }
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

        const data = await getFetch('http://127.0.0.1:3000/api/workout/default-plan/' + id);
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
    const data = await getFetch('http://127.0.0.1:3000/api/workout/my-plan/' + id);

    await loadExercises();

    mode = 'edit';
    planEditId = id;
    workoutPlan = data.details;

    for(let i = 0; i < workoutPlan.days.length; i++){
        workoutPlan.days[i].restDay = Boolean(workoutPlan.days[i].restDay);

        if(workoutPlan.days[i].restDay === true){
            workoutPlan.days[i].exercises = [{
                exerciseId: 0,
                name: 'REST DAY',
                order: null
            }];
        }
    }

    originalWorkoutPlan = JSON.parse(JSON.stringify(workoutPlan));

    document.getElementById('newPlanTitle').innerHTML = workoutPlan.name + ' - szerkesztés';

    plan_name.value = workoutPlan.name;
    plan_days.value = workoutPlan.days_count || workoutPlan.days.length;

    create.classList.add('d-none');
    info.classList.remove('d-none');
    save.classList.remove('d-none');
    cancel.classList.remove('d-none');

    renderWorkoutDayCards();

    document.getElementById('new-plan').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
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