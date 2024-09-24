// App.js
import './App.css';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import PuzzlesPage from './PuzzlesPage';
import EndgamePage from './EndgamePage';
import RepertoirePage from './RepertoirePage';
import Login from './Login';
import Navbar from './Navbar'; // Импортируем компонент Navbar
import PuzzleIcon from './assets/icons/puzzle.svg';
import TimeIcon from './assets/icons/time.svg';
import BookIcon from './assets/icons/book.svg';


function HomePage() {
  const navigate = useNavigate();
  return (
    <div id="main-container">
      <div className="logo-container">
        <img src='https://lichess1.org/assets/logo/lichess-white.svg' alt="Logo" />
      </div>
      <div id="page-buttons">
        <button onClick={() => navigate('/puzzles')}>
          <img src={PuzzleIcon} alt="Puzzle Icon" /> {/* Используем импортированную иконку */}
          Задачи
        </button>
        <button onClick={() => navigate('/endgame')}>
          <img src={TimeIcon} alt="Endgame Icon" />
          Эндшпиль
        </button>
        <button onClick={() => navigate('/repertoire')}>
          <img src={BookIcon} alt="Repertoire Icon" />
          Репертуар
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<><Navbar /><HomePage /></>} />
        <Route 
          path="/puzzles" 
          element={
            <>
              <Navbar />
              <PuzzlesPage />
            </>
          } 
        />
        <Route 
          path="/endgame" 
          element={
            <>
              <Navbar />
              <EndgamePage />
            </>
          } 
        />
        <Route 
          path="/repertoire" 
          element={
            <>
              <Navbar />
              <RepertoirePage />
            </>
          } 
        />
        <Route
          path="/login"
          element={
            <>
              <Navbar />
              <Login />
            </>
          } />
      </Routes>
    </Router>
  );
}

export default App;
