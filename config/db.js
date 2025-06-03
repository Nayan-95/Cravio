const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const username = process.env.DB_USERNAME;
    const password = process.env.DB_PASSWORD;
    const URL = `mongodb://${username}:${password}@ac-0irl3ft-shard-00-00.fxahxyi.mongodb.net:27017,ac-0irl3ft-shard-00-01.fxahxyi.mongodb.net:27017,ac-0irl3ft-shard-00-02.fxahxyi.mongodb.net:27017/cravio?ssl=true&replicaSet=atlas-idc13v-shard-0&authSource=admin&retryWrites=true&w=majority&appName=blog-app`;
    await mongoose.connect(URL);
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};
module.exports = connectDB;
