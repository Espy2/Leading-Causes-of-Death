const FlaskURL = "http://127.0.0.1:5000/api/v1.0/radar";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
let State = []


d3.json(FlaskURL).then((data) => {

    for(i=0; i< data['Age Adjusted'].length; i+=19){
        S = data['Age Adjusted'][i].State
        State.push(S)
    };

    populateDropdownWithD3();
   
}).catch(error => {
    console.error("Error fetching data:", error);
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
d3.select("#stateDataset").on("change", function() {
    updateRadarData(); 
});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function updateRadarData() {
    const selectedYear = parseInt(d3.select("#YearDataset").property("value"), 10);
    const selectedStates = Array.from(d3.select("#stateDataset").node().selectedOptions).map(option => option.value);
    const selectedDataType = d3.select("#typeDataset").property("value");

    d3.json(FlaskURL).then((data) => {

        config.data.datasets = [];


      
        let displayData;
        for (const selectedState of selectedStates) {
            //let displayData;
            let datasetData;
            let borderColor = 'rgb(' + Math.floor(Math.random() * 255) + ',' + Math.floor(Math.random() * 255) + ',' + Math.floor(Math.random() * 255) + ')';

            if (selectedDataType === "Nominal") {
                displayData = data['Nominal'].filter(x => x.State === selectedState && x.Year === selectedYear);
                datasetData = CoD.map(cause => displayData[0][CoD_N_KEYS[cause]]);
            } else if (selectedDataType === "Age Adjusted") {
                displayData = data['Age Adjusted'].filter(x => x.State === selectedState && x.Year === selectedYear);
                datasetData = CoD.map(cause => displayData[0][CoD_AA_KEYS[cause]]);
            }

            config.data.datasets.push({
                label: selectedState,
                data: datasetData,
                fill: true,
                borderColor: borderColor,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                pointBackgroundColor: borderColor,
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: borderColor
            });
        }

        

        myRadarChart.update();


      

        console.log(displayData);
    
        //config();

    }).catch(error => {
        console.error("Error fetching data:", error);
    });
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// d3.select("#YearDataset").on("change", updateData);
// d3.select("#typeDataset").on("change", updateData);

d3.select("#stateDataset").on("change", updateRadarData);
d3.select("#YearDataset").on("change", updateRadarData);
d3.select("#typeDataset").on("change", updateRadarData);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function populateDropdownWithD3() {
    const dropdown = d3.select("#stateDataset");

    // Bind names to dropdown
    dropdown.selectAll("option")
        // tying names list to this dropdown
        .data(State)

        // focus on any name in the names list that isn't already in the dropdown (in this case all the names)
        .enter()

        //how each name appears as a selectable option in our dropdown
        .append("option")

        //make the displayed text of this option be the name
        .text(d => d)

        //the option displayed will also be the value in the background
        .attr("value", d => d)
    

}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const CoD = ["Heart disease","Cancer","Stroke","CLRD","Unintentional injuries","Alzheimer's disease","Diabetes","Influenza and pneumonia","Kidney disease","Suicide"] 

const CoD_AA_KEYS = {
    "Heart disease": "Heart_disease_AA",
    "Cancer": "Cancer_AA",
    "Stroke": "Stroke_AA",
    "CLRD": "CLRD_AA",
    "Unintentional injuries": "Unintentional_injuries_AA",
    "Alzheimer's disease": "Alzheimer's disease_AA",
    "Diabetes": "Diabetes_AA",
    "Influenza and pneumonia": "Influenza and pneumonia_AA",
    "Kidney disease": "Kidney disease_AA",
    "Suicide": "Suicide_AA"
};

const CoD_N_KEYS = {
    "Heart disease": "Heart disease",
    "Cancer": "Cancer",
    "Stroke": "Stroke",
    "CLRD": "CLRD",
    "Unintentional injuries": "Unintentional injuries",
    "Alzheimer's disease": "Alzheimer's disease",
    "Diabetes": "Diabetes",
    "Influenza and pneumonia": "Influenza and pneumonia",
    "Kidney disease": "Kidney disease",
    "Suicide": "Suicide"
};

const data = {
    labels: CoD,
    datasets: [{
        label: 'State',
        data: [],  
        fill: true,
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        pointBackgroundColor: 'rgb(54, 162, 235)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(54, 162, 235)'
    }]
};

let config = {
    type: 'radar',
    data: data,
    options: {
        responsive: false,          
        maintainAspectRatio: false, 
        plugins: {
            legend: {
                labels: {
                    color: 'rgba(255, 255, 255, 1)',
                    font: {
                        weight: 'bold',
                        size: 14
                    }
                }
            },
            tooltip: {
                enabled: true,
                titleColor: 'rgba(0, 0, 0, 1)',   // Black color for tooltip title for contrast
                bodyColor: 'rgba(0, 0, 0, 1)',    // Black color for tooltip body for contrast
                borderColor: 'rgba(255, 255, 255, 0.9)', // White border color for tooltip
                borderWidth: 2,                          // Moderate border width for tooltip
                backgroundColor: 'rgba(255, 255, 255, 0.9)', // White background color for tooltip
                titleFont: {                              // Bolder and bigger title font
                    size: 16,
                    weight: 'bold'
                },
                bodyFont: {                               // Bolder and bigger body font
                    size: 14,
                    weight: 'bold'
                }
            }
        },
        scales: {
            r: {
                angleLines: {
                    color: 'rgba(255, 255, 255, 0.9)',  // Brighter radial lines
                    lineWidth: 1.5                     // Slightly thicker radial lines
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.9)',  // Brighter circular lines
                    lineWidth: 1.5                     // Slightly thicker circular lines
                },
                pointLabels: {
                    color: 'rgba(255, 255, 255, 1)',  // Bright white color for point labels
                    font: {
                        size: 14,                    // Slightly larger font size for clarity
                        weight: 'bold'               // Bold font for point labels
                    }
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.9)', // Slightly muted color for the tick labels for better readability
                    backdropColor: 'rgba(0, 0, 0, 0.7)', // Darker background color for tick labels
                    z: 1 // Ensure that ticks are rendered above the grid lines
                }
            }
        },
        elements: {
            point: {
                backgroundColor: 'rgba(54, 162, 235, 0.9)',
                borderColor: 'rgba(255, 255, 255, 1)',
                hoverBackgroundColor: 'rgba(255, 255, 255, 1)',
                hoverBorderColor: 'rgba(54, 162, 235, 0.9)'
            }
        }
    }
};

const myRadarChart = new Chart(document.getElementById('myRadarChart'), config);