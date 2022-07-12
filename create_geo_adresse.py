# -*- coding: utf-8 -*-
"""
Programme qui récupère les données des acteurs et créée un geoJSON seulemnt sur les acteurs qui ont déjà une adresse renseignée
"""

import gspread
import requests
import json

def create_geo_adresse():
    
    """Construction du geoJSON"""
    """Récupération des données de l'API GGdrive"""
    sa = gspread.service_account(filename = "service_account.json")
    sh = sa.open("Pages Vertes sheet")
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
            couleur = 'rouge'
        elif line["est en orange"]:
            couleur = "orange"
        else :
            couleur = "OK"
        
        # formulation de la requête pour l'API adresse.data.gouv
        if len(adresse) > 0:
            query = adresse
            params = {
                'q': query,
                'limit': '1',
                'lat': '45.750000',
                'lon': '4.850000'
            }
            
            try:
                #response.json() est la réponse au format geoJSON contenant le géocodage de l'acteur
                response = requests.get('https://api-adresse.data.gouv.fr/search/', params=params)
                if len(response.json()['features']) > 0:
                    print(adresse)
                    feature = response.json()['features'][0]
                    
                    ##ajout des données intéressantes
                    feature["properties"]["charte de l'arbre"] = line["Est elle signataire de la charte de l'arbre ?"]
                    feature["properties"]["Nom de l'acteur"] = line["Nom de l'acteur"]
                    feature["properties"]["domaines"] = []
                    feature["properties"]["adresse"] = adresse
                    feature["properties"]["Type de structure"] = line["Type de structure"]
                    feature["properties"]["Site web"] = line["Site web"]
                    feature["properties"]["Téléphone"] = line["Téléphone"]
                    for domaine in domaines:
                        if len(str(line[domaine])) > 0:
                            feature["properties"]["domaines"].append(domaine)
                    feature["properties"]["couleur"] = couleur
                    if couleur == 'OK':
                        mongeo["features"].append(feature)
            except:
                pass
    
    with open('geojson/geo_adresse.json', 'w') as fp:
        json.dump(mongeo, fp)

if __name__ == '__main__':
    create_geo_adresse()