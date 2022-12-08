sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "demo/controllers/BaseController",    
    "sap/ui/core/mvc/Controller"
], function (JSONModel, Controller) {
    "use strict";

    var oLogon = new this.UserModel();
    return Controller.extend("demo.controllers.Users.History", {
        onInit: function () {
            var oExitButton = this.getView().byId("exitFullScreenBtn"),
                oEnterButton = this.getView().byId("enterFullScreenBtn");

            this.oRouter = this.getOwnerComponent().getRouter();
            this.oModel = this.getOwnerComponent().getModel();

            this.oRouter.getRoute("historyUsers").attachPatternMatched(this._onSupplierMatched, this);

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
        handleFullScreen: function () {
            this.bFocusFullScreenButton = true;
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/endColumn/fullScreen");
            this.oRouter.navTo("historyUsers", { layout: sNextLayout, user: this._user, supplier: this._supplier });
        },
        handleExitFullScreen: function () {
            this.bFocusFullScreenButton = true;
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/endColumn/exitFullScreen");
            this.oRouter.navTo("historyUsers", { layout: sNextLayout, user: this._user, supplier: this._supplier });
        },
        handleClose: function () {
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/endColumn/closeColumn");
            this.oRouter.navTo("detailUsers", { layout: sNextLayout, user: this._user, supplier: this._supplier });
        },
        _onSupplierMatched: function (oEvent) {
            this._user = oEvent.getParameter("arguments").user || this._user || "0",
            this._supplier = oEvent.getParameter("arguments").supplier || this._supplier || "0";

            var response = oLogon.getJsonModel("/headerAdmSet?$expand=ETHISTORINAV&$filter= IOption eq '5' and IIdusua eq '" + this._user + "'");

            var respObj = response.getProperty("/results/0");
            if (respObj != null) {
                if (respObj.ESuccess == "X") {
                    this.getOwnerComponent().setModel(new JSONModel(respObj),
                    "historyUserModel");
                } else {
                    sap.m.MessageBox.error(respObj.EMessage);
                }
            } else {
                sap.m.MessageBox.error(this.getOwnerComponent().getModel('appTxts').getProperty("/logon.erroServer"));
            }
        },
        exportHistoryXls: function(){
            var texts = this.getOwnerComponent().getModel("appTxts")
            var columns = [
                {
                    name: texts.getProperty("/historyU.userUC"),
                    template: {
                        content: this.getOwnerComponent().getModel("detailUserModel").getProperty("/Esusdata/SmtpAddr")
                    }
                },
                {
                    name: texts.getProperty("/historyU.operationUC"),
                    template: {
                        content: "{Hname}"
                    }
                },
                {
                    name: texts.getProperty("/global.dateUC"),
                    template: {
                        content: "{Erdat}"
                    }
                },
                {
                    name: texts.getProperty("/global.timeUC"),
                    template: {
                        content: "{Cputm}"
                    }
                },
                {
                    name: texts.getProperty("/historyU.chagedByUC"),
                    template: {
                        content: "{Email}"
                    }
                },
                {
                    name: texts.getProperty("/global.vendorUC"),
                    template: {
                        content: "{Lifnr}"
                    }
                },
                {
                    name: texts.getProperty("/historyU.functionUC"),
                    template: {
                        content: "{Fname}"
                    }
                }
            ];

            this.exportxls('historyUserModel', '/ETHISTORINAV/results', columns);
        },
    });
});
