let express = require('express');
let db = require("../../config.js/dataconn");
let router = express.Router();
let { auth } = require('../../config.js/usercheck');
let { admin } = require('../../config.js/usercheck');


router.get('/', (req, res, next)=>{

    let sql = 'SELECT * from instructor;';
    db.query(sql,(err,result)=>{
            
        if(err) throw err;
        else  console.log(result)
   
    })
});

module.exports = router;