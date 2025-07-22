import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import HealthReportUpload from "./HealthReportUpload";
import HealthInsights from "./HealthInsights";
import "./PatientDashboard.css";
import { FaUser, FaCog, FaSignOutAlt } from "react-icons/fa";

const PatientDashboard = ({ userData }) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [user, setUser] = useState(userData || null);
  const [healthReports, setHealthReports] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [loading, setLoading] = useState(userData ? false : true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [editProfile, setEditProfile] = useState(false);
  const [editForm, setEditForm] = useState({});
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  // Initialize editForm when user data changes
  useEffect(() => {
    if (user) {
      setEditForm({ ...user });
    }
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuRef]);

  useEffect(() => {
    // If userData is provided as prop, use it instead of fetching
    if (userData) {
      setUser(userData);
      setLoading(false); // Set loading to false when userData is provided
    } else if (!user) {
      fetchUserData();
    } else {
      setLoading(false); // Ensure loading is set to false when user is already set
    }
  }, [userData]);

  // Separate effect for fetching reports to avoid dependency issues
  useEffect(() => {
    if (activeTab === "reports" || activeTab === "dashboard") {
      fetchHealthReports();
    }
  }, [activeTab]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get("http://localhost:5000/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("User data fetched:", response.data);
      setUser(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        // Demo user data for development
        console.log("Using demo data");
        setUser({
          _id: "demo-patient",
          fullName: "John Doe",
          username: "johndoe",
          email: "john@example.com",
          role: "patient",
          gender: "male",
          dateOfBirth: "1990-01-01",
        });
        setLoading(false);
      }
    }
  };

  const fetchHealthReports = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get("http://localhost:5000/api/health-reports/patient/reports", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Health reports fetched:", response.data);
      setHealthReports(response.data.reports || []);
    } catch (error) {
      console.error("Error fetching health reports:", error);
      // Demo data for development
      console.log("Using demo health reports");
      setHealthReports([
        {
          _id: "report1",
          reportType: "blood",
          createdAt: new Date().toISOString(),
          isAnalyzed: true,
          recommendation: {
            reviewStatus: "approved",
            finalRecommendations: {
              treatmentPlan: {
                summary: "Your blood glucose levels are slightly elevated. Consider dietary changes and regular monitoring.",
                medications: [{ name: "Metformin", dosage: "500mg", frequency: "Twice daily" }],
              },
              lifestyleChanges: {
                summary: "Lifestyle modifications recommended",
                diet: ["Reduce sugar intake", "Increase fiber"],
                exercise: ["30 minutes daily walking"],
              },
            },
            doctorId: { fullName: "Dr. Smith", specialization: "Endocrinology" },
          },
        },
      ]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: "status-pending",
      under_review: "status-review",
      approved: "status-approved",
      rejected: "status-rejected",
    };
    return statusClasses[status] || "status-pending";
  };

  const renderDashboard = () => (
    <div className="dashboard-content">
      <div className="welcome-section">
        <h2>Welcome back, {user?.fullName}!</h2>
        <p>Track your health journey with AI-powered recommendations validated by healthcare professionals.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>{healthReports.length}</h3>
            <p>Health Reports</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🤖</div>
          <div className="stat-content">
            <h3>{healthReports.filter((r) => r.isAnalyzed).length}</h3>
            <p>AI Analyses</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👨‍⚕️</div>
          <div className="stat-content">
            <h3>{healthReports.filter((r) => r.recommendation?.reviewStatus === "approved").length}</h3>
            <p>Doctor Approved</p>
          </div>
        </div>
        {/* <div className="stat-card">
                    <div className="stat-icon">⚡</div>
                    <div className="stat-content">
                        <h3>0</h3>
                        <p>Active Treatments</p>
                    </div>
                </div> */}
      </div>

      <div className="dashboard-cards">
        <div className="action-card">
          <h3>Upload New Report</h3>
          <p>Upload your latest blood or urine test results to get AI-powered health recommendations.</p>
          <button className="btn-primary" onClick={() => setActiveTab("upload")}>
            Upload Report
          </button>
        </div>

        <div className="recent-reports">
          <h3>Recent Reports</h3>
          {healthReports.length > 0 ? (
            <div className="report-list">
              {healthReports.slice(0, 3).map((report) => (
                <div key={report._id} className="report-item">
                  <div className="report-info">
                    <span className={`report-type-badge ${report.reportType === "blood" ? "blood-type" : report.reportType === "urine" ? "urine-type" : ""}`}>{report.reportType?.toUpperCase()}</span>
                    <span className="report-date">{new Date(report.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className={`status-badge ${getStatusBadge(report.recommendation?.reviewStatus)}`}>{report.recommendation?.reviewStatus?.replace("_", " ").toUpperCase() || "PENDING"}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <img src="/empty-state.svg" alt="No reports" style={{ width: "80px", marginBottom: "1rem" }} />
              <p>No reports uploaded yet. Upload your first report to get started!</p>
            </div>
          )}
          <button className="btn-secondary" onClick={() => setActiveTab("reports")}>
            View All Reports
          </button>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="reports-content">
      <h2>Your Health Reports</h2>
      <div className="reports-grid">
        {healthReports.map((report) => (
          <div key={report._id} className="report-card">
            <div className="report-header">
              <span className={`report-type-badge ${report.reportType === "blood" ? "blood-type" : report.reportType === "urine" ? "urine-type" : ""}`}>{report.reportType?.toUpperCase()}</span>{" "}
              <span className={`status-badge ${getStatusBadge(report.recommendation?.reviewStatus)}`}>{report.recommendation?.reviewStatus?.replace("_", " ").toUpperCase() || "PENDING"}</span>
            </div>

            <div className="report-details">
              <p>
                <strong>Uploaded:</strong> {new Date(report.createdAt).toLocaleDateString()}
              </p>
              {report.recommendation?.doctorId && (
                <p>
                  <strong>Reviewed by:</strong> {report.recommendation.doctorId.fullName}
                </p>
              )}
            </div>

            <div className="report-actions">
              <button
                className="btn-insights"
                onClick={() => {
                  setSelectedReportId(report._id);
                  setActiveTab("insights");
                }}
              >
                🤖 View AI Insights
              </button>
            </div>

            {report.recommendation?.finalRecommendations && (
              <div className="recommendations-preview">
                <h4>Recommendations</h4>
                <p>{report.recommendation.finalRecommendations.treatmentPlan?.summary}</p>

                {report.recommendation.finalRecommendations.treatmentPlan?.medications?.length > 0 && (
                  <div className="medications">
                    <h5>Medications:</h5>
                    {report.recommendation.finalRecommendations.treatmentPlan.medications.map((med, index) => (
                      <div key={index} className="medication-item">
                        <strong>{med.name}</strong> - {med.dosage}, {med.frequency}
                      </div>
                    ))}
                  </div>
                )}

                {report.recommendation.finalRecommendations.lifestyleChanges?.diet?.length > 0 && (
                  <div className="lifestyle">
                    <h5>Diet Recommendations:</h5>
                    <ul>
                      {report.recommendation.finalRecommendations.lifestyleChanges.diet.slice(0, 2).map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {healthReports.length === 0 && (
          <div className="empty-state-card">
            <img src="/empty-state.svg" alt="No reports" style={{ width: "120px", marginBottom: "1rem" }} />
            <h3>No Reports Yet</h3>
            <p>Upload your first health report to get AI-powered recommendations.</p>
            <button className="btn-primary" onClick={() => setActiveTab("upload")}>
              Upload First Report
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const handleEditProfile = () => {
    setEditForm({ ...user });
    setEditProfile(true);
    setShowUserMenu(false);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.put("http://localhost:5000/api/users/profile", editForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(response.data.user || response.data);
      setEditProfile(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    }
  };

  const renderProfile = () => {
    if (!user) {
      return (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <div>Loading profile...</div>
        </div>
      );
    }

    if (editProfile) {
      return (
        <div className="profile-section">
          <form className="profile-edit-form" onSubmit={handleEditSubmit}>
            <h2>Edit Profile</h2>
            <div className="edit-grid">
              <label>
                Full Name
                <input name="fullName" value={editForm.fullName || ""} onChange={handleEditChange} />
              </label>
              <label>
                Email
                <input name="email" value={editForm.email || ""} onChange={handleEditChange} />
              </label>
              <label>
                Date of Birth
                <input name="dateOfBirth" type="date" value={editForm.dateOfBirth ? new Date(editForm.dateOfBirth).toISOString().split("T")[0] : ""} onChange={handleEditChange} />
              </label>
              <label>
                Gender
                <input name="gender" value={editForm.gender || ""} onChange={handleEditChange} />
              </label>
              <label>
                Blood Group
                <select name="bloodGroup" value={editForm.bloodGroup || ""} onChange={handleEditChange}>
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </label>
              <label>
                Location
                <input name="location" value={editForm.location || ""} onChange={handleEditChange} />
              </label>
            </div>
            <div className="edit-actions">
              <button type="submit" className="btn-save">
                Save Changes
              </button>
              <button type="button" className="btn-cancel" onClick={() => setEditProfile(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      );
    }

    return (
      <div className="profile-section">
        <div className="profile-header">
          <div className="profile-avatar-large">{user.fullName ? user.fullName.charAt(0).toUpperCase() : "P"}</div>
          <div className="profile-header-info">
            <h2>{user.fullName || "Patient"}</h2>
            <span className="profile-role">Patient</span>
          </div>
          <button className="btn-edit-profile" onClick={handleEditProfile}>
            Edit Profile
          </button>
        </div>

        <div className="profile-details-grid">
          <div className="profile-detail-card">
            <h4>Personal Information</h4>
            <ul>
              <li>
                <strong>Full Name</strong>
                <span>{user.fullName || "Not available"}</span>
              </li>
              <li>
                <strong>Email</strong>
                <span>{user.email || "Not available"}</span>
              </li>
              <li>
                <strong>Gender</strong>
                <span>{user.gender || "Not specified"}</span>
              </li>
              <li>
                <strong>Date of Birth</strong>
                <span>{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : "Not specified"}</span>
              </li>
              <li>
                <strong>Age</strong>
                <span>{user.age || "Not calculated"}</span>
              </li>
              <li>
                <strong>Blood Group</strong>
                <span>{user.bloodGroup || "Not specified"}</span>
              </li>
              <li>
                <strong>Location</strong>
                <span>{user.location || "Not specified"}</span>
              </li>
            </ul>
          </div>

          <div className="profile-detail-card">
            <h4>Account Information</h4>
            <ul>
              <li>
                <strong>Patient ID</strong>
                <span>{user._id || "Not available"}</span>
              </li>
              <li>
                <strong>Username</strong>
                <span>{user.username || "Not available"}</span>
              </li>
              <li>
                <strong>Role</strong>
                <span>{user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Patient"}</span>
              </li>
              <li>
                <strong>Status</strong>
                <span className="status-active">Active</span>
              </li>
              <li>
                <strong>Member Since</strong>
                <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Not available"}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-dashboard">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <h1>HealthCare AI - Patient Portal</h1>
        </div>
        <div className="nav-tabs">
          <button className={`nav-tab ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => setActiveTab("dashboard")}>
            Dashboard
          </button>
          {/* <button 
                        className={`nav-tab ${activeTab === 'upload' ? 'active' : ''}`}
                        onClick={() => setActiveTab('upload')}
                    >
                        Upload Report
                    </button> */}
          <button className={`nav-tab ${activeTab === "reports" ? "active" : ""}`} onClick={() => setActiveTab("reports")}>
            My Reports
          </button>
          <button className={`nav-tab ${activeTab === "insights" ? "active" : ""}`} onClick={() => setActiveTab("insights")}>
            AI Insights
          </button>
        </div>
        <div className="nav-user" ref={userMenuRef}>
          <button className="user-profile-button" onClick={() => setShowUserMenu(!showUserMenu)}>
            <div className="user-avatar">{user?.fullName ? user.fullName.charAt(0).toUpperCase() : "P"}</div>
            <div className="user-info">
              <span className="user-name">{user?.fullName || "Patient"}</span>
              <span className="user-role">Patient</span>
            </div>
          </button>

          {showUserMenu && (
            <div className="user-dropdown">
              <div className="dropdown-header">
                <p className="user-fullname">{user?.fullName || "Patient"}</p>
                <p className="user-email">{user?.email || "patient@example.com"}</p>
              </div>
              <div className="dropdown-menu">
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setActiveTab("profile");
                    setShowUserMenu(false);
                  }}
                >
                  <FaUser />
                  My Profile
                </button>
                {/* <button className="dropdown-item" onClick={handleEditProfile}>
                                    <FaCog />
                                    Account Settings
                                </button> */}
                <div className="dropdown-divider"></div>
                <button className="dropdown-item logout" onClick={handleLogout}>
                  <FaSignOutAlt />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="dashboard-main">
        {activeTab === "dashboard" ? renderDashboard() : null}
        {activeTab === "upload" ? <HealthReportUpload /> : null}
        {activeTab === "reports" ? renderReports() : null}
        {activeTab === "insights" ? <HealthInsights reportId={selectedReportId} /> : null}
        {activeTab === "profile" ? renderProfile() : null}
      </main>
    </div>
  );
};

export default PatientDashboard;
