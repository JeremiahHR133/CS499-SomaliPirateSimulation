let simulation;

function setup() {
    // put setup code here
    createCanvas(400, 400, document.getElementById("P5-DRAWING-CANVAS"));
    background(color(0, 0, 0));
    simulation = new Simulation();
    //console.log(simulation.initialConditions.getInitCellAtIndex(98, 350).getIndexAsString());
    simulation.tick();
    console.log(simulation.toString("   "));
}

function draw() {
    // put drawing code here
}