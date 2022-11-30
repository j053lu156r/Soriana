sap.ui.define([
	"sap/ui/model/json/JSONModel",
    "demo/controllers/BaseController",
	"sap/ui/core/mvc/Controller",
    'sap/m/MessageToast',
    "jquery.sap.global",
    "demo/models/BaseModel"
], function (JSONModel, Controller, MessageToast, jQuery, BaseModel) {
	"use strict";

    var oModel = new this.ACcapturados();
	return Controller.extend("demo.controllers.BoletinVta.Detail", {
		onInit: function () {
			var oExitButton = this.getView().byId("exitFullScreenBtn"),
				oEnterButton = this.getView().byId("enterFullScreenBtn");

			this.oRouter = this.getOwnerComponent().getRouter();
			this.oModel = this.getOwnerComponent().getModel();

			this.oRouter.getRoute("detailBoletinVta").attachPatternMatched(this._onDocumentMatched, this);

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
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/endColumn/fullScreen");
            //sNextLayout = sap.f.LayoutType.TwoColumnsMidExpanded;
			this.oRouter.navTo("detailBoletinVta", 
                {
                    layout: sNextLayout, 
                    promotion: this._promotion,
                    vendor: this._vendor,
                    promDescription: this._promDesciption,
                    IntenalClass: this._IntenalClass,
                    plant: this._plant,
                    plantName: this._plantName,
                    origin: this._origin
                }
            );
		},
		handleExitFullScreen: function () {
			this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/endColumn/exitFullScreen");
            //sNextLayout = sap.f.LayoutType.TwoColumnsMidExpanded;
			this.oRouter.navTo("detailBoletinVta", 
                {
                    layout: sNextLayout, 
                    promotion: this._promotion,
                    vendor: this._vendor,
                    promDescription: this._promDesciption,
                    IntenalClass: this._IntenalClass,
                    plant: this._plant,
                    plantName: this._plantName,
                    origin: this._origin
                }
            );
		},
        
		handleClose: function () {
			//var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
			//this.oRouter.navTo("masterBoletinVta");
            this.oRouter.navTo("detailBoletinVtaCentros", 
                {
                    layout: sap.f.LayoutType.TwoColumnsMidExpanded, 
                    promotion: this._promotion,
                    vendor: this._vendor,
                    promDescription: this._promDesciption,
                    IntenalClass: this._IntenalClass,
                    origin: this._origin
                }
            );
		},

		_onDocumentMatched: function (oEvent) {
			
            this._promotion = oEvent.getParameter("arguments").promotion || this._promotion || "0";
            this._vendor = oEvent.getParameter("arguments").vendor || this._vendor || "0";
            this._promDesciption = oEvent.getParameter("arguments").promDescription || this._promDesciption || "0";
            this._IntenalClass = oEvent.getParameter("arguments").IntenalClass || this._IntenalClass || "0";
            this._plant = oEvent.getParameter("arguments").plant || this._plant || "0";
            this._plantName = oEvent.getParameter("arguments").plantName || this._plantName || "0";
            this._origin = oEvent.getParameter("arguments").origin || this._origin || "0";

            var headerDeatil = {
                "promotion": this._promotion,
                "vendor": this._vendor,
                "Description": this._promDesciption,
                "plant": this._plant,
                "plantName": this._plantName
            };

            this.getOwnerComponent().setModel(new JSONModel(headerDeatil), "promotionDetModel");
            
            var url = "promMaterialListByPlantSet?$filter=Promotion eq '" + this._promotion + "' and Vendor eq '" + 
                    this._vendor + "' and Plant eq '" + this._plant + "'";
                    
            this.getView().byId('promotionDetTable').setBusy(true);
            oModel.getJsonModelAsync(
                url,
                function (jsonModel, parent) {
                    var objResponse = jsonModel.getProperty("/results");

                    if (objResponse != null) {
                        var currCode = objResponse[0].CurrencyPlan;
                        //var SalesUnit = objResponse[0].SalesUnit;
                        var totQtyPlan = objResponse.reduce((a, b) => +a + (+b["QtyPlan"] || 0), 0);
                        var totPlanPrice = objResponse.reduce((a, b) => +a + (+b["PlanPrice"] || 0), 0);

                        var totalDetCentro = {
                            "totQtyPlan": Number(totQtyPlan.toFixed(2)),
                            "totPlanPrice": Number(totPlanPrice.toFixed(2)),
                            "currCode": currCode
                        };

                        parent.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(totalDetCentro), 
                            "centroTotDetModel");

                        parent.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(objResponse), 
                        "promotionDet");
                    }
                    parent.getView().byId('promotionDetTable').setBusy(false);
                },
                function (parent) {
                    parent.getView().byId('promotionDetTable').setBusy(false);
                },
                this
            );
		},

        /*
        onDetailCenterPress: function (oEvent) {

            this.getOwnerComponent().getRouter().navTo("detailBoletinVtaCentros",
                {
                    layout: sap.f.LayoutType.ThreeColumnsEndExpanded,
                    promotion: this._promotion,
                    vendor: this._vendor,
                    promDescription: this._promDesciption,
                    IntenalClass: this._IntenalClass
                }, true);

        },
        */

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
                    name: texts.getProperty("/foliosCap.supplier"),
                    template: {
                        content: "{Vendor}"
                    }
                },
                 {
                    name: texts.getProperty("/foliosCapDet.Material"),
                    template: {
                        content: "{Material}"
                    }
                },
                {
                    name: texts.getProperty("/foliosCapDet.MatDescription"),
                    template: {
                        content: "{Description}"
                    }
                },
                {
                    name: texts.getProperty("/foliosCapDet.SalesUnit"),
                    template: {
                        content: "{SalesUnit}"
                    }
                },
                /*
                {
                    name: texts.getProperty("/foliosCapDet.planQty"),
                    template: {
                        content: "{QtyPlan}"
                    }
                },
                */
                {
                    name: texts.getProperty("/foliosCapDet.planPrice"),
                    template: {
                        content: "{PlanPrice}"
                    }
                }
            ];

            this.exportxls('promotionDet', '/', columns);
        },

        handleReceipt: function () {
            
            this.oRouter.navTo("detailDetailAporta",
                {
                    layout: sap.f.LayoutType.ThreeColumnsEndExpanded,
                    folio: this._folio, 
                    concepto: this._concepto,
                    gerencia: this._gerencia,
                    importe: this._importe
                }
            );            

        }
	});
});
