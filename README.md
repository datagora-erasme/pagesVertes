
# pagesVertes

## project description

Cartographie des acteurs de la végétalisation recensés par l'agence d'urbanisme de l'aire métropolitaine lyonnaise

## running the app

`docker run --name pagesvertes -p 8000:8000 erasme/pagesvertes`



go to : [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

## update data

go to : [127.0.0.1:8000/update_data](http://127.0.0.1:8000/update_data)

enter the password (in ERASME's bitwarden)

if nothing happens, it worked !

wait for the update (a few minutes)


##  (create a google sheets token with) Optional, for your information
You must have access to the google sheets "Outil de sélection des acteurs de la végétalisation"

go to https://console.cloud.google.com, log in with your google account and create a project

then open "Menu de navigation"

select "API et services" and "Identifiants"

select "créer des identifiants" and "Compte de service"

click on the "Compte de service" you created and select "Clés"

Click on "Ajouter une clé" and "Créer une clé"

select JSON

the JSON file for token is automatically downloaded

put it in the folder of the project and rename it service_account.json
