# Import the dependencies.
import numpy as np

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func
import pandas as pd

import datetime as dt
import json

from flask import Flask, jsonify, render_template
from flask import Response

from sqlalchemy import MetaData


#################################################
# Database Setup
#################################################
csv_file_path = 'master_two.csv'
sqlite_file_path = 'sqlite:///Created SQLite/master_two.sqlite'

e = create_engine(sqlite_file_path)

df_four = pd.read_csv(csv_file_path)
table_name = csv_file_path.split('/')[-1].replace('.csv', '')

df_four.to_sql(table_name, e, if_exists='replace', index=False)


# reflect an existing database into a new model
Base = automap_base()
Base.prepare(e, reflect=True)
# reflect the tables
# Base.prepare(autoload_with=e)

# Save references to each table

#master_table = Base.classes.master_two
master_table = Base.metadata.tables['master_two']


# Create our session (link) from Python to the DB
session = Session(e)

#################################################
# Flask Setup
#################################################


from flask_cors import CORS

app = Flask(__name__)
CORS(app)


#################################################
# Flask Routes
#################################################

@app.route("/")
def welcome():
    """List all available api routes."""
    return (
        f"Available Routes:<br/>"
        f"/api/v1.0/radar<br/>"
        f"/api/v1.0/totaldeaths<br/>"
    )

@app.route("/api/v1.0/radar")
def radar():
    with Session(e) as session: 
        nominal_results = session.query(
            master_table.c.State, master_table.c.Year, master_table.c['Heart disease'], master_table.c.Cancer, 
            master_table.c.Stroke, master_table.c.CLRD, master_table.c['Unintentional injuries'], 
            master_table.c["Alzheimer's disease"], master_table.c['Diabetes_x'], 
            master_table.c['Influenza and pneumonia'], master_table.c['Kidney disease'], 
            master_table.c['Suicide']
        ).all()
       
        
        nominal_list = []
        for a,b,c,d,ee,f,g,h,i,j,k,l in nominal_results:
            nominal_dict = {
                "State": a,
                "Year": b,
                "Heart disease": c,
                "Cancer": d,
                "Stroke": ee,
                "CLRD": f,
                "Unintentional injuries": g,
                "Alzheimer's disease": h,
                "Diabetes": i,
                "Influenza and pneumonia": j,
                "Kidney disease": k,
                "Suicide": l
            }
            nominal_list.append(nominal_dict)
        
        #return jsonify(nominal_list)
            
        AA_results = session.query(
            master_table.c.State, master_table.c.Year, master_table.c['Heart disease-AA'], master_table.c['Cancer-AA'], 
            master_table.c['Stroke-AA'], master_table.c['CLRD-AA'], master_table.c['Unintentional injuries-AA'], 
            master_table.c["Alzheimer's disease-AA"], master_table.c['Diabetes_y'], 
            master_table.c['Influenza and pneumonia-AA'], master_table.c['Kidney disease-AA'], 
            master_table.c['Suicide-AA']
        ).all()
        
        AA_list = []
        for a,b,c,d,ee,f,g,h,i,j,k,l in AA_results:
            AA_dict = {
                "State": a,
                "Year": b,
                "Heart_disease_AA": c,
                "Cancer_AA": d,
                "Stroke_AA": ee,
                "CLRD_AA": f,
                "Unintentional_injuries_AA": g,
                "Alzheimer's disease_AA": h,
                "Diabetes_AA": i,
                "Influenza and pneumonia_AA": j,
                "Kidney disease_AA": k,
                "Suicide_AA": l
            }
            AA_list.append(AA_dict)
        
        return jsonify({
        "Nominal": nominal_list,
        "Age Adjusted": AA_list
    })
    #     return render_template('Project_5_index.html', my_data = {
    #     "nominal": nominal_list,
    #     "AA": AA_list
    # })


@app.route("/api/v1.0/totaldeaths")
def states():
    with Session(e) as session:
        total_Nominal_Results = session.query(
            master_table.c.State, master_table.c.Year, master_table.c['Total'] 
        ).all()

        total_Nominal_List = []

        for a,b,c in total_Nominal_Results:
            total_Nominal_Dict = {
                "State": a,
                "Year":b,
                "Total":c
            }
            total_Nominal_List.append(total_Nominal_Dict)

        total_AA_Results = session.query(
            master_table.c.State, master_table.c.Year, master_table.c["Total-AA"]
        ).all()

        

        total_AA_List = []

        for a,b,c in total_AA_Results:
            total_AA_Dict = {
                "State": a,
                "Year":b,
                "Total-AA":c
            }
            total_AA_List.append(total_AA_Dict)
        return jsonify({
        "nominal": total_Nominal_List,
        "AA": total_AA_List
    })



session.close()
    
if __name__ == '__main__':
    app.run(debug=True)