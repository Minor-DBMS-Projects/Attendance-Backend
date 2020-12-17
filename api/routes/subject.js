const db = require("./database");
const express = require("express");
const bcrypt = require("bcryptjs");
const http = require("follow-redirects").http;
const router = express.Router();
const { auth } = require("../../configurations/usercheck");

router.post("/getSubject", async (req, res, next) => {
    var subjectQuery;
    if (req.body.year === undefined && req.body.part === undefined) {
        subjectQuery = `SELECT * FROM subject where (program_id='${req.body.program}');`;
    } else if (req.body.part === undefined) {
        subjectQuery = `SELECT * FROM subject where (program_id='${req.body.program}' and year='${req.body.year}' );`;
    } else {
        subjectQuery = `SELECT * FROM subject where (program_id='${req.body.program}' and year='${req.body.year}' and part='${req.body.part}' );`;
    }
    try {
        let subjects = await db.query(subjectQuery);
        res.status(200).json({ subjects: subjects });
    } catch (err) {
        res.status(402).send("not found");
    }
});

router.get('/', async(req, res, next)=>{

    let sql = 'SELECT * from subject order by program_id, year, part, name;';
    
   try{ let result= await db.query(sql)
    res.json(result); 
   }
   catch(err)
   {
       throw err;
   }   
       
    
});

router.get('/:_code', async(req, res, next)=>{

    let sql = `SELECT * from subject WHERE code="${req.params._code}";`;
     
    try{ let result= await db.query(sql)
        res.json(result); 
       }
       catch(err)
       {
           throw err;
       }  
});


module.exports = router;
