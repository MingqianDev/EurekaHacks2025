// Map related functions
let map = null;
let userMarker = null;

function initializeMap(latitude, longitude) {
  map = L.map('map', {
    zoomControl: false,
    attributionControl: false,
    dragging: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    boxZoom: false,
    keyboard: false,
    tap: false,
    touchZoom: false,
  }).setView([latitude, longitude], 16);

  addMapTileLayer();
  addPlayerMarker(latitude, longitude);
}

function addMapTileLayer() {
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
}

function addPlayerMarker(latitude, longitude) {
  userMarker = L.marker([latitude, longitude]).addTo(map);
  userMarker.bindPopup("You are here!").openPopup();
}

function handleLocationError(error) {
  console.error("Geolocation failed:", error);
  alert("Location access denied. Map cannot show your position.");
}

function initializeGeolocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        initializeMap(userLat, userLng);
      },
      handleLocationError
    );
  } else {
    alert("Geolocation is not supported by your browser.");
  }
}

// Phaser game related functions
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'phaser-game',
  backgroundColor: '#448844',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

function initializeGame() {
  return new Phaser.Game(config);
}

function preload() {
  this.load.image('character', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
}

function create() {
  this.player = this.add.sprite(300, 200, 'character');
  this.player.setScale(0.5);
}

function update() {
  // game logic
}

// Initialize everything when page loads
window.addEventListener("load", () => {
  initializeGeolocation();
  const game = initializeGame();
});

