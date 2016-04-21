if(typeof c2a_gfx_modes == 'undefined'){
	var c2a_gfx_modes = {};
}
c2a_gfx_modes['mode1'] = {
	addHtml: function(that){
		// create the dropdown
		var cc_dropdown = document.createElement('DIV');
		cc_dropdown.className = 'c2a_mode'+that.gfxMode+' c2a_'+that.style.ambient+' c2a_accent_'+that.style.accent;
		cc_dropdown.id = 'cc_c2a';
		var historyBar = '<div class="cc-history"><div class="back disabled"></div>';
			historyBar += '<div class="forward disabled"></div></div>';

		var mainbar = '<div class="mainbar">';
		mainbar += '<div class="country_btn"><div class="country_img"></div><span>'+that.texts.country_button+'</span></div>';

		if(that.historyTools === true){
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

		if(this.showLogo){
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
		var elemRect = target.getBoundingClientRect(),
			bodyRect = document.body.getBoundingClientRect(),
			topOffset = elemRect.top - bodyRect.top + target.offsetHeight - 3;
			leftOffset = elemRect.left - bodyRect.left;
		if(document.body.style.paddingLeft !== ''){
			leftOffset += parseInt(document.body.style.paddingLeft);
		}

		var htmlTop = parseInt( window.getComputedStyle(document.getElementsByTagName('html')[0]).getPropertyValue('margin-top') );
			htmlTop += parseInt( window.getComputedStyle(document.getElementsByTagName('html')[0]).getPropertyValue('padding-top') );

		topOffset += htmlTop;

		if(bodyRect.bottom < that.searchObj.offsetHeight){
			topOffset -= target.offsetHeight + that.searchObj.offsetHeight;
		}

		that.searchObj.style.left = leftOffset + 3 +'px';
		that.searchObj.style.top = topOffset+'px';
		that.searchObj.style.width = (target.offsetWidth - 6) +'px';
	}
};
