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
                    //  this.getData();
                    // this.generaGrafica();
                }
            }, this);
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("masterIncidencias").attachMatched(this._onRouteMatched, this);
        },
        _onRouteMatched: function (oEvent) {
			this.clearData();
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
            var groupProvider = this.groupBySum(oItems.ETTLIFNAV.results);
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

        groupBySum: function(data){
            var obj = {}, sumN1 = 0, sumN3 = 0;
            for (var i in data){
                sumN1 += parseInt(data[i].N1,10);
                sumN3 += parseInt(data[i].N3,10);
            }
            obj.Aprobado = sumN3;
            obj.Incidencias = sumN1;
            return obj;
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
            var data = this.getOwnerComponent().getModel("Incidencias").getProperty("/ETLOGFNAV/results");
            var columns = [
                {
                    label: texts.getProperty("/incidencias.uuid"),
                    property: "Uuid"
                },
                {
                    label: texts.getProperty("/incidencias.vendor"),
                    property: "Lifnr"
                },
                {
                    label: texts.getProperty("/incidencias.vendorName"),
                    property: "Nlifnr"
                },
                {
                    label: texts.getProperty("/incidencias.date"),
                    property: "Fecha"
                },
                {
                    label: texts.getProperty("/incidencias.hour"),
                    property: "Hora"
                },
                {
                    label: texts.getProperty("/incidencias.messageN"),
                    property: "Mensaje"
                },
                {
                    label: texts.getProperty("/incidencias.message"),
                    property: "Descripcion1"
                },
                {
                    label: texts.getProperty("/incidencias.status"),
                    property: "Estatus"
                },
            ];
            this.buildExcelSpreadSheet(columns, data, "Incidencias.xlsx")
        },
        clearData: function(){
            var incModel = this.getOwnerComponent().getModel("Incidencias");
            var segModel = this.getOwnerComponent().getModel("segmentos");
            var dateRange = this.getView().byId("dateRange");
            if(incModel !== undefined){
                incModel.setProperty("/ENfacr", 0);
                incModel.setProperty("/ENtr", 0);
                incModel.setProperty("/EN3", 0);
                incModel.setProperty("/EN2", 0);
                incModel.setProperty("/EN1", 0);
                incModel.setProperty("/ETTLIFNAV/results", []);
                segModel.setProperty("/Segmentos", {});
                dateRange.setValue(null);
            }
        }
    });
});