sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "demo/controllers/BaseController",
	"sap/ui/core/mvc/Controller"
], function (JSONModel, Controller) {
    "use strict";
    
    var oModel = new this.EnvioCfdi();

	return Controller.extend("demo.controllers.Detail.Detail", {
		onInit: function () {
			var oExitButton = this.getView().byId("exitFullScreenBtn"),
				oEnterButton = this.getView().byId("enterFullScreenBtn");

			this.oRouter = this.getOwnerComponent().getRouter();
			this.oModel = this.getOwnerComponent().getModel();

			this.oRouter.getRoute("detailCfdi").attachPatternMatched(this._onDocumentMatched, this);

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
			var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(2),
				supplierPath = oEvent.getSource().getBindingContext("tableItemsCfdi").getPath(),
                supplier = supplierPath.split("/").slice(-1).pop();
            
		},
		handleFullScreen: function () {
			this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
			this.oRouter.navTo("detailCfdi", {layout: sNextLayout, document: this._document, year: this._year});
		},
		handleExitFullScreen: function () {
			this.bFocusFullScreenButton = true;
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
			this.oRouter.navTo("detailCfdi", {layout: sNextLayout, document: this._document, year: this._year});
		},
		handleClose: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
			this.oRouter.navTo("masterCfdi", {layout: sNextLayout});
		},
		_onDocumentMatched: function (oEvent) {
            this._document = oEvent.getParameter("arguments").document || this._document || "0";
            this._year = oEvent.getParameter("arguments").year || this._year || "0";
            var url = "/HeaderCFDISet?$expand=EDOCDTLNAV,EDOCHDRNAV&$filter=IOption eq '2' and IBelnr eq '" 
            + this._document + "' and IPeriodo eq '" + this._year + "'";
            var dueModel = oModel.getJsonModel(url);

            var ojbResponse = dueModel.getProperty("/results/0");
            //var records = ojbResponse.EDOCDTLNAV;

            this.getOwnerComponent().setModel(new JSONModel(ojbResponse),
            "tableDetailMoves");

            this.paginate('tableDetailMoves', '/EDOCDTLNAV', 1, 0);
        },
        getOrder: function(oEvent){ /* no funciona ! */
            var document = oEvent.getSource().getProperty("text");

            var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(3);
			this.oRouter.navTo("detailOrders", {layout: oNextUIState.layout,  document: document});
        },
        buildExcel: function(){
            var texts = this.getOwnerComponent().getModel("appTxts");
            let Encabezado = this.getOwnerComponent().getModel("tableDetailMoves");

            var columns = [
                {
                    name: texts.getProperty("/sendInv.recepNumberUPC"),
                    template: {
                        content: Encabezado.getProperty("/EDOCHDRNAV/results/0/Xblnr")
                    }
                },
                {
                    name: texts.getProperty("/global.yearUPC"),
                    template: {
                        content: Encabezado.getProperty("/EDOCHDRNAV/results/0/Gjahr")
                    }
                },             
                {
                    name: texts.getProperty("/sendInv.documentUPC"),
                    template: {
                        content: Encabezado.getProperty("/EDOCHDRNAV/results/0/Belnr")+" - "+Encabezado.getProperty("/EDOCHDRNAV/results/0/Gjahr")
                    }
                },             
                {
                    name: texts.getProperty("/sendInv.purchaseOrderUPC"),
                    template: {
                        content: Encabezado.getProperty("/EDOCHDRNAV/results/0/Ebeln")
                    }
                },
                {
                    name: texts.getProperty("/sendInv.amountUPC"),
                    template: {
                        content: Encabezado.getProperty("/EDOCHDRNAV/results/0/Dmbtr")
                    }
                },
                {
                    name: texts.getProperty("/sendInv.referenceUPC"),
                    template: {
                        content: Encabezado.getProperty("/EDOCHDRNAV/results/0/Bktxt")
                    }
                },
                {
                    name: texts.getProperty("/sendInv.dateUPC"),
                    template: {
                        content: Encabezado.getProperty("/EDOCHDRNAV/results/0/Budat")
                    }
                },
                {
                    name: texts.getProperty("/sendInv.taxUPC"),
                   template: {
                        content: Encabezado.getProperty("/EDOCHDRNAV/results/0/Impuesto")
                    }
                },
                {
                    name: texts.getProperty("/sendInv.vendorUPC"),
                    template: {
                        content: Encabezado.getProperty("/EDOCHDRNAV/results/0/Sociedad")
                    }
                },
                {
                    name: texts.getProperty("/sendInv.totalUPC"),
                    template: {
                        content: Encabezado.getProperty("/EDOCHDRNAV/results/0/Total")
                    }
                },
                {
                    name: texts.getProperty("/sendInv.positionUPC"),
                    template: {
                        content: "{Ebelp}"
                    }
                },                
                {
                    name: texts.getProperty("/sendInv.barcodeUPC"),
                    template: {
                        content: "{Ean11}"
                    }
                },
                {
                    name: texts.getProperty("/sendInv.descriptionUPC"),
                    template: {
                        content: "{Txz01}"
                    }
                },               
                {
                    name: texts.getProperty("/sendInv.qtyUPC"),
                    template: {
                        content: "{Bpmng}"                       
                    }
                },
                {
                    name: texts.getProperty("/global.unitUC"),
                    template: {
                        content: "{Bprme}"                       
                    }
                },
                {
                    name: texts.getProperty("/sendInv.unitPriceUPC"),
                    template: {
                        content: "{Unitp}"
                    }
                },
                {
                    name: texts.getProperty("/sendInv.positionAmountUPC"),
                    template: {
                        content: "{Dmbtr}"
                    }
                },
                {
                    name: texts.getProperty("/global.currencyUC"),
                    template: {
                        content: "{Waers}"
                    }
                },
                {
                    name: texts.getProperty("/sendInv.packCapUPC"),
                    template: {
                        content: "{Emp_cap}"
                    }
                },
                {
                    name: texts.getProperty("/global.unitUC"),
                    template: {
                        content: "{Packu}"
                    }
                },
                {
                    name: texts.getProperty("/sendInv.storeUPC"),
                    template: {
                        content: "{Werks}"
                    }
                },                                
                {
                    name: texts.getProperty("/sendInv.storeUPC"),
                    template: {
                        content: "{Centro}"
                    }
                }                                

            ];

            this.exportxls('tableDetailMoves', '/EDOCDTLNAV/results', columns);
        }
	});
});
