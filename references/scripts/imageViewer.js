window.openImageViewer = function openImageViewer(url) {
    var viewer = document.getElementById("image-viewer");
    var img = document.getElementById("image-viewer-image");
    var caption = document.getElementById("image-viewer-caption");

    viewer.style.display = "block";
    img.src = url;
    if(img.alt != null) {
        caption.innerHTML = img.alt;
    }

    document.body.classList.add('no-scroll');
}

window.closeImageViewer = function closeImageViewer() {
    document.getElementById("image-viewer").style.display = "none";

    document.body.classList.remove('no-scroll');
}

window.zoomImage = function zoomImage() {
    
}

images = document.querySelectorAll('.viewable-image');

images.forEach((image) => {
    console.log(image.src);

    image.onclick = function() {
        openImageViewer(image.src);
    };
});