import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import AddItemModal from '../components/AddItemModal';
import ExpiryUrgencyMatrix from '../components/ExpiryUrgencyMatrix';
import toast from 'react-hot-toast';
import './Inventory.css';

const Inventory = () => {
  const { items, addItem, deleteItem, updateItem, loading, error } = useInventory();
  const [showModal, setShowModal] = useState(false);
  const [editedItem, setEditedItem] = useState({ 
    name: '', 
    expiry: '', 
    category: '',
    type: '' 
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('expiry');
  const [sortOrder, setSortOrder] = useState('asc');
  const [editingId, setEditingId] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);

  // Get status and styling information based on expiry date
  const getStatus = (expiry) => {
    const daysLeft = Math.ceil((new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft <= 0) {
      return { 
        label: '❌ Expired', 
        class: 'text-red-600',
        type: 'expired',
        badgeClass: 'badge-expired',
        cardClass: 'status-expired',
        progressClass: 'progress-expired',
        progressPercent: 0
      };
    }
    
    if (daysLeft <= 3) {
      const percent = (daysLeft / 3) * 100;
      return { 
        label: '⚠️ Expiring Soon', 
        class: 'text-yellow-600',
        type: 'expiring',
        badgeClass: 'badge-expiring',
        cardClass: 'status-expiring',
        progressClass: 'progress-expiring',
        progressPercent: percent
      };
    }
    
    const fullLifecycle = 30;
    const percent = Math.min(100, (daysLeft / fullLifecycle) * 100);
    
    return { 
      label: '✅ Fresh', 
      class: 'text-green-600',
      type: 'fresh',
      badgeClass: 'badge-fresh',
      cardClass: 'status-fresh',
      progressClass: 'progress-fresh',
      progressPercent: percent
    };
  };

  const handleAddItem = async (newItem) => {
    try {
      setLocalLoading(true);
      await addItem(newItem);
      toast.success('Item added successfully!');
      return true;
    } catch (error) {
      toast.error(`Failed to add item: ${error.message}`);
      return false;
    } finally {
      setLocalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLocalLoading(true);
      await deleteItem(id);
      toast.success('Item deleted successfully!');
    } catch (error) {
      toast.error(`Failed to delete item: ${error.message}`);
    } finally {
      setLocalLoading(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setEditedItem({
      name: item.name,
      type: item.type,
      category: item.category,
      expiry: item.expiry.split('T')[0] // Format for date input
    });
  };

  const saveEdit = async () => {
    try {
      setLocalLoading(true);
      await updateItem(editingId, editedItem);
      toast.success('Item updated successfully!');
      setEditingId(null);
      setEditedItem({ name: '', expiry: '', category: '', type: '' });
    } catch (error) {
      toast.error(`Failed to update item: ${error.message}`);
    } finally {
      setLocalLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditedItem({ name: '', expiry: '', category: '', type: '' });
  };

  // Get unique categories for filter dropdown
  const getCategories = () => {
    const categories = new Set(items.map(item => item.category));
    return ['all', ...categories].filter(cat => cat !== null && cat !== undefined);
  };

  // Sort and filter items
  const getSortedAndFilteredItems = () => {
    const filtered = items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
    
    return filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'expiry') {
        comparison = new Date(a.expiry) - new Date(b.expiry);
      } else if (sortBy === 'category') {
        comparison = (a.category || '').localeCompare(b.category || '');
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };
  
  const filteredItems = getSortedAndFilteredItems();
  
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your inventory...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <p className="error-message">Failed to load inventory: {error.message}</p>
        <button 
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <h2 className="page-title">📦 Your Inventory</h2>
        <button
          className="add-button"
          onClick={() => setShowModal(true)}
          disabled={localLoading}
        >
          {localLoading ? (
            <span className="spinner small"></span>
          ) : (
            <>
              <span className="add-icon">➕</span> Add Item
            </>
          )}
        </button>
      </div>

      <ExpiryUrgencyMatrix items={items} />

      <div className="controls-row">
        <input
          type="text"
          placeholder="Search items..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={localLoading}
        />
        
        <select 
          className="category-filter"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          disabled={localLoading}
        >
          <option value="all">All Categories</option>
          {getCategories().map((category, index) => (
            <option key={index} value={category}>
              {category || 'Uncategorized'}
            </option>
          ))}
        </select>

        <button 
          className="sort-button"
          onClick={() => handleSort('expiry')}
          disabled={localLoading}
        >
          Sort by Expiry {sortBy === 'expiry' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
        </button>
      </div>

      {filteredItems.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <p className="empty-message">
            {items.length === 0 
              ? "Your inventory is empty. Add some items to get started!" 
              : "No items match your search. Try different filters."
            }
          </p>
          {items.length === 0 && (
            <button 
              className="start-button"
              onClick={() => setShowModal(true)}
              disabled={localLoading}
            >
              <span>➕</span> Add Your First Item
            </button>
          )}
        </div>
      ) : (
        <div className="items-grid">
          {filteredItems.map((item) => {
            const status = getStatus(item.expiry);
            const daysLeft = Math.ceil((new Date(item.expiry) - new Date()) / (1000 * 60 * 60 * 24));

            return (
              <div
                key={item._id}
                className={`item-card ${status.cardClass} fade-in`}
              >
                <div className="card-content">
                  {editingId === item._id ? (
                    <div className="edit-form">
                      <div className="form-group">
                        <label>Name *</label>
                        <input
                          value={editedItem.name}
                          onChange={(e) => setEditedItem({ ...editedItem, name: e.target.value })}
                          className="edit-input"
                          placeholder="Item Name"
                          disabled={localLoading}
                        />
                      </div>
                      <div className="form-group">
                        <label>Type</label>
                        <select
                          value={editedItem.type}
                          onChange={(e) => setEditedItem({ ...editedItem, type: e.target.value })}
                          className="edit-input"
                          disabled={localLoading}
                        >
                          <option value="Food">Food</option>
                          <option value="Medicine">Medicine</option>
                          <option value="Household">Household</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Category</label>
                        <input
                          value={editedItem.category}
                          onChange={(e) => setEditedItem({ ...editedItem, category: e.target.value })}
                          className="edit-input"
                          placeholder="Category"
                          disabled={localLoading}
                        />
                      </div>
                      <div className="form-group">
                        <label>Expiry Date *</label>
                        <input
                          type="date"
                          value={editedItem.expiry}
                          onChange={(e) => setEditedItem({ ...editedItem, expiry: e.target.value })}
                          className="edit-input"
                          disabled={localLoading}
                        />
                      </div>
                      <div className="edit-actions">
                        <button
                          onClick={cancelEdit}
                          className="btn-cancel"
                          disabled={localLoading}
                        >
                          ❌ Cancel
                        </button>
                        <button
                          onClick={saveEdit}
                          className="btn-save"
                          disabled={localLoading}
                        >
                          {localLoading ? (
                            <span className="spinner small"></span>
                          ) : (
                            '💾 Save'
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="item-header">
                        <h3 className="item-name">{item.name}</h3>
                        <span className={`status-badge ${status.badgeClass}`}>
                          {status.label}
                        </span>
                      </div>
                      
                      <div className="expiry-progress">
                        <div 
                          className={`progress-bar ${status.progressClass}`}
                          style={{ width: `${status.progressPercent}%` }}
                        ></div>
                      </div>
                      
                      <div className="item-details">
                        <div className="detail-row">
                          <span className="detail-icon">📅</span>
                          <span>Expires: {new Date(item.expiry).toLocaleDateString()}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-icon">📂</span>
                          <span>Category: {item.category || 'Uncategorized'}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-icon">⏳</span>
                          <span>
                            {daysLeft > 0 
                              ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left` 
                              : `Expired ${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? 's' : ''} ago`
                            }
                          </span>
                        </div>
                      </div>

                      <div className="item-actions">
                        <button
                          onClick={() => startEdit(item)}
                          className="btn-edit"
                          disabled={localLoading}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="btn-delete"
                          disabled={localLoading}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <AddItemModal
          closeModal={() => setShowModal(false)}
          onAddItem={handleAddItem}
        />
      )}
    </div>
  );
};

export default Inventory;