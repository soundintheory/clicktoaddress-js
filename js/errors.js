clickToAddress.prototype.error = function(code, message){
	'use strict';
	var errors = {
		// js errors
		'JS500': 'Unknown Server Error',
		'JS501': 'API server seems unreachable',
		'JS502': 'API search request resulted in a JS error.',
		'JS503': 'API address retrieve request resulted in a JS error.',
		'JS505': 'API countrylist retrieve request resulted in a JS error.',
		'JS506': 'JSON parsing error',
		// js warnings
		'JS401': 'Invalid value for countryMatchWith. Fallback to "text"'
	};
	message = typeof message !== 'undefined' ? message : errors[code];
	if(this.debug){
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
clickToAddress.prototype.start_debug = function(){
	'use strict';
	var that = this;
	var css = document.createElement('style');
	css.type = 'text/css';
	var styles = '#cc_c2a_debug { '+[
		'position: fixed;',
		'right: 0px;',
		'background-color: white;',
		'top: 50px;',
		'border: 1px solid black;',
		'border-top-left-radius: 5px;',
		'border-bottom-left-radius: 5px;',
		'padding: 5px;',
		'text-align: center;',
		'border-right: none;'
	].join(' ')+' }';
	styles += ' #cc_c2a_debug > div{'+
		['border-radius: 5px;',
			'padding: 5px;',
			'border: 1px solid black;',
			'margin-bottom: 5px;'
		].join(' ')
	+'}';
	styles += ' #cc_c2a_debug .c2a_toggle.c2a_toggle_on{ background-color: #87D37C; color: white; }'
	styles += ' #cc_c2a_debug .c2a_toggle{ cursor: pointer; }';

	if (css.styleSheet) css.styleSheet.cssText = styles;
	else css.appendChild(document.createTextNode(styles));

	document.getElementsByTagName("head")[0].appendChild(css);


	var cc_debug = document.createElement('DIV');
	cc_debug.id = 'cc_c2a_debug';
	var html =	[
		'<div><img style="width: 40px;" src="https://craftyclicks.co.uk/wp-content/themes/craftyclicks_wp_theme/assets/images/product/prod_gl.png"/></div>',
		'<div id="toggl_transl" class="c2a_toggle">Toggle Transl</div>'
	].join('');
	cc_debug.innerHTML = html;
	document.body.appendChild(cc_debug);
	var btn1 = document.getElementById('toggl_transl');
	ccEvent(btn1, 'click', function(){
		that.transliterate = !that.transliterate;
		if(that.transliterate){
			btn1.className = 'c2a_toggle c2a_toggle_on';
			that.addTransl();
		} else {
			btn1.className = 'c2a_toggle';
		}
	});
}
clickToAddress.prototype.addTransl = function(){
	var jsId = 'crafty_transliterate';
	if(document.getElementById('crafty_transliterate') === null){
		if (!document.getElementById(jsId))
		{
			var head	= document.getElementsByTagName('head')[0];
			var link	= document.createElement('script');
			link.id	 = jsId;
			link.type = 'text/javascript';
			link.src = 'https://unpkg.com/transliteration@1.6.2/lib/browser/transliteration.min.js';
			head.appendChild(link);
		}
	}
}
