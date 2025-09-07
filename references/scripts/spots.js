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

var markerColoring = {
    markerType: {
        place: {
            name: "Place", 
            color: "#419b58ff"
        },
        road: {
            name: "Road",
            color: "#c02b37ff"
        }
    },

    markerRating: {
        good: {
            name: "Good", 
            color: "#419b58ff"
        },
        fine: {
            name: "Fine",
            color: "#e6a543ff"
        },
        bad: {
            name: "Bad", 
            color: "#c02b37ff"
        }
    },

    markerActivity: {
        hiking: {
            name: "Hiking",
            color: "#419b58ff"
        },
        biking: {
            name: "Biking",
            color: "#e6a543ff"
        },
        driving: {
            name: "Driving", 
            color: "#c02b37ff"
        },
        fishing: {
            name: "Fishing",
            color: "#4e7fa5"
        },
        eating: {
            name: "Eating",
            color: "#9f73e7ff"
        }
    }
}

var colorUnexplored = "#691065ff";


var spots = []

// type based
var spotPlaceStyle = new Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      src: '/images/marker.svg',
      scale: 0.05,
      color: markerColoring.markerType.place.color,
    })
});
var spotRoadStyle = new Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      src: '/images/marker.svg',
      scale: 0.05,
      color: markerColoring.markerType.road.color,
    })
});

// rating based
var spotGoodStyle = new Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      src: '/images/marker.svg',
      scale: 0.05,
      color: markerColoring.markerRating.good.color,
    })
});
var spotFineStyle = new Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      src: '/images/marker.svg',
      scale: 0.05,
      color: markerColoring.markerRating.fine.color,
    })
});
var spotBadStyle = new Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      src: '/images/marker.svg',
      scale: 0.05,
      color: markerColoring.markerRating.bad.color,
    })
});

// activity based
var spotHikingStyle = new Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      src: '/images/marker.svg',
      scale: 0.05,
      color: markerColoring.markerActivity.hiking.color,
    })
});
var spotBikingStyle = new Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      src: '/images/marker.svg',
      scale: 0.05,
      color: markerColoring.markerActivity.biking.color,
    })
});
var spotDrivingStyle = new Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      src: '/images/marker.svg',
      scale: 0.05,
      color: markerColoring.markerActivity.driving.color,
    })
});
var spotFishingStyle = new Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      src: '/images/marker.svg',
      scale: 0.05,
      color: markerColoring.markerActivity.fishing.color,
    })
});
var spotEatingStyle = new Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      src: '/images/marker.svg',
      scale: 0.05,
      color: markerColoring.markerActivity.eating.color,
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
        setLegend(val);


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
            if(dropdownValue == "markerType") {
                if(spot.get("type") == "place") {
                    spot.setStyle(spotPlaceStyle);
                } else if(spot.get("type") == "road") {
                    spot.setStyle(spotRoadStyle);
                } else {
                    spot.setStyle(spotUnexploredStyle);
                }
            } else if(dropdownValue == "markerRating") {
                if(spot.get("rating") == "good") {
                    spot.setStyle(spotGoodStyle);
                } else if(spot.get("rating") == "fine") {
                    spot.setStyle(spotFineStyle);
                } else if(spot.get("rating") == "bad") {
                    spot.setStyle(spotBadStyle);
                } else {
                    spot.setStyle(spotUnexploredStyle);
                }
            } else if(dropdownValue == "markerActivity") {
                if(spot.get("activities")[0] == "hiking") {
                    spot.setStyle(spotHikingStyle);
                } else if(spot.get("activities")[0] == "biking") {
                    spot.setStyle(spotBikingStyle);
                } else if(spot.get("activities")[0] == "driving") {
                    spot.setStyle(spotDrivingStyle);
                } else if(spot.get("activities")[0] == "fishing") {
                    spot.setStyle(spotFishingStyle);
                } else if(spot.get("activities")[0] == "eating") {
                    spot.setStyle(spotEatingStyle);
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
    var legendText = `<ul>`;

    for(var key in markerColoring[dropdownValue]) {
        if(markerColoring[dropdownValue].hasOwnProperty(key)) {
            var marker = markerColoring[dropdownValue][key];
            var color = marker.color; // Get the color value
            
            // Create a tinted SVG using a filter
            legendText += `
                <li>
                    <span class="legend-color" style="border-color: ${color};"></span>
                    ${marker.name}
                </li>`;
        }
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
    document.getElementById('sidebar-description').innerHTML = spotData.description;
    document.getElementById('sidebar-coords').innerHTML = spotData.coords[0] + ", " + spotData.coords[1];
    document.getElementById('sidebar-date').innerHTML = "Date: " + spotData.date;

    if(spotData.rating == "good") {
        document.getElementById('sidebar-rating').style.color = markerColoring.markerRating.good.color;
    } else if(spotData.rating == "fine") {
        document.getElementById('sidebar-rating').style.color = markerColoring.markerRating.fine.color;
    } else if(spotData.rating == "bad") {
        document.getElementById('sidebar-rating').style.color = markerColoring.markerRating.bad.color;
    } else if(spotData.rating == "unexplored") {
        document.getElementById('sidebar-rating').style.color = colorUnexplored;
    } else {
        console.log("this rating shouldnt exist");
    }
    document.getElementById('sidebar-rating').innerHTML = firstLetterToUpperCase(spotData.rating);

    if(spotData.type == "place") {
        document.getElementById('sidebar-type').style.color = markerColoring.markerType.place.color;
    } else if(spotData.type == "road") {
        document.getElementById('sidebar-type').style.color = markerColoring.markerType.road.color;
    } else {
        console.log("this type shouldnt exist");
    }
    document.getElementById('sidebar-type').innerHTML = "Type: " + firstLetterToUpperCase(spotData.type);


    if(spotData.activities == "hiking") {
        document.getElementById('sidebar-activities').style.color = markerColoring.markerActivity.hiking.color;
    } else if(spotData.type == "biking") {
        document.getElementById('sidebar-activities').style.color = markerColoring.markerActivity.biking.color;
    } else if(spotData.type == "driving") {
        document.getElementById('sidebar-activities').style.color = markerColoring.markerActivity.biking.color;
    } else if(spotData.type == "fishing") {
        document.getElementById('sidebar-activities').style.color = markerColoring.markerActivity.biking.color;
    } else if(spotData.type == "eating") {
        document.getElementById('sidebar-activities').style.color = markerColoring.markerActivity.biking.color;
    } else {
        console.log("this type shouldnt exist");
    }
    document.getElementById('sidebar-activities').innerHTML = "Activities: " + spotData.activities;
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