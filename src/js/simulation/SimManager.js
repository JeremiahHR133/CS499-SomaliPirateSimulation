class SimManager {
    constructor() {
        this.singleStepMode = false;
        this.paused = true;
        this.baseFrametime = 1000; // ms
        this.frametime = this.baseFrametime; // ms
        this.prevTime = 0;

        this.simulation = new Simulation();
    }

    tick() {
        if (this.paused) {
            return;
        }
        
        let currentTime = performance.now();
        if (currentTime - this.prevTime >= this.frametime) {
            this.simulation.tick();
            console.log(this.simulation.toString("   "));
            this.prevTime = performance.now();
        }

        if (this.singleStepMode) {
            this.paused = true;
        }
    }

    setSpeed1x() {
        this.frametime = this.baseFrametime;
    }

    setSpeed2x() {
        this.frametime = Math.floor(this.baseFrametime / 2);
    }

    setSpeed10x() {
        this.frametime = Math.floor(this.baseFrametime / 10);
    }

    setSpeed20x() {
        this.frametime = Math.floor(this.baseFrametime / 20);
    }

    start() {
        this.paused = false;
        this.singleStepMode = false;
    }

    pause() {
        this.paused = true;
    }

    unpause() {
        this.paused = false;
    }

    setSingleStepMode() {
        if (!this.paused) {
            return;
        }
        this.singleStepMode = true;
        this.paused = false;
    }
}