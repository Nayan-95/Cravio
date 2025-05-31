const userSocketMap = new Map();  // email -> socketId
const socketUserMap = new Map();  // socketId -> email

function addUser(email, socketId) {
    // Remove any existing mapping for this socket ID
    if (socketUserMap.has(socketId)) {
        const oldEmail = socketUserMap.get(socketId);
        userSocketMap.delete(oldEmail);
    }
    
    // Remove any existing mapping for this email
    if (userSocketMap.has(email)) {
        const oldSocketId = userSocketMap.get(email);
        socketUserMap.delete(oldSocketId);
    }
    
    // Add new mappings
    userSocketMap.set(email, socketId);
    socketUserMap.set(socketId, email);
}

function removeUser(socketId) {
    if (socketUserMap.has(socketId)) {
        const email = socketUserMap.get(socketId);
        userSocketMap.delete(email);
        socketUserMap.delete(socketId);
    }
}

function getUserSocketId(email) {
    return userSocketMap.get(email);
}

module.exports = { addUser, removeUser, getUserSocketId };