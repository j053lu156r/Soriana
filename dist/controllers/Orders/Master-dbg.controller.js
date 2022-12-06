sap.ui.define([
    "demo/controllers/BaseController",
    "sap/m/PDFViewer",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, PDFViewer, JSONModel, Filter, FilterOperator) {
    "use strict";

    var oModel = new this.Pedidostemp();
    var cfdiModel = new this.CfdiModel();
    var _oDataModel = "ZOSP_DEVO_NC_SRV_01";
    var _oDataEntity = "notCreditSet";
    var oXlsModel = new this.ModelXlsPedidos();
    var oEdiModel = new this.ModelEDI();
    return Controller.extend("demo.controllers.Orders.Master", {
        onInit: function () {
            this._pdfViewer = new PDFViewer();
            this.getView().addDependent(this._pdfViewer);
            this.getView().addEventDelegate({
                onAfterShow: function (oEvent) {
                    var filterbar = this.getView().byId("filterBar");

                    var barModel = this.getOwnerComponent().getModel();
                    barModel.setProperty("/barVisible", true);
                    this.getOwnerComponent().setModel(new JSONModel(), "tableItemsOrders");
                    this.clearFilters();

                    this.getConfigModel().setProperty("/updateFormatsSingle", "xml");
                }
            }, this);
            this.configFilterLanguage(this.getView().byId("filterBar"));
            this.xlsModel = new sap.ui.model.odata.v2.ODataModel(oXlsModel.sUrl);
            this.ediModel = new sap.ui.model.odata.v2.ODataModel(oEdiModel.sUrl);
        },
        searchData: function () {
            sap.ui.core.BusyIndicator.show(0);
            if (!this.hasAccess(1)) {
                sap.ui.core.BusyIndicator.hide();
                return false;
            }

            var bContinue = false;

            if (!oModel.getModel()) {
                oModel.initModel();
            }


            var formater = sap.ui.core.format.DateFormat.getDateTimeInstance({ parent: "yyyyMMdd" });
            var dateRange = this.getView().byId("dateRange");
            var datarange2 = this.getView().byId("dateOrder");
            var datarange3 = this.getView().byId("deliveryDate");

            //Fechas de entrega
            var startDate = this.buildSapDate(dateRange.getDateValue());
            var endDate = this.buildSapDate(dateRange.getSecondDateValue());
            //Fecha de pedido
            var orderStartDate = this.buildSapDate(datarange2.getDateValue());
            var orderEndDate = this.buildSapDate(datarange2.getSecondDateValue());
            //Fecha de fin entrega
            var delivStartDate = this.buildSapDate(datarange3.getDateValue());
            var delivEndDate = this.buildSapDate(datarange3.getSecondDateValue());

            var vLifnr = this.getConfigModel().getProperty("/supplierInputKey");
            var vEbeln = this.getView().byId('order').getValue();
            // Solicitan quitar filtro Cliente - BORTA 27.07.2021
            //var vBukrs = this.getView().byId('client').getSelectedKey();        
            var vClosedOrders = this.getView().byId('closedOrders').getSelected();

            var visible = this.getView().byId("order").getVisible();

            if (vLifnr != null && vLifnr != "") {
                bContinue = true;
            } else {
                sap.ui.core.BusyIndicator.hide();
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/global.supplierSelectError"));
            }

            if (bContinue) {
                if (vEbeln == "") {
                    if (startDate != "" && endDate != ""
                        || orderStartDate != "" && orderEndDate != ""
                        || delivStartDate != "" && delivEndDate != "") {
                        bContinue = true;
                    } else {
                        bContinue = false;
                        sap.ui.core.BusyIndicator.hide();
                        sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/global.searchFieldsEmpty"));
                    }
                } else {
                    bContinue = true;
                }
            }

            if (bContinue) {
               var aFilter = [];
               aFilter.push(new sap.ui.model.Filter("IOption", sap.ui.model.FilterOperator.EQ, "4"));
               aFilter.push(new sap.ui.model.Filter("ILifnr", sap.ui.model.FilterOperator.EQ, vLifnr));

               if (vEbeln != "") {
                   aFilter.push(new sap.ui.model.Filter("IEbeln", sap.ui.model.FilterOperator.EQ, vEbeln));
               }
               if (delivStartDate != "" && delivEndDate != "") {
                   aFilter.push(new sap.ui.model.Filter("IKdatb", sap.ui.model.FilterOperator.EQ, delivStartDate));
                   aFilter.push(new sap.ui.model.Filter("IKdate", sap.ui.model.FilterOperator.EQ, delivEndDate));
               }
               if (orderStartDate != "" && orderEndDate != "") {
                   aFilter.push(new sap.ui.model.Filter("IFini", sap.ui.model.FilterOperator.EQ, orderStartDate));
                   aFilter.push(new sap.ui.model.Filter("IFfin", sap.ui.model.FilterOperator.EQ, orderEndDate));
               }
               if (startDate != "" && endDate != "") {
                   aFilter.push(new sap.ui.model.Filter("IEindt", sap.ui.model.FilterOperator.EQ, startDate));
                   aFilter.push(new sap.ui.model.Filter("IEindf", sap.ui.model.FilterOperator.EQ, endDate));
               }
               if (vClosedOrders != null && vClosedOrders) {
                   aFilter.push(new sap.ui.model.Filter("IClose", sap.ui.model.FilterOperator.EQ, "X"));
               }

               let that = this;
               let top = 5, skip = 5;
               this._GetODataV2(_oDataModel, _oDataEntity, aFilter, ["OEKKONAV"], top, skip).then(resp => {
                   var ojbResponse = resp.data.results[0];
                   this.getOwnerComponent().setModel(new JSONModel(ojbResponse), "tableItemsOrders");
                   this.paginate("tableItemsOrders", "/OEKKONAV", 1, 0);
                   sap.ui.core.BusyIndicator.hide();
               }).catch(error => {
                   sap.ui.core.BusyIndicator.hide();
               });
            }
        },
        onExit: function () {
            if (this._uploadDialog2) {
                this._uploadDialog2.destroy();
                this._uploadDialog2 = null;
            }
        },
        openUploadDialog: function () {
            if (!this.hasAccess(4)) {
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
                "Type": "",
                "Format": "X",
                "Log": [{ "Uuid": "", "Description": "", "Sts": "" }]
            };

            var docMatList = this.byId("complPagoList").getSelectedItems();

            if (docMatList.length > 0) {
                var docMat = docMatList[0].getBindingContext("tableItemsOrders").getObject();
                objRequest.Docmat = docMat.Ebeln;
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
        onListItemPress: function (oEvent) {
            var resource = oEvent.getSource().getBindingContext("tableItemsOrders").getPath(),
                line = resource.split("/").slice(-1).pop();

            var odata = this.getOwnerComponent().getModel("tableItemsOrders");
            var results = odata.getProperty("/OEKKONAV/Paginated/results");

            var document = results[line].Ebeln;
            /*var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(1);
            this.getOwnerComponent().getRouter().navTo("detailOrders", { layout: oNextUIState, document: document }, true);*/
            this.getOwnerComponent().getRouter().navTo("detailOrders", { layout: sap.f.LayoutType.MidColumnFullScreen, document: document }, true);
        },
        buildExportTable: function () {
            var texts = this.getOwnerComponent().getModel("appTxts");
            var columns = [
                {
                    name: texts.getProperty("/order.title"),
                    template: {
                        content: "{Ebeln}"
                    }
                },
                {
                    name: texts.getProperty("/order.customer"),
                    template: {
                        content: "{Bukrs} - {Butxt}"
                    }
                },
                {
                    name: texts.getProperty("/order.amount"),
                    template: {
                        content: "{Netwr}"
                    }
                },
                {
                    name: texts.getProperty("/order.currency"),
                    template: {
                        content: "{Waers}"
                    }
                },
                {
                    name: texts.getProperty("/order.deliveryend"),
                    template: {
                        content: "{Eindt}"
                    }
                },
                {
                    name: texts.getProperty("/order.shipmentstart"),
                    template: {
                        content: "{Kdatb}"
                    }
                },
                {
                    name: texts.getProperty("/order.shipmentend"),
                    template: {
                        content: "{Kdate}"
                    }
                },
                {
                    name: texts.getProperty("/order.ocompra"),
                    template: {
                        content: "{Ekorg}"
                    }
                },
                {
                    name: texts.getProperty("/order.clase"),
                    template: {
                        content: "{Bsart}"
                    }
                },
                {
                    name: texts.getProperty("/order.descript"),
                    template: {
                        content: "{Bsart_d}"
                    }
                },
                {
                    name: texts.getProperty("/order.assorment"),
                    template: {
                        content: "{Telf1}"
                    }
                },
                {
                    name: texts.getProperty("/order.center"),
                    template: {
                        content: "{Werks}"
                    }
                }
            ];

            this.exportxls('tableItemsOrders', '/OEKKONAV/results', columns);
        },
        clearFilters: function () {
            this.getView().byId("dateRange").setValue("");
            this.getView().byId("dateOrder").setValue("");
            this.getView().byId("deliveryDate").setValue("");
            this.getView().byId('order').setValue("");

            // Solicitan quitar filtro Cliente - BORTA 27.07.2021
            //    this.getView().byId('client').setValue("");
            this.getView().byId('closedOrders').setSelected(false);
        },

        buildExcel: function(oEvent){
            var that = this;
			var oItem = oEvent.getSource().getBindingContext("tableItemsOrders").getObject();
            var aFilters = [];
            aFilters.push(new Filter("Ebeln", FilterOperator.EQ, oItem.Ebeln));
            this.xlsModel.read("/EnvExcelSet", {
                filters: aFilters,
                success: function(response){
                    var base64Data = response.results[0].Excel;
                    const linkSource = `data:application/vnd.ms-excel;charset=utf-8;base64,${base64Data}`;
                    const downloadLink = document.createElement("a");
                    downloadLink.href = linkSource;
                    downloadLink.download = `Excel_Pedido_${oItem.Ebeln}.xls`;
                    downloadLink.click();
                }, 
               error: function(error){
                console.log(error)
                   sap.m.MessageBox.error(that.getOwnerComponent().getModel("appTxts").getProperty("/order.xlsError"));
                }
            });
        },

        downloadEDI: function(oEvent){
            var that = this;
			var oItem = oEvent.getSource().getBindingContext("tableItemsOrders").getObject();
            var aFilters = [];
            aFilters.push(new Filter("Ebeln", FilterOperator.EQ, oItem.Ebeln));

            this.ediModel.read("/EdiFileSet", {
                filters: aFilters,
                success: function(response){
                    console.log(response)
                    if(response.results.length > 0){
                        var base64Data = response.results[0].Datar;
                        const linkSource = `data:text/plain;charset=utf-8;base64,${base64Data}`;
                        const downloadLink = document.createElement("a");
                        downloadLink.href = linkSource;
                        downloadLink.download = `EDI_${oItem.Ebeln}.txt`;
                        downloadLink.click();
                    } else {
                        sap.m.MessageBox.error(that.getOwnerComponent().getModel("appTxts").getProperty("/order.ediEmptyError"));
                    }
                }, 
                error: function(error){
                    sap.m.MessageBox.error(that.getOwnerComponent().getModel("appTxts").getProperty("/order.downEdiError"));
                }
            });
        }
    });
});