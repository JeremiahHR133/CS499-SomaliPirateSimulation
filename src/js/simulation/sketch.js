// Simulation object instance
let simManager;

// File management
let loadingFile = false;

// Map Images
let bgImage;
let bgImageNight;
let legendImage;

// Boat Images
let cargoImage;
let patrolImage;
let pirateImage;
let captureImage;

// Boat Images Low-res
let cargoImageLow;
let patrolImageLow;
let pirateImageLow;
let captureImageLow;

// Graphics variables that can be customized
let scaleToShowGrid = 3.5;     // The scale factor at which we show the full grid res
let gridLineScaleFactor = 0.5; // The exponet applied to scale factor to reduce grid line scaling when zooming. 1 = no effect (thin lines on zoom)
let relImageSize = 80;         // The size of the image relative to a 1080p screen
let relGridLineThick = 1.0;    // The thinkness of the thick grid line on a 1080p screen
let relGridLineThin = 0.4;     // The thinkness of the thin  grid line on a 1080p screen
let simMapPercentage = 0.9;    // The percentage of the map to be used for the grid drawing
let lowResImages = false;      // Use high or low resolution images
let showLegend = false;        // Show the map legend

// Graphics variables that cannot be customized
// The initial values for these should not be changed either
// Variables that do not have an initial condition are dependent on other variables that could be configurable
let scaleFactor = 1;                // Inital zoom level
let translateX = 0, translateY = 0; // Initial translation
let mouseOnCanvas = false;          // True when the mouse is on the canvas, false otherwise. Managed by js event functions later in this file
let imageScaleFactor = scaleFactor; // Scale factor to draw the images. Separate from scaleFactor because images have a minimum size, thus they stop scaling at a point
let worldXRatio, worldYRatio;       // Ratio used for converting between world and simulation coordinates
let canvasWidth, canvasHeight;      // Variables to store the width and height of the canvas. Currently they are set based on the screen width and height
let defaultImageSize;               // Image size after accounting for screen resolution
let gridLineThick;                  // Thick grid line size after accounting for screen resolution
let gridLineThin;                   // Thin  grid line size after accounting for screen resolution
let simDrawWidth;                   // Based on the simDrawPercentage applied to the canvas width , used in converting between world and simulation coordinates
let simDrawHeight;                  // Based on the simDrawPercentage applied to the canvas height, used in converting between world and simulation coordinates

function preload() {
    bgImage = loadImage("images/Map_Day.png");
    bgImageNight = loadImage("images/Map_Night.png");
    legendImage = loadImage("images/Legend.png");

    cargoImage = loadImage("images/cargo_ship.png");
    patrolImage = loadImage("images/patrol_ship.png");
    pirateImage = loadImage("images/pirate_ship.png");
    captureImage = loadImage("images/capture_ship.png");

    cargoImageLow = loadImage("images/cargo_ship_simple.png");
    patrolImageLow = loadImage("images/patrol_ship_simple.png");
    pirateImageLow = loadImage("images/pirate_ship_simple.png");
    captureImageLow = loadImage("images/capture_ship_simple.png");
}

function setup() {
    // put setup code here
    canvasWidth = screen.width;
    canvasHeight = screen.width / 4;

    createCanvas(canvasWidth, canvasHeight, document.getElementById("P5-DRAWING-CANVAS"));
    background(0, 0, 0);

    simManager = new SimManager();

    simManager.updateSettingsUI();
    simManager.setClock();
}

function draw() {
    if(loadingFile){
        return;
    }
    simManager.tick();

    // Update graphics variables that may have been changed by the user
    updateGraphicsVariables();

    // Manage zooming relative to the mouse and panning
    lockToViewport();
    translate(translateX, translateY);
    scale(scaleFactor);

    // Draw the map
    imageMode(CORNER);
    image(simManager.isDayTime() ? bgImage : bgImageNight, 0, 0, canvasWidth, canvasHeight);
    if (showLegend)
        image(legendImage, 0, canvasHeight - 24);

    drawGridLines();

    drawBoatSprites();
}

// Because customization is cool
// Will update the depended graphics vars based on the ones set by the user
function updateGraphicsVariables() {
    simDrawWidth = canvasWidth * simMapPercentage;
    simDrawHeight = canvasHeight * simMapPercentage;

    // Give elements hard coded sizes that are still relative to the screen size
    defaultImageSize = relImageSize * (screen.width / 1920);
    gridLineThick = relGridLineThick * (screen.width / 1920);
    gridLineThin = relGridLineThin * (screen.width / 1920);

    worldXRatio = simDrawWidth / simManager.simulation.initialConditions.simDimensions[1];
    worldYRatio = simDrawHeight / simManager.simulation.initialConditions.simDimensions[0];
}

function simXToWorldX(simX) {
    return simX * worldXRatio + (worldXRatio / 2) + ((canvasWidth - simDrawWidth) / 2);
}

function simYToWorldY(simY) {
    return simY * worldYRatio + (worldYRatio / 2) + ((canvasHeight - simDrawHeight) / 2);
}

function drawBoatSprites() {
    // Draw all the entities
    imageMode(CENTER);
    let frame = simManager.simulation.getCurrentFrame();
    frame.cargoList.forEach(cargo => {
        image(lowResImages ? cargoImageLow : cargoImage,
            simXToWorldX(cargo.xPos),
            simYToWorldY(cargo.yPos),
            defaultImageSize / imageScaleFactor, defaultImageSize / imageScaleFactor);
    });
    frame.patrolList.forEach(patrol => {
        image(lowResImages ? patrolImageLow : patrolImage,
            simXToWorldX(patrol.xPos),
            simYToWorldY(patrol.yPos),
            defaultImageSize / imageScaleFactor, defaultImageSize / imageScaleFactor);
    });
    frame.pirateList.forEach(pirate => {
        if (!pirate.hasCapture)
        {
            image(lowResImages ? pirateImageLow : pirateImage,
                simXToWorldX(pirate.xPos),
                simYToWorldY(pirate.yPos),
                defaultImageSize / imageScaleFactor, defaultImageSize / imageScaleFactor);
        }
    });
    frame.captureList.forEach(capture => {
        image(lowResImages ? captureImageLow : captureImage,
            simXToWorldX(capture.xPos),
            simYToWorldY(capture.yPos),
            defaultImageSize / imageScaleFactor, defaultImageSize / imageScaleFactor);
    });
}

function drawGridLines() {
    stroke(0, 0, 0);
    let thickness; // line thickness
    if (scaleFactor > scaleToShowGrid) {
        // Draw the horizontal lines
        for (let i = 0; i < simManager.simulation.initialConditions.simDimensions[0] + 1; i += 1) {
            thickness = (i % 4 == 0 ? gridLineThick : gridLineThin) / Math.pow(scaleFactor, gridLineScaleFactor);
            strokeWeight(thickness);
            line(0 + ((canvasWidth - simDrawWidth) / 2), i * worldYRatio + ((canvasHeight - simDrawHeight) / 2), (simManager.simulation.initialConditions.simDimensions[1] * worldXRatio) + ((canvasWidth - simDrawWidth) / 2), i * worldYRatio + ((canvasHeight - simDrawHeight) / 2));
        }
        // Draw vertical lines
        for (let i = 0; i < simManager.simulation.initialConditions.simDimensions[1] + 1; i += 1) {
            thickness = (i % 4 == 0 ? gridLineThick : gridLineThin) / Math.pow(scaleFactor, gridLineScaleFactor);
            strokeWeight(thickness);
            line(i * worldXRatio + ((canvasWidth - simDrawWidth) / 2), 0 + ((canvasHeight - simDrawHeight) / 2), i * worldXRatio + ((canvasWidth - simDrawWidth) / 2), (simManager.simulation.initialConditions.simDimensions[0] * worldYRatio) + ((canvasHeight - simDrawHeight) / 2));
        }
    }
    else {
        thickness = gridLineThick / Math.pow(scaleFactor, gridLineScaleFactor);
        strokeWeight(thickness);
        // Draw the horizontal lines
        for (let i = 0; i < simManager.simulation.initialConditions.simDimensions[0] + 1; i += 4) {
            line(0 + ((canvasWidth - simDrawWidth) / 2), i * worldYRatio + ((canvasHeight - simDrawHeight) / 2), (simManager.simulation.initialConditions.simDimensions[1] * worldXRatio) + ((canvasWidth - simDrawWidth) / 2), i * worldYRatio + ((canvasHeight - simDrawHeight) / 2));
        }
        // Draw vertical lines
        for (let i = 0; i < simManager.simulation.initialConditions.simDimensions[1] + 1; i += 4) {
            line(i * worldXRatio + ((canvasWidth - simDrawWidth) / 2), 0 + ((canvasHeight - simDrawHeight) / 2), i * worldXRatio + ((canvasWidth - simDrawWidth) / 2), (simManager.simulation.initialConditions.simDimensions[0] * worldYRatio) + ((canvasHeight - simDrawHeight) / 2));
        }
    }
}

function lockToViewport() {
    if (translateX > 0) {
        translateX = 0;
    }
    if (translateY > 0) {
        translateY = 0;
    }
    if (translateX < canvasWidth * (1 - scaleFactor)) {
        translateX = canvasWidth * (1 - scaleFactor);
    }
    if (translateY < canvasHeight * (1 - scaleFactor)) {
        translateY = canvasHeight * (1 - scaleFactor);
    }
}

document.getElementById("P5-DRAWING-CANVAS").onmouseover = event => {
    mouseOnCanvas = true;
    document.body.style.position = "fixed";
}

document.getElementById("P5-DRAWING-CANVAS").onmouseleave = event => {
    mouseOnCanvas = false;
    document.body.style.position = "relative";
}

function mouseWheel(event) {
    // Only zoom when over the canvas
    if (!mouseOnCanvas) {
        return;
    }

    let s = event.delta > 0 ? 0.95 : 1.05;

    // Don't zoom in beyond 105x
    if (scaleFactor * s > 105) {
        return;
    }

    scaleFactor *= s;

    // Don't zoom out beyond 1x
    if (scaleFactor < 1) {
        scaleFactor = 1;
        return;
    }

    // Cap image scaling once they shrink to the size of one grid cell, with some padding
    if (defaultImageSize / scaleFactor > worldXRatio - (worldXRatio / 5)) {
        imageScaleFactor = scaleFactor;
    }

    translateX = mouseX - s * mouseX + s * translateX;
    translateY = mouseY - s * mouseY + s * translateY;
}

function mouseDragged() {
    if (!mouseOnCanvas) {
        return;
    }

    translateX += movedX;
    translateY += movedY;
}

// function worldXToSimX(worldX) {
//     return Math.floor((worldX - ((canvasWidth - simDrawWidth) / 2)) / worldXRatio);
// }

// function worldYToSimY(worldY) {
//     return Math.floor((worldY - ((canvasHeight - simDrawHeight) / 2)) / worldYRatio);
// }

function canvasXToSimX(canvasX) {
    return Math.floor((((canvasX - translateX) / scaleFactor) - ((canvasWidth - simDrawWidth) / 2)) / worldYRatio);
}

function canvasYToSimY(canvasY) {
    return Math.floor((((canvasY - translateY) / scaleFactor) - ((canvasHeight - simDrawHeight) / 2)) / worldYRatio);
}

function mouseClicked()
{
    if (mouseButton === LEFT)
    {
        if (mouseOnCanvas && scaleFactor > scaleToShowGrid)
        {
            ProcessCellClick();
        }
    }
}

function ProcessCellClick()
{
    let cellRow = canvasYToSimY(mouseY);
    let cellCol = canvasXToSimX(mouseX);

    simManager.lastProbIndexRow = cellRow;
    simManager.lastProbIndexCol = cellCol;

    // Cell is not even in the grid
    if (cellRow < 0 || cellRow > 99 || cellCol < 0 || cellCol > 399)
    {
        return;
    }
    // Cell is not on the edge
    if ((cellCol != 0 && cellCol != 399) && cellRow != 99)
    {
        return;
    }


    let isDay = document.getElementById("dayNightSettings").value == "day";

    UpdateCellSelector(cellRow, cellCol);

    simManager.updateSettingsUI(isDay);
}

function UpdateCellSelector(cellRow, cellCol)
{
    // Update row column selector ui
    document.getElementById("cellRow").value = cellRow;
    document.getElementById("cellColumn").value = cellCol;

    // Remove old lables
    const node = document.getElementById("cornerBoatSelect");
    while (node.firstChild) {
        node.removeChild(node.lastChild);
    }
    
    // Get the lables for the selection
    let stringArray = GetLablesFromIndex(cellRow, cellCol);

    // Create new selector lables
    stringArray.forEach(stringLabel => {
        let newOption = document.createElement("option");
        let newOptionText = document.createTextNode(stringLabel);
        newOption.appendChild(newOptionText);
        newOption.value = stringLabel;
        document.getElementById("cornerBoatSelect").appendChild(newOption);
    });
}

function GetLablesFromIndex(cellRow, cellCol)
{
    // Cargo ship or single cell of pirate
    if (cellCol == 0)
    {
        // Bottom left corner (cargo + pirate)
        if (cellRow == 99)
        {
            return ["Cargo", "Pirate"];
        }
        // Cargo
        else
        {
            return ["Cargo"];
        }
    }
    // Patrol ship or single cell of pirate
    else if (cellCol == 399)
    {
        // Bottom right corner (patrol + pirate)
        if (cellRow == 99)
        {
            return ["Patrol", "Pirate"];
        }
        // Patrol
        else
        {
            return ["Patrol"];
        }
    }
    // Only pirate since mixed cells handled earlier
    else if (cellRow == 99)
    {
        return ["Pirate"];
    }
    // Not a valid cell for a probability conversion, should never get here
    return [""];
}

// ------------------------------
// Exit Alerts and Download Cues
// ------------------------------



// ------------------------------
// Download Sim Function
// ------------------------------

function downloadCurrentSim() {
    //console.log(JSON.stringify(simManager))
    const file = new File([JSON.stringify(simManager)], 'simulation.json', { type : 'application/json', })
    const link = document.createElement('a')
    const url = URL.createObjectURL(file)

    link.href = url
    link.download = file.name
    document.body.appendChild(link)
    link.click()

    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    navToLanding();
}

// ------------------------------
// Import Simulation
// ------------------------------

function importAndStart() {
    //currentSimTime is only 0 at the very beginning, so it can tell us if there has been a previously imported simulation
    if(simManager.simulation.currentSimTime == 0){
        console.log("importing new simulation...")

        //Create a promise for two reasons:
        //1.) Find a way to get Play() to wait for the file to load
        //2.) Handle incorrect file imports
        let importPromise = new Promise((resolve, reject) => {
            document.getElementById('importFile').click();

            //Get the input element and wait for file selection
            const input = document.querySelector('input[type="file"]')
            input.addEventListener('change', function(e){
                const reader = new FileReader()
                reader.readAsText(input.files[0])

                //The promise will either parse the file and resolve if correct file type
                //  or reject if incorrect file type
                if(input.files[0].type == 'application/json') {
                    loadingFile = true;

                    //.onload just waits until the file is ready to run the next function
                    reader.onload = function() {
                        //Read the JSON file and part the data into simManager
                        simManager.importFromJSON(JSON.parse(reader.result));
                        loadingFile = false;

                        resolve("File successfully imported!");

                        simManager.updateSettingsUI();
                    }
                } else {
                    reject("Invalid file type\nAcceptable File Type: .json");
                }
            })                    
        })

        //importPromise will wait to run until a resolve or reject has been established
        importPromise.then((message) => {
            console.log(message);
            simManager.simulation.currentFrameNumber = 1;
            Play();     
        }).catch((message) => {
            alert("::ERROR:: " + message);
        })
    } else {
        console.log("Resuming Sim...")
        Play();
    }
}

// ------------------------------
// Page Navigation
// ------------------------------

function navToLanding() {
    if(confirm("Would you like to navigate back to the home page?")){
        window.location.href="landing.html"
    } else {
        simManager.simReplayMode = true;
    }  
}

// ------------------------
// HTML interface functions
// ------------------------

function setSpeed1x() {
    simManager.setSpeed1x();
}

function setSpeed2x() {
    simManager.setSpeed2x();
}

function setSpeed10x() {
    simManager.setSpeed10x();
}

function setSpeed20x() {
    simManager.setSpeed20x();
}

function setSpeedBackwards() {
    simManager.setSpeedBackwards();
}

function Play() {
    simManager.play();
}

function pauseSim() {
    simManager.pause();
}

function setSpeedSingle() {
    simManager.setSingleStepMode();
}

function cancelSim() {
    if (confirm("You have canceled the current simulation\nWould you like to download the current simulation?")) {
        downloadCurrentSim();
    }
    simManager.cancelSim();
}

function resetReplayToStart() {
    simManager.resetToStart();
}

function DNtoggle(){
    if($("#DNToggle").is(":checked")){
        simManager.simulation.initialConditions.considerDayNight = true
        EnableNightSettings(true);
    }
    else{
        simManager.simulation.initialConditions.considerDayNight = false
        EnableNightSettings(false);
    }
}

function DNSelection()
{
    let isDay = document.getElementById("dayNightSettings").value == "day";

    simManager.updateSettingsUI(isDay);
}

function EnableNightSettings(enable)
{
    let selectorBox = document.getElementById("dayNightSettings");
    let nightOption = selectorBox.options.namedItem("nightOption");
    if (enable)
    {
        nightOption.removeAttribute("disabled");
    }
    else
    {
        nightOption.setAttribute("disabled", "disabled");
    }
}