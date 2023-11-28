class SimManager {
    constructor() {
        this.singleStepMode = false;
        this.paused = true;
        this.baseFrametime = 1000; // ms
        this.frametime = this.baseFrametime; // ms
        this.prevTime = 0;
        this.simReplayMode = false;
        this.replayBackwards = false;
        this.lockSettings = false;
        

        this.lastProbIndexRow = 0;
        this.lastProbIndexCol = 0;

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
        this.lockSettings = true;

        this.simulation.importFromJSON(obj.simulation);

        this.tryLockSettings();
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
            this.updateCounts();
            this.updateTimeElapsed();
            this.updateTimeLeft();
            this.updateReplayMode();
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

    setSpeedBackwards() {
        if (!this.simReplayMode) {
            return;
        }
        if(this.replayBackwards){
            this.replayBackwards = false;
        }
        else{
            this.replayBackwards = true;
        }
        
    }

    play() {
        this.paused = false;
        this.singleStepMode = false;
        this.lockSettings = true;
        this.tryLockSettings();
    }

    pause() {
        this.paused = true;
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

    updateCounts() {
        let tempFrame = this.simulation.getCurrentFrame();
        document.getElementById("cargosEntered").innerText     = tempFrame.simStatsData.cargosEntered;
        document.getElementById("cargosExited").innerText      = tempFrame.simStatsData.cargosExited;
        document.getElementById("patrolsEntered").innerText    = tempFrame.simStatsData.patrolsEntered;
        document.getElementById("patrolsExited").innerText     = tempFrame.simStatsData.patrolsExited;
        document.getElementById("piratesEntered").innerText    = tempFrame.simStatsData.piratesEntered;
        document.getElementById("piratesExited").innerText     = tempFrame.simStatsData.piratesExited;
        document.getElementById("capturesExited").innerText    = tempFrame.simStatsData.capturesExited;
        document.getElementById("piratesDefeated").innerText   = tempFrame.simStatsData.piratesDefeated;
        document.getElementById("cargosCaptured").innerText    = tempFrame.simStatsData.cargosCaptured;
        document.getElementById("capturesRescued").innerText   = tempFrame.simStatsData.capturesRescued;
        document.getElementById("evadesNotCaptured").innerText = tempFrame.simStatsData.evadesNotCaptured;
        document.getElementById("evadesCaptured").innerText    = tempFrame.simStatsData.evadesCaptured;
        document.getElementById("timeStep").innerText = tempFrame.frameTime / 5;
    }

    updateTimeElapsed()
    {
        let currentTimeSeconds = this.simulation.getCurrentFrame().frameTime * 60;
        let days = Math.floor(currentTimeSeconds / (3600 * 24));
        let hours = Math.floor((currentTimeSeconds % (3600 * 24)) / 3600);
        let minutes = Math.floor((currentTimeSeconds % 3600) / 60);
        document.getElementById("timeElapsedValue").innerHTML = days + "<small>d</small> " + hours + "<small>h</small> " + minutes + "<small>m</small> ";
        if(simManager.simulation.simOver){
            return;
        }
    }

    updateTimeLeft()
    {
        let currentTimeSeconds = (this.simulation.initialConditions.simRunTime * 60) - (this.simulation.getCurrentFrame().frameTime * 60);
        let days = Math.floor(currentTimeSeconds / (3600 * 24));
        let hours = Math.floor((currentTimeSeconds % (3600 * 24)) / 3600);
        let minutes = Math.floor((currentTimeSeconds % 3600) / 60);
        document.getElementById("timeLeftValue").innerHTML = days + "<small>d</small> " + hours + "<small>h</small> " + minutes + "<small>m</small> ";
        if(simManager.simulation.simOver){
            return;
        }
    } 

    updateReplayMode()
    {
        if (this.simReplayMode)
        {
            if (this.replayBackwards)
            {
                document.getElementById("simReplayMode").innerText = " Reverse";
            }
            else
            {
                document.getElementById("simReplayMode").innerText = " Forwards";
            }
        }
    }

    tryLockSettings()
    {
        if (!this.lockSettings)
        {
            return;
        }

        let selectList = document.getElementsByClassName("selectLock");
        let textAreaList = document.getElementsByClassName("textLock");
        let inputList = document.getElementsByClassName("inputLock");
        let buttonList = document.getElementsByClassName("buttonLock");

        selectList.forEach(selectElem => {
            selectElem.disabled = true;
        });

        textAreaList.forEach(textElem => {
            textElem.setAttribute("readonly", "readonly");
        });

        inputList.forEach(inputElem => {
           inputElem.setAttribute("disabled", "disabled");
        });

        buttonList.forEach(buttonElem => {
            buttonElem.disabled = true;
        });
    }

    saveSettings()
    {
        let isDaySetting = document.getElementById("dayNightSettings").value == "day";

        let rawSimRunTimeSetting = document.getElementById("simRunTime").value;
        this.simulation.initialConditions.simRunTime = this.capNumber(this.safeToNumber(rawSimRunTimeSetting, this.simulation.initialConditions.simRunTime), 720, 43200);

        let cargoSpawn = document.getElementById("cargoSpawnRate").value;
        let patrolSpawn = document.getElementById("patrolSpawnRate").value;
        let pirateSpawn = document.getElementById("pirateSpawnRate").value;

        if (isDaySetting)
        {
            this.simulation.initialConditions.dayCargoSpawn = this.capNumber(
                            this.safeToNumber(cargoSpawn, this.simulation.initialConditions.dayCargoSpawn),
                            0, 1);
            this.simulation.initialConditions.dayPatrolSpawn = this.capNumber(
                            this.safeToNumber(patrolSpawn, this.simulation.initialConditions.dayPatrolSpawn),
                            0, 1);
            this.simulation.initialConditions.dayPirateSpawn = this.capNumber(
                            this.safeToNumber(pirateSpawn, this.simulation.initialConditions.dayPirateSpawn),
                            0, 1);
        }
        else
        {
            this.simulation.initialConditions.nightCargoSpawn = this.capNumber(
                            this.safeToNumber(cargoSpawn, this.simulation.initialConditions.nightCargoSpawn),
                            0, 1);
            this.simulation.initialConditions.nightPatrolSpawn = this.capNumber(
                            this.safeToNumber(patrolSpawn, this.simulation.initialConditions.nightPatrolSpawn),
                            0, 1);
            this.simulation.initialConditions.nightPirateSpawn = this.capNumber(
                            this.safeToNumber(pirateSpawn, this.simulation.initialConditions.nightPirateSpawn),
                            0, 1);
        }

        let cellRowNumber = this.lastProbIndexRow;
        let cellColNumber = this.lastProbIndexCol;

        let boatSelector = document.getElementById("cornerBoatSelect").value;

        let probListToUpdate = this.getListByIndex(cellRowNumber, cellColNumber, isDaySetting, boatSelector);
        let newCellProbValue = document.getElementById("cellSpawnText").value;

        this.setProbabilityByList(probListToUpdate, cellRowNumber, cellColNumber, newCellProbValue);

        this.redistributeCellProbabilities(probListToUpdate);

        this.updateSettingsUI(isDaySetting);
    }

    redistributeCellProbabilities(probList)
    {
        let totalUserProb = 0;
        let numUntoutchedCells = probList.length;
        probList.forEach(probCell => {
            if (probCell.modifiedByUser)
            {
                totalUserProb += probCell.probability;
                numUntoutchedCells -= 1;
            }
        });

        let remainingProb = 1 - totalUserProb;
        let newCellProb = remainingProb / numUntoutchedCells;

        probList.forEach(probCell => {
            if (!probCell.modifiedByUser)
            {
                probCell.probability = newCellProb;
            }
        });
    }

    capProbCell(num, probList, index)
    {
        let attemptedTotalUserProb = 0;
        let currentTotalUserProb = 0;
        let userInput = num;
        probList.forEach(cell => {
            if (cell.index == index)
            {
                attemptedTotalUserProb += userInput;
            }
            else if (cell.modifiedByUser)
            {
                attemptedTotalUserProb += cell.probability;
            }
            if (cell.modifiedByUser)
            {
                currentTotalUserProb += cell.probability;
            }
        });

        if (attemptedTotalUserProb > 1)
        { // This if statement is where you could put an allert about capping the cell prob
            userInput = (1 - currentTotalUserProb);
            console.log("Cannot set value to \'" + num + "\', setting value to \'" + userInput + "\' instead.");
        }

        return userInput;
    }

    capNumber(num, min, max)
    {
        if (num < min)
        {
            return min;
        }
        if (num > max)
        {
            return max;
        }
        return num;
    }

    safeToNumber(val, valOnFail)
    {
        let convert = Number(val);
        if (isNaN(convert) || val == "")
        {
            return valOnFail;
        }
        return convert;
    }

    updateSettingsUI(isDay)
    {
        document.getElementById("simRunTime").value = this.simulation.initialConditions.simRunTime;
        if (isDay)
        {
            document.getElementById("cargoSpawnRate").value  = this.simulation.initialConditions.dayCargoSpawn;
            document.getElementById("patrolSpawnRate").value = this.simulation.initialConditions.dayPatrolSpawn;
            document.getElementById("pirateSpawnRate").value = this.simulation.initialConditions.dayPirateSpawn;
        }
        else
        {
            document.getElementById("cargoSpawnRate").value  = this.simulation.initialConditions.nightCargoSpawn;
            document.getElementById("patrolSpawnRate").value = this.simulation.initialConditions.nightPatrolSpawn;
            document.getElementById("pirateSpawnRate").value = this.simulation.initialConditions.nightPirateSpawn;
        }

        document.getElementById("cellRow").value         = this.lastProbIndexRow;
        document.getElementById("cellColumn").value      = this.lastProbIndexCol;
        document.getElementById("cellSpawnText").value   = this.getProbValueFromIndex(
            this.lastProbIndexRow, this.lastProbIndexCol,
            document.getElementById("cornerBoatSelect").value,
            isDay);

        this.updateTimeElapsed();
        this.updateTimeLeft();
        this.updateReplayMode();
    }

    getProbValueFromIndex(row, col, cornerSelector, isDay)
    {
        let probList = this.getListByIndex(row, col, isDay, cornerSelector);
        let index = probList.length == 400 ? col : row;
        return probList[index].probability;
    }

    getListByIndex(row, col, isDay, cornerSelector)
    {
        // Cargo ship or single cell of pirate
        if (col == 0)
        {
            // Bottom left corner (cargo + pirate)
            if (row == 99 && cornerSelector == "Pirate")
            {
                return isDay ? this.simulation.initialConditions.dayPirateProbs : this.simulation.initialConditions.nightPirateProbs;
            }
            // Cargo
            else
            {
                return isDay ? this.simulation.initialConditions.dayCargoProbs : this.simulation.initialConditions.nightCargoProbs;
            }
        }
        // Patrol ship or single cell of pirate
        else if (col == 399)
        {
            // Bottom right corner (patrol + pirate)
            if (row == 99 && cornerSelector == "Pirate")
            {
                return isDay ? this.simulation.initialConditions.dayPirateProbs : this.simulation.initialConditions.nightPirateProbs;
            }
            // Patrol
            else
            {
                return isDay ? this.simulation.initialConditions.dayPatrolProbs : this.simulation.initialConditions.nightPatrolProbs;
            }
        }
        // Only pirate since mixed cells handled earlier
        else if (row == 99)
        {
            return isDay ? this.simulation.initialConditions.dayPirateProbs : this.simulation.initialConditions.nightPirateProbs;
        }
        // Not a valid cell for a probability conversion, should never get here
        return [];
    }

    setProbabilityByList(probList, row, col, newSpawnProb)
    {
        let index = probList.length == 400 ? col : row;

        let prevProb = probList[index].probability;
        let clampedInput = this.capNumber(this.safeToNumber(newSpawnProb, prevProb), 0, 1);
        let updatedVal = this.capProbCell(clampedInput, probList, index);
        probList[index].probability = updatedVal;
        probList[index].probability = updatedVal;
        if (prevProb != updatedVal)
        {
            probList[index].modifiedByUser = true;
        }
    }
}