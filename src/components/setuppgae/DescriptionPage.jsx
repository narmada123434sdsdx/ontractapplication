import React, { useEffect, useState } from "react";
import "./css/description.css";
import { apiGet, apiPost, apiPut, apiDelete } from "../../api";

const DescriptionPage = () => {
  const [formData, setFormData] = useState({
    DESCRIPTION: "",
    CATEGORY_ID: "",
    ITEM_ID: "",
    TYPE_ID: "",
    STATUS: "Active",
  });

  const [descriptions, setDescriptions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [itemsAll, setItemsAll] = useState([]);
  const [typesAll, setTypesAll] = useState([]);
  const [items, setItems] = useState([]);
  const [types, setTypes] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({
    DESCRIPTION: "",
    CATEGORY_ID: "",
    ITEM_ID: "",
    TYPE_ID: "",
    STATUS: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const cat = await apiGet("/api/category");
    const desc = await apiGet("/api/description");
    const allItems = await apiGet("/api/items");
    const allTypes = await apiGet("/api/types");

    setCategories(cat || []);
    setDescriptions(desc || []);
    setItemsAll(allItems || []);
    setTypesAll(allTypes || []);
  };

  const fetchItemsForCategory = async (categoryId) => {
    if (!categoryId) return setItems([]);
    const data = await apiGet(`/api/items/${categoryId}`);
    setItems(data || []);
  };

  const fetchTypesForCategoryItem = async (categoryId, itemId) => {
    if (!categoryId || !itemId) return setTypes([]);
    const data = await apiGet(
      `/api/types/filter?category_id=${categoryId}&item_id=${itemId}`
    );
    setTypes(data || []);
  };

  useEffect(() => {
    formData.CATEGORY_ID
      ? fetchItemsForCategory(formData.CATEGORY_ID)
      : setItems([]);
  }, [formData.CATEGORY_ID]);

  useEffect(() => {
    formData.CATEGORY_ID && formData.ITEM_ID
      ? fetchTypesForCategoryItem(formData.CATEGORY_ID, formData.ITEM_ID)
      : setTypes([]);
  }, [formData.ITEM_ID, formData.CATEGORY_ID]);

  useEffect(() => {
    if (editingId && editingData.CATEGORY_ID)
      fetchItemsForCategory(editingData.CATEGORY_ID);
  }, [editingData.CATEGORY_ID, editingId]);

  useEffect(() => {
    if (editingId && editingData.CATEGORY_ID && editingData.ITEM_ID)
      fetchTypesForCategoryItem(
        editingData.CATEGORY_ID,
        editingData.ITEM_ID
      );
  }, [editingData.ITEM_ID, editingData.CATEGORY_ID, editingId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      let updated = { ...prev, [name]: value };
      if (name === "CATEGORY_ID") updated.ITEM_ID = updated.TYPE_ID = "";
      if (name === "ITEM_ID") updated.TYPE_ID = "";
      return updated;
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditingData((prev) => {
      let updated = { ...prev, [name]: value };
      if (name === "CATEGORY_ID") updated.ITEM_ID = updated.TYPE_ID = "";
      if (name === "ITEM_ID") updated.TYPE_ID = "";
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      description: formData.DESCRIPTION,
      category_id: formData.CATEGORY_ID,
      item_id: formData.ITEM_ID,
      type_id: formData.TYPE_ID,
      status: formData.STATUS,
    };

    const res = await apiPost("/api/description", payload);
    if (res?.error) return alert(res.error);

    setFormData({
      DESCRIPTION: "",
      CATEGORY_ID: "",
      ITEM_ID: "",
      TYPE_ID: "",
      STATUS: "Active",
    });

    setItems([]);
    setTypes([]);
    await loadData();
    alert("Description added successfully!");
  };

  const handleEdit = async (row) => {
    setEditingId(row.id);

    await fetchItemsForCategory(row.category_id);
    await fetchTypesForCategoryItem(row.category_id, row.item_id);

    setEditingData({
      DESCRIPTION: row.description_name,
      CATEGORY_ID: row.category_id,
      ITEM_ID: row.item_id,
      TYPE_ID: row.type_id,
      STATUS: row.status,
    });
  };

  const handleUpdate = async (id) => {
    const payload = {
      description: editingData.DESCRIPTION,
      category_id: editingData.CATEGORY_ID,
      item_id: editingData.ITEM_ID,
      type_id: editingData.TYPE_ID,
      status: editingData.STATUS,
    };

    await apiPut(`/api/description/${id}`, payload);
    setEditingId(null);
    setItems([]);
    setTypes([]);
    alert("description status updated!");
    await loadData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this description?")) return;
    await apiDelete(`/api/description/${id}`);
    alert("description deleted!");
    await loadData();
  };

  return (
    <div className="description-page">
      <div className="description-container">

        {/* =============== FORM BOX =============== */}
        <div className="desc-box">
          <h2>Add Description</h2>

          {/* ⭐ FORM WRAPPER ADDED */}
          <form className="form-create" onSubmit={handleSubmit}>

            {/* HEADER ROW 1 */}
            <div className="desc-header-row">
              <div className="desc-header-cell">WORK CATEGORY</div>
              <div className="desc-header-cell">WORK ITEM</div>
              <div className="desc-header-cell">WORK TYPE</div>
            </div>

            <div className="desc-row three">
              <div className="desc-input-wrapper">
                <select
                  name="CATEGORY_ID"
                  value={formData.CATEGORY_ID}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Work Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.category_id}>
                      {c.category_name}
                    </option>
                  ))}
                </select>
                <span className="desc-star">★</span>
              </div>

              <div className="desc-input-wrapper">
                <select
                  name="ITEM_ID"
                  value={formData.ITEM_ID}
                  onChange={handleChange}
                  disabled={!formData.CATEGORY_ID}
                  required
                >
                  <option value="">Select Work Item</option>
                  {items.map((it) => (
                    <option key={it.id} value={it.item_id}>
                      {it.item_name}
                    </option>
                  ))}
                </select>
                <span className="desc-star">★</span>
              </div>

              <div className="desc-input-wrapper">
                <select
                  name="TYPE_ID"
                  value={formData.TYPE_ID}
                  onChange={handleChange}
                  disabled={!formData.ITEM_ID}
                  required
                >
                  <option value="">Select Work Type</option>
                  {types.map((t) => (
                    <option key={t.id} value={t.type_id}>
                      {t.type_name}
                    </option>
                  ))}
                </select>
                <span className="desc-star">★</span>
              </div>
            </div>

            {/* HEADER ROW 2 */}
            <div className="desc-header-row two-col">
              <div className="desc-header-cell"> Work DESCRIPTION</div>
              <div className="desc-header-cell"> STATUS</div>
            </div>

            <div className="desc-row two">
              <div className="desc-input-wrapper">
                <textarea
                  name="DESCRIPTION"
                  value={formData.DESCRIPTION}
                  onChange={handleChange}
                  required
                  placeholder="Enter description"
                />
                <span className="desc-star">★</span>
              </div>

              <div className="desc-input-wrapper">
                <select
                  name="STATUS"
                  value={formData.STATUS}
                  onChange={handleChange}
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <span className="desc-star">★</span>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="desc-actions">
              <button type="submit" className="desc-btn-primary">
                Submit
              </button>

              <button
                type="button"
                className="desc-btn-reset"
                onClick={() =>
                  setFormData({
                    DESCRIPTION: "",
                    CATEGORY_ID: "",
                    ITEM_ID: "",
                    TYPE_ID: "",
                    STATUS: "Active",
                  })
                }
              >
                Reset
              </button>
            </div>

          </form>
        </div>

        {/* =============== TABLE BOX =============== */}
        <div className="type-box">
          <h2>Existing Descriptions</h2>

          <div className="type-table-wrapper">
            <div className="fixed-table">
            <table className="desc-table">
              <thead>
                <tr>
                  <th>Work Category</th>
                  <th>Work Item</th>
                  <th>Work Type</th>
                  <th>Work Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {descriptions.map((row) => {
                  const cat = categories.find(
                    (c) => c.category_id === row.category_id
                  );
                  const item = itemsAll.find(
                    (i) => i.item_id === row.item_id
                  );
                  const type = typesAll.find(
                    (t) => t.type_id === row.type_id
                  );

                  return (
                    <tr key={row.id}>
                      {editingId === row.id ? (
                        <>
                              <td>{cat?.category_name}</td>
    <td>{item?.item_name}</td>
    <td>{type?.type_name}</td>                          <td>
                            <textarea
                              name="DESCRIPTION"
                              value={editingData.DESCRIPTION}
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
                              className="desc-btn-save"
                              onClick={() => handleUpdate(row.id)}
                            >
                              Save
                            </button>

                            <button
                              className="desc-btn-cancel"
                              onClick={() => {
                                setEditingId(null);
                                setItems([]);
                                setTypes([]);
                              }}
                            >
                              Cancel
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{cat?.category_name}</td>
                          <td>{item?.item_name}</td>
                          <td>{type?.type_name}</td>
                          <td>{row.description_name}</td>
                          <td>{row.status}</td>

                          <td>
                            <button
                              className="desc-btn-edit"
                              onClick={() => handleEdit(row)}
                            >
                              Edit
                            </button>
                            <button
                              className="desc-btn-delete"
                              onClick={() => handleDelete(row.id)}
                            >
                              Delete
                            </button>
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

export default DescriptionPage;
