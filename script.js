// Create a custom layer for direction sector
L.DirectionSector = L.Layer.extend({
  initialize: function(latlng, options) {
    L.setOptions(this, options);
    this._latlng = latlng;
    this._radius = options.radius || 50; // radius in meters
    this._angle = options.angle || 45;   // angle in degrees
    this._bearing = options.bearing || 0; // initial bearing
  },

  onAdd: function(map) {
    this._map = map;
    if (!this._container) {
      this._initContainer();
    }
    map.getPanes().overlayPane.appendChild(this._container);
    map.on('viewreset', this._reset, this);
    this._reset();
    return this;
  },

  onRemove: function(map) {
    map.getPanes().overlayPane.removeChild(this._container);
    map.off('viewreset', this._reset, this);
  },

  _initContainer: function() {
    this._container = L.DomUtil.create('div', 'direction-sector');
    this._sector = L.DomUtil.create('div', 'sector', this._container);
    
    // Style the sector
    this._container.style.position = 'absolute';
    this._sector.style.width = this._radius * 2 + 'px';
    this._sector.style.height = this._radius * 2 + 'px';
    this._sector.style.borderRadius = '50%';
    this._sector.style.clip = `rect(0, ${this._radius}px, ${this._radius * 2}px, 0)`;
    this._sector.style.transform = 'rotate(0deg)';
    this._sector.style.background = 'rgba(33, 150, 243, 0.3)';
    this._sector.style.border = '2px solid rgba(33, 150, 243, 0.8)';
  },

  _reset: function() {
    const pos = this._map.latLngToLayerPoint(this._latlng);
    L.DomUtil.setPosition(this._container, pos);
    this._updateRotation(this._bearing);
  },

  _updateRotation: function(bearing) {
    this._bearing = bearing;
    this._sector.style.transform = `rotate(${bearing - (this._angle / 2)}deg)`;
  },

  updatePosition: function(latlng) {
    this._latlng = latlng;
    this._reset();
  }
});

L.directionSector = function(latlng, options) {
  return new L.DirectionSector(latlng, options);
};

window.addEventListener("load", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        // Initialize the map at user's location
        const map = L.map('map', {
          zoomControl: false,
          attributionControl: false,
          dragging: false,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          boxZoom: false,
          keyboard: false,
          tap: false,
          touchZoom: false,
        }).setView([userLat, userLng], 16);

        // Tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Player marker
        const marker = L.marker([userLat, userLng]).addTo(map);
        marker.bindPopup("You are here!").openPopup();

        // Add direction sector
        const directionSector = L.directionSector([userLat, userLng], {
          radius: 30,    // Size of the sector in pixels
          angle: 60,     // Angle of the sector in degrees
          bearing: 0     // Initial bearing
        }).addTo(map);

        // Handle device orientation
        if (window.DeviceOrientationEvent) {
          window.addEventListener('deviceorientationabsolute', function(event) {
            let bearing = event.alpha || 0;  // alpha is the compass direction
            directionSector._updateRotation(bearing);
          });

          // Fallback to regular deviceorientation event if absolute is not available
          window.addEventListener('deviceorientation', function(event) {
            if (event.webkitCompassHeading) {
              // iOS devices
              let bearing = event.webkitCompassHeading;
              directionSector._updateRotation(bearing);
            } else if (event.alpha) {
              // Android devices
              let bearing = 360 - event.alpha;
              directionSector._updateRotation(bearing);
            }
          });
        }

        // Gold coin icon setup
        const goldCoinIcon = L.icon({
          iconUrl: 'asset/gold-coin.png',  // Path to your uploaded icon
          iconSize: [20, 20],  // Icon size
          iconAnchor: [10, 10],  // Anchor point
          popupAnchor: [0, -10], // Popup position
        });

        // Overpass API Query to find nearby POIs (parks, libraries, etc.)
        const query = `
          [out:json];
          (
            node["amenity"="park"](around:1000,${userLat},${userLng});
            node["amenity"="library"](around:1000,${userLat},${userLng});
            node["amenity"="recreation_ground"](around:1000,${userLat},${userLng});
            node["amenity"="restaurant"](around:1000,${userLat},${userLng});
            node["amenity"="shop"](around:1000,${userLat},${userLng});
            node["amenity"="pub"](around:1000,${userLat},${userLng});
            node["amenity"="bank"](around:1000,${userLat},${userLng});
          );
          out body;
        `;


        // Fetch the nearby POIs using the Overpass API
        fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`)
          .then(response => response.json())
          .then(data => {
            // Loop through each POI and add a gold coin marker
            data.elements.forEach(element => {
              const lat = element.lat;
              const lon = element.lon;
              const name = element.tags.name || "Unnamed place";

              // Add gold coin marker for each POI
              L.marker([lat, lon], { icon: goldCoinIcon })
                .addTo(map)
                .bindPopup(name)
                .openPopup();
            });
          })
          .catch(error => {
            console.error("Error fetching POIs:", error);
            alert("Failed to fetch nearby places.");
          });
      },
      (error) => {
        console.error("Geolocation failed:", error);
        alert("Location access denied. Map cannot show your position.");
      }
    );
  } else {
    alert("Geolocation is not supported by your browser.");
  }
});