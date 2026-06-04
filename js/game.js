const Game = {
    data: null,
    settings: null,
    achievements: null,
    isPaused: false,
    updateInterval: null,
    saveInterval: null,
    lastPlantTime: null,
    consecutivePlants: 0,

    init() {
        this.data = Storage.load();
        this.settings = Storage.loadSettings();
        this.achievements = Storage.loadAchievements();
        
        this.applyTheme();
        
        Farm.init(this.data);
        Shop.init(this.data);
        UI.init();
        
        this.calculateOfflineProgress();
        this.render();
        this.startGameLoop();
        this.bindAutoSave();
        
        if (!Storage.isGuideHidden()) {
            setTimeout(() => {
                UI.openGuide();
            }, 1000);
        }
        
        console.log('田园小农场已启动！', this.data);
    },

    applyTheme() {
        const theme = this.settings.theme || 'green';
        if (theme === 'autumn') {
            document.documentElement.classList.add('autumn-theme');
        } else {
            document.documentElement.classList.remove('autumn-theme');
        }
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
        UI.updateScoreDisplay();
        UI.updateHighScoreDisplay();
    },

    startGameLoop() {
        this.updateInterval = setInterval(() => {
            if (!this.isPaused) {
                const hasChanges = Farm.updateGrowth();
                if (hasChanges) {
                    this.render();
                    Storage.save(this.data);
                } else {
                    UI.renderPlots();
                }
            }
        }, 1000);
    },

    bindAutoSave() {
        window.addEventListener('beforeunload', () => {
            Storage.save(this.data);
            Storage.saveAchievements(this.achievements);
        });
        
        this.saveInterval = setInterval(() => {
            Storage.save(this.data);
            Storage.saveAchievements(this.achievements);
        }, 30000);
    },

    plantSeed(plotId, cropId) {
        const now = Date.now();
        if (this.lastPlantTime && now - this.lastPlantTime < 2000) {
            this.consecutivePlants++;
        } else {
            this.consecutivePlants = 1;
        }
        this.lastPlantTime = now;
        
        if (this.consecutivePlants >= 5) {
            this.unlockAchievement('fastPlanter');
        }
        
        const result = Farm.plant(plotId, cropId);
        
        if (result) {
            const crop = Crops.getById(cropId);
            UI.showToast(`播种${crop.name}成功！`);
            UI.showPlantAnimation(plotId, crop);
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
            const earnings = crop.sellPrice;
            this.data.player.score += earnings;
            this.data.player.totalHarvested++;
            
            if (this.data.player.score > this.data.highScore) {
                this.data.highScore = this.data.player.score;
            }
            
            const matureCount = Farm.getMaturePlots().length;
            if (matureCount === 0 && Farm.getUnlockedPlots().length >= 6) {
                const totalProducts = Object.values(this.data.inventory.products).reduce((a, b) => a + b, 0);
                if (totalProducts >= 6) {
                    this.unlockAchievement('fullHarvest');
                }
            }
            
            UI.showToast(`收获${crop.emoji}${crop.name}！`);
            UI.showCoinAnimation(earnings);
            Storage.save(this.data);
            this.render();
            UI.hidePlotInfo();
        }
    },

    harvestAll() {
        const maturePlots = Farm.getMaturePlots();
        const harvested = Farm.harvestAll();
        
        if (harvested.length > 0) {
            let totalEarnings = 0;
            harvested.forEach(cropId => {
                const crop = Crops.getById(cropId);
                totalEarnings += crop.sellPrice;
            });
            
            this.data.player.score += totalEarnings;
            this.data.player.totalHarvested += harvested.length;
            
            if (this.data.player.score > this.data.highScore) {
                this.data.highScore = this.data.player.score;
            }
            
            if (harvested.length >= 6) {
                this.unlockAchievement('fullHarvest');
            }
            
            UI.showToast(`收获${harvested.length}个作物！获得${totalEarnings}金币`);
            UI.showCoinAnimation(totalEarnings);
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
        const plot = Farm.getPlot(plotId);
        if (plot && !plot.unlocked) {
            this.unlockAchievement('firstUnlock');
        }
        
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
            this.data.player.score += result.earnings;
            this.data.player.totalEarned += result.earnings;
            
            if (this.data.player.score > this.data.highScore) {
                this.data.highScore = this.data.player.score;
            }
            
            Storage.save(this.data);
            UI.updateCoinDisplay();
            UI.updateScoreDisplay();
            UI.updateHighScoreDisplay();
            UI.updateInventory();
        }
    },

    sellAllProducts() {
        const result = Shop.sellAllProducts();
        UI.showToast(result.message);
        
        if (result.success) {
            this.data.player.score += result.totalEarnings;
            this.data.player.totalEarned += result.totalEarnings;
            
            if (this.data.player.score > this.data.highScore) {
                this.data.highScore = this.data.player.score;
            }
            
            Storage.save(this.data);
            UI.updateCoinDisplay();
            UI.updateScoreDisplay();
            UI.updateHighScoreDisplay();
            UI.updateInventory();
        }
    },

    unlockAchievement(achievementId) {
        if (!this.achievements[achievementId].unlocked) {
            this.achievements[achievementId].unlocked = true;
            this.achievements[achievementId].unlockedAt = Date.now();
            Storage.saveAchievements(this.achievements);
            
            const achievementInfo = this.getAchievementInfo(achievementId);
            UI.showAchievementUnlock(achievementInfo);
        }
    },

    getAchievementInfo(achievementId) {
        const achievements = {
            firstUnlock: { emoji: '🔓', title: '首次开荒', description: '解锁了第一块新土地！' },
            fullHarvest: { emoji: '🌾', title: '满载丰收', description: '单次收割满仓！' },
            fastPlanter: { emoji: '⚡', title: '种植速手', description: '短时间内批量播种！' }
        };
        return achievements[achievementId] || { emoji: '🏅', title: '成就解锁', description: '恭喜解锁新成就！' };
    },

    togglePause() {
        this.isPaused = !this.isPaused;
        const btn = document.getElementById('pauseBtn');
        if (this.isPaused) {
            btn.innerHTML = '▶️ 继续';
            UI.showToast('游戏已暂停');
        } else {
            btn.innerHTML = '⏸️ 暂停';
            UI.showToast('游戏已继续');
        }
    },

    setDifficulty(difficulty) {
        this.data.difficulty = difficulty;
        Storage.save(this.data);
        UI.showToast(difficulty === 'fast' ? '已切换至高产速熟模式' : '已切换至普通模式');
    },

    setTheme(theme) {
        this.settings.theme = theme;
        Storage.saveSettings(this.settings);
        this.applyTheme();
        UI.showToast(theme === 'autumn' ? '已切换至秋日田园主题' : '已切换至绿野田园主题');
    },

    saveScoreToLeaderboard(playerName) {
        const leaderboard = Storage.loadLeaderboard();
        const entry = {
            name: playerName || '匿名玩家',
            score: this.data.player.score,
            harvestCount: this.data.player.totalHarvested,
            earned: this.data.player.totalEarned,
            date: Date.now()
        };
        
        leaderboard.push(entry);
        leaderboard.sort((a, b) => b.score - a.score);
        
        if (leaderboard.length > 20) {
            leaderboard.splice(20);
        }
        
        Storage.saveLeaderboard(leaderboard);
        UI.showToast('成绩已保存到排行榜！');
    },

    reset() {
        this.data = Storage.reset();
        this.achievements = Storage.getDefaultAchievements();
        Storage.saveAchievements(this.achievements);
        Farm.init(this.data);
        Shop.init(this.data);
        this.isPaused = false;
        this.consecutivePlants = 0;
        const btn = document.getElementById('pauseBtn');
        if (btn) btn.innerHTML = '⏸️ 暂停';
        this.render();
        UI.showToast('游戏已重置');
    },

    getShareText() {
        const data = this.data.player;
        return `🌾 田园小农场成绩分享 🌾\n\n玩家：${'玩家'}\n金币：${data.coins}\n得分：${data.score}\n收获次数：${data.totalHarvested}\n总收益：${data.totalEarned}\n\n快来一起种菜吧！`;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Game.init();
});