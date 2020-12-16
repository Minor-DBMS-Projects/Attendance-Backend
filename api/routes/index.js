let express = require("express");
let router = express.Router();
let { auth } = require("../../configurations/usercheck");



router.get("/", auth, (req, res, next) => {
  res.redirect("/attendance/getRecent/30");
});

module.exports = router;
