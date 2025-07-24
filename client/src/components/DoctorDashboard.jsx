import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./DoctorDashboard.css";
import { FaUserMd, FaUser, FaSignOutAlt } from "react-icons/fa";
import api from "../utils/api.constant";
import axios from "axios";

const DoctorDashboard = ({ userData }) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [editProfile, setEditProfile] = useState(false);
  // Initialize editForm with empty object to avoid null reference errors
  const [editForm, setEditForm] = useState({});
  // Always initialize form fields to empty strings
  useEffect(() => {
    if (user) {
      setEditForm({
        fullName: user.fullName || "",
        email: user.email || "",
        specialization: user.specialization || "",
        licenseNumber: user.licenseNumber || "",
        yearsOfExperience: user.yearsOfExperience || "",
        location: user.location || "",
      });
    }
  }, [user]);
  const navigate = useNavigate();
  const userMenuRef = useRef(null);
  const [reviewData, setReviewData] = useState({
    doctorNotes: "",
    doctorFeedbackToAI: "",
    modifications: {
      treatmentPlan: {
        medications: [],
        procedures: [],
        followUpTests: [],
        summary: "",
      },
      lifestyleChanges: {
        diet: [],
        exercise: [],
        habits: [],
        precautions: [],
        summary: "",
      },
    },
  });

  useEffect(() => {
    // If userData is provided as prop, use it instead of fetching
    if (userData) {
      setUser(userData);
      fetchDashboardStats();
    } else if (!user) {
      // Only fetch if no userData prop and user is not already loaded
      fetchUserData();
      fetchDashboardStats();
    }
  }, [userData]); // Only depend on userData prop to avoid infinite loops

  // Fetch dashboard stats when activeTab changes to dashboard
  useEffect(() => {
    if (activeTab === "dashboard") {
      fetchDashboardStats();
    }
  }, [activeTab]);

  // Fetch real profile from API
  const fetchUserData = async () => {
    try {
      // Check if we have a token before making the API call
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Use the same endpoint as RoleBasedDashboard
      const response = await axios.get("http://localhost:5000/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(response.data.user || response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
      localStorage.removeItem("token"); // Clear invalid token
      navigate("/login");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Prevent setting the same tab repeatedly
  const handleTabChange = (tab) => {
    if (activeTab !== tab && !loading) {
      setActiveTab(tab);
    }
  };

  useEffect(() => {
    // Always fetch fresh data when switching tabs
    if (activeTab === "pending") fetchPendingRecommendations();
    else if (activeTab === "assigned") fetchAssignedRecommendations();
    else if (activeTab === "patients") fetchPatients();
    else if (activeTab !== "dashboard" && activeTab !== "profile") setRecommendations([]);
  }, [activeTab]);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/doctor-review/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Ensure all required fields exist in the response
      const statsData = response.data || {};
      setStats({
        pendingReviews: statsData.pendingReviews || 0,
        assignedToMe: statsData.assignedToMe || 0,
        completedToday: statsData.completedToday || 0,
        totalReviews: statsData.totalReviews || 0,
        recentActivity: Array.isArray(statsData.recentActivity) ? statsData.recentActivity : [],
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      // Set default stats to prevent UI errors
      setStats({
        pendingReviews: 0,
        assignedToMe: 0,
        completedToday: 0,
        totalReviews: 0,
        recentActivity: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRecommendations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get("http://localhost:5000/api/doctor-review/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecommendations(response.data.recommendations || []);
    } catch (error) {
      console.error("Error fetching pending recommendations:", error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedRecommendations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get("http://localhost:5000/api/doctor-review/assigned", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecommendations(response.data.recommendations || []);
    } catch (error) {
      console.error("Error fetching assigned recommendations:", error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // In a real implementation, you would fetch patients from the API
      // For now, we'll extract unique patients from recommendations
      const response = await axios.get("http://localhost:5000/api/doctor-review/assigned", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const recommendations = response.data.recommendations || [];

      // Extract unique patients from recommendations
      const uniquePatients = [];
      const patientIds = new Set();

      recommendations.forEach((rec) => {
        if (rec.patientId && !patientIds.has(rec.patientId._id)) {
          patientIds.add(rec.patientId._id);
          uniquePatients.push({
            id: rec.patientId._id,
            name: rec.patientId.fullName,
            email: rec.patientId.email,
            reportsCount: 1,
            lastReport: rec.createdAt,
          });
        } else if (rec.patientId) {
          // Increment report count for existing patient
          const patient = uniquePatients.find((p) => p.id === rec.patientId._id);
          if (patient) {
            patient.reportsCount++;
            if (new Date(rec.createdAt) > new Date(patient.lastReport)) {
              patient.lastReport = rec.createdAt;
            }
          }
        }
      });

      setPatients(uniquePatients);
    } catch (error) {
      console.error("Error fetching patients:", error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const assignToSelf = async (recommendationId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await axios.post(
        `http://localhost:5000/api/health-reports/${recommendationId}/assign`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await fetchPendingRecommendations();
      await fetchDashboardStats();
    } catch (error) {
      console.error("Error assigning recommendation:", error);
    } finally {
      setLoading(false);
    }
  };

  const openRecommendationDetails = async (recommendation) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      setLoading(true);

      // First reset the review data to default values to avoid stale data
      setReviewData({
        doctorNotes: "",
        doctorFeedbackToAI: "",
        modifications: {
          treatmentPlan: {
            medications: [],
            procedures: [],
            followUpTests: [],
            summary: "",
          },
          lifestyleChanges: {
            diet: [],
            exercise: [],
            habits: [],
            precautions: [],
            summary: "",
          },
        },
      });

      // Always fetch the latest recommendation data
      const response = await axios.get(`http://localhost:5000/api/doctor-review/${recommendation._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Always fetch the full report data for all recommendations, especially approved ones
      if (response.data.recommendation && response.data.recommendation.reportId) {
        try {
          const reportResponse = await axios.get(`http://localhost:5000/api/health-reports/${response.data.recommendation.reportId._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (reportResponse.data && reportResponse.data.reportData) {
            response.data.recommendation.reportId.reportData = reportResponse.data.reportData;
          }
        } catch (reportError) {
          console.error("Error fetching report data:", reportError);
        }
      }

      // Set the selected recommendation
      setSelectedRecommendation(response.data.recommendation);

      // Initialize review data with existing modifications if any
      const rec = response.data.recommendation;
      if (rec) {
        setReviewData({
          doctorNotes: rec.doctorNotes || "",
          doctorFeedbackToAI: rec.doctorFeedbackToAI || "",
          modifications: rec.doctorModifications || {
            treatmentPlan: {
              medications: [],
              procedures: [],
              followUpTests: [],
              summary: "",
            },
            lifestyleChanges: {
              diet: [],
              exercise: [],
              habits: [],
              precautions: [],
              summary: "",
            },
          },
        });
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching recommendation details:", error);
      alert("Error loading recommendation details. Please try again.");
      setLoading(false);
    }
  };

  const approveRecommendation = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await axios.post(
        `http://localhost:5000/api/doctor-review/${selectedRecommendation._id}/approve`,
        {
          finalRecommendations: {
            treatmentPlan: reviewData.modifications.treatmentPlan,
            lifestyleChanges: reviewData.modifications.lifestyleChanges,
          },
          doctorNotes: reviewData.doctorNotes,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Recommendation approved successfully!");
      setSelectedRecommendation(null);
      // Refresh all relevant data
      fetchDashboardStats();
      if (activeTab === "assigned") fetchAssignedRecommendations();
    } catch (error) {
      console.error("Error approving recommendation:", error);
      alert("Error approving recommendation");
    }
  };

  const updateAIRecommendations = async () => {
    try {
      if (!reviewData.doctorFeedbackToAI) {
        alert("Please provide feedback to the AI system before requesting an update.");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) return;

      setLoading(true);

      await axios.post(
        `http://localhost:5000/api/doctor-review/${selectedRecommendation._id}/update-ai`,
        {
          doctorFeedbackToAI: reviewData.doctorFeedbackToAI,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("AI recommendations updated successfully based on your feedback!");

      // Refresh the recommendation details to show updated AI insights
      await openRecommendationDetails({ _id: selectedRecommendation._id });

      // Refresh dashboard stats
      fetchDashboardStats();
    } catch (error) {
      console.error("Error updating AI recommendations:", error);
      alert("Error updating AI recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderDashboard = () => (
    <div className="dashboard-overview">
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <div>Loading dashboard stats...</div>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-content">
                <h3>{stats.pendingReviews || 0}</h3>
                <p>Pending Reviews</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h3>{stats.assignedToMe || 0}</h3>
                <p>Assigned to Me</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🗓️</div>
              <div className="stat-content">
                <h3>{stats.completedToday || 0}</h3>
                <p>Completed Today</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h3>{stats.totalReviews || 0}</h3>
                <p>Total Reviews</p>
              </div>
            </div>
          </div>

          <div className="recent-activity">
            <h3>Recent Activity</h3>
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              <ul className="activity-list">
                {stats.recentActivity.map((activity, index) => (
                  <li key={index}>{activity}</li>
                ))}
              </ul>
            ) : (
              <div className="empty-state" style={{ background: "white", borderRadius: "15px", padding: "20px" }}>
                <img src="/empty-state.svg" alt="No activity" style={{ width: "80px", marginBottom: "1rem" }} />
                <p style={{ color: "#64748b" }}>No recent activity</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  // Add a loading spinner for recommendations
  const renderRecommendationsList = () => (
    <div className="recommendations-container">
      <h2>{activeTab === "pending" ? "Pending Reviews" : "My Assignments"}</h2>
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <div>Loading recommendations...</div>
        </div>
      ) : (
        <div className="recommendations-grid">
          {recommendations.map((rec) => (
            <div key={rec._id} className="recommendation-card">
              <div className={`card-header ${rec.reportId?.reportType === "blood" ? "blood-report" : rec.reportId?.reportType === "urine" ? "urine-report" : ""}`}>
                <h4>Patient: {rec.patientId?.fullName}</h4>
                <span className={`status ${rec.reviewStatus}`}>{rec.reviewStatus.replace("_", " ").toUpperCase()}</span>
              </div>
              <div className="card-body">
                <p>
                  <strong>Report Type:</strong>
                  <span className={`report-type-badge ${rec.reportId?.reportType === "blood" ? "blood-type" : rec.reportId?.reportType === "urine" ? "urine-type" : ""}`}>
                    {rec.reportId?.reportType?.toUpperCase()}
                  </span>
                </p>
                <p>
                  <strong>Urgency:</strong>
                  <span className={`urgency ${rec.aiSuggestions?.urgencyLevel}`}>{rec.aiSuggestions?.urgencyLevel?.toUpperCase()}</span>
                </p>
                <p>
                  <strong>Created:</strong> {new Date(rec.createdAt).toLocaleDateString()}
                </p>
                <p>
                  <strong>Approved:</strong> {new Date(rec?.reviewedAt)?.toLocaleDateString() || "-"}
                </p>
                {rec.aiSuggestions?.riskFactors?.length > 0 && (
                  <p>
                    <strong>Risk Factors:</strong> {rec.aiSuggestions.riskFactors.length} identified
                  </p>
                )}
                <p>
                  <strong>Status:</strong> {rec.reviewStatus === "approved" ? "Approved" : rec.reviewStatus === "rejected" ? "Rejected" : "Pending Review"}
                </p>
              </div>
              <div className="card-actions">
                {activeTab === "pending" ? (
                  <button className="btn-assign" onClick={() => assignToSelf(rec._id)}>
                    Assign to Me
                  </button>
                ) : (
                  <button className={`btn-review ${rec.reviewStatus === "approved" ? "approved" : rec.reviewStatus === "rejected" ? "rejected" : ""}`} onClick={() => openRecommendationDetails(rec)}>
                    {rec.reviewStatus === "approved" ? "View Approved" : rec.reviewStatus === "rejected" ? "View Rejected" : "Review"}
                  </button>
                )}
              </div>
            </div>
          ))}
          {recommendations.length === 0 && !loading && (
            <div className="empty-state">
              <img src="/empty-state.svg" alt="No recommendations" style={{ width: "120px", marginBottom: "1rem" }} />
              <p>{activeTab === "pending" ? "No pending reviews found." : "No assignments found."}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const handleEditProfile = () => {
    // Make sure we have default values for all fields
    setEditForm({
      fullName: user?.fullName || "",
      email: user?.email || "",
      specialization: user?.specialization || "",
      licenseNumber: user?.licenseNumber || "",
      yearsOfExperience: user?.yearsOfExperience || "",
      location: user?.location || "",
    });
    setEditProfile(true);
    setShowUserMenu(false);
  };
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put("/users/profile", editForm);
      setUser(response.data.user || response.data);
      setEditProfile(false);
    } catch (error) {
      alert("Failed to update profile");
    }
  };

  const renderProfile = () => {
    // Always render a component structure to maintain consistent hook calls
    return (
      <div className="profile-container">
        {!user ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <div>Loading profile...</div>
          </div>
        ) : editProfile ? (
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
                  Specialization
                  <input name="specialization" value={editForm.specialization || ""} onChange={handleEditChange} />
                </label>
                <label>
                  License Number
                  <input name="licenseNumber" value={editForm.licenseNumber || ""} onChange={handleEditChange} />
                </label>
                <label>
                  Experience
                  <input name="yearsOfExperience" value={editForm.yearsOfExperience || ""} onChange={handleEditChange} />
                </label>
                <label>
                  Hospital/Clinic
                  <input name="location" value={editForm.location || ""} onChange={handleEditChange} />
                </label>
              </div>
              <div className="edit-actions">
                <button type="submit" className="btn-save">
                  Save
                </button>
                <button type="button" className="btn-cancel" onClick={() => setEditProfile(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="profile-section">
            <div className="profile-header">
              <div className="profile-avatar-large">
                <FaUserMd size={48} style={{ color: "#fff" }} />
              </div>
              <div className="profile-header-info">
                <h2>Dr. {user.fullName || "Doctor"}</h2>
                <span className="profile-role">{user.specialization || "General Medicine"}</span>
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
                    <strong>Full Name:</strong> {user.fullName || "Not available"}
                  </li>
                  <li>
                    <strong>Email:</strong> {user.email || "Not available"}
                  </li>
                  <li>
                    <strong>Specialization:</strong> {user.specialization || "Not specified"}
                  </li>
                  <li>
                    <strong>License No.:</strong> {user.licenseNumber || "Not specified"}
                  </li>
                  <li>
                    <strong>Experience:</strong> {user.yearsOfExperience ? `${user.yearsOfExperience} years` : "Not specified"}
                  </li>
                  <li>
                    <strong>Hospital/Clinic:</strong> {user.location || "Not specified"}
                  </li>
                </ul>
              </div>
              <div className="profile-detail-card">
                <h4>Account Information</h4>
                <ul>
                  <li>
                    <strong>Doctor ID:</strong> {user?._id ?? user?.id ?? "Not available"}
                  </li>
                  <li>
                    <strong>Role:</strong> {user.role || "Doctor"}
                  </li>
                  <li>
                    <strong>Status:</strong> <span className="status-active">Active</span>
                  </li>
                  <li>
                    <strong>Member Since:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Define a function to render recommendation details
  const renderRecommendationDetails = () => {
    // Always render a component structure to maintain consistent hook calls
    return (
      <div className="recommendation-details-container">
        <div className="review-content">
          <div className="review-navigation">
            <button className="back-button" onClick={() => setSelectedRecommendation(null)}>
              ← Back to My Assignments
            </button>
            <div className="review-title-section">
              <h2>Review AI Recommendation</h2>
              <p className="review-subtitle">Patient: {selectedRecommendation?.patientId?.fullName || "Loading..."}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <div>Loading recommendation details...</div>
          </div>
        ) : (
          selectedRecommendation && (
            <div className="review-content">
              {/* Patient Information */}
              <div className="patient-info-section">
                <h3>Patient Information</h3>
                <div className="patient-info-grid">
                  <div className="info-item">
                    <strong>Name:</strong> {selectedRecommendation.patientId?.fullName || "N/A"}
                  </div>
                  <div className="info-item">
                    <strong>Gender:</strong> {selectedRecommendation.patientId?.gender || "N/A"}
                  </div>
                  <div className="info-item">
                    <strong>Age:</strong>{" "}
                    {selectedRecommendation.patientId?.dateOfBirth ? Math.floor((new Date() - new Date(selectedRecommendation.patientId.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)) : "N/A"}
                  </div>
                  <div className="info-item">
                    <strong>Blood Group:</strong> {selectedRecommendation.patientId?.bloodGroup || "N/A"}
                  </div>
                  <div className="info-item">
                    <strong>Email:</strong> {selectedRecommendation.patientId?.email || "N/A"}
                  </div>
                </div>
              </div>

              {/* Report Data */}
              <div className="report-data-section">
                <h3>
                  <span
                    className={`report-type-badge ${
                      selectedRecommendation.reportId?.reportType === "blood" ? "blood-type" : selectedRecommendation.reportId?.reportType === "urine" ? "urine-type" : ""
                    }`}
                  >
                    {selectedRecommendation.reportId?.reportType?.toUpperCase() || "UNKNOWN"}
                  </span>
                  Report Data
                </h3>

                {selectedRecommendation.reportId ? (
                  <div className="report-metrics">
                    {selectedRecommendation.reportId.reportType === "blood" &&
                      selectedRecommendation.reportId.bloodMetrics &&
                      Object.entries(selectedRecommendation.reportId.bloodMetrics).map(([key, value]) =>
                        value && typeof value === "object" && value.value ? (
                          <div className="metric-item" key={key}>
                            <strong>{key}:</strong>
                            <span>
                              {value.value} {value.unit} {value.normalRange ? `(Normal Range: ${value.normalRange})` : ""}
                            </span>
                          </div>
                        ) : null
                      )}
                    {selectedRecommendation.reportId.reportType === "urine" &&
                      selectedRecommendation.reportId.urineMetrics &&
                      Object.entries(selectedRecommendation.reportId.urineMetrics).map(([key, value]) =>
                        value && typeof value === "object" && value.value !== undefined ? (
                          <div className="metric-item" key={key}>
                            <strong>{key}:</strong>
                            <span>
                              {value.value} {value.normalRange ? `(Normal Range: ${value.normalRange})` : ""}
                            </span>
                          </div>
                        ) : null
                      )}
                    {/* Fallback for reportData if available */}
                    {selectedRecommendation.reportId.reportData &&
                      Object.entries(selectedRecommendation.reportId.reportData).map(([key, value]) => (
                        <div className="metric-item" key={key}>
                          <strong>{key}:</strong>
                          <span>
                            {typeof value === "object"
                              ? Array.isArray(value)
                                ? value.join(", ")
                                : Object.entries(value)
                                    .map(([k, v]) => `${k}: ${v}`)
                                    .join(", ")
                              : value}
                          </span>
                        </div>
                      ))}
                    {/* Show metrics if no other data is available */}
                    {selectedRecommendation.reportId.metrics &&
                      !selectedRecommendation.reportId.bloodMetrics &&
                      !selectedRecommendation.reportId.urineMetrics &&
                      !selectedRecommendation.reportId.reportData &&
                      Object.entries(selectedRecommendation.reportId.metrics).map(([key, value]) =>
                        value !== undefined && value !== null ? (
                          <div className="metric-item" key={key}>
                            <strong>{key}:</strong>
                            <span>{value}</span>
                          </div>
                        ) : null
                      )}
                  </div>
                ) : (
                  <p>No report data available</p>
                )}
              </div>

              <div className="recommendation-details">
                <h3>AI Recommendations</h3>
                <div className="ai-recommendations">
                  <div className="treatment-plan">
                    <h4>Treatment Plan</h4>
                    <p>
                      <strong>Summary:</strong> {selectedRecommendation.aiSuggestions?.treatmentPlan?.summary || "No summary available"}
                    </p>

                    {selectedRecommendation.aiSuggestions?.treatmentPlan?.medications?.length > 0 && (
                      <div>
                        <h5>Medications:</h5>
                        <ul>
                          {selectedRecommendation.aiSuggestions.treatmentPlan.medications.map((med, idx) => (
                            <li key={idx}>
                              {typeof med === "string" ? (
                                med
                              ) : (
                                <div>
                                  <strong>{med.name}</strong> - {med.dosage}, {med.frequency}
                                  {med.duration && <span> for {med.duration}</span>}
                                  {med.notes && <div style={{ fontSize: "0.9em", color: "#666", marginTop: "4px" }}>Note: {med.notes}</div>}
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="lifestyle-changes">
                    <h4>Lifestyle Changes</h4>
                    <p>
                      <strong>Summary:</strong> {selectedRecommendation.aiSuggestions?.lifestyleChanges?.summary || "No summary available"}
                    </p>

                    {selectedRecommendation.aiSuggestions?.lifestyleChanges?.diet?.length > 0 && (
                      <div>
                        <h5>Diet Recommendations:</h5>
                        <ul>
                          {selectedRecommendation.aiSuggestions.lifestyleChanges.diet.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedRecommendation.aiSuggestions?.lifestyleChanges?.exercise?.length > 0 && (
                      <div>
                        <h5>Exercise Recommendations:</h5>
                        <ul>
                          {selectedRecommendation.aiSuggestions.lifestyleChanges.exercise.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="doctor-review-form">
                <h3>Doctor Review</h3>

                <div className="form-group">
                  <label>Doctor Notes</label>
                  <textarea value={reviewData.doctorNotes} onChange={(e) => setReviewData({ ...reviewData, doctorNotes: e.target.value })} placeholder="Add your professional notes here..." rows="4" />
                </div>

                <div className="form-group">
                  <label>Feedback to AI System</label>
                  <textarea
                    value={reviewData.doctorFeedbackToAI}
                    onChange={(e) => setReviewData({ ...reviewData, doctorFeedbackToAI: e.target.value })}
                    placeholder="Provide feedback to improve AI recommendations..."
                    rows="3"
                  />
                </div>

                <div className="review-actions" style={{ display: "flex", gap: "15px", flexWrap: "nowrap", justifyContent: "space-between" }}>
                  {selectedRecommendation.reviewStatus === "approved" ? (
                    <div className="review-status-message approved">
                      <p>This recommendation was approved on {new Date(selectedRecommendation.approvedAt).toLocaleDateString()}</p>
                      <button className="btn-cancel" onClick={() => setSelectedRecommendation(null)}>
                        Back
                      </button>
                    </div>
                  ) : selectedRecommendation.reviewStatus === "rejected" ? (
                    <div className="review-status-message rejected">
                      <p>This recommendation was rejected on {new Date(selectedRecommendation.reviewedAt).toLocaleDateString()}</p>
                      <button className="btn-cancel" onClick={() => setSelectedRecommendation(null)}>
                        Back
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", width: "100%", gap: "15px", justifyContent: "space-between", flexWrap: "wrap" }}>
                      <button className="btn-approve" onClick={approveRecommendation} style={{ flex: "1" }}>
                        Approve Recommendation
                      </button>
                      <button
                        className="btn-update-ai"
                        onClick={updateAIRecommendations}
                        style={{ flex: "1", backgroundColor: "#6200ea", color: "white", border: "none", borderRadius: "4px", padding: "10px", cursor: "pointer" }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 2v6h-6"></path>
                          <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                          <path d="M3 12a9 9 0 0 0 15 6.7L21 16"></path>
                          <path d="M21 22v-6h-6"></path>
                        </svg>
                        Update AI Report
                      </button>
                      <button className="btn-cancel" onClick={() => setSelectedRecommendation(null)} style={{ flex: "1" }}>
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        )}
      </div>
    );
  };

  // Add click outside handler for dropdown
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

  // Render patients list
  const renderPatientsList = () => (
    <div className="patients-container">
      <h2>Patient Analysis</h2>
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <div>Loading patients...</div>
        </div>
      ) : (
        <div className="patients-grid">
          {patients.map((patient) => (
            <div key={patient.id} className="patient-card">
              <div className="patient-card-header">
                <h4>{patient.name}</h4>
              </div>
              <div className="patient-card-body">
                <p>
                  <strong>Email:</strong> {patient.email}
                </p>
                <p>
                  <strong>Reports:</strong> {patient.reportsCount}
                </p>
                <p>
                  <strong>Last Report:</strong> {new Date(patient.lastReport).toLocaleDateString()}
                </p>
              </div>
              <div className="patient-card-actions">
                <button className="btn-view-analysis" onClick={() => navigate(`/patient-analysis/${patient.id}`)}>
                  View Health Analysis
                </button>
              </div>
            </div>
          ))}
          {patients.length === 0 && !loading && (
            <div className="empty-state">
              <img src="/empty-state.svg" alt="No patients" style={{ width: "120px", marginBottom: "1rem" }} />
              <p>No patients found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Always render the same component structure to maintain consistent hook calls
  return (
    <div className="doctor-dashboard">
      {/* Always render the navigation */}
      <nav className="dashboard-nav">
        <div className="nav-header">
          <span style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
            <FaUserMd size={32} style={{ color: "#1a237e" }} />
            <h1 style={{ margin: 0 }}>HealthCare AI - Doctor Portal</h1>
          </span>
          <p>Review and manage patient recommendations</p>
        </div>
        <div className="nav-tabs">
          <button className={`nav-tab ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => handleTabChange("dashboard")} disabled={loading}>
            Dashboard
          </button>
          <button className={`nav-tab ${activeTab === "pending" ? "active" : ""}`} onClick={() => handleTabChange("pending")} disabled={loading}>
            Pending Reviews
          </button>
          <button className={`nav-tab ${activeTab === "assigned" ? "active" : ""}`} onClick={() => handleTabChange("assigned")} disabled={loading}>
            My Assignments
          </button>
          <button className={`nav-tab ${activeTab === "patients" ? "active" : ""}`} onClick={() => handleTabChange("patients")} disabled={loading}>
            Patient Analysis
          </button>
        </div>
        <div className="nav-user" ref={userMenuRef}>
          <button className="user-profile-button" onClick={() => setShowUserMenu(!showUserMenu)}>
            <div className="user-avatar">{user?.fullName ? user.fullName.charAt(0).toUpperCase() : "D"}</div>
            <div className="user-info">
              <span className="user-name">Dr. {user?.fullName || "Doctor"}</span>
              <span className="user-role">{user?.specialization || "Medical Doctor"}</span>
            </div>
          </button>

          {showUserMenu && (
            <div className="user-dropdown">
              <div className="dropdown-header">
                <p className="user-fullname">Dr. {user?.fullName || "Doctor"}</p>
                <p className="user-email">{user?.email || "doctor@example.com"}</p>
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

      {/* Conditionally show content based on state */}
      {selectedRecommendation ? (
        renderRecommendationDetails()
      ) : (
        <main className="dashboard-main">
          {activeTab === "dashboard" && renderDashboard()}
          {(activeTab === "pending" || activeTab === "assigned") && renderRecommendationsList()}
          {activeTab === "patients" && renderPatientsList()}
          {activeTab === "profile" && renderProfile()}
        </main>
      )}
    </div>
  );
};

export default DoctorDashboard;
