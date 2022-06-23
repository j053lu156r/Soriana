sap.ui.define([
     "sap/ui/core/Fragment",
    "demo/controllers/BaseController",
     "sap/ui/core/routing/History",
    "sap/m/PDFViewer",
    "sap/ui/model/json/JSONModel",
     "sap/ui/core/routing/Router",
    "demo/models/BaseModel",
     "sap/m/Link"
], function ( Fragment, Controller, History, PDFViewer, JSONModel,Router,BaseModel,Link) {
    "use strict";
    var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
        pattern: "YYYY-MM-dd"
    });

    var sUri = "/sap/opu/odata/sap/ZOSP_STATEMENT_SRV_01/";
    var dTJSON;
    var fechaAct = new Date();
    var oModel = new this.PaymentPlan();
    return Controller.extend("demo.controllers.PaymentPlan.Master", {

        sCollection: "GroupedDates>/Hierarchy",
        aCrumbs: ["dates", "positions"],
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
                    name: "demo.views.PaymentPlan.Row"
                });
            }
            this._oTable = this.byId("idGroupTable");
        },
        searchData: function () {
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



                const arr1 = ojbResponse.map(obj => {
                    return {
                        ...obj,
                        date: new Date(obj.Laufd)
                    };
                });


                var sortedAsc = [...arr1].sort(
                    (objA, objB) => Number(objA.date) - Number(objB.date),
                );

                console.log(sortedAsc)

                //se obtiene la fecha limite 

                // 1.- se saca el ltimo registro y se saca el proxmo viernes 

                // var lastDate = sortedAsc.reverse()[0].Laufd;

                // 2.- obtener   ultimo viernes 
                /* si  la ultima fecha de los registros es menor o igual a la fecha de hoy 

                sacar el proximo vienres a partir de la fehca de hoy si es mayor usar la fucnion de obtner viernes 


                */

                //NOTA

                /**Si ya tenog la fhca generar fecha de corte sacando el proximo viernes y generar fecha de corte en base a eso  
                 * 
                 * 
                 * si la fehca de corte es inferiror a la de hoy colocar al proximo viernes como fecha de corte sino al proximo vienes apartir de su fecha 
                 * 
                 */



                //3.- setear fecha de corte en cada registro 

                for (var index in sortedAsc) {

                    var currentDate = new Date()
                    var paymentDate = new Date(sortedAsc[index].Laufd.replace(/-/g, '\/'))
                    console.log("currentDate",currentDate)
                    console.log("paymentDate",paymentDate)

                    var lastNextFriday

                    if(Number(paymentDate)>Number(currentDate)){
                         lastNextFriday = this.getNextDayOfWeek(new Date(sortedAsc[index].Laufd.replace(/-/g, '\/')), 5)
  
                    }else{
                         lastNextFriday = this.getNextDayOfWeek(new Date(), 5)

                    }


                   
                    sortedAsc[index].fechaCorte = dateFormat.format(lastNextFriday)
                }


                //4.- agrupar por fecha de corte 



                var groupedMovs = this.groupArrayOfObjects(sortedAsc, "fechaCorte");
                var nestedMovs = []

                var me = this;

                var acumulado = 0;


                //generar totales 

                for (let x in groupedMovs) {

                    console.log(x)

                    console.log("sumando valores");


                    var cost = groupedMovs[x].reduce(function (_this, val) {
                        var current = Number(val.Rbetr)
                        var total = _this + current
                        return total
                    }, 0);

                    acumulado = acumulado + me.truncate(Math.abs(cost),2)

                    nestedMovs.push({
                        "name": x,
                        "totalRegs": groupedMovs[x].length,
                        "cost": me.truncate(Math.abs(cost), 2),
                        "positions": groupedMovs[x],
                        "costoAcumulado": me.truncate(acumulado, 2)

                    })


                }



                //update model 

                var totalCostos = nestedMovs.reduce(function (_this, val) {
                    var current = Number(val.cost)
                    var total = _this + current
                    return total
                }, 0);




                var jsonModelG = new JSONModel({
                    "Hierarchy": {
                        "dates": nestedMovs,
                        "totalCostos": totalCostos
                    }
                });

                console.log(jsonModelG);

                this.getOwnerComponent().setModel(jsonModelG, "GroupedDates");





                this.initTable()




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



        truncate: function (num, places) {
            return Math.trunc(num * Math.pow(10, places)) / Math.pow(10, places);
        },



        //MANAGE DATES 

        getDaysBetweenDates: function (start, end, dayName) {
            var result = [];
            var days = {
                sun: 0,
                mon: 1,
                tue: 2,
                wed: 3,
                thu: 4,
                fri: 5,
                sat: 6
            };
            var day = days[dayName.toLowerCase().substr(0, 3)];
            var current = new Date(start);
            current.setDate(current.getDate() + (day - current.getDay() + 7) % 7);
            while (current < end) {
                result.push(new Date(+current));
                current.setDate(current.getDate() + 7);
            }
            return result;
        },


        getNextDayOfWeek: function (date, dayOfWeek) {

            var resultDate = new Date(date.getTime());

            resultDate.setDate(date.getDate() + (7 + dayOfWeek - date.getDay()) % 7);

            return resultDate;
        },

        //HANDLE TABLE EVENTS
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


        _setAggregation: function (sPath) {
			// If we're at the leaf end, turn off navigation
			var sPathEnd = sPath.split("/").reverse()[0];
			if (sPathEnd === this.aCrumbs[this.aCrumbs.length - 1]) {
				this._oTable.setMode("None");
				//  this.byId("weightColumn").setVisible(true);
				// this.byId("dimensionsColumn").setVisible(true);
				this._oTable.setMode("SingleSelectMaster");


                
				this.byId("paymentDocColumn").setVisible(true);
				this.byId("clientColumn").setVisible(true);
				this.byId("amountColumn").setVisible(true);
				this.byId("datePayColumn").setVisible(true);

				 
				//totales 
 
				this.byId("dateCorte").setVisible(false);
				this.byId("saldoCorte").setVisible(false);
				this.byId("saldoAcumulado").setVisible(false);
 
				




			} else {
				this._oTable.setMode("SingleSelectMaster");

			
                this.byId("paymentDocColumn").setVisible(false);
				this.byId("clientColumn").setVisible(false);
				this.byId("amountColumn").setVisible(false);
				this.byId("datePayColumn").setVisible(false);
				 
				//totales 
 
				this.byId("dateCorte").setVisible(true);
				this.byId("saldoCorte").setVisible(true);
				this.byId("saldoAcumulado").setVisible(true);
 
				



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
					text: "{GroupedDates>name}",
					press: [sPath + "/" + this.aCrumbs[iCurNodeIndex], this.onBreadcrumbPress, this]
				});

				oLink.bindElement({
					path: "GroupedDates>" + sPath
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

				console.log('on documnt press',oEvent);
				console.log(sPath)
				//let posicion = oEvent.getSource().getBindingContext("GroupedTotales").getPath().split("/").pop();
				let results = this.getOwnerComponent().getModel("GroupedDates").getProperty(sPath);
	
				console.log(results)
				//let registro = results[posicion];
				//console.log(registro)
			
	/*
				 this.getOwnerComponent().getRouter().navTo("detailAcuerdos",
					{
						layout: sap.f.LayoutType.ThreeColumnsEndExpanded,
						document: results.Belnr,
					    sociedad: this._sociedad,
						ejercicio: this._ejercicio,
					    doc: this._document,
					   // zbukr: docResult.Zbukr,
					   // lifnr: docResult.Lifnr
					}, true);
*/

this.getOwnerComponent().getRouter().navTo("detailPayPlan", {
    layout: sap.f.LayoutType.TwoColumnsMidExpanded,
    document: results.Vblnr,
    laufd: results.Laufd,
    laufi: results.Laufi,
    zbukr: results.Zbukr,
    lifnr: results.Lifnr
}, true);


			} else {
				console.log("on grupo seleccionado seleccionado.....")
				var modelName = "GroupedDates>"
				var sNewPath = [sPath, this._nextCrumb(sCurrentCrumb)].join("/");

				this._setAggregation(modelName + sNewPath);

				console.log("new spath", sNewPath);
			}
		}





    });
});