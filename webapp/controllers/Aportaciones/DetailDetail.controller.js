sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "demo/controllers/BaseController"
], function (JSONModel, Controller) {
    "use strict";

    var oModel = new this.Aportaciones();
    return Controller.extend("demo.controllers.Aportaciones.DetailDetail", {
        onInit: function () {
            var oExitButton = this.getView().byId("exitFullScreenBtn"),
                oEnterButton = this.getView().byId("enterFullScreenBtn");

            this.oRouter = this.getOwnerComponent().getRouter();
            this.oModel = this.getOwnerComponent().getModel();

            this.oRouter.getRoute("detailDetailAporta").attachPatternMatched(this._onDocumentMatched, this);

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
            this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/endColumn/fullScreen");
            this.oRouter.navTo("detailDetailAporta",
                {
                    layout: sNextLayout,
                    folio: this._folio
                }
            );
        },
        handleExitFullScreen: function () {
            this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/endColumn/exitFullScreen");
            this.oRouter.navTo("detailDetailAporta",
                {
                    layout: sNextLayout,
                    folio: this._folio
                }
            );
        },
        handleClose: function () {
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/endColumn/closeColumn");
            this.oRouter.navTo("detailAportaciones", 
                { 
                    layout: sNextLayout
                }
            );
        },
        _onDocumentMatched: function (oEvent) {
            this._folio = oEvent.getParameter("arguments").folio || this._folio || "0";

            var url = "AportaSet?$expand=AportaDet&$filter=IOption eq '1'";
            ;
            if (this._folio != "" && this._folio != null) {
                url += " and IFolio eq '" + this._folio + "'";
            }

            //this.getView().byId('ObjectPageLayout').setBusy(true);
            oModel.getJsonModelAsync(
                url,
                function (jsonModel, parent) {
                    var objResponse = jsonModel.getProperty("/results/0");

                    if (objResponse != null) {
                        parent.getOwnerComponent().setModel(new JSONModel(objResponse.AportaDet.results[0]),
                            "AportaDetDet");
                    }
                    //parent.getView().byId('ObjectPageLayout').setBusy(false);
                },
                function (parent) {
                    //parent.getView().byId('ObjectPageLayout').setBusy(false);
                },
                this
            );
        }
    });
});
