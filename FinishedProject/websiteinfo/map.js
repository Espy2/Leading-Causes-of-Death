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
        legendLabels = ['5000', '10000', '50000', '75000', '200000', '250000', '300000'];
    } else if (selectedDataType === 'Age Adjusted') {
        legendColors = ['#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026'];
        legendLabels = ['400+', '400', '550', '600', '700', '800', '825+'];
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
        return d > 250000 ? '#800026' :
               d > 200000 ? '#BD0026' :
               d > 75000 ? '#E31A1C' :
               d > 50000 ? '#FC4E2A' :
               d > 10000 ? '#FD8D3C' :
               d > 5000  ? '#FEB24C' : '#FED976';
    }

    function getAAColor(d) {
        return d > 825  ? '#800026' :
               d > 800  ? '#BD0026' :
               d > 700  ? '#E31A1C' :
               d > 600   ? '#FC4E2A' :
               d > 550   ? '#FD8D3C' :
               d > 400   ? '#FEB24C' : '#FED976';
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
          const deaths = deathsByState[feature.properties.name] || 0;
          console.log(`State: ${feature.properties.name}, Deaths: ${deaths}`);
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
            // Highlight the state on hover
            layer.setStyle({
                weight: 3,
                color: '#000',
            });
            // Show tooltip with information
            layer.bindTooltip(getStateInfo(feature.properties.name)).openTooltip();
        },
        mouseout: function (e) {
            // Reset the state's style
            layer.setStyle({
                weight: 2,
                color: 'white',
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
