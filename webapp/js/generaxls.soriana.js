function twoDigitPad(num) {
    return num < 10 ? "0" + num : num;
}

function createCell(sheetobj,posicion,tipo,valor){
if (sheetobj[posicion]==undefined){
    XLSX.utils.sheet_add_aoa(sheetobj, [[{t:tipo,v:valor}]], {origin: posicion});
}else{
    sheetobj[posicion] = { t: tipo, v: valor };
}
return sheetobj;
}

function generarxls(_datos){
    const archivo_plantilla="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"

let workbook = XLSX.read(archivo_plantilla, {type: 'base64',cellStyles: true,cellHTML: true,cellNF:true,cellText:true});

let SheetName = workbook.SheetNames[0] //get first sheet in file
let newWorkBook = workbook // create new workbook

//estilos

newWorkBook.Sheets[SheetName]['A5'].s = { font: { bold:true, name: "Calibri", sz: 16 }};
newWorkBook.Sheets[SheetName]['J5'].s = { font: { bold:true, name: "Calibri", sz: 16 }};
newWorkBook.Sheets[SheetName]['O5'].s = { font: { bold:true, name: "Calibri", sz: 16 }};
newWorkBook.Sheets[SheetName]['T5'].s = { font: { bold:true, name: "Calibri", sz: 16 }};


newWorkBook.Sheets[SheetName]['A1'].s = { fill: { fgColor: { rgb: "ffff00" }}};
newWorkBook.Sheets[SheetName]['B1'].s = { fill: { fgColor: { rgb: "ffff00" }}};
newWorkBook.Sheets[SheetName]['C1'].s = { fill: { fgColor: { rgb: "ffff00" }}};
newWorkBook.Sheets[SheetName]['D1'].s = { fill: { fgColor: { rgb: "ffff00" }}};
newWorkBook.Sheets[SheetName]['E1'].s = { fill: { fgColor: { rgb: "ffff00" }}};
newWorkBook.Sheets[SheetName]['F1'].s = { fill: { fgColor: { rgb: "ffff00" }}};
newWorkBook.Sheets[SheetName]['G1'].s = { fill: { fgColor: { rgb: "ffff00" }}};
newWorkBook.Sheets[SheetName]['H1'].s = { fill: { fgColor: { rgb: "ffff00" }}};
newWorkBook.Sheets[SheetName]['I1'].s = { fill: { fgColor: { rgb: "ffff00" }}};
newWorkBook.Sheets[SheetName]['J1'].s = { fill: { fgColor: { rgb: "ffff00" }}};
newWorkBook.Sheets[SheetName]['K1'].s = { fill: { fgColor: { rgb: "ffff00" }}};
newWorkBook.Sheets[SheetName]['L1'].s = { fill: { fgColor: { rgb: "ffff00" }}};
newWorkBook.Sheets[SheetName]['M1'].s = { fill: { fgColor: { rgb: "ffff00" }}};

newWorkBook.Sheets[SheetName]['A3'].s = { fill: { fgColor: { rgb: "ffff00" }}};
newWorkBook.Sheets[SheetName]['B3'].s = { fill: { fgColor: { rgb: "ffff00" }}};
newWorkBook.Sheets[SheetName]['C3'].s = { fill: { fgColor: { rgb: "ffff00" }}};
newWorkBook.Sheets[SheetName]['D3'].s = { fill: { fgColor: { rgb: "ffff00" }}};
newWorkBook.Sheets[SheetName]['E3'].s = { fill: { fgColor: { rgb: "ffff00" }}};
newWorkBook.Sheets[SheetName]['F3'].s = { fill: { fgColor: { rgb: "ffff00" }}};
newWorkBook.Sheets[SheetName]['G3'].s = { fill: { fgColor: { rgb: "ffff00" }}};
newWorkBook.Sheets[SheetName]['H3'].s = { fill: { fgColor: { rgb: "ffff00" }}};
newWorkBook.Sheets[SheetName]['I3'].s = { fill: { fgColor: { rgb: "ffff00" }}};
newWorkBook.Sheets[SheetName]['J3'].s = { fill: { fgColor: { rgb: "ffff00" }}};
newWorkBook.Sheets[SheetName]['K3'].s = { fill: { fgColor: { rgb: "ffff00" }}};
newWorkBook.Sheets[SheetName]['L3'].s = { fill: { fgColor: { rgb: "ffff00" }}};
newWorkBook.Sheets[SheetName]['M3'].s = { fill: { fgColor: { rgb: "ffff00" }}};

newWorkBook.Sheets[SheetName]['A6'].s = { fill: { fgColor: { rgb: "ffff00" }}};
newWorkBook.Sheets[SheetName]['B6'].s = { fill: { fgColor: { rgb: "ffff00" }}};
newWorkBook.Sheets[SheetName]['C6'].s = { fill: { fgColor: { rgb: "ffff00" }}};
newWorkBook.Sheets[SheetName]['D6'].s = { fill: { fgColor: { rgb: "ffff00" }}};
newWorkBook.Sheets[SheetName]['E6'].s = { fill: { fgColor: { rgb: "ffff00" }}};
newWorkBook.Sheets[SheetName]['F6'].s = { fill: { fgColor: { rgb: "ffff00" }}};
newWorkBook.Sheets[SheetName]['G6'].s = { fill: { fgColor: { rgb: "ffff00" }}};
newWorkBook.Sheets[SheetName]['H6'].s = { fill: { fgColor: { rgb: "ffff00" }}};
newWorkBook.Sheets[SheetName]['I6'].s = { fill: { fgColor: { rgb: "ffff00" }}};
newWorkBook.Sheets[SheetName]['J6'].s = { fill: { fgColor: { rgb: "ffff00" }}};
newWorkBook.Sheets[SheetName]['K6'].s = { fill: { fgColor: { rgb: "ffff00" }}};
newWorkBook.Sheets[SheetName]['L6'].s = { fill: { fgColor: { rgb: "ffff00" }}};
newWorkBook.Sheets[SheetName]['M6'].s = { fill: { fgColor: { rgb: "ffff00" }}};
newWorkBook.Sheets[SheetName]['N6'].s = { fill: { fgColor: { rgb: "ffff00" }}};
newWorkBook.Sheets[SheetName]['O6'].s = { fill: { fgColor: { rgb: "ffff00" }}};
newWorkBook.Sheets[SheetName]['P6'].s = { fill: { fgColor: { rgb: "ffff00" }}};
newWorkBook.Sheets[SheetName]['Q6'].s = { fill: { fgColor: { rgb: "ffff00" }}};
newWorkBook.Sheets[SheetName]['R6'].s = { fill: { fgColor: { rgb: "ffff00" }}};
newWorkBook.Sheets[SheetName]['S6'].s = { fill: { fgColor: { rgb: "ffff00" }}};
newWorkBook.Sheets[SheetName]['T6'].s = { fill: { fgColor: { rgb: "ffff00" }}};
newWorkBook.Sheets[SheetName]['U6'].s = { fill: { fgColor: { rgb: "ffff00" }}};
newWorkBook.Sheets[SheetName]['V6'].s = { fill: { fgColor: { rgb: "ffff00" }}};
newWorkBook.Sheets[SheetName]['W6'].s = { fill: { fgColor: { rgb: "ffff00" }}};
newWorkBook.Sheets[SheetName]['X6'].s = { fill: { fgColor: { rgb: "ffff00" }}};
//fin estilos
console.log(_datos)
var nodo_datos=_datos;
//Cabecera
console.log(newWorkBook.Sheets[SheetName]);
newWorkBook.Sheets[SheetName].A2 = { t: 's', v: nodo_datos.results[0].ETXTHDRNAV.results[0].Columna2 };//RS Receptor
newWorkBook.Sheets[SheetName].B2 = { t: 'n', v: 601 }; // Regimen fiscal receptor
newWorkBook.Sheets[SheetName].C2 = { t: 's', v: "TSO991022PB6" };//RFC Receptor, revisar si hay que leerlo de los datos de sap
newWorkBook.Sheets[SheetName].D2 = { t: 's', v: '64610' };//CP receptor
newWorkBook.Sheets[SheetName].E2 = { t: 's', v: nodo_datos.results[0].ETXTHDRNAV.results[0].Columna5 };//prov-razonsocial
let fechaPago = nodo_datos.results[0].IAugdt;
let dia=fechaPago.split('-')[2];
let mes = fechaPago.split('-')[1];
let anio = fechaPago.split('-')[0];
var nombresMes = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio",
  "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];
newWorkBook.Sheets[SheetName].A4 = { t: 's', v: nodo_datos.results[0].IBukrs }; // Sociedad pago
newWorkBook.Sheets[SheetName].B4 = { t: 'n', v: nodo_datos.results[0].IVblnr }; // ID documento pago
newWorkBook.Sheets[SheetName].C4 = { t: 'n', v: nodo_datos.results[0].IGjahr }; // Ejercicio pago
newWorkBook.Sheets[SheetName].D4 = { t: 's', v: nombresMes[parseInt(mes)-1] }; // fecha mes
newWorkBook.Sheets[SheetName].E4 = { t: 's', v: dia+"/"+mes+"/"+anio }; // fecha
var formato_cantidades="$#,##0.00_);-$#,##0.00_)";
var estiloContabilidad="0.00##";
//Totales ******* FALTA MAPEARLOS PORQUE NO CORRESPONDEN LOS DATOS CON LOS DE SAP ******
newWorkBook.Sheets[SheetName].F2 = { t: 'n', v: nodo_datos.results[0].ETXTTOTALNAV.results[0].Columna6,z:formato_cantidades }; //Imp_Fact
newWorkBook.Sheets[SheetName].G2 = { t: 'n', v: nodo_datos.results[0].ETXTTOTALNAV.results[0].Columna7,z:formato_cantidades }; //Imp_Cargo
newWorkBook.Sheets[SheetName].H2 = { t: 'n', v: nodo_datos.results[0].ETXTTOTALNAV.results[0].Columna8,z:formato_cantidades }; //Imp_CargoProv
newWorkBook.Sheets[SheetName].I2 = { t: 'n', v: nodo_datos.results[0].ETXTTOTALNAV.results[0].Columna9,z:formato_cantidades }; //Imp_Interes
newWorkBook.Sheets[SheetName].J2 = { t: 'n', v: nodo_datos.results[0].ETXTTOTALNAV.results[0].Columna10,z:formato_cantidades }; //Imp_Aforo
newWorkBook.Sheets[SheetName].K2 = { t: 'n', v: nodo_datos.results[0].ETXTTOTALNAV.results[0].Columna11,z:formato_cantidades }; //Imp_Total
newWorkBook.Sheets[SheetName].L2 = { t: 'n', v: nodo_datos.results[0].ETXTTOTALNAV.results[0].Columna12,z:formato_cantidades }; //Retencion
newWorkBook.Sheets[SheetName].M2 = { t: 'n', v: nodo_datos.results[0].ETXTTOTALNAV.results[0].Columna13,z:formato_cantidades }; //Imp_Cargo_17R


//partidas
var indice_renglon=7;
var suma_base16=0;
var suma_impuesto16=0;
var suma_base8=0;
var suma_impuesto8=0;
var suma_base0=0;
var suma_impuesto0=0;
var suma_base_retencion=0;
var suma_importe_retencion=0;
var suma_base_ieps=0;
var suma_importe_ieps=0;
var suma_base_exento=0;
var suma_total_factura=0;
var suma_total_cargos=0;
var indice_subrenglon = indice_renglon;
var continuasuma=true;
//Renglones F
indice_subrenglon=indice_renglon;
for (var row of nodo_datos.results[0].ETXTFACTPROVNEWNAV.results){
    var suma_factura_base=0;
    var suma_factura_impuesto=0;
    var tasaOcuota_sumados="";
    var claseImp_sumados="";
    var num_doc=row.Columna3;
    var prefijo_doc=row.C07Documento.length>0?row.C07Documento.substring(0, 2):"";

    createCell(newWorkBook.Sheets[SheetName],"A"+indice_renglon,"s","Factura");//descripcion
    createCell(newWorkBook.Sheets[SheetName],"B"+indice_renglon,"s",row.Columna2);//uuid
    createCell(newWorkBook.Sheets[SheetName],"C"+indice_renglon,"s",row.C07Documento);//doc de sap
    createCell(newWorkBook.Sheets[SheetName],"D"+indice_renglon,"s",row.Columna3);//tienda  
    createCell(newWorkBook.Sheets[SheetName],"E"+indice_renglon,"s",row.Columna4);//folio o nota de entrada  . Ver donde mapearon este dato
    createCell(newWorkBook.Sheets[SheetName],"F"+indice_renglon,"s",row.Columna5);//serie y folio . Ver donde mapearon este dato
    createCell(newWorkBook.Sheets[SheetName],"G"+indice_renglon,"n",row.Columna6);//importe de factura
    newWorkBook.Sheets[SheetName]["G"+indice_renglon].z = formato_cantidades;

    //IVA
    createCell(newWorkBook.Sheets[SheetName],"J"+indice_renglon,"n",row.C11Importedr01);
    newWorkBook.Sheets[SheetName]["J"+indice_renglon].z=formato_cantidades;
    createCell(newWorkBook.Sheets[SheetName],"K"+indice_renglon,"n",row.C13TasaocuotaDr01);
    createCell(newWorkBook.Sheets[SheetName],"L"+indice_renglon,"s",row.C14TipofactorDr01);
    createCell(newWorkBook.Sheets[SheetName],"M"+indice_renglon,"s",row.C15ImpuestoDr01);
    createCell(newWorkBook.Sheets[SheetName],"N"+indice_renglon,"n",row.C16BaseDr01);//base
    newWorkBook.Sheets[SheetName]["N"+indice_renglon].z=formato_cantidades;
    switch (parseFloat(row.C13TasaocuotaDr01)){
        case 0.16: 
        suma_base16+=parseFloat(row.C16BaseDr01);
        suma_impuesto16+=parseFloat(row.C11Importedr01);
        break;
        case 0.08:
            suma_base8+=parseFloat(row.C16BaseDr01);
            suma_impuesto8+=parseFloat(row.C11Importedr01);
        break;
        case 0:
            if (tipofactor=="TASA"){
                suma_base0+=parseFloat(row.C16BaseDr01);
                suma_impuesto0+=parseFloat(row.C11Importedr01);
            }else if (tipofactor=="EXENTO"){
                suma_base_exento+=parseFloat(row.C16BaseDr01);
            }
        break;
    }
    //IEPS
    createCell(newWorkBook.Sheets[SheetName],"O"+indice_renglon,"n",row.C17ImporteDr02);
    newWorkBook.Sheets[SheetName]["O"+indice_renglon].z=formato_cantidades;
    createCell(newWorkBook.Sheets[SheetName],"P"+indice_renglon,"n",row.C19TasaocuotaDr02);
    createCell(newWorkBook.Sheets[SheetName],"Q"+indice_renglon,"s",row.C20TipofactordrDr02);
    createCell(newWorkBook.Sheets[SheetName],"R"+indice_renglon,"s",row.C21ImpuestoDr02);
    createCell(newWorkBook.Sheets[SheetName],"S"+indice_renglon,"n",row.C22BasedrDr02);//base
    newWorkBook.Sheets[SheetName]["S"+indice_renglon].z=formato_cantidades;

    //Retencion
    createCell(newWorkBook.Sheets[SheetName],"T"+indice_renglon,"n",row.C23ImporteDr03);
    newWorkBook.Sheets[SheetName]["T"+indice_renglon].z=formato_cantidades;
    createCell(newWorkBook.Sheets[SheetName],"U"+indice_renglon,"n",row.C25TasaocuotaDr03);
    createCell(newWorkBook.Sheets[SheetName],"V"+indice_renglon,"s",row.C26TipofactordrDr03);
    createCell(newWorkBook.Sheets[SheetName],"W"+indice_renglon,"s",row.C27ImpuestodrDr03);
    createCell(newWorkBook.Sheets[SheetName],"X"+indice_renglon,"n",row.C28BasedrDr03);//base
    newWorkBook.Sheets[SheetName]["X"+indice_renglon].z=formato_cantidades;

if (prefijo_doc=="60"){
suma_total_factura-=parseFloat(row.Columna6);
}

if (continuasuma){// solo continua sumando si no ha encontrado documento 60
//suma total facturas
suma_total_factura+=parseFloat(row.Columna6);
}
    if (indice_subrenglon>indice_renglon){
        indice_renglon=indice_subrenglon;
    }else{
        indice_renglon++;
    }   
}

//renglones S
indice_subrenglon=indice_renglon;
for (var row of nodo_datos.results[0].ETXTFACTSORNEWNAV.results){
    var suma_factura_base=0;
    var suma_factura_impuesto=0;
    var tasaOcuota_sumados="";
    var claseImp_sumados="";
    var num_doc=row.Columna3;
    createCell(newWorkBook.Sheets[SheetName],"A"+indice_renglon,"s","Cargo Facturado por Soriana");//descripcion
    createCell(newWorkBook.Sheets[SheetName],"B"+indice_renglon,"s",row.Columna2);//uuid
    createCell(newWorkBook.Sheets[SheetName],"C"+indice_renglon,"s",row.Columna4);//doc de sap
    createCell(newWorkBook.Sheets[SheetName],"D"+indice_renglon,"s",row.Columna3);//tienda  
    //createCell(newWorkBook.Sheets[SheetName],"E"+indice_renglon,"s",row.Columna5);//folio o nota de entrada  . Ver donde mapearon este dato
    //createCell(newWorkBook.Sheets[SheetName],"F"+indice_renglon,"s",row.Columna4);//serie y folio . Ver donde mapearon este dato
    createCell(newWorkBook.Sheets[SheetName],"G"+indice_renglon,"n",-Math.abs(row.Columna5));//importe de factura
    newWorkBook.Sheets[SheetName]["G"+indice_renglon].z = formato_cantidades;
    //createCell(newWorkBook.Sheets[SheetName],"G"+indice_renglon,"n",row.Columna5);//importe de cargo

//PRORRATEO
createCell(newWorkBook.Sheets[SheetName],"H"+indice_renglon,"s",row.C08Uuid);//UUID factura para aplicar cargo
createCell(newWorkBook.Sheets[SheetName],"I"+indice_renglon,"n",row.C09CargoFactura);//Cargo que se aplica sobre la factura
newWorkBook.Sheets[SheetName]["I"+indice_renglon].z = formato_cantidades;

    //IVA
    createCell(newWorkBook.Sheets[SheetName],"J"+indice_renglon,"n",-Math.abs(row.C11Importedr01.replace("-","")));//importedr
    newWorkBook.Sheets[SheetName]["J"+indice_renglon].z=formato_cantidades;
    createCell(newWorkBook.Sheets[SheetName],"K"+indice_renglon,"n",row.C13TasaocuotaDr01);
    createCell(newWorkBook.Sheets[SheetName],"L"+indice_renglon,"s",row.C14TipofactorDr01);
    createCell(newWorkBook.Sheets[SheetName],"M"+indice_renglon,"s",row.C15ImpuestoDr01);
    createCell(newWorkBook.Sheets[SheetName],"N"+indice_renglon,"n",-Math.abs(row.C16BaseDr01.replace("-","")));//base
    newWorkBook.Sheets[SheetName]["N"+indice_renglon].z=formato_cantidades;
    switch (parseFloat(row.C13TasaocuotaDr01)){
        case 0.16: 
        suma_base16+=parseFloat(row.C16BaseDr01);
        suma_impuesto16+=parseFloat(row.C11Importedr01);
        break;
        case 0.08:
            suma_base8+=parseFloat(row.C16BaseDr01);
            suma_impuesto8+=parseFloat(row.C11Importedr01);
        break;
        case 0:
            if (tipofactor=="TASA"){
                suma_base0+=parseFloat(row.C16BaseDr01);
                suma_impuesto0+=parseFloat(row.C11Importedr01);
            }else if (tipofactor=="EXENTO"){
                suma_base_exento+=parseFloat(row.C16BaseDr01);
            }
        break;
    }
    //IEPS
    createCell(newWorkBook.Sheets[SheetName],"O"+indice_renglon,"n",-Math.abs(row.C17ImporteDr02.replace("-","")));
    newWorkBook.Sheets[SheetName]["O"+indice_renglon].z=formato_cantidades;
    createCell(newWorkBook.Sheets[SheetName],"P"+indice_renglon,"n",row.C19TasaocuotaDr02);
    createCell(newWorkBook.Sheets[SheetName],"Q"+indice_renglon,"s",row.C20TipofactorDr02);
    createCell(newWorkBook.Sheets[SheetName],"R"+indice_renglon,"s",row.C21ImpuestoDr02);
    createCell(newWorkBook.Sheets[SheetName],"S"+indice_renglon,"n",-Math.abs(row.C22BasedrDr02.replace("-","")));//base
    newWorkBook.Sheets[SheetName]["S"+indice_renglon].z=formato_cantidades;

    //Retencion
    createCell(newWorkBook.Sheets[SheetName],"T"+indice_renglon,"n",row.C23ImporteDr03);
    newWorkBook.Sheets[SheetName]["T"+indice_renglon].z=formato_cantidades;
    createCell(newWorkBook.Sheets[SheetName],"U"+indice_renglon,"n",row.C25TasaocuotaDr02);
    createCell(newWorkBook.Sheets[SheetName],"V"+indice_renglon,"s",row.C26TipofactordrDr02);
    createCell(newWorkBook.Sheets[SheetName],"W"+indice_renglon,"s",row.C27ImpuestoDr02);
    createCell(newWorkBook.Sheets[SheetName],"X"+indice_renglon,"n",row.C28BasedrDr02);//base
    newWorkBook.Sheets[SheetName]["X"+indice_renglon].z=formato_cantidades;

    if (indice_subrenglon>indice_renglon){
        indice_renglon=indice_subrenglon;
    }else{
        indice_renglon++;
    }
    
}

//renglones P
for (var row of nodo_datos.results[0].ETXTDISCOUNTNEWNAV.results){
    var suma_factura_base=0;
    var suma_factura_impuesto=0;
    var tasaOcuota_sumados="";
    var claseImp_sumados="";
    var num_doc=row.Columna3;
    createCell(newWorkBook.Sheets[SheetName],"A"+indice_renglon,"s","Cargos aplicados");//descripcion
    createCell(newWorkBook.Sheets[SheetName],"B"+indice_renglon,"s",row.Columna4);//descripcion de cargo
    createCell(newWorkBook.Sheets[SheetName],"C"+indice_renglon,"s",row.C07Documento);//doc de sap
    createCell(newWorkBook.Sheets[SheetName],"D"+indice_renglon,"s",row.Columna2);//tienda  
    createCell(newWorkBook.Sheets[SheetName],"E"+indice_renglon,"s",row.Columna3);//folio o nota de entrada
    //createCell(newWorkBook.Sheets[SheetName],"G"+indice_renglon,"n",row.Columna5);//importe de cargo
    createCell(newWorkBook.Sheets[SheetName],"G"+indice_renglon,"n",-Math.abs(row.Columna5)); // importe de factura
    newWorkBook.Sheets[SheetName]["G"+indice_renglon].z = formato_cantidades;
//PRORRATEO
createCell(newWorkBook.Sheets[SheetName],"H"+indice_renglon,"s",row.C08Uuid);//UUID factura para aplicar cargo
createCell(newWorkBook.Sheets[SheetName],"I"+indice_renglon,"n",row.C09CargoFactura);//Cargo que se aplica sobre la factura
newWorkBook.Sheets[SheetName]["I"+indice_renglon].z = formato_cantidades;

    //IVA
    createCell(newWorkBook.Sheets[SheetName],"J"+indice_renglon,"n",-Math.abs(row.C11Importedr01.replace("-","")));
    newWorkBook.Sheets[SheetName]["J"+indice_renglon].z=formato_cantidades;
    createCell(newWorkBook.Sheets[SheetName],"K"+indice_renglon,"n",row.C13TasaocuotaDr01);
    createCell(newWorkBook.Sheets[SheetName],"L"+indice_renglon,"s",row.C14TipofactorDr01);
    createCell(newWorkBook.Sheets[SheetName],"M"+indice_renglon,"s",row.C15ImpuestoDr01);
    createCell(newWorkBook.Sheets[SheetName],"N"+indice_renglon,"n",-Math.abs(row.C16BaseDr01.replace("-","")));//base
    newWorkBook.Sheets[SheetName]["N"+indice_renglon].z=formato_cantidades;
    switch (parseFloat(row.C13TasaocuotaDr01)){
        case 0.16: 
        suma_base16+=parseFloat(row.C16BaseDr01);
        suma_impuesto16+=parseFloat(row.C11Importedr01);
        break;
        case 0.08:
            suma_base8+=parseFloat(row.C16BaseDr01);
            suma_impuesto8+=parseFloat(row.C11Importedr01);
        break;
        case 0:
            if (tipofactor=="TASA"){
                suma_base0+=parseFloat(row.C16BaseDr01);
                suma_impuesto0+=parseFloat(row.C11Importedr01);
            }else if (tipofactor=="EXENTO"){
                suma_base_exento+=parseFloat(row.C16BaseDr01);
            }
        break;
    }
    //IEPS
    createCell(newWorkBook.Sheets[SheetName],"O"+indice_renglon,"n",-Math.abs(row.C17ImporteDr02.replace("-","")));
    newWorkBook.Sheets[SheetName]["O"+indice_renglon].z=formato_cantidades;
    createCell(newWorkBook.Sheets[SheetName],"P"+indice_renglon,"n",row.C19TasaocuotaDr02);
    createCell(newWorkBook.Sheets[SheetName],"Q"+indice_renglon,"s",row.C20TipofactorDr02);
    createCell(newWorkBook.Sheets[SheetName],"R"+indice_renglon,"s",row.C21ImpuestoDr02);
    createCell(newWorkBook.Sheets[SheetName],"S"+indice_renglon,"n",-Math.abs(row.C22BasedrDr02.replace("-","")));//base
    newWorkBook.Sheets[SheetName]["S"+indice_renglon].z=formato_cantidades;

    //Retencion
    createCell(newWorkBook.Sheets[SheetName],"T"+indice_renglon,"n",-Math.abs(row.C23ImporteDr03));
    newWorkBook.Sheets[SheetName]["T"+indice_renglon].z=formato_cantidades;
    createCell(newWorkBook.Sheets[SheetName],"U"+indice_renglon,"n",row.C25TasaocuotaDr03);
    createCell(newWorkBook.Sheets[SheetName],"V"+indice_renglon,"s",row.C26TipofactorDr03);
    createCell(newWorkBook.Sheets[SheetName],"W"+indice_renglon,"s",row.C27ImpuestoDr03);
    createCell(newWorkBook.Sheets[SheetName],"X"+indice_renglon,"n",row.C28BaseDr03);//base
    newWorkBook.Sheets[SheetName]["X"+indice_renglon].z=formato_cantidades;

    if (row.Columna5!=""){
    suma_total_cargos+=parseFloat(row.Columna5);
    }

    if (indice_subrenglon>indice_renglon){
        indice_renglon=indice_subrenglon;
    }else{
        indice_renglon++;
    }
    
}





createCell(newWorkBook.Sheets[SheetName],"F4","n",suma_base16);
newWorkBook.Sheets[SheetName]["F4"].z=formato_cantidades;
createCell(newWorkBook.Sheets[SheetName],"G4","n",suma_impuesto16);
newWorkBook.Sheets[SheetName]["G4"].z=formato_cantidades;

createCell(newWorkBook.Sheets[SheetName],"H4","n",suma_base8);
newWorkBook.Sheets[SheetName]["H4"].z=formato_cantidades;
createCell(newWorkBook.Sheets[SheetName],"I4","n",suma_impuesto8);
newWorkBook.Sheets[SheetName]["I4"].z=formato_cantidades;

createCell(newWorkBook.Sheets[SheetName],"J4","n",suma_base0);
newWorkBook.Sheets[SheetName]["J4"].z=formato_cantidades;
createCell(newWorkBook.Sheets[SheetName],"K4","n",suma_impuesto0);
newWorkBook.Sheets[SheetName]["K4"].z=formato_cantidades;

createCell(newWorkBook.Sheets[SheetName],"L4","n",suma_base_exento);
newWorkBook.Sheets[SheetName]["L4"].z=formato_cantidades;

createCell(newWorkBook.Sheets[SheetName],"M4","n",suma_importe_retencion);
newWorkBook.Sheets[SheetName]["M4"].z=formato_cantidades;

//imprime el total sumado de facturas en lugar del total que viene en la cabecera
createCell(newWorkBook.Sheets[SheetName],"F2","n",suma_total_factura);
newWorkBook.Sheets[SheetName]["F2"].z=formato_cantidades;

//imprime el total sumado de cargos(P) en lugar del total que viene en la cabecera
createCell(newWorkBook.Sheets[SheetName],"H2","n",-Math.abs(suma_total_cargos));
newWorkBook.Sheets[SheetName]["H2"].z=formato_cantidades;

//nueva suma de jesus para el dato en L2 total retención
var importe_pagado=parseFloat(nodo_datos.results[0].ETXTTOTALNAV.results[0].Columna11);//K2

var retencion_aplicada=(importe_pagado*-1)+suma_total_factura+(-Math.abs(suma_total_cargos))+(-Math.abs(suma_total_cargos));
retencion_aplicada=retencion_aplicada<1?0:retencion_aplicada;

createCell(newWorkBook.Sheets[SheetName],"L2","n",retencion_aplicada);
newWorkBook.Sheets[SheetName]["L2"].z=formato_cantidades;

/* genera archivo XLSX */
XLSX.writeFile(newWorkBook, nodo_datos.results[0].IBukrs+"_"+nodo_datos.results[0].IGjahr+"_"+nodo_datos.results[0].IVblnr+".xlsx",{codepage: 65001});

}