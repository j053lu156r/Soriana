sap.ui.define([
    "jquery.sap.global",
    "sap/ui/core/Fragment",
    "demo/controllers/BaseController",
    "sap/m/UploadCollectionParameter",
    "sap/ui/core/mvc/Controller",
    "sap/m/PDFViewer",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/ui/core/routing/Router",
    "demo/models/BaseModel",
    'sap/f/library'
], function (jQuery, Fragment, Controller, UploadCollectionParameter, History, PDFViewer, JSONModel, fioriLibrary) {
    "use strict";

    var oModel = new this.Devoluciones();
    return Controller.extend("demo.controllers.Devoluciones.Master", {
        onInit: function () {
            this.getView().addEventDelegate({
                onAfterShow: function (oEvent) {
                    var barModel = this.getConfigModel();
                    barModel.setProperty("/barVisible", true);
                    this.getOwnerComponent().setModel(new JSONModel(), "tableHeaderDevo");
                    this.clearFilters();

                }
            }, this);
        },
        searchData: function () {
            if (!this.hasAccess(25)) {
                return false;
            }

            var bContinue = false;

            if (!oModel.getModel()) {
                oModel.initModel();
            }

            var formater = sap.ui.core.format.DateFormat.getDateTimeInstance({ parent: "yyyyMMdd" });
            var dateRange = this.getView().byId("budat");
            var daterange2 = this.getView().byId("zfechreg");

            //Fechas de folio devo
            var startDate = this.buildSapDate(dateRange.getDateValue());
            var endDate = this.buildSapDate(dateRange.getSecondDateValue());

            //Fecha de entregado
            var zfechregStartDate = this.buildSapDate(daterange2.getDateValue());
            var zfechregEndDate = this.buildSapDate(daterange2.getSecondDateValue());

            // Parametros de busqueda
            var vLifnr = this.getConfigModel().getProperty("/supplierInputKey");
            var vXblnr = this.getView().byId('xblnr').getValue();
            var vWerks = this.getView().byId('werks').getValue();
            var vZfolagrup = this.getView().byId('zfolagrup').getValue();
            var vZfolfedex = this.getView().byId('zfolfedex').getValue();
            var vZfechreg = this.getView().byId('zfechreg').getValue();
            var vAnulada = this.getView().byId('anul').getSelected();

            if (vLifnr != null && vLifnr != "") {
                bContinue = true;
            } else {
                sap.m.MessageBox.error("El campo proveedor es obligatorio.");
            }

            if (bContinue) {
                if (vXblnr == "") {
                    if (startDate == "" && endDate == "") {
                        if (zfechregStartDate == "" && zfechregEndDate == "") {
                            if (vWerks == "") {
                                if (vZfolagrup == "") {
                                    if (vZfolfedex == "") {
                                        bContinue = false;
                                        sap.m.MessageBox.error("Debe ingresar al menos un criterio de busqueda.");
                                    } else {
                                        bContinue = true;
                                    }
                                } else {
                                    bContinue = true;
                                }
                            } else {
                                bContinue = true;
                            }
                            bContinue = true;
                        } else {
                            bContinue = true;
                        }
                    } else {
                        bContinue = true;
                    }
                } else {
                    bContinue = true;
                }
            }

            if (bContinue) {

                var url = "/HrdReturnsSet?$expand=ETDTDEVNAV,ETFDEVNAV,ITDFAGR&$filter= IOption eq '2' and ILifnr eq '" + vLifnr + "'";

                if (vXblnr != "") {
                    url += " and IXblnr eq '" + vXblnr + "'";
                }

                if (startDate != "" && endDate != "") {
                    url += " and IBudats eq '" + startDate + "'";
                    url += " and IBudatf eq '" + endDate + "'";
                }


                if (zfechregStartDate != "" && zfechregEndtDate != "") {
                    url += " and IRdates eq '" + zfechregStartDate + "'";
                    url += " and IRdatef eq '" + zfechregEndDate + "'";
                }

                if (vWerks != "") {
                    url += " and IWerks eq '" + vWerks + "'";
                }

                if (vZfolagrup != "") {
                    url += " and IZfolagrup eq '" + vZfolagrup + "'";
                }

                if (vZfolfedex != "") {
                    url += " and IZfolfedex eq '" + vZfolfedex + "'";
                }

                if (vAnulada != "") {
                    url += " and IAnul eq 'X'";
                }

                var dueModel = oModel.getJsonModel(url);
                if (dueModel != null) {
                    var ojbResponse = dueModel.getProperty("/results/0");

                    this.getOwnerComponent().setModel(new JSONModel(ojbResponse),
                        "tableHeaderDevo");

                    this.paginate('tableHeaderDevo', '/ETFDEVNAV', 1, 0); // Cambiar por tabla de salida
                    console.log(dueModel);
                }
            }
        },
        onExit: function () {
        },
        codeButton: function () {
            if (!this.hasAccess(35)) {
                return false;
            }

            var oItems = this.byId("tableHeader").getSelectedItems();
            var texts = this.getOwnerComponent().getModel("appTxts");

            if (oItems.length > 0) {

                if (oItems.length <= 20) {
                    var oRequest = {
                        "IOption": "4",
                        "ITDFAGR": []
                    };

                    oItems.forEach(function (item) {
                        var lItem = item.getBindingContext("tableHeaderDevo").getObject();
                        var obj = {};
                        obj.Ebeln = lItem.Ebeln;
                        obj.Xblnr = lItem.Xblnr;
                        obj.Bktxt = lItem.Bktxt;
                        obj.Bsart = lItem.Bsart;
                        obj.Werks = lItem.Werks;
                        obj.Lifnr = lItem.Lifnr;
                        oRequest.ITDFAGR.push(obj);
                    });

                    var dueModelcode = oModel.create("/HrdReturnsSet", oRequest);
                    if (dueModelcode != null) {

                        if (dueModelcode.ESuccess == 'X') {
                            var url = "";
                            this.getOwnerComponent().setModel(new JSONModel(dueModelcode),
                                "tablecode");
                            console.log(dueModelcode);

                            sap.m.MessageBox.success(texts.getProperty("/devo.success"));
                        }
                        else {
                            sap.m.MessageBox.error(dueModelcode.EMessage);
                        }
                    }
                }
                else {
                    sap.m.MessageBox.error(texts.getProperty("/devo.MaxLines"));
                }
            }
            else {
                sap.m.MessageBox.error(texts.getProperty("/devo.NoSelections"));
            }
        },
        printButton: function () {
            if (!this.hasAccess(36)) {
                return false;
            }
            var oItems = this.byId("tableHeader").getSelectedItems();
            //var oItems = this.this.getOwnerComponent().setModel(new JSONModel(ojbResponse),"tableHeaderDevo").getSelectedItems()         
            var texts = this.getOwnerComponent().getModel("appTxts");

            if (oItems.length > 0) {

                if (oItems.length == 1) {
                    var oRequest = {};

                    var url = "";

                    oItems.forEach(function (item) {
                        var lItem = item.getBindingContext("tableHeaderDevo").getObject();
                        var obj = {};
                        obj.Ebeln = lItem.Ebeln;
                        obj.Xblnr = lItem.Xblnr;
                        obj.Bktxt = lItem.Bktxt;
                        obj.Bsart = lItem.Bsart;
                        obj.Werks = lItem.Werks;
                        obj.Lifnr = lItem.Lifnr;
                        obj.Zfolagrup = lItem.Zfolagrup;
                        // oRequest.ITDFAGR.push(obj);

                        url = "/HrdReturnsSet?$expand=ETDTDEVNAV,ETFDEVNAV,ITDFAGR&$filter= IOption eq '5' and ILifnr eq '" + lItem.Lifnr + "'";
                        url += " and IZfolagrup eq '" + lItem.Zfolagrup + "'";
                        url += " and ICprint eq 'X'";

                    });

                    var dueModelprint = oModel.getJsonModel(url);
                    if (dueModelprint != null) {
                        var ojbResponse = dueModelprint.getProperty("/results/0");

                        if (!this._uploadDialog2) {
                            this._uploadDialog2 = sap.ui.xmlfragment("printGroupFragment", "demo.views.Devoluciones.fragments.GroupCode", this);
                            this.getView().addDependent(this._uploadDialog2);
                        }

                        var html = "";

                        if (ojbResponse.Esprintd.Wname != "" && ojbResponse.Esprintd.Nlif != ""
                            && ojbResponse.Esprintd.Ref != "" && ojbResponse.Esprintd.Zfolagrup != "") {
                            html = '<div id="codeGroupDiv" style= "text-align: center; width: 100%;" >' +
                                '<img src ="./images/LogoSoriana.svg" width="350px" />' +
                                '<div style="text-align: center; width: 100%; font-size: large; font-weight: bold; margin: 10pt;" >' +
                                'Formatos de devoluciones y retiros a recolectar' +
                                '</div>' +
                                '<div style= "text-align:left; width: 100%;" >' +
                                `<b>Entrega en:</b> ${ojbResponse.Esprintd.Wname}` +
                                '</div>' +
                                '<div style= "text-align:left; width: 100%;" >' +
                                `<b>Proveedor:</b> ${ojbResponse.Esprintd.Nlif}` +
                                '</div>' +
                                '<div style= "text-align:left; width: 100%;" >' +
                                `<b>No. Referencia:</b> ${ojbResponse.Esprintd.Ref}` +
                                '</div>' +
                                '<div style= "text-align:left; width: 100%;" >' +
                                '<b>Código agrupador:</b>' + ojbResponse.Esprintd.Zfolagrup +
                                '</div>' +
                                '<svg id="barcode"></svg>' +
                                '<p>' +
                                'Este documento acredita al portador como representante del proveedor para realizar la recolección de mercancia contenida en esta cita.' +
                                'Su uso indebido será responsabilidad del proveedor.' +
                                '</p>' +
                                '</div>';

                            ojbResponse.Esprintd.html = html;

                            this.getOwnerComponent().setModel(new JSONModel(ojbResponse),
                                "tableprint");
                            this._uploadDialog2.open();
                            JsBarcode("#barcode", ojbResponse.Esprintd.Zfolagrup);
                        }

                    }
                }
                else {
                    sap.m.MessageBox.error(texts.getProperty("/devo.Maxprint"));
                }
            }
            else {
                sap.m.MessageBox.error(texts.getProperty("/devo.NoSelections"));
            }
        },
        onCloseDialogPrint: function () {
            if (this._uploadDialog2) {
                this._uploadDialog2.close();
                this._uploadDialog2.destroy();
                this._uploadDialog2 = undefined;

            }
        },
        saveCoordinates: function () {
            var element = document.getElementById('codeGroupDiv');
            var opt = {
                margin: 1,
                filename: 'GroupCode.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };

            // New Promise-based usage:
            html2pdf().set(opt).from(element).save();
            element.clear();
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
            var resource = oEvent.getSource().getBindingContext("tableHeaderDevo").getPath(),
                line = resource.split("/").slice(-1).pop();

            var odata = this.getOwnerComponent().getModel("tableHeaderDevo");
            var results = odata.getProperty("/ETFDEVNAV/Paginated/results"); //Aqui se debe colocar la tabla de salida del Odata

            var docResult = results[line];

            this.getOwnerComponent().getRouter().navTo("detailDevo",
                {
                    layout: sap.f.LayoutType.TwoColumnsMidExpanded,
                    xblnr: docResult.Xblnr,
                    lifnr: docResult.Lifnr,
                    ebeln: docResult.Ebeln

                }, true);
        },
        buildExportTable: function () {
            var texts = this.getOwnerComponent().getModel("appTxts");
            var columns = [
                {
                    name: texts.getProperty("/devo.folioDevo"),
                    template: {
                        content: "{Xblnr}"
                    }
                },
                {
                    name: texts.getProperty("/devo.fechaDevo"),
                    template: {
                        content: "{Budat}"
                    }
                },
                {
                    name: texts.getProperty("/devo.sucursal"),
                    template: {
                        content: "{Werks}"
                    }
                },
                {
                    name: texts.getProperty("/devo.sucursal"),
                    template: {
                        content: "{Nwerks}"
                    }
                },
                {
                    name: texts.getProperty("/devo.folioFedex"),
                    template: {
                        content: "{Zfolfedex}"
                    }
                },
                {
                    name: texts.getProperty("/devo.Code"),
                    template: {
                        content: "{Zfolagrup}"
                    }
                },
                {
                    name: texts.getProperty("/devo.status"),
                    template: {
                        content: "{Devol}"
                    }
                }
            ];

            this.exportxls('tableHeaderDevo', '/ETFDEVNAV/results', columns);
        },
        clearFilters: function () {
            this.getView().byId('xblnr').setValue(""); //Folio devolucion
            this.getView().byId("budat").setValue(""); //Fecha devolucion
            this.getView().byId("werks").setValue(""); //Centro
            this.getView().byId("zfolagrup").setValue(""); //Codigo agrupador
            this.getView().byId("zfolfedex").setValue(""); //Folio fedex
            this.getView().byId("zfechreg").setValue(""); //Fecha de entregado
        }


    });
});