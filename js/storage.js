const Storage = {
    STORAGE_KEY: 'farmGame_data',
    SETTINGS_KEY: 'farmGame_settings',

    getDefaultData() {
        return {
            player: {
                coins: 100,
                unlockedPlots: 6,
                totalHarvested: 0,
                totalEarned: 0
            },
            plots: Array.from({ length: 12 }, (_, i) => ({
                id: i,
                unlocked: i < 6,
                cropId: null,
                plantTime: null,
                matureTime: null,
                isMature: false
            })),
            inventory: {
                seeds: { 1: 5, 2: 3 },
                products: {}
            },
            speedItems: 0,
            lastSaveTime: Date.now()
        };
    },

    save(data) {
        try {
            data.lastSaveTime = Date.now();
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('保存失败:', e);
            return false;
        }
    },

    load() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (data) {
                const parsed = JSON.parse(data);
                return this.migrateData(parsed);
            }
        } catch (e) {
            console.error('加载失败:', e);
        }
        return this.getDefaultData();
    },

    migrateData(data) {
        const defaultData = this.getDefaultData();
        
        if (!data.player) data.player = defaultData.player;
        if (!data.plots) data.plots = defaultData.plots;
        if (!data.inventory) data.inventory = defaultData.inventory;
        if (data.speedItems === undefined) data.speedItems = 0;
        
        data.player.coins = data.player.coins || 0;
        data.player.unlockedPlots = data.player.unlockedPlots || 6;
        
        while (data.plots.length < 12) {
            data.plots.push({
                id: data.plots.length,
                unlocked: false,
                cropId: null,
                plantTime: null,
                matureTime: null,
                isMature: false
            });
        }
        
        return data;
    },

    reset() {
        localStorage.removeItem(this.STORAGE_KEY);
        return this.getDefaultData();
    },

    saveSettings(settings) {
        try {
            localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
            return true;
        } catch (e) {
            console.error('保存设置失败:', e);
            return false;
        }
    },

    loadSettings() {
        try {
            const settings = localStorage.getItem(this.SETTINGS_KEY);
            return settings ? JSON.parse(settings) : { soundEnabled: true };
        } catch (e) {
            return { soundEnabled: true };
        }
    }
};