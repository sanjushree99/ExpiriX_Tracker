// src/index.jsx
import React from 'react';
import { createRoot } from 'react-dom/client'; // ✅ import createRoot instead of ReactDOM
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { InventoryProvider } from './context/InventoryContext';

const container = document.getElementById('root'); // ✅ Get the root container
const root = createRoot(container); // ✅ Create a root using createRoot

root.render( // ✅ Use root.render instead of ReactDOM.render
  <React.StrictMode>
    <AuthProvider>
      <InventoryProvider>
        <App />
      </InventoryProvider>
    </AuthProvider>
  </React.StrictMode>
);