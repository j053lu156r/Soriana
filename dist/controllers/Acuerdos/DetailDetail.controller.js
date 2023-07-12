sap.ui.define(["sap/ui/model/json/JSONModel","demo/controllers/BaseController"],function(e,t){"use strict";var o=new this.Acuerdos;return t.extend("demo.controllers.Acuerdos.DetailDetail",{onInit:function(){var e=this.getView().byId("exitFullScreenBtn"),t=this.getView().byId("enterFullScreenBtn");this.oRouter=this.getOwnerComponent().getRouter();this.oModel=this.getOwnerComponent().getModel();this.oRouter.getRoute("detailDetailAcu").attachPatternMatched(this._onDocumentMatched,this);[e,t].forEach(function(e){e.addEventDelegate({onAfterRendering:function(){if(this.bFocusFullScreenButton){this.bFocusFullScreenButton=false;e.focus()}}.bind(this)})},this)},handleItemPress:function(e){},handleFullScreen:function(){this.bFocusFullScreenButton=true;var e=this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");this.oRouter.navTo("detailDetailAcu",{layout:e,sociedad:this._sociedad,documento:this._documento,ejercicio:this._ejercicio,tienda:this._tienda})},handleExitFullScreen:function(){this.bFocusFullScreenButton=true;var e=this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");this.oRouter.navTo("detailDetailAcu",{layout:e,sociedad:this._sociedad,documento:this._documento,ejercicio:this._ejercicio,tienda:this._tienda})},handleClose:function(){var e=this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");this.oRouter.navTo("masterAcuerdos",{layout:e})},_onDocumentMatched:function(t){this._sociedad=t.getParameter("arguments").sociedad||this._sociedad||"0";this._documento=t.getParameter("arguments").documento||this._documento||"0";this._ejercicio=t.getParameter("arguments").ejercicio||this._ejercicio||"0";this._tienda=t.getParameter("arguments").tienda||this._tienda||"0";var n={Sociedad:this._sociedad,Documento:this._documento,Ejercicio:this._ejercicio,Tienda:this._tienda};this.getOwnerComponent().setModel(new e(n),"acuHeadDetDetModel");var i="AcuerdosSet?$expand=AcuDetDet&$filter=";i+="Sociedad eq '"+this._sociedad+"'";i+=" and Documento eq '"+this._documento+"'";i+=" and Ejercicio eq '"+this._ejercicio+"'";i+=" and Tienda eq '"+this._tienda+"'";this.getView().byId("AcuerdosDetDet").setBusy(true);o.getJsonModelAsync(i,function(t,o){var n=t.getProperty("/results/0");if(n!=null){var i=n.AcuDetDet.results.reduce((e,t)=>+e+(+t["Compra"]||0),0);var r=n.AcuDetDet.results.reduce((e,t)=>+e+(+t["Descuento"]||0),0);var s=n.AcuDetDet.results.reduce((e,t)=>+e+(+t["IVA"]||0),0);if(n.AcuDetDet.results.length>0){var c=n.AcuDetDet.results[0].Waers}else{c="MXN"}var a={TotCompra:Number(i.toFixed(2)),TotDescto:Number(r.toFixed(2)),TotIVA:Number(s.toFixed(2)),TotMoneda:c};o.getOwnerComponent().setModel(new e(a),"acuTotDetDetModel");o.getOwnerComponent().setModel(new e(n),"AcuDetDetHdr");o.paginate("AcuDetDetHdr","/AcuDetDet",1,0)}o.getView().byId("AcuerdosDetDet").setBusy(false)},function(e){e.getView().byId("AcuerdosDetDet").setBusy(false)},this)},buildExportTable:function(){var e=this.getOwnerComponent().getModel("appTxts");var t=[{name:e.getProperty("/acuerdos.detConv"),template:{content:"{Convenio}"}},{name:e.getProperty("/acuerdos.detCveMov"),template:{content:"{CveMov}"}},{name:e.getProperty("/acuerdos.detFolio"),template:{content:"{Folio}"}},{name:e.getProperty("/acuerdos.detFact"),template:{content:"{Factura}"}},{name:e.getProperty("/acuerdos.detTda"),template:{content:"{Tienda}"}},{name:e.getProperty("/acuerdos.detComp"),template:{content:"{Compra}"}},{name:e.getProperty("/acuerdos.detDesc"),template:{content:"{Descuento}"}},{name:e.getProperty("/acuerdos.detIVA"),template:{content:"{IVA}"}},{name:e.getProperty("/acuerdos.detPDesc"),template:{content:"{PDesc}"}}];this.exportxls("AcuDetDetHdr","/AcuDetDet/results",t)}})});