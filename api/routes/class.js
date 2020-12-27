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

        res.status(402).send("not found");
    }
});

router.get('/', async (req, res, next) => {

    let sql = 'SELECT * from class;';

    try {

        let result = await db.query(sql)

        res.json(result);
    }
    catch (err) {
        throw err;
    }


});

router.get('/:_id', async (req, res, next) => {

    let sql = `SELECT * from class WHERE id="${req.params._id}";`;

    try {

        let result = await db.query(sql)
        res.json(result);

    }
    catch (err) {
        throw err;
    }
});



module.exports = router;
