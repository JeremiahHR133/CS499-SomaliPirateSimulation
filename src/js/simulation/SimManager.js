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

    isDayTime() {
        return this.simulation.isDayTime();
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

    normalSave() {
        let cargoSpawn = document.getElementById("cargoSpawnRate").value;
        let patrolSpawn = document.getElementById("patrolSpawnRate").value;
        let pirateSpawn = document.getElementById("pirateSpawnRate").value;
        let normrownumber = document.getElementById("normCellRow").value;
        let normcolumnnumber = document.getElementById("normCellColumn").value;
        let normcellspawn = document.getElementById("normCellSpawnText").value;
        let array = [cargoSpawn, patrolSpawn, pirateSpawn, normrownumber];
        array.forEach(value => {
            if(value != ""){
                switch (array.indexOf(value)){
                    case 0:
                        
                        this.simulation.initialConditions.cargoSpawn = Number(value);
                        break;
                    case 1:
                        this.simulation.initialConditions.patrolSpawn = Number(value);
                        break;
                    case 2:
                        this.simulation.initialConditions.pirateSpawn = Number(value);
                        break;
                    case 3:
                        if(normcellspawn != null){

                            if(normcolumnnumber == 0 && normrownumber != 99){
                                //cargo
                                this.simulation.initialConditions.dayCargoProbs[normrownumber].probability = Number(normcellspawn);
                                this.simulation.initialConditions.dayCargoProbs[normrownumber].modifiedByUser = true;
                            }
                            if(normcolumnnumber == 0 && normrownumber == 99){
                                //cargo
                                if(document.getElementById("normCornerBoatSelect").value == "cargo"){
                                    this.simulation.initialConditions.dayCargoProbs[normrownumber].probability = Number(normcellspawn);
                                    this.simulation.initialConditions.dayCargoProbs[normrownumber].modifiedByUser = true;
                                }
                                if(document.getElementById("normCornerBoatSelect").value == "pirate"){
                                    this.simulation.initialConditions.dayPirateProbs[normcolumnnumber].probability = Number(normcellspawn);
                                    this.simulation.initialConditions.dayPirateProbs[normcolumnnumber].modifiedByUser = true;
                                }
                            }
                            if(normrownumber == 99 && normcolumnnumber != 0 && normcolumnnumber != 399){
                                //pirate
                                this.simulation.initialConditions.dayPirateProbs[normcolumnnumber].probability = Number(normcellspawn);
                                this.simulation.initialConditions.dayPirateProbs[normcolumnnumber].modifiedByUser = true;
                            }
                            if(normcolumnnumber == 399 && normrownumber != 99){
                                //patrol
                                this.simulation.initialConditions.dayPatrolProbs[normrownumber].probability = Number(normcellspawn);
                                this.simulation.initialConditions.dayPatrolProbs[normrownumber].modifiedByUser = true;
                            }
                            if(normcolumnnumber == 399 && normrownumber == 99){
                                //patrol
                                if(document.getElementById("normCornerBoatSelect").value == "patrol"){
                                    this.simulation.initialConditions.dayPatrolProbs[normrownumber].probability = Number(normcellspawn);
                                    this.simulation.initialConditions.dayPatrolProbs[normrownumber].modifiedByUser = true;
                                }
                                if(document.getElementById("normCornerBoatSelect").value == "pirate"){
                                    this.simulation.initialConditions.dayPirateProbs[normcolumnnumber].probability = Number(normcellspawn);
                                    this.simulation.initialConditions.dayPirateProbs[normcolumnnumber].modifiedByUser = true;
                                }
                            }
                        }
                        break;
                    
                }
                
            }
        });
        simManager.probDist()
    }

    daySave() {
        let cargoSpawn = document.getElementById("cargoSpawnRateDay").value;
        let patrolSpawn = document.getElementById("patrolSpawnRateDay").value;
        let pirateSpawn = document.getElementById("pirateSpawnRateDay").value;
        let dayrownumber = document.getElementById("dayCellRow").value;
        let daycolumnnumber = document.getElementById("dayCellColumn").value;
        let daycellspawn = document.getElementById("dayCellSpawnText").value;
        let array = [cargoSpawn, patrolSpawn, pirateSpawn, dayrownumber];
        array.forEach(value => {
            if(value != ""){
                switch (array.indexOf(value)){
                    case 0:
                        
                        this.simulation.initialConditions.cargoSpawn = Number(value);
                        break;
                    case 1:
                        this.simulation.initialConditions.patrolSpawn = Number(value);
                        break;
                    case 2:
                        this.simulation.initialConditions.pirateSpawn = Number(value);
                        break;
                    case 3:
                        if(daycellspawn != null){

                            if(daycolumnnumber == 0 && dayrownumber != 99){
                                //cargo
                                this.simulation.initialConditions.dayCargoProbs[dayrownumber].probability = Number(daycellspawn);
                                this.simulation.initialConditions.dayCargoProbs[dayrownumber].modifiedByUser = true;
                            }
                            if(daycolumnnumber == 0 && dayrownumber == 99){
                                //cargo
                                if(document.getElementById("dayCornerBoatSelect").value == "cargo"){
                                    this.simulation.initialConditions.dayCargoProbs[dayrownumber].probability = Number(daycellspawn);
                                    this.simulation.initialConditions.dayCargoProbs[dayrownumber].modifiedByUser = true;
                                }
                                if(document.getElementById("dayCornerBoatSelect").value == "pirate"){
                                    this.simulation.initialConditions.dayPirateProbs[daycolumnnumber].probability = Number(daycellspawn);
                                    this.simulation.initialConditions.dayPirateProbs[daycolumnnumber].modifiedByUser = true;
                                }
                            }
                            if(dayrownumber == 99 && daycolumnnumber != 0 && daycolumnnumber != 399){
                                //pirate
                                this.simulation.initialConditions.dayPirateProbs[daycolumnnumber].probability = Number(daycellspawn);
                                this.simulation.initialConditions.dayPirateProbs[daycolumnnumber].modifiedByUser = true;
                            }
                            if(daycolumnnumber == 399 && dayrownumber != 99){
                                //patrol
                                this.simulation.initialConditions.dayPatrolProbs[dayrownumber].probability = Number(daycellspawn);
                                this.simulation.initialConditions.dayPatrolProbs[dayrownumber].modifiedByUser = true;
                            }
                            if(daycolumnnumber == 399 && dayrownumber == 99){
                                //patrol
                                if(document.getElementById("dayCornerBoatSelect").value == "patrol"){
                                    this.simulation.initialConditions.dayPatrolProbs[dayrownumber].probability = Number(daycellspawn);
                                    this.simulation.initialConditions.dayPatrolProbs[dayrownumber].modifiedByUser = true;
                                }
                                if(document.getElementById("dayCornerBoatSelect").value == "pirate"){
                                    this.simulation.initialConditions.dayPirateProbs[daycolumnnumber].probability = Number(daycellspawn);
                                    this.simulation.initialConditions.dayPirateProbs[daycolumnnumber].modifiedByUser = true;
                                }
                            }
                        }
                        break;
                    
                }
                
            }
        });
        simManager.probDist()
    }

    nightSave() {
        let cargoSpawn = document.getElementById("cargoSpawnRateNight").value;
        let patrolSpawn = document.getElementById("patrolSpawnRateNight").value;
        let pirateSpawn = document.getElementById("pirateSpawnRateNight").value;
        let nightrownumber = document.getElementById("nightCellRow").value;
        let nightcolumnnumber = document.getElementById("nightCellColumn").value;
        let nightcellspawn = document.getElementById("nightCellSpawnText").value;
        let array = [cargoSpawn, patrolSpawn, pirateSpawn, nightrownumber];
        array.forEach(value => {
            if(value != ""){
                switch (array.indexOf(value)){
                    case 0:
                        
                        this.simulation.initialConditions.cargoSpawn = Number(value);
                        break;
                    case 1:
                        this.simulation.initialConditions.patrolSpawn = Number(value);
                        break;
                    case 2:
                        this.simulation.initialConditions.pirateSpawn = Number(value);
                        break;
                    case 3:
                        if(nightcellspawn != null){

                            if(nightcolumnnumber == 0 && nightrownumber != 99){
                                //cargo
                                this.simulation.initialConditions.nightCargoProbs[nightrownumber].probability = Number(nightcellspawn);
                                this.simulation.initialConditions.nightCargoProbs[nightrownumber].modifiedByUser = true;
                            }
                            if(nightcolumnnumber == 0 && nightrownumber == 99){
                                //cargo
                                if(document.getElementById("nightCornerBoatSelect").value == "cargo"){
                                    this.simulation.initialConditions.nightCargoProbs[nightrownumber].probability = Number(nightcellspawn);
                                    this.simulation.initialConditions.nightCargoProbs[nightrownumber].modifiedByUser = true;
                                }
                                if(document.getElementById("nightCornerBoatSelect").value == "pirate"){
                                    this.simulation.initialConditions.nightPirateProbs[nightcolumnnumber].probability = Number(nightcellspawn);
                                    this.simulation.initialConditions.nightPirateProbs[nightcolumnnumber].modifiedByUser = true;
                                }
                            }
                            if(nightrownumber == 99 && nightcolumnnumber != 0 && nightcolumnnumber != 399){
                                //pirate
                                this.simulation.initialConditions.nightPirateProbs[nightcolumnnumber].probability = Number(nightcellspawn);
                                this.simulation.initialConditions.nightPirateProbs[nightcolumnnumber].modifiedByUser = true;
                            }
                            if(nightcolumnnumber == 399 && nightrownumber != 99){
                                //patrol
                                this.simulation.initialConditions.nightPatrolProbs[nightrownumber].probability = Number(nightcellspawn);
                                this.simulation.initialConditions.nightPatrolProbs[nightrownumber].modifiedByUser = true;
                            }
                            if(nightcolumnnumber == 399 && nightrownumber == 99){
                                //patrol
                                if(document.getElementById("nightCornerBoatSelect").value == "patrol"){
                                    this.simulation.initialConditions.nightPatrolProbs[nightrownumber].probability = Number(nightcellspawn);
                                    this.simulation.initialConditions.nightPatrolProbs[nightrownumber].modifiedByUser = true;
                                }
                                if(document.getElementById("nightCornerBoatSelect").value == "pirate"){
                                    this.simulation.initialConditions.nightPirateProbs[nightcolumnnumber].probability = Number(nightcellspawn);
                                    this.simulation.initialConditions.nightPirateProbs[nightcolumnnumber].modifiedByUser = true;
                                }
                            }
                        }
                        break;
                    
                }
                
            }
        });
        simManager.nightProbDist()
    }

    probDist() {
        let dayCargolist = this.simulation.initialConditions.dayCargoProbs
        let dayPatrollist = this.simulation.initialConditions.dayPatrolProbs
        let dayPiratelist = this.simulation.initialConditions.dayPirateProbs
        let userProbs = 0
        let userProbscount = 0
        let simProbs = 0
        let simProbscount = 0
        let newProb = 0
        dayCargolist.forEach(prob => {
            if(prob.modifiedByUser == true){
                userProbs = userProbs + prob.probability
                userProbscount = userProbscount + 1
            }
            if(prob.modifiedByUser == false){
                simProbs = simProbs + prob.probability
                simProbscount = simProbscount + 1
            }
        });
        dayCargolist.forEach(probs => {
            if(probs.modifiedByUser == false){
                newProb = 1 - userProbs
                probs.probability = newProb / (simProbscount)
            }
        });
        userProbs = 0
        userProbscount = 0
        simProbs = 0
        simProbscount = 0
        dayPatrollist.forEach(prob => {
            if(prob.modifiedByUser == true){
                userProbs = userProbs + prob.probability
                userProbscount = userProbscount + 1
            }
            if(prob.modifiedByUser == false){
                simProbs = simProbs + prob.probability
                simProbscount = simProbscount + 1
            }
        });
        dayPatrollist.forEach(probs => {
            if(probs.modifiedByUser == false){
                newProb = 1 - userProbs
                probs.probability = newProb / (simProbscount)
            }
        });
        userProbs = 0
        userProbscount = 0
        simProbs = 0
        simProbscount = 0
        dayPiratelist.forEach(prob => {
            if(prob.modifiedByUser == true){
                userProbs = userProbs + prob.probability
                userProbscount = userProbscount + 1
            }
            if(prob.modifiedByUser == false){
                simProbs = simProbs + prob.probability
                simProbscount = simProbscount + 1
            }
        });
        dayPiratelist.forEach(probs => {
            if(probs.modifiedByUser == false){
                newProb = 1 - userProbs
                probs.probability = newProb / (simProbscount)
            }
        });
    }

    nightProbDist() {
        let nightCargolist = this.simulation.initialConditions.nightCargoProbs
        let nightPatrollist = this.simulation.initialConditions.nightPatrolProbs
        let nightPiratelist = this.simulation.initialConditions.nightPirateProbs
        let userProbs = 0
        let userProbscount = 0
        let simProbs = 0
        let simProbscount = 0
        let newProb = 0
        nightCargolist.forEach(prob => {
            if(prob.modifiedByUser == true){
                userProbs = userProbs + prob.probability
                userProbscount = userProbscount + 1
            }
            if(prob.modifiedByUser == false){
                simProbs = simProbs + prob.probability
                simProbscount = simProbscount + 1
            }
        });
        nightCargolist.forEach(probs => {
            if(probs.modifiedByUser == false){
                newProb = 1 - userProbs
                probs.probability = newProb / (simProbscount)
            }
        });
        userProbs = 0
        userProbscount = 0
        simProbs = 0
        simProbscount = 0
        nightPatrollist.forEach(prob => {
            if(prob.modifiedByUser == true){
                userProbs = userProbs + prob.probability
                userProbscount = userProbscount + 1
            }
            if(prob.modifiedByUser == false){
                simProbs = simProbs + prob.probability
                simProbscount = simProbscount + 1
            }
        });
        nightPatrollist.forEach(probs => {
            if(probs.modifiedByUser == false){
                newProb = 1 - userProbs
                probs.probability = newProb / (simProbscount)
            }
        });
        userProbs = 0
        userProbscount = 0
        simProbs = 0
        simProbscount = 0
        nightPiratelist.forEach(prob => {
            if(prob.modifiedByUser == true){
                userProbs = userProbs + prob.probability
                userProbscount = userProbscount + 1
            }
            if(prob.modifiedByUser == false){
                simProbs = simProbs + prob.probability
                simProbscount = simProbscount + 1
            }
        });
        nightPiratelist.forEach(probs => {
            if(probs.modifiedByUser == false){
                newProb = 1 - userProbs
                probs.probability = newProb / (simProbscount)
            }
        });
    }
}