const BG_COLOUR = '#231f20';
const SNAKE_COLOUR = '#c2c2c2';
const FOOD_COLOUR = '#e66916';

const socket = io('https://makerskids.loca.lt');

socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('unknownCode', handleUnknownCode);
socket.on('tooManyPlayers', handleTooManyPlayers);

const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');

newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);


// GLOBAL GAME STATE
const GLOBAL = {
  gameState: false
}

function log(msg, data) {
  console.log(msg, data);
}

function newGame() {
  socket.emit('newGame');
  init();
}

function joinGame() {
  const code = gameCodeInput.value;
  socket.emit('joinGame', code);
  init();
}

let canvas, ctx;
let playerNumber;
let gameActive = false;

function init() {
  initialScreen.style.display = "none";
  gameScreen.style.display = "block";
  gameActive = true;
}

function handleInit({playerId, nickname, roomName}) {
  log("init", {playerId, nickname, roomName});
  GLOBAL.currentPlayerId = playerId;
  document.getElementById('playerName').innerText = nickname;
  handleGameCode(roomName);
}

function handleGameState(gameState) {
  /*
  if (!gameActive) {
    return;
  }
   */
  log("new game state : ", gameState);

  var gameState = JSON.parse(gameState);

  gameState.players = gameState.players.sort(function(a,b){ return  b.points - a.points});
  GLOBAL.gameState = gameState;
  //requestAnimationFrame(() => paintGame(gameState));
}

function handleGameOver(gameState) {
  var gameState = JSON.parse(gameState);

  var isWinner = false;
  gameState.players.forEach(p=>{
    if(p.isWinner && p.id == GLOBAL.currentPlayerId){
      isWinner = true;
    }
  });

  gameActive = false;

  if (isWinner) {
    alert('You Win!');
  } else {
    alert('You Lose :(');
  }
  reset();
}

function handleGameCode(gameCode) {
  gameCodeDisplay.innerText = gameCode;
}

function handleUnknownCode() {
  reset();
  alert('Unknown Game Code')
}

function handleTooManyPlayers() {
  reset();
  alert('This game is already in progress');
}

function reset() {
  playerNumber = null;
  gameCodeInput.value = '';
  initialScreen.style.display = "block";
  gameScreen.style.display = "none";
}


//------

var players = document.querySelector(".players");
var map = document.querySelector(".map");
var coin = document.querySelector(".coin");
var debug = document.querySelector(".debug");

var audio = new Audio('https://opengameart.org/sites/default/files/Picked%20Coin%20Echo.wav');

//start in the middle of the map

var held_directions = []; //State of which arrow keys we are holding down

var COIN_SIZE = 16;

var DIFF = 10;


const gameLoop = () => {

  const gameState = GLOBAL.gameState;
  if (!gameState) return;

  const pixelSize = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--pixel-size')
  );
  GLOBAL.pixelSize = pixelSize;
  coin.style.transform = `translate3d( ${(gameState.coin.x + COIN_SIZE / 2) * GLOBAL.pixelSize}px, ${(gameState.coin.y + COIN_SIZE) * GLOBAL.pixelSize}px, 0 )`;

  let currentPlayer;
  gameState.players.forEach(player => {
    if(player.id == GLOBAL.currentPlayerId){
      currentPlayer = player;
    }
    drawPlayer(player);
  });

  const held_direction = held_directions[0];
  if (held_direction) {
    socket.emit('input', held_direction);
  }

  var camera_left = pixelSize * 66;
  var camera_top = pixelSize * 42;

  map.style.transform = `translate3d( ${-currentPlayer.x * pixelSize + camera_left}px, ${-currentPlayer.y * pixelSize + camera_top}px, 0 )`;

  update_leaderboard();
}


//Set up the game loop
/*
const step = () => {
  gameLoop();
  window.requestAnimationFrame(() => {
    step();
  })
}*/
//step(); //kick off the first step!
setInterval(gameLoop, 30);


/* Direction key state */
const directions = {
  up: "up",
  down: "down",
  left: "left",
  right: "right",
}
const keys = {
  38: directions.up,
  37: directions.left,
  39: directions.right,
  40: directions.down,
}

document.addEventListener("keydown", (e) => {
  var dir = keys[e.which];
  if (dir && held_directions.indexOf(dir) === -1) {
    held_directions.unshift(dir)
  }
})

document.addEventListener("keyup", (e) => {
  var dir = keys[e.which];
  var index = held_directions.indexOf(dir);
  if (index > -1) {
    held_directions.splice(index, 1)
  }
});




let leaderboard_list_wrap = document.querySelector("#leaderboard .list");

function update_leaderboard() {
  while (leaderboard_list_wrap.firstChild) {
    leaderboard_list_wrap.firstChild.remove();
  }
  GLOBAL.gameState.players.forEach((c) => {
    let div = document.createElement("div");
    div.innerHTML = `${c.nickname} : ${c.points}`;
    leaderboard_list_wrap.appendChild(div);
  });
}

/**
 *
 <div class="character" facing="down" walking="true">
 <div class="shadow pixel-art"></div>
 <div class="character_spritesheet pixel-art"></div>
 </div>


 * @param player
 */
function drawPlayer(player){
  let playerDiv = document.getElementById(player.id);
  if(!playerDiv){
    playerDiv = createPlayer(player)
  }
  playerDiv.setAttribute("facing", player.direction);
  playerDiv.setAttribute("walking", player.walking);
  playerDiv.style.transform = `translate3d( ${player.x * GLOBAL.pixelSize}px, ${player.y * GLOBAL.pixelSize}px, 0 )`;
}

function createPlayer(player){
  let playerDiv = document.createElement("div");
  playerDiv.setAttribute("id", player.id);
  playerDiv.setAttribute("class", "character");
  playerDiv.innerHTML = `
    <div class="shadow pixel-art"></div>
    <div class="character_spritesheet pixel-art" style="filter: hue-rotate(${player.hue}deg)"></div>
`;
  players.appendChild(playerDiv);
  return playerDiv;
}



