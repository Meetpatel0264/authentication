import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data } = await api.get("/auth/users");
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      } catch (err) {
        setError(err.response?.data?.message || "Session expired. Please login again.");
        setTimeout(() => navigate("/login", { replace: true }), 1000);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [navigate]);

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" />
          <p className="text-secondary">Loading your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light py-5">
      <div className="container">
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="card-body p-4 p-md-5">
            <div className="d-flex flex-column flex-md-row justify-content-between gap-3 align-items-md-center">
              <div>
                <span className="badge text-bg-success mb-3">Authenticated</span>
                <h1 className="fw-bold mb-2">Welcome, {user?.name || "User"}</h1>
                <p className="text-secondary mb-0">You are logged in successfully.</p>
              </div>
              <button className="btn btn-outline-danger px-4" onClick={logout}>
                <i className="bi bi-box-arrow-right me-2" />Logout
              </button>
            </div>

            {error && <div className="alert alert-danger mt-4">{error}</div>}

            <div className="row g-3 mt-4">
              <div className="col-md-6">
                <div className="border rounded-4 p-4 h-100 bg-body-tertiary">
                  <small className="text-secondary d-block mb-1">Name</small>
                  <strong>{user?.name || "-"}</strong>
                </div>
              </div>
              <div className="col-md-6">
                <div className="border rounded-4 p-4 h-100 bg-body-tertiary">
                  <small className="text-secondary d-block mb-1">Email</small>
                  <strong>{user?.email || "-"}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
