sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "demo/controllers/BaseController"
], function (JSONModel, Controller) {
    "use strict";

    var oModel = new this.Acuerdos();
    return Controller.extend("demo.controllers.AcuerdosHNS.Detail", {
        onInit: function () {
            var oExitButton = this.getView().byId("exitFullScreenBtn"),
                oEnterButton = this.getView().byId("enterFullScreenBtn");

            this.oRouter = this.getOwnerComponent().getRouter();
            this.oModel = this.getOwnerComponent().getModel();

            this.oRouter.getRoute("detailAcuerdosHNS").attachPatternMatched(this._onDocumentMatched, this);

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
			

        },
        handleFullScreen: function () {
            this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
            this.oRouter.navTo("detailAcuerdosHNS",
                {
                    layout: sNextLayout,
                    proveedor: this._proveedor,
                    ref1: this._ref1,
                    ref2: this._ref2,
                    centro: this._centro
                }
            );
        },
        handleExitFullScreen: function () {
            this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
            this.oRouter.navTo("detailAcuerdosHNS",
                {
                    layout: sNextLayout,
                    proveedor: this._proveedor,
                    ref1: this._ref1,
                    ref2: this._ref2,
                    centro: this._centro
                }
            );
        },
        handleClose: function () {
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
            this.oRouter.navTo("masterAcuerdosHNS", { layout: sNextLayout });
        },
        _onDocumentMatched: function (oEvent) {
            this._proveedor = oEvent.getParameter("arguments").proveedor || this._proveedor || "0";
            this._ref1 = oEvent.getParameter("arguments").ref1 || this._ref1 || "0";
            this._ref2 = oEvent.getParameter("arguments").ref2 || this._ref2 || "0";
            this._centro = oEvent.getParameter("arguments").centro || this._centro || "0";

            if (this._ref2 !== "NOREF2") {
                var referencia = this._ref1 + "/" + this._ref2;
            } else {
                referencia = this._ref1;
            }

            var headerDeatil = {
                "Proveedor": this._proveedor,
                "Referencia": referencia,
                "Centro": this._centro
            };

            this.getOwnerComponent().setModel(new JSONModel(headerDeatil), "acuHeadDetHNSModel");

            var url = "AcuerdosHNSDetSet?$filter=";
                url += "Lifnr eq '" + this._proveedor + "'";
                url += " and Refer eq '" + referencia + "'";
                url += " and Werks eq '" + this._centro + "'";

            this.getView().byId('AcuerdosDetHNS').setBusy(true);
            oModel.getJsonModelAsync(
                url,
                function (jsonModel, parent) {
                    var objResponse = jsonModel.getProperty("/results");

                    if (objResponse != null) {

                        var totCanti = objResponse.reduce((a, b) => +a + (+b["Canti"] || 0), 0);
                        var totCnorm = objResponse.reduce((a, b) => +a + (+b["Cnorm"] || 0), 0);
                        var totCofer = objResponse.reduce((a, b) => +a + (+b["Cofer"] || 0), 0);
                        var totDifer = objResponse.reduce((a, b) => +a + (+b["Difer"] || 0), 0);
                        var totBonif = objResponse.reduce((a, b) => +a + (+b["Bonif"] || 0), 0);
                        var totImpieps = objResponse.reduce((a, b) => +a + (+b["Impieps"] || 0), 0);
                        var totIva = objResponse.reduce((a, b) => +a + (+b["Iva"] || 0), 0);

                        var totalDetHNS = {
                            "TotCanti": Number(totCanti.toFixed(4)),
                            "TotCnorm": Number(totCnorm.toFixed(4)),
                            "TotCofer": Number(totCofer.toFixed(4)),
                            "TotDifer": Number(totDifer.toFixed(4)),
                            "TotBonif": Number(totBonif.toFixed(4)),
                            "TotImpieps": Number(totImpieps.toFixed(4)),
                            "TotIva": Number(totIva.toFixed(4))
                        };
                        parent.getOwnerComponent().setModel(new JSONModel(totalDetHNS), "acuTotDetHNSModel");

                        parent.getOwnerComponent().setModel(new JSONModel(objResponse),
                            "AcuDetHNSHdr");

                        //parent.paginate("AcuDetDetHdr", "/AcuDetDet", 1, 0);
                    }
                    parent.getView().byId('AcuerdosDetHNS').setBusy(false);
                },
                function (parent) {
                    parent.getView().byId('AcuerdosDetHNS').setBusy(false);
                },
                this
            );
        },
        buildExportTable: function () {            

            var texts = this.getOwnerComponent().getModel("appTxts");
            var columns = [
                {
                   name: texts.getProperty("/acuerdosHNS.centro"),
                   template: {
                       content: "{Werks}"
                   }
               },
               {
                    name: texts.getProperty("/acuerdosHNS.refer"),
                    template: {
                        content: "{Refer}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdosHNS.docCompras"),
                    template: {
                        content: "{Ebeln}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdosHNS.material"),
                    template: {
                        content: "{Matnr}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdosHNS.desc"),
                    template: {
                        content: "{Descp}"
                    }
                },
               {
                   name: texts.getProperty("/acuerdosHNS.canti"),
                   template: {
                       content: "{Canti}"
                   }
               },
               {
                   name: texts.getProperty("/acuerdosHNS.cNorm"),
                   template: {
                       content: "{Cnorm}"
                   }
               },
               {
                   name: texts.getProperty("/acuerdosHNS.cOfer"),
                   template: {
                       content: "{Cofer}"
                   }
               },
               {
                   name: texts.getProperty("/acuerdosHNS.difer"),
                   template: {
                       content: "{Difer}"
                   }
               },
               {
                   name: texts.getProperty("/acuerdosHNS.bonif"),
                   template: {
                       content: "{Bonif}"
                   }
               },
               {
                   name: texts.getProperty("/acuerdosHNS.ieps"),
                   template: {
                       content: "{Impieps}"
                   }
               },
               {
                   name: texts.getProperty("/acuerdosHNS.iva"),
                   template: {
                       content: "{Iva}"
                   }
               }
           ];

            this.exportxls('AcuDetHNSHdr', '/', columns);
        }
    });
});