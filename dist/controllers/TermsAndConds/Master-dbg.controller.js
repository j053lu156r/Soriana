sap.ui.define([
    "demo/controllers/BaseController"
], function (Controller) {
    "use strict";

    return Controller.extend("demo.controllers.TermsAndConds.Master", {

        onDownloadPN: function() {
            const link = document.createElement("a");
            link.href = "./assets/TermsAndConditions/TyC_Nacional_2023.pdf";
            link.download = "TyC Nacional 2023.pdf";
            link.click();
        },

        onDownloadPI: function() {
            const link = document.createElement("a");
            link.href = "./assets/TermsAndConditions/TyC_Importaciones_Bil_2023.pdf";
            link.download = "TyC Importaciones Bil 2023.pdf";
            link.click();
        }

    });
});