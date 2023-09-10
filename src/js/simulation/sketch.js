let simulation;

function setup() {
    // put setup code here
    createCanvas(screen.width, screen.height/2, document.getElementById("P5-DRAWING-CANVAS"));
    background(color(0, 0, 0));
    simulation = new Simulation();
    console.log(simulation.initialConditions.getInitCellAtIndex(98, 350).getIndexAsString());
}

function draw() {
    // put drawing code here
}