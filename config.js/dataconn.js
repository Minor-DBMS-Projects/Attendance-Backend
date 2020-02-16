var mysql        = require('mysql');
    var connection   = mysql.createConnection({
      supportBigNumbers: true,
      bigNumberStrings: true,
      host     : "localhost",
      user     : "root",
      password : "Funny@123",
      database : "schema_attendance"
    });

    connection.connect(function(err) {
      if (err) {
        return console.error('error: ' + err.message);
      }
     
      console.log('Connected to the MySQL server.');
    }); 
    module.exports = connection;