class Frame {
    // Coppy constructor of sorts
    constructor(frameTime, oldFrame) {
        this.frameTime = frameTime;
        this.cargoList = [];
        this.patrolList = [];
        this.pirateList = [];
        this.captureList = [];
        if (oldFrame instanceof Frame) {
            oldFrame.cloneEntityList(this);
        }
    }

    importFromJSON(obj){
        this.frameTime = obj.frameTime;

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

    tick(simStats, xBounds, yBounds) {
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

        this.recordExitStatistics(simStats, xBounds, yBounds);
        // Remove the ones that 'exited' the simulation
        this.pruneEntitiesOutsideRange(xBounds, yBounds);

        // Perform all entities actions
        this.patrolList.forEach(element => {
            element.doAction(this, simStats);
        });
        this.pirateList.forEach(element => {
            element.doAction(this, simStats);
        });
        this.cargoList.forEach(element => {
            element.doAction(this, xBounds, yBounds, simStats);
        });
        this.captureList.forEach(element => {
            element.doAction(this, simStats);
        });
    }
}