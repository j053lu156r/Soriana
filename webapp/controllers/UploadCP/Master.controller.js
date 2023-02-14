sap.ui.define([
    "demo/controllers/BaseController"
], function (Controller) {
    "use strict";

    return Controller.extend("demo.controllers.UploadCP.Master", {
        onInit: function () {
            this.configFilterLanguage(this.getView().byId("filterBar"));
        },

        onExit: function () {
            
        }
    });
});