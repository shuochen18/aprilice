var margin = 100; // margin from the boundary rectangle, also the first search stride
const AREALIMIT = 1000; // square meters

var tempedge, baseedge;
var step=1;
var obliquedegree;
var mode = 1; // household 1, factory 2
var allsolartype = [
	[1756, 1039,"Suntech 360W mono helsvart", 360], // length, width, name, power
	[2095, 1039,"Suntech 430W mono helsvart", 430]
]

var coeffients=[
	[0.87, 0.87,0.87,0.87,0.87,0.87],
	[0.91,0.90,0.90,0.88,0.88,0.87],
	[0.93,0.93,0.92,0.89,0.89,0.86],
	[0.96,0.96,0.94,0.91,0.89,0.86],
	[0.98,0.97,0.96,0.93,0.89,0.85],
	[0.99,0.99,0.97,0.94,0.89,0.84],
	[1,1,0.98,0.94,0.89,0.83],
	[1,1,0.98,0.94,0.88,0.81],
	[1,1,0.98,0.93,0.87,0.8],
	[1,0.99,0.97,0.92,0.86,0.78],
	[0.99,0.98,0.96,0.91,0.84,0.76]
]

var polyOptions = {
	strokeWeight: 2.0,
	strokeColor:'#01DFA5',
};

var rectOptions = {
	strokeColor: '#A4A4A4',
	strokeOpacity: 0.8,
	strokeWeight: 2,
	fillColor: '#A4A4A4',
	fillOpacity: 0.35,
};

var splitrectOptions={
	strokeColor: '#000000',
	strokeOpacity: 0.8,
	strokeWeight: 1,
	fillColor: '#333333',
	fillOpacity: 1,
};

var edgeOptions = {
		strokeColor: "#FF0000",
		strokeOpacity: 1.0,
		strokeWeight: 6,
	}