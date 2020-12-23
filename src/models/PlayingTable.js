'use strict';

/**
 * Playing table schema
 */
const mongoose = require('mongoose');

const schema = {
    players: {
        type: Array,
        required: true,
    },
    currentTurnSocketId: {
        type: String,
        required: true,
    },
    winnerUser: {
        type: String,
        default: null,
    },
    status: {
        type: Number,
        default: 0,
    },
    updatedOn: {
        type: Date,
        default: Date.now
    },
    createdOn: {
        type: Date,
        default: Date.now
    },
};

const PlayingTableSchema = new mongoose.Schema(schema);

const PlayingTable = function (db) {

    if (db) return db.model('PlayingTable', PlayingTableSchema);

    return mongoose.model('PlayingTable', PlayingTableSchema);

};

module.exports = PlayingTable;