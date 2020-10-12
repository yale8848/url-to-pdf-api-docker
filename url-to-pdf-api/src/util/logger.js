const path = require('path');
const winston = require('winston');
const _ = require('lodash');
const config = require('../config');
const date = require('./date');

const showLog = config.SHOW_LOG;

const COLORIZE = config.NODE_ENV === 'development';


function createLogger(filePath) {

    const fileName = path.basename(filePath);

    const info = new winston.Logger({
        transports: [new winston.transports.Console({
                colorize: COLORIZE,
                label: fileName,
                timestamp: true,
            }),
            new winston.transports.File({
                name: 'info-file',
                filename: path.join(config.LOG_PATH, 'info.log'),
                level: 'info',
                maxsize: '1000000',
                maxFiles: '100',
                timestamp: function() {
                    return new date().Format("yyyy-MM-dd hh:mm:ss");
                },
            }),
        ],
    });

    const error = new winston.Logger({
        transports: [new winston.transports.Console({
                colorize: COLORIZE,
                label: fileName,
                timestamp: true,
            }),
            new winston.transports.File({
                name: 'error-file',
                filename: path.join(config.LOG_PATH, 'error.log'),
                level: 'error',
                maxsize: '1000000',
                maxFiles: '100',
                timestamp: function() {
                    return new date().Format("yyyy-MM-dd hh:mm:ss");
                },
            })
        ],
    });

    function logger() {

    }

    logger.prototype.info = function(v) {
        if (!showLog) {
            return;
        }
        info.info(v);
    };
    logger.prototype.error = function(v) {
        error.error(v);
    };
    logger.prototype.log = function(type, v) {
        if (!showLog) {
            return;
        }
        this.info(type + " " + v);
    };
    logger.prototype.warn = function(v) {
        if (!showLog) {
            return;
        }
        this.info(v);
    };
    logger.prototype.debug = function(v) {
        if (!showLog) {
            return;
        }
        this.info(v);
    };


    //_setLevelForTransports(logger, config.LOG_LEVEL || 'error');
    return new logger();
}

function _setLevelForTransports(logger, level) {
    _.each(logger.transports, (transport) => {
        // eslint-disable-next-line
        transport.level = level;
    });
}

module.exports = createLogger;