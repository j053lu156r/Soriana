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

                
                var url = "HdrInSet?$expand=ETLOGFNAV,ETTLIFNAV,ETCFDINAV&$filter= IOption eq '1'"; // Se debe validar que el usuario este activo

                if (vLifnr != null && vLifnr != "") {
                    url += " and ILifnr eq '" + vLifnr + "'";
                }

                if (startDate != null && startDate != "" && endDate != null && endDate != "") {
                    url += " and ISdate eq '" + startDate + "'"
                    url += " and IFdate eq '" + endDate + "'"
                }

                if (uuid != null && uuid != "") {
                    url += "and IUuid eq '" + uuid + "'";
                }

                if (status != null && status != "") {
                    url += " and IStatus eq '" + status + "'";
                }

                if (vLifnr == null || vLifnr == ""){
                    if(startDate == null || startDate == ""){
                        if (uuid == null || uuid == ""){
                            if(status == null || status == ""){
                                bContinue = false;
                            }
                        }
                    }
                } 
                
                if(bContinue){
                var dueModel = oModel.getJsonModel(url);
                var ojbResponse = dueModel.getProperty("/results/0");
                console.log(dueModel);

                this.getOwnerComponent().setModel(new JSONModel(ojbResponse),
                    "Incidencias");

                this.paginate("Incidencias", "/ETLOGFNAV", 1, 0);

                this.getSegments();
                 }
                  else{
                 sap.m.MessageBox.error("Debe ingresar al menos un criterio de busqueda."); 
                  }    
            }
        },

        goToMainReleases: function () {
            this.handleClose();
        },

        getSegments: function () {
            var  oItems = this.getOwnerComponent().getModel("Incidencias").getData();
            var Data = {
                "Segmentos": []
            };

            var string = "Estatus";

            var rbdIndex = this.getView().byId("rbgInc").getSelectedIndex();

            switch ( rbdIndex){
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
        exportTopTen: function (){
            var texts = this.getOwnerComponent().getModel("appTxts");
            var columns = [
                {
                    name : texts.getProperty("/incidencias.supplier"),
                    template: {
                        content: "{Lifnr}"
                    }
                },
                {
                    name : texts.getProperty("/incidencias.supplier"),
                    template: {
                        content: "{Nlifnr}"
                    }
                },                
                {
                    name : texts.getProperty("/incidencias.error"),
                    template: {
                        content: "{N1}"
                    }
                },
                {
                    name : texts.getProperty("/incidencias.success"),
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
                    name : texts.getProperty("/incidencias.uuid"),
                    template: {
                        content: "{Uuid}"
                    }
                },
                {
                    name : texts.getProperty("/incidencias.vendor"),
                    template: {
                        content: "{Lifnr}"
                    }
                },
                {
                    name : texts.getProperty("/incidencias.vendor"),
                    template: {
                        content: "{Nlifnr}"
                    }
                },
                {
                    name : texts.getProperty("/incidencias.date"),
                    template: {
                        content: "{Fecha}"
                    }
                },
                {
                    name : texts.getProperty("/incidencias.hour"),
                    template: {
                        content: "{Hora}"
                    }
                },
                {
                    name : texts.getProperty("/incidencias.message"),
                    template: {
                        content: "{Mensaje}"
                    }
                },
                {
                    name : texts.getProperty("/incidencias.desc1"),
                    template: {
                        content: "{Descripcion1}"
                    }
                },
                {
                    name : texts.getProperty("/incidencias.status"),
                    template: {
                        content: "{Estatus}"
                    }
                },            
            ];
            this.exportxls('Incidencias', '/ETLOGFNAV/results', columns);
        }
    });
});