import { GameMap } from './map.js';
import { POIManager } from './poi.js';
import { Stats } from './stats.js';

window.addEventListener("load", async () => {
    if (navigator.geolocation) {
        const gameMap = new GameMap();
        const stats = new Stats();
        
        navigator.geolocation.getCurrentPosition(async (position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;

            // Initialize map
            await gameMap.initialize(userLat, userLng);
            
            // Initialize POI manager
            const poiManager = new POIManager(gameMap);
            await poiManager.fetchPOIs(userLat, userLng);

            // Watch position changes
            navigator.geolocation.watchPosition(
                (newPosition) => {
                    const newLat = newPosition.coords.latitude;
                    const newLng = newPosition.coords.longitude;
                    
                    // Update player position
                    gameMap.updatePlayerPosition(newLat, newLng);

                    // Check distance and update POIs/stats
                    const distance = L.latLng([userLat, userLng])
                        .distanceTo([newLat, newLng]);
                    
                    if (distance > 100) {
                        poiManager.fetchPOIs(newLat, newLng);
                        stats.updateMoneyDisplay(stats.totalMoney + 50);
                        stats.updateHealthDisplay(stats.health - 5);
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
