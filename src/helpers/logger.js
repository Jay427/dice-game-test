'use strict';

/**
 * Import module
 */
const winston = require('winston');
const moment = require('moment-timezone');

/**
 * Logger configuration
 */
const logger = new(winston.Logger)({
    exitOnError: false,
    transports: [
        new(winston.transports.Console)({
            level: 'debug',
            timestamp: () => moment().format('DD.MM.YYYY HH:mm:ss'),
            colorize: true,
            handleExceptions: true
        }),
    ]
});

/**
 * Exports logger
 */
module.exports = logger;