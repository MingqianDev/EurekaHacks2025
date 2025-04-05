export class POIManager {
    constructor(map, stats) {
        this.map = map;
        this.stats = stats;
        this.coins = new Map(); // Store coin markers with their coordinates
        this.collectionRadius = 1500; // 150 meters collection radius
        this.loadCollectedCoins(); // Load previously collected coins
    }

    loadCollectedCoins() {
        try {
            const collected = JSON.parse(localStorage.getItem('collectedCoins')) || {};
            this.collectedCoins = new Map(Object.entries(collected));
        } catch (e) {
            console.error('Error loading collected coins:', e);
            this.collectedCoins = new Map();
        }
    }

    saveCollectedCoins() {
        const collected = Object.fromEntries(this.collectedCoins);
        localStorage.setItem('collectedCoins', JSON.stringify(collected));
    }

    isCoinCollectable(coinId) {
        if (!this.collectedCoins.has(coinId)) return true;

        const collectedTime = this.collectedCoins.get(coinId);
        const now = new Date().getTime();
        const sixtySecondsInMs = 60 * 1000;

        return (now - collectedTime) >= sixtySecondsInMs;
    }

    async fetchPOIs(lat, lng) {
        const query = `
            [out:json];
            (
                node["amenity"="park"](around:1000,${lat},${lng});
                node["amenity"="library"](around:1000,${lat},${lng});
                node["amenity"="recreation_ground"](around:1000,${lat},${lng});
                node["amenity"="restaurant"](around:1000,${lat},${lng});
                node["amenity"="shop"](around:1000,${lat},${lng});
                node["amenity"="pub"](around:1000,${lat},${lng});
                node["amenity"="bank"](around:1000,${lat},${lng});
            );
            out body;
        `;

        try {
            const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
            const data = await response.json();
            
            data.elements.forEach(element => {
                const lat = element.lat;
                const lon = element.lon;
                const name = element.tags.name || "Unnamed place";

                // Create unique ID for the coin
                const coinId = `${lat},${lon}`;
                
                // Check if coin is collectable
                if (this.isCoinCollectable(coinId)) {
                    const marker = L.marker([lat, lon], { icon: this.map.getGoldCoinIcon() })
                        .addTo(this.map.getMap())
                        .bindPopup(name);
                    
                    // Store the coin marker with its coordinates and ID
                    this.coins.set(marker, { lat, lon, collected: false, id: coinId });
                    
                    // Add hover effect
                    marker.on('mouseover', () => marker.openPopup());
                    marker.on('mouseout', () => marker.closePopup());
                }
            });
        } catch (error) {
            console.error("Error fetching POIs:", error);
            alert("Failed to fetch nearby places.");
        }
    }

    checkCoinCollection(playerLat, playerLng) {
        this.coins.forEach((coinData, marker) => {
            if (!coinData.collected && this.isCoinCollectable(coinData.id)) {
                const distance = L.latLng([playerLat, playerLng])
                    .distanceTo([coinData.lat, coinData.lon]);
                
                if (distance <= this.collectionRadius) {
                    // Collect the coin
                    coinData.collected = true;
                    this.map.getMap().removeLayer(marker);
                    this.stats.updateMoneyDisplay(this.stats.totalMoney + 10);
                    
                    // Store collection time
                    this.collectedCoins.set(coinData.id, new Date().getTime());
                    this.saveCollectedCoins();
                    
                    // Calculate time until coin respawns
                    const respawnTime = new Date();
                    respawnTime.setSeconds(respawnTime.getSeconds() + 60);
                    const respawnTimeStr = respawnTime.toLocaleTimeString();
                    
                    // Show collection message with respawn time
                    const popup = L.popup()
                        .setLatLng([coinData.lat, coinData.lon])
                        .setContent(`Coin collected! +$10<br>Respawns at ${respawnTimeStr}`)
                        .openOn(this.map.getMap());
                    
                    // Remove popup after 3 seconds
                    setTimeout(() => {
                        this.map.getMap().closePopup(popup);
                    }, 3000);

                    // Schedule coin regeneration
                    setTimeout(() => {
                        // Create new marker for the regenerated coin
                        const newMarker = L.marker([coinData.lat, coinData.lon], { 
                            icon: this.map.getGoldCoinIcon() 
                        }).addTo(this.map.getMap());
                        
                        // Add hover effect to new marker
                        newMarker.bindPopup(marker.getPopup().getContent());
                        newMarker.on('mouseover', () => newMarker.openPopup());
                        newMarker.on('mouseout', () => newMarker.closePopup());
                        
                        // Update coins map with new marker
                        this.coins.delete(marker);
                        this.coins.set(newMarker, {
                            lat: coinData.lat,
                            lon: coinData.lon,
                            collected: false,
                            id: coinData.id
                        });

                        // Show respawn message
                        const respawnPopup = L.popup()
                            .setLatLng([coinData.lat, coinData.lon])
                            .setContent('Coin respawned!')
                            .openOn(this.map.getMap());

                        // Remove respawn popup after 2 seconds
                        setTimeout(() => {
                            this.map.getMap().closePopup(respawnPopup);
                        }, 2000);
                    }, 60000); // 60 seconds
                }
            }
        });
    }
}
