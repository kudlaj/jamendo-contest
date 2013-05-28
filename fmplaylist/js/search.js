/*
 * Free Music Playlist: Search Module by J.Kudla
 * 
 * Dual licensed under the MIT and GPL licenses.
 *  - http://www.opensource.org/licenses/mit-license.php
 *  - http://www.gnu.org/copyleft/gpl.html
 *
 * Author: J.Kudla (kudlaj@gmail.com)
 * Version: 0.1.0
 * Date: 6st may 2013
 */

/**
 * jamendoParams
 * Params to sore the searcjh options for Jamendo
 */
var jamendoParams = (function () {
	var params = {
			page:1,
			perPage:20,
			order:'popularity_total',
			artist_name:''
			};
	var setParams	= function(_params)	{
		if ( typeof _params === "object" ) {
			$.each(_params, function(index, p) {
				params[index] = p; 
			});
		}
	};
	
	var setNewParams	= function(_searchOptions, searchType)	{
		params.page=_searchOptions.page_jamendo;
		params.perPage=_searchOptions.perPage;
		params.xartist = undefined;
		params.namesearch=undefined;
		params.artist_name=undefined;
		if(searchType=="top")	{
			params.id=undefined;
			params.no_artist=undefined;
			params.tags=undefined;
		}	else if (searchType=="artist")	{
			params.id=undefined;
			params.no_artist=undefined;
			params.tags=undefined;
			params.artist_name=_searchOptions.searchVal;
		}	else if (searchType=="tag")	{
			params.id=undefined;
			params.no_artist=undefined;
			var searchFieldVal = _searchOptions.searchVal
			var genre =  searchFieldVal.substr(searchFieldVal.indexOf("#")+1);
			params.tags=genre;
		}	else if (searchType=="track")	{
			params.id=undefined;
			params.no_artist=undefined;
			params.tags=undefined;
			params.namesearch=_searchOptions.searchVal;
		}	else if (searchType=="similartracks")	{
			params.tags=undefined;
		}	else if (searchType=="similarArtist")	{
			params.id=undefined;
			params.no_artist=undefined;
			params.tags=undefined;
			params.xartist= _searchOptions.searchVal;
			
		}
	};
	
	return {
		setParams: function(_params)	{
			setParams(_params);
		},
		setNewParams: function(_searchOptions, searchType)	{
			setNewParams(_searchOptions, searchType);
		},
		getParams: function()	{
			return params;
		}
	};
}());


/**
 * soundCloudParams
 * Params to sore the searcjh options for Soundcloud
 * 
 */
var soundCloudParams = (function () {
	var params = {
			page:1,
			perPage:20,
			order:'hotness',
			q:''
			};
	var setParams	= function(_params)	{
		if ( typeof _params === "object" ) {
			$.each(_params, function(index, p) {
				params[index] = p; 
			});
		}
	};
	var setNewParams	= function(_searchOptions, searchType)	{
		params.page=_searchOptions.page_soundcloud;
		params.perPage=_searchOptions.perPage;
		if(searchType=="top")	{
			params.genres=undefined;
			params.q=undefined;
		}	else if (searchType=="artist"||searchType=="track")	{
			params.genres=undefined;
			params.q=_searchOptions.searchVal;
		}	else if (searchType=="tag")	{
			var searchFieldVal = _searchOptions.searchVal
			var genre =  searchFieldVal.substr(searchFieldVal.indexOf("#")+1);
			params.genres=genre;
			params.q=undefined;
		}	
	};
	
	return {
		setParams: function(_params)	{
			setParams(_params);
		},
		setNewParams: function(_searchOptions, searchType)	{
			setNewParams(_searchOptions, searchType);
		},
		getParams: function()	{
			return params;
		}
	};
}());


/**
 * fmaParams
 * Params to sore the searcjh options for FMA
 * 
 */
var fmaParams = (function () {
	var params = {
			page:1,
			perPage:20,
			sort_by:"track_interest",
			sort_dir:"desc",
			artist_handle:''
			};
	
	var setParams	= function(_params)	{
		if ( typeof _params === "object" ) {
			$.each(_params, function(index, p) {
				params[index] = p; 
			});
		}
	};
	var setNewParams	= function(_searchOptions, searchType)	{
		params.page=_searchOptions.page_fma;
		params.perPage=_searchOptions.perPage;
		params.genre_id=undefined;
		if(searchType=="top")	{
			params.genre_handle=undefined;
			params.artist_handle=undefined;
			params.artist_id=undefined;
		}	else if (searchType=="artist"||searchType=="track")	{
			params.genre_handle=undefined;
			params.artist_handle=trim(FMA.getHandle(_searchOptions.searchVal));
			params.artist_id=undefined;
		}	else if (searchType=="tag")	{
			var searchFieldVal = _searchOptions.searchVal;
			var genre =  searchFieldVal.substr(searchFieldVal.indexOf("#")+1);
			var genreHandle = FMA.getHandle(genre);
			params.genre_handle=trim(genreHandle);
			params.artist_handle=undefined;
			params.artist_id=undefined;
		}	else if (searchType=="similartracks")	{
			params.genre_handle=undefined;
			params.artist_handle=undefined;
		}
	};
	
	var trim = function(str) {
	    return str.replace(/^\s*|\s*$/g,"");
	};
	return {
		setParams: function(_params)	{
			setParams(_params);
		},
		setNewParams: function(_searchOptions, searchType)	{
			setNewParams(_searchOptions, searchType);
		},
		getParams: function()	{
			return params;
		}
	};
}());


/**
 * contains the params of each cloud
 * because the api of each site is different so are the params
 */
var cloudParams = (function () {
	var params = {
			jamendoParams: jamendoParams,
			soundCloudParams: soundCloudParams,
			fmaParams : fmaParams
			};
	
	var setParams	= function(_params)	{
		if ( typeof _params === "object" ) {
			$.each(_params, function(index, p) {
				params[index] = p; 
			});
		}
	};
	
	return {
		setParams: function(_params)	{
			setParams(options);
		},
		getParams: function()	{
			return params;
		},
		getNewParams: function()	{
			return params;
		}
	};
}());

/**
 * Main search Module
 * does all the search operations
 * 
 */
var searchModule = (function ($, window, document, undefined) {
	var jqXHR;
	
	//stores all the search options
	var searchOptions= {
			searchVal:'',
			searchClouds:[],
			searchBy:null,
			newSearch:true,
			isUrl:false,
			page:1,
			perPage:20,
			page_jamendo : 1,
			page_soundcloud : 1,
			page_fma: 1,
			cloudParams:cloudParams.getParams()
	};
	
	//Method to overwrite the search options
	var setOptions	= function(options)	{
		if ( typeof options === "object" ) {
			$.each(options, function(index, option) {
				searchOptions[index] = option; 
			});
			
		}
	};
	
	//Method to set the params for each cloud service
	var setSearchCloudParams	= function(_searchClouds)	{
		$.each(_searchClouds, function(index, cloudId) {
			setCloudParams(cloudId);
		});
	};
	
	//sets the params for a cloud service depending on the search type (search by tag, artist name...)
	var setCloudParams = function (cloudId)	{
		var genre;
		var searchFieldVal = searchOptions.searchVal;
		if(searchOptions.searchBy!=null)	{
			setCloudParamsType(cloudId, searchOptions.searchBy);
		}	else	{
			if(searchFieldVal=="")	{
				setCloudParamsType(cloudId, "top");
			} else if(searchFieldVal.indexOf("#")>=0)	{
				setCloudParamsType(cloudId, "tag");
			}	else	{
				setCloudParamsType(cloudId, "artist");
			}
		}
	};
	
	var setCloudParamsType = function (cloudId, searchType)	{
		if(cloudId == Global.CLOUD_ID_JAMENDO)	{//Jamendo
			jamendoParams.setNewParams(searchOptions, searchType);
		}	else if(cloudId == Global.CLOUD_ID_SOUNDCLOUD)	{//SoundCloud
			var _soundCloudParams = {};
			soundCloudParams.setNewParams(searchOptions, searchType);
		}	else if(cloudId == Global.CLOUD_ID_FMA)	{//FMA
			fmaParams.setNewParams(searchOptions, searchType);
		}
	};

	//getting next page
	var nextPage = function (cloudId)	{
		if(cloudId == Global.CLOUD_ID_JAMENDO)	{//Jamendo
			searchOptions.page_jamendo = searchOptions.page_jamendo+1;
		}	else if(cloudId == Global.CLOUD_ID_SOUNDCLOUD)	{//SoundCloud
			searchOptions.page_soundcloud = searchOptions.page_soundcloud+1;
		}else if(cloudId == Global.CLOUD_ID_FMA)	{//FMA
			searchOptions.page_fma = searchOptions.page_fma+1;
		}
	};
	
	//reset of the page number
	var resetPage = function ()	{
		searchOptions.page_jamendo = searchOptions.page;
		searchOptions.page_soundcloud = searchOptions.page;
		searchOptions.page_fma = searchOptions.page;
	};
	
	//method that calls the ajax function of each cloud service
	var doSearch = function(callbackFunc)	{
		if(jqXHR!=undefined && jqXHR)	{
			jqXHR.abort();
		}
		if($.inArray(Global.CLOUD_ID_JAMENDO, searchOptions.searchClouds)>=0)	{
			jqXHR = Jamendo.getJamendoSongs (jamendoParams.getParams(), callbackFunc, searchOptions.searchBy);
		}
		if($.inArray(Global.CLOUD_ID_SOUNDCLOUD, searchOptions.searchClouds)>=0)	{
			jqXHR = SoundCloud.getSongs(soundCloudParams.getParams(), callbackFunc);
		}
		if($.inArray(Global.CLOUD_ID_FMA, searchOptions.searchClouds)>=0)	{
			jqXHR = FMA.getSongs(fmaParams.getParams(), callbackFunc);
		}
		if(jqXHR!=undefined)	{
			jqXHR.done(function( ) {
				$('#loading').remove();
			});
		}	else	{
			$('#loading').remove();
		}
	};
	
	var trim = function(str) {
	    return str.replace(/^\s*|\s*$/g,"");
	};
	
	return {
		getSearchOptions: function()	{
			return searchOptions;
		},
		search: function(options, callbackFunc)	{
			setOptions(options);
			if(!searchUrlModule.checkForURL(options.searchVal, callbackFunc))	{
				if(options.searchBy && options.searchBy =="lastFmUser")	{
					searchLastFMModule.getRecomendedSongs(options.searchVal, callbackFunc);
				}	else	{
					resetPage();
					setSearchCloudParams(searchOptions.searchClouds);
					doSearch(callbackFunc);
				}
			}
		},
		searchMore: function(cloudId, options, callbackFunc)	{
			setOptions(options);
			nextPage(cloudId);
			setCloudParams(cloudId);
			doSearch(callbackFunc);
		}

	};
})($, window, document, undefined);

/**
 * searchUrlModule
 * 
 * look it the search value is a URL and examines the URL for songs
 * 
 */
var searchUrlModule = (function ($, window, document, undefined) {
	
	//checks if the search value is a URL, 
	//returns true if its a URL and false if not
	var _checkForURL = function (val, callbackFunc)	{
		var flag = true;
		var json;
		if(val.indexOf("http")>=0 && val.indexOf("soundcloud.com")>=0)	{
			json = getSoundCloudTracksByUrl(val, callbackFunc);
		}	else if (val.indexOf("http")<0 && val.indexOf("soundcloud.com")>=0)	{
			val = "http://" + val;
			json = getSoundCloudTracksByUrl(val, callbackFunc);
		}	else if( val.indexOf("jamendo.com")>=0)	{
			json = getJamendoTracksByUrl(val, callbackFunc);
		}	else if( val.indexOf("freemusicarchive")>=0)	{
			json = getFMATracksByUrl(val, callbackFunc);
		}	else	{
			flag = false;
		}
		if(flag)	{
			if(json)	{
				json.always(function() {
					$('#loading').remove();
				});
			}	else	{
				$('#loading').remove();
			}
		}
		return flag;
	};
	
	
	var getJamendoTracksByArtist = function(artistId, callbackFunc)	{
		return Jamendo.getTracks({artist_id:artistId,order:'popularity_total'}, callbackFunc);
	};

	var getJamendoTracksByAlbum = function(albumId, callbackFunc)	{
		return Jamendo.getTracks({album_id:albumId}, callbackFunc);
	};

	var getJamendoTracksByTrackId = function(id, callbackFunc)	{
		return Jamendo.getTracks({id:id}, callbackFunc);
	};

	var getSoundCloudTracksByUrl = function(url, callbackFunc)	{
		page_soundcloud = 1;
		per_page = 20;
		var date = new Date();
		var ms = date.getTime();
		var soundcloud = SoundCloud.getByUrl({url:url}, callbackFunc);
		soundcloud.always(function() { $('#loading').remove(); });
		return soundcloud;
	};

	var getFMATracksByUrl = function(url, callbackFunc)	{
		page_fma = 1;
		per_page = 20;
		var artistHandle = "";
		var albumHandle = "";
		var trackHandle = "";
		var handles = url.split('/');
		var i = 0;
		$.each(handles, function(index, value){
			if (value == "music")	{
				i = index;
			}
			if (i>0 && i+1==index)	{
				artistHandle = value;
			} else if (i>0 && i+2==index)	{
				albumHandle = value;
			}	else if (i>0 && i+3==index)	{
				trackHandle = value;
			}
		});
		var fma;
		if (albumHandle!="")	{
			fma = FMA.getTracks({album_handle:albumHandle}, callbackFunc, page_fma, per_page);
		}	else if (albumHandle=="" && artistHandle!="")	{
			fma = FMA.getTracks({artist_handle:artistHandle}, callbackFunc, page_fma, per_page);
		}
		fma.always(function() { $('#loading').remove(); });
		
	};

	var getJamendoTracksByUrl = function(url, callbackFunc)	{
		var artistId = "";
		var albumId = "";
		var trackId = "";
		var handles = url.split('/');
		
		var isArtist = url.indexOf("artist");
		var isTrack = url.indexOf("track");
		var isAlbum = url.indexOf("list");
		
		if (isArtist>0)	{
			artistId = getJamendoArtistId(handles);
			return getJamendoTracksByArtist(artistId, callbackFunc);
		}	else if (isTrack>0)	{
			trackId = getJamendoTrackId(handles);
			return getJamendoTracksByTrackId(trackId, callbackFunc);
		}	else if (isAlbum>0)	{
			albumId = getJamendoAlbumId(handles);
			return getJamendoTracksByAlbum(albumId, callbackFunc);
		}
	};

	var getJamendoArtistId = function (handles)	{
		var i = 0;
		var id;
		$.each(handles, function(index, value){
			if (value == "artist")	{
				i = index;
			}
			if (i>0 && i+1==index)	{
				id =  value;
			} 
		});
		return id;
	};
	function getJamendoAlbumId(handles)	{
		var i = 0;
		var id;
		$.each(handles, function(index, value){
			if (value == "list")	{
				i = index;
			}
			if (i>0 && i+1==index)	{
				id = value.substr(1);
			} 
		});
		return id;
	};

	var getJamendoTrackId = function (handles)	{
		var i = 0;
		var trackId;
		$.each(handles, function(index, value){
			if (value == "track")	{
				i = index;
			}
			if (i>0 && i+1==index)	{
				trackId = value;
			} 
		});
		return trackId;
	}

	
	return {
		checkForURL: function(searchVal, callbackFunc)	{
			return _checkForURL(searchVal, callbackFunc);
		}

	};
})($, window, document, undefined);

/**
 * searchLastFMModule
 * 
 * Module for the Last.fm functions
 * 
 */
var searchLastFMModule = (function ($, window, document, undefined) {
	var jqXHR;
	var _callBackFunc;
	var pageJ = 0;
	var pageSC = 0;
	var pageFMA = 0;
	
	var _getRecomendedSongs = function (params, callbackFunc)	{
		pageJ = 0;
		pageSC = 0;
		_callBackFunc = callbackFunc;
		jqXHR = LastFm.getUsersTopArtists(params, evalLastFmArtists);
	};
	
	var evalLastFmArtists = function(msg, data)		{
		var params;
		if(data && data.length>0){
			 $.each(data, function(index, json) {
				 params = {};
				 params.artist_name = json.name;
				 params.order='popularity_total';
				 Jamendo.getTracks(params, callBackCloudJamendo, 1, 2);
				 
				 params = {};
				 params.xartist = json.name;
				 params.order='popularity_total';
				 jqXHR = Jamendo.getTracks(params, callBackCloudJamendo, 1, 3);
			 });
			 
			 $.each(data, function(index, json) {
				 params = {};
				 params.q = json.name;
				 params.order='hotness';
				 jqXHR = SoundCloud.getTracks(params, callBackCloudSoundCloud, 1, 2);
			 });
			 
			 //dosn't really work for FMA
			 $.each(data, function(index, json) {
				 params = {};
				 params.artist_handle=FMA.getHandle(json.name);
				 params.sort_by="track_interest";
				 params.sort_dir="desc";
				 jqXHR = FMA.getTracks(params, callBackCloudFMA, 1, 2);
			 });
		}
		
		if(jqXHR!=undefined)	{
			jqXHR.done(function( ) {
				$('#loading').remove();
			});
		}	else	{
			$('#loading').remove();
		}
		
	};
	
	var callBackCloudJamendo = function(msg, tracks)		{
		_callBackFunc(msg, tracks, pageJ++);
	};
	var callBackCloudSoundCloud = function(msg, tracks)		{
		_callBackFunc(msg, tracks, pageSC++);
	};
	var callBackCloudFMA = function(msg, tracks)		{
		_callBackFunc(msg, tracks, pageFMA++);
	};
	
	return {
		getRecomendedSongs: function(lastFmUsername, callbackFunc)	{
			var params = {};
			params.user = lastFmUsername;
			params.limit = 20;
			_getRecomendedSongs(params, callbackFunc);
		}

	};
	
})($, window, document, undefined);