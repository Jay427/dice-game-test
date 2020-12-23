'use strict';

/**
 * Emit room function
 */
const emitRoom = (roomId, en, data) => {

    io.to(roomId.toString()).emit('res', {
        en: en,
        data: data,
    });

};

/**
 * Exports emitRoom
 */
module.exports = emitRoom;