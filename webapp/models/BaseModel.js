const endpointQASwebService = "https://servicioswebsorianaqa.soriana.com";
const endpointPROwebService = "https://enviodocumentos.soriana.com";
const endpointQASSTIBO = "https://soriana-qa.mdm.stibosystems.com";
const endpointPROSTIBO = "https://soriana-prod.mdm.stibosystems.com";
const stiboQASModule = " [soriana-qa.mdm.stibosystems.com]"
const stiboPROModule = "  [soriana-prod.mdm.stibosystems.com]"

let hostPro = "socios.soriana.com"

//INICIA BASE MODEL
function BaseModel(params) {
    this.sUrl = params.sUrl;
    this.sModel = params.sModel;
    this.sBindingModel = params.sBindingModel;
}


BaseModel.prototype.initModel = function () {
    var oModel = new sap.ui.model.odata.ODataModel(this.sUrl, true);
    sap.ui.getCore().setModel(oModel, this.sModel);
};

BaseModel.prototype.getModel = function () {
    return sap.ui.getCore().getModel(this.sModel);
};

BaseModel.prototype.setBindingModel = function (model) {
    sap.ui.getCore().setModel(model, this.sBindingModel);
};

BaseModel.prototype.getBindingModel = function () {
    return sap.ui.getCore().getModel(this.sBindingModel);
};

BaseModel.prototype.getJsonModel = function (string) {
    var oGlobalBusyDialog = new sap.m.BusyDialog();
    oGlobalBusyDialog.open();
    if (!this.getModel()) {
        this.initModel();
    }
    var jsonModel = new sap.ui.model.json.JSONModel();
    this.getModel().read(string, undefined, undefined, false,
        function (oData, response) {
            jsonModel.setData(oData);
        });
    oGlobalBusyDialog.close();
    return jsonModel;
};

BaseModel.prototype.getJsonModelAsync = function (string, successFunction, errorFunction, parent, async = true) {
    if (!this.getModel()) {
        this.initModel();
    }

    this.getModel().read(string,
        {
            async: async,
            success: function (oData, response) {
                var jsonModel = new sap.ui.model.json.JSONModel();
                jsonModel.setData(oData);
                successFunction(jsonModel, parent);
            }.bind(parent),
            error: function () {
                errorFunction(parent);
            }
        });
};

BaseModel.prototype.create = function (url, object) {
    var oGlobalBusyDialog = new sap.m.BusyDialog();
    oGlobalBusyDialog.open();
    if (!this.getModel()) {
        this.initModel();
    }

    var oSucces = null;
    var model = this.getModel();
    console.log(model)    
    model.setHeaders({
        "X-CSRF-Token": "fetch",
        "X-Requested-With": "XMLHttpRequest"
        //"Content-Type": "application/atom+xml"
    });
    //    model.refreshSecurityToken();
    console.log("***************** After refreshSecurityToken");

    model.read("");
    console.log(model)
    var gToken = model.getSecurityToken();
    console.log(gToken)

    model.setHeaders({
        "X-CSRF-Token": gToken,
        "X-Requested-With": "XMLHttpRequest"
    });
    model.create(url,
        object, null,
        function (success) {
            oSucces = success;
        },
        function (error) {
            oSucces = {};
            oSucces.correcto = false;
            oSucces.mensaje = error.message;
        });

    oGlobalBusyDialog.close();

    return oSucces;
};
//TERMINA BASE MODEL

//User Model
function UserModel() {
    var params = {};
    params.sUrl = "/sap/opu/odata/sap/ZOSP_USERADMIN_SRV_02/";
    params.sModel = "logonModel";
    params.sBindingModel = "userdata";
    BaseModel.call(this, params);
}

UserModel.prototype = Object.create(BaseModel.prototype);
UserModel.prototype.constructor = UserModel;

//Verify Model
function VerifyModel(ulr, model) {
    var params = {};
    params.sUrl = ulr;
    params.sModel = model;
    BaseModel.call(this, params);
}

VerifyModel.prototype = Object.create(BaseModel.prototype);
VerifyModel.prototype.constructor = VerifyModel;

VerifyModel.prototype.cfdiValidate = function (oCfdi) {
    return this.create("/vigenciaSet", oCfdi);
};

VerifyModel.prototype.sendCfdi = function (url, oCfdi) {
    return this.create(url, oCfdi);
};

//Complemento de pago Model
function ComplPagoModel() {
    var params = {};
    params.sUrl = "/sap/opu/odata/sap/ZOSP_DUECOMPLEMENT_SRV/";
    params.sModel = "complPagoModel";
    BaseModel.call(this, params);

    //this.verify = new VerifyModel("/sap/opu/odata/sap/ZFIPORTAL_PAGOS_SRV/", "verifyComplPago");
}

ComplPagoModel.prototype = Object.create(BaseModel.prototype);
ComplPagoModel.prototype.constructor = ComplPagoModel;

//Enviar factura Model
function VendorModel() {
    var params = {};
    /*  params.sUrl = "/sap/opu/odata/sap/ZSPORTAL_SRV/"; CVM */
    params.sModel = "vendorModel";
    BaseModel.call(this, params);
    this.verify = new VerifyModel("/sap/opu/odata/sap/ZMMPORTAL_VERIFICACION_SRV/", "vefifySendFact");
}

VendorModel.prototype = Object.create(BaseModel.prototype);
VendorModel.prototype.constructor = VendorModel;

//Facturas rechazadas
function InvoiceReject() {
    var params = {};
    params.sUrl = "/sap/opu/odata/sap/ZSPORTAL_INVOICEREJECT_SRV/";
    params.sModel = "invoiceReject";
    BaseModel.call(this, params);
}

InvoiceReject.prototype = Object.create(BaseModel.prototype);
InvoiceReject.prototype.constructor = InvoiceReject;

//Notas de credito por devolucion
function NotCredDevol() {
    var params = {};
    params.sUrl = "/sap/opu/odata/sap/ZSPORTAL_NOTCREDDEVOL_SRV/";
    params.sModel = "notCredDevolModel";
    BaseModel.call(this, params);
    this.verify = new VerifyModel("/sap/opu/odata/sap/ZMMPORTAL_VERIFICACION_SRV/", "vefifyNotCredDevol");
}

NotCredDevol.prototype = Object.create(BaseModel.prototype);
NotCredDevol.prototype.constructor = NotCredDevol;

//Noticias
function Notifications() {
    var params = {};
    params.sUrl = "/sap/opu/odata/sap/ZSPORTAL_NOTICE_SRV/";
    params.sModel = "notifications";
    BaseModel.call(this, params);
}

Notifications.prototype = Object.create(BaseModel.prototype);
Notifications.prototype.contructor = Notifications;

//MisPedidos
function Pedidostemp() {
    var params = {};
    params.sUrl = "/sap/opu/odata/sap/ZOSP_DEVO_NC_SRV_01/";
    params.sModel = "pedidostemp";
    BaseModel.call(this, params);
}

Pedidostemp.prototype = Object.create(BaseModel.prototype);
Pedidostemp.prototype.contructor = Pedidostemp;

function Pedidos() {
    var params = {};
    params.sUrl = "/sap/opu/odata/sap/ZOSP_PORDER_SRV/";
    params.sModel = "Pedidos";
    BaseModel.call(this, params);
}

Pedidos.prototype = Object.create(BaseModel.prototype);
Pedidos.prototype.contructor = Pedidos;

//Envio CFDI
function EnvioCfdi() {
    var params = {};
    params.sUrl = "/sap/opu/odata/sap/ZOSP_CFDI_SRV_04/";
    params.sModel = "envioCfdi";
    BaseModel.call(this, params);
}

EnvioCfdi.prototype = Object.create(BaseModel.prototype);
EnvioCfdi.prototype.contructor = EnvioCfdi;

//Envio Validaciones fiscales
function ValidacionesFiscales() {

    var host = window.location.host; 
    if (host !== hostPro){
        url = endpointQASwebService + "/RecibeCFD/wseDocReciboPortal.asmx" //QAS
    } else {
        url = endpointPROwebService +"/RecibeCFD/wseDocReciboPortal.asmx" //PRO
    }
    var params = {};
    params.sUrl = url;
    params.sModel = "validacionesFiscales";
    BaseModel.call(this, params);
}

ValidacionesFiscales.prototype = Object.create(BaseModel.prototype);
ValidacionesFiscales.prototype.contructor = ValidacionesFiscales;

//Envio Adenda simplificada
function AdendaSimplificada() {

    var host = window.location.host; 
    if (host !== hostPro){
        url = endpointQASwebService + "/RecibeCFD/wseDocReciboSimplificada.asmx" //QAS
    } else {
        url = endpointPROwebService + "/RecibeCFD/wseDocReciboSimplificada.asmx" //PRO
    }
    var params = {};
    params.sUrl = url;
    params.sModel = "adendaSimplificada";
    BaseModel.call(this, params);
}

AdendaSimplificada.prototype = Object.create(BaseModel.prototype);
AdendaSimplificada.prototype.contructor = AdendaSimplificada;

//Plan de pagos
function PaymentPlan() {
    var params = {};
    params.sUrl = "/sap/opu/odata/sap/ZOSP_PYMNTP_SRV_01/";
    params.sModel = "paymentPlan";
    BaseModel.call(this, params);
}

PaymentPlan.prototype = Object.create(BaseModel.prototype);
PaymentPlan.prototype.contructor = PaymentPlan;

//Mi bandeja
function MyInbox() {
    var params = {};
    params.sUrl = "/sap/opu/odata/sap/ZOSP_INBOXNEW_SRV/";
    params.sModel = "miInbox";
    params.sBindingModel = "inboxData";
    BaseModel.call(this, params);
}

MyInbox.prototype = Object.create(BaseModel.prototype);
MyInbox.prototype.contructor = MyInbox;

//Delivery review
function DelivReview() {
    var params = {};
    params.sUrl = "/sap/opu/odata/sap/ZOSP_FAC_REV_SRV/";
    params.sModel = "delivReview";
    BaseModel.call(this, params);
}

DelivReview.prototype = Object.create(BaseModel.prototype);
DelivReview.prototype.contructor = DelivReview;


//Statement
function Statement() {
    var params = {};
    params.sUrl = "/sap/opu/odata/sap/ZOSP_FAC_REV_SRV/";
    params.sModel = "statement";
    BaseModel.call(this, params);
}

Statement.prototype = Object.create(BaseModel.prototype);
Statement.prototype.contructor = Statement;

//User Model
function FacSoriana() {
    var params = {};
    params.sUrl = "/sap/opu/odata/sap/ZOSP_SOR_INV_SRV/";
    params.sModel = "facsormodel";
    BaseModel.call(this, params);
}

FacSoriana.prototype = Object.create(BaseModel.prototype);
FacSoriana.prototype.constructor = FacSoriana;

function ChatBot() {
    var params = {};
    params.sUrl = "/sap/opu/odata/sap/ZOSP_CHATBOT_SRV/";
    params.sModel = "chatBot";
    BaseModel.call(this, params);
}

ChatBot.prototype = Object.create(BaseModel.prototype);
ChatBot.prototype.constructor = ChatBot;

//User Model Devoluciones
function Devoluciones() {
    var params = {};
    params.sUrl = "/sap/opu/odata/sap/ZOSP_RETURNS_SRV/";
    params.sModel = "devomodel";
    BaseModel.call(this, params);
}

Devoluciones.prototype = Object.create(BaseModel.prototype);
Devoluciones.prototype.constructor = Devoluciones;

//Model Aclaraciones
function Aclaraciones() {
    var params = {};
    params.sUrl = "/sap/opu/odata/sap/ZOSP_ACLARA_SRV/";
    params.sModel = "aclaramodel";
    BaseModel.call(this, params);
}

Aclaraciones.prototype = Object.create(BaseModel.prototype);
Aclaraciones.prototype.constructor = Aclaraciones;

//Model Repartidores
function Repartidores() {
    var params = {};
    params.sUrl = "/sap/opu/odata/sap/ZOSP_DEALERS_SRV/";
    params.sModel = "repmodel";
    BaseModel.call(this, params);
}

Repartidores.prototype = Object.create(BaseModel.prototype);
Repartidores.prototype.constructor = Repartidores;

//Model CFDI
function CfdiModel() {
    var params = {};
    params.sUrl = "/sap/opu/odata/sap/ZOSP_CFDI_BTNSND2_SRV/";
    params.sModel = "cfdiModel";
    BaseModel.call(this, params);
}

CfdiModel.prototype = Object.create(BaseModel.prototype);
CfdiModel.prototype.constructor = CfdiModel;

//Model Web Service Auth
function WSModel() {
    var params = {};
    params.sUrl = "/sap/opu/odata/sap/ZOSP_CFDI_WS_SRV/";
    params.sModel = "wsModel";
    BaseModel.call(this, params);
}

WSModel.prototype = Object.create(BaseModel.prototype);
WSModel.prototype.constructor = WSModel;

//Model Aviso anticipado
function AvisoModel() {
    var params = {};
    params.sUrl = "/sap/opu/odata/sap/ZOSP_CFDI_BTNSND2A_SRV/";
    params.sModel = "avisoModel";
    BaseModel.call(this, params);
}

AvisoModel.prototype = Object.create(BaseModel.prototype);
AvisoModel.prototype.constructor = AvisoModel;

//Model para Descarga ZIP Devoluciones Detecno
function DevoZipModel() {
    var params = {};
    params.sUrl = "/sap/opu/odata/sap/ZOSP_DETECNO_SRV/";
    params.sModel = "devoZipModel";
    BaseModel.call(this, params);
}

DevoZipModel.prototype = Object.create(BaseModel.prototype);
DevoZipModel.prototype.constructor = DevoZipModel;

//Model para Descarga ZIP Devoluciones Detecno
function DashboardModel() {
    var params = {};
    params.sUrl = "/sap/opu/odata/sap/ZOSP_ACDASHBOARD_SRV/";
    params.sModel = "dashboardModel";
    BaseModel.call(this, params);
}

DashboardModel.prototype = Object.create(BaseModel.prototype);
DashboardModel.prototype.constructor = DevoZipModel;

//Model para aviso anticipado
function Remissions() {
    var params = {};
    params.sUrl = "/sap/opu/odata/sap/ZOSP_AVISO_ANT_SRV/";
    params.sModel = "remissionsModel";
    BaseModel.call(this, params);
}

Remissions.prototype = Object.create(BaseModel.prototype);
Remissions.prototype.constructor = Remissions;

//Model Incidencias
function Incidencias() {
    var params = {};
    params.sUrl = "/sap/opu/odata/sap/ZOSP_INDASHBOARD_SRV/";
    params.sModel = "incidenciasModel";
    BaseModel.call(this, params);
}

Incidencias.prototype = Object.create(BaseModel.prototype);
Incidencias.prototype.constructor = Incidencias;//Model Incidencias

//Model Aportaciones
function Aportaciones() {
    var params = {};
    params.sUrl = "/sap/opu/odata/sap/ZOSP_APORTA_SRV/";
    params.sModel = "aportacionesModel";
    BaseModel.call(this, params);
}

Aportaciones.prototype = Object.create(BaseModel.prototype);
Aportaciones.prototype.constructor = Aportaciones;//Model Aportaciones

//Model Acuerdos
function Acuerdos() {
    var params = {};
    params.sUrl = "/sap/opu/odata/sap/ZOSP_ACUERDOS_SRV/";
    params.sModel = "acuerdosModel";
    BaseModel.call(this, params);
}

Acuerdos.prototype = Object.create(BaseModel.prototype);
Acuerdos.prototype.constructor = Acuerdos;//Model Acuerdos

//Model ACcapturados Bolentin a venta
function ACcapturados() {
    var params = {};
    params.sUrl = "/sap/opu/odata/sap/ZOS_AC_CAPTURADOS_SRV/";
    params.sModel = "ACcapturadosModel";
    BaseModel.call(this, params);
}

ACcapturados.prototype = Object.create(BaseModel.prototype);
ACcapturados.prototype.constructor = ACcapturados;//Model ACcapturados

//Model Polizas Bolentin a venta
function Polizas() {
    var params = {};
    params.sUrl = "/sap/opu/odata/sap/ZOS_FI_DOCUMENTS_SRV/";
    params.sModel = "polizasModel";
    BaseModel.call(this, params);
}

Polizas.prototype = Object.create(BaseModel.prototype);
Polizas.prototype.constructor = Polizas;//Model Polizas

//Model acuerdos de escalas
function ACEscalas() {
    var params = {};
    params.sUrl = "/sap/opu/odata/sap/ZOSP_AC_ESCALA_SRV/";
    params.sModel = "ACEscalasModel";
    BaseModel.call(this, params);
}

ACEscalas.prototype = Object.create(BaseModel.prototype);
ACEscalas.prototype.constructor = ACEscalas;//Model ACEscalas

//MOdel REporte  Mejor Condicion 

//Model Acuerdos
function MejorCond() {
    var params = {};
    params.sUrl = "/sap/opu/odata/sap/ZOSP_MEJOR_COND_REP_SRV/";
    params.sModel = "mejorCondModel";
    BaseModel.call(this, params);
}

MejorCond.prototype = Object.create(BaseModel.prototype);
MejorCond.prototype.constructor = MejorCond;//Model Mejor Cond Model

//Model citas 1
function RemissionCancel() {
    var params = {};
    params.sUrl = "/sap/opu/odata/sap/ZOSP_AVISO_CANCEL_SRV/";
    params.sModel = "remissionCancelModel";
    BaseModel.call(this, params);
}

RemissionCancel.prototype = Object.create(BaseModel.prototype);
RemissionCancel.prototype.constructor = RemissionCancel;

//Model citas 1
function Citas1() {
    var params = {};
    params.sUrl = "/sap/opu/odata/sap/ZOSP_CITAS_VALIDA_SRV/";
    params.sModel = "citas1Model";
    BaseModel.call(this, params);
}

Citas1.prototype = Object.create(BaseModel.prototype);
Citas1.prototype.constructor = Citas1;

//Model citas 2
function Citas2() {
    var params = {};
    params.sUrl = "/sap/opu/odata/sap/ZOSP_CITAS_SRV/";
    params.sModel = "citas2Model";
    BaseModel.call(this, params);
}

Citas2.prototype = Object.create(BaseModel.prototype);
Citas2.prototype.constructor = Citas2;


//Model Catálogo de productos
function Productos() {
    var params = {};
    params.sUrl = "/sap/opu/odata/sap/ZOSP_CATPRO_SRV/";
    params.sModel = "productModel";
    BaseModel.call(this, params);
}

Productos.prototype = Object.create(BaseModel.prototype);
Productos.prototype.constructor = Productos;


//Model Catálogo de productos
function NotifAltaMasiva() {
    var params = {};
    params.sUrl = "/sap/opu/odata/sap/ZOSP_NOTIF_SRV/";
    params.sModel = "notifAltaModel";
    BaseModel.call(this, params);
}

NotifAltaMasiva.prototype = Object.create(BaseModel.prototype);
NotifAltaMasiva.prototype.constructor = NotifAltaMasiva;

//Model EDI
function ModelEDI() {
    var params = {};
    params.sUrl = "/sap/opu/odata/sap/ZSOP_EDI_OUTPUT_FILE_SRV/";
    params.sModel = "downEdiModel";
    BaseModel.call(this, params);
}

ModelEDI.prototype = Object.create(BaseModel.prototype);
ModelEDI.prototype.constructor = ModelEDI;

//Model Terms&Cons
function ModelTC() {
    var params = {};
    params.sUrl = "/sap/opu/odata/sap/ZOSP_TXT_TERM_COND_SRV/";
    params.sModel = "termconsModel";
    BaseModel.call(this, params);
}

ModelTC.prototype = Object.create(BaseModel.prototype);
ModelTC.prototype.constructor = ModelTC;

//Model Excel Pedidos
function ModelXlsPedidos() {
    var params = {};
    params.sUrl = "/sap/opu/odata/sap/ZSOP_PEDIDO_EXCEL_SRV/";
    params.sModel = "xlsPedidosModel";
    BaseModel.call(this, params);
}

ModelXlsPedidos.prototype = Object.create(BaseModel.prototype);
ModelXlsPedidos.prototype.constructor = ModelXlsPedidos;

//Servicios Carta Porte
function CartaPorte() {
    const host = window.location.host;
    const modulo = "/CartaPorteProxy/wscartaporte.asmx"
    if (host !== hostPro){
        url = endpointQASwebService + modulo //QAS
    } else {
        url = endpointPROwebService + modulo //PRO
    }
    var params = {};
    params.sUrl = url;
    params.sModel = "cartaPorte";
    BaseModel.call(this, params);
}

//Download/Upload Carta Porte
function FilesCartaPorte() {
    const host = window.location.host;
    const modulo = "/CartaPorteProxy/ReceiveCartaPorteFile.ashx"
    if (host !== hostPro){
        url = endpointQASwebService + modulo //QAS
    } else {
        url = endpointPROwebService + modulo //PRO
    }
    var params = {};
    params.sUrl = url;
    params.sModel = "cartaPorte";
    BaseModel.call(this, params);
}

//Model Catalogos para Dashboard nuevo
function CatalogosDashboard() {
    var params = {};
    params.sUrl = "/sap/opu/odata/sap/ZOSP_DB07_CATALOGOS_SRV/";
    params.sModel = "catDashboard";
    BaseModel.call(this, params);
}

CatalogosDashboard.prototype = Object.create(BaseModel.prototype);
CatalogosDashboard.prototype.constructor = CatalogosDashboard;

//Model Dashboard: Reporte general 
function ReporteGralDashboard() {
    var params = {};
    params.sUrl = "/sap/opu/odata/sap/ZOSP_DB01_EJECUTIVO_GRAL_ACLA_SRV";
    params.sModel = "dashboardRepGen";
    BaseModel.call(this, params);
}

ReporteGralDashboard.prototype = Object.create(BaseModel.prototype);
ReporteGralDashboard.prototype.constructor = ReporteGralDashboard;

//Model Dashboard: Reporte Grupo resolutor 
function ReporteGpoResolutor() {
    var params = {};
    params.sUrl = "/sap/opu/odata/sap/ZOSP_DB02_GRUPO_RESOLUTOR_SRV";
    params.sModel = "dashboardRepGpoRes";
    BaseModel.call(this, params);
}

ReporteGpoResolutor.prototype = Object.create(BaseModel.prototype);
ReporteGpoResolutor.prototype.constructor = ReporteGpoResolutor;

//Model Dashboard: Reporte Tiempo promedio de resolucion
function ReporteAvgTiempo() {
    var params = {};
    params.sUrl = "/sap/opu/odata/sap/ZOSP_DB03_TIEMPO_PROMEDIO_ACLA_SRV/";
    params.sModel = "dashboardRepAvgTime";
    BaseModel.call(this, params);
}

ReporteAvgTiempo.prototype = Object.create(BaseModel.prototype);
ReporteAvgTiempo.prototype.constructor = ReporteAvgTiempo;

//Model Dashboard: Reporte Ejecutivo comparativo
function ReporteExecComp() {
    var params = {};
    params.sUrl = "/sap/opu/odata/sap/ZOSP_DB04_EJEC_COMPARATIVO_MES_SRV/";
    params.sModel = "dashboardRepAvgTime";
    BaseModel.call(this, params);
}

ReporteExecComp.prototype = Object.create(BaseModel.prototype);
ReporteExecComp.prototype.constructor = ReporteExecComp;

//Model STIBO: Proveedores en STIBO
function STIBO() {
    const host = window.location.host;
    const modulo = "/webui/SupplierUI"
    if (host !== hostPro){
        url = endpointQASSTIBO + modulo + stiboQASModule//QAS
    } else {
        url = endpointPROwebService + modulo + stiboPROModule//PRO
    }
    var params = {};
    params.sUrl = url;
    params.sModel = "stibo";
    BaseModel.call(this, params);
}

//Model Dashboard: Reporte Ejecutivo comparativo
function ProveedorSTIBO() {
    var params = {};
    params.sUrl = "/sap/opu/odata/sap/ZOSP_PROVSTIBO_SRV/";
    params.sModel = "proveedorSTIBO";
    BaseModel.call(this, params);
}

ProveedorSTIBO.prototype = Object.create(BaseModel.prototype);
ProveedorSTIBO.prototype.constructor = ProveedorSTIBO;