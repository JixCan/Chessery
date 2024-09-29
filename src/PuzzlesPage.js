import Board from "./board/Board.tsx";
import { useEffect, useState, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Chess } from 'chess.js';

const DEFAULT_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export default function PuzzlesPage() {
    const [fen, setFen] = useState(DEFAULT_FEN);
    const [boardOrientation, setBoardOrientation] = useState('white');
    const correctMovesRef = useRef([]); // Используем useRef для хранения правильных ходов
    const currentMoveIndexRef = useRef(0); // Используем useRef для текущего индекса хода
    const isUserTurnRef = useRef(false);
    const blockMoveRef = useRef(false);
    const startFEN = useRef('');
    const boardRef = useRef(null);
    const gameRef = useRef(new Chess(fen)); // Сохраняем игру в useRef

    const makeAIMove = () => {
        console.log('makeAIMove called');

        if (currentMoveIndexRef.current < correctMovesRef.current.length) {
            const move = correctMovesRef.current[currentMoveIndexRef.current];
            console.log('Computer move:', move);
            const [orig, dest] = [move.slice(0, 2), move.slice(2, 4)];

            if (gameRef.current.move({ from: orig, to: dest })) {
                console.log('Computer move successful:', orig, dest);
                setFen(gameRef.current.fen());
                boardRef.current.makeMove(orig, dest);
                currentMoveIndexRef.current += 1; // Обновляем индекс хода
                blockMoveRef.current = true; // Блокируем событие move
                console.log('Blocking move events for user turn...');
                setTimeout(() => {
                    isUserTurnRef.current = true; // Только после паузы разрешаем ход пользователю
                    blockMoveRef.current = false; // Разблокируем событие move
                    console.log('Unblocked move events. User can move now.');
                }, 500); // Добавляем задержку перед тем, как позволить пользователю ходить
            } else {
                console.log('Invalid computer move');
            }
        } else {
            console.log('currentMoveIndex ', currentMoveIndexRef.current, ' is >= correctMoves.length ', correctMovesRef.current.length);
        }
    };

    const handleUserMove = (orig, dest) => {
        console.log('User move:', orig, dest);
        console.log('isUserTurn:', isUserTurnRef.current);
    
        if (!isUserTurnRef.current || currentMoveIndexRef.current >= correctMovesRef.current.length) {
            console.log('Not user\'s turn or moves are done');
            return;
        }
    
        const correctMove = correctMovesRef.current[currentMoveIndexRef.current];
        console.log('Expected user move:', correctMove);
        
        if (orig + dest === correctMove) {
            console.log('User move is correct');
            if (gameRef.current.move({ from: orig, to: dest })) {
                console.log('Move applied to game. New FEN:', gameRef.current.fen());
                setFen(gameRef.current.fen());
                currentMoveIndexRef.current += 1; // Обновляем индекс хода
                isUserTurnRef.current = false;
                console.log('User turn set to false, computer turn will follow');
                
                if (currentMoveIndexRef.current < correctMovesRef.current.length) {
                    console.log('Preparing for next computer move');
                    setTimeout(() => makeAIMove(), 500);
                } else {
                    console.log('Puzzle solved');
                    toast.success('Puzzle solved!');
                }
            }
        } else {
            console.log('User move is incorrect');
            resetCurrentPuzzle(); // Сбрасываем текущую задачу при неправильном ходе
        }
    };

    const getRandomPuzzle = () => {
        console.log('Fetching new puzzle');
        fetch('http://localhost:5000/api/random-puzzle')
            .then((response) => response.json())
            .then((data) => {
                console.log('Puzzle received:', data);
                setFen(data.fen);
                startFEN.current = data.fen;
                if (data.moves && data.moves.trim()) {
                    const moves = data.moves.split(' ').filter(move => move);
                    console.log('Parsed moves:', moves);
                    correctMovesRef.current = moves; // Обновляем правильные ходы
                } else {
                    console.error('No valid moves found in the response');
                    correctMovesRef.current = [];
                }
                gameRef.current = new Chess(data.fen); // Обновляем игру
                setBoardOrientation(data.fen.split(' ')[1] === 'b' ? 'white' : 'black');
                currentMoveIndexRef.current = 0; // Сбрасываем индекс хода
                isUserTurnRef.current = false;
                setTimeout(() => makeAIMove(), 500); // Стартовый ход компьютера только после загрузки задачи
            })
            .catch((error) => {
                console.error('Error fetching puzzle:', error);
            });
    };

    const resetCurrentPuzzle = () => {
        console.log('Resetting current puzzle');
        // Перезагружаем ту же задачу
        const currentFEN = startFEN.current;
        
        // Устанавливаем новую FEN
        setFen(currentFEN);
        gameRef.current = new Chess(currentFEN); // Перезапускаем игру
        correctMovesRef.current = [...correctMovesRef.current]; // Клонируем массив правильных ходов
        currentMoveIndexRef.current = 0; // Сбрасываем индекс хода
        isUserTurnRef.current = false;
        toast.error('Неправильный ход. Попробуйте сначала.');
    
        // Задержка перед первым ходом компьютера
        setTimeout(() => {
            makeAIMove();
        }, 1000); // Задержка в 1 секунду перед ходом компьютера
    };
    
    

    return (
        <div>
            <Board
                ref={boardRef}
                fen={fen}
                game={gameRef.current} // Передаем игру из useRef
                orientation={boardOrientation}
                events={{
                    move: (orig, dest) => {
                        console.log('Move event triggered:', orig, dest);
                        console.log('isUserTurn before handling:', isUserTurnRef.current);
                        if (blockMoveRef.current) {
                            console.log('Ignoring move event during block:', orig, dest);
                            return; // Игнорируем событие, если блокировка активна
                        }

                        if (!isUserTurnRef.current) {
                            console.log('Ignoring computer move event:', orig, dest);
                            return;
                        }

                        handleUserMove(orig, dest);
                    },
                }}
            />
            <button
                onClick={getRandomPuzzle}
                style={{ marginTop: '20px', padding: '10px 20px', fontSize: '16px' }}
            >
                New puzzle
            </button>
            <ToastContainer />
        </div>
    );
}
