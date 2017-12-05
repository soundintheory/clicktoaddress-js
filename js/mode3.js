if(typeof c2a_gfx_modes == 'undefined'){
	var c2a_gfx_modes = {};
}
c2a_gfx_modes['mode3'] = {
	addHtml: function(that){
		// create the dropdown
		var cc_dropdown = document.createElement('DIV');
		cc_dropdown.className = 'c2a_mode'+that.gfxMode+' c2a_'+that.style.ambient+' c2a_accent_'+that.style.accent;
		cc_dropdown.id = 'cc_c2a';
		var historyBar = '<div class="cc-history"><div class="cc-back cc-disabled"></div>';
			historyBar += '<div class="cc-forward cc-disabled"></div></div>';

		var mainbar = '';

		if(that.countrySelectorOption != 'hidden' || that.historyTools){
			mainbar += '<div class="mainbar">';
			if(that.countrySelectorOption != 'hidden'){
				var btnClass = 'country_btn';
				if(that.countrySelectorOption == 'enabled'){
					btnClass += ' country_btn_active';
				}
				mainbar += '<div class="'+btnClass+'"><div class="country_img"></div><span>'+that.texts.country_button+'</span></div>';
			}
			if(that.historyTools){
				mainbar += historyBar;
			}
			if(that.showLogo){
				mainbar += '<div class="c2a_logo"></div>';
			}
			mainbar += '</div>';
		}
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

		var topOffset = (elemRect.top + docTop) + (target.offsetHeight + 3);
		var leftOffset = elemRect.left + docLeft;

		var htmlBox = window.getComputedStyle(document.getElementsByTagName('html')[0]);
		topOffset += parseInt( htmlBox.getPropertyValue('margin-top') ) + parseInt( htmlBox.getPropertyValue('padding-top') );
		leftOffset += parseInt( htmlBox.getPropertyValue('margin-left') ) + parseInt( htmlBox.getPropertyValue('padding-left') );
/*
		if(htmlRect.bottom < that.searchObj.offsetHeight){
			topOffset -= target.offsetHeight + that.searchObj.offsetHeight;
		}
*/
		that.searchObj.style.left = leftOffset +'px';
		that.searchObj.style.top = topOffset+'px';
		that.searchObj.style.width = (target.offsetWidth) +'px';

		// if there's not enough space for the logo, hide it
		var logo = that.searchObj.getElementsByClassName('c2a_logo');
		if(logo.length){
			if(elemRect.width < 300){
				that.searchObj.getElementsByClassName('c2a_logo')[0].style.display = 'none';
			} else {
				that.searchObj.getElementsByClassName('c2a_logo')[0].style.display = 'block';
			}
		}

		var activeClass = 'c2a_active';
		target.cc_current_target = 1;
		var activeElements = document.getElementsByClassName(activeClass);
		for(var i=0; i<activeElements.length; i++){
			if(typeof activeElements[i].cc_current_target == 'undefined'){
				activeElements[i].className = activeElements[i].className.replace(" "+activeClass, "");
			}
		}
		delete target.cc_current_target;
		if(target.className.indexOf(activeClass) == -1){
			target.className += " "+activeClass;
		}
	}
};
