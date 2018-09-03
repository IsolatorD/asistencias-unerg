var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const AsistenciaSchema = new Schema({
    fecha: { type: String },
    horaEntrada: { type: String },
    horaSalida: { type: String },
    status: { type: String },
    ciPersonal: { type: Schema.Types.ObjectId, ref: 'Personal' }
});

module.exports = mongoose.model('Asistencia', AsistenciaSchema);