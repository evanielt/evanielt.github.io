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
    events: { condition: { click } },
    control: { MousePosition } // Destructure MousePosition here
    } = ol;


var color0 = "#f1ebe0";
var color1 = "#e9ae31";
var color2 = "#eb7221";
var color3 = "#e2523f";
var color4 = "#661717";

var colorUnexplored = "#971591ff";
var colorError = "#000000ff";

var markerData = {
    type: {
        place: {
            name: "Place", 
            color: "#419b58ff",
            style: null,
            checked: false,
        },
        road: {
            name: "Road",
            color: "#c02b37ff",
            style: null,
            checked: false,
        }
    },

    rating: {
        good: {
            name: "Good", 
            color: "#419b58ff",
            style: null,
            checked: false,
        },
        fine: {
            name: "Fine",
            color: "#e6a543ff",
            style: null,
            checked: false,
        },
        bad: {
            name: "Bad", 
            color: "#c02b37ff",
            style: null,
            checked: false,
        }
    },

    activity: {
        hiking: {
            name: "Hiking",
            color: "#419b58ff",
            style: null,
            checked: false,
        },
        biking: {
            name: "Biking",
            color: "#e6a543ff",
            style: null,
            checked: false,
        },
        driving: {
            name: "Driving", 
            color: "#c02b37ff",
            style: null,
            checked: false,
        },
        fishing: {
            name: "Fishing",
            color: "#629eccff",
            style: null,
            checked: false,
        },
        camping: {
            name: "Camping",
            color: "#82ce3bff",
            style: null,
            checked: false,
        },
        eating: {
            name: "Eating",
            color: "#d16646ff",
            style: null,
            checked: false,
        },
        other: {
            name: "Other",
            color: "#757575ff",
            style: null,
            checked: false,
        }
        // boning: {
        //     name: "Boning",
        //     color: "#8b1010ff",
        //     style: null,
        //     checked: false,
        // }
    }
}

var spots = [];

var unexploredData = {
    name: "Unexplored", 
    color: "#971591ff",
    style: null,
    checked: false,
}

var spotUnexploredStyle = new Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      src: '/images/marker.svg',
      scale: 0.05,
      color: unexploredData.color,
    })
});
var spotErrorStyle = new Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      src: '/images/marker.svg',
      scale: 0.05,
      color: colorError,
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
        center: fromLonLat([-121.59163, 37.77023]),
        zoom: 9,
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
        getCheckboxState();
        createMarkers(val);
        setLegend(val);


        initSelect(markerLayer);
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });



function createMarkerStyles() {
    Object.entries(markerData).forEach(([key, val]) => {
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
        var r = markerData.rating[spotData.rating]?.checked || false;
        var u = (spotData.rating == "unexplored") && unexploredData.checked;

        var type = markerData.type[spotData.type]?.checked || false;
        var rating = r || u;
        var activity = (Object.keys(markerData.activity).some(activity => 
                spotData.activity.includes(activity) && 
                markerData.activity[activity]?.checked
            ));

        var shouldCreateMarker = type && rating && activity;

        if(!shouldCreateMarker) {
            continue;
        }

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
            activity: spotData.activity,
            images: spotData.images
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
            var v = markerData[dropdownValue][dropdownValueSingle]
            if(v != null) {
                var sLocal = v.style;
            }
            
            if(sLocal != null) {
                spot.setStyle(sLocal);
            } else {
                spot.setStyle(spotErrorStyle);
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

    if(dropdownValue == null) {
        console.log("dropdownValue is null, this wont work");
        return;
    }

    for(var key in markerData[dropdownValue]) {
        if(markerData[dropdownValue].hasOwnProperty(key)) {
            var marker = markerData[dropdownValue][key];
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
                    <span class="legend-color" style="border-color: ${unexploredData.color}; box-shadow: 0px 0px 0.3rem ${unexploredData.color};"></span>
                    Unexplored
                </li>`;

    document.getElementById('legend').innerHTML = legendText;
}

function getCheckboxState() {
    markerData.type.place.checked = document.getElementById('check-type-place').checked;
    markerData.type.road.checked = document.getElementById('check-type-road').checked;

    markerData.rating.good.checked = document.getElementById('check-rating-good').checked;
    markerData.rating.fine.checked = document.getElementById('check-rating-fine').checked;
    markerData.rating.bad.checked = document.getElementById('check-rating-bad').checked;
    unexploredData.checked = document.getElementById('check-rating-unexplored').checked;

    markerData.activity.hiking.checked = document.getElementById('check-activity-hiking').checked;
    markerData.activity.biking.checked = document.getElementById('check-activity-biking').checked;
    markerData.activity.driving.checked = document.getElementById('check-activity-driving').checked;
    markerData.activity.fishing.checked = document.getElementById('check-activity-fishing').checked;
    markerData.activity.camping.checked = document.getElementById('check-activity-camping').checked;
    markerData.activity.eating.checked = document.getElementById('check-activity-eating').checked;
    markerData.activity.other.checked = document.getElementById('check-activity-other').checked;
}

// ------------------------------------- global functions -------------------------------------

window.closeSidebar = function closeSidebar() {
    if(window.matchMedia("(max-width: 768px)")) { // mobile
        document.getElementById('sidebar').style.right = "-100%";
    } else {
        document.getElementById('sidebar').style.right = "-25rem";
    }
}
window.openSidebar = function openSidebar(spotData) {
    document.getElementById('sidebar').style.right = "0";

    document.getElementById('sidebar-name').innerHTML = spotData.name;
    document.getElementById('sidebar-description').innerHTML = spotData.description;
    document.getElementById('sidebar-coords').innerHTML = spotData.coords[0] + ", " + spotData.coords[1];
    document.getElementById('sidebar-date').innerHTML = "Date: " + spotData.date;

    var ratingText = "Rating: "
    if(spotData.rating == "unexplored") {
        ratingText += `<span style="color: ${unexploredData.color};">${firstLetterToUpperCase(spotData.rating)}</span>`
    } else {
        ratingText += `<span style="color: ${markerData.rating[spotData.rating].color};">${firstLetterToUpperCase(spotData.rating)}</span>`
    }
    document.getElementById('sidebar-rating').innerHTML = ratingText;


    var typeText = `Type: <span style="color: ${markerData.type[spotData.type].color};">${firstLetterToUpperCase(spotData.type)}</span>`;
    document.getElementById('sidebar-type').innerHTML = typeText;

    var activityText = "activity: ";
    for(var i in spotData.activity) {
        activityText += `<span style="color: ${markerData.activity[spotData.activity[i]].color};">${firstLetterToUpperCase(spotData.activity[i])}`
        if(i + 1 < spotData.activity.length) {
            activityText += ", "
        }
        activityText += `</span>`;
    }
    document.getElementById('sidebar-activity').innerHTML = activityText;

    var imagesText = "";
    for(var i in spotData.images) {
        var url = spotData.images[i];
        imagesText += `<img src="${url}" class="viewable-image" onclick="openImageViewer('${url}')">`

        if(i + 1 < spotData.activity.length) {
            activityText += "<br>"
        }
    }
    document.getElementById('sidebar-images').innerHTML = imagesText;
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

    getCheckboxState();
    createMarkers(val);
    setLegend(val);
}


window.closeMapButtons = function closeMapButtons() {
    var elemStyle = document.getElementById('map-buttons').style;

    if(window.matchMedia("(max-width: 768px)")) {
        elemStyle.width = "0";
        elemStyle.height = "0";
        elemStyle.padding = "0";
        elemStyle.opacity = "0";
    }



    document.getElementById('map-buttons-open').style.opacity = 1;
}

window.openMapButtons = function openMapButtons() {
    var elemStyle = document.getElementById('map-buttons').style;

    elemStyle.width = "13rem";
    elemStyle.height = "auto";
    elemStyle.padding = "1rem";
    elemStyle.opacity = "1.0";

    document.getElementById('map-buttons-open').style.opacity = 0;
}

var mouseCoords = document.getElementById('mouse-coords');

map.on('pointermove', function(evt) {
    var lonlat = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
    var x = lonlat[1].toFixed(6);
    var y = lonlat[0].toFixed(6);

    mouseCoords.innerHTML = x + ", " + y;

    if(!evt.dragging) {
        map.getTargetElement().style.cursor = map.hasFeatureAtPixel(map.getEventPixel(evt.originalEvent)) ? 'pointer' : '';
    }
})

function initMap() {
    // on mobile, hide the map buttons initially
    if(window.matchMedia("(width <= 768px)").matches) {
        closeMapButtons();
    }

    // set coordinates to map position initially
    
    var lonlat = ol.proj.transform(map.getView().getCenter(), 'EPSG:3857', 'EPSG:4326');

    var x = lonlat[1].toFixed(6);
    var y = lonlat[0].toFixed(6);

    mouseCoords = document.getElementById('mouse-coords');
    mouseCoords.innerHTML = x + ", " + y;
}

initMap();