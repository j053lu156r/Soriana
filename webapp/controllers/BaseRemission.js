sap.ui.define([
    "demo/controllers/BaseController",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
], function (Controller, Fragment, JSONModel) {
    "use strict";

    var history = {
        prevPaymentSelect: null,
        prevDiffDeliverySelect: null
    };
    var ordersModel = new this.Pedidostemp();
    var cfdiModel = new this.CfdiModel();

    var remissionType = "";

    return Controller.extend("demo.controllers.BaseRemission", {
        openSelectRemission: function () {
            if (!this.hasAccess(6)) {
                return false;
            }

            if (this.getConfigModel().getProperty("/supplierInputKey") != null && this.getConfigModel().getProperty("/supplierInputKey") != "") {
                var oView = this.getView();

                // create Dialog
                if (!this._selDialog) {
                    this._selDialog = Fragment.load({
                        id: oView.getId(),
                        name: "demo.views.Remissions.fragments.DialogSelect",
                        controller: this
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        return oDialog;
                    }.bind(this));
                }
                this._selDialog.then(function (oDialog) {
                    oDialog.open();
                });
            } else {
                sap.m.MessageBox.error("Debe selecionar un proveedor para continuar.");
            }
        },
        openWizard: function (selectedKey) {
            var oView = this.getView();

            var frag = (selectedKey == "reverse") ? "demo.views.Remissions.fragments.RemissionWizard"
                :
                "demo.views.Remissions.fragments.RemissionCWizard";

            this.remissionType = selectedKey;

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
            });
        },
        onContinueSelect: function () {
            this.onCancelSelect();
            var selectedKey = this.byId("paymentMethodSelection").getSelectedKey();

            this.openWizard(selectedKey);
        },
        onCancelSelect: function () {
            this.byId("selectTypeDialog").close();
            this.getView().setModel(new JSONModel(), "selectedPositionsQty");
            this.getView().setModel(new JSONModel(), "tableWizardOrderPosition");
            this.getView().setModel(new JSONModel(), "selectedWizardPositions");
            this.getView().setModel(new JSONModel(), "reviewModel");
        },
        onCloseWizard: function () {
            this._handleMessageBoxOpen(this.getView().getModel("appTxts").getProperty("/rem.discardButton"), "warning");
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
                    }
                }.bind(this)
            });
        },
        onDialogAfterOpen: function () {
            this._oWizard = this.byId("CreateProductWizard");
            this.getView().byId("deliveryDate").setMinDate(new Date());
            this.handleButtonsVisibility();
        },
        handleButtonsVisibility: function () {
            var oModel = this.getView().getModel();
            var remissionType = oModel.getProperty("/selectedPayment");
            switch (this._oWizard.getProgress()) {
                case 1:
                    oModel.setProperty("/nextButtonVisible", true);
                    oModel.setProperty("/backButtonVisible", false);
                    oModel.setProperty("/reviewButtonVisible", false);
                    oModel.setProperty("/finishButtonVisible", false);
                    this.remissionValidate();
                    break;
                case 2:
                    oModel.setProperty("/nextButtonVisible", true);
                    //oModel.setProperty("/nextButtonEnabled", false);
                    oModel.setProperty("/backButtonVisible", true);
                    oModel.setProperty("/reviewButtonVisible", false);
                    oModel.setProperty("/finishButtonVisible", false);
                    this.positionValidation();
                    break;
                case 3:
                    switch (remissionType) {
                        case "reverse":
                            oModel.setProperty("/backButtonVisible", true);
                            oModel.setProperty("/nextButtonVisible", false);
                            oModel.setProperty("/reviewButtonVisible", true);
                            oModel.setProperty("/finishButtonVisible", false);
                            break;
                        case "packing":
                            oModel.setProperty("/backButtonVisible", true);
                            oModel.setProperty("/reviewButtonVisible", true);
                            oModel.setProperty("/nextButtonVisible", false);
                            oModel.setProperty("/finishButtonVisible", false);
                            break;
                    }
                    break;
                case 4:
                    switch (remissionType) {
                        case "reverse":
                            oModel.setProperty("/backButtonVisible", true);
                            oModel.setProperty("/nextButtonVisible", false);
                            oModel.setProperty("/reviewButtonVisible", false);
                            oModel.setProperty("/finishButtonVisible", true);
                            break;
                        case "packing":
                            oModel.setProperty("/backButtonVisible", true);
                            oModel.setProperty("/nextButtonVisible", false);
                            oModel.setProperty("/reviewButtonVisible", false);
                            oModel.setProperty("/finishButtonVisible", true);
                            break;
                    }
                    break;
                default: break;
            }

        },
        setDiscardableProperty: function (params) {
            var step = this._oWizard.getProgressStep();
            if (step !== params.discardStep) {
                sap.m.MessageBox.warning(params.message, {
                    actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                    onClose: function (oAction) {
                        if (oAction === sap.m.MessageBox.Action.YES) {
                            this._oWizard.discardProgress(params.discardStep);
                            history[params.historyPath] = this.getView().getModel().getProperty(params.modelPath);
                            this.getView().getModel().setProperty("/nextButtonEnabled", true);
                        } else {
                            this.model.setProperty(params.modelPath, history[params.historyPath]);
                        }
                    }.bind(this)
                });
            } else {
                history[params.historyPath] = this.getView().getModel().getProperty(params.modelPath);
            }
        },
        onDialogNextButton: function () {
            if (this._oWizard.getProgressStep().getValidated()) {
                var steps = this._oWizard.getSteps();
                this._oWizard.nextStep();
            }

            this.handleButtonsVisibility();
        },
        onDialogBackButton: function () {
            this._oWizard.previousStep();
            this.handleButtonsVisibility();
        },
        searchRemissionOrder: function () {
            this._document = this.byId("searchOrder").getValue();
            this._document.trim();
            this.getView().setModel(new JSONModel(), "tableWizardOrderPosition");

            var url = `/notCreditSet?$expand=OEKKONAV&$filter=IOption eq '4' and ILifnr eq '${this.getConfigModel().getProperty("/supplierInputKey")}'`;
            url += ` and IEbeln eq '${this._document}'`;

            var dueModel = ordersModel.getJsonModel(url);

            if (dueModel != null) {
                var ojbResponse = dueModel.getProperty("/results/0");
                if (ojbResponse != null) {
                    if (ojbResponse.ESuccess == "X") {
                        this.getDetailOrder();
                    } else {
                        sap.m.MessageBox.error(ojbResponse.EReturn);
                    }
                }
            }

        },
        getDetailOrder: function () {
            var url = "notCreditSet?$expand=Oekponav,OEKKONAV,OEKKOADVRNAV&$filter=IOption eq '5' and IEbeln eq '" + this._document + "'";
            url += ` and ILifnr eq '${this.getConfigModel().getProperty("/supplierInputKey")}'`;

            var dueModel = ordersModel.getJsonModel(url);

            var ojbResponse = dueModel.getProperty("/results/0");

            if (ojbResponse.Oekponav.results.length > 0) {
                this.getView().setModel(new JSONModel(ojbResponse), "tableWizardOrderPosition");
                this.paginate('tableWizardOrderPosition', '/Oekponav', 1, 0);
            } else {
                sap.m.MessageBox.error(ojbResponse.EReturn);
            }
        },
        filterOrderPositions: function (oEvent) {
            var sValue = oEvent.getSource().getValue();
            var list = this.getView().byId("tableWizardOrderPosition");

            var oFilter = new sap.ui.model.Filter([
                new sap.ui.model.Filter("Ean11", sap.ui.model.FilterOperator.Contains, sValue),
                new sap.ui.model.Filter("Txz01", sap.ui.model.FilterOperator.Contains, sValue)
            ], false);

            list.getBinding("items").filter(oFilter, sap.ui.model.FilterType.Application);
        },
        filterQtys: function (oEvent) {
            var sValue = oEvent.getSource().getValue();
            var list = this.getView().byId("tableWizardOrderQty");

            var oFilter = new sap.ui.model.Filter([
                new sap.ui.model.Filter("Ean11", sap.ui.model.FilterOperator.Contains, sValue),
                new sap.ui.model.Filter("Txz01", sap.ui.model.FilterOperator.Contains, sValue),
                new sap.ui.model.Filter("Ebeln", sap.ui.model.FilterOperator.Contains, sValue),
            ], false);

            list.getBinding("items").filter(oFilter, sap.ui.model.FilterType.Application);
        },
        filterQtysTree: function (oEvent) {
            var sValue = oEvent.getSource().getValue();
            var list = this.getView().byId("tableWizardOrderQty");

            var oFilter = new sap.ui.model.Filter([
                new sap.ui.model.Filter("Ean11", sap.ui.model.FilterOperator.Contains, sValue),
                new sap.ui.model.Filter("Txz01", sap.ui.model.FilterOperator.Contains, sValue),
                new sap.ui.model.Filter("Ean11Child", sap.ui.model.FilterOperator.Contains, sValue),
                new sap.ui.model.Filter("Txz01Child", sap.ui.model.FilterOperator.Contains, sValue),
                new sap.ui.model.Filter("Ebeln", sap.ui.model.FilterOperator.Contains, sValue),
                new sap.ui.model.Filter("Bednr", sap.ui.model.FilterOperator.Contains, sValue)
            ], false);

            list.getBinding("rows").filter(sValue ? oFilter : null);
        },
        onTreeChange: function (event) {
            if (event.getParameter("reason") == "filter") {
                const model = this.getView().getModel("search");
                const query = model.getProperty("/query");
                this.byId("tableWizardOrderQty").expandToLevel(query ? 99 : 0);
            }
        },
        selectChange: function (oEvent) {
            var objSelected = {
                "selecteds": []
            }

            var selModel = this.getView().getModel("selectedWizardPositions");
            if (selModel != null) {
                var mSelecteds = selModel.getProperty("/selecteds");
                if (mSelecteds != null) {
                    objSelected.selecteds = mSelecteds;
                }
            }

            var listItems = oEvent.getParameters("listItems").listItems;
            listItems.forEach(function (item) {
                var contexts = item.getBindingContext("tableWizardOrderPosition").getPath();
                var object = this.getView().getModel("tableWizardOrderPosition").getProperty(contexts);

                if (item.getProperty("selected")) {
                    if (!objSelected.selecteds.some(elem => elem == object)) {
                        objSelected.selecteds.push(object);
                    }
                } else {
                    var found = objSelected.selecteds.find(element => element == object);
                    if (found != null) {
                        objSelected.selecteds.splice(found.index, 1);
                    }
                }

            }, this);

            this.getView().setModel(new JSONModel(objSelected), "selectedWizardPositions");
        },
        calculateTotal: function (amount, qty, formatValue) {
            var iAmount = parseFloat(amount).toFixed(3);
            var iQty = parseFloat(qty).toFixed(3);

            var oAmount = iAmount * iQty;
            var numberFormat = new sap.ui.model.type.Currency({
                showMeasure: false
            });

            var sAmount = parseFloat(oAmount).toFixed(3).toString();

            return numberFormat.formatValue([sAmount, formatValue], "string");
        },
        positionValidation: function () {
            var bContinue = false;
            var oModel = this.getView().getModel();

            var selectedItems = this.getView().getModel("selectedPositionsQty");

            if (selectedItems != null) {
                var items = selectedItems.getProperty("/selecteds/results");
                if (items != null && items.length > 0) {
                    bContinue = true;
                }
            }

            if (bContinue) {
                if (this._oWizard != null) {
                    this._oWizard.validateStep(this.byId("ProductInfoStep"));
                }
                oModel.setProperty("/nextButtonEnabled", true);
            } else {
                if (this._oWizard != null) {
                    this._oWizard.invalidateStep(this.byId("ProductInfoStep"));
                }
                oModel.setProperty("/nextButtonEnabled", false);
                oModel.setProperty("/finishButtonVisible", false);
            }
        },
        remissionValidate: function () {
            var oModel = this.getView().getModel();
            var deliveryDate = this.byId("deliveryDate");

            if (this.getConfigModel().getProperty("/supplierInportation") != null
                && this.getConfigModel().getProperty("/supplierInportation") == "X") {

                if (this.getView().byId("petition").getValue() != ""
                    && this.getView().byId("customs").getValue() != ""
                    && this.getView().byId("customsBrokert").getValue() != ""
                    && this.getView().byId("petitionType").getValue() != ""
                ) {
                    oModel.setProperty("/nextButtonEnabled", true);
                } else {
                    oModel.setProperty("/nextButtonEnabled", false);
                    return;
                }
            }

            if (deliveryDate != null && deliveryDate.getValue() != "") {
                oModel.setProperty("/nextButtonEnabled", true);
            } else {
                oModel.setProperty("/nextButtonEnabled", false);
            }
        },
        addSelecteds: function () {
            var selectedsAdd = this.getView().getModel("selectedWizardPositions");
            if (selectedsAdd != null) {

                sap.m.MessageBox.warning("Desea agregar los registros?", {
                    actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                    onClose: function (oAction) {
                        if (oAction === sap.m.MessageBox.Action.YES) {
                            this.pushSelecteds(selectedsAdd);
                        }
                    }.bind(this)
                });

            }
        },
        pushSelecteds: function (selectedsAdd) {
            var obj = {
                "selecteds": {
                    "results": []
                }
            }

            var qtyModel = this.getView().getModel("selectedPositionsQty");
            if (qtyModel != null) {
                var prevItems = qtyModel.getProperty("/selecteds/results");
                if (prevItems != null) {
                    obj.selecteds.results = prevItems;
                }

                if (qtyModel.getProperty("/packagesList") != null) {
                    obj.packagesList = qtyModel.getProperty("/packagesList");
                }
            }

            var selectedsValues = selectedsAdd.getProperty("/selecteds");
            selectedsValues.forEach(function (item) {
                var bInclude = obj.selecteds.results.some(
                    element =>
                        element.Ebeln == item.Ebeln && element.Ebelp == item.Ebelp
                );
                if (!bInclude) {
                    obj.selecteds.results.push(item);
                }
            });

            obj = this.addTaxes(obj);

            this.getView().setModel(new JSONModel(obj), "selectedPositionsQty");

            var pagValue = 0;
            if (this.remissionType == "packing") {
                pagValue = obj.selecteds.results.length;
            }
            this.paginate("selectedPositionsQty", "/selecteds", 1, 0);
            this.getView().setModel(new JSONModel(), "selectedWizardPositions");
            this.byId("tableWizardOrderPosition").removeSelections(true);
            this.getView().setModel(new JSONModel(), "tableWizardOrderPosition");

            this.positionValidation();
        },
        addTaxes: function (obj) {

            var iObj = {
                "IOption": "6",
                "ICurrency": this.getView().byId("currency").getSelectedItem().getText(),
                "IT_EBELN": [],
                "Taxesnav": [{ "Ebeln": "", "Ebelp": "", "Mwskz": "", "Tax": "", "Ieps": "", "Netpr": "" }],
                "Bednrnav": [{ "Ebeln": "", "Ebelp": "", "Werks": "", "Name1": "", "Bednr": "", "CantPendiente": "", "Meins": "" }]
            };

            obj.selecteds.results.forEach(function (item) {
                if (item.iva == null && item.ieps == null) {
                    var iOrder = {
                        "Ebeln": item.Ebeln,
                        "Ebelp": item.Ebelp,
                        "Mwskz": "",
                        "Tax": "",
                        "Netpr": item.Netpr
                    };

                    iObj.IT_EBELN.push(iOrder);
                }
            });

            var taxResponse = ordersModel.create("notCreditSet", iObj);

            if (taxResponse != null) {
                if (taxResponse.ESuccess == "X") {
                    taxResponse.Taxesnav.results.forEach(function (item) {
                        var index = obj.selecteds.results.findIndex(element => element.Ebeln == item.Ebeln && element.Ebelp == item.Ebelp);
                        if (index != null) {
                            obj.selecteds.results[index]["iva"] = item.Tax;
                            obj.selecteds.results[index]["ieps"] = item.Ieps;

                            if (item.Netpr != null && item.Netpr != 0) {
                                obj.selecteds.results[index].Netpr = item.Netpr;
                                obj.selecteds.results[index].Waers = this.getView().byId("currency").getSelectedItem().getText();
                            }

                            if (this.remissionType == "packing") {
                                if (taxResponse.Bednrnav.results != null && taxResponse.Bednrnav.results.length > 0) {
                                    var childList = taxResponse.Bednrnav.results.filter(element => element.Bednr == item.Ebeln && element.Ean11 == obj.selecteds.results[index].Ean11);

                                    if (childList.length > 0) {
                                        obj.selecteds.results[index].results = childList;

                                        obj.selecteds.results[index].results.forEach(function (item) {
                                            item.Ean11Child = obj.selecteds.results[index].Ean11;
                                            item.Txz01Child = obj.selecteds.results[index].Txz01;
                                        });
                                    } else {
                                        obj.selecteds.results.splice(index, 1);
                                        sap.m.MessageBox.error(`La posición ${item.Ebelp} del pedido ${item.Ebeln} no corresponde a un pedido tipo ${this.remissionType}, no se agregará el registro`);
                                    }
                                } else {
                                    obj.selecteds.results.splice(index, 1);
                                    sap.m.MessageBox.error(`La posición ${item.Ebelp} del pedido ${item.Ebeln} no corresponde a un pedido tipo ${this.remissionType}, no se agregará el registro`);
                                }
                            }
                        }
                    }, this);
                } else {
                    sap.m.Message.error(taxResponse.EMessage);
                }
            }

            return obj;
        },
        getChildParetPath: function (sChildPath) {
            var sPath = "";

            var re = sChildPath.split("/");
            for (var i = 0; i < re.length - 2; i++) {
                if (re[i] != "") {
                    sPath += "/" + re[i];
                }
            }

            return sPath;
        },
        changeQty: function (oEvent) {
            var sPath = "";

            if (this.remissionType == "packing") {
                var sParentPath = oEvent.getSource().getParent().getBindingContext("selectedPositionsQty").getPath();

                sPath = this.getChildParetPath(sParentPath);

                var itemChild = this.getView().getModel("selectedPositionsQty").getProperty(sParentPath);

                if (itemChild.QtySendChild != null && parseFloat(itemChild.QtySendChild) > parseFloat(itemChild.CantPendiente)) {
                    itemChild.QtySendChild = "";
                    sap.m.MessageBox.error("La cantidad a enviar no puede ser mayor a la cantidad pendiente, verifique sus entradas.");
                }
            } else {
                sPath = oEvent.getSource().getBindingContext("selectedPositionsQty").getPath();
            }

            var item = this.getView().getModel("selectedPositionsQty").getProperty(sPath);

            if (this.remissionType == "packing") {
                item.QtySend =
                    parseFloat(item.results.map(element => parseFloat(element.QtySendChild)).reduce((prev, curr) => prev + (curr = curr || 0), 0)).toFixed(3);
                oEvent.getSource().setValue(parseFloat(itemChild.QtySendChild).toFixed(3));
            }

            if (item.QtySend != null && parseFloat(item.QtySend) > parseFloat(item.Cresta)) {
                item.QtySend = "";
                sap.m.MessageBox.error("La cantidad a enviar no puede ser mayor a la cantidad pendiente, verifique sus entradas.");
            } else {
                item.QtyNet = parseFloat(item.QtySend * item.Netpr).toFixed(3);
                item.QtyIva = parseFloat((item.QtySend * item.Netpr) * (item.iva / 100)).toFixed(3);
                item.QtyIeps = parseFloat((item.QtySend * item.Netpr) * (item.ieps / 100)).toFixed(3);
                item.QtyTotal = parseFloat((item.QtySend * item.Netpr) + item.QtyIva + item.QtyIeps).toFixed(3);
            }

            this.activateQty()
        },
        qtyValidation: function () {
            if (!this.activateQty()) {
                sap.m.MessageBox.error("Se debe especificar una cantidad de entrega para todas las posiciones seleccionadas.");
            } else {
                this.defineReview();
            }
        },
        defineReview: function () {
            var obj = {
                "Remision": {
                    "columnas": []
                },
                "Pedimento": {
                    "columnas": []
                },
                "Pedidos": {
                    "columnas": []
                },
                "Articulos": {
                    "columnas": []
                },
                "CajasTarimas": {
                    "columnas": []
                },
                "ArticulosPorCajaTarima": {
                    "columnas": []
                }
            }

            var objRemision = this.buildRemisionReview();

            var selectedQtyModel = this.getView().getModel("selectedPositionsQty").getData();

            if (selectedQtyModel != null) {
                var shortEbeln = selectedQtyModel.selecteds.results[0].Ebeln;
                var remName = `REM-${shortEbeln.substring(shortEbeln.length - 6)}`;


                var orders = this.groupByAuto(selectedQtyModel.selecteds.results, "Ebeln");
                objRemision.CantidadPedidos = Object.keys(orders).length;
                objRemision.Subtotal = parseFloat(selectedQtyModel.selecteds.results.map(item => item.QtyNet).reduce((prev, curr) => prev + curr, 0)).toFixed(3);
                objRemision.IEPS = parseFloat(selectedQtyModel.selecteds.results.map(item => item.QtyIeps).reduce((prev, curr) => prev + curr, 0)).toFixed(3);
                objRemision.IVA = parseFloat(selectedQtyModel.selecteds.results.map(item => item.QtyIva).reduce((prev, curr) => prev + curr, 0)).toFixed(3);
                objRemision.Total = parseFloat(selectedQtyModel.selecteds.results.map(item => item.QtyTotal).reduce((prev, curr) => prev + curr, 0)).toFixed(3);
                objRemision.Cita = this.getView().byId("appointment").getValue();

                if (this.remissionType == "packing") {
                    objRemision.EmpaqueEnCajas = (this.getView().byId("boxes") != null && this.getView().byId("boxes").getSelected()) ? "SI" : "NO";
                    objRemision.EmpaqueEnTarimas = (this.getView().byId("pallet") != null && this.getView().byId("pallet").getSelected()) ? "SI" : "NO";
                }

                //Datos de primer pedido
                objRemision.Remision = remName;
                objRemision.Tienda = selectedQtyModel.selecteds.results[0].Werks;
                objRemision.TiendaText = selectedQtyModel.selecteds.results[0].Name1;
                objRemision.Consecutivo = "0";

                //Importaciones
                if (this.getConfigModel().getProperty("/supplierInportation") != null
                    && this.getConfigModel().getProperty("/supplierInportation") == "X") {
                    var objPediment = {};
                    objPediment.Proveedor = this.getConfigModel().getProperty("/supplierInputKey");
                    objPediment.Remision = remName;
                    objPediment.Pedimento = this.getView().byId("petition").getValue();
                    objPediment.Aduana = this.getView().byId("customs").getValue();
                    objPediment.AgenteAduanal = this.getView().byId("customsBrokert").getValue();
                    objPediment.TipoPedimento = this.getView().byId("petitionType").getValue();
                    objPediment.FechaPedimento = this.getView().byId("petitionDate").getValue();
                    objPediment.FechaReciboLaredo = this.getView().byId("laredoDate").getValue();
                    objPediment.FechaBillOfLading = this.getView().byId("bLandingDate").getValue();

                    obj.Pedimento.columnas.push(objPediment);
                }

                for (var order in orders) {
                    var objPedidos = {};

                    objPedidos.Proveedor = this.getConfigModel().getProperty("/supplierInputKey");
                    objPedidos.Remision = remName;
                    objPedidos.FolioPedido = order;
                    objPedidos.Tienda = orders[order][0].Werks;
                    objPedidos.TiendaText = orders[order][0].Name1;
                    objPedidos.CantidadArticulos = orders[order].length;

                    obj.Pedidos.columnas.push(objPedidos);
                }

                selectedQtyModel.selecteds.results.forEach(function (item) {
                    var objArticulos = {};
                    objArticulos.Proveedor = this.getConfigModel().getProperty("/supplierInputKey");
                    objArticulos.Remision = remName;
                    objArticulos.FolioPedido = item.Ebeln;
                    objArticulos.Tienda = item.Werks;
                    objArticulos.TiendaText = item.Name1;
                    objArticulos.Codigo = item.Ean11;
                    objArticulos.CodigoText = item.Txz01;
                    objArticulos.CantidadUnidadCompra = parseFloat(item.QtySend).toFixed(3);
                    objArticulos.CostoNetoUnidadCompra = parseFloat(item.QtyNet).toFixed(3);
                    objArticulos.PorcentajeIEPS = parseFloat(item.ieps).toFixed(3);
                    objArticulos.PorcentajeIVA = parseFloat(item.iva).toFixed(3);

                    obj.Articulos.columnas.push(objArticulos);
                }, this);

                if (this.remissionType == "packing") {
                    selectedQtyModel.packagesList.forEach(function (item) {
                        var objPallet = {};
                        objPallet.Proveedor = this.getConfigModel().getProperty("/supplierInputKey");
                        objPallet.Remision = remName;
                        objPallet.NumeroCajaTarima = item.idPackage;
                        objPallet.SucursalDistribuir = item.Werks;
                        objPallet.Name1 = item.NWerks;
                        objPallet.CantidadArticulos = item.items.length;
                        objPallet.items = [];

                        item.items.forEach(function (itemDetail) {
                            var objPalletDetail = {};
                            objPalletDetail.Proveedor = this.getConfigModel().getProperty("/supplierInputKey");
                            objPalletDetail.Remision = remName;
                            objPalletDetail.FolioPedido = itemDetail.Bednr;
                            objPalletDetail.NumeroCajaTarima = item.idPackage;
                            objPalletDetail.SucursalDistribuir = itemDetail.Werks;
                            objPalletDetail.Codigo = selectedQtyModel.selecteds.results.find(
                                element => element.Ebeln == itemDetail.Bednr && element.Ean11 == itemDetail.Ean11
                            ).Ean11;
                            objPalletDetail.Descripcion = selectedQtyModel.selecteds.results.find(
                                element => element.Ebeln == itemDetail.Bednr && element.Ean11 == itemDetail.Ean11
                            ).Txz01;
                            objPalletDetail.CantidadUnidadCompra = itemDetail.QtySendChild;

                            objPallet.items.push(objPalletDetail);
                            obj.ArticulosPorCajaTarima.columnas.push(objPalletDetail);
                        }, this);

                        obj.CajasTarimas.columnas.push(objPallet);
                    }, this);
                }

            }

            obj.Remision.columnas.push(objRemision);

            this.getView().setModel(new JSONModel(obj), "reviewModel");
        },
        buildRemisionReview: function () {
            var objRemission = {};

            objRemission.Proveedor = this.getConfigModel().getProperty("/supplierInputKey");

            var today = new Date();
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yy = today.getFullYear().toString().substr(-2);

            objRemission.FechaRemision = `${mm}/${dd}/${yy}`;
            //objRemission.FechaRemision = 
            objRemission.TipoMoneda = this.getView().byId("currency").getSelectedKey();
            objRemission.TipoMonedaText = this.getView().byId("currency").getSelectedItem().getText();
            objRemission.TipoBulto = this.getView().byId("package").getSelectedKey();
            objRemission.TipoBultoText = this.getView().byId("package").getSelectedItem().getText();
            objRemission.EntregaMercancia = 1;
            if (this.getView().byId("reqFisc").getSelected()) {
                objRemission.CumpleReqFiscales = "Si";
            } else {
                objRemission.CumpleReqFiscales = "No";
            }

            objRemission.CantidadBultos = this.getView().byId("packagesNo").getValue();
            objRemission.FechaEntregaMercancia = this.getView().byId("deliveryDate").getValue();
            objRemission.Descuentos = 0;
            objRemission.OtrosImpuestos = 0;

            return objRemission;
        },
        groupByAuto: function (data, key) {
            var groups = {};
            for (var i in data) {
                if (!groups.hasOwnProperty(data[i][key])) groups[data[i][key]] = [];
                groups[data[i][key]].push(data[i]);
            }
            return groups;
        },
        activateQty: function () {
            var bContinue = false;
            var items = this.getView().getModel("selectedPositionsQty").getProperty("/selecteds/results");

            var hasEmptys = items.some(function (item) {
                return item.QtySend == null || item.QtySend == "" || item.QtySend == 0;
            }, this);

            //Valida que todos cumplan con caja tarima
            if (!hasEmptys) {
                if (this.remissionType == "packing") {
                    for (var i = 0; i < items.length; i++) {
                        hasEmptys = items[i].results.some(function (tmp) {
                            return tmp.QtySendChild != null && tmp.Package == null;
                        });

                        if (hasEmptys) {
                            break;
                        }
                    };
                }
            }

            if (!hasEmptys) {
                if (this.remissionType == "packing") {
                    this.getView().getModel().setProperty("/reviewButtonEnabled", true);
                } else {
                    this.getView().getModel().setProperty("/reviewButtonEnabled", true);
                }
                bContinue = true;
            } else {
                if (this.remissionType == "packing") {
                    this.getView().getModel().setProperty("/reviewButtonEnabled", false);
                } else {
                    this.getView().getModel().setProperty("/reviewButtonEnabled", false);
                }
                bContinue = false;
            }

            return bContinue;
        },
        handleWizardSubmit: function () {
            sap.m.MessageBox["confirm"](this.getView().getModel("appTxts").getProperty("/rem.submitMessage"), {
                actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                onClose: function (oAction) {
                    if (oAction === sap.m.MessageBox.Action.YES) {
                        var vLifnr = this.getConfigModel().getProperty("/supplierInputKey");
                        var obj = this.getView().getModel("reviewModel").getData();
                        var objRequest = {
                            "Lifnr": vLifnr,
                            "Type": "A",
                            "Format": "X",
                            "Log": [{ "Uuid": "", "Description": "", "Sts": "" }]
                        };

                        objRequest.Cfdi = JSON.stringify(obj);

                        var response = cfdiModel.create("/ECfdiSet ", objRequest);

                        if (response != null) {
                            if (response.Log != null) {
                                this.openLogErrorDialog(response);
                            } else {
                                sap.m.MessageBox.error(response.EMessage);
                            }
                        }

                        this._oWizard.discardProgress(this._oWizard.getSteps()[0]);
                        this.byId("wizardDialog").destroy();
                        this._pDialog = null;
                        this._oWizard = null;
                    }
                }.bind(this)
            });
        },
        openLogErrorDialog: function (response) {
            if (!this._uploadDialog2) {
                this._uploadDialog2 = sap.ui.xmlfragment("uploadInvoice", "demo.views.Remissions.fragments.LogError", this);
                this.getView().addDependent(this._uploadDialog2);
            }
            this._uploadDialog2.setModel(new JSONModel(response));
            this._uploadDialog2.open();
        },
        onCloseDialogUpload: function () {
            if (this._uploadDialog2) {
                this._uploadDialog2.destroy();
                this._uploadDialog2 = null;
            }
        },
        packageOnlyNumbers: function (element) {
            var vValue = this.byId(element).getValue();



            return bValid;
        },
        setPackage: function (oEvent) {

            if (oEvent.getSource().getValue() != "") {

                var numbers = /^[0-9]+$/;
                var bValid = oEvent.getSource().getValue().match(numbers);
                if (!bValid) {
                    sap.m.MessageBox.error("Solo se permiten numeros en este campo");

                    oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
                    return;
                } else {
                    oEvent.getSource().setValueState(sap.ui.core.ValueState.Success);
                }
            }

            //Creamos el objeto local
            var packagesListObj = [];


            //Obtenemos el path del item
            var sParentPath = oEvent.getSource().getParent().getBindingContext("selectedPositionsQty").getPath();
            //Obtenemos el item
            var itemChild = this.getView().getModel("selectedPositionsQty").getProperty(sParentPath);
            //Obtenemos el valor del pallet asignado
            var sValue = oEvent.getSource().getValue();
            //Obtenemos el modelo
            var packagesList = this.getView().getModel("selectedPositionsQty").getProperty("/packagesList");

            if (packagesList != null) {
                packagesListObj = packagesList;

                var packageIndex = packagesListObj.findIndex(element => element.idPackage == sValue);

                //Desasignamos de pallet previo
                if (itemChild.pallet != null) {
                    packagesListObj = this.removePallet(itemChild, packagesListObj);
                    itemChild.pallet = "";
                }

                //Existe el pallet
                if (packageIndex != null && packageIndex >= 0) {
                    //El centro asignado del pallet corresponde
                    if (packagesListObj[packageIndex].Werks == itemChild.Werks) {
                        if (!packagesListObj.includes(itemChild)) {
                            packagesListObj[packageIndex].items.push(itemChild);
                        }

                        this.getView().getModel("selectedPositionsQty").setProperty("/packagesList", packagesListObj);
                    } else {
                        sap.m.MessageBox.error(`La caja/tarima ${sValue} no corresponde al centro ${itemChild.Werks}, verifique sus entradas.`)
                        oEvent.getSource().setValue("");
                        sValue = "";
                    }
                } else {
                    //Crea un nuevo pallet
                    this.newPallet(sValue, itemChild, packagesListObj);
                }

            } else {
                //Crea un nuevo pallet
                this.newPallet(sValue, itemChild, packagesListObj);
            }

            //Asignamos el numero de pallet al item
            itemChild.pallet = sValue;
            this.activateQty();
        },
        newPallet: function (sValue, item, listObject) {
            var pallet = {
                "idPackage": sValue,
                "Werks": item.Werks,
                "NWerks": item.Name1,
                "items": []
            };

            pallet.items.push(item);

            listObject.push(pallet);

            this.getView().getModel("selectedPositionsQty").setProperty("/packagesList", listObject);
        },
        removePallet: function (item, packagesListObj) {
            if (item.pallet != null && item.pallet != "") {
                var palletIndex = packagesListObj.findIndex(element => element.idPackage == item.pallet);
                var itemIndex = packagesListObj[palletIndex].items.findIndex(element => element == item);

                packagesListObj[palletIndex].items.splice(itemIndex, 1);

                if (packagesListObj[palletIndex].items.length <= 0) {
                    packagesListObj.splice(palletIndex, 1);
                }
            }
            return packagesListObj;
        },
        clearWizards: function () {
            if (this.remissionType == "packing") {

            }
        },
        changeRemission: function (oEvent) {
            var sValue = oEvent.getSource().getValue();

            this.getView().getModel("reviewModel").getData().Pedidos.columnas.forEach(function (item) {
                item.Remision = sValue;
            });

            this.getView().getModel("reviewModel").getData().Articulos.columnas.forEach(function (item) {
                item.Remision = sValue;
            });

            this.getView().getModel("reviewModel").getData().CajasTarimas.columnas.forEach(function (item) {
                item.Remision = sValue;
            });

            this.getView().getModel("reviewModel").getData().ArticulosPorCajaTarima.columnas.forEach(function (item) {
                item.Remision = sValue;
            });

            this.getView().getModel("reviewModel").getData().Pedimento.columnas.forEach(function (item) {
                item.Remision = sValue;
            });
        },
        onCollapseAll: function () {
            var oTreeTable = this.byId("tableWizardOrderQty");
            oTreeTable.collapseAll();
        },
        onExpandFirstLevel: function () {
            var oTreeTable = this.byId("tableWizardOrderQty");
            oTreeTable.expandToLevel(1);
        }
    });
});
