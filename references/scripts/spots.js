const {
    Map,
    View,
    source: { OSM, Vector: VectorSource },
    layer: { Tile, Vector: VectorLayer },
    Feature,
    geom: { Point },
    style: { Style, Circle, Fill, Stroke },
    proj: { fromLonLat },
    interaction: { Select },
    events: { condition: { click } }
} = ol;


var color0 = "#f1ebe0";
var color1 = "#e9ae31";
var color2 = "#eb7221";
var color3 = "#e2523f";
var color4 = "#661717";

var colorPlace = "#419b58ff";
var colorRoad = "#d13c66ff";

var colorGood = "#419b58ff";
var colorFine = "#e6a543ff";
var colorBad = "#d13c66ff";

var colorHiking = "#419b58ff";
var colorBiking = "#e6a543ff";
var colorDriving = "#d13c66ff";
var colorFishing = "#4e7fa5";

var colorUnexplored = "#b45b32ff";


var spots = []

// type based
var spotPlaceStyle = new Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      src: '/images/marker.svg',
      scale: 0.05,
      color: colorPlace,
    })
});
var spotRoadStyle = new Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      src: '/images/marker.svg',
      scale: 0.05,
      color: colorRoad,
    })
});

// rating based
var spotGoodStyle = new Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      src: '/images/marker.svg',
      scale: 0.05,
      color: colorGood,
    })
});
var spotFineStyle = new Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      src: '/images/marker.svg',
      scale: 0.05,
      color: colorFine,
    })
});
var spotBadStyle = new Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      src: '/images/marker.svg',
      scale: 0.05,
      color: colorBad,
    })
});

// activity based
var spotHikingStyle = new Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      src: '/images/marker.svg',
      scale: 0.05,
      color: colorHiking,
    })
});
var spotBikingStyle = new Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      src: '/images/marker.svg',
      scale: 0.05,
      color: colorBiking,
    })
});
var spotDrivingStyle = new Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      src: '/images/marker.svg',
      scale: 0.05,
      color: colorDriving,
    })
});
var spotFishingStyle = new Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      src: '/images/marker.svg',
      scale: 0.05,
      color: colorFishing,
    })
});


var spotUnexploredStyle = new Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      src: '/images/marker.svg',
      scale: 0.05,
      color: colorUnexplored,
    })
});
var spotSelectedStyle = new Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      src: '/images/marker.svg',
      scale: 0.05,
      color: color0,
    })
});

var legendType = [

]

var legendRating = [

]

var legendActivity = [

]



// creates map
var map = new Map({
    layers: [
        new Tile({
            source: new OSM(),
            className: 'ol_bw',
         }),
        
    ],
    view: new View({
        center: fromLonLat([-121.59163, 37.57023]),
        zoom: 8,
    }),
    target: 'map',
});


var markerLayer;
var markerSource;
// fills in the spots variable with data from the spots.json file
fetch('/references/spots.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Couldn\'t find spot.json at ROOT/references/spots.json');
        }
        return response.json();
    })
    .then(data => {
        for(var spotData of data) {
            spots.push(spotData);
        }

        var dropdown = document.getElementById("marker-color-shows");
        var val = dropdown.options[dropdown.selectedIndex].value;

        markerSource = createMarkerSource();
        markerLayer = createMarkerLayer(markerSource);
        createMarkers(val);


        initSelect(markerLayer);
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });




function createMarkerSource() {
    var vectorSource = new VectorSource();
    return vectorSource;
}

function createMarkerLayer(markerSource) {
    vectorLayer = new VectorLayer({
        source: markerSource,
    });

    map.addLayer(vectorLayer);

    return vectorLayer;
}


function createMarkers(dropdownValue) {
    // creates all the markers
    for(const spotData of spots) {
        switchedCoords = [spotData.coords[1], spotData.coords[0]]
        var spot = new Feature({
            geometry: new Point(fromLonLat(switchedCoords)),
        });

        spot.setProperties({
            name: spotData.name,
            coords: spotData.coords,
            description: spotData.description,
            type: spotData.type,
            rating: spotData.rating,
            activities: spotData.activities
        });


        // horrendous code to deal with the marker coloring
        if(spot.get("rating") == "unexplored") {
            spot.setStyle(spotUnexploredStyle);
        } else {
            if(dropdownValue == "type") {
                if(spot.get("type") == "place") {
                    spot.setStyle(spotHikingStyle);
                } else if(spot.get("type") == "road") {
                    spot.setStyle(spotBikingStyle);
                } else {
                    spot.setStyle(spotUnexploredStyle);
                }
            } else if(dropdownValue == "rating") {
                if(spot.get("rating") == "good") {
                    spot.setStyle(spotGoodStyle);
                } else if(spot.get("rating") == "fine") {
                    spot.setStyle(spotFineStyle);
                } else if(spot.get("rating") == "bad") {
                    spot.setStyle(spotBadStyle);
                } else {
                    spot.setStyle(spotUnexploredStyle);
                }
            } else if(dropdownValue == "activity") {
                if(spot.get("activities")[0] == "hiking") {
                    spot.setStyle(spotHikingStyle);
                } else if(spot.get("activities")[0] == "biking") {
                    spot.setStyle(spotBikingStyle);
                } else if(spot.get("activities")[0] == "driving") {
                    spot.setStyle(spotDrivingStyle);
                } else if(spot.get("activities")[0] == "fishing") {
                    spot.setStyle(spotFishingStyle);
                } else {
                    spot.setStyle(spotUnexploredStyle);
                }
            }
        }

        markerSource.addFeature(spot);

        console.log("created marker " + spotData.name);
    }
}

function initSelect(vectorLayer) {
    var select = new Select({
        condition: click,
        layers: [vectorLayer],
    });

    map.addInteraction(select);

    
    select.on('select', function(evt) {
    console.log("spot selected");
    if (evt.selected.length > 0) {
        var selectedFeature = evt.selected[0];
        var selectedName = selectedFeature.get('name');

        var spotData = spots.find(spot => spot.name === selectedName);
        
        if(spotData) {
            openSidebar(spotData);
            selectedFeature.setStyle(spotSelectedStyle);
        }
    } else {
        closeSidebar();
    }
    });
}

function setLegend(dropdownValue) {
    var legendText;

    if(dropdownValue == "type") {
        legendText = legendType;
    } else if(dropdownValue == "rating") {
        legendText = legendRating;
    } else if(dropdownValue == "activity") {
        legendText = legendActivity;
    } else {
        legendText = "somethings wrong";
    }
    document.getElementById('legend').innerHTML = legendText;
}
// ------------------------------------- double click flying -------------------------------------

// map.on('dblclick', function(evt) {
//     var coordsinates = evt.coordsinate;
//     console.log("double");
//     flyTo(coordsinates);
// });

// ------------------------------------- global functions -------------------------------------

window.closeSidebar = function closeSidebar() {
    document.getElementById('sidebar').style.right = "-22rem";
}
window.openSidebar = function openSidebar(spotData) {
    document.getElementById('sidebar').style.right = "0";

    document.getElementById('sidebar-name').innerHTML = spotData.name;

    document.getElementById('sidebar-rating').innerHTML = firstLetterToUpperCase(spotData.rating);

    if(spotData.rating == "good") {
        document.getElementById('sidebar-rating').style.color = colorGood;
    } else if(spotData.rating == "fine") {
        document.getElementById('sidebar-rating').style.color = colorFine;
    } else if(spotData.rating == "bad") {
        document.getElementById('sidebar-rating').style.color = colorBad;
    } else if(spotData.rating == "unexplored") {
        document.getElementById('sidebar-rating').style.color = colorUnexplored;
    } else {
        console.log("that rating shouldnt exist");
    }
    
    document.getElementById('sidebar-description').innerHTML = spotData.description;
    document.getElementById('sidebar-coords').innerHTML = spotData.coords[0] + ", " + spotData.coords[1];
    document.getElementById('sidebar-type').innerHTML = "Type: " + firstLetterToUpperCase(spotData.type);
    document.getElementById('sidebar-activities').innerHTML = "Activities: " + spotData.activities;
    document.getElementById('sidebar-date').innerHTML = "Date: " + spotData.date;

}

window.setSidebarContent = function setSidebarContent(text) {
    document.getElementById('sidebar').innerHTML = "og";
}

window.flyTo = function flyTo(location, dur = 500) {
    var view = map.getView();
    
    view.animate({
        center: location,
        duration: dur, // in milliseconds
        // zoom: 12,
    });
}

window.firstLetterToUpperCase = function firstLetterToUpperCase(word) {
    return word[0].toUpperCase() + word.slice(1);
}

window.redrawMarkers = function redrawMarkers() {
    console.log("redrawn");
    markerSource.clear();

    var dropdown = document.getElementById("marker-color-shows");
    var val = dropdown.options[dropdown.selectedIndex].value;

    createMarkers(val);
    setLegend(val);
}