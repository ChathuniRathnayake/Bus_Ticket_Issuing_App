import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="main-content">
      <h2>Admin Dashboard</h2>

      <button onClick={() => navigate("/admin/create-conductor")}>
        Create Conductor Account
      </button>

      <button onClick={() => navigate("/admin/create-admin")}>
        Create Admin Account
      </button>
    </div>
  );
}

export default AdminDashboard;