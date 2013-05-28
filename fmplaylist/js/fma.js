(function(){

  var root = this;

  var FMA = root.FMA = {
    host : 'freemusicarchive.org',
    api_key : PrivateKeys.FMA_KEY,
    CLOUD_NAME : 'FMA',
  	CLOUD_ID: 'FMA',
    per_page : 20,
    page: 1,
  };

  if (FMA.api_key == '') {
    alert('please signup at the Free Music Archive for an api key and fill it into js/fma.js');
  }

  function handleResponse(data,callback) {
    if (data.errors && data.errors.length > 0) {
    	var track =  new Track('', FMA.CLOUD_NAME, '', '', '', '' );
    	track.cloudId = FMA.CLOUD_ID;
    	callback(data.errors[0], track);
    } else if (data.dataset) {
    	callback(null, data.dataset, FMA.page, FMA.per_page);
    } else {
    	var track =  new Track('', FMA.CLOUD_NAME, '', '', '', '' );
    	track.cloudId = FMA.CLOUD_ID;
    	callback('unknown error', track);
    }
  }
  
  function handleResponseTracks(data,callback) {
	    if (data.errors && data.errors.length > 0) {
	    	var track =  new Track('', FMA.CLOUD_NAME, '', '', '', '' );
	    	track.cloudId = FMA.CLOUD_ID;
	    	//callback(data.errors[0], track);
	    } else if (data.dataset) {
	    	callback(null, convertInTrackArray(data.dataset), FMA.page, FMA.per_page);
	    } else {
	    	var track =  new Track('', FMA.CLOUD_NAME, '', '', '', '' );
	    	track.cloudId = FMA.CLOUD_ID;
	    	callback('unknown error', track);
	    }
	  }
  
   
  function handleError(msg, callback) {
	  	var track =  new Track('', FMA.CLOUD_NAME, '', '', '', '' );
  		track.cloudId = FMA.CLOUD_ID;
  		callback(msg, track);
  }

  function requestData(domain, params, callback, page, per_page) {
    params.api_key = FMA.api_key;
    params.page = page || 1;
    params.limit = per_page || FMA.per_page;
    FMA.page = params.page;
    FMA.per_page = params.limit;
    params.perPage=undefined;

    return $.ajaxQueue({
      url: 'http://' + FMA.host + '/api/get/' + domain + '.jsonp',
      dataType: 'jsonp',
      data: params,
      cache:false,
      success: function(data) {handleResponse(data, callback)},
      error: function(jqXHR, textStatus, errorThrown) { handleError(textStatus, callback); }
    });
  }
  
  
  
  function requestDataTracks(domain, params, callback, page, per_page) {
	    params.api_key = FMA.api_key;
	    params.page = page || 1;
	    params.limit = per_page || FMA.per_page;
	    FMA.page= params.page;
	    FMA.per_page= params.limit;
	    return $.ajaxQueue({
	      url: 'http://' + FMA.host + '/api/get/' + domain + '.jsonp',
	      dataType: 'jsonp',
	      data: params,
	      cache:false,
	      success: function(data) {handleResponseTracks(data, callback)},
	      error: function(jqXHR, textStatus, errorThrown) { handleError(textStatus, callback); }
	    });
	  }
  

  function convertInTrackArray(data)	{
	  var tracks = [];
	  $.each(data, function(index, json) {
		  track = new Track(json.track_id, FMA.CLOUD_NAME, json.track_image_file, json.track_title, json.artist_name, json.track_url );
		 
		  track.mp3Url = json.track_url + "/download";
		  track.cloudId = FMA.CLOUD_ID;
		  track.license = json.license_title;
		  track.album = json.album_title;
		  track.artistId = json.artist_id;
		  if(json.tags!=undefined && json.tags!=null)	{
			  var tag = "";
			  $.each(json.tags, function(index, tagValue) {
				 tag = tag + " "+  tagValue;
			  });
			  track.tag = tag;
		  }
		  if(json.track_genres!=undefined && json.track_genres!=null)	{
			  var genre = "";
			  var genres = [];
			  var i = 0;
			  var genreObj;
			  $.each(json.track_genres, function(index, genreValue) {
				  genreObj = {};
				  genreObj.id = genreValue.genre_id;
				  genreObj.name = genreValue.genre_title;
				  genres.push(genreObj);
				  genre = genre + " " +  genreValue.genre_title;
				  
				});
			  track.genre = genre;
			  track.genreArray = genres;
		  }
		  var cover = json.track_image_file;
		  if(cover!=undefined && cover.indexOf("null")>0)	{
			  track.cover = undefined;
		  }
		  tracks.push(track);
	  });
	  return tracks;
  }
  
  FMA.getCurators = function getCurators(params, callbackFunc, page, per_page) {
    requestData('curators', params, callbackFunc, page, per_page);
  }

  FMA.getGenres = function getGenres(params, callbackFunc, page, per_page) {
    requestData('genres', params, callbackFunc, page, per_page);
  }

  FMA.getArtists = function getArtists(params, callbackFunc, page, per_page) {
    requestData('artists', params, callbackFunc, page, per_page);
  }

  FMA.getAlbums = function getAlbums(params, callbackFunc, page, per_page) {
    requestData('albums', params, callbackFunc, page, per_page);
  }

  FMA.getTracks = function getTracks(params, callbackFunc, page, per_page) {
    return requestDataTracks('tracks', params, callbackFunc, page, per_page);
  }
  
  FMA.getSongs = function(params, callbackFunc) {
	    return requestDataTracks('tracks', params, callbackFunc, params.page, params.perPage);
  }
  
 
  FMA.getHandle = function getHandle(searchVal) {
	  var handle = searchVal.replace(/ /g, "_");
	  handle = handle.replace("'", "");
	  handle = handle.replace("(", "");
	  handle = handle.replace(")", "");
	  return handle;
  }
  
}).call(this);
