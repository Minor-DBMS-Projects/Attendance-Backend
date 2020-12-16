let express = require("express");
let router = express.Router();
let { auth } = require("../../configurations/usercheck");
let db = require("./database");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const { JWT_KEY } = process.env;

router.get("/authenticate", auth, (req, res) => {
    res.status(200).json({
        authenticated: true,
        message: "user successfully authenticated",
        user: req.user
    });
});
//login logout routes



router.post("/login", async function (req, res, next) {
    const { code, password } = req.body;
    let sql = `SELECT * FROM instructor WHERE code='${code}'`;
    let resUser;
    try {
        resUser = await db.query(sql)
        if (!resUser) {
            res.json("not found")
        }

        const isMatch = await bcrypt.compare(password, resUser[0].password);
        if (!isMatch) {
            res.json({ message: "not found" })
        }

        const userId = resUser[0].id
        const token =  jwt.sign({ userId }, JWT_KEY, {
            expiresIn: 1800,
        });
        
        res.status(200).json({ token:token });


    }
    catch (err) {
        res.status(401).json("there is some error logging in"+err)
    }

});



module.exports = router;
