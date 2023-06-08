
sap.ui.define([
    "demo/controllers/BaseController",
    "sap/m/MessageBox",
    "sap/m/PDFViewer",
    "sap/ui/core/routing/History",
    "sap/ui/core/routing/Router",
    //"sap/m/MessageToast"
], function (Controller, MessageBox, PDFViewer, History, Router) {
    "use strict";

    var oModel = new this.ACEscalas();
    return Controller.extend("demo.controllers.acuerdosEscalas.masterEscalas", {
        onInit: function () {
            this._pdfViewer = new PDFViewer();
            this.getView().addDependent(this._pdfViewer);
            
            this.getView().addEventDelegate({
                onAfterShow: function (oEvent) {
                    var barModel = this.getOwnerComponent().getModel();
                    barModel.setProperty("/barVisible", true);
                    this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(), "policyEscalasDta");
                    this.clearFilters();
                }
            }, this);
            this.configFilterLanguage(this.getView().byId("filterBar"));
        },

        searchData: function () {

            var texts = this.getOwnerComponent().getModel("appTxts");
            var textindSoc = texts.getProperty("/ACEscalas.indSoc");
            var textindEje = texts.getProperty("/ACEscalas.indEje");
            var vErrVendor = texts.getProperty("/foliosCap.indVendor");
            var bContinue = true;

            if (!oModel.getModel()) {
                oModel.initModel();
            }

            var sociedad = this.getView().byId('sociedadInput').getValue();
            var documento = this.getView().byId('documentoInput').getValue();
            var ejercicio = this.getView().byId('ejercicioInput').getValue();
            var vLifnr = this.getConfigModel().getProperty("/supplierInputKey");
            
            if ( vLifnr === "" || vLifnr === null || vLifnr==="undefined")  {
                bContinue = false;
                MessageBox.error(vErrVendor);
            } else if ( documento == "" || documento == null ) {
                MessageBox.error(texts.getProperty("/ACEscalas.indNo"));
                bContinue = false;
            } else if ( documento != "" && documento != null ) {
                if ( sociedad == "" || sociedad == null ){
                    MessageBox.error(textindSoc);
                    bContinue = false;
                } else if ( ejercicio == "" || ejercicio == null ) {
                    MessageBox.error(textindEje);
                    bContinue = false;
                }
            }

            if (bContinue) {

                var url = "accPolicySet?$filter=bukrs eq '" + sociedad + "' and belnr eq '" + documento +
                          "' and gjahr eq '" + ejercicio + "' and lifnr eq '" + vLifnr + "'";

                this.getView().byId('tablePolicyEscalas').setBusy(true);
                oModel.getJsonModelAsync(
                    url,
                    function (jsonModel, parent) {
                        var objResponse = jsonModel.getProperty("/results");

                        if (objResponse != null) {

                            var TotBase = objResponse.reduce((a, b) => +a + (+b["dmbtr"] || 0), 0);
                            var totDescto = objResponse.reduce((a, b) => +a + (+b["wrbtr"] || 0), 0);
                            var totIVA = objResponse.reduce((a, b) => +a + (+b["wmwst"] || 0), 0);
                            if (objResponse.length > 0) {
                                var currCode = objResponse[0].waers;
                                var vendorName = objResponse[0].name;
                            }
                            var totalAcuDet = {
                                "totImporte": Number(TotBase.toFixed(2)),
                                "TotDescto": Number(totDescto.toFixed(2)),
                                "TotIVA": Number(totIVA.toFixed(2)),
                                "currCode": currCode,
                                "VendorName": vendorName
                            };
                            parent.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(totalAcuDet), 
                                "policyEscalaTotModel");

                            parent.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(objResponse),
                                "policyEscalasDta");

                            parent.paginate("policyEscalasDta", "/", 1, 0);
                        }
                        parent.getView().byId('tablePolicyEscalas').setBusy(false);
                    },
                    function (parent) {
                        parent.getView().byId('tablePolicyEscalas').setBusy(false);
                    }, this
                );
            }

        },

        onExit: function () {

        },

        clearFilters : function(){
            var d = new Date();
            var currentYear = d.getFullYear();

            this.getView().byId("sociedadInput").setValue("2001");
            this.getView().byId("documentoInput").setValue("");
            this.getView().byId("ejercicioInput").setValue(currentYear);
            var oModel = this.getOwnerComponent().getModel("EscalasDta");
            if (oModel) {
                oModel.setData([]);
            }
        },

        buildExportTable: function () {            

            var texts = this.getOwnerComponent().getModel("appTxts");
            var columns = [
                {
                    name: texts.getProperty("/ACEscalas.polizas.sucursal"),
                    template: {
                        content: "{segment}"
                    }
                },
                {
                    name: texts.getProperty("/ACEscalas.polizas.base"),
                    template: {
                        content: "{dmbtr}"
                    }
                },
                {
                    name: texts.getProperty("/ACEscalas.polizas.desc"),
                    template: {
                        content: "{wrbtr}"
                    }
                },
                {
                    name: texts.getProperty("/ACEscalas.polizas.iva"),
                    template: {
                        content: "{wmwst}"
                    }
                }

            ];

            this.exportxls('policyEscalasDta', '/', columns);
        },

        onClose: function (){
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("", true);
            }
        },

        onSummarizedScale: function () {

            var sociedad = this.getView().byId('sociedadInput').getValue();
            var documento = this.getView().byId('documentoInput').getValue();
            var ejercicio = this.getView().byId('ejercicioInput').getValue();

            var odata = this.getOwnerComponent().getModel("policyEscalasDta");
            var results = odata.getProperty("/");
            var docResult = results[0]; 
            if (docResult.lifnr!=="") {
                this.getOwnerComponent().getRouter().navTo("summarizedEscalas",
                    {
                        layout: sap.f.LayoutType.TwoColumnsMidExpanded,
                        bukrs: sociedad,
                        belnr: documento,
                        gjahr: ejercicio,
                        lifnr : docResult.lifnr

                    }, true);
            } else {
                sap.m.MessageToast.show(this.getOwnerComponent().getModel('appTxts').getProperty("/ACEscalas.polizas.nodetailData"));
            }
        },

        onListItemPress: function (oEvent) {

            var resource = oEvent.getSource().getBindingContext("EscalasDta").getPath(),
                line = resource.split("/").slice(-1).pop();

            var odata = this.getOwnerComponent().getModel("EscalasDta");
            var results = odata.getProperty("/");

            var docResult = results[line]; 

            this.getOwnerComponent().getRouter().navTo("detailEscalasCentro",
                {
                    layout: sap.f.LayoutType.TwoColumnsMidExpanded,
                    bukrs: docResult.bukrs,
                    belnr: docResult.belnr,
                    gjahr: docResult.gjahr,
                    lifnr: docResult.lifnr,
                    werks: docResult.werks,
                    name: docResult.name
                }, true);

        },

    });
});