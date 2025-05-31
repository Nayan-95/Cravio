const { getSocketManager } = require('../sockets/manager');

function processMessage(msg, channel) {
    try {
        const message = JSON.parse(msg.content.toString());
        console.log('Received message:', message);
        
        // Get the socket manager to emit events
        const socketManager = getSocketManager();
        
        // Here you would typically:
        // 1. Process the message
        // 2. Find the socket ID based on user/email
        // 3. Emit the message to the specific client
        
        // Example: Emit to a specific user
        if (message.email) {
            socketManager.emitToUser(message.email, 'notification', message);
        }
        
        // Acknowledge the message
        channel.ack(msg);
    } catch (error) {
        console.error('Error processing message:', error);
        channel.nack(msg); // Negative acknowledgment in case of error
    }
}

module.exports = { processMessage };