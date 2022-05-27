sap.ui.define([
    "demo/controllers/BaseController"
], function (Controller) {
    "use strict";

    return Controller.extend("demo.controllers.VisorNotasEntrada.Detail", {

        onInit: function(){
            this.oRouter = this.getOwnerComponent().getRouter();
            this.oModel = this.getOwnerComponent().getModel();
        },

        handleFullScreen: function (oEvent) {
            this.bFocusFullScreenButton = true;
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
            this.oRouter.navTo("detailVisorNotas", { layout: sNextLayout});
        },

        handleExitFullScreen: function (oEvent) {
            this.bFocusFullScreenButton = true;
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
            this.oRouter.navTo("detailVisorNotas", { layout: sNextLayout});
        },

        handleClose: function(oEvent){
            this.oRouter.navTo("masterVisorNotas", { layout: this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn") });
        },
    });
});