var express=require("express");
var router = express.Router();
var stock_request_db=require("../entities/stock_request");
var armazem_db=require("../entities/armazem");
var usuario_db=require("../entities/usuario");
var stock_item_db=require("../entities/stock_item");
var dados_provinciais = require('../util/provincias-distritos');
var stock_pessoal_db=require("../entities/stock_pessoal");
var rastreio_stock_db=require("../entities/rastreio");
var stock_req_history_db=require("../entities/stock_request_history");
var admin_db=require("../entities/sisadmin");
var multer = require('multer');
var path = require("path");
const e = require("express");
var emailSender=require('../util/sendEmail');
// emailSender.createConnection();
var upload = multer({
    storage: multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, './public/uploads');
        },
        filename: function(req, file, cb) {
            cb(null, req.session.usuario.nome + "_" + Date.now() + path.extname(file.originalname));
        }
    })
});


router.get("/", function(req, res){
	var userData= req.session.usuario;

	stock_request_db.find({}, function(err, data){
		if(err)
			console.log("ocorreu um erro ao tentar selecionar stock_items!!")
		else
		{
			res.render("stock_request_home", {DataU:userData, Stock_request:data, title:"EagleI"})
		}
	})
})


router.get("/home", function(req, res){
	
var userData= req.session.usuario;

res.render("stock_resumo", {DataU:userData, title:"EagleI"})
	
})


router.get("/stock_pessoal", function(req, res){
	
var userData= req.session.usuario;
if(userData.nivel_acesso=="admin"){
	stock_request_db.find({requested_by:userData.nome, estagio:{$size:1}}, function(err, data){
		if(err)
			console.log("ocorreu um erro ao tentar selecionar stock_items!!")
		else
		{
			res.render("stock_request_home", {DataU:userData, Stock_request:data, title:"EagleI"})
		}
	})	

		}
		else

		stock_request_db.find({requested_by:userData.nome, estagio:{$size:1}}, function(err, data){
				if(err)
					console.log("ocorreu um erro ao tentar selecionar stock_items!!")
				else
				{
					res.render("stock_request_home", {DataU:userData, Stock_request:data, title:"EagleI"})
				}
			})	
})

router.get("/expedientes", function(req, res){
	
var userData= req.session.usuario;
if(userData.nivel_acesso=="admin"){
	stock_request_db.find({ estagio:{$size:1}, returned_reason:{$exists:false} }, function(err, data){
		if(err)
			console.log("ocorreu um erro ao tentar selecionar stock_items!!")
		else
		{
			res.render("stock_request_home", {DataU:userData, Stock_request:data, title:"EagleI"})
		}
	})	

}
else

		stock_request_db.find({"intervenientes.1":userData.nome, estagio:{$size:1}, returned_reason:{$exists:false} }, function(err, data){
				if(err)
					console.log("ocorreu um erro ao tentar selecionar stock_items!!")
				else
				{
					res.render("stock_request_home", {DataU:userData, Stock_request:data, title:"EagleI"})
				}
			})	
})




router.get("/aprovados", function(req, res){
	
var userData= req.session.usuario;
if(userData.nivel_acesso=="admin"){
stock_request_db.find({"estagio.1":1,  "estagio.3":{$exists:false}}, function(err, data){
		if(err)
			console.log("ocorreu um erro ao tentar selecionar stock_items!!")
		else
		{
			console.log(data)
			res.render("stock_request_home", {DataU:userData, Stock_request:data, title:"EagleI"})
		}
	})	
}
else

stock_request_db.find({"estagio.1":1, $or:[{intervenientes:{$in:[userData.nome]}}, {responsaveis_arrmazem:{$in:[userData.nome]}}], "estagio.3":{$exists:false}}, function(err, data){
		if(err)
			console.log("ocorreu um erro ao tentar selecionar stock_items!!")
		else
		{
			console.log(data)
			res.render("stock_request_home", {DataU:userData, Stock_request:data, title:"EagleI"})
		}
	})	
})

router.get("/tecnicos", function(req, res){
	
var userData= req.session.usuario;
if(userData.nivel_acesso=="admin"){
	usuario_db.find({}, function(err, data){
			if(err)
				console.log("ocorreu um erro ao tentar selecionar tecnicos no stock!!")
			else
			{
				console.log(data)
				res.render("stock_tecnicos", {DataU:userData, Stock_request:data, title:"EagleI"})
			}
		}).sort({nome:1})	

}
else
	usuario_db.find({$or:[{nome_supervisor:userData.nome}, {nome:userData.nome}] }, function(err, data){
			if(err)
				console.log("ocorreu um erro ao tentar selecionar tecnicos no stock!!")
			else
			{
				console.log(data)
				res.render("stock_tecnicos", {DataU:userData, Stock_request:data, title:"EagleI"})
			}
		}).sort({nome:1})	
})

router.get("/tecnicos/:id", function(req, res){
	
var userData= req.session.usuario;

usuario_db.findOne({_id:req.params.id}, function(err, data){
		if(err)
			console.log("ocorreu um erro ao tentar selecionar tecnicos no stock!!")
		else
		{	
			stock_pessoal_db.findOne({nome:data.nome}, function(irro, dados){
				if(irro)
					console.log("ocorreu erro no stock pessoal")
				else
				{
					// console.log(dados)
					res.render("stock_tecnicos_detalhes", {DataU:userData, Stock_request:dados, Id:data, title:"EagleI"})

				}
			})
			
		}
	})
})

router.get("/history/:id2/:id4",  async function(req, res){
	var userData=req.session.usuario;
	var d1=  await req.params.id2;
	var d2=  await req.params.id4;

	console.log(d1, d2);
	stock_req_history_db.find({$or:[{beneficiario_ref:d1, ref_Item:d2}, {request_from_ref:d1, ref_Item:d2}]}, function(err, data){
		if(err)
			console.log("ocorreu um erro ao tentar achar o historico dos items")
		else{
			console.log(data)
			res.render("stock_request_history_home", {DataU:userData, Stock_request:data, benefficiario:d1, title:"EagleI"})
		}
	})
})

router.get("/histories/:id2/:id4",  async function(req, res){
	var userData=req.session.usuario;
	var d1=  await req.params.id2;
	var d2=  await req.params.id4;

	console.log(d1, d2);
	stock_req_history_db.find({$or:[{beneficiario_ref:d1, ref_Item:d2}, {request_from_ref:d1, ref_Item:d2}]}, function(err, data){
		if(err)
			console.log("ocorreu um erro ao tentar achar o historico dos items")
		else{
			console.log(data)
			res.render("stock_request_histories_home", {DataU:userData, Stock_request:data, benefficiario:d1, title:"EagleI"})
		}
	})
})


router.get("/finalizados", function(req, res){
	
var userData= req.session.usuario;

if(userData.nivel_acesso=="admin"){
	stock_request_db.find({$or:[{"estagio.1":0}, {"estagio.3":{$exists:true}}]}, function(err, data){
		if(err)
			console.log("ocorreu um erro ao tentar selecionar stock_items!!")
		else
		{

			res.render("stock_request_home", {DataU:userData, Stock_request:data, title:"COMSERV"})
		}
	})

}
else

stock_request_db.find({$or:[{"estagio.1":0, intervenientes:{$in:[userData.nome]}}, {"estagio.3":{$exists:true}, intervenientes:{$in:[userData.nome]}}]}, function(err, data){
		if(err)
			console.log("ocorreu um erro ao tentar selecionar stock_items!!")
		else
		{

			res.render("stock_request_home", {DataU:userData, Stock_request:data, title:"COMSERV"})
		}
	})	
})

const sleep = ms => {
	return new Promise(resolve => setTimeout(resolve, ms));
}

router.get("/bookout/:id", async function(req, res){
	
var userData= req.session.usuario;


var data=await stock_request_db.find({_id:req.params.id})

	 	var vall=[];
		 	var nume_sro=[];
			
				await data[0].items.reduce(async function(ac, idiota, i){
					await ac;
					// await sleep(10);
					var dadoss=await armazem_db.find({_id:data[0].request_from_ref})

					let indicec=await dadoss[0].items.findIndex(x => x.referencia==data[0].items[i].referencia)
						if(indicec!=-1)
							{await vall.push(dadoss[0].items[indicec].disponivel)
							await nume_sro.push(dadoss[0].items[indicec].serial_number);
							
						}
						else{
							await vall.push(0)
							await nume_sro.push([])
						}


				}, 0)
				
				
			
				console.log(vall, nume_sro)	
			res.render("stock_request_bookout", {DataU:userData, Stock_request:data, Disponivel:vall, nume_sro,  title:"EagleI"})
			
})

router.get("/delivery/:id", function(req, res){
	
var userData= req.session.usuario;

stock_request_db.find({_id:req.params.id}, function(err, data){
		if(err)
			console.log("ocorreu um erro ao tentar selecionar stock_items!!")
		else
		{
			res.render("stock_request_receiving", {DataU:userData, Stock_request:data, title:"EagleI"})
		}
	})	
})

router.get("/editar_request/:id",  function(req, res){
	var userData=req.session.usuario;

	armazem_db.find({pessoas_permitidas:{$in:[req.session.usuario.nome]}}, function(err, data){
		if(err)
			console.log("erro ocurred")
		else
		{
			stock_item_db.find({}, function(ty, dattta){
				if(ty)
					console.log("error ocurred")
				else
				{
					stock_request_db.find({_id:req.params.id}, function(err1, data1){
						if(err1)
							console.log("ocrreu um erro ao tentar editar o stock request")
						else
							res.render("stock_request_edit", {DataU:userData, 'Departamento':dados_provinciais.departamentos, Armazemm:JSON.stringify(data), Armazem:data, Items:dattta, Stock_request:data1,'subcategoriias':dados_provinciais.subcategory, title:"EagleI" , chefes_depart:dados_provinciais.chefes_departamentos})
					})
					
				}
			})
			
		}
	})
	
})




router.get("/reprovados", function(req, res){
	
var userData= req.session.usuario;

stock_request_db.find({"estagio.1":0, intervenientes:{$in:[userData.nome]}}, function(err, data){
		if(err)
			console.log("ocorreu um erro ao tentar selecionar stock_items!!")
		else
		{
			res.render("stock_request_home", {DataU:userData, Stock_request:data, title:"EagleI"})
		}
	})	
})



router.get("/detalhes/:id", function(req, res){
	
var userData= req.session.usuario;

stock_request_db.find({_id:req.params.id}, function(err, data){
		if(err)
			console.log("ocorreu um erro ao tentar selecionar stock_items!!")
		else
		{
			res.render("stock_request_detalhes", {DataU:userData, Stock_request:data,'Departamento':dados_provinciais.departamentos, title:"EagleI"})
		}
	})	
})

router.get("/reprovar/:id", function(req, res){
	var userData=req.session.usuario;
	stock_request_db.find({_id:req.params.id}, function(err, data){
		if(err)
			console.log("erro na tentativa de reprovar")
		else
		{
			res.render("razoes_reprovacao_stock_request", {DataU:userData, Stock_request:data, title:"EagleI"})
		}
	})

})

router.post("/aprovar", upload.any(), async function(req, res){

	  function criar(palavra){
		var conversao =  palavra.toString();
		switch(conversao.length){
			case 1:
				return ("0000"+conversao);
				break;
			case 2:
				return ("000"+ conversao);
				break;
			case 3: return ("00"+conversao);
				break;
			case 4: return ("0"+conversao);
				break;
			default: return (conversao.toString());
		}
		

	}
	
	
	var userData=req.session.usuario;
	var ultimo =  await stock_request_db.countDocuments({stocK_request_number:{$exists:true}}, function(err , count){
		if(err)
			return err
		else 
		{	console.log(count)
			return count

		}
			})
		ultimo ++;
	var ano =  new Date().getFullYear().toString().substr(-2);
	var mes = (((new Date()).getMonth()+1)<10? ('0'+((new Date()).getMonth()+1)):((new Date()).getMonth()+1)).toString();
	var dia = ((new Date()).getDate()<10? '0'+(new Date()).getDate():(new Date()).getDate()).toString();
	
	var numero = "SR"+ano + mes + dia + criar(ultimo);
	console.log(numero)

	var avlo= await stock_request_db.findOne({_id:req.body.novo});
	var k="";

	await avlo.items.reduce(async(acumul, iiidiota)=>{
		await acumul;
		
		 k= k +"<tr style='border: 1px solid black;border-collapse: collapse;'>"+"<td style='border: 1px solid black;border-collapse: collapse;padding: 15px;'>"+ iiidiota.description + "</td>" +"<td style='border: 1px solid black;border-collapse: collapse; padding: 15px;'>" + iiidiota.quanty +"</td></tr>";


	}, 0);

	await stock_request_db.updateOne({_id:req.body.novo}, {$push:{estagio:1, stock_approvers:userData.nome, date_actions:new Date()}, $set:{actual_situation:"aprovado", stocK_request_number:numero}})

	var procurastockreq = await stock_request_db.findOne({_id:req.body.novo});

	var procurarequisitante = await usuario_db.findOne({_id:procurastockreq.requested_by_ref});

	var procurawarehousemanager = await usuario_db.findOne({nome:procurastockreq.intervenientes[2]});

	emailSender.createConnection();
	emailSender.sendEmailAprovadoStockRequest(procurarequisitante);
	emailSender.sendEmailAprovadoStockRequestWarehouse(procurawarehousemanager, k);

	res.json({feito:"feito"});



	 
})

router.post("/retornar_stock", upload.any(), async function(req, res){
	var userData = req.session.usuario;
	console.log(req.body)

	var procurastockreq = await stock_request_db.findOne({_id:req.body.novo});

		var procurarequisitante = await usuario_db.findOne({_id:procurastockreq.requested_by_ref});

		var mensagemrazoes = req.body.razoes_return;

		emailSender.createConnection();
		emailSender.sendEmailReturnStockRequest(procurarequisitante, mensagemrazoes);

	await stock_request_db.updateOne({_id:req.body.novo}, { $set:{returned:true, returned_reason:req.body.razoes_return}})
	
	res.json({feito:"feito"});
	
})



// router.post("/delivery", upload.any(), function(req, res){
// 		var userData=req.session.usuario;

// 		stock_request_db.findOne({_id:req.body.novo},  function(erro, dados){
// 				if(erro)
// 					console.log("ocorreu um erro ao tentar achar o stocj_item")
// 				else
// 				{
// 					console.log(dados)
					
// 						var stock_recebido={};
// 						stock_recebido.nome_beneficiario=dados.requested_by;
// 						stock_recebido.disponibilidade=[];
// 						for(let i=0; i< dados.items.length; i++){
// 						stock_recebido.disponibilidade[i] = {};
// 						stock_recebido.disponibilidade[i].description_item = dados.items[i].description;
// 						stock_recebido.disponibilidade[i].disponivel = parseInt(dados.items[i].received);

// 						}
// 						stock_pessoal_db.gravar_stock_pessoal(stock_recebido, function(irr, feito){
// 							if(irr)
// 								console.log("ocorreu um erro ao gravar stock!!")
// 							else
// 								console.log("historico gravado com sucesso!!")
// 						})
					
					
// 				}
// 			})

// 	stock_request_db.findOneAndUpdate({_id:req.body.novo}, {$push:{estagio:1, stock_approvers:userData.nome, date_actions:new Date()}, $set:{actual_situation:"Recebido"}}, function(err, data){
// 		if(err)
// 			console.log("ocorreu um erro ao tentar actualizar po")
// 		else
// 			{
// 				console.log(data);

// 			}
// 	})

		



// 	})

router.post("/reprovar", upload.any(), async function(req, res){
		var userData=req.session.usuario;

		var procurastockreq = await stock_request_db.findOne({_id:req.body.novo});

		var procurarequisitante = await usuario_db.findOne({_id:procurastockreq.requested_by_ref});

		var mensagemrazoes = req.body.razoes_return;

		emailSender.createConnection();
		emailSender.sendEmailReprovadoStockRequest(procurarequisitante, mensagemrazoes);


	stock_request_db.updateOne({_id:req.body.novo}, {$push:{estagio:0, stock_approvers:userData.nome, date_actions:new Date()}, $set:{actual_situation:"reprovado", decline_reasons:req.body.razoes_return}});

	res.json({feito:"feito"});
})

router.get("/novo", async function(req, res){
	var userData= await req.session.usuario;
	var admin_case=await admin_db.find({});
	if(admin_case.length>0)
 armazem_db.find({pessoas_permitidas:{$in:[userData.nome]}}, function(err, data){
 	if(err)
 		console.log("erro ocurred")
 	else
 	{
 		usuario_db.find({}, function(rt, datta){
 			if(rt)
 				console.log("error ocurred on user database")
 			else
 			{ 
 				stock_item_db.find({}, function(ty, dattta){
 					if(ty)
 						console.log("error ocurred")
 					else
 					{
 						console.log(data)
 						res.render("stock_request_form", {DataU:userData, 'Departamento':dados_provinciais.departamentos, AdMagen:admin_case, chefes_depart:dados_provinciais.chefes_departamentos, Armazemm:JSON.stringify(data), Armazem:data, Destino:datta, Items:dattta, 'subcategoriias':dados_provinciais.subcategory, title:"EagleI" })
 					}
 				}).sort({description_item:1})
 				
 			}

 		})
 		
 	}
 })
 else
 res.redirect("/inicio")


	
})

function getAllIndexes(arr, val) {
	var indexes = [], i = -1;
	while ((i = arr.indexOf(val, i+1)) != -1){
		indexes.push(i);
	}
	return indexes;
}

router.post("/receber_productos", upload.any(), async function(req, res){
	console.log(req.body)
var custo_medio=[1]
var tydo=await custo_medio.reduce(async function(acT, idiotaT){
	await acT;
	await sleep(50);

	
	
	if(Array.isArray(req.body.referencia)){
	var array_bruto=req.body.e || [];
	var encontradoso = await getAllIndexes(req.body.serialized, "sim");
	var numeros_de_seriess=[]

	for(let i=0; i<req.body.serialized.length; i++){
		numeros_de_seriess.push([]);

	}

	if(encontradoso.length>0 )
	for(let j=0; j<encontradoso.length; j++){
		
		let vallor=parseInt(req.body.received[encontradoso[j]])
		if(Array.isArray(req.body.e) && vallor!=0){
			let t = array_bruto.splice(0,vallor)
			numeros_de_seriess[encontradoso[j]]=t;

		}
		else
			if(vallor!=0)
				numeros_de_seriess[encontradoso[j]]=[req.body.e];
			
	}
	}
	else{
		if(Array.isArray(req.body.e))
			var numeros_de_seriess=[req.body.e]
		else
			if(req.body.e!=null)
				var numeros_de_seriess=[[req.body.e]];
			else
				var numeros_de_seriess=[['']];
	}

	

	console.log(numeros_de_seriess);
	console.log()


	var userData=req.session.usuario;

	var procurastockreq = await stock_request_db.findOne({_id:req.body.novo});

var procurarequisitante = await usuario_db.findOne({_id:procurastockreq.requested_by_ref});

// emailSender.createConnection();
// emailSender.sendEmailBookout(procurastockreq,procurarequisitante);

	await stock_request_db.updateOne({_id:req.body.novo}, {$push:{estagio:1, stock_approvers:userData.nome, date_actions:new Date()}, $set:{actual_situation:"Entregue" }})

	// *************************************************************************inicio de tricks dos precos*****************************************************************

	if(Array.isArray(req.body.received)){
		await req.body.received.reduce(async(ac, idiota,p)=>{
		await ac;
	  	await sleep(10);
		var localizar_armazem =await armazem_db.find({_id:req.body.locaal, items:{$elemMatch:{referencia:req.body.referencia[p]}}});
		console.log(localizar_armazem);
		if(localizar_armazem.length>0)
		var array_cnst=await localizar_armazem[0].items[(localizar_armazem[0].items.findIndex(x=>(x.referencia==req.body.referencia[p])))];

		if(localizar_armazem.length>0 && req.body.serialized[p]=="nao" && idiota!='0'){
		var index_de_troca=await localizar_armazem[0].items[(localizar_armazem[0].items.findIndex(x=>(x.referencia==req.body.referencia[p])))]; //objecto achado
		console.log(index_de_troca);
		var controlado = await parseInt(idiota);
		console.log(controlado)
		var novo_array = await index_de_troca.precos.splice(0, controlado);
		console.log(novo_array);

		await armazem_db.updateOne({_id:req.body.locaal , items:{$elemMatch:{referencia:req.body.referencia[p]}}}, { $set:{ "items.$.precos":index_de_troca.precos}});

		await stock_request_db.updateOne({_id:req.body.novo , items:{$elemMatch:{referencia:req.body.referencia[p]}}}, { $set:{ "items.$.precos":novo_array}});

		// var index_de_troca=await localizar_armazem.items[(localizar_armazem[0].items.findIndex(x=>(x.referencia==req.body.referencia[p])))]; //objecto achado


		}


		if(localizar_armazem.length>0 && req.body.serialized[p]=="sim" && idiota!='0'){
			var index_de_troca=await localizar_armazem[0].items[(localizar_armazem[0].items.findIndex(x=>(x.referencia==req.body.referencia[p])))]; //objecto achado
			var controlado = await parseInt(idiota);
			if(controlado==1){
				// var aux=await numeros_de_seriess[p][0];
				var localizar_indece_numserial= await index_de_troca.serial_number.findIndex(x=> x==numeros_de_seriess[p][0]);
				var novo_array= await index_de_troca.precos.splice(localizar_indece_numserial, (localizar_indece_numserial+1));

				await armazem_db.updateOne({_id:req.body.locaal , items:{$elemMatch:{referencia:req.body.referencia[p]}}}, { $set:{ "items.$.precos":index_de_troca.precos}});

				await stock_request_db.updateOne({_id:req.body.novo , items:{$elemMatch:{referencia:req.body.referencia[p]}}}, { $set:{ "items.$.precos":novo_array}});



			}
			else{
				var novo_array=[];
				await numeros_de_seriess[p].reduce(async(acc, iidiota)=>{
					await acc;
					await sleep(10);
					var localizar_indece_numserial= await index_de_troca.serial_number.findIndex(x=> x==iidiota);
					await novo_array.push(index_de_troca.precos[localizar_indece_numserial]);
					await index_de_troca.serial_number.splice(localizar_indece_numserial, (localizar_indece_numserial+1))
					
					await index_de_troca.precos.splice(localizar_indece_numserial, (localizar_indece_numserial+1));
					await sleep(10);
					

				}, 0)
				
				await armazem_db.updateOne({_id:req.body.locaal , items:{$elemMatch:{referencia:req.body.referencia[p]}}}, { $set:{ "items.$.precos":index_de_troca.precos}});

				await stock_request_db.updateOne({_id:req.body.novo , items:{$elemMatch:{referencia:req.body.referencia[p]}}}, { $set:{ "items.$.precos":novo_array}});

			}

		}



		}, 0);
		


	}else{
		var makhapa=[];
		makhapa[0]= await [req.body.received];

		await makhapa.reduce(async(ac, idiota,p)=>{
		await ac;
	  	await sleep(10);
		var localizar_armazem =await armazem_db.find({_id:req.body.locaal, items:{$elemMatch:{referencia:req.body.referencia}}});
		console.log(localizar_armazem);

		if(localizar_armazem.length>0 && req.body.serialized=="nao" && idiota!='0'){
		var index_de_troca=await localizar_armazem[0].items[(localizar_armazem[0].items.findIndex(x=>(x.referencia==req.body.referencia)))]; //objecto achado
		console.log(index_de_troca);
		var controlado = await parseInt(idiota);
		console.log(controlado)
		var novo_array = await index_de_troca.precos.splice(0, controlado);
		console.log(novo_array);

		await armazem_db.updateOne({_id:req.body.locaal , items:{$elemMatch:{referencia:req.body.referencia}}}, { $set:{ "items.$.precos":index_de_troca.precos}});

		await stock_request_db.updateOne({_id:req.body.novo , items:{$elemMatch:{referencia:req.body.referencia}}}, { $set:{ "items.$.precos":novo_array}});

		// var index_de_troca=await localizar_armazem.items[localizar_armazem[0].items.findIndex(x=>(x.referencia==req.body.referencia))]; //objecto achado


		}


		if(localizar_armazem.length>0 && req.body.serialized=="sim" && idiota!='0'){
			var index_de_troca=await localizar_armazem[0].items[(localizar_armazem[0].items.findIndex(x=>(x.referencia==req.body.referencia)))]; //objecto achado
			var controlado = await parseInt(idiota);
			if(controlado==1){
				// var aux=await numeros_de_seriess[p][0];
				var localizar_indece_numserial= await index_de_troca.serial_number.findIndex(x=> x==numeros_de_seriess[0][0]);
				var novo_array= await index_de_troca.precos.splice(localizar_indece_numserial, (localizar_indece_numserial+1));

				await armazem_db.updateOne({_id:req.body.locaal , items:{$elemMatch:{referencia:req.body.referencia}}}, { $set:{ "items.$.precos":index_de_troca.precos}});

				await stock_request_db.updateOne({_id:req.body.novo , items:{$elemMatch:{referencia:req.body.referencia}}}, { $set:{ "items.$.precos":novo_array}});



			}
			else{
				var novo_array=[];
				await numeros_de_seriess[0].reduce(async(acc, iidiota)=>{
					await acc;
					await sleep(10);
					var localizar_indece_numserial= await index_de_troca.serial_number.findIndex(x=> x==iidiota);
					await novo_array.push(index_de_troca.precos[localizar_indece_numserial]);
					await index_de_troca.serial_number.splice(localizar_indece_numserial, (localizar_indece_numserial+1))

					await index_de_troca.precos.splice(localizar_indece_numserial, (localizar_indece_numserial+1));
					await sleep(10)

					
					
					

				}, 0)

				await sleep(10);
				
				await armazem_db.updateOne({_id:req.body.locaal , items:{$elemMatch:{referencia:req.body.referencia[p]}}}, { $set:{ "items.$.precos":index_de_troca.precos}});
				await stock_request_db.updateOne({_id:req.body.novo , items:{$elemMatch:{referencia:req.body.referencia[p]}}}, { $set:{ "items.$.precos":novo_array}});

			}

		}



		}, 0);
		


	

	}

	//  falta quando o array nao esta em array++++++++++++++++++++++++++++++++++++++********+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*



	// *************************************************************************Fim de tricks dos precos********************************************************************

	if(Array.isArray(req.body.received)){
		console.log(req.body.received)


// **********************fim ciclo*********************
var urls = req.body.received
  console.log(urls)
  // async function getTodos() {
	  await urls.reduce(async function(ac, idiota, i){
	  	await ac;
	  	await sleep(10);
	  	var incme= parseFloat(req.body.received[i])/2;
	var incme1= await parseFloat(req.body.received[i])
	var decremento_stock= await -1*incme1;
	if(decremento_stock!=0)
	
		{
			  await armazem_db.updateOne({_id:req.body.locaal, items:{$elemMatch:{referencia:req.body.referencia[i], $or:[{disponivel:{$gte:incme1}}, {disponivel:{$gte:incme}}]}}}, {$inc:{"items.$.disponivel":decremento_stock},  $pull:{"items.$.serial_number":{$in:numeros_de_seriess[i]}}});

			var localizar_stock= await stock_request_db.findOne({_id:req.body.novo} );
				console.log(localizar_stock);

			await rastreio_stock_db.updateMany({serial_number:{$in:numeros_de_seriess[i]}}, {$push:{ref_local_actual:localizar_stock.requested_by_ref,  local_actual:localizar_stock.book_out_to_store, meio_atribuicao:"Bookout", atribuidores:req.session.usuario.nome, datas_local_actual:new Date()}});



			await stock_request_db.updateOne({_id:req.body.novo , items:{$elemMatch:{referencia:req.body.referencia[i]}}}, { $set:{ "items.$.booked_out":req.body.received[i], "items.$.data_book_out":new Date(), "items.$.num_serie":numeros_de_seriess[i]}})

		
			  // console.log(`Received Todo`, todo);
			

		}
		else
		{
			await stock_request_db.updateOne({_id:req.body.novo , items:{$elemMatch:{referencia:req.body.referencia[i]}}}, { $set:{ "items.$.booked_out":req.body.received[i], "items.$.data_book_out":new Date(), "items.$.num_serie":numeros_de_seriess[i]}})

		}
		


	  }, 0);

	
  
	console.log('Finished!');
  // }

  
// await getTodos();
// --------------------------------------------------------------------------------------

}
else
{
var urls = []
urls[0]=req.body.received
  
  // async function getTodos() {
  	await urls.reduce(async function(ac, idiota, i){
  		await ac;
  		await sleep(10);
  			var incme=parseFloat(req.body.received)/2;
	var incme1=parseFloat(req.body.received)
	var decremento_stock= -1*incme1;
	if(decremento_stock)
	  var foun=await armazem_db.find({_id:req.body.locaal, items:{$elemMatch:{referencia:req.body.referencia, disponivel:{$gte:incme1} }}})

	if(foun.length>0)
	 await armazem_db.update({_id:req.body.locaal, items:{$elemMatch:{referencia:req.body.referencia}}}, {$inc:{"items.$.disponivel":decremento_stock}, $pull:{"items.$.serial_number":{$in:numeros_de_seriess[0]}}});

	var localizar_stock= await stock_request_db.findOne({_id:req.body.novo});
		console.log(localizar_stock);

	await rastreio_stock_db.updateMany({serial_number:{$in:numeros_de_seriess[0]}}, {$push:{ref_local_actual:localizar_stock.requested_by_ref,  local_actual:localizar_stock.book_out_to_store, meio_atribuicao:"Bookout", atribuidores:req.session.usuario.nome, datas_local_actual:new Date()}})

	 await stock_request_db.updateOne({_id:req.body.novo , items:{$elemMatch:{referencia:req.body.referencia}}}, { $set:{ "items.$.booked_out":req.body.received, "items.$.data_book_out":new Date(),  "items.$.num_serie":numeros_de_seriess[0]}})
	  

	// else
	// {
	// 	stock_request_db.updateOne({_id:req.body.novo , items:{$elemMatch:{referencia:req.body.referencia}}}, { $set:{ "items.$.booked_out":req.body.received, "items.$.data_book_out":new Date(), "items.$.num_serie":numeros_de_seriess[0]}},null,  function(err, data){
	// 		if(err)
	// 			console.log("ocorreu um erro ao tentar decrementar stock")
	// 		else
	// 			{
	// 				console.log("stock decrementado com sucesso!!")
	// 			}
	// 	})

	// }

  	},0);
	  
	
  
	console.log('Finished!');
  // }

  
	// getTodos();


}


}, 0);

console.log(tydo);

res.json({feito:"feito"});

})



router.post("/delivery", upload.any(), async function(req, res){
	console.log(req.body)
	var userData=req.session.usuario;
	var custo_medio=[1];

	

	var tydo=await custo_medio.reduce(async function(acT, idiotaT){
		await acT;
		// await sleep(1000);
	
	await stock_request_db.update({_id:req.body.novo}, {$push:{estagio:1, stock_approvers:userData.nome, date_actions:new Date()}, $set:{actual_situation:"Entregue" }})

	
	if(Array.isArray(req.body.received)){

		// for(var i=0; i<req.body.received.length; i++ ){
			await req.body.received.reduce(async function(ac, idiota, i){
				await ac;
				await sleep(10);
				await stock_request_db.updateOne({_id:req.body.novo , items:{$elemMatch:{referencia:req.body.referencia[i]}}}, { $set:{ "items.$.received":req.body.received[i], "items.$.data_recepcao":new Date()}})


			}, 0);
			
		// }
	}
	else
	{
		
			await stock_request_db.updateOne({_id:req.body.novo , items:{$elemMatch:{referencia:req.body.referencia}}}, { $set:{ "items.$.received":req.body.received, "items.$.data_recepcao":new Date()}})
		

	}




// *****************************************************************actualizacao do stock do tecnico******************************************************
var dados=await stock_request_db.findOne({_id:req.body.novo})
if(dados.book_out_to_store.indexOf("Warehouse")==-1){
					console.log(dados)
					
						var stock_recebido={};
						stock_recebido.nome=dados.requested_by;
						stock_recebido.nome_ref=userData._id;
						stock_recebido.disponibilidade = [];
						// for(let i=0; i< dados.items.length; i++){
							await dados.items.reduce(async function(ac, idiota, i){
								await ac;
								await sleep(10);
								stock_recebido.disponibilidade[i] = await {};
								stock_recebido.disponibilidade[i].referencia = await dados.items[i].referencia;
								stock_recebido.disponibilidade[i].description_item = await dados.items[i].description;
								stock_recebido.disponibilidade[i].disponivel = await parseInt(dados.items[i].received);
								stock_recebido.disponibilidade[i].serialized = await dados.items[i].serialized;
								stock_recebido.disponibilidade[i].num_serie = await dados.items[i].num_serie;
								stock_recebido.disponibilidade[i].cliente_name = await dados.items[i].cliente_name;
								stock_recebido.disponibilidade[i].precos = await dados.items[i].precos;


								 await stock_pessoal_db.updateOne({nome_ref:dados.requested_by_ref, disponibilidade:{$elemMatch:{referencia:dados.items[i].referencia}}},{$inc:{"disponibilidade.$.disponivel":stock_recebido.disponibilidade[i].disponivel}, $push:{"disponibilidade.$.num_serie":{$each:dados.items[i].num_serie}, "disponibilidade.$.precos":{$each:dados.items[i].precos} }})

						


								 await stock_pessoal_db.updateOne({nome_ref:dados.requested_by_ref, "disponibilidade.referencia":{$ne:dados.items[i].referencia}}, {$push:{disponibilidade:stock_recebido.disponibilidade[i]}})

								await rastreio_stock_db.updateMany({serial_number:{$in:idiota.num_serie}}, {$push:{ref_local_actual:dados.requested_by_ref,  local_actual:dados.requested_by, meio_atribuicao:"Received", atribuidores:req.session.usuario.nome, datas_local_actual:new Date()}})


						


							}, 0);
						

						// }

				var result= await stock_pessoal_db.find({nome_ref:dados.requested_by_ref})

				if(result.length==0){
						stock_pessoal_db.gravar_stock_pessoal(stock_recebido, function(irr, feito){
					if(irr)
						console.log("ocorreu um erro ao gravar stock!!")
					else
						console.log("historico gravado com sucesso!!")
						})



							}

				 //*************************inicio insercao do historico**********************************************
				 if(Array.isArray(req.body.received)){
				 	// for(var i=0; i<req.body.received.length; i++){
						await req.body.received.reduce(async function(ac, idiota, i){
							await ac;
							await sleep(5);
							stock_req_history_db.gravar_historico({beneficiario:userData.nome, beneficiario_ref: userData._id, request_from_ref:dados.request_from_ref, request_from:dados.request_from, ref_Item:req.body.referencia[i], numero:dados.stocK_request_number, quantidade:req.body.received[i], nome_item:req.body.decricao[i], serialized:dados.items[i].serialized, cliente_name:dados.items[i].cliente_name, precos:dados.items[i].precos}, function(errp, d){
								if(errp)
									console.log("ocorreu um erro ao tentar gravar historico")
								else
									console.log("Historico gravado com sucesso!!")
							})


						}, 0)
				 		

				 	// }
				 }
				 else
				 {
				 	stock_req_history_db.gravar_historico({beneficiario:userData.nome, beneficiario_ref: userData._id, request_from:dados.request_from, request_from_ref:dados.request_from_ref, ref_Item:req.body.referencia, numero:dados.stocK_request_number, quantidade:req.body.received, nome_item:req.body.decricao, serialized:dados.items[0].serialized, cliente_name:dados.items[0].cliente_name , precos:dados.items[0].precos}, function(errp, d){
				 			if(errp)
				 				console.log("ocorreu um erro ao tentar gravar historico")
				 			else
				 				console.log("Historico gravado com sucesso!!")
				 		})

				 }


				 // ************************fim insercao do historico******************************************
						
					
					
				}
				else{
					console.log(dados)
					
						var stock_recebido={};
						stock_recebido.nome=dados.requested_by;
						stock_recebido.nome_ref=userData._id;
						stock_recebido.items = await [];
						// for(let i=0; i< dados.items.length; i++){
							await dados.items.reduce(async function(ac, idiota, i){
								await ac;
								await sleep(10);
								stock_recebido.items[i] = await {};
								stock_recebido.items[i].referencia = await idiota.referencia;
								stock_recebido.items[i].description_item = await idiota.description;
								stock_recebido.items[i].disponivel = await parseInt(idiota.received);
								stock_recebido.items[i].serialized = await idiota.serialized;
								stock_recebido.items[i].serial_number = await idiota.num_serie;
								stock_recebido.items[i].cliente_name = await idiota.cliente_name;
								stock_recebido.items[i].precos = await idiota.precos;

								 armazem_db.updateOne({_id:dados.requested_by_ref, items:{$elemMatch:{referencia:dados.items[i].referencia}}},{$inc:{"items.$.disponivel":stock_recebido.items[i].disponivel}, $push:{"items.$.num_serie":{$each:dados.items[i].num_serie}, "items.$.precos":{$each:dados.items[i].precos} }})

						


								await armazem_db.updateOne({_id:dados.requested_by_ref, "items.referencia":{$ne:dados.items[i].referencia}}, {$push:{items:stock_recebido.items[i]}})

								await rastreio_stock_db.updateMany({serial_number:{$in:idiota.num_serie}}, {$push:{ref_local_actual:dados.requested_by_ref,  local_actual:dados.book_out_to_store, meio_atribuicao:"Recieving", atribuidores:req.session.usuario.nome, datas_local_actual:new Date()}})


						


							}, 0);
						

						// }

				//  await stock_pessoal_db.find({nome_ref:dados.requested_by_ref}, function(irroo, result){
				// 		if (irroo)
				// 			console.log("erro na procura do owner do stock")
				// 		else
				// 		{
				// 			if(result.length==0){
				// 				stock_pessoal_db.gravar_stock_pessoal(stock_recebido, function(irr, feito){
				// 			if(irr)
				// 				console.log("ocorreu um erro ao gravar stock!!")
				// 			else
				// 				console.log("historico gravado com sucesso!!")
				// 		})



				// 			}
				// 		}
				// 	})

				 //*************************inicio insercao do historico**********************************************
				 if(Array.isArray(req.body.received)){
				 	// for(var i=0; i<req.body.received.length; i++){
						await req.body.received.reduce(async function(ac, idiota, i){
							await ac;
							await sleep(5);
							stock_req_history_db.gravar_historico({beneficiario:dados.book_out_to_store, beneficiario_ref:dados.requested_by_ref, request_from_ref:dados.request_from_ref, request_from:dados.request_from, ref_Item:req.body.referencia[i], numero:dados.stocK_request_number, quantidade:req.body.received[i], nome_item:req.body.decricao[i], serialized:dados.items[i].serialized, cliente_name:dados.items[i].cliente_name, precos:dados.items[i].precos}, function(errp, d){
								if(errp)
									console.log("ocorreu um erro ao tentar gravar historico")
								else
									console.log("Historico gravado com sucesso!!")
							})


						}, 0)
				 		

				 	// }
				 }
				 else
				 {
				 	stock_req_history_db.gravar_historico({beneficiario:dados.book_out_to_store, beneficiario_ref:dados.requested_by_ref, request_from:dados.request_from, request_from_ref:dados.request_from_ref, ref_Item:req.body.referencia, numero:dados.stocK_request_number, quantidade:req.body.received, nome_item:req.body.decricao, serialized:dados.items[0].serialized, precos:dados.items[0].precos}, function(errp, d){
				 			if(errp)
				 				console.log("ocorreu um erro ao tentar gravar historico")
				 			else
				 				console.log("Historico gravado com sucesso!!")
				 		})

				 }


				 // ************************fim insercao do historico******************************************
						
					
					
				}



	 await stock_request_db.updateOne({_id:req.body.novo}, {$push:{estagio:1, stock_approvers:userData.nome, date_actions:new Date()}, $set:{actual_situation:"Recebido"}})


// *******************************************************************end actualizacao do stock do tecnico*************************************************
// -----------------------------------------------------------------------------outra sessao-------------------------------------------------------------------------------------


// return custo__;
}, 0);

await sleep(100);


var procurastockreq = await stock_request_db.findOne({_id:req.body.novo});

	var procurawarehousemanager = await usuario_db.findOne({nome:procurastockreq.intervenientes[2]});

	var k = "";

	await procurastockreq.items.reduce(async(acumul, iiidiota)=>{
		await acumul;
		 k= k +"<tr style='border: 1px solid black;border-collapse: collapse;'>"+"<td style='border: 1px solid black;border-collapse: collapse;padding: 15px;'>"+ iiidiota.description + "</td>" +"<td style='border: 1px solid black;border-collapse: collapse; padding: 15px;'>" + iiidiota.quanty +"</td>" + "</td>" +"<td style='border: 1px solid black;border-collapse: collapse; padding: 15px;'>" + iiidiota.booked_out +"</td>"+"<td style='border: 1px solid black;border-collapse: collapse; padding: 15px;'>" + iiidiota.received +"</td>" + "</tr>";


	},0);

	// for(let [i,test] of procurastockreq.items.entries()) {

 //        k= k +"<tr style='border: 1px solid black;border-collapse: collapse;'>"+"<td style='border: 1px solid black;border-collapse: collapse;padding: 15px;'>"+ iiidiota.description + "</td>" +"<td style='border: 1px solid black;border-collapse: collapse; padding: 15px;'>" + iiidiota.quanty +"</td>" + "</td>" +"<td style='border: 1px solid black;border-collapse: collapse; padding: 15px;'>" + iiidiota.booked_out +"</td>" + "</tr>";

 //    }

	emailSender.createConnection();
	emailSender.sendEmailStockVerification(k,procurawarehousemanager);
	res.json({feito:"feito"});

})


router.post("/novo", upload.any(), async function(req, res){
	var userData=await req.session.usuario;
	console.log(req.body)
	let stockk= await req.body;
	stockk.requested_by_ref=await userData._id;
	stockk.items=await [];

	if(stockk.item_nome){
		if(Array.isArray(stockk.item_nome))
		for(let i=0;i<stockk.item_nome.length; i++){
			stockk.items[i]={};
			stockk.items[i].description=req.body.item_nome[i];
			stockk.items[i].quanty=req.body.quantidades[i];
			stockk.items[i].referencia=req.body.referencia[i];
			stockk.items[i].serialized=req.body.serialized[i];
			stockk.items[i].cliente_name=req.body.cliente_name[i];
		}
	else
		for(let i=0;i<1; i++){
			stockk.items[i]={};
			stockk.items[i].description=req.body.item_nome;
			stockk.items[i].quanty=req.body.quantidades;
			stockk.items[i].referencia=req.body.referencia;
			stockk.items[i].serialized=req.body.serialized;
			stockk.items[i].cliente_name=req.body.cliente_name;
		}

	}

	stockk.intervenientes=await [userData.nome, userData.nome_supervisor, req.body.responsaveis, req.body.book_out_to_store];
	stockk.estagio=[1];
	stockk.date_actions=[new Date()];
	stockk.stock_approvers=[userData.nome];

	let transf=stockk.Date_required.split("/")
	transf.reverse();
	let transf1=transf.join("-");
	console.log(transf1);
	stockk.real_date_required=new Date(transf1);

	stockk.registado_por=userData.nome;

	var procuralinemanager = await usuario_db.findOne({nome:userData.nome_supervisor}, function(err,dataUser){
		if(err){
			console.log("ocorreu um erro ao tentar aceder os dados")
		}else{
			console.log("Find User")

		}
	});
	var k="";

	await stockk.items.reduce(async(acumul, iiidiota)=>{
		await acumul;
		// k=
		 k= k +"<tr style='border: 1px solid black;border-collapse: collapse;'>"+"<td style='border: 1px solid black;border-collapse: collapse;padding: 15px;'>"+ iiidiota.description + "</td>" +"<td style='border: 1px solid black;border-collapse: collapse; padding: 15px;'>" + iiidiota.quanty +"</td></tr>";


	}, 0);


	
	

	if(stockk.items.length>0){
		stock_request_db.gravar_stock_request(stockk, function(err, data){
			if(err)
				console.log("erross");
			else 
				console.log("saved")
		})

		emailSender.createConnection();
	emailSender.sendEmailNewStockRequest(stockk, userData, procuralinemanager, k);

		

	}

	res.json({feito:"feito"});
		

})

router.post("/editado_stRequest/:id", upload.any(), function(req, res){
	var userData=req.session.usuario;
	console.log(req.body)
	let stockk= req.body;
	stockk.items=[];

	if(stockk.item_nome){
		if(Array.isArray(stockk.item_nome))
		for(let i=0;i<stockk.item_nome.length; i++){
			stockk.items[i]={};
			stockk.items[i].description=req.body.item_nome[i];
			stockk.items[i].quanty=req.body.quantidades[i];
			stockk.items[i].referencia=req.body.referencia[i];
			stockk.items[i].serialized=req.body.serialized[i];
			stockk.items[i].cliente_name=req.body.cliente_name[i];

		}
	else
		for(let i=0;i<1; i++){
			stockk.items[i]={};
			stockk.items[i].description=req.body.item_nome;
			stockk.items[i].quanty=req.body.quantidades;
			stockk.items[i].referencia=req.body.referencia;
			stockk.items[i].serialized=req.body.serialized;
			stockk.items[i].cliente_name=req.body.cliente_name;
		}

	}

	stockk.intervenientes=[userData.nome, userData.nome_supervisor, req.body.responsaveis, req.body.book_out_to_store];
	stockk.estagio=[1];
	stockk.date_actions=[new Date()];
	stockk.stock_approvers=[userData.nome];

	let transf=stockk.Date_required.split("/")
	transf.reverse();
	let transf1=transf.join("-");
	console.log(transf1);
	stockk.real_date_required=new Date(transf1);

	stockk.registado_por=userData.nome;
	
	stock_request_db.updateOne({_id:req.params.id},{$set:stockk, $unset:{returned:1,returned_reason:1}}, function(erro, dados){
		if(erro)
			console.log("ocorreu um erro ao tentar actualizar o stock request")
		else
			console.log("actualizacao feita com sucesso!")
	})

	// stock_request_db.gravar_stock_request(stockk, function(err, data){
	// 	if(err)
	// 		console.log("erross");
	// 	else 
	// 		console.log("saved")
	// })

	res.json({feito:"feito"});

})

module.exports=router;