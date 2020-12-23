'use strict';

/**
 * Import module
 */
const {
    defaultSocketSchema,
} = require('../../src/joiSchema');
const playingTableClass = require('../../src/classes/playingTable.class');

/**
 * Bind socket event function
 */
const bindSocketToEvent = async (socket) => {

    socket.on('req', async (data) => {

        console.log('Socket :: Req :: data ::', data);

        /**
         * Validate default data schema
         */
        const validateData = defaultSocketSchema.validate(data);

        if (validateData.error && validateData.error !== null)
            return false;

        switch (data.en) {

            case 'GAME_USER_ADD':
                playingTableClass.gameUserAdd(socket, data.data);
                break;

            case 'GAME_USER_TURN':
                playingTableClass.gameUserTurn(socket, data.data);
                break;

            default:
                console.log('Socket :: Event Case Not Match ::');

        }

    });

};

/**
 * Disconnect socket event handle function
 */
const disconnectSocketEventHandle = async (socket) => {

    socket.on('disconnect', async () => {
        console.log('Socket :: Disconnect :: SocketId ::', socket.id);
    });

};

/**
 * Export functions
 */
module.exports = {
    bindSocketToEvent,
    disconnectSocketEventHandle,
};