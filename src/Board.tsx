import React, { useEffect, useRef, useState } from 'react';
import { Chessground } from 'chessground';
import { Config } from 'chessground/config';
import { Chess } from 'chess.js';

interface BoardProps {
  fen?: string;
  orientation?: 'white' | 'black';
  onMove?: (orig: string, dest: string) => void;
}

export default function Board({ fen = 'start', orientation = 'white', onMove }: BoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [game] = useState(new Chess(fen));  // Создаем новое шахматное состояние с переданной FEN

  useEffect(() => {
    if (boardRef.current) {
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

      const config: Config = {
        fen: game.fen(),
        orientation: orientation,
        coordinates: true,
        movable: {
          color: 'both',
          free: false,
          dests: getLegalMoves(),
          showDests: true
        },
        events: {
          move: (orig, dest) => {
            const move = game.move({ from: orig, to: dest });
            if (move) {
              // Обновляем доску и допустимые ходы
              ground.set({ fen: game.fen(), movable: { dests: getLegalMoves() } });
              
              // Если передана функция onMove, вызываем её
              if (onMove) {
                onMove(orig, dest);
              }
            } else {
              // Если ход не валиден, возвращаем фигуру на место
              ground.set({ fen: game.fen() });
            }
          }
        }
      };

      const ground = Chessground(boardRef.current, config);

      return () => ground.destroy();
    }
  }, [game, fen, orientation, onMove]);

  return (
    <div>
      <div ref={boardRef} style={{ width: '400px', height: '400px' }}></div>
    </div>
  );
}
