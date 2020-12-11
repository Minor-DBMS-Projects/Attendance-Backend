let express = require("express");
let db = require("./database");
let router = express.Router();
const { auth } = require("../../configurations/usercheck");

router.post("/getClass", async (req, res) => {
    var classQuery;
    if (req.body.batch === undefined) {
        classQuery = `SELECT * FROM class where (program_id='${req.body.program}');`;
    } else {
        classQuery = `SELECT * FROM class where (program_id='${req.body.program}' and batch='${req.body.batch}');`;
    }
    try {
        let classes = await db.query(classQuery);
        res.status(200).json({ classes: classes });
    } catch (err) {
        res.status(401).send("not found");
    }
});

router.get("/getSec", async (req, res) => {
    let secQuery = `SELECT class_group from class Where (batch='${req.body.batch}' AND program_id='${req.body.program}');`;
    console.log(secQuery);
    try {
        let sections = await db.query(secQuery);
        res.status(200).json({ sections: sections });
    } catch (err) {
        res.status(401).send("not found");
    }
});

router.post("/add-class", auth, async (req, res, err) => {
    batch = req.body.batch;
    program = req.body.program;
    section = req.body.section;
    students = JSON.parse(req.body.students);
    let classQuery =
        "INSERT IGNORE INTO class(batch, program_id, class_group) VALUES (?, ?, ?)";
    let studentQuery =
        "INSERT IGNORE INTO student(roll_no,name,class_id) VALUES ?";
    let result = await db.query(classQuery, [batch, program, section]);
    if (result.insertId) {
        classID = result.insertId;
        studentList = students.map((eachStudent) => [
            eachStudent[2],
            eachStudent[3],
            classID,
        ]);
        await db.query(studentQuery, [studentList]);
    }
    res.sendStatus(200);
});

module.exports = router;
