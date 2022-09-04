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
	return Controller.extend("demo.controllers.BoletinVta.DetailCentro", {
		onInit: function () {
			var oExitButton = this.getView().byId("exitFullScreenBtn"),
				oEnterButton = this.getView().byId("enterFullScreenBtn");

			this.oRouter = this.getOwnerComponent().getRouter();
			this.oModel = this.getOwnerComponent().getModel();

			this.oRouter.getRoute("detailBoletinVtaCentros").attachPatternMatched(this._onDocumentMatched, this);

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

		onListItemPress: function (oEvent) {

            var resource = oEvent.getSource().getBindingContext("promotionCenterDet").getPath(),
                line = resource.split("/").slice(-1).pop();

            var odata = this.getOwnerComponent().getModel("promotionCenterDet");
            var results = odata.getProperty("/");

            var docResult = results[line]; 

            this.getOwnerComponent().getRouter().navTo("detailBoletinVta",
                {
                    layout: sap.f.LayoutType.ThreeColumnsEndExpanded,
                    promotion: this._promotion,
                    vendor: this._vendor,
                    promDescription : this._promDesciption,
                    IntenalClass: this._IntenalClass,
                    plant: docResult.Plant,
                    plantName: docResult.Name1,
                    origin: this._origin

                }, true);

		},

		handleFullScreen: function () {
            //var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(2);
			this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
            //sNextLayout = sap.f.LayoutType.TwoColumnsMidExpanded;
			this.oRouter.navTo("detailBoletinVtaCentros", 
                {
                    layout: sNextLayout, 
                    promotion: this._promotion,
                    vendor: this._vendor,
                    promDescription: this._promDesciption,
                    IntenalClass: this._IntenalClass,
                    origin: this._origin
                }
            );
		},

		handleExitFullScreen: function () {
			this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
            //sNextLayout = sap.f.LayoutType.TwoColumnsMidExpanded;
			this.oRouter.navTo("detailBoletinVtaCentros", 
                {
                    layout: sNextLayout, 
                    promotion: this._promotion,
                    vendor: this._vendor,
                    promDescription: this._promDesciption,
                    IntenalClass: this._IntenalClass,
                    origin: this._origin
                }
            );
		},

		handleClose: function () {
			//var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
            if(this._origin === "buyer") {
                this.oRouter.navTo("masterBoletinVta");
            } else {
                this.oRouter.navTo("masterBoletinVtaProv");
            }
			/*
            this.oRouter.navTo("detailBoletinVta",
            {
                layout: sap.f.LayoutType.TwoColumnsMidExpanded,
                promotion: this._promotion,
                vendor: this._vendor,
                promDescription : this._promDesciption,
                IntenalClass: this._IntenalClass
            }, true);
            */
		},
        
		_onDocumentMatched: function (oEvent) {
			
            this._promotion = oEvent.getParameter("arguments").promotion || this._promotion || "0";
            this._vendor = oEvent.getParameter("arguments").vendor || this._vendor || "0";
            this._promDesciption = oEvent.getParameter("arguments").promDescription || this._promDesciption || "0";
            this._IntenalClass = oEvent.getParameter("arguments").IntenalClass || this._IntenalClass || "0";
            this._origin = oEvent.getParameter("arguments").origin || this._origin || "0";

            var headerDeatil = {
                "promotion": this._promotion,
                "vendor": this._vendor,
                "Description": this._promDesciption
            };

            this.getOwnerComponent().setModel(new JSONModel(headerDeatil), "promotionDetModel");
            
            var url = "promPlantListSet?$filter=InternalClass eq '" + this._IntenalClass + "'";
                        
            this.getView().byId('promotionCenterTable').setBusy(true);
            oModel.getJsonModelAsync(
                url,
                function (jsonModel, parent) {
                    var objResponse = jsonModel.getProperty("/results");

                    if (objResponse != null) {
                        parent.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(objResponse), 
                        "promotionCenterDet");

                        //parent.paginate("AportacionesDet", "/AportaDetalle", 1, 0);
                    }
                    parent.getView().byId('promotionCenterTable').setBusy(false);
                },
                function (parent) {
                    parent.getView().byId('promotionCenterTable').setBusy(false);
                },
                this
            );
		},

        buildExportTable: function () {            

            var texts = this.getOwnerComponent().getModel("appTxts");
            var columns = [
                 {
                    name: texts.getProperty("/foliosCapCenter.plant"),
                    template: {
                        content: "{Plant}"
                    }
                },
                {
                    name: texts.getProperty("/PolizadetCargo.CentroNombre"),
                    template: {
                        content: "{Name1}"
                    }
                },
                {
                    name: texts.getProperty("/foliosCapCenter.Class"),
                    template: {
                        content: "{ClassDesc}"
                    }
                },
                {
                    name: texts.getProperty("/foliosCapCenter.ClassCat"),
                    template: {
                        content: "{ClassCat}"
                    }
                }
            ];

            this.exportxls('promotionCenterDet', '/', columns);
        }
	});
});
