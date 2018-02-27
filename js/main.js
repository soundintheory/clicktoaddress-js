function clickToAddress(config){
	'use strict';
	var that = this;
	if(document.getElementById('cc_c2a') !== null){
		throw 'Already initiated';
	}
	if(typeof that == 'undefined' || typeof that.preset == 'undefined'){
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
			var isValidCountry = function(country, validCountries){
				for(var i=0; i < validCountries.length; i++){
					if( validCountries[i].code == country){
						return true;
					}
				}
				return false;
			};
			var country = null;
			if(that.validCountries.length){
				// fallback to first valid country
				country = that.validCountries[0].code;

				// first try to set the country to the default one
				if(isValidCountry(that.defaultCountry,that.validCountries)){
					country = that.defaultCountry;
				}
				// then, override the default, if the current GeoLocation is available & the country is enabled.
				if(that.getIpLocation && that.ipLocation !== '' && isValidCountry(that.ipLocation, that.validCountries)){
					country = that.ipLocation;
				}

			} else {
				throw 'Incorrect country configuration.';
			}
			that.selectCountry(country);
		}
	);
	if(that.searchObj.getElementsByClassName("cc-history").length){
		that.setHistoryActions();
	}
	// apply events
	this.tools.ccEvent(that.searchObj, 'mouseover',function(){
		that.hover = true;
	});
	this.tools.ccEvent(that.searchObj, 'mouseout',function(){
		that.hover = false;
	});
	this.tools.ccEvent(document, 'click', function(){
		that.hide();
	});
	this.tools.ccEvent(window, 'scroll', function(){
		if(that.visible && that.focused){
			setTimeout(function(){
				that.gfxModeTools.reposition(that, that.activeInput);
			},100);
			//that.hideKeyboard();
		}
	});
	this.tools.ccEvent(window, 'resize', function(){
		if(that.visible){
			setTimeout(function(){
				that.gfxModeTools.reposition(that, that.activeInput);
			},100);
		}
	});
	/* TODO: SCROLL */
	this.tools.ccEvent(that.resultList, 'scroll', function(){
		var scrollTop = parseInt(this.scrollTop);
		var innerHeight = parseInt(window.getComputedStyle(this, null).getPropertyValue("height"));
		if(that.searchStatus.inCountryMode != 1 && parseInt(this.scrollHeight) !== 0 && scrollTop + innerHeight >= (parseInt(this.scrollHeight) * 0.8)){
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
	that.tools.__$styleInject('#cc_c2a ul.c2a_results li.cc-hidden{ display: none; }');

	if(that.transliterate){
		that.addTransl();
	}
	if(that.debug){
		that.start_debug();
	}

	if(that.key == 'xxxxx-xxxxx-xxxxx-xxxxx'){
		that.info('pre-trial');
	}
	if(typeof config.dom != 'undefined'){
		that.attach(config.dom);
	}
}
clickToAddress.prototype.fillData = function(addressDataResult){
	'use strict';
	var addressData = null;
	/* to ensure we don't modify the original returned data,
	 * we preform a deep-copy here, otherwise it would create issues while toggling transl
	 */
	if(this.transliterate && typeof this.transl === "function"){
		var resultKeys = Object.keys(addressDataResult);
		addressData = {};
		for(var k=0; k<resultKeys.length; k++){
			addressData[resultKeys[k]] = this.transl(addressDataResult[resultKeys[k]]);
		}
	} else {
		addressData = addressDataResult;
	}
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

		if(addressData.line_1 === '' && addressData.company_name !== ''){
			addressData.line_1 = addressData.company_name;
		}

		this.activeDom.line_1.value = addressData.line_1;
		if(typeof this.activeDom.line_2 != 'undefined'){
			this.activeDom.line_2.value = addressData.line_2;
		} else {
			if(addressData.line_2 !== ''){
				line_3.push( addressData.line_2 );
			}
		}
		if(addressData.company_name !== ''){
			if(typeof this.activeDom.company != 'undefined'){
				this.activeDom.company.value = addressData.company_name;
				this.lastSearchCompanyValue = addressData.company_name;
			} else {
				this.activeDom.line_1.value = addressData.company_name + ', ' + this.activeDom.line_1.value;
			}
		} else {
			if(typeof this.activeDom.company != 'undefined'){
				if(this.lastSearchCompanyValue !== '' && this.activeDom.company.value == this.lastSearchCompanyValue){
					this.activeDom.company.value = '';
				}
				this.lastSearchCompanyValue = '';
			}
		}

		if(typeof this.activeDom.postcode != 'undefined'){
			this.activeDom.postcode.value = addressData.postal_code;
		} else {
			line_3.push(addressData.postal_code);
		}

		if(typeof this.activeDom.town != 'undefined'){
			if(addressData.locality !== ''){
				this.activeDom.town.value = addressData.locality;
			} else {
				this.activeDom.town.value = addressData.dependent_locality;
			}
		} else {
			if(addressData.locality !== ''){
				line_3.push(addressData.locality);
			} else {
				line_3.push(addressData.dependent_locality);
			}
		}

		if(addressData.province_code !== '' || addressData.province_name !== ''){
			var province_set = {
				preferred: addressData.province,
				code: addressData.province_code,
				name: addressData.province_name
			};
			if(typeof this.getCfg('onSetCounty') == 'function'){
				this.getCfg('onSetCounty')(this, this.activeDom, province_set);
			} else if(typeof this.activeDom.county != 'undefined'){
				this.setCounty(this.activeDom.county,province_set);
			}/* else {
				line_3.push( addressData.province_name );
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
		try{
			addressData.country = this.validCountries[this.activeCountryId];
			this.getCfg('onResultSelected')(this, this.activeDom, addressData);
		} catch(e){
			this.error('JS504');
		}
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

			var province_name = this.tools.removeDiacritics(province.name);
			var province_code = this.tools.removeDiacritics(province.code);

			for(var i=0; i<options.length; i++){

				var option_content = this.tools.removeDiacritics(options[i].innerHTML);
				var option_value = this.tools.removeDiacritics(options[i].value);
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
				var provinceMatchText = this.tools.removeDiacritics(province_text);
				// longest common substring + most character match

				var matches = {
					rank: 0,
					ids: []
				};

				// iterate through all possible matches (longest common substring)
				for(var i=0; i<options.length; i++){
					var option_text = this.tools.removeDiacritics(options[i].innerHTML);
					var highestRank = 0;

					var rankTable = [];
					for(var j=0; j<provinceMatchText.length; j++){
						rankTable[j] = [];

						for(var k=0; k < option_text.length; k++){
							if(provinceMatchText[j] == option_text[k]){
								if(j > 0 && k > 0){
									rankTable[j][k] = rankTable[j-1][k-1] + 1;
								} else {
									rankTable[j][k] = 1;
								}
								if(rankTable[j][k] > highestRank){
									highestRank = rankTable[j][k];
								}
							} else {
								rankTable[j][k] = 0;
							}
						}
					}
					// reset ids if new record
					if(matches.rank < highestRank){
						matches.rank = highestRank;
						matches.ids = [];
					}
					// if we're on the same rank, add new id
					if(matches.rank == highestRank){
						matches.ids.push(i);
					}
				}
				// end of reviewing every word with longest common string algorithm.
				if(matches.ids.length > 1){
					// check how many characters match in total
					var characterDifferences = function(a,b){
						var aTable = {};
						var bTable = {};
						// generate a list of each character's occurence in the string
						for(var i=0; i<a.length; i++){
							if(typeof aTable[a[i]] == 'undefined')
								aTable[a[i]] = 1;
							else {
								aTable[a[i]]++;
							}
						}
						for(var i=0; i<b.length; i++){
							if(typeof bTable[b[i]] == 'undefined')
								bTable[b[i]] = 1;
							else {
								bTable[b[i]]++;
							}
						}
						// compare occurances
						var totalScore = 0;
						var aKeys = Object.keys(aTable);
						for(var i=0; i<aKeys.length; i++){
							if(typeof bTable[aKeys[i]] == 'undefined'){
								totalScore += aTable[aKeys[i]];
							} else {
								totalScore += Math.abs(aTable[aKeys[i]] - bTable[aKeys[i]]);
								delete bTable[aKeys];
							}
						}
						var bKeys = Object.keys(bTable);
						for(var i=0; i<bKeys.length; i++){
							totalScore += bTable[bKeys[i]];
						}
						return totalScore;
					}
					// there are some options contesting!
					var charMatch = {
						id: 0,
						rank: 1000
					};
					for(var i=0; i<matches.ids.length; i++){
						var r = characterDifferences(this.tools.removeDiacritics(options[matches.ids[i]].innerHTML), provinceMatchText);
						if(r<charMatch.rank){
							charMatch.rank = r;
							charMatch.id = i;
						}
					}
					target_val = options[matches.ids[charMatch.id]].value;

				} else {
					target_val = options[matches.ids[0]].value;
				}
			}
			element.value = target_val;
		}
	} else {
		// set to preferred
		var province_for_input = province.preferred;
		if(province_for_input === ''){
			province_for_input = province.name;
		}
		if(province_for_input === ''){
			province_for_input = province.code;
		}
		element.value = province_for_input;
	}
};
clickToAddress.prototype.showResults = function(full){
	'use strict';
	var _cs = this;
	_cs.scrollPosition = 0;
	_cs.resetSelector();
	_cs.info('clear');
	_cs.resultList.innerHTML = '';
	for(var i=0; i<_cs.searchResults.results.length; i++){
		// add parts
		var row = _cs.searchResults.results[i];
		if(typeof row.count == 'undefined' || typeof row.id == 'undefined'){
			throw 'server error';
		}

		var labels = [];
		var hover_label = row.labels.join(', ');

		for(var j=0; j<row.labels.length; j++){
			if(_cs.transliterate && typeof _cs.transl === "function"){
				labels.push(_cs.transl(row.labels[j]));
			} else {
				labels.push(row.labels[j]);
			}
		}
		var content = '<div>';
		if(typeof labels[0] == 'string' && labels[0] !== '')
		content += '<span>'+labels[0]+'</span>';
		if(typeof labels[1] == 'string' && labels[1] !== '')
		content += '<span class="light">'+labels[1]+'</span>';
		if(typeof row.count == 'number' && row.count > 1)
		content += '<span class="light">'+_cs.texts.more.replace("{{value}}",row.count)+'</span>';
		content += '</div>';
		// add attributes
		var new_elem = document.createElement("LI");
		new_elem.innerHTML = content;
		_cs.tools.ccData(new_elem, 'id', row.id.toString());
		_cs.tools.ccData(new_elem, 'count', row.count.toString());
		new_elem.setAttribute('title',hover_label);
		if(row.count != 1){
			_cs.tools.addClass(new_elem, 'cc-filter');
		}
		if(i >= _cs.scrollLimit){
			_cs.tools.addClass(new_elem, 'cc-hidden');
		}
		_cs.resultList.appendChild(new_elem);
	}
	_cs.resultList.scrollTop = 0;
	var listElements = _cs.resultList.getElementsByTagName('li');
	// add events
	for(var i=0; i<listElements.length; i++){
		_cs.tools.ccEvent(listElements[i], 'click', function(){
			_cs.select(this);
		});
	}

	if(_cs.searchResults.results.length === 0){
		_cs.info('no-results');
		_cs.hasContent = false;
	} else {
		_cs.hasContent = true;
	}

};
clickToAddress.prototype.showResultsExtra = function(){
	'use strict';
	var _cs = this;
	var listElements = _cs.resultList.getElementsByClassName('cc-hidden');
	for(var i=0; i<_cs.scrollLimit && i<listElements.length; i++){
		_cs.tools.removeClass(listElements[i], 'cc-hidden');
	}
}

clickToAddress.prototype.select = function(li){
	'use strict';
	this.resetSelector();
	this.cleanHistory();

	li.id = this.tools.ccData(li, 'id');
	li.count = this.tools.ccData(li, 'count');

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
			this.tools.ccEvent(listElements[i], 'click', function(){
				that.selectCountry(this.getAttribute('countryCode'));
			});
		}
	}
	this.searchStatus.inCountryMode = 1;
	this.getFocus();
};
clickToAddress.prototype.selectCountry = function(countryCode, skipSearch){
	'use strict';
	var skipSearch = skipSearch || false;
	var that = this;
	this.clear();
	var selectedCountry = {};
	this.activeCountryId = 0;
	for(var i=0; i<this.validCountries.length; i++){
		if(this.validCountries[i].code == countryCode){
			this.activeCountryId = i;
			break;
		}
	}
	// safely capture the active country
	selectedCountry = this.validCountries[this.activeCountryId];
	if(this.countrySelectorOption !== 'hidden'){
		var countryObj = this.searchObj.getElementsByClassName('country_img')[0];
		countryObj.setAttribute('class','country_img cc-flag cc-flag-'+selectedCountry.short_code);
		if(this.countrySelectorOption == 'disabled'){
			this.searchObj.getElementsByClassName('country_btn')[0].getElementsByTagName('span')[0].innerHTML = selectedCountry.country_name;
		}
	}
	this.activeCountry = countryCode;
	that.searchStatus.inCountryMode = 0;
	this.getFocus();

	if(!skipSearch && typeof this.activeInput.value != 'undefined' && typeof this.lastSearch != ''){
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
	var finalValidCountries = [];
	if(this.enabledCountries.length !== 0){
		for(var iEC=0; iEC<this.enabledCountries.length; iEC++){
			var enabledCountryTestString = this.enabledCountries[iEC];
			var exactMatch = null;
			var partialMatch = [];

			for(var iVC=0; iVC<this.validCountries.length; iVC++){
				if(finalValidCountries.indexOf(iVC) !== -1){
					continue;
				}
				var row = this.validCountries[iVC];

				switch(this.countryMatchWith){
					case 'iso_3':
						if(enabledCountryTestString == row.iso_3166_1_alpha_3){
							exactMatch = iVC;
						}
						break;
					case 'iso_2':
						if(enabledCountryTestString == row.iso_3166_1_alpha_2){
							exactMatch = iVC;
						}
						break;
					case 'code':
						var testArray = [
							row.code.toUpperCase(),
							row.short_code.toUpperCase()
						];
						if(testArray.indexOf(enabledCountryTestString) !== -1){
							exactMatch = iVC;
						}
						break;
					// match with any text
					default:
						this.error('JS401');
					case 'text':
						for(var j=0; !exactMatch && j < Object.keys(row).length; j++){
							var rowElem = row[Object.keys(row)[j]];
							if(typeof rowElem == 'string' || typeof rowElem == 'number'){
								var text = rowElem.toString().toUpperCase();

								if(text.indexOf(enabledCountryTestString) === 0){
									if(text == enabledCountryTestString){
										exactMatch = iVC;
									} else if(partialMatch.indexOf(iVC) == -1){
										partialMatch.push(iVC);
									}
								}
							} else {
								for(var l=0; l < rowElem.length; l++){
									var text = rowElem[l].toString().toUpperCase();
									if(text.indexOf(enabledCountryTestString) === 0){
										if(text == enabledCountryTestString){
											exactMatch = iVC;
										} else if(partialMatch.indexOf(iVC) == -1){
											partialMatch.push(iVC);
										}
									}
								}
							}
						}
						break;
				}
			}
			// remove exact matches
			if(exactMatch !== null){
				finalValidCountries.push(exactMatch);
			} else if(partialMatch.length > 0){
				for(var iPM=0; iPM < partialMatch.length; iPM++){
					finalValidCountries.push(partialMatch[iPM]);
				}
			}
			// reset
			exactMatch = null;
			partialMatch = [];
		}
		// set the validCountries
		var offset = 0;
		for(var iVC = 0; iVC < this.validCountries.length; iVC++){
			if(finalValidCountries.indexOf(iVC+offset) == -1){
				this.validCountries.splice(iVC, 1);
				offset++;
				iVC--;
			}
		}
	}
	if(this.validCountries.length === 0){
		throw 'No valid countries left in the country list!';
	}

	if(this.countrySelectorOption == 'enabled'){
		var countryObj = this.searchObj.getElementsByClassName('country_btn')[0];
		var that = this;
		this.tools.ccEvent(countryObj, 'click', function(){
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
