function Artist (id, name, image, url) {
	this.id = id;
	this.name = name;
	this.image = image;
	//* the url of the cloud service *//
	this.url = url;
	this.website;
	this.description;
	//array of tags
	this.tags;
	
	this.getId = function() {
		 return this.id;
	}
	this.getName = function() {
		 return this.name;
	}
	this.getImage = function() {
		 return this.image;
	}
	this.getUrl = function() {
		 return this.url;
	}
	this.getWebsite = function() {
		 return this.website;
	}
	this.getDescription = function() {
		 return this.description;
	}
	this.getTags = function() {
		 return this.tags;
	}
}