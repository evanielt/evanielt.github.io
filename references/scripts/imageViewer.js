var images;

var imageViewerIsOpen = false;
var currentImageIndex;

window.IndexImages = function IndexImages() {
    images = document.querySelectorAll('.viewable-image');
    var imgIndex = 0;

    images.forEach((image) => {
        image.onclick = function() {
            openImageViewer(image);
        };

        image.setAttribute("data-imageIndex", imgIndex);
        console.log("Image indexed: " + imgIndex);

        imgIndex++;
    });
}



window.openImageViewer = function openImageViewer(imageToOpen) {
    var viewer = document.getElementById("image-viewer");
    var img = document.getElementById("image-viewer-image");
    var caption = document.getElementById("image-viewer-caption");

    viewer.style.display = "block";
    img.src = imageToOpen.src;
    if(img.alt != null) {
        caption.innerHTML = img.alt;
    }

    document.body.classList.add('no-scroll');

    imageViewerIsOpen = true;
    currentImageIndex = Number(imageToOpen.getAttribute("data-imageIndex"));
}

window.closeImageViewer = function closeImageViewer() {
    document.getElementById("image-viewer").style.display = "none";

    document.body.classList.remove('no-scroll');

    imageViewerIsOpen = false;
}

window.zoomImage = function zoomImage() {
    
}




window.imageViewerPrevious = function imageViewerPrevious() {
    if(imageViewerIsOpen) {
        closeImageViewer();
    }

    currentImageIndex--;
    clampImageIndex();

    openImageViewer(images[currentImageIndex]);
}

window.imageViewerNext = function imageViewerNext() {
    if(imageViewerIsOpen) {
        closeImageViewer();
    }

    currentImageIndex++;
    clampImageIndex();

    openImageViewer(images[currentImageIndex]);
}

function clampImageIndex() {
    if(currentImageIndex < 0) {
        currentImageIndex = images.length - 1;
    }

    if(currentImageIndex > images.length - 1) {
        currentImageIndex = 0;
    }
}



IndexImages();