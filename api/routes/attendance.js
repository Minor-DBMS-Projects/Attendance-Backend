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
            join subject NATURAL JOIN subjectDetails on a.subject_code = subject.code join class on class.id= a.class_id where instructor.id=${req.user} order by batch, program,  subject.name, section limit ${numData}  `;

    try {
        let result = await db.query(q1);
        res.status(200).json(result);
    } catch (err) {
        console.log(err);
        res.status(402).send("not found");
    }
});


//get the selected class data for atteandance
router.post("/take", auth, async (req, res, next) => {
    batch = req.body.batch;
    program = req.body.program;
    section = req.body.section;
    year = req.body.year;
    part = req.body.part;
    if (req.body.subject !== undefined) {
        subject = JSON.parse(req.body.subject);
    }

    let q1 = `SELECT concat(batch, program_id) as class, id as id from class where (batch='${batch}' AND program_id='${program}' AND class_group='${section}');`;
    let q2 = `SELECT name as subject, code as code from subject NATURAL JOIN subjectDetails where ( program_id='${program}' AND year=${year} AND part=${part}) ;`;
    let classes, subjects, students;

    try {
        classes = await db.query(q1);
    } catch (err) {
        console.log("could not get the class!" + err);
        res.status(402).send("not found");
    }
    if (req.body.subject === undefined) {
        try {

            subjects = await db.query(q2);

        } catch (err) {
            console.log("could not get the subjects!" + err);

            res.status(402).send("not found");
        }
    }
    try {
        let q3 = `select* from student JOIN class on student.class_id=class.id where class.id =${classes[0].id};`;
        students = await db.query(q3);
        console.log("Data fetched successfully");
    } catch (err) {
        console.log("could not get the students!" + err);
        res.status(402).send("not found");
    }
    if (req.body.subject === undefined) {
        res.json({ classes: classes, subjects: subjects, students: students });
    } else {
        res.json({
            classes: classes,
            subjects: [{ code: subject[0], subject: subject[1] }],
            students: students,
        });
    }
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
        req.user,
    ];

    try {
        let result = await db.query(detailsQuery, attendanceData);
        let detailsID = result.insertId;
        for (let key in body) {
            if (body[key] == "present") roll_nums.push([key, detailsID]);
        }
        await db.query(attendanceQuery, [roll_nums]);
        res.status(200).send("attendance saved");
    } catch (err) {
        console.log("Couldn't save attendance" + "  " + err);
        res.status(402).send("not found");
    }
    
});

//select class for online class attendance


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
            details.instructorId,
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
        //
    }
}

router.post(
    "/takeOnlineNext",
    auth,
    upload.single("atten_file"),
    async (req, res, next) => {
        let path = req.file.path;
        let results = [];
        let final = [];
      await   fs.createReadStream(path, "utf16le")
            .pipe(parser())
            .on("data", (data) => results.push(data))
            .on("end", () => {
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
                        instructorId:req.user
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
                            instructorId:req.user
                        },
                        nameList
                    );
                }
  
            });
            fs.unlink(path, function (delerr) {
                if (delerr) throw delerr;
                res.status(200).send("done")
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
        const instructorId = parseInt(req.user);
        const classType = req.params.classType;
        const details = {
            class: classId,
            subject: subjectCode,
            type: classType,
        };

        let attendanceList = [];
        let presentCount = [];
        let sql1 = `SELECT  * from attendanceDetails JOIN attendance on attendanceDetails.id=attendance.details_id JOIN student on (attendanceDetails.class_id= student.class_id AND student.roll_no=attendance.roll_no) where (attendanceDetails.class_id =${classId} AND subject_code ='${subjectCode}' AND instructor_id =${instructorId} AND classType='${classType}' ) order by attendance_date`;
        //let sql2 = `SELECT count(a.id) as count, a.roll_no FROM (SELECT attendance.roll_no,id from attendanceDetails JOIN attendance on attendanceDetails.id=attendance.details_id JOIN student on (attendanceDetails.class_id= student.class_id AND student.roll_no=attendance.roll_no)  where (attendanceDetails.class_id =${classId} AND subject_code ='${subjectCode}' AND instructor_id =${instructorId} AND classType='${classType}' )) as a GROUP by a.roll_no `;
        let sql3 = `SELECT roll_no, name FROM student where class_id =${classId}`;
        let sql4 = `SELECT * FROM class where id = ${classId}`;
        let sql5 = `SELECT name FROM subject where code = "${subjectCode}"`;
        let result, counts, students, classes, subjects;

        try {
;
            result = await db.query(sql1);
           // counts = await db.query(sql2);
            students = await db.query(sql3);
            classes = await db.query(sql4);
            subjects = await db.query(sql5);
;
            let ids = new Set(result.map((item) => parseInt(item.id)));

            ids.forEach((element) => {
                attendanceList.push([element, { date: "", students: [] }]);
            });

            attendanceList = Object.fromEntries(attendanceList);
            result.forEach((element) => {
                attendanceList[element.id]["date"] = element.attendance_date;
                attendanceList[element.id]["students"].push(element.roll_no);
            });
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
;
            res.status(402).send("not found");
        }
    }
);
//report of a class irrespective of instructor

router.get(
    "/allRecord/:classId/:subjectCode/:classType",auth,
  
    async (req, res, next) => {
        const classId = req.params.classId;
        const subjectCode = req.params.subjectCode;
        const classType = req.params.classType;
        const details = {
            class: classId,
            subject: subjectCode,
            type: classType,
        };

        let attendanceList = [];
        let presentCount = [];
        let sql1 = `SELECT  * from attendanceDetails JOIN attendance on attendanceDetails.id=attendance.details_id JOIN student on (attendanceDetails.class_id= student.class_id AND student.roll_no=attendance.roll_no) where (attendanceDetails.class_id =${classId} AND subject_code ='${subjectCode}'  AND classType='${classType}' ) order by attendance_date`;
       // let sql2 = `SELECT count(a.id) as count, a.roll_no FROM (SELECT attendance.roll_no,id from attendanceDetails JOIN attendance on attendanceDetails.id=attendance.details_id JOIN student on (attendanceDetails.class_id= student.class_id AND student.roll_no=attendance.roll_no)  where (attendanceDetails.class_id =${classId} AND subject_code ='${subjectCode}'  AND classType='${classType}' )) as a GROUP by a.roll_no `;
        let sql3 = `SELECT roll_no, name FROM student where class_id =${classId}`;
        let sql4 = `SELECT * FROM class where id = ${classId}`;
        let sql5 = `SELECT name FROM subject where code = "${subjectCode}"`;
        let result, counts, students, classes, subjects;

        try {
;
            result = await db.query(sql1);
            //counts = await db.query(sql2);
            students = await db.query(sql3);
            classes = await db.query(sql4);
            subjects = await db.query(sql5);
;
            let ids = new Set(result.map((item) => parseInt(item.id)));

            ids.forEach((element) => {
                attendanceList.push([element, { date: "", students: [] }]);
            });

            attendanceList = Object.fromEntries(attendanceList);
            result.forEach((element) => {
                attendanceList[element.id]["date"] = element.attendance_date;
                attendanceList[element.id]["students"].push(element.roll_no);
            });
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
;
            res.status(402).send("not found");
        }
    }
);

//summary of a class
router.get("/getSummary",auth, async(req, res)=>{
let batch="074"
let program="BCT"
let section = "A"
let sql=`SELECT classType, code, name, AVG(total) FROM ( SELECT attendanceDetails.id, classType, subject_code,class.batch, class.program_id, class_group FROM attendanceDetails JOIN class ON class_id=class.id WHERE class.batch='${batch}'AND class.program_id='${program}' AND class.class_group='${section}') as attendanceDetails JOIN subject on subject.code=attendanceDetails.subject_code JOIN (SELECT details_id, count(roll_no) as total FROM attendance GROUP BY details_id) as a on a.details_id=attendanceDetails.id GROUP BY batch,program_id,class_group,classType, code, name`
let result;
try{result= await db.query(sql);
console.log(result);
res.send(result)
}
catch(err)
{console.log(err);
    res.send(err)
}
})


router.post("/edit/:_id", auth, async (req, res) => {
    var body = req.body.students;
    console.log(body);
    console.log(req.params._id);
    var roll_nums = [];
    body.forEach((item) => {
        roll_nums.push([parseInt(req.params._id), item]);
    });

    try {;
        await db.query(
            `DELETE FROM attendance WHERE details_id = ${req.params._id}`
        );
        await db.query(
            `Insert into attendance (details_id, roll_no) values ?`,
            [roll_nums]
        );;
        res.status(200).send("done");
        console.log("Record Updated");
    } catch (err) {
        console.log(err);;
         res.status(402).send("not found");

    }
});

router.get("/delete/:_id", auth, async (req, res) => {
    try {;
        await db.query(
            `DELETE FROM attendance WHERE details_id = ${parseInt(
                req.params._id
            )}`
        );
        await db.query(
            `DELETE FROM attendanceDetails WHERE id = ${parseInt(
                req.params._id
            )}`
        );;
        console.log("One Record Deleted");
        res.status(200).send("ok");
    } catch (err) {

        console.log(err);;
        res.status(402).send("error");
    }
  
});

router.get("/deleteAll/:class/:subject/:type", auth, async (req, res) => {
    let sql = `select id FROM attendanceDetails WHERE (classType='${
        req.params.type
    }' AND subject_code='${req.params.subject}' AND class_id=${
        req.params.class
    } AND instructor_id=${parseInt(user)})`;
    try {;
        let result = await db.query(sql);
        result.forEach(async (record) => {
            await db.query(
                `DELETE FROM attendance WHERE details_id = ${record.id}`
            );
            await db.query(
                `DELETE FROM attendanceDetails WHERE id = ${record.id}`
            );
            console.log("Record Deleted");

            res.status(402).send("error");
        });
        
    } catch (err) {
        console.log(err);
        res.status(402).send("error");
    }
});

module.exports = router;
