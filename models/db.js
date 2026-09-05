const mysql = require("mysql2");

const database = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "pycards"
});

database.connect((error) => {
    if (error) {
        console.error("Database connection failed: ", error);
        return;
    }
    console.log("Database connected");
});

module.exports = database;