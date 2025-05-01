import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInventory } from '../context/InventoryContext';
import './AddItemModal.css';

const AddItemModal = ({ closeModal, onAddItem }) => {
  const { addItem } = useInventory();
  const [formData, setFormData] = useState({
    name: '',
    type: 'Food', // Default value
    category: 'General', // Default value
    expiry: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeField, setActiveField] = useState(null);
  const [formProgress, setFormProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  // Calculate form completion percentage
  useEffect(() => {
    const requiredFields = ['name', 'expiry'];
    const filledRequired = requiredFields.filter(field => 
      formData[field] && formData[field].trim() !== ''
    ).length;
    
    const otherFields = ['type', 'category'];
    const filledOther = otherFields.filter(field => 
      formData[field] && formData[field].trim() !== ''
    ).length;

    // Weight required fields more heavily
    const progress = ((filledRequired / requiredFields.length) * 70) + 
                    ((filledOther / otherFields.length) * 30);
    setFormProgress(progress);
    
    // Check if expiry date is in the past
    if (formData.expiry) {
      const isDateExpired = new Date(formData.expiry) < new Date(new Date().setHours(0, 0, 0, 0));
      setIsExpired(isDateExpired);
    }
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleFocus = (fieldName) => {
    setActiveField(fieldName);
  };

  const handleBlur = () => {
    setActiveField(null);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.expiry) {
      newErrors.expiry = 'Expiry date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Shake animation effect on error
      const modalElement = document.querySelector('.modal-content');
      modalElement.classList.add('shake');
      setTimeout(() => {
        modalElement.classList.remove('shake');
      }, 500);
      return;
    }
    
    try {
      setIsSubmitting(true);
      // Add isExpired flag to the item data
      await addItem({...formData, isExpired});
      
      // Show success animation
      setShowSuccess(true);
      
      // Close after success animation
      setTimeout(() => {
        closeModal();
      }, 1500);
    } catch (error) {
      // Error already handled in context
      setIsSubmitting(false);
    }
  };

  // Get input class based on states
  const getInputClass = (fieldName) => {
    let classes = 'form-input';
    if (activeField === fieldName) classes += ' input-active';
    if (errors[fieldName]) classes += ' input-error';
    if (formData[fieldName] && formData[fieldName].trim() !== '') classes += ' input-filled';
    if (fieldName === 'expiry' && isExpired) classes += ' input-expired';
    return classes;
  };

  // Generate expiry suggestions based on type
  const suggestExpiry = (type) => {
    const today = new Date();
    let days = 0;
    
    switch (type) {
      case 'Food':
        days = 7; // Default food expiry suggestion: 1 week
        break;
      case 'Medicine':
        days = 90; // Default medicine expiry suggestion: 3 months
        break;
      case 'Household':
        days = 180; // Default household item expiry suggestion: 6 months
        break;
      default:
        days = 30; // Default for other: 1 month
    }
    
    today.setDate(today.getDate() + days);
    return today.toISOString().split('T')[0];
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeModal}
      >
        <motion.div 
          className="modal-content"
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: "spring", damping: 15 }}
          onClick={(e) => e.stopPropagation()}
        >
          {showSuccess ? (
            <motion.div 
              className="success-animation"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 10 }}
            >
              <div className="success-icon">
                <svg viewBox="0 0 24 24">
                  <motion.path
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    d="M5,13 L9,17 L18,8"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                </svg>
              </div>
              <motion.h3 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="success-text"
              >
                {isExpired ? 'Expired Item Added!' : 'Item Added Successfully!'}
              </motion.h3>
            </motion.div>
          ) : (
            <>
              <div className="modal-header">
                <motion.h3 
                  className="modal-title"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                >
                  <span className="title-icon">✨</span> Add To ExpiRix
                </motion.h3>
                <motion.button 
                  className="close-button"
                  onClick={closeModal}
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  &times;
                </motion.button>
              </div>
              
              <div className="progress-container">
                <div className="progress-label">
                  <span>Form completion</span>
                  <span>{Math.round(formProgress)}%</span>
                </div>
                <div className="progress-track">
                  <motion.div 
                    className="progress-bar"
                    initial={{ width: 0 }}
                    animate={{ width: `${formProgress}%` }}
                    transition={{ type: "spring", stiffness: 100 }}
                  />
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="add-item-form">
                <motion.div 
                  className="form-group"
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                >
                  <label className={activeField === 'name' ? 'label-active' : ''}>
                    <span className="input-icon">📦</span> Name *
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onFocus={() => handleFocus('name')}
                      onBlur={handleBlur}
                      className={getInputClass('name')}
                      placeholder="Enter item name"
                    />
                    <AnimatePresence>
                      {formData.name && !errors.name && (
                        <motion.span 
                          className="input-valid-icon"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                        >
                          ✓
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <AnimatePresence>
                    {errors.name && (
                      <motion.span 
                        className="error-message"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        {errors.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
                
                <motion.div 
                  className="form-row"
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.1 }}
                >
                  <div className="form-group half-width">
                    <label className={activeField === 'type' ? 'label-active' : ''}>
                      <span className="input-icon">🏷️</span> Type
                    </label>
                    <div className="select-wrapper">
                      <select
                        name="type"
                        value={formData.type}
                        onChange={(e) => {
                          handleChange(e);
                          // Update expiry suggestion when type changes
                          if (!formData.expiry) {
                            setFormData(prev => ({
                              ...prev,
                              expiry: suggestExpiry(e.target.value)
                            }));
                          }
                        }}
                        onFocus={() => handleFocus('type')}
                        onBlur={handleBlur}
                        className={getInputClass('type')}
                      >
                        <option value="Food">Food</option>
                        <option value="Medicine">Medicine</option>
                        <option value="Household">Household</option>
                        <option value="Other">Other</option>
                      </select>
                      <span className="select-arrow">▼</span>
                    </div>
                  </div>
                  
                  <div className="form-group half-width">
                    <label className={activeField === 'category' ? 'label-active' : ''}>
                      <span className="input-icon">📁</span> Category
                    </label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        onFocus={() => handleFocus('category')}
                        onBlur={handleBlur}
                        className={getInputClass('category')}
                        placeholder="e.g., Dairy, Prescription"
                      />
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="form-group"
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.2 }}
                >
                  <label className={`${activeField === 'expiry' ? 'label-active' : ''} ${isExpired ? 'expired-label' : ''}`}>
                    <span className="input-icon">{isExpired ? '⚠️' : '📅'}</span> 
                    {isExpired ? 'Expired Date *' : 'Expiry Date *'}
                  </label>
                  <div className="input-wrapper date-wrapper">
                    <input
                      type="date"
                      name="expiry"
                      value={formData.expiry}
                      onChange={handleChange}
                      onFocus={() => handleFocus('expiry')}
                      onBlur={handleBlur}
                      className={getInputClass('expiry')}
                      // Removed min attribute to allow past dates
                      placeholder="Select date"
                    />
                    {!formData.expiry && (
                      <button 
                        type="button" 
                        className="suggestion-button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            expiry: suggestExpiry(formData.type)
                          }));
                        }}
                      >
                        Suggest
                      </button>
                    )}
                  </div>
                  {isExpired && (
                    <motion.div 
                      className="expired-warning"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      This item has already expired!
                    </motion.div>
                  )}
                  <AnimatePresence>
                    {errors.expiry && (
                      <motion.span 
                        className="error-message"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        {errors.expiry}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
                
                <motion.div 
                  className="modal-actions"
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.3 }}
                >
                  <motion.button 
                    type="button" 
                    onClick={closeModal}
                    className="cancel-button"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button 
                    type="submit" 
                    disabled={isSubmitting}
                    className={`submit-button ${isExpired ? 'expired-button' : ''}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isSubmitting ? (
                      <div className="button-content">
                        <div className="spinner"></div>
                        <span>Adding...</span>
                      </div>
                    ) : (
                      <div className="button-content">
                        <span>{isExpired ? 'Add Expired Item' : 'Add Item'}</span>
                        <span className="button-icon">→</span>
                      </div>
                    )}
                  </motion.button>
                </motion.div>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddItemModal;