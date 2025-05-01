import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Inventory from './pages/Inventory';
import Scan from './pages/Scan';
import Donate from './pages/Donate';
import Reminders from './pages/Reminders';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Toaster position="top-right" reverseOrder={false} />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/reminders" element={<Reminders />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;