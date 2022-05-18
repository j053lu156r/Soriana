sap.ui.define([
    "sap/base/util/UriParameters",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/f/library",
    "sap/f/FlexibleColumnLayoutSemanticHelper"
], function (UriParameters, UIComponent, JSONModel, library, FlexibleColumnLayoutSemanticHelper) {
    "use strict";

    var LayoutType = library.LayoutType;

    return UIComponent.extend("demo.Component", {

        metadata: {
            manifest: "json"
        },

        init: function () {
            // call the init function of the parent
            UIComponent.prototype.init.apply(this, arguments);

            var oModel = new JSONModel();
            this.setModel(oModel);

            // create the views based on the url/hash
            this.getRouter().initialize();

            var oRootPath = jQuery.sap.getModulePath("images"); // your resource root

            var oImageModel = new sap.ui.model.json.JSONModel({
                images: oRootPath,
            });

            this.setModel(oImageModel, "resourcesPaths");

        },
        /**
		 * Returns an instance of the semantic helper
		 * @returns {sap.f.FlexibleColumnLayoutSemanticHelper} An instance of the semantic helper
		 */
        getHelper: function () {
            var oFCL = this.getRootControl().byId("app"),
                oParams = UriParameters.fromQuery(location.search),
                oSettings = {
                    defaultTwoColumnLayoutType: LayoutType.TwoColumnsMidExpanded,
                    defaultThreeColumnLayoutType: LayoutType.ThreeColumnsMidExpanded
                };

            return FlexibleColumnLayoutSemanticHelper.getInstanceFor(oFCL, oSettings);
        },
           getContentDensityClass: function () {
             if (!this._sContentDensityClass) {
                 if (!sap.ui.Device.support.touch) {
                     this._sContentDensityClass = "sapUiSizeCompact";
                 } else {
                     this._sContentDensityClass = "sapUiSizeCozy";
                 }
             }
             return this._sContentDensityClass;
         },

    });

});
