clickToAddress.prototype.error = function(code, message){
	'use strict';
	var errors = {
		// js errors
		'JS500': 'Unknown Server Error',
		'JS501': 'API server seems unreachable',
		'JS502': 'API search request resulted in a JS error.',
		'JS503': 'API address retrieve request resulted in a JS error.',
		'JS505': 'API countrylist retrieve request resulted in a JS error.',
		// js warnings
		'JS401': 'Invalid value for countryMatchWith. Fallback to "text"'
	};
	message = typeof message !== 'undefined' ? message : errors[code];
	if(cc_debug){
		console.warn('CraftyClicks Debug Error Message: ['+code+'] '+message);
	}
	if(this.serviceReady == -1){
		this.errorObj.innerHTML = message;
	} else {
		this.errorObj.innerHTML = this.texts.generic_error;
	}
	this.errorObj.className = 'c2a_error';

	if(typeof this.onError == 'function'){
		this.onError(code, message);
	}
};

clickToAddress.prototype.hideErrors = function(){
	'use strict';
	if(this.serviceReady != -1){
		this.errorObj.innerHTML = '';
		this.errorObj.className = 'c2a_error c2a_error_hidden';
	}
};
