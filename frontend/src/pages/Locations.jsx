import React, { useEffect, useState } from 'react';
import api from '../api';
import LocationForm from '../components/LocationForm';

export default function Locations() {
  const [locations, setLocations] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const fetchLocations = async () => {
    try {
      const res = await api.get('/locations');
      setLocations(res.data);
    } catch (err) {
      setError('Failed to load locations');
    }
  };

  useEffect(() => { fetchLocations(); }, []);

  const handleEdit = (location) => {
    setEditing(location);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this location?')) return;
    await api.delete(`/locations/${id}`);
    fetchLocations();
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold mb-4 text-blue-700">Locations</h1>
        <button className="mb-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow" onClick={() => { setEditing(null); setShowForm(true); }}>Add Location</button>
        {showForm && <LocationForm location={editing} onClose={() => { setShowForm(false); fetchLocations(); }} />}
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div className="overflow-x-auto">
          <table className="table-auto border-collapse w-full shadow-md rounded-xl bg-white">
            <thead className="bg-blue-100">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Address</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {locations.map(l => (
                <tr key={l.location_id} className="hover:bg-blue-50">
                  <td className="border px-4 py-2">{l.location_id}</td>
                  <td className="border px-4 py-2">{l.name}</td>
                  <td className="border px-4 py-2">{l.address}</td>
                  <td className="border px-4 py-2 space-x-2 text-right">
                    <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded shadow" onClick={() => handleEdit(l)}>Edit</button>
                    <button className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded shadow" onClick={() => handleDelete(l.location_id)}>Delete</button>
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
