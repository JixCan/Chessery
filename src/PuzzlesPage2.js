import Board from "./board/Board.tsx";
import { useEffect, useState, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Chess } from 'chess.js';

const DEFAULT_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export default function PuzzlesPage() {
    const [fen, setFen] = useState(DEFAULT_FEN);
    const [boardOrientation, setBoardOrientation] = useState('white'); 
    const [moveIndex, setMoveIndex] = useState(0);
    const [puzzleRating, setPuzzleRating] = useState(0);
    const [userRating, setUserRating] = useState(0);
    const [correctMoves, setCorrectMoves] = useState([]);
    const [game, setGame] = useState(new Chess(fen));
    const [isAITurn, setIsAITurn] = useState(true);
    const [orig, setOrig] = useState(null);
    const [dest, setDest] = useState(null);

    const boardRef = useRef(null);

    function getRandomPuzzle() {
        fetch('http://localhost:5000/api/random-puzzle')
          .then((response) => response.json())
          .then((data) => {
            console.log('Получена новая задача:', data);
            setFen(data.fen);
            setCorrectMoves(data.moves.split(' '));
            setGame(new Chess(data.fen));
            setIsAITurn(true);
            setBoardOrientation(data.fen.split(' ')[1] === 'b' ? 'white' : 'black');
            setMoveIndex(0);
            setPuzzleRating(data.rating);
            setUserRating(parseInt(localStorage.getItem('rating')));
          })
          .catch((error) => {
            console.error('Ошибка при получении задачи:', error);
          });
    }

    function makeNextAIMove() {
        const nextMove = correctMoves[moveIndex];
        const from = nextMove.slice(0, 2);
        const to = nextMove.slice(2, 4);
        if (boardRef.current) {
            boardRef.current.makeMove(from, to);
        }
        game.move({ from, to });
        setFen(game.fen());
        setMoveIndex((prevIndex) => prevIndex + 1);
        setIsAITurn(false); // Ход завершен, теперь ход пользователя
    }

    function undoUserMove(from, to) {
        if (boardRef.current) {
            console.log("undo");
            boardRef.current.makeMove(to, from);
        }
    }

    function handleUserMove(orig, dest) {
        if (isAITurn) {
            console.log('Не ваш ход или анимация еще не завершилась');
            return;
        }
        
        const move = orig + dest;
        console.log(move);
    
        if (correctMoves.includes(move)) {
            game.move({ from: orig, to: dest });
            setFen(game.fen());
            console.log('Пользовательский ход выполнен, текущее FEN:', game.fen());
            setMoveIndex((prevIndex) => prevIndex + 1);
            setIsAITurn(true); // Устанавливаем, что теперь ход AI
        } else {
            console.log('Неправильный ход:', move);
            toast.error('Неправильный ход! Попробуйте снова.');
            undoUserMove(orig, dest);
        }
    }

    useEffect(() => {
        if (moveIndex % 2 === 0 && moveIndex < correctMoves.length) {
            console.log(moveIndex, "ai");
            makeNextAIMove(); // Ход AI
        } else {
            if (orig && dest) {
                console.log(moveIndex, "user");
                handleUserMove(orig, dest); // Ход пользователя
            }
        }
    }, [moveIndex, orig, dest]);

    return (
        <div>
            <Board
                ref={boardRef}
                fen={fen}
                game={game}
                orientation={boardOrientation}
                events={{
                    move: (orig, dest) => {
                        setOrig(orig);
                        setDest(dest);
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
