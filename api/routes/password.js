let express = require('express');
let db = require("../../config.js/dataconn");
let router = express.Router();



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

module.exports = router;