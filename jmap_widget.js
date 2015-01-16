
// #############################################################
//// Define functions we need for constructing the map.	
function loadjscssfile(filename, filetype){
	if (filetype=="js"){ //if filename is a external JavaScript file
		var fileref=document.createElement('script')
		fileref.setAttribute("type","text/javascript")
		fileref.setAttribute("src", filename)
	} else if (filetype=="css"){ //if filename is an external CSS file
		var fileref=document.createElement("link")
		fileref.setAttribute("rel", "stylesheet")
		fileref.setAttribute("type", "text/css")
		fileref.setAttribute("href", filename)
	}
	if (typeof fileref!="undefined")
		document.getElementsByTagName("head")[0].appendChild(fileref)
}


String.prototype.trimRight = function(charlist) {
	if (charlist === undefined)
		charlist = "\s";
	return this.replace(new RegExp("[" + charlist + "]+$"), "");
};

var buildCitation = function(title,authors,year,journal,vol,iss,spage,epage) {
	authorlist = '';
	for (i = 0; i < authors.length; i++) {
		if (i===0) {
			var sep = '';
		} else if (i===(authors.length-1)) {
			sep = ' and ';
		} else {
			sep = ', ';
		}
		authorlist += sep+authors[i];
	}
	var vips = '';
	if (vol!='') { vips+=vol; }
	if (iss!='') { vips+='('+iss+')'; }
	if (vips!='') { vips+=':'; }
	if (spage!='') { vips+=spage; }
	if (epage!='') { vips+='-'+epage; }
	return(authorlist.trimRight('.')+'. '+year.trimRight('.')+'. '+title.trimRight('.')+'. '+'<em>'+journal.trimRight('.')+'</em> '+vips);
};

var buildDOIlink = function(doi) {
	return('<a href="http://dx.doi.org/'+doi+'" target="_blank">'+doi+'</a>');
};


// #############################################################
// Load other scripts and CSS that we need
loadjscssfile("https://www.journalmap.org/assets/application-93ac457f7c192d5b9a815e8253889485.css","css");
loadjscssfile("http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.css","css");
loadjscssfile("http://leaflet.github.io/Leaflet.markercluster/dist/MarkerCluster.css","css");
loadjscssfile("http://leaflet.github.io/Leaflet.markercluster/dist/MarkerCluster.Default.css","css");
//loadjscssfile("http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js","js");
loadjscssfile("http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.js","js");
loadjscssfile("http://leaflet.github.io/Leaflet.markercluster/dist/leaflet.markercluster-src.js","js");


// #############################################################
// Set up map builder function
  		
//var JMap = function(apikey,collectionID,centerLat,centerLon,Zoom,width) {

//Get the map properties from the div tag

  		
  		$(document).ready(function() {

var attributes = $("#jmap")[0].attributes["data"].value.split(';');
var apikey = attributes[0].split(':')[1];
var collectionID = attributes[1].split(':')[1];
var centerLat = attributes[2].split(':')[1];
var centerLon = attributes[3].split(':')[1];
var Zoom = attributes[4].split(':')[1];
	   		
	   			var xhr = $.getJSON("http://www.journalmap.org/api/collections/"+collectionID+".json?key="+apikey+"&version=1.0",function(collection,status,xhr){
	  			var title = collection.title;
	  			var description = collection.description;
	  			var intro = collection.intro;
	  			$("#jmap").before('<div id="header" style="width:'+$("#jmap").width()+'"><h2>'+title+'</h2><h4>'+intro+'</h4><p class="body">'+description+'</p></div>');
  			});   		

    	
    	
  		var map = L.map('jmap').setView([centerLat, centerLon], Zoom);
  		maplink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
		landlink = '<a href="http://thunderforest.com/">Thunderforest</a>'; 
		cclink = '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>';
		leaflink = '<a href="http://leafletjs.com">Leaflet</a>';
		L.tileLayer('http://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png', {
 		   maxZoom: 18,
		}).addTo(map);
		
		var markers = L.markerClusterGroup();
		
		xhr=$.getJSON('http://www.journalmap.org/api/articles.json?key='+apikey+'&version=1.0&collection_id='+collectionID,function(articles,success,xhr){	
	  			var pages = xhr.getResponseHeader('X-Pages');
    			articles2 = articles.concat(articles);
    			console.log(articles2.length);
    			$.each(articles2,function(i,article) {
					authorlist = []
					$.each(article.authors,function(a,authors) {
						authorlist[authorlist.length] = authors.last_name + ", " + authors.first_name;
					});
    				var citation = buildCitation(article.title,authorlist,"9999",article.publication.name,article.volume,article.issue,article.start_page,article.end_page);
    				$.each(article.locations,function(j,loc) {
    					//console.log(loc.latitude);
    					var marker = L.marker([loc.latitude,loc.longitude]);
    					marker.bindPopup("<strong>"+article.title+"</strong><p>"+citation+"<p><strong>DOI: </strong>"+buildDOIlink(article.doi)); 
    					markers.addLayer(marker);
    				});
    			});
    	console.log(articles2.length);		
    	map.addLayer(markers);
    	});
		
		
		//map.attributionControl.setPrefix('<a href="http://www.journalmap.org"><img src="http://wiki.journalmap.org/lib/exe/fetch.php?media=jmap_logo.png" width="100px"></a>');
		map.attributionControl.addAttribution('Maps &copy; '+landlink+', Data &copy; '+maplink+', '+cclink+' | <a href="http://www.journalmap.org">JournalMap</a> data provided CC-BY-SA');

		$("#jmap").after('<a href="http://www.journalmap.org"><img src="https://www.journalmap.org/assets/logo-cbfb014d0d81331661b8c75c68fdd01f.jpg" width="150px"></a>');

		});

		console.log($('#header').innerHeight());
		$('#header').each(function(){
			if($(this).innerHeight() > 150) {
				$(this).readmore({maxHeight:125});
				}
		});
    	// $("#header").readmore({maxheight:50});	

//};