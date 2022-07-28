sap.ui.define([
    //"jquery.sap.global",
    "sap/ui/export/library",
    "sap/ui/export/Spreadsheet",
    "sap/ui/core/Fragment",
    "demo/controllers/BaseController",
    "sap/m/UploadCollectionParameter",
    "sap/ui/core/mvc/Controller",
    "sap/m/PDFViewer",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "sap/ui/core/routing/Router",
    "demo/models/BaseModel",
    'sap/f/library',

], function (exportLibrary, Spreadsheet, Fragment, Controller, UploadCollectionParameter, History, PDFViewer, JSONModel, fioriLibrary) {
    "use strict";
    var EdmType = exportLibrary.EdmType;
    var tipoUpload;
    var regulaArchivos;
    var oModel = new this.ComplPagoModel();
    var cfdiModel = new this.CfdiModel();
    var that = "";
    var sUri = "/sap/opu/odata/sap/ZOSP_PYMNT_CMPL_SRV/";


    return Controller.extend("demo.controllers.ComplPago.Master", {
        onInit: function () {
            that = this;

            this.getView().addEventDelegate({
                onAfterShow: function (oEvent) {
                    //this.setDaterangeMaxMin();
                    //var barModel = this.getConfigModel();
                    //barModel.setProperty("/barVisible", true);
                    // this.clearFilters();
                    this.getConfigModel().setProperty("/updateFormatsSingle", "xml");
                    this.getOwnerComponent().setModel(new JSONModel(), "Documentos");

                }
            }, this);


        },
        onAfterRendering: function () {
            var Fecha = new Date();

            Fecha = (Fecha.getTime() - (1000 * 60 * 60 * 24 * 5))

            that.getView().byId("dateRange").setDateValue(new Date(Fecha));
            that.getView().byId("dateRange").setSecondDateValue(new Date());


            that.oModel = new JSONModel({
                column1:true,
                column2:false,
                column3:true,
                column4:true,
                column5:true,
                column6:true,
                column65:true,
                column7:true,
                column8:true,
                column9:true,
                column10:true,
                column11:true,


            })
            that.getView().setModel(that.oModel);
            that.TableVisible()
        },
        TableVisible: function () {


            that.getView().byId("column1").setVisible(that.getView().getModel().getProperty("/column1"));
            that.getView().byId("column2").setVisible(that.getView().getModel().getProperty("/column2"));
            that.getView().byId("column3").setVisible(that.getView().getModel().getProperty("/column3"));
          that.getView().byId("column4").setVisible(that.getView().getModel().getProperty("/column4"));
            that.getView().byId("column5").setVisible(that.getView().getModel().getProperty("/column5"));
            that.getView().byId("column6").setVisible(that.getView().getModel().getProperty("/column6"));
            that.getView().byId("column65").setVisible(that.getView().getModel().getProperty("/column65"));
            that.getView().byId("column7").setVisible(that.getView().getModel().getProperty("/column7"));
            that.getView().byId("column8").setVisible(that.getView().getModel().getProperty("/column8"));
            that.getView().byId("column9").setVisible(that.getView().getModel().getProperty("/column9"));
            that.getView().byId("column10").setVisible(that.getView().getModel().getProperty("/column10"));
            that.getView().byId("column11").setVisible(that.getView().getModel().getProperty("/column11"));














        },


        clearFilters: function () {
            this.getView().byId("dateRange").setValue('');
            this.getView().byId("documentTxt").setValue('');
        },
        searchData: function () {

            if (!this.hasAccess(9)) {
                return
            }
            if(that.getView().byId("dateRange").getValue()===""){
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty('/pay.msgPopErrSe'));
                return false;
            }

            let documentTxt = this.getView().byId("documentTxt");

            let proveedor_LIFNR = this.getConfigModel().getProperty("/supplierInputKey");

            if (proveedor_LIFNR == null || proveedor_LIFNR == "") {
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/helpDocs.uploader.noProvider"));
                return;
            }



            var auxFilters = [];



            var FechaI = that.getView().byId("dateRange").getDateValue();
            var FechaF = that.getView().byId("dateRange").getSecondDateValue();
            let dateRange = this.getView().byId("dateRange");

            auxFilters.push(new sap.ui.model.Filter({
                path: "IStartdate",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: this.buildSapDate(dateRange.getDateValue())
               // value1: FechaI.toISOString().slice(0, 10) + 'T00:00:00',

            })

            )

            auxFilters.push(new sap.ui.model.Filter({
                path: "IEnddate",
                operator: sap.ui.model.FilterOperator.EQ,
              value1:this.buildSapDate(dateRange.getSecondDateValue())
            //    value1: FechaF.toISOString().slice(0, 10) + 'T00:00:00'
            })

            )
            auxFilters.push(new sap.ui.model.Filter({
                path: "ILifnr",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: proveedor_LIFNR
            })

            )
            auxFilters.push(new sap.ui.model.Filter({
                path: "IOption",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: '2'
            })

            )

            if (this.getView().byId("documentTxt").getValue() !== "") {




                auxFilters.push(new sap.ui.model.Filter({
                    path: 'IAugbl',
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: this.getView().byId("documentTxt").getValue()
                })
                )
            }


            var model = "ZOSP_PYMNT_CMPL_SRV";
            var entity = "HeaderPYMNTCSet";
            var expand = ['EPYMNTDOCSNAV', 'EPYMNTPRGRMNAV'];
            var filter = auxFilters;
            var select = "";

            sap.ui.core.BusyIndicator.show();
            that._GEToDataV2(model, entity, filter, expand, select).then(function (_GEToDataV2Response) {
                sap.ui.core.BusyIndicator.hide();
                var arrT=[];
                var data = _GEToDataV2Response.data.results;
               console.log(data)
             for(var x =0;x<data.length;x++){

                   if (!(data[x].IAugbl.startsWith('58') )&&!(data[x].IAugbl.startsWith('59')) ){
                    arrT.push(data[x])
             }
            }

            if(arrT.length>0){
                var Documentos = { Detalles: { results: [...arrT[0].EPYMNTDOCSNAV.results] } };


                that.getOwnerComponent().setModel(new JSONModel(Documentos), "Documentos");

                that.paginate("Documentos", "/Detalles", 1, 0);
            }


            });



        },

        generateFile: function (oEvent) {
            let posicion = oEvent.getSource().getBindingContext("Documentos").getPath().split("/").pop();
            let results = this.getOwnerComponent().getModel("Documentos").getProperty("/Detalles/Paginated/results");

            let registro = results[posicion];
           var Datos;
          for(var x=0;x<10;x++){
           

         
          //  Fecha = (Fecha.getTime() - (1000 * 60 * 60 * 24 * 5))
            let LaufdT = String(new Date(new Date(registro.Augdt+ 'T00:00:00').getTime() - (1000 * 60 * 60 * 24 * x)))
           // let LaufdT2 = String(new Date(new Date(registro.Augdt+ 'T00:00:00').getTime() + (1000 * 60 * 60 * 24 * 10)))
  
            let Laufd = new Date(LaufdT).toISOString().slice(0,10).replace(/-/g, "");
          //  let Laufd2 = new Date(LaufdT2).toISOString().slice(0,10).replace(/-/g, "");
            let Augdt=String(registro.Augdt).replace(/-/g, "");
            let url = `HeaderPYMNTCSet?$expand=ETXTHDRNAV,ETXTTOTALNAV,ETXTTAXNAV,ETXTFACTPROVNAV,ETXTFACTSORNAV,ETXTDISCOUNTNAV,ETXTAGREEMENTNAV&$filter= IOption eq '3' and 
            ILaufd ge '${Laufd}' and
            
            ILaufi eq '${registro.Laufi}' and 
            IBukrs eq '${registro.Bukrs}' and 
            ILifnr eq '${registro.Lifnr}' and 
            IGjahr eq '${registro.Gjahr}' and 
            IVblnr eq '${registro.Vblnr}' and 
            IAugdt eq '${Augdt}'&$format=json`;

         

            let oODataJSONModel = this.getOdata(sUri);

            let oDataJSONModel = this.getOdataJsonModel(url, oODataJSONModel);
            let dataJSON = oDataJSONModel.getJSON();


            let Datos2 = JSON.parse(dataJSON);
          
        
            if(Datos2.results[0].ETXTFACTPROVNAV.results.length!==0){
                x=100;
                Datos=Datos2;
            
            }

        }

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
        formatAvailableToIcon: function (bAvailable) {

            switch (bAvailable) {
                case 'X':
                    return "sap-icon://message-error";
                    break;
                    case 'Y':
                    return "sap-icon://message-success";
                    break;
                default:
                    return "sap-icon://less";
                    break;

            }
            return bAvailable ? "sap-icon://accept" : "sap-icon://decline";
        },
        formatStatusIcon: function (bAvailable) {

            switch (bAvailable) {
                case 'Y':
                    return "#008000";
                    break;
                    case 'X':
                        return "#FF0000";
                        break;
                default:
                    return "";
                    break;

            }

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
            var vLifnr = this.getConfigModel().getProperty("/supplierInputKey");
            if (!this.hasAccess(10)) {
                return
            }
            if (vLifnr !== undefined && vLifnr !== null){
                if (!this._uploadDialog2) {
                    this._uploadDialog2 = sap.ui.xmlfragment("uploadInvoice", "demo.fragments.UploadInvoice", this);
                    this.getView().addDependent(this._uploadDialog2);
                }
                this._uploadDialog2.open();
            } else {
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/clarifications.noSupplier"));
            }
        },
        openUploadDialog2: function () {
            var vLifnr = this.getConfigModel().getProperty("/supplierInputKey");
            if (!this.hasAccess(10)) {
                return
            }
            if (vLifnr !== undefined && vLifnr !== null){
                if (!this._uploadDialog3) {
                    this._uploadDialog3 = sap.ui.xmlfragment("uploadInvoiceTest", "demo.fragments.UploadInvoice2", this);
                    this.getView().addDependent(this._uploadDialog3);
                }
                this._uploadDialog3.open();
            } else {
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/clarifications.noSupplier"));
            }
        },
        onCloseDialogUpload2: function () {
            if (this._uploadDialog3) {
                this._uploadDialog3.destroy();
                this._uploadDialog3 = null;
            }
        },
        onCloseDialogUpload: function () {
            if (this._uploadDialog2) {
                this._uploadDialog2.destroy();
                this._uploadDialog2 = null;
            }
        },
        documentUploadPress2: function(){
            var that = this;
           var vLifnr = this.getConfigModel().getProperty("/supplierInputKey");
           var oFileUploader = sap.ui.core.Fragment.byId("uploadInvoiceTest", "fileUploaderTest");
           sap.ui.core.BusyIndicator.show(0);

           if (!oFileUploader.getValue()) {
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/helpDocs.uploader.nodata"));
                sap.ui.core.BusyIndicator.hide();
                return;
            }

            var file = oFileUploader.oFileUpload.files[0];
            var reader2 = new FileReader();

            reader2.onload = function (evn) {
                var strXML = evn.target.result;

                var body = '<?xml version="1.0" encoding="utf-8"?>' +
                    '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" ' +
                    'xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><RecibeCFDPortal xmlns="http://tempuri.org/">' +
                    '<XMLCFD><![CDATA[' + strXML + ']]></XMLCFD><proveedor>' + vLifnr + '</proveedor>' +
                    '</RecibeCFDPortal></soap:Body></soap:Envelope>';

                $.ajax({
                    async: true,
                    url: "https://servicioswebsorianaqa.soriana.com/RecibeCFD/wseDocReciboPortal.asmx",
                    method: "POST",
                    headers: {
                        "Content-Type": "text/xml",
                        "Access-Control-Allow-Origin": "*"
                    },
                    data: body,
                    success: function(response) {
                        sap.ui.core.BusyIndicator.hide();
                        that.onCloseDialogUpload2();
                        oFileUploader.clear();
                        var oXMLModel = new sap.ui.model.xml.XMLModel();
                        oXMLModel.setXML(response.getElementsByTagName("RecibeCFDPortalResult")[0].textContent);
                        var oXml = oXMLModel.getData();
                        var status = oXml.getElementsByTagName("AckErrorApplication")[0].attributes[5].nodeValue;
                        if (status == "ACCEPTED") {
                            sap.m.MessageBox.success(that.getOwnerComponent().getModel("appTxts").getProperty("/sendInv.SendSuccess"));
                        } else {
                            var strError = oXml.getElementsByTagName("errorDescription")[0].firstChild.textContent;
                            strError = strError.replaceAll(";","\n\n");
                            sap.m.MessageBox.error(strError);
                        }
                    },
                    error: function(request, status, err) {
                        sap.ui.core.BusyIndicator.hide();
                        that.onCloseDialogUpload2();
                        oFileUploader.clear();
                        sap.m.MessageBox.error(that.getOwnerComponent().getModel("appTxts").getProperty("/sendInv.SendError"));
                    }
                });
            };
            reader2.readAsText(file);
        },
        onParentClicked: function (oEvent) {
            var bSelected = oEvent.getParameter("selected");
            this.oModel.setData({
                column1:bSelected,
                column2:bSelected,
                column3:bSelected,
                column4:bSelected,
                column5:bSelected,
                column6:bSelected,
                column65:bSelected,
                column7:bSelected,
                column8:bSelected,
                column9:bSelected,
                column10:bSelected,
                column11:bSelected,
            });
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
        },
        onDocumentPress: function (oEvent) {

            let posicion = oEvent.getSource().getBindingContext("Documentos").getPath().split("/").pop();
            let results = this.getOwnerComponent().getModel("Documentos").getProperty("/Detalles/Paginated/results");

            let registro = results[posicion];


            this.getOwnerComponent().getRouter().navTo("detailComplPagos",
                {
                    layout: sap.f.LayoutType.TwoColumnsMidExpanded,
                    document: registro.Vblnr,
                    sociedad: registro.Bukrs,
                    ejercicio: registro.Gjahr,
                    fecha: registro.Augdt
                    // lifnr: docResult.Lifnr
                }, true);



        },

        ///JP 05/07


        createColumnConfig: function () {

            var oModel = that.getView().getModel("Documentos").getData().Detalles.Paginated.results,
                aCols = [];

            var texts = this.getOwnerComponent().getModel("appTxts");

            aCols.push({
                label: texts.getProperty("/pay.headerCompanyUPC"),
                type: EdmType.String,
                property: 'Butxt'
            });


            aCols.push({
                label: texts.getProperty("/pay.headerPaymentTypeUPC"),
                type: EdmType.String,
                property: 'Text2'
            });


            aCols.push({
                label: texts.getProperty("/pay.headerDocumentUPC"),
                type: EdmType.String,
                property: 'Vblnr'
            });




            aCols.push({
                label: texts.getProperty("/pay.headerLimitDateUPC"),
                type: EdmType.String,
                property: 'Laufd'
            });



            aCols.push({
                label: texts.getProperty("/pay.headerAmountUPC"),
                type: EdmType.String,
                property: 'Rbetr'
            });

            aCols.push({
                label: texts.getProperty("/pay.headerNCMC"),
                type: EdmType.String,
                property: 'Nc_mc'


            });

            aCols.push({
                label: texts.getProperty("/pay.headerNC"),
                type: EdmType.String,
                property: 'Nc'


            });

            aCols.push({
                label: texts.getProperty("/pay.headerCP") + ' 03',
                type: EdmType.String,
                property: 'Cp03'
            });
            //****
            aCols.push({
                label: texts.getProperty("/pay.headerCP") + ' 17S',
                type: EdmType.String,
                property: 'Cp17s'
            });
            aCols.push({
                label: texts.getProperty("/pay.headerCP") + ' 17R',
                type: EdmType.String,
                property: 'Cp17r'
            });
            aCols.push({
                label: texts.getProperty("/pay.headerEstatusUPC"),
                type: EdmType.String,
                property: 'Rzawe'
            });



            return aCols;
        },
        //exporta excel
        buildExportTable: function () {
            var aCols, oRowBinding, oSettings, oSheet, oTable, that = this;

            if (!that._oTable) {
                that._oTable = this.byId('complPagoList');
            }

            oTable = that._oTable;

            oRowBinding = oTable.getBinding().oList;

            aCols = that.createColumnConfig();

            oSettings = {
                workbook: {
                    columns: aCols,
                    hierarchyLevel: 'Level'
                },
                dataSource: oRowBinding,
                fileName: 'Complemento de Pago ',
                worker: false // We need to disable worker because we are using a MockServer as OData Service
            };

            oSheet = new Spreadsheet(oSettings);
            oSheet.build().finally(function () {
                oSheet.destroy();
            });
        },

        generateFileMasivo: function (oEvent) {
            if(this.byId("complPagoList").getSelectedIndices().length<1){
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty('/pay.Message'));
                return
            }
           // var posicion = oEvent.getSource().getBindingContext("Documentos").getPath().split("/").pop();
            var results = this.getOwnerComponent().getModel("Documentos").getProperty("/Detalles/Paginated/results");
            var registro = results;

            var aIndices = this.byId("complPagoList").getSelectedIndices();

            for(var x =0;x<aIndices.length;x++){


            var Laufd = String(registro[aIndices[x]].Laufd).replace(/-/g, "");
            var Augdt = String(registro[aIndices[x]].Augdt).replace(/-/g, "");

var auxFilters=[];
            auxFilters.push(new sap.ui.model.Filter({
                path: "IOption",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: '3'
            })
            )

            auxFilters.push(new sap.ui.model.Filter({
                path: "ILaufd",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: Laufd
            })
            )

            auxFilters.push(new sap.ui.model.Filter({
                path: 'ILaufi',
                operator: sap.ui.model.FilterOperator.EQ,
                value1: registro[aIndices[x]].Laufi
            })
            )
            auxFilters.push(new sap.ui.model.Filter({
                path: 'IBukrs',
                operator: sap.ui.model.FilterOperator.EQ,
                value1: registro[aIndices[x]].Bukrs
            })
            )

            auxFilters.push(new sap.ui.model.Filter({
                path: 'ILifnr',
                operator: sap.ui.model.FilterOperator.EQ,
                value1: registro[aIndices[x]].Lifnr
            })
            )

            auxFilters.push(new sap.ui.model.Filter({
                path: 'IGjahr',
                operator: sap.ui.model.FilterOperator.EQ,
                value1: registro[aIndices[x]].Gjahr
            })
            )

            auxFilters.push(new sap.ui.model.Filter({
                path: 'IVblnr',
                operator: sap.ui.model.FilterOperator.EQ,
                value1: registro[aIndices[x]].Vblnr
            })
            )

            auxFilters.push(new sap.ui.model.Filter({
                path: 'IAugdt',
                operator: sap.ui.model.FilterOperator.EQ,
                value1: Augdt
            })
            )



            var model = "ZOSP_PYMNT_CMPL_SRV";
            var entity = "HeaderPYMNTCSet";
            var expand = ["ETXTHDRNAV", "ETXTTOTALNAV", "ETXTTAXNAV", "ETXTFACTPROVNAV", "ETXTFACTSORNAV", "ETXTDISCOUNTNAV", "ETXTAGREEMENTNAV"];
            var filter = auxFilters;
            var select = "";

            sap.ui.core.BusyIndicator.show();
         that._GEToDataV2(model, entity, filter, expand, select).then(function (_GEToDataV2Response) {
                sap.ui.core.BusyIndicator.hide();
                var Datos = _GEToDataV2Response.data;


            var Encabezado = Object.values(Datos.results[0].ETXTHDRNAV.results[0]).slice(1).join('\t');
            var Totales = Datos.results[0].ETXTTOTALNAV.results;
            var Impuestos = Datos.results[0].ETXTTAXNAV.results;
            var FacturasProveedor = Datos.results[0].ETXTFACTPROVNAV.results;
            var FacturasSoriana = Datos.results[0].ETXTFACTSORNAV.results;
            var Descuentos = Datos.results[0].ETXTDISCOUNTNAV.results;
            var Agreement = Datos.results[0].ETXTAGREEMENTNAV.results;


            var aArchivo = [
                Encabezado
            ];

            aArchivo = aArchivo.concat(that.generaRenglonesArchivo(Totales));
            aArchivo = aArchivo.concat(that.generaRenglonesArchivo(Impuestos))
            aArchivo = aArchivo.concat(that.generaRenglonesArchivo(FacturasProveedor))
            aArchivo = aArchivo.concat(that.generaRenglonesArchivo(FacturasSoriana))
            aArchivo = aArchivo.concat(that.generaRenglonesArchivo(Descuentos))
            aArchivo = aArchivo.concat(that.generaRenglonesArchivo(Agreement))



            var ContenidoArchivo = aArchivo.join("\n");


            var nombreArchivo = String(Datos.results[0].IBukrs + "_" + Datos.results[0].IGjahr + "_" + Datos.results[0].IVblnr + " -Comp Pago");

            //this.exportxls('Archivo', '/Detalles/results', columns, typeExport);

            sap.ui.core.util.File.save(ContenidoArchivo, nombreArchivo, "txt", "text/plain", "utf-8", false);

            });


        }


        },
        ConfigTable: function () {
            var that = this;
            var oDialog = that.getView().byId("dinamicTableCP");

            // create dialog lazily
            if (!oDialog) {
                // create dialog via fragment factory
                oDialog = sap.ui.xmlfragment(that.getView().getId(), "demo.views.ComplPago.fragment.optionCP", this);
                that.getView().addDependent(oDialog);
                that.getView().byId("dinamicTableCP").addStyleClass(that.getOwnerComponent().getContentDensityClass());

            }

            oDialog.open();
        },
        ClosepopUp: function () {
            var that = this;
            that.TableVisible();
            that.getView().byId("dinamicTableCP").close();
        },






    });
});
