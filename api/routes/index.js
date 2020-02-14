let express = require('express');
let db = require("../../config.js/dataconn");
let router = express.Router();
var passport =require('passport')
var http = require('follow-redirects').http;
var fs = require('fs');
let { auth } = require('../../config.js/usercheck');
var student={
   "program":"",
   "batch":"",
   "section":""
}
var subject={
   "program":"",
   "year":"",
   "part":"",
   "code":""
}
var subjectList;
router.get('/', (req, res, next)=>{
    res.render('login');
});


router.post('/', (req, res, next) => {
    const oldPassword = req.body.old;
    const newPassword = req.body.new;
 
    let sql = `SELECT value from authentication`;
    db.query(sql)
       .then((row) => {
          if (row.length === 0) {
 
             if (oldPassword === '') {
                sql = `INSERT INTO authentication (value) VALUES("${newPassword}")`
                console.log('Here');
                db.query(sql)
                .then(()=>{
                   res.status(200).json({
                      msg:'Successfully Updated'
                   })
                })
                .catch(next)
             }
          }
          else {
             let passwordInDB = row[0].value;
             if (passwordInDB === oldPassword) {
                sql = `UPDATE authentication SET value="${newPassword}"`;
                db.query(sql)
                .then(()=>{
                   res.status(200).json({
                      msg:'Successfully Updated'
                   })
                })
                .catch(next);
             }else{
                res.status(200).json({
                   msg:'Incorrect old password'
                })
             }
          }
       })
 });


router.post('/login',function(request, response, next) 
{
 console.log("here...............")
  passport.authenticate('local', function(err, user, info) {
    
    if(err)
    console.log(err+ "   inauth err")
    
            if(!user){ console.log("no user");
            response.redirect('back')
              }
            else{
                
                request.login(user, function(error) {
                    if (error) return next(error);
                    
                    response.redirect('/home')
                   
                });
  }
}
)
  (request, response, next);});

router.get('/home',  (req, res, next)=>{
   res.render('home');
});

router.get('/add-class',auth,(req,res,next)=>{
   res.render('add-class');
})
router.post('/add-class',auth,(req,res,next)=>{
   
   student.program=req.body.program.toString();
   student.batch=req.body.batch.toString();
   student.section=req.body.section.toString();
   
   subject.program=req.body.program.toString();
   subject.year=req.body.year.toString();
   subject.part=req.body.part.toString();

   res.redirect('/next');

});

router.get('/next',auth,(request,response)=>{
   var options = {
      'method': 'POST',
      'hostname': 'pcampus.edu.np',
      'path': '/api/subjects/',
      'headers': {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      'maxRedirects': 20
    };
    
    var req = http.request(options, function (res) {
      var chunks = [];
    
      res.on("data", function (chunk) {
        chunks.push(chunk);
      });
    
      res.on("end", function (chunk) {
        var body = Buffer.concat(chunks);
        subjects=JSON.parse(body.toString());
        subjectList=subjects;
        response.render('next',{'subjects':subjects});
      });
    
      res.on("error", function (error) {
        console.error(error);
      });
    });
    
    var postData = "------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"prog\"\r\n\r\n"+subject.program+"\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"year\"\r\n\r\n"+subject.year+"\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"part\"\r\n\r\n"+subject.part+"\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW--";
    
    req.setHeader('content-type', 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW');
    
    req.write(postData);
    
    req.end();

   
});

router.post('/next',auth,(request,response,next)=>{

for (var eachSubject of subjectList){

   if(eachSubject[1]===request.body.subject.toString()){
      subject.code=eachSubject[0];
      break;
   }

}

var userQuery="SELECT * FROM user WHERE id = (?)";
var instructorQuery="INSERT INTO instructor(id,name) VALUES (?,?)";
var classQuery="INSERT INTO class(id) VALUES (?)";
var subjectQuery="INSERT INTO subject(code,name,year,part) VALUES (?,?,?,?)";
var studentQuery="INSERT INTO student(roll_no,name,class_id) VALUES ?";


   db.query(userQuery,[request.user],(err1,result1)=>{
      if(err1) throw err1;
      db.query(instructorQuery,[result1[0].id,result1[0].name],(err2,result2)=>{
         if(err2) throw err2;
         var classId=Math.random().toString(36).substring(7);
         db.query(classQuery,[classId],(err3,result3)=>{
            
            if(err3) throw err3;
            db.query(subjectQuery,[subject.code,request.body.subject.toString(),subject.year,subject.part],(err4,result4)=>{

               if(err4) throw err4;
               var databaseEntry=false;
               var getStudent=(program,batch,group)=>{ 
                  var options = {
                    'method': 'POST',
                    'hostname': 'pcampus.edu.np',
                    'path': '/api/students/',
                    'headers': {
                      'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    'maxRedirects': 20
                  };
               
                  var req = http.request(options, function (res) {
                    var chunks = [];
               
                    res.on("data", function (chunk) {
                      chunks.push(chunk);
                    });
               
                    res.on("end", function (chunk) {
                      var body = Buffer.concat(chunks);
                      studentList=JSON.parse(body.toString());
                      for(var i=0;i<studentList.length;i++)
                      {
                         studentList[i][0]+=studentList[i][1]+studentList[i][2];
                         studentList[i].splice(1,2);
                         studentList[i].push(classId);
                      }
                      console.log(studentList);
                      db.query(studentQuery,[studentList],(err5,result5)=>{
                         if(err5) throw err5;
                         if(databaseEntry){
                            response.redirect('/home');
                         }
                         databaseEntry=true;
                      });
                    });
               
                    res.on("error", function (error) {
                      console.error(error);
                    });
                  });
               
                  var postData = "------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"prog\"\r\n\r\n"+program+"\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"batch\"\r\n\r\n"+batch+"\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"group\"\r\n\r\n"+group+"\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW--";
               
                  req.setHeader('content-type', 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW');
               
                  req.write(postData);
               
                  req.end();
               }
               getStudent(student.program,student.batch,student.section.charAt(0));
               getStudent(student.program,student.batch,student.section.charAt(1));
            });
               

            });
            
         });


      });

});



module.exports = router;

