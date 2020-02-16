let express = require("express");
let db = require("../../config.js/dataconn");
let { auth } = require('../../config.js/usercheck');
let { admin } = require('../../config.js/usercheck');

let router = express.Router();

router.get('/take',auth, async (req, res, next)=>{
  let q1 = `SELECT id as class from class ;`
  let q2 = `SELECT year as year, part as part, code as code, name as subject from subject;`
  db.query(q1 , (err , classes)=>{
    if(err)
      console.log("could not get classes")
    else
  {db.query(q2 , (err , subjects)=>{
      if(err)
        console.log("could not get subjects")
      else
        console.log("Data fetched successfully")
        console.log(classes)
        console.log(subjects)
        res.render('takeAttendance', {'classes':classes,'subjects':subjects });
    })
  }})
 
});




function insertSubject(code, name, year, part) {
  let q1 = `INSERT IGNORE INTO subject (code, name, year, part) VALUES ("${code}", "${name}", "${year}", "${part}")`;
  return q1;
}

function insertInstructor(code, name) {
  let q1 = `INSERT IGNORE INTO instructor (id, name) VALUES ("${code}", "${name}")`;
  return q1;
}

function insertStudent(students, class_id) {
  let q1 = students.reduce((accumulator, currentValue) => {
    return accumulator + `("${currentValue.Roll}", "${currentValue.Name}", "${class_id}"),`;
  }, "");
  return `INSERT IGNORE INTO student (roll_no, name, class_id) VALUES ` + q1.slice(0, -1);
}


function insertClass(class_id) {
  let q1 = `INSERT IGNORE INTO class (id) VALUES ("${class_id}")`;
  return q1;
}

function insertAttendance(body, students) {
  let q1 = `INSERT IGNORE INTO attendance (student_id, subject_code, class_id, attendance_date, instructor_id, present) VALUES `;
  let q2 = students.reduce((accumulator, currentValue) => {
    return (
      accumulator +
      `("${currentValue.Roll}", "${body.SubjectId}", "${body.Class}", "${
      body.Date
      }", "${body.InstructorId}", "${currentValue.Status}"),`
    );
  }, "");
  return q1 + q2.slice(0, -1);
}


function insertAttendanceweb(body, students, code) {
  let q1 = `INSERT INTO attendance (student_id, subject_code, class_id, attendance_date, instructor_id, present) VALUES `;
  let q2 = students.reduce((accumulator, currentValue) => {
    return (
      accumulator +
      `("${currentValue.roll_no}", "${body.subject_code}", "${body.class_id}", "${
         (new Date()).toISOString().slice(0, 10).replace('T', ' ')
      }", "${code}", "${currentValue.Status}"),`
    );
  }, "");
  return q1 + q2.slice(0, -1);
}

router.get("/getRecent/:numData", (req, res, next) => {
  const numData = req.params.numData;
  let q1 = `SELECT class_id as class,
            year,part,
        date,
        instructor.name as instructor,
        subject.name as subject,
        subject.code as subjectCode
        from
       ( SELECT DISTINCT class_id, instructor_id, subject_code, attendance_date as date from attendance) as a 
            join instructor on a.instructor_id = id 
            join subject on a.subject_code = code order by date desc limit ${numData}`;
            db.query(q1,(err,result)=>{
            
              if(err) throw err;
              else  console.log(result)
         
          })
});



router.get("/getAttendance/:classId/:subjectId/:date/", (req, res, next) => {
  const { subjectId, classId, date } = req.params;
  const q1 = `SELECT rollNo, name, status from (SELECT student_id as rollNo, present as status from attendance where
                    class_id ='${classId}' and
                    subject_code='${subjectId}' and
                    attendance_date ='${date}')
                    as a join student where rollNo = student.roll_no order by rollNo`;

  db.query(q1)
    .then(row => {
      res.status(200).json(row);
    })
    .catch(next);
});

//@Todo Handling instructor with same instructorId and subjectCode
router.get("/all/:classId/:subjectCode/:instructor", (req, res, next) => {
  const { classId, subjectCode, instructor } = req.params;
  const sql = `SELECT rollNo, name, date, status, present 
                 from (SELECT student_id as rollNo,
                 GROUP_CONCAT(attendance_date order by attendance_date) as date,
                 GROUP_CONCAT(present order by attendance_date) as status,
                 COUNT(CASE WHEN present='P' then 1 END) as present
                 from attendance where
                 class_id = "${classId}" and
                 subject_code ="${subjectCode}" and
                 instructor_id = (SELECT id from instructor where name="${instructor}") 
                 group by student_id) as s
                 left join student on s.rollNo = roll_no`;
  db.query(sql)
    .then(rows => {
      res.status(200).json(rows);
      return rows;
    })
    .catch(next);
});


router.get("/getAttendance/:classId/:subjectId/:date/", (req, res, next) => {
  const { subjectId, classId, date } = req.params;
  const q1 = `SELECT rollNo, name, status from (SELECT student_id as rollNo, present as status from attendance where
                    class_id ='${classId}' and
                    subject_code='${subjectId}' and
                    attendance_date ='${date}')
                    as a join student where rollNo = student.roll_no order by rollNo`;

  db.query(q1)
    .then(row => {
      res.status(200).json(row);
    })
    .catch(next);
});

router.get("/:subjectCode/:instructor", (req, res, next) => {
  const { subjectCode, instructor } = req.params;
  const sql = `SELECT attendance_date as "Attendance Date", COUNT(CASE WHEN present='P' then 1 END) as "Present Student", COUNT(attendance_date) as "Total Student" 
                 from attendance where subject_code = "${subjectCode}"
                 and instructor_id = (SELECT id from instructor where name ="${instructor}") group by attendance_date`;
  db.query(sql)
    .then(rows => {
      res.status(200).json(rows);
      return rows;
    })
    .catch(next);
});

router.post("/", (req, res, next) => {
  let body = req.body;
  let students = body.Students;
  let password = body.Password;
  let passwordInDB = "";
  db.query("SELECT value from authentication")
    .then(res => {
        if(res.length !== 0)
          passwordInDB = res[0].value;
        if(passwordInDB !== password){
          const error = new Error("Incorrect Password");
          error.status = 400;
          throw(error);
        }
    })
    .then(() => {
      db.query(insertInstructor(body.InstructorId, body.Instructor))
        .then(row => {
          return db.query(insertSubject(body.SubjectId, body.Subject, body.Year, body.Part));
        })
    })
    .then(row => {
      return db.query(insertClass(body.Class));
    })
    .then(row => {
      return db.query(insertStudent(students, body.Class));
    })
    .then(row => {
      return db.query(insertAttendance(body, students));
    })
    .then(row => {
      res.status(200).json({
        message: "Updated Successfully",
        code: 200
      });
    })
    .catch(next);
});




router.post("/submit",(req, res, next) => {
  body= req.body
  var students=[]
  let sql = `SELECT * from student where class_id = ?;`;
    db.query(sql,[body.class_id],(err,student)=>{
          var status;  
        if(err) throw err;
        else { 
student.forEach(element => {
 element.Status= "P"


  if(!body[`${element.roll_no}`])
  {
    element.Status = "A"
  }





  
});
 }

students= student
})
    
    

    

try{
  db.query('SELECT * FROM user WHERE id = (?)',[req.user],async (err,result)=>{
    if(err)
    console.log(err)
else{
  await db.query(insertInstructor(result[0].code,result[0].username))
   
  await db.query(insertSubject(body.subject_code, body.subject_name, body.subject_year, body.subject_part));
    

  await db.query(insertClass(body.class_id));

 await db.query(insertAttendanceweb(body, students,result[0].code ));
}

    })
  }
catch(err)
{
  console.log(err)
}


}     
);

module.exports = router;