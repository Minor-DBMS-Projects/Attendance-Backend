

var passport =require('passport')
let express = require("express");
let db = require("../../config.js/dataconn");
const bcrypt = require ('bcryptjs');
let router = express.Router();

let { admin } = require('../../config.js/usercheck');

router.get('/', (req, res, next)=>{
  res.render('admin');
});


router.get('/add',admin, (req, res, next)=>{
    res.render('add_user');
});


router.get('/dashboard',admin, (req, res, next)=>{
  res.render('admindash');
});


router.post('/add',admin, async function (req, res, next) {
    try{
  
     const salt =  await bcrypt.genSaltSync();
   var hash =   await bcrypt.hashSync(req.body.password, salt);
   saltedpassword = hash;
    }
   catch(err)
  {
    console.log("saltingerr..."+err);
  }
   
    let q1 = `INSERT IGNORE INTO user (username, password, code, type) values ("${req.body.username}","${hash}", "${req.body.code}", "${req.body.type}")`;
    await db.query(q1)
    console.log('user saved')

  res.redirect('/secret/dashboard');
  }

  );



  router.post('/login',function(request, response, next) 
{
 console.log("here...............")
  passport.authenticate('local', function(err, user, info) {
    
    if(err)
    console.log(err+ "   inauth err")
    
            if(!user){ console.log("no user");
            
              }
            else{
                
                request.login(user, function(error) {
                    if (error) return next(error);
                    
                    response.redirect('/secret/dashboard')
                   
                });
  }
}
)
  (request, response, next);});




  module.exports = router;






   
