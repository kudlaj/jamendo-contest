(function(){

  var root = this;

  var SoundCloud = root.SoundCloud = {
    host : 'api.soundcloud.com',
    CLOUD_NAME : 'SoundCloud',
  	CLOUD_ID: 'SC',
    api_key : PrivateKeys.SOUNDCLOUD_KEY,
    per_page : 20,
    page: 1
  };


  function handleResponse(domain, data,callback) {

    if (data.errors && data.errors.length > 0) {
    	var track =  new Track('', SoundCloud.CLOUD_NAME, '', '', '', '' );
  		track.cloudId = SoundCloud.CLOUD_ID;
  		callback(data.errors[0], track);
    } else if (data) {
    	if(data[0]!=undefined && data[0]['kind']=="track")	{
    		callback(null, convertInTrackArray(data), SoundCloud.page, SoundCloud.per_page);
    	}	else if (data['kind']=="track")	{
    		callback(null, convertInTrackArray(data), SoundCloud.page, SoundCloud.per_page);
    	}	else if (data['kind']=="playlist")	{
    		callback(null, convertInTrackArray(data.tracks), SoundCloud.page, SoundCloud.per_page);
    	}	else  	{
    		callback(null, data);
    	}
    } else {
    	var track =  new Track('', SoundCloud.CLOUD_NAME, '', '', '', '' );
    	track.cloudId = SoundCloud.CLOUD_ID;
    	callback('unknown error', track);
    }
  }

  function handleError(msg, callback) {
	  	var track =  new Track('', SoundCloud.CLOUD_NAME, '', '', '', '' );
	  	track.cloudId = SoundCloud.CLOUD_ID;
  		callback(msg, track);
  }

  function requestData(domain, params, callback, page, per_page) {
	  params.client_id = SoundCloud.api_key;
	  //params.license='cc-by,cc-by-nc-nd,cc-by-nc-nd-sa,cc-by-nc-sa,cc-by-nd,cc-by-sa';
	  params.filter = 'streamable';
	  if(page!=undefined && page>1)	{
		  params.offset = (parseInt(page)*parseInt(per_page))-parseInt(per_page);
	  }else	{
			  params.offset = undefined;
	  }  
	  if(  isNaN(params.offset))	{
	    	params.offset = undefined;
	  }
	  params.limit = per_page || SoundCloud.per_page;
	  SoundCloud.page=page;
	  SoundCloud.per_page=params.limit;
	  
    return $.ajaxQueue({
      url: 'http://' + SoundCloud.host + '/' + domain +'.json',
      dataType: 'json',
      data: params,
      cache:false,
      success: function(data) {handleResponse(domain, data, callback)},
      error: function(jqXHR, textStatus, errorThrown) { handleError(textStatus, callback); }
    });
  }
  
  function convertInTrackArray(data)	{
	  var tracks = [];
	  if(data.length!=undefined )	{
	  $.each(data, function(index, json) {
		  var track = new Track(json.id, SoundCloud.CLOUD_NAME, json.artwork_url, json.title, json.user.username, json.permalink_url );
		  track.mp3Url = "https://api.soundcloud.com/tracks/"+json.id+"/stream?client_id=" +SoundCloud.api_key
		  track.cloudId = SoundCloud.CLOUD_ID;
		  track.license = json.license;
		  track.genre = json.genre;
		  //to unify with the other apis we create also a array for the genre
		  var genres = [];
		  genreObj = {};
		  genreObj.id = null;
		  genreObj.name = json.genre;
		  genres.push(genreObj);
		  track.genreArray = genres;
		  
		  track.artistId = json.user_id;
		  tracks.push(track);
	  });
	  } else	{
		  var json = data;
		  var track = new Track(json.id, SoundCloud.CLOUD_NAME, json.artwork_url, json.title, json.user.username, json.permalink_url );
		  track.mp3Url = "https://api.soundcloud.com/tracks/"+json.id+"/stream?client_id=" +SoundCloud.api_key
		  track.cloudId = SoundCloud.CLOUD_ID;
		  track.license = json.license;
		  track.genre = json.genre;
		  //to unify with the other apis we create also a array for the genre
		  var genres = [];
		  genreObj = {};
		  genreObj.id = null;
		  genreObj.name = json.genre;
		  genres.push(genreObj);
		  track.genreArray = genres;
		  
		  track.artistId = json.user_id;
		  tracks.push(track);
	  }
	  return tracks;
  }

  

  SoundCloud.getArtists = function getArtists(params, callbackFunc, page, per_page) {
	  return requestData('users', fields, joins, params, callbackFunc, page, per_page);
  }

  SoundCloud.getTracks = function getTracks(params, callbackFunc, page, per_page) {
	  return requestData('tracks',  params, callbackFunc, page, per_page);
  }
  
  SoundCloud.getSongs = function(params, callbackFunc) {
	  return requestData('tracks',  params, callbackFunc, params.page, params.perPage);
  }
  
  SoundCloud.getByUrl = function getTracks(params, callbackFunc, page, per_page) {
	  return requestData('resolve',  params, callbackFunc, page, per_page);
  }

}).call(this);
