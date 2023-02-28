sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "demo/controllers/BaseController"
], function (JSONModel, Controller) {
    "use strict";

    var oModel = new this.Acuerdos();
    return Controller.extend("demo.controllers.Acuerdos.DetailDetailEC", {
        onInit: function () {
            var oExitButton = this.getView().byId("exitFullScreenBtn"),
                oEnterButton = this.getView().byId("enterFullScreenBtn");

            this.oRouter = this.getOwnerComponent().getRouter();
            this.oModel = this.getOwnerComponent().getModel();

            this.oRouter.getRoute("detailDetailAcuEC").attachPatternMatched(this._onDocumentMatched, this);

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
        },
        handleItemPress: function (oEvent) {
			/*var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(2),
				supplierPath = oEvent.getSource().getBindingContext("tableItemsCompl").getPath(),
				supplier = supplierPath.split("/").slice(-1).pop();*/

        },
        handleFullScreen: function () {
            this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/endColumn/fullScreen");
            this.oRouter.navTo("detailDetailAcuEC",
                {
                    layout: sNextLayout,
                    document: this._document,
				    sociedad: this._sociedad,
				    ejercicio: this._ejercicio,
                    doc: this._doc,
                    tda: this._tda
                }
            );
        },
        handleExitFullScreen: function () {
            this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/endColumn/exitFullScreen");
            this.oRouter.navTo("detailDetailAcuEC",
                {
                    layout: sNextLayout,
                    document: this._document,
				    sociedad: this._sociedad,
				    ejercicio: this._ejercicio,
                    doc: this._doc,
                    tda: this._tda
                }
            );
        },
        handleClose: function () {
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/endColumn/closeColumn");
            this.oRouter.navTo("detailAcuerdosAS", { 
                layout: sNextLayout,
                document: this._document,
				sociedad: this._sociedad,
				ejercicio: this._ejercicio,
                doc: this._doc
            });
        },
        _onDocumentMatched: function (oEvent) {

            this._sociedad = oEvent.getParameter("arguments").sociedad || this._sociedad || "0";
            this._document = oEvent.getParameter("arguments").document || this._document || "0";
            this._ejercicio = oEvent.getParameter("arguments").ejercicio || this._ejercicio || "0";
            this._doc = oEvent.getParameter("arguments").doc || this._doc || "0";
            this._tda = oEvent.getParameter("arguments").tda || this._tda || "0";

            var headerDeatil = {
                "Sociedad": this._sociedad,
                "Documento": this._document,
                "Ejercicio": this._ejercicio,
                "Tienda": this._tda
            };

            this.getOwnerComponent().setModel(new JSONModel(headerDeatil), "acuHeadDetDetModel");

            var url = "AcuerdosSet?$expand=AcuDetDet&$filter=";

            url += "Sociedad eq '" + this._sociedad + "'";
            url += " and Documento eq '" + this._document + "'";
            url += " and Ejercicio eq '" + this._ejercicio + "'";
            url += " and Tienda eq '" + this._tda + "'";

            this.getView().byId('AcuerdosDetDet').setBusy(true);
            oModel.getJsonModelAsync(
                url,
                function (jsonModel, parent) {
                    var objResponse = jsonModel.getProperty("/results/0");

                    if (objResponse != null) {

                        var totCompra = objResponse.AcuDetDet.results.reduce((a, b) => +a + (+b["Compra"] || 0), 0);
                        var totDescto = objResponse.AcuDetDet.results.reduce((a, b) => +a + (+b["Descuento"] || 0), 0);
                        var totIVA = objResponse.AcuDetDet.results.reduce((a, b) => +a + (+b["IVA"] || 0), 0);
                        
                        if (objResponse.AcuDetDet.results.lenght > 0) {
                            var totMoneda = objResponse.AcuDetDet.results[0].Waers;
                        } else {
                            totMoneda = "MXN";
                        }
                        
                        var totalDetDet = {
                            "TotCompra": Number(totCompra.toFixed(2)),
                            "TotDescto": Number(totDescto.toFixed(2)),
                            "TotIVA": Number(totIVA.toFixed(2)),
                            "TotMoneda": totMoneda
                        };
                        parent.getOwnerComponent().setModel(new JSONModel(totalDetDet), "acuTotDetDetModel");

                        parent.getOwnerComponent().setModel(new JSONModel(objResponse),
                            "AcuDetDetHdr");

                        parent.paginate("AcuDetDetHdr", "/AcuDetDet", 1, 0);
                    }
                    parent.getView().byId('AcuerdosDetDet').setBusy(false);
                },
                function (parent) {
                    parent.getView().byId('AcuerdosDetDet').setBusy(false);
                },
                this
            );
        },
        buildExportTable: function () {            

            var texts = this.getOwnerComponent().getModel("appTxts");
            var columns = [
                 {
                    name: texts.getProperty("/acuerdos.detConv"),
                    template: {
                        content: "{Convenio}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdos.detCveMov"),
                    template: {
                        content: "{CveMov}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdos.detFolio"),
                    template: {
                        content: "{Folio}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdos.detFact"),
                    template: {
                        content: "{Factura}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdos.detTda"),
                    template: {
                        content: "{Tienda}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdos.detComp"),
                    template: {
                        content: "{Compra}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdos.detDesc"),
                    template: {
                        content: "{Descuento}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdos.detIVA"),
                    template: {
                        content: "{IVA}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdos.detPDesc"),
                    template: {
                        content: "{PDesc}"
                    }
                }
            ];

            this.exportxls('AcuDetDetHdr', '/AcuDetDet/results', columns);
        }
    });
});