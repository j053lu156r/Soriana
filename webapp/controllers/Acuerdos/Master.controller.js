sap.ui.define([
    "jquery.sap.global",
    "sap/ui/core/Fragment",
    "demo/controllers/BaseController",
    "sap/m/UploadCollectionParameter",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/ui/core/routing/Router",
    "demo/models/BaseModel",
    'sap/f/library'
], function (jQuery, Fragment, Controller, UploadCollectionParameter, JSONModel, History, fioriLibrary, MessageBox) {
    "use strict";

    var oModel = new this.Acuerdos();
    return Controller.extend("demo.controllers.Acuerdos.Master", {
        onInit: function () {
            /*this._pdfViewer = new PDFViewer();
            this.getView().addDependent(this._pdfViewer);*/
            this.getView().addEventDelegate({
                onAfterShow: function (oEvent) {
                    var barModel = this.getOwnerComponent().getModel();
                    barModel.setProperty("/barVisible", true);
                    this.getOwnerComponent().setModel(new JSONModel(), "3AcuerdosHdr");
                    this.clearFilters();
                }
            }, this);
            this.configFilterLanguage(this.getView().byId("filterBar"));
        },
        searchData: function () {
            var texts = this.getOwnerComponent().getModel("appTxts");
            var bContinue = true;

            if (!oModel.getModel()) {
                oModel.initModel();
            }

            var sociedad = this.getView().byId('sociedadInput').getValue();
            var documento = this.getView().byId('documentoInput').getValue();
            var ejercicio = this.getView().byId('ejercicioInput').getValue();
            var acuerdo = this.getView().byId('acuerdoInput').getValue();

            if ( ( documento == "" || documento == null ) && ( acuerdo == "" || acuerdo == null ) ) {
                MessageBox.error(texts.getProperty("/acuerdos.indNo"));
                bContinue = false;
            } else if ( documento != "" && documento != null ) {
                if ( sociedad == "" || sociedad == null ){
                    MessageBox.error(texts.getProperty("/acuerdos.indSoc"));
                    bContinue = false;
                } else if ( ejercicio == "" || ejercicio == null ) {
                    MessageBox.error(texts.getProperty("/acuerdos.indEje"));
                    bContinue = false;
                }
            } else if ( ( documento != "" && documento != null ) && ( acuerdo != "" && acuerdo != null ) ) {
                MessageBox.error(texts.getProperty("/acuerdos.soloIndNo"));
                bContinue = false;
            }

            if (bContinue) {

                var url = "AcuerdosSet?$expand=AcuerdosDet&$filter=";

                if (documento != "" && documento != null) {
                    url += "Sociedad eq '" + sociedad + "'";
                    url += " and Documento eq '" + documento + "'";
                    url += " and Ejercicio eq '" + ejercicio + "'";
                } else if (acuerdo != "" && acuerdo != null) {
                    url += "Acuerdo eq '" + acuerdo + "'";
                }

                var oModel2 = new sap.ui.model.odata.ODataModel( "/sap/opu/odata/sap/ZOSP_ACUERDOS_SRV",
                                { 
                                    user: 'I_GTQ_PROV' , 
                                    password:'Cotech2021' ,
                                    json: true 
                                });

                var that = this;
                
                that.byId("tableAcuerdos").setBusy(true);

                oModel2.read(url, {
                    success: function(res){
                        var ojbResponse = res.results[0];
                        that.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(ojbResponse),
                            "3AcuerdosHdr");
                        that.paginate("3AcuerdosHdr", "/AcuerdosDet", 1, 0);
                        that.byId("tableAcuerdos").setBusy(false);
                    },
                    error: function(error) {
                        console.log(error);
                        that.byId("tableAcuerdos").setBusy(false);
                    }
                });

                /*var dueModel = oModel.getJsonModel(url);
                var ojbResponse = dueModel.getProperty("/results/0");
                this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(ojbResponse),
                    "3AcuerdosHdr");*/
                
                //this.getView().setModel(new sap.ui.model.json.JSONModel(ojbResponse),"3AcuerdosHdr");
                //this.paginate("3AcuerdosHdr", "/AcuerdosDet", 1, 0);
            }

        },
        onExit: function () {

        },

        clearFilters : function(){
            this.getView().byId("sociedadInput").setValue("");
            this.getView().byId("documentoInput").setValue("");
            this.getView().byId("ejercicioInput").setValue("");
            this.getView().byId("acuerdoInput").setValue("");
            var vModel = this.getView().getModel("3AcuerdosHdr");
            if (vModel) {
                vModel.setData([]);
            }
        },

        buildExportTable: function () {            

            var texts = this.getOwnerComponent().getModel("appTxts");
            var columns = [
                 {
                    name: texts.getProperty("/acuerdos.sucursal"),
                    template: {
                        content: "{Centro}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdos.base"),
                    template: {
                        content: "{Base}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdos.desc"),
                    template: {
                        content: "{Descuento}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdos.iva"),
                    template: {
                        content: "{IVA}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdos.pDesc"),
                    template: {
                        content: "{PDesc}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdos.unidad"),
                    template: {
                        content: "{Unidad}"
                    }
                }
            ];

            this.exportxls('3AcuerdosHdr', '/AcuerdosDet/results', columns);
        }

    });
});