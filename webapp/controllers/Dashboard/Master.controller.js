sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "demo/controllers/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "demo/models/formatter",
], function (Controller, BaseController, JSONModel, Filter, FilterOperator, formatter) {
    "use strict";

    var oCatalog = new this.CatalogosDashboard();
    var oRepGral = new this.ReporteGralDashboard();

    var Controller = BaseController.extend("sap.m.sample.SplitApp.C", {

        formatter: formatter,
        cboxAntiguedad: undefined,
        dateAlta: undefined,
        cboxTipo: undefined,
        cboxEstatus: undefined,
        detailData: [],
        donutImporte: undefined,
        donutCantidad: undefined,

        onInit: function () {
            var oIconTabBar = this.byId("idIconTabBar");
            oIconTabBar.setHeaderMode("Inline");
            this.configFilterLanguage(this.getView().byId("filterBar"));
            this.catalogModel = new sap.ui.model.odata.v2.ODataModel(oCatalog.sUrl);
            this.reporteGral = new sap.ui.model.odata.v2.ODataModel(oRepGral.sUrl);
            this.cboxAntiguedad = this.getView().byId("cboxAntiguedad");
            this.cboxTipo = this.getView().byId("cboxTipo");
            this.cboxTipo = this.getView().byId("cboxTipo");
            this.cboxEstatus = this.getView().byId("cboxEstatus");
            this.dateAlta = this.getView().byId("dateAlta");
            this.donutImporte = this.getView().byId("donutImporte");
            this.donutCantidad = this.getView().byId("donutCantidad");
            this.onLoadTiposAclaracion();
            this.onLoadAnalistas();
            this.onLoadGrupos();
            this.onGeneralRep();
        },

        searchData: function () {
            console.log("Generar reporte")
            this.onGeneralRep();
        },

        onLoadTiposAclaracion: function(){
            var that = this;
            this.catalogModel.read("/CATACLARACIONESSet", {
                success: function(response){
                    var tiposModel = new JSONModel({Tipos: response.results});
                    that.getView().setModel(tiposModel, 'TiposAclaracion');
                }, 
                error: function(error){
                    sap.m.MessageBox.error(that.getOwnerComponent().getModel("appTxts").getProperty("/dashboard.catalog.tipos"));
                }
            });
        },

        onLoadAnalistas: function(){
            var that = this;
            this.catalogModel.read("/CATANALISTASSet", {
                success: function(response){
                    var analistasModel = new JSONModel({Analistas: response.results});
                    that.getView().setModel(analistasModel, 'AnalistasModel');
                }, 
                error: function(error){
                    sap.m.MessageBox.error(that.getOwnerComponent().getModel("appTxts").getProperty("/dashboard.catalog.analyst"));
                }
            });
        },

        onLoadGrupos: function(){
            var that = this;
            this.catalogModel.read("/CATRESOLUTORESSet", {
                success: function(response){
                    var gruposModel = new JSONModel({Grupos: response.results});
                    that.getView().setModel(gruposModel, 'GruposModel');
                }, 
                error: function(error){
                    sap.m.MessageBox.error(that.getOwnerComponent().getModel("appTxts").getProperty("/dashboard.catalog.resolutores"));
                }
            });
        },

        onGeneralRep: function(){
            var that = this;
            var lifnr = this.getConfigModel().getProperty("/supplierInputKey");
            var antiguedad = this.cboxAntiguedad.getSelectedKey();
            var dateInicial = this.dateAlta.getDateValue();
            var dateFinal = this.dateAlta.getSecondDateValue();
            var tipo = this.cboxTipo.getSelectedKey();
            var estatus = this.cboxEstatus.getSelectedKey();
            var aFilters = [];

            if (
                dateInicial !== "" && dateInicial !== null && dateInicial !== undefined &&
                dateFinal !== "" && dateFinal !== null && dateFinal !== undefined
            ) {
                aFilters.push(new Filter("Fechaalta", FilterOperator.BT, dateInicial, dateFinal));
            } else {
                sap.m.MessageBox.error(that.getOwnerComponent().getModel("appTxts").getProperty("/dashboard.error.dates"))
                return
            }

            if (lifnr !== undefined) {
                aFilters.push(new Filter("Acreedor", FilterOperator.EQ, lifnr));
            }

            if (antiguedad !== null && antiguedad !== "" && antiguedad !== undefined) {
                aFilters.push(new Filter("Antiguedad", FilterOperator.EQ, antiguedad));
            }

            if (tipo !== null && tipo !== "" && tipo !== undefined) {
                aFilters.push(new Filter("Tipo", FilterOperator.EQ, tipo));
            }

            if (estatus !== null && estatus !== "" && estatus !== undefined) {
                aFilters.push(new Filter("Estatus", FilterOperator.EQ, estatus));
            }
            
            this.reporteGral.read("/DASHMAINSet", {
                method: "GET",
                urlParameters: {
                    "$expand": "TOTALESNAV,DETALLESNAV",
                },
                filters: aFilters,
                success: function(response){
                    let dollarUSLocale = Intl.NumberFormat('en-US');
                    var cardsData = response.results[0].TOTALESNAV.results[0];
                    that.detailData = response.results[0].DETALLESNAV.results;
                    cardsData.Cantpagadas = dollarUSLocale.format(parseFloat(cardsData.Cantpagadas).toFixed(2));
                    cardsData.Cantpendientes = dollarUSLocale.format(parseFloat(cardsData.Cantpendientes).toFixed(2));
                    cardsData.Cantrecibidas = dollarUSLocale.format(parseFloat(cardsData.Cantrecibidas).toFixed(2));
                    cardsData.Cantresueltas = dollarUSLocale.format(parseFloat(cardsData.Cantresueltas).toFixed(2));
                    cardsData.Importepagadas = dollarUSLocale.format(parseFloat(cardsData.Importepagadas).toFixed(2));
                    cardsData.Importependientes = dollarUSLocale.format(parseFloat(cardsData.Importependientes).toFixed(2));
                    cardsData.Importerecibidas = dollarUSLocale.format(parseFloat(cardsData.Importerecibidas).toFixed(2));
                    cardsData.Importeresueltas = dollarUSLocale.format(parseFloat(cardsData.Importeresueltas).toFixed(2));
                    cardsData.Porcentajependientes = parseFloat(cardsData.Porcentajependientes);
                    cardsData.Porcentajeresueltas = parseFloat(cardsData.Porcentajeresueltas);
                    var cardsModel = new JSONModel(cardsData);
                    that.getView().setModel(cardsModel, 'CardsModel');
                }, 
                error: function(error){
                    sap.m.MessageBox.error(that.getOwnerComponent().getModel("appTxts").getProperty("/dashboard.error.dates"));
                }
            });
        },

        onSelectionChanged: function(oEvent){

        },

        downloadExcel: function(){
            if(this.detailData.length > 0){
                var that = this;
                var texts = this.getOwnerComponent().getModel("appTxts");
                var selectedCant = this.donutCantidad.getSelectedSegments();
                var selectedImp = this.donutImporte.getSelectedSegments();
                var filters = [];
                var columns = [
                    {
                        label: texts.getProperty("/dashboard.repGeneral.excel.proveedor"),
                        property: "Proveedor",
                        type: sap.ui.export.EdmType.Number,
                        width: 12
                    },
                    {
                        label: texts.getProperty("/dashboard.repGeneral.excel.razonsocial"),
                        property: "Razonsocial",
                        width: 40
                    },
                    {
                        label: texts.getProperty("/dashboard.repGeneral.excel.fechaalta"),
                        property: "Fechaalta",
                        type: sap.ui.export.EdmType.Date,
                        format: "dddd, d.mmmm yyyy",
                        width: 30
                    },
                    {
                        label: texts.getProperty("/dashboard.repGeneral.excel.fechasolucion"),
                        property: "Fechasolucion",
                        type: sap.ui.export.EdmType.Date,
                        format: "dddd, d.mmmm yyyy",
                        width: 30
                    },
                    {
                        label: texts.getProperty("/dashboard.repGeneral.excel.tipo"),
                        property: ["Tipo", "Desctipo"],
                        template: "{0} {1}",
                        width: 26
                    },
                    {
                        label: texts.getProperty("/dashboard.repGeneral.excel.estatus"),
                        property: "Estatus",
                        width: 10
                    },
                    {
                        label: texts.getProperty("/dashboard.repGeneral.excel.grupo"),
                        property: "Grupo",
                        width: 25
                    },
                    {
                        label: texts.getProperty("/dashboard.repGeneral.excel.totalrecla"),
                        property: "Totalreclamado",
                        type: sap.ui.export.EdmType.Number,
                        delimiter: true,
                        scale: 2,
                        width: 20
                    },
                    {
                        label: texts.getProperty("/dashboard.repGeneral.excel.totalaclarado"),
                        property: "Totalaclarado",
                        type: sap.ui.export.EdmType.Number,
                        delimiter: true,
                        scale: 2,
                        width: 20
                    },
                    {
                        label: texts.getProperty("/dashboard.repGeneral.excel.importepagado"),
                        property: "Importepagado",
                        type: sap.ui.export.EdmType.Number,
                        delimiter: true,
                        scale: 2,
                        width: 20
                    },
                    {
                        label: texts.getProperty("/dashboard.repGeneral.excel.diasantiguedad"),
                        property: "Diasantiguedad",
                        type: sap.ui.export.EdmType.Number,
                        width: 21
                    },
                ];
                if((selectedCant.length === 0 && selectedImp.length === 0) || 
                    (selectedCant.length === 2 && selectedImp.length === 2)){
                    this.buildExcelSpreadSheet(columns, this.detailData, "Reporte Dashboard de Aclaraciones.xlsx");
                } else {
                    const segments = selectedCant.concat(selectedImp);
                    let dataFiltered = [];
                    if (segments.length > 0) {
                        segments.forEach(function(segment) {
                            if(segment.getLabel() === texts.getProperty("/dashboard.card.title.porcetajePend") || 
                                segment.getLabel() === texts.getProperty("/dashboard.card.title.impPend")) {
                                filters.push("E");
                            } else {
                                filters.push("H");
                            }
                        });
                        let unique = [...new Set(filters)];
                        unique.forEach(function(estatus) {
                            let filteredArray = that.detailData.filter((item) => item.Estatus === estatus);
                            dataFiltered = dataFiltered.concat(filteredArray);
                        });
                        if(dataFiltered.length > 0){
                            this.buildExcelSpreadSheet(columns, dataFiltered, "Reporte Dashboard de Aclaraciones.xlsx");
                        } else {
                            sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/dashboard.excel.error.data"));
                        }
                    }
                }
            } else {
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/dashboard.excel.error.data"));
            }
        }
    });
    return Controller;
});