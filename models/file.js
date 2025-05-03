const mongoose = require('mongoose');
const { type } = require('os');
const Schema = mongoose.Schema;

const fileSchema = new Schema({
    filename: {type: String, required: true},
    originalname: {type: String},
    slug: {type: String, required: true, unique: true},
    path: {type: String, required: true},
    size: {type: Number, required: true},
    uuid: {type: String, required: true},
    public_id: {type: String},
    sender: {type: String, required: false},
    receiver: {type: String, required: false},
    expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), index: { expiresAfterSeconds: 86400 } }

}, {timestamps: true});

module.exports = mongoose.model('File', fileSchema);