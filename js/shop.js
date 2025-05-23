export class Shop {
    constructor(stats) {
        this.stats = stats;
        this.initializeShop();
    }

    initializeShop() {
        // Get DOM elements
        const shopButton = document.getElementById('shop-button');
        const shopOverlay = document.getElementById('shop-overlay');
        const shop = document.getElementById('shop');

        // Add click event to shop button
        shopButton.addEventListener('click', () => this.toggleShop());

        // Close shop when clicking overlay
        shopOverlay.addEventListener('click', () => this.toggleShop());

        // Initialize shop state
        this.isShopOpen = false;
    }

    toggleShop() {
        const shopOverlay = document.getElementById('shop-overlay');
        const shop = document.getElementById('shop');

        this.isShopOpen = !this.isShopOpen;
        
        if (this.isShopOpen) {
            shopOverlay.style.display = 'block';
            shop.style.display = 'block';
        } else {
            shopOverlay.style.display = 'none';
            shop.style.display = 'none';
        }
    }

    buyFood(foodType, cost, hungerRestore) {
        if (this.stats.totalMoney >= cost) {
            this.stats.updateMoneyDisplay(this.stats.totalMoney - cost);
            this.stats.updateHungerDisplay(this.stats.hunger + hungerRestore);
            
            // Show success message
            this.showMessage(`Bought ${foodType}! +${hungerRestore} hunger restored`);
        } else {
            this.showMessage("Not enough money!");
        }
    }

    buyHealingItem(itemType, cost, healthRestore) {
        if (this.stats.totalMoney >= cost) {
            this.stats.updateMoneyDisplay(this.stats.totalMoney - cost);
            this.stats.updateHealthDisplay(this.stats.health + healthRestore);
            
            // Show success message
            this.showMessage(`Used ${itemType}! +${healthRestore} health restored`);
        } else {
            this.showMessage("Not enough money!");
        }
    }

    showMessage(text) {
        // Create a temporary message element
        const message = document.createElement('div');
        message.textContent = text;
        message.style.position = 'fixed';
        message.style.top = '20px';
        message.style.left = '50%';
        message.style.transform = 'translateX(-50%)';
        message.style.backgroundColor = '#333';
        message.style.color = '#fff';
        message.style.padding = '10px 20px';
        message.style.borderRadius = '5px';
        message.style.zIndex = '1000';
        
        document.body.appendChild(message);
        
        // Remove the message after 2 seconds
        setTimeout(() => {
            document.body.removeChild(message);
        }, 2000);
    }
}
