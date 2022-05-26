sap.ui.define([
    "jquery.sap.global",
    "sap/ui/core/Fragment",
    "demo/controllers/BaseController",
    "sap/m/UploadCollectionParameter",
    "sap/ui/core/mvc/Controller",
    "sap/m/PDFViewer",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/ui/core/routing/Router",
    "demo/models/BaseModel",
    'sap/f/library'
], function (jQuery, Fragment, Controller, UploadCollectionParameter, History, PDFViewer, JSONModel, fioriLibrary) {
    "use strict";

    var oModel = new this.Repartidores();
    return Controller.extend("demo.controllers.Repartidores.Master", {
        onInit: function () {
            //this.setDaterangeMaxMin();
            this._pdfViewer = new PDFViewer();
            this.getView().addDependent(this._pdfViewer);
            this.getView().addEventDelegate({
                onAfterShow: function (oEvent) {
                    var barModel = this.getOwnerComponent().getModel();
                    barModel.setProperty("/barVisible", true);
                    this.getOwnerComponent().setModel(new JSONModel(), "RepartidoresHdr");
                    this.clearFilters();
                }
            }, this);
            this.configFilterLanguage(this.getView().byId("filterBar"));
        },
        searchData: function () {
            if (!this.hasAccess(27)) {
                return false;
            }
            var bContinue = true;

            if (!oModel.getModel()) {
                oModel.initModel();
            }

            var vUser = this.getView().byId('repartidorInput').getValue();
            var vLifnr = this.getConfigModel().getProperty("/supplierInputKey");
            var texts = this.getOwnerComponent().getModel("appTxts");

            if (bContinue) {

                if(vLifnr == null){
                    vLifnr = "";
                }

                var url = "HrdDealersSet?$expand=ETDEALERSNAV&$filter= IOption eq '4' and ILifnr eq '" + vLifnr + "'"; // Se debe validar que el usuario este activo
                ;

                if (vUser != "") {
                    url += " and IName eq '" + vUser + "'";
                }

                var dueModel = oModel.getJsonModel(url);

                var ojbResponse = dueModel.getProperty("/results/0");

                console.log(dueModel);

                this.getOwnerComponent().setModel(new JSONModel(ojbResponse),
                    "RepartidoresHdr");

                this.paginate("RepartidoresHdr", "/ETDEALERSNAV", 1, 0);
            }

        },
        onExit: function () {

        },
        filtrado: function (evt) {
            var filterCustomer = [];
            var query = evt.getParameter("query");
            var obFiltro = this.getView().byId("selectFilter");
            var opFiltro = obFiltro.getSelectedKey();
            if (query && query.length > 0) {
                var filter = new sap.ui.model.Filter(opFiltro, sap.ui.model.FilterOperator.Contains, query);
                filterCustomer.push(filter);
            }

            var list = this.getView().byId("complPagoList");
            var binding = list.getBinding("items");
            binding.filter(filterCustomer);
        },
        setDaterangeMaxMin: function () {
            var datarange = this.getView().byId('dateRange');
            var date = new Date();
            var minDate = new Date();
            var minConsultDate = new Date();
            minConsultDate.setDate(date.getDate() - 7);
            minDate.setDate(date.getDate() - 30);
            datarange.setSecondDateValue(date);
            datarange.setDateValue(minConsultDate);
        },
        onListItemPress: function (oEvent) {
         
            var resource = oEvent.getSource().getBindingContext("RepartidoresHdr").getPath(),
                line = resource.split("/").slice(-1).pop();

            var odata = this.getOwnerComponent().getModel("RepartidoresHdr");
            var results = odata.getProperty("/ETDEALERSNAV/Paginated/results");

            var docResult = results[line]; //.campo para obtener el campo deseado            

            this.getOwnerComponent().setModel(new JSONModel(status), "catalogStatus");

            this.modifyButton(docResult, true);
        },
        modifyButton: function (Results , selected) {
            if (!this.hasAccess(39)) {
                return false;
            }

            var texts = this.getOwnerComponent().getModel("appTxts");
            var that = this;

            this._createDialog = sap.ui.xmlfragment("CreateDealersFragment", "demo.views.Repartidores.fragments.CreateDealersFragment", this);
            this.getView().addDependent(this._createDialog);

            var status = {
                "Status": [
                    {
                        "description": "Activo"
                    },
                    {
                        "description": "Baja"
                    }
                ]
            };

            this.getOwnerComponent().setModel(new JSONModel(status), "catalogStatus");
            

            var UserModel = this.getOwnerComponent().getModel("userdata");
            var userRol = UserModel.getProperty("/ERol");
            var editable = false;

            if (userRol != null && userRol == "0001" || userRol == "0002" || userRol == "0005"){
                editable =  true;
            }
            //Solo Determinados usuarios pueden modificar estos campos
                sap.ui.core.Fragment.byId("CreateDealersFragment", "supplier").setValue(Results.Lifnr).setEditable(editable).setVisible(editable);
                sap.ui.core.Fragment.byId("CreateDealersFragment", "lblSupplier").setVisible(editable);
                
            if (selected){
                sap.ui.core.Fragment.byId("CreateDealersFragment", "name").setValue(Results.Repartidor).setEditable(editable);
                sap.ui.core.Fragment.byId("CreateDealersFragment", "key").setValue(Results.Clave).setEditable(editable);
                sap.ui.core.Fragment.byId("CreateDealersFragment", "fcad").setValue(Results.Endda).setEditable(editable);
                sap.ui.core.Fragment.byId("CreateDealersFragment", "status").setValue(Results.Zactivo); 
                sap.ui.core.Fragment.byId("CreateDealersFragment", "Id").setValue(Results.Usua);               

                if(editable){
                    sap.ui.core.Fragment.byId("CreateDealersFragment", "modifyDialog").setVisible(true);
                    sap.ui.core.Fragment.byId("CreateDealersFragment", "saveDialog").setVisible(false);
                }
                
            }
            else{
                sap.ui.core.Fragment.byId("CreateDealersFragment", "status").setValue("Activo").setEditable(false);
                sap.ui.core.Fragment.byId("CreateDealersFragment", "modifyDialog").setVisible(false);
            }
            this._createDialog.setTitle(texts.getProperty("/rep.modifydealer"));
            
            this._createDialog.open();
        },
        createButton: function (Results , selected) {
            if (!this.hasAccess(37)) {
                return false;
            }

            var texts = this.getOwnerComponent().getModel("appTxts");
            var that = this;

            this._createDialog = sap.ui.xmlfragment("CreateDealersFragment", "demo.views.Repartidores.fragments.CreateDealersFragment", this);
            this.getView().addDependent(this._createDialog);

            var status = {
                "Status": [
                    {
                        "description": "Activo"
                    },
                    {
                        "description": "Baja"
                    }
                ]
            };

            this.getOwnerComponent().setModel(new JSONModel(status), "catalogStatus");

            var UserModel = this.getOwnerComponent().getModel("userdata");
            var userRol = UserModel.getProperty("/ERol");
            var editable = false;

            if (userRol != null && userRol == "0001" || userRol == "0002" || userRol == "0005"){
                editable =  true;
            }
            //Solo Determinados usuarios pueden modificar estos campos
                sap.ui.core.Fragment.byId("CreateDealersFragment", "supplier").setValue(Results.Lifnr).setEditable(editable).setVisible(editable);
                sap.ui.core.Fragment.byId("CreateDealersFragment", "lblSupplier").setVisible(editable);

            if (selected){
                sap.ui.core.Fragment.byId("CreateDealersFragment", "name").setValue(Results.Repartidor).setEditable(editable);
                sap.ui.core.Fragment.byId("CreateDealersFragment", "key").setValue(Results.Clave).setEditable(editable);
                sap.ui.core.Fragment.byId("CreateDealersFragment", "fcad").setValue(Results.Endda).setEditable(editable);
                sap.ui.core.Fragment.byId("CreateDealersFragment", "status").setValue(Results.Zactivo); 
                sap.ui.core.Fragment.byId("CreateDealersFragment", "Id").setValue(Results.Usua);               

                if(editable){
                    sap.ui.core.Fragment.byId("CreateDealersFragment", "modifyDialog").setVisible(true);
                    sap.ui.core.Fragment.byId("CreateDealersFragment", "saveDialog").setVisible(false);
                }
                
            }
            else{
                sap.ui.core.Fragment.byId("CreateDealersFragment", "status").setValue("Activo").setEditable(false);
                sap.ui.core.Fragment.byId("CreateDealersFragment", "modifyDialog").setVisible(false);
            }
            this._createDialog.setTitle(texts.getProperty("/rep.create"));
            this._createDialog.open();
        },
        deleteButton: function () {
            if (!this.hasAccess(38)) {
                return false;
            }

            var oItems = this.byId("tableRepartidores").getSelectedItems();
            var texts = this.getOwnerComponent().getModel("appTxts");

            if (oItems.length > 0) {

            var uriTable = {
                "IOption" : "3",
                "ITDMODIFYNAV" : []
            };

            var obj = {};
            var UserModel = this.getOwnerComponent().getModel("userdata");
            var userId = UserModel.getProperty("/EIdusua");

            var that = this;

                oItems.forEach(function (item) {
                    var lItem = item.getBindingContext("RepartidoresHdr").getObject();
                    var d = lItem.Endda.toString();   
                    
                    var vEndda = d.substring(0, 4).concat(d.substring(5, 7)).concat(d.substring(8, 10));

                    if(lItem.Zactivo != null){
                        lItem.Zactivo = "B";
                    }                   

                    obj.Usua = lItem.Usua, // No.Repartidor
                    obj.Repartidor = lItem.Repartidor,
                    obj.Clave = lItem.Clave,
                    obj.Endda = vEndda,
                    obj.Zactivo = lItem.Zactivo, 
                    obj.Aenam = userId, // Usuario que modifica el registro
                    uriTable.ITDMODIFYNAV.push(obj);
                    obj = {};
                });

                    var dueModelcode = oModel.create("/HrdDealersSet", uriTable);
                    if (dueModelcode != null) {
                        if (dueModelcode.ESuccess == 'X'){ 

                            sap.m.MessageBox.success(texts.getProperty("/rep.success"));
                        }
                        else{
                            sap.m.MessageBox.error(dueModelcode.EMessage + texts.getProperty("/rep.error"));
                        }
                    }
            }
        },
        onSave: function (Ioption) {
            this.callUri("2");
        },
        onCancel: function () {
            if (this._createDialog) {
                this._createDialog.close();
                this._createDialog.destroy();
                this._createDialog = undefined;
            }
        },
        onModify: function(){
            this.callUri("3"); 
        },
        clearFilters : function(){
            this.getView().byId("repartidorInput").setValue("");
            this.getView().byId("supplierInput").setValue("");
        },
        callUri: function(Ioption){
            var UserModel = this.getOwnerComponent().getModel("userdata");
            var userId = UserModel.getProperty("/EIdusua");

            var texts = this.getOwnerComponent().getModel("appTxts");
            var vName = sap.ui.core.Fragment.byId("CreateDealersFragment", "name").getValue();
            var vKey = sap.ui.core.Fragment.byId("CreateDealersFragment", "key").getValue();
            var vFcad = sap.ui.core.Fragment.byId("CreateDealersFragment", "fcad");
            var vStatus = sap.ui.core.Fragment.byId("CreateDealersFragment", "status").getValue();
            var vId = sap.ui.core.Fragment.byId("CreateDealersFragment", "Id").getValue();

            var vLifnr = this.getConfigModel().getProperty("/supplierInputKey");
            if(vLifnr == null || vLifnr == ""){
                vLifnr = sap.ui.core.Fragment.byId("CreateDealersFragment", "supplier").getValue();
            }

            if(vName == null || vName == ""){
                sap.m.MessageBox.error(dueModelcode.EMessage + texts.getProperty("/rep.noName"));
            }

            if(vKey == null || vKey == ""){
                sap.m.MessageBox.error(dueModelcode.EMessage + texts.getProperty("/rep.noKey"));
            }

            if(vFcad == null || vFcad == ""){
                sap.m.MessageBox.error(dueModelcode.EMessage + texts.getProperty("/rep.noFcad"));
            }

            //Fechas de vigencia
            var startDate = this.buildSapDate(vFcad.getDateValue());

            var uriTable = {
                "IOption": Ioption,
                "ITRECORDNAV": [] ,
                "ITDMODIFYNAV" : []
            };

            var obj = {};

                if (Ioption == "3"){
                    if(vStatus != null){
                        switch(vStatus){
                            case "Activo":
                                vStatus = "A";
                                break;
                            case "Baja":
                                vStatus = "B";
                                break;
                        }
                    }

                    obj.Usua = vId,
                    obj.Repartidor = vName,
                    obj.Clave = vKey,
                    obj.Endda = startDate;
                    obj.Zactivo = vStatus, 
                    obj.Aenam = userId, 
                    uriTable.ITDMODIFYNAV.push(obj);                    
                }

                if (Ioption == "2"){
                    obj.Repartidor = vName,
                    obj.Clave = vKey,
                    obj.Aenam = userId,
                    obj.Endda = startDate;
                    obj.Lifnr = vLifnr,
                    uriTable.ITRECORDNAV.push(obj);
                }                

            var dueModelcode = oModel.create("/HrdDealersSet", uriTable);
                if (dueModelcode != null) {
                    if (dueModelcode.ESuccess == 'X'){ 

                        sap.m.MessageBox.success(texts.getProperty("/rep.success"));
                    }
                    else{
                        sap.m.MessageBox.error(dueModelcode.EMessage + texts.getProperty("/rep.error"));
                    }
                }
                if (this._createDialog) {
                    this._createDialog.close();
                    this._createDialog.destroy();
                    this._createDialog = undefined;
                }
        },
        buildExportTable: function () {
            var texts = this.getOwnerComponent().getModel("appTxts");
            var columns = [
                 {
                    name: texts.getProperty("/rep.number"),
                    template: {
                        content: "{Usua}"
                    }
                },
                {
                    name: texts.getProperty("/rep.supplier"),
                    template: {
                        content: "{Lifnr}"
                    }
                },
                {
                    name: texts.getProperty("/rep.supplierName"),
                    template: {
                        content: "{Nlifnr}"
                    }
                },
                {
                    name: texts.getProperty("/rep.name"),
                    template: {
                        content: "{Repartidor}"
                    }
                },
                {
                    name: texts.getProperty("/rep.key"),
                    template: {
                        content: "{Clave}"
                    }
                },
                {
                    name: texts.getProperty("/rep.fcad"),
                    template: {
                        content: "{Endda}"
                    }
                },
                {
                    name: texts.getProperty("/rep.status"),
                    template: {
                        content: "{Zactivo}"
                    }
                },                
            ];

            this.exportxls('RepartidoresHdr', '/ETDEALERSNAV/results', columns);
        }

    });
});