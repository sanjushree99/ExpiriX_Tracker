import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import './Scan.css';
import { FaCamera, FaUpload, FaBarcode, FaStop, FaQrcode, FaBox } from 'react-icons/fa';
import { MdDateRange, MdOutlineInventory2, MdAccessTime } from 'react-icons/md';
import toast from 'react-hot-toast';
import { useInventory } from '../context/InventoryContext';
import { BrowserMultiFormatReader } from '@zxing/library';
import { motion } from 'framer-motion';

const Scan = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [itemSaved, setItemSaved] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');
  const [manufactureDate, setManufactureDate] = useState('');
  const [productName, setProductName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addItem } = useInventory();
  
  const videoRef = useRef(null);
  const codeReader = useMemo(() => new BrowserMultiFormatReader(), []);

  // Wrap stopScanner in useCallback
  const stopScanner = useCallback(() => {
    codeReader.reset();
    setIsScanning(false);
  }, [codeReader]);

  // Clean up scanner on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      setScanResult(null);
      setItemSaved(false);
      stopScanner();
    }
  };

  const scanFromImage = async () => {
    if (!selectedImage) {
      toast.error('No image selected!');
      return;
    }

    try {
      setIsLoading(true);
      const result = await codeReader.decodeFromImageUrl(selectedImage);
      handleScanResult(result.getText());
    } catch (error) {
      toast.error('No barcode detected in image');
      console.error('Barcode scan error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startCameraScanner = async () => {
    try {
      setIsScanning(true);
      setSelectedImage(null);
      setScanResult(null);
      
      const devices = await codeReader.listVideoInputDevices();
      const deviceId = devices[0].deviceId;
      
      await codeReader.decodeFromVideoDevice(deviceId, videoRef.current, (result, error) => {
        if (result) {
          handleScanResult(result.getText());
          stopScanner();
        }
        if (error && !(error instanceof Error)) {
          console.error('Scan error:', error);
        }
      });
    } catch (error) {
      toast.error('Error starting camera');
      console.error('Camera error:', error);
      setIsScanning(false);
    }
  };

  const handleScanResult = async (barcode) => {
    toast.success(`Barcode detected: ${barcode}`);
    setScanResult(barcode);
    
    // In a real app, you would fetch product details from your API
    setIsLoading(true);
    // For demo, we'll simulate an API call
    const productInfo = await fetchProductDetails(barcode);
    setIsLoading(false);
    
    if (productInfo) {
      setProductName(productInfo.name);
      setManufactureDate(productInfo.manufactureDate);
      setExpiryDate(productInfo.expiryDate);
    }
  };

  const fetchProductDetails = async (barcode) => {
    // Simulate API call
    return new Promise(resolve => {
      setTimeout(() => {
        // Mock data - replace with actual API call
        const mockProducts = {
          '123456789012': {
            name: 'Paracetamol 500mg',
            manufactureDate: '2023-06-15',
            expiryDate: '2025-06-14',
            category: 'Medicine'
          },
          '987654321098': {
            name: 'Organic Almond Milk',
            manufactureDate: '2024-01-10',
            expiryDate: '2024-07-09',
            category: 'Food'
          },
          '456789123456': {
            name: 'Vitamin C Supplement',
            manufactureDate: '2023-11-20',
            expiryDate: '2025-11-19',
            category: 'Supplements'
          }
        };
        
        resolve(mockProducts[barcode] || {
          name: `Product ${barcode}`,
          manufactureDate: new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0], // 30 days ago
          expiryDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0], // 1 year from now
          category: 'General'
        });
      }, 1000);
    });
  };

  const handleSaveToInventory = async () => {
    if (!productName || !expiryDate) {
      toast.error('Missing product information');
      return;
    }
  
    try {
      await addItem({
        name: productName,
        type: 'Scanned', // You can customize this
        expiry: expiryDate,
        category: 'Scanned Items' // Default category for scanned items
      });
      
      toast.success('Item saved to inventory!');
      setItemSaved(true);
    } catch (err) {
      toast.error('Failed to save item');
    }
  };

  const resetScanner = () => {
    stopScanner();
    setSelectedImage(null);
    setScanResult(null);
    setItemSaved(false);
    setProductName('');
    setExpiryDate('');
    setManufactureDate('');
  };

  const getExpiryStatus = () => {
    if (!expiryDate) return "";
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "expired";
    if (diffDays < 30) return "expiring-soon";
    return "valid";
  };

  return (
    <div className="scan-page">
      <div className="scan-header">
        <FaQrcode className="scan-logo" />
        <h2>Smart Scanner</h2>
        <p>Scan barcodes to automatically track expiry dates</p>
      </div>

      <div className="scan-options">
        <motion.button 
          className={`scan-option-btn ${isScanning ? 'active' : ''}`}
          onClick={isScanning ? stopScanner : startCameraScanner}
          whileTap={{ scale: 0.95 }}
        >
          {isScanning ? <FaStop /> : <FaCamera />}
          <span>{isScanning ? 'Stop Scanner' : 'Use Camera'}</span>
        </motion.button>

        <motion.label 
          htmlFor="file-upload" 
          className="scan-option-btn"
          whileTap={{ scale: 0.95 }}
        >
          <FaUpload />
          <span>Upload Image</span>
          <input
            type="file"
            id="file-upload"
            accept="image/*"
            onChange={handleImageUpload}
            hidden
          />
        </motion.label>
      </div>

      {isScanning && (
        <div className="scanner-container">
          <video ref={videoRef} className="scanner-video" />
          <div className="scan-overlay">
            <div className="scan-line"></div>
          </div>
          <div className="scanner-instructions">
            <p>Position barcode within the frame</p>
          </div>
        </div>
      )}

      {selectedImage && !isScanning && (
        <motion.div 
          className="preview"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="image-container">
            <img src={selectedImage} alt="Preview" />
          </div>
          <motion.button 
            className={`action-btn ${isLoading ? 'loading-btn' : ''}`} 
            onClick={scanFromImage}
            whileTap={{ scale: 0.95 }}
            disabled={isLoading}
          >
            {isLoading ? (
              <><span className="spinner"></span> Processing...</>
            ) : (
              <><FaBarcode /> Scan Barcode</>
            )}
          </motion.button>
        </motion.div>
      )}

      {!selectedImage && !isScanning && (
        <div className="placeholder">
          <div className="placeholder-icon">
            <FaCamera className="camera-icon" />
          </div>
          <p>Upload an image or use camera to scan</p>
        </div>
      )}

      {(scanResult || productName) && (
        <motion.div 
          className="scan-result"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="result-header">
            <FaBox />
            <h3>Product Information</h3>
          </div>
          
          {productName && (
            <div className="product-info product-name">
              <span className="info-label">Name</span>
              <span className="info-value">{productName}</span>
            </div>
          )}

          {scanResult && (
            <div className="product-info barcode-info">
              <span className="info-label">Barcode</span>
              <span className="info-value barcode">{scanResult}</span>
            </div>
          )}

          {manufactureDate && (
            <div className="product-info date-info">
              <span className="info-label">
                <MdAccessTime className="info-icon" /> Manufacture Date
              </span>
              <span className="info-value">{manufactureDate}</span>
            </div>
          )}

          {expiryDate && (
            <div className={`product-info date-info expiry-info ${getExpiryStatus()}`}>
              <span className="info-label">
                <MdDateRange className="info-icon" /> Expiry Date
              </span>
              <span className="info-value">{expiryDate}</span>
            </div>
          )}

          <div className="action-buttons">
            {!itemSaved ? (
              <motion.button 
                className="action-btn save-btn" 
                onClick={handleSaveToInventory}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <MdOutlineInventory2 /> Save to Inventory
              </motion.button>
            ) : (
              <div className="saved-message">
                <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                  <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                  <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                </svg>
                <p>Item saved successfully!</p>
              </div>
            )}
            <motion.button 
              className="action-btn secondary-btn" 
              onClick={resetScanner}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Scan Another
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Scan;