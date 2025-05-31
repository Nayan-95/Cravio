const amqp = require('amqplib');
const { processMessage } = require('./consumer');

let channel;

async function initializeRabbitMQ() {
    try {
        const connection = await amqp.connect('amqp://localhost');
        channel = await connection.createChannel();
        
        // Assert the queue exists or create it
        const queue = 'notifications';
        await channel.assertQueue(queue, { durable: true });
        
        console.log('RabbitMQ connected and channel created');
        
        // Start consuming messages
        consumeMessages();
        
        return { channel };
    } catch (error) {
        console.error('Error connecting to RabbitMQ:', error);
        throw error;
    }
}

function consumeMessages() {
    const queue = 'notifications';
    
    channel.consume(queue, (msg) => {
        if (msg !== null) {
            processMessage(msg, channel);
        }
    }, { noAck: false });
}

module.exports = { initializeRabbitMQ, getChannel: () => channel };