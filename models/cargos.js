var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const CargoSchema = new Schema({
    ciPersonal: { type: Schema.Types.ObjectId, ref: 'Personal' },
    cargo: { type: String }
});

module.exports = mongoose.model('Cargo', CargoSchema);