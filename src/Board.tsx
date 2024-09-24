import React, { useEffect, useRef } from 'react';
import { Chessground } from 'chessground';
import { Config } from 'chessground/config';
import { Chess } from 'chess.js';
import './Board.css';

interface BoardProps {
  fen: string; // Теперь обязательно
  game: Chess; // Теперь обязательно
  orientation?: 'white' | 'black';
  onMove?: (orig: string, dest: string) => void;
}

export default function Board({ fen, game, orientation = 'white', onMove }: BoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const groundRef = useRef<ReturnType<typeof Chessground> | null>(null);

  // Функция для получения допустимых ходов
  const getLegalMoves = () => {
    const dests = new Map();
    let allLegalMoves = game.moves({ verbose: true });

    allLegalMoves.forEach(move => {
      if (!dests.has(move.from)) {
        dests.set(move.from, []);
      }
      dests.get(move.from).push(move.to);
    });

    return dests;
  };

  useEffect(() => {
    if (boardRef.current) {
      const config: Config = {
        fen: game.fen(),
        orientation: orientation,
        coordinates: true,
        animation: {
          enabled: true,
          duration: 500,
        },
        movable: {
          color: 'both',
          free: false,
          dests: getLegalMoves(),
          showDests: true,
        },
        highlight: {
          lastMove: true,
          check: true,
        },
        events: {
          move: (orig, dest) => {
            const move = game.move({ from: orig, to: dest });
            console.log(move);
            if (move) {
              // Обновляем доску и допустимые ходы
              //////////groundRef.current?.set({ fen: game.fen(), movable: { dests: getLegalMoves() } });
              groundRef.current?.move(orig, dest);
              // Если передана функция onMove, вызываем её
              if (onMove) {
                onMove(orig, dest); // Передаем orig и dest
                console.log('передали в onMove', orig, dest);
              }
            } else {
              // Если ход не валиден, возвращаем фигуру на место
              groundRef.current?.set({ fen: game.fen() });
            }
          },
        },
      };

      groundRef.current = Chessground(boardRef.current, config);

      return () => groundRef.current?.destroy();
    }
  }, [game, orientation, onMove]); // Здесь убрали fen, чтобы не переинициализировать доску

  // Новый useEffect для обновления FEN
  useEffect(() => {
    if (groundRef.current) {
      //groundRef.current.set({ fen: fen, movable: { dests: getLegalMoves() } });
      //groundRef.current.move({ fen: fen, movable: { dests: getLegalMoves() } });
    }
  }, [fen]); // Отслеживаем изменения fen

  return (
    <div>
      <div ref={boardRef} style={{ width: '400px', height: '400px' }}></div>
    </div>
  );
}
