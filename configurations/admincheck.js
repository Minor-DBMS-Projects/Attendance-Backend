const db = require('./configs');
var jwt = require("jsonwebtoken");

const { JWT_KEY } = process.env;


const isAdmin = (req, res, next) => {

  if (req.method === "OPTIONS") {
    return next();
  }
 
  //if using postmn--- let token =JSON.parse(req.headers.authorization); 
  let token =req.headers.authorization; 

  if (!token) {
  
    return res.status(401).send({ message: "No token provided!" });
  }
  
  
  jwt.verify(token, JWT_KEY, (err, decoded) => {
    
    if (err) {
      

      return res.status(401).send({ message: "invalid!"+err });
    }
    else
    {
    next();
    }
  });
};



module.exports.isAdmin = isAdmin


