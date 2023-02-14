sap.ui.define([
    "demo/controllers/BaseController"
], function (Controller) {
    "use strict";

    return Controller.extend("demo.controllers.DownloadCP.Master", {
        onInit: function () {
            this.configFilterLanguage(this.getView().byId("filterBar"));
        },

        onExit: function () {
            
        }
    });
});