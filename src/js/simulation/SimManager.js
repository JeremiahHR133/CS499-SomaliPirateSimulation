class SimManager {
    constructor() {
        this.singleStepMode = false;
        this.paused = true;
        this.baseFrametime = 1000; // ms
        this.frametime = this.baseFrametime; // ms
        this.prevTime = 0;
        this.simReplayMode = false;
        this.replayBackwards = false;

        this.simulation = new Simulation();
    }

    importFromJSON(obj) {
        this.singleStepMode = obj.singleStepMode;
        this.paused = obj.paused;
        this.baseFrametime = obj.baseFrametime; // ms
        this.frametime = obj.frametime; // ms

        this.prevTime = 0;
        this.simReplayMode = true;
        this.replayBackwards = false;

        this.simulation.importFromJSON(obj.simulation);
    }

    resetToStart() {
        if (!this.simReplayMode) {
            return;
        }
        this.simulation.setReplayToStart();
        this.paused = true;
    }

    tick() {
        if (this.paused) {
            return;
        }
        
        let currentTime = performance.now();
        if (currentTime - this.prevTime >= this.frametime || this.singleStepMode) {

            if (this.simReplayMode) {
                this.simulation.nextReplayFrame(this.replayBackwards);
            }
            else {
                this.simReplayMode = this.simulation.tick();
            }
            //console.log(this.simulation.toString("   "));
            this.prevTime = performance.now();
        }

        if (this.singleStepMode) {
            this.paused = true;
        }
    }

    isDayTime() {
        return this.simulation.isDayTime();
    }

    setSpeed1x() {
        this.frametime = this.baseFrametime;
        this.replayBackwards = false;
    }

    setSpeed2x() {
        this.frametime = Math.floor(this.baseFrametime / 2);
        this.replayBackwards = false;
    }

    setSpeed10x() {
        this.frametime = Math.floor(this.baseFrametime / 10);
        this.replayBackwards = false;
    }

    setSpeed20x() {
        this.frametime = Math.floor(this.baseFrametime / 20);
        this.replayBackwards = false;
    }

    setSpeedBackwards() {
        if (!this.simReplayMode) {
            return;
        }
        this.replayBackwards = true;
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

    cancelSim() {
        this.paused = true;
        this.simReplayMode = true;
        this.simulation.cancelSim();
    }
}