sap.ui.define(["demo/controllers/Quotes/wizards/WQuoteCreate","sap/ui/core/mvc/Controller","sap/ui/model/json/JSONModel","sap/f/library","sap/ui/table/RowAction","sap/ui/table/RowActionItem","sap/ui/table/RowSettings"],function(e,t,o,a,r,s){"use strict";var i=new this.Citas2;var n="ZOSP_CITAS_ADM_SRV";var l="MainSet";return e.extend("demo.controllers.Quotes.Master",{onInit:function(){this.setInitialDates();this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel,"quoteConfigModel");this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel,"ActionCita");this.getView().addEventDelegate({onAfterShow:function(e){this.getCatalogs();this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel,"tableQuotesModel");this.clearFilds()}},this);this.configFilterLanguage(this.getView().byId("filterBar"));this.getConfigModel().setProperty("/updateFormatsSingle","xls,xlsx");var e=[{Codigo:"1",Nombre:"POR CONFIRMAR"},{Codigo:"2",Nombre:"ACTIVA"},{Codigo:"3",Nombre:"AUSENCIA"},{Codigo:"4",Nombre:"CANCELADA"},{Codigo:"5",Nombre:"PROCESADA"}];this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(e),"TCitas")},setInitialDates(){let e=this.getView().byId("quotedateRange");let t=new Date;let o=new Date(t.getFullYear(),t.getMonth(),1);let a=new Date(t.getFullYear(),t.getMonth()+1,0);e.setDateValue(o);e.setSecondDateValue(a);this.isAdmin()},searchData:function(){if(!this.hasAccess(30)){return}this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel,"tableQuotesModel");var e=this.getConfigModel().getProperty("/supplierInputKey");var t=this.getView().byId("quoteFolioIniInput").getValue();var o=this.getView().byId("quoteFolioFinInput").getValue();var a=this.getView().byId("quotedateRange");var r=this.buildSapDate(a.getDateValue());var s=this.buildSapDate(a.getSecondDateValue());if(e==null||e==""){sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/helpDocs.uploader.noProvider"));return}if((t==null||t=="")&&(r==null||r==""&&s==null||s=="")){sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/quotes.noFolioDates"));return}let i=[];i.push(new sap.ui.model.Filter({path:"Action",operator:sap.ui.model.FilterOperator.EQ,value1:"1"}));i.push(new sap.ui.model.Filter({path:"Proveedor",operator:sap.ui.model.FilterOperator.EQ,value1:e}));if(this.getView().byId("ZEstatus").getSelectedKey()!==""){console.log("estatus");i.push(new sap.ui.model.Filter({path:"Zestatus",operator:sap.ui.model.FilterOperator.EQ,value1:"0"+this.getView().byId("ZEstatus").getSelectedKey()}))}if(this.getView().byId("ZTipocita").getSelectedKey()!==""){console.log("tipocita");i.push(new sap.ui.model.Filter({path:"Tipocita",operator:sap.ui.model.FilterOperator.EQ,value1:this.getView().byId("ZTipocita").getSelectedKey()}))}if(this.getView().byId("quoteCentroInput").getSelectedKey()!==""){i.push(new sap.ui.model.Filter({path:"Centro",operator:sap.ui.model.FilterOperator.EQ,value1:this.getView().byId("quoteCentroInput").getSelectedKey()}))}if(t!=null&&t!=""&&o!=null&&o!=""){i.push(new sap.ui.model.Filter({path:"Folioini",operator:sap.ui.model.FilterOperator.EQ,value1:t}));i.push(new sap.ui.model.Filter({path:"Foliofin",operator:sap.ui.model.FilterOperator.EQ,value1:o}))}if(r!=null&&r!=""&&s!=null&&s!=""){i.push(new sap.ui.model.Filter({path:"Fechaini",operator:sap.ui.model.FilterOperator.EQ,value1:r}));i.push(new sap.ui.model.Filter({path:"Fechafin",operator:sap.ui.model.FilterOperator.EQ,value1:s}))}console.warn(this.getOwnerComponent().getModel("userdata").getProperty("/AdminC"));sap.ui.core.BusyIndicator.show();let u=this;this._GetODataV2(n,l,i,["CTCITASCAB","CTCITASDETEXT"],"").then(e=>{console.warn(e.data.results[0].CTCITASCAB.results);for(var t=0;t<e.data.results[0].CTCITASCAB.results.length;t++){if(e.data.results[0].CTCITASCAB.results[t].Zestatus==="1"&&u.getOwnerComponent().getModel("userdata").getProperty("/AdminC")==="X"){e.data.results[0].CTCITASCAB.results[t].AdminV=true}else{e.data.results[0].CTCITASCAB.results[t].AdminV=false}}u.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(e.data.results[0]),"tableQuotesModel");u.paginate("tableQuotesModel","/CTCITASCAB",1,0);sap.ui.core.BusyIndicator.hide()}).catch(e=>{sap.ui.core.BusyIndicator.hide();console.error(e)})},isAdmin:function(){let e=[];e.push(new sap.ui.model.Filter({path:"Action",operator:sap.ui.model.FilterOperator.EQ,value1:"4"}));e.push(new sap.ui.model.Filter({path:"Useremail",operator:sap.ui.model.FilterOperator.EQ,value1:this.getOwnerComponent().getModel("userdata").getProperty("/IMail")}));sap.ui.core.BusyIndicator.show();let t=this;this._GetODataV2(n,l,e,["CTCITASCAB"],"").then(e=>{console.log(e.data.results[0].Isadmin);if(e.data.results[0].Isadmin==="X"){this.getOwnerComponent().getModel("userdata").setProperty("/AdminC","X")}else{this.getOwnerComponent().getModel("userdata").setProperty("/AdminC","")}sap.ui.core.BusyIndicator.hide()}).catch(e=>{sap.ui.core.BusyIndicator.hide();console.error(e)});console.log(this.getOwnerComponent().getModel("userdata").getProperty("/"))},searchDetail:function(e){let t=[];t.push(new sap.ui.model.Filter({path:"Action",operator:sap.ui.model.FilterOperator.EQ,value1:"2"}));t.push(new sap.ui.model.Filter({path:"Folioini ",operator:sap.ui.model.FilterOperator.EQ,value1:"'"+e+"'"}));sap.ui.core.BusyIndicator.show();let o=this;this._GetODataV2(n,l,t,["CTCITASDETEXT/ETOCSTOPALLEXT","CTCITASDETEXT"],"").then(e=>{console.log(e.data.results[0].CTCITASDETEXT.results);o.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(e.data.results[0].CTCITASDETEXT.results),"PosicionesG");sap.ui.core.BusyIndicator.hide()}).catch(e=>{sap.ui.core.BusyIndicator.hide();console.error(e)})},codigoEstado:function(e){var t="";switch(e){case"1":t="POR CONFIRMAR";break;case"2":t="ACTIVA";break;case"3":t="AUSENCIA";break;case"4":t="CANCELADA";break;case"5":t="PROCESADA";break}return t},codigotipocita:function(e){var t="";switch(e){case"01":t="PALLET BLINDADO";break;case"02":t="RECIBO EN SITIO";break;case"03":t="CEDIS";break;case"04":t="PALL-MINIPALL";break}return t},codigotipounidad:function(e){var t="";switch(e){case"01":t="TRAILER";break;case"02":t="CAMIONETA";break;case"03":t="THORTON";break}return t},clearFilds:function(){this.getView().byId("quoteType").setValue("");this.getView().byId("quoteStatus").setValue("");this.getView().byId("quoteUnitType").setValue("");this.getView().byId("productType").setValue("");this.getView().byId("orderInput").setValue("");this.getView().byId("quoteTurn").setValue("");this.getView().byId("branchInput").setValue("")},getCatalogs:function(){var e="/HeaderCITASSet?$expand=ECONFIGCEDISNAV,ETIPOCITANAV,ETIPOPRODUCTONAV,ETIPOTURNONAV,ETIPOUNIDADNAV,ETIPOSTATUSNAV&$filter=IOption eq '3'&$format=json";var t=i.getJsonModel(e);if(t!=null){var o=t.getProperty("/results/0");this.getView().setModel(new sap.ui.model.json.JSONModel(o),"appoinmentsCatalogs");var a=this.getView().getModel("appoinmentsCatalogs")}},_brandValueHelpConfirm:function(e){var t=e.getParameter("selectedItem");if(t){var o=this.byId("branchInput");o.setValue(`${t.getTitle()} - ${t.getDescription()}`)}},helpProductType:function(e){if(this.getConfigModel().getProperty("/supplierInputKey")){var t=this.getView();if(!this._pTypeHelpDialog){this._pTypeHelpDialog=sap.ui.core.Fragment.load({id:t.getId(),name:"demo.fragments.ProductTypeSelect",controller:this}).then(function(e){t.addDependent(e);return e})}var o=`/HeaderCITASSet?$expand=ETIPOPRODUCTONAV&$filter=IOption eq '3' and IZproveedor eq '${this.getConfigModel().getProperty("/supplierInputKey")}'`;var a=i.getJsonModel(o);if(a!=null){var r=a.getProperty("/results/0");this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(r),"searchProductType")}this._pTypeHelpDialog.hasCreate=e;this._pTypeHelpDialog.then(function(e){e.open()})}else{sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/helpDocs.uploader.noProvider"))}},productTypeValueHelpSearch:function(e){var t=e.getParameter("value");if(t!=null&&t!=""){}else{this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel,"searchProductType")}},_productTypeValueHelpConfirm:function(e){var t=e.getParameter("selectedItem");if(t){var o=null;if(this._pTypeHelpDialog.hasCreate){o=this.byId("productTypeC")}else{o=this.byId("productType")}o.setValue(`${t.getTitle()}`)}},onAppointmentItemPress:function(e){var t=e.getParameter("appointment");if(t!=null){var o=t.getBindingContext("tableQuotesModel").getPath();var a=o.split("/").slice(-1).pop();var r=this.getOwnerComponent().getModel("tableQuotesModel");var s=r.getProperty("/ECITASCONSNAV/Paginated/results");var i=s[a].ZfolioCita;this.getOwnerComponent().getRouter().navTo("detailQuotes",{layout:sap.f.LayoutType.MidColumnFullScreen,document:i},true)}},Confirmacion:function(e){var t=e.getSource().getParent();sap.m.MessageBox["confirm"](this.getView().getModel("appTxts").getProperty("/quotes.confirmcitabtn"),{actions:[sap.m.MessageBox.Action.YES,sap.m.MessageBox.Action.NO],onClose:async function(e){if(e===sap.m.MessageBox.Action.YES){var o={Proveedor:t.getBindingContext("tableQuotesModel").getProperty("Proveedor"),Action:"4",CTCITASCAB:[{Folio:t.getBindingContext("tableQuotesModel").getProperty("Folio"),Centro:t.getBindingContext("tableQuotesModel").getProperty("Centro"),Fechacita:t.getBindingContext("tableQuotesModel").getProperty("Fechacita"),Proveedor:t.getBindingContext("tableQuotesModel").getProperty("Proveedor")}],CTCITASDET:[],ETRETURN:[]};var a="ZOSP_CITAS_ADM_SRV";var r="/MainSet";var s=JSON.stringify(o);var i=this;i._POSToData(a,r,s).then(function(e){sap.ui.core.BusyIndicator.hide();var t=e.d;if(t.Success==="X"){sap.m.MessageBox.success(i.getView().getModel("appTxts").getProperty("/quotes.confirmcita"))}else{sap.m.MessageBox.error(t.ETRETURN.results[0].Message)}i.searchData()})}}.bind(this)})},onListItemPress:function(e){var t=this;var o=t.getView().getModel("tableQuotesModel").getData();o=o.CTCITASCAB.results;if(t.getView().getModel("tableQuotesModel").getData().CTCITASCAB.Paginated.iterator>1){var a=e.getSource().getBindingContext("tableQuotesModel").getPath(),r=a.split("/").slice(-1).pop();var s=(Number(t.getView().getModel("tableQuotesModel").getData().CTCITASCAB.Paginated.iterator)-1).toString();r=s+r}else{var a=e.getSource().getBindingContext("tableQuotesModel").getPath(),r=a.split("/").slice(-1).pop()}t.searchDetail(o[r].Folio);o[r].lectura=true;o[r].Estilo="V";t.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(o[r]),"ModelLectura");console.log("paso 1");t.createQuote(o[r])},formatDateQuote:function(e){if(e){jQuery.sap.require("sap.ui.core.format.DateFormat");var t=sap.ui.core.format.DateFormat.getDateTimeInstance({pattern:"yyyy-MM-dd"});var o=new Date(e);o.setDate(o.getDate()+1);return o}else{return null}},buildExportTable:function(){var e=this.getOwnerComponent().getModel("appTxts");var t=[{name:e.getProperty("/quotes.branch"),template:{content:"{Zsucursal}"}},{name:e.getProperty("/quotes.branch"),template:{content:"{Zdescrsucursal}"}},{name:e.getProperty("/quotes.quoteFolio"),template:{content:"{ZfolioCita}"}},{name:e.getProperty("/quotes.quoteDate"),template:{content:"{Zfecharegcita}"}},{name:e.getProperty("/quotes.quoteType"),template:{content:"{ZtipoCita}"}},{name:e.getProperty("/quotes.quoteStatus"),template:{content:"{Zstatus}"}},{name:e.getProperty("/quotes.productType"),template:{content:"{ZtipoProd}"}},{name:e.getProperty("/quotes.unitType"),template:{content:"{ZtipoUnidad}"}},{name:e.getProperty("/quotes.turn"),template:{content:"{Zturno}"}},{name:e.getProperty("/quotes.turn"),template:{content:"{ZTipoturno}"}}];this.exportxls("tableQuotesModel","/ECITASCONSNAV/results",t)},openUploadDialog:function(){if(!this._uploadDialog){this._uploadDialog=sap.ui.xmlfragment("demo.views.Quotes.UploadQuote",this);this.getView().addDependent(this._uploadDialog)}this._uploadDialog.open()},onCloseDialogUpload:function(){if(this._uploadDialog){this._uploadDialog.destroy();this._uploadDialog=null}},btnValidateFile:function(){}})});