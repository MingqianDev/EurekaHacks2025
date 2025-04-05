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