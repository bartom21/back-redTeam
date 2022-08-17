const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const versionSchema = new Schema({
    id: {
        type: Schema.Types.Number,
        requiered: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    state: {
        type: String,
        default: 'Activa'
    },
    productId: {
        type: Schema.Types.Number,
        required: true
    }
}, {timestamps: true});

module.exports = mongoose.model('Version', versionSchema);