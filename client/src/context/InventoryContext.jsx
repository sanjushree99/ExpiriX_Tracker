// client/src/context/InventoryContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get('/items');
      setItems(data);
    } catch (error) {
      console.error('Fetch items error:', error);
      setError(error);
      toast.error(`Failed to load items: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addItem = async (itemData) => {
    try {
      const formattedItem = {
        ...itemData,
        expiry: new Date(itemData.expiry).toISOString()
      };
      
      const newItem = await api.post('/items', formattedItem);
      setItems(prev => [...prev, newItem]);
      toast.success('Item added successfully!');
      return newItem;
    } catch (error) {
      console.error('Add item error:', error);
      let errorMessage = error.message;
      
      if (error.details) {
        errorMessage = Object.values(error.details).join(', ');
      }
      
      toast.error(`Failed to add item: ${errorMessage}`);
      throw error;
    }
  };

  const deleteItem = async (id) => {
    try {
      await api.delete(`/items/${id}`);
      setItems(prev => prev.filter(item => item._id !== id));
      toast.success('Item deleted successfully!');
    } catch (error) {
      console.error('Delete item error:', error);
      toast.error(`Failed to delete item: ${error.message}`);
      throw error;
    }
  };

  const value = {
    items,
    loading,
    error,
    addItem,
    deleteItem,
    refreshItems: fetchItems
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};