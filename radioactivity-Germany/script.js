  //
  // The heavy lifting for this code was provided by https://github.com/tomickigrzegorz/leaflet-examples
  // This map is about the radioactivity in German provided by various stations
  // Source of the data: https://www.imis.bfs.de/geoportal/
   
  // Initialize the map with specified center coordinates and zoom level for target area
  // 
  var map = L.map('map', {
    center: [51.55, 10.34],
    zoom: 7,
    })

  // Adding basemap: OpenStreetMap including attribution
  //
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Adding the German Bundesländer (administrative regions level 2) to add context - not mandatory
  // Dataset from Github: https://github.com/isellsoap/deutschlandGeoJSON/tree/main/2_bundeslaender
  //
  var bundeslaender = fetch("4_niedrig.geojson")
      .then(response => {
          return response.json()
      })
      .then(data =>{
          // Basic Leaflet method to add GeoJSON data
          L.geoJSON(data).addTo(map);
      });

  // Creating the box to add the values on radioactivity etc to the visible div on the bottom
  //
  function addTextToDiv(text) {
    const markerPlace = document.querySelector(".marker-position");
    markerPlace.textContent = text;
  }

  // Showing the radioactivity and other data in the popup on each station/marker
  //
  function getRadio(feature, layer) {
    if (feature.properties && String(feature.properties.value)) {
      layer.bindPopup("<b>Name/Ort:</b>"+"<br>"+(feature.properties.name)+"<br>"+"<b>Wert:</b>"+"<br>"+String(feature.properties.value)+" µSv/h "+"<br>"+"<b>Ende der Messung:</b>"+"<br>"+String(feature.properties.end_measure));
    }
  }

  // Styling the markers. The color of the marker changes according to the settings in the function 'getColor(value)'
  //
  function getPointStyle(value) {
      return {
          radius: 6,
          fillColor: getColor(value), // Define getColor function to return color based on value
          // color: '#000',
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        };
  }

  // Define a function to determine color based on the radioactivity value ranges
  // This function was suggested by ChatGPT
  //
  function getColor(value) {
      if (value === null) {
        return 'black';
      } else if (value <= 0.08) {
        return 'green';
      } else if (value <= 0.09) {
        return 'yellow';
      } else if (value <= 0.1) {
        return 'orange';
      } else if (value > 0.1) {
        return 'red';
      } else {
        return 'black';
      }
  };

// Adding the radioactivity sensors and their geojson opendata
// including all the hover functions and more
// including the radioactivity values and more to the bottom text box
//
let url = 'https://www.imis.bfs.de/ogc/opendata/ows?service=WFS&version=1.1.0&request=GetFeature&typeName=opendata:odlinfo_odl_1h_latest&outputFormat=application/json';
var radio = fetch(url).then(radio => radio.json()).then(radio => {
   L.geoJson(radio, {
       pointToLayer: function (feature, latlng) {
           return L.circleMarker(latlng, getPointStyle(feature.properties.value))},
           onEachFeature: function (feature, layer) {
               layer.on("mouseover", function (e) {
                   // bindPopup
                   getRadio(feature, layer);
                   // show radioactivity parameters as per GeoJSON
                   addTextToDiv("Station: "+(feature.properties.name)+" +++ "+"Wert: "+String(feature.properties.value)+" µSv/h"+"  +++  "+"Ende der Messung: "+String(feature.properties.end_measure));
                this.openPopup();
           });
           layer.on("mouseout", function () {
                this.closePopup();
           });
           layer.on("click", function () {
              // adding the province (Bundesland) name to the visible div
              addTextToDiv("Name/Ort: "+(feature.properties.name)+" // "+"Wert: "+String(feature.properties.value)+" µSv/h"+" // "+"Ende der Messung: "+String(feature.properties.end_measure));
              });
            },
          }).addTo(map);
});

// Create a legend and place it according to { position: 'whatever'}
//
var legend = L.control({ position: 'topright',});

// Unfortunately 'grades' anf 'colors' are not picked up from function getColor(value), 
// therefore they have to repeated below
//
legend.onAdd = function(map) {
  var div = L.DomUtil.create('div', 'info legend'),
      grades = ['<= 0.08', '<= 0.09', '<= 0.1', '> 0.1', 'n/a']; // Adjust the legend values as needed
      colors = ['green', 'yellow', 'orange', 'red', 'black']

  div.innerHTML = '<div >';
  for (var i = 0; i < grades.length; i++) {
    div.innerHTML +=
      '<div class="legend-item">' +
      '<div class="legend-color" style="background:' + (colors[i]) + '"></div>' +
      '<div class="legend-label">' + grades[i] + " µSv/h " +' </div>' +
      '</div>';
  }

  div.innerHTML += '</div>';

  return div;
};

legend.addTo(map);