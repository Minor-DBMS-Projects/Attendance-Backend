const db = require('./dataconn');
const isauth = (req, res, next) => {
    if(req.isAuthenticated()){
      
      next()
      
      
    }
    else
      res.redirect('/login')
    
  }

  module.exports.auth= isauth
  