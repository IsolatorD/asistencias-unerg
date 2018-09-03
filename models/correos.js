var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const CorreoSchema = new Schema({
    ciPersonal: { type: Schema.Types.ObjectId, ref: 'Personal' },
    correo: { type: String }
});

module.exports = mongoose.model('Correo', CorreoSchema);