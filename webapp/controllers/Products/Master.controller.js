sap.ui.define([
    "demo/controllers/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "demo/models/formatterCatPrd",
    "sap/ui/core/BusyIndicator",
], function (BaseController, JSONModel, Fragment, MessageBox, Filter, FilterOperator, formatterCatPrd, BusyIndicator) {
    "use strict";

    var sUri = "/sap/opu/odata/sap/ZOSP_CATPRO_SRV/";
    var _oDataModel = "ZOSP_CATPRO_SRV";
    var _oDataEntity = "HdrcatproSet";

    var Model = new Productos();
    var NotifAltaMas = new NotifAltaMasiva();
    const CatNegotiatedFormat = ['1A', '1B'];
    var swProveedorEnGS1 = false;
    var swProveedorExcluido = false;
    var _selectedEanType = {};
    var _invalidCostoNuevo = {};
    var _testingSteps = (document.location.hostname.slice(-4) == '.sap');// cambiar valor para probar brincando Validaciones (true = Brincar) (false= No brincar)

    return BaseController.extend("demo.controllers.Products.Master", {
        formatterCatPrd: formatterCatPrd,
        onInit: function () {
            this.getView().addEventDelegate({
                onBeforeShow: function (oEvent) {
                    this.getOwnerComponent().setModel(new JSONModel(), "Paises");
                    this.getOwnerComponent().setModel(new JSONModel(), "Catalogos");
                    this.getOwnerComponent().setModel(new JSONModel(), "Folios");
                    this.getOwnerComponent().setModel(new JSONModel(), "Folio");
                    this.getOwnerComponent().setModel(new JSONModel({ value: _testingSteps, gs1Finded: true }), "ValidBarCode");
                    this.getOwnerComponent().setModel(new JSONModel({ 'items': [] }), "FolioImages");
                    this.getOwnerComponent().setModel(new JSONModel(), "FolioToShow");
                    this.getOwnerComponent().setModel(new JSONModel(), "ITARTVAR");
                    this.getOwnerComponent().getModel("ITARTVAR").setProperty("/results", []);
                    this.getCatalogos();
                    this.clearFilters();
                    this.setInitialDates();
                    this.loadEstatusCatalog();
                }
            }, this);
            this.configFilterLanguage(this.getView().byId("filterBar"));
            this.setInitialDates();
        },

        async getGS1ProductData() {
            let proviconalGLN = '7504001437009' //this.getView().byId('codeGS1').getValue();
            let provicionalEAN = this.getView().byId('barCode').getValue();
            await fetch(`https://compuarte.serv.net.mx:4000/searchbygtin?codigo_barras=${provicionalEAN}&gln=${proviconalGLN}`)
                .then(async data => {
                    let gs1Json = await data.json();

                    if (!data.ok)
                        throw new Error(gs1Json.error.message);

                    this.fillFolioModelData(gs1Json);
                    this.byId("barCode").setEditable(false || _testingSteps);

                    MessageBox.success('Producto Encontrado en GS1', {
                        onClose: () => {
                            this.getView().byId('barCode').setValueState(sap.ui.core.ValueState.Success);
                        }
                    });

                }).catch(error => {
                    console.error(" >>>>>>>>>>>> ERROR FETCH GS1 ", error);
                    MessageBox.warning(error.message, {
                        onClose: () => {
                            this.getView().byId('barCode').setValueState(sap.ui.core.ValueState.Warning);
                        }
                    });
                });
        },

        fillFolioModelData(gs1Json) {
            //llenando Datos Generales
            this.byId("description").setValue(gs1Json.DescripcionCorta);

            let countryCode = formatterCatPrd.findPropertieValue("Eland", "Land1", gs1Json.RefPaisOrigen,
                JSON.parse(this.getOwnerComponent().getModel("Paises").getJSON()));
            this.byId("country").setSelectedKey(countryCode);

            //llenando Presentacion
            this.byId("content").setValue(gs1Json.ContenidoNeto);

            let UnidadContenido = formatterCatPrd.findPropertieValue("IsoCode", "Cveunm", gs1Json.UnidContenidoNeto,
                this.getOwnerComponent().getModel("Catalogos").getProperty('/UnidadMedida'));;

            this.byId("contentUnit").setSelectedKey(UnidadContenido);

            //llenando datos de Dimensiones
            let validDimensions = this.recalcularValoresDimensiones(gs1Json);

            console.log("Dimenciones Validas", validDimensions);

            this.byId("EcAlto").setValue(validDimensions.Alto);
            this.byId("EcAncho").setValue(validDimensions.Ancho);
            this.byId("EcProfundo").setValue(validDimensions.Profundo);
            this.byId("EcAlto").fireLiveChange();
            this.byId("EcUndaap").setSelectedKey(validDimensions.UnidadLon);
            //this.byId("EcUndvol").setSelectedKey(validDimensions.Unidad);

            this.byId("EcPbruto").setValue(gs1Json.PesoBruto);
            this.byId("EcPneto").setValue(gs1Json.PesoNeto);
            this.byId("EcUndp").setSelectedKey(validDimensions.UnidadWeg);

            this.getOwnerComponent().getModel("ValidBarCode").setProperty("/gs1Finded", false);

        },

        recalcularValoresDimensiones(gs1Json) {
            let UnidadLon = formatterCatPrd.findPropertieValue("IsoCode", "Cveunm", gs1Json.UnidAncho,
                this.getOwnerComponent().getModel("Catalogos").getProperty('/UnidadLongitud'));;
            let UnidadWeg = formatterCatPrd.findPropertieValue("IsoCode", "Cveunm", gs1Json.UnidPesoBruto,
                this.getOwnerComponent().getModel("Catalogos").getProperty('/UnidadPeso'));

            let Alto = gs1Json.Alto;
            let Ancho = gs1Json.Ancho;
            let Profundo = gs1Json.Profundo;
            let volumen = Alto * Ancho * Profundo;

            while (Alto > 9999.99 || Ancho > 9999.99 || Profundo > 9999.99 || volumen > 9999.99) {
                console.log(" Volumen invalido: ", volumen);
                Alto /= 10;
                Ancho /= 10;
                Profundo /= 10;
                volumen = Alto * Ancho * Profundo;
                UnidadLon = this.getUnidadDimensiones(UnidadLon);
            }

            return { Alto, Ancho, Profundo, UnidadLon, UnidadWeg };
        },

        getUnidadDimensiones(Unidad) {

            let UnidadesMedida = this.getOwnerComponent().getModel("Catalogos").getProperty('/UnidadLongitud');
            let indexUnidad = UnidadesMedida.results.findIndex(unidad => unidad.Cveunm == Unidad);
            Unidad = UnidadesMedida.results[(indexUnidad + 1)].Cveunm;

            return Unidad;

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
                var url = `/HdrcatproSet?$expand=ETTART,ETCOUNTRYNAV,ETCODENAV,ETBRANDSNAV,ETTCARCV,ETUWEIG,ETULONG,ETUVOL,ETUNM,ETLABEL,ETFORMAT,ETOUTSTRAT,ETBONUS&$filter=IOption eq '4'`;
                Model.getJsonModelAsync(url, function (response, that) {
                    let Paises = [];
                    const catPaises = response.getProperty('/results/0/ETCOUNTRYNAV/results');
                    for (let i = 0; i < catPaises.length; i++) {
                        Paises.push(catPaises[i]);
                    }
                    that.getOwnerComponent().getModel("Catalogos").setProperty('/TiposProducto', response.getProperty('/results/0/ETTART'));
                    that.getOwnerComponent().getModel("Catalogos").setProperty('/TipoCodigo', response.getProperty('/results/0/ETCODENAV'));
                    that.getOwnerComponent().getModel("Catalogos").setProperty('/UnidadMedida', response.getProperty('/results/0/ETUNM'));
                    that.getOwnerComponent().getModel("Catalogos").setProperty('/UnidadLongitud', response.getProperty('/results/0/ETULONG'));
                    that.getOwnerComponent().getModel("Catalogos").setProperty('/UnidadVolumen', response.getProperty('/results/0/ETUVOL'));
                    that.getOwnerComponent().getModel("Catalogos").setProperty('/UnidadPeso', response.getProperty('/results/0/ETUWEIG'));
                    that.getOwnerComponent().getModel("Catalogos").setProperty('/Caracteristicas', response.getProperty('/results/0/ETTCARCV'));
                    //that.getOwnerComponent().getModel("Catalogos").setProperty('/GrupoArticulos', response.getProperty('/results/0/ETGPOART'));
                    that.getOwnerComponent().getModel("Catalogos").setProperty('/NegotiatedFormat', response.getProperty('/results/0/ETFORMAT'));
                    that.getOwnerComponent().getModel("Catalogos").setProperty('/TiposEtiqueta', response.getProperty('/results/0/ETLABEL'));
                    that.getOwnerComponent().getModel("Catalogos").setProperty('/EstrategiaSalida', response.getProperty('/results/0/ETOUTSTRAT'));
                    that.getOwnerComponent().getModel("Catalogos").setProperty('/TiposBonificacion', response.getProperty('/results/0/ETBONUS'));

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

                let urlDivision = `HdrcatproSet?$expand=ETJERARQUIANAV&$filter=IOption eq '21'`;
                Model.getJsonModelAsync(urlDivision, function (response, that) {
                    that.getOwnerComponent().getModel("Catalogos").setProperty('/Divisiones', response.getProperty('/results/0/ETJERARQUIANAV'));
                }, function () {
                    sap.m.MessageBox.error("No se lograron obtener las divisiones");
                }, this);

                // let urlCompras = `HdrcatproSet?$expand=ETGPOCOMPRAS&$filter=IOption eq '22'`;
                // Model.getJsonModelAsync(urlCompras, function (response, that) {
                //     that.getOwnerComponent().getModel("Catalogos").setProperty('/GrupoCompras', response.getProperty('/results/0/ETGPOCOMPRAS'));
                // }, function () {
                //     sap.m.MessageBox.error("No se lograron obtener los grupos de compras");
                // }, this);

            } catch (error) {
                console.error(" Get Catalogos Error ", error);
            }
        },

        addAttachChangeTxt: function (oEvt) {

            let viewModel = this.getView().getModel("ETMODIFY");

            if (viewModel) {
                viewModel.setProperty("/Paginated/results", []);
                viewModel.setProperty("/results", []);
            }

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

                that.getOwnerComponent().setModel(new JSONModel(ITEXT64), "LETTERx64");
                ITEXT64.attach.push(oFile);
                that.getOwnerComponent().setModel(new JSONModel(ITEXT64), "ITEXT64");

            }
            reader.readAsDataURL(currentFile);
        },

        addAttachLetter(oControlEvent) {

            let aFiles = oControlEvent.getParameters().files;

            let currentFile = aFiles[0];
            let that = this;

            var reader = new FileReader();
            reader.onload = function (e) {
                let oFile = {};
                oFile.IText64 = e.target.result;

                let ITEXT64 = {
                    'attach': []
                };

                ITEXT64.attach.push(oFile);

                that.getOwnerComponent().setModel(new JSONModel(ITEXT64), "LETTERx64");

            };

            reader.readAsDataURL(currentFile);
        },

        addAttachDelete: function (oEvt) {
            let viewModel = this.getView().getModel("ETDELETE");

            if (viewModel) {
                viewModel.setProperty("/Paginated/results", []);
                viewModel.setProperty("/results", []);
            }

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

        async handleUploadPressChangePrice () {

            //this.testToken();

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

                sap.ui.core.BusyIndicator.show();

                let response = null;
                let headers = {
                    "X-Requested-With" : "X",
                    "Content-Type": "application/json;charset=utf-8",
                    "Accept": "application/json, text/javascript, */*;q=0.01"
                };

                await this._PostODataV2Async(_oDataModel, _oDataEntity, objRequest, headers).then(resp => {
                    response = resp.d;
                    sap.ui.core.BusyIndicator.hide();

                }).catch(error => {
                    console.log(error);
                });

                if (response != null) {
                    if (response.ESuccess == "X") {
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

                            let data = this.getOwnerComponent().getModel('ETMODIFY').getData();

                            this.getView().setModel(new JSONModel(data), 'ETMODIFY');

                            this.byId("fileUploaderChangeCost").clear();
                        } else
                            MessageBox.warning("No se encontraron folios en el archivo cargado");
                    } else {
                        let message = response.EMessage;
                        sap.m.MessageBox.error(message);
                    }
                } else {
                    MessageBox.error("No se pudo conectar con el servidor, intente nuevamente.");
                }
            }
            else
                MessageBox.warning("No se ha seleccionado ningún archivo para subir.")

        },

        async handleUploadPressDelete  () {
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

                sap.ui.core.BusyIndicator.show();
                let response = null;

                await this._PostODataV2Async(_oDataModel, _oDataEntity, objRequest).then(resp => {

                    response = resp.d;
                    sap.ui.core.BusyIndicator.hide();

                }).catch(error => {
                    console.log(error);
                });

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

                            let data = this.getOwnerComponent().getModel('ETDELETE').getData();

                            this.getView().setModel(new JSONModel(data), 'ETDELETE');

                            this.byId("fileUploaderDelete").clear();
                        } else
                            MessageBox.warning("No se encontraron folios en el archivo cargado");

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
            let that = this;
            MessageBox.confirm('Desea asignar el valor de la primer fila a todos los registros existentes?', function (oAction) {
                if (oAction === MessageBox.Action.OK) {
                    const modelData = that.getOwnerComponent().getModel('ETDELETE').getData();

                    const fecha = modelData.results[0].FechSumhasta;
                    const motivo = modelData.results[0].MotBaja;
                    const comentario = modelData.results[0].Comet;

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

            if (!this.hasAccess(46)) {
                return false;
            }

            var dateRange = this.getView().byId("dateRange");
            //var comboStatus = this.getView().byId("comboStatus");
            var inputFolioTxt = this.getView().byId("inputFolioTxt");
            var cboxStatus = this.getView().byId("cboxStatus");

            let folio = inputFolioTxt.getValue().trim();

            let proveedor_LIFNR = (this.getConfigModel().getProperty("/supplierInputKey") != undefined) ? this.getConfigModel().getProperty("/supplierInputKey") : '';
            // format[AAAAMMDD] (2020101)
            let IStartdate = this.buildSapDate(dateRange.getDateValue());
            // format[AAAAMMDD] (2020101)
            let IEnddate = this.buildSapDate(dateRange.getSecondDateValue());

            if (proveedor_LIFNR == '' || (folio.trim() === '' && dateRange.getValue() == '')) {
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty('/products.msgNoFilter'));
                return false;
            }

            let filtros = [];

            if(cboxStatus.getSelectedKey() !== ""){
                filtros.push(new sap.ui.model.Filter("IScode", sap.ui.model.FilterOperator.EQ, cboxStatus.getSelectedKey()));
            }

            filtros.push(new sap.ui.model.Filter({
                path: "IOption",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: '2'
            })
            );

            if (folio != '') {

                filtros.push(new sap.ui.model.Filter({
                    path: "IUniqr",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: folio
                })
                );
            } else {

                filtros.push(new sap.ui.model.Filter({
                    path: "ISdate",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: IStartdate
                })
                );

                filtros.push(new sap.ui.model.Filter({
                    path: "IFdate",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: IEnddate
                })
                );
            }

            filtros.push(new sap.ui.model.Filter({
                path: "ILifnr",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: proveedor_LIFNR
            })
            );

            sap.ui.core.BusyIndicator.show();
            let that = this;
            this._GetODataV2(_oDataModel, _oDataEntity, filtros, ["ETPRICNAV"], "").then(resp => {
                console.log(" RESP : " , resp.data);                
                that.getOwnerComponent().setModel(new JSONModel(resp.data.results[0]), "Folios");
                that.paginate("Folios", "/ETPRICNAV", 1, 0);
                sap.ui.core.BusyIndicator.hide();
            }).catch(error => {
                console.error(error);
            });
        },

        clearFilters: function () {
            this.getView().byId("inputFolioTxt").setValue('');
            this.getView().byId("dateRange").setValue('');
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
                },
                {
                    name: texts.getProperty("/products.maraStatus"),
                    template: {
                        content: "{MaraStatus}"
                    }
                },
                {
                    name: texts.getProperty("/products.currentCost"),
                    template: {
                        content: "{CostoActual}"
                    }
                },
                {
                    name: texts.getProperty("/products.capEmpaque"),
                    template: {
                        content: "{CapEmpaque}"
                    }
                }
            ];

            this.exportxls('Folios', '/ETPRICNAV/results', columns);
        },

        buildExportTableCostos() {
            let texts = this.getOwnerComponent().getModel("appTxts");
            let columns = [
                {
                    label: texts.getProperty("/products.organizePrice"),
                    property: "OrgCompras"
                },
                {
                    label: texts.getProperty("/products.centerPrice"),
                    property: "Centro"
                },
                {
                    label: texts.getProperty("/products.codePrice"),
                    property: "Codigoean"
                },
                {
                    label: texts.getProperty("/products.descriptionPrice"),
                    property: "Descrip"
                },
                {
                    label: texts.getProperty("/products.costPrice"),
                    property: "Costobant"
                },
                {
                    label: texts.getProperty("/products.normalDiscount"),
                    property: "DNormal"
                },
                {
                    label: texts.getProperty("/products.additionalDiscount"),
                    property: "DAdicional"
                },
                {
                    label: texts.getProperty("/products.discountEarlyPay"),
                    property: "DPronto"
                },
                {
                    label: texts.getProperty("/products.subtitleBonusType") + '(%)',
                    property: "PDBonif"
                },
                {
                    label: texts.getProperty("/products.subtitleBonusType") + '($)',
                    property: "PDBonif"
                },
                {
                    label: texts.getProperty("/products.CostDiff"),
                    property: "PDifCos"
                },
                {
                    label: texts.getProperty("/products.CompCentral"),
                    property: "PComCen"
                },
                {
                    label: texts.getProperty("/products.CargoCosto") + '(%)',
                    property: "PCargoC"
                },
                {
                    label: texts.getProperty("/products.CargoCosto") + '($)',
                    property: "MCargoC"
                }
            ]

            let results = this.getOwnerComponent().getModel("ETMODIFY").getProperty("/Paginated/results")
            this.buildExcelSpreadSheet(columns, results, "CostosActuales.xlsx");

        },

        //alta masiva
        massiveRegisterBatch: function () {

            if (!this.hasAccess(43)) {
                return false;
            }

            try {
                var oView = this.getView();

                // create Dialog
                if (!this._mrDialog) {
                    this._mrDialog = Fragment.load({
                        id: oView.getId(),
                        name: "demo.views.Products.fragments.WizardMassiveRegisterBatch",
                        controller: this
                    }).then(function (oDialog) {
                        oDialog.attachAfterClose(() => {
                            this.getOwnerComponent().setModel(new JSONModel(), 'ETMODIFY');
                            this.byId('fileUploaderMassiveReg').clear();
                        }, this);
                        this.getOwnerComponent().setModel(new JSONModel(), 'ETMODIFY');
                        oView.addDependent(oDialog);
                        return oDialog;
                    }.bind(this));
                }
                this._mrDialog.then(function (oDialog) {
                    oDialog.open();
                });

            } catch (err) {
                sap.m.MessageBox.error("Ocurrió una excepción.");
                console.error(err);
            }
        },

        //nuevo producto
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

                } else
                    sap.m.MessageBox.error("Debe selecionar un proveedor para continuar.");

            } catch (err) {
                sap.m.MessageBox.error("Ocurrió una excepción al inicializar un nuevo folio.");
                console.error(err);
            }

            this.byId('codeType').setEditable(true);
        },
        changePriceProduct: function () {

            if (!this.hasAccess(43)) {
                return false;
            }
            try {
                var oView = this.getView();

                // create Dialog
                if (!this._cpDialog) {
                    this._cpDialog = Fragment.load({
                        id: oView.getId(),
                        name: "demo.views.Products.fragments.WizardChangePriceProduct",
                        controller: this
                    }).then(function (oDialog) {
                        oDialog.attachAfterClose(() => {
                            this.getOwnerComponent().setModel(new JSONModel(), 'ETMODIFY');
                            this.byId('fileUploaderChangeCost').clear();
                        }, this);
                        this.getOwnerComponent().setModel(new JSONModel(), 'ETMODIFY');
                        oView.addDependent(oDialog);
                        return oDialog;
                    }.bind(this));
                }
                this._cpDialog.then(function (oDialog) {
                    oDialog.open();
                });

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
                    // that.getView().byId('country').setSelectedKey(country).setValue(countryName);
                }, function () {
                    MessageBox.error("No se lograron obtener los datos del proveedor registrado en GS1.");
                }, this);

            } catch (error) {
                MessageBox.error("No se lograron obtener los datos del proveedor registrado en GS1.");
                console.warn(error);
            }
        },

        validateBarCodeLength(oControlEvent) {
            let eanValue = oControlEvent.getParameter('value');

            if (!eanValue || eanValue.length != _selectedEanType.length) {
                this.byId('codeType').setEditable(true);
                oControlEvent.getSource().setValueState(sap.ui.core.ValueState.Error)
                oControlEvent.getSource().setValueStateText('Codigo Invalido. Longitud Requrida: ' + _selectedEanType.length);
            } else {
                oControlEvent.getSource().setValueState(sap.ui.core.ValueState.None);
                this.byId('codeType').setEditable(false);
            }
        },

        validateCstBrutNuevo(oControlEvent) {

            let cbn = oControlEvent.getParameter('value');
            let cba = oControlEvent.getSource().data("cba");
            let ean = oControlEvent.getSource().data("ean");

            let splited_quant = cbn.split('.');

            if ((splited_quant.length > 1) || ((parseFloat(cba) * 2) < parseFloat(cbn))) {

                if (splited_quant[1].length > 2) {
                    oControlEvent.getSource().setValueState(sap.ui.core.ValueState.Warning);
                    oControlEvent.getSource().setValueStateText("Maximo 2 decimales");
                    _invalidCostoNuevo.valid = false;
                    _invalidCostoNuevo.identifier = ean;

                } else if ((parseFloat(cba) * 2) < parseFloat(cbn)) {
                    oControlEvent.getSource().setValueState(sap.ui.core.ValueState.Warning);
                    oControlEvent.getSource().setValueStateText("No puede haber un incremento del 100% del costo bruto actual!");
                    _invalidCostoNuevo.valid = false;
                    _invalidCostoNuevo.identifier = ean;

                } else {
                    oControlEvent.getSource().setValueState(sap.ui.core.ValueState.None);

                    if (!_invalidCostoNuevo.valid && _invalidCostoNuevo.identifier == ean) {
                        _invalidCostoNuevo.valid = true;
                        _invalidCostoNuevo.identifier = null;
                    }

                }
            }

            this.byId("btnSaveChangePriceRow").setEnabled(_invalidCostoNuevo.valid);
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

            const url = `/HdrcatproSet?$expand=ETUWEIG,ETULONG,ETUVOL,ETUNM&$filter=IOption eq '7' and IEanv  eq '${barCode}' and IEantp eq '${_selectedEanType.type}'`;

            var response = Model.getJsonModel(url);

            if (response.getProperty("/results/0/ESuccess") === "X") {
                MessageBox.success("Artículo apto para registro.", {
                    onClose: () => {
                        //this.getGS1ProductData();
                        this.getView().byId('barCode').setValueState(sap.ui.core.ValueState.Success);
                        this.getOwnerComponent().getModel("ValidBarCode").setProperty("/value", true);
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

            let viewModel = new JSONModel({});

            if (this.byId("fileUploaderChangeCost")) {
                viewModel = this.getView().getModel("ETMODIFY");
                this.byId("fileUploaderChangeCost").clear();
            }

            if (this.byId("fileUploaderDelete")) {
                viewModel = this.getView().getModel("ETDELETE");
                this.byId("fileUploaderDelete").clear();
            }

            if (viewModel) {
                viewModel.setProperty("/Paginated/results", []);
                viewModel.setProperty("/results", []);
            }

            if (this.byId("fileUploaderMassiveReg")) {
                this.byId("fileUploaderMassiveReg").clear();
                this.byId("correoInput").setValue("");
                this.validateMassiveInfo();
                this.massiveFile64 = {};
            }

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

        handleButtonsVisibility: function (prgressStep) {

            let step = (prgressStep) ? prgressStep : this._oWizard.getProgress();

            var oModel = this.getView().getModel();

            oModel.setProperty("/checkConfirmation", false);
            oModel.setProperty("/finishButtonVisible", false);
            oModel.setProperty("/nextButtonVisible", true);
            oModel.setProperty("/reviewButtonVisible", false);

            switch (step) {
                case 1:
                    oModel.setProperty("/nextButtonEnabled", true);
                    oModel.setProperty("/backButtonVisible", false);
                    break;
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                    oModel.setProperty("/backButtonVisible", true);
                    break;
                case 7:
                    oModel.setProperty("/nextButtonVisible", false);
                    oModel.setProperty("/reviewButtonVisible", true);
                    break;
                case 8:
                    oModel.setProperty("/nextButtonVisible", false);
                    oModel.setProperty("/checkConfirmation", true);
                    oModel.setProperty("/finishButtonVisible", true);
                    oModel.setProperty("/backButtonVisible", true);
                    oModel.setProperty("/reviewButtonVisible", false);
                    this.cloneFolioModel();
                    let step = this._oWizard.getProgressStep();
                    this._oWizard.goToStep(step);
                    break;
                default: break;
            }

        },

        handleWizardCancel: function () {
            this._handleMessageBoxOpen(this.getOwnerComponent().getModel("appTxts").getProperty('/products.msgCancelNewProduct'), "warning");
        },

        async _handleMessageBoxOpen (sMessage, sMessageBoxType) {

            MessageBox[sMessageBoxType](sMessage, {

                actions: [MessageBox.Action.YES, MessageBox.Action.NO],

                onClose: async function (oAction) {
                    if (oAction === MessageBox.Action.YES) {

                        if (sMessageBoxType == "confirm") { // POST Prodcuto

                            //JSON.parse(this.getOwnerComponent().getModel("images64").getJSON).attachArray;
                            let imagesToAttach = [];

                            let variantes = JSON.parse(this.getView().getModel('ITARTVAR').getJSON()).results;
                            //JSON.parse(this.getView().getModel('ITARTVAR').getJSON()).results;

                            let folioModel = JSON.parse(this.getOwnerComponent().getModel("Folio").getJSON());
                            folioModel.TMoneda = "MXN";
                            folioModel.Lifnr = this.getConfigModel().getProperty("/supplierInputKey");
                            folioModel.EanUpcBase = folioModel.CodEan;
                            let createObjReq = {
                                "IOption": "5",
                                "ITREC": [
                                    folioModel
                                ],
                                "ITARTVAR": [...variantes],
                                "ITIMGART": [...imagesToAttach]
                            };

                            sap.ui.core.BusyIndicator.show();
                            let resp = null;
                            await this._PostODataV2Async(_oDataModel, _oDataEntity, createObjReq).then(response => {
                                resp = response.d;
                                sap.ui.core.BusyIndicator.hide();
                            }).catch(error => {
                                console.log(error);
                            });

                            if (resp.ESuccess) {

                                MessageBox.success(resp.EMessage);
                                let that = this;

                                setTimeout(function () {
                                    that.clearFormFolioAlta();
                                }, 3000);

                            } else {

                                MessageBox.error(resp.mensaje);

                            }

                        } else {

                            this.clearFormFolioAlta();
                        }

                    }
                }.bind(this)

            });
        },

        clearFormFolioAlta() {

            this._oWizard.discardProgress(this._oWizard.getSteps()[0]);
            this.byId("wizardDialog").close();
            this.getOwnerComponent().getModel("Folio").setData({});
            this.getOwnerComponent().getModel("FolioToShow").setData({});
            this.getOwnerComponent().getModel("FolioImages").setData({});
            this.getOwnerComponent().getModel("ValidBarCode").setProperty("/value", false);
            this.getOwnerComponent().getModel("ValidBarCode").setProperty("/gs1Finded", true);
            this.byId("ComboDivision").setValue("");
            this.resetSalesHierarchy();
            this.byId("barCode").setEditable(false);
        },

        selectAgree(oControlEvent) {
            let valueCheck = oControlEvent.getParameter("selected");
            this.byId("FinishBtn").setEnabled(valueCheck);
        },

        cloneFolioModel() {
            let Folio = JSON.parse(this.getOwnerComponent().getModel("Folio").getJSON());

            Folio.TipEtq = formatterCatPrd.findPropertieValue("Labelkey", "Descr", Folio.TipEtq,
                this.getOwnerComponent().getModel("Catalogos").getProperty('/TiposEtiqueta'));

            Folio.EstSalida = formatterCatPrd.findPropertieValue("Strategykey", "Descr", Folio.EstSalida,
                this.getOwnerComponent().getModel("Catalogos").getProperty('/EstrategiaSalida'));

            Folio.ForNegoc = formatterCatPrd.findPropertieValue("Formatkey", "Descr", Folio.ForNegoc,
                this.getOwnerComponent().getModel("Catalogos").getProperty('/NegotiatedFormat'));

            Folio.EcUndaap = formatterCatPrd.findPropertieValue("IsoCode", "Unidad", Folio.EcUndaap,
                this.getOwnerComponent().getModel("Catalogos").getProperty('/UnidadLongitud'));

            Folio.EcUndvol = formatterCatPrd.findPropertieValue("IsoCode", "Unidad", Folio.EcUndvol,
                this.getOwnerComponent().getModel("Catalogos").getProperty('/UnidadVolumen'));

            Folio.EcUndp = formatterCatPrd.findPropertieValue("IsoCode", "Unidad", Folio.EcUndp,
                this.getOwnerComponent().getModel("Catalogos").getProperty('/UnidadPeso'));

            Folio.PvUndaap = formatterCatPrd.findPropertieValue("IsoCode", "Unidad", Folio.PvUndaap,
                this.getOwnerComponent().getModel("Catalogos").getProperty('/UnidadLongitud'));

            Folio.PvUndvol = formatterCatPrd.findPropertieValue("IsoCode", "Unidad", Folio.PvUndvol,
                this.getOwnerComponent().getModel("Catalogos").getProperty('/UnidadVolumen'));

            Folio.PvUndp = formatterCatPrd.findPropertieValue("IsoCode", "Unidad", Folio.PvUndp,
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

            Folio.Present = formatterCatPrd.findPropertieValue("IsoCode", "Descpres", Folio.Present,
                this.getOwnerComponent().getModel("Catalogos").getProperty('/Presentaciones'));

            Folio.UndCont = formatterCatPrd.findPropertieValue("IsoCode", "Unidad", Folio.UndCont,
                this.getOwnerComponent().getModel("Catalogos").getProperty('/UnidadMedida'));

            Folio.UndMventa = formatterCatPrd.findPropertieValue("IsoCode", "Unidad", Folio.UndMventa,
                this.getOwnerComponent().getModel("Catalogos").getProperty('/UnidadMedida'));

            Folio.UndCompra = formatterCatPrd.findPropertieValue("IsoCode", "Unidad", Folio.UndCompra,
                this.getOwnerComponent().getModel("Catalogos").getProperty('/UnidadMedida'));

            Folio.UndBon = formatterCatPrd.findPropertieValue("Bonuskey", "Descr", Folio.UndBon,
                this.getOwnerComponent().getModel("Catalogos").getProperty('/TiposBonificacion'));

            Folio.Jerarquia = formatterCatPrd.findPropertieValue("Nodo", "Denominacion", Folio.Jerarquia,
                this.getOwnerComponent().getModel("Catalogos").getProperty('/SubSegmento'));

            Folio.PurGroup = formatterCatPrd.findPropertieValue("Ekgrp", "Eknam", Folio.PurGroup,
                this.getOwnerComponent().getModel("Catalogos").getProperty('/GrupoCompras'));

            this.getOwnerComponent().getModel("FolioToShow").setData({ ...Folio });

        },

        productTypeComplete: function (oControlEvent) {

            let validated = true;

            const ModelFolio = this.getOwnerComponent().getModel("Folio");

            // Barcode - EAN
            if (ModelFolio.getProperty('/CodEan') == undefined || ModelFolio.getProperty('/CodEan').trim() == '') {
                validated = false;
                this.getView().byId('barCode').setValueState(sap.ui.core.ValueState.Error);
            } else {
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
                this.getView().byId('productType').setValueState(sap.ui.core.ValueState.None);
            }

            // Marca -Brand
            if (ModelFolio.getProperty('/Marca') == undefined || ModelFolio.getProperty('/Marca').trim() == '') {
                validated = false;
                this.getView().byId('brand').setValueState(sap.ui.core.ValueState.Error);
            }
            else {
                this.getView().byId('brand').setValueState(sap.ui.core.ValueState.None);
            }

            // Tipo código - EAN type
            if (ModelFolio.getProperty('/EanUpcType') == undefined || ModelFolio.getProperty('/EanUpcType').trim() == '') {
                validated = false;
                this.getView().byId('codeType').setValueState(sap.ui.core.ValueState.Error);
            }
            else {
                this.getView().byId('codeType').setValueState(sap.ui.core.ValueState.None);
            }

            // Pais -country
            if (ModelFolio.getProperty('/Pais') == undefined || ModelFolio.getProperty('/Pais').trim() == '') {
                validated = false;
                this.getView().byId('country').setValueState(sap.ui.core.ValueState.Error);
            }
            else {
                this.getView().byId('country').setValueState(sap.ui.core.ValueState.None);
            }

            // Descripción - Description
            if (ModelFolio.getProperty('/DescrArt') == undefined || ModelFolio.getProperty('/DescrArt').trim() == '') {
                validated = false;
                this.getView().byId('description').setValueState(sap.ui.core.ValueState.Error);
            } else {
                this.getView().byId('description').setValueState(sap.ui.core.ValueState.None);
            }

            // Estrategia de salida - exit strategy
            if (ModelFolio.getProperty('/EstSalida') == undefined || ModelFolio.getProperty('/EstSalida').trim() == '') {
                validated = false;
                this.getView().byId('exitStrategy').setValueState(sap.ui.core.ValueState.Error);
            }
            else {
                this.getView().byId('exitStrategy').setValueState(sap.ui.core.ValueState.None);
            }

            // Estrategia de salida - exit strategy
            if (ModelFolio.getProperty('/ForNegoc') == undefined || ModelFolio.getProperty('/ForNegoc').trim() == '') {
                validated = false;
                this.getView().byId('negotiatedFormat').setValueState(sap.ui.core.ValueState.Error);
            }
            else {
                this.getView().byId('negotiatedFormat').setValueState(sap.ui.core.ValueState.None);
            }

            this.getView().byId('ProductTypeStep').setValidated(validated || _testingSteps);

        },

        validateSalesHierarchy() {
            let validated = true

            if (this.byId("ComboSubSegmento").getValue() == undefined || this.byId("ComboSubSegmento").getValue().trim() == '') {
                validated = false;
            }

            if (!validated) {
                sap.m.MessageBox.warning("Capture correcatamente hasta llegar a Sub Segmento.");
            }

            this.getView().byId('SalesHierarchyStep').setValidated(validated || _testingSteps);

        },

        activateProductPresentation: function () {

            let validated = true;
            let selectedVariantes = false;

            const ModelFolio = this.getOwnerComponent().getModel("Folio");

            // Presentation
            if (ModelFolio.getProperty('/Present') == undefined || ModelFolio.getProperty('/Present').trim() == '') {
                validated = false;
                this.getView().byId('presentation').setValueState(sap.ui.core.ValueState.Error);
            }
            else {
                this.getView().byId('presentation').setValueState(sap.ui.core.ValueState.None);
            }

            // Contenido
            if (ModelFolio.getProperty('/Contenido') == undefined || ModelFolio.getProperty('/Contenido').trim() == '') {
                validated = false;
                this.getView().byId('content').setValueState(sap.ui.core.ValueState.Error);
            }
            else {
                this.getView().byId('content').setValueState(sap.ui.core.ValueState.None);
            }

            // Unidad de medida de Contenido
            if (ModelFolio.getProperty('/UndCont') == undefined || ModelFolio.getProperty('/UndCont').trim() == '') {
                validated = false;
                this.getView().byId('contentUnit').setValueState(sap.ui.core.ValueState.Error);
            }
            else {
                this.getView().byId('contentUnit').setValueState(sap.ui.core.ValueState.None);
            }

            // Unidad de medida de venta
            if (ModelFolio.getProperty('/UndMventa') == undefined || ModelFolio.getProperty('/UndMventa').trim() == '') {
                validated = false;
                this.getView().byId('salesUnit').setValueState(sap.ui.core.ValueState.Error);
            }
            else {
                this.getView().byId('salesUnit').setValueState(sap.ui.core.ValueState.None);
            }

            // Unidad de compra
            if (ModelFolio.getProperty('/UndCompra') == undefined || ModelFolio.getProperty('/UndCompra').trim() == '') {
                validated = false;
                this.getView().byId('purchaseUnit').setValueState(sap.ui.core.ValueState.Error);
            }
            else {
                this.getView().byId('purchaseUnit').setValueState(sap.ui.core.ValueState.None);
            }

            // Capacidad de empaque
            if (ModelFolio.getProperty('/CapEmpaq') == undefined || ModelFolio.getProperty('/CapEmpaq').trim() == '' || ModelFolio.getProperty('/CapEmpaq').trim().length > 5) {
                validated = false;
                this.getView().byId('boardingCapacity').setValueState(sap.ui.core.ValueState.Error);

                if (ModelFolio.getProperty('/CapEmpaq').trim().length > 5)
                    this.getView().byId('boardingCapacity').setValueStateText("Este campo es obligatorio y deben ser maximo 5 caracteres");
            }
            else {

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

                if (rowPresentacion.CaracTalla == undefined || rowPresentacion.CaracTalla.trim() == '') {
                    validated = false;
                }
                if (rowPresentacion.Colsabaro == undefined || rowPresentacion.Colsabaro.trim() == '') {
                    validated = false;
                }

            }

            if (!validated) {
                sap.m.MessageBox.warning("Existen datos faltantes de captura de las variantes.");
            }

            this.getView().byId('VariantStep').setValidated(validated || _testingSteps);
        },

        calcularECVolumen: function (oControlEvent) {

            let idComponent = oControlEvent.getSource().getId().split("--")[1];
            let valueComponent = parseFloat(oControlEvent.getSource().getValue());

            if (valueComponent < 10000) {

                this.getView().byId(idComponent).setValueState(sap.ui.core.ValueState.Success);

                let ecalto = (this.byId("EcAlto").getValue()) ? parseFloat(this.byId("EcAlto").getValue()) : 0;
                let ecancho = (this.byId("EcAncho").getValue()) ? parseFloat(this.byId("EcAncho").getValue()) : 0;
                let ecprofundo = (this.byId("EcProfundo").getValue()) ? parseFloat(this.byId("EcProfundo").getValue()) : 0;

                let volumen = ecalto * ecancho * ecprofundo;

                this.byId("EcVolumen").setValue(volumen);

                if (volumen < 10000) {

                    this.getView().byId("EcVolumen").setValueState(sap.ui.core.ValueState.Success);

                } else {

                    sap.m.MessageBox.warning("El valor del volumen ser menor a 10000 tu resultado es : " + volumen);
                }

            } else {

                this.getView().byId(idComponent).setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId(idComponent).setValueStateText("El valor debe ser menor a 10000");
            }

        },

        calcularPvVolumen: function (oControlEvent) {
            let idComponent = oControlEvent.getSource().getId().split("--")[1];
            let valueComponent = parseFloat(oControlEvent.getSource().getValue());

            if (valueComponent < 10000) {

                this.getView().byId(idComponent).setValueState(sap.ui.core.ValueState.Success);

                let pvalto = (this.byId("PvAlto").getValue()) ? parseFloat(this.byId("PvAlto").getValue()) : 0;
                let pvancho = (this.byId("PvAncho").getValue()) ? parseFloat(this.byId("PvAncho").getValue()) : 0;
                let pvprofundo = (this.byId("PvProfundo").getValue()) ? parseFloat(this.byId("PvProfundo").getValue()) : 0;

                let volumen = pvalto * pvancho * pvprofundo;

                this.byId("PvVolumen").setValue(volumen);

                if (volumen < 10000) {

                    this.getView().byId("PvVolumen").setValueState(sap.ui.core.ValueState.Success);

                } else {
                    sap.m.MessageBox.warning("El valor del volumen ser menor a 10000 tu resultado es : " + volumen);

                }

            } else {

                this.getView().byId(idComponent).setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId(idComponent).setValueStateText("El valor debe ser menor a 10000");
            }

        },

        validateCompleteStepDimensions: function () {

            let validated = true;

            let Folio = JSON.parse(this.getOwnerComponent().getModel("Folio").getJSON());

            if (Folio.EcAlto == undefined || Folio.EcAlto.trim() == '' || parseFloat(Folio.EcAlto.trim()) >= 10000) {
                validated = false;
            }

            if (Folio.EcAncho == undefined || Folio.EcAncho.trim() == '' || parseFloat(Folio.EcAncho.trim()) >= 10000) {
                validated = false;
            }

            if (Folio.EcProfundo == undefined || Folio.EcProfundo.trim() == '' || parseFloat(Folio.EcProfundo.trim()) >= 10000) {
                validated = false;
            }

            if (Folio.EcUndaap == undefined || Folio.EcUndaap.trim() == '') {
                validated = false;
            }
            if (Folio.EcVolumen == undefined || Folio.EcVolumen.trim() == '' || parseFloat(Folio.EcVolumen.trim()) >= 10000) {
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

            if (Folio.PvAlto == undefined || Folio.PvAlto.trim() == '' || parseFloat(Folio.PvAlto.trim()) >= 10000) {
                validated = false;
            }
            if (Folio.PvAncho == undefined || Folio.PvAncho.trim() == '' || parseFloat(Folio.PvAncho.trim()) >= 10000) {
                validated = false;
            }
            if (Folio.PvProfundo == undefined || Folio.PvProfundo.trim() == '' || parseFloat(Folio.PvProfundo.trim()) >= 10000) {
                validated = false;
            }
            if (Folio.PvUndaap == undefined || Folio.PvUndaap.trim() == '') {
                validated = false;
            }

            if (Folio.PvVolumen == undefined || Folio.PvVolumen.trim() == '' || parseFloat(Folio.PvVolumen.trim()) >= 10000) {
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
                sap.m.MessageBox.warning("Capture correctamente todos los campos.");
            }

            this.getView().byId('DimensionsStep').setValidated(validated || _testingSteps);

        },

        validateDiscounts: function () {

            let validated = true;

            const Folio = JSON.parse(this.getOwnerComponent().getModel("Folio").getJSON());

            if (Folio.UndBon == undefined || Folio.UndBon.trim() == '') validated = false;
            if (Folio.CostoB == undefined || Folio.CostoB.trim() == '') validated = false;
            if (Folio.CostNUCompra == undefined || Folio.CostNUCompra.trim() == '') validated = false;
            if (Folio.CostNUVenta == undefined || Folio.CostNUVenta.trim() == '') validated = false;
            if (Folio.PSug == undefined || Folio.PSug.trim() == '') validated = false;

            if (!validated) {
                sap.m.MessageBox.warning("Faltan datos por capturar");
            }

            this.getView().byId('Discounts').setValidated(validated || _testingSteps);
        },

        validarDescuentosDif() {
            let valid = false;
            let dscNor = (this.byId("DscNormal").getValue()) ? this.byId("DscNormal").getValue() / 100 : 0;
            let dscNor2 = (this.byId("DscNormal2").getValue()) ? this.byId("DscNormal2").getValue() / 100 : 0;
            let dscNor3 = (this.byId("DscNormal3").getValue()) ? this.byId("DscNormal3").getValue() / 100 : 0;

            valid = (
                (dscNor == 0 && dscNor2 == 0 && dscNor3 == 0) ||
                (
                    (dscNor != dscNor2 || (dscNor == 0 || dscNor2 == 0))
                    &&
                    (dscNor != dscNor3 || (dscNor == 0 || dscNor3 == 0))
                    &&
                    (dscNor2 != dscNor3 || (dscNor3 == 0 || dscNor2 == 0))
                )
            );

            return valid;
        },

        async calcularCostNetCom (oControlEvent) {

            let ValueState = sap.ui.core.ValueState.None;

            if (this.validarDescuentosDif()) {
                let costob = (this.byId("CostoB").getValue()) ? this.byId("CostoB").getValue() : 0;
                let porcentajesXaplicar = [];
                porcentajesXaplicar.push((this.byId("DscNormal").getValue()) ? this.byId("DscNormal").getValue() / 100 : 0);
                porcentajesXaplicar.push((this.byId("DscNormal2").getValue()) ? this.byId("DscNormal2").getValue() / 100 : 0);
                porcentajesXaplicar.push((this.byId("DscNormal3").getValue()) ? this.byId("DscNormal3").getValue() / 100 : 0);
                porcentajesXaplicar.push((this.byId("DscAdicional").getValue()) ? this.byId("DscAdicional").getValue() / 100 : 0);
                porcentajesXaplicar.push((this.byId("DscPpago").getValue()) ? this.byId("DscPpago").getValue() / 100 : 0);
                //porcentajesXaplicar.push((this.byId("ValBoni").getValue()) ? this.byId("ValBoni").getValue() / 100 : 0);

                let costnetcom = costob;

                await porcentajesXaplicar.forEach(function (porcentaje) {
                    costnetcom -= (costnetcom * (porcentaje))
                });

                this.byId("CostNetComp").setValue(costnetcom);

            } else {
                sap.m.MessageBox.warning("Los descuentos tienes que ser diferentes");
                this.byId("CostNetComp").setValue(null);
                ValueState = sap.ui.core.ValueState.Error
            }

            this.byId("DscNormal").setValueState(ValueState);
            this.byId("DscNormal2").setValueState(ValueState);
            this.byId("DscNormal3").setValueState(ValueState);
        },

        calcularCostNetVen: function (oControlEvent) {

            let costob = (this.byId("CostoB").getValue()) ? this.byId("CostoB").getValue() : 0;
            let capembar = (this.byId("CapEmpaq2").getValue() && this.byId("CapEmpaq2").getValue() > 0) ? this.byId("CapEmpaq2").getValue() : 1;

            let costnetven = parseFloat(costob) / parseFloat(capembar);

            this.byId("CostNetVen").setValue(costnetven);

            this.calcularCostNetCom(null);

        },

        changeGrupArt: function (oControlEvent) {
            let oselectedItem = oControlEvent.getParameter("selectedItem");
            if (!oselectedItem)
                return;
            this.getOwnerComponent().getModel("FolioToShow").setProperty("/GrupoArt", oselectedItem.getText());
            this.fetchProdBase_categroria(oControlEvent);
        },

        getTallasColores: function () {
            // const caracteristica = this.getView().byId('characteristic').getValue();

            // let url = `HdrcatproSet?$expand=ETCSA,ETTALLA&$filter=IOption eq '9'  and IName eq '${caracteristica}'`;

            // var response = Model.getJsonModel(url);

            // const CatTallas = response.getProperty("/results/0/ETTALLA");
            // const CatColorSaborAroma = response.getProperty("/results/0/ETCSA")

            // this.getOwnerComponent().getModel("Catalogos").setProperty('/TallaSize', CatTallas);
            // this.getOwnerComponent().getModel("Catalogos").setProperty('/ColorSaborAroma', CatColorSaborAroma);
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

            if (!oSelectedItem) {
                return;
            }

            this.getOwnerComponent().getModel('Folio').setProperty("/ProdBase", oSelectedItem.getObject().DescLinea);
            this.getOwnerComponent().getModel('FolioToShow').setProperty("/ProdBase", oSelectedItem.getObject().DescLinea);

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

            if (!oSelectedItem) {
                return;
            }

            this.getOwnerComponent().getModel('Folio').setProperty("/Marca", oSelectedItem.getDescription());
            this.getOwnerComponent().getModel('FolioToShow').setProperty("/Marca", oSelectedItem.getTitle());
        },

        addOptionalInfo: function () {

            var presentacion = {
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
            //this.reordenarRows("ITARTVAR");
        },

        deleteRow: function (idTable, modelName) {
            let that = this;
            var aIndices = this.byId(idTable).getSelectedItems();

            if (aIndices.length < 1) {
                sap.m.MessageBox.warning("No se a seleccionado ningún registro");
            } else {
                sap.m.MessageBox.confirm("¿Desea eliminar los registros?", function () {

                    let dataModel = that.getView().getModel(modelName).getData();

                    for (let x = 0; x < aIndices.length; x++) {

                        dataModel.results.splice(aIndices[x].getBindingContextPath().split('/').pop(), 1);

                        if (dataModel.Paginated) {
                            dataModel.Paginated.results.splice(aIndices[x].getBindingContextPath().split('/').pop(), 1);
                        }
                    }

                    that.getView().setModel(new JSONModel(dataModel), modelName);
                    that.paginate(modelName, "", 1, 0);
                    //that.reordenarRows(modelName);
                });
            }

        },
        reordenarRows: function (modelName) {
            let dataModel = this.getView().getModel(modelName).getData();

            for (let i = 0; i < dataModel.results.length; i++)
                dataModel.results[i].index = i + 1;

            this.getView().setModel(new JSONModel(dataModel), modelName);
        },

        async saveChangePrice () {

            let that = this;
            let items = this.getView().getModel('ETMODIFY').getProperty('/results');
            let letter = this.getOwnerComponent().getModel("LETTERx64").getProperty("/attach");
            let filename = this.byId("fileUploaderLetter").getValue()
            let destinatario = this.byId("inputDestinatario").getValue();
            if (items.length > 0 && destinatario != null && destinatario.trim() != "" && letter.length > 0) {
                MessageBox.confirm("Desea enviar los registros para cambio de precio?", async function () {

                    for (let i = 0; i < items.length; i++)
                        delete items[i].index;

                    let objRequest = {
                        IOption: "11",
                        IvString: letter[0].IText64,
                        IvFilename: filename,
                        ITRECIPIENT:[
                          {
                            Email: destinatario
                          }
                        ],
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
                    };

                    sap.ui.core.BusyIndicator.show();

                    let response = null;

                    await that._PostODataV2Async(_oDataModel, _oDataEntity, objRequest).then(resp => {

                        response = resp.d;
                        sap.ui.core.BusyIndicator.hide();

                    }).catch(error => {
                        console.log(error);
                    });

                    if (response != null) {
                        if (response.ESuccess === 'X') {
                            const msg = "Se han generado correctamente la solicitud de cambio de costos.";
                            sap.m.MessageBox.success(msg, {
                                actions: [sap.m.MessageBox.Action.CLOSE],
                                emphasizedAction: sap.m.MessageBox.Action.CLOSE,
                                onClose: function (sAction) {
                                    this.closeDialog('changePriceDialog');
                                }.bind(that)
                            });

                        } else {
                            let message = response.EMessage;
                            sap.m.MessageBox.error(message);
                        }
                    } else {
                        sap.m.MessageBox.error("No se pudo conectar con el servidor, intente nuevamente.");
                    }

                })
            }
            else
                MessageBox.warning('Debe capturar el destinatario y la carta compromiso. \r\n Y almenos un regsitro para el cambio de costo')
        },

        async saveDelete () {
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

            if (items.length > 0) {
                MessageBox.confirm("Desea enviar los registros para baja de productos?", async function (oAction) {
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
                        
                        //var response = Model.create("/HdrcatproSet", objRequest); 
                        
                        sap.ui.core.BusyIndicator.show();

                        let response = null;
    
                        await that._PostODataV2Async(_oDataModel, _oDataEntity, objRequest).then(resp => {
    
                            response = resp.d;
                            sap.ui.core.BusyIndicator.hide();
    
                        }).catch(error => {
                            console.log(error);
                        });

                        if (response != null) {
                            if (response.ESuccess === 'X') {
                                sap.m.MessageBox.success("Se han generado correctamente las bajas.", {
                                    actions: [sap.m.MessageBox.Action.CLOSE],
                                    emphasizedAction: sap.m.MessageBox.Action.CLOSE,
                                    onClose: function (sAction) {
                                        // that._oWizard.close();
                                        that.closeDialog('deleteProductsDialog');
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

        },

        onSuggestionCountryItemSelected: function (oEvent) {
            var oItem = oEvent.getParameter("selectedItem");
            var oText = oItem ? oItem.getKey() : "";
        },

        changeVariants: function (oEvent) {
            this.getView().byId('characteristicFormElement').setVisible(oEvent.getParameters().selected);
            if (oEvent.getParameters().selected) {
                this.getView().byId('size').setEditable(false).setValue('');
                this.getView().byId('qualities').setEditable(false).setValue('');
            } else {
                this.getView().byId('size').setEditable(true);
                this.getView().byId('qualities').setEditable(true);
            }
        },

        async imageAfterAddedTriggered(oControlEvent) {

            let numberItemsAdded = this.byId("ImageUploadSet").getItems().length;

            let incommingUploadSetItem = oControlEvent.getParameter("item");

            let fileSize = (incommingUploadSetItem.getFileObject().size / 1024); //getting MBs for validation
            let path = URL.createObjectURL(incommingUploadSetItem.getFileObject());
            let imageObj = new Image();

            imageObj.src = path;

            await imageObj.decode();

            if (numberItemsAdded <= 4 && fileSize < 300 && imageObj.height < 1024 && imageObj.width < 1024) {
                incommingUploadSetItem.setUploadState(sap.m.UploadState.Complete);
                incommingUploadSetItem.setUrl(path);
                incommingUploadSetItem.setThumbnailUrl(path);
                this.byId("ImageUploadSet").addItem(incommingUploadSetItem);
                this.getOwnerComponent().getModel("FolioImages").setProperty("/items", this.byId("ImageUploadSet").getItems());
                this.attachImagesToModel();
            } else if (fileSize > 300) {
                sap.m.MessageBox.warning("Max size is 300 KB");
                this.byId("ImageUploadSet").removeItem(incommingUploadSetItem);
            } else if (imageObj.height >= 1024 || imageObj.width >= 1024) {
                sap.m.MessageBox.warning("Max img dimensions are 1024x1024 pixels");
                this.byId("ImageUploadSet").removeItem(incommingUploadSetItem);
            } else if (numberItemsAdded >= 4) {
                sap.m.MessageBox.warning("Max 5 imgs");
                this.byId("ImageUploadSet").setUploadEnabled(false);
            }

            this.byId("imagesCounter").setText(this.byId("ImageUploadSet").getItems().length);

        },

        imageRemovedTriggered(oControlEvent) {
            let numberItemsAdded = this.byId("ImageUploadSet").getItems().length;
            this.byId("imagesCounter").setText(numberItemsAdded);
            this.getOwnerComponent().getModel("FolioImages").setProperty("/items", this.byId("ImageUploadSet").getItems());
            this.attachImagesToModel();
            if (numberItemsAdded <= 4) {
                this.byId("ImageUploadSet").setUploadEnabled(true);
            }
        },

        attachImagesToModel() {

            let folioImages = this.getOwnerComponent().getModel("FolioImages").getProperty("/items");

            let base64imgArray = folioImages.map((imageFolio) => {

                let reader = new FileReader();
                let oItem = imageFolio.getFileObject();
                let oFile = {};
                oFile.Zdescrip = oItem.name;
                oFile.Zdoctype = oItem.type;
                oFile.Zdocvalue64 = "base64";

                reader.onload = function (evn) {
                    oFile.Zdocvalue64 = evn.target.result;
                };

                reader.readAsDataURL(oItem);

                return oFile;
            });

            this.getOwnerComponent().setModel(new JSONModel(), "images64");
            this.getOwnerComponent().getModel("images64").setProperty("/attachArray", base64imgArray);

        },

        changeTipoBonif(oControlEvent) {
            let selected = oControlEvent.getParameter("value");

            this.byId("ValBoni").setValue("0");
            this.byId("UnisBonif").setValue("0");

            switch (selected) {
                case "Ninguna":
                    this.byId("ValBoni").setVisible(false);
                    this.byId("UnisBonif").setVisible(false);
                    break;
                case "Por Porcentaje":
                    this.byId("ValBoni").setVisible(true);
                    this.byId("UnisBonif").setVisible(false);
                    this.byId("BonValue1").setVisible(true);
                    this.byId("BonValue2").setVisible(true);
                    this.byId("BonUnits1").setVisible(false);
                    this.byId("BonUnits2").setVisible(false);
                    break;
                case "Por Unidades":
                    this.byId("ValBoni").setVisible(false);
                    this.byId("UnisBonif").setVisible(true);
                    this.byId("BonValue1").setVisible(false);
                    this.byId("BonValue2").setVisible(false);
                    this.byId("BonUnits1").setVisible(true);
                    this.byId("BonUnits2").setVisible(true);
                    break;
            }

        },

        changePrecioSugerido(oControlEvent) {
            let selected = oControlEvent.getParameter("value");

            if (selected == "Farmacia Soriana") {
                this.byId("MaxPubPrice").setVisible(true);
                this.byId("PSug").setVisible(false);
                this.byId("MaxPubPrice1").setVisible(true);
                this.byId("PSug1").setVisible(false);
                this.byId("MaxPubPrice2").setVisible(true);
                this.byId("PSug2").setVisible(false);
            } else {
                this.byId("PSug").setVisible(true);
                this.byId("MaxPubPrice").setVisible(false);
                this.byId("PSug1").setVisible(true);
                this.byId("MaxPubPrice1").setVisible(false);
                this.byId("PSug2").setVisible(true);
                this.byId("MaxPubPrice2").setVisible(false);
            }
        },

        hardStepChange(oControlEvent) {
            let indexStep = this._oWizard.indexOfStep(oControlEvent.getParameter("step"));

            this.cloneFolioModel();
            this.handleButtonsVisibility((indexStep + 1));
        },

        resetSalesHierarchy() {
            this.getOwnerComponent().getModel("Catalogos").setProperty('/GerenCategoria', {});
            this.byId("ComboCatMgmt").setEditable(false);
            this.byId("ComboCatMgmt").setValue("");
            this.getOwnerComponent().getModel("Catalogos").setProperty('/Categoria', {});
            this.byId("ComboCategory").setEditable(false);
            this.byId("ComboCategory").setValue("");
            this.getOwnerComponent().getModel("Catalogos").setProperty('/SubCategoria', {});
            this.byId("ComboSubCategory").setEditable(false);
            this.byId("ComboSubCategory").setValue("");
            this.getOwnerComponent().getModel("Catalogos").setProperty('/Segmento', {});
            this.byId("ComboSegmento").setEditable(false);
            this.byId("ComboSegmento").setValue("");
            this.getOwnerComponent().getModel("Catalogos").setProperty('/SubSegmento', {});
            this.byId("ComboSubSegmento").setEditable(false);
            this.byId("ComboSubSegmento").setValue("");
        },

        async onDivisionChange(oControlEvent) {
            this.resetSalesHierarchy();

            let divKey = oControlEvent.getParameter('selectedItem').getKey();
            let children = await this.fetchHierarchyChildren(divKey);

            if (children) {
                this.getOwnerComponent().getModel("Catalogos").setProperty('/GerenCategoria', children);
                //this.byId("ComboCatMgmt").setEditable(true);
            }
        },

        async onCatMgmtChange(oControlEvent) {
            this.getOwnerComponent().getModel("Catalogos").setProperty('/Categoria', {});
            this.byId("ComboCategory").setEditable(false);
            this.byId("ComboCategory").setValue("");
            this.getOwnerComponent().getModel("Catalogos").setProperty('/SubCategoria', {});
            this.byId("ComboSubCategory").setEditable(false);
            this.byId("ComboSubCategory").setValue("");
            this.getOwnerComponent().getModel("Catalogos").setProperty('/Segmento', {});
            this.byId("ComboSegmento").setEditable(false);
            this.byId("ComboSegmento").setValue("");
            this.getOwnerComponent().getModel("Catalogos").setProperty('/SubSegmento', {});
            this.byId("ComboSubSegmento").setEditable(false);
            this.byId("ComboSubSegmento").setValue("");

            let divKey = oControlEvent.getParameter('selectedItem').getKey();
            let children = await this.fetchHierarchyChildren(divKey);

            if (children) {
                this.getOwnerComponent().getModel("Catalogos").setProperty('/Categoria', children);
                //this.byId("ComboCategory").setEditable(true);
            }
        },

        async onCatChange(oControlEvent) {
            this.getOwnerComponent().getModel("Catalogos").setProperty('/SubCategoria', {});
            this.byId("ComboSubCategory").setEditable(false);
            this.byId("ComboSubCategory").setValue("");
            this.getOwnerComponent().getModel("Catalogos").setProperty('/Segmento', {});
            this.byId("ComboSegmento").setEditable(false);
            this.byId("ComboSegmento").setValue("");
            this.getOwnerComponent().getModel("Catalogos").setProperty('/SubSegmento', {});
            this.byId("ComboSubSegmento").setEditable(false);
            this.byId("ComboSubSegmento").setValue("");

            let catKey = this.byId("ComboCategory").getSelectedKey(); //oControlEvent.getParameter('selectedItem').getKey();

            let children = await this.fetchHierarchyChildren(catKey);

            if (children) {
                this.getOwnerComponent().getModel("Catalogos").setProperty('/SubCategoria', children);
                this.byId("ComboSubCategory").setEditable(true);
            }
        },

        async onSubCatChange(oControlEvent) {
            this.getOwnerComponent().getModel("Catalogos").setProperty('/Segmento', {});
            this.byId("ComboSegmento").setEditable(false);
            this.byId("ComboSegmento").setValue("");
            this.getOwnerComponent().getModel("Catalogos").setProperty('/SubSegmento', {});
            this.byId("ComboSubSegmento").setEditable(false);
            this.byId("ComboSubSegmento").setValue("");

            let catKey = oControlEvent.getParameter('selectedItem').getKey();
            let children = await this.fetchHierarchyChildren(catKey);

            if (children) {
                this.getOwnerComponent().getModel("Catalogos").setProperty('/Segmento', children);
                this.byId("ComboSegmento").setEditable(true);
            }
        },

        async onSegmentCange(oControlEvent) {
            this.getOwnerComponent().getModel("Catalogos").setProperty('/SubSegmento', {});
            this.byId("ComboSubSegmento").setEditable(false);
            this.byId("ComboSubSegmento").setValue("");

            let catKey = oControlEvent.getParameter('selectedItem').getKey();
            let children = await this.fetchHierarchyChildren(catKey);

            if (children) {
                this.getOwnerComponent().getModel("Catalogos").setProperty('/SubSegmento', children);
                this.byId("ComboSubSegmento").setEditable(true);
            }
        },

        async fetchHierarchyChildren(key) {

            sap.ui.core.BusyIndicator.show();
            let children = null;
            let urlDivision = `HdrcatproSet?$expand=ETJERARQUIANODO&$filter=IOption eq '21' and IParent eq '${key}'`;
            await Model.getJsonModelAsync(urlDivision, async function (response, that) {
                children = await response.getProperty('/results/0/ETJERARQUIANODO');
                sap.ui.core.BusyIndicator.hide();
            }, function () {
                sap.m.MessageBox.error("No se lograron obtener los datos");
            }, this, false); //retirar false para volverlo asyncrono

            return children;
        },

        async codeTypeChange(oControlEvent) {
            this.byId("barCode").setEditable(true);

            let itemSelectedKey = oControlEvent.getSource().getSelectedKey();

            _selectedEanType = {};
            _selectedEanType.type = itemSelectedKey;
            _selectedEanType.length = await formatterCatPrd.findPropertieValue("Numtp", "Lnean", itemSelectedKey,
                this.getOwnerComponent().getModel("Catalogos").getProperty('/TipoCodigo'));

            this.byId("barCode").fireLiveChange();

        },

        changeBuyerEmail(oControlEvent) {
            this.validateMassiveInfo();
        },

        changeFileMassiveReg(oControlEvent) {
            this.validateMassiveInfo();
            this.massiveFile = oControlEvent.getParameters().files[0];

            var that = this;

            var reader = new FileReader();
            reader.onload = function (e) {
                let oFile = {};
                oFile.IText64 = e.target.result;

                that.massiveFile64 = oFile;

            }
            reader.readAsDataURL(this.massiveFile);
        },

        validateMassiveInfo() {
            let fileMassive = this.byId("fileUploaderMassiveReg").getValue();
            let comprasMail = this.byId("correoInput").getValue();

            let validInfo = fileMassive != "" && comprasMail != "";
            this.byId("finishMassive").setEnabled(validInfo);

        },

        sendDataForNotification() {
            let that = this;
            let fileMassive = this.byId("fileUploaderMassiveReg").getValue();
            let comprasMail = this.byId("correoInput").getValue();

            let userSession = this.getOwnerComponent().getModel("userdata").getData();

            let createObjReq = {
                "IvBcase": "01",
                "IvFilename": fileMassive,
                "IvSupplier": this.getConfigModel().getProperty("/supplierInputKey"),
                "IvString": this.massiveFile64.IText64,
                "ITRECIPIENT": [
                    {
                        "Email": userSession.IMail.toLowerCase(),
                    },
                    {
                        "Email": comprasMail,
                    }
                ],
                "ETRETURN": [
                ]
            };
            sap.ui.core.BusyIndicator.show();

           $.ajax({
                async: true,
                url: NotifAltaMas.sUrl + "HeaderSet",
                method: "POST",
                //dataType: 'json',
                headers: {
                    "X-Requested-With" : "X",
                    "Content-Type": "application/json;charset=utf-8"
                },
                "data": JSON.stringify(createObjReq),
                success: function(resp) {
                    sap.ui.core.BusyIndicator.hide();
                    var status = resp.getElementsByTagName("d:EvSendStatus")[0].textContent;
                    var folio = resp.getElementsByTagName("d:EvFolio")[0].textContent;

                    if (status != "OK") {
                        var message = resp.getElementsByTagName("d:Message")[0].textContent;
                        sap.m.MessageBox.error(message);
                    } else {
                        sap.m.MessageBox.success("Folio: " + folio);
                        that.closeDialog('massiveRegisterDialog');
                    }
                },
                error: function(resp, status, err) {
                    sap.ui.core.BusyIndicator.hide();
                    sap.m.MessageBox.error(resp.ETRETURN.results[0].Message);
                }
            });

        },

        async fetchProdBase_categroria(oControlEvent) {

            let shoppgrp = this.getOwnerComponent().getModel('Folio').getProperty("/PurGroup");
            let grupArt = this.byId("productGroup").getSelectedKey();

            if (!shoppgrp && !grupArt)
                return;

            let entity = `HierarchySet(Ekgrp='${shoppgrp}',Matkl='${grupArt}')`;

            sap.ui.core.BusyIndicator.show();
            let response = null
            await this._GetODataV2(_oDataModel, entity, [], [], "").then(resp => {
                response = resp.data;
                sap.ui.core.BusyIndicator.hide();
            }).catch(error => {
                console.error(error);
            });

            this.getOwnerComponent().getModel('Folio').setProperty("/ProdBase", response.Hnode04);
            this.getOwnerComponent().getModel('FolioToShow').setProperty("/ProdBase", response.Hlevel04);
            this.byId("ComboDivision").setValue(response.Hlevel02);
            this.byId("ComboDivision").setSelectedKey(response.Hnode02);
            this.byId("ComboCatMgmt").setValue(response.Hlevel03);
            this.byId("ComboCatMgmt").setSelectedKey(response.Hnode03);
            this.byId("ComboCategory").setValue(response.Hlevel04);
            this.byId("ComboCategory").setSelectedKey(response.Hnode04);
            this.byId("ComboCategory").fireSelectionChange();

        },

        onShoppingGroupRequest(oControlEvent) {

            this.getOwnerComponent().getModel('Folio').setProperty("/GrupArt", null);
            this.getOwnerComponent().getModel('FolioToShow').setProperty("/GrupArt", null);
            this.byId("productGroup").setValue(null);
            this.getOwnerComponent().getModel("Catalogos").setProperty('/GrupoArticulos', null);
            this.getOwnerComponent().getModel("Catalogos").setProperty('/GrupoCompras', null);

            var oView = this.getView();
            if (!this._pSearchShoppingGroup) {
                this._pSearchShoppingGroup = sap.ui.core.Fragment.load({
                    id: oView.getId(),
                    name: "demo.views.Products.fragments.SearchShoppingGroup",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }
            this._pSearchShoppingGroup.then(function (oDialog) {
                oDialog.open();
            });

        },

        async searchShoppingGroup(oControlEvent) {

            let searchTxt = oControlEvent.getParameter("value");

            if (searchTxt == null || searchTxt == "")
                return;

            let filters = [];
            filters.push(this.generateFilter("IOption", '22'));
            filters.push(this.generateFilter("IEknam", searchTxt));

            sap.ui.core.BusyIndicator.show();
            let response = []
            await this._GetODataV2(_oDataModel, _oDataEntity, filters, ["ETGPOCOMPRAS"], "").then(resp => {
                response = resp.data;
                sap.ui.core.BusyIndicator.hide();
            }).catch(error => {
                console.error(error);
            });

            this.getOwnerComponent().getModel("Catalogos").setProperty('/GrupoCompras', response.results[0].ETGPOCOMPRAS);
        },

        onShoppingGroupClose(oEvent) {
            let oSelectedContexts = oEvent.getParameter("selectedContexts");
            let oSelectedItem = oEvent.getParameter("selectedItem");

            oSelectedItem = oSelectedContexts.find(element => element.getObject().Ekgrp == oSelectedItem.getDescription());

            if (!oSelectedItem)
                return;

            this.getOwnerComponent().getModel('Folio').setProperty("/PurGroup", oSelectedItem.getObject().Ekgrp);
            this.getOwnerComponent().getModel('FolioToShow').setProperty("/PurGroup", oSelectedItem.getObject().Eknam);
            this.searchArtGroup();

        },

        async searchArtGroup() {
            let shoppingGroup = this.getOwnerComponent().getModel('Folio').getProperty("/PurGroup");
            if (!shoppingGroup)
                return

            let filters = [];
            filters.push(this.generateFilter("IOption", '23'));
            filters.push(this.generateFilter("IEkgrp", shoppingGroup));

            sap.ui.core.BusyIndicator.show();
            let response = []
            await this._GetODataV2(_oDataModel, _oDataEntity, filters, ["ETGPOART"], "").then(resp => {
                response = resp.data;
                sap.ui.core.BusyIndicator.hide();
            }).catch(error => {
                console.error(error);
            });

            this.getOwnerComponent().getModel("Catalogos").setProperty('/GrupoArticulos', response.results[0].ETGPOART);
        },

        generateFilter(paramName, paramValue) {
            return new sap.ui.model.Filter({
                path: paramName,
                operator: sap.ui.model.FilterOperator.EQ,
                value1: paramValue
            });
        },

        testToken: function(){
            $.ajax({
                url: this.sUri,
                type: "GET",
                dataType: "json",
                contentType: "application/json; charset=utf-8; IEEE754Compatible=true",
                success: function(dataResponse) {
                    console.log(dataResponse);
                },
                error: function(error, status, err) {
                    console.log(error);
                }
            });
        },

        loadEstatusCatalog: function(){
            let aFilters = [];
            aFilters.push(new sap.ui.model.Filter("IOption", sap.ui.model.FilterOperator.EQ, "24"));
            this._GetODataV2(_oDataModel, _oDataEntity, aFilters, ["ETSCODE"], "").then(resp => {
                this.getOwnerComponent().getModel("Catalogos").setProperty('/Estatus', resp.data.results[0].ETSCODE.results);
            }).catch(error => {
                console.error(error);
            });
        }

    })
});

