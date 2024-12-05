import React from "react";
import "./App.css";
import CarList from "./components/CarList";

const App = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>AvtoUlov</h1>
      </header>
      <main>
        <CarList />
      </main>
    </div>
  );
};

export default App;
