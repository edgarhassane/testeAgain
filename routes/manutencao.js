var express = require('express');
var router = express.Router();
var geolocation = require('geolocation')
var model = require('../entities/usuario');
var emailSender=require('../util/sendEmail');
var jobcards = require("../entities/jobcard.js");
var jobcardprojects = require("../entities/jobcard_projects.js");
var siteinfos = require("../entities/siteinfo.js");
var spareusedinfos = require("../entities/spareused_info.js");
var armazens = require("../entities/stock_pessoal.js");
var admin_db=require("../entities/sisadmin")
var clientes = require("../entities/cliente.js");
var stockhistory = require("../entities/stock_request_history.js");
var generatorhistory = require("../entities/gerador_historico.js");
var rastreiospare = require("../entities/rastreio.js");
var usuarios = require('../entities/usuario');
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");
var multer  = require('multer');
var path = require("path");
var xl = require('excel4node');
require("../scheduled/maintenancescheduled.js");
var hvac_db=require("../entities/hvac")


const sleep = ms => {
	return new Promise(resolve => setTimeout(resolve, ms));
}


// var email = "angelomassache@comserv.co.mz";
// var senha = "1234111"

// model.updateMany({}, {$set:{email,senha}}, function(err,data){
// 	if(err){
// 		console.log(err);
// 	}else{
// 		console.log("Updated");
// 	}
// });



// apagar dados
// var start= new Date("2021-02-04");

// jobcards.deleteMany({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", data_registojobcard:{$gte:start}}, function(err, data){
//      if(err){
//          console.log(err);
//      }else{
//          console.log(data)
//          console.log("Done");
//      }
//  });

// apagar dados dublicados

// setTimeout(async function(){


// 	var procurajobcards = await jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New"}, function(err, data){
//      if(err){
//          console.log(err);
//      }else{
//          // console.log(data)
//          console.log("Done");
//      }
//  	}).lean();



// 	await procurajobcards.reduce(async function(contjobcards, idiota, i){
// 		await contjobcards;
// 		await sleep(10);

// 		var procurajobcard = await jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_tecnicoid:procurajobcards[i].jobcard_tecnicoid, jobcard_siteid:procurajobcards[i].jobcard_siteid, jobcard_planneddate:procurajobcards[i].jobcard_planneddate}, function(err, data){
// 		     if(err){
// 		         console.log(err);
// 		     }else{
// 		         console.log(data.length)
// 		         // console.log("Done");
// 		     }
// 		 }).lean();

// 		if(procurajobcard.length > 1){
// 			jobcards.deleteOne({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_tecnicoid:procurajobcards[i].jobcard_tecnicoid, jobcard_siteid:procurajobcards[i].jobcard_siteid, jobcard_planneddate:procurajobcards[i].jobcard_planneddate}, function(err, data){
// 			     if(err){
// 			         console.log(err);
// 			     }else{
// 			         // console.log(data)
// 			         console.log("Deleted");
// 			     }
// 			 });
// 		}
		
		

// 	},0)


// }, 1000)




var listaprovincia = new Array(11) ;
listaprovincia[""] = [""]; 
listaprovincia["Maputo Cidade"] = ["KaMpfumo", "Nlhamankulu", "KaMaxaquene", "KaMavota", "KaMubukwana", "KaTembe", "KaNyaka"];
listaprovincia["Maputo Provincia"] = ["Boane", "Magude", "Manhiça", "Marracuene", "Matutuíne", "Moamba", "Namaacha"];
listaprovincia["Gaza"] = ["Bilene Macia", "Chibuto", "Chicualacuala", "Chigubo", "Chókwè", "Guijá", "Mabalane", "Manjacaze", "Massangena", "Massingir", "Xai-Xai"];
listaprovincia["Inhambane"] = ["Funhalouro", "Govuro", "Homoíne", "Inhambane", "Inharrime", "Inhassoro", "Jangamo", "Mabote", "Massinga", "Morrumbene", "Panda", "Vilanculos", "Zavala"];
listaprovincia["Manica"] = ["Bárue", "Gondola", "Guro", "Macate", "Machaze", "Macossa", "Manica", "Mossurize", "Sussundenga", "Tambara", "Vanduzi"];
listaprovincia["Sofala"] = ["Búzi", "Caia", "Chemba", "Cheringoma", "Chibabava", "Dondo", "Gorongosa", "Machanga", "Maringué", "Marromeu", "Muanza", "Nhamatanda"];
listaprovincia["Tete"] = ["Angónia", "Cahora-Bassa", "Changara", "Chifunde", "Chiuta", "Dôa", "Macanga", "Magoé", "Marara", "Marávia", "Moatize", "Mutarara", "Tsangano", "Zumbo"];
listaprovincia["Zambezia"] = ["Alto Molócue", "Chinde", "Derre", "Gilé", "Gurué", "Ile", "Inhassunge", "Luabo", "Lugela", "Maganja da Costa", "Milange", "Mocuba", "Mocubela", "Molumbo", "Mopeia", "Morrumbala", "Mulevala", "Namacurra", "Namarroi", "Nicoadala", "Pebane", "Quelimane"];
listaprovincia["Nampula"] = ["Angoche", "Eráti", "Ilha de Moçambique", "Lalaua", "Larde", "Liúpo", "Malema", "Meconta", "Mecubúri", "Memba", "Mogincual", "Mogovolas", "Moma", "Monapo", "Mossuril", "Muecate", "Murrupula", "Nacala-a-Velha", "Nacarôa", "Nampula", "Ribaué"];
listaprovincia["Niassa"] = ["Cuamba", "Lago", "Lichinga", "Majune", "Mandimba", "Marrupa", "Maúa", "Mavago", "Mecanhelas", "Mecula", "Metarica", "Muembe", "N'gauma", "Nipepe", "Sanga"];
listaprovincia["Cabo Delgado"] = ["Ancuabe", "Balama", "Chiúre", "Ibo", "Macomia", "Mecufi", "Meluco", "Metuge", "Mocímboa da Praia", "Montepuez", "Mueda", "Muidumbe", "Namuno", "Nangade", "Palma", "Pemba Metuge", "Quissanga"];

var upload = multer({
	storage: multer.diskStorage({
		destination: function(req, file,cb){
			cb(null, './public/Preventative_Maintenance');
		},
		filename: function(req, file, cb){
			cb(null, file.fieldname + "_"+Date.now() + file.originalname.replace(/ /g, "_"));
		}
	}) 
});

var uploadphotosparereplace = multer({
	storage: multer.diskStorage({
		destination: function(req, file,cb){
			cb(null, './public/Spare_Used_Photos');
		},
		filename: function(req, file, cb){
			cb(null, file.fieldname + "_"+Date.now() + path.extname(file.originalname));
		}
	}) 
});

//details to upload siteinfo
var storage = multer.diskStorage({ //multers disk storage settings
        destination: function (req, file, cb) {
            cb(null, './uploads/SiteInfo')
        },
        filename: function (req, file, cb) {
            var datetimestamp = Date.now();
            cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
        }
});

var uploader = multer({ //multer settings
    storage: storage,
    fileFilter : function(req, file, callback) { //file filter
        if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length-1]) === -1) {
            return callback(new Error('Wrong extension type'));
        }
        callback(null, true);
    }
}).single('file');

//details to upload maintenance plan
var storageplan = multer.diskStorage({ //multers disk storage settings
        destination: function (req, file, cb) {
            cb(null, './uploads/MaintenancePlan')
        },
        filename: function (req, file, cb) {
            var datetimestamp = Date.now();
            cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
        }
});

var uploaderplan = multer({ //multer settings
    storage: storageplan,
    fileFilter : function(req, file, callback) { //file filter
        if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length-1]) === -1) {
            return callback(new Error('Wrong extension type'));
        }
        callback(null, true);
    }
}).single('file');


var uploaderttnumberplan = multer({ //multer settings
    storage: storageplan,
    fileFilter : function(req, file, callback) { //file filter
        if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length-1]) === -1) {
            return callback(new Error('Wrong extension type'));
        }
        callback(null, true);
    }
}).single('file');

router.get("/importacaofychero", async(req, res)=>{
	var userData=await req.session.usuario;

	res.render("importaxao_file",{ DataU:userData ,title:"Eaglei"})
})

router.post("/importaxao_file", upload.any(), async(req,res)=>{
	var teste=await JSON.parse(req.body.m);
console.log(teste)



})


router.post('/upload', function(req, res) {
		var userData=req.session.usuario;
        var exceltojson;
        uploader(req,res,function(err){
            if(err){
                 res.json({error_code:1,err_desc:err});
                 return;
            }
            /** Multer gives us file info in req.file object */
            if(!req.file){
                res.json({error_code:1,err_desc:"No file passed"});
                return;
            }
            /** Check the extension of the incoming file and 
             *  use the appropriate module
             */
            if(req.file.originalname.split('.')[req.file.originalname.split('.').length-1] === 'xlsx'){
                exceltojson = xlsxtojson;
            } else {
                exceltojson = xlstojson;
            }
            console.log(req.file.path);
            try {
                exceltojson({
                    input: req.file.path,
                    output: null, //since we don't need output.json
                    sheet:"Data",
                    lowerCaseHeaders:true
                }, async function(err,result){
                    if(err) {
                        return res.json({error_code:1,err_desc:err, data: null});
                    }
                    else{
                    	// guard info
                    	// if(result[0].nib == undefined){
                    	// coordenadas
                    	// if(result[0].sitename == undefined){
                    	// generator info
                    	// if(result[0].sitenumber == undefined){
                    	// siteinfo
                    	// if(result[0].type == undefined){
                    	// siteinfo corr
                    	if(result[0].sitenumber == undefined){

                    		var procurasiteinfo = await siteinfos.find({}, function(err, dataSiteInfo){
	            				if(err){
	    							console.log(err);
								}else{
								
									console.log("Site Info");
								}
	            			});

	            			if(procurasiteinfo.length == 0){

		            			var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
							    var year = ((new Date()).getFullYear() + "").split("");
							    var ano = year[2] + year[3];
		                    	var cont = 1;
		                    	var cont1;
		                    	// console.log(result.length);
		                    	
		                    	for (var i = 0, j = result.length; i < j; i++) {
			                    	var siteinfo = {};

			                    	if(cont < 10){
					                    cont1 = "SI/" + mes + "/" + ano + "/000" + cont;
					                }else 
					                    if((cont > 10) && (cont < 100) ){
					                        cont1 = "SI/" + mes + "/" + ano + "/00" + cont;
					                    }else
					                        if((cont > 100) && (cont < 1000) ){
					                            cont1 = "SI/" + mes + "/" + ano + "/0" + cont;
					                        }else{
					                            cont1 = "SI/" + mes + "/" + ano + "/" + cont;
					                        }
					                siteinfo.siteinfo_cod = cont1;
					                cont += 1;
			                    	siteinfo.siteinfo_client= "Vm,Sa";
			                    	siteinfo.siteinfo_clientid = "5e71cba0ccff6e17448e12d4"
			                    	siteinfo.siteinfo_sitename= result[i].sitename;
			                    	siteinfo.siteinfo_sitenum= result[i].basestationno;
			                    	siteinfo.siteinfo_typesite= result[i].typeofsite;
			                    	siteinfo.siteinfo_phasenum= "";
			                    	siteinfo.siteinfo_siteclassif= result[i].siteclassification;
			                    	siteinfo.siteinfo_radiotec= result[i].radiotechnology;
			                    	siteinfo.siteinfo_maintoff= result[i].maintenanceofficer;
			                    	var nometecnico = result[i].maintenanceofficer;

			                    	var procuratecnico = await model.find({nome:nometecnico}, function(err, dataUser){
			            				if(err){
			    							console.log(err);
										}else{
										
											console.log("find user");
										}
			            			});

			            			if(procuratecnico.length != 0){

			            				siteinfo.siteinfo_techcontactnum = procuratecnico[0].telefone_1;
			            				siteinfo.siteinfo_maintoffid = procuratecnico[0]._id;
			            			}else{

			            				siteinfo.siteinfo_techcontactnum= "";
			            				siteinfo.siteinfo_maintoffid ="";

			            			}


			                    	
			                    	siteinfo.siteinfo_regiaoselmec= result[i].selmecregion.split(' ')[0];
			                    	siteinfo.siteinfo_area= "";
			                    	siteinfo.siteinfo_regiao= "";
			                    	siteinfo.siteinfo_gps= [];
			                    	siteinfo.siteinfo_planmaintdate= result[i].planneddate;
			                    	siteinfo.siteinfo_siteonairdate= "";
			                    	siteinfo.siteinfo_siteannoucdate= result[i].announcedate;
			                    	siteinfo.siteinfo_twinbts= result[i].twinbts;
			                    	siteinfo.siteinfo_btslinkedsite= result[i].linkedsite;
			                    	siteinfo.siteinfo_generator= result[i].generatorinstalled;
			                    	siteinfo.siteinfo_generatorArray= [];
			                    	siteinfo.siteinfo_ac= result[i].airconditioninginstalled;
			                    	siteinfo.siteinfo_acArray= [];
			                    	siteinfo.siteinfo_rectifiercabinnet= result[i].rfrectifiercabinstalled;
			                    	siteinfo.siteinfo_rectcabArray= [];
			                    	siteinfo.siteinfo_fencing= "";
			                    	siteinfo.siteinfo_fencingelectrified= "";
			                    	siteinfo.siteinfo_guardsite= "No";
			                    	siteinfo.siteinfo_securityArray= [];
			                    	siteinfo.siteinfo_elecsupptype= "";
			                    	siteinfo.siteinfo_electype= "";
			                    	siteinfo.siteinfo_elecpayment= result[i].electricitypaidtoowner;
			                    	siteinfo.siteinfo_credelec= "";

			                    	var diaat = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
							        var mesat = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
							        var anoat = (new Date()).getFullYear();
							        // var todaydateat = dia + "/" + mes + "/" + ano;
							        var todayhoursat = new Date().getHours() + ":" + new Date().getMinutes();

							        var siteinfo_audittrail = [];
							        var siteinfo_audittrailObject = {};
							        siteinfo_audittrailObject.siteinfo_audittrailname = userData.nome;
							        siteinfo_audittrailObject.siteinfo_audittrailaction = "Upload Site Info";
							        siteinfo_audittrailObject.siteinfo_audittraildate = diaat + "/" + mesat + "/" + anoat + "  " + todayhoursat;

							        siteinfo_audittrail.push(siteinfo_audittrailObject);
							        siteinfo.siteinfo_audittrail= siteinfo_audittrail;

			                    	siteinfos.gravarDados(siteinfo, function(err){
		                                if(err){
		                                    console.log("Ocorreu um erro ao tentar gravar os dados!\n contacte o administrador do sistema");
		                                    console.log(err)
		                                }
		                                else {
		                                    console.log("site_info upload");
		                                }
		                            });

			                    }
	            			}else{


	            				var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
							    var year = ((new Date()).getFullYear() + "").split("");
							    var ano = year[2] + year[3];
		                    	var cont = procurasiteinfo.length + 1;
		                    	var cont1;
		                    	// console.log(result.length);
		                    	
		                    	var exemploresult= await Promise.all( result.map(async function(y, i){

		                    		var posicaosite = procurasiteinfo.findIndex(x => x.siteinfo_sitenum == parseInt(y.basestationno));

		                    		if(posicaosite == -1){
		                    			console.log(y.basestationno)

				                    		var siteinfo = {};

					                    	if(cont < 10){
							                    cont1 = "SI/" + mes + "/" + ano + "/000" + cont;
							                }else 
							                    if((cont > 10) && (cont < 100) ){
							                        cont1 = "SI/" + mes + "/" + ano + "/00" + cont;
							                    }else
							                        if((cont > 100) && (cont < 1000) ){
							                            cont1 = "SI/" + mes + "/" + ano + "/0" + cont;
							                        }else{
							                            cont1 = "SI/" + mes + "/" + ano + "/" + cont;
							                        }
							                siteinfo.siteinfo_cod = cont1;
							                cont += 1;
					                    	siteinfo.siteinfo_client= "Vm,Sa";
					                    	siteinfo.siteinfo_clientid = "5e71cba0ccff6e17448e12d4"
					                    	siteinfo.siteinfo_sitename= y.sitename;
					                    	siteinfo.siteinfo_sitenum= y.basestationno;
					                    	siteinfo.siteinfo_typesite= y.typeofsite;
					                    	siteinfo.siteinfo_phasenum= "";
					                    	siteinfo.siteinfo_siteclassif= y.siteclassification;
					                    	siteinfo.siteinfo_radiotec= y.radiotechnology;
					                    	siteinfo.siteinfo_maintoff= y.maintenanceofficer;
					                    	var nometecnico = y.maintenanceofficer;

					                    	var procuratecnico = await model.find({nome:nometecnico}, function(err, dataUser){
					            				if(err){
					    							console.log(err);
												}else{
												
													console.log("find user");
												}
					            			});

					            			if(procuratecnico.length != 0){

					            				siteinfo.siteinfo_techcontactnum = procuratecnico[0].telefone_1;
					            				siteinfo.siteinfo_maintoffid = procuratecnico[0]._id;
					            			}else{

					            				siteinfo.siteinfo_techcontactnum= "";
					            				siteinfo.siteinfo_maintoffid ="";

					            			}


					                    	
					                    	siteinfo.siteinfo_regiaoselmec= y.selmecregion.split(' ')[0];
					                    	siteinfo.siteinfo_area= "";
					                    	siteinfo.siteinfo_regiao= "";
					                    	siteinfo.siteinfo_gps= [];
					                    	siteinfo.siteinfo_planmaintdate= y.planneddate;
					                    	siteinfo.siteinfo_siteonairdate= "";
					                    	siteinfo.siteinfo_siteannoucdate= y.announcedate;
					                    	siteinfo.siteinfo_twinbts= y.twinbts;
					                    	siteinfo.siteinfo_btslinkedsite= y.linkedsite;
					                    	siteinfo.siteinfo_generator= y.generatorinstalled;
					                    	siteinfo.siteinfo_generatorArray= [];
					                    	siteinfo.siteinfo_ac= y.airconditioninginstalled;
					                    	siteinfo.siteinfo_acArray= [];
					                    	siteinfo.siteinfo_rectifiercabinnet= y.rfrectifiercabinstalled;
					                    	siteinfo.siteinfo_rectcabArray= [];
					                    	siteinfo.siteinfo_fencing= "";
					                    	siteinfo.siteinfo_fencingelectrified= "";
					                    	siteinfo.siteinfo_guardsite= "No";
					                    	siteinfo.siteinfo_securityArray= [];
					                    	siteinfo.siteinfo_elecsupptype= "";
					                    	siteinfo.siteinfo_electype= "";
					                    	siteinfo.siteinfo_elecpayment= y.electricitypaidtoowner;
					                    	siteinfo.siteinfo_credelec= "";

					                    	var diaat = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
									        var mesat = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
									        var anoat = (new Date()).getFullYear();
									        // var todaydateat = dia + "/" + mes + "/" + ano;
									        var todayhoursat = new Date().getHours() + ":" + new Date().getMinutes();

									        var siteinfo_audittrail = [];
									        var siteinfo_audittrailObject = {};
									        siteinfo_audittrailObject.siteinfo_audittrailname = userData.nome;
									        siteinfo_audittrailObject.siteinfo_audittrailaction = "Upload Site Info";
									        siteinfo_audittrailObject.siteinfo_audittraildate = diaat + "/" + mesat + "/" + anoat + "  " + todayhoursat;

									        siteinfo_audittrail.push(siteinfo_audittrailObject);
									        siteinfo.siteinfo_audittrail= siteinfo_audittrail;

					                    	siteinfos.gravarDados(siteinfo, function(err){
				                                if(err){
				                                    console.log("Ocorreu um erro ao tentar gravar os dados!\n contacte o administrador do sistema");
				                                    console.log(err)
				                                }
				                                else {
				                                    console.log("site_info upload");
				                                }
				                            });


		                    		}


		                    	}));

			       //              	

			                }

	            		}else{

	            			// script para corrigir site information
	            			await result.reduce(async function(contsiteinfo, idiota, i){
								await contsiteinfo;
								await sleep(10);

								var procuratecnico = await model.findOne({nome:result[i].maintenanceofficer}, function(err, dataUser){
		            				if(err){
		    							console.log(err);
									}else{
									
										console.log("find technician");
									}
		            			});

								await siteinfos.updateOne({siteinfo_sitenum:result[i].sitenumber},{$set:{siteinfo_maintoff:result[i].maintenanceofficer, siteinfo_maintoffid:procuratecnico._id, siteinfo_techcontactnum:procuratecnico.telefone_1, siteinfo_regiaoselmec:procuratecnico.regiao}}, function(err, data1){
									if(err){
							    		console.log(err);
									}else{
										console.log("Site Updated");
									}
								});
							
							},0);

		      //           	var exemploguard= await Promise.all( result.map(async function(y, i){

		      //           		var guardinfoObject = {};

		      //           		guardinfoObject.siteinfo_secguardname = y.guardname;
		      //           		guardinfoObject.siteinfo_secbinumber = "";
		      //           		guardinfoObject.siteinfo_secnib = y.nib;
		      //           		guardinfoObject.siteinfo_secvalue = y.salary;
		      //           		var siteinfo_guardsite = "Yes";

		      //           		var sitenumber = y.site;

		      //           		siteinfos.findOneAndUpdate({siteinfo_sitenum:sitenumber},{$set:{siteinfo_guardsite:siteinfo_guardsite},$push:{siteinfo_securityArray:guardinfoObject}}, function(err, data){
								// 	if(err){
								// 		console.log("ocorreu um erro ao tentar aceder os dados")
								// 	}
								// 	else{
										
								// 		console.log("Guard Info Info upload complete");
								// 	}
								// });
						      	

						  //   }))


		      //           	for(var i = 0, j = result.length; i < j; i++) {

		      //           		var siteinfo_gps = [];
		      //           		var siteinfo_gpsObject = {};

		      //           		siteinfo_gpsObject.siteinfo_gpslatitude = result[i].latitude;
		      //           		siteinfo_gpsObject.siteinfo_gpslongitude = result[i].longitude;
		      //           		siteinfo_gps.push(siteinfo_gpsObject)

		      //           		var siteSiteInfo = parseInt(result[i].siteid);
		      //           		siteinfos.updateOne({siteinfo_sitenum:siteSiteInfo},{$set:{siteinfo_gps:siteinfo_gps}}, function(err, data){
								// 	if(err){
								// 		console.log("ocorreu um erro ao tentar aceder os dados")
								// 		console.log(err)
								// 	}
								// 	else{
										
								// 		console.log("Coordinates Info upload complete");
								// 	}
								// });
		      //           	}

		      				//actualizarinfo
		      //           	var exemplogeneratorinfo= await Promise.all( result.map(async function(y, i){

		      //           		var siteinfo_generatorArray = {};


		      //           		var siteSiteInfo = parseInt(y.basestationno);
		                		
		      //           		siteinfo_generatorArray.siteinfo_generatortype = y.enginetype;
		      //           		siteinfo_generatorArray.siteinfo_generatoroutputkw = "";
		      //           		siteinfo_generatorArray.siteinfo_generatormodelno = y.generatormodel;
		      //           		siteinfo_generatorArray.siteinfo_generatorengineserialnumber = y.generatorserialnumber;
		      //           		siteinfo_generatorArray.siteinfo_generatorenginecapacity = "";
		      //           		siteinfo_generatorArray.siteinfo_generatorstartertype = "";
		      //           		siteinfo_generatorArray.siteinfo_generatorfuelconsumption = "";
		      //           		siteinfo_generatorArray.siteinfo_generatorhours = "";
		      //           		siteinfo_generatorArray.siteinfo_generatorprevrefuelhours = "";

		      //  //          		if(result[i].litresfuel == "0"){

		      //  //          			siteinfo_generatorArray.siteinfo_generatorhours = result[i].currgenhrs;
								// 	// siteinfo_generatorArray.siteinfo_generatorprevrefuelhours = result[i].prevrefuelhrs;
		      //  //          		}else{

		      //  //          			siteinfo_generatorArray.siteinfo_generatorhours = result[i].currgenhrs;
								// 	// siteinfo_generatorArray.siteinfo_generatorprevrefuelhours = result[i].currgenhrs;
		      //  //          		}

		      //           		siteinfos.findOneAndUpdate({siteinfo_sitenum:siteSiteInfo},{$push:{siteinfo_generatorArray:siteinfo_generatorArray}}, function(err, data){
								// 	if(err){
								// 		console.log("ocorreu um erro ao tentar aceder os dados")
								// 	}
								// 	else{
										
								// 		console.log("Generator Info upload complete");
								// 	}
								// });
		      //           	}))

		                	// actualizar horas
		      //           	var exemplogeneratorinfo= await Promise.all( result.map(async function(y, i){


		      //           		var siteSiteInfo = parseInt(y.sitenumber);
		      //           		var generatorType = y.generator;

		      //           		if(y.litresfuel == "0"){

		      //           			var siteinfo_generatorhours = y.currgenhrs;
								// 	var siteinfo_generatorprevrefuelhours = y.prevrefuelhrs;
		      //           		}else{

		      //           			var siteinfo_generatorhours = y.currgenhrs;
								// 	var siteinfo_generatorprevrefuelhours = y.currgenhrs;
		      //           		}

		      //           		siteinfos.findOneAndUpdate({siteinfo_sitenum:siteSiteInfo, siteinfo_generatorArray:{$elemMatch:{siteinfo_generatortype:generatorType}}},{$set:{"siteinfo_generatorArray.$.siteinfo_generatorhours":siteinfo_generatorhours, "siteinfo_generatorArray.$.siteinfo_generatorprevrefuelhours":siteinfo_generatorprevrefuelhours}}, function(err, data){
								// 	if(err){
								// 		console.log("ocorreu um erro ao tentar aceder os dados")
								// 	}
								// 	else{
										
								// 		console.log("Generator Hours upload complete");
								// 	}
								// });
		      //           	}))

		                }



                        res.redirect("/manutencao/siteinfohome");
                    }
                    
                });
            } catch (e){
                res.json({error_code:1,err_desc:"Corupted excel file"});
            }
        })
       
});

router.post('/uploadplan', async function(req, res) {
		var userData=req.session.usuario;
        var exceltojson;
        uploaderplan(req,res,function(err){
            if(err){
                 res.json({error_code:1,err_desc:err});
                 return;
            }
            /** Multer gives us file info in req.file object */
            if(!req.file){
                res.json({error_code:1,err_desc:"No file passed"});
                return;
            }
            /** Check the extension of the incoming file and 
             *  use the appropriate module
             */
            if(req.file.originalname.split('.')[req.file.originalname.split('.').length-1] === 'xlsx'){
                exceltojson = xlsxtojson;
            } else {
                exceltojson = xlstojson;
            }
            console.log(req.file.path);
            try {
                exceltojson({
                    input: req.file.path,
                    output: null, //since we don't need output.json
                    sheet:"Data",
                    lowerCaseHeaders:true
                }, async function(err,result){
                    if(err) {
                        return res.json({error_code:1,err_desc:err, data: null});
                    }
                    else{
                    	var posicaodados, cont, cont1, cont2, cont3, cont4, cont6, cont7, cont8, cont9;

                    	var teste = await jobcards.find({jobcard_jobtype:"Preventative Maintenance"}, function(err, data){
            				if(err){
    							console.log(err);
							}else{
							
								console.log("done");
							}
            			});
            			// console.log(teste.length);
                    			
                    	if(teste.length == 0){

                    		
							cont1 = 0;
                    		for (var i = 0, j = result.length; i < j; i++) {
                    			if(result[i].newplanneddate != ""){
								
                    			var jobcard = {};
                    			// console.log()
                    			//planed date details
                    			jobcard.jobcard_planneddate=result[i].newplanneddate;
								jobcard.ttnumber_status= "New";

	                            // generate key
	                            var planneddate = result[i].newplanneddate.split('/');
	                            var dia = parseInt(planneddate[0]);
	                            var mes = parseInt(planneddate[1]);
	                            var year = (planneddate[2] + "").split("");
		                        var ano = year[2] + year[3];

		                        // console.log(dia, mes, year)

		                        //ms details
		                        var mes2 = parseInt(planneddate[1]) - 1;
		                        var ano2 = parseInt(planneddate[2]);
		                        var dataPlaneada2 = new Date(ano2, mes2, dia).getTime();
		                        // console.log(dataPlaneada2)
		                        jobcard.jobcard_planneddatems = dataPlaneada2;

		                        var cincodias = 86400000 * 7;
		                        var diaAntes = parseInt(dataPlaneada2) - cincodias;
		                        jobcard.jobcard_planneddate5beforems = diaAntes;

		                        var diaDepois = parseInt(dataPlaneada2) + cincodias;
		                        jobcard.jobcard_planneddate5afterms = diaDepois;

		                        cont6 = "CCM/" + mes + "/" + ano;
                            	cont7 = "CCM";
		                         
		                        cont1 = cont1 + 1;
		                        // cont2 = cont6 + "/0001";

		                        if(cont1 < 10){
			                    	cont2 = cont6 + "/000" + cont1;
			                    	
				                }else
				                    if((cont1 > 10) && (cont1 < 100) ){
				                        cont2 = cont6 + "/00" + cont1;
				                        
				                    }else
				                        if((cont1 > 100) && (cont1 < 1000) ){
				                            cont2 = cont6 + "/0" + cont1;
				                            
				                        }else{
				                            cont2 = cont6 + "/" + cont1;
				                            
				                        }

				                jobcard.jobcard_cod = cont2;

					            //general details
	                            jobcard.jobcard_call= [];
	                            jobcard.jobcard_ttnumber= 0;
	                            jobcard.jobcard_departamento= "";
	                            jobcard.jobcard_jobtype= "Preventative Maintenance";
	                            jobcard.jobcard_jobinfo= "";
	                            jobcard.jobcard_loggedby="Planned";
	                            jobcard.jobcard_estadoactual="Planned";
	                            jobcard.jobcard_datareporte="";
	                            jobcard.jobcard_horareporte="";
	                            jobcard.jobcard_loggedon="";
	                            jobcard.jobcard_quotacao="";
	                            jobcard.jobcard_razaoreprovar="";
	                            jobcard.jobcard_backofficeagent="";
	                            jobcard.jobcard_wait="nao";
	                            jobcard.jobcard_controlador=[1];
	                            jobcard.jobcard_travelinfo_proposito="";
	                            // jobcard.travelinfoArrayJobcard=[];
                                jobcard.generatorArrayJobcard=[];
	                            jobcard.jobcard_credelecinfo=[];
	                            jobcard.equipamentoArrayJobcard=[];
	                            jobcard.sparesArrayJobcard=[];
	                            jobcard.jobcard_site=result[i].basestationno;
	                            jobcard.jobcard_workstatus="";

	                            var sitedetails = await siteinfos.find({siteinfo_sitenum:result[i].basestationno}, function(err, dataUser){
		                             if(err){
		                                 console.log("erro ao tentar aceder o utilizador!!");
		                            }
		                             else{ 
		                                 console.log("Site details done");
		                             }
		                        });

		                        jobcard.jobcard_siteid= sitedetails[0]._id;
	                            
	                            //tecnico details
	                            var arrControladorintervenientes = ["Planned"];

	                            jobcard.jobcard_tecniconome= result[i].maintenanceofficer;
	                            arrControladorintervenientes.push(result[i].maintenanceofficer);

	                            var userdetails = await model.find({nome:result[i].maintenanceofficer}, function(err, dataUser){
		                             if(err){
		                                 console.log("erro ao tentar aceder o utilizador!!");
		                            }
		                             else{ 
		                                 console.log("Technician details done");
		                             }
		                        });

		                        if(userdetails.length != 0 ){
		                        	arrControladorintervenientes.push(userdetails[0].nome_supervisor);
		                        	jobcard.jobcard_linemanager=userdetails[0].nome_supervisor;
		                        	jobcard.jobcard_cell=userdetails[0].telefone_1;
		                        	jobcard.jobcard_regiao= userdetails[0].regiao;
		                        	jobcard.jobcard_tecnicoid = userdetails[0]._id;
		                        }else{
		                        	// arrControladorintervenientes.push(userdetails[0].nome_supervisor);
		                        	jobcard.jobcard_tecnicoid = "";
		                        	jobcard.jobcard_linemanager="";
		                        	jobcard.jobcard_cell="";
		                        	jobcard.jobcard_regiao= "";
		                        }

	                            jobcard.jobcard_controladorintervenientes=arrControladorintervenientes;

	                            var userlinemanager = await model.find({nome:jobcard.jobcard_linemanager}, function(err, dataUser){
		                             if(err){
		                                 console.log("erro ao tentar aceder o utilizador!!");
		                            }
		                             else{ 
		                                 console.log("Technician details done");
		                             }
		                        });

		                        if(userlinemanager.length != 0 ){
		                        	
		                        	jobcard.jobcard_linemanagerid=userlinemanager[0]._id;
		                        	jobcard.jobcard_linemanagercell=userlinemanager[0].telefone_1;
		                        	
		                        }else{
		                        	
		                        	jobcard.jobcard_linemanagerid="";
		                        	jobcard.jobcard_linemanagercell="";
		                        }

		                        var procuracliente = await clientes.find({cliente_nome:"Vm,Sa"}, function(err, dataUser){
		                             if(err){
		                                 console.log("erro ao tentar aceder o utilizador!!");
		                            }
		                             else{ 
		                                 console.log("Technician details done");
		                             }
		                        });

                            	// //client details
	                            jobcard.jobcard_clientenome=procuracliente[0].cliente_nome;
	                            jobcard.jobcard_clienteid=procuracliente[0]._id;
	                            jobcard.jobcard_clientebranch="";
	                            jobcard.jobcard_clientetelefone=procuracliente[0].cliente_telefone;

	                            // audit trail
	                            var jobcard_audittrailArray = [];
	                            var jobcard_audittrailObject = {};

	                            var diacarreg = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
					            var mescarreg = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
					            var anocarreg = (new Date()).getFullYear();
					            var todaydatecarreg = diacarreg + "/" + mescarreg + "/" + anocarreg;
					            var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

					            jobcard.data_registojobcard1= todaydatecarreg;

	                            jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
	                            jobcard_audittrailObject.jobcard_audittrailaction = "Upload plan";
	                            jobcard_audittrailObject.jobcard_audittraildate = todaydatecarreg + "  " + todayhours;

	                            jobcard_audittrailArray.push(jobcard_audittrailObject)
	                            jobcard.jobcard_audittrail = jobcard_audittrailArray;

	                            jobcards.gravarDados(jobcard, function(err, data){
	                                if(err){
	                                    console.log("Ocorreu um erro ao tentar gravar os dados!\n contacte o administrador do sistema");
	                                    console.log(err); 
	                                }else{
	                                    // console.log("dados gravados com sucesso!!");
	                                    //res.redirect("/inicio");
	                                }
                            	});
	                        	}

                    		}

                    	}else {
                    		cont = teste[teste.length-1].jobcard_cod.split("/");
                    		cont1 = parseInt(cont[3]);

                    		for (var i = 0, j = result.length; i < j; i++) {
                    			if(result[i].newplanneddate != ""){
								
                    			var jobcard = {};

                    			//planed date details
                    			jobcard.jobcard_planneddate=result[i].newplanneddate;
								jobcard.ttnumber_status= "New";

	                            // generate key
	                            var planneddate = result[i].newplanneddate.split('/');
	                            var dia = planneddate[0];
	                            var mes = planneddate[1];
	                            var year = (planneddate[2] + "").split("");
		                        var ano = year[2] + year[3];

		                        //ms details
		                        var mes2 = parseInt(planneddate[1]) - 1;
		                        var ano2 = planneddate[2];
		                        var dataPlaneada2 = (new Date(ano2, mes2, dia).getTime());
		                        jobcard.jobcard_planneddatems = dataPlaneada2;

		                        var cincodias = 86400000 * 7;
		                        var diaAntes = parseInt(dataPlaneada2) - cincodias;
		                        jobcard.jobcard_planneddate5beforems = diaAntes;

		                        var diaDepois = parseInt(dataPlaneada2) + cincodias;
		                        jobcard.jobcard_planneddate5afterms = diaDepois;

		                        cont6 = "CCM/" + mes + "/" + ano;
                            	cont7 = "CCM";
		                         
		                        cont1 = cont1 + 1;
		                        // cont2 = cont6 + "/0001";

		                        if(cont1 < 10){
			                    	cont2 = cont6 + "/000" + cont1;
			                    	
				                }else
				                    if((cont1 > 10) && (cont1 < 100) ){
				                        cont2 = cont6 + "/00" + cont1;
				                        
				                    }else
				                        if((cont1 > 100) && (cont1 < 1000) ){
				                            cont2 = cont6 + "/0" + cont1;
				                            
				                        }else{
				                            cont2 = cont6 + "/" + cont1;
				                            
				                        }

				                jobcard.jobcard_cod = cont2;

					            //general details
	                            jobcard.jobcard_call= [];
	                            jobcard.jobcard_ttnumber= 0;
	                            jobcard.jobcard_departamento= "";
	                            jobcard.jobcard_jobtype= "Preventative Maintenance";
	                            jobcard.jobcard_jobinfo= "";
	                            jobcard.jobcard_loggedby="Planned";
	                            jobcard.jobcard_estadoactual="Planned";
	                            jobcard.jobcard_datareporte="";
	                            jobcard.jobcard_horareporte="";
	                            jobcard.jobcard_loggedon="";
	                            jobcard.jobcard_quotacao="";
	                            jobcard.jobcard_razaoreprovar="";
	                            jobcard.jobcard_backofficeagent="";
	                            jobcard.jobcard_wait="nao";
	                            jobcard.jobcard_controlador=[1];
	                            jobcard.jobcard_travelinfo_proposito="";
	                            // jobcard.travelinfoArrayJobcard=[];
	                            jobcard.generatorArrayJobcard=[];
                                jobcard.jobcard_credelecinfo=[];
	                            jobcard.equipamentoArrayJobcard=[];
	                            jobcard.sparesArrayJobcard=[];
	                            jobcard.jobcard_site=result[i].basestationno;
	                            jobcard.jobcard_workstatus="";

	                            console.log(result[i].basestationno)
	                            var sitedetails = await siteinfos.find({siteinfo_sitenum:result[i].basestationno}, function(err, dataUser){
		                             if(err){
		                                 console.log("erro ao tentar aceder o utilizador!!");
		                            }
		                             else{ 
		                                 console.log("Site details done");
		                             }
		                        });

		                        jobcard.jobcard_siteid= sitedetails[0]._id;
	                            
	                            //tecnico details
	                            var arrControladorintervenientes = ["Planned"];

	                            jobcard.jobcard_tecniconome= result[i].maintenanceofficer;
	                            arrControladorintervenientes.push(result[i].maintenanceofficer);

	                            var userdetails = await model.find({nome:result[i].maintenanceofficer}, function(err, dataUser){
		                             if(err){
		                                 console.log("erro ao tentar aceder o utilizador!!");
		                            }
		                             else{ 
		                                 console.log("Technician details done");
		                             }
		                        });

		                        if(userdetails != 0 ){
		                        	arrControladorintervenientes.push(userdetails[0].nome_supervisor);
		                        	jobcard.jobcard_linemanager=userdetails[0].nome_supervisor;
		                        	jobcard.jobcard_cell=userdetails[0].telefone_1;
		                        	jobcard.jobcard_regiao= userdetails[0].regiao;
		                        	jobcard.jobcard_tecnicoid = userdetails[0]._id;
		                        }else{
		                        	// arrControladorintervenientes.push(userdetails[0].nome_supervisor);
		                        	jobcard.jobcard_linemanager="";
		                        	jobcard.jobcard_cell="";
		                        	jobcard.jobcard_regiao= "";
		                        	jobcard.jobcard_tecnicoid = "";
		                        }

	                            jobcard.jobcard_controladorintervenientes=arrControladorintervenientes;

	                            var userlinemanager = await model.find({nome:jobcard.jobcard_linemanager}, function(err, dataUser){
		                             if(err){
		                                 console.log("erro ao tentar aceder o utilizador!!");
		                            }
		                             else{ 
		                                 console.log("Technician details done");
		                             }
		                        });

		                        if(userlinemanager.length != 0 ){
		                        	
		                        	jobcard.jobcard_linemanagerid=userlinemanager[0]._id;
		                        	jobcard.jobcard_linemanagercell=userlinemanager[0].telefone_1;
		                        	
		                        }else{
		                        	
		                        	jobcard.jobcard_linemanagerid="";
		                        	jobcard.jobcard_linemanagercell="";
		                        }

                            	// //client details
	                            var procuracliente = await clientes.find({cliente_nome:"Vm,Sa"}, function(err, dataUser){
		                             if(err){
		                                 console.log("erro ao tentar aceder o utilizador!!");
		                            }
		                             else{ 
		                                 console.log("Technician details done");
		                             }
		                        });

                            	// //client details
	                            jobcard.jobcard_clientenome=procuracliente[0].cliente_nome;
	                            jobcard.jobcard_clienteid=procuracliente[0]._id;
	                            jobcard.jobcard_clientebranch="";
	                            jobcard.jobcard_clientetelefone=procuracliente[0].cliente_telefone;

	                            // audit trail
	                            var jobcard_audittrailArray = [];
	                            var jobcard_audittrailObject = {};

	                            var diacarreg = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
					            var mescarreg = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
					            var anocarreg = (new Date()).getFullYear();
					            var todaydatecarreg = diacarreg + "/" + mescarreg + "/" + anocarreg;
					            var todayhours = new Date().getHours() + ":" + new Date().getMinutes();
					            jobcard.data_registojobcard1= todaydatecarreg;

	                            jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
	                            jobcard_audittrailObject.jobcard_audittrailaction = "Upload plan";
	                            jobcard_audittrailObject.jobcard_audittraildate = todaydatecarreg + "  " + todayhours;

	                            jobcard_audittrailArray.push(jobcard_audittrailObject)
	                            jobcard.jobcard_audittrail = jobcard_audittrailArray;

	                            jobcards.gravarDados(jobcard, function(err, data){
	                                if(err){
	                                    console.log("Ocorreu um erro ao tentar gravar os dados!\n contacte o administrador do sistema");
	                                    console.log(err); 
	                                }else{
	                                    // console.log("dados gravados com sucesso!!");
	                                    //res.redirect("/inicio");
	                                }
	                            });

	                          }

                    		}


                    	}
                    	
                    	



                        res.redirect("/manutencao/preventativemaint/new");
                    }
                    
                });
            } catch (e){
                res.json({error_code:1,err_desc:"Corupted excel file"});
            }
        })
       
});


router.post('/uploadttnumberplan', async function(req, res) {
		var userData=req.session.usuario;
        var exceltojson;
        uploaderttnumberplan(req,res,function(err){
            if(err){
                 res.json({error_code:1,err_desc:err});
                 return;
            }
            /** Multer gives us file info in req.file object */
            if(!req.file){
                res.json({error_code:1,err_desc:"No file passed"});
                return;
            }
            /** Check the extension of the incoming file and 
             *  use the appropriate module
             */
            if(req.file.originalname.split('.')[req.file.originalname.split('.').length-1] === 'xlsx'){
                exceltojson = xlsxtojson;
            } else {
                exceltojson = xlstojson;
            }
            console.log(req.file.path);
            try {
                exceltojson({
                    input: req.file.path,
                    output: null, //since we don't need output.json
                    sheet:"Data",
                    lowerCaseHeaders:true
                }, async function(err,result){
                    if(err) {
                        return res.json({error_code:1,err_desc:err, data: null});
                    }
                    else{
                    	
                    	if(result[0].taskid != undefined){

                    		await result.reduce(async function(contjobcards, idiota, i){
								await contjobcards;
								await sleep(10);

								var procurajobcard = await jobcards.updateOne({jobcard_jobtype:"Preventative Maintenance", jobcard_tecniconome:result[i].maintenanceofficer, jobcard_site:result[i].basestationno, jobcard_planneddate:result[i].newplanneddate}, {$set:{data_ultimaactualizacaojobcard:new Date(),jobcard_ttnumber:parseInt(result[i].taskid)}}, function(err, data){
								     if(err){
								         console.log(err);
								     }else{
								         // console.log(data.length)
								         console.log("Update");
								     }
								 }).lean();

			

								},0)


                    	}

                    	
                        res.redirect("/manutencao/preventativemaint/new");
                    }
                    
                });
            } catch (e){
                res.json({error_code:1,err_desc:"Corupted excel file"});
            }
        })
       
});


router.get('/', async function(req, res) {
	var userData=await req.session.usuario;
	var nome = await userData.nome;



	var admin_case=await admin_db.find({});

	if(userData.departamento_id=="611e45e68cd71c1f48cf45bd" || userData.departamento_id=="61532251699ee012d00db4e7" || userData.departamento_id=="61532293699ee012d00db4e8"){
		res.render("manutencao_Hvac", {DataU:userData, title: 'EAGLEI'});
	}
	
	else
		res.render("manutencaohome", {DataU:userData, title: 'EAGLEI'});
 
});

router.get('/menuMaintPlan/:id', function(req, res) {
	var userData=req.session.usuario;
	var nome = userData.nome;
	var id = req.params.id;

	jobcards.find({_id:id}, {jobcardsignage:1, jobcardcontainer:1, jobcardmast:1, jobcardcleaning:1, jobcardlocks:1, jobcardenvironmental:1, jobcardfallarrest:1, jobcardgeneratorinfo:1, jobcardedBoardinfo:1, jobcardelectricalinfo:1, jobcardrectifierinfo:1, jobcardbatterybanksinfo:1, jobcardaircondinfo:1, jobcardantennasinfo:1, jobcardeainfo:1, jobcardtxinfo:1, jobcardvsatinfo:1, jobcardphotoinfo:1, jobcardconcernsinfo:1}, function(err, data){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}
		else{
			
			res.render("preventative_menu", {DataU:userData, Jobcards:data, title: 'EAGLEI'});
		}
	}).lean();
	
 
});

router.post('/siteinfohomepesquisa', async function(req, res) {
	var userData=req.session.usuario;
	var nome = userData.nome;
	var siteinfocont = req.body;
	var pesquisador = siteinfocont.pesquisador;
	var controlador = siteinfocont.pesquisador.toLowerCase();
	var firstLetter = controlador.charAt(0).toUpperCase();
	var rest = controlador.slice(1);
	var controladorupper = firstLetter.concat(rest);

	var controladornr = 0;
		
	if(isNaN(controlador)){
		controladornr = 0;
		console.log(parseInt(controladornr))
	}else{
		controladornr = controlador;
		var ttnr = parseInt(controlador);
	}
	
	console.log(controladorupper, controlador);
	siteinfos.find({$or:[{siteinfo_sitenum: ttnr}, {siteinfo_sitename: {$regex:pesquisador}}, {siteinfo_maintoff: pesquisador}, {siteinfo_regiaoselmec: {$regex:controladorupper}}, {siteinfo_maintoff: {$regex:controladorupper}}, {siteinfo_credelec:controlador}]}, function(err, data){
		if(err){
			console.log(err);
		}
		else{
			res.render("siteinfo_home", {DataU:userData, Dadospesquisa:controlador, Siteinfos:data, title: 'EAGLEI'});
		}
	}).sort({ siteinfo_sitenum: 1 }).limit(50);
	
 
});

router.get('/siteinfohome/previouspage/:contador/:totalnr', function(req, res) {
	var userData=req.session.usuario;
	var nome = userData.nome;
	var incrementadr = parseInt(req.params.contador) - 1;
	var contador = incrementadr * 50;
	
	console.log(contador)
	console.log(incrementadr)

	siteinfos.find({}, function(err, data){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}
		else{
			res.render("siteinfo_home", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:incrementadr, dadoscontroladorincr:parseInt(req.params.contador), Siteinfos:data, title: 'EAGLEI'});
		}
	}).sort({ siteinfo_sitenum: 1 }).skip(contador).limit(50);
	
 
});

router.get('/siteinfohome/nextpage/:contador/:totalnr', function(req, res) {
	var userData=req.session.usuario;
	var nome = userData.nome;
	var contador = parseInt(req.params.contador) * 50;
	var incrementadr = parseInt(req.params.contador) + 1;
	console.log(contador)
	console.log(incrementadr)

	siteinfos.find({}, function(err, data){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}
		else{
			res.render("siteinfo_home", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr) ,dadoscontroladordecr:parseInt(req.params.contador),dadoscontroladorincr:incrementadr, Siteinfos:data, title: 'EAGLEI'});
		}
	}).sort({ siteinfo_sitenum: 1 }).skip(contador).limit(50);
	
 
});

router.get('/siteinfohome', function(req, res) {
	var userData=req.session.usuario;
	var nome = userData.nome;

	siteinfos.find({}, function(err, data){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}
		else{
			siteinfos.find({}, function(err, dataSiteInfo){
				if(err){

				}else{

					var total = dataSiteInfo.length;
					var totalcont = Math.ceil(dataSiteInfo.length/50);

					res.render("siteinfo_home", {DataU:userData, dadostotalnr:totalcont, dadoscontroladordecr:0,dadoscontroladorincr:1, Siteinfos:data, title: 'EAGLEI'});

				}
			});
			
		}
	}).sort({ siteinfo_sitenum: 1 }).limit(50);
	
 
});

router.get('/maintenancereports',async function(req, res) {
	var userData=req.session.usuario;
	var nome = userData.nome;

	var Call = ["Complete", "In Progress", "New"];
	var tecnicomaputo = await usuarios.find({funcao: "Tecnico", regiao: "maputo"}).sort({nome:1});
	var tecnicosul = await usuarios.find({funcao: "Tecnico", regiao: "sul"}).sort({nome:1});
	var tecnicocentro = await usuarios.find({funcao: "Tecnico", regiao: "centro"}).sort({nome:1});
	var tecniconorte = await usuarios.find({funcao: "Tecnico", regiao: "norte"}).sort({nome:1});
	
	res.render("reportes_manutencaohome", {data: req.body, DataU:userData, call: Call, Usuarios: tecnicomaputo, UsuariosS:tecnicosul,UsuariosC:tecnicocentro, UsuariosN:tecniconorte,  title: 'EAGLEI'});
});

router.get('/jobcardprojectshome', async function(req, res) {
	var userData=req.session.usuario;
	var nome = userData.nome;
	var countNew;
	var countInprogress;
	var countComplete;

	var controladorfuncao = 0;

	if (userData.funcao == "Tecnico" || userData.funcao == "Assistant") {
		controladorfuncao = 1;
	}else if(userData.funcao == "regional_manager"){
		controladorfuncao = 2;
	}else if (userData.verificador_funcao == "Regional Manager") {
		controladorfuncao = 3;
	}else if((userData.funcao = "Call Center") || (userData.funcao = "Back Office") || (userData.nivel_acesso = "admin") (userData.funcao == "Manager")){
		controladorfuncao = 4;
	}else if(userData.nome == "Guest"){
		controladorfuncao = 5;
	};

	console.log(controladorfuncao);
	switch (controladorfuncao) {
		case 1:
			countNew = await jobcardprojects.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, newjobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts New")
				} else {
					console.log(newjobs + " jobcards novos");
				}
			}).lean();
					
			countInprogress = await	jobcardprojects.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, inprogressjobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts In progress");
				} else {
					console.log(inprogressjobs + " jobcards In Progress");
				}
			}).lean();
							
			countComplete = await jobcardprojects.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"Complete", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, completejobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts Complete");
				} else {
					console.log(completejobs + " jobcards Complete");
				}
			}).lean();

		break;

		case 2:
			countNew = await jobcardprojects.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, newjobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts New")
				} else {
					console.log(newjobs + " jobcards novos");
				}
			}).lean();
					
			countInprogress = await	jobcardprojects.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, inprogressjobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts In progress");
				} else {
					console.log(inprogressjobs + " jobcards In Progress");
				}
			}).lean();
							
			countComplete = await jobcardprojects.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"Complete", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, completejobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts Complete");
				} else {
					console.log(completejobs + " jobcards Complete");
				}
			}).lean();

		break;

		case 3:
			countNew = await jobcardprojects.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New", jobcard_regiao:userData.regiao}, function(err, newjobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts New")
				} else {
					console.log(newjobs + " jobcards novos");
				}
			}).lean();
					
			countInprogress = await	jobcardprojects.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", jobcard_regiao:userData.regiao}, function(err, inprogressjobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts In progress");
				} else {
					console.log(inprogressjobs + " jobcards In Progress");
				}
			}).lean();
							
			countComplete = await jobcardprojects.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"Complete", jobcard_regiao:userData.regiao}, function(err, completejobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts Complete");
				} else {
					console.log(completejobs + " jobcards Complete");
				}
			}).lean();

		break;

		case 4:
			countNew = await jobcardprojects.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New"}, function(err, newjobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts New")
				} else {
					console.log(newjobs + " jobcards novos");
				}
			}).lean();
					
			countInprogress = await	jobcardprojects.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"In Progress"}, function(err, inprogressjobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts In progress");
				} else {
					console.log(inprogressjobs + " jobcards In progress");
				}
			}).lean();
							
			countComplete = await jobcardprojects.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"Complete"}, function(err, completejobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts Complete");
				} else {
					console.log(completejobs + " jobcards Complete");
				}
			}).lean();

		break;

		case 5:
			countNew = await jobcardprojects.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New", jobcard_clientenome: "Vm,Sa"}, function(err, newjobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts New")
				} else {
					console.log(newjobs + " jobcards novos");
				}
			}).lean();
					
			countInprogress = await	jobcardprojects.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New", jobcard_clientenome: "Vm,Sa"}, function(err, inprogressjobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts In progress");
				} else {
					console.log(inprogressjobs + " jobcards In Progress");
				}
			}).lean();
							
			countComplete = await jobcardprojects.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New", jobcard_clientenome: "Vm,Sa"}, function(err, completejobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts Complete");
				} else {
					console.log(completejobs + " jobcards Complete");
				}
			}).lean();

		break;

	}

	res.render("jobcardprojects_options", {DataU:userData, CountNew:countNew, CountInprogress:countInprogress, CountComplete:countComplete, title: 'EAGLEI'});
	
});


// router.get('/ttnumberhome', async function(req, res) {
// 	var userData=req.session.usuario;
// 	var nome = userData.nome;
// 	var countNew;
// 	var countInprogress;
// 	var countInprogressTotal;
// 	var countComplete;
// 	var userDept = userData.departamento;

// 	var controladorfuncao = 0;
// 	console.log(userData.funcao + " do departamento " + userDept);

// 	if (userData.funcao == "Tecnico" || userData.funcao == "Assistant") {
// 		controladorfuncao = 1;
// 	}else if(userData.funcao == "regional_manager"){
// 		controladorfuncao = 2;
// 	}else if (userData.verificador_funcao == "Regional Manager") {
// 		controladorfuncao = 3;
// 	}else if((userData.funcao == "Call Center") || (userData.funcao == "Back Office") || (userData.nivel_acesso == "admin") || (userData.funcao == "IT Officer")){
// 		controladorfuncao = 4;
// 	}else if(userData.nome == "Guest"){
// 		controladorfuncao = 5;
// 	}else if (userData.funcao == "Manager") {
// 		controladorfuncao = 6;
// 	}

// 	console.log(controladorfuncao);
// 	switch (controladorfuncao) {
// 		case 1:
// 			countNew = await jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, newjobs){
// 				if (err) {
// 					console.log("Ocorreu um erro ao tentar contar os Callouts New")
// 				} else {
// 					console.log(newjobs + " jobcards novos");
// 				}
// 			}).lean();
					
// 			countInprogress = await	jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, inprogressjobs){
// 				if (err) {
// 					console.log("Ocorreu um erro ao tentar contar os Callouts In progress");
// 				} else {
// 					console.log(inprogressjobs + " jobcards In Progress");
// 				}
// 			}).lean();
							
// 			countComplete = await jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"Complete", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, completejobs){
// 				if (err) {
// 					console.log("Ocorreu um erro ao tentar contar os Callouts Complete");
// 				} else {
// 					console.log(completejobs + " jobcards Complete");
// 				}
// 			}).lean();

// 			countEscalated = await jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New", $or:[{jobcard_escalationlevel:"1"}, {jobcard_escalationlevel:"2"}], jobcard_tecniconome:nome}, function(err, escalatedjobs){
// 				if (err) {
// 					console.log("Ocorreu um erro ao tentar contar os Callouts escalonados")
// 				} else {
// 					console.log(escalatedjobs + " jobcards escalados");
// 				}
// 			}).lean();

// 		break;

// 		case 2:
// 			countNew = await jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, newjobs){
// 				if (err) {
// 					console.log("Ocorreu um erro ao tentar contar os Callouts New")
// 				} else {
// 					console.log(newjobs + " jobcards novos");
// 				}
// 			}).lean();
					
// 			countInprogress = await	jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, inprogressjobs){
// 				if (err) {
// 					console.log("Ocorreu um erro ao tentar contar os Callouts In progress");
// 				} else {
// 					console.log(inprogressjobs + " jobcards In Progress");
// 				}
// 			}).lean();
							
// 			countComplete = await jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"Complete", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, completejobs){
// 				if (err) {
// 					console.log("Ocorreu um erro ao tentar contar os Callouts Complete");
// 				} else {
// 					console.log(completejobs + " jobcards Complete");
// 				}
// 			}).lean();

// 			countEscalated = await jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New", jobcard_escalationlevel:{$exists:true} , $and:[{$or:[{jobcard_escalationlevel:"1"}, {jobcard_escalationlevel:"2"}]}, {$or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}]}, function(err, escalatedjobs){
// 				if (err) {
// 					console.log("Ocorreu um erro ao tentar contar os Callouts Escalated")
// 				} else {
// 					console.log(escalatedjobs + " jobcards escalated");
// 				}
// 			}).lean();

// 		break;

// 		case 3:
// 			countNew = await jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New", jobcard_regiao:userData.regiao, jobcard_departamento:userDept}, function(err, newjobs){
// 				if (err) {
// 					console.log("Ocorreu um erro ao tentar contar os Callouts New")
// 				} else {
// 					console.log(newjobs + " jobcards novos");
// 				}
// 			}).lean();
					
// 			countInprogress = await	jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", jobcard_regiao:userData.regiao, jobcard_departamento:userDept}, function(err, inprogressjobs){
// 				if (err) {
// 					console.log("Ocorreu um erro ao tentar contar os Callouts In progress");
// 				} else {
// 					console.log(inprogressjobs + " jobcards In Progress");
// 				}
// 			}).lean();
							
// 			countComplete = await jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"Complete", jobcard_regiao:userData.regiao, jobcard_departamento:userDept}, function(err, completejobs){
// 				if (err) {
// 					console.log("Ocorreu um erro ao tentar contar os Callouts Complete");
// 				} else {
// 					console.log(completejobs + " jobcards Complete");
// 				}
// 			}).lean();

// 			countEscalated = await jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New", jobcard_regiao:userData.regiao, $or:[{jobcard_escalationlevel:"1"}, {jobcard_escalationlevel:"2"}], jobcard_departamento:userDept}, function(err, escalatedjobs){
// 				if (err) {
// 					console.log("Ocorreu um erro ao tentar contar os Callouts Escalados")
// 				} else {
// 					console.log(escalatedjobs + " jobcards escalados");
// 				}
// 			}).lean();

// 		break;

// 		case 4:
// 			countNew = await jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New"}, function(err, newjobs){
// 				if (err) {
// 					console.log("Ocorreu um erro ao tentar contar os Callouts New")
// 				} else {
// 					console.log(newjobs + " jobcards novos");
// 				}
// 			}).lean();
					
// 			countInprogress = await	jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"In Progress"}, function(err, inprogresscallouts){
// 				if (err) {
// 					console.log("Ocorreu um erro ao tentar contar os Callouts In progress");
// 				} else {
// 					console.log(inprogresscallouts + " jobcards In progress");
// 					counthvac = hvac_db.countDocuments({departamento_ref:"611e45e68cd71c1f48cf45bd", status:"In Progress"}, function(err, inprogresshvac){
// 						if (err) {
// 							console.log("Ocorreu um erro ao tentar contar os Callouts do HVAC In progress");
// 						} else{
// 							console.log(inprogresshvac + " jobcards In progress");
// 							countInprogressTotal = inprogresscallouts + inprogresshvac;
// 							console.log("O numero total de  jobcards em progresso eh" + countInprogressTotal);
// 						}
// 					})
// 				}
// 			}).lean();
							
// 			countComplete = await jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"Complete"}, function(err, completejobs){
// 				if (err) {
// 					console.log("Ocorreu um erro ao tentar contar os Callouts Complete");
// 				} else {
// 					console.log(completejobs + " jobcards Complete");
// 				}
// 			}).lean();

// 			countEscalated = await jobcards.countDocuments({jobcard_jobtype:"Callout", $or:[{jobcard_escalationlevel:"1"}, {jobcard_escalationlevel:"2"}], ttnumber_status:"New"}, function(err, escalatedjobs){
// 				if (err) {
// 					console.log("Ocorreu um erro ao tentar contar os Callouts Escalados")
// 				} else {
// 					console.log(escalatedjobs + " jobcards escalados");
// 				}
// 			}).lean();

// 		break;

// 		case 5:
// 			countNew = await jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New", jobcard_clientenome: "Vm,Sa"}, function(err, newjobs){
// 				if (err) {
// 					console.log("Ocorreu um erro ao tentar contar os Callouts New")
// 				} else {
// 					console.log(newjobs + " jobcards novos");
// 				}
// 			}).lean();
					
// 			countInprogress = await	jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New", jobcard_clientenome: "Vm,Sa"}, function(err, inprogressjobs){
// 				if (err) {
// 					console.log("Ocorreu um erro ao tentar contar os Callouts In progress");
// 				} else {
// 					console.log(inprogressjobs + " jobcards In Progress");
// 				}
// 			}).lean();
							
// 			countComplete = await jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New", jobcard_clientenome: "Vm,Sa"}, function(err, completejobs){
// 				if (err) {
// 					console.log("Ocorreu um erro ao tentar contar os Callouts Complete");
// 				} else {
// 					console.log(completejobs + " jobcards Complete");
// 				}
// 			}).lean();

// 			countEscalated = await jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New", $or:[{jobcard_escalationlevel:"1"}, {jobcard_escalationlevel:"2"}], jobcard_clientenome: "Vm,Sa"}, function(err, escalatedjobs){
// 				if (err) {
// 					console.log("Ocorreu um erro ao tentar contar os Callouts Escalados")
// 				} else {
// 					console.log(escalatedjobs + " jobcards escalados");
// 				}
// 			}).lean();

// 		break;

// 		case 6:
// 			countNew = await jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New", jobcard_departamento:userDept}, function(err, newjobs){
// 				if (err) {
// 					console.log("Ocorreu um erro ao tentar contar os Callouts New")
// 				} else {
// 					console.log(newjobs + " jobcards novos");
// 				}
// 			}).lean();
					
// 			countInprogress = await	jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", jobcard_departamento:userDept}, function(err, inprogressjobs){
// 				if (err) {
// 					console.log("Ocorreu um erro ao tentar contar os Callouts In progress");
// 				} else {
// 					console.log(inprogressjobs + " jobcards In progress");
// 				}
// 			}).lean();
							
// 			countComplete = await jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"Complete", jobcard_departamento:userDept}, function(err, completejobs){
// 				if (err) {
// 					console.log("Ocorreu um erro ao tentar contar os Callouts Complete");
// 				} else {
// 					console.log(completejobs + " jobcards Complete");
// 				}
// 			}).lean();

// 			countEscalated = await jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New", $or:[{jobcard_escalationlevel:"1"}, {jobcard_escalationlevel:"2"}], jobcard_departamento:userDept}, function(err, escalatedjobs){
// 				if (err) {
// 					console.log("Ocorreu um erro ao tentar contar os Callouts Escalados")
// 				} else {
// 					console.log(escalatedjobs + " jobcards escalados");
// 				}
// 			}).lean();

// 		break;

// 	}

// 	res.render("ttnumber_options", {DataU:userData,CountNew:countNew, CountInprogress:countInprogressTotal, CountComplete:countComplete, CountEscalated:countEscalated, title: 'EAGLEI'});
	
// });

router.get('/ttnumberhome', async function(req, res) {
	var userData=req.session.usuario;
	var nome = userData.nome;
	var countNew;
    var countNewtotal;
	var countInprogress;
	var countInprogressTotal;
	var countComplete;
	var userDept = userData.departamento;

	var controladorfuncao = 0;
	console.log(userData.funcao + " do departamento " + userDept);

	if (userData.funcao == "Tecnico" || userData.funcao == "Assistant") {
		controladorfuncao = 1;
	}else if(userData.funcao == "regional_manager"){
		controladorfuncao = 2;
	}else if (userData.verificador_funcao == "Regional Manager") {
		controladorfuncao = 3;
	}else if((userData.funcao == "Call Center") || (userData.funcao == "Back Office") || (userData.nivel_acesso == "admin") || (userData.funcao == "IT Officer")){
		controladorfuncao = 4;
	}else if(userData.nome == "Guest"){
		controladorfuncao = 5;
	}else if (userData.funcao == "Manager") {
		controladorfuncao = 6;
	}

	console.log(controladorfuncao);
	switch (controladorfuncao) {
		case 1:
			countNew = await jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, newjobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts New")
				} else {
					console.log(newjobs + " jobcards novos");
				}
			}).lean();
					
			countInprogress = await	jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, inprogressjobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts In progress");
				} else {
					console.log(inprogressjobs + " jobcards In Progress");
				}
			}).lean();
							
			countComplete = await jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"Complete", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, completejobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts Complete");
				} else {
					console.log(completejobs + " jobcards Complete");
				}
			}).lean();

			countEscalated = await jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New", $or:[{jobcard_escalationlevel:"1"}, {jobcard_escalationlevel:"2"}], jobcard_tecniconome:nome}, function(err, escalatedjobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts escalonados")
				} else {
					console.log(escalatedjobs + " jobcards escalados");
				}
			}).lean();

		break;

		case 2:
			countNew = await jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, newjobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts New")
				} else {
					console.log(newjobs + " jobcards novos");
				}
			}).lean();
					
			countInprogress = await	jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, inprogressjobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts In progress");
				} else {
					console.log(inprogressjobs + " jobcards In Progress");
				}
			}).lean();
							
			countComplete = await jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"Complete", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, completejobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts Complete");
				} else {
					console.log(completejobs + " jobcards Complete");
				}
			}).lean();

			countEscalated = await jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New", jobcard_escalationlevel:{$exists:true} , $and:[{$or:[{jobcard_escalationlevel:"1"}, {jobcard_escalationlevel:"2"}]}, {$or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}]}, function(err, escalatedjobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts Escalated")
				} else {
					console.log(escalatedjobs + " jobcards escalated");
				}
			}).lean();

		break;

		case 3:
			countNew = await jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New", jobcard_regiao:userData.regiao, jobcard_departamento:userDept}, function(err, newjobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts New")
				} else {
					console.log(newjobs + " jobcards novos");
				}
			}).lean();
					
			countInprogress = await	jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", jobcard_regiao:userData.regiao, jobcard_departamento:userDept}, function(err, inprogressjobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts In progress");
				} else {
					console.log(inprogressjobs + " jobcards In Progress");
				}
			}).lean();
							
			countComplete = await jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"Complete", jobcard_regiao:userData.regiao, jobcard_departamento:userDept}, function(err, completejobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts Complete");
				} else {
					console.log(completejobs + " jobcards Complete");
				}
			}).lean();

			countEscalated = await jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New", jobcard_regiao:userData.regiao, $or:[{jobcard_escalationlevel:"1"}, {jobcard_escalationlevel:"2"}], jobcard_departamento:userDept}, function(err, escalatedjobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts Escalados")
				} else {
					console.log(escalatedjobs + " jobcards escalados");
				}
			}).lean();

		break;

		case 4:
			countNew = await jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New"}, function(err, newjobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts New")
				} else {
					console.log(newjobs + " jobcards novos");
                    counthvac = hvac_db.countDocuments({departamento_ref:"611e45e68cd71c1f48cf45bd", status:"new"}, function(err, newhvac){
						if (err) {
							console.log("Ocorreu um erro ao tentar contar os Callouts do HVAC In progress");
						} else{
							console.log(newjobs + " jobcards In progress");
							countNewtotal = newjobs + newhvac;
							console.log("O numero total de  jobcards em progresso eh" + countNewtotal);
						}
					})
				}
			}).lean();
					
			countInprogress = await	jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"In Progress"}, function(err, inprogresscallouts){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts In progress");
				} else {
					console.log(inprogresscallouts + " jobcards In progress");
					counthvac = hvac_db.countDocuments({departamento_ref:"611e45e68cd71c1f48cf45bd", status:"In Progress"}, function(err, inprogresshvac){
						if (err) {
							console.log("Ocorreu um erro ao tentar contar os Callouts do HVAC In progress");
						} else{
							console.log(inprogresshvac + " jobcards In progress");
							countInprogressTotal = inprogresscallouts + inprogresshvac;
							console.log("O numero total de  jobcards em progresso eh" + countInprogressTotal);
						}
					})
				}
			}).lean();
							
			countComplete = await jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"Complete"}, function(err, completejobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts Complete");
				} else {
					console.log(completejobs + " jobcards Complete");
				}
			}).lean();

			countEscalated = await jobcards.countDocuments({jobcard_jobtype:"Callout", $or:[{jobcard_escalationlevel:"1"}, {jobcard_escalationlevel:"2"}], ttnumber_status:"New"}, function(err, escalatedjobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts Escalados")
				} else {
					console.log(escalatedjobs + " jobcards escalados");
				}
			}).lean();

		break;

		case 5:
			countNew = await jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New", jobcard_clientenome: "Vm,Sa"}, function(err, newjobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts New")
				} else {
					console.log(newjobs + " jobcards novos");
				}
			}).lean();
					
			countInprogress = await	jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New", jobcard_clientenome: "Vm,Sa"}, function(err, inprogressjobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts In progress");
				} else {
					console.log(inprogressjobs + " jobcards In Progress");
				}
			}).lean();
							
			countComplete = await jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New", jobcard_clientenome: "Vm,Sa"}, function(err, completejobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts Complete");
				} else {
					console.log(completejobs + " jobcards Complete");
				}
			}).lean();

			countEscalated = await jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New", $or:[{jobcard_escalationlevel:"1"}, {jobcard_escalationlevel:"2"}], jobcard_clientenome: "Vm,Sa"}, function(err, escalatedjobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts Escalados")
				} else {
					console.log(escalatedjobs + " jobcards escalados");
				}
			}).lean();

		break;

		case 6:
			countNew = await jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New", jobcard_departamento:userDept}, function(err, newjobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts New")
				} else {
					console.log(newjobs + " jobcards novos");
				}
			}).lean();
					
			countInprogress = await	jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", jobcard_departamento:userDept}, function(err, inprogressjobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts In progress");
				} else {
					console.log(inprogressjobs + " jobcards In progress");
				}
			}).lean();
							
			countComplete = await jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"Complete", jobcard_departamento:userDept}, function(err, completejobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts Complete");
				} else {
					console.log(completejobs + " jobcards Complete");
				}
			}).lean();

			countEscalated = await jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New", $or:[{jobcard_escalationlevel:"1"}, {jobcard_escalationlevel:"2"}], jobcard_departamento:userDept}, function(err, escalatedjobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts Escalados")
				} else {
					console.log(escalatedjobs + " jobcards escalados");
				}
			}).lean();

		break;

	}

	res.render("ttnumber_options", {DataU:userData,CountNew:countNewtotal, CountInprogress:countInprogressTotal, CountComplete:countComplete, CountEscalated:countEscalated, title: 'EAGLEI'});
	
});

router.get('/preventativehome', async function(req, res) {
	var userData=req.session.usuario;
	var nome = userData.nome;
	var countNewHoje;
	var countNew;
	var countInprogress;
	var countComplete;
	var userDept = userData.departamento;

	var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
    var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
    var ano = (new Date()).getFullYear();
    var datactual = dia + "/" + mes + "/" + ano;
	var presentDate = new Date().getTime();


	var controladorfuncao = 0;

	if (userData.funcao == "Tecnico" || userData.funcao == "Assistant") {
		controladorfuncao = 1;
	}else if(userData.funcao == "regional_manager"){
		controladorfuncao = 2;
	}else if (userData.verificador_funcao == "Regional Manager") {
		controladorfuncao = 3;
	}else if((userData.funcao == "Call Center") || (userData.funcao == "Back Office") || (userData.nivel_acesso == "admin")){
		controladorfuncao = 4;
	}else if(userData.nome == "Guest"){
		controladorfuncao = 5;
	}else if (userData.funcao == "Manager") {
		controladorfuncao = 6;
	}

	console.log(controladorfuncao);
	switch (controladorfuncao) {
		case 1:
			countNewHoje = await jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}], jobcard_planneddatems: {$lte:presentDate}}, function(err, newhojejobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts New")
				} else {
					console.log(newhojejobs + " jobcards novos");
				}
			}).lean();

			countNew = await jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, newjobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts New")
				} else {
					console.log(newjobs + " jobcards novos");
				}
			}).lean();
					
			countInprogress = await	jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"In Progress", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, inprogressjobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts In progress");
				} else {
					console.log(inprogressjobs + " jobcards In Progress");
				}
			}).lean();
							
			countComplete = await jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"Complete", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, completejobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts Complete");
				} else {
					console.log(completejobs + " jobcards Complete");
				}
			}).lean();

		break;

		case 2:
			countNewHoje = await jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}], jobcard_planneddatems: {$lte:presentDate}}, function(err, newhojejobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts New")
				} else {
					console.log(newhojejobs + " jobcards novos");
				}
			}).lean();

			countNew = await jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, newjobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts New")
				} else {
					console.log(newjobs + " jobcards novos");
				}
			}).lean();
					
			countInprogress = await	jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"In Progress", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, inprogressjobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts In progress");
				} else {
					console.log(inprogressjobs + " jobcards In Progress");
				}
			}).lean();
							
			countComplete = await jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"Complete", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, completejobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts Complete");
				} else {
					console.log(completejobs + " jobcards Complete");
				}
			}).lean();

		break;

		case 3:
			countNewHoje = await jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_regiao:userData.regiao, jobcard_departamento:userDept, jobcard_planneddatems: {$lte:presentDate}}, function(err, newhojejobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts New")
				} else {
					console.log(newhojejobs + " jobcards novos");
				}
			}).lean();

			countNew = await jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_regiao:userData.regiao, jobcard_departamento:userDept}, function(err, newjobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts New")
				} else {
					console.log(newjobs + " jobcards novos");
				}
			}).lean();
					
			countInprogress = await	jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"In Progress", jobcard_regiao:userData.regiao, jobcard_departamento:userDept}, function(err, inprogressjobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts In progress");
				} else {
					console.log(inprogressjobs + " jobcards In Progress");
				}
			}).lean();
							
			countComplete = await jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"Complete", jobcard_regiao:userData.regiao, jobcard_departamento:userDept}, function(err, completejobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts Complete");
				} else {
					console.log(completejobs + " jobcards Complete");
				}
			}).lean();

		break;

		case 4:
			countNewHoje = await jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_planneddatems: {$lte:presentDate}}, function(err, newhojejobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts New")
				} else {
					console.log(newhojejobs + " jobcards novos");
				}
			}).lean();	

			countNew = await jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New"}, function(err, newjobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts New")
				} else {
					console.log(newjobs + " jobcards novos");
				}
			}).lean();
					
			countInprogress = await	jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"In Progress"}, function(err, inprogressjobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts In progress");
				} else {
					console.log(inprogressjobs + " jobcards In progress");
				}
			}).lean();
							
			countComplete = await jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"Complete"}, function(err, completejobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts Complete");
				} else {
					console.log(completejobs + " jobcards Complete");
				}
			}).lean();

		break;

		case 5:
			
			countNewHoje = await jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_clientenome: "Vm,Sa", jobcard_planneddatems: {$lte:presentDate}}, function(err, newhojejobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts New")
				} else {
					console.log(newhojejobs + " jobcards novos");
				}
			}).lean();

			countNew = await jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_clientenome: "Vm,Sa"}, function(err, newjobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts New")
				} else {
					console.log(newjobs + " jobcards novos");
				}
			}).lean();
					
			countInprogress = await	jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"In Progress", jobcard_clientenome: "Vm,Sa"}, function(err, inprogressjobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts In progress");
				} else {
					console.log(inprogressjobs + " jobcards In Progress");
				}
			}).lean();
							
			countComplete = await jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"Complete", jobcard_clientenome: "Vm,Sa"}, function(err, completejobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts Complete");
				} else {
					console.log(completejobs + " jobcards Complete");
				}
			}).lean();

		break;

		case 6:
			countNewHoje = await jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_departamento:userDept, jobcard_planneddatems: {$lte:presentDate}}, function(err, newhojejobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts New")
				} else {
					console.log(newhojejobs + " jobcards novos");
				}
			}).lean();	

			countNew = await jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_departamento:userDept}, function(err, newjobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts New")
				} else {
					console.log(newjobs + " jobcards novos");
				}
			}).lean();
					
			countInprogress = await	jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"In Progress", jobcard_departamento:userDept}, function(err, inprogressjobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts In progress");
				} else {
					console.log(inprogressjobs + " jobcards In progress");
				}
			}).lean();
							
			countComplete = await jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"Complete", jobcard_departamento:userDept}, function(err, completejobs){
				if (err) {
					console.log("Ocorreu um erro ao tentar contar os Callouts Complete");
				} else {
					console.log(completejobs + " jobcards Complete");
				}
			}).lean();

		break;

	}

	res.render("preventative_options", {DataU:userData, CountNewHoje:countNewHoje, CountNew:countNew, CountInprogress:countInprogress, CountComplete:countComplete, title: 'EAGLEI'});
	
});

router.post('/preventativemaintnewpesquisa', async function(req, res) {
	var userData=req.session.usuario;
	var nome = userData.nome;
	var tthomecont = req.body;
	var controlador = tthomecont.pesquisador.toLowerCase();
	var firstLetter = controlador.charAt(0).toUpperCase();
	var rest = controlador.slice(1);
	var controladorupper = firstLetter.concat(rest);
	
	var controladornr = 0;

	if(isNaN(controlador)){
		controladornr = 0;
		console.log(parseInt(controladornr))
	}else{
		controladornr = controlador;
	}
	
	if((userData.funcao == "Call Center") || (userData.funcao == "Back Office") || (userData.nivel_acesso == "admin") || (userData.funcao == "Call Center")){
		jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", $or:[{jobcard_site: controladornr}, {jobcard_regiao: {$regex: controlador}}, {jobcard_planneddate: controlador}, {jobcard_tecniconome: {$regex:controladorupper}}]}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{

				jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", $or:[{jobcard_ttnumber:parseInt(controladornr)}, {jobcard_site:controlador}]}, function(err, dataJobcard){
					if(err){
						console.log("ocorreu um erro ao tentar aceder os dados")
					}
					else{
						
						var total = dataJobcard;
						var totalcont = Math.ceil(total/50);
						// console.log(totalcont)
						res.render("maintplan_home", {DataU:userData, Dadospesquisa:controlador, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
					}
				}).exec();
				
			}
		}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();

	}else{

		jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}, {jobcard_ttnumber:parseInt(controladornr)}, {jobcard_site:controlador}]}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				
				jobcards.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1}, function(err, dataJobcaaards){

					if(err){
						console.log("ocorreu um erro ao tentar aceder os dados")
					}
					else{

						jobcardprojects.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1}, function(err, dataProjects){

							if(err){
								console.log("ocorreu um erro ao tentar aceder os dados")
							}
							else{




								jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New" , $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, dataJobcard){
									if(err){
										console.log("ocorreu um erro ao tentar aceder os dados")
									}else{

										// console.log(dataJobcard)
										var total = dataJobcard.length;
										var totalcont = Math.ceil(total/50);

										res.render("maintplan_home", {DataU:userData, Dadospesquisa:controlador, dadostotalnr:totalcont, dadoscontroladordecr:0,dadoscontroladorincr:1, DadosProjects:JSON.stringify(dataProjects), DadosJobcards:JSON.stringify(dataJobcaaards), Jobcards:data, title: 'EAGLEI'});
									}
								}).exec();
								
								
							}

						}).lean();
						
					}

				}).lean();
			}
		}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
	}
	
 
});

router.get('/preventativemaint/new/previouspage/:contador/:totalnr',async function(req, res) {

	var userData=req.session.usuario;
	var nome = userData.nome;
	var incrementadr = parseInt(req.params.contador) - 1;
	var contador = incrementadr * 50;
	var userDept = userData.departamento;
	console.log(req.params);
	console.log(contador)
	console.log(incrementadr)
	
	
	var controladorfuncao = 0;

	if ((userData.funcao == "Tecnico") || (userData.funcao == "Assistant")) {
		controladorfuncao = 1;
	}else if(userData.funcao == "regional_manager"){
		controladorfuncao = 2;
	}else if (userData.verificador_funcao == "Regional Manager") {
		controladorfuncao = 3;
	}else if((userData.funcao = "Call Center") || (userData.funcao = "Back Office") || (userData.nivel_acesso = "admin") (userData.funcao == "Manager")){
		controladorfuncao = 4;
	}else if(userData.nome == "Guest"){
		controladorfuncao = 5;
	}else if (userData.funcao == "Manager") {
		controladorfuncao = 6;
	};

	switch (controladorfuncao) {
		case 1:
			{var data= await jobcards.aggregate([{$addFields:{"mes":{$month:{$toDate:"$jobcard_planneddatems"}}, "dia":{$dayOfMonth:{$toDate:"$jobcard_planneddatems"}} }},{$match:{jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_tecniconome:nome}},{$group:{_id:"$mes", "documentos":{$push:"$$ROOT"}}}, {$sort:{mes:1}}, {$sort:{_id:-1}}]).limit(50);
				
				jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_tecniconome:nome},async  function(err, dataJobcard){
					if (err) {
						console.log("ocorreu um erro ao tentar aceder os dados");
					}
					else{
						var total = dataJobcard;
						var totalcont = Math.ceil(total/50);
						console.log("O total de jobcards é "+total);
						console.log("O número total de páginas será de " +totalcont);

						// console.log(data);

						data.map((hjds, ol)=>{  hjds.documentos.sort((a, b) => (a.dia >b.dia)? 1 : -1)})
						// console.log(data);

						var novodocumento=[];

							await data.map(async(hjds, ol)=>{hjds.documentos.map(async(onj, k)=>{await novodocumento.push(onj)})});

						// console.log(novodocumento);

						var parcela = await novodocumento.slice(contador,(incrementadr*50)+50);
						console.log(contador);
						console.log(incrementadr*50);
						
						jobcards.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1, ttnumber_status:1, jobcard_wait:1}, function(err, dataJobcaaards){
							if(err){
								console.log("ocorreu um erro ao tentar aceder os dados")
							}
							else{
								jobcardprojects.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1, ttnumber_status:1, jobcard_wait:1}, async function(err, dataProjects){
									if(err){
										console.log("ocorreu um erro ao tentar aceder os dados")
									}
									else{										
										console.log(`O totalcont é ${totalcont}`);
										res.render("maintplan_home", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:incrementadr,dadoscontroladorincr:parseInt(req.params.contador), DadosProjects:JSON.stringify(dataProjects), DadosJobcards:JSON.stringify(dataJobcaaards), Jobcards:parcela, title: 'EAGLEI'});
									}
								}).lean();
							}
						}).lean();
					}
				});
			}

		break;

		case 2:
			{var data= await jobcards.aggregate([{$addFields:{"mes":{$month:{$toDate:"$jobcard_planneddatems"}}, "dia":{$dayOfMonth:{$toDate:"$jobcard_planneddatems"}} }},{$match:{jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}},{$group:{_id:"$mes", "documentos":{$push:"$$ROOT"}}}, {$sort:{mes:1}}, {$sort:{_id:-1}}]).limit(50);
				
				jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]},async  function(err, dataJobcard){
					if (err) {
						console.log("ocorreu um erro ao tentar aceder os dados");
					}
					else{
						var total = dataJobcard;
						var totalcont = Math.ceil(total/50);
						console.log("O total de jobcards é "+total);
						console.log("O número total de páginas será de " +totalcont);

						// console.log(data);

						data.map((hjds, ol)=>{  hjds.documentos.sort((a, b) => (a.dia >b.dia)? 1 : -1)})
						// console.log(data);

						var novodocumento=[];

							await data.map(async(hjds, ol)=>{hjds.documentos.map(async(onj, k)=>{await novodocumento.push(onj)})});

						// console.log(novodocumento);

						var parcela = await novodocumento.slice(contador,(incrementadr*50)+50);
						console.log(contador);
						console.log(incrementadr*50);
						
						jobcards.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1, ttnumber_status:1, jobcard_wait:1}, function(err, dataJobcaaards){
							if(err){
								console.log("ocorreu um erro ao tentar aceder os dados")
							}
							else{
								jobcardprojects.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1, ttnumber_status:1, jobcard_wait:1}, async function(err, dataProjects){
									if(err){
										console.log("ocorreu um erro ao tentar aceder os dados")
									}
									else{										
										console.log(`O totalcont é ${totalcont}`);
										res.render("maintplan_home", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:incrementadr,dadoscontroladorincr:parseInt(req.params.contador), DadosProjects:JSON.stringify(dataProjects), DadosJobcards:JSON.stringify(dataJobcaaards), Jobcards:parcela, title: 'EAGLEI'});
									}
								}).lean();
							}
						}).lean();
					}
				});
			}
		break;
	
		case 3:
			{var data= await jobcards.aggregate([{$addFields:{"mes":{$month:{$toDate:"$jobcard_planneddatems"}}, "dia":{$dayOfMonth:{$toDate:"$jobcard_planneddatems"}} }},{$match:{jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_regiao:userData.regiao}},{$group:{_id:"$mes", "documentos":{$push:"$$ROOT"}}}, {$sort:{mes:1}}, {$sort:{_id:-1}}]).limit(50);
				
				jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_regiao:userData.regiao},async  function(err, dataJobcard){
					if (err) {
						console.log("ocorreu um erro ao tentar aceder os dados");
					}
					else{
						var total = dataJobcard;
						var totalcont = Math.ceil(total/50);

						// console.log(data);

						data.map((hjds, ol)=>{  hjds.documentos.sort((a, b) => (a.dia >b.dia)? 1 : -1)})
						// console.log(data);

						var novodocumento=[];

							await data.map(async(hjds, ol)=>{hjds.documentos.map(async(onj, k)=>{await novodocumento.push(onj)})});

						// console.log(novodocumento);

						var parcela = await novodocumento.slice(contador,(incrementadr*50)+50);
						console.log(contador);
						console.log(incrementadr*50);

						res.render("maintplan_home", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr),dadoscontroladordecr:incrementadr, dadoscontroladorincr:parseInt(req.params.contador), Jobcards:parcela, title: 'EAGLEI'});
					}
				});
			}
		break;
		
		case 4: 
			{var data= await jobcards.aggregate([{$addFields:{"mes":{$month:{$toDate:"$jobcard_planneddatems"}}, "dia":{$dayOfMonth:{$toDate:"$jobcard_planneddatems"}} }},{$match:{jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New"}},{$group:{_id:"$mes", "documentos":{$push:"$$ROOT"}}}, {$sort:{mes:1}}, {$sort:{_id:-1}}]).limit(50);
				
				jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New"},async  function(err, dataJobcard){
					if (err) {
						console.log("ocorreu um erro ao tentar aceder os dados");
					}
					else{
						var total = dataJobcard;
						var totalcont = Math.ceil(total/50);

						// console.log(data);

						data.map((hjds, ol)=>{  hjds.documentos.sort((a, b) => (a.dia >b.dia)? 1 : -1)})
						// console.log(data);

						var novodocumento=[];

							await data.map(async(hjds, ol)=>{hjds.documentos.map(async(onj, k)=>{await novodocumento.push(onj)})});

						// console.log(novodocumento);

						var parcela = await novodocumento.slice(contador,(incrementadr*50)+50);
						console.log(contador);
						console.log(incrementadr*50);

						res.render("maintplan_home", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr),dadoscontroladordecr:incrementadr, dadoscontroladorincr:parseInt(req.params.contador), Jobcards:parcela, title: 'EAGLEI'});
					}
				});
			}
		break;

		case 5: 
			{var data= await jobcards.aggregate([{$addFields:{"mes":{$month:{$toDate:"$jobcard_planneddatems"}}, "dia":{$dayOfMonth:{$toDate:"$jobcard_planneddatems"}} }},{$match:{jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_clientenome: "Vm,Sa"}},{$group:{_id:"$mes", "documentos":{$push:"$$ROOT"}}}, {$sort:{mes:1}}, {$sort:{_id:-1}}]).limit(50);
				
				jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_clientenome: "Vm,Sa"},async  function(err, dataJobcard){
					if (err) {
						console.log("ocorreu um erro ao tentar aceder os dados");
					}
					else{
						var total = dataJobcard;
						var totalcont = Math.ceil(total/50);

						// console.log(data);

						data.map((hjds, ol)=>{  hjds.documentos.sort((a, b) => (a.dia >b.dia)? 1 : -1)})
						// console.log(data);

						var novodocumento=[];

							await data.map(async(hjds, ol)=>{hjds.documentos.map(async(onj, k)=>{await novodocumento.push(onj)})});

						// console.log(novodocumento);

						var parcela = await novodocumento.slice(contador,(incrementadr*50)+50);
						console.log(contador);
						console.log(incrementadr*50);

						res.render("maintplan_home", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr),dadoscontroladordecr:incrementadr, dadoscontroladorincr:parseInt(req.params.contador), Jobcards:parcela, title: 'EAGLEI'});
					}
				});
			}
		break;

		case 6: 
			{var data= await jobcards.aggregate([{$addFields:{"mes":{$month:{$toDate:"$jobcard_planneddatems"}}, "dia":{$dayOfMonth:{$toDate:"$jobcard_planneddatems"}} }},{$match:{jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_departamento:userDept}},{$group:{_id:"$mes", "documentos":{$push:"$$ROOT"}}}, {$sort:{mes:1}}, {$sort:{_id:-1}}]).limit(50);
				
				jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_departamento:userDept},async  function(err, dataJobcard){
					if (err) {
						console.log("ocorreu um erro ao tentar aceder os dados");
					}
					else{
						var total = dataJobcard;
						var totalcont = Math.ceil(total/50);

						// console.log(data);

						data.map((hjds, ol)=>{  hjds.documentos.sort((a, b) => (a.dia >b.dia)? 1 : -1)})
						// console.log(data);

						var novodocumento=[];

							await data.map(async(hjds, ol)=>{hjds.documentos.map(async(onj, k)=>{await novodocumento.push(onj)})});

						// console.log(novodocumento);

						var parcela = await novodocumento.slice(contador,(incrementadr*50)+50);
						console.log(contador);
						console.log(incrementadr*50);

						res.render("maintplan_home", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr),dadoscontroladordecr:incrementadr, dadoscontroladorincr:parseInt(req.params.contador), Jobcards:parcela, title: 'EAGLEI'});
					}
				});
			}
		break;
	}
	
});


router.get('/preventativemaint/new/nextpage/:contador/:totalnr', async function(req, res) {

	var userData=req.session.usuario;
	var nome = userData.nome;
	var contador = parseInt(req.params.contador) * 50;
	var incrementadr = parseInt(req.params.contador) + 1;
	console.log(req.params);
	console.log(contador)
	console.log(incrementadr)
	var userDept = userData.departamento;
	
	var controladorfuncao = 0;

	if (userData.funcao == "Tecnico"  || (userData.funcao == "Assistant")) {
		controladorfuncao = 1;
	}else if(userData.funcao == "regional_manager"){
		controladorfuncao = 2;
	}else if (userData.verificador_funcao == "Regional Manager") {
		controladorfuncao = 3;
	}else if((userData.funcao = "Call Center") || (userData.funcao = "Back Office") || (userData.nivel_acesso = "admin") (userData.funcao == "Manager")){
		controladorfuncao = 4;
	}else if(userData.nome == "Guest"){
		controladorfuncao = 5;
	}else if (userData.funcao == "Manager") {
		controladorfuncao = 6;
	};

	switch (controladorfuncao) {
		case 1:
			{var data= await jobcards.aggregate([{$addFields:{"mes":{$month:{$toDate:"$jobcard_planneddatems"}}, "dia":{$dayOfMonth:{$toDate:"$jobcard_planneddatems"}} }},{$match:{jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_tecniconome:nome}},{$group:{_id:"$mes", "documentos":{$push:"$$ROOT"}}}, {$sort:{mes:1}}, {$sort:{_id:-1}}]).limit(50);
				
				jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_tecniconome:nome},async  function(err, dataJobcard){
					if (err) {
						console.log("ocorreu um erro ao tentar aceder os dados");
					}
					else{
						var total = dataJobcard;
						var totalcont = Math.ceil(total/50);
						console.log("O total de jobcards é "+total);
						console.log("O número total de páginas será de " +totalcont);

						// console.log(data);

						data.map((hjds, ol)=>{  hjds.documentos.sort((a, b) => (a.dia >b.dia)? 1 : -1)})
						// console.log(data);

						var novodocumento=[];

							await data.map(async(hjds, ol)=>{hjds.documentos.map(async(onj, k)=>{await novodocumento.push(onj)})});

						// console.log(novodocumento);

						var parcela = await novodocumento.slice(contador,incrementadr*50);
						console.log(contador);
						console.log(incrementadr*50);
						
						jobcards.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1, ttnumber_status:1, jobcard_wait:1}, function(err, dataJobcaaards){
							if(err){
								console.log("ocorreu um erro ao tentar aceder os dados")
							}
							else{
								jobcardprojects.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1, ttnumber_status:1, jobcard_wait:1}, async function(err, dataProjects){
									if(err){
										console.log("ocorreu um erro ao tentar aceder os dados")
									}
									else{										
										console.log(`O totalcont é ${totalcont}`);
										res.render("maintplan_home", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:parseInt(req.params.contador),dadoscontroladorincr:incrementadr, DadosProjects:JSON.stringify(dataProjects), DadosJobcards:JSON.stringify(dataJobcaaards), Jobcards:parcela, title: 'EAGLEI'});
									}
								}).lean();
							}
						}).lean();
					}
				});
			}
		break;

		case 2:
			{var data= await jobcards.aggregate([{$addFields:{"mes":{$month:{$toDate:"$jobcard_planneddatems"}}, "dia":{$dayOfMonth:{$toDate:"$jobcard_planneddatems"}} }},{$match:{jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}},{$group:{_id:"$mes", "documentos":{$push:"$$ROOT"}}}, {$sort:{mes:1}}, {$sort:{_id:-1}}]).limit(50);
				
				jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]},async  function(err, dataJobcard){
					if (err) {
						console.log("ocorreu um erro ao tentar aceder os dados");
					}
					else{
						var total = dataJobcard;
						var totalcont = Math.ceil(total/50);
						console.log("O total de jobcards é "+total);
						console.log("O número total de páginas será de " +totalcont);

						// console.log(data);

						data.map((hjds, ol)=>{  hjds.documentos.sort((a, b) => (a.dia >b.dia)? 1 : -1)})
						// console.log(data);

						var novodocumento=[];

							await data.map(async(hjds, ol)=>{hjds.documentos.map(async(onj, k)=>{await novodocumento.push(onj)})});

						// console.log(novodocumento);

						var parcela = await novodocumento.slice(contador,incrementadr*50);
						console.log(contador);
						console.log(incrementadr*50);
						
						jobcards.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1, ttnumber_status:1, jobcard_wait:1}, function(err, dataJobcaaards){
							if(err){
								console.log("ocorreu um erro ao tentar aceder os dados")
							}
							else{
								jobcardprojects.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1, ttnumber_status:1, jobcard_wait:1}, async function(err, dataProjects){
									if(err){
										console.log("ocorreu um erro ao tentar aceder os dados")
									}
									else{										
										console.log(`O totalcont é ${totalcont}`);
										res.render("maintplan_home", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:parseInt(req.params.contador),dadoscontroladorincr:incrementadr, DadosProjects:JSON.stringify(dataProjects), DadosJobcards:JSON.stringify(dataJobcaaards), Jobcards:parcela, title: 'EAGLEI'});
									}
								}).lean();
							}
						}).lean();
					}
				});
			}


		break;
	
		case 3:
			{var data= await jobcards.aggregate([{$addFields:{"mes":{$month:{$toDate:"$jobcard_planneddatems"}}, "dia":{$dayOfMonth:{$toDate:"$jobcard_planneddatems"}} }},{$match:{jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_regiao:userData.regiao}},{$group:{_id:"$mes", "documentos":{$push:"$$ROOT"}}}, {$sort:{mes:1}}, {$sort:{_id:-1}}]).limit(50);
				
				jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_regiao:userData.regiao},async  function(err, dataJobcard){
					if (err) {
						console.log("ocorreu um erro ao tentar aceder os dados");
					}
					else{
						var total = dataJobcard;
						var totalcont = Math.ceil(total/50);

						// console.log(data);

						data.map((hjds, ol)=>{  hjds.documentos.sort((a, b) => (a.dia >b.dia)? 1 : -1)})
						// console.log(data);


						var novodocumento=[];

							await data.map(async(hjds, ol)=>{hjds.documentos.map(async(onj, k)=>{await novodocumento.push(onj)})});

						// console.log(novodocumento);

						var parcela = await novodocumento.slice(contador,incrementadr*50);
						console.log(contador);
						console.log(incrementadr*50);

						res.render("maintplan_home", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr),dadoscontroladordecr:parseInt(req.params.contador),dadoscontroladorincr:incrementadr, Jobcards:parcela, title: 'EAGLEI'});
					}
				});
			}
		break;
		
		case 4: 
			{var data= await jobcards.aggregate([{$addFields:{"mes":{$month:{$toDate:"$jobcard_planneddatems"}}, "dia":{$dayOfMonth:{$toDate:"$jobcard_planneddatems"}} }},{$match:{jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New"}},{$group:{_id:"$mes", "documentos":{$push:"$$ROOT"}}}, {$sort:{mes:1}}, {$sort:{_id:-1}}]).limit(50);
				
				jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New"},async  function(err, dataJobcard){
					if (err) {
						console.log("ocorreu um erro ao tentar aceder os dados");
					}
					else{
						var total = dataJobcard;
						var totalcont = Math.ceil(total/50);

						// console.log(data);

						data.map((hjds, ol)=>{  hjds.documentos.sort((a, b) => (a.dia >b.dia)? 1 : -1)})
						// console.log(data);


						var novodocumento=[];

							await data.map(async(hjds, ol)=>{hjds.documentos.map(async(onj, k)=>{await novodocumento.push(onj)})});

						// console.log(novodocumento);

						var parcela = await novodocumento.slice(contador,incrementadr*50);
						console.log(contador);
						console.log(incrementadr*50);

						res.render("maintplan_home", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr),dadoscontroladordecr:parseInt(req.params.contador),dadoscontroladorincr:incrementadr, Jobcards:parcela, title: 'EAGLEI'});
					}
				});
			}
		break;

		case 5: 
			{var data= await jobcards.aggregate([{$addFields:{"mes":{$month:{$toDate:"$jobcard_planneddatems"}}, "dia":{$dayOfMonth:{$toDate:"$jobcard_planneddatems"}} }},{$match:{jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_clientenome: "Vm,Sa"}},{$group:{_id:"$mes", "documentos":{$push:"$$ROOT"}}}, {$sort:{mes:1}}, {$sort:{_id:-1}}]).limit(50);
				
				jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_clientenome: "Vm,Sa"},async  function(err, dataJobcard){
					if (err) {
						console.log("ocorreu um erro ao tentar aceder os dados");
					}
					else{
						var total = dataJobcard;
						var totalcont = Math.ceil(total/50);

						// console.log(data);

						data.map((hjds, ol)=>{  hjds.documentos.sort((a, b) => (a.dia >b.dia)? 1 : -1)})
						// console.log(data);


						var novodocumento=[];

							await data.map(async(hjds, ol)=>{hjds.documentos.map(async(onj, k)=>{await novodocumento.push(onj)})});

						// console.log(novodocumento);

						var parcela = await novodocumento.slice(contador,incrementadr*50);
						console.log(contador);
						console.log(incrementadr*50);

						res.render("maintplan_home", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr),dadoscontroladordecr:parseInt(req.params.contador),dadoscontroladorincr:incrementadr, Jobcards:parcela, title: 'EAGLEI'});
					}
				});
			}
		break;

		case 6: 
			{var data= await jobcards.aggregate([{$addFields:{"mes":{$month:{$toDate:"$jobcard_planneddatems"}}, "dia":{$dayOfMonth:{$toDate:"$jobcard_planneddatems"}} }},{$match:{jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_departamento:userDept}},{$group:{_id:"$mes", "documentos":{$push:"$$ROOT"}}}, {$sort:{mes:1}}, {$sort:{_id:-1}}]).limit(50);
				
				jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_departamento:userDept},async  function(err, dataJobcard){
					if (err) {
						console.log("ocorreu um erro ao tentar aceder os dados");
					}
					else{
						var total = dataJobcard;
						var totalcont = Math.ceil(total/50);

						// console.log(data);

						data.map((hjds, ol)=>{  hjds.documentos.sort((a, b) => (a.dia >b.dia)? 1 : -1)})
						// console.log(data);


						var novodocumento=[];

							await data.map(async(hjds, ol)=>{hjds.documentos.map(async(onj, k)=>{await novodocumento.push(onj)})});

						// console.log(novodocumento);

						var parcela = await novodocumento.slice(contador,incrementadr*50);
						console.log(contador);
						console.log(incrementadr*50);

						res.render("maintplan_home", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr),dadoscontroladordecr:parseInt(req.params.contador),dadoscontroladorincr:incrementadr, Jobcards:parcela, title: 'EAGLEI'});
					}
				});
			}
		break;

	}
	
});


router.get('/preventativemaint/newhoje/previouspage/:contador/:totalnr',async function(req, res) {

	var userData=req.session.usuario;
	var nome = userData.nome;
	var incrementadr = parseInt(req.params.contador) - 1;
	var contador = incrementadr * 50;
	console.log(req.params);
	console.log("contador "+contador)
	console.log("incrementador "+incrementadr)
	var userDept = userData.departamento;
	var presentDate = new Date().getTime();
	
	var controladorfuncao = 0;

	if (userData.funcao == "Tecnico"  || (userData.funcao == "Assistant")) {
		controladorfuncao = 1;
	}else if(userData.funcao == "regional_manager"){
		controladorfuncao = 2;
	}else if (userData.verificador_funcao == "Regional Manager") {
		controladorfuncao = 3;
	}else if((userData.funcao == "Call Center") || (userData.funcao == "Back Office") || (userData.nivel_acesso == "admin")){
		controladorfuncao = 4;
	}else if(userData.nome == "Guest"){
		controladorfuncao = 5;
	}else if (userData.funcao == "Manager") {
		controladorfuncao = 6;
	};

	switch (controladorfuncao) {
		case 1:
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}], jobcard_planneddatems: {$lte:presentDate}}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
					
					jobcards.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1, ttnumber_status:1, jobcard_wait:1}, function(err, dataJobcaaards){
	
						if(err){
							console.log("ocorreu um erro ao tentar aceder os dados")
						}
						else{
	
							jobcardprojects.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1, ttnumber_status:1, jobcard_wait:1}, function(err, dataProjects){
	
								if(err){
									console.log("ocorreu um erro ao tentar aceder os dados")
								}
								else{	
									console.log("previous")
									res.render("maintplan_homenewhoje", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:incrementadr, dadoscontroladorincr:parseInt(req.params.contador), DadosProjects:JSON.stringify(dataProjects), DadosJobcards:JSON.stringify(dataJobcaaards), Jobcards:data, title: 'EAGLEI'});
								}
	
							}).lean();
							
						}
	
					}).lean();
				}
			}).sort({jobcard_planneddatems:-1}).skip(contador).limit(50).lean();
			
		break;

		case 2:
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}], jobcard_planneddatems: {$lte:presentDate}}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
					
					jobcards.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1, ttnumber_status:1, jobcard_wait:1}, function(err, dataJobcaaards){
	
						if(err){
							console.log("ocorreu um erro ao tentar aceder os dados")
						}
						else{
	
							jobcardprojects.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1, ttnumber_status:1, jobcard_wait:1}, function(err, dataProjects){
	
								if(err){
									console.log("ocorreu um erro ao tentar aceder os dados")
								}
								else{
									jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}], jobcard_planneddatems: {$lte:presentDate}}, function(err, dataJobcard){
										if(err){
											console.log("ocorreu um erro ao tentar aceder os dados")
										}else{
	
											// console.log(dataJobcard)
											var total = dataJobcard.length;
											var totalcont = Math.ceil(total/50);
	
											res.render("maintplan_homenewhoje", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:incrementadr, dadoscontroladorincr:parseInt(req.params.contador), DadosProjects:JSON.stringify(dataProjects), DadosJobcards:JSON.stringify(dataJobcaaards), Jobcards:data, title: 'EAGLEI'});
										}
									}).exec();
									
									
								}
	
							}).lean();
							
						}
	
					}).lean();
				}
			}).sort({jobcard_planneddatems:-1}).skip(contador).limit(50).lean();
		break;
	
		case 3:
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_regiao:userData.regiao, jobcard_departamento:userDept, jobcard_planneddatems: {$lte:presentDate}}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_regiao:userData.regiao, jobcard_departamento:userDept, jobcard_planneddatems: {$lte:presentDate}}, function(err, dataJobcard){
						if (err) {
							console.log("ocorreu um erro ao tentar aceder os dados");
						}
						else{
							var total = dataJobcard;
							var totalcont = Math.ceil(total/50);
							res.render("maintplan_homenewhoje", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:incrementadr, dadoscontroladorincr:parseInt(req.params.contador), Jobcards:data, title: 'EAGLEI'});
						}
					}).exec();
				}
			}).sort({jobcard_planneddatems:-1}).skip(contador).limit(50).lean();
		break;
		
		case 4: 
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_planneddatems: {$lte:presentDate}}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_planneddatems: {$lte:presentDate}}, function(err, dataJobcard){
						if (err) {
							console.log("ocorreu um erro ao tentar aceder os dados");
						}
						else{
							var total = dataJobcard;
							var totalcont = Math.ceil(total/50);
							res.render("maintplan_homenewhoje", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:incrementadr, dadoscontroladorincr:parseInt(req.params.contador), Jobcards:data, title: 'EAGLEI'});
						}
					}).exec();
				}
			}).sort({jobcard_planneddatems:-1}).skip(contador).limit(50).lean();
		break;

		case 5: 
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_clientenome: "Vm,Sa", jobcard_planneddatems: {$lte:presentDate}}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_clientenome: "Vm,Sa", jobcard_planneddatems: {$lte:presentDate}}, function(err, dataJobcard){
						if (err) {
							console.log("ocorreu um erro ao tentar aceder os dados");
						}
						else{
							var total = dataJobcard;
							var totalcont = Math.ceil(total/50);
							res.render("maintplan_homenewhoje", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:incrementadr, dadoscontroladorincr:parseInt(req.params.contador), Jobcards:data, title: 'EAGLEI'});
						}
					}).exec();
				}
			}).sort({jobcard_planneddatems:-1}).skip(contador).limit(50).lean();
		break;

		case 6: 
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_departamento:userDept, jobcard_planneddatems: {$lte:presentDate}}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_departamento:userDept, jobcard_planneddatems: {$lte:presentDate}}, function(err, dataJobcard){
						if (err) {
							console.log("ocorreu um erro ao tentar aceder os dados");
						}
						else{
							var total = dataJobcard;
							var totalcont = Math.ceil(total/50);
							res.render("maintplan_homenewhoje", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:incrementadr, dadoscontroladorincr:parseInt(req.params.contador), Jobcards:data, title: 'EAGLEI'});
						}
					}).exec();
				}
			}).sort({jobcard_planneddatems:-1}).skip(contador).limit(50).lean();
		break;

	}
	

});

router.get('/preventativemaint/newhoje', function(req, res) {

    var userData=req.session.usuario;
    var nome = userData.nome;
	var userDept = userData.departamento;

	var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
    var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
    var ano = (new Date()).getFullYear();
    var datactual = dia + "/" + mes + "/" + ano;
	var presentDate = new Date().getTime();
	console.log(presentDate);

	var controladorfuncao = 0;

	if (userData.funcao == "Tecnico" || (userData.funcao == "Assistant")) {
		controladorfuncao = 1;
	}else if(userData.funcao == "regional_manager"){
		controladorfuncao = 2;
	}else if (userData.verificador_funcao == "Regional Manager") {
		controladorfuncao = 3;
	}else if((userData.funcao == "Call Center") || (userData.funcao == "Back Office") || (userData.nivel_acesso == "admin")){
		controladorfuncao = 4;
	}else if(userData.nome == "Guest"){
		controladorfuncao = 5;
	}else if (userData.funcao == "Manager") {
		controladorfuncao = 6;
	};

	switch (controladorfuncao) {
		case 1:
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}], jobcard_planneddatems: {$lte:presentDate}}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
					
					jobcards.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1, ttnumber_status:1, jobcard_wait:1}, function(err, dataJobcaaards){
	
						if(err){
							console.log("ocorreu um erro ao tentar aceder os dados")
						}
						else{
	
							jobcardprojects.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1, ttnumber_status:1, jobcard_wait:1}, function(err, dataProjects){
	
								if(err){
									console.log("ocorreu um erro ao tentar aceder os dados")
								}
								else{
									jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}], jobcard_planneddatems: {$lte:presentDate}}, function(err, dataJobcard){
										if(err){
											console.log("ocorreu um erro ao tentar aceder os dados")
										}else{
	
											// console.log(dataJobcard)
											var total = dataJobcard;
											var totalcont = Math.ceil(total/50);
											console.log("datajobcard "+ dataJobcard);
											console.log("datajobcard.length "+ dataJobcard.length);
											console.log("Total " +total);
											console.log("O total cont eh "+totalcont);
											res.render("maintplan_homenewhoje", {DataU:userData, dadostotalnr:totalcont, dadoscontroladordecr:0,dadoscontroladorincr:1, DadosProjects:JSON.stringify(dataProjects), DadosJobcards:JSON.stringify(dataJobcaaards), Jobcards:data, title: 'EAGLEI'});
										}
									}).exec();
									
									
								}
	
							}).lean();
							
						}
	
					}).lean();
				}
			}).sort({jobcard_planneddatems:-1}).limit(50).lean();
		break;

		case 2:
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}], jobcard_planneddatems: {$lte:presentDate}}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
					
					jobcards.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1}, function(err, dataJobcaaards){
	
						if(err){
							console.log("ocorreu um erro ao tentar aceder os dados")
						}
						else{
	
							jobcardprojects.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1}, function(err, dataProjects){
	
								if(err){
									console.log("ocorreu um erro ao tentar aceder os dados")
								}
								else{
									jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}], jobcard_planneddatems: {$lte:presentDate}}, function(err, dataJobcard){
										if(err){
											console.log("ocorreu um erro ao tentar aceder os dados")
										}else{
	
											// console.log(dataJobcard)
											var total = dataJobcard.length;
											var totalcont = Math.ceil(total/50);
	
											res.render("maintplan_homenewhoje", {DataU:userData, dadostotalnr:totalcont, dadoscontroladordecr:0,dadoscontroladorincr:1, DadosProjects:JSON.stringify(dataProjects), DadosJobcards:JSON.stringify(dataJobcaaards), Jobcards:data, title: 'EAGLEI'});
										}
									}).exec();
									
									
								}
	
							}).lean();
							
						}
	
					}).lean();
				}
			}).sort({jobcard_planneddatems:-1}).limit(50).lean();
		break;
	
		case 3:
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_regiao:userData.regiao, jobcard_departamento:userDept, jobcard_planneddatems: {$lte:presentDate}}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_regiao:userData.regiao, jobcard_departamento:userDept, jobcard_planneddatems: {$lte:presentDate}}, function(err, dataJobcard){
						if (err) {
							console.log("ocorreu um erro ao tentar aceder os dados");
						}
						else{
							var total = dataJobcard;
							var totalcont = Math.ceil(total/50);
							res.render("maintplan_homenewhoje", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
						}
					}).exec();
				}
			}).sort({jobcard_planneddatems:-1}).limit(50).lean();
		break;
		
		case 4: 
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_planneddatems: {$lte:presentDate}}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_planneddatems: {$lte:presentDate}}, function(err, dataJobcard){
						if (err) {
							console.log("ocorreu um erro ao tentar aceder os dados");
						}
						else{
							var total = dataJobcard;
							var totalcont = Math.ceil(total/50);
							res.render("maintplan_homenewhoje", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
						}
					}).exec();
				}
			}).sort({jobcard_planneddatems:-1}).limit(50).lean();
		break;

		case 5: 
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_clientenome: "Vm,Sa", jobcard_planneddatems: {$lte:presentDate}}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_clientenome: "Vm,Sa", jobcard_planneddatems: {$lte:presentDate}}, function(err, dataJobcard){
						if (err) {
							console.log("ocorreu um erro ao tentar aceder os dados");
						}
						else{
							var total = dataJobcard;
							var totalcont = Math.ceil(total/50);
							res.render("maintplan_homenewhoje", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
						}
					}).exec();
				}
			}).sort({jobcard_planneddatems:-1}).limit(50).lean();
		break;

		case 6: 
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_departamento:userDept, jobcard_planneddatems: {$lte:presentDate}}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_departamento:userDept, jobcard_planneddatems: {$lte:presentDate}}, function(err, dataJobcard){
						if (err) {
							console.log("ocorreu um erro ao tentar aceder os dados");
						}
						else{
							var total = dataJobcard;
							var totalcont = Math.ceil(total/50);
							res.render("maintplan_homenewhoje", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
						}
					}).exec();
				}
			}).sort({jobcard_planneddatems:-1}).limit(50).lean();
		break;

	}

});

router.get('/preventativemaint/newhoje/nextpage/:contador/:totalnr', async function(req, res) {

	var userData=req.session.usuario;
	var nome = userData.nome;
	var contador = parseInt(req.params.contador) * 50;
	var incrementadr = parseInt(req.params.contador) + 1;
	console.log(req.params);
	console.log(contador)
	console.log(incrementadr)
	var userDept = userData.departamento;
	var presentDate = new Date().getTime();
	
	var controladorfuncao = 0;

	if (userData.funcao == "Tecnico"  || (userData.funcao == "Assistant")) {
		controladorfuncao = 1;
	}else if(userData.funcao == "regional_manager"){
		controladorfuncao = 2;
	}else if (userData.verificador_funcao == "Regional Manager") {
		controladorfuncao = 3;
	}else if((userData.funcao == "Call Center") || (userData.funcao == "Back Office") || (userData.nivel_acesso == "admin")){
		controladorfuncao = 4;
	}else if(userData.nome == "Guest"){
		controladorfuncao = 5;
	}else if (userData.funcao == "Manager") {
		controladorfuncao = 6;
	};

	switch (controladorfuncao) {
		case 1:
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}], jobcard_planneddatems: {$lte:presentDate}}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
					
					jobcards.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1, ttnumber_status:1, jobcard_wait:1}, function(err, dataJobcaaards){
	
						if(err){
							console.log("ocorreu um erro ao tentar aceder os dados")
						}
						else{
	
							jobcardprojects.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1, ttnumber_status:1, jobcard_wait:1}, function(err, dataProjects){
	
								if(err){
									console.log("ocorreu um erro ao tentar aceder os dados")
								}
								else{
									jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}], jobcard_planneddatems: {$lte:presentDate}}, function(err, dataJobcard){
										if(err){
											console.log("ocorreu um erro ao tentar aceder os dados")
										}else{
	
											// console.log(dataJobcard)
											var total = dataJobcard.length;
											var totalcont = Math.ceil(total/50);
	
											res.render("maintplan_homenewhoje", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:parseInt(req.params.contador), dadoscontroladorincr:incrementadr, DadosProjects:JSON.stringify(dataProjects), DadosJobcards:JSON.stringify(dataJobcaaards), Jobcards:data, title: 'EAGLEI'});
										}
									}).exec();
									
									
								}
	
							}).lean();
							
						}
	
					}).lean();
				}
			}).sort({jobcard_planneddatems:-1}).skip(contador).limit(50).lean();
			
		break;

		case 2:
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}], jobcard_planneddatems: {$lte:presentDate}}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
					
					jobcards.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1, ttnumber_status:1, jobcard_wait:1}, function(err, dataJobcaaards){
	
						if(err){
							console.log("ocorreu um erro ao tentar aceder os dados")
						}
						else{
	
							jobcardprojects.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1, ttnumber_status:1, jobcard_wait:1}, function(err, dataProjects){
	
								if(err){
									console.log("ocorreu um erro ao tentar aceder os dados")
								}
								else{
									jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}], jobcard_planneddatems: {$lte:presentDate}}, function(err, dataJobcard){
										if(err){
											console.log("ocorreu um erro ao tentar aceder os dados")
										}else{
	
											// console.log(dataJobcard)
											var total = dataJobcard.length;
											var totalcont = Math.ceil(total/50);
	
											res.render("maintplan_homenewhoje", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:parseInt(req.params.contador), dadoscontroladorincr:incrementadr, DadosProjects:JSON.stringify(dataProjects), DadosJobcards:JSON.stringify(dataJobcaaards), Jobcards:data, title: 'EAGLEI'});
										}
									}).exec();
									
									
								}
	
							}).lean();
							
						}
	
					}).lean();
				}
			}).sort({jobcard_planneddatems:-1}).skip(contador).limit(50).lean();
		break;
	
		case 3:
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_regiao:userData.regiao, jobcard_departamento:userDept, jobcard_planneddatems: {$lte:presentDate}}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_regiao:userData.regiao, jobcard_departamento:userDept, jobcard_planneddatems: {$lte:presentDate}}, function(err, dataJobcard){
						if (err) {
							console.log("ocorreu um erro ao tentar aceder os dados");
						}
						else{
							var total = dataJobcard;
							var totalcont = Math.ceil(total/50);
							res.render("maintplan_homenewhoje", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:parseInt(req.params.contador), dadoscontroladorincr:incrementadr, Jobcards:data, title: 'EAGLEI'});
						}
					}).exec();
				}
			}).sort({jobcard_planneddatems:-1}).skip(contador).limit(50).lean();
		break;
		
		case 4: 
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_planneddatems: {$lte:presentDate}}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_planneddatems: {$lte:presentDate}}, function(err, dataJobcard){
						if (err) {
							console.log("ocorreu um erro ao tentar aceder os dados");
						}
						else{
							var total = dataJobcard;
							var totalcont = Math.ceil(total/50);
							res.render("maintplan_homenewhoje", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:parseInt(req.params.contador), dadoscontroladorincr:incrementadr, Jobcards:data, title: 'EAGLEI'});
						}
					}).exec();
				}
			}).sort({jobcard_planneddatems:-1}).skip(contador).limit(50).lean();
		break;

		case 5: 
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_clientenome: "Vm,Sa", jobcard_planneddatems: {$lte:presentDate}}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_clientenome: "Vm,Sa", jobcard_planneddatems: {$lte:presentDate}}, function(err, dataJobcard){
						if (err) {
							console.log("ocorreu um erro ao tentar aceder os dados");
						}
						else{
							var total = dataJobcard;
							var totalcont = Math.ceil(total/50);
							res.render("maintplan_homenewhoje", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:parseInt(req.params.contador), dadoscontroladorincr:incrementadr, Jobcards:data, title: 'EAGLEI'});
						}
					}).exec();
				}
			}).sort({jobcard_planneddatems:-1}).skip(contador).limit(50).lean();
		break;

		case 6: 
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_departamento:userDept, jobcard_planneddatems: {$lte:presentDate}}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_departamento:userDept, jobcard_planneddatems: {$lte:presentDate}}, function(err, dataJobcard){
						if (err) {
							console.log("ocorreu um erro ao tentar aceder os dados");
						}
						else{
							var total = dataJobcard;
							var totalcont = Math.ceil(total/50);
							res.render("maintplan_homenewhoje", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:parseInt(req.params.contador), dadoscontroladorincr:incrementadr, Jobcards:data, title: 'EAGLEI'});
						}
					}).exec();
				}
			}).sort({jobcard_planneddatems:-1}).skip(contador).limit(50).lean();
		break;

	}
	
});

router.get('/preventativemaint/new',async function(req, res) {

	var userData=req.session.usuario;
	var nome = userData.nome;
	var userDept = userData.departamento;

	var controladorfuncao = 0;

	if (userData.funcao == "Tecnico" || userData.funcao == "Assistant") {
		controladorfuncao = 1;
	}else if(userData.funcao == "regional_manager"){
		controladorfuncao = 2;
	}else if (userData.verificador_funcao == "Regional Manager") {
		controladorfuncao = 3;
	}else if((userData.funcao == "Call Center") || (userData.funcao == "Back Office") || (userData.nivel_acesso == "admin")){
		controladorfuncao = 4;
	}else if(userData.nome == "Guest"){
		controladorfuncao = 5;
	}else if (userData.funcao == "Manager") {
		controladorfuncao = 6;
	};

	switch (controladorfuncao) {
		case 1:
			{var data= await jobcards.aggregate([{$addFields:{"mes":{$month:{$toDate:"$jobcard_planneddatems"}}, "dia":{$dayOfMonth:{$toDate:"$jobcard_planneddatems"}} }},{$match:{jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_tecniconome:nome}},{$group:{_id:"$mes", "documentos":{$push:"$$ROOT"}}}, {$sort:{mes:1}}, {$sort:{_id:-1}}]).limit(50);
				
				jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_tecniconome:nome},async  function(err, dataJobcard){
					if (err) {
						console.log("ocorreu um erro ao tentar aceder os dados");
					}
					else{
						var total = dataJobcard;
						var totalcont = Math.ceil(total/50);
						console.log("O total de jobcards é "+total);
						console.log("O número total de páginas será de " +totalcont);

						// console.log(data);

						data.map((hjds, ol)=>{  hjds.documentos.sort((a, b) => (a.dia >b.dia)? 1 : -1)})
						// console.log(data);

						var novodocumento=[];

							await data.map(async(hjds, ol)=>{hjds.documentos.map(async(onj, k)=>{await novodocumento.push(onj)})});

						// console.log(novodocumento);

						var parcela = await novodocumento.slice(0,50);
						jobcards.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1, ttnumber_status:1, jobcard_wait:1}, function(err, dataJobcaaards){
							if(err){
								console.log("ocorreu um erro ao tentar aceder os dados")
							}
							else{
								jobcardprojects.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1, ttnumber_status:1, jobcard_wait:1}, async function(err, dataProjects){
									if(err){
										console.log("ocorreu um erro ao tentar aceder os dados")
									}
									else{										
										console.log(`O totalcont é ${totalcont}`);
										res.render("maintplan_home", {DataU:userData, dadostotalnr:totalcont, dadoscontroladordecr:0,dadoscontroladorincr:1, DadosProjects:JSON.stringify(dataProjects), DadosJobcards:JSON.stringify(dataJobcaaards), Jobcards:parcela, title: 'EAGLEI'});
									}
								}).lean();
							}
						}).lean();
					}
				});
			}


		break;

		case 2:
			{var data= await jobcards.aggregate([{$addFields:{"mes":{$month:{$toDate:"$jobcard_planneddatems"}}, "dia":{$dayOfMonth:{$toDate:"$jobcard_planneddatems"}} }},{$match:{jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}},{$group:{_id:"$mes", "documentos":{$push:"$$ROOT"}}}, {$sort:{mes:1}}, {$sort:{_id:-1}}]).limit(50);
				
				jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]},async  function(err, dataJobcard){
					if (err) {
						console.log("ocorreu um erro ao tentar aceder os dados");
					}
					else{
						var total = dataJobcard;
						var totalcont = Math.ceil(total/50);
						console.log("O total de jobcards é "+total);
						console.log("O número total de páginas será de " +totalcont);

						// console.log(data);

						data.map((hjds, ol)=>{  hjds.documentos.sort((a, b) => (a.dia >b.dia)? 1 : -1)})
						// console.log(data);

						var novodocumento=[];

							await data.map(async(hjds, ol)=>{hjds.documentos.map(async(onj, k)=>{await novodocumento.push(onj)})});

						// console.log(novodocumento);

						var parcela = await novodocumento.slice(0,50);
						jobcards.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1, ttnumber_status:1, jobcard_wait:1}, function(err, dataJobcaaards){
							if(err){
								console.log("ocorreu um erro ao tentar aceder os dados")
							}
							else{
								jobcardprojects.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1, ttnumber_status:1, jobcard_wait:1}, async function(err, dataProjects){
									if(err){
										console.log("ocorreu um erro ao tentar aceder os dados")
									}
									else{										
										console.log(`O totalcont é ${totalcont}`);
										res.render("maintplan_home", {DataU:userData, dadostotalnr:totalcont, dadoscontroladordecr:0,dadoscontroladorincr:1, DadosProjects:JSON.stringify(dataProjects), DadosJobcards:JSON.stringify(dataJobcaaards), Jobcards:parcela, title: 'EAGLEI'});
									}
								}).lean();
							}
						}).lean();
					}
				});
			}
		break;
	
		case 3:
			{var data= await jobcards.aggregate([{$addFields:{"mes":{$month:{$toDate:"$jobcard_planneddatems"}}, "dia":{$dayOfMonth:{$toDate:"$jobcard_planneddatems"}} }},{$match:{jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_regiao:userData.regiao}},{$group:{_id:"$mes", "documentos":{$push:"$$ROOT"}}}, {$sort:{mes:1}}, {$sort:{_id:-1}}]).limit(50);
				
				jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_regiao:userData.regiao},async  function(err, dataJobcard){
					if (err) {
						console.log("ocorreu um erro ao tentar aceder os dados");
					}
					else{
						var total = dataJobcard;
						var totalcont = Math.ceil(total/50);
						console.log("O total de jobcards é "+total);
						console.log("O número total de páginas será de " +totalcont);


						// console.log(data);

						data.map((hjds, ol)=>{  hjds.documentos.sort((a, b) => (a.dia >b.dia)? 1 : -1)})
						// console.log(data);


						var novodocumento=[];

							await data.map(async(hjds, ol)=>{hjds.documentos.map(async(onj, k)=>{await novodocumento.push(onj)})});

						// console.log(novodocumento);

						var parcela = await novodocumento.slice(0,50);

						res.render("maintplan_home", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:parcela, title: 'EAGLEI'});
					}
				});
			}
		break;
		
		case 4: 
			{var data= await jobcards.aggregate([{$addFields:{"mes":{$month:{$toDate:"$jobcard_planneddatems"}}, "dia":{$dayOfMonth:{$toDate:"$jobcard_planneddatems"}} }},{$match:{jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New"}},{$group:{_id:"$mes", "documentos":{$push:"$$ROOT"}}}, {$sort:{mes:1}}, {$sort:{_id:-1}}]).limit(50);
				
				jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New"},async  function(err, dataJobcard){
					if (err) {
						console.log("ocorreu um erro ao tentar aceder os dados");
					}
					else{
						var total = dataJobcard;
						var totalcont = Math.ceil(total/50);
						console.log("O total de jobcards é "+total);
						console.log("O número total de páginas será de " +totalcont);


						// console.log(data);

						data.map((hjds, ol)=>{  hjds.documentos.sort((a, b) => (a.dia >b.dia)? 1 : -1)})
						// console.log(data);


						var novodocumento=[];

							await data.map(async(hjds, ol)=>{hjds.documentos.map(async(onj, k)=>{await novodocumento.push(onj)})});

						// console.log(novodocumento);

						var parcela = await novodocumento.slice(0,50);

						res.render("maintplan_home", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:parcela, title: 'EAGLEI'});
					}
				});
			}
		break;

		case 5:
			{var data= await jobcards.aggregate([{$addFields:{"mes":{$month:{$toDate:"$jobcard_planneddatems"}}, "dia":{$dayOfMonth:{$toDate:"$jobcard_planneddatems"}} }},{$match:{jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_clientenome: "Vm,Sa"}},{$group:{_id:"$mes", "documentos":{$push:"$$ROOT"}}}, {$sort:{mes:1}}, {$sort:{_id:-1}}]).limit(50);
				
				jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_clientenome: "Vm,Sa"},async  function(err, dataJobcard){
					if (err) {
						console.log("ocorreu um erro ao tentar aceder os dados");
					}
					else{
						var total = dataJobcard;
						var totalcont = Math.ceil(total/50);
						console.log("O total de jobcards é "+total);
						console.log("O número total de páginas será de " +totalcont);


						// console.log(data);

						data.map((hjds, ol)=>{  hjds.documentos.sort((a, b) => (a.dia >b.dia)? 1 : -1)})
						// console.log(data);


						var novodocumento=[];

							await data.map(async(hjds, ol)=>{hjds.documentos.map(async(onj, k)=>{await novodocumento.push(onj)})});

						// console.log(novodocumento);

						var parcela = await novodocumento.slice(0,50);

						res.render("maintplan_home", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:parcela, title: 'EAGLEI'});
					}
				});
			} 
		break;

		case 6: 
			{var data= await jobcards.aggregate([{$addFields:{"mes":{$month:{$toDate:"$jobcard_planneddatems"}}, "dia":{$dayOfMonth:{$toDate:"$jobcard_planneddatems"}} }},{$match:{jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_departamento:userDept}},{$group:{_id:"$mes", "documentos":{$push:"$$ROOT"}}}, {$sort:{mes:1}}, {$sort:{_id:-1}}]).limit(50);
				
				jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"New", jobcard_departamento:userDept},async  function(err, dataJobcard){
					if (err) {
						console.log("ocorreu um erro ao tentar aceder os dados");
					}
					else{
						var total = dataJobcard;
						var totalcont = Math.ceil(total/50);
						console.log("O total de jobcards é "+total);
						console.log("O número total de páginas será de " +totalcont);


						// console.log(data);

						data.map((hjds, ol)=>{  hjds.documentos.sort((a, b) => (a.dia >b.dia)? 1 : -1)})
						// console.log(data);


						var novodocumento=[];

							await data.map(async(hjds, ol)=>{hjds.documentos.map(async(onj, k)=>{await novodocumento.push(onj)})});

						// console.log(novodocumento);

						var parcela = await novodocumento.slice(0,50);

						res.render("maintplan_home", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:parcela, title: 'EAGLEI'});
					}
				});
			}
		break;

	}

});


router.post('/preventativemaintinprogresspesquisa', async function(req, res) {
	var userData=req.session.usuario;
	var nome = userData.nome;
	var tthomecont = req.body;
	var controlador = tthomecont.pesquisador;
	var controladornr = 0;

	if(isNaN(controlador)){
		controladornr = 0;
		console.log(parseInt(controladornr))
	}else{
		controladornr = controlador;
	}

	if((userData.funcao == "Call Center") || (userData.funcao == "Back Office") || (userData.nivel_acesso == "admin") || (userData.funcao == "Call Center") || (userData.nome == "Hamilton Sitoe") || (userData.nome == "Luis Brazuna") || (userData.nome == "Antonio Biquiza")){

        jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"In Progress", $or:[{jobcard_ttnumber:parseInt(controladornr)}, {jobcard_site:controlador}]}, function(err, data){
            if(err){
                console.log("ocorreu um erro ao tentar aceder os dados")
            }
            else{

                jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"In Progress", $or:[{jobcard_ttnumber:parseInt(controladornr)}, {jobcard_site:controlador}]}, function(err, dataJobcard){
                    if(err){
                        console.log("ocorreu um erro ao tentar aceder os dados")
                    }else{

                        var total = dataJobcard;
                        var totalcont = Math.ceil(total/50);
                        // console.log(totalcont)

                        res.render("maintplan_home", {DataU:userData, Dadospesquisa:controlador, dadostotalnr:totalcont, dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});

                    }
                }).exec();
            }
        }).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();

    }else{

        jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"In Progress", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}, {jobcard_ttnumber:parseInt(controladornr)}, {jobcard_site:controlador}]}, function(err, data){
            if(err){
                console.log("ocorreu um erro ao tentar aceder os dados")
            }
            else{

                jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"In Progress", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}, {jobcard_ttnumber:parseInt(controladornr)}, {jobcard_site:controlador}]}, function(err, dataJobcard){
                    if(err){

                    }else{

                        var total = dataJobcard;
                        var totalcont = Math.ceil(total/50);
                        // console.log(data[1])
                        res.render("maintplan_home", {DataU:userData, Dadospesquisa:controlador, dadostotalnr:totalcont, dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
                    }
                }).exec();
            }

        }).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
    }
	
 
});


router.get('/preventativemaint/inprogress/previouspage/:contador/:totalnr', function(req, res) {

	var userData=req.session.usuario;
	var nome = userData.nome;
	var incrementadr = parseInt(req.params.contador) - 1;
	var contador = incrementadr * 50;
	var userDept = userData.departamento;
	
	console.log(contador)
	console.log(incrementadr)
	
	var controladorfuncao = 0;

	if (userData.funcao == "Tecnico" || (userData.funcao == "Assistant")) {
		controladorfuncao = 1;
	}else if(userData.funcao == "regional_manager"){
		controladorfuncao = 2;
	}else if (userData.verificador_funcao == "Regional Manager") {
		controladorfuncao = 3;
	}else if((userData.funcao == "Call Center") || (userData.funcao == "Back Office") || (userData.nivel_acesso == "admin")){
		controladorfuncao = 4;
	}else if(userData.nome == "Guest"){
		controladorfuncao = 5;
	}else if (userData.funcao == "Manager") {
		controladorfuncao = 6;
	}

	switch (controladorfuncao) {
		case 1:
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"In Progress", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
	
					res.render("maintplan_home", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:incrementadr, dadoscontroladorincr:parseInt(req.params.contador), Jobcards:data, title: 'EAGLEI'});
	
				}
	
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;

		case 2:
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"In Progress", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
	
					res.render("maintplan_home", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:incrementadr, dadoscontroladorincr:parseInt(req.params.contador), Jobcards:data, title: 'EAGLEI'});
	
				}
	
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;
	
		case 3:
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"In Progress", jobcard_regiao:userData.regiao, jobcard_departamento:userDept}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					
					res.render("maintplan_home", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:parseInt(req.params.contador), dadoscontroladorincr:incrementadr, Jobcards:data, title: 'EAGLEI'});
					
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;
		
		case 4: 
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"In Progress"}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					
					res.render("maintplan_home", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:parseInt(req.params.contador), dadoscontroladorincr:incrementadr, Jobcards:data, title: 'EAGLEI'});
						
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;

		case 5: 
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"In Progress", jobcard_clientenome: "Vm,Sa"}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					
					res.render("maintplan_home", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:parseInt(req.params.contador), dadoscontroladorincr:incrementadr, Jobcards:data, title: 'EAGLEI'});
						
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;

		case 6: 
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"In Progress", jobcard_departamento:userDept}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					
					res.render("maintplan_home", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:parseInt(req.params.contador), dadoscontroladorincr:incrementadr, Jobcards:data, title: 'EAGLEI'});
						
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;

	}

});


router.get('/preventativemaint/inprogress/nextpage/:contador/:totalnr', function(req, res) {

	var userData=req.session.usuario;
	var nome = userData.nome;
	var contador = parseInt(req.params.contador) * 50;
	var incrementadr = parseInt(req.params.contador) + 1;
	console.log(contador)
	console.log(incrementadr)
	
	var controladorfuncao = 0;

	if (userData.funcao == "Tecnico" || (userData.funcao == "Assistant")) {
		controladorfuncao = 1;
	}else if(userData.funcao == "regional_manager"){
		controladorfuncao = 2;
	}else if (userData.verificador_funcao == "Regional Manager") {
		controladorfuncao = 3;
	}else if((userData.funcao = "Call Center") || (userData.funcao = "Back Office") || (userData.nivel_acesso = "admin") (userData.funcao == "Manager")){
		controladorfuncao = 4;
	}else if(userData.nome == "Guest"){
		controladorfuncao = 5;
	};

	switch (controladorfuncao) {
		case 1:
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"In Progress", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
	
				
					res.render("maintplan_home", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:parseInt(req.params.contador),dadoscontroladorincr:incrementadr, Jobcards:data, title: 'EAGLEI'});
	
				}
	
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;

		case 2:
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"In Progress", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
	
				
					res.render("maintplan_home", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:parseInt(req.params.contador),dadoscontroladorincr:incrementadr, Jobcards:data, title: 'EAGLEI'});
	
				}
	
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;
	
		case 3:
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"In Progress", jobcard_regiao:userData.regiao}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					
					res.render("maintplan_home", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:parseInt(req.params.contador), dadoscontroladorincr:incrementadr, Jobcards:data, title: 'EAGLEI'});
					
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;
		
		case 4: 
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"In Progress"}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					
					res.render("maintplan_home", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:parseInt(req.params.contador), dadoscontroladorincr:incrementadr, Jobcards:data, title: 'EAGLEI'});
						
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;

		case 5: 
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"In Progress", jobcard_clientenome: "Vm,Sa"}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					
					res.render("maintplan_home", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:parseInt(req.params.contador), dadoscontroladorincr:incrementadr, Jobcards:data, title: 'EAGLEI'});
						
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;

	}

});

router.get('/preventativemaint/inprogress', function(req, res) {

	var userData=req.session.usuario;
	var nome = userData.nome;
	var permissao = 0;
	var userDept = userData.departamento;

	var controladorfuncao = 0;

	if (userData.funcao == "Tecnico" || (userData.funcao == "Assistant")) {
		controladorfuncao = 1;
	}else if(userData.funcao == "regional_manager"){
		controladorfuncao = 2;
	}else if (userData.verificador_funcao == "Regional Manager") {
		controladorfuncao = 3;
	}else if((userData.funcao == "Call Center") || (userData.funcao == "Back Office") || (userData.nivel_acesso == "admin")){
		controladorfuncao = 4;
	}else if(userData.nome == "Guest"){
		controladorfuncao = 5;
	}else if (userData.funcao == "Manager") {
		controladorfuncao = 6;
	}

	switch (controladorfuncao) {
		case 1:
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"In Progress", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
	
					jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"In Progress", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, dataJobcard){
						if(err){
	
						}else{
	
							var total = dataJobcard;
							var totalcont = Math.ceil(total/50);
							for (let j = 0; j < data.length; j++) {
								if( (data[j].ttnumber_status == "In Progress") && (data[j].jobcard_estadoactual != "On hold")){
									permissao = 1;
								}
							}
							// console.log(data[1])
							res.render("maintplan_home", {DataU:userData, permissao, dadostotalnr:totalcont, dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
						}
					}).exec();
				}
	
			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
		break;

		case 2:
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"In Progress", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"In Progress", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, dataJobcard){
						if (err) {
							console.log("ocorreu um erro ao tentar aceder os dados");
						}
						else{
							var total = dataJobcard;
							var totalcont = Math.ceil(total/50);
							for (let j = 0; j < data.length; j++) {
								// if ((data[j].jobcard_estadoactual == "On route") || (data[j].jobcard_estadoactual == "On site") || (data[j].jobcard_estadoactual == "Awaiting approval") || (data[j].jobcard_estadoactual == "Approved")) {
								if( (data[j].ttnumber_status == "In Progress") && (data[j].jobcard_estadoactual != "On hold")){
									permissao = 1;
								}
							}
							res.render("maintplan_home", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
						}
					}).exec();
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
		break;
	
		case 3:
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"In Progress", jobcard_regiao:userData.regiao, jobcard_departamento:userDept}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"In Progress", jobcard_regiao:userData.regiao, jobcard_departamento:userDept}, function(err, dataJobcard){
						if (err) {
							console.log("ocorreu um erro ao tentar aceder os dados");
						}
						else{
							var total = dataJobcard;
							var totalcont = Math.ceil(total/50);
							res.render("maintplan_home", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
						}
					}).exec();
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
		break;
		
		case 4: 
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"In Progress"}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"In Progress"}, function(err, dataJobcard){
						if (err) {
							console.log("ocorreu um erro ao tentar aceder os dados");
						}
						else{
							var total = dataJobcard;
							var totalcont = Math.ceil(total/50);
							res.render("maintplan_home", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
						}
					}).exec();
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
		break;

		case 5: 
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"In Progress", jobcard_clientenome: "Vm,Sa"}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"In Progress", jobcard_clientenome: "Vm,Sa"}, function(err, dataJobcard){
						if (err) {
							console.log("ocorreu um erro ao tentar aceder os dados");
						}
						else{
							var total = dataJobcard;
							var totalcont = Math.ceil(total/50);
							res.render("maintplan_home", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
						}
					}).exec();
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
		break;

		case 6: 
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"In Progress", jobcard_departamento:userDept}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"In Progress", jobcard_departamento:userDept}, function(err, dataJobcard){
						if (err) {
							console.log("ocorreu um erro ao tentar aceder os dados");
						}
						else{
							var total = dataJobcard;
							var totalcont = Math.ceil(total/50);
							res.render("maintplan_home", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
						}
					}).exec();
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
		break;

	}

});

router.post('/preventativemaintcompletepesquisa', async function(req, res) {
	var userData=req.session.usuario;
	var nome = userData.nome;
	var siteinfocont = req.body;
	var tthomecont = req.body;
	var pesquisador = siteinfocont.pesquisadorsite;
	var controlador = tthomecont.pesquisador.toLowerCase();
	var firstLetter = controlador.charAt(0).toUpperCase();
	var rest = controlador.slice(1);
	var controladorupper = firstLetter.concat(rest);

	console.log(controlador, controladorupper);
	var controladornr = 0;

	if(isNaN(controlador)){
		controladornr = 0;
		console.log(parseInt(controladornr))
	}else{
		controladornr = controlador;
		var ttnr = parseInt(controlador);
	}

	if (userData.funcao == "Tecnico" || (userData.funcao == "Assistant")) {
		controladorfuncao = 1;
	}else if(userData.funcao == "regional_manager"){
		controladorfuncao = 2;
	}else if (userData.verificador_funcao == "Regional Manager") {
		controladorfuncao = 3;
	}else if((userData.funcao == "Call Center") || (userData.funcao == "Back Office") || (userData.nivel_acesso == "admin") || (userData.funcao == "IT Officer")){
		controladorfuncao = 4;
	}else if(userData.nome == "Guest"){
		controladorfuncao = 5;
	}else if (userData.funcao == "Manager") {
		controladorfuncao = 6;
	};

	switch (controladorfuncao) {
		case 1:
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"Complete", jobcard_tecniconome: userData.nome, $or:[{jobcard_site:controlador}, {jobcard_ttnumber: ttnr} ]}, function(err, data){
				if(err){
					console.log(err);
				}
				else{
					var userData=req.session.usuario;
					res.render("alljobcards_pesquisa", {DataU:userData, AllJobcardsHistory:data, title: 'EAGLEI'});
				}
			});
		break;
		case 2: 
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"Complete", $or:[{jobcard_site:controlador}, {jobcard_ttnumber: ttnr}, {jobcard_tecniconome: {$regex: controladorupper}}, {jobcard_tecniconome: pesquisador} ]}, function(err, data){
			
				if(err){
					console.log(err);
				}
				else{
					var userData=req.session.usuario;
					res.render("alljobcards_pesquisa", {DataU:userData, AllJobcardsHistory:data, title: 'EAGLEI'});
				}
			});
		break;
		case 3:
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"Complete", jobcard_regiao:userData.regiao, $or:[{jobcard_site:controlador}, {jobcard_ttnumber: ttnr}, {jobcard_tecniconome: {$regex: controladorupper}}, {jobcard_tecniconome: pesquisador} ]}, function(err, data){
				if(err){
					console.log(err);
				}
				else{
					var userData=req.session.usuario;
					res.render("alljobcards_pesquisa", {DataU:userData, AllJobcardsHistory:data, title: 'EAGLEI'});
				}
			});
		break;
		case 4:
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"Complete", $or:[{jobcard_site:controlador}, {jobcard_ttnumber: ttnr}, {jobcard_tecniconome: {$regex: controladorupper}}, {jobcard_tecniconome: pesquisador} ]}, function(err, data){
				if(err){
					console.log(err);
				}
				else{
					var userData=req.session.usuario;
					res.render("alljobcards_pesquisa", {DataU:userData, AllJobcardsHistory:data, title: 'EAGLEI'});
				}
			});
		break;
		case 5:
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"Complete", jobcard_clientenome:"Vm,Sa",$or:[{jobcard_site:controlador}, {jobcard_ttnumber: ttnr}, {jobcard_tecniconome: {$regex: controladorupper}}, {jobcard_tecniconome: pesquisador} ]}, function(err, data){
				if(err){
					console.log(err);
				}
				else{
					var userData=req.session.usuario;
					res.render("alljobcards_pesquisa", {DataU:userData, AllJobcardsHistory:data, title: 'EAGLEI'});
				}
			});
		break;
		case 6:
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"Complete", jobcard_departamento:userData.departamento, $or:[{jobcard_site:controlador}, {jobcard_ttnumber: ttnr}, {jobcard_tecniconome: {$regex: controladorupper}}, {jobcard_tecniconome: pesquisador} ]}, function(err, data){
				if(err){
					console.log(err);
				}
				else{
					var userData=req.session.usuario;
					res.render("alljobcards_pesquisa", {DataU:userData, AllJobcardsHistory:data, title: 'EAGLEI'});
				}
			});
		break;
	};
	// var userData=req.session.usuario;
	// var nome = userData.nome;
	// var tthomecont = req.body;
	// var controlador = tthomecont.pesquisador;

	// var controladornr = 0;

	// if(isNaN(controlador)){
	// 	controladornr = 0;
	// 	console.log(parseInt(controladornr))
	// }else{
	// 	controladornr = controlador;
	// }

	
	// if((userData.funcao == "Call Center") || (userData.funcao == "Back Office") || (userData.nivel_acesso == "admin") || (userData.funcao == "Call Center") || (userData.nome == "Hamilton Sitoe") || (userData.nome == "Luis Brazuna") || (userData.nome == "Antonio Biquiza")){

    //     jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"Complete", $or:[{jobcard_ttnumber:parseInt(controladornr)}, {jobcard_site:controlador}]}, function(err, data){
    //         if(err){
    //             console.log("ocorreu um erro ao tentar aceder os dados")
    //         }
    //         else{

    //             jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"Complete", $or:[{jobcard_ttnumber:parseInt(controladornr)}, {jobcard_site:controlador}]}, function(err, dataJobcard){
    //                 if(err){
    //                     console.log("ocorreu um erro ao tentar aceder os dados")
    //                 }else{

    //                     var total = dataJobcard;
    //                     var totalcont = Math.ceil(total/50);
    //                     // console.log(totalcont)

    //                     res.render("maintplan_homecomplete", {DataU:userData, Dadospesquisa:controlador, dadostotalnr:totalcont, dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});

    //                 }
    //             }).exec();
    //         }
    //     }).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();

    // }else{

    //     jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"Complete", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}, {jobcard_ttnumber:parseInt(controladornr)}, {jobcard_site:controlador}]}, function(err, data){
    //         if(err){
    //             console.log("ocorreu um erro ao tentar aceder os dados")
    //         }
    //         else{

    //             jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"Complete", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}, {jobcard_ttnumber:parseInt(controladornr)}, {jobcard_site:controlador}]}, function(err, dataJobcard){
    //                 if(err){
    //                     console.log("ocorreu um erro ao tentar aceder os dados")
    //                 }else{

    //                     var total = dataJobcard;
    //                     var totalcont = Math.ceil(total/50);
    //                     console.log(totalcont)

    //                     res.render("maintplan_homecomplete", {DataU:userData, Dadospesquisa:controlador,dadostotalnr:totalcont, dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});

    //                 }
    //             }).exec();
    //         }
    //     }).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
    // }
 
});


router.get('/preventativemaint/complete/previouspage/:contador/:totalnr', function(req, res) {

	var userData=req.session.usuario;
	var nome = userData.nome;
	var incrementadr = parseInt(req.params.contador) - 1;
	var contador = incrementadr * 50;
	var userDept = userData.departamento;
	
	console.log(contador)
	console.log(incrementadr)

	var controladorfuncao = 0;

	if (userData.funcao == "Tecnico" || (userData.funcao == "Assistant")) {
		controladorfuncao = 1;
	}else if(userData.funcao == "regional_manager"){
		controladorfuncao = 2;
	}else if (userData.verificador_funcao == "Regional Manager") {
		controladorfuncao = 3;
	}else if((userData.funcao == "Call Center") || (userData.funcao == "Back Office") || (userData.nivel_acesso == "admin")){
		controladorfuncao = 4;
	}else if(userData.nome == "Guest"){
		controladorfuncao = 5;
	}else if (userData.funcao == "Manager") {
		controladorfuncao = 6;
	}

	switch (controladorfuncao) {
		case 1:
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"Complete", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
	
					res.render("maintplan_homecomplete", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:incrementadr, dadoscontroladorincr:parseInt(req.params.contador), Jobcards:data, title: 'EAGLEI'});
	
				}
	
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;

		case 2:
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"Complete", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
	
					res.render("maintplan_homecomplete", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:incrementadr, dadoscontroladorincr:parseInt(req.params.contador), Jobcards:data, title: 'EAGLEI'});
	
				}
	
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;
	
		case 3:
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"Complete", jobcard_regiao:userData.regiao, jobcard_departamento:userDept}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					
					res.render("maintplan_homecomplete", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:parseInt(req.params.contador), dadoscontroladorincr:incrementadr, Jobcards:data, title: 'EAGLEI'});
					
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;
		
		case 4: 
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"Complete"}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					
					res.render("maintplan_homecomplete", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:parseInt(req.params.contador), dadoscontroladorincr:incrementadr, Jobcards:data, title: 'EAGLEI'});
						
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;

		case 5: 
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"Complete", jobcard_clientenome: "Vm,Sa"}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					
					res.render("maintplan_homecomplete", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:parseInt(req.params.contador), dadoscontroladorincr:incrementadr, Jobcards:data, title: 'EAGLEI'});
						
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;

		case 6: 
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"Complete", jobcard_departamento:userDept}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					
					res.render("maintplan_homecomplete", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:parseInt(req.params.contador), dadoscontroladorincr:incrementadr, Jobcards:data, title: 'EAGLEI'});
						
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;

	}

});


router.get('/preventativemaint/complete/nextpage/:contador/:totalnr', function(req, res) {

	var userData=req.session.usuario;
	var nome = userData.nome;
	var contador = parseInt(req.params.contador) * 50;
	var incrementadr = parseInt(req.params.contador) + 1;
	console.log(contador)
	console.log(incrementadr)
	var userDept = userData.departamento;

	var controladorfuncao = 0;

	if (userData.funcao == "Tecnico" || (userData.funcao == "Assistant")) {
		controladorfuncao = 1;
	}else if(userData.funcao == "regional_manager"){
		controladorfuncao = 2;
	}else if (userData.verificador_funcao == "Regional Manager") {
		controladorfuncao = 3;
	}else if((userData.funcao == "Call Center") || (userData.funcao == "Back Office") || (userData.nivel_acesso == "admin")){
		controladorfuncao = 4;
	}else if(userData.nome == "Guest"){
		controladorfuncao = 5;
	}else if (userData.funcao == "Manager") {
		controladorfuncao = 6;
	}

	switch (controladorfuncao) {
		case 1:
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"Complete", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
					
					res.render("maintplan_homecomplete", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:parseInt(req.params.contador),dadoscontroladorincr:incrementadr, Jobcards:data, title: 'EAGLEI'});
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;

		case 2:
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"Complete", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
					
					res.render("maintplan_homecomplete", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:parseInt(req.params.contador),dadoscontroladorincr:incrementadr, Jobcards:data, title: 'EAGLEI'});
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;
	
		case 3:
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"Complete", jobcard_regiao:userData.regiao, jobcard_departamento:userDept}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					
					res.render("maintplan_homecomplete", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:parseInt(req.params.contador), dadoscontroladorincr:incrementadr, Jobcards:data, title: 'EAGLEI'});
					
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;
		
		case 4: 
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"Complete"}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					
					res.render("maintplan_homecomplete", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:parseInt(req.params.contador), dadoscontroladorincr:incrementadr, Jobcards:data, title: 'EAGLEI'});
						
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;

		case 5: 
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"Complete", jobcard_clientenome: "Vm,Sa"}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					
					res.render("maintplan_homecomplete", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:parseInt(req.params.contador), dadoscontroladorincr:incrementadr, Jobcards:data, title: 'EAGLEI'});
						
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;

		case 6: 
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"Complete", jobcard_departamento:userDept}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					
					res.render("maintplan_homecomplete", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:parseInt(req.params.contador), dadoscontroladorincr:incrementadr, Jobcards:data, title: 'EAGLEI'});
						
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;

	}

});


router.get('/preventativemaint/complete', function(req, res) {

	var userData=req.session.usuario;
	var nome = userData.nome;
	var userDept = userData.departamento;

	
	var controladorfuncao = 0;

	if (userData.funcao == "Tecnico" || (userData.funcao == "Assistant")) {
		controladorfuncao = 1;
	}else if(userData.funcao == "regional_manager"){
		controladorfuncao = 2;
	}else if (userData.verificador_funcao == "Regional Manager") {
		controladorfuncao = 3;
	}else if((userData.funcao == "Call Center") || (userData.funcao == "Back Office") || (userData.nivel_acesso == "admin")){
		controladorfuncao = 4;
	}else if(userData.nome == "Guest"){
		controladorfuncao = 5;
	}else if (userData.funcao == "Manager") {
		controladorfuncao = 6;
	}

	switch (controladorfuncao) {
		case 1:
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"Complete", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
	
					jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"Complete", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, dataJobcard){
						if(err){
							console.log("ocorreu um erro ao tentar aceder os dados")
						}else{
	
							var total = dataJobcard;
							var totalcont = Math.ceil(total/50);
							console.log(totalcont)
	
							res.render("maintplan_homecomplete", {DataU:userData, dadostotalnr:totalcont, dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
	
						}
					}).exec();
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
		break;

		case 2:
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"Complete", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
	
					jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"Complete", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, dataJobcard){
						if(err){
							console.log("ocorreu um erro ao tentar aceder os dados")
						}else{
	
							var total = dataJobcard;
							var totalcont = Math.ceil(total/50);
							console.log(totalcont)
	
							res.render("maintplan_homecomplete", {DataU:userData, dadostotalnr:totalcont, dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
	
						}
					}).exec();
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
		break;
	
		case 3:
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"Complete", jobcard_regiao:userData.regiao, jobcard_departamento:userDept}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"Complete", jobcard_regiao:userData.regiao, jobcard_departamento:userDept}, function(err, dataJobcard){
						if (err) {
							console.log("ocorreu um erro ao tentar aceder os dados");
						}
						else{
							var total = dataJobcard;
							var totalcont = Math.ceil(total/50);
							res.render("maintplan_homecomplete", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
						}
					}).exec();
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
		break;
		
		case 4: 
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"Complete"}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"Complete"}, function(err, dataJobcard){
						if (err) {
							console.log("ocorreu um erro ao tentar aceder os dados");
						}
						else{
							var total = dataJobcard;
							var totalcont = Math.ceil(total/50);
							res.render("maintplan_homecomplete", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
						}
					}).exec();
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
		break;

		case 5: 
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"Complete", jobcard_clientenome: "Vm,Sa"}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"Complete", jobcard_clientenome: "Vm,Sa"}, function(err, dataJobcard){
						if (err) {
							console.log("ocorreu um erro ao tentar aceder os dados");
						}
						else{
							var total = dataJobcard;
							var totalcont = Math.ceil(total/50);
							res.render("maintplan_homecomplete", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
						}
					}).exec();
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
		break;

		case 6: 
			jobcards.find({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"Complete", jobcard_departamento:userDept}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					jobcards.countDocuments({jobcard_jobtype:"Preventative Maintenance", ttnumber_status:"Complete", jobcard_departamento:userDept}, function(err, dataJobcard){
						if (err) {
							console.log("ocorreu um erro ao tentar aceder os dados");
						}
						else{
							var total = dataJobcard;
							var totalcont = Math.ceil(total/50);
							res.render("maintplan_homecomplete", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
						}
					}).exec();
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
		break;

	}

})


router.get('/preventativemaint/tobeinvoiced', function(req, res) {

	var userData=req.session.usuario;
	var nome = userData.nome;
	var calljobcard = ["Project"];


	if((userData.funcao == "Call Center") || (userData.funcao == "Back Office") || (userData.nivel_acesso == "admin") || (userData.funcao == "Call Center") || (userData.nome == "Hamilton Sitoe") || (userData.nome == "Luis Brazuna") || (userData.nome == "Antonio Biquiza")){

		jobcards.find({jobcard_jobtype:"Preventative Maintenance", jobcard_call:{$ne:calljobcard}, ttnumber_status:"To be Invoiced"}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{

				res.render("maintplan_home", {DataU:userData, Jobcards:data, title: 'EAGLEI'});
				
			}
		});

	}else{

		jobcards.find({jobcard_jobtype:"Preventative Maintenance", jobcard_call:{$ne:calljobcard}, ttnumber_status:"To be Invoiced", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				
				res.render("maintplan_home", {DataU:userData, Jobcards:data, title: 'EAGLEI'});
			}
		});
	}
});


router.get('/ttnumberhome/novocallout', function(req, res) {
	var userData=req.session.usuario;
	var nome = userData.nome;
	var departamentoArray = ["HVAC", "Power", "Telco", "Data Center"];

	var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
    var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
    var ano = (new Date()).getFullYear();
	var datactual = dia + "/" + mes + "/" + ano;
	datactual.toString();

    var currenthrs = new Date();
	var horarelatada = currenthrs.getHours() + ":" + currenthrs.getMinutes();
	horarelatada.toString();


	clientes.find({},{cliente_nome:1, cliente_filial:1, cliente_telefone:1}, function(err, dataClientes){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}else{

			usuarios.find({nivel_acesso:{$ne:"admin"} }, {nome:1}, function(err, dataUsuarios){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}else{

					siteinfos.aggregate([{$group:{_id:"$siteinfo_clientid", sites:{$push:{numero:"$siteinfo_sitenum", ref:"$_id"}}}}], function (err, dataSiteCliente) {

						if(err){
							console.log("ocorreu um erro ao tentar aceder os dados")
						}else{

							function compare( a, b ) {
						          if ( a.numero < b.numero ){
						            return -1;
						          }
						          if ( a.numero > b.numero ){
						            return 1;
						          }
						          return 0;
						      }
						      
						    for(var i = 0; i < dataSiteCliente.length; i++){

						        dataSiteCliente[i].sites.sort(compare);

						    }

						    siteinfos.find({},{siteinfo_maintoffid:1}, function(err, dataSiteInfo){
						    	if(err){
									console.log("ocorreu um erro ao tentar aceder os dados")
								}else{

									jobcards.find({jobcard_ttnumber:{$ne:0} },{jobcard_ttnumber:1}, function(err, dataJobcaaards){
										if(err){
											console.log("ocorreu um erro ao tentar aceder os dados")
										}else{
											jobcards.find({jobcard_jobtype:"Callout", jobcard_sitedeparturedate:{$exists:false}, data_registojobcard1:datactual}, {jobcard_site:1, jobcard_siteid:1}, function(err, dataJobcardsCallout){
												if(err){
													console.log("ocorreu um erro ao tentar aceder os dados")
												}else{
													 // console.log(dataSiteInfo)
													res.render("ttnumber_calloutform", {DataU:userData, DadosDepartamento:JSON.stringify(departamentoArray), DataRelatada:datactual, HoraRelatada:horarelatada, DadosJobcardCallout:JSON.stringify(dataJobcardsCallout), SiteInfo:JSON.stringify(dataSiteInfo), DadosJobcards:JSON.stringify(dataJobcaaards), SiteCliente:JSON.stringify(dataSiteCliente), DadosClientes:JSON.stringify(dataClientes),Clientes:dataClientes, Usuarios:dataUsuarios,title: 'EAGLEI'});
												}
											}).lean();
											
										}

									}).lean();

									

								}
						    }).lean();

						}

					});
				}
			}).sort({ nome: 1 }).lean();

			

		}
	}).sort({ cliente_nome: 1 }).lean();
		
	
});

router.post('/tthomenewpesquisa', async function(req, res) {
	var userData=req.session.usuario;
	var nome = userData.nome;
	var tthomecont = req.body;
	var controlador = tthomecont.pesquisador.toLowerCase();
	var firstLetter = controlador.charAt(0).toUpperCase();
	var rest = controlador.slice(1);
	var controladorupper = firstLetter.concat(rest);
	
	var controladornr = 0;
		
	if(isNaN(controlador)){
		controladornr = 0;
		console.log(parseInt(controladornr))
	}else{
		controladornr = controlador;
	}
	

	if((userData.funcao == "Call Center") || (userData.funcao == "Back Office") || (userData.nivel_acesso == "admin") || (userData.nome == "Hamilton Sitoe") || (userData.nome == "Luis Brazuna") || (userData.nome == "Antonio Biquiza")){

        jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"New", $or:[{jobcard_ttnumber:parseInt(controladornr)}, {jobcard_site:controlador}, {jobcard_tecniconome: {$regex:controladorupper}}, {jobcard_clientenome: {$regex:controladorupper}}, {jobcard_loggedby: {$regex:controladorupper}}, {jobcard_regiao: {$regex:controlador}}, {jobcard_call: {$regex:controladorupper}} , {jobcard_datareporte: {$regex:controlador}} ]}, function(err, data){
            if(err){
                console.log("ocorreu um erro ao tentar aceder os dados")
            }
            else{

                jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New", $or:[{jobcard_ttnumber:parseInt(controladornr)}, {jobcard_site:controlador}]}, function(err, dataJobcard){
                    if(err){
                        console.log("ocorreu um erro ao tentar aceder os dados")
                    }
                    else{
                        
                        var total = dataJobcard;
                        var totalcont = Math.ceil(total/50);
                        // console.log(totalcont)
                        res.render("ttnumber_homenew", {DataU:userData, Dadospesquisa:controlador, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
                    }
                }).exec();
                
            }
        }).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();

    }else{

        jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"New", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}, {jobcard_ttnumber:parseInt(controladornr)}, {jobcard_site:controlador}]}, function(err, data){
            
            if(err){
                console.log("ocorreu um erro ao tentar aceder os dados")
            }
            else{

                // res.render("ttnumber_home", {DataU:userData, dadostotalnr:totalcont, dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});

                jobcards.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1}, function(err, dataJobcaaards){

                    if(err){
                        console.log("ocorreu um erro ao tentar aceder os dados")
                    }
                    else{

                        jobcardprojects.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1}, function(err, dataProjects){

                            if(err){
                                console.log("ocorreu um erro ao tentar aceder os dados")
                            }
                            else{
                                jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New" , $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}, {jobcard_ttnumber:parseInt(controladornr)}, {jobcard_site:controlador}]}, function(err, dataJobcard){
                                    if(err){
                                        console.log("ocorreu um erro ao tentar aceder os dados")
                                    }else{

                                        // console.log(dataJobcard)
                                        var total = dataJobcard;
                                        var totalcont = Math.ceil(total/50);
                                        res.render("ttnumber_homenew", {DataU:userData, Dadospesquisa:controlador, dadostotalnr:totalcont, dadoscontroladordecr:0,dadoscontroladorincr:1, DadosProjects:JSON.stringify(dataProjects), DadosJobcards:JSON.stringify(dataJobcaaards), Jobcards:data, title: 'EAGLEI'});
                                    }
                                }).exec();
                                
                                
                            }

                        }).lean();
                        
                    }

                }).lean();

            }

        }).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
    }
	
 
});


router.get('/ttnumberhome/new/previouspage/:contador/:totalnr', function(req, res) {

	var userData=req.session.usuario;
	var nome = userData.nome;
	var incrementadr = parseInt(req.params.contador) - 1;
	var contador = incrementadr * 50;
	
	console.log(contador)
	console.log(incrementadr)
	
	var controladorfuncao = 0;

	if (userData.funcao == "Tecnico" || (userData.funcao == "Assistant")) {
		controladorfuncao = 1;
	}else if(userData.funcao == "regional_manager"){
		controladorfuncao = 2;
	}else if (userData.verificador_funcao == "Regional Manager") {
		controladorfuncao = 3;
	}else if((userData.funcao = "Call Center") || (userData.funcao = "Back Office") || (userData.nivel_acesso = "admin") (userData.funcao == "Manager")){
		controladorfuncao = 4;
	}else if(userData.nome == "Guest"){
		controladorfuncao = 5;
	};

	switch (controladorfuncao) {
		case 1:
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"New", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{

					res.render("ttnumber_homenew", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr),dadoscontroladordecr:incrementadr, dadoscontroladorincr:parseInt(req.params.contador), Jobcards:data, title: 'EAGLEI'});							
						
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;

		case 2:
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"New", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					res.render("ttnumber_homenew", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr),dadoscontroladordecr:incrementadr, dadoscontroladorincr:parseInt(req.params.contador), Jobcards:data, title: 'EAGLEI'});							
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;
	
		case 3:
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"New", jobcard_regiao:userData.regiao}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					res.render("ttnumber_homenew", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr),dadoscontroladordecr:incrementadr, dadoscontroladorincr:parseInt(req.params.contador), Jobcards:data, title: 'EAGLEI'});							
	
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;
		
		case 4: 
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"New"}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					res.render("ttnumber_homenew", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr),dadoscontroladordecr:incrementadr, dadoscontroladorincr:parseInt(req.params.contador), Jobcards:data, title: 'EAGLEI'});							
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;

		case 5: 
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"New", jobcard_clientenome: "Vm,Sa"}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					res.render("ttnumber_homenew", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr),dadoscontroladordecr:incrementadr, dadoscontroladorincr:parseInt(req.params.contador), Jobcards:data, title: 'EAGLEI'});							
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;
		
	}
	
});

router.get('/ttnumberhome/new/nextpage/:contador/:totalnr', function(req, res) {

	var userData=req.session.usuario;
	var nome = userData.nome;
	var contador = parseInt(req.params.contador) * 50;
	var incrementadr = parseInt(req.params.contador) + 1;
	console.log(contador)
	console.log(incrementadr)
	var userDept = userData.departamento;

	var controladorfuncao = 0;

	if (userData.funcao == "Tecnico" || (userData.funcao == "Assistant")) {
		controladorfuncao = 1;
	}else if(userData.funcao == "regional_manager"){
		controladorfuncao = 2;
	}else if (userData.verificador_funcao == "Regional Manager") {
		controladorfuncao = 3;
	}else if((userData.funcao == "Call Center") || (userData.funcao == "Back Office") || (userData.nivel_acesso == "admin") || (userData.funcao == "IT Officer")){
		controladorfuncao = 4;
	}else if(userData.nome == "Guest"){
		controladorfuncao = 5;
	}else if (userData.funcao == "Manager") {
		controladorfuncao = 6;
	};

	switch (controladorfuncao) {
		case 1:
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"New", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					
					res.render("ttnumber_homenew", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr),dadoscontroladordecr:parseInt(req.params.contador),dadoscontroladorincr:incrementadr, Jobcards:data, title: 'EAGLEI'});							
						
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;

		case 2:
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"New", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					res.render("ttnumber_homenew", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr),dadoscontroladordecr:parseInt(req.params.contador),dadoscontroladorincr:incrementadr, Jobcards:data, title: 'EAGLEI'});
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;
	
		case 3:
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"New", jobcard_regiao:userData.regiao, jobcard_departamento:userDept}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					res.render("ttnumber_homenew", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr),dadoscontroladordecr:parseInt(req.params.contador),dadoscontroladorincr:incrementadr, Jobcards:data, title: 'EAGLEI'});

				}
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;
		
		case 4: 
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"New"}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					res.render("ttnumber_homenew", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr),dadoscontroladordecr:parseInt(req.params.contador),dadoscontroladorincr:incrementadr, Jobcards:data, title: 'EAGLEI'});

				}
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;

		case 5: 
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"New", jobcard_clientenome: "Vm,Sa"}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					res.render("ttnumber_homenew", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr),dadoscontroladordecr:parseInt(req.params.contador),dadoscontroladorincr:incrementadr, Jobcards:data, title: 'EAGLEI'});

				}
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;

		case 6: 
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"New", jobcard_departamento:userDept}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					res.render("ttnumber_homenew", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr),dadoscontroladordecr:parseInt(req.params.contador),dadoscontroladorincr:incrementadr, Jobcards:data, title: 'EAGLEI'});

				}
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;

	}
	
});

function organizedata(a, b){
	if(a.data_ultimaactualizacaojobcard> b.data_ultimaactualizacaojobcard) return -1;
	if(b.data_ultimaactualizacaojobcard> a.data_ultimaactualizacaojobcard) return 1
}


// router.get('/ttnumberhome/new', async function(req, res) {
// 	var userData=req.session.usuario;
// 	var nome = userData.nome;
// 	var controladorfuncao = 0;
// 	var userDept = userData.departamento;
// 	var hvaccollecao=await hvac_db.find({status:"new"}).sort({_id:-1});
	
//     if(userData.nivel_acesso=="admin" || ((userData.departamento_id == "611e45e68cd71c1f48cf45bd" && userData.funcao_id == "611e6bd559c6e30a006ede59") || (userData.departamento_id == "611e45e68cd71c1f48cf45bd" && userData.funcao_id == "611e2b8cf9b1b31cd868a30c") ) ){
// 		var tttss= await jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"New"}).limit(10);
// 		var ttys= await hvaccollecao.concat(tttss)

// 		ttys.sort(organizedata);

// 		console.log(ttys);

// 		// console.log(tttss)

// 		 res.render("hvac_new_correct", {DataU:userData, HvacJobs:ttys ,title:"eagleI"});



// 	}else


// 	{
        


// 	if (userData.funcao == "Tecnico" || userData.funcao == "Assistant") {
// 		controladorfuncao = 1;
// 	}else if(userData.funcao == "regional_manager"){
// 		controladorfuncao = 2;
// 	}else if (userData.verificador_funcao == "Regional Manager") {
// 		controladorfuncao = 3;
// 	}else if((userData.funcao == "Call Center") || (userData.funcao == "Back Office") || (userData.nivel_acesso == "admin") || (userData.funcao == "IT Officer") || (userData.Departamento == "Centro de Suporte de Operações")){
// 		controladorfuncao = 4;
// 	}else if(userData.nome == "Guest"){
// 		controladorfuncao = 5;
// 	}else if (userData.funcao == "Manager") {
// 		controladorfuncao = 6;
// 	};
// 	console.log(userData.funcao + " do departamento " + userDept);

// 	console.log(controladorfuncao);
// 	switch (controladorfuncao) {
// 		case 1:
// 			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"New", jobcard_tecniconome:nome}, function(err, data){
			
// 				if(err){
// 					console.log("ocorreu um erro ao tentar aceder os dados")
// 				}
// 				else{
		
// 					jobcards.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1, ttnumber_status:1, jobcard_wait:1}, function(err, dataJobcaaards){
	
// 						if(err){
// 							console.log("ocorreu um erro ao tentar aceder os dados")
// 						}
// 						else{
	
// 							jobcardprojects.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1, ttnumber_status:1, jobcard_wait:1}, function(err, dataProjects){
	
// 								if(err){
// 									console.log("ocorreu um erro ao tentar aceder os dados")
// 								}
// 								else{
// 									jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, dataJobcard){
// 										if(err){
// 											console.log("ocorreu um erro ao tentar aceder os dados")
// 										}else{
	
// 											var total = dataJobcard;
// 											var totalcont = Math.ceil(total/50);
// 											res.render("ttnumber_homenew", {DataU:userData, dadostotalnr:totalcont, dadoscontroladordecr:0,dadoscontroladorincr:1, DadosProjects:JSON.stringify(dataProjects), DadosJobcards:JSON.stringify(dataJobcaaards), Jobcards:data, title: 'EAGLEI'});
// 										}
// 									}).exec();
									
// 								}
	
// 							}).lean();
							
// 						}
	
// 					}).lean();
	
// 				}
	
// 			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
// 		break;

// 		case 2:
// 			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"New", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, data){
			
// 				if(err){
// 					console.log("ocorreu um erro ao tentar aceder os dados")
// 				}
// 				else{
		
// 					jobcards.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1, ttnumber_status:1, jobcard_wait:1}, function(err, dataJobcaaards){
	
// 						if(err){
// 							console.log("ocorreu um erro ao tentar aceder os dados")
// 						}
// 						else{
	
// 							jobcardprojects.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1, ttnumber_status:1, jobcard_wait:1}, function(err, dataProjects){
	
// 								if(err){
// 									console.log("ocorreu um erro ao tentar aceder os dados")
// 								}
// 								else{
// 									jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New" , $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, dataJobcard){
// 										if(err){
// 											console.log("ocorreu um erro ao tentar aceder os dados")
// 										}else{
	
// 											// console.log(dataJobcard)
// 											var total = dataJobcard;
// 											var totalcont = Math.ceil(total/50);
// 											res.render("ttnumber_homenew", {DataU:userData, dadostotalnr:totalcont, dadoscontroladordecr:0,dadoscontroladorincr:1, DadosProjects:JSON.stringify(dataProjects), DadosJobcards:JSON.stringify(dataJobcaaards), Jobcards:data, title: 'EAGLEI'});
// 										}
// 									}).exec();
									
// 								}
	
// 							}).lean();
							
// 						}
	
// 					}).lean();
	
// 				}
	
// 			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
			
// 		break;
	
// 		case 3:
// 			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"New", jobcard_regiao:userData.regiao, jobcard_departamento:userDept}, function(err, data){
// 				if (err) {
// 					console.log("Ocorreu um erro ao tentar aceder os dados");
// 				}
// 				else{
// 					jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New", jobcard_regiao:userData.regiao, jobcard_departamento:userDept}, function(err, dataJobcard){
// 						if (err) {
// 							console.log("ocorreu um erro ao tentar aceder os dados");
// 						}
// 						else{
// 							var total = dataJobcard;
// 							var totalcont = Math.ceil(total/50);
// 							res.render("ttnumber_homenew", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
// 						}
// 					}).exec();
// 				}
// 			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
// 		break;
		
// 		case 4: 
// 			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"New"}, function(err, data){
// 				if (err) {
// 					console.log("Ocorreu um erro ao tentar aceder os dados");
// 				}
// 				else{
// 					jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New"}, function(err, dataJobcard){
// 						if (err) {
// 							console.log("ocorreu um erro ao tentar aceder os dados");
// 						}
// 						else{
// 							// var estee= hvaccollecao.concat(data);
// 							var total = dataJobcard;
// 							var totalcont = Math.ceil(total/50);
// 							// console.log(estee)
// 							res.render("ttnumber_homenew", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
// 						}
// 					}).exec();
// 				}
// 			}).sort({data_ultimaactualizacaojobcard:-1}).limit(45).lean();
// 		break;

// 		case 5: 
// 			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"New", jobcard_clientenome: "Vm,Sa"}, function(err, data){
// 				if (err) {
// 					console.log("Ocorreu um erro ao tentar aceder os dados");
// 				}
// 				else{
// 					jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New", jobcard_clientenome: "Vm,Sa"}, function(err, dataJobcard){
// 						if (err) {
// 							console.log("ocorreu um erro ao tentar aceder os dados");
// 						}
// 						else{
// 							var total = dataJobcard;
// 							var totalcont = Math.ceil(total/50);
// 							res.render("ttnumber_homenew", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
// 						}
// 					}).exec();
// 				}
// 			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
// 		break;

// 		case 6: 
// 			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"New", jobcard_departamento:userDept}, function(err, data){
// 				if (err) {
// 					console.log("Ocorreu um erro ao tentar aceder os dados");
// 				}
// 				else{
// 					jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New", jobcard_departamento:userDept}, function(err, dataJobcard){
// 						if (err) {
// 							console.log("ocorreu um erro ao tentar aceder os dados");
// 						}
// 						else{
// 							var total = dataJobcard;
// 							var totalcont = Math.ceil(total/50);
// 							res.render("ttnumber_homenew", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
// 						}
// 					}).exec();
// 				}
// 			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
// 		break;
// 	}}
	
// });

router.get('/ttnumberhome/new', async function(req, res) {
	var userData=req.session.usuario;
	var nome = userData.nome;
	var controladorfuncao = 0;
	var userDept = userData.departamento;
	var hvaccollecao=await hvac_db.find({status:"new"}).sort({_id:-1});
    var dataCountHvac = 0;
	
    if(userData.nivel_acesso=="admin" || ((userData.departamento_id == "611e45e68cd71c1f48cf45bd" && userData.funcao_id == "611e6bd559c6e30a006ede59") || (userData.departamento_id == "611e45e68cd71c1f48cf45bd" && userData.funcao_id == "611e2b8cf9b1b31cd868a30c") ) ){
		var tttss= await jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"New"}).limit(10);
		var ttys= await hvaccollecao.concat(tttss)

		ttys.sort(organizedata);

		console.log(ttys);

		// console.log(tttss)

		 res.render("hvac_new_correct", {DataU:userData, HvacJobs:ttys ,title:"eagleI"});



	}else


	{
        


	if (userData.funcao == "Tecnico" || userData.funcao == "Assistant") {
		controladorfuncao = 1;
	}else if(userData.funcao == "regional_manager"){
		controladorfuncao = 2;
	}else if (userData.verificador_funcao == "Regional Manager") {
		controladorfuncao = 3;
	}else if((userData.funcao == "Call Center") || (userData.funcao == "Back Office") || (userData.nivel_acesso == "admin") || (userData.funcao == "IT Officer") || (userData.Departamento == "Centro de Suporte de Operações")){
		controladorfuncao = 4;
	}else if(userData.nome == "Guest"){
		controladorfuncao = 5;
	}else if (userData.funcao == "Manager") {
		controladorfuncao = 6;
	};
	console.log(userData.funcao + " do departamento " + userDept);

	console.log(controladorfuncao);
	switch (controladorfuncao) {
		case 1:
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"New", jobcard_tecniconome:nome}, function(err, data){
			
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
		
					jobcards.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1, ttnumber_status:1, jobcard_wait:1}, function(err, dataJobcaaards){
	
						if(err){
							console.log("ocorreu um erro ao tentar aceder os dados")
						}
						else{
	
							jobcardprojects.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1, ttnumber_status:1, jobcard_wait:1}, function(err, dataProjects){
	
								if(err){
									console.log("ocorreu um erro ao tentar aceder os dados")
								}
								else{
									jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, dataJobcard){
										if(err){
											console.log("ocorreu um erro ao tentar aceder os dados")
										}else{
	
											var total = dataJobcard;
											var totalcont = Math.ceil(total/50);
											res.render("ttnumber_homenew", {DataU:userData, dadostotalnr:totalcont, dadoscontroladordecr:0,dadoscontroladorincr:1, DadosProjects:JSON.stringify(dataProjects), DadosJobcards:JSON.stringify(dataJobcaaards), Jobcards:data, title: 'EAGLEI'});
										}
									}).exec();
									
								}
	
							}).lean();
							
						}
	
					}).lean();
	
				}
	
			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
		break;

		case 2:
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"New", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, data){
			
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
		
					jobcards.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1, ttnumber_status:1, jobcard_wait:1}, function(err, dataJobcaaards){
	
						if(err){
							console.log("ocorreu um erro ao tentar aceder os dados")
						}
						else{
	
							jobcardprojects.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1, ttnumber_status:1, jobcard_wait:1}, function(err, dataProjects){
	
								if(err){
									console.log("ocorreu um erro ao tentar aceder os dados")
								}
								else{
									jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New" , $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, dataJobcard){
										if(err){
											console.log("ocorreu um erro ao tentar aceder os dados")
										}else{
	
											// console.log(dataJobcard)
											var total = dataJobcard;
											var totalcont = Math.ceil(total/50);
											res.render("ttnumber_homenew", {DataU:userData, dadostotalnr:totalcont, dadoscontroladordecr:0,dadoscontroladorincr:1, DadosProjects:JSON.stringify(dataProjects), DadosJobcards:JSON.stringify(dataJobcaaards), Jobcards:data, title: 'EAGLEI'});
										}
									}).exec();
									
								}
	
							}).lean();
							
						}
	
					}).lean();
	
				}
	
			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
			
		break;
	
		case 3:
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"New", jobcard_regiao:userData.regiao, jobcard_departamento:userDept}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New", jobcard_regiao:userData.regiao, jobcard_departamento:userDept}, function(err, dataJobcard){
						if (err) {
							console.log("ocorreu um erro ao tentar aceder os dados");
						}
						else{
							var total = dataJobcard;
							var totalcont = Math.ceil(total/50);
							res.render("ttnumber_homenew", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
						}
					}).exec();
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
		break;
		
		case 4:
            await hvac_db.find({status:"new"}, async function(err, datahvac){
                if (err) {
                    console.log("Ocorreu um erro ao tentar aceder os dados dos novos jobcards HVAC")
                } else {
                    dataCountHvac = await hvac_db.countDocuments({status:"new"});

                    await jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"New"}, async function(err, data){
                        if (err) {
                            console.log("Ocorreu um erro ao tentar aceder os dados");
                        }
                        else{
                            jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New"}, function(err, dataJobcard){
                                if (err) {
                                    console.log("ocorreu um erro ao tentar aceder os dados");
                                }
                                else{
                                    // var estee= hvaccollecao.concat(data);
                                    var total = dataJobcard + dataCountHvac;
                                    console.log("O número total de jobs é ", total);
                                    var totalcont = Math.ceil(total/50);
                                    data = datahvac.concat(data);
                                    console.log("Estes são os jobcards da cena ", data);
                                    // console.log(estee)
                                    res.render("ttnumber_homenew", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
                                }
                            }).exec();
                        }
                    }).sort({data_ultimaactualizacaojobcard:-1}).limit(45).lean();
                }
            })    
        
               
		break;

		case 5: 
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"New", jobcard_clientenome: "Vm,Sa"}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New", jobcard_clientenome: "Vm,Sa"}, function(err, dataJobcard){
						if (err) {
							console.log("ocorreu um erro ao tentar aceder os dados");
						}
						else{
							var total = dataJobcard;
							var totalcont = Math.ceil(total/50);
							res.render("ttnumber_homenew", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
						}
					}).exec();
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
		break;

		case 6: 
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"New", jobcard_departamento:userDept}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New", jobcard_departamento:userDept}, function(err, dataJobcard){
						if (err) {
							console.log("ocorreu um erro ao tentar aceder os dados");
						}
						else{
							var total = dataJobcard;
							var totalcont = Math.ceil(total/50);
							res.render("ttnumber_homenew", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
						}
					}).exec();
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
		break;
	}}
	
});

router.get('/ttnumberhome/escalated', async function(req, res) {
	// console.log(req.session.usuario);
	var userData=req.session.usuario;
	var nome = userData.nome;
	var controladorfuncao = 0;
	var userDept = userData.departamento;

	if (userData.funcao == "Tecnico" || userData.funcao == "Assistant") {
		controladorfuncao = 1;
	}else if(userData.funcao == "regional_manager"){
		controladorfuncao = 2;
	}else if (userData.verificador_funcao == "Regional Manager") {
		controladorfuncao = 3;
	}else if((userData.funcao == "Call Center") || (userData.funcao == "Back Office") || (userData.nivel_acesso == "admin") || (userData.funcao == "IT Officer")){
		controladorfuncao = 4;
	}else if(userData.nome == "Guest"){
		controladorfuncao = 5;
	}else if (userData.funcao == "Manager") {
		controladorfuncao = 6;
	};
	console.log(userData.funcao + " do departamento " + userDept);

	console.log(controladorfuncao);
	switch (controladorfuncao) {
		case 1:
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"New", $or:[{jobcard_escalationlevel:"1"}, {jobcard_escalationlevel:"2"}], jobcard_tecniconome:nome}, function(err, data){
			
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
	
					// res.render("ttnumber_home", {DataU:userData, dadostotalnr:totalcont, dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
	
					jobcards.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1, ttnumber_status:1, jobcard_wait:1}, function(err, dataJobcaaards){
	
						if(err){
							console.log("ocorreu um erro ao tentar aceder os dados")
						}
						else{
	
							jobcardprojects.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1, ttnumber_status:1, jobcard_wait:1}, function(err, dataProjects){
	
								if(err){
									console.log("ocorreu um erro ao tentar aceder os dados")
								}
								else{
									jobcards.countDocuments({jobcard_jobtype:"Callout", $or:[{jobcard_escalationlevel:"1"}, {jobcard_escalationlevel:"2"}], ttnumber_status:"New", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, dataJobcard){
										if(err){
											console.log("ocorreu um erro ao tentar aceder os dados")
										}else{
	
											// console.log(dataJobcard)
											var total = dataJobcard;
											var totalcont = Math.ceil(total/50);
											res.render("ttnumber_homenew", {DataU:userData, dadostotalnr:totalcont, dadoscontroladordecr:0,dadoscontroladorincr:1, DadosProjects:JSON.stringify(dataProjects), DadosJobcards:JSON.stringify(dataJobcaaards), Jobcards:data, title: 'EAGLEI'});
										}
									}).exec();
									
								}
	
							}).lean();
							
						}
	
					}).lean();
	
				}
	
			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
		break;

		case 2:
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"New", jobcard_escalationlevel:{$exists:true} , $and:[{$or:[{jobcard_escalationlevel:"1"}, {jobcard_escalationlevel:"2"}]}, {$or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}]}, function(err, data){
			
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
	
					// res.render("ttnumber_home", {DataU:userData, dadostotalnr:totalcont, dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
	
					jobcards.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1, ttnumber_status:1, jobcard_wait:1}, function(err, dataJobcaaards){
	
						if(err){
							console.log("ocorreu um erro ao tentar aceder os dados")
						}
						else{
	
							jobcardprojects.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1, ttnumber_status:1, jobcard_wait:1}, function(err, dataProjects){
	
								if(err){
									console.log("ocorreu um erro ao tentar aceder os dados")
								}
								else{
									jobcards.countDocuments({jobcard_jobtype:"Callout", $or:[{jobcard_escalationlevel:"1"}, {jobcard_escalationlevel:"2"}], ttnumber_status:"New" , $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, dataJobcard){
										if(err){
											console.log("ocorreu um erro ao tentar aceder os dados")
										}else{
	
											// console.log(dataJobcard)
											var total = dataJobcard;
											var totalcont = Math.ceil(total/50);
											res.render("ttnumber_homenew", {DataU:userData, dadostotalnr:totalcont, dadoscontroladordecr:0,dadoscontroladorincr:1, DadosProjects:JSON.stringify(dataProjects), DadosJobcards:JSON.stringify(dataJobcaaards), Jobcards:data, title: 'EAGLEI'});
										}
									}).exec();
									
								}
	
							}).lean();
							
						}
	
					}).lean();
	
				}
	
			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
			
		break;
	
		case 3:
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"New", jobcard_regiao:userData.regiao, $or:[{jobcard_escalationlevel:"1"}, {jobcard_escalationlevel:"2"}], jobcard_departamento:userDept}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New", $or:[{jobcard_escalationlevel:"1"}, {jobcard_escalationlevel:"2"}], jobcard_regiao:userData.regiao, jobcard_departamento:userDept}, function(err, dataJobcard){
						if (err) {
							console.log("ocorreu um erro ao tentar aceder os dados");
						}
						else{
							var total = dataJobcard;
							var totalcont = Math.ceil(total/50);
							res.render("ttnumber_homenew", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
						}
					}).exec();
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
		break;
		
		case 4: 
			jobcards.find({jobcard_jobtype:"Callout", $or:[{jobcard_escalationlevel:"1"}, {jobcard_escalationlevel:"2"}], ttnumber_status:"New"}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					jobcards.countDocuments({jobcard_jobtype:"Callout", $or:[{jobcard_escalationlevel:"1"}, {jobcard_escalationlevel:"2"}], ttnumber_status:"New"}, function(err, dataJobcard){
						if (err) {
							console.log("ocorreu um erro ao tentar aceder os dados");
						}
						else{
							var total = dataJobcard;
							var totalcont = Math.ceil(total/50);
							res.render("ttnumber_homenew", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
						}
					}).exec();
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
		break;

		case 5: 
			jobcards.find({jobcard_jobtype:"Callout", $or:[{jobcard_escalationlevel:"1"}, {jobcard_escalationlevel:"2"}], ttnumber_status:"New", jobcard_clientenome: "Vm,Sa"}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					jobcards.countDocuments({jobcard_jobtype:"Callout", $or:[{jobcard_escalationlevel:"1"}, {jobcard_escalationlevel:"2"}], ttnumber_status:"New", jobcard_clientenome: "Vm,Sa"}, function(err, dataJobcard){
						if (err) {
							console.log("ocorreu um erro ao tentar aceder os dados");
						}
						else{
							var total = dataJobcard;
							var totalcont = Math.ceil(total/50);
							res.render("ttnumber_homenew", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
						}
					}).exec();
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
		break;

		case 6: 
			jobcards.find({jobcard_jobtype:"Callout", $or:[{jobcard_escalationlevel:"1"}, {jobcard_escalationlevel:"2"}], ttnumber_status:"New", jobcard_departamento:userDept}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					jobcards.countDocuments({jobcard_jobtype:"Callout", $or:[{jobcard_escalationlevel:"1"}, {jobcard_escalationlevel:"2"}], ttnumber_status:"New", jobcard_departamento:userDept}, function(err, dataJobcard){
						if (err) {
							console.log("ocorreu um erro ao tentar aceder os dados");
						}
						else{
							var total = dataJobcard;
							var totalcont = Math.ceil(total/50);
							res.render("ttnumber_homenew", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
						}
					}).exec();
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
		break;
	}
	
});

router.get('/apagarjobcard/:id', upload.any(), function(req, res){
	var userData=req.session.usuario;
	var nome = userData.nome;
	var controladorfuncao = 0;
	console.log(req.params.id);
	jobcards.deleteOne({_id: req.params.id}, function(err, data){
		if (err) {
			console.log("Ocorreu um erro ao apagar os dados");
		}else{
			console.log("jobcard apagado");
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"New"}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New"}, function(err, dataJobcard){
						if (err) {
							console.log("ocorreu um erro ao tentar aceder os dados");
						}
						else{
							var total = dataJobcard;
							var totalcont = Math.ceil(total/50);
							res.render("ttnumber_homenew", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
						}
					}).exec();
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
		}
	});
});


router.post('/tthomeinprogresspesquisa', async function(req, res) {
	var userData=req.session.usuario;
	var nome = userData.nome;
	var tthomecont = req.body;
	var controlador = tthomecont.pesquisador.toLowerCase();
	var firstLetter = controlador.charAt(0).toUpperCase();
	var rest = controlador.slice(1);
	var controladorupper = firstLetter.concat(rest);

	var controladornr = 0;

	if(isNaN(controlador)){
		controladornr = 0;
		console.log(parseInt(controladornr))
	}else{
		controladornr = controlador;
	}

	if((userData.funcao == "Call Center") || (userData.funcao == "Back Office") || (userData.nivel_acesso == "admin") || (userData.nome == "Hamilton Sitoe") || (userData.nome == "Luis Brazuna") || (userData.nome == "Antonio Biquiza")){

        jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", $or:[{jobcard_ttnumber:parseInt(controladornr)}, {jobcard_site:controlador}, {jobcard_site:controlador}, {jobcard_tecniconome: {$regex:controladorupper}}, {jobcard_clientenome: {$regex:controladorupper}}, {jobcard_estadoactual: {$regex:controladorupper}}, {jobcard_regiao: {$regex:controlador}}, {jobcard_call: {$regex:controladorupper}} , {jobcard_datareporte: {$regex:controlador}} ]}, function(err, data){
            if(err){
                console.log("ocorreu um erro ao tentar aceder os dados")
            }
            else{

                jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", $or:[{jobcard_ttnumber:parseInt(controladornr)}, {jobcard_site:controlador}]}, function(err, dataJobcard){
                    if(err){
                        console.log("ocorreu um erro ao tentar aceder os dados")
                    }else{

                        var total = dataJobcard;
                        var totalcont = Math.ceil(total/50);
                        // console.log(totalcont)

                        res.render("ttnumber_home", {DataU:userData, Dadospesquisa:controlador, dadostotalnr:totalcont, dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});

                    }
                }).exec();
            }
        }).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();

    }else{

        jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}, {jobcard_ttnumber:parseInt(controladornr)}, {jobcard_site:controlador}]}, function(err, data){
            if(err){
                console.log("ocorreu um erro ao tentar aceder os dados")
            }
            else{

                jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}, {jobcard_ttnumber:parseInt(controladornr)}, {jobcard_site:controlador}]}, function(err, dataJobcard){
                    if(err){

                    }else{

                        var total = dataJobcard;
                        var totalcont = Math.ceil(total/50);
                        // console.log(totalcont)
                        res.render("ttnumber_home", {DataU:userData, Dadospesquisa:controlador,dadostotalnr:totalcont, dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
                    }
                }).exec();
            }

        }).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
    }
	
 
});


router.get('/ttnumberhome/inprogress/previouspage/:contador/:totalnr', function(req, res) {

	var userData=req.session.usuario;
	var nome = userData.nome;
	var incrementadr = parseInt(req.params.contador) - 1;
	var contador = incrementadr * 50;
	var userDept = userData.departamento;
	
	console.log(contador)
	console.log(incrementadr)
	
	var controladorfuncao = 0;

	if (userData.funcao == "Tecnico" || (userData.funcao == "Assistant")) {
		controladorfuncao = 1;
	}else if(userData.funcao == "regional_manager"){
		controladorfuncao = 2;
	}else if (userData.verificador_funcao == "Regional Manager") {
		controladorfuncao = 3;
	}else if((userData.funcao == "Call Center") || (userData.funcao == "Back Office") || (userData.nivel_acesso == "admin") || (userData.funcao == "IT Officer")){
		controladorfuncao = 4;
	}else if(userData.nome == "Guest"){
		controladorfuncao = 5;
	}else if (userData.funcao == "Manager") {
		controladorfuncao = 6;
	}

	switch (controladorfuncao) {
		case 1:
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
	
					res.render("ttnumber_home", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:incrementadr, dadoscontroladorincr:parseInt(req.params.contador), Jobcards:data, title: 'EAGLEI'});
	
				}
	
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;

		case 2:
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
	
					res.render("ttnumber_home", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:incrementadr, dadoscontroladorincr:parseInt(req.params.contador), Jobcards:data, title: 'EAGLEI'});
	
				}
	
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;
	
		case 3:
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", jobcard_regiao:userData.regiao, jobcard_departamento:userDept}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", jobcard_regiao:userData.regiao}, function(err, dataJobcard){
						if (err) {
							console.log("ocorreu um erro ao tentar aceder os dados");
						}
						else{
							 
							res.render("ttnumber_home", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr),dadoscontroladordecr:incrementadr,dadoscontroladorincr:parseInt(req.params.contador), Jobcards:data, title: 'EAGLEI'});
						}
					}).exec();
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;
		
		case 4: 
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"In Progress"}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"In Progress"}, function(err, dataJobcard){
						if (err) {
							console.log("ocorreu um erro ao tentar aceder os dados");
						}
						else{
							 
							res.render("ttnumber_home", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr),dadoscontroladordecr:incrementadr,dadoscontroladorincr:parseInt(req.params.contador), Jobcards:data, title: 'EAGLEI'});
						}
					}).exec();
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;

		case 5: 
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", jobcard_clientenome: "Vm,Sa"}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", jobcard_clientenome: "Vm,Sa"}, function(err, dataJobcard){
						if (err) {
							console.log("ocorreu um erro ao tentar aceder os dados");
						}
						else{
							 
							res.render("ttnumber_home", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr),dadoscontroladordecr:incrementadr,dadoscontroladorincr:parseInt(req.params.contador), Jobcards:data, title: 'EAGLEI'});
						}
					}).exec();
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;

		case 6: 
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", jobcard_departamento:userDept}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", jobcard_departamento:userDept}, function(err, dataJobcard){
						if (err) {
							console.log("ocorreu um erro ao tentar aceder os dados");
						}
						else{
							 
							res.render("ttnumber_home", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr),dadoscontroladordecr:incrementadr,dadoscontroladorincr:parseInt(req.params.contador), Jobcards:data, title: 'EAGLEI'});
						}
					}).exec();
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;

	}

});

router.get('/ttnumberhome/inprogress/nextpage/:contador/:totalnr', function(req, res) {

	var userData=req.session.usuario;
	var nome = userData.nome;
	var contador = parseInt(req.params.contador) * 50;
	var incrementadr = parseInt(req.params.contador) + 1;
	console.log(contador);
	console.log(incrementadr);
	var userDept = userData.departamento;

	var controladorfuncao = 0;

	if (userData.funcao == "Tecnico" || (userData.funcao == "Assistant")) {
		controladorfuncao = 1;
	}else if(userData.funcao == "regional_manager"){
		controladorfuncao = 2;
	}else if (userData.verificador_funcao == "Regional Manager") {
		controladorfuncao = 3;
	}else if((userData.funcao == "Call Center") || (userData.funcao == "Back Office") || (userData.nivel_acesso == "admin") || (userData.funcao == "IT Officer")){
		controladorfuncao = 4;
	}else if(userData.nome == "Guest"){
		controladorfuncao = 5;
	}else if (userData.funcao == "Manager") {
		controladorfuncao = 6;
	};

	switch (controladorfuncao) {
		case 1:
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
				
					res.render("ttnumber_home", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:parseInt(req.params.contador),dadoscontroladorincr:incrementadr, Jobcards:data, title: 'EAGLEI'});
	
				}
	
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;

		case 2:
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
	
				
					res.render("ttnumber_home", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:parseInt(req.params.contador),dadoscontroladorincr:incrementadr, Jobcards:data, title: 'EAGLEI'});
	
				}
	
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;
	
		case 3:
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", jobcard_regiao:userData.regiao, jobcard_departamento:userDept}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", jobcard_regiao:userData.regiao}, function(err, dataJobcard){
						if (err) {
							console.log("ocorreu um erro ao tentar aceder os dados");
						}
						else{
							 
							res.render("ttnumber_home", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr),dadoscontroladordecr:parseInt(req.params.contador),dadoscontroladorincr:incrementadr, Jobcards:data, title: 'EAGLEI'});
						}
					}).exec();
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;
		
		case 4: 
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"In Progress"}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"In Progress"}, function(err, dataJobcard){
						if (err) {
							console.log("ocorreu um erro ao tentar aceder os dados");
						}
						else{
							 
							res.render("ttnumber_home", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr),dadoscontroladordecr:parseInt(req.params.contador),dadoscontroladorincr:incrementadr, Jobcards:data, title: 'EAGLEI'});
						}
					}).exec();
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;

		case 5: 
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", jobcard_clientenome: "Vm,Sa"}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", jobcard_clientenome: "Vm,Sa"}, function(err, dataJobcard){
						if (err) {
							console.log("ocorreu um erro ao tentar aceder os dados");
						}
						else{
							 
							res.render("ttnumber_home", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
						}
					}).exec();
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;

		case 6: 
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", jobcard_departamento:userDept}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", jobcard_departamento:userDept}, function(err, dataJobcard){
						if (err) {
							console.log("ocorreu um erro ao tentar aceder os dados");
						}
						else{
							 
							res.render("ttnumber_home", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
						}
					}).exec();
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;

	}
	
});

// router.get('/ttnumberhome/inprogress', function(req, res) {
// 	console.log(req.session.usuario.funcao);
// 	var userData=req.session.usuario;
// 	var nome = userData.nome;
// 	var permissao = 0;
// 	var userDept = userData.departamento;

// 	var controladorfuncao = 0;

// 	if (userData.funcao == "Tecnico" || (userData.funcao == "Assistant")) {
// 		controladorfuncao = 1;
// 	}else if(userData.funcao == "regional_manager"){
// 		controladorfuncao = 2;
// 	}else if (userData.verificador_funcao == "Regional Manager") {
// 		controladorfuncao = 3;
// 	}else if((userData.funcao == "Call Center") || (userData.funcao == "Back Office") || (userData.nivel_acesso == "admin") || (userData.funcao == "IT Officer")){
// 		controladorfuncao = 4;
// 	}else if(userData.nome == "Guest"){
// 		controladorfuncao = 5;
// 	}else if (userData.funcao == "Manager") {
// 		controladorfuncao = 6;
// 	};

// 	console.log(userData.funcao + " do departamento " + userDept);
// 	console.log(controladorfuncao);
// 	switch (controladorfuncao) {
// 		case 1:
// 			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, data){
// 				if (err) {
// 					console.log("Ocorreu um erro ao tentar aceder os dados");
// 				}
// 				else{
					
// 					jobcards.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1, ttnumber_status:1, jobcard_wait:1}, function(err, dataJobcaaards){
	
// 						if(err){
// 							console.log("ocorreu um erro ao tentar aceder os dados")
// 						}
// 						else{
	
// 							jobcardprojects.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1, ttnumber_status:1, jobcard_wait:1}, function(err, dataProjects){
	
// 								if(err){
// 									console.log("ocorreu um erro ao tentar aceder os dados")
// 								}
// 								else{
// 									jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, dataJobcard){
// 										if(err){
// 											console.log("ocorreu um erro ao tentar aceder os dados")
// 										}else{
	
// 											// console.log(dataJobcard)
// 											var total = dataJobcard;
// 											var totalcont = Math.ceil(total/50);
// 											for (let j = 0; j < data.length; j++) {
// 												// if ((data[j].jobcard_estadoactual == "On route") || (data[j].jobcard_estadoactual == "On site") || (data[j].jobcard_estadoactual == "Awaiting approval") || (data[j].jobcard_estadoactual == "Approved")) {
// 												if( (data[j].ttnumber_status == "In Progress") && (data[j].jobcard_estadoactual != "On hold")){
// 													permissao = 1;
// 												}
// 											}
// 											console.log(data);
// 											console.log(permissao);
// 											res.render("ttnumber_home", {DataU:userData, permissao, dadostotalnr:totalcont, dadoscontroladordecr:0,dadoscontroladorincr:1, DadosProjects:JSON.stringify(dataProjects), DadosJobcards:JSON.stringify(dataJobcaaards), Jobcards:data, title: 'EAGLEI'});
// 										}
// 									}).exec();
									
// 								}
	
// 							}).lean();
							
// 						}
	
// 					}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();

// 				}
// 			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
// 		break;

// 		case 2:
// 			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, data){
// 				if (err) {
// 					console.log("Ocorreu um erro ao tentar aceder os dados");
// 				}
// 				else{
// 					jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, dataJobcard){
// 						if (err) {
// 							console.log("ocorreu um erro ao tentar aceder os dados");
// 						}
// 						else{
// 							var total = dataJobcard;
// 							var totalcont = Math.ceil(total/50);
// 							for (let j = 0; j < data.length; j++) {
// 								// if ((data[j].jobcard_estadoactual == "On route") || (data[j].jobcard_estadoactual == "On site") || (data[j].jobcard_estadoactual == "Awaiting approval") || (data[j].jobcard_estadoactual == "Approved")) {
// 								if( (data[j].ttnumber_status == "In Progress") && (data[j].jobcard_estadoactual != "On hold")){
// 									permissao = 1;
// 								}
// 							}
// 							res.render("ttnumber_home", {DataU:userData, permissao, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
// 						}
// 					}).exec();
// 				}
// 			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
// 		break;
	
// 		case 3:
// 			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", jobcard_regiao:userData.regiao, jobcard_departamento:userDept}, function(err, data){
// 				if (err) {
// 					console.log("Ocorreu um erro ao tentar aceder os dados");
// 				}
// 				else{
// 					jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", jobcard_regiao:userData.regiao, jobcard_departamento:userDept}, function(err, dataJobcard){
// 						if (err) {
// 							console.log("ocorreu um erro ao tentar aceder os dados");
// 						}
// 						else{
// 							var total = dataJobcard;
// 							var totalcont = Math.ceil(total/50);
// 							res.render("ttnumber_home", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
// 						}
// 					}).exec();
// 				}
// 			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
// 		break;
		
// 		case 4: 
// 			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"In Progress"}, function(err, data){
// 				if (err) {
// 					console.log("Ocorreu um erro ao tentar aceder os dados");
// 				}
// 				else{
// 					jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"In Progress"}, function(err, dataJobcard){
// 						if (err) {
// 							console.log("ocorreu um erro ao tentar aceder os dados");
// 						}
// 						else{
// 							var total = dataJobcard;
// 							var totalcont = Math.ceil(total/50);
// 							res.render("ttnumber_home", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
// 						}
// 					}).exec();
// 				}
// 			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
// 		break;

// 		case 5: 
// 			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", jobcard_clientenome: "Vm,Sa"}, function(err, data){
// 				if (err) {
// 					console.log("Ocorreu um erro ao tentar aceder os dados");
// 				}
// 				else{
// 					jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", jobcard_clientenome: "Vm,Sa"}, function(err, dataJobcard){
// 						if (err) {
// 							console.log("ocorreu um erro ao tentar aceder os dados");
// 						}
// 						else{
// 							var total = dataJobcard;
// 							var totalcont = Math.ceil(total/50);
// 							res.render("ttnumber_home", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
// 						}
// 					}).exec();
// 				}
// 			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
// 		break;

// 		case 6: 
// 			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", jobcard_departamento:userDept}, function(err, data){
// 				if (err) {
// 					console.log("Ocorreu um erro ao tentar aceder os dados");
// 				}
// 				else{
// 					jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", jobcard_departamento:userDept}, function(err, dataJobcard){
// 						if (err) {
// 							console.log("ocorreu um erro ao tentar aceder os dados");
// 						}
// 						else{
// 							var total = dataJobcard;
// 							var totalcont = Math.ceil(total/50);
// 							res.render("ttnumber_home", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
// 						}
// 					}).exec();
// 				}
// 			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
// 		break;

// 	}

// });

router.get('/ttnumberhome/inprogress', async function(req, res) {
	console.log(req.session.usuario.funcao);
	var userData=req.session.usuario;
	var nome = userData.nome;
	var permissao = 0;
	var userDept = userData.departamento;

	var controladorfuncao = 0;

	if (userData.funcao == "Tecnico" || (userData.funcao == "Assistant")) {
		controladorfuncao = 1;
	}else if(userData.funcao == "regional_manager"){
		controladorfuncao = 2;
	}else if (userData.verificador_funcao == "Regional Manager") {
		controladorfuncao = 3;
	}else if((userData.funcao == "Call Center") || (userData.funcao == "Back Office") || (userData.nivel_acesso == "admin") || (userData.funcao == "IT Officer")){
		controladorfuncao = 4;
	}else if(userData.nome == "Guest"){
		controladorfuncao = 5;
	}else if (userData.funcao == "Manager") {
		controladorfuncao = 6;
	};

	console.log(userData.funcao + " do departamento " + userDept);
	console.log(controladorfuncao);
	switch (controladorfuncao) {
		case 1:
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					
					jobcards.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1, ttnumber_status:1, jobcard_wait:1}, function(err, dataJobcaaards){
	
						if(err){
							console.log("ocorreu um erro ao tentar aceder os dados")
						}
						else{
	
							jobcardprojects.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1, ttnumber_status:1, jobcard_wait:1}, function(err, dataProjects){
	
								if(err){
									console.log("ocorreu um erro ao tentar aceder os dados")
								}
								else{
									jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, dataJobcard){
										if(err){
											console.log("ocorreu um erro ao tentar aceder os dados")
										}else{
	
											// console.log(dataJobcard)
											var total = dataJobcard;
											var totalcont = Math.ceil(total/50);
											for (let j = 0; j < data.length; j++) {
												// if ((data[j].jobcard_estadoactual == "On route") || (data[j].jobcard_estadoactual == "On site") || (data[j].jobcard_estadoactual == "Awaiting approval") || (data[j].jobcard_estadoactual == "Approved")) {
												if( (data[j].ttnumber_status == "In Progress") && (data[j].jobcard_estadoactual != "On hold")){
													permissao = 1;
												}
											}
											console.log(data);
											console.log(permissao);
											res.render("ttnumber_home", {DataU:userData, permissao, dadostotalnr:totalcont, dadoscontroladordecr:0,dadoscontroladorincr:1, DadosProjects:JSON.stringify(dataProjects), DadosJobcards:JSON.stringify(dataJobcaaards), Jobcards:data, title: 'EAGLEI'});
										}
									}).exec();
									
								}
	
							}).lean();
							
						}
	
					}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();

				}
			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
		break;

		case 2:
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, dataJobcard){
						if (err) {
							console.log("ocorreu um erro ao tentar aceder os dados");
						}
						else{
							var total = dataJobcard;
							var totalcont = Math.ceil(total/50);
							for (let j = 0; j < data.length; j++) {
								// if ((data[j].jobcard_estadoactual == "On route") || (data[j].jobcard_estadoactual == "On site") || (data[j].jobcard_estadoactual == "Awaiting approval") || (data[j].jobcard_estadoactual == "Approved")) {
								if( (data[j].ttnumber_status == "In Progress") && (data[j].jobcard_estadoactual != "On hold")){
									permissao = 1;
								}
							}
							res.render("ttnumber_home", {DataU:userData, permissao, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
						}
					}).exec();
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
		break;
	
		case 3:
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", jobcard_regiao:userData.regiao, jobcard_departamento:userDept}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", jobcard_regiao:userData.regiao, jobcard_departamento:userDept}, function(err, dataJobcard){
						if (err) {
							console.log("ocorreu um erro ao tentar aceder os dados");
						}
						else{
							var total = dataJobcard;
							var totalcont = Math.ceil(total/50);
							res.render("ttnumber_home", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
						}
					}).exec();
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
		break;
		
		case 4:
            await hvac_db.find({status:"In Progress"}, async function(err, datahvac){
                if (err) {
                    console.log("Ocorreu um erro ao tentar aceder os dados dos novos jobcards HVAC")
                } else {
                    dataCountHvac = await hvac_db.countDocuments({status:"In Progress"});

                    await jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"In Progress"}, async function(err, data){
                        if (err) {
                            console.log("Ocorreu um erro ao tentar aceder os dados");
                        }
                        else{
                            jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"In Progress"}, function(err, dataJobcard){
                                if (err) {
                                    console.log("ocorreu um erro ao tentar aceder os dados");
                                }
                                else{
                                    // var estee= hvaccollecao.concat(data);
                                    var total = dataJobcard + dataCountHvac;
                                    console.log("O número total de jobs é ", total);
                                    var totalcont = Math.ceil(total/50);
                                    data = datahvac.concat(data);
                                    console.log("Estes são os jobcards da cena ", data);
                                    // console.log(estee)
                                    res.render("ttnumber_home", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
                                }
                            }).exec();
                        }
                    }).sort({data_ultimaactualizacaojobcard:-1}).limit(45).lean();
                }
            })

			// jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"In Progress"}, function(err, data){
			// 	if (err) {
			// 		console.log("Ocorreu um erro ao tentar aceder os dados");
			// 	}
			// 	else{
			// 		jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"In Progress"}, function(err, dataJobcard){
			// 			if (err) {
			// 				console.log("ocorreu um erro ao tentar aceder os dados");
			// 			}
			// 			else{
			// 				var total = dataJobcard;
			// 				var totalcont = Math.ceil(total/50);
			// 				res.render("ttnumber_home", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
			// 			}
			// 		}).exec();
			// 	}
			// }).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
		break;

		case 5: 
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", jobcard_clientenome: "Vm,Sa"}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", jobcard_clientenome: "Vm,Sa"}, function(err, dataJobcard){
						if (err) {
							console.log("ocorreu um erro ao tentar aceder os dados");
						}
						else{
							var total = dataJobcard;
							var totalcont = Math.ceil(total/50);
							res.render("ttnumber_home", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
						}
					}).exec();
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
		break;

		case 6: 
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", jobcard_departamento:userDept}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", jobcard_departamento:userDept}, function(err, dataJobcard){
						if (err) {
							console.log("ocorreu um erro ao tentar aceder os dados");
						}
						else{
							var total = dataJobcard;
							var totalcont = Math.ceil(total/50);
							res.render("ttnumber_home", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
						}
					}).exec();
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
		break;

	}

});

router.post('/tthomecompletepesquisa', async function(req, res) {
	var userData=req.session.usuario;
	var nome = userData.nome;
	var siteinfocont = req.body;
	var tthomecont = req.body;
	var pesquisador = siteinfocont.pesquisadorsite;
	var controlador = tthomecont.pesquisador.toLowerCase();
	var firstLetter = controlador.charAt(0).toUpperCase();
	var rest = controlador.slice(1);
	var controladorupper = firstLetter.concat(rest);

	console.log(controlador, controladorupper);
	var controladornr = 0;

	if(isNaN(controlador)){
		controladornr = 0;
		console.log(parseInt(controladornr))
	}else{
		controladornr = controlador;
		var ttnr = parseInt(controlador);
	}

	if (userData.funcao == "Tecnico" || (userData.funcao == "Assistant")) {
		controladorfuncao = 1;
	}else if(userData.funcao == "regional_manager"){
		controladorfuncao = 2;
	}else if (userData.verificador_funcao == "Regional Manager") {
		controladorfuncao = 3;
	}else if((userData.funcao == "Call Center") || (userData.funcao == "Back Office") || (userData.nivel_acesso == "admin") || (userData.funcao == "IT Officer")){
		controladorfuncao = 4;
	}else if(userData.nome == "Guest"){
		controladorfuncao = 5;
	}else if (userData.funcao == "Manager") {
		controladorfuncao = 6;
	};

	switch (controladorfuncao) {
		case 1:
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"Complete", jobcard_tecniconome: userData.nome, $or:[{jobcard_site:controlador}, {jobcard_ttnumber: ttnr} ]}, function(err, data){
				if(err){
					console.log(err);
				}
				else{
					var userData=req.session.usuario;
					res.render("alljobcards_pesquisa", {DataU:userData, AllJobcardsHistory:data, title: 'EAGLEI'});
				}
			});
		break;
		case 2: 
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"Complete", $or:[{jobcard_site:controlador}, {jobcard_ttnumber: ttnr}, {jobcard_tecniconome: {$regex: controladorupper}}, {jobcard_tecniconome: pesquisador} ]}, function(err, data){
			
				if(err){
					console.log(err);
				}
				else{
					var userData=req.session.usuario;
					res.render("alljobcards_pesquisa", {DataU:userData, AllJobcardsHistory:data, title: 'EAGLEI'});
				}
			});
		break;
		case 3:
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"Complete", jobcard_regiao:userData.regiao, $or:[{jobcard_site:controlador}, {jobcard_ttnumber: ttnr}, {jobcard_tecniconome: {$regex: controladorupper}}, {jobcard_tecniconome: pesquisador} ]}, function(err, data){
				if(err){
					console.log(err);
				}
				else{
					var userData=req.session.usuario;
					res.render("alljobcards_pesquisa", {DataU:userData, AllJobcardsHistory:data, title: 'EAGLEI'});
				}
			});
		break;
		case 4:
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"Complete", $or:[{jobcard_site:controlador}, {jobcard_ttnumber: ttnr}, {jobcard_tecniconome: {$regex: controladorupper}}, {jobcard_tecniconome: pesquisador} ]}, function(err, data){
				if(err){
					console.log(err);
				}
				else{
					var userData=req.session.usuario;
					res.render("alljobcards_pesquisa", {DataU:userData, AllJobcardsHistory:data, title: 'EAGLEI'});
				}
			});
		break;
		case 5:
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"Complete", jobcard_clientenome:"Vm,Sa",$or:[{jobcard_site:controlador}, {jobcard_ttnumber: ttnr}, {jobcard_tecniconome: {$regex: controladorupper}}, {jobcard_tecniconome: pesquisador} ]}, function(err, data){
				if(err){
					console.log(err);
				}
				else{
					var userData=req.session.usuario;
					res.render("alljobcards_pesquisa", {DataU:userData, AllJobcardsHistory:data, title: 'EAGLEI'});
				}
			});
		break;
		case 6:
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"Complete", jobcard_departamento:userData.departamento, $or:[{jobcard_site:controlador}, {jobcard_ttnumber: ttnr}, {jobcard_tecniconome: {$regex: controladorupper}}, {jobcard_tecniconome: pesquisador} ]}, function(err, data){
				if(err){
					console.log(err);
				}
				else{
					var userData=req.session.usuario;
					res.render("alljobcards_pesquisa", {DataU:userData, AllJobcardsHistory:data, title: 'EAGLEI'});
				}
			});
		break;
	};


	// if((userData.funcao == "Call Center") || (userData.funcao == "Back Office") || (userData.nivel_acesso == "admin") || (userData.nome == "Hamilton Sitoe") || (userData.nome == "Luis Brazuna") || (userData.nome == "Antonio Biquiza")){

    //     jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"Complete", $or:[{jobcard_ttnumber:parseInt(controladornr)}, {jobcard_site:controlador}, {jobcard_tecniconome: {$regex:controladorupper}}, {jobcard_clientenome: {$regex:controladorupper}}, {jobcard_remedialaction: {$regex:controladorupper}}, {jobcard_call: {$regex:controladorupper}}, {jobcard_datareporte: {$regex:controlador}} ]}, function(err, data){
    //         if(err){
    //             console.log("ocorreu um erro ao tentar aceder os dados")
    //         }
    //         else{

    //             jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"Complete", $or:[{jobcard_ttnumber:parseInt(controladornr)}, {jobcard_site:controlador}]}, function(err, dataJobcard){
    //                 if(err){
    //                     console.log("ocorreu um erro ao tentar aceder os dados")
    //                 }else{

    //                     var total = dataJobcard;
    //                     var totalcont = Math.ceil(total/50);
    //                     // console.log(totalcont)

    //                     res.render("ttnumber_homecomplete", {DataU:userData, Dadospesquisa:controlador, dadostotalnr:totalcont, dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});

    //                 }
    //             }).exec();
    //         }
    //     }).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();

    // }else{

    //     jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"Complete", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}, {jobcard_ttnumber:parseInt(controladornr)}, {jobcard_site:controlador}]}, function(err, data){
    //         if(err){
    //             console.log("ocorreu um erro ao tentar aceder os dados")
    //         }
    //         else{

    //             jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"Complete", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}, {jobcard_ttnumber:parseInt(controladornr)}, {jobcard_site:controlador}]}, function(err, dataJobcard){
    //                 if(err){
    //                     console.log("ocorreu um erro ao tentar aceder os dados")
    //                 }else{

    //                     var total = dataJobcard;
    //                     var totalcont = Math.ceil(total/50);
    //                     // console.log(totalcont)

    //                     res.render("ttnumber_homecomplete", {DataU:userData, Dadospesquisa:controlador, dadostotalnr:totalcont, dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});

    //                 }
    //             }).exec();
    //         }
    //     }).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
    // }
	
});

router.get('/ttnumberhome/complete/previouspage/:contador/:totalnr', function(req, res) {

	var userData=req.session.usuario;
	var nome = userData.nome;
	var incrementadr = parseInt(req.params.contador) - 1;
	var contador = incrementadr * 50;
	var userDept = userData.departamento;
	
	console.log(contador)
	console.log(incrementadr)
	
	var controladorfuncao = 0;

	if (userData.funcao == "Tecnico" || (userData.funcao == "Assistant")) {
		controladorfuncao = 1;
	}else if(userData.funcao == "regional_manager"){
		controladorfuncao = 2;
	}else if (userData.verificador_funcao == "Regional Manager") {
		controladorfuncao = 3;
	}else if((userData.funcao == "Call Center") || (userData.funcao == "Back Office") || (userData.nivel_acesso == "admin") || (userData.funcao == "IT Officer")){
		controladorfuncao = 4;
	}else if(userData.nome == "Guest"){
		controladorfuncao = 5;
	}else if (userData.funcao == "Manager") {
		controladorfuncao = 6;
	};

	switch (controladorfuncao) {
		case 1:
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"Complete", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
					
					res.render("ttnumber_homecomplete", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:incrementadr, dadoscontroladorincr:parseInt(req.params.contador), Jobcards:data, title: 'EAGLEI'});
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		
		break;

		case 2:
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"Complete", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
					
					res.render("ttnumber_homecomplete", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:incrementadr, dadoscontroladorincr:parseInt(req.params.contador), Jobcards:data, title: 'EAGLEI'});
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		
		break;
	
		case 3:
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"Complete", jobcard_regiao:userData.regiao, jobcard_departamento:userDept}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					
					res.render("ttnumber_homecomplete", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:parseInt(req.params.contador), dadoscontroladorincr:parseInt(req.params.contador), Jobcards:data, title: 'EAGLEI'});
					
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;
		
		case 4: 
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"Complete"}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
				
					res.render("ttnumber_homecomplete", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:parseInt(req.params.contador), dadoscontroladorincr:parseInt(req.params.contador), Jobcards:data, title: 'EAGLEI'});
				
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;

		case 5: 
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"Complete", jobcard_clientenome: "Vm,Sa"}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
				
					res.render("ttnumber_homecomplete", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:parseInt(req.params.contador), dadoscontroladorincr:parseInt(req.params.contador), Jobcards:data, title: 'EAGLEI'});
				
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;

		case 6: 
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"Complete", jobcard_departamento:userDept}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
				
					res.render("ttnumber_homecomplete", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:parseInt(req.params.contador), dadoscontroladorincr:parseInt(req.params.contador), Jobcards:data, title: 'EAGLEI'});
				
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;

	}

});

router.get('/ttnumberhome/complete/nextpage/:contador/:totalnr', function(req, res) {

	var userData=req.session.usuario;
	var nome = userData.nome;
	var contador = parseInt(req.params.contador) * 50;
	var incrementadr = parseInt(req.params.contador) + 1;
	console.log(contador)
	console.log(incrementadr)
	var userDept = userData.departamento;
	
	var controladorfuncao = 0;

	if (userData.funcao == "Tecnico" || (userData.funcao == "Assistant")) {
		controladorfuncao = 1;
	}else if(userData.funcao == "regional_manager"){
		controladorfuncao = 2;
	}else if (userData.verificador_funcao == "Regional Manager") {
		controladorfuncao = 3;
	}else if((userData.funcao == "Call Center") || (userData.funcao == "Back Office") || (userData.nivel_acesso == "admin") || (userData.funcao == "IT Officer")){
		controladorfuncao = 4;
	}else if(userData.nome == "Guest"){
		controladorfuncao = 5;
	}else if (userData.funcao == "Manager") {
		controladorfuncao = 6;
	};

	switch (controladorfuncao) {
		case 1:
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"Complete", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
					
					res.render("ttnumber_homecomplete", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr),dadoscontroladordecr:parseInt(req.params.contador),dadoscontroladorincr:incrementadr, Jobcards:data, title: 'EAGLEI'});
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;

		case 2:
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"Complete", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
					
					res.render("ttnumber_homecomplete", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr),dadoscontroladordecr:parseInt(req.params.contador),dadoscontroladorincr:incrementadr, Jobcards:data, title: 'EAGLEI'});
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;
	
		case 3:
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"Complete", jobcard_regiao:userData.regiao, jobcard_departamento:userDept}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					
					res.render("ttnumber_homecomplete", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr),dadoscontroladordecr:parseInt(req.params.contador),dadoscontroladorincr:incrementadr, Jobcards:data, title: 'EAGLEI'});
					
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;
		
		case 4: 
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"Complete"}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
				
					res.render("ttnumber_homecomplete", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr),dadoscontroladordecr:parseInt(req.params.contador),dadoscontroladorincr:incrementadr, Jobcards:data, title: 'EAGLEI'});
					
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;

		case 5: 
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"Complete", jobcard_clientenome: "Vm,Sa"}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
				
					res.render("ttnumber_homecomplete", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr),dadoscontroladordecr:parseInt(req.params.contador),dadoscontroladorincr:incrementadr, Jobcards:data, title: 'EAGLEI'});
					
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;

		case 6: 
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"Complete", jobcard_departamento:userDept}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
				
					res.render("ttnumber_homecomplete", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr),dadoscontroladordecr:parseInt(req.params.contador),dadoscontroladorincr:incrementadr, Jobcards:data, title: 'EAGLEI'});
					
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
		break;
	}
	
});

router.get('/ttnumberhome/complete', function(req, res) {
	console.log(req.session.usuario)
	var userData=req.session.usuario;
	var nome = userData.nome;
	var userDept = userData.departamento;

	var controladorfuncao = 0;

	if (userData.funcao == "Tecnico" || (userData.funcao == "Assistant")) {
		controladorfuncao = 1;
	}else if(userData.funcao == "regional_manager"){
		controladorfuncao = 2;
	}else if (userData.verificador_funcao == "Regional Manager") {
		controladorfuncao = 3;
	}else if((userData.funcao == "Call Center") || (userData.funcao == "Back Office") || (userData.nivel_acesso == "admin") || (userData.funcao == "IT Officer")){
		controladorfuncao = 4;
	}else if(userData.nome == "Guest"){
		controladorfuncao = 5;
	}else if (userData.funcao == "Manager") {
		controladorfuncao = 6;
	};

	console.log(userData.funcao + " do departamento " + userDept);

	switch (controladorfuncao) {
		case 1:
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"Complete", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
	
					jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"Complete", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, dataJobcard){
						if(err){
							console.log("ocorreu um erro ao tentar aceder os dados")
						}else{
	
							var total = dataJobcard;
							var totalcont = Math.ceil(total/50);
							// console.log(totalcont)
	
							res.render("ttnumber_homecomplete", {DataU:userData, dadostotalnr:totalcont, dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
	
						}
					}).exec();
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
		break;

		case 2:
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"Complete", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
	
					jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"Complete", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, dataJobcard){
						if(err){
							console.log("ocorreu um erro ao tentar aceder os dados")
						}else{
	
							var total = dataJobcard;
							var totalcont = Math.ceil(total/50);
	
							res.render("ttnumber_homecomplete", {DataU:userData, dadostotalnr:totalcont, dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
	
						}
					}).exec();
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
		break;
	
		case 3:
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"Complete", jobcard_regiao:userData.regiao, jobcard_departamento:userDept}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"Complete", jobcard_regiao:userData.regiao, jobcard_departamento:userDept}, function(err, dataJobcard){
						if (err) {
							console.log("ocorreu um erro ao tentar aceder os dados");
						}
						else{
							var total = dataJobcard;
							var totalcont = Math.ceil(total/50);
							res.render("ttnumber_homecomplete", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
						}
					}).exec();
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
		break;
		
		case 4: 
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"Complete"}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"Complete"}, function(err, dataJobcard){
						if (err) {
							console.log("ocorreu um erro ao tentar aceder os dados");
						}
						else{
							var total = dataJobcard;
							var totalcont = Math.ceil(total/50);
							res.render("ttnumber_homecomplete", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
						}
					}).exec();
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
		break;

		case 5: 
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"Complete", jobcard_clientenome: "Vm,Sa"}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"Complete", jobcard_clientenome: "Vm,Sa"}, function(err, dataJobcard){
						if (err) {
							console.log("ocorreu um erro ao tentar aceder os dados");
						}
						else{
							var total = dataJobcard;
							var totalcont = Math.ceil(total/50);
							res.render("ttnumber_homecomplete", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
						}
					}).exec();
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
		break;

		case 6: 
			jobcards.find({jobcard_jobtype:"Callout", ttnumber_status:"Complete", jobcard_departamento:userDept}, function(err, data){
				if (err) {
					console.log("Ocorreu um erro ao tentar aceder os dados");
				}
				else{
					jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"Complete", jobcard_departamento:userDept}, function(err, dataJobcard){
						if (err) {
							console.log("ocorreu um erro ao tentar aceder os dados");
						}
						else{
							var total = dataJobcard;
							var totalcont = Math.ceil(total/50);
							res.render("ttnumber_homecomplete", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
						}
					}).exec();
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
		break;

	}
	
});

router.get('/ttnumberhome/tobeinvoiced', function(req, res) {

	var userData=req.session.usuario;
	var nome = userData.nome;
	var calljobcard = ["Project"];
	

	if((userData.funcao == "Call Center") || (userData.funcao == "Back Office") || (userData.nivel_acesso == "admin") || (userData.nome == "Hamilton Sitoe") || (userData.nome == "Luis Brazuna") || (userData.nome == "Antonio Biquiza")){

		jobcards.find({jobcard_jobtype:"Callout", jobcard_call:{$ne:calljobcard}, ttnumber_status:"To be Invoiced"}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{

				res.render("ttnumber_home", {DataU:userData, Jobcards:data, title: 'EAGLEI'});

			}
		}).sort({_id:-1});

	}else{

		jobcards.find({jobcard_jobtype:"Callout", jobcard_call:{$ne:calljobcard}, ttnumber_status:"To be Invoiced", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				
				res.render("ttnumber_home", {DataU:userData, Jobcards:data, title: 'EAGLEI'});
			}
		}).sort({_id:-1});;
	}
});

router.get("/detalhesChegadaSitePlanned/:id",  function(req, res){
	var userData= req.session.usuario;
	// var referencia = req.params.id
	
	
	jobcards.find({}, {jobcard_ttnumber:1}, function(err, dataJobcards){
		
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}
		else{

			res.render("jobcard_detalhesChegadaSitePlanned", {DataU:userData, Referencia:req.params.id, Jobcards:JSON.stringify(dataJobcards), title: 'EAGLEI'});

		}
	}).lean();
	

});

router.get('/jobcardprojectshome/newform', function(req, res) {
	var userData=req.session.usuario;
	var nome = userData.nome;


	clientes.find({},{cliente_nome:1, cliente_filial:1, cliente_telefone:1}, function(err, dataClientes){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}else{

			usuarios.find({nivel_acesso:{$ne:"admin"} }, {nome:1}, function(err, dataUsuarios){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}else{

					siteinfos.aggregate([{$group:{_id:"$siteinfo_clientid", sites:{$push:{numero:"$siteinfo_sitenum", ref:"$_id"}}}}], function (err, dataSiteCliente) {
						if(err){
							console.log("ocorreu um erro ao tentar aceder os dados")
						}else{

							function compare( a, b ) {
					          if ( a.numero < b.numero ){
					            return -1;
					          }
					          if ( a.numero > b.numero ){
					            return 1;
					          }
					          return 0;
							}
							      

						    for(var i = 0; i < dataSiteCliente.length; i++){

						    	dataSiteCliente[i].sites.sort(compare);

						    }

							jobcardprojects.find({},{jobcard_projectnumber:1}, function(err, dataJobcardsProjects){
								if(err){
									console.log("ocorreu um erro ao tentar aceder os dados")
								}else{

									res.render("jobcardprojects_newform", {DataU:userData, SiteCliente:JSON.stringify(dataSiteCliente), DadosClientes:JSON.stringify(dataClientes), DadosProjectos:JSON.stringify(dataJobcardsProjects),Clientes:dataClientes, Usuarios:dataUsuarios,title: 'EAGLEI'});
								}
							}).lean();

								

						}
					});


					
				}
			}).sort({ nome: 1 }).lean();

			

		}
	}).sort({ cliente_nome: 1 }).lean();
		
	
});


router.post('/jobcardprojectshomenewpesquisa', async function(req, res) {
	var userData=req.session.usuario;
	var nome = userData.nome;
	var tthomecont = req.body;
	var controlador = tthomecont.pesquisador;
	

	jobcardprojects.find({ttnumber_status:"New",$or:[{jobcard_projectnumber:controlador}, {jobcard_site:controlador}, {jobcard_tecniconome:controlador}, {jobcard_clientenome:controlador}, {jobcard_datacreated:controlador}, {jobcard_regiao:controlador}, {jobcard_estadoactual:controlador}]}, function(err, data){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados" + err)
		}
		else{
			res.render("jobcardprojects_home", {DataU:userData, Dadospesquisa:controlador, Projects:data, title: 'EAGLEI'});
		}
	}).sort({ data_ultimaactualizacaojobcard:-1 }).limit(100).lean();
	
 
});


router.get('/jobcardprojectshome/new/previouspage/:contador/:totalnr', function(req, res) {

	var userData=req.session.usuario;
	var nome = userData.nome;
	var incrementadr = parseInt(req.params.contador) - 1;
	var contador = incrementadr * 50;
	
	console.log(contador)
	console.log(incrementadr)
	
	if((userData.funcao == "Call Center") || (userData.funcao == "Back Office") || (userData.nivel_acesso == "admin") || (userData.nome == "Hamilton Sitoe") || (userData.nome == "Luis Brazuna") || (userData.nome == "Antonio Biquiza")){

		jobcardprojects.find({ttnumber_status:"New"}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{

				res.render("jobcardprojects_home", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:incrementadr, dadoscontroladorincr:parseInt(req.params.contador), Projects:data, title: 'EAGLEI'});
				
			}
		}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();

	}else{

		jobcardprojects.find({ttnumber_status:"New", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, data){
			
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{

				// res.render("ttnumber_home", {DataU:userData, dadostotalnr:totalcont, dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});

				jobcards.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1}, function(err, dataJobcaaards){

					if(err){
						console.log("ocorreu um erro ao tentar aceder os dados")
					}
					else{

						jobcardprojects.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1}, function(err, dataProjects){

							if(err){
								console.log("ocorreu um erro ao tentar aceder os dados")
							}
							else{

								res.render("jobcardprojects_home", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:incrementadr, dadoscontroladorincr:parseInt(req.params.contador), DadosProjects:JSON.stringify(dataProjects), DadosJobcards:JSON.stringify(dataJobcaaards), Projects:data, title: 'EAGLEI'});
							}

						}).lean();
						
					}

				}).lean();

			}

		}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
	}
	
});


router.get('/jobcardprojectshome/new/nextpage/:contador/:totalnr', function(req, res) {

	var userData=req.session.usuario;
	var nome = userData.nome;
	var contador = parseInt(req.params.contador) * 50;
	var incrementadr = parseInt(req.params.contador) + 1;
	console.log(contador)
	console.log(incrementadr)
	
	if((userData.funcao == "Call Center") || (userData.funcao == "Back Office") || (userData.nivel_acesso == "admin") || (userData.nome == "Hamilton Sitoe") || (userData.nome == "Luis Brazuna") || (userData.nome == "Antonio Biquiza")){

		jobcardprojects.find({ttnumber_status:"New"}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{

				res.render("jobcardprojects_home", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr),dadoscontroladordecr:parseInt(req.params.contador),dadoscontroladorincr:incrementadr, Projects:data, title: 'EAGLEI'});
				
			}
		}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();

	}else{

		jobcardprojects.find({ttnumber_status:"New", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, data){
			
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{

				// res.render("ttnumber_home", {DataU:userData, dadostotalnr:totalcont, dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});

				jobcards.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1}, function(err, dataJobcaaards){

					if(err){
						console.log("ocorreu um erro ao tentar aceder os dados")
					}
					else{

						jobcardprojects.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1}, function(err, dataProjects){

							if(err){
								console.log("ocorreu um erro ao tentar aceder os dados")
							}
							else{

								res.render("jobcardprojects_home", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:parseInt(req.params.contador),dadoscontroladorincr:incrementadr, DadosProjects:JSON.stringify(dataProjects), DadosJobcards:JSON.stringify(dataJobcaaards), Projects:data, title: 'EAGLEI'});
							}

						}).lean();
						
					}

				}).lean();

			}

		}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
	}
	
});


router.get('/jobcardprojectshome/new', function(req, res) {

	var userData=req.session.usuario;
	var nome = userData.nome;

	var controladorfuncao = 0;

	if (userData.funcao == "Tecnico" || userData.funcao == "Assistant") {
		controladorfuncao = 1;
	}else if(userData.funcao == "regional_manager"){
		controladorfuncao = 2;
	}else if (userData.verificador_funcao == "Regional Manager") {
		controladorfuncao = 3;
	}else if((userData.funcao = "Call Center") || (userData.funcao = "Back Office") || (userData.nivel_acesso = "admin") (userData.funcao == "Manager")){
		controladorfuncao = 4;
	}else if(userData.nome == "Guest"){
		controladorfuncao = 5;
	};

	console.log(controladorfuncao);

	switch(controladorfuncao){
		case 1:
			jobcardprojects.find({ttnumber_status:"New", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
		
					jobcardprojects.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1}, function(err, dataProjects){
						if(err){
							console.log("ocorreu um erro ao tentar aceder os dados")
						}else{
	
							jobcards.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1}, function(err, dataJobcards){
								if(err){
									console.log("ocorreu um erro ao tentar aceder os dados")
								}else{
	
									jobcardprojects.countDocuments({ttnumber_status:"New", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, dataProjects1){
										if(err){
											console.log("ocorreu um erro ao tentar aceder os dados")
										}else{
	
											var total = dataProjects1;
											var totalcont = Math.ceil(total/50);
	
											res.render("jobcardprojects_home", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, DadosProjects:JSON.stringify(dataProjects), DadosJobcards:JSON.stringify(dataJobcards), Projects:data, title: 'EAGLEI'});
										}
									}).exec();
									
									
								}
							}).lean();
	
							
						}
					}).lean();
	
				}
	
			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
		break;

		case 2:
			jobcardprojects.find({ttnumber_status:"New", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
		
					jobcardprojects.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1}, function(err, dataProjects){
						if(err){
							console.log("ocorreu um erro ao tentar aceder os dados")
						}else{
	
							jobcards.find({ttnumber_status:"In Progress"}, {jobcard_sitedeparturedate:1, jobcard_tecniconome:1}, function(err, dataJobcards){
								if(err){
									console.log("ocorreu um erro ao tentar aceder os dados")
								}else{
	
									jobcardprojects.countDocuments({ttnumber_status:"New", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, dataProjects1){
										if(err){
											console.log("ocorreu um erro ao tentar aceder os dados")
										}else{
	
											var total = dataProjects1;
											var totalcont = Math.ceil(total/50);
	
											res.render("jobcardprojects_home", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, DadosProjects:JSON.stringify(dataProjects), DadosJobcards:JSON.stringify(dataJobcards), Projects:data, title: 'EAGLEI'});
										}
									}).exec();
									
									
								}
							}).lean();
	
							
						}
					}).lean();
	
				}
	
			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
		break;

		case 3:
			jobcardprojects.find({ttnumber_status:"New"}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
	
					jobcardprojects.countDocuments({ttnumber_status:"New"}, function(err, dataProjects){
						if(err){
							console.log("ocorreu um erro ao tentar aceder os dados")
						}else{
	
							var total = dataProjects;
							var totalcont = Math.ceil(total/50);
							//console.log(totalcont)
	
							res.render("jobcardprojects_home", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Projects:data, title: 'EAGLEI'});
						}
	
					}).exec();
	
					
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
		break;

		case 4:
			jobcardprojects.find({ttnumber_status:"New"}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
	
					jobcardprojects.countDocuments({ttnumber_status:"New"}, function(err, dataProjects){
						if(err){
							console.log("ocorreu um erro ao tentar aceder os dados")
						}else{
	
							var total = dataProjects;
							var totalcont = Math.ceil(total/50);
							//console.log(totalcont)
	
							res.render("jobcardprojects_home", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Projects:data, title: 'EAGLEI'});
						}
	
					}).exec();
	
					
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
		break;

		case 5:
			jobcardprojects.find({ttnumber_status:"New", jobcard_clientenome:"Vm,Sa"}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
	
					jobcardprojects.countDocuments({ttnumber_status:"New", jobcard_clientenome:"Vm,Sa"}, function(err, dataProjects){
						if(err){
							console.log("ocorreu um erro ao tentar aceder os dados")
						}else{
	
							var total = dataProjects;
							var totalcont = Math.ceil(total/50);
							//console.log(totalcont)
	
							res.render("jobcardprojects_home", {DataU:userData, dadostotalnr:totalcont,dadoscontroladordecr:0,dadoscontroladorincr:1, Projects:data, title: 'EAGLEI'});
						}
	
					}).exec();
	
					
				}
			}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
		break;
	}

});


router.post('/jobcardprojectshomeinprogresspesquisa', async function(req, res) {
	var userData=req.session.usuario;
	var nome = userData.nome;
	var tthomecont = req.body;
	var controlador = tthomecont.pesquisador;

	jobcardprojects.find({ttnumber_status:"In Progress",$or:[{jobcard_projectnumber:controladornr}, {jobcard_site:controlador}, {jobcard_tecniconome:controlador}, {jobcard_clientenome:controlador}, {jobcard_datacreated:controlador}, {jobcard_regiao:controlador}, {jobcard_estadoactual:controlador}]}, function(err, data){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados" + err)
		}
		else{
			res.render("jobcardprojects_home", {DataU:userData, Dadospesquisa:controlador, Projects:data, title: 'EAGLEI'});
		}
	}).sort({ data_ultimaactualizacaojobcard:-1 }).limit(100).lean();
	
 
});


router.get('/jobcardprojectshome/inprogress/previouspage/:contador/:totalnr', function(req, res) {

	var userData=req.session.usuario;
	var nome = userData.nome;
	var incrementadr = parseInt(req.params.contador) - 1;
	var contador = incrementadr * 50;
	
	console.log(contador)
	console.log(incrementadr)
	

	if((userData.funcao == "Call Center") || (userData.funcao == "Back Office") || (userData.nivel_acesso == "admin") || (userData.nome == "Hamilton Sitoe") || (userData.nome == "Luis Brazuna") || (userData.nome == "Antonio Biquiza")){

		jobcardprojects.find({ttnumber_status:"In Progress"}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{

				res.render("jobcardprojects_home", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:incrementadr, dadoscontroladorincr:parseInt(req.params.contador), Projects:data, title: 'EAGLEI'});

			}
		}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();

	}else{

		jobcardprojects.find({ttnumber_status:"In Progress", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{

			
				res.render("jobcardprojects_home", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:incrementadr, dadoscontroladorincr:parseInt(req.params.contador), Projects:data, title: 'EAGLEI'});

			}

		}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
	}
});


router.get('/jobcardprojectshome/inprogress/nextpage/:contador/:totalnr', function(req, res) {

	var userData=req.session.usuario;
	var nome = userData.nome;
	var contador = parseInt(req.params.contador) * 50;
	var incrementadr = parseInt(req.params.contador) + 1;
	console.log(contador)
	console.log(incrementadr)
	

	if((userData.funcao == "Call Center") || (userData.funcao == "Back Office") || (userData.nivel_acesso == "admin") || (userData.nome == "Hamilton Sitoe") || (userData.nome == "Luis Brazuna") || (userData.nome == "Antonio Biquiza")){

		jobcardprojects.find({ttnumber_status:"In Progress"}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{

				res.render("jobcardprojects_home", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr),dadoscontroladordecr:parseInt(req.params.contador),dadoscontroladorincr:incrementadr, Projects:data, title: 'EAGLEI'});

			}
		}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();

	}else{

		jobcardprojects.find({ttnumber_status:"In Progress", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{

			
				res.render("jobcardprojects_home", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:parseInt(req.params.contador),dadoscontroladorincr:incrementadr, Projects:data, title: 'EAGLEI'});

			}

		}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
	}
});



router.get('/jobcardprojectshome/inprogress', function(req, res) {

	var userData=req.session.usuario;
	var nome = userData.nome;
	

	if((userData.funcao == "Call Center") || (userData.funcao == "Back Office") || (userData.nivel_acesso == "admin") || (userData.nome == "Luis Brazuna") || (userData.nome == "David Nhantumbo") || (userData.nome == "Antonio Biquiza")){

		jobcardprojects.find({ttnumber_status:"In Progress"}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{

				jobcardprojects.countDocuments({ttnumber_status:"In Progress"}, function(err, dataProjects){
					if(err){
						console.log("ocorreu um erro ao tentar aceder os dados")
					}else{

						var total = dataProjects;
						var totalcont = Math.ceil(total/50);

						res.render("jobcardprojects_home", {DataU:userData, dadostotalnr:totalcont, dadoscontroladordecr:0,dadoscontroladorincr:1, Projects:data, title: 'EAGLEI'});
					}
				}).exec();
				
				
			}
		}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();

	}else{

		jobcardprojects.find({ttnumber_status:"In Progress", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{

				jobcardprojects.countDocuments({ttnumber_status:"In Progress", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, dataProjects){
					if(err){
						console.log("ocorreu um erro ao tentar aceder os dados")
					}else{

						var total = dataProjects;
						var totalcont = Math.ceil(total/50);

						res.render("jobcardprojects_home", {DataU:userData, dadostotalnr:totalcont, dadoscontroladordecr:0,dadoscontroladorincr:1, Projects:data, title: 'EAGLEI'});
					}
				}).exec();
			}

		}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
	}
});


router.post('/jobcardprojectshomecompletepesquisa', async function(req, res) {
	var userData=req.session.usuario;
	var nome = userData.nome;
	var tthomecont = req.body;
	var controlador = tthomecont.pesquisador;

	jobcardprojects.find({ttnumber_status:"Complete",$or:[{jobcard_projectnumber:controladornr}, {jobcard_site:controlador}, {jobcard_tecniconome:controlador}, {jobcard_clientenome:controlador}, {jobcard_datacreated:controlador}, {jobcard_regiao:controlador}, {jobcard_estadoactual:controlador}]}, function(err, data){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados" + err)
		}
		else{
			res.render("jobcardprojects_home", {DataU:userData, Dadospesquisa:controlador, Projects:data, title: 'EAGLEI'});
		}
	}).sort({ data_ultimaactualizacaojobcard:-1 }).limit(100).lean();
	
 
});


router.get('/jobcardprojectshome/complete/previouspage/:contador/:totalnr', function(req, res) {

	var userData=req.session.usuario;
	var nome = userData.nome;
	var incrementadr = parseInt(req.params.contador) - 1;
	var contador = incrementadr * 50;
	
	console.log(contador)
	console.log(incrementadr)
	

	if((userData.funcao == "Call Center") || (userData.funcao == "Back Office") || (userData.nivel_acesso == "admin") || (userData.nome == "Hamilton Sitoe") || (userData.nome == "Luis Brazuna") || (userData.nome == "Antonio Biquiza")){

		jobcardprojects.find({ttnumber_status:"Complete"}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{

				res.render("jobcardprojects_home", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:incrementadr, dadoscontroladorincr:parseInt(req.params.contador), Projects:data, title: 'EAGLEI'});

			}
		}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();

	}else{

		jobcardprojects.find({ttnumber_status:"Complete", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{

			
				res.render("jobcardprojects_home", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:incrementadr, dadoscontroladorincr:parseInt(req.params.contador), Projects:data, title: 'EAGLEI'});

			}

		}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
	}
});


router.get('/jobcardprojectshome/complete/nextpage/:contador/:totalnr', function(req, res) {

	var userData=req.session.usuario;
	var nome = userData.nome;
	var contador = parseInt(req.params.contador) * 50;
	var incrementadr = parseInt(req.params.contador) + 1;
	console.log(contador)
	console.log(incrementadr)
	

	if((userData.funcao == "Call Center") || (userData.funcao == "Back Office") || (userData.nivel_acesso == "admin") || (userData.nome == "Hamilton Sitoe") || (userData.nome == "Luis Brazuna") || (userData.nome == "Antonio Biquiza")){

		jobcardprojects.find({ttnumber_status:"Complete"}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{

				res.render("jobcardprojects_home", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr),dadoscontroladordecr:parseInt(req.params.contador),dadoscontroladorincr:incrementadr, Projects:data, title: 'EAGLEI'});

			}
		}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();

	}else{

		jobcardprojects.find({ttnumber_status:"Complete", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{

			
				res.render("jobcardprojects_home", {DataU:userData, dadostotalnr:parseInt(req.params.totalnr), dadoscontroladordecr:parseInt(req.params.contador),dadoscontroladorincr:incrementadr, Projects:data, title: 'EAGLEI'});

			}

		}).sort({data_ultimaactualizacaojobcard:-1}).skip(contador).limit(50).lean();
	}
});


router.get('/jobcardprojectshome/complete', function(req, res) {

	var userData=req.session.usuario;
	var nome = userData.nome;
	var calljobcard = ["Project"];
	
	if((userData.funcao == "Call Center") || (userData.funcao == "Back Office") || (userData.nivel_acesso == "admin") || (userData.nome == "Luis Brazuna") || (userData.nome == "David Nhantumbo") || (userData.nome == "Antonio Biquiza")){

		jobcardprojects.find({ttnumber_status:"Complete"}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{

				jobcardprojects.countDocuments({ttnumber_status:"Complete"}, function(err, dataProjects){
					if(err){
						console.log("ocorreu um erro ao tentar aceder os dados")
					}else{

						var total = dataProjects;
						var totalcont = Math.ceil(total/50);

						res.render("jobcardprojects_home", {DataU:userData, dadostotalnr:totalcont, dadoscontroladordecr:0,dadoscontroladorincr:1, Projects:data, title: 'EAGLEI'});
					}
				}).exec();
				
				
			}
		}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();

	}else{

		jobcardprojects.find({ttnumber_status:"Complete", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{

				jobcardprojects.countDocuments({ttnumber_status:"Complete", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, dataProjects){
					if(err){
						console.log("ocorreu um erro ao tentar aceder os dados")
					}else{

						var total = dataProjects;
						var totalcont = Math.ceil(total/50);

						res.render("jobcardprojects_home", {DataU:userData, dadostotalnr:totalcont, dadoscontroladordecr:0,dadoscontroladorincr:1, Projects:data, title: 'EAGLEI'});
					}
				}).exec();
			}

		}).sort({data_ultimaactualizacaojobcard:-1}).limit(50).lean();
	}
});

router.get("/detalhesCallCenterCommentsProject/:id",  function(req, res){
	var userData= req.session.usuario;
	

	jobcardprojects.find({_id:req.params.id}, {ttnumber_status:1}, function(err, data){
		console.log(data)
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}
		else{

			res.render("jobcard_detalhesCallCenterComments", {DataU:userData, Projects:data, title: 'EAGLEI'});
		}
	}).lean();

});

router.get("/detalhesCallCenterComments/:id",  function(req, res){
	var userData= req.session.usuario;
	

	jobcards.find({_id:req.params.id}, {jobcard_jobtype:1, jobcard_call:1, ttnumber_status:1}, function(err, data){
		// console.log(data)
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}
		else{

			res.render("jobcard_detalhesCallCenterComments", {DataU:userData, Jobcards:data, title: 'EAGLEI'});
		}
	});

});

router.get("/detalhesDevolverJobcardProject/:id",  function(req, res){
	var userData= req.session.usuario;
	

	jobcardprojects.find({_id:req.params.id}, {_id:1}, function(err, data){
		console.log(data)
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}
		else{
			console.log(data)
			res.render("jobcard_detalhesDevolverJobcard", {DataU:userData, Projects:data, DadosProjects:JSON.stringify(data), title: 'EAGLEI'});
			
		}
	}).lean();

});

router.get("/detalhesDevolverJobcard/:id",  function(req, res){
	var userData= req.session.usuario;
	

	jobcards.find({_id:req.params.id}, {jobcard_jobtype:1, jobcard_call:1}, function(err, data){
		// console.log(data)
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}
		else{

			res.render("jobcard_detalhesDevolverJobcard", {DataU:userData, Jobcards:data, title: 'EAGLEI'});
			
		}
	}).lean();

});


router.get("/detalhesAccaoPrioridadeProject/:id",  function(req, res){
	var userData= req.session.usuario;
	

	jobcardprojects.find({_id:req.params.id}, {_id:1, ttnumber_status:1}, function(err, data){
		console.log(data)
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}
		else{
			model.find({}, {nome:1}, function(err, dataUsuarios){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
					console.log(data)
					res.render("jobcard_accaoPrioridade_projects", {DataU:userData, Usuarios:dataUsuarios, Projects:data, title: 'EAGLEI'});
				}
			}).sort({nome:1}).lean();
		}
	}).lean();

});

router.get("/detalhesAccaoPrioridade/:id",  function(req, res){
	var userData= req.session.usuario;
	

	jobcards.find({_id:req.params.id}, {jobcard_jobtype:1,jobcard_call:1, ttnumber_status:1, jobcard_jobinfo:1}, function(err, data){
		console.log(data)
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}
		else{
			model.find({}, {nome:1}, function(err, dataUsuarios){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
					// console.log(data)
					res.render("jobcard_accaoPrioridade", {DataU:userData, Usuarios:dataUsuarios, Jobcards:data, title: 'EAGLEI'});
				}
			}).sort({nome:1}).lean();
		}
	}).lean();

});

router.get("/detalhesAccaoCallcenter/:id",  function(req, res){
	var userData= req.session.usuario;
	
	jobcards.find({_id:req.params.id}, {jobcard_jobtype:1,jobcard_call:1, ttnumber_status:1}, function(err, data){
		console.log(data)
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}
		else{
			model.find({}, {nome:1}, function(err, dataUsuarios){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
					// console.log(data)
					console.log("Este é o " +userData);
					console.log(userData);
					res.render("jobcard_callcenteraccao", {DataU:userData, Usuarios:dataUsuarios, Jobcards:data, title: 'EAGLEI'});
				}
			}).sort({nome:1}).lean();
		}
	}).lean();

});


router.get("/detalhesJobcardCallOut/:id",  function(req, res){
	var userData= req.session.usuario;
	var callarray = ["Radio", "Transmission", "Power", "Civil", "Core-data center"];
	var infoarr = ["AC Mains Failure", "Rectifier System", "Rectifier Module", "Generator Low Fuel", "Generator Abnormal", "Generator Running", "High Temperature", "Battery Low", "Door Switch Intruder", "Motion Detector", "FAN Stalled", "Smoke Detector", "Site Down", "RRU replacement", "RRU fiber", "Fly leads", "UBBP board", "WBBP board", "BBU board", "RTN905 RTN950", "RTN controller board", "RTN Fan unit", "OSN fan unit", "ODU replacement", "Patch Cords", "Outdoor cabinet cooling system"];
	var jobinfoarray = [];
	var arrSite = [];

	jobcards.find({_id:req.params.id}, function(err, data){
		console.log(data)
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados" + err)
		}
		else{
			clientes.find({},{cliente_nome:1, cliente_filial:1, cliente_telefone:1}, function(err, dataClientes){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados" + err)
				}else{

					siteinfos.aggregate([{$group:{_id:"$siteinfo_clientid", sites:{$push:{numero:"$siteinfo_sitenum", ref:"$_id"}}}}], async function (err, dataSiteCliente) {
						if(err){
							console.log("ocorreu um erro ao tentar aceder os dados" + err)
						}else{

							function compare( a, b ) {
						          if ( a.numero < b.numero ){
						            return -1;
						          }
						          if ( a.numero > b.numero ){
						            return 1;
						          }
						          return 0;
						      }
						      
						    for(var i = 0; i < dataSiteCliente.length; i++){

						        dataSiteCliente[i].sites.sort(compare);

						    }

						    if(data[0].jobcard_clienteid == "5e71cba0ccff6e17448e12d4"){
								jobinfoarray = infoarr;
							}

							var posicaoclientesite = dataSiteCliente.findIndex(x => x._id == data[0].jobcard_clienteid);

							if(posicaoclientesite != -1){
								var exemplo= await Promise.all( dataSiteCliente[posicaoclientesite].sites.map(async function(y, i){
									arrSite[i]= await {};
									arrSite[i].ref=y.ref;
									arrSite[i].numero=y.numero;
									
								}));

							}

							jobcards.find({_id:{$ne:req.params.id}, jobcard_ttnumber:{$ne:0}}, {jobcard_ttnumber:1}, function(err, dadosjobcards){
								if(err){
									console.log("ocorreu um erro ao tentar aceder os dados" + err)
								}else{
									res.render("jobcard_viewcallout", {DataU:userData, NomeSession:userData.nome, DadosJobcards:JSON.stringify(dadosjobcards), DadoscallArray:callarray, DadosSiteArray:arrSite, DadosjobinfoArray:jobinfoarray, DadosSiteCliente:JSON.stringify(dataSiteCliente), Clientes:dataClientes, DadosClientes:JSON.stringify(dataClientes), Jobcards:data, DadosJobcard:JSON.stringify(data),  title: 'EAGLEI'});
								}
							}).lean();

						}
					});
					
				}
			}).sort({cliente_nome:1}).lean();
		}
	}).lean();

});

router.get("/detalhesJobcardCallOutProject/:id",  function(req, res){
	var userData= req.session.usuario;
	var arrSite = [];

	jobcardprojects.find({_id:req.params.id}, function(err, data){
		console.log(data)
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}
		else{
			
			clientes.find({},{cliente_nome:1, cliente_filial:1, cliente_telefone:1}, function(err, dataClientes){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}else{

					siteinfos.aggregate([{$group:{_id:"$siteinfo_clientid", sites:{$push:{numero:"$siteinfo_sitenum", ref:"$_id"}}}}], async function (err, dataSiteCliente) {
						if(err){
							console.log("ocorreu um erro ao tentar aceder os dados")
						}else{

							function compare( a, b ) {
					        	if ( a.numero < b.numero ){
					        		return -1;
					        	}
					        	if ( a.numero > b.numero ){
					        		return 1;
					        	}
					        	return 0;
					      	}
							

					    	for(var i = 0; i < dataSiteCliente.length; i++){

					        	dataSiteCliente[i].sites.sort(compare);

							}

							var posicaoclientesite = dataSiteCliente.findIndex(x => x._id == data[0].jobcard_clienteid);
							
							if(posicaoclientesite != -1){
								var exemplo= await Promise.all( dataSiteCliente[posicaoclientesite].sites.map(async function(y, i){
									arrSite[i] = y.numero;
								}));

							}
							

							jobcardprojects.find({_id:{$ne:req.params.id}}, {jobcard_projectnumber:1}, function(err, dadosprojects){
								if(err){
									console.log("ocorreu um erro ao tentar aceder os dados")
								}else{

									res.render("jobcard_viewcallout_project", {DataU:userData, DadosSiteArray:arrSite, DadosProjects:JSON.stringify(dadosprojects), DadosClientes:JSON.stringify(dataClientes), SiteCliente:JSON.stringify(dataSiteCliente), Clientes:dataClientes, NomeSession:userData.nome, Projects:data, title: 'EAGLEI'});
								}
							}).lean();
						}
					});

					
				}
			}).sort({cliente_nome:1}).lean();
		}
	}).lean();

});


router.get("/detalhesJobcardPlanned/:id",  function(req, res){
	var userData= req.session.usuario;
	var jobcardid = req.params.id;
	

	jobcards.find({_id:req.params.id}, function(err, data){
		console.log(data)
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}
		else{

			jobcards.find({_id:{$ne:req.params.id}, jobcard_ttnumber:{$ne:0}}, {jobcard_ttnumber:1}, function(err, dadosjobcards){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados" + err)
				}else{

					res.render("jobcard_viewplanned", {DataU:userData, NomeSession:userData.nome,DadosJobcards:JSON.stringify(dadosjobcards), DadosJobcard:JSON.stringify(data), ReferenciaJobcard: jobcardid, Jobcards:data, title: 'EAGLEI'});

				}
			}).lean();
			
			
		}
	}).lean();

});


router.get("/detalhesMapa/:id",  function(req, res){
	var userData= req.session.usuario;

	jobcards.find({_id:req.params.id},{jobcard_controladorintervenientes:1,jobcard_jobtype:1, geolocationJobcardInfo:1, jobcard_site:1, jobcard_call:1, jobcard_traveldurationms:1, jobcard_estadoactual:1}, function(err, data){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}
		else{
			res.render("jobcard_viewmapa", {DataU:userData, Jobcards:data, DadosJobcards:JSON.stringify(data), title: 'EAGLEI'});
		}
	}).lean();

});

router.get("/novojobcard",  function(req, res){
	var userData= req.session.usuario;
	console.log(userData);


	usuarios.find({}, function(err, dataUsuarios){
		if(err){
			console.log("Ocorreu um erro ao tentar gravar os dados!\n contacte o administrador do sistema");
			console.log(err)
		}
		else{

			clientes.find({}, function(err, dataClientes){

				if(err){
					console.log("Ocorreu um erro ao tentar gravar os dados!\n contacte o administrador do sistema");
					console.log(err)
				}else{
					siteinfos.find({}, function(err, dataSiteInfo){
						if(err){
							console.log("Ocorreu um erro ao tentar gravar os dados!\n contacte o administrador do sistema");
							console.log(err)
						}else{
							siteinfos.aggregate([{$group:{_id:"$siteinfo_clientid", sites:{$push:{numero:"$siteinfo_sitenum", ref:"$_id"}}}}], async function (err, dataSiteCliente) {
								if(err){
									console.log("Ocorreu um erro ao tentar gravar os dados!\n contacte o administrador do sistema");
									console.log(err)
								}else{
									//console.log(dataSiteCliente);
									res.render("jobcard_form", {DataU:userData, Usuarios:dataUsuarios, Clientes:dataClientes, SiteCliente:JSON.stringify(dataSiteCliente), SiteInfo:JSON.stringify(dataSiteInfo), Usuarios1:JSON.stringify(dataUsuarios), Clientes1:JSON.stringify(dataClientes), title: 'EAGLEI'});
								}	
							});
						}
					});

					
				}

			});

		}
	});

	
});


router.get("/detalhesSignageModal/:id",  function(req, res){
	var userData= req.session.usuario;

	jobcards.find({_id:req.params.id}, {jobcardsignage:1}, function(err, data){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}
		else{
			console.log(data[0].jobcardsignage)
			res.render("jobcard_signagedetails", {DataU:userData, Jobcards:data, title: 'EAGLEI'});
		}
	}).lean();

});

router.get("/detalhesContainerModal/:id",  function(req, res){
	var userData= req.session.usuario;

	jobcards.find({_id:req.params.id}, {jobcardcontainer:1}, function(err, data){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}
		else{
			
			res.render("jobcard_containerdetails", {DataU:userData, Jobcards:data, title: 'EAGLEI'});
		}
	}).lean();

});

router.get("/detalhesMastModal/:id",  function(req, res){
	var userData= req.session.usuario;

	jobcards.find({_id:req.params.id}, {jobcardmast:1}, function(err, data){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}
		else{
			
			res.render("jobcard_mastdetails", {DataU:userData, Jobcards:data, title: 'EAGLEI'});
		}
	}).lean();

});

router.get("/detalhesCleaningModal/:id",  function(req, res){
	var userData= req.session.usuario;

	jobcards.find({_id:req.params.id}, {jobcardcleaning:1}, function(err, data){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}
		else{
			
			res.render("jobcard_cleaningdetails", {DataU:userData, Jobcards:data, title: 'EAGLEI'});
		}
	}).lean();

});

router.get("/detalhesLocksModal/:id",  function(req, res){
	var userData= req.session.usuario;

	jobcards.find({_id:req.params.id}, {jobcardlocks:1}, function(err, data){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}
		else{
			
			res.render("jobcard_locksdetails", {DataU:userData, Jobcards:data, title: 'EAGLEI'});
		}
	}).lean();

});

router.get("/detalhesEnvironmentalModal/:id",  function(req, res){
	var userData= req.session.usuario;

	jobcards.find({_id:req.params.id}, {jobcardenvironmental:1}, function(err, data){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}
		else{
			
			res.render("jobcard_environmentaldetails", {DataU:userData, Jobcards:data, title: 'EAGLEI'});
		}
	}).lean();

});


router.get("/detalhesFallarrestModal/:id",  function(req, res){
	var userData= req.session.usuario;

	jobcards.find({_id:req.params.id}, {jobcardfallarrest:1}, function(err, data){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}
		else{
			
			res.render("jobcard_fallarrestdetails", {DataU:userData, Jobcards:data, title: 'EAGLEI'});
		}
	}).lean();

});

router.get("/detalhesGeneratorInfojobcardModal/:id",  function(req, res){
	var userData= req.session.usuario;

	jobcards.find({_id:req.params.id}, {jobcardgeneratorinfo:1}, function(err, data){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}
		else{
			
			res.render("jobcard_generatorInfoJobcarddetails", {DataU:userData, Jobcards:data, title: 'EAGLEI'});
		}
	}).lean();

});

router.get("/detalhesEdBoardModal/:id",  function(req, res){
	var userData= req.session.usuario;

	jobcards.find({_id:req.params.id}, {jobcardedBoardinfo:1}, function(err, data){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}
		else{
			
			res.render("jobcard_edBoarddetails", {DataU:userData, Jobcards:data, title: 'EAGLEI'});
		}
	}).lean();

});

router.get("/detalhesElectricalModal/:id",  function(req, res){
	var userData= req.session.usuario;

	jobcards.find({_id:req.params.id}, {jobcardelectricalinfo:1}, function(err, data){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}
		else{
			
			res.render("jobcard_electricaldetails", {DataU:userData, Jobcards:data, title: 'EAGLEI'});
		}
	}).lean();

});


router.get("/detalhesRectifierModal/:id",  function(req, res){
	var userData= req.session.usuario;

	jobcards.find({_id:req.params.id}, {jobcardrectifierinfo:1}, function(err, data){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}
		else{
			
			res.render("jobcard_rectifierdetails", {DataU:userData, Jobcards:data, title: 'EAGLEI'});
		}
	}).lean();

});


router.get("/detalhesBatteryBanksModal/:id",  function(req, res){
	var userData= req.session.usuario;

	jobcards.find({_id:req.params.id}, {jobcardbatterybanksinfo:1}, function(err, data){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}
		else{
			
			res.render("jobcard_batterybanksdetails", {DataU:userData, Jobcards:data, title: 'EAGLEI'});
		}
	}).lean();

});


router.get("/detalhesAircondModal/:id",  function(req, res){
	var userData= req.session.usuario;

	jobcards.find({_id:req.params.id}, {jobcardaircondinfo:1}, function(err, data){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}
		else{
			
			res.render("jobcard_airconddetails", {DataU:userData, Jobcards:data, title: 'EAGLEI'});
		}
	}).lean();

});

router.get("/detalhesAntennasModal/:id",  function(req, res){
	var userData= req.session.usuario;

	jobcards.find({_id:req.params.id}, {jobcardantennasinfo:1}, function(err, data){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}
		else{
			
			res.render("jobcard_antennasdetails", {DataU:userData, Jobcards:data, title: 'EAGLEI'});
		}
	}).lean();

});


router.get("/detalhesEaInfoModal/:id",  function(req, res){
	var userData= req.session.usuario;

	jobcards.find({_id:req.params.id}, {jobcardeainfo:1}, function(err, data){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}
		else{
			
			res.render("jobcard_eainfodetails", {DataU:userData, Jobcards:data, title: 'EAGLEI'});
		}
	}).lean();

});

router.get("/detalhesTxInfoModal/:id",  function(req, res){
	var userData= req.session.usuario;

	jobcards.find({_id:req.params.id}, {jobcardtxinfo:1}, function(err, data){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}
		else{
			
			res.render("jobcard_txinfodetails", {DataU:userData, Jobcards:data, title: 'EAGLEI'});
		}
	}).lean();

});

router.get("/detalhesVsatInfoModal/:id",  function(req, res){
	var userData= req.session.usuario;

	jobcards.find({_id:req.params.id}, {jobcardvsatinfo:1}, function(err, data){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}
		else{
			
			res.render("jobcard_vsatinfodetails", {DataU:userData, Jobcards:data, title: 'EAGLEI'});
		}
	}).lean();

});

router.get("/detalhesPhotoModal/:id",  function(req, res){
	var userData= req.session.usuario;

	jobcards.find({_id:req.params.id}, {jobcardphotoinfo:1, jobcard_jobtype:1}, function(err, data){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}
		else{
			
			res.render("jobcard_photodetails", {DataU:userData, Jobcards:data, title: 'EAGLEI'});
		}
	}).lean();

});

router.get("/detalhesConcernsModal/:id",  function(req, res){
	var userData= req.session.usuario;

	jobcards.find({_id:req.params.id}, {jobcardconcernsinfo:1}, function(err, data){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}
		else{
			
			res.render("jobcard_concernsdetails", {DataU:userData, Jobcards:data, title: 'EAGLEI'});
		}
	}).lean();

});


	
	router.post("/updateSignageInfo/:id",  upload.any(), async function(req, res){
		var userData= req.session.usuario;
		var id = req.params.id;
		var jobcard = req.body;

		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
	    var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
	    var ano = (new Date()).getFullYear();
	    var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

		var procurajobcard = await jobcards.findOne({_id:id}, {jobcard_audittrail:1}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find jobcard");
			}
		}).lean();


		var arrAudit = procurajobcard.jobcard_audittrail;
		var lastaudittrail = arrAudit[arrAudit.length-1];

		if((lastaudittrail.jobcard_audittrailname == userData.nome) && (lastaudittrail.jobcard_audittrailaction == "Update Jobcard")){

        arrAudit[arrAudit.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

	    }else{

	      var jobcard_audittrailObject = {};
	      // jobcard_audittrailObject._id = "";
	      jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
	      jobcard_audittrailObject.jobcard_audittrailaction = "Update Jobcard";
	      jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
	      arrAudit.push(jobcard_audittrailObject);
	    }

	    var jobcard_audittrail = arrAudit;
		

		jobcards.updateOne({_id:id},{$set:{ data_ultimaactualizacaojobcard:new Date(),jobcardsignage:jobcard, jobcard_backofficeagent:userData.nome, jobcard_audittrail:jobcard_audittrail}}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Signage info done")
				res.redirect("/inicio");
			}
		});

	});

	router.post("/updateContainerInfo/:id",  upload.any(), async function(req, res){
		var userData= req.session.usuario;
		var id = req.params.id;
		var jobcard = req.body;

		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
	    var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
	    var ano = (new Date()).getFullYear();
	    var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

		var procurajobcard = await jobcards.findOne({_id:id}, {jobcard_audittrail:1}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find jobcard");
			}
		}).lean();


		var arrAudit = procurajobcard.jobcard_audittrail;
		var lastaudittrail = arrAudit[arrAudit.length-1];

		if((lastaudittrail.jobcard_audittrailname == userData.nome) && (lastaudittrail.jobcard_audittrailaction == "Update Jobcard")){

        arrAudit[arrAudit.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

	    }else{

	      var jobcard_audittrailObject = {};
	      // jobcard_audittrailObject._id = "";
	      jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
	      jobcard_audittrailObject.jobcard_audittrailaction = "Update Jobcard";
	      jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
	      arrAudit.push(jobcard_audittrailObject);
	    }

	    var jobcard_audittrail = arrAudit;


		jobcards.updateOne({_id:id},{$set:{data_ultimaactualizacaojobcard:new Date(), jobcardcontainer:jobcard, jobcard_backofficeagent:userData.nome, jobcard_audittrail:jobcard_audittrail}}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Container info done")
				res.redirect("/inicio");
			}
		});

	});

	router.post("/updateMastInfo/:id",  upload.any(), async function(req, res){
		var userData= req.session.usuario;
		var id = req.params.id;
		var jobcard = req.body;

		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
	    var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
	    var ano = (new Date()).getFullYear();
	    var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

		var procurajobcard = await jobcards.findOne({_id:id}, {jobcard_audittrail:1}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find jobcard");
			}
		}).lean();


		var arrAudit = procurajobcard.jobcard_audittrail;
		var lastaudittrail = arrAudit[arrAudit.length-1];

		if((lastaudittrail.jobcard_audittrailname == userData.nome) && (lastaudittrail.jobcard_audittrailaction == "Update Jobcard")){

        arrAudit[arrAudit.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

	    }else{

	      var jobcard_audittrailObject = {};
	      // jobcard_audittrailObject._id = "";
	      jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
	      jobcard_audittrailObject.jobcard_audittrailaction = "Update Jobcard";
	      jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
	      arrAudit.push(jobcard_audittrailObject);
	    }

	    var jobcard_audittrail = arrAudit;


		jobcards.updateOne({_id:id},{$set:{data_ultimaactualizacaojobcard:new Date(), jobcardmast:jobcard, jobcard_backofficeagent:userData.nome, jobcard_audittrail:jobcard_audittrail}}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Mast info done")
				res.redirect("/inicio");
			}
		});

	});

	router.post("/updateCleaningInfo/:id",  upload.any(), async function(req, res){
		var userData= req.session.usuario;
		var id = req.params.id;
		var jobcard = req.body;

		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
	    var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
	    var ano = (new Date()).getFullYear();
	    var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

		var procurajobcard = await jobcards.findOne({_id:id}, {jobcard_audittrail:1}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find jobcard");
			}
		}).lean();


		var arrAudit = procurajobcard.jobcard_audittrail;
		var lastaudittrail = arrAudit[arrAudit.length-1];

		if((lastaudittrail.jobcard_audittrailname == userData.nome) && (lastaudittrail.jobcard_audittrailaction == "Update Jobcard")){

        arrAudit[arrAudit.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

	    }else{

	      var jobcard_audittrailObject = {};
	      // jobcard_audittrailObject._id = "";
	      jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
	      jobcard_audittrailObject.jobcard_audittrailaction = "Update Jobcard";
	      jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
	      arrAudit.push(jobcard_audittrailObject);
	    }

	    var jobcard_audittrail = arrAudit;


		jobcards.updateOne({_id:id},{$set:{data_ultimaactualizacaojobcard:new Date() ,jobcardcleaning:jobcard, jobcard_backofficeagent:userData.nome, jobcard_audittrail:jobcard_audittrail}}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Cleaning info done")
				res.redirect("/inicio");
			}
		});

	});

	router.post("/updateLocksInfo/:id",  upload.any(), async function(req, res){
		var userData= req.session.usuario;
		var id = req.params.id;
		var jobcard = req.body;

		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
	    var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
	    var ano = (new Date()).getFullYear();
	    var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

		var procurajobcard = await jobcards.findOne({_id:id}, {jobcard_audittrail:1}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find jobcard");
			}
		}).lean();


		var arrAudit = procurajobcard.jobcard_audittrail;
		var lastaudittrail = arrAudit[arrAudit.length-1];

		if((lastaudittrail.jobcard_audittrailname == userData.nome) && (lastaudittrail.jobcard_audittrailaction == "Update Jobcard")){

        arrAudit[arrAudit.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

	    }else{

	      var jobcard_audittrailObject = {};
	      // jobcard_audittrailObject._id = "";
	      jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
	      jobcard_audittrailObject.jobcard_audittrailaction = "Update Jobcard";
	      jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
	      arrAudit.push(jobcard_audittrailObject);
	    }

	    var jobcard_audittrail = arrAudit;


		jobcards.updateOne({_id:id},{$set:{data_ultimaactualizacaojobcard:new Date() ,jobcardlocks:jobcard, jobcard_backofficeagent:userData.nome, jobcard_audittrail:jobcard_audittrail}}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Locks info done")
				res.redirect("/inicio");
			}
		});

	});

	router.post("/updateEnvironmentalInfo/:id",  upload.any(), async function(req, res){
		var userData= req.session.usuario;
		var id = req.params.id;
		var jobcard = req.body;

		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
	    var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
	    var ano = (new Date()).getFullYear();
	    var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

		var procurajobcard = await jobcards.findOne({_id:id}, {jobcard_audittrail:1}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find jobcard");
			}
		}).lean();


		var arrAudit = procurajobcard.jobcard_audittrail;
		var lastaudittrail = arrAudit[arrAudit.length-1];

		if((lastaudittrail.jobcard_audittrailname == userData.nome) && (lastaudittrail.jobcard_audittrailaction == "Update Jobcard")){

        arrAudit[arrAudit.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

	    }else{

	      var jobcard_audittrailObject = {};
	      // jobcard_audittrailObject._id = "";
	      jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
	      jobcard_audittrailObject.jobcard_audittrailaction = "Update Jobcard";
	      jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
	      arrAudit.push(jobcard_audittrailObject);
	    }

	    var jobcard_audittrail = arrAudit;


		jobcards.updateOne({_id:id},{$set:{data_ultimaactualizacaojobcard:new Date(), jobcardenvironmental:jobcard, jobcard_backofficeagent:userData.nome, jobcard_audittrail:jobcard_audittrail}}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Environmental info done")
				res.redirect("/inicio");
			}
		});

	});

	router.post("/updateFallArrestInfo/:id",  upload.any(), async function(req, res){
		var userData= req.session.usuario;
		var id = req.params.id;
		var jobcard = req.body;

		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
	    var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
	    var ano = (new Date()).getFullYear();
	    var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

		var procurajobcard = await jobcards.findOne({_id:id}, {jobcard_audittrail:1}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find jobcard");
			}
		}).lean();


		var arrAudit = procurajobcard.jobcard_audittrail;
		var lastaudittrail = arrAudit[arrAudit.length-1];

		if((lastaudittrail.jobcard_audittrailname == userData.nome) && (lastaudittrail.jobcard_audittrailaction == "Update Jobcard")){

        arrAudit[arrAudit.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

	    }else{

	      var jobcard_audittrailObject = {};
	      // jobcard_audittrailObject._id = "";
	      jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
	      jobcard_audittrailObject.jobcard_audittrailaction = "Update Jobcard";
	      jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
	      arrAudit.push(jobcard_audittrailObject);
	    }

	    var jobcard_audittrail = arrAudit;


		jobcards.updateOne({_id:id},{$set:{data_ultimaactualizacaojobcard:new Date(), jobcardfallarrest:jobcard, jobcard_backofficeagent:userData.nome, jobcard_audittrail:jobcard_audittrail}}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Fall Arrest info done")
				res.redirect("/inicio");
			}
		});

	});


	router.post("/updateGenaratorInfoJobcardInfo/:id",  upload.any(), async function(req, res){
		var userData= req.session.usuario;
		var id = req.params.id;
		var jobcard = req.body;

		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
	    var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
	    var ano = (new Date()).getFullYear();
	    var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

		var procurajobcard = await jobcards.findOne({_id:id}, {jobcard_audittrail:1}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find jobcard");
			}
		}).lean();


		var arrAudit = procurajobcard.jobcard_audittrail;
		var lastaudittrail = arrAudit[arrAudit.length-1];

		if((lastaudittrail.jobcard_audittrailname == userData.nome) && (lastaudittrail.jobcard_audittrailaction == "Update Jobcard")){

        arrAudit[arrAudit.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

	    }else{

	      var jobcard_audittrailObject = {};
	      // jobcard_audittrailObject._id = "";
	      jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
	      jobcard_audittrailObject.jobcard_audittrailaction = "Update Jobcard";
	      jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
	      arrAudit.push(jobcard_audittrailObject);
	    }

	    var jobcard_audittrail = arrAudit;


		jobcards.updateOne({_id:id},{$set:{data_ultimaactualizacaojobcard:new Date(), jobcardgeneratorinfo:jobcard, jobcard_backofficeagent:userData.nome, jobcard_audittrail:jobcard_audittrail}}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Generatorinfo done")
				res.redirect("/inicio");
			}
		});

	});

	router.post("/updateedBoardJobcardInfo/:id",  upload.any(), async function(req, res){
		var userData= req.session.usuario;
		var id = req.params.id;
		var jobcard = req.body;
		
		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
	    var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
	    var ano = (new Date()).getFullYear();
	    var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

		var procurajobcard = await jobcards.findOne({_id:id}, {jobcard_audittrail:1}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find jobcard");
			}
		}).lean();


		var arrAudit = procurajobcard.jobcard_audittrail;
		var lastaudittrail = arrAudit[arrAudit.length-1];

		if((lastaudittrail.jobcard_audittrailname == userData.nome) && (lastaudittrail.jobcard_audittrailaction == "Update Jobcard")){

        arrAudit[arrAudit.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

	    }else{

	      var jobcard_audittrailObject = {};
	      // jobcard_audittrailObject._id = "";
	      jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
	      jobcard_audittrailObject.jobcard_audittrailaction = "Update Jobcard";
	      jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
	      arrAudit.push(jobcard_audittrailObject);
	    }

	    var jobcard_audittrail = arrAudit;

		jobcards.updateOne({_id:id},{$set:{data_ultimaactualizacaojobcard:new Date(),  jobcardedBoardinfo:jobcard, jobcard_backofficeagent:userData.nome, jobcard_audittrail:jobcard_audittrail}}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("EDBoard Info done")
				res.redirect("/inicio");
			}
		});

	});

	router.post("/updateelectricalJobcardInfo/:id",  upload.any(), async function(req, res){
		var userData= req.session.usuario;
		var id = req.params.id;
		var jobcard = req.body;

		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
	    var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
	    var ano = (new Date()).getFullYear();
	    var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

		var procurajobcard = await jobcards.findOne({_id:id}, {jobcard_audittrail:1}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find jobcard");
			}
		}).lean();


		var arrAudit = procurajobcard.jobcard_audittrail;
		var lastaudittrail = arrAudit[arrAudit.length-1];

		if((lastaudittrail.jobcard_audittrailname == userData.nome) && (lastaudittrail.jobcard_audittrailaction == "Update Jobcard")){

        arrAudit[arrAudit.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

	    }else{

	      var jobcard_audittrailObject = {};
	      // jobcard_audittrailObject._id = "";
	      jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
	      jobcard_audittrailObject.jobcard_audittrailaction = "Update Jobcard";
	      jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
	      arrAudit.push(jobcard_audittrailObject);
	    }

	    var jobcard_audittrail = arrAudit;

		jobcards.updateOne({_id:id},{$set:{data_ultimaactualizacaojobcard:new Date(), jobcardelectricalinfo:jobcard, jobcard_backofficeagent:userData.nome, jobcard_audittrail:jobcard_audittrail}}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Electrical Info done")
				res.redirect("/inicio");
			}
		});

	});

	router.post("/updaterectifierJobcardInfo/:id",  upload.any(), async function(req, res){
		var userData= req.session.usuario;
		var id = req.params.id;
		var jobcard = req.body;

		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
	    var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
	    var ano = (new Date()).getFullYear();
	    var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

		var procurajobcard = await jobcards.findOne({_id:id}, {jobcard_audittrail:1}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find jobcard");
			}
		}).lean();


		var arrAudit = procurajobcard.jobcard_audittrail;
		var lastaudittrail = arrAudit[arrAudit.length-1];

		if((lastaudittrail.jobcard_audittrailname == userData.nome) && (lastaudittrail.jobcard_audittrailaction == "Update Jobcard")){

        arrAudit[arrAudit.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

	    }else{

	      var jobcard_audittrailObject = {};
	      // jobcard_audittrailObject._id = "";
	      jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
	      jobcard_audittrailObject.jobcard_audittrailaction = "Update Jobcard";
	      jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
	      arrAudit.push(jobcard_audittrailObject);
	    }

	    var jobcard_audittrail = arrAudit;


		jobcards.updateOne({_id:id},{$set:{data_ultimaactualizacaojobcard:new Date(), jobcardrectifierinfo:jobcard, jobcard_backofficeagent:userData.nome, jobcard_audittrail:jobcard_audittrail}}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Rectifier Info done")
				res.redirect("/inicio");
			}
		});

	});

	router.post("/updatebatterybanksJobcardInfo/:id",  upload.any(), async function(req, res){
		var userData= req.session.usuario;
		var id = req.params.id;
		var jobcard = req.body;
		
		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
	    var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
	    var ano = (new Date()).getFullYear();
	    var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

		var procurajobcard = await jobcards.findOne({_id:id}, {jobcard_audittrail:1}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find jobcard");
			}
		}).lean();


		var arrAudit = procurajobcard.jobcard_audittrail;
		var lastaudittrail = arrAudit[arrAudit.length-1];

		if((lastaudittrail.jobcard_audittrailname == userData.nome) && (lastaudittrail.jobcard_audittrailaction == "Update Jobcard")){

        arrAudit[arrAudit.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

	    }else{

	      var jobcard_audittrailObject = {};
	      // jobcard_audittrailObject._id = "";
	      jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
	      jobcard_audittrailObject.jobcard_audittrailaction = "Update Jobcard";
	      jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
	      arrAudit.push(jobcard_audittrailObject);
	    }

	    var jobcard_audittrail = arrAudit;

		jobcards.updateOne({_id:id},{$set:{data_ultimaactualizacaojobcard:new Date(), jobcardbatterybanksinfo:jobcard, jobcard_backofficeagent:userData.nome, jobcard_audittrail:jobcard_audittrail}}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Battery Banks Info done")
				res.redirect("/inicio");
			}
		});

	});

	router.post("/updateaircondJobcardInfo/:id",  upload.any(), async function(req, res){
		var userData= req.session.usuario;
		var id = req.params.id;
		var jobcard = req.body;

		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
	    var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
	    var ano = (new Date()).getFullYear();
	    var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

		var procurajobcard = await jobcards.findOne({_id:id}, {jobcard_audittrail:1}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find jobcard");
			}
		}).lean();


		var arrAudit = procurajobcard.jobcard_audittrail;
		var lastaudittrail = arrAudit[arrAudit.length-1];

		if((lastaudittrail.jobcard_audittrailname == userData.nome) && (lastaudittrail.jobcard_audittrailaction == "Update Jobcard")){

        arrAudit[arrAudit.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

	    }else{

	      var jobcard_audittrailObject = {};
	      // jobcard_audittrailObject._id = "";
	      jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
	      jobcard_audittrailObject.jobcard_audittrailaction = "Update Jobcard";
	      jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
	      arrAudit.push(jobcard_audittrailObject);
	    }

	    var jobcard_audittrail = arrAudit;

		jobcards.updateOne({_id:id},{$set:{data_ultimaactualizacaojobcard:new Date(), jobcardaircondinfo:jobcard, jobcard_backofficeagent:userData.nome, jobcard_audittrail:jobcard_audittrail}}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Aircond Info done")
				res.redirect("/inicio");
			}
		});

	});

	router.post("/updateantennasJobcardInfo/:id",  upload.any(), async function(req, res){
		var userData= req.session.usuario;
		var id = req.params.id;
		var jobcard = req.body;

		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
	    var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
	    var ano = (new Date()).getFullYear();
	    var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

		var procurajobcard = await jobcards.findOne({_id:id}, {jobcard_audittrail:1}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find jobcard");
			}
		}).lean();


		var arrAudit = procurajobcard.jobcard_audittrail;
		var lastaudittrail = arrAudit[arrAudit.length-1];

		if((lastaudittrail.jobcard_audittrailname == userData.nome) && (lastaudittrail.jobcard_audittrailaction == "Update Jobcard")){

        arrAudit[arrAudit.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

	    }else{

	      var jobcard_audittrailObject = {};
	      // jobcard_audittrailObject._id = "";
	      jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
	      jobcard_audittrailObject.jobcard_audittrailaction = "Update Jobcard";
	      jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
	      arrAudit.push(jobcard_audittrailObject);
	    }

	    var jobcard_audittrail = arrAudit;

		jobcards.updateOne({_id:id},{$set:{data_ultimaactualizacaojobcard:new Date(), jobcardantennasinfo:jobcard, jobcard_backofficeagent:userData.nome, jobcard_audittrail:jobcard_audittrail}}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Antennas Info done")
				res.redirect("/inicio");
			}
		});

	});

	router.post("/updateeainfoJobcardInfo/:id",  upload.any(), async function(req, res){
		var userData= req.session.usuario;
		var id = req.params.id;
		var jobcard = req.body;

		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
	    var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
	    var ano = (new Date()).getFullYear();
	    var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

		var procurajobcard = await jobcards.findOne({_id:id}, {jobcard_audittrail:1}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find jobcard");
			}
		}).lean();


		var arrAudit = procurajobcard.jobcard_audittrail;
		var lastaudittrail = arrAudit[arrAudit.length-1];

		if((lastaudittrail.jobcard_audittrailname == userData.nome) && (lastaudittrail.jobcard_audittrailaction == "Update Jobcard")){

        arrAudit[arrAudit.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

	    }else{

	      var jobcard_audittrailObject = {};
	      // jobcard_audittrailObject._id = "";
	      jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
	      jobcard_audittrailObject.jobcard_audittrailaction = "Update Jobcard";
	      jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
	      arrAudit.push(jobcard_audittrailObject);
	    }

	    var jobcard_audittrail = arrAudit;


		jobcards.updateOne({_id:id},{$set:{data_ultimaactualizacaojobcard:new Date(), jobcardeainfo:jobcard, jobcard_backofficeagent:userData.nome, jobcard_audittrail:jobcard_audittrail}}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("EA Info done")
				res.redirect("/inicio");
			}
		});

	});

	router.post("/updatetxinfoJobcardInfo/:id",  upload.any(), async function(req, res){
		var userData= req.session.usuario;
		var id = req.params.id;
		var jobcard = req.body;

		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
	    var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
	    var ano = (new Date()).getFullYear();
	    var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

		var procurajobcard = await jobcards.findOne({_id:id}, {jobcard_audittrail:1}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find jobcard");
			}
		}).lean();


		var arrAudit = procurajobcard.jobcard_audittrail;
		var lastaudittrail = arrAudit[arrAudit.length-1];

		if((lastaudittrail.jobcard_audittrailname == userData.nome) && (lastaudittrail.jobcard_audittrailaction == "Update Jobcard")){

        arrAudit[arrAudit.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

	    }else{

	      var jobcard_audittrailObject = {};
	      // jobcard_audittrailObject._id = "";
	      jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
	      jobcard_audittrailObject.jobcard_audittrailaction = "Update Jobcard";
	      jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
	      arrAudit.push(jobcard_audittrailObject);
	    }

	    var jobcard_audittrail = arrAudit;

		jobcards.updateOne({_id:id},{$set:{data_ultimaactualizacaojobcard:new Date(), jobcardtxinfo:jobcard, jobcard_backofficeagent:userData.nome, jobcard_audittrail:jobcard_audittrail}}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("TX Info done")
				res.redirect("/inicio");
			}
		});

	});

	router.post("/updatevsatinfoJobcardInfo/:id",  upload.any(), async function(req, res){
		var userData= req.session.usuario;
		var id = req.params.id;
		var jobcard = req.body;

		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
	    var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
	    var ano = (new Date()).getFullYear();
	    var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

		var procurajobcard = await jobcards.findOne({_id:id}, {jobcard_audittrail:1}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find jobcard");
			}
		}).lean();


		var arrAudit = procurajobcard.jobcard_audittrail;
		var lastaudittrail = arrAudit[arrAudit.length-1];

		if((lastaudittrail.jobcard_audittrailname == userData.nome) && (lastaudittrail.jobcard_audittrailaction == "Update Jobcard")){

        arrAudit[arrAudit.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

	    }else{

	      var jobcard_audittrailObject = {};
	      // jobcard_audittrailObject._id = "";
	      jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
	      jobcard_audittrailObject.jobcard_audittrailaction = "Update Jobcard";
	      jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
	      arrAudit.push(jobcard_audittrailObject);
	    }

	    var jobcard_audittrail = arrAudit;

		jobcards.updateOne({_id:id},{$set:{data_ultimaactualizacaojobcard:new Date(), jobcardvsatinfo:jobcard, jobcard_backofficeagent:userData.nome, jobcard_audittrail:jobcard_audittrail}}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("VSAT Info done")
				res.redirect("/inicio");
			}
		});

	});

	router.post("/updatephotoinfoJobcardInfo/:id",  upload.any(), async function(req, res){
		var userData= req.session.usuario;
		var id = req.params.id;
		var jobcardphotoinfo = [];
		console.log(req.files);
		
		var directorio = "/Preventative_Maintenance/";

		if (req.files) {

			let comprimento = req.files.length;

			for (let i = 0; i < comprimento; i++) {
				jobcardphotoinfo.push((directorio + req.files[i].filename));
			}

		}

		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
	    var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
	    var ano = (new Date()).getFullYear();
	    var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

		var procurajobcard = await jobcards.findOne({_id:id}, {jobcard_audittrail:1}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find jobcard");
			}
		}).lean();


		var arrAudit = procurajobcard.jobcard_audittrail;
		var lastaudittrail = arrAudit[arrAudit.length-1];

		if((lastaudittrail.jobcard_audittrailname == userData.nome) && (lastaudittrail.jobcard_audittrailaction == "Update Jobcard")){

        arrAudit[arrAudit.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

	    }else{

	      var jobcard_audittrailObject = {};
	      // jobcard_audittrailObject._id = "";
	      jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
	      jobcard_audittrailObject.jobcard_audittrailaction = "Update Jobcard";
	      jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
	      arrAudit.push(jobcard_audittrailObject);
	    }

	    var jobcard_audittrail = arrAudit;

	    await jobcards.findOneAndUpdate({_id:id}, {$push:{jobcardphotoinfo}});

		jobcards.updateOne({_id:id},{$set:{data_ultimaactualizacaojobcard:new Date(), jobcard_backofficeagent:userData.nome, jobcard_audittrail:jobcard_audittrail}}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Photo Info done")
				res.redirect("/inicio");
			}
		});

	});


	router.post("/updateconcernsinfoJobcardInfo/:id",  upload.any(), async function(req, res){
		var userData= req.session.usuario;
		var id = req.params.id;
		var jobcard = req.body;

		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
	    var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
	    var ano = (new Date()).getFullYear();
	    var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

		var procurajobcard = await jobcards.findOne({_id:id}, {jobcard_audittrail:1}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find jobcard");
			}
		}).lean();


		var arrAudit = procurajobcard.jobcard_audittrail;
		var lastaudittrail = arrAudit[arrAudit.length-1];

		if((lastaudittrail.jobcard_audittrailname == userData.nome) && (lastaudittrail.jobcard_audittrailaction == "Update Jobcard")){

        arrAudit[arrAudit.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

	    }else{

	      var jobcard_audittrailObject = {};
	      // jobcard_audittrailObject._id = "";
	      jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
	      jobcard_audittrailObject.jobcard_audittrailaction = "Update Jobcard";
	      jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
	      arrAudit.push(jobcard_audittrailObject);
	    }

	    var jobcard_audittrail = arrAudit;

		jobcards.updateOne({_id:id},{$set:{data_ultimaactualizacaojobcard:new Date(), jobcardconcernsinfo:jobcard, jobcard_backofficeagent:userData.nome, jobcard_audittrail:jobcard_audittrail}}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Concerns Info done")
				res.redirect("/inicio");
			}
		});

	});

	router.post("/sendforapprovalproject",  upload.any(), async function(req, res){
		var userData= req.session.usuario;
		var jobcard = req.body;
		

		jobcard.jobcard_controlador = [1,1,1];
		jobcard.jobcard_estadoactual = "Awaiting approval";
		
		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
        var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
        var ano = (new Date()).getFullYear();
        var todaydate = dia + "/" + mes + "/" + ano;
        var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

        var jobcard_audittrail = {};
        jobcard_audittrail.jobcard_audittrailname = userData.nome;
        jobcard_audittrail.jobcard_audittrailaction = "Send for approval";
        jobcard_audittrail.jobcard_audittraildate = todaydate + "  " + todayhours;


		var procura = await jobcardprojects.findOne({_id:jobcard.jobcard_id}, {jobcard_linemanagerid:1, jobcard_projectnumber:1, jobcard_projectnumber:1, jobcard_tecniconome:1}, function(err, data){
			if(err){
            	console.log(err);
       		}else{
        		console.log("Find Jobcard");
        	}
		}).lean();

	var procurauser = await model.findOne({_id:procura.jobcard_linemanagerid}, {idioma:1, email:1}, function(err,dataUser){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}else{
			console.log("Find User")

		}
	}).lean();
	

		emailSender.createConnection();
		emailSender.sendEmailSendJobcardAprrovalProject(procura,procurauser);
		
		jobcardprojects.findOneAndUpdate({_id:jobcard.jobcard_id}, {$push:{jobcard_controladorintervenientes:userData.nome, jobcard_audittrail:jobcard_audittrail}, $set:{data_ultimaactualizacaojobcard:new Date() ,jobcard_estadoactual:jobcard.jobcard_estadoactual,jobcard_controlador:jobcard.jobcard_controlador}}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				
				res.redirect("/inicio");
			}
		});

	});


    router.post("/notifycallcentercallout",  upload.any(), async function(req, res){
        var userData= req.session.usuario;
        var jobcard = req.body;

        jobcard.jobcard_estadoactual = "Awaiting approval";
        
        var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
        var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
        var ano = (new Date()).getFullYear();
        var todaydate = dia + "/" + mes + "/" + ano;
        var todayhours = new Date().getHours() + ":" + new Date().getMinutes();


        var procura = await jobcards.findOne({_id:jobcard.jobcard_id}, {jobcard_audittrail:1, jobcard_linemanagerid:1, jobcard_siteid:1, jobcard_jobtype:1, jobcard_ttnumber:1, jobcard_site:1, jobcard_tecniconome:1, jobcard_tecnicoid:1}, function(err, data){
            if(err){
                console.log(err);
            }else{
                console.log("Find Jobcard");
            }
        }).lean();


        var arrAudit = procura.jobcard_audittrail;
		var lastaudittrail = arrAudit[arrAudit.length-1];

        if((lastaudittrail.jobcard_audittrailname == userData.nome) && (lastaudittrail.jobcard_audittrailaction == "Sent for approval")){

        arrAudit[arrAudit.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

	    }else{

	      var jobcard_audittrailObject = {};
	      // jobcard_audittrailObject._id = "";
	      jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
	      jobcard_audittrailObject.jobcard_audittrailaction = "Sent for approval";
	      jobcard_audittrailObject.jobcard_audittraildate = todaydate + "  " + todayhours;
	      arrAudit.push(jobcard_audittrailObject);
	    }

        var procurauser = await model.findOne({_id:procura.jobcard_linemanagerid}, {idioma:1, email:1, nome:1}, function(err,dataUser){
            if(err){
                console.log("ocorreu um erro ao tentar aceder os dados")
            }else{
                console.log("Find User")

            }
        }).lean();

        var mailrecip = [];
        mailrecip.push(procurauser.email);

        if(procura.jobcard_siteid != ""){

            var procurasiteinfo = await siteinfos.findOne({_id:procura.jobcard_siteid}, {siteinfo_sitename:1}, function(err, data){
                if(err){
                    console.log(err);
                }else{
                    console.log("Find Jobcard");
                }
            }).lean();

        }else{

            var procurasiteinfo = {};
            procurasiteinfo.siteinfo_sitename = "";
        }


        var procuracallcenterstaff = await model.find({funcao:"Call Center"}, {email:1}, function(err,dataCallCenter){
            if(err){
                console.log("ocorreu um erro ao tentar aceder os dados")
            }else{
                console.log("Find User")

            }
        }).lean();

        for( i = 0; i < procuracallcenterstaff.length; i++){

            mailrecip.push(procuracallcenterstaff[i].email);

        }

        var procuratecnico = await model.findOne({_id:procura.jobcard_tecnicoid}, {telefone_1:1}, function(err,dataUser){
            if(err){
                console.log("ocorreu um erro ao tentar aceder os dados")
            }else{
                console.log("Find Technician")

            }
        }).lean();

        emailSender.createConnection();
            emailSender.sendEmailSendJobcardAprroval(procura,mailrecip, procurasiteinfo);

        if(jobcard.jobcard_healthsafety == "Yes"){
            var procurahealthsafety1 = await model.findOne({nome:"Sandra Dias"},{email:1}, function(err,dataUser){
                if(err){
                console.log("ocorreu um erro ao tentar aceder os dados")
                }else{
                console.log("Find User")

                }
            }).lean();


            emailSender.createConnection();
            emailSender.sendEmailHSProblem(procura, procurahealthsafety1, jobcard.jobcard_hsreason, procurasiteinfo, procuratecnico);
        }

        jobcard.jobcard_controlador = [1,1,1];
        var jobcard_audittrail = arrAudit;
        
        jobcards.findOneAndUpdate({_id:jobcard.jobcard_id}, {$set:{jobcard_controlador:jobcard.jobcard_controlador,jobcard_audittrail:jobcard_audittrail, data_ultimaactualizacaojobcard:new Date(),jobcard_estadoactual:jobcard.jobcard_estadoactual, jobcard_remedialaction:jobcard.jobcard_remedialaction, jobcard_healthsafety:jobcard.jobcard_healthsafety, jobcard_hsreason:jobcard.jobcard_hsreason}}, function(err, data){
            if(err){
                console.log("ocorreu um erro ao tentar aceder os dados")
            }
            else{
                console.log("Sent for approval")
                res.redirect("/inicio");
            }
        });

    });


	router.post("/notifycallcenterplanned",  upload.any(), async function(req, res){
		var userData= req.session.usuario;
		var jobcard = req.body;

		jobcard.jobcard_estadoactual = "Awaiting approval";
		
		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
        var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
        var ano = (new Date()).getFullYear();
        var todaydate = dia + "/" + mes + "/" + ano;
        var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

        
		var procura = await jobcards.findOne({_id:jobcard.jobcard_id}, {jobcard_audittrail:1,jobcard_linemanagerid:1, jobcard_siteid:1, jobcard_jobtype:1, jobcard_ttnumber:1, jobcard_site:1, jobcard_tecniconome:1, jobcard_tecnicoid:1}, function(err, data){
			if(err){
            	console.log(err);
       		}else{
        		console.log("Find Jobcard");
        	}
		}).lean();


		var arrAudit = procura.jobcard_audittrail;
		var lastaudittrail = arrAudit[arrAudit.length-1];

        if((lastaudittrail.jobcard_audittrailname == userData.nome) && (lastaudittrail.jobcard_audittrailaction == "Sent for approval")){

        arrAudit[arrAudit.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

	    }else{

	      var jobcard_audittrailObject = {};
	      // jobcard_audittrailObject._id = "";
	      jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
	      jobcard_audittrailObject.jobcard_audittrailaction = "Sent for approval";
	      jobcard_audittrailObject.jobcard_audittraildate = todaydate + "  " + todayhours;
	      arrAudit.push(jobcard_audittrailObject);
	    }


	    var jobcard_audittrail = arrAudit;

		var procurauser = await model.findOne({_id:procura.jobcard_linemanagerid}, {idioma:1, email:1, nome:1}, function(err,dataUser){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}else{
				console.log("Find User")

			}
		}).lean();

		var mailrecip = [];
		mailrecip.push(procurauser.email);

		if(procura.jobcard_siteid != ""){

			var procurasiteinfo = await siteinfos.findOne({_id:procura.jobcard_siteid}, {siteinfo_sitename:1}, function(err, data){
				if(err){
		        	console.log(err);
		   		}else{
		    		console.log("Find Jobcard");
		    	}
			}).lean();

		}else{

			var procurasiteinfo = {};
			procurasiteinfo.siteinfo_sitename = "";
		}


		var procuracallcenterstaff = await model.find({funcao:"Call Center"}, {email:1}, function(err,dataCallCenter){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}else{
				console.log("Find User")

			}
		}).lean();

		for( i = 0; i < procuracallcenterstaff.length; i++){

			mailrecip.push(procuracallcenterstaff[i].email);

		}

        var procuratecnico = await model.findOne({_id:procura.jobcard_tecnicoid}, {telefone_1:1}, function(err,dataUser){
            if(err){
                console.log("ocorreu um erro ao tentar aceder os dados")
            }else{
                console.log("Find Technician")

            }
        }).lean();

        emailSender.createConnection();
        emailSender.sendEmailSendJobcardAprrovalPlanned(procura,mailrecip, procurasiteinfo);

        if(jobcard.jobcard_healthsafety == "Yes"){
            var procurahealthsafety1 = await model.findOne({nome:"Sandra Dias"},{email:1}, function(err,dataUser){
                if(err){
                console.log("ocorreu um erro ao tentar aceder os dados")
                }else{
                console.log("Find User")

                }
            }).lean();


            emailSender.createConnection();
            emailSender.sendEmailHSProblem(procura, procurahealthsafety1, jobcard.jobcard_hsreason, procurasiteinfo, procuratecnico);
        }

        var jobcard_controlador = [1,1,1];
		
		jobcards.findOneAndUpdate({_id:jobcard.jobcard_id}, {$set:{jobcard_audittrail:jobcard_audittrail,jobcard_controlador:jobcard_controlador,data_ultimaactualizacaojobcard:new Date(),jobcard_estadoactual:jobcard.jobcard_estadoactual, jobcard_workstatus:jobcard.jobcard_workstatus, jobcard_healthsafety:jobcard.jobcard_healthsafety, jobcard_hsreason:jobcard.jobcard_hsreason}}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Sent for approval")
				res.redirect("/inicio");
			}
		});

	});

	router.post("/updatesaidasitecalloutproject",  upload.any(), async function(req, res){
		var userData= req.session.usuario;
		var jobcard = req.body;

		// jobcard.jobcard_audittrailObject = JSON.parse(req.body.jobcard_audittrailObject);

		var geolocationJobcardInfo = {};
		geolocationJobcardInfo.jobcard_latitude = jobcard.geolocationlatitude;
		geolocationJobcardInfo.jobcard_longitude = jobcard.geolocationlongitude;

		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
	    var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
	    var ano = (new Date()).getFullYear();
	    var todaydate = dia + "/" + mes + "/" + ano;
	    var todayhours = new Date();
	    var todaytime = todayhours.getHours() + ":" + todayhours.getMinutes();

	    var jobcard_sitedeparturedate = todaydate;
      	var jobcard_sitedeparturetime = todaytime;
      	var jobcard_workstatus = "";

      	var jobcard_audittrailObject = {};
      	jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
      	if(jobcard.geomessage == ""){
      		jobcard_audittrailObject.jobcard_audittrailaction = "Left site";
      	}else{
      		jobcard_audittrailObject.jobcard_audittrailaction = "Left site. " + jobcard.geomessage;
      	}
      	
      	jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todaytime;


      	var procuraproject = await jobcardprojects.findOne({_id:jobcard.jobcard_id}, {jobcard_sitearrivaltime:1, jobcard_loggedby:1, jobcard_linemanagerid:1, jobcard_tecnicoid:1, jobcard_projectnumber:1, jobcard_tecniconome:1, jobcard_site:1}, function(err, data){
			if(err){
            	console.log(err);
       		}else{
        		console.log("Find Project");
        	}
		}).lean();


		var jobcard_sitearrivaltime = procuraproject.jobcard_sitearrivaltime;

		var start = jobcard_sitearrivaltime;
		var end = todaytime;

		var jobcard_arrivaldepartureduration = diff(start, end);

		function diff(start, end) {
		    start = start.split(":");
		    end = end.split(":");
		    var startDate = new Date(0, 0, 0, parseInt(start[0]), parseInt(start[1]), 0);
		    var endDate = new Date(0, 0, 0, parseInt(end[0]), parseInt(end[1]), 0);
		    var diff = endDate.getTime() - startDate.getTime();
		    var hours = Math.floor(diff / 1000 / 60 / 60);
		    diff -= hours * 1000 * 60 * 60;
		    var minutes = Math.floor(diff / 1000 / 60);
		    
		    return (hours < 9 ? "0" : "") + hours + ":" + (minutes < 9 ? "0" : "") + minutes;
		}

		var procuracallcenter = await model.findOne({nome:procuraproject.jobcard_loggedby}, {idioma:1, email:1}, function(err,dataUser){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}else{
				console.log("Find User")

			}
		}).lean();

		var procuralinemanager = await model.findOne({_id:procuraproject.jobcard_linemanagerid}, {idioma:1, email:1}, function(err,dataUser){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}else{
				console.log("Find User")

			}
		}).lean();


		var procuratecnico = await model.findOne({_id:procuraproject.jobcard_tecnicoid}, {jobcard_projectnumber:1, jobcard_tecniconome:1, jobcard_site:1}, function(err,dataUser){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}else{
				console.log("Find User")

			}
		}).lean();


		emailSender.createConnection();
		emailSender.sendEmailLeavesiteproject(procuraproject,procuracallcenter);

		emailSender.createConnection();
		emailSender.sendEmailLeavesiteproject(procuraproject,procuralinemanager);

		if(jobcard.jobcard_healthsafety == "Yes"){
			var procurahealthsafety1 = await model.findOne({nome:"Sandra Dias"}, function(err,dataUser){
				if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
				}else{
				console.log("Find User")

				}
			});

			

			emailSender.createConnection();
			emailSender.sendEmailHSProblemProject(procuraproject, procurahealthsafety1, jobcard.jobcard_hsreason, procuratecnico);
		}
		
      	jobcard.jobcard_estadoactual = "Left Site";
		
		jobcardprojects.updateOne({_id:jobcard.jobcard_id},{$push:{jobcard_audittrail:jobcard_audittrailObject, geolocationJobcardInfo:geolocationJobcardInfo}, $set:{data_ultimaactualizacaojobcard:new Date(), jobcard_estadoactual:jobcard.jobcard_estadoactual,jobcard_workstatus:jobcard_workstatus,jobcard_remedialaction:jobcard.jobcard_remedialaction, jobcard_healthsafety:jobcard.jobcard_healthsafety, jobcard_hsreason:jobcard.jobcard_hsreason, jobcard_sitedeparturedate:jobcard_sitedeparturedate, jobcard_sitedeparturetime:jobcard_sitedeparturetime, jobcard_arrivaldepartureduration:jobcard_arrivaldepartureduration}}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("update saida")
				res.redirect("/inicio");
			}
		});

	});

	router.post("/updatesaidasitecallout",  upload.any(), async function(req, res){
		var userData= req.session.usuario;
		var jobcard = req.body;

		// jobcard.jobcard_audittrailObject = JSON.parse(req.body.jobcard_audittrailObject);

		var geolocationJobcardInfo = {};
		geolocationJobcardInfo.jobcard_latitude = jobcard.geolocationlatitude;
		geolocationJobcardInfo.jobcard_longitude = jobcard.geolocationlongitude;

		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
	    var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
	    var ano = (new Date()).getFullYear();
	    var todaydate = dia + "/" + mes + "/" + ano;
	    var todayhours = new Date();
	    var todaytime = todayhours.getHours() + ":" + todayhours.getMinutes();

	    var jobcard_sitedeparturedate = todaydate;
      	var jobcard_sitedeparturetime = todaytime;
      	var jobcard_workstatus = "";

      	var jobcard_audittrailObject = {};
      	jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
      	if(jobcard.geomessage == ""){
      		jobcard_audittrailObject.jobcard_audittrailaction = "Left the site";
      	}else{
      		jobcard_audittrailObject.jobcard_audittrailaction = "Left the site. " + jobcard.geomessage;
      	}
      	
      	jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todaytime;


      	var procurajobcard = await jobcards.findOne({_id:jobcard.jobcard_id},{jobcard_sitearrivaltime:1, jobcard_horareporte:1, data_registojobcard1:1, jobcard_loggedby:1, jobcard_linemanagerid:1, jobcard_tecnicoid:1, jobcard_siteid:1, jobcard_ttnumber:1, jobcard_site:1, jobcard_tecniconome:1}, function(err, data){
			if(err){
            	console.log(err);
       		}else{
        		console.log("Find Jobcard");
        	}
		}).lean();


		var jobcard_sitearrivaltime = procurajobcard.jobcard_sitearrivaltime;

		var start = jobcard_sitearrivaltime;
		var jobcard_sitecreationdate = procurajobcard.data_registojobcard1;
		var creationtime = procurajobcard.jobcard_horareporte;
		var end = todaytime;

		var jobcard_arrivaldepartureduration = diff(start, end);
		var jobcard_responsetime = difference(creationtime,end,jobcard_sitecreationdate);

		function diff(start, end) {
		    start = start.split(":");
		    end = end.split(":");
		    var startDate = new Date(0, 0, 0, parseInt(start[0]), parseInt(start[1]), 0);
		    var endDate = new Date(0, 0, 0, parseInt(end[0]), parseInt(end[1]), 0);
		    var diff = endDate.getTime() - startDate.getTime();
		    var hours = Math.floor(diff / 1000 / 60 / 60);
		    diff -= hours * 1000 * 60 * 60;
		    var minutes = Math.floor(diff / 1000 / 60);
		    
		    return (hours < 9 ? "0" : "") + hours + ":" + (minutes < 9 ? "0" : "") + minutes;
		}

		function difference(creationtime, end, jobcard_sitecreationdate) {
		    creationtime = creationtime.split(":");
		    end = end.split(":");
			jobcard_sitecreationdate = jobcard_sitecreationdate.split("/");
		    var startTime = new Date(0, 0, 0, parseInt(creationtime[0]), parseInt(creationtime[1]), 0);
		    var endTime = new Date(0, 0, 0, parseInt(end[0]), parseInt(end[1]), 0);
			var startDate = new Date(parseInt(jobcard_sitecreationdate[2]), parseInt(jobcard_sitecreationdate[1]), parseInt(jobcard_sitecreationdate[0]),0,0,0)
			var endDate = new Date(parseInt(ano), parseInt(mes), parseInt(dia) , 0, 0, 0);
			if(endTime.getTime() < startTime.getTime()){
				var diff = startTime.getTime() - endTime.getTime();
			}else{
				var diff = endTime.getTime() - startTime.getTime();
			}
			var diffDays = endDate.getTime() - startDate.getTime();
			console.log(diff);
			console.log(diffDays+" dias em ms");
		    var hours = Math.floor(diff / 1000 / 60 / 60);
			var days = Math.floor(diffDays / 1000 / 60 / 60 / 24);
			console.log("A hora de inicio, hora de fim e o numero de dias são:");
			jobcard_responsedays = days - 1;
			console.log(startTime.toLocaleString("en-GB"), endTime.toLocaleString("en-GB"), days);
		    diff -= hours * 1000 * 60 * 60;
		    var minutes = Math.floor(diff / 1000 / 60);
		    console.log("O tempo de resposta é" + hours+":"+minutes);
			return (hours < 9 ? "0" : "") + hours + ":" + (minutes < 9 ? "0" : "") + minutes;
		}

		var procuracallcenter = await model.find({funcao:"Call Center"}, {email:1, idioma:1}, function(err,dataUser){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}else{
				console.log("Find Call Center")

			}
		}).lean();

		var procuralinemanager = await model.findOne({_id:procurajobcard.jobcard_linemanagerid}, {email:1}, function(err,dataUser){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}else{
				console.log("Find Line Manager")

			}
		}).lean();

		var procuratecnico = await model.findOne({_id:procurajobcard.jobcard_tecnicoid}, {telefone_1:1}, function(err,dataUser){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}else{
				console.log("Find Technician")

			}
		}).lean();

		if(procurajobcard.jobcard_siteid != ""){
			var procurasiteinfo = await siteinfos.findOne({_id:procurajobcard.jobcard_siteid}, {siteinfo_sitename:1}, function(err, data){
				if(err){
	            	console.log(err);
	       		}else{
	        		console.log("Find SiteInfo");
	        	}
			}).lean();
		}else{
			var procurasiteinfo = {};
			procurasiteinfo.siteinfo_sitename = "";
		}

		

		

		var mailrecip = [];
		mailrecip.push(procuralinemanager.email);
		for( i = 0; i < procuracallcenter.length; i++){

			mailrecip.push(procuracallcenter[i].email);

		}
		
		emailSender.createConnection();
		emailSender.sendEmailCallcenter2(procurajobcard,mailrecip, procurasiteinfo);

		
      	jobcard.jobcard_estadoactual = "Work Done";
      	jobcard.ttnumber_status = "Complete";
      	jobcard.jobcard_controlador = [1,1,1,1,1];

		
		jobcards.updateOne({_id:jobcard.jobcard_id},{$push:{jobcard_audittrail:jobcard_audittrailObject, geolocationJobcardInfo:geolocationJobcardInfo}, $set:{jobcard_controlador:jobcard.jobcard_controlador,data_ultimaactualizacaojobcard:new Date() ,ttnumber_status:jobcard.ttnumber_status,jobcard_estadoactual:jobcard.jobcard_estadoactual,jobcard_workstatus:jobcard_workstatus, jobcard_sitedeparturedate:jobcard_sitedeparturedate, jobcard_sitedeparturetime:jobcard_sitedeparturetime, jobcard_arrivaldepartureduration:jobcard_arrivaldepartureduration,jobcard_responsetime:jobcard_responsetime, jobcard_responsedays:jobcard_responsedays}}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("update saida")
				res.redirect("/inicio");
			}
		});

	});

	router.post("/updatesaidasiteplanned",  upload.any(), async function(req, res){
		var userData= req.session.usuario;
		var jobcard = req.body;

		var geolocationJobcardInfo = {};
		geolocationJobcardInfo.jobcard_latitude = jobcard.geolocationlatitude;
		geolocationJobcardInfo.jobcard_longitude = jobcard.geolocationlongitude;

		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
	    var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
	    var ano = (new Date()).getFullYear();
	    var todaydate = dia + "/" + mes + "/" + ano;
	    var todayhours = new Date();
	    var todaytime = todayhours.getHours() + ":" + todayhours.getMinutes();

	    var jobcard_sitedeparturedate = todaydate;
      	var jobcard_sitedeparturetime = todaytime;
      	jobcard.jobcard_estadoactual = "Work Done";
      	jobcard.ttnumber_status = "Complete";


      	var jobcard_audittrailObject = {};
      	jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
      	if(jobcard.geomessage == ""){
      		jobcard_audittrailObject.jobcard_audittrailaction = "Left site";
      	}else{
      		jobcard_audittrailObject.jobcard_audittrailaction = "Left site. " + jobcard.geomessage;
      	}
      	
      	jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todaytime;

      	var procurajobcard = await jobcards.findOne({_id:jobcard.jobcard_id}, {jobcard_sitearrivaltime:1, jobcard_linemanager:1, jobcard_tecnicoid:1, jobcard_siteid:1, jobcard_ttnumber:1, jobcard_site:1, jobcard_tecniconome:1}, function(err, data){
			if(err){
            	console.log(err);
       		}else{
        		console.log("Find Jobcard");
        	}
		}).lean();


		var jobcard_sitearrivaltime = procurajobcard.jobcard_sitearrivaltime;

		var start = jobcard_sitearrivaltime;
		var end = todaytime;

		var jobcard_arrivaldepartureduration = diff(start, end);

		function diff(start, end) {
		    start = start.split(":");
		    end = end.split(":");
		    var startDate = new Date(0, 0, 0, parseInt(start[0]), parseInt(start[1]), 0);
		    var endDate = new Date(0, 0, 0, parseInt(end[0]), parseInt(end[1]), 0);
		    var diff = endDate.getTime() - startDate.getTime();
		    var hours = Math.floor(diff / 1000 / 60 / 60);
		    diff -= hours * 1000 * 60 * 60;
		    var minutes = Math.floor(diff / 1000 / 60);
		    
		    return (hours < 9 ? "0" : "") + hours + ":" + (minutes < 9 ? "0" : "") + minutes;
		}


		var procuralinemanager = await model.findOne({nome:procurajobcard.jobcard_linemanager}, {idioma:1, email:1}, function(err,dataUser){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}else{
				console.log("Find User")

			}
		}).lean();

		var procuracallcenter = await model.find({funcao:"Call Center"}, {email:1, idioma:1}, function(err,dataUser){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}else{
				console.log("Find Call Center")

			}
		}).lean();

		var procuratecnico = await model.findOne({_id:procurajobcard.jobcard_tecnicoid}, {idioma:1, email:1, telefone_1:1}, function(err,dataUser){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}else{
				console.log("Find User")

			}
		}).lean();

		if(procurajobcard.jobcard_siteid != ""){

			var procurasiteinfo = await siteinfos.findOne({_id:procurajobcard.jobcard_siteid}, {siteinfo_sitename:1}, function(err, data){
				if(err){
	            	console.log(err);
	       		}else{
	        		console.log("Find Jobcard");
	        	}
			}).lean();
		}else{

			var procurasiteinfo = {};
			procurasiteinfo.siteinfo_sitename = "";
		}


		var mailrecip = [];
		mailrecip.push(procuralinemanager.email);
		for( i = 0; i < procuracallcenter.length; i++){

			mailrecip.push(procuracallcenter[i].email);

		}


		emailSender.createConnection();
		emailSender.sendEmailCallcenter2Planned(procurajobcard,mailrecip, procurasiteinfo);
      	
		
		jobcards.updateOne({_id:jobcard.jobcard_id},{$push:{jobcard_controlador:1, jobcard_audittrail:jobcard_audittrailObject, geolocationJobcardInfo:geolocationJobcardInfo}, $set:{ttnumber_status:jobcard.ttnumber_status, data_ultimaactualizacaojobcard:new Date(), jobcard_estadoactual:jobcard.jobcard_estadoactual, jobcard_sitedeparturedate:jobcard_sitedeparturedate, jobcard_sitedeparturetime:jobcard_sitedeparturetime, jobcard_arrivaldepartureduration:jobcard_arrivaldepartureduration}}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Technician left site")
				res.redirect("/inicio");
			}
		});

	});

	router.post("/updatechegadasite",  upload.any(), async function(req, res){
		var userData= req.session.usuario;
		var jobcard = req.body;


		var geolocationJobcardInfo = {};
		geolocationJobcardInfo.jobcard_latitude = jobcard.geolocationlatitude;
		geolocationJobcardInfo.jobcard_longitude = jobcard.geolocationlongitude;


		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
        var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
        var ano = (new Date()).getFullYear();
        var todaydate = dia + "/" + mes + "/" + ano;

        var todayhours = new Date();
        var todaytime = todayhours.getHours() + ":" + todayhours.getMinutes();

        
        jobcard.jobcard_sitearrivaldate = todaydate;
        jobcard.jobcard_sitearrivaltime = todaytime;
        jobcard.jobcard_estadoactual = "On site";
        var maintenancedate = await new Date(todaydate.split('/').reverse().join('-'));


        var procurajobcard = await jobcards.findOne({_id:jobcard.jobcard_id}, {jobcard_tecarrivaltime:1, jobcard_linemanagerid:1, jobcard_loggedby:1, jobcard_siteid:1, jobcard_ttnumber:1, jobcard_site:1, jobcard_tecniconome:1}, function(err, data){
			if(err){
            	console.log(err);
       		}else{
        		console.log("Find Jobcard");
        	}
		}).lean();


		var jobcard_tecarrivaltime = procurajobcard.jobcard_tecarrivaltime;

		var start = jobcard_tecarrivaltime;
		var end = todaytime;

		var jobcard_tecarrivalduration = diff(start, end);

		function diff(start, end) {
		    start = start.split(":");
		    end = end.split(":");
		    var startDate = new Date(0, 0, 0, parseInt(start[0]), parseInt(start[1]), 0);
		    var endDate = new Date(0, 0, 0, parseInt(end[0]), parseInt(end[1]), 0);
		    var diff = endDate.getTime() - startDate.getTime();
		    var hours = Math.floor(diff / 1000 / 60 / 60);
		    diff -= hours * 1000 * 60 * 60;
		    var minutes = Math.floor(diff / 1000 / 60);
		    
		    return (hours < 9 ? "0" : "") + hours + ":" + (minutes < 9 ? "0" : "") + minutes;
		}
        

        var jobcard_audittrailObject = {};
        jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
        if(jobcard.geomessage == ""){
        	// jobcard_audittrailObject.jobcard_audittrailaction = "Arrives on site";
			jobcard_audittrailObject.jobcard_audittrailaction = "Chegada ao site";

        }else{
        	// jobcard_audittrailObject.jobcard_audittrailaction = "Arrives on site. " + jobcard.geomessage;
			jobcard_audittrailObject.jobcard_audittrailaction = "Chegada ao site. " + jobcard.geomessage;

        }
        jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todaytime;

        var procuralinemanager = await model.findOne({_id:procurajobcard.jobcard_linemanagerid}, {email:1}, function(err,dataUser){
				if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
				}else{
				console.log("Find User")

				}
			}).lean();


        var procuracallcenter = await model.find({funcao:"Call Center"}, {email:1}, function(err,dataUser){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}else{
				console.log("Find User")

			}
		}).lean();


		var mailrecip = [];
		mailrecip.push(procuralinemanager.email);

		for( i = 0; i < procuracallcenter.length; i++){

			mailrecip.push(procuracallcenter[i].email);

		}
		

		if(procurajobcard.jobcard_siteid != ""){

			var procurasiteinfo = await siteinfos.findOne({_id:procurajobcard.jobcard_siteid}, {siteinfo_sitename:1}, function(err,dataUser){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}else{
					console.log("Find User")

				}
			}).lean();

			
		}else{

			var procurasiteinfo = {};
			 procurasiteinfo.siteinfo_sitename = "";
		}

		emailSender.createConnection();
		emailSender.sendEmailCallcenter1(procurajobcard, mailrecip, procurasiteinfo);
       
		
		jobcards.updateOne({_id:jobcard.jobcard_id},{$push:{jobcard_audittrail:jobcard_audittrailObject, geolocationJobcardInfo:geolocationJobcardInfo}, $set:{data_ultimaactualizacaojobcard:new Date(),jobcard_maintenancedate:maintenancedate,jobcard_estadoactual:jobcard.jobcard_estadoactual, jobcard_sitearrivaldate:jobcard.jobcard_sitearrivaldate, jobcard_sitearrivaltime:jobcard.jobcard_sitearrivaltime, jobcard_tecarrivalduration:jobcard_tecarrivalduration}}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Technician arrived on site")
				res.redirect("/inicio");
			}
		});

	});

	router.post("/updatechegadasiteproject",  upload.any(), async function(req, res){
		var userData= req.session.usuario;
		var jobcard = req.body;


		var geolocationJobcardInfo = {};
		geolocationJobcardInfo.jobcard_latitude = jobcard.geolocationlatitude;
		geolocationJobcardInfo.jobcard_longitude = jobcard.geolocationlongitude;


		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
        var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
        var ano = (new Date()).getFullYear();
        var todaydate = dia + "/" + mes + "/" + ano;

        var todayhours = new Date();
        var todaytime = todayhours.getHours() + ":" + todayhours.getMinutes();

        
        jobcard.jobcard_sitearrivaldate = todaydate;
        jobcard.jobcard_sitearrivaltime = todaytime;
        jobcard.jobcard_estadoactual = "On site";
        var maintenancedate = await new Date(todaydate.split('/').reverse().join('-'));


        var procuraproject = await jobcardprojects.findOne({_id:jobcard.jobcard_id}, {jobcard_tecarrivaltime:1, jobcard_linemanagerid:1, jobcard_loggedby:1, jobcard_projectnumber:1, jobcard_tecniconome:1, jobcard_site:1}, function(err, data){
			if(err){
            	console.log(err);
       		}else{
        		console.log("Find Project");
        	}
		}).lean();


		var jobcard_tecarrivaltime = procuraproject.jobcard_tecarrivaltime;

		var start = jobcard_tecarrivaltime;
		var end = todaytime;

		var jobcard_tecarrivalduration = diff(start, end);

		function diff(start, end) {
		    start = start.split(":");
		    end = end.split(":");
		    var startDate = new Date(0, 0, 0, parseInt(start[0]), parseInt(start[1]), 0);
		    var endDate = new Date(0, 0, 0, parseInt(end[0]), parseInt(end[1]), 0);
		    var diff = endDate.getTime() - startDate.getTime();
		    var hours = Math.floor(diff / 1000 / 60 / 60);
		    diff -= hours * 1000 * 60 * 60;
		    var minutes = Math.floor(diff / 1000 / 60);
		    
		    return (hours < 9 ? "0" : "") + hours + ":" + (minutes < 9 ? "0" : "") + minutes;
		}
        

        var jobcard_audittrailObject = {};
        jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
        if(jobcard.geomessage == ""){
        	jobcard_audittrailObject.jobcard_audittrailaction = "Arrives on site";
        }else{
        	jobcard_audittrailObject.jobcard_audittrailaction = "Arrives on site. " + jobcard.geomessage;
        }
        
        jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todaytime;

        var procuralinemanager = await model.findOne({_id:procuraproject.jobcard_linemanagerid}, {idioma:1, email:1}, function(err,dataUser){
			if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
			}else{
			console.log("Find User")

			}
		}).lean();


        	var procuracallcenter = await model.findOne({nome:procuraproject.jobcard_loggedby}, {idioma:1, email:1}, function(err,dataUser){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}else{
					console.log("Find User")

				}
			});


			emailSender.createConnection();
			emailSender.sendEmailChegadaProjecto(procuraproject,procuralinemanager);

			emailSender.createConnection();
			emailSender.sendEmailChegadaProjecto(procuraproject,procuracallcenter);
		
		jobcardprojects.updateOne({_id:jobcard.jobcard_id},{$push:{jobcard_audittrail:jobcard_audittrailObject, geolocationJobcardInfo:geolocationJobcardInfo}, $set:{data_ultimaactualizacaojobcard:new Date(),jobcard_maintenancedate:maintenancedate,jobcard_estadoactual:jobcard.jobcard_estadoactual, jobcard_sitearrivaldate:jobcard.jobcard_sitearrivaldate, jobcard_sitearrivaltime:jobcard.jobcard_sitearrivaltime, jobcard_tecarrivalduration:jobcard_tecarrivalduration}}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Technician arrived on site")
				res.redirect("/inicio");
			}
		});

	});

	
	router.post("/updatechegadasiteplanned",  upload.any(), async function(req, res){
		var userData= req.session.usuario;
		var jobcard = req.body;


		var geolocationJobcardInfo = {};
		geolocationJobcardInfo.jobcard_latitude = jobcard.geolocationlatitude;
		geolocationJobcardInfo.jobcard_longitude = jobcard.geolocationlongitude;


		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
        var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
        var ano = (new Date()).getFullYear();
        var todaydate = dia + "/" + mes + "/" + ano;

        var todayhours = new Date();
        var todaytime = todayhours.getHours() + ":" + todayhours.getMinutes();

        
        jobcard.jobcard_sitearrivaldate = todaydate;
        jobcard.jobcard_sitearrivaltime = todaytime;
        jobcard.jobcard_estadoactual = "On site";


        var procurajobcard = await jobcards.findOne({_id:jobcard.jobcard_id}, {jobcard_tecarrivaltime:1, jobcard_linemanagerid:1, jobcard_siteid:1, jobcard_site:1, jobcard_tecniconome:1}, function(err, data){
			if(err){
            	console.log(err);
       		}else{
        		console.log("Find Jobcard");
        	}
		}).lean();


		var jobcard_tecarrivaltime = procurajobcard.jobcard_tecarrivaltime;

		var start = jobcard_tecarrivaltime;
		var end = todaytime;

		var jobcard_tecarrivalduration = diff(start, end);

		function diff(start, end) {
		    start = start.split(":");
		    end = end.split(":");
		    var startDate = new Date(0, 0, 0, parseInt(start[0]), parseInt(start[1]), 0);
		    var endDate = new Date(0, 0, 0, parseInt(end[0]), parseInt(end[1]), 0);
		    var diff = endDate.getTime() - startDate.getTime();
		    var hours = Math.floor(diff / 1000 / 60 / 60);
		    diff -= hours * 1000 * 60 * 60;
		    var minutes = Math.floor(diff / 1000 / 60);
		    
		    return (hours < 9 ? "0" : "") + hours + ":" + (minutes < 9 ? "0" : "") + minutes;
		}
        

        var jobcard_audittrailObject = {};
        jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
        if(jobcard.geomessage == ""){
        	jobcard_audittrailObject.jobcard_audittrailaction = "Arrives on site";
        }else{
        	jobcard_audittrailObject.jobcard_audittrailaction = "Arrives on site. " + jobcard.geomessage;
        }
        
        jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todaytime;

        var procuralinemanager = await model.findOne({_id:procurajobcard.jobcard_linemanagerid}, {email:1, idioma:1}, function(err,dataUser){
				if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
				}else{
				console.log("Find User")

				}
			}).lean();

        var mailrecip = [];
        mailrecip.push(procuralinemanager.email);

        if(procurajobcard.jobcard_siteid != ""){

        	var procurasiteinfo = await siteinfos.findOne({_id:procurajobcard.jobcard_siteid}, {siteinfo_sitename:1}, function(err,dataUser){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}else{
					console.log("Find User")

				}
			}).lean();

        }else{

        	var procurasiteinfo = {};
        	procurasiteinfo.siteinfo_sitename = "";
        }


		//mudar e procurar por funcao:"Back Office Manager"
		var procuracallcenter = await model.find({funcao:"Call Center"}, {email:1}, function(err,dataUser){
			if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
			}else{
			console.log("Find User")

			}
		}).lean();

		for( i = 0; i < procuracallcenter.length; i++){

			mailrecip.push(procuracallcenter[i].email);

		}


		emailSender.createConnection();
		emailSender.sendEmailCallcenter1Planned(procurajobcard, mailrecip, jobcard.jobcard_ttnumber,procurasiteinfo);

		
		
		jobcards.updateOne({_id:jobcard.jobcard_id},{$push:{jobcard_audittrail:jobcard_audittrailObject, geolocationJobcardInfo:geolocationJobcardInfo}, $set:{data_ultimaactualizacaojobcard:new Date(),jobcard_ttnumber:jobcard.jobcard_ttnumber,jobcard_estadoactual:jobcard.jobcard_estadoactual, jobcard_sitearrivaldate:jobcard.jobcard_sitearrivaldate, jobcard_sitearrivaltime:jobcard.jobcard_sitearrivaltime, jobcard_tecarrivalduration:jobcard_tecarrivalduration}}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Technician arrives on site")
				res.redirect("/inicio");
			}
		});

	});


	router.post("/updatechegadasiteplannedsemttnumber",  upload.any(), async function(req, res){
		var userData= req.session.usuario;
		var jobcard = req.body;


		var geolocationJobcardInfo = {};
		geolocationJobcardInfo.jobcard_latitude = jobcard.geolocationlatitude;
		geolocationJobcardInfo.jobcard_longitude = jobcard.geolocationlongitude;


		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
        var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
        var ano = (new Date()).getFullYear();
        var todaydate = dia + "/" + mes + "/" + ano;

        var todayhours = new Date();
        var todaytime = todayhours.getHours() + ":" + todayhours.getMinutes();

        
        jobcard.jobcard_sitearrivaldate = todaydate;
        jobcard.jobcard_sitearrivaltime = todaytime;
        jobcard.jobcard_estadoactual = "On site";


        var procurajobcard = await jobcards.findOne({_id:jobcard.jobcard_id}, {jobcard_tecarrivaltime:1, jobcard_linemanagerid:1, jobcard_siteid:1, jobcard_site:1, jobcard_tecniconome:1}, function(err, data){
			if(err){
            	console.log(err);
       		}else{
        		console.log("Find Jobcard");
        	}
		}).lean();


		var jobcard_tecarrivaltime = procurajobcard.jobcard_tecarrivaltime;

		var start = jobcard_tecarrivaltime;
		var end = todaytime;

		var jobcard_tecarrivalduration = diff(start, end);

		function diff(start, end) {
		    start = start.split(":");
		    end = end.split(":");
		    var startDate = new Date(0, 0, 0, parseInt(start[0]), parseInt(start[1]), 0);
		    var endDate = new Date(0, 0, 0, parseInt(end[0]), parseInt(end[1]), 0);
		    var diff = endDate.getTime() - startDate.getTime();
		    var hours = Math.floor(diff / 1000 / 60 / 60);
		    diff -= hours * 1000 * 60 * 60;
		    var minutes = Math.floor(diff / 1000 / 60);
		    
		    return (hours < 9 ? "0" : "") + hours + ":" + (minutes < 9 ? "0" : "") + minutes;
		}
        

        var jobcard_audittrailObject = {};
        jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
        if(jobcard.geomessage == ""){
        	jobcard_audittrailObject.jobcard_audittrailaction = "Arrives on site";
        }else{
        	jobcard_audittrailObject.jobcard_audittrailaction = "Arrives on site. " + jobcard.geomessage;
        }
        
        jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todaytime;

        var procuralinemanager = await model.findOne({_id:procurajobcard.jobcard_linemanagerid}, {email:1, idioma:1}, function(err,dataUser){
				if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
				}else{
				console.log("Find User")

				}
			}).lean();

        var mailrecip = [];
        mailrecip.push(procuralinemanager.email);

        if(procurajobcard.jobcard_siteid != ""){

        	var procurasiteinfo = await siteinfos.findOne({_id:procurajobcard.jobcard_siteid}, {siteinfo_sitename:1}, function(err,dataUser){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}else{
					console.log("Find User")

				}
			}).lean();

        }else{

        	var procurasiteinfo = {};
        	procurasiteinfo.siteinfo_sitename = "";
        }


		//mudar e procurar por funcao:"Back Office Manager"
		var procuracallcenter = await model.find({funcao:"Call Center"}, {email:1}, function(err,dataUser){
			if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
			}else{
			console.log("Find User")

			}
		}).lean();

		for( i = 0; i < procuracallcenter.length; i++){

			mailrecip.push(procuracallcenter[i].email);

		}


		emailSender.createConnection();
		emailSender.sendEmailCallcenter1Planned(procurajobcard, mailrecip, procurajobcard.jobcard_ttnumber,procurasiteinfo);

		
		
		jobcards.updateOne({_id:jobcard.jobcard_id},{$push:{jobcard_audittrail:jobcard_audittrailObject, geolocationJobcardInfo:geolocationJobcardInfo}, $set:{data_ultimaactualizacaojobcard:new Date(),jobcard_estadoactual:jobcard.jobcard_estadoactual, jobcard_sitearrivaldate:jobcard.jobcard_sitearrivaldate, jobcard_sitearrivaltime:jobcard.jobcard_sitearrivaltime, jobcard_tecarrivalduration:jobcard_tecarrivalduration}}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Technician arrives on site")
				res.redirect("/inicio");
			}
		});

	});

router.post("/printcalloutstats", upload.any(), async function(req, res){
		var userData= req.session.usuario;

		var temp=JSON.parse(req.body.fitchero);
		var jobcard = temp;
		var nome = userData.nome;
		var controladorfuncao = 0;
		console.log("Req Body ",req.body);
		console.log("Temp ",temp);

		if (userData.funcao == "Tecnico" || (userData.funcao == "Assistant")) {
			controladorfuncao = 1;
		}else if(userData.funcao == "regional_manager"){
			controladorfuncao = 2;
		}else if (userData.verificador_funcao == "Regional Manager") {
			controladorfuncao = 3;
		}else{
			controladorfuncao = 4;
		};
		console.log(controladorfuncao);

		var queryobject={};

		if(jobcard.reportsmaintenance_region != undefined && jobcard.reportsmaintenance_region != ''){
			queryobject.jobcard_regiao = jobcard.reportsmaintenance_region;	
		}

		if(jobcard.reportsmaintenance_department != undefined && jobcard.reportsmaintenance_department != ''){
			queryobject.jobcard_departamento = jobcard.reportsmaintenance_department;	
		}

		if(jobcard.ttnumber_status != undefined && jobcard.ttnumber_status !=''){
			queryobject.ttnumber_status = jobcard.ttnumber_status;
		}
		if(jobcard.reportsmaintenance_region =="maputo"){
			if(jobcard.jobcard_tecnicoid[0] != undefined && jobcard.jobcard_tecnicoid[0] != ''){
				queryobject.jobcard_tecnicoid = jobcard.jobcard_tecnicoid[0];
			}
		}else if(jobcard.reportsmaintenance_region =="sul"){
			if(jobcard.jobcard_tecnicoid[1] != undefined && jobcard.jobcard_tecnicoid[1] != ''){
				queryobject.jobcard_tecnicoid = jobcard.jobcard_tecnicoid[1];
			}	
		}else if(jobcard.reportsmaintenance_region =="centro"){
			if(jobcard.jobcard_tecnicoid[2] != undefined && jobcard.jobcard_tecnicoid[2] != ''){
				queryobject.jobcard_tecnicoid = jobcard.jobcard_tecnicoid[2];
			}	
		}else if(jobcard.reportsmaintenance_region =="norte"){
			if(jobcard.jobcard_tecnicoid[3] != undefined && jobcard.jobcard_tecnicoid[3] != ''){
				queryobject.jobcard_tecnicoid = jobcard.jobcard_tecnicoid[3];	
			}	
		}

		var dateto = await new Date(temp.reportsmaintenance_todate.split('/').reverse().join('-') + 'T23:59:00.000+00:01');

		var datefrom = await new Date(temp.reportsmaintenance_fromdate.split('/').reverse().join('-'));

		//var lista1 = await jobcards.find({...queryobject, jobcard_jobtype:"Callout",jobcard_maintenancedate:{$lte:dateto, $gte:datefrom}, jobcard_sitearrivaldate:{$exists:true}});

		switch(controladorfuncao){
			case 1:
				jobcards.find({...queryobject, jobcard_jobtype:"Callout",jobcard_maintenancedate:{$lte:dateto, $gte:datefrom}, jobcard_sitearrivaldate:{$exists:true}, $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, {jobcard_site:1, jobcard_sitearrivaldate:1, jobcard_ttnumber:1,jobcard_estadoactual:1, jobcard_jobinfo:1, jobcard_estadoactual:1, jobcard_tecniconome:1, jobcard_linemanager:1, jobcard_loggedby:1, jobcard_regiao:1,jobcard_remedialaction:1}, async function(err, data){
					if(err){
						console.log("ocorreu um erro ao tentar aceder os dados")
					}
					else{
						console.log(data);
						if(data.length>0){
		
							var dados=[];
		
							var exemplo= await Promise.all( data.map(async function(y, i){
								  dados[i]= await {};
								  dados[i].Site=y.jobcard_site;
								  dados[i].Maintenance_Date=y.jobcard_sitearrivaldate;
								  dados[i].TTnumber=y.jobcard_ttnumber;
								  dados[i].Reason = y.jobcard_jobinfo.join();
								  dados[i].Status=y.jobcard_estadoactual;
								  dados[i].Technician=y.jobcard_tecniconome;
								  dados[i].Line_Manager=y.jobcard_linemanager;
								  dados[i].CC_Agent=y.jobcard_loggedby;
								  dados[i].Region=y.jobcard_regiao;
								 dados[i].Remedial_Action =y.jobcard_remedialaction;
					
							  }))
		
							if(typeof XLSX == 'undefined') XLSX = require('xlsx');
		
							/* make the worksheet */
							var ws = await XLSX.utils.json_to_sheet(dados);
		
							/* add to workbook */
							var wb = await XLSX.utils.book_new();
							await XLSX.utils.book_append_sheet(wb, ws, "CalloutStats_Report_View");
		
							/* generate an XLSX file */
							await XLSX.writeFile(wb, "CalloutStats_Report.xlsx");
		
							res.download("./CalloutStats_Report.xlsx")
						}
		
					}
				});
			break;

			case 2:
				jobcards.find({...queryobject, jobcard_jobtype:"Callout",jobcard_maintenancedate:{$lte:dateto, $gte:datefrom}, jobcard_sitearrivaldate:{$exists:true}, $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, {jobcard_site:1, jobcard_sitearrivaldate:1, jobcard_ttnumber:1,jobcard_estadoactual:1, jobcard_jobinfo:1, jobcard_estadoactual:1, jobcard_tecniconome:1, jobcard_linemanager:1, jobcard_loggedby:1, jobcard_regiao:1,jobcard_remedialaction:1}, async function(err, data){
					if(err){
						console.log("ocorreu um erro ao tentar aceder os dados")
					}
					else{
						console.log(data);
						if(data.length>0){
		
							var dados=[];
		
							var exemplo= await Promise.all( data.map(async function(y, i){
								  dados[i]= await {};
								  dados[i].Site=y.jobcard_site;
								  dados[i].Maintenance_Date=y.jobcard_sitearrivaldate;
								  dados[i].TTnumber=y.jobcard_ttnumber;
								dados[i].Reason = y.jobcard_jobinfo.join();
								  dados[i].Status=y.ttnumber_status;
								  dados[i].Technician=y.jobcard_tecniconome;
								  dados[i].Line_Manager=y.jobcard_linemanager;
								  dados[i].CC_Agent=y.jobcard_loggedby;
								  dados[i].Region=y.jobcard_regiao;
								dados[i].Remedial_Action =y.jobcard_remedialaction;
					
							  }))
		
							if(typeof XLSX == 'undefined') XLSX = require('xlsx');
		
							/* make the worksheet */
							var ws = await XLSX.utils.json_to_sheet(dados);
		
							/* add to workbook */
							var wb = await XLSX.utils.book_new();
							await XLSX.utils.book_append_sheet(wb, ws, "CalloutStats_Report_View");
		
							/* generate an XLSX file */
							await XLSX.writeFile(wb, "CalloutStats_Report.xlsx");
		
							res.download("./CalloutStats_Report.xlsx")
						}
		
					}
				});
			break;

			case 3:
				jobcards.find({...queryobject, jobcard_jobtype:"Callout",jobcard_maintenancedate:{$lte:dateto, $gte:datefrom}, jobcard_sitearrivaldate:{$exists:true}, jobcard_regiao:userData.regiao}, {jobcard_site:1, jobcard_sitearrivaldate:1, jobcard_ttnumber:1,jobcard_estadoactual:1, jobcard_jobinfo:1, jobcard_estadoactual:1, jobcard_tecniconome:1,jobcard_linemanager:1, jobcard_loggedby:1, jobcard_regiao:1,jobcard_remedialaction:1}, async function(err, data){
					if(err){
						console.log("ocorreu um erro ao tentar aceder os dados")
					}
					else{
						console.log(data);
						if(data.length>0){
		
							var dados=[];
		
							var exemplo= await Promise.all( data.map(async function(y, i){
								  dados[i]= await {};
								  dados[i].Site=y.jobcard_site;
								  dados[i].Maintenance_Date=y.jobcard_sitearrivaldate;
								  dados[i].TTnumber=y.jobcard_ttnumber;
								dados[i].Reason = y.jobcard_jobinfo.join();
								  dados[i].Status=y.ttnumber_status;
								  dados[i].Technician=y.jobcard_tecniconome;
								  dados[i].Line_Manager=y.jobcard_linemanager;
								  dados[i].CC_Agent=y.jobcard_loggedby;
								  dados[i].Region=y.jobcard_regiao;
								dados[i].Remedial_Action =y.jobcard_remedialaction;
					
							  }))
		
							if(typeof XLSX == 'undefined') XLSX = require('xlsx');
		
							/* make the worksheet */
							var ws = await XLSX.utils.json_to_sheet(dados);
		
							/* add to workbook */
							var wb = await XLSX.utils.book_new();
							await XLSX.utils.book_append_sheet(wb, ws, "CalloutStats_Report_View");
		
							/* generate an XLSX file */
							await XLSX.writeFile(wb, "CalloutStats_Report.xlsx");
		
							res.download("./CalloutStats_Report.xlsx")
						}
		
					}
				});
			break;

			default:
				jobcards.find({...queryobject, jobcard_jobtype:"Callout",jobcard_maintenancedate:{$lte:dateto, $gte:datefrom}, jobcard_sitearrivaldate:{$exists:true}}, {jobcard_site:1, ttnumber_status:1, jobcard_sitearrivaldate:1, jobcard_ttnumber:1, jobcard_jobinfo:1, jobcard_estadoactual:1, jobcard_tecniconome:1, jobcard_linemanager:1 ,jobcard_loggedby:1, jobcard_regiao:1,jobcard_remedialaction:1}, async function(err, data){
					if(err){
						console.log("ocorreu um erro ao tentar aceder os dados")
					}
					else{
						console.log(data);
						if(data.length>0){
		
							var dados=[];
		
							var exemplo= await Promise.all( data.map(async function(y, i){
								  dados[i]= await {};
								  dados[i].Site=y.jobcard_site;
								  dados[i].Maintenance_Date=y.jobcard_sitearrivaldate;
								  dados[i].TTnumber=y.jobcard_ttnumber;
								  dados[i].Reason = y.jobcard_jobinfo.join();
								  dados[i].Status=y.ttnumber_status;
								  dados[i].Technician=y.jobcard_tecniconome;
								  dados[i].Line_Manager=y.jobcard_linemanager;
								  dados[i].CC_Agent=y.jobcard_loggedby;
								  dados[i].Region=y.jobcard_regiao;
								dados[i].Remedial_Action =y.jobcard_remedialaction;
					
							  }))
		
							if(typeof XLSX == 'undefined') XLSX = require('xlsx');
		
							/* make the worksheet */
							var ws = await XLSX.utils.json_to_sheet(dados);
		
							/* add to workbook */
							var wb = await XLSX.utils.book_new();
							await XLSX.utils.book_append_sheet(wb, ws, "CalloutStats_Report_View");
		
							/* generate an XLSX file */
							await XLSX.writeFile(wb, "CalloutStats_Report.xlsx");
		
							res.download("./CalloutStats_Report.xlsx")
						}
		
					}
				});
			break;
		}

		// jobcards.find({...queryobject, jobcard_jobtype:"Callout",jobcard_maintenancedate:{$lte:dateto, $gte:datefrom}, jobcard_sitearrivaldate:{$exists:true}}, {jobcard_site:1, jobcard_sitearrivaldate:1, jobcard_ttnumber:1, jobcard_jobinfo:1, jobcard_estadoactual:1, jobcard_tecniconome:1, jobcard_loggedby:1, jobcard_regiao:1,jobcard_remedialaction:1}, async function(err, data){
		// 	if(err){
		// 		console.log("ocorreu um erro ao tentar aceder os dados")
		// 	}
		// 	else{
		// 		console.log(data);
		// 		if(data.length>0){

		// 			var dados=[];

		// 			var exemplo= await Promise.all( data.map(async function(y, i){
		// 		      	dados[i]= await {};
		// 		      	dados[i].Site=y.jobcard_site;
		// 		      	dados[i].Maintenance_Date=y.jobcard_sitearrivaldate;
		// 		      	dados[i].TTnumber=y.jobcard_ttnumber;
		// 				dados[i].Reason = y.jobcard_jobinfo.join();
		// 		      	dados[i].Status=y.jobcard_estadoactual;
		// 		      	dados[i].Technician=y.jobcard_tecniconome;
		// 		      	dados[i].CC_Agent=y.jobcard_loggedby;
		// 		      	dados[i].Region=y.jobcard_regiao;
		// 				dados[i].Remedial_Action =y.jobcard_remedialaction;
			
     	// 			 }))

		// 			if(typeof XLSX == 'undefined') XLSX = require('xlsx');

		// 	        /* make the worksheet */
		// 	        var ws = await XLSX.utils.json_to_sheet(dados);

		// 	        /* add to workbook */
		// 	        var wb = await XLSX.utils.book_new();
		// 	        await XLSX.utils.book_append_sheet(wb, ws, "CalloutStats_Report_View");

		// 	        /* generate an XLSX file */
		// 	        await XLSX.writeFile(wb, "CalloutStats_Report.xlsx");

		// 	        res.download("./CalloutStats_Report.xlsx")
		// 		}

		// 	}
		// });

        

	});



router.post("/printplannedmaintenance", upload.any(), async function(req, res){
		var userData= req.session.usuario;
		var nome = userData.nome;
		var temp=JSON.parse(req.body.fitchero);
		var planneddates=[];
		var jobcardIds=[];
		var controladorfuncao = 0;
		var jobcard = temp;
		var queryobject={};

		var dateto = await new Date(temp.reportsmaintenance_todate.split('/').reverse().join('-') + 'T23:59:00.000+00:01');
		var datefrom = await new Date(temp.reportsmaintenance_fromdate.split('/').reverse().join('-'));
		

		if (userData.funcao == "Tecnico" || (userData.funcao == "Assistant")) {
			controladorfuncao = 1;
		}else if(userData.funcao == "regional_manager"){
			controladorfuncao = 2;
		}else if (userData.verificador_funcao == "Regional Manager") {
			controladorfuncao = 3;
		}else{
			controladorfuncao = 4;
		};
		if(jobcard.reportsmaintenance_region != undefined && jobcard.reportsmaintenance_region != ''){
			queryobject.jobcard_regiao = jobcard.reportsmaintenance_region;	
		}

		if(jobcard.reportsmaintenance_department != undefined && jobcard.reportsmaintenance_department != ''){
			queryobject.jobcard_departamento = jobcard.reportsmaintenance_department;	
		}

		if(jobcard.ttnumber_status != undefined && jobcard.ttnumber_status !=''){
			queryobject.ttnumber_status = jobcard.ttnumber_status;
		}
		if(jobcard.reportsmaintenance_region =="maputo"){
			if(jobcard.jobcard_tecnicoid[0] != undefined && jobcard.jobcard_tecnicoid[0] != ''){
				queryobject.jobcard_tecnicoid = jobcard.jobcard_tecnicoid[0];
			}
		}else if(jobcard.reportsmaintenance_region =="sul"){
			if(jobcard.jobcard_tecnicoid[1] != undefined && jobcard.jobcard_tecnicoid[1] != ''){
				queryobject.jobcard_tecnicoid = jobcard.jobcard_tecnicoid[1];
			}	
		}else if(jobcard.reportsmaintenance_region =="centro"){
			if(jobcard.jobcard_tecnicoid[2] != undefined && jobcard.jobcard_tecnicoid[2] != ''){
				queryobject.jobcard_tecnicoid = jobcard.jobcard_tecnicoid[2];
			}	
		}else if(jobcard.reportsmaintenance_region =="norte"){
			if(jobcard.jobcard_tecnicoid[3] != undefined && jobcard.jobcard_tecnicoid[3] != ''){
				queryobject.jobcard_tecnicoid = jobcard.jobcard_tecnicoid[3];	
			}	
		}
		console.log(queryobject);

		switch (controladorfuncao) {
			case 1:
				(await jobcards.find({...queryobject, jobcard_jobtype:"Preventative Maintenance", jobcard_planneddate: {$exists: true}, $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, {jobcard_site:1,  jobcard_jobinfo:1, jobcard_planneddate:1,jobcard_tecniconome:1,ttnumber_status:1,jobcard_departamento:1,jobcard_regiao:1,jobcard_workstatus:1,sparesArrayJobcard:1,generatorArrayJobcard:1,jobcard_credelecinfo:1})).forEach((item, posicao) =>{
					planneddates.push({date: new Date(item.jobcard_planneddate.split('/').reverse().join('-')), id : item._id});
				});

				var selectedDates = planneddates.filter((item, index, array) =>	dateto >= planneddates[index].date && datefrom <= planneddates[index].date || dateto >= planneddates[index].maintenancedate && datefrom <= planneddates[index].maintenancedate);

				selectedDates.forEach((obj,position) =>{
					jobcardIds.push(obj.id);
				});

				var lista1= await jobcards.find({_id: {$in:jobcardIds}});
			break;

			case 2:
				(await jobcards.find({...queryobject,  jobcard_jobtype:"Preventative Maintenance", jobcard_planneddate: {$exists: true}, $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, {jobcard_site:1, jobcard_planneddate:1,ttnumber_status:1,jobcard_tecniconome:1,jobcard_departamento:1,jobcard_regiao:1,jobcard_workstatus:1,sparesArrayJobcard:1,generatorArrayJobcard:1,jobcard_credelecinfo:1})).forEach((item, posicao) =>{
					planneddates.push({date: new Date(item.jobcard_planneddate.split('/').reverse().join('-')), id : item._id});
				});

				var selectedDates = planneddates.filter((item, index, array) =>	dateto >= planneddates[index].date && datefrom <= planneddates[index].date || dateto >= planneddates[index].maintenancedate && datefrom <= planneddates[index].maintenancedate);

				selectedDates.forEach((obj,position) =>{
					jobcardIds.push(obj.id);
				});

				var lista1= await jobcards.find({_id: {$in:jobcardIds}});
			break;

			case 3:
				(await jobcards.find({...queryobject, jobcard_departamento:userData.departamento, jobcard_regiao:userData.regiao, jobcard_jobtype:"Preventative Maintenance", jobcard_planneddate: {$exists: true}}, {jobcard_site:1, jobcard_jobinfo:1, jobcard_planneddate:1,ttnumber_status:1,jobcard_tecniconome:1,jobcard_departamento:1,jobcard_regiao:1,jobcard_workstatus:1,sparesArrayJobcard:1,generatorArrayJobcard:1,jobcard_credelecinfo:1})).forEach((item, posicao) =>{
					planneddates.push({date: new Date(item.jobcard_planneddate.split('/').reverse().join('-')), id : item._id});
				});

				var selectedDates = planneddates.filter((item, index, array) =>	dateto >= planneddates[index].date && datefrom <= planneddates[index].date || dateto >= planneddates[index].maintenancedate && datefrom <= planneddates[index].maintenancedate);

				selectedDates.forEach((obj,position) =>{
					jobcardIds.push(obj.id);
				});

				var lista1= await jobcards.find({_id: {$in:jobcardIds}});
			break;

			case 4:
				if (typeof temp.reportsmaintenance_region === 'undefined' || temp.reportsmaintenance_region === null || temp.reportsmaintenance_region==='') {
					(await jobcards.find({...queryobject,jobcard_jobtype:"Preventative Maintenance", jobcard_planneddate: {$exists: true}}, {jobcard_site:1, jobcard_jobinfo:1, jobcard_planneddate:1,jobcard_tecniconome:1,jobcard_departamento:1,jobcard_regiao:1,ttnumber_status:1,jobcard_workstatus:1,sparesArrayJobcard:1,generatorArrayJobcard:1,jobcard_credelecinfo:1})).forEach((item, posicao) =>{
						planneddates.push({date: new Date(item.jobcard_planneddate.split('/').reverse().join('-')), id : item._id});
					});
		
					var selectedDates = planneddates.filter((item, index, array) =>	dateto >= planneddates[index].date && datefrom <= planneddates[index].date || dateto >= planneddates[index].maintenancedate && datefrom <= planneddates[index].maintenancedate);
		
					selectedDates.forEach((obj,position) =>{
						jobcardIds.push(obj.id);
					});
		
					var lista1= await jobcards.find({_id: {$in:jobcardIds}});
						
				}else{
					(await jobcards.find({...queryobject, jobcard_regiao: temp.reportsmaintenance_region, jobcard_jobtype:"Preventative Maintenance", jobcard_planneddate: {$exists: true}}, {jobcard_site:1, jobcard_jobinfo:1, jobcard_planneddate:1,ttnumber_status:1, jobcard_tecniconome:1,jobcard_departamento:1,jobcard_regiao:1,jobcard_workstatus:1,sparesArrayJobcard:1,generatorArrayJobcard:1,jobcard_credelecinfo:1})).forEach((item, posicao) =>{
						planneddates.push({date: new Date(item.jobcard_planneddate.split('/').reverse().join('-')), id : item._id});
					});
		
					var selectedDates = planneddates.filter((item, index, array) =>	dateto >= planneddates[index].date && datefrom <= planneddates[index].date);
		
					selectedDates.forEach((obj,position) =>{
						jobcardIds.push(obj.id);
					});
		
					var lista1= await jobcards.find({_id: {$in:jobcardIds}});
					//var lista1= await jobcards.find({jobcard_regiao: temp.reportsmaintenance_region, jobcard_maintenancedate:{$lte:dateto, $gte:datefrom}, jobcard_jobtype:"Preventative Maintenance", jobcard_departamento: temp.reportsmaintenance_department, jobcard_sitearrivaldate:{$exists:true}});
				}		
				
			break;
		}

		var lista2=[];

		await Promise.all(lista1.map(async(obj, k)=>{
			lista2[k]=await {};
			var dados=await siteinfos.find({siteinfo_sitenum: obj.jobcard_site},{siteinfo_sitename:1, ttnumber_status:1, siteinfo_generator:1,siteinfo_elecpayment:1}).lean();

			lista2[k].Site = await obj.jobcard_site;
			lista2[k].Nome_Site= await dados[0].siteinfo_sitename;
			lista2[k].Data_Report = await obj.jobcard_planneddate;
			lista2[k].Tem_Gerador= await dados[0].siteinfo_generator;
			lista2[k].Elec_Provider = await dados[0].siteinfo_elecpayment;
			lista2[k].Tecnico = await obj.jobcard_tecniconome;
			lista2[k].Departamento = await obj.jobcard_departamento;
			lista2[k].Regiao = await obj.jobcard_regiao;
			lista2[k].Status = await obj.jobcard_estadoactual;
			if(obj.sparesArrayJobcard.length != 0){
				lista2[k].Spare_Used = "Yes";
			}else{
				lista2[k].Spare_Used = "No";
			}
			// PlannedMaintenanceHistory[index].generatorArrayJobcard.length != 0
			if(obj.generatorArrayJobcard.length != 0){
				lista2[k].Diesel_Refuel = "Yes";
			}else{
				lista2[k].Diesel_Refuel = "No";
			}
			// PlannedMaintenanceHistory[index].jobcard_credelecinfo.length != 0)
			if(obj.jobcard_credelecinfo.length != 0){
				lista2[k].Credelec_Recarregado = "Yes";
			}else{
				lista2[k].Credelec_Recarregado = "No";
			}

			if(obj.jobcard_jobinfo == "Scheduled Refuel"){
				lista2[k].Scheduled_Refuel = "Yes";
			}else{
				lista2[k].Scheduled_Refuel = "No";
			}
		}));
		//console.log(lista2);
		if(typeof XLSX == 'undefined') XLSX = require('xlsx');

		/* make the worksheet */
		var ws = await XLSX.utils.json_to_sheet(lista2);

		/* add to workbook */
		var wb = await XLSX.utils.book_new();
		await XLSX.utils.book_append_sheet(wb, ws, "PlannedMaintenance_Report");

		/* generate an XLSX file */
		await XLSX.writeFile(wb, "PlannedMaintenance_Report.xlsx");

		res.download("./PlannedMaintenance_Report.xlsx");		
	});
	
router.post("/printplannedrefuelreport", upload.any(), async function(req, res){
		var userData= req.session.usuario;
		var nome = userData.nome;
		var temp=JSON.parse(req.body.fitchero);
		var planneddates=[];
		var jobcardIds=[];
		var controladorfuncao = 0;
		var jobcard = temp;
		var queryobject={};

		var dateto = await new Date(temp.reportsmaintenance_todate.split('/').reverse().join('-') + 'T23:59:00.000+00:01');
		var datefrom = await new Date(temp.reportsmaintenance_fromdate.split('/').reverse().join('-'));
		

		if (userData.funcao == "Tecnico" || (userData.funcao == "Assistant")) {
			controladorfuncao = 1;
		}else if(userData.funcao == "regional_manager"){
			controladorfuncao = 2;
		}else if (userData.verificador_funcao == "Regional Manager") {
			controladorfuncao = 3;
		}else{
			controladorfuncao = 4;
		};
		if(jobcard.reportsmaintenance_region != undefined && jobcard.reportsmaintenance_region != ''){
			queryobject.jobcard_regiao = jobcard.reportsmaintenance_region;	
		}

		if(jobcard.reportsmaintenance_department != undefined && jobcard.reportsmaintenance_department != ''){
			queryobject.jobcard_departamento = jobcard.reportsmaintenance_department;	
		}

		if(jobcard.ttnumber_status != undefined && jobcard.ttnumber_status !=''){
			queryobject.ttnumber_status = jobcard.ttnumber_status;
		}
		if(jobcard.reportsmaintenance_region =="maputo"){
			if(jobcard.jobcard_tecnicoid[0] != undefined && jobcard.jobcard_tecnicoid[0] != ''){
				queryobject.jobcard_tecnicoid = jobcard.jobcard_tecnicoid[0];
			}
		}else if(jobcard.reportsmaintenance_region =="sul"){
			if(jobcard.jobcard_tecnicoid[1] != undefined && jobcard.jobcard_tecnicoid[1] != ''){
				queryobject.jobcard_tecnicoid = jobcard.jobcard_tecnicoid[1];
			}	
		}else if(jobcard.reportsmaintenance_region =="centro"){
			if(jobcard.jobcard_tecnicoid[2] != undefined && jobcard.jobcard_tecnicoid[2] != ''){
				queryobject.jobcard_tecnicoid = jobcard.jobcard_tecnicoid[2];
			}	
		}else if(jobcard.reportsmaintenance_region =="norte"){
			if(jobcard.jobcard_tecnicoid[3] != undefined && jobcard.jobcard_tecnicoid[3] != ''){
				queryobject.jobcard_tecnicoid = jobcard.jobcard_tecnicoid[3];	
			}	
		}
		console.log(queryobject);

		switch (controladorfuncao) {
			case 1:
				(await jobcards.find({...queryobject, jobcard_jobtype:"Preventative Maintenance", jobcard_jobinfo:"Scheduled Refuel", jobcard_planneddate: {$exists: true}, $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, {jobcard_site:1,  jobcard_jobinfo:1, jobcard_planneddate:1,jobcard_tecniconome:1,ttnumber_status:1,jobcard_departamento:1,jobcard_regiao:1,jobcard_workstatus:1,sparesArrayJobcard:1,generatorArrayJobcard:1,jobcard_credelecinfo:1})).forEach((item, posicao) =>{
					planneddates.push({date: new Date(item.jobcard_planneddate.split('/').reverse().join('-')), id : item._id});
				});

				var selectedDates = planneddates.filter((item, index, array) =>	dateto >= planneddates[index].date && datefrom <= planneddates[index].date || dateto >= planneddates[index].maintenancedate && datefrom <= planneddates[index].maintenancedate);

				selectedDates.forEach((obj,position) =>{
					jobcardIds.push(obj.id);
				});

				var lista1= await jobcards.find({_id: {$in:jobcardIds}});
			break;

			case 2:
				(await jobcards.find({...queryobject,  jobcard_jobtype:"Preventative Maintenance", jobcard_jobinfo:"Scheduled Refuel", jobcard_planneddate: {$exists: true}, $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, {jobcard_site:1, jobcard_planneddate:1,ttnumber_status:1,jobcard_tecniconome:1,jobcard_departamento:1,jobcard_regiao:1,jobcard_workstatus:1,sparesArrayJobcard:1,generatorArrayJobcard:1,jobcard_credelecinfo:1})).forEach((item, posicao) =>{
					planneddates.push({date: new Date(item.jobcard_planneddate.split('/').reverse().join('-')), id : item._id});
				});

				var selectedDates = planneddates.filter((item, index, array) =>	dateto >= planneddates[index].date && datefrom <= planneddates[index].date || dateto >= planneddates[index].maintenancedate && datefrom <= planneddates[index].maintenancedate);

				selectedDates.forEach((obj,position) =>{
					jobcardIds.push(obj.id);
				});

				var lista1= await jobcards.find({_id: {$in:jobcardIds}});
			break;

			case 3:
				(await jobcards.find({...queryobject, jobcard_departamento:userData.departamento, jobcard_regiao:userData.regiao, jobcard_jobtype:"Preventative Maintenance", jobcard_jobinfo:"Scheduled Refuel", jobcard_planneddate: {$exists: true}}, {jobcard_site:1, jobcard_jobinfo:1, jobcard_planneddate:1,ttnumber_status:1,jobcard_tecniconome:1,jobcard_departamento:1,jobcard_regiao:1,jobcard_workstatus:1,sparesArrayJobcard:1,generatorArrayJobcard:1,jobcard_credelecinfo:1})).forEach((item, posicao) =>{
					planneddates.push({date: new Date(item.jobcard_planneddate.split('/').reverse().join('-')), id : item._id});
				});

				var selectedDates = planneddates.filter((item, index, array) =>	dateto >= planneddates[index].date && datefrom <= planneddates[index].date || dateto >= planneddates[index].maintenancedate && datefrom <= planneddates[index].maintenancedate);

				selectedDates.forEach((obj,position) =>{
					jobcardIds.push(obj.id);
				});

				var lista1= await jobcards.find({_id: {$in:jobcardIds}});
			break;

			case 4:
				if (typeof temp.reportsmaintenance_region === 'undefined' || temp.reportsmaintenance_region === null || temp.reportsmaintenance_region==='') {
					(await jobcards.find({...queryobject,jobcard_jobtype:"Preventative Maintenance", jobcard_jobinfo:"Scheduled Refuel", jobcard_planneddate: {$exists: true}}, {jobcard_site:1, jobcard_jobinfo:1, jobcard_planneddate:1,jobcard_tecniconome:1,jobcard_departamento:1,jobcard_regiao:1,ttnumber_status:1,jobcard_workstatus:1,sparesArrayJobcard:1,generatorArrayJobcard:1,jobcard_credelecinfo:1})).forEach((item, posicao) =>{
						planneddates.push({date: new Date(item.jobcard_planneddate.split('/').reverse().join('-')), id : item._id});
					});
		
					var selectedDates = planneddates.filter((item, index, array) =>	dateto >= planneddates[index].date && datefrom <= planneddates[index].date || dateto >= planneddates[index].maintenancedate && datefrom <= planneddates[index].maintenancedate);
		
					selectedDates.forEach((obj,position) =>{
						jobcardIds.push(obj.id);
					});
		
					var lista1= await jobcards.find({_id: {$in:jobcardIds}});
						
				}else{
					(await jobcards.find({...queryobject, jobcard_regiao: temp.reportsmaintenance_region, jobcard_jobtype:"Preventative Maintenance", jobcard_jobinfo:"Scheduled Refuel", jobcard_planneddate: {$exists: true}}, {jobcard_site:1, jobcard_jobinfo:1, jobcard_planneddate:1,ttnumber_status:1, jobcard_tecniconome:1,jobcard_departamento:1,jobcard_regiao:1,jobcard_workstatus:1,sparesArrayJobcard:1,generatorArrayJobcard:1,jobcard_credelecinfo:1})).forEach((item, posicao) =>{
						planneddates.push({date: new Date(item.jobcard_planneddate.split('/').reverse().join('-')), id : item._id});
					});
		
					var selectedDates = planneddates.filter((item, index, array) =>	dateto >= planneddates[index].date && datefrom <= planneddates[index].date);
		
					selectedDates.forEach((obj,position) =>{
						jobcardIds.push(obj.id);
					});
		
					var lista1= await jobcards.find({_id: {$in:jobcardIds}});
					//var lista1= await jobcards.find({jobcard_regiao: temp.reportsmaintenance_region, jobcard_maintenancedate:{$lte:dateto, $gte:datefrom}, jobcard_jobtype:"Preventative Maintenance", jobcard_departamento: temp.reportsmaintenance_department, jobcard_sitearrivaldate:{$exists:true}});
				}		
				
			break;
		}

		var lista2=[];

		await Promise.all(lista1.map(async(obj, k)=>{
			lista2[k]=await {};
			var dados=await siteinfos.find({siteinfo_sitenum: obj.jobcard_site},{siteinfo_sitename:1, ttnumber_status:1, siteinfo_generator:1,siteinfo_elecpayment:1}).lean();

			lista2[k].Site = await obj.jobcard_site;
			lista2[k].Nome_Site= await dados[0].siteinfo_sitename;
			lista2[k].Data_Report = await obj.jobcard_planneddate;
			lista2[k].Tem_Gerador= await dados[0].siteinfo_generator;
			lista2[k].Elec_Provider = await dados[0].siteinfo_elecpayment;
			lista2[k].Tecnico = await obj.jobcard_tecniconome;
			lista2[k].Departamento = await obj.jobcard_departamento;
			lista2[k].Regiao = await obj.jobcard_regiao;
			lista2[k].Status = await obj.jobcard_estadoactual;
			if(obj.sparesArrayJobcard.length != 0){
				lista2[k].Spare_Used = "Yes";
			}else{
				lista2[k].Spare_Used = "No";
			}
			// PlannedMaintenanceHistory[index].generatorArrayJobcard.length != 0
			if(obj.generatorArrayJobcard.length != 0){
				lista2[k].Diesel_Refuel = "Yes";
			}else{
				lista2[k].Diesel_Refuel = "No";
			}
			// PlannedMaintenanceHistory[index].jobcard_credelecinfo.length != 0)
			if(obj.jobcard_credelecinfo.length != 0){
				lista2[k].Credelec_Recarregado = "Yes";
			}else{
				lista2[k].Credelec_Recarregado = "No";
			}

			if(obj.jobcard_jobinfo == "Scheduled Refuel"){
				lista2[k].Scheduled_Refuel = "Yes";
			}else{
				lista2[k].Scheduled_Refuel = "No";
			}
		}));
		//console.log(lista2);
		if(typeof XLSX == 'undefined') XLSX = require('xlsx');

		/* make the worksheet */
		var ws = await XLSX.utils.json_to_sheet(lista2);

		/* add to workbook */
		var wb = await XLSX.utils.book_new();
		await XLSX.utils.book_append_sheet(wb, ws, "Plannedrefuel_Report");

		/* generate an XLSX file */
		await XLSX.writeFile(wb, "Plannedrefuel_Report.xlsx");

		res.download("./Plannedrefuel_Report.xlsx");		
	});

	router.post("/printcomservplannedmaintenance", upload.any(), async function(req, res){
		var userData= req.session.usuario;
		var nome = userData.nome;
		var temp=JSON.parse(req.body.fitchero);
		var jobcard = temp;
		var planneddates=[];
		var jobcardIds=[];
		var controladorfuncao = 0;
		var queryobject={};

		 console.log("Temp ",temp);

		var dateto = await new Date(temp.reportsmaintenance_todate.split('/').reverse().join('-')+ 'T20:59:00.000+00:01');
		var datefrom = await new Date(temp.reportsmaintenance_fromdate.split('/').reverse().join('-'));
		var datetoms = await dateto.getTime();
		var datefromms = await datefrom.getTime();

		
		console.log("dateto ", dateto + "\n" + "datefrom "+ datefrom);

		if (userData.funcao == "Tecnico" || (userData.funcao == "Assistant")) {
			controladorfuncao = 1;
		}else if(userData.funcao == "regional_manager"){
			controladorfuncao = 2;
		}else if (userData.verificador_funcao == "Regional Manager") {
			controladorfuncao = 3;
		}else{
			controladorfuncao = 4;
		};
		if(jobcard.reportsmaintenance_region != undefined && jobcard.reportsmaintenance_region != ''){
			queryobject.jobcard_regiao = jobcard.reportsmaintenance_region;	
		}

		if(jobcard.reportsmaintenance_department != undefined && jobcard.reportsmaintenance_department != ''){
			queryobject.jobcard_departamento = jobcard.reportsmaintenance_department;	
		}

		if(jobcard.ttnumber_status != undefined && jobcard.ttnumber_status !=''){
			queryobject.ttnumber_status = jobcard.ttnumber_status;
		}
		if(jobcard.reportsmaintenance_region =="maputo"){
			if(jobcard.jobcard_tecnicoid[0] != undefined && jobcard.jobcard_tecnicoid[0] != ''){
				queryobject.jobcard_tecnicoid = jobcard.jobcard_tecnicoid[0];
			}
		}else if(jobcard.reportsmaintenance_region =="sul"){
			if(jobcard.jobcard_tecnicoid[1] != undefined && jobcard.jobcard_tecnicoid[1] != ''){
				queryobject.jobcard_tecnicoid = jobcard.jobcard_tecnicoid[1];
			}	
		}else if(jobcard.reportsmaintenance_region =="centro"){
			if(jobcard.jobcard_tecnicoid[2] != undefined && jobcard.jobcard_tecnicoid[2] != ''){
				queryobject.jobcard_tecnicoid = jobcard.jobcard_tecnicoid[2];
			}	
		}else if(jobcard.reportsmaintenance_region =="norte"){
			if(jobcard.jobcard_tecnicoid[3] != undefined && jobcard.jobcard_tecnicoid[3] != ''){
				queryobject.jobcard_tecnicoid = jobcard.jobcard_tecnicoid[3];	
			}	
		}

		switch (controladorfuncao) {
			case 1:
				console.log("***********************")
				(await jobcards.find({...queryobject,jobcard_jobtype:"Preventative Maintenance", jobcard_planneddate: {$exists: true}, $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, {jobcard_site:1, jobcard_planneddate:1,jobcard_tecniconome:1,jobcard_departamento:1,jobcard_regiao:1,jobcard_workstatus:1,sparesArrayJobcard:1,generatorArrayJobcard:1,jobcard_credelecinfo:1})).forEach((item, posicao) =>{
					planneddates.push({date: new Date(item.jobcard_planneddate.split('/').reverse().join('-')), id : item._id});
				});

				var selectedDates = planneddates.filter((item, index, array) =>	dateto >= planneddates[index].date && datefrom <= planneddates[index].date || dateto >= planneddates[index].maintenancedate && datefrom <= planneddates[index].maintenancedate);

				selectedDates.forEach((obj,position) =>{
					jobcardIds.push(obj.id);
				});

				var lista1= await jobcards.find({_id: {$in:jobcardIds}});
			break;

			case 2:
				(await jobcards.find({...queryobject,jobcard_jobtype:"Preventative Maintenance", jobcard_planneddate: {$exists: true}, $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, {jobcard_site:1, jobcard_planneddate:1,jobcard_tecniconome:1,jobcard_departamento:1,jobcard_regiao:1,jobcard_workstatus:1,sparesArrayJobcard:1,generatorArrayJobcard:1,jobcard_credelecinfo:1})).forEach((item, posicao) =>{
					planneddates.push({date: new Date(item.jobcard_planneddate.split('/').reverse().join('-')), id : item._id});
				});

				var selectedDates = planneddates.filter((item, index, array) =>	dateto >= planneddates[index].date && datefrom <= planneddates[index].date || dateto >= planneddates[index].maintenancedate && datefrom <= planneddates[index].maintenancedate);

				selectedDates.forEach((obj,position) =>{
					jobcardIds.push(obj.id);
				});

				var lista1= await jobcards.find({_id: {$in:jobcardIds}});
			break;

			case 3:
				(await jobcards.find({...queryobject,jobcard_departamento:userData.departamento, jobcard_regiao:userData.regiao, jobcard_jobtype:"Preventative Maintenance", jobcard_planneddate: {$exists: true}}, {jobcard_site:1, jobcard_planneddate:1,jobcard_tecniconome:1,jobcard_departamento:1,jobcard_regiao:1,jobcard_workstatus:1,sparesArrayJobcard:1,generatorArrayJobcard:1,jobcard_credelecinfo:1})).forEach((item, posicao) =>{
					planneddates.push({date: new Date(item.jobcard_planneddate.split('/').reverse().join('-')), id : item._id});
				});

				var selectedDates = planneddates.filter((item, index, array) =>	dateto >= planneddates[index].date && datefrom <= planneddates[index].date || dateto >= planneddates[index].maintenancedate && datefrom <= planneddates[index].maintenancedate);

				selectedDates.forEach((obj,position) =>{
					jobcardIds.push(obj.id);
				});

				var lista1= await jobcards.find({_id: {$in:jobcardIds}});
			break;

			case 4:
				if (typeof temp.reportsmaintenance_region === 'undefined' || temp.reportsmaintenance_region === null) {
					
					console.log("if");
					var data = await jobcards.find({...queryobject,jobcard_jobtype:"Preventative Maintenance", jobcard_departamento:"Telco", jobcard_planneddatems: {$gte:datefromms, $lte:datetoms}}, {jobcard_site:1, jobcard_planneddate:1,jobcard_tecniconome:1,jobcardsignage:1,jobcardcontainer:1,jobcardmast:1,jobcardcleaning:1,jobcardlocks:1,jobcardenvironmental:1,jobcardfallarrest:1,jobcardgeneratorinfo:1,jobcardedBoardinfo:1,jobcardelectricalinfo:1,jobcardrectifierinfo:1,jobcardbatterybanksinfo:1,jobcardaircondinfo:1,jobcardantennasinfo:1,jobcardeainfo:1,jobcardtxinfo:1,jobcard_departamento:1,jobcard_regiao:1,jobcard_linemanager:1,jobcard_workstatus:1,sparesArrayJobcard:1,generatorArrayJobcard:1,jobcard_credelecinfo:1,jobcardvsatinfo:1});
					// console.log("data", data);
					var selectedDates = data;

					await selectedDates.forEach((element,position) =>{
						jobcardIds.push(element._id);
					});
					// console.log("selectedDates", selectedDates);

					var lista1= await jobcards.find({_id: {$in:jobcardIds}});
					// console.log("lista1", lista1);

						
				}else{
					console.log("else");
					var data = await jobcards.find({...queryobject,jobcard_jobtype:"Preventative Maintenance", jobcard_departamento:"Telco",jobcard_planneddatems: {$gte:datefromms, $lte:datetoms}}, {jobcard_site:1, jobcard_planneddate:1,jobcard_tecniconome:1,jobcard_departamento:1,jobcard_regiao:1,jobcard_linemanager:1,jobcard_workstatus:1,sparesArrayJobcard:1,generatorArrayJobcard:1,jobcard_credelecinfo:1,jobcardsignage:1,jobcardcontainer:1,jobcardmast:1,jobcardcleaning:1,jobcardlocks:1,jobcardenvironmental:1,jobcardfallarrest:1,jobcardgeneratorinfo:1,jobcardedBoardinfo:1,jobcardelectricalinfo:1,jobcardrectifierinfo:1,jobcardbatterybanksinfo:1,jobcardaircondinfo:1,jobcardantennasinfo:1,jobcardeainfo:1,jobcardtxinfo:1,jobcardvsatinfo:1});
					console.log("data", data);
					// console.log(data);
					var selectedDates = data;

					await selectedDates.forEach((element,position) =>{
						jobcardIds.push(element._id);
					});

					var lista1= await jobcards.find({_id: {$in:jobcardIds}});
				}		
				
			break;
		}

		var lista2=[];

		await Promise.all(lista1.map(async(obj, k)=>{
			lista2[k]=await {};
			var dados=await siteinfos.find({siteinfo_sitenum: obj.jobcard_site},{siteinfo_sitename:1,ttnumber_status:1, siteinfo_generator:1,siteinfo_typesite:1,siteinfo_generatorArray:1,siteinfo_elecpayment:1}).lean();

			if(obj.generatorArrayJobcard.length > 0){
				var anterior = await obj.generatorArrayJobcard[0].jobcard_previousgeneratorhrs;
				var presente = await obj.generatorArrayJobcard[0].jobcard_currentgeneratorhours
				// console.log("presente ",presente);
				// console.log("anterior ",anterior);
				lista2[k].GEN_DEEPSEA_HOUR_METER = await presente;
				lista2[k].GEN_FUEL_READ_PRESENT_CYCLE = await anterior;
				lista2[k].GEN_DEEPSEA_HOUR_METER = "Sim";
				lista2[k].GEN_FUEL_READ_PRESENT_CYCLE = "Sim";
				lista2[k].Id = "";
				lista2[k].Tt_REFERENCE = await obj.jobcard_ttnumber;
				lista2[k].MAINTENANCE_ID = "";
				lista2[k].SITE_ID = await obj.jobcard_site;
				lista2[k].SITENAME = await dados[0].siteinfo_sitename;
				lista2[k].STATUS = await obj.ttnumber_status;
				lista2[k].PROVINCE = "";
				lista2[k].LATITUDE_DEC = "";
				lista2[k].LONGITUDE_DEC = "";
				lista2[k].SITE_TYPE = await dados[0].siteinfo_typesite;
				lista2[k].SITE_HEIGHT = "";
				lista2[k].POWER_TYPE = "";
				lista2[k].TX_TYPE = "";
				lista2[k].BTS_TYPE = await dados[0].siteinfo_siteclassif;
				lista2[k].CO_LOCATED = "";
				lista2[k].CYCLE_NUMBER = "";
				lista2[k].CYCLE_TYPE = "8 weeks";
				lista2[k].MAINTENANCE_OFFICER = await obj.jobcard_tecniconome;
				lista2[k].PLANNED_DATE = await obj.jobcard_planneddate;
				lista2[k].START = await obj.jobcard_sitearrivaldate; 
				lista2[k].END = await obj.jobcard_sitedeparturedate; 
				lista2[k].NEXT_MAINTENANCE = "";
				lista2[k].SITE_OWNER = "";
				lista2[k].NMC_OPERATOR = "";
				lista2[k].SITE_ID_PRESENT = await obj.jobcardsignage.jobcard_idpresent;
				lista2[k].VM_LOGO_SIGN_PRESENT = await obj.jobcardsignage.jobcard_vmlogopresent;
				lista2[k].GENERAL_COMMENTS = await obj.jobcardsignage.jobcard_signagecomments;
				lista2[k].CONTAINER_LIGHT = await obj.jobcardcontainer.jobcard_containerligth;
				lista2[k].CONTAINER_EMERGENCY_LIGHT = await obj.jobcardcontainer.jobcard_testemergency;
				lista2[k].CONTAINER_TEST_POWER_SOCKETS = await obj.jobcardcontainer.jobcard_powersockets;
				lista2[k].CONTAINER_TEST_EARTH_LEAKAGE = await obj.jobcardcontainer.jobcard_testearth;
				lista2[k].CONTAINER_CHECK_CIRCUIT_BREAKERS = await obj.jobcardcontainer.jobcard_circuitbreakers;
				lista2[k].CONTAINER_CHECK_SURGE_ARRESTORS = await obj.jobcardcontainer.jobcard_surgearrestors;
				lista2[k].CONTAINER_CHECK_ELECTRICAL_CONNECTIONS = await obj.jobcardcontainer.jobcard_electricalconnections;
				lista2[k].CONTAINER_CHECK_LABELING = await obj.jobcardcontainer.jobcard_labelling;
				lista2[k].CONTAINER_CHECK_EARTH_CONNECTIONS = await obj.jobcardcontainer.jobcard_earthconnections;
				lista2[k].CONTAINER_CHECK_WALLS_ROOF_FLOOR_PAINT = await obj.jobcardcontainer.jobcard_powerskirting;
				lista2[k].CONTAINER_COMMENTS = "";
				lista2[k].MAST_CHECK_AWL = await obj.jobcardmast.jobcard_awlight;
				lista2[k].MAST_LIGHTS_SWITCHES = await obj.jobcardmast.jobcard_connectligthswitches;
				lista2[k].MAST_SURGE_PROTECTION_MAST_DB = await obj.jobcardmast.jobcard_surgeprotection;
				lista2[k].MAST_CLEAN_INSIDE_MAST = await obj.jobcardmast.jobcard_cleaninside;
				lista2[k].MAST_REPORT_ANY_DAMAGE = await obj.jobcardmast.jobcard_reportdamage;
				lista2[k].MAST_SEAL = await obj.jobcardmast.jobcard_sealentries;
				lista2[k].MAST_FEEDERS_TIGHT = await obj.jobcardmast.jobcard_mountingsfeeders;
				lista2[k].MAST_TREAT_RUST = await obj.jobcardmast.jobcard_rustcable;
				lista2[k].MAST_COMMENTS = await obj.jobcardmast.jobcard_mastcomments;
				lista2[k].SERVICE_FENCE_GATES_LOCKS_HINGES = await obj.jobcardcleaning.jobcard_servicefence;
				lista2[k].SITE_AREA_CLEAN = await obj.jobcardcleaning.jobcard_cleansite;
				lista2[k].CLEAR_WEEDS_GRASS_1_5M_AROUND = await obj.jobcardcleaning.jobcard_cleanweed;
				lista2[k].TREAT_ANTS_WITH_POISON = await obj.jobcardcleaning.jobcard_poisontreament;
				lista2[k].REMOVE_RUBISH_RAZOR_WIRE = await obj.jobcardcleaning.jobcard_removerubbish;
				lista2[k].REPORT_ANY_DEFECTS_ACCESS_ROAD = await obj.jobcardcleaning.jobcard_anydefects;
				lista2[k].GENERAL_COMMENTS2 = await obj.jobcardcleaning.jobcard_cleaningcomments;
				lista2[k].LOCKS_ON_GATE = await obj.jobcardlocks.jobcard_locksgate;
				lista2[k].LOCKS_ON_P3 = await obj.jobcardlocks.jobcard_locksP3;
				lista2[k].LOCKS_ON_GENSET = await obj.jobcardlocks.jobcard_locksgenset;
				lista2[k].LOCKS_ON_CONTAINER_CABINETS = await obj.jobcardlocks.jobcard_lockscontainer;
				lista2[k].LOCKS_ON_M3 = await obj.jobcardlocks.jobcard_locksM3;
				lista2[k].LOCKS_COMMENTS = await obj.jobcardlocks.jobcard_lockscomments;
				lista2[k].ENVIRONMENTAL_COMMENTS = await obj.jobcardenvironmental.jobcard_environmentalcomments;
				lista2[k].AREA_AROUND_SITE_EROSION = await obj.jobcardenvironmental.jobcard_siteerosion;
				lista2[k].GROUND_COVER_INSIDE_FENCE = await obj.jobcardenvironmental.jobcard_groundcover;
				lista2[k].OIL_DIESEL_SPLITS = await obj.jobcardenvironmental.jobcard_oildiesel;
				lista2[k].OVERALL_CONDITION_SITE = await obj.jobcardenvironmental.jobcard_overallsite;
				lista2[k].BASE_STATION_COMMENTS = await obj.jobcardconcernsinfo.jobcard_concernsdescription;
				lista2[k].FALL_ARREST_VISIBLE_STATE = await obj.jobcardfallarrest.jobcard_visiblestate;
				lista2[k].FALL_ARREST_COMMENTS = await obj.jobcardfallarrest.jobcard_fallarrestcomments;
				lista2[k].GEN_MANUFACTURER = await dados[0].siteinfo_generatorArray.siteinfo_generatortype;
				lista2[k].GEN_ENGINE_CAPACITY = await dados[0].siteinfo_generatorArray.siteinfo_generatorenginecapacity;
				lista2[k].GEN_ALTERNATOR_SIZE_AND_CAPACITY = await "";
				lista2[k].GEN_DEEPSEA_HOUR_METER = await obj.generatorArrayJobcard[0].jobcard_previousgeneratorhrs;
				lista2[k].GEN_FUEL_READ_PRESENT_CYCLE = await obj.generatorArrayJobcard[0].jobcard_currentgeneratorhours;
				lista2[k].GEN_STARTUP_DELAY_MIN = await obj.jobcardgeneratorinfo.jobcard_startupdelay;
				lista2[k].GEN_MAINS_RESTORE_MIN = await obj.jobcardgeneratorinfo.jobcard_mainsrestore;
				lista2[k].GEN_REFUELLING_LITERS = await obj.generatorArrayJobcard[0].jobcard_generatorrefuel;
				lista2[k].GEN_LOAD_RED_R = await obj.jobcardgeneratorinfo.jobcard_loadR;
				lista2[k].GEN_LOAD_WHITE_S = await obj.jobcardgeneratorinfo.jobcard_loadwhiteS;
				lista2[k].GEN_LOAD_BLUE_T = await obj.jobcardgeneratorinfo.jobcard_loadblueT;
				lista2[k].GEN_FREQUENCY = await obj.jobcardgeneratorinfo.jobcard_frequency;
				lista2[k].GEN_BATT_VOLTAGE = await obj.jobcardgeneratorinfo.jobcard_batteryvoltage;
				lista2[k].GEN_BATT_CHARGING_CURRENT = await obj.jobcardgeneratorinfo.jobcard_batterycharging;
				lista2[k].GEN_COOLANT_LEVEL = await obj.jobcardgeneratorinfo.jobcard_coolantlevel;
				lista2[k].GEN_OIL_PRESSURE = await obj.jobcardgeneratorinfo.jobcard_oilpressure;
				lista2[k].GEN_COMMENTS = await obj.jobcardgeneratorinfo.jobcard_generatorinfocomments;
				lista2[k].GEN_REPLACE_OIL_FILTER = await obj.jobcardgeneratorinfo.jobcard_oilfilter;
				lista2[k].GEN_CHECK_OIL_LEVEL = await obj.jobcardgeneratorinfo.jobcard_oillevel;
				lista2[k].GEN_CHECK_OIL_LEAKS = await obj.jobcardgeneratorinfo.jobcard_oilleaks;
				lista2[k].GEN_CHECK_RADIATOR_HOSES = await obj.jobcardgeneratorinfo.jobcard_radiatorhoses;
				lista2[k].GEN_REPLACE_AIR_FILTER = await obj.jobcardgeneratorinfo.jobcard_airfilter;
				lista2[k].GEN_CHECK_COOLANT_LEAKS = await obj.jobcardgeneratorinfo.jobcard_coolantleaks;
				lista2[k].GEN_REPLACE_FUEL_FILTER = await obj.jobcardgeneratorinfo.jobcard_fuelfilter;
				lista2[k].GEN_INSPECT_V_BELT = await obj.jobcardgeneratorinfo.jobcard_vbelt;
				lista2[k].GEN_CHECK_FUEL_LEAKS = await obj.jobcardgeneratorinfo.jobcard_fuelleaks;
				lista2[k].GEN_PRERUN_CONTROL_PANEL = await obj.jobcardgeneratorinfo.jobcard_preruncontrol;
				lista2[k].GEN_PRERUN_BATTERY_CHARGER_ALMS = await obj.jobcardgeneratorinfo.jobcard_chargeralarms;
				lista2[k].GEN_PRERUN_RESET_ALL_ALARMS = await "";
				lista2[k].GEN_TESTRUN_FAIL_MAINS_SUPPLY = await obj.jobcardgeneratorinfo.jobcard_failmains;
				lista2[k].GEN_TESTRUN_CHECK_ABNORMAL_VIBRATIONS = await obj.jobcardgeneratorinfo.jobcard_abnormalvibrations;
				lista2[k].GEN_TESTRUN_CHECK_AIRFLOW_RADIATOR = await obj.jobcardgeneratorinfo.jobcard_airflowradiator;
				lista2[k].GEN_TESTRUN_WATER_PUMP_OPERAT = await obj.jobcardgeneratorinfo.jobcard_waterpump;
				lista2[k].GEN_TESTRUN_CONFIRM_EXT_ALARMS = await obj.jobcardgeneratorinfo.jobcard_externalalarms;
				lista2[k].GEN_TESTRUN_COMMENTS = await obj.jobcardgeneratorinfo.jobcard_testruncomments;
				lista2[k].GEN_POSTRUN_CHECK_SWITCH_AUTO = await obj.jobcardgeneratorinfo.jobcard_switchauto;
				lista2[k].GEN_POSTRUN_CHECK_EXT_ALARMS_CLEAR = await obj.jobcardgeneratorinfo.jobcard_externalclear;
				lista2[k].GEN_POSTRUN_COMMENTS = await obj.jobcardgeneratorinfo.jobcard_postruncomments;
				lista2[k].EDB_TIGHTEN_CONNECTIONS = await obj.jobcardedBoardinfo.jobcard_tightenconnect;
				lista2[k].EDB_ENERGY_METERS = await obj.jobcardedBoardinfo.jobcard_energymeters;
				lista2[k].EDB_UNAUTHORIZED_CONNECTIONS = await obj.jobcardedBoardinfo.jobcard_unauthorizedconnect;
				lista2[k].EDB_HOLES_SEALED = await obj.jobcardedBoardinfo.jobcard_holessealed;
				lista2[k].EDB_SITE_LIGHT = await obj.jobcardedBoardinfo.jobcard_sitelight;
				lista2[k].EDB_AC_METER_BOX = await obj.jobcardedBoardinfo.jobcard_meterbox;
				lista2[k].EDB_AUTO_REARM = await obj.jobcardedBoardinfo.jobcard_autorearm;
				lista2[k].EDB_COMMENTS = await obj.jobcardedBoardinfo.jobcard_edBoardcomments;
				lista2[k].ELEC_CURR_RED_R = await obj.jobcardelectricalinfo.jobcard_currentreadingsred;
				lista2[k].ELEC_CURR_WHITE_S = await obj.jobcardelectricalinfo.jobcard_currentreadingswhite;
				lista2[k].ELEC_CURR_BLUE_T = await obj.jobcardelectricalinfo.jobcard_currentreadingsblue;
				lista2[k].ELEC_CURR_NEUTRAL = await obj.jobcardelectricalinfo.jobcard_currentreadingsneutral;
				lista2[k].ELEC_VOLT_R_W_R_S = await obj.jobcardelectricalinfo.jobcard_voltagereadingRW;
				lista2[k].ELEC_VOLT_R_B_R_T = await obj.jobcardelectricalinfo.jobcard_voltagereadingRB;
				lista2[k].ELEC_VOLT_W_B_S_T = await obj.jobcardelectricalinfo.jobcard_voltagereadingWB;
				lista2[k].ELEC_VOLT_R_N_R_N = await obj.jobcardelectricalinfo.jobcard_voltagereadingRN;
				lista2[k].ELEC_VOLT_W_N_S_N = await obj.jobcardelectricalinfo.jobcard_voltagereadingWN;
				lista2[k].ELEC_VOLT_B_N_S_N = await obj.jobcardelectricalinfo.jobcard_voltagereadingBN;
				lista2[k].ELEC_VOLT_R_E_R_EARTH = await obj.jobcardelectricalinfo.jobcard_voltagereadingRE;
				lista2[k].ELEC_VOLT_W_E_S_EARTH = await obj.jobcardelectricalinfo.jobcard_voltagereadingWE;
				lista2[k].ELEC_VOLT_B_E_T_EARTH = await obj.jobcardelectricalinfo.jobcard_voltagereadingBE;
				lista2[k].ELEC_VOLT_N_E_N_EARTH = await obj.jobcardelectricalinfo.jobcard_voltagereadingNE;
				lista2[k].ELEC_COMMENTS = await obj.jobcardelectricalinfo.jobcard_electricalcomments;
				lista2[k].EARTH_LEAK_FUNCTIONAL = await obj.jobcardelectricalinfo.jobcard_earthleakage;
				lista2[k].EARTH_READ_OHM = await obj.jobcardelectricalinfo.jobcard_earthohm;
				lista2[k].EARTH_COMMENTS = await obj.jobcardelectricalinfo.jobcard_earthcomments;
				lista2[k].RECTIFIER_MAKE = await obj.jobcardrectifierinfo.jobcard_rectmake;
				lista2[k].RECTIFIER_OPERATE_PROPERLY = await obj.jobcardrectifierinfo.jobcard_opproperly;
				lista2[k].RECTIFIER_SLOTS_POPULATED = await obj.jobcardrectifierinfo.jobcard_slotspopulated;
				lista2[k].RECTIFIER_PARAMETERS_OKAY = await obj.jobcardrectifierinfo.jobcard_parametersokay;
				lista2[k].RECTIFIER_SYSTEM_NEED_UPGRADE = await obj.jobcardrectifierinfo.jobcard_systemupgrade;
				lista2[k].REC_SLOTS_BURN = await obj.jobcardrectifierinfo.jobcard_slotsburn;
				lista2[k].RECTIFIER_SUPERVISOR_MODULE_OK = await obj.jobcardrectifierinfo.jobcard_supervisormodule;
				lista2[k].RECTIFIER_LVD_OKAY = await obj.jobcardrectifierinfo.jobcard_lvdokay;
				lista2[k].RECTIFIER_PLD_OKAY = await obj.jobcardrectifierinfo.jobcard_pldokay;
				lista2[k].RECTIFIER_AC_DC_CB_OKAY = await obj.jobcardrectifierinfo.jobcard_AcDcCbOkay;
				lista2[k].RECTIFIER_ALARM_COMM_PORT = await obj.jobcardrectifierinfo.jobcard_alarmcommport;
				lista2[k].RECTIFIER_COMMENTS = await obj.jobcardrectifierinfo.jobcard_rectifiercomments;
				lista2[k].BATT_BANK_1_CELL_1_VALUE_TEST_1 = await obj.jobcardbatterybanksinfo.jobcard_batterybank1_test1_cell1;
				lista2[k].BATT_BANK_1_CELL_2_VALUE_TEST_1 = await obj.jobcardbatterybanksinfo.jobcard_batterybank1_test1_cell2;
				lista2[k].BATT_BANK_1_CELL_3_VALUE_TEST_1 = await obj.jobcardbatterybanksinfo.jobcard_batterybank1_test1_cell3;
				lista2[k].BATT_BANK_1_CELL_4_VALUE_TEST_1 = await obj.jobcardbatterybanksinfo.jobcard_batterybank1_test1_cell4;
				lista2[k].BATT_BANK_2_CELL_1_VALUE_TEST_1 = await obj.jobcardbatterybanksinfo.jobcard_batterybank2_test1_cell5;
				lista2[k].BATT_BANK_2_CELL_2_VALUE_TEST_1 = await obj.jobcardbatterybanksinfo.jobcard_batterybank2_test1_cell6;
				lista2[k].BATT_BANK_2_CELL_3_VALUE_TEST_1 = await obj.jobcardbatterybanksinfo.jobcard_batterybank2_test1_cell7;
				lista2[k].BATT_BANK_2_CELL_4_VALUE_TEST_1 = await obj.jobcardbatterybanksinfo.jobcard_batterybank2_test1_cell8;
				lista2[k].BATT_BANK_3_CELL_1_VALUE_TEST_1 = await obj.jobcardbatterybanksinfo.jobcard_batterybank3_test1_cell9;
				lista2[k].BATT_BANK_3_CELL_2_VALUE_TEST_1 = await obj.jobcardbatterybanksinfo.jobcard_batterybank3_test1_cell10;
				lista2[k].BATT_BANK_3_CELL_3_VALUE_TEST_1 = await obj.jobcardbatterybanksinfo.jobcard_batterybank3_test1_cell11;
				lista2[k].BATT_BANK_3_CELL_4_VALUE_TEST_1 = await obj.jobcardbatterybanksinfo.jobcard_batterybank3_test1_cell12;
				lista2[k].BATT_BANK_4_CELL_1_VALUE_TEST_1 = await obj.jobcardbatterybanksinfo.jobcard_batterybank4_test1_cell13;
				lista2[k].BATT_BANK_4_CELL_2_VALUE_TEST_1 = await obj.jobcardbatterybanksinfo.jobcard_batterybank4_test1_cell14;
				lista2[k].BATT_BANK_4_CELL_3_VALUE_TEST_1 = await obj.jobcardbatterybanksinfo.jobcard_batterybank4_test1_cell15;
				lista2[k].BATT_BANK_4_CELL_4_VALUE_TEST_1 = await obj.jobcardbatterybanksinfo.jobcard_batterybank4_test1_cell16;
				lista2[k].BATT_BANK_5_CELL_1_VALUE_TEST_1 = await obj.jobcardbatterybanksinfo.jobcard_batterybank5_test1_cell17;
				lista2[k].BATT_BANK_5_CELL_2_VALUE_TEST_1 = await obj.jobcardbatterybanksinfo.jobcard_batterybank5_test1_cell18;
				lista2[k].BATT_BANK_5_CELL_3_VALUE_TEST_1 = await obj.jobcardbatterybanksinfo.jobcard_batterybank5_test1_cell19;
				lista2[k].BATT_BANK_5_CELL_4_VALUE_TEST_1 = await obj.jobcardbatterybanksinfo.jobcard_batterybank5_test1_cell20;
				lista2[k].BATT_BANK_6_CELL_1_VALUE_TEST_1 = await obj.jobcardbatterybanksinfo.jobcard_batterybank6_test1_cell21;
				lista2[k].BATT_BANK_6_CELL_2_VALUE_TEST_1 = await obj.jobcardbatterybanksinfo.jobcard_batterybank6_test1_cell22;
				lista2[k].BATT_BANK_6_CELL_3_VALUE_TEST_1 = await obj.jobcardbatterybanksinfo.jobcard_batterybank6_test1_cell23;
				lista2[k].BATT_BANK_6_CELL_4_VALUE_TEST_1 = await obj.jobcardbatterybanksinfo.jobcard_batterybank6_test1_cell24;
				lista2[k].BATT_BANK_1_CELL_1_VALUE_TEST_2 = await obj.jobcardbatterybanksinfo.jobcard_batterybank1_test2_cell1;
				lista2[k].BATT_BANK_1_CELL_2_VALUE_TEST_2 = await obj.jobcardbatterybanksinfo.jobcard_batterybank1_test2_cell2;
				lista2[k].BATT_BANK_1_CELL_3_VALUE_TEST_2 = await obj.jobcardbatterybanksinfo.jobcard_batterybank1_test2_cell3;
				lista2[k].BATT_BANK_1_CELL_4_VALUE_TEST_2 = await obj.jobcardbatterybanksinfo.jobcard_batterybank1_test2_cell4;
				lista2[k].BATT_BANK_2_CELL_1_VALUE_TEST_2 = await obj.jobcardbatterybanksinfo.jobcard_batterybank2_test2_cell5;
				lista2[k].BATT_BANK_2_CELL_2_VALUE_TEST_2 = await obj.jobcardbatterybanksinfo.jobcard_batterybank2_test2_cell6;
				lista2[k].BATT_BANK_2_CELL_3_VALUE_TEST_2 = await obj.jobcardbatterybanksinfo.jobcard_batterybank2_test2_cell7;
				lista2[k].BATT_BANK_2_CELL_4_VALUE_TEST_2 = await obj.jobcardbatterybanksinfo.jobcard_batterybank2_test2_cell8;
				lista2[k].BATT_BANK_3_CELL_1_VALUE_TEST_2 = await obj.jobcardbatterybanksinfo.jobcard_batterybank3_test2_cell9;
				lista2[k].BATT_BANK_3_CELL_2_VALUE_TEST_2 = await obj.jobcardbatterybanksinfo.jobcard_batterybank3_test2_cell10;
				lista2[k].BATT_BANK_3_CELL_3_VALUE_TEST_2 = await obj.jobcardbatterybanksinfo.jobcard_batterybank3_test2_cell11;
				lista2[k].BATT_BANK_3_CELL_4_VALUE_TEST_2 = await obj.jobcardbatterybanksinfo.jobcard_batterybank3_test2_cell12;
				lista2[k].BATT_BANK_4_CELL_1_VALUE_TEST_2 = await obj.jobcardbatterybanksinfo.jobcard_batterybank4_test2_cell13;
				lista2[k].BATT_BANK_4_CELL_2_VALUE_TEST_2 = await obj.jobcardbatterybanksinfo.jobcard_batterybank4_test2_cell14;
				lista2[k].BATT_BANK_4_CELL_3_VALUE_TEST_2 = await obj.jobcardbatterybanksinfo.jobcard_batterybank4_test2_cell15;
				lista2[k].BATT_BANK_4_CELL_4_VALUE_TEST_2 = await obj.jobcardbatterybanksinfo.jobcard_batterybank4_test2_cell16;
				lista2[k].BATT_BANK_5_CELL_1_VALUE_TEST_2 = await obj.jobcardbatterybanksinfo.jobcard_batterybank5_test2_cell17;
				lista2[k].BATT_BANK_5_CELL_2_VALUE_TEST_2 = await obj.jobcardbatterybanksinfo.jobcard_batterybank5_test2_cell18;
				lista2[k].BATT_BANK_5_CELL_3_VALUE_TEST_2 = await obj.jobcardbatterybanksinfo.jobcard_batterybank5_test2_cell19;
				lista2[k].BATT_BANK_5_CELL_4_VALUE_TEST_2 = await obj.jobcardbatterybanksinfo.jobcard_batterybank5_test2_cell20;
				lista2[k].BATT_BANK_6_CELL_1_VALUE_TEST_2 = await obj.jobcardbatterybanksinfo.jobcard_batterybank6_test2_cell21;
				lista2[k].BATT_BANK_6_CELL_2_VALUE_TEST_2 = await obj.jobcardbatterybanksinfo.jobcard_batterybank6_test2_cell22;
				lista2[k].BATT_BANK_6_CELL_3_VALUE_TEST_2 = await obj.jobcardbatterybanksinfo.jobcard_batterybank6_test2_cell23;
				lista2[k].BATT_BANK_6_CELL_4_VALUE_TEST_2 = await obj.jobcardbatterybanksinfo.jobcard_batterybank6_test2_cell24;
				lista2[k].BATTERY_COMMENTS = await "";
				lista2[k].AIRCON_NOISE_VIBRATION = await obj.jobcardaircondinfo.jobcard_noisevibration;
				lista2[k].AIRCON_CLEAN_FILTER = await obj.jobcardaircondinfo.jobcard_cleanfilter;
				lista2[k].AIRCON_HIGH_TEMP_ALARM = await obj.jobcardaircondinfo.jobcard_hightemperature;
				lista2[k].AIRCON_OPERATING_TIME_AIRCON = await obj.jobcardaircondinfo.jobcard_operatingtime;
				lista2[k].AIRCON_COOLING = await obj.jobcardaircondinfo.jobcard_accooling;
				lista2[k].AIRCON_MODEL_CAPACITY = await obj.jobcardaircondinfo.jobcard_acmodelcapacity;
				lista2[k].AIRCON_CAGE_INSTALLED = await obj.jobcardaircondinfo.jobcard_accageinst;
				lista2[k].ANTENNAS_SECURE = await obj.jobcardantennasinfo.jobcard_antennasecure;
				lista2[k].ANTENNAS_BRACKETS = await obj.jobcardantennasinfo.jobcard_bracketscond;
				lista2[k].CLAMPS_CONDITION = await obj.jobcardantennasinfo.jobcard_clampcond;
				lista2[k].OPTIC_FIBER_CONDITION = await obj.jobcardantennasinfo.jobcard_opticfibercond;
				lista2[k].RRU_POWER_CABLES = await obj.jobcardantennasinfo.jobcard_rrucables;
				lista2[k].RRU_CONDITION = await obj.jobcardantennasinfo.jobcard_rrucond;
				lista2[k].RRU_EARTH = await "";
				lista2[k].AAU_EARTH = await obj.jobcardantennasinfo.jobcard_aauearth;
				lista2[k].JUMPER_CONDITIONS = await obj.jobcardantennasinfo.jobcard_jumpercond;
				lista2[k].DCDU_CABLES = await obj.jobcardantennasinfo.jobcard_dcducables;
				lista2[k].CABLES_DAMAGES = await obj.jobcardantennasinfo.jobcard_cablesdamages;
				lista2[k].RF_POWER_OPTIC_LABELS = await obj.jobcardantennasinfo.jobcard_opticLabels;
				lista2[k].SIGN_NOTICE_PERIMETER_FENCE = await "";
				lista2[k].SIGN_CAUTION_LADDER = await obj.jobcardsignage.jobcard_cautionladder;
				lista2[k].SIGN_CAUTION_CABLE_TRAY = await obj.jobcardsignage.jobcard_cautioncabletray;
				lista2[k].SIGN_NOTICE_DOOR_ROOFTOP = await obj.jobcardsignage.jobcard_signnotice;
				lista2[k].SIGN_CAUTION_ANTENNA_POLES = await "";
				lista2[k].SIGN_WARNING_STICK_ANTENNAS = await obj.jobcardsignage.jobcard_warningstick;
				lista2[k].SIGN_ROOFTOP_DOOR_LOCKED = await obj.jobcardsignage.jobcard_rooftopdoorlocked;
				lista2[k].SIGN_ACCESS_CONTROL_ROOFTOP = await obj.jobcardsignage.jobcard_accesscontrolrooftop;
				lista2[k].CONSTRUCTION_50M_RADIUS = await obj.jobcardantennasinfo.jobcard_constructionradius;
				lista2[k].RADIO_COMMENTS = await obj.jobcardantennasinfo.jobcard_radiocomments;
				lista2[k].EA_AC_MAINS = await obj.jobcardeainfo.jobcard_acmains;
				lista2[k].EA_AIRCON1 = await obj.jobcardeainfo.jobcard_ac1;
				lista2[k].EA_AIRCON2 = await obj.jobcardeainfo.jobcard_ac2;
				lista2[k].EA_BATT_LOW = await "";
				lista2[k].EA_DOOR_SWITCH = await obj.jobcardeainfo.jobcard_doorswitch;
				lista2[k].EA_GEN_ABNORMAL = await obj.jobcardeainfo.jobcard_genabnormal;
				lista2[k].EA_GEN_LOW_FUEL = await obj.jobcardeainfo.jobcard_genlowfuel;
				lista2[k].EA_GEN_RUNNING = await obj.jobcardeainfo.jobcard_genrunning;
				lista2[k].EA_RECT_MODULE = await obj.jobcardeainfo.jobcard_rectmodule;
				lista2[k].EA_RECT_SYSTEM = await obj.jobcardeainfo.jobcard_rectsystem;
				lista2[k].EA_HIGH_TEMP = await obj.jobcardeainfo.jobcard_hightemp;
				lista2[k].EA_COMMENTS = await obj.jobcardeainfo.jobcard_eainfocomments;
				lista2[k].TX_INTERNAL_EARTH = await obj.jobcardtxinfo.jobcard_internalearth;
				lista2[k].TX_INTERNAL_ELECTRICAL_CONN = await obj.jobcardtxinfo.jobcard_internelectconnect;
				lista2[k].TX_INTERNAL_LABELS = await obj.jobcardtxinfo.jobcard_internallabels;
				lista2[k].TX_INTERNAL_DDF_LABELS = await obj.jobcardtxinfo.jobcard_internalddf;
				lista2[k].TX_INTERNAL_IF_CONNECTIONS_TIGHT = await obj.jobcardtxinfo.jobcard_internalconnecttight;
				lista2[k].TX_INTERNAL_IF_LABELS = await obj.jobcardtxinfo.jobcard_internalIFlabels;
				lista2[k].TX_INTERNAL_COMMENTS = await obj.jobcardtxinfo.jobcard_txinternalcomm;
				lista2[k].TX_EXTERNAL_BRACKETS = await obj.jobcardtxinfo.jobcard_externalbrackets;
				lista2[k].TX_EXTERNAL_NUTS_TIGHT = await obj.jobcardtxinfo.jobcard_externalnutstight;
				lista2[k].TX_EXTERNAL_EARTH = await obj.jobcardtxinfo.jobcard_externalearth;
				lista2[k].TX_EXTERNAL_IF_CONN_TIGHT = await obj.jobcardtxinfo.jobcard_externalIFconntight;
				lista2[k].TX_EXTERNAL_LABELS = await obj.jobcardtxinfo.jobcard_externallabels;
				lista2[k].TX_EXTERNAL_WATERPROOF = await obj.jobcardtxinfo.jobcard_externalwaterproof;
				lista2[k].TX_EXTERNAL_COMMENTS = await obj.jobcardtxinfo.jobcard_externalcomm;
				lista2[k].VSAT_LINK_FROM = await obj.jobcardvsatinfo.jobcard_vsatlinkfrom;
				lista2[k].VSAT_LINK_TO = await obj.jobcardvsatinfo.jobcard_vsatlinkto;
				lista2[k].VSAT_EB_NO = await obj.jobcardvsatinfo.jobcard_ebno;
				lista2[k].VSAT_TX_LEVEL = await obj.jobcardvsatinfo.jobcard_txlevel;
				lista2[k].VSAT_EQUIPM_LABELS = await obj.jobcardvsatinfo.jobcard_equipmentlabels;
				lista2[k].VSAT_CABLE_LABELS = await obj.jobcardvsatinfo.jobcard_cableslabels;
				lista2[k].VSAT_ENTRY_SEALED = await obj.jobcardvsatinfo.jobcard_entrysealed;
				lista2[k].VSAT_CONDUITS_TRUNK_CLEAN = await obj.jobcardvsatinfo.jobcard_conduittrunksclean;
				lista2[k].VSAT_230V_REC_L_N = await obj.jobcardvsatinfo.jobcard_230vrecLN;
				lista2[k].VSAT_230V_REC_L_E = await obj.jobcardvsatinfo.jobcard_230vrecLE;
				lista2[k].VSAT_230V_REC_N_E = await obj.jobcardvsatinfo.jobcard_230vrecNE;
				lista2[k].VSAT_230V_REC_E_E_BAR = await obj.jobcardvsatinfo.jobcard_230vrecEEBar;
				lista2[k].VSAT_DOWNLOAD_MODEM_CONFIG = await obj.jobcardvsatinfo.jobcard_downloadmodemconfig;
				lista2[k].VSAT_CHECK_PLUGS_CONN_TIGHT = await obj.jobcardvsatinfo.jobcard_checkplugsconntight;
				lista2[k].VSAT_CHECK_DISH_PLINTH_CLEAN = await obj.jobcardvsatinfo.jobcard_checkdishplunthclean;
				lista2[k].VSAT_CHECK_DISH_CRACK_SAGG = await obj.jobcardvsatinfo.jobcard_checkdishcracksagg;
				lista2[k].VSAT_CHECK_GALVANISED_ITEMS = await obj.jobcardvsatinfo.jobcard_checkgalvaniseditems;
				lista2[k].VSAT_CHECK_DISH_DENTS_BUMP_SPLIT = await obj.jobcardvsatinfo.jobcard_checkdishdentsbumpsplit;
				lista2[k].VSAT_CHECK_FAN_INTAKE_VENTILATION = await obj.jobcardvsatinfo.jobcard_checkfanintsakevent;
				lista2[k].VSAT_CHECK_DISH_EARTH_DENSOR_PASTE = await obj.jobcardvsatinfo.jobcard_checkdishearthdensorpaste;
				lista2[k].VSAT_CHECK_DISH_TIGHT = await obj.jobcardvsatinfo.jobcard_checkdishtight;
				lista2[k].VSAT_CHECK_CONN_SEALED = await obj.jobcardvsatinfo.jobcard_checkconnsealed;
				lista2[k].VSAT_CHECK_ENTRY_SEALED = await obj.jobcardvsatinfo.jobcard_checkentrysealed;
				lista2[k].VSAT_CHECK_SIGNAL_PATH_OBSTRUCT = await obj.jobcardvsatinfo.jobcard_checksignalpathobst;
				lista2[k].VSAT_COMMENTS = await obj.jobcardvsatinfo.jobcard_vsatcomments;
				lista2[k].ATTACH_PICTURES = "";
				lista2[k].MODIFIED = "";
				lista2[k].MANAGER = await obj.jobcard_linemanager;
				lista2[k].TECH_FIELD = "";
				lista2[k].CREATED = "";
				lista2[k].TYPE = "";
				lista2[k].PATH = "";
				
			}else{
				lista2[k].Id = "";
				lista2[k].Tt_REFERENCE = await obj.jobcard_ttnumber;
				lista2[k].MAINTENANCE_ID = "";
				lista2[k].SITE_ID = await obj.jobcard_site;
				lista2[k].SITENAME = await dados[0].siteinfo_sitename;
				lista2[k].STATUS = await obj.ttnumber_status;
				lista2[k].PROVINCE = "";
				lista2[k].LATITUDE_DEC = "";
				lista2[k].LONGITUDE_DEC = "";
				lista2[k].SITE_TYPE = await dados[0].siteinfo_typesite;
				lista2[k].SITE_HEIGHT = "";
				lista2[k].POWER_TYPE = "";
				lista2[k].TX_TYPE = "";
				lista2[k].BTS_TYPE = await dados[0].siteinfo_siteclassif;
				lista2[k].CO_LOCATED = "";
				lista2[k].CYCLE_NUMBER = "";
				lista2[k].CYCLE_TYPE = "12 weeks";
				lista2[k].MAINTENANCE_OFFICER = await obj.jobcard_tecniconome;
				lista2[k].PLANNED_DATE = await obj.jobcard_planneddate;
				lista2[k].START = await obj.jobcard_sitearrivaldate; //
				lista2[k].END = await obj.jobcard_sitedeparturedate; //
				lista2[k].NEXT_MAINTENANCE = "";
				lista2[k].SITE_OWNER = "";
				lista2[k].NMC_OPERATOR = "";
				lista2[k].SITE_ID_PRESENT = await obj.jobcardsignage.jobcard_idpresent;
				lista2[k].VM_LOGO_SIGN_PRESENT = await obj.jobcardsignage.jobcard_vmlogopresent;
				lista2[k].GENERAL_COMMENTS = await obj.jobcardsignage.jobcard_signagecomments;
				lista2[k].CONTAINER_LIGHT = await obj.jobcardcontainer.jobcard_containerligth;
				lista2[k].CONTAINER_EMERGENCY_LIGHT = await obj.jobcardcontainer.jobcard_testemergency;
				lista2[k].CONTAINER_TEST_POWER_SOCKETS = await obj.jobcardcontainer.jobcard_powersockets;
				lista2[k].CONTAINER_TEST_EARTH_LEAKAGE = await obj.jobcardcontainer.jobcard_testearth;
				lista2[k].CONTAINER_CHECK_CIRCUIT_BREAKERS = await obj.jobcardcontainer.jobcard_circuitbreakers;
				lista2[k].CONTAINER_CHECK_SURGE_ARRESTORS = await obj.jobcardcontainer.jobcard_surgearrestors;
				lista2[k].CONTAINER_CHECK_ELECTRICAL_CONNECTIONS = await obj.jobcardcontainer.jobcard_electricalconnections;
				lista2[k].CONTAINER_CHECK_LABELING = await obj.jobcardcontainer.jobcard_labelling;
				lista2[k].CONTAINER_CHECK_EARTH_CONNECTIONS = await obj.jobcardcontainer.jobcard_earthconnections;
				lista2[k].CONTAINER_CHECK_WALLS_ROOF_FLOOR_PAINT = await obj.jobcardcontainer.jobcard_powerskirting;
				lista2[k].CONTAINER_COMMENTS = "";
				lista2[k].MAST_CHECK_AWL = await obj.jobcardmast.jobcard_awlight;
				lista2[k].MAST_LIGHTS_SWITCHES = await obj.jobcardmast.jobcard_connectligthswitches;
				lista2[k].MAST_SURGE_PROTECTION_MAST_DB = await obj.jobcardmast.jobcard_surgeprotection;
				lista2[k].MAST_CLEAN_INSIDE_MAST = await obj.jobcardmast.jobcard_cleaninside;
				lista2[k].MAST_REPORT_ANY_DAMAGE = await obj.jobcardmast.jobcard_reportdamage;
				lista2[k].MAST_SEAL = await obj.jobcardmast.jobcard_sealentries;
				lista2[k].MAST_FEEDERS_TIGHT = await obj.jobcardmast.jobcard_mountingsfeeders;
				lista2[k].MAST_TREAT_RUST = await obj.jobcardmast.jobcard_rustcable;
				lista2[k].MAST_COMMENTS = await  obj.jobcardmast.jobcard_mastcomments;
				lista2[k].SERVICE_FENCE_GATES_LOCKS_HINGES = await obj.jobcardcleaning.jobcard_servicefence;
				lista2[k].SITE_AREA_CLEAN = await obj.jobcardcleaning.jobcard_cleansite;
				lista2[k].CLEAR_WEEDS_GRASS_1_5M_AROUND = await obj.jobcardcleaning.jobcard_cleanweed;
				lista2[k].TREAT_ANTS_WITH_POISON = await obj.jobcardcleaning.jobcard_poisontreament;
				lista2[k].REMOVE_RUBISH_RAZOR_WIRE = await obj.jobcardcleaning.jobcard_removerubbish;
				lista2[k].REPORT_ANY_DEFECTS_ACCESS_ROAD = await obj.jobcardcleaning.jobcard_anydefects;
				lista2[k].GENERAL_COMMENTS2 = await obj.jobcardcleaning.jobcard_cleaningcomments;
				lista2[k].LOCKS_ON_GATE = await obj.jobcardlocks.jobcard_locksgate;
				lista2[k].LOCKS_ON_P3 = await obj.jobcardlocks.jobcard_locksP3;
				lista2[k].LOCKS_ON_GENSET = await obj.jobcardlocks.jobcard_locksgenset;
				lista2[k].LOCKS_ON_CONTAINER_CABINETS = await obj.jobcardlocks.jobcard_lockscontainer;
				lista2[k].LOCKS_ON_M3 = await obj.jobcardlocks.jobcard_locksM3;
				lista2[k].LOCKS_COMMENTS = await obj.jobcardlocks.jobcard_lockscomments;
				lista2[k].ENVIRONMENTAL_COMMENTS = await obj.jobcardenvironmental.jobcard_environmentalcomments;
				lista2[k].AREA_AROUND_SITE_EROSION = await obj.jobcardenvironmental.jobcard_siteerosion;
				lista2[k].GROUND_COVER_INSIDE_FENCE = await obj.jobcardenvironmental.jobcard_groundcover;
				lista2[k].OIL_DIESEL_SPLITS = await obj.jobcardenvironmental.jobcard_oildiesel;
				lista2[k].OVERALL_CONDITION_SITE = await obj.jobcardenvironmental.jobcard_overallsite;
				lista2[k].BASE_STATION_COMMENTS = await obj.jobcardconcernsinfo.jobcard_concernsdescription;
				lista2[k].FALL_ARREST_VISIBLE_STATE = await obj.jobcardfallarrest.jobcard_visiblestate;
				lista2[k].FALL_ARREST_COMMENTS = await obj.jobcardfallarrest.jobcard_fallarrestcomments;
				lista2[k].GEN_MANUFACTURER = await "";
				lista2[k].GEN_ENGINE_CAPACITY = await "";
				lista2[k].GEN_ALTERNATOR_SIZE_AND_CAPACITY = await "";
				lista2[k].GEN_DEEPSEA_HOUR_METER = await "";
				lista2[k].GEN_FUEL_READ_PRESENT_CYCLE = await "";
				// lista2[k].GEN_DEEPSEA_HOUR_METER = "Sim";
				// lista2[k].GEN_FUEL_READ_PRESENT_CYCLE = "Sim";
				// lista2[k].GEN_DEEPSEA_HOUR_METER = await "anterior";
				// lista2[k].GEN_FUEL_READ_PRESENT_CYCLE = await "anterior";
				lista2[k].GEN_STARTUP_DELAY_MIN = await obj.jobcardgeneratorinfo.jobcard_startupdelay;
				lista2[k].GEN_MAINS_RESTORE_MIN = await obj.jobcardgeneratorinfo.jobcard_mainsrestore;
				lista2[k].GEN_REFUELLING_LITERS = await "";
				lista2[k].GEN_LOAD_RED_R = await obj.jobcardgeneratorinfo.jobcard_loadR;
				lista2[k].GEN_LOAD_WHITE_S = await obj.jobcardgeneratorinfo.jobcard_loadwhiteS;
				lista2[k].GEN_LOAD_BLUE_T = await obj.jobcardgeneratorinfo.jobcard_loadblueT;
				lista2[k].GEN_FREQUENCY = await obj.jobcardgeneratorinfo.jobcard_frequency;
				lista2[k].GEN_BATT_VOLTAGE = await obj.jobcardgeneratorinfo.jobcard_batteryvoltage;
				lista2[k].GEN_BATT_CHARGING_CURRENT = await obj.jobcardgeneratorinfo.jobcard_batterycharging;
				lista2[k].GEN_COOLANT_LEVEL = await obj.jobcardgeneratorinfo.jobcard_coolantlevel;
				lista2[k].GEN_OIL_PRESSURE = await obj.jobcardgeneratorinfo.jobcard_oilpressure;
				lista2[k].GEN_COMMENTS = await obj.jobcardgeneratorinfo.jobcard_generatorinfocomments;
				lista2[k].GEN_REPLACE_OIL_FILTER = await obj.jobcardgeneratorinfo.jobcard_oilfilter;
				lista2[k].GEN_CHECK_OIL_LEVEL = await obj.jobcardgeneratorinfo.jobcard_oillevel;
				lista2[k].GEN_CHECK_OIL_LEAKS = await obj.jobcardgeneratorinfo.jobcard_oilleaks;
				lista2[k].GEN_CHECK_RADIATOR_HOSES = await obj.jobcardgeneratorinfo.jobcard_radiatorhoses;
				lista2[k].GEN_REPLACE_AIR_FILTER = await obj.jobcardgeneratorinfo.jobcard_airfilter;
				lista2[k].GEN_CHECK_COOLANT_LEAKS = await obj.jobcardgeneratorinfo.jobcard_coolantleaks;
				lista2[k].GEN_REPLACE_FUEL_FILTER = await obj.jobcardgeneratorinfo.jobcard_fuelfilter;
				lista2[k].GEN_INSPECT_V_BELT = await obj.jobcardgeneratorinfo.jobcard_vbelt;
				lista2[k].GEN_CHECK_FUEL_LEAKS = await obj.jobcardgeneratorinfo.jobcard_fuelleaks;
				lista2[k].GEN_PRERUN_CONTROL_PANEL = await obj.jobcardgeneratorinfo.jobcard_preruncontrol;
				lista2[k].GEN_PRERUN_BATTERY_CHARGER_ALMS = await obj.jobcardgeneratorinfo.jobcard_chargeralarms;
				lista2[k].GEN_TESTRUN_FAIL_MAINS_SUPPLY = await obj.jobcardgeneratorinfo.jobcard_failmains;
				lista2[k].GEN_TESTRUN_CHECK_ABNORMAL_VIBRATIONS = await obj.jobcardgeneratorinfo.jobcard_abnormalvibrations;
				lista2[k].GEN_TESTRUN_CHECK_AIRFLOW_RADIATOR = await obj.jobcardgeneratorinfo.jobcard_airflowradiator;
				lista2[k].GEN_TESTRUN_WATER_PUMP_OPERAT = await obj.jobcardgeneratorinfo.jobcard_waterpump;
				lista2[k].GEN_TESTRUN_CONFIRM_EXT_ALARMS = await obj.jobcardgeneratorinfo.jobcard_externalalarms;
				lista2[k].GEN_TESTRUN_COMMENTS = await obj.jobcardgeneratorinfo.jobcard_testruncomments;
				lista2[k].GEN_POSTRUN_CHECK_SWITCH_AUTO = await obj.jobcardgeneratorinfo.jobcard_switchauto;
				lista2[k].GEN_POSTRUN_CHECK_EXT_ALARMS_CLEAR = await obj.jobcardgeneratorinfo.jobcard_externalclear;
				lista2[k].GEN_POSTRUN_COMMENTS = await obj.jobcardgeneratorinfo.jobcard_postruncomments;
				lista2[k].EDB_TIGHTEN_CONNECTIONS = await obj.jobcardedBoardinfo.jobcard_tightenconnect;
				lista2[k].EDB_ENERGY_METERS = await obj.jobcardedBoardinfo.jobcard_energymeters;
				lista2[k].EDB_UNAUTHORIZED_CONNECTIONS = await obj.jobcardedBoardinfo.jobcard_unauthorizedconnect;
				lista2[k].EDB_HOLES_SEALED = await obj.jobcardedBoardinfo.jobcard_holessealed;
				lista2[k].EDB_SITE_LIGHT = await obj.jobcardedBoardinfo.jobcard_sitelight;
				lista2[k].EDB_AC_METER_BOX = await obj.jobcardedBoardinfo.jobcard_meterbox;
				lista2[k].EDB_AUTO_REARM = await obj.jobcardedBoardinfo.jobcard_autorearm;
				lista2[k].EDB_COMMENTS = await obj.jobcardedBoardinfo.jobcard_edBoardcomments;
				lista2[k].ELEC_CURR_RED_R = await obj.jobcardelectricalinfo.jobcard_currentreadingsred;
				lista2[k].ELEC_CURR_WHITE_S = await obj.jobcardelectricalinfo.jobcard_currentreadingswhite;
				lista2[k].ELEC_CURR_BLUE_T = await obj.jobcardelectricalinfo.jobcard_currentreadingsblue;
				lista2[k].ELEC_CURR_NEUTRAL = await obj.jobcardelectricalinfo.jobcard_currentreadingsneutral;
				lista2[k].ELEC_VOLT_R_W_R_S = await obj.jobcardelectricalinfo.jobcard_voltagereadingRW;
				lista2[k].ELEC_VOLT_R_B_R_T = await obj.jobcardelectricalinfo.jobcard_voltagereadingRB;
				lista2[k].ELEC_VOLT_W_B_S_T = await obj.jobcardelectricalinfo.jobcard_voltagereadingWB;
				lista2[k].ELEC_VOLT_R_N_R_N = await obj.jobcardelectricalinfo.jobcard_voltagereadingRN;
				lista2[k].ELEC_VOLT_W_N_S_N = await obj.jobcardelectricalinfo.jobcard_voltagereadingWN;
				lista2[k].ELEC_VOLT_B_N_S_N = await obj.jobcardelectricalinfo.jobcard_voltagereadingBN;
				lista2[k].ELEC_VOLT_R_E_R_EARTH = await obj.jobcardelectricalinfo.jobcard_voltagereadingRE;
				lista2[k].ELEC_VOLT_W_E_S_EARTH = await obj.jobcardelectricalinfo.jobcard_voltagereadingWE;
				lista2[k].ELEC_VOLT_B_E_T_EARTH = await obj.jobcardelectricalinfo.jobcard_voltagereadingBE;
				lista2[k].ELEC_VOLT_N_E_N_EARTH = await obj.jobcardelectricalinfo.jobcard_voltagereadingNE;
				lista2[k].ELEC_COMMENTS = await obj.jobcardelectricalinfo.jobcard_electricalcomments;
				lista2[k].EARTH_LEAK_FUNCTIONAL = await obj.jobcardelectricalinfo.jobcard_earthleakage;
				lista2[k].EARTH_READ_OHM = await obj.jobcardelectricalinfo.jobcard_earthohm;
				lista2[k].EARTH_COMMENTS = await obj.jobcardelectricalinfo.jobcard_earthcomments;
				lista2[k].RECTIFIER_MAKE = await obj.jobcardrectifierinfo.jobcard_rectmake;
				lista2[k].RECTIFIER_OPERATE_PROPERLY = await obj.jobcardrectifierinfo.jobcard_opproperly;
				lista2[k].RECTIFIER_SLOTS_POPULATED = await obj.jobcardrectifierinfo.jobcard_slotspopulated;
				lista2[k].RECTIFIER_PARAMETERS_OKAY = await obj.jobcardrectifierinfo.jobcard_parametersokay;
				lista2[k].RECTIFIER_SYSTEM_NEED_UPGRADE = await obj.jobcardrectifierinfo.jobcard_systemupgrade;
				lista2[k].REC_SLOTS_BURN = await obj.jobcardrectifierinfo.jobcard_slotsburn;
				lista2[k].RECTIFIER_SUPERVISOR_MODULE_OK = await obj.jobcardrectifierinfo.jobcard_supervisormodule;
				lista2[k].RECTIFIER_LVD_OKAY = await obj.jobcardrectifierinfo.jobcard_lvdokay;
				lista2[k].RECTIFIER_PLD_OKAY = await obj.jobcardrectifierinfo.jobcard_pldokay;
				lista2[k].RECTIFIER_AC_DC_CB_OKAY = await obj.jobcardrectifierinfo.jobcard_AcDcCbOkay;
				lista2[k].RECTIFIER_ALARM_COMM_PORT = await obj.jobcardrectifierinfo.jobcard_alarmcommport;
				lista2[k].RECTIFIER_COMMENTS = await obj.jobcardrectifierinfo.jobcard_rectifiercomments;
				lista2[k].BATT_BANK_1_CELL_1_VALUE_TEST_1 = await obj.jobcardbatterybanksinfo.jobcard_batterybank1_test1_cell1;
				lista2[k].BATT_BANK_1_CELL_2_VALUE_TEST_1 = await obj.jobcardbatterybanksinfo.jobcard_batterybank1_test1_cell2;
				lista2[k].BATT_BANK_1_CELL_3_VALUE_TEST_1 = await obj.jobcardbatterybanksinfo.jobcard_batterybank1_test1_cell3;
				lista2[k].BATT_BANK_1_CELL_4_VALUE_TEST_1 = await obj.jobcardbatterybanksinfo.jobcard_batterybank1_test1_cell4;
				lista2[k].BATT_BANK_2_CELL_1_VALUE_TEST_1 = await obj.jobcardbatterybanksinfo.jobcard_batterybank2_test1_cell5;
				lista2[k].BATT_BANK_2_CELL_2_VALUE_TEST_1 = await obj.jobcardbatterybanksinfo.jobcard_batterybank2_test1_cell6;
				lista2[k].BATT_BANK_2_CELL_3_VALUE_TEST_1 = await obj.jobcardbatterybanksinfo.jobcard_batterybank2_test1_cell7;
				lista2[k].BATT_BANK_2_CELL_4_VALUE_TEST_1 = await obj.jobcardbatterybanksinfo.jobcard_batterybank2_test1_cell8;
				lista2[k].BATT_BANK_3_CELL_1_VALUE_TEST_1 = await obj.jobcardbatterybanksinfo.jobcard_batterybank3_test1_cell9;
				lista2[k].BATT_BANK_3_CELL_2_VALUE_TEST_1 = await obj.jobcardbatterybanksinfo.jobcard_batterybank3_test1_cell10;
				lista2[k].BATT_BANK_3_CELL_3_VALUE_TEST_1 = await obj.jobcardbatterybanksinfo.jobcard_batterybank3_test1_cell11;
				lista2[k].BATT_BANK_3_CELL_4_VALUE_TEST_1 = await obj.jobcardbatterybanksinfo.jobcard_batterybank3_test1_cell12;
				lista2[k].BATT_BANK_4_CELL_1_VALUE_TEST_1 = await obj.jobcardbatterybanksinfo.jobcard_batterybank4_test1_cell13;
				lista2[k].BATT_BANK_4_CELL_2_VALUE_TEST_1 = await obj.jobcardbatterybanksinfo.jobcard_batterybank4_test1_cell14;
				lista2[k].BATT_BANK_4_CELL_3_VALUE_TEST_1 = await obj.jobcardbatterybanksinfo.jobcard_batterybank4_test1_cell15;
				lista2[k].BATT_BANK_4_CELL_4_VALUE_TEST_1 = await obj.jobcardbatterybanksinfo.jobcard_batterybank4_test1_cell16;
				lista2[k].BATT_BANK_5_CELL_1_VALUE_TEST_1 = await obj.jobcardbatterybanksinfo.jobcard_batterybank5_test1_cell17;
				lista2[k].BATT_BANK_5_CELL_2_VALUE_TEST_1 = await obj.jobcardbatterybanksinfo.jobcard_batterybank5_test1_cell18;
				lista2[k].BATT_BANK_5_CELL_3_VALUE_TEST_1 = await obj.jobcardbatterybanksinfo.jobcard_batterybank5_test1_cell19;
				lista2[k].BATT_BANK_5_CELL_4_VALUE_TEST_1 = await obj.jobcardbatterybanksinfo.jobcard_batterybank5_test1_cell20;
				lista2[k].BATT_BANK_6_CELL_1_VALUE_TEST_1 = await obj.jobcardbatterybanksinfo.jobcard_batterybank6_test1_cell21;
				lista2[k].BATT_BANK_6_CELL_2_VALUE_TEST_1 = await obj.jobcardbatterybanksinfo.jobcard_batterybank6_test1_cell22;
				lista2[k].BATT_BANK_6_CELL_3_VALUE_TEST_1 = await obj.jobcardbatterybanksinfo.jobcard_batterybank6_test1_cell23;
				lista2[k].BATT_BANK_6_CELL_4_VALUE_TEST_1 = await obj.jobcardbatterybanksinfo.jobcard_batterybank6_test1_cell24;
				lista2[k].BATT_BANK_1_CELL_1_VALUE_TEST_2 = await obj.jobcardbatterybanksinfo.jobcard_batterybank1_test2_cell1;
				lista2[k].BATT_BANK_1_CELL_2_VALUE_TEST_2 = await obj.jobcardbatterybanksinfo.jobcard_batterybank1_test2_cell2;
				lista2[k].BATT_BANK_1_CELL_3_VALUE_TEST_2 = await obj.jobcardbatterybanksinfo.jobcard_batterybank1_test2_cell3;
				lista2[k].BATT_BANK_1_CELL_4_VALUE_TEST_2 = await obj.jobcardbatterybanksinfo.jobcard_batterybank1_test2_cell4;
				lista2[k].BATT_BANK_2_CELL_1_VALUE_TEST_2 = await obj.jobcardbatterybanksinfo.jobcard_batterybank2_test2_cell5;
				lista2[k].BATT_BANK_2_CELL_2_VALUE_TEST_2 = await obj.jobcardbatterybanksinfo.jobcard_batterybank2_test2_cell6;
				lista2[k].BATT_BANK_2_CELL_3_VALUE_TEST_2 = await obj.jobcardbatterybanksinfo.jobcard_batterybank2_test2_cell7;
				lista2[k].BATT_BANK_2_CELL_4_VALUE_TEST_2 = await obj.jobcardbatterybanksinfo.jobcard_batterybank2_test2_cell8;
				lista2[k].BATT_BANK_3_CELL_1_VALUE_TEST_2 = await obj.jobcardbatterybanksinfo.jobcard_batterybank3_test2_cell9;
				lista2[k].BATT_BANK_3_CELL_2_VALUE_TEST_2 = await obj.jobcardbatterybanksinfo.jobcard_batterybank3_test2_cell10;
				lista2[k].BATT_BANK_3_CELL_3_VALUE_TEST_2 = await obj.jobcardbatterybanksinfo.jobcard_batterybank3_test2_cell11;
				lista2[k].BATT_BANK_3_CELL_4_VALUE_TEST_2 = await obj.jobcardbatterybanksinfo.jobcard_batterybank3_test2_cell12;
				lista2[k].BATT_BANK_4_CELL_1_VALUE_TEST_2 = await obj.jobcardbatterybanksinfo.jobcard_batterybank4_test2_cell13;
				lista2[k].BATT_BANK_4_CELL_2_VALUE_TEST_2 = await obj.jobcardbatterybanksinfo.jobcard_batterybank4_test2_cell14;
				lista2[k].BATT_BANK_4_CELL_3_VALUE_TEST_2 = await obj.jobcardbatterybanksinfo.jobcard_batterybank4_test2_cell15;
				lista2[k].BATT_BANK_4_CELL_4_VALUE_TEST_2 = await obj.jobcardbatterybanksinfo.jobcard_batterybank4_test2_cell16;
				lista2[k].BATT_BANK_5_CELL_1_VALUE_TEST_2 = await obj.jobcardbatterybanksinfo.jobcard_batterybank5_test2_cell17;
				lista2[k].BATT_BANK_5_CELL_2_VALUE_TEST_2 = await obj.jobcardbatterybanksinfo.jobcard_batterybank5_test2_cell18;
				lista2[k].BATT_BANK_5_CELL_3_VALUE_TEST_2 = await obj.jobcardbatterybanksinfo.jobcard_batterybank5_test2_cell19;
				lista2[k].BATT_BANK_5_CELL_4_VALUE_TEST_2 = await obj.jobcardbatterybanksinfo.jobcard_batterybank5_test2_cell20;
				lista2[k].BATT_BANK_6_CELL_1_VALUE_TEST_2 = await obj.jobcardbatterybanksinfo.jobcard_batterybank6_test2_cell21;
				lista2[k].BATT_BANK_6_CELL_2_VALUE_TEST_2 = await obj.jobcardbatterybanksinfo.jobcard_batterybank6_test2_cell22;
				lista2[k].BATT_BANK_6_CELL_3_VALUE_TEST_2 = await obj.jobcardbatterybanksinfo.jobcard_batterybank6_test2_cell23;
				lista2[k].BATT_BANK_6_CELL_4_VALUE_TEST_2 = await obj.jobcardbatterybanksinfo.jobcard_batterybank6_test2_cell24;
				lista2[k].BATTERY_COMMENTS = await "";
				lista2[k].AIRCON_NOISE_VIBRATION = await obj.jobcardaircondinfo.jobcard_noisevibration;
				lista2[k].AIRCON_CLEAN_FILTER = await obj.jobcardaircondinfo.jobcard_cleanfilter;
				lista2[k].AIRCON_HIGH_TEMP_ALARM = await obj.jobcardaircondinfo.jobcard_hightemperature;
				lista2[k].AIRCON_OPERATING_TIME_AIRCON = await obj.jobcardaircondinfo.jobcard_operatingtime;
				lista2[k].AIRCON_COOLING = await obj.jobcardaircondinfo.jobcard_accooling;
				lista2[k].AIRCON_MODEL_CAPACITY = await obj.jobcardaircondinfo.jobcard_acmodelcapacity;
				lista2[k].AIRCON_CAGE_INSTALLED = await obj.jobcardaircondinfo.jobcard_accageinst;
				lista2[k].ANTENNAS_SECURE = await obj.jobcardantennasinfo.jobcard_antennasecure;
				lista2[k].ANTENNAS_BRACKETS = await obj.jobcardantennasinfo.jobcard_bracketscond;
				lista2[k].CLAMPS_CONDITION = await obj.jobcardantennasinfo.jobcard_clampcond;
				lista2[k].OPTIC_FIBER_CONDITION = await obj.jobcardantennasinfo.jobcard_opticfibercond;
				lista2[k].RRU_POWER_CABLES = await obj.jobcardantennasinfo.jobcard_rrucables;
				lista2[k].RRU_CONDITION = await obj.jobcardantennasinfo.jobcard_rrucond;
				lista2[k].RRU_EARTH = await "";
				lista2[k].AAU_EARTH = await obj.jobcardantennasinfo.jobcard_aauearth;
				lista2[k].JUMPER_CONDITIONS = await obj.jobcardantennasinfo.jobcard_jumpercond;
				lista2[k].DCDU_CABLES = await obj.jobcardantennasinfo.jobcard_dcducables;
				lista2[k].CABLES_DAMAGES = await obj.jobcardantennasinfo.jobcard_cablesdamages;
				lista2[k].RF_POWER_OPTIC_LABELS = await obj.jobcardantennasinfo.jobcard_opticLabels;
				lista2[k].SIGN_NOTICE_PERIMETER_FENCE = await "";
				lista2[k].SIGN_CAUTION_LADDER = await obj.jobcardsignage.jobcard_cautionladder;
				lista2[k].SIGN_CAUTION_CABLE_TRAY = await obj.jobcardsignage.jobcard_cautioncabletray;
				lista2[k].SIGN_NOTICE_DOOR_ROOFTOP = await obj.jobcardsignage.jobcard_signnotice;
				lista2[k].SIGN_CAUTION_ANTENNA_POLES = await "";
				lista2[k].SIGN_WARNING_STICK_ANTENNAS = await obj.jobcardsignage.jobcard_warningstick;
				lista2[k].SIGN_ROOFTOP_DOOR_LOCKED = await obj.jobcardsignage.jobcard_rooftopdoorlocked;
				lista2[k].SIGN_ACCESS_CONTROL_ROOFTOP = await obj.jobcardsignage.jobcard_accesscontrolrooftop;
				lista2[k].CONSTRUCTION_50M_RADIUS = await obj.jobcardantennasinfo.jobcard_constructionradius;
				lista2[k].RADIO_COMMENTS = await obj.jobcardantennasinfo.jobcard_radiocomments;
				lista2[k].EA_AC_MAINS = await obj.jobcardeainfo.jobcard_acmains;
				lista2[k].EA_AIRCON1 = await obj.jobcardeainfo.jobcard_ac1;
				lista2[k].EA_AIRCON2 = await obj.jobcardeainfo.jobcard_ac2;
				lista2[k].EA_BATT_LOW = await "";
				lista2[k].EA_DOOR_SWITCH = await obj.jobcardeainfo.jobcard_doorswitch;
				lista2[k].EA_GEN_ABNORMAL = await obj.jobcardeainfo.jobcard_genabnormal;
				lista2[k].EA_GEN_LOW_FUEL = await obj.jobcardeainfo.jobcard_genlowfuel;
				lista2[k].EA_GEN_RUNNING = await obj.jobcardeainfo.jobcard_genrunning;
				lista2[k].EA_RECT_MODULE = await obj.jobcardeainfo.jobcard_rectmodule;
				lista2[k].EA_RECT_SYSTEM = await obj.jobcardeainfo.jobcard_rectsystem;
				lista2[k].EA_HIGH_TEMP = await obj.jobcardeainfo.jobcard_hightemp;
				lista2[k].EA_COMMENTS = await obj.jobcardeainfo.jobcard_eainfocomments;
				lista2[k].TX_INTERNAL_EARTH = await obj.jobcardtxinfo.jobcard_internalearth;
				lista2[k].TX_INTERNAL_ELECTRICAL_CONN = await obj.jobcardtxinfo.jobcard_internelectconnect;
				lista2[k].TX_INTERNAL_LABELS = await obj.jobcardtxinfo.jobcard_internallabels;
				lista2[k].TX_INTERNAL_DDF_LABELS = await obj.jobcardtxinfo.jobcard_internalddf;
				lista2[k].TX_INTERNAL_IF_CONNECTIONS_TIGHT = await obj.jobcardtxinfo.jobcard_internalconnecttight;
				lista2[k].TX_INTERNAL_IF_LABELS = await obj.jobcardtxinfo.jobcard_internalIFlabels;
				lista2[k].TX_INTERNAL_COMMENTS = await obj.jobcardtxinfo.jobcard_txinternalcomm;
				lista2[k].TX_EXTERNAL_BRACKETS = await obj.jobcardtxinfo.jobcard_externalbrackets;
				lista2[k].TX_EXTERNAL_NUTS_TIGHT = await obj.jobcardtxinfo.jobcard_externalnutstight;
				lista2[k].TX_EXTERNAL_EARTH = await obj.jobcardtxinfo.jobcard_externalearth;
				lista2[k].TX_EXTERNAL_IF_CONN_TIGHT = await obj.jobcardtxinfo.jobcard_externalIFconntight;
				lista2[k].TX_EXTERNAL_LABELS = await obj.jobcardtxinfo.jobcard_externallabels;
				lista2[k].TX_EXTERNAL_WATERPROOF = await obj.jobcardtxinfo.jobcard_externalwaterproof;
				lista2[k].TX_EXTERNAL_COMMENTS = await obj.jobcardtxinfo.jobcard_externalcomm;
				lista2[k].VSAT_LINK_FROM = await obj.jobcardvsatinfo.jobcard_vsatlinkfrom;
				lista2[k].VSAT_LINK_TO = await obj.jobcardvsatinfo.jobcard_vsatlinkto;
				lista2[k].VSAT_EB_NO = await obj.jobcardvsatinfo.jobcard_ebno;
				lista2[k].VSAT_TX_LEVEL = await obj.jobcardvsatinfo.jobcard_txlevel;
				lista2[k].VSAT_EQUIPM_LABELS = await obj.jobcardvsatinfo.jobcard_equipmentlabels;
				lista2[k].VSAT_CABLE_LABELS = await obj.jobcardvsatinfo.jobcard_cableslabels;
				lista2[k].VSAT_ENTRY_SEALED = await obj.jobcardvsatinfo.jobcard_entrysealed;
				lista2[k].VSAT_CONDUITS_TRUNK_CLEAN = await obj.jobcardvsatinfo.jobcard_conduittrunksclean;
				lista2[k].VSAT_230V_REC_L_N = await obj.jobcardvsatinfo.jobcard_230vrecLN;
				lista2[k].VSAT_230V_REC_L_E = await obj.jobcardvsatinfo.jobcard_230vrecLE;
				lista2[k].VSAT_230V_REC_N_E = await obj.jobcardvsatinfo.jobcard_230vrecNE;
				lista2[k].VSAT_230V_REC_E_E_BAR = await obj.jobcardvsatinfo.jobcard_230vrecEEBar;
				lista2[k].VSAT_DOWNLOAD_MODEM_CONFIG = await obj.jobcardvsatinfo.jobcard_downloadmodemconfig;
				lista2[k].VSAT_CHECK_PLUGS_CONN_TIGHT = await obj.jobcardvsatinfo.jobcard_checkplugsconntight;
				lista2[k].VSAT_CHECK_DISH_PLINTH_CLEAN = await obj.jobcardvsatinfo.jobcard_checkdishplunthclean;
				lista2[k].VSAT_CHECK_DISH_CRACK_SAGG = await obj.jobcardvsatinfo.jobcard_checkdishcracksagg;
				lista2[k].VSAT_CHECK_GALVANISED_ITEMS = await obj.jobcardvsatinfo.jobcard_checkgalvaniseditems;
				lista2[k].VSAT_CHECK_DISH_DENTS_BUMP_SPLIT = await obj.jobcardvsatinfo.jobcard_checkdishdentsbumpsplit;
				lista2[k].VSAT_CHECK_FAN_INTAKE_VENTILATION = await obj.jobcardvsatinfo.jobcard_checkfanintsakevent;
				lista2[k].VSAT_CHECK_DISH_EARTH_DENSOR_PASTE = await obj.jobcardvsatinfo.jobcard_checkdishearthdensorpaste;
				lista2[k].VSAT_CHECK_DISH_TIGHT = await obj.jobcardvsatinfo.jobcard_checkdishtight;
				lista2[k].VSAT_CHECK_CONN_SEALED = await obj.jobcardvsatinfo.jobcard_checkconnsealed;
				lista2[k].VSAT_CHECK_ENTRY_SEALED = await obj.jobcardvsatinfo.jobcard_checkentrysealed;
				lista2[k].VSAT_CHECK_SIGNAL_PATH_OBSTRUCT = await obj.jobcardvsatinfo.jobcard_checksignalpathobst;
				lista2[k].VSAT_COMMENTS = await obj.jobcardvsatinfo.jobcard_vsatcomments;
				lista2[k].ATTACH_PICTURES = "";
				lista2[k].MODIFIED = "";
				lista2[k].MANAGER = await obj.jobcard_linemanager;
				lista2[k].TECH_FIELD = "";
				lista2[k].CREATED = "";
				lista2[k].TYPE = "";
				lista2[k].PATH = "";
			}
			
			

			

			
			
		}));
		setTimeout(function(){
              
			res.download("./VmMaintenance_Report.xlsx");
			   }, 3500);
		
		// console.log(lista2);
		if(typeof XLSX == 'undefined') XLSX = require('xlsx');

		/* make the worksheet */
		var ws = await XLSX.utils.json_to_sheet(lista2);

		/* add to workbook */
		var wb = await XLSX.utils.book_new();
		await XLSX.utils.book_append_sheet(wb, ws, "VmMaintenance_Report");

		/* generate an XLSX file */
		await XLSX.writeFile(wb, "VmMaintenance_Report.xlsx");

		// res.download("./VmMaintenance_Report.xlsx");		
	});




	router.post("/printdieselrefuel", upload.any(), async function(req, res){
		var userData= req.session.usuario;

		var temp=JSON.parse(req.body.fitchero);
		var jobcard = temp;

		var queryobject={};

		if(jobcard.reportsmaintenance_region != undefined && jobcard.reportsmaintenance_region != ''){
			queryobject.gerador_jobcardregion = jobcard.reportsmaintenance_region;		
		}
		if(jobcard.reportsmaintenance_department != undefined && jobcard.reportsmaintenance_department != ''){
			queryobject.gerador_jobcarddepartment = jobcard.reportsmaintenance_department;	
		}
		if(jobcard.reportsmaintenance_region =="maputo"){
			if(jobcard.jobcard_tecnicoid[0] != undefined && jobcard.jobcard_tecnicoid[0] != ''){
				queryobject.gerador_jobcardmaintenanceofficerid = jobcard.jobcard_tecnicoid[0];
			}
		}else if(jobcard.reportsmaintenance_region =="sul"){
			if(jobcard.jobcard_tecnicoid[1] != undefined && jobcard.jobcard_tecnicoid[1] != ''){
				queryobject.gerador_jobcardmaintenanceofficerid = jobcard.jobcard_tecnicoid[1];
			}	
		}else if(jobcard.reportsmaintenance_region =="centro"){
			if(jobcard.jobcard_tecnicoid[2] != undefined && jobcard.jobcard_tecnicoid[2] != ''){
				queryobject.gerador_jobcardmaintenanceofficerid = jobcard.jobcard_tecnicoid[2];
			}	
		}else if(jobcard.reportsmaintenance_region =="norte"){
			if(jobcard.jobcard_tecnicoid[3] != undefined && jobcard.jobcard_tecnicoid[3] != ''){
				queryobject.gerador_jobcardmaintenanceofficerid = jobcard.jobcard_tecnicoid[3];	
			}	
		}

		var dateto = await new Date(temp.reportsmaintenance_todate.split('/').reverse().join('-') + 'T23:59:00.000+00:01');

		var datefrom = await new Date(temp.reportsmaintenance_fromdate.split('/').reverse().join('-'));

		generatorhistory.find({...queryobject,data_registo:{$lte:dateto, $gte:datefrom}}, async function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				if(data.length>0){

					var dados=[];

					var exemplo= await Promise.all( data.map(async function(y, i){
				      	dados[i]= await {};
						var site = await siteinfos.find({siteinfo_sitenum:y.gerador_sitenumber}, {ttnumber_status:1, siteinfo_elecsupptype:1}).lean();
						dados[i].SiteNo=y.gerador_sitenumber;
						dados[i].SupplyType =site[0].siteinfo_elecsupptype;
						dados[i].Generator_Type=y.gerador_gentype;
						dados[i].Technician=y.gerador_jobcardmaintenanceofficer;
						dados[i].Region=y.gerador_jobcardregion;
						dados[i].Date=y.gerador_dataregisto;
						dados[i].Previous_Refuel_Hours=y.gerador_previousrefuelhours;
						dados[i].Current_Hours=y.gerador_actualhours;
						dados[i].Gen_Runtime=y.gerador_totalrunhour;
						dados[i].Litres_Refuelled=y.gerador_refuellitres;
						dados[i].Price_Per_Litre=y.gerador_priceperlitre;
						dados[i].TTNumber=y.gerador_jobcardttnumber;
						dados[i].Status=y.ttnumber_status;
						dados[i].Refuel_Reason=y.gerador_refuelreason;
						dados[i].Compliance_Stat=y.gerador_workstatus;
						dados[i].Jobtype=y.gerador_jobcardtype;
				      	






     				 }))

					if(typeof XLSX == 'undefined') XLSX = require('xlsx');

			        /* make the worksheet */
			        var ws = await XLSX.utils.json_to_sheet(dados);

			        /* add to workbook */
			        var wb = await XLSX.utils.book_new();
			        await XLSX.utils.book_append_sheet(wb, ws, "Diesel_Report_View");

			        /* generate an XLSX file */
			        await XLSX.writeFile(wb, "Diesel_Report.xlsx");

			        res.download("./Diesel_Report.xlsx")
				}

			}
		});

	});


	
	router.post("/printalljobcards", upload.any(), async function(req, res){
		var userData= req.session.usuario;
		console.log("printing")
		console.log(req.body);
		var temp = JSON.parse(req.body.fitchero);
		var queryobject={};
		var planneddates=[];
		var jobcardIds=[];
		var controladorfuncao = 0;
		var nome = userData.nome;
		var jobcard = temp;

		if(jobcard.reportsmaintenance_region != undefined && jobcard.reportsmaintenance_region != ''){
			queryobject.jobcard_regiao = jobcard.reportsmaintenance_region;	
		}

		if(jobcard.reportsmaintenance_department != undefined && jobcard.reportsmaintenance_department != ''){
			queryobject.jobcard_departamento = jobcard.reportsmaintenance_department;	
		}

		if(jobcard.ttnumber_status != undefined && jobcard.ttnumber_status !=''){
			queryobject.ttnumber_status = jobcard.ttnumber_status;
		}
		if(jobcard.reportsmaintenance_region =="maputo"){
			if(jobcard.jobcard_tecnicoid[0] != undefined && jobcard.jobcard_tecnicoid[0] != ''){
				queryobject.jobcard_tecnicoid = jobcard.jobcard_tecnicoid[0];
			}
		}else if(jobcard.reportsmaintenance_region =="sul"){
			if(jobcard.jobcard_tecnicoid[1] != undefined && jobcard.jobcard_tecnicoid[1] != ''){
				queryobject.jobcard_tecnicoid = jobcard.jobcard_tecnicoid[1];
			}	
		}else if(jobcard.reportsmaintenance_region =="centro"){
			if(jobcard.jobcard_tecnicoid[2] != undefined && jobcard.jobcard_tecnicoid[2] != ''){
				queryobject.jobcard_tecnicoid = jobcard.jobcard_tecnicoid[2];
			}	
		}else if(jobcard.reportsmaintenance_region =="norte"){
			if(jobcard.jobcard_tecnicoid[3] != undefined && jobcard.jobcard_tecnicoid[3] != ''){
				queryobject.jobcard_tecnicoid = jobcard.jobcard_tecnicoid[3];	
			}	
		}

		var dateto = await new Date(temp.reportsmaintenance_todate.split('/').reverse().join('-') + 'T23:59:00.000+00:01');
		var datefrom = await new Date(temp.reportsmaintenance_fromdate.split('/').reverse().join('-'));
		
		if (userData.funcao == "Tecnico" || (userData.funcao == "Assistant")) {
			controladorfuncao = 1;
		}else if(userData.funcao == "regional_manager"){
			controladorfuncao = 2;
		}else if (userData.verificador_funcao == "Regional Manager") {
			controladorfuncao = 3;
		}else{
			controladorfuncao = 4;
		};

		switch (controladorfuncao) {
			case 1:
				(await jobcards.find({$or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]})).forEach((item, posicao) =>{
					if (typeof item.jobcard_planneddate === "undefined") {
						planneddates.push({maintenancedate: item.jobcard_maintenancedate, id : item._id});	
					}else{
						planneddates.push({date: new Date(item.jobcard_planneddate.split('/').reverse().join('-')), id : item._id});
					}		
				});
			break;

			case 2:
				(await jobcards.find({$or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]})).forEach((item, posicao) =>{
					if (typeof item.jobcard_planneddate === "undefined") {
						planneddates.push({maintenancedate: item.jobcard_maintenancedate, id : item._id});	
					}else{
						planneddates.push({date: new Date(item.jobcard_planneddate.split('/').reverse().join('-')), id : item._id});
					}		
				});
			break;

			case 3:
				(await jobcards.find({jobcard_departamento:userData.departamento, jobcard_regiao:userData.regiao})).forEach((item, posicao) =>{
					if (typeof item.jobcard_planneddate === "undefined") {
						planneddates.push({maintenancedate: item.jobcard_maintenancedate, id : item._id});	
					}else{
						planneddates.push({date: new Date(item.jobcard_planneddate.split('/').reverse().join('-')), id : item._id});
					}		
				});
			break;

			case 4:
				(await jobcards.find({...queryobject},{jobcard_maintenancedate:1, _id:1, jobcard_planneddate:1})).forEach((item, posicao) =>{
					if (typeof item.jobcard_planneddate === "undefined") {
						planneddates.push({maintenancedate: item.jobcard_maintenancedate, id : item._id});	
					}else{
						planneddates.push({date: new Date(item.jobcard_planneddate.split('/').reverse().join('-')), id : item._id});
					}		
				});
			break;
		}


		var selectedDates = planneddates.filter((item, index, array) =>	dateto >= planneddates[index].date && datefrom <= planneddates[index].date || dateto >= planneddates[index].maintenancedate && datefrom <= planneddates[index].maintenancedate);

		selectedDates.forEach((obj,position) =>{
			jobcardIds.push(obj.id);
		});

		var lista1= await jobcards.find({_id: {$in:jobcardIds}});

		if (typeof temp.reportsmaintenance_region === 'undefined' || temp.reportsmaintenance_region === null) {
			
			// jobcard_regiao: temp.reportsmaintenance_region, jobcard_departamento: temp.reportsmaintenance_department, jobcard_maintenancedate:{$lte:dateto, $gte:datefrom},  jobcard_sitearrivaldate:{$exists:true}

			jobcards.find({_id: {$in:jobcardIds}},{jobcard_site:1,jobcard_planneddate:1,jobcard_sitearrivaldate:1,ttnumber_status:1,jobcard_estadoactual:1,jobcard_loggedby:1,jobcard_tecniconome:1,jobcard_jobtype:1,jobcard_regiao:1,gerador_workstatus:1,sparesArrayJobcard:1,generatorArrayJobcard:1,jobcard_credelecinfo:1}, async function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados");
				}
				else{
					if(data.length>0){
	
						jobcards.countDocuments({_id: {$in:jobcardIds}}, function(err,data){
							if(err){
								console.log("Ocorreu um problema na contagem");
							}else{
								console.log("O número de registros é de "+data);
							}
						})
						var dados=[];
	
						var exemplo= await Promise.all( data.map(async function(y, i){
							  dados[i]= await {};
							  dados[i].Site= await y.jobcard_site;
							  if (y.jobcard_planneddate == null && y.jobcard_planneddate == " ") {
								dados[i].Planned_Date= "-----";	  
							}else{
								dados[i].Planned_Date= await y.jobcard_planneddate;
							}
							  dados[i].Arrival_Date= await y.jobcard_sitearrivaldate;
							  dados[i].Status= await y.jobcard_estadoactual;
							  dados[i].CC_Agent= await y.jobcard_loggedby;
							  dados[i].Technician= await y.jobcard_tecniconome;
							  dados[i].Job_Type= await y.jobcard_jobtype;
							  dados[i].Region= await y.jobcard_regiao;
							if (y.gerador_workstatus === null && y.gerador_workstatus == "") {
								dados[i].Compliance= await "-----";	  
							}else{
								dados[i].Compliance= await y.gerador_workstatus;
							}
							if(y.sparesArrayJobcard.length != 0){
								dados[i].Spare_Used = "Yes";
							}else{
								dados[i].Spare_Used = "No";
							}
							
							if(y.generatorArrayJobcard.length != 0){
								dados[i].Diesel_Refuel = "Yes";
							}else{
								dados[i].Diesel_Refuel = "No";
							}
							
							if(y.jobcard_credelecinfo.length != 0){
								dados[i].Credelec_Recarregado = "Yes";
							}else{
								dados[i].Credelec_Recarregado = "No";
							}
						 }));
						//console.log(dados);
	
						if(typeof XLSX == 'undefined') XLSX = require('xlsx');
	
						/* make the worksheet */
						var ws = await XLSX.utils.json_to_sheet(dados);
	
						/* add to workbook */
						var wb = await XLSX.utils.book_new();
						await XLSX.utils.book_append_sheet(wb, ws, "AllJobCards_Report_View");
	
						/* generate an XLSX file */
						await XLSX.writeFile(wb, "AllJobCards_Report.xlsx");
	
						res.download("./AllJobCards_Report.xlsx")
					}
				}
			}).lean();	
		}else{
			//jobcard_regiao: temp.reportsmaintenance_region, jobcard_maintenancedate:{$lte:dateto, $gte:datefrom}, jobcard_departamento: temp.reportsmaintenance_department, jobcard_sitearrivaldate:{$exists:true}
			jobcards.countDocuments({jobcard_regiao: temp.reportsmaintenance_region, jobcard_maintenancedate:{$lte:dateto, $gte:datefrom}, jobcard_departamento: temp.reportsmaintenance_department, jobcard_sitearrivaldate:{$exists:true}}, function(err, dataJobcard){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
					console.log("O número de registros é "+ dataJobcard);
				}
			});


			jobcards.find({_id: {$in:jobcardIds}}, async function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
					if(data.length>0){
	
						var dados=[];
	
						var exemplo= await Promise.all( data.map(async function(y, i){
							  dados[i]= await {};
							  dados[i].Site= await y.jobcard_site;
							  if (y.jobcard_planneddate == null && y.jobcard_planneddate == " ") {
								dados[i].Planned_Date= "-----";	  
							}else{
								dados[i].Planned_Date= await y.jobcard_planneddate;
							}
							  dados[i].Arrival_Date= await y.jobcard_sitearrivaldate;
							  dados[i].Status= await y.ttnumber_status;
							  dados[i].CC_Agent= await y.jobcard_loggedby;
							  dados[i].Technician= await y.jobcard_tecniconome;
							  dados[i].Job_Type= await y.jobcard_jobtype;
							  dados[i].Region= await y.jobcard_regiao;
							if (y.gerador_workstatus === null && y.gerador_workstatus == "") {
								dados[i].Compliance= await "-----";	  
							}else{
								dados[i].Compliance= await y.gerador_workstatus;
							}
							if(y.sparesArrayJobcard.length != 0){
								dados[i].Spare_Used = "Yes";
							}else{
								dados[i].Spare_Used = "No";
							}
							
							if(y.generatorArrayJobcard.length != 0){
								dados[i].Diesel_Refuel = "Yes";
							}else{
								dados[i].Diesel_Refuel = "No";
							}
							
							if(y.jobcard_credelecinfo.length != 0){
								dados[i].Credelec_Recarregado = "Yes";
							}else{
								dados[i].Credelec_Recarregado = "No";
							}
						 }));
						//console.log(dados);
	
						if(typeof XLSX == 'undefined') XLSX = require('xlsx');
	
						/* make the worksheet */
						var ws = await XLSX.utils.json_to_sheet(dados);
	
						/* add to workbook */
						var wb = await XLSX.utils.book_new();
						await XLSX.utils.book_append_sheet(wb, ws, "AllJobCards_Report_View");
	
						/* generate an XLSX file */
						await XLSX.writeFile(wb, "AllJobCards_Report.xlsx");
	
						res.download("./AllJobCards_Report.xlsx")
					}
				}
			});
		}		
	});


	router.post("/dieselrefuelreports", async function(req, res){


		var userData= req.session.usuario;
		var jobcard = req.body;

		var queryobject={};
		
		if(jobcard.reportsmaintenance_region != undefined && jobcard.reportsmaintenance_region != ''){
			queryobject.gerador_jobcardregion = jobcard.reportsmaintenance_region;		
		}
		if(jobcard.reportsmaintenance_department != undefined && jobcard.reportsmaintenance_department != ''){
			queryobject.gerador_jobcarddepartment = jobcard.reportsmaintenance_department;	
		}
		if(jobcard.reportsmaintenance_region =="maputo"){
			if(jobcard.jobcard_tecnicoid[0] != undefined && jobcard.jobcard_tecnicoid[0] != ''){
				queryobject.gerador_jobcardmaintenanceofficerid = jobcard.jobcard_tecnicoid[0];
			}
		}else if(jobcard.reportsmaintenance_region =="sul"){
			if(jobcard.jobcard_tecnicoid[1] != undefined && jobcard.jobcard_tecnicoid[1] != ''){
				queryobject.gerador_jobcardmaintenanceofficerid = jobcard.jobcard_tecnicoid[1];
			}	
		}else if(jobcard.reportsmaintenance_region =="centro"){
			if(jobcard.jobcard_tecnicoid[2] != undefined && jobcard.jobcard_tecnicoid[2] != ''){
				queryobject.gerador_jobcardmaintenanceofficerid = jobcard.jobcard_tecnicoid[2];
			}	
		}else if(jobcard.reportsmaintenance_region =="norte"){
			if(jobcard.jobcard_tecnicoid[3] != undefined && jobcard.jobcard_tecnicoid[3] != ''){
				queryobject.gerador_jobcardmaintenanceofficerid = jobcard.jobcard_tecnicoid[3];	
			}	
		}

		// var datareg = {};

		var dateto = await new Date(jobcard.reportsmaintenance_todate.split('/').reverse().join('-') + 'T23:59:00.000+00:01');
		
		// datareg["$lte"] = dateto;

		var datefrom = await new Date(jobcard.reportsmaintenance_fromdate.split('/').reverse().join('-'));
		
		// datareg["$gte"] = datefrom;

		// queryobject.data_registo = datareg;
		 console.log(queryobject)

		generatorhistory.find({...queryobject,data_registo:{$lte:dateto, $gte:datefrom}}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				model.findOne({nome:req.session.usuario.nome}, function(erro, dados){
					if(erro)
						console.log("ocorreu um erro ao tentar actualizar a foto")
					else{
						req.session.usuario=dados;
						var userData=req.session.usuario;
						
						res.render("updategeneratordetails_home", {DataU:userData, GeneratorHistory:data, pacote:JSON.stringify(req.body), title:'EAGLEI'});
					}
				});

			}
		}).lean();


	});

	router.post("/calloutstatsreports", async function(req, res){


		var userData= req.session.usuario;
		var jobcard = req.body;

		var queryobject={};

		if(jobcard.reportsmaintenance_region != undefined && jobcard.reportsmaintenance_region != ''){
			queryobject.jobcard_regiao = jobcard.reportsmaintenance_region;	
		}

		if(jobcard.reportsmaintenance_department != undefined && jobcard.reportsmaintenance_department != ''){
			queryobject.jobcard_departamento = jobcard.reportsmaintenance_department;	
		}

		if(jobcard.ttnumber_status != undefined && jobcard.ttnumber_status !=''){
			queryobject.ttnumber_status = jobcard.ttnumber_status;
		}
		if(jobcard.reportsmaintenance_region =="maputo"){
			if(jobcard.jobcard_tecnicoid[0] != undefined && jobcard.jobcard_tecnicoid[0] != ''){
				queryobject.jobcard_tecnicoid = jobcard.jobcard_tecnicoid[0];
			}
		}else if(jobcard.reportsmaintenance_region =="sul"){
			if(jobcard.jobcard_tecnicoid[1] != undefined && jobcard.jobcard_tecnicoid[1] != ''){
				queryobject.jobcard_tecnicoid = jobcard.jobcard_tecnicoid[1];
			}	
		}else if(jobcard.reportsmaintenance_region =="centro"){
			if(jobcard.jobcard_tecnicoid[2] != undefined && jobcard.jobcard_tecnicoid[2] != ''){
				queryobject.jobcard_tecnicoid = jobcard.jobcard_tecnicoid[2];
			}	
		}else if(jobcard.reportsmaintenance_region =="norte"){
			if(jobcard.jobcard_tecnicoid[3] != undefined && jobcard.jobcard_tecnicoid[3] != ''){
				queryobject.jobcard_tecnicoid = jobcard.jobcard_tecnicoid[3];	
			}	
		}

		// var datareg = {};

		var dateto = await new Date(jobcard.reportsmaintenance_todate.split('/').reverse().join('-') + 'T23:59:00.000+00:01');
		// datareg["$lte"] = dateto;

		var datefrom = await new Date(jobcard.reportsmaintenance_fromdate.split('/').reverse().join('-'));
		// datareg["$gte"] = datefrom;

		// queryobject.data_registo = datareg;
		console.log(queryobject)

		jobcards.find({...queryobject, jobcard_jobtype:"Callout",jobcard_maintenancedate:{$lte:dateto, $gte:datefrom}, jobcard_sitearrivaldate:{$exists:true}}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				model.findOne({nome:req.session.usuario.nome}, function(erro, dados){
					if(erro)
						console.log("ocorreu um erro ao tentar actualizar a foto")
					else{
						req.session.usuario=dados;
						var userData=req.session.usuario;
						// console.log(data)
						res.render("calloutstatsreports_home", {DataU:userData, CalloutStatsHistory:data, pacote:JSON.stringify(req.body), title:'EAGLEI'});
					}
				});

			}
		});


	});

	router.post("/plannedmaintenancereports", async function(req, res){
		var userData= req.session.usuario;
		var jobcard = req.body;
		var nome = userData.nome;
		var queryobject={};
		var planneddates=[];
		var jobcardIds=[];
		var controladorfuncao = 0;

		if(jobcard.reportsmaintenance_region != undefined && jobcard.reportsmaintenance_region != ''){
			queryobject.jobcard_regiao = jobcard.reportsmaintenance_region;	
		}

		if(jobcard.reportsmaintenance_department != undefined && jobcard.reportsmaintenance_department != ''){
			queryobject.jobcard_departamento = jobcard.reportsmaintenance_department;	
		}

		if(jobcard.ttnumber_status != undefined && jobcard.ttnumber_status !=''){
			queryobject.ttnumber_status = jobcard.ttnumber_status;
		}
		if(jobcard.reportsmaintenance_region =="maputo"){
			if(jobcard.jobcard_tecnicoid[0] != undefined && jobcard.jobcard_tecnicoid[0] != ''){
				queryobject.jobcard_tecnicoid = jobcard.jobcard_tecnicoid[0];
			}
		}else if(jobcard.reportsmaintenance_region =="sul"){
			if(jobcard.jobcard_tecnicoid[1] != undefined && jobcard.jobcard_tecnicoid[1] != ''){
				queryobject.jobcard_tecnicoid = jobcard.jobcard_tecnicoid[1];
			}	
		}else if(jobcard.reportsmaintenance_region =="centro"){
			if(jobcard.jobcard_tecnicoid[2] != undefined && jobcard.jobcard_tecnicoid[2] != ''){
				queryobject.jobcard_tecnicoid = jobcard.jobcard_tecnicoid[2];
			}	
		}else if(jobcard.reportsmaintenance_region =="norte"){
			if(jobcard.jobcard_tecnicoid[3] != undefined && jobcard.jobcard_tecnicoid[3] != ''){
				queryobject.jobcard_tecnicoid = jobcard.jobcard_tecnicoid[3];	
			}	
		}

		var dateto = await new Date(jobcard.reportsmaintenance_todate.split('/').reverse().join('-') + 'T23:59:00.000+00:01');
		var datefrom = await new Date(jobcard.reportsmaintenance_fromdate.split('/').reverse().join('-'));
		console.log("dateto "+dateto);
		console.log("datefrom "+datefrom);
		console.log("Quando o dateto fica em isostring  "+ dateto.toISOString());
		console.log("Quando o datefrom fica em isostring  "+ datefrom.toISOString());


		if (userData.funcao == "Tecnico" || (userData.funcao == "Assistant")) {
			controladorfuncao = 1;
		}else if(userData.funcao == "regional_manager"){
			controladorfuncao = 2;
		}else if (userData.verificador_funcao == "Regional Manager") {
			controladorfuncao = 3;
		}else{
			controladorfuncao = 4;
		};
		console.log(controladorfuncao);
		switch (controladorfuncao) {
			case 1:
				(await jobcards.find({...queryobject,jobcard_jobtype:"Preventative Maintenance", jobcard_planneddate: {$exists: true}, $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, {jobcard_site:1, jobcard_planneddate:1,jobcard_tecniconome:1,jobcard_departamento:1,jobcard_regiao:1,sparesArrayJobcard:1,generatorArrayJobcard:1,jobcard_credelecinfo:1})).forEach((item, posicao) =>{
					planneddates.push({date: new Date(item.jobcard_planneddate.split('/').reverse().join('-')), id : item._id});
				});
			break;

			case 2:
				(await jobcards.find({...queryobject,jobcard_jobtype:"Preventative Maintenance",  jobcard_planneddate: {$exists: true}, $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, {jobcard_site:1,  jobcard_planneddate:1,jobcard_tecniconome:1,jobcard_departamento:1,jobcard_regiao:1,sparesArrayJobcard:1,generatorArrayJobcard:1,jobcard_credelecinfo:1})).forEach((item, posicao) =>{
					planneddates.push({date: new Date(item.jobcard_planneddate.split('/').reverse().join('-')), id : item._id});
				});
			break;

			case 3:
				(await jobcards.find({...queryobject,jobcard_departamento:userData.departamento,  jobcard_regiao:userData.regiao, jobcard_jobtype:"Preventative Maintenance", jobcard_planneddate: {$exists: true}}, {jobcard_site:1, jobcard_jobinfo:1, jobcard_planneddate:1,jobcard_tecniconome:1,jobcard_departamento:1,jobcard_regiao:1,sparesArrayJobcard:1,generatorArrayJobcard:1,jobcard_credelecinfo:1})).forEach((item, posicao) =>{
					planneddates.push({date: new Date(item.jobcard_planneddate.split('/').reverse().join('-')), id : item._id});
				});
			break;

			case 4:
				(await jobcards.find({...queryobject, jobcard_jobtype:"Preventative Maintenance", jobcard_planneddate: {$exists: true}}, {jobcard_site:1, jobcard_planneddate:1,jobcard_tecniconome:1,jobcard_departamento:1,jobcard_regiao:1,sparesArrayJobcard:1,generatorArrayJobcard:1,jobcard_credelecinfo:1})).forEach((item, posicao) =>{
					planneddates.push({date: new Date(item.jobcard_planneddate.split('/').reverse().join('-')), id : item._id});
				});
			break;
		}

		var selectedDates = planneddates.filter((item, index, array) =>	dateto >= planneddates[index].date && datefrom <= planneddates[index].date || dateto >= planneddates[index].maintenancedate && datefrom <= planneddates[index].maintenancedate);

		selectedDates.forEach((obj,position) =>{
			jobcardIds.push(obj.id);
		});

		var lista1= await jobcards.find({_id: {$in:jobcardIds}});
		var lista2=[];

		await Promise.all(lista1.map(async(obj, k)=>{
			lista2[k]=await {};
			var dados=await siteinfos.find({siteinfo_sitenum: obj.jobcard_site}, {siteinfo_sitename:1,siteinfo_generator:1,siteinfo_elecpayment:1}).limit(3).lean();

			lista2[k].nome_site= await dados[0].siteinfo_sitename;
			lista2[k].tem_gerador= await dados[0].siteinfo_generator;
			lista2[k].elec_provider = await dados[0].siteinfo_elecpayment;
		}));
		console.log(jobcard);
		model.findOne({nome:req.session.usuario.nome}, function(erro, dados){
			if(erro)
				console.log("ocorreu um erro ao tentar actualizar a foto")
			else{
				req.session.usuario=dados;
				var userData=req.session.usuario;
				res.render("plannedmaintenancereports_home", {DataU:userData,SiteData: lista2 , PlannedMaintenanceHistory:lista1, Escolha:queryobject, Pacote:JSON.stringify(jobcard), title:'EAGLEI'});
			}
		}).lean();
	});


	router.post("/plannedrefuelreports", async function(req, res){
		var userData= req.session.usuario;
		var jobcard = req.body;
		var nome = userData.nome;
		var queryobject={};
		var planneddates=[];
		var jobcardIds=[];
		var controladorfuncao = 0;

		var dateto = await new Date(jobcard.reportsmaintenance_todate.split('/').reverse().join('-') + 'T23:59:00.000+00:01');
		var datefrom = await new Date(jobcard.reportsmaintenance_fromdate.split('/').reverse().join('-'));
		console.log("dateto "+dateto);
		console.log("datefrom "+datefrom);
		console.log("Quando o dateto fica em isostring  "+ dateto.toISOString());
		console.log("Quando o datefrom fica em isostring  "+ datefrom.toISOString());

		if(jobcard.reportsmaintenance_region != undefined && jobcard.reportsmaintenance_region != ''){
			queryobject.jobcard_regiao = jobcard.reportsmaintenance_region;	
		}

		if(jobcard.reportsmaintenance_department != undefined && jobcard.reportsmaintenance_department != ''){
			queryobject.jobcard_departamento = jobcard.reportsmaintenance_department;	
		}

		if(jobcard.ttnumber_status != undefined && jobcard.ttnumber_status !=''){
			queryobject.ttnumber_status = jobcard.ttnumber_status;
		}
		if(jobcard.reportsmaintenance_region =="maputo"){
			if(jobcard.jobcard_tecnicoid[0] != undefined && jobcard.jobcard_tecnicoid[0] != ''){
				queryobject.jobcard_tecnicoid = jobcard.jobcard_tecnicoid[0];
			}
		}else if(jobcard.reportsmaintenance_region =="sul"){
			if(jobcard.jobcard_tecnicoid[1] != undefined && jobcard.jobcard_tecnicoid[1] != ''){
				queryobject.jobcard_tecnicoid = jobcard.jobcard_tecnicoid[1];
			}	
		}else if(jobcard.reportsmaintenance_region =="centro"){
			if(jobcard.jobcard_tecnicoid[2] != undefined && jobcard.jobcard_tecnicoid[2] != ''){
				queryobject.jobcard_tecnicoid = jobcard.jobcard_tecnicoid[2];
			}	
		}else if(jobcard.reportsmaintenance_region =="norte"){
			if(jobcard.jobcard_tecnicoid[3] != undefined && jobcard.jobcard_tecnicoid[3] != ''){
				queryobject.jobcard_tecnicoid = jobcard.jobcard_tecnicoid[3];	
			}	
		}

		if (userData.funcao == "Tecnico" || (userData.funcao == "Assistant")) {
			controladorfuncao = 1;
		}else if(userData.funcao == "regional_manager"){
			controladorfuncao = 2;
		}else if (userData.verificador_funcao == "Regional Manager") {
			controladorfuncao = 3;
		}else{
			controladorfuncao = 4;
		};
		console.log(controladorfuncao);
		switch (controladorfuncao) {
			case 1:
				(await jobcards.find({...queryobject,jobcard_jobtype:"Preventative Maintenance", jobcard_jobinfo:"Scheduled Refuel", jobcard_planneddate: {$exists: true}, $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, {jobcard_site:1, jobcard_planneddate:1,jobcard_tecniconome:1,jobcard_departamento:1,jobcard_regiao:1,sparesArrayJobcard:1,generatorArrayJobcard:1,jobcard_credelecinfo:1})).forEach((item, posicao) =>{
					planneddates.push({date: new Date(item.jobcard_planneddate.split('/').reverse().join('-')), id : item._id});
				});
			break;

			case 2:
				(await jobcards.find({...queryobject,jobcard_jobtype:"Preventative Maintenance", jobcard_jobinfo:"Scheduled Refuel", jobcard_planneddate: {$exists: true}, $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, {jobcard_site:1,  jobcard_planneddate:1,jobcard_tecniconome:1,jobcard_departamento:1,jobcard_regiao:1,sparesArrayJobcard:1,generatorArrayJobcard:1,jobcard_credelecinfo:1})).forEach((item, posicao) =>{
					planneddates.push({date: new Date(item.jobcard_planneddate.split('/').reverse().join('-')), id : item._id});
				});
			break;

			case 3:
				(await jobcards.find({...queryobject,jobcard_departamento:userData.departamento,  jobcard_regiao:userData.regiao, jobcard_jobtype:"Preventative Maintenance", jobcard_jobinfo:"Scheduled Refuel", jobcard_planneddate: {$exists: true}}, {jobcard_site:1, jobcard_jobinfo:1, jobcard_planneddate:1,jobcard_tecniconome:1,jobcard_departamento:1,jobcard_regiao:1,sparesArrayJobcard:1,generatorArrayJobcard:1,jobcard_credelecinfo:1})).forEach((item, posicao) =>{
					planneddates.push({date: new Date(item.jobcard_planneddate.split('/').reverse().join('-')), id : item._id});
				});
			break;

			case 4:
				(await jobcards.find({...queryobject, jobcard_jobtype:"Preventative Maintenance", jobcard_jobinfo:"Scheduled Refuel", jobcard_planneddate: {$exists: true}}, {jobcard_site:1, jobcard_planneddate:1,jobcard_tecniconome:1,jobcard_departamento:1,jobcard_regiao:1,sparesArrayJobcard:1,generatorArrayJobcard:1,jobcard_credelecinfo:1})).forEach((item, posicao) =>{
					planneddates.push({date: new Date(item.jobcard_planneddate.split('/').reverse().join('-')), id : item._id});
				});
			break;
		}

		var selectedDates = planneddates.filter((item, index, array) =>	dateto >= planneddates[index].date && datefrom <= planneddates[index].date || dateto >= planneddates[index].maintenancedate && datefrom <= planneddates[index].maintenancedate);

		selectedDates.forEach((obj,position) =>{
			jobcardIds.push(obj.id);
		});

		var lista1= await jobcards.find({_id: {$in:jobcardIds}});
		var lista2=[];

		await Promise.all(lista1.map(async(obj, k)=>{
			lista2[k]=await {};
			var dados=await siteinfos.find({siteinfo_sitenum: obj.jobcard_site}, {siteinfo_sitename:1,siteinfo_generator:1,siteinfo_elecpayment:1}).limit(3).lean();

			lista2[k].nome_site= await dados[0].siteinfo_sitename;
			lista2[k].tem_gerador= await dados[0].siteinfo_generator;
			lista2[k].elec_provider = await dados[0].siteinfo_elecpayment;
		}));
		console.log(jobcard);
		model.findOne({nome:req.session.usuario.nome}, function(erro, dados){
			if(erro)
				console.log("ocorreu um erro ao tentar actualizar a foto")
			else{
				req.session.usuario=dados;
				var userData=req.session.usuario;
				res.render("plannedrefuelreport_home", {DataU:userData,SiteData: lista2 , PlannedMaintenanceHistory:lista1, Escolha:queryobject, Pacote:JSON.stringify(jobcard), title:'EAGLEI'});
			}
		}).lean();

	});

	router.post("/comservplannedmaintenances", async function(req, res){
		var userData= req.session.usuario;
		var jobcard = req.body;
		var nome = userData.nome;
		var queryobject={};
		var planneddates=[];
		var jobcardIds=[];
		var controladorfuncao = 0;

		if(jobcard.reportsmaintenance_region != undefined && jobcard.reportsmaintenance_region != ''){
			queryobject.jobcard_regiao = jobcard.reportsmaintenance_region;	
		}

		if(jobcard.reportsmaintenance_department != undefined && jobcard.reportsmaintenance_department != ''){
			queryobject.jobcard_departamento = jobcard.reportsmaintenance_department;	
		}

		if(jobcard.ttnumber_status != undefined && jobcard.ttnumber_status !=''){
			queryobject.ttnumber_status = jobcard.ttnumber_status;
		}
		if(jobcard.reportsmaintenance_region =="maputo"){
			if(jobcard.jobcard_tecnicoid[0] != undefined && jobcard.jobcard_tecnicoid[0] != ''){
				queryobject.jobcard_tecnicoid = jobcard.jobcard_tecnicoid[0];
			}
		}else if(jobcard.reportsmaintenance_region =="sul"){
			if(jobcard.jobcard_tecnicoid[1] != undefined && jobcard.jobcard_tecnicoid[1] != ''){
				queryobject.jobcard_tecnicoid = jobcard.jobcard_tecnicoid[1];
			}	
		}else if(jobcard.reportsmaintenance_region =="centro"){
			if(jobcard.jobcard_tecnicoid[2] != undefined && jobcard.jobcard_tecnicoid[2] != ''){
				queryobject.jobcard_tecnicoid = jobcard.jobcard_tecnicoid[2];
			}	
		}else if(jobcard.reportsmaintenance_region =="norte"){
			if(jobcard.jobcard_tecnicoid[3] != undefined && jobcard.jobcard_tecnicoid[3] != ''){
				queryobject.jobcard_tecnicoid = jobcard.jobcard_tecnicoid[3];	
			}	
		}
		// console.log(queryobject.jobcard_regiao);
		// console.log(queryobject.jobcard_departamento);

		var dateto = await new Date(jobcard.reportsmaintenance_todate.split('/').reverse().join('-') + 'T20:59:00.000+00:01');
		var datefrom = await new Date(jobcard.reportsmaintenance_fromdate.split('/').reverse().join('-'));
		var datetoms = dateto.getTime();
		var datefromms = datefrom.getTime();
		var selectedDates;
		var jobcardIds;
		console.log("Dateto em ms  " +datetoms);
		console.log("Datefrom em ms " +datefromms);
		console.log("dateto "+dateto);
		console.log("datefrom "+datefrom);
		console.log("Quando o dateto fica em isostring  "+ dateto.toISOString());
		console.log("Quando o datefrom fica em isostring  "+ datefrom.toISOString());




		if (userData.funcao == "Tecnico" || (userData.funcao == "Assistant")) {
			controladorfuncao = 1;
		}else if(userData.funcao == "regional_manager"){
			controladorfuncao = 2;
		}else if (userData.verificador_funcao == "Regional Manager") {
			controladorfuncao = 3;
		}else{
			controladorfuncao = 4;
		};
		console.log(controladorfuncao);
		switch (controladorfuncao) {
			case 1:
				(await jobcards.find({...queryobject,jobcard_jobtype:"Preventative Maintenance", jobcard_planneddate: {$exists: true}, $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, {jobcard_site:1, jobcard_planneddate:1,jobcard_estadoactual:1,jobcard_tecniconome:1,jobcard_departamento:1,jobcard_regiao:1,sparesArrayJobcard:1,generatorArrayJobcard:1,jobcard_credelecinfo:1})).forEach((item, posicao) =>{
					planneddates.push({date: new Date(item.jobcard_planneddate.split('/').reverse().join('-')), id : item._id});
				});
			break;

			case 2:
				(await jobcards.find({...queryobject,jobcard_jobtype:"Preventative Maintenance", jobcard_planneddate: {$exists: true}, $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, {jobcard_site:1, jobcard_planneddate:1,jobcard_tecniconome:1,jobcard_estadoactual:1,jobcard_departamento:1,jobcard_regiao:1,sparesArrayJobcard:1,generatorArrayJobcard:1,jobcard_credelecinfo:1})).forEach((item, posicao) =>{
					planneddates.push({date: new Date(item.jobcard_planneddate.split('/').reverse().join('-')), id : item._id});
				});
			break;

			case 3:
				(await jobcards.find({...queryobject,jobcard_departamento:userData.departamento, jobcard_regiao:userData.regiao, jobcard_jobtype:"Preventative Maintenance", jobcard_planneddate: {$exists: true}}, {jobcard_site:1, jobcard_planneddate:1,jobcard_tecniconome:1,jobcard_estadoactual:1,jobcard_departamento:1,jobcard_regiao:1,sparesArrayJobcard:1,generatorArrayJobcard:1,jobcard_credelecinfo:1})).forEach((item, posicao) =>{
					planneddates.push({date: new Date(item.jobcard_planneddate.split('/').reverse().join('-')), id : item._id});
				});
			break;

			case 4:
			var data = await jobcards.find({...queryobject,jobcard_jobtype:"Preventative Maintenance", jobcard_departamento:"Telco", jobcard_planneddatems: {$gte:datefromms, $lte:datetoms}}, {jobcard_site:1, jobcard_planneddate:1,jobcard_estadoactual:1,jobcard_tecniconome:1,jobcard_departamento:1,jobcard_regiao:1,generatorArrayJobcard:1});
			
			// console.log(data);
			selectedDates = data;

			// console.log("Select "+selectedDates);
			await selectedDates.forEach((element,position) =>{
				jobcardIds.push(element._id);
			});

			var lista1= await jobcards.find({_id: {$in:jobcardIds}});
			var lista2=[];

			await Promise.all(lista1.map(async(obj, k)=>{
				lista2[k]=await {};
				var dados=await siteinfos.find({siteinfo_sitenum: obj.jobcard_site}, {jobcard_estadoactual:1, siteinfo_sitename:1,siteinfo_generator:1,siteinfo_elecpayment:1}).sort({jobcard_planneddatems:1}).lean();
				
				if(dados.length>0){
					// console.log(dados[0].siteinfo_sitename);
					lista2[k].nome_site= await dados[0].siteinfo_sitename? dados[0].siteinfo_sitename : "";
					lista2[k].tem_gerador= await dados[0].siteinfo_generator? dados[0].siteinfo_generator : "";
					lista2[k].elec_provider = await dados[0].siteinfo_elecpayment ? dados[0].siteinfo_elecpayment: "";
				}
				else{
					lista2[k].nome_site= "";
					lista2[k].tem_gerador=  "";
					lista2[k].elec_provider = "";
				}
			}));
			//console.log(lista1);
			// console.log(lista2);
			// console.log(jobcard);
			model.findOne({nome:req.session.usuario.nome}, function(erro, dados){
				if(erro)
					console.log("ocorreu um erro ao tentar actualizar a foto")
				else{
					req.session.usuario=dados;
					var userData=req.session.usuario;
					res.render("comservmaintenancereports_home", {DataU:userData,SiteData: lista2 , PlannedMaintenanceHistory:lista1, Escolha:queryobject, Pacote:JSON.stringify(jobcard), title:'EAGLEI'});
				}
			}).lean();



			break;

		}

		// var selectedDates = planneddates.filter((item, index, array) =>	dateto >= planneddates[index].date && datefrom <= planneddates[index].date || dateto >= planneddates[index].maintenancedate && datefrom <= planneddates[index].maintenancedate);
		// console.log(selectedDates);
		
	});



	router.post("/alljobcardsreports", async function(req, res){
		var userData= req.session.usuario;
		var jobcard = req.body;
		var queryobject={};
		var planneddates=[];
		var jobcardIds=[];
		var controladorfuncao = 0;
		var nome = userData.nome;

		if(jobcard.reportsmaintenance_region != undefined && jobcard.reportsmaintenance_region != ''){
			queryobject.jobcard_regiao = jobcard.reportsmaintenance_region;	
		}

		if(jobcard.reportsmaintenance_department != undefined && jobcard.reportsmaintenance_department != ''){
			queryobject.jobcard_departamento = jobcard.reportsmaintenance_department;	
		}

		if(jobcard.ttnumber_status != undefined && jobcard.ttnumber_status !=''){
			queryobject.ttnumber_status = jobcard.ttnumber_status;
		}
		if(jobcard.reportsmaintenance_region =="maputo"){
			if(jobcard.jobcard_tecnicoid[0] != undefined && jobcard.jobcard_tecnicoid[0] != ''){
				queryobject.jobcard_tecnicoid = jobcard.jobcard_tecnicoid[0];
			}
		}else if(jobcard.reportsmaintenance_region =="sul"){
			if(jobcard.jobcard_tecnicoid[1] != undefined && jobcard.jobcard_tecnicoid[1] != ''){
				queryobject.jobcard_tecnicoid = jobcard.jobcard_tecnicoid[1];
			}	
		}else if(jobcard.reportsmaintenance_region =="centro"){
			if(jobcard.jobcard_tecnicoid[2] != undefined && jobcard.jobcard_tecnicoid[2] != ''){
				queryobject.jobcard_tecnicoid = jobcard.jobcard_tecnicoid[2];
			}	
		}else if(jobcard.reportsmaintenance_region =="norte"){
			if(jobcard.jobcard_tecnicoid[3] != undefined && jobcard.jobcard_tecnicoid[3] != ''){
				queryobject.jobcard_tecnicoid = jobcard.jobcard_tecnicoid[3];	
			}	
		}

		var dateto = await new Date(jobcard.reportsmaintenance_todate.split('/').reverse().join('-') + 'T23:59:00.000+00:01');
		var datefrom = await new Date(jobcard.reportsmaintenance_fromdate.split('/').reverse().join('-'));
		console.log("Imprimindo o jobcard");
		console.log(jobcard);
		console.log("Imprimindo o QueryObject");
		console.log(queryobject);


		if (userData.funcao == "Tecnico" || (userData.funcao == "Assistant")) {
			controladorfuncao = 1;
		}else if(userData.funcao == "regional_manager"){
			controladorfuncao = 2;
		}else if (userData.verificador_funcao == "Regional Manager") {
			controladorfuncao = 3;
		}else{
			controladorfuncao = 4;
		};
		
		switch (controladorfuncao) {
			case 1:
				(await jobcards.find({$or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]})).forEach((item, posicao) =>{
					if (typeof item.jobcard_planneddate === "undefined") {
						planneddates.push({maintenancedate: item.jobcard_maintenancedate, id : item._id});	
					}else{
						planneddates.push({date: new Date(item.jobcard_planneddate.split('/').reverse().join('-')), id : item._id});
					}		
				});
			break;

			case 2:
				(await jobcards.find({$or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]})).forEach((item, posicao) =>{
					if (typeof item.jobcard_planneddate === "undefined") {
						planneddates.push({maintenancedate: item.jobcard_maintenancedate, id : item._id});	
					}else{
						planneddates.push({date: new Date(item.jobcard_planneddate.split('/').reverse().join('-')), id : item._id});
					}		
				});
			break;

			case 3:
				(await jobcards.find({jobcard_departamento:userData.departamento, jobcard_regiao:userData.regiao})).forEach((item, posicao) =>{
					if (typeof item.jobcard_planneddate === "undefined") {
						planneddates.push({maintenancedate: item.jobcard_maintenancedate, id : item._id});	
					}else{
						planneddates.push({date: new Date(item.jobcard_planneddate.split('/').reverse().join('-')), id : item._id});
					}		
				});
			break;

			case 4:
				console.log("Entrou no 4");
				(await jobcards.find({...queryobject},{jobcard_maintenancedate:1, _id:1, jobcard_planneddate:1})).forEach((item, posicao) =>{
					if (typeof item.jobcard_planneddate === "undefined") {
						planneddates.push({maintenancedate: item.jobcard_maintenancedate, id : item._id});	
					}else{
						planneddates.push({date: new Date(item.jobcard_planneddate.split('/').reverse().join('-')), id : item._id});
					}		
				});
			break;
		}

		var selectedDates = await planneddates.filter((item, index, array) =>	dateto >= planneddates[index].date && datefrom <= planneddates[index].date || dateto >= planneddates[index].maintenancedate && datefrom <= planneddates[index].maintenancedate);
		console.log(selectedDates);
		await selectedDates.forEach((obj,position) =>{
			jobcardIds.push(obj.id);
			console.log("jobcardIds feito");
		});

		// var lista1= await jobcards.find({_id: {$in:jobcardIds}});
		
		jobcards.find({_id: {$in:jobcardIds}},{jobcard_site:1,jobcard_planneddate:1,jobcard_sitearrivaldate:1,jobcard_estadoactual:1,jobcard_loggedby:1,jobcard_tecniconome:1,jobcard_jobtype:1,jobcard_regiao:1,gerador_workstatus:1,sparesArrayJobcard:1,generatorArrayJobcard:1,jobcard_credelecinfo:1}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				jobcards.countDocuments({_id: {$in:jobcardIds}}, function(err,contagem){
					if(err){
						console.log("Ocorreu um problema na contagem");
					}else{
						console.log("O número de registros é de "+contagem);
						//console.log(data);
					}
				})
				res.render("alljobcards_home", {DataU:userData,AllJobcardsHistory: data, Pacote: JSON.stringify(jobcard),dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
			}
		}).lean();
	});

	// router.post("/alljobcardsreports", async function(req, res){
	// 	var userData= req.session.usuario;
	// 	var jobcard = req.body;
	// 	var queryobject={};
	// 	var planneddates=[];
	// 	var jobcardIds=[];
	// 	var controladorfuncao = 0;
	// 	var nome = userData.nome;

	// 	if(jobcard.reportsmaintenance_region != undefined){
	// 		queryobject.jobcard_regiao = jobcard.reportsmaintenance_region;	
	// 	}

	// 	if(jobcard.reportsmaintenance_department != undefined){
	// 		queryobject.jobcard_departamento = jobcard.reportsmaintenance_department;
	// 	}

	// 	var dateto = await new Date(jobcard.reportsmaintenance_todate.split('/').reverse().join('-') + 'T23:59:00.000+00:01');
	// 	var datefrom = await new Date(jobcard.reportsmaintenance_fromdate.split('/').reverse().join('-'));
	// 	console.log("Imprimindo o jobcard");
	// 	console.log(jobcard);
	// 	console.log("Imprimindo o QueryObject");
	// 	console.log(queryobject);


	// 	if (userData.funcao == "Tecnico" || (userData.funcao == "Assistant")) {
	// 		controladorfuncao = 1;
	// 	}else if(userData.funcao == "regional_manager"){
	// 		controladorfuncao = 2;
	// 	}else if (userData.verificador_funcao == "Regional Manager") {
	// 		controladorfuncao = 3;
	// 	}else{
	// 		controladorfuncao = 4;
	// 	};
		
	// 	switch (controladorfuncao) {
	// 		case 1:
	// 			(await jobcards.find({$or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]})).forEach((item, posicao) =>{
	// 				if (typeof item.jobcard_planneddate === "undefined") {
	// 					planneddates.push({maintenancedate: item.jobcard_maintenancedate, id : item._id});	
	// 				}else{
	// 					planneddates.push({date: new Date(item.jobcard_planneddate.split('/').reverse().join('-')), id : item._id});
	// 				}		
	// 			});
	// 		break;

	// 		case 2:
	// 			(await jobcards.find({$or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]})).forEach((item, posicao) =>{
	// 				if (typeof item.jobcard_planneddate === "undefined") {
	// 					planneddates.push({maintenancedate: item.jobcard_maintenancedate, id : item._id});	
	// 				}else{
	// 					planneddates.push({date: new Date(item.jobcard_planneddate.split('/').reverse().join('-')), id : item._id});
	// 				}		
	// 			});
	// 		break;

	// 		case 3:
	// 			(await jobcards.find({jobcard_departamento:userData.departamento, jobcard_regiao:userData.regiao})).forEach((item, posicao) =>{
	// 				if (typeof item.jobcard_planneddate === "undefined") {
	// 					planneddates.push({maintenancedate: item.jobcard_maintenancedate, id : item._id});	
	// 				}else{
	// 					planneddates.push({date: new Date(item.jobcard_planneddate.split('/').reverse().join('-')), id : item._id});
	// 				}		
	// 			});
	// 		break;

	// 		case 4:
	// 			console.log("Esta no 4");
	// 			(await jobcards.find({...queryobject},{jobcard_maintenancedate:1, _id:1, jobcard_planneddate:1})).forEach((item, posicao) =>{
	// 				if (typeof item.jobcard_planneddate === "undefined") {
	// 					planneddates.push({maintenancedate: item.jobcard_maintenancedate, id : item._id});	
	// 				}else{
	// 					planneddates.push({date: new Date(item.jobcard_planneddate.split('/').reverse().join('-')), id : item._id});
	// 				}		
	// 			});
	// 		break;
	// 	}

	// 	var selectedDates = await planneddates.filter((item, index, array) =>	dateto >= planneddates[index].date && datefrom <= planneddates[index].date || dateto >= planneddates[index].maintenancedate && datefrom <= planneddates[index].maintenancedate);

	// 	await selectedDates.forEach((obj,position) =>{
	// 		jobcardIds.push(obj.id);
	// 	});

	// 	// var lista1= await jobcards.find({_id: {$in:jobcardIds}});
		
	// 	jobcards.find({_id: {$in:jobcardIds}},{jobcard_site:1,jobcard_planneddate:1,jobcard_sitearrivaldate:1,ttnumber_status:1,jobcard_loggedby:1,jobcard_tecniconome:1,jobcard_jobtype:1,jobcard_regiao:1,gerador_workstatus:1,sparesArrayJobcard:1,generatorArrayJobcard:1,jobcard_credelecinfo:1}, function(err, data){
	// 		if(err){
	// 			console.log("ocorreu um erro ao tentar aceder os dados")
	// 		}
	// 		else{
	// 			jobcards.countDocuments({_id: {$in:jobcardIds}}, function(err,contagem){
	// 				if(err){
	// 					console.log("Ocorreu um problema na contagem");
	// 				}else{
	// 					console.log("O número de registros é de "+contagem);
	// 				}
	// 			})
	// 			res.render("alljobcards_home", {DataU:userData,AllJobcardsHistory: data, Pacote: JSON.stringify(jobcard),dadoscontroladordecr:0,dadoscontroladorincr:1, Jobcards:data, title: 'EAGLEI'});
	// 		}
	// 	}).lean();
	// });


	router.post("/updategeneratordetailsGeradorIgual",  upload.any(), async function(req, res){
			var userData= req.session.usuario;
			var jobcard = req.body;

			var sitenum = jobcard.jobcard_siteid;

			if(jobcard.jobcard_generatorrefuel == " "){
				jobcard.jobcard_generatorrefuel = "0";
			}

			var procurajobcard = await jobcards.findOne({_id:jobcard.jobcard_id}, {jobcard_siteid:1,generatorArrayJobcard:1,jobcard_audittrail:1, jobcard_cod:1, jobcard_jobtype:1, jobcard_workstatus:1, jobcard_ttnumber:1, jobcard_regiao:1, jobcard_departamento:1, jobcard_planneddatems:1, jobcard_planneddate5beforems:1, jobcard_planneddate5afterms:1}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
					console.log("Find jobcard");
				}
			}).lean();

			var posicaogeradorjobcard = procurajobcard.generatorArrayJobcard.findIndex(x => x._id == jobcard.dadosIdgeradorjobcard);
			
			var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
	        var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
	        var ano = (new Date()).getFullYear();
	        var todaydate = dia + "/" + mes + "/" + ano;
	        var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

	        var arrAudit = procurajobcard.jobcard_audittrail;
			
			var lastaudittrail = procurajobcard.jobcard_audittrail[procurajobcard.jobcard_audittrail.length-1];

			if((lastaudittrail.jobcard_audittrailname == userData.nome) && (lastaudittrail.jobcard_audittrailaction == "Update Generator Info")){

	        	procurajobcard.jobcard_audittrail[procurajobcard.jobcard_audittrail.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

		    }else{

		      var jobcard_audittrailObject = {};
		      // jobcard_audittrailObject._id = "";
		      jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
		      jobcard_audittrailObject.jobcard_audittrailaction = "Update Generator Info";
		      jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
		      procurajobcard.jobcard_audittrail.push(jobcard_audittrailObject);
		    }

		    var procurasite = await siteinfos.findOne({_id:jobcard.jobcard_siteid}, {siteinfo_generatorArray:1, siteinfo_cod:1, siteinfo_sitenum:1}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
					console.log("Find siteifo");
				}
			}).lean();

			if(jobcard.jobcard_generatorrefuel != "0"){

				var dadositeinfo_generatorprevrefuelhours = jobcard.jobcard_currentgeneratorhours;

			}else{
				var dadositeinfo_generatorprevrefuelhours = jobcard.jobcard_previousrefuelhrs;

			}

			var geradorhistObj = {};

		    geradorhistObj.gerador_siteinfoid = jobcard.jobcard_generator;
		    geradorhistObj.gerador_gentype = jobcard.jobcard_generatorname;
		    geradorhistObj.gerador_jobcardrefid = jobcard.jobcard_id;
		    geradorhistObj.gerador_jobcardref = procurajobcard.jobcard_cod;
		    geradorhistObj.gerador_jobcardtype = procurajobcard.jobcard_jobtype;
		    if(procurajobcard.jobcard_jobtype == "Callout"){
		    	geradorhistObj.gerador_workstatus = "";
		    }else{

		    	var dadoplanneddatems = procurajobcard.jobcard_planneddatems;
	         	var dadoplanneddatebeforems = procurajobcard.jobcard_planneddate5beforems;
	         	var dadoplanneddateafterms = procurajobcard.jobcard_planneddate5afterms;
	         	var dataActualms= (new Date(ano, (mes - 1), dia).getTime());

	         	if( dadoplanneddatems != 0){
	         		if((dataActualms >= dadoplanneddatebeforems) && (dataActualms < dadoplanneddatems)){
	               	geradorhistObj.gerador_workstatus = "Done early";
		           }else
		             if(dataActualms == dadoplanneddatems ){
		               geradorhistObj.gerador_workstatus = "Done on time";
		             }else
		               if((dataActualms > dadoplanneddatems) && (dataActualms <= dadoplanneddateafterms)){
		                 geradorhistObj.gerador_workstatus = "Done later";
		               }else{
		                 geradorhistObj.gerador_workstatus = "Out of time";
		               }
	         	}else{
	         		geradorhistObj.gerador_workstatus = "";
	         	}
		    }
		    
		    geradorhistObj.gerador_jobcardttnumber = procurajobcard.jobcard_ttnumber;
		    geradorhistObj.gerador_jobcardmaintenanceofficer = userData.nome;
		    geradorhistObj.gerador_jobcardmaintenanceofficerid = userData._id;
		    geradorhistObj.gerador_jobcardregion = procurajobcard.jobcard_regiao;
		    geradorhistObj.gerador_jobcarddepartment = procurajobcard.jobcard_departamento;
		    geradorhistObj.gerador_siteinforefid = sitenum;
		    geradorhistObj.gerador_siteinforef = procurasite.siteinfo_cod;
		    geradorhistObj.gerador_sitenumber = procurasite.siteinfo_sitenum;
		    geradorhistObj.gerador_dataregisto = todaydate;
		    geradorhistObj.gerador_dataregistodia = dia;
		    geradorhistObj.gerador_dataregistomes = mes;
		    geradorhistObj.gerador_dataregistoano = ano;
		    geradorhistObj.gerador_previoushours = jobcard.jobcard_previousgeneratorhrs;
		    geradorhistObj.gerador_actualhours = jobcard.jobcard_currentgeneratorhours;
		    geradorhistObj.gerador_previousrefuelhours = jobcard.jobcard_previousrefuelhrs;
		    geradorhistObj.gerador_totalrunhour = parseFloat(jobcard.jobcard_currentgeneratorhours) - parseFloat(jobcard.jobcard_previousgeneratorhrs);
		    geradorhistObj.gerador_refuellitres = jobcard.jobcard_generatorrefuel;
		    geradorhistObj.gerador_refuelreason = jobcard.jobcard_refuelreason;
		    geradorhistObj.gerador_priceperlitre = jobcard.jobcard_priceperliter;

		    jobcards.updateOne({_id:jobcard.jobcard_id, "generatorArrayJobcard._id":jobcard.dadosIdgeradorjobcard},{$set:{data_ultimaactualizacaojobcard:new Date(),jobcard_audittrail:procurajobcard.jobcard_audittrail, "generatorArrayJobcard.$.jobcard_generatormobilefixed":jobcard.jobcard_generatormobilefixed, "generatorArrayJobcard.$.jobcard_previousgeneratorhrs":jobcard.jobcard_previousgeneratorhrs, "generatorArrayJobcard.$.jobcard_currentgeneratorhours":jobcard.jobcard_currentgeneratorhours, "generatorArrayJobcard.$.jobcard_previousrefuelhrs":jobcard.jobcard_previousrefuelhrs, "generatorArrayJobcard.$.jobcard_generatorrefuel":jobcard.jobcard_generatorrefuel, "generatorArrayJobcard.$.jobcard_litersoil":jobcard.jobcard_litersoil, "generatorArrayJobcard.$.jobcard_dsc":jobcard.jobcard_dsc, "generatorArrayJobcard.$.jobcard_refuelreason":jobcard.jobcard_refuelreason, "generatorArrayJobcard.$.jobcard_generatorbeenserviced":jobcard.jobcard_generatorbeenserviced, "generatorArrayJobcard.$.jobcard_priceperliter":jobcard.jobcard_priceperliter}}, function(err, dataJobcard){
		    	if(err){
					console.log("ocorreu um erro ao tentar aceder os dados" + err)
				}else{
					console.log("Jobcard update");

					generatorhistory.updateOne({gerador_jobcardrefid:procurajobcard._id, gerador_siteinfoid:procurajobcard.generatorArrayJobcard[posicaogeradorjobcard].jobcard_generator, gerador_previoushours:procurajobcard.generatorArrayJobcard[posicaogeradorjobcard].jobcard_previousgeneratorhrs}, {$set:{gerador_siteinfoid:geradorhistObj.gerador_siteinfoid, gerador_gentype:geradorhistObj.gerador_gentype, gerador_jobcardtype:geradorhistObj.gerador_jobcardtype, gerador_previoushours:geradorhistObj.gerador_previoushours, gerador_actualhours:geradorhistObj.gerador_actualhours, gerador_totalrunhour:geradorhistObj.gerador_totalrunhour, gerador_previousrefuelhours:geradorhistObj.gerador_previousrefuelhours, gerador_refuellitres:geradorhistObj.gerador_refuellitres, gerador_refuelreason:geradorhistObj.gerador_refuelreason, gerador_priceperlitre:geradorhistObj.gerador_priceperlitre}}, function(err){
						if(err){
							console.log("ocorreu um erro ao tentar aceder os dados" + err)
						}else{
							console.log("Generator History update");

							siteinfos.updateOne({_id:jobcard.jobcard_siteid, "siteinfo_generatorArray._id":jobcard.jobcard_generator},{$set:{"siteinfo_generatorArray.$.siteinfo_generatorhours":jobcard.jobcard_currentgeneratorhours,"siteinfo_generatorArray.$.siteinfo_generatorprevrefuelhours":dadositeinfo_generatorprevrefuelhours}}, function(err, data1){
                            	if(err){
                            		console.log("Ocorreu um erro ao tentar gravar os dados!\n contacte o administrador do sistema");
                            		console.log(err)
                        		}else{
                        			console.log("Generator History Done");
                        		}
                            });
						}
					});
				}
		    });
	});


	router.post("/updategeneratordetailsGeradorDiferente",  upload.any(), async function(req, res){

		var userData= req.session.usuario;
		var jobcard = req.body;

		var sitenum = jobcard.jobcard_siteid;

		if(jobcard.jobcard_generatorrefuel == " "){
			jobcard.jobcard_generatorrefuel = "0";
		}

		var procurajobcard = await jobcards.findOne({_id:jobcard.jobcard_id}, {jobcard_siteid:1,generatorArrayJobcard:1,jobcard_audittrail:1, jobcard_cod:1, jobcard_jobtype:1, jobcard_workstatus:1, jobcard_ttnumber:1, jobcard_regiao:1, jobcard_departamento:1, jobcard_planneddatems:1, jobcard_planneddate5beforems:1, jobcard_planneddate5afterms:1}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find jobcard");
			}
		}).lean();

		var posicaogeradorjobcard = procurajobcard.generatorArrayJobcard.findIndex(x => x._id == jobcard.dadosIdgeradorjobcard);
		
		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
        var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
        var ano = (new Date()).getFullYear();
        var todaydate = dia + "/" + mes + "/" + ano;
        var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

        var arrAudit = procurajobcard.jobcard_audittrail;
		
		var lastaudittrail = procurajobcard.jobcard_audittrail[procurajobcard.jobcard_audittrail.length-1];

		if((lastaudittrail.jobcard_audittrailname == userData.nome) && (lastaudittrail.jobcard_audittrailaction == "Update Generator Info")){

        	procurajobcard.jobcard_audittrail[procurajobcard.jobcard_audittrail.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

	    }else{

	      var jobcard_audittrailObject = {};
	      // jobcard_audittrailObject._id = "";
	      jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
	      jobcard_audittrailObject.jobcard_audittrailaction = "Update Generator Info";
	      jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
	      procurajobcard.jobcard_audittrail.push(jobcard_audittrailObject);
	    }

	    var procurasite = await siteinfos.findOne({_id:jobcard.jobcard_siteid}, {siteinfo_generatorArray:1, siteinfo_cod:1, siteinfo_sitenum:1}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find siteifo");
			}
		}).lean();

	    if(jobcard.jobcard_generator == ""){

			jobcard.jobcard_generatorname = "";
			

		}else{



			var posicaogenerator = procurasite.siteinfo_generatorArray.findIndex(x => x._id == jobcard.jobcard_generator);
			jobcard.jobcard_generatorname = procurasite.siteinfo_generatorArray[posicaogenerator].siteinfo_generatortype;

			if(jobcard.jobcard_generatorrefuel != "0"){
				var dadositeinfo_generatorprevrefuelhours = jobcard.jobcard_currentgeneratorhours;
			}else{
				var dadositeinfo_generatorprevrefuelhours = jobcard.jobcard_previousrefuelhrs;
			}
		}

		var geradorhistObj = {};

	    geradorhistObj.gerador_siteinfoid = jobcard.jobcard_generator;
	    geradorhistObj.gerador_gentype = jobcard.jobcard_generatorname;
	    geradorhistObj.gerador_jobcardrefid = jobcard.jobcard_id;
	    geradorhistObj.gerador_jobcardref = procurajobcard.jobcard_cod;
	    geradorhistObj.gerador_jobcardtype = procurajobcard.jobcard_jobtype;
	    if(procurajobcard.jobcard_jobtype == "Callout"){
	    	geradorhistObj.gerador_workstatus = "";
	    }else{

	    	var dadoplanneddatems = procurajobcard.jobcard_planneddatems;
         	var dadoplanneddatebeforems = procurajobcard.jobcard_planneddate5beforems;
         	var dadoplanneddateafterms = procurajobcard.jobcard_planneddate5afterms;
         	var dataActualms= (new Date(ano, (mes - 1), dia).getTime());

         	if( dadoplanneddatems != 0){
         		if((dataActualms >= dadoplanneddatebeforems) && (dataActualms < dadoplanneddatems)){
               	geradorhistObj.gerador_workstatus = "Done early";
	           }else
	             if(dataActualms == dadoplanneddatems ){
	               geradorhistObj.gerador_workstatus = "Done on time";
	             }else
	               if((dataActualms > dadoplanneddatems) && (dataActualms <= dadoplanneddateafterms)){
	                 geradorhistObj.gerador_workstatus = "Done later";
	               }else{
	                 geradorhistObj.gerador_workstatus = "Out of time";
	               }
         	}else{
         		geradorhistObj.gerador_workstatus = "";
         	}
	    }
	    
	    geradorhistObj.gerador_jobcardttnumber = procurajobcard.jobcard_ttnumber;
	    geradorhistObj.gerador_jobcardmaintenanceofficer = userData.nome;
	    geradorhistObj.gerador_jobcardmaintenanceofficerid = userData._id;
	    geradorhistObj.gerador_jobcardregion = procurajobcard.jobcard_regiao;
	    geradorhistObj.gerador_jobcarddepartment = procurajobcard.jobcard_departamento;
	    geradorhistObj.gerador_siteinforefid = sitenum;
	    geradorhistObj.gerador_siteinforef = procurasite.siteinfo_cod;
	    geradorhistObj.gerador_sitenumber = procurasite.siteinfo_sitenum;
	    geradorhistObj.gerador_dataregisto = todaydate;
	    geradorhistObj.gerador_dataregistodia = dia;
	    geradorhistObj.gerador_dataregistomes = mes;
	    geradorhistObj.gerador_dataregistoano = ano;
	    geradorhistObj.gerador_previoushours = jobcard.jobcard_previousgeneratorhrs;
	    geradorhistObj.gerador_actualhours = jobcard.jobcard_currentgeneratorhours;
	    geradorhistObj.gerador_previousrefuelhours = jobcard.jobcard_previousrefuelhrs;
	    geradorhistObj.gerador_totalrunhour = parseFloat(jobcard.jobcard_currentgeneratorhours) - parseFloat(jobcard.jobcard_previousgeneratorhrs);
	    geradorhistObj.gerador_refuellitres = jobcard.jobcard_generatorrefuel;
	    geradorhistObj.gerador_refuelreason = jobcard.jobcard_refuelreason;
	    geradorhistObj.gerador_priceperlitre = jobcard.jobcard_priceperliter;


	    jobcards.updateOne({_id:jobcard.jobcard_id, "generatorArrayJobcard._id":jobcard.dadosIdgeradorjobcard},{$set:{data_ultimaactualizacaojobcard:new Date(),jobcard_audittrail:procurajobcard.jobcard_audittrail, "generatorArrayJobcard.$.jobcard_generatorname":jobcard.jobcard_generatorname, "generatorArrayJobcard.$.jobcard_generator":jobcard.jobcard_generator, "generatorArrayJobcard.$.jobcard_generatormobilefixed":jobcard.jobcard_generatormobilefixed, "generatorArrayJobcard.$.jobcard_previousgeneratorhrs":jobcard.jobcard_previousgeneratorhrs, "generatorArrayJobcard.$.jobcard_currentgeneratorhours":jobcard.jobcard_currentgeneratorhours, "generatorArrayJobcard.$.jobcard_previousrefuelhrs":jobcard.jobcard_previousrefuelhrs, "generatorArrayJobcard.$.jobcard_generatorrefuel":jobcard.jobcard_generatorrefuel, "generatorArrayJobcard.$.jobcard_litersoil":jobcard.jobcard_litersoil, "generatorArrayJobcard.$.jobcard_dsc":jobcard.jobcard_dsc, "generatorArrayJobcard.$.jobcard_refuelreason":jobcard.jobcard_refuelreason, "generatorArrayJobcard.$.jobcard_generatorbeenserviced":jobcard.jobcard_generatorbeenserviced, "generatorArrayJobcard.$.jobcard_priceperliter":jobcard.jobcard_priceperliter}}, function(err, dataJobcard){
	    	if(err){
				console.log("ocorreu um erro ao tentar aceder os dados" + err)
			}
			else{
				console.log("Jobcard update");

				generatorhistory.updateOne({gerador_jobcardrefid:procurajobcard._id, gerador_siteinfoid:procurajobcard.generatorArrayJobcard[posicaogeradorjobcard].jobcard_generator, gerador_previoushours:procurajobcard.generatorArrayJobcard[posicaogeradorjobcard].jobcard_previousgeneratorhrs}, {$set:{gerador_siteinfoid:geradorhistObj.gerador_siteinfoid, gerador_gentype:geradorhistObj.gerador_gentype, gerador_jobcardtype:geradorhistObj.gerador_jobcardtype, gerador_previoushours:geradorhistObj.gerador_previoushours, gerador_actualhours:geradorhistObj.gerador_actualhours, gerador_totalrunhour:geradorhistObj.gerador_totalrunhour, gerador_previousrefuelhours:geradorhistObj.gerador_previousrefuelhours, gerador_refuellitres:geradorhistObj.gerador_refuellitres, gerador_refuelreason:geradorhistObj.gerador_refuelreason, gerador_priceperlitre:geradorhistObj.gerador_priceperlitre}}, function(err){
					if(err){
						console.log("ocorreu um erro ao tentar aceder os dados" + err)
					}
					else{
						console.log("Generator History update");

						if(jobcard.jobcard_generator == ""){
							
							siteinfos.updateOne({_id:jobcard.jobcard_siteid, "siteinfo_generatorArray._id":procurajobcard.generatorArrayJobcard[posicaogeradorjobcard].jobcard_generator},{$set:{"siteinfo_generatorArray.$.siteinfo_generatorhours":procurajobcard.generatorArrayJobcard[posicaogeradorjobcard].jobcard_previousgeneratorhrs,"siteinfo_generatorArray.$.siteinfo_generatorprevrefuelhours":procurajobcard.generatorArrayJobcard[posicaogeradorjobcard].jobcard_previousrefuelhrs}}, function(err, data1){
                                if(err){
                                    console.log("Ocorreu um erro ao tentar gravar os dados!\n contacte o administrador do sistema");
                                    console.log(err)
                                }
                                else {
                                    console.log("Generator History Done");
                                }
                        	});
						}else{

							siteinfos.updateOne({_id:jobcard.jobcard_siteid, "siteinfo_generatorArray._id":jobcard.jobcard_generator},{$set:{"siteinfo_generatorArray.$.siteinfo_generatorhours":jobcard.jobcard_currentgeneratorhours,"siteinfo_generatorArray.$.siteinfo_generatorprevrefuelhours":dadositeinfo_generatorprevrefuelhours}}, function(err, data1){
                            	if(err){
                            		console.log("Ocorreu um erro ao tentar gravar os dados!\n contacte o administrador do sistema");
                            		console.log(err)
                        		}else{
                        			console.log("Site Info Done");

                        			if(procurajobcard.generatorArrayJobcard[posicaogeradorjobcard].jobcard_generator != ""){
                        				siteinfos.updateOne({_id:jobcard.jobcard_siteid, "siteinfo_generatorArray._id":procurajobcard.generatorArrayJobcard[posicaogeradorjobcard].jobcard_generator},{$set:{"siteinfo_generatorArray.$.siteinfo_generatorhours":procurajobcard.generatorArrayJobcard[posicaogeradorjobcard].jobcard_previousgeneratorhrs,"siteinfo_generatorArray.$.siteinfo_generatorprevrefuelhours":procurajobcard.generatorArrayJobcard[posicaogeradorjobcard].jobcard_previousrefuelhrs}}, function(err, data1){
                        					if(err){
			                            		console.log("Ocorreu um erro ao tentar gravar os dados!\n contacte o administrador do sistema");
			                            		console.log(err)
			                        		}else{
			                        			console.log("Site Info Done");
			                        		}
                        				});
                        			}
                        		}
                            });

						}
					}
				});
			}
	    });


	});

	router.post('/alljobcardshomepesquisa', async function(req, res) {
		var userData= req.session.usuario;
		var siteinfocont = req.body;
		var nome = userData.nome;
		console.log(nome)
		console.log(siteinfocont);
		var pesquisador = siteinfocont.pesquisadorsite;
		var controlador = siteinfocont.pesquisadorsite.toLowerCase();
		var firstLetter = controlador.charAt(0).toUpperCase();
		var rest = controlador.slice(1);
		var controladorupper = firstLetter.concat(rest);
		var controladornr = 0;
		var controladorfuncao = 0;
		
		if(isNaN(controlador)){
			controladornr = 0;
			console.log(parseInt(controladornr))
		}else{
			controladornr = controlador;
			var ttnr = parseInt(controlador);
		}

		if (userData.funcao == "Tecnico" || (userData.funcao == "Assistant")) {
			controladorfuncao = 1;
		}else if(userData.funcao == "regional_manager"){
			controladorfuncao = 2;
		}else if (userData.verificador_funcao == "Regional Manager") {
			controladorfuncao = 3;
		}else{
			controladorfuncao = 4;
		};

		
		console.log(typeof(ttnr));
		console.log(controlador);
		console.log(controladorfuncao);
		console.log(controladorupper);
		switch (controladorfuncao) {
			case 1:
				jobcards.find({jobcard_tecniconome: userData.nome ,$or:[{jobcard_site:controlador}, {jobcard_ttnumber: ttnr} ]}, function(err, data){
					if(err){
						console.log(err);
					}
					else{
						var userData=req.session.usuario;
						res.render("alljobcards_pesquisa", {DataU:userData, AllJobcardsHistory:data, title: 'EAGLEI'});
					}
				});
			break;
			case 2: 
				jobcards.find({$or:[{jobcard_site:controlador}, {jobcard_ttnumber: ttnr}, {jobcard_tecniconome: {$regex: controladorupper}}, {jobcard_tecniconome: pesquisador} ]}, function(err, data){
				
					if(err){
						console.log(err);
					}
					else{
						var userData=req.session.usuario;
						res.render("alljobcards_pesquisa", {DataU:userData, AllJobcardsHistory:data, title: 'EAGLEI'});
					}
				});
			break;
			case 3:
				jobcards.find({jobcard_linemanager: userData.nome, $or:[{jobcard_site:controlador}, {jobcard_ttnumber: ttnr}, {jobcard_tecniconome: {$regex: controladorupper}}, {jobcard_tecniconome: pesquisador} ]}, function(err, data){
					if(err){
						console.log(err);
					}
					else{
						var userData=req.session.usuario;
						res.render("alljobcards_pesquisa", {DataU:userData, AllJobcardsHistory:data, title: 'EAGLEI'});
					}
				});
			break;
			default:
				jobcards.find({$or:[{jobcard_site:controlador}, {jobcard_ttnumber: ttnr}, {jobcard_tecniconome: {$regex: controladorupper}}, {jobcard_tecniconome: pesquisador} ]}, function(err, data){
					if(err){
						console.log(err);
					}
					else{
						var userData=req.session.usuario;
						res.render("alljobcards_pesquisa", {DataU:userData, AllJobcardsHistory:data, title: 'EAGLEI'});
					}
				});
			break;
		};
		
	});


	router.post("/updategeneratordetails",  upload.any(), async function(req, res){
		var userData= req.session.usuario;
		var jobcard = req.body;

		console.log(jobcard)
		
		var sitenum = jobcard.jobcard_siteid;

		if(jobcard.jobcard_generatorrefuel == " "){
			jobcard.jobcard_generatorrefuel = "0";
		}

		var dadositeinfo_generatorprevrefuelhours;

		if(jobcard.jobcard_generatorrefuel != "0"){
			dadositeinfo_generatorprevrefuelhours = jobcard.jobcard_currentgeneratorhours;
		}else{
			dadositeinfo_generatorprevrefuelhours = jobcard.jobcard_previousrefuelhrs;
		}


		var procurasite = await siteinfos.findOne({_id:jobcard.jobcard_siteid}, {siteinfo_generatorArray:1, siteinfo_cod:1, siteinfo_sitenum:1}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find siteifo");
			}
		}).lean();

		if(jobcard.jobcard_generator == ""){

			jobcard.jobcard_generatorname = "";

		}else{

			var posicaogenerator = procurasite.siteinfo_generatorArray.findIndex(x => x._id == jobcard.jobcard_generator);

			jobcard.jobcard_generatorname = procurasite.siteinfo_generatorArray[posicaogenerator].siteinfo_generatortype;
		}


		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
        var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
        var ano = (new Date()).getFullYear();
        var todaydate = dia + "/" + mes + "/" + ano;
        var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

        var procurajobcard = await jobcards.findOne({_id:jobcard.jobcard_id}, {jobcard_audittrail:1, jobcard_cod:1, jobcard_jobtype:1, jobcard_workstatus:1, jobcard_ttnumber:1, jobcard_regiao:1, jobcard_departamento:1, jobcard_planneddatems:1, jobcard_planneddate5beforems:1, jobcard_planneddate5afterms:1}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find jobcard");
			}
		}).lean();

        var arrAudit = procurajobcard.jobcard_audittrail;
		// console.log(arrAudit)
		var lastaudittrail = arrAudit[arrAudit.length-1];

		if((lastaudittrail.jobcard_audittrailname == userData.nome) && (lastaudittrail.jobcard_audittrailaction == "Update Generator Info")){

        	arrAudit[arrAudit.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

	    }else{

	      var jobcard_audittrailObject = {};
	      // jobcard_audittrailObject._id = "";
	      jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
	      jobcard_audittrailObject.jobcard_audittrailaction = "Update Generator Info";
	      jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
	      arrAudit.push(jobcard_audittrailObject);
	    }

		if (jobcard.reset_reason != "null") {
			var jobcard_audittrailObject = {};
	      // jobcard_audittrailObject._id = "";
	      jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
	      jobcard_audittrailObject.jobcard_audittrailaction = "Generator hours has been reset due to "+jobcard.reset_reason;
	      jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
	      arrAudit.push(jobcard_audittrailObject);
		}

	    jobcard.jobcard_audittrail = arrAudit;

	    var geradorhistObj = {};

	    geradorhistObj.gerador_siteinfoid = jobcard.jobcard_generator;
	    geradorhistObj.gerador_gentype = jobcard.jobcard_generatorname;
	    geradorhistObj.gerador_jobcardrefid = jobcard.jobcard_id;
	    geradorhistObj.gerador_jobcardref = procurajobcard.jobcard_cod;
	    geradorhistObj.gerador_jobcardtype = procurajobcard.jobcard_jobtype;
	    if(procurajobcard.jobcard_jobtype == "Callout"){
	    	geradorhistObj.gerador_workstatus = "";
	    }else{

	    	var dadoplanneddatems = procurajobcard.jobcard_planneddatems;
         	var dadoplanneddatebeforems = procurajobcard.jobcard_planneddate5beforems;
         	var dadoplanneddateafterms = procurajobcard.jobcard_planneddate5afterms;
         	var dataActualms= (new Date(ano, (mes - 1), dia).getTime());

         	if( dadoplanneddatems != 0){
         		if((dataActualms >= dadoplanneddatebeforems) && (dataActualms < dadoplanneddatems)){
               	geradorhistObj.gerador_workstatus = "Done early";
	           }else
	             if(dataActualms == dadoplanneddatems ){
	               geradorhistObj.gerador_workstatus = "Done on time";
	             }else
	               if((dataActualms > dadoplanneddatems) && (dataActualms <= dadoplanneddateafterms)){
	                 geradorhistObj.gerador_workstatus = "Done later";
	               }else{
	                 geradorhistObj.gerador_workstatus = "Out of time";
	               }
         	}else{
         		geradorhistObj.gerador_workstatus = "";
         	}
	    }
	    
	    geradorhistObj.gerador_jobcardttnumber = procurajobcard.jobcard_ttnumber;
	    geradorhistObj.gerador_jobcardmaintenanceofficer = userData.nome;
	    geradorhistObj.gerador_jobcardmaintenanceofficerid = userData._id;
	    geradorhistObj.gerador_jobcardregion = procurajobcard.jobcard_regiao;
	    geradorhistObj.gerador_jobcarddepartment = procurajobcard.jobcard_departamento;
	    geradorhistObj.gerador_siteinforefid = sitenum;
	    geradorhistObj.gerador_siteinforef = procurasite.siteinfo_cod;
	    geradorhistObj.gerador_sitenumber = procurasite.siteinfo_sitenum;
	    geradorhistObj.gerador_dataregisto = todaydate;
	    geradorhistObj.gerador_dataregistodia = dia;
	    geradorhistObj.gerador_dataregistomes = mes;
	    geradorhistObj.gerador_dataregistoano = ano;
	    geradorhistObj.gerador_previoushours = jobcard.jobcard_previousgeneratorhrs;
	    geradorhistObj.gerador_actualhours = jobcard.jobcard_currentgeneratorhours;
	    geradorhistObj.gerador_previousrefuelhours = jobcard.jobcard_previousrefuelhrs;
	    geradorhistObj.gerador_totalrunhour = parseFloat(jobcard.jobcard_currentgeneratorhours) - parseFloat(jobcard.jobcard_previousgeneratorhrs);
	    geradorhistObj.gerador_refuellitres = jobcard.jobcard_generatorrefuel;
	    geradorhistObj.gerador_refuelreason = jobcard.jobcard_refuelreason;
	    geradorhistObj.gerador_priceperlitre = jobcard.jobcard_priceperliter;


		jobcards.updateOne({_id:jobcard.jobcard_id},{$set:{data_ultimaactualizacaojobcard:new Date(),jobcard_audittrail:jobcard.jobcard_audittrail} ,$push:{generatorArrayJobcard:jobcard}}, function(err, data1){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados" + err)
			}
			else{
					generatorhistory.gravar_historico(geradorhistObj, function(err){
						if(err){
							console.log("ocorreu um erro ao tentar aceder os dados" + err)
						}
						else{
							if(jobcard.jobcard_generator != ""){

								siteinfos.updateOne({_id:jobcard.jobcard_siteid, "siteinfo_generatorArray._id":jobcard.jobcard_generator},{$set:{"siteinfo_generatorArray.$.siteinfo_generatorhours":jobcard.jobcard_currentgeneratorhours,"siteinfo_generatorArray.$.siteinfo_generatorprevrefuelhours":dadositeinfo_generatorprevrefuelhours}}, function(err, data1){
	                                if(err){
	                                    console.log("Ocorreu um erro ao tentar gravar os dados!\n contacte o administrador do sistema");
	                                    console.log(err)
	                                }
	                                else {
	                                    console.log("Generator History Done");
	                                }
                            	});
							}
							
						}
					});

			}
		});



	});

	router.post("/updatecredelecdetailsActualizar",  upload.any(), async function(req, res){
        var userData= req.session.usuario;
        var jobcard = req.body;
        
        var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
        var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
        var ano = (new Date()).getFullYear();
        var todaydate = dia + "/" + mes + "/" + ano;
        var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

        var procurajobcard = await jobcards.findOne({_id:jobcard.jobcard_id}, {jobcard_audittrail:1}, function(err, data){
            if(err){
                console.log("ocorreu um erro ao tentar aceder os dados")
            }
            else{
                console.log("Find jobcard");
            }
        }).lean();

        var arrAudit = procurajobcard.jobcard_audittrail;
        // console.log(arrAudit)
        var lastaudittrail = arrAudit[arrAudit.length-1];

        if((lastaudittrail.jobcard_audittrailname == userData.nome) && (lastaudittrail.jobcard_audittrailaction == "Update Credelec Info")){

        arrAudit[arrAudit.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

        }else{

          var jobcard_audittrailObject = {};
          // jobcard_audittrailObject._id = "";
          jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
          jobcard_audittrailObject.jobcard_audittrailaction = "Update Credelec Info";
          jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
          arrAudit.push(jobcard_audittrailObject);
        }

        jobcard.jobcard_audittrail = arrAudit;


            jobcards.findOneAndUpdate({_id:jobcard.jobcard_id, "jobcard_credelecinfo._id":jobcard.jobcard_credelecId},{$set:{data_ultimaactualizacaojobcard:new Date(),jobcard_audittrail:jobcard.jobcard_audittrail, "jobcard_credelecinfo.$.jobcard_currentkwh":jobcard.jobcard_currentkwh, "jobcard_credelecinfo.$.jobcard_kwhafter":jobcard.jobcard_kwhafter, "jobcard_credelecinfo.$.jobcard_amountadded":jobcard.jobcard_amountadded, "jobcard_credelecinfo.$.jobcard_transactionr":jobcard.jobcard_transactionr, "jobcard_credelecinfo.$.jobcard_credelecnr":jobcard.jobcard_credelecnr}}, function(err, data){
                if(err){
                    console.log("ocorreu um erro ao tentar aceder os dados")
                }
                else{
                    console.log("Update Credelec Info")
                    // res.redirect("/inicio");
                }
            });
        
    });

    
    router.post("/updatecredelecdetails",  upload.any(), async function(req, res){
        var userData= req.session.usuario;
        var jobcard = req.body;
        
        var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
        var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
        var ano = (new Date()).getFullYear();
        var todaydate = dia + "/" + mes + "/" + ano;
        var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

        var procurajobcard = await jobcards.findOne({_id:jobcard.jobcard_id}, {jobcard_audittrail:1}, function(err, data){
            if(err){
                console.log("ocorreu um erro ao tentar aceder os dados")
            }
            else{
                console.log("Find jobcard");
            }
        }).lean();

        var arrAudit = procurajobcard.jobcard_audittrail;
        // console.log(arrAudit)
        var lastaudittrail = arrAudit[arrAudit.length-1];

        if((lastaudittrail.jobcard_audittrailname == userData.nome) && (lastaudittrail.jobcard_audittrailaction == "Update Credelec Info")){

        arrAudit[arrAudit.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

        }else{

          var jobcard_audittrailObject = {};
          // jobcard_audittrailObject._id = "";
          jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
          jobcard_audittrailObject.jobcard_audittrailaction = "Update Credelec Info";
          jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
          arrAudit.push(jobcard_audittrailObject);
        }

        jobcard.jobcard_audittrail = arrAudit;


            jobcards.findOneAndUpdate({_id:jobcard.jobcard_id},{$set:{data_ultimaactualizacaojobcard:new Date(),jobcard_audittrail:jobcard.jobcard_audittrail}, $push:{jobcard_credelecinfo:{jobcard_currentkwh:jobcard.jobcard_currentkwh, jobcard_kwhafter:jobcard.jobcard_kwhafter, jobcard_amountadded:jobcard.jobcard_amountadded, jobcard_transactionr:jobcard.jobcard_transactionr, jobcard_credelecnr:jobcard.jobcard_credelecnr}}}, function(err, data){
                if(err){
                    console.log("ocorreu um erro ao tentar aceder os dados")
                }
                else{
                    console.log("Update Credelec Info")
                    res.redirect("/inicio");
                }
            });
        
    });


	router.post("/updateequipmentrepairsproject",  upload.any(), async function(req, res){
		var userData= req.session.usuario;
		var jobcard = req.body;
		// console.log(jobcard)
		

		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
        var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
        var ano = (new Date()).getFullYear();
        var todaydate = dia + "/" + mes + "/" + ano;
        var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

        var procuraproject = await jobcardprojects.findOne({_id:jobcard.jobcard_id}, {jobcard_audittrail:1}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find project");
			}
		}).lean();

        var arrAudit = procuraproject.jobcard_audittrail;
		console.log(arrAudit)
		var lastaudittrail = arrAudit[arrAudit.length-1];

		if((lastaudittrail.jobcard_audittrailname == userData.nome) && (lastaudittrail.jobcard_audittrailaction == "Update Equipment Repair")){

        arrAudit[arrAudit.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

	    }else{

	      var jobcard_audittrailObject = {};
	      // jobcard_audittrailObject._id = "";
	      jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
	      jobcard_audittrailObject.jobcard_audittrailaction = "Update Equipment Repair";
	      jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
	      arrAudit.push(jobcard_audittrailObject);
	    }

	    jobcard.jobcard_audittrail = arrAudit;


			jobcardprojects.findOneAndUpdate({_id:jobcard.jobcard_id},{$set:{data_ultimaactualizacaojobcard:new Date(),jobcard_audittrail:jobcard.jobcard_audittrail}, $push:{equipamentoArrayJobcard:{jobcard_equiptype:jobcard.jobcard_equiptype, jobcard_manufacturer:jobcard.jobcard_manufacturer, jobcard_model:jobcard.jobcard_model, jobcard_serialnumber:jobcard.jobcard_serialnumber, jobcard_capacity:jobcard.jobcard_capacity, jobcard_type:jobcard.jobcard_type}}}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
					console.log("Equipment Repair Update")
					res.redirect("/inicio");
				}
			});
		

	});

	

	router.post("/updateequipmentrepairs",  upload.any(), async function(req, res){
		var userData= req.session.usuario;
		var jobcard = req.body;
		// console.log(jobcard)
		

		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
        var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
        var ano = (new Date()).getFullYear();
        var todaydate = dia + "/" + mes + "/" + ano;
        var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

        var procurajobcard = await jobcards.findOne({_id:jobcard.jobcard_id}, {jobcard_audittrail:1}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find jobcard");
			}
		}).lean();

        var arrAudit = procurajobcard.jobcard_audittrail;
		// console.log(arrAudit)
		var lastaudittrail = arrAudit[arrAudit.length-1];

		if((lastaudittrail.jobcard_audittrailname == userData.nome) && (lastaudittrail.jobcard_audittrailaction == "Update Equipment Repair")){

        arrAudit[arrAudit.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

	    }else{

	      var jobcard_audittrailObject = {};
	      // jobcard_audittrailObject._id = "";
	      jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
	      jobcard_audittrailObject.jobcard_audittrailaction = "Update Equipment Repair";
	      jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
	      arrAudit.push(jobcard_audittrailObject);
	    }

	    jobcard.jobcard_audittrail = arrAudit;


			jobcards.findOneAndUpdate({_id:jobcard.jobcard_id},{$set:{data_ultimaactualizacaojobcard:new Date(),jobcard_audittrail:jobcard.jobcard_audittrail}, $push:{equipamentoArrayJobcard:{jobcard_equiptype:jobcard.jobcard_equiptype, jobcard_manufacturer:jobcard.jobcard_manufacturer, jobcard_model:jobcard.jobcard_model, jobcard_serialnumber:jobcard.jobcard_serialnumber, jobcard_capacity:jobcard.jobcard_capacity, jobcard_type:jobcard.jobcard_type}}}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
					console.log("Update Equipment Repair")
					res.redirect("/inicio");
				}
			});
		
	});

	router.post("/updateequipmentrepairsAlterar",  upload.any(), async function(req, res){
		var userData= req.session.usuario;
		var jobcard = req.body;
		// console.log(jobcard)
		

		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
        var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
        var ano = (new Date()).getFullYear();
        var todaydate = dia + "/" + mes + "/" + ano;
        var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

        var procurajobcard = await jobcards.findOne({_id:jobcard.jobcard_id}, {jobcard_audittrail:1}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find jobcard");
			}
		}).lean();

        var arrAudit = procurajobcard.jobcard_audittrail;
		// console.log(arrAudit)
		var lastaudittrail = arrAudit[arrAudit.length-1];

		if((lastaudittrail.jobcard_audittrailname == userData.nome) && (lastaudittrail.jobcard_audittrailaction == "Update Equipment Repair")){

        arrAudit[arrAudit.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

	    }else{

	      var jobcard_audittrailObject = {};
	      // jobcard_audittrailObject._id = "";
	      jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
	      jobcard_audittrailObject.jobcard_audittrailaction = "Update Equipment Repair";
	      jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
	      arrAudit.push(jobcard_audittrailObject);
	    }

	    jobcard.jobcard_audittrail = arrAudit;


			jobcards.findOneAndUpdate({_id:jobcard.jobcard_id, "equipamentoArrayJobcard._id":jobcard.jobcard_equipId},{$set:{data_ultimaactualizacaojobcard:new Date(),jobcard_audittrail:jobcard.jobcard_audittrail, "equipamentoArrayJobcard.$.jobcard_equiptype":jobcard.jobcard_equiptype, "equipamentoArrayJobcard.$.jobcard_manufacturer":jobcard.jobcard_manufacturer, "equipamentoArrayJobcard.$.jobcard_model":jobcard.jobcard_model, "equipamentoArrayJobcard.$.jobcard_serialnumber":jobcard.jobcard_serialnumber, "equipamentoArrayJobcard.$.jobcard_capacity":jobcard.jobcard_capacity, "equipamentoArrayJobcard.$.jobcard_type":jobcard.jobcard_type}}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
					console.log("Update Equipment Repair")
					
				}
			});
		
	});


	router.post("/updatesparesusedserializereplacesamespare",  uploadphotosparereplace.any(), async function(req, res){
		var userData= req.session.usuario;
		var jobcard = req.body;
		var op1 = parseInt(jobcard.jobcard_remaining);
		var op2 = parseInt(jobcard.jobcard_quantityhave);
		var op3 = parseInt(jobcard.jobcard_quantityuse);
		var datacontroladora = await new Date(jobcard.jobcard_datauso.split('/').reverse().join('-') + 'T23:59:00.000+00:01').toISOString();

		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
        var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
        var ano = (new Date()).getFullYear();
        var todaydate = dia + "/" + mes + "/" + ano;
        var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

		console.log(jobcard.jobcard_itemnrserie)
		var ns2 = jobcard.jobcard_itemnrserie;
		var nsr2 = jobcard.jobcard_nomeitemreplace;
		// console.log(req.files)
		
		if (req.files.length !=0) {
	        let comprimento = req.files.length;
	        for (let i = 0; i < comprimento; i++) {
	        	if (req.files[i].fieldname == "jobcard_itemphoto") {
	                jobcard.jobcard_itemphoto= "/Spare_Used_Photos/" + req.files[i].filename;
	            }
	            if (req.files[i].fieldname == "jobcard_itemreplacephoto") {
	                jobcard.jobcard_itemreplacephoto= "/Spare_Used_Photos/" + req.files[i].filename;
	                continue;
	            }
	        }
	    }

	    var procurajobcard = await jobcards.findOne({_id:jobcard.jobcard_id}, {jobcard_siteid:1, jobcard_site:1 ,jobcard_tecnicoid:1, sparesArrayJobcard:1, jobcard_tecniconome:1, jobcard_audittrail:1}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find jobcard");
			}
		}).lean();

		var posicaospareusedexistente = procurajobcard.sparesArrayJobcard.findIndex(x => x._id == jobcard.spareused_id);
		var sparesArrayJobcard = procurajobcard.sparesArrayJobcard;
		
		var ns1 = procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemnrserie;
		var nsr1 = procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_nomeitemreplace;

		if((procurajobcard.jobcard_audittrail[procurajobcard.jobcard_audittrail.length-1].jobcard_audittrailname == userData.nome) && (procurajobcard.jobcard_audittrail[procurajobcard.jobcard_audittrail.length-1].jobcard_audittrailaction == "Update Spares Used")){

        	procurajobcard.jobcard_audittrail[procurajobcard.jobcard_audittrail.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

	    }else{

	      var jobcard_audittrailObject = {};
	      
	      jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
	      jobcard_audittrailObject.jobcard_audittrailaction = "Update Spares Used";
	      jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
	      procurajobcard.jobcard_audittrail.push(jobcard_audittrailObject);
	    }

		var procurastockpessoal = await armazens.findOne({nome_ref:jobcard.jobcard_tecnicoid},{disponibilidade:1, disponibilidade_returned:1}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
				console.log(err)
			}
			else{
				console.log("Find armazem pessoal");
			}
		}).lean();

	    var posicaoitemstocknormal = procurastockpessoal.disponibilidade.findIndex(x => x.referencia == jobcard.jobcard_itemid);

		if(ns1 != ns2){
			
			console.log("entrou")
			
			var indexitem = procurastockpessoal.disponibilidade[posicaoitemstocknormal].num_serie.indexOf(jobcard.jobcard_itemnrserie);
			procurastockpessoal.disponibilidade[posicaoitemstocknormal].num_serie[indexitem] = procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemnrserie;
			procurastockpessoal.disponibilidade[posicaoitemstocknormal].data_received[indexitem] = datacontroladora;

		}

	    if(procurastockpessoal.disponibilidade_returned.length == 0){

	    	var stockpessoaldisponibilidadereturnedObject = {};
			stockpessoaldisponibilidadereturnedObject.description_item = procurastockpessoal.disponibilidade[posicaoitemstocknormal].description_item;
			stockpessoaldisponibilidadereturnedObject.disponivel = op3;
			stockpessoaldisponibilidadereturnedObject.referencia = procurastockpessoal.disponibilidade[posicaoitemstocknormal].referencia;
			stockpessoaldisponibilidadereturnedObject.serialized = procurastockpessoal.disponibilidade[posicaoitemstocknormal].serialized;
			stockpessoaldisponibilidadereturnedObject.num_serie = [];
			stockpessoaldisponibilidadereturnedObject.num_serie.push(jobcard.jobcard_itemreplace);
			stockpessoaldisponibilidadereturnedObject.cliente_name = procurastockpessoal.disponibilidade[posicaoitemstocknormal].cliente_name;
			stockpessoaldisponibilidadereturnedObject.data_received = [];
			stockpessoaldisponibilidadereturnedObject.data_received.push(datacontroladora);
			stockpessoaldisponibilidadereturnedObject.jobcard_itemreplacephoto = [];
			stockpessoaldisponibilidadereturnedObject.jobcard_itemreplacephoto.push(jobcard.jobcard_itemreplacephoto);
			stockpessoaldisponibilidadereturnedObject.category = procurastockpessoal.disponibilidade[posicaoitemstocknormal].category;
			procurastockpessoal.disponibilidade_returned.push(stockpessoaldisponibilidadereturnedObject);


	    }else{
	    	var posicaoitemstockreturned = procurastockpessoal.disponibilidade_returned.findIndex(x => x.referencia == jobcard.jobcard_itemid);
	    	
	    	if(posicaoitemstockreturned == -1){

	    		var stockpessoaldisponibilidadereturnedObject = {};
				stockpessoaldisponibilidadereturnedObject.description_item = procurastockpessoal.disponibilidade[posicaoitemstocknormal].description_item;
				stockpessoaldisponibilidadereturnedObject.disponivel = op3;
				stockpessoaldisponibilidadereturnedObject.referencia = procurastockpessoal.disponibilidade[posicaoitemstocknormal].referencia;
				stockpessoaldisponibilidadereturnedObject.serialized = procurastockpessoal.disponibilidade[posicaoitemstocknormal].serialized;
				stockpessoaldisponibilidadereturnedObject.num_serie = [];
				stockpessoaldisponibilidadereturnedObject.num_serie.push(jobcard.jobcard_itemreplace);
				stockpessoaldisponibilidadereturnedObject.cliente_name = procurastockpessoal.disponibilidade[posicaoitemstocknormal].cliente_name;
				stockpessoaldisponibilidadereturnedObject.data_received = [];
				stockpessoaldisponibilidadereturnedObject.data_received.push(datacontroladora);
				stockpessoaldisponibilidadereturnedObject.jobcard_itemreplacephoto = [];
				stockpessoaldisponibilidadereturnedObject.jobcard_itemreplacephoto.push(jobcard.jobcard_itemreplacephoto);
				stockpessoaldisponibilidadereturnedObject.category = procurastockpessoal.disponibilidade[posicaoitemstocknormal].category;
				procurastockpessoal.disponibilidade_returned.push(stockpessoaldisponibilidadereturnedObject);

	    	}else{

	    		if(nsr1 != nsr2){
	    			console.log("entrou")

	    			if(procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_nomeitemreplace == ""){
	    				procurastockpessoal.disponibilidade_returned[posicaoitemstockreturned].num_serie.push(jobcard.jobcard_nomeitemreplace);
	    				procurastockpessoal.disponibilidade_returned[posicaoitemstockreturned].data_received.push(datacontroladora);

	    			}else{

	    				var indexreturnitem = procurastockpessoal.disponibilidade_returned[posicaoitemstockreturned].num_serie.indexOf(procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_nomeitemreplace);
	    				procurastockpessoal.disponibilidade_returned[posicaoitemstockreturned].num_serie[indexreturnitem] = jobcard.jobcard_nomeitemreplace;
	    				procurastockpessoal.disponibilidade_returned[posicaoitemstockreturned].data_received[indexreturnitem] = datacontroladora;

	    			}

	    		}

	    	}
	    }


	    var procuraspareusedinfo = await spareusedinfos.findOne({_id:jobcard.spareusedinfo_id},{spareusedinfo_item:1, spareusedinfo_itemreturned:1}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
				console.log(err)
			}
			else{
				console.log("Find spare used info");
			}
		}).lean();

		var posicaodisponibilidade = procuraspareusedinfo.spareusedinfo_item.findIndex(x => x.referenciaitemid == jobcard.jobcard_itemid);


		if(ns1 != ns2){

			var indexitemspareinfo = procuraspareusedinfo.spareusedinfo_item[posicaodisponibilidade].num_serie.indexOf(procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemnrserie);
			procuraspareusedinfo.spareusedinfo_item[posicaodisponibilidade].num_serie[indexitemspareinfo] = jobcard.jobcard_itemnrserie;
			procuraspareusedinfo.spareusedinfo_item[posicaodisponibilidade].data_receivedmaint[indexitemspareinfo] = todaydate;
			procuraspareusedinfo.spareusedinfo_item[posicaodisponibilidade].spareusedphoto[indexitemspareinfo] = jobcard.jobcard_itemphoto;

		}

		if(procuraspareusedinfo.spareusedinfo_itemreturned.length == 0){

	    	var spareusedinfodisponibilidadereturnedObject = {};
			spareusedinfodisponibilidadereturnedObject.description_item = procuraspareusedinfo.spareusedinfo_item[posicaodisponibilidade].description_item;
			spareusedinfodisponibilidadereturnedObject.referenciaitemid = procuraspareusedinfo.spareusedinfo_item[posicaodisponibilidade].referenciaitemid;
			spareusedinfodisponibilidadereturnedObject.serialized = procuraspareusedinfo.spareusedinfo_item[posicaodisponibilidade].serialized;
			spareusedinfodisponibilidadereturnedObject.num_serie = [];
			spareusedinfodisponibilidadereturnedObject.num_serie.push(jobcard.jobcard_itemreplace);
			spareusedinfodisponibilidadereturnedObject.data_receivedmaint = [];
			spareusedinfodisponibilidadereturnedObject.data_receivedmaint.push(todaydate);
			spareusedinfodisponibilidadereturnedObject.spareusedphoto = [];
			spareusedinfodisponibilidadereturnedObject.spareusedphoto.push(jobcard.jobcard_itemreplacephoto);
			procuraspareusedinfo.spareusedinfo_itemreturned.push(spareusedinfodisponibilidadereturnedObject);

	    }else{

	    	var posicaodisponibilidadereturned = procuraspareusedinfo.spareusedinfo_itemreturned.findIndex(x => x.referenciaitemid == jobcard.jobcard_itemid);

	    	if(posicaodisponibilidadereturned == -1){

	    		var spareusedinfodisponibilidadereturnedObject = {};
				spareusedinfodisponibilidadereturnedObject.description_item = procuraspareusedinfo.spareusedinfo_item[posicaodisponibilidade].description_item;
				spareusedinfodisponibilidadereturnedObject.referenciaitemid = procuraspareusedinfo.spareusedinfo_item[posicaodisponibilidade].referenciaitemid;
				spareusedinfodisponibilidadereturnedObject.serialized = procuraspareusedinfo.spareusedinfo_item[posicaodisponibilidade].serialized;
				spareusedinfodisponibilidadereturnedObject.num_serie = [];
				spareusedinfodisponibilidadereturnedObject.num_serie.push(jobcard.jobcard_itemreplace);
				spareusedinfodisponibilidadereturnedObject.data_receivedmaint = [];
				spareusedinfodisponibilidadereturnedObject.data_receivedmaint.push(todaydate);
				spareusedinfodisponibilidadereturnedObject.spareusedphoto = [];
				spareusedinfodisponibilidadereturnedObject.spareusedphoto.push(jobcard.jobcard_itemreplacephoto);
				procuraspareusedinfo.spareusedinfo_itemreturned.push(spareusedinfodisponibilidadereturnedObject);

	    	}else{

	    		if(nsr1 != nsr2){


	    			if(procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_nomeitemreplace == ""){
	    				
	    				procuraspareusedinfo.spareusedinfo_itemreturned[posicaodisponibilidadereturned].num_serie.push(jobcard.jobcard_nomeitemreplace);
					 	procuraspareusedinfo.spareusedinfo_itemreturned[posicaodisponibilidadereturned].data_receivedmaint.push(todaydate);
					 	procuraspareusedinfo.spareusedinfo_itemreturned[posicaodisponibilidadereturned].spareusedphoto.push(jobcard.jobcard_itemreplacephoto);

	    			
	    			}else{

	    				var indexspareinforeturnitem = procuraspareusedinfo.spareusedinfo_itemreturned[posicaodisponibilidadereturned].num_serie.indexOf(procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_nomeitemreplace);
	    				procuraspareusedinfo.spareusedinfo_itemreturned[posicaodisponibilidadereturned].num_serie[indexspareinforeturnitem] = jobcard.jobcard_nomeitemreplace;
	    				procuraspareusedinfo.spareusedinfo_itemreturned[posicaodisponibilidadereturned].data_receivedmaint[indexspareinforeturnitem] = todaydate;
	    				procuraspareusedinfo.spareusedinfo_itemreturned[posicaodisponibilidadereturned].spareusedphoto[indexspareinforeturnitem] = jobcard.jobcard_itemreplacephoto;

	    			}

	    		}
	    	}
	    }

		armazens.updateOne({_id:procurastockpessoal._id},{$set:{disponibilidade:procurastockpessoal.disponibilidade, disponibilidade_returned:procurastockpessoal.disponibilidade_returned}}, function(err, datastockpessoal){
	    	if(err){
				console.log("ocorreu um erro ao tentar aceder os dados" + err);
			}else{
				console.log("Stock updated");

				jobcards.updateOne({_id:jobcard.jobcard_id, "sparesArrayJobcard._id":jobcard.spareused_id},{$set:{data_ultimaactualizacaojobcard:new Date(),jobcard_audittrail:procurajobcard.jobcard_audittrail, "sparesArrayJobcard.$.jobcard_itemphoto":jobcard.jobcard_itemphoto, "sparesArrayJobcard.$.jobcard_datauso":jobcard.jobcard_datauso, "sparesArrayJobcard.$.jobcard_itemnrserie":jobcard.jobcard_itemnrserie, "sparesArrayJobcard.$.jobcard_itemreplacereason":jobcard.jobcard_itemreplacereason, "sparesArrayJobcard.$.jobcard_nomeitemreplace":jobcard.jobcard_nomeitemreplace, "sparesArrayJobcard.$.jobcard_itemreplacephoto":jobcard.jobcard_itemreplacephoto}}, function(err, dataJobcard){
					if(err){
						console.log("ocorreu um erro ao tentar aceder os dados" + err);
					}else{
						console.log("Jobcard updated");

						spareusedinfos.updateOne({_id:jobcard.spareusedinfo_id},{$set:{spareusedinfo_item:procuraspareusedinfo.spareusedinfo_item, spareusedinfo_itemreturned:procuraspareusedinfo.spareusedinfo_itemreturned}}, function(err, datastockpessoal){
							if(err){
								console.log("ocorreu um erro ao tentar aceder os dados" + err);
							}else{
								console.log("Spare Used Info updated");

								if(ns1 != ns2){

									rastreiospare.updateOne({serial_number:procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemnrserie},{$push:{local_actual:procurajobcard.jobcard_tecniconome, datas_local_actual:new Date(), ref_local_actual:procurajobcard.jobcard_tecnicoid, meio_atribuicao:"Maintenance", atribuidores:userData.nome}}, function(err, datasrastreiospare){
										if(err){
											console.log("ocorreu um erro ao tentar aceder os dados" + err);
										}else{

											console.log("Rastreio updated")

											rastreiospare.updateOne({serial_number:jobcard.jobcard_itemnrserie},{$push:{local_actual:procurajobcard.jobcard_site, datas_local_actual:new Date(), ref_local_actual:procurajobcard.jobcard_siteid, meio_atribuicao:"Maintenance", atribuidores:userData.nome}}, function(err, datasrastreiospare){
												if(err){
													console.log("ocorreu um erro ao tentar aceder os dados" + err);
												}else{

													console.log("Rastreio updated");

													if(nsr1 != nsr2){

														rastreiospare.updateOne({serial_number:procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_nomeitemreplace},{$push:{local_actual:procurajobcard.jobcard_tecniconome, datas_local_actual:new Date(), ref_local_actual:procurajobcard.jobcard_tecnicoid, meio_atribuicao:"Maintenance", atribuidores:userData.nome}}, function(err, datasrastreiospare){
															if(err){
																console.log("ocorreu um erro ao tentar aceder os dados" + err);
															}else{

																console.log("Rastreio updated");

																rastreiospare.updateOne({serial_number:jobcard.jobcard_nomeitemreplace},{$push:{local_actual:procurajobcard.jobcard_site, datas_local_actual:new Date(), ref_local_actual:procurajobcard.jobcard_siteid, meio_atribuicao:"Maintenance", atribuidores:userData.nome}}, function(err, datasrastreiospare){
																	if(err){
																		console.log("ocorreu um erro ao tentar aceder os dados" + err);
																	}else{
																		console.log("Rastreio updated");
																	}
																});

															}
														});

													}

												}
											});

										}
									});
								}else{

									if(nsr1 != nsr2){

										rastreiospare.updateOne({serial_number:procuraspareusedinfo.spareusedinfo_itemreturned[posicaodisponibilidadereturned].jobcard_nomeitemreplace},{$push:{local_actual:procurajobcard.jobcard_tecniconome, datas_local_actual:new Date(), ref_local_actual:procurajobcard.jobcard_tecnicoid, meio_atribuicao:"Maintenance", atribuidores:userData.nome}}, function(err, datasrastreiospare){
											if(err){
												console.log("ocorreu um erro ao tentar aceder os dados" + err);
											}else{

												console.log("Rastreio updated");

												rastreiospare.updateOne({serial_number:jobcard.jobcard_nomeitemreplace},{$push:{local_actual:procurajobcard.jobcard_site, datas_local_actual:new Date(), ref_local_actual:procurajobcard.jobcard_siteid, meio_atribuicao:"Maintenance", atribuidores:userData.nome}}, function(err, datasrastreiospare){
													if(err){
														console.log("ocorreu um erro ao tentar aceder os dados" + err);
													}else{
														console.log("Rastreio updated");
													}
												});

											}
										});

									}
								}
							}
						});
					}

				});
			}

		});

	});

	
	router.post("/updatesparesusedserializeNotreplacesamespare",  uploadphotosparereplace.any(), async function(req, res){
		var userData= req.session.usuario;
		var jobcard = req.body;
		var op1 = parseInt(jobcard.jobcard_remaining);
		var op2 = parseInt(jobcard.jobcard_quantityhave);
		var op3 = parseInt(jobcard.jobcard_quantityuse);
		var datacontroladora = await new Date(jobcard.jobcard_datauso.split('/').reverse().join('-') + 'T23:59:00.000+00:01').toISOString();

		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
        var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
        var ano = (new Date()).getFullYear();
        var todaydate = dia + "/" + mes + "/" + ano;
        var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

		console.log(jobcard.jobcard_itemnrserie)
		var ns2 = jobcard.jobcard_itemnrserie;
		var nsr2 = jobcard.jobcard_nomeitemreplace;
		// console.log(req.files)
		
		if (req.files.length !=0) {
	        let comprimento = req.files.length;
	        for (let i = 0; i < comprimento; i++) {
	        	if (req.files[i].fieldname == "jobcard_itemphoto") {
	                jobcard.jobcard_itemphoto= "/Spare_Used_Photos/" + req.files[i].filename;
	            }
	            
	        }
	    }

	    var procurajobcard = await jobcards.findOne({_id:jobcard.jobcard_id}, {jobcard_siteid:1, jobcard_site:1 ,jobcard_tecnicoid:1, sparesArrayJobcard:1, jobcard_tecniconome:1, jobcard_audittrail:1}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find jobcard");
			}
		}).lean();

		var posicaospareusedexistente = procurajobcard.sparesArrayJobcard.findIndex(x => x._id == jobcard.spareused_id);
		
		var ns1 = procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemnrserie;
		var nsr1 = procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_nomeitemreplace;

		if((procurajobcard.jobcard_audittrail[procurajobcard.jobcard_audittrail.length-1].jobcard_audittrailname == userData.nome) && (procurajobcard.jobcard_audittrail[procurajobcard.jobcard_audittrail.length-1].jobcard_audittrailaction == "Update Spares Used")){

        	procurajobcard.jobcard_audittrail[procurajobcard.jobcard_audittrail.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

	    }else{

	      var jobcard_audittrailObject = {};
	      
	      jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
	      jobcard_audittrailObject.jobcard_audittrailaction = "Update Spares Used";
	      jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
	      procurajobcard.jobcard_audittrail.push(jobcard_audittrailObject);
	    }

	    var procurastockpessoal = await armazens.findOne({nome_ref:jobcard.jobcard_tecnicoid},{disponibilidade:1, disponibilidade_returned:1}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
				console.log(err)
			}
			else{
				console.log("Find armazem pessoal");
			}
		}).lean();

		var posicaoitemstocknormal = procurastockpessoal.disponibilidade.findIndex(x => x.referencia == jobcard.jobcard_itemid);

		if(ns1 != ns2){
			
			console.log("entrou")
			
			var indexitem = procurastockpessoal.disponibilidade[posicaoitemstocknormal].num_serie.indexOf(jobcard.jobcard_itemnrserie);
			procurastockpessoal.disponibilidade[posicaoitemstocknormal].num_serie[indexitem] = procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemnrserie;
			procurastockpessoal.disponibilidade[posicaoitemstocknormal].data_received[indexitem] = datacontroladora;

		}

		if(nsr1 != ""){

			var posicaoitemstockreturned = procurastockpessoal.disponibilidade_returned.findIndex(x => x.referencia == jobcard.jobcard_itemid);
			var indexreturnitem = procurastockpessoal.disponibilidade_returned[posicaoitemstockreturned].num_serie.indexOf(procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_nomeitemreplace);
			procurastockpessoal.disponibilidade_returned[posicaoitemstockreturned].num_serie.splice(indexreturnitem, 1);
			procurastockpessoal.disponibilidade_returned[posicaoitemstockreturned].data_received.splice(indexreturnitem, 1);
			procurastockpessoal.disponibilidade_returned[posicaoitemstockreturned].disponivel = procurastockpessoal.disponibilidade_returned[posicaoitemstockreturned].disponivel - 1;
		}


		var procuraspareusedinfo = await spareusedinfos.findOne({_id:jobcard.spareusedinfo_id},{spareusedinfo_item:1, spareusedinfo_itemreturned:1}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
				console.log(err)
			}
			else{
				console.log("Find spare used info");
			}
		}).lean();

		var posicaodisponibilidade = procuraspareusedinfo.spareusedinfo_item.findIndex(x => x.referenciaitemid == jobcard.jobcard_itemid);

		if(ns1 != ns2){

			var indexitemspareinfo = procuraspareusedinfo.spareusedinfo_item[posicaodisponibilidade].num_serie.indexOf(procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemnrserie);
			procuraspareusedinfo.spareusedinfo_item[posicaodisponibilidade].num_serie[indexitemspareinfo] = jobcard.jobcard_itemnrserie;
			procuraspareusedinfo.spareusedinfo_item[posicaodisponibilidade].data_receivedmaint[indexitemspareinfo] = todaydate;
			procuraspareusedinfo.spareusedinfo_item[posicaodisponibilidade].spareusedphoto[indexitemspareinfo] = jobcard.jobcard_itemphoto;

		}

		if(nsr1 != ""){

			procuraspareusedinfo.spareusedinfo_item[posicaodisponibilidade].num_serie.push(procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_nomeitemreplace);
			procuraspareusedinfo.spareusedinfo_item[posicaodisponibilidade].data_receivedmaint.push(todaydate);
			procuraspareusedinfo.spareusedinfo_item[posicaodisponibilidade].spareusedphoto.push(procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemreplacephoto);

			var posicaodisponibilidadereturned = procuraspareusedinfo.spareusedinfo_itemreturned.findIndex(x => x.referenciaitemid == jobcard.jobcard_itemid);
			var indexspareinforeturnitem = procuraspareusedinfo.spareusedinfo_itemreturned[posicaodisponibilidadereturned].num_serie.indexOf(procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_nomeitemreplace);
			procuraspareusedinfo.spareusedinfo_itemreturned[posicaodisponibilidadereturned].num_serie.splice(indexspareinforeturnitem, 1);
			procuraspareusedinfo.spareusedinfo_itemreturned[posicaodisponibilidadereturned].data_receivedmaint.splice(indexspareinforeturnitem, 1);
			procuraspareusedinfo.spareusedinfo_itemreturned[posicaodisponibilidadereturned].spareusedphoto.splice(indexspareinforeturnitem, 1);

		}

	    armazens.updateOne({_id:procurastockpessoal._id},{$set:{disponibilidade:procurastockpessoal.disponibilidade, disponibilidade_returned:procurastockpessoal.disponibilidade_returned}}, function(err, datastockpessoal){
	    	if(err){
				console.log("ocorreu um erro ao tentar aceder os dados" + err);
			}else{
				console.log("Stock updated");

				jobcards.updateOne({_id:jobcard.jobcard_id, "sparesArrayJobcard._id":jobcard.spareused_id},{$set:{data_ultimaactualizacaojobcard:new Date(),jobcard_audittrail:procurajobcard.jobcard_audittrail, "sparesArrayJobcard.$.jobcard_itemphoto":jobcard.jobcard_itemphoto, "sparesArrayJobcard.$.jobcard_datauso":jobcard.jobcard_datauso, "sparesArrayJobcard.$.jobcard_itemnrserie":jobcard.jobcard_itemnrserie, "sparesArrayJobcard.$.jobcard_itemreplace":jobcard.jobcard_itemreplace, "sparesArrayJobcard.$.jobcard_itemreplacereason":"", "sparesArrayJobcard.$.jobcard_nomeitemreplace":"", "sparesArrayJobcard.$.jobcard_itemreplacephoto":""}}, function(err, dataJobcard){
					if(err){
						console.log("ocorreu um erro ao tentar aceder os dados" + err);
					}else{
						console.log("Jobcard updated");

						spareusedinfos.updateOne({_id:jobcard.spareusedinfo_id},{$set:{spareusedinfo_item:procuraspareusedinfo.spareusedinfo_item, spareusedinfo_itemreturned:procuraspareusedinfo.spareusedinfo_itemreturned}}, function(err, datastockpessoal){
							if(err){
								console.log("ocorreu um erro ao tentar aceder os dados" + err);
							}else{
								console.log("Spare Used Info updated");

								if(ns1 != ns2){

									rastreiospare.updateOne({serial_number:procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemnrserie},{$push:{local_actual:procurajobcard.jobcard_tecniconome, datas_local_actual:new Date(), ref_local_actual:procurajobcard.jobcard_tecnicoid, meio_atribuicao:"Maintenance", atribuidores:userData.nome}}, function(err, datasrastreiospare){
										if(err){
											console.log("ocorreu um erro ao tentar aceder os dados" + err);
										}else{
											console.log("Rastreio updated");

											rastreiospare.updateOne({serial_number:jobcard.jobcard_itemnrserie},{$push:{local_actual:procurajobcard.jobcard_site, datas_local_actual:new Date(), ref_local_actual:procurajobcard.jobcard_siteid, meio_atribuicao:"Maintenance", atribuidores:userData.nome}}, function(err, datasrastreiospare){
												if(err){
													console.log("ocorreu um erro ao tentar aceder os dados" + err);
												}else{
													console.log("Rastreio updated");

													if(nsr1 != ""){

														rastreiospare.updateOne({serial_number:procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_nomeitemreplace},{$push:{local_actual:procurajobcard.jobcard_tecniconome, datas_local_actual:new Date(), ref_local_actual:procurajobcard.jobcard_tecnicoid, meio_atribuicao:"Maintenance", atribuidores:userData.nome}}, function(err, datasrastreiospare){
															if(err){
																console.log("ocorreu um erro ao tentar aceder os dados" + err);
															}else{
																console.log("Rastreio updated");
															}
														});

													}
												}
											});

										}
									});

								}else{

									if(nsr1 != ""){

										rastreiospare.updateOne({serial_number:procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_nomeitemreplace},{$push:{local_actual:procurajobcard.jobcard_tecniconome, datas_local_actual:new Date(), ref_local_actual:procurajobcard.jobcard_tecnicoid, meio_atribuicao:"Maintenance", atribuidores:userData.nome}}, function(err, datasrastreiospare){
											if(err){
												console.log("ocorreu um erro ao tentar aceder os dados" + err);
											}else{
												console.log("Rastreio updated");
											}
										});

									}
								}

							}
						});
					}
				});

			}
		});


	});


	router.post("/updatesparesusedNotreplacesamespare",  uploadphotosparereplace.any(), async function(req, res){

		var userData= req.session.usuario;
		var jobcard = req.body;
		var op1 = parseInt(jobcard.jobcard_remaining);
		var op2 = parseInt(jobcard.jobcard_quantityhave);
		var op3 = parseInt(jobcard.jobcard_quantityuse);
		

		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
        var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
        var ano = (new Date()).getFullYear();
        var todaydate = dia + "/" + mes + "/" + ano;
        var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

        if (req.files.length !=0) {
	        let comprimento = req.files.length;
	        for (let i = 0; i < comprimento; i++) {
	        	if (req.files[i].fieldname == "jobcard_itemphoto") {
	                jobcard.jobcard_itemphoto= "/Spare_Used_Photos/" + req.files[i].filename;
	            }
	        }
	    }

	    var procurajobcard = await jobcards.findOne({_id:jobcard.jobcard_id}, {jobcard_cod:1,jobcard_siteid:1, jobcard_site:1 ,jobcard_tecnicoid:1, sparesArrayJobcard:1, jobcard_tecniconome:1, jobcard_audittrail:1}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find jobcard");
			}
		}).lean();

		var posicaospareusedexistente = procurajobcard.sparesArrayJobcard.findIndex(x => x._id == jobcard.spareused_id);
		op1 = procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_quantityuse + op2 - op3;


		if((procurajobcard.jobcard_audittrail[procurajobcard.jobcard_audittrail.length-1].jobcard_audittrailname == userData.nome) && (procurajobcard.jobcard_audittrail[procurajobcard.jobcard_audittrail.length-1].jobcard_audittrailaction == "Update Spares Used")){

        	procurajobcard.jobcard_audittrail[procurajobcard.jobcard_audittrail.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

	    }else{

	      var jobcard_audittrailObject = {};
	      
	      jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
	      jobcard_audittrailObject.jobcard_audittrailaction = "Update Spares Used";
	      jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
	      procurajobcard.jobcard_audittrail.push(jobcard_audittrailObject);
	    }

	    var procurastockpessoal = await armazens.findOne({nome_ref:jobcard.jobcard_tecnicoid},{disponibilidade:1, disponibilidade_returned:1}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
				console.log(err)
			}
			else{
				console.log("Find armazem pessoal");
			}
		}).lean();

		armazens.updateOne({_id:procurastockpessoal._id, "disponibilidade.referencia":jobcard.jobcard_itemid},{$set:{"disponibilidade.$.disponivel":op1}}, function(err, datastockpessoal){
	    	if(err){
				console.log("ocorreu um erro ao tentar aceder os dados" + err);
			}else{
				console.log("Stock updated");

				jobcards.updateOne({_id:jobcard.jobcard_id, "sparesArrayJobcard._id":jobcard.spareused_id},{$set:{data_ultimaactualizacaojobcard:new Date(),jobcard_audittrail:procurajobcard.jobcard_audittrail, "sparesArrayJobcard.$.jobcard_quantityuse":op3, "sparesArrayJobcard.$.jobcard_itemphoto":jobcard.jobcard_itemphoto, "sparesArrayJobcard.$.jobcard_datauso":jobcard.jobcard_datauso}}, function(err, dataJobcard){
					if(err){
						console.log("ocorreu um erro ao tentar aceder os dados" + err);
					}else{
						console.log("Jobcard updated");

						stockhistory.updateOne({beneficiario_ref:procurajobcard.jobcard_siteid, ref_Item:jobcard.jobcard_itemid, numero:procurajobcard.jobcard_cod},{$set:{quantidade:op3}}, function(err, dataJobcard){
							if(err){
								console.log("ocorreu um erro ao tentar aceder os dados" + err);
							}else{
								console.log("Stock History updated");
							}
						});
					}
				});

			}

		});

	});


	router.post("/updatesparesusedserializereplacediffspare",  uploadphotosparereplace.any(), async function(req, res){

			var userData= req.session.usuario;
			var jobcard = req.body;
			var op1 = parseInt(jobcard.jobcard_remaining);
			var op2 = parseInt(jobcard.jobcard_quantityhave);
			var op3 = parseInt(jobcard.jobcard_quantityuse);
			var datacontroladora = await new Date(jobcard.jobcard_datauso.split('/').reverse().join('-') + 'T23:59:00.000+00:01').toISOString();

			var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
	        var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
	        var ano = (new Date()).getFullYear();
	        var todaydate = dia + "/" + mes + "/" + ano;
	        var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

			if (req.files.length !=0) {
		        let comprimento = req.files.length;
		        for (let i = 0; i < comprimento; i++) {
		        	if (req.files[i].fieldname == "jobcard_itemphoto") {
		                jobcard.jobcard_itemphoto= "/Spare_Used_Photos/" + req.files[i].filename;
		            }
		            if (req.files[i].fieldname == "jobcard_itemreplacephoto") {
		                jobcard.jobcard_itemreplacephoto= "/Spare_Used_Photos/" + req.files[i].filename;
		                continue;
		            }
		        }
		    }


		    var procurajobcard = await jobcards.findOne({_id:jobcard.jobcard_id}, {jobcard_cod:1,jobcard_siteid:1, jobcard_site:1 ,jobcard_tecnicoid:1, sparesArrayJobcard:1, jobcard_tecniconome:1, jobcard_audittrail:1, jobcard_clientenome:1}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
					console.log("Find jobcard");
				}
			}).lean();

			var posicaospareusedexistente = procurajobcard.sparesArrayJobcard.findIndex(x => x._id == jobcard.spareused_id);

			if((procurajobcard.jobcard_audittrail[procurajobcard.jobcard_audittrail.length-1].jobcard_audittrailname == userData.nome) && (procurajobcard.jobcard_audittrail[procurajobcard.jobcard_audittrail.length-1].jobcard_audittrailaction == "Update Spares Used")){

	        	procurajobcard.jobcard_audittrail[procurajobcard.jobcard_audittrail.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

		    }else{

		      var jobcard_audittrailObject = {};
		      
		      jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
		      jobcard_audittrailObject.jobcard_audittrailaction = "Update Spares Used";
		      jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
		      procurajobcard.jobcard_audittrail.push(jobcard_audittrailObject);
		    }

		    var procurastockpessoal = await armazens.findOne({nome_ref:jobcard.jobcard_tecnicoid},{disponibilidade:1, disponibilidade_returned:1}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
					console.log(err)
				}
				else{
					console.log("Find armazem pessoal");
				}
			}).lean();

			var posicaoitemtrocado = procurastockpessoal.disponibilidade.findIndex(x => x.referencia == procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemid);
			var posicaoitemnovo = procurastockpessoal.disponibilidade.findIndex(x => x.referencia == jobcard.jobcard_itemid);
			jobcard.jobcard_item = procurastockpessoal.disponibilidade[posicaoitemnovo].description_item;

			var posicaoitemreturntrocado = procurastockpessoal.disponibilidade_returned.findIndex(x => x.referencia == procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemid);
			

			if((procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemserialized == "sim") && (procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemnrserie != "")){

				procurastockpessoal.disponibilidade[posicaoitemtrocado].num_serie.push(procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemnrserie);
				procurastockpessoal.disponibilidade[posicaoitemtrocado].data_received.push(datacontroladora);
				procurastockpessoal.disponibilidade[posicaoitemtrocado].disponivel = procurastockpessoal.disponibilidade[posicaoitemtrocado].disponivel + 1;

			}else{

				procurastockpessoal.disponibilidade[posicaoitemtrocado].disponivel = procurastockpessoal.disponibilidade[posicaoitemtrocado].disponivel + procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_quantityuse;

			}

			var indexnrserienovo = procurastockpessoal.disponibilidade[posicaoitemnovo].num_serie.indexOf(jobcard.jobcard_itemnrserie);
			procurastockpessoal.disponibilidade[posicaoitemnovo].num_serie.splice(indexnrserienovo, 1);
			procurastockpessoal.disponibilidade[posicaoitemnovo].data_received.splice(indexnrserienovo, 1);
			procurastockpessoal.disponibilidade[posicaoitemnovo].disponivel = procurastockpessoal.disponibilidade[posicaoitemnovo].disponivel - 1;

			if(procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemreplace == "Sim"){

				var indexnrseriereturntrocado = procurastockpessoal.disponibilidade_returned[posicaoitemreturntrocado].num_serie.indexOf(procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_nomeitemreplace);
				procurastockpessoal.disponibilidade_returned[posicaoitemreturntrocado].num_serie.splice(indexnrseriereturntrocado, 1);
				procurastockpessoal.disponibilidade_returned[posicaoitemreturntrocado].data_received.splice(indexnrseriereturntrocado, 1);

			}

			if(procurastockpessoal.disponibilidade_returned.length == 0){

				var stockpessoaldisponibilidadereturnedObject = {};
				stockpessoaldisponibilidadereturnedObject.description_item = procurastockpessoal.disponibilidade[posicaoitemnovo].description_item;
				stockpessoaldisponibilidadereturnedObject.disponivel = op3;
				stockpessoaldisponibilidadereturnedObject.referencia = procurastockpessoal.disponibilidade[posicaoitemnovo].referencia;
				stockpessoaldisponibilidadereturnedObject.serialized = procurastockpessoal.disponibilidade[posicaoitemnovo].serialized;
				stockpessoaldisponibilidadereturnedObject.num_serie = [];
				stockpessoaldisponibilidadereturnedObject.num_serie.push(jobcard.jobcard_itemreplace);
				stockpessoaldisponibilidadereturnedObject.cliente_name = procurastockpessoal.disponibilidade[posicaoitemnovo].cliente_name;
				stockpessoaldisponibilidadereturnedObject.data_received = [];
				stockpessoaldisponibilidadereturnedObject.data_received.push(datacontroladora);
				stockpessoaldisponibilidadereturnedObject.jobcard_itemreplacephoto = [];
				stockpessoaldisponibilidadereturnedObject.jobcard_itemreplacephoto.push(jobcard.jobcard_itemreplacephoto);
				stockpessoaldisponibilidadereturnedObject.category = procurastockpessoal.disponibilidade[posicaoitemnovo].category;
				procurastockpessoal.disponibilidade_returned.push(stockpessoaldisponibilidadereturnedObject);
			
			}else{

				var posicaoitemreturnnovo = procurastockpessoal.disponibilidade_returned.findIndex(x => x.referencia == jobcard.jobcard_itemid);

				if(posicaoitemreturnnovo == -1){

					var stockpessoaldisponibilidadereturnedObject = {};
					stockpessoaldisponibilidadereturnedObject.description_item = procurastockpessoal.disponibilidade[posicaoitemnovo].description_item;
					stockpessoaldisponibilidadereturnedObject.disponivel = op3;
					stockpessoaldisponibilidadereturnedObject.referencia = procurastockpessoal.disponibilidade[posicaoitemnovo].referencia;
					stockpessoaldisponibilidadereturnedObject.serialized = procurastockpessoal.disponibilidade[posicaoitemnovo].serialized;
					stockpessoaldisponibilidadereturnedObject.num_serie = [];
					stockpessoaldisponibilidadereturnedObject.num_serie.push(jobcard.jobcard_nomeitemreplace);
					stockpessoaldisponibilidadereturnedObject.cliente_name = procurastockpessoal.disponibilidade[posicaoitemnovo].cliente_name;
					stockpessoaldisponibilidadereturnedObject.data_received = [];
					stockpessoaldisponibilidadereturnedObject.data_received.push(datacontroladora);
					stockpessoaldisponibilidadereturnedObject.jobcard_itemreplacephoto = [];
					stockpessoaldisponibilidadereturnedObject.jobcard_itemreplacephoto.push(jobcard.jobcard_itemreplacephoto);
					stockpessoaldisponibilidadereturnedObject.category = procurastockpessoal.disponibilidade[posicaoitemnovo].category;
					procurastockpessoal.disponibilidade_returned.push(stockpessoaldisponibilidadereturnedObject);

				}else{

					procurastockpessoal.disponibilidade_returned[posicaoitemreturnnovo].num_serie.push(jobcard.jobcard_nomeitemreplace);
	    			procurastockpessoal.disponibilidade_returned[posicaoitemreturnnovo].data_received.push(datacontroladora);

				}

			}


			var procuraspareusedinfo = await spareusedinfos.find({spareusedinfo_siteid:procurajobcard.jobcard_siteid},{spareusedinfo_item:1, spareusedinfo_itemreturned:1}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
					console.log(err)
				}
				else{
					console.log("Find spare used info");
				}
			}).lean();

			if(procuraspareusedinfo.length != 0){

				var posicaoitemspareinfotrocado = procuraspareusedinfo[0].spareusedinfo_item.findIndex(x => x.referenciaitemid == procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemid);
				var posicaoitemspareinfonovo = procuraspareusedinfo[0].spareusedinfo_item.findIndex(x => x.referenciaitemid == jobcard.jobcard_itemid);

				if(posicaoitemspareinfotrocado != -1){

					var indexnrserietrocado = procuraspareusedinfo[0].spareusedinfo_item[posicaoitemspareinfotrocado].num_serie.indexOf(procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemnrserie);
					procuraspareusedinfo[0].spareusedinfo_item[posicaoitemspareinfotrocado].num_serie.splice(indexnrserietrocado, 1);
					procuraspareusedinfo[0].spareusedinfo_item[posicaoitemspareinfotrocado].data_receivedmaint.splice(indexnrserietrocado, 1);
					procuraspareusedinfo[0].spareusedinfo_item[posicaoitemspareinfotrocado].spareusedphoto.splice(indexnrserietrocado, 1);

				}

				if(posicaoitemspareinfonovo == -1){

					var spareusedinfo_itemObject = {};
					spareusedinfo_itemObject.description_item = procurastockpessoal.disponibilidade[posicaoitemnovo].description_item;
					spareusedinfo_itemObject.referenciaitemid = jobcard.jobcard_itemid;
					spareusedinfo_itemObject.serialized = "sim";
					spareusedinfo_itemObject.num_serie = [];
					spareusedinfo_itemObject.num_serie.push(jobcard.jobcard_itemnrserie);
					spareusedinfo_itemObject.data_receivedmaint = [];
					spareusedinfo_itemObject.data_receivedmaint.push(todaydate);
					spareusedinfo_itemObject.spareusedphoto = [];
					spareusedinfo_itemObject.spareusedphoto.push(jobcard.jobcard_itemphoto);
					procuraspareusedinfo[0].spareusedinfo_item.push(spareusedinfo_itemObject);

					
				}else{

					procuraspareusedinfo[0].spareusedinfo_item[posicaoitemspareinfonovo].num_serie.push(jobcard.jobcard_itemnrserie);
					procuraspareusedinfo[0].spareusedinfo_item[posicaoitemspareinfonovo].data_receivedmaint.push(todaydate);
					procuraspareusedinfo[0].spareusedinfo_item[posicaoitemspareinfonovo].spareusedphoto.push(jobcard.jobcard_itemphoto);

				}

				var posicaoitemreplacespareinfotrocado = procuraspareusedinfo[0].spareusedinfo_itemreturned.findIndex(x => x.referenciaitemid == procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemid);
				var posicaoitemreplacespareinfonovo = procuraspareusedinfo[0].spareusedinfo_itemreturned.findIndex(x => x.referenciaitemid == jobcard.jobcard_itemid);

				if((procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_nomeitemreplace != "") && (posicaoitemreplacespareinfotrocado != -1)){

					var indexnrseriereplacetrocado = procuraspareusedinfo[0].spareusedinfo_itemreturned[posicaoitemreplacespareinfotrocado].num_serie.indexOf(procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_nomeitemreplace);
					procuraspareusedinfo[0].spareusedinfo_itemreturned[posicaoitemreplacespareinfotrocado].num_serie.splice(indexnrseriereplacetrocado, 1);
					procuraspareusedinfo[0].spareusedinfo_itemreturned[posicaoitemreplacespareinfotrocado].data_receivedmaint.splice(indexnrseriereplacetrocado, 1);
					procuraspareusedinfo[0].spareusedinfo_itemreturned[posicaoitemreplacespareinfotrocado].spareusedphoto.splice(indexnrseriereplacetrocado, 1);
				}

				if(posicaoitemreplacespareinfonovo == -1){

					var spareusedinfo_itemreturnedObject = {};

					spareusedinfo_itemreturnedObject.description_item = procurastockpessoal.disponibilidade[posicaoitemnovo].description_item;
					spareusedinfo_itemreturnedObject.referenciaitemid = jobcard.jobcard_itemid;
					spareusedinfo_itemreturnedObject.serialized = "sim";
					spareusedinfo_itemreturnedObject.num_serie = [];
					spareusedinfo_itemreturnedObject.num_serie.push(jobcard.jobcard_nomeitemreplace);
					spareusedinfo_itemreturnedObject.data_receivedmaint = [];
					spareusedinfo_itemreturnedObject.data_receivedmaint.push(jobcard.jobcard_datauso);
					spareusedinfo_itemreturnedObject.spareusedphoto = [];
					spareusedinfo_itemreturnedObject.spareusedphoto.push(jobcard.jobcard_itemreplacephoto);
					procuraspareusedinfo[0].spareusedinfo_itemreturned.push(spareusedinfo_itemreturnedObject);

				}else{

					procuraspareusedinfo[0].spareusedinfo_itemreturned[posicaoitemreplacespareinfonovo].num_serie.push(jobcard.jobcard_nomeitemreplace);
					procuraspareusedinfo[0].spareusedinfo_itemreturned[posicaoitemreplacespareinfonovo].data_receivedmaint.push(jobcard.jobcard_datauso);
					procuraspareusedinfo[0].spareusedinfo_itemreturned[posicaoitemreplacespareinfonovo].spareusedphoto.push(jobcard.jobcard_itemreplacephoto);
				}

			}else{

				var spareused_infoObject = {};

				spareused_infoObject.spareusedinfo_client = procurajobcard.jobcard_clientenome;
				spareused_infoObject.spareusedinfo_site = procurajobcard.jobcard_site;
				spareused_infoObject.spareusedinfo_siteid = procurajobcard.jobcard_siteid;
				spareused_infoObject.spareusedinfo_item = [];
				spareused_infoObject.spareusedinfo_itemreturned = [];

				var spareusedinfo_itemObject = {};
				spareusedinfo_itemObject.description_item = procurastockpessoal.disponibilidade[posicaoitemnovo].description_item;
				spareusedinfo_itemObject.referenciaitemid = jobcard.jobcard_itemid;
				spareusedinfo_itemObject.serialized = "sim";
				spareusedinfo_itemObject.num_serie = [];
				spareusedinfo_itemObject.num_serie.push(jobcard.jobcard_itemnrserie);
				spareusedinfo_itemObject.data_receivedmaint = [];
				spareusedinfo_itemObject.data_receivedmaint.push(todaydate);
				spareusedinfo_itemObject.spareusedphoto = [];
				spareusedinfo_itemObject.spareusedphoto.push(jobcard.jobcard_itemphoto);
				spareused_infoObject.spareusedinfo_item.push(spareusedinfo_itemObject);

				var spareusedinfo_itemreturnedObject = {};
				spareusedinfo_itemreturnedObject.description_item = procurastockpessoal.disponibilidade[posicaoitemnovo].description_item;
				spareusedinfo_itemreturnedObject.referenciaitemid = jobcard.jobcard_itemid;
				spareusedinfo_itemreturnedObject.serialized = "sim";
				spareusedinfo_itemreturnedObject.num_serie = [];
				spareusedinfo_itemreturnedObject.num_serie.push(jobcard.jobcard_nomeitemreplace);
				spareusedinfo_itemreturnedObject.data_receivedmaint = [];
				spareusedinfo_itemreturnedObject.data_receivedmaint.push(jobcard.jobcard_datauso);
				spareusedinfo_itemreturnedObject.spareusedphoto = [];
				spareusedinfo_itemreturnedObject.spareusedphoto.push(jobcard.jobcard_itemreplacephoto);
				spareused_infoObject.spareusedinfo_itemreturned.push(spareusedinfo_itemreturnedObject);

			}

			var stockhist1 = {};
		    stockhist1.beneficiario = procurajobcard.jobcard_tecniconome;
		    stockhist1.beneficiario_ref = procurajobcard.jobcard_tecnicoid;
		    stockhist1.request_from = procurajobcard.jobcard_site;
		    stockhist1.request_from_ref = procurajobcard.jobcard_siteid;
		    stockhist1.quantidade = procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_quantityuse;
		    stockhist1.nome_item = procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_item;
		    stockhist1.ref_Item = procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemid;
		    stockhist1.numero = procurajobcard.jobcard_cod;
		    stockhist1.serialized = procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemserialized;;
			

			var procurastockhistory = await stockhistory.find({beneficiario_ref:procurajobcard.jobcard_siteid, ref_Item:jobcard.jobcard_itemid, numero:procurajobcard.jobcard_cod},{quantidade:1}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
					console.log(err)
				}
				else{
					console.log("Find spare used info");
				}
			}).lean();


			if(procurastockhistory.length != 0){
				procurastockhistory[0].quantidade = parseInt(procurastockhistory[0].quantidade) + 1;
			}else{

				var stockhist2 = {};
			    stockhist2.beneficiario = procurajobcard.jobcard_site;
			    stockhist2.beneficiario_ref = procurajobcard.jobcard_siteid;
			    stockhist2.request_from = procurajobcard.jobcard_tecniconome;
			    stockhist2.request_from_ref = procurajobcard.jobcard_tecnicoid;
			    stockhist2.quantidade = op3;
			    stockhist2.nome_item = procurastockpessoal.disponibilidade[posicaoitemnovo].description_item;
			    stockhist2.ref_Item = jobcard.jobcard_itemid;
			    stockhist2.numero = procurajobcard.jobcard_cod;
			    stockhist2.serialized = "sim";
			}


			armazens.updateOne({_id:procurastockpessoal._id},{$set:{disponibilidade:procurastockpessoal.disponibilidade, disponibilidade_returned:procurastockpessoal.disponibilidade_returned}}, function(err, datastockpessoal){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados" + err);
				}else{
					console.log("Personal Stock updated");

					jobcards.updateOne({_id:jobcard.jobcard_id, "sparesArrayJobcard._id":jobcard.spareused_id},{$set:{data_ultimaactualizacaojobcard:new Date(),jobcard_audittrail:procurajobcard.jobcard_audittrail, "sparesArrayJobcard.$.jobcard_itemid":jobcard.jobcard_itemid, "sparesArrayJobcard.$.jobcard_item":procurastockpessoal.disponibilidade[posicaoitemnovo].description_item, "sparesArrayJobcard.$.jobcard_quantityuse":op3, "sparesArrayJobcard.$.jobcard_itemphoto":jobcard.jobcard_itemphoto, "sparesArrayJobcard.$.jobcard_datauso":jobcard.jobcard_datauso, "sparesArrayJobcard.$.jobcard_itemserialized":"sim", "sparesArrayJobcard.$.jobcard_itemnrserie":jobcard.jobcard_itemnrserie, "sparesArrayJobcard.$.jobcard_itemreplace":jobcard.jobcard_itemreplace, "sparesArrayJobcard.$.jobcard_itemreplacereason":jobcard.jobcard_itemreplacereason, "sparesArrayJobcard.$.jobcard_nomeitemreplace":jobcard.jobcard_nomeitemreplace, "sparesArrayJobcard.$.jobcard_itemreplacephoto":jobcard.jobcard_itemreplacephoto, "sparesArrayJobcard.$.jobcard_itemowner":jobcard.jobcard_itemowner}}, function(err, dataJobcard){
						if(err){
							console.log("ocorreu um erro ao tentar aceder os dados" + err);
						}else{
							console.log("Jobcard updated");

							stockhistory.gravar_historico(stockhist1, function(err){
								if(err){
									console.log("ocorreu um erro ao tentar aceder os dados" + err);
								}else{

									if(procurastockhistory.length != 0){

										stockhistory.updateOne({_id:procurastockhistory[0]._id},{$set:{quantidade:procurastockhistory[0].quantidade}}, function(err, datastockhistory){
											if(err){
												console.log("ocorreu um erro ao tentar aceder os dados" + err);
											}else{
												console.log("Stock History updated");

												if(procuraspareusedinfo.length == 0){

													spareusedinfos.gravarDados(spareused_infoObject, function(err){
														if(err){
															console.log("ocorreu um erro ao tentar aceder os dados" + err);
														}else{
															console.log("SpareUsed Info updated");

															rastreiospare.updateOne({serial_number:procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemnrserie},{$push:{local_actual:procurajobcard.jobcard_tecniconome, datas_local_actual:new Date(), ref_local_actual:procurajobcard.jobcard_tecnicoid, meio_atribuicao:"Maintenance", atribuidores:userData.nome}}, function(err, datasrastreiospare){
																if(err){
																	console.log("ocorreu um erro ao tentar aceder os dados" + err);
																}else{
																	console.log("Rastreio updated");

																	rastreiospare.updateOne({serial_number:jobcard.jobcard_itemnrserie},{$push:{local_actual:procurajobcard.jobcard_site, datas_local_actual:new Date(), ref_local_actual:procurajobcard.jobcard_siteid, meio_atribuicao:"Maintenance", atribuidores:userData.nome}}, function(err, datasrastreiospare){
																		if(err){
																			console.log("ocorreu um erro ao tentar aceder os dados" + err);
																		}else{
																			console.log("Rastreio updated");

																			rastreiospare.updateOne({serial_number:procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_nomeitemreplace},{$push:{local_actual:procurajobcard.jobcard_tecniconome, datas_local_actual:new Date(), ref_local_actual:procurajobcard.jobcard_tecnicoid, meio_atribuicao:"Maintenance", atribuidores:userData.nome}}, function(err, datasrastreiospare){
																				if(err){
																					console.log("ocorreu um erro ao tentar aceder os dados" + err);
																				}else{
																					console.log("Rastreio updated");

																					rastreiospare.updateOne({serial_number:jobcard.jobcard_nomeitemreplace},{$push:{local_actual:procurajobcard.jobcard_tecniconome, datas_local_actual:new Date(), ref_local_actual:procurajobcard.jobcard_tecnicoid, meio_atribuicao:"Maintenance", atribuidores:userData.nome}}, function(err, datasrastreiospare){
																						if(err){
																							console.log("ocorreu um erro ao tentar aceder os dados" + err);
																						}else{
																							console.log("Rastreio updated");
																						}
																					});
																				}
																			});
																		}
																	});
																}
															});

														}
													});

												}else{

													spareusedinfos.updateOne({_id:jobcard.spareusedinfo_id},{$set:{spareusedinfo_item:procuraspareusedinfo[0].spareusedinfo_item, spareusedinfo_itemreturned:procuraspareusedinfo[0].spareusedinfo_itemreturned}}, function(err, datastockhistory){
														if(err){
															console.log("ocorreu um erro ao tentar aceder os dados" + err);
														}else{
															console.log("SpareUsed Info updated");

															rastreiospare.updateOne({serial_number:procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemnrserie},{$push:{local_actual:procurajobcard.jobcard_tecniconome, datas_local_actual:new Date(), ref_local_actual:procurajobcard.jobcard_tecnicoid, meio_atribuicao:"Maintenance", atribuidores:userData.nome}}, function(err, datasrastreiospare){
																if(err){
																	console.log("ocorreu um erro ao tentar aceder os dados" + err);
																}else{
																	console.log("Rastreio updated");

																	rastreiospare.updateOne({serial_number:jobcard.jobcard_itemnrserie},{$push:{local_actual:procurajobcard.jobcard_site, datas_local_actual:new Date(), ref_local_actual:procurajobcard.jobcard_siteid, meio_atribuicao:"Maintenance", atribuidores:userData.nome}}, function(err, datasrastreiospare){
																		if(err){
																			console.log("ocorreu um erro ao tentar aceder os dados" + err);
																		}else{
																			console.log("Rastreio updated");

																			rastreiospare.updateOne({serial_number:procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_nomeitemreplace},{$push:{local_actual:procurajobcard.jobcard_tecniconome, datas_local_actual:new Date(), ref_local_actual:procurajobcard.jobcard_tecnicoid, meio_atribuicao:"Maintenance", atribuidores:userData.nome}}, function(err, datasrastreiospare){
																				if(err){
																					console.log("ocorreu um erro ao tentar aceder os dados" + err);
																				}else{
																					console.log("Rastreio updated");

																					rastreiospare.updateOne({serial_number:jobcard.jobcard_nomeitemreplace},{$push:{local_actual:procurajobcard.jobcard_tecniconome, datas_local_actual:new Date(), ref_local_actual:procurajobcard.jobcard_tecnicoid, meio_atribuicao:"Maintenance", atribuidores:userData.nome}}, function(err, datasrastreiospare){
																						if(err){
																							console.log("ocorreu um erro ao tentar aceder os dados" + err);
																						}else{
																							console.log("Rastreio updated");
																						}
																					});
																				}
																			});
																		}
																	});
																}
															});
														}
													});

												}
											}
										});

									}else{

										stockhistory.gravar_historico(stockhist2, function(err){
											if(err){
												console.log("ocorreu um erro ao tentar aceder os dados" + err);
											}else{
												console.log("Stock History updated");

												if(procuraspareusedinfo.length == 0){

													spareusedinfos.gravarDados(spareused_infoObject, function(err){
														if(err){
															console.log("ocorreu um erro ao tentar aceder os dados" + err);
														}else{
															console.log("SpareUsed Info updated");

															rastreiospare.updateOne({serial_number:procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemnrserie},{$push:{local_actual:procurajobcard.jobcard_tecniconome, datas_local_actual:new Date(), ref_local_actual:procurajobcard.jobcard_tecnicoid, meio_atribuicao:"Maintenance", atribuidores:userData.nome}}, function(err, datasrastreiospare){
																if(err){
																	console.log("ocorreu um erro ao tentar aceder os dados" + err);
																}else{
																	console.log("Rastreio updated");

																	rastreiospare.updateOne({serial_number:jobcard.jobcard_itemnrserie},{$push:{local_actual:procurajobcard.jobcard_site, datas_local_actual:new Date(), ref_local_actual:procurajobcard.jobcard_siteid, meio_atribuicao:"Maintenance", atribuidores:userData.nome}}, function(err, datasrastreiospare){
																		if(err){
																			console.log("ocorreu um erro ao tentar aceder os dados" + err);
																		}else{
																			console.log("Rastreio updated");

																			rastreiospare.updateOne({serial_number:procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_nomeitemreplace},{$push:{local_actual:procurajobcard.jobcard_tecniconome, datas_local_actual:new Date(), ref_local_actual:procurajobcard.jobcard_tecnicoid, meio_atribuicao:"Maintenance", atribuidores:userData.nome}}, function(err, datasrastreiospare){
																				if(err){
																					console.log("ocorreu um erro ao tentar aceder os dados" + err);
																				}else{
																					console.log("Rastreio updated");

																					rastreiospare.updateOne({serial_number:jobcard.jobcard_nomeitemreplace},{$push:{local_actual:procurajobcard.jobcard_tecniconome, datas_local_actual:new Date(), ref_local_actual:procurajobcard.jobcard_tecnicoid, meio_atribuicao:"Maintenance", atribuidores:userData.nome}}, function(err, datasrastreiospare){
																						if(err){
																							console.log("ocorreu um erro ao tentar aceder os dados" + err);
																						}else{
																							console.log("Rastreio updated");
																						}
																					});
																				}
																			});
																		}
																	});
																}
															});
														}
													});

												}else{

													spareusedinfos.updateOne({_id:jobcard.spareusedinfo_id},{$set:{spareusedinfo_item:procuraspareusedinfo[0].spareusedinfo_item, spareusedinfo_itemreturned:procuraspareusedinfo[0].spareusedinfo_itemreturned}}, function(err, datastockhistory){
														if(err){
															console.log("ocorreu um erro ao tentar aceder os dados" + err);
														}else{
															console.log("SpareUsed Info updated");

															rastreiospare.updateOne({serial_number:procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemnrserie},{$push:{local_actual:procurajobcard.jobcard_tecniconome, datas_local_actual:new Date(), ref_local_actual:procurajobcard.jobcard_tecnicoid, meio_atribuicao:"Maintenance", atribuidores:userData.nome}}, function(err, datasrastreiospare){
																if(err){
																	console.log("ocorreu um erro ao tentar aceder os dados" + err);
																}else{
																	console.log("Rastreio updated");

																	rastreiospare.updateOne({serial_number:jobcard.jobcard_itemnrserie},{$push:{local_actual:procurajobcard.jobcard_site, datas_local_actual:new Date(), ref_local_actual:procurajobcard.jobcard_siteid, meio_atribuicao:"Maintenance", atribuidores:userData.nome}}, function(err, datasrastreiospare){
																		if(err){
																			console.log("ocorreu um erro ao tentar aceder os dados" + err);
																		}else{
																			console.log("Rastreio updated");

																			rastreiospare.updateOne({serial_number:procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_nomeitemreplace},{$push:{local_actual:procurajobcard.jobcard_tecniconome, datas_local_actual:new Date(), ref_local_actual:procurajobcard.jobcard_tecnicoid, meio_atribuicao:"Maintenance", atribuidores:userData.nome}}, function(err, datasrastreiospare){
																				if(err){
																					console.log("ocorreu um erro ao tentar aceder os dados" + err);
																				}else{
																					console.log("Rastreio updated");

																					rastreiospare.updateOne({serial_number:jobcard.jobcard_nomeitemreplace},{$push:{local_actual:procurajobcard.jobcard_tecniconome, datas_local_actual:new Date(), ref_local_actual:procurajobcard.jobcard_tecnicoid, meio_atribuicao:"Maintenance", atribuidores:userData.nome}}, function(err, datasrastreiospare){
																						if(err){
																							console.log("ocorreu um erro ao tentar aceder os dados" + err);
																						}else{
																							console.log("Rastreio updated");
																						}
																					});
																				}
																			});
																		}
																	});
																}
															});
														}
													});

												}
											}
										});

									}
								}
							});
						}
					});
				}
			});

	});


	router.post("/updatesparesusedserializeNotreplacediffspare",  uploadphotosparereplace.any(), async function(req, res){
			var userData= req.session.usuario;
			var jobcard = req.body;
			var op1 = parseInt(jobcard.jobcard_remaining);
			var op2 = parseInt(jobcard.jobcard_quantityhave);
			var op3 = parseInt(jobcard.jobcard_quantityuse);
			var datacontroladora = await new Date(jobcard.jobcard_datauso.split('/').reverse().join('-') + 'T23:59:00.000+00:01').toISOString();

			var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
	        var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
	        var ano = (new Date()).getFullYear();
	        var todaydate = dia + "/" + mes + "/" + ano;
	        var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

			if (req.files.length !=0) {
		        let comprimento = req.files.length;
		        for (let i = 0; i < comprimento; i++) {
		        	if (req.files[i].fieldname == "jobcard_itemphoto") {
		                jobcard.jobcard_itemphoto= "/Spare_Used_Photos/" + req.files[i].filename;
		            }
		        }
		    }

		    var procurajobcard = await jobcards.findOne({_id:jobcard.jobcard_id}, {jobcard_cod:1,jobcard_siteid:1, jobcard_site:1 ,jobcard_tecnicoid:1, sparesArrayJobcard:1, jobcard_tecniconome:1, jobcard_audittrail:1, jobcard_clientenome:1}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
					console.log("Find jobcard");
				}
			}).lean();

			var posicaospareusedexistente = procurajobcard.sparesArrayJobcard.findIndex(x => x._id == jobcard.spareused_id);

			if((procurajobcard.jobcard_audittrail[procurajobcard.jobcard_audittrail.length-1].jobcard_audittrailname == userData.nome) && (procurajobcard.jobcard_audittrail[procurajobcard.jobcard_audittrail.length-1].jobcard_audittrailaction == "Update Spares Used")){

	        	procurajobcard.jobcard_audittrail[procurajobcard.jobcard_audittrail.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

		    }else{

		      var jobcard_audittrailObject = {};
		      
		      jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
		      jobcard_audittrailObject.jobcard_audittrailaction = "Update Spares Used";
		      jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
		      procurajobcard.jobcard_audittrail.push(jobcard_audittrailObject);
		    }


		    var procurastockpessoal = await armazens.findOne({nome_ref:jobcard.jobcard_tecnicoid},{disponibilidade:1, disponibilidade_returned:1}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
					console.log(err)
				}
				else{
					console.log("Find armazem pessoal");
				}
			}).lean();

			var posicaoitemtrocado = procurastockpessoal.disponibilidade.findIndex(x => x.referencia == procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemid);
			var posicaoitemnovo = procurastockpessoal.disponibilidade.findIndex(x => x.referencia == jobcard.jobcard_itemid);

			var posicaoitemreturntrocado = procurastockpessoal.disponibilidade_returned.findIndex(x => x.referencia == procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemid);

			if((procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemserialized == "sim") && (procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemnrserie != "")){

				procurastockpessoal.disponibilidade[posicaoitemtrocado].num_serie.push(procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemnrserie);
				procurastockpessoal.disponibilidade[posicaoitemtrocado].data_received.push(datacontroladora);
				procurastockpessoal.disponibilidade[posicaoitemtrocado].disponivel = procurastockpessoal.disponibilidade[posicaoitemtrocado].disponivel + 1;

			}else{

				procurastockpessoal.disponibilidade[posicaoitemtrocado].disponivel = procurastockpessoal.disponibilidade[posicaoitemtrocado].disponivel + procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_quantityuse;

			}

			var indexnrserienovo = procurastockpessoal.disponibilidade[posicaoitemnovo].num_serie.indexOf(jobcard.jobcard_itemnrserie);
			procurastockpessoal.disponibilidade[posicaoitemnovo].num_serie.splice(indexnrserienovo, 1);
			procurastockpessoal.disponibilidade[posicaoitemnovo].data_received.splice(indexnrserienovo, 1);
			procurastockpessoal.disponibilidade[posicaoitemnovo].disponivel = procurastockpessoal.disponibilidade[posicaoitemnovo].disponivel - 1;

			if(procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemreplace == "Sim"){

				var indexnrseriereturntrocado = procurastockpessoal.disponibilidade_returned[posicaoitemreturntrocado].num_serie.indexOf(procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_nomeitemreplace);
				procurastockpessoal.disponibilidade_returned[posicaoitemreturntrocado].num_serie.splice(indexnrseriereturntrocado, 1);
				procurastockpessoal.disponibilidade_returned[posicaoitemreturntrocado].data_received.splice(indexnrseriereturntrocado, 1);

			}

			var stockhist1 = {};
		    stockhist1.beneficiario = procurajobcard.jobcard_tecniconome;
		    stockhist1.beneficiario_ref = procurajobcard.jobcard_tecnicoid;
		    stockhist1.request_from = procurajobcard.jobcard_site;
		    stockhist1.request_from_ref = procurajobcard.jobcard_siteid;
		    stockhist1.quantidade = procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_quantityuse;
		    stockhist1.nome_item = procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_item;
		    stockhist1.ref_Item = procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemid;
		    stockhist1.numero = procurajobcard.jobcard_cod;
		    stockhist1.serialized = procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemserialized;

		    var procurastockhistory = await stockhistory.find({beneficiario_ref:procurajobcard.jobcard_siteid, ref_Item:jobcard.jobcard_itemid, numero:procurajobcard.jobcard_cod},{quantidade:1}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
					console.log(err)
				}
				else{
					console.log("Find spare used info");
				}
			}).lean();

			if(procurastockhistory.length != 0){
				procurastockhistory[0].quantidade = parseInt(procurastockhistory[0].quantidade) + 1;
			}else{

				var stockhist2 = {};
			    stockhist2.beneficiario = procurajobcard.jobcard_site;
			    stockhist2.beneficiario_ref = procurajobcard.jobcard_siteid;
			    stockhist2.request_from = procurajobcard.jobcard_tecniconome;
			    stockhist2.request_from_ref = procurajobcard.jobcard_tecnicoid;
			    stockhist2.quantidade = op3;
			    stockhist2.nome_item = procurastockpessoal.disponibilidade[posicaoitemnovo].description_item;
			    stockhist2.ref_Item = jobcard.jobcard_itemid;
			    stockhist2.numero = procurajobcard.jobcard_cod;
			    stockhist2.serialized = "sim";
			}


			var procuraspareusedinfo = await spareusedinfos.find({spareusedinfo_siteid:procurajobcard.jobcard_siteid},{spareusedinfo_item:1, spareusedinfo_itemreturned:1}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
					console.log(err)
				}
				else{
					console.log("Find spare used info");
				}
			}).lean();

			if(procuraspareusedinfo.length != 0){
				var posicaoitemspareinfotrocado = procuraspareusedinfo[0].spareusedinfo_item.findIndex(x => x.referenciaitemid == procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemid);
				var posicaoitemspareinfonovo = procuraspareusedinfo[0].spareusedinfo_item.findIndex(x => x.referenciaitemid == jobcard.jobcard_itemid);

				if(posicaoitemspareinfotrocado != -1){

					var indexnrserietrocado = procuraspareusedinfo[0].spareusedinfo_item[posicaoitemspareinfotrocado].num_serie.indexOf(procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemnrserie);
					procuraspareusedinfo[0].spareusedinfo_item[posicaoitemspareinfotrocado].num_serie.splice(indexnrserietrocado, 1);
					procuraspareusedinfo[0].spareusedinfo_item[posicaoitemspareinfotrocado].data_receivedmaint.splice(indexnrserietrocado, 1);
					procuraspareusedinfo[0].spareusedinfo_item[posicaoitemspareinfotrocado].spareusedphoto.splice(indexnrserietrocado, 1);

				}

				if(posicaoitemspareinfonovo == -1){

					var spareusedinfo_itemObject = {};
					spareusedinfo_itemObject.description_item = procurastockpessoal.disponibilidade[posicaoitemnovo].description_item;
					spareusedinfo_itemObject.referenciaitemid = jobcard.jobcard_itemid;
					spareusedinfo_itemObject.serialized = "sim";
					spareusedinfo_itemObject.num_serie = [];
					spareusedinfo_itemObject.num_serie.push(jobcard.jobcard_itemnrserie);
					spareusedinfo_itemObject.data_receivedmaint = [];
					spareusedinfo_itemObject.data_receivedmaint.push(todaydate);
					spareusedinfo_itemObject.spareusedphoto = [];
					spareusedinfo_itemObject.spareusedphoto.push(jobcard.jobcard_itemphoto);
					procuraspareusedinfo[0].spareusedinfo_item.push(spareusedinfo_itemObject);

					
				}else{

					procuraspareusedinfo[0].spareusedinfo_item[posicaoitemspareinfonovo].num_serie.push(jobcard.jobcard_itemnrserie);
					procuraspareusedinfo[0].spareusedinfo_item[posicaoitemspareinfonovo].data_receivedmaint.push(todaydate);
					procuraspareusedinfo[0].spareusedinfo_item[posicaoitemspareinfonovo].spareusedphoto.push(jobcard.jobcard_itemphoto);

				}

				var posicaoitemreplacespareinfotrocado = procuraspareusedinfo[0].spareusedinfo_itemreturned.findIndex(x => x.referenciaitemid == procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemid);

				if((procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_nomeitemreplace != "") && (posicaoitemreplacespareinfotrocado != -1)){

					var indexnrseriereplacetrocado = procuraspareusedinfo[0].spareusedinfo_itemreturned[posicaoitemreplacespareinfotrocado].num_serie.indexOf(procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_nomeitemreplace);
					procuraspareusedinfo[0].spareusedinfo_itemreturned[posicaoitemreplacespareinfotrocado].num_serie.splice(indexnrseriereplacetrocado, 1);
					procuraspareusedinfo[0].spareusedinfo_itemreturned[posicaoitemreplacespareinfotrocado].data_receivedmaint.splice(indexnrseriereplacetrocado, 1);
					procuraspareusedinfo[0].spareusedinfo_itemreturned[posicaoitemreplacespareinfotrocado].spareusedphoto.splice(indexnrseriereplacetrocado, 1);
				}
			}else{

				var spareused_infoObject = {};

				spareused_infoObject.spareusedinfo_client = procurajobcard.jobcard_clientenome;
				spareused_infoObject.spareusedinfo_site = procurajobcard.jobcard_site;
				spareused_infoObject.spareusedinfo_siteid = procurajobcard.jobcard_siteid;
				spareused_infoObject.spareusedinfo_item = [];
				spareused_infoObject.spareusedinfo_itemreturned = [];

				var spareusedinfo_itemObject = {};
				spareusedinfo_itemObject.description_item = procurastockpessoal.disponibilidade[posicaoitemnovo].description_item;
				spareusedinfo_itemObject.referenciaitemid = jobcard.jobcard_itemid;
				spareusedinfo_itemObject.serialized = "sim";
				spareusedinfo_itemObject.num_serie = [];
				spareusedinfo_itemObject.num_serie.push(jobcard.jobcard_itemnrserie);
				spareusedinfo_itemObject.data_receivedmaint = [];
				spareusedinfo_itemObject.data_receivedmaint.push(todaydate);
				spareusedinfo_itemObject.spareusedphoto = [];
				spareusedinfo_itemObject.spareusedphoto.push(jobcard.jobcard_itemphoto);
				spareused_infoObject.spareusedinfo_item.push(spareusedinfo_itemObject);

			}

			armazens.updateOne({_id:procurastockpessoal._id},{$set:{disponibilidade:procurastockpessoal.disponibilidade, disponibilidade_returned:procurastockpessoal.disponibilidade_returned}}, function(err, datastockpessoal){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados" + err);
				}else{
					console.log("Personal Stock updated");

					jobcards.updateOne({_id:jobcard.jobcard_id, "sparesArrayJobcard._id":jobcard.spareused_id},{$set:{data_ultimaactualizacaojobcard:new Date(),jobcard_audittrail:procurajobcard.jobcard_audittrail, "sparesArrayJobcard.$.jobcard_itemid":jobcard.jobcard_itemid, "sparesArrayJobcard.$.jobcard_item":procurastockpessoal.disponibilidade[posicaoitemnovo].description_item, "sparesArrayJobcard.$.jobcard_quantityuse":op3, "sparesArrayJobcard.$.jobcard_itemphoto":jobcard.jobcard_itemphoto, "sparesArrayJobcard.$.jobcard_datauso":jobcard.jobcard_datauso, "sparesArrayJobcard.$.jobcard_itemserialized":"sim", "sparesArrayJobcard.$.jobcard_itemnrserie":jobcard.jobcard_itemnrserie, "sparesArrayJobcard.$.jobcard_itemreplace":jobcard.jobcard_itemreplace, "sparesArrayJobcard.$.jobcard_itemreplacereason":"", "sparesArrayJobcard.$.jobcard_nomeitemreplace":"", "sparesArrayJobcard.$.jobcard_itemreplacephoto":"", "sparesArrayJobcard.$.jobcard_itemowner":jobcard.jobcard_itemowner}}, function(err, dataJobcard){
						if(err){
							console.log("ocorreu um erro ao tentar aceder os dados" + err);
						}else{
							console.log("Jobcard updated");

							stockhistory.gravar_historico(stockhist1, function(err){
								if(err){
									console.log("ocorreu um erro ao tentar aceder os dados" + err);
								}else{
									console.log("Stock History updated");

									if(procurastockhistory.length != 0){

										stockhistory.updateOne({_id:procurastockhistory[0]._id},{$set:{quantidade:procurastockhistory[0].quantidade}}, function(err, datastockhistory){
											if(err){
												console.log("ocorreu um erro ao tentar aceder os dados" + err);
											}else{
												console.log("Stock History updated");

												if(procuraspareusedinfo.length == 0){

													spareusedinfos.gravarDados(spareused_infoObject, function(err){
														if(err){
															console.log("ocorreu um erro ao tentar aceder os dados" + err);
														}else{
															console.log("SpareUsed Info updated");

															rastreiospare.updateOne({serial_number:procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemnrserie},{$push:{local_actual:procurajobcard.jobcard_tecniconome, datas_local_actual:new Date(), ref_local_actual:procurajobcard.jobcard_tecnicoid, meio_atribuicao:"Maintenance", atribuidores:userData.nome}}, function(err, datasrastreiospare){
																if(err){
																	console.log("ocorreu um erro ao tentar aceder os dados" + err);
																}else{
																	console.log("Rastreio updated");

																	rastreiospare.updateOne({serial_number:jobcard.jobcard_itemnrserie},{$push:{local_actual:procurajobcard.jobcard_site, datas_local_actual:new Date(), ref_local_actual:procurajobcard.jobcard_siteid, meio_atribuicao:"Maintenance", atribuidores:userData.nome}}, function(err, datasrastreiospare){
																		if(err){
																			console.log("ocorreu um erro ao tentar aceder os dados" + err);
																		}else{
																			console.log("Rastreio updated");

																			rastreiospare.updateOne({serial_number:procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_nomeitemreplace},{$push:{local_actual:procurajobcard.jobcard_tecniconome, datas_local_actual:new Date(), ref_local_actual:procurajobcard.jobcard_tecnicoid, meio_atribuicao:"Maintenance", atribuidores:userData.nome}}, function(err, datasrastreiospare){
																				if(err){
																					console.log("ocorreu um erro ao tentar aceder os dados" + err);
																				}else{
																					console.log("Rastreio updated");
																				}
																			});
																		}
																	});
																}
															});
														}
													});

												}else{

													spareusedinfos.updateOne({_id:jobcard.spareusedinfo_id},{$set:{spareusedinfo_item:procuraspareusedinfo[0].spareusedinfo_item, spareusedinfo_itemreturned:procuraspareusedinfo[0].spareusedinfo_itemreturned}}, function(err, datastockhistory){
														if(err){
															console.log("ocorreu um erro ao tentar aceder os dados" + err);
														}else{
															console.log("SpareUsed Info updated");

															rastreiospare.updateOne({serial_number:procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemnrserie},{$push:{local_actual:procurajobcard.jobcard_tecniconome, datas_local_actual:new Date(), ref_local_actual:procurajobcard.jobcard_tecnicoid, meio_atribuicao:"Maintenance", atribuidores:userData.nome}}, function(err, datasrastreiospare){
																if(err){
																	console.log("ocorreu um erro ao tentar aceder os dados" + err);
																}else{
																	console.log("Rastreio updated");

																	rastreiospare.updateOne({serial_number:jobcard.jobcard_itemnrserie},{$push:{local_actual:procurajobcard.jobcard_site, datas_local_actual:new Date(), ref_local_actual:procurajobcard.jobcard_siteid, meio_atribuicao:"Maintenance", atribuidores:userData.nome}}, function(err, datasrastreiospare){
																		if(err){
																			console.log("ocorreu um erro ao tentar aceder os dados" + err);
																		}else{
																			console.log("Rastreio updated");

																			rastreiospare.updateOne({serial_number:procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_nomeitemreplace},{$push:{local_actual:procurajobcard.jobcard_tecniconome, datas_local_actual:new Date(), ref_local_actual:procurajobcard.jobcard_tecnicoid, meio_atribuicao:"Maintenance", atribuidores:userData.nome}}, function(err, datasrastreiospare){
																				if(err){
																					console.log("ocorreu um erro ao tentar aceder os dados" + err);
																				}else{
																					console.log("Rastreio updated");
																				}
																			});
																		}
																	});
																}
															});
														}
													});
												}
											}
										});
									}else{

										stockhistory.gravar_historico(stockhist2, function(err){
											if(err){
												console.log("ocorreu um erro ao tentar aceder os dados" + err);
											}else{
												console.log("Stock History updated");

												if(procuraspareusedinfo.length == 0){

													spareusedinfos.gravarDados(spareused_infoObject, function(err){
														if(err){
															console.log("ocorreu um erro ao tentar aceder os dados" + err);
														}else{
															console.log("SpareUsed Info updated");

															rastreiospare.updateOne({serial_number:procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemnrserie},{$push:{local_actual:procurajobcard.jobcard_tecniconome, datas_local_actual:new Date(), ref_local_actual:procurajobcard.jobcard_tecnicoid, meio_atribuicao:"Maintenance", atribuidores:userData.nome}}, function(err, datasrastreiospare){
																if(err){
																	console.log("ocorreu um erro ao tentar aceder os dados" + err);
																}else{
																	console.log("Rastreio updated");

																	rastreiospare.updateOne({serial_number:jobcard.jobcard_itemnrserie},{$push:{local_actual:procurajobcard.jobcard_site, datas_local_actual:new Date(), ref_local_actual:procurajobcard.jobcard_siteid, meio_atribuicao:"Maintenance", atribuidores:userData.nome}}, function(err, datasrastreiospare){
																		if(err){
																			console.log("ocorreu um erro ao tentar aceder os dados" + err);
																		}else{
																			console.log("Rastreio updated");

																			rastreiospare.updateOne({serial_number:procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_nomeitemreplace},{$push:{local_actual:procurajobcard.jobcard_tecniconome, datas_local_actual:new Date(), ref_local_actual:procurajobcard.jobcard_tecnicoid, meio_atribuicao:"Maintenance", atribuidores:userData.nome}}, function(err, datasrastreiospare){
																				if(err){
																					console.log("ocorreu um erro ao tentar aceder os dados" + err);
																				}else{
																					console.log("Rastreio updated");
																				}
																			});
																		}
																	});
																}
															});
														}
													});

												}else{

													spareusedinfos.updateOne({_id:jobcard.spareusedinfo_id},{$set:{spareusedinfo_item:procuraspareusedinfo[0].spareusedinfo_item, spareusedinfo_itemreturned:procuraspareusedinfo[0].spareusedinfo_itemreturned}}, function(err, datastockhistory){
														if(err){
															console.log("ocorreu um erro ao tentar aceder os dados" + err);
														}else{
															console.log("SpareUsed Info updated");

															rastreiospare.updateOne({serial_number:procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemnrserie},{$push:{local_actual:procurajobcard.jobcard_tecniconome, datas_local_actual:new Date(), ref_local_actual:procurajobcard.jobcard_tecnicoid, meio_atribuicao:"Maintenance", atribuidores:userData.nome}}, function(err, datasrastreiospare){
																if(err){
																	console.log("ocorreu um erro ao tentar aceder os dados" + err);
																}else{
																	console.log("Rastreio updated");

																	rastreiospare.updateOne({serial_number:jobcard.jobcard_itemnrserie},{$push:{local_actual:procurajobcard.jobcard_site, datas_local_actual:new Date(), ref_local_actual:procurajobcard.jobcard_siteid, meio_atribuicao:"Maintenance", atribuidores:userData.nome}}, function(err, datasrastreiospare){
																		if(err){
																			console.log("ocorreu um erro ao tentar aceder os dados" + err);
																		}else{
																			console.log("Rastreio updated");

																			rastreiospare.updateOne({serial_number:procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_nomeitemreplace},{$push:{local_actual:procurajobcard.jobcard_tecniconome, datas_local_actual:new Date(), ref_local_actual:procurajobcard.jobcard_tecnicoid, meio_atribuicao:"Maintenance", atribuidores:userData.nome}}, function(err, datasrastreiospare){
																				if(err){
																					console.log("ocorreu um erro ao tentar aceder os dados" + err);
																				}else{
																					console.log("Rastreio updated");
																				}
																			});
																		}
																	});
																}
															});
														}
													});
												}
											}
										});

									}

								}
							});
						}
					});
				}
			});

	});


	router.post("/updatesparesusedNotreplacediffspare",  uploadphotosparereplace.any(), async function(req, res){
			var userData= req.session.usuario;
			var jobcard = req.body;
			var op1 = parseInt(jobcard.jobcard_remaining);
			var op2 = parseInt(jobcard.jobcard_quantityhave);
			var op3 = parseInt(jobcard.jobcard_quantityuse);
			var datacontroladora = await new Date(jobcard.jobcard_datauso.split('/').reverse().join('-') + 'T23:59:00.000+00:01').toISOString();

			var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
	        var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
	        var ano = (new Date()).getFullYear();
	        var todaydate = dia + "/" + mes + "/" + ano;
	        var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

			if (req.files.length !=0) {
		        let comprimento = req.files.length;
		        for (let i = 0; i < comprimento; i++) {
		        	if (req.files[i].fieldname == "jobcard_itemphoto") {
		                jobcard.jobcard_itemphoto= "/Spare_Used_Photos/" + req.files[i].filename;
		            }
		        }
		    }

		    var procurajobcard = await jobcards.findOne({_id:jobcard.jobcard_id}, {jobcard_cod:1,jobcard_siteid:1, jobcard_site:1 ,jobcard_tecnicoid:1, sparesArrayJobcard:1, jobcard_tecniconome:1, jobcard_audittrail:1, jobcard_clientenome:1}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
					console.log("Find jobcard");
				}
			}).lean();

			var posicaospareusedexistente = procurajobcard.sparesArrayJobcard.findIndex(x => x._id == jobcard.spareused_id);

			if((procurajobcard.jobcard_audittrail[procurajobcard.jobcard_audittrail.length-1].jobcard_audittrailname == userData.nome) && (procurajobcard.jobcard_audittrail[procurajobcard.jobcard_audittrail.length-1].jobcard_audittrailaction == "Update Spares Used")){

	        	procurajobcard.jobcard_audittrail[procurajobcard.jobcard_audittrail.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

		    }else{

		      var jobcard_audittrailObject = {};
		      
		      jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
		      jobcard_audittrailObject.jobcard_audittrailaction = "Update Spares Used";
		      jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
		      procurajobcard.jobcard_audittrail.push(jobcard_audittrailObject);
		    }

		    var procurastockpessoal = await armazens.findOne({nome_ref:jobcard.jobcard_tecnicoid},{disponibilidade:1, disponibilidade_returned:1}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
					console.log(err)
				}
				else{
					console.log("Find armazem pessoal");
				}
			}).lean();

			var posicaoitemtrocado = procurastockpessoal.disponibilidade.findIndex(x => x.referencia == procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemid);
			var posicaoitemnovo = procurastockpessoal.disponibilidade.findIndex(x => x.referencia == jobcard.jobcard_itemid);

			var posicaoitemreturntrocado = procurastockpessoal.disponibilidade_returned.findIndex(x => x.referencia == procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemid);

			if((procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemserialized == "sim") && (procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemnrserie != "")){

				procurastockpessoal.disponibilidade[posicaoitemtrocado].num_serie.push(procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemnrserie);
				procurastockpessoal.disponibilidade[posicaoitemtrocado].data_received.push(datacontroladora);
				procurastockpessoal.disponibilidade[posicaoitemtrocado].disponivel = procurastockpessoal.disponibilidade[posicaoitemtrocado].disponivel + 1;

			}else{

				procurastockpessoal.disponibilidade[posicaoitemtrocado].disponivel = procurastockpessoal.disponibilidade[posicaoitemtrocado].disponivel + procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_quantityuse;

			}

			procurastockpessoal.disponibilidade[posicaoitemnovo].disponivel = op1;

			if(procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemreplace == "Sim"){

				var indexnrseriereturntrocado = procurastockpessoal.disponibilidade_returned[posicaoitemreturntrocado].num_serie.indexOf(procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_nomeitemreplace);
				procurastockpessoal.disponibilidade_returned[posicaoitemreturntrocado].num_serie.splice(indexnrseriereturntrocado, 1);
				procurastockpessoal.disponibilidade_returned[posicaoitemreturntrocado].data_received.splice(indexnrseriereturntrocado, 1);

			}

			var stockhist1 = {};
		    stockhist1.beneficiario = procurajobcard.jobcard_tecniconome;
		    stockhist1.beneficiario_ref = procurajobcard.jobcard_tecnicoid;
		    stockhist1.request_from = procurajobcard.jobcard_site;
		    stockhist1.request_from_ref = procurajobcard.jobcard_siteid;
		    stockhist1.quantidade = procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_quantityuse;
		    stockhist1.nome_item = procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_item;
		    stockhist1.ref_Item = procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemid;
		    stockhist1.numero = procurajobcard.jobcard_cod;
		    stockhist1.serialized = procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemserialized;

		    var procurastockhistory = await stockhistory.find({beneficiario_ref:procurajobcard.jobcard_siteid, ref_Item:jobcard.jobcard_itemid, numero:procurajobcard.jobcard_cod},{quantidade:1}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
					console.log(err)
				}
				else{
					console.log("Find spare used info");
				}
			}).lean();

			if(procurastockhistory.length != 0){
				procurastockhistory[0].quantidade = parseInt(procurastockhistory[0].quantidade) + op3;
			}else{

				var stockhist2 = {};
			    stockhist2.beneficiario = procurajobcard.jobcard_site;
			    stockhist2.beneficiario_ref = procurajobcard.jobcard_siteid;
			    stockhist2.request_from = procurajobcard.jobcard_tecniconome;
			    stockhist2.request_from_ref = procurajobcard.jobcard_tecnicoid;
			    stockhist2.quantidade = op3;
			    stockhist2.nome_item = procurastockpessoal.disponibilidade[posicaoitemnovo].description_item;
			    stockhist2.ref_Item = jobcard.jobcard_itemid;
			    stockhist2.numero = procurajobcard.jobcard_cod;
			    stockhist2.serialized = "sim";
			}

			var procuraspareusedinfo = await spareusedinfos.find({spareusedinfo_siteid:procurajobcard.jobcard_siteid},{spareusedinfo_item:1, spareusedinfo_itemreturned:1}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
					console.log(err)
				}
				else{
					console.log("Find spare used info");
				}
			}).lean();

			if(procuraspareusedinfo.length != 0){
				var posicaoitemspareinfotrocado = procuraspareusedinfo[0].spareusedinfo_item.findIndex(x => x.referenciaitemid == procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemid);

				if(posicaoitemspareinfotrocado != -1){

					var indexnrserietrocado = procuraspareusedinfo[0].spareusedinfo_item[posicaoitemspareinfotrocado].num_serie.indexOf(procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemnrserie);
					procuraspareusedinfo[0].spareusedinfo_item[posicaoitemspareinfotrocado].num_serie.splice(indexnrserietrocado, 1);
					procuraspareusedinfo[0].spareusedinfo_item[posicaoitemspareinfotrocado].data_receivedmaint.splice(indexnrserietrocado, 1);
					procuraspareusedinfo[0].spareusedinfo_item[posicaoitemspareinfotrocado].spareusedphoto.splice(indexnrserietrocado, 1);

				}

				var posicaoitemreplacespareinfotrocado = procuraspareusedinfo[0].spareusedinfo_itemreturned.findIndex(x => x.referenciaitemid == procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemid);

				if((procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_nomeitemreplace != "") && (posicaoitemreplacespareinfotrocado != -1)){

					var indexnrseriereplacetrocado = procuraspareusedinfo[0].spareusedinfo_itemreturned[posicaoitemreplacespareinfotrocado].num_serie.indexOf(procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_nomeitemreplace);
					procuraspareusedinfo[0].spareusedinfo_itemreturned[posicaoitemreplacespareinfotrocado].num_serie.splice(indexnrseriereplacetrocado, 1);
					procuraspareusedinfo[0].spareusedinfo_itemreturned[posicaoitemreplacespareinfotrocado].data_receivedmaint.splice(indexnrseriereplacetrocado, 1);
					procuraspareusedinfo[0].spareusedinfo_itemreturned[posicaoitemreplacespareinfotrocado].spareusedphoto.splice(indexnrseriereplacetrocado, 1);
				}
			}

			armazens.updateOne({_id:procurastockpessoal._id},{$set:{disponibilidade:procurastockpessoal.disponibilidade, disponibilidade_returned:procurastockpessoal.disponibilidade_returned}}, function(err, datastockpessoal){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados" + err);
				}else{
					console.log("Personal Stock updated");

					jobcards.updateOne({_id:jobcard.jobcard_id, "sparesArrayJobcard._id":jobcard.spareused_id},{$set:{data_ultimaactualizacaojobcard:new Date(),jobcard_audittrail:procurajobcard.jobcard_audittrail, "sparesArrayJobcard.$.jobcard_itemid":jobcard.jobcard_itemid, "sparesArrayJobcard.$.jobcard_item":procurastockpessoal.disponibilidade[posicaoitemnovo].description_item, "sparesArrayJobcard.$.jobcard_quantityuse":op3, "sparesArrayJobcard.$.jobcard_itemphoto":jobcard.jobcard_itemphoto, "sparesArrayJobcard.$.jobcard_datauso":jobcard.jobcard_datauso, "sparesArrayJobcard.$.jobcard_itemserialized":procurastockpessoal.disponibilidade[posicaoitemnovo].serialized, "sparesArrayJobcard.$.jobcard_itemnrserie":"", "sparesArrayJobcard.$.jobcard_itemreplace":"", "sparesArrayJobcard.$.jobcard_itemreplacereason":"", "sparesArrayJobcard.$.jobcard_nomeitemreplace":"", "sparesArrayJobcard.$.jobcard_itemreplacephoto":"", "sparesArrayJobcard.$.jobcard_itemowner":jobcard.jobcard_itemowner}}, function(err, dataJobcard){
						if(err){
							console.log("ocorreu um erro ao tentar aceder os dados" + err);
						}else{
							console.log("Jobcard updated");

							stockhistory.gravar_historico(stockhist1, function(err){
								if(err){
									console.log("ocorreu um erro ao tentar aceder os dados" + err);
								}else{
									console.log("Stock History updated");

									if(procurastockhistory.length != 0){

										stockhistory.updateOne({_id:procurastockhistory[0]._id},{$set:{quantidade:procurastockhistory[0].quantidade}}, function(err, datastockhistory){
											if(err){
												console.log("ocorreu um erro ao tentar aceder os dados" + err);
											}else{
												console.log("Stock History updated");

												if(procuraspareusedinfo.length != 0){

													spareusedinfos.updateOne({_id:jobcard.spareusedinfo_id},{$set:{spareusedinfo_item:procuraspareusedinfo[0].spareusedinfo_item, spareusedinfo_itemreturned:procuraspareusedinfo[0].spareusedinfo_itemreturned}}, function(err, datastockhistory){
														if(err){
															console.log("ocorreu um erro ao tentar aceder os dados" + err);
														}else{
															console.log("SpareUsed Info updated");

															rastreiospare.updateOne({serial_number:procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemnrserie},{$push:{local_actual:procurajobcard.jobcard_tecniconome, datas_local_actual:new Date(), ref_local_actual:procurajobcard.jobcard_tecnicoid, meio_atribuicao:"Maintenance", atribuidores:userData.nome}}, function(err, datasrastreiospare){
																if(err){
																	console.log("ocorreu um erro ao tentar aceder os dados" + err);
																}else{
																	console.log("Rastreio updated");

																	rastreiospare.updateOne({serial_number:procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_nomeitemreplace},{$push:{local_actual:procurajobcard.jobcard_tecniconome, datas_local_actual:new Date(), ref_local_actual:procurajobcard.jobcard_tecnicoid, meio_atribuicao:"Maintenance", atribuidores:userData.nome}}, function(err, datasrastreiospare){
																		if(err){
																			console.log("ocorreu um erro ao tentar aceder os dados" + err);
																		}else{
																			console.log("Rastreio updated");
																		}
																	});

																}
															});
														}
													});
												}
											}
										});

									}else{

										stockhistory.gravar_historico(stockhist2, function(err){
											if(err){
												console.log("ocorreu um erro ao tentar aceder os dados" + err);
											}else{
												console.log("Stock History updated");

												if(procuraspareusedinfo.length != 0){
													spareusedinfos.updateOne({_id:jobcard.spareusedinfo_id},{$set:{spareusedinfo_item:procuraspareusedinfo[0].spareusedinfo_item, spareusedinfo_itemreturned:procuraspareusedinfo[0].spareusedinfo_itemreturned}}, function(err, datastockhistory){
														if(err){
															console.log("ocorreu um erro ao tentar aceder os dados" + err);
														}else{
															console.log("SpareUsed Info updated");

															rastreiospare.updateOne({serial_number:procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_itemnrserie},{$push:{local_actual:procurajobcard.jobcard_tecniconome, datas_local_actual:new Date(), ref_local_actual:procurajobcard.jobcard_tecnicoid, meio_atribuicao:"Maintenance", atribuidores:userData.nome}}, function(err, datasrastreiospare){
																if(err){
																	console.log("ocorreu um erro ao tentar aceder os dados" + err);
																}else{
																	console.log("Rastreio updated");

																	rastreiospare.updateOne({serial_number:procurajobcard.sparesArrayJobcard[posicaospareusedexistente].jobcard_nomeitemreplace},{$push:{local_actual:procurajobcard.jobcard_tecniconome, datas_local_actual:new Date(), ref_local_actual:procurajobcard.jobcard_tecnicoid, meio_atribuicao:"Maintenance", atribuidores:userData.nome}}, function(err, datasrastreiospare){
																		if(err){
																			console.log("ocorreu um erro ao tentar aceder os dados" + err);
																		}else{
																			console.log("Rastreio updated");
																		}
																	});

																}
															});
														}
													});
												}
											}
										});
									}
								}
							});
						}
					});
				}
			});
	});


	router.post("/updatesparesusedserializereplace",  uploadphotosparereplace.any(), async function(req, res){
		var userData= req.session.usuario;
		var jobcard = req.body;
		var op1 = parseInt(jobcard.jobcard_remaining);
		var op2 = parseInt(jobcard.jobcard_quantityhave);
		var op3 = parseInt(jobcard.jobcard_quantityuse);

		if (req.files) {
	        let comprimento = req.files.length;
	        for (let i = 0; i < comprimento; i++) {
	        	if (req.files[i].fieldname == "jobcard_itemphoto") {
	                jobcard.jobcard_itemphoto= "/Spare_Used_Photos/" + req.files[i].filename;
	                continue;
	            }
	            if (req.files[i].fieldname == "jobcard_itemreplacephoto") {
	                jobcard.jobcard_itemreplacephoto= "/Spare_Used_Photos/" + req.files[i].filename;
	                continue;
	            }
	        }
	    }

		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
        var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
        var ano = (new Date()).getFullYear();
        var todaydate = dia + "/" + mes + "/" + ano;
        var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

        var procurajobcard = await jobcards.findOne({_id:jobcard.jobcard_id}, {jobcard_tecnicoid:1, jobcard_site:1, jobcard_clientenome:1, jobcard_siteid:1, jobcard_audittrail:1, jobcard_tecniconome:1, jobcard_cod:1}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find jobcard");
			}
		}).lean();

		var procurastock = await armazens.findOne({nome_ref:procurajobcard.jobcard_tecnicoid, "disponibilidade.referencia":jobcard.jobcard_itemid}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
				console.log(err)
			}
			else{
				console.log("Find site");
			}
		}).lean();

		var posicaostock = procurastock.disponibilidade.findIndex(x => x.referencia == jobcard.jobcard_itemid);
		var armazemdisponibilidadeArray = procurastock.disponibilidade;
		var armazemdisponibilidadereturnedArray = procurastock.disponibilidade_returned;

		var procuraspareusedinfo = await spareusedinfos.find({spareusedinfo_site:procurajobcard.jobcard_site}, function(err, dataSiteInfo){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find Spare Used Info");
			}
		}).lean();


		if(procuraspareusedinfo.length == 0){
			var spareused_infoObject = {};

			spareused_infoObject.spareusedinfo_client = procurajobcard.jobcard_clientenome;
			spareused_infoObject.spareusedinfo_site = procurajobcard.jobcard_site;
			spareused_infoObject.spareusedinfo_siteid = procurajobcard.jobcard_siteid;
			spareused_infoObject.spareusedinfo_item = [];
			spareused_infoObject.spareusedinfo_itemreturned = [];

			var spareusedinfo_itemObject = {};
			spareusedinfo_itemObject.description_item = procurastock.disponibilidade[posicaostock].description_item;
			spareusedinfo_itemObject.referenciaitemid = jobcard.jobcard_itemid;
			spareusedinfo_itemObject.serialized = "sim";
			spareusedinfo_itemObject.num_serie = [];
			spareusedinfo_itemObject.num_serie.push(jobcard.jobcard_itemnrserie);
			spareusedinfo_itemObject.data_receivedmaint = [];
			spareusedinfo_itemObject.data_receivedmaint.push(jobcard.jobcard_datauso);
			spareusedinfo_itemObject.spareusedphoto = [];
			spareusedinfo_itemObject.spareusedphoto.push(jobcard.jobcard_itemphoto);
			spareused_infoObject.spareusedinfo_item.push(spareusedinfo_itemObject);

			var spareusedinfo_itemreturnedObject = {};
			spareusedinfo_itemreturnedObject.description_item = procurastock.disponibilidade[posicaostock].description_item;
			spareusedinfo_itemreturnedObject.referenciaitemid = jobcard.jobcard_itemid;
			spareusedinfo_itemreturnedObject.serialized = "sim";
			spareusedinfo_itemreturnedObject.num_serie = [];
			spareusedinfo_itemreturnedObject.num_serie.push(jobcard.jobcard_nomeitemreplace);
			spareusedinfo_itemreturnedObject.data_receivedmaint = [];
			spareusedinfo_itemreturnedObject.data_receivedmaint.push(jobcard.jobcard_datauso);
			spareusedinfo_itemreturnedObject.spareusedphoto = [];
			spareusedinfo_itemreturnedObject.spareusedphoto.push(jobcard.jobcard_itemreplacephoto);
			spareused_infoObject.spareusedinfo_itemreturned.push(spareusedinfo_itemreturnedObject);

		}else{

			var spareusedinfoitemArray = procuraspareusedinfo[0].spareusedinfo_item;
			var posicaoitem = spareusedinfoitemArray.findIndex(x => x.referenciaitemid == jobcard.jobcard_itemid);

			var spareusedinfoitemreturnedArray = procuraspareusedinfo[0].spareusedinfo_itemreturned;
			var posicaoitemreturned = spareusedinfoitemreturnedArray.findIndex(x => x.referenciaitemid == jobcard.jobcard_itemid);

			if(posicaoitemreturned == -1){
				var spareusedinfo_itemreturnedObject = {};

				spareusedinfo_itemreturnedObject.description_item = procurastock.disponibilidade[posicaostock].description_item;
				spareusedinfo_itemreturnedObject.referenciaitemid = jobcard.jobcard_itemid;
				spareusedinfo_itemreturnedObject.serialized = "sim";
				spareusedinfo_itemreturnedObject.num_serie = [];
				spareusedinfo_itemreturnedObject.num_serie.push(jobcard.jobcard_nomeitemreplace);
				spareusedinfo_itemreturnedObject.data_receivedmaint = [];
				spareusedinfo_itemreturnedObject.data_receivedmaint.push(jobcard.jobcard_datauso);
				spareusedinfo_itemreturnedObject.spareusedphoto = [];
				spareusedinfo_itemreturnedObject.spareusedphoto.push(jobcard.jobcard_itemreplacephoto);
				spareusedinfoitemreturnedArray.push(spareusedinfo_itemreturnedObject);

			}else{

				spareusedinfoitemreturnedArray[posicaoitemreturned].num_serie.push(jobcard.jobcard_nomeitemreplace);
				spareusedinfoitemreturnedArray[posicaoitemreturned].data_receivedmaint.push(jobcard.jobcard_datauso);
				spareusedinfoitemreturnedArray[posicaoitemreturned].spareusedphoto.push(jobcard.jobcard_itemreplacephoto);
			}

			if(posicaoitem == -1){

				var spareusedinfo_itemObject = {};
				spareusedinfo_itemObject.description_item = procurastock.disponibilidade[posicaostock].description_item;
				spareusedinfo_itemObject.referenciaitemid = jobcard.jobcard_itemid;
				spareusedinfo_itemObject.serialized = "sim";
				spareusedinfo_itemObject.num_serie = [];
				spareusedinfo_itemObject.num_serie.push(jobcard.jobcard_itemnrserie);
				spareusedinfo_itemObject.data_receivedmaint = [];
				spareusedinfo_itemObject.data_receivedmaint.push(jobcard.jobcard_datauso);
				spareusedinfo_itemObject.spareusedphoto = [];
				spareusedinfo_itemObject.spareusedphoto.push(jobcard.jobcard_itemphoto);
				spareusedinfoitemArray.push(spareusedinfo_itemObject);

			}else{

				var num_serieArray = spareusedinfoitemArray[posicaoitem].num_serie;
				var indexNumSerie = num_serieArray.indexOf(jobcard.jobcard_nomeitemreplace);
				var data_receivedmaintArray = spareusedinfoitemArray[posicaoitem].data_receivedmaint;

				if(indexNumSerie != -1){
					spareusedinfoitemArray[posicaoitem].num_serie[indexNumSerie] = jobcard.jobcard_itemnrserie;
					spareusedinfoitemArray[posicaoitem].data_receivedmaint[indexNumSerie] = jobcard.jobcard_datauso;
					spareusedinfoitemArray[posicaoitem].spareusedphoto[indexNumSerie] = jobcard.jobcard_itemphoto;

				}else{
					spareusedinfoitemArray[posicaoitem].num_serie.push(jobcard.jobcard.jobcard_itemnrserie);
					spareusedinfoitemArray[posicaoitem].data_receivedmaint.push(jobcard.jobcard_datauso);
					spareusedinfoitemArray[posicaoitem].spareusedphoto.push(jobcard.jobcard_itemphoto);
				}

				
			}

		}

		if(posicaostock != -1){

			if(armazemdisponibilidadeArray[posicaostock].num_serie.length != 0){

				var num_serieArray = procurastock.disponibilidade[posicaostock].num_serie;
				var datareceivedArray = procurastock.disponibilidade[posicaostock].data_received;
				var index = num_serieArray.indexOf(jobcard.jobcard_itemnrserie);
				num_serieArray.splice(index, 1);
				datareceivedArray.splice(index, 1);
				armazemdisponibilidadeArray[posicaostock].num_serie = num_serieArray;
				armazemdisponibilidadeArray[posicaostock].data_received = datareceivedArray;
				armazemdisponibilidadeArray[posicaostock].disponivel = op1;
			}
		}

		var posicaoitemreturned = armazemdisponibilidadereturnedArray.findIndex(x => x.referencia == jobcard.jobcard_itemid);

		if(posicaoitemreturned != -1){
	    	var data_received = await new Date(jobcard.jobcard_datauso.split('/').reverse().join('-') + 'T23:59:00.000+00:01').toISOString();
	    	armazemdisponibilidadereturnedArray[posicaoitemreturned].num_serie.push(jobcard.jobcard_nomeitemreplace);
	    	armazemdisponibilidadereturnedArray[posicaoitemreturned].data_received.push(data_received);
	    	armazemdisponibilidadereturnedArray[posicaoitemreturned].disponivel = armazemdisponibilidadereturnedArray[posicaoitemreturned].disponivel + 1;

		}else{

			var stockreturn = {};
			stockreturn.description_item = procurastock.disponibilidade[posicaostock].description_item;
			stockreturn.disponivel = 1;
			stockreturn.referencia = jobcard.jobcard_itemid;
			stockreturn.serialized = "sim";
			stockreturn.num_serie = [];
			stockreturn.num_serie.push(jobcard.jobcard_nomeitemreplace);
			stockreturn.cliente_name = procurastock.disponibilidade[posicaostock].cliente_name;
			stockreturn.part_number = procurastock.disponibilidade[posicaostock].part_number;
			stockreturn.data_received = [];
			stockreturn.data_received.push(await new Date(jobcard.jobcard_datauso.split('/').reverse().join('-') + 'T23:59:00.000+00:01').toISOString());
			stockreturn.pod = procurastock.disponibilidade[posicaostock].pod;
			stockreturn.category = procurastock.disponibilidade[posicaostock].category;
			stockreturn.jobcard_itemreplacephoto = [];
			stockreturn.jobcard_itemreplacephoto.push(jobcard.jobcard_itemreplacephoto);
			armazemdisponibilidadereturnedArray.push(stockreturn);
		}

        var arrAudit = procurajobcard.jobcard_audittrail;
		
		var lastaudittrail = arrAudit[arrAudit.length-1];

		if((lastaudittrail.jobcard_audittrailname == userData.nome) && (lastaudittrail.jobcard_audittrailaction == "Update Spares Used")){

        arrAudit[arrAudit.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

	    }else{

	      var jobcard_audittrailObject = {};
	      
	      jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
	      jobcard_audittrailObject.jobcard_audittrailaction = "Update Spares Used";
	      jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
	      arrAudit.push(jobcard_audittrailObject);
	    }

	    jobcard.jobcard_audittrail = arrAudit;

	    var stockhist = {};
	    stockhist.beneficiario = procurajobcard.jobcard_site;
	    stockhist.beneficiario_ref = procurajobcard.jobcard_siteid;
	    stockhist.request_from = procurajobcard.jobcard_tecniconome;
	    stockhist.request_from_ref = procurajobcard.jobcard_tecnicoid;
	    stockhist.quantidade = op3;
	    stockhist.nome_item = procurastock.disponibilidade[posicaostock].description_item;
	    stockhist.ref_Item = jobcard.jobcard_itemid;
	    stockhist.numero = procurajobcard.jobcard_cod;
	    stockhist.serialized = "sim";


	    var sparesArrayJobcardObject = {};
	    sparesArrayJobcardObject.jobcard_itemid = jobcard.jobcard_itemid;
	    sparesArrayJobcardObject.jobcard_item = procurastock.disponibilidade[posicaostock].description_item;;
	    sparesArrayJobcardObject.jobcard_quantityuse = op3;
	    sparesArrayJobcardObject.jobcard_datauso = jobcard.jobcard_datauso;
	    sparesArrayJobcardObject.jobcard_itemphoto = jobcard.jobcard_itemphoto;
	    sparesArrayJobcardObject.jobcard_itemserialized = "sim";
	    sparesArrayJobcardObject.jobcard_itemnrserie = jobcard.jobcard_itemnrserie;
	    sparesArrayJobcardObject.jobcard_itemreplace = jobcard.jobcard_itemreplace;
	    sparesArrayJobcardObject.jobcard_nomeitemreplace = jobcard.jobcard_nomeitemreplace;
	    sparesArrayJobcardObject.jobcard_itemreplacereason = jobcard.jobcard_itemreplacereason;
	    sparesArrayJobcardObject.jobcard_itemreplacephoto = jobcard.jobcard_itemreplacephoto;
	    sparesArrayJobcardObject.jobcard_itemowner = procurastock.disponibilidade[posicaostock].cliente_name;

	    var procurarastreiospareantigo = await rastreiospare.find({serial_number:jobcard.jobcard_nomeitemreplace}, {serial_number:1}, function(err, dataRastreioSpare){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find Spare Used Info");
			}
		}).lean();

		var procurarastreiosparenovo = await rastreiospare.find({serial_number:jobcard.jobcard_itemnrserie}, {serial_number:1}, function(err, dataRastreioSpare){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find Spare Used Info");
			}
		}).lean();

		armazens.updateOne({_id:procurastock._id},{$set:{disponibilidade:armazemdisponibilidadeArray, disponibilidade_returned:armazemdisponibilidadereturnedArray}}, function(err, datastockpessoal){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados" + err);
			}else{
				jobcards.updateOne({_id:jobcard.jobcard_id},{$set:{data_ultimaactualizacaojobcard:new Date(),jobcard_audittrail:jobcard.jobcard_audittrail}, $push:{sparesArrayJobcard:sparesArrayJobcardObject}}, function(err, dataJobcard){
					if(err){
						console.log("ocorreu um erro ao tentar aceder os dados" + err);
					}else{

						stockhistory.gravar_historico(stockhist, function(err){
							if(err){
								console.log("ocorreu um erro ao tentar aceder os dados" + err);
							}else{

								if(procuraspareusedinfo.length == 0){

									spareusedinfos.gravarDados(spareused_infoObject, function(err){
										if(err){
											console.log("ocorreu um erro ao tentar aceder os dados" + err);
										}else{
											console.log("Spare Used Updated")

											if(procurarastreiosparenovo.length != 0){

												rastreiospare.updateOne({_id:procurarastreiosparenovo[0]._id},{$push:{local_actual:procurajobcard.jobcard_site, datas_local_actual:new Date(), ref_local_actual:procurajobcard.jobcard_siteid, meio_atribuicao:"Maintenance", atribuidores:procurajobcard.jobcard_tecniconome}}, function(err, datasrastreiospare){
													if(err){
														console.log("ocorreu um erro ao tentar aceder os dados" + err);
													}else{
														console.log("Rastreio Novo Updated")

														if(procurarastreiospareantigo.length != 0){

															rastreiospare.updateOne({_id:procurarastreiospareantigo[0]._id},{$push:{local_actual:procurajobcard.jobcard_tecniconome, datas_local_actual:new Date(), ref_local_actual:procurajobcard.jobcard_tecnicoid, meio_atribuicao:"Maintenance", atribuidores:procurajobcard.jobcard_tecniconome}}, function(err, datasrastreiospareold){
																if(err){
																	console.log("ocorreu um erro ao tentar aceder os dados" + err);
																}else{
																	console.log("Rastreio Antigo Updated")
																}
															});

														}
													}
												});
											}
										}
									});

								}else{

									spareusedinfos.updateOne({_id:procuraspareusedinfo[0]._id},{$set:{spareusedinfo_item:spareusedinfoitemArray, spareusedinfo_itemreturned:spareusedinfoitemreturnedArray}}, function(err, dataspareusedinfo){
										if(err){
											console.log("ocorreu um erro ao tentar aceder os dados" + err);
										}else{
											console.log("Spare Used Updated");
											
											if(procurarastreiosparenovo.length != 0){

												rastreiospare.updateOne({_id:procurarastreiosparenovo[0]._id},{$push:{local_actual:procurajobcard.jobcard_site, datas_local_actual:new Date(), ref_local_actual:procurajobcard.jobcard_siteid, meio_atribuicao:"Maintenance", atribuidores:procurajobcard.jobcard_tecniconome}}, function(err, datasrastreiospare){
													if(err){
														console.log("ocorreu um erro ao tentar aceder os dados" + err);
													}else{
														console.log("Rastreio Novo Updated")

														if(procurarastreiospareantigo.length != 0){

															rastreiospare.updateOne({_id:procurarastreiospareantigo[0]._id},{$push:{local_actual:procurajobcard.jobcard_tecniconome, datas_local_actual:new Date(), ref_local_actual:procurajobcard.jobcard_tecnicoid, meio_atribuicao:"Maintenance", atribuidores:procurajobcard.jobcard_tecniconome}}, function(err, datasrastreiospareold){
																if(err){
																	console.log("ocorreu um erro ao tentar aceder os dados" + err);
																}else{
																	console.log("Rastreio Antigo Updated")
																}
															});

														}
													}
												});
											}
										}
									});
								}
							}
						});
					}
				});

			}
		});
		
		
		

	});

	router.post("/updatesparesusedserializereplaceproject",  uploadphotosparereplace.any(), async function(req, res){
		var userData= req.session.usuario;
		var jobcard = req.body;
		var op1 = parseInt(jobcard.jobcard_remaining);
		var op2 = parseInt(jobcard.jobcard_quantityhave);
		var op3 = parseInt(jobcard.jobcard_quantityuse);

		if (req.files) {
	        let comprimento = req.files.length;
	        for (let i = 0; i < comprimento; i++) {
	        	if (req.files[i].fieldname == "jobcard_itemphoto") {
	                jobcard.jobcard_itemphoto= "/public/Spare_Used_Photos/" + req.files[i].filename;
	                continue;
	            }
	            if (req.files[i].fieldname == "jobcard_itemreplacephoto") {
	                jobcard.jobcard_itemreplacephoto= "/public/Spare_Used_Photos/" + req.files[i].filename;
	                continue;
	            }
	        }
	    }

		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
        var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
        var ano = (new Date()).getFullYear();
        var todaydate = dia + "/" + mes + "/" + ano;
        var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

        var procuraproject = await jobcardprojects.findOne({_id:jobcard.jobcard_id}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find jobcard");
			}
		});

		var procurastock = await armazens.findOne({nome_ref:procuraproject.jobcard_tecnicoid, "disponibilidade.referencia":jobcard.jobcard_itemid}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
				console.log(err)
			}
			else{
				console.log("Find site");
			}
		});

		var posicaostock = procurastock.disponibilidade.findIndex(x => x.referencia == jobcard.jobcard_itemid);
		var armazemdisponibilidadeArray = procurastock.disponibilidade;
		var armazemdisponibilidadereturnedArray = procurastock.disponibilidade_returned;

		var procuraspareusedinfo = await spareusedinfos.find({spareusedinfo_site:jobcard.jobcard_sitecontrolador}, function(err, dataSiteInfo){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find Spare Used Info");
			}
		});


		if(procuraspareusedinfo.length == 0){
			var spareused_infoObject = {};

			spareused_infoObject.spareusedinfo_client = procuraproject.jobcard_clientenome;
			spareused_infoObject.spareusedinfo_site = jobcard.jobcard_sitecontrolador;
			spareused_infoObject.spareusedinfo_siteid = "";
			spareused_infoObject.spareusedinfo_item = [];
			spareused_infoObject.spareusedinfo_itemreturned = [];

			var spareusedinfo_itemObject = {};
			spareusedinfo_itemObject.description_item = procurastock.disponibilidade[posicaostock].description_item;
			spareusedinfo_itemObject.referenciaitemid = jobcard.jobcard_itemid;
			spareusedinfo_itemObject.serialized = "sim";
			spareusedinfo_itemObject.num_serie = [];
			spareusedinfo_itemObject.num_serie.push(jobcard.jobcard_itemnrserie);
			spareusedinfo_itemObject.data_receivedmaint = [];
			spareusedinfo_itemObject.data_receivedmaint.push(jobcard.jobcard_datauso);
			spareusedinfo_itemObject.spareusedphoto = [];
			spareusedinfo_itemObject.spareusedphoto.push(jobcard.jobcard_itemphoto);
			spareused_infoObject.spareusedinfo_item.push(spareusedinfo_itemObject);

			var spareusedinfo_itemreturnedObject = {};
			spareusedinfo_itemreturnedObject.description_item = procurastock.disponibilidade[posicaostock].description_item;
			spareusedinfo_itemreturnedObject.referenciaitemid = jobcard.jobcard_itemid;
			spareusedinfo_itemreturnedObject.serialized = "sim";
			spareusedinfo_itemreturnedObject.num_serie = [];
			spareusedinfo_itemreturnedObject.num_serie.push(jobcard.jobcard_nomeitemreplace);
			spareusedinfo_itemreturnedObject.data_receivedmaint = [];
			spareusedinfo_itemreturnedObject.data_receivedmaint.push(jobcard.jobcard_datauso);
			spareusedinfo_itemreturnedObject.spareusedphoto = [];
			spareusedinfo_itemreturnedObject.spareusedphoto.push(jobcard.jobcard_itemreplacephoto);
			spareused_infoObject.spareusedinfo_itemreturned.push(spareusedinfo_itemreturnedObject);

		}else{

			var spareusedinfoitemArray = procuraspareusedinfo[0].spareusedinfo_item;
			var posicaoitem = spareusedinfoitemArray.findIndex(x => x.referenciaitemid == jobcard.jobcard_itemid);

			var spareusedinfoitemreturnedArray = procuraspareusedinfo[0].spareusedinfo_itemreturned;
			var posicaoitemreturned = spareusedinfoitemreturnedArray.findIndex(x => x.referenciaitemid == jobcard.jobcard_itemid);

			if(posicaoitemreturned == -1){
				var spareusedinfo_itemreturnedObject = {};

				spareusedinfo_itemreturnedObject.description_item = procurastock.disponibilidade[posicaostock].description_item;
				spareusedinfo_itemreturnedObject.referenciaitemid = jobcard.jobcard_itemid;
				spareusedinfo_itemreturnedObject.serialized = "sim";
				spareusedinfo_itemreturnedObject.num_serie = [];
				spareusedinfo_itemreturnedObject.num_serie.push(jobcard.jobcard_nomeitemreplace);
				spareusedinfo_itemreturnedObject.data_receivedmaint = [];
				spareusedinfo_itemreturnedObject.data_receivedmaint.push(jobcard.jobcard_datauso);
				spareusedinfo_itemreturnedObject.spareusedphoto = [];
				spareusedinfo_itemreturnedObject.spareusedphoto.push(jobcard.jobcard_itemreplacephoto);
				spareusedinfoitemreturnedArray.push(spareusedinfo_itemreturnedObject);

			}else{

				spareusedinfoitemreturnedArray[posicaoitemreturned].num_serie.push(jobcard.jobcard_nomeitemreplace);
				spareusedinfoitemreturnedArray[posicaoitemreturned].data_receivedmaint.push(jobcard.jobcard_datauso);
				spareusedinfoitemreturnedArray[posicaoitemreturned].spareusedphoto.push(jobcard.jobcard_itemreplacephoto);
			}

			if(posicaoitem == -1){

				var spareusedinfo_itemObject = {};
				spareusedinfo_itemObject.description_item = procurastock.disponibilidade[posicaostock].description_item;
				spareusedinfo_itemObject.referenciaitemid = jobcard.jobcard_itemid;
				spareusedinfo_itemObject.serialized = "sim";
				spareusedinfo_itemObject.num_serie = [];
				spareusedinfo_itemObject.num_serie.push(jobcard.jobcard_itemnrserie);
				spareusedinfo_itemObject.data_receivedmaint = [];
				spareusedinfo_itemObject.data_receivedmaint.push(jobcard.jobcard_datauso);
				spareusedinfo_itemObject.spareusedphoto = [];
				spareusedinfo_itemObject.spareusedphoto.push(jobcard.jobcard_itemphoto);
				spareusedinfoitemArray.push(spareusedinfo_itemObject);

			}else{

				var num_serieArray = spareusedinfoitemArray[posicaoitem].num_serie;
				var indexNumSerie = num_serieArray.indexOf(jobcard.jobcard_nomeitemreplace);
				var data_receivedmaintArray = spareusedinfoitemArray[posicaoitem].data_receivedmaint;

				if(indexNumSerie != -1){
					spareusedinfoitemArray[posicaoitem].num_serie[indexNumSerie] = jobcard.jobcard_itemnrserie;
					spareusedinfoitemArray[posicaoitem].data_receivedmaint[indexNumSerie] = jobcard.jobcard_datauso;
					spareusedinfoitemArray[posicaoitem].spareusedphoto[indexNumSerie] = jobcard.jobcard_itemphoto;

				}else{
					spareusedinfoitemArray[posicaoitem].num_serie.push(jobcard.jobcard.jobcard_itemnrserie);
					spareusedinfoitemArray[posicaoitem].data_receivedmaint.push(jobcard.jobcard_datauso);
					spareusedinfoitemArray[posicaoitem].spareusedphoto.push(jobcard.jobcard_itemphoto);
				}

				
			}

		}

		if(posicaostock != -1){

			if(armazemdisponibilidadeArray[posicaostock].num_serie.length != 0){

				var num_serieArray = procurastock.disponibilidade[posicaostock].num_serie;
				var datareceivedArray = procurastock.disponibilidade[posicaostock].data_received;
				var index = num_serieArray.indexOf(jobcard.jobcard_itemnrserie);
				num_serieArray.splice(index, 1);
				datareceivedArray.splice(index, 1);
				armazemdisponibilidadeArray[posicaostock].num_serie = num_serieArray;
				armazemdisponibilidadeArray[posicaostock].data_received = datareceivedArray;
				armazemdisponibilidadeArray[posicaostock].disponivel = op1;
			}
		}

		var posicaoitemreturned = armazemdisponibilidadereturnedArray.findIndex(x => x.referencia == jobcard.jobcard_itemid);

		if(posicaoitemreturned != -1){
	    	var data_received = await new Date(jobcard.jobcard_datauso.split('/').reverse().join('-') + 'T23:59:00.000+00:01').toISOString();
	    	armazemdisponibilidadereturnedArray[posicaoitemreturned].num_serie.push(jobcard.jobcard_nomeitemreplace);
	    	armazemdisponibilidadereturnedArray[posicaoitemreturned].data_received.push(data_received);
	    	armazemdisponibilidadereturnedArray[posicaoitemreturned].disponivel = armazemdisponibilidadereturnedArray[posicaoitemreturned].disponivel + 1;

		}else{

			var stockreturn = {};
			stockreturn.description_item = procurastock.disponibilidade[posicaostock].description_item;
			stockreturn.disponivel = 1;
			stockreturn.referencia = jobcard.jobcard_itemid;
			stockreturn.serialized = "sim";
			stockreturn.num_serie = [];
			stockreturn.num_serie.push(jobcard.jobcard_nomeitemreplace);
			stockreturn.cliente_name = procurastock.disponibilidade[posicaostock].cliente_name;
			stockreturn.part_number = procurastock.disponibilidade[posicaostock].part_number;
			stockreturn.data_received = [];
			stockreturn.data_received.push(await new Date(jobcard.jobcard_datauso.split('/').reverse().join('-') + 'T23:59:00.000+00:01').toISOString());
			stockreturn.pod = procurastock.disponibilidade[posicaostock].pod;
			stockreturn.category = procurastock.disponibilidade[posicaostock].category;
			stockreturn.jobcard_itemreplacephoto = [];
			stockreturn.jobcard_itemreplacephoto.push(jobcard.jobcard_itemreplacephoto);
			armazemdisponibilidadereturnedArray.push(stockreturn);
		}

        var arrAudit = procuraproject.jobcard_audittrail;
		
		var lastaudittrail = arrAudit[arrAudit.length-1];

		if((lastaudittrail.jobcard_audittrailname == userData.nome) && (lastaudittrail.jobcard_audittrailaction == "Update Spares Used")){

        arrAudit[arrAudit.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

	    }else{

	      var jobcard_audittrailObject = {};
	      
	      jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
	      jobcard_audittrailObject.jobcard_audittrailaction = "Update Spares Used";
	      jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
	      arrAudit.push(jobcard_audittrailObject);
	    }

	    jobcard.jobcard_audittrail = arrAudit;

	    var stockhist = {};
	    stockhist.beneficiario = jobcard.jobcard_sitecontrolador;
	    stockhist.beneficiario_ref = "";
	    stockhist.request_from = procuraproject.jobcard_tecniconome;
	    stockhist.request_from_ref = procuraproject.jobcard_tecnicoid;
	    stockhist.quantidade = op3;
	    stockhist.nome_item = procurastock.disponibilidade[posicaostock].description_item;
	    stockhist.ref_Item = jobcard.jobcard_itemid;
	    stockhist.numero = procuraproject.jobcard_cod;
	    stockhist.serialized = "sim";


	    var sparesArrayJobcardObject = {};
	    sparesArrayJobcardObject.jobcard_itemid = jobcard.jobcard_itemid;
	    sparesArrayJobcardObject.jobcard_item = procurastock.disponibilidade[posicaostock].description_item;
	    sparesArrayJobcardObject.jobcard_quantityuse = op3;
	    sparesArrayJobcardObject.jobcard_datauso = jobcard.jobcard_datauso;
	    sparesArrayJobcardObject.jobcard_itemphoto = jobcard.jobcard_itemphoto;
	    sparesArrayJobcardObject.jobcard_itemserialized = "sim";
	    sparesArrayJobcardObject.jobcard_itemnrserie = jobcard.jobcard_itemnrserie;
	    sparesArrayJobcardObject.jobcard_itemreplace = jobcard.jobcard_itemreplace;
	    sparesArrayJobcardObject.jobcard_nomeitemreplace = jobcard.jobcard_nomeitemreplace;
	    sparesArrayJobcardObject.jobcard_itemreplacereason = jobcard.jobcard_itemreplacereason;
	    sparesArrayJobcardObject.jobcard_itemreplacephoto = jobcard.jobcard_itemreplacephoto;
	    sparesArrayJobcardObject.jobcard_itemowner = procurastock.disponibilidade[posicaostock].cliente_name;

		armazens.updateOne({_id:procurastock._id},{$set:{disponibilidade:armazemdisponibilidadeArray, disponibilidade_returned:armazemdisponibilidadereturnedArray}}, function(err, datastockpessoal){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados" + err);
			}else{
				jobcardprojects.updateOne({_id:jobcard.jobcard_id},{$set:{jobcard_audittrail:jobcard.jobcard_audittrail}, $push:{sparesArrayJobcard:sparesArrayJobcardObject}}, function(err, dataJobcard){
					if(err){
						console.log("ocorreu um erro ao tentar aceder os dados" + err);
					}else{

						stockhistory.gravar_historico(stockhist, function(err){
							if(err){
								console.log("ocorreu um erro ao tentar aceder os dados" + err);
							}else{

								if(procuraspareusedinfo.length == 0){

									spareusedinfos.gravarDados(spareused_infoObject, function(err){
										if(err){
											console.log("ocorreu um erro ao tentar aceder os dados" + err);
										}else{
											console.log("Spare Used Updated")
										}
									});

								}else{

									spareusedinfos.updateOne({_id:procuraspareusedinfo[0]._id},{$set:{spareusedinfo_item:spareusedinfoitemArray, spareusedinfo_itemreturned:spareusedinfoitemreturnedArray}}, function(err, dataspareusedinfo){
										if(err){
											console.log("ocorreu um erro ao tentar aceder os dados" + err);
										}else{
											console.log("Spare Used Updated")
										}
									});
								}
							}
						});
					}
				});

			}
		});
		

	});

	router.post("/updatesparesusedserializeNotreplace",  uploadphotosparereplace.any(), async function(req, res){
		var userData= req.session.usuario;
		var jobcard = req.body;
		var op1 = parseInt(jobcard.jobcard_remaining);
		var op2 = parseInt(jobcard.jobcard_quantityhave);
		var op3 = parseInt(jobcard.jobcard_quantityuse);

		if (req.files) {
	        let comprimento = req.files.length;
	        for (let i = 0; i < comprimento; i++) {
	        	if (req.files[i].fieldname == "jobcard_itemphoto") {
	                jobcard.jobcard_itemphoto= "/Spare_Used_Photos/" + req.files[i].filename;
	                continue;
	            }
	        }
	    }

		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
        var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
        var ano = (new Date()).getFullYear();
        var todaydate = dia + "/" + mes + "/" + ano;
        var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

        var procurajobcard = await jobcards.findOne({_id:jobcard.jobcard_id}, {jobcard_tecnicoid:1, jobcard_site:1, jobcard_clientenome:1, jobcard_siteid:1, jobcard_audittrail:1, jobcard_tecniconome:1, jobcard_cod:1}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find jobcard");
			}
		}).lean();

		var procurastock = await armazens.findOne({nome_ref:procurajobcard.jobcard_tecnicoid, "disponibilidade.referencia":jobcard.jobcard_itemid}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
				console.log(err)
			}
			else{
				console.log("Find site");
			}
		}).lean();

		var posicaostock = procurastock.disponibilidade.findIndex(x => x.referencia == jobcard.jobcard_itemid);
		var armazemdisponibilidadeArray = procurastock.disponibilidade;

		var procuraspareusedinfo = await spareusedinfos.find({spareusedinfo_site:procurajobcard.jobcard_site}, function(err, dataSiteInfo){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find Spare Used Info");
			}
		}).lean();


		if(procuraspareusedinfo.length == 0){
			var spareused_infoObject = {};

			spareused_infoObject.spareusedinfo_client = procurajobcard.jobcard_clientenome;
			spareused_infoObject.spareusedinfo_site = procurajobcard.jobcard_site;
			spareused_infoObject.spareusedinfo_siteid = procurajobcard.jobcard_siteid;
			spareused_infoObject.spareusedinfo_item = [];
			spareused_infoObject.spareusedinfo_itemreturned = [];

			var spareusedinfo_itemObject = {};
			spareusedinfo_itemObject.description_item = procurastock.disponibilidade[posicaostock].description_item;
			spareusedinfo_itemObject.referenciaitemid = jobcard.jobcard_itemid;
			spareusedinfo_itemObject.serialized = "sim";
			spareusedinfo_itemObject.num_serie = [];
			spareusedinfo_itemObject.num_serie.push(jobcard.jobcard_itemnrserie);
			spareusedinfo_itemObject.data_receivedmaint = [];
			spareusedinfo_itemObject.data_receivedmaint.push(jobcard.jobcard_datauso);
			spareusedinfo_itemObject.spareusedphoto = [];
			spareusedinfo_itemObject.spareusedphoto.push(jobcard.jobcard_itemphoto);
			spareused_infoObject.spareusedinfo_item.push(spareusedinfo_itemObject);

		}else{

			var spareusedinfoitemArray = procuraspareusedinfo[0].spareusedinfo_item;
			var posicaoitem = spareusedinfoitemArray.findIndex(x => x.referenciaitemid == jobcard.jobcard_itemid);



			if(posicaoitem == -1){

				var spareusedinfo_itemObject = {};
				spareusedinfo_itemObject.description_item = procurastock.disponibilidade[posicaostock].description_item;
				spareusedinfo_itemObject.referenciaitemid = jobcard.jobcard_itemid;
				spareusedinfo_itemObject.serialized = "sim";
				spareusedinfo_itemObject.num_serie = [];
				spareusedinfo_itemObject.num_serie.push(jobcard.jobcard_itemnrserie);
				spareusedinfo_itemObject.data_receivedmaint = [];
				spareusedinfo_itemObject.data_receivedmaint.push(jobcard.jobcard_datauso);
				spareusedinfo_itemObject.spareusedphoto = [];
				spareusedinfo_itemObject.spareusedphoto.push(jobcard.jobcard_itemphoto);
				spareusedinfoitemArray.push(spareusedinfo_itemObject);

			}else{

				spareusedinfoitemArray[posicaoitem].num_serie.push(jobcard.jobcard_itemnrserie);
				spareusedinfoitemArray[posicaoitem].data_receivedmaint.push(jobcard.jobcard_datauso);
				spareusedinfoitemArray[posicaoitem].spareusedphoto.push(jobcard.jobcard_itemphoto);
				
			}

		}

		if(posicaostock != -1){

			if(armazemdisponibilidadeArray[posicaostock].num_serie.length != 0){

				var num_serieArray = procurastock.disponibilidade[posicaostock].num_serie;
				var datareceivedArray = procurastock.disponibilidade[posicaostock].data_received;
				var index = num_serieArray.indexOf(jobcard.jobcard_itemnrserie);
				num_serieArray.splice(index, 1);
				datareceivedArray.splice(index, 1);
				armazemdisponibilidadeArray[posicaostock].num_serie = num_serieArray;
				armazemdisponibilidadeArray[posicaostock].data_received = datareceivedArray;
				armazemdisponibilidadeArray[posicaostock].disponivel = op1;
			}
		}

        var arrAudit = procurajobcard.jobcard_audittrail;
		
		var lastaudittrail = arrAudit[arrAudit.length-1];

		if((lastaudittrail.jobcard_audittrailname == userData.nome) && (lastaudittrail.jobcard_audittrailaction == "Update Spares Used")){

        	arrAudit[arrAudit.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

	    }else{

	      var jobcard_audittrailObject = {};
	      
	      jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
	      jobcard_audittrailObject.jobcard_audittrailaction = "Update Spares Used";
	      jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
	      arrAudit.push(jobcard_audittrailObject);
	    }

	    jobcard.jobcard_audittrail = arrAudit;

	    var stockhist = {};
	    stockhist.beneficiario = procurajobcard.jobcard_site;
	    stockhist.beneficiario_ref = procurajobcard.jobcard_siteid;
	    stockhist.request_from = procurajobcard.jobcard_tecniconome;
	    stockhist.request_from_ref = procurajobcard.jobcard_tecnicoid;
	    stockhist.quantidade = op3;
	    stockhist.nome_item = procurastock.disponibilidade[posicaostock].description_item;
	    stockhist.ref_Item = jobcard.jobcard_itemid;
	    stockhist.numero = procurajobcard.jobcard_cod;
	    stockhist.serialized = "sim";


	    var sparesArrayJobcardObject = {};
	    sparesArrayJobcardObject.jobcard_itemid = jobcard.jobcard_itemid;
	    sparesArrayJobcardObject.jobcard_item = procurastock.disponibilidade[posicaostock].description_item;;
	    sparesArrayJobcardObject.jobcard_quantityuse = op3;
	    sparesArrayJobcardObject.jobcard_datauso = jobcard.jobcard_datauso;
	    sparesArrayJobcardObject.jobcard_itemphoto = jobcard.jobcard_itemphoto;
	    sparesArrayJobcardObject.jobcard_itemserialized = "sim";
	    sparesArrayJobcardObject.jobcard_itemnrserie = jobcard.jobcard_itemnrserie;
	    sparesArrayJobcardObject.jobcard_itemreplace = jobcard.jobcard_itemreplace;
	    sparesArrayJobcardObject.jobcard_nomeitemreplace = "";
	    sparesArrayJobcardObject.jobcard_itemreplacereason = "";
	    sparesArrayJobcardObject.jobcard_itemreplacephoto = "";
	    sparesArrayJobcardObject.jobcard_itemowner = procurastock.disponibilidade[posicaostock].cliente_name;

	    var procurarastreiospare = await rastreiospare.find({serial_number:jobcard.jobcard_itemnrserie}, {serial_number:1}, function(err, dataRastreioSpare){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find Spare Used Info");
			}
		}).lean();

		armazens.updateOne({_id:procurastock._id},{$set:{disponibilidade:armazemdisponibilidadeArray}}, function(err, datastockpessoal){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados" + err);
			}else{
				jobcards.updateOne({_id:jobcard.jobcard_id},{$set:{data_ultimaactualizacaojobcard:new Date(),jobcard_audittrail:jobcard.jobcard_audittrail}, $push:{sparesArrayJobcard:sparesArrayJobcardObject}}, function(err, dataJobcard){
					if(err){
						console.log("ocorreu um erro ao tentar aceder os dados" + err);
					}else{

						stockhistory.gravar_historico(stockhist, function(err){
							if(err){
								console.log("ocorreu um erro ao tentar aceder os dados" + err);
							}else{

								if(procuraspareusedinfo.length == 0){

									spareusedinfos.gravarDados(spareused_infoObject, function(err){
										if(err){
											console.log("ocorreu um erro ao tentar aceder os dados" + err);
										}else{
											console.log("Spare Used Updated")

											if(procurarastreiospare.length != 0){

												rastreiospare.updateOne({_id:procurarastreiospare[0]._id},{$push:{local_actual:procurajobcard.jobcard_site, datas_local_actual:new Date(), ref_local_actual:procurajobcard.jobcard_siteid, meio_atribuicao:"Maintenance", atribuidores:procurajobcard.jobcard_tecniconome}}, function(err, datasrastreiospare){
													if(err){
														console.log("ocorreu um erro ao tentar aceder os dados" + err);
													}else{
														console.log("Rastreio Updated")
													}
												});
											}

										}
									});

								}else{

									spareusedinfos.updateOne({_id:procuraspareusedinfo[0]._id},{$set:{spareusedinfo_item:spareusedinfoitemArray}}, function(err, dataspareusedinfo){
										if(err){
											console.log("ocorreu um erro ao tentar aceder os dados" + err);
										}else{
											console.log("Spare Used Updated")

											if(procurarastreiospare.length != 0){

												rastreiospare.updateOne({_id:procurarastreiospare[0]._id},{$push:{local_actual:procurajobcard.jobcard_site, datas_local_actual:new Date(), ref_local_actual:procurajobcard.jobcard_siteid, meio_atribuicao:"Maintenance", atribuidores:procurajobcard.jobcard_tecniconome}}, function(err, datasrastreiospare){
													if(err){
														console.log("ocorreu um erro ao tentar aceder os dados" + err);
													}else{
														console.log("Rastreio Updated")
													}
												});
											}
										}
									});
								}
							}
						});
					}
				});

			}
		});
		
		

	});


	router.post("/updatesparesusedserializeNotreplaceproject",  uploadphotosparereplace.any(), async function(req, res){
		var userData= req.session.usuario;
		var jobcard = req.body;
		var op1 = parseInt(jobcard.jobcard_remaining);
		var op2 = parseInt(jobcard.jobcard_quantityhave);
		var op3 = parseInt(jobcard.jobcard_quantityuse);

		if (req.files) {
	        let comprimento = req.files.length;
	        for (let i = 0; i < comprimento; i++) {
	        	if (req.files[i].fieldname == "jobcard_itemphoto") {
	                jobcard.jobcard_itemphoto= "/public/Spare_Used_Photos/" + req.files[i].filename;
	                continue;
	            }
	        }
	    }

		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
        var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
        var ano = (new Date()).getFullYear();
        var todaydate = dia + "/" + mes + "/" + ano;
        var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

        var procuraproject = await jobcardprojects.findOne({_id:jobcard.jobcard_id}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find Project");
			}
		});

		var procurastock = await armazens.findOne({nome_ref:procuraproject.jobcard_tecnicoid, "disponibilidade.referencia":jobcard.jobcard_itemid}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
				console.log(err)
			}
			else{
				console.log("Find site");
			}
		});

		var posicaostock = procurastock.disponibilidade.findIndex(x => x.referencia == jobcard.jobcard_itemid);
		var armazemdisponibilidadeArray = procurastock.disponibilidade;

		var procuraspareusedinfo = await spareusedinfos.find({spareusedinfo_site:jobcard.jobcard_sitecontrolador}, function(err, dataSiteInfo){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find Spare Used Info");
			}
		});


		if(procuraspareusedinfo.length == 0){
			var spareused_infoObject = {};

			spareused_infoObject.spareusedinfo_client = procuraproject.jobcard_clientenome;
			spareused_infoObject.spareusedinfo_site = jobcard.jobcard_sitecontrolador;
			spareused_infoObject.spareusedinfo_siteid = "";
			spareused_infoObject.spareusedinfo_item = [];
			spareused_infoObject.spareusedinfo_itemreturned = [];

			var spareusedinfo_itemObject = {};
			spareusedinfo_itemObject.description_item = procurastock.disponibilidade[posicaostock].description_item;
			spareusedinfo_itemObject.referenciaitemid = jobcard.jobcard_itemid;
			spareusedinfo_itemObject.serialized = "sim";
			spareusedinfo_itemObject.num_serie = [];
			spareusedinfo_itemObject.num_serie.push(jobcard.jobcard_itemnrserie);
			spareusedinfo_itemObject.data_receivedmaint = [];
			spareusedinfo_itemObject.data_receivedmaint.push(jobcard.jobcard_datauso);
			spareusedinfo_itemObject.spareusedphoto = [];
			spareusedinfo_itemObject.spareusedphoto.push(jobcard.jobcard_itemphoto);
			spareused_infoObject.spareusedinfo_item.push(spareusedinfo_itemObject);

		}else{

			var spareusedinfoitemArray = procuraspareusedinfo[0].spareusedinfo_item;
			var posicaoitem = spareusedinfoitemArray.findIndex(x => x.referenciaitemid == jobcard.jobcard_itemid);



			if(posicaoitem == -1){

				var spareusedinfo_itemObject = {};
				spareusedinfo_itemObject.description_item = procurastock.disponibilidade[posicaostock].description_item;
				spareusedinfo_itemObject.referenciaitemid = jobcard.jobcard_itemid;
				spareusedinfo_itemObject.serialized = "sim";
				spareusedinfo_itemObject.num_serie = [];
				spareusedinfo_itemObject.num_serie.push(jobcard.jobcard_itemnrserie);
				spareusedinfo_itemObject.data_receivedmaint = [];
				spareusedinfo_itemObject.data_receivedmaint.push(jobcard.jobcard_datauso);
				spareusedinfo_itemObject.spareusedphoto = [];
				spareusedinfo_itemObject.spareusedphoto.push(jobcard.jobcard_itemphoto);
				spareusedinfoitemArray.push(spareusedinfo_itemObject);

			}else{

				spareusedinfoitemArray[posicaoitem].num_serie.push(jobcard.jobcard_itemnrserie);
				spareusedinfoitemArray[posicaoitem].data_receivedmaint.push(jobcard.jobcard_datauso);
				spareusedinfoitemArray[posicaoitem].spareusedphoto.push(jobcard.jobcard_itemphoto);
				
			}

		}

		if(posicaostock != -1){

			if(armazemdisponibilidadeArray[posicaostock].num_serie.length != 0){

				var num_serieArray = procurastock.disponibilidade[posicaostock].num_serie;
				var datareceivedArray = procurastock.disponibilidade[posicaostock].data_received;
				var index = num_serieArray.indexOf(jobcard.jobcard_itemnrserie);
				num_serieArray.splice(index, 1);
				datareceivedArray.splice(index, 1);
				armazemdisponibilidadeArray[posicaostock].num_serie = num_serieArray;
				armazemdisponibilidadeArray[posicaostock].data_received = datareceivedArray;
				armazemdisponibilidadeArray[posicaostock].disponivel = op1;
			}
		}

        var arrAudit = procuraproject.jobcard_audittrail;
		
		var lastaudittrail = arrAudit[arrAudit.length-1];

		if((lastaudittrail.jobcard_audittrailname == userData.nome) && (lastaudittrail.jobcard_audittrailaction == "Update Spares Used")){

        	arrAudit[arrAudit.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

	    }else{

	      var jobcard_audittrailObject = {};
	      
	      jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
	      jobcard_audittrailObject.jobcard_audittrailaction = "Update Spares Used";
	      jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
	      arrAudit.push(jobcard_audittrailObject);
	    }

	    jobcard.jobcard_audittrail = arrAudit;

	    var stockhist = {};
	    stockhist.beneficiario = jobcard.jobcard_sitecontrolador;
	    stockhist.beneficiario_ref = "";
	    stockhist.request_from = procuraproject.jobcard_tecniconome;
	    stockhist.request_from_ref = procuraproject.jobcard_tecnicoid;
	    stockhist.quantidade = op3;
	    stockhist.nome_item = procurastock.disponibilidade[posicaostock].description_item;
	    stockhist.ref_Item = jobcard.jobcard_itemid;
	    stockhist.numero = procuraproject.jobcard_cod;
	    stockhist.serialized = "sim";


	    var sparesArrayJobcardObject = {};
	    sparesArrayJobcardObject.jobcard_itemid = jobcard.jobcard_itemid;
	    sparesArrayJobcardObject.jobcard_item = procurastock.disponibilidade[posicaostock].description_item;;
	    sparesArrayJobcardObject.jobcard_quantityuse = op3;
	    sparesArrayJobcardObject.jobcard_datauso = jobcard.jobcard_datauso;
	    sparesArrayJobcardObject.jobcard_itemphoto = jobcard.jobcard_itemphoto;
	    sparesArrayJobcardObject.jobcard_itemserialized = "sim";
	    sparesArrayJobcardObject.jobcard_itemnrserie = jobcard.jobcard_itemnrserie;
	    sparesArrayJobcardObject.jobcard_itemreplace = jobcard.jobcard_itemreplace;
	    sparesArrayJobcardObject.jobcard_nomeitemreplace = "";
	    sparesArrayJobcardObject.jobcard_itemreplacereason = "";
	    sparesArrayJobcardObject.jobcard_itemreplacephoto = "";
	    sparesArrayJobcardObject.jobcard_itemowner = procurastock.disponibilidade[posicaostock].cliente_name;


		armazens.updateOne({_id:procurastock._id},{$set:{disponibilidade:armazemdisponibilidadeArray}}, function(err, datastockpessoal){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados" + err);
			}else{
				jobcardprojects.updateOne({_id:jobcard.jobcard_id},{$set:{jobcard_audittrail:jobcard.jobcard_audittrail}, $push:{sparesArrayJobcard:sparesArrayJobcardObject}}, function(err, dataJobcard){
					if(err){
						console.log("ocorreu um erro ao tentar aceder os dados" + err);
					}else{

						stockhistory.gravar_historico(stockhist, function(err){
							if(err){
								console.log("ocorreu um erro ao tentar aceder os dados" + err);
							}else{

								if(procuraspareusedinfo.length == 0){

									spareusedinfos.gravarDados(spareused_infoObject, function(err){
										if(err){
											console.log("ocorreu um erro ao tentar aceder os dados" + err);
										}else{
											console.log("Spare Used Updated")
										}
									});

								}else{

									spareusedinfos.updateOne({_id:procuraspareusedinfo[0]._id},{$set:{spareusedinfo_item:spareusedinfoitemArray}}, function(err, dataspareusedinfo){
										if(err){
											console.log("ocorreu um erro ao tentar aceder os dados" + err);
										}else{
											console.log("Spare Used Updated")
										}
									});
								}
							}
						});
					}
				});

			}
		});

	});

	
	router.post("/updatesparesusedreplace",  upload.any(), async function(req, res){
		var userData= req.session.usuario;
		var jobcard = req.body;
		var op1 = parseInt(jobcard.jobcard_remaining);
		var op2 = parseInt(jobcard.jobcard_quantityhave);
		var op3 = parseInt(jobcard.jobcard_quantityuse);

		// jobcard.jobcard_audittrailObject = JSON.parse(req.body.jobcard_audittrailObject);

		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
        var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
        var ano = (new Date()).getFullYear();
        var todaydate = dia + "/" + mes + "/" + ano;
        var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

        var procurajobcard = await jobcards.findOne({_id:jobcard.jobcard_id}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find jobcard");
			}
		});

		var procurastock = await armazens.findOne({nome_ref:procurajobcard.jobcard_tecnicoid, "disponibilidade.referencia":jobcard.jobcard_itemid}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
				console.log(err)
			}
			else{
				console.log("Find site");
			}
		});

		var posicaoitem = procurastock.disponibilidade.findIndex(x => x.referencia == jobcard.jobcard_itemid);

		

        var arrAudit = procurajobcard.jobcard_audittrail;
		
		var lastaudittrail = arrAudit[arrAudit.length-1];

		if((lastaudittrail.jobcard_audittrailname == userData.nome) && (lastaudittrail.jobcard_audittrailaction == "Update Spares Used")){

        arrAudit[arrAudit.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

	    }else{

	      var jobcard_audittrailObject = {};
	      // jobcard_audittrailObject._id = "";
	      jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
	      jobcard_audittrailObject.jobcard_audittrailaction = "Update Spares Used";
	      jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
	      arrAudit.push(jobcard_audittrailObject);
	    }

	    jobcard.jobcard_audittrail = arrAudit;

	    var stockhist = {};
	    stockhist.beneficiario = procurajobcard.jobcard_site;
	    stockhist.beneficiario_ref = procurajobcard.jobcard_siteid;
	    stockhist.request_from = procurajobcard.jobcard_tecniconome;
	    stockhist.request_from_ref = procurajobcard.jobcard_tecnicoid;
	    stockhist.quantidade = op3;
	    stockhist.nome_item = procurastock.disponibilidade[posicaoitem].description_item;
	    jobcard.jobcard_item = procurastock.disponibilidade[posicaoitem].description_item;
	    stockhist.ref_Item = jobcard.jobcard_itemid;
	    stockhist.numero = procurajobcard.jobcard_cod;
	    stockhist.serialized = jobcard.jobcard_itemserialized;


	    var sparesArrayJobcardObject = {};
	    sparesArrayJobcardObject.jobcard_itemid = jobcard.jobcard_itemid;
	    sparesArrayJobcardObject.jobcard_item = jobcard.jobcard_item;
	    // sparesArrayJobcardObject.jobcard_quantityhave = op2;
	    // sparesArrayJobcardObject.jobcard_remaining = op1;
	    sparesArrayJobcardObject.jobcard_quantityuse = op3;
	    sparesArrayJobcardObject.jobcard_datauso = jobcard.jobcard_datauso;
	    sparesArrayJobcardObject.jobcard_itemserialized = jobcard.jobcard_itemserialized;
	    sparesArrayJobcardObject.jobcard_itemnrserie = jobcard.jobcard_itemnrserie;
	    sparesArrayJobcardObject.jobcard_itemreplace = jobcard.jobcard_itemreplace;
	    sparesArrayJobcardObject.jobcard_itemreplacereason = jobcard.jobcard_itemreplacereason;
	    sparesArrayJobcardObject.jobcard_nomeitemreplace = jobcard.jobcard_nomeitemreplace;

			jobcards.findOneAndUpdate({_id:jobcard.jobcard_id},{$set:{jobcard_audittrail:jobcard.jobcard_audittrail}, $push:{sparesArrayJobcard:sparesArrayJobcardObject}}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
					console.log("spares update")
					stockhistory.gravar_historico(stockhist, function(err){
						if(err){
							console.log("ocorreu um erro ao tentar aceder os dados")
						}else{

							armazens.findOneAndUpdate({_id:procurastock._id, "disponibilidade.referencia":jobcard.jobcard_itemid},{$inc:{"disponibilidade.$.defeituosa":1}, $set:{"disponibilidade.$.disponivel":op1}}, function(err, data){
								if(err){
						    		console.log("ocorreu um erro ao tentar aceder os dados")
						    	}else{
						    		console.log("Sucesso");
						    		// res.redirect("/inicio");
						    	}
							});


								
						}
					});

					
					
				}
			});
		
		

	});

	
	router.post("/updatesparesusedreplaceproject",  upload.any(), async function(req, res){
		var userData= req.session.usuario;
		var jobcard = req.body;
		var op1 = parseInt(jobcard.jobcard_remaining);
		var op2 = parseInt(jobcard.jobcard_quantityhave);
		var op3 = parseInt(jobcard.jobcard_quantityuse);

		// jobcard.jobcard_audittrailObject = JSON.parse(req.body.jobcard_audittrailObject);

		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
        var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
        var ano = (new Date()).getFullYear();
        var todaydate = dia + "/" + mes + "/" + ano;
        var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

        var procuraproject = await jobcardprojects.findOne({_id:jobcard.jobcard_id}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find jobcard");
			}
		});

		// colocar site
		var siteproject = "";
		for(var i = 0; i < procuraproject.jobcard_site.length; i++){

			siteproject = siteproject + procuraproject.jobcard_site[i];

			if(i<procuraproject.jobcard_site.length - 1){
				siteproject = siteproject + ",";
			}
		}
		console.log(siteproject)

		var procurastock = await armazens.findOne({nome_ref:procuraproject.jobcard_tecnicoid, "disponibilidade.referencia":jobcard.jobcard_itemid}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
				console.log(err)
			}
			else{
				console.log("Find site");
			}
		});

		var posicaoitem = procurastock.disponibilidade.findIndex(x => x.referencia == jobcard.jobcard_itemid);

		

        var arrAudit = procuraproject.jobcard_audittrail;
		
		var lastaudittrail = arrAudit[arrAudit.length-1];

		if((lastaudittrail.jobcard_audittrailname == userData.nome) && (lastaudittrail.jobcard_audittrailaction == "Update Spares Used")){

        arrAudit[arrAudit.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

	    }else{

	      var jobcard_audittrailObject = {};
	      // jobcard_audittrailObject._id = "";
	      jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
	      jobcard_audittrailObject.jobcard_audittrailaction = "Update Spares Used";
	      jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
	      arrAudit.push(jobcard_audittrailObject);
	    }

	    jobcard.jobcard_audittrail = arrAudit;

	    var stockhist = {};
	    stockhist.beneficiario = procuraproject.jobcard_projectnumber;
	    stockhist.beneficiario_ref = siteproject;
	    stockhist.request_from = procuraproject.jobcard_tecniconome;
	    stockhist.request_from_ref = procuraproject.jobcard_tecnicoid;
	    stockhist.quantidade = op3;
	    stockhist.nome_item = procurastock.disponibilidade[posicaoitem].description_item;
	    jobcard.jobcard_item = procurastock.disponibilidade[posicaoitem].description_item;
	    stockhist.ref_Item = jobcard.jobcard_itemid;
	    stockhist.numero = procuraproject.jobcard_cod;
	    stockhist.serialized = jobcard.jobcard_itemserialized;


	    var sparesArrayJobcardObject = {};
	    sparesArrayJobcardObject.jobcard_itemid = jobcard.jobcard_itemid;
	    sparesArrayJobcardObject.jobcard_item = jobcard.jobcard_item;
	    // sparesArrayJobcardObject.jobcard_quantityhave = op2;
	    // sparesArrayJobcardObject.jobcard_remaining = op1;
	    sparesArrayJobcardObject.jobcard_quantityuse = op3;
	    sparesArrayJobcardObject.jobcard_datauso = jobcard.jobcard_datauso;
	    sparesArrayJobcardObject.jobcard_itemserialized = jobcard.jobcard_itemserialized;
	    sparesArrayJobcardObject.jobcard_itemnrserie = jobcard.jobcard_itemnrserie;
	    sparesArrayJobcardObject.jobcard_itemreplace = jobcard.jobcard_itemreplace;
	    sparesArrayJobcardObject.jobcard_itemreplacereason = jobcard.jobcard_itemreplacereason;
	    sparesArrayJobcardObject.jobcard_nomeitemreplace = jobcard.jobcard_nomeitemreplace;

			jobcardprojects.findOneAndUpdate({_id:jobcard.jobcard_id},{$set:{jobcard_audittrail:jobcard.jobcard_audittrail}, $push:{sparesArrayJobcard:sparesArrayJobcardObject}}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
					console.log("spares update")
					stockhistory.gravar_historico(stockhist, function(err){
						if(err){
							console.log("ocorreu um erro ao tentar aceder os dados")
						}else{

							armazens.findOneAndUpdate({_id:procurastock._id, "disponibilidade.referencia":jobcard.jobcard_itemid},{$inc:{"disponibilidade.$.defeituosa":1}, $set:{"disponibilidade.$.disponivel":op1}}, function(err, data){
								if(err){
						    		console.log("ocorreu um erro ao tentar aceder os dados")
						    	}else{
						    		console.log("Sucesso");
						    		// res.redirect("/inicio");
						    	}
							});


								
						}
					});

					
					
				}
			});
		
		

	});

	router.post("/updatesparesusedNotreplace",  uploadphotosparereplace.any(), async function(req, res){
		var userData= req.session.usuario;
		var jobcard = req.body;
		var op1 = parseInt(jobcard.jobcard_remaining);
		var op2 = parseInt(jobcard.jobcard_quantityhave);
		var op3 = parseInt(jobcard.jobcard_quantityuse);

		if (req.files) {
	        let comprimento = req.files.length;
	        for (let i = 0; i < comprimento; i++) {
	        	if (req.files[i].fieldname == "jobcard_itemphoto") {
	                jobcard.jobcard_itemphoto= "/Spare_Used_Photos/" + req.files[i].filename;
	                continue;
	            }
	        }
	    }

		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
        var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
        var ano = (new Date()).getFullYear();
        var todaydate = dia + "/" + mes + "/" + ano;
        var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

        var procurajobcard = await jobcards.findOne({_id:jobcard.jobcard_id}, {jobcard_tecnicoid:1, jobcard_audittrail:1, jobcard_site:1, jobcard_clientenome:1, jobcard_siteid:1, jobcard_tecniconome:1, jobcard_cod:1}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find jobcard");
			}
		}).lean();

		var procurastock = await armazens.findOne({nome_ref:procurajobcard.jobcard_tecnicoid, "disponibilidade.referencia":jobcard.jobcard_itemid}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
				console.log(err)
			}
			else{
				console.log("Find site");
			}
		});

		var posicaostock = procurastock.disponibilidade.findIndex(x => x.referencia == jobcard.jobcard_itemid);

        var arrAudit = procurajobcard.jobcard_audittrail;
		
		var lastaudittrail = arrAudit[arrAudit.length-1];

		if((lastaudittrail.jobcard_audittrailname == userData.nome) && (lastaudittrail.jobcard_audittrailaction == "Update Spares Used")){

        	arrAudit[arrAudit.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

	    }else{

	      var jobcard_audittrailObject = {};
	      
	      jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
	      jobcard_audittrailObject.jobcard_audittrailaction = "Update Spares Used";
	      jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
	      arrAudit.push(jobcard_audittrailObject);
	    }

	    jobcard.jobcard_audittrail = arrAudit;

	    var stockhist = {};
	    stockhist.beneficiario = procurajobcard.jobcard_site;
	    stockhist.beneficiario_ref = procurajobcard.jobcard_siteid;
	    stockhist.request_from = procurajobcard.jobcard_tecniconome;
	    stockhist.request_from_ref = procurajobcard.jobcard_tecnicoid;
	    stockhist.quantidade = op3;
	    stockhist.nome_item = procurastock.disponibilidade[posicaostock].description_item;
	    stockhist.ref_Item = jobcard.jobcard_itemid;
	    stockhist.numero = procurajobcard.jobcard_cod;
	    if(procurastock.disponibilidade[posicaostock].serialized == undefined){
	    	stockhist.serialized = "nao";
	    }else{
	    	stockhist.serialized = procurastock.disponibilidade[posicaostock].serialized;
	    }
	    


	    var sparesArrayJobcardObject = {};
	    sparesArrayJobcardObject.jobcard_itemid = jobcard.jobcard_itemid;
	    sparesArrayJobcardObject.jobcard_item = procurastock.disponibilidade[posicaostock].description_item;
	    sparesArrayJobcardObject.jobcard_quantityuse = op3;
	    sparesArrayJobcardObject.jobcard_datauso = jobcard.jobcard_datauso;
	    sparesArrayJobcardObject.jobcard_itemphoto = jobcard.jobcard_itemphoto;
	    if(procurastock.disponibilidade[posicaostock].serialized == undefined){
	    	sparesArrayJobcardObject.jobcard_itemserialized = "nao";
	    }else{
	    	sparesArrayJobcardObject.jobcard_itemserialized = procurastock.disponibilidade[posicaostock].serialized;
	    }
	    sparesArrayJobcardObject.jobcard_itemnrserie = "";
	    sparesArrayJobcardObject.jobcard_itemreplace = "";
	    sparesArrayJobcardObject.jobcard_nomeitemreplace = "";
	    sparesArrayJobcardObject.jobcard_itemreplacereason = "";
	    sparesArrayJobcardObject.jobcard_itemreplacephoto = "";
	    sparesArrayJobcardObject.jobcard_itemowner = procurastock.disponibilidade[posicaostock].cliente_name;

		armazens.updateOne({_id:procurastock._id, "disponibilidade.referencia":jobcard.jobcard_itemid},{$set:{"disponibilidade.$.disponivel":op1}}, function(err, datastockpessoal){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados" + err);
			}else{
				jobcards.updateOne({_id:jobcard.jobcard_id},{$set:{data_ultimaactualizacaojobcard:new Date(),jobcard_audittrail:jobcard.jobcard_audittrail}, $push:{sparesArrayJobcard:sparesArrayJobcardObject}}, function(err, dataJobcard){
					if(err){
						console.log("ocorreu um erro ao tentar aceder os dados" + err);
					}else{

						stockhistory.gravar_historico(stockhist, function(err){
							if(err){
								console.log("ocorreu um erro ao tentar aceder os dados" + err);
							}else{

								console.log("Spare Used Updated");
							}
						});
					}
				});

			}
		});

	});

	router.post("/updatesparesusedNotreplaceproject",  uploadphotosparereplace.any(), async function(req, res){
		var userData= req.session.usuario;
		var jobcard = req.body;
		var op1 = parseInt(jobcard.jobcard_remaining);
		var op2 = parseInt(jobcard.jobcard_quantityhave);
		var op3 = parseInt(jobcard.jobcard_quantityuse);

		if (req.files) {
	        let comprimento = req.files.length;
	        for (let i = 0; i < comprimento; i++) {
	        	if (req.files[i].fieldname == "jobcard_itemphoto") {
	                jobcard.jobcard_itemphoto= "/public/Spare_Used_Photos/" + req.files[i].filename;
	                continue;
	            }
	        }
	    }

		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
        var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
        var ano = (new Date()).getFullYear();
        var todaydate = dia + "/" + mes + "/" + ano;
        var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

        var procuraproject = await jobcardprojects.findOne({_id:jobcard.jobcard_id}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find project");
			}
		});

		var procurastock = await armazens.findOne({nome_ref:procuraproject.jobcard_tecnicoid, "disponibilidade.referencia":jobcard.jobcard_itemid}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
				console.log(err)
			}
			else{
				console.log("Find stock pessoal");
			}
		});

		var posicaostock = procurastock.disponibilidade.findIndex(x => x.referencia == jobcard.jobcard_itemid);

        var arrAudit = procuraproject.jobcard_audittrail;
		
		var lastaudittrail = arrAudit[arrAudit.length-1];

		if((lastaudittrail.jobcard_audittrailname == userData.nome) && (lastaudittrail.jobcard_audittrailaction == "Update Spares Used")){

        	arrAudit[arrAudit.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

	    }else{

	      var jobcard_audittrailObject = {};
	      
	      jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
	      jobcard_audittrailObject.jobcard_audittrailaction = "Update Spares Used";
	      jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
	      arrAudit.push(jobcard_audittrailObject);
	    }

	    jobcard.jobcard_audittrail = arrAudit;

	    var stockhist = {};
	    stockhist.beneficiario = jobcard.jobcard_sitecontrolador;
	    stockhist.beneficiario_ref = "";
	    stockhist.request_from = procuraproject.jobcard_tecniconome;
	    stockhist.request_from_ref = procuraproject.jobcard_tecnicoid;
	    stockhist.quantidade = op3;
	    stockhist.nome_item = procurastock.disponibilidade[posicaostock].description_item;
	    stockhist.ref_Item = jobcard.jobcard_itemid;
	    stockhist.numero = procuraproject.jobcard_cod;
	    if(procurastock.disponibilidade[posicaostock].serialized == undefined){
	    	stockhist.serialized = "nao";
	    }else{
	    	stockhist.serialized = procurastock.disponibilidade[posicaostock].serialized;
	    }


	    var sparesArrayJobcardObject = {};
	    sparesArrayJobcardObject.jobcard_itemid = jobcard.jobcard_itemid;
	    sparesArrayJobcardObject.jobcard_item = procurastock.disponibilidade[posicaostock].description_item;
	    sparesArrayJobcardObject.jobcard_quantityuse = op3;
	    sparesArrayJobcardObject.jobcard_datauso = jobcard.jobcard_datauso;
	    sparesArrayJobcardObject.jobcard_itemphoto = jobcard.jobcard_itemphoto;
	    if(procurastock.disponibilidade[posicaostock].serialized == undefined){
	    	sparesArrayJobcardObject.jobcard_itemserialized = "nao";
	    }else{
	    	sparesArrayJobcardObject.jobcard_itemserialized = procurastock.disponibilidade[posicaostock].serialized;
	    }
	    sparesArrayJobcardObject.jobcard_itemnrserie = "";
	    sparesArrayJobcardObject.jobcard_itemreplace = "";
	    sparesArrayJobcardObject.jobcard_nomeitemreplace = "";
	    sparesArrayJobcardObject.jobcard_itemreplacereason = "";
	    sparesArrayJobcardObject.jobcard_itemreplacephoto = "";
	    sparesArrayJobcardObject.jobcard_itemowner = procurastock.disponibilidade[posicaostock].cliente_name;

		armazens.updateOne({_id:procurastock._id, "disponibilidade.referencia":jobcard.jobcard_itemid},{$set:{"disponibilidade.$.disponivel":op1}}, function(err, datastockpessoal){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados" + err);
			}else{
				jobcardprojects.updateOne({_id:jobcard.jobcard_id},{$set:{jobcard_audittrail:jobcard.jobcard_audittrail}, $push:{sparesArrayJobcard:sparesArrayJobcardObject}}, function(err, dataJobcard){
					if(err){
						console.log("ocorreu um erro ao tentar aceder os dados" + err);
					}else{

						stockhistory.gravar_historico(stockhist, function(err){
							if(err){
								console.log("ocorreu um erro ao tentar aceder os dados" + err);
							}else{

								console.log("Spare Used Updated");
							}
						});
					}
				});

			}
		});

	});

	router.post("/updatetabletravel",  upload.any(), function(req, res){
		var userData= req.session.usuario;
		var jobcard = req.body;

		jobcards.findOneAndUpdate({_id:jobcard.jobcard_id, "travelinfoArrayJobcard._id":jobcard.jobcard_travelid},{$set:{"travelinfoArrayJobcard.$.jobcard_remedialaction":jobcard.jobcard_remedialaction, "travelinfoArrayJobcard.$.jobcard_healthsafety":jobcard.jobcard_healthsafety, "travelinfoArrayJobcard.$.jobcard_hsreason":jobcard.jobcard_hsreason}}, function(err, data){

			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}else{
				res.redirect("/inicio");
			}

		});


	});

	router.post("/updatecallcentercommentsproject",  upload.any(), async function(req, res){

		var userData= req.session.usuario;
		var jobcard = req.body;
		console.log(jobcard.jobcard_importancelevel);

		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
        var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
        var ano = (new Date()).getFullYear();
        var todaydate = dia + "/" + mes + "/" + ano;
		var audittrailComment = "Comentário feito: " + jobcard.jobcard_callcentercomments;

        var todayhours = new Date();
        var todaytime = todayhours.getHours() + ":" + todayhours.getMinutes();

        var procurajobcard = await jobcardprojects.findOne({_id:jobcard.jobcard_id}, {jobcard_linemanager:1, jobcard_tecnicoid:1, jobcard_projectnumber:1, jobcard_site:1, jobcard_tecniconome:1}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find project");
			}
		}).lean();


		var audittrailObject = {};

	    audittrailObject.jobcard_audittrailname = userData.nome;
	    audittrailObject.jobcard_audittrailaction = audittrailComment;
	    audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todaytime;

		var commentObject = {};

		commentObject.jobcard_commentname = userData.nome;
		commentObject.jobcard_comment = jobcard.jobcard_callcentercomments;
		commentObject.jobcard_commentpriority = jobcard.jobcard_importancelevel;

	    var procuralinemanager = await model.findOne({nome:procurajobcard.jobcard_linemanager}, {email:1, idioma:1}, function(err,dataUser){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}else{
				console.log("Find User")

			}
		}).lean();

		var procuratecnico = await model.findOne({_id:procurajobcard.jobcard_tecnicoid}, {email:1, idioma:1}, function(err,dataUser){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}else{
				console.log("Find User")

			}
		}).lean();


		emailSender.createConnection();
		emailSender.sendEmailCallcenterCommentsProjects(procurajobcard, procuratecnico, userData.nome, jobcard.jobcard_callcentercomments);

		emailSender.createConnection();
		emailSender.sendEmailCallcenterCommentsProjects(procurajobcard, procuralinemanager, userData.nome, jobcard.jobcard_callcentercomments);

	    
		jobcardprojects.updateOne({_id:jobcard.jobcard_id},{$set:{data_ultimaactualizacaojobcard:new Date()}, $push:{jobcard_callcentercomments:jobcard.jobcard_callcentercomments,jobcard_audittrail:audittrailObject,jobcard_prioritycomments:commentObject}}, function(err, data1){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados" + err)
			}
			else{

				console.log("Project update");
			}

		});
		

	});

	router.post("/updatecallcentercomments",  upload.any(), async function(req, res){

		var userData= req.session.usuario;
		var jobcard = req.body;

		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
        var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
        var ano = (new Date()).getFullYear();
        var todaydate = dia + "/" + mes + "/" + ano;
		var audittrailComment = "Comentário feito: " + jobcard.jobcard_callcentercomments;

        var todayhours = new Date();
        var todaytime = todayhours.getHours() + ":" + todayhours.getMinutes();

        var procurajobcard = await jobcards.findOne({_id:jobcard.jobcard_id}, {jobcard_linemanagerid:1, jobcard_tecnicoid:1, jobcard_siteid:1, jobcard_ttnumber:1, jobcard_site:1, jobcard_tecniconome:1, jobcard_jobtype:1}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find jobcard");
			}
		}).lean();


		var audittrailObject = {};

	    audittrailObject.jobcard_audittrailname = userData.nome;
	    audittrailObject.jobcard_audittrailaction = audittrailComment;
	    audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todaytime;

		var commentObject = {};

		commentObject.jobcard_commentname = userData.nome;
		commentObject.jobcard_comment = jobcard.jobcard_callcentercomments;
		commentObject.jobcard_commentpriority = jobcard.jobcard_importancelevel;

	    var procuralinemanager = await model.findOne({_id:procurajobcard.jobcard_linemanagerid}, {email:1}, function(err,dataUser){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}else{
				console.log("Find User")

			}
		}).lean();

		var procuratecnico = await model.findOne({_id:procurajobcard.jobcard_tecnicoid}, {email:1, idioma:1}, function(err,dataUser){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}else{
				console.log("Find User")

			}
		}).lean();

		if(procurajobcard.jobcard_siteid != ""){

			var procurasiteinfo = await siteinfos.findOne({_id:procurajobcard.jobcard_siteid}, function(err,dataUser){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}else{
					console.log("Find Site")

				}
			}).lean();
		}else{
			var procurasiteinfo = {};
			procurasiteinfo.siteinfo_sitename = "";
		}

		

		var mailrecip = [];
		mailrecip.push(procuralinemanager.email);
		mailrecip.push(procuratecnico.email);

		if(procurajobcard.jobcard_jobtype == "Callout"){

			emailSender.createConnection();
			emailSender.sendEmailCallcenterComments(procurajobcard, mailrecip, procuratecnico, userData.nome, jobcard.jobcard_callcentercomments, procurasiteinfo);

		}else{

			emailSender.createConnection();
			emailSender.sendEmailCallcenterCommentsPlanned(procurajobcard, mailrecip, procuratecnico, userData.nome, jobcard.jobcard_callcentercomments, procurasiteinfo);

		}

	    
		jobcards.updateOne({_id:jobcard.jobcard_id},{$set:{data_ultimaactualizacaojobcard:new Date()},$push:{jobcard_callcentercomments:jobcard.jobcard_callcentercomments,jobcard_audittrail:audittrailObject,jobcard_prioritycomments:commentObject}}, function(err, data1){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados" + err)
			}
			else{

				console.log("Jobcard update");
			}

		});
		

	});


	router.post("/tomaraccaoprioridadedifftecnicoproject",  upload.any(), async function(req, res){

		var userData= req.session.usuario;
		var jobcard = req.body;


		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
        var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
        var ano = (new Date()).getFullYear();
        var todaydate = dia + "/" + mes + "/" + ano;

        var todayhours = new Date();
        var todaytime = todayhours.getHours() + ":" + todayhours.getMinutes();


        var procurajobcard = await jobcardprojects.findOne({_id:jobcard.jobcard_id}, function(err, data){
			if(err){
            	console.log(err);
       		}else{
        		console.log("Find Jobcard");
        	}
		});

		//id do tecnico antigo
		var jobcard_tecniconomeantigo = procurajobcard.jobcard_tecniconome;
		var jobcard_tecnicoidantigo = procurajobcard.jobcard_tecnicoid;

		//procurar antigo tecnico
		var procuratecnico = await model.findOne({_id:jobcard_tecnicoidantigo}, function(err,dataUser){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}else{
				console.log("Find User")

			}
		});

		// procura novo tecnico
		var procurauser = await model.findOne({_id:jobcard.jobcard_tecnicoid1}, function(err,dataUser){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}else{
				console.log("Find User")

			}
		});

		jobcard.jobcard_tecniconome = procurauser.nome;
		jobcard.jobcard_regiao = procurauser.regiao;
		jobcard.jobcard_cell = procurauser.telefone_1;
		jobcard.jobcard_linemanager = procurauser.nome_supervisor;


		jobcard.jobcard_controlador = [1];
		var arrayintervenientes = procurajobcard.jobcard_controladorintervenientes;
		console.log(arrayintervenientes)
		arrayintervenientes[1] = procurauser.nome;
		arrayintervenientes[2] = procurauser.nome_supervisor;
		jobcard.jobcard_controladorintervenientes = arrayintervenientes;
		jobcard.ttnumber_status = "New";
		jobcard.jobcard_estadoactual = "New";
		jobcard.jobcard_wait = "nao";
		jobcard.geolocationJobcardInfo = [];

		var procuralinemanager = await model.findOne({nome:procurauser.nome_supervisor}, function(err,dataUser){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}else{
				console.log("Find User")

			}
		});

		jobcard.jobcard_linemanagerid = procuralinemanager._id;
		jobcard.jobcard_linemanagercell = procuralinemanager.telefone_1;


		var audittrailObject = {};

	    audittrailObject.jobcard_audittrailname = userData.nome;
	    audittrailObject.jobcard_audittrailaction = "Changed the technician " + jobcard_tecniconomeantigo + " by the technician " + jobcard.jobcard_tecniconome;
	    audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todaytime;


	    var procuracallcenter = await model.findOne({nome:arrayintervenientes[0]}, function(err,dataUser){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}else{
					console.log("Find User")

				}
			});

	    	emailSender.createConnection();
	    	//mandar para o tecnicoantigo
			emailSender.sendEmailTecnicoChangeJobWaitProject(procurajobcard, procuratecnico, jobcard.jobcard_holdreason);
			// mandar para o call center
			emailSender.sendEmailCallCenterTecnicoChangeJobWaitProject(procurajobcard, procuratecnico, procurauser, jobcard.jobcard_holdreason, procuracallcenter);
			// mandar para o tecnico novo
			procurajobcard.jobcard_tecniconome = procurauser.nome;
			emailSender.sendEmailCreateProject(procurajobcard, procurauser, procuralinemanager);
			


		jobcardprojects.updateOne({_id:jobcard.jobcard_id},{$set:{jobcard_estadoactual:jobcard.jobcard_estadoactual, jobcard_holdreason:jobcard.jobcard_holdreason,jobcard_holdaction:jobcard.jobcard_holdaction,jobcard_controlador:jobcard.jobcard_controlador, jobcard_controladorintervenientes:jobcard.jobcard_controladorintervenientes, ttnumber_status:jobcard.ttnumber_status, jobcard_tecnicoid:jobcard.jobcard_tecnicoid1, jobcard_tecniconome:jobcard.jobcard_tecniconome, jobcard_regiao:jobcard.jobcard_regiao, jobcard_cell:jobcard.jobcard_cell, jobcard_linemanager:jobcard.jobcard_linemanager, jobcard_linemanagerid:jobcard.jobcard_linemanagerid, jobcard_linemanagercell:jobcard.jobcard_linemanagercell, jobcard_wait:jobcard.jobcard_wait, geolocationJobcardInfo:jobcard.geolocationJobcardInfo},$unset:{jobcard_tecarrivaldate:"", jobcard_tecarrivaltime:"", jobcard_sitearrivaldate:"", jobcard_sitearrivaltime:"", jobcard_sitedeparturedate:"", jobcard_sitedeparturetime:"", jobcard_tecarrivalduration:"", jobcard_arrivaldepartureduration:"", jobcard_workstatus:"", jobcard_remedialaction:"", jobcard_healthsafety:"", jobcard_hsreason:"", jobcard_healthsafety:""}, $push:{jobcard_audittrail:audittrailObject}}, function(err, data1){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados" + err)
			}
			else{

				console.log("Jobcard update");
			}

		});
		

	});

	router.post("/tomaraccaoprioridadedifftecnico",  upload.any(), async function(req, res){

		var userData= req.session.usuario;
		var jobcard = req.body;

		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
        var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
        var ano = (new Date()).getFullYear();
        var todaydate = dia + "/" + mes + "/" + ano;

        var todayhours = new Date();
        var todaytime = todayhours.getHours() + ":" + todayhours.getMinutes();


        var procurajobcard = await jobcards.findOne({_id:jobcard.jobcard_id}, {jobcard_tecniconome:1, jobcard_tecnicoid:1, jobcard_controladorintervenientes:1, jobcard_siteid:1, jobcard_jobtype:1, jobcard_ttnumber:1, jobcard_site:1, jobcard_linemanager:1, jobcard_site:1, jobcard_jobinfo:1, jobcard_datareporte:1, jobcard_horareporte:1, jobcard_clientenome:1}, function(err, data){
			if(err){
            	console.log(err);
       		}else{
        		console.log("Find Jobcard");
        	}
		}).lean();

		//id do tecnico antigo
		var jobcard_tecniconomeantigo = procurajobcard.jobcard_tecniconome;
		var jobcard_tecnicoidantigo = procurajobcard.jobcard_tecnicoid;

		//procurar antigo tecnico
		var procuratecnico = await model.findOne({_id:jobcard_tecnicoidantigo}, {email:1, idioma:1}, function(err,dataUser){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}else{
				console.log("Find Old Technician")

			}
		}).lean();

		// procura novo tecnico
		var procurauser = await model.findOne({_id:jobcard.jobcard_tecnicoid1}, {nome:1, regiao:1, telefone_1:1, nome_supervisor:1, email:1, idioma:1}, function(err,dataUser){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}else{
				console.log("Find New Technician")

			}
		}).lean();

		jobcard.jobcard_tecniconome = procurauser.nome;
		jobcard.jobcard_regiao = procurauser.regiao;
		jobcard.jobcard_cell = procurauser.telefone_1;
		jobcard.jobcard_linemanager = procurauser.nome_supervisor;


		// jobcard.jobcard_controlador = [1];
		var arrayintervenientes = procurajobcard.jobcard_controladorintervenientes;
		console.log(arrayintervenientes)
		arrayintervenientes[1] = procurauser.nome;
		arrayintervenientes[2] = procurauser.nome_supervisor;
		jobcard.jobcard_controladorintervenientes = arrayintervenientes;
		// jobcard.ttnumber_status = "New";
		jobcard.jobcard_wait = "sim";
		jobcard.geolocationJobcardInfo = [];

		var procuralinemanager = await model.findOne({nome:procurauser.nome_supervisor}, {telefone_1:1, email:1}, function(err,dataUser){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}else{
				console.log("Find User")

			}
		}).lean();

		jobcard.jobcard_linemanagerid = procuralinemanager._id;
		jobcard.jobcard_linemanagercell = procuralinemanager.telefone_1;


		var audittrailObject = {};

	    audittrailObject.jobcard_audittrailname = userData.nome;
	    // audittrailObject.jobcard_audittrailaction = "Changed the technician " + jobcard_tecniconomeantigo + " by the technician " + jobcard.jobcard_tecniconome + ". Reason: " + jobcard.jobcard_holdreason;
	    audittrailObject.jobcard_audittrailaction = "A equipa do tecnico " + jobcard_tecniconomeantigo + " foi trocada pela equipa do técnico " + jobcard.jobcard_tecniconome + ". Razão: " + jobcard.jobcard_holdreason;

	    audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todaytime;


	    if(procurajobcard.jobcard_siteid != ""){
		    var procurasiteinfo = await siteinfos.findOne({_id:procurajobcard.jobcard_siteid}, {siteinfo_sitename:1}, function(err, data){
				if(err){
	            	console.log(err);
	       		}else{
	        		console.log("Find Site");
	        	}
			}).lean();	
	    }else{
	    	var procurasiteinfo = {};
	    	procurasiteinfo.siteinfo_sitename = "";

	    }

		var procuracallcenter = await model.find({funcao:"Call Center"}, {idioma:1, email:1, nome:1, telefone_1:1}, function(err,dataUser){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}else{
					console.log("Find User")

				}
			}).lean();

			var mailrecip = [];
			for(var i=0; i<procuracallcenter.length; i++){
				mailrecip.push(procuracallcenter[i].email);
			}

	    if(procurajobcard.jobcard_jobtype == "Callout"){

	    	jobcard.jobcard_estadoactual = "On hold";

	    	emailSender.createConnection();
	    	//mandar para o tecnicoantigo
			emailSender.sendEmailTecnicoChangeJobWait(procurajobcard, procurasiteinfo, procuratecnico, jobcard.jobcard_holdreason);
			// mandar para o call center
			emailSender.sendEmailCallCenterTecnicoChangeJobWait(procurajobcard, procurasiteinfo, procurauser, jobcard.jobcard_holdreason, mailrecip);
			// mandar para o tecnico novo
			procurajobcard.jobcard_tecniconome = procurauser.nome;
			emailSender.sendEmailCreateTTNumber(procurajobcard, procurauser, procuralinemanager, procurasiteinfo);


	    }else{

			if(procurajobcard.jobcard_estadoactual == "Planned"){
				jobcard.jobcard_estadoactual = "Planned";
			}else{
				jobcard.jobcard_estadoactual = "On hold";
			}

	    	emailSender.createConnection();
	    	//mandar para o tecnicoantigo
			emailSender.sendEmailTecnicoChangeJobWaitPlanned(procurajobcard, procurasiteinfo, procuratecnico, jobcard.jobcard_holdreason);
	    	//mandar para o tecnico novo
	    	emailSender.sendEmailTecnicoReceiveNewJobPlanned(procurajobcard, procurauser, procuralinemanager, procurasiteinfo);

	    }


		jobcards.updateOne({_id:jobcard.jobcard_id},{$set:{data_ultimaactualizacaojobcard:new Date(), jobcard_estadoactual:jobcard.jobcard_estadoactual, jobcard_holdreason:jobcard.jobcard_holdreason,jobcard_holdaction:jobcard.jobcard_holdaction, jobcard_wait:jobcard.jobcard_wait, jobcard_controladorintervenientes:jobcard.jobcard_controladorintervenientes, jobcard_tecnicoid:jobcard.jobcard_tecnicoid1, jobcard_tecniconome:jobcard.jobcard_tecniconome, jobcard_regiao:jobcard.jobcard_regiao, jobcard_cell:jobcard.jobcard_cell, jobcard_linemanager:jobcard.jobcard_linemanager, jobcard_linemanagerid:jobcard.jobcard_linemanagerid, jobcard_linemanagercell:jobcard.jobcard_linemanagercell, jobcard_wait:jobcard.jobcard_wait, geolocationJobcardInfo:jobcard.geolocationJobcardInfo},$unset:{jobcard_traveldurationms:"",jobcard_travelduration:"",jobcard_traveldistance:"",jobcard_estimahorachegada:"", jobcard_estimadadatachegadams:"", jobcard_estimadadatachegada:"",jobcard_tecarrivaldate:"", jobcard_tecarrivaltime:"", jobcard_sitearrivaldate:"", jobcard_sitearrivaltime:"", jobcard_sitedeparturetime:"", jobcard_tecarrivalduration:"", jobcard_arrivaldepartureduration:"", jobcard_workstatus:"", jobcard_remedialaction:"", jobcard_healthsafety:"", jobcard_hsreason:"", jobcard_healthsafety:""}, $push:{jobcard_audittrail:audittrailObject}}, function(err, data1){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados" + err)
			}
			else{

				console.log("Jobcard update");
			}

		});
		

	});


	router.post("/tomaraccaoprioridadesametecnicoproject",  upload.any(), async function(req, res){

		var userData= req.session.usuario;
		var jobcard = req.body;

		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
        var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
        var ano = (new Date()).getFullYear();
        var todaydate = dia + "/" + mes + "/" + ano;

        var todayhours = new Date();
        var todaytime = todayhours.getHours() + ":" + todayhours.getMinutes();


        var procurajobcard = await jobcardprojects.findOne({_id:jobcard.jobcard_id}, {jobcard_tecnicoid:1,jobcard_controladorintervenientes:1, }, function(err, data){
			if(err){
            	console.log(err);
       		}else{
        		console.log("Find Jobcard");
        	}
		}).lean();


		jobcard.jobcard_controlador = [1];
		
		jobcard.ttnumber_status = "New";
		jobcard.jobcard_estadoactual = "New";
		jobcard.jobcard_wait = "sim";
		jobcard.geolocationJobcardInfo = [];


		var audittrailObject = {};

	    audittrailObject.jobcard_audittrailname = userData.nome;
	    audittrailObject.jobcard_audittrailaction = "Put the project on hold";
	    audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todaytime;

	    

		var procuratecnico = await model.findOne({_id:procurajobcard.jobcard_tecnicoid}, function(err,dataUser){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}else{
				console.log("Find User")

			}
		});

		var procuracallcenter = await model.findOne({nome:procurajobcard.jobcard_controladorintervenientes[0]}, function(err,dataUser){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}else{
					console.log("Find User")

				}
			});

	    	emailSender.createConnection();
			emailSender.sendEmailTecnicoJobWaitProject(procurajobcard, procuratecnico, jobcard.jobcard_holdreason);

			emailSender.createConnection();
			emailSender.sendEmailTecnicoJobWaitProject(procurajobcard, procuracallcenter, jobcard.jobcard_holdreason);


		jobcardprojects.updateOne({_id:jobcard.jobcard_id},{$set:{jobcard_estadoactual:jobcard.jobcard_estadoactual,jobcard_holdreason:jobcard.jobcard_holdreason,jobcard_holdaction:jobcard.jobcard_holdaction,jobcard_controlador:jobcard.jobcard_controlador, ttnumber_status:jobcard.ttnumber_status, jobcard_wait:jobcard.jobcard_wait, geolocationJobcardInfo:jobcard.geolocationJobcardInfo},$unset:{jobcard_tecarrivaldate:"", jobcard_tecarrivaltime:"", jobcard_sitearrivaldate:"", jobcard_sitearrivaltime:"", jobcard_sitedeparturedate:"", jobcard_sitedeparturetime:"", jobcard_tecarrivalduration:"", jobcard_arrivaldepartureduration:"", jobcard_workstatus:"", jobcard_remedialaction:"", jobcard_healthsafety:"", jobcard_hsreason:"", jobcard_healthsafety:""}, $push:{jobcard_audittrail:audittrailObject}}, function(err, data1){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados" + err)
			}
			else{

				console.log("Jobcard update");
			}

		});
		

	});


	router.post("/tomaraccaoprioridadesametecnico",  upload.any(), async function(req, res){

		var userData= req.session.usuario;
		var jobcard = req.body;

		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
        var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
        var ano = (new Date()).getFullYear();
        var todaydate = dia + "/" + mes + "/" + ano;

        var todayhours = new Date();
        var todaytime = todayhours.getHours() + ":" + todayhours.getMinutes();


        var procurajobcard = await jobcards.findOne({_id:jobcard.jobcard_id}, {jobcard_siteid:1, jobcard_tecnicoid:1, jobcard_controladorintervenientes:1, jobcard_jobtype:1, jobcard_ttnumber:1, jobcard_site:1, jobcard_linemanager:1, jobcard_site:1}, function(err, data){
			if(err){
            	console.log(err);
       		}else{
        		console.log("Find Jobcard");
        	}
		}).lean();


		// jobcard.jobcard_controlador = [1];
		
		// jobcard.ttnumber_status = "New";
		jobcard.jobcard_estadoactual = "On hold";
		jobcard.jobcard_wait = "sim";
		jobcard.geolocationJobcardInfo = [];


		var audittrailObject = {};

	    audittrailObject.jobcard_audittrailname = userData.nome;
	    audittrailObject.jobcard_audittrailaction = "Jobcard posto em espera. Motivo: " + jobcard.jobcard_holdreason;
	    audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todaytime;

	    if(procurajobcard.jobcard_siteid != ""){
		    var procurasiteinfo = await siteinfos.findOne({_id:procurajobcard.jobcard_siteid}, {siteinfo_sitename:1}, function(err, data){
				if(err){
	            	console.log(err);
	       		}else{
	        		console.log("Find Jobcard");
	        	}
			}).lean();	
	    }else{
	    	var procurasiteinfo = {};
	    	procurasiteinfo.siteinfo_sitename = "";

	    }


		var procuratecnico = await model.findOne({_id:procurajobcard.jobcard_tecnicoid}, {email:1, idioma:1}, function(err,dataUser){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}else{
				console.log("Find User")

			}
		}).lean();
		var mailrecip = [];
		mailrecip.push(procuratecnico.email);

		var procuracallcenter = await model.find({funcao:"Call Center"}, {email:1}, function(err,dataUser){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}else{
				console.log("Find User")

			}
		}).lean();

		for(var i=0; i<procuracallcenter.length; i++){
			mailrecip.push(procuracallcenter[i].email);
		}

	    if(procurajobcard.jobcard_jobtype == "Callout"){

	    	emailSender.createConnection();
			emailSender.sendEmailTecnicoJobWait(procurajobcard, procurasiteinfo, jobcard.jobcard_holdreason, mailrecip);

	    }else{

	    	emailSender.createConnection();
			emailSender.sendEmailTecnicoJobWaitPlanned(procurajobcard, procurasiteinfo, mailrecip, jobcard.jobcard_holdreason);
	    }

	    

		jobcards.updateOne({_id:jobcard.jobcard_id},{$set:{data_ultimaactualizacaojobcard:new Date(), ttnumber_status:"In Progress", jobcard_estadoactual:jobcard.jobcard_estadoactual,jobcard_holdreason:jobcard.jobcard_holdreason,jobcard_holdaction:jobcard.jobcard_holdaction, jobcard_wait:jobcard.jobcard_wait, geolocationJobcardInfo:jobcard.geolocationJobcardInfo},$unset:{jobcard_traveldurationms:"",jobcard_travelduration:"",jobcard_traveldistance:"",jobcard_estimahorachegada:"", jobcard_estimadadatachegadams:"", jobcard_estimadadatachegada:1, jobcard_tecarrivaldate:"", jobcard_tecarrivaltime:"", jobcard_sitearrivaldate:"", jobcard_sitearrivaltime:"", jobcard_sitedeparturedate:"", jobcard_sitedeparturetime:"", jobcard_tecarrivalduration:"", jobcard_arrivaldepartureduration:"", jobcard_workstatus:"", jobcard_remedialaction:"", jobcard_healthsafety:"", jobcard_hsreason:"", jobcard_healthsafety:""}, $push:{jobcard_audittrail:audittrailObject}}, function(err, data1){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados" + err)
			}
			else{

				console.log("Jobcard update");
			}

		});
		

	});


	router.post("/updatesamegenerator",  upload.any(), async function(req, res){
		
		var userData= req.session.usuario;
		var jobcard = req.body;


		var procurajobcard = await jobcards.findOne({_id:jobcard.jobcard_id}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find generator");
			}
		});


		var procurasite = await siteinfos.findOne({_id:procurajobcard.jobcard_siteid}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find generator");
			}
		});

		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
        var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
        var ano = (new Date()).getFullYear();
        var todaydate = dia + "/" + mes + "/" + ano;
        var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

        

        var arrAudit = procurajobcard.jobcard_audittrail;
		console.log(arrAudit)
		var lastaudittrail = arrAudit[arrAudit.length-1];

		if((lastaudittrail.jobcard_audittrailname == userData.nome) && (lastaudittrail.jobcard_audittrailaction == "Update Jobcard")){

        arrAudit[arrAudit.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

	    }else{

	      var jobcard_audittrailObject = {};
	      // jobcard_audittrailObject._id = "";
	      jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
	      jobcard_audittrailObject.jobcard_audittrailaction = "Update Jobcard";
	      jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
	      arrAudit.push(jobcard_audittrailObject);
	    }

	    jobcard.jobcard_audittrail = arrAudit;

	    var posicaogenerator = procurasite.siteinfo_generatorArray.findIndex(x => x._id == jobcard.jobcard_generator);


	    var procurageneratorhistory = await generatorhistory.find({gerador_registoid:jobcard.geradorantigo,gerador_jobcardrefid:jobcard.jobcard_id,gerador_siterefid:procurajobcard.jobcard_siteid}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find generator");
			}
		}).sort({_id:-1});;

	    var procurageneratorhistoryreg = procurageneratorhistory[0]._id;


		jobcards.updateOne({_id:jobcard.jobcard_id, "generatorArrayJobcard._id":jobcard.jobcard_generatorid},{$set:{jobcard_audittrail:jobcard.jobcard_audittrail, "generatorArrayJobcard.$.jobcard_currentgeneratorhours":jobcard.jobcard_currentgeneratorhours, "generatorArrayJobcard.$.jobcard_generatorrefuel":jobcard.jobcard_generatorrefuel, "generatorArrayJobcard.$.jobcard_litersoil":jobcard.jobcard_litersoil, "generatorArrayJobcard.$.jobcard_dsc":jobcard.jobcard_dsc, "generatorArrayJobcard.$.jobcard_refuelreason":jobcard.jobcard_refuelreason, "generatorArrayJobcard.$.jobcard_generatorbeenserviced":jobcard.jobcard_generatorbeenserviced}}, function(err, data1){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados" + err)
			}
			else{
				siteinfos.updateOne({_id:procurajobcard.jobcard_siteid, "siteinfo_generatorArray._id":jobcard.jobcard_generator},{$set:{"siteinfo_generatorArray.$.siteinfo_generatorhours":jobcard.jobcard_currentgeneratorhours}}, function(err, data1){
						if(err){
							console.log("ocorreu um erro ao tentar aceder os dados" + err)
						}
						else{
							generatorhistory.updateOne({_id:procurageneratorhistoryreg}, {$set:{gerador_actualhours:jobcard.jobcard_currentgeneratorhours, gerador_registousernome:userData.nome, gerador_registouserid:userData._id}}, function(err){
                                if(err){
                                    console.log("Ocorreu um erro ao tentar gravar os dados!\n contacte o administrador do sistema");
                                    console.log(err)
                                }
                                else {
                                    console.log("Generator History Done");
                                }
                            });
						}
					});

			}
		});

	});


	router.post("/updatedifferentgenerator",  upload.any(), async function(req, res){
		
		var userData= req.session.usuario;
		var jobcard = req.body;


		var procurajobcard = await jobcards.findOne({_id:jobcard.jobcard_id}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find generator");
			}
		});


		var procurasite = await siteinfos.findOne({_id:procurajobcard.jobcard_siteid}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find generator");
			}
		});



		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
        var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
        var ano = (new Date()).getFullYear();
        var todaydate = dia + "/" + mes + "/" + ano;
        var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

        

        var arrAudit = procurajobcard.jobcard_audittrail;
		console.log(arrAudit)
		var lastaudittrail = arrAudit[arrAudit.length-1];

		if((lastaudittrail.jobcard_audittrailname == userData.nome) && (lastaudittrail.jobcard_audittrailaction == "Update Jobcard")){

        arrAudit[arrAudit.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

	    }else{

	      var jobcard_audittrailObject = {};
	      // jobcard_audittrailObject._id = "";
	      jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
	      jobcard_audittrailObject.jobcard_audittrailaction = "Update Jobcard";
	      jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
	      arrAudit.push(jobcard_audittrailObject);
	    }

	    jobcard.jobcard_audittrail = arrAudit;

	    var posicaogenerator = procurasite.siteinfo_generatorArray.findIndex(x => x._id == jobcard.jobcard_generator);

		jobcard.jobcard_generatorname = procurasite.siteinfo_generatorArray[posicaogenerator].siteinfo_generatortype + ' - ' + procurasite.siteinfo_generatorArray[posicaogenerator].siteinfo_generatorengineserialnumber;


	    var procurageneratorhistory = await generatorhistory.find({gerador_registoid:jobcard.geradorantigo,gerador_jobcardrefid:jobcard.jobcard_id,gerador_siterefid:procurajobcard.jobcard_siteid}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Find generator");
			}
		}).sort({_id:-1});;

	    var procurageneratorhistoryreg = procurageneratorhistory[0]._id;


		jobcards.updateOne({_id:jobcard.jobcard_id, "generatorArrayJobcard._id":jobcard.jobcard_generatorid},{$set:{jobcard_audittrail:jobcard.jobcard_audittrail, "generatorArrayJobcard.$.jobcard_generatorname":jobcard.jobcard_generatorname, "generatorArrayJobcard.$.jobcard_generator":jobcard.jobcard_generator,"generatorArrayJobcard.$.jobcard_previousrefuelhrs":jobcard.jobcard_previousrefuelhrs,"generatorArrayJobcard.$.jobcard_currentgeneratorhours":jobcard.jobcard_currentgeneratorhours, "generatorArrayJobcard.$.jobcard_generatorrefuel":jobcard.jobcard_generatorrefuel, "generatorArrayJobcard.$.jobcard_litersoil":jobcard.jobcard_litersoil, "generatorArrayJobcard.$.jobcard_dsc":jobcard.jobcard_dsc, "generatorArrayJobcard.$.jobcard_refuelreason":jobcard.jobcard_refuelreason, "generatorArrayJobcard.$.jobcard_generatorbeenserviced":jobcard.jobcard_generatorbeenserviced}}, function(err, data1){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados" + err)
			}
			else{
				siteinfos.updateOne({_id:procurajobcard.jobcard_siteid, "siteinfo_generatorArray._id":jobcard.jobcard_generator},{$set:{"siteinfo_generatorArray.$.siteinfo_generatorhours":jobcard.jobcard_currentgeneratorhours}}, function(err, data1){
						if(err){
							console.log("ocorreu um erro ao tentar aceder os dados" + err)
						}
						else{
							generatorhistory.updateOne({_id:procurageneratorhistoryreg}, {$set:{gerador_registoid:jobcard.jobcard_generator, gerador_registonome:jobcard.jobcard_generatorname, gerador_previoushours:jobcard.jobcard_previousrefuelhrs,gerador_actualhours:jobcard.jobcard_currentgeneratorhours, gerador_registousernome:userData.nome, gerador_registouserid:userData._id}}, function(err){
                                if(err){
                                    console.log("Ocorreu um erro ao tentar gravar os dados!\n contacte o administrador do sistema");
                                    console.log(err)
                                }
                                else {
                                	siteinfos.updateOne({_id:procurajobcard.jobcard_siteid, "siteinfo_generatorArray._id":jobcard.geradorantigo},{$set:{"siteinfo_generatorArray.$.siteinfo_generatorhours":jobcard.geradorhoursantigas}}, function(err, data1){
                                    	
                                    	if(err){
                                    		console.log("Ocorreu um erro ao tentar gravar os dados!\n contacte o administrador do sistema");
                                    		console.log(err);
                                    	}else{

                                    		console.log("Generator History Done");

                                    	}
                                   	});
                                }
                            });
						}
					});

			}
		});

	});


	router.post("/updatetableequipment",  upload.any(), function(req, res){
		var userData= req.session.usuario;
		var jobcard = req.body;

			jobcards.findOneAndUpdate({_id:jobcard.jobcard_id, "equipamentoArrayJobcard._id":jobcard.jobcard_equipmentid},{$set:{"equipamentoArrayJobcard.$.jobcard_equiptype":jobcard.jobcard_equiptype, "equipamentoArrayJobcard.$.jobcard_manufacturer":jobcard.jobcard_manufacturer, "equipamentoArrayJobcard.$.jobcard_model":jobcard.jobcard_model, "equipamentoArrayJobcard.$.jobcard_serialnumber":jobcard.jobcard_serialnumber, "equipamentoArrayJobcard.$.jobcard_capacity":jobcard.jobcard_capacity, "equipamentoArrayJobcard.$.jobcard_type":jobcard.jobcard_type}}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}else{

				}
			});
		
	});

router.post("/editjobcardproject", upload.any(), async function(req, res){
	var userData= req.session.usuario;
	var jobcard = req.body;
	// console.log(jobcard)
	
	var jobcard_siteArray = [];
	var jobcard_sitecontrolador = jobcard.jobcard_site;

	if(Array.isArray(jobcard_sitecontrolador)){

		for( i = 0; i < jobcard_sitecontrolador.length; i++){
			jobcard_siteArray.push(jobcard_sitecontrolador[i]);
		}

	}else{
		jobcard_siteArray.push(jobcard_sitecontrolador);

	}

	jobcard.jobcard_site = jobcard_siteArray;

	var procuracliente = await clientes.findOne({_id:jobcard.jobcard_clienteid}, {cliente_nome:1, cliente_filial:1, cliente_telefone:1}, function(err,dataCliente){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}else{
			console.log("Find Client")

		}
	}).lean();

	jobcard.jobcard_clientenome = procuracliente.cliente_nome;
	jobcard.jobcard_clientebranch = procuracliente.cliente_filial;
	jobcard.jobcard_clientetelefone = procuracliente.cliente_telefone;


	var procuraproject = await jobcardprojects.findOne({_id:jobcard.jobcard_id}, {jobcard_audittrail:1, jobcard_tecnicoid:1, jobcard_linemanagerid:1, jobcard_projectnumber:1, jobcard_site:1, cliente_nome:1}, function(err,dataProject){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}else{
			console.log("Find Project")

		}
	}).lean();


	var arrAudit = procuraproject.jobcard_audittrail;
	var lastaudittrail = arrAudit[arrAudit.length-1];

	var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
    var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
    var ano = (new Date()).getFullYear();
    var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

	if((lastaudittrail.jobcard_audittrailname == userData.nome) && (lastaudittrail.jobcard_audittrailaction == "Update Project")){

        arrAudit[arrAudit.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

    }else{

      var jobcard_audittrailObject = {};
      
      jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
      jobcard_audittrailObject.jobcard_audittrailaction = "Update Jobcard";
      jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
      arrAudit.push(jobcard_audittrailObject);
    }

    jobcard.jobcard_audittrail = arrAudit;


	var procuratecnico = await model.findOne({_id:procuraproject.jobcard_tecnicoid}, {email:1, idioma:1, nome:1}, function(err,dataUser){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}else{
			console.log("Find Technician")

		}
	}).lean();


    var procuralinemanager = await model.findOne({_id:procuraproject.jobcard_linemanagerid}, {email:1}, function(err,dataUser){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}else{
			console.log("Find Line Manager")

		}
	}).lean();

	if((procuraproject.jobcard_projectnumber != jobcard.jobcard_projectnumber) && (procuraproject.jobcard_site != jobcard.jobcard_site)){

    	emailSender.createConnection();
		emailSender.sendEmailUpdatedProject(procuraproject, jobcard, procuratecnico, procuralinemanager, userData);
    
    }else{
    	emailSender.createConnection();
		emailSender.sendEmailUpdatedProject1(procuraproject, jobcard, procuratecnico, procuralinemanager, userData);
    }

    jobcardprojects.findOneAndUpdate({_id:jobcard.jobcard_id},{$set:{data_ultimaactualizacaojobcard:new Date(),jobcard_audittrail:jobcard.jobcard_audittrail,jobcard_clienteid:jobcard.jobcard_clienteid, jobcard_clientenome:jobcard.jobcard_clientenome, jobcard_clientebranch:jobcard.jobcard_clientebranch, jobcard_clientetelefone:jobcard.jobcard_clientetelefone, jobcard_departamento:jobcard.jobcard_departamento, jobcard_projectnumber:jobcard.jobcard_projectnumber, jobcard_site:jobcard.jobcard_site, jobcard_jobinfo:jobcard.jobcard_jobinfo}}, function(err, data){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}else{

		}
	});

	

});


router.post("/novojobcardproject", upload.any(), async function(req, res){
	var userData= req.session.usuario;
	var jobcard = req.body;
	// console.log(jobcard)
	
	var jobcard_siteArray = [];
	var jobcard_sitecontrolador = jobcard.jobcard_site;

	if(Array.isArray(jobcard_sitecontrolador)){

		for( i = 0; i < jobcard_sitecontrolador.length; i++){
			jobcard_siteArray.push(jobcard_sitecontrolador[i]);
		}

	}else{
		jobcard_siteArray.push(jobcard_sitecontrolador);

	}

	jobcard.jobcard_site = jobcard_siteArray;

	var cont5 = req.body.jobcard_jobtype;
	var posicaodados, cont, cont1, cont2, cont3, cont4, cont6, cont7, cont8, cont9;
	var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
    var year = ((new Date()).getFullYear() + "").split("");
    var ano = year[2] + year[3];

    
	cont6 = "CCO/Project/" + mes + "/" + ano;
	
	
	var procura = await jobcardprojects.find({}, {jobcard_cod:1}, function(err, data){
		if(err){
            console.log(err);
        }else{
        	console.log("Find Projects");
        }
	}).sort({_id:1}).lean();

	var procurauser = await model.findOne({_id:jobcard.jobcard_tecnicoid}, {nome:1, regiao:1, telefone_1:1, nome_supervisor:1, email:1, idioma:1}, function(err,dataUser){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}else{
			console.log("Find User")

		}
	}).lean();

	jobcard.jobcard_tecniconome = procurauser.nome;
	jobcard.jobcard_regiao = procurauser.regiao;
	jobcard.jobcard_cell = procurauser.telefone_1;
	// jobcard.jobcard_linemanager = procurauser.nome_supervisor;
	console.log("**************************************************************");
	console.log(jobcard.jobcard_departamento);
	console.log("**************************************************************");
	if (jobcard.jobcard_departamento == "Data Center") {
		jobcard.jobcard_linemanager = "Teresa Guimaraes"
	}else{
		jobcard.jobcard_linemanager = procurauser.nome_supervisor;
	}
	console.log("O novo line manager é "+jobcard.jobcard_linemanager);

	var procuracliente = await clientes.findOne({_id:jobcard.jobcard_clienteid}, {cliente_nome:1, cliente_filial:1, cliente_telefone:1}, function(err,dataUser){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}else{
			console.log("Find User")

		}
	}).lean();

	jobcard.jobcard_clientenome = procuracliente.cliente_nome;
	jobcard.jobcard_clientebranch = procuracliente.cliente_filial;
	jobcard.jobcard_clientetelefone = procuracliente.cliente_telefone;



	var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
    var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
    var ano = (new Date()).getFullYear();
    var todaydate = dia + "/" + mes + "/" + ano;
    jobcard.data_registojobcard1 = todaydate;

	jobcard.jobcard_loggedon = todaydate;
	jobcard.jobcard_controlador = [1];
	jobcard.jobcard_loggedby = userData.nome;

	var arrayintervenientes = [];
    arrayintervenientes.push(userData.nome);
    arrayintervenientes.push(jobcard.jobcard_tecniconome);
    arrayintervenientes.push(jobcard.jobcard_linemanager);

    jobcard.jobcard_controladorintervenientes = arrayintervenientes;

    var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

    var arrayaudittrail = [];
    var audittrailObject = {};

    audittrailObject.jobcard_audittrailname = userData.nome;
    audittrailObject.jobcard_audittrailaction = "Create Project";
    audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

    arrayaudittrail.push(audittrailObject);

    jobcard.jobcard_audittrail = arrayaudittrail;
    jobcard.jobcard_wait = "nao";


    var procuralinemanager = await model.findOne({nome:jobcard.jobcard_linemanager}, {telefone_1:1, email:1}, function(err,dataUser){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}else{
			console.log("Find User")

		}
	}).lean();

	jobcard.jobcard_linemanagerid = procuralinemanager._id;
	jobcard.jobcard_linemanagercell = procuralinemanager.telefone_1;
	jobcard.jobcard_estadoactual = "New";
	jobcard.jobcard_workstatus = "";


	emailSender.createConnection();
	emailSender.sendEmailCreateProject(jobcard,procurauser, procuralinemanager);
	
	

	if(procura.length == 0){

		cont2 = cont6 + "/0001";
        cont1 = 1;

        jobcard.jobcard_cod = cont2;

        jobcardprojects.gravarDados(jobcard, function(err, data){
        	if(err){
        		if(err.code == 11000){

        			cont3 = parseInt(cont1) + 1;

        			if(cont3 < 10){
				        cont4 = cont6 + "/000" + cont3;
				    }else 
				        if((cont3 > 10) && (cont3 < 100) ){
				            cont4 = cont6 + "/00" + cont3;
				        }else
				            if((cont3 > 100) && (cont3 < 1000) ){
				                cont4 = cont6 + "/0" + cont3;
				            }else{
				                cont4 = cont6 + "/" + cont3;
				            }

				    jobcard.jobcard_cod = cont4;
				    jobcardprojects.gravarDados(jobcard, function(err, data){
				        if(err){
				        	console.log("Ocorreu um erro ao tentar gravar os dados!\n contacte o administrador do sistema");
							console.log(err); 
				        }else{
				            console.log("dados gravados com sucesso!!");
				            res.redirect("/inicio");
				        }
				    });

        		}else{

        			console.log("Ocorreu um erro ao tentar gravar os dados!\n contacte o administrador do sistema");
					console.log(err)
        		}
        	}else{
        		console.log("Jobcard gravado com sucesso.");
				res.redirect("/inicio");
        	}
        });

	}else{

		cont = procura[procura.length-1].jobcard_cod.split("/");
		cont1 = parseInt(cont[4]) + 1;

		if(cont1 < 10){
        	cont2 = cont6 + "/000" + cont1;
        }else 
            if((cont1 > 10) && (cont1 < 100) ){
                cont2 = cont6 + "/00" + cont1;
            }else
                if((cont1 > 100) && (cont1 < 1000) ){
                    cont2 = cont6 + "/0" + cont1;
                }else{
                    cont2 = cont6 + "/" + cont1;
                }

        jobcard.jobcard_cod = cont2;

        jobcardprojects.gravarDados(jobcard, function(err, data){
        	if(err){
        		if(err.code == 11000){

        			cont3 = parseInt(cont1) + 1;

        			if(cont3 < 10){
				        cont4 = cont6 + "/000" + cont3;
				    }else 
				        if((cont3 > 10) && (cont3 < 100) ){
				            cont4 = cont6 + "/00" + cont3;
				        }else
				            if((cont3 > 100) && (cont3 < 1000) ){
				                cont4 = cont6 + "/0" + cont3;
				            }else{
				                cont4 = cont6 + "/" + cont3;
				            }

				    jobcard.jobcard_cod = cont4;
				    jobcardprojects.gravarDados(jobcard, function(err, data){
				        if(err){
				        	console.log("Ocorreu um erro ao tentar gravar os dados!\n contacte o administrador do sistema");
							console.log(err); 
				        }else{
				            console.log("dados gravados com sucesso!!");
				            res.redirect("/inicio");
				        }
				    });

        		}else{

        			console.log("Ocorreu um erro ao tentar gravar os dados!\n contacte o administrador do sistema");
					console.log(err)

        		}
        	}else{
        		console.log("Jobcard gravado com sucesso.");
				res.redirect("/inicio");
        	}
        });

	}

});

router.post("/novojobcard", upload.any(), async function(req, res){
	var userData= req.session.usuario;
	var jobcard = req.body;
	var prioridade = userData.jobcard_priority;
	console.log(jobcard)
	console.log("********************************************* "+jobcard.jobcard_priority+" ******************************************************************");
	var restorationhrs = [];
	
	var jobcard_callArray = [];
	var jobcard_callcontrolador = jobcard.jobcard_call;

	if(Array.isArray(jobcard_callcontrolador)){

		for( i = 0; i < jobcard_callcontrolador.length; i++){
			jobcard_callArray.push(jobcard_callcontrolador[i]);
		}

	}else{
		jobcard_callArray.push(jobcard_callcontrolador);

	}

	jobcard.jobcard_call = jobcard_callArray;

	var jobcard_jobinfoArray = [];
	var jobcard_jobinfocontrolador = jobcard.jobcard_jobinfo;

	if(Array.isArray(jobcard_jobinfocontrolador)){

		for( i = 0; i < jobcard_jobinfocontrolador.length; i++){
			jobcard_jobinfoArray.push(jobcard_jobinfocontrolador[i]);
		}

	}else{
		jobcard_jobinfoArray.push(jobcard_jobinfocontrolador);

	}

	jobcard.jobcard_jobinfo = jobcard_jobinfoArray;

	var cont5 = req.body.jobcard_jobtype;
	var posicaodados, cont, cont1, cont2, cont3, cont4, cont6, cont7, cont8, cont9;
	var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
    var year = ((new Date()).getFullYear() + "").split("");
    var ano = year[2] + year[3];
	var now = Date.now();
	console.log("Agora",now);

    
	cont6 = "CCO/" + mes + "/" + ano;
	
	
	var procura = await jobcards.find({jobcard_jobtype:"Callout"}, {jobcard_cod:1}, function(err, data){
		if(err){
            console.log(err);
        }else{
        	console.log("Find Jobcard");
        }
	}).sort({_id:1}).lean();

	var procurauser = await model.findOne({_id:jobcard.jobcard_tecnicoid}, {nome:1, regiao:1, telefone_1:1, procurauser:1, nome_supervisor:1, email:1, idioma:1}, function(err,dataUser){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}else{
			console.log("Find User")

		}
	});

	jobcard.jobcard_tecniconome = procurauser.nome;
	jobcard.jobcard_regiao = procurauser.regiao;
	jobcard.jobcard_cell = procurauser.telefone_1;
	// jobcard.jobcard_linemanager = procurauser.nome_supervisor;
	console.log("**************************************************************");
	console.log(jobcard.jobcard_departamento);
	console.log("**************************************************************");
	if (jobcard.jobcard_departamento == "Data Center") {
		jobcard.jobcard_linemanager = "Teresa Guimaraes"
	}else{
		jobcard.jobcard_linemanager = procurauser.nome_supervisor;
	}
	console.log("O novo line manager é "+jobcard.jobcard_linemanager);

	var procuracliente = await clientes.findOne({_id:jobcard.jobcard_clienteid}, {cliente_nome:1, cliente_filial:1, cliente_telefone:1}, function(err,dataUser){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}else{
			console.log("Find User")

		}
	});

	jobcard.jobcard_clientenome = procuracliente.cliente_nome;
	jobcard.jobcard_clientebranch = procuracliente.cliente_filial;
	jobcard.jobcard_clientetelefone = procuracliente.cliente_telefone;

	var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
    var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
    var ano = (new Date()).getFullYear();
    var todaydate = dia + "/" + mes + "/" + ano;

    jobcard.data_registojobcard1 = todaydate;

	jobcard.jobcard_loggedon = todaydate;
	jobcard.jobcard_controlador = [1];
	jobcard.jobcard_loggedby = userData.nome;
	
	jobcard.data_registojobcardms = now;
	var arrayintervenientes = [];
    arrayintervenientes.push(userData.nome);
    arrayintervenientes.push(jobcard.jobcard_tecniconome);
    arrayintervenientes.push(jobcard.jobcard_linemanager);

    jobcard.jobcard_controladorintervenientes = arrayintervenientes;

    var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

    var arrayaudittrail = [];
    var audittrailObject = {};

    audittrailObject.jobcard_audittrailname = userData.nome;
    audittrailObject.jobcard_audittrailaction = "Create TT number";
    audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

    arrayaudittrail.push(audittrailObject);

    jobcard.jobcard_audittrail = arrayaudittrail;
    jobcard.jobcard_wait = "nao";
	jobcard.jobcard_priority;
	jobcard.jobcard_escalationlevel = "0";


    var procuralinemanager = await model.findOne({nome:jobcard.jobcard_linemanager}, {telefone_1:1, email:1}, function(err,dataUser){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}else{
			console.log("Find User")

		}
	});

	jobcard.jobcard_linemanagerid = procuralinemanager._id;
	jobcard.jobcard_linemanagercell = procuralinemanager.telefone_1;
	jobcard.jobcard_estadoactual = "New";
	jobcard.jobcard_workstatus = "";

	var procuraclientesites = await siteinfos.aggregate([{$group:{_id:"$siteinfo_clientid", sites:{$push:{numero:"$siteinfo_sitenum", ref:"$_id"}}}}], function (err, dataSiteCliente) {
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}else{
			console.log("Find Client and sites")

		}
	});

	var posicaoclientesite = procuraclientesites.findIndex(x => x._id == jobcard.jobcard_clienteid);


	if(posicaoclientesite != -1){

		var procurasiteinfo = await siteinfos.findOne({_id:jobcard.jobcard_siteid}, {siteinfo_sitenum:1, siteinfo_sitename:1, siteinfo_siteclassif:1}, function(err,dataUser){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}else{
			console.log("Find site");
			if (jobcard_jobinfocontrolador.length == 1) {
                
                if (jobcard_jobinfocontrolador.includes("High Temperature")) {
                    switch (dataUser.siteinfo_siteclassif) {
                        
                        case "CB":
                            jobcard.jobcard_restorationhrs = 2;
                        break;

                        case "BB":
                            jobcard.jobcard_restorationhrs = 2;
                        break;

                        case "RN":
                            jobcard.jobcard_restorationhrs = 3;
                        break;

                        case "CL":
                            jobcard.jobcard_restorationhrs = 3;
                        break;

                        case "DC":
                            jobcard.jobcard_restorationhrs = 3;
                        break;
                        
                    }

                }else if (jobcard_jobinfocontrolador.includes("Battery Low")) {
                    switch (dataUser.siteinfo_siteclassif) {
                        
                        case "CB":
                            jobcard.jobcard_restorationhrs = 2;
                        break;

                        case "BB":
                            jobcard.jobcard_restorationhrs = 2;
                        break;

                        case "RN":
                            jobcard.jobcard_restorationhrs = 3;
                        break;

                        case "CL":
                            jobcard.jobcard_restorationhrs = 2;
                        break;

                        case "DC":
                            jobcard.jobcard_restorationhrs = 4;
                        break;
                        
                    }

                }else if (jobcard_jobinfocontrolador.includes("Generator Abnormal")) {
                    switch (dataUser.siteinfo_siteclassif) {
                        
                        case "CB":
                            jobcard.jobcard_restorationhrs = 3;
                        break;

                        case "BB":
                            jobcard.jobcard_restorationhrs = 3;
                        break;

                        case "RN":
                            jobcard.jobcard_restorationhrs = 4;
                        break;

                        case "CL":
                            jobcard.jobcard_restorationhrs = 3;
                        break;

                        case "DC":
                            jobcard.jobcard_restorationhrs = 4;
                        break;
                        
                    }

                }else if (jobcard_jobinfocontrolador.includes("Generator Low Fuel")) {
                    switch (dataUser.siteinfo_siteclassif) {
                        
                        case "CB":
                            jobcard.jobcard_restorationhrs = 6;
                        break;

                        case "BB":
                            jobcard.jobcard_restorationhrs = 6;
                        break;

                        case "RN":
                            jobcard.jobcard_restorationhrs = 8;
                        break;

                        case "CL":
                            jobcard.jobcard_restorationhrs = 6;
                        break;

                        case "DC":
                            jobcard.jobcard_restorationhrs = 8;
                        break;
                        
                    }

                }else if (jobcard_jobinfocontrolador.includes("Rectifier System")) {
                    switch (dataUser.siteinfo_siteclassif) {
                        
                        case "CB":
                            jobcard.jobcard_restorationhrs = 2;
                        break;

                        case "BB":
                            jobcard.jobcard_restorationhrs = 2;
                        break;

                        case "RN":
                            jobcard.jobcard_restorationhrs = 3;
                        break;

                        case "CL":
                            jobcard.jobcard_restorationhrs = 3;
                        break;

                        case "DC":
                            jobcard.jobcard_restorationhrs = 3;
                        break;
                        
                    }
                }
            }else{
                if((jobcard_jobinfocontrolador.includes("High Temperature") && dataUser.siteinfo_siteclassif =="CB") ||
                (jobcard_jobinfocontrolador.includes("High Temperature") && dataUser.siteinfo_siteclassif =="BB") ||
                (jobcard_jobinfocontrolador.includes("Battery Low") && dataUser.siteinfo_siteclassif =="CB") || 
                (jobcard_jobinfocontrolador.includes("Battery Low") && dataUser.siteinfo_siteclassif =="BB") ||
                (jobcard_jobinfocontrolador.includes("Battery Low") && dataUser.siteinfo_siteclassif =="CL") ||
                (jobcard_jobinfocontrolador.includes("Rectifier System") && dataUser.siteinfo_siteclassif =="CB") ||
                (jobcard_jobinfocontrolador.includes("Rectifier System") && dataUser.siteinfo_siteclassif =="BB") ){
					restorationhrs.push(2);
					// jobcard.jobcard_restorationhrs = 2;
                }

                if ((jobcard_jobinfocontrolador.includes("High Temperature") && dataUser.siteinfo_siteclassif =="RN") ||
                (jobcard_jobinfocontrolador.includes("High Temperature") && dataUser.siteinfo_siteclassif =="CL") ||
                (jobcard_jobinfocontrolador.includes("High Temperature") && dataUser.siteinfo_siteclassif =="DC") || 
                (jobcard_jobinfocontrolador.includes("Battery Low") && dataUser.siteinfo_siteclassif =="RN") || 
                (jobcard_jobinfocontrolador.includes("Generator Abnormal") && dataUser.siteinfo_siteclassif =="CB") || 
                (jobcard_jobinfocontrolador.includes("Generator Abnormal") && dataUser.siteinfo_siteclassif =="BB") || 
                (jobcard_jobinfocontrolador.includes("Generator Abnormal") && dataUser.siteinfo_siteclassif =="CL") || 
                (jobcard_jobinfocontrolador.includes("Rectifier System") && dataUser.siteinfo_siteclassif =="RN") ||
                (jobcard_jobinfocontrolador.includes("Rectifier System") && dataUser.siteinfo_siteclassif =="CL") ||
                (jobcard_jobinfocontrolador.includes("Rectifier System") && dataUser.siteinfo_siteclassif =="DC") ) {
                    //jobcard.jobcard_restorationhrs = 3;
					restorationhrs.push(3);
                }

                if ((jobcard_jobinfocontrolador.includes("Battery Low") && dataUser.siteinfo_siteclassif =="DC") ||
                (jobcard_jobinfocontrolador.includes("Generator Abnormal") && dataUser.siteinfo_siteclassif =="RN") ||
                (jobcard_jobinfocontrolador.includes("Generator Abnormal") && dataUser.siteinfo_siteclassif =="DC")) {
                    // jobcard.jobcard_restorationhrs = 4;
					restorationhrs.push(4);
                }

                if((jobcard_jobinfocontrolador.includes("Generator Low Fuel") && dataUser.siteinfo_siteclassif =="CB") ||
                (jobcard_jobinfocontrolador.includes("Generator Low Fuel") && dataUser.siteinfo_siteclassif =="BB") || 
                (jobcard_jobinfocontrolador.includes("Generator Low Fuel") && dataUser.siteinfo_siteclassif =="CL") ){
                    // jobcard.jobcard_restorationhrs = 6;
					restorationhrs.push(6);
                }

                if((jobcard_jobinfocontrolador.includes("Generator Low Fuel") && dataUser.siteinfo_siteclassif =="RN") ||
                (jobcard_jobinfocontrolador.includes("Generator Low Fuel") && dataUser.siteinfo_siteclassif =="DC")){
                    // jobcard.jobcard_restorationhrs = 8;
					restorationhrs.push(8);
                }
            }

			
				console.log("Array das horas",restorationhrs);
				jobcard.jobcard_restorationhrs = restorationhrs.sort((a,b) => {a-b})[0];

			}
		});

		jobcard.jobcard_site = procurasiteinfo.siteinfo_sitenum;
		jobcard.jobcard_siteclassif = procurasiteinfo.siteinfo_siteclassif;


		emailSender.createConnection();
		emailSender.sendEmailCreateTTNumber(jobcard,procurauser, procuralinemanager, procurasiteinfo);

	}else{


		var procurasiteinfo = {}

		jobcard.jobcard_site = jobcard.jobcard_siteid;
		jobcard.jobcard_siteid = "";
		procurasiteinfo.siteinfo_sitename = "";


		emailSender.createConnection();
		emailSender.sendEmailCreateTTNumber(jobcard,procurauser, procuralinemanager, procurasiteinfo);

	}

	
	
	

	if(procura.length == 0){

		cont2 = cont6 + "/0001";
        cont1 = 1;

        jobcard.jobcard_cod = cont2;

        jobcards.gravarDados(jobcard, function(err, data){
        	if(err){
        		if(err.code == 11000){

        			cont3 = parseInt(cont1) + 1;

        			if(cont3 < 10){
				        cont4 = cont6 + "/000" + cont3;
				    }else 
				        if((cont3 > 10) && (cont3 < 100) ){
				            cont4 = cont6 + "/00" + cont3;
				        }else
				            if((cont3 > 100) && (cont3 < 1000) ){
				                cont4 = cont6 + "/0" + cont3;
				            }else{
				                cont4 = cont6 + "/" + cont3;
				            }

				    jobcard.jobcard_cod = cont4;
				    jobcards.gravarDados(jobcard, function(err, data){
				        if(err){
				        	console.log("Ocorreu um erro ao tentar gravar os dados!\n contacte o administrador do sistema");
							console.log(err); 
				        }else{
				            console.log("dados gravados com sucesso!!");
				            res.redirect("/inicio");
				        }
				    });

        		}else{

        			console.log("Ocorreu um erro ao tentar gravar os dados!\n contacte o administrador do sistema");
					console.log(err)
        		}
        	}else{
        		console.log("Jobcard gravado com sucesso.");
				res.redirect("/inicio");
        	}
        });

	}else{

		cont = procura[procura.length-1].jobcard_cod.split("/");
		cont1 = parseInt(cont[3]) + 1;

		if(cont1 < 10){
        	cont2 = cont6 + "/000" + cont1;
        }else 
            if((cont1 > 10) && (cont1 < 100) ){
                cont2 = cont6 + "/00" + cont1;
            }else
                if((cont1 > 100) && (cont1 < 1000) ){
                    cont2 = cont6 + "/0" + cont1;
                }else{
                    cont2 = cont6 + "/" + cont1;
                }

        jobcard.jobcard_cod = cont2;

        jobcards.gravarDados(jobcard, function(err, data){
        	if(err){
        		if(err.code == 11000){

        			cont3 = parseInt(cont1) + 1;

        			if(cont3 < 10){
				        cont4 = cont6 + "/000" + cont3;
				    }else 
				        if((cont3 > 10) && (cont3 < 100) ){
				            cont4 = cont6 + "/00" + cont3;
				        }else
				            if((cont3 > 100) && (cont3 < 1000) ){
				                cont4 = cont6 + "/0" + cont3;
				            }else{
				                cont4 = cont6 + "/" + cont3;
				            }

				    jobcard.jobcard_cod = cont4;
				    jobcards.gravarDados(jobcard, function(err, data){
				        if(err){
				        	console.log("Ocorreu um erro ao tentar gravar os dados!\n contacte o administrador do sistema");
							console.log(err); 
				        }else{
				            console.log("dados gravados com sucesso!!");
				            res.redirect("/inicio");
				        }
				    });

        		}else{

        			console.log("Ocorreu um erro ao tentar gravar os dados!\n contacte o administrador do sistema");
					console.log(err)
        		}
        	}else{
        		console.log("Jobcard gravado com sucesso.");
				res.redirect("/inicio");
        	}
        });

	}

});

	router.post("/aprovarjobcardproject",  upload.any(), async function(req, res){
		var userData= req.session.usuario;
		var jobcard = req.body;
		jobcard.jobcard_estadoactual = "Approved";


		var procura = await jobcardprojects.findOne({_id:jobcard.jobcard_id}, {jobcard_tecnicoid:1, jobcard_projectnumber:1, jobcard_linemanager:1, jobcard_projectnumber:1, jobcard_site:1}, function(err, data){
			if(err){
            	console.log(err);
       		}else{
        		console.log("Find Jobcard");
        	}
		}).lean();

		var procurauser = await model.findOne({_id:procura.jobcard_tecnicoid}, {idioma:1, email:1}, function(err,dataUser){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}else{
				console.log("Find User")

			}
		}).lean();

	


		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
		  var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
		  var ano = (new Date()).getFullYear();
		  var todaydate = dia + "/" + mes + "/" + ano;
		  var todayhours = new Date().getHours() + ":" + new Date().getMinutes();


		  var jobcard_audittrail = {};
		  jobcard_audittrail.jobcard_audittrailname = userData.nome;
		  jobcard_audittrail.jobcard_audittrailaction = "Job Card Approved";
		  jobcard_audittrail.jobcard_audittraildate = todaydate + "  " + todayhours;


		  	

	  		emailSender.createConnection();
			emailSender.sendEmailSendJobcardApprovedProject(procura,procurauser);


			jobcardprojects.findOneAndUpdate({_id:jobcard.jobcard_id},{$set:{data_ultimaactualizacaojobcard:new Date(), jobcard_estadoactual:jobcard.jobcard_estadoactual,ttnumber_status:jobcard.ttnumber_status}, $push:{jobcard_controlador:1, jobcard_audittrail:jobcard_audittrail}}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
					//console.log(data);
					res.redirect("/inicio");
				}
			});

	});

	router.post("/aprovarjobcard",  upload.any(), async function(req, res){
		var userData= req.session.usuario;
		var jobcard = req.body;
		jobcard.jobcard_estadoactual = "Approved";
		jobcard.jobcard_backofficeagent = userData.nome;


		var procura = await jobcards.findOne({_id:jobcard.jobcard_id}, {jobcard_controladorintervenientes:1,jobcard_audittrail:1, jobcard_linemanagerid:1, jobcard_tecnicoid:1, jobcard_siteid:1, jobcard_jobtype:1, jobcard_ttnumber:1, jobcard_site:1, jobcard_linemanager:1}, function(err, data){
			if(err){
            	console.log(err);
       		}else{
        		console.log("Find Jobcard");
        	}
		}).lean();

		var procurauser = await model.findOne({_id:procura.jobcard_tecnicoid}, {idioma:1, email:1}, function(err,dataUser){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}else{
				console.log("Find User")

			}
		}).lean();

		var procuralinemanager = await model.findOne({_id:procura.jobcard_linemanagerid}, {idioma:1, email:1}, function(err,dataUser){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}else{
				console.log("Find Line Manager")

			}
		}).lean();

		// console.log(procuralinemanager)

		  var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
		  var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
		  var ano = (new Date()).getFullYear();
		  var todaydate = dia + "/" + mes + "/" + ano;
		  var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

		 var arrAudit = procura.jobcard_audittrail;
		var lastaudittrail = arrAudit[arrAudit.length-1];

		if((lastaudittrail.jobcard_audittrailname == userData.nome) && (lastaudittrail.jobcard_audittrailaction == "Job Card Approved")){

        arrAudit[arrAudit.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

	    }else{

	      var jobcard_audittrailObject = {};
	      // jobcard_audittrailObject._id = "";
	      jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
	      jobcard_audittrailObject.jobcard_audittrailaction = "Job Card Approved";
	      jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
	      arrAudit.push(jobcard_audittrailObject);
	    }

	    var jobcard_audittrail = arrAudit;

	    var arrIntervenientes = procura.jobcard_controladorintervenientes;
		var lastperson = arrIntervenientes[arrIntervenientes.length-1];
	    
		var jobcard_controladorintervenientes = arrIntervenientes;
	    
	    if(lastperson != userData.nome){

        	jobcard_controladorintervenientes.push(userData.nome)

	    }

	    var jobcard_audittrail = arrAudit;


		  if(procura.jobcard_siteid != ""){
			var procurasiteinfo = await siteinfos.findOne({_id:procura.jobcard_siteid}, {siteinfo_sitename:1}, function(err,dataUser){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}else{
					console.log("Find Site")

				}
			}).lean();


		  }else{

		  	var procurasiteinfo = {};

		  	procurasiteinfo.siteinfo_sitename = "";

		  }

		  	


		  	if(procura.jobcard_jobtype == "Callout"){

		  		emailSender.createConnection();
				emailSender.sendEmailSendJobcardApproved(procura,procurauser,procurasiteinfo);

				emailSender.createConnection();
				emailSender.sendEmailSendJobcardApproved(procura,procuralinemanager,procurasiteinfo);

		  	}else{

		  		emailSender.createConnection();
				emailSender.sendEmailSendJobcardApprovedPlanned(procura,procurauser,procurasiteinfo);

				emailSender.createConnection();
				emailSender.sendEmailSendJobcardApprovedPlanned(procura,procuralinemanager,procurasiteinfo);
		  	}

		  	jobcard.jobcard_controlador = [1,1,1,1];
		

			jobcards.findOneAndUpdate({_id:jobcard.jobcard_id},{$set:{jobcard_controladorintervenientes:jobcard_controladorintervenientes,jobcard_audittrail:jobcard_audittrail,jobcard_controlador:jobcard.jobcard_controlador,data_ultimaactualizacaojobcard:new Date(),jobcard_estadoactual:jobcard.jobcard_estadoactual,jobcard_backofficeagent:jobcard.jobcard_backofficeagent}}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
					console.log("Approved");
					res.redirect("/inicio");
				}
			});

	});

	router.post("/sendbackjobcardproject",  upload.any(), async function(req, res){
		var userData= req.session.usuario;
		var jobcard = req.body;
		jobcard.jobcard_estadoactual = "Sent Back";


		var procura = await jobcardprojects.findOne({_id:jobcard.jobcard_id}, {jobcard_tecnicoid:1, jobcard_projectnumber:1, jobcard_linemanager:1, jobcard_site:1}, function(err, data){
			if(err){
            	console.log(err);
       		}else{
        		console.log("Find Project");
        	}
		}).lean();

	var procurauser = await model.findOne({_id:procura.jobcard_tecnicoid}, {idioma:1, email:1}, function(err,dataUser){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}else{
			console.log("Find User")

		}
	}).lean();

	
	var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
	  var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
	  var ano = (new Date()).getFullYear();
	  var todaydate = dia + "/" + mes + "/" + ano;
	  var todayhours = new Date().getHours() + ":" + new Date().getMinutes();


	  var jobcard_audittrail = {};
	  jobcard_audittrail.jobcard_audittrailname = userData.nome;
	  jobcard_audittrail.jobcard_audittrailaction = "Sent Back. Reasons: " + jobcard.jobcard_razaoreprovar;
	  jobcard_audittrail.jobcard_audittraildate = todaydate + "  " + todayhours;

	  	emailSender.createConnection();
		emailSender.sendEmailSendJobcardRejectedProject(procura, procurauser, jobcard.jobcard_razaoreprovar);

		
		
		
		jobcardprojects.findOneAndUpdate({_id:jobcard.jobcard_id}, {$push:{jobcard_controlador:0,  jobcard_audittrail:jobcard_audittrail}, $set:{data_ultimaactualizacaojobcard:new Date(),jobcard_estadoactual:jobcard.jobcard_estadoactual,jobcard_razaoreprovar:jobcard.jobcard_razaoreprovar}}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				
				res.redirect("/inicio");
			}
		});

	});

	router.post("/sendbackjobcard",  upload.any(), async function(req, res){
		var userData= req.session.usuario;
		var jobcard = req.body;
		jobcard.jobcard_estadoactual = "Sent Back";
		console.log(userData.funcao);


		var procura = await jobcards.findOne({_id:jobcard.jobcard_id}, {jobcard_tecnicoid:1, jobcard_siteid:1, jobcard_jobtype:1, jobcard_ttnumber:1, jobcard_site:1, jobcard_linemanager:1}, function(err, data){
			if(err){
            	console.log(err);
       		}else{
        		console.log("Find Jobcard");
        	}
		}).lean();

	var procurauser = await model.findOne({_id:procura.jobcard_tecnicoid}, {idioma:1, email:1}, function(err,dataUser){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}else{
			console.log("Find User")

		}
	}).lean();

	

	var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
	  var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
	  var ano = (new Date()).getFullYear();
	  var todaydate = dia + "/" + mes + "/" + ano;
	  var todayhours = new Date().getHours() + ":" + new Date().getMinutes();


	  var jobcard_audittrail = {};
	  jobcard_audittrail.jobcard_audittrailname = userData.nome;
	  jobcard_audittrail.jobcard_audittrailaction = "Sent Back";
	  jobcard_audittrail.jobcard_audittraildate = todaydate + "  " + todayhours;


	  if(procura.jobcard_siteid != ""){

	  	var procurasiteinfo = await siteinfos.findOne({_id:procura.jobcard_siteid}, {siteinfo_sitename:1}, function(err,dataUser){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}else{
				console.log("Find Site")

			}
		}).lean();
	  }else{

	  	var procurasiteinfo = {};

	  	procurasiteinfo.siteinfo_sitename = "";
	  }


	
  		if(procura.jobcard_jobtype == "Callout"){

  			emailSender.createConnection();
			emailSender.sendEmailSendJobcardRejected(procura, procurauser, jobcard.jobcard_razaoreprovar, procurasiteinfo);

  		}else{

  			emailSender.createConnection();
			emailSender.sendEmailSendJobcardRejectedPlanned(procura, procurauser, jobcard.jobcard_razaoreprovar, procurasiteinfo);
  		}

		if(userData.funcao == "Call Center"){
			jobcards.findOneAndUpdate({_id:jobcard.jobcard_id}, {$push:{jobcard_audittrail:jobcard_audittrail}, $set:{data_ultimaactualizacaojobcard:new Date(), jobcard_controlador:[1,1], jobcard_estadoactual:jobcard.jobcard_estadoactual,jobcard_razaoreprovar:jobcard.jobcard_razaoreprovar}}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
					console.log("Sent Back")
					res.redirect("/inicio");
				}
			});
		}else{
			jobcards.findOneAndUpdate({_id:jobcard.jobcard_id}, {$push:{jobcard_controlador:0,  jobcard_audittrail:jobcard_audittrail}, $set:{data_ultimaactualizacaojobcard:new Date(), jobcard_estadoactual:jobcard.jobcard_estadoactual,jobcard_razaoreprovar:jobcard.jobcard_razaoreprovar}}, function(err, data){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}
				else{
					console.log("Sent Back")
					res.redirect("/inicio");
				}
			});
		}

	});

	router.post("/callcenteractionjobcard", upload.any(), async function(req, res){
		var userData= req.session.usuario;
		var referencias = req.body;
		var controlador = [1,1,1,1,1];
		var accao = referencias.callcenter_accao;
		var workstatus;
		var ttnr_status = "Complete";
		
		console.log(req.body);
		console.log("No roteador");

		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
		var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
		var ano = (new Date()).getFullYear();
		var todaydate = dia + "/" + mes + "/" + ano;
		var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

		var jobcard_audittrail = {};
		var jobcard_actionObject = {};

		if(referencias.jobcard_callcenteraction == "Limpar jobcard"){
			callcenter_accao = 1; 
		  }
		  else if(referencias.jobcard_callcenteraction == "Cancelar jobcard"){
			callcenter_accao = 2;
		  }
		  else if(referencias.jobcard_callcenteraction == "Chamada ao tecnico"){
			callcenter_accao = 3;}

			console.log("Call center")
			console.log(callcenter_accao);

		switch (callcenter_accao) {
			case 1: //in case of the jobcard is resolved by itself
				jobcard_audittrail.jobcard_audittrailname = await userData.nome;
				jobcard_audittrail.jobcard_audittrailaction = await "Jobcard resolvido devido a: " +referencias.jobcard_callcenterreason;
				jobcard_audittrail.jobcard_audittraildate = await todaydate + "  " + todayhours;

				jobcard_actionObject.jobcard_callcenteractionname = await userData.nome;
				jobcard_actionObject.jobcard_callcenteraction = await "Clean";
				jobcard_actionObject.jobcard_callcenteractionreason = await referencias.jobcard_callcenterreason;

				workstatus = "Jobcard cleaned";
				console.log("Case 1");
				await jobcards.updateOne({_id:referencias.jobcard_id}, {$push:{jobcard_audittrail, jobcard_callcenteractions:jobcard_actionObject}, $set:{data_ultimaactualizacaojobcard:new Date(), jobcard_controlador:controlador, ttnumber_status:ttnr_status, jobcard_estadoactual:workstatus}}, function(err, data){
					if(err){
						console.log("ocorreu um erro ao tentar aceder os dados")
					}
					else{
						console.log("*****************************Limpo********************************")
					}
				});
			break;

			case 2: //in case of call center cancel jobcard
				jobcard_audittrail.jobcard_audittrailname = userData.nome;
				jobcard_audittrail.jobcard_audittrailaction = "Jobcard cancelado devido a: " +referencias.jobcard_callcenterreason;
				jobcard_audittrail.jobcard_audittraildate = todaydate + "  " + todayhours;

				jobcard_actionObject.jobcard_callcenteractionname = userData.nome;
				jobcard_actionObject.jobcard_callcenteraction = "Cancel";
				jobcard_actionObject.jobcard_callcenteractionreason = referencias.jobcard_callcenterreason;

				workstatus = "Jobcard canceled";
				console.log("Case 2");
				await jobcards.updateOne({_id:referencias.jobcard_id}, {$push:{jobcard_audittrail, jobcard_callcenteractions:jobcard_actionObject}, $set:{data_ultimaactualizacaojobcard:new Date(), jobcard_controlador:controlador, ttnumber_status:ttnr_status, jobcard_estadoactual:workstatus}}, function(err, data){
					if(err){
						console.log("ocorreu um erro ao tentar aceder os dados")
					}
					else{
						console.log("**************************Cancelado***********************")
					}
				});
			break;

			case 3: //in case of call center call technician
				jobcard_audittrail.jobcard_audittrailname = userData.nome;
				jobcard_audittrail.jobcard_audittrailaction = "Chamada ao técnico devido a: " +referencias.jobcard_callcenterreason;
				jobcard_audittrail.jobcard_audittraildate = todaydate + "  " + todayhours;

				jobcard_actionObject.jobcard_callcenteractionname = userData.nome;
				jobcard_actionObject.jobcard_callcenteraction = "Tecnician called";
				jobcard_actionObject.jobcard_callcenteractionreason = referencias.jobcard_callcenterreason;

				console.log("Case 3");
				jobcards.updateOne({_id:referencias.jobcard_id}, {$push:{jobcard_audittrail:jobcard_audittrail, jobcard_callcenteractions:jobcard_actionObject}, $set:{data_ultimaactualizacaojobcard:new Date(), jobcard_controlador:controlador}}, function(err, data){
					if(err){
						console.log("ocorreu um erro ao tentar aceder os dados")
					}
					else{
						console.log("****************************Chamada feita************************************")
					}
				});
			break;
		}

	});


	router.post("/canceljobcard", upload.any(), async function(req, res){
		var userData= req.session.usuario;
		var referencias = req.body;
		var controlador = [1,1,1,1,1];
		var estado = "Canceled";
		var ttnr_status = "Complete";
		console.log(req.body);
		console.log("No roteador");

		var procura = await jobcards.findOne({_id:referencias.idjobcard}, {jobcard_tecnicoid:1, jobcard_siteid:1, jobcard_jobtype:1, jobcard_ttnumber:1, jobcard_site:1, jobcard_linemanager:1}, function(err, data){
			if(err){
            	console.log(err);
       		}else{
        		console.log("Find Jobcard");
        	}
		}).lean();

		var procurauser = await model.findOne({_id:procura.jobcard_tecnicoid}, {idioma:1, email:1}, function(err,dataUser){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}else{
				console.log("Find User")
	
			}
		}).lean();

		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
		var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
		var ano = (new Date()).getFullYear();
		var todaydate = dia + "/" + mes + "/" + ano;
		var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

		var jobcard_audittrail = {};
		jobcard_audittrail.jobcard_audittrailname = userData.nome;
		jobcard_audittrail.jobcard_audittrailaction = "Canceled due to " +referencias.cancel_reason;
		jobcard_audittrail.jobcard_audittraildate = todaydate + "  " + todayhours;

		if(procura.jobcard_siteid != ""){

			var procurasiteinfo = await siteinfos.findOne({_id:procura.jobcard_siteid}, {siteinfo_sitename:1}, function(err,dataUser){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados");
				}else{
					console.log("Find Site")
			  	}
		  }).lean();
		}else{
  
			var procurasiteinfo = {};
  
			procurasiteinfo.siteinfo_sitename = "";
		}
		
		// emailSender.createConnection();
		// emailSender.sendEmailSendJobcardCanceled(procura, procurauser, userData, referencias);

		jobcards.findOneAndUpdate({_id:referencias.idjobcard}, {$push:{jobcard_audittrail:jobcard_audittrail}, $set:{data_ultimaactualizacaojobcard:new Date(), jobcard_controlador:controlador, ttnumber_status:ttnr_status, jobcard_estadoactual:estado}}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("Cancelado")
			}
		});

	});
	
	router.post("/aprovarttnumberproject",  upload.any(), async function(req, res){
		var userData= req.session.usuario;
		var jobcard = req.body;
		console.log(jobcard);
		

		var geolocationJobcardInfo = [];

		var procuraproject = await jobcardprojects.findOne({_id:jobcard.jobcard_id}, {jobcard_linemanagerid:1, jobcard_loggedby:1, jobcard_projectnumber:1, jobcard_tecniconome:1, jobcard_site:1}, function(err,dataProject){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}else{
				console.log("Find Project")

			}
		}).lean();


		var geolocationJobcardInfo2 = {};
		geolocationJobcardInfo2.jobcard_latitude = "";
		geolocationJobcardInfo2.jobcard_longitude = "";
		geolocationJobcardInfo.push(geolocationJobcardInfo2);

		var geolocationJobcardInfo1 = {};
		geolocationJobcardInfo1.jobcard_latitude = jobcard.geolocationlatitude;
		geolocationJobcardInfo1.jobcard_longitude = jobcard.geolocationlongitude;
		geolocationJobcardInfo.push(geolocationJobcardInfo1);


		jobcard.ttnumber_status = "In Progress";
		jobcard.jobcard_controlador = [1, 1];
		jobcard.jobcard_estadoactual = "On route";
		jobcard.jobcard_wait = "nao";


		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
        var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
        var ano = (new Date()).getFullYear();
        var todaydate = dia + "/" + mes + "/" + ano;
        var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

		var jobcard_audittrail = {};

        jobcard_audittrail.jobcard_audittrailname = userData.nome;
        if(jobcard.geomessage == ""){
        	jobcard_audittrail.jobcard_audittrailaction = "Accept the jobcard";
        }else{
        	jobcard_audittrail.jobcard_audittrailaction = "Accept the jobcard. " + jobcard.geomessage;
        }
        
        jobcard_audittrail.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

        jobcard.jobcard_tecarrivaldate = todaydate;
        jobcard.jobcard_tecarrivaltime = todayhours;


		var procuralinemanager = await model.findOne({_id:procuraproject.jobcard_linemanagerid}, {idioma:1, email:1}, function(err,dataUser){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}else{
				console.log("Find User")

			}
		}).lean();

    	var procuracallcenter = await model.findOne({nome:procuraproject.jobcard_loggedby}, {idioma:1, email:1}, function(err,dataUser){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}else{
				console.log("Find User")

			}
		}).lean();


		emailSender.createConnection();
		emailSender.sendEmailAceitarProjecto(procuraproject, procuralinemanager);
		emailSender.createConnection();
		emailSender.sendEmailAceitarProjecto(procuraproject, procuracallcenter);
    

		jobcardprojects.findOneAndUpdate({_id:jobcard.jobcard_id},{$push:{jobcard_audittrail:jobcard_audittrail},$set:{data_ultimaactualizacaojobcard:new Date(),jobcard_wait:jobcard.jobcard_wait,jobcard_estadoactual:jobcard.jobcard_estadoactual,jobcard_tecarrivaldate:jobcard.jobcard_tecarrivaldate, jobcard_tecarrivaltime:jobcard.jobcard_tecarrivaltime, geolocationJobcardInfo:geolocationJobcardInfo,ttnumber_status:jobcard.ttnumber_status, jobcard_controlador:jobcard.jobcard_controlador}}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{

				console.log("Technician Accept the project");
				res.redirect("/inicio");
			}
		});

	});

	router.post("/updateinfoviagem",  upload.any(), async function(req, res){

		var userData= req.session.usuario;
		var jobcard = req.body;

		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
        var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
        var ano = (new Date()).getFullYear();
        var todaydate = dia + "/" + mes + "/" + ano;
        var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

		var jobcard_audittrail = {};

        jobcard_audittrail.jobcard_audittrailname = userData.nome;
        jobcard_audittrail.jobcard_audittrailaction = "Adicionada informação de viagem. Distância: " + jobcard.jobcard_traveldistance + "; Tempo de chegada estimado: " + jobcard.jobcard_travelduration + "; Data e hora estimada de chegada: " + jobcard.jobcard_estimadadatachegada + " " + jobcard.jobcard_estimahorachegada;
        jobcard_audittrail.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
        
        jobcards.updateOne({_id:jobcard.jobcard_id},{$push:{jobcard_audittrail:jobcard_audittrail},$set:{jobcard_traveldistance:jobcard.jobcard_traveldistance, jobcard_travelduration:jobcard.jobcard_travelduration, jobcard_traveldurationms:jobcard.jobcard_traveldurationms, jobcard_estimadadatachegadams:jobcard.jobcard_estimadadatachegadams, jobcard_estimadadatachegada:jobcard.jobcard_estimadadatachegada, jobcard_estimahorachegada:jobcard.jobcard_estimahorachegada}}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados" + err)
			}
			else{

				console.log("Add travel information");
				res.redirect("/inicio");
			}
		});


	});

	router.post("/aprovarttnumber",  upload.any(), async function(req, res){
		var userData= req.session.usuario;
		var jobcard = req.body;
		

		var geolocationJobcardInfo = [];

		var procurajobcard = await jobcards.findOne({_id:jobcard.jobcard_id}, {jobcard_siteid:1, jobcard_linemanagerid:1, jobcard_loggedby:1, jobcard_ttnumber:1, jobcard_site:1, jobcard_tecniconome:1}, function(err,dataJobcard){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}else{
				console.log("Find User")

			}
		}).lean();

		if(procurajobcard.jobcard_siteid != ""){
			var procurasite = await siteinfos.findOne({_id:procurajobcard.jobcard_siteid}, {siteinfo_gps:1, siteinfo_sitename:1}, function(err,dataSiteInfo){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}else{
					console.log("Find Site Info")

				}
			}).lean();

			var geolocationJobcardInfo2 = {};

			if(procurasite.siteinfo_gps.length != 0){

	            
	            geolocationJobcardInfo2.jobcard_latitude = procurasite.siteinfo_gps[0].siteinfo_gpslatitude;
				geolocationJobcardInfo2.jobcard_longitude = procurasite.siteinfo_gps[0].siteinfo_gpslongitude;
				geolocationJobcardInfo.push(geolocationJobcardInfo2);

	        }else{

	            geolocationJobcardInfo2.jobcard_latitude = "";
				geolocationJobcardInfo2.jobcard_longitude = "";
				geolocationJobcardInfo.push(geolocationJobcardInfo2);

	        }

		}else{

			var geolocationJobcardInfo2 = {};

			geolocationJobcardInfo2.jobcard_latitude = "";
			geolocationJobcardInfo2.jobcard_longitude = "";
			geolocationJobcardInfo.push(geolocationJobcardInfo2);

			var procurasite = {};
			procurasite.siteinfo_sitename = "";

		}

		


		var geolocationJobcardInfo1 = {};
		geolocationJobcardInfo1.jobcard_latitude = jobcard.geolocationlatitude;
		geolocationJobcardInfo1.jobcard_longitude = jobcard.geolocationlongitude;
		geolocationJobcardInfo.push(geolocationJobcardInfo1);


		jobcard.ttnumber_status = "In Progress";
		jobcard.jobcard_controlador = [1, 1];
		jobcard.jobcard_estadoactual = "On route";
		jobcard.jobcard_wait = "nao";
		jobcard.jobcard_escalationlevel = "0";


		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
        var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
        var ano = (new Date()).getFullYear();
        var todaydate = dia + "/" + mes + "/" + ano;
        var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

		var jobcard_audittrail = {};

        jobcard_audittrail.jobcard_audittrailname = userData.nome;
        if(jobcard.geomessage == ""){
        	jobcard_audittrail.jobcard_audittrailaction = "Accept the jobcard";
        }else{
        	jobcard_audittrail.jobcard_audittrailaction = "Accept the jobcard. " + jobcard.geomessage;
        }
        jobcard_audittrail.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

        jobcard.jobcard_tecarrivaldate = todaydate;
        jobcard.jobcard_tecarrivaltime = todayhours;


		var procuralinemanager = await model.findOne({_id:procurajobcard.jobcard_linemanagerid}, {email:1, idioma:1}, function(err,dataUser){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}else{
				console.log("Find User")

			}
		}).lean();

		var mailrecip = [];
		mailrecip.push(procuralinemanager.email);

		var procuracallcenterstaff = await model.find({funcao:"Call Center"}, {email:1}, function(err,dataUser){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}else{
				console.log("Find User")

			}
		}).lean();

		for( j = 0; j < procuracallcenterstaff.length; j++){

			mailrecip.push(procuracallcenterstaff[j].email);

		}

	if(procurajobcard.jobcard_loggedby == "Planned"){


		emailSender.createConnection();
		emailSender.sendEmailCallcenterPlanned(procurajobcard, mailrecip, procurasite);


    }else{

		emailSender.createConnection();
		emailSender.sendEmailCallcenter(procurajobcard, mailrecip, procurasite);
    }

		jobcards.findOneAndUpdate({_id:jobcard.jobcard_id},{$push:{jobcard_audittrail:jobcard_audittrail},$set:{data_ultimaactualizacaojobcard:new Date(),jobcard_wait:jobcard.jobcard_wait,jobcard_estadoactual:jobcard.jobcard_estadoactual,jobcard_tecarrivaldate:jobcard.jobcard_tecarrivaldate, jobcard_tecarrivaltime:jobcard.jobcard_tecarrivaltime, geolocationJobcardInfo:geolocationJobcardInfo,ttnumber_status:jobcard.ttnumber_status, jobcard_controlador:jobcard.jobcard_controlador}}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{

				console.log("Technician Accept Jobcard");
				res.redirect("/inicio");
			}
		});

	});



	router.post("/retomarttnumber",  upload.any(), async function(req, res){
		var userData= req.session.usuario;
		var jobcard = req.body;
		console.log(jobcard);
		

		// var geolocationJobcardInfo = [];

		var procurajobcard = await jobcards.findOne({_id:jobcard.jobcard_id}, {jobcard_siteid:1, jobcard_linemanagerid:1, jobcard_loggedby:1, jobcard_ttnumber:1, jobcard_site:1, jobcard_tecniconome:1}, function(err,dataJobcard){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}else{
				console.log("Find User")

			}
		}).lean();


		jobcard.ttnumber_status = "In Progress";
		jobcard.jobcard_controlador = [1, 1];
		jobcard.jobcard_estadoactual = "On route";
		jobcard.jobcard_wait = "nao";


		var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
        var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
        var ano = (new Date()).getFullYear();
        var todaydate = dia + "/" + mes + "/" + ano;
        var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

		var jobcard_audittrail = {};

        jobcard_audittrail.jobcard_audittrailname = userData.nome;
        // if(jobcard.geomessage == ""){
        jobcard_audittrail.jobcard_audittrailaction = "Resume the jobcard";
        // }else{
        // 	jobcard_audittrail.jobcard_audittrailaction = "Resume the jobcard. " + jobcard.geomessage;
        // }
        jobcard_audittrail.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

        jobcard.jobcard_tecarrivaldate = todaydate;
        jobcard.jobcard_tecarrivaltime = todayhours;
		console.log("*************************************************************")
		console.log(jobcard.jobcard_tecarrivaldate, jobcard.jobcard_tecarrivaltime);


		jobcards.findOneAndUpdate({_id:jobcard.jobcard_id},{$push:{jobcard_audittrail:jobcard_audittrail},$set:{data_ultimaactualizacaojobcard:new Date(),jobcard_wait:jobcard.jobcard_wait,jobcard_estadoactual:jobcard.jobcard_estadoactual,jobcard_tecarrivaldate:jobcard.jobcard_tecarrivaldate,jobcard_tecarrivaltime:jobcard.jobcard_tecarrivaltime,ttnumber_status:jobcard.ttnumber_status, jobcard_controlador:jobcard.jobcard_controlador}}, function(err, data){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}
			else{
				console.log("A info que vai");
				console.log("- - - - - - - - - - - - - - - - - - - - - -");
				console.log(data);
				console.log("Technician Accept Jobcard");
				res.redirect("/inicio");
			}
		});

	});




router.get("/novositeinfo",  function(req, res){
	var userData= req.session.usuario;
	console.log(userData);

	clientes.find({}, function(err, dataClientes){

		if(err){
			console.log("Ocorreu um erro ao tentar gravar os dados!\n contacte o administrador do sistema");
			console.log(err)
		}else{
			usuarios.find({}, function(err, dataUsuarios){
				if(err){
					console.log("Ocorreu um erro ao tentar gravar os dados!\n contacte o administrador do sistema");
					console.log(err)
				}else{
					siteinfos.find({}, function(err, dataSiteInfo){
						if(err){
							console.log("Ocorreu um erro ao tentar gravar os dados!\n contacte o administrador do sistema");
							console.log(err)
						}else{
							res.render("site_info", {DataU:userData, Clientes:dataClientes, Clientes1:JSON.stringify(dataClientes), Usuarios:dataUsuarios, Usuarios1:JSON.stringify(dataUsuarios), Siteinfo: dataSiteInfo, title: 'EAGLEI'})
						}
					}).sort({siteinfo_sitenum:1});
					
				}
			}).sort({nome:1});
			
		}

	}).sort({cliente_nome:1});

	
});


router.get("/detalhesCredelecJobcard/:idjobcard",  function(req, res){
    var userData= req.session.usuario;
    // var referenciasiteinfo = req.params.idsiteinfo;
    var referenciajobcard = req.params.idjobcard;

    jobcards.findOne({_id:referenciajobcard}, {jobcard_jobtype:1, jobcard_call:1}, function(err,dataJobcard){
        if(err){
            console.log("ocorreu um erro ao tentar aceder os dados")
        }else{

            res.render("jobcard_detalhesCredelec", {DataU:userData, Jobcard:dataJobcard, title: 'EAGLEI'});
            
        }
    }).lean();

    
});

router.get("/detalhesCredelecJobcard/:idjobcard/:idindex",  function(req, res){
	var userData= req.session.usuario;
	var idcredelecjobcard = req.params.idindex;
	var referenciajobcard = req.params.idjobcard;

	jobcards.findOne({_id:referenciajobcard}, {jobcard_controladorintervenientes:1,jobcard_jobtype:1, jobcard_call:1, jobcard_siteid:1, jobcard_credelecinfo:1}, function(err,dataJobcard){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}else{

			var posicaoindex = dataJobcard.jobcard_credelecinfo.findIndex(x => x._id == idcredelecjobcard);
			console.log(dataJobcard.jobcard_credelecinfo[posicaoindex]);

			res.render("jobcard_detalhesCredelec", {DataU:userData, DadoinfoCredelec:JSON.stringify(dataJobcard.jobcard_credelecinfo[posicaoindex]), DadosJobcardDetalhes:JSON.stringify(dataJobcard), JobcardDetalhes:dataJobcard, DadosIdcredelecinfojobcard:idcredelecjobcard, posicao:posicaoindex,title: 'EAGLEI'});
			
		}
	}).lean();

	
});


router.get("/detalhesGeradorJobcard/:idjobcard",  function(req, res){
	var userData= req.session.usuario;
	var referenciasiteinfo = req.params.idsiteinfo;
	var referenciajobcard = req.params.idjobcard;

	jobcards.findOne({_id:referenciajobcard}, {jobcard_jobtype:1, jobcard_call:1, jobcard_siteid:1}, function(err,dataJobcard){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}else{

			siteinfos.find({_id:dataJobcard.jobcard_siteid}, {siteinfo_generatorArray:1}, function(err, dataSiteInfo){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}else{
					// console.log(dataSiteInfo)
					res.render("jobcard_detalhesGerador", {DataU:userData, DadosSiteInfo:JSON.stringify(dataSiteInfo), Jobcard:dataJobcard, SiteInfo:dataSiteInfo,title: 'EAGLEI'});
					
				}

			}).lean();
			
		}
	}).lean();

	
});

router.get("/detalhesJobcardGerador/:idjobcard/:idindex",  function(req, res){
	var userData= req.session.usuario;
	var idgeradorjobcard = req.params.idindex;
	var referenciajobcard = req.params.idjobcard;

	jobcards.findOne({_id:referenciajobcard}, {jobcard_controladorintervenientes:1,jobcard_jobtype:1, jobcard_call:1, jobcard_siteid:1, generatorArrayJobcard:1}, function(err,dataJobcard){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}else{

			var posicaoindex = dataJobcard.generatorArrayJobcard.findIndex(x => x._id == idgeradorjobcard);
			console.log(dataJobcard.generatorArrayJobcard[posicaoindex])
			siteinfos.find({_id:dataJobcard.jobcard_siteid}, {siteinfo_generatorArray:1}, function(err, dataSiteInfo){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}else{
					console.log(idgeradorjobcard)
					res.render("jobcard_detalhesGerador", {DataU:userData, Dadoinfogerador:JSON.stringify(dataJobcard.generatorArrayJobcard[posicaoindex]), SiteInfo:dataSiteInfo, DadosSiteInfo:JSON.stringify(dataSiteInfo), DadosJobcardDetalhes:JSON.stringify(dataJobcard), JobcardDetalhes:dataJobcard, DadosIdgeradorjobcard:idgeradorjobcard, posicao:posicaoindex,title: 'EAGLEI'});
				}
			});
			
			
		}
	}).lean();

	
});

router.get("/detalhesEquipmentRepairsJobcard/:idjobcard",  function(req, res){
	var userData= req.session.usuario;
	var referenciajobcard = req.params.idjobcard;

	jobcards.findOne({_id:referenciajobcard}, {jobcard_jobtype:1, jobcard_call:1}, function(err,dataJobcard){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}else{

			res.render("jobcard_detalhesEquipmentRepair", {DataU:userData, Jobcard:dataJobcard,title: 'EAGLEI'});
			
		}
	}).lean();

	
});

router.get("/detalhesEquipmentRepairsJobcard/:idjobcard/:idindex",  function(req, res){
	var userData= req.session.usuario;
	var idcequipmentjobcard = req.params.idindex;
	var referenciajobcard = req.params.idjobcard;

	jobcards.findOne({_id:referenciajobcard}, {jobcard_controladorintervenientes:1,jobcard_jobtype:1, jobcard_call:1, jobcard_siteid:1, equipamentoArrayJobcard:1}, function(err,dataJobcard){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}else{

			var posicaoindex = dataJobcard.equipamentoArrayJobcard.findIndex(x => x._id == idcequipmentjobcard);
			console.log(dataJobcard.equipamentoArrayJobcard[posicaoindex]);

			res.render("jobcard_detalhesEquipmentRepair", {DataU:userData, DadoinfoEquipment:JSON.stringify(dataJobcard.equipamentoArrayJobcard[posicaoindex]), DadosJobcardDetalhes:JSON.stringify(dataJobcard), JobcardDetalhes:dataJobcard, DadosIdequipmentjobcard:idcequipmentjobcard, posicao:posicaoindex,title: 'EAGLEI'});
			
		}
	}).lean();

	
});

router.get("/detalhesEquipmentRepairsJobcardProject/:idjobcard",  function(req, res){
	var userData= req.session.usuario;
	var referencia = req.params.idjobcard;

	jobcardprojects.findOne({_id:referencia}, {_id:1}, function(err,dataProject){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}else{
			console.log(dataProject)
			res.render("jobcard_detalhesEquipmentRepair", {DataU:userData, Projects:dataProject,title: 'EAGLEI'});
			
		}
	}).lean();

	
});

router.get("/detalhesSparesUsedJobcardProject/:idproject/:idtecnicosctock",  function(req, res){
	var userData= req.session.usuario;
	var referenciaproject = req.params.idproject;
	var referenciastockpessoal = req.params.idtecnicosctock;

	jobcardprojects.findOne({_id:referenciaproject}, function(err,dataJobcard){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}else{

			armazens.findOne({nome_ref:referenciastockpessoal}, function(err, dataArmazem){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}else{

					spareusedinfos.find({}, function(err, dataSpareusedInfo){
						if(err){
							console.log("ocorreu um erro ao tentar aceder os dados" + err);
						}else{
							res.render("jobcard_detalhesSpareUsed", {DataU:userData, DadosSpareusedInfo:JSON.stringify(dataSpareusedInfo), DadosStockPessoal:JSON.stringify(dataArmazem), StockPessoal:dataArmazem, Projects:dataJobcard, DadosProjectos:JSON.stringify(dataJobcard),title: 'EAGLEI'});
						}
					});

					
				}
			});

		}
	});

	
});


router.get("/detalhesSparesUsedJobcard/:idjobcard/:idtecnicosctock",  function(req, res){
	var userData= req.session.usuario;
	var referenciajobcard = req.params.idjobcard;
	var referenciastockpessoal = req.params.idtecnicosctock;

	jobcards.findOne({_id:referenciajobcard}, {jobcard_site:1, jobcard_jobtype:1, jobcard_call:1}, function(err,dataJobcard){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}else{

			armazens.find({nome_ref:referenciastockpessoal}, function(err, dataArmazem){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}else{
					if(dataArmazem.length != 0){

						var posicaoitemdisponivel = dataArmazem[0].disponibilidade.findIndex(x => x.disponivel != 0);
						// console.log(dataArmazem);

						spareusedinfos.find({spareusedinfo_site:dataJobcard.jobcard_site}, function(err, dataSpareusedInfo){
							if(err){
								console.log("ocorreu um erro ao tentar aceder os dados" + err);
							}else{
								
								res.render("jobcard_detalhesSpareUsed", {DataU:userData, posicaoitemdisponivel:posicaoitemdisponivel,DadosSpareusedInfo:JSON.stringify(dataSpareusedInfo), DadosStockPessoal:JSON.stringify(dataArmazem), StockPessoal:dataArmazem, Jobcard:dataJobcard,title: 'EAGLEI'});
							}
						}).lean();	
					}else{

						res.render("jobcard_detalhesSpareUsed", {DataU:userData, DadosStockPessoal:JSON.stringify(dataArmazem), StockPessoal:dataArmazem, Jobcard:dataJobcard,title: 'EAGLEI'});
					}
					
				}
			}).lean();
			
		}
	}).lean();

	
});


router.get("/detalhesSparesUsedJobcard/:idjobcard/:idtecnicosctock/:idindex",  function(req, res){
	var userData= req.session.usuario;
	var referenciajobcard = req.params.idjobcard;
	var referenciastockpessoal = req.params.idtecnicosctock;
	var dadoIdspareusadojobcard = req.params.idindex;


	jobcards.findOne({_id:referenciajobcard}, {jobcard_controladorintervenientes:1, sparesArrayJobcard:1,jobcard_site:1, jobcard_jobtype:1, jobcard_call:1}, function(err,dataJobcard){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}else{

			var posicaoindex = dataJobcard.sparesArrayJobcard.findIndex(x => x._id == dadoIdspareusadojobcard);
			var usedSpareJobcard = dataJobcard.sparesArrayJobcard[posicaoindex];

			armazens.find({nome_ref:referenciastockpessoal}, function(err, dataArmazem){
				if(err){
					console.log("ocorreu um erro ao tentar aceder os dados")
				}else{

					spareusedinfos.find({spareusedinfo_site:dataJobcard.jobcard_site}, function(err, dataSpareusedInfo){
						if(err){
							console.log("ocorreu um erro ao tentar aceder os dados" + err);
						}else{
							var posicaospare = dataArmazem[0].disponibilidade.findIndex(x => x.referencia == dataJobcard.sparesArrayJobcard[posicaoindex].jobcard_itemid);
							
							if(dataSpareusedInfo.length != 0){
								var posicaosparesitereturned = dataSpareusedInfo[0].spareusedinfo_itemreturned.findIndex(x => x.referenciaitemid == dataJobcard.sparesArrayJobcard[posicaoindex].jobcard_itemid);
								var posicaosparesite = dataSpareusedInfo[0].spareusedinfo_item.findIndex(x => x.referenciaitemid == dataJobcard.sparesArrayJobcard[posicaoindex].jobcard_itemid);
							}

							res.render("jobcard_detalhesSpareUsed", {DataU:userData, usedSpareJobcard:JSON.stringify(usedSpareJobcard),posicaosparesitereturned:posicaosparesitereturned, posicaosparesite:posicaosparesite, posicaospare:posicaospare, posicao:posicaoindex,DadosSpareusedInfo:JSON.stringify(dataSpareusedInfo), DadosStockPessoal:JSON.stringify(dataArmazem), SpareSite:dataSpareusedInfo, StockPessoal:dataArmazem, JobcardDetalhes:dataJobcard,title: 'EAGLEI'});
						}
					}).lean();	
					
					
				}
			}).lean();
			
		}
	}).lean();

	
});

router.get("/saidasite/:idjobcard",  function(req, res){
	var userData= req.session.usuario;
	var referenciajobcard = req.params.idjobcard;
	

	jobcards.findOne({_id:referenciajobcard}, {jobcard_jobtype:1, jobcard_planneddatems:1, jobcard_planneddate5beforems:1, jobcard_planneddate5afterms:1}, function(err,dataJobcard){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}else{

			res.render("jobcard_detalhesSaidaSite", {DataU:userData, DadosJobcard:JSON.stringify(dataJobcard), Jobcard:dataJobcard,title: 'EAGLEI'});
			
		}
	}).lean();

	
});

router.get("/saidasiteproject/:idjobcard",  function(req, res){
	var userData= req.session.usuario;
	var referenciajobcard = req.params.idjobcard;
	

	jobcardprojects.findOne({_id:referenciajobcard}, {jobcard_jobtype:1, jobcard_planneddatems:1, jobcard_planneddate5beforems:1, jobcard_planneddate5afterms:1}, function(err,dataProject){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}else{

			res.render("jobcard_detalhesSaidaSite", {DataU:userData, DadosProjects:JSON.stringify(dataProject), Projects:dataProject,title: 'EAGLEI'});
			
		}
	}).lean();

	
});

router.post("/updateJobcardPlanned/:id",  upload.any(), async function(req, res){

	var userData= req.session.usuario;
	var jobcard = req.body;
	var referencia = req.params.id;
	
	
	var procurajobcard = await jobcards.findOne({_id:referencia},{jobcard_audittrail:1, jobcard_linemanagerid:1, jobcard_tecnicoid:1, jobcard_clienteid:1, jobcard_ttnumber:1, jobcard_siteid:1, jobcard_site:1, jobcard_clientenome:1}, function(err, data){
		if(err){
        	console.log(err);
   		}else{
    		console.log("Find Jobcard");
    	}
	}).lean();

	var arrAudit = procurajobcard.jobcard_audittrail;
	var lastaudittrail = arrAudit[arrAudit.length-1];

	var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
    var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
    var ano = (new Date()).getFullYear();
    var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

	if((lastaudittrail.jobcard_audittrailname == userData.nome) && (lastaudittrail.jobcard_audittrailaction == "Update Jobcard")){

        arrAudit[arrAudit.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

    }else{

      var jobcard_audittrailObject = {};
      // jobcard_audittrailObject._id = "";
      jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
      jobcard_audittrailObject.jobcard_audittrailaction = "Update Jobcard";
      jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
      arrAudit.push(jobcard_audittrailObject);
    }

    jobcard.jobcard_audittrail = arrAudit;

    var procuralinemanager = await model.findOne({_id:procurajobcard.jobcard_linemanagerid}, {email:1}, function(err,dataUser){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}else{
			console.log("Find Line Manager")

		}
	}).lean();

	var procuratecnico = await model.findOne({_id:procurajobcard.jobcard_tecnicoid}, {email:1, idioma:1, nome:1}, function(err,dataUser){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}else{
			console.log("Find Technician")

		}
	}).lean();


	if(procurajobcard.jobcard_siteid != ""){
		var procurasiteinfo = await siteinfos.findOne({_id:procurajobcard.jobcard_siteid}, {siteinfo_sitename:1}, function(err,dataSiteInfoAntigo){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}else{
				console.log("Find Site")
			}
		});
	}else{

		var procurasiteinfo = {}

		procurasiteinfo.siteinfo_sitename = "";
	}


	if((parseInt(procurajobcard.jobcard_ttnumber) != parseInt(jobcard.jobcard_ttnumber)) ){

		emailSender.createConnection();
		emailSender.sendEmailUpdatedJobcardCallCenterPlanned(procurajobcard, jobcard, procuratecnico, procuralinemanager, userData, procurasiteinfo);
	
	}else{

		emailSender.createConnection();
		emailSender.sendEmailUpdatedJobcardCallCenter1Planned(procurajobcard, procuratecnico, procuralinemanager, userData, procurasiteinfo);
	}

    jobcards.findOneAndUpdate({_id:referencia},{$set:{ data_ultimaactualizacaojobcard:new Date(),jobcard_ttnumber:jobcard.jobcard_ttnumber, jobcard_audittrail:jobcard.jobcard_audittrail, jobcard_quotacao:jobcard.jobcard_quotacao}}, function(err, data){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}
		else{
			console.log("Jobcard updated")
			res.redirect("/inicio");
		}
	});

	 
});

router.post("/updateJobcard/:id",  upload.any(), async function(req, res){

	var userData= req.session.usuario;
	var jobcard = req.body;
	var referencia = req.params.id;
	// console.log(jobcard)

	var jobcard_callArray = [];
	var jobcard_callcontrolador = jobcard.jobcard_call;

	if(Array.isArray(jobcard_callcontrolador)){

		for( i = 0; i < jobcard_callcontrolador.length; i++){
			jobcard_callArray.push(jobcard_callcontrolador[i]);
		}

	}else{
		jobcard_callArray.push(jobcard_callcontrolador);

	}

	jobcard.jobcard_call = jobcard_callArray;

	var jobcard_jobinfoArray = [];
	var jobcard_jobinfocontrolador = jobcard.jobcard_jobinfo;

	if(Array.isArray(jobcard_jobinfocontrolador)){

		for( i = 0; i < jobcard_jobinfocontrolador.length; i++){
			jobcard_jobinfoArray.push(jobcard_jobinfocontrolador[i]);
		}

	}else{
		jobcard_jobinfoArray.push(jobcard_jobinfocontrolador);

	}

	jobcard.jobcard_jobinfo = jobcard_jobinfoArray;
	
	var procurajobcard = await jobcards.findOne({_id:referencia},{jobcard_audittrail:1, jobcard_linemanagerid:1, jobcard_tecnicoid:1, jobcard_clienteid:1, jobcard_ttnumber:1, jobcard_siteid:1, jobcard_site:1, jobcard_clientenome:1}, function(err, data){
		if(err){
        	console.log(err);
   		}else{
    		console.log("Find Jobcard");
    	}
	}).lean();

	var arrAudit = procurajobcard.jobcard_audittrail;
	var lastaudittrail = arrAudit[arrAudit.length-1];

	var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
    var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
    var ano = (new Date()).getFullYear();
    var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

	if((lastaudittrail.jobcard_audittrailname == userData.nome) && (lastaudittrail.jobcard_audittrailaction == "Update Jobcard")){

        arrAudit[arrAudit.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

    }else{

      var jobcard_audittrailObject = {};
      // jobcard_audittrailObject._id = "";
      jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
      jobcard_audittrailObject.jobcard_audittrailaction = "Update Jobcard";
      jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
      arrAudit.push(jobcard_audittrailObject);
    }

    jobcard.jobcard_audittrail = arrAudit;

    var procuralinemanager = await model.findOne({_id:procurajobcard.jobcard_linemanagerid}, {email:1}, function(err,dataUser){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}else{
			console.log("Find Line Manager")

		}
	}).lean();

	var procuratecnico = await model.findOne({_id:procurajobcard.jobcard_tecnicoid}, {email:1, idioma:1, nome:1}, function(err,dataUser){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}else{
			console.log("Find Technician")

		}
	}).lean();

	var procuracliente = await clientes.findOne({_id:jobcard.jobcard_clienteid}, {cliente_nome:1, cliente_filial:1, cliente_telefone:1}, function(err,dataCliente){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}else{
			console.log("Find Client")

		}
	}).lean();

	jobcard.jobcard_clientenome = procuracliente.cliente_nome;
	jobcard.jobcard_clientebranch = procuracliente.cliente_filial;
	jobcard.jobcard_clientetelefone = procuracliente.cliente_telefone;

	var procuraclientesites = await siteinfos.aggregate([{$group:{_id:"$siteinfo_clientid", sites:{$push:{numero:"$siteinfo_sitenum", ref:"$_id"}}}}], function (err, dataSiteCliente) {
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}else{
			console.log("Find Client and sites")

		}
	});

	if(procurajobcard.jobcard_siteid != ""){
		var procurasiteinfoantigo = await siteinfos.findOne({_id:procurajobcard.jobcard_siteid}, {siteinfo_sitename:1}, function(err,dataSiteInfoAntigo){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}else{
				console.log("Find Site")
			}
		});
	}else{

		var procurasiteinfoantigo = {}

		procurasiteinfoantigo.siteinfo_sitename = "";
	}

	var posicaoclientesitenovo = procuraclientesites.findIndex(x => x._id == jobcard.jobcard_clienteid);

	if(posicaoclientesitenovo != -1){

		var procurasiteinfonovo = await siteinfos.findOne({_id:jobcard.jobcard_siteid}, {siteinfo_sitename:1, siteinfo_sitenum:1}, function(err,dataUser){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}else{
				console.log("Find Site")

				}
		});

		jobcard.jobcard_site = procurasiteinfonovo.siteinfo_sitenum;

	}else{

		var procurasiteinfonovo = {}

		jobcard.jobcard_site = jobcard.jobcard_siteid;
		jobcard.jobcard_siteid = "";
		procurasiteinfonovo.siteinfo_sitename = "";
	}


	if((parseInt(procurajobcard.jobcard_ttnumber) != parseInt(jobcard.jobcard_ttnumber)) || (procurajobcard.jobcard_siteid != jobcard.jobcard_siteid) || (procurajobcard.jobcard_clienteid != jobcard.jobcard_clienteid)){

		emailSender.createConnection();
		emailSender.sendEmailUpdatedJobcardCallCenter(procurajobcard, jobcard, procuratecnico, procuralinemanager, userData, procurasiteinfonovo, procurasiteinfoantigo, procuracliente);
	
	}else{

		emailSender.createConnection();
		emailSender.sendEmailUpdatedJobcardCallCenter1(procurajobcard, procuratecnico, procuralinemanager, userData, procurasiteinfoantigo);
	}

    jobcards.findOneAndUpdate({_id:referencia},{$set:{ data_ultimaactualizacaojobcard:new Date(),jobcard_ttnumber:jobcard.jobcard_ttnumber, jobcard_call:jobcard.jobcard_call, jobcard_departamento:jobcard.jobcard_departamento, jobcard_jobinfo:jobcard.jobcard_jobinfo, jobcard_clienteid:jobcard.jobcard_clienteid, jobcard_clientenome:jobcard.jobcard_clientenome, jobcard_clientebranch:jobcard.jobcard_clientebranch, jobcard_clientetelefone:jobcard.jobcard_clientetelefone, jobcard_siteid:jobcard.jobcard_siteid, jobcard_site:jobcard.jobcard_site, jobcard_audittrail:jobcard.jobcard_audittrail}}, function(err, data){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}
		else{
			console.log("Jobcard updated")
			res.redirect("/inicio");
		}
	});

	 
});

router.post("/addmorefaluts/:id",  upload.any(), async function(req, res){

	var userData= req.session.usuario;
	var jobcard = req.body;
	var referencia = req.params.id;
	
	var jobcard_callArray = [];
	var jobcard_callcontrolador = jobcard.jobcard_call;

	if(Array.isArray(jobcard_callcontrolador)){

		for( i = 0; i < jobcard_callcontrolador.length; i++){
			jobcard_callArray.push(jobcard_callcontrolador[i]);
		}

	}else{
		jobcard_callArray.push(jobcard_callcontrolador);

	}

	// jobcard.jobcard_call = jobcard_callArray;

	var jobcard_jobinfoArray = [];
	var jobcard_jobinfocontrolador = jobcard.jobcard_jobinfo;

	if(Array.isArray(jobcard_jobinfocontrolador)){

		for( i = 0; i < jobcard_jobinfocontrolador.length; i++){
			jobcard_jobinfoArray.push(jobcard_jobinfocontrolador[i]);
		}

	}else{
		jobcard_jobinfoArray.push(jobcard_jobinfocontrolador);

	}

	// jobcard.jobcard_jobinfo = jobcard_jobinfoArray;
	
	var procurajobcard = await jobcards.findOne({_id:referencia},{jobcard_call:1, jobcard_jobinfo:1, jobcard_linemanagerid:1, jobcard_tecnicoid:1, jobcard_siteid:1, jobcard_ttnumber:1, jobcard_site:1}, function(err, data){
		if(err){
        	console.log(err);
   		}else{
    		console.log("Find Jobcard");
    	}
	});

	// comparar os arrays para evitar duplicacao
	// call
	var jobcard_callArray1 = procurajobcard.jobcard_call;
	for(var i=0; i<jobcard_callArray.length; i++){

		if(jobcard_callArray1.includes(jobcard_callArray[i]) == false){

			jobcard_callArray1.push(jobcard_callArray[i]);

		}

	}

	jobcard.jobcard_call = jobcard_callArray1;

	// jobinfo
	var jobcard_jobinfoArray1 = procurajobcard.jobcard_jobinfo;
	for(var i=0; i<jobcard_jobinfoArray.length; i++){

		if(jobcard_jobinfoArray1.includes(jobcard_jobinfoArray[i]) == false){

			jobcard_jobinfoArray1.push(jobcard_jobinfoArray[i]);

		}

	}

	jobcard.jobcard_jobinfo = jobcard_jobinfoArray1;

	var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
    var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
    var ano = (new Date()).getFullYear();
    var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

	var jobcard_audittrailObject = {};
      // jobcard_audittrailObject._id = "";
      jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
      jobcard_audittrailObject.jobcard_audittrailaction = "Add more faults: " + jobcard_jobinfoArray + " with the ticket number " + jobcard.jobcard_ttnumber;
      jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

    var procuralinemanager = await model.findOne({_id:procurajobcard.jobcard_linemanagerid}, {email:1}, function(err,dataUser){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}else{
			console.log("Find Line Manager")

		}
	});

	var procuratecnico = await model.findOne({_id:procurajobcard.jobcard_tecnicoid}, {email:1, idioma:1, nome:1}, function(err,dataUser){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}else{
			console.log("Find Technician")

		}
	});

	if(procurajobcard.jobcard_siteid != ""){

		var procurasiteinfo = await siteinfos.findOne({_id:procurajobcard.jobcard_siteid}, {siteinfo_sitename:1}, function(err,dataSiteInfo){
			if(err){
				console.log("ocorreu um erro ao tentar aceder os dados")
			}else{
				console.log("Find Site")

			}
		});

		emailSender.createConnection();
		emailSender.sendEmailUpdatedJobcardCallCenter1(procurajobcard, procuratecnico, procuralinemanager, userData, procurasiteinfo);

	}else{

		procurasiteinfo.siteinfo_sitename = "";

		emailSender.createConnection();
		emailSender.sendEmailUpdatedJobcardCallCenter1(procurajobcard, procuratecnico, procuralinemanager, userData, procurasiteinfo);
	}

    jobcards.findOneAndUpdate({_id:referencia},{$push:{jobcard_audittrail:jobcard_audittrailObject}, $set:{data_ultimaactualizacaojobcard: new Date(), jobcard_call:jobcard.jobcard_call, jobcard_jobinfo:jobcard.jobcard_jobinfo}}, function(err, data){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}
		else{
			console.log("Jobcard updated")
			res.redirect("/inicio");
		}
	});

	 
});

router.post("/updatesiteinfo",  upload.any(), async function(req, res){

	var userData= req.session.usuario;
	var siteinfo = req.body;
	// var ref = req.params.id;
	// siteinfo.siteinfo_generatorArray = JSON.parse(req.body.siteinfo_generatorArray);
	// siteinfo.siteinfo_acArray = JSON.parse(req.body.siteinfo_acArray);
	// siteinfo.siteinfo_rectcabArray = JSON.parse(req.body.siteinfo_rectcabArray);
	// siteinfo.siteinfo_securityArray = JSON.parse(req.body.siteinfo_securityArray);
	siteinfo.siteinfo_gps = JSON.parse(req.body.siteinfo_gps);
	// siteinfo.siteinfo_audittrail = JSON.parse(req.body.siteinfo_audittrail);


	var procuracliente = await clientes.findOne({_id:siteinfo.siteinfo_clientid}, function(err, data){
		if(err){
            console.log(err);
        }else{
        	console.log("Find Site Info")
        }
	});

	siteinfo.siteinfo_client = procuracliente.cliente_nome;

	var procurauser = await model.findOne({_id:siteinfo.siteinfo_maintoffid}, function(err,dataUser){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}else{
			console.log("Find User")

		}
	});

	siteinfo.siteinfo_maintoff = procurauser.nome;


	var procurasiteinfo = await siteinfos.findOne({_id:siteinfo.siteid}, function(err,dataJobcard){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}else{
			console.log("Find User")

		}
	});

	var arrAudit = procurasiteinfo.siteinfo_audittrail;
	console.log(arrAudit)
	var lastaudittrail = arrAudit[arrAudit.length-1];

	var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
    var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
    var ano = (new Date()).getFullYear();
    // var todaydate = dia + "/" + mes + "/" + ano;
    var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

	if((lastaudittrail.siteinfo_audittrailname == userData.nome) && (lastaudittrail.siteinfo_audittrailaction == "Update Site Info")){

        arrAudit[arrAudit.length-1].siteinfo_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

    }else{

      var siteinfo_audittrailObject = {};
      // jobcard_audittrailObject._id = "";
      siteinfo_audittrailObject.siteinfo_audittrailname = userData.nome;
      siteinfo_audittrailObject.siteinfo_audittrailaction = "Update Site Info";
      siteinfo_audittrailObject.siteinfo_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
      arrAudit.push(siteinfo_audittrailObject);
    }

    siteinfo.siteinfo_audittrail = arrAudit;

    siteinfo.siteinfo_generatorArray = [];
	

	if(siteinfo.siteinfo_generator != "No"){

		if(Array.isArray(siteinfo.siteinfo_generatorhours)){


			for( i = 0; i < siteinfo.siteinfo_generatorhours.length; i++){
				var siteinfo_generatorArrayObject = {};

				siteinfo_generatorArrayObject.siteinfo_generatorhours = siteinfo.siteinfo_generatorhours[i];
				siteinfo_generatorArrayObject.siteinfo_generatortype = siteinfo.siteinfo_generatortype[i];
				siteinfo_generatorArrayObject.siteinfo_generatoroutputkw = siteinfo.siteinfo_generatoroutputkw[i];
				siteinfo_generatorArrayObject.siteinfo_generatormodelno = siteinfo.siteinfo_generatormodelno[i];
				siteinfo_generatorArrayObject.siteinfo_generatorengineserialnumber = siteinfo.siteinfo_generatorengineserialnumber[i];
				siteinfo_generatorArrayObject.siteinfo_generatorenginecapacity = siteinfo.siteinfo_generatorenginecapacity[i];
				siteinfo_generatorArrayObject.siteinfo_generatorstartertype = siteinfo.siteinfo_generatorstartertype[i];
				siteinfo_generatorArrayObject.siteinfo_generatorfuelconsumption = siteinfo.siteinfo_generatorfuelconsumption[i];
				siteinfo_generatorArrayObject.siteinfo_generatorprevrefuelhours = siteinfo.siteinfo_generatorprevrefuelhours[i];
				
				siteinfo.siteinfo_generatorArray.push(siteinfo_generatorArrayObject)

		        
		    }

		}else{

			var siteinfo_generatorArrayObject = {};

			siteinfo_generatorArrayObject.siteinfo_generatorhours = siteinfo.siteinfo_generatorhours;
			siteinfo_generatorArrayObject.siteinfo_generatortype = siteinfo.siteinfo_generatortype;
			siteinfo_generatorArrayObject.siteinfo_generatoroutputkw = siteinfo.siteinfo_generatoroutputkw;
			siteinfo_generatorArrayObject.siteinfo_generatormodelno = siteinfo.siteinfo_generatormodelno;
			siteinfo_generatorArrayObject.siteinfo_generatorengineserialnumber = siteinfo.siteinfo_generatorengineserialnumber;
			siteinfo_generatorArrayObject.siteinfo_generatorenginecapacity = siteinfo.siteinfo_generatorenginecapacity;
			siteinfo_generatorArrayObject.siteinfo_generatorstartertype = siteinfo.siteinfo_generatorstartertype;
			siteinfo_generatorArrayObject.siteinfo_generatorfuelconsumption = siteinfo.siteinfo_generatorfuelconsumption;
			siteinfo_generatorArrayObject.siteinfo_generatorprevrefuelhours = siteinfo.siteinfo_generatorprevrefuelhours;
			
			siteinfo.siteinfo_generatorArray.push(siteinfo_generatorArrayObject)
		}
			

	}
	


    siteinfo.siteinfo_acArray = [];
	

	if(siteinfo.siteinfo_ac != "No"){

		if(Array.isArray(siteinfo.siteinfo_acmanufacturer)){

			for( i = 0; i < siteinfo.siteinfo_acmanufacturer.length; i++){

				var siteinfo_acArrayObject = {};
				siteinfo_acArrayObject.siteinfo_acmanufacturer = siteinfo.siteinfo_acmanufacturer[i];
				siteinfo_acArrayObject.siteinfo_actype = siteinfo.siteinfo_actype[i];
				siteinfo_acArrayObject.siteinfo_acmodel = siteinfo.siteinfo_acmodel[i];
				siteinfo_acArrayObject.siteinfo_acnumbersiteinfo_acnumber = siteinfo.siteinfo_acnumber[i];
				siteinfo_acArrayObject.siteinfo_acserialnumber = siteinfo.siteinfo_acserialnumber[i];
				siteinfo_acArrayObject.siteinfo_acbtu = siteinfo.siteinfo_acbtu[i];
				siteinfo_acArrayObject.siteinfo_accageinstalled = siteinfo.siteinfo_accageinstalled[i];
				siteinfo_acArrayObject.siteinfo_acsleeveinstalled = siteinfo.siteinfo_acsleeveinstalled[i];
				siteinfo_acArrayObject.siteinfo_acunitcontrolltype = siteinfo.siteinfo_acunitcontrolltype[i];
				siteinfo_acArrayObject.siteinfo_accontrollermodel = siteinfo.siteinfo_accontrollermodel[i];
				
				siteinfo.siteinfo_acArray.push(siteinfo_acArrayObject)

        
    		}
		}else{

			var siteinfo_acArrayObject = {};
			siteinfo_acArrayObject.siteinfo_acmanufacturer = siteinfo.siteinfo_acmanufacturer;
			siteinfo_acArrayObject.siteinfo_actype = siteinfo.siteinfo_actype;
			siteinfo_acArrayObject.siteinfo_acmodel = siteinfo.siteinfo_acmodel;
			siteinfo_acArrayObject.siteinfo_acnumbersiteinfo_acnumber = siteinfo.siteinfo_acnumber;
			siteinfo_acArrayObject.siteinfo_acserialnumber = siteinfo.siteinfo_acserialnumber;
			siteinfo_acArrayObject.siteinfo_acbtu = siteinfo.siteinfo_acbtu;
			siteinfo_acArrayObject.siteinfo_accageinstalled = siteinfo.siteinfo_accageinstalled;
			siteinfo_acArrayObject.siteinfo_acsleeveinstalled = siteinfo.siteinfo_acsleeveinstalled;
			siteinfo_acArrayObject.siteinfo_acunitcontrolltype = siteinfo.siteinfo_acunitcontrolltype;
			siteinfo_acArrayObject.siteinfo_accontrollermodel = siteinfo.siteinfo_accontrollermodel;
			
			siteinfo.siteinfo_acArray.push(siteinfo_acArrayObject)

		}

		
	}

	

    siteinfo.siteinfo_rectcabArray = [];

    if(siteinfo.siteinfo_rectifiercabinnet != "No"){

    	if(Array.isArray(siteinfo.siteinfo_rectcabcabinetmodelno)){

	    	

			for( i = 0; i < siteinfo.siteinfo_rectcabcabinetmodelno.length; i++){
				var siteinfo_rectcabArrayObject = {};

				siteinfo_rectcabArrayObject.siteinfo_rectcabcabinetmodelno = siteinfo.siteinfo_rectcabcabinetmodelno[i];
				siteinfo_rectcabArrayObject.siteinfo_rectcabcabinetnumber = siteinfo.siteinfo_rectcabcabinetnumber[i];
				siteinfo_rectcabArrayObject.siteinfo_rectcabtype = siteinfo.siteinfo_rectcabtype[i];
				siteinfo_rectcabArrayObject.siteinfo_rectcabinputtype = siteinfo.siteinfo_rectcabinputtype[i];
				siteinfo_rectcabArrayObject.siteinfo_rectcabnobatteries = siteinfo.siteinfo_rectcabnobatteries[i];
				siteinfo_rectcabArrayObject.siteinfo_rectcabbatterycapac = siteinfo.siteinfo_rectcabbatterycapac[i];
				
				siteinfo.siteinfo_rectcabArray.push(siteinfo_rectcabArrayObject)

		        
		    }
    	}else{
    		var siteinfo_rectcabArrayObject = {};

    		siteinfo_rectcabArrayObject.siteinfo_rectcabcabinetmodelno = siteinfo.siteinfo_rectcabcabinetmodelno;
			siteinfo_rectcabArrayObject.siteinfo_rectcabcabinetnumber = siteinfo.siteinfo_rectcabcabinetnumber;
			siteinfo_rectcabArrayObject.siteinfo_rectcabtype = siteinfo.siteinfo_rectcabtype;
			siteinfo_rectcabArrayObject.siteinfo_rectcabinputtype = siteinfo.siteinfo_rectcabinputtype;
			siteinfo_rectcabArrayObject.siteinfo_rectcabnobatteries = siteinfo.siteinfo_rectcabnobatteries;
			siteinfo_rectcabArrayObject.siteinfo_rectcabbatterycapac = siteinfo.siteinfo_rectcabbatterycapac;
				
			siteinfo.siteinfo_rectcabArray.push(siteinfo_rectcabArrayObject)
    	}

	    
    }
	

    siteinfo.siteinfo_securityArray = [];

	if(siteinfo.siteinfo_guardsite != "No"){

		if(Array.isArray(siteinfo.siteinfo_secguardname)){

			for( i = 0; i < siteinfo.siteinfo_secguardname.length; i++){

				var siteinfo_securityArrayObject = {};

				siteinfo_securityArrayObject.siteinfo_secguardname = siteinfo.siteinfo_secguardname[i];
				siteinfo_securityArrayObject.siteinfo_secbinumber = siteinfo.siteinfo_secbinumber[i];
				siteinfo_securityArrayObject.siteinfo_secnib = siteinfo.siteinfo_secnib[i];
				siteinfo_securityArrayObject.siteinfo_secvalue = siteinfo.siteinfo_secvalue[i];
				
				siteinfo.siteinfo_securityArray.push(siteinfo_securityArrayObject)

	        
	    	}
		}else{

			var siteinfo_securityArrayObject = {};

				siteinfo_securityArrayObject.siteinfo_secguardname = siteinfo.siteinfo_secguardname;
				siteinfo_securityArrayObject.siteinfo_secbinumber = siteinfo.siteinfo_secbinumber;
				siteinfo_securityArrayObject.siteinfo_secnib = siteinfo.siteinfo_secnib;
				siteinfo_securityArrayObject.siteinfo_secvalue = siteinfo.siteinfo_secvalue;
				
				siteinfo.siteinfo_securityArray.push(siteinfo_securityArrayObject)


		}

	}

	siteinfos.updateOne({_id:siteinfo.siteid}, {$set:siteinfo}, function(err, data){

	    if(err){
	        console.log("ocorreu "+err)
	     }else{
	        console.log("Site Info Actualizado")
	     }

    });

	 
});

router.post("/novositeinfo",  upload.any(), async function(req, res){
	var userData= req.session.usuario;
	var siteinfo = req.body;
	console.log(siteinfo)
	siteinfo.siteinfo_gps = JSON.parse(req.body.siteinfo_gps);
	
	var cont, cont1, cont2, cont3, cont4;
	var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
    var year = ((new Date()).getFullYear() + "").split("");
    var ano = year[2] + year[3];
	//console.log(siteinfo);

	var procuracliente = await clientes.findOne({_id:siteinfo.siteinfo_clientid}, function(err, data){
		if(err){
            console.log(err);
        }else{
        	console.log("Find Site Info")
        }
	});

	siteinfo.siteinfo_client = procuracliente.cliente_nome;

	var procurauser = await model.findOne({_id:siteinfo.siteinfo_maintoffid}, function(err,dataUser){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}else{
			console.log("Find User")

		}
	});

	siteinfo.siteinfo_maintoff = procurauser.nome;

	// Site Owner
	siteinfo.siteinfo_ownerArray = [];
	var siteinfo_siteOwnerArrayObject = {};

	siteinfo_siteOwnerArrayObject.siteinfo_siteOwner = siteinfo.siteinfo_siteOwner;
	siteinfo_siteOwnerArrayObject.siteinfo_siteShared = siteinfo.siteinfo_siteShared;
	siteinfo_siteOwnerArrayObject.siteinfo_sitePreparedForSharing = siteinfo.siteinfo_sitePreparedForSharing;
	siteinfo_siteOwnerArrayObject.siteinfo_siteOwnerOtherInformation = siteinfo.siteinfo_siteOwnerOtherInformation;
	console.log(siteinfo_siteOwnerArrayObject);

	siteinfo.siteinfo_ownerArray.push(siteinfo_siteOwnerArrayObject);


	//Building
	siteinfo.siteinfo_buildingArray = [];
	var siteinfo_buildingArrayObject = {};

	siteinfo_buildingArrayObject.siteinfo_buildingStructure = siteinfo.siteinfo_buildingStructure;
	siteinfo_buildingArrayObject.siteinfo_buildingcolor = siteinfo.siteinfo_buildingcolor;
	siteinfo_buildingArrayObject.siteinfo_buildingserialno = siteinfo.siteinfo_buildingserialno;
	siteinfo_buildingArrayObject.siteinfo_buildingTypeOfLock = siteinfo.siteinfo_buildingTypeOfLock;
	siteinfo_buildingArrayObject.siteinfo_buildingArea = siteinfo.siteinfo_buildingArea;
	siteinfo_buildingArrayObject.siteinfo_buildingwallthickness = siteinfo.siteinfo_buildingwallthickness;
	siteinfo_buildingArrayObject.siteinfo_buildingaccommodationLightFitting = siteinfo.siteinfo_buildingaccommodationLightFitting;
	siteinfo_buildingArrayObject.siteinfo_buildingaccommodationTypeOfGlobe = siteinfo.siteinfo_buildingaccommodationTypeOfGlobe;
	siteinfo_buildingArrayObject.siteinfo_buildingAccommodationLightQuantity = siteinfo.siteinfo_buildingAccommodationLightQuantity;
	siteinfo_buildingArrayObject.siteinfo_buildingEmergencyLightFitting = siteinfo.siteinfo_buildingEmergencyLightFitting;
	siteinfo_buildingArrayObject.siteinfo_buildingEmergencyTypeOfGlobe = siteinfo.siteinfo_buildingEmergencyTypeOfGlobe;
	siteinfo_buildingArrayObject.siteinfo_buildingEmergencyLightQuantity = siteinfo.siteinfo_buildingEmergencyLightQuantity;
	siteinfo_buildingArrayObject.siteinfo_buildingCircuitBreakerType = siteinfo.siteinfo_buildingCircuitBreakerType;
	siteinfo_buildingArrayObject.siteinfo_buildingCircuitBreakerQuantity = siteinfo.siteinfo_buildingCircuitBreakerQuantity;
	siteinfo_buildingArrayObject.siteinfo_buildingCircuitBreakerQuantityUsed = siteinfo.siteinfo_buildingCircuitBreakerQuantityUsed;
	siteinfo_buildingArrayObject.siteinfo_buildingMovementAlarmInstalled = siteinfo.siteinfo_buildingMovementAlarmInstalled;
	siteinfo_buildingArrayObject.siteinfo_buildingMovementAlarmInstalledQty = siteinfo.siteinfo_buildingMovementAlarmInstalledQty;
	siteinfo_buildingArrayObject.siteinfo_buildingIntruderAlarmInstalled = siteinfo.siteinfo_buildingIntruderAlarmInstalled;
	siteinfo_buildingArrayObject.siteinfo_buildingIntruderAlarmInstalledQty = siteinfo.siteinfo_buildingIntruderAlarmInstalledQty;
	siteinfo_buildingArrayObject.siteinfo_buildingHeatAlarmInstalled = siteinfo.siteinfo_buildingHeatAlarmInstalled;
	siteinfo_buildingArrayObject.siteinfo_buildingHeatAlarmInstalledQty = siteinfo.siteinfo_buildingHeatAlarmInstalledQty;
	siteinfo_buildingArrayObject.siteinfo_buildingAdditionalSurgeProtection = siteinfo.siteinfo_buildingAdditionalSurgeProtection;
	siteinfo_buildingArrayObject.siteinfo_buildingAdditionalSurgeProtectionType = siteinfo.siteinfo_buildingAdditionalSurgeProtectionType;


	console.log(siteinfo_buildingArrayObject);
	siteinfo.siteinfo_buildingArray.push(siteinfo_buildingArrayObject);



	//Mast
	siteinfo.siteinfo_mastArray = [];
	var siteinfo_mastArrayObject = {};

	siteinfo_mastArrayObject.siteinfo_mastType = siteinfo.siteinfo_mastType;
	siteinfo_mastArrayObject.siteinfo_mastManufacturer = siteinfo.siteinfo_mastManufacturer;
	siteinfo_mastArrayObject.siteinfo_mastserialno = siteinfo.siteinfo_mastserialno;
	siteinfo_mastArrayObject.siteinfo_mastHeight = siteinfo.siteinfo_mastHeight;
	siteinfo_mastArrayObject.siteinfo_mastColour = siteinfo.siteinfo_mastColour;
	siteinfo_mastArrayObject.siteinfo_mastOverheadEntry = siteinfo.siteinfo_mastOverheadEntry;
	siteinfo_mastArrayObject.siteinfo_mastUndergroundEntry = siteinfo.siteinfo_mastUndergroundEntry;
	siteinfo_mastArrayObject.siteinfo_mastGantryType = siteinfo.siteinfo_mastGantryType;
	siteinfo_mastArrayObject.siteinfo_mastGantryLength = siteinfo.siteinfo_mastGantryLength;
	siteinfo_mastArrayObject.siteinfo_mast110mmSleevesQty = siteinfo.siteinfo_mast110mmSleevesQty;
	siteinfo_mastArrayObject.siteinfo_mast110mmSleevesUsed = siteinfo.siteinfo_mast110mmSleevesUsed;
	siteinfo_mastArrayObject.siteinfo_mast150mmSleevesQty = siteinfo.siteinfo_mast150mmSleevesQty;
	siteinfo_mastArrayObject.siteinfo_mast150mmSleevesUsed = siteinfo.siteinfo_mast150mmSleevesUsed;
	siteinfo_mastArrayObject.siteinfo_mastOtherSizeSleevesQty = siteinfo.siteinfo_mastOtherSizeSleevesQty;
	siteinfo_mastArrayObject.siteinfo_mastOtherSizeSleevesUsed = siteinfo.siteinfo_mastOtherSizeSleevesUsed;
	siteinfo_mastArrayObject.siteinfo_mastDrainsatBottom = siteinfo.siteinfo_mastDrainsatBottom;
	siteinfo_mastArrayObject.siteinfo_mastLightsfittingType = siteinfo.siteinfo_mastLightsfittingType;
	siteinfo_mastArrayObject.siteinfo_mastLightGlobeType = siteinfo.siteinfo_mastLightGlobeType;
	siteinfo_mastArrayObject.siteinfo_mastLightGlobeQty = siteinfo.siteinfo_mastLightGlobeQty;
	siteinfo_mastArrayObject.siteinfo_mastLightSwitchInstalled = siteinfo.siteinfo_mastLightSwitchInstalled;
	siteinfo_mastArrayObject.siteinfo_mastLightSwitchType = siteinfo.siteinfo_mastLightSwitchType;
	siteinfo_mastArrayObject.siteinfo_mastAircraftLightFittingType = siteinfo.siteinfo_mastAircraftLightFittingType;
	siteinfo_mastArrayObject.siteinfo_mastAircraftGlobeType = siteinfo.siteinfo_mastAircraftGlobeType;
	siteinfo_mastArrayObject.siteinfo_mastAircraftWarningLightGlobeQty = siteinfo.siteinfo_mastAircraftWarningLightGlobeQty;
	siteinfo_mastArrayObject.siteinfo_mastBottomDBInstalled = siteinfo.siteinfo_mastBottomDBInstalled;
	siteinfo_mastArrayObject.siteinfo_mastBottomDBType = siteinfo.siteinfo_mastBottomDBType;
	siteinfo_mastArrayObject.siteinfo_mastCircuitBreakerForAwl = siteinfo.siteinfo_mastCircuitBreakerForAwl;
	siteinfo_mastArrayObject.siteinfo_mastCircuitBreakerForAWLQty = siteinfo.siteinfo_mastCircuitBreakerForAWLQty;
	siteinfo_mastArrayObject.siteinfo_mastCircuitBreakerInternalLights = siteinfo.siteinfo_mastCircuitBreakerInternalLights;
	siteinfo_mastArrayObject.siteinfo_mastCircuitBreakerInternalLightsQty = siteinfo.siteinfo_mastCircuitBreakerInternalLightsQty;
	siteinfo_mastArrayObject.siteinfo_mastLightingArrestorsInstalled = siteinfo.siteinfo_mastLightingArrestorsInstalled;
	siteinfo_mastArrayObject.siteinfo_mastCircuitBreakerArrestors = siteinfo.siteinfo_mastCircuitBreakerArrestors;
	siteinfo_mastArrayObject.siteinfo_mastCircuitBreakerArrestorsQty = siteinfo.siteinfo_mastCircuitBreakerArrestorsQty;
	siteinfo_mastArrayObject.siteinfo_mastTopDBInstalled = siteinfo.siteinfo_mastTopDBInstalled;
	siteinfo_mastArrayObject.siteinfo_mastTopDBType = siteinfo.siteinfo_mastTopDBType;
	siteinfo_mastArrayObject.siteinfo_mastTopTipoSwitch = siteinfo.siteinfo_mastTopTipoSwitch;
	siteinfo_mastArrayObject.siteinfo_mastIntermediate = siteinfo.siteinfo_mastIntermediate;
	siteinfo_mastArrayObject.siteinfo_mastIntermediateType = siteinfo.siteinfo_mastIntermediateType;
	siteinfo_mastArrayObject.siteinfo_mastTopintermediateswitchtype = siteinfo.siteinfo_mastTopintermediateswitchtype;
	siteinfo_mastArrayObject.siteinfo_mastIntermediateFittingQty = siteinfo.siteinfo_mastIntermediateFittingQty;
	siteinfo_mastArrayObject.siteinfo_mastIntermediateFittingType = siteinfo.siteinfo_mastIntermediateFittingType;
	siteinfo_mastArrayObject.siteinfo_mastTopGlobeType = siteinfo.siteinfo_mastTopGlobeType;
	siteinfo_mastArrayObject.siteinfo_mastTopAWLLightsEarthLeakage = siteinfo.siteinfo_mastTopAWLLightsEarthLeakage;
	siteinfo_mastArrayObject.siteinfo_mastTopFallArrestInstalled = siteinfo.siteinfo_mastTopFallArrestInstalled;
	siteinfo_mastArrayObject.siteinfo_mastTopFallArrestQty = siteinfo.siteinfo_mastTopFallArrestQty;
	siteinfo_mastArrayObject.siteinfo_mastTopTypeOfLock = siteinfo.siteinfo_mastTopTypeOfLock;
	siteinfo_mastArrayObject.siteinfo_mastTopSpineSupportPipes = siteinfo.siteinfo_mastTopSpineSupportPipes;
	siteinfo_mastArrayObject.siteinfo_mastTopSpineSupportPipesQty = siteinfo.siteinfo_mastTopSpineSupportPipesQty;
	siteinfo_mastArrayObject.siteinfo_mastTopOtherInformation = siteinfo.siteinfo_mastTopOtherInformation;

	siteinfo.siteinfo_mastArray.push(siteinfo_mastArrayObject);
	console.log("Este eh o mast ", siteinfo.siteinfo_mastArray);


	//Power Container
	siteinfo.siteinfo_powercontainerArray = [];
	var siteinfo_powercontainerArrayObject = {};

	siteinfo_powercontainerArrayObject.siteinfo_powercontainerManufacturerSerialNo = siteinfo.siteinfo_powercontainerManufacturerSerialNo;
	siteinfo_powercontainerArrayObject.siteinfo_powercontainerSize = siteinfo.siteinfo_powercontainerSize;
	siteinfo_powercontainerArrayObject.siteinfo_powercontainerBatteryAhCapacity = siteinfo.siteinfo_powercontainerBatteryAhCapacity;
	siteinfo_powercontainerArrayObject.siteinfo_powercontainerBatteryAhQty = siteinfo.siteinfo_powercontainerBatteryAhQty;
	siteinfo_powercontainerArrayObject.siteinfo_powercontainerAlarm = siteinfo.siteinfo_powercontainerAlarm;
	siteinfo_powercontainerArrayObject.siteinfo_powercontainerFanType = siteinfo.siteinfo_powercontainerFanType;
	siteinfo_powercontainerArrayObject.siteinfo_powercontainerFanQty = siteinfo.siteinfo_powercontainerFanQty;
	siteinfo_powercontainerArrayObject.siteinfo_powercontainerRectifier1 = siteinfo.siteinfo_powercontainerRectifier1;
	siteinfo_powercontainerArrayObject.siteinfo_powercontainerRectifier1Qty = siteinfo.siteinfo_powercontainerRectifier1Qty;
	siteinfo_powercontainerArrayObject.siteinfo_powercontainerRectifier2 = siteinfo.siteinfo_powercontainerRectifier2;
	siteinfo_powercontainerArrayObject.siteinfo_powercontainerRectifier2Qty = siteinfo.siteinfo_powercontainerRectifier2Qty;
	siteinfo_powercontainerArrayObject.siteinfo_powercontainerOtherInfo = siteinfo.siteinfo_powercontainerOtherInfo;
	
	siteinfo.siteinfo_powercontainerArray.push(siteinfo_powercontainerArrayObject);
	console.log(siteinfo.siteinfo_powercontainerArray);


	//Security Fencing
	siteinfo.siteinfo_securityfencingArray = [];
	var siteinfo_securityFencingArrayObject = {};

	siteinfo_securityFencingArrayObject.siteinfo_securityFencetype = siteinfo.siteinfo_securityFencetype
	siteinfo_securityFencingArrayObject.siteinfo_securityFencecolour = siteinfo.siteinfo_securityFencecolour
	siteinfo_securityFencingArrayObject.siteinfo_securityFenceElectrified = siteinfo.siteinfo_securityFenceElectrified
	siteinfo_securityFencingArrayObject.siteinfo_securityFenceElectrifiedType = siteinfo.siteinfo_securityFenceElectrifiedType
	siteinfo_securityFencingArrayObject.siteinfo_securityTypeofFitting = siteinfo.siteinfo_securityTypeofFitting
	siteinfo_securityFencingArrayObject.siteinfo_securityTypeofGlobe = siteinfo.siteinfo_securityTypeofGlobe
	siteinfo_securityFencingArrayObject.siteinfo_securitySiteLightQty = siteinfo.siteinfo_securitySiteLightQty
	siteinfo_securityFencingArrayObject.siteinfo_securityOutsideLightSwitch = siteinfo.siteinfo_securityOutsideLightSwitch
	siteinfo_securityFencingArrayObject.siteinfo_securityOutsideLightSwitchLocation = siteinfo.siteinfo_securityOutsideLightSwitchLocation

	console.log(siteinfo_securityFencingArrayObject);
	siteinfo.siteinfo_securityfencingArray.push(siteinfo_securityFencingArrayObject);

	siteinfo.siteinfo_generatorArray = [];
	console.log("Siteinfo ",siteinfo);

	if(siteinfo.siteinfo_generator != "No"){

		if(Array.isArray(siteinfo.siteinfo_generatorhours)){


			for( i = 0; i < siteinfo.siteinfo_generatorhours.length; i++){
				var siteinfo_generatorArrayObject = {};

				siteinfo_generatorArrayObject.siteinfo_generatorhours = siteinfo.siteinfo_generatorhours[i];
				siteinfo_generatorArrayObject.siteinfo_generatortype = siteinfo.siteinfo_generatortype[i];
				siteinfo_generatorArrayObject.siteinfo_generatoroutputkw = siteinfo.siteinfo_generatoroutputkw[i];
				siteinfo_generatorArrayObject.siteinfo_generatormodelno = siteinfo.siteinfo_generatormodelno[i];
				siteinfo_generatorArrayObject.siteinfo_generatorengineserialnumber = siteinfo.siteinfo_generatorengineserialnumber[i];
				siteinfo_generatorArrayObject.siteinfo_generatorenginecapacity = siteinfo.siteinfo_generatorenginecapacity[i];
				siteinfo_generatorArrayObject.siteinfo_generatorstartertype = siteinfo.siteinfo_generatorstartertype[i];
				siteinfo_generatorArrayObject.siteinfo_generatorfuelconsumption = siteinfo.siteinfo_generatorfuelconsumption[i];
				siteinfo_generatorArrayObject.siteinfo_generatorprevrefuelhours = siteinfo.siteinfo_generatorprevrefuelhours[i];
				// Novos Ids começam a partir daqui
				siteinfo_generatorArrayObject.siteinfo_generatorinstallationDate = siteinfo.siteinfo_generatorinstallationDate[i];
				siteinfo_generatorArrayObject.siteinfo_generatorManufacturer = siteinfo.siteinfo_generatorManufacturer[i];
				siteinfo_generatorArrayObject.siteinfo_generatorSerialNo = siteinfo.siteinfo_generatorSerialNo[i];
				siteinfo_generatorArrayObject.siteinfo_generatorModel = siteinfo.siteinfo_generatorModel[i];
				siteinfo_generatorArrayObject.siteinfo_alternatoratorManufacturer = siteinfo.siteinfo_alternatoratorManufacturer[i];
				siteinfo_generatorArrayObject.siteinfo_alternatoratorKvaRating = siteinfo.siteinfo_alternatoratorKvaRating[i];
				siteinfo_generatorArrayObject.siteinfo_alternatoratorModelNo = siteinfo.siteinfo_alternatoratorModelNo[i];
				siteinfo_generatorArrayObject.siteinfo_alternatoratorSerialNo = siteinfo.siteinfo_alternatoratorSerialNo[i];
				siteinfo_generatorArrayObject.siteinfo_generalControlerType = siteinfo.siteinfo_generalControlerType[i];
				siteinfo_generatorArrayObject.siteinfo_generalControlerSerialNo = siteinfo.siteinfo_generalControlerSerialNo[i];
				siteinfo_generatorArrayObject.siteinfo_generalControlerModelNo = siteinfo.siteinfo_generalControlerModelNo[i];
				siteinfo_generatorArrayObject.siteinfo_generalControlerSoftwareversion = siteinfo.siteinfo_generalControlerSoftwareversion[i];
				siteinfo_generatorArrayObject.siteinfo_generalSurgeArrestors = siteinfo.siteinfo_generalSurgeArrestors[i];
				siteinfo_generatorArrayObject.siteinfo_generalSurgeArrestorsType = siteinfo.siteinfo_generalSurgeArrestorsType[i];
				siteinfo_generatorArrayObject.siteinfo_generatorAmpMetersinst = siteinfo.siteinfo_generatorAmpMetersinst[i];
				siteinfo_generatorArrayObject.siteinfo_generatorAmpMetersinstType = siteinfo.siteinfo_generatorAmpMetersinstType[i];
				siteinfo_generatorArrayObject.siteinfo_generatorVltMetersinst = siteinfo.siteinfo_generatorVltMetersinst[i];
				siteinfo_generatorArrayObject.siteinfo_generatorVltMetersinstType = siteinfo.siteinfo_generatorVltMetersinstType[i];
				siteinfo_generatorArrayObject.siteinfo_generatorFrqncyMetersinst = siteinfo.siteinfo_generatorFrqncyMetersinst[i];
				siteinfo_generatorArrayObject.siteinfo_generatorFrqncyMetersinstType = siteinfo.siteinfo_generatorFrqncyMetersinstType[i];
				siteinfo_generatorArrayObject.siteinfo_generatorAnalogueHourMetersinst = siteinfo.siteinfo_generatorAnalogueHourMetersinst[i];
				siteinfo_generatorArrayObject.siteinfo_generatorAnalogueHourMetersinstType = siteinfo.siteinfo_generatorAnalogueHourMetersinstType[i];
				siteinfo_generatorArrayObject.siteinfo_generatorKwhMetersinst = siteinfo.siteinfo_generatorKwhMetersinst[i];
				siteinfo_generatorArrayObject.siteinfo_generatorKwhMetersinstType = siteinfo.siteinfo_generatorKwhMetersinstType[i];
				siteinfo_generatorArrayObject.siteinfo_generatorDummyLoadMetersinst = siteinfo.siteinfo_generatorDummyLoadMetersinst[i];
				siteinfo_generatorArrayObject.siteinfo_generatorDummyLoadMetersinstType = siteinfo.siteinfo_generatorDummyLoadMetersinstType[i];
				siteinfo_generatorArrayObject.siteinfo_generatorBatteryinstType = siteinfo.siteinfo_generatorBatteryinstType[i];
				siteinfo_generatorArrayObject.siteinfo_generatorBatterySize = siteinfo.siteinfo_generatorBatterySize[i];
				siteinfo_generatorArrayObject.siteinfo_generatorFuelSensorType = siteinfo.siteinfo_generatorFuelSensorType[i];
				
				siteinfo.siteinfo_generatorArray.push(siteinfo_generatorArrayObject)

		        
		    }

		}else{

			var siteinfo_generatorArrayObject = {};

			siteinfo_generatorArrayObject.siteinfo_generatorhours = siteinfo.siteinfo_generatorhours;
			siteinfo_generatorArrayObject.siteinfo_generatortype = siteinfo.siteinfo_generatortype;
			siteinfo_generatorArrayObject.siteinfo_generatoroutputkw = siteinfo.siteinfo_generatoroutputkw;
			siteinfo_generatorArrayObject.siteinfo_generatormodelno = siteinfo.siteinfo_generatormodelno;
			siteinfo_generatorArrayObject.siteinfo_generatorengineserialnumber = siteinfo.siteinfo_generatorengineserialnumber;
			siteinfo_generatorArrayObject.siteinfo_generatorenginecapacity = siteinfo.siteinfo_generatorenginecapacity;
			siteinfo_generatorArrayObject.siteinfo_generatorstartertype = siteinfo.siteinfo_generatorstartertype;
			siteinfo_generatorArrayObject.siteinfo_generatorfuelconsumption = siteinfo.siteinfo_generatorfuelconsumption;
			siteinfo_generatorArrayObject.siteinfo_generatorprevrefuelhours = siteinfo.siteinfo_generatorprevrefuelhours;
			// Novos Ids começam a partir daqui
			siteinfo_generatorArrayObject.siteinfo_generatorinstallationDate = siteinfo.siteinfo_generatorinstallationDate;
			siteinfo_generatorArrayObject.siteinfo_generatorManufacturer = siteinfo.siteinfo_generatorManufacturer;
			siteinfo_generatorArrayObject.siteinfo_generatorSerialNo = siteinfo.siteinfo_generatorSerialNo;
			siteinfo_generatorArrayObject.siteinfo_generatorModel = siteinfo.siteinfo_generatorModel;
			siteinfo_generatorArrayObject.siteinfo_alternatoratorManufacturer = siteinfo.siteinfo_alternatoratorManufacturer;
			siteinfo_generatorArrayObject.siteinfo_alternatoratorKvaRating = siteinfo.siteinfo_alternatoratorKvaRating;
			siteinfo_generatorArrayObject.siteinfo_alternatoratorModelNo = siteinfo.siteinfo_alternatoratorModelNo;
			siteinfo_generatorArrayObject.siteinfo_alternatoratorSerialNo = siteinfo.siteinfo_alternatoratorSerialNo;
			siteinfo_generatorArrayObject.siteinfo_generalControlerType = siteinfo.siteinfo_generalControlerType;
			siteinfo_generatorArrayObject.siteinfo_generalControlerSerialNo = siteinfo.siteinfo_generalControlerSerialNo;
			siteinfo_generatorArrayObject.siteinfo_generalControlerModelNo = siteinfo.siteinfo_generalControlerModelNo;
			siteinfo_generatorArrayObject.siteinfo_generalControlerSoftwareversion = siteinfo.siteinfo_generalControlerSoftwareversion;
			siteinfo_generatorArrayObject.siteinfo_generalSurgeArrestors = siteinfo.siteinfo_generalSurgeArrestors;
			siteinfo_generatorArrayObject.siteinfo_generalSurgeArrestorsType = siteinfo.siteinfo_generalSurgeArrestorsType;
			siteinfo_generatorArrayObject.siteinfo_generatorAmpMetersinst = siteinfo.siteinfo_generatorAmpMetersinst;
			siteinfo_generatorArrayObject.siteinfo_generatorAmpMetersinstType = siteinfo.siteinfo_generatorAmpMetersinstType;
			siteinfo_generatorArrayObject.siteinfo_generatorVltMetersinst = siteinfo.siteinfo_generatorVltMetersinst;
			siteinfo_generatorArrayObject.siteinfo_generatorVltMetersinstType = siteinfo.siteinfo_generatorVltMetersinstType;
			siteinfo_generatorArrayObject.siteinfo_generatorFrqncyMetersinst = siteinfo.siteinfo_generatorFrqncyMetersinst;
			siteinfo_generatorArrayObject.siteinfo_generatorFrqncyMetersinstType = siteinfo.siteinfo_generatorFrqncyMetersinstType;
			siteinfo_generatorArrayObject.siteinfo_generatorAnalogueHourMetersinst = siteinfo.siteinfo_generatorAnalogueHourMetersinst;
			siteinfo_generatorArrayObject.siteinfo_generatorAnalogueHourMetersinstType = siteinfo.siteinfo_generatorAnalogueHourMetersinstType;
			siteinfo_generatorArrayObject.siteinfo_generatorKwhMetersinst = siteinfo.siteinfo_generatorKwhMetersinst;
			siteinfo_generatorArrayObject.siteinfo_generatorKwhMetersinstType = siteinfo.siteinfo_generatorKwhMetersinstType;
			siteinfo_generatorArrayObject.siteinfo_generatorDummyLoadMetersinst = siteinfo.siteinfo_generatorDummyLoadMetersinst;
			siteinfo_generatorArrayObject.siteinfo_generatorDummyLoadMetersinstType = siteinfo.siteinfo_generatorDummyLoadMetersinstType;
			siteinfo_generatorArrayObject.siteinfo_generatorBatteryinstType = siteinfo.siteinfo_generatorBatteryinstType;
			siteinfo_generatorArrayObject.siteinfo_generatorBatterySize = siteinfo.siteinfo_generatorBatterySize;
			siteinfo_generatorArrayObject.siteinfo_generatorFuelSensorType = siteinfo.siteinfo_generatorFuelSensorType;
			
			siteinfo.siteinfo_generatorArray.push(siteinfo_generatorArrayObject)
		}

	}

	// GSM Cabinet
	siteinfo.siteinfo_gsmcabArray = [];
	

	if(siteinfo.siteinfo_gsmcab != "No"){

		if(Array.isArray(siteinfo.siteinfo_gsmEquipmentType)){

			console.log("Entrou aqui");
			for( i = 0; i < siteinfo.siteinfo_gsmEquipmentType.length; i++){
				var siteinfo_gsmcabArrayObject = {};
				
				siteinfo_gsmcabArrayObject.siteinfo_gsmEquipmentType = siteinfo.siteinfo_gsmEquipmentType[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsmSiteConfig = siteinfo.siteinfo_gsmSiteConfig[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsm900AntennaType = siteinfo.siteinfo_gsm900AntennaType[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsm900AntennaQty = siteinfo.siteinfo_gsm900AntennaQty[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsm900TmaInstalled = siteinfo.siteinfo_gsm900TmaInstalled[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsm1800AntennaType = siteinfo.siteinfo_gsm1800AntennaType[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsm1800AntennaQty = siteinfo.siteinfo_gsm1800AntennaQty[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsm1800TmaInstalled = siteinfo.siteinfo_gsm1800TmaInstalled[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsm3gAntennaType = siteinfo.siteinfo_gsm3gAntennaType[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsm3gAntennaQty = siteinfo.siteinfo_gsm3gAntennaQty[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsm3gTmaInstalled = siteinfo.siteinfo_gsm3gTmaInstalled[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsm4gAntennaType = siteinfo.siteinfo_gsm4gAntennaType[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsm4gAntennaQty = siteinfo.siteinfo_gsm4gAntennaQty[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsm4gTmaInstalled = siteinfo.siteinfo_gsm4gTmaInstalled[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsm5gAntennaType = siteinfo.siteinfo_gsm5gAntennaType[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsm5gAntennaType = siteinfo.siteinfo_gsm5gAntennaType[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsm5gAntennaQty = siteinfo.siteinfo_gsm5gAntennaQty[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsmOmniAntennaType = siteinfo.siteinfo_gsmOmniAntennaType[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsmOmniAntennaQty = siteinfo.siteinfo_gsmOmniAntennaQty[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsmTmaAntennaType = siteinfo.siteinfo_gsmTmaAntennaType[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsmTmaAntennaQty = siteinfo.siteinfo_gsmTmaAntennaQty[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsmBscAntennaType = siteinfo.siteinfo_gsmBscAntennaType[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsmBscAntennaQty = siteinfo.siteinfo_gsmBscAntennaQty[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsmTrauAntennaType = siteinfo.siteinfo_gsmTrauAntennaType[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsmTrauAntennaQty = siteinfo.siteinfo_gsmTrauAntennaQty[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsmRepeater = siteinfo.siteinfo_gsmRepeater[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsmRepeaterQty = siteinfo.siteinfo_gsmRepeaterQty[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsmcab = siteinfo.siteinfo_gsmcab[i];

				siteinfo.siteinfo_gsmcabArray.push(siteinfo_gsmcabArrayObject)

		        
		    }

		}else{
			console.log("Passou daqui");
			var siteinfo_gsmcabArrayObject = {};

			siteinfo_gsmcabArrayObject.siteinfo_gsmEquipmentType = siteinfo.siteinfo_gsmEquipmentType;
			siteinfo_gsmcabArrayObject.siteinfo_gsmSiteConfig = siteinfo.siteinfo_gsmSiteConfig;
			siteinfo_gsmcabArrayObject.siteinfo_gsm900AntennaType = siteinfo.siteinfo_gsm900AntennaType;
			siteinfo_gsmcabArrayObject.siteinfo_gsm900AntennaQty = siteinfo.siteinfo_gsm900AntennaQty;
			siteinfo_gsmcabArrayObject.siteinfo_gsm900TmaInstalled = siteinfo.siteinfo_gsm900TmaInstalled;
			siteinfo_gsmcabArrayObject.siteinfo_gsm1800AntennaType = siteinfo.siteinfo_gsm1800AntennaType;
			siteinfo_gsmcabArrayObject.siteinfo_gsm1800AntennaQty = siteinfo.siteinfo_gsm1800AntennaQty;
			siteinfo_gsmcabArrayObject.siteinfo_gsm1800TmaInstalled = siteinfo.siteinfo_gsm1800TmaInstalled;
			siteinfo_gsmcabArrayObject.siteinfo_gsm3gAntennaType = siteinfo.siteinfo_gsm3gAntennaType;
			siteinfo_gsmcabArrayObject.siteinfo_gsm3gAntennaQty = siteinfo.siteinfo_gsm3gAntennaQty;
			siteinfo_gsmcabArrayObject.siteinfo_gsm3gTmaInstalled = siteinfo.siteinfo_gsm3gTmaInstalled;
			siteinfo_gsmcabArrayObject.siteinfo_gsm4gAntennaType = siteinfo.siteinfo_gsm4gAntennaType;
			siteinfo_gsmcabArrayObject.siteinfo_gsm4gAntennaQty = siteinfo.siteinfo_gsm4gAntennaQty;
			siteinfo_gsmcabArrayObject.siteinfo_gsm4gTmaInstalled = siteinfo.siteinfo_gsm4gTmaInstalled;
			siteinfo_gsmcabArrayObject.siteinfo_gsm5gAntennaType = siteinfo.siteinfo_gsm5gAntennaType;
			siteinfo_gsmcabArrayObject.siteinfo_gsm5gAntennaType = siteinfo.siteinfo_gsm5gAntennaType;
			siteinfo_gsmcabArrayObject.siteinfo_gsm5gAntennaQty = siteinfo.siteinfo_gsm5gAntennaQty;
			siteinfo_gsmcabArrayObject.siteinfo_gsmOmniAntennaType = siteinfo.siteinfo_gsmOmniAntennaType;
			siteinfo_gsmcabArrayObject.siteinfo_gsmOmniAntennaQty = siteinfo.siteinfo_gsmOmniAntennaQty;
			siteinfo_gsmcabArrayObject.siteinfo_gsmTmaAntennaType = siteinfo.siteinfo_gsmTmaAntennaType;
			siteinfo_gsmcabArrayObject.siteinfo_gsmTmaAntennaQty = siteinfo.siteinfo_gsmTmaAntennaQty;
			siteinfo_gsmcabArrayObject.siteinfo_gsmBscAntennaType = siteinfo.siteinfo_gsmBscAntennaType;
			siteinfo_gsmcabArrayObject.siteinfo_gsmBscAntennaQty = siteinfo.siteinfo_gsmBscAntennaQty;
			siteinfo_gsmcabArrayObject.siteinfo_gsmTrauAntennaType = siteinfo.siteinfo_gsmTrauAntennaType;
			siteinfo_gsmcabArrayObject.siteinfo_gsmTrauAntennaQty = siteinfo.siteinfo_gsmTrauAntennaQty;
			siteinfo_gsmcabArrayObject.siteinfo_gsmRepeater = siteinfo.siteinfo_gsmRepeater;
			siteinfo_gsmcabArrayObject.siteinfo_gsmRepeaterQty = siteinfo.siteinfo_gsmRepeaterQty;
			siteinfo_gsmcabArrayObject.siteinfo_gsmcab = siteinfo.siteinfo_gsmcab;

			siteinfo.siteinfo_gsmcabArray.push(siteinfo_gsmcabArrayObject)
		}
	
	}

	//Internal DB
	siteinfo.siteinfo_internaldbArray = [];

	if(siteinfo.siteinfo_internaldb != "No"){

		if(Array.isArray(siteinfo.siteinfo_internaldbtype)){
			console.log("Internaldb passou daqui");
			for(i = 0; i < siteinfo.siteinfo_internaldbtype.length; i++){
				var siteinfo_internaldbArrayObject = {};

				siteinfo_internaldbArrayObject.siteinfo_internaldbtype = siteinfo.siteinfo_internaldbtype[i];
				siteinfo_internaldbArrayObject.siteinfo_internaldbPhase = siteinfo.siteinfo_internaldbPhase[i];
				siteinfo_internaldbArrayObject.siteinfo_internaldbmaincircuitbreaker = siteinfo.siteinfo_internaldbmaincircuitbreaker[i];
				siteinfo_internaldbArrayObject.siteinfo_internaldbsurgeArrestorType = siteinfo.siteinfo_internaldbsurgeArrestorType[i];
				siteinfo_internaldbArrayObject.siteinfo_internaldbsurgeArrestorQty = siteinfo.siteinfo_internaldbsurgeArrestorQty[i];
				siteinfo_internaldbArrayObject.siteinfo_internaldbsurgeArrestorType2 = siteinfo.siteinfo_internaldbsurgeArrestorType2[i];
				siteinfo_internaldbArrayObject.siteinfo_internaldbsurgeArrestorQty2 = siteinfo.siteinfo_internaldbsurgeArrestorQty2[i];
				siteinfo_internaldbArrayObject.siteinfo_internaldbcurrentmonitorType = siteinfo.siteinfo_internaldbcurrentmonitorType[i];
				siteinfo_internaldbArrayObject.siteinfo_internaldbCurrentMonitorQty = siteinfo.siteinfo_internaldbCurrentMonitorQty[i];
				siteinfo_internaldbArrayObject.siteinfo_internaldbEarthLeakageDevice = siteinfo.siteinfo_internaldbEarthLeakageDevice[i];
				siteinfo_internaldbArrayObject.siteinfo_internaldbEarthLeakageDeviceQty = siteinfo.siteinfo_internaldbEarthLeakageDeviceQty[i];
				siteinfo_internaldbArrayObject.siteinfo_internaldbCircuitBreakerforRectifier = siteinfo.siteinfo_internaldbCircuitBreakerforRectifier[i];
				siteinfo_internaldbArrayObject.siteinfo_internaldbinternaldbCircuitBreakerforRectifierQty = siteinfo.siteinfo_internaldbinternaldbCircuitBreakerforRectifierQty[i];
				siteinfo_internaldbArrayObject.siteinfo_internaldbCircuitBreakerforAirconditioners = siteinfo.siteinfo_internaldbCircuitBreakerforAirconditioners[i];
				siteinfo_internaldbArrayObject.siteinfo_internaldbCircuitBreakerforAirconditionersQty = siteinfo.siteinfo_internaldbCircuitBreakerforAirconditionersQty[i];
				siteinfo_internaldbArrayObject.siteinfo_internaldbCircuitBreakerforPlugs = siteinfo.siteinfo_internaldbCircuitBreakerforPlugs[i];
				siteinfo_internaldbArrayObject.siteinfo_internaldbCircuitBreakerforPlugsQty = siteinfo.siteinfo_internaldbCircuitBreakerforPlugsQty[i];
				siteinfo_internaldbArrayObject.siteinfo_internaldbMastInternalLight = siteinfo.siteinfo_internaldbMastInternalLight[i];
				siteinfo_internaldbArrayObject.siteinfo_internaldb_internaldbMastInternalLightQty = siteinfo.siteinfo_internaldb_internaldbMastInternalLightQty[i];
				siteinfo_internaldbArrayObject.siteinfo_internaldbContainerLight = siteinfo.siteinfo_internaldbContainerLight[i];
				siteinfo_internaldbArrayObject.siteinfo_internaldbContainerLightQty = siteinfo.siteinfo_internaldbContainerLightQty[i];
				siteinfo_internaldbArrayObject.siteinfo_internaldbSiteLight = siteinfo.siteinfo_internaldbSiteLight[i];
				siteinfo_internaldbArrayObject.siteinfo_internaldbSiteLightQty = siteinfo.siteinfo_internaldbSiteLightQty[i];
				siteinfo_internaldbArrayObject.siteinfo_internaldbAircraftWarningLight = siteinfo.siteinfo_internaldbAircraftWarningLight[i];
				siteinfo_internaldbArrayObject.siteinfo_internaldbAircraftWarningLightQty = siteinfo.siteinfo_internaldbAircraftWarningLightQty[i];
				siteinfo_internaldbArrayObject.siteinfo_internaldbCircuitBreakerSpareType = siteinfo.siteinfo_internaldbCircuitBreakerSpareType[i];
				siteinfo_internaldbArrayObject.siteinfo_internaldbCircuitBreakerSpareTypeQty = siteinfo.siteinfo_internaldbCircuitBreakerSpareTypeQty[i];
				
				console.log(siteinfo_internaldbArrayObject);
				siteinfo.siteinfo_internaldbArray.push(siteinfo_internaldbArrayObject)
				// siteinfo.siteinfo_internaldb = siteinfo_internaldbArrayObject.siteinfo_internaldb;

			}
		}else{

			var siteinfo_internaldbArrayObject = {};

				siteinfo_internaldbArrayObject.siteinfo_internaldbtype = siteinfo.siteinfo_internaldbtype;
				siteinfo_internaldbArrayObject.siteinfo_internaldbPhase = siteinfo.siteinfo_internaldbPhase;
				siteinfo_internaldbArrayObject.siteinfo_internaldbmaincircuitbreaker = siteinfo.siteinfo_internaldbmaincircuitbreaker;
				siteinfo_internaldbArrayObject.siteinfo_internaldbsurgeArrestorType = siteinfo.siteinfo_internaldbsurgeArrestorType;
				siteinfo_internaldbArrayObject.siteinfo_internaldbsurgeArrestorQty = siteinfo.siteinfo_internaldbsurgeArrestorQty;
				siteinfo_internaldbArrayObject.siteinfo_internaldbsurgeArrestorType2 = siteinfo.siteinfo_internaldbsurgeArrestorType2;
				siteinfo_internaldbArrayObject.siteinfo_internaldbsurgeArrestorQty2 = siteinfo.siteinfo_internaldbsurgeArrestorQty2;
				siteinfo_internaldbArrayObject.siteinfo_internaldbcurrentmonitorType = siteinfo.siteinfo_internaldbcurrentmonitorType;
				siteinfo_internaldbArrayObject.siteinfo_internaldbCurrentMonitorQty = siteinfo.siteinfo_internaldbCurrentMonitorQty;
				siteinfo_internaldbArrayObject.siteinfo_internaldbEarthLeakageDevice = siteinfo.siteinfo_internaldbEarthLeakageDevice;
				siteinfo_internaldbArrayObject.siteinfo_internaldbEarthLeakageDeviceQty = siteinfo.siteinfo_internaldbEarthLeakageDeviceQty;
				siteinfo_internaldbArrayObject.siteinfo_internaldbCircuitBreakerforRectifier = siteinfo.siteinfo_internaldbCircuitBreakerforRectifier;
				siteinfo_internaldbArrayObject.siteinfo_internaldbinternaldbCircuitBreakerforRectifierQty = siteinfo.siteinfo_internaldbinternaldbCircuitBreakerforRectifierQty;
				siteinfo_internaldbArrayObject.siteinfo_internaldbCircuitBreakerforAirconditioners = siteinfo.siteinfo_internaldbCircuitBreakerforAirconditioners;
				siteinfo_internaldbArrayObject.siteinfo_internaldbCircuitBreakerforAirconditionersQty = siteinfo.siteinfo_internaldbCircuitBreakerforAirconditionersQty;
				siteinfo_internaldbArrayObject.siteinfo_internaldbCircuitBreakerforPlugs = siteinfo.siteinfo_internaldbCircuitBreakerforPlugs;
				siteinfo_internaldbArrayObject.siteinfo_internaldbCircuitBreakerforPlugsQty = siteinfo.siteinfo_internaldbCircuitBreakerforPlugsQty;
				siteinfo_internaldbArrayObject.siteinfo_internaldbMastInternalLight = siteinfo.siteinfo_internaldbMastInternalLight;
				siteinfo_internaldbArrayObject.siteinfo_internaldb_internaldbMastInternalLightQty = siteinfo.siteinfo_internaldb_internaldbMastInternalLightQty;
				siteinfo_internaldbArrayObject.siteinfo_internaldbContainerLight = siteinfo.siteinfo_internaldbContainerLight;
				siteinfo_internaldbArrayObject.siteinfo_internaldbContainerLightQty = siteinfo.siteinfo_internaldbContainerLightQty;
				siteinfo_internaldbArrayObject.siteinfo_internaldbSiteLight = siteinfo.siteinfo_internaldbSiteLight;
				siteinfo_internaldbArrayObject.siteinfo_internaldbSiteLightQty = siteinfo.siteinfo_internaldbSiteLightQty;
				siteinfo_internaldbArrayObject.siteinfo_internaldbAircraftWarningLight = siteinfo.siteinfo_internaldbAircraftWarningLight;
				siteinfo_internaldbArrayObject.siteinfo_internaldbAircraftWarningLightQty = siteinfo.siteinfo_internaldbAircraftWarningLightQty;
				siteinfo_internaldbArrayObject.siteinfo_internaldbCircuitBreakerSpareType = siteinfo.siteinfo_internaldbCircuitBreakerSpareType;
				siteinfo_internaldbArrayObject.siteinfo_internaldbCircuitBreakerSpareTypeQty = siteinfo.siteinfo_internaldbCircuitBreakerSpareTypeQty;
				
				console.log(siteinfo_internaldbArrayObject)
				siteinfo.siteinfo_internaldbArray.push(siteinfo_internaldbArrayObject)
		}
	}


	//EXTERNAL DB
	siteinfo.siteinfo_externaldbArray = [];

	if(siteinfo.siteinfo_externaldb != "No"){

		if(Array.isArray(siteinfo.siteinfo_externaldbtype)){
			console.log("Externaldb passou daqui");
			for(i = 0; i < siteinfo.siteinfo_externaldbtype.length; i++){
				var siteinfo_externaldbArrayObject = {};

				siteinfo_externaldbArrayObject.siteinfo_externaldbtype = siteinfo.siteinfo_externaldbtype[i];
				siteinfo_externaldbArrayObject.siteinfo_externaldbSharing = siteinfo.siteinfo_externaldbSharing[i];
				siteinfo_externaldbArrayObject.siteinfo_externaldbPhase = siteinfo.siteinfo_externaldbPhase[i];
				siteinfo_externaldbArrayObject.siteinfo_externaldbGeneratorPlug = siteinfo.siteinfo_externaldbGeneratorPlug[i];
				siteinfo_externaldbArrayObject.siteinfo_externaldbmainIncomingIsolator = siteinfo.siteinfo_externaldbmainIncomingIsolator[i];
				siteinfo_externaldbArrayObject.siteinfo_externaldbneutralbarsqty = siteinfo.siteinfo_externaldbneutralbarsqty[i];
				siteinfo_externaldbArrayObject.siteinfo_externalPowerMonitorRelay = siteinfo.siteinfo_externalPowerMonitorRelay[i];
				siteinfo_externaldbArrayObject.siteinfo_externalPowerMonitorRelayType = siteinfo.siteinfo_externalPowerMonitorRelayType[i];
				siteinfo_externaldbArrayObject.siteinfo_externaldbSurgeArrestors = siteinfo.siteinfo_externaldbSurgeArrestors[i];
				siteinfo_externaldbArrayObject.siteinfo_externaldbSurgeArrestorsType = siteinfo.siteinfo_externaldbSurgeArrestorsType[i];
				siteinfo_externaldbArrayObject.siteinfo_externaldbCbForSharingParty = siteinfo.siteinfo_externaldbCbForSharingParty[i];
				siteinfo_externaldbArrayObject.siteinfo_externaldbCbForSharingPartyType = siteinfo.siteinfo_externaldbCbForSharingPartyType[i];
				siteinfo_externaldbArrayObject.siteinfo_externaldbKwhmeterForSharingParty = siteinfo.siteinfo_externaldbKwhmeterForSharingParty[i];
				siteinfo_externaldbArrayObject.siteinfo_externaldbKwhmeterForSharingPartyType = siteinfo.siteinfo_externaldbKwhmeterForSharingPartyType[i];
				siteinfo_externaldbArrayObject.siteinfo_externaldbForConstructionParty = siteinfo.siteinfo_externaldbForConstructionParty[i];
				siteinfo_externaldbArrayObject.siteinfo_externaldbForConstructionPartyType = siteinfo.siteinfo_externaldbForConstructionPartyType[i];
				siteinfo_externaldbArrayObject.siteinfo_externaldbForVdcInternaldb = siteinfo.siteinfo_externaldbForVdcInternaldb[i];
				siteinfo_externaldbArrayObject.siteinfo_externaldbForVdcInternaldbType = siteinfo.siteinfo_externaldbForVdcInternaldbType[i];
				siteinfo_externaldbArrayObject.siteinfo_externaldbForSiteLight = siteinfo.siteinfo_externaldbForSiteLight[i];
				siteinfo_externaldbArrayObject.siteinfo_externaldbForSiteLightType = siteinfo.siteinfo_externaldbForSiteLightType[i];
				siteinfo_externaldbArrayObject.siteinfo_externaldbForAwLight = siteinfo.siteinfo_externaldbForAwLight[i];
				siteinfo_externaldbArrayObject.siteinfo_externaldbForAwLightType = siteinfo.siteinfo_externaldbForAwLightType[i];
				siteinfo_externaldbArrayObject.siteinfo_externaldbForMobileGen = siteinfo.siteinfo_externaldbForMobileGen[i];
				siteinfo_externaldbArrayObject.siteinfo_externaldbForMobileGenType = siteinfo.siteinfo_externaldbForMobileGenType[i];
				siteinfo_externaldbArrayObject.siteinfo_externaldbForGenPhaseMonitor = siteinfo.siteinfo_externaldbForGenPhaseMonitor[i];
				siteinfo_externaldbArrayObject.siteinfo_externaldbForGenPhaseMonitorType = siteinfo.siteinfo_externaldbForGenPhaseMonitorType[i];
				siteinfo_externaldbArrayObject.siteinfo_externaldbForControlFuseforGen = siteinfo.siteinfo_externaldbForControlFuseforGen[i];
				siteinfo_externaldbArrayObject.siteinfo_externaldbForControlFuseforGenType = siteinfo.siteinfo_externaldbForControlFuseforGenType[i];
				siteinfo_externaldbArrayObject.siteinfo_externaldbForControlFuseRating = siteinfo.siteinfo_externaldbForControlFuseRating[i];
				siteinfo_externaldbArrayObject.siteinfo_externaldbForFeedCable = siteinfo.siteinfo_externaldbForFeedCable[i];
				siteinfo_externaldbArrayObject.siteinfo_externaldbForFeedCableLength = siteinfo.siteinfo_externaldbForFeedCableLength[i];
				siteinfo_externaldbArrayObject.siteinfo_externaldbForCableToVm = siteinfo.siteinfo_externaldbForCableToVm[i];
				siteinfo_externaldbArrayObject.siteinfo_externaldbForCableToVmLength = siteinfo.siteinfo_externaldbForCableToVmLength[i];
				siteinfo_externaldbArrayObject.siteinfo_externaldbAwlSurgeArrestor = siteinfo.siteinfo_externaldbAwlSurgeArrestor[i];
				siteinfo_externaldbArrayObject.siteinfo_externaldbAwlSurgeArrestorType = siteinfo.siteinfo_externaldbAwlSurgeArrestorType[i];
				siteinfo_externaldbArrayObject.siteinfo_externaldbAwlSurgeArrestorQty = siteinfo.siteinfo_externaldbAwlSurgeArrestorQty[i];
				siteinfo_externaldbArrayObject.siteinfo_externaldbCurrentMonitor = siteinfo.siteinfo_externaldbCurrentMonitor[i];
				siteinfo_externaldbArrayObject.siteinfo_externaldbCurrentMonitorType = siteinfo.siteinfo_externaldbCurrentMonitorType[i];
				siteinfo_externaldbArrayObject.siteinfo_externaldbChangeContactors = siteinfo.siteinfo_externaldbChangeContactors[i];
				
				
				console.log(siteinfo_externaldbArrayObject);
				siteinfo.siteinfo_externaldbArray.push(siteinfo_externaldbArrayObject)

			}
		}else{

			var siteinfo_externaldbArrayObject = {};

			siteinfo_externaldbArrayObject.siteinfo_externaldbtype = siteinfo.siteinfo_externaldbtype;
				siteinfo_externaldbArrayObject.siteinfo_externaldbSharing = siteinfo.siteinfo_externaldbSharing;
				siteinfo_externaldbArrayObject.siteinfo_externaldbPhase = siteinfo.siteinfo_externaldbPhase;
				siteinfo_externaldbArrayObject.siteinfo_externaldbGeneratorPlug = siteinfo.siteinfo_externaldbGeneratorPlug;
				siteinfo_externaldbArrayObject.siteinfo_externaldbmainIncomingIsolator = siteinfo.siteinfo_externaldbmainIncomingIsolator;
				siteinfo_externaldbArrayObject.siteinfo_externaldbneutralbarsqty = siteinfo.siteinfo_externaldbneutralbarsqty;
				siteinfo_externaldbArrayObject.siteinfo_externalPowerMonitorRelay = siteinfo.siteinfo_externalPowerMonitorRelay;
				siteinfo_externaldbArrayObject.siteinfo_externalPowerMonitorRelayType = siteinfo.siteinfo_externalPowerMonitorRelayType;
				siteinfo_externaldbArrayObject.siteinfo_externaldbSurgeArrestors = siteinfo.siteinfo_externaldbSurgeArrestors;
				siteinfo_externaldbArrayObject.siteinfo_externaldbSurgeArrestorsType = siteinfo.siteinfo_externaldbSurgeArrestorsType;
				siteinfo_externaldbArrayObject.siteinfo_externaldbCbForSharingParty = siteinfo.siteinfo_externaldbCbForSharingParty;
				siteinfo_externaldbArrayObject.siteinfo_externaldbCbForSharingPartyType = siteinfo.siteinfo_externaldbCbForSharingPartyType;
				siteinfo_externaldbArrayObject.siteinfo_externaldbKwhmeterForSharingParty = siteinfo.siteinfo_externaldbKwhmeterForSharingParty;
				siteinfo_externaldbArrayObject.siteinfo_externaldbKwhmeterForSharingPartyType = siteinfo.siteinfo_externaldbKwhmeterForSharingPartyType;
				siteinfo_externaldbArrayObject.siteinfo_externaldbForConstructionParty = siteinfo.siteinfo_externaldbForConstructionParty;
				siteinfo_externaldbArrayObject.siteinfo_externaldbForConstructionPartyType = siteinfo.siteinfo_externaldbForConstructionPartyType;
				siteinfo_externaldbArrayObject.siteinfo_externaldbForVdcInternaldb = siteinfo.siteinfo_externaldbForVdcInternaldb;
				siteinfo_externaldbArrayObject.siteinfo_externaldbForVdcInternaldbType = siteinfo.siteinfo_externaldbForVdcInternaldbType;
				siteinfo_externaldbArrayObject.siteinfo_externaldbForSiteLight = siteinfo.siteinfo_externaldbForSiteLight;
				siteinfo_externaldbArrayObject.siteinfo_externaldbForSiteLightType = siteinfo.siteinfo_externaldbForSiteLightType;
				siteinfo_externaldbArrayObject.siteinfo_externaldbForAwLight = siteinfo.siteinfo_externaldbForAwLight;
				siteinfo_externaldbArrayObject.siteinfo_externaldbForAwLightType = siteinfo.siteinfo_externaldbForAwLightType;
				siteinfo_externaldbArrayObject.siteinfo_externaldbForMobileGen = siteinfo.siteinfo_externaldbForMobileGen;
				siteinfo_externaldbArrayObject.siteinfo_externaldbForMobileGenType = siteinfo.siteinfo_externaldbForMobileGenType;
				siteinfo_externaldbArrayObject.siteinfo_externaldbForGenPhaseMonitor = siteinfo.siteinfo_externaldbForGenPhaseMonitor;
				siteinfo_externaldbArrayObject.siteinfo_externaldbForGenPhaseMonitorType = siteinfo.siteinfo_externaldbForGenPhaseMonitorType;
				siteinfo_externaldbArrayObject.siteinfo_externaldbForControlFuseforGen = siteinfo.siteinfo_externaldbForControlFuseforGen;
				siteinfo_externaldbArrayObject.siteinfo_externaldbForControlFuseforGenType = siteinfo.siteinfo_externaldbForControlFuseforGenType;
				siteinfo_externaldbArrayObject.siteinfo_externaldbForControlFuseRating = siteinfo.siteinfo_externaldbForControlFuseRating;
				siteinfo_externaldbArrayObject.siteinfo_externaldbForFeedCable = siteinfo.siteinfo_externaldbForFeedCable;
				siteinfo_externaldbArrayObject.siteinfo_externaldbForFeedCableLength = siteinfo.siteinfo_externaldbForFeedCableLength;
				siteinfo_externaldbArrayObject.siteinfo_externaldbForCableToVm = siteinfo.siteinfo_externaldbForCableToVm;
				siteinfo_externaldbArrayObject.siteinfo_externaldbForCableToVmLength = siteinfo.siteinfo_externaldbForCableToVmLength;
				siteinfo_externaldbArrayObject.siteinfo_externaldbAwlSurgeArrestor = siteinfo.siteinfo_externaldbAwlSurgeArrestor;
				siteinfo_externaldbArrayObject.siteinfo_externaldbAwlSurgeArrestorType = siteinfo.siteinfo_externaldbAwlSurgeArrestorType;
				siteinfo_externaldbArrayObject.siteinfo_externaldbAwlSurgeArrestorQty = siteinfo.siteinfo_externaldbAwlSurgeArrestorQty;
				siteinfo_externaldbArrayObject.siteinfo_externaldbCurrentMonitor = siteinfo.siteinfo_externaldbCurrentMonitor;
				siteinfo_externaldbArrayObject.siteinfo_externaldbCurrentMonitorType = siteinfo.siteinfo_externaldbCurrentMonitorType;
				siteinfo_externaldbArrayObject.siteinfo_externaldbChangeContactors = siteinfo.siteinfo_externaldbChangeContactors;

				// siteinfo_externaldbArrayObject.siteinfo_ = siteinfo.siteinfo_;
				console.log(siteinfo_externaldbArrayObject)
				siteinfo.siteinfo_externaldbArray.push(siteinfo_externaldbArrayObject);
		}
	}



	//Distribution Rack
	siteinfo.siteinfo_distributionrackArray = [];

	if(siteinfo.siteinfo_distributionRackInstalled != "No"){

		if(Array.isArray(siteinfo.siteinfo_distribuitionRackInverters)){
			console.log("Distribution passou daqui");
			for(i = 0; i < siteinfo.siteinfo_distribuitionRackInverters.length; i++){
				var siteinfo_distributionrackArrayObject = {};

				siteinfo_distributionrackArrayObject.siteinfo_distribuitionRackInverters = siteinfo.siteinfo_distribuitionRackInverters[i];
				siteinfo_distributionrackArrayObject.siteinfo_distribuitionRackInvertersType = siteinfo.siteinfo_distribuitionRackInvertersType[i];
				siteinfo_distributionrackArrayObject.siteinfo_distribuitionRackVaRating = siteinfo.siteinfo_distribuitionRackVaRating[i];
				siteinfo_distributionrackArrayObject.siteinfo_distribuitionRackInvertQty = siteinfo.siteinfo_distribuitionRackInvertQty[i];
				siteinfo_distributionrackArrayObject.siteinfo_distribuitionRackDcInput = siteinfo.siteinfo_distribuitionRackDcInput[i];
				siteinfo_distributionrackArrayObject.siteinfo_distribuitionRackACOutput = siteinfo.siteinfo_distribuitionRackACOutput[i];
				siteinfo_distributionrackArrayObject.siteinfo_distribuitionRackRedudancyctrller = siteinfo.siteinfo_distribuitionRackRedudancyctrller[i];

				
				console.log(siteinfo_distributionrackArrayObject);
				siteinfo.siteinfo_distributionrackArray.push(siteinfo_distributionrackArrayObject)

			}
		}else{
			console.log("Distribution não é array");
			var siteinfo_distributionrackArrayObject = {};

			siteinfo_distributionrackArrayObject.siteinfo_distribuitionRackInverters = siteinfo.siteinfo_distribuitionRackInverters;
			siteinfo_distributionrackArrayObject.siteinfo_distribuitionRackInvertersType = siteinfo.siteinfo_distribuitionRackInvertersType;
			siteinfo_distributionrackArrayObject.siteinfo_distribuitionRackVaRating = siteinfo.siteinfo_distribuitionRackVaRating;
			siteinfo_distributionrackArrayObject.siteinfo_distribuitionRackInvertQty = siteinfo.siteinfo_distribuitionRackInvertQty;
			siteinfo_distributionrackArrayObject.siteinfo_distribuitionRackDcInput = siteinfo.siteinfo_distribuitionRackDcInput;
			siteinfo_distributionrackArrayObject.siteinfo_distribuitionRackACOutput = siteinfo.siteinfo_distribuitionRackACOutput;
			siteinfo_distributionrackArrayObject.siteinfo_distribuitionRackRedudancyctrller = siteinfo.siteinfo_distribuitionRackRedudancyctrller;

				
			console.log(siteinfo_distributionrackArrayObject);
			siteinfo.siteinfo_distributionrackArray.push(siteinfo_distributionrackArrayObject)

				
		}
	}


	//Transmission Cabinet
	siteinfo.siteinfo_transmissioncabinetArray = [];

	if(siteinfo.siteinfo_transmissioncabInstalled != "No"){

		if(Array.isArray(siteinfo.siteinfo_transmissioncabType)){
			console.log("Transmission passou daqui");
			for(i = 0; i < siteinfo.siteinfo_transmissioncabType.length; i++){
				var siteinfo_transmissioncabinetArrayObject = {};

				siteinfo_transmissioncabinetArrayObject.siteinfo_transmissioncabType = siteinfo.siteinfo_transmissioncabType[i];
				siteinfo_transmissioncabinetArrayObject.siteinfo_transmissioncabServiceProvider = siteinfo.siteinfo_transmissioncabServiceProvider[i];
				siteinfo_transmissioncabinetArrayObject.siteinfo_transmissioncabQty = siteinfo.siteinfo_transmissioncabQty[i];

				
				console.log(siteinfo_transmissioncabinetArrayObject);
				siteinfo.siteinfo_transmissioncabinetArray.push(siteinfo_transmissioncabinetArrayObject)

			}
		}else{

			console.log("Transmission Não é Array");

			var siteinfo_transmissioncabinetArrayObject = {};

			siteinfo_transmissioncabinetArrayObject.siteinfo_transmissioncabType = siteinfo.siteinfo_transmissioncabType;
			siteinfo_transmissioncabinetArrayObject.siteinfo_transmissioncabServiceProvider = siteinfo.siteinfo_transmissioncabServiceProvider;
			siteinfo_transmissioncabinetArrayObject.siteinfo_transmissioncabQty = siteinfo.siteinfo_transmissioncabQty;


				
			console.log(siteinfo_transmissioncabinetArrayObject);
			siteinfo.siteinfo_transmissioncabinetArray.push(siteinfo_transmissioncabinetArrayObject)

				
		}
	}



	//ADDITIONAL TRANSFORMERS
	siteinfo.siteinfo_additionaltransformerArray = [];

	if(siteinfo.siteinfo_additionaltransformers != "No"){

		if(Array.isArray(siteinfo.siteinfo_additionaltransformersType)){
			console.log("Externaldb passou daqui");
			for(i = 0; i < siteinfo.siteinfo_additionaltransformersType.length; i++){
				var siteinfo_additionaltransformerObject = {};

				siteinfo_additionaltransformerObject.siteinfo_additionaltransformersType = siteinfo.siteinfo_additionaltransformersType[i];
				siteinfo_additionaltransformerObject.siteinfo_additionaltransformersSerialNo = siteinfo.siteinfo_additionaltransformersSerialNo[i];
				siteinfo_additionaltransformerObject.siteinfo_additionaltransformersManufacturedDate = siteinfo.siteinfo_additionaltransformersManufacturedDate[i];
				siteinfo_additionaltransformerObject.siteinfo_additionaltransformersCable = siteinfo.siteinfo_additionaltransformersCable[i];
				siteinfo_additionaltransformerObject.siteinfo_additionaltransformersCableLength = siteinfo.siteinfo_additionaltransformersCableLength[i];
				siteinfo_additionaltransformerObject.siteinfo_additionaltransformersdataFrequency = siteinfo.siteinfo_additionaltransformersdataFrequency[i];
				siteinfo_additionaltransformerObject.siteinfo_additionaltransformersdataRating = siteinfo.siteinfo_additionaltransformersdataRating[i];
				siteinfo_additionaltransformerObject.siteinfo_additionaltransformersdataPrimaryVoltage = siteinfo.siteinfo_additionaltransformersdataPrimaryVoltage[i];
				siteinfo_additionaltransformerObject.siteinfo_additionaltransformersdataPrimaryAmpere = siteinfo.siteinfo_additionaltransformersdataPrimaryAmpere[i];
				siteinfo_additionaltransformerObject.siteinfo_additionaltransformersdataSecondaryVoltage = siteinfo.siteinfo_additionaltransformersdataSecondaryVoltage[i];
				siteinfo_additionaltransformerObject.siteinfo_additionaltransformersdataSecondaryAmpere = siteinfo.siteinfo_additionaltransformersdataSecondaryAmpere[i];
				siteinfo_additionaltransformerObject.siteinfo_additionaltransformersdataImpendance = siteinfo.siteinfo_additionaltransformersdataImpendance[i];
				siteinfo_additionaltransformerObject.siteinfo_additionaltransformersdataSymbol = siteinfo.siteinfo_additionaltransformersdataSymbol[i];
				siteinfo_additionaltransformerObject.siteinfo_additionaltransformersdataOtherInfo = siteinfo.siteinfo_additionaltransformersdataOtherInfo[i];
				
				
				console.log(siteinfo_additionaltransformerObject);
				siteinfo.siteinfo_additionaltransformerArray.push(siteinfo_additionaltransformerObject)

			}
		}else{

			var siteinfo_additionaltransformerObject = {};

				siteinfo_additionaltransformerObject.siteinfo_additionaltransformersType = siteinfo.siteinfo_additionaltransformersType;
				siteinfo_additionaltransformerObject.siteinfo_additionaltransformersSerialNo = siteinfo.siteinfo_additionaltransformersSerialNo;
				siteinfo_additionaltransformerObject.siteinfo_additionaltransformersManufacturedDate = siteinfo.siteinfo_additionaltransformersManufacturedDate;
				siteinfo_additionaltransformerObject.siteinfo_additionaltransformersCable = siteinfo.siteinfo_additionaltransformersCable;
				siteinfo_additionaltransformerObject.siteinfo_additionaltransformersCableLength = siteinfo.siteinfo_additionaltransformersCableLength;
				siteinfo_additionaltransformerObject.siteinfo_additionaltransformersdataFrequency = siteinfo.siteinfo_additionaltransformersdataFrequency;
				siteinfo_additionaltransformerObject.siteinfo_additionaltransformersdataRating = siteinfo.siteinfo_additionaltransformersdataRating;
				siteinfo_additionaltransformerObject.siteinfo_additionaltransformersdataPrimaryVoltage = siteinfo.siteinfo_additionaltransformersdataPrimaryVoltage;
				siteinfo_additionaltransformerObject.siteinfo_additionaltransformersdataPrimaryAmpere = siteinfo.siteinfo_additionaltransformersdataPrimaryAmpere;
				siteinfo_additionaltransformerObject.siteinfo_additionaltransformersdataSecondaryVoltage = siteinfo.siteinfo_additionaltransformersdataSecondaryVoltage;
				siteinfo_additionaltransformerObject.siteinfo_additionaltransformersdataSecondaryAmpere = siteinfo.siteinfo_additionaltransformersdataSecondaryAmpere;
				siteinfo_additionaltransformerObject.siteinfo_additionaltransformersdataImpendance = siteinfo.siteinfo_additionaltransformersdataImpendance;
				siteinfo_additionaltransformerObject.siteinfo_additionaltransformersdataSymbol = siteinfo.siteinfo_additionaltransformersdataSymbol;
				siteinfo_additionaltransformerObject.siteinfo_additionaltransformersdataOtherInfo = siteinfo.siteinfo_additionaltransformersdataOtherInfo;

				// siteinfo_additionaltransformerObject.siteinfo_ = siteinfo.siteinfo_;
				console.log(siteinfo_additionaltransformerObject)
				siteinfo.siteinfo_additionaltransformerArray.push(siteinfo_additionaltransformerObject);
		}
	}
	

	

	// GSM
	siteinfo.siteinfo_gsmcabArray = [];
	

	if(siteinfo.siteinfo_gsmcab != "No"){

		if(Array.isArray(siteinfo.siteinfo_gsmEquipmentType)){

			console.log("Entrou aqui");
			for( i = 0; i < siteinfo.siteinfo_gsmEquipmentType.length; i++){
				var siteinfo_gsmcabArrayObject = {};
				
				siteinfo_gsmcabArrayObject.siteinfo_gsmEquipmentType = siteinfo.siteinfo_gsmEquipmentType[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsmSiteConfig = siteinfo.siteinfo_gsmSiteConfig[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsm900AntennaType = siteinfo.siteinfo_gsm900AntennaType[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsm900AntennaQty = siteinfo.siteinfo_gsm900AntennaQty[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsm900TmaInstalled = siteinfo.siteinfo_gsm900TmaInstalled[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsm1800AntennaType = siteinfo.siteinfo_gsm1800AntennaType[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsm1800AntennaQty = siteinfo.siteinfo_gsm1800AntennaQty[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsm1800TmaInstalled = siteinfo.siteinfo_gsm1800TmaInstalled[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsm3gAntennaType = siteinfo.siteinfo_gsm3gAntennaType[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsm3gAntennaQty = siteinfo.siteinfo_gsm3gAntennaQty[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsm3gTmaInstalled = siteinfo.siteinfo_gsm3gTmaInstalled[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsm4gAntennaType = siteinfo.siteinfo_gsm4gAntennaType[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsm4gAntennaQty = siteinfo.siteinfo_gsm4gAntennaQty[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsm4gTmaInstalled = siteinfo.siteinfo_gsm4gTmaInstalled[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsm5gAntennaType = siteinfo.siteinfo_gsm5gAntennaType[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsm5gAntennaType = siteinfo.siteinfo_gsm5gAntennaType[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsm5gAntennaQty = siteinfo.siteinfo_gsm5gAntennaQty[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsmOmniAntennaType = siteinfo.siteinfo_gsmOmniAntennaType[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsmOmniAntennaQty = siteinfo.siteinfo_gsmOmniAntennaQty[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsmTmaAntennaType = siteinfo.siteinfo_gsmTmaAntennaType[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsmTmaAntennaQty = siteinfo.siteinfo_gsmTmaAntennaQty[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsmBscAntennaType = siteinfo.siteinfo_gsmBscAntennaType[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsmBscAntennaQty = siteinfo.siteinfo_gsmBscAntennaQty[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsmTrauAntennaType = siteinfo.siteinfo_gsmTrauAntennaType[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsmTrauAntennaQty = siteinfo.siteinfo_gsmTrauAntennaQty[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsmRepeater = siteinfo.siteinfo_gsmRepeater[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsmRepeaterQty = siteinfo.siteinfo_gsmRepeaterQty[i];
				siteinfo_gsmcabArrayObject.siteinfo_gsmcab = siteinfo.siteinfo_gsmcab[i];

				siteinfo.siteinfo_gsmcabArray.push(siteinfo_gsmcabArrayObject)

		        
		    }

		}else{
			console.log("Passou daqui");
			var siteinfo_gsmcabArrayObject = {};

			siteinfo_gsmcabArrayObject.siteinfo_gsmEquipmentType = siteinfo.siteinfo_gsmEquipmentType;
			siteinfo_gsmcabArrayObject.siteinfo_gsmSiteConfig = siteinfo.siteinfo_gsmSiteConfig;
			siteinfo_gsmcabArrayObject.siteinfo_gsm900AntennaType = siteinfo.siteinfo_gsm900AntennaType;
			siteinfo_gsmcabArrayObject.siteinfo_gsm900AntennaQty = siteinfo.siteinfo_gsm900AntennaQty;
			siteinfo_gsmcabArrayObject.siteinfo_gsm900TmaInstalled = siteinfo.siteinfo_gsm900TmaInstalled;
			siteinfo_gsmcabArrayObject.siteinfo_gsm1800AntennaType = siteinfo.siteinfo_gsm1800AntennaType;
			siteinfo_gsmcabArrayObject.siteinfo_gsm1800AntennaQty = siteinfo.siteinfo_gsm1800AntennaQty;
			siteinfo_gsmcabArrayObject.siteinfo_gsm1800TmaInstalled = siteinfo.siteinfo_gsm1800TmaInstalled;
			siteinfo_gsmcabArrayObject.siteinfo_gsm3gAntennaType = siteinfo.siteinfo_gsm3gAntennaType;
			siteinfo_gsmcabArrayObject.siteinfo_gsm3gAntennaQty = siteinfo.siteinfo_gsm3gAntennaQty;
			siteinfo_gsmcabArrayObject.siteinfo_gsm3gTmaInstalled = siteinfo.siteinfo_gsm3gTmaInstalled;
			siteinfo_gsmcabArrayObject.siteinfo_gsm4gAntennaType = siteinfo.siteinfo_gsm4gAntennaType;
			siteinfo_gsmcabArrayObject.siteinfo_gsm4gAntennaQty = siteinfo.siteinfo_gsm4gAntennaQty;
			siteinfo_gsmcabArrayObject.siteinfo_gsm4gTmaInstalled = siteinfo.siteinfo_gsm4gTmaInstalled;
			siteinfo_gsmcabArrayObject.siteinfo_gsm5gAntennaType = siteinfo.siteinfo_gsm5gAntennaType;
			siteinfo_gsmcabArrayObject.siteinfo_gsm5gAntennaType = siteinfo.siteinfo_gsm5gAntennaType;
			siteinfo_gsmcabArrayObject.siteinfo_gsm5gAntennaQty = siteinfo.siteinfo_gsm5gAntennaQty;
			siteinfo_gsmcabArrayObject.siteinfo_gsmOmniAntennaType = siteinfo.siteinfo_gsmOmniAntennaType;
			siteinfo_gsmcabArrayObject.siteinfo_gsmOmniAntennaQty = siteinfo.siteinfo_gsmOmniAntennaQty;
			siteinfo_gsmcabArrayObject.siteinfo_gsmTmaAntennaType = siteinfo.siteinfo_gsmTmaAntennaType;
			siteinfo_gsmcabArrayObject.siteinfo_gsmTmaAntennaQty = siteinfo.siteinfo_gsmTmaAntennaQty;
			siteinfo_gsmcabArrayObject.siteinfo_gsmBscAntennaType = siteinfo.siteinfo_gsmBscAntennaType;
			siteinfo_gsmcabArrayObject.siteinfo_gsmBscAntennaQty = siteinfo.siteinfo_gsmBscAntennaQty;
			siteinfo_gsmcabArrayObject.siteinfo_gsmTrauAntennaType = siteinfo.siteinfo_gsmTrauAntennaType;
			siteinfo_gsmcabArrayObject.siteinfo_gsmTrauAntennaQty = siteinfo.siteinfo_gsmTrauAntennaQty;
			siteinfo_gsmcabArrayObject.siteinfo_gsmRepeater = siteinfo.siteinfo_gsmRepeater;
			siteinfo_gsmcabArrayObject.siteinfo_gsmRepeaterQty = siteinfo.siteinfo_gsmRepeaterQty;
			siteinfo_gsmcabArrayObject.siteinfo_gsmcab = siteinfo.siteinfo_gsmcab;

			siteinfo.siteinfo_gsmcabArray.push(siteinfo_gsmcabArrayObject)
		}
			
		

	}





	siteinfo.siteinfo_generatorArray = [];

	if(siteinfo.siteinfo_generator != "No"){

		if(Array.isArray(siteinfo.siteinfo_generatorhours)){


			for( i = 0; i < siteinfo.siteinfo_generatorhours.length; i++){
				var siteinfo_generatorArrayObject = {};

				siteinfo_generatorArrayObject.siteinfo_generatorhours = siteinfo.siteinfo_generatorhours[i];
				siteinfo_generatorArrayObject.siteinfo_generatortype = siteinfo.siteinfo_generatortype[i];
				siteinfo_generatorArrayObject.siteinfo_generatoroutputkw = siteinfo.siteinfo_generatoroutputkw[i];
				siteinfo_generatorArrayObject.siteinfo_generatormodelno = siteinfo.siteinfo_generatormodelno[i];
				siteinfo_generatorArrayObject.siteinfo_generatorengineserialnumber = siteinfo.siteinfo_generatorengineserialnumber[i];
				siteinfo_generatorArrayObject.siteinfo_generatorenginecapacity = siteinfo.siteinfo_generatorenginecapacity[i];
				siteinfo_generatorArrayObject.siteinfo_generatorstartertype = siteinfo.siteinfo_generatorstartertype[i];
				siteinfo_generatorArrayObject.siteinfo_generatorfuelconsumption = siteinfo.siteinfo_generatorfuelconsumption[i];
				
				siteinfo.siteinfo_generatorArray.push(siteinfo_generatorArrayObject)

		        
		    }

		}else{

			var siteinfo_generatorArrayObject = {};

			siteinfo_generatorArrayObject.siteinfo_generatorhours = siteinfo.siteinfo_generatorhours;
			siteinfo_generatorArrayObject.siteinfo_generatortype = siteinfo.siteinfo_generatortype;
			siteinfo_generatorArrayObject.siteinfo_generatoroutputkw = siteinfo.siteinfo_generatoroutputkw;
			siteinfo_generatorArrayObject.siteinfo_generatormodelno = siteinfo.siteinfo_generatormodelno;
			siteinfo_generatorArrayObject.siteinfo_generatorengineserialnumber = siteinfo.siteinfo_generatorengineserialnumber;
			siteinfo_generatorArrayObject.siteinfo_generatorenginecapacity = siteinfo.siteinfo_generatorenginecapacity;
			siteinfo_generatorArrayObject.siteinfo_generatorstartertype = siteinfo.siteinfo_generatorstartertype;
			siteinfo_generatorArrayObject.siteinfo_generatorfuelconsumption = siteinfo.siteinfo_generatorfuelconsumption;
			
			siteinfo.siteinfo_generatorArray.push(siteinfo_generatorArrayObject)
		}
			

	}
	


    siteinfo.siteinfo_acArray = [];
	

	if(siteinfo.siteinfo_ac != "No"){

		if(Array.isArray(siteinfo.siteinfo_acmanufacturer)){

			for( i = 0; i < siteinfo.siteinfo_acmanufacturer.length; i++){

				var siteinfo_acArrayObject = {};
				siteinfo_acArrayObject.siteinfo_acmanufacturer = siteinfo.siteinfo_acmanufacturer[i];
				siteinfo_acArrayObject.siteinfo_actype = siteinfo.siteinfo_actype[i];
				siteinfo_acArrayObject.siteinfo_acmodel = siteinfo.siteinfo_acmodel[i];
				siteinfo_acArrayObject.siteinfo_acnumbersiteinfo_acnumber = siteinfo.siteinfo_acnumber[i];
				siteinfo_acArrayObject.siteinfo_acserialnumber = siteinfo.siteinfo_acserialnumber[i];
				siteinfo_acArrayObject.siteinfo_acbtu = siteinfo.siteinfo_acbtu[i];
				siteinfo_acArrayObject.siteinfo_accageinstalled = siteinfo.siteinfo_accageinstalled[i];
				siteinfo_acArrayObject.siteinfo_acsleeveinstalled = siteinfo.siteinfo_acsleeveinstalled[i];
				siteinfo_acArrayObject.siteinfo_acunitcontrolltype = siteinfo.siteinfo_acunitcontrolltype[i];
				siteinfo_acArrayObject.siteinfo_accontrollermodel = siteinfo.siteinfo_accontrollermodel[i];
				
				siteinfo.siteinfo_acArray.push(siteinfo_acArrayObject)

        
    		}
		}else{

			var siteinfo_acArrayObject = {};
			siteinfo_acArrayObject.siteinfo_acmanufacturer = siteinfo.siteinfo_acmanufacturer;
			siteinfo_acArrayObject.siteinfo_actype = siteinfo.siteinfo_actype;
			siteinfo_acArrayObject.siteinfo_acmodel = siteinfo.siteinfo_acmodel;
			siteinfo_acArrayObject.siteinfo_acnumbersiteinfo_acnumber = siteinfo.siteinfo_acnumber;
			siteinfo_acArrayObject.siteinfo_acserialnumber = siteinfo.siteinfo_acserialnumber;
			siteinfo_acArrayObject.siteinfo_acbtu = siteinfo.siteinfo_acbtu;
			siteinfo_acArrayObject.siteinfo_accageinstalled = siteinfo.siteinfo_accageinstalled;
			siteinfo_acArrayObject.siteinfo_acsleeveinstalled = siteinfo.siteinfo_acsleeveinstalled;
			siteinfo_acArrayObject.siteinfo_acunitcontrolltype = siteinfo.siteinfo_acunitcontrolltype;
			siteinfo_acArrayObject.siteinfo_accontrollermodel = siteinfo.siteinfo_accontrollermodel;
			
			siteinfo.siteinfo_acArray.push(siteinfo_acArrayObject)

		}

		
	}

	

    siteinfo.siteinfo_rectcabArray = [];

    if(siteinfo.siteinfo_rectifiercabinnet != "No"){

    	if(Array.isArray(siteinfo.siteinfo_rectcabcabinetmodelno)){

	    	

			for( i = 0; i < siteinfo.siteinfo_rectcabcabinetmodelno.length; i++){
				var siteinfo_rectcabArrayObject = {};

				siteinfo_rectcabArrayObject.siteinfo_rectcabcabinetmodelno = siteinfo.siteinfo_rectcabcabinetmodelno[i];
				siteinfo_rectcabArrayObject.siteinfo_rectcabcabinetnumber = siteinfo.siteinfo_rectcabcabinetnumber[i];
				siteinfo_rectcabArrayObject.siteinfo_rectcabtype = siteinfo.siteinfo_rectcabtype[i];
				siteinfo_rectcabArrayObject.siteinfo_rectcabinputtype = siteinfo.siteinfo_rectcabinputtype[i];
				siteinfo_rectcabArrayObject.siteinfo_rectcabnobatteries = siteinfo.siteinfo_rectcabnobatteries[i];
				siteinfo_rectcabArrayObject.siteinfo_rectcabbatterycapac = siteinfo.siteinfo_rectcabbatterycapac[i];
				
				siteinfo.siteinfo_rectcabArray.push(siteinfo_rectcabArrayObject)

		        
		    }
    	}else{
    		var siteinfo_rectcabArrayObject = {};

    		siteinfo_rectcabArrayObject.siteinfo_rectcabcabinetmodelno = siteinfo.siteinfo_rectcabcabinetmodelno;
			siteinfo_rectcabArrayObject.siteinfo_rectcabcabinetnumber = siteinfo.siteinfo_rectcabcabinetnumber;
			siteinfo_rectcabArrayObject.siteinfo_rectcabtype = siteinfo.siteinfo_rectcabtype;
			siteinfo_rectcabArrayObject.siteinfo_rectcabinputtype = siteinfo.siteinfo_rectcabinputtype;
			siteinfo_rectcabArrayObject.siteinfo_rectcabnobatteries = siteinfo.siteinfo_rectcabnobatteries;
			siteinfo_rectcabArrayObject.siteinfo_rectcabbatterycapac = siteinfo.siteinfo_rectcabbatterycapac;
				
			siteinfo.siteinfo_rectcabArray.push(siteinfo_rectcabArrayObject)
    	}

	    
    }
	

    siteinfo.siteinfo_securityArray = [];

	if(siteinfo.siteinfo_guardsite != "No"){

		if(Array.isArray(siteinfo.siteinfo_secguardname)){

			for( i = 0; i < siteinfo.siteinfo_secguardname.length; i++){

				var siteinfo_securityArrayObject = {};

				siteinfo_securityArrayObject.siteinfo_secguardname = siteinfo.siteinfo_secguardname[i];
				siteinfo_securityArrayObject.siteinfo_secbinumber = siteinfo.siteinfo_secbinumber[i];
				siteinfo_securityArrayObject.siteinfo_secnib = siteinfo.siteinfo_secnib[i];
				siteinfo_securityArrayObject.siteinfo_secvalue = siteinfo.siteinfo_secvalue[i];
				
				siteinfo.siteinfo_securityArray.push(siteinfo_securityArrayObject)

	        
	    	}
		}else{

			var siteinfo_securityArrayObject = {};

				siteinfo_securityArrayObject.siteinfo_secguardname = siteinfo.siteinfo_secguardname;
				siteinfo_securityArrayObject.siteinfo_secbinumber = siteinfo.siteinfo_secbinumber;
				siteinfo_securityArrayObject.siteinfo_secnib = siteinfo.siteinfo_secnib;
				siteinfo_securityArrayObject.siteinfo_secvalue = siteinfo.siteinfo_secvalue;
				
				siteinfo.siteinfo_securityArray.push(siteinfo_securityArrayObject)


		}

	}

	

    var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
        var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
        var ano = (new Date()).getFullYear();
        // var todaydate = dia + "/" + mes + "/" + ano;
        var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

        siteinfo.siteinfo_audittrail = [];
        var siteinfo_audittrailObject = {};
        siteinfo_audittrailObject.siteinfo_audittrailname = userData.nome;
        siteinfo_audittrailObject.siteinfo_audittrailaction = "Create Site";
        siteinfo_audittrailObject.siteinfo_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

        siteinfo.siteinfo_audittrail.push(siteinfo_audittrailObject);


	var procura = await siteinfos.find({}, function(err, data){
		if(err){
            console.log(err);
        }else{
        	console.log("Find Site Info")
        }
	}).sort({_id:-1});

	console.log(procura[0])


	if(procura.length == 0){

		cont2 = "SI/" + mes + "/" + ano + "/" + "0001";
		siteinfo.siteinfo_cod = cont2;

		siteinfos.gravarDados(siteinfo, function(err){
	        if(err){
	        	console.log("Ocorreu um erro ao tentar gravar os dados!\n contacte o administrador do sistema1");
				console.log(err); 
	        }else{
	            console.log("Site Info gravado com sucesso!");
	        }
	    });
	}else{

		cont = procura[0].siteinfo_cod.split("/");
		
		cont1 = parseInt(cont[3]) + 1;
		console.log(cont1)
		if(cont1 < 10){
            cont2 = "SI/" + mes + "/" + ano + "/000" + cont1;
        }else 
            if((cont1 > 10) && (cont1 < 100) ){
                cont2 = "SI/" + mes + "/" + ano + "/00" + cont1;
            }else
                if((cont1 > 100) && (cont1 < 1000) ){
                    cont2 = "SI/" + mes + "/" + ano + "/0" + cont1;
                }else{
                    cont2 = "SI/" + mes + "/" + ano + "/" + cont1;
                }

        siteinfo.siteinfo_cod = cont2;

        siteinfos.gravarDados(siteinfo, function(err){
        	if(err){

        		if(err.code == 11000){

					cont3 = parseInt(cont1) + 1;

					if(cont3 < 10){
				        cont4 = "SI/" + mes + "/" + ano + "/000" + cont3;
				    }else 
				        if((cont3 > 10) && (cont3 < 100) ){
				            cont4 = "SI/" + mes + "/" + ano + "/00" + cont3;
				        }else
				            if((cont3 > 100) && (cont3 < 1000) ){
				                cont4 = "SI/" + mes + "/" + ano + "/0" + cont3;
				            }else{
				                cont4 = "SI/" + mes + "/" + ano + "/" + cont3;
				            }

				    siteinfo.siteinfo_cod = cont4;
				    siteinfos.gravarDados(siteinfo, function(err){
				        if(err){
				        	console.log("Ocorreu um erro ao tentar gravar os dados!\n contacte o administrador do sistema1");
							console.log(err); 
				        }else{
				            console.log("Site Info gravado com sucesso!");
				        }
				    });
				}
				else{
					console.log("Ocorreu um erro ao tentar gravar os dados!\n contacte o administrador do sistema2");
					console.log(err)
				}

        	}else{

        		console.log("Site Info gravado com sucesso!");

        	}
        });
	}

	

	res.redirect("/inicio");
});

router.get("/detalhesSiteinfo/:id",  function(req, res){
	var userData= req.session.usuario;

	siteinfos.find({_id:req.params.id}, function(err, data){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}
		else{

			res.render("site_info", {DataU:userData, Siteinfos:data, title: 'EAGLEI'});

		}
	});

});

router.get("/editarSite/:id",  function(req, res){
	var userData= req.session.usuario;

	clientes.find({}, function(err, dataClientes){

		if(err){
			console.log("Ocorreu um erro ao tentar gravar os dados!\n contacte o administrador do sistema");
			console.log(err)
		}else{
			usuarios.find({}, function(err, dataUsuarios){
				if(err){
					console.log("Ocorreu um erro ao tentar gravar os dados!\n contacte o administrador do sistema");
					console.log(err)
				}else{
					siteinfos.find({}, function(err, dataSiteInfoLista){
						if(err){
							console.log("Ocorreu um erro ao tentar gravar os dados!\n contacte o administrador do sistema");
							console.log(err)
						}else{
							siteinfos.find({_id:req.params.id}, function(err, dataSiteInfo){
								if(err){
									console.log("Ocorreu um erro ao tentar gravar os dados!\n contacte o administrador do sistema");
									console.log(err)
								}else{
									var listaareas = listaprovincia[dataSiteInfo[0].siteinfo_regiao];
									console.log(listaareas);
									res.render("site_infoedit", {DataU:userData, ListaAreas: listaareas, Clientes:dataClientes, ListaSites:dataSiteInfoLista, Clientes1:JSON.stringify(dataClientes), Usuarios:dataUsuarios, Usuarios1:JSON.stringify(dataUsuarios), Siteinfos: dataSiteInfo, Siteinfos1:JSON.stringify(dataSiteInfo), title: 'EAGLEI'})
								}
							});
						}
					}).sort({siteinfo_sitenum:1});
					
				}
			}).sort({nome:1});
			
		}

	}).sort({cliente_nome:1});

});

// function gravarSiteInfo(siteinfo, cont1){
//     //cont1 = cont1 + 1;

//     var cont3;

//    if(cont1 < 10){
//         cont3 = "SI/" + mes + "/" + ano + "/000" + cont1;
//     }else 
//         if((cont1 > 10) && (cont1 < 100) ){
//             cont3 = "SI/" + mes + "/" + ano + "/00" + cont1;
//         }else
//             if((cont1 > 100) && (cont1 < 1000) ){
//                 cont3 = "SI/" + mes + "/" + ano + "/0" + cont1;
//             }else{
//                 cont3 = "SI/" + mes + "/" + ano + "/" + cont1;
//             }
//     siteinfo.siteinfo_cod = cont3;

//      siteinfos.gravarDados(siteinfo, function(err){
//         if(err){
//         	cont1= cont1 + 1;
//                return gravarCliente(siteinfo, cont1);

            
//         }else{
//             return true;
//         }
//     });
// }

// function getJobcard(body){
// 	var jobcard= {};

// 	jobcard.jobcard_conttemp= body.jobcard_conttemp;
// 	jobcard.jobcard_cod= body.jobcard_cod;
// 	var temp3 = body.jobcard_call;
// 	jobcard.jobcard_call= JSON.parse(temp3);
// 	jobcard.jobcard_departamento= body.jobcard_departamento;
// 	jobcard.jobcard_regiao= body.jobcard_regiao;
// 	jobcard.jobcard_jobtype= body.jobcard_jobtype;
// 	jobcard.jobcard_jobinfo= body.jobcard_jobinfo;
// 	jobcard.jobcard_tecniconome= body.jobcard_tecniconome;
// 	jobcard.jobcard_cell= body.jobcard_cell;
// 	jobcard.jobcard_linemanager= body.jobcard_linemanager;
// 	jobcard.jobcard_loggedby= body.jobcard_loggedby;
// 	jobcard.jobcard_loggedon= body.jobcard_loggedon;
// 	jobcard.jobcard_datareporte= body.jobcard_datareporte;
// 	jobcard.jobcard_horareporte= body.jobcard_horareporte;
// 	jobcard.jobcard_quotacao= body.jobcard_quotacao;
// 	jobcard.jobcard_clientenome= body.jobcard_clientenome;
// 	jobcard.jobcard_site= body.jobcard_site;
// 	jobcard.jobcard_clientebranch= body.jobcard_clientebranch;
// 	jobcard.jobcard_clientetelefone= body.jobcard_clientetelefone;
// 	jobcard.jobcard_contactperson= body.jobcard_contactperson;
// 	jobcard.jobcard_contactphone= body.jobcard_contactphone;
// 	jobcard.jobcard_travelinfo_proposito= body.jobcard_travelinfo_proposito;
// 	jobcard.jobcard_previousgeneratorhours = body.jobcard_previousgeneratorhours;
// 	jobcard.jobcard_currentgeneratorhours = body.jobcard_currentgeneratorhours;
// 	jobcard.jobcard_previousrefuelhrs = body.jobcard_previousrefuelhrs;
// 	jobcard.jobcard_generatorrefuel = body.jobcard_generatorrefuel;
// 	jobcard.jobcard_litersoil = body.jobcard_litersoil;
// 	jobcard.jobcard_dsc = body.jobcard_dsc;
// 	jobcard.jobcard_refuelreason = body.jobcard_refuelreason;
// 	jobcard.jobcard_lastrefueldate = body.jobcard_lastrefueldate;
// 	jobcard.jobcard_generatorbeenserviced = body.jobcard_generatorbeenserviced;
// 	jobcard.jobcard_hourslastservice = body.jobcard_hourslastservice;
// 	jobcard.jobcard_status = body.jobcard_status;
// 	jobcard.jobcard_generator = body.jobcard_generator;

// 	var temp4 = body.jobcard_controlador;
// 	jobcard.jobcard_controlador = JSON.parse(temp4);

// 	var temp5 = body.jobcard_controladorintervenientes;
// 	jobcard.jobcard_controladorintervenientes = JSON.parse(temp5);

// 	var temp=body.travelinfoArrayJobcard;
// 	jobcard.travelinfoArrayJobcard = JSON.parse(temp);
// 	var temp1=body.equipamentoArrayJobcard;
// 	jobcard.equipamentoArrayJobcard = JSON.parse(temp1);
// 	var temp2=body.sparesArrayJobcard;
// 	jobcard.sparesArrayJobcard = JSON.parse(temp2);
	

// 	return jobcard;
// }


// function getSiteinfo(body){

// 	var siteinfo={};


// 	siteinfo.siteinfo_client = body.siteinfo_client;
// 	siteinfo.siteinfo_sitename = body.siteinfo_sitename;
// 	siteinfo.siteinfo_sitenum = body.siteinfo_sitenum;
// 	siteinfo.siteinfo_typesite = body.siteinfo_typesite;
// 	siteinfo.siteinfo_phasenum = body.siteinfo_phasenum;
// 	siteinfo.siteinfo_siteclassif = body.siteinfo_siteclassif;
// 	siteinfo.siteinfo_radiotec = body.siteinfo_radiotec;
// 	siteinfo.siteinfo_maintoff = body.siteinfo_maintoff;
// 	siteinfo.siteinfo_techcontactnum = body.siteinfo_techcontactnum;
// 	siteinfo.siteinfo_regiao = body.siteinfo_regiao;
// 	siteinfo.siteinfo_area = body.siteinfo_area;
// 	siteinfo.siteinfo_regiaoselmec = body.siteinfo_regiaoselmec;
// 	siteinfo.siteinfo_gps = body.siteinfo_gps;
// 	siteinfo.siteinfo_planmaintdate = body.siteinfo_planmaintdate;
// 	siteinfo.siteinfo_siteonairdate = body.siteinfo_siteonairdate;
// 	siteinfo.siteinfo_siteannoucdate = body.siteinfo_siteannoucdate;
// 	// siteinfo.siteinfo_pacdate = body.siteinfo_pacdate;
// 	siteinfo.siteinfo_twinbts = body.siteinfo_twinbts;
// 	siteinfo.siteinfo_btslinkedsite = body.siteinfo_btslinkedsite;
// 	siteinfo.siteinfo_generator = body.siteinfo_generator;
// 	siteinfo.siteinfo_ac = body.siteinfo_ac;
// 	siteinfo.siteinfo_rectifiercabinnet = body.siteinfo_rectifiercabinnet;
// 	siteinfo.siteinfo_fencing = body.siteinfo_fencing;
// 	siteinfo.siteinfo_electype = body.siteinfo_electype;


// 	return siteinfo;
// }


module.exports = router;