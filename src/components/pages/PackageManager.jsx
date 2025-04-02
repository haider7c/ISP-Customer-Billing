import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/packages";

const PackageManager = () => {
  const [packages, setPackages] = useState([]);
  const [form, setForm] = useState({ name: "", speed: "", defaultAmount: "" });
  const [editingId, setEditingId] = useState(null);

  const fetchPackages = async () => {
    try {
      const res = await axios.get(API_URL);
      setPackages(res.data);
    } catch (err) {
      console.error("Failed to fetch packages:", err);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "defaultAmount" ? value.replace(/\D/g, "") : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, form);
      } else {
        await axios.post(API_URL, form);
      }
      setForm({ name: "", speed: "", defaultAmount: "" });
      setEditingId(null);
      fetchPackages();
    } catch (err) {
      console.error("Submit failed:", err);
    }
  };

  const handleEdit = (pkg) => {
    setForm({
      name: pkg.name || "",
      speed: pkg.speed || "",
      defaultAmount: pkg.defaultAmount?.toString() || "",
    });
    setEditingId(pkg._id);
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this package?");
    if (!confirm) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchPackages();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">📦 Package Manager</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          name="name"
          placeholder="Package Name (e.g. 6mb)"
          value={form.name}
          onChange={handleChange}
          required
          className="p-2 border rounded"
        />
        <input
          type="text"
          name="speed"
          placeholder="Speed (e.g. 6mb)"
          value={form.speed}
          onChange={handleChange}
          required
          className="p-2 border rounded"
        />
        <input
          type="text"
          name="defaultAmount"
          placeholder="Default Amount"
          value={form.defaultAmount}
          onChange={handleChange}
          required
          className="p-2 border rounded"
        />
        <div className="md:col-span-3">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {editingId ? "Update Package" : "Add Package"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setForm({ name: "", speed: "", defaultAmount: "" });
                setEditingId(null);
              }}
              className="ml-3 text-gray-600 underline"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Package</th>
            <th className="border p-2">Speed</th>
            <th className="border p-2">Default Amount</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {packages.map((pkg) => (
            <tr key={pkg._id} className="text-center">
              <td className="border p-2">{pkg.name}</td>
              <td className="border p-2">{pkg.speed}</td>
              <td className="border p-2">Rs {pkg.defaultAmount}</td>
              <td className="border p-2 space-x-2">
                <button
                  onClick={() => handleEdit(pkg)}
                  className="text-blue-600 underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(pkg._id)}
                  className="text-red-600 underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {packages.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center p-4">
                No packages found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PackageManager;
