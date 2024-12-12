import React, { useState, useEffect } from "react";
import axios from "axios";

const CarList = () => {
  const [cars, setCars] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3000/cars")
      .then(response => {
        setCars(response.data);
      })
      .catch(error => {
        console.error("Error fetching cars:", error);
      });
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };


  return (
    <div className="car-list">
      <h2>Список автомобилей</h2>
      <div className="car-grid">
        {cars.map(car => (
          <div key={car.id} className="car-card">
            <div className="car-image">
              {/* <img src={car.photo} alt={car.title} /> */}
            </div>
            <div className="car-details">
              <h3>{car.title}</h3>
              <p className="car-price">Цена: {formatPrice(car.price)} сум</p>
              <p className="car-location">Локация: {car.location_city}, {car.location_region}</p>
              <a href={car.url} target="_blank" rel="noopener noreferrer" className="car-link">Подробнее</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CarList;
