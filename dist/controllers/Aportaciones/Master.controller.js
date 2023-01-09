sap.ui.define(["demo/controllers/BaseController","sap/m/PDFViewer","sap/ui/model/json/JSONModel","sap/m/MessageToast","sap/m/MessageBox","sap/m/library"],function(e,t,o,a,r,n){"use strict";var i=new this.Aportaciones;var s=n.ButtonType;var p=n.DialogType;return e.extend("demo.controllers.Aportaciones.Master",{onInit:function(){this._pdfViewer=new t;this.getView().addDependent(this._pdfViewer);this.getView().addEventDelegate({onAfterShow:function(e){var t=this.getOwnerComponent().getModel();t.setProperty("/barVisible",true);this.getOwnerComponent().setModel(new o,"AportacionesHdr");this.clearFilters()}},this);this.configFilterLanguage(this.getView().byId("filterBar"))},searchData:function(){var e=true;if(!i.getModel()){i.initModel()}var t=this.getView().byId("aportacionInput").getValue();var o=this.getConfigModel().getProperty("/supplierInputKey");var a=this.getOwnerComponent().getModel("appTxts");var r=this.getView().byId("aportaDay");var n=this.buildSapDate(r.getDateValue());var s=this.buildSapDate(r.getSecondDateValue());if(e){if(o==null){o=""}var p="AportaSet?$expand=AportaDet&$filter=IOption eq '3' and ILifnr eq '"+o+"'";if(t!=""&&t!=null){p+=" and IFolio eq '"+t+"'"}if(n!=""&&n!=null){p+=" and IFecInicio eq '"+n+"'"}if(s!=""&&s!=null){p+=" and IFecFin eq '"+s+"'"}this.getView().byId("tableAportaciones").setBusy(true);i.getJsonModelAsync(p,function(e,t){var o=e.getProperty("/results/0");if(o!=null){t.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(o),"AportacionesHdr");t.paginate("AportacionesHdr","/AportaDet",1,0)}t.getView().byId("tableAportaciones").setBusy(false)},function(e){e.getView().byId("tableAportaciones").setBusy(false)},this)}},onExit:function(){},filtrado:function(e){var t=[];var o=e.getParameter("query");var a=this.getView().byId("selectFilter");var r=a.getSelectedKey();if(o&&o.length>0){var n=new sap.ui.model.Filter(r,sap.ui.model.FilterOperator.Contains,o);t.push(n)}var i=this.getView().byId("AportacionesHdr");var s=i.getBinding("items");s.filter(t)},setDaterangeMaxMin:function(){var e=this.getView().byId("dateRange");var t=new Date;var o=new Date;var a=new Date;a.setDate(t.getDate()-7);o.setDate(t.getDate()-30);e.setSecondDateValue(t);e.setDateValue(a)},onListItemPress:function(e){var t=e.getSource().getBindingContext("AportacionesHdr").getPath(),o=t.split("/").slice(-1).pop();var a=this.getOwnerComponent().getModel("AportacionesHdr");var r=a.getProperty("/AportaDet/Paginated/results");var n=r[o];n.Concepto=n.Concepto.replace(/\//g,"_");this.getOwnerComponent().getRouter().navTo("detailAportaciones",{layout:sap.f.LayoutType.TwoColumnsMidExpanded,folio:n.Folio,concepto:n.Concepto,gerencia:n.GciaCateg,importe:n.ImpTotal},true)},clearFilters:function(){this.getView().byId("aportacionInput").setValue("");this.getView().byId("supplierInput").setValue("")},buildExportTable:function(){var e=this.getOwnerComponent().getModel("appTxts");var t=[{name:e.getProperty("/aportaciones.folio"),template:{content:"{Folio}"}},{name:e.getProperty("/aportaciones.concepto"),template:{content:"{Concepto}"}},{name:e.getProperty("/aportaciones.gerencia"),template:{content:"{GciaCateg}"}},{name:e.getProperty("/aportaciones.facptura"),template:{content:"{FecCaptura}"}},{name:e.getProperty("/aportaciones.fpago"),template:{content:"{FecAport}"}},{name:e.getProperty("/aportaciones.importe"),template:{content:"{ImpAport}"}},{name:e.getProperty("/aportaciones.estatus"),template:{content:"{Observ}"}}];this.exportxls("AportacionesHdr","/AportaDet/results",t)},onPressAccept:function(e){var t=e.getSource().getBindingContext("AportacionesHdr").getPath(),o=t.split("/").slice(-1).pop();this._confirmDialog(o)},_confirmDialog:function(e){var t=this.getOwnerComponent().getModel("appTxts");this._line_approve=e;if(!this.oApproveDialog){this.oApproveDialog=new sap.m.Dialog({type:p.Message,title:t.getProperty("/aportaciones.confirmar"),content:new sap.m.Text({text:t.getProperty("/aportaciones.txtConfirmar")}),beginButton:new sap.m.Button({type:s.Emphasized,text:t.getProperty("/aportaciones.aprobar"),press:function(){this.oApproveDialog.close();this._approve(this._line_approve)}.bind(this)}),endButton:new sap.m.Button({text:t.getProperty("/aportaciones.cancelar"),press:function(){this.oApproveDialog.close()}.bind(this)})})}this.oApproveDialog.open()},_approve:function(e){var t=this.getOwnerComponent().getModel("AportacionesHdr");var o=t.getProperty("/AportaDet/Paginated/results");var a=o[e];var n="AportaSet?$expand=AportaDet&$filter=IOption eq '2' and IEstatus eq '4'";if(a.Folio!=""&&a.Folio!=null){n+=" and IFolio eq '"+a.Folio+"'"}this.getView().byId("tableAportaciones").setBusy(true);i.getJsonModelAsync(n,function(e,n){var i=e.getProperty("/results/0");n.getView().byId("tableAportaciones").setBusy(false);if(i!=null){if(i.EError=="X"){r.error(i.EDescripEvent)}else{a.Descest="Autorizado Proveedor";a.Zestatus="4";t.setProperty("/AportaDet/Paginated/results",o);r.success(i.EDescripEvent)}}},function(e){e.getView().byId("tableAportaciones").setBusy(false)},this)}})});