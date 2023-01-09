sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "demo/controllers/BaseController"
], function (JSONModel, Controller) {
    "use strict";

    var oModel = new this.Acuerdos();
    return Controller.extend("demo.controllers.AcuerdosNS.DetailDetail", {
        onInit: function () {
            var oExitButton = this.getView().byId("exitFullScreenBtn"),
                oEnterButton = this.getView().byId("enterFullScreenBtn");

            this.oRouter = this.getOwnerComponent().getRouter();
            this.oModel = this.getOwnerComponent().getModel();

            this.oRouter.getRoute("detailDetailAcuNS").attachPatternMatched(this._onDocumentMatched, this);

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
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
            this.oRouter.navTo("detailDetailAcuNS",
                {
                    layout: sNextLayout,
                    sociedad: this._sociedad,
                    documento: this._documento,
                    ejercicio: this._ejercicio,
                    tienda: this._tienda
                }
            );
        },
        handleExitFullScreen: function () {
            this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
            this.oRouter.navTo("detailDetailAcuNS",
                {
                    layout: sNextLayout,
                    sociedad: this._sociedad,
                    documento: this._documento,
                    ejercicio: this._ejercicio,
                    tienda: this._tienda
                }
            );
        },
        handleClose: function () {
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
            this.oRouter.navTo("masterAcuerdosNS", { layout: sNextLayout });
        },
        _onDocumentMatched: function (oEvent) {
            this._sociedad = oEvent.getParameter("arguments").sociedad || this._sociedad || "0";
            this._documento = oEvent.getParameter("arguments").documento || this._documento || "0";
            this._ejercicio = oEvent.getParameter("arguments").ejercicio || this._ejercicio || "0";
            this._tienda = oEvent.getParameter("arguments").tienda || this._tienda || "0";

            var headerDeatil = {
                "Sociedad": this._sociedad,
                "Documento": this._documento,
                "Ejercicio": this._ejercicio,
                "Tienda": this._tienda
            };

            this.getOwnerComponent().setModel(new JSONModel(headerDeatil), "acuHeadDetDetModel");

            var url = "AcuerdosNSDetSet?$filter=";
                url += "Bukrs eq '" + this._sociedad + "'";
                url += " and Belnr eq '" + this._documento + "'";
                url += " and Gjahr eq '" + this._ejercicio + "'";
                url += " and Werks eq '" + this._tienda + "'";

            this.getView().byId('AcuerdosDetDet').setBusy(true);
            oModel.getJsonModelAsync(
                url,
                function (jsonModel, parent) {
                    var objResponse = jsonModel.getProperty("/results");

                    if (objResponse != null) {

                        var totBase = objResponse.reduce((a, b) => +a + (+b["Base"] || 0), 0);
                        var totDescto = objResponse.reduce((a, b) => +a + (+b["Desct"] || 0), 0);
                        var totIVA = objResponse.reduce((a, b) => +a + (+b["Iva"] || 0), 0);
                        var totIEPS = objResponse.reduce((a, b) => +a + (+b["Impieps"] || 0), 0);

                        var totalDetDet = {
                            "TotBase": Number(totBase.toFixed(2)),
                            "TotDescto": Number(totDescto.toFixed(2)),
                            "TotIVA": Number(totIVA.toFixed(2)),
                            "TotIEPS": Number(totIEPS.toFixed(2))
                        };
                        parent.getOwnerComponent().setModel(new JSONModel(totalDetDet), "acuTotDetDetModel");

                        parent.getOwnerComponent().setModel(new JSONModel(objResponse),
                            "AcuDetDetHdr");

                        //parent.paginate("AcuDetDetHdr", "/AcuDetDet", 1, 0);
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
                    name: texts.getProperty("/acuerdos.sucursal"),
                    template: {
                        content: "{Werks}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdosNS.referencia"),
                    template: {
                        content: "{Refer}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdosNS.proveedor"),
                    template: {
                        content: "{Lifnr}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdos.base"),
                    template: {
                        content: "{Base}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdos.detDesc"),
                    template: {
                        content: "{Desct}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdos.detIVA"),
                    template: {
                        content: "{Iva}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdos.detPDesc"),
                    template: {
                        content: "{Prdes}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdosNS.indIEPS"),
                    template: {
                        content: "{Bitieps}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdosNS.ieps"),
                    template: {
                        content: "{Impieps}"
                    }
                }
            ];

            this.exportxls('AcuDetDetHdr', '/', columns);
        }
    });
});