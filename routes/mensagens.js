var express=require("express")
var router= express.Router();
var mensagem= require("../entities/message");
var users=require("../entities/usuario");
var model=require("../entities/veiculo");
var provincias=require("../util/provincias-distritos")

router.get("/", async function(req, res){
	var userData=req.session.usuario;
if(req.session.usuario.nivel_acesso!="normal" ){
	model.aggregate([{$group:{_id:{"ano":{$year:"$data_inspecao"}, "observacao":"$observacao"}, 'soma':{$sum:1}}}, {$group :{_id:"$_id.ano", "lista":{$push:{observacao:"$_id.observacao", soma:"$soma"}}}}], function(err, data){
		if(err)
			console.log("ocorreu um errro")
		else
			{	console.log(data)
				res.render('mensagem_entrada_home', {DataU:userData,Mensagem: JSON.stringify(data),  title:'EagleI'});}
	}).sort({_id:1})
// mensagem.find({destinatario:req.session.usuario.nome}, function(err, data){
// 		if(err)
// 			console.log(err); 
// 		else {
// 			res.render('mensagem_entrada_home', {DataU:userData,Mensagem: data,  title:'EagleI'});
// 		}
// 	})

}
else

{
	if(req.session.usuario.funcao=="Manager" || req.session.usuario.funcao=="regional_manager" ){
		var membros= await users.find({nome_supervisor:userData.nome}, function(erro, mebros){
			if(erro)
				console.log("ocorreu um erro ao tentar achar membros")
			else
				return mebros;
		}); 

		let array_membros=[userData.nome];
		for(let i=0; i< membros.length; i++){
			array_membros.push(membros[i].nome);
		}

		model.aggregate([{$match:{motorista:{$in:array_membros}}}, {$group:{_id:{"ano":{$year:"$data_inspecao"}, "observacao":"$observacao"}, 'soma':{$sum:1}}}, {$group :{_id:"$_id.ano", "lista":{$push:{observacao:"$_id.observacao", soma:"$soma"}}}}], function(err, data){
		if(err)
			console.log("ocorreu um errro")
		else
			{	console.log(data)
				res.render('mensagem_entrada_home', {DataU:userData,Mensagem: JSON.stringify(data),  title:'EagleI'});}
		}).sort({_id:1})

	}
	else
	{
		var start= new Date("2021-01-01");
		var end= new Date("2021-12-31");
		console.log(start, end)
		model.aggregate([{$match:{data_inspecao:{$lte:end, $gte:start}, motorista:req.session.usuario.nome}}, {$group:{_id:{mes:{$month:"$data_inspecao"}, observacao:"$observacao"}, soma:{$sum:1}}}, {$group :{_id:"$_id.mes", "lista":{$push:{observacao:"$_id.observacao", soma:"$soma"}}}},  {$sort:{_id:1}}], function(err, data){
			if(err)
				console.log("ocorreu um erro ao tentar procurar meses");
			else{
				// console.log(data)
				res.render('pessoal', {DataU:userData, Mensagem: JSON.stringify(data),  title:'EagleI'})
			}
		})
	}
	// model.aggregate([{"$match":{motorista:req.session.usuario.nome}},{"$group":{_id:"$observacao", "num":{"$sum":1}}}], function(err, data){
	// 	if(err)
	// 		console.log(err); 
	// 	else {
	// 		console.log(data)
	// 		res.render('pessoal', {veiculosMensal: JSON.stringify(data), DataU:userData,  title:'EagleI'});
	// 	}
	// })
}

})

router.get("/teste/:id", async function(req, res){
var userData=req.session.usuario;
var anoseguido = req.params.id;
if(req.session.usuario.nivel_acesso!="normal" ){
// mensagem.find({remetente:req.session.usuario.nome}, function(err, data){
// 		if(err)
// 			console.log(err); 
// 		else {
// 			res.render('mensagem_saida_home', {DataU:userData,Mensagem: data,  title:'EagleI'});
// 		}
// 	})
var start= new Date((req.params.id+"-01-01"))
var end= new Date((req.params.id+"-12-31"));
console.log(start, end)
model.aggregate([{$match:{data_inspecao:{$lt:end, $gte:start}}}, {$group:{_id:{mes:{$month:"$data_inspecao"}, observacao:"$observacao"}, soma:{$sum:1}}}, {$group :{_id:"$_id.mes", "lista":{$push:{observacao:"$_id.observacao", soma:"$soma"}}}},  {$sort:{_id:1}}], function(err, data){
	if(err)
		console.log("ocorreu um erro ao tentar procurar meses");
	else{
		console.log(anoseguido);
		res.render('mensal_estatistica', {DataU:userData, Mensagem: JSON.stringify(data), anoseguido: anoseguido, title:'EagleI'})
	}
})

}
else{
	if(req.session.usuario.funcao=="Manager" || req.session.usuario.funcao=="regional_manager" ){
		var membros= await users.find({nome_supervisor:userData.nome}, function(erro, mebros){
			if(erro)
				console.log("ocorreu um erro ao tentar achar membros")
			else
				return mebros;
		}); 
		var start= new Date((req.params.id+"-01-01"))
		var end= new Date((req.params.id+"-12-31"));

		let array_membros=[userData.nome];
		for(let i=0; i< membros.length; i++){
			array_membros.push(membros[i].nome);
		}

		// console.log(array_membros)
		

		model.aggregate([{$match:{motorista:{$in:array_membros}}},{$match:{data_inspecao:{$lt:end, $gte:start}}}, {$group:{_id:{mes:{$month:"$data_inspecao"}, observacao:"$observacao"}, soma:{$sum:1}}}, {$group :{_id:"$_id.mes", "lista":{$push:{observacao:"$_id.observacao", soma:"$soma"}}}},  {$sort:{_id:1}}], function(err, data){
			if(err)
				console.log("ocorreu um erro ao tentar procurar meses");
			else{
				console.log(anoseguido);
				res.render('mensal_estatistica', {DataU:userData, Mensagem: JSON.stringify(data), anoseguido: anoseguido, title:'EagleI'})
			}
			})

	}
}

})

router.get("/detalhes_s/:idaano/:id", async function(req, res){
	var userData=req.session.usuario;
	var anoseguido = req.params.idaano;
	if(req.session.usuario.nivel_acesso!="normal" ){
		let meses=['Jan','Fev', 'Mar','Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
		var valor=meses.indexOf(req.params.id)
		//console.log(valor)
		//var end="2019-"+((valor+1)<10? ("0"+(valor+1)):(valor+1))+"-31";
		//var start="2019-"+((valor+1)<10? ("0"+(valor+1)):(valor+1))+"-01";
		var end=anoseguido + "-" +((valor+1)<10? ("0"+(valor+1)):(valor+1))+"-31";
		var start=anoseguido + "-" +((valor+1)<10? ("0"+(valor+1)):(valor+1))+"-01";
		end=new Date(end);
		start =new Date(start)
		console.log(start, end)
		model.aggregate([{$match:{data_inspecao:{$lte:end, $gte:start}}}, {$group:{_id:{regiao:"$regiao", observacao:"$observacao"}, soma:{$sum:1}}}, {$group :{_id:"$_id.regiao", "lista":{$push:{observacao:"$_id.observacao", soma:"$soma"}}}},  {$sort:{_id:1}}], function(err, data){
	if(err)
		console.log("ocorreu um erro ao tentar procurar meses");
	else{
		console.log(data)
		res.render('regional_estatistica', {DataU:userData, Mensagem: JSON.stringify(data), mess:JSON.stringify(valor), anoseguido:anoseguido,title:'EagleI'})
	}
})
// mensagem.find({_id:req.params.id}, function(err, data){
// 	if(err){
// 		console.log("ocorreu um erro ao tentar aceder os dados")
// 	}
// 	var temp=retornarTodos();
// 	res.render('mensagem_form', {DataU:userData,Mensagem: data, contactos:temp, title: 'EagleI'});

// })

}
else{
	if(req.session.usuario.funcao=="Manager" || req.session.usuario.funcao=="regional_manager" ){
		var membros= await users.find({nome_supervisor:userData.nome}, function(erro, mebros){
			if(erro)
				console.log("ocorreu um erro ao tentar achar membros")
			else
				return mebros;
		}); 



		let array_membros=[userData.nome];
		for(let i=0; i< membros.length; i++){
			array_membros.push(membros[i].nome);
		}

		let meses=['Jan','Fev', 'Mar','Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
		var valor=meses.indexOf(req.params.id)
		//console.log(valor)
		//var end="2019-"+((valor+1)<10? ("0"+(valor+1)):(valor+1))+"-31";
		//var start="2019-"+((valor+1)<10? ("0"+(valor+1)):(valor+1))+"-01";
		var end=anoseguido + "-" +((valor+1)<10? ("0"+(valor+1)):(valor+1))+"-31";
		var start=anoseguido + "-" +((valor+1)<10? ("0"+(valor+1)):(valor+1))+"-01";
		end=new Date(end);
		start =new Date(start)
		console.log(start, end)
		model.aggregate([{$match:{data_inspecao:{$lte:end, $gte:start}, motorista:{$in:array_membros}}}, {$group:{_id:{regiao:"$regiao", observacao:"$observacao"}, soma:{$sum:1}}}, {$group :{_id:"$_id.regiao", "lista":{$push:{observacao:"$_id.observacao", soma:"$soma"}}}},  {$sort:{_id:1}}], function(err, data){
	if(err)
		console.log("ocorreu um erro ao tentar procurar meses");
	else{
		console.log(data)
		res.render('regional_estatistica', {DataU:userData, Mensagem: JSON.stringify(data), mess:JSON.stringify(valor), anoseguido:anoseguido,title:'EagleI'})
	}
})

		

	}
}

})


router.get("/detalhes_e/:idaano/:id", async function(req, res){ 
	var userData=req.session.usuario;
	var anoseguido = req.params.idaano;
	if(req.session.usuario.nivel_acesso!="normal" ){

	var separacao=(req.params.id).split('_');

	let tempo= parseInt(separacao[1]);
	console.log(tempo);
	// var end="2019-"+((tempo+1)<10? ("0"+(tempo+1)):(tempo+1))+"-31";
	// var start="2019-"+((tempo+1)<10? ("0"+(tempo+1)):(tempo+1))+"-01";
	var end=anoseguido + "-" +((tempo+1)<10? ("0"+(tempo+1)):(tempo+1))+"-31";
	var start=anoseguido + "-" +((tempo+1)<10? ("0"+(tempo+1)):(tempo+1))+"-01";

	var estacao=tempo+"_"+separacao[0];
	end=new Date(end);
	start =new Date(start)
model.aggregate([{$match:{data_inspecao:{$lte:end, $gte:start}, regiao:separacao[0]}}, {$group:{_id:{motorista:"$motorista", observacao:"$observacao"}, soma:{$sum:1}}}, {$group :{_id:"$_id.motorista", "lista":{$push:{observacao:"$_id.observacao", soma:"$soma"}}}},  {$sort:{_id:1}}], function(err, data){
	if(err)
		console.log("ocorreu um erro ao tentar filtrar por regiao")
	else
	{
		console.log(data);
		res.render('mensagem_form_e', {DataU:userData, Mensagem: JSON.stringify(data), mess:JSON.stringify(estacao), anoseguido:anoseguido, title:'EagleI'})
	}
})

}
else{
	if(req.session.usuario.funcao=="Manager" || req.session.usuario.funcao=="regional_manager" ){
		var membros= await users.find({nome_supervisor:userData.nome}, function(erro, mebros){
			if(erro)
				console.log("ocorreu um erro ao tentar achar membros")
			else
				return mebros;
		}); 
		

		let array_membros=[userData.nome];
		for(let i=0; i< membros.length; i++){
			array_membros.push(membros[i].nome);
		}
	var separacao=(req.params.id).split('_');

	let tempo= parseInt(separacao[1]);
	console.log(tempo);
	// var end="2019-"+((tempo+1)<10? ("0"+(tempo+1)):(tempo+1))+"-31";
	// var start="2019-"+((tempo+1)<10? ("0"+(tempo+1)):(tempo+1))+"-01";
	var end=anoseguido + "-" +((tempo+1)<10? ("0"+(tempo+1)):(tempo+1))+"-31";
	var start=anoseguido + "-" +((tempo+1)<10? ("0"+(tempo+1)):(tempo+1))+"-01";

	var estacao=tempo+"_"+separacao[0];
	end=new Date(end);
	start =new Date(start)
	model.aggregate([{$match:{data_inspecao:{$lte:end, $gte:start}, regiao:separacao[0], motorista:{$in:array_membros}}}, {$group:{_id:{motorista:"$motorista", observacao:"$observacao"}, soma:{$sum:1}}}, {$group :{_id:"$_id.motorista", "lista":{$push:{observacao:"$_id.observacao", soma:"$soma"}}}},  {$sort:{_id:1}}], function(err, data){
	if(err)
		console.log("ocorreu um erro ao tentar filtrar por regiao")
	else
	{
		console.log(data);
		res.render('mensagem_form_e', {DataU:userData, Mensagem: JSON.stringify(data), mess:JSON.stringify(estacao), anoseguido:anoseguido, title:'EagleI'})
	}
})
		

		

	}

}

})


router.get("/novo", function(req, res){
	var userData=req.session.usuario;
	if(req.session.usuario.nivel_acesso!="normal"){
	users.find({}, function(err, data){
		if(err)
			console.log(err); 
		else {
			var valores=[];
			for(var i=0; i<data.length; i++)
				valores.push(data[i].nome)
			res.render('mensagem_form', {DataU:userData,contactos:valores,  title: 'EagleI'});
		}
	})}
})

router.post("/novo", function(req, res){
	if(req.session.usuario.nivel_acesso=="admin"){
	var msg = getMessage(req.body);
	msg.remetente=req.session.usuario.nome
	console.log(msg);
	mensagem.gravarDados(msg, function(err){
		if(err){
			console.log("Ocorreu um erro ao tentar gravar os dados!\n contacte o administrador do sistema");
			console.log(err)
		}
		else
			console.log("dados gravados com sucesso!!");
	});
	
	res.redirect("/mensagem");}
})



router.get("/vo3el45tar/:idaano/:id", function(req, res){
	var userData=req.session.usuario;
	var anoseguido = req.params.idaano;
	if(req.session.usuario.nivel_acesso!="normal" ){
		let meses=['Jan','Fev', 'Mar','Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
		var valor=req.params.id
		var mestre=valor.split("_");
		mezz=mestre.splice(mestre.length-1)
		var nomme=mestre.join().replace(/,/g," ");
		console.log(nomme)
		let tempo=meses.indexOf(mezz[0])
		console.log(tempo);

		// var end="2019-"+((tempo+1)<10? ("0"+(tempo+1)):(tempo+1))+"-31";
		// var start="2019-"+((tempo+1)<10? ("0"+(tempo+1)):(tempo+1))+"-01";
		var end=anoseguido + "-" +((tempo+1)<10? ("0"+(tempo+1)):(tempo+1))+"-31";
		var start=anoseguido + "-" +((tempo+1)<10? ("0"+(tempo+1)):(tempo+1))+"-01";
		end=new Date(end);
		start =new Date(start)
		console.log(start, end)
		model.find({motorista:nomme, data_inspecao:{$lte:end, $gte:start}}, function(err, data){
	if(err)
		console.log("ocorreu um erro ao tentar procurar meses");
	else{
		console.log(data)
		res.render('inspdiaria_home', {DataU:userData, veiculos: data,  provincias:provincias, title:'EagleI'});
		// res.render('regional_estatistica', {DataU:userData, Mensagem: JSON.stringify(data), mess:JSON.stringify(valor), title:'EagleI'})
	}
}).sort({_id:-1})
// mensagem.find({_id:req.params.id}, function(err, data){
// 	if(err){
// 		console.log("ocorreu um erro ao tentar aceder os dados")
// 	}
// 	var temp=retornarTodos();
// 	res.render('mensagem_form', {DataU:userData,Mensagem: data, contactos:temp, title: 'EagleI'});

// })

}
else{
	if(req.session.usuario.funcao=="Manager" || req.session.usuario.funcao=="regional_manager" ){
		

		let meses=['Jan','Fev', 'Mar','Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
		var valor=req.params.id
		var mestre=valor.split("_");
		mezz=mestre.splice(mestre.length-1)
		var nomme=mestre.join().replace(/,/g," ");
		console.log(nomme)
		let tempo=meses.indexOf(mezz[0])
		console.log(tempo);

		// var end="2019-"+((tempo+1)<10? ("0"+(tempo+1)):(tempo+1))+"-31";
		// var start="2019-"+((tempo+1)<10? ("0"+(tempo+1)):(tempo+1))+"-01";
		var end=anoseguido + "-" +((tempo+1)<10? ("0"+(tempo+1)):(tempo+1))+"-31";
		var start=anoseguido + "-" +((tempo+1)<10? ("0"+(tempo+1)):(tempo+1))+"-01";
		end=new Date(end);
		start =new Date(start)
		console.log(start, end)
		model.find({motorista:nomme, data_inspecao:{$lte:end, $gte:start}}, function(err, data){
	if(err)
		console.log("ocorreu um erro ao tentar procurar meses");
	else{
		console.log(data)
		res.render('inspdiaria_home', {DataU:userData, veiculos: data,  provincias:provincias, title:'EagleI'});
		// res.render('regional_estatistica', {DataU:userData, Mensagem: JSON.stringify(data), mess:JSON.stringify(valor), title:'EagleI'})
	}
}).sort({_id:-1})

		

	}

}

})


function retornarTodos(){
	var valores=[];
	users.find({}, function(err, data){
		if(err)
			console.log(err); 
		else {
			
			for(var i=0; i<data.length; i++)
				valores.push(data[i].nome)
		}
	})
	return valores;

}

function getMessage(body){
	var mensagemmm= {};
	mensagemmm.destinatario=body.destinatario;
	mensagemmm.assunto=body.assunto, 
	mensagemmm.conteudo=body.conteudo, 
	mensagemmm.remetente="eu"
		return mensagemmm;

}


module.exports=router