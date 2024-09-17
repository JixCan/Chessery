import { useEffect, useState } from 'react';
import { Chess } from 'chess.js';
import Chessboard from 'chessboardjsx';


// Дефолтный FEN, который будет использоваться до получения данных
const DEFAULT_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export default function PuzzlesPage() {
  const [fen, setFen] = useState(DEFAULT_FEN); // Состояние для хранения FEN
  const [game, setGame] = useState(new Chess(fen)); // Состояние для хранения игры

  // Функция для запроса случайной задачи
  function getRandomPuzzle() {
    fetch('http://localhost:5000/api/random-puzzle')
      .then((response) => response.json())
      .then((data) => {
        setFen(data.fen); // Устанавливаем FEN из ответа сервера
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

  return (
    <div>

        

        <div id="puzzles-board">
            <Chessboard position={fen} width={350}/>
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
