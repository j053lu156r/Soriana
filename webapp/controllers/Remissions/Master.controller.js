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
    //var cfdiModel = new this.CfdiModel();
    var avisoModel = new this.AvisoModel();

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
                    this.getOwnerComponent().setModel(new JSONModel(),
                        "tableRemissions");
                    this.getConfigModel().setProperty("/updateFormatsSingle", "xml,xls,xlsx");
                    this.setCurrentWeek();
                }
            }, this);
            this.configFilterLanguage(this.getView().byId("filterBar"));

            this.inptFolio = this.getView().byId("folio");
            this.inptFolio2 = this.getView().byId("folio2");
            this.inptOrder = this.getView().byId("order");
            this.inptOrder2 = this.getView().byId("order2");
        },
        openUploadDialog: function () {
            if (!this.hasAccess(40)) {
                return false;
            }
            if (!this._uploadDialog2) {
                this._uploadDialog2 = sap.ui.xmlfragment("uploadAviso", "demo.views.Remissions.fragments.UploadAviso", this);
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
            var oFileUploader = sap.ui.core.Fragment.byId("uploadAviso", "fileUploaderAviso");
            var uploadList = sap.ui.core.Fragment.byId("uploadAviso", "logUploadListAviso");
            var uploadBox = sap.ui.core.Fragment.byId("uploadAviso", "uploadBoxAviso");
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

                var response = avisoModel.create("/ECfdiSet ", objRequest);

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
            var vEbeln2 = this.inptOrder2.getValue();
            var vFolio = this.getView().byId('folio').getValue();
            var vFolio2 = this.inptFolio2.getValue();
            var bFilterPriority = false;
            var callService = true;



            var url = `/HdrAvisoSet?$expand=EFREMNAV,ETREMDNAV&$filter=IOption eq '1' and ILifnr eq '${vLifnr}' `;

            // Validar Folios
            // Si el folio 1 trae datos y el folio 2 trae datos
            if (vFolio != "" && vFolio2 != ""){
                /*
                // Validar que el folio 1 sea menor que el 2
                if (vFolio < vFolio2){
                    
                } else {
                    sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/rem.filters.folioErrorValue"));
                    callService = false;
                }
                */
               url += ` and IZremision eq '${vFolio}' and IZremision2 eq '${vFolio2}' `;
               bFilterPriority = true;
            } else if (vFolio == "" && vFolio2 != "") {
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/rem.filters.folioEmpty"));
                callService = false;
            } else if (vFolio != "" && vFolio2 == "") {
                url += ` and IZremision eq '${vFolio}' `;
                bFilterPriority = true;
            }

            if (bFilterPriority == false) {
                if (startDate != null && endDate != null) {
                    url += ` and ISfechrem eq '${startDate}' and IFfechrem eq '${endDate}'`;
                }
            }

            // Validar pedidios
            // Si el pedido 1 trae datos y el pedido 2 trae datos
            if (vEbeln != "" && vEbeln2 != ""){
                // Validar que el pedido 1 sea menor que el 2
                if (vEbeln < vEbeln2){
                    url += ` and IEbeln eq '${vEbeln}' and IEbeln2 eq '${vEbeln2}' `;
                } else {
                    sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/rem.filters.orderErrorValue"));
                    callService = false;
                }
            } else if (vEbeln == "" && vEbeln2 != "") {
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/rem.filters.orderEmpty"));
                callService = false;
            } else if (vEbeln != "" && vEbeln2 == "") {
                url += ` and IEbeln eq '${vEbeln}' `;
            }

            if (callService){
                var dueModel = oRemisions.getJsonModel(url);

                var ojbResponse = dueModel.getProperty("/results/0");
                var dueCompModel = ojbResponse.EFREMNAV.results;
                console.log(dueModel);
    
                this.getOwnerComponent().setModel(new JSONModel(ojbResponse),
                    "tableRemissions");
    
                this.paginate("tableRemissions", "/EFREMNAV", 1, 0);
            }
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
        },

        setCurrentWeek: function(){
            var now = new Date;
            var startDay = 0; //0=sunday, 1=monday etc.
            var d = now.getDay(); //get the current day
            var weekStart = new Date(now.valueOf() - (d<=0 ? 7-startDay:d-startDay)*86400000); //rewind to start day
            var weekEnd = new Date(weekStart.valueOf() + 6*86400000); //add 6 days to get last day

            var oDateRange = this.getView().byId("dateOrder");
            oDateRange.setDateValue(weekStart);
            oDateRange.setSecondDateValue(weekEnd);
        },

        onFolioChange: function(oEvent){
            if (oEvent.getParameter("value") == ""){
                var folio2 = this.inptFolio2.getValue();
                if (folio2 != ""){
                    sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/rem.filters.folioEmpty"));
                    this.inptFolio2.setValue("");
                }
            }
        },

        onFolio2Change: function(oEvent){
            if (oEvent.getParameter("value") != ""){
                var folio = this.inptFolio.getValue();
                // Validar que el Folio 1 no esté vacio
                if (folio == ""){
                    sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/rem.filters.folioEmpty"));
                    this.inptFolio2.setValue("");
                }
            }
        },

        onOrderChange: function(oEvent){
            if (oEvent.getParameter("value") == ""){
                var order2 = this.inptOrder2.getValue();
                // Validar que la orden 1 no esté vacia
                if (order2 != ""){
                    sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/rem.filters.orderEmpty"));
                    this.inptOrder2.setValue("");
                }
            }
        },

        onOrder2Change: function(oEvent){
            if (oEvent.getParameter("value") != ""){
                var order = this.inptOrder.getValue();
                // Validar que la orden 1 no esté vacia
                if (order == ""){
                    sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/rem.filters.orderEmpty"));
                    this.inptOrder2.setValue("");
                }
            }
        },

        handleWizardSubmitAviso: function () {
            console.log("Andle wizard Aviso anticipado!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
            sap.m.MessageBox["confirm"](this.getView().getModel("appTxts").getProperty("/rem.submitMessage"), {
                actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                onClose: function (oAction) {
                    if (oAction === sap.m.MessageBox.Action.YES) {
                        var vLifnr = this.getConfigModel().getProperty("/supplierInputKey");
                        var obj = this.getView().getModel("reviewModel").getData();
                        var objRequest = {
                            "Lifnr": vLifnr,
                            "Type": "A",
                            "Format": "X",
                            "Log": [{ "Uuid": "", "Description": "", "Sts": "" }]
                        };

                        objRequest.Cfdi = JSON.stringify(obj);

                        var response = avisoModel.create("/ECfdiSet ", objRequest);

                        if (response != null) {
                            if (response.Log != null) {
                                this.openLogErrorDialog(response);
                            } else {
                                sap.m.MessageBox.error(response.EMessage);
                            }
                        }

                        this._oWizard.discardProgress(this._oWizard.getSteps()[0]);
                        this.byId("wizardDialog").destroy();
                        this._pDialog = null;
                        this._oWizard = null;
                    }
                }.bind(this)
            });
        },
    });
});