clickToAddress.prototype.search = function(searchText, filters, timeTrack){
	var that = this;
	if(searchText === ''){
		return;
	}

	if(typeof filters == 'undefined'){
		filters = {};
	}

	this.setProgressBar(0);
	var parameters = {
		key: this.key,
		query: searchText,
		filters: filters,
		country: this.activeCountry,
		fingerprint: this.fingerprint,
		integration: this.tag
	};
	if(typeof this.accessTokenOverride[this.activeCountry] != 'undefined'){
		parameters.key = this.accessTokenOverride[this.activeCountry];
	}
	if(this.coords != {}){
		parameters.coords = {};
		parameters.coords.lat = this.coords.latitude;
		parameters.coords.lng = this.coords.longitude;
	}
	// first check cache
	try{
		var data = this.cacheRetrieve(parameters);
		that.hideErrors();
		// return data
		that.searchResults = data;
		that.showResults();
		if(!that.focused){
			that.activeInput.focus();
		}
		that.setProgressBar(1);
		return;
	} catch (err) {
		if(['cc/cr/01', 'cc/cr/02'].indexOf(err) == -1){
			throw err;
		}
	}

	// Set up the URL
	var url = this.baseURL + 'find';

	// Create new XMLHttpRequest
	request = new XMLHttpRequest();
	request.open('POST', url, true);
	request.setRequestHeader('Content-Type', 'application/json');
	request.setRequestHeader('Accept', 'application/json');
	// Wait for change and then either JSON parse response text or throw exception for HTTP error
	request.onreadystatechange = function() {
		if (this.readyState === 4 && (that.sidCheck(timeTrack) || typeof timeTrack == 'undefined')){
			that.setProgressBar(1);
			that.clear();
			if (this.status >= 200 && this.status < 400){
				// Success!
				if(this.status == 204){
					return;
				}
				var data = '';
				try{
					data = JSON.parse(this.responseText);
					that.hideErrors();
					// return data
					that.searchResults = data;
					that.showResults();
					if(!that.focused){
						that.activeInput.focus();
					}
					// store in cache
					that.cacheStore(parameters, data);
				}
				catch(err){
					that.error(9011, 'JS Client side error.');
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
clickToAddress.prototype.getAddressDetails = function(id){
	var parameters = {
		id: id,
		country: this.activeCountry,
		key: this.key,
		fingerprint: this.fingerprint,
		integration: this.tag
	};
	if(typeof this.accessTokenOverride[this.activeCountry] != 'undefined'){
		parameters.key = this.accessTokenOverride[this.activeCountry];
	}
	if(this.coords != {}){
		parameters.coords = this.coords;
	}
	// Set up the URL
	var url = this.baseURL + 'retrieve';

	// Create new XMLHttpRequest
	request = new XMLHttpRequest();
	request.open('POST', url, true);
	request.setRequestHeader('Content-Type', 'application/json');
	request.setRequestHeader('Accept', 'application/json');
	// Wait for change and then either JSON parse response text or throw exception for HTTP error
	var that = this;
	request.onreadystatechange = function() {
		if (this.readyState === 4){
			if (this.status >= 200 && this.status < 400){
				try{
					that.fillData(JSON.parse(this.responseText));
					that.hideErrors();

					that.cleanHistory();
				} catch(e){
					that.error(9011, 'JS Client side error.');
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
	var parameters = {
		key: this.key,
		fingerprint: this.fingerprint,
		integration: this.tag
	};
	// Set up the URL
	var url = this.baseURL + 'countries';

	// Create new XMLHttpRequest
	request = new XMLHttpRequest();
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
					that.error(9011, 'JS Client side error.');
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
			that.error(9012, "Server Unavailable. (timeout)");
		}
	},10000);
};

clickToAddress.prototype.handleApiError = function(ajax){
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
		this.error(9010, 'Unknown Server Error.');
	}
};
