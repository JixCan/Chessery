import { useEffect, useState } from 'react';
import { Chess } from 'chess.js';
import Board from './board/Board.tsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  const [boardOrientation, setBoardOrientation] = useState('white');
  const [newRating, setNewRating] = useState(0);

  function getRandomPuzzle() {
    fetch('http://localhost:5000/api/random-puzzle')
      .then((response) => response.json())
      .then((data) => {
        console.log('Получена новая задача:', data);
        setFen(data.fen);
        setCorrectMoves(data.moves.split(' '));
        setGame(new Chess(data.fen));
        const isWhiteMove = data.fen.charAt(data.fen.length - 10) === 'w';
        setBoardOrientation(isWhiteMove ? 'white' : 'black');
        setIsUserTurn(isWhiteMove);
        setMoveIndex(0);
        setPuzzleRating(data.rating);
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
      console.log('Обновлено FEN:', fen);
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
      body: JSON.stringify({ newRating }),
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

  function handleMove(orig, dest) {
    if (!isUserTurn || isAnimating) {
      console.log('Не ваш ход или анимация еще не завершилась');
      return;
    }

    const move = orig + dest;
    console.log(move);

    if (isMoveCorrect(move)) {

      const currentFen = game.fen();
      setFen(currentFen);
      console.log('Пользовательский ход выполнен, текущее FEN:', currentFen);
      setMoveIndex((prevIndex) => prevIndex + 1);

      if (moveIndex < correctMoves.length - 1) {
        setIsAnimating(true);
        const nextMove = correctMoves[moveIndex + 1];
        setTimeout(() => {
          game.move({ from: nextMove.slice(0, 2), to: nextMove.slice(2) });
          setFen(game.fen());
          console.log('Ход компьютера выполнен, новое FEN:', game.fen());
          setMoveIndex((prevIndex) => prevIndex + 1);
          setIsAnimating(false);
        }, 500);
      } else {
        toast.success('Задача решена!');
        setIsUserTurn(false);
        setNewRating(Math.round(oldRating + (puzzleRating / oldRating) * 10));
        updateUserRating(newRating);
      }
    } else {
      console.log('Неправильный ход:', move);
      toast.error('Неправильный ход! Попробуйте снова.');
      console.log(game.fen());
      game.undo(); // Вернуть ход обратно
      setFen(game.fen());
      console.log(game.fen());
    }
  }

  function makeInitialMove() {
    if (moveIndex >= correctMoves.length) {
      return;
    }

    const initialMove = correctMoves[moveIndex];
    setTimeout(() => {
      game.move({ from: initialMove.slice(0, 2), to: initialMove.slice(2) });
      setFen(game.fen());
      console.log('Первый ход компьютера выполнен, текущее FEN:', game.fen());
      setMoveIndex((prevIndex) => prevIndex + 1);
      setIsUserTurn(true);
    }, 1000); // 1 секунда задержки перед выполнением первого хода
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
        {fen && game ? (
          <Board
            fen={fen}
            game={game}
            orientation={boardOrientation}
          />
        ) : (
          <p>Загрузка задачи...</p>
        )}
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
