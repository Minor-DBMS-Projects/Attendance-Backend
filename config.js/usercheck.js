const isauth = (req, res, next) => {
    if(req.isAuthenticated()){
      
      next()
      
      
    }
    else
      res.redirect('back')
    
  }
  module.exports.auth= isauth
  