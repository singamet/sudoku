import { useEffect, useState } from "react";
import { generateSudoku } from "./logic";
import { starterBoard } from "./logic";
import Modal, { ModalType } from "./Modal";

function App() {
  const [solution, setSolution] = useState<number[][] | undefined>();
  const [board, setBoard] = useState<number[][] | undefined>();
  const [lockedCells, setLockedCells] = useState<Set<string>>();
  const [valueCounts, setValueCounts] = useState<Record<number, number>>();
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
  }>({ row: 0, col: 0 });
  const [mistakes, setMistakes] = useState<
    {
      row: number;
      col: number;
      value: number;
    }[]
  >([]);
  const [modal, setModal] = useState<ModalType>({
    isOpen: false,
    onClose: () => {},
    onConfirm: () => {},
    header: "",
    message: "",
    optionConfirm: "",
    optionClose: "",
  });
  const [newGame, setNewGame] = useState(false);
  useEffect(() => {
    const generate = generateSudoku();
    console.log(generate);
    if (generate) {
      setSolution(generate);
      const { board, visibleCells, numCounts } = starterBoard(generate);
      setBoard(board);
      console.log(board);
      console.log(visibleCells);
      setLockedCells(visibleCells);
      setValueCounts(numCounts);
      setMistakes([]);
      setSelectedCell({ row: 0, col: 0 });
      setModal({
        isOpen: false,
        onClose: () => {},
        onConfirm: () => {},
        header: "",
        message: "",
        optionConfirm: "",
        optionClose: "",
      });
    }
  }, [newGame]);
  useEffect(() => {
    if (mistakes.length > 4) {
      setModal({
        isOpen: true,
        onClose: () => {
          setModal((prev) => ({ ...prev, isOpen: false }));
        },
        onConfirm: () => {
          setNewGame((prev) => !prev);
        },
        header: "GAME OVER",
        message: "You made too many mistakes. Try Again?",
        optionConfirm: "Play New Game",
        optionClose: "",
      });
    }
  }, [mistakes.length]);

  useEffect(() => {
    const checkGameComplete = (): boolean => {
      if (board && solution) {
        for (let row = 0; row < 9; row++) {
          for (let col = 0; col < 9; col++) {
            if (board[row][col] !== solution[row][col]) {
              return false;
            }
          }
        }
        return true;
      }
      return false;
    };
    if (checkGameComplete()) {
      setModal({
        isOpen: true,
        onClose: () => {
          setModal((prev) => ({ ...prev, isOpen: false }));
        },
        onConfirm: () => {
          setNewGame((prev) => !prev);
        },
        header: "Congratulations!",
        message: "You completed the game!",
        optionConfirm: "New Game",
        optionClose: "",
      });
    }
  }, [board, solution]);
  if (!board || !lockedCells || !solution || !valueCounts) {
    return <p>Error!</p>;
  }
  const checkValueMatch = (value: number) => {
    if (!lockedCells.has(`${selectedCell.row},${selectedCell.col}`)) {
      const currVal = board[selectedCell.row][selectedCell.col];
      if (value === currVal) {
        eraseCurrent();
        return;
      }
      const newBoard = board.map((b) => b.slice());
      newBoard[selectedCell.row][selectedCell.col] = value;
      setBoard(newBoard);
      setValueCounts((prev) => {
        if (prev) {
          const newValueCount = { ...prev };
          if (newValueCount[value] > 0 && newValueCount[value] < 10) {
            newValueCount[value] -= 1;
            if (currVal !== -1) {
              newValueCount[currVal] += 1;
            }
          }
          return newValueCount;
        }
        return prev;
      });

      if (solution[selectedCell.row][selectedCell.col] !== value) {
        setMistakes((prev) => {
          return [
            ...prev,
            { row: selectedCell.row, col: selectedCell.col, value },
          ];
        });
      }
    }
  };
  const eraseCurrent = () => {
    if (
      !lockedCells.has(`${selectedCell.row},${selectedCell.col}`) &&
      board[selectedCell.row][selectedCell.col] !== -1
    ) {
      const value = board[selectedCell.row][selectedCell.col];
      const newBoard = board.map((b) => b.slice());
      newBoard[selectedCell.row][selectedCell.col] = -1;
      setBoard(newBoard);
      setValueCounts((prev) => {
        if (prev) {
          const newValueCount = { ...prev };
          if (newValueCount[value] >= 0 && newValueCount[value] < 10) {
            newValueCount[value] += 1;
          }
          return newValueCount;
        }
        return prev;
      });
    }
  };
  const handleNewGameClick = () => {
    setModal({
      isOpen: true,
      onClose: () => {
        setModal((prev) => ({ ...prev, isOpen: false }));
      },
      onConfirm: () => {
        setNewGame((prev) => !prev);
      },
      header: "Are you sure?",
      message: "You will lose current progress!",
      optionConfirm: "New Game",
      optionClose: "Cancel",
    });
  };
  const isSameGrid = (row: number, col: number): boolean => {
    const gridRowStart = 3 * Math.floor(selectedCell.row / 3);
    const gridColStart = 3 * Math.floor(selectedCell.col / 3);
    return (
      row >= gridRowStart &&
      row < gridRowStart + 3 &&
      col >= gridColStart &&
      col < gridColStart + 3
    );
  };
  const isLocked = (row: number, col: number): boolean => {
    if (lockedCells) {
      return lockedCells.has(`${row},${col}`);
    }
    return false;
  };
  const isSelected = (row: number, col: number): boolean => {
    return selectedCell.row === row && selectedCell.col === col;
  };
  const isMistake = (row: number, col: number): boolean => {
    const existsIndex = mistakes.findIndex(
      (m) => m.row === row && m.col === col
    );
    return existsIndex !== -1 && board[row][col] !== solution[row][col];
  };
  const isHighlightMistake = (row: number, col: number): boolean => {
    return (
      isBuddy(row, col) &&
      board[row][col] !== -1 &&
      board[selectedCell.row][selectedCell.col] === board[row][col] &&
      board[row][col] !== solution[selectedCell.row][selectedCell.col]
    );
  };
  const isBuddy = (row: number, col: number): boolean => {
    return (
      !isSelected(row, col) &&
      (selectedCell.row === row ||
        selectedCell.col === col ||
        isSameGrid(row, col))
    );
  };
  const isHighlighted = (row: number, col: number): boolean => {
    if (
      !isSelected(row, col) &&
      board[row][col] !== -1 &&
      board[row][col] === board[selectedCell.row][selectedCell.col]
    ) {
      return true;
    }
    return false;
  };
  const setCellStyle = (row: number, col: number): string => {
    let style = "";
    if (isMistake(row, col)) {
      style = "mistake ";
    }
    if (isLocked(row, col)) {
      style += "locked ";
    }
    if (isHighlighted(row, col)) {
      style += "highlighted ";
    }
    if (isBuddy(row, col)) {
      style += "buddy ";
    }
    if (isHighlightMistake(row, col)) {
      style += "mistake-highlight";
    }
    if (isSelected(row, col)) {
      style += "selected ";
    }
    return style;
  };
  return (
    <div className="app">
      <h1>SUDOKU</h1>
      <main>
        <div className="menu">
          <p>Mistakes: {mistakes.length}/5</p>
          <div className="input-buttons">
            {Array.from({ length: 9 }, (_, i) => i + 1).map((val) => (
              <button
                key={val}
                onClick={() => checkValueMatch(val)}
                disabled={valueCounts[val] === 0}
              >
                <span className="value-count">{valueCounts[val]}</span>
                {val}
              </button>
            ))}
          </div>
          <div className="action-buttons">
            <button onClick={() => eraseCurrent()}>Erase</button>
            <button onClick={handleNewGameClick}>New Game</button>
          </div>
        </div>
        <div className="board">
          {board &&
            board.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <button
                  className={setCellStyle(rowIndex, colIndex)}
                  key={`${rowIndex},${colIndex}`}
                  onClick={() =>
                    setSelectedCell({ row: rowIndex, col: colIndex })
                  }
                >
                  {cell === -1 ? "" : cell}
                </button>
              ))
            )}
        </div>
        <div className="instructions">
          <h2>HOW TO PLAY</h2>
          <h3>Objective</h3>
          <p>
            Fill the 9x9 grid with digits so that each column, each row, and
            each of the nine 3x3 subgrids contain all the digits from 1 to 9.
          </p>

          <h3>Steps to Play</h3>
          <ul>
            <li>
              <b>Start with a Given Puzzle</b>: A partially filled 9x9 grid will
              be provided.
            </li>
            <li>
              <b>Identify Missing Numbers</b>: Determine which numbers are
              missing in each row, column, and subgrid.
            </li>
            <li>
              <b>Eliminate Possibilities</b>: Use process of elimination to find
              the correct number for each empty cell.
            </li>
            <li>
              <b>Place Digits</b>: Fill in the numbers based on logical
              deduction, not guessing.
            </li>
            <li>
              <b>Track Mistakes</b>: Any mistake adds up, and 5 mistakes result
              in game over.
            </li>
            <li>
              <b>Complete the Puzzle</b>: Ensure all cells are filled correctly
              according to the rules.
            </li>
          </ul>
        </div>
      </main>
      <Modal {...modal} />
    </div>
  );
}

export default App;
