sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "demo/controllers/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "demo/models/formatter",
    "sap/ui/core/date/UI5Date"
], function (Controller, BaseController, JSONModel, Filter, FilterOperator, formatter, UI5Date) {
    "use strict";

    const oCatalog = new this.CatalogosDashboard();
    const oRepGral = new this.ReporteGralDashboard();
    const oRepGpoRes = new this.ReporteGpoResolutor();
    const oRepAvgTime = new this.ReporteAvgTiempo();
    const oRepExecComp = new this.ReporteExecComp();
    const oReporteAclProv = new this.ReporteAclProv();
    const oReporteAnalista = new this.ReporteAnalista();

    var Controller = BaseController.extend("sap.m.sample.SplitApp.C", {

        formatter: formatter,
        iconTabBar: undefined,
        cboxAntiguedad: undefined,
        dateAlta: undefined,
        dateAltaGr: undefined,
        dateAltaAvgT: undefined,
        dateAltaByProv: undefined,
        dateAltaAnalista: undefined,
        cboxTipo: undefined,
        cboxTipoGr: undefined,
        cboxTipoAvgT: undefined,
        cboxTipoExecC: undefined,
        cboxEstatus: undefined,
        cboxEstatusGr: undefined,
        cboxEstatusAvgT: undefined,
        cboxEstatusExecC: undefined,
        cboxGrupoRes: undefined,
        cboxEjercicioExecC: undefined,
        cboxDateIniExecC: undefined,
        cboxDateFinExecC: undefined,
        cboxTipoExecByProv: undefined,
        cboxEstatusByProv: undefined,
        cboxGrupoResAnalista: undefined,
        cboxAnalista: undefined,
        cboxEstatusAnalista: undefined,
        cboxTipoExecAnalista: undefined,
        inptAmountIniProv: undefined,
        inptAmountEndProv: undefined,
        inptCantIniProv: undefined,
        inptCantEndProv: undefined,

        detailData: [],
        detailDataGR: [],
        detailDataAVGT: [],
        detailDataAclProv: [],
        detailDataEC: [],
        detailDataAclAnalista: [],

        donutImporte: undefined,
        donutCantidad: undefined,
        barChar: undefined,
        barCharAvgTRes: undefined,
        barCharAvgTPend: undefined,

        rbg1: undefined,
        rbg2: undefined,

        barsData: undefined,

        onInit: function () {
            var oModel = new JSONModel();
            oModel.setData({
				today: UI5Date.getInstance(new Date())
			});
			this.getView().setModel(oModel);
            var oIconTabBar = this.byId("idIconTabBar");
            oIconTabBar.setHeaderMode("Inline");
            
            this.catalogModel = new sap.ui.model.odata.v2.ODataModel(oCatalog.sUrl);
            this.reporteGral = new sap.ui.model.odata.v2.ODataModel(oRepGral.sUrl);
            this.reporteGpoRes = new sap.ui.model.odata.v2.ODataModel(oRepGpoRes.sUrl);
            this.reporteAvgTime = new sap.ui.model.odata.v2.ODataModel(oRepAvgTime.sUrl);
            this.reporteExecComp = new sap.ui.model.odata.v2.ODataModel(oRepExecComp.sUrl);
            this.reporteAclProv = new sap.ui.model.odata.v2.ODataModel(oReporteAclProv.sUrl);
            this.reporteAnalista = new sap.ui.model.odata.v2.ODataModel(oReporteAnalista.sUrl);

            this.configFilterLanguage(this.getView().byId("filterBar"));
            this.iconTabBar = this.getView().byId("idIconTabBar");
            this.cboxAntiguedad = this.getView().byId("cboxAntiguedad");
            this.cboxTipo = this.getView().byId("cboxTipo");
            this.cboxEstatus = this.getView().byId("cboxEstatus");
            this.dateAlta = this.getView().byId("dateAlta");
            this.donutImporte = this.getView().byId("donutImporte");
            this.donutCantidad = this.getView().byId("donutCantidad");

            this.dateAltaGr = this.getView().byId("dateAltaGR");
            this.cboxTipoGr = this.getView().byId("cboxTipoGR");
            this.cboxEstatusGr = this.getView().byId("cboxEstatusGR");
            this.cboxGrupoRes = this.getView().byId("cboxGrupoRes");

            this.dateAltaAvgT = this.getView().byId("dateAltaAvgT");
            this.cboxTipoAvgT = this.getView().byId("cboxTipoAvgT");
            this.cboxEstatusAvgT = this.getView().byId("cboxEstatusAvgT");

            this.cboxTipoExecC = this.getView().byId("cboxTipoExecC");
            this.cboxEstatusExecC = this.getView().byId("cboxEstatusExecC");
            this.cboxEjercicioExecC = this.getView().byId("cboxEjercicioExecC");

            this.barChar = this.getView().byId("barChar");
            this.barCharAvgTRes = this.getView().byId("barCharAvgTRes");
            this.barCharAvgTPend = this.getView().byId("barCharAvgTPend");

            this.cboxDateIniExecC = this.getView().byId("cboxDateIniExecC");
            this.cboxDateFinExecC = this.getView().byId("cboxDateFinExecC");

            this.rbg1 = this.getView().byId("rbg1");
            this.rbg2 = this.getView().byId("rbg2");

            this.dateAltaByProv = this.getView().byId("dateAltaByProv")
            this.cboxTipoExecByProv = this.getView().byId("cboxTipoExecByProv")
            this.cboxEstatusByProv = this.getView().byId("cboxEstatusByProv")
            this.inptAmountIniProv = this.getView().byId("inptAmountIniProv")
            this.inptAmountEndProv = this.getView().byId("inptAmountEndProv")
            this.inptCantIniProv = this.getView().byId("inptCantIniProv")
            this.inptCantEndProv = this.getView().byId("inptCantEndProv")

            this.dateAltaAnalista = this.getView().byId("dateAltaAnalista")
            this.cboxGrupoResAnalista = this.getView().byId("cboxGrupoResAnalista")
            this.cboxAnalista = this.getView().byId("cboxAnalista")
            this.cboxEstatusAnalista = this.getView().byId("cboxEstatusAnalista")
            this.cboxTipoExecAnalista = this.getView().byId("cboxTipoExecAnalista")

            this.onLoadTiposAclaracion();
            this.onLoadAnalistas();
            this.onLoadGrupos();
        },

        searchData: function () {
            const selectedTab = this.iconTabBar.getSelectedKey();
            switch (selectedTab) {
                case 'repGeneral':
                    this.onGeneralRep();
                    break;
                case 'repSolGroup':
                    this.onSolvGroupRep();
                    break;
                case 'repAvgTime':
                    this.onAvgTimeRep();
                    break;
                case 'repCompExec':
                    this.onExecCompRep();
                    break;
                case 'repAclarProv':
                    this.onAclProvRep();
                    break;
                case 'repAclarAnalyst':
                    this.onAclaAnalistaRep();
                    break;
                default:
                    break;
              }
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

            if (lifnr !== undefined && lifnr !== null && lifnr !== "") {
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
                    if(response.results[0].TOTALESNAV.results.length > 0){
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
                    } else {
                        sap.m.MessageBox.error(that.getOwnerComponent().getModel("appTxts").getProperty("/dashboard.error.data"));
                    }
                }, 
                error: function(error){
                    sap.m.MessageBox.error(that.getOwnerComponent().getModel("appTxts").getProperty("/dashboard.error.dates"));
                }
            });
        },

        onSolvGroupRep: function(){
            var that = this;
            var dateInicial = this.dateAltaGr.getDateValue();
            var dateFinal = this.dateAltaGr.getSecondDateValue();
            var tipo = this.cboxTipoGr.getSelectedKey();
            var estatus = this.cboxEstatusGr.getSelectedKey();
            var grupoRes = this.cboxGrupoRes.getSelectedKey();
            var lifnr = this.getConfigModel().getProperty("/supplierInputKey");
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

            if (tipo !== null && tipo !== "" && tipo !== undefined) {
                aFilters.push(new Filter("Tipo", FilterOperator.EQ, tipo));
            }

            if (estatus !== null && estatus !== "" && estatus !== undefined) {
                aFilters.push(new Filter("Estatus", FilterOperator.EQ, estatus));
            }

            if (grupoRes !== null && grupoRes !== "" && grupoRes !== undefined) {
                aFilters.push(new Filter("Gporesolutor", FilterOperator.EQ, grupoRes));
            }

            if (lifnr !== undefined && lifnr !== null && lifnr !== "") {
                aFilters.push(new Filter("Acreedor", FilterOperator.EQ, lifnr));
            }

            this.reporteGpoRes.read("/DASHMAINSet", {
                method: "GET",
                urlParameters: {
                    "$expand": "TOTALESNAV,DETALLESNAV",
                },
                filters: aFilters,
                success: function(response){
                    if(response.results[0].TOTALESNAV.results.length > 0){
                        var data = response.results[0].TOTALESNAV.results;
                        that.detailDataGR = response.results[0].DETALLESNAV.results;
                        console.log(data)
                        var oModel = new JSONModel({oData: data});
                        that.getView().setModel(oModel, 'GpoResModel');
                    } else {
                        sap.m.MessageBox.error(that.getOwnerComponent().getModel("appTxts").getProperty("/dashboard.error.data"));
                    }
                }, 
                error: function(error){
                    sap.m.MessageBox.error(that.getOwnerComponent().getModel("appTxts").getProperty("/dashboard.error.execute"));
                }
            });
        },

        onAvgTimeRep: function(){
            var that = this;
            var dateInicial = this.dateAltaAvgT.getDateValue();
            var dateFinal = this.dateAltaAvgT.getSecondDateValue();
            var tipo = this.cboxTipoAvgT.getSelectedKey();
            var estatus = this.cboxEstatusAvgT.getSelectedKey();
            var lifnr = this.getConfigModel().getProperty("/supplierInputKey");
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

            if (tipo !== null && tipo !== "" && tipo !== undefined) {
                aFilters.push(new Filter("Tipo", FilterOperator.EQ, tipo));
            }

            if (estatus !== null && estatus !== "" && estatus !== undefined) {
                aFilters.push(new Filter("Estatus", FilterOperator.EQ, estatus));
            }

            if (lifnr !== undefined && lifnr !== null && lifnr !== "") {
                aFilters.push(new Filter("Acreedor", FilterOperator.EQ, lifnr));
            }

            this.reporteAvgTime.read("/DASHMAINSet", {
                method: "GET",
                urlParameters: {
                    "$expand": "TOTALESNAV,DETALLESNAV",
                },
                filters: aFilters,
                success: function(response){
                    if(response.results[0].TOTALESNAV.results.length > 0){
                        var data = response.results[0].TOTALESNAV.results;
                        that.detailDataAVGT = response.results[0].DETALLESNAV.results;
                        var oModel = new JSONModel({oData: data});
                        console.log(data)
                        that.getView().setModel(oModel, 'AvgTimeModel');
                    } else {
                        sap.m.MessageBox.error(that.getOwnerComponent().getModel("appTxts").getProperty("/dashboard.error.data"));
                    }
                }, 
                error: function(error){
                    sap.m.MessageBox.error(that.getOwnerComponent().getModel("appTxts").getProperty("/dashboard.error.execute"));
                }
            });

        },

        onExecCompRep: function(){
            var that = this;
            var lifnr = this.getConfigModel().getProperty("/supplierInputKey");
            var tipo = this.cboxTipoExecC.getSelectedKey();
            var estatus = this.cboxEstatusExecC.getSelectedKey();
            var year = this.cboxEjercicioExecC.getSelectedKey();
            var month1 = this.cboxDateIniExecC.getSelectedKey();
            var month2 = this.cboxDateFinExecC.getSelectedKey();
            var generalStatus = this.rbg1.getSelectedIndex();
            var metrica = this.rbg2.getSelectedIndex()
            var aFilters = [];

            if(year !== undefined && year !== null && year !== "") {
                aFilters.push(new Filter("Ejercicio", FilterOperator.EQ, year));
            } else {
                sap.m.MessageBox.error(that.getOwnerComponent().getModel("appTxts").getProperty("/dashboard.error.year"))
                return
            }

            if(month1 !== undefined && month1 !== null && month1 !== "" &&
                month2 !== undefined && month2 !== null && month2 !== "") {
                aFilters.push(new Filter("Mes", FilterOperator.BT, month1, month2));
            }

            if (lifnr !== undefined && lifnr !== null && lifnr !== "") {
                aFilters.push(new Filter("Acreedor", FilterOperator.EQ, lifnr));
            }

            if (tipo !== null && tipo !== "" && tipo !== undefined) {
                aFilters.push(new Filter("Tipo", FilterOperator.EQ, tipo));
            }

            if (estatus !== null && estatus !== "" && estatus !== undefined) {
                aFilters.push(new Filter("Estatus", FilterOperator.EQ, estatus));
            }

            this.reporteExecComp.read("/DASHMAINSet", {
                method: "GET",
                urlParameters: {
                    "$expand": "TOTALESNAV,DETALLESEJERCICIONAV,DETALLECMPHNAV,DETALLECMPHNAV/DETALLECMPHDETNAV,DETALLECMPHNAV/DETALLECMPHDETNAV/DETALLECMPHDETMESNAV",
                },
                filters: aFilters,
                success: async function(response){
                    console.log(response)
                    if(response.results[0].TOTALESNAV.results.length > 0){
                        var cardsData = response.results[0].TOTALESNAV.results[0];
                        that.barsData = response.results[0].DETALLECMPHNAV.results[generalStatus].DETALLECMPHDETNAV.results;
                        that.detailDataEC = response.results[0].DETALLESEJERCICIONAV.results;
                        that.currentData = that.barsData.filter(item => item.Ejercicio === new Date().getFullYear().toString())[0].DETALLECMPHDETMESNAV.results
                        that.lastData = that.barsData.filter(item => item.Ejercicio !== new Date().getFullYear().toString())[0].DETALLECMPHDETMESNAV.results
                        cardsData.Importepagadasactual = parseFloat(cardsData.Importepagadasactual);
                        cardsData.Importepagadasanterior = parseFloat(cardsData.Importepagadasanterior);
                        cardsData.Importerecibidasactual = parseFloat(cardsData.Importerecibidasactual);
                        cardsData.Importerecibidasanterior = parseFloat(cardsData.Importerecibidasanterior);

                        var cardsModel = new JSONModel(cardsData);
                        that.getView().setModel(cardsModel, 'CardsModelExec');

                        that.currentData = await that.formatData(that.currentData, generalStatus, metrica, that);
                        that.lastData = await that.formatData(that.lastData, generalStatus, metrica, that);

                        var currentModel = new JSONModel({data: that.currentData[0]});
                        that.getView().setModel(currentModel, 'CurrentData1');

                        var currentModel2 = new JSONModel({data: that.currentData[1]});
                        that.getView().setModel(currentModel2, 'CurrentData2');

                        var lastModel = new JSONModel({data: that.lastData[0]});
                        that.getView().setModel(lastModel, 'LastData1');

                        var lastModel = new JSONModel({data: that.lastData[1]});
                        that.getView().setModel(lastModel, 'LastData2');
                    } else {
                        sap.m.MessageBox.error(that.getOwnerComponent().getModel("appTxts").getProperty("/dashboard.error.data"));
                    }
                }, 
                error: function(error){
                    sap.m.MessageBox.error(that.getOwnerComponent().getModel("appTxts").getProperty("/dashboard.error.execute"));
                }
            });
        },

        onAclProvRep: function(){
            var that = this;
            var aFilters = [];
            var lifnr = this.getConfigModel().getProperty("/supplierInputKey");
            var dateInicial = this.dateAltaByProv.getDateValue();
            var dateFinal = this.dateAltaByProv.getSecondDateValue();
            var tipo = this.cboxTipoExecByProv.getSelectedKey();
            var estatus = this.cboxEstatusByProv.getSelectedKey();
            var montoInicial = this.inptAmountIniProv.getValue();
            var montoFinal = this.inptAmountEndProv.getValue();
            var cantidadInicial = this.inptCantIniProv.getValue();
            var cantidadFinal = this.inptCantEndProv.getValue();

            if (
                dateInicial !== "" && dateInicial !== null && dateInicial !== undefined &&
                dateFinal !== "" && dateFinal !== null && dateFinal !== undefined
            ) {
                aFilters.push(new Filter("Fechaalta", FilterOperator.BT, dateInicial, dateFinal));
            } else {
                sap.m.MessageBox.error(that.getOwnerComponent().getModel("appTxts").getProperty("/dashboard.error.dates"))
                return
            }

            if (lifnr !== undefined && lifnr !== null && lifnr !== "") {
                aFilters.push(new Filter("Acreedor", FilterOperator.EQ, lifnr));
            }

            if (tipo !== null && tipo !== "" && tipo !== undefined) {
                aFilters.push(new Filter("Tipo", FilterOperator.EQ, tipo));
            }

            if (estatus !== null && estatus !== "" && estatus !== undefined) {
                aFilters.push(new Filter("Estatus", FilterOperator.EQ, estatus));
            }

            if (montoInicial !== null && montoInicial !== "" && montoInicial !== undefined &&
                montoFinal !== null && montoFinal !== "" && montoFinal !== undefined) {
                    aFilters.push(new Filter("Importe", FilterOperator.BT, montoInicial, montoFinal));
            }

            if (cantidadInicial !== null && cantidadInicial !== "" && cantidadInicial !== undefined &&
                cantidadFinal !== null && cantidadFinal !== "" && cantidadFinal !== undefined) {
                    aFilters.push(new Filter("Cantidad", FilterOperator.BT, cantidadInicial, cantidadFinal));
            }

            this.reporteAclProv.read("/DASHMAINSet", {
                method: "GET",
                urlParameters: {
                    "$expand": "TOTALESNAV,DETALLESNAV",
                },
                filters: aFilters,
                success: function(response){
                    if(response.results[0].TOTALESNAV.results.length > 0){
                        var totales = response.results[0].TOTALESNAV.results;
                        var totalesModel = new JSONModel({oData: totales});
                        that.detailDataAclProv = response.results[0].DETALLESNAV.results;
                        that.getView().setModel(totalesModel, 'TotalesModelProv');
                    } else {
                        sap.m.MessageBox.error(that.getOwnerComponent().getModel("appTxts").getProperty("/dashboard.error.data"));
                    }
                }, 
                error: function(error){
                    sap.m.MessageBox.error(that.getOwnerComponent().getModel("appTxts").getProperty("/dashboard.error.execute"));
                }
            });
        },

        onAclaAnalistaRep: function(){
            var that = this;
            var aFilters = [];
            
            var dateInicial = this.dateAltaAnalista.getDateValue();
            var dateFinal = this.dateAltaAnalista.getSecondDateValue();
            var grupoRes = this.cboxGrupoResAnalista.getSelectedKey();
            var analista = this.cboxAnalista.getSelectedKey();
            var estatus = this.cboxEstatusAnalista.getSelectedKey();
            var tipo = this.cboxTipoExecAnalista.getSelectedKey();

            if (
                dateInicial !== "" && dateInicial !== null && dateInicial !== undefined &&
                dateFinal !== "" && dateFinal !== null && dateFinal !== undefined
            ) {
                aFilters.push(new Filter("Fechaalta", FilterOperator.BT, dateInicial, dateFinal));
            } else {
                sap.m.MessageBox.error(that.getOwnerComponent().getModel("appTxts").getProperty("/dashboard.error.dates"))
                return
            }

            if (grupoRes !== null && grupoRes !== "" && grupoRes !== undefined) {
                aFilters.push(new Filter("Gporesolutor", FilterOperator.EQ, grupoRes));
            }

            if (analista !== null && analista !== "" && analista !== undefined) {
                aFilters.push(new Filter("Analista", FilterOperator.EQ, analista));
            }

            if (estatus !== null && estatus !== "" && estatus !== undefined) {
                aFilters.push(new Filter("Estatus", FilterOperator.EQ, estatus));
            }

            if (tipo !== null && tipo !== "" && tipo !== undefined) {
                aFilters.push(new Filter("Tipo", FilterOperator.EQ, tipo));
            }

            this.reporteAnalista.read("/DASHMAINSet", {
                method: "GET",
                urlParameters: {
                    "$expand": "DETALLESNAV,DETALLESGPONAV",
                },
                filters: aFilters,
                success: function(response){
                    console.log(response)
                    if(response.results[0].DETALLESGPONAV.results.length > 0){
                        var data = response.results[0].DETALLESGPONAV.results;
                        data.forEach((item, index) => {
                            data[index].Totalaclarado = parseFloat(item.Totalaclarado)
                            //data[index].Antiguedad = parseInt(item.Antiguedad)
                        });
                        console.log(data)
                        var dataModel = new JSONModel({oData: data});
                        that.detailDataAclAnalista = response.results[0].DETALLESNAV.results;
                        that.getView().setModel(dataModel, 'AclaracionesAnalista');
                    } else {
                        sap.m.MessageBox.error(that.getOwnerComponent().getModel("appTxts").getProperty("/dashboard.error.data"));
                    }
                }, 
                error: function(error){
                    sap.m.MessageBox.error(that.getOwnerComponent().getModel("appTxts").getProperty("/dashboard.error.execute"));
                }
            });

        },

        formatData: async function(data, estatus, metrica, that){
            var node = "";
            var dataArray = [
                [],
                []
            ];
            if (estatus === 0){
                node = "Totalreclamado"
            } else if (estatus === 1){
                node = "Totalaclarado"
            }

            await data.forEach((item, indx) => {
                let object = {};
                if (metrica === 0){
                    object["valor"] = parseInt(item.Cantidad);
                } else if (metrica === 1){
                    object["valor"] = parseFloat(item[node]);
                }
                object["mes"] = that.formatMonth(item['Mes'])

                if (indx <= 5){
                    dataArray[0].push(object)
                } else {
                    dataArray[1].push(object)
                }
            });

            return dataArray;
        },

        formatMonth: function(mes){
            switch (mes) {
                case "01":
                    return "Enero";
                case "02":
                    return "Febrero";
                case "03":
                    return "Marzo";
                case "04":
                    return "Abril";
                case "05":
                    return "Mayo";
                case "06":
                    return "Junio";
                case "07":
                    return "Julio";
                case "08":
                    return "Agosto";
                case "09":
                    return "Septiembre";
                case "10":
                    return "Octubre";
                case "11":
                    return "Noviembre";
                case "12":
                    return "Diciembre";
            }
        },

        onChangeRadioBtnSelect: function(oEvent){
            this.onExecCompRep();
        },

        downloadExcelGralRep: function(){
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
                    }
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
        },
        
        onDownloadExcelGpoRes: function(){
            if(this.detailDataGR.length > 0){
                var that = this;
                var texts = this.getOwnerComponent().getModel("appTxts");
                //var selectedBars = this.barChar.getSelectedBars();
                var columns = [
                    {
                        label: texts.getProperty("/dashboard.repGeneral.excel.grupo"),
                        property: "Nombregrupo",
                        width: 25
                    },
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
                        label: texts.getProperty("/dashboard.repGpoRes.excel.fechaasignacion"),
                        property: "Fechaasignacion",
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
                        label: texts.getProperty("/dashboard.repGpoRes.excel.folio"),
                        property: "Folio",
                        width: 26
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
                        label: texts.getProperty("/dashboard.repGeneral.excel.estatus"),
                        property: "Estatus",
                        width: 10
                    },
                    {
                        label: texts.getProperty("/dashboard.repGpoRes.excel.analista"),
                        property: "Analista",
                        width: 25
                    },
                    {
                        label: texts.getProperty("/dashboard.repGeneral.excel.diasantiguedad"),
                        property: "Antiguedad",
                        type: sap.ui.export.EdmType.Number,
                        width: 21
                    }
                ];
                /*
                if(selectedBars.length === 0 || selectedBars.length === this.barChar.getBars().length){
                    this.buildExcelSpreadSheet(columns, this.detailDataGR, "Reporte Dashboard Grupo Resolutor.xlsx");
                } else {
                    let dataFiltered = [];
                    selectedBars.forEach(function(bar) {
                        var label = bar.getLabel().split(":")[0]
                        let filteredArray = that.detailDataGR.filter((item) => item.Nombregrupo === label);
                        dataFiltered = dataFiltered.concat(filteredArray);
                    });
                    this.buildExcelSpreadSheet(columns, dataFiltered, "Reporte Dashboard Grupo Resolutor.xlsx");
                }
                */
               this.buildExcelSpreadSheet(columns, this.detailDataGR, "Reporte Dashboard Grupo Resolutor.xlsx");
            } else {
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/dashboard.excel.error.data"));
            }
        },

        onDownloadExcelAvgT: function() {
            if(this.detailDataAVGT.length > 0){
                var that = this;
                var texts = this.getOwnerComponent().getModel("appTxts");
                //let selectedRes = this.barCharAvgTRes.getSelectedBars();
                //let selectedPend = this.barCharAvgTPend.getSelectedBars();
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
                        label: texts.getProperty("/dashboard.repGeneral.excel.fechaalta"),
                        property: "Fechaalta",
                        type: sap.ui.export.EdmType.Date,
                        format: "dddd, d.mmmm yyyy",
                        width: 30
                    },
                    {
                        label: texts.getProperty("/dashboard.repGpoRes.excel.fechaasignacion"),
                        property: "Fechaasignacion",
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
                        label: texts.getProperty("/dashboard.repGeneral.excel.grupo"),
                        property: "Nombregrupo",
                        width: 25
                    },
                    {
                        label: texts.getProperty("/dashboard.repGpoRes.excel.analista"),
                        property: "Analista",
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
                        label: texts.getProperty("/dashboard.repGeneral.excel.diasantiguedad"),
                        property: "Antiguedad",
                        type: sap.ui.export.EdmType.Number,
                        width: 21
                    }
                ];
                this.buildExcelSpreadSheet(columns, this.detailDataAVGT, "Reporte Dashboard Tiempo Promedio de Resolución.xlsx");
                /*
                if( (selectedRes.length === 0 && selectedPend === 0) || 
                    (selectedRes.length === this.barCharAvgTRes.getBars().length && selectedPend.length === this.selectedPend.getBars().length) ) {
                        this.buildExcelSpreadSheet(columns, this.detailDataAVGT, "Reporte Dashboard Tiempo Promedio de Resolución.xlsx");
                } else {
                    let dataFiltered = [];
                    selectedRes.forEach(function(bar) {
                        var tipo = bar.getLabel().split(":")[0]
                        let filteredArray = that.detailDataAVGT.filter((item) => item.Tipo === tipo && item.Estatus === 'H');
                        dataFiltered = dataFiltered.concat(filteredArray);
                    });
                    selectedPend.forEach(function(bar) {
                        var tipo = bar.getLabel().split(":")[0]
                        let filteredArray = that.detailDataAVGT.filter((item) => item.Tipo === tipo && item.Estatus === 'E');
                        dataFiltered = dataFiltered.concat(filteredArray);
                    });
                    this.buildExcelSpreadSheet(columns, dataFiltered, "Reporte Dashboard Tiempo Promedio de Resolución.xlsx");
                }
                */
            } else {
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/dashboard.excel.error.data"));
            }
        },

        onDownloadExcelAclProv: function() {
            if(this.detailDataAclProv.length > 0){
                var texts = this.getOwnerComponent().getModel("appTxts");
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
                        label: texts.getProperty("/dashboard.repGpoRes.excel.folio"),
                        property: "Folio",
                        width: 26
                    },
                    {
                        label: texts.getProperty("/dashboard.repGeneral.excel.fechaalta"),
                        property: "Fechaalta",
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
                        property: "Nombregrupo",
                        width: 25
                    },
                    {
                        label: texts.getProperty("/dashboard.repGpoRes.excel.analista"),
                        property: "Analista",
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
                        property: "Antiguedad",
                        type: sap.ui.export.EdmType.Number,
                        width: 21
                    }
                ];
                this.buildExcelSpreadSheet(columns, this.detailDataAclProv, "Reporte Dashboard Aclaraciones por Proveedor.xlsx");
            } else {
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/dashboard.excel.error.data"));
            }
        },

        onDownloadExcelEjecComp: function() {
            if(this.detailDataEC.length > 0){
                var texts = this.getOwnerComponent().getModel("appTxts");
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
                        label: texts.getProperty("/dashboard.repGeneral.excel.tipo"),
                        property: ["Tipo", "Desctipo"],
                        template: "{0} {1}",
                        width: 26
                    },
                    {
                        label: texts.getProperty("/dashboard.repGeneral.excel.grupo"),
                        property: "Nombregrupo",
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
                        label: texts.getProperty("/dashboard.repGpoRes.table.quantity"),
                        property: "Cantidad",
                        type: sap.ui.export.EdmType.Number,
                        width: 21
                    }
                ];
                this.buildExcelSpreadSheet(columns, this.detailDataEC, "Reporte Dashboard Ejecutivo Comparativo.xlsx");
            } else {
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/dashboard.excel.error.data"));
            }
        },

        downloadExcelAnalista: function(){
            if(this.detailDataAclAnalista.length > 0){
                var texts = this.getOwnerComponent().getModel("appTxts");
                var columns = [
                    {
                        label: texts.getProperty("/dashboard.repGpoRes.excel.folio"),
                        property: "Folio",
                        width: 26
                    },
                    {
                        label: texts.getProperty("/dashboard.repGeneral.excel.fechaalta"),
                        property: "Fechaalta",
                        type: sap.ui.export.EdmType.Date,
                        format: "dddd, d.mmmm yyyy",
                        width: 30
                    },
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
                        label: texts.getProperty("/dashboard.repGeneral.excel.tipo"),
                        property: ["Tipo", "Desctipo"],
                        template: "{0} {1}",
                        width: 26
                    },
                    {
                        label: texts.getProperty("/dashboard.repAclarAnalist.excel.subtotalAclarado"),
                        property: "Subtotalacl",
                        type: sap.ui.export.EdmType.Number,
                        delimiter: true,
                        scale: 2,
                        width: 20
                    },
                    {
                        label: texts.getProperty("/dashboard.repAclarAnalist.excel.ivaAclarado"),
                        property: "Ivaacl",
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
                        label: texts.getProperty("/clarifications.headerAnalyst"),
                        property: "Analista",
                        width: 50
                    },
                    {
                        label: texts.getProperty("/dashboard.repGeneral.excel.grupo"),
                        property: "Nombregrupo",
                        width: 25
                    },
                    {
                        label: texts.getProperty("/dashboard.repGpoRes.excel.fechaasignacion"),
                        property: "Fechaasignacion",
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
                        label: texts.getProperty("/dashboard.repGeneral.excel.diasantiguedad"),
                        property: "Antiguedad",
                        type: sap.ui.export.EdmType.Number,
                        width: 21
                    }
                ];
                this.buildExcelSpreadSheet(columns, this.detailDataAclAnalista, "Reporte Dashboard Aclaraciones por analista.xlsx");
            } else {
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/dashboard.excel.error.data"));
            }
        }
    });
    return Controller;
});