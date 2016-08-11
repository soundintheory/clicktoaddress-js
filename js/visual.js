clickToAddress.prototype.setPlaceholder = function(country, target){
	'use strict';
	if(this.activeInput != 'init'){
		target = this.activeInput;
	}
	if(this.placeholders && typeof target != 'undefined'){
		var text = this.texts.default_placeholder;
		if(country){
			text = this.texts.country_placeholder;
		}
		target.setAttribute('placeholder', text);
	}
};
clickToAddress.prototype.getFocus = function(){
	'use strict';
	if(this.activeInput != 'init'){
		this.activeInput.focus();
	}
	this.focused = true;
};

clickToAddress.prototype.loseFocus = function(){
	'use strict';
	if(this.activeInput != 'init'){
		this.activeInput.blur();
	}
	this.focused = false;
};
clickToAddress.prototype.clear = function(){
	'use strict';
	this.resultList.innerHTML = '';
	this.searchStatus = {
		lastSearchId: 0,
		lastResponseId: 0,
		inCountryMode: 0
	};
};
clickToAddress.prototype.show = function(){
	'use strict';
	this.searchObj.style.display = 'block';
	this.visible = true;
	this.setHistoryStep();

	if(this.activeInput != 'init'){
		this.activeInput.setAttribute('autocomplete','off');
	}
};
clickToAddress.prototype.hide = function(force_it){
	'use strict';
	if (this.keyboardHideInProgress){
		this.keyboardHideInProgress = false;
		return;
	}
	if (force_it ||(this.visible && !this.focused && !this.hover)){
		this.searchObj.style.display = 'none';
		this.visible = false;
		this.hover = false;
		// return input state, in case it was in country mode
		if(this.searchStatus.inCountryMode && typeof this.lastSearch !== 'undefined'){
			this.activeInput.value = this.lastSearch;
		}
		this.clear();
		this.cachePos = -1;
		this.resetSelector();
		this.setPlaceholder(0);

		if(this.activeInput != 'init'){
			this.activeInput.className = this.activeInput.className.replace(" c2a_active", "");
			this.activeInput.setAttribute('autocomplete','on');
		}
	}
	this.hideErrors();
};
clickToAddress.prototype.attach = function(dom, cfg){
	var cfg = cfg || {};
	'use strict';
	var domElements = {};
	var objectArray = [
		'search',
		'postcode',
		'town',
		'line_1',
		'line_2',
		'company',
		'county',
		'country'
	];
	var quickGet = null;
	switch(this.domMode){
		case 'id':
			quickGet = function(dom, obj_name){
				if(typeof dom[obj_name] == 'string' && dom[obj_name] !== ''){
					return document.getElementById(dom[obj_name]);
				}
			};
			for(var i = 0; i < objectArray.length; i++){
				domElements[objectArray[i]] = quickGet(dom, objectArray[i]);
			}
			break;
		case 'class':
			quickGet = function(dom, obj_name){
				if(typeof dom[obj_name] == 'string' && dom[obj_name] !== ''){
					return document.getElementsByClassName(dom[obj_name])[0];
				}
			};
			for(var i = 0; i < objectArray.length; i++){
				domElements[objectArray[i]] = quickGet(dom, objectArray[i]);
			}
			break;
		case 'name':
			quickGet = function(dom, obj_name){
				if(typeof dom[obj_name] == 'string' && dom[obj_name] !== ''){
					return document.getElementsByName(dom[obj_name])[0];
				}
			};
			for(var i = 0; i < objectArray.length; i++){
				domElements[objectArray[i]] = quickGet(dom, objectArray[i]);
			}
			break;
		case 'object':
			quickGet = function(dom, obj_name){
				if(typeof dom[obj_name] == 'object' && dom[obj_name] !== null){
					return dom[obj_name];
				}
			};
			for(var i = 0; i < objectArray.length; i++){
				domElements[objectArray[i]] = quickGet(dom, objectArray[i]);
			}
			break;
	}

	var target = domElements.search;
	if(target.getAttribute('cc_applied') == 'true'){
		throw('ClickToAddress already applied to this element!');
	}
	target.setAttribute('cc_applied', 'true');
	this.setPlaceholder(0, target);
	// store the new element's position
	domElements.config = cfg;
	var domLibId = this.domLib.length;
	this.domLib.push(domElements);

	var that = this;
	ccEvent(target, 'keydown', function(e){
		if(that.serviceReady === 0)
			return;
		// up down
		if (e.keyCode == 38 || e.keyCode == 40){
			e.preventDefault();
			if(!that.hasContent){
				return;
			}
			that.moveSelector(e.keyCode == 40);
			return;
		}
		// enter
		if (e.keyCode == 13){
			e.preventDefault();
		}
	});
	ccEvent(target, 'keyup', function(e){
		if(that.serviceReady === 0)
			return;
		// escape
		if (e.keyCode == 27){
			that.hide(true);
			that.loseFocus();
			that.resetSelector();
			return;
		}
		var noActionKeys = [
			37, // left
			38, // up
			39, // right
			40, // down
			33, // page up
			34, // page down
			35, // end
			36, // home
			42, // print screen
			44, // print screen on older browsers?
			45, // insert
			16, // shift
			17, // ctrl
			18, // alt
			19, // pause / break
			20  // caps
		];
		if (noActionKeys.indexOf(e.keyCode) != -1){
			return;
		}
		// enter
		if (e.keyCode == 13){
			e.preventDefault();
			if(!that.hasContent || that.selectorPos < 0){
				return;
			}
			var elem = that.searchObj.getElementsByTagName('LI')[that.selectorPos];
			if(that.searchStatus.inCountryMode == 1){
				that.selectCountry(elem.getAttribute('countryCode'));
			} else {
				that.select(elem);
			}
			return;
		}
		if(that.searchStatus.inCountryMode == 1){
			that.changeCountry(this.value);
		} else {
			if(that.getCfg('disableAutoSearch')){
				return;
			}
			if(this.value.indexOf(that.lastSearch) !== 0){
				that.activeId = '';
			}
			that.lastSearch = this.value;

			that.sequence++;
			that.searchStatus.lastSearchId = that.sequence;
			var current_sequence_number = that.sequence;
			var searchVal = this.value;
			setTimeout(function(){
				if(that.searchStatus.lastSearchId <= current_sequence_number){
					if(searchVal !== ''){
						that.cleanHistory();
						that.search(searchVal, that.activeId, current_sequence_number);
					} else {
						that.clear();
					}
				}
			},200);

			that.activeDom = that.domLib[domLibId];
			that.gfxModeTools.reposition(that, target);
		}
	});
	ccEvent(target, 'focus', function(){
		that.activeDom = that.domLib[domLibId];
		that.onFocus(target);

		if(typeof that.getCfg('onSearchFocus') == 'function'){
			that.getCfg('onSearchFocus')(that, that.activeDom);
		}
	});
	ccEvent(target, 'blur', function(){
		if(that.serviceReady === 0)
			return;
		that.focused = false;
		that.hide();
	});
	ccEvent(target, 'c2a-search', function(){
		that.show();
		if(that.searchStatus.inCountryMode == 1){
			that.changeCountry(this.value);
		} else {
			if(this.value.indexOf(that.lastSearch) !== 0){
				that.activeId = '';
			}
			that.lastSearch = this.value;

			that.sequence++;
			that.searchStatus.lastSearchId = that.sequence;
			var current_sequence_number = that.sequence;
			var searchVal = this.value;
			setTimeout(function(){
				if(that.searchStatus.lastSearchId <= current_sequence_number){
					if(searchVal !== ''){
						that.cleanHistory();
						that.search(searchVal, that.activeId, current_sequence_number);
					} else {
						that.clear();
					}
				}
			},200);

			that.activeDom = that.domLib[domLibId];
			that.gfxModeTools.reposition(that, target);
		}
	})
	if(target === document.activeElement){
		this.onFocus(target);
	}
};
clickToAddress.prototype.onFocus = function(target){
	'use strict';
	var that = this;
	if(that.serviceReady === 0){
		setTimeout(function(){
			that.onFocus(target);
		}, 250);
		return;
	}
	var prestate = that.visible;
	that.gfxModeTools.reposition(that, target);
	that.activeInput = target;
	that.focused = true;
	that.show();
	if(target.value !== '' && !prestate){
		that.sequence++;
		that.searchStatus.lastSearchId = that.sequence;
		that.lastSearch = target.value;
		that.search(target.value, that.activeId, that.sequence);
	}
}
clickToAddress.prototype.resetSelector = function(){
	'use strict';
	this.hasContent = false;
	this.selectorPos = -1;
};
clickToAddress.prototype.moveSelector = function(goDown){
	'use strict';
	if(!this.visible){
		return;
	}
	var elems = this.searchObj.getElementsByTagName('LI');
	if(goDown && (this.selectorPos + 1 < elems.length)){
		this.selectorPos++;
	}
	if(!goDown && (this.selectorPos - 1 >= 0)){
		this.selectorPos--;
	}
	for(var i=0; i<elems.length; i++){
		if(i != this.selectorPos){
			elems[i].className = elems[i].className.replace(' active','');
		} else {
			if(elems[i].className.indexOf('active') == -1){
				elems[i].className = elems[i].className + ' active';
			}
		}
	}
	// check if element is visible
	var offset = 30 * (this.selectorPos + 1);
	var list = this.searchObj.getElementsByTagName('UL')[0];
	if(offset > list.offsetHeight + list.scrollTop){
		list.scrollTop = offset - list.offsetHeight;
	}
	if(offset <= list.scrollTop){
		list.scrollTop = offset - 30;
	}

};

clickToAddress.prototype.showGeo = function(){
	'use strict';
	this.searchObj.getElementsByClassName('geo')[0].style.display = 'block';
};
clickToAddress.prototype.hideKeyboard = function(){
	'use strict';
	// this code is for phones to hide the keyboard.
	var that = this;
	that.keyboardHideInProgress = true;
	that.activeInput.setAttribute('readonly', 'readonly'); // Force keyboard to hide on input field.
	that.activeInput.setAttribute('disabled', 'true'); // Force keyboard to hide on textarea field.
	setTimeout(function() {
		that.activeInput.blur();	//actually close the keyboard
		// Remove attributes after keyboard is hidden.
		that.activeInput.removeAttribute('readonly');
		that.activeInput.removeAttribute('disabled');
	}, 100);
};
clickToAddress.prototype.getStyleSheet = function(){
	'use strict';
	if(this.cssPath === false){
		return;
	}
	var cssId = 'crafty_css';
	if (!document.getElementById(cssId))
	{
		var head	= document.getElementsByTagName('head')[0];
		var link	= document.createElement('link');
		link.id	 = cssId;
		link.rel	= 'stylesheet';
		link.type = 'text/css';
		link.href = this.cssPath;
		link.media = 'all';
		head.appendChild(link);
	}
};
clickToAddress.prototype.setProgressBar = function(state){
	'use strict';
	var pgbar = this.searchObj.getElementsByClassName('progressBar')[0];
	switch(state){
		case 0:
			pgbar.className = 'progressBar action';
			pgbar.style.width = '50%';
			setTimeout(function(){
				if(pgbar.className == 'progressBar action'){
					pgbar.className = 'progressBar';
					pgbar.style.width = '0%';
				}
			},5000);
			break;
		case 1:
			pgbar.className = 'progressBar finish';
			pgbar.style.width = '100%';
			setTimeout(function(){
				pgbar.className = 'progressBar';
				pgbar.style.width = '0%';
			},2000);
			break;
	}
};
clickToAddress.prototype.triggerSearch = function(target){
	'use strict';
	var that = this;
	if(that.serviceReady === 0){
		setTimeout(function(){
			that.triggerSearch(target);
		}, 250);
		return;
	}
	var event = document.createEvent('Event');
	event.initEvent('c2a-search', true, true);
	target.dispatchEvent(event);
}
