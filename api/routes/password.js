let express = require('express');
let db = require("./database");
let router = express.Router();
let { auth } = require('../../configurations/usercheck');
let { admin } = require('../../configurations/usercheck');



module.exports = router;