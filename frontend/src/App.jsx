import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import OrderTracking from './pages/OrderTracking';
import KitchenDashboard from './pages/KitchenDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/track" element={<OrderTracking />} />
        <Route path="/kitchen" element={<KitchenDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

