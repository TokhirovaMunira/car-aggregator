import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);



// Если хочешь измерять производительность в своем приложении, передай функцию для логирования результатов
// Например: reportWebVitals(console.log)
reportWebVitals();