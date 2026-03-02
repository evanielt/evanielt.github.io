var models = []
fetch('/references/models.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Couldn\'t find models.json at ROOT/references/models.json');
        }
        return response.json();
    })
    .then(data => {
        for(var modelData of data) {
            models.push(modelData);
            console.log("pushed");
        }

        shuffle(models);

        setModels();
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });


function setModels() {
    var models1 = "";

    console.log(models);

    for(var i in models) {
        var title = models[i].title;
        var url = models[i].url;
        var description = models[i].description;
        var imageurl = models[i].imageurl;

        var modelElement = `
                <a class="tile viewable-model" data-model="${url}" data-description="${description}" data-title="${title}">
                    <h2>${title}</h2>
                    <img src="${imageurl}">
                    <p>
                        ${description}
                    </p>
                </a>
                `;

        models1 += modelElement;

        console.log(modelElement);
    }

    document.getElementById('models-grid').innerHTML = models1;

    IndexModels();
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