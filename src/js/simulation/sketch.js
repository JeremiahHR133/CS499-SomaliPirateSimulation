let simulation;
let frameTime = 0;

function setup() {
    // put setup code here
    createCanvas(screen.width, screen.height/2, document.getElementById("P5-DRAWING-CANVAS"));
    background(color(0, 0, 0));
    simulation = new Simulation();
    simulation.frames[simulation.currentFrameNumber].addEntity(new CargoShip(0, 50));
    //console.log(simulation.initialConditions.getInitCellAtIndex(98, 350).getIndexAsString());
    simulation.tick();
    simulation.tick();
    simulation.tick();
    simulation.tick();
    console.log(simulation.toString("   "));
}

function draw() {
    // put drawing code here
    if (performance.now() - frameTime > 1000){
        frameTime = performance.now();

    }
}