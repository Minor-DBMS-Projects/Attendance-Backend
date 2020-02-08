
let express = require("express");
let db = require("../../config.js/dataconn");
const bcrypt = require ('bcryptjs');
let router = express.Router();

router.get('/add', (req, res, next)=>{
    res.render('add_user');
});


router.post('/add', async function (req, res, next) {
    try{
  
     const salt =  await bcrypt.genSaltSync();
   var hash =   await bcrypt.hashSync(req.body.password, salt);
    }
   catch(err)
  {
    console.log("saltingerr..."+err);
  }
   
    let q1 = `INSERT IGNORE INTO user (username, password, email) values ("${req.body.username}","${hash} ", "${req.body.email}")`;
    await db.query(q1)
    console.log('user saved')

  res.redirect('/');
  }
  );
  module.exports = router;






   
