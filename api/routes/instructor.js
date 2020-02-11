let express = require('express');
let db = require("../../config.js/dataconn");
let router = express.Router();
let { auth } = require('../../config.js/usercheck');

router.get('/', (req, res, next)=>{
    let sql = 'SELECT name as instructor, id as email from instructor';
    db.query(sql)
    .then(row=>{
        res.status(200).json(row);
        return row;
    })
    .catch(next)
});

module.exports = router;