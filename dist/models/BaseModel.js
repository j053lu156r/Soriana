function BaseModel(o){this.sUrl=o.sUrl;this.sModel=o.sModel;this.sBindingModel=o.sBindingModel}BaseModel.prototype.initModel=function(){var o=new sap.ui.model.odata.ODataModel(this.sUrl,true);sap.ui.getCore().setModel(o,this.sModel)};BaseModel.prototype.getModel=function(){return sap.ui.getCore().getModel(this.sModel)};BaseModel.prototype.setBindingModel=function(o){sap.ui.getCore().setModel(o,this.sBindingModel)};BaseModel.prototype.getBindingModel=function(){return sap.ui.getCore().getModel(this.sBindingModel)};BaseModel.prototype.getJsonModel=function(o){var e=new sap.m.BusyDialog;e.open();if(!this.getModel()){this.initModel()}var t=new sap.ui.model.json.JSONModel;this.getModel().read(o,undefined,undefined,false,function(o,e){t.setData(o)});e.close();return t};BaseModel.prototype.getJsonModelAsync=function(o,e,t,a,s=true){if(!this.getModel()){this.initModel()}this.getModel().read(o,{async:s,success:function(o,t){var s=new sap.ui.model.json.JSONModel;s.setData(o);e(s,a)}.bind(a),error:function(){t(a)}})};BaseModel.prototype.create=function(o,e){var t=new sap.m.BusyDialog;t.open();if(!this.getModel()){this.initModel()}var a=null;var s=this.getModel();console.log(s);s.setHeaders({"X-CSRF-Token":"fetch","X-Requested-With":"XMLHttpRequest"});console.log("***************** After refreshSecurityToken");s.read("");console.log(s);var r=s.getSecurityToken();console.log(r);s.setHeaders({"X-CSRF-Token":r,"X-Requested-With":"XMLHttpRequest"});s.create(o,e,null,function(o){a=o},function(o){a={};a.correcto=false;a.mensaje=o.message});t.close();return a};function UserModel(){var o={};o.sUrl="/sap/opu/odata/sap/ZOSP_USERADMIN_SRV_02/";o.sModel="logonModel";o.sBindingModel="userdata";BaseModel.call(this,o)}UserModel.prototype=Object.create(BaseModel.prototype);UserModel.prototype.constructor=UserModel;function VerifyModel(o,e){var t={};t.sUrl=o;t.sModel=e;BaseModel.call(this,t)}VerifyModel.prototype=Object.create(BaseModel.prototype);VerifyModel.prototype.constructor=VerifyModel;VerifyModel.prototype.cfdiValidate=function(o){return this.create("/vigenciaSet",o)};VerifyModel.prototype.sendCfdi=function(o,e){return this.create(o,e)};function ComplPagoModel(){var o={};o.sUrl="/sap/opu/odata/sap/ZOSP_DUECOMPLEMENT_SRV/";o.sModel="complPagoModel";BaseModel.call(this,o)}ComplPagoModel.prototype=Object.create(BaseModel.prototype);ComplPagoModel.prototype.constructor=ComplPagoModel;function VendorModel(){var o={};o.sModel="vendorModel";BaseModel.call(this,o);this.verify=new VerifyModel("/sap/opu/odata/sap/ZMMPORTAL_VERIFICACION_SRV/","vefifySendFact")}VendorModel.prototype=Object.create(BaseModel.prototype);VendorModel.prototype.constructor=VendorModel;function InvoiceReject(){var o={};o.sUrl="/sap/opu/odata/sap/ZSPORTAL_INVOICEREJECT_SRV/";o.sModel="invoiceReject";BaseModel.call(this,o)}InvoiceReject.prototype=Object.create(BaseModel.prototype);InvoiceReject.prototype.constructor=InvoiceReject;function NotCredDevol(){var o={};o.sUrl="/sap/opu/odata/sap/ZSPORTAL_NOTCREDDEVOL_SRV/";o.sModel="notCredDevolModel";BaseModel.call(this,o);this.verify=new VerifyModel("/sap/opu/odata/sap/ZMMPORTAL_VERIFICACION_SRV/","vefifyNotCredDevol")}NotCredDevol.prototype=Object.create(BaseModel.prototype);NotCredDevol.prototype.constructor=NotCredDevol;function Notifications(){var o={};o.sUrl="/sap/opu/odata/sap/ZSPORTAL_NOTICE_SRV/";o.sModel="notifications";BaseModel.call(this,o)}Notifications.prototype=Object.create(BaseModel.prototype);Notifications.prototype.contructor=Notifications;function Pedidostemp(){var o={};o.sUrl="/sap/opu/odata/sap/ZOSP_DEVO_NC_SRV_01/";o.sModel="pedidostemp";BaseModel.call(this,o)}Pedidostemp.prototype=Object.create(BaseModel.prototype);Pedidostemp.prototype.contructor=Pedidostemp;function Pedidos(){var o={};o.sUrl="/sap/opu/odata/sap/ZOSP_PORDER_SRV/";o.sModel="Pedidos";BaseModel.call(this,o)}Pedidos.prototype=Object.create(BaseModel.prototype);Pedidos.prototype.contructor=Pedidos;function EnvioCfdi(){var o={};o.sUrl="/sap/opu/odata/sap/ZOSP_CFDI_SRV_04/";o.sModel="envioCfdi";BaseModel.call(this,o)}EnvioCfdi.prototype=Object.create(BaseModel.prototype);EnvioCfdi.prototype.contructor=EnvioCfdi;function ValidacionesFiscales(){var o=window.location.host;if(o!=="socios.soriana.com"){url="https://servicioswebsorianaqa.soriana.com/RecibeCFD/wseDocReciboPortal.asmx"}else{url="https://enviodocumentos.soriana.com/RecibeCFD/wseDocReciboPortal.asmx"}var e={};e.sUrl=url;e.sModel="validacionesFiscales";BaseModel.call(this,e)}ValidacionesFiscales.prototype=Object.create(BaseModel.prototype);ValidacionesFiscales.prototype.contructor=ValidacionesFiscales;function AdendaSimplificada(){var o=window.location.host;if(o!=="socios.soriana.com"){url="https://servicioswebsorianaqa.soriana.com/RecibeCFD/wseDocReciboSimplificada.asmx"}else{url="https://enviodocumentos.soriana.com/RecibeCFD/wseDocReciboSimplificada.asmx"}var e={};e.sUrl=url;e.sModel="adendaSimplificada";BaseModel.call(this,e)}AdendaSimplificada.prototype=Object.create(BaseModel.prototype);AdendaSimplificada.prototype.contructor=AdendaSimplificada;function PaymentPlan(){var o={};o.sUrl="/sap/opu/odata/sap/ZOSP_PYMNTP_SRV_01/";o.sModel="paymentPlan";BaseModel.call(this,o)}PaymentPlan.prototype=Object.create(BaseModel.prototype);PaymentPlan.prototype.contructor=PaymentPlan;function MyInbox(){var o={};o.sUrl="/sap/opu/odata/sap/ZOSP_INBOXNEW_SRV/";o.sModel="miInbox";o.sBindingModel="inboxData";BaseModel.call(this,o)}MyInbox.prototype=Object.create(BaseModel.prototype);MyInbox.prototype.contructor=MyInbox;function DelivReview(){var o={};o.sUrl="/sap/opu/odata/sap/ZOSP_FAC_REV_SRV/";o.sModel="delivReview";BaseModel.call(this,o)}DelivReview.prototype=Object.create(BaseModel.prototype);DelivReview.prototype.contructor=DelivReview;function Statement(){var o={};o.sUrl="/sap/opu/odata/sap/ZOSP_FAC_REV_SRV/";o.sModel="statement";BaseModel.call(this,o)}Statement.prototype=Object.create(BaseModel.prototype);Statement.prototype.contructor=Statement;function FacSoriana(){var o={};o.sUrl="/sap/opu/odata/sap/ZOSP_SOR_INV_SRV/";o.sModel="facsormodel";BaseModel.call(this,o)}FacSoriana.prototype=Object.create(BaseModel.prototype);FacSoriana.prototype.constructor=FacSoriana;function ChatBot(){var o={};o.sUrl="/sap/opu/odata/sap/ZOSP_CHATBOT_SRV/";o.sModel="chatBot";BaseModel.call(this,o)}ChatBot.prototype=Object.create(BaseModel.prototype);ChatBot.prototype.constructor=ChatBot;function Devoluciones(){var o={};o.sUrl="/sap/opu/odata/sap/ZOSP_RETURNS_SRV/";o.sModel="devomodel";BaseModel.call(this,o)}Devoluciones.prototype=Object.create(BaseModel.prototype);Devoluciones.prototype.constructor=Devoluciones;function Aclaraciones(){var o={};o.sUrl="/sap/opu/odata/sap/ZOSP_ACLARA_SRV/";o.sModel="aclaramodel";BaseModel.call(this,o)}Aclaraciones.prototype=Object.create(BaseModel.prototype);Aclaraciones.prototype.constructor=Aclaraciones;function Repartidores(){var o={};o.sUrl="/sap/opu/odata/sap/ZOSP_DEALERS_SRV/";o.sModel="repmodel";BaseModel.call(this,o)}Repartidores.prototype=Object.create(BaseModel.prototype);Repartidores.prototype.constructor=Repartidores;function CfdiModel(){var o={};o.sUrl="/sap/opu/odata/sap/ZOSP_CFDI_BTNSND2_SRV/";o.sModel="cfdiModel";BaseModel.call(this,o)}CfdiModel.prototype=Object.create(BaseModel.prototype);CfdiModel.prototype.constructor=CfdiModel;function WSModel(){var o={};o.sUrl="/sap/opu/odata/sap/ZOSP_CFDI_WS_SRV/";o.sModel="wsModel";BaseModel.call(this,o)}WSModel.prototype=Object.create(BaseModel.prototype);WSModel.prototype.constructor=WSModel;function AvisoModel(){var o={};o.sUrl="/sap/opu/odata/sap/ZOSP_CFDI_BTNSND2A_SRV/";o.sModel="avisoModel";BaseModel.call(this,o)}AvisoModel.prototype=Object.create(BaseModel.prototype);AvisoModel.prototype.constructor=AvisoModel;function DevoZipModel(){var o={};o.sUrl="/sap/opu/odata/sap/ZOSP_DETECNO_SRV/";o.sModel="devoZipModel";BaseModel.call(this,o)}DevoZipModel.prototype=Object.create(BaseModel.prototype);DevoZipModel.prototype.constructor=DevoZipModel;function DashboardModel(){var o={};o.sUrl="/sap/opu/odata/sap/ZOSP_ACDASHBOARD_SRV/";o.sModel="dashboardModel";BaseModel.call(this,o)}DashboardModel.prototype=Object.create(BaseModel.prototype);DashboardModel.prototype.constructor=DevoZipModel;function Remissions(){var o={};o.sUrl="/sap/opu/odata/sap/ZOSP_AVISO_ANT_SRV/";o.sModel="remissionsModel";BaseModel.call(this,o)}Remissions.prototype=Object.create(BaseModel.prototype);Remissions.prototype.constructor=Remissions;function Incidencias(){var o={};o.sUrl="/sap/opu/odata/sap/ZOSP_INDASHBOARD_SRV/";o.sModel="incidenciasModel";BaseModel.call(this,o)}Incidencias.prototype=Object.create(BaseModel.prototype);Incidencias.prototype.constructor=Incidencias;function Aportaciones(){var o={};o.sUrl="/sap/opu/odata/sap/ZOSP_APORTA_SRV/";o.sModel="aportacionesModel";BaseModel.call(this,o)}Aportaciones.prototype=Object.create(BaseModel.prototype);Aportaciones.prototype.constructor=Aportaciones;function Acuerdos(){var o={};o.sUrl="/sap/opu/odata/sap/ZOSP_ACUERDOS_SRV/";o.sModel="acuerdosModel";BaseModel.call(this,o)}Acuerdos.prototype=Object.create(BaseModel.prototype);Acuerdos.prototype.constructor=Acuerdos;function ACcapturados(){var o={};o.sUrl="/sap/opu/odata/sap/ZOS_AC_CAPTURADOS_SRV/";o.sModel="ACcapturadosModel";BaseModel.call(this,o)}ACcapturados.prototype=Object.create(BaseModel.prototype);ACcapturados.prototype.constructor=ACcapturados;function Polizas(){var o={};o.sUrl="/sap/opu/odata/sap/ZOS_FI_DOCUMENTS_SRV/";o.sModel="polizasModel";BaseModel.call(this,o)}Polizas.prototype=Object.create(BaseModel.prototype);Polizas.prototype.constructor=Polizas;function ACEscalas(){var o={};o.sUrl="/sap/opu/odata/sap/ZOSP_AC_ESCALA_SRV/";o.sModel="ACEscalasModel";BaseModel.call(this,o)}ACEscalas.prototype=Object.create(BaseModel.prototype);ACEscalas.prototype.constructor=ACEscalas;function MejorCond(){var o={};o.sUrl="/sap/opu/odata/sap/ZOSP_MEJOR_COND_REP_SRV/";o.sModel="mejorCondModel";BaseModel.call(this,o)}MejorCond.prototype=Object.create(BaseModel.prototype);MejorCond.prototype.constructor=MejorCond;function RemissionCancel(){var o={};o.sUrl="/sap/opu/odata/sap/ZOSP_AVISO_CANCEL_SRV/";o.sModel="remissionCancelModel";BaseModel.call(this,o)}RemissionCancel.prototype=Object.create(BaseModel.prototype);RemissionCancel.prototype.constructor=RemissionCancel;function Citas1(){var o={};o.sUrl="/sap/opu/odata/sap/ZOSP_CITAS_VALIDA_SRV/";o.sModel="citas1Model";BaseModel.call(this,o)}Citas1.prototype=Object.create(BaseModel.prototype);Citas1.prototype.constructor=Citas1;function Citas2(){var o={};o.sUrl="/sap/opu/odata/sap/ZOSP_CITAS_SRV/";o.sModel="citas2Model";BaseModel.call(this,o)}Citas2.prototype=Object.create(BaseModel.prototype);Citas2.prototype.constructor=Citas2;function Productos(){var o={};o.sUrl="/sap/opu/odata/sap/ZOSP_CATPRO_SRV/";o.sModel="productModel";BaseModel.call(this,o)}Productos.prototype=Object.create(BaseModel.prototype);Productos.prototype.constructor=Productos;function NotifAltaMasiva(){var o={};o.sUrl="/sap/opu/odata/sap/ZOSP_NOTIF_SRV/";o.sModel="notifAltaModel";BaseModel.call(this,o)}NotifAltaMasiva.prototype=Object.create(BaseModel.prototype);NotifAltaMasiva.prototype.constructor=NotifAltaMasiva;function ModelEDI(){var o={};o.sUrl="/sap/opu/odata/sap/ZSOP_EDI_OUTPUT_FILE_SRV/";o.sModel="downEdiModel";BaseModel.call(this,o)}ModelEDI.prototype=Object.create(BaseModel.prototype);ModelEDI.prototype.constructor=ModelEDI;function ModelTC(){var o={};o.sUrl="/sap/opu/odata/sap/ZOSP_TXT_TERM_COND_SRV/";o.sModel="termconsModel";BaseModel.call(this,o)}ModelTC.prototype=Object.create(BaseModel.prototype);ModelTC.prototype.constructor=ModelTC;function ModelXlsPedidos(){var o={};o.sUrl="/sap/opu/odata/sap/ZSOP_PEDIDO_EXCEL_SRV/";o.sModel="xlsPedidosModel";BaseModel.call(this,o)}ModelXlsPedidos.prototype=Object.create(BaseModel.prototype);ModelXlsPedidos.prototype.constructor=ModelXlsPedidos;