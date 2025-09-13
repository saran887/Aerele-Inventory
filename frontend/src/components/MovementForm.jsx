import React, { useEffect, useState } from 'react';
import api from '../api';

export default function MovementForm({ movement, onClose }) {
  const [product_id, setProductId] = useState(movement?.product_id || '');
  const [from_location, setFromLocation] = useState(movement?.from_location || '');
  const [to_location, setToLocation] = useState(movement?.to_location || '');
  const [qty, setQty] = useState(movement?.qty || '');
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/products').then(res => setProducts(res.data));
    api.get('/locations').then(res => setLocations(res.data));
  }, []);

  const isEdit = !!movement;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isEdit) {
        // Not implemented: edit movement
      } else {
        await api.post('/movements', {
          product_id,
          from_location: from_location || null,
          to_location: to_location || null,
          qty: Number(qty),
        });
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-96 space-y-4">
        <h2 className="text-xl font-bold mb-2">Add Movement</h2>
        {error && <div className="text-red-500">{error}</div>}
        {/* Movement ID field removed for add. Backend allocates automatically. */}
        <div>
          <label className="block mb-1">Product</label>
          <select className="w-full border rounded px-3 py-2" value={product_id} onChange={e => setProductId(e.target.value)} required>
            <option value="">Select product</option>
            {products.map(p => <option key={p.product_id} value={p.product_id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block mb-1">From Location</label>
          <select className="w-full border rounded px-3 py-2" value={from_location} onChange={e => setFromLocation(e.target.value)}>
            <option value="">None</option>
            {locations.map(l => <option key={l.location_id} value={l.location_id}>{l.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block mb-1">To Location</label>
          <select className="w-full border rounded px-3 py-2" value={to_location} onChange={e => setToLocation(e.target.value)}>
            <option value="">None</option>
            {locations.map(l => <option key={l.location_id} value={l.location_id}>{l.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block mb-1">Quantity</label>
          <input type="number" min="1" className="w-full border rounded px-3 py-2" value={qty} onChange={e => setQty(e.target.value)} required />
        </div>
        <div className="flex space-x-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">Save</button>
          <button className="bg-gray-400 text-white px-4 py-2 rounded" type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
