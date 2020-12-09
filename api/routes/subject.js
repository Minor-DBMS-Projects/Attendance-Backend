const db = require("./database");
const express = require("express");
const bcrypt = require("bcryptjs");
const http = require("follow-redirects").http;
const router = express.Router();
const { auth } = require("../../configurations/usercheck");

router.get("/",  async (req, res, next) => {
    let program = req.body.program;
    let year = req.body.year;
    let part = req.body.part;
    let details={program:program, year:year, part:part};

    let sql = `SELECT name as subject, code as code from subject where ( program_id='${program}' AND year=${year} AND part=${part}) `;
    try {
        subjects = await db.query(sql);
       res.json( { details: details, subjects: subjects });
    } catch (err) {
        console.log(err);
    }
})

router.post("/add-subject", auth, async (req, res, err) => {
    program = req.body.program;
    year = req.body.year;
    part = req.body.part;
    subject = JSON.parse(req.body.subject);
    let subjectQuery = `INSERT IGNORE INTO subject(code, name, year, part, program_id) VALUES ("${subject[0]}","${subject[1]}","${year}","${part}","${program}")`;
    await db.query(subjectQuery);
    res.sendStatus(200);
});

module.exports = router;
