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

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this movement?')) return;
    await api.delete(`/movements/${id}`);
    fetchMovements();
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold mb-4 text-blue-700">Product Movements</h1>
        <button className="mb-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow" onClick={() => { setEditing(null); setShowForm(true); }}>Add Movement</button>
        {showForm && <MovementForm movement={editing} onClose={() => { setShowForm(false); fetchMovements(); }} />}
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div className="overflow-x-auto">
          <table className="table-auto border-collapse w-full shadow-md rounded-xl bg-white">
            <thead className="bg-blue-100">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Timestamp</th>
                <th className="px-4 py-2">Product</th>
                <th className="px-4 py-2">From</th>
                <th className="px-4 py-2">To</th>
                <th className="px-4 py-2">Qty</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {movements.map(m => (
                <tr key={m.movement_id} className="hover:bg-blue-50">
                  <td className="border px-4 py-2">{m.movement_id}</td>
                  <td className="border px-4 py-2">{m.timestamp?.slice(0, 19).replace('T', ' ')}</td>
                  <td className="border px-4 py-2">{m.product_id}</td>
                  <td className="border px-4 py-2">{m.from_location || '-'}</td>
                  <td className="border px-4 py-2">{m.to_location || '-'}</td>
                  <td className="border px-4 py-2 text-center">{m.qty}</td>
                  <td className="border px-4 py-2 text-right">
                    <button className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded shadow" onClick={() => handleDelete(m.movement_id)}>Delete</button>
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
