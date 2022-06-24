sap.ui.define([
    "jquery.sap.global",
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
], function (jQuery, Fragment, Controller, UploadCollectionParameter, History, PDFViewer, JSONModel, fioriLibrary) {
    "use strict";

    var tipoUpload = "";
    var oModel = new this.EnvioCfdi();
    var cfdiModel = new this.CfdiModel();

    return Controller.extend("demo.controllers.Detail.Master", {
        onInit: function () {
            this._pdfViewer = new PDFViewer();
            this.getView().addDependent(this._pdfViewer);

            this.oRouter = this.getOwnerComponent().getRouter();
            this.getView().addEventDelegate({
                onAfterShow: function (oEvent) {
                    var barModel = this.getConfigModel();
                    barModel.setProperty("/barVisible", true);
                    this.getView().byId("dateRange").setValue("");
                    this.getView().byId("folio").setValue("");
    //                this.getView().byId("client").setValue("");
                    this.getOwnerComponent().setModel(new JSONModel(),
                    "tableItemsCfdi");

                    this.getConfigModel().setProperty("/updateFormatsSingle", "xml");
                }
            }, this);
        },
        searchData: function () {
            if (!this.hasAccess(2)) {
                return false;
            }
            var bContinue = false;
            if (!oModel.getModel()) {
                oModel.initModel();
            }

            var formater = sap.ui.core.format.DateFormat.getDateTimeInstance({ parent: "yyyyMMdd" });
            var dateRange = this.getView().byId("dateRange");

            var startDate = this.buildSapDate(dateRange.getDateValue());
            var endDate = this.buildSapDate(dateRange.getSecondDateValue());
            var vLifnr = this.getConfigModel().getProperty("/supplierInputKey");
            var vXblnr = this.getView().byId("folio").getValue();
   //         var vWerks = this.getView().byId("client").getSelectedKey();

            if (vLifnr != null && vLifnr != "") {
                bContinue = true;
            } else {
                sap.m.MessageBox.error("El campo proveedor es obligatorio.");
            }

            if (bContinue) {
                if (vXblnr == "") {
                    if (startDate != "" && endDate != "") {
                        bContinue = true;
                    } else {
                        bContinue = false;
                        sap.m.MessageBox.error("Debe ingresar al menos un criterio de busqueda.");
                    }
                } else {
                    bContinue = true;
                }
            }

            if (bContinue) {
                var url = "/HeaderCFDISet?$expand=EMTDCNAV&$filter=IOption eq '3' and ILifnr eq '" + vLifnr + "'";


                if (vXblnr != "") {
                    url += " and IXblnr eq '" + vXblnr + "'";
                }

                if (startDate != "" && endDate != "") {
                    url += " and IStartdate eq '" + startDate + "'" + " and IEnddate eq '" + endDate + "'";
                }


                var dueModel = oModel.getJsonModel(url);

                var ojbResponse = dueModel.getProperty("/results/0");
                var dueCompModel = ojbResponse.EMTDCNAV.results;

                this.getOwnerComponent().setModel(new JSONModel(ojbResponse),
                    "tableItemsCfdi");

                this.paginate('tableItemsCfdi', '/EMTDCNAV', 1, 0);
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
            if (!this.hasAccess(3)) {
                return false;
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
        documentUploadPress: function(){
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
                "Type": "I",
                "Log" : [ {"Uuid": "", "Description": "", "Sts": "" }]
            };

            var docMatList = this.byId("complPagoList").getSelectedItems();

            if(docMatList.length > 0){
                var docMat = docMatList[0].getBindingContext("tableItemsCfdi").getObject();
                objRequest.Docmat = docMat.Mblnr;
                objRequest.Year = docMat.Gjahr;
            }

            var file = oFileUploader.oFileUpload.files[0];
            console.log(file)
            var reader = new FileReader();
            var reader2 = new FileReader();

            reader2.onload = function (evn) {
                var strXML = evn.target.result;
                //var oXMLModel = new sap.ui.model.xml.XMLModel();  
                //oXMLModel.setXML(strXML);
                //var oXml = oXMLModel.getData();

                var body = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" ' + 
                    'xmlns:sci="http://www.sci-grupo.com.mx/">' + 
                    '\n<soapenv:Header/>\n<soapenv:Body>\n<sci:RecibeCFD><sci:XMLCFD>' + 
                    '<![CDATA[' + strXML + ']]>\n</sci:XMLCFD>\n</sci:RecibeCFD>\n</soapenv:Body>\n' + 
                    '</soapenv:Envelope>';

                //var body = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:sci="http://www.sci-grupo.com.mx/"><soapenv:Header/><soapenv:Body><sci:RecibeCFD><sci:XMLCFD><![CDATA[<?xml version="1.0" encoding="UTF-8"?> <cfdi:Comprobante Version="4.0" xmlns:cfdi="http://www.sat.gob.mx/cfd/4" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd" Serie="A" Folio="2969" Fecha="2022-05-04T10:41:11" NoCertificado="00001000000507417493" Certificado="MIIF1zCCA7+gAwIBAgIUMDAwMDEwMDAwMDA1MDc0MTc0OTMwDQYJKoZIhvcNAQELBQAwggGEMSAwHgYDVQQDDBdBVVRPUklEQUQgQ0VSVElGSUNBRE9SQTEuMCwGA1UECgwlU0VSVklDSU8gREUgQURNSU5JU1RSQUNJT04gVFJJQlVUQVJJQTEaMBgGA1UECwwRU0FULUlFUyBBdXRob3JpdHkxKjAoBgkqhkiG9w0BCQEWG2NvbnRhY3RvLnRlY25pY29Ac2F0LmdvYi5teDEmMCQGA1UECQwdQVYuIEhJREFMR08gNzcsIENPTC4gR1VFUlJFUk8xDjAMBgNVBBEMBTA2MzAwMQswCQYDVQQGEwJNWDEZMBcGA1UECAwQQ0lVREFEIERFIE1FWElDTzETMBEGA1UEBwwKQ1VBVUhURU1PQzEVMBMGA1UELRMMU0FUOTcwNzAxTk4zMVwwWgYJKoZIhvcNAQkCE01yZXNwb25zYWJsZTogQURNSU5JU1RSQUNJT04gQ0VOVFJBTCBERSBTRVJWSUNJT1MgVFJJQlVUQVJJT1MgQUwgQ09OVFJJQlVZRU5URTAeFw0yMTA1MTcxOTEzMTZaFw0yNTA1MTcxOTEzMTZaMIGlMRwwGgYDVQQDExNPU0NBUiBDSEFWRVogQ0hBVkVaMRwwGgYDVQQpExNPU0NBUiBDSEFWRVogQ0hBVkVaMRwwGgYDVQQKExNPU0NBUiBDSEFWRVogQ0hBVkVaMRYwFAYDVQQtEw1DQUNYNTQwMzI5NEQ4MRswGQYDVQQFExJDWENPNTQwMzI5SERGSEhTMDYxFDASBgNVBAsTC0ZBQ1RVUkFDSU9OMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAn31FAJKriyKGHs6yv0aDvGrMNV+aVJYXAShFeDhso4iT/zEeQWUIWftgqREybrMiHQ4bfAyrnrlg/D4sh/r6pEwjENFgB0FFvCBnUSjmXA/4EDVqsQfoNoGTU2f8vmtmczexK0jtqDSw4X9BC4pvNQeGoZpNtdjwSb/2rjih2lMTVSXnMpfSoOMc1NSjSvBk1VojUxJcQ1CnjS/6Zydn00+H6J+rkAlLNwOZTF2oe32KIT6IJwkaCSJmxZQXSltiygpht79Ceksq9UalqdyuNO4VILQVf897n9i/Ad5uX3b+0opNDiTjD5P+/GbMusZJWcul1Bnhef9XngHo0QUiYQIDAQABox0wGzAMBgNVHRMBAf8EAjAAMAsGA1UdDwQEAwIGwDANBgkqhkiG9w0BAQsFAAOCAgEAJLH3/TB6P0ro338R+8sZgqtbB4ezxLFSj+mO9xqf2l5Le7cvwfGi50lSKsc8ZKpJ4asmqmJtrHub//GJTYYWdacu3JVdXcfCFLeKqeA2cJTWhuZd7furioMJmyqFC/ybhFxAvD22DuAXLXYuWNMJ0wd7HrgM0LWIZP89IvTjnYhHZHYrFAi4XvucN64qyp9ELsW/gCQJs8dwAXhAGkvWPahDLRjjpfjvMEMFK1Q9lIDvHKC1ZklBKEq7nN9ELkh4mUn02/M32faBJebUP4CVkt0WrPJqbZpkOrU190YjT74gQjPoCzBPiIITKMgipFc4Ck1NgErLa0KZLMSYqaSasrCKKB+LXc/HdZSZ8Rl1hET1RokKXAErJdNVSivQ5AS/nLDIPtAIDFzaS5DB8OnS6arCZX6p30EgUyPIes48va7TxtJUfguzbmUByG6vSe8eWKUrOMd3UXhcRFEwEMB+dM68iVOnoRoZn3bqZ8LD/4vv0WUPz/5jtMIcOKLk1QH2xp70VV5h7T/S6vWyQBhdIWehWbt58CpceiiEDPs6Y2ObTAKOUVXHweg9vhezi0FHtISEv+uORQ3lSbp/VItuj83ydOAjCOpwfZNqxGPHYL10buY4LPR1bGgm+xZkp9HJmdnXmY8k4mlQNRUQX+2U0Bp0cVFGPvm9sngzenAVcXA=" Exportacion="01" Moneda="MXN" TipoDeComprobante="I" MetodoPago="PPD" FormaPago="99" SubTotal="2500.00" Total="2800.00" LugarExpedicion="07290" Sello="iEfWkBSYl5HQrn9olxQ3igb6QWtD2tdKI9xYDov3EufFSIn9T4n63G3X7xpqFztkGjR3E7YUKiTHaVXliqB8K0Jg3Kpl8riV1v7QJzDWMvwCTvaZTs8CtGDBbTmVLvghfLfiPCMYNW5otGnF+P26f8bdYw418U/dqrrG/BMbG2DfFoONaJCuAeJPrZHwop11sp5ZxLU8G2QqfhMx1znj6SgQyz4XeC+X9nJVC1Cuyyk9EXszzabiARWEDQ8FTVHhLSRJRqfc6d2ayBQp3CfzB3C6Z5iMTZ5gwcLQl8jhU/0pj4sgI2x0tLwUc+Ga1WJmvSRa3T4ywb3Z/uBFx4Bp3A=="><cfdi:Emisor Rfc="CACX5403294D8" Nombre="OSCAR CHAVEZ CHAVEZ" RegimenFiscal="612" /> <cfdi:Receptor Rfc="TSO991022PB6" Nombre="TIENDAS SORIANA" UsoCFDI="G03" DomicilioFiscalReceptor="64610" RegimenFiscalReceptor="601" /> <cfdi:Conceptos> <cfdi:Concepto ClaveProdServ="78101800" Cantidad="1.00" ClaveUnidad="E48" Descripcion="ALQUILER DE CAMIONETA 3.5, PARA TRANSFERENCIA DEL DEPTO. MTTO, DE HIPER EL ROSARIO, PABELLON AZCAPOTZALCO E HIPER VALLEJO A HIPER LA VILLA, REALIZADO EL DIA 3 DE MAYO." ValorUnitario="2500.00" Importe="2500.00" ObjetoImp="02"> <cfdi:Impuestos> <cfdi:Traslados> <cfdi:Traslado Base="2500.00" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="400.00" /> </cfdi:Traslados> <cfdi:Retenciones> <cfdi:Retencion Base="2500.00" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.040000" Importe="100.00" /> </cfdi:Retenciones> </cfdi:Impuestos> </cfdi:Concepto></cfdi:Conceptos><cfdi:Impuestos TotalImpuestosRetenidos="100.00" TotalImpuestosTrasladados="400.00"> <cfdi:Retenciones> <cfdi:Retencion Impuesto="002" Importe="100.00" /> </cfdi:Retenciones> <cfdi:Traslados> <cfdi:Traslado Base="2500.00" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="400.00" /> </cfdi:Traslados> </cfdi:Impuestos><cfdi:Complemento><tfd:TimbreFiscalDigital xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sat.gob.mx/TimbreFiscalDigital http://www.sat.gob.mx/sitio_internet/cfd/TimbreFiscalDigital/TimbreFiscalDigitalv11.xsd" Version="1.1" UUID="A05BE938-CBC0-11EC-8910-00155D014009" FechaTimbrado="2022-05-04T10:41:12" RfcProvCertif="TBN040609RKA" SelloCFD="iEfWkBSYl5HQrn9olxQ3igb6QWtD2tdKI9xYDov3EufFSIn9T4n63G3X7xpqFztkGjR3E7YUKiTHaVXliqB8K0Jg3Kpl8riV1v7QJzDWMvwCTvaZTs8CtGDBbTmVLvghfLfiPCMYNW5otGnF+P26f8bdYw418U/dqrrG/BMbG2DfFoONaJCuAeJPrZHwop11sp5ZxLU8G2QqfhMx1znj6SgQyz4XeC+X9nJVC1Cuyyk9EXszzabiARWEDQ8FTVHhLSRJRqfc6d2ayBQp3CfzB3C6Z5iMTZ5gwcLQl8jhU/0pj4sgI2x0tLwUc+Ga1WJmvSRa3T4ywb3Z/uBFx4Bp3A==" NoCertificadoSAT="00001000000504587508" SelloSAT="Y+ZC+SFyhyEnlj2qBTOpavezqNX19D93KCjaH7CdzedmWlm7lhLLVJtEeo0pFHYK16ZpRhXSHZjxi0SW/hCVWT6wxnkI8NEtKayHS2Bhac2PWBhRZcjcuVBL86bvEazQz+QRpS+nb3bjT8qGmpKj5qKghlRLOckhYJtn6bAoIvZZE4Qy0m6tgGkCdd+222v4W44yRe0PGgUp9porb9OYzgFHohY+OHTWbmr/B0k/MyONnQIbyX0VvSbEj/HddfanZdSazFSfG7hSXAv7HYWWjud4cM+MGsP/Fk2t5rPjpHq6lU22yXvLojG+TCRMd52RiZ++psBz+UAsx+kMTifTig==" /></cfdi:Complemento><cfdi:Addenda><DSCargaRemisionProv><Remision><Proveedor>302058</Proveedor><Remision>506906</Remision><Consecutivo>0</Consecutivo><FechaRemision>2022-05-04T00:00:00</FechaRemision><Tienda>255</Tienda><TipoMoneda>1</TipoMoneda><TipoBulto>1</TipoBulto><EntregaMercancia>1</EntregaMercancia><CumpleReqFiscales>true</CumpleReqFiscales><CantidadBultos>1.000000</CantidadBultos><Subtotal>2500.000000</Subtotal><Descuentos>0.000000</Descuentos><IEPS>0.000000</IEPS><IVA>400.000000</IVA><OtrosImpuestos>0.000000</OtrosImpuestos><Total>2900.000000</Total><CantidadPedidos>1</CantidadPedidos><FechaEntregaMercancia>2022-05-04T00:00:00</FechaEntregaMercancia></Remision><Pedidos><Proveedor>302058</Proveedor><Remision>506906</Remision><FolioPedido>101001120</FolioPedido><Tienda>255</Tienda><CantidadArticulos>1</CantidadArticulos></Pedidos><Articulos><Proveedor>302058</Proveedor><Remision>506906</Remision><FolioPedido>101001120</FolioPedido><Tienda>255</Tienda><Codigo>2000110170677</Codigo><CantidadUnidadCompra>1.000000</CantidadUnidadCompra><CostoNetoUnidadCompra>2500.000000</CostoNetoUnidadCompra><PorcentajeIEPS>0.000000</PorcentajeIEPS><PorcentajeIVA>16.000000</PorcentajeIVA></Articulos></DSCargaRemisionProv></cfdi:Addenda></cfdi:Comprobante>]]></sci:XMLCFD></sci:RecibeCFD></soapenv:Body></soapenv:Envelope>'

                /*
                const options = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'text/xml',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: body
                };
                  
                fetch('https://servicioswebsorianaqa.soriana.com/RecibeCFD/wseDocRecibo.asmx', options)
                .then(response => {
                    console.log(response.json())
                }).catch(err => {
                    console.error(err)
                });
                */

                
               const settings = {
                    "async": true,
                    "url": "https://servicioswebsorianaqa.soriana.com/RecibeCFD/wseDocRecibo.asmx",
                    "method": "POST",
                    "headers": {
                        "Content-Type": "text/xml",
                        "Access-Control-Allow-Origin":"*"
                    },
                    "data": body
                };

                $.ajax(settings).done(function (response) {
                    var oXMLModel = new sap.ui.model.xml.XMLModel();  
                    oXMLModel.setXML(response.getElementsByTagName("RecibeCFDResult")[0].textContent);

                    var oXml = oXMLModel.getData();
                    console.log(oXml.getElementsByTagName("AckErrorApplication")[0].attributes.getElementsByTagName("documentStatus"))
                    //var oXml = oXMLModel.getData();
                    //console.log(oXml)
                });
            };
            reader2.readAsText(file);

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
        onListItemPress: function (oEvent) {
            var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(1),
                productPath = oEvent.getSource().getBindingContext("tableItemsCfdi").getPath(),
                line = productPath.split("/").slice(-1).pop();

            var odata = this.getOwnerComponent().getModel("tableItemsCfdi");
            var results = odata.getProperty("/EMTDCNAV/Paginated/results");

            var document = results[line].Mblnr;
            var year = results[line].Gjahr;

            this.getOwnerComponent().getRouter().navTo("detailCfdi", { layout: oNextUIState.layout, document: document, year: year }, true);
        }

    });
});