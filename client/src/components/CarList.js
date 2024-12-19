import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CarList = () => {
  const [cars, setCars] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Загрузка данных автомобилей с сервера
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/cars?page=${currentPage}`);
        setCars(response.data.results);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error('Error fetching cars:', error);
      }
    };

    fetchCars();
  }, [currentPage]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  // Обработчик перехода по страницам
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="car-list">
      <h2>Список автомобилей</h2>
      <div className="car-grid">
        {cars.map((car, index) => (
          <div key={index} className="car-card">
            <div className="car-image">
              {/* <img src={car.photo} alt={car.title} /> */}
            </div>
            <div className="car-details">
              <h3>{car.title}</h3>
              {!car.title ? (
              <p className="car-description">car.description</p>
              ):(<p></p>)}
              {car.price ? (
                <p className="car-price">Цена: {formatPrice(car.price)} сум</p>
              ) : car.price_usd ? (
                <p className="car-price-usd">Цена: {formatPrice(car.price_usd)} USD</p>
              ) : (
                <p className="car-price-not-available">Цена не указана</p>
              )}
              <p className="car-location">
                Локация: {car.location_city}
                {car.location_region ? `, ${car.location_region}` : ''}
              </p>
              <a href={car.url} target="_blank" rel="noopener noreferrer" className="car-link">Подробнее</a>
            </div>
          </div>
        ))}
      </div>

      {/* Пагинация */}
      <div className="pagination">
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
          Назад
        </button>
        <span>
          Страница {currentPage} из {totalPages}
        </span>
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
          Вперед
        </button>
      </div>
    </div>
  );
};

export default CarList;
