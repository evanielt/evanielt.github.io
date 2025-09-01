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


var spots = []

var spotStyle = new Style({
    image: new ol.style.Icon({
      anchor: [0.5, 0.5],
      src: '/images/marker.svg',
      scale: 0.029,
    })
    // image: new Circle({
    //     radius: 5,
    //     fill: new Fill({
    //         color: color
    //     }),
    //     stroke: new Stroke({
    //         color: color1,
    //         width: 3
    //     }),
    // })
});

var spotSelectedStyle = new Style({
    // image: new ol.style.Icon({
    //   anchor: [0.5, 0.5],
    //   src: '/images/marker.svg',
    //   scale: 0.04,
    // })
    image: new Circle({
        radius: 8,
        fill: new Fill({
            color: color4,
        }),
        stroke: new Stroke({
            color: color3,
            width: 3
        }),
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
fetch('../../spots.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Couldn\'t find spot.json');
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
            geometry: new Point(fromLonLat(spotData.coord)),
        });

        spot.setProperties({
            name: spotData.name,
            category: spotData.category,
            description: spotData.description,
            recommended: spotData.recommended
        });

        spot.setStyle(spotStyle);

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
            openSidebar();
            selectedFeature.setStyle(spotSelectedStyle);
        }
    } else {
        closeSidebar();
    }
    });
}


// ------------------------------------- double click flying -------------------------------------

// map.on('dblclick', function(evt) {
//     var coordinates = evt.coordinate;
//     console.log("double");
//     flyTo(coordinates);
// });

// ------------------------------------- global functions -------------------------------------

window.closeSidebar = function closeSidebar() {
    document.getElementById('sidebar').style.right = "-20%";
}
window.openSidebar = function openSidebar() {
    document.getElementById('sidebar').style.right = "0";
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

