# -*- coding: utf-8 -*-
"""
Created on Tue Jun  7 11:00:10 2022

@author: pierr
"""

import gspread
import requests
import json

if __name__ == '__main__':
    sa = gspread.service_account(filename = "service_account.json")
    sh = sa.open("Copie de Outils sélection des acteurs de la végétalisation")
    wks = sh.worksheet("Selection_Liste d'acteurs")       #rendre la ligne dynamique (done?)
    
    d = wks.get_all_records()
    
    for line in d:
        nom = line["Nom de l'acteur"]
        adresse = line["Adresse"]
        if line["est en rouge"]:
            couleur = 'rouge'
        elif line["est en orange"]:
            couleur = "orange"
        else :
            couleur = "OK"
        
        if len(nom) > 0:
            print("Nom : ", nom)
            print('Adresse : ', adresse)
            print("Couleur : ", couleur)