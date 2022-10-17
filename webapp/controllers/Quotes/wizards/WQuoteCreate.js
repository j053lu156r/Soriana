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


            todayDate = (todayDate.getTime() + (1000 * 60 * 60 * 24 * 2))
            datepicker.setDateValue(new Date(todayDate));
            datepicker.setMinDate(new Date(todayDate));
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
                console.log(this._oWizard.getProgressStep().sButtonText)
                if(this._oWizard.getProgressStep().sButtonText==='Paso 2'){
                    let dateSelected = this.byId("DP1").getDateValue();
                    this.searchOrders(this.buildSapDate(dateSelected));
                }
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
                    
                        let appoimentModel = this.getOwnerComponent().getModel("CitaCreationArray").getData();
                        var Model = this.getView().getModel("configSite").getData();
                        var Model2 = this.getView().getModel("TemporalModel").getData();


                        //TemporalModel
                        console.log(this.getView().getModel("TemporalModel").getData());

                        let createObjReq = {
                            "Proveedor": Model.supplierInputKey.padStart(10, 0),
                            "Action": "1",

                            "ETCITANUEVA": [
                                {
                                    "Ebeln": appoimentModel[0].Ebeln,
                                    "Ebelp": appoimentModel[0].Ebelp,
                                    "Matnr": appoimentModel[0].Matnr,
                                    "Citado": appoimentModel[0].Citado,
                                    "FechaCita": appoimentModel[0].FechaCita,
                                    "HoraIni": appoimentModel[0].HoraIni,
                                    "HoraFin": appoimentModel[0].HoraFin,
                                    "Anden": Number(appoimentModel[0].Citado) + 1,
                                    "TipoCita": Model2.generalData.tipoCita,
                                }
                            ],
                            "ETRETURN": []
                        };

                        sap.ui.core.BusyIndicator.show();
                        let resp = null;

                        var model = _oDataModelAppoimnet;
                        var entity = "/"+_oDataEntityAppoiment;
                        var json2 = JSON.stringify(createObjReq);
                        var that = this;

                        that._POSToData(model, entity, json2).then(function (_GEToDataV2Response) {
                            sap.ui.core.BusyIndicator.hide();
                       
                            var response = _GEToDataV2Response.d;

console.log(_GEToDataV2Response)
if(response.Success==="X"){
    sap.m.MessageBox.success(response.Message );
}else{
    sap.m.MessageBox.error(response.Message);
}

   


                        });


                        // let headers = {
                        ///   "X-Requested-With": "X",
                        // "Content-Type": "application/json;charset=utf-8",
                        //  "Accept": "application/json, text/javascript, */*;q=0.01"
                    };

                    /*   await this._PostODataV2Async(_oDataModelAppoimnet, _oDataEntityAppoiment, createObjReq, headers).then(response => {
                           resp = response.d;
                           console.log(response)
                           sap.ui.core.BusyIndicator.hide();
                           sap.m.MessageBox.success();
                       }).catch(error => {
                           console.log(error);
                           sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty('/quotes.ErrorService'));
                       });

                       this.getView().setModel(new JSONModel(), "tableWizardOrderPosition");
                       this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(), "CitaMainData");
                       this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel([]), "CitaCreationArray");
                       _centroSeleccionado = null;
                   }*/
                }.bind(this)
            });
        },
        _POSToData: function(model, entity, aData) {
            var oModel2 = "/sap/opu/odata/sap/"+model;
            var that = this;

            console.log(that.getToken(oModel2+entity))
			return new Promise(function(fnResolve, fnReject) {

                $.ajax({
					url: oModel2+entity,
					type: "POST",
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json',
                    data:aData,
                    headers: {
                        "X-CSRF-Token": that.getToken(oModel2+entity)
                    },
					success: function(dataResponse) {
						fnResolve(dataResponse);
					},
					error: function(error, status, err) {
						sap.ui.core.BusyIndicator.hide();
						console.log("error",error)
						/*MessageBox.error(error.responseText.replaceAll("\n",""), {
							icon: MessageBox.Icon.ERROR,
							title: err
						});*/
						fnReject(new Error(error));
					}
				});
			});
		},
        
        getToken: function(oModel2) {
			//Consulta
			var id = null;
			$.ajax({
				type: 'GET',
				url: oModel2,

				headers: {
					"X-CSRF-Token": "Fetch"
				},
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: false,
				success: function(dataR, textStatus, jqXHR) {
					id = jqXHR.getResponseHeader('X-CSRF-Token');
				},
				error: function(jqXHR, textStatus, errorThrown) {
					id = jqXHR.getResponseHeader('X-CSRF-Token');
				}
			});
			return id;
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
                    // oc.MengeR = 10;
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
           // this.searchOrders(this.buildSapDate(dateSelected));
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

        },

        handleIntervalSelect: function (oEvent) {

            var oPC = oEvent.getSource(),
                oStartDate = oEvent.getParameter("startDate"),
                oEndDate = oEvent.getParameter("endDate"),
                oRow = oEvent.getParameter("row"),
                oModel = this.getOwnerComponent().getModel("Platforms"),
                oData = oModel.getData(),
                iIndex = -1;
            for (var x = 0; x < oData.length; x++) {
                for (var y = 0; y < oData[x].appointments.length; y++) {
                    if (oData[x].appointments[y].type === "Type08") {
                        sap.m.MessageBox.warning('Favor Guarde la cita abierta');
                        return
                    }
                }
            }
            let startHours = oStartDate.getHours();
            oStartDate.setHours(startHours);
            startHours++;
            oEndDate.setHours(startHours);

            var FI = new Date(new Date(oStartDate).toISOString().slice(0, 10) + " " + oData[0].DispIni)
            var FF = new Date(new Date(oEndDate).toISOString().slice(0, 10) + " " + oData[0].DispFin)
         
            if (oStartDate.toLocaleString('en-GB') > FI.toLocaleString('en-GB') && oEndDate.toLocaleString().trim('en-GB') < FF.toLocaleString('en-GB')) {
                oData[oPC.indexOfRow(oRow)].appointments.push({
                    start: oStartDate,
                    end: oEndDate,
                    title: "Entrega " + oStartDate.toISOString().substr(0, 10),
                    type: "Type08"
                });
                oModel.setData(oData);
            } else {
                sap.m.MessageBox.warning('El Horario Seleccionado esta fuera del rango Habilitado');
            }


            let creationArray = this.getOwnerComponent().getModel("CitaCreationArray").getData();

            creationArray.forEach(item => {
                item.FechaCita = oStartDate.toISOString().substr(0, 10);
                item.HoraIni = oStartDate.toTimeString().substr(0, 8);
                item.HoraFin = oEndDate.toTimeString().substr(0, 8);
                item.Anden = oPC.indexOfRow(oRow)
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
                MessageBox.show("'" + oAppointment.getTitle() + "' " + sSelected + ". \n  Cita: " + this.byId("appoinmentPC").getSelectedAppointments().length);
            } else {
                aAppointments = oEvent.getParameter("appointments");
                sValue = aAppointments.length + " Appointments selected";
                MessageBox.show(sValue);
            }
            oAppointment.setSelected(false)
        },

        selectPedido: async function (oEvent) {
            console.log(this.getView().getModel("Pedidos"))
            let source = oEvent.getSource();
            let arrayData = oEvent.getParameter("rowContext").getModel().getData();
            let objectClicked = oEvent.getParameter("rowContext").getObject();
            let selectedIndex = oEvent.getParameter("rowIndex");
            let selectedIndices = source.getSelectedIndices();
            let isSelected = selectedIndices.some(index => index == selectedIndex);
            console.log(selectedIndices)
            if (selectedIndices.length == 0) {
                _centroSeleccionado = null;
            } else if (_centroSeleccionado == null) {
                console.log(_centroSeleccionado)
                _centroSeleccionado = objectClicked.Werks;
                this.fetchConfigCentro(_centroSeleccionado);
                this.byId("btnAppoimentNext").setVisible(true);
                this.byId("btnAppoimentNext").setEnabled(false);
                this.byId("inputCantidad").setEnabled(true);
            } else if (_centroSeleccionado != objectClicked.Werks) {

                sap.m.MessageBox.warning('Todos los pedidos deben pertencer al mismo centro');
                source.removeSelectionInterval(selectedIndex, selectedIndex);
                return;
            }
            console.log(arrayData.ETOC.results)
            //-- habilitar o desabilitar row
            arrayData.ETOC.results.forEach(pedido => {
                if (pedido.Ebeln == objectClicked.Ebeln && pedido.Ean11 == objectClicked.Ean11)
                    console.log(isSelected)
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

            this.byId("btnAppoimentNext").setEnabled((_invalidinputs.length == 0) && (cantidad > 0));

            let creationArray = this.getOwnerComponent().getModel("CitaCreationArray").getData();

            creationArray.forEach(item => {
                if (item.Matnr == matnr && item.Ebeln == ebeln)
                    item.Citado = cantidad;
            });

            this.getOwnerComponent().getModel("CitaCreationArray").setData(creationArray);

        },
        hasOnlyNumbers: function () {
            this.byId("btnAppoimentNext").setEnabled(true);
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
        convertHora: function (valor) {
            var EJ = valor;
            var Hora = "";
            var min = "";
            var seg = ""
            Hora = EJ.slice(2, 4)
            min = EJ.slice(5, 7)
            seg = EJ.slice(8, 10)

            return Hora + ":" + min + ":" + seg
        },

        fetchConfigCentro(centro) {

            let filtros = [];

            filtros.push(this.buildFiltro("Action", '3'));
            filtros.push(this.buildFiltro("Centro", centro));

            sap.ui.core.BusyIndicator.show();
            let that = this;

            var model = _oDataModelAppoimnet;
            var entity = _oDataEntityAppoiment;
            var expand = "ETCONFIG";
            var filter = filtros;
            var select = "";

            sap.ui.core.BusyIndicator.show();
            that._GEToDataV2(model, entity, filter, expand, select).then(function (_GEToDataV2Response) {
                sap.ui.core.BusyIndicator.hide();
                var data = _GEToDataV2Response.data.results[0].ETCONFIG.results;
                var N = "";
                var Arrt = [];

                for (var x = 0; x < data.length; x++) {
                    data[x].DatoH01 = that.convertHora(data[x].DatoH01)
                    data[x].DatoH02 = that.convertHora(data[x].DatoH02)

                }
                for (var x = 0; x < data.length; x++) {
                    if (data[x].Func === "ANDENES") {
                        N = Number(data[x].Dato1)
                    }

                }
                var todayDate = new Date()
                todayDate = (todayDate.getTime() + (1000 * 60 * 60 * 24 * 2))

                todayDate = new Date(todayDate).toISOString().slice(0, 10)


                for (var x = 0; x < N - 1; x++) {
                    var T1 = x;
                    Arrt.push({


                        name: data[x].Func + "-" + Number(T1 + 1),
                        role: data[x].Func,
                        DispIni: data[x].DatoH01,
                        DispFin: data[x].DatoH02,
                        appointments: [
                           /* {
                                start: new Date(todayDate + " " + data[x].DatoH01),
                                end: new Date(todayDate + " " + data[x].DatoH02),
                                title: "Meeting with Max",
                                type: "Type02",
                                pic: "sap-icon://sap-ui5",
                                tentative: false
                            },*/
                        ],

                    })

                }

                console.log(Arrt)
                var auxJsonModel = new sap.ui.model.json.JSONModel(Arrt);

                that.getOwnerComponent().setModel(auxJsonModel, "Platforms");

                that.GetCitas();

            });

        },

        buildFiltro(path, value) {
            return new sap.ui.model.Filter({
                path: path,
                operator: sap.ui.model.FilterOperator.EQ,
                value1: `${value}`
            })
        },
        GetCitas: function () {
            let that = this;
            var vLifnr = this.getConfigModel().getProperty("/supplierInputKey");
            var vFolioIni = this.getView().byId("quoteFolioIniInput").getValue();
            var vFolioFin = this.getView().byId("quoteFolioFinInput").getValue();
            var vFechaRegCita = this.getView().byId("quotedateRange");
            //Fechas de entrega
            var vIniDate = this.buildSapDate(vFechaRegCita.getDateValue());
            var vEndDate = this.buildSapDate(vFechaRegCita.getSecondDateValue());
            let filtros = [];

            filtros.push(new sap.ui.model.Filter({
                path: "Action",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: '1'
            })
            );

            filtros.push(new sap.ui.model.Filter({
                path: "Proveedor",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: vLifnr
            })
            );

            if (vFolioIni != null && vFolioIni != ""
                && vFolioFin != null && vFolioFin != "") {
                filtros.push(new sap.ui.model.Filter({
                    path: "Folioini",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: vFolioIni
                })
                );
                filtros.push(new sap.ui.model.Filter({
                    path: "Foliofin",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: vFolioFin
                })
                );
            }

            if (vIniDate != null && vIniDate != ""
                && vEndDate != null && vEndDate != "") {

                filtros.push(new sap.ui.model.Filter({
                    path: "Fechaini",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: vIniDate
                })
                );

                filtros.push(new sap.ui.model.Filter({
                    path: "Fechafin",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: vEndDate
                })
                );
            }

            var model = "ZOSP_CITAS_ADM_SRV";
            var entity = "MainSet";
            var expand = "CTCITASCAB";
            var filter = filtros;
            var select = "";
            var dataPos = that.getView().getModel("Platforms").getData();//that.getOwnerComponent().getModel("Platforms").getData();
            sap.ui.core.BusyIndicator.show();
            that._GEToDataV2(model, entity, filter, expand, select).then(function (_GEToDataV2Response) {
                sap.ui.core.BusyIndicator.hide();
                console.log(_GEToDataV2Response)
                var data = _GEToDataV2Response.data.results[0].CTCITASCAB.results;
                console.log(data)


                for (var x = 0; x < data.length; x++) {
                    for (var y = 0; y < dataPos.length; y++) {
                        if (Number(data[x].Anden) === Number(dataPos[y].name.split("-")[1].trim())) {

                            dataPos[y].appointments.push({
                                start: new Date(data[x].Fechacita + " " + data[x].HoraIni),
                                end: new Date(data[x].Fechacita + " " + data[x].HoraFin),
                                title: "Descarga  ",
                                type: "Type02",
                                pic: "",
                                tentative: false
                            })
                        }

                    }

                }

                var auxJsonModel = new sap.ui.model.json.JSONModel(dataPos);
                that.getOwnerComponent().setModel(auxJsonModel, "Platforms");

            });
        }
    });
});