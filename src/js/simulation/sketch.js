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

function preload() {
    bgImage = loadImage("images/gulfofaden.png");
    cargoImage = loadImage("images/cargo.png");
    patrolImage = loadImage("images/warship2.png");
    pirateImage = loadImage("images/pirate.png");
    captureImage = loadImage("images/capture.png");
}

function setup() {
    // put setup code here
    createCanvas(screen.width, screen.width / 3, document.getElementById("P5-DRAWING-CANVAS"));
    background(0, 0, 0);
    simManager = new SimManager();
    worldXRatio = screen.width / simManager.simulation.initialConditions.simDimensions[1];
    worldYRatio = (screen.width / 3) / simManager.simulation.initialConditions.simDimensions[0];
}

function draw() {
    simManager.tick();

    // Manage zooming relative to the mouse and panning
    lockToViewport();
    translate(translateX, translateY);
    scale(scaleFactor);

    // Draw the map
    imageMode(CORNER);
    image(bgImage, 0, 0, screen.width, screen.width / 3);

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
    if (translateX < screen.width * (1 - scaleFactor)) {
        translateX = screen.width * (1 - scaleFactor);
    }
    if (translateY < (screen.width / 3) * (1 - scaleFactor)) {
        translateY = (screen.width / 3) * (1 - scaleFactor);
    }
}

function mouseWheel(event) {
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