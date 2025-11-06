var images = []
fetch('/references/portfolio.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Couldn\'t find portfolio.json at ROOT/references/portfolio.json');
        }
        return response.json();
    })
    .then(data => {
        for(var imageData of data) {
            images.push(imageData);
            console.log("pushed");
        }

        shuffle(images);

        setImages();
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });


function setImages() {
    var images1 = "";
    var images2 = "";
    var images3 = "";

    for(var i in images) {
        var url = images[i].url;
        var description = images[i].description;

        var imageElement = `<img src="${url}" class="viewable-image portfolio-image" alt="${description}">`
        if(i % 3 == 0) {
            images1 += imageElement;
        } else if(i % 3 == 1) {
            images2 += imageElement;
        } else {
            images3 += imageElement;
        }
    }

    document.getElementById('images1').innerHTML = images1;
    document.getElementById('images2').innerHTML = images2;
    document.getElementById('images3').innerHTML = images3;

    IndexImages();
}

function shuffle(array) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
}