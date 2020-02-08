const winston = require('winston');
const consoleTransport = new winston.transports.Console();

const options = {
    transports:[consoleTransport]
}

const logger = new winston.createLogger(options);

function logRequest(req, res, next){
    logger.info(req.url);
    next();
}

function logError(req, res, next){
    logger.error(err);
    next();
}


module.exports.logRequest = logRequest;
module.exports.logError = logError;