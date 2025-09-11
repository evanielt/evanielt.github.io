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

var colorUnexplored = "#691065ff";

var markerColoring = {
    type: {
        place: {
            name: "Place", 
            color: "#419b58ff",
            style: null,
        },
        road: {
            name: "Road",
            color: "#c02b37ff",
            style: null,
        }
    },

    rating: {
        good: {
            name: "Good", 
            color: "#419b58ff",
            style: null,
        },
        fine: {
            name: "Fine",
            color: "#e6a543ff",
            style: null,
        },
        bad: {
            name: "Bad", 
            color: "#c02b37ff",
            style: null,
        }
    },

    activities: {
        hiking: {
            name: "Hiking",
            color: "#419b58ff",
            style: null,
        },
        biking: {
            name: "Biking",
            color: "#e6a543ff",
            style: null,
        },
        driving: {
            name: "Driving", 
            color: "#c02b37ff",
            style: null,
        },
        fishing: {
            name: "Fishing",
            color: "#4e7fa5ff",
            style: null,
        },
        eating: {
            name: "Eating",
            color: "#9f73e7ff",
            style: null,
        }
    }
}

var spots = [];

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

createMarkerStyles();


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



function createMarkerStyles() {
    Object.entries(markerColoring).forEach(([key, val]) => {
        Object.entries(val).forEach(([key2, markerData]) => {
            markerData.style = new Style({
                image: new ol.style.Icon({
                    anchor: [0.5, 1],
                    src: '/images/marker.svg',
                    scale: 0.05,
                    color: markerData.color,
                })
            });
        });
    });
}


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

        if(spot.get("rating") == "unexplored") {
            spot.setStyle(spotUnexploredStyle);
        } else {
            var dropdownValueSingle;
            if(Array.isArray(spot.get(dropdownValue))) {
                dropdownValueSingle = spot.get(dropdownValue)[0];
            } else {
                dropdownValueSingle = spot.get(dropdownValue);
            }
            spot.setStyle(markerColoring[dropdownValue][dropdownValueSingle].style);
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
                    <span class="legend-color" style="border-color: ${color}; border-width: 0.15rem; box-shadow: 0px 0px 0.3rem ${color};"></span>
                    ${marker.name}
                </li>`;
        }
    }

    legendText += `
                <li>
                    <span class="legend-color" style="border-color: ${colorUnexplored}; box-shadow: 0px 0px 0.3rem ${colorUnexplored};"></span>
                    Unexplored
                </li>`;

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

    if(spotData.rating == "unexplored") {
        document.getElementById('sidebar-rating').style.color = colorUnexplored;
    } else {
        document.getElementById('sidebar-rating').style.color = markerColoring.rating[spotData.rating].color;
    }
    document.getElementById('sidebar-rating').innerHTML = "Rating: " + firstLetterToUpperCase(spotData.rating);


    document.getElementById('sidebar-type').style.color = markerColoring.type[spotData.type].color;
    document.getElementById('sidebar-type').innerHTML = "Type: " + firstLetterToUpperCase(spotData.type);

    var activitiesText = "Activities: ";
    for(var i in spotData.activities) {
        // console.log(spotData.activities[i]);
        activitiesText += `<span style="color: ${markerColoring.activities[spotData.activities[i]].color};">${firstLetterToUpperCase(spotData.activities[i])}`
        if(i + 1 < spotData.activities.length) {
            activitiesText += ", "
        }
        activitiesText += `</span>`;
    }
    document.getElementById('sidebar-activities').innerHTML = activitiesText;
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