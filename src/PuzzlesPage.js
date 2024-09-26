import Board from "./board/Board.tsx";
import { useEffect, useState, useRef, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Chess } from 'chess.js';

const DEFAULT_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export default function PuzzlesPage() {
    const [fen, setFen] = useState(DEFAULT_FEN);
    const [boardOrientation, setBoardOrientation] = useState('white'); 
    const [moveIndex, setMoveIndex] = useState(0);
    const [correctMoves, setCorrectMoves] = useState([]);
    const [game, setGame] = useState(new Chess(fen));
    const [isAITurn, setIsAITurn] = useState(true);
    const [orig, setOrig] = useState(null);
    const [dest, setDest] = useState(null);
    const [puzzleRating, setPuzzleRating] = useState(0);
    const [userRating, setUserRating] = useState(0);

    const boardRef = useRef(null);

    function getRandomPuzzle() {
        fetch('http://localhost:5000/api/random-puzzle')
            .then((response) => response.json())
            .then((data) => {
                console.log('Получена новая задача:', data);
                // Обновление состояния
                setFen(data.fen);
                setCorrectMoves(data.moves.split(' '));
                setGame(new Chess(data.fen));
                setBoardOrientation(data.fen.split(' ')[1] === 'b' ? 'white' : 'black');
                setMoveIndex(0);
                setPuzzleRating(data.rating);
                setUserRating(parseInt(localStorage.getItem('rating')));
                //setIsAITurn(true);
                // Делает первый ход AI после загрузки новой задачи
                
            })
            // .then(() => {
            //     if (correctMoves.length > 0) {
            //         setTimeout(() => {
            //             console.log('задача выполнить первый ход');
            //             makeAIMove();
            //         }, 1000);
            //     }
            // })
            .catch((error) => {
                console.error('Ошибка при получении задачи:', error);
            });
    }

    const makeAIMove = useCallback(() => {
        console.log("AI move executed");
        // Логика AI-хода

        const nextMove = correctMoves[moveIndex];
        const from = nextMove.slice(0, 2);
        const to = nextMove.slice(2, 4);
        if (boardRef.current) {
            boardRef.current.makeMove(from, to);
        }
        game.move({ from, to });
        setFen(game.fen());
        setMoveIndex((prevIndex) => prevIndex + 1);

        setIsAITurn(false); // Теперь ожидать ход от AI
    }, [correctMoves, moveIndex, game]); // Зависимости

    const handleUserMove = useCallback((orig, dest) => {
        console.log("User move executed:", orig, dest);
        // Логика обработки хода пользователя
        // Добавьте здесь проверку, является ли ход пользователя корректным
        const move = game.move({ from: orig, to: dest });

        if (move) {
            // Если ход корректный, обновите состояние и переключите ход на AI
            setFen(game.fen());
            setIsAITurn(true); // Теперь ожидать ход от AI
        } else {
            console.log("Недопустимый ход");
            toast.error("Недопустимый ход"); // Уведомление о неверном ходе
        }
    }, [game]); // Зависимости

    useEffect(() => {
        console.log("из useeffect", isAITurn);
        if (isAITurn && correctMoves.length > 0) {
            const timer = setTimeout(() => {
                makeAIMove();
            }, 1000);
            return () => clearTimeout(timer); // Очистка таймера при размонтировании
        } 
    }, [isAITurn, correctMoves, makeAIMove]);

    return (
        <div>
            <Board
                ref={boardRef}
                fen={fen}
                game={game}
                orientation={boardOrientation}
                events={{
                    move: (orig, dest) => {
                        console.log(isAITurn, 'из события move');
                        if (!isAITurn) { // Проверяем, что сейчас не ход AI
                            setOrig(orig);
                            setDest(dest);
                            handleUserMove(orig, dest); // Вызываем функцию обработки хода пользователя
                        } else {
                            console.log("Ход AI, игнорируем событие");
                        }
                    }
                }}
            />
            <button
                onClick={getRandomPuzzle}
                style={{ marginTop: '20px', padding: '10px 20px', fontSize: '16px' }}
            >
                Новая задача
            </button>
            <ToastContainer /> {/* Не забудьте добавить ToastContainer */}
        </div>
    );
}

// ПРОБЛЕМА: Невовремя обновляется isAITurn, из-за чего в events.more оно всегда true