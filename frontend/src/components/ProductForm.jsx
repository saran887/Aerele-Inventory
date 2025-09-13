import React, { useState, useEffect } from 'react';
import api from '../api';

export default function ProductForm({ product, onClose }) {
  const [product_id, setProductId] = useState(product?.product_id || '');
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [totalQuantity, setTotalQuantity] = useState(product?.total_quantity || 0);
  const [locationId, setLocationId] = useState(product?.location_id || '');
  const [locations, setLocations] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/locations').then(res => setLocations(res.data));
  }, []);

  const isEdit = !!product;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isEdit) {
        await api.put(`/products/${product_id}`, { name, description, total_quantity: totalQuantity, location_id: locationId });
      } else {
        await api.post('/products', { product_id, name, description, total_quantity: totalQuantity, location_id: locationId });
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold mb-4 text-blue-700">{isEdit ? 'Edit' : 'Add'} Product</h2>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {!isEdit && (
          <div>
            <label className="block mb-1 font-semibold">Product ID</label>
            <input className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" value={product_id} onChange={e => setProductId(e.target.value)} required disabled={isEdit} />
          </div>
        )}
        <div>
          <label className="block mb-1 font-semibold">Name</label>
          <input className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Description</label>
          <input className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Total Quantity</label>
          <input type="number" min="0" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" value={totalQuantity} onChange={e => setTotalQuantity(Number(e.target.value))} required />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Location</label>
          <select className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" value={locationId} onChange={e => setLocationId(e.target.value)} required>
            <option value="">Select location</option>
            {locations.map(l => <option key={l.location_id} value={l.location_id}>{l.name}</option>)}
          </select>
        </div>
        <div className="flex space-x-2 justify-end">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow" type="submit">Save</button>
          <button className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold shadow" type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
