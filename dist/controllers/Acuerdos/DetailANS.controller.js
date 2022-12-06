sap.ui.define(["sap/ui/model/json/JSONModel","demo/controllers/BaseController"],function(e,t){"use strict";var o=new this.Acuerdos;return t.extend("demo.controllers.Acuerdos.DetailANS",{onInit:function(){var e=this.getView().byId("exitFullScreenBtn"),t=this.getView().byId("enterFullScreenBtn");this.oRouter=this.getOwnerComponent().getRouter();this.oModel=this.getOwnerComponent().getModel();this.oRouter.getRoute("detailANS").attachPatternMatched(this._onDocumentMatched,this);[e,t].forEach(function(e){e.addEventDelegate({onAfterRendering:function(){if(this.bFocusFullScreenButton){this.bFocusFullScreenButton=false;e.focus()}}.bind(this)})},this)},handleItemPress:function(e){},handleFullScreen:function(){this.bFocusFullScreenButton=true;var e=this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");this.oRouter.navTo("detailCargoANS",{layout:e,sociedad:this._sociedad,documento:this._documento,ejercicio:this._ejercicio,tienda:this._tienda})},handleExitFullScreen:function(){this.bFocusFullScreenButton=true;var e=this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");this.oRouter.navTo("detailCargoANS",{layout:e,sociedad:this._sociedad,documento:this._documento,ejercicio:this._ejercicio,tienda:this._tienda})},handleClose:function(){var e=this.oModel.getProperty("/actionButtonsInfo/endColumn/closeColumn");this.oRouter.navTo("detailAcuerdosAS",{layout:e,document:this._documento,sociedad:this._sociedad,ejercicio:this._ejercicio,doc:this._documento})},_onDocumentMatched:function(t){console.log(t.getParameter("arguments"));this._sociedad=t.getParameter("arguments").sociedad||this._sociedad||"0";this._documento=t.getParameter("arguments").document||this._documento||"0";this._ejercicio=t.getParameter("arguments").ejercicio||this._ejercicio||"0";this._tienda=t.getParameter("arguments").tda||this._tienda||"0";console.log("1");var n={Sociedad:this._sociedad,Documento:this._documento,Ejercicio:this._ejercicio,Tienda:this._tienda};console.log("2");this.getOwnerComponent().setModel(new e(n),"HeadCargoNS");var r="AcuerdosSet?$expand=AcuNivSerDet&$filter=";console.log("3");r+="Sociedad eq '"+this._sociedad+"'";r+=" and Documento eq '"+this._documento+"'";r+=" and Ejercicio eq '"+this._ejercicio+"'";r+=" and Tienda eq '"+this._tienda+"'";this.getView().byId("DetCargoNS").setBusy(true);console.log("4");o.getJsonModelAsync(r,function(t,o){var n=t.getProperty("/results/0");if(n!=null){var r=n.AcuNivSerDet.results.reduce((e,t)=>+e+(+t["Zboni"]||0),0);var i=n.AcuNivSerDet.results.reduce((e,t)=>+e+(+t["Zieps"]||0),0);var a=n.AcuNivSerDet.results.reduce((e,t)=>+e+(+t["Ziva"]||0),0);var c=n.AcuNivSerDet.results.reduce((e,t)=>+e+(+t["Total"]||0),0);var s={TotCargo:Number(r.toFixed(2)),TotIEPS:Number(i.toFixed(2)),TotIVA:Number(a.toFixed(2)),TotTotal:Number(c.toFixed(2))};o.getOwnerComponent().setModel(new e(s),"TotCargoNS");o.getOwnerComponent().setModel(new e(n),"DetCargoNSHdr");console.log("5");o.paginate("DetCargoNSHdr","/AcuNivSerDet",1,0)}o.getView().byId("DetCargoNS").setBusy(false)},function(e){e.getView().byId("DetCargoNS").setBusy(false)},this)},buildExportTable:function(){var e=this.getOwnerComponent().getModel("appTxts");var t=[{name:e.getProperty("/cargoNS.proveedor"),template:{content:"{Lifnr}"}},{name:e.getProperty("/cargoNS.referencia"),template:{content:"{Belnr}"}},{name:e.getProperty("/cargoNS.pedido"),template:{content:"{Ebeln}"}},{name:e.getProperty("/cargoNS.tienda"),template:{content:"{Werks}"}},{name:e.getProperty("/cargoNS.sku"),template:{content:"{Matnr}"}},{name:e.getProperty("/cargoNS.codigo"),template:{content:"{Ean11}"}},{name:e.getProperty("/cargoNS.descripcion"),template:{content:"{Maktx}"}},{name:e.getProperty("/cargoNS.cantidad"),template:{content:"{Menge}"}},{name:e.getProperty("/cargoNS.bonificacion"),template:{content:"{Zboni}"}},{name:e.getProperty("/cargoNS.ieps"),template:{content:"{Zieps}"}},{name:e.getProperty("/cargoNS.iva"),template:{content:"{Ziva}"}},{name:e.getProperty("/cargoNS.costoNormal"),template:{content:"{Zvkp0}"}},{name:e.getProperty("/cargoNS.costoOferta"),template:{content:"{Zpb00}"}},{name:e.getProperty("/cargoNS.diferencia"),template:{content:"{Difer}"}},{name:e.getProperty("/cargoNS.bitIeps"),template:{content:"{Bieps}"}}];this.exportxls("DetCargoNSHdr","/AcuNivSerDet/results",t)}})});