const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
    id: {
        type: Schema.Types.Number,
        requiered: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    }
}, {timestamps: true});

module.exports = mongoose.model('Product', productSchema);