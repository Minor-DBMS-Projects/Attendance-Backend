let express = require('express');
let db = require("../../config.js/dataconn");
let router = express.Router();
let { auth } = require('../../config.js/usercheck');

router.get('/:classId', (req, res, next) => {
    const { classId } = req.params;
    let sql = `SELECT subject.code as subjectCode,
               subject.name as subject,
               year, part,
               instructor.name as instructor
               from 
               (SELECT DISTINCT class_id, instructor_id, subject_code from attendance where class_id = "${classId}") as c 
               join subject on c.subject_code = code
               join instructor on instructor_id = instructor.id`

    db.query(sql)
        .then(rows => {
            res.status(200).json(
                rows
            );
            return rows;
        })
        .catch(next)

});

router.get('/single/:instructorId', (req, res, next) => {
    const { instructorId } = req.params;
    let sql = ` SELECT subject_code as subjectCode,
              name as subject,
              class_id as class,
              year,
              part from subject join 
              (SELECT DISTINCT subject_code, class_id from attendance 
                where instructor_id = "${instructorId}") as s on subject.code = subject_code`;

    db.query(sql)
        .then(rows => {
            res.status(200).json(
                rows
            );
            return rows;
        })
        .catch(next)

});



module.exports = router;