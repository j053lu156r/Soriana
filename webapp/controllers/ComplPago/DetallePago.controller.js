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

	var sUri = "/sap/opu/odata/sap/ZOSP_STATEMENT_SRV_01/";
	var dTJSON;
	var fechaAct = new Date();

	return Controller.extend("demo.controllers.ComplPago.DetallePago", {

		sCollection: "GroupedTotales>/Hierarchy",
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

			this.oRouter.getRoute("detailComplPagos").attachPatternMatched(this._onDocumentMatched, this);

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
				this._pTemplate = Fragment.load({
					id: this.getView().getId(),
					name: "demo.views.ComplPago.Row"
				});
			}
			this._oTable = this.byId("idGroupTable");

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
			 

			let proveedor_LIFNR = this.getConfigModel().getProperty("/supplierInputKey");
			// format[AAAAMMDD] (2020101)
			// let desde_LV_ZDESDE = this.buildSapDate( dateRange.getDateValue()       ); 
			// format[AAAAMMDD] (2020101)
			// let desde_LV_ZHASTA = this.buildSapDate( dateRange.getSecondDateValue() );



			//tomar valores dummy para hacer al consulta 
			let todayDate = new Date();

			// format[AAAAMMDD] (2020101)
			let desde_LV_ZDESDE =  '20160219'// this.buildSapDate(todayDate);
			// format[AAAAMMDD] (2020101)
			let desde_LV_ZHASTA = this.buildSapDate(todayDate);



			let doc_BELNR = this._document// documentoInput.getValue();

			//checbox validaciones

 
		 


			if (proveedor_LIFNR == null || proveedor_LIFNR == "") {
				sap.m.MessageBox.error("El campo proveedor es obligatorio.");
				return false;
			}

			if (desde_LV_ZDESDE == "" || desde_LV_ZHASTA == "") {
				// sap.m.MessageBox.error("Por favor defina el rango de fechas.");
			}


			 
			var queryFiltro = ""
 


			var oODataJSONModel = this.getOdata(sUri);
			//            let urlParams = `EStmtHdrSet?$expand=Citms,Oitms&$filter= Lifnr eq '${proveedor_LIFNR}' and Datei eq '${desde_LV_ZDESDE}' and Datef eq '${desde_LV_ZHASTA}' and belnr eq '${doc_BELNR}'  &$format=json`;

			let urlParams = `EStmtHdrSet?$expand=Citms,Oitms&$filter= Lifnr eq '${proveedor_LIFNR}' and Datei eq '${desde_LV_ZDESDE}' and Datef eq '${desde_LV_ZHASTA}' ${queryFiltro} &$format=json`;
			//Xblnr

			var odTJSONModel = this.getOdataJsonModel(urlParams, oODataJSONModel);
			dTJSON = odTJSONModel.getJSON();
			var TDatos = JSON.parse(dTJSON);

			let Detalles = [...TDatos.results[0].Citms.results, ...TDatos.results[0].Oitms.results];

			TDatos.results[0].Detalles = {
				results: [...Detalles]
			};

			delete TDatos.results[0].Citms;
			delete TDatos.results[0].Oitms;


			//TDatos.results[0].periodo = "Del " + this.formatDateTime(dateRange.getDateValue(), 'dd/MM/YYYY') + " al " + this.formatDateTime(dateRange.getSecondDateValue(), 'dd/MM/YYYY');


			var JSONT = $.extend({}, TDatos.results[0]);
			var jsonModelT = new JSONModel();
			jsonModelT.setData(JSONT);



			//filtrar totales y crear modelo grupal 

			console.info("agrupando datos", Detalles)
			let auxArray = [...Detalles]


			var groupedMovs = this.groupArrayOfObjects(auxArray, "DescTipomov");
			var nestedMovs = []

			var me = this;

			for (let x in groupedMovs) {


				console.log("sumando valores");


				var resultCredit = groupedMovs[x].reduce(function (_this, val) {
					//console.log(val.Wrbtr)
					var current = val.Bschl === "21" ? Number(val.Wrbtr) : 0
					var total = _this + current
					return me.truncate(total, 2)
				}, 0);

				//console.log(result)

				var result = groupedMovs[x].reduce(function (_this, val) {
					var current = val.Bschl !== "21" ? Number(val.Wrbtr) : 0
					var total = _this + current
					return me.truncate(total, 2)
				}, 0);

				var cost = groupedMovs[x].reduce(function (_this, val) {
					var current =   Number(val.Wrbtr)  
					var total = _this + current
					return me.truncate(total, 2)
				}, 0);


				nestedMovs.push({
					"name": x,
					"totalRegs": groupedMovs[x].length,
					"totalDebit": Math.abs(result),
					"totalCredit": Math.abs(resultCredit),
					"cost": Math.abs(cost),
					"positions": groupedMovs[x]

				})


			}


			console.log(nestedMovs);

			var totalR = nestedMovs.reduce(function (_this, val) {
				var current = Number(val.totalRegs)
				var total = _this + current
				return me.truncate(total, 2)
			}, 0);

			var totalD = nestedMovs.reduce(function (_this, val) {
				var current = Number(val.totalDebit)
				var total = _this + current
				return me.truncate(total, 2)
			}, 0);

			var totalC = nestedMovs.reduce(function (_this, val) {
				var current = Number(val.totalCredit)
				var total = _this + current
				return me.truncate(total, 2)
			}, 0);

			var totalCostos = nestedMovs.reduce(function (_this, val) {
				var current = Number(val.cost)
				var total = _this + current
				return me.truncate(total, 2)
			}, 0);




			var jsonModelG = new JSONModel({
				"Hierarchy": {
					"movimientos": nestedMovs,
					"totalR": totalR,
					"totalD": totalD,
					"totalC": totalC,
					"totalCostos": totalCostos

				}
			});

			console.log(jsonModelG);

			this.getOwnerComponent().setModel(jsonModelG, "GroupedTotales");


			this.initTable()

			//this.getOwnerComponent().setModel(jsonModelT, "totales");

			//this.paginate("totales", "/Detalles", 1, 0);

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
				this._oTable.setMode("None");
				//  this.byId("weightColumn").setVisible(true);
				// this.byId("dimensionsColumn").setVisible(true);


				this.byId("statusColumn").setVisible(true);
				this.byId("folioColumn").setVisible(true);
				this.byId("referenceColumn").setVisible(true);

				this.byId("typeDocColumn").setVisible(true);

				this.byId("dateColumn").setVisible(true);
				this.byId("amountColumn").setVisible(true);
				this.byId("mCondicionColumn").setVisible(true);
				this.byId("bloqueoColumn").setVisible(true);
				this.byId("conciliacionColumn").setVisible(true);

				//totles 
				this.byId("tipoColumn").setVisible(false);

				this.byId("totalRegColumn").setVisible(false);
				this.byId("debitColumn").setVisible(false);
				this.byId("creditColumn").setVisible(false);
				this.byId("costoColumn").setVisible(false);

				




			} else {
				this._oTable.setMode("SingleSelectMaster");

				this.byId("statusColumn").setVisible(false);
				this.byId("folioColumn").setVisible(false);
				this.byId("referenceColumn").setVisible(false);

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






			}

			// Set the new aggregation
			console.log('SET agregation spath', sPath)


			//   var tableModel = this.getOwnerComponent().getModel("GroupedTotales")
			//    this._oTable.setModel(tableModel)
			this._pTemplate.then(function (oTemplate) {

				this._oTable.bindAggregation("items", sPath, oTemplate);

			}.bind(this));





		},




		handleSelection: function (oEvent) {

			console.log(
				"on condepto select"

			)
			var sPath = oEvent.getParameter("listItem").getBindingContextPath();

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
					text: "{GroupedTotales>name}",
					press: [sPath + "/" + this.aCrumbs[iCurNodeIndex], this.onBreadcrumbPress, this]
				});

				oLink.bindElement({
					path: "GroupedTotales>" + sPath
				});
				oBreadCrumb.addLink(oLink);
			}

			// If we're on a leaf, remember the selections;
			// otherwise navigate
			if (sCurrentCrumb === this.aCrumbs[this.aCrumbs.length - 1]) {
				var oSelectionInfo = {};
				var bSelected = oEvent.getParameter("selected");
				oEvent.getParameter("listItems").forEach(function (oItem) {
					oSelectionInfo[oItem.getBindingContext().getPath()] = bSelected;
				});
				this._updateOrder(oSelectionInfo);
			} else {
				var modelName = "GroupedTotales>"
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
			this.oRouter.navTo("detailComplPagos", {
				layout: sNextLayout,
				document: this._document
			});
		},
		handleExitFullScreen: function () {
			this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
			this.oRouter.navTo("detailComplPagos", {
				layout: sNextLayout,
				document: this._document
			});
		},
		handleClose: function () {
			console.log('on hanlde close')
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
			this.oRouter.navTo("masterCompl", {
				layout: sNextLayout
			});
		},

		_onDocumentMatched: function (oEvent) {
			this._document = oEvent.getParameter("arguments").document || this._document || "0";
			console.log(this._document);

			this.getView().bindElement({
				path: "/ProductCollection/" + this._document,
				model: "products"
			});

			this.getView().setModel(new JSONModel({
					"document": this._document
				}),
				"detailComplPagos");

				//consume el servicio para obtener los docuemntos 

				 this.searchData()



		}
	});
});