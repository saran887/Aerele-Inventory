import React, { useEffect, useState } from 'react';
import api from '../api';
import ProductForm from '../components/ProductForm';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [locations, setLocations] = useState([]);
  const [balances, setBalances] = useState([]);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      setError('Failed to load products');
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await api.get('/locations');
      setLocations(res.data);
    } catch (err) {
      setLocations([]);
    }
  };

  const fetchBalances = async () => {
    try {
      const res = await api.get('/report');
      setBalances(res.data);
    } catch (err) {
      setBalances([]);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchLocations();
    fetchBalances();
  }, []);

  const handleEdit = (product) => {
    setEditing(product);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    fetchProducts();
    fetchBalances();
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold mb-4 text-blue-700">Products</h1>
        <button className="mb-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow" onClick={() => { setEditing(null); setShowForm(true); }}>Add Product</button>
        {showForm && <ProductForm product={editing} onClose={() => { setShowForm(false); fetchProducts(); fetchBalances(); }} />}
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div className="overflow-x-auto">
          <table className="table-auto border-collapse w-full shadow-md rounded-xl bg-white">
            <thead className="bg-blue-100">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2">Total Qty</th>
                <th className="px-4 py-2">Remaining Qty</th>
                <th className="px-4 py-2">Per Location</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.product_id} className="hover:bg-blue-50">
                  <td className="border px-4 py-2">{p.product_id}</td>
                  <td className="border px-4 py-2">{p.name}</td>
                  <td className="border px-4 py-2">{p.description}</td>
                  <td className="border px-4 py-2 text-center">{p.total_quantity}</td>
                  <td className="border px-4 py-2 text-center">{p.remaining_quantity}</td>
                  <td className="border px-4 py-2 text-center">
                    <div className="flex flex-col gap-1 items-center">
                      {balances.filter(b => b.product_id === p.product_id && b.qty !== 0).length === 0 && <span className="text-gray-400 text-xs">No stock in any location</span>}
                      {balances.filter(b => b.product_id === p.product_id && b.qty !== 0).map(b => (
                        <span key={b.location_id} className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">
                          {b.location_name || b.location_id}: {b.qty}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="border px-4 py-2 space-x-2 text-right">
                    <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded shadow" onClick={() => handleEdit(p)}>Edit</button>
                    <button className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded shadow" onClick={() => handleDelete(p.product_id)}>Delete</button>
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
