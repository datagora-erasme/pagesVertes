const acteurs = data['features'];
// acteurs est une liste de geoJSON contenant les infos pour tous les acteurs


var iconCharte = L.icon({
  iconUrl: "static/CSS/images/Provenance_purple_charte.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -26],
  shadowUrl: 'static/CSS/images/marker-shadow.png',
  shadowSize: [41, 41],
  shadowAnchor: [10, 41]
});

var iconEmpty = L.icon({
  iconUrl: "static/CSS/images/Provenance_purple.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -26],
  shadowUrl: 'static/CSS/images/marker-shadow.png',
  shadowSize: [41, 41],
  shadowAnchor: [10, 41]
});

function drawPopup(){
  console.log(this);

  // highlight marker
  this.setOpacity(0.5);

  nom = this.data["Nom de l'acteur"];
  charte = this.data["charte de l'arbre"];
  html = '<div id="popup">'
  html += "<h2>" + nom + "</h2>";
  this.data["domaines"].forEach(element => {
    html = html + '<div id="text_popup" class="filtresPopup">' + element + '</div>'; 
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

// Création des markers et ajout des markers dans le groupe qui lui correspond dans la liste qui lui correpond
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
          var currentMarker = new L.marker([lat, long], {icon: iconCharte});
          currentMarker.data = acteur["properties"];
          currentMarker.on('mouseover', drawPopup);
          currentMarker.on('mouseout', function(){
            console.log("souris en dehors du popup");
            // on repasse à une opacité normale
            this.setOpacity(1);
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
          var currentMarker = new L.marker([lat, long], {icon: iconEmpty});
          currentMarker.data = acteur["properties"];
          currentMarker.on('mouseover', drawPopup);
          // ajout à l'objet pasCharte2 dans le groupe correspondant au domaine
          currentMarker.addTo(pasCharte2[domaine]);
          currentMarker.on('mouseout', function(){
            console.log("souris en dehors du popup");
            this.setOpacity(1);
            popup = this.getPopup();
            console.log("popup : ", popup);
            map.closePopup(popup);
          })
        }
        currentMarker.on('click', function(){
          console.log("clic sur marker");
          nom = this.data["Nom de l'acteur"];
          charte = this.data["charte de l'arbre"];
          console.log("Charte de l'arbre : ", charte);
          html = '<div id="divresult">'
          html += '<div id="headerData">';
          if (charte.length > 0) {
            html += '<img src="static/CSS/images/iconeCharte.png" class="iconCharteData"></img>'
          }
          html += '<h2 id="titreNom">' + nom + "</h2></div>";
          //display des datas propres à l'acteur
          
          //Récup des données
          typeDeStructure = this.data["Type de Structure"];
          siteWeb = this.data["Site web"];
          telephone = this.data["Téléphone"];

          html += '<h3>Type de structure : </h3>'
          html += '<p class="dataToDisplay">' + this.data["Type de structure"] + '</p>';
          html += "<h3>Expertise : </h3>";
          this.data["domaines"].forEach(element => {
            html = html + '<div id="text_popup" class="filtresPopup divDansDiv dataToDisplay">' + element + '</div>'; 
          });
          // ajouter les certifications et labels si possible
          // html += '<h3>Certifications et labels : </h3>';
          if (siteWeb.length > 0){
            // html += '<h3>Site Web : </h3>';
            html += '<p class="dataToDisplay lienWeb"><a href=' + this.data["Site web"] + ' target="_blank">' + this.data["Site web"] + '</a></p>';
          }
          if (telephone.length > 0){
            // html += '<h3>Téléphone : </h3>';
            html += '<p class="dataToDisplay">' + this.data["Téléphone"] + '</p>';
          }
          // html += '<h3>Adresse : </h3>';
          html += '<p class="dataToDisplay">' + this.data["adresse"] + '</p>';
          html += '</div>';
          document.getElementById("result").innerHTML = html;
          document.getElementById("result").style.display = "flex";
          // surbrillance du marker
          map.removeLayer(highlight);
          highlight.clearLayers();
          L.circleMarker(currentMarker.getLatLng(), { radius: 10 , opacity: 0, fillColor: "#000000", fillOpacity: .3 }).addTo(highlight);
          highlight.addTo(map);
        });
      }
    }
  });
});

let highlight = L.layerGroup();

// Enlever le div d'informations quand on clique à côté de la map
map.on("click", function(){
  document.getElementById("result").style.display = "none";
  //document.getElementById("result").innerHTML = "";//'<h1 style="font-size: 22px; padding: 10%;">S&eacute;lectionner un acteur sur la carte</h1>';
  map.removeLayer(highlight);
  highlight.clearLayers();
});


//ajout des checkboxes domaines au document
fieldset = document.getElementById("check2");
htmlFiltres = '<div id="checkboxes" style="display: none;">';
domaines.forEach(domaine => {
  htmlFiltres = htmlFiltres + '<div class="checkboxContainer"><label class="container"><input type="checkbox" id="'+domaine+'"  name="checkboxDomaine"><span class="checkmark"></span>' + domaine + '</label></div>'
});
htmlFiltres += '</div>';
fieldset.innerHTML += htmlFiltres;

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
  map.removeLayer(highlight);
  highlight.clearLayers();
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
    let currentMarker = new L.marker([lat, long], {icon: iconCharte});
    currentMarker.data = acteur["properties"];
    currentMarker.on('mouseover', drawPopup);
    currentMarker.addTo(charte);
    currentMarker.addTo(all);
  }
  else if (acteur["properties"]["couleur"] == "OK"){
    let currentMarker = new L.marker([lat, long], {icon: iconEmpty});
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
let boutonReinit = document.getElementById('reinit');
boutonReinit.addEventListener("click", reinitFilters);

/*
let cliquables = Array.from(document.getElementsByClassName("cliquable"));
console.log(cliquables);
cliquables.forEach(cliquable => {
  cliquable.addEventListener("mouseover", function(){
    console.log("survol d'un cliquable");
    cliquable.style.backgroundColor = "#1E3A67";
  });
  cliquable.addEventListener("mouseout", function(){
    cliquable.style.backgroundColor = "#BDB246";
  });
});


cliquables.forEach(cliquable => {
  cliquable.addEventListener("click", function(){
    console.log("clic sur cliquable");
    checkbox = this.parentNode.firstElementChild;
    console.log(checkbox);
    if (checkbox.checked){
      checkbox.checked = false;
    }
    else {
      checkbox.checked = true;
    }
    checkCheckboxesChecked();
  });
});
*/


function reinitFilters(){
  console.log("Réinitialisation des filtres");
  domaines.forEach(domaine => {
    currentCheckbox = document.getElementById(domaine);
    currentCheckbox.checked = false;
  });
  checkCheckboxesChecked();
}


/**
 * Création et export des acteurs sélectionnés sous forme CSV
 */

// Première partie, récupération des données d'intérêt (sélectionnées) et formatage (array de array)
//La fonction getDataCSV va chercher dans les points tracés sur la carto (contenus dans layerAffiche) toutes les données
// concernant les acteurs sélectionnés
function getDataCSV(){
  let CSV = [
    [
      "Nom de l'acteur",
      "Téléphone",
      "Site web",
      "Adresse",
      "Végétal local",
      "charte de l'arbre",
      "Type de structure",
    ]
  ]
  let dataCSV = [];

  layerGroups = layerAffiche['_layers'];
  for (truc in layerGroups) {
    //console.log(layerGroups[truc]);
    machin = layerGroups[truc]['_layers'];
    for (muche in machin) {
      //console.log(muche);
      dataCSV.push(machin[muche].data);
    }
  }

  dataCSV.forEach(line => {
    let temp = [];
    CSV[0].forEach(info => {
      temp.push(line[info]);
    });
    temp.push(line["domaines"]);
    console.log(line["domaines"]);
    CSV.push(temp);
  });

  // ajout des activités des acteurs
  CSV[0].push("Activités");


  return CSV
  // renvoie un tableau de tableau
  // 1ere ligne : en-têtes du CSV
  // autres lignes : données
}

function createCSV(tableauCSV) {
  let csvContent = "data:text/csv;charset=utf-8,";

  tableauCSV.forEach(rowArray => {
    let row = rowArray.join(",");
    csvContent += row + "\r\n";
  });
  var encodedUri = encodeURI(csvContent);
  var link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "liste_acteurs.csv");
  document.body.appendChild(link); 
  link.click();
}

// Gestion de la surbrillance du popup cliqué
/*
map.on('popupopen', function(e){
  e.popup.highlight = L.circleMarker(e.popup.getLatLng(), { radius: 15, opacity: 0, fillColor: "#000000", fillOpacity: .3 }).addTo(map);
});

map.on('popupclose',function(e) {
  map.removeLayer(e.popup.highlight);
});
*/

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