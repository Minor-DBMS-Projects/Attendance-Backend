const db = require("./database");
const express = require("express");
const bcrypt = require("bcryptjs");
const http = require("follow-redirects").http;
const router = express.Router();

router.post("/add-user", async function (req, res, next) {
    let salt = await bcrypt.genSalt(10);
    let pass = await bcrypt.hash(req.body.password, salt);

    let sql = `INSERT IGNORE INTO instructor (name, password, code, department_id) values ("${req.body.username}","${pass}","${req.body.code}", "${req.body.dept}")`;
    try {
        await db.query(sql);
    } catch (err) {
        console.log(err);
    }
    console.log("user saved");
    
});


function performRequest(options, data, success) {
    let dataString = data;
    let responseData = [];
    let req = http.request(options, function (res) {
        res.on("data", function (data) {
            responseData.push(data);
        });

        res.on("end", function () {
            success(responseData);
        });
    });
    req.setHeader(
        "content-type",
        "multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW"
    );
    req.write(dataString);
    req.end();
}

function addClass(program, batch, group) {
    let classQuery =
        "INSERT IGNORE INTO class(batch, program_id, class_group) VALUES (?, ?, ?)";
    let studentQuery =
        "INSERT IGNORE INTO student(roll_no,name,class_id) VALUES ?";

    let options = {
        method: "POST",
        hostname: "pcampus.edu.np",
        path: "/api/students/",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        maxRedirects: 20,
    };

    performRequest(
        options,
        '------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name="prog"\r\n\r\n' +
            program +
            '\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name="batch"\r\n\r\n' +
            batch +
            '\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name="group"\r\n\r\n' +
            group +
            "\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW--",
        async function (data) {
            let classID;
            try {
                let result = await db.query(classQuery, [
                    batch,
                    program,
                    group,
                ]);
                classID = result.insertId;
                let body = Buffer.concat(data);
                studentList = JSON.parse(body.toString());
                for (let i = 0; i < studentList.length; i++) {
                    studentList[i][0] = studentList[i][2];
                    studentList[i].splice(1, 2);
                    studentList[i].push(classID);
                }
                await db.query(studentQuery, [studentList]);
                console.log("Class stored");
            } catch (err) {
                console.log(err);
            }
        }
    );
}

router.post("/add-class", (req, res) => {
    program = req.body.program.toString();
    batch = req.body.batch.toString();
    section = req.body.section.toString();

    addClass(program, batch, section.charAt(0));
    addClass(program, batch, section.charAt(1));
});

router.post("/add-sub", (req, res) => {
    program = req.body.program.toString();
    year = parseInt(req.body.year);
    part = parseInt(req.body.part);
    let subjectQuery =
        "INSERT IGNORE INTO subject(code, name, year, part, program_id) VALUES ?";

    let options = {
        method: "POST",
        hostname: "pcampus.edu.np",
        path: "/api/subjects/",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        maxRedirects: 20,
    };

    performRequest(
        options,
        '------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name="prog"\r\n\r\n' +
            program +
            '\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name="year"\r\n\r\n' +
            year +
            '\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name="part"\r\n\r\n' +
            part +
            "\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW--",
        async function (data) {
            let body = Buffer.concat(data);
            subjectList = JSON.parse(body.toString());
            for (let i = 0; i < subjectList.length; i++) {
                subjectList[i].splice(2, 2);
                subjectList[i].push(year);
                subjectList[i].push(part);
                subjectList[i].push(program);
            }
            try {
                await db.query(subjectQuery, [subjectList]);
                console.log("Subjects stored successfully!");
            } catch (err) {
                console.log(err);
            }
        }
    );
});

router.post("/edit-user", async function (req, res, next) {
    let q1 = `UPDATE instructor set name="${req.body.username}", code="${req.body.code}", department_id="${req.body.dept}" WHERE id=${req.body.id}`;
    try {
        await db.query(q1);
        console.log("user edited");
    } catch (err) {
        console.log(err);
    }
});

/*router.post('/edit-user-key',async function (req, res, next) {
    try{
  
    const salt =  await bcrypt.genSaltSync();
    var hash =   await bcrypt.hashSync(req.body.password, salt);
    saltedpassword = hash;
    }
   catch(err)
  {
    console.log("saltingerr..."+err);
  }

    let q1 = `UPDATE instructor set password="${hash}" WHERE id=${req.body.id}`;
    await db.query(q1)
    console.log('user key edited');
 
  res.redirect('/login');
  }

);
*/
router.post("/delete-user", async function (req, res, next) {
    let q1 = `DELETE FROM instructor WHERE id=${req.body.id}`;
    try {
        await db.query(q1);
        console.log("user deleted");
    } catch (err) {
        console.log(err);
    }
});

router.post("/add-program", async function (req, res, next) {
    let q1 = `INSERT IGNORE INTO program (id, name, department_id) values ("${req.body.id}", "${req.body.name}", "${req.body.dept}")`;
    try {
        await db.query(q1);
        console.log("program added");
    } catch (err) {
        console.log(err);
    }
});

router.post("/edit-program", async function (req, res, next) {
    let q1 = `UPDATE program set id="${req.body.id}", name="${req.body.name}", department_id="${req.body.dept}" WHERE id="${req.body.previd}"`;
    try {
        await db.query(q1);
        console.log("program updated");
    } catch (err) {
        console.log(err);
    }
});

router.post("/add-department", async function (req, res, next) {
    let q1 = `INSERT IGNORE INTO department (id, name) values ("${req.body.id}", "${req.body.name}")`;
    try {
        await db.query(q1);
        console.log("department saved");
    } catch (err) {
        console.log(err);
    }
});

router.post("/edit-department", async function (req, res, next) {
    let q1 = `UPDATE department set id="${req.body.id}", name="${req.body.name}" WHERE id="${req.body.previd}";`;
    try {
        await db.query(q1);
        console.log("department updated");
    } catch (err) {
        console.log(err);
    }
});

router.post("/delete-program", async function (req, res, next) {
    let q1 = `DELETE FROM program WHERE id="${req.body.id}"`;
    try {
        await db.query(q1);
        console.log("program deleted");
    } catch (err) {
        console.log(err);
    }
});

router.post("/delete-department", async function (req, res, next) {
    let q1 = `DELETE FROM department WHERE id="${req.body.id}"`;
    try {
        await db.query(q1);
        console.log("deartmet deleted");
    } catch (err) {
        console.log(err);
    }
});

module.exports = router;
