import React, { useState } from 'react';
import api from '../api';

export default function LocationForm({ location, onClose }) {
  const [location_id, setLocationId] = useState(location?.location_id || '');
  const [name, setName] = useState(location?.name || '');
  const [address, setAddress] = useState(location?.address || '');
  const [error, setError] = useState('');

  const isEdit = !!location;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isEdit) {
        await api.put(`/locations/${location_id}`, { name, address });
      } else {
        await api.post('/locations', { location_id, name, address });
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-96 space-y-4">
        <h2 className="text-xl font-bold mb-2">{isEdit ? 'Edit' : 'Add'} Location</h2>
        {error && <div className="text-red-500">{error}</div>}
        {!isEdit && (
          <div>
            <label className="block mb-1">Location ID</label>
            <input className="w-full border rounded px-3 py-2" value={location_id} onChange={e => setLocationId(e.target.value)} required disabled={isEdit} />
          </div>
        )}
        <div>
          <label className="block mb-1">Name</label>
          <input className="w-full border rounded px-3 py-2" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1">Address</label>
          <input className="w-full border rounded px-3 py-2" value={address} onChange={e => setAddress(e.target.value)} />
        </div>
        <div className="flex space-x-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">Save</button>
          <button className="bg-gray-400 text-white px-4 py-2 rounded" type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
