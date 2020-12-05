let express = require("express");
let router = express.Router();
var passport = require("passport");
let { auth } = require("../../configurations/usercheck");
let db = require("./database");

router.get("/authentication", auth, (req, res) => {
  res.status(200).json({
    authenticated: true,
    message: "user successfully authenticated",
    user: req.user,
    cookies: req.cookies,
  });
});
//login logout routes

//login logout routes

router.get("/login", (req, res, next) => {
  if (!user) {
    res.render("login");
  } else res.redirect("/");
});

router.get("/logout", auth, function (req, res, next) {
  req.logOut();
  res.redirect("/");
});

router.post("/login", function (request, response, next) {
  passport.authenticate("local", function (err, user, info) {
    if (err) console.log(err + "   inauth err");

    if (!user) {
      console.log("no user");
      response.sendStatus(401);
    } else {
      request.login(user, function (error) {
        if (error) return next(error);
        else response.sendStatus(200);
      });
    }
  })(request, response, next);
});

router.get("/", auth, (req, res, next) => {
  res.redirect("/attendance/getRecent/30");
});

module.exports = router;
