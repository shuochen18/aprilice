
function Length2Latlng(panelwidth, panellength, lat){
	var length = panellength/(1000000*6371)*180/3.14 
	var width = panelwidth/(1000000*6371*Math.cos(lat/180.0*3.1415))*180/3.14 
	return [width,length]
}

function splitrect(shape,baseedge,obliquedegree, solartype, mode){
	if(rects.length>0) {
		rects.map(rec=>rec.setMap(null))
		rects = []
	}
	// random point can be the origin point
	var path = baseedge.getPath().getArray();
	heading = google.maps.geometry.spherical.computeHeading(path[0],path[1]);
	if(heading<-90.0)
		heading=heading+180

	// rotate to the horizontal
	var rotateangle = -heading-90;
	var originpoint = path[1];
	rotatePolygon(shape,originpoint,rotateangle)

	let bounds = new google.maps.LatLngBounds();
	shape.getPath().forEach((latLng) => {
		bounds.extend(latLng);
	});

	var rect = new google.maps.Rectangle(rectOptions)
	var areaBounds = {
		north: bounds.getNorthEast().lat(),
		south: bounds.getSouthWest().lat(),
		east: bounds.getNorthEast().lng(),
		west: bounds.getSouthWest().lng()
   };
	var stridelat, stridelng
	[stridelat, stridelng] = Length2Latlng(margin,margin,areaBounds.north) //use margin as the stride
	
	// search for the start point to maximize the panels
	var swidthcount = parseInt((areaBounds.east-areaBounds.west)/stridelat);
	var slengthcount = parseInt((areaBounds.north-areaBounds.south)/stridelng);
   	var startlat, startlng
	for (i=0;i<swidthcount;i++){
		for(j=0;j<slengthcount;j++){
			let splitbounds = {
				north: areaBounds.north-i*stridelat,
				south: areaBounds.north-(i+1)*stridelat,
				east: areaBounds.west+(j+1)*stridelng,
				west: areaBounds.west+j*stridelng
			  }
			var points = getrectpoints(splitbounds)
			if(check_in_bounds(points, shape)){
				startlat=splitbounds.north
				startlng=splitbounds.west
				break
			}	
		}	
	}

	var length, width

	if(mode===2){
		var panellength = allsolartype[solartype-1][1];
		var panelwidth = allsolartype[solartype-1][0];
	}
	else{
		var panellength = allsolartype[solartype-1][0]*Math.cos(obliquedegree/180*3.1415);
		var panelwidth = allsolartype[solartype-1][1];
	}
	[width,length]=Length2Latlng(panelwidth,panellength,areaBounds.north);

	var widthcount = parseInt((areaBounds.east-areaBounds.west)/width);
	var lengthcount = parseInt((areaBounds.north-areaBounds.south)/length);

	rect.setBounds(bounds)
	var i, j;
	count = 0;
	var nr

	var between = mode===1 ? 0:500
	var betweenlat;
	[betweenlat,betweenlat]=Length2Latlng(between,between,areaBounds.north)
	for (i=0;i<2*lengthcount;i++){
		for(j=0;j<2*widthcount;j++){
			let splitbounds = {
				north: startlat+lengthcount*length-i*(length+betweenlat),
				south: startlat+lengthcount*length-(i+1)*length-i*betweenlat,
				east: startlng-widthcount*width+(j+1)*width,
				west: startlng-widthcount*width+j*width,
			  }
			var points = getrectpoints(splitbounds)
			if(!check_in_bounds(points, shape))
			  continue
			count = count+1;
			let splitrect = new google.maps.Rectangle(splitrectOptions)
			splitrect.setBounds(splitbounds)
			splitrect.setMap(map)
			let polygonrect = createPolygonFromRectangle(splitrect)
			rotatePolygon(polygonrect,originpoint,180-rotateangle)
			rects.push(polygonrect)
			splitrect.setMap(null)	
			polygonrect.setMap(null)	
	   }
   }
   buildingshapes[shapeindex].count=count;
   printout(count)

   rects.map(rec=>{
		var coutnum=1
		rec.setMap(map)
		google.maps.event.addListener(rec,"click",function(e){
			if(coutnum%2===1){
				rec.setOptions({fillOpacity:0.3})
				count --
			}
			else{
				rec.setOptions({fillOpacity:1})
				count ++

			}
			console.log(buildingshapes)
			coutnum++
			buildingshapes[shapeindex].count=count;
			printout(count)
	})
	})
	//currentshape.setMap(null)

   rotatePolygon(shape,originpoint,180-rotateangle)
   shape.setOptions({fillOpacity:0.1, editable:true})
   shape.set('zIndex',-1000);
   shape.getPaths().forEach(function(path, index){

		google.maps.event.addListener(path, 'insert_at', function(){
			gotostep(6)
		});
	
		google.maps.event.addListener(path, 'remove_at', function(){
			gotostep(6)
		});
	
		google.maps.event.addListener(path, 'set_at', function(){
			gotostep(6)
		});
	
	});

	buildingshapes[shapeindex]["heading"]=heading<0?Math.abs(90+heading):Math.abs(90-heading);
	buildingshapes[shapeindex]["obli"]=obliquedegree>50?50:obliquedegree;
	buildingshapes[shapeindex]["solartype"]=solartype;
   	buildingshapes[shapeindex]["splitrects"]=rects;

   return count
}

// check if the split rects in original polygon
function check_in_bounds(rectpoints,polygon){
	var flag =true
	rectpoints.map(point=>{
		if(!google.maps.geometry.poly.containsLocation(point,polygon))
			flag = false
	})
	return flag
}

function getrectpoints(splitbounds){
   return [
		new google.maps.LatLng(splitbounds.north,splitbounds.west),
		new google.maps.LatLng(splitbounds.north,splitbounds.east),
		new google.maps.LatLng(splitbounds.south,splitbounds.west),
		new google.maps.LatLng(splitbounds.south,splitbounds.east),
	]
}

function rotatePolygon(polygon,origin, angle) {
    var map = polygon.getMap();
    var prj = map.getProjection();
    var origin = prj.fromLatLngToPoint(origin); //rotate around first point

    var coords = polygon.getPath().getArray().map(function(latLng){
	   var point = prj.fromLatLngToPoint(latLng);
	   var rotatedLatLng =  prj.fromPointToLatLng(rotatePoint(point,origin,angle));
       return {lat: rotatedLatLng.lat(), lng: rotatedLatLng.lng()};
	});

	// original polygon
	const bermudaTriangle = new google.maps.Polygon({
		paths: polygon.getPath().getArray(),
		strokeColor: "#FF0000",
		strokeOpacity: 0.8,
		strokeWeight: 2,
		fillColor: "#FF0000",
		fillOpacity: 0.35
	  });
	polygon.setPath(coords);
	
}

function rotatePoint(point, origin, angle) {
	var angleRad = angle * Math.PI / 180.0;
	if(angleRad<0) angleRad=angleRad+Math.PI
    return {
        x: Math.cos(angleRad) * (point.x - origin.x) - Math.sin(angleRad) * (point.y - origin.y) + origin.x,
        y: Math.sin(angleRad) * (point.x - origin.x) + Math.cos(angleRad) * (point.y - origin.y) + origin.y
    };
}

function createPolygonFromRectangle(rectangle) {
    var map = rectangle.getMap();
  
    var coords = [
      { lat: rectangle.getBounds().getNorthEast().lat(), lng: rectangle.getBounds().getNorthEast().lng() },
      { lat: rectangle.getBounds().getNorthEast().lat(), lng: rectangle.getBounds().getSouthWest().lng() },
      { lat: rectangle.getBounds().getSouthWest().lat(), lng: rectangle.getBounds().getSouthWest().lng() },
      { lat: rectangle.getBounds().getSouthWest().lat(), lng: rectangle.getBounds().getNorthEast().lng() }
    ];

    // Construct the polygon.
    var rectPoly = new google.maps.Polygon({
        path: coords
    });
    var properties = ["strokeColor","strokeOpacity","strokeWeight","fillOpacity","fillColor"];
    //inherit rectangle properties 
    var options = {};
    properties.forEach(function(property) {
        if (rectangle.hasOwnProperty(property)) {
            options[property] = rectangle[property];
        }
    });
    rectPoly.setOptions(options);

    rectangle.setMap(null);
    rectPoly.setMap(map);
    return rectPoly;
}