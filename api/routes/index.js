let express = require('express');
let db = require("../../config.js/dataconn");
let router = express.Router();
var passport =require('passport')
let { auth } = require('../../config.js/usercheck');
let { admin } = require('../../config.js/usercheck');

router.get('/', (req, res, next)=>{
    res.render('login');
});

router.get('/home',auth,  (req, res, next)=>{
    res.render('home');
});


router.get('/logout', function(req, res, next)
{req.logOut()
res.redirect('/');
})

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
                    
                    response.redirect('/home')
                   
                });
  }
}
)
  (request, response, next);});
module.exports = router;

