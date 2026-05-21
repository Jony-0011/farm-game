const Farm = {
    data: null,

    init(gameData) {
        this.data = gameData;
    },

    getPlot(plotId) {
        return this.data.plots[plotId];
    },

    getUnlockedPlots() {
        return this.data.plots.filter(p => p.unlocked);
    },

    getEmptyPlots() {
        return this.data.plots.filter(p => p.unlocked && !p.cropId);
    },

    getGrowingPlots() {
        return this.data.plots.filter(p => p.unlocked && p.cropId && !p.isMature);
    },

    getMaturePlots() {
        return this.data.plots.filter(p => p.unlocked && p.cropId && p.isMature);
    },

    plant(plotId, cropId) {
        const plot = this.getPlot(plotId);
        if (!plot || !plot.unlocked || plot.cropId) return false;
        
        const crop = Crops.getById(cropId);
        if (!crop) return false;
        
        const seedCount = this.data.inventory.seeds[cropId] || 0;
        if (seedCount <= 0) return false;
        
        this.data.inventory.seeds[cropId]--;
        if (this.data.inventory.seeds[cropId] <= 0) {
            delete this.data.inventory.seeds[cropId];
        }
        
        plot.cropId = cropId;
        plot.plantTime = Date.now();
        plot.matureTime = Date.now() + crop.growTime;
        plot.isMature = false;
        
        return true;
    },

    harvest(plotId) {
        const plot = this.getPlot(plotId);
        if (!plot || !plot.cropId || !plot.isMature) return null;
        
        const cropId = plot.cropId;
        
        if (!this.data.inventory.products[cropId]) {
            this.data.inventory.products[cropId] = 0;
        }
        this.data.inventory.products[cropId]++;
        
        this.data.player.totalHarvested++;
        
        plot.cropId = null;
        plot.plantTime = null;
        plot.matureTime = null;
        plot.isMature = false;
        
        return cropId;
    },

    harvestAll() {
        const maturePlots = this.getMaturePlots();
        const harvested = [];
        
        maturePlots.forEach(plot => {
            const cropId = this.harvest(plot.id);
            if (cropId) harvested.push(cropId);
        });
        
        return harvested;
    },

    speedUp(plotId) {
        const plot = this.getPlot(plotId);
        if (!plot || !plot.cropId || plot.isMature) return false;
        if (this.data.speedItems <= 0) return false;
        
        this.data.speedItems--;
        plot.matureTime -= SpeedItem.reduceTime;
        
        if (plot.matureTime <= Date.now()) {
            plot.matureTime = Date.now();
            plot.isMature = true;
        }
        
        return true;
    },

    unlockPlot(plotId) {
        const plot = this.getPlot(plotId);
        if (!plot || plot.unlocked) return false;
        
        const price = PlotPrices.getPrice(plotId);
        if (this.data.player.coins < price) return false;
        
        this.data.player.coins -= price;
        plot.unlocked = true;
        this.data.player.unlockedPlots++;
        
        return true;
    },

    updateGrowth() {
        const now = Date.now();
        let hasChanges = false;
        
        this.data.plots.forEach(plot => {
            if (plot.cropId && !plot.isMature && plot.matureTime <= now) {
                plot.isMature = true;
                hasChanges = true;
            }
        });
        
        return hasChanges;
    },

    getGrowthProgress(plotId) {
        const plot = this.getPlot(plotId);
        if (!plot || !plot.cropId || !plot.plantTime) return 0;
        
        const crop = Crops.getById(plot.cropId);
        if (!crop) return 0;
        
        const elapsed = Date.now() - plot.plantTime;
        const progress = elapsed / crop.growTime;
        
        return Math.min(progress, 1);
    },

    getRemainingTime(plotId) {
        const plot = this.getPlot(plotId);
        if (!plot || !plot.cropId || plot.isMature) return 0;
        
        return Math.max(0, plot.matureTime - Date.now());
    },

    calculateOfflineProgress() {
        const now = Date.now();
        const lastSave = this.data.lastSaveTime || now;
        const offlineTime = now - lastSave;
        
        if (offlineTime < 1000) return [];
        
        const maturedPlots = [];
        
        this.data.plots.forEach(plot => {
            if (plot.cropId && !plot.isMature && plot.matureTime <= now) {
                plot.isMature = true;
                maturedPlots.push(plot.id);
            }
        });
        
        return maturedPlots;
    }
};