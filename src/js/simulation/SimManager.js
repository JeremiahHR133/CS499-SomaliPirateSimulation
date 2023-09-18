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
        if (currentTime - this.prevTime >= this.frametime || this.singleStepMode) {
            this.simulation.tick();
            //console.log(this.simulation.toString("   "));
            this.prevTime = performance.now();
            this.updateCounts();
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

    updateCounts() {
        document.getElementById("cargosEntered").innerText = this.simulation.simStatsData.cargosEntered;
        document.getElementById("cargosExited").innerText = this.simulation.simStatsData.cargosExited;
        document.getElementById("patrolsEntered").innerText = this.simulation.simStatsData.patrolsEntered;
        document.getElementById("patrolsExited").innerText = this.simulation.simStatsData.patrolsExited;
        document.getElementById("piratesEntered").innerText = this.simulation.simStatsData.piratesEntered;
        document.getElementById("piratesExited").innerText = this.simulation.simStatsData.piratesExited;
        document.getElementById("capturesExited").innerText = this.simulation.simStatsData.capturesExited;
        document.getElementById("piratesDefeated").innerText = this.simulation.simStatsData.piratesDefeated;
        document.getElementById("cargosCaptured").innerText = this.simulation.simStatsData.cargosCaptured;
        document.getElementById("capturesRescued").innerText = this.simulation.simStatsData.capturesRescued;
        document.getElementById("evadesNotCaptured").innerText = this.simulation.simStatsData.evadesNotCaptured;
        document.getElementById("evadesCaptured").innerText = this.simulation.simStatsData.evadesCaptured;
    }
}