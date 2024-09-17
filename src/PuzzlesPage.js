import { useEffect, useState } from 'react';
import { Chess } from 'chess.js';
import Chessboard from 'chessboardjsx';

// Дефолтный FEN, который будет использоваться до получения данных
const DEFAULT_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export default function PuzzlesPage() {
  const [fen, setFen] = useState(DEFAULT_FEN); // Состояние для хранения FEN
  const [game, setGame] = useState(new Chess(fen)); // Состояние для хранения игры
  const [correctMoves, setCorrectMoves] = useState([]); // Состояние для хранения правильных ходов
  const [isUserTurn, setIsUserTurn] = useState(false); // Состояние для отслеживания, чей сейчас ход
  const [moveIndex, setMoveIndex] = useState(0); // Индекс текущего хода из `correctMoves`

  // Функция для запроса случайной задачи
  function getRandomPuzzle() {
    fetch('http://localhost:5000/api/random-puzzle')
      .then((response) => response.json())
      .then((data) => {
        setFen(data.fen); // Устанавливаем FEN из ответа сервера
        setCorrectMoves(data.moves.split(' ')); // Устанавливаем правильные ходы
        setGame(new Chess(data.fen)); // Обновляем состояние игры
        setIsUserTurn(data.fen.charAt(0) === 'w'); // Определяем, чей сейчас ход
        setMoveIndex(0); // Сбрасываем индекс хода
        console.log(data);
      })
      .catch((error) => {
        console.error('Ошибка при получении задачи:', error);
      });
  }

  // Запрашиваем случайную задачу при загрузке компонента
  useEffect(() => {
    getRandomPuzzle();
  }, []);

  // Эффект для обновления доски при изменении fen
  useEffect(() => {
    if (fen) {
      const gameCopy = new Chess(fen); // Создаем новую копию игры с обновленным FEN
      setGame(gameCopy); // Обновляем состояние игры
    }
  }, [fen]);

  // Функция для проверки правильности хода
  function isMoveCorrect(move) {
    return correctMoves.includes(move);
  }

  // Функция для обработки перетаскивания
  function handleDrop({ sourceSquare, targetSquare, piece }) {
    if (!isUserTurn) {
      console.log('Не ваш ход');
      return;
    }

    const move = sourceSquare + targetSquare;

    if (isMoveCorrect(move)) {
      // Если ход правильный, обновляем игру и FEN
      game.move({
        from: sourceSquare,
        to: targetSquare,
        piece: piece.toLowerCase(),
      });
      setFen(game.fen()); // Обновляем FEN
      setMoveIndex(prevIndex => prevIndex + 1); // Переходим к следующему ходу

      // Проверяем, есть ли еще ходы для выполнения
      if (moveIndex + 1 < correctMoves.length) {
        // Если есть, выполняем следующий ход
        const nextMove = correctMoves[moveIndex + 1];
        game.move({ from: nextMove.slice(0, 2), to: nextMove.slice(2) });
        setFen(game.fen()); // Обновляем FEN
      } else {
        // Если нет больше ходов, показываем сообщение о завершении задачи
        alert('Задача решена!');
      }
    } else {
      console.log('Неправильный ход:', move);
    }
  }

  // Функция для автоматического выполнения первого хода
  function makeInitialMove() {
    if (correctMoves.length > 0) {
      const initialMove = correctMoves[0];
      game.move({ from: initialMove.slice(0, 2), to: initialMove.slice(2) });
      setFen(game.fen()); // Обновляем FEN
      setMoveIndex(prevIndex => prevIndex + 1); // Переходим к следующему ходу
      setIsUserTurn(true); // Наступает очередь пользователя
    }
  }

  // Запускаем первый ход при загрузке компонента
  useEffect(() => {
    if (correctMoves.length > 0) {
      makeInitialMove();
    }
  }, [correctMoves]);

  return (
    <div>
      <div id="puzzles-board">
        <Chessboard
          position={fen}
          width={350}
          draggable // Включаем возможность перетаскивания фигур
          onDrop={handleDrop} // Обрабатываем перетаскивание
          orientation={fen.charAt(0) === 'b' ? 'white' : 'black'} // Поворачиваем доску в зависимости от хода
        />
      </div>
      <button
        onClick={getRandomPuzzle}
        style={{ marginTop: '20px', padding: '10px 20px', fontSize: '16px' }}
      >
        Обновить
      </button>
    </div>
  );
}
