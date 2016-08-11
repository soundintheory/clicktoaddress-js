clickToAddress.prototype.info = function(state, count){
	'use strict';
	var infoBar = this.searchObj.getElementsByClassName('infoBar')[0];

	switch(state){
		case 'pre-trial':
			infoBar.className += ' infoActive infoTrial';
			infoBar.innerHTML = '<h5>Access token is needed!</h5><p>To get a trial token, sign up for a <a href="https://account.craftyclicks.co.uk/login/signup">free trial</a>.</p><p>Then find the placeholder accessToken xxxxx-xxxxx-xxxxx-xxxxx in your HTML and replace it with a your own token.</p>';
			break;
			/*
		case 'too-many-results':
			infoBar.className += ' infoActive infoWarning';
			infoBar.innerHTML = count+ ' results found. Please provide more address details.';
			break;
		*/
		case 'no-results':
			infoBar.className += ' infoActive infoWarning';
			infoBar.innerHTML = this.texts.no_results;
			break;
		default:
			infoBar.className = 'infoBar';
			infoBar.innerHTML = '';
			break;
	}
};


clickToAddress.prototype.setFingerPrint = function(){
	'use strict';
	var low = 1000000000000000;
	var high = 9999999999999999;
	var value = Math.floor(Math.random() * (high - low + 1) + low);
	this.fingerprint = value.toString(16);
};
clickToAddress.prototype.getFingerPrint = function(){
	'use strict';
	return this.fingerprint;
};
