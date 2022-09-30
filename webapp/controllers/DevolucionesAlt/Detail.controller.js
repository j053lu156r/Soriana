sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "demo/controllers/BaseController",
    "sap/ui/core/mvc/Controller"
], function (JSONModel, Controller) {
    "use strict";

    var oModel = new this.Devoluciones();
    return Controller.extend("demo.controllers.DevolucionesAlt.Detail", {
        onInit: function () {
            var oExitButton = this.getView().byId("exitFullScreenBtn"),
                oEnterButton = this.getView().byId("enterFullScreenBtn");

            this.oRouter = this.getOwnerComponent().getRouter();
            this.oModel = this.getOwnerComponent().getModel();

          //  this.oRouter.getRoute("_detailDevo").attachPatternMatched(this._onDocumentMatched, this);
            this.oRouter.getRoute("detailDevoEstadoCuenta").attachPatternMatched(this._onDocumentMatchedEstadoC, this);
            this.oRouter.getRoute("detailDevoComplemento").attachPatternMatched(this._onDocumentMatchedComplemento, this);
            this.oRouter.getRoute("detailDevoFactoraje").attachPatternMatched(this._onDocumentMatchedFactoraje, this);




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
        formatSatusDevo: function (status) {
            if (status) {
                return 'true';
            } else {
                return 'false';
            }
        },
        handleItemPress: function (oEvent) {
            var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(2),
                supplierPath = oEvent.getSource().getBindingContext("tableDetailDevo").getPath();

            var objModel = this.getOwnerComponent().getModel("tableDetailDevo").getProperty(supplierPath);


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
            this.oRouter.navTo("detailDevo",
                {
                    layout: sNextLayout,
                    xblnr: this._Xblnr,
                    lifnr: this._lifnr,
                    ebeln: this._Ebeln,
                }
            );
        },
        handleExitFullScreen: function () {
            this.bFocusFullScreenButton = true;
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");



            if(this.parent == "ESTADOC"){
                this.oRouter.navTo("detailDevoEstadoCuenta",
                    {
                        layout: sNextLayout,
                        xblnr: this._Xblnr,
                        lifnr: this._lifnr,
                        ebeln: this._Ebeln,
                        suc: this._Suc,
                    }
                );

            }else if(this.parent == "COMPLEMENTO"){
                this.oRouter.navTo("detailDevoComplemento",
                    {
                        layout: sNextLayout,
                        xblnr: this._Xblnr,
                        lifnr: this._lifnr,
                        ebeln: this._Ebeln,
                        suc: this._Suc,
                    }
                );

            }else if(this.parent == "FACTORAJE"){
                this.oRouter.navTo("detailDevoFactoraje",
                    {
                        layout: sNextLayout,
                        xblnr: this._Xblnr,
                        lifnr: this._lifnr,
                        ebeln: this._Ebeln,
                    }
                );

            }





        },
        handleClose: function () {
            console.log(this.parent)
            if(this.parent == "ESTADOC") {
                var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
                this.oRouter.navTo("EstadoCuenta", {layout: sNextLayout});
            }
            if(this.parent == "COMPLEMENTO") {
                var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
                this.oRouter.navTo("detailCompl2", {layout: sNextLayout});
               
            }
        },
        _onDocumentMatched: function (oEvent) {
            this._Xblnr = oEvent.getParameter("arguments").xblnr || this._Xblnr || "0",
            this._lifnr = oEvent.getParameter("arguments").lifnr || this._lifnr || "0";
            this._Ebeln = oEvent.getParameter("arguments").ebeln || this._Ebeln || "0";
          //  this._Suc = oEvent.getParameter("arguments").suc || this._Suc || "0";

            var headerDeatil = {
                "Xblnr": this._Xblnr,
                "Werks": this._Werks
            };

            this.getOwnerComponent().setModel(new JSONModel(headerDeatil), "headerDetail");
            console.log("2")
            var url = "/HrdReturnsSet?$expand=ETDTDEVNAV,ETFDEVNAV,ITDFAGR&$filter= IOption eq '3' and IEbeln eq '" + this._Ebeln + "'"
                    + " and IXblnr eq '" + this._Xblnr + "'"


            var dueModel = oModel.getJsonModel(url);
            var ojbResponse = dueModel.getProperty("/results/0");
            this.getOwnerComponent().setModel(new JSONModel(ojbResponse),
                "devoDetail");

            this.paginate("devoDetail", "/ETDTDEVNAV", 1, 0);
            console.log(dueModel);
        },

        _onDocumentMatchedEstadoC: function (oEvent) {
            this.parent = "ESTADOC"
            this._Xblnr = oEvent.getParameter("arguments").xblnr || this._Xblnr || "0",
                this._lifnr = oEvent.getParameter("arguments").lifnr || this._lifnr || "0";
            this._Ebeln = oEvent.getParameter("arguments").ebeln || this._Ebeln || "";
            this._Suc = oEvent.getParameter("arguments").suc || this._Suc || "0";

            var headerDeatil = {
                "Xblnr": this._Xblnr,
                "Werks": this._Werks
            };

            this.getOwnerComponent().setModel(new JSONModel(headerDeatil), "headerDetail");

           // var url = "/HrdReturnsSet?$expand=ETDTDEVNAV,ETFDEVNAV,ITDFAGR&$filter= IOption eq '3' "+ " and IXblnr eq '" + this._Xblnr + "'"
           console.log("3")
           console.log(this.getConfigModel().getProperty("/supplierInputKey"))
            var url = "/HrdReturnsSet?$expand=ETDTDEVNAV,ETFDEVNAV,ITDFAGR&$filter= IOption eq '3' and IEbeln eq '" + this._Ebeln + "'"
               + " and IXblnr eq '" + parseInt(this._Xblnr) + "' and ILifnr eq '"+this.getConfigModel().getProperty("/supplierInputKey")+ "' and IWerks eq '"+this._Suc+ "'"


            var dueModel = oModel.getJsonModel(url);
            var ojbResponse = dueModel.getProperty("/results/0");
            this.getOwnerComponent().setModel(new JSONModel(ojbResponse),
                "devoDetail");

            this.paginate("devoDetail", "/ETDTDEVNAV", 1, 0);
            console.log(dueModel);
        },
        _onDocumentMatchedComplemento: function (oEvent) {
            this.parent = "COMPLEMENTO"
            this._Xblnr = oEvent.getParameter("arguments").xblnr || this._Xblnr || "0",
                this._lifnr = oEvent.getParameter("arguments").lifnr || this._lifnr || "0";
            this._Ebeln = oEvent.getParameter("arguments").ebeln || this._Ebeln || "";
            this._Suc = oEvent.getParameter("arguments").suc || this._Suc || "0";

            var headerDeatil = {
                "Xblnr": this._Xblnr,
                "Werks": this._Werks
            };

            this.getOwnerComponent().setModel(new JSONModel(headerDeatil), "headerDetail");
            console.log("4")
            var url = "/HrdReturnsSet?$expand=ETDTDEVNAV,ETFDEVNAV,ITDFAGR&$filter= IOption eq '3' and IEbeln eq '" + this._Ebeln + "'"
                + " and IXblnr eq '" + parseInt(this._Xblnr) + "' and ILifnr eq '"+this.getConfigModel().getProperty("/supplierInputKey")+ "' and IWerks eq '"+this._Suc+ "'"


            var dueModel = oModel.getJsonModel(url);
            var ojbResponse = dueModel.getProperty("/results/0");
            this.getOwnerComponent().setModel(new JSONModel(ojbResponse),
                "devoDetail");

            this.paginate("devoDetail", "/ETDTDEVNAV", 1, 0);
            console.log(dueModel);
        },
        _onDocumentMatchedFactoraje: function (oEvent) {
            this.parent = "FACTORAJE"
            this._Xblnr = oEvent.getParameter("arguments").xblnr || this._Xblnr || "0",
                this._lifnr = oEvent.getParameter("arguments").lifnr || this._lifnr || "0";
            this._Ebeln = oEvent.getParameter("arguments").ebeln || this._Ebeln || "0";

            var headerDeatil = {
                "Xblnr": this._Xblnr,
                "Werks": this._Werks
            };

            this.getOwnerComponent().setModel(new JSONModel(headerDeatil), "headerDetail");
console.log("1")
            var url = "/HrdReturnsSet?$expand=ETDTDEVNAV,ETFDEVNAV,ITDFAGR&$filter= IOption eq '3' and IEbeln eq '" + this._Ebeln + "'"
                + " and IXblnr eq '" +parseInt(this._Xblnr) + "'"


            var dueModel = oModel.getJsonModel(url);
            var ojbResponse = dueModel.getProperty("/results/0");
            this.getOwnerComponent().setModel(new JSONModel(ojbResponse),
                "devoDetail");

            this.paginate("devoDetail", "/ETDTDEVNAV", 1, 0);
            console.log(dueModel);
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
            let Encabezado = this.getOwnerComponent().getModel("devoDetail");

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
                        content: Encabezado.getProperty("/ETFDEVNAV/results/0/Budat")
                    }
                },
                {
                    name: texts.getProperty("/devo.sucursal"),
                    template: {
                        content: Encabezado.getProperty("/ETFDEVNAV/results/0/Werks")
                    }
                },
                {
                    name: texts.getProperty("/devo.sucursal"),
                    template: {
                        content: Encabezado.getProperty("/ETFDEVNAV/results/0/Nwerks")
                    }
                },
                {
                    name: texts.getProperty("/devo.status"),
                    template: {
                        content: Encabezado.getProperty("/ETFDEVNAV/results/0/Zstatusdev")
                    }
                },
                {
                    name: texts.getProperty("/devo.amount"),
                    template: {
                        content: "{/EMtotal}"
                    }
                },
                {
                    name: texts.getProperty("/devo.Code"),
                    template: {
                        content: Encabezado.getProperty("/ETFDEVNAV/results/0/Zfolagrup")
                    }
                },
                {
                    name: texts.getProperty("/devo.folioFedex"),
                    template: {
                        content: Encabezado.getProperty("/ETFDEVNAV/results/0/Zfolfedex")
                    }
                },
                {
                    name: texts.getProperty("/devo.fechacode"),
                    template: {
                        content: Encabezado.getProperty("/ETFDEVNAV/results/0/Zfechreg") //No esta mapeado
                    }
                },
                {
                    name: texts.getProperty("/devo.fechaentrega"),
                    template: {
                        content: Encabezado.getProperty("/ETFDEVNAV/results/0/Zfechent")
                    }
                },
                {
                    name: texts.getProperty("/devo.beforeto"),
                    template: {
                        content: Encabezado.getProperty("/ETFDEVNAV/results/0/Flimrec") // No esta mapeado
                    }
                },
                {
                    name: texts.getProperty("/devo.item"),
                    template: {
                        content: "{Ebelp}"
                    }
                },
                {
                    name: texts.getProperty("/devo.codigo"),
                    template: {
                        content: "{Ean11}"
                    }
                },
                {
                    name: texts.getProperty("/devo.descr"),
                    template: {
                        content: "{Txz01}"
                    }
                },
                {
                    name: texts.getProperty("/devo.qty"),
                    template: {
                        content: "{Menge}"
                    }
                },
                {
                    name: texts.getProperty("/devo.umb"),
                    template: {
                        content: "{Meins}"
                    }
                },

                {
                    name: texts.getProperty("/devo.uprice"),
                    template: {
                        content: "{Netpr}"
                    }
                },
                {
                    name: texts.getProperty("/devo.total"),
                    template: {
                        content: "{Brtwr}"
                    }
                }
            ];

            this.exportxls('devoDetail', '/ETDTDEVNAV/results', columns);
        }
    });
});
