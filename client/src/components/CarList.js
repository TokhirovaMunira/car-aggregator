import React, { useState, useEffect } from "react";
import axios from "axios";

const CarList = () => {
  const [cars, setCars] = useState([]);

  useEffect(() => {
    // Запрос к API для получения списка машин
    axios.get("http://localhost:3000/cars")
      .then(response => {
        setCars(response.data);
      })
      .catch(error => {
        console.error("Error fetching cars:", error);
      });
  }, []);

  return (
    <div className="car-list">
      <h2>Варианты авто</h2>
       <ul>
        {cars.map(car => (
          <li key={car.id}>
            <h3>{car.title}</h3>
            {/* <img src={car.photo}/> */}
            <p>Цена: {car.price}</p>
            <p>Локация: {car.location_city}, {car.location_region}</p>
            <a href={car.url} target="_blank" rel="noopener noreferrer">Подробнее</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CarList;
