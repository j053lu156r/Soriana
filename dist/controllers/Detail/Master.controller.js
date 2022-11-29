sap.ui.define(["jquery.sap.global","sap/ui/core/Fragment","demo/controllers/BaseController","sap/m/UploadCollectionParameter","sap/ui/core/mvc/Controller","sap/m/PDFViewer","sap/ui/model/json/JSONModel","sap/ui/core/routing/History","sap/ui/core/routing/Router","demo/models/BaseModel","sap/f/library","sap/ui/core/BusyIndicator"],function(e,t,o,a,i,r,s,l,n){"use strict";var p="";var d=new this.EnvioCfdi;var u=new this.CfdiModel;var g=new this.ValidacionesFiscales;var c="";var h="ZOSP_CFDI_SRV_04";var m="HeaderCFDISet";return o.extend("demo.controllers.Detail.Master",{onInit:function(){this._pdfViewer=new r;this.getView().addDependent(this._pdfViewer);this.oRouter=this.getOwnerComponent().getRouter();this.getView().addEventDelegate({onAfterShow:function(e){var t=this.getConfigModel();t.setProperty("/barVisible",true);this.getView().byId("dateRange").setValue("");this.getView().byId("folio").setValue("");this.getOwnerComponent().setModel(new s,"tableItemsCfdi");this.getConfigModel().setProperty("/updateFormatsSingle","xml")}},this);this.fiscalModel=new sap.ui.model.odata.v2.ODataModel(g.sUrl)},searchData:function(){sap.ui.core.BusyIndicator.show(0);if(!this.hasAccess(2)){sap.ui.core.BusyIndicator.hide();return false}var e=false;if(!d.getModel()){d.initModel()}var t=sap.ui.core.format.DateFormat.getDateTimeInstance({parent:"yyyyMMdd"});var o=this.getView().byId("dateRange");var a=this.buildSapDate(o.getDateValue());var i=this.buildSapDate(o.getSecondDateValue());var r=this.getConfigModel().getProperty("/supplierInputKey");var l=this.getView().byId("folio").getValue();if(r!=null&&r!=""){e=true}else{sap.ui.core.BusyIndicator.hide();sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/global.supplierSelectError"))}if(e){if(l==""){if(a!=""&&i!=""){e=true}else{e=false;sap.ui.core.BusyIndicator.hide();sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/global.searchFieldsEmpty"))}}else{e=true}}if(e){var n=[];n.push(new sap.ui.model.Filter("IOption",sap.ui.model.FilterOperator.EQ,"3"));n.push(new sap.ui.model.Filter("ILifnr",sap.ui.model.FilterOperator.EQ,r));if(l!=""){n.push(new sap.ui.model.Filter("IXblnr",sap.ui.model.FilterOperator.EQ,l))}if(a!=""&&i!=""){n.push(new sap.ui.model.Filter("IStartdate",sap.ui.model.FilterOperator.EQ,a));n.push(new sap.ui.model.Filter("IEnddate",sap.ui.model.FilterOperator.EQ,i))}this._GetODataV2(h,m,n,["EMTDCNAV"]).then(e=>{var t=e.data.results[0];this.getOwnerComponent().setModel(new s(t),"tableItemsCfdi");this.paginate("tableItemsCfdi","/EMTDCNAV",1,0);sap.ui.core.BusyIndicator.hide()}).catch(e=>{sap.ui.core.BusyIndicator.hide()})}},onExit:function(){if(this._oDialog){this._oDialog.destroy();this._oDialog=null}if(this._uploadDialog1){this._uploadDialog1.destroy();this._uploadDialog1=null}if(this._uploadDialog2){this._uploadDialog2.destroy();this._uploadDialog2=null}if(this._oPopover){this._oPopover.destroy();this._oPopover=null}},openUploadDialog:function(){if(!this.hasAccess(3)){return false}if(!this._uploadDialog2){this._uploadDialog2=sap.ui.xmlfragment("uploadInvoice","demo.fragments.UploadInvoice",this);this.getView().addDependent(this._uploadDialog2)}this._uploadDialog2.open()},onCloseDialogUpload:function(){if(this._uploadDialog2){this._uploadDialog2.destroy();this._uploadDialog2=null}},documentUploadPress:function(){var e=this;var t=sap.ui.core.Fragment.byId("uploadInvoice","fileUploader");var o=sap.ui.core.Fragment.byId("uploadInvoice","logUploadList");var a=sap.ui.core.Fragment.byId("uploadInvoice","uploadBox");var i=this.getConfigModel().getProperty("/supplierInputKey");sap.ui.core.BusyIndicator.show(0);if(!t.getValue()){sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/helpDocs.uploader.nodata"));sap.ui.core.BusyIndicator.hide();return}var r={Lifnr:i,Type:"A",Log:[{Uuid:"",Description:"",Sts:""}]};var l=this.byId("complPagoList").getSelectedItems();if(l.length>0){var n=l[0].getBindingContext("tableItemsCfdi").getObject();r.Docmat=n.Mblnr;r.Year=n.Gjahr}var p=t.oFileUpload.files[0];var d=new FileReader;d.onload=function(e){var i={};var l=e.target.result.split(",");i.Cfdii=l[1];r.Cfdi=l[1];var n=u.create("/ECfdiSet ",r);if(n!=null){sap.ui.core.BusyIndicator.hide();a.setVisible(false);if(n.Log!=null){o.setVisible(true);o.setModel(new s(n))}else{sap.m.MessageBox.error(n.EMessage)}}t.clear()};d.readAsDataURL(p)},openUploadDialog2:function(){var e=this.getConfigModel().getProperty("/supplierInputKey");if(!this.hasAccess(3)){return false}if(e!==undefined&&e!==null){if(!this._uploadDialog3){this._uploadDialog3=sap.ui.xmlfragment("uploadInvoiceTest","demo.fragments.UploadInvoice2",this);this.getView().addDependent(this._uploadDialog3)}this._uploadDialog3.open()}else{sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/clarifications.noSupplier"))}},onCloseDialogUpload2:function(){if(this._uploadDialog3){this._uploadDialog3.destroy();this._uploadDialog3=null}},documentUploadPress2:function(){var e=this;var t=this.getConfigModel().getProperty("/supplierInputKey");console.log(t);var o=sap.ui.core.Fragment.byId("uploadInvoiceTest","fileUploaderTest");sap.ui.core.BusyIndicator.show(0);if(!o.getValue()){sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/helpDocs.uploader.nodata"));sap.ui.core.BusyIndicator.hide();return}var a=o.oFileUpload.files[0];var i=new FileReader;i.onload=function(a){var i=a.target.result;var r='<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" '+'xmlns:tem="http://tempuri.org/"><soapenv:Header/><soapenv:Body><tem:RecibeCFDPortal>'+"<tem:XMLCFD><![CDATA["+i+"]]></tem:XMLCFD><tem:proveedor>"+t+"</tem:proveedor></tem:RecibeCFDPortal></soapenv:Body></soapenv:Envelope>";$.ajax({async:true,url:g.sUrl,method:"POST",headers:{"Content-Type":"text/xml; charset=utf-8","Access-Control-Allow-Origin":"*"},data:r,success:function(t){sap.ui.core.BusyIndicator.hide();e.onCloseDialogUpload2();o.clear();var a=new sap.ui.model.xml.XMLModel;a.setXML(t.getElementsByTagName("RecibeCFDPortalResult")[0].textContent);var i=a.getData();var r=i.getElementsByTagName("AckErrorApplication")[0].attributes[5].nodeValue;var s=i.getElementsByTagName("errorDescription")[0].firstChild.textContent;s=s.replaceAll(";","\n\n");if(r=="ACCEPTED"){sap.m.MessageBox.success(s)}else{sap.m.MessageBox.error(s)}},error:function(t,a,i){sap.ui.core.BusyIndicator.hide();e.onCloseDialogUpload2();o.clear();sap.m.MessageBox.error(e.getOwnerComponent().getModel("appTxts").getProperty("/sendInv.SendError"))}})};i.readAsText(a)},filtrado:function(e){var t=[];var o=e.getParameter("query");var a=this.getView().byId("selectFilter");var i=a.getSelectedKey();if(o&&o.length>0){var r=new sap.ui.model.Filter(i,sap.ui.model.FilterOperator.Contains,o);t.push(r)}var s=this.getView().byId("complPagoList");var l=s.getBinding("items");l.filter(t)},setDaterangeMaxMin:function(){var e=this.getView().byId("dateRange");var t=new Date;var o=new Date;var a=new Date;a.setDate(t.getDate()-7);o.setDate(t.getDate()-30);e.setSecondDateValue(t);e.setDateValue(a)},onListItemPress:function(e){var t=this.getOwnerComponent().getHelper().getNextUIState(1),o=e.getSource().getBindingContext("tableItemsCfdi").getPath(),a=o.split("/").slice(-1).pop();var i=this.getOwnerComponent().getModel("tableItemsCfdi");var r=i.getProperty("/EMTDCNAV/Paginated/results");var s=r[a].Mblnr;var l=r[a].Gjahr;this.getOwnerComponent().getRouter().navTo("detailCfdi",{layout:t.layout,document:s,year:l},true)},onGetFiscalUrl:function(e){this.fiscalModel.read("",{success:function(e){console.log(e)},error:function(e){sap.m.MessageBox.error(that.getOwnerComponent().getModel("appTxts").getProperty("/sendInv.getUrlError"))}})}})});