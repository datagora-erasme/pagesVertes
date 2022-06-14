# -*- coding: utf-8 -*-
"""
Created on Wed May 25 14:23:24 2022

@author: pierr
"""

import gspread
from flask import Flask
import csv
import requests
import codecs
import json

"""Import des fonctions permettant de créer / maj les données"""
from create_geo_per_file import create_geo_per_file, get_adresse
from create_mongeo import create_mongeo, maj_csv
from create_geo_adresse import create_geo_adresse
#from create_geo_entreprise import create_geo_entreprise

"""plot_geo permet d'envoyer les données geojson au client"""
def plot_geojson(geo_path):
    with open(geo_path, 'r') as f:
        mongeo = json.load(f)
        """Intégration des données sur la carto en ajoutant un script dans le HTML"""
        file = codecs.open("templates/index.html",'r')
        html = file.read()
        script = "<script>"
        script = script + f"var data = {str(mongeo)};"

        """
        #Ouverture du JSON des données de la métropole
        parcs = open("com_donnees_communales.comparcjardin_1_0_0.json")
        parcs_json = str(json.load(parcs))
        parcs_json = parcs_json.replace('None',"'None'")
        print(parcs_json)
        script += f"var parcsJson = {parcs_json}"
        """

        """domaines correspond aux différents domaines possibles des acteurs (pour les filtres)"""
        domaines = [
        "Animation de réseau",
        "Sensibilisation grand public",
        "Formation de professionnels",
        "Conception - paysagisme",
        "Plantation et entretien",
        "Pépinière",
        "Expertise naturaliste"
        ]
        script += f"const domaines = {domaines};"

        script = script + "</script>"
        html = html + script
        html += '<script src="static/JS/index.js"></script>'
        return html
    

"""côté serveur"""
app = Flask(__name__)
@app.route('/', methods=['GET', 'POST'])
def index():
    try:
        return plot_geojson('geojson/mongeo.json')
    except:
        """MAJ DATA appel à la fonction dans un autre fichier"""
        create_mongeo()
        return plot_geojson('geojson/mongeo.json')

@app.route('/perfile', methods=['GET', 'POST'])
def perfile():
    try:
        return plot_geojson('geojson/geo_perline.json')
    except:
        create_geo_per_file()
        return plot_geojson('geojson/geo_perline.json')

@app.route('/entreprise', methods=['GET', 'POST'])
def entreprise():
    try:
        return plot_geojson('geojson/geo_entr.json')
    except:
        create_geo_entreprise()
        return plot_geojson('geojson/geo_entr.json')

@app.route('/adresse', methods=['GET', 'POST'])
def adresse():
    try:
        return plot_geojson('geojson/geo_adresse.json')
    except:
        create_geo_adresse()
        return plot_geojson('geojson/geo_adresse.json')

@app.route('/update', methods=['GET', 'POST'])
def update():
    try:
        create_mongeo()
        create_geo_per_file()
        create_geo_entreprise()
        create_geo_adresse()
        return "Mise à jour des données réussie"
    except:
        return "ERREUR de MAJ"

if __name__ == '__main__':    
    PORT = 8085
    print("port : ")
    print("localhost:" + str(PORT) + "\n")
    app.run(debug=True,port=PORT,use_reloader=False)