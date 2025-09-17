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
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center bg-gradient-to-r from-purple-200 to-purple-100 border border-purple-300 text-purple-800 px-6 py-3 rounded-2xl font-bold shadow-md text-lg min-w-[180px]">
              <svg className="w-6 h-6 mr-2 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5A2.25 2.25 0 015.25 5.25h13.5A2.25 2.25 0 0121 7.5v9a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 16.5v-9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 10.5h9" /></svg>
              Products: {totalProducts}
            </div>
            <div className="flex items-center bg-gradient-to-r from-blue-200 to-blue-100 border border-blue-300 text-blue-800 px-6 py-3 rounded-2xl font-bold shadow-md text-lg min-w-[180px]">
              <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21.75c-4.5-4.5-7.5-7.5-7.5-11.25A7.5 7.5 0 0112 3a7.5 7.5 0 017.5 7.5c0 3.75-3 6.75-7.5 11.25z" /><circle cx="12" cy="10.5" r="2.25" /></svg>
              Locations: {totalLocations}
            </div>
            <div className="flex items-center bg-gradient-to-r from-green-200 to-green-100 border border-green-300 text-green-800 px-6 py-3 rounded-2xl font-bold shadow-md text-lg min-w-[180px]">
              <svg className="w-6 h-6 mr-2 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 1.5" /><circle cx="12" cy="12" r="9" /></svg>
              Total Stock: {totalStock}
            </div>
          </div>
        </div>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <ReportTable rows={rows} />
      </div>
    </div>
  );
}
