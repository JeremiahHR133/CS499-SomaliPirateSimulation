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
        this.cargoList = this.cargoList.filter((elem) => !(elem.xPos < xRange[0] || elem.xPos > xRange[1] || elem.yPos < yRange[0] || elem.yPos > yRange[1]));
        this.patrolList = this.patrolList.filter((elem) => !(elem.xPos < xRange[0] || elem.xPos > xRange[1] || elem.yPos < yRange[0] || elem.yPos > yRange[1]));
        this.pirateList = this.pirateList.filter((elem) => !(elem.xPos < xRange[0] || elem.xPos > xRange[1] || elem.yPos < yRange[0] || elem.yPos > yRange[1]));
        this.captureList = this.captureList.filter((elem) => !(elem.xPos < xRange[0] || elem.xPos > xRange[1] || elem.yPos < yRange[0] || elem.yPos > yRange[1]));
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

        // Remove the ones that 'exited' the simulation
        this.pruneEntitiesOutsideRange(xBounds, yBounds);

        // Perform all entities actions
        this.cargoList.forEach(element => {
            element.doAction(this, xBounds, yBounds);
        });
        this.patrolList.forEach(element => {
            element.doAction(this);
        });
        this.pirateList.forEach(element => {
            element.doAction(this);
        });
        this.captureList.forEach(element => {
            element.doAction(this);
        });
    }
}