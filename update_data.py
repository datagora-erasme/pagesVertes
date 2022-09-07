"""
update_data.py is a script that contains the get_data method
This method is used to create the data (geoJSON) file used by
the web application, this method updates the data
"""

import json
import requests
import gspread
import pandas as pd
import numpy as np

def df_to_geojson(dataframe, address='Adresse'):
    """
    This method creates a Python dict formatted to be geoJSON
    from a pandas DataFrame
    :param df: pandas DataFrame you want to convert
    :param address: address column name in order to geolocate your lines
    :return: Python dict formatted as geoJSON
    """

    # create the Python dict, geoJSON format
    geo_json = dict(type="FeatureCollection")
    geo_json["features"] = []

    #create a geolocated feature for each line of the DataFrame
    nb_rows = dataframe.shape[0]
    for index, line in dataframe.iterrows():
        line = line.astype('string')
        params = {
            'q': line[address],
            'limit': '1'
        }
        try:
            url = 'https://api-adresse.data.gouv.fr/search/'
            feature = requests.get(url, params=params).json()['features'][0]
            feature['properties'] = {}
            for col in dataframe.columns:
                if len(line[col]) > 0:
                    feature['properties'][col] = line[col]
            geo_json["features"].append(feature)
        except:
            print("Request failure : ", params)
        print("Geolocation process : ", int(index / nb_rows * 100), '%')
    print("Geolocation processed : 100%")
    return geo_json

def process_data():
    """
    process_data is a function that:
        -GET data from GGsheets
        -Creates a DataFrame file containing the needed data
    :return:
    pandas DataFrame
    """

    service_account = gspread.service_account(filename="service_account.json")
    sheets = service_account.open("Pages Vertes sheet")
    worksheet = sheets.worksheet("Selection_Liste d'acteurs")
    wks_dict = worksheet.get_all_records()

    # treat input data
    data_df = pd.DataFrame(wks_dict, dtype='string')
    data_df.replace('', np.nan, inplace=True)
    data_df = data_df[data_df["A afficher"].notna()]
    data_df = data_df[data_df["Adresse"].notna()]
    data_df.replace(np.nan, '', inplace=True)
    return data_df

def main():
    """
    Main execution program
    :return: None
    """

    # Process the data
    data_frame = process_data()
    #create the geoJSON
    geo_json = df_to_geojson(data_frame)
    #save the geoJSON
    with open('data/geojson/data.json', 'w', encoding='utf-8') as file:
        json.dump(geo_json, file)

if __name__ == '__main__':
    main()
