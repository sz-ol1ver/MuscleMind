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

// ----
// LOG
// ----

// log data
async function log(id, userName, action, desc, ip) {
    const insert = 'INSERT INTO logs(user_id, username, action, description, ip_address) VALUES (?,?,?,?,?)';
    const [result] = await pool.execute(insert, [id, userName, action, desc, ip]);
    return result.insertId;
}

//!Export
module.exports = {
    selectall,
    registration_insert,
    username_exist,
    email_exist,
    log,
    findUser,
    registComp,
    ifAdmin
};
