import React from 'react';
import { Chessground } from 'chessground';
import { Config } from 'chessground/config';
import { Chess } from 'chess.js';
import './Board.css';
import * as cg from 'chessground/types';

interface BoardProperties {
  fen: cg.FEN; // chess position in Forsyth notation
  orientation: cg.Color; // board orientation: 'white' | 'black'
  game?: Chess;
  turnColor?: cg.Color;
  coordinates?: boolean;
  viewOnly?: boolean;
  disableContextMenu?: boolean;
  highlight?: {
    lastMove?: boolean;
    check?: boolean;
  };
  animation?: {
    enabled?: boolean;
    duration?: number;
  };
  draggable?: {
    enabled?: boolean;
    distance?: number;
    autoDistance?: boolean;
    showGhost?: boolean;
    deleteOnDropOff?: boolean;
  };
  events?: {
    change?: () => void;
    move?: (orig: cg.Key, dest: cg.Key, capturedPiece?: cg.Piece) => void;
    dropNewPiece?: (piece: cg.Piece, key: cg.Key) => void;
    select?: (key: cg.Key) => void;
    insert?: (elements: cg.Elements) => void;
    move1?: (orig: cg.Key, dest: cg.Key, isAITurn: boolean) => void;
  };
  width?: string; // Теперь принимаем строку для ширины (например, "20rem", "400px")
  height?: string; // Теперь принимаем строку для высоты (например, "20rem", "400px")
}

class Board extends React.Component<BoardProperties> {
  private boardRef: React.RefObject<HTMLDivElement>;
  private groundInstance: ReturnType<typeof Chessground> | null;

  static defaultProps = {
    width: '25rem', // Ширина по умолчанию в rem
    height: '25rem', // Высота по умолчанию в rem
  };

  constructor(props: BoardProperties) {
    super(props);
    this.boardRef = React.createRef();
    this.groundInstance = null;
  }

  getLegalMoves() {
    const dests = new Map();
    const { game } = this.props;

    if (game) {
      let allLegalMoves = game.moves({ verbose: true });

      allLegalMoves.forEach((move) => {
        if (!dests.has(move.from)) {
          dests.set(move.from, []);
        }
        dests.get(move.from).push(move.to);
      });
    }
    return dests;
  }

  makeMove(from: cg.Key, to: cg.Key) {
    if (this.groundInstance) {
      this.groundInstance.move(from, to);
      console.log(`Move executed: ${from} -> ${to}`);
    }
  }

  componentDidMount() {
    if (this.boardRef.current) {
      const config: Config = {
        fen: this.props.fen,
        orientation: this.props.orientation,
        coordinates: this.props.coordinates ?? true,
        turnColor: this.props.turnColor || 'white',
        viewOnly: this.props.viewOnly || false,
        disableContextMenu: this.props.disableContextMenu || true,
        animation: this.props.animation || { enabled: true, duration: 500 },
        movable: {
          color: 'both',
          free: false,
          dests: this.getLegalMoves(),
          showDests: true,
        },
        highlight: this.props.highlight || {},
        events: this.props.events || {},
      };

      this.groundInstance = Chessground(this.boardRef.current, config);
    }
  }

  componentDidUpdate(prevProps: BoardProperties) {
    if (prevProps.fen !== this.props.fen) {
      if (this.groundInstance) {
        this.groundInstance.set({
          fen: this.props.fen,
          movable: {
            color: 'both',
            free: false,
            dests: this.getLegalMoves(),
            showDests: true,
          },
        });
      }
    }
  }

  componentWillUnmount() {
    if (this.groundInstance) {
      this.groundInstance.destroy();
    }
  }

  render() {
    const { width, height } = this.props;

    return (
      <div>
        <div
          ref={this.boardRef}
          style={{
            width: width || '25rem', // Используем ширину из пропсов
            height: height || '25rem', // Используем высоту из пропсов
          }}
        ></div>
      </div>
    );
  }
}

export default Board;
