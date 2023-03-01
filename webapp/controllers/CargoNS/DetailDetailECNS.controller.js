sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "demo/controllers/BaseController"
], function (JSONModel, Controller) {
    "use strict";

    var oModel = new this.Acuerdos();
    return Controller.extend("demo.controllers.CargoNS.DetailDetailECNS", {
        onInit: function () {
            var oExitButton = this.getView().byId("exitFullScreenBtn"),
                oEnterButton = this.getView().byId("enterFullScreenBtn");

            this.oRouter = this.getOwnerComponent().getRouter();
            this.oModel = this.getOwnerComponent().getModel();

            this.oRouter.getRoute("detailDetailECNS").attachPatternMatched(this._onDocumentMatched, this);

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

            console.log(this.oModel)
            this.oModel.setProperty("/actionButtonsInfo/midColumn/exitFullScreen", );
        },
        handleItemPress: function (oEvent) {
			/*var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(2),
				supplierPath = oEvent.getSource().getBindingContext("tableItemsCompl").getPath(),
				supplier = supplierPath.split("/").slice(-1).pop();*/

        },
        handleFullScreen: function () {
            console.log("aqu")
            var oFCL = this.getView().getParent().getParent();

			oFCL.setLayout(sap.f.LayoutType.EndColumnFullScreen);
            this.getView().byId("enterFullScreenBtn").setVisible(false)
            this.getView().byId("exitFullScreenBtn").setVisible(true)
            


        /*    this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
            this.oRouter.navTo("detailCargoANS",
                {
                    layout: sap.f.LayoutType.EndColumnFullScreen,
                    sociedad: this._sociedad,
                    documento: this._documento,
                    ejercicio: this._ejercicio,
                    tienda: this._tienda
                }
            );*/
        },
        handleExitFullScreen: function () {
            console.log("aqu2")
         
            var oFCL = this.getView().getParent().getParent();

			oFCL.setLayout(sap.f.LayoutType.ThreeColumnsMidExpanded);
            this.getView().byId("enterFullScreenBtn").setVisible(true)
            this.getView().byId("exitFullScreenBtn").setVisible(false)
            
           /* this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
            console.log(this.oModel)
            this.oRouter.navTo("detailCargoANS",
                {
                    layout: sap.f.LayoutType.TwoColumnsMidExpanded,
                    sociedad: this._sociedad,
                    documento: this._documento,
                    ejercicio: this._ejercicio,
                    tienda: this._tienda
                }
            );*/
        },
       /* handleClose: function () {
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
            this.oRouter.navTo("masterCargoNS", { layout: sNextLayout });
        },*/
        handleClose: function () {
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/endColumn/closeColumn");
            this.oRouter.navTo("detailAcuerdosECNS", { 
                layout: sNextLayout,
                document: this._documento,
				sociedad: this._sociedad,
				ejercicio: this._ejercicio,
                doc: this._documento
            });
        },
        _onDocumentMatched: function (oEvent) {
            console.log(oEvent.getParameter("arguments"))
            this._sociedad = oEvent.getParameter("arguments").sociedad || this._sociedad || "0";
            this._documento = oEvent.getParameter("arguments").document || this._documento || "0";
            this._ejercicio = oEvent.getParameter("arguments").ejercicio || this._ejercicio || "0";
            this._tienda = oEvent.getParameter("arguments").tda || this._tienda || "0";
console.log("1")
            var headerDeatil = {
                "Sociedad": this._sociedad,
                "Documento": this._documento,
                "Ejercicio": this._ejercicio,
                "Tienda": this._tienda
            };
            console.log("2")
            this.getOwnerComponent().setModel(new JSONModel(headerDeatil), "HeadCargoNS");

            var url = "AcuerdosSet?$expand=AcuNivSerDet&$filter=";
            console.log("3")
            url += "Sociedad eq '" + this._sociedad + "'";
            url += " and Documento eq '" + this._documento + "'";
            url += " and Ejercicio eq '" + this._ejercicio + "'";
            url += " and Tienda eq '" + this._tienda + "'";

            this.getView().byId('DetCargoNS').setBusy(true);
            console.log("4")
            oModel.getJsonModelAsync(
                url,
                function (jsonModel, parent) {
                    var objResponse = jsonModel.getProperty("/results/0");

                    if (objResponse != null) {

                        var totCargo = objResponse.AcuNivSerDet.results.reduce((a, b) => +a + (+b["Zboni"] || 0), 0);
                        var totIEPS = objResponse.AcuNivSerDet.results.reduce((a, b) => +a + (+b["Zieps"] || 0), 0);
                        var totIVA = objResponse.AcuNivSerDet.results.reduce((a, b) => +a + (+b["Ziva"] || 0), 0);
                        var totTotal = objResponse.AcuNivSerDet.results.reduce((a, b) => +a + (+b["Total"] || 0), 0);

                        if (objResponse.AcuNivSerDet.results.length > 0) {
                            var totMoneda = objResponse.AcuNivSerDet.results[0].Waers;
                        } else {
                            totMoneda = "MXN";
                        }

                        var totalDetDet = {
                            "TotCargo": Number(totCargo.toFixed(2)),
                            "TotIEPS": Number(totIEPS.toFixed(2)),
                            "TotIVA": Number(totIVA.toFixed(2)),
                            "TotTotal": Number(totTotal.toFixed(2)),
                            "TotMoneda": totMoneda
                        };
                        parent.getOwnerComponent().setModel(new JSONModel(totalDetDet), "TotCargoNS");

                        parent.getOwnerComponent().setModel(new JSONModel(objResponse),
                            "DetCargoNSHdr");
                            console.log("5")
                        parent.paginate("DetCargoNSHdr", "/AcuNivSerDet", 1, 0);
                    }
                    parent.getView().byId('DetCargoNS').setBusy(false);
                },
                function (parent) {
                    parent.getView().byId('DetCargoNS').setBusy(false);
                },
                this
            );
        },
        buildExportTable: function () {            

            var texts = this.getOwnerComponent().getModel("appTxts");
            var columns = [
                 {
                    name: texts.getProperty("/cargoNS.proveedor"),
                    template: {
                        content: "{Lifnr}"
                    }
                },
                {
                    name: texts.getProperty("/cargoNS.referencia"),
                    template: {
                        content: "{Belnr}"
                    }
                },
                {
                    name: texts.getProperty("/cargoNS.pedido"),
                    template: {
                        content: "{Ebeln}"
                    }
                },
                {
                    name: texts.getProperty("/cargoNS.tienda"),
                    template: {
                        content: "{Werks}"
                    }
                },
                {
                    name: texts.getProperty("/cargoNS.sku"),
                    template: {
                        content: "{Matnr}"
                    }
                },
                {
                    name: texts.getProperty("/cargoNS.codigo"),
                    template: {
                        content: "{Ean11}"
                    }
                },
                {
                    name: texts.getProperty("/cargoNS.descripcion"),
                    template: {
                        content: "{Maktx}"
                    }
                },
                {
                    name: texts.getProperty("/cargoNS.cantidad"),
                    template: {
                        content: "{Menge}"
                    }
                },
                {
                    name: texts.getProperty("/cargoNS.bonificacion"),
                    template: {
                        content: "{Zboni}"
                    }
                },
                {
                    name: texts.getProperty("/cargoNS.ieps"),
                    template: {
                        content: "{Zieps}"
                    }
                },
                {
                    name: texts.getProperty("/cargoNS.iva"),
                    template: {
                        content: "{Ziva}"
                    }
                },
                {
                    name: texts.getProperty("/cargoNS.costoNormal"),
                    template: {
                        content: "{Zvkp0}"
                    }
                },
                {
                    name: texts.getProperty("/cargoNS.costoOferta"),
                    template: {
                        content: "{Zpb00}"
                    }
                },
                {
                    name: texts.getProperty("/cargoNS.diferencia"),
                    template: {
                        content: "{Difer}"
                    }
                },
                {
                    name: texts.getProperty("/cargoNS.bitIeps"),
                    template: {
                        content: "{Bieps}"
                    }
                }
            ];

            this.exportxls('DetCargoNSHdr', '/AcuNivSerDet/results', columns);
        }
    });
});