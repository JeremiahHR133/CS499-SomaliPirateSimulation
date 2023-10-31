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

function cloneMoveDirection(mvDir) {
    let ret = [];
    for (let i = 0; i < mvDir.length; i++) {
        const val = mvDir[i];
        ret.push(val);
    }
    return ret;
}

// The default move directions for ships on spawn
const ShipMoveDirections = Object.freeze({
    Cargo: MoveDirections.East,
    Patrol: MoveDirections.West.map(element => element * 2),
    Pirate: MoveDirections.North,
    Capture: MoveDirections.South
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

    inMapRange(xRange, yRange) {
        return !(this.xPos < xRange[0] || this.xPos >= xRange[1] || this.yPos < yRange[0] || this.yPos >= yRange[1]);
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
        super(ShipTypes.Cargo, xPos, yPos, ShipMoveDirections.Cargo, UID);
        this.evadedPirates = [];
    }

    // Will perform an EVADE action if possible
    doAction(frame, xBounds, yBounds, simStats) {
        let tempX = this.xPos + MoveDirections.North[0];
        let tempY = this.yPos + MoveDirections.North[1];
        if (tempX < xBounds[0] || tempX > xBounds[1] || tempY < yBounds[0] || tempY > yBounds[1]) {
            // Can't dodge if we can't move up without leaving the map
            return;
        }

        for (let i = 0; i < frame.pirateList.length; i++) {
            const pirate = frame.pirateList[i];
            
            // We cannot evade a pirate twice
            for (let i = 0; i < this.evadedPirates.length; i++) {
                const UID = this.evadedPirates[i];
                if (pirate.UniqueID == UID) {
                    return;
                }
            }
            if (this.inRangeStrict(pirate, 4)) {
                // From the requirements it looks like we can only evade one pirate in a tick
                // so we break out of this loop after evading a pirate
                this.xPos = tempX;
                this.yPos = tempY;
                this.evadedPirates.push(pirate.UniqueID);
                break;
            }
        }
    }

    // NOTE that clone() preserves the UID, so do not use it to create new entities,
    // rather it is meant to clone the entities between the frames
    clone() {
        let nShip = new CargoShip(this.xPos, this.yPos, this.UniqueID);
        for (let i = 0; i < this.evadedPirates.length; i++) {
            const num = this.evadedPirates[i];
            nShip.evadedPirates.push(num);
        }
        nShip.moveDirection = [];
        for (let i = 0; i < this.moveDirection.length; i++) {
            const num = this.moveDirection[i];
            nShip.moveDirection.push(num);
        }
        return nShip;
    }
}


class PatrolShip extends Ship {
    constructor(xPos, yPos, UID) {
        super(ShipTypes.Patrol, xPos, yPos, ShipMoveDirections.Patrol, UID);
    }

    // Will perform a DEFEAT action or a RESCUE action if possible
    doAction(frame, simStats) {
        // Rescue
        // Currently implemented so a patrol can rescue any number of captures in its radius
        for (let i = 0; i < frame.captureList.length; i++) {
            const capture = frame.captureList[i];
            if (this.inRangeLoose(capture, 3)) {
                frame.removeEntity(capture.pirateUID);
                frame.convertCaptureToCargo(capture);
                simStats.piratesDefeated += 1;
                simStats.capturesRescued += 1;
            }
        }
        
        // Defeat
        // Currently implemented to defeat any number of pirates in the radius
        for (let i = 0; i < frame.pirateList.length; i++) {
            const pirate = frame.pirateList[i];
            if (this.inRangeLoose(pirate, 3)) {
                frame.removeEntity(pirate);
                simStats.piratesDefeated += 1;
            }
        }
    }

    // NOTE that clone() preserves the UID, so do not use it to create new entities,
    // rather it is meant to clone the entities between the frames
    clone() {
        let nShip = new PatrolShip(this.xPos, this.yPos, this.UniqueID);
        nShip.moveDirection = [];
        for (let i = 0; i < this.moveDirection.length; i++) {
            const num = this.moveDirection[i];
            nShip.moveDirection.push(num);
        }
        return nShip;
    }
}

class PirateShip extends Ship {
    constructor(xPos, yPos, UID) {
        super(ShipTypes.Pirate, xPos, yPos, ShipMoveDirections.Pirate, UID);
        this.hasCapture = false;
    }

    // Will perform a CAPTURE if possible
    doAction(frame, simStats) {
        // No furthur action if the pirate already has a capture
        if (this.hasCapture) {
            return;
        }
        for (let i = 0; i < frame.cargoList.length; i++) {
            const cargo = frame.cargoList[i];
            if (this.inRangeLoose(cargo, frame.isDayFrame ? 3 : 2)) {
                // If the cargo is getting captured then they evaded all the pirates
                // in their evadedList successfully except the one capturing them now
                simStats.evadesNotCaptured += cargo.evadedPirates.length - (cargo.evadedPirates.includes(this.UniqueID) ? 1 : 0);
                simStats.evadesCaptured += (cargo.evadedPirates.includes(this.UniqueID) ? 1 : 0);
                frame.convertCargoToCapture(cargo, this);
                this.hasCapture = true;
                this.moveDirection = ShipMoveDirections.Capture;
                this.xPos = cargo.xPos;
                this.yPos = cargo.yPos;
                simStats.cargosCaptured += 1;
                // We can only capture one cargo per pirate, so if we find one, we are done
                return;
            }
        }
    }

    // NOTE that clone() preserves the UID, so do not use it to create new entities,
    // rather it is meant to clone the entities between the frames
    clone() {
        let nShip = new PirateShip(this.xPos, this.yPos, this.UniqueID);
        nShip.hasCapture = this.hasCapture;
        nShip.moveDirection = [];
        for (let i = 0; i < this.moveDirection.length; i++) {
            const num = this.moveDirection[i];
            nShip.moveDirection.push(num);
        }
        return nShip;
    }
}

class CaptureShip extends Ship {
    constructor(xPos, yPos, UID, pirateUID) {
        super(ShipTypes.Capture, xPos, yPos, ShipMoveDirections.Capture, UID);
        this.pirateUID = pirateUID;
    }

    doAction(frame, simStats) {
        // Captures have no actions they can do
    }

    // NOTE that clone() preserves the UID, so do not use it to create new entities,
    // rather it is meant to clone the entities between the frames
    clone() {
        let nShip = new CaptureShip(this.xPos, this.yPos, this.UniqueID, this.pirateUID);
        nShip.moveDirection = [];
        for (let i = 0; i < this.moveDirection.length; i++) {
            const num = this.moveDirection[i];
            nShip.moveDirection.push(num);
        }
        return nShip;
    }
}