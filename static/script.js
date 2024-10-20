// Initialize the map centered on the United States
const map = L.map('map').setView([37.8, -96], 4);
console.log('Map initialized with center coordinates [37.8, -96] and zoom level 4');

// Add the OpenStreetMap tile layer to the map for geographical context
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
console.log('OpenStreetMap tile layer added to the map');

// Declare global variables to be used throughout the script for data management and visualization
let geojsonLayer, data, regions, divisions, states, stateYearData;

// Style the map container for better visual presentation
const mapContainer = document.getElementById('map');
mapContainer.style.height = '500px';
mapContainer.style.border = '2px solid #ccc';
mapContainer.style.borderRadius = '8px';
mapContainer.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
mapContainer.style.marginBottom = '20px'; // Add margin below the map for spacing

// Fetch data from multiple API endpoints using Promise.all for concurrent requests
console.log('Initiating data fetch from multiple API endpoints...');
Promise.all([
    d3.json('http://127.0.0.1:5000/api/region_division_state_data'),
    d3.json('https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json'),
    d3.json('http://127.0.0.1:5000/api/state_year_data')
])
.then(([fetchedData, geojson, fetchedStateYearData]) => {
    console.log('Data fetched successfully. Processing and initializing visualization components...');
    console.log('Region, division, and state data:', fetchedData);
    console.log('US states GeoJSON data:', geojson);
    console.log('State-specific yearly data:', fetchedStateYearData);
    data = fetchedData;
    stateYearData = fetchedStateYearData;

    // Validate the fetched data to ensure it's not empty or malformed
    if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Fetched data is empty or not in the expected array format');
    }

    // Extract unique regions, divisions, and states from the data for filtering options
    regions = [...new Set(data.map(d => d.region))];
    divisions = [...new Set(data.map(d => d.division))];
    states = [...new Set(data.map(d => d.state))];

    console.log('Creating filter dropdowns for user interaction...');
    createFilterDropdowns();

    // Create a container for the info card to display state-specific information
    const infoCardContainer = document.createElement('div');
    infoCardContainer.id = 'info-card-container';
    infoCardContainer.style.textAlign = 'center';
    infoCardContainer.style.marginBottom = '18px';
    document.body.insertBefore(infoCardContainer, document.getElementById('map'));

    console.log('Initializing choropleth map with GeoJSON data...');
    createChoroplethMap(geojson);
    console.log('Updating map with initial data...');
    updateMap();

    // Invalidate the map size to ensure proper rendering after dynamic content addition
    map.invalidateSize();
})
.catch(error => {
    console.error('Error encountered during data loading or processing:', error);
    alert('An error occurred while loading data. Please check the console for detailed information.');
});

// Function to create filter dropdowns for region, division, and state selection
function createFilterDropdowns() {
    const filterContainer = d3.select('body').insert('div', '#map')
        .attr('id', 'filter-container')
        .style('margin-bottom', '23px')
        .style('font-size', '7px')
        .style('display', 'flex')
        .style('align-items', 'center')
        .style('justify-content', 'space-between')
        .style('padding', '10px')
        .style('background-color', '#f0f0f0')
        .style('border-radius', '8px')
        .style('box-shadow', '0 2px 4px rgba(0, 0, 0, 0.1)');

    // Create individual dropdowns for region, division, and state filters
    createDropdown('region', regions, filterContainer);
    createDropdown('division', divisions, filterContainer);
    createDropdown('state', states, filterContainer);

    // Create a reset button to return the map to its initial view
    filterContainer.append('button')
        .attr('id', 'reset-view')
        .text('Reset Map View')
        .style('padding', '8px 16px')
        .style('font-size', '16px')
        .style('background-color', '#ADD8E6')
        .style('border', 'none')
        .style('border-radius', '4px')
        .style('cursor', 'pointer')
        .style('box-shadow', '0 2px 4px rgba(0, 0, 0, 0.1)')
        .style('transition', 'all 0.3s ease')
        .on('mouseover', function() {
            d3.select(this).style('background-color', '#FFFF00');
        })
        .on('mouseout', function() {
            d3.select(this).style('background-color', '#ADD8E6');
        })
        .on('click', function() {
            d3.select(this).style('background-color', '#87CEEB');
            resetMapView();
        });

    // Apply consistent styling to all dropdown menus
    d3.selectAll('#filter-container select')
        .style('padding', '8px')
        .style('font-size', '16px')
        .style('border', '1px solid #ccc')
        .style('border-radius', '4px')
        .style('background-color', 'white')
        .style('box-shadow', '0 2px 4px rgba(0, 0, 0, 0.1)')
        .style('margin-right', '10px')
        .style('cursor', 'pointer');
}

// Function to reset the map view to its initial state (United States overview)
function resetMapView() {
    map.setView([37.8, -96], 4);
}

// Function to create individual dropdown menus with options and event listeners
function createDropdown(id, options, container) {
    const select = container.append('select')
        .attr('id', id)
        .on('change', function() {
            updateMap();
            if (id === 'state') {
                const selectedState = this.value;
                if (selectedState !== '') {
                    showInfoCard(selectedState);
                    showStateCharts(selectedState);
                } else {
                    d3.select('#info-card').style('display', 'none');
                    d3.select('#charts-container').style('display', 'none');
                }
            }
        });

    select.append('option').text(`All ${id}s`).attr('value', '');
    select.selectAll('option.item')
        .data(options)
        .enter()
        .append('option')
        .attr('value', d => d)
        .text(d => d);
}

// Function to create the choropleth map using GeoJSON data and Leaflet
function createChoroplethMap(geojson) {
    console.log('Creating choropleth map with GeoJSON data:', geojson);
    const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
        .domain([0, d3.max(data, d => d.total_births)]);

    geojsonLayer = L.geoJSON(geojson, {
        style: feature => {
            console.log('Applying style to feature:', feature.properties.name);
            return {
                fillColor: getStateColor(feature.properties.name),
                weight: 2,
                opacity: 1,
                color: 'white',
                fillOpacity: 0.7
            };
        },
        onEachFeature: (feature, layer) => {
            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
                click: (e) => {
                    zoomToFeature(e);
                    showInfoCard(feature.properties.name);
                    showStateCharts(feature.properties.name);
                }
            });
        }
    }).addTo(map);

    // Helper function to determine the color for each state based on total births
    function getStateColor(stateName) {
        const stateData = data.find(d => d.state === stateName);
        console.log('Determining color for state:', stateName, 'Data:', stateData);
        return stateData ? colorScale(stateData.total_births) : '#ccc';
    }
}

// Function to update the map based on selected filters (region, division, state)
function updateMap() {
    const selectedRegion = d3.select('#region').property('value');
    const selectedDivision = d3.select('#division').property('value');
    const selectedState = d3.select('#state').property('value');

    const filteredData = data.filter(d => 
        (selectedRegion === '' || d.region === selectedRegion) &&
        (selectedDivision === '' || d.division === selectedDivision) &&
        (selectedState === '' || d.state === selectedState)
    );

    updateChoropleth(filteredData, selectedRegion, selectedDivision);

    // Show info card and charts for selected state, hide otherwise
    if (selectedState !== '') {
        showInfoCard(selectedState);
        showStateCharts(selectedState);
    } else {
        d3.select('#info-card').style('display', 'none');
        d3.select('#charts-container').style('display', 'none');
    }
}

// Function to update the choropleth map colors based on filtered data
function updateChoropleth(filteredData, selectedRegion, selectedDivision) {
    const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
        .domain([0, d3.max(filteredData, d => d.total_births)]);

    geojsonLayer.eachLayer(layer => {
        const stateName = layer.feature.properties.name;
        const stateData = filteredData.find(d => d.state === stateName);
        const isInSelectedRegionOrDivision = stateData && 
            (selectedRegion === '' || stateData.region === selectedRegion) &&
            (selectedDivision === '' || stateData.division === selectedDivision);

        layer.setStyle({
            fillColor: isInSelectedRegionOrDivision ? colorScale(stateData.total_births) : '#ccc',
            fillOpacity: isInSelectedRegionOrDivision ? 0.7 : 0.3
        });
    });
}

// Function to highlight a feature (state) on mouseover
function highlightFeature(e) {
    const layer = e.target;
    const selectedRegion = d3.select('#region').property('value');
    const selectedDivision = d3.select('#division').property('value');
    const stateName = layer.feature.properties.name;
    const stateData = data.find(d => d.state === stateName);

    if (stateData &&
        (selectedRegion === '' || stateData.region === selectedRegion) &&
        (selectedDivision === '' || stateData.division === selectedDivision)) {
        layer.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7
        });
        layer.bringToFront();
    }
}

// Function to reset highlight on mouseout, returning the state to its original style
function resetHighlight(e) {
    geojsonLayer.resetStyle(e.target);
}

// Function to zoom to a feature (state) on click
function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

// Function to show an information card for a selected state
function showInfoCard(stateName) {
    console.log('Displaying information card for state:', stateName);
    const stateData = data.find(d => d.state === stateName);
    if (stateData) {
        const infoCard = d3.select('#info-card-container').selectAll('#info-card').data([0]);
        const infoCardEnter = infoCard.enter().append('div').attr('id', 'info-card');
        const infoCardUpdate = infoCard.merge(infoCardEnter);

        infoCardUpdate.html(`
            <h3>${stateName}</h3>
            <div style="display: flex; justify-content: space-around;">
                <p><strong>Total Births:</strong> ${stateData.total_births.toLocaleString()}</p>
                <p><strong>Avg Mother Age:</strong> ${parseFloat(stateData.avg_age_of_mother).toFixed(2)}</p>
                <p><strong>Avg Birth Weight:</strong> ${parseFloat(stateData.avg_birth_weight_g).toFixed(2)}g</p>
            </div>
        `);

        infoCardUpdate
            .style('display', 'block')
            .style('background-color', 'white')
            .style('padding', '15px')
            .style('border-radius', '8px')
            .style('box-shadow', '0 4px 8px rgba(0, 0, 0, 0.2)')
            .style('border', '1px solid #ddd')
            .style('max-width', '600px')
            .style('margin', '0 auto 20px auto');
    } else {
        console.warn('No data available for state:', stateName);
    }
}

// Function to display charts for a selected state using yearly data
function showStateCharts(stateName) {
    console.log('Generating charts for state:', stateName);
    const stateData = stateYearData.filter(d => d.state === stateName);
    if (stateData.length > 0) {
        const chartsContainer = d3.select('body').selectAll('#charts-container').data([0]);
        const chartsContainerEnter = chartsContainer.enter().append('div').attr('id', 'charts-container');
        const chartsContainerUpdate = chartsContainer.merge(chartsContainerEnter);

        chartsContainerUpdate
            .style('display', 'flex')
            .style('justify-content', 'center')
            .style('flex-wrap', 'wrap')
            .style('margin-top', '20px');

        chartsContainerUpdate.html(`
            <div class="chart-wrapper">
                <canvas id="totalBirthsChart"></canvas>
            </div>
            <div class="chart-wrapper">
                <canvas id="avgMotherAgeChart"></canvas>
            </div>
            <div class="chart-wrapper">
                <canvas id="avgBirthWeightChart"></canvas>
            </div>
        `);

        // Apply consistent styling to chart wrappers
        d3.selectAll('.chart-wrapper')
            .style('background-color', 'white')
            .style('padding', '15px')
            .style('border-radius', '8px')
            .style('box-shadow', '0 4px 8px rgba(0, 0, 0, 0.2)')
            .style('border', '1px solid #ddd')
            .style('width', 'calc(33.33% - 20px)')
            .style('margin', '10px')
            .style('box-sizing', 'border-box');

        createChart('totalBirthsChart', stateData, 'Total Births', 'total_births');
        createChart('avgMotherAgeChart', stateData, 'Average Mother Age', 'avg_age_of_mother', true);
        createChart('avgBirthWeightChart', stateData, 'Average Birth Weight (g)', 'avg_birth_weight_g', true);
    } else {
        console.warn('No yearly data available for state:', stateName);
    }
}

// Function to create a chart using Chart.js library
function createChart(canvasId, data, label, dataKey, isBarChart = false) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // Verify Chart.js library is loaded
    if (typeof Chart === 'undefined') {
        console.error('Chart.js library is not loaded. Please include the Chart.js library in your HTML file.');
        return;
    }

    // Destroy existing chart instance if it exists to prevent duplicates
    if (window[canvasId] instanceof Chart) {
        window[canvasId].destroy();
    }

    // Create new chart instance
    window[canvasId] = new Chart(ctx, {
        type: isBarChart ? 'bar' : 'line',
        data: {
            labels: data.map(d => d.year),
            datasets: [{
                label: label,
                data: data.map(d => d[dataKey]),
                backgroundColor: isBarChart ? 'rgba(75, 192, 192, 0.6)' : 'rgba(75, 192, 192, 1)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: `${label} in ${data[0].state} (2016-2021)`
                }
            }
        }
    });
}

// Add an event listener to ensure the map is properly sized when the window is resized
window.addEventListener('resize', function() {
    map.invalidateSize();
});
