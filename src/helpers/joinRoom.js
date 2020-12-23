'use strict';

/**
 * Join room function
 */
const joinRoom = (socket, roomId) => {

    socket.join(roomId.toString());
    socket.roomId = roomId.toString();
    
};

/**
 * Exports joinRoom
 */
module.exports = joinRoom;