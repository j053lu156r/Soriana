sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"demo/controllers/BaseController",
	"demo/models/BaseModel",
	'sap/m/Label',
	'sap/m/Link',
	'sap/m/MessageToast',
	'sap/m/Text',
	'sap/ui/core/Fragment'
], function (JSONModel, Controller, BaseModel, Label, Link, MessageToast, Text, Fragment) {
	"use strict";

	//var sUri = "/sap/opu/odata/sap/ZOCP_DOCPAGO_SRV/";
	var sUri = "/sap/opu/odata/sap/ZOCP_FACTORAJE_SRV/";
	//ZOCP_FACTORAJE_SRV
	var dTJSON;
	var fechaAct = new Date();

	return Controller.extend("demo.controllers.Factoraje.DetalFactoraje", {

		sCollection: "GroupedFactoraje>/Hierarchy",
		aCrumbs: ["movimientos", "positions"],
		mInitialOrderState: {
			products: {},
			count: 0,
			hasCounts: false
		},

		onInit: function () {
			var oExitButton = this.getView().byId("exitFullScreenBtn"),
				oEnterButton = this.getView().byId("enterFullScreenBtn");

			this.oRouter = this.getOwnerComponent().getRouter();
			this.oModel = this.getOwnerComponent().getModel();

			this.oRouter.getRoute("detailFactoring").attachPatternMatched(this._onDocumentMatched, this);

			//this.searchData();
			this.getView().addEventDelegate({
				onBeforeShow: function (oEvent) {
					/*var oModel = new JSONModel();
					oModel.setData({
						maxDate: new Date(fechaAct.getFullYear(), fechaAct.getMonth(), fechaAct.getDate()),
						disabled: [{start: new Date(fechaAct.getFullYear(), fechaAct.getMonth(), fechaAct.getDate() + 1), end: new Date(fechaAct.getFullYear(), fechaAct.getMonth(), fechaAct.getDate() + 10)},
								   {start: new Date(fechaAct.getFullYear(), fechaAct.getMonth(), fechaAct.getDate() + 15)}
								  ]
					});
					this.getView().setModel(oModel);*/
					this.getOwnerComponent().setModel(new JSONModel(), "totales");

					var oModel = new JSONModel({
						filtros: [{
								filtro: 'belnr',
								descripcion: 'Documento'
							},
							{
								filtro: 'xblnr',
								descripcion: 'Factura'
							},
							{
								filtro: '',
								descripcion: ''
							}


						]

					});
					this.getView().setModel(oModel, 'filterOptions');


					//configuracion tabla




				}
			}, this);


			if (!this._pTemplate) {
				this._pTemplate = this.loadFragment({
					id: this.getView().getId(),
					name: "demo.views.Factoraje.Row"
				});
			}
			this._oTable = this.byId("detailsStatementList");

			/*
						[oExitButton, oEnterButton].forEach(function (oButton) {
							oButton.addEventDelegate({
								onAfterRendering: function () {
									if (this.bFocusFullScreenButton) {
										this.bFocusFullScreenButton = false;
										oButton.focus();
									}
								}.bind(this)
							});
						}, this);

						*/

		},


		/** HANDLE DATA CALL METHODS*/
		searchData: function () {

			//let dateRange = this.getView().byId("dateRange");

			//ciltro documento

			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "YYYYMMdd"
			});
			let proveedor_LIFNR = this.getConfigModel().getProperty("/supplierInputKey");
			// format[AAAAMMDD] (2020101)
			// let desde_LV_ZDESDE = this.buildSapDate( dateRange.getDateValue()       );
			// format[AAAAMMDD] (2020101)
			// let desde_LV_ZHASTA = this.buildSapDate( dateRange.getSecondDateValue() );



			//tomar valores dummy para hacer al consulta
			let todayDate = new Date();

			console.log(this._fecha)

			// format[AAAAMMDD] (2020101)
			let desde_LV_ZDESDE = this._fecha.replace(/-/g, ''); // '20210621'// this.buildSapDate(todayDate);
			// format[AAAAMMDD] (2020101)
			let desde_LV_ZHASTA = dateFormat.format(todayDate) // this.buildSapDate(todayDate);

			desde_LV_ZDESDE ="-"

			desde_LV_ZHASTA = "-"


			let doc_BELNR = this._document // documentoInput.getValue();

			//checbox validaciones


			let EJERCICIO = this._ejercicio;



			if (proveedor_LIFNR == null || proveedor_LIFNR == "") {
				sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/global.supplierSelectError"));
				return false;
			}

			if (desde_LV_ZDESDE == "-" || desde_LV_ZHASTA == "-") {
				// sap.m.MessageBox.error("Por favor defina el rango de fechas.");
			}

			var BUKRS = this._sociedad



			var queryFiltro = ` and Belnr eq '${doc_BELNR}'`



			//var oODataJSONModel = this.getOdata(sUri);


			let urlParams = `EStmtHdrSet?$expand=Citms&$filter= Datei eq '${desde_LV_ZDESDE}' and Datef eq '${desde_LV_ZDESDE}'${queryFiltro} &$format=json`;

			//let urlParams = `EStmtHdrSet?$expand=Citms&$filter= Lifnr eq '${proveedor_LIFNR}' and Datei eq '${desde_LV_ZDESDE}' and Datef eq '${desde_LV_ZHASTA}'${queryFiltro} &$format=json`;
			//Xblnr

			var auxFilters = [];

			auxFilters.push(new sap.ui.model.Filter({
					path: "Datei",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: desde_LV_ZDESDE
				})

			)

			auxFilters.push(new sap.ui.model.Filter({
					path: "Datef",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: desde_LV_ZHASTA
				})

			)


			var formatedBlnr = `${doc_BELNR}`
			var formatedEjercicio = `${this._ejercicio}`
			var formatedLifnr = `${proveedor_LIFNR}`


			auxFilters.push(new sap.ui.model.Filter({
					path: "Belnr",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: formatedBlnr
				})

			)

			auxFilters.push(new sap.ui.model.Filter({
					path: "LIFNR",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: formatedLifnr
				})

			)

			auxFilters.push(new sap.ui.model.Filter({
					path: "GJAHR",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: formatedEjercicio
				})

			)




			var model = "ZOCP_FACTORAJE_SRV";
			var entity = "EStmtHdrSet";
			var expand = ['Citms'];
			var filter = auxFilters;
			var select = "";
			sap.ui.core.BusyIndicator.show();

			let that = this

			this._GetODataV2(model, entity, filter, expand, select).then(function (_GEToDataV2Response) {
				sap.ui.core.BusyIndicator.hide();
				var data = _GEToDataV2Response.data.results;

				console.log(data)
				let Detalles = [...data[0].Citms.results];
				let retencionAforo =  Detalles.find(({ZdocAforo}) => ZdocAforo.startsWith('60'));

				console.log("get aforo",retencionAforo)

				if(retencionAforo){
					var aforoRegis = {...retencionAforo}
					aforoRegis.DescripcionGpo= "RETENCIÓN AFORO"
					aforoRegis.IdNumGpo= "82"
					aforoRegis.DescTipomov= "PROTECCIÓN POR FACTORAJE"
					aforoRegis.IdNumTipomov= "82"
					aforoRegis.Belnr = aforoRegis.ZdocAforo
					aforoRegis.Wrbtr= retencionAforo.RetencionAforo * -1

					Detalles.push(aforoRegis)
				}

				var cleanedArray = Detalles  //Detalles.filter(obj => !obj.Belnr.startsWith("58") && !obj.Belnr.startsWith("59"));





				var clanedDateArray  = cleanedArray.filter(obj => {
					// DescripcionGpo: "PAGO FACTURA"
					//IdNumGpo: "1"
					//DescTipomov: "PAGO FACTURAS"
					//IdNumTipomov: "11"

					if(obj.DescripcionGpo === ""){
						obj.DescripcionGpo= "AJUSTE DE FACTURAS"
						obj.IdNumGpo= "9"
						obj.DescTipomov= "CARGOS DIVERSOS"
						obj.IdNumTipomov= "65"
					}



					return   true
				});



				data[0].Detalles = {
					results: [...clanedDateArray]
				};


				var JSONT = $.extend({}, data[0]);
				var jsonModelT = new JSONModel();
				jsonModelT.setData(JSONT);
				//filtrar totales y crear modelo grupal

				let auxArray = [...clanedDateArray]


				var sumaAux = auxArray.reduce(function (_this, val) {
					//console.log(val.Wrbtr)
					var current = Number(val.Wrbtr)
					var total = _this + current
					return total
				}, 0);

				var groupedMovs = that.groupArrayOfObjects(auxArray, "DescripcionGpo");
				var nestedMovs = []
				var me = that;
				for (let x in groupedMovs) {


					var cost = groupedMovs[x].reduce(function (_this, val) {
						var current = Number(val.Wrbtr)
						var total = _this + current
						return total
					}, 0);

					nestedMovs.push({
						"name": x,
						"totalRegs": groupedMovs[x].length,
						"totalDebit": 0,
						"totalCredit": 0,
						"cost": me.truncate(cost, 2),
						"positions": groupedMovs[x]

					})

				}


				var totalR = nestedMovs.reduce(function (_this, val) {
					var current = Number(val.totalRegs)
					var total = _this + current
					return me.truncate(total, 2)
				}, 0);


				var cor = .00001
				sumaAux = sumaAux + cor
				var jsonModelG = new JSONModel({
					"Hierarchy": {
						"movimientos": nestedMovs,
						"totalR": totalR,
						"totalD": 0,
						"totalC": 0,
						"totalCostos": me.truncate(sumaAux, 2)

					}
				});

				that.getOwnerComponent().setModel(jsonModelG, "GroupedFactoraje");

				that.initTable()




			});




//CODIGO V!

			/*

			var odTJSONModel = this.getOdataJsonModel(urlParams, oODataJSONModel);
			dTJSON = odTJSONModel.getJSON();
			var TDatos = JSON.parse(dTJSON);

			let Detalles = [...TDatos.results[0].Citms.results];

			TDatos.results[0].Detalles = {
				results: [...Detalles]
			};

			delete TDatos.results[0].Citms;


			var JSONT = $.extend({}, TDatos.results[0]);
			var jsonModelT = new JSONModel();
			jsonModelT.setData(JSONT);



			let auxArray = [...Detalles]



			var sumaAux = auxArray.reduce(function (_this, val) {
				//console.log(val.Wrbtr)
				var current = Number(val.Wrbtr)
				var total = _this + current
				return total
			}, 0);

			var groupedMovs = this.groupArrayOfObjects(auxArray, "DescripcionGpo");
			var nestedMovs = []
			var me = this;
			for (let x in groupedMovs) {


				var cost = groupedMovs[x].reduce(function (_this, val) {
					var current = Number(val.Wrbtr)
					var total = _this + current
					return total
				}, 0);

				nestedMovs.push({
					"name": x,
					"totalRegs": groupedMovs[x].length,
					"totalDebit": 0,
					"totalCredit": 0,
					"cost": me.truncate(cost, 2),
					"positions": groupedMovs[x]

				})

			}


			var totalR = nestedMovs.reduce(function (_this, val) {
				var current = Number(val.totalRegs)
				var total = _this + current
				return me.truncate(total, 2)
			}, 0);


			var cor = .00001
			sumaAux = sumaAux + cor
			var jsonModelG = new JSONModel({
				"Hierarchy": {
					"movimientos": nestedMovs,
					"totalR": totalR,
					"totalD": 0,
					"totalC": 0,
					"totalCostos": me.truncate(sumaAux, 2)

				}
			});

			this.getOwnerComponent().setModel(jsonModelG, "GroupedFactoraje");

			this.initTable()

			//	this.getOwnerComponent().setModel(jsonModelT, "totales");

			//this.paginate("totales", "/Detalles", 1, 0);
*/
		},

		subtractYears: function (numOfYears, date = new Date()) {
			date.setFullYear(date.getFullYear() - numOfYears);

			return date;
		},


		groupArrayOfObjects: function (list, key) {
			return list.reduce(function (rv, x) {
				(rv[x[key]] = rv[x[key]] || []).push(x);
				return rv;
			}, {});
		},








		/***HANDLE TABLE FILTER METHODS */


		//esta fucnion inicializa la tabla de forma gerarquica
		initTable: function () {

			console.log('on init table')


			var sPath = this._getInitialPath();

			this._setAggregation(sPath);
			var oBreadCrumb = this.byId("breadcrumb");
			var oLink = new Link({
				text: "Conceptos",
				press: [sPath, this.onBreadcrumbPress, this]
			});
			oBreadCrumb.destroyLinks();

			oBreadCrumb.addLink(oLink);

		},








		// Initial path is the first crumb appended to the collection root
		_getInitialPath: function () {
			return [this.sCollection, this.aCrumbs[0]].join("/");
		},


		// Find the next crumb that follows the given crumb
		_nextCrumb: function (sCrumb) {
			for (var i = 0, ii = this.aCrumbs.length; i < ii; i++) {
				if (this.aCrumbs[i] === sCrumb) {
					return this.aCrumbs[i + 1];
				}
			}
		},


		truncate: function (num, places) {
			return Math.trunc(num * Math.pow(10, places)) / Math.pow(10, places);
		},

		// Remove the numeric item binding from a path
		_stripItemBinding: function (sPath) {
			var aParts = sPath.split("/");
			return aParts.slice(0, aParts.length - 1).join("/");
		},



		_setAggregation: function (sPath) {
			// If we're at the leaf end, turn off navigation
			var sPathEnd = sPath.split("/").reverse()[0];
			if (sPathEnd === this.aCrumbs[this.aCrumbs.length - 1]) {
			//	this._oTable.setMode("None");
				//  this.byId("weightColumn").setVisible(true);
				// this.byId("dimensionsColumn").setVisible(true);
				//this._oTable.setMode("None");


				this.byId("statusColumn").setVisible(false);
				this.byId("folioColumn").setVisible(true);
				this.byId("referenceColumn").setVisible(true);

				this.byId("typeDocColumn").setVisible(true);

				this.byId("dateColumn").setVisible(false);
				this.byId("amountColumn").setVisible(true);
				this.byId("mCondicionColumn").setVisible(false);
				this.byId("bloqueoColumn").setVisible(false);
				this.byId("conciliacionColumn").setVisible(false);
				this.byId("tipoMovColumn").setVisible(true);

				//totles
				this.byId("tipoColumn").setVisible(false);

				this.byId("totalRegColumn").setVisible(false);
				this.byId("debitColumn").setVisible(false);
				this.byId("creditColumn").setVisible(false);
				this.byId("costoColumn").setVisible(false);



				//folio y sucursal
				this.byId("sucursalColumn").setVisible(true);
				this.byId("folio2Column").setVisible(true);




			} else {
				//this._oTable.setMode("SingleSelectMaster");

				this.byId("statusColumn").setVisible(false);
				this.byId("folioColumn").setVisible(false);
				this.byId("referenceColumn").setVisible(false);
				this.byId("tipoMovColumn").setVisible(false);

				this.byId("typeDocColumn").setVisible(false);

				this.byId("dateColumn").setVisible(false);
				this.byId("amountColumn").setVisible(false);
				this.byId("mCondicionColumn").setVisible(false);

				this.byId("bloqueoColumn").setVisible(false);
				this.byId("conciliacionColumn").setVisible(false);

				//totales tipoColumn
				this.byId("tipoColumn").setVisible(true);

				this.byId("totalRegColumn").setVisible(true);
				this.byId("debitColumn").setVisible(false);
				this.byId("creditColumn").setVisible(false);
				this.byId("costoColumn").setVisible(true);



				//folio y sucursal
				this.byId("sucursalColumn").setVisible(false);
				this.byId("folio2Column").setVisible(false);



			}

			// Set the new aggregation
			console.log('SET agregation spath', sPath)


			//   var tableModel = this.getOwnerComponent().getModel("GroupedFactoraje")
			//    this._oTable.setModel(tableModel)
			/*
			this._pTemplate.then(function (oTemplate) {

				this._oTable.bindAggregation("items", sPath, oTemplate);

			}.bind(this));
*/

			this._oTable.bindRows({
				path: sPath,
			})




		},




		conceptoSelect: function (oEvent) {

			console.log(
				"on condepto select"

			)
			//var sPath = oEvent.getParameter("listItem").getBindingContextPath();
			let sPath = oEvent.getSource().getBindingContext("GroupedFactoraje").getPath();

			console.log(sPath)
			var aPath = sPath.split("/");
			var sPathEnd = sPath.split("/").reverse()[1];
			var sCurrentCrumb = aPath[aPath.length - 2];
			console.log("current path", sCurrentCrumb)

			if (sPathEnd !== this.aCrumbs[this.aCrumbs.length - 1]) {
				var oBreadCrumb = this.byId("breadcrumb");
				var sPrevNode = aPath[aPath.length - 2];
				var iCurNodeIndex = this.aCrumbs.indexOf(sPrevNode) + 1;

				console.log("currentNOde", iCurNodeIndex)

				var oLink = new Link({
					text: "{GroupedFactoraje>name}",
					press: [sPath + "/" + this.aCrumbs[iCurNodeIndex], this.onBreadcrumbPress, this]
				});

				oLink.bindElement({
					path: "GroupedFactoraje>" + sPath
				});
				oBreadCrumb.addLink(oLink);
			}

			// If we're on a leaf, remember the selections;
			// otherwise navigate
			if (sCurrentCrumb === this.aCrumbs[this.aCrumbs.length - 1]) {
				console.log("on Documento seleccionado....")
				var oSelectionInfo = {};
				//var bSelected = oEvent.getParameter("selected");
				//oEvent.getParameter("listItems").forEach(function (oItem) {
				//	oSelectionInfo[oItem.getBindingContext().getPath()] = bSelected;
				//});
				//this._updateOrder(oSelectionInfo);

				console.log('on documnt press', oEvent);
				console.log(sPath)
				//let posicion = oEvent.getSource().getBindingContext("GroupedFactoraje").getPath().split("/").pop();
				let results = this.getOwnerComponent().getModel("GroupedFactoraje").getProperty(sPath);

				console.log(results)
				//let registro = results[posicion];
				//console.log(registro)
				var tcode = results.Tcode

				//NAVEGACION A ERER NIVEL

/*
				if (tcode !== "Z_APORTACIONES") {
					this.getOwnerComponent().getRouter().navTo("detailAcuerdos", {
						layout: sap.f.LayoutType.ThreeColumnsEndExpanded,
						document: results.Belnr,
						sociedad: this._sociedad,
						ejercicio: this._ejercicio,
						doc: this._document,
						fecha: this._fecha
						// lifnr: docResult.Lifnr
					}, true);

				} else {

					this.getOwnerComponent().getRouter().navTo("detailAportacionesComplemento", {
						layout: sap.f.LayoutType.ThreeColumnsEndExpanded,
						document: results.Xblnr,
						sociedad: this._sociedad,
						ejercicio: this._ejercicio,
						doc: this._document,
						fecha: this._fecha
						//ejercicio: ejercicio,
						//doc: results.Belnr,
						// zbukr: docResult.Zbukr,
						// lifnr: docResult.Lifnr
					}, true);
				}

*/

			} else {
				console.log("on grupo seleccionado seleccionado.....")
				var modelName = "GroupedFactoraje>"
				var sNewPath = [sPath, this._nextCrumb(sCurrentCrumb)].join("/");

				this._setAggregation(modelName + sNewPath);

				console.log("new spath", sNewPath);
			}
		},

		onBreadcrumbPress: function (oEvent, sPath) {
			var oLink = oEvent.getSource();
			var oBreadCrumb = this.byId("breadcrumb");
			var iIndex = oBreadCrumb.indexOfLink(oLink);
			var aCrumb = oBreadCrumb.getLinks().slice(iIndex + 1);
			if (aCrumb.length) {
				aCrumb.forEach(function (oLink) {
					oLink.destroy();
				});
				this._setAggregation(sPath);
			}
		},







		/***HANDLE SCREEN HELPERS  */

		handleFullScreen: function () {
			var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(2);
			this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
			this.oRouter.navTo("detailFactoring", {
				layout: sNextLayout,
				document: this._document,
				sociedad: this._sociedad,
				ejercicio: this._ejercicio,
				fecha: this._fecha
			});
		},
		handleExitFullScreen: function () {
			this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
			this.oRouter.navTo("detailFactoring", {
				layout: sNextLayout,
				document: this._document,
				sociedad: this._sociedad,
				ejercicio: this._ejercicio,
				fecha: this._fecha
			});
		},
		handleClose: function () {
			console.log('on hanlde close')
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
			this.oRouter.navTo("masterFactoring", {
				layout: sNextLayout
			});
		},

		_onDocumentMatched: function (oEvent) {
			this._document = oEvent.getParameter("arguments").document || this._document || "0";
			this._sociedad = oEvent.getParameter("arguments").sociedad || this._sociedad || "0";
			this._ejercicio = oEvent.getParameter("arguments").ejercicio || this._ejercicio || "0";
			this._fecha = oEvent.getParameter("arguments").fecha || this._fecha || "0";

			console.log(this._document);

			this.getView().bindElement({
				path: "/ProductCollection/" + this._document,
				model: "products"
			});

			this.getView().setModel(new JSONModel({
					"document": this._document,
					"date": this._fecha
				}),
				"detailFactoraje");

			//consume el servicio para obtener los docuemntos

			this.searchData()



		},


		//HANDLE OPEN DEVOLUCIONES
		onDocumentDevolucionPress: function (oEvent){
			var path = oEvent.getSource().getBindingContext("GroupedFactoraje").getPath();
			let results = this.getOwnerComponent().getModel("GroupedFactoraje").getProperty(path);

			console.log(results)
		//var Lifnr = this.getOwnerComponent().getModel('GroupedFactoraje').getProperty('/Lifnr')
         
console.log(results.Foliodescuento)
console.log(results.Lifnr)
console.log(results.Ebeln)
			this.getOwnerComponent().getRouter().navTo("detailDevoFactoraje", {
				layout: sap.f.LayoutType.ThreeColumnsEndExpanded,
				xblnr: results.Folio|| 0,
				lifnr: results.Lifnr,
				ebeln: results.Ebeln || 0,
                suc:  results.Sucursal,
				
			}, true);

          

		},



		//HAANDLE OPEN ACUERDOS

		onDocumentPress: function (oEvent) {
			console.log('on documnt press', oEvent);
			let posicion = oEvent.getSource().getBindingContext("GroupedFactoraje").getPath() ;
			let results = this.getOwnerComponent().getModel("GroupedFactoraje").getProperty(posicion);

 			console.log(results)


			var sociedad = this.getOwnerComponent().getModel('GroupedFactoraje').getProperty('/Bukrs');
			var ejercicio2 = results.Gjahr;
			var ejercicio = ejercicio2.substr(0, 4) ? ejercicio2.substr(0, 4) : ""

			var tcode = results.Tcode
			console.log(sociedad, ejercicio, tcode)
			var doc = results.Belnr

			var aportacionesTCodes = ['Z_APORTACIONES']
			var boletinVentasTCodes = ['ZMM_ACUERDOS_LIQUI']

			var boart = results.Boart
			var acuerdosNSBoart = ['ZD33', 'ZD34', 'ZM33', 'ZM34']

			//logica para enviar a Aportaciones o a Acuerdos
			//console.log((( tcode !== "" &&  tcode.match("(ZMMFILACUERDO|MEB|WLF).*")  &&  doc.startsWith('51')) || ((tcode === "" && !( doc.startsWith("170") ) &&  results.Foliodescuento ))   ) )
			if ( ( tcode !== "" &&  tcode.match("(ZMMFILACUERDO|MEB|WLF).*")  &&  doc.startsWith('51')) 
			  || ( tcode === "" && !( doc.startsWith("170") &&  results.Foliodescuento ) ) ) {
//1500000453  1500177301


				//console.log('on detail factoraje acuerdos',tcode.match("(ZMMFILACUERDO|MEB|WLF).*") )
				if (acuerdosNSBoart.includes(boart)) {
				
					this.getOwnerComponent().getRouter().navTo("detailAcuerdosECNS",
						{
							layout: sap.f.LayoutType.ThreeColumnsEndExpanded,
							document: results.Belnr,
							sociedad: this._sociedad,
							ejercicio: ejercicio2,
							doc: this._document,
							fecha: this._fecha
							// lifnr: docResult.Lifnr
						}, true);

				} else {

					this.getOwnerComponent().getRouter().navTo("detailAcuerdosFactoraje",
						{
							layout: sap.f.LayoutType.ThreeColumnsEndExpanded,
							document: results.Belnr,
							sociedad: this._sociedad,
							ejercicio: ejercicio2,
							doc: this._document,
							fecha: this._fecha
							// lifnr: docResult.Lifnr
						}, true);
				}

			}else if ((aportacionesTCodes.includes(tcode) || ( doc.startsWith("170")) &&  results.Foliodescuento )  ) {


				console.warn('on detail factoraje aportaciones')
				this.getOwnerComponent().getRouter().navTo("detailAportacionesFactoraje",
					{
						layout: sap.f.LayoutType.ThreeColumnsEndExpanded,
						document: results.Foliodescuento,
						sociedad: this._sociedad,
						ejercicio: ejercicio2,
						doc: this._document,
						fecha: this._fecha
						//ejercicio: ejercicio,
						//doc: results.Belnr,
						// zbukr: docResult.Zbukr,
						// lifnr: docResult.Lifnr
					}, true);



			} else if (boletinVentasTCodes.includes(tcode) || tcode === ''){
				console.log('on boletin vtz')

				// navega a pantalla de boltines * revisar condiciones de apertura , conseguir esenarios
				this.getOwnerComponent().getRouter().navTo("BoletinVtaDetailPolizas", {
					layout: sap.f.LayoutType.ThreeColumnsEndExpanded,
					//  document: results.Xblnr,
					document: doc,
					company: this._sociedad,
					year: ejercicio
				}, false);



			}



		}





	});
});
