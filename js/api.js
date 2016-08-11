clickToAddress.prototype.search = function(searchText, id, sequence){
	'use strict';
	/*
		sequence:
			-1	: history action (will not be stored in cache)
			0	: missing
			1+	: standard search
		type:
			0	: find
			1	: retrieve
			2	: find (from history, do not cache)
	*/
	var that = this;
	if(searchText === ''){
		return;
	}
	this.setProgressBar(0);
	var parameters = {
		key: this.key,
		query: searchText,
		id: id,
		country: this.activeCountry,
		fingerprint: this.fingerprint,
		integration: this.tag,
		js_version: this.jsVersion,
		sequence: sequence,
		type: 0
	};
	if(sequence == -1){
		parameters.type = 2;
	}
	if(typeof this.accessTokenOverride[this.activeCountry] != 'undefined'){
		parameters.key = this.accessTokenOverride[this.activeCountry];
	}
	if(this.coords != {}){
		parameters.coords = {};
		parameters.coords.lat = this.coords.latitude;
		parameters.coords.lng = this.coords.longitude;
	}
	var successFunction = function(that, data){
		that.setProgressBar(1);
		that.clear();
		that.hideErrors();
		// return data
		that.searchResults = data;
		that.showResults();
		if(!that.focused){
			that.activeInput.focus();
		}
		that.searchStatus.lastResponseId = sequence || 0;
		// store in cache
		that.cacheStore(parameters, data, sequence);
	};

	// first check cache
	try{
		var data = this.cacheRetrieve(parameters);
		successFunction(that, data);
		return;
	} catch (err) {
		if(['cc/cr/01', 'cc/cr/02'].indexOf(err) == -1){
			throw err;
		}
	}

	// Set up the URL
	var url = this.baseURL + 'find';

	// Create new XMLHttpRequest
	var request = new XMLHttpRequest();
	request.open('POST', url, true);
	request.setRequestHeader('Content-Type', 'application/json');
	request.setRequestHeader('Accept', 'application/json');
	// Wait for change and then either JSON parse response text or throw exception for HTTP error
	request.onreadystatechange = function() {
		if (this.readyState !== 4){
			return;
		}
		if (this.status >= 200 && this.status < 400){
			if(this.status == 200){
				var data = '';
				try{
					data = JSON.parse(this.responseText);
					if(that.searchStatus.lastResponseId <= sequence){
						successFunction(that, data);
					}
				}
				catch(err){
					that.error('JS502');
				}
			}
		} else {
			that.handleApiError(this);
		}
	};
	// Send request
	request.send(JSON.stringify(parameters));
	// Nullify request object
	request = null;
};
clickToAddress.prototype.getAddressDetails = function(id){
	'use strict';
	var that = this;
	var parameters = {
		id: id,
		country: this.activeCountry,
		key: this.key,
		fingerprint: this.fingerprint,
		js_version: this.jsVersion,
		integration: this.tag,
		type: 1
	};
	if(typeof this.accessTokenOverride[this.activeCountry] != 'undefined'){
		parameters.key = this.accessTokenOverride[this.activeCountry];
	}
	if(this.coords != {}){
		parameters.coords = this.coords;
	}

	var successFunction = function(that, data){
		that.fillData(data);
		that.hideErrors();
		that.cleanHistory();

		that.cacheStore(parameters, data);
	};

	// first check cache
	try{
		var data = this.cacheRetrieve(parameters);
		successFunction(that, data);
		return;
	} catch (err) {
		if(['cc/cr/01', 'cc/cr/02'].indexOf(err) == -1){
			throw err;
		}
	}

	// Set up the URL
	var url = this.baseURL + 'retrieve';

	// Create new XMLHttpRequest
	var request = new XMLHttpRequest();
	request.open('POST', url, true);
	request.setRequestHeader('Content-Type', 'application/json');
	request.setRequestHeader('Accept', 'application/json');
	// Wait for change and then either JSON parse response text or throw exception for HTTP error
	request.onreadystatechange = function() {
		if (this.readyState === 4){
			if (this.status >= 200 && this.status < 400){
				try{
					var data = JSON.parse(this.responseText);
					successFunction(that, data);
				} catch(e){
					that.error('JS503');
				}
			} else {
				that.handleApiError(this);
			}
		}
	};
	// Send request
	request.send(JSON.stringify(parameters));
	// Nullify request object
	request = null;
};

clickToAddress.prototype.getAvailableCountries = function(success_function){
	'use strict';
	var parameters = {
		key: this.key,
		fingerprint: this.fingerprint,
		js_version: this.jsVersion,
		integration: this.tag,
		language: this.countryLanguage
	};
	// Set up the URL
	var url = this.baseURL + 'countries';

	// Create new XMLHttpRequest
	var request = new XMLHttpRequest();
	request.open('POST', url, true);
	request.setRequestHeader('Content-Type', 'application/json');
	request.setRequestHeader('Accept', 'application/json');
	// Wait for change and then either JSON parse response text or throw exception for HTTP error
	var that = this;
	request.onreadystatechange = function() {
		if (this.readyState === 4){
			if(this.status == 401){
				// unauthorized access token
				return;
			}
			if (this.status >= 200 && this.status < 400){
				try{
					that.serviceReady = 1;
					var respJson = JSON.parse(this.responseText);
					that.validCountries = respJson.countries;
					that.ipLocation = respJson.ip_location;
					that.hideErrors();
					success_function();
				} catch(e){
					that.error('JS505');
				}
			} else {
				that.handleApiError(this);
			}
		}
	};
	// Send request
	request.send(JSON.stringify(parameters));
	// set timeout
	var xmlHttpTimeout = setTimeout(function(){
		if(request !== null && request.readyState !== 4){
			request.abort();
			that.error('JS501');
		}
	},10000);
};

clickToAddress.prototype.handleApiError = function(ajax){
	'use strict';
	if([401, 402].indexOf(ajax.status) != -1){
		this.serviceReady = -1;
	}
	var data = {};
	try{
		data = JSON.parse(ajax.responseText);
	}
	catch(e){
		data = {};
	}
	if( typeof data.error != 'undefined' && typeof data.error.status == "string" ){
		this.error(data.error.status, data.error.message);
	} else {
		this.error('JS500');
	}
};
