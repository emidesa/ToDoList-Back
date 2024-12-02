const mysql = require('mysql2/promise');

const connexion = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "task_manager",
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = connexion;

