clickToAddress.prototype.cacheRetrieve = function(search){
	if(typeof this.cache[search.country] == 'undefined'){
		throw 'cc/cr/01';
	}
	for(var i=0; i < this.cache[search.country].length; i++){
		if(	this.cache[search.country][i].query == search.query &&
			JSON.stringify(this.cache[search.country][i].filters) == JSON.stringify(search.filters)
		){
			return this.cache[search.country][i].response;
		}
	}
	throw 'cc/cr/02';
};
clickToAddress.prototype.cacheStore = function(search, obj){
	if(typeof this.cache[search.country] == 'undefined'){
		this.cache[search.country] = [];
	}
	this.cache[search.country].push({
		query: search.query,
		filters: search.filters,
		response: obj
	});
	if(this.cache[search.country].length > 100){
		this.cache[search.country].shift();
	}

	this.setHistoryStep();
};
clickToAddress.prototype.history = function(dir){
	if(!this.historyTools)
		return;
	if(this.cachePos == -1){
		this.cachePos = 0;
	}
	var searchParams = {};
	var cacheLength = Object.keys(this.cache[this.activeCountry]).length - 1;
	if(dir === 0){
		this.cachePos++;
		searchParams = this.cache[this.activeCountry][cacheLength - this.cachePos];
	} else {
		this.cachePos--;
		searchParams = this.cache[this.activeCountry][cacheLength - this.cachePos];
	}
	this.setHistoryStep();
	this.activeInput.value = searchParams.query;
	this.search(searchParams.query, searchParams.filters);

};
clickToAddress.prototype.setHistoryActions = function(){
	if(!this.historyTools)
		return;
	var that = this;
	var backBtn = this.searchObj.getElementsByClassName('back')[0];
	var forwardBtn = this.searchObj.getElementsByClassName('forward')[0];
	ccEvent(backBtn, 'click', function(){
		if(backBtn.className == 'back'){
			that.history(0);
		}
	});
	ccEvent(forwardBtn, 'click', function(){
		if(forwardBtn.className == 'forward'){
			that.history(1);
		}
	});
};
clickToAddress.prototype.setHistoryStep = function(){
	if(!this.historyTools)
		return;
	var backBtn = this.searchObj.getElementsByClassName('back')[0];
	var forwardBtn = this.searchObj.getElementsByClassName('forward')[0];

	backBtn.className = 'back';
	forwardBtn.className = 'forward';
	var logo_visible = 0;

	if(	typeof this.cache[this.activeCountry] == 'undefined' ||
		this.cachePos == Object.keys(this.cache[this.activeCountry]).length -1 ||
		Object.keys(this.cache[this.activeCountry]).length <= 1
	){
		backBtn.className = 'back disabled';
		logo_visible++;
	}
	if(	typeof this.cache[this.activeCountry] == 'undefined' ||
		this.cachePos <= 0 ||
		Object.keys(this.cache[this.activeCountry]).length <= 1
	){
		forwardBtn.className = 'forward disabled';
		logo_visible++;
	}
	var logo = this.searchObj.getElementsByClassName('c2a_logo');
	if(logo.length){
		if(logo_visible == 2){
			logo[0].className = 'c2a_logo';
		} else {
			logo[0].className = 'c2a_logo hidden';
		}
	}
};

clickToAddress.prototype.hideHistory = function(){
	var backBtn = this.searchObj.getElementsByClassName('back')[0];
	var forwardBtn = this.searchObj.getElementsByClassName('forward')[0];
	backBtn.className = 'back disabled';
	forwardBtn.className = 'forward disabled';
};

clickToAddress.prototype.cleanHistory = function(){
	if(this.cachePos == -1 || typeof this.cache[this.activeCountry] == 'undefined'){
		return;
	}
	var cacheLength = Object.keys(this.cache[this.activeCountry]).length - 1;
	var removeAt = cacheLength - this.cachePos;
	this.cache[this.activeCountry].splice(removeAt, this.cachePos);
	this.cachePos = -1;
	this.setHistoryStep();
};
