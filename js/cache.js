clickToAddress.prototype.cacheRetrieve = function(search){
	'use strict';
	if(search.type == 0 || search.type == 2){
		if(typeof this.cache.finds[search.country] == 'undefined'){
			throw 'cc/cr/01';
		}
		for(var i=0; i < this.cache.finds[search.country].length; i++){
			if(	this.cache.finds[search.country][i].query == search.query &&
				this.cache.finds[search.country][i].id == search.id
			){
				return this.cache.finds[search.country][i].response;
			}
		}
		throw 'cc/cr/02';
	}
	if(search.type == 1){
		if(typeof this.cache.retrieves[search.country] == 'undefined'){
			throw 'cc/cr/01';
		}
		for(var i=0; i < this.cache.retrieves[search.country].length; i++){
			if( this.cache.retrieves[search.country][i].id == search.id ){
				return this.cache.retrieves[search.country][i].response;
			}
		}
		throw 'cc/cr/02';
	}
	throw 'cc/cr/03';
};
clickToAddress.prototype.cacheStore = function(search, obj, sequence){
	'use strict';
	var sequence = sequence || 0;
	if(search.type === 0){
		if(typeof this.cache.finds[search.country] == 'undefined'){
			this.cache.finds[search.country] = [];
		}
		var splice_pos = Math.abs(binaryIndexOf(this.cache.finds[search.country], sequence));
		this.cache.finds[search.country].splice(splice_pos, 0, {
			query: search.query,
			id: search.id,
			response: obj,
			sequence: sequence
		});
		if(this.cache.finds[search.country].length > 100){
			this.cache.finds[search.country].shift();
		}
		this.setHistoryStep();
		return;
	}

	if(search.type == 1){
		if(typeof this.cache.retrieves[search.country] == 'undefined'){
			this.cache.retrieves[search.country] = [];
		}
		for(var i=0; i < this.cache.retrieves[search.country].length; i++){
			if( this.cache.retrieves[search.country][i].id == search.id ){
				return;
			}
		}
		this.cache.retrieves[search.country].push({
			id: search.id,
			response: obj
		});
		return;
	}
	// this was a history search, do not store (already stored)
	if(search.type == 2){
		return;
	}
};
clickToAddress.prototype.history = function(dir){
	'use strict';
	if(!this.historyTools)
		return;
	if(this.cachePos <= -1){
		this.cachePos = 0;
	}
	var searchParams = {};
	var cacheLength = Object.keys(this.cache.finds[this.activeCountry]).length - 1;
	if(dir === 0){
		this.cachePos++;
		searchParams = this.cache.finds[this.activeCountry][cacheLength - this.cachePos];
	} else {
		this.cachePos--;
		searchParams = this.cache.finds[this.activeCountry][cacheLength - this.cachePos];
	}
	this.setHistoryStep();
	this.activeInput.value = searchParams.query;
	// let the cache know that this request shouldn't be re-stored (-1)
	this.search(searchParams.query, searchParams.id, -1);

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

	if(	typeof this.cache.finds[this.activeCountry] == 'undefined' ||
		this.cachePos >= Object.keys(this.cache.finds[this.activeCountry]).length - 1 ||
		Object.keys(this.cache.finds[this.activeCountry]).length <= 1
	){
		backBtn.className = 'cc-back cc-disabled';
		logo_visible++;
	}
	if(	typeof this.cache.finds[this.activeCountry] == 'undefined' ||
		this.cachePos <= 0 ||
		Object.keys(this.cache.finds[this.activeCountry]).length <= 1
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
	if(!this.historyTools)
		return;
	var backBtn = this.searchObj.getElementsByClassName('cc-back')[0];
	var forwardBtn = this.searchObj.getElementsByClassName('cc-forward')[0];
	backBtn.className = 'cc-back cc-disabled';
	forwardBtn.className = 'cc-forward cc-disabled';
};

clickToAddress.prototype.cleanHistory = function(){
	'use strict';
	if(this.cachePos <= 0 || typeof this.cache.finds[this.activeCountry] == 'undefined'){
		return;
	}
	var removeAt = Object.keys(this.cache.finds[this.activeCountry]).length - this.cachePos;
	this.cache.finds[this.activeCountry].splice(removeAt, this.cachePos);
	this.cachePos = -1;
	var keys_length = Object.keys(this.cache.finds[this.activeCountry]).length;
	if(keys_length > 0){
		this.activeId = this.cache.finds[this.activeCountry][keys_length - 1].id;
	} else {
		this.activeId = '';
	}
	this.setHistoryStep();
};
