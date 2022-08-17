const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const licenceSchema = new Schema({
    id: {
        type: Schema.Types.Number,
        requiered: true,
        unique: true
    },
    productId: {
        type: Schema.Types.Number,
        required: true
    },
    versionId: {
        type: Schema.Types.Number,
        required: true
    },
    clientId: {
        type: Schema.Types.Number,
        required: true
    },
    expirationDate: {
        type: Schema.Types.Date,
        required: true
    },
    state: {
        type: String,
        default: "Activa"
    }
}, {timestamps: true});

module.exports = mongoose.model('Licence', licenceSchema);