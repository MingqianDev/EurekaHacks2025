window.addEventListener("load", () => {
  if (navigator.geolocation) {
    // Initialize map with current position first
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        // Initialize the map at user's location
        const map = L.map('map', {
          zoomControl: false,
          attributionControl: true,
          dragging: true,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          boxZoom: true,
          keyboard: true,
          tap: true,
          touchZoom: true,
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

        // Function to fetch POIs
        function fetchPOIs(lat, lng) {
          // Overpass API Query to find nearby POIs
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
        }

        // Initial POI fetch
        fetchPOIs(userLat, userLng);

        // Initialize stats
        let totalMoney = 0;
        let health = 100;
        let hunger = 100;

        const moneyCounter = document.getElementById('money-counter');
        const moneyBar = document.getElementById('money-bar');
        const healthCounter = document.getElementById('health-counter');
        const healthBar = document.getElementById('health-bar');
        const hungerCounter = document.getElementById('hunger-counter');
        const hungerBar = document.getElementById('hunger-bar');

        // Function to update money display
        function updateMoneyDisplay(amount) {
          totalMoney = amount;
          moneyCounter.textContent = `$${totalMoney}`;
          // Update money bar (assuming max is 1000)
          const percentage = Math.min((totalMoney / 1000) * 100, 100);
          moneyBar.style.width = `${percentage}%`;
        }

        // Function to update health display
        function updateHealthDisplay(amount) {
          health = Math.max(0, Math.min(100, amount));
          healthCounter.textContent = `${health}/100`;
          healthBar.style.width = `${health}%`;
        }

        // Function to update hunger display
        function updateHungerDisplay(amount) {
          hunger = Math.max(0, Math.min(100, amount));
          hungerCounter.textContent = `${hunger}/100`;
          hungerBar.style.width = `${hunger}%`;
        }

        // Initialize displays
        updateHealthDisplay(100);
        updateHungerDisplay(100);
        updateMoneyDisplay(0);

        // Watch position changes
        const watchId = navigator.geolocation.watchPosition(
          (newPosition) => {
            const newLat = newPosition.coords.latitude;
            const newLng = newPosition.coords.longitude;
            
            // Update marker position
            marker.setLatLng([newLat, newLng]);
            
            // Update map center to follow the marker
            map.setView([newLat, newLng], map.getZoom());

            // Update POIs when position changes significantly
            const distance = L.latLng([userLat, userLng]).distanceTo([newLat, newLng]);
            if (distance > 100) { // Update POIs if moved more than 100 meters
              fetchPOIs(newLat, newLng);
              // Update stats when moving (for testing)
              updateMoneyDisplay(totalMoney + 50);
              updateHealthDisplay(health - 5);
              updateHungerDisplay(hunger - 10);
            }
          },
          (error) => {
            console.error("Error watching position:", error);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 1000, // Maximum cache age in milliseconds
            timeout: 5000 // How long to wait for a position
          }
        );
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