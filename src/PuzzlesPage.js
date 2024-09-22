import { useEffect, useState } from 'react';
import { Chess } from 'chess.js';
import Chessboard from 'chessboardjsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Дефолтный FEN, который будет использоваться до получения данных
const DEFAULT_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export default function PuzzlesPage() {
  const [fen, setFen] = useState(DEFAULT_FEN);
  const [game, setGame] = useState(new Chess(fen));
  const [correctMoves, setCorrectMoves] = useState([]);
  const [isUserTurn, setIsUserTurn] = useState(false);
  const [moveIndex, setMoveIndex] = useState(0);
  const [oldRating, setOldRating] = useState(null);
  const [puzzleRating, setPuzzleRating] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [boardOrientation, setBoardOrientation] = useState(false);
  const [newRating, setNewRating] = useState(0);

  function getRandomPuzzle() {
    fetch('http://localhost:5000/api/random-puzzle')
      .then((response) => response.json())
      .then((data) => {
        console.log('Получена новая задача:', data); // Выводим данные новой задачи
        setFen(data.fen);
        setCorrectMoves(data.moves.split(' '));
        setGame(new Chess(data.fen));
        setIsUserTurn(data.fen.charAt(data.fen.length - 10) === 'w');
        setMoveIndex(0);
        setPuzzleRating(data.rating);
        setBoardOrientation(data.fen.charAt(data.fen.length - 10));
        const storedRating = parseInt(localStorage.getItem('rating'));
        setOldRating(storedRating);
      })
      .catch((error) => {
        console.error('Ошибка при получении задачи:', error);
      });
  }

  useEffect(() => {
    getRandomPuzzle();
  }, []);

  useEffect(() => {
    if (fen) {
      const gameCopy = new Chess(fen);
      setGame(gameCopy);
      console.log('Обновлено FEN:', fen); // Выводим новое значение FEN
    }
  }, [fen]);

  const updateUserRating = async (newRating) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const response = await fetch('http://localhost:5000/api/update-rating', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ newRating: newRating }),
    });

    if (response.ok) {
      const updatedData = await response.json();
      setOldRating(updatedData.newRating);
      localStorage.setItem('rating', updatedData.newRating);
    } else {
      console.error('Ошибка при обновлении рейтинга:', await response.json());
    }
  };

  function isMoveCorrect(move) {
    return correctMoves.includes(move);
  }

  function handleDrop({ sourceSquare, targetSquare, piece }) {
    if (!isUserTurn || isAnimating) {
      console.log('Не ваш ход или анимация еще не завершилась');
      return;
    }

    const move = sourceSquare + targetSquare;

    if (isMoveCorrect(move)) {
      game.move({
        from: sourceSquare,
        to: targetSquare,
        piece: piece.toLowerCase(),
      });

      const currentFen = game.fen();
      setFen(currentFen);
      console.log('Пользовательский ход выполнен, текущее FEN:', currentFen); // Выводим FEN после хода пользователя
      setMoveIndex((prevIndex) => prevIndex + 1);

      if (moveIndex + 1 < correctMoves.length) {
        setIsAnimating(true);

        setTimeout(() => {
          const nextMove = correctMoves[moveIndex + 1];
          game.move({ from: nextMove.slice(0, 2), to: nextMove.slice(2) });
          const nextFen = game.fen();
          setFen(nextFen);
          console.log('Ход компьютера выполнен, новое FEN:', nextFen); // Выводим FEN после хода компьютера
          setMoveIndex((prevIndex) => prevIndex + 1);
          setIsAnimating(false);
        }, 500);
      } else {
        toast.success('Задача решена!');
        setIsUserTurn(false);
        console.log(`Math.round(${oldRating} + (${puzzleRating} / ${oldRating}) * 10);`)
        setNewRating(Math.round(oldRating + (puzzleRating / oldRating) * 10));
        console.log("rating: ", newRating);
        updateUserRating(newRating);
      }
    } else {
      console.log('Неправильный ход:', move);
    }
  }

  function makeInitialMove() {
    if (moveIndex >= correctMoves.length) {
      return;
    }

    const initialMove = correctMoves[0];
    game.move({ from: initialMove.slice(0, 2), to: initialMove.slice(2) });
    setFen(game.fen());
    console.log('Первый ход компьютера выполнен, текущее FEN:', game.fen()); // Выводим FEN после первого хода
    setMoveIndex(1);
    setIsUserTurn(true);
  }

  useEffect(() => {
    if (correctMoves.length > 0) {
      makeInitialMove();
    }
  }, [correctMoves]);

  return (
    <div>
      <ToastContainer />
      <div id="puzzles-board">
        <Chessboard
          position={fen}
          width={350}
          draggable
          onDrop={handleDrop}
          orientation={boardOrientation === 'b' ? 'white' : 'black'}
        />
      </div>
      <h3>Ваш рейтинг: {newRating !== null ? newRating : oldRating}</h3>
      <button
        onClick={getRandomPuzzle}
        style={{ marginTop: '20px', padding: '10px 20px', fontSize: '16px' }}
      >
        Обновить
      </button>
    </div>
  );
}
