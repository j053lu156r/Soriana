sap.ui.define(["jquery.sap.global","sap/ui/core/Fragment","demo/controllers/BaseController","sap/m/UploadCollectionParameter","sap/ui/core/mvc/Controller","sap/m/PDFViewer","sap/ui/model/json/JSONModel","sap/ui/core/routing/History","sap/m/MessageBox","sap/ui/core/routing/Router","demo/models/BaseModel","sap/f/library"],function(e,t,a,r,s,i,o,n){"use strict";var l=new this.Repartidores;return a.extend("demo.controllers.Repartidores.Master",{onInit:function(){this._pdfViewer=new i;this.getView().addDependent(this._pdfViewer);this.getView().addEventDelegate({onAfterShow:function(e){var t=this.getOwnerComponent().getModel();t.setProperty("/barVisible",true);this.getOwnerComponent().setModel(new o,"RepartidoresHdr");this.clearFilters()}},this);this.configFilterLanguage(this.getView().byId("filterBar"))},searchData:function(){if(!this.hasAccess(27)){return false}var e=true;if(!l.getModel()){l.initModel()}var t=this.getView().byId("repartidorInput").getValue();var a=this.getConfigModel().getProperty("/supplierInputKey");var r=this.getOwnerComponent().getModel("appTxts");if(e){let e=[];if(a==null){a=""}e.push(new sap.ui.model.Filter({path:"IOption",operator:sap.ui.model.FilterOperator.EQ,value1:"4"}));e.push(new sap.ui.model.Filter({path:"ILifnr",operator:sap.ui.model.FilterOperator.EQ,value1:a}));if(t!=""){e.push(new sap.ui.model.Filter({path:"IName",operator:sap.ui.model.FilterOperator.EQ,value1:t}))}sap.ui.core.BusyIndicator.show();let r=this;this._GetODataV2("ZOSP_DEALERS_SRV","HrdDealersSet",e,["ETDEALERSNAV"],"").then(e=>{r.getOwnerComponent().setModel(new o(e.data.results[0]),"RepartidoresHdr");r.paginate("RepartidoresHdr","/ETDEALERSNAV",1,0);sap.ui.core.BusyIndicator.hide()}).catch(e=>{console.error(e)})}},onExit:function(){},filtrado:function(e){var t=[];var a=e.getParameter("query");var r=this.getView().byId("selectFilter");var s=r.getSelectedKey();if(a&&a.length>0){var i=new sap.ui.model.Filter(s,sap.ui.model.FilterOperator.Contains,a);t.push(i)}var o=this.getView().byId("complPagoList");var n=o.getBinding("items");n.filter(t)},setDaterangeMaxMin:function(){var e=this.getView().byId("dateRange");var t=new Date;var a=new Date;var r=new Date;r.setDate(t.getDate()-7);a.setDate(t.getDate()-30);e.setSecondDateValue(t);e.setDateValue(r)},onListItemPress:function(e){var t=e.getSource().getBindingContext("RepartidoresHdr").getPath(),a=t.split("/").slice(-1).pop();var r=this.getOwnerComponent().getModel("RepartidoresHdr");var s=r.getProperty("/ETDEALERSNAV/Paginated/results");var i=s[a];this.getOwnerComponent().setModel(new o(status),"catalogStatus");this.modifyButton(i,true)},modifyButton:function(e,t){if(!this.hasAccess(39)){return false}var a=this.getOwnerComponent().getModel("appTxts");var r=this;this._createDialog=sap.ui.xmlfragment("CreateDealersFragment","demo.views.Repartidores.fragments.CreateDealersFragment",this);this.getView().addDependent(this._createDialog);var s={Status:[{description:"Activo"},{description:"Baja"}]};this.getOwnerComponent().setModel(new o(s),"catalogStatus");var i=this.getOwnerComponent().getModel("userdata");var n=i.getProperty("/ERol");var l=true;var p=sap.ui.core.Fragment.byId("CreateDealersFragment","fcad");p.setMinDate(new Date);var g=this.getConfigModel().getProperty("/supplierInputKey");if(g==null||g==""){sap.m.MessageBox.error(a.getProperty("/rep.tooltipsupplier"));return false}sap.ui.core.Fragment.byId("CreateDealersFragment","supplier").setEditable(l).setVisible(l);sap.ui.core.Fragment.byId("CreateDealersFragment","lblSupplier").setVisible(l);if(t){sap.ui.core.Fragment.byId("CreateDealersFragment","name").setValue(e.Repartidor).setEditable(l);sap.ui.core.Fragment.byId("CreateDealersFragment","key").setValue(e.Clave).setEditable(l);sap.ui.core.Fragment.byId("CreateDealersFragment","fcad").setValue(e.Endda).setEditable(l);sap.ui.core.Fragment.byId("CreateDealersFragment","status").setValue(e.Zactivo);sap.ui.core.Fragment.byId("CreateDealersFragment","Id").setValue(e.Usua);if(l){sap.ui.core.Fragment.byId("CreateDealersFragment","modifyDialog").setVisible(true);sap.ui.core.Fragment.byId("CreateDealersFragment","saveDialog").setVisible(false)}}else{sap.ui.core.Fragment.byId("CreateDealersFragment","status").setValue("Activo").setEditable(false);sap.ui.core.Fragment.byId("CreateDealersFragment","modifyDialog").setVisible(false)}this._createDialog.setTitle(a.getProperty("/rep.modifydealer"));this._createDialog.open()},createButton:function(e,t){if(!this.hasAccess(37)){return false}var a=this.getOwnerComponent().getModel("appTxts");var r=this.getConfigModel().getProperty("/supplierInputKey");if(r==null||r==""){sap.m.MessageBox.error(a.getProperty("/rep.tooltipsupplier"));return false}var s=this;this._createDialog=sap.ui.xmlfragment("CreateDealersFragment","demo.views.Repartidores.fragments.CreateDealersFragment",this);this.getView().addDependent(this._createDialog);var i=sap.ui.core.Fragment.byId("CreateDealersFragment","fcad");i.setMinDate(new Date);var n={Status:[{description:"Activo"},{description:"Baja"}]};this.getOwnerComponent().setModel(new o(n),"catalogStatus");var l=this.getOwnerComponent().getModel("userdata");var p=l.getProperty("/ERol");var g=true;sap.ui.core.Fragment.byId("CreateDealersFragment","supplier").setEditable(g).setVisible(g);sap.ui.core.Fragment.byId("CreateDealersFragment","lblSupplier").setVisible(g);if(t){sap.ui.core.Fragment.byId("CreateDealersFragment","name").setValue(e.Repartidor).setEditable(g);sap.ui.core.Fragment.byId("CreateDealersFragment","key").setValue(e.Clave).setEditable(g);sap.ui.core.Fragment.byId("CreateDealersFragment","fcad").setValue(e.Endda).setEditable(g);sap.ui.core.Fragment.byId("CreateDealersFragment","status").setValue(e.Zactivo);sap.ui.core.Fragment.byId("CreateDealersFragment","Id").setValue(e.Usua);if(g){sap.ui.core.Fragment.byId("CreateDealersFragment","modifyDialog").setVisible(true);sap.ui.core.Fragment.byId("CreateDealersFragment","saveDialog").setVisible(false)}}else{sap.ui.core.Fragment.byId("CreateDealersFragment","status").setValue("Activo").setEditable(false);sap.ui.core.Fragment.byId("CreateDealersFragment","modifyDialog").setVisible(false)}this._createDialog.setTitle(a.getProperty("/rep.create"));this._createDialog.open()},deleteButton:function(){if(!this.hasAccess(38)){return false}var e=this.byId("tableRepartidores").getSelectedItems();var t=this.getOwnerComponent().getModel("appTxts");if(e.length>0){var a={IOption:"3",ITDMODIFYNAV:[]};var r={};var s=this.getOwnerComponent().getModel("userdata");var i=s.getProperty("/EIdusua");var o=this;e.forEach(function(e){var t=e.getBindingContext("RepartidoresHdr").getObject();var s=t.Endda.toString();var o=s.substring(0,4).concat(s.substring(5,7)).concat(s.substring(8,10));if(t.Zactivo!=null){t.Zactivo="B"}r.Usua=t.Usua,r.Repartidor=t.Repartidor,r.Clave=t.Clave,r.Endda=o,r.Zactivo=t.Zactivo,r.Aenam=i,a.ITDMODIFYNAV.push(r);r={}});var n=l.create("/HrdDealersSet",a);if(n!=null){if(n.ESuccess=="X"){sap.m.MessageBox.success(t.getProperty("/rep.success"))}else{sap.m.MessageBox.error(n.EMessage+t.getProperty("/rep.error"))}}}},onSave:function(e){this.callUri("2")},onCancel:function(){if(this._createDialog){this._createDialog.close();this._createDialog.destroy();this._createDialog=undefined}},onModify:function(){this.callUri("3")},handleChange:function(e){var t=e.getParameter("from"),a=e.getParameter("valid"),r=e.getSource();if(a){sap.ui.core.Fragment.byId("CreateDealersFragment","status").setValue("Activo")}else{r.setValueState(ValueState.Error)}},clearFilters:function(){this.getView().byId("repartidorInput").setValue("");this.getView().byId("supplierInput").setValue("")},callUri:function(e){var t=this.getOwnerComponent().getModel("userdata");var a=t.getProperty("/EIdusua");var r=this.getOwnerComponent().getModel("appTxts");var s=sap.ui.core.Fragment.byId("CreateDealersFragment","name").getValue();var i=sap.ui.core.Fragment.byId("CreateDealersFragment","key").getValue();var o=sap.ui.core.Fragment.byId("CreateDealersFragment","fcad");var n=sap.ui.core.Fragment.byId("CreateDealersFragment","status").getValue();var p=sap.ui.core.Fragment.byId("CreateDealersFragment","Id").getValue();var g=this.getConfigModel().getProperty("/supplierInputKey");if(g==null||g==""){g=sap.ui.core.Fragment.byId("CreateDealersFragment","supplier").getValue()}if(s==null||s==""){sap.m.MessageBox.error(r.getProperty("/rep.noName"));return false}if(i==null||i==""){sap.m.MessageBox.error(r.getProperty("/rep.noKey"));return false}if(o==null||o==""){sap.m.MessageBox.error(r.getProperty("/rep.noFcad"));return false}var u=this.buildSapDate(o.getDateValue());var d={IOption:e,ITRECORDNAV:[],ITDMODIFYNAV:[]};var c={};if(e=="3"){if(n!=null){switch(n){case"Activo":n="A";break;case"Baja":n="B";break}}c.Usua=p,c.Repartidor=s,c.Clave=i,c.Endda=u;c.Zactivo=n,c.Aenam=a,d.ITDMODIFYNAV.push(c)}if(e=="2"){c.Repartidor=s,c.Clave=i,c.Aenam=a,c.Endda=u;c.Lifnr=g,d.ITRECORDNAV.push(c)}var m=l.create("/HrdDealersSet",d);if(m!=null){if(m.ESuccess=="X"){sap.m.MessageBox.success(r.getProperty("/rep.success"))}else{sap.m.MessageBox.error(m.EMessage+r.getProperty("/rep.error"))}}if(this._createDialog){this._createDialog.close();this._createDialog.destroy();this._createDialog=undefined}},buildExportTable:function(){var e=this.getOwnerComponent().getModel("appTxts");var t=[{name:e.getProperty("/rep.number"),template:{content:"{Usua}"}},{name:e.getProperty("/rep.supplier"),template:{content:"{Lifnr}"}},{name:e.getProperty("/rep.supplierName"),template:{content:"{Nlifnr}"}},{name:e.getProperty("/rep.name"),template:{content:"{Repartidor}"}},{name:e.getProperty("/rep.key"),template:{content:"{Clave}"}},{name:e.getProperty("/rep.fcad"),template:{content:"{Endda}"}},{name:e.getProperty("/rep.status"),template:{content:"{Zactivo}"}}];this.exportxls("RepartidoresHdr","/ETDEALERSNAV/results",t)}})});