const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
require('dotenv').config();


const PORT = process.env.PORT || 3000;

//cors
const corsOptions = {
    origin: process.env.ALLOWED_CLIENTS ? process.env.ALLOWED_CLIENTS.split(',') : "*",
    methods: ["GET", "POST", "OPTIONS"]
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

//Cleanup service
require('./services/cleanupService');

//Static files
app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.static(path.join(__dirname, '../fileSharing')));

//template
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

app.use((req, res, next) => {
    console.log(`Request for ${req.url}`);
    next();
});

//DB Connection
const connectDB = require('./config/db');
connectDB();

//Routes
app.use('/api/files', require('./routes/files'));
app.use('/files', require('./routes/show'));
app.use('/files/download', require('./routes/download'));
app.use('/s', require('./routes/short'));
//app.use('/api/files', require('./routes/files'));


app.listen(PORT, () => {
    console.log(`Listing on Port ${PORT}`);
})