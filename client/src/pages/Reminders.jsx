import React, { useState, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext';
import './Reminders.css';

const Reminders = () => {
  const { items, removeItem } = useInventory();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [groupByCategory, setGroupByCategory] = useState(false);
  const [sortOrder, setSortOrder] = useState('expirySoon');
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotificationBanner, setShowNotificationBanner] = useState(true);

  // Calculate days left until expiration
  const getDaysLeft = (expiry) => {
    return Math.ceil((new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24));
  };

  // Get status text and emoji based on days left
  const getItemStatus = (daysLeft) => {
    if (daysLeft <= 0) return { text: 'Expired', emoji: '❌', class: 'expired' };
    if (daysLeft <= 3) return { text: 'Expiring Soon', emoji: '⚠️', class: 'expiring-soon' };
    if (daysLeft <= 7) return { text: 'Use Soon', emoji: '⏳', class: 'use-soon' };
    return { text: 'Fresh', emoji: '✅', class: 'fresh' };
  };

  // Format date to be more readable
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Check for notifications on component mount and when items change
  useEffect(() => {
    const expiredItems = items.filter(item => getDaysLeft(item.expiry) <= 0);
    const expiringItems = items.filter(item => {
      const days = getDaysLeft(item.expiry);
      return days > 0 && days <= 3;
    });
    
    let newNotifications = [];
    
    if (expiredItems.length > 0) {
      newNotifications.push({
        id: 'expired',
        message: `${expiredItems.length} item${expiredItems.length > 1 ? 's' : ''} in your inventory ${expiredItems.length > 1 ? 'have' : 'has'} expired!`,
        type: 'danger'
      });
    }
    
    if (expiringItems.length > 0) {
      newNotifications.push({
        id: 'expiring',
        message: `${expiringItems.length} item${expiringItems.length > 1 ? 's' : ''} will expire in the next 3 days!`,
        type: 'warning'
      });
    }
    
    // Weekly reminder (only on Sundays)
    const today = new Date();
    if (today.getDay() === 0) {
      const upcomingItems = items.filter(item => {
        const days = getDaysLeft(item.expiry);
        return days > 0 && days <= 7;
      });
      
      if (upcomingItems.length > 0) {
        newNotifications.push({
          id: 'weekly',
          message: `Weekly reminder: You have ${upcomingItems.length} items expiring this week!`,
          type: 'info'
        });
      }
    }
    
    setNotifications(newNotifications);
  }, [items]);

  // Sort and filter items
  const getFilteredAndSortedItems = () => {
    let filtered = [...items].filter(item => {
      const daysLeft = getDaysLeft(item.expiry);
      const matchesFilter = 
        filter === 'all' || 
        (filter === 'expired' && daysLeft <= 0) ||
        (filter === 'expiring-soon' && daysLeft > 0 && daysLeft <= 3) ||
        (filter === 'upcoming' && daysLeft > 3 && daysLeft <= 7) ||
        (filter === 'fresh' && daysLeft > 7);
      
      const matchesSearch = searchQuery === '' || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesFilter && matchesSearch;
    });

    // Apply sorting
    switch (sortOrder) {
      case 'expirySoon':
        filtered.sort((a, b) => new Date(a.expiry) - new Date(b.expiry));
        break;
      case 'nameAsc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'nameDesc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'categoryAsc':
        filtered.sort((a, b) => a.category.localeCompare(b.category));
        break;
      default:
        filtered.sort((a, b) => new Date(a.expiry) - new Date(b.expiry));
    }

    return filtered;
  };

  // Group items by category
  const getGroupedItems = (filteredItems) => {
    const grouped = {};
    
    filteredItems.forEach(item => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });
    
    return grouped;
  };

  // Get counts for statistics
  const getItemStats = () => {
    const expiredCount = items.filter(item => getDaysLeft(item.expiry) <= 0).length;
    const expiringSoonCount = items.filter(item => {
      const days = getDaysLeft(item.expiry);
      return days > 0 && days <= 3;
    }).length;
    const useSoonCount = items.filter(item => {
      const days = getDaysLeft(item.expiry);
      return days > 3 && days <= 7;
    }).length;
    const freshCount = items.filter(item => getDaysLeft(item.expiry) > 7).length;
    
    return { expiredCount, expiringSoonCount, useSoonCount, freshCount };
  };

  // Print reminders list
  const handlePrint = () => {
    setShowPrintPreview(true);
    setTimeout(() => {
      window.print();
      setShowPrintPreview(false);
    }, 500);
  };

  const handleRemoveItem = (item) => {
    if (window.confirm(`Are you sure you want to remove ${item.name} from your inventory?`)) {
      removeItem(item.id);
    }
  };

  // Dismiss notification
  const dismissNotification = (id) => {
    setNotifications(notifications.filter(note => note.id !== id));
  };

  // Dismiss all notifications
  const dismissAllNotifications = () => {
    setShowNotificationBanner(false);
  };
  
  const filteredItems = getFilteredAndSortedItems();
  const groupedItems = getGroupedItems(filteredItems);
  const { expiredCount, expiringSoonCount, useSoonCount, freshCount } = getItemStats();
  const totalItems = items.length;

  return (
    <div className={`reminders-container ${showPrintPreview ? 'print-preview' : ''}`}>
      {/* Header section */}
      <header className="reminders-header">
        <h1 className="reminders-title">
          <span className="reminders-icon">🔔</span> Expiry Reminders
        </h1>
        <p className="reminders-subtitle">Track your items' expiration dates</p>
      </header>

      {/* Notification Banner */}
      {notifications.length > 0 && showNotificationBanner && (
        <div className="notification-banner">
          <div className="notification-header">
            <h3>Important Notifications</h3>
            <button onClick={dismissAllNotifications} className="close-button">×</button>
          </div>
          <div className="notification-list">
            {notifications.map((notification) => (
              <div key={notification.id} className={`notification notification-${notification.type}`}>
                <span className="notification-message">{notification.message}</span>
                <button 
                  className="notification-dismiss" 
                  onClick={() => dismissNotification(notification.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats cards section */}
      <section className="stats-container">
        <div className="stat-card expired-card">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <h3 className="stat-title">Expired</h3>
            <span className="stat-value">{expiredCount}</span>
          </div>
        </div>
        
        <div className="stat-card expiring-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3 className="stat-title">Expiring Soon</h3>
            <span className="stat-value">{expiringSoonCount}</span>
          </div>
        </div>
        
        <div className="stat-card use-soon-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3 className="stat-title">Use This Week</h3>
            <span className="stat-value">{useSoonCount}</span>
          </div>
        </div>
        
        <div className="stat-card fresh-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3 className="stat-title">Fresh</h3>
            <span className="stat-value">{freshCount}</span>
          </div>
        </div>
      </section>

      {/* Controls section */}
      <section className="controls-container">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search items..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="filters-container">
          <select
            className="filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Items</option>
            <option value="expired">Expired Only</option>
            <option value="expiring-soon">Expiring Soon (3 Days)</option>
            <option value="upcoming">Use This Week (7 Days)</option>
            <option value="fresh">Fresh Items</option>
          </select>

          <select
            className="sort-select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="expirySoon">Sort by Expiry Date</option>
            <option value="nameAsc">Sort by Name (A-Z)</option>
            <option value="nameDesc">Sort by Name (Z-A)</option>
            <option value="categoryAsc">Sort by Category</option>
          </select>

          <button
            className={`group-button ${groupByCategory ? 'active' : ''}`}
            onClick={() => setGroupByCategory(!groupByCategory)}
          >
            {groupByCategory ? '✓ Grouped' : 'Group by Category'}
          </button>
        </div>

        <div className="actions-container">
          <button className="action-button print-button" onClick={handlePrint}>
            <span className="button-icon">🖨️</span> Print List
          </button>
        </div>
      </section>

      {/* Items list section */}
      <section className="items-container">
        <h2 className="section-title">Your Inventory Items</h2>
        
        {totalItems === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3>Your inventory is empty</h3>
            <p>Add items to start tracking their expiry dates</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>No items match your filters</h3>
            <p>Try changing your search or filter settings</p>
            <button onClick={() => { setFilter('all'); setSearchQuery(''); }} className="empty-state-button">
              Reset Filters
            </button>
          </div>
        ) : groupByCategory ? (
          // Grouped view
          <div className="grouped-items">
            {Object.keys(groupedItems).map(category => (
              <div key={category} className="category-group">
                <h3 className="category-title">{category}</h3>
                <div className="items-grid">
                  {groupedItems[category].map((item, index) => {
                    const daysLeft = getDaysLeft(item.expiry);
                    const status = getItemStatus(daysLeft);
                    return (
                      <div key={index} className={`item-card ${status.class}-card`}>
                        {renderItemContent(item, daysLeft, status)}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List view
          <div className="items-grid">
            {filteredItems.map((item, index) => {
              const daysLeft = getDaysLeft(item.expiry);
              const status = getItemStatus(daysLeft);
              return (
                <div key={index} className={`item-card ${status.class}-card`}>
                  {renderItemContent(item, daysLeft, status)}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Weekly meal planning suggestion section */}
      {useSoonCount + expiringSoonCount > 0 && (
        <section className="suggestion-section">
          <h2 className="section-title">
            <span className="suggestion-icon">💡</span> Suggestions
          </h2>
          <div className="suggestion-card">
            <h3>Plan Your Week</h3>
            <p>You have {useSoonCount + expiringSoonCount} items to use in the next week:</p>
            <div className="meal-plan">
              {filteredItems
                .filter(item => {
                  const days = getDaysLeft(item.expiry);
                  return days > 0 && days <= 7;
                })
                .slice(0, 5)
                .map((item, index) => (
                  <div key={index} className="meal-suggestion">
                    <span className="meal-day">Day {index + 1}:</span> 
                    <span className="meal-item">Use {item.name} (expires in {getDaysLeft(item.expiry)} days)</span>
                  </div>
                ))
              }
            </div>
          </div>
        </section>
      )}

      {/* Footer with tips */}
      <footer className="reminders-footer">
        <div className="tips-container">
          <h3 className="tips-title">
            <span className="tips-icon">💡</span> Quick Tips:
          </h3>
          <ul className="tips-list">
            <li>Items expiring within 3 days should be consumed soon</li>
            <li>Check your reminders regularly to reduce waste</li>
            <li>Organize items by expiry date for better visibility</li>
          </ul>
        </div>
      </footer>
    </div>
  );

  // Helper function to render item card content
  function renderItemContent(item, daysLeft, status) {
    return (
      <>
        <div className="item-status-badge">{status.emoji}</div>
        <h3 className="item-name">{item.name}</h3>
        
        <div className="item-details">
          <div className="item-detail">
            <span className="detail-icon">📅</span> 
            <span className="detail-label">Expires:</span> 
            <span className="detail-value">{formatDate(item.expiry)}</span>
          </div>
          
          <div className="item-detail">
            <span className="detail-icon">⏳</span> 
            <span className="detail-label">Days Left:</span> 
            <span className={`detail-value ${status.class}-text`}>{daysLeft}</span>
          </div>
          
          <div className="item-detail">
            <span className="detail-icon">📂</span> 
            <span className="detail-label">Category:</span> 
            <span className="detail-value">{item.category}</span>
          </div>
          
          <div className="item-detail">
            <span className="detail-icon">{status.emoji}</span> 
            <span className="detail-label">Status:</span> 
            <span className={`detail-value ${status.class}-text`}>{status.text}</span>
          </div>
        </div>
        
        <div className="item-actions">
          <button className="item-action-button remove-button" onClick={() => handleRemoveItem(item)}>
            <span className="button-icon">🗑️</span> Remove
          </button>
        </div>
      </>
    );
  }
};

export default Reminders;