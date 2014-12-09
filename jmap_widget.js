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

  		
var JMap = function(apikey,collectionID) {
  		$(document).ready(function() {
	   		$.getJSON("http://www.journalmap.org/api/collections/"+collectionID+".json?key="+apikey+"&version=1.0&callback=?",function(collection){
	  			var title = collection.title;
	  			var description = collection.description;
	  			var intro = collection.intro;
	  			$("#jmap").before("<h3>"+title+"</h3><em>"+intro+"</em>");
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
		
		$.getJSON('http://www.journalmap.org/api/articles.json?key='+apikey+'&version=1.0&filters[collection_id][]='+collectionID+'&callback=?',function(articles){	
    			$.each(articles,function(i,article) {
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
    	map.addLayer(markers);
    	});
		
		
		//map.attributionControl.setPrefix('<a href="http://www.journalmap.org"><img src="http://wiki.journalmap.org/lib/exe/fetch.php?media=jmap_logo.png" width="100px"></a>');
		map.attributionControl.addAttribution('Maps &copy; '+landlink+', Data &copy; '+maplink+', '+cclink+' | <a href="http://www.journalmap.org">JournalMap</a> data provided CC-BY-SA');

		$("#jmap").after('<a href="http://www.journalmap.org"><img src="jmap_logo.png" width="150px"></a>');

		});

};