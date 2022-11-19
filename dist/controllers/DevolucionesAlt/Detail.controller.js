sap.ui.define(["sap/ui/model/json/JSONModel","demo/controllers/BaseController","sap/ui/export/library","sap/ui/export/Spreadsheet"],function(e,t,o,r){"use strict";var n=o.EdmType;var a=new this.Devoluciones;return t.extend("demo.controllers.DevolucionesAlt.Detail",{onInit:function(){console.log("12");this.bus=this.getOwnerComponent().getEventBus();var e=this.getView().byId("exitFullScreenBtn"),t=this.getView().byId("enterFullScreenBtn");this.oRouter=this.getOwnerComponent().getRouter();this.oModel=this.getOwnerComponent().getModel();this.oRouter.getRoute("detailDevoFactoraje").attachPatternMatched(this._onDocumentMatchedFactoraje,this);this.oRouter.getRoute("detailDevoEstadoCuenta").attachPatternMatched(this._onDocumentMatchedEstadoC,this);this.oRouter.getRoute("detailDevoComplemento").attachPatternMatched(this._onDocumentMatchedComplemento,this);[e,t].forEach(function(e){e.addEventDelegate({onAfterRendering:function(){if(this.bFocusFullScreenButton){this.bFocusFullScreenButton=false;e.focus()}}.bind(this)})},this)},formatSatusDevo:function(e){if(e){return"true"}else{return"false"}},handleItemPress:function(t){var o=this.getOwnerComponent().getHelper().getNextUIState(2),r=t.getSource().getBindingContext("tableDetailDevo").getPath();var n=this.getOwnerComponent().getModel("tableDetailDevo").getProperty(r);if(!this._oDialog||this.oDialog===undefined){this._oDialog=sap.ui.xmlfragment("demo.fragments.Exhaustion",this)}this.getView().addDependent(this._oDialog);jQuery.sap.syncStyleClass("sapUiSizeCompact",this.getView(),this._oDialog);this._oDialog.setModel(new e(n));this._oDialog.open()},handleFullScreen:function(){var e=this.getOwnerComponent().getHelper().getNextUIState(3);this.bFocusFullScreenButton=true;console.log(this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen"));console.log(this.parent);if(this.parent=="ESTADOC"){this.getOwnerComponent().getRouter().navTo("detailDevoEstadoCuenta",{layout:sap.f.LayoutType.MidColumnFullScreen,xblnr:this._Xblnr,lifnr:this._lifnr,ebeln:this._Ebeln,suc:this._Suc},true)}else if(this.parent=="COMPLEMENTO"){this.oRouter.navTo("detailDevoComplemento",{layout:sap.f.LayoutType.MidColumnFullScreen,xblnr:this._Xblnr,lifnr:this._lifnr,ebeln:this._Ebeln,suc:this._Suc})}else if(this.parent=="FACTORAJE"){this.oRouter.navTo("detailDevoFactoraje",{layout:sap.f.LayoutType.MidColumnFullScreen,xblnr:this._Xblnr,lifnr:this._lifnr,ebeln:this._Ebeln,suc:this._Suc})}},handleExitFullScreen:function(){this.bFocusFullScreenButton=true;var e=this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");console.log(this.parent);if(this.parent=="ESTADOC"){this.getOwnerComponent().getRouter().navTo("detailDevoEstadoCuenta",{layout:sap.f.LayoutType.TwoColumnsMidExpanded,xblnr:this._Xblnr,lifnr:this._lifnr,ebeln:this._Ebeln,suc:this._Suc},true);this.bus.publish("flexible","detailDevoComplemento")}else if(this.parent=="COMPLEMENTO"){this.oRouter.navTo("detailDevoComplemento",{layout:sap.f.LayoutType.ThreeColumnsMidExpandedEndHidden,xblnr:this._Xblnr,lifnr:this._lifnr,ebeln:this._Ebeln,suc:this._Suc})}else if(this.parent=="FACTORAJE"){this.oRouter.navTo("detailDevoFactoraje",{layout:sap.f.LayoutType.ThreeColumnsMidExpandedEndHidden,xblnr:this._Xblnr,lifnr:this._lifnr,ebeln:this._Ebeln,suc:this._Suc})}},handleClose:function(){console.log(this.parent);if(this.parent=="ESTADOC"){var e=this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");this.oRouter.navTo("EstadoCuenta",{layout:e})}if(this.parent=="COMPLEMENTO"){var e=this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");this.oRouter.navTo("detailCompl2",{layout:e})}if(this.parent=="FACTORAJE"){var e=this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");this.oRouter.navTo("masterFactoring",{layout:e})}},_onDocumentMatched:function(t){this._Xblnr=t.getParameter("arguments").xblnr||this._Xblnr||"0",this._lifnr=t.getParameter("arguments").lifnr||this._lifnr||"0";this._Ebeln=t.getParameter("arguments").ebeln||this._Ebeln||"0";var o={Xblnr:this._Xblnr,Werks:this._Werks};this.getOwnerComponent().setModel(new e(o),"headerDetail");console.log("2");this.getOwnerComponent().setModel(new e(o),"headerDetail");var r=this;var n=[];n.push(new sap.ui.model.Filter({path:"IOption",operator:sap.ui.model.FilterOperator.EQ,value1:"3"}));n.push(new sap.ui.model.Filter({path:"IEbeln",operator:sap.ui.model.FilterOperator.EQ,value1:r._Ebeln}));n.push(new sap.ui.model.Filter({path:"IXblnr",operator:sap.ui.model.FilterOperator.EQ,value1:parseInt(r._Xblnr)}));var a="ZOSP_RETURNS_SRV";var l="HrdReturnsSet";var i=["ETDTDEVNAV","ETFDEVNAV","ITDFAGR"];var s=n;var u="";sap.ui.core.BusyIndicator.hide();sap.ui.core.BusyIndicator.show();r._GEToDataV2(a,l,s,i,u).then(function(t){sap.ui.core.BusyIndicator.hide();var o=t.data;console.log(o);var n=o.results[0];r.getOwnerComponent().setModel(new e(n),"devoDetail");r.paginate("devoDetail","/ETDTDEVNAV",1,0)})},_onDocumentMatchedEstadoC:function(t){console.log("3");this.parent="ESTADOC";this._Xblnr=t.getParameter("arguments").xblnr||this._Xblnr||"0",this._lifnr=t.getParameter("arguments").lifnr||this._lifnr||"0";this._Ebeln=t.getParameter("arguments").ebeln||this._Ebeln||"";this._Suc=t.getParameter("arguments").suc||this._Suc||"0";var o={Xblnr:this._Xblnr,Werks:this._Werks};this.getOwnerComponent().setModel(new e(o),"headerDetail");var r=this;var n=[];n.push(new sap.ui.model.Filter({path:"IOption",operator:sap.ui.model.FilterOperator.EQ,value1:"3"}));n.push(new sap.ui.model.Filter({path:"IEbeln",operator:sap.ui.model.FilterOperator.EQ,value1:r._Ebeln}));n.push(new sap.ui.model.Filter({path:"IXblnr",operator:sap.ui.model.FilterOperator.EQ,value1:parseInt(r._Xblnr)}));n.push(new sap.ui.model.Filter({path:"ILifnr",operator:sap.ui.model.FilterOperator.EQ,value1:r.getConfigModel().getProperty("/supplierInputKey")}));n.push(new sap.ui.model.Filter({path:"IWerks",operator:sap.ui.model.FilterOperator.EQ,value1:r._Suc}));var a="ZOSP_RETURNS_SRV";var l="HrdReturnsSet";var i=["ETDTDEVNAV","ETFDEVNAV","ITDFAGR"];var s=n;var u="";sap.ui.core.BusyIndicator.hide();sap.ui.core.BusyIndicator.show();r._GEToDataV2(a,l,s,i,u).then(function(t){sap.ui.core.BusyIndicator.hide();var o=t.data;console.log(o);var n=o.results[0];r.getOwnerComponent().setModel(new e(n),"devoDetail");r.paginate("devoDetail","/ETDTDEVNAV",1,0)})},_onDocumentMatchedComplemento:function(t){this.parent="COMPLEMENTO";this._Xblnr=t.getParameter("arguments").xblnr||this._Xblnr||"0",this._lifnr=t.getParameter("arguments").lifnr||this._lifnr||"0";this._Ebeln=t.getParameter("arguments").ebeln||this._Ebeln||"";this._Suc=t.getParameter("arguments").suc||this._Suc||"0";var o={Xblnr:this._Xblnr,Werks:this._Werks};sap.ui.core.BusyIndicator.show();this.getOwnerComponent().setModel(new e(o),"headerDetail");console.log("4");var r=this;var n=[];n.push(new sap.ui.model.Filter({path:"IOption",operator:sap.ui.model.FilterOperator.EQ,value1:"3"}));n.push(new sap.ui.model.Filter({path:"IEbeln",operator:sap.ui.model.FilterOperator.EQ,value1:r._Ebeln}));n.push(new sap.ui.model.Filter({path:"IXblnr",operator:sap.ui.model.FilterOperator.EQ,value1:parseInt(r._Xblnr)}));n.push(new sap.ui.model.Filter({path:"ILifnr",operator:sap.ui.model.FilterOperator.EQ,value1:r.getConfigModel().getProperty("/supplierInputKey")}));n.push(new sap.ui.model.Filter({path:"IWerks",operator:sap.ui.model.FilterOperator.EQ,value1:r._Suc}));var a="ZOSP_RETURNS_SRV";var l="HrdReturnsSet";var i=["ETDTDEVNAV","ETFDEVNAV","ITDFAGR"];var s=n;var u="";sap.ui.core.BusyIndicator.hide();sap.ui.core.BusyIndicator.show();r._GEToDataV2(a,l,s,i,u).then(function(t){sap.ui.core.BusyIndicator.hide();var o=t.data;console.log(o);var n=o.results[0];r.getOwnerComponent().setModel(new e(n),"devoDetail");r.paginate("devoDetail","/ETDTDEVNAV",1,0)})},_onDocumentMatchedFactoraje:function(t){this.parent="FACTORAJE";this._Xblnr=t.getParameter("arguments").xblnr||this._Xblnr||"0",this._lifnr=t.getParameter("arguments").lifnr||this._lifnr||"0";this._Ebeln=t.getParameter("arguments").ebeln||this._Ebeln||"0";this._Suc=t.getParameter("arguments").suc||this._Suc||"0";var o={Xblnr:this._Xblnr,Werks:this._Werks};this.getOwnerComponent().setModel(new e(o),"headerDetail");console.log("1");this.getOwnerComponent().setModel(new e(o),"headerDetail");var r=this;var n=[];n.push(new sap.ui.model.Filter({path:"IOption",operator:sap.ui.model.FilterOperator.EQ,value1:"3"}));n.push(new sap.ui.model.Filter({path:"IEbeln",operator:sap.ui.model.FilterOperator.EQ,value1:r._Ebeln}));n.push(new sap.ui.model.Filter({path:"IXblnr",operator:sap.ui.model.FilterOperator.EQ,value1:parseInt(r._Xblnr)}));n.push(new sap.ui.model.Filter({path:"ILifnr",operator:sap.ui.model.FilterOperator.EQ,value1:r.getConfigModel().getProperty("/supplierInputKey")}));n.push(new sap.ui.model.Filter({path:"IWerks",operator:sap.ui.model.FilterOperator.EQ,value1:r._Suc}));var a="ZOSP_RETURNS_SRV";var l="HrdReturnsSet";var i=["ETDTDEVNAV","ETFDEVNAV","ITDFAGR"];var s=n;var u="";sap.ui.core.BusyIndicator.hide();sap.ui.core.BusyIndicator.show();r._GEToDataV2(a,l,s,i,u).then(function(t){sap.ui.core.BusyIndicator.hide();var o=t.data;console.log(o);var n=o.results[0];r.getOwnerComponent().setModel(new e(n),"devoDetail");r.paginate("devoDetail","/ETDTDEVNAV",1,0)})},onCloseDialog:function(){if(this._oDialog){this._oDialog.destroy();this._oDialog=null}},onExit:function(){this.onCloseDialog()},buildExcel:function(){var e=this.getOwnerComponent().getModel("appTxts");let t=this.getOwnerComponent().getModel("devoDetail");var o=[{name:e.getProperty("/devo.folioDevo"),template:{content:"{Xblnr}"}},{name:e.getProperty("/devo.fechaDevo"),template:{content:t.getProperty("/ETFDEVNAV/results/0/Budat")}},{name:e.getProperty("/devo.sucursal"),template:{content:t.getProperty("/ETFDEVNAV/results/0/Werks")}},{name:e.getProperty("/devo.sucursal"),template:{content:t.getProperty("/ETFDEVNAV/results/0/Nwerks")}},{name:e.getProperty("/devo.status"),template:{content:t.getProperty("/ETFDEVNAV/results/0/Zstatusdev")}},{name:e.getProperty("/devo.amount"),template:{content:"{/EMtotal}"}},{name:e.getProperty("/devo.Code"),template:{content:t.getProperty("/ETFDEVNAV/results/0/Zfolagrup")}},{name:e.getProperty("/devo.folioFedex"),template:{content:t.getProperty("/ETFDEVNAV/results/0/Zfolfedex")}},{name:e.getProperty("/devo.fechacode"),template:{content:t.getProperty("/ETFDEVNAV/results/0/Zfechreg")}},{name:e.getProperty("/devo.fechaentrega"),template:{content:t.getProperty("/ETFDEVNAV/results/0/Zfechent")}},{name:e.getProperty("/devo.beforeto"),template:{content:t.getProperty("/ETFDEVNAV/results/0/Flimrec")}},{name:e.getProperty("/devo.item"),template:{content:"{Ebelp}"}},{name:e.getProperty("/devo.codigo"),template:{content:"'{Ean11}"}},{name:e.getProperty("/devo.descr"),template:{content:"{Txz01}"}},{name:e.getProperty("/devo.qty"),template:{content:"{Menge}"}},{name:e.getProperty("/devo.umb"),template:{content:"{Meins}"}},{name:e.getProperty("/devo.uprice"),template:{content:"{Netpr}"}},{name:e.getProperty("/devo.total"),template:{content:"{Brtwr}"}}];this.exportxls("devoDetail","/ETDTDEVNAV/results",o)}})});