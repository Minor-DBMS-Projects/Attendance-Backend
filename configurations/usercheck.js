const db = require('./configs');
var jwt = require("jsonwebtoken");

const { JWT_KEY } = process.env;


const isAuth = (req, res, next) => {

  if (req.method === "OPTIONS") {
    return next();
  }
 
  let token =req.cookies['attendance-jwt-token']


  
  jwt.verify(token, JWT_KEY, (err, decoded) => {
    
    if (err) {
      

     res.status(401).send({ message: "invalid!"+err });
    }
    else
    {
    
    req.user = decoded.userId;
    
    
    next();
    }
  });
};



module.exports.auth = isAuth


