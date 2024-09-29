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
    const [moveData, setMoveData] = useState({
        moveIndex: 0,
        from: null,
        to: null
    });
    const [puzzleLoaded, setPuzzleLoaded] = useState(false);
    const [isUserTurn, setIsUserTurn] = useState(false); // Отслеживание хода пользователя
    const [isMoveProgrammatic, setIsMoveProgrammatic] = useState(false); // Новый флаг для отслеживания программных ходов

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
                //makeAIMove(moves, 0);  // Ход компьютера при начальном состоянии
            })
            .catch((error) => {
                console.error('Ошибка при получении задачи:', error);
            });
    }

    

    function handleUserMove() {
        const { from, to } = moveData;
        console.log("Выполняется ход пользователя ", from, to);
        setIsUserTurn(false); // Сбрасываем флаг после хода пользователя
        setMoveData(prevData => ({
            ...prevData,
            moveIndex: prevData.moveIndex + 1
        }));
    }

    useEffect(() => {
        console.log("Задача загружена: ", puzzleLoaded, ". Номер хода: ", moveData.moveIndex, ". Очередь пользователя: ", isUserTurn);
        if (puzzleLoaded && moveData.moveIndex % 2 === 0 && !isUserTurn) {
            // Если четный индекс и не ход пользователя — ход компьютера
            makeAIMove(correctMoves, moveData.moveIndex);
        }
    }, [moveData.moveIndex, puzzleLoaded, isUserTurn]);

    function makeAIMove(moves, index) {
        console.log("Выполняется ход ИИ", moves, index);
        const nextMove = moves[index];
        const from = nextMove.slice(0, 2);
        const to = nextMove.slice(2, 4);
        
        if (boardRef.current) {
            setIsMoveProgrammatic(true);  // Устанавливаем флаг перед программным ходом
            setTimeout(() => {
                setTimeout(() => {
                    setIsMoveProgrammatic(false);  
                    setIsUserTurn(true);  // После хода компьютера, ход пользователя
                }, 100);
                boardRef.current.makeMove(from, to);
                setMoveData(prevData => ({
                    moveIndex: prevData.moveIndex + 1,
                    from: null,
                    to: null
                }));
                // Сбрасываем флаг через небольшую задержку, чтобы гарантировать завершение хода
                  // Задержка 100 мс
            }, 1000);  // Задержка 1 сек перед выполнением хода компьютера
        }
    }
    
    return (
        <div>
            <Board
                ref={boardRef}
                fen={fen}
                game={game}
                orientation={boardOrientation}
                events={{
                    move: (orig, dest) => {
                        if (isMoveProgrammatic) {
                            console.log("Программный ход выполнен, игнорируем событие.");
                        } else if (isUserTurn) {
                            console.log("Ход пользователя");
                            setMoveData((prevData) => ({
                                moveIndex: prevData.moveIndex,
                                from: orig,
                                to: dest
                            }));
                            handleUserMove();
                        } else {
                            console.log("Ход пользователя проигнорирован, так как не его очередь");
                        }
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
