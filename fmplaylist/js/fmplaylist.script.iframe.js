//Free Music Playlist by J.Kudla 
var CLOUD_ID_JAMENDO = "J";
var CLOUD_ID_SOUNDCLOUD = "SC";
var CLOUD_ID_FMA = "FMA";
var CLOUD_NAME_JAMENDO = "Jamendo";
var CLOUD_NAME_SOUNDCLOUD = "SoundCloud";
var CLOUD_NAME_FMA = "FreeMusicArchive";
var host = "http://www.freakfandango.es";
var page = 1;
var per_page = 20;

//Method to get the params from the URL
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


function getCloudName(cloudId)	{
	if(cloudId==CLOUD_ID_JAMENDO)	{
		return CLOUD_NAME_JAMENDO;
	}	else if (cloudId==CLOUD_ID_SOUNDCLOUD)	{
		return CLOUD_NAME_SOUNDCLOUD;
	}	else if (cloudId==CLOUD_ID_FMA)	{
		return CLOUD_NAME_FMA;
	}
}

function trim(str) {
    return str.replace(/^\s*|\s*$/g,"");
}

track = new Track();

var trackList = [];
var mySongsPlayList = [];

var playerPlaylist = new jPlayerPlaylist();

//getting the songIds from the url and add them to the playlist
function getPlayListFromRequest(i, songs)	{
	$("#exportar").show();
	if (i<songs.length)	{
		
		var cloudId = songs[i].substr(0,songs[i].indexOf(":"));
		var songId = songs[i].substr(songs[i].indexOf(":")+1);
		
		if(cloudId==CLOUD_ID_JAMENDO)	{
			var respond = Jamendo.getTracks({id:songId}, appendTracksPlayList);
			respond.always(function( json ) {
				var u = i+1;
				getPlayListFromRequest(u, songs);
			});
		} else	if (cloudId==CLOUD_ID_SOUNDCLOUD)	{
			var respond = addSoundCloudTrackById(songId);
			respond.always(function( json ) {
				var u = i+1;
				getPlayListFromRequest(u, songs);
			});
		} else	if (cloudId==CLOUD_ID_FMA)	{
			var respond =  FMA.getTracks({track_id:songId}, appendTracksPlayList);
			respond.always(function( json ) {
				var u = i+1;
				getPlayListFromRequest(u, songs);
			});
		} else	{
			var u = i+1;
			getPlayListFromRequest(u, songs);
		}
	}	else	{
		showSongInfo();
	}
}

jQuery(document).ready(function() {
	
	
	
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
	
	
	var playlist = getURLParameter('playlist');
	if(playlist!=undefined&& playlist!="")	{
		var songs = playlist.split(",");
		if(songs.length>0)	{
			//trackList = [];
			var i = 0;
			if (i<songs.length)	{
				getPlayListFromRequest(i, songs);
			}
		}
	}	


});


function showSongInfo()	{
	var trackId = getCurrentTrackId(playerPlaylist.current);
    var track = trackList[trackId];
    var cloudId = track.getCloudId();
    $("#songInfo").empty();
    
    $("#songInfo").append("<ul></ul>");
    $("#songInfo ul").append("<li><strong>" + track.getTitle()+"<strong></li>");
    $("#songInfo ul").append("<li><span name='band' >" + track.getBand()+"</span>" +  	"</li>");
    $("#songInfo ul").append("<li>" + track.getCloudName()+": <a href='" + track.getUrl()+"' target='_blank' >Track page</a></li>");
    $("#songInfo ul").append("<li>License: " + track.getLicense()+"</li>");
    $("#songInfo").slideDown();
    $("#songInfo").css("display", "table");
    $("title").html(track.getTitle());
    if(track.getCover()!=undefined)	{
    	$("#songInfo").css('background-image', 'url("'+track.getCover()+'")');
    }	else	{
    	getAlbumCover(track.getAlbum(), track.getCloudId());
    }
}


function getAlbumCover(album, cloudId)	{
	if(cloudId==CLOUD_ID_FMA)	{
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



function addPlayList(id, cloudId){
	$("#exportar").show();
	playerPlaylist.add({
		id:cloudId +":"+ id,
		title:trackList[cloudId + id].getTitle(),
		artist:trackList[cloudId + id].getBand(),
		mp3:trackList[cloudId + id].getMp3Url()
	});
	
}

//add jamendo song to playlist
function addJamendo(id){
	playerPlaylist.add({
		id:CLOUD_ID_JAMENDO +":"+ id,
		title:trackList[CLOUD_ID_JAMENDO + id].getTitle(),
		artist:trackList[CLOUD_ID_JAMENDO + id].getBand(),
		mp3:"http://api.jamendo.com/get2/stream/track/redirect/?id="+id+"&streamencoding=mp31"
		//oga:"http://api.jamendo.com/get2/stream/track/redirect/?id="+id+"&streamencoding=ogg2"
		//poster: trackList["Jamendo"+id].getCover()
	});
	
}
//add FMA song to playlist
function addFMA(id){
	playerPlaylist.add({
		id:CLOUD_ID_FMA +":"+ id,
		title:trackList[CLOUD_ID_FMA + id].getTitle(),
		artist:trackList[CLOUD_ID_FMA + id].getBand(),
		mp3:trackList[CLOUD_ID_FMA + id].getMp3Url()
		//oga:"http://api.jamendo.com/get2/stream/track/redirect/?id="+id+"&streamencoding=ogg2"
		//poster: trackList["Jamendo"+id].getCover()
	});
	
}
//add SC song to playlist
function addSoundCloud(id){
	playerPlaylist.add({
		id:CLOUD_ID_SOUNDCLOUD + ":"+ id,
		title:trackList[CLOUD_ID_SOUNDCLOUD + id].getTitle(),
		artist:trackList[CLOUD_ID_SOUNDCLOUD + id].getBand(),
		mp3:"https://api.soundcloud.com/tracks/"+id+"/stream?client_id=f21005ad936093c154cae9fa962d0905"
		//poster: trackList["Jamendo"+id].getCover()
	});
	
}



function appendTracksPlayList(error, data) {
	
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
  }


//TODO cambiar codigo
function addSoundCloudTrackById(trackId)	{
	var url = "http://api.soundcloud.com/tracks/"+trackId+".json?client_id=f21005ad936093c154cae9fa962d0905";
	//artwork_url
	var date = new Date();
	var ms = date.getTime();
	return $.getJSON(url + "&timestp="+ms, 
       	function(json) {
			track = new Track(trackId, CLOUD_NAME_SOUNDCLOUD, json['artwork_url'], json['title'], json['user']['username'], json['permalink_url'] );
			trackList[CLOUD_ID_SOUNDCLOUD +trackId] = track;
			playerPlaylist.add({
				id:CLOUD_ID_SOUNDCLOUD + ":" + trackId,
				title:json['title'],
				artist:json['user']['username'],
				mp3:"https://api.soundcloud.com/tracks/"+trackId+"/stream?client_id=f21005ad936093c154cae9fa962d0905"
			});

     	 }); 
}


function addFMATrack(error, data)	{
	if (error) {
	      return;
	} 
	$.each(data, function(index, json) {
		track = new Track(json.track_id, CLOUD_NAME_FMA, json.track_image_file, json.track_title, json.artist_name, json.track_url );
       	track.mp3Url = json.track_url + "/download";
       	trackList[CLOUD_ID_FMA + json.track_id] = track;
		playerPlaylist.add({
			id:CLOUD_ID_FMA + ":" + json.track_id,
			title:json.track_title,
			artist:json.artist_name,
			mp3:json.track_url + "/download"
		});
	});
}

function getJamendoTracksByArtist(artistId)	{
	return Jamendo.getTracks({artist_id:artistId,order:'popularity_total'}, appendTracks);
}

function getJamendoTracksByAlbum(albumId)	{
	return Jamendo.getTracks({album_id:albumId}, appendTracks);
}

function getJamendoTracksByTrackId(id)	{
	return Jamendo.getTracks({id:id}, appendTracks);
}


function getSoundCloudTracksByUrl(url)	{
	page_soundcloud = 1;
	per_page = 20;
	var date = new Date();
	var ms = date.getTime();
	var soundcloud = SoundCloud.getByUrl({url:url}, appendTracks);
	soundcloud.always(function() { $('#loading').remove(); });
	return soundcloud;
}

function getFMATracksByUrl(url)	{
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
		fma = FMA.getTracks({album_handle:albumHandle}, appendTracks, page_fma, per_page);
	}	else if (albumHandle=="" && artistHandle!="")	{
		fma = FMA.getTracks({artist_handle:artistHandle}, appendTracks, page_fma, per_page);
	}
	fma.always(function() { $('#loading').remove(); });
	
}

function getJamendoTracksByUrl(url)	{
	var artistId = "";
	var albumId = "";
	var trackId = "";
	var handles = url.split('/');
	
	var isArtist = url.indexOf("artist");
	var isTrack = url.indexOf("track");
	var isAlbum = url.indexOf("list");
	
	if (isArtist>0)	{
		artistId = getJamendoArtistId(handles);
		return getJamendoTracksByArtist(artistId);
	}	else if (isTrack>0)	{
		trackId = getJamendoTrackId(handles);
		return getJamendoTracksByTrackId(trackId);
	}	else if (isAlbum>0)	{
		albumId = getJamendoAlbumId(handles);
		return getJamendoTracksByAlbum(albumId);
	}
	
	
	
}

function getJamendoArtistId(handles)	{
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
}
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
}
function getJamendoTrackId(handles)	{
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

function stopSound(id, cloudId)	{
	
	$("#jquery_jplayer_1").jPlayer("pause");
	$(" a#"+cloudId+id).html("play");
	$(" a#"+cloudId+id).attr("href", "javascript:playSound("+id+", \""+cloudId+"\")");
	
}

function playSound(id, cloudId)	{
		resetPlayButtons();
		$(" a#"+cloudId+id).html("stop");
		$(" a#"+cloudId+id).attr("href", "javascript:stopSound("+id+",  \""+cloudId+"\")");

		
		if(cloudId==CLOUD_ID_JAMENDO)	{
			playJamendo(id);
		} else if(cloudId==CLOUD_ID_SOUNDCLOUD)	{
			playSoundcloud(id);
		}	else if(cloudId==CLOUD_ID_FMA)	{
			playFMA(id);
		}

}

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
	var mp3File = trackList[CLOUD_ID_FMA + id].getMp3Url();
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



