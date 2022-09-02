# pagesVertes

## project description
Cartographie des acteurs de la végétalisation recensés par l'agence d'urbaisme de l'aire métropolitaine lyonnaise

## running the app
run pip install -r requirements.txt

py main.py

go to : [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

## update data
(install requirements if not already installed)

py main.py

go to : [127.0.0.1:8000/update_data](127.0.0.1:8000/update_data)




(((
## create a google sheets token with
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
)))
