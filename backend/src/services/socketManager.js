const { Server } = require('socket.io');

let io = null;
const connectedUsers = new Map();

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });
  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.io not initialized. Call initSocket(server) first.');
  return io;
}

function getConnectedUsers() {
  return connectedUsers;
}

module.exports = { initSocket, getIO, getConnectedUsers };
