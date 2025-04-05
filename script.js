

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

