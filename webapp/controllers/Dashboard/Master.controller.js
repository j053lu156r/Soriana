sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "demo/controllers/BaseController",
], function (Controller, BaseController) {
    "use strict";
    
    var Controller = BaseController.extend("sap.m.sample.SplitApp.C", {

        onInit: function () {
            var oIconTabBar = this.byId("idIconTabBar");
            oIconTabBar.setHeaderMode("Inline");
            this.configFilterLanguage(this.getView().byId("filterBar"));
        }

    });
    return Controller;
});