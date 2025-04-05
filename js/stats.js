// Stats management
export class Stats {
    constructor() {
        this.totalMoney = 1000;
        this.health = 80;
        this.hunger = 80;
        
        // Get DOM elements
        this.moneyCounter = document.getElementById('money-counter');
        this.moneyBar = document.getElementById('money-bar');
        this.healthCounter = document.getElementById('health-counter');
        this.healthBar = document.getElementById('health-bar');
        this.hungerCounter = document.getElementById('hunger-counter');
        this.hungerBar = document.getElementById('hunger-bar');
        
        // Initialize displays
        this.updateHealthDisplay(this.health);
        this.updateHungerDisplay(this.hunger);
        this.updateMoneyDisplay(this.totalMoney);
    }

    updateMoneyDisplay(amount) {
        this.totalMoney = amount;
        this.moneyCounter.textContent = `$${this.totalMoney}`;
        const percentage = Math.min((this.totalMoney / 1000) * 100, 100);
        this.moneyBar.style.width = `${percentage}%`;
    }

    updateHealthDisplay(amount) {
        this.health = Math.max(0, Math.min(100, amount));
        this.healthCounter.textContent = `${this.health}/100`;
        this.healthBar.style.width = `${this.health}%`;
    }

    updateHungerDisplay(amount) {
        this.hunger = Math.max(0, Math.min(100, amount));
        this.hungerCounter.textContent = `${this.hunger}/100`;
        this.hungerBar.style.width = `${this.hunger}%`;
    }
}
