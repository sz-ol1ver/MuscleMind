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
    const query = 'SELECT age, height, gender, goal, experience_level, training_days, training_location, diet_type, meals_per_day FROM user_profiles WHERE id = ?';
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
    const query = 'UPDATE user_profiles SET age = ?, height = ?, goal = ?, experience_level = ?, training_days = ?, training_location = ?, diet_type = ?, meals_per_day = ? WHERE id = ?';
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
// ADMIN
// ----
async function isAdminCheck(userId) {
    const sql = 'SELECT id FROM users WHERE id = ? AND admin = 1';
    const [rows] = await pool.execute(sql, [userId]);
    return rows;
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
    const insert = 'INSERT INTO logs(action, description,type, ip_address) VALUES (?,?,error,?)';
    const [result] = await pool.execute(insert, [action, desc, ip]);
    return result.insertId;
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
    isAdminCheck,
    save_token,
    delete_tokens,
    token_expire_del,
    find_token,
    update_password,
    set_used,
    log_error,
    updateActiveNull
};
