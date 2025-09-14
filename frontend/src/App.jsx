
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Products from './pages/Products';
import Locations from './pages/Locations';
import Movements from './pages/Movements';
import Report from './pages/Report';

import Navbar from './components/Navbar';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/products" element={<Products />} />
        <Route path="/locations" element={<Locations />} />
        <Route path="/movements" element={<Movements />} />
        <Route path="/report" element={<Report />} />
        <Route path="*" element={<Navigate to="/products" />} />
      </Routes>
    </>
  );
}
