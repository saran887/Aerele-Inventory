import React from 'react';

export default function ReportTable({ rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="table-auto border-collapse w-full shadow rounded-xl bg-white">
        <thead className="bg-blue-100">
          <tr>
            <th className="px-4 py-2">Product</th>
            <th className="px-4 py-2">Location</th>
            <th className="px-4 py-2">Qty</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-blue-50">
              <td className="border px-4 py-2">{r.product_name || r.product_id}</td>
              <td className="border px-4 py-2">{r.location_name || r.location_id}</td>
              <td className={`border px-4 py-2 text-center font-bold ${r.qty <= 0 ? 'text-red-600' : 'text-green-700'}`}>{r.qty}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
