/**
 * This is the main script 
 */

// acteurs est une liste de geoJSON contenant les infos pour tous les acteurs
const acteurs = data['features']

// layerAffiche est le layerGroup (variable) contenant les markers à afficher
let layerAffiche = L.layerGroup()

// Récupération des filtres
const domaines = [
  "Apprendre à jardiner et me former à l’écologie",
  "Concevoir mon futur espace végétalisé",
  "Planter et entretenir mes espaces verts",
  "M’approvisionner en végétaux et en semences",
  "Connaître la végétation sur mon terrain"
]

// Création des groupes de LayerGroup par labels
let groupePlanteBleue = {}
let groupeVegetalLocal = {}
let groupeCharte = {}
let groupe = {}

// construit le HTML en fonction des données
addCheckboxes()

// crée les markers à l'ouverture de la page
createMarkers()

// trace les markers à l'ouverture de la page
checkCheckboxesChecked()

// Ajoute un marker avec la position de l'utilisateur
drawMaPosition()


// Gestion des évènements du DOM

const boutonReinit = document.getElementById('reinit')
boutonReinit.addEventListener("click", reinitCheckboxes)

const checkboxes = document.querySelectorAll('input[type=checkbox]')
checkboxes.forEach(checkbox => {
  checkbox.addEventListener('change', checkCheckboxesChecked)
});
/*
document.getElementById("downloadCSV").addEventListener("click", function(){
  console.log("Téléchargement du CSV")
  createCSV(getDataCSV());
});
*/
map.addEventListener('click', animationFermetureResult)


/**
 * Those are the main functions of the script
 */


/**
 * createMarkers est une fonction qui crée des layerGroups (groupes de markers)
 * Chaque groupe (Label Végétal local, Charte de l'arbre et Plante bleue) possède ses propres layerGroups
 * qui correspondent à un domaine précis
 */
function createMarkers(){

  console.log("en train de créer les markers")
  //Création des différents icônes pour les signataires de la charte de l'arbre ou non
  let iconCharte = L.icon({
    iconUrl: "static/CSS/images/Provenance_purple_charte.png",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, 0],
    shadowUrl: 'static/CSS/images/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [10, 41],
  })
  let iconEmpty = L.icon({
    iconUrl: "static/CSS/images/Provenance_purple.png",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, 0],
    shadowUrl: 'static/CSS/images/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [10, 41]
  })

  // Création des layerGroups au sein des groupes
  domaines.forEach(domaine => {
    groupeCharte[domaine] = L.layerGroup()
    groupePlanteBleue[domaine] = L.layerGroup()
    groupeVegetalLocal[domaine] = L.layerGroup()
    groupe[domaine] = L.layerGroup()
  });

  // Création des markers et ajout dans les listes qui lui correspondent
  acteurs.forEach(acteur => {
    let lat = acteur["geometry"]["coordinates"][1]
    let lng = acteur["geometry"]["coordinates"][0]

    domaines.forEach(domaine => {
      //console.log(acteur.properties)
      //console.log("domaine : ", domaine)
      //console.log(acteur.properties[domaine])
      if (acteur.properties[domaine]) {
        // on teste s'il est signataire de la charte pour lui attribuer une icone
        let currentMarker = undefined
        if (acteur.properties["Signataire de la Charte de l'Arbre"]) {
          currentMarker = new L.marker([lat, lng], {icon: iconCharte})
        }
        else {
          currentMarker = new L.marker([lat, lng], {icon: iconEmpty})
        }
        // ajout des données et gestion des évènements associés au marker
        currentMarker.data = acteur["properties"]
        currentMarker.on('mouseover', drawPopup)
        currentMarker.on('mouseout', deletePopup)
        currentMarker.on('click', drawMarkerData)
        if (acteur.properties["Label Plante Bleue"]) {
          currentMarker.addTo(groupePlanteBleue[domaine])
        }
        if (acteur.properties["Marque végétal local"]) {
          currentMarker.addTo(groupeVegetalLocal[domaine])
        }
        if (acteur.properties["Signataire de la Charte de l'Arbre"]) {
          currentMarker.addTo(groupeCharte[domaine])
        }
        currentMarker.addTo(groupe[domaine])
      }
    })
  })
}


/**
 * drawPopup is a function that draws a popup with relevant data
 *  when you hover a marker
 */
function drawPopup() {

  let htmlPopup = '<div class="popupOnHover">'
  htmlPopup += '<h2 class="popupTitle">' + this.data["Nom de l'acteur"] + '</h2>'
  domaines.forEach(domaine => {
    if (this.data[domaine]) {
      htmlPopup += '<div class="filtresPopup">' + domaine + '</div>'
    }
  });
  htmlPopup += '</div>'
  popup = this.bindPopup(htmlPopup, maxWidth=10)
  popup.openPopup()
}


/**
 * delete Popup is a function that deletes the popup
 * when your mouse is out of the marker
 */
function deletePopup() {
  popup = this.getPopup()
  map.closePopup(popup)
}


/**
 * drawMarkerData is a function that draws the result div at the right of the screen
 * with relevant and detailed data about an actor when you click on its marker
 */
function drawMarkerData() {

  let html = '<div id="titreNomActeurResult">'+ this.data["Nom de l'acteur"] +'</div>'
  html += '<div class="dataToDisplay" id="structure">' + this.data["Type de structure"] + '</div>'
  domaines.forEach(domaine => {
    if (this.data[domaine]) {
      html += '<div class="dataToDisplay expertise">' + domaine + '</div>'
    }
  });
  html += '<div class="coordonnees">'
  if (this.data["Site web"]) {html += '<a target="_blank" class="dataToDisplay coordonnee" href="' + this.data["Site web"] + '"><iconify-icon icon="mdi:web" width="20" height="20" class="iconCoords"></iconify-icon>Site web</a>'}
  if (this.data["Email"]){html += '<div class="dataToDisplay coordonnee"><iconify-icon icon="ic:twotone-alternate-email" width="20" height="20" class="iconCoords"></iconify-icon>' + this.data["Email"] + '</div>'}
  if (this.data["Téléphone"]){html += '<div class="DataToDisplay coordonnee"><iconify-icon icon="carbon:phone" width="20" height="20" class="iconCoords"></iconify-icon>' + this.data["Téléphone"] + '</div>'}
  html += '<div class="dataToDisplay coordonnee"><iconify-icon icon="ep:position" width="20" height="20" class="iconCoords"></iconify-icon>' + this.data["Adresse"] + '</div>'
  html += '</div>'
  html += '<div class="labelsContainer">'
  if (this.data["Signataire de la Charte de l'Arbre"]) {html += '<img src="static/CSS/images/logo charte arbre.png" alt="logo Charte de l' + "'" + 'Arbre" class="logoLabel">'}
  if (this.data["Marque végétal local"]) {html += '<img src="static/CSS/images/logo-vegetal-local.png" alt="logo Végétal Local" class="logoLabel" id="logoVegetal">'}
  if (this.data["Label Plante Bleue"]) {html += '<img src="static/CSS/images/plante_bleue.png" alt="logo Plante Bleue" class="logoLabel">'}
  html += '</div>'
  if (this.data["Signataire de la Charte de l'Arbre"]) {html += '<div class="dataToDisplay" id="signataire"><img class="logoLabel" id="feuilleCharte" src="static/CSS/images/iconeCharte.png" alt="logoCharte">Signataire de la charte de l' + "'" + 'arbre</div>'}
  document.getElementById("result").innerHTML = html
  document.getElementById("result").style.display = "block"

  // TODO : ajouter la surbrillance du marker

  // Animation du result (voir front.js)
  animationOuvertureResult()
}


/**
 * deteMarkerData is a function that deletes the relevant marker
 * when it is not needed to be plotted
 */
function deleteMarkerData() {
  map.on('click', function() {
    // TODO : ajouter l'enlèvelent du highlight sur le marker pointé
    animationFermetureResult()
  })
}


/**
 * addCheckboxes is a function that gets the name of the checkboxes from
 * "domaines" you want to have to filter data
 */
function addCheckboxes () {

  // ajout des éléments checkboxes au DOM
  checkboxContainer = document.getElementById("check2")
  htmlFiltres = '<div id="checkboxes" class="checkboxes" style="display: none;">'
  domaines.forEach(domaine => {
    htmlFiltres += '<label class="checkboxContainer" for="' + domaine + '"><input type="checkbox" id="'
    htmlFiltres += domaine
    htmlFiltres += '"  name="' + domaine + '"><span class="checkmark"></span><div class="checkboxText">' + domaine + '</div></label>'
  });
  htmlFiltres += '</div>'
  checkboxContainer.innerHTML += htmlFiltres
}


/**
 * checkCheckboxesChecked is the function that checks
 * which checkboxes are checked and then plots the
 * linked markers on the map
 */
function checkCheckboxesChecked() {

  console.log("traçage des markers")

  // Efface tous les markers affichés (supprime aussi tous les élément de layerAffiche)
  map.removeLayer(layerAffiche)
  layerAffiche.clearLayers()
  let noCheckboxChecked = true
  // TODO : gérer enlever la surbrillance des markers cliqués qd on modifie une checkbox

  domaines.forEach(domaine => {
    currentCheckbox = document.getElementById(domaine)
    if (currentCheckbox.checked) {
      noCheckboxChecked = false
      // vérification de à quel groupe appartient le marker
      // TODO : Attention je pense qu'il faut placer le marker signataire en dernier histoire que ce soit celui qu'on voit
      checkGroupeCheckbox(domaine)
    }
  });
  // test si aucune checkbox n'est cochée, afficher tout le monde
  if (noCheckboxChecked) {
    domaines.forEach(domaine => {
      checkGroupeCheckbox(domaine)
    });
  }
  layerAffiche.addTo(map)
}


/**
 * checkGroupeCheckbox is a function that checks if the groupeCheckboxes (charte de l'arbre, plante bleue ...)
 * are checked and adds the domaine markers that corresponds to layerAffiche
 * @param {string} domaine 
 */
function checkGroupeCheckbox (domaine) {

  let checkboxCharte = document.getElementById("checkboxCharte")
  let checkboxVegetalLocal = document.getElementById("checkboxVegetalLocal")
  let checkboxPlanteBleue = document.getElementById("checkboxPlanteBleue")
  if (checkboxPlanteBleue.checked) {
    groupePlanteBleue[domaine].addTo(layerAffiche)
  }
  if (checkboxVegetalLocal.checked) {
    groupeVegetalLocal[domaine].addTo(layerAffiche)
  }
  if (checkboxCharte.checked) {
    groupeCharte[domaine].addTo(layerAffiche)
  }
  if (!(checkboxCharte.checked || checkboxPlanteBleue.checked || checkboxVegetalLocal.checked)) {
    // TODO : attention là la condition ne va pas
    groupe[domaine].addTo(layerAffiche)
  }
}


/**
 * reinitCheckboxes is a function used to reset
 *  the filters when you click on the resetting button
 */
function reinitCheckboxes () {
  const checkboxesReinit = Array.from(document.querySelectorAll("input[type=checkbox"))
  checkboxesReinit.forEach(currentCheckbox => {
    currentCheckbox.checked = false
  });
  /*
  domaines.forEach(domaine => {
    currentCheckbox = document.getElementById(domaine)
    currentCheckbox.checked = false
  });
  */
  checkCheckboxesChecked()
}


function getDataCSV () {

}


/**
 * function that gets position of the device and draws it on the map
 */
function drawMaPosition () {

   let iconMaPosition = L.icon({
    iconUrl: "static/CSS/images/Provenance_maPosition.png",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, 0],
    shadowUrl: 'static/CSS/images/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [10, 41],
  })

  let options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  }

  function success (pos) {
    let crd = pos.coords;
    let markerMaPosition = new L.marker([crd.latitude, crd.longitude], {icon: iconMaPosition})

    // Gestion du z-index
    L.Marker.prototype.__setPos = L.Marker.prototype._setPos
    L.Marker.prototype._setPos = function () {
      L.Marker.prototype.__setPos.apply(this, arguments)
      this._zIndex = this.options.zIndexOffset
      this._resetZIndex()
    }
    markerMaPosition.setZIndexOffset(1000)
    
    markerMaPosition.on('mouseover', function () {
      console.log("marker hovered")
      popup = this.bindPopup("Ma Position", maxWidth=10)
      popup.openPopup()
    })
    markerMaPosition.on('mouseout', function () {
      console.log("markerUnhovered")
      popup = this.getPopup()
      map.closePopup(popup)
    })
    markerMaPosition.addTo(map)

    console.log('Votre position actuelle est :');
    console.log(`Latitude : ${crd.latitude}`);
    console.log(`Longitude : ${crd.longitude}`);
    console.log(`La précision est de ${crd.accuracy} mètres.`);
    map.setView([crd.latitude, crd.longitude], 13)
  }

  function error (err) {
    console.warn(`ERREUR (${err.code}): ${err.message}`)
  }

  navigator.geolocation.getCurrentPosition(success, error, options)
}


/**
 * Gestion des animations
 */

// Script principal de gestion des animations

legendes = Array.from(document.getElementsByClassName('derouleurCheckboxes'));
// Display des filtres à cocher si jamais le truc déroulant est coché 
legendes.forEach(legende => {
    legende.addEventListener("click", async function(){
        console.log("Légende cliquée");
        let checkboxesAnim = Array.from(legende.parentNode.getElementsByClassName("checkboxes"))[0];

        if (checkboxesAnim.style.display === 'none'){
            checkboxesAnim.classList.remove("filtreRemballe");
            checkboxesAnim.style.display = "flex";
            checkboxesAnim.classList.add("filtreDeroule");
        }
        else{
            checkboxesAnim.classList.remove("filtreDeroule");
            checkboxesAnim.classList.add("filtreRemballe");
            // mettre une pause ici
            await sleep(200);
            checkboxesAnim.style.display = 'none';
        };
    });
});


deroulants = Array.from(document.getElementsByClassName("derouleurCheckboxes"));
deroulants.forEach(deroulant => {
    deroulant.deroule = false;
    deroulant.addEventListener("click", function(){
        if (this.deroule) {
            this.firstChild.innerHTML = '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="chevron-right" class="svg-inline--fa fa-chevron-right " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path fill="currentColor" d="M96 480c-8.188 0-16.38-3.125-22.62-9.375c-12.5-12.5-12.5-32.75 0-45.25L242.8 256L73.38 86.63c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0l192 192c12.5 12.5 12.5 32.75 0 45.25l-192 192C112.4 476.9 104.2 480 96 480z"></path></svg>';
            this.deroule = false;
        }
        else {
            this.firstChild.innerHTML = '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="chevron-down" class="svg-inline--fa fa-chevron-down " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M224 416c-8.188 0-16.38-3.125-22.62-9.375l-192-192c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0L224 338.8l169.4-169.4c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25l-192 192C240.4 412.9 232.2 416 224 416z"></path></svg>';
            this.deroule = true;
            this.parentNode.style = "";
        }
    });
});


/**
 * animationOuvertureResult gère l'animation d'ouverture du div de result lors
 * du click sur un marker
 */
function animationOuvertureResult() {
  result = document.getElementById("result");
  result.classList.remove("fermetureResult")
  result.classList.add("ouvertureResult");
}

/**
 * animationFermetureResult gère l'animation de fermeture du div de result lors
 * du click sur la map
 */
function animationFermetureResult() {
  result =  document.getElementById("result");
  result.classList.remove("ouvertureResult")
  result.classList.add("fermetureResult");
}

/**
 * sleep permet de faire un wait pour les animations qui le nécessitent
 * 
 * @param {number} ms 
 * @returns 
 */
 function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}