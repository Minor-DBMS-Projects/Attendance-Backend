const mysql = require('mysql');

const { databaseConfig } = require('../../configurations/configs');

class Database {
    constructor() {

        this.pool = mysql.createPool(databaseConfig);
        this.pool.getConnection((err, connection) => {
            if (err) {
                throw (err);
            }
            this.createTable();
        });
    }

    query(sql, values) {
        return new Promise((resolve, reject) => {
            this.pool.query(sql,values, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            this.pool.end(err => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
    }

    async createTable() {
        /* Create Table */

        const sql0 = 'CREATE TABLE IF NOT EXISTS department (id varchar(16) primary key , name varchar(255))';
        const sql1 = 'CREATE TABLE IF NOT EXISTS program (id varchar(16) primary key, name varchar(64), department_id varchar(16),FOREIGN KEY(department_id) REFERENCES department(id))';
        const sql2 = 'CREATE TABLE IF NOT EXISTS instructor (id INT UNIQUE KEY AUTO_INCREMENT NOT NULL, code  varchar(16), name varchar(64), PRIMARY KEY(code), password varchar(255), department_id varchar(16),FOREIGN KEY(department_id) REFERENCES department(id))';
        const sql3 = 'CREATE TABLE IF NOT EXISTS subject (code varchar(16),PRIMARY KEY(code), name varchar(64), year INT, part INT, program_id varchar(16),FOREIGN KEY(program_id) REFERENCES program(id))';
        const sql4 = 'CREATE TABLE IF NOT EXISTS authentication (value varchar(255))';
        const sql5 = 'CREATE TABLE IF NOT EXISTS class (id INT PRIMARY KEY AUTO_INCREMENT NOT NULL, batch varchar(16), class_group varchar(16),program_id varchar(16), UNIQUE KEY (batch, program_id, class_group), FOREIGN KEY (program_id) REFERENCES program(id))';
        const sql6 = 'CREATE TABLE IF NOT EXISTS student (roll_no varchar(16), name varchar(64),class_id INT,  FOREIGN KEY(class_id) REFERENCES class(id), UNIQUE KEY (roll_no, class_id))';
        const sql7 = 'CREATE TABLE IF NOT EXISTS attendanceDetails (id INT PRIMARY KEY AUTO_INCREMENT NOT NULL, classType varchar(16), subject_code varchar(16), class_id INT, attendance_date DATE, instructor_id INT )';
        const sql8 = 'CREATE TABLE IF NOT EXISTS attendance(details_id INT ,roll_no varchar(16))';
        const sql9 = `ALTER TABLE attendance
        ADD FOREIGN KEY(details_id) REFERENCES attendanceDetails(id)
        `;
        const sql10 = `ALTER TABLE attendanceDetails
                          ADD FOREIGN KEY(subject_code) REFERENCES subject(code),
                          ADD FOREIGN KEY(instructor_id) REFERENCES instructor(id),
                          ADD FOREIGN KEY(class_id) REFERENCES class(id)
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
        }
        catch (err) {
            console.log(err)
        }

    }
}

let database = new Database();

module.exports= database;

