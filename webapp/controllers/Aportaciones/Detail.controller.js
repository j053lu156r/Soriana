sap.ui.define([
	"sap/ui/model/json/JSONModel",
    "demo/controllers/BaseController",
	"sap/ui/core/mvc/Controller",
    'sap/m/MessageToast',
    "jquery.sap.global",
    "demo/models/BaseModel"
], function (JSONModel, Controller, MessageToast, jQuery, BaseModel) {
	"use strict";

    var oModel = new this.Aportaciones();
	return Controller.extend("demo.controllers.Aportaciones.Detail", {
		onInit: function () {
			var oExitButton = this.getView().byId("exitFullScreenBtn"),
				oEnterButton = this.getView().byId("enterFullScreenBtn");

			this.oRouter = this.getOwnerComponent().getRouter();
			this.oModel = this.getOwnerComponent().getModel();

			this.oRouter.getRoute("detailAportaciones").attachPatternMatched(this._onDocumentMatched, this);

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
			this.oRouter.navTo("detailAportaciones", 
                {
                    layout: sNextLayout, 
                    folio: this._folio, 
                    concepto: this._concepto,
                    gerencia: this._gerencia,
                    importe: this._importe
                }
            );
		},
		handleExitFullScreen: function () {
			this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
			this.oRouter.navTo("detailAportaciones", 
                {
                    layout: sNextLayout, 
                    folio: this._folio, 
                    concepto: this._concepto,
                    gerencia: this._gerencia,
                    importe: this._importe
                }
            );
		},
		handleClose: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
			this.oRouter.navTo("masterAportaciones", {layout: sNextLayout});
		},
		_onDocumentMatched: function (oEvent) {
			this._folio = oEvent.getParameter("arguments").folio || this._folio || "0";
            this._concepto = oEvent.getParameter("arguments").concepto || this._concepto || "0";
            this._gerencia = oEvent.getParameter("arguments").gerencia || this._gerencia || "0";
            this._importe = oEvent.getParameter("arguments").importe || this._importe || "0";

            var headerDeatil = {
                "Folio": this._folio,
                "Concepto": this._concepto,
                "Gerencia": this._gerencia,
                "Importe": this._importe
            };

            this.getOwnerComponent().setModel(new JSONModel(headerDeatil), "aportaDetModel");
            
            var url = "AportaSet?$expand=AportaDetalle&$filter=IOption eq '4'";
                ;
            if (this._folio != "" && this._folio != null) {
                url += " and IFolio eq '" + this._folio + "'";
            }
            
            this.getView().byId('aportaDetTable').setBusy(true);
            oModel.getJsonModelAsync(
                url,
                function (jsonModel, parent) {
                    var objResponse = jsonModel.getProperty("/results/0");

                    if (objResponse != null) {
                        parent.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(objResponse), 
                        "AportacionesDet");

                        //parent.paginate("AportacionesDet", "/AportaDetalle", 1, 0);
                    }
                    parent.getView().byId('aportaDetTable').setBusy(false);
                },
                function (parent) {
                    parent.getView().byId('aportaDetTable').setBusy(false);
                },
                this
            );

            /*var dueModel = oModel.getJsonModel(url);
            var ojbResponse = dueModel.getProperty("/results/0");
            this.getOwnerComponent().setModel(new JSONModel(ojbResponse),
                "AportacionesDet");*/

            //this.paginate("AportacionesDet", "/AportaDetalle", 1, 0);

		},
        buildExportTable: function () {            

            var texts = this.getOwnerComponent().getModel("appTxts");
            var columns = [
                 {
                    name: texts.getProperty("/aportaciones.un"),
                    template: {
                        content: "{Werks}"
                    }
                },
                {
                    name: texts.getProperty("/aportaciones.tienda"),
                    template: {
                        content: "{Namew}"
                    }
                },
                {
                    name: texts.getProperty("/aportaciones.sku"),
                    template: {
                        content: "{Matnr}"
                    }
                },
                {
                    name: texts.getProperty("/aportaciones.articulo"),
                    template: {
                        content: "{Maktx}"
                    }
                },
                {
                    name: texts.getProperty("/aportaciones.piezas"),
                    template: {
                        content: "{Zcantidad}"
                    }
                },
                /*{
                    name: texts.getProperty("/aportaciones.vtaNeta"),
                    template: {
                        content: "{Zbonificacion}"
                    }
                },*/
                {
                    name: texts.getProperty("/aportaciones.bonif"),
                    template: {
                        content: "{Zbonificacion}"
                    }
                },
                {
                    name: texts.getProperty("/aportaciones.iva"),
                    template: {
                        content: "{Ziva}"
                    }
                },
                {
                    name: texts.getProperty("/aportaciones.ieps"),
                    template: {
                        content: "{Zieps}"
                    }
                },
                {
                    name: texts.getProperty("/aportaciones.total"),
                    template: {
                        content: "{Ztotal}"
                    }
                },
                {
                    name: texts.getProperty("/aportaciones.aporta"),
                    template: {
                        content: "{Zaportacion}"
                    }
                }
            ];

            this.exportxls('AportacionesDet', '/AportaDetalle/results', columns);
        }
	});
});
