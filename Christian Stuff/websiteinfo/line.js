let lineConfig = {
    type: 'line',
    data: {
        labels: [],
        datasets: []
    },
    options: {
        scales: {
            x: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(255, 255, 255, 0.2)'  // Brighter grid lines
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 1)',   // Full white color for tick labels
                    font: {
                        weight: 'bold'                 // Bold font for tick labels
                    }
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(255, 255, 255, 0.2)'  // Brighter grid lines
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 1)',   // Full white color for tick labels
                    font: {
                        weight: 'bold'                 // Bold font for tick labels
                    }
                }
            }
        },
        plugins: {
            legend: {
                labels: {
                    color: 'rgba(255, 255, 255, 1)',   // Brightest white color for legend labels
                    font: {
                        weight: 'bold',                // Bold font for legend
                        size: 14                       // Slightly larger font size for clarity
                    }
                }
            },
            tooltip: {
                enabled: true,
                titleColor: 'rgba(255, 255, 255, 1)',   // Brightest white color for tooltip title
                bodyColor: 'rgba(255, 255, 255, 1)',    // Brightest white color for tooltip body
                borderColor: 'rgba(54, 162, 235, 0.9)', // Darker border color for tooltip
                borderWidth: 3,                          // Thicker border for tooltip
                backgroundColor: 'rgba(54, 162, 235, 0.9)' // Darker background color for tooltip
            }
        }
    }
};

const myLineChart = new Chart(document.getElementById("myLineChart").getContext('2d'), lineConfig);

const causesMapping = {
    "Alzheimer's disease": {
        "Nominal": "Alzheimer's disease",
        "Age Adjusted": "Alzheimer's disease_AA"
    },
    "CLRD": {
        "Nominal": "CLRD",
        "Age Adjusted": "CLRD_AA"
    },
    "Cancer": {
        "Nominal": "Cancer",
        "Age Adjusted": "Cancer_AA"
    },
    "Diabetes": {
        "Nominal": "Diabetes",
        "Age Adjusted": "Diabetes_AA"
    },
    "Heart disease": {
        "Nominal": "Heart disease",
        "Age Adjusted": "Heart_disease_AA"
    },
    "Influenza and pneumonia": {
        "Nominal": "Influenza and pneumonia",
        "Age Adjusted": "Influenza and pneumonia_AA"
    },
    "Kidney disease": {
        "Nominal": "Kidney disease",
        "Age Adjusted": "Kidney disease_AA"
    },
    "Stroke": {
        "Nominal": "Stroke",
        "Age Adjusted": "Stroke_AA"
    },
    "Suicide": {
        "Nominal": "Suicide",
        "Age Adjusted": "Suicide_AA"
    },
    "Unintentional injuries": {
        "Nominal": "Unintentional injuries",
        "Age Adjusted": "Unintentional_injuries_AA"
    }
};

function getSelectedValues(selectElementId) {
    const selectElement = document.getElementById(selectElementId);
    return Array.from(selectElement.selectedOptions).map(option => option.value);
}

const staticYears = Array.from({ length: 19 }, (_, i) => (1999 + i).toString());

function updateLineData() {
    const selectedStates = getSelectedValues("stateDataset");
    const selectedCauses = getSelectedValues("causeOfDeathDataset");
    const selectedDataType = document.getElementById("typeDataset").value;

    fetch(FlaskURL)
        .then(response => response.json())
        .then((data) => {
            const newDatasets = [];

            lineConfig.data.labels = staticYears;

            for (const state of selectedStates) {
                for (const cause of selectedCauses) {
                    const causeKey = causesMapping[cause][selectedDataType];
                    const filteredData = data[selectedDataType].filter(x => x.State === state).sort((a, b) => a.Year - b.Year);

                    const lineData = filteredData.map(entry => entry[causeKey]);

                    newDatasets.push({
                        label: `${state} - ${cause}`,
                        data: lineData,
                        borderColor: 'rgb(' + Math.floor(Math.random() * 255) + ',' + Math.floor(Math.random() * 255) + ',' + Math.floor(Math.random() * 255) + ')',
                        borderWidth: 3,            // Thicker line
                        pointRadius: 5,            // Larger points
                        pointBorderWidth: 2,       // Thicker point border
                        fill: false
                    });
                }
            }

            lineConfig.data.datasets = newDatasets;
            myLineChart.update();
        })
        .catch(error => {
            console.error("Error fetching data:", error);
        });
}

document.getElementById('updateButton').addEventListener('click', updateLineData);