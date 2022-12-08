sap.ui.define(["jquery.sap.global","sap/ui/core/Fragment","demo/controllers/BaseController","sap/m/UploadCollectionParameter","sap/ui/core/mvc/Controller","sap/m/PDFViewer","sap/ui/model/json/JSONModel","sap/ui/core/routing/History","sap/ui/core/routing/Router","demo/models/BaseModel","sap/f/library"],function(e,t,a,o,s,i,n,r){"use strict";var l="";var d=new this.MyInbox;return a.extend("demo.controllers.MiBandeja.Releases.Master",{onInit:function(){this._pdfViewer=new i;this.getView().addDependent(this._pdfViewer);this.oRouter=this.getOwnerComponent().getRouter();this.getView().addEventDelegate({onAfterShow:function(e){var t=this.getConfigModel();t.setProperty("/barVisible",true);this.getView().byId("dateRange").setValue("");this.getView().byId("subject").setValue("");this.getOwnerComponent().setModel(new n,"masterReleaseModel")}},this);this.configFilterLanguage(this.getView().byId("filterBar"))},searchData:function(){var e=false;if(!d.getModel()){d.initModel()}var t=sap.ui.core.format.DateFormat.getDateTimeInstance({parent:"yyyyMMdd"});var a=this.getView().byId("dateRange");var o=this.buildSapDate(a.getDateValue());var s=this.buildSapDate(a.getSecondDateValue());var i=this.getView().byId("subject").getValue();var r=this.getOwnerComponent().getModel("userdata").getProperty("/EIdusua");if(i!=null&&i==""){if(o!=""&&s!=""){e=true}else{e=false;sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/global.searchFieldsEmpty"))}}else{e=true}if(e){var l="/headInboxSet?$expand=ETDATAMESNAV&$filter=IOption eq '12' and IIdusua eq '"+r+"'";if(i!=""){l+="  and IName eq '"+i+"'"}if(o!=""&&s!=""){l+=" and ISdate eq '"+o+"'"+" and IEdate eq '"+s+"'"}var g=new sap.m.BusyDialog;g.open();var u=d.getJsonModel(l);g.close();var p=u.getProperty("/results/0");this.getOwnerComponent().setModel(new n(p),"masterReleaseModel");this.paginate("masterReleaseModel","/ETDATAMESNAV",1,0)}},deleteRelease:function(e){if(!this.hasAccess(50)){return}var t=this;var a=this.getOwnerComponent().getModel("appTxts").getProperty("/helpDocs.deleteConfirm");sap.m.MessageBox.confirm(a,{actions:[sap.m.MessageBox.Action.YES,sap.m.MessageBox.Action.NO],emphasizedAction:sap.m.MessageBox.Action.YES,onClose:function(a){if(a==sap.m.MessageBox.Action.YES){t.deleteRel(e)}}})},deleteRel:function(e){if(!this.hasAccess(50)){return}var t=this.getOwnerComponent().getModel("userdata");var a=t.getProperty("/IMail");var o=t.getProperty("/EIdusua");var s={IOption:"17",IIdusua:o,IAllpro:"",ISdate:"",IEdate:"",IIdmen:e,IFmail:"",ISubject:"",IText:"",ITPROVNAV:[],ITATTACNAV:[]};var i=d.create("/headInboxSet",s);if(i!=null){if(i.ESuccess=="X"){sap.m.MessageBox.success(i.EMessage,{actions:[sap.m.MessageBox.Action.CLOSE],emphasizedAction:sap.m.MessageBox.Action.CLOSE,onClose:function(e){this.searchData()}.bind(this)})}else{if(i.mensaje!=null){sap.m.MessageBox.error(i.mensaje)}else{sap.m.MessageBox.error("Ocurrio un error")}}}else{sap.m.MessageBox.error("No se pudo conectar con el servidor, intente nuevamente.")}},onExit:function(){if(this._oDialog){this._oDialog.destroy();this._oDialog=null}if(this._uploadDialog1){this._uploadDialog1.destroy();this._uploadDialog1=null}if(this._uploadDialog2){this._uploadDialog2.destroy();this._uploadDialog2=null}if(this._oPopover){this._oPopover.destroy();this._oPopover=null}},newRelease:function(){if(!this.hasAccess(17)){return}this.getOwnerComponent().getRouter().navTo("NewRelease")},openUploadDialog:function(e){if(!this._uploadDialog2){this._uploadDialog2=sap.ui.xmlfragment(l,"demo.fragments.UploadInvoice",this);this.getView().addDependent(this._uploadDialog2)}this._uploadDialog2.open()},onCloseDialog:function(){if(this._oDialog){this._oDialog.destroy();this._oDialog=null}},onCloseDialogUpload:function(){if(this._uploadDialog1){this._uploadDialog1.close()}if(this._uploadDialog2){this._uploadDialog2.close()}},filtrado:function(e){var t=[];var a=e.getParameter("query");var o=this.getView().byId("selectFilter");var s=o.getSelectedKey();if(a&&a.length>0){var i=new sap.ui.model.Filter(s,sap.ui.model.FilterOperator.Contains,a);t.push(i)}var n=this.getView().byId("complPagoList");var r=n.getBinding("items");r.filter(t)},setDaterangeMaxMin:function(){var e=this.getView().byId("dateRange");var t=new Date;var a=new Date;var o=new Date;o.setDate(t.getDate()-7);a.setDate(t.getDate()-30);e.setSecondDateValue(t);e.setDateValue(o)},onListItemPress:function(e){var t=this.getOwnerComponent().getHelper().getNextUIState(1),a=e.getSource().getBindingContext("masterReleaseModel").getPath(),o=a.split("/").slice(-1).pop();var s=this.getOwnerComponent().getModel("masterReleaseModel");var i=s.getProperty("/ETDATAMESNAV/Paginated/results");var n=i[o].Idmensaje;this.getOwnerComponent().getRouter().navTo("detailRelease",{layout:t.layout,releaseId:n},true)}})});