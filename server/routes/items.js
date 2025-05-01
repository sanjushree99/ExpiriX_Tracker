const express = require('express');
const router = express.Router();
const Item = require('../models/Item');

// Get all items
router.get('/', async (req, res) => {
  try {
    const items = await Item.find().sort({ expiry: 1 });
    res.json(items);
  } catch (err) {
    console.error('❌ Error fetching items:', err.message);
    res.status(500).json({ message: 'Failed to fetch items: ' + err.message });
  }
});

// Create new item
router.post('/', async (req, res) => {
  const { name, expiry, category, type } = req.body;

  const item = new Item({
    name,
    expiry,
    category,
    type
  });

  try {
    const newItem = await item.save();
    res.status(201).json(newItem);
  } catch (err) {
    console.error('❌ Error creating item:', err.message);
    res.status(400).json({ message: 'Failed to create item: ' + err.message });
  }
});

// Update item
router.patch('/:id', async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedItem);
  } catch (err) {
    console.error('❌ Error updating item:', err.message);
    res.status(400).json({ message: 'Failed to update item: ' + err.message });
  }
});

// Delete item
router.delete('/:id', async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted' });
  } catch (err) {
    console.error('❌ Error deleting item:', err.message);
    res.status(500).json({ message: 'Failed to delete item: ' + err.message });
  }
});

module.exports = router;
