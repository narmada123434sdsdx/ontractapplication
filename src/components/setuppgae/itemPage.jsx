import React, { useState, useEffect } from "react";
import "./css/itempage.css";   // ⬅️ New CSS file
import { apiGet, apiPost, apiPut, apiDelete } from "../../api";

const ItemPage = () => {
  const [formData, setFormData] = useState({
    ITEM_NAME: "",
    CATEGORY_ID: "",
    STATUS: "Active",
  });

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({
    ITEM_NAME: "",
    CATEGORY_ID: "",
    STATUS: "",
  });

  const cleanInput = (value) => value.replace(/[^A-Za-z0-9- ]/g, "");

  const fetchCategories = async () => {
    const data = await apiGet("/api/category");
    setCategories(Array.isArray(data) ? data : []);
  };

  const fetchItems = async () => {
    const data = await apiGet("/api/items");
    setItems(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const clean = name === "ITEM_NAME" ? cleanInput(value) : value;
    setFormData((prev) => ({ ...prev, [name]: clean }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    const clean = name === "ITEM_NAME" ? cleanInput(value) : value;
    setEditingData((prev) => ({ ...prev, [name]: clean }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await apiPost("/api/items", {
      item_name: formData.ITEM_NAME,
      category_id: formData.CATEGORY_ID,
      status: formData.STATUS,
    });

    setFormData({ ITEM_NAME: "", CATEGORY_ID: "", STATUS: "Active" });
    fetchItems();
    alert("Item added successfully!");
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditingData({
      ITEM_NAME: item.item_name,
      CATEGORY_ID: item.category_id,
      STATUS: item.status,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingData({ ITEM_NAME: "", CATEGORY_ID: "", STATUS: "" });
  };

  const handleUpdate = async (id) => {
    await apiPut(`/api/items/${id}`, {
      item_name: editingData.ITEM_NAME,
      category_id: editingData.CATEGORY_ID,
      status: editingData.STATUS,
    });

    setEditingId(null);
    alert("item page updated!");
    fetchItems();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    await apiDelete(`/api/items/${id}`);
    alert("item deleted!");
    fetchItems();
  };

  return (
    <div className="item-page">
      <div className="item-container">

        {/* ================= FORM BOX ================= */}
        <div className="item-box">
          <h2>Add New Item</h2>

          <form className="item-form" onSubmit={handleSubmit}>

            {/* Header */}
            <div className="item-header-row">
              <div>WORK CATEGORY</div>
              <div>WORK ITEM </div>
              <div>STATUS</div>
            </div>

            {/* Inputs */}
            <div className="item-input-row">

              {/* Category */}
              <div className="item-input-wrapper">
                <select
                  name="CATEGORY_ID"
                  value={formData.CATEGORY_ID}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.category_id}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>
                <span className="item-star">★</span>
              </div>

              {/* Item Name */}
              <div className="item-input-wrapper">
                <input
                  type="text"
                  name="ITEM_NAME"
                  value={formData.ITEM_NAME}
                  onChange={handleChange}
                  placeholder="Enter Item Name"
                  required
                />
                <span className="item-star">★</span>
              </div>

              {/* Status */}
              <div className="item-input-wrapper">
                <select
                  name="STATUS"
                  value={formData.STATUS}
                  onChange={handleChange}
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <span className="item-star">★</span>
              </div>

            </div>

            {/* Buttons */}
            <div className="item-actions">
              <button className="item-btn-primary" type="submit">Submit</button>
              <button
                className="item-btn-reset"
                type="button"
                onClick={() =>
                  setFormData({ ITEM_NAME: "", CATEGORY_ID: "", STATUS: "Active" })
                }
              >
                Reset
              </button>
            </div>

          </form>
        </div>

        {/* ================= TABLE BOX ================= */}
        <div className="type-box">
          <h2>Existing Items</h2>

          <div className="type-table-wrapper">
            <div className="fixed-table">
            <table className="item-table">
              <thead>
                <tr>
                  <th>Work Category</th>
                  <th>Work Item</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => {
                  const cat = categories.find(
                    (c) => c.category_id === item.category_id
                  );

                  return (
                    <tr key={item.id}>
                      {editingId === item.id ? (
                        <>
       <td>{cat?.category_name}</td>

                          <td>
                            <input
                              type="text"
                              name="ITEM_NAME"
                              value={editingData.ITEM_NAME}
                              onChange={handleEditChange}
                            />
                          </td>

                          <td>
                            <select
                              name="STATUS"
                              value={editingData.STATUS}
                              onChange={handleEditChange}
                            >
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                            </select>
                          </td>

                          <td>
                            <button className="item-btn-save" onClick={() => handleUpdate(item.id)}>Save</button>
                            <button className="item-btn-cancel" onClick={handleCancel}>Cancel</button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{cat?.category_name}</td>
                          <td>{item.item_name}</td>
                          <td>{item.status}</td>

                          <td>
                            <button className="item-btn-edit" onClick={() => handleEdit(item)}>Edit</button>
                            <button className="item-btn-delete" onClick={() => handleDelete(item.id)}>Delete</button>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>

            </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ItemPage;
