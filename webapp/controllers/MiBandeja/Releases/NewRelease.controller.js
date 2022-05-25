sap.ui.define([
    "jquery.sap.global",
    "sap/ui/core/Fragment",
    "demo/controllers/BaseController",
    "sap/m/UploadCollectionParameter",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "sap/ui/core/routing/Router",
    "sap/m/upload/Uploader",
    "sap/ui/richtexteditor/RichTextEditor",
    "sap/ui/richtexteditor/EditorType",
    'sap/m/SearchField',
    'sap/m/Token'
], function (jQuery, Fragment, Controller, UploadCollectionParameter, History, JSONModel, SearchField, Token) {
    "use strict";

    var oModel = new this.MyInbox();
    return Controller.extend("demo.controllers.MiBandeja.Releases.NewRelease", {
        onInit: function () {
            this.oRouter = this.getOwnerComponent().getRouter();
            this.getView().addEventDelegate({
                onBeforeShow: function (oEvent) {
                    var nRelease = {
                        "attach": []
                    };
                    this.getOwnerComponent().setModel(new JSONModel(nRelease), "nRelease");
                    this.getView().byId("allSupp").setSelected(false);
                    this.getView().byId("btnAdd").setEnabled(true);
                    this.getView().byId("btnRemove").setEnabled(true);
                    //this.getView().byId("dateRange").dateRange
                   var oDRS2 = this.byId("dateRange");
                    oDRS2.setMinDate(new Date());
                    oDRS2.setDateValue(new Date());
                    oDRS2.setSecondDateValue(new Date());
                }
            }, this);
            this.configUploadSet(this.getView().byId("attacheds"));
            var oUploadSet = this.getView().byId("attacheds");

            oUploadSet.attachAfterItemRemoved(this.onDeleteAttach.bind(this));
            oUploadSet.attachAfterItemAdded(this.addAttach.bind(this));
        },
        onCancel: function () {
            this.goToMainRelease();
        },
        handleChange: function (oEvent) {
			var sFrom = oEvent.getParameter("from"),
				//sTo = oEvent.getParameter("to"),
				bValid = oEvent.getParameter("valid"),
				oEventSource = oEvent.getSource();
				//oText = this.byId("TextEvent");
			   //oText.setText("Id: " + oEventSource.getId() + "\nFrom: " + sFrom + "\nTo: " + sTo);

			if (bValid) {
				//oEventSource.setValueState(ValueState.None);
			} else {
				oEventSource.setValueState(ValueState.Error);
			}
		},
        goToMainRelease: function () {
            this.oRouter.navTo("masterRelease");
            this.clearFields();
        },
        clearFields: function () {

        },
        openSupplierSlect: function () {
            if (!this._uploadDialog2) {
                this._uploadDialog2 = sap.ui.xmlfragment("demo.views.MiBandeja.Releases.SupplierSelect", this);
                this.getView().addDependent(this._uploadDialog2);
            }
            this._uploadDialog2.open();
        },
        addSupplier: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            oEvent.getSource().getBinding("items").filter([]);

            if (!oSelectedItem) {
                return;
            }

            var suppObj = {
                "title": oSelectedItem.getTitle(),
                "description": oSelectedItem.getDescription()
            };

            var newRelease = {
                "suppList": []
            };

            if (this.getOwnerComponent().getModel("newRelease")) {
                newRelease.suppList = this.getOwnerComponent().getModel("newRelease").getProperty("/suppList");
                if (newRelease.suppList != null && !newRelease.suppList.find(element => element.title == suppObj.title)) {
                    newRelease.suppList.push(suppObj);
                }
            } else {
                newRelease.suppList.push(suppObj);
            }

            var model = new sap.ui.model.json.JSONModel(newRelease);
            this.getOwnerComponent().setModel(model, "newRelease");
        },
        deleteSupplier: function () {
            var vList = this.getView().byId("suppList").getSelectedItems();

            if (vList != null && vList.length > 0) {

                vList.forEach(element => {
                    var eBinding = element.getBindingContext("newRelease");

                    var obj = this.getOwnerComponent().getModel("newRelease").getObject(eBinding.sPath);
                    var array = this.getOwnerComponent().getModel("newRelease").getData().suppList;
                    array.splice(array.indexOf(obj), 1);
                    this.getOwnerComponent().getModel("newRelease").refresh();
                    this.getView().byId("suppList").removeSelections();
                });
            }
        },
        allSuppliers: function (oEvent) {
            var hasSelected = oEvent.getSource().getSelected();

            var vList = this.getView().byId("suppList").getItems();

            if (hasSelected) {
                if (vList.length > 0) {
                    var newRelease = {
                        "suppList": []
                    };
                    this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(newRelease), "newRelease");
                }
                this.getView().byId("btnAdd").setEnabled(false);
                this.getView().byId("btnRemove").setEnabled(false);
            } else {
                this.getView().byId("btnAdd").setEnabled(true);
                this.getView().byId("btnRemove").setEnabled(true);
            }
        },
        validateData(dateRannge, subject, message, supplierList, allSup) {
            var bContinue = true;
            if (dateRannge == null || dateRannge.getValue() == "") {
                bContinue = false;
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/release.daterangeError"));
            }

            if (bContinue) {
                if (subject == null || subject == "") {
                    bContinue = false;
                    sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/release.subjectError"));
                }
            }

            if (bContinue) {
                if (message == null || message == "") {
                    bContinue = false;
                    sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/release.messageError"));
                }
            }

            if (bContinue) {
                if (allSup == null || !allSup.getSelected()) {
                    if (supplierList == null || supplierList.getItems().length == 0) {
                        bContinue = false;
                        sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/release.supplierError"));
                    }
                }
            }

            return bContinue;
        },
        createRelease: function () {
            var subject = this.getView().byId("subject").getValue();
            var message = this.getView().byId("message").getValue();
            var dateRange = this.getView().byId("dateRange");
            var suppList = this.getView().byId("suppList");
            var allSupp = this.getView().byId("allSupp");
            var sendMail = this.getView().byId("sendMail");
            var userData = this.getOwnerComponent().getModel("userdata");
            var idUser = userData.getProperty("/EIdusua");
            var attachControl = this.getView().byId("attacheds");
            var itemsAttach = this.getView().getModel();

            //Fechas de entrega
            var startDate = this.buildSapDate(dateRange.getDateValue());
            var endDate = this.buildSapDate(dateRange.getSecondDateValue());

            if (!this.validateData(dateRange, subject, message, suppList, allSupp)) {
                return;
            }

            var arrSupplier = [];

            suppList.getItems().forEach(function (f) {
                var sObj = {
                    "Lifnr": f.getProperty("title")
                }
                arrSupplier.push(sObj);
            });

            var files = this.getOwnerComponent().getModel("nRelease").getProperty("/attach");

            var objRelease = {
                "IOption": "1",
                "IIdusua": idUser, //quien manda
                "IAllpro": this.booleanToAbapTrue(allSupp.getSelected()), // - TODOS LOS PROVEEDORES-
                "ISdate": startDate, //fecha de valides
                "IEdate": endDate,
                "IFmail": this.booleanToAbapTrue(sendMail.getSelected()), //Flag si quieres mandarlo por email
                "ISubject": subject,
                "IText": message, //-TEXTO DEL MENSAJE -
                "ITPROVNAV": arrSupplier, //si no esta marcada IAllpro mandas tabla con prov
                "ITATTACNAV": files
            }

            var response = oModel.create("/headInboxSet", objRelease);

            if (response != null) {
                if (response.ESuccess == "X") {
                    sap.m.MessageBox.success("Se ha enviado el comunicado.", {
                        actions: [sap.m.MessageBox.Action.CLOSE],
                        emphasizedAction: sap.m.MessageBox.Action.CLOSE,
                        onClose: function (sAction) {
                            this.goToMainReleases();
                            this.clearFields();
                        }.bind(this)
                    });
                } else {
                    sap.m.MessageBox.success(response.EMessage);
                }
            } else {
                sap.m.MessageBox.error("No se pudo conectar con el servidor, intente nuevamente.");
            }
        },
        goToMainReleases: function () {
            this.oRouter.navTo("masterRelease");
            this.clearFields();
        },
        clearFields: function () {
            this.getView().byId("subject").setValue("");
            this.getView().byId("message").setValue("");
            this.getView().byId("dateRange").setValue("");
            this.getOwnerComponent().setModel(new JSONModel(), "nRelease");
            var newRelease = {
                "suppList": []
            };
            this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(newRelease), "newRelease");
            this.getView().byId("allSupp").setSelected(false);
            this.getView().byId("sendMail").setSelected(false);

            var attach = this.getView().byId("attacheds");
            attach.destroyItems();
            attach.destroyIncompleteItems();
            attach.removeAllHeaderFields();
            attach.removeAllIncompleteItems();
            attach.removeAllItems();
        },
        onChangeUpload: function (oEvent) {
            var fileList = oEvent.getParameter("files");

            fileList;
        },
        addAttach: function (oEvent) {
            var pItem = oEvent.getParameter("item");
            var oItem = pItem.getFileObject();


            var nReleaseModel = this.getOwnerComponent().getModel("nRelease");

                var oFile = {};
                oFile.Zatname = oItem.name;
                oFile.Zdoctype = oItem.type;
                var reader = new FileReader();
                reader.onload = function (evn) {
                    oFile.Zdocvalue64 = evn.target.result;
                    var oAttach = nReleaseModel.getData();
                        oAttach.attach.push(oFile);
                    pItem.setUploadState(sap.m.UploadState.Complete);
                };
                reader.readAsDataURL(oItem);
        },
        onDeleteAttach: function (oEvent) {
            var oItem = oEvent.getParameter("item");
            var itemName = oItem.getFileObject();
            itemName;
        },
        booleanToAbapTrue: function (hasTrue) {
            var strAbapTrue = false;
            if (hasTrue) { strAbapTrue = "X" } else { strAbapTrue = "" }
            return strAbapTrue;
        },
        initRichTextEditor: function (bIsTinyMCE5) {
            var that = this;
            sap.ui.require(["sap/ui/richtexteditor/RichTextEditor", "sap/ui/richtexteditor/EditorType"],
                function (RTE, EditorType) {
                    that.oRichTextEditor = new RTE("message", {
                        editorType: bIsTinyMCE5 ? EditorType.TinyMCE5 : EditorType.TinyMCE4,
                        width: "100%",
                        customToolbar: true,
                        showGroupFont: true,
                        showGroupLink: true,
                        showGroupInsert: true,
                        value: "",
                        ready: function () {
                            this.addButtonGroup("styleselect").addButtonGroup("table");
                        }
                    });

                    that.getView().byId("idVerticalLayout").addContent(that.oRichTextEditor);
                });
        },
        readyEditor: function (oEvent) {
            oEvent.getSource().addButtonGroup("styleselect");
        },
        befInit: function (oEvent) {
            tinyMCE.execCommand("mceRepaint");
        },
        _onMultiInputValidate: function (oArgs) {
            if (oArgs.suggestionObject) {
                var oObject = oArgs.suggestionObject.getBindingContext().getObject(),
                    oToken = new Token();

                oToken.setKey(oObject.ProductId);
                oToken.setText(oObject.Name + " (" + oObject.ProductId + ")");
                return oToken;
            }

            return null;
        }
    });
});