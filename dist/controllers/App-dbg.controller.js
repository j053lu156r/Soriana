sap.ui.define([
    "jquery.sap.global",
    "sap/ui/core/Fragment",
    "demo/controllers/BaseChat",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "sap/ui/core/routing/Router",   
    "sap/f/FlexibleColumnLayout",
    "demo/models/BaseModel",
    'sap/f/library'
], function (jQuery, Fragment, Controller, History, JSONModel, fioriLibrary, ) {
    "use strict";

    return Controller.extend("demo.controllers.App", {
        onInit: function () {
            this.oOwnerComponent = this.getOwnerComponent();
            this.oRouter = this.oOwnerComponent.getRouter();
            this.oRouter.attachRouteMatched(this.onRouteMatched, this);
            this.oRouter.attachBeforeRouteMatched(this.onBeforeRouteMatched, this);
            this.oRouter.fireBeforeRouteMatched();
             this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
        },

        onBeforeRouteMatched: function (oEvent) {
            var sRouteName = oEvent.getParameter("name");

            if (this.validateLogin()) {

                var oModel = this.getOwnerComponent().getModel();

                var sLayout = oEvent.getParameters().arguments.layout,
                    oNextUIState;

                // If there is no layout parameter, query for the default level 0 layout (normally OneColumn)
                if (!sLayout) {
                    oNextUIState = this.oOwnerComponent.getHelper().getNextUIState(0);
                    sLayout = oNextUIState.layout;
                }

                // Update the layout of the FlexibleColumnLayout
                if (sLayout) {
                    oModel.setProperty("/layout", sLayout);
                }
            } else {
                if(sRouteName != "appHome"){
                    this.getOwnerComponent().getRouter().navTo("appHome" /*, {}, true /*no history*/ );
                }
            }
        },
        onRouteMatched: function (oEvent) {
            var sRouteName = oEvent.getParameter("name"),
                oArguments = oEvent.getParameter("arguments");

            this._updateUIElements();

            // Save the current route name
            this.currentRouteName = sRouteName;
            this.currentProduct = oArguments.product;

            var chatButton = sap.ui.getCore().byId("__xmlview0--chatButton");
            var configModel = this.getOwnerComponent().getModel("configSite");
            var hasAutoChat = configModel.getProperty("/hasAutoChat");
            if (chatButton != null && chatButton.getVisible() && hasAutoChat != null && hasAutoChat) {
                this.shutPopOver(chatButton);
            }
        },

        // Update the close/fullscreen buttons visibility
        _updateUIElements: function () {
            var oModel = this.oOwnerComponent.getModel();
            var oUIState = this.oOwnerComponent.getHelper().getCurrentUIState();
            oModel.setData(oUIState);
        },
      
        onStateChanged: function (oEvent) {
            var bIsNavigationArrow = oEvent.getParameter("isNavigationArrow"),
                sLayout = oEvent.getParameter("layout");

            this._updateUIElements();

            // Replace the URL with the new layout if a navigation arrow was used
            if (bIsNavigationArrow) {
                this.oRouter.navTo(this.currentRouteName, { layout: sLayout }, true);
            }
        },
        handleBackButtonPressed: function () {
            this.oRouter.navTo("tile", { layout: sap.f.LayoutType.OneColumn }, true);
        },
        onExit: function () {
            this.oRouter.detachRouteMatched(this.onRouteMatched, this);
            this.oRouter.detachBeforeRouteMatched(this.onBeforeRouteMatched, this);
        },
        handlePopoverPress: function (oEvent) {
            var oButton = oEvent.getSource();

            var oView = this.getView();
            // create popover
            if (!this._pPopover) {
                this._pPopover = Fragment.load({
                    id: oView.getId(),
                    name: "demo.fragments.QuickView",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);

                    return oPopover;
                });
            }
            this._pPopover.then(function (oPopover) {
                oPopover.openBy(oButton);
            });
        },
        getMailbox: function () {
            this.oRouter.navTo('MiBandeja');
        },
        validateLogin: function () {
            return this.getUserModel();
        }
    });
});