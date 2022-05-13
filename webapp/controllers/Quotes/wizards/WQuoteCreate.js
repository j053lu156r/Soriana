sap.ui.define([
    "demo/controllers/BaseController",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
], function (Controller, Fragment, JSONModel) {
    "use strict";

    var ordersModel = new this.Pedidostemp();
    var citas1Model = new this.Citas1();
    return Controller.extend("demo.controllers.Quotes.wizards.WQuoteCreate", {

        createQuote: function (selectedKey) {
            if (this.getConfigModel().getProperty("/supplierInputKey") != null) {
                var oView = this.getView();

                var frag = "demo.views.Quotes.wizards.WQuoteCreate";

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
            } else {
                sap.m.MessageBox.error(this.getView().getModel("appTxts").getProperty("/quotes.messageNoSupplier"));
            }
        },
        onDialogAfterOpen: function () {
            this._oWizard = this.byId("QuoteCedisWizard");
            this._oWizard._getProgressNavigator().ontap = function(){};
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
                    //this.remissionValidate();
                    break;
                case 2:
                    oModel.setProperty("/nextButtonVisible", true);
                    //oModel.setProperty("/nextButtonEnabled", false);
                    oModel.setProperty("/backButtonVisible", true);
                    oModel.setProperty("/reviewButtonVisible", false);
                    oModel.setProperty("/finishButtonVisible", false);
                    //this.positionValidation();
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
        onCloseWizard: function () {
            this._handleMessageBoxOpen(this.getView().getModel("appTxts").getProperty("/quote.discardButton"), "warning");
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
        searchOrder: function (oEvent) {
            this._document = this.byId("searchOrder").getValue();
            this._document.trim();

            if(this._document != "") {
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

                this.byId("searchOrder").setValue("");
            } else {
                sap.m.MessageBox.error(this.getView().getModel("appTxts").getProperty("/quotes.messageEmptyOrder"));
            }
        },
        getDetailOrder: function () {
            var me = this;
            var urlPositions = `/Valida_citasSet?$expand=Po_validas&$filter=IOption eq '1' and IEbeln eq '${this._document}'`;
            this.getView().setModel(new JSONModel(), "tableWizardPo_validas");

            citas1Model.getJsonModelAsync(urlPositions, function(response){
                console.log(response)
                var ojbResponse = response.getProperty('/results/0');
                console.log(ojbResponse)
                if (ojbResponse.ESuccess == "X") {
                    var Po_validas = me.getView().getModel("tableWizardPo_validas");
                    Po_validas.setProperty('/Oekponav', ojbResponse.Po_validas);
                } else {
                    sap.m.MessageBox.error(ojbResponse.EMessage);
                }
            },function(){
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
        }
    });
});