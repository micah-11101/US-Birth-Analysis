// Fetch data from the API
fetch('http://127.0.0.1:5000/api/us_births_data_2016_2021_ALL', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  // Remove the 'mode: 'cors'' option
})
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    // Print out the data
    console.log('Fetched data:', data);
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });


