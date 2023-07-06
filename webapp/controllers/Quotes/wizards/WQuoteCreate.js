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
    var Posicion = "";
    var DataDocument = false;
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
    var _oDataModelOC = "ZOSP_PO_CITAS_SRV";
    var _oDataEntityOC = "CitasPOSet";
    var _centroSeleccionado = null;
    var _invalidinputs = [];

    return Controller.extend("demo.controllers.Quotes.wizards.WQuoteCreate", {
      formatter: formatter,

      setInitialDate() {
        let datepicker = this.getView().byId("DP1");
        let todayDate = new Date();

        todayDate = todayDate.getTime() + 1000 * 60 * 60 * 24 * 1;
        datepicker.setDateValue(new Date(todayDate));
        datepicker.setMinDate(new Date(todayDate));
        datepicker.fireChange();
        this.setInitialDateAuditoria();
      },
      setInitialDateAuditoria() {
        let datepicker = this.getView().byId("DP2");
        let todayDate = new Date();

        todayDate = todayDate.getTime() + 1000 * 60 * 60 * 24 * 1;
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

          if (selectedKey === "N") {
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

          // this.remissionType = selectedKey;
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

            var Datos = selectedKey;



            if (selectedKey === "N") {

              that.getView().byId("ModCita").setVisible(false);
              that.getView().byId("cancCita").setVisible(false);
            } else {
              that.getView().byId("ModCita").setVisible(true);
              that.getView().byId("cancCita").setVisible(true);
            }

            if (!Datos.lectura) {

              that.getView().byId("wizardDialog").setTitle(that.getView().getModel("appTxts").getProperty("/quotes.createNewQuote"));
              that.setInitialDate();
              that.getView().byId("sTipoCita").setSelectedKey("");
              that.getView().byId("sTipoUnidad").setSelectedKey("");
              that.getView().byId("sTipoCita").setEditable(true);
              that.getView().byId("sOrdenes").setEditable(true);
              that.getView().byId("totalpackagesInput").setEditable(true);
              that.getView().byId("platformsInput").setEditable(true);
              that.getView().byId("sTipoUnidad").setEditable(true);
              that.getView().byId("carrierInput").setEditable(true);
              that.getView().byId("DP1").setEditable(true);
              that.getView().byId("totalpackagesInput").setEditable(true);
              that.getView().byId("platformsInput").setEditable(true);
              that.getView().byId("carrierInput").setEditable(true);
            } else {
console.log(Datos)


              that.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(Datos), "ModelLectura");
              that.getView().byId("wizardDialog").setTitle(that.getView().getModel("appTxts").getProperty("/quotes.editNewQuote"));
              that.getView().byId("sTipoCita").setSelectedKey(Datos.Tipocita);
              that.getView().byId("sOrdenes").setSelectedKey(Datos.Centro);


              that.getView().byId("sTipoUnidad").setSelectedKey(Datos.Tipounidad);
              that.getView().byId("DP1").setDateValue(new Date((Datos.Fechacita).replaceAll("-", ",")));

              that.getView().byId("totalpackagesInput").setValue(Datos.Bultos);
              that.getView().byId("platformsInput").setValue(Number(Datos.Tarimas));
              that.getView().byId("carrierInput").setValue(Datos.Transportista);

              if (Datos.Tipocita === "01" || Datos.Tipocita === "02" && Datos.Fechacita !== null) {

                that.getView().byId("DP2").setDateValue(new Date((Datos.Fechacita).replaceAll("-", ",")));
              }

              that.getView().byId("sTipoCita").setEditable(false);
              that.getView().byId("sOrdenes").setEditable(false);
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
            this.getView().getModel("appTxts").getProperty("/quotes.messageNoSupplier")
          );
        }
      },


      onDialogAfterOpen: function () {
        this._oWizard = this.byId("QuoteCedisWizard");
        this._oWizard._getProgressNavigator().ontap = function () { };
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

        if (
          this.getView().byId("sTipoCita").getSelectedKey() === "01" ||
          this.getView().byId("sTipoCita").getSelectedKey() === "02"
        ) {
          this.getView().byId("txtDP2").setVisible(true);
          this.getView().byId("DP2").setVisible(true);
        } else {
          this.getView().byId("txtDP2").setVisible(false);
          this.getView().byId("DP2").setVisible(false);
        }


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
          default:
            break;
        }
      },

      onDialogNextButton: function () {
        if (
          this.getView().byId("platformsInput").getValue() === "" &&
          this.getView().byId("sTipoCita").getSelectedKey() === "01"
        ) {
          MessageBox.warning("Cantidad de Tarimas es Obligatorio");
          return;
        }
        if (
          this.getView().byId("sTipoUnidad").getSelectedKey() === ""   ) {
          MessageBox.warning("Tipo de unidad es Obligatorio");
          return;
        }

        this.getView().getModel("TemporalModel").getData().generalData.totalBultos = this.getView().byId("totalpackagesInput").getValue();
        this.getView().getModel("TemporalModel").getData().generalData.tarimas = this.getView().byId("platformsInput").getValue();

        this.getView().getModel("TemporalModel").getData().generalData.transportista = this.getView().byId("carrierInput").getValue();

        if (this._oWizard.getProgressStep().getValidated()) {
          if (this._oWizard.getProgressStep().sButtonText === "Paso 2") {
            let dateSelected = this.byId("DP1").getDateValue();
            this.searchOrders(this.buildSapDate(dateSelected));
          }
          if (this._oWizard.getProgressStep().sButtonText === "Paso 3") {
            

            if (this.getView().byId("tableWizardOrder").getSelectedIndices().length === 0) {
              MessageBox.warning("No Existen Posiciones Seleccionadas");
              return;

            } else {
             
              if(this.getView().byId("fileUploader").getValue()===""){
                DataDocument=false
              }else{
                DataDocument=true
              }
              console.log(DataDocument)
              if (this.getView().byId("sTipoCita").getSelectedKey() === "01") {
                var flag = false
                for (var x = 0; x < this.getView().byId("tableWizardOrder").getSelectedIndices().length; x++) {

                  if (this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[this.getView().byId("tableWizardOrder").getSelectedIndices()[x]].Tarima.length === 0) {
                    MessageBox.alert("La posicion tienda " + this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[this.getView().byId("tableWizardOrder").getSelectedIndices()[x]].ZWerks + " no tiene tarima Ingresada")
                    return
                  }
                }
              }
              /*else{
                this.GetCitas();
              }*/



            }


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
        
        var Datos = this.getOwnerComponent().getModel("ModelLectura").getData();
       
      
        if (!Datos.lectura) {
          this._handleMessageBoxOpen(
            this.getView()
              .getModel("appTxts")
              .getProperty("/quotes.discardButton"),
            "warning"
          );
        } else {
          this._handleMessageBoxOpen(
            this.getView()
              .getModel("appTxts")
              .getProperty("/quotes.closeButton"),
            "warning"
          );
        }
      },
      testModelos: function () { },

      async handleWizardSubmit() {
        sap.m.MessageBox["confirm"](
          this.getView().getModel("appTxts").getProperty("/quotes.submitAppoinment"),
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
                var Model3 = this.getView().getModel("Platforms").getData();
                var Datos = this.getOwnerComponent().getModel("ModelLectura").getData();

     
                if (this.getOwnerComponent().getModel("ModelLectura").getData().lectura === true) {
                  var ArrtPos = [];

                  for (var x = 0; x < this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results.length; x++) {
                    if (this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Selected) {
                      if(Model2.generalData.tipoCita==="01"){
                        for(var pos of this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Tarima){
                        pos.Menge=pos.Menge.toString()
                        }
                     
                        ArrtPos.push({
                          Abeln: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Abeln,
                          Abelp: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Abelp,
                          Bednr: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Bednr,
                          Bwart: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Bwart,
                          Ean11: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Ean11,
                          Ebeln: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Ebeln,
                          Ebelp: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Ebelp,
                          Kdatb: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Kdatb+"T00:00:00",
                          Kdate: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Kdate+"T00:00:00",
                          Lifnr: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Lifnr,
                          Matnr: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Matnr,
                          Meins: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Meins,
                          Menge: (this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Menge).toString(),
                          MengeA: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].MengeA,
                          MengeR: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].MengeR,
                          Werks: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Werks,
                          ETOCSTOPALLDET: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Tarima,
                        });

                      }else if(Model2.generalData.tipoCita==="02"){
                    
                        ArrtPos.push({
                          Abeln: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Abeln,
                          Abelp: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Abelp,
                          Bednr: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Bednr,
                          Bwart: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Bwart,
                          Ean11: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Ean11,
                          Ebeln: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Ebeln,
                          Ebelp: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Ebelp,
                          Kdatb: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Kdatb+"T00:00:00",
                          Kdate: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Kdate+"T00:00:00",
                          Lifnr: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Lifnr,
                          Matnr: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Matnr,
                          Meins: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Meins,
                          Menge: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Menge,
                          MengeA: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].MengeA,
                          MengeR: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].MengeR,
                          Werks: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].ZwerksD ,
                        
                        });
                      }else{
                    
                      ArrtPos.push({
                        
                        Folio: this.getOwnerComponent().getModel("ModelLectura").getData().Folio,
                        Ebeln: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Ebeln,
                        Ebelp: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Ebelp,
                        Matnr: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Matnr,
                        Cantidad: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Citado,
                        Fechaini: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Kdatb,
                        Fechafin: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Kdate,
                        Umedida: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Meins,
                        Citado: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Citado,
                      });
                    }
                    }
                  }
                  var json = []
                  if (appoimentModel[0].Anden !== undefined && appoimentModel[0].Anden !== null) {
                   
                    json = {
                      Proveedor: this.getOwnerComponent().getModel("ModelLectura").getData().Proveedor,
                      Action: "2",

                      CTCITASCAB: [
                        {
                          Folio: this.getOwnerComponent().getModel("ModelLectura").getData().Folio,
                          Centro: this.getOwnerComponent().getModel("ModelLectura").getData().Centro,
                          Fechacita: appoimentModel[0].FechaCita,
                          FechaAud: appoimentModel[0].FechaAud,
                          Proveedor: this.getOwnerComponent().getModel("ModelLectura").getData().Proveedor,
                          Tipocita: Model2.generalData.tipoCita,
                          Tipounidad: Model2.generalData.tipoUnidad,
                          Transportista: Model2.generalData.transportista,
                          Bultos: Model2.generalData.totalBultos,
                          Tarimas: Model2.generalData.tarimas,
                          HoraIni: appoimentModel[0].HoraIni,
                          HoraFin: appoimentModel[0].HoraFin,
                          Anden: Model3[Number(appoimentModel[0].Anden)].name,
                        },
                      ],

                      CTCITASDET: ArrtPos,
                      ETRETURN: [],
                    };
                   
                  } else {
                  
                    json = {
                      Proveedor: this.getOwnerComponent().getModel("ModelLectura").getData().Proveedor,
                      Action: "2",


                      CTCITASCAB: [
                        {
                          Folio: this.getOwnerComponent().getModel("ModelLectura").getData().Folio,
                          Centro: this.getOwnerComponent().getModel("ModelLectura").getData().Centro,
                          Fechacita: this.getOwnerComponent().getModel("ModelLectura").getData().Fechacita,
                          FechaAud: this.getOwnerComponent().getModel("ModelLectura").getData().FechaAud,
                          Proveedor: this.getOwnerComponent().getModel("ModelLectura").getData().Proveedor,
                        
                          Tipounidad: Model2.generalData.tipoUnidad,
                          Transportista: Model2.generalData.transportista,
                          Bultos: Model2.generalData.totalBultos,
                          Tarimas: Model2.generalData.tarimas,
                          HoraIni: this.getOwnerComponent().getModel("ModelLectura").getData().HoraIni,
                          HoraFin: this.getOwnerComponent().getModel("ModelLectura").getData().HoraFin,
                          Anden: this.getOwnerComponent().getModel("ModelLectura").getData().Anden,
                          Tipocita: Model2.generalData.tipoCita,
                        },
                      ],
                      CTCITASDET: ArrtPos,
                      ETRETURN: [],
                    };
                  
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
                
                } else {
                  var ArrT = [];
                  var ArrTCN = [];
                  if (Model2.generalData.tipoCita === "02") {
                    for (var x = 0; x < this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results.length; x++) {
                      if (this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Selected) {
                        for (var y = 0; y < this.getOwnerComponent().getModel("Pedidos").getData().ETMINIFULL03.results.length; y++) {
                          if (
                            this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Abeln === this.getOwnerComponent().getModel("Pedidos").getData().ETMINIFULL03.results[y].Zabeln &&
                            this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].ZwerksD === this.getOwnerComponent().getModel("Pedidos").getData().ETMINIFULL03.results[y].ZwerksD &&
                            this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Abelp === this.getOwnerComponent().getModel("Pedidos").getData().ETMINIFULL03.results[y].Zabelp
                          ) {

                            ArrT.push({
                              Zabeln: this.getOwnerComponent().getModel("Pedidos").getData().ETMINIFULL03.results[y].Zabeln.trim(),
                              Zabelp: this.getOwnerComponent().getModel("Pedidos").getData().ETMINIFULL03.results[y].Zabelp.trim(),
                              Zmatnr: this.getOwnerComponent().getModel("Pedidos").getData().ETMINIFULL03.results[y].Zmatnr.trim(),
                              ZwerksD: this.getOwnerComponent().getModel("Pedidos").getData().ETMINIFULL03.results[y].ZwerksD.trim(),
                              Zpmngu: this.getOwnerComponent().getModel("Pedidos").getData().ETMINIFULL03.results[y].Zpmngu.trim(),
                              Zaufme: this.getOwnerComponent().getModel("Pedidos").getData().ETMINIFULL03.results[y].Zceqfu.trim(),
                              Zceqfu: this.getOwnerComponent().getModel("Pedidos").getData().ETMINIFULL03.results[y].Zceqfu.trim(),
                              Zueqfu: this.getOwnerComponent().getModel("Pedidos").getData().ETMINIFULL03.results[y].Zueqfu.trim(),
                              Zceqfp: this.getOwnerComponent().getModel("Pedidos").getData().ETMINIFULL03.results[y].Zceqfp.trim(),
                              Zaufpf: this.getOwnerComponent().getModel("Pedidos").getData().ETMINIFULL03.results[y].Zaufpf.trim(),
                              Zcpemf: this.getOwnerComponent().getModel("Pedidos").getData().ETMINIFULL03.results[y].Zcpemf.trim(),
                              Zupemf: this.getOwnerComponent().getModel("Pedidos").getData().ETMINIFULL03.results[y].Zupemf.trim(),
                              Zcpemp: this.getOwnerComponent().getModel("Pedidos").getData().ETMINIFULL03.results[y].Zcpemp.trim(),
                              Zaufmp: this.getOwnerComponent().getModel("Pedidos").getData().ETMINIFULL03.results[y].Zaufmp.trim(),
                              Zcjpic: this.getOwnerComponent().getModel("Pedidos").getData().ETMINIFULL03.results[y].Zcjpic.trim(),
                              Zuncom: this.getOwnerComponent().getModel("Pedidos").getData().ETMINIFULL03.results[y].Zuncom.trim(),
                            });
                          }
                        }
                      }
                    }
                       
                    for (var x = 0; x < appoimentModel.length; x++) {
                      
                      ArrTCN.push({
                        Ebeln: appoimentModel[x].Ebeln,
                        Ebelp: appoimentModel[x].Ebelp,
                        Matnr: appoimentModel[x].Matnr,
                        Citado: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Citado, //appoimentModel[x].Citado.toLocaleString(),
                        FechaCita: appoimentModel[x].FechaCita,
                        HoraIni: appoimentModel[x].HoraIni,
                        HoraFin: appoimentModel[x].HoraFin,
                        Anden: Model3[Number(appoimentModel[0].Anden)].name,
                        TipoCita: Model2.generalData.tipoCita,
                        Lifnr: Model.supplierInputKey,
                        Bultos: Model2.generalData.totalBultos,
                        Tarimas: Model2.generalData.tarimas,
                        TipoUnidad: Model2.generalData.tipoUnidad,
                        Transportista: Model2.generalData.transportista,
                      });
                    }
                  } else if (Model2.generalData.tipoCita === "01") {



                    for (var x = 0; x < this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results.length; x++) {
                      if (this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Selected) {
                        //  ArrT=this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Tarima;
                        ArrT.push({
                          Abeln: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].ZAbeln,
                          Abelp: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].ZAbelp,
                          Bednr: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].ZBednr,
                          Bwart: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].ZBwart,
                          Ean11: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].ZEan11,
                          Ebeln: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].ZEbeln,
                          Ebelp: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].ZEbelp,
                          Kdatb: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].ZKdatb,
                          Kdate: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].ZKdate,
                          Lifnr: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].ZLifnr,
                          Matnr: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].ZMatnr,
                          Meins: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].ZMeins,
                          Menge: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].ZMenge,
                          MengeA: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].ZMengeA,
                          MengeR: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].ZMengeR,
                          Werks: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].ZWerks,
                          ETOCSTOPALL: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Tarima,
                        });

                      }
                    }

                    for (var x = 0; x < appoimentModel.length; x++) {
                      ArrTCN.push({
                        Ebeln: appoimentModel[x].Ebeln,
                        Ebelp: appoimentModel[x].Ebelp,
                        Matnr: appoimentModel[x].Matnr,
                        Citado: this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Citado, //appoimentModel[x].Citado.toLocaleString(),
                        FechaCita: appoimentModel[x].FechaCita,
                        HoraIni: appoimentModel[x].HoraIni,
                        HoraFin: appoimentModel[x].HoraFin,
                        Anden: Model3[Number(appoimentModel[0].Anden)].name,
                        TipoCita: Model2.generalData.tipoCita,
                        Lifnr: Model.supplierInputKey,
                        Bultos: Model2.generalData.totalBultos,
                        Tarimas: Model2.generalData.tarimas,
                        TipoUnidad: Model2.generalData.tipoUnidad,
                        Transportista: Model2.generalData.transportista,
                      });
                    }


                  } else {
                
                    console.log(appoimentModel)
                    console.log(this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results)
                    console.log(DataDocument)
                    for (var x = 0; x < appoimentModel.length; x++) {
                   
                   //   appoimentModel[x].Citado =1,400;

                  
let citado=""
//if(this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Citado!== undefined){
if(DataDocument===false){
  if(appoimentModel[x].Citado.toLocaleString().includes(',')){
    citado=appoimentModel[x].Citado.toLocaleString()
    citado=citado.replace(",", "")
  }else{
    citado=appoimentModel[x].Citado.toLocaleString()
  }
}else{
  if(this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Citado.toLocaleString().includes(',')){
    citado=this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Citado.toLocaleString()
    citado=citado.replace(",", "")
  }else{
    citado=this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[x].Citado.toLocaleString()
  }
}

                   
                 
                      ArrTCN.push({
                        Ebeln: appoimentModel[x].Ebeln,
                        Ebelp: appoimentModel[x].Ebelp,
                        Matnr: appoimentModel[x].Matnr,
                        Citado: citado,
                        FechaCita: appoimentModel[x].FechaCita,
                        HoraIni: appoimentModel[x].HoraIni,
                        HoraFin: appoimentModel[x].HoraFin,
                        Anden: Model3[Number(appoimentModel[0].Anden)].name,
                        TipoCita: Model2.generalData.tipoCita,
                        Lifnr: Model.supplierInputKey,
                        Bultos: Model2.generalData.totalBultos,
                        Tarimas: Model2.generalData.tarimas,
                        TipoUnidad: Model2.generalData.tipoUnidad,
                        Transportista: Model2.generalData.transportista,
                      });
                 //   }
                    }
                  }
                  let createObjReq;


                  if (ArrTCN.length === 0) {
                    MessageBox.alert("error al crear la cabecera es vacio")
                    return
                  }


                  if (Model2.generalData.tipoCita === "01") {

                    createObjReq = {
                      Proveedor: Model.supplierInputKey.padStart(10, 0),
                      Action: "1",
                      ETOCSTO: ArrT,
                      ETCITANUEVA: ArrTCN,
                      //ETMINIFULL03: ArrT,
                      ETRETURN: [],
                    };
                  } else {

                    createObjReq = {
                      Proveedor: Model.supplierInputKey.padStart(10, 0),
                      Action: "1",
                      ETCITANUEVA: ArrTCN,
                      ETMINIFULL03: ArrT,
                      ETRETURN: [],
                    };
                  }


                  sap.ui.core.BusyIndicator.show();
                  let resp = null;



                  var model = _oDataModelAppoimnet;
                  var entity = "/" + _oDataEntityAppoiment;
                  var json2 = JSON.stringify(createObjReq);
                  var that = this;
                  that._POSToData(model, entity, json2).then(function (_GEToDataV2Response) {
                    sap.ui.core.BusyIndicator.hide();

                    var response = _GEToDataV2Response.d;

                    if (response.Success === "X") {
                      sap.m.MessageBox.success(response.Message);
                    } else {
                      sap.m.MessageBox.error(response.ETRETURN.results[0].Message);
                    }
                    /*var Datos = this.getView().getModel("ModelLectura").getData();
                    var auxJsonModel = new sap.ui.model.json.JSONModel([]);
            
                    that.getOwnerComponent().setModel(auxJsonModel, "Platforms");*/
                  });
                }
                that.getOwnerComponent().setModel(
                  new sap.ui.model.json.JSONModel([]),
                  "ModelLectura"
                );

                that.getOwnerComponent().setModel(
                  new sap.ui.model.json.JSONModel([]),
                  "Modeleditable"
                );
                that.getOwnerComponent().setModel(
                  new sap.ui.model.json.JSONModel([]),
                  "Platforms"
                );
                _centroSeleccionado = null;
                that.searchData();
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

      _handleMessageBoxOpen: function (sMessage, sMessageBoxType) {
        sap.m.MessageBox[sMessageBoxType](sMessage, {
          actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
          onClose: function (oAction) {
            if (oAction === sap.m.MessageBox.Action.YES) {
              var auxJsonModel = new sap.ui.model.json.JSONModel([]);
              this.getView().byId("tableWizardOrder").setEnableSelectAll(false)
              this.getOwnerComponent().setModel(auxJsonModel, "Platforms");
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
                new sap.ui.model.json.JSONModel([]),
                "CitaMainData"
              );
              this.getOwnerComponent().setModel(
                new sap.ui.model.json.JSONModel([]),
                "CitaCreationArray"
              );
              this.getOwnerComponent().setModel(
                new sap.ui.model.json.JSONModel([]),
                "Pedidos"
              );
              this.getOwnerComponent().setModel(
                new sap.ui.model.json.JSONModel([]),
                "Platforms"
              );
             // DataDocument=false;
              _centroSeleccionado = null;
            }
          }.bind(this),
        });
      },

      searchOrders: function (date) {
        let filtros = [];
        let that = this;

        filtros.push(
          this.buildFiltro(
            "IOption",
            that.getView().byId("sTipoCita").getSelectedKey()
          )
        );

        filtros.push(
          that.buildFiltro(
            "ILifnr",
            that.getConfigModel().getProperty("/supplierInputKey")
          )
        );
        

        filtros.push(
          that.buildFiltro(
            "Iwerks",
            that.getView().byId("sOrdenes").getSelectedKey()
          )
        );
        filtros.push(that.buildFiltro("IKdatb", date));
        var Datos = that.getOwnerComponent().getModel("ModelLectura").getData();


        if (that.getView().getModel("PosicionesG") === undefined) {
          var PosicionesG = [];
        } else {
          var PosicionesG = that.getView().getModel("PosicionesG").getData();
        }


        sap.ui.core.BusyIndicator.show();
        let ARRTV = [];
        that._GetODataV2(_oDataModelOC, _oDataEntityOC, filtros, ["ETOC", "ETMINIFULL03", "ETOCSTO"], "").then((resp) => {
          that.getView().byId("tableWizardOrder").clearSelection();

          let ARRfechas = [];
          let FechasI = [];
          let FechasF = [];
          //aqui vamos
        if (Datos.lectura) {
            var datos2=that.getOwnerComponent().getModel("PosicionesG").getData()
            this.getView().byId("tableWizardOrder").setEnableSelectAll(true)
            this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel({ editable: false, }), "Modeleditable");


          for (var x = 0; x < resp.data.results[0].ETOC.results.length; x++) {
              
            resp.data.results[0].ETOC.results[x].Menge = parseInt(resp.data.results[0].ETOC.results[x].Menge)
            resp.data.results[0].ETOC.results[x].Menge = resp.data.results[0].ETOC.results[x].Menge.toString()

            resp.data.results[0].ETOC.results[x].MengeR = parseInt(resp.data.results[0].ETOC.results[x].MengeR)
            resp.data.results[0].ETOC.results[x].MengeR = resp.data.results[0].ETOC.results[x].MengeR.toString()

            resp.data.results[0].ETOC.results[x].MengeA = parseInt(resp.data.results[0].ETOC.results[x].MengeA)
            resp.data.results[0].ETOC.results[x].MengeA = resp.data.results[0].ETOC.results[x].MengeA.toString()
          
              resp.data.results[0].ETOC.results[x].Selected = true;

              for (var y = 0; y < PosicionesG.length; y++) {
                if (resp.data.results[0].ETOC.results[x].Matnr === PosicionesG[y].Matnr && resp.data.results[0].ETOC.results[x].Werks === PosicionesG[y].Werks && resp.data.results[0].ETOC.results[x].Ebeln === PosicionesG[y].Ebeln) {

                  resp.data.results[0].ETOC.results[x].Citado = PosicionesG[y].Citado;
               

                  if (Datos.Tipocita === "01") {
                
                      for (var f = 0; f < resp.data.results[0].ETOCSTO.results.length; f++) {
                   
                        if (parseInt(resp.data.results[0].ETOC.results[x].Ebeln) === parseInt(resp.data.results[0].ETOCSTO.results[f].Bednr) && resp.data.results[0].ETOC.results[x].Abeln === resp.data.results[0].ETOCSTO.results[f].Abeln) {
                        
                          resp.data.results[0].ETOC.results[x].ZwerksD= resp.data.results[0].ETOCSTO.results[f].Werks
                        }   
                      } 
                    resp.data.results[0].ETOC.results[x].Tarima = PosicionesG[y].ETOCSTOPALLEXT.results
                    for (var c = 0; c < resp.data.results[0].ETOC.results[x].Tarima.length; c++) {
                      resp.data.results[0].ETOC.results[x].Tarima[c].Menge = Number(resp.data.results[0].ETOC.results[x].Tarima[c].Menge)
                    }
                  } else if (that.getView().byId("sTipoCita").getSelectedKey() === "02") {
                      var ArgTemp=[];
                     
                    for (var s = 0; s < resp.data.results[0].ETOC.results.length; s++) {
                      for (var d = 0; d < resp.data.results[0].ETMINIFULL03.results.length; d++) {
                        for (var c = 0; c < datos2.length; c++) {
                       
                        if (
                          resp.data.results[0].ETOC.results[s].Abeln === resp.data.results[0].ETMINIFULL03.results[d].Zabeln &&
                          resp.data.results[0].ETOC.results[s].Abeln === datos2[c].Zabeln &&
                         // resp.data.results[0].ETOC.results[x].Abeln === datos2[c].Zabeln &&

                          resp.data.results[0].ETOC.results[s].Abelp === resp.data.results[0].ETMINIFULL03.results[d].Zabelp && 
                          resp.data.results[0].ETOC.results[s].Abelp === datos2[c].Zabelp  &&

                          resp.data.results[0].ETMINIFULL03.results[d].ZwerksD===datos2[c].ZwerksD

                        ) {

                          ArgTemp.push({
                            Abeln: resp.data.results[0].ETOC.results[s].Abeln,
                            Bwart: resp.data.results[0].ETOC.results[s].Bwart,
                            Citado: resp.data.results[0].ETOC.results[s].Citado, //resp.data.results[0].ETMINIFULL03.results[d].Zpmngu.trim().split(".")[0],
                            Ean11: resp.data.results[0].ETOC.results[s].Ean11,
                            Ebeln: resp.data.results[0].ETOC.results[s].Ebeln,
                            Ebelp: resp.data.results[0].ETOC.results[s].Ebelp,
                            Kdatb: resp.data.results[0].ETOC.results[s].Kdatb,
                            Kdate: resp.data.results[0].ETOC.results[s].Kdate,
                            Lifnr: resp.data.results[0].ETOC.results[s].Lifnr,
                            Matnr: resp.data.results[0].ETOC.results[s].Matnr,
                            Meins: resp.data.results[0].ETOC.results[s].Meins,
                            Menge: resp.data.results[0].ETOC.results[s].Menge,
                            MengeA: resp.data.results[0].ETOC.results[s].MengeA,
                            MengeR: resp.data.results[0].ETOC.results[s].MengeR,
                            Maktx: resp.data.results[0].ETOC.results[s].Maktx,
                            Selected: resp.data.results[0].ETOC.results[s].Selected,
                            Werks: resp.data.results[0].ETOC.results[s].Werks,
                            ZwerksD: resp.data.results[0].ETMINIFULL03.results[d].ZwerksD,
                            Abelp: resp.data.results[0].ETMINIFULL03.results[d].Zabelp,
                          });
                        }
                      
                      }
                    
                    }
                     
                      }
                    
                      resp.data.results[0].ETOC.results=ArgTemp
                      that.getOwnerComponent().setModel(new JSONModel(resp.data.results[0]), "Pedidos");
                     
                  } else {
                    resp.data.results[0].ETOC.results[x].Tarima = [];
                    resp.data.results[0].ETOC.results[x].ZwerksD = PosicionesG[y].Werks
                  }

                
                  resp.data.results[0].ETOC.results[x].Ltc = true

               
                  ARRTV.push(resp.data.results[0].ETOC.results[x]);
                }
              }
            }


            resp.data.results[0].ETOC.results = ARRTV;
    
          } else {
            this.getView().byId("tableWizardOrder").setEnableSelectAll(false)
            let ArgTemp = [];

            for (var x = 0; x < resp.data.results[0].ETOC.results.length; x++) {
              resp.data.results[0].ETOC.results[x].Menge = parseInt(resp.data.results[0].ETOC.results[x].Menge)
              resp.data.results[0].ETOC.results[x].Menge = resp.data.results[0].ETOC.results[x].Menge.toString()
  
              resp.data.results[0].ETOC.results[x].MengeR = parseInt(resp.data.results[0].ETOC.results[x].MengeR)
              resp.data.results[0].ETOC.results[x].MengeR = resp.data.results[0].ETOC.results[x].MengeR.toString()
  
              resp.data.results[0].ETOC.results[x].MengeA = parseInt(resp.data.results[0].ETOC.results[x].MengeA)
              resp.data.results[0].ETOC.results[x].MengeA = resp.data.results[0].ETOC.results[x].MengeA.toString()
              FechasI.push({ Finicio: new Date(resp.data.results[0].ETOC.results[x].Kdatb), });
              FechasF.push({ Ffin: new Date(resp.data.results[0].ETOC.results[x].Kdate), });
              resp.data.results[0].ETOC.results[x].Selected = false;

              if (that.getView().byId("sTipoCita").getSelectedKey() === "01") {

                for (var y = 0; y < resp.data.results[0].ETOCSTO.results.length; y++) {
                  if (parseInt(resp.data.results[0].ETOC.results[x].Ebeln) === parseInt(resp.data.results[0].ETOCSTO.results[y].Bednr) && resp.data.results[0].ETOC.results[x].Abelp === resp.data.results[0].ETOCSTO.results[y].Abelp && Number(resp.data.results[0].ETOC.results[x].MengeA) > 0) {
                    ArgTemp.push({
                      Abeln: resp.data.results[0].ETOC.results[x].Abeln,
                      Bwart: resp.data.results[0].ETOC.results[x].Bwart,
                      Citado: resp.data.results[0].ETOC.results[x].Zpmngu,
                      Ean11: resp.data.results[0].ETOC.results[x].Ean11,
                      Ebeln: resp.data.results[0].ETOC.results[x].Ebeln,
                      Ebelp: resp.data.results[0].ETOC.results[x].Ebelp,
                      Kdatb: resp.data.results[0].ETOC.results[x].Kdatb,
                      Kdate: resp.data.results[0].ETOC.results[x].Kdate,
                      Lifnr: resp.data.results[0].ETOC.results[x].Lifnr,
                      Matnr: resp.data.results[0].ETOC.results[x].Matnr,
                      Meins: resp.data.results[0].ETOC.results[x].Meins,
                      Menge: resp.data.results[0].ETOC.results[x].Menge,
                      Menge2: resp.data.results[0].ETOCSTO.results[y].Menge,
                      MengeA: resp.data.results[0].ETOCSTO.results[y].MengeA,
                      MengeR: resp.data.results[0].ETOC.results[x].MengeR,
                      Maktx: resp.data.results[0].ETOC.results[x].Maktx,
                      Selected: resp.data.results[0].ETOC.results[x].Selected,
                      Werks: resp.data.results[0].ETOC.results[x].Werks,
                      ZwerksD: resp.data.results[0].ETOCSTO.results[y].Werks,
                      Tarima: [],
                      ZAbeln: resp.data.results[0].ETOCSTO.results[y].Abeln,
                      ZAbelp: resp.data.results[0].ETOCSTO.results[y].Abelp,
                      ZBednr: resp.data.results[0].ETOCSTO.results[y].Bednr,
                      ZBwart: resp.data.results[0].ETOCSTO.results[y].Bwart,
                      ZEan11: resp.data.results[0].ETOCSTO.results[y].Ean11,
                      ZEbeln: resp.data.results[0].ETOCSTO.results[y].Ebeln,
                      ZEbelp: resp.data.results[0].ETOCSTO.results[y].Ebelp,
                      ZKdatb: resp.data.results[0].ETOCSTO.results[y].Kdatb,
                      ZKdate: resp.data.results[0].ETOCSTO.results[y].Kdate,
                      ZLifnr: resp.data.results[0].ETOCSTO.results[y].Lifnr,
                      ZMatnr: resp.data.results[0].ETOCSTO.results[y].Matnr,
                      ZMeins: resp.data.results[0].ETOCSTO.results[y].Meins,
                      ZMenge: resp.data.results[0].ETOCSTO.results[y].Menge,
                      ZMengeA: resp.data.results[0].ETOCSTO.results[y].MengeA,
                      ZMengeR: resp.data.results[0].ETOCSTO.results[y].MengeR,
                      ZWerks: resp.data.results[0].ETOCSTO.results[y].Werks
                    });
                  }
                }
              }

              if (that.getView().byId("sTipoCita").getSelectedKey() === "04") {

                for (var y = 0; y < resp.data.results[0].ETMINIFULL03.results.length; y++) {

                  if (resp.data.results[0].ETOC.results[x].Abeln === resp.data.results[0].ETMINIFULL03.results[y].Zabeln && resp.data.results[0].ETOC.results[x].Abelp === resp.data.results[0].ETMINIFULL03.results[y].Zabelp && Number(resp.data.results[0].ETOC.results[x].MengeA) > 0) {
                    resp.data.results[0].ETOC.results[x].Zceqfp = resp.data.results[0].ETMINIFULL03.results[y].Zceqfp;
                    resp.data.results[0].ETOC.results[x].Zceqfu = resp.data.results[0].ETMINIFULL03.results[y].Zceqfu;
                    resp.data.results[0].ETOC.results[x].Zcjpic = resp.data.results[0].ETMINIFULL03.results[y].Zcjpic;
                    resp.data.results[0].ETOC.results[x].Zcpemf = resp.data.results[0].ETMINIFULL03.results[y].Zcpemf;
                    resp.data.results[0].ETOC.results[x].Zcpemp = resp.data.results[0].ETMINIFULL03.results[y].Zcpemp;
                  }
                }
              }

              if (that.getView().byId("sTipoCita").getSelectedKey() === "02") {

                for (var y = 0; y < resp.data.results[0].ETMINIFULL03.results.length; y++) {
                  if (
                    resp.data.results[0].ETOC.results[x].Abeln ===
                    resp.data.results[0].ETMINIFULL03.results[y].Zabeln &&
                    resp.data.results[0].ETOC.results[x].Abelp ===
                    resp.data.results[0].ETMINIFULL03.results[y].Zabelp && Number(resp.data.results[0].ETOC.results[x].MengeA) > 0
                  ) {
                    ArgTemp.push({
                      Abeln: resp.data.results[0].ETOC.results[x].Abeln,
                      Bwart: resp.data.results[0].ETOC.results[x].Bwart,
                      Citado: resp.data.results[0].ETMINIFULL03.results[y].Zpmngu.trim().split(".")[0],
                      Ean11: resp.data.results[0].ETOC.results[x].Ean11,
                      Ebeln: resp.data.results[0].ETOC.results[x].Ebeln,
                      Ebelp: resp.data.results[0].ETOC.results[x].Ebelp,
                      Kdatb: resp.data.results[0].ETOC.results[x].Kdatb,
                      Kdate: resp.data.results[0].ETOC.results[x].Kdate,
                      Lifnr: resp.data.results[0].ETOC.results[x].Lifnr,
                      Matnr: resp.data.results[0].ETOC.results[x].Matnr,
                      Meins: resp.data.results[0].ETOC.results[x].Meins,
                      Menge: resp.data.results[0].ETOC.results[x].Menge,
                      MengeA: resp.data.results[0].ETOC.results[x].MengeA,
                      MengeR: resp.data.results[0].ETOC.results[x].MengeR,
                      Maktx: resp.data.results[0].ETOC.results[x].Maktx,
                      Selected: resp.data.results[0].ETOC.results[x].Selected,
                      Werks: resp.data.results[0].ETOC.results[x].Werks,
                      ZwerksD: resp.data.results[0].ETMINIFULL03.results[y].ZwerksD,
                      Abelp: resp.data.results[0].ETMINIFULL03.results[y].Zabelp,
                    });
                  }
                }
              }
           
              if (that.getView().byId("sTipoCita").getSelectedKey() === "03") {
              
                if (parseInt(resp.data.results[0].ETOC.results[x].MengeA) > 0) {
                  resp.data.results[0].ETOC.results[x].MengeA = parseInt(resp.data.results[0].ETOC.results[x].MengeA)
                  resp.data.results[0].ETOC.results[x].MengeA = resp.data.results[0].ETOC.results[x].MengeA.toString()
                  ArgTemp.push(resp.data.results[0].ETOC.results[x]);
                }

              }
            }
           
            if (that.getView().byId("sTipoCita").getSelectedKey() === "02" || that.getView().byId("sTipoCita").getSelectedKey() === "01" || that.getView().byId("sTipoCita").getSelectedKey() === "03") {
              resp.data.results[0].ETOC.results = [];
              resp.data.results[0].ETOC.results = ArgTemp;
            }
          }

          that.getOwnerComponent().setModel(new JSONModel(resp.data.results[0]), "Pedidos");
          //
          function OrdenarPorfechainicio(x, y) {
            return x.Finicio == y.Finicio
              ? 0
              : x.Finicio < y.Finicio
                ? 1
                : -1;
          }
          function OrdenarPorFechaFin(x, y) {
            return x.Ffin == y.Ffin ? 0 : x.Ffin > y.Ffin ? 1 : -1;
          }
          FechasI.sort(OrdenarPorfechainicio);
          FechasF.sort(OrdenarPorFechaFin);
          resp.data.results[0].fechaInicio = new Date(FechasI[0].Finicio).toISOString().slice(0, 10);
          resp.data.results[0].fechaFFin = new Date(FechasF[0].Ffin).toISOString().slice(0, 10);
          sap.ui.core.BusyIndicator.hide();
        })
          .catch((error) => {
            sap.ui.core.BusyIndicator.hide();
          });
      },
      selectTarima: function (oEvent) {
        var oSelectedItem = oEvent.getSource().getParent();


        Posicion = oSelectedItem.getBindingContext("Pedidos").sPath.split("/")[3];



        if (oSelectedItem.getBindingContext("Pedidos").getProperty("Tarima").length === 0) {
          var ATTemp = [];
          var cantTar = this.getView().byId("platformsInput").getValue();
          for (var x = 1; x <= cantTar; x++) {
            ATTemp.push({
              Ztarima: x.toString(),
              //  Nombre: "tarima n° " + x,
              //  Cantidad: "",
              Bednr: oSelectedItem.getBindingContext("Pedidos").getProperty("ZBednr"),
              Abeln: oSelectedItem.getBindingContext("Pedidos").getProperty("ZAbeln"),
              Abelp: oSelectedItem.getBindingContext("Pedidos").getProperty("ZAbelp"),
              Werks: oSelectedItem.getBindingContext("Pedidos").getProperty("ZWerks"),
              Menge: ""//oSelectedItem.getBindingContext("Pedidos").getProperty("ZMenge"),
            });
          }
          this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(ATTemp), "Tarimas");

        } else {
          var ATTemp = [];
          var cantTar = this.getView().byId("platformsInput").getValue();

          for (var x = 1; x <= cantTar; x++) {
            var menge = "";
            for (var y = 0; y < oSelectedItem.getBindingContext("Pedidos").getProperty("Tarima").length; y++) {

              if (x === Number(oSelectedItem.getBindingContext("Pedidos").getProperty("Tarima")[y].Ztarima)) {

                menge = oSelectedItem.getBindingContext("Pedidos").getProperty("Tarima")[y].Menge
              }
            }
            ATTemp.push({
              Ztarima: x.toString(),
              Bednr: oSelectedItem.getBindingContext("Pedidos").getProperty("ZBednr"),
              Abeln: oSelectedItem.getBindingContext("Pedidos").getProperty("ZAbeln"),
              Abelp: oSelectedItem.getBindingContext("Pedidos").getProperty("ZAbelp"),
              Werks: oSelectedItem.getBindingContext("Pedidos").getProperty("ZWerks"),
              Menge: menge,
            });
          }
          //    }
        }

        this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(ATTemp), "Tarimas");
        var oDialog = this.getView().byId("myDialog");
        if (!oDialog) {
          oDialog = sap.ui.xmlfragment(
            this.getView().getId(),
            "demo.views.Quotes.wizards.fragments.Tarimas",
            this
          );
          this.getView().addDependent(oDialog);
        }
        //	this.getView().byId("myDialog").addStyleClass(this.getOwnerComponent().getContentDensityClass());
        oDialog.open();
      },
      handleClose: function (oEvent) {
        Posicion = ""
        var oDialog = this.getView().byId("myDialog");
        oDialog.close();
      },
      ActualizacionTarima: function () {

        if (this.ValidaCantidad()) {

          this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[Posicion].Tarima = [];
          for (var x = 0; x < this.getView().byId("tableid").getSelectedItems().length; x++) {
            if (Number(this.getOwnerComponent().getModel("Tarimas").getData()[this.getView().byId("tableid").getSelectedItems()[x].sId.split("-")[4]].Menge) > 0) {
              this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[Posicion].Tarima.push(
                this.getOwnerComponent().getModel("Tarimas").getData()[this.getView().byId("tableid").getSelectedItems()[x].sId.split("-")[4]]
              );
            } else {

              MessageBox.warning("Cantidad en Tarima n° " + this.getOwnerComponent().getModel("Tarimas").getData()[this.getView().byId("tableid").getSelectedItems()[x].sId.split("-")[4]].Ztarima + " es Vacia o tiene un valor inferior a 0");
              return
            }

          }

          this.handleClose();
        }

      },
      ValidaCantidad: function () {
        var Suma = 0;
        var flag = false
        if (this.getView().byId("tableid").getSelectedItems().length < 1) {

          MessageBox.warning("No ha seleccionado ninguna posición ");
          flag = false

        }
        for (var x = 0; x < this.getView().byId("tableid").getSelectedItems().length; x++) {
          if (this.getOwnerComponent().getModel("Tarimas").getData()[this.getView().byId("tableid").getSelectedItems()[x].sId.split("-")[4]].Menge === "") {

            MessageBox.warning("Cantidad en Tarima n° " + this.getOwnerComponent().getModel("Tarimas").getData()[this.getView().byId("tableid").getSelectedItems()[x].sId.split("-")[4]].Ztarima + " es Vacia o tiene un valor inferior a 0");
            flag = false

          } else {
            Suma = Suma + Number(this.getOwnerComponent().getModel("Tarimas").getData()[this.getView().byId("tableid").getSelectedItems()[x].sId.split("-")[4]].Menge)

            this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[Posicion].Tarima = [];

            if (Suma > this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[Posicion].MengeA) {
              flag = false
              MessageBox.warning("Las cantidades ingresadas son superior a la cantidad disponible para la tienda");
            } else {

              this.getOwnerComponent().getModel("Pedidos").getData().ETOC.results[Posicion].Tarima.push(this.getOwnerComponent().getModel("Tarimas").getData()[this.getView().byId("tableid").getSelectedItems()[x].sId.split("-")[4]]);
              flag = true
            }

          }

        }
        if (flag) {

          return flag

        }

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

        if (
          oEvent.getParameters().selectedItem.getKey() === "01" ||
          oEvent.getParameters().selectedItem.getKey() === "02"
        ) {
          this.getView().byId("txtDP2").setVisible(true);
          this.getView().byId("DP2").setVisible(true);
        } else {
          this.getView().byId("txtDP2").setVisible(false);
          this.getView().byId("DP2").setVisible(false);
        }

      },

      onChangeSelectTipoUnidad: function (oEvent) {
       
        dataTempModel.setProperty("/generalData/tipoUnidad",oEvent.getParameters().selectedItem.getKey());

console.log(this.getView().getModel("CAtalogo2").getData())
for(var x=0;x<this.getView().getModel("CAtalogo2").getData().length;x++){
if(this.getView().getModel("CAtalogo2").getData()[x].ZNumunidad ===oEvent.getParameters().selectedItem.getKey()){
  dataTempModel.setProperty("/generalData/tiempo",this.getView().getModel("CAtalogo2").getData()[x].ZservMinutos);
}

}

      

        
      },

      onSelectProductType: function (oEvent) {
        dataTempModel.setProperty(
          "/generalData/tipoProducto",
          oEvent.getParameters().selectedItem.getKey()
        );
      },

      selectChange: function (oEvent) { },
      onListItemPress: function (oEvent) { },
      appointmentDateChange(oEvent) {

      
        let source = oEvent.getSource();
        let dateSelected = source.getDateValue();

        // this.setAppoimentCalendar(dateSelected, dateSelected);
        this.getOwnerComponent().getModel("CitaMainData").setProperty("/FechaCita", this.buildSapDate(dateSelected));


        let datepicker = this.getView().byId("DP2");
        let todayDate = new Date();

        todayDate = dateSelected.getTime() - 1000 * 60 * 60 * 24 * 1;

        datepicker.setDateValue(new Date(todayDate));
        datepicker.setMinDate(new Date(todayDate));
        datepicker.fireChange();



        this.getOwnerComponent().getModel("CitaMainData").setProperty("/FechaAud", new Date(todayDate).toISOString().slice(0, 10));
        //this.getOwnerComponent().getModel("CitaCreationArray").setProperty("/FechaAud", this.buildSapDate(new Date(todayDate)));


      },
      /*  setInitialDateAuditoria() {
        let datepicker = this.getView().byId("DP2");
        let todayDate = new Date();

        todayDate = todayDate.getTime() + 1000 * 60 * 60 * 24 * 1;
        datepicker.setDateValue(new Date(todayDate));
        datepicker.setMinDate(new Date(todayDate));
        datepicker.fireChange();
      },*/

      setAppoimentCalendar(dateSelected, maxdate) {


        var fecha1 = ""
        if (this.getOwnerComponent().getModel("Pedidos").getData().fechaFFin === undefined) {
          var v1 = this.byId("DP1").getDateValue().getTime() + 1000 * 60 * 60 * 24 * 7
          v1 = new Date(v1).toISOString().slice(0, 10);

          fecha1 = new Date(v1 + " 23:59:59")
        } else {
          fecha1 = this.getOwnerComponent().getModel("Pedidos").getData().fechaFFin
          fecha1 = new Date(fecha1 + " 23:59:59")
        }


        //  fecha1=fecha1+", 23, 59, 00"


        let planningCalendar = this.getView().byId("appoinmentPC");
        dateSelected.setHours(8, 0);
        planningCalendar.setStartDate(this.byId("DP1").getDateValue());
        planningCalendar.setMinDate(this.byId("DP1").getDateValue());
        planningCalendar.setMaxDate(fecha1);
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
     
        let minutos=Number(this.getView().getModel("TemporalModel").getData().generalData.tiempo)-1
      
        oStartDate.setHours(startHours);
     
        //var minutosASumar = 30; // Por ejemplo, 30 minutos
        oEndDate.setMinutes(oStartDate.getMinutes() + minutos);
        





       
       /* console.log("hora1",startHours)
        oStartDate.setHours(startHours);
        console.log("test1",oStartDate)
        startHours++;
        console.log("hora2",startHours)
        console.log("test2",oStartDate)
        oEndDate.setHours(startHours);
        console.log("test3",oEndDate)*/
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
        var that = this;
        var oAppointment = oEvent.getParameter("appointment"),
          sSelected,
          aAppointments,
          sValue;

        if (oAppointment) {

          sSelected = oAppointment.getSelected() ? "selected" : "deselected";
          if (oAppointment.getType() === "Type08") {
            MessageBox.information("'" + oAppointment.getTitle() + "' " + sSelected + ". \n  Cita: " + this.byId("appoinmentPC").getSelectedAppointments().length, {
              actions: ["Cancelar Cita", MessageBox.Action.CLOSE],
              emphasizedAction: "Cancelar Cita",
              onClose: function (sAction) {
                var dataPos = that.getView().getModel("Platforms").getData();
                for (var x = 0; x < dataPos.length; x++) {
                  dataPos[x].appointments = [];
                }
                that.GetCitas()


              }
            });
          } else {
            MessageBox.show("'" + oAppointment.getTitle() + "' " + sSelected + ". \n  Cita: " + this.byId("appoinmentPC").getSelectedAppointments().length);
          }

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
        } else if (_centroSeleccionado === null) {

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

          if (this.getView().byId("sTipoCita").getSelectedKey() === "02") {

            if (
              pedido.Ebeln === objectClicked.Ebeln &&
              pedido.Ean11 === objectClicked.Ean11 &&
              pedido.ZwerksD === objectClicked.ZwerksD &&
              pedido.Abeln === objectClicked.Abeln &&
              pedido.Abelp === objectClicked.Abelp
            ) {
              pedido.Selected = true; //isSelected;
            } else {

              //   pedido.Selected = true//isSelected;
              // pedido.Selected = true
            }
          } else if (this.getView().byId("sTipoCita").getSelectedKey() === "01") {

            if (
              pedido.Ebeln === objectClicked.Ebeln &&
              pedido.ZWerks === objectClicked.ZWerks &&
              pedido.Ean11 === objectClicked.Ean11 &&
              pedido.ZAbeln === objectClicked.ZAbeln

            ) {

              pedido.Selected = true; //isSelected;
            } else {

              //   pedido.Selected = true//isSelected;
              // pedido.Selected = true
            }
          } else {

            if (
              pedido.Ebeln === objectClicked.Ebeln &&
              pedido.Ean11 === objectClicked.Ean11
            ) {

              pedido.Selected = isSelected;
            }
          }

        });

        // source.setFirstVisibleRow(selectedIndex + 2);

        // dando tiempo para que actue el autoscroll y se refleje la funcionalidad (necsario**)
        await new Promise((resolve) => setTimeout(resolve, 100));

        // source.setFirstVisibleRow(isSelected ? selectedIndex : 0);

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

      /*  this.byId("btnAppoimentNext").setEnabled(
          _invalidinputs.length == 0 && cantidad > 0
        );*/

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
        let creationArray = this.getOwnerComponent().getModel("CitaCreationArray").getData();
        let mainDataModel = this.getOwnerComponent().getModel("CitaMainData").getData();

        let newdetail = {
          Ebeln: detalle.Ebeln,
          Ebelp: detalle.Ebelp,
          Matnr: detalle.Matnr,
          TipoCita: mainDataModel.TipoCita,
          FechaAud: mainDataModel.FechaAud
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
            todayDate = todayDate.getTime() + 1000 * 60 * 60 * 24 * 1;

            todayDate = new Date(todayDate).toISOString().slice(0, 10);

            for (var x = 0; x < N - 1; x++) {
              var T1 = x;
              Arrt.push({
                name: data[x].Dato1,
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

        filtros.push(new sap.ui.model.Filter({ path: "Action", operator: sap.ui.model.FilterOperator.EQ, value1: "1", }));
       // filtros.push(new sap.ui.model.Filter({ path: "Proveedor", operator: sap.ui.model.FilterOperator.EQ, value1: vLifnr, }));
        filtros.push(new sap.ui.model.Filter({ path: "Centro", operator: sap.ui.model.FilterOperator.EQ, value1: that.getView().byId("sOrdenes").getSelectedKey(), }));
        if (vFolioIni != null && vFolioIni != "" && vFolioFin != null && vFolioFin != "") {
          filtros.push(new sap.ui.model.Filter({ path: "Folioini", operator: sap.ui.model.FilterOperator.EQ, value1: vFolioIni, }));
          filtros.push(new sap.ui.model.Filter({ path: "Foliofin", operator: sap.ui.model.FilterOperator.EQ, value1: vFolioFin, }));
        }

        if (vIniDate != null && vIniDate != "" && vEndDate != null && vEndDate != "") {
          filtros.push(new sap.ui.model.Filter({ path: "Fechaini", operator: sap.ui.model.FilterOperator.EQ, value1: vIniDate, }));

          filtros.push(new sap.ui.model.Filter({ path: "Fechafin", operator: sap.ui.model.FilterOperator.EQ, value1: vEndDate, }));
        }

        var model = "ZOSP_CITAS_ADM_SRV";
        var entity = "MainSet";
        var expand = "CTCITASCAB";
        var filter = filtros;
        var select = "";
        var dataPos = that.getView().getModel("Platforms").getData(); //that.getOwnerComponent().getModel("Platforms").getData();
        sap.ui.core.BusyIndicator.show();
        that._GEToDataV2(model, entity, filter, expand, select).then(function (_GEToDataV2Response) {
          sap.ui.core.BusyIndicator.hide();

          var data = _GEToDataV2Response.data.results[0].CTCITASCAB.results;


          for (var x = 0; x < data.length; x++) {
            for (var y = 0; y < dataPos.length; y++) {

              if (data[x].Anden === dataPos[y].name) {
                dataPos[y].appointments.push({
                  start: new Date(data[x].Fechacita + " " + data[x].HoraIni),
                  end: new Date(data[x].Fechacita + " " + data[x].HoraFin),
                  title: "Cita " + data[x].Folio,
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

        var that = this;
        if (this._oWizard.getProgress() === 1) {
          // that.getView().byId("sTipoCita").setEditable(true);
          that.getView().byId("totalpackagesInput").setEditable(true);
          that.getView().byId("platformsInput").setEditable(true);
          that.getView().byId("sTipoUnidad").setEditable(true);
          that.getView().byId("carrierInput").setEditable(true);
          that.getView().byId("DP1").setEditable(true);
        }
        if (this._oWizard.getProgress() === 2) {
          this.getOwnerComponent().setModel(
            new sap.ui.model.json.JSONModel({
              editable: true,
            }),
            "Modeleditable"
          );
          let dateSelected = this.byId("DP1").getDateValue();

          this.searchOrders2(this.buildSapDate(dateSelected));
        }
        this.handleButtonsVisibility();
      },
      /*searchOrders2: function (date) {
        let filtros = [];
        let that = this;

        filtros.push(
          this.buildFiltro(
            "IOption",
            that.getView().byId("sTipoCita").getSelectedKey()
          )
        );

        filtros.push(
          that.buildFiltro(
            "ILifnr",
            that.getConfigModel().getProperty("/supplierInputKey")
          )
        );

        filtros.push(that.buildFiltro("IKdatb", date));
        var Datos = that.getView().getModel("ModelLectura").getData();
        var dataNL = that.getView().getModel("Pedidos").getData();

        var PosicionesG = that.getView().getModel("PosicionesG").getData();

        sap.ui.core.BusyIndicator.show();
        let ARRTV = [];
        that
          ._GetODataV2(_oDataModelOC, _oDataEntityOC, filtros, ["ETOC"], "")
          .then((resp) => {
            that.getView().byId("tableWizardOrder").clearSelection();

            for (var x = 0; x < resp.data.results[0].ETOC.results.length; x++) {
              resp.data.results[0].ETOC.results[x].Selected = false;
            }
            for (var y = 0; y < dataNL.ETOC.results.length; y++) {
              resp.data.results[0].ETOC.results.push(dataNL.ETOC.results[y]);
            }

            that
              .getOwnerComponent()
              .setModel(new JSONModel(resp.data.results[0]), "Pedidos");

            sap.ui.core.BusyIndicator.hide();
          })
          .catch((error) => {
            sap.ui.core.BusyIndicator.hide();
          });
      },*/
      searchOrders2: function (date) {
        let filtros = [];
        let that = this;

        filtros.push(
          this.buildFiltro(
            "IOption",
            that.getView().byId("sTipoCita").getSelectedKey()
          )
        );

        filtros.push(
          that.buildFiltro(
            "ILifnr",
            that.getConfigModel().getProperty("/supplierInputKey")
          )
        );

        filtros.push(
          that.buildFiltro(
            "Iwerks",
            that.getView().byId("sOrdenes").getSelectedKey()
          )
        );
        filtros.push(that.buildFiltro("IKdatb", date));
        var Datos = that.getOwnerComponent().getModel("ModelLectura").getData();


        if (that.getView().getModel("PosicionesG") === undefined) {
          var PosicionesG = [];
        } else {
          var PosicionesG = that.getView().getModel("PosicionesG").getData();
        }


        sap.ui.core.BusyIndicator.show();
        let ARRTV = [];
        that._GetODataV2(_oDataModelOC, _oDataEntityOC, filtros, ["ETOC", "ETMINIFULL03", "ETOCSTO"], "").then((resp) => {
          that.getView().byId("tableWizardOrder").clearSelection();
          var dataNL = that.getView().getModel("Pedidos").getData();
          let ARRfechas = [];
          let FechasI = [];
          let FechasF = [];
          //aqui vamos


          let ArgTemp = [];

          for (var x = 0; x < resp.data.results[0].ETOC.results.length; x++) {
            FechasI.push({ Finicio: new Date(resp.data.results[0].ETOC.results[x].Kdatb), });
            FechasF.push({ Ffin: new Date(resp.data.results[0].ETOC.results[x].Kdate), });
            resp.data.results[0].ETOC.results[x].Selected = false;
          
            resp.data.results[0].ETOC.results[x].Menge = parseInt(resp.data.results[0].ETOC.results[x].Menge)
            resp.data.results[0].ETOC.results[x].Menge = resp.data.results[0].ETOC.results[x].Menge.toString()

            resp.data.results[0].ETOC.results[x].MengeR = parseInt(resp.data.results[0].ETOC.results[x].MengeR)
            resp.data.results[0].ETOC.results[x].MengeR = resp.data.results[0].ETOC.results[x].MengeR.toString()

            resp.data.results[0].ETOC.results[x].MengeA = parseInt(resp.data.results[0].ETOC.results[x].MengeA)
            resp.data.results[0].ETOC.results[x].MengeA = resp.data.results[0].ETOC.results[x].MengeA.toString()
          
            if (that.getView().byId("sTipoCita").getSelectedKey() === "01") {

              for (var y = 0; y < resp.data.results[0].ETOCSTO.results.length; y++) {
                if (parseInt(resp.data.results[0].ETOC.results[x].Ebeln) === parseInt(resp.data.results[0].ETOCSTO.results[y].Bednr) && resp.data.results[0].ETOC.results[x].Abelp === resp.data.results[0].ETOCSTO.results[y].Abelp && Number(resp.data.results[0].ETOC.results[x].MengeA) > 0) {
                  ArgTemp.push({
                    Abeln: resp.data.results[0].ETOC.results[x].Abeln,
                    Bwart: resp.data.results[0].ETOC.results[x].Bwart,
                    Citado: resp.data.results[0].ETOC.results[x].Zpmngu,
                    Ean11: resp.data.results[0].ETOC.results[x].Ean11,
                    Ebeln: resp.data.results[0].ETOC.results[x].Ebeln,
                    Ebelp: resp.data.results[0].ETOC.results[x].Ebelp,
                    Kdatb: resp.data.results[0].ETOC.results[x].Kdatb,
                    Kdate: resp.data.results[0].ETOC.results[x].Kdate,
                    Lifnr: resp.data.results[0].ETOC.results[x].Lifnr,
                    Matnr: resp.data.results[0].ETOC.results[x].Matnr,
                    Meins: resp.data.results[0].ETOC.results[x].Meins,
                    Menge: resp.data.results[0].ETOC.results[x].Menge,
                    Menge2: resp.data.results[0].ETOCSTO.results[y].Menge,
                    MengeA: resp.data.results[0].ETOCSTO.results[y].MengeA,
                    MengeR: resp.data.results[0].ETOC.results[x].MengeR,
                    Maktx: resp.data.results[0].ETOC.results[x].Maktx,
                    Selected: resp.data.results[0].ETOC.results[x].Selected,
                    Werks: resp.data.results[0].ETOC.results[x].Werks,
                    ZwerksD: resp.data.results[0].ETOCSTO.results[y].Werks,
                    Tarima: [],
                    ZAbeln: resp.data.results[0].ETOCSTO.results[y].Abeln,
                    ZAbelp: resp.data.results[0].ETOCSTO.results[y].Abelp,
                    ZBednr: resp.data.results[0].ETOCSTO.results[y].Bednr,
                    ZBwart: resp.data.results[0].ETOCSTO.results[y].Bwart,
                    ZEan11: resp.data.results[0].ETOCSTO.results[y].Ean11,
                    ZEbeln: resp.data.results[0].ETOCSTO.results[y].Ebeln,
                    ZEbelp: resp.data.results[0].ETOCSTO.results[y].Ebelp,
                    ZKdatb: resp.data.results[0].ETOCSTO.results[y].Kdatb,
                    ZKdate: resp.data.results[0].ETOCSTO.results[y].Kdate,
                    ZLifnr: resp.data.results[0].ETOCSTO.results[y].Lifnr,
                    ZMatnr: resp.data.results[0].ETOCSTO.results[y].Matnr,
                    ZMeins: resp.data.results[0].ETOCSTO.results[y].Meins,
                    ZMenge: resp.data.results[0].ETOCSTO.results[y].Menge,
                    ZMengeA: resp.data.results[0].ETOCSTO.results[y].MengeA,
                    ZMengeR: resp.data.results[0].ETOCSTO.results[y].MengeR,
                    ZWerks: resp.data.results[0].ETOCSTO.results[y].Werks
                  });
                }
              }
            }

            if (that.getView().byId("sTipoCita").getSelectedKey() === "04") {

              for (var y = 0; y < resp.data.results[0].ETMINIFULL03.results.length; y++) {

                if (resp.data.results[0].ETOC.results[x].Abeln === resp.data.results[0].ETMINIFULL03.results[y].Zabeln && resp.data.results[0].ETOC.results[x].Abelp === resp.data.results[0].ETMINIFULL03.results[y].Zabelp && Number(resp.data.results[0].ETOC.results[x].MengeA) > 0) {
                  
                  resp.data.results[0].ETOC.results[x].Zceqfp = resp.data.results[0].ETMINIFULL03.results[y].Zceqfp;
                  resp.data.results[0].ETOC.results[x].Zceqfu = resp.data.results[0].ETMINIFULL03.results[y].Zceqfu;
                  resp.data.results[0].ETOC.results[x].Zcjpic = resp.data.results[0].ETMINIFULL03.results[y].Zcjpic;
                  resp.data.results[0].ETOC.results[x].Zcpemf = resp.data.results[0].ETMINIFULL03.results[y].Zcpemf;
                  resp.data.results[0].ETOC.results[x].Zcpemp = resp.data.results[0].ETMINIFULL03.results[y].Zcpemp;
                }
              }
            }

            if (that.getView().byId("sTipoCita").getSelectedKey() === "02") {

              for (var y = 0; y < resp.data.results[0].ETMINIFULL03.results.length; y++) {
                if (
                  resp.data.results[0].ETOC.results[x].Abeln ===
                  resp.data.results[0].ETMINIFULL03.results[y].Zabeln &&
                  resp.data.results[0].ETOC.results[x].Abelp ===
                  resp.data.results[0].ETMINIFULL03.results[y].Zabelp && Number(resp.data.results[0].ETOC.results[x].MengeA) > 0 && Number(resp.data.results[0].ETMINIFULL03.results[y].Zpmngu.trim().split(".")[0])>0
                ) {
              
                  resp.data.results[0].ETOC.results[x].MengeA = parseInt(resp.data.results[0].ETOC.results[x].MengeA)
                  resp.data.results[0].ETOC.results[x].MengeA = resp.data.results[0].ETOC.results[x].MengeA.toString()
                  ArgTemp.push({
                    Abeln: resp.data.results[0].ETOC.results[x].Abeln,
                    Bwart: resp.data.results[0].ETOC.results[x].Bwart,
                    Citado: resp.data.results[0].ETMINIFULL03.results[y].Zpmngu.trim().split(".")[0],
                    Ean11: resp.data.results[0].ETOC.results[x].Ean11,
                    Ebeln: resp.data.results[0].ETOC.results[x].Ebeln,
                    Ebelp: resp.data.results[0].ETOC.results[x].Ebelp,
                    Kdatb: resp.data.results[0].ETOC.results[x].Kdatb,
                    Kdate: resp.data.results[0].ETOC.results[x].Kdate,
                    Lifnr: resp.data.results[0].ETOC.results[x].Lifnr,
                    Matnr: resp.data.results[0].ETOC.results[x].Matnr,
                    Meins: resp.data.results[0].ETOC.results[x].Meins,
                    Menge: resp.data.results[0].ETOC.results[x].Menge,
                    MengeA: resp.data.results[0].ETOC.results[x].MengeA,
                    MengeR: resp.data.results[0].ETOC.results[x].MengeR,
                    Maktx: resp.data.results[0].ETOC.results[x].Maktx,
                    Selected: resp.data.results[0].ETOC.results[x].Selected,
                    Werks: resp.data.results[0].ETOC.results[x].Werks,
                    ZwerksD: resp.data.results[0].ETMINIFULL03.results[y].ZwerksD,
                    Abelp: resp.data.results[0].ETMINIFULL03.results[y].Zabelp,
                  });
                }
              }
            }
            if (that.getView().byId("sTipoCita").getSelectedKey() === "03") {

              if (parseInt(resp.data.results[0].ETOC.results[x].MengeA) > 0) {
                
                ArgTemp.push(resp.data.results[0].ETOC.results[x]);
              }

            }
          }
          if (that.getView().byId("sTipoCita").getSelectedKey() === "02" || that.getView().byId("sTipoCita").getSelectedKey() === "01" || that.getView().byId("sTipoCita").getSelectedKey() === "03") {
            resp.data.results[0].ETOC.results = [];
            resp.data.results[0].ETOC.results = ArgTemp;
          }
          for (var v = 0; v < dataNL.ETOC.results.length; v++) {
            resp.data.results[0].ETOC.results.push(dataNL.ETOC.results[v]);
          }


          that.getOwnerComponent().setModel(new JSONModel(resp.data.results[0]), "Pedidos");
          //
          function OrdenarPorfechainicio(x, y) {
            return x.Finicio == y.Finicio
              ? 0
              : x.Finicio < y.Finicio
                ? 1
                : -1;
          }
          function OrdenarPorFechaFin(x, y) {
            return x.Ffin == y.Ffin ? 0 : x.Ffin > y.Ffin ? 1 : -1;
          }
          FechasI.sort(OrdenarPorfechainicio);
          FechasF.sort(OrdenarPorFechaFin);
          resp.data.results[0].fechaInicio = new Date(FechasI[0].Finicio).toISOString().slice(0, 10);
          resp.data.results[0].fechaFFin = new Date(FechasF[0].Ffin).toISOString().slice(0, 10);
          sap.ui.core.BusyIndicator.hide();
        })
          .catch((error) => {
            sap.ui.core.BusyIndicator.hide();
          });
      },

      CancelarCita: function () {
        /*  */

        sap.m.MessageBox["confirm"](this.getView().getModel("appTxts").getProperty("/quotes.cancel"),
          {
            actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
            onClose: async function (oAction) {
              if (oAction === sap.m.MessageBox.Action.YES) {
                this._oWizard = this.getView().byId("QuoteCedisWizard");

                let appoimentModel = this.getOwnerComponent().getModel("CitaCreationArray").getData();

                var json = {
                  Proveedor: this.getOwnerComponent().getModel("ModelLectura").getData()
                    .Proveedor,
                  Action: "3",

                  CTCITASCAB: [
                    {
                      Folio: this.getOwnerComponent().getModel("ModelLectura").getData().Folio,
                      Centro: this.getOwnerComponent().getModel("ModelLectura").getData().Centro,
                      Fechacita: this.getOwnerComponent().getModel("ModelLectura").getData().Fechacita,
                      Proveedor: this.getOwnerComponent().getModel("ModelLectura").getData().Proveedor,
                    },
                  ],
                  CTCITASDET: [],
                  ETRETURN: [],
                };
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
                  that
                    .getView()
                    .setModel(new JSONModel(), "tableWizardOrderPosition");
                  that
                    .getOwnerComponent()
                    .setModel(new sap.ui.model.json.JSONModel(), "CitaMainData");
                  that
                    .getOwnerComponent()
                    .setModel(
                      new sap.ui.model.json.JSONModel([]),
                      "CitaCreationArray"
                    );
                  _centroSeleccionado = null;
                  that.searchData();
                });
              }
            }.bind(this),
          }
        );
      },

      Busqueda: function () {
        let IDB = "";

        if (this.getView().byId("FP").getSelected()) {
          IDB = "1";
        }
        if (this.getView().byId("PB").getSelected()) {
          IDB = "2";
        }
        if (this.getView().byId("RS").getSelected()) {
          IDB = "3";
        }
        if (
          !this.getView().byId("RS").getSelected() &&
          !this.getView().byId("RS").getSelected() &&
          !this.getView().byId("PB").getSelected()
        ) {
          IDB = "7";
        }
      },

      inspeccion: function (oEvent) {
        let source = oEvent.getSource();
        let dateSelected = source.getDateValue();


        this.getOwnerComponent().getModel("CitaMainData").setProperty("/FechaAud", new Date(dateSelected).toISOString().slice(0, 10));
      },
      onUpload: function (e) {
      
        this._import(e.getParameter("files") && e.getParameter("files")[0]);
       
      },

      _import: function (file) {


        var that = this;
       // DataDocument=true;
        var modeloPosGlobal = that.getView().getModel("Pedidos").getData().ETOC.results;
        var modeloPosGlobal2 = that.getView().getModel("Pedidos").getData().ETMINIFULL03.results;
        var excelData = {};
        if (file && window.FileReader) {
          var reader = new FileReader();
          reader.onload = function (e) {
            var data = e.target.result;
            var prov = Number(that.getConfigModel().getProperty("/supplierInputKey").padStart(10, 0))
           
            if (prov !== Number(data.split("\n")[1].split("|")[1])) {
              sap.m.MessageBox.error(
                that.getView().getModel("appTxts").getProperty("/quotes.ErrorMasivo")
              );
              return
            }
            if (that.getView().byId("sTipoCita").getSelectedKey() === "02") {
              let pos = [];

              for (var x = 0; x < data.split("\n").length; x++) {
                if (data.split("\n")[x].split("|")[0] == "DD") {
                  pos.push({
                    tipo: data.split("\n")[x].split("|")[0],
                    Ebeln: data.split("\n")[x].split("|")[1],
                    Ean11: data.split("\n")[x].split("|")[2],
                    ZwerksD: data.split("\n")[x].split("|")[3]
                  })
                }

                //
              }
            
              var ARRTem = []
              if (pos.length > 0) {
                for (var x = 0; x < pos.length; x++) {
                  for (var y = 0; y < modeloPosGlobal.length; y++) {
                  
                    if ((modeloPosGlobal[y].Ebeln === pos[x].Ebeln) && (modeloPosGlobal[y].Ean11 === pos[x].Ean11) && (modeloPosGlobal[y].ZwerksD === pos[x].ZwerksD)) {
                   
                      ARRTem.push(modeloPosGlobal[y])
                    }

                  }
                }

              }

              that.getOwnerComponent().getModel("Pedidos").setProperty("/ETOC/results", [])
              that.getOwnerComponent().getModel("Pedidos").setProperty("/ETOC/results", ARRTem)
              that.getView().byId("tableWizardOrder").setEnableSelectAll(true)
              that.getView().byId("tableWizardOrder").setSelectionInterval(0,(ARRTem.length-1))
              that.selectPedido()


            }
            if (that.getView().byId("sTipoCita").getSelectedKey() === "01") {
              let pos = [];

              for (var x = 0; x < data.split("\n").length; x++) {
                if (data.split("\n")[x].split("|")[0] == "DD") {
                  pos.push({
                    tipo: data.split("\n")[x].split("|")[0],
                    Ebeln: data.split("\n")[x].split("|")[1],
                    Ean11: data.split("\n")[x].split("|")[2],
                    ZwerksD: data.split("\n")[x].split("|")[3],
                    Tarima: data.split("\n")[x].split("|")[4],
                    Citado: Number(data.split("\n")[x].split("|")[5])
                  })
                }

                //
              }
             
              var ARRTem = []
              var cantTar = that.getView().byId("platformsInput").getValue();
              if (pos.length > 0) {
                for (var x = 0; x < pos.length; x++) {
                  for (var y = 0; y < modeloPosGlobal.length; y++) {

                    if ((modeloPosGlobal[y].Ebeln === pos[x].Ebeln) && (modeloPosGlobal[y].Ean11 === pos[x].Ean11) && (modeloPosGlobal[y].ZwerksD === pos[x].ZwerksD)) {
                     

                      for (var c = 1; c <= cantTar; c++) {

                        if (pos[x].Tarima === c.toString()) {
                          modeloPosGlobal[y].Tarima.push({
                            Ztarima: pos[x].Tarima,
                            Bednr: modeloPosGlobal[y].ZBednr,
                            Abeln: modeloPosGlobal[y].ZAbeln,
                            Abelp: modeloPosGlobal[y].ZAbelp,
                            Werks: modeloPosGlobal[y].ZWerks,
                            Menge: pos[x].Citado.toString()
                          });
                        }


                      }

                   
                      ARRTem.push(modeloPosGlobal[y])
                    }

                  }
                }

              }

              that.getOwnerComponent().getModel("Pedidos").setProperty("/ETOC/results", [])
              that.getOwnerComponent().getModel("Pedidos").setProperty("/ETOC/results", ARRTem)

              that.getView().byId("tableWizardOrder").setEnableSelectAll(true)
              that.getView().byId("tableWizardOrder").setSelectionInterval(0,(ARRTem.length-1))
              that.selectPedido()


            }
              if (that.getView().byId("sTipoCita").getSelectedKey() === "03") {
                let pos = [];

                for (var x = 0; x < data.split("\n").length; x++) {
                  if (data.split("\n")[x].split("|")[0] == "DD") {
                    pos.push({
                      tipo: data.split("\n")[x].split("|")[0],
                      Ebeln: data.split("\n")[x].split("|")[1],
                      Ean11: data.split("\n")[x].split("|")[2],
                      ZwerksD: data.split("\n")[x].split("|")[3],
                      Tarima: data.split("\n")[x].split("|")[4],
                      Citado: Number(data.split("\n")[x].split("|")[5])
                    })
                  }
                }

                var ARRTem = []
             
                if (pos.length > 0) {
                  for (var x = 0; x < pos.length; x++) {
                    for (var y = 0; y < modeloPosGlobal.length; y++) {

                      if ((modeloPosGlobal[y].Ebeln === pos[x].Ebeln) && (modeloPosGlobal[y].Ean11 === pos[x].Ean11) ) {
                       
                        modeloPosGlobal[y].Citado=pos[x].Citado.toString();
                        ARRTem.push(modeloPosGlobal[y])
                        //Menge: pos[x].Citado.toString()
                      }

                    }
                  }

                }

                that.getOwnerComponent().getModel("Pedidos").setProperty("/ETOC/results", [])
                that.getOwnerComponent().getModel("Pedidos").setProperty("/ETOC/results", ARRTem)
                that.getView().byId("tableWizardOrder").setEnableSelectAll(true)
                 that.getView().byId("tableWizardOrder").setSelectionInterval(0,(ARRTem.length-1))
                 that.selectPedido()


              }
            if (that.getView().byId("sTipoCita").getSelectedKey() === "04") {
              let pos = [];

              for (var x = 0; x < data.split("\n").length; x++) {
                if (data.split("\n")[x].split("|")[0] == "DD") {
                  pos.push({
                    tipo: data.split("\n")[x].split("|")[0],
                    Ebeln: data.split("\n")[x].split("|")[1],
                    Ean11: data.split("\n")[x].split("|")[2],
                    ZwerksD: data.split("\n")[x].split("|")[3],
                    Tarima: data.split("\n")[x].split("|")[4],
                    Citado: Number(data.split("\n")[x].split("|")[5])
                  })
                }

                //
              }
           
              var ARRTem = []
if (pos.length > 0) {
  for (var x = 0; x < pos.length; x++) {
    for (var y = 0; y < modeloPosGlobal.length; y++) {

      if ((modeloPosGlobal[y].Ebeln === pos[x].Ebeln) && (modeloPosGlobal[y].Ean11 === pos[x].Ean11) ) {
       
        modeloPosGlobal[y].Citado=pos[x].Citado.toString();
       
        ARRTem.push(modeloPosGlobal[y])


      }

    }
  }

}
that.getOwnerComponent().getModel("Pedidos").setProperty("/ETOC/results", [])
that.getOwnerComponent().getModel("Pedidos").setProperty("/ETOC/results", ARRTem)
that.getView().byId("tableWizardOrder").setEnableSelectAll(true)
 that.getView().byId("tableWizardOrder").setSelectionInterval(0,(ARRTem.length-1))
 that.selectPedido()
          
            }


          };
          reader.onerror = function (ex) { };
          reader.readAsBinaryString(file);
        }
      },

    });
  }
);
