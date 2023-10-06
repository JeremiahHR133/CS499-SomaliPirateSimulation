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
            document.getElementsByName("dayRowNumber").values().next().value.innerHTML = "";
            document.getElementsByName("dayColumnNumber").values().next().value.innerHTML = "";
            document.getElementsByName("nightRowNumber").values().next().value.innerHTML = "";
            document.getElementsByName("nightColumnNumber").values().next().value.innerHTML = "";
            document.getElementsByName("normColumnNumber").values().next().value.innerHTML = "";
            document.getElementsByName("normRowNumber").values().next().value.innerHTML = "";
            var checkedValue = simManager.simulation.initialConditions.considerDayNight;
            if(checkedValue){
                document.getElementsByName("dayRowNumber").values().next().value.innerHTML = Math.floor(((mouseY - translateY) / worldYRatio) / scaleFactor);
                document.getElementsByName("dayColumnNumber").values().next().value.innerHTML = Math.floor(((mouseX - translateX) / worldXRatio) / scaleFactor);
                document.getElementsByName("nightRowNumber").values().next().value.innerHTML = Math.floor(((mouseY - translateY) / worldYRatio) / scaleFactor);
                document.getElementsByName("nightColumnNumber").values().next().value.innerHTML = Math.floor(((mouseX - translateX) / worldXRatio) / scaleFactor);
                if(document.getElementsByName("dayColumnNumber").values().next().value.innerHTML == 0 && document.getElementsByName("dayRowNumber").values().next().value.innerHTML == 99){
                    const myDayNode = document.getElementById("dayCornerBoatSelect");
                    while (myDayNode.firstChild) {
                      myDayNode.removeChild(myDayNode.lastChild);
                    }
                    const myNightNode = document.getElementById("nightCornerBoatSelect");
                    while (myNightNode.firstChild) {
                      myNightNode.removeChild(myNightNode.lastChild);
                    }
                    let child1daynew = document.createElement("option");
                    let child1nightnew = document.createElement("option");
                    child1daynewtext = document.createTextNode("Cargo");
                    child1nightnewtext = document.createTextNode("Cargo");
                    child1daynew.appendChild(child1daynewtext);
                    child1nightnew.appendChild(child1nightnewtext);
                    child1daynew.value = "cargo";
                    child1nightnew.value = "cargo";
                    let child2daynew = document.createElement("option");
                    let child2nightnew = document.createElement("option");
                    child2daynewtext = document.createTextNode("Pirate");
                    child2nightnewtext = document.createTextNode("Pirate");
                    child2daynew.appendChild(child2daynewtext);
                    child2nightnew.appendChild(child2nightnewtext);
                    child2daynew.value = "pirate";
                    child2nightnew.value = "pirate";
                    document.getElementById("dayCornerBoatSelect").appendChild(child1daynew);
                    document.getElementById("dayCornerBoatSelect").appendChild(child2daynew);
                    document.getElementById("nightCornerBoatSelect").appendChild(child1nightnew);
                    document.getElementById("nightCornerBoatSelect").appendChild(child2nightnew);
                }
                if(document.getElementsByName("dayColumnNumber").values().next().value.innerHTML == 399 && document.getElementsByName("dayRowNumber").values().next().value.innerHTML == 99){
                    const myDayNode = document.getElementById("dayCornerBoatSelect");
                    while (myDayNode.firstChild) {
                      myDayNode.removeChild(myDayNode.lastChild);
                    }
                    const myNightNode = document.getElementById("nightCornerBoatSelect");
                    while (myNightNode.firstChild) {
                      myNightNode.removeChild(myNightNode.lastChild);
                    }
                    let child1daynew = document.createElement("option");
                    let child1nightnew = document.createElement("option");
                    child1daynewtext = document.createTextNode("Patrol");
                    child1nightnewtext = document.createTextNode("Patrol");
                    child1daynew.appendChild(child1daynewtext);
                    child1nightnew.appendChild(child1nightnewtext);
                    child1daynew.value = "patrol";
                    child1nightnew.value = "patrol";
                    let child2daynew = document.createElement("option");
                    let child2nightnew = document.createElement("option");
                    child2daynewtext = document.createTextNode("Pirate");
                    child2nightnewtext = document.createTextNode("Pirate");
                    child2daynew.appendChild(child2daynewtext);
                    child2nightnew.appendChild(child2nightnewtext);
                    child2daynew.value = "pirate";
                    child2nightnew.value = "pirate";
                    document.getElementById("dayCornerBoatSelect").appendChild(child1daynew);
                    document.getElementById("dayCornerBoatSelect").appendChild(child2daynew);
                    document.getElementById("nightCornerBoatSelect").appendChild(child1nightnew);
                    document.getElementById("nightCornerBoatSelect").appendChild(child2nightnew);
                }
            }
            else{
                document.getElementsByName("normColumnNumber").values().next().value.innerHTML = Math.floor(((mouseX - translateX) / worldXRatio) / scaleFactor);
                document.getElementsByName("normRowNumber").values().next().value.innerHTML = Math.floor(((mouseY - translateY) / worldYRatio) / scaleFactor);
                if(document.getElementsByName("normColumnNumber").values().next().value.innerHTML == 0 && document.getElementsByName("normRowNumber").values().next().value.innerHTML == 99){
                    const myNode = document.getElementById("normCornerBoatSelect");
                    while (myNode.firstChild) {
                      myNode.removeChild(myNode.lastChild);
                    }
                    let child1new = document.createElement("option");
                    child1newtext = document.createTextNode("Cargo");
                    child1new.appendChild(child1newtext);
                    child1new.value = "cargo";
                    let child2new = document.createElement("option");
                    child2newtext = document.createTextNode("Pirate");
                    child2new.appendChild(child2newtext);
                    child2new.value = "pirate";
                    document.getElementById("normCornerBoatSelect").appendChild(child1new);
                    document.getElementById("normCornerBoatSelect").appendChild(child2new);
                }
                if(document.getElementsByName("normColumnNumber").values().next().value.innerHTML == 399 && document.getElementsByName("normRowNumber").values().next().value.innerHTML == 99){
                    const myNode = document.getElementById("normCornerBoatSelect");
                    while (myNode.firstChild) {
                      myNode.removeChild(myNode.lastChild);
                    }
                    let child1new = document.createElement("option");
                    child1newtext = document.createTextNode("Patrol");
                    child1new.appendChild(child1newtext);
                    child1new.value = "patrol";
                    let child2new = document.createElement("option");
                    child2newtext = document.createTextNode("Pirate");
                    child2new.appendChild(child2newtext);
                    child2new.value = "pirate";
                    document.getElementById("normCornerBoatSelect").appendChild(child1new);
                    document.getElementById("normCornerBoatSelect").appendChild(child2new);
                }
            }
            
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
    console.log(document.getElementById("normCornerBoatSelect").value);
    console.log(simManager.simulation.initialConditions.cargoSpawn)
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
    console.log(simManager.simulation.initialConditions.nightCargoProbs.toString());
    console.log(simManager.simulation.initialConditions.nightPatrolProbs.toString());
    console.log(simManager.simulation.initialConditions.nightPirateProbs.toString());

}

function DNtoggle(){
    if($("#DNToggle").is(":checked")){
        simManager.simulation.initialConditions.considerDayNight = true
    }
    else{
        simManager.simulation.initialConditions.considerDayNight = true
    }
}