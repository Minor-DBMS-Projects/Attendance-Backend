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
        let sql = 'CREATE TABLE IF NOT EXISTS subject (code varchar(16), name varchar(64), year INT, part INT, PRIMARY KEY(code))';
        this.query(sql).then(() => {
            sql = 'CREATE TABLE IF NOT EXISTS instructor (id varchar(64), name varchar(64), PRIMARY KEY(id))';
            return this.query(sql);
        })
            .then(() => {
                sql = 'CREATE TABLE IF NOT EXISTS authentication (value varchar(255))';
                return this.query(sql);
            })
            .then(() => {
                sql = 'CREATE TABLE IF NOT EXISTS user (id INT primary key NOT NULL AUTO_INCREMENT, username varchar(255), code varchar(255), password varchar(255), type varchar(255))';
                return this.query(sql);
            })

            .then(() => {
                sql = 'CREATE TABLE IF NOT EXISTS class (id varchar(64), PRIMARY KEY(id))'
                return this.query(sql);
            })
            .then(() => {
                sql = `CREATE TABLE IF NOT EXISTS student (roll_no varchar(16), name varchar(64), class_id varchar(64), PRIMARY KEY(roll_no),
                        FOREIGN KEY(class_id) REFERENCES class(id))`;
                return this.query(sql);
            })
            .then(() => {
                sql = 'CREATE TABLE IF NOT EXISTS attendance (student_id varchar(16), subject_code varchar(16), class_id varchar(64), attendance_date DATE, instructor_id varchar(64), present char, UNIQUE KEY(student_id, attendance_date, subject_code, instructor_id))';
                return this.query(sql);
            }).then(() => {
                sql = `ALTER TABLE attendance
                              ADD FOREIGN KEY(student_id) REFERENCES student(roll_no),
                              ADD FOREIGN KEY(subject_code) REFERENCES subject(code),
                              ADD FOREIGN KEY(instructor_id) REFERENCES instructor(id),
                              ADD FOREIGN KEY(class_id) REFERENCES class(id)
                              `;
                this.query(sql);
            })
            .catch(err => {
                console.log(err);
            })






    }
}

let database = new Database();

module.exports = database;

