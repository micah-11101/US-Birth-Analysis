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

-- This query aggregates birth data by region, division, and state
-- It calculates the total number of births and average maternal age and birth weight
-- Results are rounded to two decimal places for readability
SELECT
    region,
    division,
    state,
    SUM(number_of_births) AS sum_of_number_of_births,
    CAST(AVG(avg_age_of_mother) AS DECIMAL(10,2)) AS avg_of_avg_age_of_mother,
    CAST(AVG(avg_birth_weight_g) AS DECIMAL(10,2)) AS avg_of_avg_birth_weight_g
FROM us_births_data_2016_2021
GROUP BY region, division, state
ORDER BY region, division, state;

-- This query retrieves annual birth statistics for each state from 2016 to 2021
-- It calculates total births, average mother's age, and average birth weight
-- Results are grouped by state and year, then ordered for easy analysis
SELECT
    state,
    year,
    SUM(number_of_births) AS total_births,
    CAST(AVG(avg_age_of_mother) AS DECIMAL(10,2)) AS avg_of_avg_age_of_mother,
    CAST(AVG(avg_birth_weight_g) AS DECIMAL(10,2)) AS avg_of_avg_birth_weight_g
FROM us_births_data_2016_2021
GROUP BY state, year
ORDER BY state, year;