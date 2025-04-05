const config = {
  type: Phaser.AUTO,
  width: 600,
  height: 400,
  parent: 'phaser-game',
  backgroundColor: '#448844',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);

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