const express = require("express");
const db = require("./database");
const { auth } = require("../../configurations/usercheck");
const parser = require("csv-parser");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const fs = require("fs");

//instructor can fetch recent of attendance data
router.get("/getRecent/:numData", auth, async (req, res, next) => {
    const numData = req.params.numData;
    const _id = req.params._id;
    let q1 = `SELECT DISTINCT class_id as class,
            year,part,
            class.batch as batch, 
            class.program_id as program,
            class.class_group as section,
            instructor.name as instructor,
        subject.name as subject,
        subject.code as subjectCode,
        a.classType as classType
        
        from
       ( SELECT * from attendanceDetails ) as a 
            join instructor on a.instructor_id =instructor.id
            join subject on a.subject_code = subject.code join class on class.id= a.class_id where instructor.id=${userdata.id} limit ${numData}`;

    try {
        let result = await db.query(q1);
        res.json(result);
    } catch (err) {
        console.log(err);
    }
});

//route to taking attendance from saved classes and subjects page
router.get("/take", auth, (req, res, next) => {
    res.render("selectClass");
});

//get the selected class data for atteandance
router.post("/take", auth, async (req, res, next) => {
    batch = req.body.batch;
    program = req.body.program;
    section = req.body.section;
    year = req.body.year;
    part = req.body.part;
    let q1 = `SELECT concat(batch, program_id) as class, id as id from class where (batch='${batch}' AND program_id='${program}' AND class_group='${section}');`;
    let q2 = `SELECT name as subject, code as code from subject where ( program_id='${program}' AND year=${year} AND part=${part}) ;`;
    let classes, subjects, students;

    try {
        classes = await db.query(q1);
    } catch (err) {
        console.log("could not get the class!" + err);
    }
    try {
        subjects = await db.query(q2);
    } catch (err) {
        console.log("could not get the subjects!" + err);
    }
    try {
        let q3 = `select* from student JOIN class on student.class_id=class.id where class.id =${classes[0].id};`;
        students = await db.query(q3);
        console.log("Data fetched successfully");
    } catch (err) {
        console.log("could not get the students!" + err);
    }

    res.json({ classes: classes, subjects: subjects, students: students });
});

//submit attendance
router.post("/submit", auth, async (req, res, next) => {
    let detailsQuery = `insert ignore into attendanceDetails(classType, subject_code, class_id, attendance_date, instructor_id) values (?, ?, ?, ?, ?)`;
    let attendanceQuery = `insert ignore into attendance(roll_no, details_id) values ?`;
    let body = req.body;
    let roll_nums = [];
    let attendanceData = [
        body.classType.toString().charAt(0),
        body.subject_code.toString().substring(0, 5),
        parseInt(body.class_id),
        new Date().toISOString().slice(0, 10).replace("T", " "),
        userdata.id,
    ];

    try {
        let result = await db.query(detailsQuery, attendanceData);
        let detailsID = result.insertId;
        for (let key in body) {
            if (body[key] == "present") roll_nums.push([key, detailsID]);
        }
        await db.query(attendanceQuery, [roll_nums]);
        console.log("attendance saved");
    } catch (err) {
        console.log("Couldn't save attendance" + "  " + err);
    }
    res.redirect("/");
});

//select class for online class attendance
router.get("/takeOnline", auth, (req, res, next) => {
    res.render("selectOnlineClass");
});

router.post("/takeOnline", auth, (req, res, next) => {
    let data = req.body;
    req.session.context = data;
    res.redirect("/attendance/takeOnlineNext");
});

router.get("/takeOnlineNext", auth, async (req, res, next) => {
    let details = req.session.context;

    let sql = `SELECT name as subject, code as code from subject where ( program_id='${details.program}' AND year=${details.year} AND part=${details.part}) `;
    try {
        subjects = await db.query(sql);
        res.render("upload", { details: details, subjects: subjects });
    } catch (err) {
        console.log(err);
    }
});

async function insertOnlineRecord(details, names) {
    let detailsQuery = `insert ignore into attendanceDetails(classType, subject_code, class_id, attendance_date, instructor_id) values (?, ?, ?, ?, ?)`;
    let attendanceQuery = `insert ignore into attendance( details_id, roll_no) values ?`;
    let roll_nums = [];
    try {
        let presentList = await db.query(
            `select a.roll_no, a.class_id from (select name, roll_no, class_id from student where class_id=(select id from class where (batch='${details.batch}' AND program_id='${details.program}' AND class_group='${details.section}'))) as a  WHERE a.name in (?)`,
            [names]
        );
        let attendanceData = [
            details.classType.toString().charAt(0),
            details.subject.toString().substring(0, 5),
            parseInt(presentList[0].class_id),
            new Date().toISOString().slice(0, 10).replace("T", " "),
            userdata.id,
        ];

        let result = await db.query(detailsQuery, attendanceData);
        let detailsID = result.insertId;
        presentList.forEach((item) => {
            roll_nums.push([detailsID, item["roll_no"]]);
        });
        await db.query(attendanceQuery, [roll_nums]);

        console.log("attendance saved");
    } catch (err) {
        console.log("failed to save record" + err);
    }
}

router.post(
    "/takeOnlineNext",
    auth,
    upload.single("atten_file"),
    (req, res, next) => {
        let path = req.file.path;
        let results = [];
        let final = [];
        fs.createReadStream(path, "utf16le")
            .pipe(parser())
            .on("data", (data) => results.push(data))
            .on("end", () => {
                console.log("extracted");

                results.forEach((item) => {
                    let name = item[0].split("\t")[0].toString();
                    final.push(name);
                });
                let namelist = new Set(final);
                nameList = Array.from(namelist);
                insertOnlineRecord(
                    {
                        batch: req.body.batch.toString(),
                        program: req.body.program.toString(),
                        classType: req.body.classType.toString().charAt(0),
                        section: req.body.section.toString().charAt(0),
                        subject: req.body.subject_code
                            .toString()
                            .substring(0, 5),
                    },
                    nameList
                );
                if (req.body.section.length == 2) {
                    insertOnlineRecord(
                        {
                            batch: req.body.batch.toString(),
                            program: req.body.program.toString(),
                            classType: req.body.classType.toString().charAt(0),
                            section: req.body.section.toString().charAt(1),
                            subject: req.body.subject_code
                                .toString()
                                .substring(0, 5),
                        },
                        nameList
                    );
                }
                res.redirect("/");
            });
    }
);

//instructors report of a subject of a class
router.get(
    "/all/:classId/:subjectCode/:classType",
    auth,
    async (req, res, next) => {
        const classId = req.params.classId;
        const subjectCode = req.params.subjectCode;
        const instructorId = parseInt(user);
        const classType = req.params.classType;
        const details = {
            class: classId,
            subject: subjectCode,
            type: classType,
        };

        let attendanceList = [];
        let presentCount = [];
        let sql1 = `SELECT  * from attendanceDetails JOIN attendance on attendanceDetails.id=attendance.details_id JOIN student on (attendanceDetails.class_id= student.class_id AND student.roll_no=attendance.roll_no) where (attendanceDetails.class_id =${classId} AND subject_code ='${subjectCode}' AND instructor_id =${instructorId} AND classType='${classType}' ) order by attendance_date`;
        let sql2 = `SELECT count(a.id) as count, a.roll_no FROM (SELECT attendance.roll_no,id from attendanceDetails JOIN attendance on attendanceDetails.id=attendance.details_id JOIN student on (attendanceDetails.class_id= student.class_id AND student.roll_no=attendance.roll_no)  where (attendanceDetails.class_id =${classId} AND subject_code ='${subjectCode}' AND instructor_id =${instructorId} AND classType='${classType}' )) as a GROUP by a.roll_no `;
        let sql3 = `SELECT roll_no, name FROM student where class_id =${classId}`;
        let sql4 = `SELECT * FROM class where id = ${classId}`;
        let sql5 = `SELECT name FROM subject where code = "${subjectCode}"`;
        let result, counts, students, classes, subjects;

        try {
            result = await db.query(sql1);
            counts = await db.query(sql2);
            students = await db.query(sql3);
            classes = await db.query(sql4);
            subjects = await db.query(sql5);

            let ids = new Set(result.map((item) => parseInt(item.id)));

            ids.forEach((element) => {
                attendanceList.push([element, { date: "", students: [] }]);
            });

            attendanceList = Object.fromEntries(attendanceList);
            result.forEach((element) => {
                attendanceList[element.id]["date"] = element.attendance_date;
                attendanceList[element.id]["students"].push(element.roll_no);
            });
            counts.forEach((item) => {
                presentCount.push([item.roll_no, item.count]);
            });
            presentCount = Object.fromEntries(presentCount);
            details.batch = classes[0].batch;
            details.program = classes[0].program_id;
            details.section = classes[0].class_group;
            details.subjectName = subjects[0].name;
            res.json({
                records: attendanceList,
                students: students,
                details: details,
            });
        } catch (err) {
            console.log(err);
        }
    }
);

router.get("/edit/:_id", auth, async (req, res) => {
    let q1 = `SELECT student.roll_no, student.class_id FROM (select * from (select * from attendanceDetails where id=${parseInt(
        req.params._id
    )}) as a JOIN attendance on a.id=attendance.details_id ) as b JOIN student on (student.class_id= b.class_id AND student.roll_no = b.roll_no ) `;
    let roll_list = [];
    try {
        let presentRoll = await db.query(q1);
        presentRoll.forEach((item) => {
            roll_list.push(item.roll_no);
        });

        let result2 = await db.query(
            `SELECT name, roll_no from student where class_id = ${presentRoll[0].class_id}`
        );
        res.render("editList", {
            students: result2,
            present: roll_list,
            id: parseInt(req.params._id),
        });
    } catch (err) {
        console.log(err);
    }
});

router.post("/edit/:_id", auth, async (req, res) => {
    var body = req.body.students;
    console.log(body);
    console.log(req.params._id);
    var roll_nums = [];
    body.forEach((item) => {
        roll_nums.push([parseInt(req.params._id), item]);
    });

    try {
        await db.query(
            `DELETE FROM attendance WHERE details_id = ${req.params._id}`
        );
        await db.query(
            `Insert into attendance (details_id, roll_no) values ?`,
            [roll_nums]
        );
        res.redirect("/");
        console.log("Record Updated");
    } catch (err) {
        console.log(err);
    }
});

router.get("/delete/:_id", auth, async (req, res) => {
    try {
        await db.query(
            `DELETE FROM attendance WHERE details_id = ${parseInt(
                req.params._id
            )}`
        );
        await db.query(
            `DELETE FROM attendanceDetails WHERE id = ${parseInt(
                req.params._id
            )}`
        );
        console.log("One Record Deleted");
    } catch (err) {
        console.log(err);
    }
    res.redirect("/");
});

router.get("/deleteAll/:class/:subject/:type", auth, async (req, res) => {
    let sql = `select id FROM attendanceDetails WHERE (classType='${
        req.params.type
    }' AND subject_code='${req.params.subject}' AND class_id=${
        req.params.class
    } AND instructor_id=${parseInt(user)})`;
    try {
        let result = await db.query(sql);
        result.forEach(async (record) => {
            await db.query(
                `DELETE FROM attendance WHERE details_id = ${record.id}`
            );
            await db.query(
                `DELETE FROM attendanceDetails WHERE id = ${record.id}`
            );
            console.log("Record Deleted");
        });
        res.redirect("/");
    } catch (err) {
        console.log(err);
    }
});

module.exports = router;
