sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "demo/controllers/BaseController",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device",
    "sap/base/Log",

], function (Controller, BaseController, MessageBox, JSONModel, Device, Log) {
    "use strict";



    var Controller = BaseController.extend("sap.m.sample.SplitApp.C", {



        onInit: function () {
            var that = this;

            this.getView().addEventDelegate({
                onBeforeShow: function (oEvent) {
                    this.setDaterangeMaxMin();

                    this.Modelo = new DashboardModel();
                
                    this.getData();
                    

                  //  this.generaTopTen();

                   // this.generaGrafica();
                }
            }, this);
        },
       
        reloadData: function () {
            this.getData();
          
        },
        getData: function (oControlEvent) {
            var that = this;
            if (oControlEvent != null && !oControlEvent.getParameters().selected)
                return false;

            let dateRange = that.getView().byId('dateRange');

            let fechaInicio = that.buildSapDate(dateRange.getDateValue());
            let fechaFin = that.buildSapDate(dateRange.getSecondDateValue());


            let proveedor = (that.getConfigModel().getProperty("/supplierInputKey") != undefined) ? that.getConfigModel().getProperty("/supplierInputKey") : '';
           

           // let option = ( oControlEvent != null )? oControlEvent.getSource().getId().split('-').pop() : '1';
           var option=(that.getView().byId('rbg1').getSelectedIndex() +1)
           option=option.toString();
            console.log(that.getView().byId('rbg1').getSelectedIndex())
            console.log(option)
            console.log(( oControlEvent != null )? oControlEvent.getSource().getId().split('-').pop() : '1')
            var expand = [];
            switch (option) {
                case '1':
                case '2':
                case '3':
                    expand.push('ETDBTACNAV','ETPIECHARTNAV','ETTOPNAV','ETHPERNAV');
                    break;
            
                default:
                    break;
            }

            var auxFilters = [];

            auxFilters.push(new sap.ui.model.Filter({
                path: "IOption",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: option
            })
            )
            auxFilters.push(new sap.ui.model.Filter({
                path: "ISfalta",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: fechaInicio
            })
            )
            auxFilters.push(new sap.ui.model.Filter({
                path: "IFfalta",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: fechaFin
            })
            )
            auxFilters.push(new sap.ui.model.Filter({
                path: "ILifnr",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: proveedor
            })
            )

            var model = "ZOSP_ACDASHBOARD_SRV";
            var entity = "HrddashbSet";
          
            var filter = auxFilters;
            var select = "";
console.log("1")
            sap.ui.core.BusyIndicator.show();
            that._GEToDataV2(model, entity, filter, expand, select).then(function (_GEToDataV2Response) {
                sap.ui.core.BusyIndicator.hide();
                var Datos = _GEToDataV2Response.data.results[0];
                console.log(Datos)
                var auxJsonModel = new sap.ui.model.json.JSONModel([]);
                that.getView().setModel(auxJsonModel, 'Totales');
                var auxJsonModel = new sap.ui.model.json.JSONModel(Datos);
                that.getView().setModel(auxJsonModel, 'Totales2');
                that.generaTopTen();
                var Items = [];
                console.log( Datos.ETDBTACNAV)
                for (var x = 0; x < Datos.ETDBTACNAV.results.length; x++) {
                    Items.push({
                        "Posicion": [x],
                        "Descripcion": Datos.ETDBTACNAV.results[x].DesAcla
                    })

                }
              
                var auxJsonModel = new sap.ui.model.json.JSONModel(Items);
                that.getView().setModel(auxJsonModel, 'TiposAcl');
                //INFORMACION GENERAL
           
                if (that.getView().byId("selectAgrupamiento").getSelectedKeys() > 0) {
                    var ArrT = oEvent.getParameter("selectedItems");


                    var Temp = [{
                        "Ant7": 0,
                        "Ant15": 0,
                        "Antx": 0,
                        "ImporComp": 0,
                        "ImporPend": 0,
                        "ImporTpagado": 0,
                        "TotalAc": 0,
                        "TotalComp": 0,
                        "TotalPend": 0,
    
    
                    }];
                    for (var x = 0; x < ArrT.length; x++) {
                    
                        Temp[0].Ant7 = Temp[0].Ant7 + Number(Model.ETDBTACNAV.results[ArrT[x].getKey()].Ant7);
                        Temp[0].Ant15 = Temp[0].Ant15 + Number(Model.ETDBTACNAV.results[ArrT[x].getKey()].Ant15);
                        Temp[0].Antx = Temp[0].Antx + Number(Model.ETDBTACNAV.results[ArrT[x].getKey()].Antx);
                        Temp[0].ImporComp = Temp[0].ImporComp + Number(Model.ETDBTACNAV.results[ArrT[x].getKey()].ImporComp);
                        Temp[0].ImporPend = Temp[0].ImporPend + Number(Model.ETDBTACNAV.results[ArrT[x].getKey()].ImporPend);
                        Temp[0].ImporTpagado = Temp[0].ImporTpagado + Number(Model.ETDBTACNAV.results[ArrT[x].getKey()].ImporTpagado);
                        Temp[0].TotalAc = Temp[0].TotalAc + Number(Model.ETDBTACNAV.results[ArrT[x].getKey()].TotalAc);
                        Temp[0].TotalComp = Temp[0].TotalComp + Number(Model.ETDBTACNAV.results[ArrT[x].getKey()].TotalComp);
                        Temp[0].TotalPend = Temp[0].TotalPend + Number(Model.ETDBTACNAV.results[ArrT[x].getKey()].TotalPend);
    
    
    
                    }
                  
                    var auxJsonModel = new sap.ui.model.json.JSONModel(Temp);
                    that.getView().setModel(auxJsonModel, 'General');
                } else {

                    var General = [];
                    General.push(Datos.Estotales);
                
                    var auxJsonModel = new sap.ui.model.json.JSONModel(General);
                    that.getView().setModel(auxJsonModel, 'General');
                }

         
            });
        },
        changeDataModel: function (oEvent) {
            var that = this;
            var Model = that.getView().getModel("Totales2").getData();
          
            if (oEvent.getParameter("selectedItems").length > 0) {
                var ArrT = oEvent.getParameter("selectedItems");


                var Temp = [{
                    "Ant7": 0,
                    "Ant15": 0,
                    "Antx": 0,
                    "ImporComp": 0,
                    "ImporPend": 0,
                    "ImporTpagado": 0,
                    "TotalAc": 0,
                    "TotalComp": 0,
                    "TotalPend": 0,


                }];
                for (var x = 0; x < ArrT.length; x++) {
                
                    Temp[0].Ant7 = Temp[0].Ant7 + Number(Model.ETDBTACNAV.results[ArrT[x].getKey()].Ant7);
                    Temp[0].Ant15 = Temp[0].Ant15 + Number(Model.ETDBTACNAV.results[ArrT[x].getKey()].Ant15);
                    Temp[0].Antx = Temp[0].Antx + Number(Model.ETDBTACNAV.results[ArrT[x].getKey()].Antx);
                    Temp[0].ImporComp = Temp[0].ImporComp + Number(Model.ETDBTACNAV.results[ArrT[x].getKey()].ImporComp);
                    Temp[0].ImporPend = Temp[0].ImporPend + Number(Model.ETDBTACNAV.results[ArrT[x].getKey()].ImporPend);
                    Temp[0].ImporTpagado = Temp[0].ImporTpagado + Number(Model.ETDBTACNAV.results[ArrT[x].getKey()].ImporTpagado);
                    Temp[0].TotalAc = Temp[0].TotalAc + Number(Model.ETDBTACNAV.results[ArrT[x].getKey()].TotalAc);
                    Temp[0].TotalComp = Temp[0].TotalComp + Number(Model.ETDBTACNAV.results[ArrT[x].getKey()].TotalComp);
                    Temp[0].TotalPend = Temp[0].TotalPend + Number(Model.ETDBTACNAV.results[ArrT[x].getKey()].TotalPend);



                }
              
                var auxJsonModel = new sap.ui.model.json.JSONModel(Temp);
                that.getView().setModel(auxJsonModel, 'General');
            } else {

                var General = [];
                General.push(Model.Estotales);
             
                var auxJsonModel = new sap.ui.model.json.JSONModel(General);
                that.getView().setModel(auxJsonModel, 'General');
            }


        },
        setDaterangeMaxMin: function () {
            var that = this;

            var Fecha = new Date();

            Fecha = (Fecha.getTime() - (1000 * 60 * 60 * 24 * 90))

            that.getView().byId("dateRange").setDateValue(new Date(Fecha));
            that.getView().byId("dateRange").setSecondDateValue(new Date());
        },

        generaGrafica: function () {
            var that = this;
            let dateRange = this.getView().byId('dateRange');

            let fechaInicio = this.buildSapDate(dateRange.getDateValue());
            let fechaFin = this.buildSapDate(dateRange.getSecondDateValue());

            let proveedor = (this.getConfigModel().getProperty("/supplierInputKey") != undefined) ? this.getConfigModel().getProperty("/supplierInputKey") : '';

            // let url = `HrddashbSet?$expand=ETDBTACNAV,ETPIECHARTNAV,ETTOPNAV,ETHPERNAV&$filter=IOption eq '4' and  ISfalta eq '${fechaInicio}' and  IFfalta eq '${fechaFin}' and ILifnr eq '${proveedor}'&$format=json`;
            // let Datos= this.Modelo.getJsonModel( url ).getProperty('/results/0');
            var auxFilters = [];

            auxFilters.push(new sap.ui.model.Filter({
                path: "IOption",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: '4'
            })
            )
            auxFilters.push(new sap.ui.model.Filter({
                path: "ISfalta",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: fechaInicio
            })
            )
            auxFilters.push(new sap.ui.model.Filter({
                path: "IFfalta",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: fechaFin
            })
            )
            auxFilters.push(new sap.ui.model.Filter({
                path: "ILifnr",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: proveedor
            })
            )

            var model = "ZOSP_ACDASHBOARD_SRV";
            var entity = "HrddashbSet";
            var expand = ['ETDBTACNAV', 'ETPIECHARTNAV', 'ETTOPNAV', 'ETHPERNAV'];
            var filter = auxFilters;
            var select = "";

            sap.ui.core.BusyIndicator.show();
            that._GEToDataV2(model, entity, filter, expand, select).then(function (_GEToDataV2Response) {
                var Datos = _GEToDataV2Response.data.results[0];
                sap.ui.core.BusyIndicator.hide();
                let PieChart = [];
                let Totales = {
                    CantidadRecibidas: 0,
                    TiempoRecibidas: 0,
                    ImporteRecibidas: 0,
                    CantidadCompletadas: 0,
                    TiempoCompletadas: 0,
                    ImporteCompletadas: 0,
                    CantidadPendientes: 0,
                    TiempoPendientes: 0,
                    ImportePendientes: 0
                };

                for (let i = 0; i < Datos.ETPIECHARTNAV.results.length; i++) {
                    const element = Datos.ETPIECHARTNAV.results[i];
                    Totales.CantidadRecibidas += parseFloat(element.TotalAc)
                    Totales.TiempoRecibidas += parseFloat(element.Antire)
                    Totales.ImporteRecibidas += parseFloat(element.ImporRe)
                    Totales.CantidadCompletadas += parseFloat(element.TotalComp)
                    Totales.TiempoCompletadas += parseFloat(element.AntiComp)
                    Totales.ImporteCompletadas += parseFloat(element.ImporComp)
                    Totales.CantidadPendientes += parseFloat(element.TotalPend)
                    Totales.TiempoPendientes += parseFloat(element.AntiPen)
                    Totales.ImportePendientes += parseFloat(element.ImporPend)

                }

                for (let x = 0; x < Datos.ETPIECHARTNAV.results.length; x++) {
                    const element = Datos.ETPIECHARTNAV.results[x];
                    let porcentaje = (element.TotalAc / Totales.CantidadRecibidas) * 100;
                    PieChart.push({
                        DesAcla: element.DesAcla,
                        valor: parseFloat(porcentaje.toFixed(2))
                    })
                }
             
                that.getView().getModel('Totales').setProperty('/PieChart', PieChart);
                that.getView().getModel('Totales').setProperty('/Segmentos', PieChart.length);
                that.getView().getModel('Totales').setProperty('/ETPIECHARTNAV', Datos.ETPIECHARTNAV);
                that.getView().getModel('Totales').setProperty('/TotalesChart', Totales);



            });
        },

        changePieChart: function (oControlEvent) {
            var that = this;

            if (oControlEvent.sId == 'select' && !oControlEvent.getParameters().selected)
                return;

            oControlEvent.getParameters();
           
            let Datos = that.getView().getModel('Totales').getProperty('/ETPIECHARTNAV/results');
            let Totales = that.getView().getModel('Totales').getProperty('/TotalesChart');
            let PieChart = [];



            let indiceRadio = oControlEvent.sId == 'select' ? oControlEvent.getSource().getId().split('-').pop() : that.getView().byId('pieChart').getSelectedIndex();
            let opcionSelect = that.getView().byId('selectTipoPieChart').getSelectedKey();

            let atributo = '';
            let campoTotales = '';

            switch (parseInt(indiceRadio, 10)) {
                case 0:
                    atributo = (opcionSelect == 'r') ? 'TotalAc' : ((opcionSelect == 'c') ? 'TotalComp' : 'TotalPend');
                    campoTotales = (opcionSelect == 'r') ? 'CantidadRecibidas' : ((opcionSelect == 'c') ? 'CantidadCompletadas' : 'CantidadPendientes');
                    break;
                case 1:
                    atributo = (opcionSelect == 'r') ? 'Antire' : ((opcionSelect == 'c') ? 'AntiComp' : 'AntiPen');
                    campoTotales = (opcionSelect == 'r') ? 'TiempoRecibidas' : ((opcionSelect == 'c') ? 'TiempoCompletadas' : 'TiempoPendientes');
                    break;
                case 2:
                    atributo = (opcionSelect == 'r') ? 'ImporRe' : ((opcionSelect == 'c') ? 'ImporComp' : 'ImporPend');
                    campoTotales = (opcionSelect == 'r') ? 'ImporteRecibidas' : ((opcionSelect == 'c') ? 'ImporteCompletadas' : 'ImportePendientes');
                    break;

                default:
                    break;
            }

            for (let x = 0; x < Datos.length; x++) {
                const element = Datos[x];
                let porcentaje = (element[atributo] / Totales[campoTotales]) * 100;
                PieChart.push({
                    DesAcla: element.DesAcla,
                    valor: parseFloat(porcentaje.toFixed(2))
                })
            }

            that.getView().getModel('Totales').setProperty('/PieChart', PieChart);
            that.getView().getModel('Totales').setProperty('/Segmentos', PieChart.length);
        },
        setDaterangeMaxMin: function () {
            var that = this;
            /*   var datarange = this.getView().byId('dateRange');
               var date = new Date();
               var minDate = new Date();
               minDate.setDate(1);
   
               datarange.setSecondDateValue(date);
               datarange.setDateValue(minDate);*/
            var Fecha = new Date();

            Fecha = (Fecha.getTime() - (1000 * 60 * 60 * 24 * 90))

            that.getView().byId("dateRange").setDateValue(new Date(Fecha));
            that.getView().byId("dateRange").setSecondDateValue(new Date());
        },
        VisualizadorGraficosP: function () {
            var that = this;
            that.getView().byId("graphPie").setVisible(true)
            that.getView().byId("chartFixFlex").setVisible(false)

        },
        VisualizadorGraficosL: function () {
            var that = this;
            that.getView().byId("graphPie").setVisible(false)
            that.getView().byId("chartFixFlex").setVisible(true)

        },

        generaTopTen: function () {
            var that = this;
            let dateRange = that.getView().byId('dateRange');

            let fechaInicio = that.buildSapDate(dateRange.getDateValue());
            let fechaFin = that.buildSapDate(dateRange.getSecondDateValue());

            var auxFilters=[];
            //let url = `HrddashbSet?$expand=ETDBTACNAV,ETPIECHARTNAV,ETTOPNAV,ETHPERNAV&$filter=IOption eq '5' and  ISfalta eq '${fechaInicio}' and  IFfalta eq '${fechaFin}'&$format=json`;
            auxFilters.push(new sap.ui.model.Filter({
                path: "IOption",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: '5'
            })
            )
            auxFilters.push(new sap.ui.model.Filter({
                path: "ISfalta",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: fechaInicio
            })
            )
            auxFilters.push(new sap.ui.model.Filter({
                path: "IFfalta",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: fechaFin
            })
            )
        

            var model = "ZOSP_ACDASHBOARD_SRV";
            var entity = "HrddashbSet";
            var expand = ['ETDBTACNAV', 'ETPIECHARTNAV', 'ETTOPNAV', 'ETHPERNAV'];
            var filter = auxFilters;
            var select = "";

            sap.ui.core.BusyIndicator.show();
            that._GEToDataV2(model, entity, filter, expand, select).then(function (_GEToDataV2Response) {
                var Datos = _GEToDataV2Response.data.results[0];
              
                that.generaGrafica();

                var Tipos = [];
                var TiposAclaracionTopTen = [];

      
          var x = 0;

            for (var i = 0; i < Datos.ETTOPNAV.results.length; i++) {
                const element = Datos.ETTOPNAV.results[i];
                if (!Tipos.includes(element.DesAcla)) {
                    Tipos.push(element.DesAcla);
                    TiposAclaracionTopTen.push({
                        posicion: x,
                        descripcion: element.DesAcla,
                        Supplier: [element]
                    });
                    x++;
                } else {

                    let posicion = Tipos.indexOf(element.DesAcla);
                    if (TiposAclaracionTopTen[posicion].Supplier.length < 10)
                        TiposAclaracionTopTen[posicion].Supplier.push(element);
                }

            }



            let TopTen = (Datos.ETTOPNAV.results.length > 0) ? TiposAclaracionTopTen[0].Supplier : [];

         

            //this.Modelo.getJsonModel( url ).setProperty('/Proveedores', TopTen);
            that.getView().getModel('Totales').setProperty('/TopTen', TopTen);
            that.getView().getModel('Totales').setProperty('/Tipos', TiposAclaracionTopTen);
        });

        },
        changeTipoTopTen: function (oControlEvent) {
            var that = this;
            let posicion = oControlEvent.getParameters().selectedItem.getKey();

            if (posicion == '')
                return;

            let Model = that.getOwnerComponent().getModel("Totales");

            let ValoresActivos = Model.getProperty('/Tipos')[posicion];

            let TopTen = (ValoresActivos != null) ? ValoresActivos.Supplier : [];

            //let Model = this.getOwnerComponent().getModel("Totales");
            that.getOwnerComponent().getModel('Totales').setProperty('/TopTen', TopTen);
        },

//*****************************Export */
exportTopTen: function(){
    var that=this;
    var texts =  that.getView().getModel("appTxts");

    let tipos =  that.getView().getModel('Totales').getProperty('/Tipos');

    let Proveedores = [];

    for (let i = 0; i < tipos.length; i++) {
        const element = tipos[i];
        Proveedores.push( ...element.Supplier );
    }

    //console.log(Proveedores);

    that.getView().getModel('Totales').setProperty('/Proveedores', Proveedores);

    var columns = [
        {
            name: texts.getProperty("/dashboard.topUPC"),
            template: {
                content: "{Ntop}"
            }
        },
        {
            name: texts.getProperty("/dashboard.supplierUPC"),
            template: {
                content: "{Nlifnr}"
            }
        },
        {
            name: texts.getProperty("/dashboard.supplierNumUPC"),
            template: {
                content: "{Lifnr}"
            }
        },
        {
            name: texts.getProperty("/dashboard.totalCompUPC"),
            template: {
                content: "{TotalComp}"
            }
        },
        {
            name: texts.getProperty("/dashboard.importCompUPC"),
            template: {
                content: "{ImporComp}"
            }
        },
        {
            name: texts.getProperty("/dashboard.tipoUPC"),
            template: {
                content: "{DesAcla}"
            }
        }
    ];

    that.exportxls('Totales', '/Proveedores', columns);
},
exportPieChart: function(){
    var that=this;

    var texts =  that.getView().getModel("appTxts");

    var columns = [
        {
            name: texts.getProperty("/dashboard.tipoUPC"),
            template: {
                content: "{DesAcla}"
            }
        },
        {
            name: texts.getProperty("/dashboard.totalRecUPC"),
            template: {
                content: "{TotalAc}"
            }
        },
        {
            name: texts.getProperty("/dashboard.antiguedadRecUPC"),
            template: {
                content: "{Antire}"
            }
        },
        {
            name: texts.getProperty("/dashboard.importRecUPC"),
            template: {
                content: "{ImporRe}"
            }
        },
        {
            name: texts.getProperty("/dashboard.totalCompUPC"),
            template: {
                content: "{TotalComp}"
            }
        },
        {
            name: texts.getProperty("/dashboard.antiguedadCompUPC"),
            template: {
                content: "{AntiComp}"
            }
        },
        {
            name: texts.getProperty("/dashboard.importCompUPC"),
            template: {
                content: "{ImporComp}"
            }
        },
        {
            name: texts.getProperty("/dashboard.totalPendUPC"),
            template: {
                content: "{TotalPend}"
            }
        },
        {
            name: texts.getProperty("/dashboard.antiguedadPendUPC"),
            template: {
                content: "{AntiPen}"
            }
        },
        {
            name: texts.getProperty("/dashboard.importPendUPC"),
            template: {
                content: "{ImporPend}"
            }
        }
        
    ];

    that.exportxls('Totales', '/ETPIECHARTNAV/results', columns);
},
exportExcel: function(){
    var that=this;
    var texts =  that.getView().getModel("appTxts");
    
    let indice = this.getView().byId('rbg1').getSelectedIndex();
    let titulo = ( indice === 0  )? texts.getProperty("/dashboard.typesUPC") : ( ( indice === 1 )? texts.getProperty("/dashboard.areaUPC") : texts.getProperty("/dashboard.analystUPC") );

    var columns = [
        {
            name: titulo,
            template: {
                content: "{DesAcla}"
            }
        },
        {
            name: texts.getProperty("/dashboard.totalRecUPC"),
            template: {
                content: "{TotalAc}"
            }
        },
        {
            name: texts.getProperty("/dashboard.importRecUPC"),
            template: {
                content: "{ImporTpagado}"
            }
        },
        {
            name: texts.getProperty("/dashboard.totalCompUPC"),
            template: {
                content: "{TotalComp}"
            }
        },
        {
            name: texts.getProperty("/dashboard.importCompUPC"),
            template: {
                content: "{ImporComp}"
            }
        },
        {
            name: texts.getProperty("/dashboard.totalPendUPC"),
            template: {
                content: "{TotalPend}"
            }
        },
        {
            name: texts.getProperty("/dashboard.importPendUPC"),
            template: {
                content: "{ImporPend}"
            }
        },
        {
            name: texts.getProperty("/dashboard.7UPC"),
            template: {
                content: "{Ant7}"
            }
        },
        {
            name: texts.getProperty("/dashboard.15UPC"),
            template: {
                content: "{Ant15}"
            }
        },
        {
            name: texts.getProperty("/dashboard.mayorUPC"),
            template: {
                content: "{Antx}"
            }
        }                
    ];

    that.exportxls('Totales', '/ETDBTACNAV/results', columns);
},

    });

    return Controller;

});