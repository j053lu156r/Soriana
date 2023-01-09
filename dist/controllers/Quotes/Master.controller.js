sap.ui.define(["demo/controllers/Quotes/wizards/WQuoteCreate","sap/ui/core/mvc/Controller","sap/ui/model/json/JSONModel","sap/f/library","sap/ui/table/RowAction","sap/ui/table/RowActionItem","sap/ui/table/RowSettings"],function(e,t,o,a,l,i){"use strict";var s=new this.Citas2;var n="ZOSP_CITAS_ADM_SRV";var r="MainSet";return e.extend("demo.controllers.Quotes.Master",{onInit:function(){this.setInitialDates();this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel,"quoteConfigModel");this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel,"ActionCita");this.getView().addEventDelegate({onAfterShow:function(e){this.getCatalogs();this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel,"tableQuotesModel");this.clearFilds()}},this);this.configFilterLanguage(this.getView().byId("filterBar"));this.getConfigModel().setProperty("/updateFormatsSingle","xls,xlsx")},setInitialDates(){let e=this.getView().byId("quotedateRange");let t=new Date;let o=new Date(t.getFullYear(),t.getMonth(),1);let a=new Date(t.getFullYear(),t.getMonth()+1,0);e.setDateValue(o);e.setSecondDateValue(a)},searchData:function(){if(!this.hasAccess(30)){return}this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel,"tableQuotesModel");var e=this.getConfigModel().getProperty("/supplierInputKey");var t=this.getView().byId("quoteFolioIniInput").getValue();var o=this.getView().byId("quoteFolioFinInput").getValue();var a=this.getView().byId("quotedateRange");var l=this.buildSapDate(a.getDateValue());var i=this.buildSapDate(a.getSecondDateValue());if(e==null||e==""){sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/helpDocs.uploader.noProvider"));return}if((t==null||t=="")&&(l==null||l==""&&i==null||i=="")){sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/quotes.noFolioDates"));return}let s=[];s.push(new sap.ui.model.Filter({path:"Action",operator:sap.ui.model.FilterOperator.EQ,value1:"1"}));s.push(new sap.ui.model.Filter({path:"Proveedor",operator:sap.ui.model.FilterOperator.EQ,value1:e}));if(t!=null&&t!=""&&o!=null&&o!=""){s.push(new sap.ui.model.Filter({path:"Folioini",operator:sap.ui.model.FilterOperator.EQ,value1:t}));s.push(new sap.ui.model.Filter({path:"Foliofin",operator:sap.ui.model.FilterOperator.EQ,value1:o}))}if(l!=null&&l!=""&&i!=null&&i!=""){s.push(new sap.ui.model.Filter({path:"Fechaini",operator:sap.ui.model.FilterOperator.EQ,value1:l}));s.push(new sap.ui.model.Filter({path:"Fechafin",operator:sap.ui.model.FilterOperator.EQ,value1:i}))}sap.ui.core.BusyIndicator.show();let p=this;this._GetODataV2(n,r,s,["CTCITASCAB"],"").then(e=>{console.log(e);console.log(this.getView().getModel("appoinmentsCatalogs").getData());p.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(e.data.results[0]),"tableQuotesModel");p.paginate("tableQuotesModel","/CTCITASCAB",1,0);sap.ui.core.BusyIndicator.hide()}).catch(e=>{sap.ui.core.BusyIndicator.hide();console.error(e)})},searchDetail:function(e){let t=[];t.push(new sap.ui.model.Filter({path:"Action",operator:sap.ui.model.FilterOperator.EQ,value1:"2"}));t.push(new sap.ui.model.Filter({path:"Folioini ",operator:sap.ui.model.FilterOperator.EQ,value1:"'"+e+"'"}));sap.ui.core.BusyIndicator.show();let o=this;this._GetODataV2(n,r,t,["CTCITASDETEXT"],"").then(e=>{console.log(e.data.results[0].CTCITASDETEXT.results);o.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(e.data.results[0].CTCITASDETEXT.results),"PosicionesG");sap.ui.core.BusyIndicator.hide()}).catch(e=>{sap.ui.core.BusyIndicator.hide();console.error(e)})},clearFilds:function(){this.getView().byId("dateRange").setValue("");this.getView().byId("quoteType").setValue("");this.getView().byId("quoteStatus").setValue("");this.getView().byId("quoteUnitType").setValue("");this.getView().byId("productType").setValue("");this.getView().byId("orderInput").setValue("");this.getView().byId("quoteTurn").setValue("");this.getView().byId("branchInput").setValue("")},getCatalogs:function(){var e="/HeaderCITASSet?$expand=ETIPOCITANAV,ETIPOPRODUCTONAV,ETIPOTURNONAV,ETIPOUNIDADNAV,ETIPOSTATUSNAV&$filter=IOption eq '3'&$format=json";var t=s.getJsonModel(e);if(t!=null){var o=t.getProperty("/results/0");this.getView().setModel(new sap.ui.model.json.JSONModel(o),"appoinmentsCatalogs");var a=this.getView().getModel("appoinmentsCatalogs")}},_brandValueHelpConfirm:function(e){var t=e.getParameter("selectedItem");if(t){var o=this.byId("branchInput");o.setValue(`${t.getTitle()} - ${t.getDescription()}`)}},helpProductType:function(e){if(this.getConfigModel().getProperty("/supplierInputKey")){var t=this.getView();if(!this._pTypeHelpDialog){this._pTypeHelpDialog=sap.ui.core.Fragment.load({id:t.getId(),name:"demo.fragments.ProductTypeSelect",controller:this}).then(function(e){t.addDependent(e);return e})}var o=`/HeaderCITASSet?$expand=ETIPOPRODUCTONAV&$filter=IOption eq '3' and IZproveedor eq '${this.getConfigModel().getProperty("/supplierInputKey")}'`;var a=s.getJsonModel(o);if(a!=null){var l=a.getProperty("/results/0");this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(l),"searchProductType")}this._pTypeHelpDialog.hasCreate=e;this._pTypeHelpDialog.then(function(e){e.open()})}else{sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/helpDocs.uploader.noProvider"))}},productTypeValueHelpSearch:function(e){var t=e.getParameter("value");if(t!=null&&t!=""){}else{this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel,"searchProductType")}},_productTypeValueHelpConfirm:function(e){var t=e.getParameter("selectedItem");if(t){var o=null;if(this._pTypeHelpDialog.hasCreate){o=this.byId("productTypeC")}else{o=this.byId("productType")}o.setValue(`${t.getTitle()}`)}},onAppointmentItemPress:function(e){var t=e.getParameter("appointment");if(t!=null){var o=t.getBindingContext("tableQuotesModel").getPath();var a=o.split("/").slice(-1).pop();var l=this.getOwnerComponent().getModel("tableQuotesModel");var i=l.getProperty("/ECITASCONSNAV/Paginated/results");var s=i[a].ZfolioCita;this.getOwnerComponent().getRouter().navTo("detailQuotes",{layout:sap.f.LayoutType.MidColumnFullScreen,document:s},true)}},onListItemPress:function(e){var t=this.getView().getModel("tableQuotesModel").getData();t=t.CTCITASCAB.results;console.log(t);var o=e.getSource().getBindingContext("tableQuotesModel").getPath(),a=o.split("/").slice(-1).pop();this.searchDetail(t[a].Folio);t[a].lectura=true;var l=new sap.ui.model.json.JSONModel(t[a]);this.getOwnerComponent().setModel(l,"ModelLectura");this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel({editable:false}),"Modeleditable");this.createQuote("V")},formatDateQuote:function(e){if(e){jQuery.sap.require("sap.ui.core.format.DateFormat");var t=sap.ui.core.format.DateFormat.getDateTimeInstance({pattern:"yyyy-MM-dd"});var o=new Date(e);o.setDate(o.getDate()+1);return o}else{return null}},buildExportTable:function(){var e=this.getOwnerComponent().getModel("appTxts");var t=[{name:e.getProperty("/quotes.branch"),template:{content:"{Zsucursal}"}},{name:e.getProperty("/quotes.branch"),template:{content:"{Zdescrsucursal}"}},{name:e.getProperty("/quotes.quoteFolio"),template:{content:"{ZfolioCita}"}},{name:e.getProperty("/quotes.quoteDate"),template:{content:"{Zfecharegcita}"}},{name:e.getProperty("/quotes.quoteType"),template:{content:"{ZtipoCita}"}},{name:e.getProperty("/quotes.quoteStatus"),template:{content:"{Zstatus}"}},{name:e.getProperty("/quotes.productType"),template:{content:"{ZtipoProd}"}},{name:e.getProperty("/quotes.unitType"),template:{content:"{ZtipoUnidad}"}},{name:e.getProperty("/quotes.turn"),template:{content:"{Zturno}"}},{name:e.getProperty("/quotes.turn"),template:{content:"{ZTipoturno}"}}];this.exportxls("tableQuotesModel","/ECITASCONSNAV/results",t)},openUploadDialog:function(){if(!this._uploadDialog){this._uploadDialog=sap.ui.xmlfragment("demo.views.Quotes.UploadQuote",this);this.getView().addDependent(this._uploadDialog)}this._uploadDialog.open()},onCloseDialogUpload:function(){if(this._uploadDialog){this._uploadDialog.destroy();this._uploadDialog=null}},btnValidateFile:function(){console.log("Upload file")}})});