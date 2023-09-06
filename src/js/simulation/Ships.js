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
    constructor(type, xPos, yPos, dir) {
        this.shipType = type;

        this.xPos = xPos;
        this.yPos = yPos;

        this.moveDirection = dir;
    }

    toString(indent) {
        let ret = indent + "Ship Type      : " + this.shipType + "\n";
        ret += indent + "Position       : (" + this.xPos + ", " + this.yPos + ")\n";
        ret += indent + "Move Direction : " + this.moveDirection + "\n";
        return ret;
    }

    tick(ship) {
        let oldX = this.xPos;
        let oldY = this.yPos;
        this.xPos += ship.moveDirection[0];
        this.yPos += ship.moveDirection[1];
        // for debugging
        //console.log("Ticked a " + this.shipType + " ship. Oldx: " + oldX + ", Newx: " + this.xPos + "; Oldy: " + oldY + ", Newy: " + this.yPos);
    } 
}

class CargoShip extends Ship {
    constructor(xPos, yPos) {
        super(ShipTypes.Cargo, xPos, yPos, MoveDirections.East);
    }

    tick() {
        // Perform generic tick behavior
        super.tick(this);
    }

    clone() {
        return new CargoShip(this.xPos, this.yPos);
    }
}


class PatrolShip extends Ship {
    constructor(xPos, yPos) {
        super(ShipTypes.Patrol, xPos, yPos, MoveDirections.West.map(element => element * 2));
    }

    tick() {
        // Perform generic tick behavior
        super.tick(this);
    }

    clone() {
        return new PatrolShip(this.xPos, this.yPos);
    }
}