sap.ui.define([
    "demo/controllers/BaseController",
    "sap/ui/model/json/JSONModel",
    "demo/models/BaseModel",
    'sap/m/Label',
    'sap/m/Link',
    'sap/m/MessageToast',
    'sap/m/Text',
    'sap/ui/core/Fragment'
], function (Controller, JSONModel, BaseModel, Label, Link, MessageToast, Text, Fragment) {
    "use strict";

    var sUri = "/sap/opu/odata/sap/ZOSP_STATEMENT_SRV_01/";
    var dTJSON;
    var fechaAct = new Date();
    return Controller.extend("demo.controllers.Statement.EstadoCuenta", {
        sCollection: "GroupedTotales>/Hierarchy",
        aCrumbs: ["movimientos", "positions"],
        mInitialOrderState: {
            products: {},
            count: 0,
            hasCounts: false
        },


        onInit: function () {


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
                    this.clearFilters();
                    this.getOwnerComponent().setModel(new JSONModel(), "totales");
                    this.getOwnerComponent().setModel(new JSONModel(), "GroupedTotales");


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
                    name: "demo.views.Statement.Row"
                });
            }
            this._oTable = this.byId("idGroupTable");
            this._oTablev2 = this.byId("detailsStatementList");


        },
        searchData: function () {

            let dateRange = this.getView().byId("dateRange");

            //ciltro documento
            let documentoInput = this.getView().byId("Belnr");
            let filterInput = this.getView().byId("filtroBusqueda");

            let proveedor_LIFNR = this.getConfigModel().getProperty("/supplierInputKey");
          console.log(this.byId("supplierInput").getValue())
          console.log(this.byId("supplierInput").getSelectedKey())
          // format[AAAAMMDD] (2020101)
            // let desde_LV_ZDESDE = this.buildSapDate( dateRange.getDateValue()       );
            // format[AAAAMMDD] (2020101)
            // let desde_LV_ZHASTA = this.buildSapDate( dateRange.getSecondDateValue() );


            //tomar valores dummy para hacer al consulta
            let todayDate = new Date();

            // format[AAAAMMDD] (2020101)
            let desde_LV_ZDESDE = '20160219' //this.buildSapDate( todayDate );
            // format[AAAAMMDD] (2020101)
            let desde_LV_ZHASTA = this.buildSapDate(todayDate);


            let doc_BELNR = documentoInput.getValue();

            //checbox validaciones

            let partidasFiltro = this.getView().byId("checkPartidas");

            if (partidasFiltro.getSelected()) {
                partidasFiltro.setSelected(false);
            }


            if (proveedor_LIFNR == null || proveedor_LIFNR == "") {
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/global.supplierSelectError"));
                return false;
            }

            if (desde_LV_ZDESDE == "" || desde_LV_ZHASTA == "") {
                // sap.m.MessageBox.error("Por favor defina el rango de fechas.");
            }



            var filtroBusqueda = filterInput.getSelectedKey()
            var queryFiltro = ""

            if (filtroBusqueda === "") {

                queryFiltro = ''

            } else if (filtroBusqueda === "belnr") {
                queryFiltro = `and belnr eq '${doc_BELNR}' `

            } else if (filtroBusqueda === "xblnr") {
                queryFiltro = `and xblnr eq '${doc_BELNR}' `

            }


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


            TDatos.results[0].periodo = "Del " + this.formatDateTime(dateRange.getDateValue(), 'dd/MM/YYYY') + " al " + this.formatDateTime(dateRange.getSecondDateValue(), 'dd/MM/YYYY');


            var JSONT = $.extend({}, TDatos.results[0]);
            var jsonModelT = new JSONModel();
            jsonModelT.setData(JSONT);


            //filtrar totales y crear modelo grupal

            console.info("agrupando datos", Detalles)
            let auxArray = [...Detalles]


            var groupedMovs = this.groupArrayOfObjects(auxArray, "DescripcionGpo");
            var nestedMovs = []

            var me = this;

            for (let x in groupedMovs) {


                var resultCredit = groupedMovs[x].reduce(function (_this, val) {
                    var current = val.Bschl === "21" ? Number(val.Wrbtr) : 0
                    return _this + current
                }, 0);


                var result = groupedMovs[x].reduce(function (_this, val) {
                    var current = val.Bschl !== "21" ? Number(val.Wrbtr) : 0
                    var total = _this + current
                    return total
                }, 0);


                var agrupado = groupedMovs[x]
                var idGrupo = agrupado[0].IdNumGpo ? agrupado[0].IdNumGpo : ""
                //IdNumGpo
                nestedMovs.push({
                    "IdNumGpo": idGrupo,
                    "name": x,
                    "totalRegs": groupedMovs[x].length,
                    "totalDebit": Math.abs(this.truncate(result, 2)),
                    "totalCredit": Math.abs(this.truncate(resultCredit, 2)),
                    "positions": groupedMovs[x],


                })


            }


            var totalR = nestedMovs.reduce(function (_this, val) {
                var current = Number(val.totalRegs)
                var total = _this + current
                return total
            }, 0);

            var totalD = nestedMovs.reduce(function (_this, val) {
                var current = Number(val.totalDebit)
                var total = _this + current
                return total
            }, 0);

            var totalC = nestedMovs.reduce(function (_this, val) {
                var current = Number(val.totalCredit)
                var total = _this + current
                return total
            }, 0);


            var totalGeneral = me.truncate(totalD, 2) - me.truncate(totalC, 2)

            totalGeneral = totalGeneral - .01
            var jsonModelG = new JSONModel({
                "Hierarchy": {
                    "movimientos": nestedMovs,
                    "totalR": totalR,
                    "totalD": me.truncate(totalD, 2),
                    "totalC": me.truncate(totalC, 2),
                    "totalT": me.truncate(totalGeneral, 2)
                },
                "Bukrs": TDatos.results[0].Bukrs

            });


            this.getOwnerComponent().setModel(jsonModelG, "GroupedTotales");


            this.initTable()

            this.getOwnerComponent().setModel(jsonModelT, "totales");

            this.paginate("totales", "/Detalles", 1, 0);


        },

        searchDataV2: function () {
        
            let dateRange = this.getView().byId("dateRange");

            //ciltro documento
            let documentoInput = this.getView().byId("Belnr");
            let filterInput = this.getView().byId("filtroBusqueda");

            let proveedor_LIFNR = this.getConfigModel().getProperty("/supplierInputKey");
            console.log(proveedor_LIFNR)
            console.log((this.byId("supplierInput").getValue().split("-")[0]).trim())
           if (proveedor_LIFNR=== undefined){
            proveedor_LIFNR=(this.byId("supplierInput").getValue().split("-")[0]).trim()
           }
           console.log(proveedor_LIFNR)
            let todayDate = new Date();

            // format[AAAAMMDD] (2020101)
            let desde_LV_ZDESDE = '20160219' //this.buildSapDate( todayDate );
            // format[AAAAMMDD] (2020101)
            let desde_LV_ZHASTA = this.buildSapDate(todayDate);


            let doc_BELNR = ''//documentoInput.getValue();

            //checbox validaciones

            let partidasFiltro = this.getView().byId("checkPartidas");

            if (partidasFiltro.getSelected()) {
                partidasFiltro.setSelected(false);
            }


            if (proveedor_LIFNR == null || proveedor_LIFNR == "") {
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/global.supplierSelectError"));
                return false;
            }

            if (desde_LV_ZDESDE == "" || desde_LV_ZHASTA == "") {
                // sap.m.MessageBox.error("Por favor defina el rango de fechas.");
            }



            var filtroBusqueda = '' // filterInput.getSelectedKey()
            var queryFiltro = ""




            var auxFilters = [];

            auxFilters.push(new sap.ui.model.Filter({
                path: "Lifnr",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: proveedor_LIFNR
            })

            )

            /*   auxFilters.push(new sap.ui.model.Filter({
                       path: "Datei",
                       operator: sap.ui.model.FilterOperator.EQ,
                       value1: desde_LV_ZDESDE
                   })
   
               )*/

            auxFilters.push(new sap.ui.model.Filter({
                path: "Datei",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: desde_LV_ZHASTA
            })

            )

            if (filtroBusqueda == "") {

                queryFiltro = ''

            } else if (filtroBusqueda == "belnr") {
                // queryFiltro = `and belnr eq '${doc_BELNR}' `
                auxFilters.push(new sap.ui.model.Filter({
                    path: "belnr",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: doc_BELNR
                })

                )

            } else if (filtroBusqueda == "xblnr") {
                // queryFiltro = `and xblnr eq '${doc_BELNR}' `
                auxFilters.push(new sap.ui.model.Filter({
                    path: "xblnr",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: doc_BELNR
                })

                )

            }
            let that = this
            var jsonModelG = new JSONModel();
            var jsonModelT = new JSONModel();
            that.getOwnerComponent().setModel(jsonModelG, "GroupedTotales");
            that.initTable()
            that.getOwnerComponent().setModel(jsonModelT, "totales")


            // let urlParams = `EStmtHdrSet?$expand=Citms,Oitms&$filter= Lifnr eq '${proveedor_LIFNR}' and Datei eq '${desde_LV_ZDESDE}' and Datef eq '${desde_LV_ZHASTA}' ${queryFiltro} &$format=json`;
            //Xblnr

            var model = "ZOSP_STATEMENT_SRV_01";
            var entity = "EStmtHdrSet";
            var expand = ['Oitms'];
            var filter = auxFilters;
            var select = "";
            sap.ui.core.BusyIndicator.show();

           
            this._GetODataV2(model, entity, filter, expand, select).then(function (_GEToDataV2Response) {
                sap.ui.core.BusyIndicator.hide();
                var data = _GEToDataV2Response.data.results;


                let Detalles = [...data[0].Oitms.results];

                var cleanedArray = Detalles.filter(obj => !obj.Belnr.startsWith("58") && !obj.Belnr.startsWith("59"));

                var clanedDateArray = cleanedArray.filter(obj => {
                    // DescripcionGpo: "PAGO FACTURA"
                    //IdNumGpo: "1"
                    //DescTipomov: "PAGO FACTURAS"
                    //IdNumTipomov: "11"

                    if (obj.DescripcionGpo === "") {
                        obj.DescripcionGpo = "AJUSTE DE FACTURAS"
                        obj.IdNumGpo = "9"
                        obj.DescTipomov = "CARGOS DIVERSOS"
                        obj.IdNumTipomov = "65"
                    }

                    const date = new Date(obj.Budat.replace(/-/g, '\/'));


                    return date < new Date()
                });



                data[0].Detalles = {
                    results: [...clanedDateArray]
                };


                var JSONT = $.extend({}, data[0]);
                var jsonModelT = new JSONModel();
                jsonModelT.setData(JSONT);
                //filtrar totales y crear modelo grupal

                let auxArray = [...clanedDateArray]

                var groupedMovs = that.groupArrayOfObjects(auxArray, "DescripcionGpo");
                var nestedMovs = []

                for (let x in groupedMovs) {

                    var resultCredit = groupedMovs[x].reduce(function (_this, val) {
                        var current = val.Bschl === "21" ? Number(val.Wrbtr) : 0
                        var total = _this + current
                        return total
                    }, 0);

                    var result = groupedMovs[x].reduce(function (_this, val) {
                        var current = val.Bschl !== "21" ? Number(val.Wrbtr) : 0
                        var total = _this + current
                        return total
                    }, 0);

                    var agrupado = groupedMovs[x]
                    var idGrupo = agrupado[0].IdNumGpo ? agrupado[0].IdNumGpo : ""
                    //IdNumGpo
                    nestedMovs.push({
                        "IdNumGpo": idGrupo,
                        "name": x,
                        "totalRegs": groupedMovs[x].length,
                        "totalDebit": Math.abs(that.truncate(result, 2)),
                        "totalCredit": Math.abs(that.truncate(resultCredit, 2)),
                        "positions": groupedMovs[x],
                    })
                }

                var totalR = nestedMovs.reduce(function (_this, val) {
                    var current = Number(val.totalRegs)
                    var total = _this + current
                    return total
                }, 0);

                var totalD = nestedMovs.reduce(function (_this, val) {
                    var current = Number(val.totalDebit)
                    var total = _this + current
                    return total
                }, 0);

                var totalC = nestedMovs.reduce(function (_this, val) {
                    var current = Number(val.totalCredit)
                    var total = _this + current
                    return total
                }, 0);


                var totalGeneral = that.truncate(totalD, 2) - that.truncate(totalC, 2)

                totalGeneral = (totalGeneral - .01)


                var jsonModelG = new JSONModel({
                    "Hierarchy": {
                        "movimientos": nestedMovs,
                        "totalR": totalR,
                        "totalD": that.truncate(totalD, 2),
                        "totalC": that.truncate(totalC, 2),
                        "totalT": that.truncate(totalGeneral, 2)
                    },
                    "Bukrs": data[0].Bukrs,
                    "Lifnr": proveedor_LIFNR

                });

                that.getOwnerComponent().setModel(jsonModelG, "GroupedTotales");
                that.initTable()
                that.getOwnerComponent().setModel(jsonModelT, "totales");
                that.paginate("totales", "/Detalles", 1, 0);



            });




            // TDatos.results[0].periodo = "Del " + this.formatDateTime(dateRange.getDateValue(), 'dd/MM/YYYY') + " al " + this.formatDateTime(dateRange.getSecondDateValue(), 'dd/MM/YYYY');



        },



        groupArrayOfObjects: function (list, key) {
            return list.reduce(function (rv, x) {
                (rv[x[key]] = rv[x[key]] || []).push(x);
                return rv;
            }, {});
        },


        searchPartidasAbiertas: function () {

            let dateRange = this.getView().byId("dateRange");

            //ciltro documento
            let documentoInput = this.getView().byId("Belnr");
            let filterInput = this.getView().byId("filtroBusqueda");

            let proveedor_LIFNR = this.getConfigModel().getProperty("/supplierInputKey");
            // format[AAAAMMDD] (2020101)
            // let desde_LV_ZDESDE = this.buildSapDate( dateRange.getDateValue()       );
            // format[AAAAMMDD] (2020101)
            // let desde_LV_ZHASTA = this.buildSapDate( dateRange.getSecondDateValue() );


            //tomar valores dummy para hacer al consulta
            let todayDate = new Date();

            // format[AAAAMMDD] (2020101)
            let desde_LV_ZDESDE = '20160219' //this.buildSapDate( todayDate );
            // format[AAAAMMDD] (2020101)
            let desde_LV_ZHASTA = this.buildSapDate(todayDate);


            let doc_BELNR = documentoInput.getValue();

            //checbox validaciones

            let partidasFiltro = this.getView().byId("checkPartidas");

            if (partidasFiltro.getSelected()) {
                partidasFiltro.setSelected(false);
            }


            if (proveedor_LIFNR == null || proveedor_LIFNR == "") {
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/global.supplierSelectError"));
                return false;
            }

            if (desde_LV_ZDESDE == "" || desde_LV_ZHASTA == "") {
                // sap.m.MessageBox.error("Por favor defina el rango de fechas.");
            }



            var filtroBusqueda = filterInput.getSelectedKey()
            var queryFiltro = ""




            let auxFilters = [];

            auxFilters.push(new sap.ui.model.Filter({
                path: "Lifnr",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: proveedor_LIFNR
            })

            )

            auxFilters.push(new sap.ui.model.Filter({
                path: "Datei",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: desde_LV_ZDESDE
            })

            )

            auxFilters.push(new sap.ui.model.Filter({
                path: "Datei",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: desde_LV_ZHASTA
            })

            )

            if (filtroBusqueda == "") {

                queryFiltro = ''

            } else if (filtroBusqueda == "belnr") {
                // queryFiltro = `and belnr eq '${doc_BELNR}' `
                auxFilters.push(new sap.ui.model.Filter({
                    path: "belnr",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: doc_BELNR
                })

                )

            } else if (filtroBusqueda == "xblnr") {
                // queryFiltro = `and xblnr eq '${doc_BELNR}' `
                auxFilters.push(new sap.ui.model.Filter({
                    path: "xblnr",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: doc_BELNR
                })

                )

            }




            // let urlParams = `EStmtHdrSet?$expand=Citms,Oitms&$filter= Lifnr eq '${proveedor_LIFNR}' and Datei eq '${desde_LV_ZDESDE}' and Datef eq '${desde_LV_ZHASTA}' ${queryFiltro} &$format=json`;
            //Xblnr

            var model = "ZOSP_STATEMENT_SRV_01";
            var entity = "EStmtHdrSet";
            var expand = ['Citms', 'Oitms'];
            var filter = auxFilters;
            var select = "";
            sap.ui.core.BusyIndicator.show();

            let that = this
            this._GetODataV2(model, entity, filter, expand, select).then(function (_GEToDataV2Response) {
                sap.ui.core.BusyIndicator.hide();
                var data = _GEToDataV2Response.data.results;

                console.log(data)
                let Detalles = [...data[0].Citms.results, ...data[0].Oitms.results];

                data[0].Detalles = {
                    results: [...Detalles]
                };


                var JSONT = $.extend({}, data[0]);
                var jsonModelT = new JSONModel();
                jsonModelT.setData(JSONT);
                //filtrar totales y crear modelo grupal

                let auxArray = [...Detalles]

                var groupedMovs = that.groupArrayOfObjects(auxArray, "DescripcionGpo");
                var nestedMovs = []

                for (let x in groupedMovs) {

                    var resultCredit = groupedMovs[x].reduce(function (_this, val) {
                        var current = val.Bschl === "21" ? Number(val.Wrbtr) : 0
                        var total = _this + current
                        return total
                    }, 0);

                    var result = groupedMovs[x].reduce(function (_this, val) {
                        var current = val.Bschl !== "21" ? Number(val.Wrbtr) : 0
                        var total = _this + current
                        return total
                    }, 0);

                    var agrupado = groupedMovs[x]
                    var idGrupo = agrupado[0].IdNumGpo ? agrupado[0].IdNumGpo : ""
                    //IdNumGpo
                    nestedMovs.push({
                        "IdNumGpo": idGrupo,
                        "name": x,
                        "totalRegs": groupedMovs[x].length,
                        "totalDebit": Math.abs(that.truncate(result, 2)),
                        "totalCredit": Math.abs(that.truncate(resultCredit, 2)),
                        "positions": groupedMovs[x],
                    })
                }

                var totalR = nestedMovs.reduce(function (_this, val) {
                    var current = Number(val.totalRegs)
                    var total = _this + current
                    return total
                }, 0);

                var totalD = nestedMovs.reduce(function (_this, val) {
                    var current = Number(val.totalDebit)
                    var total = _this + current
                    return total
                }, 0);

                var totalC = nestedMovs.reduce(function (_this, val) {
                    var current = Number(val.totalCredit)
                    var total = _this + current
                    return total
                }, 0);



                var totalGeneral = that.truncate(totalD, 2) - that.truncate(totalC, 2)

                totalGeneral = totalGeneral - .01

                var jsonModelG = new JSONModel({
                    "Hierarchy": {
                        "movimientos": nestedMovs,
                        "totalR": totalR,
                        "totalD": that.truncate(totalD, 2),
                        "totalC": that.truncate(totalC, 2),
                        "totalT": that.truncate(totalGeneral, 2)
                    },
                    "Bukrs": data[0].Bukrs

                });

                that.getOwnerComponent().setModel(jsonModelG, "GroupedTotales");
                that.initTable()
                that.getOwnerComponent().setModel(jsonModelT, "totales");
                that.paginate("totales", "/Detalles", 1, 0);



            });




            // TDatos.results[0].periodo = "Del " + this.formatDateTime(dateRange.getDateValue(), 'dd/MM/YYYY') + " al " + this.formatDateTime(dateRange.getSecondDateValue(), 'dd/MM/YYYY');



        },

        onTableGrouping: function (oEvent) {
            console.log(oEvent.getSource().getSelected());
            if (!oEvent.getSource().getSelected()) {
                this.searchDataV2();
            } else {
                this.searchPartidasAbiertas();

            }

        },


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


        ///TABLE HELPERS
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

                this._oTable.setMode("None");

                this.byId("statusColumn").setVisible(true);
                this.byId("folioColumn").setVisible(true);
                this.byId("referenceColumn").setVisible(true);

                this.byId("typeDocColumn").setVisible(true);

                this.byId("dateColumn").setVisible(true);
                this.byId("dateVColumn").setVisible(true);

                this.byId("amountColumn").setVisible(true);
                this.byId("mCondicionColumn").setVisible(true);
                this.byId("bloqueoColumn").setVisible(true);
                this.byId("conciliacionColumn").setVisible(false);

                this.byId("tipoMovColumn").setVisible(true);

                //totles
                this.byId("tipoColumn").setVisible(false);

                this.byId("totalRegColumn").setVisible(false);
                this.byId("debitColumn").setVisible(false);
                this.byId("creditColumn").setVisible(false);


                this.byId("verReporteColumn").setVisible(true);

                //folio y sucursal
                this.byId("sucursalColumn").setVisible(true);
                this.byId("folio2Column").setVisible(true);





            } else {
                this._oTable.setMode("SingleSelectMaster");

                this.byId("statusColumn").setVisible(false);
                this.byId("tipoMovColumn").setVisible(false);

                this.byId("folioColumn").setVisible(false);
                this.byId("referenceColumn").setVisible(false);

                this.byId("typeDocColumn").setVisible(false);

                this.byId("dateColumn").setVisible(false);
                this.byId("dateVColumn").setVisible(false);

                this.byId("amountColumn").setVisible(false);
                this.byId("mCondicionColumn").setVisible(false);

                this.byId("bloqueoColumn").setVisible(false);
                this.byId("conciliacionColumn").setVisible(false);

                //totales tipoColumn
                this.byId("tipoColumn").setVisible(true);

                this.byId("totalRegColumn").setVisible(true);
                this.byId("debitColumn").setVisible(true);
                this.byId("creditColumn").setVisible(true);


                this.byId("verReporteColumn").setVisible(false);



                //folio y sucursal
                this.byId("sucursalColumn").setVisible(false);
                this.byId("folio2Column").setVisible(false);

            }

            // Set the new aggregation
            console.log('SET agregation spath', sPath)


            //   var tableModel = this.getOwnerComponent().getModel("GroupedTotales")
            //    this._oTable.setModel(tableModel)


            this._oTablev2.bindRows({
                path: sPath,
            })

            console.log(this._oTablev2)

            this._pTemplate.then(function (oTemplate) {
                var sorter = [new sap.ui.model.Sorter("IdNumGpo")]

                this._oTable.bindAggregation("items", sPath, oTemplate, sorter);


            }.bind(this));


        },

        conceptoSelect: function (oEvent) {

            console.log(
                "on condepto select"
            )
            let sPath = oEvent.getSource().getBindingContext("GroupedTotales").getPath();

            // var sPath = oEvent.getParameter("listItem").getBindingContextPath();

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
                // var bSelected = oEvent.getParameter("selected");
                // oEvent.getParameter("listItems").forEach(function (oItem) {
                //     oSelectionInfo[oItem.getBindingContext().getPath()] = bSelected;
                // });
                //  this._updateOrder(oSelectionInfo);

                console.log('on documnt press', oEvent);
                console.log(sPath)
                //let posicion = oEvent.getSource().getBindingContext("GroupedTotales").getPath().split("/").pop();
                let results = this.getOwnerComponent().getModel("GroupedTotales").getProperty(sPath);


                //            let totalRegistros = parseInt( this.getOwnerComponent().getModel('totales').getProperty('/Detalles/results/length'), 10);

                var sociedad = this.getOwnerComponent().getModel('GroupedTotales').getProperty('/Bukrs')
                // var ejercicio = this.getOwnerComponent().getModel('totales').getProperty('/Gjahr')


                var ejercicio2 = results.Budat
                var ejercicio = ejercicio2.substr(0, 4) ? ejercicio2.substr(0, 4) : ""

                console.log(this.getOwnerComponent().getModel('totales'))
                var tcode = results.Tcode
                console.log(sociedad, ejercicio, tcode)
                var doc = results.Belnr
                var acuerdosTCodes = ['MEB4', 'WLF4', 'MEB2', 'MEB0', 'WLF2', 'ZMMFILACUERDO', 'WFL5']
                var aportacionesTCodes = ['Z_APORTACIONES']


                if ((acuerdosTCodes.includes(tcode) && doc.startsWith('510')) || (tcode == "" && !(doc.startsWith("1700") && results.Xblnr))) {

                    console.log('on detailAcuerdosAS')


                    this.getOwnerComponent().getRouter().navTo("detailAcuerdosAS", {
                        layout: sap.f.LayoutType.MidColumnFullScreen,
                        document: results.Belnr,
                        sociedad: sociedad,
                        ejercicio: ejercicio,
                        doc: results.Xblnr ? results.Xblnr : 'NA',
                        // zbukr: docResult.Zbukr,
                        // lifnr: docResult.Lifnr
                    }, true);

                } else if (aportacionesTCodes.includes(tcode) || (doc.startsWith("1700") && results.Xblnr)) {

                    console.log('on detailAportacionesAS')

                    //camvuar  docuemnto con cual se va consultar

                    if (results.LifnrAportacion !== "") {

                        this.getOwnerComponent().getRouter().navTo("detailAportacionesAS", {
                            layout: sap.f.LayoutType.MidColumnFullScreen,
                            document: results.Xblnr,
                            view: 'EstadoCuenta',
                            //ejercicio: ejercicio,
                            //doc: results.Belnr,
                            // zbukr: docResult.Zbukr,
                            // lifnr: docResult.Lifnr
                        }, true);

                    } else {
                        console.log('sin campo lifnr_aportacion')
                        MessageToast.show("Sin aportación");

                    }



                }


            } else {
                var modelName = "GroupedTotales>"
                var sNewPath = [sPath, this._nextCrumb(sCurrentCrumb)].join("/");

                this._setAggregation(modelName + sNewPath);

                console.log("new spath", sNewPath);
            }
        },


        //HANDLE SELECION  v1 NO SE USA

        ____handleSelection: function (oEvent) {

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
                // var bSelected = oEvent.getParameter("selected");
                // oEvent.getParameter("listItems").forEach(function (oItem) {
                //     oSelectionInfo[oItem.getBindingContext().getPath()] = bSelected;
                // });
                //  this._updateOrder(oSelectionInfo);

                console.log('on documnt press', oEvent);
                console.log(sPath)
                //let posicion = oEvent.getSource().getBindingContext("GroupedTotales").getPath().split("/").pop();
                let results = this.getOwnerComponent().getModel("GroupedTotales").getProperty(sPath);


                //            let totalRegistros = parseInt( this.getOwnerComponent().getModel('totales').getProperty('/Detalles/results/length'), 10);

                var sociedad = this.getOwnerComponent().getModel('GroupedTotales').getProperty('/Bukrs')
                // var ejercicio = this.getOwnerComponent().getModel('totales').getProperty('/Gjahr')


                var ejercicio2 = results.Budat
                var ejercicio = ejercicio2.substr(0, 4) ? ejercicio2.substr(0, 4) : ""

                console.log(this.getOwnerComponent().getModel('totales'))
                var tcode = results.Tcode
                console.log(sociedad, ejercicio, tcode)
                var doc = results.Belnr
                var acuerdosTCodes = ['MEB4', 'WLF4', 'MEB2', 'MEB0', 'WLF2', 'ZMMFILACUERDO', 'WFL5']
                var aportacionesTCodes = ['Z_APORTACIONES']


                if ((acuerdosTCodes.includes(tcode) && doc.startsWith('510')) || (tcode == "" && !(doc.startsWith("1700") && results.Xblnr))) {

                    console.log('on detailAcuerdosAS')


                    this.getOwnerComponent().getRouter().navTo("detailAcuerdosAS", {
                        layout: sap.f.LayoutType.MidColumnFullScreen,
                        document: results.Belnr,
                        sociedad: sociedad,
                        ejercicio: ejercicio,
                        doc: results.Xblnr ? results.Xblnr : 'NA',
                        // zbukr: docResult.Zbukr,
                        // lifnr: docResult.Lifnr
                    }, true);

                } else if (aportacionesTCodes.includes(tcode) || (doc.startsWith("1700") && results.Xblnr)) {

                    console.log('on detailAportacionesAS')

                    //camvuar  docuemnto con cual se va consultar

                    this.getOwnerComponent().getRouter().navTo("detailAportacionesAS", {
                        layout: sap.f.LayoutType.MidColumnFullScreen,
                        document: results.Xblnr,
                        view: 'EstadoCuenta',
                        //ejercicio: ejercicio,
                        //doc: results.Belnr,
                        // zbukr: docResult.Zbukr,
                        // lifnr: docResult.Lifnr
                    }, true);

                }


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


        clearFilters: function () {
            //var fechaInicial = new Date();
            //fechaInicial.setDate(1);

            this.getView().byId("dateRange").setValue('');

        },
        paginar: function (selectedItem) {

            let totalRegistros = parseInt(this.getOwnerComponent().getModel('totales').getProperty('/Detalles/results/length'), 10);
            let valorSeleccinado = parseInt(selectedItem.getKey(), 10);

            // let tablaPrincipal = this.getView().byId("detailsStatementList");
            // tablaPrincipal.setVisibleRowCount(totalRegistros < valorSeleccinado ? totalRegistros : valorSeleccinado);
            this.paginateValue(selectedItem, 'totales', '/Detalles');
        },
        buildExportTable: function () {
            var texts = this.getOwnerComponent().getModel("appTxts");
            var data = this.formatData(this.getOwnerComponent().getModel("totales").getProperty("/Detalles/results"), texts);
            console.log(data)
            var columns = [
                {
                    label: texts.getProperty("/aportaciones.concepto").toUpperCase(),
                    property: ["IdNumTipomov" ,"DescTipomov"],
                    template: "{0} {1}",
                    width: 31
                },
                {
                    label: texts.getProperty("/state.statusUPC").toUpperCase(),
                    property: "status",
                    width: 15
                },
                {
                    label: texts.getProperty("/state.xlsx.folio").toUpperCase(),
                    property: "Folio",
                    width: 15
                },
                {
                    label: texts.getProperty("/state.xlsx.sucursal").toUpperCase(),
                    property: "Sucursal",
                    width: 15
                },
                {
                    label: texts.getProperty("/state.folioUPC").toUpperCase(),
                    property: "Belnr",
                    width: 20
                },
                {
                    label: texts.getProperty("/state.referenceUPC").toUpperCase(),
                    property: "Xblnr",
                    width: 20
                },
                {
                    label: texts.getProperty("/state.typeDocUPC").toUpperCase(),
                    property: "Ltext",
                    width: 22
                },
                {
                    label: texts.getProperty("/state.dateUPC").toUpperCase(),
                    property: "Budat",
                    width: 22
                },
                {
                    label: texts.getProperty("/clarifications.expirationDate").toUpperCase(),
                    property: "FechaTesoreria",
                    width: 22
                },
                {
                    label: texts.getProperty("/state.amount").toUpperCase(),
                    property: "Wrbtr",
                    type: sap.ui.export.EdmType.Number,
                    delimiter: true,
                    scale: 2,
                    width: 15
                },
                {
                    label: texts.getProperty("/reporte.headerTitulo").toUpperCase(),
                    property: "MCondicion",
                    type: sap.ui.export.EdmType.Number,
                    delimiter: true,
                    scale: 2,
                    width: 32
                },
                {
                    label: texts.getProperty("/state.bloqueado").toUpperCase(),
                    property: "DescripcionBloqueo",
                    width: 32
                }
            ];

            this.buildExcelSpreadSheet(columns, data, "Estado de cuenta.xlsx");
        },
        formatData: function(data, texts){
            data.forEach(function(element) {
                if(element.Pendt === true){
                    element.status = texts.getProperty("/state.xlsx.statusPend");
                } else if (element.Belnr === element.Augbl){
                    element.status = texts.getProperty("/state.xlsx.statusPago");
                } else {
                    element.status = texts.getProperty("/state.xlsx.statusCont");
                }

                if(element.MCondicion !== '0.00') {
                    element.MCondicion = "-" + element.MCondicion
                }
            });
            return data;
        },
        onMarkerPress: function (oEvent) {
            // MessageToast.show(oEvent.getParameter("additionalInfo") + "");
        },
        formatDateTime: (oDateTime, outputFormat, inputFormat) => {

            if (!oDateTime instanceof Date && typeof oDateTime !== 'string' && typeof format !== 'string')
                return false;

            let oFormatOptions = {
                format: outputFormat,
                pattern: outputFormat
            };

            let instanceFormatter = sap.ui.core.format.DateFormat.getDateTimeInstance(oFormatOptions);

            if (oDateTime instanceof Date)
                return instanceFormatter.format(oDateTime);

            if (typeof oDateTime == 'string') {
                let oDate;
                switch (String(inputFormat).toLowerCase()) {
                    case 'yyyymmdd':
                        let aFecha = [];
                        aFecha.push(oDateTime.substring(0, 4));
                        aFecha.push(oDateTime.substring(4, 2));
                        aFecha.push(oDateTime.substring(6, 2));
                        oDate = new Date(aFecha[0], aFecha[1], aFecha[2]);
                        break;

                    default:
                        return false;
                        break;
                }

                return instanceFormatter.format(oDate);
            }

        },

        onDocumentDevolucionPress: function (oEvent) {
            var path = oEvent.getSource().getBindingContext("GroupedTotales").getPath();
            let results = this.getOwnerComponent().getModel("GroupedTotales").getProperty(path);

            console.log(results)
            var Lifnr = this.getOwnerComponent().getModel('GroupedTotales').getProperty('/Lifnr')


            this.getOwnerComponent().getRouter().navTo("detailDevoEstadoCuenta", {
                layout: sap.f.LayoutType.MidColumnFullScreen,
                xblnr: results.Foliodescuento,
                lifnr: Lifnr,
                ebeln: results.Ebeln,
             suc: results.Sucursal 
                // lifnr: docResult.Lifnr
            }, true);


        },


        onDocumentPress: function (oEvent) {

            var path = oEvent.getSource().getBindingContext("GroupedTotales").getPath();
            let results = this.getOwnerComponent().getModel("GroupedTotales").getProperty(path);

            

            //nueva funcion apra mostrar detalle

            var sociedad = this.getOwnerComponent().getModel('GroupedTotales').getProperty('/Bukrs')
            // var ejercicio = this.getOwnerComponent().getModel('totales').getProperty('/Gjahr')


            var ejercicio2 = results.Budat
            var ejercicio = ejercicio2.substr(0, 4) ? ejercicio2.substr(0, 4) : ""

            console.log(this.getOwnerComponent().getModel('totales'))
            var tcode = results.Tcode
            console.log(sociedad, ejercicio, tcode)
            var doc = results.Belnr
            var acuerdosTCodes = ['MEB4', 'WLF4', 'MEB2', 'MEB0', 'WLF2', 'ZMMFILACUERDO', 'WFL5']
            var aportacionesTCodes = ['Z_APORTACIONES']
            var boletinVentasTCodes = ['ZMM_ACUERDOS_LIQUI']


            if ((acuerdosTCodes.includes(tcode) && doc.startsWith('510')) || (tcode == "" && !(doc.startsWith("1700") && results.Xblnr))) {

                console.log('on detailAcuerdosAS')


                this.getOwnerComponent().getRouter().navTo("detailAcuerdosAS", {
                    layout: sap.f.LayoutType.MidColumnFullScreen,
                    document: results.Belnr,
                    sociedad: sociedad,
                    ejercicio: ejercicio,
                    doc: results.Xblnr ? results.Xblnr : 'NA',
                    // zbukr: docResult.Zbukr,
                    // lifnr: docResult.Lifnr
                }, true);

            } else if (aportacionesTCodes.includes(tcode) || (doc.startsWith("1700") && results.Xblnr)) {



                console.log('on detailAportacionesAS')

                //camvuar  docuemnto con cual se va consultar

                if (results.LifnrAportacion !== "") {
                    console.log('on detailAportacionesAS1')

                    this.getOwnerComponent().getRouter().navTo("detailAportacionesAS", {
                        layout: sap.f.LayoutType.MidColumnFullScreen,
                        document: results.Xblnr,
                        view: 'EstadoCuenta',
                        //ejercicio: ejercicio,
                        belnr: doc,
                        bukrs: sociedad,
                        gjahr: ejercicio
                    }, true);

                } else {
                   
                    MessageToast.show("Sin detalle");
                }
            } else if ( tcode === 'ZMM_ACUERDOS_LIQUI') {
                console.log('on boletin vtz')

                // navega a pantalla de boltines * revisar condiciones de apertura , conseguir esenarios
                this.getOwnerComponent().getRouter().navTo("BoletinVtaDetailPolizasE", {
                    layout: sap.f.LayoutType.MidColumnFullScreen,
                    //  document: results.Xblnr,
                    document: doc,
                    company: sociedad,
                    year: ejercicio
                }, false);



            } else if (tcode === 'ZFI_INVLOAD') {
console.log("HolaJuan")

           console.log(sociedad)
           console.log(doc)
            this.getOwnerComponent().getRouter().navTo("AcuerdosEC", {
                layout: sap.f.LayoutType.TwoColumnsMidExpanded,
                document: doc,
                sociedad: sociedad
      
            }, true);
        }
        },

        onPress: function (oEvent) {
            console.info(oEvent)
            var path = oEvent.getSource().getBindingContext("GroupedTotales").getPath();
            console.log(path);
            let results = this.getOwnerComponent().getModel("GroupedTotales").getProperty(path);
            let proveedor = this.getConfigModel().getProperty("/supplierInputKey")

            console.log(results);

            if (results.Xblnr == "") {
                return
            }


            var serieOriginal = results.Xblnr
            var serieNonumbers = serieOriginal.replace(/[0-9]/g, '');

            var serie = serieNonumbers.replace('-', '')
            var folio = serieOriginal.replace(/\D/g, '')
            console.log(serieNonumbers)
            console.log(serie)
            console.log(folio)


            this.getOwnerComponent().getRouter().navTo("EstadoCuentaReporte", {
                layout: sap.f.LayoutType.MidColumnFullScreen,
                document: folio,
                proveedor: proveedor,
                serie: serieNonumbers,
                fecha: results.Budat
                // zbukr: docResult.Zbukr,
                // lifnr: docResult.Lifnr
            }, false);
        },
        hasReport: function (mc) {
            return Math.abs(mc) > 0 ? true : false
        },

    });

});
