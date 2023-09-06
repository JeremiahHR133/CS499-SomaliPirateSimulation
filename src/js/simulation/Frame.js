class Frame {
    // Coppy constructor of sorts
    constructor(frameTime, oldFrame) {
        this.frameTime = frameTime;
        if (!(oldFrame instanceof Frame)) {
            this.entities = [];
        }
        else {
            this.entities = oldFrame.cloneEntityList();
        }
    }

    cloneEntityList() {
        let newEntities = [];
        this.entities.forEach(ent => {
            newEntities.push(ent.clone());
        });
        return newEntities;
    }

    addEntity(ent) {
        this.entities.push(ent);
    }

    pruneEntitiesOutsideRange(xRange, yRange) {
        this.entities = this.entities.filter((elem) => !(elem.xPos < xRange[0] || elem.xPos > xRange[1] || elem.yPos < yRange[0] || elem.yPos > yRange[1]));
    }

    toString(indent) {
        let ret = indent + "Frame Time : " + this.frameTime + "\n";
        ret += indent + "Entities   : \n";
        this.entities.forEach(ent => {
            ret += ent.toString(indent + "\t");
            ret += "\n";
        });
        return ret;
    }

    tick() {
        for (let i = 0; i < this.entities.length; i++) {
            this.entities[i].tick();
        }
    }
}