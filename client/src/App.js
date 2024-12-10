import React from "react";
import "./App.css";
import CarList from "./components/CarList";

const App = () => {
  return (
    <div className="App">
      <header className="App-header">
        <span>AvtoUlov</span>
        <nav>
          <a href="#">О компании</a>
          <a href="#">Ваши машины здесь</a>
        </nav>
      </header>

      {/* Отдельный блок для текста по центру */}
      <header className="App-header2">
        <h1>Давайте найдем ваш идеальный автомобиль</h1>
      </header>

      <main>
        <CarList />
      </main>

      <div className="pos-r">
        <div className="search-icon pos-a d-flex justify-content-center align-items-center h-100"></div>
      </div>
    </div>
  );
};

export default App;