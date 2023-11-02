// Simulation object instance
let simManager;

// Images
let bgImage;
let bgImageNight;
let cargoImage;
let patrolImage;
let pirateImage;
let captureImage;

// Graphics variables
let scaleFactor = 1;
let imageScaleFactor = scaleFactor;
let translateX = 0, translateY = 0;
let scaleToShowGrid = 3.5;
let gridLineScaleFactor = 0.5;
let worldXRatio, worldYRatio;
let canvasWidth, canvasHeight;
let mouseOnCanvas = false;
let defaultImageSize;
let gridLineThick;
let gridLineThin;
let loadingFile = false;

function preload() {
    bgImage = loadImage("images/GulfOfAdenCorrectAspectRatio.png");
    bgImageNight = loadImage("images/GulfOfAdenCorrectAspectRatioNightTime.png");
    cargoImage = loadImage("images/cargo.png");
    patrolImage = loadImage("images/warship2.png");
    pirateImage = loadImage("images/pirate.png");
    captureImage = loadImage("images/capture.png");
}

function setup() {
    // put setup code here
    canvasWidth = screen.width;
    canvasHeight = screen.width / 4;

    // Give elements hard coded sizes that are still relative to the screen size
    defaultImageSize = 40 * (screen.width / 1920);
    gridLineThick = 1.0 * (screen.width / 1920);
    gridLineThin = 0.4 * (screen.width / 1920);

    createCanvas(canvasWidth, canvasHeight, document.getElementById("P5-DRAWING-CANVAS"));
    background(0, 0, 0);

    simManager = new SimManager();

    worldXRatio = canvasWidth / simManager.simulation.initialConditions.simDimensions[1];
    worldYRatio = canvasHeight / simManager.simulation.initialConditions.simDimensions[0];
}

function draw() {
    if(loadingFile){
        return;
    }
    simManager.tick();

    // Manage zooming relative to the mouse and panning
    lockToViewport();
    translate(translateX, translateY);
    scale(scaleFactor);

    // Draw the map
    imageMode(CORNER);
    image(simManager.isDayTime() ? bgImage : bgImageNight, 0, 0, canvasWidth, canvasHeight);

    drawGridLines();

    drawBoatSprites();
}

function drawBoatSprites() {
    // Draw all the entities
    imageMode(CENTER);
    let frame = simManager.simulation.getCurrentFrame();
    frame.cargoList.forEach(cargo => {
        image(cargoImage,
            cargo.xPos * worldXRatio + (worldXRatio / 2),
            cargo.yPos * worldYRatio + (worldYRatio / 2), 
            defaultImageSize / imageScaleFactor, defaultImageSize / imageScaleFactor);
    });
    frame.patrolList.forEach(patrol => {
        image(patrolImage,
            patrol.xPos * worldXRatio + (worldXRatio / 2),
            patrol.yPos * worldYRatio + (worldYRatio / 2),
            defaultImageSize / imageScaleFactor, defaultImageSize / imageScaleFactor);
    });
    frame.pirateList.forEach(pirate => {
        image(pirateImage,
            pirate.xPos * worldXRatio + (worldXRatio / 2),
            pirate.yPos * worldYRatio + (worldYRatio / 2),
            defaultImageSize / imageScaleFactor, defaultImageSize / imageScaleFactor);
    });
    frame.captureList.forEach(capture => {
        image(captureImage,
            capture.xPos * worldXRatio + (worldXRatio / 2),
            capture.yPos * worldYRatio + (worldYRatio / 2),
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
            line(0, i * worldYRatio, simManager.simulation.initialConditions.simDimensions[1] * worldXRatio, i * worldYRatio);
        }
        // Draw vertical lines
        for (let i = 0; i < simManager.simulation.initialConditions.simDimensions[1] + 1; i += 1) {
            thickness = (i % 4 == 0 ? gridLineThick : gridLineThin) / Math.pow(scaleFactor, gridLineScaleFactor);
            strokeWeight(thickness);
            line(i * worldXRatio, 0, i * worldXRatio, simManager.simulation.initialConditions.simDimensions[0] * worldYRatio);
        }
    }
    else {
        thickness = gridLineThick / Math.sqrt(scaleFactor, gridLineScaleFactor);
        strokeWeight(thickness);
        // Draw the horizontal lines
        for (let i = 0; i < simManager.simulation.initialConditions.simDimensions[0] + 1; i += 4) {
            line(0, i * worldYRatio, simManager.simulation.initialConditions.simDimensions[1] * worldXRatio, i * worldYRatio);
        }
        // Draw vertical lines
        for (let i = 0; i < simManager.simulation.initialConditions.simDimensions[1] + 1; i += 4) {
            line(i * worldXRatio, 0, i * worldXRatio, simManager.simulation.initialConditions.simDimensions[0] * worldYRatio);
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
}

document.getElementById("P5-DRAWING-CANVAS").onmouseleave = event => {
    mouseOnCanvas = false;
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

function mouseClicked() {
    if (mouseButton === LEFT) {
        // If the mouse was clicked on the canvas and we are seeing the full grid resolution
        // then we can determine which cell was clicked on by reversing the math done to draw the cell
        if (mouseOnCanvas && scaleFactor > scaleToShowGrid) {
            console.log(Math.floor(((mouseX - translateX) / worldXRatio) / scaleFactor));
            console.log(Math.floor(((mouseY - translateY) / worldYRatio) / scaleFactor));
        }
    }
}

// ------------------------
// Download Sim Function
// ------------------------

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
}

// ------------------------
// Import Simulation
// ------------------------

function importAndStart() {
    //currentSimTime is only 0 at the very beginning, so it can tell us if there has been a previously imported simulation
    if(simManager.simulation.currentSimTime == 0){
        console.log("importing new simulation...")

        //Create a promise for two reasons:
        //1.) Find a way to get startSim() to wait for the file to load
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
                    }
                } else {
                    reject("Invalid file type\nAcceptable File Type: .json");
                }
            })                    
        })

        //importPromise will wait to run until a resolve or reject has been established
        importPromise.then((message) => {
            startSim();
            console.log(message);                   
        }).catch((message) => {
            alert("::ERROR:: " + message);
        })
    } else {
        console.log("Resuming Sim...")
        startSim();
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
    console.log(simManager.simulation.simStatsData.toString(""));
}

function startSim() {
    simManager.start();
}

function pauseSim() {
    simManager.pause();
}

function setSpeedSingle() {
    simManager.setSingleStepMode();
}

function cancelSim() {

}