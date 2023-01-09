sap.ui.define(["sap/ui/core/Fragment","demo/controllers/BaseController","sap/m/UploadCollectionParameter","sap/ui/core/mvc/Controller","sap/m/PDFViewer","sap/ui/model/json/JSONModel","sap/ui/core/routing/History","sap/ui/core/routing/Router","demo/models/BaseModel","sap/f/library"],function(e,t,a,o,r,s,n){"use strict";var i;var l;var p=new this.ComplPagoModel;var u=new this.CfdiModel;var g="/sap/opu/odata/sap/ZOSP_PYMNT_CMPL_SRV/";return t.extend("demo.controllers.Factoraje.Master",{onInit:function(){this.getView().addEventDelegate({onAfterShow:function(e){this.clearFilters();this.getConfigModel().setProperty("/updateFormatsSingle","xml");this.getOwnerComponent().setModel(new s,"Documentos")}},this)},clearFilters:function(){this.getView().byId("dateRange").setValue("");this.getView().byId("documentTxt").setValue("")},searchData:function(){if(!this.hasAccess(9)){return}let e=this.getView().byId("dateRange");let t=this.getView().byId("documentTxt");let a=this.getConfigModel().getProperty("/supplierInputKey");if(a==null||a==""){sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/helpDocs.uploader.noProvider"));return}let o=this.buildSapDate(e.getDateValue());let r=this.buildSapDate(e.getSecondDateValue());let n=t.getValue();var i=[];i.push(new sap.ui.model.Filter({path:"IStartdate",operator:sap.ui.model.FilterOperator.EQ,value1:o}));i.push(new sap.ui.model.Filter({path:"IEnddate",operator:sap.ui.model.FilterOperator.EQ,value1:r}));i.push(new sap.ui.model.Filter({path:"ILifnr",operator:sap.ui.model.FilterOperator.EQ,value1:a}));i.push(new sap.ui.model.Filter({path:"IOption",operator:sap.ui.model.FilterOperator.EQ,value1:"4"}));if(n!==""){i.push(new sap.ui.model.Filter({path:"IAugbl",operator:sap.ui.model.FilterOperator.EQ,value1:t.getValue()}))}var l="ZOSP_PYMNT_CMPL_SRV";var p="HeaderPYMNTCSet";var u=["EPYMNTDOCSNAV","EPYMNTPRGRMNAV"];var g=i;var d="";sap.ui.core.BusyIndicator.show();var c=this;this._GetODataV2(l,p,g,u,d).then(function(e){sap.ui.core.BusyIndicator.hide();var t=[];var a=e.data.results;console.log(a);var o=a[0].EPYMNTDOCSNAV.results;var r=o.filter(e=>e.Vblnr.startsWith("58"));if(r.length>0){var n={Detalles:{results:[...r]}};c.getOwnerComponent().setModel(new s(n),"Documentos");c.paginate("Documentos","/Detalles",1,0)}})},generateFile:function(e){let t=e.getSource().getBindingContext("Documentos").getPath().split("/").pop();let a=this.getOwnerComponent().getModel("Documentos").getProperty("/Detalles/Paginated/results");let o=a[t];let r=String(o.Laufd).replace(/-/g,"");let s=String(o.Augdt).replace(/-/g,"");let n=`HeaderPYMNTCSet?$expand=ETXTHDRNAV,ETXTTOTALNAV,ETXTTAXNAV,ETXTFACTPROVNAV,ETXTFACTSORNAV,ETXTDISCOUNTNAV,ETXTAGREEMENTNAV&$filter= IOption eq '3' and \n            ILaufd eq '${r}' and \n            ILaufi eq '${o.Laufi}' and \n            IBukrs eq '${o.Bukrs}' and \n            ILifnr eq '${o.Lifnr}' and \n            IGjahr eq '${o.Gjahr}' and \n            IVblnr eq '${o.Vblnr}' and \n            IAugdt eq '${s}'&$format=json`;let i=this.getOdata(g);let l=this.getOdataJsonModel(n,i);let p=l.getJSON();let u=JSON.parse(p);let d=Object.values(u.results[0].ETXTHDRNAV.results[0]).slice(1).join("\t");let c=u.results[0].ETXTTOTALNAV.results;let h=u.results[0].ETXTTAXNAV.results;let m=u.results[0].ETXTFACTPROVNAV.results;let f=u.results[0].ETXTFACTSORNAV.results;let v=u.results[0].ETXTDISCOUNTNAV.results;let C=u.results[0].ETXTAGREEMENTNAV.results;let y=[d];y=y.concat(this.generaRenglonesArchivo(c));y=y.concat(this.generaRenglonesArchivo(h));y=y.concat(this.generaRenglonesArchivo(m));y=y.concat(this.generaRenglonesArchivo(f));y=y.concat(this.generaRenglonesArchivo(v));y=y.concat(this.generaRenglonesArchivo(C));let T=y.join("\n");let D=String(o.Bukrs+"_"+o.Gjahr+"_"+o.Vblnr+" -Comp Pago");sap.ui.core.util.File.save(T,D,"txt","text/plain","utf-8",false)},generaRenglonesArchivo:function(e){let t=[];for(let a=0;a<e.length;a++)t.push(Object.values(e[a]).slice(1).join("\t"));return t},formatAvailableToIcon:function(e){switch(e){case"1":return"sap-icon://accept";break;default:return"sap-icon://decline";break}return e?"sap-icon://accept":"sap-icon://decline"},buildExportTable:function(){var e=this.getOwnerComponent().getModel("appTxts");var t=[{name:e.getProperty("/pay.headerCompanyUPC"),template:{content:"{Butxt}"}},{name:e.getProperty("/pay.headerPaymentTypeUPC"),template:{content:"{Text2}"}},{name:e.getProperty("/pay.headerDocumentUPC"),template:{content:"{Vblnr}"}},{name:e.getProperty("/pay.headerLimitDateUPC"),template:{content:"{Laufd}"}},{name:e.getProperty("/pay.headerAmountUPC"),template:{content:"{Rbetr}"}},{name:e.getProperty("/pay.headerNC"),template:{content:"{Nc}"}},{name:e.getProperty("/pay.headerCP")+" 03",template:{content:"{Cp03}"}},{name:e.getProperty("/pay.headerCP")+" 17S",template:{content:"{Cp17s}"}},{name:e.getProperty("/pay.headerCP")+" 17R",template:{content:"{Cp17r}"}},{name:e.getProperty("/pay.headerEstatusUPC"),template:{content:"{Rzawe}"}}];this.exportxls("Documentos","/Detalles/results",t)},onExit:function(){if(this._oDialog){this._oDialog.destroy();this._oDialog=null}if(this._uploadDialog1){this._uploadDialog1.destroy();this._uploadDialog1=null}if(this._uploadDialog2){this._uploadDialog2.destroy();this._uploadDialog2=null}if(this._oPopover){this._oPopover.destroy();this._oPopover=null}},openUploadDialog:function(){if(!this.hasAccess(10)){return}if(!this._uploadDialog2){this._uploadDialog2=sap.ui.xmlfragment("uploadInvoice","demo.fragments.UploadInvoice",this);this.getView().addDependent(this._uploadDialog2)}this._uploadDialog2.open()},onCloseDialogUpload:function(){if(this._uploadDialog2){this._uploadDialog2.destroy();this._uploadDialog2=null}},documentUploadPress:function(){var e=sap.ui.core.Fragment.byId("uploadInvoice","fileUploader");var t=sap.ui.core.Fragment.byId("uploadInvoice","logUploadList");var a=sap.ui.core.Fragment.byId("uploadInvoice","uploadBox");var o=this.getConfigModel().getProperty("/supplierInputKey");if(!e.getValue()){sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/helpDocs.uploader.nodata"));return}var r={Lifnr:o,Type:"P",Log:[{Uuid:"",Description:"",Sts:""}]};var n=this.byId("complPagoList").getSelectedIndices();if(n.length>0){var i=this.byId("complPagoList").getContextByIndex(n[0]).getObject();r.Vblnr=i.Vblnr;r.Year=i.Gjahr}var l=e.oFileUpload.files[0];var p=new FileReader;p.onload=function(o){var n={};var i=o.target.result.split(",");n.Cfdii=i[1];r.Cfdi=i[1];var l=u.create("/ECfdiSet ",r);if(l!=null){a.setVisible(false);if(l.Log!=null){t.setVisible(true);t.setModel(new s(l))}else{sap.m.MessageBox.error(l.EMessage)}}e.clear()};p.readAsDataURL(l)},delFact:function(e){sap.ui.getCore().setModel(null,"deliverTable");var t=sap.ui.core.Fragment.byId(i,"UploadCollection");var a=sap.ui.core.Fragment.byId(i,"factList");var o=sap.ui.core.Fragment.byId(i,"closeDialog");t.setVisible(true);a.setVisible(false);o.setVisible(true);if(i==="A"){sap.ui.getCore().getControl(i+"--enviarDialog").setVisible(true);sap.ui.getCore().getControl(i+"--tContacto").setVisible(true);sap.ui.getCore().getControl(i+"--idCto").setVisible(true);sap.ui.getCore().getControl(i+"--persCto").setVisible(true);sap.ui.getCore().getControl(i+"--cmntAnexo").setVisible(true);if(l===false){var r=sap.ui.core.Fragment.byId(i,"UploadCollection");r.removeItem(r.getItems()[0])}}else{sap.ui.core.Fragment.byId(i,"UploadCollection").setBusy(false)}this.getOwnerComponent().setModel(null,"deliverTable")},sendFact:function(e){var t=e.getSource().getBindingContext("deliverTable");var a=this.byId("complPagoList").getSelectedItems();var o={};o.xml=t.getProperty("/xml");o.pdf=t.getProperty("/pdf");a.forEach(function(e){var t=e.getBindingContext("coomplPagoTable").getObject().Belnr;var a=e.getBindingContext("coomplPagoTable").getObject().Gjahr;var r=e.getBindingContext("coomplPagoTable").getObject().Bukrs;var s=r+t+a;if(!o.pagos){o.pagos=s}else{o.pagos=o.pagos+","+s}});var r=p.verify.sendCfdi("/VerificarXmlSet",o);if(r){if(r.correcto){sap.m.MessageBox.success(r.mensaje);this.successVerify()}else{var s=this;sap.m.MessageBox.error(r.mensaje,{actions:["Cargar otra factura"],styleClass:"sapUiSizeCompact",onClose:function(e){if(e==="Enviar con desviación"){o.preliminar="X";var t=p.verify.sendCfdi("/VerificarXmlSet",o);if(t){if(t.correcto){sap.m.MessageBox.success(t.mensaje);s.successVerify()}else{sap.m.MessageBox.error(t.mensaje);s.delFact()}}}else{s.delFact()}}},this)}}},successVerify:function(){this.delFact(null);this.searchData();this.onCloseDialogUpload()},onFileSizeExceed:function(){sap.m.MessageBox.warning(this.getOwnerComponent().getModel("appTxts").getProperty("/payCon.size"))},onFilenameLengthExceed:function(){sap.m.MessageBox.warning(this.getOwnerComponent().getModel("appTxts").getProperty("/payCon.name"))},filtrado:function(e){var t=[];var a=e.getParameter("query");var o=this.getView().byId("selectFilter");var r=o.getSelectedKey();if(a&&a.length>0){var s=new sap.ui.model.Filter(r,sap.ui.model.FilterOperator.Contains,a);t.push(s)}var n=this.getView().byId("complPagoList");var i=n.getBinding("items");i.filter(t)},setDaterangeMaxMin:function(){var e=this.getView().byId("dateRange");var t=new Date;var a=new Date;var o=new Date;o.setDate(t.getDate()-7);a.setDate(t.getDate()-30);e.setSecondDateValue(t);e.setDateValue(o)},onDocumentPress:function(e){console.log("on documnt press",e);let t=e.getSource().getBindingContext("Documentos").getPath().split("/").pop();let a=this.getOwnerComponent().getModel("Documentos").getProperty("/Detalles/results");let o=a[t];console.log(o);this.getOwnerComponent().getRouter().navTo("detailFactoring",{layout:sap.f.LayoutType.TwoColumnsMidExpanded,document:o.Vblnr,sociedad:o.Bukrs,ejercicio:o.Gjahr,fecha:o.Laufd},true)}})});