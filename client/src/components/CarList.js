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
      <h2>Available Cars</h2>
      <ul>
        {cars.map(car => (
          <li key={car.id}>
            <h3>{car.title}</h3>
            <p>Price: {car.price}</p>
            <p>Location: {car.location}</p>
            <a href={car.url} target="_blank" rel="noopener noreferrer">View More</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CarList;
