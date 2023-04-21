sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "demo/controllers/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, BaseController, JSONModel, Filter, FilterOperator) {
    "use strict";

    var oCatalog = new this.CatalogosDashboard();
    var oRepGral = new this.ReporteGralDashboard();

    var Controller = BaseController.extend("sap.m.sample.SplitApp.C", {

        cboxAntiguedad: undefined,
        dateAlta: undefined,
        cboxTipo: undefined,
        cboxEstatus: undefined,

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
                    console.log(response)
                    let dollarUSLocale = Intl.NumberFormat('en-US');
                    var cardsData = response.results[0].TOTALESNAV.results[0];
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
                    console.log(cardsData)
                    var cardsModel = new JSONModel(cardsData);
                    that.getView().setModel(cardsModel, 'CardsModel');
                }, 
                error: function(error){
                    sap.m.MessageBox.error(that.getOwnerComponent().getModel("appTxts").getProperty("/dashboard.error.dates"));
                }
            });
        },
    });
    return Controller;
});