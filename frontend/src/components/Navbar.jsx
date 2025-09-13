import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const navLinks = [
  { to: '/products', label: 'Products' },
  { to: '/locations', label: 'Locations' },
  { to: '/movements', label: 'Movements' },
  { to: '/report', label: 'Report' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!token) return null;

  return (
    <nav className="bg-gradient-to-r from-blue-700 to-blue-500 text-white px-6 py-3 flex flex-col sm:flex-row items-center justify-between mb-8 shadow-lg rounded-b-xl">
      <div className="flex items-center space-x-3 mb-2 sm:mb-0">
        <span className="font-extrabold text-2xl tracking-tight text-white">📦 Inventory</span>
      </div>
      <div className="flex space-x-4 mb-2 sm:mb-0">
        {navLinks.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors duration-200 ${location.pathname === link.to ? 'bg-white text-blue-700 shadow' : 'hover:bg-blue-800 hover:text-white'}`}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-1 rounded-lg font-semibold shadow">Logout</button>
    </nav>
  );
}
