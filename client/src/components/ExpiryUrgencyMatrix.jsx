import React from 'react';

const ExpiryUrgencyMatrix = ({ items, onFilterChange }) => {
  const getCounts = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const counts = {
      expiredToday: 0,
      expiringIn1to3Days: 0,
      expiringThisWeek: 0,
      next2Weeks: 0,
      thisMonth: 0,
      nextMonth: 0,
      fresh30Plus: 0,
      nonPerishable: 0,
      unlabeled: 0,
    };

    items.forEach((item) => {
      if (!item.expiry) {
        counts.unlabeled++;
        return;
      }

      if (item.category && item.category.toLowerCase() === 'non-perishable') {
        counts.nonPerishable++;
        return;
      }

      const expiryDate = new Date(item.expiry);
      const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

      if (daysLeft <= 0) {
        counts.expiredToday++;
      } else if (daysLeft <= 3) {
        counts.expiringIn1to3Days++;
      } else if (daysLeft <= 7) {
        counts.expiringThisWeek++;
      } else if (daysLeft <= 14) {
        counts.next2Weeks++;
      } else if (daysLeft <= 30) {
        counts.thisMonth++;
      } else if (daysLeft <= 60) {
        counts.nextMonth++;
      } else {
        counts.fresh30Plus++;
      }
    });

    return counts;
  };

  const counts = getCounts();

  const handleCellClick = (filter) => {
    onFilterChange(filter);
  };

  const renderCell = (title, count, icon, colorClass, filter) => {
    return (
      <div
        className={`urgency-cell ${colorClass} ${count > 0 ? 'has-items' : ''}`}
        onClick={() => handleCellClick(filter)}
      >
        <div className="cell-icon">{icon}</div>
        <div className="cell-title">{title}</div>
        <div className="cell-count">{count}</div>
      </div>
    );
  };

  return (
    <div className="urgency-matrix-container">
      <h3 className="urgency-matrix-title">Expiry Urgency Matrix</h3>
      <div className="urgency-matrix">
        <div className="urgency-row red-zone">
          {renderCell('Expired Today', counts.expiredToday, '⚠️', 'critical', { type: 'expired', days: 0 })}
          {renderCell('1-3 Days', counts.expiringIn1to3Days, '🔥', 'urgent', { type: 'expiring', minDays: 1, maxDays: 3 })}
          {renderCell('This Week', counts.expiringThisWeek, '⏰', 'warning', { type: 'expiring', minDays: 4, maxDays: 7 })}
        </div>
        <div className="urgency-row yellow-zone">
          {renderCell('Next 2 Weeks', counts.next2Weeks, '📅', 'attention', { type: 'upcoming', minDays: 8, maxDays: 14 })}
          {renderCell('This Month', counts.thisMonth, '📆', 'monitor', { type: 'upcoming', minDays: 15, maxDays: 30 })}
          {renderCell('Next Month', counts.nextMonth, '🗓️', 'planning', { type: 'future', minDays: 31, maxDays: 60 })}
        </div>
        <div className="urgency-row green-zone">
          {renderCell('30+ Days', counts.fresh30Plus, '✅', 'safe', { type: 'fresh', minDays: 61 })}
          {renderCell('Non-Perishable', counts.nonPerishable, '🏺', 'permanent', { type: 'non-perishable' })}
          {renderCell('Unlabeled', counts.unlabeled, '❓', 'unknown', { type: 'unlabeled' })}
        </div>
      </div>
    </div>
  );
};

export default ExpiryUrgencyMatrix;