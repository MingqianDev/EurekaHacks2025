export class POIManager {
    constructor(map) {
        this.map = map;
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

                L.marker([lat, lon], { icon: this.map.getGoldCoinIcon() })
                    .addTo(this.map.getMap())
                    .bindPopup(name)
                    .openPopup();
            });
        } catch (error) {
            console.error("Error fetching POIs:", error);
            alert("Failed to fetch nearby places.");
        }
    }
}
