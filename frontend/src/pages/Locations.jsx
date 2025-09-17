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
    <div className="max-w-5xl mx-auto p-4">
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-xl p-8 mb-8 border border-blue-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-3xl font-extrabold text-blue-800 mb-4 md:mb-0 tracking-tight">Locations</h1>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold shadow transition-all duration-150" onClick={() => { setEditing(null); setShowForm(true); }}>+ Add Location</button>
        </div>
        <div className="mb-4 flex flex-wrap gap-4">
          <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-semibold shadow text-center">
            <div className="text-xs">Total Locations</div>
            <div className="text-lg">{locations.length}</div>
          </div>
        </div>
        {showForm && <LocationForm location={editing} onClose={() => { setShowForm(false); fetchLocations(); }} />}
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div>
          <table className="table-auto border-collapse w-full shadow rounded-xl bg-white">
            <thead className="bg-blue-100">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Address</th>
                <th className="px-4 py-2 w-40"></th>
              </tr>
            </thead>
            <tbody>
              {locations.map(l => (
                <tr key={l.location_id} className="hover:bg-blue-50 transition-colors">
                  <td className="border px-4 py-2 font-mono text-sm">{l.location_id}</td>
                  <td className="border px-4 py-2 font-semibold">{l.name}</td>
                  <td className="border px-4 py-2 whitespace-pre-line break-words max-w-xs">{l.address}</td>
                  <td className="border px-4 py-2 space-x-2 text-right w-40">
                    <button className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded shadow font-bold transition-all" onClick={() => handleEdit(l)}>Edit</button>
                    <button className="bg-rose-500 hover:bg-rose-700 text-white px-3 py-1 rounded shadow font-bold transition-all" onClick={() => handleDelete(l.location_id)}>Delete</button>
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
