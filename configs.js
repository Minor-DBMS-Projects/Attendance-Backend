var mysql = require('mysql')


const express_config = {
    //port:process.env.PORT || 3000
    port:process.env.PORT || 3000
};

const databaseName = 'schema_attendance';
const database_config ={
    supportBigNumbers: true,
    bigNumberStrings: true,
    host: 'localhost',
    user: 'root',
    password: 'Famous1234',
    database: databaseName,
    dateStrings:true


}




module.exports.databaseConfig = database_config;
module.exports.expressConfig = express_config;