
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , mongoose = require('mongoose')

var cronJob = require('cron').CronJob;

var db = mongoose.createConnection('108.166.84.122', 'comercialmexicana');

var app = module.exports = express.createServer();

// Configuration
var usuariosSchema = mongoose.Schema({
	nombre:         String,
	apellidos:      String,
	email:         	String,
	password:      	String,
	codigo_postal: 	String,
	categorias: 	[{categoria:String}],
	register:      {type: Date, default:Date.now},
	horario: 		Number,
	tiendas:		[{tienda:String}],
	tarjeta: 		String
	
});
var Usuario= db.model('usuarios',usuariosSchema);

var promocionesSchema = mongoose.Schema({
	titulo: 		String,
	categoria: 		Number,
	tipo: 			Number,
	fecha_desde: 	Date,
	fecha_hasta: 	Date,
	fecha_registro: {type: Date, default:Date.now},
	descripcion: 	String,
	url: 			String
});
var Promocion = db.model('promociones', promocionesSchema);




app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', routes.index);

app.post('/signup', function (req, res){
	console.log("/signup");
	console.log(req);
	Usuario.findOne({'email':req.param('email')}, function(error, object){
		if(object==null){
			console.log("No existe usuario, procede a registro...");

			var usuario = new Usuario({
				nombre:         req.param('nombre'),
				apellidos:      req.param('apellidos'),
				email:         	req.param('email'),
				password:      	req.param('password'),
				codigo_postal: 	req.param('cp'),			
				horario: 		req.param('horario'),			
				tarjeta: 		req.param('tarjeta')
			});
			console.log('Usuario por Guardar:'+ usuario);
			Usuario.save(function(err){
				if(err==null){
					console.log("Usuario Guardado Exitosamente");
					res.send({estado:true, msg:"OK"});
				}else{
					console.log("Error guardando usuario"+err);
					res.send({estado:false, msg:"Error 200"}); //Error al guardar en db
				}
			});	
		}else if(error){
			console.log("Error 500 " + error);
			res.send({estado:false, msg:"Error 500"}) //Ya esta registrado el usuario 
		}else{
			console.log("Error 300 " + object);
			res.send({estado:false, msg:"Error 300"}) //Ya esta registrado el usuario 
		}
	});//fin find User exists
});

app.post('/login', function (req, res){
	Usuario.findOne({'email':req.param('email'), 'password':req.param('password')}, function(error, usuario){
	//Usuario.findOne({'email':"mail@mail.com", 'password':"password"}, function(error, usuario){
		if(usuario){
			console.log(true);
			res.send({estado:true, msg:"Bienvenido"})
		}else{
			console.log(error);
			res.send({estado:false, msg:"Error 400"})
		}
	});
});//end post /login

app.post('/update', function (req, res){

});

app.post('/promocion', function (req, res){
	var promo = new Promocion({
		titulo: 		req.param('titulo'),
		categoria: 		req.param('categorias'),
		tipo: 			req.param('tipo'),
		fecha_desde: 	req.param('fecha_inicio'),
		fecha_hasta: 	req.param('fecha_hasta'),
		descripcion: 	req.param('descripcion'),
		url: 			req.param('imagen')
	});
	console.log('Promocion por Guardar:'+ promo);
	Promocion.save(function(err){
		if(err==null){
			console.log("Promocion Guardada Exitosamente");
			res.send({estado:true, msg:"OK"});
		}else{
			console.log("Error guardando usuario"+err);
			res.send({estado:false, msg:"Error 200"}); //Error al guardar en db
		}
	});	
});
























var mañana = new cronJob({
  cronTime: '00 00 09 * * 1-7',
  onTick: function() {
  	//Ejecuta codigo para mañana
  },
  start: true,
  timeZone: "America/Mexico_City"
});


var tarde = new cronJob({
  cronTime: '00 00 14 * * 1-7',
  onTick: function() {
  	//Ejecuta codigo para tarde
  },
  start: true,
  timeZone: "America/Mexico_City"
});




var noche = new cronJob({
  cronTime: '00 00 19 * * 1-7',
  onTick: function() {
  	//Ejecuta codigo para noche
  },
  start: true,
  timeZone: "America/Mexico_City"
});


mañana.start();
tarde.start();
noche.start();



app.listen(9000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
