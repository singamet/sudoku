const isValid = (
  row: number,
  col: number,
  num: number,
  rows: Set<number>[],
  cols: Set<number>[],
  grids: Set<number>[]
): boolean => {
  const gridIndex = Math.floor(row / 3) * 3 + Math.floor(col / 3);
  return (
    !rows[row].has(num) && !cols[col].has(num) && !grids[gridIndex].has(num)
  );
};

const processBoard = (
  board: number[][],
  shouldShuffle: boolean = false
): boolean => {
  const rows: Set<number>[] = Array.from({ length: 9 }, () => new Set());
  const cols: Set<number>[] = Array.from({ length: 9 }, () => new Set());
  const grids: Set<number>[] = Array.from({ length: 9 }, () => new Set());

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] !== 0) {
        rows[row].add(board[row][col]);
        cols[col].add(board[row][col]);
        const gridIndex = Math.floor(row / 3) * 3 + Math.floor(col / 3);
        grids[gridIndex].add(board[row][col]);
      }
    }
  }

  const solve = (
    board: number[][],
    shouldShuffle: boolean = false
  ): boolean => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
          if (shouldShuffle) shuffleArray(numbers);
          for (const num of numbers) {
            if (isValid(row, col, num, rows, cols, grids)) {
              board[row][col] = num;
              rows[row].add(num);
              cols[col].add(num);
              grids[Math.floor(row / 3) * 3 + Math.floor(col / 3)].add(num);
              if (solve(board, shouldShuffle)) return true;
              board[row][col] = 0;
              rows[row].delete(num);
              cols[col].delete(num);
              grids[Math.floor(row / 3) * 3 + Math.floor(col / 3)].delete(num);
            }
          }
          return false;
        }
      }
    }
    return true;
  };

  return solve(board, shouldShuffle);
};

const shuffleArray = (array: number[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

export const generateSudoku = (): number[][] => {
  const board = Array.from({ length: 9 }, () => Array(9).fill(0));
  processBoard(board, true);
  return board;
};

export const solveSudoku = (board: number[][]): boolean => {
  return processBoard(board, false);
};

export const starterBoard = (
  solutionBoard: number[][]
): {
  board: number[][];
  visibleCells: Set<string>;
  numCounts: Record<number, number>;
} => {
  // Create a deep copy of the solution board to start with
  const board = solutionBoard.map((row) => row.slice());
  const visibleCells = new Set<string>();

  const removeNumberAndCheck = (row: number, col: number): boolean => {
    const removedNumber = board[row][col];
    board[row][col] = -200;

    const boardCopy = board.map((row) => row.slice());
    const isUnique = solveSudoku(boardCopy);

    board[row][col] = removedNumber;
    if (!isUnique) {
      return false;
    } else {
      return true;
    }
  };

  for (let row = 0; row < 9; row++) {
    const col = Math.floor(Math.random() * 9);
    visibleCells.add(`${row},${col}`);
  }

  for (let col = 0; col < 9; col++) {
    const row = Math.floor(Math.random() * 9);
    visibleCells.add(`${row},${col}`);
  }

  for (let gridRow = 0; gridRow < 3; gridRow++) {
    for (let gridCol = 0; gridCol < 3; gridCol++) {
      const row = 3 * gridRow + Math.floor(Math.random() * 3);
      const col = 3 * gridCol + Math.floor(Math.random() * 3);
      visibleCells.add(`${row},${col}`);
    }
  }

  while (visibleCells.size < 30) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (visibleCells.has(`${row},${col}`)) continue;

    if (removeNumberAndCheck(row, col)) {
      visibleCells.add(`${row},${col}`);
    }
  }

  const numCounts: Record<number, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    9: 0,
  };
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (!visibleCells.has(`${row},${col}`)) {
        board[row][col] = -1;
        numCounts[solutionBoard[row][col]]++;
      }
    }
  }

  return { board, visibleCells, numCounts };
};
