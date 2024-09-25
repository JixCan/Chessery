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

    useEffect(() => {
        if (correctMoves.length > 0 && moveIndex < correctMoves.length && isAITurn) {
            setTimeout(() => {
                makeNextAIMove();
            }, 1000);
        }
    }, [fen, isAITurn, moveIndex]); 

    function makeNextAIMove() {
        setIsAITurn(false);
        const nextMove = correctMoves[moveIndex];
        const from = nextMove.slice(0, 2);
        const to = nextMove.slice(2, 4);
        if (boardRef.current) {
            boardRef.current.makeMove(from, to);
        }
        game.move({ from, to });
        console.log("from ai: ", boardRef.current.getLegalMoves());
        setFen(game.fen());
        setMoveIndex((prevIndex) => prevIndex + 1);
    }

    function undoUserMove(from, to) {
        if (boardRef.current) {
            console.log("undo");
            boardRef.current.makeMove(to, from);
        }
    }

    function handleUserMove(orig, dest) {
        //Нужно сделать отличие ходов компьютера от ходов юзера, тк они оба вызывают событие move
        console.log("User tried to move a piece. Allowed? ", !isAITurn, " s", moveIndex % 2 == 0);

        if (moveIndex % 2 == 0) return;

        
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

    // Отслеживаем изменение isAITurn
    /*useEffect(() => {
        if (isAITurn && moveIndex < correctMoves.length) {
            makeNextAIMove(); // Вызываем следующий ход AI, если это не ход AI
        }
    }, [isAITurn]);*/

    return (
        <div>
            <Board
                ref={boardRef}
                fen={fen}
                game={game}
                orientation={boardOrientation}
                events={{
                    move: handleUserMove
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
