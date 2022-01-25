var mongoose=require("mongoose");
var siteinfoSchema=new mongoose.Schema({
	siteinfo_cod:{type:String, unique:true},
	siteinfo_warzone:String,
	siteinfo_client:String,
	siteinfo_clientid:String,
	siteinfo_sitename:String,
	siteinfo_sitenum:Number,
	siteinfo_typesite:String,
	siteinfo_phasenum:String,
	siteinfo_siteclassif:String,
	siteinfo_radiotec:String,
	siteinfo_maintoff:String,
	siteinfo_maintoffid:String,
	siteinfo_techcontactnum:String,
	siteinfo_regiao:String,
	siteinfo_area:String,
	siteinfo_regiaoselmec:String,
	siteinfo_gps:[{siteinfo_gpslatitude:String, siteinfo_gpslongitude:String}],
	siteinfo_planmaintdate:String,
	siteinfo_siteonairdate:String,
	siteinfo_siteannoucdate:String,
	siteinfo_twinbts:String,
	siteinfo_btslinkedsite:String,
	siteinfo_generator:String,
	siteinfo_gsmcab:String,
	siteinfo_internaldb:String,
	siteinfo_externaldb:String,
	siteinfo_additionaltransformer:String,
	siteinfo_additionaltransformerArray:[{siteinfo_additionaltransformersType:String,siteinfo_additionaltransformersSerialNo:String,siteinfo_additionaltransformersManufacturedDate:String,siteinfo_additionaltransformersCable:String,siteinfo_additionaltransformersCableLength:String,siteinfo_additionaltransformersdataFrequency:String,siteinfo_additionaltransformersdataRating:String,siteinfo_additionaltransformersdataPrimaryVoltage:String,siteinfo_additionaltransformersdataPrimaryAmpere:String,siteinfo_additionaltransformersdataSecondaryVoltage:String,siteinfo_additionaltransformersdataSecondaryAmpere:String,siteinfo_additionaltransformersdataImpendance:String,siteinfo_additionaltransformersdataSymbol:String,siteinfo_additionaltransformersdataOtherInfo:String}],
	siteinfo_gsmcabArray:[{siteinfo_gsmEquipmentType:String,siteinfo_gsmSiteConfig:String,siteinfo_gsm900AntennaType:String,siteinfo_gsm900AntennaQty:String,siteinfo_gsm900TmaInstalled:String,siteinfo_gsm1800AntennaType:String,siteinfo_gsm1800AntennaQty:String,siteinfo_gsm1800TmaInstalled:String,siteinfo_gsm3gAntennaType:String,siteinfo_gsm3gAntennaQty:String,siteinfo_gsm3gTmaInstalled:String,siteinfo_gsm4gAntennaType:String,siteinfo_gsm4gAntennaQty:String,siteinfo_gsm4gTmaInstalled:String,siteinfo_gsm5gAntennaType:String,siteinfo_gsm5gAntennaQty:String,siteinfo_gsmOmniAntennaType:String,siteinfo_gsmOmniAntennaQty:String,siteinfo_gsmTmaAntennaType:String,siteinfo_gsmTmaAntennaQty:String,siteinfo_gsmBscAntennaType:String,siteinfo_gsmBscAntennaQty:String,siteinfo_gsmTrauAntennaType:String,siteinfo_gsmTrauAntennaQty:String,siteinfo_gsmRepeater:String,siteinfo_gsmRepeaterQty:String}],
	siteinfo_internaldbArray:[{siteinfo_internaldbtype:String,siteinfo_internaldbPhase:String,siteinfo_internaldbmaincircuitbreaker:String,siteinfo_internaldbsurgeArrestorType:String,siteinfo_internaldbsurgeArrestorQty:String,siteinfo_internaldbsurgeArrestorType2:String,siteinfo_internaldbsurgeArrestorQty2:String,siteinfo_internaldbcurrentmonitorType:String,siteinfo_internaldbCurrentMonitorQty:String,siteinfo_internaldbEarthLeakageDevice:String,siteinfo_internaldbEarthLeakageDeviceQty:String,siteinfo_internaldbCircuitBreakerforRectifier:String,siteinfo_internaldbinternaldbCircuitBreakerforRectifierQty:String,siteinfo_internaldbCircuitBreakerforAirconditioners:String,siteinfo_internaldbCircuitBreakerforAirconditionersQty:String,siteinfo_internaldbCircuitBreakerforPlugs:String,siteinfo_internaldbCircuitBreakerforPlugsQty:String,siteinfo_internaldbMastInternalLight:String,siteinfo_internaldb_internaldbMastInternalLightQty:String,siteinfo_internaldbContainerLight:String,siteinfo_internaldbContainerLightQty:String,siteinfo_internaldbSiteLight:String,siteinfo_internaldbSiteLightQty:String,siteinfo_internaldbAircraftWarningLight:String,siteinfo_internaldbAircraftWarningLightQty:String,siteinfo_internaldbCircuitBreakerSpareType:String,siteinfo_internaldbCircuitBreakerSpareTypeQty:String}],
	siteinfo_externaldbArray:[{siteinfo_externaldbtype:String,siteinfo_externaldbSharing:String,siteinfo_externaldbPhase:String,siteinfo_externaldbGeneratorPlug:String,siteinfo_externaldbmainIncomingIsolator:String,siteinfo_externaldbneutralbarsqty:String,siteinfo_externalPowerMonitorRelay:String,siteinfo_externalPowerMonitorRelayType:String,siteinfo_externaldbSurgeArrestors:String,siteinfo_externaldbSurgeArrestorsType:String,siteinfo_externaldbCbForSharingParty:String,siteinfo_externaldbCbForSharingPartyType:String,siteinfo_externaldbKwhmeterForSharingParty:String,siteinfo_externaldbKwhmeterForSharingPartyType:String,siteinfo_externaldbForConstructionParty:String,siteinfo_externaldbForConstructionPartyType:String,siteinfo_externaldbForVdcInternaldb:String,siteinfo_externaldbForVdcInternaldbType:String,siteinfo_externaldbForSiteLight:String,siteinfo_externaldbForSiteLightType:String,siteinfo_externaldbForAwLight:String,siteinfo_externaldbForAwLightType:String,siteinfo_externaldbForMobileGen:String,siteinfo_externaldbForMobileGenType:String,siteinfo_externaldbForGenPhaseMonitor:String,siteinfo_externaldbForGenPhaseMonitorType:String,siteinfo_externaldbForControlFuseforGen:String,siteinfo_externaldbForControlFuseforGenType:String,siteinfo_externaldbForControlFuseRating:String,siteinfo_externaldbForFeedCable:String,siteinfo_externaldbForFeedCableLength:String,siteinfo_externaldbForCableToVm:String,siteinfo_externaldbForCableToVmLength:String,siteinfo_externaldbAwlSurgeArrestor:String,siteinfo_externaldbAwlSurgeArrestorType:String,siteinfo_externaldbAwlSurgeArrestorQty:String,siteinfo_externaldbCurrentMonitor:String,siteinfo_externaldbCurrentMonitorType:String,siteinfo_externaldbChangeContactors:String}],
	siteinfo_mastArray:[{siteinfo_mastType:String,siteinfo_mastManufacturer:String,siteinfo_mastserialno:String,siteinfo_mastHeight:String,siteinfo_mastColour:String,siteinfo_mastOverheadEntry:String,siteinfo_mastUndergroundEntry:String,siteinfo_mastGantryType:String,siteinfo_mastGantryLength:String,siteinfo_mast110mmSleevesQty:String,siteinfo_mast110mmSleevesUsed:String,siteinfo_mast150mmSleevesQty:String,siteinfo_mast150mmSleevesUsed:String,siteinfo_mastOtherSizeSleevesQty:String,siteinfo_mastOtherSizeSleevesUsed:String,siteinfo_mastDrainsatBottom:String,siteinfo_mastLightsfittingType:String,siteinfo_mastLightGlobeType:String,siteinfo_mastLightGlobeQty:String,siteinfo_mastLightSwitchInstalled:String,siteinfo_mastLightSwitchType:String,siteinfo_mastAircraftLightFittingType:String,siteinfo_mastAircraftGlobeType:String,siteinfo_mastAircraftWarningLightGlobeQty:String,siteinfo_mastBottomDBInstalled:String,siteinfo_mastBottomDBType:String,siteinfo_mastCircuitBreakerForAwl:String,siteinfo_mastCircuitBreakerForAWLQty:String,siteinfo_mastCircuitBreakerInternalLights:String,siteinfo_mastCircuitBreakerInternalLightsQty:String,siteinfo_mastLightingArrestorsInstalled:String,siteinfo_mastCircuitBreakerArrestors:String,siteinfo_mastCircuitBreakerArrestorsQty:String,siteinfo_mastTopDBInstalled:String,siteinfo_mastTopDBType:String,siteinfo_mastTopTipoSwitch:String,siteinfo_mastIntermediate:String,siteinfo_mastIntermediateType:String,siteinfo_mastTopintermediateswitchtype:String,siteinfo_mastIntermediateFittingQty:String,siteinfo_mastIntermediateFittingType:String,siteinfo_mastTopGlobeType:String,siteinfo_mastTopAWLLightsEarthLeakage:String,siteinfo_mastTopFallArrestInstalled:String,siteinfo_mastTopFallArrestQty:String,siteinfo_mastTopTypeOfLock:String,siteinfo_mastTopSpineSupportPipes:String,siteinfo_mastTopSpineSupportPipesQty:String,siteinfo_mastTopOtherInformation:String}],
	siteinfo_powercontainerArray:[{siteinfo_powercontainerManufacturerSerialNo:String,siteinfo_powercontainerSize:String,siteinfo_powercontainerBatteryAhCapacity:String,siteinfo_powercontainerBatteryAhQty:String,siteinfo_powercontainerAlarm:String,siteinfo_powercontainerFanType:String,siteinfo_powercontainerFanQty:String,siteinfo_powercontainerRectifier1:String,siteinfo_powercontainerRectifier1Qty:String,siteinfo_powercontainerRectifier2:String,siteinfo_powercontainerRectifier2Qty:String,siteinfo_powercontainerOtherInfo:String}],
	siteinfo_distributionrackArray:[{siteinfo_distribuitionRackInverters:String,siteinfo_distribuitionRackInvertersType:String,siteinfo_distribuitionRackVaRating:String,siteinfo_distribuitionRackInvertQty:String,siteinfo_distribuitionRackDcInput:String,siteinfo_distribuitionRackACOutput:String,siteinfo_distribuitionRackRedudancyctrller:String}],
	siteinfo_transmissioncabinetArray:[{siteinfo_transmissioncabType:String,siteinfo_transmissioncabServiceProvider:String,siteinfo_transmissioncabQty:String}],
	siteinfo_ownerArray:[{siteinfo_siteOwner:String,siteinfo_siteShared:String,siteinfo_sitePreparedForSharing:String,siteinfo_siteOwnerOtherInformation:String}],
	siteinfo_buildingArray:[{siteinfo_buildingStructure:String,siteinfo_buildingcolor:String,siteinfo_buildingserialno:String,siteinfo_buildingTypeOfLock:String,siteinfo_buildingArea:String,siteinfo_buildingwallthickness:String,siteinfo_buildingaccommodationLightFitting:String,siteinfo_buildingaccommodationTypeOfGlobe:String,siteinfo_buildingAccommodationLightQuantity:String,siteinfo_buildingEmergencyLightFitting:String,siteinfo_buildingEmergencyTypeOfGlobe:String,siteinfo_buildingEmergencyLightQuantity:String,siteinfo_buildingCircuitBreakerType:String,siteinfo_buildingCircuitBreakerQuantity:String,siteinfo_buildingCircuitBreakerQuantityUsed:String,siteinfo_buildingMovementAlarmInstalled:String,siteinfo_buildingMovementAlarmInstalledQty:String,siteinfo_buildingIntruderAlarmInstalled:String,siteinfo_buildingIntruderAlarmInstalledQty:String,siteinfo_buildingHeatAlarmInstalled:String,siteinfo_buildingHeatAlarmInstalledQty:String,siteinfo_buildingAdditionalSurgeProtection:String,siteinfo_buildingAdditionalSurgeProtectionType:String}],
	siteinfo_generatorArray:[{siteinfo_generatorprevrefuelhours:String, siteinfo_generatorhours:String, siteinfo_generatortype:String,siteinfo_generatoroutputkw:String,siteinfo_generatormodelno:String,siteinfo_generatorengineserialnumber:String,siteinfo_generatorenginecapacity:String,siteinfo_generatorstartertype:String,siteinfo_generatorfuelconsumption:String,siteinfo_generatorinstallationDate:String,siteinfo_generatorManufacturer:String,siteinfo_generatorSerialNo:String,siteinfo_generatorModel:String,siteinfo_alternatoratorManufacturer:String,siteinfo_alternatoratorKvaRating:String,siteinfo_alternatoratorModelNo:String,siteinfo_alternatoratorSerialNo:String,siteinfo_generalControlerType:String,siteinfo_generalControlerSerialNo:String,siteinfo_generalControlerModelNo:String,siteinfo_generalControlerSoftwareversion:String,siteinfo_generalSurgeArrestors:String,siteinfo_generalSurgeArrestorsType:String,siteinfo_generatorAmpMetersinst:String,siteinfo_generatorAmpMetersinstType:String,siteinfo_generatorVltMetersinst:String,siteinfo_generatorVltMetersinstType:String,siteinfo_generatorFrqncyMetersinst:String,siteinfo_generatorFrqncyMetersinstType:String,siteinfo_generatorAnalogueHourMetersinst:String,siteinfo_generatorAnalogueHourMetersinstType:String,siteinfo_generatorKwhMetersinst:String,siteinfo_generatorKwhMetersinstType:String,siteinfo_generatorDummyLoadMetersinst:String,siteinfo_generatorDummyLoadMetersinstType:String,siteinfo_generatorBatteryinstType:String,siteinfo_generatorBatterySize:String,siteinfo_generatorFuelSensorType:String}],
	siteinfo_securityfencingArray:[{siteinfo_securityFencetype:String,siteinfo_securityFencecolour:String,siteinfo_securityFenceElectrified:String,siteinfo_securityFenceElectrifiedType:String,siteinfo_securityTypeofFitting:String,siteinfo_securityTypeofGlobe:String,siteinfo_securitySiteLightQty:String,siteinfo_securityOutsideLightSwitch:String,siteinfo_securityOutsideLightSwitchLocation:String}],
	siteinfo_ac:String,
	siteinfo_acArray:[{siteinfo_acmanufacturer:String,siteinfo_actype:String,siteinfo_acmodel:String,siteinfo_acnumber:String,siteinfo_acserialnumber:String,siteinfo_acbtu:String,siteinfo_accageinstalled:String,siteinfo_acsleeveinstalled:String,siteinfo_acunitcontrolltype:String,siteinfo_accontrollermodel:String}],
	siteinfo_rectifiercabinnet:String,
	siteinfo_rectcabArray:[{siteinfo_rectcabcabinetmodelno:String,siteinfo_rectcabcabinetnumber:String,siteinfo_rectcabtype:String,siteinfo_rectcabinputtype:String,siteinfo_rectcabnobatteries:String,siteinfo_rectcabbatterycapac:String,siteinfo_rectcabcabinetType:String,siteinfo_rectifierserialno:String,siteinfo_rectcabinetmodulestype:String,siteinfo_rectcabinetmodulescontrollertype:String,siteinfo_rectcabinetCircuitBreakerInputType:String,siteinfo_rectcabinetCircuitBreakerLoadType:String,siteinfo_rectcabinetcircuitbreakerloadquantity:String,siteinfo_rectcabinetcircuitbreakerbatteriestype:String,siteinfo_rectcabinetbatteryahcapacityCab1:String,siteinfo_rectcabinetbatteryahcapacitycab:String}],
	siteinfo_fencing:String,
	siteinfo_fencingelectrified:String,
	siteinfo_guardsite:String,
	siteinfo_securityArray:[{siteinfo_secguardname:String,siteinfo_secbinumber:String,siteinfo_secnib:String,siteinfo_secvalue:String}],
	siteinfo_elecsupptype:String,
	siteinfo_electype:String,
	siteinfo_elecpayment:String,
	siteinfo_credelec:String,
	siteinfo_audittrail:[{siteinfo_audittrailname:String, siteinfo_audittrailaction:String, siteinfo_audittraildate:String}]
})

siteinfoSchema.statics.gravarDados=function(siteinfo, callback){
	this.create(siteinfo, callback);
}

siteinfoSchema.statics.visualizacao=function(siteinfo, callback){
	this.find(siteinfo);
	}

module.exports=mongoose.model("SiteInfo",siteinfoSchema, "SiteInfo");