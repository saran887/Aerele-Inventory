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
    <div className="max-w-5xl mx-auto p-4">
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-xl p-8 mb-8 border border-blue-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-3xl font-extrabold text-blue-800 mb-4 md:mb-0 tracking-tight">Products</h1>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold shadow transition-all duration-150" onClick={() => { setEditing(null); setShowForm(true); }}>+ Add Product</button>
        </div>
        <div className="mb-4 flex flex-wrap gap-4">
          <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-semibold shadow text-center">
            <div className="text-xs">Total Products</div>
            <div className="text-lg">{products.length}</div>
          </div>
          <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-semibold shadow text-center">
            <div className="text-xs">Total Stock</div>
            <div className="text-lg">{products.reduce((sum, p) => sum + (p.total_quantity || 0), 0)}</div>
          </div>
        </div>
        {showForm && <ProductForm product={editing} onClose={() => { setShowForm(false); fetchProducts(); fetchBalances(); }} />}
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div>
          <table className="table-auto border-collapse w-full shadow rounded-xl bg-white">
            <thead className="bg-blue-100">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2">Total Qty</th>
                <th className="px-4 py-2 w-48">Per Location</th>
                <th className="px-4 py-2 w-48"></th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.product_id} className="hover:bg-blue-50 transition-colors">
                  <td className="border px-4 py-2 font-mono text-sm">{p.product_id}</td>
                  <td className="border px-4 py-2 font-semibold">{p.name}</td>
                  <td className="border px-4 py-2 whitespace-pre-line break-words max-w-xs">{p.description}</td>
                  <td className="border px-4 py-2 text-center font-bold">{p.total_quantity}</td>
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
                  <td className="border px-4 py-2 space-x-2 text-right w-40">
                    <button className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded shadow font-bold transition-all" onClick={() => handleEdit(p)}>Edit</button>
                    <button className="bg-rose-500 hover:bg-rose-700 text-white px-3 py-1 rounded shadow font-bold transition-all" onClick={() => handleDelete(p.product_id)}>Delete</button>
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
