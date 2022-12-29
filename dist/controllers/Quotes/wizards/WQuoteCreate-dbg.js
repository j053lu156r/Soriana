sap.ui.define(
  [
    "demo/controllers/BaseController",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "demo/models/formatter",
  ],
  function (Controller, Fragment, JSONModel, MessageBox, formatter) {
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
        transportista: "",
      },
      pedidos: [],
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

        todayDate = todayDate.getTime() + 1000 * 60 * 60 * 24 * 2;
        datepicker.setDateValue(new Date(todayDate));
        datepicker.setMinDate(new Date(todayDate));
        datepicker.fireChange();
      },

      createQuote: function (selectedKey) {
      
        if (!this.hasAccess(31)) {
          return;
        }
        if (this.getConfigModel().getProperty("/supplierInputKey") != null) {
          this.getOwnerComponent().setModel(
            new sap.ui.model.json.JSONModel(),
            "CitaMainData"
          );
          this.getOwnerComponent().setModel(
            new sap.ui.model.json.JSONModel([]),
            "CitaCreationArray"
          );
          //
     
        
          if(selectedKey === 'N'){
       
            this.getOwnerComponent().setModel(
              new sap.ui.model.json.JSONModel({
                lectura: false,
              }),
              "ModelLectura"
            );
          }
          this.getOwnerComponent().setModel(
            new sap.ui.model.json.JSONModel({
              editable: true,
            }),
            "Modeleditable"
          );

          var oView = this.getView();

          var frag = "demo.views.Quotes.wizards.WQuoteCreate";

          this.remissionType = selectedKey;
          let that = this;

          // create Dialog
          if (!this._pDialog) {
            this._pDialog = Fragment.load({
              id: oView.getId(),
              name: frag,
              controller: this,
            }).then(
              function (oDialog) {
                oDialog.attachAfterOpen(this.onDialogAfterOpen, this);
                oView.addDependent(oDialog);
                return oDialog;
              }.bind(this)
            );
          }
          this._pDialog.then(function (oDialog) {
            oDialog.open();

            var Datos = that.getView().getModel("ModelLectura").getData();
           console.log(Datos)
            if(selectedKey === 'N'){
              that.getView().byId("ModCita").setVisible(false);
              that.getView().byId("cancCita").setVisible(false);
               
               }else{
                that.getView().byId("ModCita").setVisible(true)
                that.getView().byId("cancCita").setVisible(true)
               }
            if (!Datos.lectura) {
              that.setInitialDate();
              that.getView().byId("sTipoCita").setSelectedKey("");
              that.getView().byId("sTipoUnidad").setSelectedKey("");
              that.getView().byId("sTipoCita").setEditable(true);
              that.getView().byId("totalpackagesInput").setEditable(true);
              that.getView().byId("platformsInput").setEditable(true);
              that.getView().byId("sTipoUnidad").setEditable(true);
              that.getView().byId("carrierInput").setEditable(true);
              that.getView().byId("DP1").setEditable(true);
              that.getView().byId("totalpackagesInput").setEditable(true);
              that.getView().byId("platformsInput").setEditable(true);
              that.getView().byId("carrierInput").setEditable(true);
            } else {
            
              that.getView().byId("sTipoCita").setSelectedKey(Datos.Tipocita);
              that.getView().byId("sTipoUnidad").setSelectedKey(Datos.Tipounidad);
              that.getView().byId("DP1").setDateValue(new Date(Datos.Fechacita));
              that.getView().byId("totalpackagesInput").setValue(Datos.Bultos);
              that.getView().byId("platformsInput").setValue(Datos.Tarimas);
              that.getView().byId("carrierInput").setValue(Datos.Transportista);


              that.getView().byId("sTipoCita").setEditable(false);
              that.getView().byId("totalpackagesInput").setEditable(false);
              that.getView().byId("platformsInput").setEditable(false);
              that.getView().byId("sTipoUnidad").setEditable(false);
              that.getView().byId("carrierInput").setEditable(false);
              that.getView().byId("DP1").setEditable(false);
              that.getView().byId("totalpackagesInput").setEditable(false);
              that.getView().byId("platformsInput").setEditable(false);
              that.getView().byId("carrierInput").setEditable(false);
            }
          });

        
        } else {
          sap.m.MessageBox.error(
            this.getView()
              .getModel("appTxts")
              .getProperty("/quotes.messageNoSupplier")
          );
        }
      },

      onDialogAfterOpen: function () {
        this._oWizard = this.byId("QuoteCedisWizard");
        this._oWizard._getProgressNavigator().ontap = function () {};
        this.handleButtonsVisibility();
        dataTempModel = new JSONModel(dataTemp);
        this.getView().setModel(dataTempModel, "TemporalModel");
        // dataTempModel.setProperty("/generalData/cedisType", this.getView().byId("rbgOpciones").getSelectedIndex());
        dataTempModel.setProperty(
          "/generalData/tipoCita",
          this.getView().byId("sTipoCita").getSelectedKey()
        );
        dataTempModel.setProperty(
          "/generalData/tipoUnidad",
          this.getView().byId("sTipoUnidad").getSelectedKey()
        );
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
          default:
            break;
        }
      },

      onDialogNextButton: function () {
        this.getView()
          .getModel("TemporalModel")
          .getData().generalData.totalBultos = this.getView()
          .byId("totalpackagesInput")
          .getValue();
        this.getView().getModel("TemporalModel").getData().generalData.tarimas =
          this.getView().byId("platformsInput").getValue();

        this.getView()
          .getModel("TemporalModel")
          .getData().generalData.transportista = this.getView()
          .byId("carrierInput")
          .getValue();

      

        if (this._oWizard.getProgressStep().getValidated()) {
          
          if (this._oWizard.getProgressStep().sButtonText === "Paso 2") {
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
        var Datos = this.getView().getModel("ModelLectura").getData();
      

        if(Datos.lectura){
          this._handleMessageBoxOpen(
            this.getView()
              .getModel("appTxts")
              .getProperty("/quotes.closeButton"),
            "warning"
          );
        }else{
          this._handleMessageBoxOpen(
            this.getView()
              .getModel("appTxts")
              .getProperty("/quotes.discardButton"),
            "warning"
          );
        }
       
      },
      testModelos: function () {
    
      },

      async handleWizardSubmit() {
        sap.m.MessageBox["confirm"](
          this.getView()
            .getModel("appTxts")
            .getProperty("/quotes.submitAppoinment"),
          {
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

           
if (this.getOwnerComponent().getModel("ModelLectura").getData().lectura===true){
var ArrtPos=[];

  for (var x =0;x<this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results.length;x++){
    if (this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Selected){
      ArrtPos.push( {
        "Folio" : this.getOwnerComponent().getModel("ModelLectura").getData().Folio,
        "Ebeln" : this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Ebeln,
        "Ebelp" : this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Ebelp,
        "Matnr" :this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Matnr,
        "Cantidad" : this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Citado,
        "Fechaini" : this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Kdatb,
        "Fechafin" : this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Kdate,
        "Umedida" : this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Meins,
      //  "Peso" : "",
        "Citado" : this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Citado,
       // "PorAgotar" : "",
       /// "Estatus" : ""
      })
    }
   
  }
 var json= {
    "Proveedor": this.getOwnerComponent().getModel("ModelLectura").getData().Proveedor,
    "Action": "2",

    "CTCITASCAB": [
      {
        "Folio" : this.getOwnerComponent().getModel("ModelLectura").getData().Folio,
        "Centro" : this.getOwnerComponent().getModel("ModelLectura").getData().Centro,
        "Fechacita" : appoimentModel[0].FechaCita,
        "Proveedor" : this.getOwnerComponent().getModel("ModelLectura").getData().Proveedor,
        "Tipocita" :Model2.generalData.Tipocita,
        "Tipounidad" : Model2.generalData.tipoUnidad,
        "Transportista" : Model2.generalData.transportista,
        "Bultos" : Model2.generalData.totalBultos,
        "Tarimas" : Model2.generalData.tarimas,
        "HoraIni" : appoimentModel[0].HoraIni,
        "HoraFin" : appoimentModel[0].HoraFin,
        "Anden" :(Number(appoimentModel[0].Anden)+1).toString()
      }
    ],
    "CTCITASDET": ArrtPos,
    "ETRETURN": []
  }
var model = _oDataModelAppoimnet;
var entity = "/" + _oDataEntityAppoiment;
var json2 = JSON.stringify(json);
var that = this;


that._POSToData(model, entity, json2).then(function (_GEToDataV2Response) {
    sap.ui.core.BusyIndicator.hide();

    var response = _GEToDataV2Response.d;


    if (response.Success === "X") {
      sap.m.MessageBox.success(response.Message);
    } else {
      sap.m.MessageBox.error(response.Message);
    }
  });

}else{


                var ArrT = [];
                for (var x = 0; x < this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results.length; x++) {
                  ArrT.push({
                    Ebeln: appoimentModel[x].Ebeln,
                    Ebelp: appoimentModel[x].Ebelp,
                    Matnr: appoimentModel[x].Matnr,
                    Citado: appoimentModel[x].Citado.toLocaleString(),
                    FechaCita: appoimentModel[x].FechaCita,
                    HoraIni: appoimentModel[x].HoraIni,
                    HoraFin: appoimentModel[x].HoraFin,
                    Anden: Number(appoimentModel[x].Anden) + 1,
                    TipoCita: Model2.generalData.tipoCita,
                    Lifnr: Model.supplierInputKey,
                    Bultos: Model2.generalData.totalBultos,
                    Tarimas: Model2.generalData.tarimas,
                    TipoUnidad: Model2.generalData.tipoUnidad,
                    Transportista: Model2.generalData.transportista,
                  });
                }

                let createObjReq = {
                  Proveedor: Model.supplierInputKey.padStart(10, 0),
                  Action: "1",

                  ETCITANUEVA: ArrT,
                  ETRETURN: [],
                };
             
                sap.ui.core.BusyIndicator.show();
                let resp = null;

                var model = _oDataModelAppoimnet;
                var entity = "/" + _oDataEntityAppoiment;
                var json2 = JSON.stringify(createObjReq);
                var that = this;
              

            
}


                  this.getOwnerComponent().setModel(
                    new sap.ui.model.json.JSONModel([]),
                    "ModelLectura"
                  );
                
               
                this.getOwnerComponent().setModel(
                  new sap.ui.model.json.JSONModel([]),
                  "Modeleditable"
                );
              }
            }.bind(this),
          }
        );
      },
      _POSToData: function (model, entity, aData) {
        var oModel2 = "/sap/opu/odata/sap/" + model;
        var that = this;

        return new Promise(function (fnResolve, fnReject) {
          $.ajax({
            url: oModel2 + entity,
            type: "POST",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: aData,
            headers: {
              "X-Requested-With": "X",
            },
            success: function (dataResponse) {
              fnResolve(dataResponse);
            },
            error: function (error, status, err) {
              sap.ui.core.BusyIndicator.hide();
            

              fnReject(new Error(error));
            },
          });
        });
      },

      getToken: function (oModel2) {
        //Consulta
        var id = null;
        $.ajax({
          type: "GET",
          url: "/sap/opu/odata/sap/model/ZOSP_CITAS_ADM_SRV/MainSet$filter=Fechaini eq '20221101' and Fechafin eq '20221130'", //oModel2,

          headers: {
            "X-CSRF-Token": "Fetch",
          },
          contentType: "application/json; charset=utf-8",
          dataType: "json",
          async: false,
          success: function (dataR, textStatus, jqXHR) {
            id = jqXHR.getResponseHeader("X-CSRF-Token");
          },
          error: function (jqXHR, textStatus, errorThrown) {
            id = jqXHR.getResponseHeader("X-CSRF-Token");
          },
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

           

              this.getView().setModel(new JSONModel(), "ModelLectura");
              this.getView().setModel(
                new JSONModel(),
                "tableWizardOrderPosition"
              );
              this.getOwnerComponent().setModel(
                new sap.ui.model.json.JSONModel(),
                "CitaMainData"
              );
              this.getOwnerComponent().setModel(
                new sap.ui.model.json.JSONModel([]),
                "CitaCreationArray"
              );
              _centroSeleccionado = null;
            }
          }.bind(this),
        });
      },

      searchOrders: function (date) {
        let filtros = [];
        let that = this;
        filtros.push(this.buildFiltro("IOption", 7));

        filtros.push(
          that.buildFiltro(
            "ILifnr",
            that.getConfigModel().getProperty("/supplierInputKey")
          )
        );

        filtros.push(that.buildFiltro("IKdatb", date));
        var Datos = that.getView().getModel("ModelLectura").getData();

      
        var PosicionesG = that.getView().getModel("PosicionesG").getData();
       
        sap.ui.core.BusyIndicator.show();
        let ARRTV = [];
        that._GetODataV2(_oDataModelOC, _oDataEntityOC, filtros, ["ETOC"], "").then((resp) => {
            if (Datos.lectura) {
              this.getOwnerComponent().setModel(
                new sap.ui.model.json.JSONModel({
                  editable: false,
                }),
                "Modeleditable"
              );
              for (
                var x = 0;
                x < resp.data.results[0].ETOC.results.length;
                x++
              ) {
                resp.data.results[0].ETOC.results[x].Selected = true;
                for (var y = 0; y < PosicionesG.length; y++) {
                  if (
                    resp.data.results[0].ETOC.results[x].Matnr ===
                      PosicionesG[y].Matnr &&
                    resp.data.results[0].ETOC.results[x].Werks ===
                      PosicionesG[y].Werks
                  ) {
                    resp.data.results[0].ETOC.results[x].Citado =
                      PosicionesG[y].Citado;
                    ARRTV.push(resp.data.results[0].ETOC.results[x]);
                  }
                }
              }
           
              resp.data.results[0].ETOC.results = ARRTV;
            
           
            } else {
              for (
                var x = 0;
                x < resp.data.results[0].ETOC.results.length;
                x++
              ) {
                resp.data.results[0].ETOC.results[x].Selected = false;
              }
            }
            that
              .getOwnerComponent()
              .setModel(new JSONModel(resp.data.results[0]), "Pedidos");
            //
            sap.ui.core.BusyIndicator.hide();
          })
          .catch((error) => {
          
          });
      },

      getDetailOrder: function () {
        var me = this;
        var urlPositions = `/Valida_citasSet?$expand=Po_validas&$filter=IOption eq '1' and IEbeln eq '${this._document}'`;
        this.getView().setModel(new JSONModel(), "tableWizardPo_validas");

        citas1Model.getJsonModelAsync(
          urlPositions,
          function (response) {
      
            var ojbResponse = response.getProperty("/results/0");
           
            if (ojbResponse.ESuccess == "X") {
              var Po_validas = me.getView().getModel("tableWizardPo_validas");
              Po_validas.setProperty("/Oekponav", ojbResponse.Po_validas);
            } else {
              sap.m.MessageBox.error(ojbResponse.EMessage);
            }
          },
          function () {
            sap.m.MessageBox.error("");
          },
          this
        );
      },

      onSelectRBOption: function (oEvent) {
        dataTempModel.setProperty(
          "/generalData/cedisType",
          oEvent.getParameters().selectedIndex
        );
      },

      onChangeSelectTipoCita: function (oEvent) {
        dataTempModel.setProperty(
          "/generalData/tipoCita",
          oEvent.getParameters().selectedItem.getKey()
        );
      

        this.getOwnerComponent()
          .getModel("CitaMainData")
          .setProperty(
            "/TipoCita",
            oEvent.getParameters().selectedItem.getKey()
          );
      },

      onChangeSelectTipoUnidad: function (oEvent) {
        dataTempModel.setProperty(
          "/generalData/tipoUnidad",
          oEvent.getParameters().selectedItem.getKey()
        );
       
      },

      onSelectProductType: function (oEvent) {
        dataTempModel.setProperty(
          "/generalData/tipoProducto",
          oEvent.getParameters().selectedItem.getKey()
        );
       
      },

      selectChange: function (oEvent) {
       
      },

      appointmentDateChange(oEvent) {
        let source = oEvent.getSource();
        let dateSelected = source.getDateValue();
     
        this.setAppoimentCalendar(dateSelected, dateSelected);
        this.getOwnerComponent()
          .getModel("CitaMainData")
          .setProperty("/FechaCita", this.buildSapDate(dateSelected));
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
              sap.m.MessageBox.warning("Favor Guarde la cita abierta");
              return;
            }
          }
        }
        let startHours = oStartDate.getHours();
        oStartDate.setHours(startHours);
        startHours++;
        oEndDate.setHours(startHours);

        var FI = new Date(
          new Date(oStartDate).toISOString().slice(0, 10) +
            " " +
            oData[0].DispIni
        );
        var FF = new Date(
          new Date(oEndDate).toISOString().slice(0, 10) + " " + oData[0].DispFin
        );

        if (
          oStartDate.toLocaleString("en-GB") > FI.toLocaleString("en-GB") &&
          oEndDate.toLocaleString("en-GB").trim() < FF.toLocaleString("en-GB")
        ) {
          oData[oPC.indexOfRow(oRow)].appointments.push({
            start: oStartDate,
            end: oEndDate,
            title: "Entrega " + oStartDate.toISOString().substr(0, 10),
            type: "Type08",
          });
          oModel.setData(oData);
        } else {
          sap.m.MessageBox.warning(
            "El Horario Seleccionado esta fuera del rango Habilitado"
          );
        }

        let creationArray = this.getOwnerComponent()
          .getModel("CitaCreationArray")
          .getData();

        creationArray.forEach((item) => {
          item.FechaCita = oStartDate.toISOString().substr(0, 10);
          item.HoraIni = oStartDate.toTimeString().substr(0, 8);
          item.HoraFin = oEndDate.toTimeString().substr(0, 8);
          item.Anden = oPC.indexOfRow(oRow);
        });

        this.getOwnerComponent()
          .getModel("CitaCreationArray")
          .setData(creationArray);
      },

      handleAppointmentSelect: function (oEvent) {
        var oAppointment = oEvent.getParameter("appointment"),
          sSelected,
          aAppointments,
          sValue;

        if (oAppointment) {
          sSelected = oAppointment.getSelected() ? "selected" : "deselected";
          MessageBox.show(
            "'" +
              oAppointment.getTitle() +
              "' " +
              sSelected +
              ". \n  Cita: " +
              this.byId("appoinmentPC").getSelectedAppointments().length
          );
        } else {
          aAppointments = oEvent.getParameter("appointments");
          sValue = aAppointments.length + " Appointments selected";
          MessageBox.show(sValue);
        }
        oAppointment.setSelected(false);
      },

      selectPedido: async function (oEvent) {
       
        let source = oEvent.getSource();
        let arrayData = oEvent.getParameter("rowContext").getModel().getData();
        let objectClicked = oEvent.getParameter("rowContext").getObject();
        let selectedIndex = oEvent.getParameter("rowIndex");
        let selectedIndices = source.getSelectedIndices();
        let isSelected = selectedIndices.some(
          (index) => index == selectedIndex
        );
      
        if (selectedIndices.length == 0) {
          _centroSeleccionado = null;
        } else if (_centroSeleccionado == null) {
        
          _centroSeleccionado = objectClicked.Werks;
          this.fetchConfigCentro(_centroSeleccionado);
          this.byId("btnAppoimentNext").setVisible(true);
          this.byId("btnAppoimentNext").setEnabled(true);
          this.byId("inputCantidad").setEnabled(true);
        } else if (_centroSeleccionado != objectClicked.Werks) {
          sap.m.MessageBox.warning(
            "Todos los pedidos deben pertencer al mismo centro"
          );
          source.removeSelectionInterval(selectedIndex, selectedIndex);
          return;
        }
      
        //-- habilitar o desabilitar row
        arrayData.ETOC.results.forEach((pedido) => {
          if (
            pedido.Ebeln == objectClicked.Ebeln &&
            pedido.Ean11 == objectClicked.Ean11
          )
          
          pedido.Selected = isSelected;
        });

        source.setFirstVisibleRow(selectedIndex + 2);

        // dando tiempo para que actue el autoscroll y se refleje la funcionalidad (necsario**)
        await new Promise((resolve) => setTimeout(resolve, 100));

        source.setFirstVisibleRow(isSelected ? selectedIndex : 0);

        // -- agregar o borrar del modelo de creacion de cita
        if (isSelected) this.addToCreationArray(objectClicked);
        else this.dropFromCreationArray(objectClicked);

        //-- Re-setting appoimentCalendar
        let creationArray = this.getOwnerComponent()
          .getModel("CitaCreationArray")
          .getData();
        let maxdate = this.findMaxDate(creationArray, arrayData);
        let dateSelected = this.byId("DP1").getDateValue();
        this.setAppoimentCalendar(dateSelected, maxdate);
      },

      findMaxDate(creationArray, arrayData) {
        let tempArray = [];
        arrayData.ETOC.results.forEach((item) => {
          if (
            creationArray.some(
              (obj) => obj.Ebeln == item.Ebeln && obj.Matnr == item.Matnr
            )
          )
            tempArray.push(item);
        });

        let maxDate = new Date();

        tempArray.forEach((item) => {
          let tempDate = new Date(item.Kdate);
          if (maxDate < tempDate) maxDate = tempDate;
        });

        return maxDate;
      },

      captureQuntSummon: function (oEvent) {
        let osource = oEvent.getSource();
        osource.setValueState(sap.ui.core.ValueState.None);
        let matnr = osource.data("matnr");
        let ebeln = osource.data("ebeln");
        let menger = Number(osource.data("menger"));
        let cantidad = Number(oEvent.getParameter("value"));

        if (menger < cantidad) {
          osource.setValueState(sap.ui.core.ValueState.Error);
          osource.setValueStateText("Debe ser menor a la cantidad por agotar");
          _invalidinputs.push(osource.getId());
          this.byId("btnAppoimentNext").setEnabled(_invalidinputs.length == 0);
          return;
        } else {
          let temparray = _invalidinputs.filter((id) => id != osource.getId());
          _invalidinputs = temparray;
        }

        this.byId("btnAppoimentNext").setEnabled(
          _invalidinputs.length == 0 && cantidad > 0
        );

        let creationArray = this.getOwnerComponent()
          .getModel("CitaCreationArray")
          .getData();

        creationArray.forEach((item) => {
          if (item.Matnr == matnr && item.Ebeln == ebeln)
            item.Citado = cantidad;
        });

        this.getOwnerComponent()
          .getModel("CitaCreationArray")
          .setData(creationArray);
      },
      hasOnlyNumbers: function () {
        this.byId("btnAppoimentNext").setEnabled(true);
      },
      addToCreationArray(detalle) {
        let creationArray = this.getOwnerComponent()
          .getModel("CitaCreationArray")
          .getData();
        let mainDataModel = this.getOwnerComponent()
          .getModel("CitaMainData")
          .getData();

        let newdetail = {
          Ebeln: detalle.Ebeln,
          Ebelp: detalle.Ebelp,
          Matnr: detalle.Matnr,
          TipoCita: mainDataModel.TipoCita,
        };

        creationArray.push(newdetail);

        this.getOwnerComponent()
          .getModel("CitaCreationArray")
          .setData(creationArray);
      },

      dropFromCreationArray(detalle) {
        let creationArray = this.getOwnerComponent()
          .getModel("CitaCreationArray")
          .getData();

        let filteredArray = creationArray.filter(
          (item) => item.Matnr != detalle.Matnr && item.Ebeln != detalle.Ebeln
        );

        this.getOwnerComponent()
          .getModel("CitaCreationArray")
          .setData(filteredArray);
      },

      clearModelsOnFilter(oEvent) {
        this.getOwnerComponent().setModel(
          new sap.ui.model.json.JSONModel([]),
          "CitaCreationArray"
        );
        _centroSeleccionado = null;
      },
      convertHora: function (valor) {
        var EJ = valor;
        var Hora = "";
        var min = "";
        var seg = "";
        Hora = EJ.slice(2, 4);
        min = EJ.slice(5, 7);
        seg = EJ.slice(8, 10);

        return Hora + ":" + min + ":" + seg;
      },

      fetchConfigCentro(centro) {
        let filtros = [];

        filtros.push(this.buildFiltro("Action", "3"));
        filtros.push(this.buildFiltro("Centro", centro));

        sap.ui.core.BusyIndicator.show();
        let that = this;

        var model = _oDataModelAppoimnet;
        var entity = _oDataEntityAppoiment;
        var expand = "ETCONFIG";
        var filter = filtros;
        var select = "";

        sap.ui.core.BusyIndicator.show();
        that
          ._GEToDataV2(model, entity, filter, expand, select)
          .then(function (_GEToDataV2Response) {
            sap.ui.core.BusyIndicator.hide();
            var data = _GEToDataV2Response.data.results[0].ETCONFIG.results;
            var N = "";
            var Arrt = [];

            for (var x = 0; x < data.length; x++) {
              data[x].DatoH01 = that.convertHora(data[x].DatoH01);
              data[x].DatoH02 = that.convertHora(data[x].DatoH02);
            }
            for (var x = 0; x < data.length; x++) {
              if (data[x].Func === "ANDENES") {
                N = Number(data[x].Dato1);
              }
            }
            var todayDate = new Date();
            todayDate = todayDate.getTime() + 1000 * 60 * 60 * 24 * 2;

            todayDate = new Date(todayDate).toISOString().slice(0, 10);

            for (var x = 0; x < N - 1; x++) {
              var T1 = x;
              Arrt.push({
                name: data[x].Func + "-" + Number(T1 + 1),
                role: data[x].Func,
                DispIni: data[x].DatoH01,
                DispFin: data[x].DatoH02,
                appointments: [],
              });
            }

         
            var auxJsonModel = new sap.ui.model.json.JSONModel(Arrt);

            that.getOwnerComponent().setModel(auxJsonModel, "Platforms");

            that.GetCitas();
          });
      },

      buildFiltro(path, value) {
        return new sap.ui.model.Filter({
          path: path,
          operator: sap.ui.model.FilterOperator.EQ,
          value1: `${value}`,
        });
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

        filtros.push(
          new sap.ui.model.Filter({
            path: "Action",
            operator: sap.ui.model.FilterOperator.EQ,
            value1: "1",
          })
        );

        filtros.push(
          new sap.ui.model.Filter({
            path: "Proveedor",
            operator: sap.ui.model.FilterOperator.EQ,
            value1: vLifnr,
          })
        );

        if (
          vFolioIni != null &&
          vFolioIni != "" &&
          vFolioFin != null &&
          vFolioFin != ""
        ) {
          filtros.push(
            new sap.ui.model.Filter({
              path: "Folioini",
              operator: sap.ui.model.FilterOperator.EQ,
              value1: vFolioIni,
            })
          );
          filtros.push(
            new sap.ui.model.Filter({
              path: "Foliofin",
              operator: sap.ui.model.FilterOperator.EQ,
              value1: vFolioFin,
            })
          );
        }

        if (
          vIniDate != null &&
          vIniDate != "" &&
          vEndDate != null &&
          vEndDate != ""
        ) {
          filtros.push(
            new sap.ui.model.Filter({
              path: "Fechaini",
              operator: sap.ui.model.FilterOperator.EQ,
              value1: vIniDate,
            })
          );

          filtros.push(
            new sap.ui.model.Filter({
              path: "Fechafin",
              operator: sap.ui.model.FilterOperator.EQ,
              value1: vEndDate,
            })
          );
        }

        var model = "ZOSP_CITAS_ADM_SRV";
        var entity = "MainSet";
        var expand = "CTCITASCAB";
        var filter = filtros;
        var select = "";
        var dataPos = that.getView().getModel("Platforms").getData(); //that.getOwnerComponent().getModel("Platforms").getData();
        sap.ui.core.BusyIndicator.show();
        that
          ._GEToDataV2(model, entity, filter, expand, select)
          .then(function (_GEToDataV2Response) {
            sap.ui.core.BusyIndicator.hide();
           
            var data = _GEToDataV2Response.data.results[0].CTCITASCAB.results;
        

            for (var x = 0; x < data.length; x++) {
              for (var y = 0; y < dataPos.length; y++) {
                if (
                  Number(data[x].Anden) ===
                  Number(dataPos[y].name.split("-")[1].trim())
                ) {
                  dataPos[y].appointments.push({
                    start: new Date(data[x].Fechacita + " " + data[x].HoraIni),
                    end: new Date(data[x].Fechacita + " " + data[x].HoraFin),
                    title: "Descarga  ",
                    type: "Type02",
                    pic: "",
                    tentative: false,
                  });
                }
              }
            }

            var auxJsonModel = new sap.ui.model.json.JSONModel(dataPos);
            that.getOwnerComponent().setModel(auxJsonModel, "Platforms");
          });
      },

      Modificar_Primera_Vista: function () {
        var oModel = this.getView().getModel();
        this._oWizard = this.byId("QuoteCedisWizard");
   
var that=this;
      if(this._oWizard.getProgress()===1){
        that.getView().byId("sTipoCita").setEditable(true);
        that.getView().byId("totalpackagesInput").setEditable(true);
        that.getView().byId("platformsInput").setEditable(true);
        that.getView().byId("sTipoUnidad").setEditable(true);
        that.getView().byId("carrierInput").setEditable(true);
        that.getView().byId("DP1").setEditable(true);
      }
      if(this._oWizard.getProgress()===2){
        this.getOwnerComponent().setModel(
          new sap.ui.model.json.JSONModel({
            editable: true,
          }),
          "Modeleditable"
        );
        let dateSelected = this.byId("DP1").getDateValue();
            this.searchOrders2(this.buildSapDate(dateSelected));
       
      }
      this.handleButtonsVisibility()
      


      },
      searchOrders2: function (date) {
        let filtros = [];
        let that = this;
        filtros.push(this.buildFiltro("IOption", 7));

        filtros.push(
          that.buildFiltro(
            "ILifnr",
            that.getConfigModel().getProperty("/supplierInputKey")
          )
        );

        filtros.push(that.buildFiltro("IKdatb", date));
        var Datos = that.getView().getModel("ModelLectura").getData();
        var dataNL= that.getView().getModel("Pedidos").getData()
      
        var PosicionesG = that.getView().getModel("PosicionesG").getData();
    
        sap.ui.core.BusyIndicator.show();
        let ARRTV = [];
        that._GetODataV2(_oDataModelOC, _oDataEntityOC, filtros, ["ETOC"], "").then((resp) => {
    
              for (var x = 0; x < resp.data.results[0].ETOC.results.length; x++) {
                resp.data.results[0].ETOC.results[x].Selected = false;
              }
              for (var y = 0; y < dataNL.ETOC.results.length; y++) {
                resp.data.results[0].ETOC.results.push(dataNL.ETOC.results[y])
              }
            
            that.getOwnerComponent().setModel(new JSONModel(resp.data.results[0]), "Pedidos");
           
            sap.ui.core.BusyIndicator.hide();
          })
          .catch((error) => {
          
          });
      },

      CancelarCita:function(){
      
        this._oWizard = this.getView().byId("QuoteCedisWizard");

      
        let appoimentModel = this.getOwnerComponent().getModel("CitaCreationArray").getData();
    
        var json= {
          "Proveedor": this.getOwnerComponent().getModel("ModelLectura").getData().Proveedor,
          "Action": "3",
      
          "CTCITASCAB": [
            {
              "Folio" : this.getOwnerComponent().getModel("ModelLectura").getData().Folio,
              "Centro" : this.getOwnerComponent().getModel("ModelLectura").getData().Centro,
              "Fechacita" :  this.getOwnerComponent().getModel("ModelLectura").getData().Fechacita,
              "Proveedor" : this.getOwnerComponent().getModel("ModelLectura").getData().Proveedor,
           
            }
          ],
          "CTCITASDET": [],
          "ETRETURN": []
        }
      var model = _oDataModelAppoimnet;
      var entity = "/" + _oDataEntityAppoiment;
      var json2 = JSON.stringify(json);
      var that = this;
    
      
      that._POSToData(model, entity, json2).then(function (_GEToDataV2Response) {
          sap.ui.core.BusyIndicator.hide();
      
          var response = _GEToDataV2Response.d;
      
      
          if (response.Success === "X") {
            sap.m.MessageBox.success("cita Cancelada correctamente");
          } else {
            sap.m.MessageBox.error(response.ETRETURN.results[0].Message);
          }
        
          that._oWizard.discardProgress(that._oWizard.getSteps()[0]);
          that.byId("wizardDialog").destroy();
          that._pDialog = null;
          that._oWizard = null;

       

          that.getView().setModel(new JSONModel(), "ModelLectura");
          that.getView().setModel(
            new JSONModel(),
            "tableWizardOrderPosition"
          );
          that.getOwnerComponent().setModel(
            new sap.ui.model.json.JSONModel(),
            "CitaMainData"
          );
          that.getOwnerComponent().setModel(
            new sap.ui.model.json.JSONModel([]),
            "CitaCreationArray"
          );
          _centroSeleccionado = null;
          that.searchData();
        });


      },


    
    });
  }
);
