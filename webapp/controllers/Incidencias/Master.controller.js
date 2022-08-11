sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "demo/controllers/BaseController",
    "sap/ui/core/mvc/Controller"
], function (JSONModel, Controller) {
    "use strict";

    var oModel = new this.Incidencias();
    return Controller.extend("demo.controllers.Incidencias.Master", {
        onInit: function () {
            this.getView().addEventDelegate({
                onBeforeShow: function (oEvent) {
                    // this.setDaterangeMaxMin();

                    //this.getData();

                    // this.generaGrafica();
                }
            }, this);
        },
        getData: function (oControlEvent) {

            this.clearFilters();
            this.oRouter = this.getOwnerComponent().getRouter();
            this.oModel = this.getOwnerComponent().getModel();

            var bContinue = true;

            var vLifnr = this.getConfigModel().getProperty("/supplierInputKey");
            var texts = this.getOwnerComponent().getModel("appTxts");
            var dateRange = this.getView().byId("dateRange");
            var uuid = this.getView().byId("folio");
            var status = this.getView().byId("estatus");

            //Fechas de incidencias
            var startDate = this.buildSapDate(dateRange.getDateValue());
            var endDate = this.buildSapDate(dateRange.getSecondDateValue());

            if (bContinue) {


                let filtros = [];

                filtros.push(new sap.ui.model.Filter({
                    path: "IOption",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: "1"
                })
                );

                if (vLifnr != null && vLifnr != "") {

                    filtros.push(new sap.ui.model.Filter({
                        path: "ILifnr",
                        operator: sap.ui.model.FilterOperator.EQ,
                        value1: vLifnr
                    })
                    );
                }

                if (startDate != null && startDate != "" && endDate != null && endDate != "") {

                    filtros.push(new sap.ui.model.Filter({
                        path: "ISdate",
                        operator: sap.ui.model.FilterOperator.EQ,
                        value1: startDate
                    })
                    );

                    filtros.push(new sap.ui.model.Filter({
                        path: "IFdate",
                        operator: sap.ui.model.FilterOperator.EQ,
                        value1: endDate
                    })
                    );
                }

                if (uuid != null && uuid != "") {

                    filtros.push(new sap.ui.model.Filter({
                        path: "IUuid",
                        operator: sap.ui.model.FilterOperator.EQ,
                        value1: uuid
                    })
                    );
                }

                if (status != null && status != "") {

                    filtros.push(new sap.ui.model.Filter({
                        path: "IStatus",
                        operator: sap.ui.model.FilterOperator.EQ,
                        value1: uustatusid
                    })
                    );
                }

                if (vLifnr == null || vLifnr == "") {
                    if (startDate == null || startDate == "") {
                        if (uuid == null || uuid == "") {
                            if (status == null || status == "") {
                                bContinue = false;
                            }
                        }
                    }
                }

                if (bContinue) {

                    sap.ui.core.BusyIndicator.show();
                    let that = this;
                    this._GetODataV2("ZOSP_INDASHBOARD_SRV", "HdrInSet", filtros, ["ETLOGFNAV", "ETTLIFNAV", "ETCFDINAV"], "").then(resp => {
                        that.getOwnerComponent().setModel(new JSONModel(resp.data.results[0]), "Incidencias");
                        that.paginate("Incidencias", "/ETLOGFNAV", 1, 0);
                        that.getSegments();
                        sap.ui.core.BusyIndicator.hide();
                    }).catch(error => {
                        console.error(error);
                    });

                }
                else {
                    sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/global.searchFieldsEmpty"));
                }
            }
        },

        goToMainReleases: function () {
            this.handleClose();
        },

        getSegments: function () {
            var oItems = this.getOwnerComponent().getModel("Incidencias").getData();
            var Data = {
                "Segmentos": []
            };

            var string = "Estatus";

            var rbdIndex = this.getView().byId("rbgInc").getSelectedIndex();

            switch (rbdIndex) {
                case 0:
                    string = "Estatus";
                    break;
                case 1:
                    string = "Lifnr";
                    break;
            }

            var groupProvider = this.groupByAuto(oItems.ETLOGFNAV.results, string);

            for (const provider in groupProvider) {
                var obj = {};
                obj.provider = provider;
                obj.value = groupProvider[provider];
                Data.Segmentos.push(obj);
            }

            this.getOwnerComponent().setModel(new JSONModel(Data), "segmentos");
        },
        groupByAuto: function (data, key) {
            var groups = {};
            for (var i in data) {
                if (!groups.hasOwnProperty(data[i][key])) groups[data[i][key]] = [];
                groups[data[i][key]].push(data[i]);
            }
            return groups;
        },

        clearFilters: function () {


        },
        exportTopTen: function () {
            var texts = this.getOwnerComponent().getModel("appTxts");
            var columns = [
                {
                    name: texts.getProperty("/incidencias.supplier"),
                    template: {
                        content: "{Lifnr}"
                    }
                },
                {
                    name: texts.getProperty("/incidencias.supplier"),
                    template: {
                        content: "{Nlifnr}"
                    }
                },
                {
                    name: texts.getProperty("/incidencias.error"),
                    template: {
                        content: "{N1}"
                    }
                },
                {
                    name: texts.getProperty("/incidencias.success"),
                    template: {
                        content: "{N3}"
                    }
                },
            ];
            this.exportxls('Incidencias', '/ETTLIFNAV/results', columns);
        },
        buildExcel: function () {
            var texts = this.getOwnerComponent().getModel("appTxts");
            var columns = [
                {
                    name: texts.getProperty("/incidencias.uuid"),
                    template: {
                        content: "{Uuid}"
                    }
                },
                {
                    name: texts.getProperty("/incidencias.vendor"),
                    template: {
                        content: "{Lifnr}"
                    }
                },
                {
                    name: texts.getProperty("/incidencias.vendor"),
                    template: {
                        content: "{Nlifnr}"
                    }
                },
                {
                    name: texts.getProperty("/incidencias.date"),
                    template: {
                        content: "{Fecha}"
                    }
                },
                {
                    name: texts.getProperty("/incidencias.hour"),
                    template: {
                        content: "{Hora}"
                    }
                },
                {
                    name: texts.getProperty("/incidencias.message"),
                    template: {
                        content: "{Mensaje}"
                    }
                },
                {
                    name: texts.getProperty("/incidencias.desc1"),
                    template: {
                        content: "{Descripcion1}"
                    }
                },
                {
                    name: texts.getProperty("/incidencias.status"),
                    template: {
                        content: "{Estatus}"
                    }
                },
            ];
            this.exportxls('Incidencias', '/ETLOGFNAV/results', columns);
        }
    });
});