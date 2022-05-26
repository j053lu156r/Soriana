sap.ui.define([
    "demo/controllers/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "demo/models/formatterCatPrd"
], function (BaseController, JSONModel, Fragment, MessageBox, Filter, FilterOperator, formatterCatPrd) {
    "use strict";

    var sUri = "/sap/opu/odata/sap/ZOSP_CATPRO_SRV/";

    var Model = new Productos();
    const CatNegotiatedFormat = ['1A', '1B'];
    var swProveedorEnGS1 = false;
    var swProveedorExcluido = false;
    var _testingSteps = false; // cambiar valor para probar brincando Validaciones (true = Brincar) (false= No brincar)

    return BaseController.extend("demo.controllers.Products.Master", {
        formatterCatPrd: formatterCatPrd,
        onInit: function () {

            this.getView().addEventDelegate({
                onBeforeShow: function (oEvent) {
                    this.getOwnerComponent().setModel(new JSONModel(), "Paises");
                    this.getOwnerComponent().setModel(new JSONModel(), "Catalogos");
                    this.getOwnerComponent().setModel(new JSONModel(), "Folios");
                    this.getOwnerComponent().setModel(new JSONModel(), "Folio");
                    this.getOwnerComponent().setModel(new JSONModel(), "FolioToShow");
                    this.getOwnerComponent().setModel(new JSONModel(), "ITARTVAR");
                    this.getOwnerComponent().getModel("ITARTVAR").setProperty("/results", []);
                    this.getCatalogos();
                    this.clearFilters();
                }
            }, this);

            this.configFilterLanguage(this.getView().byId("filterBar"));
            this.setInitialDates();


        },

        async getGS1ProductData() {
            // Probando Consulta API externa
            let gs1Product = new JSONModel();
            let provicionalEAN = '7501006584035'
            await fetch(`https://compuarte.serv.net.mx:4000/searchbygtin?codigo_barras=${provicionalEAN}`).then(async data => {
                //console.log(await data.json());
                gs1Product.setData(await data.json());
            }).catch(error => {
                console.error(" >>>>>>>>>>>> ERROR FETCH GS1 ", error);
            });

            console.log(gs1Product.getData());

        },

        setInitialDates() {
            let dateRange = this.getView().byId("dateRange");
            let todayDate = new Date();
            let firstDay = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
            let lastDay = new Date(todayDate.getFullYear(), todayDate.getMonth() + 1, 0);
            dateRange.setDateValue(firstDay);
            dateRange.setSecondDateValue(lastDay);
        },

        getCatalogos: function () {
            try {

                let CatNegotiatedFormat = {
                    results: [
                        { value:'1A', text: this.getOwnerComponent().getModel("appTxts").getProperty('/products.hyperSuperOption') },
                        { value:'1B', text: this.getOwnerComponent().getModel("appTxts").getProperty('/products.expressOption') }
                    ]
                };
                let CatTiposEtiqueta = {
                    results: [
                        { value: 1, text: 'Colgar' },
                        { value: 2, text: 'Adhesiva' },
                        { value: 3, text: 'Sin Etiqueta' }
                    ]
                };

                let CatEstrategiaSalida = {
                    results: [
                        { value: 1, text: 'Liquidación' },
                        { value: 2, text: 'Devolución' }
                    ]
                };

                let UnidadVolumen = {
                    results: [
                        { value: "MM", text: 'Milimetros' },
                        { value: "CM", text: 'Centimetros' }
                    ]
                };

                let UnidadPeso = {
                    results: [
                        { value: "KGM", text: 'Gramo' },
                        { value: "GM", text: 'Kilogramo' }
                    ]
                };

                this.getOwnerComponent().getModel("Catalogos").setProperty('/NegotiatedFormat', CatNegotiatedFormat);
                this.getOwnerComponent().getModel("Catalogos").setProperty('/TiposEtiqueta', CatTiposEtiqueta);
                this.getOwnerComponent().getModel("Catalogos").setProperty('/EstrategiaSalida', CatEstrategiaSalida);
                this.getOwnerComponent().getModel("Catalogos").setProperty('/UnidadVolumen', UnidadVolumen);
                this.getOwnerComponent().getModel("Catalogos").setProperty('/UnidadPeso', UnidadPeso);

                var url = `/HdrcatproSet?$expand=ETTART,ETCOUNTRYNAV,ETCODENAV,ETBRANDSNAV,ETTCARCV,ETUWEIG,ETULONG,ETUVOL,ETUNM,ETGPOART&$filter=IOption eq '4'`;
                Model.getJsonModelAsync(url, function (response, that) {
                    let Paises = [];
                    const catPaises = response.getProperty('/results/0/ETCOUNTRYNAV/results');
                    for (let i = 0; i < catPaises.length; i++) {
                        Paises.push(catPaises[i]);
                    }
                    that.getOwnerComponent().getModel("Catalogos").setProperty('/TiposProducto', response.getProperty('/results/0/ETTART'));
                    that.getOwnerComponent().getModel("Catalogos").setProperty('/TipoCodigo', response.getProperty('/results/0/ETCODENAV'));
                    that.getOwnerComponent().getModel("Catalogos").setProperty('/UnidadMedida', response.getProperty('/results/0/ETUNM'));
                    that.getOwnerComponent().getModel("Catalogos").setProperty('/Caracteristicas', response.getProperty('/results/0/ETTCARCV'));
                    that.getOwnerComponent().getModel("Catalogos").setProperty('/GrupoArticulos', response.getProperty('/results/0/ETGPOART'));


                    var pModel = {
                        "results": Paises
                    }
                    that.getOwnerComponent().setModel(new JSONModel(pModel), "Paises");

                    that.getOwnerComponent().getModel("Paises").setSizeLimit(parseInt(Paises.length, 10));

                }, function () {
                    sap.m.MessageBox.error("No se lograron obtener los datos del proveedor registrado en GS1.");
                }, this);

                var url = `HdrcatproSet?$expand=ETPRES&$filter=IOption eq '10'`;
                Model.getJsonModelAsync(url, function (response, that) {

                    that.getOwnerComponent().getModel("Catalogos").setProperty('/Presentaciones', response.getProperty('/results/0/ETPRES'));
                }, function () {
                    sap.m.MessageBox.error("No se lograron obtener los datos del proveedor registrado en GS1.");
                }, this);

            } catch (error) {
                console.error(" Get Catalogos Error ", error);
            }
        },

        addAttach: function (oEvt) {
            var aFiles = oEvt.getParameters().files;
            var currentFile = aFiles[0];
            var that = this;

            var reader = new FileReader();
            reader.onload = function (e) {
                let oFile = {};
                oFile.IText64 = e.target.result;

                let ITEXT64 = {
                    'attach': []
                };

                ITEXT64.attach.push(oFile);
                that.getOwnerComponent().setModel(new JSONModel(ITEXT64), "ITEXT64");
            }
            reader.readAsDataURL(currentFile);
        },
        addAttachDelete: function (oEvt) {
            var aFiles = oEvt.getParameters().files;
            var currentFile = aFiles[0];
            var that = this;

            var reader = new FileReader();
            reader.onload = function (e) {
                let oFile = {};
                oFile.IText64 = e.target.result;

                let ITEXT64Delete = {
                    'attach': []
                };

                ITEXT64Delete.attach.push(oFile);
                that.getOwnerComponent().setModel(new JSONModel(ITEXT64Delete), "ITEXT64Delete");
            }
            reader.readAsDataURL(currentFile);
        },

        handleUploadPress: function () {
            let archivo = this.getOwnerComponent().getModel('ITEXT64').getProperty('/attach');
            if (archivo.length == 1) {

                let objRequest = {
                    "IOption": "16",
                    ITEXT64: [...archivo],
                    ETMODIFY: [
                        {
                            "OrgCompras": "",
                            "Centro": "",
                            "Codigoean": "",
                            "Descrip": "",
                            "Costobant": "",
                            "Costobnuevo": "",
                            "Konwa": "",
                            "Adver": ""
                        }
                    ]
                }
                var response = Model.create("/HdrcatproSet", objRequest);

                if (response != null) {
                    if (response.ESuccess == "X") {
                        //let msg = this.getOwnerComponent().getModel("appTxts").getProperty('/clarifications.msgUpdated') ;
                        if (response.ETMODIFY.results.length > 0) {
                            const registrosCargados = parseInt(response.ETMODIFY.results.length, 10);
                            const registrosCorrectos = [];

                            for (let i = 0; i < response.ETMODIFY.results.length; i++) {
                                const element = response.ETMODIFY.results[i];
                                if (element.Adver === '') registrosCorrectos.push(response.ETMODIFY.results[i]);
                            }
                            response.ETMODIFY.results = registrosCorrectos;
                            const msj = (registrosCorrectos.length === 0) ? "El archivo cargado no tiene registros válidos." : `Se encontraron ${registrosCorrectos.length} coincidencias de los ${registrosCargados} registros que contenía el archivo cargado.`;

                            MessageBox.information(msj);
                            this.getOwnerComponent().setModel(new JSONModel(response.ETMODIFY), 'ETMODIFY');
                            this.paginate("ETMODIFY", "", 1, 0);
                        } else
                            MessageBox.warning("No se encontraron folios en el archivo cargado");
                        /*sap.m.MessageBox.success( msg, {
                            actions: [sap.m.MessageBox.Action.CLOSE],
                            emphasizedAction: sap.m.MessageBox.Action.CLOSE,
                            onClose: function (sAction) {
                                
                            }.bind(this)
                        });*/
                    } else {
                        let message = response.error.message.value;
                        sap.m.MessageBox.error(message);
                    }
                } else {
                    MessageBox.error("No se pudo conectar con el servidor, intente nuevamente.");
                }
            }
            else
                MessageBox.warning("No se ha seleccionado ningún archivo para subir.")

        },
        handleUploadPressDelete: function () {
            let archivo = this.getOwnerComponent().getModel('ITEXT64Delete').getProperty('/attach');
            if (archivo.length == 1) {
                let objRequest = {
                    "IOption": "13",
                    ITEXT64: [...archivo],
                    ETDELETE: [
                        {
                            "EanUpcBase": "",
                            "HazardDescript": "",
                            "FechSumhasta": "",
                            "MotBaja": "",
                            "Comet": "",
                            "Advertencia": ""
                        }
                    ]
                }
                var response = Model.create("/HdrcatproSet", objRequest);

                if (response != null) {
                    if (response.ESuccess == "X") {
                        //let msg = this.getOwnerComponent().getModel("appTxts").getProperty('/clarifications.msgUpdated') ;
                        if (response.ETDELETE.results.length > 0) {
                            const registrosCargados = parseInt(response.ETDELETE.results.length, 10);
                            const hoy = new Date();
                            const fechaActual = hoy.getFullYear() + '-' + String('0' + (hoy.getMonth() + 1)).substr(-2) + '-' + String('0' + hoy.getDate()).substr(-2);
                            const registrosCorrectos = [];

                            for (let i = 0; i < response.ETDELETE.results.length; i++) {
                                const element = response.ETDELETE.results[i];
                                if (element.Advertencia === '') registrosCorrectos.push(response.ETDELETE.results[i]);
                            }
                            for (let x = 0; x < registrosCorrectos.length; x++) {
                                const element = registrosCorrectos[x];
                                registrosCorrectos[x].FechSumhasta = String(fechaActual);
                            }

                            response.ETDELETE.results = registrosCorrectos;
                            const msj = (registrosCorrectos.length === 0) ? "El archivo cargado no tiene registros válidos." : `Se encontraron ${registrosCorrectos.length} coincidencias de los ${registrosCargados} registros que contenía el archivo cargado.`;
                            MessageBox.information(msj);
                            this.getOwnerComponent().setModel(new JSONModel(response.ETDELETE), 'ETDELETE');
                            this.paginate("ETDELETE", "", 1, 0);
                        } else
                            MessageBox.warning("No se encontraron folios en el archivo cargado");
                        /*sap.m.MessageBox.success( msg, {
                            actions: [sap.m.MessageBox.Action.CLOSE],
                            emphasizedAction: sap.m.MessageBox.Action.CLOSE,
                            onClose: function (sAction) {
                                
                            }.bind(this)
                        });*/
                    } else {
                        let message = response.error.message.value;
                        sap.m.MessageBox.error(message);
                    }
                } else {
                    sap.m.MessageBox.error("No se pudo conectar con el servidor, intente nuevamente.");
                }
            }
            else
                MessageBox.warning("No se ha seleccionado ningún archivo para subir.")

        },
        duplicarValorInicial: function () {
            const that = this;
            MessageBox.confirm('Desea asignar el valor de la primer fila a todos los registros existentes?', function (oAction) {
                if (oAction === MessageBox.Action.OK) {
                    const modelData = that.getOwnerComponent().getModel('ETDELETE').getData();

                    const fecha = modelData.results[0].FechSumhasta;
                    const motivo = modelData.results[0].MotBaja;
                    const comentario = modelData.results[0].Comet;
                    console.log(fecha, motivo, comentario);

                    for (let i = 0; i < modelData.results.length; i++) {
                        modelData.results[i].FechSumhasta = fecha;
                        modelData.results[i].MotBaja = motivo;
                        modelData.results[i].Comet = comentario;
                    }
                    that.getOwnerComponent().setModel(new JSONModel(modelData), 'ETDELETE');
                    that.paginate("ETDELETE", "", 1, 0);
                }
            })
        },
        searchData: function () {
           /* falto dar de alta este codigo, lo dejo preparado if (!this.hasAccess()) {
                return false;
            }*/
            var dateRange = this.getView().byId("dateRange");
            //var comboStatus = this.getView().byId("comboStatus");
            var inputFolioTxt = this.getView().byId("inputFolioTxt");


            let folio = inputFolioTxt.getValue().trim();
            //let folio = "0000000943";
            //let status = comboStatus.getSelectedKey();
            //let status = 'A';

            //let proveedor_LIFNR = 21;
            let proveedor_LIFNR = (this.getConfigModel().getProperty("/supplierInputKey") != undefined) ? this.getConfigModel().getProperty("/supplierInputKey") : '';
            // format[AAAAMMDD] (2020101)
            let IStartdate = this.buildSapDate(dateRange.getDateValue());
            // format[AAAAMMDD] (2020101)
            let IEnddate = this.buildSapDate(dateRange.getSecondDateValue());
            //let IIdusua = this.getOwnerComponent().getModel("userdata").getProperty('/EIdusua');
            //let IIdusua = '';
            //console.log(this.getOwnerComponent().getModel("userdata").getJSON());

            if (folio.trim() === '' && proveedor_LIFNR == '' && dateRange.getValue() == '') {
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty('/products.msgNoFilter'));
                return false;
            }



            let filtros = [`IOption eq '2'`];

            filtros.push(`IUniqr eq '${folio}'`);

            if (folio != '') {
                filtros.push(`ISdate eq '' and IFdate eq ''`);
            }
            else {
                filtros.push(`ISdate eq '${IStartdate}' and IFdate eq '${IEnddate}'`);
                // if (status != '') filtros.push(`IStatus eq '${status}'`);
            }

            // if (String(IIdusua).trim() != '') filtros.push(`IIdusua eq '${IIdusua}'`);

            //if (proveedor_LIFNR != '' && !this.getView().byId("colSor").getSelected() ) 
            filtros.push(`ILifnr eq '${proveedor_LIFNR}'`);


            filtros = filtros.join(' and ');

            // let url = `HeaderPYMNTCSet?$expand=EPYMNTDOCSNAV,EPYMNTPRGRMNAV&$filter= IOption eq '2' and ILifnr eq '${proveedor_LIFNR}' and IStartdate eq '${IStartdate}'  and IEnddate eq '${IEnddate}'&$format=json`;
            let url = `HdrcatproSet?$expand=ETPRICNAV&$filter=${filtros}&$format=json`;


            let oODataJSONModel = this.getOdata(sUri);

            let oDataJSONModel = this.getOdataJsonModel(url, oODataJSONModel);
            let dataJSON = oDataJSONModel.getJSON();
            let Datos = JSON.parse(dataJSON);

            // console.log(Datos);

            this.getOwnerComponent().setModel(new JSONModel(Datos.results[0]), "Folios");

            this.paginate("Folios", "/ETPRICNAV", 1, 0);
        },

        clearFilters: function () {

        },

        paginar: function (selectedItem, modelName, tableName, idTable) {

            let totalRegistros = parseInt(this.getOwnerComponent().getModel(modelName).getProperty(`/${tableName}/results/length`), 10);
            let valorSeleccinado = parseInt(selectedItem.getKey(), 10);

            let tablaPrincipal = this.getView().byId(idTable);
            tablaPrincipal.setVisibleRowCount(totalRegistros < valorSeleccinado ? totalRegistros : valorSeleccinado);
            this.paginateValue(selectedItem, modelName, `/${tableName}`);
        },
        buildExportTable: function () {
            var texts = this.getOwnerComponent().getModel("appTxts");

            var columns = [
                {
                    name: texts.getProperty("/products.folioUPC"),
                    template: {
                        content: "{UniqueReference}"
                    }
                },
                {
                    name: texts.getProperty("/products.productUPC"),
                    template: {
                        content: "{EanUpcBase}"
                    }
                },
                {
                    name: texts.getProperty("/products.descriptionUPC"),
                    template: {
                        content: "{HazardDescript}"
                    }
                },
                {
                    name: texts.getProperty("/products.typeUPC"),
                    template: {
                        content: "{Zzstatus}"
                    }
                },
                {
                    name: texts.getProperty("/products.dateUPC"),
                    template: {
                        content: "{ValidityBase}"
                    }
                },
                {
                    name: texts.getProperty("/products.dateStatusUPC"),
                    template: {
                        content: "{TakeOverDate}"
                    }
                },
                {
                    name: texts.getProperty("/products.statusUPC"),
                    template: {
                        content: "{ProcStatus}"
                    }
                },
                {
                    name: texts.getProperty("/products.descriptionStatusUPC"),
                    template: {
                        content: "{Pristate}"
                    }
                }
            ];

            this.exportxls('Folios', '/ETPRICNAV/results', columns);
        },
        newProduct: function () {
            if (!this.hasAccess(42)) {
                return false;
            }
            try {
                var oView = this.getView();

                //var that = this;

                if (this.getConfigModel().getProperty("/supplierInputKey") != null && this.getConfigModel().getProperty("/supplierInputKey") != "") {
                    // if( true ){
                    this.validateDataSupplier(this.getConfigModel().getProperty("/supplierInputKey"))
                    // create Dialog
                    if (!this._pDialog) {
                        this._pDialog = Fragment.load({
                            id: oView.getId(),
                            name: "demo.views.Products.fragments.WizardNewProduct",
                            controller: this
                        }).then(function (oDialog) {
                            oDialog.attachAfterOpen(this.onDialogAfterOpen, this);
                            oView.addDependent(oDialog);
                            oView.byId("country").setFilterFunction(function (sTerm, oItem) {
                                // A case-insensitive "string contains" style filter
                                return oItem.getText().match(new RegExp(sTerm, "i"));
                            });

                            return oDialog;
                        }.bind(this));
                    }
                    this._pDialog.then(function (oDialog) {
                        //oView.byId("negotiatedFormat").setSelectedIndex(0).fireSelect();
                        oDialog.open();

                    });



                }
                else
                    sap.m.MessageBox.error("Debe selecionar un proveedor para continuar.");

            } catch (err) {
                sap.m.MessageBox.error("Ocurrió una excepción al inicializar un nuevo folio.");
                console.error(err);
            }
        },
        changePriceProduct: function () {
           
            if (!this.hasAccess(43)) {
                return false;
            }
            try {
                var oView = this.getView();

                //var that = this;

                // if (this.getConfigModel().getProperty("/supplierInputKey") != null && this.getConfigModel().getProperty("/supplierInputKey") != "") {
                // if( true ){

                // create Dialog
                if (!this._cpDialog) {
                    this._cpDialog = Fragment.load({
                        id: oView.getId(),
                        name: "demo.views.Products.fragments.WizardChangePriceProduct",
                        controller: this
                    }).then(function (oDialog) {
                        oDialog.attachAfterClose(() => {
                            this.getOwnerComponent().setModel(new JSONModel(), 'ETMODIFY');
                            this.byId('fileUploader').clear();
                        }, this);
                        this.getOwnerComponent().setModel(new JSONModel(), 'ETMODIFY');
                        oView.addDependent(oDialog);
                        return oDialog;
                    }.bind(this));
                }
                this._cpDialog.then(function (oDialog) {
                    oDialog.open();
                });

                // }
                // else
                // sap.m.MessageBox.error("Debe selecionar un proveedor para continuar.");

            } catch (err) {
                sap.m.MessageBox.error("Ocurrió una excepción al inicializar un nuevo folio.");
                console.error(err);
            }
        },
        deleteProducts: function () {
            if (!this.hasAccess(44)) {
                return false;
            }
            try {
                var oView = this.getView();

                //var that = this;

                // if (this.getConfigModel().getProperty("/supplierInputKey") != null && this.getConfigModel().getProperty("/supplierInputKey") != "") {
                // if( true ){

                // create Dialog
                if (!this._dpDialog) {
                    this._dpDialog = Fragment.load({
                        id: oView.getId(),
                        name: "demo.views.Products.fragments.FragmentsDeleteProducts",
                        controller: this
                    }).then(function (oDialog) {
                        oDialog.attachAfterClose(() => {
                            this.getOwnerComponent().setModel(new JSONModel(), 'ETDELETE');
                            this.byId('fileUploaderDelete').clear();
                        }, this);
                        this.getOwnerComponent().setModel(new JSONModel(), 'ETDELETE');
                        oView.addDependent(oDialog);
                        return oDialog;
                    }.bind(this));
                }
                this._dpDialog.then(function (oDialog) {
                    oDialog.open();
                });

                // }
                // else
                // sap.m.MessageBox.error("Debe selecionar un proveedor para continuar.");

            } catch (err) {
                sap.m.MessageBox.error("Ocurrió una excepción al inicializar el proceso de baja.");
                console.error(err);
            }
        },

        validateDataSupplier: function (ILifnr_proveedor) {
            try {

                var url = `/HdrcatproSet?$expand=ETTART,ETCOUNTRYNAV,ETCODENAV,ETBRANDSNAV&$filter=IOption eq '8' and ILifnr eq '${ILifnr_proveedor}'`;
                Model.getJsonModelAsync(url, function (response, that) {

                    swProveedorEnGS1 = (response.getProperty('/results/0/Esdprov/GnlSucces') === 'X');
                    swProveedorExcluido = (response.getProperty('/results/0/Esexprov/Zexc') === 'X');
                    if (!swProveedorEnGS1 && !swProveedorExcluido) {
                        MessageBox.error("El proveedor no se encuentra habilitado para alta de productos.", {
                            onClose: function () {
                                that.getView().byId('wizardDialog').close();
                            }
                        });
                    }

                    that.byId('btnValidateDataSupplierGS1').setEnabled(swProveedorEnGS1);

                    let codeGS1 = response.getProperty('/results/0/Esdprov/Gnl');
                    let country = response.getProperty('/results/0/Esdprov/Land1');
                    let countryName = response.getProperty('/results/0/Esdprov/Landx50');
                    that.getView().byId('codeGS1').setValue(codeGS1);
                    that.getView().byId('country').setSelectedKey(country).setValue(countryName);
                }, function () {
                    MessageBox.error("No se lograron obtener los datos del proveedor registrado en GS1.");
                }, this);

            } catch (error) {
                MessageBox.error("No se lograron obtener los datos del proveedor registrado en GS1.");
                console.warn(error);
            }
        },

        validateBarCode: function () {
            const ModelFolio = this.getOwnerComponent().getModel("Folio");

            if (ModelFolio.getProperty('/CodEan') == undefined || ModelFolio.getProperty('/CodEan').trim() == '') {
                this.getView().byId('barCode').setValueState(sap.ui.core.ValueState.Error);
                return false;
            }
            else
                this.getView().byId('barCode').setValueState(sap.ui.core.ValueState.None);

            const barCode = ModelFolio.getProperty('/CodEan').trim()

            const url = `/HdrcatproSet?$expand=ETUWEIG,ETULONG,ETUVOL,ETUNM&$filter=IOption eq '7' and IEanv  eq '${barCode}'`;

            var response = Model.getJsonModel(url);

            if (response.getProperty("/results/0/ESuccess") === "X") {
                MessageBox.success("Artículo apto para registro.", {
                    onClose: () => {
                        this.getView().byId('barCode').setValueState(sap.ui.core.ValueState.Success);
                    }
                });
            }
            else {
                MessageBox.error("Este artículo ya se encuentra registrado.", {
                    onClose: () => {
                        this.getView().byId('barCode').setValueState(sap.ui.core.ValueState.Warning);
                    }
                });
            }

        },
        onDialogAfterOpen: function () {
            this._oWizard = this.byId("CreateProductWizard");

            this.handleButtonsVisibility();
        },
        onDialogDeleteOpen: function () {
            this._oWizard = this.byId("DeleteProductsWizard");

            this.handleButtonsVisibility();
        },

        onDialogNextButton: function () {
            this._oWizard.getProgressStep().fireComplete();

            if (this._oWizard.getProgressStep().getValidated()) {
                this._oWizard.nextStep();
            }

            this.handleButtonsVisibility();
        },

        closeDialog: function (idDialog) {
            this.byId(idDialog).close();
        },

        onDialogBackButton: function () {
            const currentStepID = this._oWizard.previousStep().getCurrentStep();
            const idStep = currentStepID.split('--')[1];
            this.byId(idStep).setValidated(false);
            this.handleButtonsVisibility();
        },

        handleWizardSubmit: function () {
            this._handleMessageBoxOpen(this.getOwnerComponent().getModel("appTxts").getProperty('/products.msgSubmitNewProduct'), "confirm");
        },

        handleButtonsVisibility: function () {
            var oModel = this.getView().getModel();
            switch (this._oWizard.getProgress()) {
                case 1:
                    oModel.setProperty("/nextButtonVisible", true);
                    oModel.setProperty("/nextButtonEnabled", true);
                    oModel.setProperty("/backButtonVisible", false);
                    oModel.setProperty("/reviewButtonVisible", false);
                    oModel.setProperty("/finishButtonVisible", false);
                    break;
                case 2:
                    oModel.setProperty("/backButtonVisible", true);
                    break;
                case 3:
                    oModel.setProperty("/nextButtonVisible", true);
                    oModel.setProperty("/reviewButtonVisible", false);
                    break;
                case 4:
                    oModel.setProperty("/nextButtonVisible", true);
                    oModel.setProperty("/reviewButtonVisible", false);
                    break;
                case 5:
                    oModel.setProperty("/nextButtonVisible", true);
                    oModel.setProperty("/reviewButtonVisible", false);
                    break;
                case 6:
                    oModel.setProperty("/nextButtonVisible", false);
                    oModel.setProperty("/reviewButtonVisible", true);
                    oModel.setProperty("/finishButtonVisible", false);
                    break;
                case 7:
                    this.cloneFolioModel();
                    oModel.setProperty("/finishButtonVisible", true);
                    oModel.setProperty("/backButtonVisible", true);
                    oModel.setProperty("/reviewButtonVisible", false);
                    break;
                default: break;
            }

        },
        handleWizardCancel: function () {
            this._handleMessageBoxOpen(this.getOwnerComponent().getModel("appTxts").getProperty('/products.msgCancelNewProduct'), "warning");
        },

        _handleMessageBoxOpen: function (sMessage, sMessageBoxType) {

            MessageBox[sMessageBoxType](sMessage, {

                actions: [MessageBox.Action.YES, MessageBox.Action.NO],

                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.YES) {

                        if (sMessageBoxType == "confirm") {

                            let folioModel = JSON.parse(this.getOwnerComponent().getModel("Folio").getJSON());
                            folioModel.TMoneda = "MXN";
                            folioModel.Lifnr = this.getConfigModel().getProperty("/supplierInputKey");
                            folioModel.EanUpcBase = folioModel.CodEan;
                            let createObjReq = {
                                "IOption": "5",
                                "ITREC": [
                                    folioModel
                                ],
                                "ITARTVAR": [
                                ]
                            };

                            console.log(" >>>>>>> CREATING PRDUCT: ", createObjReq);
                            console.log(" >>>>>>> CREATING PRDUCT String: ", JSON.stringify(createObjReq));
                            // ** Nota Model.create(endpoint,data) No trabaja ni con callback ni con promesa Solo recepcion syncrona
                            let resp = Model.create("/HdrcatproSet", createObjReq);

                            console.log("Respuesta Create: ", resp);

                            if (resp.ESuccess) {

                                MessageBox.success(resp.EMessage);

                                setTimeout(function () {
                                    this._oWizard.discardProgress(this._oWizard.getSteps()[0]);
                                    this.byId("wizardDialog").close();
                                    this.getOwnerComponent().getModel("Folio").setData({});
                                }, 3000);

                            } else {

                                MessageBox.error(resp.mensaje);

                            }

                        }

                    }
                }.bind(this)

            });
        },

        cloneFolioModel() {
            let Folio = JSON.parse(this.getOwnerComponent().getModel("Folio").getJSON());

            Folio.TipEtq = formatterCatPrd.findPropertieValue("value", "text", Folio.TipEtq,
                this.getOwnerComponent().getModel("Catalogos").getProperty('/TiposEtiqueta'));

            Folio.EstSalida = formatterCatPrd.findPropertieValue("value", "text", Folio.EstSalida,
                this.getOwnerComponent().getModel("Catalogos").getProperty('/EstrategiaSalida'));

            Folio.ForNegoc = formatterCatPrd.findPropertieValue("value", "text", Folio.ForNegoc,
            this.getOwnerComponent().getModel("Catalogos").getProperty('/NegotiatedFormat'));

            Folio.EcUndvol = formatterCatPrd.findPropertieValue("value", "text", Folio.EcUndvol,
                this.getOwnerComponent().getModel("Catalogos").getProperty('/UnidadVolumen'));

            Folio.EcUndp = formatterCatPrd.findPropertieValue("value", "text", Folio.EcUndp,
                this.getOwnerComponent().getModel("Catalogos").getProperty('/UnidadPeso'));

            Folio.PvUndvol = formatterCatPrd.findPropertieValue("value", "text", Folio.PvUndvol,
                this.getOwnerComponent().getModel("Catalogos").getProperty('/UnidadVolumen'));

            Folio.PvUndp = formatterCatPrd.findPropertieValue("value", "text", Folio.PvUndp,
                this.getOwnerComponent().getModel("Catalogos").getProperty('/UnidadPeso'));

            Folio.Pais = formatterCatPrd.findPropertieValue("Land1", "Landx50", Folio.Pais,
                JSON.parse(this.getOwnerComponent().getModel("Paises").getJSON()));

            Folio.Marca = formatterCatPrd.findPropertieValue("BrandId", "Brand", Folio.Marca,
                JSON.parse(this.getOwnerComponent().getModel("Brands").getJSON()));

            Folio.TipArt = formatterCatPrd.findPropertieValue("Mtart", "Mtbez", Folio.TipArt,
                this.getOwnerComponent().getModel("Catalogos").getProperty('/TiposProducto'));

            // Folio.ProdBase = formatterCatPrd.findPrdBaseDesc(Folio.ProdBase,
            //                 JSON.parse(this.getOwnerComponent().getModel("ProductosBase").getJSON()));

            Folio.EanUpcType = formatterCatPrd.findPropertieValue("Numtp", "Ntbez", Folio.EanUpcType,
            this.getOwnerComponent().getModel("Catalogos").getProperty('/TipoCodigo'));

            Folio.GrupArt = formatterCatPrd.findPropertieValue("GrupoArt", "DescGart", Folio.GrupArt,
            this.getOwnerComponent().getModel("Catalogos").getProperty('/GrupoArticulos'));

            Folio.Present = formatterCatPrd.findPropertieValue("AbrPres", "Descpres", Folio.Present,
            this.getOwnerComponent().getModel("Catalogos").getProperty('/Presentaciones'));

            Folio.UndCont = formatterCatPrd.findPropertieValue("IsoCode", "Unidad", Folio.UndCont,
            this.getOwnerComponent().getModel("Catalogos").getProperty('/UnidadMedida'));

            Folio.UndMventa = formatterCatPrd.findPropertieValue("IsoCode", "Unidad", Folio.UndMventa,
            this.getOwnerComponent().getModel("Catalogos").getProperty('/UnidadMedida'));

            Folio.UndCompra = formatterCatPrd.findPropertieValue("IsoCode", "Unidad", Folio.UndCompra,
            this.getOwnerComponent().getModel("Catalogos").getProperty('/UnidadMedida'));

            this.getOwnerComponent().getModel("FolioToShow").setData({ ...Folio });

            console.log(this.getOwnerComponent().getModel("FolioToShow").getData());
        },

        productTypeComplete: function (oControlEvent) {

            // if (this.getView().byId('ProductTypeStep').getValidated()) {
            //     console.log(">>>>>>>>>>> ENTRA AL IF ProductTypeStep <<<<<<<<<<<<<------ ");
            //     return true;
            // }

            let validated = true;

            const ModelFolio = this.getOwnerComponent().getModel("Folio");

            // Barcode - EAN
            if (ModelFolio.getProperty('/CodEan') == undefined || ModelFolio.getProperty('/CodEan').trim() == '') {
                validated = false;
                this.getView().byId('barCode').setValueState(sap.ui.core.ValueState.Error);
            }
            // }else if (this.getView().byId('barCode').getValueState() !== sap.ui.core.ValueState.Success && swProveedorEnGS1) {
            //     validated = false;
            //     console.log(">>>>>>>> EAN IF 2 <<<<<<<<<<<<< ", swProveedorEnGS1);
            // }
            else {
                this.getView().byId('barCode').setValueState(sap.ui.core.ValueState.None);
            }

            // Prodcuto Base
            if (ModelFolio.getProperty('/ProdBase') == undefined || ModelFolio.getProperty('/ProdBase').trim() == '') {
                validated = false;
                this.getView().byId('baseProduct').setValueState(sap.ui.core.ValueState.Error);
            } else {
                this.getView().byId('baseProduct').setValueState(sap.ui.core.ValueState.None);
            }

            // Tipo artículo -Tipo producto
            if (ModelFolio.getProperty('/TipArt') == undefined || ModelFolio.getProperty('/TipArt').trim() == '') {
                validated = false;
                this.getView().byId('productType').setValueState(sap.ui.core.ValueState.Error);
            } else {
                // let tipoProd = this.getView().byId("productType").getValue();
                // this.getOwnerComponent().getModel("FolioToShow").setProperty("/TipArt", tipoProd);
                this.getView().byId('productType').setValueState(sap.ui.core.ValueState.None);
            }

            // Marca -Brand
            if (ModelFolio.getProperty('/Marca') == undefined || ModelFolio.getProperty('/Marca').trim() == '') {
                validated = false;
                this.getView().byId('brand').setValueState(sap.ui.core.ValueState.Error);
            }
            else {
                // let marca = this.getView().byId("brand").getValue();
                // this.getOwnerComponent().getModel("FolioToShow").setProperty("/Marca", marca);
                this.getView().byId('brand').setValueState(sap.ui.core.ValueState.None);
            }

            // Tipo código - EAN type
            if (ModelFolio.getProperty('/EanUpcType') == undefined || ModelFolio.getProperty('/EanUpcType').trim() == '') {
                validated = false;
                this.getView().byId('codeType').setValueState(sap.ui.core.ValueState.Error);
            }
            else {
                // let tipoEan = this.getView().byId("codeType").getValue();
                // this.getOwnerComponent().getModel("FolioToShow").setProperty("/EanUpcType", tipoEan);
                this.getView().byId('codeType').setValueState(sap.ui.core.ValueState.None);
            }

            // Pais -country
            if (ModelFolio.getProperty('/Pais') == undefined || ModelFolio.getProperty('/Pais').trim() == '') {
                validated = false;
                this.getView().byId('country').setValueState(sap.ui.core.ValueState.Error);
            }
            else {
                // let pais = this.getView().byId("country").getValue();
                // this.getOwnerComponent().getModel("FolioToShow").setProperty("/Pais", pais);
                this.getView().byId('country').setValueState(sap.ui.core.ValueState.None);
            }

            // Descripción - Description
            if (ModelFolio.getProperty('/DescrArt') == undefined || ModelFolio.getProperty('/DescrArt').trim() == '') {
                validated = false;
                this.getView().byId('description').setValueState(sap.ui.core.ValueState.Error);
            } else {
                // let desc = this.getView().byId("description").getValue();
                // this.getOwnerComponent().getModel("FolioToShow").setProperty("/DescrArt", desc);
                this.getView().byId('description').setValueState(sap.ui.core.ValueState.None);
            }

            // Estrategia de salida - exit strategy
            if (ModelFolio.getProperty('/EstSalida') == undefined || ModelFolio.getProperty('/EstSalida').trim() == '') {
                validated = false;
                this.getView().byId('exitStrategy').setValueState(sap.ui.core.ValueState.Error);
            }
            else {
                // let stra = this.getView().byId("exitStrategy").getValue();
                // this.getOwnerComponent().getModel("FolioToShow").setProperty("/EstSalida", stra);
                this.getView().byId('exitStrategy').setValueState(sap.ui.core.ValueState.None);
            }

            this.getView().byId('ProductTypeStep').setValidated(validated || _testingSteps);

        },

        activateProductPresentation: function () {
            //if (this.getView().byId('ProductPresentation').getValidated()) return true;

            let validated = true;
            let selectedVariantes = false;

            const ModelFolio = this.getOwnerComponent().getModel("Folio");

            // Presentation
            if (ModelFolio.getProperty('/Present') == undefined || ModelFolio.getProperty('/Present').trim() == '') {
                validated = false;
                this.getView().byId('presentation').setValueState(sap.ui.core.ValueState.Error);
            }
            else {
                // let present = this.getView().byId("presentation").getValue();
                // this.getOwnerComponent().getModel("FolioToShow").setProperty("/Present", present);
                this.getView().byId('presentation').setValueState(sap.ui.core.ValueState.None);
            }

            // Contenido
            if (ModelFolio.getProperty('/Contenido') == undefined || ModelFolio.getProperty('/Contenido').trim() == '') {
                validated = false;
                this.getView().byId('content').setValueState(sap.ui.core.ValueState.Error);
            }
            else {
                // let content = this.getView().byId("content").getValue();
                // this.getOwnerComponent().getModel("FolioToShow").setProperty("/Contenido", content);
                this.getView().byId('content').setValueState(sap.ui.core.ValueState.None);
            }

            // Unidad de medida de Contenido
            if (ModelFolio.getProperty('/UndCont') == undefined || ModelFolio.getProperty('/UndCont').trim() == '') {
                validated = false;
                this.getView().byId('contentUnit').setValueState(sap.ui.core.ValueState.Error);
            }
            else {
                // let content = this.getView().byId("contentUnit").getValue();
                // this.getOwnerComponent().getModel("FolioToShow").setProperty("/UndCont", content);
                this.getView().byId('contentUnit').setValueState(sap.ui.core.ValueState.None);
            }


            // Código de venta
            if (ModelFolio.getProperty('/CodVent') == undefined || ModelFolio.getProperty('/CodVent').trim() == '') {
                validated = false;
                this.getView().byId('salesCode').setValueState(sap.ui.core.ValueState.Error);
            }
            else {
                // let content = this.getView().byId("salesCode").getValue();
                // this.getOwnerComponent().getModel("FolioToShow").setProperty("/CodVent", content);
                this.getView().byId('salesCode').setValueState(sap.ui.core.ValueState.None);
            }


            // Unidad de medida de venta
            if (ModelFolio.getProperty('/UndMventa') == undefined || ModelFolio.getProperty('/UndMventa').trim() == '') {
                validated = false;
                this.getView().byId('salesUnit').setValueState(sap.ui.core.ValueState.Error);
            }
            else {
                // let content = this.getView().byId("salesUnit").getValue();
                // this.getOwnerComponent().getModel("FolioToShow").setProperty("/UndMventa", content);
                this.getView().byId('salesUnit').setValueState(sap.ui.core.ValueState.None);
            }

            // Codigo unidad de compra
            if (ModelFolio.getProperty('/CodCompra') == undefined || ModelFolio.getProperty('/CodCompra').trim() == '') {
                validated = false;
                this.getView().byId('purchaseUnitCode').setValueState(sap.ui.core.ValueState.Error);
            }
            else {
                // let content = this.getView().byId("purchaseUnitCode").getValue();
                // this.getOwnerComponent().getModel("FolioToShow").setProperty("/CodCompra", content);
                this.getView().byId('purchaseUnitCode').setValueState(sap.ui.core.ValueState.None);
            }

            // Unidad de compra
            if (ModelFolio.getProperty('/UndCompra') == undefined || ModelFolio.getProperty('/UndCompra').trim() == '') {
                validated = false;
                this.getView().byId('purchaseUnit').setValueState(sap.ui.core.ValueState.Error);
            }
            else {
                // let content = this.getView().byId("purchaseUnit").getValue();
                // this.getOwnerComponent().getModel("FolioToShow").setProperty("/UndCompra", content);
                this.getView().byId('purchaseUnit').setValueState(sap.ui.core.ValueState.None);
            }

            // Capacidad de empaque
            if (ModelFolio.getProperty('/CapEmpaq') == undefined || ModelFolio.getProperty('/CapEmpaq').trim() == '' || ModelFolio.getProperty('/CapEmpaq').trim().length > 5) {
                validated = false;
                this.getView().byId('boardingCapacity').setValueState(sap.ui.core.ValueState.Error);

                if (ModelFolio.getProperty('/CapEmpaq').trim().length > 5)
                    this.getView().byId('boardingCapacity').setValueStateText("Este camo es obligatorio y deben ser maximo 5 caracteres");
            }
            else {

                // let content = this.getView().byId("boardingCapacity").getValue();
                // this.getOwnerComponent().getModel("FolioToShow").setProperty("/CapEmpaq", content);
                this.getView().byId('boardingCapacity').setValueState(sap.ui.core.ValueState.None);
            }


            selectedVariantes = this.getView().byId('variants').getSelected();

            if (selectedVariantes && this.getView().byId('characteristic').getValue() == '') {
                validated = false;
                this.getView().byId('characteristic').setValueState(sap.ui.core.ValueState.Error);
            }
            else
                this.getView().byId('characteristic').setValueState(sap.ui.core.ValueState.None);

            if (validated && selectedVariantes) {
                this.getTallasColores();
            }
            else if (validated && !selectedVariantes) {
                this.getView().byId('VariantStep').setValidated(true);
                this.getView().byId('ProductPresentation').setNextStep(this.getView().byId('DimensionsStep'));
            }

            this.getView().byId('newVariant').setVisible(selectedVariantes).setEnabled(selectedVariantes);
            this.getView().byId('ProductPresentation').setValidated(validated || _testingSteps);
        },

        completeValidateVariantStep: function () {


            // this.getView().byId('VariantStep').setValidated(!this.getView().byId('variants').getSelected());
            // if (this.getView().byId('VariantStep').getValidated()) return true;

            let validated = true;

            const rows = this.getView().getModel('ITARTVAR').getProperty('/results');

            for (let i = 0; i < rows.length; i++) {
                const rowPresentacion = rows[i];

                if (rowPresentacion.Proporcion == undefined || rowPresentacion.Proporcion.trim() == '') {
                    validated = false;
                }
                if (rowPresentacion.CodCompra == undefined || rowPresentacion.CodCompra.trim() == '') {
                    validated = false;
                }
                if (rowPresentacion.CodVent == undefined || rowPresentacion.CodVent.trim() == '') {
                    validated = false;
                }
                // if( rowPresentacion.index == undefined || rowPresentacion.index.trim() == '' )
                // validated = false;

                if (rowPresentacion.CaracTalla == undefined || rowPresentacion.CaracTalla.trim() == '') {
                    validated = false;
                }
                if (rowPresentacion.Colsabaro == undefined || rowPresentacion.Colsabaro.trim() == '') {
                    validated = false;
                }

            }

            if (!validated) {
                sap.m.MessageBox.warning("Existen datos faltantes de captura en las variantes.");
            }

            this.getView().byId('VariantStep').setValidated(validated || _testingSteps);
        },

        calcularECVolumen: function (oControlEvent) {

            let ecalto = this.byId("EcAlto").getValue();
            let ecancho = this.byId("EcAncho").getValue();
            let ecprofundo = this.byId("EcProfundo").getValue();

            let volumen = parseFloat(ecalto) * parseFloat(ecancho) * parseFloat(ecprofundo);

            this.byId("EcVolumen").setValue(volumen);
            // this.getOwnerComponent().getModel("FolioToShow").setProperty("/EcVolumen", Folio.PvVolumen);

        },

        calcularPvVolumen: function (oControlEvent) {

            let pvalto = this.byId("PvAlto").getValue();
            let pvancho = this.byId("PvAncho").getValue();
            let pvprofundo = this.byId("PvProfundo").getValue();

            let volumen = parseFloat(pvalto) * parseFloat(pvancho) * parseFloat(pvprofundo);

            this.byId("PvVolumen").setValue(volumen);
            // this.getOwnerComponent().getModel("FolioToShow").setProperty("/PvVolumen", Folio.PvVolumen);

        },

        validateCompleteStepDimensions: function () {

            let validated = true;

            //obtenemos el modelo 
            let Folio = JSON.parse(this.getOwnerComponent().getModel("Folio").getJSON());

            if (Folio.EcAlto == undefined || Folio.EcAlto.trim() == '') {
                validated = false;
            }

            if (Folio.EcAncho == undefined || Folio.EcAncho.trim() == '') {
                validated = false;
            }

            if (Folio.EcProfundo == undefined || Folio.EcProfundo.trim() == '') {
                validated = false;
            }

            if (Folio.EcUndaap == undefined || Folio.EcUndaap.trim() == '') {
                validated = false;
            }
            if (Folio.EcVolumen == undefined || Folio.EcVolumen.trim() == '') {
                validated = false;
            }

            if (Folio.EcUndvol == undefined || Folio.EcUndvol.trim() == '') {
                validated = false;
            }
            if (Folio.EcPbruto == undefined || Folio.EcPbruto.trim() == '') {
                validated = false;
            }
            if (Folio.EcPneto == undefined || Folio.EcPneto.trim() == '') {
                validated = false;
            }
            if (Folio.EcUndp == undefined || Folio.EcUndp.trim() == '') {
                validated = false;
            }

            if (Folio.PvAlto == undefined || Folio.PvAlto.trim() == '') {
                validated = false;
            }
            if (Folio.PvAncho == undefined || Folio.PvAncho.trim() == '') {
                validated = false;
            }
            if (Folio.PvProfundo == undefined || Folio.PvProfundo.trim() == '') {
                validated = false;
            }
            if (Folio.PvUndaap == undefined || Folio.PvUndaap.trim() == '') {
                validated = false;
            }

            if (Folio.PvVolumen == undefined || Folio.PvVolumen.trim() == '') {
                validated = false;
            }

            if (Folio.PvUndvol == undefined || Folio.PvUndvol.trim() == '') {
                validated = false;
            }
            if (Folio.PvPbruto == undefined || Folio.PvPbruto.trim() == '') {
                validated = false;
            }
            if (Folio.PvPneto == undefined || Folio.PvPneto.trim() == '') {
                validated = false;
            }
            if (Folio.PvUndp == undefined || Folio.PvUndp.trim() == '') {
                validated = false;
            }

            if (Folio.CodTarima == undefined || Folio.CodTarima.trim() == '') {
                validated = false;
            }
            if (Folio.CajasTend == undefined || Folio.CajasTend.trim() == '') {
                validated = false;
            }
            if (Folio.TendTarima == undefined || Folio.TendTarima.trim() == '') {
                validated = false;
            }
            if (Folio.CajasTarima == undefined || Folio.CajasTarima.trim() == '') {
                validated = false;
            }

            if (!validated) {
                sap.m.MessageBox.warning("Existen datos faltantes de captura.");
            }

            //Validaciones PAso Dimensiones

            this.getView().byId('DimensionsStep').setValidated(validated || _testingSteps);

            console.log(">>>>>>>>>>>>>>> TERMINO VALIDACION DIMESIONES <<<<<<<<<<<<<<<<<<<<");
            console.log("-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-");

        },

        validateDiscounts: function () {

            let validated = true;

            //obtenemos el modelo 
            const Folio = JSON.parse(this.getOwnerComponent().getModel("Folio").getJSON());

            // if (Folio.CapEmbar == undefined || Folio.CapEmbar.trim() == '') validated = false;
            if (Folio.CostoB == undefined || Folio.CostoB.trim() == '') validated = false;
            // if (Folio.CostNetComp == undefined || Folio.CostNetComp.trim() == '') validated = false;
            // if (Folio.CostNetVen == undefined || Folio.CostNetVen.trim() == '') validated = false;
            if (Folio.PSug == undefined || Folio.PSug.trim() == '') validated = false;

            if (!validated) {
                sap.m.MessageBox.warning("Faltan datos por capturar");
            }

            //Validaciones PAso Dimensiones

            this.getView().byId('Discounts').setValidated(validated || _testingSteps);
        },

        calcularCostNetCom: async function (oControlEvent) {

            let costob = (this.byId("CostoB").getValue()) ? this.byId("CostoB").getValue() : 0;
            let porcentajesXaplicar = [];
            porcentajesXaplicar.push((this.byId("DscNormal").getValue()) ? this.byId("DscNormal").getValue() / 100 : 0);
            porcentajesXaplicar.push((this.byId("DscNormal2").getValue()) ? this.byId("DscNormal2").getValue() / 100 : 0);
            porcentajesXaplicar.push((this.byId("DscNormal3").getValue()) ? this.byId("DscNormal3").getValue() / 100 : 0);
            porcentajesXaplicar.push((this.byId("DscAdicional").getValue()) ? this.byId("DscAdicional").getValue() / 100 : 0);
            porcentajesXaplicar.push((this.byId("DscPpago").getValue()) ? this.byId("DscPpago").getValue() / 100 : 0);
            porcentajesXaplicar.push((this.byId("ValBoni").getValue()) ? this.byId("ValBoni").getValue() / 100 : 0);

            let costnetcom = costob;

            await porcentajesXaplicar.forEach(function (porcentaje) {
                costnetcom -= (costnetcom * (porcentaje))
            });

            // this.byId("CostNetComp").setValue(costnetcom);
        },

        calcularCostNetVen: function (oControlEvent) {

            let costob = (this.byId("CostoB").getValue()) ? this.byId("CostoB").getValue() : 0;
            let capembar = (this.byId("CapEmbar").getValue() && this.byId("CapEmbar").getValue() > 0) ? this.byId("CapEmbar").getValue() : 1;

            let costnetven = parseFloat(costob) / parseFloat(capembar);

            // this.byId("CostNetVen").setValue(costnetven);

            this.calcularCostNetCom(null);

        },

        changeGrupArt: function (oControlEvent) {
            let oselectedItem = oControlEvent.getParameter("selectedItem");
            if (!oselectedItem)
                return;
            this.getOwnerComponent().getModel("FolioToShow").setProperty("/GrupoArt", oselectedItem.getText());
        },

        getTallasColores: function () {
            const caracteristica = this.getView().byId('characteristic').getValue();

            let url = `HdrcatproSet?$expand=ETCSA,ETTALLA&$filter=IOption eq '9'  and IName eq '${caracteristica}'`;

            var response = Model.getJsonModel(url);


            const CatTallas = response.getProperty("/results/0/ETTALLA");
            const CatColorSaborAroma = response.getProperty("/results/0/ETCSA")

            this.getOwnerComponent().getModel("Catalogos").setProperty('/TallaSize', CatTallas);
            this.getOwnerComponent().getModel("Catalogos").setProperty('/ColorSaborAroma', CatColorSaborAroma);
        },

        onSelectNegotiatedFormat: function (oEvent) {
            let selectedIndex = oEvent.getParameters().selectedIndex || 0;
            this.getOwnerComponent().getModel("Folio").setProperty('/ForNegoc', CatNegotiatedFormat[selectedIndex]);
        },

        onBaseProductRequest: function () {
            var oView = this.getView();

            if (!this._pSearchBaseProduct) {
                this._pSearchBaseProduct = sap.ui.core.Fragment.load({
                    id: oView.getId(),
                    name: "demo.views.Products.fragments.SearchBaseProduct",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }
            this._pSearchBaseProduct.then(function (oDialog) {
                oDialog.open();
            });
        },

        onBaseProductSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");

            var response = Model.getJsonModel(`/HdrcatproSet?$expand=ETPBASE&$filter=IOption eq '14' and IName eq '${sValue}'`);

            var tablas = response.getProperty("/results/0/ETPBASE");
            if (tablas != null) {
                this.getOwnerComponent().setModel(new JSONModel(tablas), 'ProductosBase');
            }
        },

        onBaseProductClose: function (oEvent) {
            let oSelectedContexts = oEvent.getParameter("selectedContexts");
            let oSelectedItem = oEvent.getParameter("selectedItem");

            oSelectedItem = oSelectedContexts.find(element => element.getObject().NumLinea == oSelectedItem.getDescription());

            //oEvent.getSource().getBinding("items").filter([]);

            console.log(">>>>>>>> Producto Base Selected: ", oSelectedItem.getObject());

            if (!oSelectedItem) {
                return;
            }

            this.getOwnerComponent().getModel('Folio').setProperty("/ProdBase", oSelectedItem.getObject().DescLinea);
            //this.getOwnerComponent().getModel('Folio').setProperty("/EanUpcBase", oSelectedItem.getObject().NumLinea);
            this.getOwnerComponent().getModel('Folio').setProperty("/PurGroup", oSelectedItem.getObject().GrupoCompras);
            this.getOwnerComponent().getModel('FolioToShow').setProperty("/ProdBase", oSelectedItem.getObject().DescLinea);
            // this.getOwnerComponent().getModel('FolioToShow').setProperty("/PurGroup", oSelectedItem.getObject().DescGcom);
            //this.setActiveLifnr(oSelectedItem.getTitle(), oSelectedItem.getDescription());

        },

        onBrandRequest: function () {
            var oView = this.getView();

            if (!this._pSearchBrand) {
                this._pSearchBrand = sap.ui.core.Fragment.load({
                    id: oView.getId(),
                    name: "demo.views.Products.fragments.SearchBrand",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }
            this._pSearchBrand.then(function (oDialog) {
                oDialog.open();
            });
        },
        onBrandSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");


            var response = Model.getJsonModel(`/HdrcatproSet?$expand=ETBRANDSNAV&$filter=IOption eq '15' and IName eq '${sValue}'`);

            var tablas = response.getProperty("/results/0/ETBRANDSNAV");
            if (tablas != null) {
                this.getOwnerComponent().setModel(new JSONModel(tablas), 'Brands');
            }
        },

        onBrandClose: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            //oEvent.getSource().getBinding("items").filter([]);

            if (!oSelectedItem) {
                return;
            }

            this.getOwnerComponent().getModel('Folio').setProperty("/Marca", oSelectedItem.getDescription());
            this.getOwnerComponent().getModel('FolioToShow').setProperty("/Marca", oSelectedItem.getTitle());
            //this.setActiveLifnr(oSelectedItem.getTitle(), oSelectedItem.getDescription());
        },

        addOptionalInfo: function () {

            var presentacion = {
                index: '',
                Taltam: "",
                CaracCsa: "",
                CaracTalla: "",
                Colsabaro: "",
                CodVent: "",
                CodCompra: "",
                Proporcion: ''
            }

            if (this.getView().getModel("ITARTVAR") != null) {
                if (this.getView().getModel("ITARTVAR").getProperty("/results") != null) {
                    let dataModel = this.getView().getModel("ITARTVAR").getData();
                    dataModel.results.push(presentacion);
                    this.getView().setModel(new JSONModel(dataModel), "ITARTVAR");
                } else {
                    var rows = {
                        results: []
                    };
                    rows.results.push(presentacion);
                    this.getView().setModel(new JSONModel(rows), "ITARTVAR");
                }
            } else {
                var rows = {
                    results: []
                };
                rows.results.push(presentacion);
                this.getView().setModel(new JSONModel(rows), "ITARTVAR")
            }
            this.paginate("ITARTVAR", "", 1, 0);
            this.reordenarRows("ITARTVAR");
        },
        deleteRow: function (idTable, modelName) {
            let that = this;
            var aIndices = this.byId(idTable).getSelectedItems();

            if (aIndices.length < 1) {
                sap.m.MessageBox.warning("No se a seleccionado ningún registro");
            } else {
                sap.m.MessageBox.confirm("¿Desea eliminar los registros?", function () {
                    for (let x = 0; x < aIndices.length; x++) {
                        let dataModel = that.getView().getModel(modelName).getData();
                        dataModel.results.splice(aIndices[x].getBindingContextPath().split('/').pop(), 1);
                        that.getView().setModel(new JSONModel(dataModel), modelName);
                    }
                    that.paginate(modelName, "", 1, 0);
                    that.reordenarRows(modelName);
                });
            }

        },
        reordenarRows: function (modelName) {
            let dataModel = this.getView().getModel(modelName).getData();

            for (let i = 0; i < dataModel.results.length; i++)
                dataModel.results[i].index = i + 1;

            this.getView().setModel(new JSONModel(dataModel), modelName);
        },
        saveChangePrice: function () {
            let that = this;
            let items = this.getView().getModel('ETMODIFY').getProperty('/results');
            if (items.length > 0) {
                MessageBox.confirm("Desea enviar los registros para cambio de precio?", function () {

                    for (let i = 0; i < items.length; i++)
                        delete items[i].index;

                    let objRequest = {
                        IOption: "11",
                        ETMODIFY: [...items],
                        ETDPRINT: [{
                            //Uniquer:'',
                            "Prinbr": "",
                            "EanUpcBase": "",
                            "HazardDescript": "",
                            "DesNormal": "",
                            "UndDn": "",
                            "CostBruto": "",
                            "UndCb": "",
                            "Zfechenv": "",
                            "Docnum": "",
                            "Adver": "",
                            "Error": "",

                        }]
                    }
                    var response = Model.create("/HdrcatproSet", objRequest);

                    if (response != null) {
                        if (response.ESuccess === 'X') {
                            //let msg = that.getOwnerComponent().getModel("appTxts").getProperty('/clarifications.msgUpdated') ;
                            const msg = "Se han generado correctamente los cambios de precio.";
                            sap.m.MessageBox.success(msg, {
                                actions: [sap.m.MessageBox.Action.CLOSE],
                                emphasizedAction: sap.m.MessageBox.Action.CLOSE,
                                onClose: function (sAction) {
                                    that._oWizard.close();
                                }.bind(that)
                            });
                        } else {
                            let message = response.mensaje;
                            sap.m.MessageBox.error(message);
                        }
                    } else {
                        sap.m.MessageBox.error("No se pudo conectar con el servidor, intente nuevamente.");
                    }
                })
            }
            else
                MessageBox.warning('No existen registros para cambio de precios.')
        },
        saveDelete: function () {
            let that = this;

            const items = this.getView().getModel('ETDELETE').getProperty('/results');
            if (items == undefined) {
                MessageBox.error('No existen registros cargados para enviar.');
                return false;
            }
            if (!this.validateSaveDelete()) {
                MessageBox.error('Existen registros con información faltante.');
                return false;
            }

            // let items = this.getView().getModel('ETDELETE').getProperty('/results');
            if (items.length > 0) {
                MessageBox.confirm("Desea enviar los registros para baja de productos?", function (oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        let objRequest = {
                            IOption: "12",
                            ETDELETE: [...items],
                            ETCERROR: [{
                                Uniquer: '',
                                "Folio": "",
                                "Ean": "",
                                "Desccrip": "",
                                "DateApp": "",
                                "Error": ""
                            }]
                        }
                        var response = Model.create("/HdrcatproSet", objRequest);

                        if (response != null) {
                            if (response.ESuccess === 'X') {
                                /*let msg = this.getOwnerComponent().getModel("appTxts").getProperty('/clarifications.msgUpdated') ;
                                let ETCERROR = {
                                    results:[ ...response.ETCERROR.results ]
                                }
                                that.getOwnerComponent().getView().setModel( new JSONModel(ETCERROR), 'ETCERROR')
                                if (!this.oDefaultDialog) {
                                    this.oDefaultDialog = new Dialog({
                                        title: "Folios",
                                        content: new List({
                                            items: {
                                                path: "ETCERROR>/results",
                                                template: new StandardListItem({
                                                    title: "{ETCERROR>Ean}",
                                                    description: "Folio: {ETCERROR>Uniquer}"
                                                })
                                            }
                                        }),
                                        beginButton: new Button({
                                            type: ButtonType.Emphasized,
                                            text: "OK",
                                            press: function () {
                                                this.oDefaultDialog.close();
                                            }.bind(this)
                                        }),
                                        endButton: new Button({
                                            text: "Close",
                                            press: function () {
                                                this.oDefaultDialog.close();
                                            }.bind(this)
                                        })
                                    });
                    
                                    // to get access to the controller's model
                                    this.getView().addDependent(this.oDefaultDialog);
                                }
                    
                                this.oDefaultDialog.open();
                                */

                                sap.m.MessageBox.success("Se han generado correctamente las bajas.", {
                                    actions: [sap.m.MessageBox.Action.CLOSE],
                                    emphasizedAction: sap.m.MessageBox.Action.CLOSE,
                                    onClose: function (sAction) {
                                        that._oWizard.close();
                                    }.bind(this)
                                });
                            } else {
                                let message = response.mensaje || response.EMessage;
                                sap.m.MessageBox.error(message);
                            }
                        } else {
                            sap.m.MessageBox.error("No se pudo conectar con el servidor, intente nuevamente.");
                        }
                    }
                })
            }
            else
                MessageBox.warning('No existen registros para baja de productos.')
        },
        validateSaveDelete: function () {
            let valid = true;

            const items = this.getView().getModel('ETDELETE').getProperty('/results');

            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.FechSumhasta == '' || String(item.MotBaja).trim() == '' || String(item.Comet).trim() == '') {
                    valid = false;
                    break;
                }
            }
            return valid;
        },
        onValueCountryRequest: function (oEvent) {
            var sInputValue = oEvent.getSource().getValue(),
                oView = this.getView();

            if (!this._pValueCountryDialog) {
                this._pValueCountryDialog = Fragment.load({
                    id: oView.getId(),
                    name: "demo.views.Products.fragments.ValueHelpCountry",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }
            this._pValueCountryDialog.then(function (oDialog) {
                // Create a filter for the binding
                oDialog.getBinding("items").filter([new Filter("Landx50", FilterOperator.Contains, sInputValue)]);
                // Open ValueHelpDialog filtered by the input's value
                oDialog.open(sInputValue);
            });
        },

        onValueHelpCountrySearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("Landx50", FilterOperator.Contains, sValue);

            oEvent.getSource().getBinding("items").filter([oFilter]);
        },

        onValueHelpCountryClose: function (oEvent) {
            var sDescription,
                oSelectedItem = oEvent.getParameter("selectedItem");
            oEvent.getSource().getBinding("items").filter([]);

            if (!oSelectedItem) {
                return;
            }

            const title = oSelectedItem.getTitle();
            const description = oSelectedItem.getDescription();
            //this.getOwnerComponent().getModel('Folio').setProperty("/txtPais", title);
            this.byId("country").setSelectedKey(description);
            //this.byId("selectedKeyIndicator").setText(sDescription);

        },
        onSuggestionCountryItemSelected: function (oEvent) {
            var oItem = oEvent.getParameter("selectedItem");
            console.log(oItem);
            var oText = oItem ? oItem.getKey() : "";
            //this.byId("selectedKeyIndicator").setText(oText);
        },
        changeVariants: function (oEvent) {
            this.getView().byId('characteristicFormElement').setVisible(oEvent.getParameters().selected);
            if (oEvent.getParameters().selected) {
                this.getView().byId('size').setEditable(false).setValue('');
                this.getView().byId('qualities').setEditable(false).setValue('');
            }
            else {
                this.getView().byId('size').setEditable(true);
                this.getView().byId('qualities').setEditable(true);
            }
        }
    })
});