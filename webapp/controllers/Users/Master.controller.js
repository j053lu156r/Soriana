sap.ui.define([
    "jquery.sap.global",
    "sap/ui/core/Fragment",
    "demo/controllers/BaseController",
    "sap/m/UploadCollectionParameter",
    "sap/ui/core/mvc/Controller",
    "sap/m/PDFViewer",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "sap/ui/core/routing/Router",
    "demo/models/BaseModel",
    'sap/f/library'
], function (jQuery, Fragment, Controller, UploadCollectionParameter, History, PDFViewer, JSONModel, fioriLibrary) {
    "use strict";

    var oModel = new this.UserModel();
    return Controller.extend("demo.controllers.Users.Master", {
        onInit: function () {
            this._pdfViewer = new PDFViewer();
            this.getView().addDependent(this._pdfViewer);
            this.getView().addEventDelegate({
                onBeforeShow: function (oEvent) {
                    this.getOwnerComponent().setModel(new JSONModel(), "tableItemsUsers");
                },
                onAfterShow: function (oEvent) {
                    var barModel = this.getConfigModel();
                    barModel.setProperty("/barVisible", true);
                    this.getView().byId("filterMail").setValue("");
                    this.getView().byId("colSor").setSelected(false);
                    this.getView().byId("supplierInput").setEnabled(true);
                    this.getView().byId("sendDorps").setSelected(false);
                }
            }, this);
        },
        searchData: function () {
            if(!this.hasAccess(12)){
                return
            }

            var bContinue = false;
            if (!oModel.getModel()) {
                oModel.initModel();
            }

            var vLifnr = this.getConfigModel().getProperty("/supplierInputKey");

            if (this.getView().byId("colSor").getSelected()) {
                vLifnr = '-1';
            }
            var vIuser = this.getOwnerComponent().getModel("userdata").getProperty("/EIdusua");
            var vRol = this.getOwnerComponent().getModel("userdata").getProperty("/ERol");
            var iMail = this.getView().byId("filterMail").getValue();
            var vDropUser = this.getView().byId("sendDorps").getSelected();
            var vCallUser = this.getView().byId("callUser").getSelected();

 /* INICIA INSERT BORTA  Se solicita validar que cuando no se ingresan valores a los filtros, enviar error    */           
              if (vLifnr == null || vLifnr == "") {
                     if(iMail == ""){   
                         if(vDropUser == ""){
                            if(vCallUser == ""){
                                bContinue = false;
                                sap.m.MessageBox.error("Debe ingresar al menos un criterio de busqueda.");
                            }else{
                            bContinue = true;     
                             }
                        }else{
                        bContinue = true;                                
                        }
                    }else{
                    bContinue = true; 
                    }                  
                } else {
                bContinue = true;
                }
/* FIN INSERT BORTA  Se solicita validar que cuando no se ingresan valores a los filtros, enviar error    */ 

            if(bContinue){
            var url = "/headerAdmSet?$expand=ETNOMPROVNAV&$filter=IOption eq '10' and IRol eq '" + vRol + "'"
            + " and  IIdusua eq '" + vIuser + "'";            
            if(vLifnr != null && vLifnr != ""){
                url += " and ILifnr eq '" + vLifnr + "'";
                bContinue = true;
            }

            if(vDropUser != ""){
                url += " and IUnsubsc eq 'X'";
                bContinue = true;
            }

            if(iMail != ""){
                url += " and IMail eq '" + iMail + "'";
                bContinue = true;
            }

            if(vCallUser != ""){
                url += " and Zcallc eq 'X'";
                bContinue = true;
            }

            if (bContinue) {
                var dueModel = oModel.getJsonModel(url);

                var ojbResponse = dueModel.getProperty("/results/0");
                this.getOwnerComponent().setModel(new JSONModel(ojbResponse),
                    "tableItemsUsers");
            }

            this.paginate("tableItemsUsers", "/ETNOMPROVNAV", 1, 0);
            }
        },
        cambioValor: function () {
            this.getOwnerComponent().setModel(new JSONModel({}),
            "tableItemsUsers");
        },
        onValueHelpRequest1: function () {
       
            //gpg
            
            this.getOwnerComponent().setModel(new JSONModel({}),
                "tableItemsUsers");
                
                //gpg
            var oView = this.getView();

            if (!this._pValueHelpDialog) {
                this._pValueHelpDialog = sap.ui.core.Fragment.load({
                    id: oView.getId(),
                    name: "demo.fragments.SupplierSelect",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }
            this._pValueHelpDialog.then(function (oDialog) {
                // Create a filter for the binding
                //oDialog.getBinding("items").filter([new Filter("Name", FilterOperator.Contains, sInputValue)]);
                // Open ValueHelpDialog filtered by the input's value
                oDialog.open();
            });
        },
        onSelectColaborator: function () {
            if (this.getView().byId("colSor").getSelected() || this.getView().byId("callUser").getSelected()) {
                this.getView().byId("supplierInput").setEnabled(false);
                var vLifnr = "";
            } else {
                this.getView().byId("supplierInput").setEnabled(true);
            }
        },
        onExit: function () {
            if (this._oDialog) {
                this._oDialog.destroy();
                this._oDialog = null;
            }

            if (this._uploadDialog1) {
                this._uploadDialog1.destroy();
                this._uploadDialog1 = null;
            }

            if (this._uploadDialog2) {
                this._uploadDialog2.destroy();
                this._uploadDialog2 = null;
            }

            if (this._oPopover) {
                this._oPopover.destroy();
                this._oPopover = null;
            }

            this.getOwnerComponent().getModel("tableItemsUsers").destroy();
        },
        onListItemPress: function (oEvent) {
           
            var userPath = oEvent.getSource().getBindingContext("tableItemsUsers").getPath(),
                line = userPath.split("/").slice(-1).pop();

            var odata = this.getOwnerComponent().getModel("tableItemsUsers");
            var result = odata.getProperty(userPath);

            if (result.Lifnr == "") {
                result.Lifnr = "-1";
            }

            this.getOwnerComponent().getRouter().navTo("detailUsers", { layout: sap.f.LayoutType.TwoColumnsMidExpanded, user: result.Idusua, supplier: result.Lifnr }, true);
        },
       
        createUser: function () {
            if(!this.hasAccess(13)){
                return
            }
            this.getOwnerComponent().getRouter().navTo("NewUsers", { layout: sap.f.LayoutType.OneColumn }, true);
        }

    });
});