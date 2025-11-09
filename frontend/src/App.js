import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ImageClassifier from './components/ImageClassifier';
import About from './pages/About';
import Admin from './pages/Admin';
import './components/ImageClassifier.css';

function App() {
  return (
    <Router>
      <div className="navbar">
        <Link to="/">🏠 Accueil</Link>
        <a
          href="https://mail.google.com/mail/?view=cm&fs=1&to=Ghofraneah25@gmail.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          📩 Me contacter
        </a>
        <Link to="/about">ℹ️ À propos</Link>
        <Link to="/admin">🔐 Admin</Link>
      </div>

      <div className="page-title">
        <h1>Lense Solidaire</h1>
      </div>

      <Routes>
        <Route path="/" element={<ImageClassifier />} />
        <Route path="/about" element={<About />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>

      <div className="footer">
        © 2025 Ghofrane Hedna — <a href="mailto:Ghofraneah25@gmail.com">Ghofraneah25@gmail.com</a>
        <div className="social-icons">
          <a
            href="https://www.linkedin.com/in/ghofrane-hedna"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/174/174857.png"
              alt="LinkedIn"
            />
          </a>
          <a
            href="https://www.instagram.com/ghofraneladev/"
           target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png"
              alt="Instagram"
            />
          </a>
        </div>
      </div>
    </Router>
  );
}

export default App;
