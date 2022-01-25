var express = require('express');
var router = express.Router();
var userM=require("../entities/usuario");
var incidente_db=require("../entities/incidente");


/* GET home page. */


router.get('/', function(req, res, next) {
	delete req.session.usuario;
	
  res.render("login", {title:'EAGLEI'});
});

router.post("/change", function(req, res){
	var user1=getUser(req.body)
	if((user1.username!=user1.senha) && (user1.senha.length>=7)){
	userM.findOneAndUpdate({username:user1.username},{$set:{'senha':user1.senha, loged:"sim"}}, function(err, data){
		if(err)
		console.log("erro ao tentar actualizar os mudar o password")
		else
		if(data)
		console.log("Dados actualizados com Sucesso")
		}
		)
		res.render("login")
	}
		else
		userM.findOne({username:user1.username}, function(err, data){
			if(err)
			console.log("ocorreu um erro ao tentar mudar password 2")
			else
			res.render("changeProf", {err:true, greeting:data, message:"your passwords are less than 7 letter or \n they dont match"})
		})
	


})
	
	

router.get("/inicio", function(req, res){
	if(req.session.usuario){
		var userData=req.session.usuario;
		console.log(userData);
		res.render("inicio", {DataU:userData, title: "EAGLEI"})
	}
	else
	res.redirect("/")
})

router.post('/', function(req, res){
	var user1=getUser(req.body)
	console.log(user1);
	userM.findOne(user1, function(err, datta){
		if(err)
			console.log("erro ao tentar aceder o utilizador!!");
		else
			if(datta){

				// ****************************************************
				if(datta.username==datta.senha) {
					res.render("changeProf",{greeting:datta})
				}
				else
				{
				// **********************************************
				incidente_db.find({}, async function(eero, daddds){
					if(eero)
						console.log("ocorreu um erro")
					else
					{	var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
						var ano = await daddds[0].data.getFullYear();
						var mes= await  daddds[0].data.getMonth()+1;
						var dia= await daddds[0].data.getDate();
						var horas= await daddds[0].data.getHours();
						var minutos= await daddds[0].data.getMinutes();
						var firstDate =await new Date(ano, mes, dia);
						var secondDate =await new Date();
						console.log(firstDate, secondDate)
						
						var diffDays = await Math.round(Math.abs((firstDate - secondDate) / oneDay));
						var diffDays=ano+"-"+mes+"-"+dia;
						console.log(diffDays)
						
						
						var temp=await {};
						temp.data=await diffDays;
						var pacote= Object.assign(datta, temp)
						pacote.data=await diffDays

						req.session.usuario= await pacote;
						req.session.usuario.data= diffDays;

						var userData=req.session.usuario;
						userData.data=diffDays
						console.log(pacote)
						console.log(temp)
						res.render("inicio", {DataU:userData, title:'EAGLEI'});
						
					}
				}).sort({_id:-1})
				
				
			}
			}
			else
				//res.redirect("/inicio")
				res.render("login",{err:true})
	})
})


function getUser(body){
	var userr= {};
	userr.username=body.username.replace(/[{}$\/*-+/#@!)()><?\\^\'%$&:,;`]/g,'');
	userr.senha=body.senha.replace(/[{}$\/*-+/#@!)()><?\\^\'%$&:,;`]/g,'');
	return userr;

}




// (
// 	async function(){
// 		let gg= await userM.find({});

// 		var tt=await Promise.all(gg.map(async function(e){
// 					await userM.updateOne({funcao:"Call Center"},{$set:{departamento_id:"61728c8c07fec02d40e0ab3e",departamento:"Centro de Suporte de Operações"}, $unset:{departmento:1}})
// 				})
// 		)
// 		console.log(tt)
// 	}
// )()



module.exports = router;


