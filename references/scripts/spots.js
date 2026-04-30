// TODO:
// -Better error logging
// -No case sensitivity (or show that that's the error and where that error is)

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
    control: { MousePosition }
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
        favorite: {
            name: "Favorite", 
            color: "#ffd900",
            style: null,
            checked: false,
        },
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
        boating: {
            name: "Boating", 
            color: "#7e5bffff",
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
    }
}

var unexploredData = {
    name: "Unexplored", 
    color: "#971591ff",
    style: {
        'Point': new Style({
                image: new ol.style.Icon({
                anchor: [0.5, 0.8],
                src: '/images/marker.svg',
                scale: 0.05,
                color: colorUnexplored,
            })
        }),
        'MultiLineString': new Style({
            stroke: new Stroke({
                color: colorUnexplored,
                width: 3,
            }),
        }),
    },
    checked: false,
}

var spotSelectedStyle = {
    'Point': new Style({
        image: new ol.style.Icon({
        anchor: [0.5, 0.8],
        src: '/images/marker.svg',
        scale: 0.05,
        color: color0,
        })
    }),
    'MultiLineString': new Style({
        stroke: new Stroke({
        color: color0,
        width: 3,
        }),
    }),
};


var markerSource;
var markerLayer;

var gpsSource;
var gpsLayer;

var colorDropdownValue;
var roadDropdownValue;

var gpxFormat = new ol.format.GPX();

var spots = [];
var map = null;


createMap();
createMarkerStyles();

// after filling in the spots variable with data from spots.json, it runs the necessary startup code
fetch('/references/collections/spots.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Couldn\'t find spot.json at ROOT/references/collections/spots.json');
        }
        return response.json();
    })
    .then(data => {
        for(var spotData of data) {
            spots.push(spotData);
        }

        createSourcesAndLayers();

        redrawMarkers();

        initSelect();
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });


function createMap() {
    map = new Map({
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
}

function createMarkerStyles() {
    Object.entries(markerData).forEach(([key, val]) => {
        Object.entries(val).forEach(([key2, markerData]) => {
            markerData.style = {
                'Point': new Style({
                    image: new ol.style.Icon({
                        anchor: [0.5, 0.8],
                        src: '/images/marker.svg',
                        scale: 0.05,
                        color: markerData.color,
                    })
                }),
                // 'LineString': new Style({
                //     stroke: new Stroke({
                //         color: color0,
                //         width: 3,
                //     }),
                // }),
                'MultiLineString': new Style({
                    stroke: new Stroke({
                        color: markerData.color,
                        width: 3,
                    }),
                }),
            };
        })
    })

    markerData.rating.favorite.style = {
        'Point': new Style({
            image: new ol.style.Icon({
                anchor: [0.5, 0.8],
                src: '/images/markerstar.svg',
                scale: 0.05,
                color: markerData.rating.favorite.color,
            })
        }),
        'MultiLineString': new Style({
            stroke: new Stroke({
                color: markerData.rating.favorite.color,
                width: 3,
            }),
        }),
    };
}

function createSourcesAndLayers() {
    markerSource = new VectorSource();
    markerLayer = new VectorLayer({
        source: markerSource,
    });
    markerLayer.setZIndex(1);

    gpsSource = new VectorSource({format: new ol.format.GPX()})
    gpsLayer = new VectorLayer({
        source: gpsSource,
    });
    gpsLayer.setZIndex(0);

    map.addLayer(markerLayer);
    map.addLayer(gpsLayer);
}

function initSelect() {
    var select = new Select({
        condition: click,
        layers: [markerLayer, gpsLayer],
    });

    map.addInteraction(select);

    select.on('select', function(evt) {
        console.log("select happened");
        if(evt.selected.length > 0) {
            var selectedFeature = evt.selected[0];
            var selectedName = selectedFeature.get('name');

            var spotData = spots.find(spot => spot.name === selectedName);
            
            if(spotData) {
                openSidebar(spotData);

                var type = spotSelectedStyle[selectedFeature.getGeometry().getType()];
                selectedFeature.setStyle(type);
            }
        } else {
            closeSidebar();
        }
    });
}


// ------------------------------------- marker functions -------------------------------------

window.redrawMarkers = function redrawMarkers() {
    console.log("redrawn");
    markerSource.clear();
    gpsSource.clear();

    getCheckboxState();
    createMarkers();
    setLegend();
}

function getCheckboxState() {
    var markerColorShows = document.getElementById("marker-color-shows");
    colorDropdownValue = markerColorShows.options[markerColorShows.selectedIndex].value;

    var showRoadsAs = document.getElementById("show-roads-as");
    roadDropdownValue = showRoadsAs.options[showRoadsAs.selectedIndex].value;

    markerData.type.place.checked = document.getElementById('check-type-place').checked;
    markerData.type.road.checked = document.getElementById('check-type-road').checked;

    markerData.rating.favorite.checked = document.getElementById('check-rating-favorite').checked;
    markerData.rating.good.checked = document.getElementById('check-rating-good').checked;
    markerData.rating.fine.checked = document.getElementById('check-rating-fine').checked;
    markerData.rating.bad.checked = document.getElementById('check-rating-bad').checked;
    unexploredData.checked = document.getElementById('check-rating-unexplored').checked;

    markerData.activity.hiking.checked = document.getElementById('check-activity-hiking').checked;
    markerData.activity.biking.checked = document.getElementById('check-activity-biking').checked;
    markerData.activity.driving.checked = document.getElementById('check-activity-driving').checked;
    markerData.activity.fishing.checked = document.getElementById('check-activity-fishing').checked;
    markerData.activity.boating.checked = document.getElementById('check-activity-boating').checked;
    markerData.activity.camping.checked = document.getElementById('check-activity-camping').checked;
    markerData.activity.eating.checked = document.getElementById('check-activity-eating').checked;
    markerData.activity.other.checked = document.getElementById('check-activity-other').checked;
}

function createMarkers() {
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

        if(spotData.gpx == null || (roadDropdownValue === "marker" || roadDropdownValue === "both")) { // single spot
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

            var finalStyle = getStyle(spot);
            console.log(spotData.name);
            spot.setStyle(finalStyle['Point']);

            markerSource.addFeature(spot);

            console.log("Created spot: " + spotData.name);
        }
        if(spotData.gpx != null) { // road
            if(roadDropdownValue === "both" || roadDropdownValue === "road") {
                fetch(spotData.gpx)
                    .then(response => response.text())
                    .then(gpxText => {
                        var road = gpxFormat.readFeatures(gpxText, {
                            featureProjection: 'EPSG:3857'
                        });                    

                        road.forEach(feature => {
                            feature.setProperties({
                                name: spotData.name,
                                coords: spotData.coords,
                                description: spotData.description,
                                type: spotData.type,
                                rating: spotData.rating,
                                activity: spotData.activity,
                                images: spotData.images
                            });
                        });

                        var finalStyle = getStyle(road[0]);
                        if(finalStyle === null) {
                            console.error("Could not get style from road type with path " + spotData.gpx +". Is the GPX path valid? This error log should be improved later")
                        }

                        road.forEach(feature => {
                            feature.setStyle(finalStyle['MultiLineString']);
                        });

                        
                        gpsSource.addFeatures(road);
                        console.log("Created road: ", spotData.name);
                    })
                    .catch(error => console.error("Error loading GPX data:", error));
            }
        }
    }
}

function getStyle(spot) {
    var style = null;

    if(spot.get("rating") == "unexplored") {
        style = unexploredData.style;
    } if(spot.get("rating") == "favorite") {
        style = markerData.rating.favorite.style;
    } else {
        var dropdownValueSingle;
        if(Array.isArray(spot.get(colorDropdownValue))) {
            dropdownValueSingle = spot.get(colorDropdownValue)[0];
        } else {
            dropdownValueSingle = spot.get(colorDropdownValue);
        }

        var v = markerData[colorDropdownValue][dropdownValueSingle];

        if(v != null) {
            if(spot.gpx == null) {
                style = v.style;
            } else {
                style = v.styleRoad;
            }
        }
        
        return style;
    }

    return style;
}

function setLegend() {
    var legendText = `<ul>`;

    if(colorDropdownValue == null) {
        console.log("colorDropdownValue is null, this wont work");
        return;
    }

    for(var key in markerData[colorDropdownValue]) {
        if(markerData[colorDropdownValue].hasOwnProperty(key)) {
            var marker = markerData[colorDropdownValue][key];
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

// ------------------------------------- regular functions -------------------------------------

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
        imagesText += `<img src="${url}" class="viewable-image"')">`

        if(i + 1 < spotData.activity.length) {
            activityText += "<br>"
        }
    }
    document.getElementById('sidebar-images').innerHTML = imagesText;

    IndexImages();
}

window.setSidebarContent = function setSidebarContent(text) {
    document.getElementById('sidebar').innerHTML = "og";
}

window.flyTo = function flyTo(location, dur = 500) {
    var view = map.getView();
    
    var switched = [location[1], location[0]];

    view.animate({
        center: fromLonLat(switched),
        duration: dur, // in milliseconds
        // zoom: 12,
    });


    // var duration = 2000;
    // var start = +new Date();
    // var pan = ol.animation.pan({
    //     duration: duration,
    //     source: /** @type {ol.Coordinate} */ (view.getCenter()),
    //     start: start
    // });
    
    // map.beforeRender(pan, bounce);
}

window.firstLetterToUpperCase = function firstLetterToUpperCase(word) {
    return word[0].toUpperCase() + word.slice(1);
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
        closeSearchBar();
    }

    // set coordinates to map position initially
    
    var lonlat = ol.proj.transform(map.getView().getCenter(), 'EPSG:3857', 'EPSG:4326');

    var x = lonlat[1].toFixed(6);
    var y = lonlat[0].toFixed(6);

    mouseCoords = document.getElementById('mouse-coords');
    mouseCoords.innerHTML = x + ", " + y;
}

function initRightClick() {
    document.addEventListener("mousedown", function(event) {
        closeContextMenu();
    });

    if(document.addEventListener) {
        document.addEventListener('contextmenu', function(event) {
            openContextMenu(event);
            event.preventDefault();
        }, false);
    } else {
        document.attachEvent('oncontextmenu', function(event) {
            openContextMenu(event);
            window.event.returnValue = false;
        });
    }
}

function openContextMenu(event) {
    var menu = document.getElementById("context-menu")
    menu.style.display = `block`;
    menu.style.left = `${event.pageX}px`;
    menu.style.top = `${event.pageY}px`;
}

function closeContextMenu() {
    var menu = document.getElementById("context-menu")
    menu.style.display = `none`;
}

var searchDropdown;
function initSearch() {
    var searchInput = document.getElementById('search-input');
    searchDropdown = document.getElementById('search-dropdown');

    searchInput.addEventListener('input', function(event) {
        if(searchInput.value) {
            // searchDropdown.style.height = "100%";
            searchDropdown.style.borderWidth = "0.1rem";
            searchValue(searchInput.value);

        } else {
            // searchDropdown.style.height = "0%";
            searchDropdown.innerHTML = "";
            searchDropdown.style.borderWidth = "0";
        }
    });
}

function searchValue(val) {
    var finalList = [];

    for(const spotData of spots) {
        var searched = spotData.name.toLowerCase().search(val.toLowerCase());
        if(searched != -1) {
            finalList.push(spotData);
        }
    }

    // need to make searching through the description also possible

    searchDropdown.innerHTML = "";

    for(const matchedSpot of finalList) {
        var elem = document.createElement("a");
        elem.class = "search-result";
        elem.innerHTML = `<h2>
                                ${matchedSpot.name}
                            </h2>
                            <p>
                                ${matchedSpot.description}
                            </p>`

        elem.onclick = function() {
            zoomToSpot(matchedSpot);
        }

        searchDropdown.append(elem);
    }
}

window.zoomToSpot = function zoomToSpot(spot) { // might be inefficient to be looping through it all again
    openSidebar(spot);
    flyTo(spot.coords);
}

window.closeSearchBar = function closeSearchBar() {
    var elemStyle = document.getElementById('search-bar').style;

    if(window.matchMedia("(max-width: 768px)")) {
        elemStyle.height = "0";
        elemStyle.top = "0";
        elemStyle.opacity = "0";
        // elemStyle.display = "hidden";

        // document.getElementById('search-input').style.display = "hidden";
        // document.getElementById('search-bar-close').style.display = "hidden";
    }



    document.getElementById('search-bar-open').style.opacity = 1;
}

window.openSearchBar = function openSearchBar() {
    var elemStyle = document.getElementById('search-bar').style;


    elemStyle.height = "50%";
    elemStyle.top = "0.5rem";
    elemStyle.opacity = "1.0";

    document.getElementById('search-bar-open').style.opacity = 0;
}


window.resetSearchBar = function resetSearchBar() {
    document.getElementById('search-input').value = "";

    searchDropdown.innerHTML = "";
    searchDropdown.style.borderWidth = "0";
}


initRightClick();
initMap();
initSearch();