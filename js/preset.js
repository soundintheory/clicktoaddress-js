
// *
// * Simple function to set texts
// *
clickToAddress.prototype.setupText = function(textCfg){
	'use strict';
	this.texts = {
		default_placeholder: 'Start with post/zip code or street',
		country_placeholder: 'Type here to search for a country',
		country_button: 'Change Country',
		generic_error: 'An error occured. Please enter your address manually',
		no_results: 'No results found'
		//geocode: 'Your search results are prioritised based on your location.',
	};
	if(typeof textCfg != 'undefined'){
		var keys = Object.keys(this.texts);
		for(var i=0; i<keys.length; i++){
			if(typeof textCfg[keys[i]] != 'undefined' && textCfg[keys[i]] !== ''){
				this.texts[keys[i]] = textCfg[keys[i]];
			}
		}
	}
};

// *
// * Simple function to set default values
// *
clickToAddress.prototype.setCfg = function(config, name, defaultValue, cfgValue){
	'use strict';
	defaultValue = defaultValue || false;
	cfgValue = cfgValue || false;
	if(!cfgValue){
		cfgValue = name;
	}
	if(typeof config[cfgValue] != 'undefined' && config[cfgValue] !== ''){
		this[name] = config[cfgValue];
	} else {
		this[name] = defaultValue;
	}
};

clickToAddress.prototype.getCfg = function(name){
	if(typeof this.activeDom.config !== 'undefined' && typeof this.activeDom.config[name] !== 'undefined'){
		return this.activeDom.config[name];
	} else {
		return this[name];
	}
};

clickToAddress.prototype.preset = function(config){
	'use strict';
	// *
	// * MAIN OBJECTS
	// * These objects are store internal statuses. Do not modify any variable here.
	// *
	this.jsVersion = '@@version';
	this.serviceReady = 0;
	// set active country
	this.activeCountry = '';
	// is the mouse currently over the dropdown
	this.hover = false;
	// is the dropdown visible
	this.visible = false;
	// is the input box focused
	this.focused = false;
	this.hasContent = false;

	this.keyboardHideInProgress = false;
	// geocoords
	this.coords = 0;
	// what's the currently active elements (to search by and fill into?)
	this.activeDom = {};
	// storage for all the elements the search is attached to
	this.domLib = [];
	// current results
	this.searchResults = {};
	// the dropdown object itself
	this.searchObj = {};
	this.selectorPos = -1;
	// the currently active search input
	this.activeInput = 'init';
	// last activity (for timeout purposes)
	this.searchStatus = {
		lastSearchId: 0,
		lastResponseId: 0,
		inCountryMode: 0
	};
	this.sequence = 0;

	this.cache = {
		finds: {},
		retrieves: {}
	};
	this.cachePos = -1;

	this.scrollPosition = 0;
	this.scrollLimit = 20;

	this.activeId = '';
	this.lastSearch = '';
	this.funcStore = {};

	// *
	// * CONFIGURATION OBJECTS
	// * These objects store the configurable parameters.
	// * Hardcoded overwrites are possible here.

	// set gfx mode
	this.setCfg(config, 'gfxMode', 1);
	// set URL
	this.setCfg(config, 'baseURL', 'https://api.craftyclicks.co.uk/address/1.1', 'relay');
	// add a slash to the end in case it's missing.
	if(this.baseURL[this.baseURL.length] != '/'){
		this.baseURL += '/';
	}
	// add access token
	this.setCfg(config, 'key', '', 'accessToken');
	// add default country
	this.setCfg(config, 'defaultCountry', 'gbr');
	// add enabled countries
	this.setCfg(config, 'enabledCountries', []);
	// convert all enabled country texts to uppercase.
	if(this.enabledCountries.length){
		for(var eci = 0; eci < this.enabledCountries.length; eci++){
			this.enabledCountries[eci] = this.enabledCountries[eci].toUpperCase();
		}
	}

	this.setCfg(config, 'style', {
		ambient: 'light',
		accent: 'default'
	});
	this.setCfg(config, 'domMode', 'name');

	this.setCfg(config, 'placeholders', true);
	this.setCfg(config, 'onResultSelected');		// attach supported
	this.setCfg(config, 'onCountryChange');			// unused
	this.setCfg(config, 'onSearchFocus');			// attach supported
	this.setCfg(config, 'onSetCounty');				// attach supported
	this.setCfg(config, 'onError');
	this.setCfg(config, 'historyTools', true);
	this.setCfg(config, 'countrySelector', true);
	this.setCfg(config, 'showLogo', true);
	this.setCfg(config, 'getIpLocation', true);
	this.setCfg(config, 'accessTokenOverride', {});
	this.setupText(config.texts);
	this.setCfg(config, 'countryLanguage','en');
	this.setCfg(config, 'countryMatchWith','iso_3');
	this.setCfg(config, 'tag', '');
	this.setCfg(config, 'cssPath', 'https://cc-cdn.com/generic/styles/v1/cc_c2a.min.css');

	this.setCfg(config, 'disableAutoSearch', false); // attach supported

	this.setFingerPrint();
};
var cc_debug = false;
