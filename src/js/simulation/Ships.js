// Make the object truly const (immutable)
const ShipTypes = Object.freeze({
    Cargo: "Cargo",
    Patrol: "Patrol",
    Pirate: "Pirate",
    Capture: "Capture"
});

// This object binds the movement directions to an actual x, y change
// This structure allows for diagonal movement if required
// Note that the p5 canvas has 0,0 at the top left corner, so we will follow that structure here
const MoveDirections = Object.freeze({
    // [xChange, yChange]
    North: [0, -1],
    South: [0, 1],
    East:  [1, 0],
    West:  [-1, 0]
});

// Base class for all ship objects
class Ship {
    constructor(type, xPos, yPos, dir, UID) {
        this.shipType = type;
        this.xPos = xPos;
        this.yPos = yPos;
        this.moveDirection = dir;

        if (typeof UID === "number") {
            this.UniqueID = UID;
        }
        else {
            this.UniqueID = window.UIDManager.getUID();
        }
    }

    toString(indent) {
        let ret = indent + "Ship Type      : " + this.shipType + "\n";
        ret += indent + "Position       : (" + this.xPos + ", " + this.yPos + ")\n";
        ret += indent + "Move Direction : [" + this.moveDirection[0] + ", " + this.moveDirection[1] + "]\n";
        ret += indent + "UID            : " + this.UniqueID + "\n";
        return ret;
    }

    equal(other) {
        if (other instanceof Ship) {
            return this.UniqueID === other.UniqueID;
        }
        else {
            return this.UniqueID === other;
        }
    }

    move() {
        this.xPos += this.moveDirection[0];
        this.yPos += this.moveDirection[1];
    } 

    // e.g. If a ship is in the same 4x4 grid but not in the same 3x3 grid, then this function returns true
    inRangeStrict(otherShip, gridSize) {
        if (Math.abs(this.xPos - otherShip.xPos) == gridSize) {
            if (Math.abs(this.yPos - otherShip.yPos) <= gridSize) {
                return true;
            }
        }
        else if (Math.abs(this.yPos - otherShip.yPos) == gridSize) {
            if (Math.abs(this.xPos - otherShip.xPos) <= gridSize) {
                return true;
            }
        }

        return false;
    }

    inRangeLoose(otherShip, gridSize) {
        return (Math.abs(this.xPos - otherShip.xPos) <= gridSize && Math.abs(this.yPos - otherShip.yPos) <= gridSize);
    }
}

class CargoShip extends Ship {
    constructor(xPos, yPos, UID) {
        super(ShipTypes.Cargo, xPos, yPos, MoveDirections.East, UID);
        this.evadedPirates = [];
    }

    // Will perform an EVADE action if possible
    doAction(frame, xBounds, yBounds) {
        let tempX = this.xPos + MoveDirections.North[0];
        let tempY = this.yPos + MoveDirections.North[1];
        if (tempX < xBounds[0] || tempX > xBounds[1] || tempY < yBounds[0] || tempY > yBounds[1]) {
            // Can't dodge if we can't move up without leaving the map
            return;
        }

        for (let i = 0; i < frame.pirateList.length; i++) {
            const pirate = frame.pirateList[i];
            
            // We can evade the pirate if all these conditions are met 
            if (this.inRangeStrict(pirate, 4) && !this.evadedPirates.includes(pirate.UniqueID)) {
                // From the requirements it looks like we can only evade one pirate in a tick
                // so we break out of this loop after evading a pirate
                this.xPos = tempX;
                this.yPos = tempY;
                break;
            }
        }
    }

    // NOTE that clone() preserves the UID, so do not use it to create new entities,
    // rather it is meant to clone the entities between the frames
    clone() {
        return new CargoShip(this.xPos, this.yPos, this.UniqueID);
    }
}


class PatrolShip extends Ship {
    constructor(xPos, yPos, UID) {
        super(ShipTypes.Patrol, xPos, yPos, MoveDirections.West.map(element => element * 2), UID);
    }

    // Will perform a DEFEAT action or a RESCUE action if possible
    doAction(frame) {
        // Rescue
        for (let i = 0; i < frame.captureList.length; i++) {
            const capture = frame.captureList[i];
            if (this.inRangeLoose(capture, 3)) {
                frame.removeEntity(capture.pirateUID);
                frame.convertCaptureToCargo(capture);
                // This means that a pirate can both rescue and defeat pirates in a single tick
                break;
            }
        }
        
        // Defeat
        for (let i = 0; i < frame.pirateList.length; i++) {
            const pirate = frame.pirateList[i];
            if (this.inRangeLoose(pirate, 3)) {
                frame.removeEntity(pirate);
            }
        }
    }

    // NOTE that clone() preserves the UID, so do not use it to create new entities,
    // rather it is meant to clone the entities between the frames
    clone() {
        return new PatrolShip(this.xPos, this.yPos, this.UniqueID);
    }
}

class PirateShip extends Ship {
    constructor(xPos, yPos, UID) {
        super(ShipTypes.Pirate, xPos, yPos, MoveDirections.North, UID);
        this.hasCapture = false;
    }

    // Will perform a CAPTURE if possible
    doAction(frame) {
        // No furthur action if the pirate already has a capture
        if (this.hasCapture) {
            return;
        }
        for (let i = 0; i < frame.cargoList.length; i++) {
            const cargo = frame.cargoList[i];
            if (this.inRangeLoose(cargo, 3)) {
                frame.convertCargoToCapture(cargo, this);
                this.hasCapture = true;
                this.moveDirection = MoveDirections.South;
                this.xPos = cargo.xPos;
                this.yPos = cargo.yPos;
                // We can only capture one cargo per pirate, so if we find one, we are done
                return;
            }
        }
    }

    // NOTE that clone() preserves the UID, so do not use it to create new entities,
    // rather it is meant to clone the entities between the frames
    clone() {
        return new PirateShip(this.xPos, this.yPos, this.UniqueID);
    }
}

class CaptureShip extends Ship {
    constructor(xPos, yPos, UID, pirateUID) {
        super(ShipTypes.Capture, xPos, yPos, MoveDirections.South, UID);
        this.pirateUID = pirateUID;
    }

    doAction(frame) {
        // Captures have no actions they can do
    }

    // NOTE that clone() preserves the UID, so do not use it to create new entities,
    // rather it is meant to clone the entities between the frames
    clone() {
        return new CaptureShip(this.xPos, this.yPos, this.UniqueID);
    }
}