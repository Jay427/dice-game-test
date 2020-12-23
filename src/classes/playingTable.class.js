'use strict';

/**
 * Import
 */
const schedule = require('node-schedule');
const config = require('../../config');
const {
    INTERNAL_SERVER_ERROR,
    PLAYING_TABLE_NOT_FOUND_ERROR,
} = require('../../src/constant/errorMessages');
const {
    gameUserAddSchema,
    gameUserTurnSchema,
} = require('../../src/joiSchema');
const {
    insertPlayingTable,
    findOnePlayingTable,
    findOneAndUpdatePlayingTable,
} = require('../../src/services/playingTableService');
const joinRoom = require('../../src/helpers/joinRoom');
const emitRoom = require('../../src/helpers/emitRoom');

/**
 * Game user add
 */
const gameUserAdd = async (socket, data) => {

    console.log(`gameUserAdd :: data :: ${socket.id}`, data);

    try {

        /**
         * Validate socket data
         */
        const validateData = gameUserAddSchema.validate(data);

        if (validateData.error && validateData.error !== null)
            throw new Error(validateData.error.message);

        /**
         * Check any playing table is pending
         */
        const findQuery = {
            status: 0,
        };
        const playingTableData = await findOnePlayingTable(findQuery);

        if (playingTableData.error)
            throw new Error(INTERNAL_SERVER_ERROR);

        if (playingTableData.data) {

            const {
                _id: tableId,
                players,
            } = playingTableData.data;
            let isPlayingStart = false;

            const updateQuery = {
                _id: tableId,
            };
            const updateData = {
                $push: {
                    players: {
                        userName: data.userName,
                        socketId: socket.id,
                        score: 0,
                    },
                },
            };
            if (players.length === 3) {

                isPlayingStart = true;

                updateData.$set = {
                    status: 1
                };

            }
            /**
             * Playing table update
             */
            const updatePlayingTable = await findOneAndUpdatePlayingTable(updateQuery, updateData);

            if (updatePlayingTable.error)
                throw new Error(INTERNAL_SERVER_ERROR);

            /**
             * Insert user socket id in room
             */
            joinRoom(socket, tableId);

            if (isPlayingStart) {

                const {
                    players: updatedPlayers,
                    currentTurnSocketId,
                } = updatePlayingTable.data;

                const sendData = {
                    players: updatedPlayers,
                    currentTurnSocketId,
                    diceNumber: 1,
                };

                /**
                 * Turn timer start for next user
                 */
                timerStart({
                    jobId: currentTurnSocketId,
                    timeInSeconds: config.turnTimer,
                    tableId,
                });

                /**
                 * Emit TAKE_TURN in room
                 */
                emitRoom(tableId, 'TAKE_TURN', sendData);

            }

        } else {

            /**
             * Insert playing table
             */
            const playingTableObj = {
                players: [{
                    userName: data.userName,
                    socketId: socket.id,
                    score: 0,
                }],
                currentTurnSocketId: socket.id,
            };
            const insertPlayingTableData = await insertPlayingTable(playingTableObj);

            if (insertPlayingTableData.error)
                throw new Error(INTERNAL_SERVER_ERROR);

            const {
                _id: tableId,
            } = insertPlayingTableData.data;

            /**
             * Insert user socket id in room
             */
            joinRoom(socket, tableId);

        }

    } catch (error) {

        console.log("gameUserAdd :: Error ::", error);

    }

};

/**
 * Game user turn
 */
const gameUserTurn = async (socket, data) => {

    console.log(`gameUserTurn :: data :: ${socket.id}`, data);

    try {

        let nextTurnSocketId;
        let currentTurnIndex;
        /**
         * Validate socket data
         */
        const validateData = gameUserTurnSchema.validate(data);

        if (validateData.error && validateData.error !== null)
            throw new Error(validateData.error.message);

        /**
         * Timer stop when user take turn
         */
        timerStop(socket.id);

        const query = {
            _id: socket.roomId,
        };

        /**
         * Check valid playing table id in database
         */
        const playingTableData = await findOnePlayingTable(query);

        if (playingTableData.error)
            throw new Error(INTERNAL_SERVER_ERROR);

        if (!playingTableData.data)
            throw new Error(PLAYING_TABLE_NOT_FOUND_ERROR);

        /**
         * Decide next turn socket id
         */
        playingTableData.data.players.map((item, i) => {

            if (item.socketId === socket.id) {
                currentTurnIndex = i;
                if (i === 3) {
                    nextTurnSocketId = playingTableData.data.players[0]['socketId'];
                } else {
                    nextTurnSocketId = playingTableData.data.players[i + 1]['socketId'];
                }
            }

        });

        const updateQuery = {
            'players.socketId': socket.id,
        };
        const updateData = {
            $inc: {
                'players.$.score': data.diceNumber * 2,
            },
            $set: {
                currentTurnSocketId: nextTurnSocketId,
            }
        };

        /**
         * Update player score and current turn socket id
         */
        const updatePlayingTable = await findOneAndUpdatePlayingTable(updateQuery, updateData);

        if (updatePlayingTable.error)
            throw new Error(INTERNAL_SERVER_ERROR);

        const {
            _id,
            players,
        } = updatePlayingTable.data;

        const sendData = {
            players: players,
            currentTurnSocketId: nextTurnSocketId,
            diceNumber: data.diceNumber,
        };

        /**
         * Emit TAKE_TURN in room
         */
        emitRoom(socket.roomId, 'TAKE_TURN', sendData);

        /**
         * Winning condition check
         */
        if (players[currentTurnIndex].score * 1 >= config.winningScore * 1) {

            const updateQuery = {
                _id,
            };
            const updateData = {
                winnerUser: players[currentTurnIndex].userName,
            };

            /**
             * Winner user update in playing table
             */
            const updatePlayingTable = await findOneAndUpdatePlayingTable(updateQuery, updateData);

            if (updatePlayingTable.error)
                throw new Error(INTERNAL_SERVER_ERROR);

            const sendData = {
                winnerSocketId: players[currentTurnIndex].socketId,
                winnerUser: players[currentTurnIndex].userName,
            };

            /**
             * Emit GAME_END in room
             */
            emitRoom(socket.roomId, 'GAME_END', sendData);

        } else {

            /**
             * Turn timer start for next user
             */
            timerStart({
                jobId: nextTurnSocketId,
                timeInSeconds: config.turnTimer,
                tableId: socket.roomId,
            });

        }

    } catch (error) {

        console.log("gameUserAdd :: Error ::", error);

    }

};

/**
 * Timer start function
 * @param {*} seconds 
 */
const timerStart = async (data) => {
    console.log("***********************************")
    console.log("timerStart :: data ::", data);
    if (typeof data.jobId == 'undefined') return false;
    if (typeof data.timeInSeconds == 'undefined') return false;

    const jobId = data.jobId.toString();
    const time = new Date();
    time.setSeconds(time.getSeconds() + Number(data.timeInSeconds));

    schedule.scheduleJob(jobId, time, function () {
        schedule.cancelJob(jobId);
        timerExpire(data);
    });

};

/**
 * Time expire function
 * @param {*} data 
 */
const timerExpire = async (data) => {
    console.log("***********************************")
    console.log("timerExpire :: data ::", data);
    const diceNumber = Math.floor(Math.random() * 6) + 1;
    gameUserTurn({
        id: data.jobId,
        roomId: data.tableId
    }, {
        diceNumber
    })
};

/**
 * Time stop function
 * @param {*} jobId 
 */
const timerStop = async (jobId) => {
    console.log("***********************************")
    console.log("timerStop :: jobId ::", jobId);
    if (typeof jobId == 'undefined') return false;

    schedule.cancelJob(jobId.toString());

};

/**
 * Export functions
 */
module.exports = {
    gameUserAdd,
    gameUserTurn,
};