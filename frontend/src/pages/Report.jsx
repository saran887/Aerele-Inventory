import React, { useEffect, useState } from 'react';
import api from '../api';
import ReportTable from '../components/ReportTable';

export default function Report() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/report').then(res => setRows(res.data)).catch(() => setError('Failed to load report'));
  }, []);

  // Calculate total products and total stock
  const totalProducts = new Set(rows.map(r => r.product_id)).size;
  const totalLocations = new Set(rows.map(r => r.location_id)).size;
  const totalStock = rows.reduce((sum, r) => sum + (r.qty || 0), 0);

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-xl p-8 mb-8 border border-blue-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-3xl font-extrabold text-blue-800 mb-4 md:mb-0 tracking-tight">Inventory Report</h1>
          <div className="flex space-x-4">
            <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-semibold shadow text-center">
              <div className="text-xs">Products</div>
              <div className="text-lg">{totalProducts}</div>
            </div>
            <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-semibold shadow text-center">
              <div className="text-xs">Locations</div>
              <div className="text-lg">{totalLocations}</div>
            </div>
            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-semibold shadow text-center">
              <div className="text-xs">Total Stock</div>
              <div className="text-lg">{totalStock}</div>
            </div>
          </div>
        </div>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <ReportTable rows={rows} />
      </div>
    </div>
  );
}
