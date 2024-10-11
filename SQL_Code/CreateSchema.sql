-- Create State Division Regions Table
CREATE TABLE state_division_regions (
    id SERIAL PRIMARY KEY,
    state_name VARCHAR(30) NOT NULL,
    state_code CHAR(2) NOT NULL UNIQUE,
    division VARCHAR(30),
    region VARCHAR(30)
);

-- Create Birth Data Table
CREATE TABLE birth_data (
    id SERIAL PRIMARY KEY,
    state_code CHAR(2) NOT NULL,
    year INT NOT NULL,
    gender CHAR(1) CHECK (gender IN ('M', 'F')),
    education_level_mother VARCHAR(100),
    education_level_code INT,
    number_of_births INT,
    average_age_of_mother DECIMAL(4,1),
    average_birth_weight DECIMAL(6,1),

    -- Foreign Key Constraint
    CONSTRAINT fk_state_code
        FOREIGN KEY (state_code) 
        REFERENCES state_division_regions(state_code)
);


