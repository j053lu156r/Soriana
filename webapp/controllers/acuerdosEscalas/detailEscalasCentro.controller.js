sap.ui.define([
	"sap/ui/model/json/JSONModel",
    "demo/controllers/BaseController",
	"sap/ui/core/mvc/Controller",
    'sap/m/MessageToast',
    "jquery.sap.global",
    "demo/models/BaseModel"
], function (JSONModel, Controller, MessageToast, jQuery, BaseModel) {
	"use strict";

    var oModel = new this.ACEscalas();
	return Controller.extend("demo.controllers.acuerdosEscalas.detailEscalasCentro", {
		onInit: function () {
			var oExitButton = this.getView().byId("exitFullScreenBtn"),
				oEnterButton = this.getView().byId("enterFullScreenBtn");

			this.oRouter = this.getOwnerComponent().getRouter();
			this.oModel = this.getOwnerComponent().getModel();

			this.oRouter.getRoute("detailEscalasCentro").attachPatternMatched(this._onDocumentMatched, this);
            /*
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
            */
		},

		
		handleFullScreen: function () {
            
			this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
			this.oRouter.navTo("detailEscalasCentro", 
                {
                    layout: sNextLayout, 
                    bukrs: this._bukrs,
                    belnr: this._belnr,
                    gjahr: this._gjahr,
                    lifnr: this._lifnr,
                    werks: this._werks,
                    name:this._name
                }
            );
		},

		handleExitFullScreen: function () {
			this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
			this.oRouter.navTo("detailEscalasCentro", 
                {
                    layout: sNextLayout, 
                    bukrs: this._bukrs,
                    belnr: this._belnr,
                    gjahr: this._gjahr,
                    lifnr: this._lifnr,
                    werks: this._werks,
                    name:this._name
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

		_onDocumentMatched: function (oEvent) {
			
            this._bukrs = oEvent.getParameter("arguments").bukrs || this._bukrs || "0";
            this._belnr = oEvent.getParameter("arguments").belnr || this._belnr || "0";
            this._gjahr = oEvent.getParameter("arguments").gjahr || this._gjahr || "0";
            this._lifnr = oEvent.getParameter("arguments").lifnr || this._lifnr || "0";
            this._werks = oEvent.getParameter("arguments").werks || this._werks || "0";
            this._name = oEvent.getParameter("arguments").name || this._name || "";

            var headerDeatil = {
                "bukrs": this._bukrs,
                "belnr": this._belnr,
                "gjahr": this._gjahr,
                "lifnr": this._lifnr,
                "werks": this._werks,
                "name":this._name
            };

            this.getOwnerComponent().setModel(new JSONModel(headerDeatil), "scalDetModel");

            var url = "ScaleSet?$filter=bukrs eq '" + this._bukrs + "' and belnr eq '" + this._belnr +
                              "' and gjahr eq '" + this._gjahr + "' and lifnr eq '" + this._lifnr + 
                              "' and werks eq '" + this._werks + "'";
                        
            this.getView().byId('scalDetTable').setBusy(true);
            oModel.getJsonModelAsync(
                url,
                function (jsonModel, parent) {
                    var objResponse = jsonModel.getProperty("/results");

                    if (objResponse != null) {

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
                            "scalDetTotModel");

                        parent.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(objResponse),
                            "scalDetDta");

                        //parent.paginate("scalDetDta", "/", 1, 0);
                    }
                    parent.getView().byId('scalDetTable').setBusy(false);
                },
                function (parent) {
                    parent.getView().byId('scalDetTable').setBusy(false);
                },
                this
            );
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
                    name: texts.getProperty("/ACEscalas.arrangement"),
                    template: {
                        content: "{knuma}"
                    }
                },
                {
                    name: texts.getProperty("/ACEscalas.matdoc"),
                    template: {
                        content: "{mblnr}"
                    }
                },
                {
                    name: texts.getProperty("/ACEscalas.matdocYear"),
                    template: {
                        content: "{mjahr}"
                    }
                },
                {
                    name: texts.getProperty("/ACEscalas.movClass"),
                    template: {
                        content: "{bwart}"
                    }
                },
                {
                    name: texts.getProperty("/ACEscalas.reference"),
                    template: {
                        content: "{xblnr}"
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
                        content: "{zipes}"
                    }
                },
                {
                    name: texts.getProperty("/ACEscalas.subtotal"),
                    template: {
                        content: "{stotal}"
                    }
                }
            ];

            this.exportxls('scalDetDta', '/', columns);
        }
	});
});