import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import AboutPage from "./AboutPage"; // Импортируем компонент AboutPage
import CarList from "./components/CarList";
import './App.css';


const App = () => {
  return (
    <Router>
      <div className="App">
        {/* Верхний хедер */}
        <header className="App-header">
          <div className="header-logo">
            <span><Link to="/">AvtoUlov</Link></span>
          </div>
          <nav className="header-nav">
            <Link to="/about">О компании</Link>
            <Link to="/">Ваши машины здесь</Link>
          </nav>
        </header>

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
            <div className="category-item">EV</div>
            <div className="category-item">SUV</div>
            <div className="category-item">Truck</div>
            <div className="category-item">Sedan</div>
            <div className="category-item">Hybrid</div>
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
