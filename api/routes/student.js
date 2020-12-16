let express = require("express");
const db = require("./database");
const { auth } = require('../../configurations/usercheck');
let router = express.Router();


router.post('/namelist', auth, async(req, res, next)=>
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

  let q= `select* from student JOIN class on student.class_id=class.id where class.id =${classId};`
  try{
  let students= await db.query(q);
  res.json({
    classes: [classDetails],
    subjects: [subject],
    students: students
  });
  }
  catch(err){
    res.status(402).send("not found");
  }   

});


module.exports = router;