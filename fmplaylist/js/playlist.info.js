/*
 * Module to display the info from the playlist
 * Images and tags. Orders and formats the tags by number of appearance 
 */
var playListInfo = (function ($, window, document, undefined) {
	//Arrays of the genres order by numb. of appearance
	var arrGenres;
	//Arrays of the artists order by numb. of appearance
	var arrArtistas;
	
	/**
	 * showInfo
	 * displays tags and images of the playlist
	 */
	var _showInfo = function (panel, pList)	{
		$(panel).empty();
		var imgHtml = "<div id='imgPlaylist'></div>";
		var tagsHtml = "<div id='tagsPlaylist'></div>";
		
		$(panel).append("<div style='font-weight:bold;cursor:pointer;'><span onClick='hidePlaylistInfo()'>[ close playlist info]</span></div>");
		$(panel).append("<h1>Playlist Info</h1>");
		$(panel).append(imgHtml);
		$(panel).append(tagsHtml);
		
		$(panel).show();
		//hashmap for the genres
		var genresHash = new Hash();
		//hashmap for the artists
		var artistHash = new Hash();
		//hashmap for the images
		var imgHash = new Hash();
		$.each(pList,function(index,value) {
			id = pList[index].id ;
			id = id.replace(":", "");
			track = trackList[id];
			addGenreToHash(track, genresHash);
			addArtistToHash(track, artistHash);	
			if(track.cover && track.cover!="" && !imgHash.hasItem(track.cover))	{
				imgHash.setItem(track.cover, track.cover);
				imgHtml = "<img src='"+track.cover+"' width='100'/>"
				$('#imgPlaylist').append(imgHtml);
			}
		});
		$('#tagsPlaylist').append("<p>");

		arrGenres = genresHash.getItems();
		arrGenres.sort(sortBySize);
		$.each(arrGenres,function(index,value) {
			genreObj = value.genreObject;
			genre = "<span name='genres' onClick='searchTag(this)' size='" + value.size + "'  title='click to lookup the genre " + genreObj.name + "' alt='click to lookup the genre " + genreObj.name + "'> " + genreObj.name + "</span>";
			$('#tagsPlaylist').append(genre);
		});
		
		arrArtistas = artistHash.getItems();
		arrArtistas.sort(sortBySize);
		
		//formats the tags respect the number of apearance (defined by the attribute size)
		$("span[name='genres'][size]").each(function(index, genreObj) {
			var size = $(this).attr("size");
			var percent = parseInt(size) * 10;
			var weight = parseInt(size) * 10;
			var padding = parseInt(size) * 3;
			if(padding>20) 	{
				padding = 20;
			}
			if (percent<100)	{
				percent = 100 + percent;
				weight = weight*2 + "0";
			}	else	{
				percent = 220;
				weight =  "900";
			}
			$(this).css("font-size", percent +"%");
			$(this).css("font-weight", weight);
			$(this).css("padding", padding);
		});
		
	};
	
	function _hideInfo(panel)	{
		$(panel).hide();
	}
	
	/**
	 * sorts the objects of the array
	 */
	var sortBySize = function( a, b ) {
	    return b.size - a.size;
	};
	
	
	/**
	 * adds the genre tags to a hashmap
	 * to avoid duplicate the tags
	 * and to format them late by number of apearance (stored in the attr. size)
	 * IDENTIFIER used because genrename "pop" as key dosn't work 
	 * @param track
	 * @param genresHash
	 * @returns
	 */
	var addGenreToHash = function(track, genresHash)	{
		var IDENTIFIER = "KEY";
		var genre = {};
		$.each(track.genreArray, function(index, genreObj) {
			if(genresHash.hasItem(IDENTIFIER+genreObj.name))	{
				genre = genresHash.getItem(IDENTIFIER+genreObj.name);
				genre.size = genre.size+1;
				genresHash.setItem(IDENTIFIER+genreObj.name, genre);
			}	else	{
				genre = {};
				genre.genreObject = genreObj;
				genre.size = 1;
				genresHash.setItem(IDENTIFIER+genreObj.name, genre);
			}
		});
		return genresHash;
	};
	
	/**
	 * genrates the HTML code for the tag
	 */
	var getTrackGenreHtml = function (track)	{
		var genre = "";
		$.each(track.genreArray, function(index, genreObj) {
			 genre += "<span name='genres' onClick='searchTag(this)' cloudId='"+track.cloudId+"' id='" + genreObj.id + "' title='click to lookup the genre " + genreObj.name + "' alt='click to lookup the genre " + genreObj.name + "'> " + genreObj.name + "</span>";
		});
		return genre;
	};
	
	/**
	 * adds the artistnames  to a hashmap
	 * to avoid duplicate the artistnames
	 * @param track
	 * @param artistHash
	 * @returns
	 */
	var addArtistToHash = function(track, artistHash)	{
		var artistObj = {};
		var artist = track.getBand();
			if(artistHash.hasItem(artist))	{
				artistObj = artistHash.getItem(artist);
				artistObj.size = artistObj.size+1;
				artistHash.setItem(artist, artistObj);
			}	else	{
				artistObj = {};
				artistObj.artistName = artist;
				artistObj.size = 1;
				artistHash.setItem(artist, artistObj);
			}
		
		return artistHash;
	};
	
	return {

		showInfo: function(panel, pList)	{
			_showInfo(panel, pList);
		},
		hideInfo: function(panel)	{
			_hideInfo(panel);
		},
		getPlaylistArtists: function()	{
			return arrArtistas;
		}

	};
})($, window, document, undefined);