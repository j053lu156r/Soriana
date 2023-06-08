sap.ui.define(["jquery.sap.global","sap/ui/core/Fragment","demo/controllers/BaseChat","sap/ui/core/mvc/Controller","sap/ui/model/json/JSONModel","sap/ui/core/routing/History","sap/ui/core/routing/Router","sap/f/FlexibleColumnLayout","demo/models/BaseModel","sap/f/library"],function(e,t,o,n,r,a){"use strict";return o.extend("demo.controllers.App",{onInit:function(){this.oOwnerComponent=this.getOwnerComponent();this.oRouter=this.oOwnerComponent.getRouter();this.oRouter.attachRouteMatched(this.onRouteMatched,this);this.oRouter.attachBeforeRouteMatched(this.onBeforeRouteMatched,this);this.oRouter.fireBeforeRouteMatched();this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass())},onBeforeRouteMatched:function(e){var t=e.getParameter("name");if(this.validateLogin()){var o=this.getOwnerComponent().getModel();var n=e.getParameters().arguments.layout,r;if(!n){r=this.oOwnerComponent.getHelper().getNextUIState(0);n=r.layout}if(n){o.setProperty("/layout",n)}}else{if(t!="appHome"){this.getOwnerComponent().getRouter().navTo("appHome")}}},onRouteMatched:function(e){var t=e.getParameter("name"),o=e.getParameter("arguments");this._updateUIElements();this.currentRouteName=t;this.currentProduct=o.product;var n=sap.ui.getCore().byId("__xmlview0--chatButton");var r=this.getOwnerComponent().getModel("configSite");var a=r.getProperty("/hasAutoChat");if(n!=null&&n.getVisible()&&a!=null&&a){this.shutPopOver(n)}},_updateUIElements:function(){var e=this.oOwnerComponent.getModel();var t=this.oOwnerComponent.getHelper().getCurrentUIState();e.setData(t)},onStateChanged:function(e){var t=e.getParameter("isNavigationArrow"),o=e.getParameter("layout");this._updateUIElements();if(t){this.oRouter.navTo(this.currentRouteName,{layout:o},true)}},handleBackButtonPressed:function(){this.oRouter.navTo("tile",{layout:sap.f.LayoutType.OneColumn},true)},onExit:function(){this.oRouter.detachRouteMatched(this.onRouteMatched,this);this.oRouter.detachBeforeRouteMatched(this.onBeforeRouteMatched,this)},handlePopoverPress:function(e){var o=e.getSource();var n=this.getView();if(!this._pPopover){this._pPopover=t.load({id:n.getId(),name:"demo.fragments.QuickView",controller:this}).then(function(e){n.addDependent(e);return e})}this._pPopover.then(function(e){e.openBy(o)})},getMailbox:function(){this.oRouter.navTo("MiBandeja")},validateLogin:function(){return this.getUserModel()}})});