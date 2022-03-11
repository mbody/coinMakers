const { DIRECTIONS } = require('./constants');

module.exports = {
  initGame,
  gameLoop,
  addPlayer
}


// position min max pour la piece
const minX = 0;
const maxX = 180;
const minY = 30;
const maxY = 110;
const DIFF = 10;

function initGame(playerId) {
  const state = createGameState(playerId)
  randomCoin(state);
  return state;
}

function createGameState(playerId) {
  return {
    players: [
      randomPlayer(playerId)
    ],
    coin : randomPos()
  };
}

function addPlayer(gameState, playerId){
  const player = randomPlayer(playerId);
  gameState.players.push(player);
  return player;
}

function gameLoop(gameState, direction, playerId) {

  let player;
  gameState.players.forEach(p => {
    if(p.id == playerId) player = p;
  });

  const speed = player.speed;
  let x = player.x;
  let y = player.y;
  player.direction = direction;
  player.walking = true;
  switch (direction){
    case DIRECTIONS.right:
      x += speed;
      break;
    case DIRECTIONS.left:
      x -= speed;
      break;
    case DIRECTIONS.down:
      y += speed;
      break;
    case DIRECTIONS.up:
      y -= speed;
      break;
  }

  //Limits (gives the illusion of walls)
  var leftLimit = -8;
  var rightLimit = (16 * 11) + 8;
  var topLimit = -8 + 32;
  var bottomLimit = (16 * 7);
  if (x < leftLimit) {
    x = leftLimit;
  }
  if (x > rightLimit) {
    x = rightLimit;
  }
  if (y < topLimit) {
    y = topLimit;
  }
  if (y > bottomLimit) {
    y = bottomLimit;
  }

  player.x = x;
  player.y = y;

  // test if coin is picked up
  if (gameState.coin.x - DIFF < x && x < gameState.coin.x + DIFF && gameState.coin.y - DIFF < y && y < gameState.coin.y + DIFF) {
    randomCoin(gameState);
    player.points += 5;

    if(player.points >= 100){
      player.isWinner = true;
      return true;
    }
  }

  return false;
}

function randomCoin(state) {
  state.coin = randomPos();
}

function randomPlayer(playerId){
  return       {
    id: playerId,
    nickname: randomNickname(),
    hue: Math.floor(Math.random()*360),
    points: 0,
    ...randomPos(),
    speed: 3,
  }
}

function randomPos(){
  return {
    x: Math.floor(Math.random()*(maxX-minX)) + minX,
    y: Math.floor(Math.random()*(maxY-minY)) + minY,
  };
}

function randomNickname(){
  var name1 = ["Hippopotame", "Hippocampe", "Loutre", "Renard","Chat","Chien","Pinson","Loup", "Requin", "Aigle", "Lion", "Puma", "Escargot", "Scarabée", "Cloporte", "Lézard", "Croco"];

  var name2 = ["magique", "violet", "invisible", "noir", "jaune", "malin", "vert", "gris", "sournois", "malicieux", "rusé", "enragé", "musclé", "intrépide"];

  return name1[Math.floor(Math.random()* name1.length)] + ' ' + name2[Math.floor(Math.random()* name2.length)];

}
