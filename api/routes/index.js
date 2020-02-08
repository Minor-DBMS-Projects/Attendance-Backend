let express = require('express');
let db = require("../../config.js/dataconn");
let router = express.Router();
var passport =require('passport')

router.get('/', (req, res, next)=>{
    res.render('login');
});

router.get('/home', (req, res, next)=>{
    res.render('home');
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
module.exports = router;

