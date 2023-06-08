
sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "demo/controllers/BaseController",
    "sap/m/MessageBox",
    "sap/m/PDFViewer",
    "sap/ui/core/routing/History",
    "sap/ui/core/routing/Router",
], function (JSONModel, Controller, MessageBox, PDFViewer, History, Router) {
    "use strict";

    var oModel = new this.ACEscalas();
    return Controller.extend("demo.controllers.acuerdosEscalas.summarizedEscalas", {
        onInit: function () {
            
            this.oRouter = this.getOwnerComponent().getRouter();
			this.oModel = this.getOwnerComponent().getModel();

			this.oRouter.getRoute("summarizedEscalas").attachPatternMatched(this._onDocumentMatched, this);

            this.getView().addEventDelegate({
                onAfterShow: function (oEvent) {
                    var barModel = this.getOwnerComponent().getModel();
                    barModel.setProperty("/barVisible", true);
                    this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(), "EscalasDta");
                }
            }, this);
            this.configFilterLanguage(this.getView().byId("filterBar"));
        },

        handleFullScreen: function () {
            
			this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
			this.oRouter.navTo("summarizedEscalas", 
                {
                    layout: sNextLayout, 
                    bukrs: this._bukrs,
                    belnr: this._belnr,
                    gjahr: this._gjahr,
                    lifnr: this._lifnr
                }
            );
		},

		handleExitFullScreen: function () {
			this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
			this.oRouter.navTo("summarizedEscalas", 
                {
                    layout: sNextLayout, 
                    bukrs: this._bukrs,
                    belnr: this._belnr,
                    gjahr: this._gjahr,
                    lifnr: this._lifnr
                }
            );
		},

		handleClose: function () {
			
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
            sNextLayout = sap.f.LayoutType.TwoColumnsMidExpanded;
			this.oRouter.navTo("masterEscalas",
            {
                layout: sNextLayout,
                bukrs: this._bukrs,
                belnr: this._belnr,
                gjahr: this._gjahr,
                lifnr: this._lifnr

            }, true);
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

                var url = "ScaleByForumSet?$filter=bukrs eq '" + sociedad + "' and belnr eq '" + documento +
                          "' and gjahr eq '" + ejercicio + "' and lifnr eq '" + vLifnr + "'";

                this.getView().byId('tableEscalas').setBusy(true);
                oModel.getJsonModelAsync(
                    url,
                    function (jsonModel, parent) {
                        var objResponse = jsonModel.getProperty("/results");

                        if (objResponse != null) {
                            //if (objResponse.length > 0) {
                                
                                var totImporte = objResponse.reduce((a, b) => +a + (+b["dmbtr"] || 0), 0);
                                var totDescto = objResponse.reduce((a, b) => +a + (+b["zboni"] || 0), 0);
                                var totIVA = objResponse.reduce((a, b) => +a + (+b["ziva"] || 0), 0);
                                var totIEPS = objResponse.reduce((a, b) => +a + (+b["zieps"] || 0), 0);
                                var TotStot = objResponse.reduce((a, b) => +a + (+b["stotal"] || 0), 0);
                                if (objResponse.length > 0) {
                                var currCode = objResponse[0].waers;
                                }
                                var totalAcuDet = {
                                    "totImporte": Number(totImporte.toFixed(2)),
                                    "TotDescto": Number(totDescto.toFixed(2)),
                                    "totIVA": Number(totIVA.toFixed(2)),
                                    "totIEPS": Number(totIEPS.toFixed(2)),
                                    "TotStot": Number(TotStot.toFixed(2)),
                                    "currCode": currCode
                                };
                                parent.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(totalAcuDet), 
                                    "escalaTotModel");
    
                                parent.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(objResponse),
                                    "EscalasDta");
    
                                parent.paginate("EscalasDta", "/", 1, 0);
                            //}
                        }
                        parent.getView().byId('tableEscalas').setBusy(false);
                    },
                    function (parent) {
                        parent.getView().byId('tableEscalas').setBusy(false);
                    },
                    this
                );
            }

        },

        onExit: function () {

        },

        buildExportTable: function () {            

            var texts = this.getOwnerComponent().getModel("appTxts");
            var columns = [
                {
                    name: texts.getProperty("/ACEscalas.plant"),
                    template: {
                        content: "{werks}"
                    }
                },
                {
                    name: texts.getProperty("/ACEscalas.plantName"),
                    template: {
                        content: "{name}"
                    }
                },
                {
                    name: texts.getProperty("/ACEscalas.amount"),
                    template: {
                        content: "{dmbtr}"
                    }
                },
                {
                    name: texts.getProperty("/ACEscalas.Descount"),
                    template: {
                        content: "{zboni}"
                    }
                },
                {
                    name: texts.getProperty("/ACEscalas.IVA"),
                    template: {
                        content: "{ziva}"
                    }
                },
                {
                    name: texts.getProperty("/ACEscalas.IEPS"),
                    template: {
                        content: "{zieps}"
                    }
                },
                {
                    name: texts.getProperty("/ACEscalas.subtotal"),
                    template: {
                        content: "{stotal}"
                    }
                }

            ];

            this.exportxls('EscalasDta', '/', columns);
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

        _onDocumentMatched: function (oEvent) {
			
            this._bukrs = oEvent.getParameter("arguments").bukrs || this._bukrs || "0";
            this._belnr = oEvent.getParameter("arguments").belnr || this._belnr || "0";
            this._gjahr = oEvent.getParameter("arguments").gjahr || this._gjahr || "0";
            this._lifnr = oEvent.getParameter("arguments").lifnr || this._lifnr || "0";

            var headerDeatil = {
                "bukrs": this._bukrs,
                "belnr": this._belnr,
                "gjahr": this._gjahr,
                "lifnr": this._lifnr
            };

            this.getOwnerComponent().setModel(new JSONModel(headerDeatil), "scalSumModel");

            var url = "ScaleByForumSet?$filter=bukrs eq '" + this._bukrs + "' and belnr eq '" + this._belnr  +
                          "' and gjahr eq '" + this._gjahr + "' and lifnr eq '" + this._lifnr + "'";

            this.getView().byId('tableEscalas').setBusy(true);
            oModel.getJsonModelAsync(
                url,
                function (jsonModel, parent) {
                    var objResponse = jsonModel.getProperty("/results");

                    if (objResponse != null) {
                        //if (objResponse.length > 0) {
                            
                            var totImporte = objResponse.reduce((a, b) => +a + (+b["dmbtr"] || 0), 0);
                            var totDescto = objResponse.reduce((a, b) => +a + (+b["zboni"] || 0), 0);
                            var totIVA = objResponse.reduce((a, b) => +a + (+b["ziva"] || 0), 0);
                            var totIEPS = objResponse.reduce((a, b) => +a + (+b["zieps"] || 0), 0);
                            var TotStot = objResponse.reduce((a, b) => +a + (+b["stotal"] || 0), 0);
                            if (objResponse.length > 0) {
                            var currCode = objResponse[0].waers;
                            }
                            var totalAcuDet = {
                                "totImporte": Number(totImporte.toFixed(2)),
                                "TotDescto": Number(totDescto.toFixed(2)),
                                "totIVA": Number(totIVA.toFixed(2)),
                                "totIEPS": Number(totIEPS.toFixed(2)),
                                "TotStot": Number(TotStot.toFixed(2)),
                                "currCode": currCode
                            };
                            parent.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(totalAcuDet), 
                                "escalaTotModel");

                            parent.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(objResponse),
                                "EscalasDta");

                            parent.paginate("EscalasDta", "/", 1, 0);
                        //}
                    }
                    parent.getView().byId('tableEscalas').setBusy(false);
                },
                function (parent) {
                    parent.getView().byId('tableEscalas').setBusy(false);
                },
                this
            );
		},

        onListItemPress: function (oEvent) {

            var resource = oEvent.getSource().getBindingContext("EscalasDta").getPath(),
                line = resource.split("/").slice(-1).pop();

            var odata = this.getOwnerComponent().getModel("EscalasDta");
            var results = odata.getProperty("/");

            var docResult = results[line]; 

            this.getOwnerComponent().getRouter().navTo("detailEscalasCentro",
                {
                    layout: sap.f.LayoutType.ThreeColumnsEndExpanded,
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