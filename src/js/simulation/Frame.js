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
        this.patrolsEntered = obj.patrolsEntered;
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

class Frame {
    // Coppy constructor of sorts
    constructor(frameTime, isDayFrame, oldFrame) {
        this.frameTime = frameTime;
        this.isDayFrame = isDayFrame;
        this.cargoList = [];
        this.patrolList = [];
        this.pirateList = [];
        this.captureList = [];
        this.simStatsData = new SimStatsData();
        if (oldFrame instanceof Frame) {
            oldFrame.cloneEntityList(this);
            oldFrame.cloneStatsData(this.simStatsData);
            // console.log(this.simStatsData.toString("   "));
        }
    }

    importFromJSON(obj){
        this.frameTime = obj.frameTime;
        this.isDayFrame = obj.isDayFrame;

        this.cargoList = [];
        obj.cargoList.forEach(cargoShip => {
            this.cargoList.push(new CargoShip(cargoShip.xPos, cargoShip.yPos, cargoShip.UniqueID));            
        });

        this.patrolList = [];
        obj.patrolList.forEach(patrolShip => {
            this.patrolList.push(new PatrolShip(patrolShip.xPos, patrolShip.yPos, patrolShip.UniqueID));            
        });

        this.pirateList = [];
        obj.pirateList.forEach(pirateShip => {
            this.pirateList.push(new PirateShip(pirateShip.xPos, pirateShip.yPos, pirateShip.UniqueID));            
        });

        this.captureList = [];
        obj.captureList.forEach(captureShip => {
            this.captureList.push(new CaptureShip(captureShip.xPos, captureShip.yPos, captureShip.UniqueID, captureShip.pirateUID));            
        });

        //
        //Talk with Jere
        //What needs to be done about old frame? Import works perfectly fine without it
        //


        this.simStatsData.importFromJSON(obj.simStatsData);
    }

    cloneEntityList(newFrame) {
        this.cargoList.forEach(ship => {
            newFrame.cargoList.push(ship.clone());
        });
        this.patrolList.forEach(ship => {
            newFrame.patrolList.push(ship.clone());
        });
        this.pirateList.forEach(ship => {
            newFrame.pirateList.push(ship.clone());
        });
        this.captureList.forEach(ship => {
            newFrame.captureList.push(ship.clone());
        });
    }

    cloneStatsData(newData) {
        newData.cargosEntered  = this.simStatsData.cargosEntered;
        newData.cargosExited   = this.simStatsData.cargosExited;
        newData.patrolsEntered = this.simStatsData.patrolsEntered;
        newData.patrolsExited  = this.simStatsData.patrolsExited;
        newData.piratesEntered = this.simStatsData.piratesEntered;
        newData.piratesExited  = this.simStatsData.piratesExited;
        newData.capturesExited = this.simStatsData.capturesExited;
        
        newData.piratesDefeated   = this.simStatsData.piratesDefeated;
        newData.cargosCaptured    = this.simStatsData.cargosCaptured; 
        newData.capturesRescued   = this.simStatsData.capturesRescued;
        newData.evadesNotCaptured = this.simStatsData.evadesNotCaptured;
        newData.evadesCaptured    = this.simStatsData.evadesCaptured;
    }

    removeEntity(ent) {
        this.cargoList = this.cargoList.filter(cargo => !cargo.equal(ent));
        this.patrolList = this.patrolList.filter(patrol => !patrol.equal(ent));
        this.pirateList = this.pirateList.filter(pirate => !pirate.equal(ent));
        this.captureList = this.captureList.filter(capture => !capture.equal(ent));
    }

    convertCaptureToCargo(capture) {
        this.removeEntity(capture.pirateUID);
        this.removeEntity(capture);
        this.addEntity(new CargoShip(capture.xPos, capture.yPos, capture.UniqueID));
    }

    convertCargoToCapture(cargo, pirate) {
        this.removeEntity(cargo);
        this.addEntity(new CaptureShip(cargo.xPos, cargo.yPos, cargo.UniqueID, pirate.UniqueID));
    }

    addEntity(ent) {
        if (ent instanceof CargoShip) {
            this.cargoList.push(ent);
        }
        else if (ent instanceof PatrolShip) {
            this.patrolList.push(ent);
        }
        else if (ent instanceof PirateShip) {
            this.pirateList.push(ent);
        }
        else if (ent instanceof CaptureShip) {
            this.captureList.push(ent);
        }
    }

    pruneEntitiesOutsideRange(xRange, yRange) {
        this.cargoList = this.cargoList.filter((elem) => elem.inMapRange(xRange, yRange));
        this.patrolList = this.patrolList.filter((elem) => elem.inMapRange(xRange, yRange));
        this.pirateList = this.pirateList.filter((elem) => elem.inMapRange(xRange, yRange));
        this.captureList = this.captureList.filter((elem) => elem.inMapRange(xRange, yRange));
    }

    recordExitStatistics(simStatsData, xRange, yRange) {
        this.cargoList.forEach(cargo => {
            if (!cargo.inMapRange(xRange, yRange)) {
                simStatsData.cargosExited += 1;
            }
        });
        this.patrolList.forEach(patrol => {
            if (!patrol.inMapRange(xRange, yRange)) {
                simStatsData.patrolsExited += 1;
            }
        });
        this.pirateList.forEach(pirate => {
            if (!pirate.inMapRange(xRange, yRange)) {
                simStatsData.piratesExited += 1;
            }
        });
        this.captureList.forEach(capture => {
            if (!capture.inMapRange(xRange, yRange)) {
                simStatsData.capturesExited += 1;
            }
        });
    }

    toString(indent) {
        let ret = indent + "Frame Time : " + this.frameTime + "\n";
        ret += indent + "Cargos   : \n";
        this.cargoList.forEach(ent => {
            ret += ent.toString(indent + "\t");
            ret += "\n";
        });
        ret += indent + "Patrols   : \n";
        this.patrolList.forEach(ent => {
            ret += ent.toString(indent + "\t");
            ret += "\n";
        });
        ret += indent + "Pirates   : \n";
        this.pirateList.forEach(ent => {
            ret += ent.toString(indent + "\t");
            ret += "\n";
        });
        ret += indent + "Captures  : \n";
        this.captureList.forEach(ent => {
            ret += ent.toString(indent + "\t");
            ret += "\n";
        });
        return ret;
    }

    tick(xBounds, yBounds) {
        // Move all entities
        this.cargoList.forEach(element => {
            element.move();
        });
        this.patrolList.forEach(element => {
            element.move();
        });
        this.pirateList.forEach(element => {
            element.move();
        });
        this.captureList.forEach(element => {
            element.move();
        });

        this.recordExitStatistics(this.simStatsData, xBounds, yBounds);
        // Remove the ones that 'exited' the simulation
        this.pruneEntitiesOutsideRange(xBounds, yBounds);

        // Perform all entities actions
        this.patrolList.forEach(element => {
            element.doAction(this, this.simStatsData);
        });
        this.pirateList.forEach(element => {
            element.doAction(this, this.simStatsData);
        });
        this.cargoList.forEach(element => {
            element.doAction(this, xBounds, yBounds, this.simStatsData);
        });
        this.captureList.forEach(element => {
            element.doAction(this, this.simStatsData);
        });
    }
}