sap.ui.define([
    "jquery.sap.global",
    "demo/controllers/BaseRemission",
    "sap/m/UploadCollectionParameter",
    "sap/ui/core/mvc/Controller",
    "sap/m/PDFViewer",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "sap/ui/core/routing/Router",
    'sap/f/library',
    "sap/m/MessageBox"
], function (jQuery, Controller, UploadCollectionParameter, History, PDFViewer, JSONModel, fioriLibrary, MessageBox) {
    "use strict";

    var tipoUpload = "";
    var oModel = new this.EnvioCfdi();
    var cfdiModel = new this.CfdiModel();

    var oRemisions = new this.Remissions();
    return Controller.extend("demo.controllers.Remissions.Master", {
        onInit: function () {
            this._pdfViewer = new PDFViewer();
            this.getView().addDependent(this._pdfViewer);

            this.oRouter = this.getOwnerComponent().getRouter();
            this.getView().addEventDelegate({
                onAfterShow: function (oEvent) {
                    var barModel = this.getConfigModel();
                    barModel.setProperty("/barVisible", true);
                    this.getView().byId("dateOrder").setValue("");
                    this.getView().byId("folio").setValue("");
                    this.getOwnerComponent().setModel(new JSONModel(),
                        "tableRemissions");

                    this.getConfigModel().setProperty("/updateFormatsSingle", "xml,xls,xlsx");

                }
            }, this);
        },
        openUploadDialog: function () {
            if (!this.hasAccess(40)) {
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

            if (vLifnr == null || vLifnr == "") {
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/helpDocs.uploader.noProvider"));
                return;
            }

            var objRequest = {
                "Lifnr": vLifnr,
                "Type": "A",
                "Format": "",
                "Log": [{ "Uuid": "", "Description": "", "Sts": "" }]
            };

            var docMatList = this.byId("complPagoList").getSelectedItems();

            if (docMatList.length > 0) {
                var docMat = docMatList[0].getBindingContext("tableItemsCfdi").getObject();
                objRequest.Docmat = docMat.Mblnr;
                objRequest.Year = docMat.Gjahr
            }

            var file = oFileUploader.oFileUpload.files[0];

            if (file.type != "text/xml") {
                objRequest.Format = "X";
            }

            var reader = new FileReader();
            reader.onload = function (evn) {
                if (file.type == "text/xml") {
                    var parts = evn.target.result.split(",");
                    objRequest.Cfdi = parts[1];
                } else {
                    var obj = {};
                    var data = evn.target.result;
                    var workbook = XLSX.read(data, {
                        type: 'binary'
                    });
                    workbook.SheetNames.forEach(function (sheetName) {
                        var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName], {raw: false});
                        var json_object = XL_row_object;
                        obj[sheetName] = { "columnas":  json_object};
                    });
                    objRequest.Cfdi = JSON.stringify(obj);
                }

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
            if (file.type == "text/xml") {
                reader.readAsDataURL(file);
            } else {
                reader.readAsBinaryString(file);
            }
        },
        searchData: function () {

            if (!this.hasAccess(5)) {
                return false;
            }
            var formater = sap.ui.core.format.DateFormat.getDateTimeInstance({ parent: "yyyyMMdd" });
            var dateRange = this.getView().byId("dateOrder");

            //Fechas de entrega
            var startDate = this.buildSapDate(dateRange.getDateValue());
            var endDate = this.buildSapDate(dateRange.getSecondDateValue());

            var vLifnr = this.getConfigModel().getProperty("/supplierInputKey");
            var vEbeln = this.getView().byId('order').getValue();
            var vFolio = this.getView().byId('folio').getValue();


            var url = `/HdrAvisoSet?$expand=EFREMNAV,ETREMDNAV&$filter=IOption eq '1' and ILifnr eq '${vLifnr}' `;

            if (startDate != null && endDate != null) {
                url += ` and ISfechrem eq '${startDate}' and IFfechrem eq '${endDate}'`;
            }

            if (vEbeln != null && vEbeln != "") {
                url += ` and IEbeln eq '${vEbeln}'`;
            }

            if (vFolio != null && vFolio != "") {
                url += ` and IZremision eq '${vFolio}' `;
            }

            var dueModel = oRemisions.getJsonModel(url);

            var ojbResponse = dueModel.getProperty("/results/0");
            var dueCompModel = ojbResponse.EFREMNAV.results;
            console.log(dueModel);

            this.getOwnerComponent().setModel(new JSONModel(ojbResponse),
                "tableRemissions");

            this.paginate("tableRemissions", "/EFREMNAV", 1, 0);

        },
        onListItemPress: function (oEvent) {
            var resource = oEvent.getSource().getBindingContext("tableRemissions").getPath(),
                line = resource.split("/").slice(-1).pop();

            var odata = this.getOwnerComponent().getModel("tableRemissions");
            var results = odata.getProperty("/EFREMNAV/Paginated/results");

            var document = results[line].Zremision;
            this.getOwnerComponent().getRouter().navTo("detailRemission", { layout: sap.f.LayoutType.MidColumnFullScreen, document: document }, true);
        },
        buildExportTable: function () {
            var texts = this.getOwnerComponent().getModel("appTxts");

            var columns = [
                {
                    name: texts.getProperty("/rem.document"),
                    template: {
                        content: "{Zremision}"
                    }
                },
                {
                    name: texts.getProperty("/rem.addressee"),
                    template: {
                        content: "{Werks}"
                    }
                },
                {
                    name: texts.getProperty("/rem.createDate"),
                    template: {
                        content: "{Zfechrem}"
                    }
                },
                {
                    name: texts.getProperty("/rem.typeRemission"),
                    template: {
                        content: "{Ztipoaviso}"
                    }
                },
                {
                    name: texts.getProperty("/rem.statusRemission"),
                    template: {
                        content: "{Zstatus}"
                    }
                },
                {
                    name: texts.getProperty("/rem.typedeliv"),
                    template: {
                        content: "{Ztipoentreg}"
                    }
                },
                {
                    name: texts.getProperty("/rem.cancelStatus"),
                    template: {
                        content: "{ZstatusCan}"
                    }
                }
            ];

            this.exportxls('tableRemissions', '/EFREMNAV/results', columns);
        }

    });
});