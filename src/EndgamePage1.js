import { useState, useEffect, useRef } from "react";
import Chessground from "@react-chess/chessground";
import { Chess } from "chess.js";
import "chessground/assets/chessground.base.css";
import "chessground/assets/chessground.brown.css";
import "chessground/assets/chessground.cburnett.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Board from "./board/Board.tsx";
import * as cg from "chessground/types";


function getRandomPosition() {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];

  const randomFile = files[Math.floor(Math.random() * files.length)];
  const randomRank = ranks[Math.floor(Math.random() * ranks.length)];

  return `${randomFile}${randomRank}`; // Возвращаем строку для позиции
}



// Пример эндшпилей с типами фигур
const endgames = {
  "Пешка против короля": {
    pieces: [
      { role: "king", color: "white" },
      { role: "pawn", color: "white" },
      { role: "king", color: "black" },
    ],
  },
  "Ферзь против ладьи": {
    pieces: [
      { role: "queen", color: "white" },
      { role: "king", color: "white" },
      { role: "rook", color: "black" },
      { role: "king", color: "black" },
    ],
  },
};

// EndgamePage.js
export default function EndgamePage() {

  const boardRef = useRef(null);
  const [fen, setFen] = useState(""); // FEN текущей позиции
  const [selectedEndgame, setSelectedEndgame] = useState(""); // Выбранный эндшпиль
  const [game, setGame] = useState(new Chess()); // Chess.js игра
  const gameRef = useRef(new Chess()); // Внутренняя игра для проверки ходов
  console.log(endgames);
  
  // Генерация случайных позиций для фигур эндшпиля
  const generateRandomPieces = (endgame) => {
    const pieceMap = new Map();
    const placedSquares = new Set();

    let whiteKingPos, blackKingPos;

    // Размещение фигур
    for (let piece of endgame.pieces) {
      let square;
      do {
        square = randomSquare();
      } while (placedSquares.has(square)); // Избегаем дублирования клеток
      placedSquares.add(square);

      // Запоминаем позиции королей для последующей проверки
      if (piece.role === "king" && piece.color === "white") {
        whiteKingPos = square;
      } else if (piece.role === "king" && piece.color === "black") {
        blackKingPos = square;
      }

      pieceMap.set(square, piece);
    }

    // Проверка валидности позиций королей
    if (whiteKingPos && blackKingPos && !isValidPosition(whiteKingPos, blackKingPos)) {
      // Если позиции королей невалидны, перезапускаем генерацию
      return generateRandomPieces(endgame);
    }

    return pieceMap;
  };
//Доделать, ничего не доделано, код из чатагпт
  function handleMove(){
    //pass
  }
  return (
    <div>
      <h1>Страница эндшпиляя</h1>
      <label htmlFor="endgameSelect">Выберите эндшпиль:</label>
      <select
        id="endgameSelect"
        value={selectedEndgame}
        onChange={(e) => setSelectedEndgame(e.target.value)}
        style={{ margin: "10px" }}
      >
        <option value="">-- Выберите эндшпиль --</option>
        {Object.keys(endgames).map((endgame) => (
          <option key={endgame} value={endgame}>
            {endgame}
          </option>
        ))}
      </select>
      <Board
        ref={boardRef}
        fen={fen}
        orientation="white"
        events={{
          move: (orig, dest) => handleMove(orig, dest),
        }}
      />
      <ToastContainer />
    </div>
  );
  }
  
  