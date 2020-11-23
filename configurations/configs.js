const dotenv = require('dotenv').config()

const express_config = {

  port:process.env.PORT || 3082
};
const databaseName = 'schema_attendance';
const database_config ={
  supportBigNumbers: true,
  bigNumberStrings: true,
  host:  process.env.DB_HOST,
  user:  process.env.DB_USER,
  password:  process.env.DB_PASSWORD,
  database: databaseName,
  dateStrings:true


}

module.exports.databaseConfig = database_config;
module.exports.expressConfig = express_config;
