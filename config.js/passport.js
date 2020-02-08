const LocalStrategy = require ('passport-local').Strategy;
const db = require('./dataconn');
const bcrypt = require ('bcryptjs');

module.exports = function(passport)
{ 
	
	passport.use(new LocalStrategy(function(username, password, done)
	
	{   
		db.query(`SELECT * FROM user Where username = '${username}' limit 1` , function(err, row){
		 if(err) 
		console.log(err); 
		
		if(!row||(row.length==0)){ return done(null, false, ('message','Invalid username or password.')); }
		
		


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