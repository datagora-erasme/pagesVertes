# -*- coding: utf-8 -*-
"""
Created on Thu Jun  2 14:50:59 2022

@author: pierr
"""

import csv
import json
import gspread
import requests

def maj_csv():    
    """Récupération des données de l'API GGdrive"""
    sa = gspread.service_account(filename = "service_account.json")
    sh = sa.open("Outils sélection des acteurs de la végétalisation")
    wks = sh.worksheet("Liste d'acteurs")       #rendre la ligne dynamique (done?)
    
    filename = "acteurs.csv"
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f, delimiter=',')
        writer.writerows(wks.get())
        
    # acteurs.csv est le fichier csv récupéré de l'API
    
    """géocodage"""
    
    files = [
        ('data', open('acteurs.csv', 'rb')),
        ('columns', (None, "Nom de l'acteur")),
        ('columns', (None, 'Adresse')),
    ]
    
    response = requests.post('https://api-adresse.data.gouv.fr/search/csv/', files=files)
    with open("geocoded.csv","wb") as f:
        for line in response.iter_lines():            
            f.write(line+'\n'.encode('utf-8'))

def create_mongeo():
    '''
    Construction de la structure de données geoJSON
    '''
    
    try :
        with open("geocoded.csv", mode='r', encoding='utf-8') as csv_file:
            pass
    except:
        maj_csv()
    
    global_geo = dict(type="FeatureCollection")
    global_geo["features"] = []
    
    with open("geocoded.csv", mode='r', encoding='utf-8') as csv_file:
        csv_reader = csv.DictReader(csv_file)
        domaines = [
            "Animation de réseau",
            "Sensibilisation grand public",
            "Formation de professionnels",
            "Conception - paysagisme",
            "Plantation et entretien",
            "Pépinière",
            "Expertise naturaliste"]

        for row in csv_reader:
            
            if len(row["latitude"]) > 0:
                feature = dict(type="Feature")
                feature["properties"] = {
                    "Nom de l'acteur" : row["Nom de l'acteur"],
                    "charte de l'arbre" : row["Est elle signataire de la charte de l'arbre ?"],
                    "domaines" : []
                    }
                feature["geometry"] = dict(type="Point")
                feature["geometry"]["coordinates"] = [float(row["longitude"]), float(row["latitude"])]

                # récupération de l'action portée par l'acteur
                for domaine in domaines :
                    if len(row[domaine]) > 0:
                        feature["properties"]["domaines"].append(domaine)
                global_geo["features"].append(feature)
    
    with open('geojson/mongeo.json', 'w') as fp:
        json.dump(global_geo, fp)