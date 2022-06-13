# -*- coding: utf-8 -*-
"""
Permet de créer un geoJSON en requêtant l'API adresse.data.gouv avec le nom de l'acteur 
ainsi que l'adresse si indiquée
Si adresse pas renseignée, requête à la base SIRENE de gouv
on prend les adresses les plus proches de Lyon 
"""

import gspread
import requests
import json

def get_adresse(nom):    
    """Récupérer les adresses des entreprises avec leur SIRET"""
    # documentation : https://api.insee.fr/catalogue/site/themes/wso2/subthemes/insee/pages/item-info.jag?name=Sirene&version=V3&provider=insee
    
    try:
        headers = {
            'Accept': 'application/json',
            'Authorization': 'Bearer 19c4a3f5-7c0d-3fa5-b9ce-16844942ea67',
        }
        
        params = {
            'nombre': '1',
            'q': 'denominationUniteLegale:"' + nom + '"~*' + ' OR sigleUniteLegale:"' + nom + '"~*' + ' AND codePostalEtablissement:69*',
            'champs': 
                'denominationUniteLegale,complementAdresseEtablissement,numeroVoieEtablissement,indiceRepetitionEtablissement,typeVoieEtablissement,libelleVoieEtablissement,codePostalEtablissement,libelleCommuneEtablissement,libelleCommuneEtrangerEtablissement,distributionSpecialeEtablissement,codeCommuneEtablissement',
            'masquerValeursNulles': 'true'
        }
        
        response = requests.get('https://api.insee.fr/entreprises/sirene/V3/siret', params=params, headers=headers)
        
        adresse = list(response.json()['etablissements'][0]['adresseEtablissement'].values())
        
        str_adresse = ' '.join(filter(None,adresse))
        
        return str_adresse
    except:
        return ''

def create_geo_per_file():
    """Récupération des données de l'API GGdrive"""
    sa = gspread.service_account(filename = "service_account.json")
    sh = sa.open("Copie de Outils sélection des acteurs de la végétalisation")
    wks = sh.worksheet("Selection_Liste d'acteurs")       #rendre la ligne dynamique (done?)
    
    d = wks.get_all_records()
    
    mongeo = dict(type="FeatureCollection")
    mongeo["features"] = []
    
    domaines = [
        "Animation de réseau",
        "Sensibilisation grand public",
        "Formation de professionnels",
        "Conception - paysagisme",
        "Plantation et entretien",
        "Pépinière",
        "Expertise naturaliste"
        ]
    
    for line in d:
        nom = line["Nom de l'acteur"]
        adresse = line["Adresse"]
        if line["est en rouge"]:
            couleur = "rouge"
        elif line["est en orange"]:
            couleur = "orange"
        else :
            couleur = "OK"
        
        if len(adresse) == 0 and len(nom) > 0:
            ##requête API pour avoir adresse plus précise
            try:
                adresse = get_adresse(nom)
                print(nom, adresse)
            except:
                print('erreur : ',nom)
        query = nom + ' ' + adresse
        params = {
            'q': query,
            'limit': '1',
            'lat': '45.750000',
            'lon': '4.850000'
        }
        
        try:
            response = requests.get('https://api-adresse.data.gouv.fr/search/', params=params)
            if len(response.json()['features']) > 0:
                feature = response.json()['features'][0]
                
                ##ajout des données intéressantes
                feature["properties"]["charte de l'arbre"] = line["Est elle signataire de la charte de l'arbre ?"]
                feature["properties"]["Nom de l'acteur"] = line["Nom de l'acteur"]
                feature["properties"]["domaines"] = []
                for domaine in domaines:
                    if len(str(line[domaine])) > 0:
                        feature["properties"]["domaines"].append(domaine)
                feature["properties"]["couleur"] = couleur
                mongeo["features"].append(feature)
        except:
            pass
    
    with open('geojson/geo_perline.json', 'w') as fp:
        json.dump(mongeo, fp)