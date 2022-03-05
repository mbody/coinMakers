const io = require('socket.io')();
const { initGame, gameLoop, addPlayer } = require('./game');
const { FRAME_RATE } = require('./constants');
const { makeid } = require('./utils');

const state = {};
const clientRooms = {};


const log = (msg, data) => {
  console.log(msg, data);
}

io.on('connection', client => {

  client.on('input', handleInput);
  client.on('newGame', handleNewGame);
  client.on('joinGame', handleJoinGame);

  function handleJoinGame(roomName) {
    log("Game join" , {roomName});
    const room = io.sockets.adapter.rooms[roomName];

    clientRooms[client.id] = roomName;

    client.join(roomName);
    const playerId = makeid(10);
    client.playerId = playerId;
    const player = addPlayer(state[roomName], playerId);

    client.emit('init', {playerId, nickname: player.nickname, roomName});

    emitGameState(roomName, state[roomName]);
    //startGameInterval(roomName);
  }

  function handleNewGame() {
    let roomName = makeid(4);
    clientRooms[client.id] = roomName;
    client.emit('gameCode', roomName);


    client.join(roomName);
    const playerId = makeid(10);
    client.playerId = playerId;

    state[roomName] = initGame(playerId);
    client.emit('init', {playerId, roomName, nickname: state[roomName].players[0].nickname});
    emitGameState(roomName, state[roomName]);
    log("New game" , {roomName, state:state[roomName], nickname: state[roomName].players[0].nickname});
  }

  function handleInput(direction){
    const roomName = clientRooms[client.id];
    if (!roomName) {
      return;
    }
    gameLoop(state[roomName], direction, client.playerId);
    emitGameState(roomName, state[roomName]);
  }

  function handleKeydown(keyCode) {
    log("KeyDown" , {keyCode});
    const roomName = clientRooms[client.id];
    if (!roomName) {
      return;
    }
    try {
      keyCode = parseInt(keyCode);
    } catch(e) {
      console.error(e);
      return;
    }

    const vel = getUpdatedVelocity(keyCode);

    if (vel) {
      state[roomName].players[client.number - 1].vel = vel;
    }
  }
});

/*
function startGameInterval(roomName) {
  const intervalId = setInterval(() => {
    const winner = gameLoop(state[roomName]);

    if (!winner) {
      emitGameState(roomName, state[roomName])
    } else {
      emitGameOver(roomName, winner);
      state[roomName] = null;
      clearInterval(intervalId);
    }
  }, 1000 / FRAME_RATE);
}
*/

function emitGameState(room, gameState) {
  log("Game state" , {room, gameState});
  // Send this event to everyone in the room.
  io.sockets.in(room)
    .emit('gameState', JSON.stringify(gameState));
}

function emitGameOver(room, winner) {
  log("Game over" , {room, winner});
  io.sockets.in(room)
    .emit('gameOver', JSON.stringify({ winner }));
}

const port = process.env.PORT || 3000;
io.listen(port);


log("Starting server on port " , port);