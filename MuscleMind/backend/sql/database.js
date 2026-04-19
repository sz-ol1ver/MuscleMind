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
async function updateActive(userId,plan) {
    const sql = 'UPDATE users SET active_plan = ? WHERE id = ?';
    const [rows] = await pool.execute(sql, [plan, userId]);
    return rows.affectedRows;
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
    const sql = 'SELECT * FROM support_requests ORDER BY created_at DESC';
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
    //isAdminCheck,
    save_token,
    delete_tokens,
    token_expire_del,
    find_token,
    update_password,
    set_used,
    log_error,
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
    ticketAdminReplyCheck
};
