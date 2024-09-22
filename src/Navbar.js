import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import PuzzleIcon from './assets/icons/puzzle.svg';
import TimeIcon from './assets/icons/time.svg';
import BookIcon from './assets/icons/book.svg';
import HomeIcon from './assets/icons/home.svg';
import './Navbar.css';

function Navbar() {
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('rating');
    localStorage.removeItem('pgn');
    setUsername(null);
    window.location.reload(); // Перезагружаем страницу после выхода
  };

  return (
    <nav className="navbar">
      <div className="nav-links">
        <Link to="/" className="nav-link">
          <img src={HomeIcon} alt="Home Icon" />
          <span>Главная</span>
        </Link>
        <Link to="/puzzles" className="nav-link">
          <img src={PuzzleIcon} alt="Puzzle Icon" />
          <span>Задачи</span>
        </Link>
        <Link to="/endgame" className="nav-link">
          <img src={TimeIcon} alt="Endgame Icon" />
          <span>Эндшпиль</span>
        </Link>
        <Link to="/repertoire" className="nav-link">
          <img src={BookIcon} alt="Repertoire Icon" />
          <span>Репертуар</span>
        </Link>
      </div>
      {username ? (
        <div className="nav-user">
          <span className='username-span'>{username}</span>
          <button className="nav-link login-button" onClick={handleLogout}>Выйти</button>
        </div>
      ) : (
        <Link to="/login" className="nav-link login-button">Войти</Link>
      )}
    </nav>
  );
}

export default Navbar;
