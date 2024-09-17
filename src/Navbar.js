// Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import PuzzleIcon from './assets/icons/puzzle.svg';
import TimeIcon from './assets/icons/time.svg';
import BookIcon from './assets/icons/book.svg';
import HomeIcon from './assets/icons/home.svg';
import './Navbar.css';

function Navbar() {
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
      <Link to="/login" className="nav-link login-button">
        <span>Войти</span>
      </Link>
    </nav>
  );
}

export default Navbar;
