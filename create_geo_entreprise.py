# -*- coding: utf-8 -*-
"""
Permet de récupérer le geoJSON des acteurs en requêtant l'API entreprises.gouv avec le nom de l'acteur
"""

import requests
import json

"""API  recherche de'entreprise"""

import gspread

headers = {
    'accept': 'application/json',
}

params = {
    'q': 'SCI GASSIE',
    'page': '1',
    'per_page': '1',
}

response = requests.get('https://recherche-entreprises.api.gouv.fr/search', params=params, headers=headers)

## formatage de l'adresse

siege = response.json()['results'][0]['siege']
adresse = [
    siege['numero_voie'],
    siege['type_voie'],
    siege['libelle_voie'],
    siege['code_postal'],
    siege['libelle_commune']
    ]
str_adresse = ' '.join(adresse)
coords = [
    float(siege['longitude']),
    float(siege['latitude'])
    ]

def create_geo_entreprise():
    
    n_recherche = 0
    n_pas_coord_reponse = 0
    n_OK = 0
    n_recherche_reussi = 0
    
    """Construction du geoJSON"""
    """Récupération des données de l'API GGdrive"""
    sa = gspread.service_account(filename = "service_account.json")
    sh = sa.open("Outils sélection des acteurs de la végétalisation")
    wks = sh.worksheet("Liste d'acteurs")       #rendre la ligne dynamique (done?)
    
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
        
        if len(adresse) == 0 and len(nom) > 0:
            n_recherche += 1
            """Requête API entreprise pour avoir les coords"""
            headers = {
                'accept': 'application/json',
            }
    
            params = {
                'q': nom,
                'page': '1',
                'per_page': '1',
            }
    
            response = requests.get('https://recherche-entreprises.api.gouv.fr/search', params=params, headers=headers)
            print("Réponse : ",response)
            ## formatage de l'adresse
            print("\n", response.json(), '\n')
            results = response.json()['results']
            if len(results) > 0:
                n_recherche_reussi += 1
                siege = results[0]['siege']
                adresse = [
                    siege['numero_voie'],
                    siege['type_voie'],
                    siege['libelle_voie'],
                    siege['code_postal'],
                    siege['libelle_commune']
                    ]
                str_adresse = ' '.join(filter(None,adresse))
                if siege['longitude'] != None:
                    coords = [
                        float(siege['longitude']),
                        float(siege['latitude'])
                        ]
                    print("\n coordonnées", coords)
                    
                    feature = dict(type='Feature')
                    feature['properties'] = {
                        "Nom de l'acteur" : line["Nom de l'acteur"],
                        "charte de l'arbre" : line["Est elle signataire de la charte de l'arbre ?"],
                        "domaines" : []
                        }
                    print('\n 1')
                    feature["geometry"] = dict(type="Point")
                    feature["geometry"]["coordinates"] = coords
                    print('\n 2')
                    # récupération de l'action portée par l'acteur
                    for domaine in domaines :
                        print(domaine)
                        print(line[domaine])
                        if len(str(line[domaine])) > 0:
                            feature["properties"]["domaines"].append(domaine)
                    print('\n 3')
                    feature["properties"]["couleur"] = couleur
                    mongeo["features"].append(feature)
                    n_OK += 1
                    
                    print("OK")
                    print(feature["geometry"]["coordinates"])
                else:
                    """Géocodage de l'adresse?"""
                    n_pas_coord_reponse += 1
            
    
            
        elif len(nom) > 0:
            """Appel à l'API de geocodage de truc ?
            ou alors appel à l'API entreprise pour tout le monde"""
            
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
                    mongeo["features"].append(feature)
            except:
                pass
    with open('geojson/geo_entr.json', 'w') as fp:
        json.dump(mongeo, fp)
    
    print("\n nrb réussi tout", n_OK)
    print("\n nbr recherche", n_recherche)
    print ("\n nbr recherche réussie", n_recherche_reussi)
    print("\n recherche réussie mais pas de coords", n_pas_coord_reponse)

"""Affichage de la réponse"""

print("Réponse : ", response)
print("\n Contenu : \n", response.json())
print('\n adresse : \n ', str_adresse)
print('\n coords : \n ', coords)