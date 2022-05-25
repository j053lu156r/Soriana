sap.ui.define([
    //"jquery.sap.global",
    "sap/ui/core/Fragment",
    "demo/controllers/BaseController",
    "sap/m/UploadCollectionParameter",
    "sap/ui/core/mvc/Controller",
    "sap/m/PDFViewer",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "sap/ui/core/routing/Router",
    "demo/models/BaseModel",
    'sap/f/library'
], function (Fragment, Controller, UploadCollectionParameter, History, PDFViewer, JSONModel, fioriLibrary) {
    "use strict";

    var tipoUpload;
    var regulaArchivos;
    var oModel = new this.ComplPagoModel();
    var cfdiModel = new this.CfdiModel();

    var sUri = "/sap/opu/odata/sap/ZOSP_PYMNT_CMPL_SRV/";


    return Controller.extend("demo.controllers.ComplPago.Master", {
        onInit: function () {
            this.getView().addEventDelegate({
                onAfterShow: function (oEvent) {
                    //this.setDaterangeMaxMin();
                    //var barModel = this.getConfigModel();
                    //barModel.setProperty("/barVisible", true);
                    this.clearFilters();
                    this.getConfigModel().setProperty("/updateFormatsSingle", "xml");
                    this.getOwnerComponent().setModel(new JSONModel(), "Documentos");
                    
                }
            }, this);
        },
        clearFilters: function(){
            this.getView().byId("dateRange").setValue('');
            this.getView().byId("documentTxt").setValue('');
        },
        searchData: function () {
            if(!this.hasAccess(9)){
                return
            }
            //if ( !oModel.getModel() )  oModel.initModel();

            
                let dateRange = this.getView().byId("dateRange");
                let documentTxt = this.getView().byId("documentTxt");

                let proveedor_LIFNR = this.getConfigModel().getProperty("/supplierInputKey");

                if (proveedor_LIFNR == null || proveedor_LIFNR == "") {
                    sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/helpDocs.uploader.noProvider"));
                    return;
                }
                //let proveedor_LIFNR = "96008";
                // format[AAAAMMDD] (2020101)
                let IStartdate = this.buildSapDate(dateRange.getDateValue());
                //let IStartdate = "01012020";
                // format[AAAAMMDD] (2020101)
                let IEnddate = this.buildSapDate(dateRange.getSecondDateValue());
                //let IEnddate = "31122020";
                let IAugbl = documentTxt.getValue();

                let filtros = `$filter= IOption eq '2' and  ILifnr eq '${proveedor_LIFNR}' and IStartdate eq '${IStartdate}'  and IEnddate eq '${IEnddate}'`;


                if (IAugbl != '') filtros += ` and IAugbl eq '${IAugbl}'`;


                let url = `HeaderPYMNTCSet?$expand=EPYMNTDOCSNAV,EPYMNTPRGRMNAV&${filtros}&$format=json`;

                let oODataJSONModel = this.getOdata(sUri);

                let oDataJSONModel = this.getOdataJsonModel(url, oODataJSONModel);
                let dataJSON = oDataJSONModel.getJSON();
                let Datos = JSON.parse(dataJSON);

                var Documentos = { Detalles: { results: [...Datos.results[0].EPYMNTDOCSNAV.results] } };
            


            this.getOwnerComponent().setModel(new JSONModel(Documentos), "Documentos");

            this.paginate("Documentos", "/Detalles", 1, 0);
        },
        generateFile: function (oEvent) {
            let posicion = oEvent.getSource().getBindingContext("Documentos").getPath().split("/").pop();
            let results = this.getOwnerComponent().getModel("Documentos").getProperty("/Detalles/Paginated/results");

            let registro = results[posicion];
            let Laufd = String(registro.Laufd).replace(/-/g, "");
            let Augdt = String(registro.Augdt).replace(/-/g, "");

            let url = `HeaderPYMNTCSet?$expand=ETXTHDRNAV,ETXTTOTALNAV,ETXTTAXNAV,ETXTFACTPROVNAV,ETXTFACTSORNAV,ETXTDISCOUNTNAV,ETXTAGREEMENTNAV&$filter= IOption eq '3' and 
            ILaufd eq '${Laufd}' and 
            ILaufi eq '${registro.Laufi}' and 
            IBukrs eq '${registro.Bukrs}' and 
            ILifnr eq '${registro.Lifnr}' and 
            IGjahr eq '${registro.Gjahr}' and 
            IVblnr eq '${registro.Vblnr}' and 
            IAugdt eq '${Augdt}'&$format=json`;

            /*let url = `HeaderPYMNTCSet?$expand=ETXTHDRNAV,ETXTTOTALNAV,ETXTTAXNAV,ETXTFACTPROVNAV,ETXTFACTSORNAV,ETXTDISCOUNTNAV,ETXTAGREEMENTNAV&$filter= IOption eq '3' and 
            ILaufd eq '20200429' and 
            ILaufi eq 'PPDL' and 
            IBukrs eq '2001' and 
            ILifnr eq '96008' and 
            IGjahr eq '2020' and 
            IVblnr eq '1500001807' and 
            IAugdt eq '20200429'&$format=json`;*/

            let oODataJSONModel = this.getOdata(sUri);

            let oDataJSONModel = this.getOdataJsonModel(url, oODataJSONModel);
            let dataJSON = oDataJSONModel.getJSON();
            let Datos = JSON.parse(dataJSON);



            let Encabezado = Object.values(Datos.results[0].ETXTHDRNAV.results[0]).slice(1).join('\t');
            let Totales = Datos.results[0].ETXTTOTALNAV.results;
            let Impuestos = Datos.results[0].ETXTTAXNAV.results;
            let FacturasProveedor = Datos.results[0].ETXTFACTPROVNAV.results;
            let FacturasSoriana = Datos.results[0].ETXTFACTSORNAV.results;
            let Descuentos = Datos.results[0].ETXTDISCOUNTNAV.results;
            let Agreement = Datos.results[0].ETXTAGREEMENTNAV.results;


            let aArchivo = [
                Encabezado
            ];

            aArchivo = aArchivo.concat(this.generaRenglonesArchivo(Totales));
            aArchivo = aArchivo.concat(this.generaRenglonesArchivo(Impuestos))
            aArchivo = aArchivo.concat(this.generaRenglonesArchivo(FacturasProveedor))
            aArchivo = aArchivo.concat(this.generaRenglonesArchivo(FacturasSoriana))
            aArchivo = aArchivo.concat(this.generaRenglonesArchivo(Descuentos))
            aArchivo = aArchivo.concat(this.generaRenglonesArchivo(Agreement))



            let ContenidoArchivo = aArchivo.join("\n");

            let nombreArchivo = String(registro.Bukrs + "_" + registro.Gjahr + "_" + registro.Vblnr + " -Comp Pago");

            //this.exportxls('Archivo', '/Detalles/results', columns, typeExport);

            sap.ui.core.util.File.save(ContenidoArchivo, nombreArchivo, "txt", "text/plain", "utf-8", false);
        },
        generaRenglonesArchivo: function (Array) {

            let renglones = [];

            for (let i = 0; i < Array.length; i++)
                renglones.push(Object.values(Array[i]).slice(1).join('\t'));

            return renglones;
        },
        buildExportTable: function () {
            var texts = this.getOwnerComponent().getModel("appTxts");

            var columns = [
                {
                    name: texts.getProperty("/pay.headerCompanyUPC"),
                    template: {
                        content: "{Butxt}"
                    }
                },
                {
                    name: texts.getProperty("/pay.headerPaymentTypeUPC"),
                    template: {
                        content: "{Text2}"
                    }
                },
                {
                    name: texts.getProperty("/pay.headerDocumentUPC"),
                    template: {
                        content: "{Vblnr}"
                    }
                },
                {
                    name: texts.getProperty("/pay.headerLimitDateUPC"),
                    template: {
                        content: "{Laufd}"
                    }
                },
                {
                    name: texts.getProperty("/pay.headerAmountUPC"),
                    template: {
                        content: "{Rbetr}"
                    }
                },
                {
                    name: texts.getProperty("/pay.headerNC"),
                    template: {
                        content: "{Nc}"
                    }
                },
                {
                    name: texts.getProperty("/pay.headerCP") + ' 03',
                    template: {
                        content: "{Cp03}"
                    }
                },
                {
                    name: texts.getProperty("/pay.headerCP") + ' 17S',
                    template: {
                        content: "{Cp17s}"
                    }
                },
                {
                    name: texts.getProperty("/pay.headerCP") + ' 17R',
                    template: {
                        content: "{Cp17r}"
                    }
                },
                {
                    name: texts.getProperty("/pay.headerEstatusUPC"),
                    template: {
                        content: "{Rzawe}"
                    }
                }
            ];

            this.exportxls('Documentos', '/Detalles/results', columns);
        },
        onExit: function () {
            if (this._oDialog) {
                this._oDialog.destroy();
                this._oDialog = null;
            }

            if (this._uploadDialog1) {
                this._uploadDialog1.destroy();
                this._uploadDialog1 = null;
            }

            if (this._uploadDialog2) {
                this._uploadDialog2.destroy();
                this._uploadDialog2 = null;
            }

            if (this._oPopover) {
                this._oPopover.destroy();
                this._oPopover = null;
            }
        },
        openUploadDialog: function () {
            if(!this.hasAccess(10)){
                return
            }
            if (!this._uploadDialog2) {
                this._uploadDialog2 = sap.ui.xmlfragment("uploadInvoice", "demo.fragments.UploadInvoice", this);
                this.getView().addDependent(this._uploadDialog2);
            }
            this._uploadDialog2.open();
        },
        onCloseDialogUpload: function () {
            if (this._uploadDialog2) {
                this._uploadDialog2.destroy();
                this._uploadDialog2 = null;
            }
        },
        documentUploadPress: function () {
            var oFileUploader = sap.ui.core.Fragment.byId("uploadInvoice", "fileUploader");
            var uploadList = sap.ui.core.Fragment.byId("uploadInvoice", "logUploadList");
            var uploadBox = sap.ui.core.Fragment.byId("uploadInvoice", "uploadBox");
            var vLifnr = this.getConfigModel().getProperty("/supplierInputKey");

            if (!oFileUploader.getValue()) {
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/helpDocs.uploader.nodata"));
                return;
            }

            var objRequest = {
                "Lifnr": vLifnr,
                "Type": "P",
                "Log": [{ "Uuid": "", "Description": "", "Sts": "" }]
            };

            var docMatList = this.byId("complPagoList").getSelectedIndices();

            if (docMatList.length > 0) {
                var docMat = this.byId("complPagoList").getContextByIndex(docMatList[0]).getObject();
                objRequest.Vblnr = docMat.Vblnr;
                objRequest.Year = docMat.Gjahr;
            }

            var file = oFileUploader.oFileUpload.files[0];

            var reader = new FileReader();
            reader.onload = function (evn) {
                var obj = {};
                var parts = evn.target.result.split(",");
                obj.Cfdii = parts[1];
                objRequest.Cfdi = parts[1];

                var response = cfdiModel.create("/ECfdiSet ", objRequest);

                if (response != null) {
                    uploadBox.setVisible(false);
                    if (response.Log != null) {
                        uploadList.setVisible(true);
                        uploadList.setModel(new JSONModel(response));
                    } else {
                        sap.m.MessageBox.error(response.EMessage);
                    }
                }
                oFileUploader.clear();
            };
            reader.readAsDataURL(file);
        },
        delFact: function (oEvent) {
            sap.ui.getCore().setModel(null, "deliverTable");
            var uploadCollection = sap.ui.core.Fragment.byId(tipoUpload, "UploadCollection");
            var factList = sap.ui.core.Fragment.byId(tipoUpload, "factList");
            var closeDialog = sap.ui.core.Fragment.byId(tipoUpload, "closeDialog");
            uploadCollection.setVisible(true);
            factList.setVisible(false);
            closeDialog.setVisible(true);

            if (tipoUpload === "A") {
                sap.ui.getCore().getControl(tipoUpload + "--enviarDialog").setVisible(true);
                sap.ui.getCore().getControl(tipoUpload + "--tContacto").setVisible(true);
                sap.ui.getCore().getControl(tipoUpload + "--idCto").setVisible(true);
                sap.ui.getCore().getControl(tipoUpload + "--persCto").setVisible(true);
                sap.ui.getCore().getControl(tipoUpload + "--cmntAnexo").setVisible(true);

                if (regulaArchivos === false) {
                    var oUploadCollection = sap.ui.core.Fragment.byId(tipoUpload, "UploadCollection");
                    oUploadCollection.removeItem(oUploadCollection.getItems()[0]);
                }
            } else {
                sap.ui.core.Fragment.byId(tipoUpload, "UploadCollection").setBusy(false);
            }

            this.getOwnerComponent().setModel(null, "deliverTable");
        },
        sendFact: function (oEvent) {
            var bindingButton = oEvent.getSource().getBindingContext("deliverTable");
            var complPagoList = this.byId("complPagoList").getSelectedItems();
            var oObject = {};
            oObject.xml = bindingButton.getProperty("/xml");
            oObject.pdf = bindingButton.getProperty("/pdf");

            complPagoList.forEach(function (element) {
                var document = element.getBindingContext("coomplPagoTable").getObject().Belnr;
                var year = element.getBindingContext("coomplPagoTable").getObject().Gjahr;
                var soc = element.getBindingContext("coomplPagoTable").getObject().Bukrs;
                var pago = soc + document + year;
                if (!oObject.pagos) {
                    oObject.pagos = pago;
                } else {
                    oObject.pagos = oObject.pagos + "," + pago;
                }
            });

            var oSuccess = oModel.verify.sendCfdi("/VerificarXmlSet", oObject);

            if (oSuccess) {
                if (oSuccess.correcto) {
                    sap.m.MessageBox.success(oSuccess.mensaje);
                    this.successVerify();
                } else {
                    var that = this;
                    sap.m.MessageBox.error(oSuccess.mensaje, {
                        actions: ["Cargar otra factura"],
                        styleClass: "sapUiSizeCompact",
                        onClose: function (sAction) {
                            if (sAction === "Enviar con desviación") {
                                //Colocar aqui la funcion para enviar con desviación
                                oObject.preliminar = "X";
                                var preliminarOdata = oModel.verify.sendCfdi("/VerificarXmlSet", oObject);
                                if (preliminarOdata) {
                                    if (preliminarOdata.correcto) {
                                        sap.m.MessageBox.success(preliminarOdata.mensaje);
                                        that.successVerify();
                                    } else {
                                        sap.m.MessageBox.error(preliminarOdata.mensaje);
                                        that.delFact();
                                    }
                                }
                            } else {
                                that.delFact();
                            }
                        }
                    }, this);
                }
            }
        },
        successVerify: function () {
            this.delFact(null);
            this.searchData();
            this.onCloseDialogUpload();
        },
        onFileSizeExceed: function () {
            sap.m.MessageBox.warning(this.getOwnerComponent().getModel('appTxts').getProperty("/payCon.size"));
        },
        onFilenameLengthExceed: function () {
            sap.m.MessageBox.warning(this.getOwnerComponent().getModel('appTxts').getProperty("/payCon.name"));
        },
        filtrado: function (evt) {
            var filterCustomer = [];
            var query = evt.getParameter("query");
            var obFiltro = this.getView().byId("selectFilter");
            var opFiltro = obFiltro.getSelectedKey();
            if (query && query.length > 0) {
                var filter = new sap.ui.model.Filter(opFiltro, sap.ui.model.FilterOperator.Contains, query);
                filterCustomer.push(filter);
            }

            var list = this.getView().byId("complPagoList");
            var binding = list.getBinding("items");
            binding.filter(filterCustomer);
        },
        setDaterangeMaxMin: function () {
            var datarange = this.getView().byId('dateRange');
            var date = new Date();
            var minDate = new Date();
            var minConsultDate = new Date();
            minConsultDate.setDate(date.getDate() - 7);
            minDate.setDate(date.getDate() - 30);
            datarange.setSecondDateValue(date);
            datarange.setDateValue(minConsultDate);
        }
    });
});