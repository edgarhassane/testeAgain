var express = require('express');
var router = express.Router();
var admin_db=require("../entities/sisadmin");
var cliente_db=require("../entities/cliente");
var viaturas_db=require("../entities/oficina");
var users_db=require("../entities/usuario");
var hvac_db=require("../entities/hvac");
var veiiculo_db= require("../entities/veiculo.js");
var cliente_hvac_db=require("../entities/cliente_hvac");
var armazem_db=require("../entities/armazem");
var stock_pessoal_db=require("../entities/stock_pessoal")


var model = require('../entities/usuario');
var NodeGeocoder=require("node-geocoder");
var fs = require("fs");


const options = {
  provider: 'google',
 
  // Optional depending on the providers
  
  apiKey: 'AIzaSyAGI4PphO0TcAodia57tSsJXRSVlTAwNaU', // for Mapquest, OpenCage, Google Premier
  formatter: null // 'gpx', 'string', ...
};

const geocoder = NodeGeocoder(options);

//   const thhh =  geocoder.geocode('manduca, maputo, infulene');
//         console.log(thhh)

var multer = require('multer');
var path = require("path");
// var upload = multer({
//     storage: multer.diskStorage({
//         destination: function(req, file, cb) {
//             cb(null, './public/uploads/hvac');
//         },
//         filename: function(req, file, cb) {
//             cb(null, req.session.usuario.nome + "_" + Date.now() + path.extname(file.originalname));
//         }
//     })
// });

var upload = multer({
    storage: multer.diskStorage({
        destination: function(req, file,cb){
            cb(null, './public/Hvac/');
        },
        filename: function(req, file, cb){
            cb(null, file.fieldname + "_"+Date.now() + file.originalname.replace(/ /g, "_"));
        }
    }) 
});



router.get("/novo", async(req, res)=>{
        var userData= await req.session.usuario;
    var admin_case=await admin_db.find({});
    var clinet=await cliente_hvac_db.find({}).sort({nome_cliente:1});
    var hvacUsers=await users_db.find({departamento_id:userData.departamento_id}).sort({nome:1});
    var viaturd =await users_db.find({departamento_id:userData.departamento_id, matricula:{$ne:"SEM VEICULO"}}).sort({matricula:1});
    res.render("callout_form", {DataU:userData, AdMagen:admin_case, Clientes:clinet, Clientes1:JSON.stringify(clinet), Viaturas:viaturd, HvacUsers:hvacUsers,title:"eagleI"})

})


router.get("/novafilial/:camn", async(req, res)=>{
        var userData= await req.session.usuario;
    var admin_case=await admin_db.find({});
    var clinet=await cliente_hvac_db.find({_id:req.params.camn});
    
    var viaturd =await viaturas_db.find({}).sort({matricula:1});
    res.render("hvac_filial", {DataU:userData, AdMagen:admin_case, Clientes:clinet, title:"eagleI"})

})




router.get("/criarcliente", async(req, res)=>{
        var userData= await req.session.usuario;
    var admin_case=await admin_db.find({});
    var clinet=await cliente_db.find({});
    var hvacUsers=await users_db.find({}).sort({nome:1});
    var viaturd =await viaturas_db.find({}).sort({matricula:1});
    res.render("criar_cliente_hvac", {DataU:userData, AdMagen:admin_case,  title:"eagleI"})

})

router.get("/Clicorrectiva", async(req, res)=>{
        var userData= await req.session.usuario;
    var admin_case=await admin_db.find({});
    var clinet=await cliente_db.find({});
    var hvacUsers=await users_db.find({}).sort({nome:1});
    var viaturd =await viaturas_db.find({}).sort({matricula:1});
    var nome = userData.nome;
    var userDept = userData.departamento;
    var controladorfuncao = 0;
    console.log(userData.funcao + " do departamento " + userDept);

    if (userData.funcao == "Tecnico" || userData.funcao == "Assistant" || userData.funcao == "Assistente") {
        controladorfuncao = 1;
    }else if(userData.funcao == "regional_manager"){
        controladorfuncao = 2;
    }else if (userData.verificador_funcao == "Regional Manager") {
        controladorfuncao = 3;
    }else if((userData.funcao == "Call Center") || (userData.funcao == "Back Office") || (userData.nivel_acesso == "admin") || (userData.funcao == "IT Officer") || (userData.funcao == "Commercial") || ((userData.funcao == "Manager") && (userData.departamento == "Climatização e Electricidade")) || (userData.nome == "Rogerio Galrito") ){
        controladorfuncao = 4;
    }else if(userData.nome == "Guest"){
        controladorfuncao = 5;
    }else if (userData.funcao == "Manager" && (userData.funcao == "Climatização e Electricidade")) {
        controladorfuncao = 6;
    }
    
    console.log(controladorfuncao);

    switch (controladorfuncao) {
        case 1:
            countNew = await hvac_db.countDocuments({departamento_ref:"611e45e68cd71c1f48cf45bd", tecnico:nome, status:"new"}, function(err, newjobs){
                if (err) {
                    console.log("Ocorreu um erro ao tentar contar os Callouts New")
                } else {
                    console.log(newjobs + " jobcards novos");
                }
            }).lean();
                    
            countInprogress = await hvac_db.countDocuments({departamento_ref:"611e45e68cd71c1f48cf45bd", tecnico:nome, status:"In Progress"}, function(err, inprogressjobs){
                if (err) {
                    console.log("Ocorreu um erro ao tentar contar os Callouts In progress");
                } else {
                    console.log(inprogressjobs + " jobcards In Progress");
                }
            }).lean();
                            
            countComplete = await hvac_db.countDocuments({departamento_ref:"611e45e68cd71c1f48cf45bd", tecnico:nome, status:"Complete"}, function(err, completejobs){
                if (err) {
                    console.log("Ocorreu um erro ao tentar contar os Callouts Complete");
                } else {
                    console.log(completejobs + " jobcards Complete");
                }
            }).lean();

            // countEscalated = await jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New", $and:[{$or:[{ttnumber_status:"New"}, {jobcard_estadoactual:"On hold"}]}, {$or:[{jobcard_siteclassif:"CB"},{jobcard_siteclassif:"BB"},{jobcard_siteclassif:"RN"},{jobcard_siteclassif:"CL"},{jobcard_siteclassif:"DC"}]} ] ,jobcard_tecniconome:nome}, function(err, escalatedjobs){
            //     if (err) {
            //         console.log("Ocorreu um erro ao tentar contar os Callouts escalonados")
            //     } else {
            //         console.log(escalatedjobs + " jobcards escalados");
            //     }
            // }).lean();

        break;

        case 2:
            countNew = await jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, newjobs){
                if (err) {
                    console.log("Ocorreu um erro ao tentar contar os Callouts New")
                } else {
                    console.log(newjobs + " jobcards novos");
                }
            }).lean();
                    
            countInprogress = await jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", $or:[{jobcard_linemanager:nome}, {jobcard_tecniconome:nome}]}, function(err, inprogressjobs){
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
                    
            countInprogress = await jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"In Progress", jobcard_regiao:userData.regiao, jobcard_departamento:userDept}, function(err, inprogressjobs){
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

            countEscalated = await jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New", jobcard_regiao:userData.regiao, $and:[{$or:[{ttnumber_status:"New"}, {jobcard_estadoactual:"On hold"}]}, {$or:[{jobcard_siteclassif:"CB"},{jobcard_siteclassif:"BB"},{jobcard_siteclassif:"RN"},{jobcard_siteclassif:"CL"},{jobcard_siteclassif:"DC"}]} ]}, function(err, escalatedjobs){
                if (err) {
                    console.log("Ocorreu um erro ao tentar contar os Callouts Escalados")
                } else {
                    console.log(escalatedjobs + " jobcards escalados");
                }
            }).lean();

        break;

        case 4:
            countNew = await hvac_db.countDocuments({departamento_ref:"611e45e68cd71c1f48cf45bd", status:"new"}, function(err, newjobs){
                if (err) {
                    console.log("Ocorreu um erro ao tentar contar os Callouts New")
                } else {
                    console.log(newjobs + " jobcards novos");
                }
            }).lean();
                    
            countInprogress = await hvac_db.countDocuments({departamento_ref:"611e45e68cd71c1f48cf45bd", status:"In Progress"}, function(err, inprogressjobs){
                if (err) {
                    console.log("Ocorreu um erro ao tentar contar os Callouts In progress");
                } else {
                    console.log(inprogressjobs + " jobcards In progress");
                }
            }).lean();
                            
            countComplete = await hvac_db.countDocuments({departamento_ref:"611e45e68cd71c1f48cf45bd", status:"Complete"}, function(err, completejobs){
                if (err) {
                    console.log("Ocorreu um erro ao tentar contar os Callouts Complete");
                } else {
                    console.log(completejobs + " jobcards Complete");
                }
            }).lean();

            // countEscalated = await jobcards.countDocuments({jobcard_jobtype:"Callout", $and:[{$or:[{ttnumber_status:"New"}, {jobcard_estadoactual:"On hold"}]}, {$or:[{jobcard_siteclassif:"CB"},{jobcard_siteclassif:"BB"},{jobcard_siteclassif:"RN"},{jobcard_siteclassif:"CL"},{jobcard_siteclassif:"DC"}]} ] }, function(err, escalatedjobs){
            //     if (err) {
            //         console.log("Ocorreu um erro ao tentar contar os Callouts Escalados")
            //     } else {
            //         console.log(escalatedjobs + " jobcards escalados");
            //     }
            // }).lean();

        break;

        case 5:
            countNew = await jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New", jobcard_clientenome: "Vm,Sa"}, function(err, newjobs){
                if (err) {
                    console.log("Ocorreu um erro ao tentar contar os Callouts New")
                } else {
                    console.log(newjobs + " jobcards novos");
                }
            }).lean();
                    
            countInprogress = await jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New", jobcard_clientenome: "Vm,Sa"}, function(err, inprogressjobs){
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
            countNew = await hvac_db.countDocuments({departamento_ref:"611e45e68cd71c1f48cf45bd", status:"new"}, function(err, newjobs){
                if (err) {
                    console.log("Ocorreu um erro ao tentar contar os Callouts New")
                } else {
                    console.log(newjobs + " jobcards novos");
                }
            }).lean();
                    
            countInprogress = await hvac_db.countDocuments({departamento_ref:"611e45e68cd71c1f48cf45bd", status:"In Progress"}, function(err, inprogressjobs){
                if (err) {
                    console.log("Ocorreu um erro ao tentar contar os Callouts In progress");
                } else {
                    console.log(inprogressjobs + " jobcards In progress");
                }
            }).lean();
                            
            countComplete = await hvac_db.countDocuments({departamento_ref:"611e45e68cd71c1f48cf45bd", status:"Complete"}, function(err, completejobs){
                if (err) {
                    console.log("Ocorreu um erro ao tentar contar os Callouts Complete");
                } else {
                    console.log(completejobs + " jobcards Complete");
                }
            }).lean();

            // countEscalated = await jobcards.countDocuments({jobcard_jobtype:"Callout", ttnumber_status:"New", $or:[{jobcard_escalationlevel:"1"}, {jobcard_escalationlevel:"2"}], jobcard_departamento:userDept}, function(err, escalatedjobs){
            //     if (err) {
            //         console.log("Ocorreu um erro ao tentar contar os Callouts Escalados")
            //     } else {
            //         console.log(escalatedjobs + " jobcards escalados");
            //     }
            // }).lean();

        break;

    }

    res.render("hvac_options_correc", {DataU:userData, AdMagen:admin_case, Clientes:clinet, Viaturas:viaturd, HvacUsers:hvacUsers, CountNew:countNew, CountInprogress:countInprogress, CountComplete:countComplete, title:"eagleI"})

})


router.get("/preventhvac", async(req, res)=>{
        var userData= await req.session.usuario;
    var admin_case=await admin_db.find({});
    var clinet=await cliente_db.find({});
    var hvacUsers=await users_db.find({}).sort({nome:1});
    var viaturd =await viaturas_db.find({}).sort({matricula:1});
    res.render("hvac_option_prevent", {DataU:userData, AdMagen:admin_case, Clientes:clinet, Viaturas:viaturd, HvacUsers:hvacUsers,title:"eagleI"})

});


router.get("/spareused/:id", async function(req, res){
    var userData= await req.session.usuario;
console.log(req.params.id);
    
    
 	
        users_db.find({}, function(rt, datta){
 			if(rt)
 				console.log("error ocurred on user database")
 			else
 			{ 
 				stock_pessoal_db.find({nome_ref:userData._id}, async function(ty, dattta){
 					if(ty)
 						console.log("error ocurred")
 					else
 					{
 						// console.log(data)
 						var item= await dattta.length>0? dattta[0].disponibilidade : [];
                         var items_bad= await dattta.length>0? dattta[0].disponibilidade_returned : [];
                         console.log("o problema nao esta aqui")
                         console.log(items_bad, item);
 						res.render("hvac_use_spare", {DataU:userData,  Esconder:JSON.stringify(dattta), econtro:req.params.id, Items:item, Items_bad:items_bad,  title:"EagleI" })
 					}
 				}).sort({description_item:1})
 				
 			}

 		})
 		
 	
 


	
})

router.post("/spareusedo", upload.any(), async(req, res)=>{
    var userData=req.session.usuario;
    var actual=[];
    await Promise.all(req.body.referencia.map(async(ob, i)=>{
        actual[i]=await {};
        actual[i].referencia=await req.body.referencia[i];
        actual[i].descricao=await req.body.item_nome[i];
        actual[i].quantidade=await req.body.quantidades[i];
    }))

    await hvac_db.update({_id:req.body.econtro},{$set:{spares_usados:actual}});

    actual.reduce(async(ac,obj, i)=>{
        var decremento_stockk= await parseFloat(obj.quantidade);
        var decremento_stock=await -1*decremento_stockk;
        await stock_pessoal_db.update({nome_ref:userData._id, disponibilidade:{$elemMatch:{referencia:obj.referencia}}}, {$inc:{"disponibilidade.$.disponivel":decremento_stock}})
    }, 0)

})


router.get("/detalhesassinaturahvacjobcard/:idjobcard",  function(req, res){
    var userData= req.session.usuario;
    var referenciajobcard = req.params.idjobcard;
    console.log(referenciajobcard)

    hvac_db.findOne({_id:referenciajobcard}, function(err,dataJobcard){
        if(err){
            console.log("ocorreu um erro ao tentar aceder os dados")
        }else{

            res.render("teste_assinatura", {DataU:userData, Jobcard:dataJobcard,title: 'EAGLEI'});
            
        }
    }).lean();

    
});

router.post("/gravarassinaturahvacjobcard", upload.any(), async function(req, res){
    var userData= req.session.usuario;
    var jobcard = req.body;
    var referenciajobcard = jobcard.jobcard_id;

 console.log(req.body)

    var audit_trailObject =  {};
    audit_trailObject.nome_ref=  userData._id;
    audit_trailObject.nome=  userData.nome;
    audit_trailObject.data=  new Date();
    audit_trailObject.acao=  "Assinatura do Cliente";
     console.log(audit_trailObject);

     hvac_db.updateOne({_id:referenciajobcard}, {$push:{audit_trail: audit_trailObject}, $set:{assinatura:req.body.chegou}}, function(err,data){
        if (err) {
            console.log("Ocorreu algum erro ao actualizar os dados");
        }else{
            console.log("Assinatura gravada com sucesso");
            res.redirect("climatizacao/correctivainprogress");
        }
    } )

});


router.get("/correctivanew", async(req, res)=>{
        var userData= await req.session.usuario;
        
        // Se for o chefe do dept ou Comercial
        var admin_case=await admin_db.find({});
        if(admin_case[0].departamento.findIndex(x=>x.chefe_depart==userData.nome)!=-1 || (userData.funcao == "Commercial")){
            var carregado=await hvac_db.find({status:"new"}).limit(100);
            console.log("cheguei nesse ponyto")
            res.render("hvac_new_correct", {DataU:userData, HvacJobs:carregado ,title:"eagleI"})
        }
        else{
            var carregado=await hvac_db.find({status:"new", $or:[{tecnico_ref:userData._id}, {criado_por:userData.nome}]}).limit(100);
            var carregadoprogress = await hvac_db.find({status:"In Progress", tecnico_ref:userData._id});
            var diiaass= await (new Date()).getDate()<10? ("0"+(new Date()).getDate()) : (new Date()).getDate();
            var messees=await  (new Date()).getMonth()+1<10? ("0"+((new Date()).getMonth()+1)) : ((new Date()).getMonth()+1);


                var controle=await diiaass+"/"+messees+"/"+(new Date()).getFullYear();
                var carregado2=await [];
       await Promise.all( carregado.map(async(este, ii)=>{
        
            if(este.viatura){
               let gyu=await veiiculo_db.find({matricula:este.viatura,  "datta":{ $regex:controle, $options: "i" }})
               console.log(gyu)
               
             if(gyu.length>0)
                carregado2[ii]=await "true"
            else
            carregado2[ii]=await "false"
            }
            else

            carregado2[ii]=await "false"
        }))

       // setTimeout (function(){console.log(carregado2)}, 2000);



            res.render("hvac_new_correct", {DataU:userData, HvacJobs:carregado, carregado2:carregado2 , HvacInprogress:JSON.stringify(carregadoprogress), title:"eagleI"})

        }

    // res.render("hvac_new_correct", {DataU:userData, HvacJobs:carregado ,title:"eagleI"})

});
router.post("/reporteer_Po", upload.any(), async function(req, res){

   var dataUser=req.session.usuario;
   // console.log(req.body)
  
  // relatt.nome_cliente=req.body.nome_cliente;

  
var datta=await hvac_db.findOne({_id:req.body.fitchero})


// fs.convert(datta.assinatura, 'public\\images', 'out')
//     .then(result => {console.log(result);})
//     .catch(err => console.error(err));



if(datta.assinatura)
//   await aguentar(datta.assinatura);
var alvoo=await cliente_hvac_db.findOne({_id:datta.cliente_ref});

var index_alvo=await alvoo.filial.findIndex(x=>x._id==datta.filial_ref);

var alv2=await alvoo.filial[index_alvo];
console.log(alv2);





            var invoice= await datta;
            var nome="PurchaseOrder.pdf";
            var partnumbers=await [];

            // await Promise.all(datta.items.map(async(it, indice)=>{
            // var este=await stock_item_db.findOne({description_item:it.nome_item});
            // if(este.part_number && este.part_number!=null && este.part_number!=undefined)
            //     partnumbers.push(este.part_number);
            // else
            //     partnumbers.push("");
            // })
            // )
            
            var  { createInvoice } = require("./createInvoice_hvac.js");
            
            await createInvoice(invoice, nome, dataUser.nome, alv2);
            sleep(3000);

      // res.header("Content-Type","application/pdf")
    //   emailSender.createConnection();
    // emailSender.testAttachment();
            
            
            // *********************malabarismo***********************
            var pd=path.join(__dirname, 'invoice.pdf')
            var buscar="./"+nome;
            setTimeout(function(){
            res.download(buscar);}, 2000);

})

const sleep = ms =>{
    return new Promise(resolve => setTimeout(resolve, ms))
}


const aguentar=async (invoicee)=>{
       var base64Data =  await invoicee.replace(/^data:image\/png;base64,/, "");

     await fs.writeFile(".\\out2.png", base64Data, 'base64', function(err) {
      console.log(err);

});
     return ;

}


router.get("/correctivainprogress", async(req, res)=>{
        var userData= await req.session.usuario;
        
        var admin_case=await admin_db.find({});
        if(admin_case[0].departamento.findIndex(x=>x.chefe_depart==userData.nome)!=-1 || (userData.funcao == "Commercial")){
            var carregado=await hvac_db.find({status:"In Progress"}).limit(100);
            res.render("hvac_new_correct", {DataU:userData, HvacJobs:carregado ,title:"eagleI"})
        }
        else{
            var carregado=await hvac_db.find({status:"In Progress", $or:[{tecnico_ref:userData._id}, {criado_por:userData.nome}]}).limit(100);
            let diiaass= await (new Date()).getDate()<10? ("0"+(new Date()).getDate()) : (new Date()).getDate();
                let messees=await  (new Date()).getMonth()+1<10? ("0"+((new Date()).getMonth()+1)) : ((new Date()).getMonth()+1);


                var controle=await diiaass+"/"+messees+"/"+(new Date()).getFullYear();
                var carregado2=await [];
       await Promise.all( carregado.map(async(este, ii)=>{
        
            if(este.viatura){
               let gyu=await veiiculo_db.find({matricula:este.viatura,  "datta":{ $regex:controle, $options: "i" }})
               console.log(gyu)
               
             if(gyu.length>0)
                carregado2[ii]=await "true"
            else
                 carregado2[ii]=await "false"
            }
            else

             carregado2[ii]=await "false"
        }))

       // setTimeout (function(){console.log(carregado2)}, 2000);



            res.render("hvac_new_correct", {DataU:userData, HvacJobs:carregado, carregado2:carregado2 ,title:"eagleI"})

        }

    // res.render("hvac_new_correct", {DataU:userData, HvacJobs:carregado ,title:"eagleI"})

});

// router.post("/hvaccorrtsve", upload.any(), async(req, res)=>{
//         var userData= await req.session.usuario;
//         console.log(req.body)
//         var obbj= await req.body;
//         var encontrar_= await cliente_hvac_db.findOne({_id:obbj.cliente_ref})
//         var indx=await encontrar_.filial.findIndex(x=>x._id==obbj.filial_ref)
//         obbj.geolocalizacao=await [];
//         obbj.geolocalizacao[0]=await {};
//         obbj.geolocalizacao[0].latitude=await encontrar_.filial[indx].lat;
//         obbj.geolocalizacao[0].longitude=await encontrar_.filial[indx].long;
//         obbj.audit_trail=await [];
//         obbj.audit_trail[0]=await {};
//         obbj.audit_trail[0].nome_ref= await userData._id;
//         obbj.audit_trail[0].nome= await userData.nome;
//         obbj.audit_trail[0].data=await new Date();
//         obbj.audit_trail[0].acao=await "Criou Tarefa";
//         obbj.status=await "new";
//         obbj.criado_por=await userData.nome;
//         obbj.assistentes=await [];

//          if(req.body.assistente){
//             if(Array.isArray(req.body.assistente)){
//               await Promise.all(  req.body.assistente.map(async (estt, i)=>{
//                     obbj.assistentes[i]=await {};
//                     obbj.assistentes[i].nome=await req.body.assistente[i];
//                     obbj.assistentes[i].referencia=await req.body.referencia[i]


//                 }) )
//             }else

//            await Promise.all( [125].map(async (estt, i)=>{
//                     obbj.assistentes[i]=await {};
//                     obbj.assistentes[i].nome=await req.body.assistente;
//                     obbj.assistentes[i].referencia=await req.body.referencia;


//                 })
//            )
//         }
//         hvac_db.gravar_hvac(obbj, function(err){
//             if(err)
//                 console.log("erro ao tenatr gravar")
//             else
//                 console.log("hvac gravado com sucesso!")
//         });

//         res.json({feito:"done"})

   

// })

router.post("/hvaccorrtsve", upload.any(), async(req, res)=>{
        var userData= await req.session.usuario;
        console.log(req.body)
        var obbj= await req.body;
        var encontrar_= await cliente_hvac_db.findOne({_id:obbj.cliente_ref})
        var indx=await encontrar_.filial.findIndex(x=>x._id==obbj.filial_ref)
        var cont5 = req.body.jobcard_jobtype;
        var posicaodados, cont, cont1, cont2, cont3, cont4, cont6, cont7, cont8, cont9;
        var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
        var year = ((new Date()).getFullYear() + "").split("");
        var ano = year[2] + year[3];
        console.log("************************************************");
        console.log(ano);
        console.log("************************************************");
        var now = Date.now();
        console.log("Agora",now);
        cont6 = "CCC/" + mes + "/" + ano;

        var procura = await hvac_db.find({}, {jobcard_cod:1}, function(err, data){
            if(err){
                console.log(err);
            }else{
                console.log("Find Jobcard");
            }
        }).sort({_id:1}).lean();

        obbj.geolocalizacao=await [];
        obbj.geolocalizacao[0]=await {};
        obbj.geolocalizacao[0].latitude=await encontrar_.filial[indx].lat;
        obbj.geolocalizacao[0].longitude=await encontrar_.filial[indx].long;
        obbj.audit_trail=await [];
        obbj.audit_trail[0]=await {};
        obbj.audit_trail[0].nome_ref= await userData._id;
        obbj.audit_trail[0].nome= await userData.nome;
        obbj.audit_trail[0].data=await new Date();
        obbj.audit_trail[0].acao=await "Criou Tarefa";
        obbj.status=await "new";
        obbj.criado_por=await userData.nome;
        obbj.assistentes=await [];

         if(req.body.assistente){
            if(Array.isArray(req.body.assistente)){
              await Promise.all(  req.body.assistente.map(async (estt, i)=>{
                    obbj.assistentes[i]=await {};
                    obbj.assistentes[i].nome=await req.body.assistente[i];
                    obbj.assistentes[i].referencia=await req.body.referencia[i]


                }) )
            }else

           await Promise.all( [125].map(async (estt, i)=>{
                    obbj.assistentes[i]=await {};
                    obbj.assistentes[i].nome=await req.body.assistente;
                    obbj.assistentes[i].referencia=await req.body.referencia;


                })
           )
        }

        if(procura.length == 0){

            cont2 = cont6 + "/0001";
            cont1 = 1;
    
            obbj.jobcard_cod = cont2;
    
            hvac_db.gravar_hvac(obbj, function(err, data){
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
    
                        obbj.jobcard_cod = cont4;
                        hvac_db.gravar_hvac(obbj, function(err, data){
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
    
            obbj.jobcard_cod = cont2;
    
            hvac_db.gravar_hvac(obbj, function(err, data){
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
                        hvac_db.gravar_hvac(obbj, function(err, data){
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
        
        // hvac_db.gravar_hvac(obbj, function(err){
        //     if(err)
        //         console.log("erro ao tenatr gravar")
        //     else
        //         console.log("hvac gravado com sucesso!")
        // });

        // res.json({feito:"done"})

   

})



router.get("/detalhesPhotoModahvac/:id",  function(req, res){
    var userData= req.session.usuario;
    console.log("yesssssss");
    console.log(req.params.id);
    hvac_db.find({_id:req.params.id}, {photoinfo:1, cliente:1}, function(err, data){
        if(err){
            console.log("ocorreu um erro ao tentar aceder os dados")
        }
        else{
            console.log(data);
            res.render("hvac_photodetails", {DataU:userData, Jobcards:data, title:'EAGLEI'});
        }
    }).lean();

});

router.post("/updatephotoinfoHvacInfo/:id",  upload.any(), async function(req, res){
    var userData= req.session.usuario;
    var id = req.params.id;
    var photoinfo = [];
    console.log(req.files);
    
    var directorio = "/Hvac/";

    if (req.files) {

        let comprimento = req.files.length;

        for (let i = 0; i < comprimento; i++) {
            photoinfo.push((directorio + req.files[i].filename));
        }

    }

    var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
    var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
    var ano = (new Date()).getFullYear();
    var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

    // var procurajobcard = await jobcards.findOne({_id:id}, {jobcard_audittrail:1}, function(err, data){
    //     if(err){
    //         console.log("ocorreu um erro ao tentar aceder os dados")
    //     }
    //     else{
    //         console.log("Find jobcard");
    //     }
    // }).lean();


    // var arrAudit = procurajobcard.jobcard_audittrail;
    // var lastaudittrail = arrAudit[arrAudit.length-1];

    // if((lastaudittrail.jobcard_audittrailname == userData.nome) && (lastaudittrail.jobcard_audittrailaction == "Update Jobcard")){

    // arrAudit[arrAudit.length-1].jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;

    // }else{

    //   var jobcard_audittrailObject = {};
    //   // jobcard_audittrailObject._id = "";
    //   jobcard_audittrailObject.jobcard_audittrailname = userData.nome;
    //   jobcard_audittrailObject.jobcard_audittrailaction = "Update Jobcard";
    //   jobcard_audittrailObject.jobcard_audittraildate = dia + "/" + mes + "/" + ano + "  " + todayhours;
    //   arrAudit.push(jobcard_audittrailObject);
    // }

    // var jobcard_audittrail = arrAudit;

    await hvac_db.updateOne({_id:id}, {$push:{photoinfo}});

    hvac_db.updateOne({_id:id},{$set:{data_ultimaactualizacaojobcard:new Date()}}, function(err, data){
        if(err){
            console.log("ocorreu um erro ao tentar aceder os dados")
        }
        else{
            console.log("Photo Info done")
            res.redirect("/inicio");
        }
    });

});

router.post("/guardardadosAir/:id", upload.any() ,async function(req, res) {
    var userData = req.session.usuario;
    let busca = req.params.id;
    var jobcard=req.body;
    
        var dia = ((new Date()).getDate()<10) ? ("0" + (new Date()).getDate()): ((new Date()).getDate());
        var mes = (((new Date()).getMonth()+1)<10) ? ("0" + ((new Date()).getMonth()+1)): (((new Date()).getMonth())+1);
        var ano = (new Date()).getFullYear();
        var todayhours = new Date().getHours() + ":" + new Date().getMinutes();

        
        var procurajobcard = await hvac_db.findOne({_id:busca}, {jobcard_audittrail:1}, function(err, data){
            if(err){
                console.log("ocorreu um erro ao tentar aceder os dados")
            }
            else{
                console.log("Find jobcard");
            }
        }).lean();

        hvac_db.updateOne({_id:busca}, {$push:{ airconds: jobcard}, $set:{data_ultimaactualizacaojobcard:new Date() }}, function(err, data){
            if(err){
                console.log("ocorreu um erro ao tentar aceder os dados")
            }
            else{
                console.log("Cleaning info done")
                res.redirect("/inicio");
            }
        });
});


router.get("/detalhesEquipmentRepairs/:idjobcard",  function(req, res){
    var userData= req.session.usuario;
    var referencia = req.params.idjobcard;

        res.render("escolherManutencaoPeriodicaClmatizacao", {DataU:userData, Projects:referencia,title: 'EAGLEI'});

});

router.get("/detalhesclima/:idjobcard",  function(req, res){
    var userData= req.session.usuario;
    var referencia = req.params.idjobcard;

        res.render("detalhesrepairclimatizacao", {DataU:userData, Projects:referencia,title: 'EAGLEI'});

});
router.get("/airconRepairs/:idjobcard",  function(req, res){
    var userData= req.session.usuario;
    var referencia = req.params.idjobcard;

        res.render("airconmanentancerepairs", {DataU:userData, Projects:referencia,title: 'EAGLEI'});
});


router.post("/clientefiliare", upload.any(), async(req, res)=>{
        var userData= await req.session.usuario;
        console.log(req.body)
        var elemento=await req.body;
        var busca=await req.body.nome_cliente+","+req.body.nome+", "+req.body.provincia+", "+req.body.rua+", "+req.body.bairro+", Mocambique ";
        
        const thhh = await geocoder.geocode(busca);
        console.log(thhh[0].latitude, thhh[0].longitude)
        elemento.criado_por=await userData.nome;
        elemento.data_criacao=await ((new Date()).getDate()<10? '0'+(new Date()).getDate():(new Date()).getDate())+'/'+(((new Date()).getMonth()+1)<10? ('0'+((new Date()).getMonth()+1)):((new Date()).getMonth()+1))+'/'+((new Date()).getFullYear())+'   '+((new Date()).getHours()<10? ('0'+(new Date()).getHours()): (new Date()).getHours() )+' : '+((new Date()).getMinutes()<10? ('0'+(new Date()).getMinutes()):(new Date()).getMinutes());
        elemento.lat=await thhh[0].latitude;
        elemento.long=await thhh[0].longitude;

        await cliente_hvac_db.updateOne({_id:req.body.nreffgty},{$push:{filial:elemento}})
        res.json({feito:"feito"})
   

})


router.post("/cliente_hvac_re", upload.any(), async(req, res)=>{
        var userData= await req.session.usuario;
        var cliente=await req.body;
        cliente.criado_por=await userData.nome;
        cliente.contacto=await {};
        cliente.contacto.telemovel=await req.body.telemovel;
        cliente.contacto.telefone=await req.body.telefone;
        cliente.contacto.email=await req.body.email;
        
        console.log(req.body)

// *****************************************************************************************************************************************************************************
         var busca=await req.body.nome_cliente+", "+req.body.numero+", "+req.body.provincia+", "+req.body.rua+", "+req.body.bairro+", Mocambique ";
        
        var thhh = await geocoder.geocode(busca);
            cliente.filial =await [];
            cliente.filial[0]=await {};
            cliente.filial[0].nome=await req.body.nome_cliente;
            cliente.filial[0].rua=await req.body.rua;
            cliente.filial[0].regiao=await req.body.regiao;
            cliente.filial[0].regiao_ref=await req.body.regiao_ref;
            cliente.filial[0].provincia_ref=await req.body.provincia_ref;
            cliente.filial[0].provincia=await req.body.provincia;
            cliente.filial[0].numero=await req.body.numero_cliente;
            cliente.filial[0].bairro=await req.body.bairro;
            cliente.filial[0].criado_por=await userData.nome;
            cliente.filial[0].email=await req.body.email;
            cliente.filial[0].contacto=await req.body.telemovel;
            cliente.filial[0].data_criacao=await ((new Date()).getDate()<10? '0'+(new Date()).getDate():(new Date()).getDate())+'/'+(((new Date()).getMonth()+1)<10? ('0'+((new Date()).getMonth()+1)):((new Date()).getMonth()+1))+'/'+((new Date()).getFullYear())+'   '+((new Date()).getHours()<10? ('0'+(new Date()).getHours()): (new Date()).getHours() )+' : '+((new Date()).getMinutes()<10? ('0'+(new Date()).getMinutes()):(new Date()).getMinutes());
            cliente.filial[0].lat=await thhh[0].latitude;
            cliente.filial[0].long=await thhh[0].longitude;
//  ***************************************************************************************************************************************************************************
        await cliente_hvac_db.gravar_cliente(cliente, function(err){
            if(err)
                console.log("ocorreu um erro ao tenatr registar cliente_hvac")
            else
               { console.log("cliente registado com sucesso@!")
                res.json({feito:"feito"})
       }
        });

        
   

})


router.post("/aprovarjo/:id",  upload.any(), async(req, res)=>{
        var userData= await req.session.usuario;

        var ob=await {};
        ob.nome_ref= await userData._id;
        ob.nome= await userData.nome;
        ob.data=await new Date();
        ob.acao=await "Aceitou a Tarefa";
        var obj1={};
        obj1.nome_ref= await userData._id;
        obj1.nome= await userData.nome;
        obj1.data=await new Date();
        var tgsh=await {};
        var controlador = await [1,1];
        tgsh.latitude=await req.body.geolocationlatitude;
        tgsh.longitude=await req.body.geolocationlongitude;
        obj1.acao=await "A previsao desta viagem e de "+req.body.Distancia+", que sera efetuada em "+req.body.duracao_viagem;

         await hvac_db.updateOne({_id:req.params.id},{status:"In Progress", controlador, $push:{audit_trail:ob}, $set:{origem:tgsh, controlador}});
        await hvac_db.updateOne({_id:req.params.id},{status:"In Progress", $push:{audit_trail:obj1}});

        res.json({feito:"done"})
        

})



router.get("/aprovarjo/:id",  async(req, res)=>{
        var userData= await req.session.usuario;
        console.log(req.params.id);
        var ob=await {};
        ob.nome_ref= await userData._id;
        ob.nome= await userData.nome;
        ob.data=await new Date();
        ob.acao=await "Aceitou a Tarefa";
        if(req.params.id.length==24){
            var findoco=await hvac_db.find({_id:req.params.id});
            if(findoco.length>0){
                await hvac_db.updateOne({_id:req.params.id},{status:"In Progress", estadoactual:"On Route", $push:{audit_trail:ob}});
                 res.render("visaomapa",{DataU:userData,Jobcards:findoco, DadosJobcards:JSON.stringify(findoco), title:"eagleI"})

            }
            else
            res.render("visaomapa",{DataU:userData,Jobcards:findoco, DadosJobcards:JSON.stringify(findoco), title:"eagleI"})
        }
        else
            res.redirect("/climatizacao/correctivanew")

})



router.post("/updatechegadasitehvac",  upload.any(), async function(req, res){
    var userData= req.session.usuario;
    var jobcard = req.body;
    var ob=await {};
        ob.nome_ref= await userData._id;
        ob.nome= await userData.nome;
        ob.data=await new Date();
        ob.acao=await "Tecnico Chegou ao Local";

    console.log("*****************************************************************", jobcard)

    hvac_db.updateOne({_id:jobcard.jobcard_id},{$set:{data_ultimaactualizacaojobcard:new Date(),estadoactual:"On Site", sitearrivaldate:new Date()}, $push:{audit_trail:ob}}, function(err, data){
        if(err){
            console.log("ocorreu um erro ao tentar aceder os dados")
        }
        else{
            console.log("Technician arrived on site")
            res.redirect("/inicio");
        }
    });

});

router.get("/submiteClima/:id", async function(req, res){
    var userData = req.session.usuario;
    var id = req.params.id;
    console.log(id);
    res.render("submiteJobClimatizacao", {DataU:userData, ID:id ,title:"eagleI"});
    
});


router.post("/sendforapprovalhvac",  upload.any(), async function(req, res){
    var userData= req.session.usuario;
    var jobcard = req.body;
    var ob=await {};
        ob.nome_ref= await userData._id;
        ob.nome= await userData.nome;
        ob.data=await new Date();
        ob.acao=await "Enviado para aprovação";
        var controlador = await [1,1,1];

    console.log("*****************************************************************", jobcard)
    var report=await {};
        report.coment= await jobcard.jobcard_remedialaction;
        report.Qual= await jobcard.jobcard_hsreason;
        report.Problemas= await jobcard.jobcard_healthsafety;

        var remedialaction = await jobcard.jobcard_remedialaction;
        var healthsafety = await jobcard.jobcard_healthsafety;
        var hsreason = await jobcard.jobcard_hsreason;


    hvac_db.updateOne({_id:jobcard.jobcardhvacid},{$set:{data_ultimaactualizacaojobcard:ob.data, estadoactual:"Awaiting approval",remedialaction, healthsafety, hsreason, sitearrivaldate:new Date(), controlador}, $push:{audit_trail:ob, reportetrabalho:report}}, function(err, data){
        if(err){
            console.log("ocorreu um erro ao tentar aceder os dados")
        }
        else{
            console.log("Sent for approval")
            res.redirect("/inicio");
        }
    });
});


router.post("/approvecallouthvac",  upload.any(), async function(req, res){
    var userData= req.session.usuario;
    var jobcard = req.body;
    var ob=await {};
        ob.nome_ref= await userData._id;
        ob.nome= await userData.nome;
        ob.data=await new Date();
        ob.acao=await "Tarefa Aprovada";
        var controlador = await [1,1,1,1];

    console.log("*****************************************************************", jobcard)

    hvac_db.updateOne({_id:jobcard.jobcardhvacid},{$set:{data_ultimaactualizacaojobcard:ob.data, estadoactual:"Approved", sitearrivaldate:new Date(), controlador}, $push:{audit_trail:ob}}, function(err, data){
        if(err){
            console.log("ocorreu um erro ao tentar aceder os dados")
        }
        else{
            console.log("Jobcard Approved")
            res.redirect("/inicio");
        }
    });

});


router.post("/leavesitecallouthvac",  upload.any(), async function(req, res){
    var userData= req.session.usuario;
    var jobcard = req.body;
    var ob=await {};
        ob.nome_ref= await userData._id;
        ob.nome= await userData.nome;
        ob.data=await new Date();
        ob.acao=await "Saída do local";
        var controlador = await [1,1,1,1,1];

    console.log("*****************************************************************", jobcard)

    hvac_db.updateOne({_id:jobcard.jobcardhvacid},{$set:{data_ultimaactualizacaojobcard:ob.data, status:"Complete", sitearrivaldate:new Date(), controlador}, $push:{audit_trail:ob}}, function(err, data){
        if(err){
            console.log("ocorreu um erro ao tentar aceder os dados")
        }
        else{
            console.log("Jobcard Approved")
            res.redirect("/inicio");
        }
    });

});


router.get("/correctivacomplete", async(req, res)=>{
    var userData= await req.session.usuario;

    if (userData.funcao == "Tecnico" || userData.funcao == "Assistant" || userData.funcao == "Assistente") {
        controladorfuncao = 1;
    }else if(userData.funcao == "regional_manager"){
        controladorfuncao = 2;
    }else if (userData.verificador_funcao == "Regional Manager") {
        controladorfuncao = 3;
    }else if((userData.funcao == "Call Center") || (userData.funcao == "Back Office") || (userData.nivel_acesso == "admin") || (userData.funcao == "IT Officer") || (userData.funcao == "Commercial") || ((userData.funcao == "Manager") && (userData.departamento == "Climatização e Electricidade")) || (userData.nome == "Rogerio Galrito") ){
        controladorfuncao = 4;
    }else if(userData.nome == "Guest"){
        controladorfuncao = 5;
    }else if (userData.funcao == "Manager" && (userData.funcao == "Climatização e Electricidade")) {
        controladorfuncao = 6;
    }
    
    var admin_case=await admin_db.find({});
    if(admin_case[0].departamento.findIndex(x=>x.chefe_depart==userData.nome)!=-1 || (userData.funcao == "Commercial")){
        var carregado=await hvac_db.find({status:"Complete"}).limit(100);
        res.render("hvac_complete_correct", {DataU:userData, count: controladorfuncao, HvacJobs:carregado ,title:"eagleI"})
    }
    else{
        var carregado=await hvac_db.find({status:"Complete", $or:[{tecnico_ref:userData._id}, {criado_por:userData.nome}]}).limit(100);
        let diiaass= await (new Date()).getDate()<10? ("0"+(new Date()).getDate()) : (new Date()).getDate();
            let messees=await  (new Date()).getMonth()+1<10? ("0"+((new Date()).getMonth()+1)) : ((new Date()).getMonth()+1);


        var controle=await diiaass+"/"+messees+"/"+(new Date()).getFullYear();
        var carregado2=await [];
        await Promise.all( carregado.map(async(este, ii)=>{
            if(este.viatura){
            let gyu=await veiiculo_db.find({matricula:este.viatura,  "datta":{ $regex:controle, $options: "i" }})
            console.log(gyu)
            
            if(gyu.length>0)
                carregado2[ii]=await "true"
            else
                carregado2[ii]=await "false"
            }
            else

            carregado2[ii]=await "false"
        }));

        res.render("hvac_complete_correct", {DataU:userData, count: controladorfuncao, HvacJobs:carregado, carregado2:carregado2 ,title:"eagleI"})

    }
});


router.get("/detalhes/:id",  async(req, res)=>{
        var userData= await req.session.usuario;
       console.log("ja cheguei")

        var admin_case=await admin_db.find({});
        // var clinet=await cliente_db.find({});
        // var hvacUsers=await users_db.find({}).sort({nome:1});
        // var viaturd =await viaturas_db.find({}).sort({matricula:1});


    // ************************************************************************************************************
    var clinet=await cliente_hvac_db.find({});
    var hvacUsers=await users_db.find({departamento_id:userData.departamento_id}).sort({nome:1});
    var viaturd =await users_db.find({departamento_id:userData.departamento_id, matricula:{$ne:"SEM VEICULO"}}).sort({matricula:1});
    if(req.params.id.length==24){
        var encontr=await hvac_db.find({_id:req.params.id})
    res.render("call_out_detalhes", {DataU:userData, AdMagen:admin_case, Clientes:clinet, Carregado:encontr, Viaturas:viaturd, HvacUsers:hvacUsers, title:"eagleI"})
    // *************************************************************************************************************
    }

       // if(req.params.id.length==24){
       //  var encontr=await hvac_db.find({_id:req.params.id})

       //  res.render("call_out_detalhes", {DataU:userData, AdMagen:admin_case, Clientes:clinet, Carregado:encontr,  Viaturas:viaturd, HvacUsers:hvacUsers,title:"eagleI"})
       // }
        
        

   

})



router.get("/detalhesDevolverJobcardhvac/:id",  function(req, res){
    var userData= req.session.usuario;

    hvac_db.find({_id:req.params.id}, {tecnico:1, cliente:1}, function(err, data){
        if(err){
            console.log("ocorreu um erro ao tentar aceder os dados")
        }
        else{
            res.render("hvac_detalhesDevolverJobcard", {DataU:userData, Jobcards:data, title: 'EAGLEI'});
        }
    }).lean();

});


router.post("/sendbackjobcardhvac",  upload.any(), async function(req, res){
    var userData= req.session.usuario;
    var jobcard = req.body;
    var jobcard_estadoactual = "On site";
    console.log(userData.funcao);
    console.log(jobcard);

    var razaoreprovar = jobcard.jobcardhvac_razaoreprovar;
    var controlador = await [1,1]; 

    var procura = await hvac_db.findOne({_id:jobcard.jobcard_id}, {tecnicoid:1, cliente:1, cliente_ref:1, jobcard_cod:1, filial:1, criado_por:1}, function(err, data){
        if(err){
            console.log(err);
           }else{
            console.log("Find Jobcard");
        }
    }).lean();

var procurauser = await model.findOne({_id:procura.tecnicoid}, {idioma:1, email:1}, function(err,dataUser){
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
  jobcard_audittrail.nome_ref = await userData._id;
  jobcard_audittrail.nome = await userData.nome;
  jobcard_audittrail.data = await new Date();
  jobcard_audittrail.acao = await `Enviado de volta` 


  if(procura.cliente_ref != ""){

      var procurasiteinfo = await cliente_db.findOne({_id:procura.cliente_ref}, {nome_cliente:1, provincia:1, filial:1}, function(err,dataUser){
        if(err){
            console.log("ocorreu um erro ao tentar aceder os dados")
        }else{
            console.log("Find Site")
        }
    }).lean();
  }else{

      var procurasiteinfo = {};

      procurasiteinfo.nome_cliente = "";
  }

        
        hvac_db.findOneAndUpdate({_id:jobcard.jobcard_id}, {$push:{audit_trail:jobcard_audittrail}, $set:{data_ultimaactualizacaojobcard:new Date(), status: "In Progress", estadoactual:jobcard_estadoactual, razaoreprovar:razaoreprovar}}, function(err, data){
            if(err){
                console.log("ocorreu um erro ao tentar aceder os dados")
            }
            else{
                console.log("Sent Back")
                res.redirect("/inicio");
            }
        });
    

});


router.get("/editash/:id",  async(req, res)=>{
        var userData= await req.session.usuario;
       console.log("ja cheguei")

    var admin_case=await admin_db.find({});

    // var clinet=await cliente_db.find({});
    // var hvacUsers=await users_db.find({}).sort({nome:1});
    // var viaturd =await viaturas_db.find({}).sort({matricula:1});

    var clinet=await cliente_hvac_db.find({});
    var hvacUsers=await users_db.find({departamento_id:userData.departamento_id}).sort({nome:1});
    var viaturd =await users_db.find({departamento_id:userData.departamento_id, matricula:{$ne:"SEM VEICULO"}}).sort({matricula:1});
    

       if(req.params.id.length==24){
        var encontr=await hvac_db.find({_id:req.params.id})

        res.render("call_out_edit", {DataU:userData, AdMagen:admin_case, Clientes:clinet, Carregado:encontr, Clientes1:JSON.stringify(clinet), Viaturas:viaturd, HvacUsers:hvacUsers,title:"eagleI"})
       }
        
        

   

})

router.post("/editarhvac/:id",  upload.any(), async(req, res)=>{
        var userData= await req.session.usuario;
       console.log("ja cheguei");
       var thydsyu=await req.body;
       console.log(req.body)

       // ******************************************

        console.log(req.body)
        var obbj= await req.body;
        var encontrar_= await cliente_hvac_db.findOne({_id:obbj.cliente_ref})
        var indx=await encontrar_.filial.findIndex(x=>x._id==obbj.filial_ref)
        obbj.geolocalizacao=await [];
        obbj.geolocalizacao[0]=await {};
        obbj.geolocalizacao[0].latitude=await encontrar_.filial[indx].lat;
        obbj.geolocalizacao[0].longitude=await encontrar_.filial[indx].long;
        obbj.audit_trail=await [];
        obbj.audit_trail[0]=await {};
        obbj.audit_trail[0].nome_ref= await userData._id;
        obbj.audit_trail[0].nome= await userData.nome;
        obbj.audit_trail[0].data=await new Date();
        obbj.audit_trail[0].acao=await "Editou Tarefa";
        obbj.status=await "new";
        obbj.criado_por=await userData.nome;
        obbj.assistentes=await [];


       // *****************************************

       // var obbj= await req.body;
       //  var encontrar_= await cliente_hvac_db.findOne({_id:obbj.cliente_ref})
       //  var indx=await encontrar_.filial.findIndex(x=>x._id==obbj.filial_ref)
       //  // obbj.latitude=await encontrar_.filial[indx].lat;
       //  // obbj.longitude=await encontrar_.filial[indx].long;
       //  obbj.criado_por=await userData.nome;


       //  obbj.geolocalizacao=await [];
       //  obbj.geolocalizacao[0]=await {};
       //  obbj.geolocalizacao[0].latitude=await encontrar_.filial[indx].lat;
       //  obbj.geolocalizacao[0].longitude=await encontrar_.filial[indx].long;
        
       //  var ob=await {};
       //  ob.nome_ref= await userData._id;
       //  ob.nome= await userData.nome;
       //  ob.data=await new Date();
       //  ob.acao=await "Editou Tarefa";
       // *****************************************


       if(req.body.assistente){
            if(Array.isArray(req.body.assistente)){
              await Promise.all(req.body.assistente.map(async (estt, i)=>{
                    obbj.assistentes[i]=await {};
                    obbj.assistentes[i].nome=await req.body.assistente[i];
                    obbj.assistentes[i].referencia=await req.body.referencia[i]


                }) )
            }else

           await Promise.all( [125].map(async (estt, i)=>{
                    obbj.assistentes[i]=await {};
                    obbj.assistentes[i].nome=await req.body.assistente;
                    obbj.assistentes[i].referencia=await req.body.referencia;


                })
           )
        }
    
       var editt= await hvac_db.updateOne({_id:req.params.id},obbj);
       // await hvac_db.updateOne({_id:req.params.id},{$push:{audit_trail:ob}});
        res.json({feito:"feito"})
       
        
        

   

})







module.exports=router;