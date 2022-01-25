var express=require("express");
var router = express.Router();
var stock_return_db=require("../entities/stock_return");
var armazem_db=require("../entities/armazem");
var usuario_db=require("../entities/usuario");
var stock_item_db=require("../entities/stock_item");
var dados_provinciais = require('../util/provincias-distritos');
var stock_pessoal_db=require("../entities/stock_pessoal");
var stock_req_history_db=require("../entities/stock_request_history")
var rastreio_stock_db=require("../entities/rastreio")
var multer = require('multer');
var path = require("path");
const e = require("express");
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

	if(userData.nivel_acesso=="admin"){
		stock_return_db.find({}, function(err, data){
		if(err)
			console.log("ocorreu um erro ao tentar selecionar stock_items!!")
		else
		{
			res.render("stock_return_home", {DataU:userData, Stock_request:data, title:"EagleI"})
		}
	})


	}
	else{
		stock_return_db.find({intervenientes:{$in:[userData.nome]}}, function(err, data){
		if(err)
			console.log("ocorreu um erro ao tentar selecionar stock_items!!")
		else
		{
			res.render("stock_return_home", {DataU:userData, Stock_request:data, title:"EagleI"})
		}
	})

	}

	
})

router.get("/detalhes/:id", function(req, res){
	
var userData= req.session.usuario;

stock_return_db.find({_id:req.params.id}, function(err, data){
		if(err)
			console.log("ocorreu um erro ao tentar selecionar stock_items!!")
		else
		{
			res.render("stock_return_detalhes", {DataU:userData, Stock_request:data,'Departamento':dados_provinciais.departamentos, title:"EagleI"})
		}
	})	
})


router.get("/novo", async function(req, res){
	var userData= await req.session.usuario;
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
 				stock_pessoal_db.find({nome_ref:userData._id}, function(ty, dattta){
 					if(ty)
 						console.log("error ocurred")
 					else
 					{
 						console.log(data)
 						var item= dattta.length>0? dattta[0].disponibilidade : [];
 						var items_bad= dattta.length>0? dattta[0].disponibilidade_returned : [];
 						res.render("stock_return_form", {DataU:userData, 'Departamento':dados_provinciais.departamentos, Esconder:JSON.stringify(dattta), chefes_depart:dados_provinciais.chefes_departamentos, Armazemm:JSON.stringify(data), Armazem:data, Destino:datta, Items:item, Items_bad:items_bad, 'subcategoriias':dados_provinciais.subcategory, title:"EagleI" })
 					}
 				}).sort({description_item:1})
 				
 			}

 		})
 		
 	}
 })


	
})


router.post("/novo", upload.any(), function(req, res){
	var userData=req.session.usuario;
	console.log(req.body)
	let stockk= req.body;
	stockk.returned_by_ref=userData._id;
	stockk.items=[];

	if(stockk.item_nome){
		if(Array.isArray(stockk.item_nome))
		for(let i=0;i<stockk.item_nome.length; i++){
			stockk.items[i]={};
			stockk.items[i].description=req.body.item_nome[i];
			stockk.items[i].quanty=req.body.quantidades[i];
			stockk.items[i].referencia=req.body.referencia[i];
			stockk.items[i].serialized=req.body.serialized[i];
			stockk.items[i].status=req.body.status[i];
			stockk.items[i].cliente_name=req.body.cliente_name[i];
			stockk.items[i].num_serie=req.body.num_serie[i];


		}
	else
		for(let i=0;i<1; i++){
			stockk.items[i]={};
			stockk.items[i].description=req.body.item_nome;
			stockk.items[i].quanty=req.body.quantidades;
			stockk.items[i].referencia=req.body.referencia;
			stockk.items[i].serialized=req.body.serialized;
			stockk.items[i].status=req.body.status;
			stockk.items[i].cliente_name=req.body.cliente_name;
			stockk.items[i].num_serie=req.body.num_serie;
		}

	}

	stockk.intervenientes=[userData.nome, req.body.responsaveis];
	stockk.estagio=[1];
	stockk.date_actions=[new Date()];
	stockk.stock_approvers=[userData.nome];

	let transf=stockk.Date_required.split("/")
	transf.reverse();
	let transf1=transf.join("-");
	console.log(transf1);
	stockk.real_date_required=new Date(transf1);

	stockk.registado_por=userData.nome;
	
	if(stockk.items.length>0){
	stock_return_db.gravar_stock_return(stockk, function(err, data){
		if(err)
			console.log("erross");
		else 
			console.log("saved")
	})
}

})



router.get("/aprovar/:id", function(req, res){
	
var userData= req.session.usuario;

stock_return_db.find({_id:req.params.id}, async function(err, data){
		if(err)
			console.log("ocorreu um erro ao tentar selecionar stock_items!!")
		else
		 {	var vall=[]
			for(let [i,test] of data[0].items.entries()){
				
				// await armazem_db.find({nome:data[0].request_from, items:{$elemMatch:{referencia:data[0].items[i].referencia}} },  async function(erro, dadoss){
				// 	if(erro)
				// 		console.log(erro)
				// 	else
				// 		{	console.log(dadoss);
				// 			if(dadoss.length>0)
				// 			 	await vall.push(dadoss[0].items[0].disponivel)
				// 			else
				// 				await vall.push(0);
				// 			if(vall.length!=i+1)
				// 				await vall.push(0);
				// 		// console.log(vall) dados[i].lista.findIndex(x => x.observacao =="grey");
				// 	}
				// })

				// **************************************Arranjos**********************************
				await stock_pessoal_db.find({nome_ref:data[0].returned_by_ref}, async function(erro, dadoss){
					if(erro)
						console.log("ocorreu um erro ao tentar achar stock na lista");
					else{
						let indicec=dadoss[0].disponibilidade.findIndex(x => x.referencia==data[0].items[i].referencia)
						if(indicec!=-1)
							 vall.push(dadoss[0].disponibilidade[indicec].disponivel)
						else
							 vall.push(0)


						}
				})


				// **************************************fim dos Arranjos**************************
				
			}
			res.render("stock_return_receive", {DataU:userData, Stock_request:data, Disponivel:vall, title:"EagleI"})
			console.log(vall)
		}

	})	
})


router.get("/reprovar/:id", function(req, res){
		var userData=req.session.usuario;
	stock_return_db.updateOne({_id:req.params.id}, {$push:{estagio:0, stock_approvers:userData.nome, date_actions:new Date()}, $set:{actual_situation:"reprovado"}}, function(err, data){
		if(err)
			console.log("ocorreu um erro ao tentar actualizar po")
		else
			res.redirect("/stock_return")
	})
	})


router.post("/receber_productos", upload.any(), async function(req, res){
	console.log(req.body)

	var procurapo = await stock_return_db.findOne({_id:req.body.novo});

	// ***********************************************************************************************************************************************************inicio de tricks****************************************
	var acacio_stock= await stock_pessoal_db.findOne({nome:procurapo.returned_by, nome_ref:procurapo.returned_by_ref});
	procurapo.items.reduce(async(acc, iidiota, p)=>{
	await acc;
	await sleep(10);
	if(iidiota.serialized=="sim"){
		var index_item=await acacio_stock.disponibilidade[(acacio_stock.disponibilidade.findIndex(x=>x.referencia==iidiota.referencia))]; // objecto encontrado
		var reastreio_value= await index_item.num_serie.findIndex(x=>x==iidiota.num_serie[0]);
		var novo_array=await index_item.precos.splice(reastreio_value, (reastreio_value+1));
		var novo_array_al= await  index_item.precos;

		await stock_pessoal_db.updateOne({nome_ref:req.body.locaal, disponibilidade:{$elemMatch:{referencia:iidiota.referencia}}}, {$set:{"disponibilidade.$.precos":novo_array_al}})
					

		await stock_return_db.updateOne({_id:req.body.novo , items:{$elemMatch:{referencia:iidiota.referencia}}}, { $set:{ "items.$.precos":novo_array}});
				 



	}
	if(iidiota.serialized=="nao"){
		var index_item=await acacio_stock.disponibilidade[(acacio_stock.disponibilidade.findIndex(x=>x.referencia==iidiota.referencia))]; // objecto encontrado
		var reastreio_value= await parseInt(iidiota.quanty);
		var novo_array=await index_item.precos.splice(0, reastreio_value);

		await stock_pessoal_db.updateOne({nome_ref:req.body.locaal, disponibilidade:{$elemMatch:{referencia:iidiota.referencia}}}, {$set:{"disponibilidade.$.precos": index_item.precos}})
					

		await stock_return_db.updateOne({_id:req.body.novo , items:{$elemMatch:{referencia:iidiota.referencia}}}, { $set:{ "items.$.precos": novo_array}});
				 

	}


	}, 0)

	await sleep(500);




	//++++++++*+*+*+**+*+*+*+*+*+*+*-----------------------------------------------------------55555555555555555552345458888888888888--********************+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


console.log(procurapo)
var procurapo1 = await stock_return_db.findOne({_id:req.body.novo});

await stock_return_db.updateOne({_id:req.body.novo}, {$push:{estagio:1, stock_approvers:req.session.usuario.nome, date_actions:new Date()}, $set:{actual_situation:"aprovado"}})

	
			if(Array.isArray(req.body.received)){
			await procurapo1.items.reduce(async function(idiota2, j, cont){
				await idiota2
				await sleep(100)
				
				var incme1= await parseFloat(req.body.received[cont])
				var decremento_stock= await -1*incme1;
				if(j.serialized=="sim" && j.status=="Bom"){
					if( incme1!=0)
					await rastreio_stock_db.updateMany({serial_number:{$in:j.num_serie}}, {$push:{ref_local_actual:req.body.locaal,  local_actual:procurapo.return_to, meio_atribuicao:"Stock Return", atribuidores:req.session.usuario.nome, datas_local_actual:new Date()}});
					await stock_pessoal_db.updateOne({nome_ref:req.body.locaal, disponibilidade:{$elemMatch:{referencia:j.referencia}}}, {$inc:{"disponibilidade.$.disponivel":decremento_stock}, $pull:{"disponibilidade.$.num_serie":{$in:j.num_serie}}})
					await armazem_db.updateOne({_id:req.body.arman, items:{$elemMatch:{referencia:j.referencia}}}, {$inc:{"items.$.disponivel":incme1}, $push:{"items.$.serial_number":j.num_serie, "items.$.precos":j.precos}});
					await stock_req_history_db.gravar_historico({beneficiario:procurapo.return_to, beneficiario_ref: req.body.arman, request_from_ref:req.body.locaal, request_from:procurapo.book_out_to_store, ref_Item:j.referencia, numero:"SRT00001", quantidade:1, nome_item:j.description, serialized:j.serialized, cliente_name:j.cliente_name, precos:j.precos}, function(errp, d){
								if(errp)
									console.log("ocorreu um erro ao tentar gravar historico")
								else
									console.log("Historico gravado com sucesso!!")
							})
					await stock_return_db.updateOne({_id:req.body.novo , items:{$elemMatch:{referencia:j.referencia}}}, { $set:{ "items.$.booked_out":req.body.received[cont], "items.$.data_book_out":new Date(), "items.$.num_serie":j.num_serie}});
				}

				if(j.serialized=="sim" && j.status=="Mau"){
					if( incme1!=0)
					await rastreio_stock_db.updateMany({serial_number:{$in:j.num_serie}}, {$push:{ref_local_actual:req.body.locaal,  local_actual:procurapo.return_to, meio_atribuicao:"Stock Return", atribuidores:req.session.usuario.nome, datas_local_actual:new Date()}});
					await stock_pessoal_db.updateOne({nome_ref:req.body.locaal, disponibilidade_returned:{$elemMatch:{referencia:j.referencia}}}, {$inc:{"disponibilidade_returned.$.disponivel":decremento_stock}, $pull:{"disponibilidade_returned.$.num_serie":{$in:j.num_serie}}})
					await armazem_db.updateOne({_id:req.body.arman, item_returned:{$elemMatch:{referencia:j.referencia}}}, {$inc:{"item_returned.$.disponivel":incme1}, $push:{"item_returned.$.serial_number":j.num_serie, "item_returned.$.serial_number":j.precos}});
					stock_req_history_db.gravar_historico({beneficiario:procurapo.return_to, beneficiario_ref: req.body.arman, request_from_ref:req.body.locaal, request_from:procurapo.book_out_to_store, ref_Item:j.referencia, numero:"SRT00001", quantidade:1, nome_item:j.description, serialized:j.serialized, cliente_name:j.cliente_name, precos:j.precos }, function(errp, d){
								if(errp)
									console.log("ocorreu um erro ao tentar gravar historico")
								else
									console.log("Historico gravado com sucesso!!")
							})

					await stock_return_db.updateOne({_id:req.body.novo , items:{$elemMatch:{referencia:j.referencia}}}, { $set:{ "items.$.booked_out":req.body.received[cont], "items.$.data_book_out":new Date(), "items.$.num_serie":j.num_serie}});
				

				}

				if(j.serialized=="nao" && j.status=="Bom"){
					if( incme1!=0)
					await rastreio_stock_db.updateMany({serial_number:{$in:j.num_serie}}, {$push:{ref_local_actual:req.body.locaal,  local_actual:procurapo.return_to, meio_atribuicao:"Stock Return", atribuidores:req.session.usuario.nome, datas_local_actual:new Date()}});
					await stock_pessoal_db.updateOne({nome_ref:req.body.locaal, disponibilidade:{$elemMatch:{referencia:j.referencia}}}, {$inc:{"disponibilidade.$.disponivel":decremento_stock}, $pull:{"disponibilidade.$.num_serie":{$in:j.num_serie}}})
					await armazem_db.updateOne({_id:req.body.arman, items:{$elemMatch:{referencia:j.referencia}}}, {$inc:{"items.$.disponivel":incme1}, $push:{  "items.$.precos":j.precos}});
					await stock_req_history_db.gravar_historico({beneficiario:procurapo.return_to, beneficiario_ref: req.body.arman, request_from_ref:req.body.locaal, request_from:procurapo.book_out_to_store, ref_Item:j.referencia, numero:"SRT00001", quantidade:req.body.received[cont], nome_item:j.description, serialized:j.serialized, cliente_name:j.cliente_name , precos:j.precos}, function(errp, d){
								if(errp)
									console.log("ocorreu um erro ao tentar gravar historico")
								else
									console.log("Historico gravado com sucesso!!")
							})
					await stock_return_db.updateOne({_id:req.body.novo , items:{$elemMatch:{referencia:j.referencia}}}, { $set:{ "items.$.booked_out":req.body.received[cont], "items.$.data_book_out":new Date(), "items.$.num_serie":j.num_serie}});
				}

				if(j.serialized=="nao" && j.status=="Mau"){
					if( incme1!=0)
					await rastreio_stock_db.updateMany({serial_number:{$in:j.num_serie}}, {$push:{ref_local_actual:req.body.locaal,  local_actual:procurapo.return_to, meio_atribuicao:"Stock Return", atribuidores:req.session.usuario.nome, datas_local_actual:new Date()}});
					await stock_pessoal_db.updateOne({nome_ref:req.body.locaal, disponibilidade_returned:{$elemMatch:{referencia:j.referencia}}}, {$inc:{"disponibilidade_returned.$.disponivel":decremento_stock}, $pull:{"disponibilidade_returned.$.num_serie":{$in:j.num_serie}}})
					await armazem_db.updateOne({_id:req.body.arman, item_returned:{$elemMatch:{referencia:j.referencia}}}, {$inc:{"item_returned.$.disponivel":incme1}, $push:{ "item_returned.$.serial_number":j.precos}});
					stock_req_history_db.gravar_historico({beneficiario:procurapo.return_to, beneficiario_ref: req.body.arman, request_from_ref:req.body.locaal, request_from:procurapo.book_out_to_store, ref_Item:j.referencia, numero:"SRT00001", quantidade:req.body.received[cont], nome_item:j.description, serialized:j.serialized, cliente_name:j.cliente_name, precos:j.precos}, function(errp, d){
								if(errp)
									console.log("ocorreu um erro ao tentar gravar historico")
								else
									console.log("Historico gravado com sucesso!!")
							})

					await stock_return_db.updateOne({_id:req.body.novo , items:{$elemMatch:{referencia:j.referencia}}}, { $set:{ "items.$.booked_out":req.body.received[cont], "items.$.data_book_out":new Date(), "items.$.num_serie":j.num_serie}});
				

				}






				


			}, 0)
}
else{
	await procurapo.items.reduce(async function(idiota2, j, cont){
				await idiota2
				await sleep(100)
				var incme1= await parseFloat(req.body.received)
				var decremento_stock= await -1*incme1;
				if(j.serialized=="sim" && j.status=="Bom"){
					if( incme1!=0)
					await rastreio_stock_db.updateMany({serial_number:{$in:j.num_serie}}, {$push:{ref_local_actual:req.body.locaal,  local_actual:procurapo.return_to, meio_atribuicao:"Stock Return", atribuidores:req.session.usuario.nome, datas_local_actual:new Date()}});
					await stock_pessoal_db.updateOne({nome_ref:req.body.locaal, disponibilidade:{$elemMatch:{referencia:j.referencia}}}, {$inc:{"disponibilidade.$.disponivel":decremento_stock}, $pull:{"disponibilidade.$.num_serie":{$in:j.num_serie}}})
					await armazem_db.updateOne({_id:req.body.arman, items:{$elemMatch:{referencia:j.referencia}}}, {$inc:{"items.$.disponivel":incme1}, $push:{"items.$.serial_number":j.num_serie, "items.$.precos":j.precos}});
					await stock_req_history_db.gravar_historico({beneficiario:procurapo.return_to, beneficiario_ref: req.body.arman, request_from_ref:req.body.locaal, request_from:procurapo.book_out_to_store, ref_Item:j.referencia, numero:"SRT00001", quantidade:1, nome_item:j.description, serialized:j.serialized, cliente_name:j.cliente_name,  precos:j.precos}, function(errp, d){
								if(errp)
									console.log("ocorreu um erro ao tentar gravar historico")
								else
									console.log("Historico gravado com sucesso!!")
							})
					await stock_return_db.updateOne({_id:req.body.novo , items:{$elemMatch:{referencia:j.referencia}}}, { $set:{ "items.$.booked_out":req.body.received, "items.$.data_book_out":new Date(), "items.$.num_serie":j.num_serie}});
				}

				if(j.serialized=="sim" && j.status=="Mau"){
					if( incme1!=0)
					await rastreio_stock_db.updateMany({serial_number:{$in:j.num_serie}}, {$push:{ref_local_actual:req.body.locaal,  local_actual:procurapo.return_to, meio_atribuicao:"Stock Return", atribuidores:req.session.usuario.nome, datas_local_actual:new Date()}});
					await stock_pessoal_db.updateOne({nome_ref:req.body.locaal, disponibilidade_returned:{$elemMatch:{referencia:j.referencia}}}, {$inc:{"disponibilidade_returned.$.disponivel":decremento_stock}, $pull:{"disponibilidade_returned.$.num_serie":{$in:j.num_serie}}})
					await armazem_db.updateOne({_id:req.body.arman, item_returned:{$elemMatch:{referencia:j.referencia}}}, {$inc:{"item_returned.$.disponivel":incme1}, $push:{"item_returned.$.serial_number":j.num_serie, "item_returned.$.precos":j.precos}});
					stock_req_history_db.gravar_historico({beneficiario:procurapo.return_to, beneficiario_ref: req.body.arman, request_from_ref:req.body.locaal, request_from:procurapo.book_out_to_store, ref_Item:j.referencia, numero:"SRT00001", quantidade:1, nome_item:j.description, serialized:j.serialized, cliente_name:j.cliente_name, precos:j.precos}, function(errp, d){
								if(errp)
									console.log("ocorreu um erro ao tentar gravar historico")
								else
									console.log("Historico gravado com sucesso!!")
							})

					await stock_return_db.updateOne({_id:req.body.novo , items:{$elemMatch:{referencia:j.referencia}}}, { $set:{ "items.$.booked_out":req.body.received, "items.$.data_book_out":new Date(), "items.$.num_serie":j.num_serie}});
				

				}

				if(j.serialized=="nao" && j.status=="Bom"){
					if( incme1!=0)
					await rastreio_stock_db.updateMany({serial_number:{$in:j.num_serie}}, {$push:{ref_local_actual:req.body.locaal,  local_actual:procurapo.return_to, meio_atribuicao:"Stock Return", atribuidores:req.session.usuario.nome, datas_local_actual:new Date()}});
					await stock_pessoal_db.updateOne({nome_ref:req.body.locaal, disponibilidade:{$elemMatch:{referencia:j.referencia}}}, {$inc:{"disponibilidade.$.disponivel":decremento_stock}, $pull:{"disponibilidade.$.num_serie":{$in:j.num_serie}}})
					await armazem_db.updateOne({_id:req.body.arman, items:{$elemMatch:{referencia:j.referencia}}}, {$inc:{"items.$.disponivel":incme1}, $push:{"items.$.serial_number":j.num_serie, "items.$.precos":j.precos}});
					await stock_req_history_db.gravar_historico({beneficiario:procurapo.return_to, beneficiario_ref: req.body.arman, request_from_ref:req.body.locaal, request_from:procurapo.book_out_to_store, ref_Item:j.referencia, numero:"SRT00001", quantidade:req.body.received, nome_item:j.description, serialized:j.serialized, cliente_name:j.cliente_name,  precos:j.precos}, function(errp, d){
								if(errp)
									console.log("ocorreu um erro ao tentar gravar historico")
								else
									console.log("Historico gravado com sucesso!!")
							})
					await stock_return_db.updateOne({_id:req.body.novo , items:{$elemMatch:{referencia:j.referencia}}}, { $set:{ "items.$.booked_out":req.body.received, "items.$.data_book_out":new Date(), "items.$.num_serie":j.num_serie}});
				}

				if(j.serialized=="nao" && j.status=="Mau"){
					if( incme1!=0)
					await rastreio_stock_db.updateMany({serial_number:{$in:j.num_serie}}, {$push:{ref_local_actual:req.body.locaal,  local_actual:procurapo.return_to, meio_atribuicao:"Stock Return", atribuidores:req.session.usuario.nome, datas_local_actual:new Date()}});
					await stock_pessoal_db.updateOne({nome_ref:req.body.locaal, disponibilidade_returned:{$elemMatch:{referencia:j.referencia}}}, {$inc:{"disponibilidade_returned.$.disponivel":decremento_stock}, $pull:{"disponibilidade_returned.$.num_serie":{$in:j.num_serie}}})
					await armazem_db.updateOne({_id:req.body.arman, item_returned:{$elemMatch:{referencia:j.referencia}}}, {$inc:{"item_returned.$.disponivel":incme1}, $push:{"item_returned.$.serial_number":j.num_serie, "item_returned.$.serial_number":{$each:j.precos}}});
					stock_req_history_db.gravar_historico({beneficiario:procurapo.return_to, beneficiario_ref: req.body.arman, request_from_ref:req.body.locaal, request_from:procurapo.book_out_to_store, ref_Item:j.referencia, numero:"SRT00001", quantidade:req.body.received, nome_item:j.description, serialized:j.serialized, cliente_name:j.cliente_name , precos:j.preco}, function(errp, d){
								if(errp)
									console.log("ocorreu um erro ao tentar gravar historico")
								else
									console.log("Historico gravado com sucesso!!")
							})

					await stock_return_db.updateOne({_id:req.body.novo , items:{$elemMatch:{referencia:j.referencia}}}, { $set:{ "items.$.booked_out":req.body.received, "items.$.data_book_out":new Date(), "items.$.num_serie":j.num_serie}});
				

				}






				


			},0)

}

		



	

})

const sleep = ms => {
	return new Promise(resolve => setTimeout(resolve, ms));
}



module.exports=router;