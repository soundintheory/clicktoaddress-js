clickToAddress.prototype.info = function(state){
	var infoBar = this.searchObj.getElementsByClassName('infoBar')[0];

	switch(state){
		case 'pre-trial':
			infoBar.className += ' infoActive';
			infoBar.innerHTML = '<h5>Get a trial account today!</h5><p>You can test the functionality by using our test addresses.</p>';
			break;
	}
}


clickToAddress.prototype.setFingerPrint = function(){
	var low = 1000000000000000;
	var high = 9999999999999999;
	var value = Math.floor(Math.random() * (high - low + 1) + low);
	this.fingerprint = value.toString(16);
}
clickToAddress.prototype.getFingerPrint = function(){
	return this.fingerprint;
}
