sap.ui.define(["demo/controllers/BaseController","sap/m/MessageBox","sap/m/PDFViewer","sap/ui/core/routing/History","sap/ui/core/routing/Router","sap/ui/export/library","sap/ui/export/Spreadsheet"],function(e,t,o,r,s,a,n){"use strict";var l=a.EdmType;var i=new this.ACEscalas;return e.extend("demo.controllers.Statement.Crecimiento",{onInit:function(){this.oRouter=this.getOwnerComponent().getRouter();this.oModel=this.getOwnerComponent().getModel();this.oRouter.getRoute("Crecimiento").attachPatternMatched(this._onDocumentMatched,this)},searchData:function(){var e=this.getOwnerComponent().getModel("appTxts");var o=e.getProperty("/ACEscalas.indSoc");var r=e.getProperty("/ACEscalas.indEje");var s=e.getProperty("/foliosCap.indVendor");var a=true;if(!i.getModel()){i.initModel()}var n=this.sociedad;var l=this._document;var u=this.year;var d=this.getConfigModel().getProperty("/supplierInputKey");if(d===""||d===null||d==="undefined"){a=false;t.error(s)}else if(l==""||l==null){t.error(e.getProperty("/ACEscalas.indNo"));a=false}else if(l!=""&&l!=null){if(n==""||n==null){t.error(o);a=false}else if(u==""||u==null){t.error(r);a=false}}console.log(this._document,this.sociedad,this.year);if(a){var c="ScaleSet?$filter=bukrs eq '"+n+"' and belnr eq '"+l+"' and gjahr eq '"+u+"' and lifnr eq '"+d+"'";this.getView().byId("tableEscalas2").setBusy(true);i.getJsonModelAsync(c,function(e,t){var o=e.getProperty("/results");if(o!=null){if(o.length>0){var r=o.reduce((e,t)=>+e+(+t["dmbtr"]||0),0);var s=o.reduce((e,t)=>+e+(+t["zboni"]||0),0);var a=o.reduce((e,t)=>+e+(+t["ziva"]||0),0);var n=o.reduce((e,t)=>+e+(+t["zieps"]||0),0);var l=o.reduce((e,t)=>+e+(+t["stotal"]||0),0);var i=o[0].waers;var u={totImporte:Number(r.toFixed(2)),TotDescto:Number(s.toFixed(2)),totIVA:Number(a.toFixed(2)),totIEPS:Number(n.toFixed(2)),TotStot:Number(l.toFixed(2)),currCode:i};t.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(u),"escalaTotModel");t.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(o),"EscalasDta");t.paginate("EscalasDta","/",1,0)}}t.getView().byId("tableEscalas2").setBusy(false)},function(e){e.getView().byId("tableEscalas2").setBusy(false)},this)}},_onDocumentMatched:function(e){this._document=e.getParameter("arguments").document||this._document||"0";this.sociedad2=e.getParameter("arguments").sociedad||this._proveedor||"0";this.sociedad=this.sociedad2.split("-")[0];this.year=this.sociedad2.split("-")[1];console.log(this._document,this.sociedad,this.year);this.searchData()},handleFullScreen:function(){var e=this.getOwnerComponent().getHelper().getNextUIState(2);this.bFocusFullScreenButton=true;var t=this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");this.getOwnerComponent().getRouter().navTo("AcuerdosEC",{layout:t,document:this._document,sociedad:this.sociedad},true)},handleExitFullScreen:function(){this.bFocusFullScreenButton=true;var e=this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");this.oRouter.navTo("EstadoCuenta",{layout:e,document:this._document,sociedad:this.sociedad})},handleClose:function(){console.log("on hanlde close");this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel([]),"escalaTotModel");this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel([]),"EscalasDta");var e=this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");this.oRouter.navTo("EstadoCuenta",{})},buildExportTable:function(){var e,t,o,r,s,a=this;if(!a._oTable){a._oTable=this.byId("tableEscalas2")}s=a._oTable;console.log(s.mBindingInfos.items.binding.oList);t=s.mBindingInfos.items.binding.oList;e=a.createColumnConfig();o={workbook:{columns:e,hierarchyLevel:"Level"},dataSource:t,fileName:"Acuerdos de Escalas",worker:false};r=new n(o);r.build().finally(function(){r.destroy()})},createColumnConfig:function(){var e=[];var t=this.getOwnerComponent().getModel("appTxts");e.push({label:t.getProperty("/ACEscalas.arrangement"),type:l.String,property:"knuma"});e.push({label:t.getProperty("/ACEscalas.matdoc"),type:l.String,property:"mblnr"});e.push({label:t.getProperty("/ACEscalas.matdocYear"),type:l.String,property:"mjahr"});e.push({label:t.getProperty("/ACEscalas.movClass"),type:l.String,property:"bwart"});e.push({label:t.getProperty("/ACEscalas.reference"),type:l.String,property:"xblnr"});e.push({label:t.getProperty("/ACEscalas.plant"),type:l.String,property:"werks"});e.push({label:t.getProperty("/ACEscalas.amount"),type:l.String,property:"dmbtr"});e.push({label:t.getProperty("/ACEscalas.perDescount"),type:l.String,property:"zboni"});e.push({label:t.getProperty("/ACEscalas.Descount"),type:l.String,property:"zmgn3"});e.push({label:t.getProperty("/ACEscalas.IVA"),type:l.String,property:"ziva"});e.push({label:t.getProperty("/ACEscalas.IEPS"),type:l.String,property:"zieps"});e.push({label:t.getProperty("/ACEscalas.subtotal"),type:l.Number,property:"stotal"});return e}})});