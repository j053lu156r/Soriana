sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "demo/controllers/BaseController",
    "sap/ui/core/mvc/Controller"
], function (JSONModel, Controller) {
    "use strict";

    var oModel = new this.FacSoriana();
    return Controller.extend("demo.controllers.FacSoriana.Detail", {
        onInit: function () {
            var oExitButton = this.getView().byId("exitFullScreenBtn"),
                oEnterButton = this.getView().byId("enterFullScreenBtn");

            this.oRouter = this.getOwnerComponent().getRouter();
            this.oModel = this.getOwnerComponent().getModel();

            this.oRouter.getRoute("detailFacSoriana").attachPatternMatched(this._onDocumentMatched, this);

            [oExitButton, oEnterButton].forEach(function (oButton) {
                oButton.addEventDelegate({
                    onAfterRendering: function () {
                        if (this.bFocusFullScreenButton) {
                            this.bFocusFullScreenButton = false;
                            oButton.focus();
                        }
                    }.bind(this)
                });
            }, this);
        },
        handleItemPress: function (oEvent) {
            var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(2),
                supplierPath = oEvent.getSource().getBindingContext("tableDetailMoves").getPath();

            var objModel = this.getOwnerComponent().getModel("tableDetailMoves").getProperty(supplierPath);


            if (!this._oDialog || this.oDialog === undefined) {
                this._oDialog = sap.ui.xmlfragment("demo.fragments.Exhaustion", this);
            }

            this.getView().addDependent(this._oDialog);

            // toggle compact style
            jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
            this._oDialog.setModel(new JSONModel(objModel));
            this._oDialog.open();
        },
        handleFullScreen: function () {
            this.bFocusFullScreenButton = true;
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
            this.oRouter.navTo("detailFacSoriana",
                {
                    layout: sNextLayout,
                    document: this._document,
                    budat: this._budat,
                    zconfact: this._zconfact,
                    lifnr: this._lifnr,
                    bukrs: this._bukrs
                }
            );
        },
        handleExitFullScreen: function () {
            this.bFocusFullScreenButton = true;
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
            this.oRouter.navTo("detailFacSoriana",
                {
                    layout: sNextLayout,
                    document: this._document,
                    budat: this._budat,
                    zconfact: this._zconfact,
                    lifnr: this._lifnr,
                    bukrs: this._bukrs
                }
            );
        },
        handleClose: function () {
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
            this.oRouter.navTo("masterFacSoriana", { layout: sNextLayout });
        },
        _onDocumentMatched: function (oEvent) {
            this._document = oEvent.getParameter("arguments").document || this._document || "0",
                this._budat = oEvent.getParameter("arguments").budat || this._budat || "0",
                this._zconfact = oEvent.getParameter("arguments").zconfact || this._zconfact || "0",
                this._lifnr = oEvent.getParameter("arguments").lifnr || this._lifnr || "0";
            this._bukrs = oEvent.getParameter("arguments").bukrs || this._bukrs || "0";

            this._budat = this._budat.replaceAll("-", "");

            var url = "/headSorInvSet?$expand=ETAGDOCNAV,ETDCTDTNAV,ETPMTDCNAV&$filter= IOption eq '2' and ILifnr eq '" + this._lifnr + "'"
                + " and IDocnum eq '" + this._document + "'"
                + " and IBudat eq '" + this._budat + "'"
                + " and IZbukrs eq '" + this._bukrs + "'"

            var dueModel = oModel.getJsonModel(url);
            var ojbResponse = dueModel.getProperty("/results/0");
            this.getOwnerComponent().setModel(new JSONModel(ojbResponse),
                "facSorianaHdr");


            if (ojbResponse != null) {

                url = "/headSorInvSet?$expand=ETAGDOCNAV,ETDCTDTNAV,ETPMTDCNAV&$filter= IOption eq '3' and ILifnr eq '" + this._lifnr + "'"
                    + " and IDocnum eq '" + this._document + "'"
                    + " and IZbukrs eq '" + this._bukrs + "'"
                    + " and ILaufi eq '" + ojbResponse.Espmthd.Laufi + "'"
                    + " and ILaufd eq '" + ojbResponse.Espmthd.Laufd + "'"

                var dueModel1 = oModel.getJsonModel(url);
                var ojbResponse1 = dueModel1.getProperty("/results/0");
                this.getOwnerComponent().setModel(new JSONModel(ojbResponse1),
                    "facSorianaDocs");

                this.paginate("facSorianaDocs", "/ETDCTDTNAV", 1, 0);
                this.paginate("facSorianaHdr", "/ETAGDOCNAV", 1, 0);
                console.log(dueModel1);
                console.log(dueModel);
            }
        },
        formatDesc: function (valor1, valor2, valor3) {
            var text = "";

            if (valor1 != "" && valor1 != null) {
                text = valor1;
            } else {
                text = valor3;
            }
            return text;
        },
        formatTotal: function (valor1, valor2, valor3) {
            var text = "";

            if (valor1 != 0 && valor1 != null) {
                text = valor1;
            } else {
                text = valor3;
            }
            return text;
        },
        onCloseDialog: function () {
            if (this._oDialog) {
                this._oDialog.destroy();
                this._oDialog = null;
            }
        },
        onExit: function () {
            this.onCloseDialog();
        },
        buildExcel: function () {
            var texts = this.getOwnerComponent().getModel("appTxts");
            let Encabezado = this.getOwnerComponent().getModel("facSorianaHdr");

            var columns = [
                {
                    name: texts.getProperty("/fs.docno"),
                    template: {
                        content: Encabezado.getProperty("/Espmthd/Vblnr"),
                    }
                },
                {
                    name: texts.getProperty("/fs.Fechapago"),
                    template: {
                        content: Encabezado.getProperty("/Espmthd/Laufd"),
                    }
                },
                {
                    name: texts.getProperty("/global.year"),
                    template: {
                        content: Encabezado.getProperty("/Espmthd/Zyaldt"),
                    }
                },               
                {
                    name: texts.getProperty("/fs.total"),
                    template: {
                        content: Encabezado.getProperty("/EZtotimp"),
                    }
                },
                {
                    name: texts.getProperty("/global.company"),
                    template: {
                        content: Encabezado.getProperty("/Espmthd/Zbukr"),
                    }
                },
                {
                    name: texts.getProperty("/recipient.supplier"),
                    template: {
                        content: Encabezado.getProperty("/Espmthd/Lifnr"),
                    }
                },
                {
                    name: texts.getProperty("/recipient.supplier"),
                    template: {
                        content: Encabezado.getProperty("/Espmthd/Pname"),
                    }
                },
                {
                    name: texts.getProperty("/fs.documento"),
                    template: {
                        content: "{Belnr}"
                    }
                },
                {
                    name: texts.getProperty("/fs.descrip"),
                    template: {
                        content: "{Ltext}"
                    }
                },
                {
                    name: texts.getProperty("/fs.Fechapago"),
                    template: {
                        content: "{Budat}"
                    }
                },
                {
                    name: texts.getProperty("/fs.amount"),
                    template: {
                        content: "{Dmbtr}"
                    }
                },
                {
                    name: texts.getProperty("/fs.foliofact"),
                    template: {
                        content: "{FolfacRef}"
                    }
                },
                {
                    name: texts.getProperty("/fs.uuid"),
                    template: {
                        content: "{CveUuid}"
                    }                
                }
            ];

            this.exportxls('facSorianaDocs', '/ETDCTDTNAV/results', columns);
        }
    });
});

