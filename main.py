"""
main.py is the main function that launches a server on a specified port
It is used as well to launch the web application, to link the client and data
but also to launch an update_data method
"""

import os
import json
import codecs
from flask import Flask, request, render_template
from dotenv import load_dotenv
import update_data

def plot_data(data_path):
    """
    plot_data is a function that:
        -Reads the HTML template (index.html)
        -Reads the geoJSON data in memory, Link it to the client with a script
        -Links the scripts with the HTML
    :return:
    HTML as a string in order to be read by Flask
    """

    with open(data_path, 'r', encoding='utf-8') as file:
        # load geoJSON in RAM
        geo_json = json.load(file)

    # load the HTML template
    with codecs.open("templates/index2.html", 'r', encoding='utf-8') as file:
        html = file.read()

    # write the JavaScript into the html to link the data to client
    script = "<script>"
    script += f"const data = {str(geo_json)};"
    script += "</script>"

    # Insert the scripts into the HTML
    html += script

    return html

app = Flask(__name__)
@app.route('/', methods=['GET', 'POST'])
def index():
    """ Function that sends HTML data to Flask """
    return plot_data('data/geojson/data.json')

@app.route('/update_data', methods=['GET', 'POST'])
def update():
    """ Function that launches the method to update the data """
    # loading the password in memory
    load_dotenv(".env")
    password = os.environ.get("PASSWORD")
    if request.method == "POST":
        input_pw = request.form["pw"]
        if input_pw == password:
            update_data.main()
            return render_template("success.html")
        return "<h1>Mauvais mot de passe</h1>"
    return render_template("login.html")

if __name__ == '__main__':

    PORT = 8000
    app.run(host='0.0.0.0', debug=True, port=PORT, use_reloader=False)
