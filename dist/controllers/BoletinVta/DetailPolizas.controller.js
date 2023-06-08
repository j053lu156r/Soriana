sap.ui.define(["demo/controllers/BaseController","sap/m/MessageBox","sap/m/PDFViewer","sap/ui/core/routing/History","sap/ui/core/routing/Router"],function(e,t,o,n,a){"use strict";var i=new this.Polizas;return e.extend("demo.controllers.BoletinVta.DetailPolizas",{onInit:function(){this._pdfViewer=new o;this.getView().addDependent(this._pdfViewer);this.oRouter=this.getOwnerComponent().getRouter();this.oModel=this.getOwnerComponent().getModel();this.oRouter.getRoute("BoletinVtaDetailPolizas").attachPatternMatched(this._onDocumentMatched,this);this.getView().addEventDelegate({onAfterShow:function(e){var t=this.getOwnerComponent().getModel();t.setProperty("/barVisible",true);this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel,"PolizasHdr")}},this);this.configFilterLanguage(this.getView().byId("filterBar"))},handleFullScreen:function(){this.bFocusFullScreenButton=true;var e=this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");this.oRouter.navTo("BoletinVtaDetailPolizas",{layout:e,company:this._company,document:this._document,year:this._year})},handleExitFullScreen:function(){this.bFocusFullScreenButton=true;var e=this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");this.oRouter.navTo("BoletinVtaDetailPolizas",{layout:e,company:this._company,document:this._document,year:this._year})},handleClose:function(){var e=n.getInstance();var t=e.getPreviousHash();if(t!==undefined){window.history.go(-1)}else{var o=sap.ui.core.UIComponent.getRouterFor(this);o.navTo("",true)}},_onDocumentMatched:function(e){this._company=e.getParameter("arguments").company||this._company||"0";this._document=e.getParameter("arguments").document||this._document||"0";this._year=e.getParameter("arguments").year||this._year||"0";var t={company:this._company,document:this._document,year:this._year};this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(t),"policieDetModel");this.searchData()},searchData:function(){var e=this.getOwnerComponent().getModel("appTxts");var t=true;if(!i.getModel()){i.initModel()}var o="finalcialDocumentsSet?$filter=Bukrs eq '"+this._company+"' and Belnr eq '"+this._document+"' and Gjahr eq '"+this._year+"'";this.getView().byId("tablePolizas").setBusy(true);i.getJsonModelAsync(o,function(e,t){var o=e.getProperty("/results");if(o!=null){if(o.length>0){var n=o[0].Name;var a=o[0].Knuma;var i=o.reduce((e,t)=>+e+(+t["Dmbtr"]||0),0);var r=o.reduce((e,t)=>+e+(+t["Wrbtr"]||0),0);var s=o.reduce((e,t)=>+e+(+t["Wmwst"]||0),0);var l={TotBase:Number(i.toFixed(2)),TotDescto:Number(r.toFixed(2)),TotIVA:Number(s.toFixed(2)),VendorName:n,Agreement:a};t.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(l),"acuTotDetModel");t.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(o),"PolizasHdr");t.paginate("PolizasHdr","/PolizasDet",1,0)}}t.getView().byId("tablePolizas").setBusy(false)},function(e){e.getView().byId("tablePolizas").setBusy(false)},this)},onExit:function(){},onDebitDetail:function(){var e=this.getView().byId("documentoInput").getValue();var t=this.getView().byId("ejercicioInput").getValue();var o=this.getOwnerComponent().getModel("PolizasHdr");var n=o.getProperty("/");var a=n[0];this.getOwnerComponent().getRouter().navTo("detailCargoBoletinVta",{layout:sap.f.LayoutType.TwoColumnsMidExpanded,Company:a.Bukrs,Agreement:a.Knuma,Vendor:a.Lifnr,DateCreated:a.Erdat,document:e,year:t},true)},buildExportTable:function(){var e=this.getOwnerComponent().getModel("appTxts");var t=[{name:e.getProperty("/Polizas.sucursal"),template:{content:"{Centro}"}},{name:e.getProperty("/Polizas.base"),template:{content:"{Base}"}},{name:e.getProperty("/Polizas.desc"),template:{content:"{Descuento}"}},{name:e.getProperty("/Polizas.iva"),template:{content:"{IVA}"}},{name:e.getProperty("/Polizas.pDesc"),template:{content:"{PDesc}"}},{name:e.getProperty("/Polizas.unidad"),template:{content:"{Unidad}"}}];this.exportxls("PolizasHdr","/PolizasDet/results",t)}})});