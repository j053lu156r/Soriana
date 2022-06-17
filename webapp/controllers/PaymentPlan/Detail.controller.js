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
    

    var oModel = new this.PaymentPlan();
    return Controller.extend("demo.controllers.PaymentPlans.Detail", {

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

            this.oRouter.getRoute("detailPayPlan").attachPatternMatched(this._onDocumentMatched, this);

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


            if (!this._pTemplate) {
				this._pTemplate = Fragment.load({
					id: this.getView().getId(),
					name: "demo.views.PaymentPlan.Row"
				});
			}
			this._oTable = this.byId("idGroupTable");




        },
        handleItemPress: function (oEvent) {
            var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(2),
                supplierPath = oEvent.getSource().getBindingContext("tableDetailMoves").getPath();

            var objModel = this.getOwnerComponent().getModel("tableDetailMoves").getProperty(supplierPath);


            if (!this._oDialog || this.oDialog === undefined) {
                this._oDialog = sap.ui.xmlfragment("demo.fragments.Exhaustion", this);
            }

            this.getView().addDependent(this._oDialog);

            // toggle compact style
            jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
            this._oDialog.setModel(new JSONModel(objModel));
            this._oDialog.open();
        },
        handleFullScreen: function () {
            this.bFocusFullScreenButton = true;
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
            this.oRouter.navTo("detailPayPlan",
                { 
                    layout: sNextLayout, 
                    document: this._document, 
                    laufd: this._laufd, 
                    laufi: this._laufi, 
                    zbukr: this._zbukr,
                    lifnr: this._lifnr
                }
            );
        },
        handleExitFullScreen: function () {
            this.bFocusFullScreenButton = true;
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
            this.oRouter.navTo("detailPayPlan",
                { 
                    layout: sNextLayout, 
                    document: this._document, 
                    laufd: this._laufd, 
                    laufi: this._laufi, 
                    zbukr: this._zbukr,
                    lifnr: this._lifnr
                }
            );
        },
        handleClose: function () {
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
            this.oRouter.navTo("masterPayPlan", { layout: sNextLayout });
        },
        _onDocumentMatched: function (oEvent) {
            this._document = oEvent.getParameter("arguments").document || this._document || "0",
                this._laufd = oEvent.getParameter("arguments").laufd || this._laufd || "0",
                this._laufi = oEvent.getParameter("arguments").laufi || this._laufi || "0",
                this._zbukr = oEvent.getParameter("arguments").zbukr || this._zbukr || "0",
                this._lifnr = oEvent.getParameter("arguments").lifnr || this._lifnr || "0";

            this._laufd = this._laufd.replaceAll("-", "");

            var url = "EPPHDRSet?$expand=EDETNAV,EGRPNAV&$filter=IOption eq '1' and Lifnr eq '" + this._lifnr + "'"
                + " and Vblnr eq '" + this._document + "'"
                + " and Laufd eq '" + this._laufd + "'"
                + " and Laufi eq '" + this._laufi + "'"
                + " and Zbukr eq '" + this._zbukr + "'";

            var dueModel = oModel.getJsonModel(url);

            var ojbResponse = dueModel.getProperty("/results/0");
            //console.log(dueModel);

            this.getOwnerComponent().setModel(new JSONModel(ojbResponse),
                "payPlanDetail");

            this.paginate("payPlanDetail", "/EDETNAV", 1, 0);

            this.searchDataPartidas();
        },
        formatSatusOrder: function (status) {
            if (status) {
                return 'Cerrado';
            } else {
                return 'Abierto';
            }
        },
        onCloseDialog: function () {
            if (this._oDialog) {
                this._oDialog.destroy();
                this._oDialog = null;
            }
        },
        onExit: function () {
            this.onCloseDialog();
        },
        buildExcel: function(){
            var texts = this.getOwnerComponent().getModel("appTxts");
            let Encabezado = this.getOwnerComponent().getModel("payPlanDetail");

            var columns = [
                {
                    name: texts.getProperty("/plan.paymentDocUPC"),
                    template: {
                        content: Encabezado.getProperty("/Vblnr")
                    }
                },
                {
                    name: texts.getProperty("/plan.societyUPC"),
                    template: {
                        content: Encabezado.getProperty("/Zbukr")
                    }
                },             
                {
                    name: texts.getProperty("/plan.societyUPC"),
                    template: {
                        content: Encabezado.getProperty("/Butxt")
                    }
                },
                {
                    name: texts.getProperty("/plan.amountUPC"),
                    template: {
                        content: Encabezado.getProperty("/Rwbtr")
                    }
                },
                {
                    name: texts.getProperty("/plan.paymentDateUPC"),
                    template: {
                        content: Encabezado.getProperty("/Valut")
                    }
                },
                {
                    name: texts.getProperty("/global.exerciseUPC"),
                    template: {
                        content: Encabezado.getProperty("/Gjahr")
                    }
                },
                {
                    name: texts.getProperty("/plan.supplierUPC"),
                    template: {
                        content: Encabezado.getProperty("/Lifnr")
                    }
                },
                {
                    name: texts.getProperty("/plan.totalAmountUPC"),
                    template: {
                        content: Encabezado.getProperty("/Tfactura")
                    }
                },
                {
                    name: texts.getProperty("/plan.docCountUPC"),
                    template: {
                        content: Encabezado.getProperty("/Cfactura")
                    }
                },
                {
                    name: texts.getProperty("/plan.documentsUPC"),
                    template: {
                        content: "{Blnr}"
                    }
                },
                {
                    name: texts.getProperty("/plan.descriptionUPC"),
                    template: {
                        content: "{Ltext}"
                    }
                },                
                {
                    name: texts.getProperty("/plan.referenceUPC"),
                    template: {
                        content: "{Xref3}"
                    }
                },
                {
                    name: texts.getProperty("/plan.quantityUPC"),
                    template: {
                        content: "{Wrbtr}"
                    }
                },               
                {
                    name: texts.getProperty("/global.currencyUC"),
                    template: {
                        content: "{Waers}"
                    }
                },             

                {
                    name: texts.getProperty("/plan.invoiceNumUPC"),
                    template: {
                        content: "{Xblnr}"                       
                    }
                },
                {
                    name: texts.getProperty("/plan.dateDocUPC"),
                    template: {
                        content: "{Budat}"
                    }
                }                               
            ];

            this.exportxls('payPlanDetail', '/EDETNAV/results', columns);
        },
        generateFile : function(oEvent){
            

            let posicion = oEvent.getSource().getBindingContext("payPlanDetail").getPath().split("/").pop();
            let results = this.getOwnerComponent().getModel("payPlanDetail").getProperty("/EDETNAV/Paginated/results");
            
            let registro = results[posicion];

            let Laufd = String(registro.Laufd).replace(/-/g,"");

            let url = `EPPHDRSet?$expand=EDTLHDR,ECABCNV,EDETCNV&$filter=IOption eq '2' and 
            Zbukr  eq '${registro.Zbukr}' and  
            Lifnr  eq '${registro.Lifnr}' and 
            Gjahr  eq '${registro.Gjahr}' and 
            Laufd  eq '${Laufd}' and 
            Laufi  eq '${registro.Laufi}' and 
            Belnr  eq '${registro.Blnr}' and 
            Vblnr  eq '${registro.Vblnr}'&$format=json`;


            //let oODataJSONModel = this.getOdata(sUri);

            //let oDataJSONModel = this.getOdataJsonModel( url, oODataJSONModel );
            var dueModel = oModel.getJsonModel(url);
            

			//let dataJSON = oDataJSONModel.getJSON();
            let Datos = dueModel.getProperty('/results');
            
            

            let Encabezado = Datos[0].EDTLHDR.results;
            let Totales = Datos[0].ECABCNV.results;
            let Impuestos = Datos[0].EDETCNV.results;
            /*let FacturasProveedor = Datos.results[0].ETXTFACTPROVNAV.results;
            let FacturasSoriana = Datos.results[0].ETXTFACTSORNAV.results;
            let Descuentos = Datos.results[0].ETXTDISCOUNTNAV.results;
            let Agreement = Datos.results[0].ETXTAGREEMENTNAV.results;*/


            let aArchivo = [];
            
            aArchivo = aArchivo.concat( this.generaRenglonesArchivo(Encabezado) );
            aArchivo = aArchivo.concat( this.generaRenglonesArchivo(Totales) );
            aArchivo = aArchivo.concat( this.generaRenglonesArchivo(Impuestos) );
            
            /*aArchivo = aArchivo.concat( this.generaRenglonesArchivo(FacturasSoriana) )
            aArchivo = aArchivo.concat( this.generaRenglonesArchivo(Descuentos) )
            aArchivo = aArchivo.concat( this.generaRenglonesArchivo(Agreement) )*/

            

            let ContenidoArchivo = aArchivo.join("\n");

            let nombreArchivo = registro.Blnr;//String( registro.Bukrs +"_"+ registro.Gjahr + "_" + registro.Vblnr + " -Comp Pago" );
            
            

            sap.ui.core.util.File.save(ContenidoArchivo, nombreArchivo, "txt", "text/plain", "utf-8", false );
        },
        generaRenglonesArchivo: function( Array ){

            let renglones = [];

            for (let i = 0; i < Array.length; i++) 
                renglones.push( Object.values(Array[i]).slice(1).join('\t') );

            return renglones;
        },



        /**HANDLE FUTUROS PAGOS  */

        		/** HANDLE DATA CALL METHODS*/
		searchDataPartidas: function () {

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

			let Detalles = [...TDatos.results[0].Oitms.results];

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


			var groupedMovs = this.groupArrayOfObjects(auxArray, "FechaTesoreria");
			var nestedMovs = []

			var me = this;

            var acumulado = 0;
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

                acumulado=acumulado+Math.abs(cost)
                console.log(me.truncate(acumulado,2))

				nestedMovs.push({
					"name": x,
					"totalRegs": groupedMovs[x].length,
					"totalDebit": Math.abs(result),
					"totalCredit": Math.abs(resultCredit),
					"cost": Math.abs(cost),
					"positions": groupedMovs[x],
                    "costoAcumulado": me.truncate(acumulado,2)

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
				text: "Fecha de Corte",
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
				this._oTable.setMode("None");
				//  this.byId("weightColumn").setVisible(true);
				// this.byId("dimensionsColumn").setVisible(true);


                /*
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

				*/




			} else {
				this._oTable.setMode("SingleSelectMaster");

			/*
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

*/



			}

			// Set the new aggregation
			console.log('SET agregation spath', sPath)

			//   var tableModel = this.getOwnerComponent().getModel("GroupedTotales")
			//    this._oTable.setModel(tableModel)
			this._pTemplate.then(function (oTemplate) {

				this._oTable.bindAggregation("items", sPath, oTemplate);

			}.bind(this));

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







    });
});
