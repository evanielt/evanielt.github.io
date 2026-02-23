var models;

var modelViewerIsOpen = false;
var currentModelIndex;

window.IndexModels = function IndexModels() {
    models = document.querySelectorAll('.viewable-model');
    var modIndex = 0;

    console.log("Indexing models");
    models.forEach((model) => {
        model.onclick = function() {
            openModelViewer(model);
        };

        model.setAttribute("data-modelIndex", modIndex);        
        console.log("model indexed: " + modIndex);

        modIndex++;
    });
}



window.openModelViewer = function openModelViewer(modelToOpen) {
    var total = document.getElementById("model-viewer");
    var viewer = document.getElementById("model-viewer-viewer");
    // var caption = document.getElementById("model-viewer-caption");

    total.style.display = "block";
    document.body.classList.add('no-scroll');

    viewer.setAttribute('src', modelToOpen.getAttribute("data-model"), 2000)
    
    modelViewerIsOpen = true;
    currentmodelIndex = Number(modelToOpen.getAttribute("data-modelIndex"));
}

window.closeModelViewer = function closeModelViewer() {
    document.getElementById("model-viewer").style.display = "none";

    document.body.classList.remove('no-scroll');

    modelViewerIsOpen = false;
}


window.modelViewerPrevious = function modelViewerPrevious() {
    if(modelViewerIsOpen) {
        closemodelViewer();
    }

    currentModelIndex--;
    clampmodelIndex();

    openmodelViewer(models[currentModelIndex]);
}

window.modelViewerNext = function modelViewerNext() {
    if(modelViewerIsOpen) {
        closemodelViewer();
    }

    currentModelIndex++;
    clampmodelIndex();

    openmodelViewer(models[currentModelIndex]);
}

function clampModelIndex() {
    if(currentModelIndex < 0) {
        currentModelIndex = models.length - 1;
    }

    if(currentModelIndex > models.length - 1) {
        currentModelIndex = 0;
    }
}


IndexModels();