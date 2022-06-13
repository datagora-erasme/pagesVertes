"""
todo :
-ne récupérer que les données qui m'intéressent (nom, lat, long) du geojson (done)
-faire de l'asynchrone en Python pour la rapidité de la requête
-expression régulière (done)
-ajouter le display des infos avec le MarkerOnClick
-ne prendre que les données qui sont à proximité de Lyon (avec un truc plus restreint que ce que propose l'API)
-plutôt faire un gros FeatureCollection en geoJSON qu'une liste de geoJSON
'''
Faire plutôt la requête avec Requests
faire plutôt appel à l'API avec un CSV
'''

"""

import gspread
import pycurl
import sys
PY3 = sys.version_info[0] > 2
import urllib.parse
from flask  import Flask
import codecs
import re 
import ast

"""Récupération des données de l'API GGdrive"""
sa = gspread.service_account(filename = "service_account.json")
sh = sa.open("Outils sélection des acteurs de la végétalisation")
wks = sh.worksheet("Liste d'acteurs")       #rendre la ligne dynamique (done?)
data = wks.get()
headers = data[0]
i_ad = headers.index('Adresse')
i_nom = headers.index("Nom de l'acteur")
adresses = [data[i][i_ad] for i in range(len(data))]    #liste des adresses d'acteurs
noms = [data[i][i_nom] for i in range(len(data))]       #liste dénomination des acteurs
    
class Test:
    def __init__(self):
        self.contents = ''
        if PY3:
            self.contents = self.contents.encode('ascii')

    def body_callback(self, buf):
        self.contents = self.contents + buf

# geojson_values = []
# for i in range(len(adresses)):
#     query = urllib.parse.quote_plus(noms[i])
#     query += urllib.parse.quote_plus(adresses[i])            #ecriture de la requête à mettre dans l'URL pour l'API de data.gouv pour récupérer les coord à partir d'une adresse
#     if len(query) > 0:
#         t = Test()
#         c = pycurl.Curl()
#         url = "https://api-adresse.data.gouv.fr/search/?q=" + query + "&limit=1" 
#         url = url + "&lat=45.8&lon=4.8"     #permet de récupérer les adresses les plus proches de Lyon, fonctionne pas de ouf
#         c.setopt(c.URL, url)
#         c.setopt(c.WRITEFUNCTION, t.body_callback)
#         c.perform()
#         c.close()
#         my_geojson = t.contents.decode('utf8').replace("'", '"')
#         my_geojson += "name2disp : " + noms[i] + "endname2disp"
#         #my_geojson est au format geojson directement interprétable
#         geojson_values.append(my_geojson)       #geojson_values est une liste des geoJSON renvoyés par l'API data.gouv pour chaque adresse non nulle
#     break

import requests

geojson_values = []
for i in range(len(adresses)):
    query = noms[i] + ' ' + adresses[i]
    if len(query) > 0:
        # query += 
        params = {'q': query}
        response = requests.get('https://api-adresse.data.gouv.fr/search/', params=params)
        geojson_values.append(response.json())


"""Construction de la donnée (on ne prend du geoJSON renvoyé par l'API que ce qui nous intéresse)"""

datas = []

for geo in geojson_values:
    d = dict(type='FeatureCollection')
    d['features'] = []
    d['features'].append(dict(type='Feature'))
    d['features'][0]["geometry"] = dict(type="Point")
    
    n = re.search(r"name2disp : (.+?)endname2disp", geo)
    if n:
        name2disp = n.group(1)
        name2disp = name2disp.replace('"','')
        name2disp = name2disp.replace("'","")
        name2disp = name2disp.replace(","," ")
    d['features'][0]["properties"] = {"Nom" : f"{name2disp}"}
    
    m = re.search('coordinates\": (.+?)}, \"properties', geo)
    if m:
        found = m.group(1)
        coord = ast.literal_eval(found)
    d['features'][0]["geometry"]['coordinates'] = coord
    js = str(d)
    js = js.replace("'",'"')
    datas.append(js)
    # datas est une liste contenant les geojson (sous format string) à afficher directement

"""Intégration des données sur la carto en ajoutant un script dans le HTML"""
file = codecs.open("templates/index.html",'r')
html = file.read()
script = "<script>"
for js in datas:
    script = script + f"var data = {js}; L.geoJSON(data).addTo(map);"
script = script + "</script>"
html = html + script


"""côté serveur"""
app = Flask(__name__)
@app.route('/', methods=['GET', 'POST'])
def index():

    return html

@app.route('/update')
def update():
    pass

if __name__ == '__main__':
    PORT = 8075
    print("port : ")
    print("localhost:" + str(PORT) + "\n")
    app.run(debug=True,port=PORT,use_reloader=False)
    
    
