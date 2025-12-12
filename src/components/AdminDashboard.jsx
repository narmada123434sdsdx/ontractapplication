// components/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost, apiPut, apiDelete, BASE_URL } from "../api";
// import "./css/AdminDashboard.css"; // optional: uncomment if you have styles

/**
 * AdminDashboard
 *
 * - Uses the unified BASE_URL (single backend) and api wrapper (apiGet/apiPost/etc).
 * - Fetches providers & contractors, approve/reject, send messages.
 * - Shows services modal and send-message modal.
 * - Robust error handling for ngrok / backend HTML responses (handled by api wrapper).
 *
 * Keep the UI and behavior identical to your previous version.
 */

function AdminDashboard({ admin, setAdmin }) {
  const [providers, setProviders] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null); // { email, type }
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [servicesModalUser, setServicesModalUser] = useState(null);
  const [sending, setSending] = useState(false);

  const navigate = useNavigate();

  // On mount: ensure admin exists and load data
  useEffect(() => {
    try {
      const storedAdmin = localStorage.getItem("admin");
      if (!storedAdmin || storedAdmin === "undefined") {
        navigate("/admin/login");
        return;
      }
      const adminData = JSON.parse(storedAdmin);
      setAdmin(adminData);
      // load providers and contractors
      fetchProviders();
      fetchContractors();
    } catch (err) {
      console.error("Admin restore error:", err);
      localStorage.removeItem("admin");
      navigate("/admin/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // ---------------- PROVIDERS ----------------
  const fetchProviders = async () => {
    setLoading(true);
    setError("");
    try {
      // using the unified BASE_URL path via apiGet
      // apiGet expects relative path like "/api/admin/providers"
      const data = await apiGet("/api/admin/providers");
      // Expecting data to be an array. Normalize:
      if (Array.isArray(data)) {
        setProviders(data);
      } else if (data && Array.isArray(data.results)) {
        setProviders(data.results);
      } else {
        // If backend returns object with providers property:
        setProviders(data.providers || []);
      }
    } catch (err) {
      console.error("Error fetching providers:", err);
      setError("Error fetching providers");
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProvider = async (email) => {
    if (!window.confirm("Approve this provider?")) return;
    try {
      await apiPost("/api/admin/approve_provider", { email });
      // refresh
      await fetchProviders();
      alert("Provider approved");
    } catch (err) {
      console.error("Approve provider failed:", err);
      alert(err.message || "Error approving provider");
    }
  };

  const handleRejectProvider = async (email) => {
    if (!window.confirm("Reject this provider?")) return;
    try {
      await apiPost("/api/admin/reject_provider", { email });
      await fetchProviders();
      alert("Provider rejected");
    } catch (err) {
      console.error("Reject provider failed:", err);
      alert(err.message || "Error rejecting provider");
    }
  };

  // ---------------- CONTRACTORS ----------------
  const fetchContractors = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet("/api/admin/contractors");
      if (Array.isArray(data)) {
        setContractors(data);
      } else if (data && Array.isArray(data.results)) {
        setContractors(data.results);
      } else {
        setContractors(data.contractors || []);
      }
    } catch (err) {
      console.error("Error fetching contractors:", err);
      setError("Error fetching contractors");
      setContractors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveContractor = async (email) => {
    if (!window.confirm("Approve this contractor?")) return;
    try {
      await apiPost("/api/admin/approve_contractor", { email });
      await fetchContractors();
      alert("Contractor approved");
    } catch (err) {
      console.error("Approve contractor failed:", err);
      alert(err.message || "Error approving contractor");
    }
  };

  const handleRejectContractor = async (email) => {
    if (!window.confirm("Reject this contractor?")) return;
    try {
      await apiPost("/api/admin/reject_contractor", { email });
      await fetchContractors();
      alert("Contractor rejected");
    } catch (err) {
      console.error("Reject contractor failed:", err);
      alert(err.message || "Error rejecting contractor");
    }
  };

  // ---------------- COMMON: send message ----------------
  const handleSendMessage = async (email, type) => {
    if (!message || !message.trim()) {
      alert("Message cannot be empty");
      return;
    }
    setSending(true);
    try {
      const route =
        type === "provider" ? "/api/admin/send_message" : "/api/admin/send_message_contractor";

      await apiPost(route, { email, message });
      setMessage("");
      setSelectedUser(null);
      alert("Message sent successfully");
    } catch (err) {
      console.error("Send message error:", err);
      alert(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const openServicesModal = (user) => {
    // normalize services to an array for display
    // your backend sometimes returns object keyed by service id - convert to array
    const normalizedUser = { ...user };
    if (normalizedUser.services && !Array.isArray(normalizedUser.services)) {
      // convert from object map to array
      try {
        normalizedUser.services = Object.keys(normalizedUser.services).map((k) => normalizedUser.services[k]);
      } catch {
        normalizedUser.services = [];
      }
    }
    setServicesModalUser(normalizedUser);
  };
  const closeServicesModal = () => setServicesModalUser(null);

  // ---------------- Render / UI ----------------
  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="alert alert-danger text-center mt-5">{error}</div>;

  return (
    <div className="admin-dashboard container mt-4">
      {/* ---------------- PROVIDER SECTION ---------------- */}
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h5>Individual Management</h5>
        </div>
        <div className="card-body table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Services</th>
                <th>Status</th>
                <th>Actions</th>
                <th>Certificates</th>
              </tr>
            </thead>
            <tbody>
              {providers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    No providers found
                  </td>
                </tr>
              ) : (
                providers.map((p) => (
                  <tr key={p.provider_id || p.email_id || p.id || Math.random()}>
                    <td>{p.name || p.full_name || "N/A"}</td>
                    <td>{p.email_id || p.email || "N/A"}</td>
                    <td>{p.contact_number || p.phone || "N/A"}</td>
                    <td>
                      {p.services && Object.keys(p.services).length > 0 ? (
                        <button
                          className="btn btn-link btn-sm p-0"
                          onClick={() => openServicesModal(p)}
                        >
                          View ({Object.keys(p.services).length})
                        </button>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          p.status === "approved" ? "bg-success" : p.status === "pending" ? "bg-warning" : "bg-danger"
                        }`}
                      >
                        {p.status || "N/A"}
                      </span>
                    </td>
                    <td>
                      {p.status === "pending" && (
                        <>
                          <button
                            className="btn btn-sm btn-success me-1"
                            onClick={() => handleApproveProvider(p.email_id || p.email)}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-sm btn-danger me-1"
                            onClick={() => handleRejectProvider(p.email_id || p.email)}
                          >
                            Reject
                          </button>
                          <button
                            className="btn btn-sm btn-info"
                            onClick={() => setSelectedUser({ email: p.email_id || p.email, type: "provider" })}
                          >
                            Message
                          </button>
                        </>
                      )}
                    </td>
                    <td>
                      { (p.name || p.full_name) && (
                        <>
                          <a
                            href={`${BASE_URL}/api/get_image/${p.email_id || p.email}/profile`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-primary me-2"
                          >
                            Profile
                          </a>
                          <a
                            href={`${BASE_URL}/api/get_image/${p.email_id || p.email}/certificate`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-secondary"
                          >
                            Certificate
                          </a>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------------- CONTRACTOR SECTION ---------------- */}
      <div className="card mb-4">
        <div className="card-header bg-secondary text-white">
          <h5>Company Management</h5>
        </div>
        <div className="card-body table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Services</th>
                <th>Status</th>
                <th>Actions</th>
                <th>Certificates</th>
              </tr>
            </thead>
            <tbody>
              {contractors.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    No companies found
                  </td>
                </tr>
              ) : (
                contractors.map((c) => (
                  <tr key={c.company_id || c.email_id || c.id || Math.random()}>
                    <td>{c.company_name || "N/A"}</td>
                    <td>{c.email_id || c.email || "N/A"}</td>
                    <td>{c.contact_number || c.phone || "N/A"}</td>
                    <td>
                      {c.services && Object.keys(c.services).length > 0 ? (
                        <button className="btn btn-link btn-sm p-0" onClick={() => openServicesModal(c)}>
                          View ({Object.keys(c.services).length})
                        </button>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          c.status === "approved" ? "bg-success" : c.status === "pending" ? "bg-warning" : "bg-danger"
                        }`}
                      >
                        {c.status || "N/A"}
                      </span>
                    </td>
                    <td>
                      {c.status === "pending" && (
                        <>
                          <button className="btn btn-sm btn-success me-1" onClick={() => handleApproveContractor(c.email_id || c.email)}>
                            Approve
                          </button>
                          <button className="btn btn-sm btn-danger me-1" onClick={() => handleRejectContractor(c.email_id || c.email)}>
                            Reject
                          </button>
                          <button className="btn btn-sm btn-info" onClick={() => setSelectedUser({ email: c.email_id || c.email, type: "contractor" })}>
                            Message
                          </button>
                        </>
                      )}
                    </td>
                    <td>
                      {c.company_name && (
                        <>
                          <a
                            href={`${BASE_URL}/api/get_image/${c.email_id || c.email}/contractor_logo`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-primary me-2"
                          >
                            Logo
                          </a>
                          <a
                            href={`${BASE_URL}/api/get_image/${c.email_id || c.email}/contractor_certificate`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-secondary"
                          >
                            Certificate
                          </a>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shared Services Modal */}
      {servicesModalUser && (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Services for {servicesModalUser.full_name || servicesModalUser.company_name || "User"}
                </h5>
                <button className="btn-close" onClick={closeServicesModal}></button>
              </div>
              <div className="modal-body">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Location</th>
                      <th>Rate (MYR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(servicesModalUser.services) && servicesModalUser.services.length > 0 ? (
                      servicesModalUser.services.map((s, i) => (
                        <tr key={i}>
                          <td>{s.service_name || s.name || "-"}</td>
                          <td>{s.service_location || s.location || "-"}</td>
                          <td>{s.service_rate || s.rate || "-"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center">
                          No services available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeServicesModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shared Message Modal */}
      {selectedUser && (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Send Message to {selectedUser.email}</h5>
                <button
                  className="btn-close"
                  onClick={() => {
                    setSelectedUser(null);
                    setMessage("");
                  }}
                  disabled={sending}
                ></button>
              </div>
              <div className="modal-body">
                {sending ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary mb-3" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted">Sending message...</p>
                  </div>
                ) : (
                  <textarea
                    className="form-control"
                    rows="4"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your message..."
                  ></textarea>
                )}
              </div>
              {!sending && (
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setSelectedUser(null);
                      setMessage("");
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleSendMessage(selectedUser.email, selectedUser.type)}
                    disabled={sending || !message.trim()}
                  >
                    {sending ? "Sending..." : "Send"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
