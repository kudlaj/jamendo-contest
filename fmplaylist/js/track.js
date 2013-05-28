function Track (id, cloudName, image, title,  band, url) {
	this.id = id;
	this.cloudName = cloudName;
	this.cloudId;
	this.title = title;
	this.mp3Url;
	//this.oggUrl = oggUrl;
	this.cover = image;
	//name of the band/artist
	this.band = band;
	//id of the band/artist
	this.artistId;
	this.url = url;
	this.license;
	//contains one ore more tags like "alternative", "relax"...
	this.tag;
	//contains genre like "Hip Hop", "Rock"
	this.genre;
	//array genres for FMA and Jamendo
	this.genreArray;
	this.album;
	
	this.getId = function() {
		 return this.id;
	}
	this.getTitle = function() {
		 return this.title;
	}
	this.getMp3Url = function() {
		 return this.mp3Url;
	}
	this.getCover = function() {
		 return this.cover;
	}
	this.getCloudName = function() {
		 return this.cloudName;
	}
	this.getCloudId = function() {
		 return this.cloudId;
	}
	this.getBand = function() {
		 return this.band;
	}
	this.getArtistId = function() {
		 return this.artistId;
	}
	this.getUrl = function() {
		 return this.url;
	}
	this.getLicense = function() {
		 return this.license;
	}
	this.getAlbum = function() {
		 return this.album;
	}
	this.getTag = function() {
		return this.tag!=undefined? this.tag:"";
	}
	this.getGenre = function() {
		 return this.genre!=undefined?this.genre:"";
	}
}
