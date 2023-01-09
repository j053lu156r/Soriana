sap.ui.define(["sap/ui/export/library","sap/ui/export/Spreadsheet","sap/ui/core/Fragment","demo/controllers/BaseController","sap/m/UploadCollectionParameter","sap/ui/core/mvc/Controller","sap/m/PDFViewer","sap/ui/model/json/JSONModel","sap/ui/core/routing/History","sap/ui/core/routing/Router","demo/models/BaseModel","sap/f/library"],function(e,t,o,a,r,l,s,i,n){"use strict";var p=e.EdmType;var u;var g;var d=new this.ComplPagoModel;var c=new this.CfdiModel;var m=new this.ValidacionesFiscales;var h="";var v="/sap/opu/odata/sap/ZOSP_PYMNT_CMPL_SRV/";return a.extend("demo.controllers.ComplPago.Master",{onInit:function(){h=this;this.getView().addEventDelegate({onAfterShow:function(e){this.getConfigModel().setProperty("/updateFormatsSingle","xml");this.getOwnerComponent().setModel(new i,"Documentos")}},this)},onAfterRendering:function(){var e=new Date;e=e.getTime()-1e3*60*60*24*5;h.getView().byId("dateRange").setDateValue(new Date(e));h.getView().byId("dateRange").setSecondDateValue(new Date);h.oModel=new i({column1:true,column2:false,column3:true,column4:true,column5:true,column6:true,column65:true,column7:true,column8:true,column9:true,column10:true,column11:false});h.getView().setModel(h.oModel);h.TableVisible()},TableVisible:function(){h.getView().byId("column1").setVisible(h.getView().getModel().getProperty("/column1"));h.getView().byId("column2").setVisible(h.getView().getModel().getProperty("/column2"));h.getView().byId("column3").setVisible(h.getView().getModel().getProperty("/column3"));h.getView().byId("column4").setVisible(h.getView().getModel().getProperty("/column4"));h.getView().byId("column5").setVisible(h.getView().getModel().getProperty("/column5"));h.getView().byId("column6").setVisible(h.getView().getModel().getProperty("/column6"));h.getView().byId("column65").setVisible(h.getView().getModel().getProperty("/column65"));h.getView().byId("column7").setVisible(h.getView().getModel().getProperty("/column7"));h.getView().byId("column8").setVisible(h.getView().getModel().getProperty("/column8"));h.getView().byId("column9").setVisible(h.getView().getModel().getProperty("/column9"));h.getView().byId("column10").setVisible(h.getView().getModel().getProperty("/column10"));h.getView().byId("column11").setVisible(h.getView().getModel().getProperty("/column11"))},clearFilters:function(){this.getView().byId("dateRange").setValue("");this.getView().byId("documentTxt").setValue("")},searchData:function(){if(!this.hasAccess(9)){return}if(h.getView().byId("dateRange").getValue()===""){sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/pay.msgPopErrSe"));return false}let e=this.getView().byId("documentTxt");let t=this.getConfigModel().getProperty("/supplierInputKey");if(t==null||t==""){sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/helpDocs.uploader.noProvider"));return}var o=[];var a=h.getView().byId("dateRange").getDateValue();var r=h.getView().byId("dateRange").getSecondDateValue();let l=this.getView().byId("dateRange");o.push(new sap.ui.model.Filter({path:"IStartdate",operator:sap.ui.model.FilterOperator.EQ,value1:this.buildSapDate(l.getDateValue())}));o.push(new sap.ui.model.Filter({path:"IEnddate",operator:sap.ui.model.FilterOperator.EQ,value1:this.buildSapDate(l.getSecondDateValue())}));o.push(new sap.ui.model.Filter({path:"ILifnr",operator:sap.ui.model.FilterOperator.EQ,value1:t}));o.push(new sap.ui.model.Filter({path:"IOption",operator:sap.ui.model.FilterOperator.EQ,value1:"2"}));if(this.getView().byId("documentTxt").getValue()!==""){o.push(new sap.ui.model.Filter({path:"IAugbl",operator:sap.ui.model.FilterOperator.EQ,value1:this.getView().byId("documentTxt").getValue()}))}var s="ZOSP_PYMNT_CMPL_SRV";var n="HeaderPYMNTCSet";var p=["EPYMNTDOCSNAV","EPYMNTPRGRMNAV"];var u=o;var g="";sap.ui.core.BusyIndicator.show();h._GEToDataV2(s,n,u,p,g).then(function(e){sap.ui.core.BusyIndicator.hide();var t=[];var o=e.data.results;console.log(o);for(var a=0;a<o.length;a++){if(!o[a].IAugbl.startsWith("58")&&!o[a].IAugbl.startsWith("59")){t.push(o[a])}}if(t.length>0){var r={Detalles:{results:[...t[0].EPYMNTDOCSNAV.results]}};console.log(r);r.Detalles.results.sort(function(e,t){if(e.Augdt>t.Augdt){return 1}if(e.Augdt<t.Augdt){return-1}return 0});h.getOwnerComponent().setModel(new i(r),"Documentos");h.paginate("Documentos","/Detalles",1,0)}})},generateFile:function(e){let t=e.getSource().getBindingContext("Documentos").getPath().split("/").pop();let o=this.getOwnerComponent().getModel("Documentos").getProperty("/Detalles/Paginated/results");let a=o[t];var r;let l=String(a.Augdt).replace(/-/g,"");let s=a.Laufd.replace(/-/g,"");let i=`HeaderPYMNTCSet?$expand=ETXTHDRNAV,ETXTTOTALNAV,ETXTTAXNAV,ETXTFACTPROVNEWNAV,ETXTFACTSORNEWNAV,ETXTDISCOUNTNEWNAV,ETXTAGREEMENTNEWNAV&$filter= IOption eq '3' and \n            ILaufd ge '${s}' and\n            \n            ILaufi eq '${a.Laufi}' and \n            IBukrs eq '${a.Bukrs}' and \n            ILifnr eq '${a.Lifnr}' and \n            IGjahr eq '${a.Gjahr}' and \n            IVblnr eq '${a.Vblnr}' and \n            IAugdt eq '${l}'&$format=json`;let n=this.getOdata(v);let p=this.getOdataJsonModel(i,n);let u=p.getJSON();let g=JSON.parse(u);if(g.results[0].ETXTFACTPROVNEWNAV.results.length!==0){r=g}let d=Object.values(r.results[0].ETXTHDRNAV.results[0]).slice(1).join("\t");let c=r.results[0].ETXTTOTALNAV.results;let m=r.results[0].ETXTTAXNAV.results;let h=r.results[0].ETXTFACTPROVNEWNAV.results;let T=r.results[0].ETXTFACTSORNEWNAV.results;let f=r.results[0].ETXTDISCOUNTNEWNAV.results;let y=r.results[0].ETXTAGREEMENTNEWNAV.results;let V=[d];V=V.concat(this.generaRenglonesArchivo(c));V=V.concat(this.generaRenglonesArchivo(m));V=V.concat(this.generaRenglonesArchivo(h));V=V.concat(this.generaRenglonesArchivo(T));V=V.concat(this.generaRenglonesArchivo(f));V=V.concat(this.generaRenglonesArchivo(y));let C=V.join("\n");let w=String(a.Bukrs+"_"+a.Gjahr+"_"+a.Vblnr+" -Comp Pago");sap.ui.core.util.File.save(C,w,"txt","text/plain","utf-8",false)},generateFilexlsx:function(e){sap.ui.core.BusyIndicator.show();let t=e.getSource().getBindingContext("Documentos").getPath().split("/").pop();let o=this.getOwnerComponent().getModel("Documentos").getProperty("/Detalles/Paginated/results");let a=o[t];var r;let l=String(a.Augdt).replace(/-/g,"");let s=a.Laufd.replace(/-/g,"");var i=[];i.push(new sap.ui.model.Filter({path:"IOption",operator:sap.ui.model.FilterOperator.EQ,value1:"3"}));i.push(new sap.ui.model.Filter({path:"ILaufd",operator:sap.ui.model.FilterOperator.EQ,value1:s}));i.push(new sap.ui.model.Filter({path:"ILaufi",operator:sap.ui.model.FilterOperator.EQ,value1:a.Laufi}));i.push(new sap.ui.model.Filter({path:"IBukrs",operator:sap.ui.model.FilterOperator.EQ,value1:a.Bukrs}));i.push(new sap.ui.model.Filter({path:"ILifnr",operator:sap.ui.model.FilterOperator.EQ,value1:a.Lifnr}));i.push(new sap.ui.model.Filter({path:"IGjahr",operator:sap.ui.model.FilterOperator.EQ,value1:a.Gjahr}));i.push(new sap.ui.model.Filter({path:"IVblnr",operator:sap.ui.model.FilterOperator.EQ,value1:a.Vblnr}));i.push(new sap.ui.model.Filter({path:"IAugdt",operator:sap.ui.model.FilterOperator.EQ,value1:l}));var n="ZOSP_PYMNT_CMPL_SRV";var p="HeaderPYMNTCSet";var u=["ETXTHDRNAV","ETXTTOTALNAV","ETXTTAXNAV","ETXTFACTPROVNEWNAV","ETXTFACTSORNEWNAV","ETXTDISCOUNTNEWNAV","ETXTAGREEMENTNEWNAV"];var g=i;var d="";sap.ui.core.BusyIndicator.show();h._GEToDataV2(n,p,g,u,d).then(function(e){var t=e.data;console.log(t);generarxls(t);sap.ui.core.BusyIndicator.hide()})},generateFilexlsxMasivo:function(){if(this.byId("complPagoList").getSelectedIndices().length<1){sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/pay.Message"));return}sap.ui.core.BusyIndicator.show();var e=this.getOwnerComponent().getModel("Documentos").getProperty("/Detalles/Paginated/results");var t=e;console.log(t);var o=this.byId("complPagoList").getSelectedIndices();console.log(o);for(var a=0;a<o.length;a++){console.log(t[o[a]]);var r=String(t[o[a]].Laufd).replace(/-/g,"");var l=String(t[o[a]].Augdt).replace(/-/g,"");console.log(r);console.log(l);var s=[];s.push(new sap.ui.model.Filter({path:"IOption",operator:sap.ui.model.FilterOperator.EQ,value1:"3"}));s.push(new sap.ui.model.Filter({path:"ILaufd",operator:sap.ui.model.FilterOperator.EQ,value1:r}));s.push(new sap.ui.model.Filter({path:"ILaufi",operator:sap.ui.model.FilterOperator.EQ,value1:t[o[a]].Laufi}));s.push(new sap.ui.model.Filter({path:"IBukrs",operator:sap.ui.model.FilterOperator.EQ,value1:t[o[a]].Bukrs}));s.push(new sap.ui.model.Filter({path:"ILifnr",operator:sap.ui.model.FilterOperator.EQ,value1:t[o[a]].Lifnr}));s.push(new sap.ui.model.Filter({path:"IGjahr",operator:sap.ui.model.FilterOperator.EQ,value1:t[o[a]].Gjahr}));s.push(new sap.ui.model.Filter({path:"IVblnr",operator:sap.ui.model.FilterOperator.EQ,value1:t[o[a]].Vblnr}));s.push(new sap.ui.model.Filter({path:"IAugdt",operator:sap.ui.model.FilterOperator.EQ,value1:l}));var i="ZOSP_PYMNT_CMPL_SRV";var n="HeaderPYMNTCSet";var p=["ETXTHDRNAV","ETXTTOTALNAV","ETXTTAXNAV","ETXTFACTPROVNEWNAV","ETXTFACTSORNEWNAV","ETXTDISCOUNTNEWNAV","ETXTAGREEMENTNEWNAV"];var u=s;var g="";sap.ui.core.BusyIndicator.show();h._GEToDataV2(i,n,u,p,g).then(function(e){var t=e.data;console.log(t);generarxls(t);sap.ui.core.BusyIndicator.hide()})}},generaRenglonesArchivo:function(e){let t=[];for(let o=0;o<e.length;o++)t.push(Object.values(e[o]).slice(1).join("\t"));return t},formatAvailableToIcon:function(e){switch(e){case"X":return"sap-icon://message-error";break;case"Y":return"sap-icon://message-success";break;default:return"sap-icon://less";break}return e?"sap-icon://accept":"sap-icon://decline"},formatStatusIcon:function(e){switch(e){case"Y":return"#008000";break;case"X":return"#FF0000";break;default:return"";break}},onExit:function(){if(this._oDialog){this._oDialog.destroy();this._oDialog=null}if(this._uploadDialog1){this._uploadDialog1.destroy();this._uploadDialog1=null}if(this._uploadDialog2){this._uploadDialog2.destroy();this._uploadDialog2=null}if(this._oPopover){this._oPopover.destroy();this._oPopover=null}},openUploadDialog:function(){var e=this.getConfigModel().getProperty("/supplierInputKey");if(!this.hasAccess(10)){return}if(e!==undefined&&e!==null){if(!this._uploadDialog2){this._uploadDialog2=sap.ui.xmlfragment("uploadInvoice","demo.fragments.UploadInvoice",this);this.getView().addDependent(this._uploadDialog2)}this._uploadDialog2.open()}else{sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/clarifications.noSupplier"))}},openUploadDialog2:function(){var e=this.getConfigModel().getProperty("/supplierInputKey");if(!this.hasAccess(10)){return}if(e!==undefined&&e!==null){if(!this._uploadDialog3){this._uploadDialog3=sap.ui.xmlfragment("uploadInvoiceTest","demo.fragments.UploadInvoice2",this);this.getView().addDependent(this._uploadDialog3)}this._uploadDialog3.open()}else{sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/clarifications.noSupplier"))}},onCloseDialogUpload2:function(){if(this._uploadDialog3){this._uploadDialog3.destroy();this._uploadDialog3=null}},onCloseDialogUpload:function(){if(this._uploadDialog2){this._uploadDialog2.destroy();this._uploadDialog2=null}},documentUploadPress2:function(){var e=this;var t=this.getConfigModel().getProperty("/supplierInputKey");var o=sap.ui.core.Fragment.byId("uploadInvoiceTest","fileUploaderTest");sap.ui.core.BusyIndicator.show(0);if(!o.getValue()){sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/helpDocs.uploader.nodata"));sap.ui.core.BusyIndicator.hide();return}var a=o.oFileUpload.files[0];var r=new FileReader;r.onload=function(a){var r=a.target.result;var l='<?xml version="1.0" encoding="utf-8"?>'+'<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" '+'xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><RecibeCFDPortal xmlns="http://tempuri.org/">'+"<XMLCFD><![CDATA["+r+"]]></XMLCFD><proveedor>"+t+"</proveedor>"+"</RecibeCFDPortal></soap:Body></soap:Envelope>";$.ajax({async:true,url:m.sUrl,method:"POST",headers:{"Content-Type":"text/xml; charset=utf-8","Access-Control-Allow-Origin":"*"},data:l,success:function(t){sap.ui.core.BusyIndicator.hide();e.onCloseDialogUpload2();o.clear();var a=new sap.ui.model.xml.XMLModel;a.setXML(t.getElementsByTagName("RecibeCFDPortalResult")[0].textContent);var r=a.getData();var l=r.getElementsByTagName("AckErrorApplication")[0].attributes[5].nodeValue;var s=r.getElementsByTagName("errorDescription")[0].firstChild.textContent;s=s.replaceAll(";","\n\n");if(l=="ACCEPTED"){sap.m.MessageBox.success(s)}else{sap.m.MessageBox.error(s)}},error:function(t,a,r){sap.ui.core.BusyIndicator.hide();e.onCloseDialogUpload2();o.clear();sap.m.MessageBox.error(e.getOwnerComponent().getModel("appTxts").getProperty("/sendInv.SendError"))}})};r.readAsText(a)},onParentClicked:function(e){var t=e.getParameter("selected");this.oModel.setData({column1:t,column2:t,column3:t,column4:t,column5:t,column6:t,column65:t,column7:t,column8:t,column9:t,column10:t,column11:t})},documentUploadPress:function(){var e=sap.ui.core.Fragment.byId("uploadInvoice","fileUploader");var t=sap.ui.core.Fragment.byId("uploadInvoice","logUploadList");var o=sap.ui.core.Fragment.byId("uploadInvoice","uploadBox");var a=this.getConfigModel().getProperty("/supplierInputKey");if(!e.getValue()){sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/helpDocs.uploader.nodata"));return}var r={Lifnr:a,Type:"P",Log:[{Uuid:"",Description:"",Sts:""}]};var l=this.byId("complPagoList").getSelectedIndices();if(l.length>0){var s=this.byId("complPagoList").getContextByIndex(l[0]).getObject();r.Vblnr=s.Vblnr;r.Year=s.Gjahr}var n=e.oFileUpload.files[0];var p=new FileReader;p.onload=function(a){var l={};var s=a.target.result.split(",");l.Cfdii=s[1];r.Cfdi=s[1];var n=c.create("/ECfdiSet ",r);if(n!=null){o.setVisible(false);if(n.Log!=null){t.setVisible(true);t.setModel(new i(n))}else{sap.m.MessageBox.error(n.EMessage)}}e.clear()};p.readAsDataURL(n)},delFact:function(e){sap.ui.getCore().setModel(null,"deliverTable");var t=sap.ui.core.Fragment.byId(u,"UploadCollection");var o=sap.ui.core.Fragment.byId(u,"factList");var a=sap.ui.core.Fragment.byId(u,"closeDialog");t.setVisible(true);o.setVisible(false);a.setVisible(true);if(u==="A"){sap.ui.getCore().getControl(u+"--enviarDialog").setVisible(true);sap.ui.getCore().getControl(u+"--tContacto").setVisible(true);sap.ui.getCore().getControl(u+"--idCto").setVisible(true);sap.ui.getCore().getControl(u+"--persCto").setVisible(true);sap.ui.getCore().getControl(u+"--cmntAnexo").setVisible(true);if(g===false){var r=sap.ui.core.Fragment.byId(u,"UploadCollection");r.removeItem(r.getItems()[0])}}else{sap.ui.core.Fragment.byId(u,"UploadCollection").setBusy(false)}this.getOwnerComponent().setModel(null,"deliverTable")},sendFact:function(e){var t=e.getSource().getBindingContext("deliverTable");var o=this.byId("complPagoList").getSelectedItems();var a={};a.xml=t.getProperty("/xml");a.pdf=t.getProperty("/pdf");o.forEach(function(e){var t=e.getBindingContext("coomplPagoTable").getObject().Belnr;var o=e.getBindingContext("coomplPagoTable").getObject().Gjahr;var r=e.getBindingContext("coomplPagoTable").getObject().Bukrs;var l=r+t+o;if(!a.pagos){a.pagos=l}else{a.pagos=a.pagos+","+l}});var r=d.verify.sendCfdi("/VerificarXmlSet",a);if(r){if(r.correcto){sap.m.MessageBox.success(r.mensaje);this.successVerify()}else{var l=this;sap.m.MessageBox.error(r.mensaje,{actions:["Cargar otra factura"],styleClass:"sapUiSizeCompact",onClose:function(e){if(e==="Enviar con desviación"){a.preliminar="X";var t=d.verify.sendCfdi("/VerificarXmlSet",a);if(t){if(t.correcto){sap.m.MessageBox.success(t.mensaje);l.successVerify()}else{sap.m.MessageBox.error(t.mensaje);l.delFact()}}}else{l.delFact()}}},this)}}},successVerify:function(){this.delFact(null);this.searchData();this.onCloseDialogUpload()},onFileSizeExceed:function(){sap.m.MessageBox.warning(this.getOwnerComponent().getModel("appTxts").getProperty("/payCon.size"))},onFilenameLengthExceed:function(){sap.m.MessageBox.warning(this.getOwnerComponent().getModel("appTxts").getProperty("/payCon.name"))},filtrado:function(e){var t=[];var o=e.getParameter("query");var a=this.getView().byId("selectFilter");var r=a.getSelectedKey();if(o&&o.length>0){var l=new sap.ui.model.Filter(r,sap.ui.model.FilterOperator.Contains,o);t.push(l)}var s=this.getView().byId("complPagoList");var i=s.getBinding("items");i.filter(t)},setDaterangeMaxMin:function(){var e=this.getView().byId("dateRange");var t=new Date;var o=new Date;var a=new Date;a.setDate(t.getDate()-7);o.setDate(t.getDate()-30);e.setSecondDateValue(t);e.setDateValue(a)},onDocumentPress:function(e){let t=e.getSource().getBindingContext("Documentos").getPath().split("/").pop();let o=this.getOwnerComponent().getModel("Documentos").getProperty("/Detalles/results");let a=o[t];console.log(a);this.getOwnerComponent().getRouter().navTo("detailComplPagos",{layout:sap.f.LayoutType.TwoColumnsMidExpanded,document:a.Vblnr,sociedad:a.Bukrs,ejercicio:a.Gjahr,fecha:a.Augdt},true)},createColumnConfig:function(){var e=h.getView().getModel("Documentos").getData().Detalles.Paginated.results,t=[];var o=this.getOwnerComponent().getModel("appTxts");t.push({label:o.getProperty("/pay.headerCompanyUPC"),type:p.String,property:"Butxt"});t.push({label:o.getProperty("/pay.headerPaymentTypeUPC"),type:p.String,property:"Text2"});t.push({label:o.getProperty("/pay.headerDocumentUPC"),type:p.String,property:"Vblnr"});t.push({label:o.getProperty("/pay.headerLimitDateUPC"),type:p.String,property:"Laufd"});t.push({label:o.getProperty("/pay.headerAmountUPC"),type:p.String,property:"Rbetr"});t.push({label:o.getProperty("/pay.headerNCMC"),type:p.String,property:"Nc_mc"});t.push({label:o.getProperty("/pay.headerNC"),type:p.String,property:"Nc"});t.push({label:o.getProperty("/pay.headerCP")+" 03",type:p.String,property:"Cp03"});t.push({label:o.getProperty("/pay.headerCP")+" 17S",type:p.String,property:"Cp17s"});t.push({label:o.getProperty("/pay.headerCP")+" 17R",type:p.String,property:"Cp17r"});t.push({label:o.getProperty("/pay.headerEstatusUPC"),type:p.String,property:"Rzawe"});return t},buildExportTable:function(){var e,o,a,r,l,s=this;if(!s._oTable){s._oTable=this.byId("complPagoList")}l=s._oTable;o=l.getBinding().oList;e=s.createColumnConfig();a={workbook:{columns:e,hierarchyLevel:"Level"},dataSource:o,fileName:"Complemento de Pago ",worker:false};r=new t(a);r.build().finally(function(){r.destroy()})},generateFileMasivo:function(e){if(this.byId("complPagoList").getSelectedIndices().length<1){sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/pay.Message"));return}var t=this.getOwnerComponent().getModel("Documentos").getProperty("/Detalles/Paginated/results");var o=t;var a=this.byId("complPagoList").getSelectedIndices();for(var r=0;r<a.length;r++){var l=String(o[a[r]].Laufd).replace(/-/g,"");var s=String(o[a[r]].Augdt).replace(/-/g,"");var i=[];i.push(new sap.ui.model.Filter({path:"IOption",operator:sap.ui.model.FilterOperator.EQ,value1:"3"}));i.push(new sap.ui.model.Filter({path:"ILaufd",operator:sap.ui.model.FilterOperator.EQ,value1:l}));i.push(new sap.ui.model.Filter({path:"ILaufi",operator:sap.ui.model.FilterOperator.EQ,value1:o[a[r]].Laufi}));i.push(new sap.ui.model.Filter({path:"IBukrs",operator:sap.ui.model.FilterOperator.EQ,value1:o[a[r]].Bukrs}));i.push(new sap.ui.model.Filter({path:"ILifnr",operator:sap.ui.model.FilterOperator.EQ,value1:o[a[r]].Lifnr}));i.push(new sap.ui.model.Filter({path:"IGjahr",operator:sap.ui.model.FilterOperator.EQ,value1:o[a[r]].Gjahr}));i.push(new sap.ui.model.Filter({path:"IVblnr",operator:sap.ui.model.FilterOperator.EQ,value1:o[a[r]].Vblnr}));i.push(new sap.ui.model.Filter({path:"IAugdt",operator:sap.ui.model.FilterOperator.EQ,value1:s}));var n="ZOSP_PYMNT_CMPL_SRV";var p="HeaderPYMNTCSet";var u=["ETXTHDRNAV","ETXTTOTALNAV","ETXTTAXNAV","ETXTFACTPROVNAV","ETXTFACTSORNAV","ETXTDISCOUNTNAV","ETXTAGREEMENTNAV"];var g=i;var d="";sap.ui.core.BusyIndicator.show();h._GEToDataV2(n,p,g,u,d).then(function(e){sap.ui.core.BusyIndicator.hide();var t=e.data;var o=Object.values(t.results[0].ETXTHDRNAV.results[0]).slice(1).join("\t");var a=t.results[0].ETXTTOTALNAV.results;var r=t.results[0].ETXTTAXNAV.results;var l=t.results[0].ETXTFACTPROVNAV.results;var s=t.results[0].ETXTFACTSORNAV.results;var i=t.results[0].ETXTDISCOUNTNAV.results;var n=t.results[0].ETXTAGREEMENTNAV.results;var p=[o];p=p.concat(h.generaRenglonesArchivo(a));p=p.concat(h.generaRenglonesArchivo(r));p=p.concat(h.generaRenglonesArchivo(l));p=p.concat(h.generaRenglonesArchivo(s));p=p.concat(h.generaRenglonesArchivo(i));p=p.concat(h.generaRenglonesArchivo(n));var u=p.join("\n");var g=String(t.results[0].IBukrs+"_"+t.results[0].IGjahr+"_"+t.results[0].IVblnr+" -Comp Pago");sap.ui.core.util.File.save(u,g,"txt","text/plain","utf-8",false)})}},ConfigTable:function(){var e=this;var t=e.getView().byId("dinamicTableCP");if(!t){t=sap.ui.xmlfragment(e.getView().getId(),"demo.views.ComplPago.fragment.optionCP",this);e.getView().addDependent(t);e.getView().byId("dinamicTableCP").addStyleClass(e.getOwnerComponent().getContentDensityClass())}t.open()},ClosepopUp:function(){var e=this;e.TableVisible();e.getView().byId("dinamicTableCP").close()},generateexcel:function(e){generarxls(e)}})});