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
			mainbar += '<div class="country_btn"><div class="country_img"></div><span>'+that.texts.country_button+'</span></div>';
		if(that.historyTools === true){
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
		var topElemHeight = 22;

		var elemRect = target.getBoundingClientRect();
		var	htmlRect = document.getElementsByTagName('html')[0].getBoundingClientRect();
		var	topOffset = (elemRect.top - htmlRect.top) - (topElemHeight+10);
		var	leftOffset = elemRect.left - htmlRect.left + document.body.style.paddingLeft;

		var htmlTop = parseInt( window.getComputedStyle(document.getElementsByTagName('html')[0]).getPropertyValue('margin-top') );
			htmlTop += parseInt( window.getComputedStyle(document.getElementsByTagName('html')[0]).getPropertyValue('padding-top') );

		topOffset += htmlTop;

		that.searchObj.style.left = leftOffset-5+'px';
		that.searchObj.style.top = topOffset+'px';
		that.searchObj.style.width = target.offsetWidth+10+'px';
		that.searchObj.getElementsByClassName('mainbar')[0].style.marginBottom = target.offsetHeight+10+'px';

		var activeClass = 'c2a_active';
		var activeElements = document.getElementsByClassName(activeClass);
		for(var i=0; i<activeElements.length; i++){
			activeElements[i].className = activeElements[i].className.replace(" "+activeClass, "");
		}

		target.className += " "+activeClass;

	}
};
