export class GameMap {
    constructor() {
        this.map = null;
        this.marker = null;
        this.goldCoinIcon = null;
        this.playerIcon = null;
    }

    async initialize(lat, lng) {
        // Initialize the map
        this.map = L.map('map', {
            zoomControl: false,
            attributionControl: false,
            dragging: true,
            scrollWheelZoom: true,
            doubleClickZoom: true,
            boxZoom: true,
            keyboard: true,
            tap: true,
            touchZoom: true,
        }).setView([lat, lng], 16);

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(this.map);

        // Setup player icon
        this.playerIcon = L.icon({
            iconUrl: 'asset/bear.png',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        });

        // Add player marker with custom icon
        this.marker = L.marker([lat, lng], { icon: this.playerIcon }).addTo(this.map);
        this.marker.bindPopup("You are here!").openPopup();

        // Setup gold coin icon
        this.goldCoinIcon = L.icon({
            iconUrl: 'asset/gold-coin.png',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
            popupAnchor: [0, -10]
        });
    }

    updatePlayerPosition(lat, lng) {
        this.marker.setLatLng([lat, lng]);
        this.map.setView([lat, lng], this.map.getZoom());
    }

    getGoldCoinIcon() {
        return this.goldCoinIcon;
    }

    getMap() {
        return this.map;
    }
}
