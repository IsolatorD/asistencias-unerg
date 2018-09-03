var express = require('express');
var router = express.Router();
var PersonalModel = require('../models/personal');
var CorreoModel = require('../models/correos');
var TelefonoModel = require('../models/telefonos');
var CargoModel = require('../models/cargos');
var AsistenciaModel = require('../models/asistencia');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/admin', (req, res, next) => {
  res.render('admin-dash');
});

router.get('/admin/login', (req, res, next) => {
  res.render('admin-login');
});

router.post('/admin/login', (req, res, next) => {
  var user = req.body.user;
  var pass = req.body.pass;

  if(user == 'admin' && pass == '1234') {
    res.json({ code: 200, access: true });
  } else {
    res.json({ code: 402, access: false });
  }
});

router.get('/admin/new', (req, res, next) => {
  res.render('admin-crear');
});

router.post('/admin/new', (req, res, next) => {
  var cedula = req.body.cedula;
  var nombre = req.body.nombre;
  var apellido = req.body.apellido;
  var correo, telefono;
  if(req.body.correo != '') {
    correo = req.body.correo;
  } else {
    correo = 'No posee';
  }
  if(req.body.telefono != '') {
    telefono = req.body.telefono;
  } else {
    telefono = 'No posee';
  }
  var cargo = req.body.cargo;

  PersonalModel.findOne({ cedula }, (err, exist) => {
    if(err) throw err;
    if(exist) {
      res.json({ code: 402, msg: 'Ya existe una persona registrada con esta cedula' });
    } else {
      var newPersonal = new PersonalModel({
        cedula,
        nombre,
        apellido
      });
      newPersonal.save((err, personalNuevo) => {
        if(err) throw err;
        var personalId = personalNuevo._id;
        var nuevoCorreo = new CorreoModel({
          ciPersonal: personalId,
          correo
        });
        nuevoCorreo.save((err, CorreoNuevo) => {
          if(err) throw err;
          var telefonoNuevo = new TelefonoModel({
            ciPersonal: personalId,
            telefono
          });
          telefonoNuevo.save((err, NuevoTelefono) => {
            if(err) throw err;
            var CargoNuevo = new CargoModel({
              ciPersonal: personalId,
              cargo
            });
            CargoNuevo.save((err, nuevoCargo) => {
              if(err) throw err;
              res.json({ code: 200, msg: 'Personal Registrado' });
            });
          });
        });
      });
    }
  });
});

router.put('/admin/edit/:id', (req, res, next) => {
  var id = req.params.id;
  var nombre = req.body.nombre;
  var apellido = req.body.apellido;
  var cedula = req.body.cedula;
  var correo, telefono;
  var cargo = req.body.cargo;
  var status = req.body.status;
  if(req.body.correo != '') {
    correo = req.body.correo;
  } else {
    correo = 'No posee';
  }
  if(req.body.telefono != '') {
    telefono = req.body.telefono;
  } else {
    telefono = 'No posee';
  }
  PersonalModel.findById(id, (err, personal) => {
    if(err) throw err;
    if(personal) {
      personal.cedula = cedula;
      personal.nombre = nombre;
      personal.apellido = apellido;
      personal.status = status;
      personal.save((err, pU) => {
        if(err) throw err;
        CorreoModel.findOne({ ciPersonal: id }, (err, corrP) => {
          if(err) throw err;
          corrP.correo = correo;
          corrP.save((err, corrPU) => {
            if(err) throw err;
            TelefonoModel.findOne({ ciPersonal: id }, (err, telfP) => {
              if(err) throw err;
              telfP.telefono = telefono;
              telfP.save((err, telfPU) => {
                if(err) throw err;
                CargoModel.findOne({ ciPersonal: id }, (err, cargP) => {
                  if(err) throw err;
                  cargP.cargo = cargo;
                  cargP.save((err, cargPU) => {
                    if(err) throw err;
                    res.json({ code: 200, msg: 'Personal Actualizado' });
                  });
                });
              });
            });
          })
        });
      });
    } else {
      res.json({ code: 404, msg: 'Not Found' });
    }
  });
});

router.get('/admin/search', (req, res, next) => {
  res.render('admin-search');
});

router.get('/admin/listar', (req, res, next) => {
  CargoModel.find({}).populate('ciPersonal').exec((err, personales) => {
    if(err) throw err;
    if(personales.length > 0) {
      res.json({ code: 200, personales });
    } else {
      res.json({ code: 404, msg: 'No hay personal registrado' });
    }
  });
});

router.get('/admin/ver', (req, res, next) => {
  res.render('admin-ver');
});

router.get('/admin/show/:id', (req, res, next) => {
  var personalId = req.params.id;
  PersonalModel.findOne({ cedula: personalId}, (err, personal) => {
    console.log('Aqui');
    if(err) throw err;
    if(personal) {
      CorreoModel.findOne({ ciPersonal: personal._id }, (err, correosP) => {
        if(err) throw err;
        TelefonoModel.findOne({ ciPersonal: personal._id }, (err, telefsP) => {
          if(err) throw err;
          CargoModel.findOne({ ciPersonal: personal._id }, (err, cargosP) => {
            if(err) throw err;
            res.json({ code: 200, personal, correosP, telefsP, cargosP });
          });
        });
      });
    } else {
      res.json({ code: 404, msg: 'Not Found' });
    }
  });
});

router.post('/marcar', (req, res, next) => {
  var cedula = req.body.cedula;
  var hora = req.body.hora;
  var fecha = req.body.fecha;
  var horaSplit = hora.split(':');
  var horaI = Number(horaSplit[0]);
  var status;
  PersonalModel.findOne({ cedula }, (err, personal) => {
    if(err) throw err;
    if(personal) {
      if(personal.status == 'false') {
        res.json({ code: 402, msg: 'Disculpe, el personal ingresado ya no se encuentra activo en el sistema' });
      } else {
        AsistenciaModel.findOne({ fecha, ciPersonal: personal._id }, (err, asistExist) => {
          if(err) throw err;
          if(asistExist) {
            if(asistExist.horaEntrada != null || asistExist.horaEntrada != '') {
              if(asistExist.horaSalida == null || asistExist.horaSalida == '') {
                if(horaI < 17) {
                  status = 'Salio Temprano';
                } else {
                  status = 'Horario Cumplido';
                }
                asistExist.horaSalida = hora;
                asistExist.status = status;
                asistExist.save((err, asisUpS) => {
                  if(err) throw err;
                  res.json({ code: 200, personal: personal, asist: asisUpS });
                });
              } else if(asistExist.horaSalida != null || asistExist.horaSalida != '') {
                res.json({ code: 402, msg: 'Ya ha cumplido la asistencia completa por hoy'});
              }
            }
          } else {
            if(horaI > 8 && horaI < 9) {
              status = 'Atrasado';
            } else if(horaI > 9){
              status = 'Inasistente';
            } else {
              status = 'A tiempo';
            }
            var nuevaAsistencia = new AsistenciaModel({
              fecha: fecha,
              horaEntrada: hora,
              status: status,
              ciPersonal: personal._id
            });
            nuevaAsistencia.save((err, asisNew) => {
              if(err) throw err;
              res.json({ code: 200, personal: personal, asist: asisNew });
            });
          }
        });
      }
    } else {
      res.json({ code: 404, msg: 'Disculpe, la cedula ingresada no se encuentra registrada' });
    }
  });
});

router.get('/admin/reportes', (req, res, next) => {
  res.render('admin-pdf');
});

router.post('/admin/pdf/:id', (req, res, next) => {
  var id = req.params.id;
  var fechaI = req.body.fechaI;
  var fechaF = req.body.fechaF;
  PersonalModel.findOne({ cedula: id }, (err, existP) => {
    if(err) throw err;
    if(existP) {
      if(fechaI != '' || fechaI != null && fechaF != '' || fechaF != null) {
        AsistenciaModel.find({ fecha: {"$gte": fechaI, "$lte": fechaF}, ciPersonal: existP._id }, (err, asistencias) => {
          if(err) throw err;
          if(asistencias.length > 0) {
            res.json({ code: 200, asistencias: asistencias });
          } else {
            res.json({ code: 402, msg: 'No posee asistencias en las fechas indicadas' });
          }
        });
      }
    } else {
      res.json({ code: 404, msg: 'Not Found' });
    }
  });
});

router.get('/admin/asistencias/alls/:id', (req, res, next) => {
  var id = req.params.id;
  PersonalModel.findOne({ cedula: id }, (err, personal) => {
    if(err) throw err;
    if(personal) {
      AsistenciaModel.find({ ciPersonal: personal._id }, (err, asistencias) => {
        if(err) throw err;
        if(asistencias.length > 0) {
          res.json({ code: 200, asistencias: asistencias });
        } else {
          res.json({ code: 402, msg: 'No posee asistencias actualmente' });
        }
      });
    } else {
      res.json({ code: 404, msg: 'Not Found' });
    }
  });
});
module.exports = router;
