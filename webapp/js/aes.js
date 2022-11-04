sap.ui.define([], function () {
	"use strict";
	return {
		convertUtf8: function(text){
            var result = [], i = 0;
            text = encodeURI(text);
            while (i < text.length) {
                var c = text.charCodeAt(i++);

                // if it is a % sign, encode the following 2 bytes as a hex value
                if (c === 37) {
                    result.push(parseInt(text.substr(i, 2), 16))
                    i += 2;

                // otherwise, just the actual byte
                } else {
                    result.push(c)
                }
            }
            return this.coerceArray(result);
        },

        coerceArray: function(arg, copy) {

            // ArrayBuffer view
            if (arg.buffer && ArrayBuffer.isView(arg) && arg.name === 'Uint8Array') {
    
                if (copy) {
                    if (arg.slice) {
                        arg = arg.slice();
                    } else {
                        arg = Array.prototype.slice.call(arg);
                    }
                }
    
                return arg;
            }
    
            // It's an array; check it is a valid representation of a byte
            if (Array.isArray(arg)) {
                if (!this.checkInts(arg)) {
                    throw new Error('Array contains invalid value: ' + arg);
                }
    
                return new Uint8Array(arg);
            }
    
            // Something else, but behaves like an array (maybe a Buffer? Arguments?)
            if (checkInt(arg.length) && this.checkInts(arg)) {
                return new Uint8Array(arg);
            }
    
            throw new Error('unsupported array-like object');
        },

        checkInts: function(arrayish) {
            if (!this.checkInt(arrayish.length)) { return false; }
    
            for (var i = 0; i < arrayish.length; i++) {
                if (!this.checkInt(arrayish[i]) || arrayish[i] < 0 || arrayish[i] > 255) {
                    return false;
                }
            }
    
            return true;
        },

        checkInt: function(value) {
            return (parseInt(value) === value);
        },

        ModeOfOperationCtr: function(key, counter){
            var AES = function(key) {
                if (!(this instanceof AES)) {
                    throw Error('AES must be instanitated with `new`');
                }
        
                Object.defineProperty(this, 'key', {
                    value: coerceArray(key, true)
                });
        
                this._prepare();
            }
            
            if (!(this instanceof ModeOfOperationCTR)) {
                throw Error('AES must be instanitated with `new`');
            }
    
            this.description = "Counter";
            this.name = "ctr";
    
            if (!(counter instanceof Counter)) {
                counter = new Counter(counter)
            }
    
            this._counter = counter;
    
            this._remainingCounter = null;
            this._remainingCounterIndex = 16;
    
            this._aes = new AES(key);
        }
	};
});