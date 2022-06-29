sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "demo/controllers/BaseController"
], function (JSONModel, Controller) {
    "use strict";

    var oModel = new this.Aportaciones();
    return Controller.extend("demo.controllers.Aportaciones.DetailDetailAS", {
        onInit: function () {
            var oExitButton = this.getView().byId("exitFullScreenBtn"),
                oEnterButton = this.getView().byId("enterFullScreenBtn");

            this.oRouter = this.getOwnerComponent().getRouter();
            this.oModel = this.getOwnerComponent().getModel();

            this.oRouter.getRoute("detailAportacionesAS").attachPatternMatched(this._onDocumentMatched, this);
            this.oRouter.getRoute("detailAportacionesComplemento").attachPatternMatched(this._onDocumentMatchedComplemento, this);

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
        //pantalla completa 
        handleFullScreen: function () {
            this.bFocusFullScreenButton = true;
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/endColumn/fullScreen");
            var sNextLayoutB = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");

            if (this._vistaAnteior == "COMPLEMENTOS") {

                this.oRouter.navTo("detailAportacionesComplemento", {
                    layout: sNextLayout,
                    document: this._folio
                });


            } else {

                this.oRouter.navTo("detailAportacionesAS", {
                    layout: sNextLayoutB,
                    folio: this._folio,
                    view: this._view
                });


            }
        },

        //vista normal 
        handleExitFullScreen: function () {
            this.bFocusFullScreenButton = true;
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/endColumn/exitFullScreen");
            var route = ""
            if (this._vistaAnteior == "COMPLEMENTOS") {

                this.oRouter.navTo("detailAportacionesComplemento", {
                    layout: sNextLayout,
                    document: this._folio
                });


            } else {

                this.oRouter.navTo("detailAportacionesAS", {
                    layout: this._layout,
                    folio: this._folio,
                    view: this._view
                });


            }


        },


        handleClose: function () {
            // var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/endColumn/closeColumn");



            if (this._vistaAnteior == "COMPLEMENTOS") {
                this.oRouter.navTo("detailComplPagos", {
                    layout: sap.f.LayoutType.TwoColumnsMidExpanded,
                    document: this._doc,
                    sociedad: this._sociedad,
                    ejercicio: this._ejercicio,
                    fecha: this._fecha

                });

            } else {

                this.oRouter.navTo("EstadoCuenta", {
                    //layout: sNextLayout
                });

            }
        },
        _onDocumentMatched: function (oEvent) {
            this._vistaAnteior = "ESTADO_CUENTA"
            this._folio = oEvent.getParameter("arguments").document || this._folio || "0";
            this._layout = oEvent.getParameter("arguments").layout || this._layout || "0";
            this._view = oEvent.getParameter("arguments").view || this._view || "0";


            var url = "AportaSet?$expand=AportaDet&$filter=IOption eq '1'";;
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
        },
        _onDocumentMatchedComplemento: function (oEvent) {
            this._vistaAnteior = "COMPLEMENTOS"

            this._folio = oEvent.getParameter("arguments").document || this._folio || "0";
            this._layout = oEvent.getParameter("arguments").layout || this._layout || "0";
            this._view = oEvent.getParameter("arguments").view || this._view || "0";
            this._sociedad = oEvent.getParameter("arguments").sociedad || this._sociedad || "0";
            this._fecha = oEvent.getParameter("arguments").fecha || this._fecha || "0";
            this._ejercicio=oEvent.getParameter("arguments").ejercicio || this._ejercicio|| "0";

            this._doc=oEvent.getParameter("arguments").doc || this._doc|| "0";



            var url = "AportaSet?$expand=AportaDet&$filter=IOption eq '1'";;
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