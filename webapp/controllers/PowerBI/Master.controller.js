sap.ui.define([
    "jquery.sap.global",
    "demo/controllers/BaseController",
    "sap/ui/model/json/JSONModel"
], function (jQuery, Controller, JSONModel) {
    "use strict";

    return Controller.extend("demo.controllers.PowerBI.Master", {
        onInit: function () {
            this.configFilterLanguage(this.getView().byId("filterBar"));
        },

        
        onExit: function () {
            
        },
    });
});