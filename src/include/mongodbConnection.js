'use strict';

/**
 * Imports module
 */
const config = require('../../config');
const logger = require('../../src/helpers/logger');
const mongoose = require('mongoose');

/**
 * Mongodb connection url
 */
let mongodbConnectionUrl = `mongodb://${config.mongo.host}:${config.mongo.port}/${config.mongo.dbName}`;

if (config.mongo.username != "" && config.mongo.password != "") {

    mongodbConnectionUrl = `mongodb://${config.mongo.username}:${config.mongo.password}@${config.mongo.host}:${config.mongo.port}/${config.mongo.dbName}`;

}

/**
 * Include db connection in global variable
 */
const db = mongoose.createConnection(mongodbConnectionUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
});

db.on('connected', () => {
    logger.info(`Mongodb :: Database :: Connection :: Done :: `);
});

db.on('error', (err) => {
    logger.error(`Mongodb :: Database :: Error :: `, err);
    process.exit(1);
});

db.on('disconnected', () => {
    logger.info(`Mongodb :: Database :: Disconnected :: `);
    process.exit(1);
});

/**
 * Export db connection
 */
module.exports = db;