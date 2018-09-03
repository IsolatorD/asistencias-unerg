var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const PersonalSchema = new Schema({
    cedula: { type: String },
    nombre: { type: String },
    apellido: { type: String },
    status: { type: String, default: 'true' }
});

module.exports = mongoose.model('Personal', PersonalSchema);