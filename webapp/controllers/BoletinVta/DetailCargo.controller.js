sap.ui.define([
	"sap/ui/model/json/JSONModel",
    "demo/controllers/BaseController",
	"sap/ui/core/mvc/Controller",
    'sap/m/MessageToast',
    "jquery.sap.global",
    "demo/models/BaseModel"
], function (JSONModel, Controller, MessageToast, jQuery, BaseModel) {
	"use strict";

    var oModel = new this.Polizas();
	return Controller.extend("demo.controllers.BoletinVta.DetailCargo", {
		onInit: function () {
			var oExitButton = this.getView().byId("exitFullScreenBtn"),
				oEnterButton = this.getView().byId("enterFullScreenBtn");

			this.oRouter = this.getOwnerComponent().getRouter();
			this.oModel = this.getOwnerComponent().getModel();

			this.oRouter.getRoute("detailCargoBoletinVta").attachPatternMatched(this._onDocumentMatched, this);

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
            //var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(2);
			this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
            //sNextLayout = sap.f.LayoutType.TwoColumnsMidExpanded;
			this.oRouter.navTo("detailCargoBoletinVta", 
                {
                    layout: sNextLayout, 
                    Company: this._Company,
                    Vendor: this._Vendor,
                    Agreement: this._Agreement,
                    DateCreated: this._DateCreated,
                    document: this._document,
                    year: this._year
                }
            );
		},
		handleExitFullScreen: function () {
			this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
            //sNextLayout = sap.f.LayoutType.TwoColumnsMidExpanded;
			this.oRouter.navTo("detailCargoBoletinVta", 
                {
                    layout: sNextLayout, 
                    Company: this._Company,
                    Vendor: this._Vendor,
                    Agreement: this._Agreement,
                    DateCreated: this._DateCreated,
                    document: this._document,
                    year: this._year
                }
            );
		},

		handleClose: function () {
			
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
            sNextLayout = sap.f.LayoutType.TwoColumnsMidExpanded;
			this.oRouter.navTo("masterBoletinVtaPolizas",
            {
                layout: sNextLayout,
                company: this._Company,
                document: this._document,
                year : this._year,

            }, true);
		},

		_onDocumentMatched: function (oEvent) {
			
            this._Company = oEvent.getParameter("arguments").Company || this._Company || "0";
            this._Vendor = oEvent.getParameter("arguments").Vendor || this._Vendor || "0";
            this._Agreement = oEvent.getParameter("arguments").Agreement || this._Agreement || "0";
            this._DateCreated = oEvent.getParameter("arguments").DateCreated || this._DateCreated || "0";
            this._document = oEvent.getParameter("arguments").document || this._document || "0";
            this._year = oEvent.getParameter("arguments").year || this._year || "0";

            var headerDeatil = {
                "Company": this._Company,
                "Vendor": this._Vendor,
                "Agreement": this._Agreement,
                "DateCreated": this._DateCreated
            };

            this.getOwnerComponent().setModel(new JSONModel(headerDeatil), "debitDetModel");
            
            var url = "debitDetailSet?$filter=Company eq '" + this._Company + "' and Agreement eq '" + this._Agreement +
                      "' and Vendor eq '" + this._Vendor + "' and DateCreated eq '" + this._DateCreated + "'";
                        
            this.getView().byId('debitDetTable').setBusy(true);
            oModel.getJsonModelAsync(
                url,
                function (jsonModel, parent) {
                    var objResponse = jsonModel.getProperty("/results");

                    if (objResponse != null) {

                        var totCost = objResponse.reduce((a, b) => +a + (+b["Cost"] || 0), 0);
                        var totPrice = objResponse.reduce((a, b) => +a + (+b["Price"] || 0), 0);
                        var totBonus = objResponse.reduce((a, b) => +a + (+b["Bonus"] || 0), 0);
                        var totIVA = objResponse.reduce((a, b) => +a + (+b["Tax"] || 0), 0);
                        var totIEPS = objResponse.reduce((a, b) => +a + (+b["Ieps"] || 0), 0);
                        var TotDistQty = objResponse.reduce((a, b) => +a + (+b["DistQty"] || 0), 0);
                        var totalAcuDet = {
                            "TotCost": Number(totCost.toFixed(2)),
                            "TotPrice": Number(totPrice.toFixed(2)),
                            "TotBonus": Number(totBonus.toFixed(2)),
                            "TotIVA": Number(totIVA.toFixed(2)),
                            "TotIEPS": Number(totIEPS.toFixed(2)),
                            "TotDistQty": Number(TotDistQty.toFixed(3)),
                            "Promotion": objResponse[0].Promotion
                        };
                        parent.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(totalAcuDet), 
                            "debTotDetModel");

                        parent.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(objResponse), 
                        "debitDet");
                    }
                    parent.getView().byId('debitDetTable').setBusy(false);
                },
                function (parent) {
                    parent.getView().byId('debitDetTable').setBusy(false);
                },
                this
            );
		},

        buildExportTable: function () {            

            var texts = this.getOwnerComponent().getModel("appTxts");
            var columns = [
                {
                    name: texts.getProperty("/foliosCap.promocion"),
                    template: {
                        content: "{Promotion}"
                    }
                },
                 {
                    name: texts.getProperty("/PolizadetCargo.Agreement"),
                    template: {
                        content: "{Agreement}"
                    }
                },
                {
                    name: texts.getProperty("/PolizadetCargo.Material"),
                    template: {
                        content: "{Material}"
                    }
                },
                {
                    name: texts.getProperty("/PolizadetCargo.MatDescription"),
                    template: {
                        content: "{MatDescription}"
                    }
                },
                {
                    name: texts.getProperty("/PolizadetCargo.Centro"),
                    template: {
                        content: "{Forum}"
                    }
                },
                {
                    name: texts.getProperty("/PolizadetCargo.CentroNombre"),
                    template: {
                        content: "{ForumDescrition}"
                    }
                },
                {
                    name: texts.getProperty("/PolizadetCargo.Posicion"),
                    template: {
                        content: "{MatdocPosition}"
                    }
                },
                {
                    name: texts.getProperty("/PolizadetCargo.DistQty"),
                    template: {
                        content: "{DistQty}"
                    }
                },
                {
                    name: texts.getProperty("/PolizadetCargo.bonus"),
                    template: {
                        content: "{Bonus}"
                    }
                },
                {
                    name: texts.getProperty("/PolizadetCargo.IVA}"),
                    template: {
                        content: "{Tax}"
                    }
                },
                {
                    name: texts.getProperty("/PolizadetCargo.IEPS"),
                    template: {
                        content: "{Ieps}"
                    }
                }
            ];

            this.exportxls('debitDet', '/', columns);
        }
	});
});
