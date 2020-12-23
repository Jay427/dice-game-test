'use strict';

/**
 * Import module
 */
const morgan = require('morgan');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const server = require('http').Server(app);
const cors = require("cors");
const config = require('../config');
const logger = require('./helpers/logger');
const io = require('socket.io')(server);
const {
    bindSocketToEvent,
    disconnectSocketEventHandle,
} = require('../src/classes/eventCases.class');

/**
 * Set cors middleware
 */
app.use(cors());

/**
 * Set morgan middleware
 */
app.use(morgan('dev'));

/**
 * Set middleware that only parses json
 */
app.use(bodyParser.json({
    limit: '50mb',
}));

/**
 * Render index.html
 */
app.get('/', function (req, res) {

    res.sendFile(__dirname + '/views/index.html');

});

/**
 * Server socket connection
 */
io.on('connection', (socket) => {

    logger.info('Socket :: Connected :: Socket.id ::', socket.id);

    bindSocketToEvent(socket);

    disconnectSocketEventHandle(socket);

});

/**
 * Server listen
 */
server.listen(config.port, () => {

    logger.info(`Server :: Start :: Port :: ${config.port}`);

});