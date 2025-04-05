export class POIManager {
    constructor(map, stats) {
        this.map = map;
        this.stats = stats;
        this.coins = new Map(); // Store coin markers with their coordinates
        this.collectionRadius = 150; // 150 meters collection radius
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

                const marker = L.marker([lat, lon], { icon: this.map.getGoldCoinIcon() })
                    .addTo(this.map.getMap())
                    .bindPopup(name);
                
                // Store the coin marker with its coordinates
                this.coins.set(marker, { lat, lon, collected: false });
                
                // Add hover effect
                marker.on('mouseover', () => marker.openPopup());
                marker.on('mouseout', () => marker.closePopup());
            });
        } catch (error) {
            console.error("Error fetching POIs:", error);
            alert("Failed to fetch nearby places.");
        }
    }

    checkCoinCollection(playerLat, playerLng) {
        this.coins.forEach((coinData, marker) => {
            if (!coinData.collected) {
                const distance = L.latLng([playerLat, playerLng])
                    .distanceTo([coinData.lat, coinData.lon]);
                
                if (distance <= this.collectionRadius) {
                    // Collect the coin
                    coinData.collected = true;
                    this.map.getMap().removeLayer(marker);
                    this.stats.updateMoneyDisplay(this.stats.totalMoney + 10);
                    
                    // Show collection message
                    const popup = L.popup()
                        .setLatLng([coinData.lat, coinData.lon])
                        .setContent('Coin collected! +$10')
                        .openOn(this.map.getMap());
                    
                    // Remove popup after 2 seconds
                    setTimeout(() => {
                        this.map.getMap().closePopup(popup);
                    }, 2000);
                }
            }
        });
    }
}
