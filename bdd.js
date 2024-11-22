const mysql = require('mysql2');


const connexion = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database:"task_manager",
    port: 3306
});

connexion.connect((err) => {
    if (err) throw err;
    console.log('Connexion à MySQL réussie');
});

module.exports = connexion;