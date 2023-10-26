// Version of a cell that only contains the probability data.
// Since this data is constant after sim start it goes under the init category
class ProbabilityCell {
    constructor(index, prob) {
        this.index = index;
        this.probability = prob;

        this.modifiedByUser = false;
    }

    importFromJSON(obj){
        this.index = obj.index;
        this.probability = obj.probability;

        this.modifiedByUser = obj.modifiedByUser;
    }
}

// This class holds any data that is constant for the duration of the simulation after
// it has been started.
class InitSimData {
    constructor() {
        this.simRunTime = 24 * 60; // Specified in minutes
        this.simTimeStep = 5;      // Specified in minutes
        this.simDimensions = [100, 400]; // 100 rows by 400 columns 
        this.considerDayNight = false; // Specifies if individual day / night settings should be used
        this.totalInputCellProb = 0;

        // Default probabilities for spawn
        this.cargoSpawn = 0.5;
        this.patrolSpawn = 0.25;
        this.pirateSpawn = 0.4;

        // Probability lists
        this.dayCargoProbs = [];
        this.dayPatrolProbs = [];
        this.dayPirateProbs = [];

        this.nightCargoProbs = [];
        this.nightPatrolProbs = [];
        this.nightPirateProbs = [];

        // Initializing probabilities with all cells equaly likely
        // Cargos enter from the left
        for (let i = 0; i < this.simDimensions[0]; i++) {
            this.dayCargoProbs.push(new ProbabilityCell(i, 1 / this.simDimensions[0]))
        }
        // Patrols enter from the right
        for (let i = 0; i < this.simDimensions[0]; i++) {
            this.dayPatrolProbs.push(new ProbabilityCell(i, 1 / this.simDimensions[0]))
        }
        // Pirates enter from the bottom
        for (let i = 0; i < this.simDimensions[1]; i++) {
            this.dayPirateProbs.push(new ProbabilityCell(i, 1 / this.simDimensions[1]))
        }
        for (let i = 0; i < this.simDimensions[0]; i++) {
            this.nightCargoProbs.push(new ProbabilityCell(i, 1 / this.simDimensions[0]))
        }
        // Patrols enter from the right
        for (let i = 0; i < this.simDimensions[0]; i++) {
            this.nightPatrolProbs.push(new ProbabilityCell(i, 1 / this.simDimensions[0]))
        }
        // Pirates enter from the bottom
        for (let i = 0; i < this.simDimensions[1]; i++) {
            this.nightPirateProbs.push(new ProbabilityCell(i, 1 / this.simDimensions[1]));
        }
    }

    importFromJSON(obj){
        this.simRunTime = obj.simRunTime; // Specified in minutes
        this.simTimeStep = obj.simTimeStep;      // Specified in minutes
        this.simDimensions = obj.simDimensions; // 100 rows by 400 columns 
        this.considerDayNight = obj.considerDayNight; // Specifies if individual day / night settings should be used

        // Default probabilities for spawn
        this.cargoSpawn = obj.cargoSpawn;
        this.patrolSpawn = obj.patrolSpawn;
        this.pirateSpawn = obj.pirateSpawn;

        for (let i = 0; i < this.cargoProbs.length; i++) {
            const probabilityCell = this.cargoProbs[i];
            probabilityCell.importFromJSON(obj.cargoProbs[i]);
        }

        for (let i = 0; i < this.patrolProbs.length; i++) {
            const probabilityCell = this.patrolProbs[i];
            probabilityCell.importFromJSON(obj.patrolProbs[i]);
        }

        for (let i = 0; i < this.pirateProbs.length; i++) {
            const probabilityCell = this.pirateProbs[i];
            probabilityCell.importFromJSON(obj.pirateProbs[i]);
        }
    }

    toString(indent) {
        let ret = indent + "Sim run time      : " + this.simRunTime + " minutes\n";
        ret += indent + "Sim time step     : " + this.simTimeStep + " minutes\n";
        ret += indent + "Sim dimensions    : [" + this.simDimensions[0] + ", " + this.simDimensions[1] + "]" + "\n";
        ret += indent + "Consider daylight : " + this.considerDayNight + "\n";
        return ret;
    }
}

class SimStatsData {
    constructor() {
        // Entering and exiting
        this.cargosEntered = 0;
        this.cargosExited = 0;
        this.patrolsEntered = 0;
        this.patrolsExited = 0;
        this.piratesEntered = 0;
        this.piratesExited = 0;
        this.capturesExited = 0;
        // Action recording
        this.piratesDefeated = 0;
        this.cargosCaptured = 0; 
        this.capturesRescued = 0;
        this.evadesNotCaptured = 0;
        this.evadesCaptured = 0;
    }

    importFromJSON(obj){
        this.cargosEntered = obj.cargosEntered;
        this.cargosExited = obj.cargosExited;
        this.partrolsEntered = obj.partrolsEntered;
        this.patrolsExited = obj.patrolsExited;
        this.piratesEntered = obj.piratesEntered;
        this.piratesExited = obj.piratesExited;
        this.capturesExited = obj.capturesExited;
        // Action recording
        this.piratesDefeated = obj.piratesDefeated;
        this.cargosCaptured = obj.cargosCaptured; 
        this.capturesRescued = obj.capturesRescued;
        this.evadesNotCaptured = obj.evadesNotCaptured;
        this.evadesCaptured = obj.evadesCaptured;
    }

    toString(indent) {
        let ret = indent + "=== Sim Stats Data ===\n";
        ret += indent + "Enter and Exit: \n";
        ret += indent + "   " + "Cargos Entered   : " + this.cargosEntered + "\n";
        ret += indent + "   " + "Cargos Exited    : " + this.cargosExited + "\n";
        ret += indent + "   " + "Patrols Entered  : " + this.patrolsEntered + "\n";
        ret += indent + "   " + "Patrols Exited   : " + this.patrolsExited + "\n";
        ret += indent + "   " + "Pirates Entered  : " + this.piratesEntered + "\n";
        ret += indent + "   " + "Pirates Exited   : " + this.piratesExited + "\n";
        ret += indent + "   " + "Captures Exited  : " + this.capturesExited + "\n";
        ret += indent + "Actions: \n";
        ret += indent + "   " + "Pirates Defeated : " + this.piratesDefeated + "\n";
        ret += indent + "   " + "Cargos Captured  : " + this.cargosCaptured + "\n";
        ret += indent + "   " + "Captures Rescued : " + this.capturesRescued + "\n";
        ret += indent + "   " + "Evades Not Cap.  : " + this.evadesNotCaptured + "\n";
        ret += indent + "   " + "Evades Captured  : " + this.evadesCaptured + "\n";
        return ret;
    }
}

class Simulation {
    constructor() {
        this.initialConditions = new InitSimData();
        this.simStatsData = new SimStatsData();
        this.currentSimTime = 0;
        this.currentFrameNumber = 0;
        this.frames = []; // Stores all the frames generated by the simulation so far
        this.frames.push(new Frame(this.currentSimTime)); // Create an initial frame at time 0 with no entities
    }

    importFromJSON(obj){
        this.currentSimTime = obj.currentSimTime;
        this.currentFrameNumber = obj.currentFrameNumber;

        this.frames = [];
        obj.frames.forEach(frame => {
            let fr = new Frame(frame.frameTime);
            fr.importFromJSON(frame);
            this.frames.push(fr);
        });

        this.initialConditions.importFromJSON(obj.initialConditions);
        this.simStatsData.importFromJSON(obj.simStatsData);
    }

    // Flow of tick() function should be:
    //  (1) Create a new frame from the previous frame (copy existing entities)
    //  (2) Spawn new entities into the frame (such that after a tick they will "move into the map")
    //  (3) Tick the new frame 
    //  (4) Save the ticked frame to the frame list
    tick() {
        this.currentSimTime += this.initialConditions.simTimeStep;
        this.currentFrameNumber += 1;
        let isDay = this.initialConditions.considerDayNight && this.currentSimTime % (24 * 60) > (12 * 60) ? false : true;
        // (1)
        let newFrame = new Frame(this.currentSimTime, isDay, this.frames[this.currentFrameNumber - 1]);
        // (2)
        if(isDay == true){
            this.trySpawnEntity(newFrame, "Cargo", this.initialConditions.cargoSpawn, this.initialConditions.dayCargoProbs);
            this.trySpawnEntity(newFrame, "Pirate", this.initialConditions.pirateSpawn, this.initialConditions.dayPirateProbs);
            this.trySpawnEntity(newFrame, "Patrol", this.initialConditions.patrolSpawn, this.initialConditions.dayPatrolProbs);
        }
        else{
            this.trySpawnEntity(newFrame, "Cargo", this.initialConditions.cargoSpawn, this.initialConditions.nightCargoProbs);
            this.trySpawnEntity(newFrame, "Pirate", this.initialConditions.pirateSpawn, this.initialConditions.nightPirateProbs);
            this.trySpawnEntity(newFrame, "Patrol", this.initialConditions.patrolSpawn, this.initialConditions.nightPatrolProbs);
        }
        // (3)
        newFrame.tick(this.simStatsData, [0, this.initialConditions.simDimensions[1]], [0, this.initialConditions.simDimensions[0]]);
        // (4)
        this.frames.push(newFrame);
    }

    isDayTime() {
        if(this.currentFrameNumber == 0) {
            return true;
        }
        return this.frames[this.currentFrameNumber].isDayFrame;
    }

    getCurrentFrame() {
        return this.frames[this.currentFrameNumber];
    }

    toString() {
        let ret = "=== Sim Data (without initial cond. cells) ===\n";
        ret += "\t" + "Current Sim Time    : " + this.currentSimTime + " minutes \n";
        ret += "\t" + "Current Frame Number: " + this.currentFrameNumber + "\n";
        ret += "\t" + "Initial Conditions  :\n";
        ret += this.initialConditions.toString("\t" + "\t");
        ret += "\t" + "Frames: \n";
        this.frames.forEach(frame => {
            ret += frame.toString("\t" + "\t");
            ret += "\n";
        });
        return ret;
    }

    trySpawnEntity(frame, shipType, spawnProb, cellList) {
        if (Math.random() < spawnProb) {
            let rand = Math.random();
            let sum = 0;
            let index = 0;
            for (let i = 0; i < cellList.length; i++) {
                const cell = cellList[i];
                if (cell.probability + sum >= rand) {
                    if (shipType == "Cargo") {
                        this.simStatsData.cargosEntered += 1;
                        frame.addEntity(new CargoShip(0 - ShipMoveDirections.Cargo[0], index));
                    }
                    else if (shipType == "Patrol") {
                        this.simStatsData.patrolsEntered += 1;
                        frame.addEntity(new PatrolShip(this.initialConditions.simDimensions[1] - ShipMoveDirections.Patrol[0], index));
                    }
                    else if (shipType == "Pirate") {
                        this.simStatsData.piratesEntered += 1;
                        frame.addEntity(new PirateShip(index, this.initialConditions.simDimensions[0] - ShipMoveDirections.Pirate[1]));
                    }
                    return;
                }
                sum += cell.probability;
                index += 1;
            }
        }
    }
}