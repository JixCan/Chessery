import Chessground from "@react-chess/chessground";

// these styles must be imported somewhere
import "chessground/assets/chessground.base.css";
import "chessground/assets/chessground.brown.css";
import "chessground/assets/chessground.cburnett.css";


// EndgamePage.js
export default function EndgamePage() {
    return (
      <div>
        <h1>Страница эндшпиля</h1>
        <Chessground
          width={300}
          height={300}
          
        />
      </div>
    );
  }
  
  