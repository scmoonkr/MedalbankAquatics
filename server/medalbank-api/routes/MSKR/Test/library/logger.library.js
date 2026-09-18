const winston = require('winston');

class Logger {
    constructor() {
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({ filename: 'app.log' }),
            ],
        });
    }

    logInfo(message, meta = {}) {
        this.logger.info(message, meta);
    }

    logError(message, meta = {}) {
        this.logger.error(message, meta);
    }

    logWarning(message, meta = {}) {
        this.logger.warn(message, meta);
    }

    logDebug(message, meta = {}) {
        this.logger.debug(message, meta);
    }

    customLog(level, message, meta = {}) {
        this.logger.log({ level, message, ...meta });
    }
}

module.exports = new Logger();
