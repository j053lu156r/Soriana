sap.ui.define([
    "demo/controllers/BaseController"
], function (Controller) {
    "use strict";

    return Controller.extend("demo.controllers.VisorNotasEntrada.Detail", {

        onPress: function(oEvent){
            this.getOwnerComponent().getRouter().navTo("masterVisorNotas", { layout: this.getOwnerComponent().getModel().getProperty("/actionButtonsInfo/midColumn/closeColumn") });
        }
    });
});