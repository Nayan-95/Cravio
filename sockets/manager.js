const socketIO = require('socket.io');
const { addUser, removeUser, getUserSocketId } = require('./mappings');

let io;
let socketManager;

function initializeSocket(server, rabbitMQChannel) {
    io = socketIO(server, {
        cors: {
            origin: "*", // Adjust in production
            methods: ["GET", "POST"]
        }
    });
    
    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);
        
        // When a user identifies themselves (with their email)
        socket.on('register', (email) => {
            if (email) {
                addUser(email, socket.id);
                console.log(`User ${email} registered with socket ID ${socket.id}`);
            }
        });
        
        // Handle disconnection
        socket.on('disconnect', () => {
            removeUser(socket.id);
            console.log('Client disconnected:', socket.id);
        });
    });
    
    socketManager = {
        emitToUser: (email, event, data) => {
            const socketId = getUserSocketId(email);
            if (socketId) {
                io.to(socketId).emit(event, data);
                console.log(`Event ${event} emitted to ${email} (${socketId})`);
            } else {
                console.log(`User ${email} not connected`);
                // Optionally handle offline users (store messages, etc.)
            }
        },
        
        // Add other socket management methods as needed
    };
    
    return io;
}

function getSocketManager() {
    if (!socketManager) {
        throw new Error('Socket manager not initialized');
    }
    return socketManager;
}

module.exports = { initializeSocket, getSocketManager };