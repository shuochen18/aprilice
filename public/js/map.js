var currentshape;
var buildingshapes=[];
var map, drawingManager;
var heading, obliquedegree;
var shapeindex = 0;
var buildingrects = [];

var solartype = 1; // solar1 solar2
var rects= []
var edges = []
var address='';

document.addEventListener('DOMContentLoaded', function() {
	display("wrap-premap")

	document.getElementById("ntbtn").addEventListener('click', function(e){
		console.log("nextbtn",step)
		let totalstep=9;

		if(step===1 & !currentshape) return
		if(step===2 & !tempedge) return
		if(step===3){
			obliquedegree = parseInt(document.getElementById("changevalue").value)
	
			if(obliquedegree>5)	{mode=1; step++}
		}
		if(step===4){
			mode = parseInt($("input[name='usertype']:checked").val());
			if(obliquedegree>5) mode=1;
		}
		if(step===5){
			solartype = parseInt($("input[name='solartype']:checked").val());
		}
		if(step===7){
			let addmore = $("input[name='addmore']:checked").val()
			if(addmore=="true"){
				step=0
				shapeindex++;
				rects=[];
				currentshape=[];
			}
			console.log(buildingshapes);

		}
		if(step===9){
			alert("Thanks for your infomation!");
			location.reload();
		}
		if(step===totalstep) return
		step++
		gotostep(step)
	})
	document.getElementById("ltbtn").addEventListener('click', function(e){
		if(step===0) return
		if(step===5){
			if (obliquedegree>5) step--
		}
		step--
		gotostep(step)
	})

})

function gotostep(step){
	let totalstep=9;
	if(step===0){
		display("wrap-premap")
	}
	if (step===1){
		document.getElementById("h1content").innerHTML=`Mät ditt tak`;
		document.getElementById("pcontent").innerHTML=`Markera ut takytan på hustaket som finns på kartan.`;
		drawingManager.setOptions({
			drawingControl: true,
			drawingMode:"polygon"
		  });
		if(edges.length>0){
			edges.map(edge=>edge.setMap(null))
			currentshape.setOptions({strokeOpacity: 1, editable:true})
			document.getElementById("clearshape").style.display = "block"
		}


	}
	if (step===2){
		currentshape.setOptions({strokeOpacity: 0, editable:false})
		AddPolyLinesOnPloygon(currentshape)
		document.getElementById("clearshape").style.display = "none"
		document.getElementById("h1content").innerHTML=`Välj takfot`;
		document.getElementById("pcontent").innerHTML=`Klicka och markera ut takfoten på kartan.`;
	}
	if(step===3){
		baseedge = tempedge
		buildingshapes[shapeindex].edges.map(edge=>{
			edge.setMap(null)
		})
		currentshape.setOptions({strokeOpacity: 1.0, editable:false})
		document.getElementById("h1content").innerHTML=`Detaljer om taket`;
		document.getElementById("pcontent").innerHTML=
		`Vi behöver mer information om taket för att kunna.
		<br/><br/><legend><span class="query">Vilken lutning har taket?</span></legend>
		<div>
			<input type="range" id="changevalue" placeholder="Skriv takvinkel" value=0 min="0" max="60" oninput="degreechange()" onchange="degreechange()">
			<p id="displayvalue">0</p>
		</div>
		`;
	}

	if(step===4){
		document.getElementById("h1content").innerHTML=`Detaljer om taket`;
		document.getElementById("pcontent").innerHTML=
		`För att räkna ut ett pris behöver vi lite information om taket.
		<div>
			<div id="usertypeselector">
				<fieldset>
					<legend><span class="query">Välj typ av anläggning</span></legend>
					<div>
						<input type="radio" id="mode1" name="usertype"
						value=1 checked>
						<span for="mode1">Bostad</span>
						<br/>
						<input type="radio" id="mode2" name="usertype" value=2>
						<span for="mode2">Kommersiell fastighet</span>
						</div>
						<div>
					</div>
				</fieldset>
			</div>
		</div>
		`;
	}

	if (step===5){
		document.getElementById("h1content").innerHTML=`Välj typ av solpanel`;
		var dive = document.createElement("div");
		allsolartype.map((solar,x)=>{
			var el = document.createElement("input");
			el.type = "radio";
			el.value=x+1;
			x==0&&(el.checked="checked");
			var spel = document.createElement("span");
			spel.for = x+1;
			spel.innerHTML = ` ${solar[2]} <br/>`;
			el.name="solartype"
			dive.append(el);
			dive.append(spel);
		}

		)
		let content = document.getElementById("pcontent");
		content.innerHTML = `Klicka bäst solpanel.`;
		content.append(dive);
	}

	if(step===6){
		document.getElementById("input-info").innerHTML = 
		`
		<div id="loader" style="text-align:center">
			<div class="spinner-border" style="width: 10rem; height: 10rem; text-align:center" role="status">
				<span class="sr-only">Loading...</span>
			</div>
		</div>
		<h1 class="fph1" id="h1content"></h1>
		<p class="fpp" id="pcontent"></p>
		`
		document.getElementById('ltbtn').disabled=true
		document.getElementById('ntbtn').disabled=true
		setTimeout(function(){
			document.getElementById("h1content").innerHTML=`Justera solcells layout`;
			document.getElementById("pcontent").innerHTML=
			`Klicka för att lägga till och ta bort solpaneler, eller ändra markerad takyta genom att flytta punkterna.
			<p id="currnum"></p>
			<p id="currpow"></p>
			`;
			document.getElementById("barinside").style.width = "80%";
			document.getElementById("loader").style.display="none";
			count = splitrect(currentshape, baseedge, obliquedegree, solartype, mode)
			document.getElementById('ltbtn').disabled=false
			document.getElementById('ntbtn').disabled=false
		},2000)
	}

	if(step===7){
		currentshape.setOptions({"editable":false});
		rects.map(rect=>google.maps.event.clearListeners(rect,'click'));
		document.getElementById("h1content").innerHTML=`Lägg till en ny takyta?`;
		document.getElementById("pcontent").innerHTML=
			`
			<input type="radio" id="mode1" name="addmore" value=false checked>
			<span for=1>Nej</span>
			<br/><br/>
			<input type="radio" id="mode2" name="addmore"
			 value=true>
			 <span for=2>Ja</span>
			`;

	}

	if(step===8){
		let tcount=0;
		let tpower=0;
		buildingshapes.map(build=>{
			tcount+=build.count;
			let col = parseInt(build.heading/20);
			col = col==0 ? 1:col+1;
			let row = parseInt(build.obli/5);
			tpower += allsolartype[build.solartype-1][3]*build.count*coeffients[row][col];
		})
		document.getElementById("h1content").innerHTML=`Resultat`;
		document.getElementById("pcontent").innerHTML=
			`Beräkning av solcellssystem
			<div id=result>
				<p>Antal paneler: ${tcount}</p>
				<p>Aktuell effekt: ${tpower.toFixed(2)} kWh per år</p>
			</div>
			<div><button class="expobutton" id="epbtn" onclick="exportpdf(address, buildingshapes)">Export</button></div>
			`;
	}


	if(step===9){
		document.getElementById("h1content").innerHTML=`Contact Info`;
		document.getElementById("pcontent").innerHTML=
			`
			<form>
				<div class="list-info"><label>Name:</label><input></div>
				<div class="list-info"><label>Phone number:</label><input></div>
				<div class="list-info"><label>Email:</label><input></div>
			</form>
			`;
	}
	document.getElementById("barinside").style.width = step/totalstep*100+"%";
}

function degreechange(){
	var value=document.getElementById("changevalue").value;
	document.getElementById("displayvalue").innerHTML=value+'°';
}

function clearAllDrawing(){
	var sure = confirm("To clear all the edition you've made?")
	if(!sure)
		return
	buildingshapes.map(x=>{
		x.shape.setMap(null)
		if(x.edges)
			x.edges.map(edge=>edge.setMap(null))
		if(x.splitrects)
			x.splitrects.map(rect=>rect.setMap(null))
	})
	buildingshapes=[]
}


function initMap() {	
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 59.3292, lng: 18.0686},
		zoom: 13,
		mapTypeId:'satellite',
		tilt:0,
		disableDefaultUI: true,
	  });
	

	var input = document.getElementById('pac-input');

	// autocomplete function
	var autocomplete = new google.maps.places.Autocomplete(input);
	autocomplete.bindTo('bounds', map);
	// Set the data fields to return when the user selects a place.
	autocomplete.setFields(
		['address_components', 'geometry', 'icon', 'name','formatted_address']);

	autocomplete.setComponentRestrictions({'country': ['se']})
	autocomplete.setTypes(['address']);
	autocomplete.addListener('place_changed', function() {
	  var place = autocomplete.getPlace();
	  address = place.formatted_address;
	  display("wrap-map")
	  step=1
	  input.value=""
	  if (!place.geometry) {
		// User entered the name of a Place that was not suggested and
		// pressed the Enter key, or the Place Details request failed.
		window.alert("No details available for input: '" + place.name + "'");
		return;
	  }

	  gotostep(1)
	  drawingManager.setOptions({
		drawingControl: true
	  });

	  // If the place has a geometry, then present it on a map.
	  if (place.geometry.viewport) {
		map.fitBounds(place.geometry.viewport);
		map.setZoom(25);
	  } else {
		map.setCenter(place.geometry.location);
		map.setZoom(25);  
	  }
	;
	});


	// Create the DIV to hold the control and call the CustomControl() constructor passing in this DIV.
	var customControlDiv = document.createElement('div');
	var customControl = new CustomControl(customControlDiv, map);

	customControlDiv.index = 1;
	map.controls[google.maps.ControlPosition.TOP_CENTER].push(customControlDiv);

	drawingManager = new google.maps.drawing.DrawingManager({
		drawingMode: "polygon",
		drawingControl: true,
		drawingControlOptions: {
		  position: google.maps.ControlPosition.TOP_CENTER,
		  drawingModes: ["polygon"]
		},
		polygonOptions: polyOptions,
	  });

	 drawingManager.setMap(map);

	google.maps.event.addListener(drawingManager, 'overlaycomplete', function(event) {
		drawingManager.setDrawingMode(null);
		var newShape=event.overlay
		newShape.type = event.type
		if(google.maps.geometry.spherical.computeArea(newShape.getPath())>AREALIMIT) {
			alert("The selecting area is above the limit!") 
			newShape.setMap(null)
			return
		 }
		currentshape=newShape
		buildingshapes[shapeindex]={'shape':currentshape};
		drawingManager.setOptions({
			drawingControl: false
		  });

		currentshape.setOptions({editable:true})
	  });
	
}

function clearedgeSelection () {
	if (tempedge) {
		tempedge.setOptions({strokeColor: "#FF0000",strokeWeight: 6},);
		tempedge = null;
	}
}


function selectedge (edge) {
	clearedgeSelection();
	var options = document.getElementById("selectdirection")
	if(options)
		options.style.display="none"
	edge.setOptions({strokeColor: '#FF8000',strokeWeight:6},);
	tempedge = edge;
}

function deleteSelectedShape () {
	if (selectedShape) {
		selectedShape.setMap(null);
		buildingshapes.map((b,x)=>{
			if(b===selectedShape){
				buildingshapes.splice(x,1)
			}
		})
	}
}

function printout(count){
	document.getElementById("currnum").innerHTML=`Antal paneler: ${count}`;
}

function AddPolyLinesOnPloygon(polygon){
	var paths = JSON.parse(JSON.stringify(polygon.getPath().getArray()))
	paths.push(paths[0])
	for(let i=0;i<paths.length-1;i++){
		let edge = new google.maps.Polyline(edgeOptions)
		edge.setPath([paths[i],paths[i+1]])
		edge.addListener('click',function(e){
			selectedge (edge)
		})
		edges.push(edge)
		edge.setMap(map)
	}
	buildingshapes[shapeindex]["edges"]=edges;
	polygon.setOptions({fillOpacity:0})
	polygon.set('zIndex',-1000)
}

function display(component){
	var componentlist = ["wrap-premap","wrap-map"]
	componentlist.map(com=>{
		document.getElementById(com).style.display="none"})
	document.getElementById(component).style.display="block"
}


function CustomControl(controlDiv, map) {
    // Set CSS for the control border
    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = 'white';
    controlUI.style.borderStyle = 'solid';
    controlUI.style.borderWidth = '1px';
    controlUI.style.borderColor = '#ccc';
    controlUI.style.marginTop = '5px';
    controlUI.style.marginLeft = '-6px';
    controlUI.style.cursor = 'pointer';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'Click to clear all drawing';
    controlDiv.appendChild(controlUI);
	controlDiv.id="clearshape"
    // Set CSS for the control interior
    var controlText = document.createElement('div');
    controlText.style.fontFamily = 'Arial,sans-serif';
	controlText.style.height = '23px'
	controlText.style.width = '23px'
	controlText.style.border = 'solid 2px white'
    controlText.style.paddingLeft = '4px';
    controlText.style.paddingRight = '4px';
		controlText.style.paddingTop = '4px';
    controlText.style.paddingBottom = '4px';
    controlText.innerHTML = 'X';
    controlUI.appendChild(controlText);

    // Setup the click event listeners
    google.maps.event.addDomListener(controlUI, 'click', function () {
	   clearAllDrawing();
	   drawingManager.setOptions({
		drawingControl: true,
		drawingMode:"polygon",
	  });
    });
}