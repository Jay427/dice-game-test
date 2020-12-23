'use strict';

/**
 * Import mo
 */
const db = require('../../src/include/mongodbConnection');
const PlayingTable = require('../../src/models/PlayingTable')(db);

/**
 * Insert playing table
 */
exports.insertPlayingTable = async (data) => {

    const container = {
        error: null,
        data: null
    };

    try {

        const playingTableModel = new PlayingTable(data);

        const playingTable = await playingTableModel.save();

        container.data = playingTable;

        return (container);

    } catch (error) {

        container.error = error;

        return (container);

    }

};

/**
 * Find one playing table
 */
exports.findOnePlayingTable = async (query, fields = []) => {

    const container = {
        error: null,
        data: null
    };

    try {

        const playingTable = await PlayingTable.findOne(query).select(fields).sort({
            createdOn: -1
        });

        container.data = playingTable;

        return (container);

    } catch (error) {

        container.error = error;

        return (container);

    }

};