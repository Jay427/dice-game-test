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
global.io = require('socket.io')(server); // Demo purpose declare as global variable
const {
    bindSocketToEvent,
    disconnectSocketEventHandle,
} = require('../src/classes/eventCases.class');
const {
    deleteManyPlayingTable,
} = require('../src/services/playingTableService');

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
server.listen(config.port, async () => {

    logger.info(`Server :: Start :: Port :: ${config.port}`);

    await removePendingTable();

});

/**
 * Remove pending table from database for manage playing table
 */
const removePendingTable = async () => {

    await deleteManyPlayingTable({
        status: 0,
    });

};