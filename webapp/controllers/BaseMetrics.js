sap.ui.define([
    "demo/controllers/BaseController",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "demo/models/BaseModel"
], function (Controller, Fragment, JSONModel) {
    "use strict";

    return Controller.extend("demo.controllers.BaseChat", {
        inboxMetric: async function () {
            var usrModel = this.getOwnerComponent().getModel("userdata");
            if (usrModel != null) {
                var vMail = usrModel.getProperty("/IMail");
            }

            if (vMail != null) {
                var inbox = new MyInbox();
                inbox.getJsonModelAsync(
                    `/headInboxSet?$expand=ETDATAMESNAV&$filter=IOption eq '13' and  IMail eq '${vMail}'`,
                    function (jsonObject, parent) {
                        if (jsonObject != null) {
                            var jsonObj = jsonObject.getProperty("/results/0");
                            if (jsonObj != null) {
                                var cfgModel = parent.getConfigModel();
                                var iValue = jsonObj.ENmes;
                                cfgModel.setProperty("/inboxMetric", parseInt(iValue));
                            }
                        }
                    },
                    function (parent) { },
                    this
                );
            }
        },
        tilesMetrics: function (oEvent) {

            var supplier = this.getConfigModel().getProperty("/supplierInputKey");

            if (this.getOwnerComponent().getModel("metrics") == null) {
                this.getOwnerComponent().setModel(new JSONModel({}), "metrics");
            }

            if (supplier != null && supplier != "") {

                var tileModel = this.getOwnerComponent().getModel("tilesModel");

                var sections = tileModel.getProperty("/sections");

                sections.forEach(section => {
                    section.tiles.forEach(element => {
                        if (this.hasTileVisible(element.id)) {
                            if (element.numeric != null && element.numeric != "") {
                                var parts = element.numeric.split(">");
                                if (parts[1] != null && parts[1] != "") {
                                    this.goMetric(element.id, supplier, parts[1]);
                                }
                            }
                        }
                    });
                });
            }
        },
        goMetric: function (idOption, supplier, property) {
            switch (idOption) {
                case "0001":
                    this.ordersMetric(supplier, property);
                    break;
                case "0005":
                    this.invoiceDelivery(supplier, property);
                    break;
                case "0006":
                    this.paymentPlanMetric(supplier, property);
                    break;
                case "0007":
                    this.complPagoMetric(supplier, property);
                    break;
                case "0008":
                    this.statementMetric(supplier, property);
                    break;
                case "0015":
                    this.helpDocsMetric(supplier, property);
                    break;
                case "0016":
                    this.devolucionesMetric(supplier, property);
                    break;
                case "0018":
                    this.remisionMetric(supplier, property);
                    break;
                case "0022":
                    this.admUserMetric(supplier, property);
                    break;
                case "0030":
                    this.aclaracionesMetric(supplier, property);
                    break;
                case "0031":
                    this.invoiceSorianaMetric(supplier, property);
                    break;
                case "0032":
                    this.dashboardAclaracionesMetric(supplier, property);
                    break;
                case "0034":
                    this.aportacionesMetric(supplier, property);
                case "0035":
                    this.dashboardIncidenciasMetric(supplier, property);
                    break;
                case "0033":
                    this.repartidoresMetric(supplier, property);
                    break;
                case "0040":
                    this.productosMetric(supplier, property);
                    break;
                case "0044":
                    this.detailMetric(supplier, property);
                    break;
            }
        },
        ordersMetric: function (supplier, property) {
            var oModel = new Pedidostemp();

            var url = `/notCreditSet?$expand=OEKKONAV&$filter=IOption eq '1' and ILifnr eq '${supplier}'` +
                ` and IFini eq '20211001' and IFfin eq '20220217'`;

            oModel.getJsonModelAsync(url,
                function (jsonModel, parent) {
                    if (jsonModel != null) {
                        var objResponse = jsonModel.getProperty("/results/0");
                        if (objResponse != null) {
                            parent.getOwnerComponent().getModel("metrics").setProperty(property, objResponse.ECount);
                        }
                    }
                },
                function (parent) { }, this);

        },
        devolucionesMetric: function (supplier, property) {
            return 0;
        },
        repartidoresMetric: function (supplier, property) {
            return 0;
        },
        detailMetric: function (supplier, property) {
            return 0;
        },
        remisionMetric: function (supplier, property) {
            return 0;
        },
        invoiceDelivery: function (supplier, property) {
            return 0;
        },
        invoiceSorianaMetric: function (supplier, property) {
            return 0;
        },
        paymentPlanMetric: function (supplier, property) {
            return 0;
        },
        complPagoMetric: function (supplier, property) {
            return 0;
        },
        statementMetric: function (supplier, property) {
            return 0;
        },
        admUserMetric: function (supplier, property) {
            return 0;
        },
        inboxMetric: function (supplier, property) {
            return 0;
        },
        helpDocsMetric: function (supplier, property) {
            return 0;
        },
        aclaracionesMetric: function (supplier, property) {
            return 0;
        },
        dashboardAclaracionesMetric: function (supplier, property) {
            return 0;
        },
        dashboardIncidenciasMetric: function (supplier, property) {
            return 0;
        },
        aportacionesMetric: function (supplier, property) {
            return 0;
        },
        quotesMetric: function (supplier, property) {
            return 0;
        },
        productosMetric: function (supplier, property) {
            return 0;
        }
    });
});