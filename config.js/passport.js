const LocalStrategy = require ('passport-local').Strategy;
const db = require('./dataconn');
const bcrypt = require ('bcryptjs');

const localOptions = { usernameField: 'code', passwordField: 'password' };
module.exports = function(passport)
{
	passport.use(new LocalStrategy(localOptions, function(code, password, done)
	
	{   
		db.query("select * from instructor where code = ? limit 1", [code], function(err, row){
		 if(err) 
		console.log(err); 
		
		if(!row){ return done(null, false, ('message','Invalid username or password.')); }
		
		


		bcrypt.compare(password.toString(), row[0].password.toString(), function(err, isMatch)
			{


				if (err) console.log(err);
				if(isMatch)
				{


					return done(null, row[0]);

				}
				else 
				{
					return done(null, false, {message:'Wrong password'});
				}
			})
        
      });
		
		
		
	}))



}