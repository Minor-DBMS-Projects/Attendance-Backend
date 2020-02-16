let express = require('express');
let db = require("../../config.js/dataconn");
let router = express.Router();
let { auth } = require('../../config.js/usercheck');
let { admin } = require('../../config.js/usercheck');

router.get('/:rollNo', (req, res, next) => {
    const rollNo = req.params.rollNo;
    let sql = ` SELECT subject.name as subject, instructor.name as instructor, year, part, present, totalDay from 
                (SELECT subject_code, instructor_id, COUNT(present) as totalDay,
                COUNT(CASE WHEN present='P' then 1 END) as present from attendance
                where student_id="${rollNo}" group by instructor_id) as s 
                join subject on s.subject_code = subject.code
                join instructor on s.instructor_id = id;`;

    db.query(sql)
        .then(row => {
            res.status(200).json(
                row
            );

        }).catch(next);
});



router.post('/namelist', (req, res, next)=>{
    
    let sql = `SELECT * from student where class_id = ?;`;
    db.query(sql,[req.body.classid],(err,result1)=>{
            
        if(err) throw err;
        else { 
            


            

    let sq2 = `SELECT * from subject where code = ?;`;
    db.query(sq2,[(req.body.subjectcode).substring(0,5)],(err,result2)=>{
        
        if(err) throw err;
        else { 
            console.log(result2)
            res.render('namelist', {'students':result1,'subject':result2})
    }

   
    })
           
    }

   
    })
});

module.exports = router;