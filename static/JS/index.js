const acteurs = data['features'];
// acteurs est une liste de geoJSON contenant les infos pour tous les acteurs


var myIcon = L.icon({
  iconUrl: "static/CSS/images/green_icon.png",
  iconSize: [29, 47],
  shadowUrl: 'static/CSS/images/marker-shadow.png',
});

function drawPopup(){
  console.log(this);
  nom = this.data["Nom de l'acteur"];
  charte = this.data["charte de l'arbre"];
  html = '<div id="popup">'
  html += "<h2>" + nom + "</h2>";
  this.data["domaines"].forEach(element => {
    html = html + '<div id="text_popup">' + element + '</div>'; 
  });
  html += '</div>';
  popup = this.bindPopup(html, maxWidth=10);
  console.log("popup : ", popup);
  popup.openPopup();
}


/**Création des filtres
 * on crée des groupes de markers qui correspondent aux filtres et on gère leur affichage
 */

// domaines contient les filtres qu'on veut

let filtres = [];
domaines.forEach(element => {
  element.markers = L.layerGroup();
});

// On distingue de manière globale les signataires de la charte de l'arbre (liste ou attribut?)
let charte2 = {};
let pasCharte2 = {};
domaines.forEach(domaine => {
  // Création du layerGroup correspondant au domaine
  charte2[domaine] = L.layerGroup();
  pasCharte2[domaine] = L.layerGroup();
});

// Création des markers et ajout des markers dans le groupe qui lui corrspond dans la liste qui lui correpond
acteurs.forEach(acteur => {
  let lat = acteur["geometry"]["coordinates"][1];
  let long = acteur["geometry"]["coordinates"][0];
  // On distingue les acteurs en fonction des filtres
  domaines.forEach(domaine => {
    console.log("dans la première boucle");
    console.log("acteur.properties.couleur", acteur["properties"]["couleur"]);
    if (acteur["properties"]["couleur"] == "OK"){
      console.log("dans la 2e boucle");
      // On check si l'acteur a le domaine 
      if (acteur.properties.domaines.includes(domaine)){
        console.log("il existe un domaine qui colle");
        if (acteur.properties["charte de l'arbre"].length > 0){
          console.log("Dans la boucle de construction")
          // Création du marker avec la pastille verte
          var currentMarker = new L.marker([lat, long], {icon: myIcon});
          currentMarker.data = acteur["properties"];
          currentMarker.on('mouseover', drawPopup);
          currentMarker.on('mouseout', function(){
            console.log("souris en dehors du popup");
            popup = this.getPopup();
            console.log("popup : ", popup);
            map.closePopup(popup);
          });
          // ajout à l'objet charte2 dans le groupe correspondant au domaine
          currentMarker.addTo(charte2[domaine]);
          console.log("ajout du marker dans charte2 : ", charte2[domaine]);
        }
        else{
          // Création du marker avec pastille normale
          var currentMarker = new L.marker([lat, long]);
          currentMarker.data = acteur["properties"];
          currentMarker.on('mouseover', drawPopup);
          // ajout à l'objet pasCharte2 dans le groupe correspondant au domaine
          currentMarker.addTo(pasCharte2[domaine]);
          currentMarker.on('mouseout', function(){
            console.log("souris en dehors du popup");
            popup = this.getPopup();
            console.log("popup : ", popup);
            map.closePopup(popup);
          })
        }
        currentMarker.on('click', function(){
          console.log("clic sur marker");
          nom = this.data["Nom de l'acteur"];
          charte = this.data["charte de l'arbre"];
          html = '<div id="divresult">'
          html += "<h2>" + nom + "</h2>";
          if (charte.length > 0){
            html = html + '<div id="image_popup">' + '<a href="https://blogs.grandlyon.com/developpementdurable/en-actions/dispositifs-partenariaux/charte-de-larbre/"><img src="' + 'static/CSS/images/chartedelarbre.jpg" id="charte">' +'</img>'+ '</div></a>';
          }
          this.data["domaines"].forEach(element => {
            html = html + '<div id="text_popup">' + element + '</div>'; 
          });
          html += '</div>';
          document.getElementById("result").innerHTML = html;
        });
      }
    }
  });
});

// Enlever le div d'informations quand on clique à côté de la map
map.on("click", function(){
  document.getElementById("result").innerHTML = "";
});


//ajout des checkboxes domaines au document
fieldset = document.getElementById("check2");
htmlFiltres = "";
domaines.forEach(domaine => {
  htmlFiltres = htmlFiltres + '<div><input type="checkbox" id="'+domaine+'"  name="checkboxDomaine"><label for="scales">' + domaine + '</label></div>'
});
fieldset.innerHTML = htmlFiltres;

let checkboxCharte2 = document.getElementById("checkboxCharte2");
// layerAffiche est le layerGroup (variable, qui contient les points à afficher en fonction des checkboxes)
var layerAffiche = L.layerGroup();

checkboxCharte2.addEventListener('change', checkCheckboxesChecked);

domaines.forEach(domaine => {
  currentCheckbox = document.getElementById(domaine);
  currentCheckbox.addEventListener("change", checkCheckboxesChecked);
});

function checkCheckboxesChecked(){
  // Efface tous les layers affichés (supprime de la map ainsi que du layerAffiche)
  map.removeLayer(layerAffiche);
  layerAffiche.clearLayers();
  console.log("après clean de layer : ", layerAffiche);
  var aucuneCheckboxCochee = true;

  // parcourt les petites checkboxes
  domaines.forEach(domaine => {
    currentCheckbox = document.getElementById(domaine);
    if (currentCheckbox.checked){
      aucuneCheckboxCochee = false;
      if (checkboxCharte2.checked){
        charte2[domaine].addTo(layerAffiche);
      }
      else {
        pasCharte2[domaine].addTo(layerAffiche);
        charte2[domaine].addTo(layerAffiche);
      }
    }
  });

  // si aucune des petites checkboxes n'est cochée, tout afficher
  if (aucuneCheckboxCochee){
    // tout ajouter au layer Affiche et plot
    domaines.forEach(domaine => {
      if (checkboxCharte2.checked){
        charte2[domaine].addTo(layerAffiche);
      }
      else{
        pasCharte2[domaine].addTo(layerAffiche);
        charte2[domaine].addTo(layerAffiche);
      }
    });
  }
  layerAffiche.addTo(map);
}

let charte = L.layerGroup();
let pasCharte = L.layerGroup();
let all = L.layerGroup();
let rouge = L.layerGroup();
let orange = L.layerGroup();
let OK = L.layerGroup();

// Création des markers et ajout des markers dans des groupes (layerGroup) correspondant à une checkbox
acteurs.forEach(acteur => {
  let lat = acteur["geometry"]["coordinates"][1];
  let long = acteur["geometry"]["coordinates"][0];

  if (acteur["properties"]["charte de l'arbre"].length > 0 && acteur["properties"]["couleur"] == "OK"){
    let currentMarker = new L.marker([lat, long], {icon: myIcon});
    currentMarker.data = acteur["properties"];
    currentMarker.on('mouseover', drawPopup);
    currentMarker.addTo(charte);
    currentMarker.addTo(all);
  }
  else if (acteur["properties"]["couleur"] == "OK"){
    let currentMarker = new L.marker([lat, long]);
    currentMarker.data = acteur["properties"];
    currentMarker.on('mouseover', drawPopup);
    currentMarker.addTo(pasCharte);
    currentMarker.addTo(all);
  }

  let couleur = acteur["properties"]["couleur"];
  let currentMarker = new L.marker([lat, long]);
  currentMarker.data = acteur["properties"];
  currentMarker.on('mouseover', drawPopup);
  if (couleur == "rouge"){
    currentMarker.addTo(rouge);
  }
  else if (couleur == "orange"){
    currentMarker.addTo(orange);
  }
  else {
    currentMarker.addTo(OK);
  }
});

// Réinitialisation des filtres
let boutonReinit = document.getElementById("boutonReinit");
boutonReinit.addEventListener("click", reinitFilters);

function reinitFilters(){
  console.log("Réinitialisation des filtres");
  domaines.forEach(domaine => {
    currentCheckbox = document.getElementById(domaine);
    currentCheckbox.checked = false;
  });
  checkCheckboxesChecked();
}

/*
// Permet d'utiliser directement un élément de la bibliothèque Leaflet pour une sorte de checkbox
var overlays = {
  'Charte': charte,
  'pas de charte': pasCharte
};
var layerControl = L.control.layers(overlays).addTo(map);
*/

// Mise en place des filtres
/*
var checkboxRouge = document.getElementById("checkboxRouge");
checkboxRouge.markers = rouge;

var checkboxOrange = document.getElementById("checkboxOrange");
checkboxOrange.markers = orange;

var checkboxOK = document.getElementById("checkboxOK");
checkboxOK.markers = OK;

var checkboxSignataire = document.getElementById("checkboxSignataire");
checkboxSignataire.markers = charte;

var checkboxPasSignataire = document.getElementById("checkboxPasSignataire");
checkboxPasSignataire.markers = all;

var checkboxes = [checkboxPasSignataire, checkboxSignataire, checkboxOrange, checkboxRouge, checkboxOK];
checkboxes.forEach(element => {
  element.addEventListener('change', checkCheckboxesChecked);
});


/*
La fonction checkCheckboxesChecked est appelée à chaque modification de l'état d'une checkbox
Elle supprime tous les points de la map et parcourt ensuite les checkboxes et place les points
des checkboxes cochées
*/
/*
function checkCheckboxesChecked(){
  console.log("checkCheck appelée");

  // On retire tous les points de la map
  checkboxes.forEach(element => {
    map.removeLayer(element.markers);    
  })

  //On ajoute les points à placer à la liste de points
  checkboxes.forEach(element => {
    if (element.checked){
      // On parcourt les points associés à la checkbox et les place sur la map
      // Leaflet gère automatiquement les doublons et ne place qu'une fois un point
      element.markers.addTo(map);
    }
  });
}


// Prendre en compte le filtre de parcsJSON
/*
console.log(parcsJson);

L.geoJSON(parcsJson).addTo(map);
*/
