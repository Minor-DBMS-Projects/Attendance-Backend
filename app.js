var createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const passport= require('passport');
const logger = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
let db = require("./config.js/dataconn");

const app = express();


//Routes

const adminRoute = require('./api/routes/admin');
const indexRoute = require('./api/routes/index');
const studentRoute = require('./api/routes/student');
const subjectRoute = require('./api/routes/subject');
const instructorRoute = require('./api/routes/instructor');
const attendanceRoute = require('./api/routes/attendance');
const classRoute = require('./api/routes/class');
const passwordRoute = require('./api/routes/password');



const session = require("express-session");

app.use(express.static("public"));
app.use(cookieParser('secrettexthere'));
app.use(session({ secret: 'secrettexthere',
  saveUninitialized: true,
  resave: true,
  
  
  }));

app.set('trust proxy', 1);

app.use(passport.initialize());
app.use(passport.session());

require('./config.js/passport')(passport);

//Utility tools to read request body
app.use(bodyParser.urlencoded({
    extended : false
}));

passport.serializeUser(function(user, done) {
    console.log('in serializeer');
  done(null, user.id);
});
passport.deserializeUser(function(user, done) {
  console.log("in the deserialize");
    done(null, user);
});
//view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Debug setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());






//CORS handling


//Forward routes
app.use('/secret', adminRoute);
app.use('/student', studentRoute);
app.use('/class', classRoute);
app.use('/attendance', attendanceRoute);
app.use('/subject', subjectRoute);
app.use('/instructor', instructorRoute);
app.use('/password', passwordRoute);
app.use('/', indexRoute);


app.get('*', function(req, res,next)
{
  user=req.user||null

  db.query("select * from user where id = ? limit 1", [user],function (err, result) {
    if (err) throw err;
    
    res.userdata = result[0]

    next()
  });
})


//Forward request to error handler
app.use((req, res, next)=>{
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

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