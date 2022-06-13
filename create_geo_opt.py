# -*- coding: utf-8 -*-
"""
Created on Tue Jun  7 16:35:36 2022

@author: pierr
"""

import gspread
import requests
import json

"""
Récupération des données de ggsheets
pour géocoder:
    -soit l'adresse est déjà indiquée dans le données
    -sinon:
        recherche d'une adresse grâce à l'API entreprises https://recherche-entreprises.api.gouv.fr/search
        si dans le 69:
            on garde l'adresse
        sinon:
            on cherche une adresse proche du 69 grâce à l'API https://api-adresse.data.gouv.fr/search/
"""



def get_adresse_entreprise(nom):
    pass
   

def get_adresse_gouv(nom='', adresse=''):
    '''get_adresse_gouv renvoie une feature à inclure directement dans le geoJSON'''
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
            return feature
    except:
        pass