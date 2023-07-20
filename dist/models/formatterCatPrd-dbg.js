sap.ui.define([], function () {
    "use strict";
    return {

        findPropertieValue: function (propiedadSearch, propiedadReturn, clave, catalogo) {
            let item = catalogo.results.find(element => element[propiedadSearch] == clave);
            return (item) ? item[propiedadReturn] : "";
        },

    };
});