sap.ui.define(["sap/ui/model/json/JSONModel","demo/controllers/BaseController","sap/ui/core/mvc/Controller","sap/m/MessageToast","jquery.sap.global","demo/models/BaseModel"],function(t,e,o,n,i){"use strict";var r=new this.ACcapturados;return e.extend("demo.controllers.BoletinVta.DetailCentro",{onInit:function(){var t=this.getView().byId("exitFullScreenBtn"),e=this.getView().byId("enterFullScreenBtn");this.oRouter=this.getOwnerComponent().getRouter();this.oModel=this.getOwnerComponent().getModel();this.oRouter.getRoute("detailBoletinVtaCentros").attachPatternMatched(this._onDocumentMatched,this);[t,e].forEach(function(t){t.addEventDelegate({onAfterRendering:function(){if(this.bFocusFullScreenButton){this.bFocusFullScreenButton=false;t.focus()}}.bind(this)})},this)},onListItemPress:function(t){var e=t.getSource().getBindingContext("promotionCenterDet").getPath(),o=e.split("/").slice(-1).pop();var n=this.getOwnerComponent().getModel("promotionCenterDet");var i=n.getProperty("/");var r=i[o];this.getOwnerComponent().getRouter().navTo("detailBoletinVta",{layout:sap.f.LayoutType.ThreeColumnsEndExpanded,promotion:this._promotion,vendor:this._vendor,promDescription:this._promDesciption,IntenalClass:this._IntenalClass,plant:r.Plant,plantName:r.Name1,origin:this._origin},true)},handleFullScreen:function(){this.bFocusFullScreenButton=true;var t=this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");this.oRouter.navTo("detailBoletinVtaCentros",{layout:t,promotion:this._promotion,vendor:this._vendor,promDescription:this._promDesciption,IntenalClass:this._IntenalClass,origin:this._origin})},handleExitFullScreen:function(){this.bFocusFullScreenButton=true;var t=this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");this.oRouter.navTo("detailBoletinVtaCentros",{layout:t,promotion:this._promotion,vendor:this._vendor,promDescription:this._promDesciption,IntenalClass:this._IntenalClass,origin:this._origin})},handleClose:function(){if(this._origin==="buyer"){this.oRouter.navTo("masterBoletinVta")}else{this.oRouter.navTo("masterBoletinVtaProv")}},_onDocumentMatched:function(e){this._promotion=e.getParameter("arguments").promotion||this._promotion||"0";this._vendor=e.getParameter("arguments").vendor||this._vendor||"0";this._promDesciption=e.getParameter("arguments").promDescription||this._promDesciption||"0";this._IntenalClass=e.getParameter("arguments").IntenalClass||this._IntenalClass||"0";this._origin=e.getParameter("arguments").origin||this._origin||"0";var o={promotion:this._promotion,vendor:this._vendor,Description:this._promDesciption};this.getOwnerComponent().setModel(new t(o),"promotionDetModel");var n="promPlantListSet?$filter=InternalClass eq '"+this._IntenalClass+"'";this.getView().byId("promotionCenterTable").setBusy(true);r.getJsonModelAsync(n,function(t,e){var o=t.getProperty("/results");if(o!=null){e.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(o),"promotionCenterDet")}e.getView().byId("promotionCenterTable").setBusy(false)},function(t){t.getView().byId("promotionCenterTable").setBusy(false)},this)},buildExportTable:function(){var t=this.getOwnerComponent().getModel("appTxts");var e=[{name:t.getProperty("/foliosCapCenter.plant"),template:{content:"{Plant}"}},{name:t.getProperty("/PolizadetCargo.CentroNombre"),template:{content:"{Name1}"}},{name:t.getProperty("/foliosCapCenter.Class"),template:{content:"{ClassDesc}"}},{name:t.getProperty("/foliosCapCenter.ClassCat"),template:{content:"{ClassCat}"}}];this.exportxls("promotionCenterDet","/",e)}})});