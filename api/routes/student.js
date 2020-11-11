let express = require('express');
let db = require("../../config.js/dataconn");
let router = express.Router();
let { auth } = require('../../config.js/usercheck');
let { admin } = require('../../config.js/usercheck');

router.get('/:rollNo', (req, res, err) => {
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

        }).catch(err);
});


router.post('/namelist', auth, (req, res, next)=>
{
  batch=req.body.batch.toString();
  classId=parseInt(req.body.classid);
  program= req.body.program.toString();
  section= req.body.section.toString();
  subjectCode=req.body.subjectcode.toString();
  subject=req.body.subject.toString();
  classType=req.body.type.toString();
  
  var subject={code:subjectCode, subject:subject};
  var classDetails={class:batch+program, id:classId, classType:classType, class_group:section}

 


  
    let q3= `select* from student JOIN class on student.class_id=class.id where class.id =${classId};`
    db.query(q3, (err, students)=>
    {
      if (err)
      console.log("could not get students")
      else
      {
  
     
      res.render('namelist', {'classes':[classDetails], 'subjects':[subject], 'students':students});
      }
    })
    
 
    
 

});


module.exports = router;