const mysql = require('mysql2');
const bcrypt = require("bcryptjs");
const { databaseConfig } = require('../../configurations/configs');

class Database {
   constructor() {
        this.connection = mysql.createConnection(databaseConfig)
        this.createTable();
    }
    connect() {
        return new Promise((resolve, reject) => {
            this.connection.connect((err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    query(sql, values) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, values, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }
    beginTransaction() {
        return new Promise((resolve, reject) => {
            this.connection.beginTransaction((err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    commit() {
        return new Promise((resolve, reject) => {
            this.connection.commit((err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }
    rollback(err) {
        return new Promise((resolve, reject) => {
            this.connection.rollback((err2) => {
                if (err2) return reject(err2);
                resolve(err);
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            this.connection.end(err => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
    }

    async createTable() {
        /* Create Table */

        const sql0 = 'CREATE TABLE IF NOT EXISTS department (id varchar(16) primary key , name varchar(255))';
        const sql1 = 'CREATE TABLE IF NOT EXISTS program (id varchar(16) primary key, name varchar(255), department_id varchar(16),FOREIGN KEY(department_id) REFERENCES department(id) ON DELETE CASCADE)';
        const sql2 = 'CREATE TABLE IF NOT EXISTS instructor (id INT UNIQUE KEY AUTO_INCREMENT NOT NULL, code  varchar(16), name varchar(64), PRIMARY KEY(code), password varchar(255), department_id varchar(16),FOREIGN KEY(department_id) REFERENCES department(id) ON DELETE CASCADE)';
        const sql3 = 'CREATE TABLE IF NOT EXISTS subject (code varchar(16),PRIMARY KEY(code), name varchar(64))';
        const sql4 = 'CREATE TABLE IF NOT EXISTS subjectDetails (year INT, part INT, code varchar(16),FOREIGN KEY(code) REFERENCES subject(code) , program_id varchar(16),FOREIGN KEY(program_id) REFERENCES program(id) ON DELETE CASCADE)';
        const sql5='DROP TABLE authentication'
        const sql6 = 'CREATE TABLE IF NOT EXISTS authentication (value varchar(255))';
        let salt = await bcrypt.genSalt(10);
        let pass = await bcrypt.hash(process.env.ADMIN_KEY, salt);
        const sql7=`INSERT INTO authentication (value) values ('${pass}')`;
        const sql8 = 'CREATE TABLE IF NOT EXISTS class (id INT PRIMARY KEY AUTO_INCREMENT NOT NULL, batch varchar(16), class_group varchar(16),program_id varchar(16), UNIQUE KEY (batch, program_id, class_group), FOREIGN KEY (program_id) REFERENCES program(id) ON DELETE CASCADE)';
        const sql9 = 'CREATE TABLE IF NOT EXISTS student (roll_no varchar(16), name varchar(64),class_id INT,  FOREIGN KEY(class_id) REFERENCES class(id) ON DELETE CASCADE, UNIQUE KEY (roll_no, class_id))';
        const sql10 = 'CREATE TABLE IF NOT EXISTS attendanceDetails (id INT PRIMARY KEY AUTO_INCREMENT NOT NULL, classType varchar(16), subject_code varchar(16), class_id INT, attendance_date DATE, instructor_id INT )';
        const sql11 = 'CREATE TABLE IF NOT EXISTS attendance(details_id INT ,roll_no varchar(16))';
        const sql12 = `ALTER TABLE attendance
        ADD FOREIGN KEY(details_id) REFERENCES attendanceDetails(id) ON DELETE CASCADE
        `;
        const sql13 = `ALTER TABLE attendanceDetails
                          ADD FOREIGN KEY(subject_code) REFERENCES subject(code) ON DELETE CASCADE,
                          ADD FOREIGN KEY(instructor_id) REFERENCES instructor(id) ON DELETE SET NULL,
                          ADD FOREIGN KEY(class_id) REFERENCES class(id) ON DELETE CASCADE
                          `;
                          
        try {
            await this.query(sql0)
            await this.query(sql1)
            await this.query(sql2)
            await this.query(sql3)
            await this.query(sql4)
            await this.query(sql5)
            await this.query(sql6)
            await this.query(sql7)
            await this.query(sql8)
            await this.query(sql9)
            await this.query(sql10)
            await this.query(sql11)
            await this.query(sql12)
            await this.query(sql13)

        }
        catch (err) {
            console.log(err)
        }

    }
}

let database = new Database();

module.exports = database;

