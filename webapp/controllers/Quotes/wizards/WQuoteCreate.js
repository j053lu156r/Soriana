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
    var _centroSeleccionado = null;
    var _invalidinputs = [];

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

                this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(), "CitaMainData");
                this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel([]), "CitaCreationArray");

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
                    oModel.setProperty("/nextButtonVisible", false);
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

                        let appoimentModel = JSON.parse(this.getOwnerComponent().getModel("CitaCreationArray").getJSON());

                        console.log("Cita generada: ", appoimentModel);

                        let createObjReq = {
                            "ETCITANUEVA": [
                                ...appoimentModel
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
                            sap.m.MessageBox.success();
                        }).catch(error => {
                            console.log(error);
                            sap.m.MessageBox.error(error);
                        });

                        this.getView().setModel(new JSONModel(), "tableWizardOrderPosition");
                        this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(), "CitaMainData");
                        this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel([]), "CitaCreationArray");
                        _centroSeleccionado = null;

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
                        this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(), "CitaMainData");
                        this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel([]), "CitaCreationArray");
                        _centroSeleccionado = null;
                    }
                }.bind(this)
            });
        },

        searchOrders: function (date) {

            let filtros = [];

            filtros.push(this.buildFiltro('IOption', 7));

            filtros.push(this.buildFiltro('ILifnr', this.getConfigModel().getProperty("/supplierInputKey")));

            filtros.push(this.buildFiltro('IKdatb', date));

            sap.ui.core.BusyIndicator.show();
            let that = this;
            this._GetODataV2(_oDataModelOC, _oDataEntityOC, filtros, ["ETOC"], "").then(resp => {
                that.getOwnerComponent().setModel(new JSONModel(), "Pedidos");
                resp.data.results[0].ETOC.results.forEach(oc => {
                    oc.Selected = false;
                    oc.MengeR = 10;
                });
                that.getOwnerComponent().setModel(new JSONModel(resp.data.results[0]), "Pedidos");
                // that.paginate("Pedidos", "/ETOC", 1, 0);
                sap.ui.core.BusyIndicator.hide();
            }).catch(error => {
                console.error(error);
            });
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

            this.getOwnerComponent().getModel("CitaMainData").setProperty("/TipoCita", oEvent.getParameters().selectedItem.getKey());
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
            this.setAppoimentCalendar(dateSelected, dateSelected);
            this.getOwnerComponent().getModel("CitaMainData").setProperty("/FechaCita", this.buildSapDate(dateSelected));
        },

        setAppoimentCalendar(dateSelected, maxdate) {
            let planningCalendar = this.getView().byId("appoinmentPC");
            dateSelected.setHours(8, 0);
            planningCalendar.setStartDate(dateSelected);
            planningCalendar.setMinDate(dateSelected);
            planningCalendar.setMaxDate(maxdate);
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
                title: "Entrega " + oStartDate.toISOString().substr(0,10),
                type: "Type08"
            },
                aSelectedRows,
                i;

            oData.platforms.forEach(element => {
                element.appointments = [];
            });

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
            this.getOwnerComponent().getModel("CitaMainData").setProperty("/FechaCita", this.buildSapDate(oStartDate));

            let creationArray = this.getOwnerComponent().getModel("CitaCreationArray").getData();

            creationArray.forEach(item => {
                    item.FechaCita = oStartDate.toISOString().substr(0,10);
                    item.HoraIni = oStartDate.getHours()
                    item.HoraFin = oEndDate.getHours()
                    item.Anden = iIndex
            });

            this.getOwnerComponent().getModel("CitaCreationArray").setData(creationArray);
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

        selectPedido: async function (oEvent) {

            let source = oEvent.getSource();
            let arrayData = oEvent.getParameter("rowContext").getModel().getData();
            let objectClicked = oEvent.getParameter("rowContext").getObject();
            let selectedIndex = oEvent.getParameter("rowIndex");
            let selectedIndices = source.getSelectedIndices();
            let isSelected = selectedIndices.some(index => index == selectedIndex);

            if (selectedIndices.length == 0) {
                _centroSeleccionado = null;
            } else if (_centroSeleccionado == null) {
                _centroSeleccionado = objectClicked.Werks;
                this.fetchConfigCentro(_centroSeleccionado);
                this.byId("btnAppoimentNext").setVisible(true);
                this.byId("btnAppoimentNext").setEnabled(false);
            } else if (_centroSeleccionado != objectClicked.Werks) {
                sap.m.MessageBox.warning('Todos los pedidos deben pertencer al mismo centro');
                source.removeSelectionInterval(selectedIndex, selectedIndex);
                return;
            }

            //-- habilitar o desabilitar row
            arrayData.ETOC.results.forEach(pedido => {
                if (pedido.Ebeln == objectClicked.Ebeln && pedido.Ean11 == objectClicked.Ean11)
                    pedido.Selected = isSelected;
            });

            source.setFirstVisibleRow((selectedIndex + 2));

            // dando tiempo para que actue el autoscroll y se refleje la funcionalidad (necsario**)
            await new Promise(resolve => setTimeout(resolve, 100));

            source.setFirstVisibleRow(isSelected ? selectedIndex : 0);

            // -- agregar o borrar del modelo de creacion de cita
            if (isSelected)
                this.addToCreationArray(objectClicked);
            else
                this.dropFromCreationArray(objectClicked);

            //-- Re-setting appoimentCalendar
            let creationArray = this.getOwnerComponent().getModel("CitaCreationArray").getData();
            let maxdate = this.findMaxDate(creationArray, arrayData);
            let dateSelected = this.byId("DP1").getDateValue();
            this.setAppoimentCalendar(dateSelected, maxdate);
        },

        findMaxDate(creationArray, arrayData) {
            let tempArray = [];
            arrayData.ETOC.results.forEach(item => {
                if (creationArray.some(obj => obj.Ebeln == item.Ebeln && obj.Matnr == item.Matnr))
                    tempArray.push(item);
            });

            let maxDate = new Date();

            tempArray.forEach(item => {
                let tempDate = new Date(item.Kdate);
                if (maxDate < tempDate)
                    maxDate = tempDate;
            })

            return maxDate;
        },

        captureQuntSummon: function (oEvent) {

            //this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(), "CitaMainData");
            let osource = oEvent.getSource();
            osource.setValueState(sap.ui.core.ValueState.None);
            let matnr = osource.data("matnr");
            let ebeln = osource.data("ebeln");
            let menger = osource.data("menger");
            let cantidad = oEvent.getParameter("value");

            if (menger < cantidad) {
                osource.setValueState(sap.ui.core.ValueState.Error);
                osource.setValueStateText("Debe ser menor a la cantidad por agotar");
                _invalidinputs.push(osource.getId());
                this.byId("btnAppoimentNext").setEnabled((_invalidinputs.length == 0));
                return;
            } else {
                let temparray = _invalidinputs.filter(id => id != osource.getId());
                _invalidinputs = temparray;
            }

            this.byId("btnAppoimentNext").setEnabled((_invalidinputs.length == 0) && (cantidad>0));

            let creationArray = this.getOwnerComponent().getModel("CitaCreationArray").getData();

            creationArray.forEach(item => {
                if (item.Matnr == matnr && item.Ebeln == ebeln)
                    item.Citado = cantidad;
            });

            this.getOwnerComponent().getModel("CitaCreationArray").setData(creationArray);

        },

        addToCreationArray(detalle) {
            let creationArray = this.getOwnerComponent().getModel("CitaCreationArray").getData();
            let mainDataModel = this.getOwnerComponent().getModel("CitaMainData").getData();

            let newdetail = {
                "Ebeln": detalle.Ebeln,
                "Ebelp": detalle.Ebelp,
                "Matnr": detalle.Matnr,
                "TipoCita": mainDataModel.TipoCita
            };

            creationArray.push(newdetail);

            this.getOwnerComponent().getModel("CitaCreationArray").setData(creationArray);
        },

        dropFromCreationArray(detalle) {
            let creationArray = this.getOwnerComponent().getModel("CitaCreationArray").getData();

            let filteredArray = creationArray.filter(item => (item.Matnr != detalle.Matnr && item.Ebeln != detalle.Ebeln));

            this.getOwnerComponent().getModel("CitaCreationArray").setData(filteredArray);
        },

        clearModelsOnFilter(oEvent) {
            this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel([]), "CitaCreationArray");
            _centroSeleccionado = null;
        },

        fetchConfigCentro(centro) {

            let filtros = [];

            filtros.push(this.buildFiltro("Action", '3'));
            filtros.push(this.buildFiltro("Centro", centro));

            sap.ui.core.BusyIndicator.show();
            let that = this;
            this._GetODataV2(_oDataModelAppoimnet, _oDataEntityAppoiment, filtros, ["ETCONFIG"], "").then(resp => {
                console.log("Configuracion Centro", resp.data.results[0]);
                // that.getOwnerComponent().setModel(new JSONModel(resp.data.results[0]), "Pedidos");
                // that.paginate("Pedidos", "/ETOC", 1, 0);
                sap.ui.core.BusyIndicator.hide();
            }).catch(error => {
                console.error(error);
            });

        },

        buildFiltro(path, value) {
            return new sap.ui.model.Filter({
                path: path,
                operator: sap.ui.model.FilterOperator.EQ,
                value1: `${value}`
            })
        }
    });
});