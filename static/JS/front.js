
// fonction qui permet de faire un wait pour les animations
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


legendes = Array.from(document.getElementsByClassName('LegendeFiltres'));

console.log("front.js bien chargé")

// Display des filtres à cocher si jamais le truc déroulant est coché 
legendes.forEach(legende => {
    legende.addEventListener("click", async function(){
        console.log("Légende cliquée");
        checkboxes = Array.from(legende.parentNode.getElementsByClassName("checkboxes"))[0];

        if (checkboxes.style.display === 'none'){
            checkboxes.classList.remove("filtreRemballe");
            checkboxes.style.display = "flex";
            checkboxes.classList.add("filtreDeroule");
        }
        else{
            checkboxes.classList.remove("filtreDeroule");
            checkboxes.classList.add("filtreRemballe");
            // mettre une pause ici
            await sleep(500);
            checkboxes.style.display = 'none';
        };
    });
});

deroulants = Array.from(document.getElementsByClassName("deroulant"));

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


// plutôt à mettre dans index.js
// Gestion de l'appel à la fonction pour télécharger le CSV
document.getElementById("downloadCSV").addEventListener("click", function(){
    console.log("Téléchargement du CSV")
    createCSV(getDataCSV());
});

// mise en surbrillance des icones téléchargement ==> TODO : nul, faire du CSS
Array.from(document.getElementsByClassName("telechargement")).forEach(telechar => {
    telechar.addEventListener("mouseover", function(){
        console.log("survol d'une icone");
        this.style.opacity = 0.5;
    }
    );
});

Array.from(document.getElementsByClassName("telechargement")).forEach(telechar => {
    telechar.addEventListener("mouseout", function(){
        console.log("souris en dehors");
        this.style.opacity = 1;
    }
    );
});

// Animation du result au click sur le marker

function animationOuvertureResult() {
    result = document.getElementById("result");
    result.classList.remove("fermetureResult");
    result.classList.add("ouvertureResult");
}

function animationFermetureResult() {
    result =  document.getElementById("result");
    result.classList.remove("ouvertureResult");
    result.classList.add("fermetureResult");
}