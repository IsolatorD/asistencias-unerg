var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const TelefonoSchema = new Schema({
    ciPersonal: { type: Schema.Types.ObjectId, ref: 'Personal' },
    telefono: { type: String }
});

module.exports = mongoose.model('Telefono', TelefonoSchema);