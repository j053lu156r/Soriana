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
    var oModel = new this.MyInbox();

    return Controller.extend("demo.controllers.MiBandeja.Releases.Master", {
        onInit: function () {
            this._pdfViewer = new PDFViewer();
            this.getView().addDependent(this._pdfViewer);

            this.oRouter = this.getOwnerComponent().getRouter();
            this.getView().addEventDelegate({
                onAfterShow: function (oEvent) {
                    var barModel = this.getConfigModel();
                    barModel.setProperty("/barVisible", true);
                    this.getView().byId("dateRange").setValue("");
                    this.getView().byId("subject").setValue("");
                    this.getOwnerComponent().setModel(new JSONModel(),
                        "masterReleaseModel");
                }
            }, this);
            this.configFilterLanguage(this.getView().byId("filterBar"));
        },
        searchData: function () {
            var bContinue = false;
            if (!oModel.getModel()) {
                oModel.initModel();
            }

            var formater = sap.ui.core.format.DateFormat.getDateTimeInstance({ parent: "yyyyMMdd" });
            var dateRange = this.getView().byId("dateRange");

            var startDate = this.buildSapDate(dateRange.getDateValue());
            var endDate = this.buildSapDate(dateRange.getSecondDateValue());
            var vSubject = this.getView().byId("subject").getValue();
            var vUser = this.getOwnerComponent().getModel("userdata").getProperty("/EIdusua");

            if (vSubject != null && vSubject == "") {
                if (startDate != "" && endDate != "") {
                    bContinue = true;
                } else {
                    bContinue = false;
                    sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/global.searchFieldsEmpty"));
                }
            } else {
                bContinue = true;
            }

            if (bContinue) {
                var url = "/headInboxSet?$expand=ETDATAMESNAV&$filter=IOption eq '12' and IIdusua eq '" + vUser + "'";


                if (vSubject != "") {
                    url += "  and IName eq '" + vSubject +"'";
                }

                if (startDate != "" && endDate != "") {
                    url += " and ISdate eq '" + startDate + "'" + " and IEdate eq '" + endDate + "'";
                }
                var oBusyDialog = new sap.m.BusyDialog();
                oBusyDialog.open();
                var dueModel = oModel.getJsonModel(url);
                oBusyDialog.close();
                var ojbResponse = dueModel.getProperty("/results/0");

                this.getOwnerComponent().setModel(new JSONModel(ojbResponse),
                    "masterReleaseModel");

                this.paginate('masterReleaseModel', '/ETDATAMESNAV', 1, 0);
            }

        },
        deleteRelease: function (relId) {
            if(!this.hasAccess(50)){
                return
            }
            var that = this;
            
            var msg = this.getOwnerComponent().getModel("appTxts").getProperty("/helpDocs.deleteConfirm");
            sap.m.MessageBox.confirm(msg, {
                actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                emphasizedAction: sap.m.MessageBox.Action.YES,
                onClose: function (sAction) {
                    if (sAction == sap.m.MessageBox.Action.YES) {
                        that.deleteRel(relId);
                    }
                }
            });
        },
        deleteRel: function (relId) {
            if(!this.hasAccess(50)){
                return
            }
           
            var userData = this.getOwnerComponent().getModel("userdata");
            var sendMail = userData.getProperty("/IMail");// this.getView().byId("sendMail"); //userData.getProperty("/EIdusua")
            var idUser = userData.getProperty("/EIdusua");
            var objRelease = {
                "IOption": "17",
                "IIdusua": idUser, //quien manda
                "IAllpro":"",
                "ISdate": "", //startDate, fecha de valides
                "IEdate": "", // endDate,
                "IIdmen" : relId,//this._release ,
                "IFmail": "",
                "ISubject":  "",
                "IText": "", //-TEXTO DEL MENSAJE -
                "ITPROVNAV": [],
                "ITATTACNAV": []
            }

            var response = oModel.create("/headInboxSet", objRelease);

            if (response != null) {
                if (response.ESuccess == "X") {
                    sap.m.MessageBox.success(response.EMessage, {
                        actions: [sap.m.MessageBox.Action.CLOSE],
                        emphasizedAction: sap.m.MessageBox.Action.CLOSE,
                        onClose: function (sAction) {
                            this.searchData();
                           // this.goToMainRelease();
                           // this.clearFields();
                        }.bind(this)
                    });
                } else {
                    if(response.mensaje != null){
                        sap.m.MessageBox.error(response.mensaje);
                    }else{
                        sap.m.MessageBox.error("Ocurrio un error");
                    }
                    
                }
            } else {
                sap.m.MessageBox.error("No se pudo conectar con el servidor, intente nuevamente.");
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
        newRelease: function () {
            if(!this.hasAccess(17)){
                return
            }
            this.getOwnerComponent().getRouter().navTo("NewRelease");
        },
        openUploadDialog: function (tipoUploadIn) {
            if (!this._uploadDialog2) {
                this._uploadDialog2 = sap.ui.xmlfragment(tipoUpload, "demo.fragments.UploadInvoice", this);
                this.getView().addDependent(this._uploadDialog2);
            }
            this._uploadDialog2.open();
        },
        onCloseDialog: function () {
            if (this._oDialog) {
                this._oDialog.destroy();
                this._oDialog = null;
            }
        },
        onCloseDialogUpload: function () {
            if (this._uploadDialog1) {
                this._uploadDialog1.close();
            }
            if (this._uploadDialog2) {
                this._uploadDialog2.close();
            }
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
                productPath = oEvent.getSource().getBindingContext("masterReleaseModel").getPath(),
                line = productPath.split("/").slice(-1).pop();

            var odata = this.getOwnerComponent().getModel("masterReleaseModel");
            var results = odata.getProperty("/ETDATAMESNAV/Paginated/results");

            var document = results[line].Idmensaje;

            this.getOwnerComponent().getRouter().navTo("detailRelease", { layout: oNextUIState.layout, releaseId: document }, true);
        }

    });
});