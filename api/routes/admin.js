let db = require("../../config.js/dataconn");
let express = require("express");
const bcrypt = require("bcryptjs");
var http = require("follow-redirects").http;
let router = express.Router();

router.get("/add-user", (req, res, next) => {
  res.render("add-user");
});

router.post("/add-user", async function (req, res, next) {
  try {
    const salt = await bcrypt.genSaltSync();
    var hash = await bcrypt.hashSync(req.body.password, salt);
    saltedpassword = hash;
  } catch (err) {
    console.log("saltingerr..." + err);
  }

  let q1 = `INSERT IGNORE INTO instructor (name, password, code, department_id) values ("${req.body.username}","${hash}", "${req.body.code}", "${req.body.dept}")`;
  await db.query(q1);
  console.log("user saved");

  res.redirect("/login");
});

function performRequest(options, data, success) {
  var dataString = data;
  var req = http.request(options, function (res) {
    var responseData = [];

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

router.get("/add-class", (req, res) => {
  res.render("add-class");
});

router.post("/add-class", (req, res) => {
  program = req.body.program.toString();
  batch = req.body.batch.toString();
  section = req.body.section.toString();

  addClass(program, batch, section.charAt(0));
  addClass(program, batch, section.charAt(1));
  res.redirect("/");
});

function addClass(program, batch, group) {
  var classQuery =
    "INSERT IGNORE INTO class(batch, program_id, class_group) VALUES (?, ?, ?)";
  var studentQuery =
    "INSERT IGNORE INTO student(roll_no,name,class_id) VALUES ?";

  var options = {
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
    function (data) {
      db.query(classQuery, [batch, program, group], (err, result) => {
        let classID;
        classID = result.insertId;
        var body = Buffer.concat(data);
        studentList = JSON.parse(body.toString());
        for (var i = 0; i < studentList.length; i++) {
          studentList[i][0] = studentList[i][2];
          studentList[i].splice(1, 2);
          studentList[i].push(classID);
        }
        db.query(studentQuery, [studentList], (err, result) => {
          if (err) console.log(err);
          else console.log("data stored successfully");
        });
      });
    }
  );
}

router.get("/add-sub", (req, res) => {
  res.render("add-sub");
});

router.post("/add-sub", (request, response) => {
  program = request.body.program.toString();
  year = parseInt(request.body.year);
  part = parseInt(request.body.part);
  var subjectQuery =
    "INSERT IGNORE INTO subject(code, name, year, part, program_id) VALUES ?";

  var options = {
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
    function (data) {
      var body = Buffer.concat(data);
      subjectList = JSON.parse(body.toString());
      for (var i = 0; i < subjectList.length; i++) {
        subjectList[i].splice(2, 2);
        subjectList[i].push(year);
        subjectList[i].push(part);
        subjectList[i].push(program);
      }

      db.query(subjectQuery, [subjectList], (err, result) => {
        if (err) console.log(err);
        else console.log("data stored successfully");
        response.redirect("/");
      });
    }
  );
});

module.exports = router;
