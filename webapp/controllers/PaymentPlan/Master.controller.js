sap.ui.define([
    "jquery.sap.global",
    "sap/ui/core/Fragment",
    "demo/controllers/BaseController",
    "sap/m/UploadCollectionParameter",
    "sap/ui/core/mvc/Controller",
    "sap/m/PDFViewer",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/ui/core/routing/Router",
    "demo/models/BaseModel",
    'sap/f/library'
], function (jQuery, Fragment, Controller, UploadCollectionParameter, History, PDFViewer, JSONModel, fioriLibrary) {
    "use strict";

    var sUri = "/sap/opu/odata/sap/ZOSP_STATEMENT_SRV_01/";
    var dTJSON;
    var fechaAct = new Date();
    var oModel = new this.PaymentPlan();
    return Controller.extend("demo.controllers.PaymentPlan.Master", {

        sCollection: "GroupedTotales>/Hierarchy",
        aCrumbs: ["movimientos", "positions"],
        mInitialOrderState: {
            products: {},
            count: 0,
            hasCounts: false
        },


        onInit: function () {
            this.getView().addEventDelegate({
                onAfterShow: function (oEvent) {
                    var barModel = this.getConfigModel();
                    barModel.setProperty("/barVisible", true);
                    this.getOwnerComponent().setModel(new JSONModel(), "tableItemsPayPlan");
                    this.getView().byId('docno').setValue("");
                    this.getView().byId("datePay").setValue("");
                }
            }, this);

            if (!this._pTemplate) {
                this._pTemplate = Fragment.load({
                    id: this.getView().getId(),
                    name: "demo.views.Statement.Row"
                });
            }
            this._oTable = this.byId("idGroupTable");
        },
        _searchData: function () {
            var bContinue = false;

            if (!oModel.getModel()) {
                oModel.initModel();
            }

            var formater = sap.ui.core.format.DateFormat.getDateTimeInstance({
                parent: "yyyyMMdd"
            });
            var dateRange = this.getView().byId("datePay");

            //Fechas de engrega
            var startDate = this.buildSapDate(dateRange.getDateValue());
            var endDate = this.buildSapDate(dateRange.getSecondDateValue());

            var vLifnr = this.getConfigModel().getProperty("/supplierInputKey");
            // var vBukrs = this.getView().byId('client').getSelectedKey();
            var vVblnr = this.getView().byId('docno').getValue();

            if (vLifnr != null && vLifnr != "") {
                bContinue = true;
            } else {
                sap.m.MessageBox.error("El campo proveedor es obligatorio.");
            }

            if (bContinue) {
                if (vVblnr == "") {
                    if (startDate != "" && endDate != "") {
                        bContinue = true;
                    } else {
                        bContinue = false;
                        sap.m.MessageBox.error("Debe ingresar al menos un criterio de busqueda.");
                    }
                } else {
                    bContinue = true;
                }
            }

            if (bContinue) {

                //

                var url = "/EPPLSTSet?$filter= Ioption eq '2' and Lifnr eq '" + vLifnr + "'";

                if (vVblnr != "") {
                    url += " and Ivblnr eq '" + vVblnr + "'";
                }

                /*    if (vBukrs != "") {
                        url += " and IBukrs eq '" + vBukrs + "'";
                    }*/

                if (startDate != "" && endDate != "") {
                    url += " and Ilaufdi eq '" + startDate + "' and Ilaufdf eq '" + endDate + "'";
                }

                var dueModel = oModel.getJsonModel(url);

                var ojbResponse = dueModel.getProperty("/results");
                //var dueCompModel = ojbResponse.OEKKONAV.results;

                var compFilter = {
                    "TBLPAYS": {
                        "results": []
                    }
                };
                ojbResponse.forEach(function (item) {
                    //if (item.Lifnr === vUserVendor && item.Blart === "KZ") {
                    compFilter.TBLPAYS.results.push(item);
                    //}
                });

                this.getOwnerComponent().setModel(new JSONModel(compFilter),
                    "tableItemsPayPlan");

                this.paginate('tableItemsPayPlan', '/TBLPAYS', 1, 0);
            }
        },
        onExit: function () {

        },
        filtrado: function (evt) {
            var filterCustomer = [];
            var query = evt.getParameter("query");
            var obFiltro = this.getView().byId("selectFilter");
            var opFiltro = obFiltro.getSelectedKey();
            if (query && query.length > 0) {
                var filter = new sap.ui.model.Filter(opFiltro, sap.ui.model.FilterOperator.Contains, query);
                filterCustomer.push(filter);
            }

            var list = this.getView().byId("complPagoList");
            var binding = list.getBinding("items");
            binding.filter(filterCustomer);
        },
        setDaterangeMaxMin: function () {
            var datarange = this.getView().byId('dateRange');
            var date = new Date();
            var minDate = new Date();
            var minConsultDate = new Date();
            minConsultDate.setDate(date.getDate() - 7);
            minDate.setDate(date.getDate() - 30);
            datarange.setSecondDateValue(date);
            datarange.setDateValue(minConsultDate);
        },
        onListItemPress: function (oEvent) {
            var resource = oEvent.getSource().getBindingContext("tableItemsPayPlan").getPath(),
                line = resource.split("/").slice(-1).pop();

            var odata = this.getOwnerComponent().getModel("tableItemsPayPlan");
            var results = odata.getProperty("/TBLPAYS/results");

            var docResult = results[line];

            this.getOwnerComponent().getRouter().navTo("detailPayPlan", {
                layout: sap.f.LayoutType.TwoColumnsMidExpanded,
                document: docResult.Vblnr,
                laufd: docResult.Laufd,
                laufi: docResult.Laufi,
                zbukr: docResult.Zbukr,
                lifnr: docResult.Lifnr
            }, true);
        },




        //handle sech data 
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


			//this.initTable()

			//this.getOwnerComponent().setModel(jsonModelT, "totales");

			//this.paginate("totales", "/Detalles", 1, 0);

		},


        subtractYears: function (numOfYears, date = new Date()) {
            date.setFullYear(date.getFullYear() - numOfYears);
          
            return date;
          },
          
          
           groupArrayOfObjects: function(list, key) {
            return list.reduce(function(rv, x) {
              (rv[x[key]] = rv[x[key]] || []).push(x);
              return rv;
            }, {});
          },
          
          




    });
});