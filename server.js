const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

//cors
const corsOptions = {
    origin: process.env.ALLOWED_CLIENTS.split(',')
}

app.use(cors(corsOptions));

//Static files
app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.static(path.join(__dirname, '../fileSharing')));



app.use(express.json());

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
app.use('/api/files', require('./routes/files'));


app.listen(PORT, () => {
    console.log(`Listing on Port ${PORT}`);
})