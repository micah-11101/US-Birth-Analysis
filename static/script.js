// Fetch data from the API
d3.json('http://127.0.0.1:5000/api/us_births_data_2016_2021_ALL')
  .then(data => {
    // Print out the data
    console.log('Fetched data:', data);
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });
