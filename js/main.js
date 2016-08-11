function clickToAddress(config){
	'use strict';
	var that = this;
	if(document.getElementById('cc_c2a') !== null){
		throw 'Already initiated';
	}
	if(typeof that.preset == 'undefined'){
		throw 'Incorrect way to initialize this code. use "new ClickToAddress(config);"';
	}
	that.preset(config);

	that.gfxModeTools = c2a_gfx_modes['mode'+that.gfxMode];

	// get basic html
	that.gfxModeTools.addHtml(that);
	// store created element
	that.searchObj = document.getElementById('cc_c2a');
	that.resultList = that.searchObj.getElementsByClassName('c2a_results')[0];
	that.errorObj = that.searchObj.getElementsByClassName('c2a_error')[0];
	// get countries
	that.getAvailableCountries(
		// when ajax returns, select default country
		function(){
			that.serviceReady = 1;
			that.setCountryChange();
			var country = null;
			if(that.getIpLocation && that.ipLocation !== ''){
				country = that.ipLocation;
			} else {
				country = that.defaultCountry;
			}
			if(that.enabledCountries.length && that.validCountries.length){
				var defaultCountryIsValid = false;
				for(var i=0; i<that.validCountries.length; i++){
					if(that.validCountries[i].code == country){
						defaultCountryIsValid = true;
						break;
					}
				}
				if(!defaultCountryIsValid){
					country = that.validCountries[0].code;
				}
			}
			that.selectCountry(country);
		}
	);
	if(that.searchObj.getElementsByClassName("cc-history").length){
		that.setHistoryActions();
	}
	// apply events
	ccEvent(that.searchObj, 'mouseover',function(){
		that.hover = true;
	});
	ccEvent(that.searchObj, 'mouseout',function(){
		that.hover = false;
	});
	ccEvent(document, 'click', function(){
		that.hide();
	});
	ccEvent(document, 'scroll', function(){
		if(that.visible && that.focused){
			setTimeout(function(){
				that.gfxModeTools.reposition(that, that.activeInput);
			},100);
			that.hideKeyboard();
		}
	});
	ccEvent(window, 'resize', function(){
		if(that.visible){
			setTimeout(function(){
				that.gfxModeTools.reposition(that, that.activeInput);
			},100);
		}
	});
	/* TODO: SCROLL */
	ccEvent(that.resultList, 'scroll', function(){
		var scrollTop = parseInt(this.scrollTop);
		var innerHeight = parseInt(window.getComputedStyle(this, null).getPropertyValue("height"));
		if(that.searchStatus.inCountryMode != 1 && parseInt(this.scrollHeight) !== 0 && scrollTop + innerHeight == parseInt(this.scrollHeight)){
			that.showResultsExtra();
		}
	});
	/*	Currently unused code: allows the search to prioritise places closer to the user

	if(config.geocode === true){
		that.getGeo();
		var footer = that.searchObj.getElementsByClassName('c2a_footer')[0];
		footer.innerHTML += '<div class="geo" title="'+that.texts.geocode+'"></div>';
	}
	*/
	that.getStyleSheet();

	if(that.key == 'xxxxx-xxxxx-xxxxx-xxxxx'){
		that.info('pre-trial');
	}
	if(typeof config.dom != 'undefined'){
		that.attach(config.dom);
	}
}
clickToAddress.prototype.fillData = function(addressData){
	'use strict';
	if(typeof this.activeDom.country != 'undefined'){
		var options = this.activeDom.country.getElementsByTagName('option');
		if(options.length){
			var target_val = '';
			for(var i=0; i<options.length && target_val === ''; i++){
				if(options[i].innerHTML == this.validCountries[this.activeCountryId].country_name){
					target_val = options[i].value;
					break;
				}
				if(options[i].value == this.activeCountry){
					target_val = options[i].value;
					break;
				}
			}
			this.activeDom.country.value = target_val;
		} else {
			this.activeDom.country.value = this.validCountries[this.activeCountryId].country_name;
		}
	}

	if(typeof this.activeDom.line_1 != 'undefined'){
		var line_3 = [];

		if(addressData.result.line_1 === '' && addressData.result.company_name !== ''){
			addressData.result.line_1 = addressData.result.company_name;
		}

		this.activeDom.line_1.value = addressData.result.line_1;
		if(typeof this.activeDom.line_2 != 'undefined'){
			this.activeDom.line_2.value = addressData.result.line_2;
		} else {
			if(addressData.result.line_2 !== ''){
				line_3.push( addressData.result.line_2 );
			}
		}
		if(addressData.result.company_name !== ''){
			if(typeof this.activeDom.company != 'undefined'){
				this.activeDom.company.value = addressData.result.company_name;
			} else {
				this.activeDom.line_1.value = addressData.result.company_name + ', ' + this.activeDom.line_1.value;
			}
		}

		if(typeof this.activeDom.postcode != 'undefined'){
			this.activeDom.postcode.value = addressData.result.postal_code;
		} else {
			line_3.push(addressData.result.postal_code);
		}

		if(typeof this.activeDom.town != 'undefined'){
			if(addressData.result.locality !== ''){
				this.activeDom.town.value = addressData.result.locality;
			} else {
				this.activeDom.town.value = addressData.result.dependent_locality;
			}
		} else {
			if(addressData.result.locality !== ''){
				line_3.push(addressData.result.locality);
			} else {
				line_3.push(addressData.result.dependent_locality);
			}
		}

		if(addressData.result.province_code !== '' || addressData.result.province_name !== ''){
			var province_set = {
				preferred: addressData.result.province,
				code: addressData.result.province_code,
				name: addressData.result.province_name
			};
			if(typeof this.getCfg('onSetCounty') == 'function'){
				this.getCfg('onSetCounty')(this, this.activeDom, province_set);
			} else if(typeof this.activeDom.county != 'undefined'){
				this.setCounty(this.activeDom.county,province_set);
			}/* else {
				line_3.push( addressData.result.province_name );
			}*/
		}

		if(line_3.length){
			if(typeof this.activeDom.line_2 != 'undefined'){
				this.activeDom.line_2.value += ', '+line_3.join(', ');
			} else {
				this.activeDom.line_1.value += ', '+line_3.join(', ');
			}
		}

	}
	if(typeof this.getCfg('onResultSelected') == 'function'){
		addressData.result.country = this.validCountries[this.activeCountryId];
		this.getCfg('onResultSelected')(this, this.activeDom, addressData.result);
	}

	this.hide(true);
};
clickToAddress.prototype.setCounty = function(element, province){
	'use strict';
	if(element.tagName == 'SELECT'){
		var target_val = province.code;
		if(target_val === ''){
			target_val = province.name;
		}
		var options = element.getElementsByTagName('option');
		if(options.length){
			var found = 0;

			var province_name = removeDiacritics(province.name);
			var province_code = removeDiacritics(province.code);

			for(var i=0; i<options.length; i++){

				var option_content = removeDiacritics(options[i].innerHTML);
				var option_value = removeDiacritics(options[i].value);
				if(
					(
						option_content !== '' &&
						(
							option_content == province_name ||
							option_content == province_code
						)
					) ||
					(
						option_value !== '' &&
						(
							option_value == province_name ||
							option_value == province_code
						)
					)
				)
				{
					target_val = options[i].value;
					found++;
					break;
				}
			}
			if(!found){
				var province_text = province.name;
				if(province_text === ''){
					province_text = province.code;
				}
				var provinceMatchText = removeDiacritics(province_text);

				var bestMatch = {
					id: 0,
					rank: 0
				};
				for(var i=0; i<options.length; i++){
					var option_text = removeDiacritics(options[i].innerHTML);
					var rank = 0;
					for(var j=0; j < option_text.length && j < provinceMatchText.length; j++){
						if(option_text[j] == provinceMatchText[j]){
							rank++;
						}
					}
					if(rank > bestMatch.rank){
						bestMatch.rank = rank;
						bestMatch.id = i;
					}
				}
				if(bestMatch.rank > 0){
					target_val = options[bestMatch.id].value;
				}
			}
			element.value = target_val;
		}
	} else {
		var province_for_input = province.preferred;
		if(province_for_input == ''){
			province_for_input = province.name;
		}
		if(province_for_input == ''){
			province_for_input = province.code;
		}
		element.value = province_for_input;
	}
};
clickToAddress.prototype.showResults = function(full){
	'use strict';
	this.scrollPosition = 0;
	this.resetSelector();
	this.info('clear');
	var newHtml = '';
	var limit = this.searchResults.results.length - (this.scrollLimit * this.scrollPosition);
	for(var i=0; i<limit && i < this.scrollLimit; i++){
		newHtml += '<li></li>';
	}
	this.resultList.innerHTML = newHtml;
	var listElements = this.resultList.getElementsByTagName('li');
	this.resultList.scrollTop = 0;
	var that = this;
	for(var i=0; i<listElements.length && i < this.scrollLimit; i++){
		// add parts
		var row = this.searchResults.results[i];
		var content = '<div>';
		if(typeof row.labels[0] == 'string' && row.labels[0] !== '')
			content += '<span>'+row.labels[0]+'</span>';
		if(typeof row.labels[1] == 'string' && row.labels[1] !== '')
			content += '<span class="light">'+row.labels[1]+'</span>';
		if(typeof row.count == 'number' && row.count > 1)
			content += '<span class="light">('+row.count+' more)</span>';
		content += '</div>';
		listElements[i].innerHTML = content;
		listElements[i].setAttribute('title',row.labels.join(', '));
		// add attributes
		if(typeof row.count !== 'undefined' && typeof row.id !== 'undefined'){
			ccData(listElements[i],'id',row.id.toString());
			ccData(listElements[i],'count',row.count.toString());
			if(row.count != 1){
				listElements[i].className = 'cc-filter';
			}
		} else {
			throw 'server error';
		}
	}
	// add events
	for(var i=0; i<listElements.length; i++){
		ccEvent(listElements[i], 'click', function(){
			that.select(this);
		});
	}

	if(this.searchResults.results.length === 0){
		this.info('no-results');
		this.hasContent = false;
	} else {
		this.hasContent = true;
	}

};
clickToAddress.prototype.showResultsExtra = function(){
	'use strict';
	this.scrollPosition++;
	var currentPosition = (this.scrollLimit * this.scrollPosition);
	var newHtml = '';
	var limit = this.searchResults.results.length - currentPosition;
	for(var i=0; i<limit && i < this.scrollLimit; i++){
		newHtml += '<li></li>';
	}
	this.resultList.innerHTML += newHtml;
	var listElements = this.resultList.getElementsByTagName('li');
	var that = this;
	for(var i=currentPosition; i<listElements.length; i++){
		// add parts
		var row = this.searchResults.results[i];
		var content = '<div>';
		if(typeof row.labels[0] == 'string' && row.labels[0] !== '')
			content += '<span>'+row.labels[0]+'</span>';
		if(typeof row.labels[1] == 'string' && row.labels[1] !== '')
			content += '<span class="light">'+row.labels[1]+'</span>';
		if(typeof row.count == 'number' && row.count > 1)
			content += '<span class="light">('+row.count+' more)</span>';
		content += '</div>';
		listElements[i].innerHTML = content;
		listElements[i].setAttribute('title',row.labels.join(', '));
		// add attributes
		if(typeof row.count !== 'undefined' && typeof row.id !== 'undefined'){
			ccData(listElements[i],'id',row.id.toString());
			ccData(listElements[i],'count',row.count.toString());
			if(row.count != 1){
				listElements[i].className = 'cc-filter';
			}
		} else {
			throw 'server error';
		}
	}
	// add events
	for(var i=0; i<listElements.length; i++){
		ccEvent(listElements[i], 'click', function(){
			that.select(this);
		});
	}
}

clickToAddress.prototype.select = function(li){
	'use strict';
	this.resetSelector();
	this.cleanHistory();

	li.id = ccData(li, 'id');
	li.count = ccData(li, 'count');

	if(li.count === '1'){
		this.getAddressDetails(li.id);
		this.hide();
		this.loseFocus();
		return;
	}
	if(li.count !== '1'){
		this.sequence++;
		this.searchStatus.lastSearchId = this.sequence;
		var current_sequence = this.sequence;
		this.search(this.activeInput.value, li.id, current_sequence);
		this.getFocus();
		this.activeId = li.id;
		return;
	}
	if(li.className != 'deadend'){
		this.sequence++;
		this.searchStatus.lastSearchId = this.sequence;

		this.search(this.activeInput.value);
		this.getFocus();
		return;
	}
};
clickToAddress.prototype.getGeo = function(){
	'use strict';
	var that = this;
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position){
			that.coords = position.coords;
			that.showGeo();
		});
	}
};
// filter stands for the actual search input text here
clickToAddress.prototype.changeCountry = function(filter){
	'use strict';
	this.hideHistory();
	this.resetSelector();
	var newHtml = '';
	var limit = this.validCountries.length;
	for(var i=0; i<limit; i++){
		newHtml += '<li></li>';
	}
	this.resultList.innerHTML = newHtml;
	var listElements = this.resultList.getElementsByTagName('li');
	this.resultList.scrollTop = 0;
	var that = this;
	var skip = 0;
	for(var i=0; i<listElements.length; i++){
		// add parts
		var row = this.validCountries[i+skip];
		var content = '';
		if(typeof filter !== 'undefined' && filter !== ''){
			var matchFound = false;
			for(var j=0; !matchFound && j < Object.keys(row).length; j++){
				var rowElem = row[Object.keys(row)[j]];
				if(typeof rowElem == 'object' && Array.isArray(rowElem)){
					for(var k=0; !matchFound && k < rowElem.length; k++){
						var text = rowElem[k].toString().toLowerCase();
						if(text.indexOf(filter.toLowerCase()) === 0){
							matchFound = true;
						}
					}
				} else {
					var text = rowElem.toString().toLowerCase();
					if(text.indexOf(filter.toLowerCase()) === 0){
						matchFound = true;
					}
				}
			}
			if(matchFound){
				content = '<span class="cc-flag cc-flag-'+row.short_code+'"></span>'+'<span>'+row.country_name+'</span>';
			}
			else{
				listElements[i].parentNode.removeChild(listElements[i]);
				i--;
				skip++;
			}
		} else {
			var content = '<span class="cc-flag cc-flag-'+row.short_code+'"></span>'+'<span>'+row.country_name+'</span>';
		}
		if(content != ''){
			listElements[i].innerHTML = content;
			listElements[i].setAttribute('countryCode',row.code);
			that.hasContent = true;
			// add events
			ccEvent(listElements[i], 'click', function(){
				that.selectCountry(this.getAttribute('countryCode'));
			});
		}
	}
	this.searchStatus.inCountryMode = 1;
	this.getFocus();
};
clickToAddress.prototype.selectCountry = function(countryCode){
	'use strict';
	var that = this;
	this.clear();
	var selectedCountry = {};
	this.activeCountryId = 0;
	for(var i=0; i<this.validCountries.length; i++){
		if(this.validCountries[i].code == countryCode){
			selectedCountry = this.validCountries[i];
			this.activeCountryId = i;
			break;
		}
	}
	var countryObj = this.searchObj.getElementsByClassName('country_img')[0];
	countryObj.setAttribute('class','country_img cc-flag cc-flag-'+selectedCountry.short_code);
	if(!this.countrySelector){
		this.searchObj.getElementsByClassName('country_btn')[0].getElementsByTagName('span')[0].innerHTML = selectedCountry.country_name;
	}
	this.activeCountry = countryCode;
	that.searchStatus.inCountryMode = 0;
	this.getFocus();
	if(typeof this.activeInput.value != 'undefined' && typeof this.lastSearch != ''){
		this.activeInput.value = this.lastSearch;
		this.activeId = '';
		this.sequence++;
		this.searchStatus.lastSearchId = this.sequence;
		var current_sequence = this.sequence;
		setTimeout(function(){
			if(that.searchStatus.lastSearchId <= current_sequence){
				if(that.activeInput.value !== ''){
					that.search(that.activeInput.value, that.activeId, current_sequence);
					that.cleanHistory();
				} else {
					that.clear();
				}
			}
		},200);
		this.gfxModeTools.reposition(this, this.activeInput);
	}
	this.setHistoryStep();
	this.setPlaceholder(0);
};
clickToAddress.prototype.setCountryChange = function(){
	'use strict';
	// first cull the country list, if limitations are set
	if(this.enabledCountries.length !== 0){
		for(var i=0; i<this.validCountries.length; i++){
			// add parts
			var row = this.validCountries[i];
			switch(this.countryMatchWith){
				case 'iso_3':
					if(this.enabledCountries.indexOf(row.iso_3166_1_alpha_3) == -1){
						this.validCountries.splice(i, 1);
						i--;
					}
					break;
				case 'iso_2':
					if(this.enabledCountries.indexOf(row.iso_3166_1_alpha_2) == -1){
						this.validCountries.splice(i, 1);
						i--;
					}
					break;
				// match with any text
				default:
					this.error('JS401');
				case 'text':
					var matchFound = false;
					for(var j=0; !matchFound && j < Object.keys(row).length; j++){
						var rowElem = row[Object.keys(row)[j]];
						if(typeof rowElem != 'array'){
							var text = rowElem.toString().toLowerCase();
							for(var k=0; k < this.enabledCountries.length; k++){
								if(text.indexOf(this.enabledCountries[k].toLowerCase()) === 0){
									matchFound = true;
								}
							}
						} else {
							for(var k=0; k < this.enabledCountries.length; k++){
								for(var l=0; l < rowElem.length; l++){
									if(text.indexOf(this.enabledCountries[k].toLowerCase()) === 0){
										matchFound = true;
									}
								}
							}
						}
					}
					if(!matchFound){
						this.validCountries.splice(i, 1);
						i--;
					}
					break;
			}

		}
	}
	if(this.validCountries.length == 0){
		throw 'No valid countries left in the country list!';
	}

	if(this.countrySelector){
		var countryObj = this.searchObj.getElementsByClassName('country_btn')[0];
		var that = this;
		ccEvent(countryObj, 'click', function(){
			if(that.searchStatus.inCountryMode === 0){
				that.setPlaceholder(1);
				that.changeCountry();
				that.activeInput.value = '';
				that.hasContent = true;
				that.info();
			} else {
				that.setPlaceholder(0);
				that.searchStatus.inCountryMode = 0;
				that.hide(true);
				that.getFocus();
				that.hover = true;
			}
		});
	}
};
