import React, { useState, useEffect } from "react";
import "./css/typepage.css";
import { apiGet, apiPost, apiPut, apiDelete } from "../../api";

const TypePage = () => {
  const [formData, setFormData] = useState({
    TYPE_NAME: "",
    CATEGORY_ID: "",
    ITEM_ID: "",
    STATUS: "Active",
  });

  const [types, setTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({
    TYPE_NAME: "",
    CATEGORY_ID: "",
    ITEM_ID: "",
    STATUS: "",
  });

  const cleanInput = (v) => v.replace(/[^A-Za-z0-9-. ]/g, "");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setCategories(await apiGet("/api/category"));
    setTypes(await apiGet("/api/types"));
    setAllItems(await apiGet("/api/items"));
  };

  useEffect(() => {
    if (formData.CATEGORY_ID) loadFiltered(formData.CATEGORY_ID);
    else setFilteredItems([]);
  }, [formData.CATEGORY_ID]);

  const loadFiltered = async (categoryId) => {
    setFilteredItems(await apiGet(`/api/items/${categoryId}`));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const cleaned =
      name === "TYPE_NAME"
        ? cleanInput(value)
        : ["CATEGORY_ID", "ITEM_ID"].includes(name)
        ? Number(value)
        : value;

    setFormData((prev) => ({
      ...prev,
      [name]: cleaned,
      ...(name === "CATEGORY_ID" ? { ITEM_ID: "" } : {}),
    }));
  };

  useEffect(() => {
    if (editingId && editingData.CATEGORY_ID)
      loadFiltered(editingData.CATEGORY_ID);
  }, [editingData.CATEGORY_ID]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    const cleaned =
      name === "TYPE_NAME"
        ? cleanInput(value)
        : ["CATEGORY_ID", "ITEM_ID"].includes(name)
        ? Number(value)
        : value;

    setEditingData((prev) => ({
      ...prev,
      [name]: cleaned,
      ...(name === "CATEGORY_ID" ? { ITEM_ID: "" } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await apiPost("/api/types", {
      type_name: formData.TYPE_NAME,
      category_id: formData.CATEGORY_ID,
      item_id: formData.ITEM_ID,
      status: formData.STATUS,
    });

    setFormData({
      TYPE_NAME: "",
      CATEGORY_ID: "",
      ITEM_ID: "",
      STATUS: "Active",
    });

    setFilteredItems([]);
    loadData();
  };

  const handleEdit = async (row) => {
    setEditingId(row.id);
    setFilteredItems(await apiGet(`/api/items/${row.category_id}`));

    setEditingData({
      TYPE_NAME: row.type_name,
      CATEGORY_ID: Number(row.category_id),
      ITEM_ID: Number(row.item_id),
      STATUS: row.status,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingData({
      TYPE_NAME: "",
      CATEGORY_ID: "",
      ITEM_ID: "",
      STATUS: "",
    });
    setFilteredItems([]);
  };

  const handleUpdate = async (id) => {
    await apiPut(`/api/types/${id}`, {
      type_name: editingData.TYPE_NAME,
      category_id: editingData.CATEGORY_ID,
      item_id: editingData.ITEM_ID,
      status: editingData.STATUS,
    });
    alert("Type status updated");
    setEditingId(null);
    loadData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete?")) return;
    await apiDelete(`/api/types/${id}`);
    alert("Type Deleted");
    loadData();
  };

  return (
    <div className="type-page">
      <div className="type-container">

        {/* FORM BOX */}
        <div className="type-box">
          <h2>Add New Type</h2>

          <form className="type-form" onSubmit={handleSubmit}>

            <div className="type-header-row">
              <div>WORK CATEGORY</div>
              <div>WORK ITEM</div>
            </div>

            <div className="type-input-row">

              <div className="star-wrapper">
                <select
                  name="CATEGORY_ID"
                  value={formData.CATEGORY_ID}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.category_id}>
                      {c.category_name}
                    </option>
                  ))}
                </select>
                <span className="star">★</span>
              </div>

              <div className="star-wrapper">
                <select
                  name="ITEM_ID"
                  value={formData.ITEM_ID}
                  onChange={handleChange}
                  required
                  disabled={!formData.CATEGORY_ID}
                >
                  <option value="">Select Item</option>
                  {filteredItems.map((it) => (
                    <option key={it.id} value={it.item_id}>
                      {it.item_name}
                    </option>
                  ))}
                </select>
                <span className="star">★</span>
              </div>

            </div>

            <div className="type-header-row">
              <div>WORK TYPE</div>
              <div>STATUS</div>
            </div>

            <div className="type-input-row">

              <div className="star-wrapper">
                <input
                  type="text"
                  name="TYPE_NAME"
                  value={formData.TYPE_NAME}
                  onChange={handleChange}
                  required
                />
                <span className="star">★</span>
              </div>

              <div className="star-wrapper">
                <select
                  name="STATUS"
                  value={formData.STATUS}
                  onChange={handleChange}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <span className="star">★</span>
              </div>

            </div>

            <div className="type-actions">
              <button className="type-btn-primary">Submit</button>
              <button
                type="button"
                className="type-btn-reset"
                onClick={() =>
                  setFormData({
                    TYPE_NAME: "",
                    CATEGORY_ID: "",
                    ITEM_ID: "",
                    STATUS: "Active",
                  })
                }
              >
                Reset
              </button>
            </div>

          </form>
        </div>

        {/* TABLE BOX */}
        <div className="type-box">
          <h2>Existing Types</h2>

          <div className="type-table-wrapper">
            <div className="fixed-table">
              <table className="type-table">
                <thead>
                  <tr>
                    <th>Work Category</th>
                    <th>Work Item</th>
                    <th>Work Type</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {types.map((row) => {
                    const cat = categories.find(
                      (c) => c.category_id === row.category_id
                    );
                    const it = allItems.find(
                      (i) => i.item_id === row.item_id
                    );

                    if (editingId === row.id) {
                      return (
                        <tr key={row.id}>
                        <td>{cat?.category_name}</td>
                        <td>{it?.item_name}</td>

                          <td>
                            <input
                              type="text"
                              name="TYPE_NAME"
                              value={editingData.TYPE_NAME}
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
                            <button
                              className="type-btn-save"
                              onClick={() => handleUpdate(row.id)}
                            >
                              Save
                            </button>
                            <button
                              className="type-btn-cancel"
                              onClick={handleCancel}
                            >
                              Cancel
                            </button>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={row.id}>
                        <td>{cat?.category_name}</td>
                        <td>{it?.item_name}</td>
                        <td>{row.type_name}</td>
                        <td>{row.status}</td>

                        <td>
                          <button
                            className="type-btn-edit"
                            onClick={() => handleEdit(row)}
                          >
                            Edit
                          </button>
                          <button
                            className="type-btn-delete"
                            onClick={() => handleDelete(row.id)}
                          >
                            Delete
                          </button>
                        </td>
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

export default TypePage;