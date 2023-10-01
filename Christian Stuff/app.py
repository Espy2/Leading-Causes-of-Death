# Import the dependencies.
import numpy as np

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func
import pandas as pd

import datetime as dt

from flask import Flask, jsonify

from sqlalchemy import MetaData

# MUST CHANGE FILE PATHING. THIS IS ALL RELATIVE.
#################################################
# Database Setup
#################################################
csv_file_path = 'New CSV/master_two.csv'
sqlite_file_path = 'sqlite:///New SQLite/master_two.sqlite'

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

app = Flask(__name__)


#################################################
# Flask Routes
#################################################

@app.route("/")
def welcome():
    """List all available api routes."""
    return (
        f"Available Routes:<br/>"
        f"/api/v1.0/Master<br/>"
    )

@app.route("/api/v1.0/Master")
def Master():
    with Session(e) as session: 
        results = session.query(master_table).all()
        data = []
        for result in results:
          data.append({"Heart disease %-AA": getattr(result, "Heart disease %-AA")})
    
        return jsonify(data)




session.close()
    
if __name__ == '__main__':
    app.run(debug=True)