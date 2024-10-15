import psycopg2
from psycopg2 import sql

# Database connection parameters
db_params = {
    'dbname': 'Project3_US_Births',
    'user': 'postgres',
    'password': 'postgres',
    'host': 'localhost',
    'port': '5432'
}

def get_births_data():
    try:
        # Establish a connection to the database
        conn = psycopg2.connect(**db_params)
        
        # Create a cursor object
        cur = conn.cursor()
        
        # Execute a SQL query
        query = sql.SQL("SELECT * FROM us_births_data_2016_2021")  # Replace 'your_table_name' with the actual table name
        cur.execute(query)
        
        # Fetch all rows from the result
        rows = cur.fetchall()

        # Print 5 rows from the result for TESTING
        for i, row in enumerate(rows[:5], 1):
            print(f"Row {i}: {row}")
        
        # Close the cursor and connection
        cur.close()
        conn.close()
        
        return rows
    except (Exception, psycopg2.Error) as error:
        print("Error while connecting to PostgreSQL", error)
        return None

from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
@app.route('/api/us_births_data_2016_2021_ALL')
def get_births_api():
    # This function creates an API endpoint for birth data
    
    # Retrieve data from the database using the get_births_data() function
    data = get_births_data()
    
    if data:
        # If data is successfully retrieved, process it for JSON serialization
        print("Data successfully retrieved from the database.")
        formatted_data = []
        
        # Iterate through each row of the retrieved data
        for row in data:
            # Create a dictionary for each row, mapping column names to values
            # This step transforms the raw database output into a structured format
            formatted_row = {
                'state': row[0],          
                'state_abbreviation': row[1],       
                'year': row[2],    
                'gender': row[3],      
                'education_level_mother': row[4],      
                'education_level_code': row[5],   
                'number_of_births': row[6], 
                'avg_age_of_mother': row[7],
                'avg_birth_weight_g': row[8],
                'state_code': row[9],
                'division': row[10],
                'region': row[11]
            }
            
            # Add the formatted row to the list of all data
            formatted_data.append(formatted_row)
        
        # Print the jsonified data
        print(jsonify(formatted_data).get_data(as_text=True))
        
        # Return the formatted data as a JSON response
        # This allows the API to send the data in a web-friendly format
        return jsonify(formatted_data)
    else:
        # If no data is retrieved, print and return an error message
        error_message = 'Error: No data retrieved from the database'
        print(error_message)
        return jsonify({'error': error_message}), 500

if __name__ == '__main__':
    # Run the Flask application in debug mode when this script is executed directly
    app.run(debug=True)
