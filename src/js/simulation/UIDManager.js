class UIDManager {
    constructor() {
        this.currentNum = 0;
    }

    getUID() {
        let ret = this.currentNum;
        this.currentNum += 1;
        return ret;
    }
}

// Create a global UIDManager
window.UIDManager = new UIDManager();