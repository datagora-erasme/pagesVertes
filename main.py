"""
main.py is the main function that launches a server on a specified port
It is used as well to launch the web application, to link the client and data
but also to launch an update_data method
"""

import json
import codecs
from flask import Flask
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
    with codecs.open("templates/index.html", 'r', encoding='utf-8') as file:
        html = file.read()

    # write the JavaScript into the html to link the data to client
    script = "<script>"
    script += f"var data = {str(geo_json)};"
    script += "</script>"

    # Insert the scripts into the HTML
    html += script
    html += '<script src="static/JS/index.js" defer></script> \n'
    html += '<script src="static/JS/front.js" defer>/<script>'

    return html

app = Flask(__name__)
@app.route('/', methods=['GET', 'POST'])
def index():
    """ Function that sends HTML data to Flask """
    return plot_data('data/geojson/data.json')

@app.route('/update_data', methods=['GET', 'POST'])
def update():
    """ Function that launches the method to update the data """
    update_data.main()
    return "Data Updated"


if __name__ == '__main__':
    PORT = 8000
    app.run(debug=True, port=PORT, use_reloader=False)
