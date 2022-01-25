var mongoose =require("mongoose");
var hvacSchema=new mongoose.Schema({
	regiao:String,
	jobcard_cod:String,
	regiao_ref:String,
	departamento:String,
	departamento_ref:String,
	tecnico:String,
	tecnico_ref:String,
	cliente:String,
	cliente_ref:String,
	local:String,
	provincia:String,
	provincia_ref:String,
	tipo_trabalho:String,
	tecnico:String,
	tecnico_ref:String,
	razao:String,
	prioridade:String,
	filial:String,
	filial_ref:String,
	geolocalizacao:[{
	latitude:String,
	longitude:String}],
	data_criacao:{
		type:Date,
		"default":Date.now
	},
	data_ultimaactualizacaojobcard:{
		type:Date,
		"default":Date.now
	},
	criado_por:String,
	prioridade:String,
	data_inicio:String,
	data_finalizacao:String,
	viatura:String,
	status:String,
	assistentes:[{nome:String, referencia:String}],
	razaoreprovar:String,
	photoinfo:[String],
	controlador:[Number],


	audit_trail:[{
		nome_ref:String,
		nome:String,
		data:Date,
		acao:String
	}],
	

	travel_info:[{
		distancia_prevista:String,
		duracao_viagem:String,

	}],
	origem:{latitude:String,
	longitude:String},

	//Campos Padrão
    data_registojobcardms:Number,
    datareporte:String,
	horareporte:String,
    restorationhrs:Number,
    workstatus:String,
	remedialaction:String,
	healthsafety:String,
	hsreason:String,
    tecarrivaldate:String,
	tecarrivaltime:String,
	sitearrivaldate:String,//maintenancedate
	sitearrivaltime:String,
	tecarrivalduration:String,
	sitedeparturedate:String,
	sitedeparturetime:String,
	arrivaldepartureduration:String,
	traveldistance:String,
	travelduration:String,
	traveldurationms:Number,
	estimadadatachegadams:Number,
	estimadadatachegada:String,
	estimahorachegada:String,


	// Futuros campos
	trabalho_feito:[String],
	responsedays:Number,
    wait:String,
	estadoactual:String,
    ttnumber:Number,
    assinatura:String,

	auditoria:[{
		nome:String,
		ref:String,
		data:Date,
		acao:String
	}],

	spares_usados:[{
		descricao:String,
		quantidade:String,
		referencia:String
	}],
	
	genarator:[{
		jobcard_filtroAr:String,
		jobcard_filtroOleo:String,
		jobcard_filtrodiesel:String,
		jobcard_element:String,
		jobcard_oleo:String,
		jobcard_nivelOleo:String,
		jobcard_nivelCoolant:String,
		jobcard_nivelBaterias:String,
		jobcard_limpezaGerador:String,
		jobcard_lubrificacao:String,
		jobcard_fugas:String,
		jobcard_nivelDiesel:String,
		jobcard_ruidos:String,
		jobcard_funcionamento:String,}],

	airconds:[{
		jobcard_limpezaFiltroAr:String,
		jobcard_limpezaExternaCondensador:String,
		jobcard_limpezaExternaEvaporador:String,
		jobcard_limpezaPermutadorEvaporador:String,
		jobcard_limpezaPermutadorCondensador:String,
		jobcard_funcionamentoMotoDeflectores:String,
		jobcard_drenagemLimpezaTabuleiroCondesandores:String,
		jobcard_fugasFrigorifico:String,
		jobcard_reapertos:String,
		jobcard_estadoIsolamento:String,
		jobcard_ruidosVibracoes:String,
		jobcard_estadoFiltros:String,
		jobcard_ventladores:String,
		jobcard_acessoAr:String,}],

		reportetrabalho:[{
			coment:String,
			Problemas:String,
			Qual:String,
		}]






})

hvacSchema.statics.gravar_hvac=function(armaz, callback){
	this.create(armaz, callback)
}


module.exports=mongoose.model("Climatizacao", hvacSchema, "Climatizacao");