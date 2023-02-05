// Establish variables
require('dotenv').config();
const mysql2 = require('mysql2');
const inquirer = require('inquirer');
const cTable = require('console.table');
const figlet = require('figlet');

// Set up .env 
const connection = mysql2.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: process.env.DB_PW,
    database: 'employee_DB',
});

// Connect to DB
connection.connect((err) => {
    if (err) throw err;
    console.log(`Connected as id ${connection.threadId}\n`);
    figlet(`Employee Tracker`, function(err, data) {
        if (err) {
            console.log(`ascil art not loaded`);
        } else {
            console.log(`
        })
    )

