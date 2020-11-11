let express = require("express");
let db = require("../../config.js/dataconn");
let { auth } = require('../../config.js/usercheck');

let router = express.Router();






//instructor can fetch recent of attendance data
router.get("/getRecent/:numData/:_id",auth,  (req, res, next) => {
  
  const numData = req.params.numData;
  const  _id= req.params._id;
  let q1 = `SELECT DISTINCT class_id as class,
            year,part,
            class.batch as batch, 
            class.program_id as program,
            class.class_group as section,
            instructor.name as instructor,
        subject.name as subject,
        subject.code as subjectCode,
        a.classType as classType
        
        from
       ( SELECT * from attendanceDetails ) as a 
            join instructor on a.instructor_id =instructor.id
            join subject on a.subject_code = subject.code join class on class.id= a.class_id where instructor.id=${_id} limit ${numData}`
            
            db.query(q1,(err,result)=>{
            
              if(err) throw err;

              else {
              
                res.render('home.ejs', {'data':result})
              }
         
          })
});

//route to taking attendance from saved classes and subjects page
router.get('/take',auth, (req, res, next)=>{
  res.render('selectClass');
});






router.post('/take', auth, (req, res, next)=>
{
  batch=req.body.batch;
  program= req.body.program;
  section= req.body.section;
  year= req.body.year;
  part= req.body.part;
  let q1 = `SELECT concat(batch, program_id) as class, id as id from class where (batch='${batch}' AND program_id='${program}' AND class_group='${section}');`
  let q2= `SELECT name as subject, code as code from subject where ( program_id='${program}' AND year=${year} AND part=${part}) ;`
 


  db.query(q1 , (err , classes)=>{
    if(err)
      console.log("could not get the class!"+err)
    else
  {
    db.query(q2, (err, subjects)=>
    {
      if (err)
      console.log("could not get subjects")
      else
      {
        
    let q3= `select* from student JOIN class on student.class_id=class.id where class.id =${classes[0].id};`
    db.query(q3, (err, students)=>
    {
      if (err)
      console.log("could not get students")
      else
      {
  
      console.log("Data fetched successfully")
      res.render('namelist', {'classes':classes, 'subjects':subjects, 'students':students});
      }
    })
    }})  
      
    
  }})

});





router.post("/submit",auth, (req, res, next) => {

  var detailsQuery = `insert ignore into attendanceDetails(classType, subject_code, class_id, attendance_date, instructor_id) values (?, ?, ?, ?, ?)`;
  var attendanceQuery=`insert ignore into attendance(roll_no, details_id) values ?`;
  body= req.body
  var roll_nums=[];
  var attData= [body.classType.toString().charAt(0), body.subject_code.toString().substring(0, 5), parseInt(body.class_id),new Date().toISOString().slice(0, 10).replace('T', ' '), userdata.id];

  
 db.query(detailsQuery,attData, (err, result) => {
  if (err)
     console.log(err)
     else  
  {
  let detailsID;
    detailsID = result.insertId;
    for (var key in body)
  {
    if(body[key]=='present')
    roll_nums.push([key, detailsID])
  }

    
     db.query(attendanceQuery,[roll_nums], (err, result)=>{

     if (err)
     console.log(err)
     else
     
    console.log("attendance saved")
    res.redirect('/');
}
);
  }
 
  });



}     
);

router.get("/delete/:_id" ,auth,(req, res)=>{

  db.query(`DELETE FROM attendance WHERE details_id = ${parseInt(req.params._id)}`, (err2, result2)=>{
    if (err2)
    console.log(err2)
    else{
  
    db.query(`DELETE FROM attendanceDetails WHERE id = ${parseInt(req.params._id)}`, (err3, result3)=>{
  if(err3)
  console.log(err)
  else
  console.log('One Record Deleted')
  res.redirect('/');
  
    
    })
    }
  
  })
} )


router.get("/edit/:_id" ,auth,(req, res)=>{

  db.query(`SELECT student.roll_no, student.class_id FROM (select * from (select * from attendanceDetails where id=${parseInt(req.params._id)}) as a JOIN attendance on a.id=attendance.details_id ) as b JOIN student on (student.class_id= b.class_id AND student.roll_no = b.roll_no )  `, (err, result)=>{
    if (err)
    console.log(err)
    else{
db.query(`SELECT name, roll_no from student where class_id = ${result[0].class_id}`, (err2, result2)=>{
var roll_list= [];
result.forEach((item)=>{
  roll_list.push(item.roll_no)
})

 
  
  res.render('editList', {'students':result2,'present':roll_list, 'id':parseInt(req.params._id)})

})


    }
  
  })
} )

router.post("/edit/:_id" ,auth,(req, res)=>{
var body= req.body
var roll_nums=[]
  for (var key in body)
  {
    if(body[key]=='present')
    roll_nums.push([parseInt(req.params._id),key])
  }


  db.query(`DELETE FROM attendance WHERE details_id = ${req.params._id}`, (err, result)=>{
    if (err)
    console.log(err)
    else{

  
    db.query(`Insert into attendance (details_id, roll_no) values ?`, [roll_nums], (err3, result3)=>{
  if(err3)
  console.log(err)
  else
  console.log('Record Updated')
  res.redirect('/');
  
    
    })
    }
  
  })
  
})



router.get("/deleteAll/:class/:subject/:type",auth, (req, res)=>
{
 var sql= `select id FROM attendanceDetails WHERE (classType='${req.params.type}' AND subject_code='${req.params.subject}' AND class_id=${req.params.class} AND instructor_id=${parseInt(user)})`

db.query(sql, (err, result)=>{
  if(err)
  console.log(err);
  else
  {result.forEach((record)=>
    {
db.query(`DELETE FROM attendance WHERE details_id = ${record.id}`, (err2, result2)=>{
  if (err2)
  console.log(err2)
  else{

  db.query(`DELETE FROM attendanceDetails WHERE id = ${record.id}`, (err3, result3)=>{
if(err3)
console.log(err)
else
console.log('Record Deleted')
res.redirect('/');

  
  })
  }

})



    }
    
    
    )}
  
})

})












//instructors report of a subject of a class
router.get("/all/:classId/:subjectCode/:classType",auth, (req, res, next) => {
  const classId=req.params.classId;
  const subjectCode= req.params.subjectCode;
  const instructorId  = parseInt(user);
  const classType  = req.params.classType;
  const details={class:classId, subject:subjectCode, type:classType}
  const sql = `SELECT * from attendanceDetails JOIN attendance on attendanceDetails.id=attendance.details_id JOIN student on (attendanceDetails.class_id= student.class_id AND student.roll_no=attendance.roll_no) where (attendanceDetails.class_id =${classId} AND subject_code ='${subjectCode}' AND instructor_id =${instructorId} AND classType='${classType}' ) order by attendance_date`;
  
                 db.query(sql,(err,result)=>{
            
                  if(err) throw err;
                  else  {
                    sql2 = `SELECT count(a.id) as count, a.roll_no FROM (SELECT attendance.roll_no,id from attendanceDetails JOIN attendance on attendanceDetails.id=attendance.details_id JOIN student on (attendanceDetails.class_id= student.class_id AND student.roll_no=attendance.roll_no)  where (attendanceDetails.class_id =${classId} AND subject_code ='${subjectCode}' AND instructor_id =${instructorId} AND classType='${classType}' )) as a GROUP by a.roll_no `;
                   db.query(sql2, (error, counts)=>
                   {
                     if (error)
                     console.log (error)
                     else
                    {
                     var record= new Set(result.map(item=>(parseInt(item.id) ))); 
                    var final=[];
                    var final_res;
                    var last_count;
                    record.forEach(element=>{
                      final.push([element,{date:"", students:[]}])
                    
                      
                    })
                    final_res=Object.fromEntries(final);
                    result.forEach(element=>
                      {
                        
                        final_res[element.id]["date"]=element.attendance_date;
                        
                        
                        final_res[element.id]["students"].push(element.roll_no)
                      })
                    db.query(`SELECT roll_no, name FROM student where class_id =${classId}`, (err, result2)=>
                    {
                      pres_count=[];
                      counts.forEach(item=>{
                        pres_count.push([item.roll_no,item.count])
                         last_count= Object.fromEntries(pres_count)

                      }
                        )
                    
                     res.render('record', {'records':final_res, 'students':result2, 'counts':last_count, 'details':details})
                    }) }
                   }
                   ) 
             
                    
                    
                  }

                 
               
             
              })

});
//attendance of a class by subject and date

router.get("/getAttendance/:classId/:subjectId/:date/", (req, res, next) => {
  const subjectId = req.params.subjectId;
  const classId = req.params.classId;
  const date = req.params.date;
  const q1 = `SELECT rollNo, name, status from (SELECT student_id as rollNo, present as status from attendance where
                    class_id ='${classId}' and
                    subject_code='${subjectId}' and
                    attendance_date ='${date}')
                    as a join student where rollNo = student.roll_no order by rollNo`;

                    
});

function insertAttendanceweb(body, students, code) {
  let q1 = `INSERT INTO attendance (student_id, subject_code, class_id, attendance_date, instructor_id, present) VALUES `;
  let q2 = students.reduce((accumulator, currentValue) => {
    return (
      accumulator +
      `("${currentValue.roll_no}", "${body.subject_code}", "${body.class_id}", "${
         new Date().toISOString().slice(0, 10).replace('T', ' ')
      }", "${code}", "${currentValue.Status}"),`
    );
  }, "");
  return q1 + q2.slice(0, -1);
}





//get attendance of a class of a subject by date

router.get("/:subjectCode/:name", (req, res, next) => {
  const  subjectCode = req.params.subjectCode;
  const  instructor  = req.params.name;
  const sql = `SELECT attendance_date as "Attendance Date", COUNT(CASE WHEN present='P' then 1 ELSE NULL END) as "Present Student" 
                 from attendance where subject_code = "${subjectCode}"
                 and instructor_id = (SELECT id from instructor where name ="${instructor}") group by attendance_date`;
  db.query(sql,(rows) => {

      res.status(200).json(rows);
      console.log(rows);
    
    })
   
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



module.exports = router;