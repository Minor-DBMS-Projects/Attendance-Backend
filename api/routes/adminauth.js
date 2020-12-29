let express = require("express");
let router = express.Router();
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
    const password  = req.body.body.password;
   
    let sql = `SELECT * FROM authentication`;
    
    try {
        let result = await db.query(sql)
        if (!result) {
            res.status(401).json({ message: "not found" })
        }
      const usr='admin'
      const isMatch = await bcrypt.compare(password, result[0].value);
      if (!isMatch) {
          res.status(401).json({ message: "not found" })
      }
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
