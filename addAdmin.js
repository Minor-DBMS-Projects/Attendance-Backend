let db = require("./config.js/dataconn");
const bcrypt = require ('bcryptjs');
  
 async function insertAdmin(name, code, password, type) {


    try{
  
      const salt =  await bcrypt.genSaltSync();
      var hash =   await bcrypt.hashSync(password, salt);
      saltedpassword = hash;
       }
      catch(err)
     {
       console.log("saltingerr..."+err);
     }


    let q1 = `INSERT IGNORE INTO user (username,code,password, type) VALUES ("${name}", "${code}", "${saltedpassword}", "${type}")`;
    db.query(q1);
  }
insertAdmin("Kanchan", "admin1", "1234", "admin")