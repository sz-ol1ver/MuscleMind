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
    updateActiveNull,
    calendarUpToDate,
    getUserCalendar,
    getCalendarSets,
    saveCalendarSets,
    updateWorkoutCalendarLogStatus,
    startWorkoutCalendarLogStatus,
    finishWorkoutCalendarLogStatus,
    postponeWorkoutCalendarLog
};
