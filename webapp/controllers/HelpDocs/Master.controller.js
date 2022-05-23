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

    var inboxModel = new this.MyInbox();
    return Controller.extend("demo.controllers.HelpDocs.Master", {
        onInit: function () {
            this._pdfViewer = new PDFViewer();
            this.getView().addDependent(this._pdfViewer);

            this.oRouter = this.getOwnerComponent().getRouter();
            this.getView().addEventDelegate({
                onAfterShow: function (oEvent) {
                    var barModel = this.getConfigModel();
                    barModel.setProperty("/barVisible", true);
                    this.getView().byId("description").setValue("");
                    this.getOwnerComponent().setModel(new JSONModel(),
                        "tableHelpDocs");
                    this.searchData();
                }
            }, this);
            this.configFilterLanguage(this.getView().byId("filterBar"));
        },
        searchData: function () {
            if (!inboxModel.getModel()) {
                inboxModel.initModel();
            }

            var search = this.getView().byId("description").getValue();
            this.getView().byId('helpDocsList').setBusy(true);

            var url = "/headInboxSet?$expand=ETDOCANAV&$filter= IOption eq '10'";

            if (search != null && search != "") {
                url += ` and IName eq '${search}'`;
            }

            inboxModel.getJsonModelAsync(
                url,
                function (jsonModel, parent) {
                    var objResponse = jsonModel.getProperty("/results/0");

                    if (objResponse != null) {
                        parent.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(objResponse), "tableHelpDocs");

                        parent.paginated("tableHelpDocs", "/ETDOCANAV", 1, 0);
                    }
                    parent.getView().byId('helpDocsList').setBusy(false);
                },
                function (parent) {
                    parent.getView().byId('helpDocsList').setBusy(false);
                },
                this
            );
        },
        newHelpDoc: function () {
            if(!this.hasAccess(22)){
                return
            }
            if (!this._uploadDialog2) {
                this._uploadDialog2 = sap.ui.xmlfragment("newHelpDocFragment", "demo.views.HelpDocs.NewHelpDocs", this);
                this.getView().addDependent(this._uploadDialog2);
            }
            this._uploadDialog2.open();
        },
        onCloseDialog: function () {
            if (this.newHelpDoc) {
                this._uploadDialog2.destroy();
                this._uploadDialog2 = null;
            }
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
        handleUploadPress: function () {
            var that = this;
            var oFileUploader = sap.ui.core.Fragment.byId("newHelpDocFragment", "fileUploader");
            var detail = sap.ui.core.Fragment.byId("newHelpDocFragment", "description").getValue();
            if (!oFileUploader.getValue() || (detail == null && detail == "")) {
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/helpDocs.uploader.nodata"));
                return;
            }

            var objRequest = {
                "IOption": "8",
                "IMail": this.getOwnerComponent().getModel("userdata").getProperty("/IMail"),
                "ITDOCAYNAV": []
            };

            var file = oFileUploader.oFileUpload.files[0];

            var oFile = {};
            oFile.Zdescrip = detail;
            oFile.Zarchivo = file.name;
            oFile.Zdoctype = file.type
            var reader = new FileReader();
            reader.onload = function (evn) {
                oFile.Zdocvalue64 = evn.target.result;
                objRequest.ITDOCAYNAV.push(oFile);

                var response = inboxModel.create("/headInboxSet", objRequest);

                if (response != null) {
                    if (response.ESuccess == "X") {
                        oFileUploader.clear();
                        that.onCloseDialog();
                        that.searchData();
                    } else {
                        sap.m.MessageBox.error(response.EMessage);
                    }
                }
            };
            reader.readAsDataURL(file);

        },
        paginated: function (model, table, iterator, row) {
            this.paginate(model, table, iterator, row);
        },
        selectHelpDoc: function (docInv) {
            var response = inboxModel.getJsonModel(`/headInboxSet?$expand=ETDOCANAV&$filter= IOption eq '11' and IIdhp eq '${docInv}'`);

            if (response != null) {
                var result = response.getProperty("/results/0");
                if (result.ESuccess == "X") {
                    this.downloadAttach(result.EsVdoca.Zdocvalue64, result.EsVdoca.Zdoctype);
                } else {
                    sap.m.MessageBox.error(result.EMessage);
                }
            }
        },
        downloadAttach: function (url, type) {
            switch (type) {
                case 'application/pdf':
                    this.pdfView(url, type);
                    break;
                default:
                    var _fileurl = this.buildBlobUrl(url, type);
                    sap.m.URLHelper.redirect(_fileurl, true);
                    break;
            }
        },
        pdfView: function (url, type) {
            
            var _pdfurl = this.buildBlobUrl(url, type);

            if (!this._PDFViewer) {
                this.createPDFView(_pdfurl);
            } else {
                if (this._PDFViewer.getSource() !== _pdfurl) {
                    this._PDFViewer = null;
                }
                this.createPDFView(_pdfurl);
            }

            this._PDFViewer.open();
        },
        createPDFView: function (url) {
            this._PDFViewer = new sap.m.PDFViewer({
                width: "auto",
                source: url // my blob url
            });
            jQuery.sap.addUrlWhitelist("blob"); // register blob url as whitelist
        },
        deleteHelpDoc: function (docId, docDescript) {
            if(!this.hasAccess(23)){
                return
            }
            var that = this;
            var msg = this.getOwnerComponent().getModel("appTxts").getProperty("/helpDocs.deleteConfirm");
            sap.m.MessageBox.confirm(msg, {
                actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                emphasizedAction: sap.m.MessageBox.Action.YES,
                onClose: function (sAction) {
                    if (sAction == sap.m.MessageBox.Action.YES) {
                        that.delteDoc(docId);
                    }
                }
            });
        },
        delteDoc: function (docId) {
            var objRequest = {
                "IOption": "9",
                "IMail": this.getOwnerComponent().getModel("userdata").getProperty("/IMail"),
                "ITIDDOCNAV": [{ "Idarchivo": docId }]
            };

            var response = inboxModel.create("/headInboxSet", objRequest);

            if (response != null) {
                if (response.ESuccess == "X") {
                    sap.m.MessageBox.success(this.getOwnerComponent().getModel("appTxts").getProperty("/helpDocs.deletSuccess"));
                    this.searchData();
                } else {
                    sap.m.MessageBox.error(response.EMessage);
                }
            }

        }
    });
});