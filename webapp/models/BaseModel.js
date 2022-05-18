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

BaseModel.prototype.getJsonModelAsync = function (string, successFunction, errorFunction, parent) {
    if (!this.getModel()) {
        this.initModel();
    }

    this.getModel().read(string,
        {
            async: true,
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

//Model paraaviso anticipado
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