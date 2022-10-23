// create tile layers for backgrounds of map

var defaultMap =  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
});

//grayscale layer

var grayscale = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
	maxZoom: 16
});

//watercolor layer

var watercolor = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 1,
	maxZoom: 16,
	ext: 'jpg'
});

//open street

var OpenStreetMap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

//topo map

var TopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	maxZoom: 17,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

var terrain = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 0,
	maxZoom: 18,
	ext: 'png'
});

//ocean basemap
var OceanBasemap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri',
	maxZoom: 13
});


//basemaps objects
let basemaps= {    
    Basic: defaultMap,     
    Grayscale : grayscale,
    "Water Color" : watercolor,
    "Open Street": OpenStreetMap,
    Topographical : TopoMap,
    Terrain : terrain,
    "My Favorite" : OceanBasemap,
  
    
};


//make map object  36.778259, -119.417931
var myMap = L.map("map", {
    center: [36.778259, -119.417931],
    zoom: 4,
    layers: [defaultMap, grayscale, OpenStreetMap, terrain, watercolor, TopoMap, OceanBasemap ]
});


// add default map to the map
OceanBasemap.addTo(myMap);



//get data for tectonic plates an d draw on map
// variable to hold tectonic plate layer
let tectonicPlates = new L.layerGroup();

//call api to get info foor the tectonic plates
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json")
.then(function(plateData){
    //console lot to ensure data loads
    //console.log(plateData);

    //load data using geojson and add tectonic plates layer group
    L.geoJson(plateData,{
        // add styling to make the lines visaible
        color: "orange",
        weighht: 2

    }).addTo(tectonicPlates);
});

//addd tectonic plates to map
tectonicPlates.addTo(myMap);

// variable to hold quake layer
let earthquakes = new L.layerGroup();


// get data fro quakes an dpopulate layer group
//call usgs geojson api 
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson")
.then(
    function(earthquakeData){
     //console lot to ensure data loads
    console.log(earthquakeData);   
    //plot circles where radius is dependant on magnitude 
    //color is dependent on depth


    //make function that chooses color of datapoint
    function dataColor(depth){
        if (depth > 90)
            return "red";
        else if (depth > 70)
         return "#ff4203";
        else if (depth > 50)
            return "#ff9603";
        else if (depth > 30)
            return "#ffd103";
        else if (depth > 10)
             return "#eeff03";
        else 
            return "green";
    }

    //make function that determines size of radius
    function radiusSize(mag){
        if (mag == 0)
            return 1; // makes sure 0 mag quake shows up
        else 
            return mag *5; // makes sure the circle is pronounced in the map

    }

    // add on th the style for each data point
    function dataStyle(feature)
    {
        return {
            opacity: 1,
            fillOpacity: 0.5,
            fillColor: dataColor(feature.geometry.coordinates[2]), // use index 2 for depth
            color: "000000", // black outline
            radius: radiusSize(feature.properties.mag), //gets magnitude
            weight: 1,
            stroke: true
        
        }
    }

    //add the geojson data to earthquake layer group
    L.geoJson(earthquakeData, {
        //make each feature a marker that is on the mnap, each marker is a circle
        pointToLayer: function(feature, latLng) {
            return L.circleMarker(latLng);
        },
        //set the style for each marker
        style: dataStyle, //calls the data style function and passes in earthquake data
        //add popups
        onEachFeature: function(feature, layer){
            layer.bindPopup(`Magnitude: <b>${feature.properties.mag}</b><br>
                             Depth: <b>${feature.geometry.coordinates[2]}</b><br>
                             Location: <b>${feature.properties.place}</b> `);
        }
    }).addTo(earthquakes);        

      
    }
    

);

  //add te earthquake layer to the map
  earthquakes.addTo(myMap);


//add the overlay for the teconic plates and for the earthquakes
let overlays = {
    "Tectonic Plates": tectonicPlates,
    "Eathquake Data" : earthquakes
};

L.control
.layers(basemaps, overlays)
.addTo(myMap);

//add legend  to the map
var legend = L.control({
    position: "bottomright"
});

//add legend properties
legend.onAdd = function() {
    // div to show legend on page
    var div = L.DomUtil.create("div", "info legend");

    //set up intervals
    var intervals = [-10, 10, 30, 50, 70, 90];
    
    var colors = [  
        "green",
        "#eeff03",
        "#ffd103",
        "#ff9603",
        "#ff4203",
        "red"
    ];

    //loop through intervals and colors and 
    //generate label with colored square for each interval
    for(var i = 0; i < intervals.length; i++)
    {
        //inner html that sets the squarefor each interval and label
        div.innerHTML += "<i style='background: " + colors [i] + "'></i>"      
        + intervals[i] 
        + (intervals[i + 1] ? "&ndash; " + intervals[i + 1] + " depth<br>" : "+")
        + "<br>";
        
      
    }    

    return div;

};

//add legend to map
legend.addTo(myMap);

