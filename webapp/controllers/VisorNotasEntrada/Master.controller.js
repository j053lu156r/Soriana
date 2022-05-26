sap.ui.define([
    "demo/controllers/BaseController"
], function (Controller) {
    "use strict";

    return Controller.extend("demo.controllers.VisorNotasEntrada.Master", {

        onPress: function(oEvent){
            this.getOwnerComponent().getRouter().navTo("detailVisorNotas");
        }
    });
});