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
    }
}
// email validation
async function email_exist(email) {
    const userN = 'SELECT id FROM users WHERE email = ?';
    const [rows] = await pool.execute(userN, [email]);
    if(rows.length>0){
        return 1;
    }
}

// user adatai session / jelszo ellenorzeshez
async function findUser(email) {
    const select = 'SELECT id,username,password_hash,admin FROM users WHERE email = ?';
    const [rows] = await pool.execute(select, [email]);
    return rows[0];
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
    }
}

//user kerdoiv adatok (insert) /without weight
async function insertPreferences(id, age, height, gender, goal, experience_level, training_days, training_location, diet_type, meals_per_day) {
    const data = 'Insert into user_profiles(id, age, height, gender, goal, experience_level, training_days, training_location, diet_type, meals_per_day) VALUES (?,?,?,?,?,?,?,?,?,?)';
    const [rows] = await pool.execute(data, [id, age, height, gender, goal, experience_level, training_days, training_location, diet_type, meals_per_day])
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
    const sql = 'SELECT id, name, days_count FROM workout_plans WHERE user_id IS NULL AND is_public = TRUE ORDER BY id DESC';
    const [rows] = await pool.execute(sql);
    return rows;
}

async function getWorkoutPlanDetails(userId, planId){
    const sql = `
        SELECT
            wp.id AS plan_id,
            wp.name AS plan_name,
            wp.days_count,
            wp.is_active,

            wd.id AS day_id,
            wd.day_number,
            wd.name AS day_name,
            wd.isRestDay,

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
            wp.is_active,

            wd.id AS day_id,
            wd.day_number,
            wd.name AS day_name,
            wd.isRestDay,

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

// ----
// LOG
// ----

// log data
async function log(id, action, desc, ip) {
    const userName = 'SELECT username FROM users WHERE id = ?';
    const insert = 'INSERT INTO logs(user_id, username, action, description, ip_address) VALUES (?,?,?,?,?)';
    const [nameResult] = await pool.execute(userName, [id]);
    const [result] = await pool.execute(insert, [id, nameResult[0].username, action, desc, ip]);
    return result.insertId;
}

//!Export
module.exports = {
    pool,
    selectall,
    registration_insert,
    username_exist,
    email_exist,
    log,
    findUser,
    registComp,
    ifAdmin,
    insertPreferences,
    insertWeight,
    updateRegistered,
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
    getDefaultWorkoutPlanDetails
};
