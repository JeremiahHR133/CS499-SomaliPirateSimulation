// Simulation object instance
let simManager;

// Images
let bgImage;
let cargoImage;
let patrolImage;
let pirateImage;
let captureImage;

// Graphics variables
let scaleFactor = 1;
let translateX = 0, translateY = 0;
let worldXRatio, worldYRatio;
let canvasWidth, canvasHeight;
let mouseOnCanvas = false;
let defaultImageSize;
let scaleToShowGrid = 3.5;

function preload() {
    bgImage = loadImage("images/gulfofaden.png");
    cargoImage = loadImage("images/cargo.png");
    patrolImage = loadImage("images/warship2.png");
    pirateImage = loadImage("images/pirate.png");
    captureImage = loadImage("images/capture.png");
}

function setup() {
    // put setup code here
    canvasWidth = screen.width;
    canvasHeight = screen.width / 4;

    // Meant to have 40 pixels on a 1920 x 1080 screen
    defaultImageSize = 40 * (screen.width / 1920);

    createCanvas(canvasWidth, canvasHeight, document.getElementById("P5-DRAWING-CANVAS"));
    background(0, 0, 0);

    simManager = new SimManager();

    worldXRatio = canvasWidth / simManager.simulation.initialConditions.simDimensions[1];
    worldYRatio = canvasHeight / simManager.simulation.initialConditions.simDimensions[0];
}

function draw() {
    simManager.tick();

    // Manage zooming relative to the mouse and panning
    lockToViewport();
    translate(translateX, translateY);
    scale(scaleFactor);

    // Draw the map
    imageMode(CORNER);
    image(bgImage, 0, 0, canvasWidth, canvasHeight);

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
            defaultImageSize / scaleFactor, defaultImageSize / scaleFactor);
    });
    frame.patrolList.forEach(patrol => {
        image(patrolImage,
            patrol.xPos * worldXRatio + (worldXRatio / 2),
            patrol.yPos * worldYRatio + (worldYRatio / 2),
            defaultImageSize / scaleFactor, defaultImageSize / scaleFactor);
    });
    frame.pirateList.forEach(pirate => {
        image(pirateImage,
            pirate.xPos * worldXRatio + (worldXRatio / 2),
            pirate.yPos * worldYRatio + (worldYRatio / 2),
            defaultImageSize / scaleFactor, defaultImageSize / scaleFactor);
    });
    frame.captureList.forEach(capture => {
        image(captureImage,
            capture.xPos * worldXRatio + (worldXRatio / 2),
            capture.yPos * worldYRatio + (worldYRatio / 2),
            defaultImageSize / scaleFactor, defaultImageSize / scaleFactor);
    });
}

function drawGridLines() {
    stroke(0, 0, 0);
    if (scaleFactor > scaleToShowGrid) {
        strokeWeight(0.4);
        // Draw the grid
        // Draw the horizontal lines
        for (let i = 0; i < simManager.simulation.initialConditions.simDimensions[0] + 1; i += 1) {
            if (i % 4 == 0) {
                strokeWeight(1);
            }
            else {
                strokeWeight(0.4);
            }
            line(0, i * worldYRatio, simManager.simulation.initialConditions.simDimensions[1] * worldXRatio, i * worldYRatio);
        }
        // Draw vertical lines
        for (let i = 0; i < simManager.simulation.initialConditions.simDimensions[1] + 1; i += 1) {
            if (i % 4 == 0) {
                strokeWeight(1);
            }
            else {
                strokeWeight(0.4);
            }
            line(i * worldXRatio, 0, i * worldXRatio, simManager.simulation.initialConditions.simDimensions[0] * worldYRatio);
        }
    }
    else {
        strokeWeight(1);
        // Draw the grid
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
    if (!mouseOnCanvas) {
        return;
    }

    let s = event.delta > 0 ? 0.95 : 1.05;

    scaleFactor *= s;

    if (scaleFactor < 1) {
        scaleFactor = 1;
        return;
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