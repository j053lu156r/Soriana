sap.ui.define([
    "jquery.sap.global",
    "demo/controllers/BaseController",
    "sap/ui/model/json/JSONModel"
], function (jQuery, Controller, JSONModel) {
    "use strict";

    return Controller.extend("demo.controllers.PowerBI.Master", {
        onInit: function () {
            this.configFilterLanguage(this.getView().byId("filterBar"));
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.attachRouteMatched(this.routeMatched, this);
        },

        routeMatched: function (oEvent) {
            var oParameters = oEvent.getParameters();
            var sRouteName = oParameters.name;
            var oModel = this.getView().getModel("applicationModel");
            oModel.setProperty("/routeName", sRouteName);
        },

        onExit: function () {
            
        },

        onSuggestionItemSelected: function(vLifnr){
            console.log(vLifnr)
        }
    });
});