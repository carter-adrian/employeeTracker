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
            return;
        } else {
            console.log(data);
        }
        startPrompt();
    });
});

function startPrompt();{
    const startQuestion = [{
        type: "list",
        name: "action",
        message: "what would you like to do?",
        loop: false,
        choices: ["View all employees", "View all roles", "View all departments", "add an employee", "add a role", "add a department", "update role for an employee", "update employee's manager", "view employees by manager", "delete a department", "delete a role", "delete an employee", "View the total utilized budget of a department", "quit"]
       }]


       inquier.prompt(startQuestion)
       .then(response => {
         switch (response.action) {
           case "View all employees":
             viewAll("EMPLOYEE");
             break;
           case "View all roles":
             viewAll("ROLE");
             break;
           case "View all departments":
             viewAll("DEPARTMENT");
             break;
           case "add a department":
             addNewDepartment();
             break;
           case "add a role":
             addNewRole();
             break;
           case "add an employee":
             addNewEmployee();
             break;
           case "update role for an employee":
             updateRole();
             break;
           case "view employees by manager":
             viewEmployeeByManager();
             break;
           case "update employee's manager":
             updateManager();
             break;
           case "delete a department":
             deleteDepartment();
             break;
           case "delete a role":
             deleteRole();
             break;
           case "delete an employee":
             deleteEmployee();
             break;
           case "View the total utilized budget of a department":
             viewBudget();
             break;
           default:
             connection.end();
         }
       });
}