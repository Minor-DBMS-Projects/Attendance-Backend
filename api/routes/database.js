let mysql = require('mysql');

let { databaseConfig } = require('../../configs');

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

    query(sql) {
        return new Promise((resolve, reject) => {
            this.pool.query(sql, (err, rows) => {
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

    createTable() {
        /* Create Table */
       
       

        let sql= 'CREATE TABLE IF NOT EXISTS department (id varchar(16) primary key , name varchar(255))';
        this.query(sql).then(() => {
            sql = 'CREATE TABLE IF NOT EXISTS program (id varchar(16) primary key, name varchar(64), department_id varchar(16),FOREIGN KEY(department_id) REFERENCES department(id))';
            return this.query(sql);
        })
        .then(() => {
            sql = 'CREATE TABLE IF NOT EXISTS instructor (id INT UNIQUE KEY AUTO_INCREMENT NOT NULL, code  varchar(16), name varchar(64), PRIMARY KEY(code), password varchar(255), department_id varchar(16),FOREIGN KEY(department_id) REFERENCES department(id))';
            return this.query(sql);
        })

        .then(() => {
            sql = 'CREATE TABLE IF NOT EXISTS subject (code varchar(16),PRIMARY KEY(code), name varchar(64), year INT, part INT, program_id varchar(16),FOREIGN KEY(program_id) REFERENCES program(id))';
            return this.query(sql);
        })
            .then(() => {
                sql = 'CREATE TABLE IF NOT EXISTS authentication (value varchar(255))';
                return this.query(sql);
            })
            .then(() => {
                sql = 'CREATE TABLE IF NOT EXISTS class (id INT PRIMARY KEY AUTO_INCREMENT NOT NULL, batch varchar(16), class_group varchar(16),program_id varchar(16), UNIQUE KEY (batch, program_id, class_group), FOREIGN KEY (program_id) REFERENCES program(id))';
                return this.query(sql);
            })
           

            .then(() => {
                sql = 'CREATE TABLE IF NOT EXISTS student (roll_no varchar(16), name varchar(64),class_id INT,  FOREIGN KEY(class_id) REFERENCES class(id), UNIQUE KEY (roll_no, class_id))';
                return this.query(sql);
            })
            .then(() => {
                sql = 'CREATE TABLE IF NOT EXISTS attendanceDetails (id INT PRIMARY KEY AUTO_INCREMENT NOT NULL, classType varchar(16), subject_code varchar(16), class_id INT, attendance_date DATE, instructor_id INT )';
                return this.query(sql);
            }).then(() => {
                sql = 'CREATE TABLE IF NOT EXISTS attendance(details_id INT ,roll_no varchar(16))';
                return this.query(sql);
            }).then(() => {
                sql = `ALTER TABLE attendance
                              ADD FOREIGN KEY(details_id) REFERENCES attendanceDetails(id)
                              `;
                 return this.query(sql);
                 
                })
            
            .then(() => {
                sql = `ALTER TABLE attendanceDetails
                              ADD FOREIGN KEY(subject_code) REFERENCES subject(code),
                              ADD FOREIGN KEY(instructor_id) REFERENCES instructor(id),
                              ADD FOREIGN KEY(class_id) REFERENCES class(id)
                              `;
                 return this.query(sql);
                 
                })
                .catch(err => {
                    console.log(err);
                })




    }
}

let database = new Database();

module.exports = database;

