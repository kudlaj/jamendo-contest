/*
 * Module to get the song ids for the playlist from the URL.
 * Reads the song ids and the cloud ids from the URL and gets the songs from the cloud
 * Adds the songs to jplayerPlaylist
 * 
 */
var playListRequest = (function ($, window, document, undefined) {
	var jqXHR;
	var trackList;
	var playerPlaylist;
	var callback;
	var _getUrlParams = function(songs, _trackList, _playerPlaylist, _callback)	{
		
		trackList = _trackList;
		playerPlaylist = _playerPlaylist;
		callback = _callback;
		if(songs.length>0)	{
			var i = 0;
			if (i<songs.length)	{
				getPlayListFromRequest(i, songs);
			}
		}
	};
	
	/**
	 * getting the songIds from the url and add them to the playlist
	 */
	var getPlayListFromRequest = function (i, songs)	{
		if (i<songs.length)	{
			var cloudId = songs[i].substr(0,songs[i].indexOf(":"));
			var songId = songs[i].substr(songs[i].indexOf(":")+1);
			
			if(cloudId==Global.CLOUD_ID_JAMENDO)	{
				jqXHR = Jamendo.getTracks({id:songId}, appendTracksPlayList);
				jqXHR.always(function( json ) {
					var u = i+1;
					getPlayListFromRequest(u, songs);
				});
			} else	if (cloudId==Global.CLOUD_ID_SOUNDCLOUD)	{
				jqXHR = SoundCloud.getTracks({ids:songId}, appendTracksPlayList);
				jqXHR.always(function( json ) {
					var u = i+1;
					getPlayListFromRequest(u, songs);
				});
			} else	if (cloudId==Global.CLOUD_ID_FMA)	{
				jqXHR =  FMA.getTracks({track_id:songId}, appendTracksPlayList);
				jqXHR.always(function( json ) {
					var u = i+1;
					getPlayListFromRequest(u, songs);
				});
			} else	{
				var u = i+1;
				getPlayListFromRequest(u, songs);
			}
		}	else	{
			//when all ids are processed 
			if(callback)	{
				jqXHR.always(function( json ) {
					callback();
				});
			}
		}
	};
	
	var appendTracksPlayList = function (error, data) {
	    $.each(data, function(index, track) {
	    	trackList[track.getCloudId()+track.getId()] = track;
	    	playerPlaylist.add({
				id:track.getCloudId()+":"+track.getId(),
				title:track.getTitle(),
				artist:track.getBand(),
				mp3:track.getMp3Url()
			});
	    });
	    $("#exportar").show();
	    $("#buttonPlaylistInfoDiv").show();
	 };
	
	return {
		/**
		 * getUrlParams get tracks from the URL
		 * songs: array with the ids
		 * trackList: array that stores the playlist
		 * playerPlaylist: jPlayListObject
		 * callback: the callback function
		 */
		getUrlParams: function(songs, trackList, playerPlaylist, callback)	{
			_getUrlParams(songs, trackList, playerPlaylist, callback);
		}

	};
})($, window, document, undefined);