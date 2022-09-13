sap.ui.define([
    "demo/controllers/BaseController",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    'sap/m/MessageBox',
    "demo/models/formatter"
], function (Controller, Fragment, JSONModel, MessageBox, formatter) {
    "use strict";

    var ordersModel = new this.Pedidostemp();
    var citas1Model = new this.Citas1();
    var dataTempModel = null;
    var dataTemp = {
        generalData: {
            cedisType: "",
            tipoCita: "",
            totalBultos: "",
            tarimas: "",
            tipoUnidad: "",
            tipoProducto: "",
            transportista: ""
        },
        pedidos: []
    };

    var _oDataModelAppoimnet = "ZOSP_CITAS_ADM_SRV";
    var _oDataEntityAppoiment = "MainSet";
    var _oDataModelOC = "ZOSP_DEVO_NC_SRV_01";
    var _oDataEntityOC = "notCreditSet";

    return Controller.extend("demo.controllers.Quotes.wizards.WQuoteCreate", {

        formatter: formatter,

        setInitialDate() {
            let datepicker = this.getView().byId("DP1");
            let todayDate = new Date();
            datepicker.setDateValue(todayDate);
            datepicker.setMinDate(todayDate);
            datepicker.fireChange();
        },

        createQuote: function (selectedKey) {
            if (!this.hasAccess(31)) {
                return
            }
            if (this.getConfigModel().getProperty("/supplierInputKey") != null) {

                var oView = this.getView();

                var frag = "demo.views.Quotes.wizards.WQuoteCreate";

                this.remissionType = selectedKey;
                let that = this;

                // create Dialog
                if (!this._pDialog) {
                    this._pDialog = Fragment.load({
                        id: oView.getId(),
                        name: frag,
                        controller: this
                    }).then(function (oDialog) {
                        oDialog.attachAfterOpen(this.onDialogAfterOpen, this);
                        oView.addDependent(oDialog);
                        return oDialog;
                    }.bind(this));
                }
                this._pDialog.then(function (oDialog) {
                    oDialog.open();
                    that.setInitialDate();
                });
            } else {
                sap.m.MessageBox.error(this.getView().getModel("appTxts").getProperty("/quotes.messageNoSupplier"));
            }
        },

        onDialogAfterOpen: function () {
            this._oWizard = this.byId("QuoteCedisWizard");
            this._oWizard._getProgressNavigator().ontap = function () { };
            this.handleButtonsVisibility();
            dataTempModel = new JSONModel(dataTemp);
            this.getView().setModel(dataTempModel, "TemporalModel");
            // dataTempModel.setProperty("/generalData/cedisType", this.getView().byId("rbgOpciones").getSelectedIndex());
            dataTempModel.setProperty("/generalData/tipoCita", this.getView().byId("sTipoCita").getSelectedKey());
            dataTempModel.setProperty("/generalData/tipoUnidad", this.getView().byId("sTipoUnidad").getSelectedKey());
        },

        handleButtonsVisibility: function () {
            var oModel = this.getView().getModel();
            var remissionType = oModel.getProperty("/selectedPayment");
            switch (this._oWizard.getProgress()) {
                case 1:
                    oModel.setProperty("/nextButtonVisible", true);
                    oModel.setProperty("/backButtonVisible", true);
                    oModel.setProperty("/finishButtonVisible", false);
                    break;
                case 2:
                    oModel.setProperty("/nextButtonVisible", true);
                    oModel.setProperty("/backButtonVisible", true);
                    oModel.setProperty("/finishButtonVisible", false);
                    break;
                case 3:
                    oModel.setProperty("/nextButtonVisible", false);
                    oModel.setProperty("/backButtonVisible", true);
                    oModel.setProperty("/finishButtonVisible", true);
                    break;
                default: break;
            }

        },
        onDialogNextButton: function () {
            if (this._oWizard.getProgressStep().getValidated()) {
                this._oWizard.nextStep();
            }
            this.handleButtonsVisibility();
        },
        onDialogBackButton: function () {
            this._oWizard.previousStep();
            this.handleButtonsVisibility();
        },

        onCloseWizard: function () {
            this._handleMessageBoxOpen(this.getView().getModel("appTxts").getProperty("/quotes.discardButton"), "warning");
        },

        async handleWizardSubmit() {

            sap.m.MessageBox["confirm"](this.getView().getModel("appTxts").getProperty("/quotes.submitAppoinment"), {
                actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                onClose: async function (oAction) {
                    if (oAction === sap.m.MessageBox.Action.YES) {

                        this._oWizard.discardProgress(this._oWizard.getSteps()[0]);
                        this.byId("wizardDialog").destroy();
                        this._pDialog = null;
                        this._oWizard = null;

                        let appoimentModel = JSON.parse(this.getOwnerComponent().getModel("ActionCita").getJSON());

                        console.log("Cita generada: ", appoimentModel);

                        let createObjReq = {
                            "ETCITANUEVA": [
                                appoimentModel
                                // {
                                //           "Ebeln":"0000000099",
                                //           "Ebelp":"00002",
                                //           "Matnr":"000000000000000001",
                                //           "Citado":"12345678.123",
                                //           "FechaCita":"2022-01-31",
                                //           "HoraIni":"01:01:01",
                                //           "HoraFin":"23:59:59",
                                //           "Anden":"1234567890",
                                //           "TipoCita":"aZ"
                                //         }
                            ],
                            "ETRETURN": []
                        };

                        sap.ui.core.BusyIndicator.show();
                        let resp = null;

                        let headers = {
                            "X-Requested-With": "X",
                            "Content-Type": "application/json;charset=utf-8",
                            "Accept": "application/json, text/javascript, */*;q=0.01"
                        };

                        await this._PostODataV2Async(_oDataModelAppoimnet, _oDataEntityAppoiment, createObjReq, headers).then(response => {
                            resp = response.d;
                            sap.ui.core.BusyIndicator.hide();
                        }).catch(error => {
                            console.log(error);
                        });

                        this.getView().setModel(new JSONModel(), "tableWizardOrderPosition");
                        this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(), "ActionCita");

                    }
                }.bind(this)
            });
        },

        _handleMessageBoxOpen: function (sMessage, sMessageBoxType) {
            sap.m.MessageBox[sMessageBoxType](sMessage, {
                actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                onClose: function (oAction) {
                    if (oAction === sap.m.MessageBox.Action.YES) {
                        this._oWizard.discardProgress(this._oWizard.getSteps()[0]);
                        this.byId("wizardDialog").destroy();
                        this._pDialog = null;
                        this._oWizard = null;
                        this.getView().setModel(new JSONModel(), "tableWizardOrderPosition");
                        this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(), "ActionCita");
                    }
                }.bind(this)
            });
        },

        searchOrders: function (date) {

            let filtros = [];

            filtros.push(new sap.ui.model.Filter({
                path: "IOption",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: '7'
            })
            );

            filtros.push(new sap.ui.model.Filter({
                path: "ILifnr",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: this.getConfigModel().getProperty("/supplierInputKey")
            })
            );

            filtros.push(new sap.ui.model.Filter({
                path: "IKdatb",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: `${date}`
            })
            );

            sap.ui.core.BusyIndicator.show();
            let that = this;
            this._GetODataV2(_oDataModelOC, _oDataEntityOC, filtros, ["ETOC"], "").then(resp => {
                console.log(" RESP : ", resp.data.results[0]);
                that.getOwnerComponent().setModel(new JSONModel(resp.data.results[0]), "Pedidos");
                that.paginate("Pedidos", "/ETOC", 1, 0);
                sap.ui.core.BusyIndicator.hide();
            }).catch(error => {
                console.error(error);
            });

            // this._document = this.byId("searchOrder").getValue();
            // this._document.trim();

            // if(this._document != "") {
            //     var url = `/notCreditSet?$expand=OEKKONAV&$filter=IOption eq '4' and ILifnr eq '${this.getConfigModel().getProperty("/supplierInputKey")}'`;
            //     url += ` and IEbeln eq '${this._document}'`;

            //     var dueModel = ordersModel.getJsonModel(url);

            //     if (dueModel != null) {
            //         var ojbResponse = dueModel.getProperty("/results/0");
            //         if (ojbResponse != null) {
            //             if (ojbResponse.ESuccess == "X") {
            //                 this.getDetailOrder();
            //             } else {
            //                 sap.m.MessageBox.error(ojbResponse.EReturn);
            //             }
            //         }
            //     }

            //     this.byId("searchOrder").setValue("");
            // } else {
            //     sap.m.MessageBox.error(this.getView().getModel("appTxts").getProperty("/quotes.messageEmptyOrder"));
            // }
        },

        getDetailOrder: function () {
            var me = this;
            var urlPositions = `/Valida_citasSet?$expand=Po_validas&$filter=IOption eq '1' and IEbeln eq '${this._document}'`;
            this.getView().setModel(new JSONModel(), "tableWizardPo_validas");

            citas1Model.getJsonModelAsync(urlPositions, function (response) {
                console.log(response)
                var ojbResponse = response.getProperty('/results/0');
                console.log(ojbResponse)
                if (ojbResponse.ESuccess == "X") {
                    var Po_validas = me.getView().getModel("tableWizardPo_validas");
                    Po_validas.setProperty('/Oekponav', ojbResponse.Po_validas);
                } else {
                    sap.m.MessageBox.error(ojbResponse.EMessage);
                }
            }, function () {
                sap.m.MessageBox.error("");
            }, this);

            /*
           var dueModel = citas1Model.getJsonModel(urlPositions);
            if (dueModel != null) {
                var ojbResponse = dueModel.getProperty("/results/0");
                if (ojbResponse != null) {
                    if (ojbResponse.ESuccess == "X") {
                        console.log(ojbResponse);
                        console.log(dueModel);
                        var Po_validas = this.getView().getModel("tableWizardPo_validas");
                        console.log(Po_validas);
                        Po_validas.setProperty("/Oekponav", ojbResponse.results[0].Po_validas);
                    } else {
                        sap.m.MessageBox.error(ojbResponse.EMessage);
                    }
                }
            }
            */
        },
        onSelectRBOption: function (oEvent) {
            dataTempModel.setProperty("/generalData/cedisType", oEvent.getParameters().selectedIndex);
        },
        onChangeSelectTipoCita: function (oEvent) {
            dataTempModel.setProperty("/generalData/tipoCita", oEvent.getParameters().selectedItem.getKey());
            console.info(dataTempModel);

            this.getOwnerComponent().getModel("ActionCita").setProperty("/TipoCita", oEvent.getParameters().selectedItem.getKey());
        },
        onChangeSelectTipoUnidad: function (oEvent) {
            dataTempModel.setProperty("/generalData/tipoUnidad", oEvent.getParameters().selectedItem.getKey());
            console.info(dataTempModel)
        },
        onSelectProductType: function (oEvent) {
            dataTempModel.setProperty("/generalData/tipoProducto", oEvent.getParameters().selectedItem.getKey());
            console.info(dataTempModel)
        },
        selectChange: function (oEvent) {
            console.log(oEvent)
        },

        appointmentDateChange(oEvent) {
            let source = oEvent.getSource();
            let dateSelected = source.getDateValue();
            this.searchOrders(this.buildSapDate(dateSelected));
            this.setAppoimentCalendar(dateSelected);
            this.getOwnerComponent().getModel("ActionCita").setProperty("/FechaCita", this.buildSapDate(dateSelected));
        },

        setAppoimentCalendar(dateSelected) {
            let planningCalendar = this.getView().byId("appoinmentPC");
            dateSelected.setHours(8, 0);
            planningCalendar.setStartDate(dateSelected);
            planningCalendar.setMinDate(dateSelected);
            planningCalendar.setMaxDate(dateSelected);
            let incrementedDate = new Date();
            incrementedDate.setHours(10, 0);
            let oModel = new JSONModel();
            oModel.setData({
                platforms: [{
                    pic: "https://avatars.dicebear.com/api/initials/Anden%201.svg",
                    name: "Anden 1",
                    role: "Primer Anden",
                    appointments: [
                        // {
                        //     start: dateSelected,
                        //     end: incrementedDate,
                        //     title: "Coca-Cola",
                        //     info: "Dropping Mundet",
                        //     type: "Type02"
                        // },
                    ],
                },
                {
                    pic: "https://avatars.dicebear.com/api/initials/Anden%202.svg",
                    name: "Anden 2",
                    role: "Segundo Anden",
                    appointments: [
                    //     {
                    //     start: dateSelected,
                    //     end: incrementedDate,
                    //     title: "Pepsi",
                    //     info: "Dropping 7up",
                    //     type: "Type03"
                    // },
                    ],
                },
                {
                    pic: "https://avatars.dicebear.com/api/initials/Anden%203.svg",
                    name: "Anden 3",
                    role: "Tercer Anden",
                    appointments: [
                    //     {
                    //     start: dateSelected,
                    //     end: incrementedDate,
                    //     title: "Topo-Chico",
                    //     info: "Dropping Aguas Minerales",
                    //     type: "Type03"
                    // },
                    ],
                }
                ]
            });
            this.getOwnerComponent().setModel(oModel, "Platforms");
        },

        handleIntervalSelect: function (oEvent) {

            var oPC = oEvent.getSource(),
                oStartDate = oEvent.getParameter("startDate"),
                oEndDate = oEvent.getParameter("endDate"),
                oRow = oEvent.getParameter("row"),
                oModel = this.getOwnerComponent().getModel("Platforms"),
                oData = oModel.getData(),
                iIndex = -1;

            let startHours = oStartDate.getHours();

            oStartDate.setHours(startHours);
            startHours++;
            oEndDate.setHours(startHours);

            let oAppointment = {
                start: oStartDate,
                end: oEndDate,
                title: "Appointment " + oStartDate,
                type: "Type09"
            },
                aSelectedRows,
                i;

            if (oRow) {
                iIndex = oPC.indexOfRow(oRow);
                oData.platforms[iIndex].appointments.push(oAppointment);
            } else {
                aSelectedRows = oPC.getSelectedRows();
                for (i = 0; i < aSelectedRows.length; i++) {
                    iIndex = oPC.indexOfRow(aSelectedRows[i]);
                    oData.platforms[iIndex].appointments.push(oAppointment);
                }
            }

            oModel.setData(oData);
        },

        handleAppointmentSelect: function (oEvent) {
            var oAppointment = oEvent.getParameter("appointment"),
                sSelected,
                aAppointments,
                sValue;

            if (oAppointment) {
                sSelected = oAppointment.getSelected() ? "selected" : "deselected";
                MessageBox.show("'" + oAppointment.getTitle() + "' " + sSelected + ". \n Selected appointments: " + this.byId("appoinmentPC").getSelectedAppointments().length);
            } else {
                aAppointments = oEvent.getParameter("appointments");
                sValue = aAppointments.length + " Appointments selected";
                MessageBox.show(sValue);
            }
            oAppointment.setSelected(false)
        },

        selectPedido: function (oEvent) {
            //this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(), "ActionCita");
            let sourceTable = oEvent.getSource();

            let line = sourceTable._aSelectedPaths[0].split("/").slice(-1).pop()
            console.log("LINE: ", line);

        },

        captureQuntSummon: function (oEvent) {

            //this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(), "ActionCita");

            let osource = oEvent.getSource();
            let matnr = osource.data("matnr");
            let ebeln = osource.data("ebeln");
            let menger = osource.data("menger");
            let cantidad = oEvent.getParameter("value");

            if (menger<cantidad) {
                osource.setValueState(sap.ui.core.ValueState.Error);
                osource.setValueStateText("Debe ser menor a la cantidad por agotar");
                // return;
            }

            let actionModel = this.getOwnerComponent().getModel("ActionCita");

            actionModel.setProperty("/Ebeln", ebeln);
            actionModel.setProperty("/Matnr", matnr);
            actionModel.setProperty("/Citado", cantidad);

            console.log("oEvent Source : ", osource);

        }
    });
});