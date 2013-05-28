/*
 * Free Music Playlist by J.Kudla
 *
 * Dual licensed under the MIT and GPL licenses.
 *  - http://www.opensource.org/licenses/mit-license.php
 *  - http://www.gnu.org/copyleft/gpl.html
 *
 * Author: J.Kudla  (kudlaj@gmail.com)
 * Version: 0.1.0
 * Date: 6st may 2013
 */

var host = "http://www.freakfandango.es";
var page = 1;
var per_page = 20;


/**
 * Method to get the params from the URL
 */
function getURLParameter(sParam)	{
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++)
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam)
        {
            return sParameterName[1];
        }
    }
}

/**
 * returns the name of the cloud service given the cloudId
 * @param cloudId
 * @returns
 */
function getCloudName(cloudId)	{
	if(cloudId==Global.CLOUD_ID_JAMENDO)	{
		return Global.CLOUD_NAME_JAMENDO;
	}	else if (cloudId==Global.CLOUD_ID_SOUNDCLOUD)	{
		return Global.CLOUD_NAME_SOUNDCLOUD;
	}	else if (cloudId==Global.CLOUD_ID_FMA)	{
		return Global.CLOUD_NAME_FMA;
	}
}
/**
 * global method to trim
 * @param str
 * @returns
 */
function trim(str) {
    return str.replace(/^\s*|\s*$/g,"");
}

/*
 * Inicial Settings
 */
track = new Track();
var trackList = [];
var mySongsPlayList = [];
var playerPlaylist = new jPlayerPlaylist();

//on load
jQuery(document).ready(function() {
	
	$("#songInfo").append("<div class='title'>FreeMusic PlayList</div>")
		.append("<div>Create your own PlayList with songs from:</div>")
		.append("<div style='float: left; margin-right: 30px;'><a href='http://www.jamendo.com' target='_blank'><img src='img/jamendo.png' border='0'/></a></div>")
		.append("<div style='tmargin-right: 30px;'><a href='http://soundcloud.com' target='_blank'><img src='img/soundcloud.png' border='0'/></a></div>")
		.append("<div style='clear:both;margin-left:10px;'><a href='http://freemusicarchive.org' target='_blank'><img src='img/fma.png' border='0'/></a></div>")
		.append("<div style='margin-top:10px;margin-bottom:10px;'>And share it with your friends</div>")
		.append("<div style=''>&nbsp;</div>")
		.slideDown();
	
	//Initializing JPlayer
	$("#jquery_jplayer_1").jPlayer({
		ready: function (event) {},
		swfPath: "js",
		solution: "html, flash",
		supplied: "mp3, oga",
		wmode: "window"
	});
	
	//Initializing JPlayerPlaylist
	playerPlaylist = new jPlayerPlaylist({
		jPlayer: "#jquery_playlist",
		cssSelectorAncestor: "#jplaylist_container"
	}, [
	], {
		playlistOptions: {
		enableRemoveControls: true
		},
		swfPath: "js",
		solution: "html, flash",
		supplied: "mp3"
	});
	
	$("div.jp-playlist ul").sortable({
	    stop: function(event, ui) {
	    	playerPlaylist.scan();
	    }
	});
	
	$("#jquery_playlist").bind($.jPlayer.event.ready , function() {
	    });
	
	$("#jquery_playlist").bind($.jPlayer.event.ended , function() {
	    });
	
	$("#jquery_playlist").bind($.jPlayer.event.play , function() {
	    });
	
	$("#jquery_playlist").bind($.jPlayer.event.loadstart , function() {
		showSongInfo();
	  });
	
	$("#jquery_playlist").bind($.jPlayer.event.error , function() {
	  });
	
	$("#jquery_playlist").bind("remove-track", function() {
		//playerPlaylist.scan();
	});
	
	
	//we get the song Ids from the URL 
	//and add the tracks to the playlist
	var playlist = getURLParameter('playlist');
	if(playlist!=undefined&& playlist!="")	{
		var songs = playlist.split(",");
		$('#resultList').empty();
		//calls playListRequest module
		playListRequest.getUrlParams(songs, trackList, playerPlaylist, playlistInfo);
	}	else	{
		//at the beginning we load the top tracks of every cloudservice
		getTopTracks();
	}
	
	$("#doQuery").click( function() {
    		searchAction();
	});

	$("#searchField").focus(function() {
		$(this).infoSearch("showHelp", $("#searchInfo"));
	});
	
	$("#exportPlaylist").click( function() {
		exportPlayList();
	});

});



/**
 * playlistInfo
 * displays tags and images of the playlist
 * uses module playListInfo (playlist.info.js)
 */
function playlistInfo()	{
	var pList = playerPlaylist.getPlaylist();
	playListInfo.showInfo ($('#playlistInfo'), pList);
}

/**
 * playlistInfo
 * displays tags and images of the playlist and searches for more songs 
 * from the artists of the playlist
 * uses module playListInfo (playlist.info.js)
 */
function playlistInfoArtists()	{
	var pList = playerPlaylist.getPlaylist();
	playListInfo.showInfo ($('#playlistInfo'), pList);
	playListInfo.getPlaylistArtists();
}

function hidePlaylistInfo()	{
	playListInfo.hideInfo ($('#playlistInfo'));
}

/**
 * genrates the HTML code for the tag
 */
function getTrackGenreHtml(track)	{
	var genre = "";
	$.each(track.genreArray, function(index, genreObj) {
		 genre += "<span name='genres' onClick='searchTag(this)' cloudId='"+track.cloudId+"' id='" + genreObj.id + "' title='click to lookup the genre " + genreObj.name + "' alt='click to lookup the genre " + genreObj.name + "'> " + genreObj.name + "</span>";
	});
	return genre;
}

/**
 * searchAction
 * do the search and add the result to the resultList
 * uses the module searchModule (search.js)
 */
function searchAction()	{
	var searchFieldVal = $("#searchField").val();
	var searchCloudsOptions = "";
	var jqXHR;
	
	//check the checkboxes for in which sites to look for 
	var searchClouds = [];
	var numClouds = 0;
	$("input[name='sites']:checked").each(function () {
		searchClouds.push( $(this).val());
		numClouds++;
	});
	
	page = 1;
	per_page = 20;

	per_page = Math.round(per_page/numClouds);
	var searchBy = null;
	if($("input[name='searchOptionsBy']:checked").val())	{
		if($("input[name='searchOptionsBy']:checked").val())	{
			searchBy=$("input[name='searchOptionsBy']:checked").val();
		}
	}
	if($("input[name='searchOptionsOrderJamendo']:checked").val())	{
		jamendoParams.setParams({order:$("input[name='searchOptionsOrderJamendo']:checked").val()});
	}
	if($("input[name='searchOptionsOrderFMA']:checked").val())	{
		fmaParams.setParams({sort_by:$("input[name='searchOptionsOrderFMA']:checked").val()});
	}
	if($("input[name='searchOptionsOrderSC']:checked").val())	{
		soundCloudParams.setParams({order:$("input[name='searchOptionsOrderSC']:checked").val()});
	}
	
	$('#resultList').empty();
	var img = "<div id='loading'><img src='img/loading.gif' hspace='150' vspace='5'/></div>";
	$('#resultList').append(img);
	
	//call the search module
    searchModule.search({
    	searchVal:searchFieldVal, 
    	perPage:per_page, 
    	page:page, 
    	searchClouds: 
    	searchClouds, 
    	searchBy:searchBy
    	}, appendTracks);
   
}

//getting the top 10 songs from all sites
function getTopTracks()	{
	var searchClouds = [];
	var numClouds = 0;
	$("input[name='sites']:checked").each(function () {
		searchClouds.push( $(this).val());
		numClouds++;
	});
	
	page = 1;
	per_page = 20;
	per_page = Math.round(per_page/numClouds);
	var searchBy = null;
	if($("input[name='searchOptionsOrderJamendo']:checked").val())	{
		jamendoParams.setParams({order:$("input[name='searchOptionsOrderJamendo']:checked").val()});
	}	else	{
		jamendoParams.setParams({order:'listens_week'});
	}
	if($("input[name='searchOptionsOrderSC']:checked").val())	{
		soundCloudParams.setParams({order:$("input[name='searchOptionsOrderSC']:checked").val()});
	}	else	{
		soundCloudParams.setParams({order:'hotness'});
	}
	if($("input[name='searchOptionsOrderFMA']:checked").val())	{
		fmaParams.setParams({sort_by:$("input[name='searchOptionsOrderFMA']:checked").val()});
	}	else	{
		fmaParams.setParams({sort_by:'track_interest'});
	}
	$('#resultList').empty();
	var img = "<div id='loading'><img src='img/loading.gif' hspace='150' vspace='5'/></div>";
	$('#resultList').append(img);
	
	//call the search module
	searchModule.search({
		searchVal:'', 
		perPage:per_page, 
		page:page, 
		searchClouds: searchClouds, 
		searchBy: null
		}, appendTracks);
}

//method to get the next elements of the search
function getMore(elem) {
	var cloudId = $(elem).attr("cloudId");
	var img = "<div id='loading'><img src='img/loading.gif' hspace='150' vspace='0'/></div>";
	$('ul#resultList div#more[cloudId="'+cloudId+'"]').before(img);
	
	searchModule.searchMore(cloudId, {searchClouds: [cloudId]}, appendTracks);
}


function showSongInfo()	{
	var trackId = getCurrentTrackId(playerPlaylist.current);
    var track = trackList[trackId];
    var cloudId = track.getCloudId();
    $("#songInfo").empty();
    
    $("#songInfo").append("<ul></ul>");
    $("#songInfo ul").append("<li><strong>" + track.getTitle()+"<strong></li>");
    $("#songInfo ul").append("<li><span name='band' onClick='searchArtist(this)' cloudId='"+cloudId+"' artistId='" + track.getArtistId()+"' alt='click to search for this artist' title='click to search for this artist'>" + track.getBand()+"</span>" +
    		"<span onClick='getArtistInfo(this)' cloudId='"+cloudId+"' artistName='"+track.getBand()+"' artistId='" + track.getArtistId()+"' alt='click to get more information about " + track.getBand()+"' title='click to get more information about " + track.getBand()+"'><img src='img/info.png' id='iconInfo'></span>"+
    	"</li>");
    $("#songInfo ul").append("<li>" + track.getCloudName()+": <a href='" + track.getUrl()+"' target='_blank' >Track page</a></li>");
    $("#songInfo ul").append("<li>License: " + track.getLicense()+"</li>");
    
    if(track.genreArray)	{
    	 $("#songInfo ul").append("<li>Genre: " + getTrackGenreHtml(track) + "</li>");
    }
    
    if(cloudId==Global.CLOUD_ID_JAMENDO)	{
		 $("#songInfo ul").append("<li><span name='similar' trackId='" + track.getId()+"' artistId='" + track.getArtistId()+"' onClick='getSimilarJamendoTacks(this)'>Get similar tracks from Jamendo</span></li>");
    }	else if(cloudId==Global.CLOUD_ID_FMA)	{
		 $("#songInfo ul").append("<li id='similarEchonest'><span  name='similar' trackId='" + track.getId()+"' artistId='" + track.getArtistId()+"' onClick='getSimilarFMAArtist(this)'>Get similar artists</span> Powered by <a href='http://the.echonest.com/' target='_blank'>ECHONEST</a></li>");
	}
    $("#songInfo ul").append("<li id='similarLastFm'><span name='similar'  artistName='" +  track.getBand() + "' onClick='getSimilarLastFMArtist(this)'>Get similar artists</span> Powered by <a href='http://last.fm/' target='_blank'>Last.FM</a></li>");
   // $("#songInfo ul").append("<li onClick=\"moreInfo('"+trackId+"', '"+track.getCloudId()+"')\" id='moreInfo'>[+] show more</li>");
    $("#songInfo").slideDown();
    $("#songInfo").css("display", "table");
    $("title").html(track.getTitle());
    if(track.getCover()!=undefined)	{
    	$("#songInfo").css('background-image', 'url("'+track.getCover()+'")');
    }	else	{
    	getAlbumCover(track.getAlbum(), track.getCloudId());
    }
}

function appendTags(error, data)	{
	if(data && data.length>0){
		var tags = "";
		$.each(data, function(index, track) {
			tags += " " + track.getTag();
	    });
		 $("#songInfo ul li#moreInfo").before("<li>Tags: " + tags +"</li>");
	}
}

//Method to search info and tracks from this artist
function searchArtist(elem)	{
	$('#resultList').empty();
	//search for tracks
	 $("#searchField").val($(elem).html());
	 searchAction();
	 
	//search for info
	 var artistId = $(elem).attr("artistId");
	 var cloudId = $(elem).attr("cloudId");
	 var params = {};
	 params.id = artistId;
	 if(cloudId==Global.CLOUD_ID_JAMENDO)	{
		 Jamendo.getArtistInfo(params, showArtistInfo);
	 }	 else 	{
		 //params.id = "fma:artist:"+ artistId;
		 //we pass also the artist name by params
		 //ECHONEST.getArtistInfo(params, showArtistInfo);
		 params = {};
		 params.artist = $(elem).html();
		 LastFm.getArtists(params, showArtistInfo);
	 }
}

function getArtistInfo(elem)	{
	$("#artistDescription").remove();
	 //search for info
	 var artistId = $(elem).attr("artistId");
	 var artistName = $(elem).attr("artistName"); 
	 var cloudId = $(elem).attr("cloudId");
	 var params = {};
	 params.id = artistId;
	 if(cloudId==Global.CLOUD_ID_JAMENDO)	{
		 Jamendo.getArtistInfo(params, showArtistInfo);
	 }	 else 	{
		 //params.id = "fma:artist:"+ artistId;
		 //we pass also the artist name by params
		 //ECHONEST.getArtistInfo(params, showArtistInfo);
		 params = {};
		 params.artist = artistName;
		 LastFm.getArtists(params, showArtistInfo);
	 }
}

function showArtistInfo(error, data)	{
	var artist;
	var artistHtml;
	if(data && data.length>0){
		artist = data[0];
		artistHtml = "<div id='artistDescription'>";
		artistHtml += "<div style='font-weight:bold;cursor:pointer;'><span onClick='closeArtistInfo()'>[ close artist info]</span></div>";
		artistHtml += "<h1 ><a href='"+artist.website+"' target='_blank'>"+artist.name+"</a></h1>";
		artistHtml += "<div style='float:left;margin-right:5px;margin-bottom:5px;'><img src='"+artist.image+"'/></div>";
		artistHtml += "<div>"+artist.description+"</div>";
		artistHtml += "</div>";
		$('#resultList').prepend(artistHtml);
	}
}

function closeArtistInfo()	{
	$("#artistDescription").remove();
}

function getSimilarJamendoTacks(elem)	{
	$('#resultList').empty();
	var img = "<div id='loading'><img src='img/loading.gif' hspace='150' vspace='5'/></div>";
	$('#resultList').append(img);
	var trackId = $(elem).attr("trackId");
	var artistId = $(elem).attr("artistId");
	var params = {};
	params.id = trackId;
	params.no_artist = artistId;
	jamendoParams.setParams(params);
	searchModule.search({searchVal:'', perPage:20, page:1, searchClouds: [Global.CLOUD_ID_JAMENDO], searchBy: "similartracks"}, appendTracks);
}

function getSimilarFMAArtist(elem)	{
	var trackId = $(elem).attr("trackId");
	var artistId = $(elem).attr("artistId");
	var params = {};
	params.id = "fma:artist:"+artistId;
	ECHONEST.getSimilarArtists(params, addSimilarFMAArtists, 1, 10);
}

function getSimilarLastFMArtist(elem)	{
	var artist = $(elem).attr("artistName");
	var params = {};
	params.artist = artist;
	params.limit=9;
	params.autocorrect=1;
	LastFm.getSimilarArtists(params, addSimilarLastFMArtists);
}

function addSimilarFMAArtists(msg, data)	{
	$('li#similarLast').remove();
	$('li#similarEcho').remove();
	if(data && data.length>0){
	 $.each(data, function(index, json) {
		 fmaId = json.foreign_ids[0].foreign_id;
		 fmaId = fmaId.substr(fmaId.lastIndexOf(":")+1)
		 $("li#similarEchonest").after("<li id='similarEcho'><span id='similar' artistId='"+fmaId+"' onClick='searchArtistFMA(this)' alt='click to search for this artist' title='click to search for this artist' >"+json.name+ "</span></li>");
	 });
	}	else	{
		$("li#similarEchonest").after("<li id='similarEcho'>No artist found</li>");
	}
}

//adding a list of similar artist to the songinfo panel
function addSimilarLastFMArtists(msg, data)	{
	$('li#similarLast').remove();
	$('li#similarEcho').remove();
	if(data && data.length>0){
	 $.each(data, function(index, json) {
		 $("#songInfo ul").append("<li id='similarLast'><span id='similar' artistName='"+json.name+"' onClick='searchArtist(this)' alt='click to search for this artist' title='click to search for this artist' >"+json.name+ "</span></li>");
	 });
	}	else	{
		 $("#songInfo ul").append("<li id='similarLast'>No artist found</li>");
	}
}

//getting tracks of the FMA Artist by the artistId
function searchArtistFMA(elem)	{
	$('#resultList').empty();
	var img = "<div id='loading'><img src='img/loading.gif' hspace='150' vspace='5'/></div>";
	$('#resultList').append(img);
	var artistId = $(elem).attr("artistId");
	var params = {};
	params.artist_id = artistId;
	
	fmaParams.setParams(params);
	searchModule.search({searchVal:'', perPage:20, page:1, searchClouds: [Global.CLOUD_ID_FMA], searchBy: "similartracks"}, appendTracks);
}

function searchTag(elem)	{
	$('#resultList').empty();
	var genreId = $(elem).attr("id");
	 var cloudId = $(elem).attr("cloudId");
	//alert(genreId);
	 if(cloudId==Global.CLOUD_ID_FMA)	{
		 	$("#searchField").val("#"+trim($(elem).html()));
			$('#resultList').empty();
			var img = "<div id='loading'><img src='img/loading.gif' hspace='150' vspace='5'/></div>";
			$('#resultList').append(img);
			
			var params = {};
			params.genre_id = genreId;
			params.sort_by="track_interest";
			params.sort_dir="desc";
			fmaParams.setParams(params);
			var ajax = FMA.getSongs(params, appendTracks);
			ajax.always(function() {
				$('#loading').remove();
			});
	 }
	 else 	{
		$("#searchField").val("#"+trim($(elem).html()));
		searchAction();
	}	
}

function searchActualBand()	{
	if($("#searchField").val()=="")	{
		$('#resultList').empty();
		var trackId = getCurrentTrackId(playerPlaylist.current);
	    var track = trackList[trackId];
	    $("#searchField").val(track.getBand());
	    searchAction();
	}
}

function getAlbumCover(album, cloudId)	{
	if(cloudId==Global.CLOUD_ID_FMA)	{
		FMA.getAlbums({album_title:album}, setAlbumCover);
	}	else	{
		$("#songInfo").css('background-image', '');
	}
}

function setAlbumCover(error, data) {
	if(data!=undefined)	{
		$("#songInfo").css('background-image', 'url("'+data[0].album_image_file+'")');
	}	else	{
		$("#songInfo").css('background-image', '');
	}
}

/** 
 * Adds a song to the playlist
 * @param id 
 * @param cloudId
 */
function addPlayList(id, cloudId){
	$("#exportar").show();
	$("#buttonPlaylistInfoDiv").show();
	playerPlaylist.add({
		id:cloudId +":"+ id,
		title:trackList[cloudId + id].getTitle(),
		artist:trackList[cloudId + id].getBand(),
		mp3:trackList[cloudId + id].getMp3Url()
	});
}

/**
 * appendTracks
 * appends the tracks from the ajax calls to the search results
 * if page is >1 (means it was a "get more" search) it appends the songs to the searchlist of the respective cloud
 * 
 * @param error
 * @param data
 * @param page
 * @param per_page
 */
function appendTracks(error, data, page, per_page) {
	if(error==null)	{
		if(page==undefined || page==1)	{
			if(data.length>0)	{
				$('#resultList').append("<div id='"+data[0].getCloudId()+"'>"+getCloudName(data[0].getCloudId())+"</div>");
			}
		    $.each(data, function(index, track) {
		    	trackList[track.getCloudId()+track.getId()] = track;
		    	var info = trackToHTML(track);
		     	$('#resultList').append(info);
		     	
		    });
		    if(data.length>0)	{
				$('#resultList').append("<div id='more' cloudId='"+data[0].getCloudId()+"' onClick='getMore(this);'>[+] more Results</div>");
			}
		} else if (page!=undefined || page>1)	{
			 $.each(data, function(index, track) {
			    	trackList[track.getCloudId()+track.getId()] = track;
			    	var info = trackToHTML(track);
			    	$('ul#resultList div#more[cloudId="'+track.getCloudId()+'"]').before(info);
			   });
		}
	}	else	{
		$('#resultList').append("<div id='"+data.getCloudId()+"'>"+data.getCloudName()+"</div>");
		$('#resultList').append("<div id='error'>"+error+"</div>");
	}
}

/**
 * converts the object track in a html element
 * @param track
 * @returns {String}
 */
function trackToHTML(track){
	var img = "";
	if (track.getCover()!=null) {img = "<div id='albumcover'><img src='"+  track.getCover() + "' width='50' height='50' /></div>";}
   	var song = "<div id='song"+track.getId()+"'>"+track.getTitle()+"</div>";
	var artist = "<div id='artist'>"+track.getBand()+"</div>";
	var source = "<div id='source'>'"+track.getCloudName()+"': <a href='"+track.getUrl()+"' target='_blank'>Song page</a></div>";
	var genre = "";
	var tag = "";
	if (track.getGenre()!="")	{ genre = " genre='"+ track.getGenre() +"' " }
	if (track.getTag()!="")	{ tag = " tag='"+ track.getTag() +"' " }
	var controls = "<div id='controls' songId='"+track.getId()+"'><a href='javascript:playSound("+track.getId()+", \""+track.getCloudId()+"\")' id='"+track.getCloudId()+track.getId()+"'>play</a> | <a href='javascript:addPlayList("+track.getId()+", \""+track.getCloudId()+"\")'>add </a></div>";
 	var info = "<li cloudId='"+track.getCloudId()+"' cloudName='"+track.getCloudName()+"'  id='"+track.getId()+"' "+genre + tag +" onmouseover='showInfo(this)'>" + img + " " + song + artist  + source  + controls + "</li>";
 	return info;
	
}

var actualSongId = 0;

/**
 * stops the sound of the previev (NOT the playlist)
 * @param id
 * @param cloudId
 */
function stopSound(id, cloudId)	{
	$("#jquery_jplayer_1").jPlayer("pause");
	$(" a#"+cloudId+id).html("play");
	$(" a#"+cloudId+id).attr("href", "javascript:playSound("+id+", \""+cloudId+"\")");
}
/**
 * plays the sound of the previev (NOT the playlist)
 * @param id
 * @param cloudId
 */
function playSound(id, cloudId)	{
	resetPlayButtons();
	$(" a#"+cloudId+id).html("stop");
	$(" a#"+cloudId+id).attr("href", "javascript:stopSound("+id+",  \""+cloudId+"\")");

	if(cloudId==Global.CLOUD_ID_JAMENDO)	{
		playJamendo(id);
	} else if(cloudId==Global.CLOUD_ID_SOUNDCLOUD)	{
		playSoundcloud(id);
	}	else if(cloudId==Global.CLOUD_ID_FMA)	{
		playFMA(id);
	}
}
/**
 * resets all play/stop buttons of the songs of the search result
 */
function resetPlayButtons()	{
	$("li div#controls a[href*='stopSound']").each(function(index) {
		var id = $(this).parent("div#controls").attr("songId");
		var cloudId = $(this).parent("div").parent("li").attr("id");
		$(this).html("play");
		$(this).attr("href", "javascript:playSound("+id+", '"+cloudId+"')");
	});
}

function playFMA(id)	{
	actualSongId = id;
	
	$("#jquery_jplayer_1").jPlayer("destroy");
	playerPlaylist.pause();
	var mp3File = trackList[Global.CLOUD_ID_FMA + id].getMp3Url();
	playerPlaylist.pause();
	$("#jquery_jplayer_1").jPlayer({
		ready: function (event) {
			$(this).jPlayer("setMedia", {
				mp3:mp3File
			}).jPlayer("play");
		},
		swfPath: "js",
		solution: "html, flash",
		supplied: "mp3",
		wmode: "window"
	});
}

function playJamendo(id)	{
	actualSongId = id;

	$("#jquery_jplayer_1").jPlayer("destroy");
	playerPlaylist.pause();
	$("#jquery_jplayer_1").jPlayer({
		ready: function (event) {
			$(this).jPlayer("setMedia", {
				mp3:"http://api.jamendo.com/get2/stream/track/redirect/?id="+id+"&streamencoding=mp31",
				oga:"http://api.jamendo.com/get2/stream/track/redirect/?id="+id+"&streamencoding=ogg2"
			}).jPlayer("play");
		},
		swfPath: "js",
		solution: "html, flash",
		supplied: "mp3, oga",
		wmode: "window"
	});
	
 }


function playSoundcloud(id)	{
	actualSongId = id;

	$("#jquery_jplayer_1").jPlayer("destroy");
	playerPlaylist.pause();
	$("#jquery_jplayer_1").jPlayer({
		ready: function (event) {
			$(this).jPlayer("setMedia", {
				mp3:"https://api.soundcloud.com/tracks/"+id+"/stream?client_id=f21005ad936093c154cae9fa962d0905"
			}).jPlayer("play");
		},
		swfPath: "js",
		solution: "html, flash",
		supplied: "mp3",
		wmode: "window"
	});
	
 }

function getCurrentTrackId(current)	{
	var pList = playerPlaylist.getPlaylist();
	var trackId = pList[current].id.replace(":", "");
	return trackId;
}

function getTrackFromArrayById(id)	{
	$.each(trackList,function(index,value) {
  	  	if (value.id == id )
  		  return value.data;
    });
}

function exportPlayList()	{
	$("#exportar").empty();
	var pList = playerPlaylist.getPlaylist();
	var urlExportar= host+"/fmplaylist.html?playlist="
	$.each(pList,function(index,value) {
		urlExportar = urlExportar + pList[index].id + ",";
	});
	var input = "<div>Link: </div><input type='text' size='60' onclick='$(\"#linkExport\").select();' value='"+urlExportar+"' id='linkExport'/>";
	$("#exportar").append("<span id='exportPlaylist' onClick='exportPlayList()'>share Playlist</span>");
	$("#exportar").append(input);
	$("#linkExport").select();
	var linkShorten = "<a href='javascript:void(0);' id='linkTinyUrl' onclick='getTinyUrl(\""+urlExportar+"\")'>Shorten URL</a><span id='shortenWait'></span>";
	$("#exportar").append(linkShorten);
	var iframeCode = getIframeCode(urlExportar);
	var iframe = "<div>Embed HTML: </div><input type='text' size='60' onclick='$(\"#iframeExport\").select();' value='"+iframeCode+"' id='iframeExport'/>";
	$("#exportar").append(iframe);
}

function getTinyUrl(url)	{
		var tinyUrl = url;
		var imgLoading = "<img src='img/arrows.gif' id='loadingTinyUrl'/>";
		$("#shortenWait").append(imgLoading);
		 var ajax = $.ajax({
		      url: 'http://json-tinyurl.appspot.com/?url='+url+"&callback=tinyData",
		      dataType: 'jsonp',
		      cache:false,
		      //data: params,
		    });
		 ajax.always(function( ) {
				$('#loadingTinyUrl').remove();
		 });
		 ajax.fail(function(data, textStatus) {
				//$("#exportar").append(textStatus);
		 });
}

function tinyData(data)	{
	if(data)	{
		$("#linkExport").val(data.tinyurl);
		$("#linkExport").select();
	}
}

function getIframeCode(url)	{
	var html = '<iframe  width="450" height="500" frameborder="0" src="'+url+'"></iframe>';
	return html;
}

function showInfo(elem)	{
	$(elem).infoTracks("show", $("#trackInfo"));
}

function advancedSearch()	{
	$('#advancedSearchOptions').remove();
	var html = "<div id='advancedSearchOptions'>";
	html += "<p class='title'>Advanced Search:</p>";
	
	html += "<div id='searchBy'><p>Search by:</p>";
	html += "<div><label><input type='radio' name='searchOptionsBy' id='artist' value='artist' /> Search by artist name</label></div>";
	html += "<div><label><input type='radio' name='searchOptionsBy' id='tag' value='tag' /> Search by tags/genres</label></div>";
	html += "<div><label><input type='radio' name='searchOptionsBy' id='track' value='track' /> Search by the name of the song (not available for FMA)</label></div>";
	html += "<div><label><input type='radio' name='searchOptionsBy' id='similarArtist' value='similarArtist' /> Get tracks similar to this Artist (only for Jamendo)</label></div>";
	html += "<div><label><input type='radio' name='searchOptionsBy' id='lastFmUser' value='lastFmUser' /> Get recommended tracks by Last.FM user</label></div>";
	html += "</div>";
	
	html += "<div id='orderBy'><p>Order by:</p>";
	html += "<div id='orderByJamendo'><div>Jamendo results</div>";
	html += "<div><input type='radio' name='searchOptionsOrderJamendo' value='artist_name' />Artist name</div>";
	html += "<div><input type='radio' name='searchOptionsOrderJamendo' value='popularity_total' />Popularity (total)</div>";
	html += "<div><input type='radio' name='searchOptionsOrderJamendo' value='popularity_week' />Popularity (week)</div>";
	html += "<div><input type='radio' name='searchOptionsOrderJamendo' value='listens_total' />Listens (total)</div>";
	html += "<div><input type='radio' name='searchOptionsOrderJamendo' value='listens_week' />Listens (week)</div>";
	html += "<div><input type='radio' name='searchOptionsOrderJamendo' value='releasedate_desc' />Date</div>";
	html += "</div>";
	
	html += "<div id='orderByFMA'><div>FMA results</div>";
	html += "<div><input type='radio' name='searchOptionsOrderFMA' value='track_interest' />Track interest</div>";
	html += "<div><input type='radio' name='searchOptionsOrderFMA' value='track_favorites' />Number of favorites</div>";
	html += "<div><input type='radio' name='searchOptionsOrderFMA' value='track_listens' />Number of listens</div>";
	html += "<div><input type='radio' name='searchOptionsOrderFMA' value='track_date_created' />Date</div>";
	html += "</div>";
	
	html += "<div id='orderBySC'><div>Soundcloud results</div>";
	html += "<div><input type='radio' name='searchOptionsOrderSC'  value='hotness' />Popularity</div>";
	html += "<div><input type='radio' name='searchOptionsOrderSC'  value='created_at' />Date</div>";
	html += "</div>";
	
	html += "</div>";
	
	html += "<p>What is hot??</p>";
	html += "<div id='topTracks'><span onclick='getTopTracks()'>Get top tracks</span></div> ";
	html += "</div>";
	$('#resultList').prepend(html);
	if(searchModule.getSearchOptions().searchBy)
		$("input[name='searchOptionsBy'][value='"+searchModule.getSearchOptions().searchBy+"']").attr('checked', 'checked');
	else
		$("input[name='searchOptionsBy'][value='artist']").attr('checked', 'checked');
	
	$("input[name='searchOptionsOrderJamendo'][value='"+jamendoParams.getParams().order+"']").attr('checked', 'checked');
	$("input[name='searchOptionsOrderSC'][value='"+soundCloudParams.getParams().order+"']").attr('checked', 'checked');
	$("input[name='searchOptionsOrderFMA'][value='"+fmaParams.getParams().sort_by+"']").attr('checked', 'checked');
}
