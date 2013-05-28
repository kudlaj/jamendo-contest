(function(){

  var root = this;

  var Jamendo = root.Jamendo = {
    host : 'api.jamendo.com',
    CLOUD_NAME : 'Jamendo',
  	CLOUD_ID: 'J',
    api_key : PrivateKeys.JAMENDO_KEY,
    per_page : 20,
    page: 0,
  };

  

  function handleResponse(domain, data, callback) {
    if (data && data != "") {
    	if(data["headers"]["status"]=="success")	{
	    	if(domain=="tracks" || domain=="tracks/similar")	{
	    		callback(null, convertInTrackArray(data["results"]), Jamendo.page, Jamendo.per_page);
	    	}	else if(domain=="artists" || domain=="artists/musicinfo")	{
	    		callback(null, convertInArtistArray(data["results"]));
	    	}	else	{
	    		callback(null, data["results"]);
	    	}
    	}	else	{
    		//returns a empty track with the error message
    		var track =  new Track('', Jamendo.CLOUD_NAME, '', '', '', '' );
        	track.cloudId = Jamendo.CLOUD_ID;
        	callback(data["headers"]["error_message"], track);
    	}
    } else {
    	//returns a empty track with a unknown error message
    	var track =  new Track('', Jamendo.CLOUD_NAME, '', '', '', '' );
    	track.cloudId = Jamendo.CLOUD_ID;
    	callback('unknown error', track);
    }
  }

  function handleError(msg, callback) {
	  	var track =  new Track('', Jamendo.CLOUD_NAME, '', '', '', '' );
  		track.cloudId = Jamendo.CLOUD_ID;
  		callback(msg, track);
  }
  

  function requestData(domain, params, callback, page, per_page) {
    if(page!=undefined && page>1)	{
		  params.offset = (page*per_page)-per_page;
	  }else	{
		  params.offset = undefined;
	}  
    if(  isNaN(params.offset))	{
    	params.offset = undefined;
    }
    params.limit = per_page || Jamendo.per_page;
    Jamendo.page=page;
    Jamendo.per_page=params.limit;
    params.client_id = Jamendo.api_key;
    params.format="json";
    var url = 'http://' + Jamendo.host + '/v3.0/'+domain+"/";
  
	    return $.ajaxQueue({
	      url: url,
	      dataType: 'json',
	      data: params,
	      cache:false,
	      success: function(data) {handleResponse(domain, data, callback)},
	      error: function(jqXHR, textStatus, errorThrown) { handleError(textStatus, callback); }
	    });
   
  }
  
  function convertInTrackArray(data)	{
	  var tracks = [];
	  $.each(data, function(index, json) {
		  var url = "http://www.jamendo.com/en/track/"+json.id+"/";
		  var track = new Track(json.id, Jamendo.CLOUD_NAME, json.album_image, json.name, json.artist_name, url );
		  track.mp3Url = "http://api.jamendo.com/v3.0/tracks/file?client_id="+Jamendo.api_key+"&audioformat=mp31&id="+json.id;
		  track.cloudId = Jamendo.CLOUD_ID;
		  track.license = json.license_ccurl;
		  track.artistId = json.artist_id;
		  if(json.musicinfo)	{
			  json.musicinfo.tags
			  var genre = "";
			  var genres = [];
			  var i = 0;
			  var genreObj;
			  $.each(json.musicinfo.tags.genres, function(index, genreValue) {
				 genre += genreValue + " ";
				 genreObj = {};
				 genreObj.id = null;
				 genreObj.name = genreValue;
				 genres.push(genreObj);
				});
			  track.genre = genre;
			  track.genreArray = genres;
		  }

		  tracks.push(track);
	  });
	  return tracks;
  }

  function convertInArtistArray(data)	{
	  var artists = [];
	  $.each(data, function(index, json) {
		  var artist = new Artist(json.id, json.name, json.image, '' );
		  artist.website = json.website;
		  artist.description = json.musicinfo.description;
		  artist.tags = json.musicinfo.tags;
		  artists.push(artist);
	  });
	  return artists;
  }

  Jamendo.getArtists = function getArtists(params, callbackFunc, page, per_page) {
	  var fields = "name+id+url+image";
	  var joins = "";
	  return requestData('artist', fields, joins, params, callbackFunc, page, per_page);
  }

  Jamendo.getAlbums = function getAlbums(params, callbackFunc, page, per_page) {
	  var fields = "";
	  var joins = "";
	  return requestData('album', fields, joins, params, callbackFunc, page, per_page);
  }

  Jamendo.getTracks = function getTracks(params, callbackFunc, page, per_page) {
	  params.include="licenses+musicinfo";
	  return requestData('tracks',  params, callbackFunc, page, per_page);
  }
  //
  Jamendo.getSimilarTracks = function getTracks(params, callbackFunc, page, per_page) {
	  return requestData('tracks/similar',  params, callbackFunc, page, per_page);
  }
  
  Jamendo.getArtistInfo = function getTracks(params, callbackFunc) {
	  return requestData('artists/musicinfo',  params, callbackFunc);
  }
  
  Jamendo.getJamendoSongs = function(params, callbackFunc, searchBy)	{
	  var jqXHR;
	  var page = params.page;
	  var per_page = params.perPage;
	  if(searchBy && searchBy=="similartracks")	{
		  jqXHR = Jamendo.getSimilarTracks(params, callbackFunc, page, per_page);
	  }	else	{
		  jqXHR = Jamendo.getTracks(params, callbackFunc, page, per_page);
	  }
	  
	  return jqXHR;
	}
}).call(this);
