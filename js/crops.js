const Crops = {
    config: [
        {
            id: 1,
            name: '白菜',
            emoji: '🥬',
            seedPrice: 10,
            growTime: 60000,
            sellPrice: 25,
            stages: ['🌱', '🌿', '🥬', '🥬']
        },
        {
            id: 2,
            name: '胡萝卜',
            emoji: '🥕',
            seedPrice: 20,
            growTime: 120000,
            sellPrice: 50,
            stages: ['🌱', '🌿', '🥕', '🥕']
        },
        {
            id: 3,
            name: '番茄',
            emoji: '🍅',
            seedPrice: 50,
            growTime: 300000,
            sellPrice: 120,
            stages: ['🌱', '🌿', '🪻', '🍅']
        },
        {
            id: 4,
            name: '玉米',
            emoji: '🌽',
            seedPrice: 100,
            growTime: 600000,
            sellPrice: 250,
            stages: ['🌱', '🌿', '🌾', '🌽']
        },
        {
            id: 5,
            name: '南瓜',
            emoji: '🎃',
            seedPrice: 200,
            growTime: 1800000,
            sellPrice: 500,
            stages: ['🌱', '🌿', '🌻', '🎃']
        },
        {
            id: 6,
            name: '西瓜',
            emoji: '🍉',
            seedPrice: 500,
            growTime: 3600000,
            sellPrice: 1200,
            stages: ['🌱', '🌿', '🍈', '🍉']
        }
    ],

    getById(id) {
        return this.config.find(crop => crop.id === id);
    },

    getGrowthStage(cropId, progress) {
        const crop = this.getById(cropId);
        if (!crop) return '🌱';
        
        if (progress >= 1) return crop.stages[3];
        if (progress >= 0.66) return crop.stages[2];
        if (progress >= 0.33) return crop.stages[1];
        return crop.stages[0];
    },

    formatTime(ms) {
        if (ms <= 0) return '已成熟';
        
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}时${minutes % 60}分`;
        } else if (minutes > 0) {
            return `${minutes}分${seconds % 60}秒`;
        } else {
            return `${seconds}秒`;
        }
    },

    getProfit(cropId) {
        const crop = this.getById(cropId);
        if (!crop) return 0;
        return crop.sellPrice - crop.seedPrice;
    },

    getProfitPerMinute(cropId) {
        const crop = this.getById(cropId);
        if (!crop) return 0;
        const profit = crop.sellPrice - crop.seedPrice;
        const minutes = crop.growTime / 60000;
        return Math.round(profit / minutes);
    }
};

const PlotPrices = {
    prices: {
        7: 100,
        8: 200,
        9: 400,
        10: 800,
        11: 1500,
        12: 3000
    },

    getPrice(plotIndex) {
        return this.prices[plotIndex + 1] || 0;
    }
};

const SpeedItem = {
    price: 50,
    reduceTime: 30000,
    name: '生长加速剂',
    emoji: '⚡'
};