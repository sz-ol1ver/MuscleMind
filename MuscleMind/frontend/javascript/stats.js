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

document.addEventListener('DOMContentLoaded', async()=>{
    await getStats();
    
    loadSummaryCard();
    loadGlobalRank();
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
        Object.assign(userMetrics, data.stats.metrics);
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
    currentWeight.innerText = userWeights[userWeights.length-1].weight + ' Kg';
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
}

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
            }
        } else {
            break;
        }
    }

    let xpToNext = 0;
    let progressPercent = 100;

    if (nextRank) {
        const xpNeeded = nextRank.min - currentRank.min;
        const xpProgress = xp - currentRank.min;

        xpToNext = nextRank.min - xp;

        progressPercent = (xpProgress / xpNeeded) * 100;

        // biztonság
        if (progressPercent > 100) progressPercent = 100;
        if (progressPercent < 0) progressPercent = 0;
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
            }
        } else {
            break;
        }
    }

    let xpToNext = 0;
    let progressPercent = 100;

    if (nextRank && currentRank) {
        const xpNeeded = nextRank.min - currentRank.min;
        const xpProgress = xp - currentRank.min;

        xpToNext = nextRank.min - xp;

        progressPercent = (xpProgress / xpNeeded) * 100;

        if (progressPercent > 100) progressPercent = 100;
        if (progressPercent < 0) progressPercent = 0;
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