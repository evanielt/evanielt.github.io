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

var colorGood = "#4e7fa5ff";
var colorFine = "#e67943ff";
var colorBad = "#af2f54";


var spots = []

var spotStyle = new Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      src: '/images/marker.svg',
      scale: 0.05,
      color: colorGood,
    })
});

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

var spotSelectedStyle = new Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      src: '/images/marker.svg',
      scale: 0.07,
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


// fills in the spots variable with data from the spots.json file
fetch('/references/spots.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Couldn\'t find spot.json at ROOT/references/spots.json');
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
        for(var spotData of data) {
            spots.push(spotData);
        }

        var vectorLayer = createMarkers();
        initSelect(vectorLayer);
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });


function createMarkers() {
    var vectorSource = new VectorSource();

    // creates all the markers
    for(const spotData of spots) {
        var spot = new Feature({
            geometry: new Point(fromLonLat(spotData.coords)),
        });

        spot.setProperties({
            name: spotData.name,
            coords: spotData.coords,
            description: spotData.description,
            type: spotData.type,
            rating: spotData.rating,
        });

        console.log(spot.get("rating"));

        if(spot.get("rating") == "good") {
            spot.setStyle(spotGoodStyle);
        } else if(spot.get("rating") == "fine") {
            spot.setStyle(spotFineStyle);
        } else if(spot.get("rating") == "bad") {
            spot.setStyle(spotBadStyle);
        } else {
            spot.setStyle(spotStyle);
        }

        vectorSource.addFeature(spot);

        console.log("created marker " + spotData.name);
    };

    vectorLayer = new VectorLayer({
        source: vectorSource,
    });

    map.addLayer(vectorLayer);

    return vectorLayer;
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

    document.getElementById('sidebar-rating').innerHTML = "Rating: "+ spotData.rating;

    if(spotData.rating == "good") {
        document.getElementById('sidebar-rating').style.color = colorGood;
    } else if(spotData.rating == "fine") {
        document.getElementById('sidebar-rating').style.color = colorFine;
    } else if(spotData.rating == "bad") {
        document.getElementById('sidebar-rating').style.color = colorBad;
    } else {
        console.log("that rating shouldnt exist");
    }
    
    document.getElementById('sidebar-description').innerHTML = "Description: "+ spotData.description;
    document.getElementById('sidebar-type').innerHTML = "Type: "+ spotData.type;
    document.getElementById('sidebar-coords').innerHTML = "coordinates: "+ spotData.coords;
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

