import { createMaze, setWall } from './maze.js';

export const FIXTURE_SOLUTION = ['RIGHT', 'RIGHT', 'DOWN', 'RIGHT', 'RIGHT', 'DOWN', 'DOWN', 'LEFT', 'LEFT', 'UP'];

export function createFixtureMaze() {
  const maze = createMaze(5, 5);
  const path = [
    [0, 0], [0, 1], [0, 2], [1, 2], [1, 3], [1, 4],
    [2, 4], [3, 4], [3, 3], [3, 2], [2, 2]
  ];

  for (let i = 1; i < path.length; i += 1) {
    carveBetween(maze, path[i - 1], path[i]);
  }

  setWall(maze, 0, 2, 'RIGHT', false);
  setWall(maze, 3, 4, 'DOWN', false);
  maze.target = { r: 2, c: 2 };
  return maze;
}

function carveBetween(maze, from, to) {
  if (to[0] < from[0]) setWall(maze, from[0], from[1], 'UP', false);
  else if (to[0] > from[0]) setWall(maze, from[0], from[1], 'DOWN', false);
  else if (to[1] < from[1]) setWall(maze, from[0], from[1], 'LEFT', false);
  else setWall(maze, from[0], from[1], 'RIGHT', false);
}
