const FRAME_RATE = 30;
const GRID_SIZE = 20;

const DIRECTIONS = {
  up: "up",
  down: "down",
  left: "left",
  right: "right",
}

const MAP_HEIGHT = 28;
const MAP_WIDTH = 28;
const TILE_SIZE = 16;

const LIMITS = {
  top:-TILE_SIZE/2,
  left:-TILE_SIZE/2,
  right:(TILE_SIZE * MAP_WIDTH)-1.5*TILE_SIZE,
  bottom:(TILE_SIZE * MAP_HEIGHT)-2*TILE_SIZE,
}

const MAX_SCORE = 50;

module.exports = {
  FRAME_RATE,
  GRID_SIZE,
  DIRECTIONS,
  LIMITS,
  MAX_SCORE
}
