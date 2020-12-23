'use strict';

/**
 * Import
 */
const {
    insertPlayingTable,
    findOnePlayingTable,
} = require('../../src/services/playingTableService');

/**
 * Game user add
 */
const gameUserAdd = async (socket, data) => {

    console.log(`gameUserAdd :: data :: ${socket.id}`, data);

    try {

        const query = {
            status: 0,
        };
        const playingTable = await findOnePlayingTable(query);

        
    } catch (error) {

        console.log("gameUserAdd :: Error ::", error);

    }

};

/**
 * Export functions
 */
module.exports = {
    gameUserAdd,
};