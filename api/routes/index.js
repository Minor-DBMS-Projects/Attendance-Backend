let express = require('express');
let db = require("../../config.js/dataconn");
let router = express.Router();
var passport =require('passport')
let { auth } = require('../../config.js/usercheck');


//login logout routes

router.get('/login',(req, res, next)=>{
  res.render('login');
});


router.get('/logout',auth, function(req, res, next)
{req.logOut()
res.redirect('/');
})


router.post('/login',function(request, response, next) 
{
 
  passport.authenticate('local', function(err, user, info) {
    
    if(err)
    console.log(err+ "   inauth err")
    
            if(!user){ console.log("no user");
            
              }
            else{
                
                request.login(user, function(error) {
                    if (error) return next(error);
                    
                    response.redirect('/')
                   
                });
  }
}
)
  (request, response, next);});

 
router.get('/',auth, (req, res, next)=>{
  
   
   res.redirect('/attendance/getRecent/30/'+userdata.id);

    
});


module.exports = router;




