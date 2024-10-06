import { useState, useEffect, useRef } from "react";
import Chessground from "@react-chess/chessground";
import { Chess, validateFen } from "chess.js";
import "chessground/assets/chessground.base.css";
import "chessground/assets/chessground.brown.css";
import "chessground/assets/chessground.cburnett.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Board from "./board/Board.tsx";
import Select from 'react-select';
import './EndgamePage.css';

const endgameOptions = [
    { value: "PvsK", label: "Пешка против короля",
        pieces: [
            { role: "king", color: "white" }, { role: "pawn", color: "white" }, { role: "king", color: "black" }
        ]
    },
    { value: "PvsP", label: "Пешка против пешки",
        pieces: [
            { role: "king", color: "white" }, { role: "pawn", color: "white" }, { role: "king", color: "black" }, { role: "pawn", color: "black" }
        ]
    },
    { value: "RvsK", label: "Ладья против короля",
        pieces: [
            { role: "king", color: "white" }, { role: "rook", color: "white" }, { role: "king", color: "black" }
        ]
    },
];

export default function EndgamePage() {
    const boardRef = useRef(null);
    const [fen, setFen] = useState(""); // Изначально пустой FEN
    const [game, setGame] = useState(new Chess()); // Инициализируем игру без FEN
    const [positionEvaluation, setPositionEvaluation] = useState("Оценка позиции: неизвестно");
    
    game.clear();
    const selectedEndgameRef = useRef(endgameOptions[0]);
    const [selectedEndgame, setSelectedEndgame] = useState(endgameOptions[0]);

    // Обработчик изменения выбранного эндшпиля
    function handleEndgameChange(option) {
        setSelectedEndgame(option);
        selectedEndgameRef.current = option;
        setGame(new Chess()); // Сбрасываем игру
        game.clear();
        setPosition(option); // Устанавливаем фигуры
    }

    function getRandomPosition() {
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];
      
        const randomFile = files[Math.floor(Math.random() * files.length)];
        const randomRank = ranks[Math.floor(Math.random() * ranks.length)];
      
        return `${randomFile}${randomRank}`;
    }

    function handleMove(orig, dest) {
        console.log(`Move from ${orig} to ${dest}`);
    }

    function setPosition(option) {
        let isValid = false;
        let attempts = 0;

        while (!isValid && attempts < 10) {
            const newGame = new Chess(); // Создаем новую игру
            newGame.clear();
            const occupiedPositions = new Set();
            option.pieces.forEach(piece => {
                let position;
                do {
                    position = getRandomPosition();
                } while (occupiedPositions.has(position));

                occupiedPositions.add(position);
                newGame.put({ type: piece.role[0], color: piece.color[0] }, position); // Добавляем фигуру на доску
            });

            const fen = newGame.fen();
            const { ok } = validateFen(fen);
            if (ok) {
                isValid = true;
                setFen(fen);
                setGame(newGame);
                evaluatePosition(fen); // Оценка позиции после установки
            } else {
                attempts++;
            }
        }

        if (attempts >= 10) {
            toast.error("Не удалось сгенерировать валидную позицию после 10 попыток.");
        }
    }

    async function evaluatePosition(fen) {
        try {
            // Декодируем FEN для передачи в запрос
            const normalizedFen = decodeURIComponent(fen.trim());
    
            // Выполняем запрос к Lichess Tablebase API
            const response = await fetch(`http://tablebase.lichess.ovh/standard?fen=${normalizedFen}`);
            const data = await response.json();
    
            // Анализируем полученные данные
            if (data) {
                if (data.checkmate) {
                    setPositionEvaluation("Позиция ведет к мату.");
                } else if (data.stalemate) {
                    setPositionEvaluation("Позиция ведет к ничьей (пат).");
                } else if (data.insufficient_material) {
                    setPositionEvaluation("Недостаточно материала для победы.");
                } else if (data.category === "win") {
                    setPositionEvaluation("Позиция выиграна.");
                } else if (data.category === "draw") {
                    setPositionEvaluation("Позиция ничейная.");
                } else if (data.category === "loss") {
                    setPositionEvaluation("Позиция проиграна.");
                } else {
                    setPositionEvaluation("Оценка позиции неизвестна.");
                }
    
                // Лучшая линия ходов, если она доступна
                if (data.moves && data.moves.length > 0) {
                    const bestMove = data.moves[0];
                    const moveCategory = bestMove.category;
                    const dtm = bestMove.dtm ? `Мат через ${Math.abs(bestMove.dtm)} ходов.` : '';
    
                    setPositionEvaluation((prevEvaluation) =>
                        `${prevEvaluation} Лучшая линия: ${bestMove.san} (${moveCategory}). ${dtm}`
                    );
                }
            } else {
                setPositionEvaluation("Позиция не может быть оценена.");
            }
        } catch (error) {
            setPositionEvaluation("Ошибка при оценке позиции.");
            console.error(error);
        }
    }
    
    

    useEffect(() => {
        setPosition(selectedEndgame); // Устанавливаем начальные фигуры при первом рендере
    }, []);

    // Функция для повторной генерации позиции
    function regeneratePosition() {
        setPosition(selectedEndgame);
    }

    return (
        <div className="endgameGrid">
            <div className="logoElement ge"><h1>Описание</h1></div>
            <div className="endgameSelectBoxElement ge">
                <Select 
                    options={endgameOptions} 
                    value={selectedEndgame} 
                    onChange={handleEndgameChange}
                />
                <button onClick={regeneratePosition}>Обновить</button>
            </div>
            <div className="boardElement ge">
                <Board
                    ref={boardRef}
                    fen={fen}
                    orientation="white"
                    events={{
                        move: (orig, dest) => handleMove(orig, dest),
                    }}
                    width="30rem" // Ширина в rem
                    height="30rem" // Высота в rem
                />
            </div>
            <div className="descElement ge">
                <p>{positionEvaluation}</p>
            </div>
            <div className="taskElement ge"><h1>Task</h1></div>
            <ToastContainer />
        </div>
    );
}
