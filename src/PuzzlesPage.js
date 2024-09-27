import Board from "./board/Board.tsx";
import { useEffect, useState, useRef } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Chess } from 'chess.js';

const DEFAULT_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export default function PuzzlesPage() {
    const [fen, setFen] = useState(DEFAULT_FEN);
    const [boardOrientation, setBoardOrientation] = useState('white'); 
    const [correctMoves, setCorrectMoves] = useState([]);
    const [game, setGame] = useState(new Chess(fen));
    const [isUserTurn, setIsUserTurn] = useState(false);

    const [moveData, setMoveData] = useState({
        moveIndex: 0,
        from: null,
        to: null
    });

    // Состояние для отслеживания загрузки данных задачи
    const [puzzleLoaded, setPuzzleLoaded] = useState(false);

    const boardRef = useRef(null);

    function getRandomPuzzle() {
        setPuzzleLoaded(false); // Сбрасываем состояние перед запросом
        fetch('http://localhost:5000/api/random-puzzle')
            .then((response) => response.json())
            .then((data) => {
                console.log('Получена новая задача:', data);
                setFen(data.fen);
                const moves = data.moves.split(' ');
                setCorrectMoves(moves);
                setGame(new Chess(data.fen));
                setBoardOrientation(data.fen.split(' ')[1] === 'b' ? 'white' : 'black');
                
                setPuzzleLoaded(true); // Задача успешно загружена
                makeAIMove(moves, 0);  // Выполняем ход ИИ сразу после загрузки задачи
            })
            .catch((error) => {
                console.error('Ошибка при получении задачи:', error);
            });
    }

    function makeAIMove(moves, index) {
        console.log("Выполняется ход ИИ", moves, index);
        const nextMove = moves[index];
        const from = nextMove.slice(0, 2);
        const to = nextMove.slice(2, 4);
        if (boardRef.current) {
            setTimeout(() => {
                boardRef.current.makeMove(from, to);
            }, 1000);
        }
    }

    function handleUserMove() {
        const { from, to } = moveData;
        console.log("Выполняется ход пользователя ", from, to);
    }

    // Логика для проверки четности moveIndex, срабатывает только когда задача загружена
    useEffect(() => {
        if (puzzleLoaded) { // Проверяем, что задача загружена
            if (moveData.moveIndex % 2 === 0) {
                // Четное значение индекса - выполняем ход ИИ
                makeAIMove(correctMoves, moveData.moveIndex);
            } else {
                // Нечетное значение индекса - выполняем ход пользователя
                handleUserMove();
            }
        }
    }, [moveData.moveIndex, puzzleLoaded]);  // useEffect сработает, когда изменится moveIndex и puzzleLoaded

    return (
        <div>
            <Board
                ref={boardRef}
                fen={fen}
                game={game}
                orientation={boardOrientation}
                events={{
                    move: (orig, dest) => {
                        console.log("Ивент сработал");

                        // Обновляем сразу все значения в объекте moveData
                        setMoveData((prevData) => ({
                            moveIndex: prevData.moveIndex + 1,
                            from: orig,
                            to: dest
                        }));

                        console.log("from:", orig, "to:", dest);
                    },
                }}
            />
            <button
                onClick={getRandomPuzzle}
                style={{ marginTop: '20px', padding: '10px 20px', fontSize: '16px' }}
            >
                Новая задача
            </button>
            <ToastContainer />
        </div>
    );
}

// ПРОБЛЕМА - ивент срабатывает и на ai, и на userа