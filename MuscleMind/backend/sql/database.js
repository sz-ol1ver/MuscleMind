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

async function registration_insert(fN, lN, uN, eM, p) {
    const insert = 'INSERT INTO users(first_name, last_name,username, email, password_hash) VALUES (?,?,?,?,?)';
    const [result] = await pool.execute(insert, [fN, lN, uN, eM, p]);
    return result;
}
//!Export
module.exports = {
    selectall,
    registration_insert
};
