var ACS = require('acs').ACS;
ACS.init('vxPVmw3CkNroSWECVyPj3D7XHzYlaTdc', 'R1CfJ6t2ubMDqRH90kg7pv7wwR08dFpp')

function index(req, res){
	mañana();	
}


function mañana(){
	ACS.Users.query({
	    where: '{"Horario":1}'	    
    }, function(data) {
        if(data.success) {
        	matchUsuarioPromocion(data.users);
        } else {
            
            console.log('Error occured. Error code: ' + data.error + '. Message: ' + data.message);
        }
    });
}//fin mañana 

function tarde(){
	ACS.Users.query({
	    where: '{"Horario":2}'	    
    }, function(data) {
        if(data.success) {
        	matchUsuarioPromocion(data.users);
        } else {
            
            console.log('Error occured. Error code: ' + data.error + '. Message: ' + data.message);
        }
    });
}//fin tarde


function noche(){
	ACS.Users.query({
	    where: '{"Horario":3}'
    }, function(data) {
        if(data.success) {
        	matchUsuarioPromocion(data.users);
        } else {
            
            console.log('Error occured. Error code: ' + data.error + '. Message: ' + data.message);
        }
    });
}//fin noche


function matchUsuarioPromocion( ){
	//console.log(usuario);
	console.log('Match....');
	//var query = '{"Tiendas":{"$in":["Lindavista","Iztacalco"]}}';
	ACS.Objects.query({
		classname:"Promociones",
		where:'{"Tiendas":{"$all":["Lindavista"]}}'
	}, function(data){
		if(data.success){
			console.log("promocion encontrada bajo este perfil");
			console.log(data);
		}else{
			console.log("Error en busqueda" +data.message);
		}
	});
}


/**
 * Module dependencies.
 */

var mongoose = require('mongoose')

var cronJob = require('cron').CronJob;

var db = mongoose.createConnection('108.166.84.122', 'comercialmexicana');

 var CloudPush = require('ti.cloudpush');
        CloudPush.debug = true;
        CloudPush.enabled = true;
    var deviceToken
 
    var Cloud = require('ti.cloud');
        Cloud.debug = true;

// Configuration
var categoriaSchema = mongoose.Schema({
	categoria: {type:String, index:false}
});
var tiendaSchema = mongoose.Schema({
	tienda:{type:String, index:false}
});
var usuariosSchema = mongoose.Schema({
	nombre:         String,
	apellidos:      String,
	email:         	String,
	token: 			String,
	password:      	String,
	codigo_postal: 	String,
	categorias: 	[categoriaSchema],
	register:      {type: Date, default:Date.now},
	horario: 		Number,
	tiendas:		[tiendaSchema],
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



// Routes


function login (req, res){
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
}//end post /login



function signup(req, res){
	console.log("/signup");
	console.log(req);
	Usuario.findOne({'email':req.param('email')}, function(error, object){
		if(object==null){
		    ACS.Users.login({
			    login:'admin@mail.com',
			    password:'admin'
		    }, function(data) {
		        if(data.success) {
		        	var user= data.users[0];
		        	console.log("Usuario logeado" +user.first_name);				        	
			        Cloud.PushNotifications.subscribe({
		                channel: 'ofertas',
		                device_token: deviceToken,
		                type: 'ios'
		            }, function (e) {
		                if (e.success) {
		                   console.log('Subscribed!');
		                   console.log("No existe usuario, procede a registro...");
							var usu = new Usuario({
								nombre:         req.param('nombre'),
								apellidos:      req.param('apellidos'),
								email:         	req.param('email'),
								password:      	req.param('password'),
								codigo_postal: 	req.param('cp'),			
								horario: 		req.param('horario'),			
								tarjeta: 		req.param('tarjeta')
							});
							console.log('Usuario por Guardar:'+ usu);
							usu.save(function(err){
								if(err==null){
									console.log("Usuario Guardado Exitosamente");
									res.send({estado:true, msg:"OK"});
								}else{
									console.log("Error guardando usuario"+err);
									res.send({estado:false, msg:"Error 200"}); //Error al guardar en db
								}
							});	
		                }
		                else {
		                    console.log('Error:' +((e.error && e.message) || JSON.stringify(e)));
		                }
		            });
			    
		        } else {
		           console.log("Usuario sin logear"+data.error+ " "+ data.message);
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
}


function setpromocion(req, res){
	console.log(req);
	var promo = new Promocion({
		titulo: 		req.param('titulo'),
		categoria: 		req.param('categorias'),
		tipo: 			req.param('tipo'),
		fecha_desde: 	new Date (req.param('fecha_inicio')),
		fecha_hasta: 	new Date (req.param('fecha_hasta')),
		descripcion: 	req.param('descripcion'),
		url: 			req.param('imagen')
	});
	console.log('Promocion por Guardar:'+ promo);
	promo.save(function(err){
		if(err==null){
			console.log("Promocion Guardada Exitosamente");
			res.send({estado:true, msg:"OK"});
		}else{
			console.log("Error guardando usuario"+err);
			res.send({estado:false, msg:"Error 200"}); //Error al guardar en db
		}
	});	
}



function test(req,res){
	ACS.Users.login({
	    login:'admin@mail.com',
	    password:'admin'
    }, function(data) {
        if(data.success) {
        	var user= data.users[0];
        	console.log("Usuario logeado" +user.first_name);
        } else {
           console.log("Usuario sin logear"+data.error+ " "+ data.message);
        }
    });
}



/*
*	EJECUTA TAREAS 
*
*/
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








