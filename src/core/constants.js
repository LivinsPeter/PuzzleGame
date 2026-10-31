export const WALL = { N: 1, E: 2, S: 4, W: 8 };

export const DIRECTIONS = {
  UP: { name: 'UP', dr: -1, dc: 0, wall: WALL.N, opposite: WALL.S },
  RIGHT: { name: 'RIGHT', dr: 0, dc: 1, wall: WALL.E, opposite: WALL.W },
  DOWN: { name: 'DOWN', dr: 1, dc: 0, wall: WALL.S, opposite: WALL.N },
  LEFT: { name: 'LEFT', dr: 0, dc: -1, wall: WALL.W, opposite: WALL.E }
};

export const DIRECTION_NAMES = ['UP', 'RIGHT', 'DOWN', 'LEFT'];
export const ALL_WALLS = 15;
