clickToAddress.prototype.cacheRetrieve = function(search){
	'use strict';
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
clickToAddress.prototype.cacheStore = function(search, obj, sequence){
	'use strict';
	if(typeof this.cache[search.country] == 'undefined'){
		this.cache[search.country] = [];
	}
	var splice_pos = Math.abs(binaryIndexOf(this.cache[search.country], sequence));
	this.cache[search.country].splice(splice_pos, 0, {
		query: search.query,
		filters: search.filters,
		response: obj,
		sequence: sequence
	});
	if(this.cache[search.country].length > 100){
		this.cache[search.country].shift();
	}

	this.setHistoryStep();
};
clickToAddress.prototype.history = function(dir){
	'use strict';
	if(!this.historyTools)
		return;
	if(this.cachePos <= -1){
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
	'use strict';
	if(!this.historyTools)
		return;
	var that = this;
	var backBtn = this.searchObj.getElementsByClassName('cc-back')[0];
	var forwardBtn = this.searchObj.getElementsByClassName('cc-forward')[0];
	ccEvent(backBtn, 'click', function(){
		if(backBtn.className == 'cc-back'){
			that.history(0);
		}
	});
	ccEvent(forwardBtn, 'click', function(){
		if(forwardBtn.className == 'cc-forward'){
			that.history(1);
		}
	});
};
clickToAddress.prototype.setHistoryStep = function(){
	'use strict';
	if(!this.historyTools)
		return;
	var backBtn = this.searchObj.getElementsByClassName('cc-back')[0];
	var forwardBtn = this.searchObj.getElementsByClassName('cc-forward')[0];

	backBtn.className = 'cc-back';
	forwardBtn.className = 'cc-forward';
	var logo_visible = 0;

	if(	typeof this.cache[this.activeCountry] == 'undefined' ||
		this.cachePos >= Object.keys(this.cache[this.activeCountry]).length - 1 ||
		Object.keys(this.cache[this.activeCountry]).length <= 1
	){
		backBtn.className = 'cc-back cc-disabled';
		logo_visible++;
	}
	if(	typeof this.cache[this.activeCountry] == 'undefined' ||
		this.cachePos <= 0 ||
		Object.keys(this.cache[this.activeCountry]).length <= 1
	){
		forwardBtn.className = 'cc-forward cc-disabled';
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
	'use strict';
	var backBtn = this.searchObj.getElementsByClassName('cc-back')[0];
	var forwardBtn = this.searchObj.getElementsByClassName('cc-forward')[0];
	backBtn.className = 'cc-back cc-disabled';
	forwardBtn.className = 'cc-forward cc-disabled';
};

clickToAddress.prototype.cleanHistory = function(){
	'use strict';
	if(this.cachePos <= 0 || typeof this.cache[this.activeCountry] == 'undefined'){
		return;
	}
	var removeAt = Object.keys(this.cache[this.activeCountry]).length - this.cachePos;
	this.cache[this.activeCountry].splice(removeAt, this.cachePos);
	this.cachePos = -1;
	this.activeFilters = this.cache[this.activeCountry][Object.keys(this.cache[this.activeCountry]).length - 1].filters;
	this.setHistoryStep();
};
