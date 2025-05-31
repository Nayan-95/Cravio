const connectDB = require('./config/db');
const app = require('./app');
const http = require('http');
const { initializeRabbitMQ } = require('./rabbitmq/connection');
const { initializeSocket } = require('./sockets/manager');

// Create HTTP server with Express app
const server = http.createServer(app);

// Initialize all services when server starts
async function startServer() {
    try {
        // Connect to database
        await connectDB();
        
        // Initialize RabbitMQ connection and consumer
        const { channel } = await initializeRabbitMQ();
        
        // Initialize Socket.IO with the server and channel
        initializeSocket(server, channel);
        
        const PORT = process.env.PORT || 5000;
        server.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
            console.log(`WebSocket server is running`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();