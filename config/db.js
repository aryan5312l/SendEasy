require('dotenv').config();
const mongoose = require('mongoose');

function connectDB(){
    //Database Connection
    mongoose.connect(process.env.MONGO_CONNECTION_URL, {useNewUrlParser: true, useUnifiedTopology: true});

    const connection = mongoose.connection;

    connection.once('open', () => {
        console.log('Database Connected');
    });

    connection.on('error', (err) => {
        console.log('Connection failed: ', err);
        process.exit(1); // Exit if unable to connect
    })
}

module.exports = connectDB;