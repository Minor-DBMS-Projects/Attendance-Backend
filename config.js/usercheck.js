const db = require('./dataconn');
const isauth = (req, res, next) => {
    if(req.isAuthenticated()){
      
      next()
      
      
    }
    else
      res.redirect('back')
    
  }


  const isadmin = (req, res, next)=> {
    if(req.isAuthenticated()){
   
      user=req.user||null
      db.query("select * from user where id = ? limit 1", [user],function (err, result) {
        if (err) throw err;
        
        if(result[0].type=='admin')
    
        next()
      })
      
      
    }
    else
      res.redirect('back')
    
  }
  module.exports.admin= isadmin
  module.exports.auth= isauth
  