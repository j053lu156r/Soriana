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
	return Controller.extend("demo.controllers.BoletinVta.DetailCargoMaterial", {
		onInit: function () {
			var oExitButton = this.getView().byId("exitFullScreenBtn"),
				oEnterButton = this.getView().byId("enterFullScreenBtn");

			this.oRouter = this.getOwnerComponent().getRouter();
			this.oModel = this.getOwnerComponent().getModel();

			this.oRouter.getRoute("detailCargoMatsBoletinVta").attachPatternMatched(this._onDocumentMatched, this);

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
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/endColumn/fullScreen");
			this.oRouter.navTo("detailCargoMatsBoletinVta", 
                {
                    layout: sNextLayout, 
                    Company: this._Company,
                    Forum: this._Forum ,
                    ForumDesc: this._ForumDesc,
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
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/endColumn/exitFullScreen");
			this.oRouter.navTo("detailCargoMatsBoletinVta", 
                {
                    layout: sNextLayout, 
                    Company: this._Company,
                    Forum: this._Forum ,
                    ForumDesc: this._ForumDesc,
                    Vendor: this._Vendor,
                    Agreement: this._Agreement,
                    DateCreated: this._DateCreated,
                    document: this._document,
                    year: this._year
                }
            );
		},

		handleClose: function () {
			
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/endColumn/exitFullScreen");
            sNextLayout = sap.f.LayoutType.TwoColumnsMidExpanded;
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

		_onDocumentMatched: function (oEvent) {
			
            this._Company = oEvent.getParameter("arguments").Company || this._Company || "0";
            this._Vendor = oEvent.getParameter("arguments").Vendor || this._Vendor || "0";
            this._Agreement = oEvent.getParameter("arguments").Agreement || this._Agreement || "0";
            this._DateCreated = oEvent.getParameter("arguments").DateCreated || this._DateCreated || "0";
            this._document = oEvent.getParameter("arguments").document || this._document || "0";
            this._year = oEvent.getParameter("arguments").year || this._year || "0";
            this._Forum = oEvent.getParameter("arguments").Forum || this._Forum || "0";
            this._ForumDesc = oEvent.getParameter("arguments").ForumDesc || this._ForumDesc || "0";

            var headerDeatil = {
                "Company": this._Company,
                "Vendor": this._Vendor,
                "Agreement": this._Agreement,
                "DateCreated": this._DateCreated,
                "Forum": this._Forum,
                "ForumDesc": this._ForumDesc
            };

            this.getOwnerComponent().setModel(new JSONModel(headerDeatil), "debitDetMatModel");
            
            var url = "debitByMaterialSet?$filter=Company eq '" + this._Company + "' and Forum eq '" + this._Forum  + 
                     "' and Agreement eq '" + this._Agreement + "' and Vendor eq '" + this._Vendor + "' and DateCreated eq '" + this._DateCreated + 
                     "' and Document eq '" + this._document + "'"; 
                        
            this.getView().byId('debitMatTable').setBusy(true);
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
                        var totDiscount = objResponse.reduce((a, b) => +a + (+b["Discount"] || 0), 0);
                        totDiscount = objResponse[0].Discount;
                        var TotQty = objResponse.reduce((a, b) => +a + (+b["Qty"] || 0), 0);
                        var total = objResponse.reduce((a, b) => +a + (+b["Total"] || 0), 0);
                        var currCode = objResponse[0].Currency;
                        var totalMatDet = {
                            "TotCost": Number(totCost.toFixed(2)),
                            "TotPrice": Number(totPrice.toFixed(2)),
                            "TotBonus": Number(totBonus.toFixed(2)),
                            "TotIVA": Number(totIVA.toFixed(2)),
                            "TotIEPS": Number(totIEPS.toFixed(2)),
                            "TotDiscount": Number(totDiscount),
                            "Total": Number(total.toFixed(2)),
                            "TotQty": Number(TotQty.toFixed(0)),
                            "Promotion": objResponse[0].Promotion,
                            "currCode": currCode
                        };
                        parent.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(totalMatDet), 
                            "debTotMatModel");

                        parent.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(objResponse), 
                        "debitMatDet");
                    }
                    parent.getView().byId('debitMatTable').setBusy(false);
                },
                function (parent) {
                    parent.getView().byId('debitMatTable').setBusy(false);
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
                /*         
                {
                    name: texts.getProperty("/PolizadetCargo.Posicion"),
                    template: {
                        content: "{MatdocPosition}"
                    }
                },
                */
                                
                {
                    name: texts.getProperty("/PolizadetCargo.bonus"),
                    template: {
                        content: "{Bonus}"
                    }
                },
                {
                    name: texts.getProperty("/PolizadetCargo.Qty"),
                    template: {
                        content: "{Qty}"
                    }
                },
                {
                    name: texts.getProperty("/PolizadetCargo.discount"),
                    template: {
                        content: "{Discount}"
                    }
                },
                {
                    name: texts.getProperty("/PolizadetCargo.IEPS"),
                    template: {
                        content: "{Ieps}"
                    }
                },
                {
                    name: texts.getProperty("/PolizadetCargo.IVA"),
                    template: {
                        content: "{Tax}"
                    }
                },
                {
                    name: texts.getProperty("/PolizadetCargo.total"),
                    template: {
                        content: "{Total}"
                    }
                }
            ];

            this.exportxls('debitMatDet', '/', columns);
        }
	});
});
