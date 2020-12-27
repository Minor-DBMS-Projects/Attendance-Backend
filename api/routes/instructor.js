const express = require('express');
const db = require("./database");
const router = express.Router();
const { auth } = require('../../configurations/usercheck');

router.get('/', async(req, res, next) => {

    let sql = 'SELECT * from instructor;';
    try{
        
        let result= await db.query(sql)
        res.json(result); 
       }
       catch(err)
       {
           throw err;
       }
});
router.get('/:_id', async(req, res, next) => {

    let sql = `SELECT * from instructor WHERE id=${req.params._id};`;
    try{
        
        let result= await db.query(sql)
        res.json(result); 
       }
       catch(err)
       {
           throw err;
       }
});


module.exports = router;