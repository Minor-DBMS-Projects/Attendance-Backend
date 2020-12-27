let express = require("express");
let router = express.Router();
let { auth } = require("../../configurations/usercheck");
let { isAdmin} = require("../../configurations/admincheck");
let db = require("./database");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const { JWT_KEY } = process.env;

router.get("/authenticate",isAdmin, (req, res) => {
    res.status(200).json({
        authenticated: true,
        message: "admin successfully authenticated",
    });
});


router.post("/login", async function (req, res, next) {
    const { password } = req.body;
    
    let sql = `SELECT * FROM authentication WHERE value='${password}'`;
    console.log(sql)
  
    try {
        let result = await db.query(sql)
        if (!result) {
            res.json({ message: "not found" })
        }
      const usr='admin'
        const token =  jwt.sign({usr},  JWT_KEY, {
            expiresIn: 1800,
        });
       
        res.status(200).json({ token:token });


    }
    catch (err) {
        res.status(401).json("there is some error logging in"+err)
    }

});



module.exports = router;
