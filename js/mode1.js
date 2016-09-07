if(typeof c2a_gfx_modes == 'undefined'){
	var c2a_gfx_modes = {};
}
c2a_gfx_modes['mode1'] = {
	addHtml: function(that){
		// create the dropdown
		var cc_dropdown = document.createElement('DIV');
		cc_dropdown.className = 'c2a_mode'+that.gfxMode+' c2a_'+that.style.ambient+' c2a_accent_'+that.style.accent;
		cc_dropdown.id = 'cc_c2a';
		var historyBar = '<div class="cc-history"><div class="cc-back cc-disabled"></div>';
			historyBar += '<div class="cc-forward cc-disabled"></div></div>';

		var mainbar = '<div class="mainbar">';
		var btnClass = 'country_btn';
		if(that.countrySelector){
			btnClass += ' country_btn_active';
		}
		mainbar += '<div class="'+btnClass+'"><div class="country_img"></div><span>'+that.texts.country_button+'</span></div>';

		if(that.historyTools){
			mainbar += historyBar;
		}
		if(that.showLogo){
			mainbar += '<div class="c2a_logo"></div>';
		}

		mainbar += '</div>';
		var progressBar = '<div class="progressBar"></div>';
		var infoBar = '<div class="infoBar"></div>';

		var footerHtml = progressBar + mainbar + infoBar;

		var footerClass = 'c2a_footer',
			title = '';

		if(that.showLogo){
			footerHtml += '<div class="c2a_logo"></div>';
			title = ' title="Provided by Crafty Clicks"';
		}

		var html =	'<div class="c2a_error"></div><ul class="c2a_results"></ul>'+
					'<div class="'+footerClass+'"'+title+'>'+footerHtml+'</div>';
		cc_dropdown.innerHTML = html;
		document.body.appendChild(cc_dropdown);
	},
	reposition: function(that, target){
		// position to target
		var elemRect = target.getBoundingClientRect();
		/*	http://stackoverflow.com/questions/3464876/javascript-get-window-x-y-position-for-scroll
		var htmlRect = document.getElementsByTagName('html')[0].getBoundingClientRect();
		*/
		var doc = document.documentElement;
		var docTop = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
		var docLeft = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);

		var topOffset = (elemRect.top + docTop) + (target.offsetHeight - 5);
		var leftOffset = elemRect.left + docLeft;
		if(document.body.style.paddingLeft !== ''){
			leftOffset += parseInt(document.body.style.paddingLeft);
		}

		var htmlTop = parseInt( window.getComputedStyle(document.getElementsByTagName('html')[0]).getPropertyValue('margin-top') );
			htmlTop += parseInt( window.getComputedStyle(document.getElementsByTagName('html')[0]).getPropertyValue('padding-top') );

		topOffset += htmlTop;
/*
		if(htmlRect.bottom < that.searchObj.offsetHeight){
			topOffset -= target.offsetHeight + that.searchObj.offsetHeight;
		}
*/
		that.searchObj.style.left = leftOffset + 3 +'px';
		that.searchObj.style.top = topOffset+'px';
		that.searchObj.style.width = (target.offsetWidth - 6) +'px';

		var activeClass = 'c2a_active';
		var activeElements = document.getElementsByClassName(activeClass);
		for(var i=0; i<activeElements.length; i++){
			activeElements[i].className = activeElements[i].className.replace(" "+activeClass, "");
		}

		target.className += " "+activeClass;
	}
};
