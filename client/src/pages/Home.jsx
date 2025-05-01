import React, { useState, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext';
import toast from 'react-hot-toast';
import './Home.css';
import { motion } from 'framer-motion';
import axios from 'axios';

const Home = () => {
  const { items, setItems, deleteItem: contextDeleteItem, updateItem: contextUpdateItem } = useInventory();
  const [editingId, setEditingId] = useState(null);
  const [editedItem, setEditedItem] = useState({ name: '', expiry: '', category: '' });
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ fresh: 0, expiringSoon: 0, expired: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  // Fetch items from backend
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get('/api/items');
        setItems(response.data);
        setLoading(false);
      } catch (err) {
        toast.error('Failed to fetch items');
        console.error(err);
        setLoading(false);
      }
    };

    fetchItems();
  }, [setItems]);

  // Calculate expiration stats
  useEffect(() => {
    let fresh = 0;
    let expiringSoon = 0;
    let expired = 0;

    items.forEach((item) => {
      const daysLeft = Math.ceil((new Date(item.expiry) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 3 && daysLeft > 0) expiringSoon++;
      else if (daysLeft <= 0) expired++;
      else fresh++;
    });

    setStats({
      fresh,
      expiringSoon,
      expired,
      total: items.length
    });

    // Show notifications for expiring and expired items
    if (expiringSoon > 0) {
      toast(`⚠️ ${expiringSoon} item(s) expiring soon!`, { icon: '⏳' });
    }

    if (expired > 0) {
      toast.error(`❌ ${expired} item(s) already expired!`);
    }
  }, [items]);

  const handleEdit = (item) => {
    setEditingId(item._id);
    setEditedItem({
      name: item.name,
      expiry: item.expiry.split('T')[0], // Format date for input
      category: item.category
    });
  };

  const handleSave = async () => {
    try {
      const updatedItem = {
        name: editedItem.name,
        expiry: editedItem.expiry,
        category: editedItem.category
      };

      const response = await axios.patch(`/api/items/${editingId}`, updatedItem);
      contextUpdateItem(response.data);
      toast.success('✅ Item updated successfully!');
      setEditingId(null);
      setEditedItem({ name: '', expiry: '', category: '' });
    } catch (err) {
      toast.error('Failed to update item');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/items/${id}`);
      contextDeleteItem(id);
      toast.success('🗑️ Item deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete item');
      console.error(err);
    }
  };

  const getStatus = (expiry) => {
    const daysLeft = Math.ceil((new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24));
    let statusText = '✅ Fresh';
    let statusClass = 'status-fresh';
    let progressColor = '#10b981';
    let progressPercentage = 100;

    // Calculate percentage based on typical product shelf life (assuming 30 days)
    const shelfLife = 30;
    progressPercentage = Math.min(Math.max((daysLeft / shelfLife) * 100, 0), 100);

    if (daysLeft <= 3 && daysLeft > 0) {
      statusText = '⚠️ Expiring Soon';
      statusClass = 'status-warning';
      progressColor = '#f59e0b';
    } else if (daysLeft <= 0) {
      statusText = '❌ Expired';
      statusClass = 'status-expired';
      progressColor = '#ef4444';
      progressPercentage = 0;
    }

    return { daysLeft, statusText, statusClass, progressColor, progressPercentage };
  };

  // Filter and search logic
  const filteredItems = items.filter((item) => {
    const { daysLeft } = getStatus(item.expiry);
    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'fresh' && daysLeft > 3) ||
      (filterStatus === 'expiring' && daysLeft <= 3 && daysLeft > 0) ||
      (filterStatus === 'expired' && daysLeft <= 0);

    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your items...</p>
      </div>
    );
  }

  return (
    <div className="home-container">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="header-section"
      >
        <h2 className="main-title">
          <span className="icon-container">📅</span>
          Freshness Tracker
        </h2>
        <p className="subtitle">Keep track of your food and items before they expire</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="stats-container"
      >
        <div className="stat-card total">
          <h3>{stats.total}</h3>
          <p>Total Items</p>
        </div>
        <div className="stat-card fresh">
          <h3>{stats.fresh}</h3>
          <p>Fresh</p>
        </div>
        <div className="stat-card warning">
          <h3>{stats.expiringSoon}</h3>
          <p>Expiring Soon</p>
        </div>
        <div className="stat-card danger">
          <h3>{stats.expired}</h3>
          <p>Expired</p>
        </div>
      </motion.div>

      <div className="controls-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search items or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'fresh' ? 'active' : ''}`}
            onClick={() => setFilterStatus('fresh')}
          >
            Fresh
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'expiring' ? 'active' : ''}`}
            onClick={() => setFilterStatus('expiring')}
          >
            Expiring Soon
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'expired' ? 'active' : ''}`}
            onClick={() => setFilterStatus('expired')}
          >
            Expired
          </button>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <p>
            {items.length === 0
              ? "No items yet! Add some via Scan or Inventory tab."
              : "No matching items found."}
          </p>
        </div>
      ) : (
        <div className="items-grid">
          {filteredItems.map((item, index) => {
            const { daysLeft, statusText, statusClass, progressColor, progressPercentage } = getStatus(item.expiry);

            return (
              <motion.div
                key={item._id}
                className={`item-card ${statusClass}-card`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.03 }}
              >
                {editingId === item._id ? (
                  <div className="edit-form">
                    <input
                      value={editedItem.name}
                      onChange={(e) => setEditedItem({ ...editedItem, name: e.target.value })}
                      className="edit-input"
                      placeholder="Item Name"
                    />
                    <input
                      type="date"
                      value={editedItem.expiry}
                      onChange={(e) => setEditedItem({ ...editedItem, expiry: e.target.value })}
                      className="edit-input"
                    />
                    <input
                      value={editedItem.category}
                      onChange={(e) => setEditedItem({ ...editedItem, category: e.target.value })}
                      className="edit-input"
                      placeholder="Category"
                    />
                    <div className="edit-actions">
                      <button
                        onClick={handleSave}
                        className="btn-save"
                      >
                        💾 Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="btn-cancel"
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="item-header">
                      <p className="item-name">{item.name}</p>
                      <span className={statusClass}>{statusText}</span>
                    </div>
                    
                    <div className="expiry-progress">
                      <div 
                        className="progress-bar" 
                        style={{ 
                          width: `${progressPercentage}%`,
                          backgroundColor: progressColor
                        }}
                      ></div>
                    </div>
                    
                    <div className="item-details">
                      <p><span className="detail-icon">🕒</span> Expires: {new Date(item.expiry).toLocaleDateString()}</p>
                      <p><span className="detail-icon">📂</span> Category: {item.category}</p>
                      <p>
                        <span className="detail-icon">⏳</span> 
                        {daysLeft > 0 
                          ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left` 
                          : `Expired ${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? 's' : ''} ago`}
                      </p>
                    </div>

                    <div className="item-actions">
                      <button
                        onClick={() => handleEdit(item)}
                        className="btn-edit"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="btn-delete"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Home;