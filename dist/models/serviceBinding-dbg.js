function initModel(sUrl, name){
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel, name);
}

function verifyModel() {
	initModel("/sap/opu/odata/sap/ZMMPORTAL_VERIFICACION_SRV/", "verifyModel");
}

function vendorModel(){
	/* initModel("/sap/opu/odata/sap/ZSPORTAL_SRV/", "vendorModel"); CVM */
}

function misPedidosModel(){
	initModel("/sap/opu/odata/sap/ZSPORTAL_MYORDERS_SRV/", "misPedidosModel");
}

function logonModel(){
	initModel("/sap/opu/odata/sap/ZSPORTAL_USERS_SRV_02/", "logonModel");
}

function complementoPagoModel(){
	initModel("", "complPagoModel");
}