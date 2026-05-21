const Game = {
    data: null,
    settings: null,
    updateInterval: null,
    saveInterval: null,

    init() {
        this.data = Storage.load();
        this.settings = Storage.loadSettings();
        
        Farm.init(this.data);
        Shop.init(this.data);
        UI.init();
        
        this.calculateOfflineProgress();
        this.render();
        this.startGameLoop();
        this.bindAutoSave();
        
        console.log('田园小农场已启动！', this.data);
    },

    calculateOfflineProgress() {
        const maturedPlots = Farm.calculateOfflineProgress();
        if (maturedPlots.length > 0) {
            UI.showToast(`欢迎回来！${maturedPlots.length}块作物已成熟`);
        }
    },

    render() {
        UI.renderPlots();
        UI.updateCoinDisplay();
    },

    startGameLoop() {
        this.updateInterval = setInterval(() => {
            const hasChanges = Farm.updateGrowth();
            if (hasChanges) {
                this.render();
                Storage.save(this.data);
            } else {
                UI.renderPlots();
            }
        }, 1000);
    },

    bindAutoSave() {
        window.addEventListener('beforeunload', () => {
            Storage.save(this.data);
        });
        
        this.saveInterval = setInterval(() => {
            Storage.save(this.data);
        }, 30000);
    },

    plantSeed(plotId, cropId) {
        const result = Farm.plant(plotId, cropId);
        
        if (result) {
            const crop = Crops.getById(cropId);
            UI.showToast(`播种${crop.name}成功！`);
            Storage.save(this.data);
            this.render();
            UI.hidePlotInfo();
        } else {
            UI.showToast('播种失败，请检查种子数量');
        }
    },

    harvestPlot(plotId) {
        const plot = Farm.getPlot(plotId);
        if (!plot || !plot.isMature) {
            UI.showToast('这块地没有成熟的作物');
            return;
        }
        
        const cropId = Farm.harvest(plotId);
        if (cropId) {
            const crop = Crops.getById(cropId);
            UI.showToast(`收获${crop.emoji}${crop.name}！`);
            Storage.save(this.data);
            this.render();
            UI.hidePlotInfo();
        }
    },

    harvestAll() {
        const harvested = Farm.harvestAll();
        if (harvested.length > 0) {
            UI.showToast(`收获${harvested.length}个作物！`);
            Storage.save(this.data);
            this.render();
        } else {
            UI.showToast('没有可收割的作物');
        }
    },

    speedUpPlot(plotId) {
        const plot = Farm.getPlot(plotId);
        if (!plot || !plot.cropId || plot.isMature) {
            UI.showToast('请选择正在生长的作物');
            return;
        }
        
        if (this.data.speedItems <= 0) {
            UI.showToast('没有加速道具，请去商店购买');
            return;
        }
        
        const result = Farm.speedUp(plotId);
        if (result) {
            UI.showToast(`使用加速剂，减少30秒！`);
            Storage.save(this.data);
            this.render();
            UI.showPlotInfo(plotId);
        }
    },

    buySeed(cropId) {
        const result = Shop.buySeed(cropId);
        UI.showToast(result.message);
        
        if (result.success) {
            Storage.save(this.data);
            UI.updateCoinDisplay();
            UI.updateSeedsModal();
        }
    },

    unlockPlot(plotId) {
        const result = Shop.buyPlot(plotId);
        UI.showToast(result.message);
        
        if (result.success) {
            Storage.save(this.data);
            UI.updateCoinDisplay();
            UI.switchShopTab('plots');
            this.render();
        }
    },

    buySpeedItem() {
        const result = Shop.buySpeedItem();
        UI.showToast(result.message);
        
        if (result.success) {
            Storage.save(this.data);
            UI.updateCoinDisplay();
            UI.switchShopTab('items');
        }
    },

    sellProduct(cropId) {
        const result = Shop.sellProduct(cropId);
        UI.showToast(result.message);
        
        if (result.success) {
            Storage.save(this.data);
            UI.updateCoinDisplay();
            UI.updateInventory();
        }
    },

    sellAllProducts() {
        const result = Shop.sellAllProducts();
        UI.showToast(result.message);
        
        if (result.success) {
            Storage.save(this.data);
            UI.updateCoinDisplay();
            UI.updateInventory();
        }
    },

    reset() {
        this.data = Storage.reset();
        Farm.init(this.data);
        Shop.init(this.data);
        this.render();
        UI.showToast('游戏已重置');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Game.init();
});