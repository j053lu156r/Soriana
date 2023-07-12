sap.ui.define(["demo/controllers/BaseController","sap/ui/model/json/JSONModel","sap/ui/export/library","sap/ui/export/Spreadsheet"],function(e,t,o,r){"use strict";var i=o.EdmType;return e.extend("demo.controllers.VisorNotasEntrada.Detail",{onInit:function(){$(document).ready(function(){$(document).on("focus",":input",function(){$(this).attr("autocomplete","off")})});this.oRouter=this.getOwnerComponent().getRouter();this.oModel=this.getOwnerComponent().getModel();var e=sap.ui.core.UIComponent.getRouterFor(this);e.getRoute("detailVisorNotas").attachMatched(this._onRouteMatched,this);this.VisibleTable()},onAfterRendering:function(){},handleFullScreen:function(e){this.bFocusFullScreenButton=true;var t=this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");this.oRouter.navTo("detailVisorNotas",{layout:sap.f.LayoutType.MidColumnFullScreen})},handleExitFullScreen:function(e){this.bFocusFullScreenButton=true;var t=this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");this.oRouter.navTo("detailVisorNotas",{layout:sap.f.LayoutType.MidColumnFullScreen})},handleClose:function(e){this.oRouter.navTo("masterVisorNotas",{layout:this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn")})},ConfigTable:function(){var e=this;var t=e.getView().byId("dinamicTableNED");if(!t){t=sap.ui.xmlfragment(e.getView().getId(),"demo.views.VisorNotasEntrada.fragment.optionNEDetail",this);e.getView().addDependent(t);e.getView().byId("dinamicTableNED").addStyleClass(e.getOwnerComponent().getContentDensityClass())}t.open()},ClosepopUp:function(){var e=this;e.TableVisible();e.getView().byId("dinamicTableNED").close()},_onRouteMatched:function(e){var t=e.getParameter("arguments");if(t.Xblnr==="0.1"){t.Xblnr=""}if(t.XblnrFact==="0.1"){t.XblnrFact=""}var o=[];o={Mblnr:t.Mblnr,Mjahr:t.Mjahr,Ebeln:t.Ebeln,Lifnr:t.Lifnr,BudatMkpf:t.BudatMkpf,Werks:t.Werks,Xblnr:t.Xblnr,XblnrFact:t.XblnrFact,Total:t.Total,TotImp:t.TotImp,Waers:t.Waers,posiciones:[]};var r=this;var i="ZOSP_MMIM_MIGO_DOC_SRV";var n="MIGO_DOC(Mblnr='"+t.Mblnr+"',Mjahr='"+t.Mjahr+"')/DocDetalleNav";var a="";var l="";var s=0;sap.ui.core.BusyIndicator.show();r._GEToDataV2(i,n,a,l).then(function(e){sap.ui.core.BusyIndicator.hide();var t=e.data.results;var o=[];console.log(t);for(var i=0;i<t.length;i++){console.log(t[i].Erfmg);console.log(s);s=s+Number(t[i].Erfmg);o.push({Ean11:t[i].Ean11,Ebeln:t[i].Ebeln,Ebelp:t[i].Ebelp,Erfme:t[i].Erfme,Erfmg:t[i].Erfmg,Maktx:t[i].Maktx,Matnr:t[i].Matnr,Mblnr:t[i].Mblnr,Meins:t[i].Meins,Menge:t[i].Menge,Mjahr:t[i].Mjahr,Zeile:t[i].Zeile,Umrez:t[i].Umrez,Netpr:t[i].Netpr,Brtwr:t[i].Brtwr,Waers:t[i].Waers,Fconver:Number(t[i].Menge)/Number(t[i].Erfmg),Ctotal:t[i].Menge+" "+t[i].Meins,CPiezas:t[i].Erfmg+" "+t[i].Erfme})}console.log(s);var n=new sap.ui.model.json.JSONModel(o);r.getView().setModel(n,"DetallePosiciones");r.getView().byId("sumatxt").setText(s)});var d=new sap.ui.model.json.JSONModel(o);r.getView().setModel(d,"DetalleModel")},VisibleTable:function(){var e=this;e.oModel=new t({idEbelp:true,idEan11:true,idMaktx:true,idErfmg:true,idFconver:true,idMenge:true});e.getView().setModel(e.oModel);e.TableVisible()},TableVisible:function(){var e=this;e.getView().byId("idEbelp").setVisible(e.getView().getModel().getProperty("/idEbelp"));e.getView().byId("idEan11").setVisible(e.getView().getModel().getProperty("/idEan11"));e.getView().byId("idMaktx").setVisible(e.getView().getModel().getProperty("/idMaktx"));e.getView().byId("idErfmg").setVisible(e.getView().getModel().getProperty("/idErfmg"));e.getView().byId("idFconver").setVisible(e.getView().getModel().getProperty("/idFconver"));e.getView().byId("idMenge").setVisible(e.getView().getModel().getProperty("/idMenge"))},onParentClicked:function(e){var t=e.getParameter("selected");this.oModel.setData({idEbelp:t,idEan11:t,idMaktx:t,idErfmg:t,idFconver:t,idMenge:t})},createColumnConfig:function(){var e=this;var t=e.getView().getModel("migoModel").getData(),o=[];var r=this.getOwnerComponent().getModel("appTxts");o.push({label:r.getProperty("/visor.positionG"),type:i.String,property:"Zeile"});o.push({label:r.getProperty("/visor.order"),type:i.String,property:"Ebeln"});o.push({label:r.getProperty("/visor.position"),type:i.String,property:"Ebelp"});o.push({label:r.getProperty("/visor.codigo"),type:i.String,property:"Ean11"});o.push({label:r.getProperty("/visor.descripcion"),type:i.String,property:"Maktx"});o.push({label:r.getProperty("/visor.quantity"),type:i.String,property:"CPiezas"});o.push({label:r.getProperty("/visor.capacidad"),type:i.String,property:"Fconver"});o.push({label:r.getProperty("/visor.netpr"),type:i.String,property:"Netpr"});o.push({label:r.getProperty("/visor.Fconver"),type:i.String,property:"Ctotal"});return o},buildExportTable:function(){var e,t,o,i,n,a=this;if(!a._oTable){a._oTable=this.byId("tableVisor")}n=a._oTable;t=n.getBinding().oList;console.log(t);e=a.createColumnConfig();o={workbook:{columns:e,hierarchyLevel:"Level"},dataSource:t,fileName:"Posiciones Notas de Entrada",worker:false};i=new r(o);i.build().finally(function(){i.destroy()})}})});