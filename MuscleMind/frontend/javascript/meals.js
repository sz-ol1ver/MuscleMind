import { getFetch, postRequest, deleteFetch, postForm } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.style.display = 'flex';

    let allFoods = [];
    let userPreferences = null;
    let userId = null;

    try {
        const response = await getFetch('/api/meals/data');
        if (response) {
            const data = response;
            
            // profil adatok lekerese a userid miatt
            const profileRes = await getFetch('/api/profile');
            if (profileRes) {
                const profileData = profileRes;
                userId = profileData.basic.id;
            }

            renderMetrics(data.metrics, data.preferences);
            userPreferences = data.preferences;
            allFoods = data.foods;

            setFiltersFromPreferences(userPreferences);
            renderAllSections();
        }
    } catch (error) {
        console.error('Hiba az ételek betöltésekor:', error);
    } finally {
        loadingOverlay.style.display = 'none';
    }

    setupEventListeners();

    function renderMetrics(metrics, prefs) {
        const container = document.getElementById('metrics-container');
        if (!metrics || !prefs) {
            return;
        }
        
        container.innerHTML = '';

        const createMetricCard = (titleText, valueText, subText, titleColorClass) => {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'metric-card p-3 rounded text-center flex-grow-1';
            cardDiv.style.backgroundColor = 'var(--secondary-color)';

            const titleDiv = document.createElement('div');
            titleDiv.className = `${titleColorClass} fw-bold`;
            titleDiv.textContent = titleText;

            const valueDiv = document.createElement('div');
            // itt nagyobb a betu meret cel es etkezes eseten
            if (titleText === '🎯 Célod' || titleText === '🍽️ Napi étkezések') {
                valueDiv.className = 'fs-5 fw-bold text-light text-capitalize mt-2';
            } else {
                valueDiv.className = 'fs-4 fw-bold text-light';
            }
            valueDiv.textContent = valueText;

            cardDiv.appendChild(titleDiv);
            cardDiv.appendChild(valueDiv);

            if (subText) {
                const subDiv = document.createElement('div');
                if (titleText === 'BMI') {
                    subDiv.className = 'text-success';
                } else {
                    subDiv.className = 'text-muted';
                }
                subDiv.style.fontSize = '0.8rem';
                subDiv.textContent = subText;
                cardDiv.appendChild(subDiv);
            }

            return cardDiv;
        };

        container.appendChild(createMetricCard('BMI', metrics.bmi, 'Normál', 'text-success'));
        container.appendChild(createMetricCard('🔥 BMR', metrics.bmr, 'kcal / nap', 'text-warning'));
        container.appendChild(createMetricCard('💧 TDEE', metrics.tdee, 'kcal / nap', 'text-info'));
        container.appendChild(createMetricCard('⏳ Calorie goal', metrics.goal_calories, 'kcal / nap', 'text-warning'));
        container.appendChild(createMetricCard('🥩 Protein goal', metrics.protein_recommended, 'g / nap', 'text-secondary'));
        container.appendChild(createMetricCard('🎯 Célod', prefs.goal || '-', null, 'text-primary'));
        container.appendChild(createMetricCard('🍽️ Napi étkezések', prefs.meals_per_day || '-', null, 'text-info'));
    }

    function setFiltersFromPreferences(prefs) {
        if (!prefs) {
            return;
        }
        
        let goalMap = {
            'tömegnövelés': 'tomegnoveles',
            'szálkásítás': 'szalkasitas',
            'szintentartás': 'szintentartas'
        };

        let dietMap = {
            'mindenevő': 'mindenevo',
            'vegetáriánus': 'vegetarianus',
            'vegán': 'vegan'
        };

        if (prefs.goal && goalMap[prefs.goal]) {
            document.getElementById('filter-goal').value = goalMap[prefs.goal];
        }
        if (prefs.diet_type && dietMap[prefs.diet_type]) {
            document.getElementById('filter-diet').value = dietMap[prefs.diet_type];
        }
    }

    function setupEventListeners() {
        document.getElementById('btn-apply-filters').addEventListener('click', renderAllSections);
        document.getElementById('btn-reset-filters').addEventListener('click', () => {
            document.getElementById('search-input').value = '';
            document.getElementById('filter-category').value = 'all';
            document.getElementById('filter-goal').value = 'all';
            document.getElementById('filter-diet').value = 'all';
            document.getElementById('filter-difficulty').value = 'all';
            document.getElementById('filter-time').value = 'all';
            document.getElementById('filter-high-protein').checked = false;
            document.getElementById('filter-low-carb').checked = false;
            
            document.getElementById('filter-calories').value = 2000;
            document.getElementById('filter-protein').value = 150;
            document.getElementById('filter-carbs').value = 200;
            document.getElementById('filter-fat').value = 100;
            
            updateSliderLabels();
            setFiltersFromPreferences(userPreferences);
            renderAllSections();
        });

        const sliders = ['calories', 'protein', 'carbs', 'fat'];
        sliders.forEach(s => {
            document.getElementById(`filter-${s}`).addEventListener('input', updateSliderLabels);
        });

        document.getElementById('food-create-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            loadingOverlay.style.display = 'flex';
            const formData = new FormData(e.target);
            try {
                const res = await postForm('/api/meals/new', formData);
                if (res) {
                    alert('Sikeres létrehozás!');
                    location.reload();
                }
            } catch(e) {
                alert(e.message || 'Szerver hiba');
            } finally {
                loadingOverlay.style.display = 'none';
            }
        });
    }

    function updateSliderLabels() {
        document.getElementById('val-calories').textContent = '0-' + document.getElementById('filter-calories').value + '+';
        document.getElementById('val-protein').textContent = '0-' + document.getElementById('filter-protein').value + '+';
        document.getElementById('val-carbs').textContent = '0-' + document.getElementById('filter-carbs').value + '+';
        document.getElementById('val-fat').textContent = '0-' + document.getElementById('filter-fat').value + '+';
    }

    function applyFiltersToFoods(foodsToFilter) {
        const search = document.getElementById('search-input').value.toLowerCase();
        const category = document.getElementById('filter-category').value;
        const goal = document.getElementById('filter-goal').value;
        const diet = document.getElementById('filter-diet').value;
        const difficulty = document.getElementById('filter-difficulty').value;
        const time = document.getElementById('filter-time').value;
        
        // checkboxok
        const hp = document.getElementById('filter-high-protein').checked;
        const lc = document.getElementById('filter-low-carb').checked;

        // csuszkak erteke
        const maxCal = parseInt(document.getElementById('filter-calories').value);
        const maxPro = parseInt(document.getElementById('filter-protein').value);
        const maxCar = parseInt(document.getElementById('filter-carbs').value);
        const maxFat = parseInt(document.getElementById('filter-fat').value);

        return foodsToFilter.filter(food => {
            if (search && !food.name.toLowerCase().includes(search)) {
                return false;
            }
            if (category !== 'all' && food.category !== category) {
                return false;
            }
            // mind is megfelel cel es diet eseten
            if (goal !== 'all' && food.goal_tag !== 'mind' && food.goal_tag !== goal) {
                return false;
            }
            // dieta ellenorzes (vegan eseten mindenevo kizarva)
            if (diet !== 'all' && food.diet_tag !== diet && food.diet_tag !== 'mindenevo') {
                if (diet === 'vegan' && food.diet_tag !== 'vegan') {
                    return false;
                }
                if (diet === 'vegetarianus' && food.diet_tag === 'mindenevo') {
                    return false;
                }
            }
            if (difficulty !== 'all' && food.difficulty !== difficulty) {
                return false;
            }
            if (time !== 'all' && food.prep_time_min > parseInt(time)) {
                return false;
            }

            if (hp && !food.high_protein) {
                return false;
            }
            if (lc && !food.low_carb) {
                return false;
            }

            if (food.calories_kcal > maxCal && maxCal < 2000) {
                return false;
            }
            if (food.protein_g > maxPro && maxPro < 150) {
                return false;
            }
            if (food.carbs_g > maxCar && maxCar < 200) {
                return false;
            }
            if (food.fat_g > maxFat && maxFat < 100) {
                return false;
            }

            return true;
        });
    }

    function renderAllSections() {
        // szuresek alkalmazasa
        const filteredFoods = applyFiltersToFoods(allFoods);

        const myFoods = filteredFoods.filter(f => f.created_by === userId);
        const approvedFoods = filteredFoods.filter(f => f.is_approved === 1);
        
        // ajanlott receptek cel alapjan
        let goalMap = {'tömegnövelés': 'tomegnoveles', 'szálkásítás': 'szalkasitas', 'szintentartás': 'szintentartas'};
        let myGoal = userPreferences ? goalMap[userPreferences.goal] : 'all';
        const recommendedFoods = approvedFoods.filter(f => myGoal === 'all' || f.goal_tag === myGoal || f.goal_tag === 'mind');

        renderCards('recommended-container', recommendedFoods, false);
        renderCards('community-container', approvedFoods, false);
        renderCards('my-recipes-container', myFoods, true);
    }

    async function deleteFoodAction(id) {
        if (!confirm('Biztosan törlöd ezt a receptet?')) {
            return;
        }
        const loadingOverlay = document.getElementById('loading-overlay');
        loadingOverlay.style.display = 'flex';
        try {
            const res = await deleteFetch('/api/meals/delete/' + id);
            if (res) {
                location.reload();
            }
        } catch(e) {
            alert(e.message || 'Szerver hiba');
        } finally {
            loadingOverlay.style.display = 'none';
        }
    }

    async function shareFoodAction(id, name) {
        if (!confirm('Szeretnéd megosztani a receptet a közösséggel? Az admin fogja jóváhagyni.')) {
            return;
        }
        const loadingOverlay = document.getElementById('loading-overlay');
        loadingOverlay.style.display = 'flex';
        try {
            const res = await postRequest('/api/meals/share/' + id, { foodName: name });
            if (res) {
                alert('Sikeresen beküldve jóváhagyásra!');
                location.reload();
            }
        } catch(e) {
            alert(e.message || 'Szerver hiba');
        } finally {
            loadingOverlay.style.display = 'none';
        }
    }

    function renderCards(containerId, foods, isMine) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        if (foods.length === 0) {
            const emptyP = document.createElement('p');
            emptyP.className = 'text-muted';
            emptyP.style.gridColumn = '1 / -1';
            emptyP.textContent = 'Nincs megjeleníthető recept.';
            container.appendChild(emptyP);
            return;
        }

        foods.forEach(food => {
            const card = document.createElement('div');
            card.className = 'recipe-card';

            const cardBody = document.createElement('div');
            cardBody.className = 'card-body';

            if (isMine) {
                const statusSpan = document.createElement('span');
                if (food.is_approved === 1) {
                    statusSpan.className = 'badge bg-success float-end mb-2';
                    statusSpan.textContent = 'Jóváhagyott';
                } else {
                    statusSpan.className = 'badge bg-warning text-dark float-end mb-2';
                    statusSpan.textContent = 'Várakozik / Privát';
                }
                cardBody.appendChild(statusSpan);
            }

            const title = document.createElement('h5');
            title.className = 'recipe-title';
            title.textContent = food.name;
            cardBody.appendChild(title);

            const badgesDiv = document.createElement('div');
            badgesDiv.className = 'macro-badges';

            const createBadge = (className, text) => {
                const span = document.createElement('span');
                span.className = `macro-badge ${className}`;
                span.textContent = text;
                return span;
            };

            badgesDiv.appendChild(createBadge('macro-cal', `🔥 ${food.calories_kcal} kcal`));
            badgesDiv.appendChild(createBadge('macro-pro', `🥩 Pro: ${food.protein_g}g`));
            badgesDiv.appendChild(createBadge('macro-car', `🍞 Car: ${food.carbs_g}g`));
            badgesDiv.appendChild(createBadge('macro-fat', `🥑 Fat: ${food.fat_g}g`));

            cardBody.appendChild(badgesDiv);

            const descP = document.createElement('p');
            descP.className = 'text-light';
            descP.style.fontSize = '0.85rem';
            descP.style.lineHeight = '1.4';
            descP.style.opacity = '0.8';
            if (food.description) {
                descP.textContent = food.description.substring(0, 80) + '...';
            }
            cardBody.appendChild(descP);

            const metaDiv = document.createElement('div');
            metaDiv.className = 'recipe-meta mt-auto';

            const timeSpan = document.createElement('span');
            timeSpan.textContent = `⏱️ ${food.prep_time_min} perc`;
            
            const diffSpan = document.createElement('span');
            diffSpan.className = 'text-capitalize';
            diffSpan.textContent = `📊 ${food.difficulty}`;

            metaDiv.appendChild(timeSpan);
            metaDiv.appendChild(diffSpan);
            cardBody.appendChild(metaDiv);

            if (isMine) {
                const actionDiv = document.createElement('div');
                actionDiv.className = 'recipe-actions mt-3';

                const delBtn = document.createElement('button');
                delBtn.className = 'btn btn-outline-danger flex-grow-1';
                delBtn.textContent = 'Törlés';
                delBtn.addEventListener('click', () => {
                    deleteFoodAction(food.id);
                });
                actionDiv.appendChild(delBtn);

                if (food.is_approved === 0) {
                    const shareBtn = document.createElement('button');
                    shareBtn.className = 'btn btn-outline-info flex-grow-1';
                    shareBtn.textContent = 'Megosztás';
                    shareBtn.addEventListener('click', () => {
                        shareFoodAction(food.id, food.name);
                    });
                    actionDiv.appendChild(shareBtn);
                }

                cardBody.appendChild(actionDiv);
            }

            card.appendChild(cardBody);
            container.appendChild(card);
        });
    }

});
