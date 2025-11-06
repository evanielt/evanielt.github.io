const randomFrontImageList = [
  '/images/portfolio/IMG_0190.jpg',
  '/images/portfolio/IMG_0402.jpg',
  '/images/portfolio/IMG_9707.jpg',
  '/images/portfolio/P6170040.JPG',
  '/images/portfolio/IMG_9277.JPG',
  '/images/portfolio/IMG_9516.jpg',
  '/images/portfolio/IMG_20240104_141730_713.jpg'
];

function setRandomImage() {
    const randomIndex = Math.floor(Math.random() * randomFrontImageList.length);
    const selected_image = randomFrontImageList[randomIndex];

    document.getElementById('front-image-image').src = selected_image;
}

setRandomImage();
