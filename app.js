
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();


//Routes

const adminRoute = require('./api/routes/admin');
const indexRoute = require('./api/routes/index');
const studentRoute = require('./api/routes/student');
const subjectRoute = require('./api/routes/subject');
const instructorRoute = require('./api/routes/instructor');
const attendanceRoute = require('./api/routes/attendance');
const classRoute = require('./api/routes/class');
const authRoute = require('./api/routes/authentication');
const departmentRoute = require('./api/routes/department');
const programRoute = require('./api/routes/program');
const adminauthRoute = require('./api/routes/adminauth');




const session = require("express-session");

app.use(express.static("public"));
app.use(cookieParser('secrettexthere'));
app.use(session({ secret: 'secrettexthere',
  saveUninitialized: true,
  resave: true,
  
  
  }));

app.set('trust proxy', 1);



//Utility tools to read request body
app.use(bodyParser.urlencoded({
    extended : false
}));




//Debug setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());



//Forward routes
app.use('/secret', adminRoute);
app.use('/student', studentRoute);
app.use('/class', classRoute);
app.use('/attendance', attendanceRoute);
app.use('/subject', subjectRoute);
app.use('/instructor', instructorRoute);
app.use('/authentication', authRoute);
app.use('/department', departmentRoute);
app.use('/program', programRoute);
app.use('/adminauth', adminauthRoute);
app.use('/', indexRoute);




//Handling Error for all types
app.use((err, req, res, next)=>{
    console.log(err);
    console.log(err.message);
    res.status(err.status || 500);
    res.json({
        code:400,
        msg:err.code,
        sqlMessage:err.sqlMessage,
        message:err.message

    });
});

module.exports = app;