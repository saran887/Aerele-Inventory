import React, { useEffect, useState } from 'react';
import api from '../api';
import MovementForm from '../components/MovementForm';

export default function Movements() {
  const [movements, setMovements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const fetchMovements = async () => {
    try {
      const res = await api.get('/movements');
      setMovements(res.data);
    } catch (err) {
      setError('Failed to load movements');
    }
  };

  useEffect(() => { fetchMovements(); }, []);

  const handleEdit = (movement) => {
    setEditing(movement);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this movement?')) return;
    await api.delete(`/movements/${id}`);
    fetchMovements();
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-xl p-8 mb-8 border border-blue-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-3xl font-extrabold text-blue-800 mb-4 md:mb-0 tracking-tight">Product Movements</h1>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold shadow transition-all duration-150" onClick={() => { setEditing(null); setShowForm(true); }}>+ Add Movement</button>
        </div>
        {/* Modern summary card for total movements */}
        <div className="mb-4 flex flex-wrap gap-4">
          <div className="flex items-center bg-gradient-to-r from-pink-200 to-pink-100 border border-pink-300 text-pink-800 px-6 py-3 rounded-2xl font-bold shadow-md text-lg min-w-[180px]">
            <svg className="w-6 h-6 mr-2 text-pink-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /><circle cx="12" cy="12" r="9" /></svg>
            Total Movements: {movements.length}
          </div>
        </div>
        {showForm && <MovementForm movement={editing} onClose={() => { setShowForm(false); fetchMovements(); }} />}
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div>
          <table className="table-auto border-collapse w-full shadow rounded-xl bg-white">
            <thead className="bg-blue-100">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Timestamp</th>
                <th className="px-4 py-2">Product</th>
                <th className="px-4 py-2">From</th>
                <th className="px-4 py-2">To</th>
                <th className="px-4 py-2">Qty</th>
                <th className="px-4 py-2 w-48"></th>
              </tr>
            </thead>
            <tbody>
              {movements.map(m => (
                <tr key={m.movement_id} className="hover:bg-blue-50 transition-colors">
                  <td className="border px-4 py-2 font-mono text-sm">{m.movement_id}</td>
                  <td className="border px-4 py-2">{m.timestamp?.slice(0, 19).replace('T', ' ')}</td>
                  <td className="border px-4 py-2">{m.product_id}</td>
                  <td className="border px-4 py-2">{m.from_location || '-'}</td>
                  <td className="border px-4 py-2">{m.to_location || '-'}</td>
                  <td className="border px-4 py-2 text-center font-bold">{m.qty}</td>
                  <td className="border px-4 py-2 text-right w-40 space-x-2">
                    {!(m.movement_id && m.movement_id.startsWith('INIT-')) && (
                      <button className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded shadow font-bold transition-all" onClick={() => handleEdit(m)}>Edit</button>
                    )}
                    <button className="bg-rose-500 hover:bg-rose-700 text-white px-3 py-1 rounded shadow font-bold transition-all" onClick={() => handleDelete(m.movement_id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
