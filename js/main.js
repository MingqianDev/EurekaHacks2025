import { GameMap } from './map.js';
import { POIManager } from './poi.js';
import { Stats } from './stats.js';
import { Shop } from './shop.js';

window.addEventListener("load", async () => {
    if (navigator.geolocation) {
        // Initialize game components
        const stats = new Stats();
        const gameMap = new GameMap();
        const poiManager = new POIManager(gameMap, stats);
        const shop = new Shop(stats);

        // Make shop functions globally available
        window.buyFood = (foodType, cost, hungerRestore) => {
            shop.buyFood(foodType, cost, hungerRestore);
        };

        window.buyHealingItem = (itemType, cost, healthRestore) => {
            shop.buyHealingItem(itemType, cost, healthRestore);
        };

        navigator.geolocation.getCurrentPosition(async (position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;

            // Initialize map
            await gameMap.initialize(userLat, userLng);
            
            // Initialize POI manager
            await poiManager.fetchPOIs(userLat, userLng);

            // Watch position changes
            navigator.geolocation.watchPosition(
                (newPosition) => {
                    const newLat = newPosition.coords.latitude;
                    const newLng = newPosition.coords.longitude;
                    
                    // Update player position
                    gameMap.updatePlayerPosition(newLat, newLng);

                    // Check for coin collection
                    poiManager.checkCoinCollection(newLat, newLng);

                    // Check distance and update POIs/stats
                    const distance = L.latLng([userLat, userLng])
                        .distanceTo([newLat, newLng]);
                    
                    if (distance > 100) { // Update POIs if moved more than 100 meters
                        poiManager.fetchPOIs(newLat, newLng);
                        stats.updateHungerDisplay(stats.hunger - 10);
                    }
                },
                (error) => {
                    console.error("Error watching position:", error);
                }
            );
        });
    }
});
