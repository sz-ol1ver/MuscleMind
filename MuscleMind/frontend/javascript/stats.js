import { getFetch } from "./api.js";
//? ---
//? user statisztikak
//? ---
const userGlobal = {
    user_id: null,
    xp: null,
    updated_at: null
};
const userFullStat = {
    user_id: null,
    completed_workouts: null,
    pr_count: null,
    total_reps: null,
    total_sets: null,
    total_volume: null,
    total_workout_time_sec: null,
    updated_at: null
};
const userMetrics = {
    user_id: null,
    bmi: null,
    bmr: null,
    tdee: null,
    goal_calories: null,
    protein_recommended: null,
    calculated_at: null
};
const userMuscleXp = [];
const userDailyStat = [];
const userWeights = [];
const userPrs = [];

const exercises = [];

//? rangok - kep / min. xp
const globalRanks = {
    bronze3: { name: 'Bronze 3', pic: 'bronze-3.png', min: 0 },
    bronze2: { name: 'Bronze 2', pic: 'bronze-2.png', min: 1500 },
    bronze1: { name: 'Bronze 1', pic: 'bronze-1.png', min: 4000 },

    silver3: { name: 'Silver 3', pic: 'silver-3.png', min: 8000 },
    silver2: { name: 'Silver 2', pic: 'silver-2.png', min: 14000 },
    silver1: { name: 'Silver 1', pic: 'silver-1.png', min: 22000 },

    gold3: { name: 'Gold 3', pic: 'gold-3.png', min: 35000 },
    gold2: { name: 'Gold 2', pic: 'gold-2.png', min: 55000 },
    gold1: { name: 'Gold 1', pic: 'gold-1.png', min: 80000 },

    platinum3: { name: 'Platinum 3', pic: 'platinum-3.png', min: 115000 },
    platinum2: { name: 'Platinum 2', pic: 'platinum-2.png', min: 160000 },
    platinum1: { name: 'Platinum 1', pic: 'platinum-1.png', min: 215000 },

    diamond: { name: 'Diamond', pic: 'diamond.png', min: 285000 },
    master: { name: 'Master', pic: 'master.png', min: 370000 },
    champion: { name: 'Champion', pic: 'champion.png', min: 470000 },
    legend: { name: 'Legend', pic: 'legend.png', min: 600000 }
};
const muscleRanks = {
    bronze3: { name: 'Bronze 3', pic: 'bronze-3.png', min: 0 },
    bronze2: { name: 'Bronze 2', pic: 'bronze-2.png', min: 300 },
    bronze1: { name: 'Bronze 1', pic: 'bronze-1.png', min: 800 },

    silver3: { name: 'Silver 3', pic: 'silver-3.png', min: 1600 },
    silver2: { name: 'Silver 2', pic: 'silver-2.png', min: 2800 },
    silver1: { name: 'Silver 1', pic: 'silver-1.png', min: 4400 },

    gold3: { name: 'Gold 3', pic: 'gold-3.png', min: 7000 },
    gold2: { name: 'Gold 2', pic: 'gold-2.png', min: 11000 },
    gold1: { name: 'Gold 1', pic: 'gold-1.png', min: 16000 },

    platinum3: { name: 'Platinum 3', pic: 'platinum-3.png', min: 23000 },
    platinum2: { name: 'Platinum 2', pic: 'platinum-2.png', min: 32000 },
    platinum1: { name: 'Platinum 1', pic: 'platinum-1.png', min: 43000 },

    diamond: { name: 'Diamond', pic: 'diamond.png', min: 57000 },
    master: { name: 'Master', pic: 'master.png', min: 74000 },
    champion: { name: 'Champion', pic: 'champion.png', min: 94000 },
    legend: { name: 'Legend', pic: 'legend.png', min: 120000 }
};

//? weight chart
let nextWeightViewAll = true;
let chartInstance = null;

document.addEventListener('DOMContentLoaded', async()=>{
    await getStats();

    loadSummaryCard();
    loadGlobalRank();
    loadBmiIndicator();
    loadMetrics();
    loadPeriodStats('daily');
    loadMuscleChart();
    loadWeightChart();
    loadMuscleRanks();
    loadPr();

    //? period stats
    const statsPeriodTabs = document.getElementById('stats-period-tabs'); // időszak választó gombok konténere
    const periodButtons = statsPeriodTabs.querySelectorAll('.period-tab');
    for (let button of periodButtons) {
        button.addEventListener('click', () => {

            // active leszedése
            for (let btn of periodButtons) {
                btn.classList.remove('active');
            }

            // aktuális gomb
            button.classList.add('active');

            const selectedPeriod = button.dataset.period;

            loadPeriodStats(selectedPeriod);
        });
    };
    //? weight chart btn
    document.getElementById('toggle-weight').addEventListener('click', () => {
        nextWeightViewAll = !nextWeightViewAll;

        document.getElementById('toggle-weight').innerText =
            nextWeightViewAll ? 'Összes' : 'Utolsó 10';

        loadWeightChart();
    });
});

async function getStats() {
    try {
        userMuscleXp.length = 0;
        userDailyStat.length = 0;
        userWeights.length = 0;
        exercises.length = 0;
        userPrs.length = 0;
        const data = await getFetch('http://127.0.0.1:3000/api/stats/me');
        //? feltoltesek
        //* global xp
        Object.assign(userGlobal, data.stats.globalXp);
        //* full stat
        Object.assign(userFullStat, data.stats.fullStats);
        //* metrics
        if (data.stats.metrics) {
            Object.assign(userMetrics, data.stats.metrics);
        }
        //* muscle xp
        for(let muscleXp of data.stats.muscleXp){
            userMuscleXp.push(muscleXp);
        };
        //* daily stats
        for(let day of data.stats.last30DaysStats){
            userDailyStat.push(day);
        };
        //* weight
        for(let weight of data.stats.weights){
            userWeights.push(weight);
        };
        //* prs
        for(let pr of data.stats.prs){
            userPrs.push(pr);
        };
        //* exercises
        for(let exercise of data.exercises){
            exercises.push(exercise);
        };
    } catch (error) {
        console.error(error.message)
    }
};
function loadSummaryCard(){
    const globalRank = document.getElementById('summary-global-rank'); // globális rang megjelenítés
    const globalXp = document.getElementById('summary-global-xp'); // globális XP érték
    const completedWorkouts = document.getElementById('summary-completed-workouts'); // teljesített edzések száma
    const totalVolume = document.getElementById('summary-total-volume'); // összes megemelt volumen (kg)
    const totalSets = document.getElementById('summary-total-sets'); // összes sorozat (set)
    const totalReps = document.getElementById('summary-total-reps'); // összes ismétlés (rep)
    const prCount = document.getElementById('summary-pr-count'); // személyes rekordok száma
    const currentWeight = document.getElementById('summary-current-weight'); // aktuális testsúly (kg)

    globalRank.innerText = getUserRank().currentRank.name;
    globalXp.innerText = userGlobal.xp + ' XP';
    completedWorkouts.innerText = userFullStat.completed_workouts;
    totalVolume.innerText = userFullStat.total_volume + ' Kg';
    totalSets.innerText = userFullStat.total_sets;
    totalReps.innerText = userFullStat.total_reps;
    prCount.innerText = userFullStat.pr_count;
    if(userWeights.length > 0){
        currentWeight.innerText = userWeights[userWeights.length-1].weight + ' Kg';
    }else{currentWeight.innerText = '- Kg';}
    
};
function loadGlobalRank(){
    const globalRankImage = document.getElementById('global-rank-image'); // globális rank képe
    const globalRankName = document.getElementById('global-rank-name'); // globális rank neve
    const globalRankXp = document.getElementById('global-rank-xp'); // globális XP érték
    const currentRankLabel = document.getElementById('current-rank-label'); // jelenlegi rank label
    const nextRankLabel = document.getElementById('next-rank-label'); // következő rank label
    const globalRankProgressBar = document.getElementById('global-rank-progress-bar'); // progress bar töltése
    const globalRankProgressText = document.getElementById('global-rank-progress-text'); // progress százalék szöveg

    globalRankImage.src = './images/ranks/' + getUserRank().currentRank.pic;
    globalRankName.innerText = getUserRank().currentRank.name;
    globalRankXp.innerText = userGlobal.xp;
    currentRankLabel.innerText = getUserRank().currentRank.name;
    nextRankLabel.innerText = getUserRank().nextRank.name;
    globalRankProgressBar.style.width = getUserRank().progressPercent+'%';
    globalRankProgressText.innerText = Math.round(getUserRank().progressPercent) +'%';
};
function loadBmiIndicator(){
    const bmiValue = document.getElementById('bmi-value'); // BMI érték (pl. 22.5)
    const bmiCategory = document.getElementById('bmi-category'); // BMI kategória (pl. Normál, Túlsúly)
    const bmiIndicator = document.getElementById('bmi-indicator'); // csúszka pozíció a bar-on
    const bmiDescription = document.getElementById('bmi-description'); // visszajelzés / leírás szöveg

    if (userMetrics.bmi === null) {
        bmiValue.innerText = '-';
        bmiCategory.innerText = 'Nincs adat';
        bmiIndicator.style.left = '0%';
        bmiDescription.innerText = 'Nincs elég adat a BMI kiszámításához.';
        return;
    }

    bmiValue.innerText = userMetrics.bmi;
    bmiCategory.innerText = getBmiCategory(userMetrics.bmi).label;
    bmiCategory.style.color = getBmiCategory(userMetrics.bmi).color;
    bmiIndicator.style.left = getBmiPosition(userMetrics.bmi) + '%';
    bmiDescription.innerText = getBmiDescription(userMetrics.bmi);
};
function loadMetrics(){
    const metricBmi = document.getElementById('metric-bmi'); // BMI érték megjelenítése
    const metricBmr = document.getElementById('metric-bmr'); // BMR (alapanyagcsere kcal)
    const metricTdee = document.getElementById('metric-tdee'); // TDEE (napi kalóriaszükséglet)
    const metricGoalCalories = document.getElementById('metric-goal-calories'); // cél kalóriabevitel
    const metricProtein = document.getElementById('metric-protein'); // ajánlott napi fehérjebevitel (g)

    if (userMetrics.bmi === null) {
        metricBmi.innerText = '-';
        metricBmr.innerText = '- kcal';
        metricTdee.innerText = '- kcal';
        metricGoalCalories.innerText = '- kcal';
        metricProtein.innerText = '- g';
        return;
    }

    metricBmi.innerText = userMetrics.bmi;
    metricBmr.innerText = userMetrics.bmr + ' kcal';
    metricTdee.innerText = userMetrics.tdee + ' kcal';
    metricGoalCalories.innerText = userMetrics.goal_calories + ' kcal';
    metricProtein.innerText = userMetrics.protein_recommended + ' g';
};
function loadPeriodStats(period){
    const periodTitle = document.getElementById('period-title'); // kiválasztott időszak címe

    const periodCompletedWorkouts = document.getElementById('period-completed-workouts'); // időszak alatt teljesített edzések száma
    const periodTotalVolume = document.getElementById('period-total-volume'); // időszak alatti összes volumen
    const periodTotalSets = document.getElementById('period-total-sets'); // időszak alatti összes set
    const periodTotalReps = document.getElementById('period-total-reps'); // időszak alatti összes ismétlés

    const periodXpGained = document.getElementById('period-xp-gained'); // időszak alatt szerzett XP
    const periodPrCount = document.getElementById('period-pr-count'); // időszak alatti PR-ok száma

    const periodTotalWorkoutTime = document.getElementById('period-total-workout-time'); // időszak alatti összes edzésidő
    const periodAvgTime = document.getElementById('period-avg-time'); // időszak alatti átlag edzésidő

    const totals = {
        completedWorkouts: 0,
        totalVolume: 0,
        totalSets: 0,
        totalReps: 0,
        xpGained: 0,
        prCount: 0,
        totalWorkoutTimeSec: 0
    };

    let daysToCount = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < userDailyStat.length; i++) {
        const stat = userDailyStat[i];

        const statDate = new Date(stat.stat_date);
        statDate.setHours(0, 0, 0, 0);

        const diffDays = (today - statDate) / 86400000;

        if (
            (period === 'daily' && diffDays === 0) ||
            (period === 'weekly' && diffDays >= 0 && diffDays < 7) ||
            (period === 'monthly' && diffDays >= 0 && diffDays < 30) ||
            (period === 'all-time' && diffDays >= 0)
        ) {
            daysToCount.push(stat);
        }
    }

    for (let day of daysToCount) {
        console.log(day);
        totals.completedWorkouts += Number(day.completed_workouts || 0);
        totals.totalVolume += Number(day.total_volume || 0);
        totals.totalSets += Number(day.total_sets || 0);
        totals.totalReps += Number(day.total_reps || 0);
        totals.xpGained += Number(day.xp_gained || 0);
        totals.prCount += Number(day.prs_achieved || 0);
        totals.totalWorkoutTimeSec += Number(day.total_workout_time_sec || 0);
    }

    const avgWorkoutTimeSec = totals.completedWorkouts > 0
        ? totals.totalWorkoutTimeSec / totals.completedWorkouts
        : 0;

    periodCompletedWorkouts.innerText = totals.completedWorkouts;
    periodTotalVolume.innerText = totals.totalVolume + ' kg';
    periodTotalSets.innerText = totals.totalSets;
    periodTotalReps.innerText = totals.totalReps;
    periodXpGained.innerText = totals.xpGained + ' XP';
    periodPrCount.innerText = totals.prCount;
    periodTotalWorkoutTime.innerText = Math.round(totals.totalWorkoutTimeSec / 60) + ' perc';
    periodAvgTime.innerText = Math.round(avgWorkoutTimeSec / 60) + ' perc';
};
function loadMuscleChart(){
    const muscleXpChart = document.getElementById('muscle-xp-chart'); // izomcsoport XP grafikon canvas
    const grouped = getGroupedMuscleData();

    const labels = Object.keys(grouped);
    const data = Object.values(grouped);

    const max = Math.max(...data)*1.2;


    new Chart(muscleXpChart, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Izomcsoport XP',
                data: data,
                borderWidth: 2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: false
                }
            },

            scales: {
                r: {
                    beginAtZero: true,
                    suggestedMax: max,

                    ticks: {
                        display: false
                    },

                    grid: {
                        color: 'rgba(155, 155, 155, 0.4)', 
                        lineWidth: 1
                    },

                    angleLines: {
                        color: 'rgb(193, 123, 255)'
                    },
                    pointLabels: {
                        font: {
                            size: 16
                        },
                        color: 'rgb(215, 150, 255)'
                    }
                }
            }
        }
    });
};
function loadWeightChart(){
    if(userWeights.length === 0){
        return;
    }
    const weightChart = document.getElementById('weight-chart'); // súlyváltozás grafikon canvas
    const weightStart = document.getElementById('weight-start'); // kezdő testsúly megjelenítése
    const weightCurrent = document.getElementById('weight-current'); // aktuális testsúly megjelenítése
    const weightChange = document.getElementById('weight-change'); // súlyváltozás (különbség) megjelenítése

    const dateLabels = [];
    const weights = [];

    let dataToUse = nextWeightViewAll ? userWeights.slice(-10) : userWeights;

    for (let item of dataToUse) {
        dateLabels.push(formatDate(item.created_at));
        weights.push(Number(item.weight));
    }

    if (weights.length > 0) {
        const start = weights[0];
        const current = weights[weights.length - 1];
        const change = current - start;

        weightStart.innerText = start + ' kg';
        weightCurrent.innerText = current + ' kg';
        weightChange.innerText = (change >= 0 ? '+' : '') + change.toFixed(1) + ' kg';
    }

    // ha már létezik chart → destroy
    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(weightChart, {
        type: 'line',
        data: {
            labels: dateLabels,
            datasets: [{
                label: 'Testsúly',
                data: weights,

                borderColor: '#a87cf5',
                backgroundColor: 'rgba(168, 124, 245, 0.18)',
                pointBackgroundColor: '#d7a0ff',
                pointBorderColor: '#ffffff',

                borderWidth: 3,
                pointRadius: weights.length > 20 ? 0 : 4,
                pointHoverRadius: 6,

                tension: 0.35,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#151522',
                    titleColor: '#ffffff',
                    bodyColor: '#d7a0ff',
                    borderColor: '#7c3aed',
                    borderWidth: 1
                }
            },

            scales: {
                x: {
                    ticks: {
                        color: '#b8b8d4',
                        maxRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: 6
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.06)'
                    }
                },
                y: {
                    beginAtZero: false,
                    ticks: {
                        color: '#b8b8d4'
                    },
                    grid: {
                        color: 'rgba(168,124,245,0.12)'
                    }
                }
            }
        }
    });
};
function loadMuscleRanks(){
    const selectedMuscleTitle = document.getElementById('selected-muscle-title'); // kiválasztott izomcsoport neve (cím)

    const muscleSelector = document.getElementById('muscle-selector'); // izomcsoport választó dropdown

    const selectedMuscleRankImage = document.getElementById('selected-muscle-rank-image'); // kiválasztott izomcsoport rang képe

    const selectedMuscleRankName = document.getElementById('selected-muscle-rank-name'); // kiválasztott izom rang neve
    const selectedMuscleXp = document.getElementById('selected-muscle-xp'); // kiválasztott izom XP értéke

    const selectedMuscleCurrentRank = document.getElementById('selected-muscle-current-rank'); // jelenlegi rang szöveg
    const selectedMuscleNextRank = document.getElementById('selected-muscle-next-rank'); // következő rang szöveg

    const selectedMuscleProgressBar = document.getElementById('selected-muscle-progress-bar'); // progress bar kitöltése
    const selectedMuscleProgressText = document.getElementById('selected-muscle-progress-text'); // progress százalék szöveg

    for(let muscle of userMuscleXp){
        const option = document.createElement('option');
        option.innerText = formatMuscleGroup(muscle.muscle_group);
        option.value = muscle.muscle_group;
        muscleSelector.appendChild(option);
    }

    muscleSelector.addEventListener('change', ()=>{
        const muscleG = muscleSelector.value;
        let data = null;

        for(let muscles of userMuscleXp){
            if(muscles.muscle_group === muscleG){
                data = muscles;
                break;
            }
        }

        selectedMuscleTitle.innerText = formatMuscleGroup(data.muscle_group);
        selectedMuscleRankName.innerText = getMuscleRank(data).currentRank.name;
        selectedMuscleRankImage.src = './images/ranks/' + getMuscleRank(data).currentRank.pic;
        selectedMuscleXp.innerText = data.xp;
        selectedMuscleCurrentRank.innerText = getMuscleRank(data).currentRank.name;
        selectedMuscleNextRank.innerText = getMuscleRank(data).nextRank.name;
        selectedMuscleProgressBar.style.width = getMuscleRank(data).progressPercent+ '%';
        selectedMuscleProgressText.innerText = Math.round(getMuscleRank(data).progressPercent)+ '%';
    })

};
function loadPr(){
    const selectedExerciseTitle = document.getElementById('selected-exercise-title'); // kiválasztott gyakorlat neve (cím)
    const exerciseSelector = document.getElementById('exercise-selector'); // select dropdown (gyakorlat választó)

    const maxWeight = document.getElementById('exercise-pr-max-weight'); // max súly (kg)
    const maxWeightReps = document.getElementById('exercise-pr-max-weight-reps'); // ismétlésszám a max súlyhoz
    const bestVolume = document.getElementById('exercise-pr-best-volume'); // legjobb volumen
    const achievedDate = document.getElementById('exercise-pr-achieved-date'); // PR dátuma

    const emptyState = document.getElementById('exercise-pr-empty'); // nincs adat üzenet

    for(let exerciseOpt of userPrs){
        const option = document.createElement('option');
        option.innerText = exerciseOpt.exercise_name;
        option.value = exerciseOpt.exercise_id;
        exerciseSelector.appendChild(option);
    }

    exerciseSelector.addEventListener('change', ()=>{
        const exerciseId = exerciseSelector.value;
        let data = null;

        for(let exerciseOpt of userPrs){
            if(exerciseOpt.exercise_id == exerciseId){
                data = exerciseOpt;
                break;
            }
        }

        if (!data) {
            selectedExerciseTitle.innerText = 'Gyakorlat';
            maxWeight.innerText = '- kg';
            maxWeightReps.innerText = '-';
            bestVolume.innerText = '- kg';
            achievedDate.innerText = '-';
            emptyState.classList.remove('d-none');
            return;
        }
        
        emptyState.classList.add('d-none');

        selectedExerciseTitle.innerText = data.exercise_name;
        maxWeight.innerText = data.max_weight + ' Kg';
        maxWeightReps.innerText = data.max_weight_reps;
        bestVolume.innerText = data.best_volume + ' Kg';
        achievedDate.innerText = formatDate(data.achieved_at);
    })
}

//? helper functions
function getUserRank() {
    const xp = userGlobal.xp || 0;

    const rankEntries = Object.entries(globalRanks);

    let currentRank = null;
    let nextRank = null;

    for (let i = 0; i < rankEntries.length; i++) {
        const rankData = rankEntries[i][1];

        if (xp >= rankData.min) {
            currentRank = {
                name: rankData.name,
                pic: rankData.pic,
                min: rankData.min
            };

            if (i + 1 < rankEntries.length) {
                nextRank = {
                    name: rankEntries[i + 1][1].name,
                    pic: rankEntries[i + 1][1].pic,
                    min: rankEntries[i + 1][1].min
                };
            }else{
                nextRank = {
                    name: 'Max'
                };
            }
        } else {
            break;
        }
    }

    let xpToNext = 0;
    let progressPercent = 100;

    if (nextRank && nextRank.min !== undefined) {
        const xpNeeded = nextRank.min - currentRank.min;
        const xpProgress = xp - currentRank.min;

        xpToNext = nextRank.min - xp;
        progressPercent = (xpProgress / xpNeeded) * 100;

        if (progressPercent > 100) progressPercent = 100;
        if (progressPercent < 0) progressPercent = 0;
    }else{
        xpToNext = 0;
        progressPercent = 100;
    }

    return {
        currentRank,
        nextRank,
        xpToNext,
        progressPercent
    };
}
function getMuscleRank(muscleData) {
    const xp = muscleData.xp || 0;

    const rankEntries = Object.entries(muscleRanks);

    let currentRank = null;
    let nextRank = null;

    for (let i = 0; i < rankEntries.length; i++) {
        const rankData = rankEntries[i][1];

        if (xp >= rankData.min) {
            currentRank = {
                name: rankData.name,
                pic: rankData.pic,
                min: rankData.min
            };

            if (i + 1 < rankEntries.length) {
                nextRank = {
                    name: rankEntries[i + 1][1].name,
                    pic: rankEntries[i + 1][1].pic,
                    min: rankEntries[i + 1][1].min
                };
            }else{
                nextRank = {
                    name: 'Max'
                };
            }
        } else {
            break;
        }
    }

    let xpToNext = 0;
    let progressPercent = 100;

    if (nextRank && nextRank.min !== undefined) {
        const xpNeeded = nextRank.min - currentRank.min;
        const xpProgress = xp - currentRank.min;

        xpToNext = nextRank.min - xp;
        progressPercent = (xpProgress / xpNeeded) * 100;

        if (progressPercent > 100) progressPercent = 100;
        if (progressPercent < 0) progressPercent = 0;
    }else{
        xpToNext = 0;
        progressPercent = 100;
    }

    return {
        muscleGroup: muscleData.muscle_group,
        xp,
        currentRank,
        nextRank,
        xpToNext,
        progressPercent
    };
}
function getBmiCategory(bmi) {
    if (bmi < 18.5) {
        return {
            label: 'Sovány',
            color: 'blue'
        };
    } else if (bmi < 25) {
        return {
            label: 'Normál',
            color: 'green'
        };
    } else if (bmi < 30) {
        return {
            label: 'Túlsúly',
            color: 'orange'
        };
    } else {
        return {
            label: 'Elhízás',
            color: 'red'
        };
    }
}
function getBmiPosition(bmi) {
    //? 4 tartomany 0-25% / 25-50% / 50-75% / 75-100%
    if (bmi < 18.5) {
        return (bmi / 18.5) * 25;
    } else if (bmi < 25) {
        return 25 + ((bmi - 18.5) / (25 - 18.5)) * 25;
    } else if (bmi < 30) {
        return 50 + ((bmi - 25) / (30 - 25)) * 25;
    } else {
        return 75 + Math.min(((bmi - 30) / 10) * 25, 25);
    }
}
function getBmiDescription(bmi) {
    if (bmi < 18.5) {
        if (bmi < 16) {
            return 'Jelentősen alacsony testsúly. Érdemes mielőbb növelni a kalóriabevitelt és szakemberhez fordulni.';
        } else if (bmi < 17.5) {
            return 'Alacsony testsúly. Az izomtömeg növelése és több kalória bevitele ajánlott.';
        } else {
            return 'Kicsivel a normál alatt vagy. Egy enyhe tömegnövelés segíthet az optimális tartomány elérésében.';
        }
    } 
    
    else if (bmi < 25) {
        if (bmi < 20) {
            return 'Normál tartományban vagy, de az alsó részén. Izomtömeg növelés még javíthat az összképen.';
        } else if (bmi < 23) {
            return 'Ideális tartományban vagy. Ez egy nagyon jó állapot, tartsd ezt a szintet.';
        } else {
            return 'Még normál tartomány, de közelítesz a túlsúly felé. Érdemes figyelni a kalóriákra.';
        }
    } 
    
    else if (bmi < 30) {
        if (bmi < 27) {
            return 'Enyhe túlsúly. Egy kis zsírvesztéssel könnyen visszatérhetsz a normál tartományba.';
        } else if (bmi < 29) {
            return 'Túlsúlyos tartomány közepe. Érdemes már tudatosabban figyelni az étrendre és aktivitásra.';
        } else {
            return 'Közel az elhízás határához. Itt már erősen ajánlott a zsírcsökkentés.';
        }
    } 
    
    else {
        if (bmi < 35) {
            return 'Elhízás kezdete. Célszerű életmódváltásba kezdeni és csökkenteni a testzsírt.';
        } else if (bmi < 40) {
            return 'Magas elhízás szint. Érdemes komolyabban foglalkozni a testsúly csökkentésével.';
        } else {
            return 'Extrém elhízás. Erősen ajánlott szakember segítségét kérni.';
        }
    }
}
function getGroupedMuscleData() {
    const muscleGroups = {
        'Mell': ['mell'],
        'Hát': ['hát', 'alsó_hát'],
        'Váll': ['váll'],
        'Kar': ['bicepsz', 'tricepsz', 'alkar'],
        'Has': ['has', 'ferde_has'],
        'Láb': ['comb_első', 'comb_hátsó', 'farizom', 'vádli'],
        'Teljes test': ['teljes_test']
    };
    const result = {};

    for (let group in muscleGroups) {
        result[group] = 0;
    }

    let fullBodyXp = 0;

    for (let muscle of userMuscleXp) {
        if (muscle.muscle_group === 'teljes_test') {
            fullBodyXp += Number(muscle.xp || 0);
            continue;
        }

        for (let group in muscleGroups) {
            if (muscleGroups[group].includes(muscle.muscle_group)) {
                result[group] += Number(muscle.xp || 0);
            }
        }
    }

    for (let group in result) {
        result[group] += fullBodyXp;
    }

    return result;
}
function formatMuscleGroup(muscle) {
    switch (muscle) {
        case 'mell': return 'Mell';
        case 'hát': return 'Hát';
        case 'váll': return 'Váll';
        case 'bicepsz': return 'Bicepsz';
        case 'tricepsz': return 'Tricepsz';
        case 'alkar': return 'Alkar';
        case 'has': return 'Has';
        case 'ferde_has': return 'Ferde has';
        case 'alsó_hát': return 'Alsó hát';
        case 'comb_első': return 'Comb elülső';
        case 'comb_hátsó': return 'Comb hátsó';
        case 'farizom': return 'Farizom';
        case 'vádli': return 'Vádli';
        case 'teljes_test': return 'Teljes test';
        default: return muscle;
    }
}
function formatDate(dateString) {
    const date = new Date(dateString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hour}:${minute}`;
}