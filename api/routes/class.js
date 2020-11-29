let express = require("express");
let db = require("./database");
let router = express.Router();
const { auth } = require("../../configurations/usercheck");

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
