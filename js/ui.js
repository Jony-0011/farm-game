const UI = {
    selectedPlotId: null,
    selectedSeedId: null,

    init() {
        this.bindEvents();
        this.initModals();
    },

    bindEvents() {
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.openModal('settingsModal', 'scale');
        });

        document.getElementById('shopNavBtn').addEventListener('click', () => {
            this.openShop('seeds');
        });

        document.getElementById('inventoryNavBtn').addEventListener('click', () => {
            this.openInventory();
        });

        document.getElementById('seedsNavBtn').addEventListener('click', () => {
            this.openSeedsModal();
        });

        document.getElementById('plantBtn').addEventListener('click', () => {
            this.openPlantModal();
        });

        document.getElementById('harvestBtn').addEventListener('click', () => {
            this.harvestSelected();
        });

        document.getElementById('speedUpBtn').addEventListener('click', () => {
            this.speedUpSelected();
        });

        document.getElementById('closePlotInfo').addEventListener('click', () => {
            this.hidePlotInfo();
        });

        document.getElementById('sellAllBtn').addEventListener('click', () => {
            Game.sellAllProducts();
        });

        document.getElementById('resetGameBtn').addEventListener('click', () => {
            if (confirm('确定要重置游戏吗？所有进度将丢失！')) {
                Game.reset();
                this.closeModal('settingsModal', 'scale');
            }
        });

        document.querySelectorAll('.shop-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchShopTab(e.target.dataset.tab);
            });
        });
    },

    initModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    const isScale = modal.id === 'settingsModal';
                    this.closeModal(modal.id, isScale ? 'scale' : 'slide');
                }
            });
        });

        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = btn.closest('.modal');
                const isScale = modal.id === 'settingsModal';
                this.closeModal(modal.id, isScale ? 'scale' : 'slide');
            });
        });
    },

    openModal(modalId, animation = 'slide') {
        const modal = document.getElementById(modalId);
        const content = modal.querySelector('.modal-content');
        modal.classList.remove('hidden');
        
        setTimeout(() => {
            if (animation === 'slide') {
                content.style.transform = 'translateY(0)';
            } else {
                content.style.transform = 'scale(1)';
                content.style.opacity = '1';
            }
        }, 10);
    },

    closeModal(modalId, animation = 'slide') {
        const modal = document.getElementById(modalId);
        const content = modal.querySelector('.modal-content');
        
        if (animation === 'slide') {
            content.style.transform = 'translateY(100%)';
        } else {
            content.style.transform = 'scale(0.95)';
            content.style.opacity = '0';
        }
        
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    },

    openShop(tab = 'seeds') {
        this.switchShopTab(tab);
        this.openModal('shopModal');
    },

    switchShopTab(tab) {
        document.querySelectorAll('.shop-tab').forEach(t => {
            if (t.dataset.tab === tab) {
                t.classList.remove('bg-gray-200', 'text-gray-600');
                t.classList.add('bg-grass', 'text-white');
            } else {
                t.classList.remove('bg-grass', 'text-white');
                t.classList.add('bg-gray-200', 'text-gray-600');
            }
        });

        const content = document.getElementById('shopContent');
        
        if (tab === 'seeds') {
            content.innerHTML = this.renderSeedShop();
        } else if (tab === 'plots') {
            content.innerHTML = this.renderPlotShop();
        } else if (tab === 'items') {
            content.innerHTML = this.renderItemShop();
        }

        this.bindShopEvents();
    },

    renderSeedShop() {
        return `
            <div class="grid grid-cols-2 gap-3">
                ${Crops.config.map(crop => `
                    <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
                        <div class="text-center mb-2">
                            <span class="text-3xl">${crop.emoji}</span>
                            <div class="font-bold text-soil">${crop.name}种子</div>
                            <div class="text-xs text-gray-500">成熟: ${Crops.formatTime(crop.growTime)}</div>
                            <div class="text-xs text-green-600">收益: ${crop.sellPrice}金币</div>
                        </div>
                        <button class="buy-seed-btn w-full bg-grass hover:bg-grass-light text-white rounded-lg py-2 text-sm font-bold transition-all" data-crop-id="${crop.id}">
                            🪙 ${crop.seedPrice} 购买
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderPlotShop() {
        const availablePlots = Shop.getAvailablePlotsToUnlock();
        
        if (availablePlots.length === 0) {
            return '<div class="text-center text-gray-500 py-8">🎉 所有土地已解锁！</div>';
        }

        return `
            <div class="grid grid-cols-2 gap-3">
                ${availablePlots.map(plot => {
                    const price = PlotPrices.getPrice(plot.id);
                    return `
                        <div class="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-3 border border-amber-200">
                            <div class="text-center mb-2">
                                <span class="text-3xl">🟫</span>
                                <div class="font-bold text-soil">第${plot.id + 1}块土地</div>
                            </div>
                            <button class="buy-plot-btn w-full bg-soil hover:bg-soil-light text-white rounded-lg py-2 text-sm font-bold transition-all" data-plot-id="${plot.id}">
                                🪙 ${price} 解锁
                            </button>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    renderItemShop() {
        return `
            <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <span class="text-4xl">${SpeedItem.emoji}</span>
                        <div>
                            <div class="font-bold text-soil">${SpeedItem.name}</div>
                            <div class="text-sm text-gray-500">加速${Crops.formatTime(SpeedItem.reduceTime)}</div>
                            <div class="text-sm text-blue-600">拥有: ${Game.data.speedItems}个</div>
                        </div>
                    </div>
                    <button id="buySpeedBtn" class="bg-sky hover:bg-blue-400 text-white rounded-xl py-3 px-4 font-bold transition-all">
                        🪙 ${SpeedItem.price}
                    </button>
                </div>
            </div>
        `;
    },

    bindShopEvents() {
        document.querySelectorAll('.buy-seed-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const cropId = parseInt(btn.dataset.cropId);
                Game.buySeed(cropId);
            });
        });

        document.querySelectorAll('.buy-plot-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const plotId = parseInt(btn.dataset.plotId);
                Game.unlockPlot(plotId);
            });
        });

        const buySpeedBtn = document.getElementById('buySpeedBtn');
        if (buySpeedBtn) {
            buySpeedBtn.addEventListener('click', () => {
                Game.buySpeedItem();
            });
        }
    },

    openInventory() {
        this.updateInventory();
        this.openModal('inventoryModal');
    },

    updateInventory() {
        const content = document.getElementById('inventoryContent');
        const products = Game.data.inventory.products;
        
        if (Object.keys(products).length === 0) {
            content.innerHTML = '<div class="col-span-4 text-center text-gray-500 py-4">仓库空空如也~</div>';
        } else {
            content.innerHTML = Object.entries(products).map(([cropId, quantity]) => {
                const crop = Crops.getById(parseInt(cropId));
                return `
                    <div class="bg-gray-100 rounded-xl p-2 text-center cursor-pointer hover:bg-gray-200 transition-colors sell-product" data-crop-id="${cropId}">
                        <span class="text-2xl">${crop.emoji}</span>
                        <div class="text-xs font-bold">${quantity}</div>
                    </div>
                `;
            }).join('');
            
            content.querySelectorAll('.sell-product').forEach(el => {
                el.addEventListener('click', () => {
                    const cropId = parseInt(el.dataset.cropId);
                    Game.sellProduct(cropId);
                });
            });
        }

        document.getElementById('totalSellValue').textContent = `(${Shop.getTotalSellValue()}金币)`;
    },

    openSeedsModal() {
        this.updateSeedsModal();
        this.openModal('seedsModal');
    },

    updateSeedsModal() {
        const content = document.getElementById('seedsContent');
        const seeds = Game.data.inventory.seeds;
        
        if (Object.keys(seeds).length === 0) {
            content.innerHTML = '<div class="col-span-4 text-center text-gray-500 py-4">没有种子，去商店购买吧~</div>';
        } else {
            content.innerHTML = Object.entries(seeds).map(([cropId, quantity]) => {
                const crop = Crops.getById(parseInt(cropId));
                return `
                    <div class="bg-green-100 rounded-xl p-2 text-center">
                        <span class="text-2xl">${crop.emoji}</span>
                        <div class="text-xs font-bold text-soil">${crop.name}</div>
                        <div class="text-xs text-green-600">x${quantity}</div>
                    </div>
                `;
            }).join('');
        }
    },

    openPlantModal() {
        if (this.selectedPlotId === null) {
            this.showToast('请先选择一块空地');
            return;
        }

        const plot = Farm.getPlot(this.selectedPlotId);
        if (!plot || plot.cropId) {
            this.showToast('请选择一块空地');
            return;
        }

        this.updatePlantModal();
        this.openModal('plantModal');
    },

    updatePlantModal() {
        const content = document.getElementById('plantSeedsContent');
        const seeds = Game.data.inventory.seeds;
        
        if (Object.keys(seeds).length === 0) {
            content.innerHTML = '<div class="col-span-3 text-center text-gray-500 py-4">没有种子，去商店购买吧~</div>';
        } else {
            content.innerHTML = Object.entries(seeds).map(([cropId, quantity]) => {
                const crop = Crops.getById(parseInt(cropId));
                return `
                    <div class="bg-green-100 rounded-xl p-3 text-center cursor-pointer hover:bg-green-200 transition-all select-seed" data-crop-id="${cropId}">
                        <span class="text-3xl">${crop.emoji}</span>
                        <div class="text-sm font-bold text-soil">${crop.name}</div>
                        <div class="text-xs text-green-600">拥有: ${quantity}</div>
                    </div>
                `;
            }).join('');
            
            content.querySelectorAll('.select-seed').forEach(el => {
                el.addEventListener('click', () => {
                    const cropId = parseInt(el.dataset.cropId);
                    this.selectSeed(cropId);
                });
            });
        }
    },

    selectSeed(cropId) {
        this.selectedSeedId = cropId;
        this.closeModal('plantModal');
        
        if (this.selectedPlotId !== null) {
            Game.plantSeed(this.selectedPlotId, cropId);
        }
    },

    renderPlots() {
        const grid = document.getElementById('plotGrid');
        grid.innerHTML = '';
        
        Game.data.plots.forEach((plot, index) => {
            const div = document.createElement('div');
            div.className = `plot aspect-square rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                plot.unlocked 
                    ? 'bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-300 hover:scale-105' 
                    : 'bg-gray-300 border-2 border-gray-400'
            } ${this.selectedPlotId === index ? 'ring-4 ring-gold ring-opacity-75' : ''}`;
            
            div.dataset.plotId = index;
            
            if (!plot.unlocked) {
                div.innerHTML = `
                    <span class="text-2xl opacity-50">🔒</span>
                    <span class="text-xs text-gray-500 mt-1">🔒</span>
                `;
            } else if (plot.cropId) {
                const progress = Farm.getGrowthProgress(index);
                const stage = Crops.getGrowthStage(plot.cropId, progress);
                const crop = Crops.getById(plot.cropId);
                
                if (plot.isMature) {
                    div.innerHTML = `
                        <span class="text-3xl animate-bounce">${crop.emoji}</span>
                        <span class="text-xs text-green-600 font-bold mt-1">成熟!</span>
                    `;
                    div.classList.add('animate-pulse', 'bg-gradient-to-br', 'from-green-200', 'to-green-300');
                } else {
                    const remaining = Farm.getRemainingTime(index);
                    div.innerHTML = `
                        <span class="text-2xl">${stage}</span>
                        <span class="text-xs text-amber-700 mt-1">${Crops.formatTime(remaining)}</span>
                    `;
                }
            } else {
                div.innerHTML = `
                    <span class="text-2xl opacity-30">🌱</span>
                    <span class="text-xs text-gray-500 mt-1">空地</span>
                `;
            }
            
            div.addEventListener('click', () => this.selectPlot(index));
            grid.appendChild(div);
        });
    },

    selectPlot(plotId) {
        const plot = Farm.getPlot(plotId);
        if (!plot || !plot.unlocked) {
            this.showToast('请先解锁这块土地');
            return;
        }
        
        this.selectedPlotId = plotId;
        this.renderPlots();
        this.showPlotInfo(plotId);
    },

    showPlotInfo(plotId) {
        const plot = Farm.getPlot(plotId);
        if (!plot) return;
        
        const infoPanel = document.getElementById('selectedPlotInfo');
        const content = document.getElementById('plotContent');
        
        if (!plot.cropId) {
            content.innerHTML = `
                <div class="text-gray-600">
                    <span class="text-4xl mb-2 block">🌱</span>
                    <p>这是一块空地</p>
                    <p class="text-sm text-gray-500 mt-1">点击"播种"按钮开始种植</p>
                </div>
            `;
        } else {
            const crop = Crops.getById(plot.cropId);
            const progress = Farm.getGrowthProgress(plotId);
            const progressPercent = Math.min(100, Math.round(progress * 100));
            
            if (plot.isMature) {
                content.innerHTML = `
                    <div>
                        <span class="text-5xl mb-2 block animate-bounce">${crop.emoji}</span>
                        <p class="text-lg font-bold text-green-600">${crop.name}已成熟!</p>
                        <p class="text-sm text-gray-500 mt-1">点击"收割"按钮收获</p>
                    </div>
                `;
            } else {
                const remaining = Farm.getRemainingTime(plotId);
                content.innerHTML = `
                    <div>
                        <span class="text-4xl mb-2 block">${Crops.getGrowthStage(plot.cropId, progress)}</span>
                        <p class="font-bold text-soil">${crop.name}</p>
                        <div class="w-full bg-gray-200 rounded-full h-3 mt-2">
                            <div class="bg-grass h-3 rounded-full transition-all" style="width: ${progressPercent}%"></div>
                        </div>
                        <p class="text-sm text-gray-600 mt-2">剩余时间: ${Crops.formatTime(remaining)}</p>
                    </div>
                `;
            }
        }
        
        infoPanel.classList.remove('hidden');
    },

    hidePlotInfo() {
        document.getElementById('selectedPlotInfo').classList.add('hidden');
        this.selectedPlotId = null;
        this.renderPlots();
    },

    harvestSelected() {
        if (this.selectedPlotId === null) {
            const maturePlots = Farm.getMaturePlots();
            if (maturePlots.length > 0) {
                Game.harvestAll();
            } else {
                this.showToast('没有可收割的作物');
            }
            return;
        }
        
        Game.harvestPlot(this.selectedPlotId);
    },

    speedUpSelected() {
        if (this.selectedPlotId === null) {
            this.showToast('请先选择一块正在生长的地块');
            return;
        }
        
        Game.speedUpPlot(this.selectedPlotId);
    },

    updateCoinDisplay() {
        document.getElementById('coinAmount').textContent = Game.data.player.coins;
    },

    showToast(message, duration = 2000) {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        
        toastMessage.textContent = message;
        toast.style.transform = 'translate(-50%, 0)';
        toast.style.opacity = '1';
        
        setTimeout(() => {
            toast.style.transform = 'translate(-50%, -100%)';
            toast.style.opacity = '0';
        }, duration);
    },

    showCoinAnimation(amount, fromElement) {
        const rect = fromElement.getBoundingClientRect();
        const coinDisplay = document.getElementById('coinDisplay');
        const targetRect = coinDisplay.getBoundingClientRect();
        
        for (let i = 0; i < Math.min(5, Math.abs(amount) / 10); i++) {
            setTimeout(() => {
                const coin = document.createElement('div');
                coin.className = 'text-2xl absolute';
                coin.textContent = '🪙';
                coin.style.left = `${rect.left + Math.random() * 30}px`;
                coin.style.top = `${rect.top}px`;
                coin.style.transition = 'all 0.6s ease-out';
                coin.style.zIndex = '100';
                
                document.getElementById('coinAnimation').appendChild(coin);
                
                setTimeout(() => {
                    coin.style.left = `${targetRect.left + targetRect.width / 2}px`;
                    coin.style.top = `${targetRect.top}px`;
                    coin.style.opacity = '0';
                    coin.style.transform = 'scale(0.5)';
                }, 50);
                
                setTimeout(() => {
                    coin.remove();
                }, 700);
            }, i * 100);
        }
    }
};