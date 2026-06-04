const Storage = {
    STORAGE_KEY: 'farmGame_data',
    SETTINGS_KEY: 'farmGame_settings',
    LEADERBOARD_KEY: 'farmGame_leaderboard',
    ACHIEVEMENTS_KEY: 'farmGame_achievements',
    GUIDE_KEY: 'farmGame_hideGuide',

    getDefaultData() {
        return {
            player: {
                coins: 100,
                unlockedPlots: 6,
                totalHarvested: 0,
                totalEarned: 0,
                score: 0
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
            difficulty: 'normal',
            highScore: 0,
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
        if (data.difficulty === undefined) data.difficulty = 'normal';
        if (data.highScore === undefined) data.highScore = 0;
        
        data.player.coins = data.player.coins || 0;
        data.player.unlockedPlots = data.player.unlockedPlots || 6;
        data.player.score = data.player.score || 0;
        data.player.totalHarvested = data.player.totalHarvested || 0;
        data.player.totalEarned = data.player.totalEarned || 0;
        
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
        localStorage.removeItem(this.LEADERBOARD_KEY);
        localStorage.removeItem(this.ACHIEVEMENTS_KEY);
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
            return settings ? JSON.parse(settings) : { soundEnabled: true, theme: 'green' };
        } catch (e) {
            return { soundEnabled: true, theme: 'green' };
        }
    },

    saveLeaderboard(leaderboard) {
        try {
            localStorage.setItem(this.LEADERBOARD_KEY, JSON.stringify(leaderboard));
            return true;
        } catch (e) {
            console.error('保存排行榜失败:', e);
            return false;
        }
    },

    loadLeaderboard() {
        try {
            const data = localStorage.getItem(this.LEADERBOARD_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },

    clearLeaderboard() {
        localStorage.removeItem(this.LEADERBOARD_KEY);
    },

    saveAchievements(achievements) {
        try {
            localStorage.setItem(this.ACHIEVEMENTS_KEY, JSON.stringify(achievements));
            return true;
        } catch (e) {
            console.error('保存成就失败:', e);
            return false;
        }
    },

    loadAchievements() {
        try {
            const data = localStorage.getItem(this.ACHIEVEMENTS_KEY);
            return data ? JSON.parse(data) : this.getDefaultAchievements();
        } catch (e) {
            return this.getDefaultAchievements();
        }
    },

    getDefaultAchievements() {
        return {
            firstUnlock: { unlocked: false, unlockedAt: null },
            fullHarvest: { unlocked: false, unlockedAt: null },
            fastPlanter: { unlocked: false, unlockedAt: null }
        };
    },

    setGuideHidden(hidden) {
        try {
            localStorage.setItem(this.GUIDE_KEY, String(hidden));
            return true;
        } catch (e) {
            return false;
        }
    },

    isGuideHidden() {
        try {
            const data = localStorage.getItem(this.GUIDE_KEY);
            return data === 'true';
        } catch (e) {
            return false;
        }
    }
};