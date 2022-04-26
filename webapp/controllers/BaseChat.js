sap.ui.define([
    "demo/controllers/BaseController",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "demo/models/BaseModel"
], function (Controller, Fragment, JSONModel) {
    "use strict";

    var oModel = new this.ChatBot();
    return Controller.extend("demo.controllers.BaseChat", {
        shutPopOver: function (oButton) {
            var oView = this.getView();

            // create chatbot
            if (!this._pChatBot) {
                this._pChatBot = Fragment.load({
                    id: 'chatBotFragment',
                    name: "demo.fragments.ChatBotView",
                    controller: this
                }).then(function (pChatBot) {
                    oView.addDependent(pChatBot);

                    return pChatBot;
                });
            }
            this._pChatBot.then(function (pChatBot) {
                pChatBot.openBy(oButton);
                var cBotInput = Fragment.byId("chatBotFragment", "chatBotInput");

                if (cBotInput != null) {
                    cBotInput.addEventDelegate({
                        "onAfterRendering": function (oEvent) {
                        }
                    }, this);
                }
            });

            var lModel = this.getOwnerComponent().getModel("cBot");
            if (lModel == null) {
                this.initialChatBot()
            }

            this.getOwnerComponent().getModel("configSite").setProperty("/hasAutoChat", false);
        },
        handleChatbotPress: function (oEvent) {
            var oButton = oEvent.getSource();
            this.shutPopOver(oButton);
        },
        initialChatBot: function () {
            this.getOdataRequest("1", "01", "M");
        },
        getBackChatResponse: function (level, option) {
            var lvl = parseInt(level);
            //lvl--;
            this.getOdataRequest(option, lvl, "P");
        },
        getNextChatResponse: function (oEvent) {
            var sPath = oEvent.getSource().getBindingContext("cBot").getPath();

            var bContext = this.getOwnerComponent().getModel("cBot").getProperty(sPath);

            var level = bContext.level,
                option = bContext.option;

            var lvl = parseInt(level);
            lvl++;

            this.getOdataRequest(option, lvl, "M");
        },
        getOdataRequest: function (option, level, cmd) {
            var vBox = sap.ui.getCore().byId("fieldsBox");
            if (vBox != null) {
                vBox.destroy();
            }

            var url = `/headChatBotSet?$expand=ETCBCTRLNAV&$filter=IIdopcion eq '${option}'`
                + ` and INivel eq '${level}' and ICmd eq '${cmd}'`;

            oModel.getJsonModelAsync(url,
                function (jsonModel, parent) {
                    var objResponse = jsonModel.getProperty("/results/0/ETCBCTRLNAV/results");
                    var returnLevel = jsonModel.getProperty("/results/0/ENivel");
                    var returnOption = jsonModel.getProperty("/results/0/EIdopcion");
                    var msgChat = parent.buildChatMessage(objResponse, returnLevel, returnOption)

                    var chatModel = {
                        "ETCBCTRLNAV": {
                            "results": []
                        }
                    };

                    chatModel.ETCBCTRLNAV.results.push(msgChat);
                    parent.getOwnerComponent().setModel(new JSONModel(chatModel), "cBot");

                    var timeLine = Fragment.byId("chatBotFragment", "idTimeline");
                    if (timeLine != null) {
                        timeLine.setVisible(true);
                    }

                    if (msgChat.parameter != null && msgChat.parameter != "") {
                        var obj = JSON.parse(msgChat.parameter);
                        parent.applyResource(obj, msgChat.message, parent);
                    }
                },
                function (parent) {

                }, this);
        },
        btnApply: function (oEvent) {
            var that = this;
            var oContext = oEvent.getSource().getBindingContext("viewContext");

            var bContext = oContext.getModel("cBot").getProperty("/ETCBCTRLNAV/results/0");

            var oItems = sap.ui.getCore().byId("fieldsBox").getItems();
            var sRouteName = oContext.getController().currentRouteName;

            var viewPath = oContext.getController().getRouter().getTargets().getTarget(sRouteName)._oOptions.viewPath;
            var viewName = oContext.getController().getRouter().getTargets().getTarget(sRouteName)._oOptions.name;

            var vView = oContext.getController().getvView(sRouteName, viewPath, viewName);
            var controller = vView.getController();

            if (typeof controller.clearFilters === "function") {
                controller.clearFilters();
            }

            var obj = JSON.parse(bContext.parameter);
            if (obj.event == "fill") {
                obj.field.forEach(function (field) {
                    switch (field.type) {
                        case "input":
                        case "daterange":
                            var item = oItems.find(element => element.sId == `${field.field}Chat`);
                            var sValue = item.getValue();

                            if (sValue != null && sValue != "") {
                                if (sRouteName != obj.target) {
                                    oContext.getController().getRouter().navTo(obj.target);
                                }
                                oContext.getController().changeFieldVlue(field.field, sValue, vView);
                            }
                            break;
                    }
                }, this);

                if (typeof controller.searchData === "function") {
                    controller.searchData();
                }

            }
        },
        changeFieldVlue: function (field, value, vView) {
            var vField = vView.byId(field);
            vField.setValue(value);
        },
        getvView: function (sRouteName, viewPath, viewName) {
            var currRout = this.oOwnerComponent.getRouter().getViews()._oCache.view;
            var vView = currRout[`${viewPath}.${viewName}`]["undefined"];
            return vView;
        },
        applyResource: function (resource, message, parent) {
            var timeLine = Fragment.byId("chatBotFragment", "idTimeline");
            switch (resource.event) {
                case "navigate":
                    timeLine.setVisible(true);

                    var viewName = this.getCurrentRouteName();
                    if (viewName != resource.target) {
                        this.getOwnerComponent().getModel("configSite").setProperty("/hasAutoChat", true);
                    }
                    this.getOwnerComponent().getRouter().navTo(resource.target);

                    if (resource.function != null && resource.function != "") {
                        setTimeout(function () {
                            var viewPath = parent.getRouter().getTargets().getTarget(resource.target)._oOptions.viewPath;
                            var viewName = parent.getRouter().getTargets().getTarget(resource.target)._oOptions.name;

                            var vView = parent.getView().getController().getvView(resource.target, viewPath, viewName);
                            var controller = vView.getController();
                            
                            if (typeof controller[resource.function] === "function") {
                                controller[resource.function]();
                            }
                        }, 1000);
                    }
                    break;
                case "fill":
                    var popOver = Fragment.byId("chatBotFragment", "myPopover");
                    var vBox = new sap.m.VBox({
                        id: "fieldsBox"
                    });
                    vBox.setVisible(true);

                    vBox.addItem(new sap.m.Text({
                        text: message
                    }));

                    timeLine.setVisible(false);

                    resource.field.forEach(function (field) {
                        switch (field.type) {
                            case "input":
                                vBox.addItem(new sap.m.Input({
                                    id: `${field.field}Chat`
                                }));
                                break;
                            case "daterange":
                                vBox.addItem(new sap.m.DateRangeSelection({
                                    id: `${field.field}Chat`
                                }));
                                break;
                        }
                    }, this);

                    var button = new sap.m.Button({
                        press: this.btnApply,
                        text: this.getView().getModel("appTxts").getProperty("/chatbot.search")
                    });

                    button.setBindingContext(this.getView(), "viewContext");
                    vBox.addItem(button);

                    popOver.addContent(vBox);

                    break;
                default:
                    timeLine.setVisible(true);
                    break;
            }
        },
        getCurrentRouteName: function (router = this.getOwnerComponent().getRouter()) {
            const currentHash = router.getHashChanger().getHash();
            return router.getRouteInfoByHash(currentHash).name; // since 1.75
        },
        buildChatMessage(modelResponse, returnLevel, returnOption) {
            var msgObj = {
                "message": "",
                "type": "",
                "rOption": returnOption,
                "rLevel": returnLevel,
                "options": [],
                "parameter": "",
                "level": ""
            };

            modelResponse.forEach(function (obj) {
                switch (obj.Ztipo) {
                    case "M":
                        msgObj.options.push(
                            {
                                "name": obj.Zname,
                                "resource": obj.Zrecurso,
                                "level": obj.Nivel,
                                "option": obj.Idopcion
                            });
                        break;
                    default:
                        msgObj.message = obj.Zname;
                        msgObj.type = obj.Ztipo;
                        msgObj.level = obj.Nivel;
                        msgObj.parameter = obj.Zrecurso;
                        break;
                }
            });

            return msgObj;
        },
        hasOptionVisible: function(parameters){

            if( parameters == undefined || parameters == "" ) return true;
            
            if( typeof parameters === 'string' ) parameters = JSON.parse( parameters );

            if( parameters.hasOwnProperty('idTile')     ) return this.hasTileVisible( parameters.idTile );
            if( parameters.hasOwnProperty('idFunction') ) return this.hasAccess( parameters.idFunction, false );
        }
    });
});
