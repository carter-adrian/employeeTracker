require('dotenv').config();
const mysql2 = require('mysql2');
const inquier = require('inquirer');
const cTable = require('console.table');
const figlet = require('figlet');

const connection = mysql2.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: process.env.DB_PW,
  database: 'employee_DB',
});

// Connect to the DB
connection.connect((err) => {
  if (err) throw err;
  console.log(`connected as id ${connection.threadId}\n`);
  figlet('Employee tracker', function(err, data) {
    if (err) {
      console.log('ascii art not loaded');
      return 
    } else {
      console.log(data);
    }  
    startPrompt();
  });
});

function startPrompt() {
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
  })
  .catch(err => {
    console.error(err);
  });
}


const viewAll = (table) => {
  // const query = `SELECT * FROM ${table}`;
  let query;
  if (table === "DEPARTMENT") {
    query = `SELECT * FROM DEPARTMENT`;
  } else if (table === "ROLE") {
    query = `SELECT R.id AS id, title, salary, D.name AS department
    FROM ROLE AS R LEFT JOIN DEPARTMENT AS D
    ON R.department_id = D.id;`;
  } else {//employee
    query = `SELECT E.id AS id, E.first_name AS first_name, E.last_name AS last_name, 
    R.title AS role, D.name AS department, CONCAT(M.first_name, " ", M.last_name) AS manager
    FROM EMPLOYEE AS E LEFT JOIN ROLE AS R ON E.role_id = R.id
    LEFT JOIN DEPARTMENT AS D ON R.department_id = D.id
    LEFT JOIN EMPLOYEE AS M ON E.manager_id = M.id;`;

  }
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);

    startPrompt();
  });
};

const addNewDepartment = () => {
    let questions = [
        {
            type: 'input',
            name: 'name',
            message: 'what is the new department name?'
        }
    ];

    inquier.prompt(questions)
    .then(response => {
      const query = `INSERT INTO department (name) VALUES (?)`;
      connection.query(query, [response.name], (err, res) => {
        if (err) throw err;
        console.log(`Successfully inserted ${response.name} department at id ${res.insertId}`);
        startPrompt();
      });
    })
    .catch(err => {
      console.error(err);
    });
  }

  const addNewRole = () => {
    //get the list of all department with department_id to make the choices object list for prompt question
    const departments = [];
    connection.query("SELECT * FROM DEPARTMENT", (err, res) => {
      if (err) throw err;
  
      res.forEach(dep => {
        let qObj = {
          name: dep.name,
          value: dep.id
        }
        departments.push(qObj);
      });
  
      //question list to get arguments for making new roles
      let questions = [
        {
          type: "input",
          name: "title",
          message: "what is the title of the new role?"
        },
        {
          type: "input",
          name: "salary",
          message: "what is the salary of the new role?"
        },
        {
          type: "list",
          name: "department",
          choices: departments,
          message: "which department is this role in?"
        }
      ];
  
      inquier.prompt(questions)
      .then(response => {
        const query = `INSERT INTO ROLE (title, salary, department_id) VALUES (?)`;
        connection.query(query, [[response.title, response.salary, response.department]], (err, res) => {
          if (err) throw err;
          console.log(`Successfully inserted ${response.title} role at id ${res.insertId}`);
          startPrompt();
        });
      })
      .catch(err => {
        console.error(err);
      });
    });
  }
  
  const addNewEmployee = () => {
    //get all the employee list to make choice of employee's manager
    connection.query("SELECT * FROM EMPLOYEE", (err, emplRes) => {
      if (err) throw err;
      const employeeChoice = [
        {
          name: 'None',
          value: 0
        }
      ]; //an employee could have no manager
      emplRes.forEach(({ first_name, last_name, id }) => {
        employeeChoice.push({
          name: first_name + " " + last_name,
          value: id
        });
      });
      
      //get all the role list to make choice of employee's role
      connection.query("SELECT * FROM ROLE", (err, rolRes) => {
        if (err) throw err;
        const roleChoice = [];
        rolRes.forEach(({ title, id }) => {
          roleChoice.push({
            name: title,
            value: id
            });
          });
       
        let questions = [
          {
            type: "input",
            name: "first_name",
            message: "what is the employee's first name?"
          },
          {
            type: "input",
            name: "last_name",
            message: "what is the employee's last name?"
          },
          {
            type: "list",
            name: "role_id",
            choices: roleChoice,
            message: "what is the employee's role?"
          },
          {
            type: "list",
            name: "manager_id",
            choices: employeeChoice,
            message: "who is the employee's manager? (could be null)"
          }
        ]
    
        inquier.prompt(questions)
          .then(response => {
            const query = `INSERT INTO EMPLOYEE (first_name, last_name, role_id, manager_id) VALUES (?)`;
            let manager_id = response.manager_id !== 0? response.manager_id: null;
            connection.query(query, [[response.first_name, response.last_name, response.role_id, manager_id]], (err, res) => {
              if (err) throw err;
              console.log(`successfully inserted employee ${response.first_name} ${response.last_name} with id ${res.insertId}`);
              startPrompt();
            });
          })
          .catch(err => {
            console.error(err);
          });
      })
    });
  }