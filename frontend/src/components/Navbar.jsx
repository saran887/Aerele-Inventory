import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navLinks = [
  { to: '/products', label: 'Products' },
  { to: '/locations', label: 'Locations' },
  { to: '/movements', label: 'Movements' },
  { to: '/report', label: 'Report' },
];

export default function Navbar() {
  const location = useLocation();
  return (
    <nav className="bg-white shadow-lg border-b border-blue-200 px-4 py-0.5 mb-8 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between py-2">
        <div className="flex items-center space-x-3 mb-2 sm:mb-0">
          <span className="font-extrabold text-2xl tracking-tight text-blue-700 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mr-2 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7.5V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6v1.5M3 7.5h18M3 7.5v10.5A2.25 2.25 0 005.25 20.25h13.5A2.25 2.25 0 0021 18V7.5M3 7.5l9 6.75 9-6.75" /></svg>
            Inventory System
          </span>
        </div>
        <div className="flex flex-wrap gap-2 mb-2 sm:mb-0">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center px-4 py-2 rounded-lg font-semibold transition-colors duration-200 text-base ${location.pathname === link.to ? 'bg-blue-600 text-white shadow' : 'text-blue-700 hover:bg-blue-100 hover:text-blue-900'}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="hidden sm:block text-xs text-blue-500 font-light ml-4">
          <span>Modern Inventory Management &mdash; React + Flask + Tailwind</span>
        </div>
      </div>
    </nav>
  );
}
