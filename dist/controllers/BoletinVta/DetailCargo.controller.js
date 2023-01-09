sap.ui.define(["sap/ui/model/json/JSONModel","demo/controllers/BaseController","sap/ui/core/mvc/Controller","sap/m/MessageToast","jquery.sap.global","demo/models/BaseModel"],function(e,t,o,n,r){"use strict";var a=new this.Polizas;return t.extend("demo.controllers.BoletinVta.DetailCargo",{onInit:function(){var e=this.getView().byId("exitFullScreenBtn"),t=this.getView().byId("enterFullScreenBtn");this.oRouter=this.getOwnerComponent().getRouter();this.oModel=this.getOwnerComponent().getModel();this.oRouter.getRoute("detailCargoBoletinVta").attachPatternMatched(this._onDocumentMatched,this);[e,t].forEach(function(e){e.addEventDelegate({onAfterRendering:function(){if(this.bFocusFullScreenButton){this.bFocusFullScreenButton=false;e.focus()}}.bind(this)})},this)},onListItemPress:function(e){var t=e.getSource().getBindingContext("debitDet").getPath(),o=t.split("/").slice(-1).pop();var n=this.getOwnerComponent().getModel("debitDet");var r=n.getProperty("/");var a=r[o];this.getOwnerComponent().getRouter().navTo("detailCargoMatsBoletinVta",{layout:sap.f.LayoutType.ThreeColumnsEndExpanded,Company:a.Company,Forum:a.Forum,ForumDesc:a.ForumDescrition,Agreement:a.Agreement,Vendor:a.Vendor,DateCreated:this._DateCreated,document:this._document,year:this._year},true)},handleFullScreen:function(){this.bFocusFullScreenButton=true;var e=this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");this.oRouter.navTo("detailCargoBoletinVta",{layout:e,Company:this._Company,Vendor:this._Vendor,Agreement:this._Agreement,DateCreated:this._DateCreated,document:this._document,year:this._year})},handleExitFullScreen:function(){this.bFocusFullScreenButton=true;var e=this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");this.oRouter.navTo("detailCargoBoletinVta",{layout:e,Company:this._Company,Vendor:this._Vendor,Agreement:this._Agreement,DateCreated:this._DateCreated,document:this._document,year:this._year})},handleClose:function(){var e=this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");e=sap.f.LayoutType.TwoColumnsMidExpanded;this.oRouter.navTo("masterBoletinVtaPolizas",{layout:e,company:this._Company,document:this._document,year:this._year},true)},_onDocumentMatched:function(t){this._Company=t.getParameter("arguments").Company||this._Company||"0";this._Vendor=t.getParameter("arguments").Vendor||this._Vendor||"0";this._Agreement=t.getParameter("arguments").Agreement||this._Agreement||"0";this._DateCreated=t.getParameter("arguments").DateCreated||this._DateCreated||"0";this._document=t.getParameter("arguments").document||this._document||"0";this._year=t.getParameter("arguments").year||this._year||"0";var o={Company:this._Company,Vendor:this._Vendor,Agreement:this._Agreement,DateCreated:this._DateCreated};this.getOwnerComponent().setModel(new e(o),"debitDetModel");var n="debitByForumSet?$filter=Company eq '"+this._Company+"' and Agreement eq '"+this._Agreement+"' and Vendor eq '"+this._Vendor+"' and DateCreated eq '"+this._DateCreated+"' and Document eq '"+this._document+"'";this.getView().byId("debitDetTable").setBusy(true);a.getJsonModelAsync(n,function(e,t){var o=e.getProperty("/results");if(o!=null){var n=o.reduce((e,t)=>+e+(+t["Cost"]||0),0);var r=o.reduce((e,t)=>+e+(+t["Price"]||0),0);var a=o.reduce((e,t)=>+e+(+t["Bonus"]||0),0);var i=o.reduce((e,t)=>+e+(+t["Tax"]||0),0);var s=o.reduce((e,t)=>+e+(+t["Ieps"]||0),0);var d=o.reduce((e,t)=>+e+(+t["Discount"]||0),0);var u=o.reduce((e,t)=>+e+(+t["Total"]||0),0);var m=o.reduce((e,t)=>+e+(+t["DistQty"]||0),0);var l=o[0].Currency;var c={TotCost:Number(n.toFixed(2)),TotPrice:Number(r.toFixed(2)),TotBonus:Number(a.toFixed(2)),TotIVA:Number(i.toFixed(2)),TotIEPS:Number(s.toFixed(2)),TotDiscount:Number(d.toFixed(2)),Total:Number(u.toFixed(2)),TotDistQty:Number(m.toFixed(3)),Promotion:o[0].Promotion,currCode:l};t.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(c),"debTotDetModel");t.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(o),"debitDet")}t.getView().byId("debitDetTable").setBusy(false)},function(e){e.getView().byId("debitDetTable").setBusy(false)},this)},buildExportTable:function(){var e=this.getOwnerComponent().getModel("appTxts");var t=[{name:e.getProperty("/foliosCap.promocion"),template:{content:"{Promotion}"}},{name:e.getProperty("/PolizadetCargo.Agreement"),template:{content:"{Agreement}"}},{name:e.getProperty("/PolizadetCargo.Centro"),template:{content:"{Forum}"}},{name:e.getProperty("/PolizadetCargo.CentroNombre"),template:{content:"{ForumDescrition}"}},{name:e.getProperty("/PolizadetCargo.bonus"),template:{content:"{Bonus}"}},{name:e.getProperty("/PolizadetCargo.IEPS"),template:{content:"{Ieps}"}},{name:e.getProperty("/PolizadetCargo.IVA"),template:{content:"{Tax}"}},{name:e.getProperty("/PolizadetCargo.total"),template:{content:"{Total}"}}];this.exportxls("debitDet","/",t)}})});