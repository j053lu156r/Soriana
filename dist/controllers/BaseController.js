jQuery.sap.require("sap.ui.core.util.Export");jQuery.sap.require("sap.ui.core.util.ExportTypeCSV");sap.ui.define(["sap/ui/export/Spreadsheet","sap/ui/core/mvc/Controller","sap/ui/core/routing/History","sap/ui/core/routing/HashChanger","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/ui/core/Fragment","sap/m/MessageBox","sap/ui/Device","sap/ui/core/UIComponent","sap/ui/core/util/Export","sap/ui/core/util/ExportTypeCSV","demo/models/BaseModel","sap/ui/model/json/JSONModel"],function(e,t,r,n,o,a,i,s,l,u,p){"use strict";var g=new this.UserModel;var d=new this.MyInbox;return t.extend("demo.controllers.BaseController",{onBeforeRendering:function(){var e=this.getConfigModel();if(e!=null){var t=e.getProperty("/langPortal");if(t!=null){this.setLanguage("app"+t,t)}}else{this.setLanguage("appES","ES")}var r=new sap.ui.model.json.JSONModel(u);r.setDefaultBindingMode("OneWay");this.getOwnerComponent().setModel(r,"device");var n={};this.setConfigModel()},onBeforeShow:function(){var e=this.getOwnerComponent().getRouter();e.attachRoutePatternMatched(this.onRoutePatternMatched,this)},onRoutePatternMatched:function(e){var t=e.getParameter("name");if((!g.getModel()||g.getModel()===undefined)&&t!="ConfirmUser"){this.getOwnerComponent().getRouter().navTo("appHome",{},true)}},getUserObject:function(){return g},getUserModel:function(){return g.getBindingModel()},setUserModel:function(e){g.setBindingModel(e);this.getOwnerComponent().setModel(e,"userdata")},runFunction:function(e,t){window[e](t)},checkUser:function(){var e=sap.ui.getCore().getModel();if(e===null){this.getOwnerComponent().getRouter().navTo("appHome",{},true)}else{var t=sap.ui.getCore().getModel().getProperty("/UserPortal");if(t===null){this.getOwnerComponent().getRouter().navTo("appHome",{},true)}else{}}},getRouter:function(){return sap.ui.core.UIComponent.getRouterFor(this)},onNavBack:function(e){var t,n;t=r.getInstance();n=t.getPreviousHash();var o=sap.f.LayoutType.OneColumn;this.onExit();this.getOwnerComponent().getRouter().navTo("tile",{layout:o},true)},onBackPreviousView:function(e){var t,n;t=r.getInstance();n=t.getPreviousHash();var o=sap.f.LayoutType.OneColumn;this.onExit();if(n!==undefined){window.history.go(-1)}else{this.getOwnerComponent().getRouter().navTo("tile",{layout:o},true)}},formatDate:function(e){if(e){jQuery.sap.require("sap.ui.core.format.DateFormat");var t=sap.ui.core.format.DateFormat.getDateTimeInstance({pattern:"dd-MM-yyyy"});return t.format(new Date(e))}else{return null}},formatDateoData:function(e){if(e){jQuery.sap.require("sap.ui.core.format.DateFormat");var t=sap.ui.core.format.DateFormat.getDateTimeInstance({pattern:"YYYYMMdd"});return t.format(new Date(e))}else{return null}},ReverseDate:function(e){var t="";if(e){t=e.toString();if(t.includes("-")){t=t.substring(8,10).concat("-").concat(t.substring(5,7)).concat("-").concat(t.substring(0,4))}else{t=t.substring(6,8).concat("-").concat(t.substring(4,6)).concat("-").concat(t.substring(0,4))}}return t},formatFloat:function(e){return parseFloat(e)},formatStatus:function(e){switch(e){case"A":return this.getOwnerComponent().getModel("appTxts").getProperty("/status.active");break;case"R":return this.getOwnerComponent().getModel("appTxts").getProperty("/status.registered");break;case"S":return this.getOwnerComponent().getModel("appTxts").getProperty("/status.solicited");break;case"L":return this.getOwnerComponent().getModel("appTxts").getProperty("/status.locked");break;case"B":return this.getOwnerComponent().getModel("appTxts").getProperty("/status.deleted");break}},formatUserType:function(e){switch(e){case"0001":return this.getOwnerComponent().getModel("appTxts").getProperty("/rol.managerSoriana");break;case"0002":return this.getOwnerComponent().getModel("appTxts").getProperty("/rol.admSupplier");break;case"0003":return this.getOwnerComponent().getModel("appTxts").getProperty("/rol.supplier");break;case"0004":return this.getOwnerComponent().getModel("appTxts").getProperty("/rol.collabSoriana");break}},defineSpras:function(){var e=sap.ui.getCore().getConfiguration().getLanguage();var t;if(e.includes("-")){var r=e.split("-");t=r[0]}else{t=e}return t},getUser:function(){return g.getModel().getProperty("/user")},logout:function(){this.getOwnerComponent().getRouter().navTo("Logout")},getOdata:function(e){return new sap.ui.model.odata.ODataModel(e,true)},getOdataXML:function(e,t){return new sap.ui.model.odata.ODataModel(e,t)},getOdataJsonModel:function(e,t){var r=new sap.ui.model.json.JSONModel;t.read(e,undefined,undefined,false,function(e,t){r.setData(e)},function(e){});return r},setLanguage:function(e,t){var r=jQuery.sap.properties({url:"i18n/"+e+".properties"});if(r){var n=new sap.ui.model.json.JSONModel;n.setData(r["mProperties"]);this.getOwnerComponent().setModel(n,"appTxts");sap.ui.getCore().getConfiguration().setLanguage(t);this.getTilesModel()}},getTilesModel:function(){var e=new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("demo.mock","/tiles.json"));this.getOwnerComponent().setModel(e,"tilesModel");this.getFunctionsNames()},getFunctionsNames:function(){g.getJsonModelAsync("/headerAdmSet?$expand=ETFNAMENAV&$filter=IOption eq '26'",function(e,t){var r=e.getData().results[0].ETFNAMENAV;t.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(r),"funNames")},function(e){},this)},onExit:function(){},buildSapDate:function(e){if(e){var t=e.getFullYear();var r=e.getMonth();r=("0"+(r+1)).slice(-2);var n=e.getDate();n=("0"+n).slice(-2);return t+r+n}else{return""}},selectLanguage:function(e){var t=e.getSource().getText();var r=t.split(" - ")[1];if(r){var n="app"+r;this.setLanguage(n,r);sap.ui.getCore().getConfiguration().setLanguage(r);this.getConfigModel().setProperty("/langPortal",r)}},onValueHelpRequest:function(){var e=this.getView();g;this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel({}),"tableItemsUsers");if(!this._pValueHelpDialog){this._pValueHelpDialog=sap.ui.core.Fragment.load({id:e.getId(),name:"demo.fragments.SupplierSelect",controller:this}).then(function(t){e.addDependent(t);return t})}this._pValueHelpDialog.then(function(t){t._oCancelButton.setProperty("text",e.getModel("appTxts").getProperty("/global.btnCancel"));t.open()})},onValueHelpRequestquitar:function(){var e=this.getView();this.getConfigModel().setProperty("/supplierInput",null);this.getConfigModel().setProperty("/supplierInputKey",null);this.getConfigModel().setProperty("/supplierTitle",null);this.getConfigModel().setProperty("/adendaSimplificada",false);this.getConfigModel().setProperty("/stibo",false)},onValueHelpSearch:function(e){var t=e.getParameter("value");var r=this.getOwnerComponent().getModel("userdata");var n=r.getProperty("/Esusdata/Zusuasor");if(n!=null&&n==="X"){this.advanceFilter(r,escape(t))}else{this.singleFilter(escape(t))}},onValueHelpClose:function(e){console.log("ON LIFNR SELECTION");var t=e.getParameter("selectedItem");if(t!==undefined){var r="";var n=t.getBindingContext("userdata").getObject();var o=n?n.BloqueoFlag:"";if(o==="X"){r="[Bloqueo de pago]"}e.getSource().getBinding("items").filter([]);if(!t){return}this.getConfigModel().setProperty("/supplierStatus",r);var a=this.detailSupplier(t.getTitle());this.setActiveLifnr(t.getTitle(),t.getDescription()+r,a.Impflag,n.Simplif_flag);var i=this.getView().getModel("applicationModel").getProperty("/routeName");if(i==="masterPowerBI"){var s=this.getConfigModel().getProperty("/supplierInputKey");var l=this.getOwnerComponent().getModel("userdata").getProperty("/IMail");sap.ui.controller("demo.controllers.PowerBI.Master").onSuggestionItemSelected(s,l)}}},setActiveLifnr:function(e,t,r,n){if(e!=""){var o=this.getOwnerComponent().getModel();var a=this.getOwnerComponent().getModel("device");var i=a.getProperty("/system/phone");if(i){this.getConfigModel().setProperty("/supplierTitle",e)}else{this.getConfigModel().setProperty("/supplierTitle",e+" - "+t)}this.getConfigModel().setProperty("/supplierInput",e+" - "+t);this.getConfigModel().setProperty("/supplierInputKey",e);this.getConfigModel().setProperty("/supplierInportation",r)}if(n!==undefined){if(n==="X"){this.getConfigModel().setProperty("/adendaSimplificada",true)}else{this.getConfigModel().setProperty("/adendaSimplificada",false)}}else{this.getConfigModel().setProperty("/adendaSimplificada",false)}this.buildUserTileAuth()},onVerifyProveedorSTIBO:function(e){if(e!==""&&e!==undefined&&e!==null){var t=this;var r=[];r.push(new o("Lifnr",a.EQ,e));this.oModelSTIBO.read("/PROVSTIBOSet",{filters:r,success:function(e){if(e.results[0].Activo==="X"){t.getConfigModel().setProperty("/stibo",true)}else{t.getConfigModel().setProperty("/stibo",false)}},error:function(e){console.log(e);t.getConfigModel().setProperty("/stibo",false)}})}else{this.getConfigModel().setProperty("/stibo",false)}},detailSupplier:function(e){var t=this.getOwnerComponent().getModel("userdata").getProperty("/ETUSUAPROVNAV/results");return t.find(t=>t.Lifnr==e)},buildUserTileAuth:function(){var e={tiles:[],sections:[]};sap.ui.getCore();var t=this.getOwnerComponent().getModel("tilesModel").getProperty("/sections");var r=this.getConfigModel().getProperty("/supplierInputKey");var n=this.getOwnerComponent().getModel("userdata").getProperty("/ETROLUSUANAV/results");var o=this.getOwnerComponent().getModel("userdata").getProperty("/Esusdata/Zusuasor");var a=this.getOwnerComponent().getModel("userdata").getProperty("/ERol");t.forEach(function(t){t.tiles.forEach(function(i){i.functions.forEach(function(s){var l=s.idFunction;var u=s.roles;var p=true;if(u!=null){p=u.includes(a)}if(p){if(o){if(l!=null){var g=n.find(e=>e.Idfuncion==l.toString().padStart(6,"000000"))}}else{if(l!=null){var g=n.find(e=>e.Idfuncion==l.toString().padStart(6,"000000")&&e.Lifnr==r)}}}if(g!=null){if(!e.tiles.includes(i.id)){e.tiles.push(i.id)}if(!e.sections.includes(t.title)){e.sections.push(t.title)}}});if(i.functions.length===0){e.tiles.push(i.id);e.sections.push(t.title)}})});this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(e),"userTileAuth");this.getTilesModel()},singleFilter:function(e){var t=new o("Name",a.Contains,e);oEvent.getSource().getBinding("items").filter([t])},advanceFilter:function(e,t){var r=new UserModel;var n=e.getProperty("/IMail");var o=r.getJsonModel("/headerAdmSet?$expand=ETPROV&$filter=IMail eq '"+n+"' and IName eq '"+t+"' and IOption eq '22'");var a=o.getProperty("/results/0");if(a!=null){var i=a.ETPROV;this.getOwnerComponent().getModel("userdata").setProperty("/ETUSUAPROVNAV",i)}},formatTranslate:function(e){var t=this.getOwnerComponent().getModel("appTxts");return t.getProperty(e)},formatTranslate:function(e,t){var r=this.defineTileTitle(e,t);var n=this.getOwnerComponent().getModel("appTxts");return n.getProperty(r)},defineTileTitle:function(e,t){switch(t){case"0030":var r=this.getOwnerComponent().getModel("userdata");if(r!=null){var n=r.getProperty("/ERol");if(n=="0001"||n=="0003"||n=="0005"){e="/tiles.titleClSoriana"}}break}return e},onTilePress:function(e){var t=e.getSource().getBindingContext("tilesModel").getObject();this.getOwnerComponent().getRouter().navTo(t.binding)},hasSectionVisible:function(e){var t=this.getOwnerComponent().getModel("userTileAuth");if(t!=null){var r=t.getProperty("/sections");if(r!=null){return r.includes(e)}else{return false}}else{return false}},hasTileVisible:function(e){var t=this.getOwnerComponent().getModel("userTileAuth");if(t!=null){var r=t.getProperty("/tiles");var n=window.location.host;if(r!=null){return r.includes(e)}else{return false}}else{return false}},hasChangeMail:function(e){var t=e.getSource().sId;this.validateMail(t)},validateMail:function(e){var t=this.getView().byId(e).getValue();var r=/^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;var n=r.test(t);if(!n){sap.m.MessageBox.error(t+" no es un correo valido");this.getView().byId(e).setValueState(sap.ui.core.ValueState.Error)}else{this.getView().byId(e).setValueState(sap.ui.core.ValueState.Success)}return n},hasChangePhone:function(e){var t=e.getSource().sId;this.validatePhone(t)},validatePhone:function(e){var t=this.getView().byId(e).getValue();var r=/^[+]?([0-9]+[- ]?)?\(?([0-9]+)\)?[- ]?([0-9]+)[- ]?([0-9]+)$/;var n=r.exec(t);if(!n){sap.m.MessageBox.error(t+" no es un teléfono valido, use los siguientes formatos."+"\n\nXXXXXXXXXX\nXXX-XXXX-XXX\nXXX XXXX XXX\n+XX(XX)XXXX-XXX\n+XX (XXX) XXXX XXXX");this.getView().byId(e).setValueState(sap.ui.core.ValueState.Error)}else{this.getView().byId(e).setValueState(sap.ui.core.ValueState.Success)}return n},hasOnlyNumbers:function(e){this.validateOnlyNumbers(e)},validateOnlyNumbers:function(e){var t=e.getSource().sId;var r=this.getView().byId(t).getValue();if(r==""){this.getView().byId(t).setValue("")}var n=/^[0-9]+$/;var o=r.match(n);if(!o){sap.m.MessageBox.error("Solo se permiten numeros en este campo");this.getView().byId(t).setValueState(sap.ui.core.ValueState.Error)}else{this.getView().byId(t).setValueState(sap.ui.core.ValueState.Success)}return o},hasAccess:function(e,t=true){var r=false;var n=this.getOwnerComponent().getModel("userdata").getProperty("/ETROLUSUANAV/results");var o=this.getOwnerComponent().getModel("userdata").getProperty("/Esusdata/Zusuasor");var a=this.getConfigModel().getProperty("/supplierInputKey");var i=e;if(o){var s=n.find(e=>e.Idfuncion==i.toString().padStart(6,"000000"))}else{var s=n.find(e=>e.Idfuncion==i.toString().padStart(6,"000000")&&e.Lifnr==a)}if(s!=null){r=true}if(!r&&t){sap.m.MessageBox.error("No tiene autorización para esta función.")}return r},frmBtnDesvVisible:function(e,t){if(e&&t!=""&&t!=undefined&&t!==null){var r=true}return e&&t!==null&&t!==""&&t!==undefined},setConfigModel:function(){if(!this.getOwnerComponent().getModel("configSite")){var e={supplierTitle:"",barVisible:false};this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(e),"configSite");var t=this.getInboxCount();this.getOwnerComponent().getModel("configSite").setProperty("/inboxMetric",t)}var t=this.getInboxCount();this.getOwnerComponent().getModel("configSite").setProperty("/inboxMetric",t)},getConfigModel:function(){return this.getOwnerComponent().getModel("configSite")},paginate:function(e,t,r,n){var o=null;if(this.getOwnerComponent().getModel(e)){o=this.getOwnerComponent().getModel(e)}else{o=this.getView().getModel(e)}var a=t+"/results";var i=o.getProperty(a);var s={results:[]};if(i!=null){var l=this.definePagination(e,t);var u=r*l;for(var p=n;p<u;p++){if(i[p]!=null){s.results.push(i[p])}else{break}}}if(i!=null){if(u>=i.length){u=n+s.results.length}o.setProperty(t+"/Paginated",s);o.setProperty(t+"/Paginated/initRow",n+1);o.setProperty(t+"/Paginated/endRow",u);o.setProperty(t+"/Paginated/iterator",r);o.setProperty(t+"/Paginated/tableLength",i.length);o.setProperty(t+"/Paginated/numPaginate",l)}},prevPagination:function(e,t,r,n){e--;var o=t-this.definePagination(r,n)-1;this.paginate(r,n,e,o)},nextPagination:function(e,t,r,n){e++;this.paginate(r,n,e,t)},paginateValue:function(e,t,r){var n=null;if(this.getOwnerComponent().getModel(t)){n=this.getOwnerComponent().getModel(t)}else{n=this.getView().getModel(t)}var o=e.getKey();n.setProperty(r+"/Paginated/numPaginate",o);this.paginate(t,r,1,0)},definePagination:function(e,t){var r=null;if(this.getOwnerComponent().getModel(e)){r=this.getOwnerComponent().getModel(e)}else{r=this.getView().getModel(e)}var n=r.getProperty(t+"/Paginated/numPaginate");if(n==null){n=10}return n},exportxls:sap.m.Table.prototype.exportData||function(e,t,r,n){n||(n=new sap.ui.core.util.ExportTypeCSV({separatorChar:"\t",mimeType:"application/vnd.ms-excel",charset:"UTF-8",fileExtension:"xls"}));var o=new sap.ui.core.util.Export({exportType:n,models:this.getOwnerComponent().getModel(e),rows:{path:t},columns:r});o.saveFile().always(function(){this.destroy()})},buildColumnsFromTable:function(e){var t=[];var r=this.getView().byId(e).getColumns();for(var n=0;n<r.length;n++){if(r[n].getProperty("visible")){var o=r[n];t.push(r[n])}}return t},configFilterLanguage:function(e){if(e!=null){e.addEventDelegate({onBeforeRendering:function(e){var t=e.srcControl._oSearchButton;t.bindProperty("text","appTxts>/fbar.go");var r=e.srcControl._oFiltersButton;r.bindProperty("text","appTxts>/fbar.adapt");var n=e.srcControl._oRb.aPropertyFiles[0];n.setProperty("FILTER_BAR_ADAPT_FILTERS_ZERO",this.getOwnerComponent().getModel("appTxts").getProperty("/fbar.adapt"));n.setProperty("FILTER_BAR_ADAPT_FILTERS_DIALOG",this.getOwnerComponent().getModel("appTxts").getProperty("/fbar.adapt"))}},this)}},configUploadSet:function(e){if(e!=null){e.addEventDelegate({onBeforeRendering:function(e){var t=e.srcControl._oRb.aPropertyFiles[0];var r=this.getOwnerComponent().getModel("appTxts").getProperty("/uploadSet.upload");t.setProperty("UPLOADCOLLECTION_UPLOAD",r);t.setProperty("UPLOAD_SET_NO_DATA_TEXT",this.getOwnerComponent().getModel("appTxts").getProperty("/uploadSet.noFiles"));t.setProperty("UPLOADCOLLECTION_NO_DATA_DESCRIPTION",this.getOwnerComponent().getModel("appTxts").getProperty("/uploadSet.noDataDesc"))}},this)}},setIconAttach:function(e){var t="";switch(e){case"application/pdf":t="sap-icon://pdf-attachment";break;case"image/jpeg":case"image/png":t="sap-icon://attachment-photo";break;case"text/plain":t="sap-icon://attachment-text-file";break;case"application/msword":t="sap-icon://doc-attachment";break;case"application/vnd.ms-excel":t="sap-icon://excel-attachment";break;default:t="sap-icon://document";break}return t},buildBlobUrl:function(e,t){var r=e.split(",");var n=atob(r[1]);var o=new Uint8Array(n.length);for(var a=0;a<n.length;a++){o[a]=n.charCodeAt(a)}var i=new Blob([o.buffer],{type:t});return URL.createObjectURL(i)},buildBlob:function(e,t){var r=e.split(",");var n=atob(r[1]);var o=new Uint8Array(n.length);for(var a=0;a<n.length;a++){o[a]=n.charCodeAt(a)}var i=new Blob([o.buffer],{type:t});return i},findFunName:function(e){var t=this.getOwnerComponent().getModel("funNames").getProperty("/results");console.log(t);var r=e.toString();var n=t.find(e=>e.Idfuncion===r.padStart(6,"000000"));if(n!=null){return n.Fname}else{return r}},getMetric:function(e){var t=0;var r=this.getConfigModel();return r.getProperty(e)},documentUploadPress:function(){var e=this;var t=sap.ui.core.Fragment.byId("newHelpDocFragment","fileUploader");var r=sap.ui.core.Fragment.byId("newHelpDocFragment","description").getValue();if(!t.getValue()||r==null&&r==""){sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/helpDocs.uploader.nodata"));return}var n={IOption:"8",IMail:this.getOwnerComponent().getModel("userdata").getProperty("/IMail"),ITDOCAYNAV:[]};var o=t.oFileUpload.files[0];var a={};a.Zdescrip=r;a.Zarchivo=o.name;a.Zdoctype=o.type;var i=new FileReader;i.onload=function(r){a.Zdocvalue64=r.target.result;n.ITDOCAYNAV.push(a);var o=d.create("/headInboxSet",n);if(o!=null){if(o.ESuccess=="X"){t.clear();e.onCloseDialog();e.searchData()}else{sap.m.MessageBox.error(o.EMessage)}}};i.readAsDataURL(o)},getInboxCount:function(){var e=0;if(this.getOwnerComponent().getModel("userdata")!=null){var t=this.getOwnerComponent().getModel("userdata").getProperty("/IMail");var r=d.getJsonModel(`/headInboxSet?$expand=ETINBOXUNAV&$filter=IOption eq '2' and IMail eq '${t}'`);if(r!=null){var n=r.getProperty("/results/0/ETINBOXUNAV/results");e=parseInt(r.getProperty("/results/0/ENmes"),10)}}return e},getStatus:function(){var e=this.getView();if(!this._pStatusHelpDialog){this._pStatusHelpDialog=sap.ui.core.Fragment.load({id:e.getId(),name:"demo.views.Repartidores.fragments.StatusDealerFragment",controller:this}).then(function(t){e.addDependent(t);return t})}this._pStatusHelpDialog.then(function(e){e.open()})},onValueStatus:function(e){var t=e.getParameter("selectedItems");var r="";if(t!=null&&t.length>0){t.forEach(function(e){r=e.getProperty("title")});if(r==""){return}sap.ui.core.Fragment.byId("CreateDealersFragment","status").setValue(r);if(this.oDialog){this.oDialog.close();this.oDialog.destroy();this.oDialog=undefined}}},onSupplierHelpRequest:function(){var e=this.getView();if(!this._pValueSupplierHelpDialog){this._pValueSupplierHelpDialog=sap.ui.core.Fragment.load({id:"supplier",name:"demo.views.Repartidores.fragments.SelectSupplierDealerFragment",controller:this}).then(function(t){e.addDependent(t);return t})}this._pValueSupplierHelpDialog.then(function(e){e.open()})},onSupplierHelpClose:function(e){var t=e.getParameter("selectedItem");e.getSource().getBinding("items").filter([]);if(!t){return}sap.ui.core.Fragment.byId("CreateDealersFragment","supplier").setValue(t.getTitle());if(this.oDialog){this.oDialog.close();this.oDialog.destroy();this.oDialog=undefined}},defineHighlight:function(e){switch(e){case"01":return"Error";case"03":return"Success"}},downloadAttach:function(e,t){switch(t){case"application/pdf":this.pdfView(e,t);break;default:var r=this.buildBlobUrl(e,t);sap.m.URLHelper.redirect(r,true);break}},helpBranch:function(){var e=this.getView();if(!this._brandHelpDialog){this._brandHelpDialog=sap.ui.core.Fragment.load({id:e.getId(),name:"demo.fragments.BrandSelect",controller:this}).then(function(t){e.addDependent(t);return t})}this._brandHelpDialog.then(function(e){e.open()})},brandValueHelpSearch:function(e){var t=e.getParameter("value");if(t!=null&&t!=""){var r=d.getJsonModel("/headInboxSet?$expand=ETSTORENAV&$filter= IOption eq '14' and IName eq '"+t+"'");if(r!=null){var n=r.getProperty("/results/0");this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(n),"searchLocations")}}else{this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel,"searchLocations")}},_GEToDataV2:function(e,t,r,n,o,a){console.log(o);console.log(a);if(o===""||o===undefined||o===null){o=""}if(a===""||a===undefined||a===null){a=""}var i="/sap/opu/odata/sap/"+e;var l=this;let u="/"+t;return new Promise(function(e,t){var l=new sap.ui.model.odata.ODataModel(i);l.read(u,{filters:r,urlParameters:{$expand:n,$top:o,$skip:a},success:function(t,r){e(r)},error:function(e){console.log(e);sap.ui.core.BusyIndicator.hide();s.error("Error: "+e.responseJSON.error.message,{icon:s.Icon.ERROR,title:"Error"});t(new Error(e.message))}})})},_GetODataV2:function(e,t,r,n,o,a){console.log(o,a);var i="/sap/opu/odata/sap/"+e;var l=this;let u="/"+t;let p={$expand:n};if(o!==null&&a!==null&&o!==""&&o!==undefined&&a!==undefined){p["$top"]=o;p["skip"]=a}return new Promise(function(e,t){var n=new sap.ui.model.odata.v2.ODataModel(i);n.setUseBatch(false);n.read(u,{filters:r,urlParameters:p,success:function(t,r){e(r)},error:function(e){console.log(e);sap.ui.core.BusyIndicator.hide();s.error("Error: "+e.responseJSON.error.message,{icon:s.Icon.ERROR,title:"Error"});t(new Error(e.message))}})})},_PostODataV2Async:function(e,t,r,n){var o="/sap/opu/odata/sap/"+e;return new Promise(function(e,a){$.ajax({url:o+"/"+t,type:"POST",contentType:"application/json; charset=utf-8",dataType:"json",headers:n,data:JSON.stringify(r),success:function(t){e(t)},error:function(e,t,r){sap.ui.core.BusyIndicator.hide();a(new Error(e))}})})},_GEToDataV2ajax:function(e){return new Promise((t,r)=>{$.ajax({url:e,type:"GET",dataType:"json",contentType:"application/json; charset=utf-8; IEEE754Compatible=true",success:function(e){t(e)},error:function(e,t,n){sap.ui.core.BusyIndicator.hide();console.log("error",e);r(new Error(e))}})})},_POSToDataV2:function(e,t,r){var n="/sap/opu/odata/sap/"+e;var o=this;console.log(n);return new Promise(function(e,o){$.ajax({url:n+t,type:"POST",contentType:"application/json; charset=utf-8",dataType:"json",data:r,success:function(t){e(t)},error:function(e,t,r){sap.ui.core.BusyIndicator.hide();console.log("error",e);o({status:t,error:e,err:r})}})})},buildExcelSpreadSheet:function(t,r,n){var o={workbook:{columns:t},dataSource:r,fileName:n};var a=new e(o);a.build().then(function(){}).finally(a.destroy)}})});