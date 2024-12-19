import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import AboutPage from "./AboutPage"; // Импортируем компонент AboutPage
import CarList from "./components/CarList";
import './App.css';

const App = () => {
  <svg width="0" height="0" style={{ position: "absolute" }}>
  <defs>
    <clipPath id="convex-header">
      <path d="M0,100 Q50,0 100,100 L100,100 L0,100 Z" />
    </clipPath>
  </defs>
</svg>
  return (
    <Router>
      <div className="App">
        {/* SVG с clipPath */}
        <svg width="0" height="0" style={{ position: "absolute" }}>
          <defs>
            <clipPath id="convex-header">
              <path d="M0,100 Q50,0 100,100 L100,100 L0,100 Z" />
            </clipPath>
          </defs>
        </svg>

        {/* Верхний хедер */}
        <header className="App-header">
          <div className="header-logo">
            <img src="/logoavtoulov.png" alt="Логотип AvtoUlov" className="logo" />
            <span><Link to="/">AvtoUlov</Link></span>
          </div>
          <nav className="header-nav">
            <Link to="/about">О компании</Link>
            <Link to="/">Ваши машины здесь</Link>
          </nav>
        </header>

        {/* Обрезанный блок */}
        <div
          className="clipped-container inner-bg homepage-gradient d-flex pos-a top-0 left-0 right-0"
          style={{ clipPath: "url(#convex-header)" }}
        >
        </div>

        {/* Центральный блок */}
        <section className="search-section">
          <h1>Давайте найдем ваш идеальный автомобиль</h1>
          <div className="search-bar">
            <input type="text" placeholder="Опишите, что вы ищете" />
          </div>
          <div className="search-actions">
            <button>Купить б/у</button>
            <button>Купить новый</button>
            <button>Оценить авто</button>
          </div>
        </section>

        {/* Категории */}
        <section className="categories">
          <h2>Ищите по категориям</h2>
          <div className="category-list">
            <div className="category-item">Легковые</div>
            <div className="category-item">Грузовые</div>
            <div className="category-item">Мото</div>
            <div className="category-item">Водный транспорт</div>
            <div className="category-item">Спецтехника</div>
          </div>
        </section>

        {/* Маршруты */}
        <Routes>
          <Route path="/" element={<CarList />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
