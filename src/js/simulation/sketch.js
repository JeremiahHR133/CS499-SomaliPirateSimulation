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
    simManager.simulation.frames[simManager.simulation.currentFrameNumber].addEntity(new PirateShip(40, 50));
    simManager.simulation.frames[simManager.simulation.currentFrameNumber].addEntity(new PatrolShip(48, 48));
    simManager.simulation.frames[simManager.simulation.currentFrameNumber].addEntity(new CargoShip(40, 50));
}

function draw() {
    simManager.tick();
    // put drawing code here
    background(0, 0, 0);

    lockToViewport();

    // Manage zooming relative to the mouse and panning
    translate(translateX, translateY);
    scale(scaleFactor);

    image(bgImage, 0, 0, screen.width, screen.width / 3);

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