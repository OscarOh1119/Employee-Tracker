import inquirer from 'inquirer';
import { pool, connectToDb } from './connection.js';

(async () => {
  try {
    await connectToDb();

    const promptAction = async () => {
      try {
        const { selectedAction } = await inquirer.prompt([
          {
            type: 'list',
            name: 'selectedAction',
            message: 'What would you like to do?',
            choices: [
              'View All Employees',
              'Add Employee',
              'Update Employee Role',
              'View All Roles',
              'Add Role',
              'View All Departments',
              'Add Department',
              'Quit'
            ]
          }
        ]);

        switch (selectedAction) {
          case 'View All Employees':
            await displayAllEmployees();
            break;
          case 'Add Employee':
            await createEmployee();
            break;
          case 'Update Employee Role':
            await changeEmployeeRole();
            break;
          case 'View All Roles':
            await displayAllRoles();
            break;
          case 'Add Role':
            await createRole();
            break;
          case 'View All Departments':
            await displayAllDepartments();
            break;
          case 'Add Department':
            await createDepartment();
            break;
          case 'Quit':
            await pool.end();
            console.log("Database connection closed.");
            process.exit(0);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Error processing selection:', error.message);
        } else {
          console.error('Unknown error occurred');
        }
        promptAction();
      }
    };

    const displayAllEmployees = async () => {
      try {
        const sql = `
          SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, 
                 CONCAT(manager.first_name, ' ', manager.last_name) AS manager
          FROM employee
          JOIN role ON employee.role_id = role.id
          JOIN department ON role.department_id = department.id
          LEFT JOIN employee AS manager ON employee.manager_id = manager.id;
        `;
        const result = await pool.query(sql);
        console.log(result);
        console.table(result.rows);
        promptAction();
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Error retrieving employees:', error.message);
        } else {
          console.error('Unknown error occurred');
        }
        promptAction();
      }
    };

    const createEmployee = async () => {
      try {
        const roleResults = await pool.query('SELECT * FROM role;');
        const roleChoices = roleResults.rows.map(role => ({ name: role.title, value: role.id }));

        const employeeResults = await pool.query('SELECT * FROM employee;');
        const managerChoices = employeeResults.rows.map(employee => ({
          name: `${employee.first_name} ${employee.last_name}`,
          value: employee.id
        }));
        managerChoices.unshift({ name: 'None', value: null });

        const employeeData = await inquirer.prompt([
          {
            type: 'input',
            name: 'employeeFirstName',
            message: "What is the employee's first name?"
          },
          {
            type: 'input',
            name: 'employeeLastName',
            message: "What is the employee's last name?"
          },
          {
            type: 'list',
            name: 'employeeRole',
            message: "What is the employee's role?",
            choices: roleChoices
          },
          {
            type: 'list',
            name: 'employeeManager',
            message: "Who is the employee's manager?",
            choices: managerChoices
          }
        ]);

        const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)`;
        await pool.query(sql, [employeeData.employeeFirstName, employeeData.employeeLastName, employeeData.employeeRole, employeeData.employeeManager]);
        console.log(`${employeeData.employeeFirstName} ${employeeData.employeeLastName} added to the database.`);
        promptAction();
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Error adding employee:', error.message);
        } else {
          console.error('Unknown error occurred');
        }
        promptAction();
      }
    };

    const changeEmployeeRole = async () => {
      try {
        const employeeResults = await pool.query('SELECT * FROM employee;');
        const employeeChoices = employeeResults.rows.map(employee => ({
          name: `${employee.first_name} ${employee.last_name}`,
          value: employee.id
        }));

        const roleResults = await pool.query('SELECT * FROM role;');
        const roleChoices = roleResults.rows.map(role => ({ name: role.title, value: role.id }));

        const roleUpdateData = await inquirer.prompt([
          {
            type: 'list',
            name: 'selectedEmployee',
            message: "Which employee's role do you want to update?",
            choices: employeeChoices
          },
          {
            type: 'list',
            name: 'newRole',
            message: "Which role do you want to assign to the selected employee?",
            choices: roleChoices
          }
        ]);

        const sql = 'UPDATE employee SET role_id = $1 WHERE id = $2';
        await pool.query(sql, [roleUpdateData.newRole, roleUpdateData.selectedEmployee]);
        console.log(`Updated employee's role.`);
        promptAction();
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Error updating employee role:', error.message);
        } else {
          console.error('Unknown error occurred');
        }
        promptAction();
      }
    };

    const displayAllRoles = async () => {
      try {
        const sql = 'SELECT role.id, role.title, department.name AS department, role.salary FROM role JOIN department ON department.id = role.department_id;';
        const result = await pool.query(sql);
        console.table(result.rows);
        promptAction();
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Error retrieving roles:', error.message);
        } else {
          console.error('Unknown error occurred');
        }
        promptAction();
      }
    };

    const createRole = async () => {
      try {
        const departmentResults = await pool.query('SELECT * FROM department;');
        const departmentChoices = departmentResults.rows.map(department => ({ name: department.name, value: department.id }));

        const roleData = await inquirer.prompt([
          {
            type: 'input',
            name: 'roleTitle',
            message: 'What is the name of the role?'
          },
          {
            type: 'input',
            name: 'roleSalary',
            message: 'What is the salary for the role?',
            validate: value => !isNaN(value) ? true : 'Please enter a valid number'
          },
          {
            type: 'list',
            name: 'roleDepartment',
            message: 'Which department does this role belong to?',
            choices: departmentChoices
          }
        ]);

        const sql = 'INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)';
        await pool.query(sql, [roleData.roleTitle, roleData.roleSalary, roleData.roleDepartment]);
        console.log(`Added role ${roleData.roleTitle} to the database.`);
        promptAction();
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Error adding role:', error.message);
        } else {
          console.error('Unknown error occurred');
        }
        promptAction();
      }
    };

    const displayAllDepartments = async () => {
      try {
        const sql = 'SELECT * FROM department;';
        const result = await pool.query(sql);
        console.table(result.rows);
        promptAction();
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Error retrieving departments:', error.message);
        } else {
          console.error('Unknown error occurred');
        }
        promptAction();
      }
    };

    const createDepartment = async () => {
      try {
        const { departmentName } = await inquirer.prompt([
          {
            type: 'input',
            name: 'departmentName',
            message: 'What is the name of the department?'
          }
        ]);

        const sql = 'INSERT INTO department (name) VALUES ($1)';
        await pool.query(sql, [departmentName]);
        console.log(`Added department ${departmentName} to the database.`);
        promptAction();
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Error adding department:', error.message);
        } else {
          console.error('Unknown error occurred');
        }
        promptAction();
      }
    };

    promptAction();

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error connecting to the database:', error.message);
    } else {
      console.error('Unknown error occurred');
    }
    process.exit(1);
  }
})();
