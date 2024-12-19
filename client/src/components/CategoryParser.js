import React from 'react';

// const CategoryParser = () => {
//   return (
//     <div>
//       <h1>Category Parser Component</h1>
//     </div>
//   );
// };

import React, { useState } from 'react';

const CategoryParser = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Пример категорий
  const categories = [
    { id: '108', name: 'Легковые автомобили' },
    { id: '109', name: 'Грузовые автомобили' },
    { id: '110', name: 'Мотоциклы' },
    { id: '111', name: 'Водный транспорт' },
    { id: '112', name: 'Спецтехника' },
  ];

  // Обработчик выбора категории
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    console.log(`https://www.olx.uz/api/v1/offers/?offset=${offset}&limit=${limit}&category_id=108: ${category_id=108}`);
    console.log(`https://www.olx.uz/api/v1/offers/?offset=${offset}&limit=${limit}&category_id=109: ${category_id=109}`);
    
    // Здесь можно вызвать функцию для парсинга данных по категории
    fetchDataForCategory(categoryId);
  };

  // Функция для парсинга данных (заглушка)
  const fetchDataForCategory = (categoryId) => {
    console.log(`Получаем данные для категории ID: ${categoryId}`);
    // Здесь должен быть вызов API или парсинг
  };

  return (
    <div>
      <h2>Выберите категорию</h2>
      <ul>
        {categories.map((category) => (
          <li key={category.id}>
            <button onClick={() => handleCategorySelect(category.id)}>
              {category.name}
            </button>
          </li>
        ))}
      </ul>
      {selectedCategory && <p>Вы выбрали категорию с ID: {selectedCategory}</p>}
    </div>
  );
};

export default CategoryParser;
