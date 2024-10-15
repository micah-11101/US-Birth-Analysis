DROP TABLE IF EXISTS us_births_data_2016_2021;

-- Create the table
CREATE TABLE us_births_data_2016_2021 (
    state VARCHAR(50) NOT NULL,
    state_abbreviation VARCHAR(2) NOT NULL,
    year INT NOT NULL,
    gender VARCHAR(1) CHECK (gender IN ('M', 'F')) NOT NULL,
    education_level_mother VARCHAR(100) NOT NULL,
    education_level_code INT NOT NULL,
    number_of_births INT NOT NULL,
    avg_age_of_mother FLOAT NOT NULL,
    avg_birth_weight_g FLOAT NOT NULL,
    state_code VARCHAR(2) NOT NULL,
    division VARCHAR(50) NOT NULL,
    region VARCHAR(50) NOT NULL
);

-- Show the table
SELECT * FROM us_births_data_2016_2021;