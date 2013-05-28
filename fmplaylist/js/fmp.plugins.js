//Plugin to show the info for each result of the search
;(function($, window, document, undefined) {
	var methods = {
		init : function(options) {
			
		},
		show : function( panel) {
			$(panel).empty();
			var cloudName = this.attr("cloudName");
			var cloudId = this.attr("cloudId");
			var trackId = this.attr("id");
			var genre = this.attr("genre");
			var tag = this.attr("tag");
			$(panel).append("<span>"+cloudName+"</span>");
			if(genre!=undefined)
				$(panel).append("<span>"+genre+"</span>");
			if(tag!=undefined)
				$(panel).append("<span>"+tag+"</span>");
			$(panel).append("<span><a href='javascript:addPlayList("+trackId+", \""+cloudId+"\")'>add to playlist</a></span>");
			$(panel).show();
			var position = this.position();
			panel.offset({ top: position.top-10, left: position.left+550 });
			
			var timeout;
			$(panel).mouseout(function() {
				timeout= window.setTimeout(function(){$(panel).hide();},1000);
			});
			$(panel).mouseover(function() {
				window.clearTimeout(timeout);
			});
			return this;
		},
		
		click : function() {
			alert("click");
		},
		update : function(content) {
			// !!!
		}
	};

	$.fn.infoTracks = function(method) {
		// Method calling logic
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(
					arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist');
		}

	};
	
})(jQuery, window, document);

//Plugin to show the help panel for the search option
;(function($, window, document, undefined) {
	var methods = {
		init : function(options) {
			
		},
		showHelp : function( panel) {
			$(panel).empty();
			$(panel).append("<li>Search for bands/artists</li>");
			$(panel).append("<li>Search for tags/genres typing a # example: #rock or #blues</li>");
			$(panel).append("<li>Introduce the URL of a Jamendo/Sound Cloud/FMA site you know to add the songs you want to your playlist.</li>");
			$(panel).append("<li>&nbsp;</li>");
			$(panel).append("<li><a href='javascript:void(0);' onClick='advancedSearch();' id='advancedSearch'>Advanced search options</a></li>");
			$(panel).show();
			var position = this.parent("div#search").position();
			panel.offset({ top: position.top+50, left: position.left+5 });
			
			this.blur(function() {
				window.setTimeout(function(){$(panel).hide();},300);
			});
			return this;
		}
	};

	$.fn.infoSearch = function(method) {
		// Method calling logic
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(
					arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist');
		}

	};
	
})(jQuery, window, document);
