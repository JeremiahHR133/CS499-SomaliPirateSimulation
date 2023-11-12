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

        // Default probabilities for day spawn
        this.dayCargoSpawn = 0.5;
        this.dayPatrolSpawn = 0.25;
        this.dayPirateSpawn = 0.4;

        // Default probabilities for night spawn
        this.nightCargoSpawn = 0.5;
        this.nightPatrolSpawn = 0.25;
        this.nightPirateSpawn = 0.4;

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
        this.totalInputCellProb = obj.totalInputCellProb;
        // Default probabilities for spawn
        this.dayCargoSpawn = obj.cargoSpawn;
        this.dayPatrolSpawn = obj.patrolSpawn;
        this.dayPirateSpawn = obj.pirateSpawn;

        // Day probs
        for (let i = 0; i < this.dayCargoProbs.length; i++) {
            const probabilityCell = this.dayCargoProbs[i];
            probabilityCell.importFromJSON(obj.dayCargoProbs[i]);
        }
        for (let i = 0; i < this.dayPatrolProbs.length; i++) {
            const probabilityCell = this.dayPatrolProbs[i];
            probabilityCell.importFromJSON(obj.dayPatrolProbs[i]);
        }
        for (let i = 0; i < this.dayPirateProbs.length; i++) {
            const probabilityCell = this.dayPirateProbs[i];
            probabilityCell.importFromJSON(obj.dayPirateProbs[i]);
        }

        // Night probs
        for (let i = 0; i < this.nightCargoProbs.length; i++) {
            const probabilityCell = this.nightCargoProbs[i];
            probabilityCell.importFromJSON(obj.nightCargoProbs[i]);
        }
        for (let i = 0; i < this.nightPatrolProbs.length; i++) {
            const probabilityCell = this.nightPatrolProbs[i];
            probabilityCell.importFromJSON(obj.nightPatrolProbs[i]);
        }
        for (let i = 0; i < this.nightPirateProbs.length; i++) {
            const probabilityCell = this.nightPirateProbs[i];
            probabilityCell.importFromJSON(obj.nightPirateProbs[i]);
        }
    }

    //
    //Talk with Jere
    //Do we need to reload the cell probability using ProbabilityCell() like in the constructor?
    //

    toString(indent) {
        let ret = indent + "Sim run time      : " + this.simRunTime + " minutes\n";
        ret += indent + "Sim time step     : " + this.simTimeStep + " minutes\n";
        ret += indent + "Sim dimensions    : [" + this.simDimensions[0] + ", " + this.simDimensions[1] + "]" + "\n";
        ret += indent + "Consider daylight : " + this.considerDayNight + "\n";
        return ret;
    }
}


class Simulation {
    constructor() {
        this.initialConditions = new InitSimData();
        this.currentSimTime = 0;
        this.currentFrameNumber = 0;
        this.simOver = false;
        this.frames = []; // Stores all the frames generated by the simulation so far
        this.frames.push(new Frame(this.currentSimTime)); // Create an initial frame at time 0 with no entities
    }

    importFromJSON(obj){
        this.currentSimTime = obj.currentSimTime;
        this.currentFrameNumber = obj.currentFrameNumber;
        this.simOver = true;

        this.frames = [];
        obj.frames.forEach(frame => {
            let fr = new Frame(frame.frameTime, frame.isDayFrame);
            fr.importFromJSON(frame);
            this.frames.push(fr);
        });

        this.initialConditions.importFromJSON(obj.initialConditions);
    }

    // Flow of tick() function should be:
    //  (1) Create a new frame from the previous frame (copy existing entities)
    //  (2) Spawn new entities into the frame (such that after a tick they will "move into the map")
    //  (3) Tick the new frame 
    //  (4) Save the ticked frame to the frame list
    tick() {
        if (this.simOver) {
            return;
        }

        this.currentSimTime += this.initialConditions.simTimeStep;
        this.currentFrameNumber += 1;
        let isDay = !(this.initialConditions.considerDayNight && this.currentSimTime % (24 * 60) > (12 * 60));
        // (1)
        let newFrame = new Frame(this.currentSimTime, isDay, this.frames[this.currentFrameNumber - 1]);
        // (2)
        if(isDay == true){
            this.trySpawnEntity(newFrame, "Cargo", this.initialConditions.dayCargoSpawn, this.initialConditions.dayCargoProbs);
            this.trySpawnEntity(newFrame, "Pirate", this.initialConditions.dayPirateSpawn, this.initialConditions.dayPirateProbs);
            this.trySpawnEntity(newFrame, "Patrol", this.initialConditions.dayPatrolSpawn, this.initialConditions.dayPatrolProbs);
        }
        else{
            this.trySpawnEntity(newFrame, "Cargo", this.initialConditions.nightCargoSpawn, this.initialConditions.nightCargoProbs);
            this.trySpawnEntity(newFrame, "Pirate", this.initialConditions.nightPirateSpawn, this.initialConditions.nightPirateProbs);
            this.trySpawnEntity(newFrame, "Patrol", this.initialConditions.nightPatrolSpawn, this.initialConditions.nightPatrolProbs);
        }
        // (3)
        newFrame.tick([0, this.initialConditions.simDimensions[1]], [0, this.initialConditions.simDimensions[0]]);
        // (4)
        this.frames.push(newFrame);

        this.simOver = this.currentSimTime == this.initialConditions.simRunTime;
        return this.simOver;
    }

    nextReplayFrame(reverse) {
        if (reverse) {
            if (this.currentFrameNumber > 0) {
                this.currentFrameNumber--;
            }
        }
        else {
            if (this.currentFrameNumber + 1 < this.frames.length) {
                this.currentFrameNumber++;
            }
        }
    }

    setReplayToStart() {
        //Updated from 0 to 1 to determine if new sim or not
        this.currentSimTime = 1;
        this.currentFrameNumber = 1;
    }

    cancelSim() {
        this.simOver = true;
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
                        frame.simStatsData.cargosEntered += 1;
                        frame.addEntity(new CargoShip(0 - ShipMoveDirections.Cargo[0], index));
                    }
                    else if (shipType == "Patrol") {
                        frame.simStatsData.patrolsEntered += 1;
                        frame.addEntity(new PatrolShip(this.initialConditions.simDimensions[1] - 1 - ShipMoveDirections.Patrol[0], index));
                    }
                    else if (shipType == "Pirate") {
                        frame.simStatsData.piratesEntered += 1;
                        frame.addEntity(new PirateShip(index, this.initialConditions.simDimensions[0] - 1 - ShipMoveDirections.Pirate[1]));
                    }
                    return;
                }
                sum += cell.probability;
                index += 1;
            }
        }
    }
}