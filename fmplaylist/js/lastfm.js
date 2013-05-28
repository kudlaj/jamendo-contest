(function(){

  var root = this;

  var LastFm = root.LastFm = {
    host : 'ws.audioscrobbler.com',
    CLOUD_NAME : 'LastFm',
  	CLOUD_ID: 'LFM',
    api_key : PrivateKeys.LASTFM_KEY,
    per_page : 20,
    page: 1,
  };

  

  function handleResponse(method, data, callback) {
	  if(data.error)	{
		  callback(data.error.message, data);
	  } else if (data && data != "") {
    	if(method=="getinfo")	{
    		callback(null, convertInArtist(data.artist));
    	}	else if(method=="getsimilar")	{
    		callback(null, convertInArtistArray(data.similarartists.artist));
    	}	else if(method=="gettopartists")	{
    		callback(null, convertInArtistArray(data.topartists.artist));
    	}	else	{
    		callback(null, data);
    	}
    }	else {
      callback('unknown error', data);
    }
  }

  function handleError(msg, callback) {
	  	var track =  new Track('', Jamendo.CLOUD_NAME, '', '', '', '' );
  		track.cloudId = Jamendo.CLOUD_ID;
  		callback(msg, track);
  }
  
  function processData(data)	{
	  alert("lastfm: " + data);
  }

  function requestData(domain, method, params, callback, page, per_page) {
	  params.api_key = LastFm.api_key;
	  params.format="json";
	  params.autocorrect = "1";
	  var url = 'http://' + LastFm.host + '/2.0/?method='+domain+'.'+method;
	  
	    return $.ajax({
	      url: url,
	      dataType: 'json',
	      data: params,
	      cache:false,
	      success: function(data) {handleResponse(method, data, callback)},
	      error: function(jqXHR, textStatus, errorThrown) { handleError(textStatus, callback); }
	    });
   
  }
  
  

  function convertInArtistArray(data)	{
	  var artists = [];
	  $.each(data, function(index, artist) {
		  var img;
		  if(artist.image)	{
			  $.each(artist.image[1], function(index, val) {
				  if (index == "#text")
					  img = this;
			  });
		  }
		  var _artist = new Artist(artist.mbid, artist.name, img, artist.url );
		  
		  artists.push(_artist);
	  });
	  return artists;
  }
  function convertInArtist(artist)	{
	  var artists = [];
	  var img;
	  $.each(artist.image[2], function(index, val) {
		  if (index == "#text")
			  img = this;
	  });
	  var _artist = new Artist(artist.mbid, artist.name, img, artist.url );
	  _artist.description = artist.bio.content;
	  _artist.website = artist.url;
	  artists.push(_artist);

	  return artists;
  }

  LastFm.getArtists = function getArtists(params, callbackFunc) {
	  var domain = "artist";
	  var method = "getinfo";
	  return requestData(domain, method, params, callbackFunc);
  }

  LastFm.getSimilarArtists = function getAlbums(params, callbackFunc) {
	  var domain = "artist";
	  var method = "getsimilar";
	  return requestData(domain, method, params, callbackFunc);
  }

  LastFm.getUsersTopArtists = function getUsersTopArtists(params, callbackFunc) {
	  var domain = "user";
	  var method = "gettopartists";
	  return requestData(domain, method, params, callbackFunc);
  }
  
  

}).call(this);
