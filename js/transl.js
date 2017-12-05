clickToAddress.prototype.addTransl = function(){
	var that = this;
	var transl_url = 'https://cc-cdn.com/utils/transl/v1/transliteration.min.js';
	try {
		if("function" == typeof define && define.amd){
			requirejs.config({
				paths: {
					'transliterate': [transl_url]
				}
			});
			require(['transliterate'], function(transl){
				that.transl = transl;
			});
		} else {
			var jsId = 'crafty_transliterate';
			if(document.getElementById('crafty_transliterate') === null){
				if (!document.getElementById(jsId))
				{
					var head	= document.getElementsByTagName('head')[0];
					var link	= document.createElement('script');
					link.id	 = jsId;
					link.type = 'text/javascript';
					link.src = transl_url;
					head.appendChild(link);
				}
				var waitForLib = function(){
					console.log('wait for transl');
					if(typeof transl == 'function'){
						clearInterval(transl_loading);
						that.transl = transl;
					}
				}
				var transl_loading = setInterval(waitForLib,100);
			}
		}
	} catch(e){
		// failed to add transl
	}

};
