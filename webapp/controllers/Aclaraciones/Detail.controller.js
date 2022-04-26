sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "demo/controllers/BaseController",
	"sap/ui/core/mvc/Controller"
], function (JSONModel, Controller) {
    "use strict";
    
  
    var sUri = "/sap/opu/odata/sap/ZOSP_ACLARA_SRV/";

	return Controller.extend("demo.controllers.Aclaraciones.Detail", {
		onInit: function () {
			var oExitButton = this.getView().byId("exitFullScreenBtn"),
                oEnterButton = this.getView().byId("enterFullScreenBtn");
            
            this._uploadDialog = sap.ui.xmlfragment("uploadFilesFragment", "demo.views.Aclaraciones.fragments.UploadAttachmentFiles", this);
            this.getView().addDependent(this._uploadDialog);

            // this.configUploadSet( sap.ui.core.Fragment.byId("uploadFilesFragment", "attachmentDocuments") );
            // var oUploadSet = sap.ui.core.Fragment.byId("uploadFilesFragment", "attachmentDocuments");
            this.configUploadSet( this.getView().byId("attachmentDocuments") );
            var oUploadSet = this.getView().byId("attachmentDocuments");

            oUploadSet.attachAfterItemRemoved(this.onDeleteAttach.bind(this));
            oUploadSet.attachAfterItemAdded(this.addAttach.bind(this));
            
            this.clearFields();
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oModel = this.getOwnerComponent().getModel();

            this.oRouter.getRoute("detailAclaracion").attachPatternMatched(this._onDocumentMatched, this);

            let fileSize = sap.ui.getCore().getModel( "catalogos_base").getProperty('/sizeFilesUpload');
            if( !isNaN(parseInt( fileSize, 10 )) && parseInt( fileSize, 10 ) > 0 )
                oUploadSet.setMaxFileSize( parseFloat(fileSize) );

            
            /*this.getView().addEventDelegate({
                onBeforeShow: function (oEvent) {                    
                }
            }, this);*/

			[oExitButton, oEnterButton].forEach(function (oButton) {
				oButton.addEventDelegate({
					onAfterRendering: function () {
						if (this.bFocusFullScreenButton) {
							this.bFocusFullScreenButton = false;
							oButton.focus();
						}
					}.bind(this)
				});
            }, this);

            
            
            
        },
        addAttach: function (oEvent) {
            var that = this;
            var pItem = oEvent.getParameter("item");
            var oItem = pItem.getFileObject();

            /*var nRelease = {
                "attach": []
            };*/
            var nReleaseModel = that.getOwnerComponent().getModel("nRelease");
            if (nReleaseModel != null) {
                /*var oAttach = nReleaseModel.getProperty("/attach");
                if (oAttach != null) {
                    nRelease.attach = [ ...oAttach ];
                }*/
                //this.newAttach(oItem);
                var oFile = {};
                oFile.Zdoctype = oItem.name;
                var reader = new FileReader();
                reader.onload = function (evn) {
                    oFile.Zdocvalue64 = evn.target.result;
                    //arrAttach.push(oFile);

                    let nRelease = {'attach': ( that.getOwnerComponent().getModel('nRelease').getProperty("/attach") == null )? [] : that.getOwnerComponent().getModel('nRelease').getProperty("/attach") } ;

                    nRelease.attach.push( oFile );
                    /*let Files = that.getOwnerComponent().getModel("Documentos").getProperty("/ZtaclaraDo");
                    try{
                        Files.results.push( oFile );
                        Files.Paginated.results.push( oFile );
                    }catch(err){
                        console.error(err);
                    }*/

                    that.getOwnerComponent().setModel(new JSONModel(nRelease), "nRelease");
                    pItem.setUploadState(sap.m.UploadState.Complete);
                };
                reader.readAsDataURL(oItem);
            } else {
                //this.newAttach(oItem);
                var oFile = {};
                oFile.Zdoctype = oItem.name
                var reader = new FileReader();
                reader.onload = function (evn) {
                    oFile.Zdocvalue64 = evn.target.result;
                    //arrAttach.push(oFile);

                    //nRelease.attach.push(oFile);
                    let nRelease = nReleaseModel.getProperty("/attach").push(oFile);

                    /*let Files = that.getOwnerComponent().getModel("Documentos").getProperty("/ZtaclaraDo");
                    try{
                        Files.results.push( oFile );
                        Files.Paginated.results.push( oFile );
                    }catch(err){
                        console.error(err);
                    }*/

                    this.getOwnerComponent().setModel(new JSONModel(nRelease), "nRelease");
                    pItem.setUploadState(sap.m.UploadState.Complete);
                };
                reader.readAsDataURL(oItem);
            }

            pItem.setUploadState(sap.m.UploadState.Complete);
        },
        onDeleteAttach: function (oEvent) {
            let that = this;
            var pItem = oEvent.getParameter("item");
            var oItem = pItem.getFileObject();

            let archivos = this.getOwnerComponent().getModel("nRelease").getProperty("/attach");

            for (let i = 0; i < archivos.length; i++) {
                const element = archivos[i];
                if( oItem.name === element.Zdoctype ){
                    archivos.splice(i, 1);
                    break;
                }
            }

            let nRelease = {
                "attach": [ ...archivos ]
            };
            this.getOwnerComponent().setModel(new JSONModel(nRelease), "nRelease");
            //var oItem = oEvent.getParameter("item");
            //var itemName = oItem.getFileObject();
            //itemName;
        },
        guardaAclara : function(){

            if( this.validaCampos() === false ){
                return false;
            }

            
            let clarificationType   = this.getView().byId("clarificationType");

            let invoice             = this.getView().byId("invoice").getValue().trim();
            let sourceDocument      = this.getView().byId("sourceDocument").getValue().trim();
            let reclaimedImport     = this.getView().byId("reclaimedImport").getValue();
            let reclaimedTax        = this.getView().byId("reclaimedTax").getValue();
            let comments            = this.getView().byId("comments").getValue();
            let folio               = (parseInt( this._document, 10) == 0) ? '' : this._document;
            let status              = this.getView().byId("status").getSelectedKey();
            let tipo                = clarificationType.getSelectedKey();
            let proveedor_LIFNR     = this.getConfigModel().getProperty("/supplierInputKey") ;
            let analyst             = this.getView().byId("analyst").getSelectedKey();
            let paymentDocument     = this.getView().byId("paymentDocument").getValue();
            let distributionCenter  = this.getView().byId("distributionCenter").getValue();
            let recibo              = this.getView().byId("receipt").getValue();
            let Gjahr               = this.getView().byId("Gjahr").getValue();

            if( proveedor_LIFNR == null && this.getView().byId("supplierInput").getValue().trim() != "" )
                proveedor_LIFNR = this.getView().byId("supplierInput").getValue().trim().split(' ')[0];
            
            var files = ( this.getOwnerComponent().getModel("nRelease").getProperty("/attach") == null )? [] : this.getOwnerComponent().getModel("nRelease").getProperty("/attach") ;

            var objRelease = {
                "IOption": ( folio != '' )? '2' : "12",
                "ILifnr": proveedor_LIFNR,
                "IFactura": invoice,
                "ICendis": distributionCenter,
                "ITacla": tipo,
                "IMonrec": reclaimedImport,
                "IIvarec": reclaimedTax,
                "IObsgen": comments, 
                "INoDoc": paymentDocument,
                "IDocori" : sourceDocument,
                "IAnalista":analyst,
                "IStatus": status,
                "IRecibo" : recibo,
                "IGjahr":Gjahr,
                "ZFile": files
            };

            if( folio != '' ){
                objRelease["IFolio"] = folio;
                if( String(objRelease.INoDoc).trim() != '' ){
                    objRelease["IMonacl"] = this.getView().byId("clarifiedAmount").getValue().trim();
                    objRelease["IIvaacl"] = this.getView().byId("clarifiedTax").getValue().trim();
                    //objRelease["INoDoc"] = this.getView().byId("paymentDocument").getValue().trim();
                    let fechaVencimiento = this.getView().byId("expirationDate").getDateValue();
                    objRelease["IFecven"] = fechaVencimiento.getFullYear() + '-' + String( '0' + (fechaVencimiento.getMonth() + 1) ).substr(-2) + '-' + String( '0' + fechaVencimiento.getDate() ).substr(-2)
                    //objRelease["IFecven"] = this.getView().byId("expirationDate").getValueFormat("yyyy-MM-dd");
                }
                
            }  
            
            let modelAclaraciones = new Aclaraciones();

            var response = modelAclaraciones.create("/EAclaHdrSet", objRelease);

            

            if (response != null) {
                if (response.ESuccess == "X") {
                    let msg = (folio != '')? this.getOwnerComponent().getModel("appTxts").getProperty('/clarifications.msgUpdated') : this.getOwnerComponent().getModel("appTxts").getProperty('/clarifications.msgSaved') + ' ' + response.IFolio;
                    sap.m.MessageBox.success( msg, {
                        actions: [sap.m.MessageBox.Action.CLOSE],
                        emphasizedAction: sap.m.MessageBox.Action.CLOSE,
                        onClose: function (sAction) {
                            this.goToMainReleases();
                        }.bind(this)
                    });
                } else {
                    sap.m.MessageBox.error( response.EMessage );
                }
            } else {
                sap.m.MessageBox.error("No se pudo conectar con el servidor, intente nuevamente.");
            }


        },
        goToMainReleases : function(){
            this.handleClose();
        },
        clearFields : function(){
            this.getView().byId("clarificationType").setEnabled(true).setEditable(true);
            this.getView().byId("sourceDocument").setEnabled(true).setEditable(true);
            this.getView().byId("invoice").setEnabled(true).setEditable(true);
            this.getView().byId("comments").setEnabled(true).setEditable(true);
            this.getView().byId("analyst").setEnabled(true).setEditable(true);
            
            this.getView().byId("paymentDocument").setEnabled(true).setEditable(true);
            
            this.getView().byId("validateSourceDocument").setEnabled(true);
            this.getView().byId("validateInvoice").setEnabled( true );
            this.getView().byId("distributionCenterDescription").setEnabled(true).setVisible(true);
            this.getView().byId("receipt").setEnabled(true).setVisible(true).setEditable(true);
            //this.getView().byId("status").setEnabled(true);
            
            
            this.getView().byId("btnGuardar").setEnabled(true).setVisible(true);
            //this.getView().byId("btnUploadFiles").setEnabled(true).setVisible(true);

            this.getView().byId("helpDocsList").destroyItems();
            // sap.ui.core.Fragment.byId("uploadFilesFragment", "attachmentDocuments").removeAllItems();
            // sap.ui.core.Fragment.byId("uploadFilesFragment", "attachmentDocuments").removeAllIncompleteItems();
            // sap.ui.core.Fragment.byId("uploadFilesFragment", "attachmentDocuments").destroyItems();
            // sap.ui.core.Fragment.byId("uploadFilesFragment", "attachmentDocuments").destroyIncompleteItems();
            this.getView().byId("attachmentDocuments").setUploadEnabled( true );
            this.getView().byId("attachmentDocuments").removeAllItems();
            this.getView().byId("attachmentDocuments").removeAllIncompleteItems();
            this.getView().byId("attachmentDocuments").destroyItems();
            this.getView().byId("attachmentDocuments").destroyIncompleteItems();

            
            
            this.getOwnerComponent().setModel(new JSONModel(), "nRelease");

            if( sap.ui.getCore().getModel( "catalogos_base") == undefined )
                this.getCatalogoEstatus();
            
            let CatalogoEstatus = JSON.parse( sap.ui.getCore().getModel( "catalogos_base").getJSON() ).Estatus;

            for (let index = 0; index < CatalogoEstatus.results.length; index++) {
                const element = CatalogoEstatus.results[index];
                let item = this.getView().byId("status").getItemByKey(element.Status);
                if( item !== null ) item.setEnabled( true );
                
            }

            let objAclaracion = {
                Folio:'',
                Estatus : CatalogoEstatus.results[0].Status,
                descripcionEstatus : CatalogoEstatus.results[0].Descripcion,
                FAlta : new Date(), 
                FVenc : '',
                TipAcla : '',
                DocOrig : '',
                MonRec : '',
                Factura : '',
                IvaRec : '',
                Tienda: '',
                Obsgen: '',
                MonAcla: '',
                IvaAcla: '',
                Analista: '',
                Butxt: '',
                NoDoc: '',
                Gjahr : '',
                Recibo: ''
            };

            let Documentos = {
                    ZtaclaraDo:{
                        results:[]
                    }
                }
            

            this.getOwnerComponent().setModel(new JSONModel(objAclaracion), "Aclaracion");
            this.getOwnerComponent().setModel(new JSONModel(Documentos), "Documentos");

            this.paginate("Documentos", "/ZtaclaraDo", 1, 0);

            let Controles = this.getView().getControlsByFieldGroupId('aclaracion');

            for (let i = 0; i < Controles.length; i++) {
                const element = Controles[i];
                //if( typeof element.setValueState == 'function' ) element.setValueState( sap.ui.core.ValueState.None );
            }

            this.getView().byId('dateCreation').setDateValue(new Date());
            this.getView().byId('expirationDate').setDateValue( null );

            /*if (this._uploadDialog) {
                this._uploadDialog.destroy();
                this._uploadDialog = null;
            }*/
            

        },
        getCatalogoEstatus : function(){
                    let url = `EAclaHdrSet?$expand=ZtaclaraSt,ZtaclaraTa&$filter=IOption eq '7'&$format=json`;


                    let oODataJSONModel = this.getOdata(sUri);

                    let oDataJSONModel = this.getOdataJsonModel(url, oODataJSONModel);
                    let dataJSON = oDataJSONModel.getJSON();
                    let Datos = JSON.parse(dataJSON);

                    let Catalogos = {
                        'Estatus': {
                            results: [...Datos.results[0].ZtaclaraSt.results]
                        }
                    };

                    sap.ui.getCore().setModel(new JSONModel(JSON.parse(JSON.stringify(Catalogos))), "catalogos_base");
        },
        setData : function( objDatos ){

            let CatalogoEstatus = JSON.parse( sap.ui.getCore().getModel( "catalogos_base").getJSON() ).Estatus;
            
            for (let i = 0; i < CatalogoEstatus.results.length; i++) {
                const element = CatalogoEstatus.results[i];
                if( element.Status == objDatos.Estatus ){
                    objDatos.descripcionEstatus = element.Descripcion;
                    break;
                }
            }
            
            let fechaAlta = ( objDatos.FAlta instanceof Date )? objDatos.FAlta : new Date(objDatos.FAlta + 'T00:00:00');
            let fechaVencimiento = ( objDatos.FVenc == '' || objDatos.FVenc == '0000-00-00' )? '' : new Date(objDatos.FVenc + 'T00:00:00');

            this.getView().byId("dateCreation").setDateValue( fechaAlta );
            this.getView().byId("expirationDate").setDateValue( fechaVencimiento );
            this.getView().byId("clarificationType").setSelectedKey(objDatos.TipAcla);
            this.getView().byId("sourceDocument").setValue(objDatos.DocOrig);
            this.getView().byId("reclaimedImport").setValue(objDatos.MonRec);
            this.getView().byId("invoice").setValue(objDatos.Factura);
            this.getView().byId("reclaimedTax").setValue(objDatos.IvaRec);
            this.getView().byId("distributionCenter").setValue(objDatos.Tienda);
            this.getView().byId("comments").setValue(objDatos.Obsgen);
            this.getView().byId("status").setValue(objDatos.Estatus);
            
            this.getView().byId("clarifiedAmount").setValue(objDatos.MonAcla);
            this.getView().byId("clarifiedTax").setValue(objDatos.IvaAcla);

            

             this.getView().byId("statusDescription").setValue(objDatos.descripcionEstatus);

            
            this.getView().byId("analyst").setSelectedKey(objDatos.Analista);
            this.getView().byId("paymentDocument").setValue(objDatos.NoDoc);
        },
        validaCampos : function(){
            let valid = true;

            if( this.getView().byId("supplierInput").getValue() == undefined || this.getView().byId("supplierInput").getValue() == '' ){
                sap.m.MessageBox.warning( this.getOwnerComponent().getModel("appTxts").getProperty('/clarifications.noSupplier') );
                return false;
            }

            let Controles = this.getView().getControlsByFieldGroupId('aclaracion');

            for (let i = 0; i < Controles.length; i++) {
                const element = Controles[i];
                if( typeof element.setValueState == 'function' && element.getValueState() === sap.ui.core.ValueState.Error ) element.setValueState( sap.ui.core.ValueState.None );
            }

            if( this.getView().byId('sourceDocument').getValue().trim() == '' &&  this.getView().byId('invoice').getValue().trim() == '' ){
                valid = false;
                this.getView().byId('sourceDocument').setValueState( sap.ui.core.ValueState.Error );
                this.getView().byId('invoice').setValueState( sap.ui.core.ValueState.Error );
            }

            if( this.getView().byId('sourceDocument').getValueState() !== sap.ui.core.ValueState.Success || this.getView().byId('invoice').getValueState() !== sap.ui.core.ValueState.Success ){
                valid = false;
            }

            if( this.getView().byId('dateCreation').getDateValue() == null ){
                valid = false;
                this.getView().byId('dateCreation').setValueState( sap.ui.core.ValueState.Error );
            }

            if( this.getView().byId('status').getValue() == '' ){
                valid = false;
                this.getView().byId('status').setValueState( sap.ui.core.ValueState.Error );
            }

            //Se quita la obligatoriedad del centro de distribución por solicitud de Omar vía WhatsApp 26/10/2021 21:54
            /*if( this.getView().byId('distributionCenter').getValue().trim() == '' || this.getView().byId('distributionCenter').getValueState() !== sap.ui.core.ValueState.Success ){
                valid = false;
                this.getView().byId('distributionCenter').setValueState( sap.ui.core.ValueState.Error );
            }*/

            let clarificationType = this.getView().byId('clarificationType');
            if( clarificationType.getSelectedKey().trim() == '' || clarificationType.getValueState() == sap.ui.core.ValueState.Error ){
                valid = false;
                this.getView().byId('clarificationType').setValueState( sap.ui.core.ValueState.Error );
            }            

            
            if( this.getView().byId("reclaimedImport").getValue().trim() == '' || parseFloat(this.getView().byId("reclaimedImport").getValue()) <= 0 ){
                valid = false;
                this.getView().byId('reclaimedImport').setValueState( sap.ui.core.ValueState.Error );
            }

            if( valid === false )
                sap.m.MessageBox.warning( this.getOwnerComponent().getModel("appTxts").getProperty('/clarifications.msgInvalidFields') );


            let files = this.getOwnerComponent().getModel("nRelease").getProperty("/attach");
            
            if ( this.modo == 'new' && (files == null || files == undefined || files.length === 0) ){
                sap.m.MessageBox.warning( this.getOwnerComponent().getModel("appTxts").getProperty('/clarifications.msgNoFileAttach') );
                valid = false;
            }

            return valid;
        },
        attachmentFiles: function () {
            if (!this._uploadDialog) {
                this._uploadDialog = sap.ui.xmlfragment("uploadFilesFragment", "demo.views.Aclaraciones.fragments.UploadAttachmentFiles", this);
                //this.getView().addDependent(this._uploadDialog);
            }
            this._uploadDialog.open();
            //sap.ui.core.Fragment.byId("uploadFilesFragment", "attachmentDocuments").setUploadEnabled(true);
            this.getView().byId("attachmentDocuments").setUploadEnabled(true);
        },
        onCloseDialog: function () {
            /*if (this._uploadDialog) {
                this._uploadDialog.destroy();
                this._uploadDialog = null;
            }*/
            this._uploadDialog.close();
        },
		handleItemPress: function (oEvent) {
			var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(2),
				supplierPath = oEvent.getSource().getBindingContext("tableItemsCfdi").getPath(),
                supplier = supplierPath.split("/").slice(-1).pop();
            
		},
		handleFullScreen: function () {
			this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
			this.oRouter.navTo("detailAclaracion", {layout: sNextLayout, document: this._document, modo:this.modo, tipo: this.tipo});
		},
		handleExitFullScreen: function () {
			this.bFocusFullScreenButton = true;
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
			this.oRouter.navTo("detailAclaracion", {layout: sNextLayout, document: this._document, modo: this.modo, tipo: this.tipo});
		},
		handleClose: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
            this.oRouter.navTo("Aclaraciones", {layout: sNextLayout});
            this.clearFields();
		},
		_onDocumentMatched: function (oEvent) {
            this._document = oEvent.getParameter("arguments").document || this._document || "0";
            this.modo = oEvent.getParameter("arguments").modo || this.modo || "";
            this.tipo = oEvent.getParameter("arguments").tipo || this.tipo || "";

            if( parseInt(this._document, 10) > 0  ){

                let proveedor = (this.getConfigModel().getProperty("/supplierInputKey") != undefined) ? this.getConfigModel().getProperty("/supplierInputKey") : '';

                let filtros = `IOption eq '13' and IFolio eq '${this._document}' and ILifnr eq '${proveedor}' and ITacla eq '${this.tipo}'`;

                let url = `EAclaHdrSet?$expand=ZtaclaraFo,ZtaclaraFd,ZtaclaraDo,ZtaclaraAa&$filter=${filtros}&$format=json`;

                
                let oODataJSONModel = this.getOdata(sUri);

                let oDataJSONModel = this.getOdataJsonModel( url, oODataJSONModel );
                let dataJSON = oDataJSONModel.getJSON();
                let Datos = JSON.parse(dataJSON);

                let CatalogoEstatus = JSON.parse( sap.ui.getCore().getModel( "catalogos_base").getJSON() ).Estatus;

                
                this.getOwnerComponent().getModel("catalogos").setProperty('/Analistas', {results:[ ...Datos.results[0].ZtaclaraAa.results ]});
               
                var Aclaracion = Datos.results[0].ZtaclaraFo.results[0];

                //this.getConfigModel().setProperty("/supplierInputKey",Aclaracion.Folio );

                for (let i = 0; i < CatalogoEstatus.results.length; i++) {
                    const element = CatalogoEstatus.results[i];
                    if( element.Status == Aclaracion.Estatus ){
                        Aclaracion.descripcionEstatus = element.Descripcion;
                        break;
                    }
                }

                //Aclaracion.Analista = Datos.results[0].ZtaclaraFd.results[0].Analista;
                Aclaracion.distributionCenterDescription = Datos.results[0].ZtaclaraFd.results[0].Butxt;

                let Documentos = {
                    ZtaclaraDo:{
                        results:[ ...Datos.results[0].ZtaclaraDo.results ]
                    }
                }

                /*for (let i = 0; i < Documentos.ZtaclaraDo.results.length; i++) {
                    const element = Documentos.ZtaclaraDo.results[i];
                    
                    Documentos.ZtaclaraDo.results[i].id = parseInt(element.Folio, 10);
                }*/
                
                Aclaracion.modo = this.modo;
                
                
                this.getView().byId('dateCreation').setDateValue(new Date(Aclaracion.FAlta+"T00:00:00"));
                if( Aclaracion.FVenc != '' ) this.getView().byId('expirationDate').setDateValue(new Date(Aclaracion.FVenc+"T00:00:00"));
                this.getOwnerComponent().setModel(new JSONModel(Aclaracion), "Aclaracion");

                this.getView().byId('supplierInput').setValue(Aclaracion.Lifnr+' - '+Aclaracion.Supplier);

                this.getOwnerComponent().setModel(new JSONModel(Documentos), "Documentos");

                this.paginate("Documentos", "/ZtaclaraDo", 1, 0);

                if( this.modo == 'edit' ){
                    this.getView().byId('sourceDocument').setValueState( sap.ui.core.ValueState.Success );
                    this.getView().byId('invoice').setValueState( sap.ui.core.ValueState.Success );
                    // this.getView().byId('distributionCenter').setValueState( sap.ui.core.ValueState.Success );
                    // this.getView().byId('clarificationType').setValueState( sap.ui.core.ValueState.Success );
                }
                    
                this.bloquearCampos( this.modo, Aclaracion.Estatus );
                
            }
            else
                this.clearFields();
            
            
            
        },
        bloquearCampos: function( modo, Estatus ){
            
                let Controles = this.getView().getControlsByFieldGroupId('aclaracion');

                for (let i = 0; i < Controles.length; i++) {
                    const element = Controles[i];
                    if( typeof element.setEditable == 'function' ) 
                        element.setEditable( false ).setEnabled( false );
                    else if( typeof element.setEnabled == 'function' )
                        element.setEnabled( false );
                    else if( typeof element.setUploadEnabled == 'function' )
                        element.setUploadEnabled( false )
                }

            /*let CatalogoEstatus = JSON.parse( sap.ui.getCore().getModel( "catalogos_base").getJSON() ).Estatus;

            for (let index = 0; index < CatalogoEstatus.results.length; index++) {
                const element = CatalogoEstatus.results[index];
                this.getView().byId("status").setSelectable(this.getView().byId("status").getItemByKey(element.Status), true);
                
            }*/
                

            if( modo === "edit" ) {

                //this.getView().byId("analyst").setEnabled(true).setEditable(true);
                switch (Estatus) {
                    case "B":
                        this.getView().byId("clarificationType").setEnabled(true).setEditable(true);
                        this.getView().byId("analyst").setEnabled(true).setEditable(true);
                        break;
                    case "C":
                        let ComboStatus = this.getView().byId("status");
                        ComboStatus.setEnabled(true).setEditable(true);
                        this.getView().byId("paymentDocument").setEnabled(true).setEditable(true);
                        this.getView().byId("comments").setEnabled(true).setEditable(true);
                        this.getView().byId("validatePaymentDocument").setEnabled(true);
                        ComboStatus.getItemByKey('A').setEnabled( false );
                        ComboStatus.getItemByKey('B').setEnabled( false );
                        
                        break;
                    case "D":
                        this.getView().byId("comments").setEnabled(true).setEditable(true);
                        break;
                    case "E":
                        this.getView().byId("status").setEnabled(true).setEditable(true);
                        this.getView().byId("paymentDocument").setEnabled(true).setEditable(true);
                        this.getView().byId("comments").setEnabled(true).setEditable(true);
                        this.getView().byId("clarificationType").setEnabled(true).setEditable(true);
                        this.getView().byId("validatePaymentDocument").setEnabled(true);
                        this.getView().byId("analyst").setEnabled(true).setEditable(true);
                        ComboStatus.getItemByKey('A').setEnabled(false);
                        ComboStatus.getItemByKey('B').setEnabled(false);
                        ComboStatus.getItemByKey('C').setEnabled(false);
                        ComboStatus.getItemByKey('D').setEnabled(false);
                        
                        break;
                    case "G":
                        this.getView().byId("status").setEnabled(true).setEditable(true);
                        this.getView().byId("paymentDocument").setEnabled(true).setEditable(true);
                        this.getView().byId("comments").setEnabled(true).setEditable(true);
                        this.getView().byId("validatePaymentDocument").setEnabled(true);
                        ComboStatus.getItemByKey('A').setEnabled(false);
                        ComboStatus.getItemByKey('B').setEnabled(false);
                        ComboStatus.getItemByKey('C').setEnabled(false);
                        break;
                    case "H":
                    default:
                        sap.m.MessageBox.error( this.getOwnerComponent().getModel("appTxts").getProperty('/clarifications.noEditMsg') );
                        this.handleClose();
                        return false;
                }               
                
                
            }
            else{
                this.getView().byId("btnGuardar").setEnabled(false).setVisible(false);
                //this.getView().byId("btnUploadFiles").setEnabled(false).setVisible(false);
            }
            
           
        },
        validateSourceDocument: function(oEvent){ 
            let inputsourceDocument = this.getView().byId('sourceDocument');

            if( inputsourceDocument.getValue().trim() == '' ){
               sap.m.MessageBox.alert(this.getOwnerComponent().getModel("appTxts").getProperty('/clarifications.sourceDocumentMsg'));
               return false;
            }

           let documento = inputsourceDocument.getValue().trim();
           let proveedor_LIFNR = ( this.getConfigModel().getProperty("/supplierInputKey") != undefined )? this.getConfigModel().getProperty("/supplierInputKey") : '';

           let url = `EAclaHdrSet?$expand=ZDocOri&$filter=IOption eq '9' and IDocori eq '${documento}' and ILifnr eq '${proveedor_LIFNR}'&$format=json`;

                
            let oODataJSONModel = this.getOdata(sUri);

            let oDataJSONModel = this.getOdataJsonModel( url, oODataJSONModel );
            let dataJSON = oDataJSONModel.getJSON();
            let Datos = JSON.parse(dataJSON);

            if( Datos.results[0].EExistea == 'X' ){
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty('/clarifications.msgDuplicated'));
                inputsourceDocument.setValueState(sap.ui.core.ValueState.Error);
                return false;
            }

            if( Datos.results[0].EError !== '' ){
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty('/clarifications.sourceDocumentMsgNoMatches'));
                inputsourceDocument.setValueState(sap.ui.core.ValueState.Error);
                return false;
            }

            let montoReclamado = Datos.results[0].ZDocOri.results[0].Monrec ;
            let ivaReclamado   = Datos.results[0].ZDocOri.results[0].Ivarec ;
            let Xblnr   = Datos.results[0].ZDocOri.results[0].Xblnr ;
            let Werks = Datos.results[0].ZDocOri.results[0].Werks ;
            let Sucursal = Datos.results[0].ZDocOri.results[0].Descripcion ;
            let Gjahr = Datos.results[0].ZDocOri.results[0].Gjahr;
            let Recibo = Datos.results[0].ZDocOri.results[0].Recibo;

            inputsourceDocument.setValueState(sap.ui.core.ValueState.Success);
            this.getView().byId('reclaimedImport').setValue(montoReclamado);
            this.getView().byId('reclaimedTax').setValue(ivaReclamado);
            this.getView().byId('invoice').setValue(Xblnr).setValueState(sap.ui.core.ValueState.Success);
            this.getView().byId('distributionCenter').setValue(Werks).setValueState(sap.ui.core.ValueState.Success);
            this.getView().byId('distributionCenterDescription').setValue(Sucursal).setValueState(sap.ui.core.ValueState.Success);
            this.getView().byId('Gjahr').setValue(Gjahr);
            this.getView().byId('receipt').setValue(Recibo);

        },
        validateInvoice : function(oEvent){
            let inputInvoice = this.getView().byId('invoice');

            if( inputInvoice.getValue().trim() == '' ){
               sap.m.MessageBox.alert(this.getOwnerComponent().getModel("appTxts").getProperty('/clarifications.invoiceMsg'));
               return false;
            }

           let documento = inputInvoice.getValue().trim();
           let proveedor_LIFNR = ( this.getConfigModel().getProperty("/supplierInputKey") != undefined )? this.getConfigModel().getProperty("/supplierInputKey") : '';

           let url = `EAclaHdrSet?$expand=ZRefFac&$filter=IOption eq '6' and IFactura eq '${documento}' and ILifnr eq '${proveedor_LIFNR}'&$format=json`;

                
            let oODataJSONModel = this.getOdata(sUri);

            let oDataJSONModel = this.getOdataJsonModel( url, oODataJSONModel );
            let dataJSON = oDataJSONModel.getJSON();
            let Datos = JSON.parse(dataJSON);

            if( Datos.results[0].ZRefFac.results.length === 0 ){
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty('/clarifications.invoiceMsgNoMatches'));
                inputInvoice.setValueState(sap.ui.core.ValueState.Error);
                return false;
            }

            let montoReclamado = Datos.results[0].ZRefFac.results[0].Monrec ;
            let ivaReclamado   = Datos.results[0].ZRefFac.results[0].Ivarec ;
            let sourceDocument   = Datos.results[0].ZRefFac.results[0].Belnr ;
            let Werks = Datos.results[0].ZRefFac.results[0].Werks ;
            let Sucursal = Datos.results[0].ZRefFac.results[0].Descripcion ;
            let Gjahr = Datos.results[0].ZRefFac.results[0].Gjahr;
            let Recibo = Datos.results[0].ZRefFac.results[0].Recibo;

            inputInvoice.setValueState(sap.ui.core.ValueState.Success);
            this.getView().byId('reclaimedImport').setValue(montoReclamado);
            this.getView().byId('reclaimedTax').setValue(ivaReclamado);
            this.getView().byId('sourceDocument').setValue(sourceDocument).setValueState(sap.ui.core.ValueState.Success);
            this.getView().byId('distributionCenter').setValue(Werks).setValueState(sap.ui.core.ValueState.Success);
            this.getView().byId('distributionCenterDescription').setValue(Sucursal).setValueState(sap.ui.core.ValueState.Success);
            this.getView().byId('Gjahr').setValue(Gjahr);
            this.getView().byId('receipt').setValue(Recibo);
            
        },
        validatePaymentDocument : function(oEvent){
            let inputInvoice = this.getView().byId('paymentDocument');

            if( inputInvoice.getValue().trim() == '' ){
               sap.m.MessageBox.alert(this.getOwnerComponent().getModel("appTxts").getProperty('/clarifications.paymentDocumentMsg'));
               return false;
            }

           let documento = inputInvoice.getValue().trim();
           let proveedor_LIFNR = ( this.getConfigModel().getProperty("/supplierInputKey") != undefined )? this.getConfigModel().getProperty("/supplierInputKey") : '';

           if( proveedor_LIFNR == "" ){
               sap.m.MessageBox.warning( this.getOwnerComponent().getModel("appTxts").getProperty('/clarifications.noSupplier') );
               return false;
           }

           

           let url = `EAclaHdrSet?$expand=ZRefFac&$filter=IOption eq '11' and INoDoc eq '${documento}' and ILifnr eq '${proveedor_LIFNR}'&$format=json`;

                
            let oODataJSONModel = this.getOdata(sUri);

            let oDataJSONModel = this.getOdataJsonModel( url, oODataJSONModel );
            let dataJSON = oDataJSONModel.getJSON();
            let Datos = JSON.parse(dataJSON);

            if( Datos.results[0].ESuccess !== 'X' ){
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty('/clarifications.paymentMsgNoMatches'));
                inputInvoice.setValueState(sap.ui.core.ValueState.Error);
                return false;
            }

            let clarifiedAmount = Datos.results[0].EPago;
            let clarifiedTax    = Datos.results[0].EIva ;
            let expirationDate  = Datos.results[0].IFecven ;
    

            inputInvoice.setValueState(sap.ui.core.ValueState.Success);
            this.getView().byId('clarifiedAmount').setValue(clarifiedAmount);
            this.getView().byId('clarifiedTax').setValue(clarifiedTax);
            if( expirationDate != '' ) this.getView().byId('expirationDate').setDateValue(new Date(expirationDate + "T00:00:00"));
            
            
        },
        loadAnalyst: function(oControlEvent){

            

            let tipo = oControlEvent.getParameters().selectedItem.getKey();

            let filtros = `IOption eq '16' and ITacla eq '${tipo}'`;

            let url = `EAclaHdrSet?$expand=ZtaclaraAa&$filter=${filtros}&$format=json`;

            
            let oODataJSONModel = this.getOdata(sUri);

            let oDataJSONModel = this.getOdataJsonModel( url, oODataJSONModel );
            
            let Datos = oDataJSONModel.getProperty('/results/0');
            

            //let CatalogoEstatus = JSON.parse( sap.ui.getCore().getModel( "catalogos_base").getJSON() ).Estatus;

            
            this.getOwnerComponent().getModel("catalogos").setProperty('/Analistas', {results:[ ...Datos.ZtaclaraAa.results ]});
        },
        downloadDocument: function (Folio, DocType) {
            let modelAclaraciones = new Aclaraciones();
            var response = modelAclaraciones.getJsonModel(`/EAclaHdrSet?$expand=ZtaclaraDo&$filter=IOption eq '15' and IFolio eq '${Folio}' and IDoctype eq'${DocType}'&$format=json`);

            if (response != null) {
                var result = response.getProperty("/results/0");
                if ( result.ZtaclaraDo.results.length > 0 ) {
                    let Mime = String(result.ZtaclaraDo.results[0].Zdocvalue64).split(';')[0].split(':')[1];
                    this.downloadAttach(result.ZtaclaraDo.results[0].Zdocvalue64, Mime);
                } else {
                    sap.m.MessageBox.error( this.getOwnerComponent().getModel("appTxts").getProperty('/clarifications.msgNoFile') );
                }
            }
        },
        deleteDocument: function (Folio, DocType) {
            let modelAclaraciones = new Aclaraciones();
            var response = modelAclaraciones.getJsonModel(`/EAclaHdrSet?$expand=ZtaclaraDo&$filter=IOption eq '14' and IFolio eq '${Folio}' and IDoctype eq'${DocType}'&$format=json`);

            if (response != null) {
                var result = response.getProperty("/results/0");
                if (result.ESuccess  == "X" ) {
                    let Documentos = this.getOwnerComponent().getModel('Documentos').getProperty('/ZtaclaraDo/Paginated/results')
                    for (let i = 0; i < Documentos.length; i++) {
                        const element = Documentos[i];
                        if( element.Zdoctype === DocType ){
                            this.getView().byId("helpDocsList").removeItem( i );
                            break;
                        }
                    }
                    sap.m.MessageBox.success(this.getOwnerComponent().getModel("appTxts").getProperty('/clarifications.msgFileDeleted'));
                } else {
                    sap.m.MessageBox.error(result.EError);
                }
            }
        },
        downloadAttach: function (url, type) {
            switch (type) {
                case 'application/pdf':
                    this.pdfView(url, type);
                    break;
                default:
                    var _fileurl = this.buildBlobUrl(url, type);
                    sap.m.URLHelper.redirect(_fileurl, true);
                    break;
            }
        },
        pdfView: function (url, type) {

            var _pdfurl = this.buildBlobUrl(url, type);

            if (!this._PDFViewer) {
                this.createPDFView(_pdfurl);
            } else {
                if (this._PDFViewer.getSource() !== _pdfurl) {
                    this._PDFViewer = null;
                }
                this.createPDFView(_pdfurl);
            }

            this._PDFViewer.open();
        },
        createPDFView: function (url) {
            this._PDFViewer = new sap.m.PDFViewer({
                width: "auto",
                source: url // my blob url
            });
            jQuery.sap.addUrlWhitelist("blob"); // register blob url as whitelist
        },
        buildExcel: function(){
            var texts = this.getOwnerComponent().getModel("appTxts");
            let Encabezado = this.getOwnerComponent().getModel("tableDetailMoves");

            var columns = [
                {
                    name: texts.getProperty("/sendInv.recepNumberUPC"),
                    template: {
                        content: Encabezado.getProperty("/EDOCHDRNAV/results/0/Xblnr")
                    }
                },
                {
                    name: texts.getProperty("/sendInv.documentUPC"),
                    template: {
                        content: Encabezado.getProperty("/EDOCHDRNAV/results/0/Belnr")+" - "+Encabezado.getProperty("/EDOCHDRNAV/results/0/Gjahr")
                    }
                },             
                {
                    name: texts.getProperty("/sendInv.purchaseOrderUPC"),
                    template: {
                        content: Encabezado.getProperty("/EDOCHDRNAV/results/0/Ebeln")
                    }
                },
                {
                    name: texts.getProperty("/sendInv.amountUPC"),
                    template: {
                        content: Encabezado.getProperty("/EDOCHDRNAV/results/0/Dmbtr")
                    }
                },
                {
                    name: texts.getProperty("/sendInv.referenceUPC"),
                    template: {
                        content: Encabezado.getProperty("/EDOCHDRNAV/results/0/Bktxt")
                    }
                },
                {
                    name: texts.getProperty("/sendInv.dateUPC"),
                    template: {
                        content: Encabezado.getProperty("/EDOCHDRNAV/results/0/Budat")
                    }
                },
                {
                    name: texts.getProperty("/sendInv.taxUPC"),
                   template: {
                        content: Encabezado.getProperty("/EDOCHDRNAV/results/0/Impuesto")
                    }
                },
                {
                    name: texts.getProperty("/sendInv.vendorUPC"),
                    template: {
                        content: Encabezado.getProperty("/EDOCHDRNAV/results/0/Sociedad")
                    }
                },
                {
                    name: texts.getProperty("/sendInv.branchUPC"),
                    template: {
                        content: Encabezado.getProperty("/EDOCHDRNAV/results/0/Werks")
                    }
                },
                {
                    name: texts.getProperty("/sendInv.totalUPC"),
                    template: {
                        content: Encabezado.getProperty("/EDOCHDRNAV/results/0/Total")
                    }
                },
                {
                    name: texts.getProperty("/sendInv.positionUPC"),
                    template: {
                        content: "{Ebelp}"
                    }
                },                
                {
                    name: texts.getProperty("/sendInv.barcodeUPC"),
                    template: {
                        content: "{Ean11}"
                    }
                },
                {
                    name: texts.getProperty("/sendInv.descriptionUPC"),
                    template: {
                        content: "{Txz01}"
                    }
                },               
                {
                    name: texts.getProperty("/sendInv.qtyUPC"),
                    template: {
                        content: "{Bpmng} {Bprme}"                       
                    }
                },
                {
                    name: texts.getProperty("/sendInv.unitPriceUPC"),
                    template: {
                        content: "{Unitp}"
                    }
                },
                {
                    name: texts.getProperty("/sendInv.positionAmountUPC"),
                    template: {
                        content: "{Dmbtr}"
                    }
                },
                {
                    name: texts.getProperty("/sendInv.packCapUPC"),
                    template: {
                        content: "{Emp_cap}"
                    }
                },
                {
                    name: texts.getProperty("/sendInv.storeUPC"),
                    template: {
                        content: "{Werks}-{Centro}"
                    }
                }                                
            ];

            this.exportxls('tableDetailMoves', '/EDOCDTLNAV/results', columns);
        }
	});
});