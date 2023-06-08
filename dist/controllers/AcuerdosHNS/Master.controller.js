sap.ui.define(["demo/controllers/BaseController","sap/m/MessageBox"],function(e,t){"use strict";var r=new this.Acuerdos;return e.extend("demo.controllers.AcuerdosHNS.Master",{onInit:function(){this.getView().addEventDelegate({onAfterShow:function(e){var t=this.getOwnerComponent().getModel();t.setProperty("/barVisible",true);this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel,"AcuerdosHdrHNS");this.clearFilters()}},this);this.configFilterLanguage(this.getView().byId("filterBar"))},searchData:function(){var e=this.getOwnerComponent().getModel("appTxts");var o=true;if(!r.getModel()){r.initModel()}var n=this.getConfigModel().getProperty("/supplierInputKey");var a=this.getView().byId("referenciaInput").getValue();if(n==""||n==null){t.error(e.getProperty("/acuerdosHNS.indProveedor"));o=false}else if(a==""||a==null){t.error(e.getProperty("/acuerdosHNS.indReferencia"));o=false}if(o){var i="AcuerdosHNSSet?$filter=";i+="Lifnr eq '"+n+"'";i+=" and Refer eq '"+a+"'";this.getView().byId("tableAcuerdosHNS").setBusy(true);r.getJsonModelAsync(i,function(e,t){var r=e.getProperty("/results");if(r!=null){var o=r.reduce((e,t)=>+e+(+t["Canti"]||0),0);var n=r.reduce((e,t)=>+e+(+t["Cnorm"]||0),0);var a=r.reduce((e,t)=>+e+(+t["Cofer"]||0),0);var i=r.reduce((e,t)=>+e+(+t["Difer"]||0),0);var s=r.reduce((e,t)=>+e+(+t["Bonif"]||0),0);var d=r.reduce((e,t)=>+e+(+t["Impieps"]||0),0);var u=r.reduce((e,t)=>+e+(+t["Iva"]||0),0);var l={TotCanti:Number(o.toFixed(4)),TotCnorm:Number(n.toFixed(4)),TotCofer:Number(a.toFixed(4)),TotDifer:Number(i.toFixed(4)),TotBonif:Number(s.toFixed(4)),TotImpieps:Number(d.toFixed(4)),TotIva:Number(u.toFixed(4))};t.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(l),"acuTotHNSModel");t.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(r),"AcuerdosHdrHNS")}t.getView().byId("tableAcuerdosHNS").setBusy(false)},function(e){e.getView().byId("tableAcuerdosHNS").setBusy(false)},this)}},clearFilters:function(){this.getView().byId("referenciaInput").setValue("");var e=this.getOwnerComponent().getModel("AcuerdosHdrHNS");if(e){e.setData([])}var t=this.getOwnerComponent().getModel("acuTotHNSModel");if(t){t.setData([])}},buildExportTable:function(){var e=this.getOwnerComponent().getModel("appTxts");var t=[{name:e.getProperty("/acuerdosHNS.centro"),template:{content:"{Werks}"}},{name:e.getProperty("/acuerdosHNS.canti"),template:{content:"{Canti}"}},{name:e.getProperty("/acuerdosHNS.cNorm"),template:{content:"{Cnorm}"}},{name:e.getProperty("/acuerdosHNS.cOfer"),template:{content:"{Cofer}"}},{name:e.getProperty("/acuerdosHNS.difer"),template:{content:"{Difer}"}},{name:e.getProperty("/acuerdosHNS.bonif"),template:{content:"{Bonif}"}},{name:e.getProperty("/acuerdosHNS.ieps"),template:{content:"{Impieps}"}},{name:e.getProperty("/acuerdosHNS.iva"),template:{content:"{Iva}"}}];this.exportxls("AcuerdosHdrHNS","/",t)},onListItemPress:function(e){var t=e.getSource().getBindingContext("AcuerdosHdrHNS").getPath(),r=t.split("/").slice(-1).pop();var o=this.getOwnerComponent().getModel("AcuerdosHdrHNS");var n=o.getProperty("/");var a=n[r];var i=this.getConfigModel().getProperty("/supplierInputKey");var s=this.getView().byId("referenciaInput").getValue();if(s.includes("/")){var d=s.substring(0,s.indexOf("/"));var u=s.split("/")[1]}else{d=s;u="NOREF2"}this.getOwnerComponent().getRouter().navTo("detailAcuerdosHNS",{layout:sap.f.LayoutType.TwoColumnsMidExpanded,proveedor:i,ref1:d,ref2:u,centro:a.Werks},true)}})});