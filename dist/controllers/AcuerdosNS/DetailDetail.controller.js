sap.ui.define(["sap/ui/model/json/JSONModel","demo/controllers/BaseController"],function(e,t){"use strict";var o=new this.Acuerdos;return t.extend("demo.controllers.AcuerdosNS.DetailDetail",{onInit:function(){var e=this.getView().byId("exitFullScreenBtn"),t=this.getView().byId("enterFullScreenBtn");this.oRouter=this.getOwnerComponent().getRouter();this.oModel=this.getOwnerComponent().getModel();this.oRouter.getRoute("detailDetailAcuNS").attachPatternMatched(this._onDocumentMatched,this);[e,t].forEach(function(e){e.addEventDelegate({onAfterRendering:function(){if(this.bFocusFullScreenButton){this.bFocusFullScreenButton=false;e.focus()}}.bind(this)})},this)},handleItemPress:function(e){},handleFullScreen:function(){this.bFocusFullScreenButton=true;var e=this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");this.oRouter.navTo("detailDetailAcuNS",{layout:e,sociedad:this._sociedad,documento:this._documento,ejercicio:this._ejercicio,tienda:this._tienda})},handleExitFullScreen:function(){this.bFocusFullScreenButton=true;var e=this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");this.oRouter.navTo("detailDetailAcuNS",{layout:e,sociedad:this._sociedad,documento:this._documento,ejercicio:this._ejercicio,tienda:this._tienda})},handleClose:function(){var e=this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");this.oRouter.navTo("masterAcuerdosNS",{layout:e})},_onDocumentMatched:function(t){this._sociedad=t.getParameter("arguments").sociedad||this._sociedad||"0";this._documento=t.getParameter("arguments").documento||this._documento||"0";this._ejercicio=t.getParameter("arguments").ejercicio||this._ejercicio||"0";this._tienda=t.getParameter("arguments").tienda||this._tienda||"0";var n={Sociedad:this._sociedad,Documento:this._documento,Ejercicio:this._ejercicio,Tienda:this._tienda};this.getOwnerComponent().setModel(new e(n),"acuHeadDetDetModel");var i="AcuerdosNSDetSet?$filter=";i+="Bukrs eq '"+this._sociedad+"'";i+=" and Belnr eq '"+this._documento+"'";i+=" and Gjahr eq '"+this._ejercicio+"'";i+=" and Werks eq '"+this._tienda+"'";this.getView().byId("AcuerdosDetDet").setBusy(true);o.getJsonModelAsync(i,function(t,o){var n=t.getProperty("/results");if(n!=null){var i=n.reduce((e,t)=>+e+(+t["Base"]||0),0);var r=n.reduce((e,t)=>+e+(+t["Desct"]||0),0);var s=n.reduce((e,t)=>+e+(+t["Iva"]||0),0);var a=n.reduce((e,t)=>+e+(+t["Impieps"]||0),0);var c={TotBase:Number(i.toFixed(2)),TotDescto:Number(r.toFixed(2)),TotIVA:Number(s.toFixed(2)),TotIEPS:Number(a.toFixed(2))};o.getOwnerComponent().setModel(new e(c),"acuTotDetDetModel");o.getOwnerComponent().setModel(new e(n),"AcuDetDetHdr")}o.getView().byId("AcuerdosDetDet").setBusy(false)},function(e){e.getView().byId("AcuerdosDetDet").setBusy(false)},this)},buildExportTable:function(){var e=this.getOwnerComponent().getModel("appTxts");var t=[{name:e.getProperty("/acuerdos.sucursal"),template:{content:"{Werks}"}},{name:e.getProperty("/acuerdosNS.referencia"),template:{content:"{Refer}"}},{name:e.getProperty("/acuerdosNS.proveedor"),template:{content:"{Lifnr}"}},{name:e.getProperty("/acuerdos.base"),template:{content:"{Base}"}},{name:e.getProperty("/acuerdos.detDesc"),template:{content:"{Desct}"}},{name:e.getProperty("/acuerdos.detIVA"),template:{content:"{Iva}"}},{name:e.getProperty("/acuerdos.detPDesc"),template:{content:"{Prdes}"}},{name:e.getProperty("/acuerdosNS.indIEPS"),template:{content:"{Bitieps}"}},{name:e.getProperty("/acuerdosNS.ieps"),template:{content:"{Impieps}"}}];this.exportxls("AcuDetDetHdr","/",t)}})});