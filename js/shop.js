const Shop = {
    data: null,

    init(gameData) {
        this.data = gameData;
    },

    buySeed(cropId, quantity = 1) {
        const crop = Crops.getById(cropId);
        if (!crop) return { success: false, message: '种子不存在' };
        
        const totalCost = crop.seedPrice * quantity;
        if (this.data.player.coins < totalCost) {
            return { success: false, message: '金币不足' };
        }
        
        this.data.player.coins -= totalCost;
        
        if (!this.data.inventory.seeds[cropId]) {
            this.data.inventory.seeds[cropId] = 0;
        }
        this.data.inventory.seeds[cropId] += quantity;
        
        return { 
            success: true, 
            message: `购买${quantity}个${crop.name}种子成功`,
            cost: totalCost
        };
    },

    buyPlot(plotId) {
        const plot = this.data.plots[plotId];
        if (!plot) return { success: false, message: '地块不存在' };
        if (plot.unlocked) return { success: false, message: '地块已解锁' };
        
        const price = PlotPrices.getPrice(plotId);
        if (this.data.player.coins < price) {
            return { success: false, message: '金币不足' };
        }
        
        this.data.player.coins -= price;
        plot.unlocked = true;
        this.data.player.unlockedPlots++;
        
        return { 
            success: true, 
            message: `解锁第${plotId + 1}块土地成功`,
            cost: price
        };
    },

    buySpeedItem(quantity = 1) {
        const totalCost = SpeedItem.price * quantity;
        if (this.data.player.coins < totalCost) {
            return { success: false, message: '金币不足' };
        }
        
        this.data.player.coins -= totalCost;
        this.data.speedItems += quantity;
        
        return { 
            success: true, 
            message: `购买${quantity}个${SpeedItem.name}成功`,
            cost: totalCost
        };
    },

    sellProduct(cropId, quantity = 1) {
        const crop = Crops.getById(cropId);
        if (!crop) return { success: false, message: '产物不存在' };
        
        const available = this.data.inventory.products[cropId] || 0;
        if (available < quantity) {
            return { success: false, message: '产物数量不足' };
        }
        
        this.data.inventory.products[cropId] -= quantity;
        if (this.data.inventory.products[cropId] <= 0) {
            delete this.data.inventory.products[cropId];
        }
        
        const earnings = crop.sellPrice * quantity;
        this.data.player.coins += earnings;
        this.data.player.totalEarned += earnings;
        
        return { 
            success: true, 
            message: `卖出${quantity}个${crop.name}，获得${earnings}金币`,
            earnings
        };
    },

    sellAllProducts() {
        let totalEarnings = 0;
        const soldItems = [];
        
        for (const cropId in this.data.inventory.products) {
            const quantity = this.data.inventory.products[cropId];
            if (quantity > 0) {
                const crop = Crops.getById(parseInt(cropId));
                if (crop) {
                    const earnings = crop.sellPrice * quantity;
                    totalEarnings += earnings;
                    soldItems.push({ cropId: parseInt(cropId), quantity, earnings });
                }
            }
        }
        
        this.data.inventory.products = {};
        this.data.player.coins += totalEarnings;
        this.data.player.totalEarned += totalEarnings;
        
        return { 
            success: true, 
            message: `卖出全部产物，获得${totalEarnings}金币`,
            totalEarnings,
            soldItems
        };
    },

    getTotalSellValue() {
        let total = 0;
        for (const cropId in this.data.inventory.products) {
            const quantity = this.data.inventory.products[cropId];
            const crop = Crops.getById(parseInt(cropId));
            if (crop && quantity > 0) {
                total += crop.sellPrice * quantity;
            }
        }
        return total;
    },

    getAvailablePlotsToUnlock() {
        return this.data.plots.filter(p => !p.unlocked);
    }
};