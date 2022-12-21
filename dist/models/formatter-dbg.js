sap.ui.define([], function () {
	"use strict";
	return {
		isSeco: function(cedisType){
            return cedisType == 0 ? true : false
        },

        isFresco: function(cedisType){
            return cedisType == 1 ? true : false
        }
	};
});