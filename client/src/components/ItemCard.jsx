import React from 'react';

const ItemCard = ({ item }) => {
  const getDaysLeft = (date) => {
    const diff = new Date(date) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const daysLeft = getDaysLeft(item.expiry);

  let bgColor = 'bg-green-100';
  if (daysLeft <= 3) bgColor = 'bg-red-100';
  else if (daysLeft <= 7) bgColor = 'bg-yellow-100';

  return (
    <div className={`p-4 rounded shadow ${bgColor}`}>
      <h3 className="text-xl font-semibold">{item.name}</h3>
      <p>🕒 Expiry: {item.expiry}</p>
      <p>📂 Category: {item.category}</p>
      <p>
        ⏳ Days Left: <strong>{daysLeft}</strong>
      </p>
    </div>
  );
};

export default ItemCard;
