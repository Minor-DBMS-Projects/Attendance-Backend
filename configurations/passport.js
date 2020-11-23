const LocalStrategy = require('passport-local').Strategy;
const db = require('../api/routes/database');
const bcrypt = require('bcryptjs');

const localOptions = { usernameField: 'code', passwordField: 'password' };
module.exports = function (passport) {
	passport.use(new LocalStrategy(localOptions, async function (code, password, done) {
		let row;
		try {
			row = await db.query("select * from instructor where code = ? limit 1", [code])
			if (!row) { return done(null, false, ('message', 'Wrong code or password')); }

			let isMatch = await bcrypt.compare(password.toString(), row[0].password.toString())
			if (isMatch) {
				return done(null, row[0]);
			}
			else {
				return done(null, false, { message: 'Wrong code or password' });
			}
		}
		catch (err) {
			console.log(err)
		}
	}))
}