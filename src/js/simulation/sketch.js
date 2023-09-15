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

    // Draw the grid
    // Draw the horizontal lines
    stroke(0, 0, 0);
    for (let i = 0; i < simManager.simulation.initialConditions.simDimensions[0] + 1; i++) {
        line(0, i * worldYRatio, simManager.simulation.initialConditions.simDimensions[1] * worldXRatio, i * worldYRatio);
    }
    // Draw vertical lines
    for (let i = 0; i < simManager.simulation.initialConditions.simDimensions[1] + 1; i++) {
        line(i * worldXRatio, 0, i * worldXRatio, simManager.simulation.initialConditions.simDimensions[0] * worldYRatio);
    }

    // Draw all the entities
    imageMode(CENTER);
    let frame = simManager.simulation.getCurrentFrame();
    frame.cargoList.forEach(cargo => {
        image(cargoImage, cargo.xPos * worldXRatio, cargo.yPos * worldYRatio, 30, 30);
    });
    frame.patrolList.forEach(patrol => {
        image(patrolImage, patrol.xPos * worldXRatio, patrol.yPos * worldYRatio, 30, 30);
    });
    frame.pirateList.forEach(pirate => {
        image(pirateImage, pirate.xPos * worldXRatio, pirate.yPos * worldYRatio, 30, 30);
    });
    frame.captureList.forEach(capture => {
        image(captureImage, capture.xPos * worldXRatio, capture.yPos * worldYRatio, 30, 30);
    });
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