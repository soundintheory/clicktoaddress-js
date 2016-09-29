if(typeof c2a_gfx_modes == 'undefined'){
	var c2a_gfx_modes = {};
}
c2a_gfx_modes['mode2'] = {
	addHtml: function(that){
		// create the dropdown
		var cc_dropdown = document.createElement('DIV');
		cc_dropdown.className = 'c2a_mode'+that.gfxMode+' c2a_'+that.style.ambient+' c2a_accent_'+that.style.accent;
		cc_dropdown.id = 'cc_c2a';

		var mainbar = '<div class="mainbar">';
		var btnClass = 'country_btn';
		if(that.countrySelector){
			btnClass += ' country_btn_active';
		}
		mainbar += '<div class="'+btnClass+'"><div class="country_img"></div><span>'+that.texts.country_button+'</span></div>';

		if(that.historyTools){
			mainbar += '<div class="cc-history"><div class="cc-back disabled"></div>';
			mainbar +='<div class="cc-forward disabled"></div></div>';
		}

		if(that.showLogo){
			mainbar += '<div class="c2a_logo"></div>';
		}
		mainbar += '</div>';
		var progressBar = '<div class="progressBar"></div>';
		var infoBar = '<div class="infoBar"></div>';
		var footerClass = 'c2a_footer',
			title = '';

		var footerHtml = progressBar + infoBar;

		var html =	mainbar+'<div class="c2a_error"></div><ul class="c2a_results"></ul>' +
					'<div class="'+footerClass+'"'+title+'>'+footerHtml+'</div>';
		cc_dropdown.innerHTML = html;
		document.body.appendChild(cc_dropdown);
	},
	reposition: function(that, target){
		// position to target
		var elemRect = target.getBoundingClientRect();
		/*	http://stackoverflow.com/questions/3464876/javascript-get-window-x-y-position-for-scroll
		var	htmlRect = document.getElementsByTagName('html')[0].getBoundingClientRect();
		*/
		var doc = document.documentElement;
		var docTop = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
		var docLeft = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);

		var mainBarHeight = that.searchObj.getElementsByClassName('mainbar')[0].clientHeight;

		var topOffset = (elemRect.top + docTop) - (mainBarHeight + 6);
		var leftOffset = (elemRect.left + docLeft);/* + parseInt( document.body.style.paddingLeft );*/

		var htmlBox = window.getComputedStyle(document.getElementsByTagName('html')[0]);
		topOffset += parseInt( htmlBox.getPropertyValue('margin-top') ) + parseInt( htmlBox.getPropertyValue('padding-top') );
		leftOffset += parseInt( htmlBox.getPropertyValue('margin-left') ) + parseInt( htmlBox.getPropertyValue('padding-left') );

		that.searchObj.style.left = leftOffset-5+'px';
		that.searchObj.style.top = topOffset+'px';
		that.searchObj.style.width = target.offsetWidth+10+'px';
		that.searchObj.getElementsByClassName('mainbar')[0].style.marginBottom = target.offsetHeight+6+'px';

		// if there's not enough space for the logo, hide it
		var logo = that.searchObj.getElementsByClassName('c2a_logo');
		if(logo.length){
			if(elemRect.width < 300 && logo[0].className.indexOf('hidden') == -1){
				logo[0].className = 'c2a_logo hidden';
			}
		}

		var activeClass = 'c2a_active';
		var activeElements = document.getElementsByClassName(activeClass);
		for(var i=0; i<activeElements.length; i++){
			activeElements[i].className = activeElements[i].className.replace(" "+activeClass, "");
		}
		target.className += " "+activeClass;
	}
};
