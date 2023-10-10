const stateToRegion = {
    'Alabama': 'Southeast',
    'Alaska': 'West',
    'Arizona': 'West',
    'Arkansas': 'South',
    'California': 'West',
    'Colorado': 'West',
    'Connecticut': 'Northeast',
    'Delaware': 'Northeast',
    'Florida': 'Southeast',
    'Georgia': 'Southeast',
    'Hawaii': 'West',
    'Idaho': 'West',
    'Illinois': 'Midwest',
    'Indiana': 'Midwest',
    'Iowa': 'Midwest',
    'Kansas': 'Midwest',
    'Kentucky': 'Southeast',
    'Louisiana': 'South',
    'Maine': 'Northeast',
    'Maryland': 'Northeast',
    'Massachusetts': 'Northeast',
    'Michigan': 'Midwest',
    'Minnesota': 'Midwest',
    'Mississippi': 'Southeast',
    'Missouri': 'Midwest',
    'Montana': 'West',
    'Nebraska': 'Midwest',
    'Nevada': 'West',
    'New Hampshire': 'Northeast',
    'New Jersey': 'Northeast',
    'New Mexico': 'West',
    'New York': 'Northeast',
    'North Carolina': 'Southeast',
    'North Dakota': 'Midwest',
    'Ohio': 'Midwest',
    'Oklahoma': 'South',
    'Oregon': 'West',
    'Pennsylvania': 'Northeast',
    'Rhode Island': 'Northeast',
    'South Carolina': 'Southeast',
    'South Dakota': 'Midwest',
    'Tennessee': 'Southeast',
    'Texas': 'South',
    'Utah': 'West',
    'Vermont': 'Northeast',
    'Virginia': 'Southeast',
    'Washington': 'West',
    'West Virginia': 'Southeast',
    'Wisconsin': 'Midwest',
    'Wyoming': 'West',
};

// initialized variables
var data;
var deathsByState ={};
// Initialize the map and tiles
var map = L.map('map').setView([37.8, -96], 4);

var tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var url = "http://127.0.0.1:5000/api/v1.0/totaldeaths";

// Define the updateLegend function outside of the .then block
function updateLegend(selectedDataType) {
    const legend = document.getElementById('legend');
    legend.innerHTML = ''; // Clear previous legend content

    let legendColors, legendLabels;
    if (selectedDataType === 'Nominal') {
        legendColors = ['#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026'];
        legendLabels = ['5000', '50000', '100000', '150000', '300000', '400000', '500000'];
    } else if (selectedDataType === 'Age Adjusted') {
        legendColors = ['#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026'];
        legendLabels = ['400+', '1000', '2000', '5000', '6000', '7000', '8000'];
    }

    for (let i = 0; i < legendColors.length; i++) {
        const div = document.createElement('div');
        div.innerHTML = `<i style="background: ${legendColors[i]}"></i>${legendLabels[i]}`;
        legend.appendChild(div);
    }
}

d3.json(url).then((fetchedData) => {
    data = fetchedData;
    console.log("Data fetched:", data);

    function getNominalColor(d) {
        return d > 500000 ? '#800026' :
               d > 400000 ? '#BD0026' :
               d > 300000 ? '#E31A1C' :
               d > 150000 ? '#FC4E2A' :
               d > 100000 ? '#FD8D3C' :
               d > 50000 ? '#FEB24C' : '#FED976';
    }

    function getAAColor(d) {
        return d > 8000  ? '#800026' :
               d > 7000  ? '#BD0026' :
               d > 6000  ? '#E31A1C' :
               d > 5000   ? '#FC4E2A' :
               d > 2000   ? '#FD8D3C' :
               d > 1000   ? '#FEB24C' : '#FED976';
    }

    function updateMapColor() {
      const selectedYear = parseInt(d3.select("#YearDataset").property("value"), 10);
      const selectedDataType = d3.select("#typeDataset").property("value");
      console.log("Selected Year:", selectedYear);
      console.log("Selected Data Type:", selectedDataType);
  
      deathsByState = {};
  
      if (selectedDataType.toLowerCase() === "nominal") {
          const filteredData = data['nominal'].filter(x => x.Year === selectedYear);
          filteredData.forEach(entry => {
              deathsByState[entry.State] = entry["Total"];
              console.log("Deaths for", entry.State, ":", deathsByState[entry.State]);
          });
      } else if (selectedDataType === "Age Adjusted") {
          const filteredData = data['AA'].filter(x => x.Year === selectedYear);
          console.log("Filtered AA data for year:", selectedYear, filteredData);
          filteredData.forEach(entry => {
              deathsByState[entry.State] = entry["Total-AA"];
              console.log("Deaths for", entry.State, ":", deathsByState[entry.State]);
          });
      }
  
      console.log("Deaths by state:", deathsByState); // Log for both data types
  
      let getColor;
      if (selectedDataType === "Nominal") {
          getColor = getNominalColor;
      } else if (selectedDataType === "Age Adjusted") {
          getColor = getAAColor;
      }
  
      function style(feature) {
        const stateName = feature.properties.name;
        const regionName = stateToRegion[stateName] || 'Other'; // 'Other' for states not in your mapping
        const deaths = calculateRegionTotal(regionName); // Implement this function to calculate region totals
        console.log(`Region: ${regionName}, Deaths: ${deaths}`);
        return {
            fillColor: getColor(deaths), // Use the selected color function
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
        };
      }
  
      // If there's an existing geoJsonLayer, remove it from the map
      if (window.geoJsonLayer) {
          window.geoJsonLayer.removeFrom(map);
      }
  
      // Add the new layer
      console.log("Creating new geoJson layer");
      window.geoJsonLayer = L.geoJson(statesData, { style: style, onEachFeature: onEachFeature }).addTo(map);
  
      map.invalidateSize();
    }

  // Attach the change event for the data type dropdown
  d3.select("#typeDataset").on("change", function() {
    const selectedDataType = d3.select(this).property("value");
    updateMapColor(); // Update the map when the data type changes
    updateLegend(selectedDataType); // Update the legend when the data type changes
  });

  // Attach the change event for the year dropdown
  d3.select("#YearDataset").on("change", function() {
  updateMapColor(); // Update the map when the year changes
  });

  // Call the function initially to display the map
  updateMapColor();

}).catch(error => {
    console.error("Error fetching the data:", error);
});

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: function (e) {
            const stateName = feature.properties.name;
            const regionName = stateToRegion[stateName] || 'Other';
            const totalDeaths = calculateRegionTotal(regionName);

            // Highlight the entire region on hover
            const statesInRegion = regionToStates[regionName] || [];
            regionsGeoJSON.eachLayer(function (regionLayer) {
                if (statesInRegion.includes(regionLayer.feature.properties.name)) {
                    regionLayer.setStyle({
                        weight: 3,
                        color: '#000',
                    });
                }
            });

            // Bind the popup to the feature layer
            layer.bindPopup(`<strong>${regionName}</strong><br>Total Deaths: ${totalDeaths}`).openPopup();
        },
        mouseout: function (e) {
            // Reset the region's style on mouseout
            const stateName = feature.properties.name;
            const regionName = stateToRegion[stateName] || 'Other';
            const statesInRegion = regionToStates[regionName] || [];
            regionsGeoJSON.eachLayer(function (regionLayer) {
                if (statesInRegion.includes(regionLayer.feature.properties.name)) {
                    regionLayer.setStyle({
                        weight: 2,
                        color: 'white',
                    });
                }
            });
        },
    });
}


function getStateInfo(stateName) {
    let info = `<strong>${stateName}</strong><br>`;
    // You can add more data fields as needed

    const selectedDataType = d3.select("#typeDataset").property("value");
    const deaths = deathsByState[stateName] || 0;
    
    if (selectedDataType.toLowerCase() === "nominal") {
        info += `Deaths: ${deaths}`;
    } else if (selectedDataType === "Age Adjusted") {
        info += `Age Adjusted Deaths: ${deaths}`;
    }
    
    return info;
}

function calculateRegionTotal(regionName) {
    const selectedYear = parseInt(d3.select("#YearDataset").property("value"), 10);
    const selectedDataType = d3.select("#typeDataset").property("value");

    let totalDeaths = 0;

    if (selectedDataType.toLowerCase() === "nominal") {
        const filteredData = data['nominal'].filter(entry => entry.Year === selectedYear && stateToRegion[entry.State] === regionName);
        totalDeaths = filteredData.reduce((sum, entry) => sum + entry["Total"], 0);
    } else if (selectedDataType === "Age Adjusted") {
        const filteredData = data['AA'].filter(entry => entry.Year === selectedYear && stateToRegion[entry.State] === regionName);
        totalDeaths = filteredData.reduce((sum, entry) => sum + entry["Total-AA"], 0);
    }

    return totalDeaths;
}

function updateRegionTotals() {
    const regions = [...new Set(Object.values(stateToRegion))];
    const regionTotals = {};
    regions.forEach(region => {
        regionTotals[region] = calculateRegionTotal(region);
    });
    console.log("Region Totals:", regionTotals);
    // Update the region totals as needed, e.g., display them on the page
}

// Attach the change event for the data type dropdown
d3.select("#typeDataset").on("change", function () {
    const selectedDataType = d3.select(this).property("value");
    updateMapColor(); // Update the map when the data type changes
    updateLegend(selectedDataType); // Update the legend when the data type changes
    updateRegionTotals(); // Update the region totals when the data type changes
});

// Attach the change event for the year dropdown
d3.select("#YearDataset").on("change", function () {
    updateMapColor(); // Update the map when the year changes
    updateRegionTotals(); // Update the region totals when the year changes
});

const regionToStates = {};
for (const state in stateToRegion) {
    const region = stateToRegion[state];
    if (!regionToStates[region]) {
        regionToStates[region] = [];
    }
    regionToStates[region].push(state);
}

// Load GeoJSON data for regions
const regionsGeoJSON = L.geoJson(statesData, {
    style: {
        // Define the style for regions
        fillOpacity: 0, // Make regions transparent initially
    },
}).addTo(map); // Add the regions layer to the map
