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
    loadBmiIndicator();
    loadMetrics();

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
    }
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
};
function loadBmiIndicator(){
    const bmiValue = document.getElementById('bmi-value'); // BMI érték (pl. 22.5)
    const bmiCategory = document.getElementById('bmi-category'); // BMI kategória (pl. Normál, Túlsúly)
    const bmiIndicator = document.getElementById('bmi-indicator'); // csúszka pozíció a bar-on
    const bmiDescription = document.getElementById('bmi-description'); // visszajelzés / leírás szöveg

    bmiValue.innerText = userMetrics.bmi;
    bmiCategory.innerText = getBmiCategory(userMetrics.bmi).label;
    bmiCategory.style.color = getBmiCategory(userMetrics.bmi).color;
    bmiIndicator.style.left = getBmiPosition(userMetrics.bmi) + '%';
    bmiDescription.innerText = getBmiDescription(userMetrics.bmi);
}
function loadMetrics(){
    const metricBmi = document.getElementById('metric-bmi'); // BMI érték megjelenítése
    const metricBmr = document.getElementById('metric-bmr'); // BMR (alapanyagcsere kcal)
    const metricTdee = document.getElementById('metric-tdee'); // TDEE (napi kalóriaszükséglet)
    const metricGoalCalories = document.getElementById('metric-goal-calories'); // cél kalóriabevitel
    const metricProtein = document.getElementById('metric-protein'); // ajánlott napi fehérjebevitel (g)

    metricBmi.innerText = userMetrics.bmi;
    metricBmr.innerText = userMetrics.bmr + ' kcal';
    metricTdee.innerText = userMetrics.tdee + ' kcal';
    metricGoalCalories.innerText = userMetrics.goal_calories + ' kcal';
    metricProtein.innerText = userMetrics.protein_recommended + ' g';
}
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