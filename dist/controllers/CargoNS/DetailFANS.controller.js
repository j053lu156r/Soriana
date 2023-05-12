sap.ui.define(["demo/controllers/BaseController","sap/m/MessageBox","sap/m/PDFViewer"],function(e,t,o){"use strict";var r=new this.Acuerdos;return e.extend("demo.controllers.CargoNS.DetailFANS",{onInit:function(){this._pdfViewer=new o;this.getView().addDependent(this._pdfViewer);this.oRouter=this.getOwnerComponent().getRouter();this.oModel=this.getOwnerComponent().getModel();this.oRouter.getRoute("detailAcuerdosFANS").attachPatternMatched(this._onDocumentMatched,this);console.log("on detalle acuerdos init-----")},searchData:function(){var e=this.getOwnerComponent().getModel("appTxts");var o=true;if(!r.getModel()){r.initModel()}var s=this._sociedad;var n=this._document;var i=this._ejercicio;var a="";if((n==""||n==null)&&(a==""||a==null)){t.error(e.getProperty("/acuerdos.indNo"));o=false}else if(n!=""&&n!=null){if(s==""||s==null){t.error(e.getProperty("/acuerdos.indSoc"));o=false}else if(i==""||i==null){t.error(e.getProperty("/acuerdos.indEje"));o=false}}else if(n!=""&&n!=null&&(a!=""&&a!=null)){t.error(e.getProperty("/acuerdos.soloIndNo"));o=false}if(o){var d="AcuerdosSet?$expand=AcuerdosDet&$filter=";if(n!=""&&n!=null){d+="Sociedad eq '"+s+"'";d+=" and Documento eq '"+n+"'";d+=" and Ejercicio eq '"+i+"'"}else if(a!=""&&a!=null){d+="Acuerdo eq '"+a+"'"}this.getView().byId("tableAcuerdos").setBusy(true);r.getJsonModelAsync(d,function(e,t){var o=e.getProperty("/results/0");if(o!=null){var r=o.AcuerdosDet.results.reduce((e,t)=>+e+(+t["Base"]||0),0);var s=o.AcuerdosDet.results.reduce((e,t)=>+e+(+t["Descuento"]||0),0);var n=o.AcuerdosDet.results.reduce((e,t)=>+e+(+t["IVA"]||0),0);if(o.AcuerdosDet.results.length>0){var i=o.AcuerdosDet.results[0].Waers}else{i="MXN"}var a={TotBase:Number(r.toFixed(2)),TotDescto:Number(s.toFixed(2)),TotIVA:Number(n.toFixed(2)),TotMoneda:i};t.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(a),"acuTotDetModel");t.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(o),"AcuerdosHdr");t.paginate("AcuerdosHdr","/AcuerdosDet",1,0)}t.getView().byId("tableAcuerdos").setBusy(false)},function(e){e.getView().byId("tableAcuerdos").setBusy(false)},this)}},onExit:function(){},clearFilters:function(){this.getView().byId("sociedadInput").setValue("");this.getView().byId("documentoInput").setValue("");this.getView().byId("ejercicioInput").setValue("");this.getView().byId("acuerdoInput").setValue("");var e=this.getOwnerComponent().getModel("AcuerdosHdr");if(e){e.setData([])}},buildExportTable:function(){var e=this.getOwnerComponent().getModel("appTxts");var t=[{name:e.getProperty("/acuerdos.sucursal"),template:{content:"{Centro}"}},{name:e.getProperty("/acuerdos.base"),template:{content:"{Base}"}},{name:e.getProperty("/acuerdos.desc"),template:{content:"{Descuento}"}},{name:e.getProperty("/acuerdos.iva"),template:{content:"{IVA}"}},{name:e.getProperty("/acuerdos.pDesc"),template:{content:"{PDesc}"}},{name:e.getProperty("/acuerdos.unidad"),template:{content:"{Unidad}"}}];this.exportxls("AcuerdosHdr","/AcuerdosDet/results",t)},_onDocumentMatched:function(e){console.log("on Acuerdos AS matched**************");this._document=e.getParameter("arguments").document||this._document||"0";this._sociedad=e.getParameter("arguments").sociedad||this._sociedad||"0";this._ejercicio=e.getParameter("arguments").ejercicio||this._ejercicio||"0";this._doc=e.getParameter("arguments").doc||this._doc||"0";this._fecha=e.getParameter("arguments").fecha||this._fecha||"0";this.searchData()},handleFullScreen:function(){var e=this.getOwnerComponent().getHelper().getNextUIState(2);this.bFocusFullScreenButton=true;var t=this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");this.oRouter.navTo("detailAcuerdosFANS",{layout:t,document:this._document,sociedad:this._sociedad,ejercicio:this._ejercicio,doc:this._document})},handleExitFullScreen:function(){this.bFocusFullScreenButton=true;var e=this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");this.oRouter.navTo("detailAcuerdosFANS",{layout:e,document:this._document,sociedad:this._sociedad,ejercicio:this._ejercicio,doc:this._document})},handleClose:function(){console.log("on hanlde close");var e=this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");this.oRouter.navTo("detailFactoring",{layout:sap.f.LayoutType.TwoColumnsMidExpanded,document:this._doc,sociedad:this._sociedad,ejercicio:this._ejercicio,fecha:this._fecha},true)},onListItemPress:function(e){var t=e.getSource().getBindingContext("AcuerdosHdr").getPath(),o=t.split("/").slice(-1).pop();var r=this.getOwnerComponent().getModel("AcuerdosHdr");var s=r.getProperty("/AcuerdosDet/Paginated/results");var n=s[o];var i=this.getOwnerComponent().getHelper().getNextUIState(3);this.getOwnerComponent().getRouter().navTo("detailDetailFANS",{layout:i.layout,sociedad:this._sociedad,document:this._document,ejercicio:this._ejercicio,doc:this._doc,tda:n.Centro},true)},onPressPDF:function(){var e=this.getOwnerComponent().getModel("AcuerdosHdr");var t=e.getData();var o="/sap/opu/odata/sap/ZOSP_ACUERDOS_SRV/";var r=o+"AcuerdosFilesSet('"+t.UUID+"')/$value";this._pdfViewer.setSource(r);this._pdfViewer.setTitle("CFDI");this._pdfViewer.open()},onPressXML:function(){var e=this.getOwnerComponent().getModel("AcuerdosHdr");var o=e.getData();var r="/sap/opu/odata/sap/ZOSP_ACUERDOS_SRV/";var e=new sap.ui.model.odata.ODataModel(r);e.read("/AcuerdosFilesSet('XML"+o.UUID+"')/$value",{method:"GET",success:function(e,t){let r=o.UUID;let s="application/xml";let n=t.body;sap.ui.core.util.File.save(n,r,"xml",s)},error:function(e){t.error(e.message)}})}})});