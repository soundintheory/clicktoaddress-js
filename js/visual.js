clickToAddress.prototype.setPlaceholder = function(country, target){
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
}
clickToAddress.prototype.error = function(code, message){
	if(cc_debug){
		console.warn('CraftyClicks Debug Error Message: ['+code+'] '+message);
	}
	if(this.serviceReady == -1){
		this.errorObj.innerHTML = message;
	} else {
		this.errorObj.innerHTML = this.texts.generic_error;
	}
	this.errorObj.className = 'c2a_error';

	if(typeof this.onError != 'undefined'){
		this.onError(code, message);
	}
}
clickToAddress.prototype.hideErrors = function(){
	if(this.serviceReady != -1){
		this.errorObj.innerHTML = '';
		this.errorObj.className = 'c2a_error c2a_error_hidden';
	}
}
clickToAddress.prototype.getFocus = function(){
	if(this.activeInput != 'init')
		this.activeInput.focus();
	this.focused = true;
};

clickToAddress.prototype.loseFocus = function(){
	if(this.activeInput != 'init')
		this.activeInput.blur();
	this.focused = false;
};
clickToAddress.prototype.clear = function(){
	this.resultList.innerHTML = '';
	this.sid = 0;
};
clickToAddress.prototype.show = function(){
	this.searchObj.style.display = 'block';
	this.visible = true;
};
clickToAddress.prototype.hide = function(force_it){
	if (this.keyboardHideInProgress){
		this.keyboardHideInProgress = false;
		return;
	}
	if (force_it ||(this.visible && !this.focused && !this.hover)){
		this.searchObj.style.display = 'none';
		this.visible = false;
		this.hover = false;
		this.clear();
		this.resetSelector();

		this.setPlaceholder(0);
	}
	this.hideErrors();
};
clickToAddress.prototype.attach = function(dom){
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
	switch(this.domMode){
		case 'id':
			var quickGet = function(dom, obj_name){
				if(typeof dom[obj_name] == 'string' && dom[obj_name] !== ''){
					return document.getElementById(dom[obj_name]);
				}
			}
			for(var i = 0; i < objectArray.length; i++){
				domElements[objectArray[i]] = quickGet(dom, objectArray[i]);
			}
			break;
		case 'class':
			var quickGet = function(dom, obj_name){
				if(typeof dom[obj_name] == 'string' && dom[obj_name] !== ''){
					return document.getElementsByClassName(dom[obj_name])[0];
				}
			}
			for(var i = 0; i < objectArray.length; i++){
				domElements[objectArray[i]] = quickGet(dom, objectArray[i]);
			}
			break;
		case 'name':
			var quickGet = function(dom, obj_name){
				if(typeof dom[obj_name] == 'string' && dom[obj_name] !== ''){
					return document.getElementsByName(dom[obj_name])[0];
				}
			}
			for(var i = 0; i < objectArray.length; i++){
				domElements[objectArray[i]] = quickGet(dom, objectArray[i]);
			}
			break;
		case 'object':
			var quickGet = function(dom, obj_name){
				if(typeof dom[obj_name] == 'object' && dom[obj_name] !== null){
					return dom[obj_name];
				}
			}
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
	target.setAttribute('autocomplete','off');
	this.setPlaceholder(0, target);
	// store the new element's position
	var domLibId = this.domLib.length;
	this.domLib.push(domElements);

	var that = this;
	ccEvent(target, 'keydown', function(e){
		if(that.serviceReady == 0)
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
		if(that.serviceReady == 0)
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
			if(that.sid == -1){
				that.selectCountry(elem.getAttribute('countryCode'));
			} else {
				that.select(elem);
			}
			return;
		}
		if(that.sid == -1){
			that.changeCountry(this.value);
		} else {
			that.activeFilters = {};
			that.lastSearch = this.value;

			var timeTrack = new Date().getTime() / 1000;
			that.sid = timeTrack;
			var searchVal = this.value;
			setTimeout(function(){
				if(that.sidCheck(timeTrack)){
					if(searchVal !== ''){
						that.search(searchVal, that.activeFilters, timeTrack);
						that.cleanHistory();
					} else {
						that.clear();
					}
				}
			},250);

			that.activeDom = that.domLib[domLibId];
			that.gfxModeTools.reposition(that, target);
		}
	});
	ccEvent(target, 'focus', function(){
		that.onFocus(target);
	});
	ccEvent(target, 'blur', function(){
		if(that.serviceReady == 0)
			return;
		that.focused = false;
		that.hide();
	});
	if(target === document.activeElement){
		this.onFocus(target);
	}
};
clickToAddress.prototype.onFocus = function(target){
	var that = this;
	if(that.serviceReady == 0){
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
		that.search(target.value);
	}
}
clickToAddress.prototype.resetSelector = function(){
	this.hasContent = false;
	this.selectorPos = -1;
};
clickToAddress.prototype.moveSelector = function(goDown){
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
	this.searchObj.getElementsByClassName('geo')[0].style.display = 'block';
};
clickToAddress.prototype.hideKeyboard = function(){
	// this code is for phones to hide the keyboard.
	var that = this;
	that.keyboardHideInProgress = true;
	that.activeInput.setAttribute('readonly', 'readonly'); // Force keyboard to hide on input field.
	that.activeInput.setAttribute('disabled', 'true'); // Force keyboard to hide on textarea field.
	setTimeout(function() {
		that.activeInput.blur();	//actually close the keyboard
		// Remove readonly attribute after keyboard is hidden.
		that.activeInput.removeAttribute('readonly');
		that.activeInput.removeAttribute('disabled');
	}, 100);
};
clickToAddress.prototype.getStyleSheet = function(){
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
