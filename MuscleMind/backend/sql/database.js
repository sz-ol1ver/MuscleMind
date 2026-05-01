// npm install mysql12
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'musclemind',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

//!SQL Queries
async function selectall() {
    const query = 'SELECT * FROM test;';
    const [rows] = await pool.execute(query);
    return rows;
}

// ----
// MINDEN OLDALRA VONATKOZÓ
// ----

//username kiírás jobbfelül minden oldalon
async function getUsernameById(id) {
    const select = 'SELECT username FROM users WHERE id = ?';
    const [rows] = await pool.execute(select, [id]);
    return rows[0];
}

// ----
// REGISTRATION / LOGIN / KERODIV
// ----

// regisztracio adatok --> db
async function registration_insert(fN, lN, uN, eM, p) {
    const insert = 'INSERT INTO users(first_name, last_name,username, email, password_hash) VALUES (?,?,?,?,?)';
    const [result] = await pool.execute(insert, [fN, lN, uN, eM, p]);
    return result.insertId;
}

// username validation
async function username_exist(username) {
    const userN = 'SELECT id FROM users WHERE username = ?';
    const [rows] = await pool.execute(userN, [username]);
    if(rows.length>0){
        return 1;
    }else{
        return 0;
    };
}
// email validation
async function email_exist(email) {
    const userN = 'SELECT id FROM users WHERE email = ?';
    const [rows] = await pool.execute(userN, [email]);
    if(rows.length>0){
        return 1;
    }else{
        return 0;
    };
}

// user adatai session / jelszo ellenorzeshez
async function findUser(email) {
    const select = 'SELECT id,username,password_hash,admin FROM users WHERE email = ?';
    const [rows] = await pool.execute(select, [email]);
    return rows[0];
}

async function checkIfActive(id) {
    const select = 'SELECT active FROM users WHERE id = ?';
    const [rows] = await pool.execute(select, [id]);
    return rows[0].active;
}

async function ifAdmin(id) {
    const userN = 'SELECT id FROM users WHERE id = ? AND admin = 1';
    const [rows] = await pool.execute(userN, [id]);
    return rows.id;
}

async function registComp(id) {
    const userN = 'SELECT id FROM users WHERE id = ? AND registered = 1';
    const [rows] = await pool.execute(userN, [id]);
    if(rows.length>0){
        return 1;
    }else{
        return 0;
    };
}

//user kerdoiv adatok (insert) /without weight
async function insertPreferences(id, date, height, gender, goal, experience_level, training_days, training_location, diet_type, meals_per_day) {
    const data = 'Insert into user_profiles(id, birth_date, height, gender, goal, experience_level, training_days, training_location, diet_type, meals_per_day) VALUES (?,?,?,?,?,?,?,?,?,?)';
    const [rows] = await pool.execute(data, [id, date, height, gender, goal, experience_level, training_days, training_location, diet_type, meals_per_day])
    return rows.insertId;
}

//user kerdoiv suly (insert) /without other preferences
async function insertWeight(id, weight) {
    const data = 'Insert into user_weights(user_id, weight) VALUES (?,?)';
    const [rows] = await pool.execute(data, [id, weight])
    return rows.insertId;
}

//user update registered
async function updateRegistered(id) {
    const update = 'UPDATE users SET registered = 1 WHERE id = ?';
    const [rows] = await pool.execute(update, [id]);
    return rows;
}

//? user metrics
function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);

    let age = today.getFullYear() - birth.getFullYear();

    const monthDiff = today.getMonth() - birth.getMonth();
    const dayDiff = today.getDate() - birth.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
    }

    return age;
}

function getActivityMultiplier(trainingDays) {
    switch (trainingDays) {
        case '2–3 nap':
            return 1.375;
        case '4 nap':
            return 1.55;
        case '5–6 nap':
            return 1.725;
        default:
            return 1.2;
    }
}

function getGoalCalories(tdee, goal) {
    switch (goal) {
        case 'tömegnövelés':
            return Math.round(tdee + 300);
        case 'szálkásítás':
            return Math.round(tdee - 300);
        case 'szintentartás':
            return Math.round(tdee);
        default:
            return Math.round(tdee);
    }
}

function getProteinRecommended(weight, goal) {
    switch (goal) {
        case 'tömegnövelés':
            return Number((weight * 1.8).toFixed(2));
        case 'szálkásítás':
            return Number((weight * 2.0).toFixed(2));
        case 'szintentartás':
            return Number((weight * 1.6).toFixed(2));
        default:
            return Number((weight * 1.6).toFixed(2));
    }
}

async function calculateUserMetrics(userId) {
    const profileSql = `
        SELECT 
            birth_date,
            height,
            gender,
            goal,
            training_days
        FROM user_profiles
        WHERE id = ?
    `;

    const [profileRows] = await pool.execute(profileSql, [userId]);
    const profile = profileRows[0];

    if (!profile) {
        throw new Error('Hiányzó profil adatok.');
    }

    const weightData = await getUserWeightData(userId);

    if (!weightData) {
        throw new Error('Hiányzó testsúly adat.');
    }

    if (!profile.birth_date || !profile.height || !profile.gender || !profile.goal || !profile.training_days) {
        throw new Error('Hiányos profil adatok a számításhoz.');
    }

    const age = calculateAge(profile.birth_date);
    const height = Number(profile.height);
    const weight = Number(weightData.weight);

    const bmi = Number((weight / Math.pow(height / 100, 2)).toFixed(2));

    let bmr;

    if (profile.gender === 'férfi') {
        bmr = Math.round((10 * weight) + (6.25 * height) - (5 * age) + 5);
    } else {
        bmr = Math.round((10 * weight) + (6.25 * height) - (5 * age) - 161);
    }

    const activityMultiplier = getActivityMultiplier(profile.training_days);
    const tdee = Number((bmr * activityMultiplier).toFixed(2));

    const goalCalories = getGoalCalories(tdee, profile.goal);
    const proteinRecommended = getProteinRecommended(weight, profile.goal);

    return {
        bmi,
        bmr,
        tdee,
        goalCalories,
        proteinRecommended
    };
}

async function saveUserMetrics(userId) {
    const metrics = await calculateUserMetrics(userId);

    const sql = `
        INSERT INTO user_metrics (
            user_id,
            bmi,
            bmr,
            tdee,
            goal_calories,
            protein_recommended
        ) VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            bmi = VALUES(bmi),
            bmr = VALUES(bmr),
            tdee = VALUES(tdee),
            goal_calories = VALUES(goal_calories),
            protein_recommended = VALUES(protein_recommended)
    `;

    const [result] = await pool.execute(sql, [
        userId,
        metrics.bmi,
        metrics.bmr,
        metrics.tdee,
        metrics.goalCalories,
        metrics.proteinRecommended
    ]);

    return result.affectedRows;
}


// -------
// PROFILE
// -------

// user alapadatok
async function getUserBasicData(id) {
    const query = 'SELECT id, first_name, last_name, username, email FROM users WHERE id = ?';
    const [rows] = await pool.execute(query, [id]);
    return rows[0];
}

// user profil adatok
async function getUserPreferencesData(id) {
    const query = 'SELECT birth_date AS age, height, gender, goal, experience_level, training_days, training_location, diet_type, meals_per_day FROM user_profiles WHERE id = ?';
    const [rows] = await pool.execute(query, [id]);
    return rows[0];
}

// user suly
async function getUserWeightData(id) {
    const query = 'SELECT weight FROM user_weights WHERE user_id = ? ORDER BY created_at DESC LIMIT 1';
    const [rows] = await pool.execute(query, [id]);
    return rows[0]; 
}

// user update basic
async function updateUserBasic(id, username, firstName, lastName, email) {
    const query = 'UPDATE users SET username = ?, first_name = ?, last_name = ?, email = ? WHERE id = ?';
    const [result] = await pool.execute(query, [username, firstName, lastName, email, id]);
    return result;
}

// user update preferences
async function updateUserPreferences(id, age, height, goal, experience_level, training_days, training_location, diet_type, meals_per_day) {
    const query = 'UPDATE user_profiles SET birth_date = ?, height = ?, goal = ?, experience_level = ?, training_days = ?, training_location = ?, diet_type = ?, meals_per_day = ? WHERE id = ?';
    const [result] = await pool.execute(query, [age, height, goal, experience_level, training_days, training_location, diet_type, meals_per_day, id]);
    return result;
}

// user jelszo lekeres
async function getUserPassword(id) {
    const query = 'SELECT password_hash FROM users WHERE id = ?';
    const [rows] = await pool.execute(query, [id]);
    return rows[0];
}

// jelszo frissites
async function updateUserPassword(id, hashedPassword) {
    const query = 'UPDATE users SET password_hash = ? WHERE id = ?';
    const [result] = await pool.execute(query, [hashedPassword, id]);
    return result;
}

// ----
// STATS
// ----

async function getUserGlobalXp(userId) {
    const sql = `
        SELECT 
            user_id,
            xp,
            updated_at
        FROM user_global_xp
        WHERE user_id = ?
    `;

    const [rows] = await pool.execute(sql, [userId]);

    if (rows.length === 0) {
        return {
            user_id: userId,
            xp: 0,
            updated_at: null
        };
    }

    return rows[0];
}

async function getUserMuscleXp(userId) {
    const sql = `
        SELECT
            muscle_group,
            xp,
            updated_at
        FROM user_muscle_xp
        WHERE user_id = ?
        ORDER BY muscle_group ASC
    `;

    const [rows] = await pool.execute(sql, [userId]);
    return rows;
}

async function getUserDailyStatsLast30Days(userId) {
    const sql = `
        SELECT
            stat_date,
            completed_workouts,
            total_volume,
            total_sets,
            total_reps,
            total_workout_time_sec,
            xp_gained,
            prs_achieved,
            updated_at
        FROM user_daily_stats
        WHERE user_id = ?
        AND stat_date >= CURDATE() - INTERVAL 30 DAY
        ORDER BY stat_date DESC
    `;

    const [rows] = await pool.execute(sql, [userId]);
    return rows;
}

async function getUserFullStats(userId) {
    const sql = 'SELECT * FROM user_stats WHERE user_id = ?';

    const [rows] = await pool.execute(sql, [userId]);

    if (rows.length === 0) {
        return {
            user_id: userId,
            completed_workouts: 0,
            total_volume: 0,
            total_sets: 0,
            total_reps: 0,
            pr_count: 0,
            total_workout_time_sec: 0,
            updated_at: null
        };
    }

    return rows[0];
}

async function getUserExercisePrs(userId) {
    const sql = `
        SELECT
            uep.exercise_id,
            e.name AS exercise_name,
            e.muscle_group,

            uep.max_weight,
            uep.max_weight_reps,
            uep.best_volume,
            uep.achieved_at,
            uep.created_at,
            uep.updated_at
        FROM user_exercise_prs uep
        INNER JOIN exercises e
            ON uep.exercise_id = e.id
        WHERE uep.user_id = ?
        ORDER BY e.name ASC
    `;

    const [rows] = await pool.execute(sql, [userId]);
    return rows;
}

async function getUserWeights(userId) {
    const sql = `
        SELECT
            id,
            weight,
            created_at
        FROM user_weights
        WHERE user_id = ?
        ORDER BY created_at ASC
    `;

    const [rows] = await pool.execute(sql, [userId]);
    return rows;
}

async function getAllExercisesForStats() {
    const sql = 'SELECT * FROM exercises ORDER BY id ASC';

    const [rows] = await pool.execute(sql);
    return rows;
}

async function getUserMetrics(userId) {
    const sql = 'SELECT * FROM user_metrics WHERE user_id = ?';

    const [rows] = await pool.execute(sql, [userId]);

    if (rows.length === 0) {
        return null;
    }

    return rows[0];
}



// -------
// WORKOUT
// -------

async function allExercises() {
    const all = 'SELECT id, name, muscle_group FROM exercises';
    const [rows] = await pool.execute(all);
    return rows;
}

async function exerciseExist(exerciseId) {
    const exercise = 'SELECT name FROM exercises WHERE id = ?';
    const [rows] = await pool.execute(exercise, [exerciseId]);
    return rows.length > 0;
}

async function createWorkoutPlan(conn, userId, name, daysCount) {
    const sql = `
        INSERT INTO workout_plans (user_id, name, days_count)
        VALUES (?, ?, ?)
    `;
    const [result] = await conn.execute(sql, [userId, name, daysCount]);
    return result.insertId;
}

async function createWorkoutDay(conn, planId, dayNumber, name, restDay) {
    const sql = `
        INSERT INTO workout_days (plan_id, day_number, name, isRestDay)
        VALUES (?, ?, ?,  ?)
    `;
    const [result] = await conn.execute(sql, [planId, dayNumber, name, restDay]);
    return result.insertId;
}

async function createDayExercise(conn, dayId, exerciseId, exerciseOrder) {
    const sql = `
        INSERT INTO day_exercises (day_id, exercise_id, exercise_order)
        VALUES (?, ?, ?)
    `;
    await conn.execute(sql, [dayId, exerciseId, exerciseOrder]);
}

async function allUserPlans(userId) {
    const sql = 'SELECT id, name, days_count FROM workout_plans WHERE user_id = ? ORDER BY id DESC';
    const [rows] = await pool.execute(sql, [userId]);
    return rows;
}

async function allDefaultPlans() {
    const sql = 'SELECT id, name, days_count, level, location, goal, description FROM workout_plans WHERE user_id IS NULL AND is_public = TRUE ORDER BY id DESC';
    const [rows] = await pool.execute(sql);
    return rows;
}

async function getWorkoutPlanDetails(userId, planId){
    const sql = `
        SELECT
            wp.id AS plan_id,
            wp.name AS plan_name,
            wp.days_count,

            wd.id AS day_id,
            wd.day_number,
            wd.name AS day_name,
            wd.isRestDay,
            wd.image_url,

            de.id AS day_exercise_id,
            de.exercise_order,

            e.id AS exercise_id,
            e.name AS exercise_name,
            e.muscle_group

        FROM workout_plans wp

        INNER JOIN workout_days wd
            ON wp.id = wd.plan_id

        LEFT JOIN day_exercises de
            ON wd.id = de.day_id

        LEFT JOIN exercises e
            ON de.exercise_id = e.id

        WHERE wp.id = ?
        AND wp.user_id = ?

        ORDER BY
            wd.day_number ASC,
            de.exercise_order ASC
    `;

    const [rows] = await pool.execute(sql, [planId, userId]);
    return rows;
}

async function getDefaultWorkoutPlanDetails(planId){
    const sql = `
        SELECT
            wp.id AS plan_id,
            wp.name AS plan_name,
            wp.days_count,
            wp.level,
            wp.location,
            wp.goal,
            wp.description,

            wd.id AS day_id,
            wd.day_number,
            wd.name AS day_name,
            wd.isRestDay,
            wd.image_url,

            de.id AS day_exercise_id,
            de.exercise_order,

            e.id AS exercise_id,
            e.name AS exercise_name,
            e.muscle_group

        FROM workout_plans wp

        INNER JOIN workout_days wd
            ON wp.id = wd.plan_id

        LEFT JOIN day_exercises de
            ON wd.id = de.day_id

        LEFT JOIN exercises e
            ON de.exercise_id = e.id

        WHERE wp.id = ?
        AND wp.user_id is NULL
        AND wp.is_public = TRUE

        ORDER BY
            wd.day_number ASC,
            de.exercise_order ASC
    `;

    const [rows] = await pool.execute(sql, [planId]);
    return rows;
}

async function deletePlan(userId, planId) {
    const sql = 'DELETE FROM workout_plans WHERE user_id = ? AND id = ?';
    const [rows] = await pool.execute(sql, [userId, planId]);
    return rows.affectedRows;
}

async function updateWorkoutPlanDays(conn, days) {
    for (const day of days) {
        // 1. workout_days update
        const updateDaySql = `
            UPDATE workout_days
            SET name = ?, isRestDay = ?
            WHERE id = ?
        `;
        await conn.execute(updateDaySql, [
            day.name.trim(),
            day.restDay,
            day.dayId
        ]);

        // 2. régi gyakorlatok törlése
        const deleteExercisesSql = `
            DELETE FROM day_exercises
            WHERE day_id = ?
        `;
        await conn.execute(deleteExercisesSql, [day.dayId]);

        // 3. ha nem pihenőnap, új gyakorlatok insert
        if (!day.restDay) {
            for (const exercise of day.exercises) {
                const insertExerciseSql = `
                    INSERT INTO day_exercises
                    (day_id, exercise_id, exercise_order)
                    VALUES (?, ?, ?)
                `;
                await conn.execute(insertExerciseSql, [
                    day.dayId,
                    exercise.exerciseId,
                    exercise.order
                ]);
            }
        }
    }
}

async function selectUpdatePlan(userId, planId) {
    const sql ='SELECT id FROM workout_plans WHERE id = ? AND user_id = ?';
    const [rows] = await pool.execute(sql, [planId, userId]);
    return rows;
}

async function getActive(id) {
    const sql = 'SELECT active_plan FROM users WHERE id = ?';
    const [rows] = await pool.execute(sql, [id]);
    return rows[0].active_plan;
}

async function updateActiveNull(userId) {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const today = new Date();
        const todayString = formatDate(today);

        const [todayRows] = await connection.query(
            `SELECT status
             FROM workout_calendar_logs
             WHERE user_id = ?
               AND workout_date = ?
             LIMIT 1`,
            [userId, todayString]
        );

        let startDate = new Date(today);

        if (todayRows.length && todayRows[0].status === 'completed') {
            startDate.setDate(startDate.getDate() + 1);
        }

        const startDateString = formatDate(startDate);

        await connection.query(
            `UPDATE users
             SET active_plan = NULL
             WHERE id = ?`,
            [userId]
        );

        await connection.query(
            `DELETE wce
             FROM workout_calendar_exercises wce
             JOIN workout_calendar_logs wcl
               ON wce.workout_calendar_log_id = wcl.id
             WHERE wcl.user_id = ?
               AND wcl.workout_date >= ?`,
            [userId, startDateString]
        );

        await connection.query(
            `DELETE FROM workout_calendar_logs
             WHERE user_id = ?
               AND workout_date >= ?`,
            [userId, startDateString]
        );

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}
async function updateActive(userId, planId) {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Mai dátum
        const today = new Date();
        const todayString = formatDate(today);

        // 2. Megnézzük, hogy mára van-e completed edzés
        const [todayRows] = await connection.query(
            `SELECT status
             FROM workout_calendar_logs
             WHERE user_id = ?
               AND workout_date = ?
             LIMIT 1`,
            [userId, todayString]
        );

        let startDate = new Date(today);

        if (todayRows.length && todayRows[0].status === 'completed') {
            startDate.setDate(startDate.getDate() + 1);
        }

        const startDateString = formatDate(startDate);

        // 3. Active plan frissítése
        await connection.query(
            `UPDATE users
             SET active_plan = ?
             WHERE id = ?`,
            [planId, userId]
        );

        // 4. Az új terv napjainak lekérése
        const [workoutDays] = await connection.query(
            `SELECT id, day_number, name, isRestDay
             FROM workout_days
             WHERE plan_id = ?
             ORDER BY day_number ASC`,
            [planId]
        );

        // 5. Jövőbeli gyakorlatok törlése a kezdődátumtól
        await connection.query(
            `DELETE wce
             FROM workout_calendar_exercises wce
             JOIN workout_calendar_logs wcl
               ON wce.workout_calendar_log_id = wcl.id
             WHERE wcl.user_id = ?
               AND wcl.workout_date >= ?`,
            [userId, startDateString]
        );

        // 6. Jövőbeli logok törlése a kezdődátumtól
        await connection.query(
            `DELETE FROM workout_calendar_logs
             WHERE user_id = ?
               AND workout_date >= ?`,
            [userId, startDateString]
        );

        // 7. Két hónapra előre generálás
        const currentDate = new Date(startDate);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 2);

        let dayIndex = 0;

        while (currentDate < endDate) {
            const workoutDay = workoutDays[dayIndex % workoutDays.length];
            const workoutDate = formatDate(currentDate);
            const status = workoutDay.isRestDay ? 'rest' : 'pending';

            // napi log beszúrás
            const [logResult] = await connection.query(
                `INSERT INTO workout_calendar_logs
                (user_id, workout_plan_id, workout_day_id, workout_date, status)
                VALUES (?, ?, ?, ?, ?)`,
                [userId, planId, workoutDay.id, workoutDate, status]
            );

            const calendarLogId = logResult.insertId;

            // ha nem rest day, akkor a gyakorlatokat is másoljuk
            if (!workoutDay.isRestDay) {
                const [dayExercises] = await connection.query(
                    `SELECT exercise_id, exercise_order
                     FROM day_exercises
                     WHERE day_id = ?
                     ORDER BY exercise_order ASC`,
                    [workoutDay.id]
                );

                for (const exercise of dayExercises) {
                    await connection.query(
                        `INSERT INTO workout_calendar_exercises
                        (workout_calendar_log_id, exercise_id, exercise_order)
                        VALUES (?, ?, ?)`,
                        [
                            calendarLogId,
                            exercise.exercise_id,
                            exercise.exercise_order
                        ]
                    );
                }
            }

            currentDate.setDate(currentDate.getDate() + 1);
            dayIndex++;
        }

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}
async function updateActive(userId,plan) {
    const sql = 'UPDATE users SET active_plan = ? WHERE id = ?';
    const [rows] = await pool.execute(sql, [plan, userId]);
    return rows.affectedRows;
}
async function calendarUpToDate(userId) {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. active_plan lekérése
        const [userRows] = await connection.query(
            `SELECT active_plan
             FROM users
             WHERE id = ?`,
            [userId]
        );

        const planId = userRows[0]?.active_plan;

        if (!planId) {
            await connection.commit();
            return; // nincs aktív terv → nincs teendő
        }

        // 2. utolsó nap lekérése
        const [lastDateRows] = await connection.query(
            `SELECT MAX(workout_date) AS last_date
             FROM workout_calendar_logs
             WHERE user_id = ?`,
            [userId]
        );

        const lastDate = lastDateRows[0]?.last_date;

        const today = new Date();
        let daysLeft = 0;

        if (lastDate) {
            const last = new Date(lastDate);
            const diffTime = last - today;
            daysLeft = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        }

        // 3. ha van még legalább 7 nap → nincs teendő
        if (daysLeft >= 7) {
            await connection.commit();
            return;
        }

        // 4. workout_days lekérése
        const [workoutDays] = await connection.query(
            `SELECT id, day_number, isRestDay
             FROM workout_days
             WHERE plan_id = ?
             ORDER BY day_number ASC`,
            [planId]
        );

        // 5. honnan kezdjük a generálást
        let startDate;

        if (!lastDate) {
            // nincs még semmi → mától
            startDate = new Date(today);
        } else {
            // van már → utolsó nap +1
            startDate = new Date(lastDate);
            startDate.setDate(startDate.getDate() + 1);
        }

        // 6. végdátum = +2 hónap
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 2);

        // 7. melyik nap jön következőnek?
        let dayIndex = 0;

        if (lastDate) {
            const [lastLogRows] = await connection.query(
                `SELECT workout_day_id
                 FROM workout_calendar_logs
                 WHERE user_id = ?
                 ORDER BY workout_date DESC
                 LIMIT 1`,
                [userId]
            );

            const lastDayId = lastLogRows[0]?.workout_day_id;

            const lastIndex = workoutDays.findIndex(day => day.id === lastDayId);
            
            dayIndex = (lastIndex + 1) % workoutDays.length;
        }

        // 8. generálás
        const currentDate = new Date(startDate);

        while (currentDate < endDate) {
            const workoutDay = workoutDays[dayIndex % workoutDays.length];
            const workoutDate = formatDate(currentDate);
            const status = workoutDay.isRestDay ? 'rest' : 'pending';

            const [logResult] = await connection.query(
                `INSERT INTO workout_calendar_logs
                (user_id, workout_plan_id, workout_day_id, workout_date, status)
                VALUES (?, ?, ?, ?, ?)`,
                [userId, planId, workoutDay.id, workoutDate, status]
            );

            const calendarLogId = logResult.insertId;

            if (!workoutDay.isRestDay) {
                const [dayExercises] = await connection.query(
                    `SELECT exercise_id, exercise_order
                     FROM day_exercises
                     WHERE day_id = ?
                     ORDER BY exercise_order ASC`,
                    [workoutDay.id]
                );

                for (const exercise of dayExercises) {
                    await connection.query(
                        `INSERT INTO workout_calendar_exercises
                        (workout_calendar_log_id, exercise_id, exercise_order)
                        VALUES (?, ?, ?)`,
                        [
                            calendarLogId,
                            exercise.exercise_id,
                            exercise.exercise_order
                        ]
                    );
                }
            }

            currentDate.setDate(currentDate.getDate() + 1);
            dayIndex++;
        }

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}
async function getUserCalendar(userId) {
    const sqlLogs =
        `SELECT
            wcl.id AS log_id,
            wcl.workout_date,
            wcl.status,
            wd.name AS day_name,
            wd.isRestDay
        FROM workout_calendar_logs wcl
        INNER JOIN workout_days wd ON wcl.workout_day_id = wd.id
        WHERE wcl.user_id = ?
        ORDER BY wcl.workout_date ASC`;
    const [logs] = await pool.execute(sqlLogs, [userId]);

    const sqlExercises = 
        `SELECT
            wcl.id AS log_id,
            wce.id AS calendar_exercise_id,
            e.name AS exercise_name,
            e.muscle_group AS exercise_muscle_group,
            wce.exercise_order
        FROM workout_calendar_logs wcl
        INNER JOIN workout_calendar_exercises wce ON wcl.id = wce.workout_calendar_log_id
        INNER JOIN exercises e ON wce.exercise_id = e.id
        WHERE wcl.user_id = ?
        ORDER BY wce.exercise_order ASC`;
    const [exercises] = await pool.execute(sqlExercises, [userId]);

    // logok es gyakorlatok osszekapcsolasa a pihenonapok miatt
    const resultRows = [];

    for (let i = 0; i < logs.length; i++) {
        let hasExercise = false;

        for (let j = 0; j < exercises.length; j++) {
            if (logs[i].log_id === exercises[j].log_id) {
                resultRows.push({
                    log_id: logs[i].log_id,
                    workout_date: logs[i].workout_date,
                    status: logs[i].status,
                    day_name: logs[i].day_name,
                    isRestDay: logs[i].isRestDay,
                    calendar_exercise_id: exercises[j].calendar_exercise_id,
                    exercise_name: exercises[j].exercise_name,
                    exercise_muscle_group: exercises[j].exercise_muscle_group,
                    exercise_order: exercises[j].exercise_order
                });
                hasExercise = true;
            }
        }

        if (hasExercise === false) {
            resultRows.push({
                log_id: logs[i].log_id,
                workout_date: logs[i].workout_date,
                status: logs[i].status,
                day_name: logs[i].day_name,
                isRestDay: logs[i].isRestDay,
                calendar_exercise_id: null,
                exercise_name: null,
                exercise_muscle_group: null,
                exercise_order: null
            });
        }
    }

    return resultRows;
}

async function getCalendarSets(calendarExerciseId) {
    const sql = `SELECT id, set_number, reps_done, weight_done FROM workout_calendar_sets WHERE workout_calendar_exercise_id = ? ORDER BY set_number ASC`;
    const [rows] = await pool.execute(sql, [calendarExerciseId]);
    return rows;
}

async function saveCalendarSets(calendarExerciseId, sets) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Előző settek törlése, hogy egyszerűbb legyen az updatelés
        await connection.execute(
            `DELETE FROM workout_calendar_sets WHERE workout_calendar_exercise_id = ?`,
            [calendarExerciseId]
        );

        for (const set of sets) {
            await connection.execute(
                `INSERT INTO workout_calendar_sets (workout_calendar_exercise_id, set_number, reps_done, weight_done) VALUES (?, ?, ?, ?)`,
                [calendarExerciseId, set.set_number, set.reps_done, set.weight_done]
            );
        }

        await connection.commit();
        return true;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function updateWorkoutCalendarLogStatus(userId, logId, status) {
    const sql = `UPDATE workout_calendar_logs SET status = ? WHERE id = ? AND user_id = ?`;
    const [result] = await pool.execute(sql, [status, logId, userId]);
    return result;
}

async function startWorkoutCalendarLogStatus(userId, logId) {
    const sql = `UPDATE workout_calendar_logs SET status = 'started', start_time = NOW() WHERE id = ? AND user_id = ?`;
    const [result] = await pool.execute(sql, [logId, userId]);
    return result;
}

async function finishWorkoutCalendarLogStatus(userId, logId) {
    const sql = `UPDATE workout_calendar_logs SET status = 'completed', workout_time_sec = TIMESTAMPDIFF(SECOND, start_time, NOW()) WHERE id = ? AND user_id = ?`;
    const [result] = await pool.execute(sql, [logId, userId]);
    return result;
}

async function postponeWorkoutCalendarLog(userId, logId, newDate) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // lekerjuk a jelenlegi edzest, hogy megtudjuk a datumot
        const [currentLog] = await connection.execute(
            `SELECT workout_date FROM workout_calendar_logs WHERE id = ? AND user_id = ?`,
            [logId, userId]
        );

        if (currentLog.length === 0) {
            throw new Error('Nem talalhato az edzes!');
        }

        const currentDate = formatDate(new Date(currentLog[0].workout_date));

        // megnezzuk van-e a cel datumon masik edzes
        const [targetLog] = await connection.execute(
            `SELECT id FROM workout_calendar_logs WHERE user_id = ? AND workout_date = ?`,
            [userId, newDate]
        );

        if (targetLog.length > 0) {
            const targetLogId = targetLog[0].id;
            
            // letrehozunk egy ideiglenes datumot ('1000-01-01') a cserelodeshez hogy ne legyen duplicate hiba
            await connection.execute(
                `UPDATE workout_calendar_logs SET workout_date = '1000-01-01' WHERE id = ?`,
                [targetLogId]
            );

            // atmozgatjuk a mostani edzest az uj datumra
            await connection.execute(
                `UPDATE workout_calendar_logs SET workout_date = ? WHERE id = ?`,
                [newDate, logId]
            );

            // vegul a regi datumra tesszuk a masikat
            await connection.execute(
                `UPDATE workout_calendar_logs SET workout_date = ? WHERE id = ?`,
                [currentDate, targetLogId]
            );
        } else {
            // ha nincs a cel datumon semmi, csak siman atallitjuk
            await connection.execute(
                `UPDATE workout_calendar_logs SET workout_date = ? WHERE id = ?`,
                [newDate, logId]
            );
        }

        await connection.commit();
        return true;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

//format date for update active
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

// ----
// token
// ----

async function save_token(email, token) {
    const id = 'SELECT id FROM users WHERE email = ?';
    const insert = 'INSERT INTO reset_tokens(user_id, token_hash) VALUES (?,?)';
    const [user_id] = await pool.execute(id, [email]);
    const [rows] = await pool.execute(insert, [user_id[0].id, token]);
    return rows.insertId;
}
async function delete_tokens(email) {
    const id = 'SELECT id FROM users WHERE email = ?';
    const [user_id] = await pool.execute(id, [email]);
    const deleteTokens = 'DELETE FROM reset_tokens WHERE user_id = ?';
    const [rows] = await pool.execute(deleteTokens, [user_id[0].id]);
    return rows.affectedRows;
}
async function find_token(token) {
    const select = 'SELECT id,user_id,expires_at, used FROM reset_tokens WHERE token_hash = ?';
    const [rows] = await pool.execute(select, [token]);
    return rows[0];
}
async function update_password(id, password) {
    const update = 'UPDATE users SET password_hash = ? WHERE id = ?';
    const [rows] = await pool.execute(update, [password, id]);
    return rows.affectedRows;
}
async function set_used(id) {
    const update = 'UPDATE reset_tokens SET used = 1 WHERE id = ? AND used = FALSE';
    const [rows] = await pool.execute(update, [id]);
    return rows.affectedRows;
}

//? interval delete expired tokens
async function token_expire_del() {
    const del = 'DELETE FROM reset_tokens WHERE expires_at < NOW() OR used = TRUE';
    const [rows] = await pool.execute(del);
    return rows;
}
// ----
// TICKET
// ----
async function findTicketEmail(id) {
    const sql = 'SELECT email FROM users WHERE id = ?';
    const [rows] = await pool.execute(sql, [id]);
    return rows[0].email;
}
async function findPreId(ticketId, userId) {
    const sql = 'SELECT id FROM support_requests WHERE id = ? AND user_id = ?';
    const [rows] = await pool.execute(sql, [ticketId, userId]);
    return rows;
}
async function createTicket(userId, email, category, subject, message, preId) {
    const insert = 'INSERT INTO support_requests(user_id, email, category, subject, message, related_request_id) VALUES (?,?,?,?,?,?)';
    const [rows] = await pool.execute(insert, [userId, email, category, subject, message, preId]);
    return rows.insertId;
}
async function limitTicketCreation(userId) {
    const sql = 'SELECT COUNT(*) AS ticket_count FROM support_requests WHERE user_id = ? AND created_at >= NOW() - INTERVAL 1 HOUR;'
    const [rows] = await pool.execute(sql, [userId]);
    return rows[0].ticket_count;
}
async function allUserTickets(userId) {
    const sql = 'SELECT support_requests.*, users.username AS admin_username FROM support_requests LEFT JOIN users ON(support_requests.replied_by_admin_id = users.id) WHERE user_id = ? ORDER BY created_at DESC';
    const [rows] = await pool.execute(sql, [userId]);
    return rows;
}
async function allTickets() {
    const sql = 'SELECT support_requests.*, users.username AS admin_username FROM support_requests LEFT JOIN users ON(support_requests.replied_by_admin_id = users.id)ORDER BY created_at DESC';
    const [rows] = await pool.execute(sql);
    return rows;
}

// ----
// ADMIN
// ----
/*async function isAdminCheck(userId) {
    const sql = 'SELECT id FROM users WHERE id = ? AND admin = 1';
    const [rows] = await pool.execute(sql, [userId]);
    return rows;
}*/

async function todayRegistration() {
    const regCount = `
        SELECT COUNT(DISTINCT user_id) AS regCount 
        FROM logs 
        WHERE action = 'registration'
        AND created_at >= CURDATE()
    `;
    const [rows] = await pool.execute(regCount);
    return rows[0].regCount;
}
async function totalUserCount() {
    const select = 'SELECT COUNT(*) AS userCount FROM users WHERE admin = 0';
    const [rows] = await pool.execute(select);
    return rows[0].userCount;
}
async function todayLoginCount() {
    const select = `
        SELECT COUNT(DISTINCT user_id) AS loginCount 
        FROM logs INNER JOIN users ON(logs.user_id = users.id)
        WHERE (action = 'login' OR action = 'registration')
        AND users.admin = 0
        AND logs.created_at >= CURDATE()
    `;
    const [rows] = await pool.execute(select);
    return rows[0].loginCount;
}
async function todayTicketCount(params) {
    const select = `
        SELECT COUNT(*) AS ticketCount 
        FROM logs 
        WHERE action = 'ticket_created'
        AND created_at >= CURDATE()
    `;
    const [rows] = await pool.execute(select);
    return rows[0].ticketCount;
}
async function todayErrorCount() {
    const select = `
        SELECT COUNT(*) AS errorCount 
        FROM logs 
        WHERE type = 'error'
        AND created_at >= CURDATE()
    `;
    const [rows] = await pool.execute(select);
    return rows[0].errorCount;
};
async function todayWorkoutCount() {
    const select = `
        SELECT COUNT(*) AS workoutCount 
        FROM workout_plans 
        WHERE is_public = 0
        AND created_at >= CURDATE()
    `;
    const [rows] = await pool.execute(select);
    return rows[0].workoutCount;
}
async function validateTicketId(id) {
    const select = 'SELECT id FROM support_requests WHERE id = ?';
    const [rows] = await pool.execute(select, [id]);
    if(rows.length >= 1){
        return 1;
    }else{
        return 0;
    }
}
async function ticketSeen(id) {
    const update = 'UPDATE support_requests SET status = "seen" WHERE id = ?';
    const [rows] = await pool.execute(update, [id]);
    return rows.affectedRows;
}
async function ticketsSeen() {
    const update = 'UPDATE support_requests SET status = "seen" WHERE status = "open"';
    const [rows] = await pool.execute(update);
    return rows.affectedRows;
}
async function ticketClose(id, status) {
    const update = 'UPDATE support_requests SET status = ? WHERE id = ?';
    const [rows] = await pool.execute(update, [status, id]);
    return rows.affectedRows;
}
async function ticketAnswer(id, adminMessage, adminId) {
    const update = 'UPDATE support_requests SET admin_reply = ?, replied_by_admin_id = ?, replied_at = CURRENT_TIMESTAMP WHERE id = ?';
    const [rows] = await pool.execute(update, [adminMessage,adminId,id]);
    return rows.affectedRows;
}
async function ticketAdminReplyCheck(id) {
    const select = 'SELECT admin_reply FROM support_requests WHERE id = ?';
    const [rows] = await pool.execute(select, [id]);
    return rows[0].admin_reply;
}
async function allUserBasicData() {
    const select = 'SELECT id, username, active, created_at FROM users ORDER BY created_at DESC';
    const [rows] = await pool.execute(select);
    return rows;
}
async function userAllData(id) {
    const select = `
        SELECT 
            u.id,
            u.first_name,
            u.last_name,
            u.username,
            u.email,
            u.registered,
            u.admin,
            u.active,
            u.created_at AS profil_date,

            up.birth_date,
            up.height,
            up.gender,
            up.goal,
            up.experience_level,
            up.training_days,
            up.training_location,
            up.diet_type,
            up.meals_per_day,
            up.created_at AS registration_date,

            uw.weight,
            uw.created_at AS weight_date,

            um.bmi,
            um.bmr,
            um.tdee,
            um.goal_calories,
            um.protein_recommended,
            um.calculated_at

        FROM users u

        LEFT JOIN user_profiles up 
            ON up.id = u.id

        LEFT JOIN user_metrics um
            ON um.user_id = u.id

        LEFT JOIN user_weights uw 
            ON uw.id = (
                SELECT id 
                FROM user_weights 
                WHERE user_id = u.id 
                ORDER BY created_at DESC 
                LIMIT 1
            )
        WHERE u.id = ?;
    `
    const [rows] = await pool.execute(select, [id]);
    return rows[0];
}
async function userAdmin(id) {
    const update = 'UPDATE users SET admin = NOT admin WHERE id = ?';
    const [rows] = await pool.execute(update, [id]);
    return rows.affectedRows;
}
async function selectCurrentAdminStatus(userId) {
    const select = 'SELECT admin FROM users WHERE id = ?';
    const [rows] = await pool.execute(select, [userId]);
    if(rows.length === 0){
        return null;
    }
    return rows[0].admin;
}
async function userBlock(id) {
    const update = 'UPDATE users SET active = NOT active WHERE id = ?';
    const [rows] = await pool.execute(update, [id]);
    return rows.affectedRows;
}
async function userDelete(id) {
    const deleteU = 'DELETE FROM users WHERE id = ?';
    const [rows] = await pool.execute(deleteU, [id]);
    return rows.affectedRows;
}
async function userChangeEmail(id, email) {
    const update = 'UPDATE users SET email = ? WHERE id = ?';
    const [rows] = await pool.execute(update, [email,id]);
    return rows.affectedRows;
}
async function userChangeUsername(id, username) {
    const update = 'UPDATE users SET username = ? WHERE id = ?';
    const [rows] = await pool.execute(update, [username,id]);
    return rows.affectedRows;
}
async function allFoods() {
    const selectFoods = 'SELECT * FROM foods ORDER BY id DESC';
    const [foods] = await pool.execute(selectFoods);

    const selectAllergens = `
        SELECT 
            fa.food_id,
            a.id,
            a.name
        FROM food_allergens fa
        INNER JOIN allergens a ON fa.allergen_id = a.id
    `;
    const [allergens] = await pool.execute(selectAllergens);

    for (let food of foods) {
        food.allergens = [];
        for (let allergen of allergens) {
            if (allergen.food_id == food.id) {
                food.allergens.push({
                    id: allergen.id,
                    name: allergen.name
                });
            }
        }
    }

    return foods;
}
async function foodApproved(id) {
    const update = 'UPDATE foods SET is_approved = NOT is_approved WHERE id = ?';
    const [rows] = await pool.execute(update, [id]);
    return rows.affectedRows;
}
async function deleteFood(id) {
    const del = 'DELETE FROM foods WHERE id = ?';
    const [rows] = await pool.execute(del, [id]);
    return rows.affectedRows;
}

async function createFood(adminId,food) {
    const insert = `
        INSERT INTO foods (
            created_by,
            name,
            description,
            image_url,
            category,
            calories_kcal,
            protein_g,
            carbs_g,
            fat_g,
            fiber_g,
            sugar_g,
            salt_g,
            serving_size,
            serving_unit,
            goal_tag,
            diet_tag,
            difficulty,
            prep_time_min,
            high_protein,
            low_carb,
            bulk_friendly,
            cut_friendly,
            is_approved
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `;
    const [rows] = await pool.execute(insert, [
        adminId,
        food.name,
        food.description,
        food.url || null,
        food.category,
        food.calories_kcal,
        food.protein_g,
        food.carbs_g,
        food.fat_g,
        food.fiber_g,
        food.sugar_g,
        food.salt_g,
        food.serving_size,
        food.serving_unit,
        food.goal_tag,
        food.diet_tag,
        food.difficulty,
        food.prep_time_min,
        food.high_protein,
        food.low_carb,
        food.bulk_friendly,
        food.cut_friendly,
        1
    ]);
    return rows.insertId;
}
async function insertFoodAllergen(foodId, allergenId) {
    const insert = 'INSERT INTO food_allergens(food_id, allergen_id)VALUES(?,?)';
    const [rows] = await pool.execute(insert, [foodId, allergenId]);
    return rows.insertId;
}

async function createUserFood(userId, food) {
    const insert = `
        INSERT INTO foods (
            user_id,
            created_by,
            name,
            description,
            image_url,
            category,
            calories_kcal,
            protein_g,
            carbs_g,
            fat_g,
            fiber_g,
            sugar_g,
            salt_g,
            serving_size,
            serving_unit,
            goal_tag,
            diet_tag,
            difficulty,
            prep_time_min,
            high_protein,
            low_carb,
            bulk_friendly,
            cut_friendly,
            is_approved
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `;
    const [rows] = await pool.execute(insert, [
        userId,
        userId,
        food.name,
        food.description,
        food.url || null,
        food.category,
        food.calories_kcal,
        food.protein_g,
        food.carbs_g,
        food.fat_g,
        food.fiber_g,
        food.sugar_g,
        food.salt_g,
        food.serving_size,
        food.serving_unit,
        food.goal_tag,
        food.diet_tag,
        food.difficulty,
        food.prep_time_min,
        food.high_protein,
        food.low_carb,
        food.bulk_friendly,
        food.cut_friendly,
        0
    ]);
    return rows.insertId;
}

async function deleteUserFood(id, userId) {
    const del = 'DELETE FROM foods WHERE id = ? AND user_id = ?';
    const [rows] = await pool.execute(del, [id, userId]);
    return rows.affectedRows;
}

async function createShareTicket(userId, foodId, foodName) {
    const emailSql = 'SELECT email FROM users WHERE id = ?';
    const [rowsEmail] = await pool.execute(emailSql, [userId]);
    const email = rowsEmail[0].email;

    const insert = `
        INSERT INTO support_requests (
            user_id, email, category, subject, message
        ) VALUES (?, ?, ?, ?, ?)
    `;
    const message = `Kérlek hagyd jóvá a következő receptemet!\nNév: ${foodName}\nAzonosító (ID): ${foodId}`;
    const [rows] = await pool.execute(insert, [userId, email, 'idea', 'Új recept jóváhagyása', message]);
    return rows.insertId;
}
//? workouts
async function getAllUsersPlans(){
    const sql = `
        SELECT
            wp.id AS plan_id,
            wp.name AS plan_name,
            wp.days_count,
            wp.user_id,

            wd.id AS day_id,
            wd.day_number,
            wd.name AS day_name,
            wd.isRestDay,
            wd.image_url,

            de.id AS day_exercise_id,
            de.exercise_order,

            e.id AS exercise_id,
            e.name AS exercise_name,
            e.muscle_group

        FROM workout_plans wp

        INNER JOIN workout_days wd
            ON wp.id = wd.plan_id

        LEFT JOIN day_exercises de
            ON wd.id = de.day_id

        LEFT JOIN exercises e
            ON de.exercise_id = e.id

        WHERE wp.user_id IS NOT NULL

        ORDER BY
            wp.id DESC,
            wd.day_number ASC,
            de.exercise_order ASC
    `;

    const [rows] = await pool.execute(sql);
    return formatWorkoutPlans(rows);
}
async function getAllDefaultPlans(){
    const sql = `
        SELECT
            wp.id AS plan_id,
            wp.name AS plan_name,
            wp.days_count,
            wp.level,
            wp.location,
            wp.goal,
            wp.description,

            wd.id AS day_id,
            wd.day_number,
            wd.name AS day_name,
            wd.isRestDay,
            wd.image_url,

            de.id AS day_exercise_id,
            de.exercise_order,

            e.id AS exercise_id,
            e.name AS exercise_name,
            e.muscle_group

        FROM workout_plans wp

        INNER JOIN workout_days wd
            ON wp.id = wd.plan_id

        LEFT JOIN day_exercises de
            ON wd.id = de.day_id

        LEFT JOIN exercises e
            ON de.exercise_id = e.id

        WHERE wp.user_id is NULL
        AND wp.is_public = TRUE

        ORDER BY
            wp.id DESC,
            wd.day_number ASC,
            de.exercise_order ASC
    `;

    const [rows] = await pool.execute(sql);
    return formatWorkoutPlans(rows);
}
//? workout helper function
function formatWorkoutPlans(rows) {
    const plans = [];

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];

        // 1. PLAN keresése
        let plan = null;

        for (let j = 0; j < plans.length; j++) {
            if (plans[j].planId === row.plan_id) {
                plan = plans[j];
                break;
            }
        }

        // 2. Ha nincs még plan → létrehozás
        if (!plan) {
            plan = {
                planId: row.plan_id,
                name: row.plan_name,
                daysCount: row.days_count,
                user_id: row.user_id ?? null,

                level: row.level ?? null,
                location: row.location ?? null,
                goal: row.goal ?? null,
                description: row.description ?? null,

                days: []
            };

            plans.push(plan);
        }

        // 3. DAY keresése
        let day = null;

        for (let k = 0; k < plan.days.length; k++) {
            if (plan.days[k].dayId === row.day_id) {
                day = plan.days[k];
                break;
            }
        }

        // 4. Ha nincs még day → létrehozás
        if (!day) {
            day = {
                dayId: row.day_id,
                dayNumber: row.day_number,
                name: row.day_name,
                isRestDay: Boolean(row.isRestDay),
                imageUrl: row.image_url,
                exercises: []
            };

            plan.days.push(day);
        }

        // 5. Exercise hozzáadás (ha van)
        if (row.exercise_id !== null) {
            day.exercises.push({
                dayExerciseId: row.day_exercise_id,
                exerciseId: row.exercise_id,
                name: row.exercise_name,
                muscleGroup: row.muscle_group,
                order: row.exercise_order
            });
        }
    }

    return plans;
}

async function createAdminWorkoutPlan(workout) {
    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        const insertPlan = `
            INSERT INTO workout_plans
            (user_id, name, level, location, goal, description, is_public, days_count)
            VALUES (NULL, ?, ?, ?, ?, ?, 1, ?)
        `;

        const [planResult] = await conn.execute(insertPlan, [
            workout.name,
            workout.level,
            workout.location,
            workout.goal,
            workout.description,
            workout.days_count
        ]);

        const planId = planResult.insertId;

        for (const day of workout.days) {
            const insertDay = `
                INSERT INTO workout_days
                (plan_id, day_number, name, isRestDay, image_url)
                VALUES (?, ?, ?, ?, ?)
            `;

            const [dayResult] = await conn.execute(insertDay, [
                planId,
                day.dayNumber,
                day.name,
                day.restDay,
                null
            ]);

            const dayId = dayResult.insertId;

            if (!day.restDay) {
                for (const exercise of day.exercises) {
                    const insertExercise = `
                        INSERT INTO day_exercises
                        (day_id, exercise_id, exercise_order)
                        VALUES (?, ?, ?)
                    `;

                    await conn.execute(insertExercise, [
                        dayId,
                        exercise.exerciseId,
                        exercise.order
                    ]);
                }
            }
        }

        await conn.commit();
        return planId;

    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
}
async function updateAdminWorkoutPlan(planId, workout) {
    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        const updatePlan = `
            UPDATE workout_plans
            SET
                name = ?,
                level = ?,
                location = ?,
                goal = ?,
                description = ?,
                days_count = ?
            WHERE id = ?
            AND user_id IS NULL
        `;

        const [planResult] = await conn.execute(updatePlan, [
            workout.name,
            workout.level,
            workout.location,
            workout.goal,
            workout.description,
            workout.days_count,
            planId
        ]);

        if (planResult.affectedRows === 0) {
            await conn.rollback();
            return 0;
        }

        const selectDays = `
            SELECT id
            FROM workout_days
            WHERE plan_id = ?
        `;

        const [oldDays] = await conn.execute(selectDays, [planId]);

        for (const oldDay of oldDays) {
            const deleteExercises = `
                DELETE FROM day_exercises
                WHERE day_id = ?
            `;

            await conn.execute(deleteExercises, [oldDay.id]);
        }

        const deleteDays = `
            DELETE FROM workout_days
            WHERE plan_id = ?
        `;

        await conn.execute(deleteDays, [planId]);

        for (const day of workout.days) {
            const insertDay = `
                INSERT INTO workout_days
                (plan_id, day_number, name, isRestDay, image_url)
                VALUES (?, ?, ?, ?, ?)
            `;

            const [dayResult] = await conn.execute(insertDay, [
                planId,
                day.dayNumber,
                day.name,
                day.restDay,
                null
            ]);

            const dayId = dayResult.insertId;

            if (!day.restDay) {
                for (const exercise of day.exercises) {
                    const insertExercise = `
                        INSERT INTO day_exercises
                        (day_id, exercise_id, exercise_order)
                        VALUES (?, ?, ?)
                    `;

                    await conn.execute(insertExercise, [
                        dayId,
                        exercise.exerciseId,
                        exercise.order
                    ]);
                }
            }
        }

        await conn.commit();
        return planResult.affectedRows;

    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
}
async function deleteAdminPlan(planId) {
    const sql = 'DELETE FROM workout_plans WHERE id = ?';
    const [rows] = await pool.execute(sql, [planId]);
    return rows.affectedRows;
}
// ----
// LOG
// ----

// log by id
async function log_id(id, action, desc, ip) {
    const userName = 'SELECT username FROM users WHERE id = ?';
    const insert = 'INSERT INTO logs(user_id, username, action, description, ip_address) VALUES (?,?,?,?,?)';
    const [nameResult] = await pool.execute(userName, [id]);
    const [result] = await pool.execute(insert, [id, nameResult[0].username, action, desc, ip]);
    return result.insertId;
}
// log by email
async function log_email(email, action, desc, ip) {
    const userName = 'SELECT id, username FROM users WHERE email = ?';
    const insert = 'INSERT INTO logs(user_id, username, action, description, ip_address) VALUES (?,?,?,?,?)';
    const [nameResult] = await pool.execute(userName, [email]);
    const [result] = await pool.execute(insert, [nameResult[0].id, nameResult[0].username, action, desc, ip]);
    return result.insertId;
}
//log server failure
async function log_error(action, desc, ip) {
    const insert = 'INSERT INTO logs(action, description,type, ip_address) VALUES (?,?,?,?)';
    const [result] = await pool.execute(insert, [action, desc, 'error',ip]);
    return result.insertId;
}


// ----
// STATS 
// ----

async function finalizeWorkoutStats(userId, logId) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // log betoltese es ellenorzese
        const [logRows] = await connection.execute(
            `SELECT 
                status, 
                DATE_FORMAT(workout_date, '%Y-%m-%d') AS workout_date
            FROM workout_calendar_logs 
            WHERE id = ? AND user_id = ?`,
            [logId, userId]
        );

        if (logRows.length === 0) {
            throw new Error("Edzés nem található!");
        }
        if (logRows[0].status === 'completed') {
            throw new Error("Ez az edzés már véglegesítve lett (duplikáció védelem)!");
        }

        const formattedWorkoutDate = logRows[0].workout_date;

        // edzes lezarasa  és időtartam kiszámolása. 
        await connection.execute(
            "UPDATE workout_calendar_logs SET status = 'completed', workout_time_sec = TIMESTAMPDIFF(SECOND, start_time, NOW()) WHERE id = ?",
            [logId]
        );

        // lekerjuk a logbol a friss workout_time_sec adatot
        const [timeRows] = await connection.execute('SELECT workout_time_sec FROM workout_calendar_logs WHERE id = ?', [logId]);
        const workoutTimeSec = timeRows.length > 0 ? (timeRows[0].workout_time_sec || 0) : 0;

        // mentett szettek beolvasasa (workout_calendar_sets + exercises.muscle_group)
        const [sets] = await connection.execute(`
            SELECT 
                s.id as set_id, 
                s.weight_done AS weight,
                s.reps_done AS reps,
                e.id as exercise_id, 
                e.muscle_group 
            FROM workout_calendar_sets s
            JOIN workout_calendar_exercises ce ON s.workout_calendar_exercise_id = ce.id
            JOIN exercises e ON ce.exercise_id = e.id
            WHERE ce.workout_calendar_log_id = ?
        `, [logId]);

        // valtozok inicializalasa
        let workoutTotalVolume = 0;
        let totalSets = sets.length;
        let totalReps = 0;
        let prCount = 0;
        
        // izomcsoportonkénti volumen gyűjtése + gyakorlatonkénti PR adatok
        const muscleVolume = {};
        const exerciseStats = {};

        for (const set of sets) {
            const exerciseId = set.exercise_id;
            const weightDone = Number(set.weight) || 0;
            const repsDone = Number(set.reps) || 0;
            const setVolume = weightDone * repsDone;

            workoutTotalVolume += setVolume;
            totalReps += repsDone;

            const muscle = set.muscle_group;
            if (!muscleVolume[muscle]) muscleVolume[muscle] = 0;
            muscleVolume[muscle] += setVolume;

            if (!exerciseStats[exerciseId]) {
                exerciseStats[exerciseId] = {
                    maxWeight: 0,
                    maxWeightReps: 0,
                    bestVolume: 0
                };
            }

            if (weightDone > exerciseStats[exerciseId].maxWeight) {
                exerciseStats[exerciseId].maxWeight = weightDone;
                exerciseStats[exerciseId].maxWeightReps = repsDone;
            }

            if (setVolume > exerciseStats[exerciseId].bestVolume) {
                exerciseStats[exerciseId].bestVolume = setVolume;
            }
        }

        for (const exerciseId in exerciseStats) {
            const exercise = exerciseStats[exerciseId];

            const [prRows] = await connection.execute(
                'SELECT max_weight, best_volume FROM user_exercise_prs WHERE user_id = ? AND exercise_id = ?',
                [userId, exerciseId]
            );

            let isPrBroken = false;

            if (prRows.length === 0) {
                await connection.execute(
                    `INSERT INTO user_exercise_prs 
                    (user_id, exercise_id, max_weight, max_weight_reps, best_volume, achieved_at) 
                    VALUES (?, ?, ?, ?, ?, NOW())`,
                    [
                        userId,
                        exerciseId,
                        exercise.maxWeight,
                        exercise.maxWeightReps,
                        exercise.bestVolume
                    ]
                );

                isPrBroken = true;
            } else {
                const currentMaxWeight = Number(prRows[0].max_weight) || 0;
                const currentBestVolume = Number(prRows[0].best_volume) || 0;

                const updates = [];
                const params = [];

                if (exercise.maxWeight > currentMaxWeight) {
                    updates.push('max_weight = ?, max_weight_reps = ?');
                    params.push(exercise.maxWeight, exercise.maxWeightReps);
                    isPrBroken = true;
                }

                if (exercise.bestVolume > currentBestVolume) {
                    updates.push('best_volume = ?');
                    params.push(exercise.bestVolume);
                    isPrBroken = true;
                }

                if (updates.length > 0) {
                    updates.push('achieved_at = NOW()');
                    params.push(userId, exerciseId);

                    await connection.execute(
                        `UPDATE user_exercise_prs 
                        SET ${updates.join(', ')} 
                        WHERE user_id = ? AND exercise_id = ?`,
                        params
                    );
                }
            }

            if (isPrBroken) {
                prCount++;
            }
        }

        // xp
        const workoutXp = Math.floor(workoutTotalVolume / 10);

        // napi statisztika frissítése
        const [dailyRows] = await connection.execute(
            'SELECT user_id FROM user_daily_stats WHERE user_id = ? AND stat_date = ?',
            [userId, formattedWorkoutDate]
        );

        if (dailyRows.length === 0) {
            await connection.execute(`
                INSERT INTO user_daily_stats (
                    user_id,
                    stat_date,
                    completed_workouts,
                    total_volume,
                    total_sets,
                    total_reps,
                    total_workout_time_sec,
                    xp_gained,
                    prs_achieved
                ) VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?)
            `, [
                Number(userId),
                formattedWorkoutDate,
                Number(workoutTotalVolume.toFixed(2)),
                Number(totalSets),
                Number(totalReps),
                Number(workoutTimeSec),
                Number(workoutXp),
                Number(prCount)
            ]);
        } else {
            await connection.execute(`
                UPDATE user_daily_stats SET
                    completed_workouts = completed_workouts + 1,
                    total_volume = total_volume + ?,
                    total_sets = total_sets + ?,
                    total_reps = total_reps + ?,
                    total_workout_time_sec = total_workout_time_sec + ?,
                    xp_gained = xp_gained + ?,
                    prs_achieved = prs_achieved + ?
                WHERE user_id = ?
                AND stat_date = ?
            `, [
                Number(workoutTotalVolume.toFixed(2)),
                Number(totalSets),
                Number(totalReps),
                Number(workoutTimeSec),
                Number(workoutXp),
                Number(prCount),
                Number(userId),
                formattedWorkoutDate
            ]);
        }
        
        // xp frissites
        const [globalXpRows] = await connection.execute('SELECT xp FROM user_global_xp WHERE user_id = ?', [userId]);
        if (globalXpRows.length === 0) {
            await connection.execute('INSERT INTO user_global_xp (user_id, xp) VALUES (?, ?)', [userId, workoutXp]);
        } else {
            await connection.execute('UPDATE user_global_xp SET xp = xp + ? WHERE user_id = ?', [workoutXp, userId]);
        }

        // izomcsoportonkent xp
        for (const [muscle, volume] of Object.entries(muscleVolume)) {
            const muscleXpAmount = Math.floor(volume / 10);
            const [mXpRows] = await connection.execute('SELECT xp FROM user_muscle_xp WHERE user_id = ? AND muscle_group = ?', [userId, muscle]);
            
            if (mXpRows.length === 0) {
                await connection.execute('INSERT INTO user_muscle_xp (user_id, muscle_group, xp) VALUES (?, ?, ?)', [userId, muscle, muscleXpAmount]);
            } else {
                await connection.execute('UPDATE user_muscle_xp SET xp = xp + ? WHERE user_id = ? AND muscle_group = ?', [muscleXpAmount, userId, muscle]);
            }
        }

        // --- user_stats frissitese ---
        console.log(`[FINALIZE] Frissítem a user_stats táblát a user_id: ${userId} számára...`);
        const [statsRows] = await connection.execute('SELECT * FROM user_stats WHERE user_id = ?', [userId]);
        
        if (statsRows.length === 0) {
            console.log(`[FINALIZE] Nem volt még user_stats, új sor beszúrása...`);
            await connection.execute(`
                INSERT INTO user_stats (
                    user_id, completed_workouts, total_volume, total_sets, total_reps, 
                    pr_count, total_workout_time_sec
                ) VALUES (?, 1, ?, ?, ?, ?, ?)`,
                [
                    Number(userId), 
                    Number(workoutTotalVolume.toFixed(2)), 
                    Number(totalSets), 
                    Number(totalReps), 
                    Number(prCount), 
                    Number(workoutTimeSec)
                ]
            );
            console.log(`[FINALIZE] Új user_stats sikeresen beszúrva!`);
        } else {
            console.log(`[FINALIZE] Már van user_stats, frissítés.`);
            await connection.execute(`
                UPDATE user_stats SET 
                    completed_workouts = completed_workouts + 1,
                    total_volume = total_volume + ?,
                    total_sets = total_sets + ?,
                    total_reps = total_reps + ?,
                    pr_count = pr_count + ?,
                    total_workout_time_sec = total_workout_time_sec + ?
                WHERE user_id = ?
            `, [
                Number(workoutTotalVolume.toFixed(2)), 
                Number(totalSets), 
                Number(totalReps), 
                Number(prCount), 
                Number(workoutTimeSec), 
                Number(userId)
            ]);
            console.log(`[FINALIZE] user_stats sikeresen frissítve!`);
        }

        await connection.commit();
        console.log(`[FINALIZE] Tranzakció sikeresen kommitálva!`);
        
        return {
            success: true,
            workout_xp: workoutXp,
            workout_total_volume: workoutTotalVolume,
            is_new_pr: prCount > 0
        };

    } catch (error) {
        console.error(`[FINALIZE ERROR] Hiba történt a véglegesítés során:`, error);
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

//!Export
module.exports = {
    pool,
    selectall,
    registration_insert,
    username_exist,
    email_exist,
    log_id,
    log_email,
    findUser,
    getUsernameById,
    registComp,
    ifAdmin,
    insertPreferences,
    insertWeight,
    updateRegistered,
    getUserBasicData,
    getUserPreferencesData,
    getUserWeightData,
    updateUserBasic,
    updateUserPreferences,
    getUserPassword,
    updateUserPassword,
    allExercises,
    exerciseExist,
    createWorkoutPlan,
    createWorkoutDay,
    createDayExercise,
    allUserPlans,
    getWorkoutPlanDetails,
    deletePlan,
    updateWorkoutPlanDays,
    selectUpdatePlan,
    allDefaultPlans,
    getDefaultWorkoutPlanDetails,
    getActive,
    updateActive,
    //isAdminCheck,
    save_token,
    delete_tokens,
    token_expire_del,
    find_token,
    update_password,
    set_used,
    log_error,
    updateActiveNull,
    calendarUpToDate,
    getUserCalendar,
    getCalendarSets,
    saveCalendarSets,
    updateWorkoutCalendarLogStatus,
    startWorkoutCalendarLogStatus,
    finishWorkoutCalendarLogStatus,
    postponeWorkoutCalendarLog,
    findTicketEmail,
    findPreId,
    createTicket,
    limitTicketCreation,
    allUserTickets,
    todayRegistration,
    totalUserCount,
    todayLoginCount,
    todayTicketCount,
    todayErrorCount,
    todayWorkoutCount,
    allTickets,
    validateTicketId,
    ticketSeen,
    ticketsSeen,
    ticketClose,
    ticketAnswer,
    ticketAdminReplyCheck,
    allUserBasicData,
    userAllData,
    userAdmin,
    userBlock,
    userDelete,
    userChangeEmail,
    userChangeUsername,
    checkIfActive,
    allFoods,
    foodApproved,
    deleteFood,
    createFood,
    insertFoodAllergen,
    getAllDefaultPlans,
    getAllUsersPlans,
    createAdminWorkoutPlan,
    updateAdminWorkoutPlan,
    deleteAdminPlan,
    selectCurrentAdminStatus,
    saveUserMetrics,
    getUserGlobalXp,
    getUserMuscleXp,
    getUserDailyStatsLast30Days,
    getUserFullStats,
    getUserExercisePrs,
    getUserWeights,
    getAllExercisesForStats,
    getUserMetrics,
    finalizeWorkoutStats,
    createUserFood,
    deleteUserFood,
    createShareTicket
};
