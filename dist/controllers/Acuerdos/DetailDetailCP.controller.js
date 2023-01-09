sap.ui.define(["sap/ui/model/json/JSONModel","demo/controllers/BaseController"],function(e,t){"use strict";var o=new this.Acuerdos;return t.extend("demo.controllers.Acuerdos.DetailDetailCP",{onInit:function(){this.oRouter=this.getOwnerComponent().getRouter();this.oModel=this.getOwnerComponent().getModel();this.oRouter.getRoute("detailDetailAcuCP").attachPatternMatched(this._onDocumentMatched,this)},handleItemPress:function(e){},handleFullScreen:function(){console.log("aqu");var e=this.getView().getParent().getParent();e.setLayout(sap.f.LayoutType.EndColumnFullScreen);this.getView().byId("enterFullScreenBtn").setVisible(false);this.getView().byId("exitFullScreenBtn").setVisible(true)},handleExitFullScreen:function(){console.log("aqu2");var e=this.getView().getParent().getParent();e.setLayout(sap.f.LayoutType.ThreeColumnsMidExpanded);this.getView().byId("enterFullScreenBtn").setVisible(true);this.getView().byId("exitFullScreenBtn").setVisible(false)},handleClose:function(){window.history.go(-1)},onBack:function(){window.history.go(-1)},_onDocumentMatched:function(t){console.log(t.getParameter("arguments"));this._sociedad=t.getParameter("arguments").sociedad||this._sociedad||"0";this._documento=t.getParameter("arguments").document||this._documento||"0";this._ejercicio=t.getParameter("arguments").ejercicio||this._ejercicio||"0";this._tienda=t.getParameter("arguments").tda||this._tienda||"0";console.log("1");var n={Sociedad:this._sociedad,Documento:this._documento,Ejercicio:this._ejercicio,Tienda:this._tienda};console.log("2");this.getOwnerComponent().setModel(new e(n),"HeadCargoNS");var r="AcuerdosSet?$expand=AcuNivSerDet&$filter=";console.log("3");r+="Sociedad eq '"+this._sociedad+"'";r+=" and Documento eq '"+this._documento+"'";r+=" and Ejercicio eq '"+this._ejercicio+"'";r+=" and Tienda eq '"+this._tienda+"'";this.getView().byId("DetCargoNS").setBusy(true);console.log("4");o.getJsonModelAsync(r,function(t,o){var n=t.getProperty("/results/0");if(n!=null){var r=n.AcuNivSerDet.results.reduce((e,t)=>+e+(+t["Zboni"]||0),0);var a=n.AcuNivSerDet.results.reduce((e,t)=>+e+(+t["Zieps"]||0),0);var i=n.AcuNivSerDet.results.reduce((e,t)=>+e+(+t["Ziva"]||0),0);var s=n.AcuNivSerDet.results.reduce((e,t)=>+e+(+t["Total"]||0),0);var c={TotCargo:Number(r.toFixed(2)),TotIEPS:Number(a.toFixed(2)),TotIVA:Number(i.toFixed(2)),TotTotal:Number(s.toFixed(2))};o.getOwnerComponent().setModel(new e(c),"TotCargoNS");o.getOwnerComponent().setModel(new e(n),"DetCargoNSHdr");console.log("5");o.paginate("DetCargoNSHdr","/AcuNivSerDet",1,0)}o.getView().byId("DetCargoNS").setBusy(false)},function(e){e.getView().byId("DetCargoNS").setBusy(false)},this)},buildExportTable:function(){var e=this.getOwnerComponent().getModel("appTxts");var t=[{name:e.getProperty("/cargoNS.proveedor"),template:{content:"{Lifnr}"}},{name:e.getProperty("/cargoNS.referencia"),template:{content:"{Belnr}"}},{name:e.getProperty("/cargoNS.pedido"),template:{content:"{Ebeln}"}},{name:e.getProperty("/cargoNS.tienda"),template:{content:"{Werks}"}},{name:e.getProperty("/cargoNS.sku"),template:{content:"{Matnr}"}},{name:e.getProperty("/cargoNS.codigo"),template:{content:"{Ean11}"}},{name:e.getProperty("/cargoNS.descripcion"),template:{content:"{Maktx}"}},{name:e.getProperty("/cargoNS.cantidad"),template:{content:"{Menge}"}},{name:e.getProperty("/cargoNS.bonificacion"),template:{content:"{Zboni}"}},{name:e.getProperty("/cargoNS.ieps"),template:{content:"{Zieps}"}},{name:e.getProperty("/cargoNS.iva"),template:{content:"{Ziva}"}},{name:e.getProperty("/cargoNS.costoNormal"),template:{content:"{Zvkp0}"}},{name:e.getProperty("/cargoNS.costoOferta"),template:{content:"{Zpb00}"}},{name:e.getProperty("/cargoNS.diferencia"),template:{content:"{Difer}"}},{name:e.getProperty("/cargoNS.bitIeps"),template:{content:"{Bieps}"}}];this.exportxls("DetCargoNSHdr","/AcuNivSerDet/results",t)}})});