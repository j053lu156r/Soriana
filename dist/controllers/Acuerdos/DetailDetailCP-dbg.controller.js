sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "demo/controllers/BaseController"
], function (JSONModel, Controller) {
    "use strict";

    var oModel = new this.Acuerdos();
    return Controller.extend("demo.controllers.Acuerdos.DetailDetailCP", {
        onInit: function () {
            /*var oExitButton = this.getView().byId("exitFullScreenBtn"),
                oEnterButton = this.getView().byId("enterFullScreenBtn");*/

            this.oRouter = this.getOwnerComponent().getRouter();
            this.oModel = this.getOwnerComponent().getModel();

            this.oRouter.getRoute("detailDetailAcuCP").attachPatternMatched(this._onDocumentMatched, this);

            /*[oExitButton, oEnterButton].forEach(function (oButton) {
                oButton.addEventDelegate({
                    onAfterRendering: function () {
                        if (this.bFocusFullScreenButton) {
                            this.bFocusFullScreenButton = false;
                            oButton.focus();
                        }
                    }.bind(this)
                });
            }, this);*/
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
          /*  this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
            this.oRouter.navTo("detailCargoANS",
                {
                    layout: sNextLayout,
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
          /*  this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
            this.oRouter.navTo("detailCargoANS",
                {
                    layout: sNextLayout,
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
			window.history.go(-1);
		},
		onBack: function () {
			window.history.go(-1);
		},
        _onDocumentMatched: function (oEvent) {
            this._sociedad = oEvent.getParameter("arguments").sociedad || this._sociedad || "0";
            this._documento = oEvent.getParameter("arguments").document || this._documento || "0";
            this._ejercicio = oEvent.getParameter("arguments").ejercicio || this._ejercicio || "0";
            this._tienda = oEvent.getParameter("arguments").tda || this._tienda || "0";

            var headerDeatil = {
                "Sociedad": this._sociedad,
                "Documento": this._documento,
                "Ejercicio": this._ejercicio,
                "Tienda": this._tienda
            };

            this.getOwnerComponent().setModel(new JSONModel(headerDeatil), "acuHeadDetDetModel");

            var url = "AcuerdosSet?$expand=AcuDetDet&$filter=";

            url += "Sociedad eq '" + this._sociedad + "'";
            url += " and Documento eq '" + this._documento + "'";
            url += " and Ejercicio eq '" + this._ejercicio + "'";
            url += " and Tienda eq '" + this._tienda + "'";

            this.getView().byId('AcuerdosDetDet').setBusy(true);
            oModel.getJsonModelAsync(
                url,
                function (jsonModel, parent) {
                    var objResponse = jsonModel.getProperty("/results/0");

                    if (objResponse != null) {

                        var totCompra = objResponse.AcuDetDet.results.reduce((a, b) => +a + (+b["Compra"] || 0), 0);
                        var totDescto = objResponse.AcuDetDet.results.reduce((a, b) => +a + (+b["Descuento"] || 0), 0);
                        var totIVA = objResponse.AcuDetDet.results.reduce((a, b) => +a + (+b["IVA"] || 0), 0);
                        
                        if (objResponse.AcuDetDet.results.length > 0) {
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