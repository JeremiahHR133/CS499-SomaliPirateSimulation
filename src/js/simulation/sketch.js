let simManager;
let frameTime = 0;

function setup() {
    // put setup code here
    createCanvas(screen.width, screen.height/2, document.getElementById("P5-DRAWING-CANVAS"));
    background(color(0, 0, 0));
    simManager = new SimManager();
    simManager.simulation.frames[simManager.simulation.currentFrameNumber].addEntity(new PirateShip(40, 50));
    simManager.simulation.frames[simManager.simulation.currentFrameNumber].addEntity(new PatrolShip(48, 48));
    simManager.simulation.frames[simManager.simulation.currentFrameNumber].addEntity(new CargoShip(40, 50));
}

function draw() {
    // put drawing code here
    simManager.tick();
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