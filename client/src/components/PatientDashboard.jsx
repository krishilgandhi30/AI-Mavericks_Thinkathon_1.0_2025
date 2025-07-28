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
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportDetails, setReportDetails] = useState(null);
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState(null);
  const [loading, setLoading] = useState(userData ? false : true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [editProfile, setEditProfile] = useState(false);
  const [editForm, setEditForm] = useState({});
  // Add flags to prevent duplicate API calls
  const [dataFetched, setDataFetched] = useState({
    healthReports: false,
    personalizedRecommendations: false
  });
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
      setLoading(false);
    } else if (!user) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [userData]);

  // Fetch data only when needed for specific tabs
  useEffect(() => {
    if (user) {
      if ((activeTab === "reports" || activeTab === "dashboard") && !dataFetched.healthReports) {
        fetchHealthReports();
      }
      if (activeTab === "personalized-plan" && !dataFetched.personalizedRecommendations) {
        fetchPersonalizedRecommendations();
      }
    }
  }, [activeTab, user, dataFetched]);

  const fetchPersonalizedRecommendations = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get("http://localhost:5000/api/ai-recommendations/personalized", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPersonalizedRecommendations(response.data);
      setDataFetched(prev => ({ ...prev, personalizedRecommendations: true }));
    } catch (error) {
      console.error("Error fetching personalized recommendations:", error);
      // Demo data for development
      setPersonalizedRecommendations({
        reportsAnalyzed: 3,
        timeRange: "last 6 months",
        trendAnalysis: {
          glucose: { trend: "increasing", concern: true },
          cholesterol: { trend: "stable", concern: false },
          hemoglobin: { trend: "decreasing", concern: true }
        },
        recommendations: {
          priorities: ["Monitor blood glucose levels", "Increase iron intake", "Regular cardiovascular exercise"],
          shortTermGoals: ["Take prescribed medications daily", "Walk 30 minutes daily", "Follow diabetic diet plan"],
          longTermGoals: ["Achieve HbA1c below 7%", "Maintain healthy weight", "Regular health checkups"],
          actionItems: ["Schedule follow-up appointment", "Start meal planning", "Join diabetes education program"]
        }
      });
      setDataFetched(prev => ({ ...prev, personalizedRecommendations: true }));
    }
  };

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
      setUser(response.data);
      setLoading(false);
      
      // After user is fetched, fetch other data if not already fetched
      if (!dataFetched.healthReports) {
        fetchHealthReports();
      }
      if (!dataFetched.personalizedRecommendations) {
        fetchPersonalizedRecommendations();
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        // Demo user data for development
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
        
        // After demo user is set, fetch other data if not already fetched
        if (!dataFetched.healthReports) {
          fetchHealthReports();
        }
        if (!dataFetched.personalizedRecommendations) {
          fetchPersonalizedRecommendations();
        }
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
      setHealthReports(response.data.reports || []);
      setDataFetched(prev => ({ ...prev, healthReports: true }));
    } catch (error) {
      console.error("Error fetching health reports:", error);
      // Demo data for development
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
      setDataFetched(prev => ({ ...prev, healthReports: true }));
    }
  };

  const fetchReportDetails = async (reportId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      // Fetch the specific report details
      const response = await axios.get(`http://localhost:5000/api/health-reports/patient/reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const report = response.data.reports?.find(r => r._id === reportId);
      if (report) {
        setSelectedReport(report);
        setReportDetails(report);
      }

      // Try to fetch AI insights for this report
      try {
        const insightsResponse = await axios.get(`http://localhost:5000/api/ai-recommendations/insights/${reportId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReportDetails(prev => ({
          ...prev,
          aiInsights: insightsResponse.data.insights
        }));
      } catch (insightsError) {
        console.error("AI insights not available for this report:", insightsError);
      }

    } catch (error) {
      console.error("Error fetching report details:", error);
      // Use demo data if API fails
      const demoReport = {
        _id: reportId,
        reportType: "blood",
        createdAt: new Date().toISOString(),
        isAnalyzed: true,
        bloodMetrics: {
          glucose: { value: 120, unit: "mg/dL", normalRange: "70-99 mg/dL" },
          cholesterol: { value: 210, unit: "mg/dL", normalRange: "<200 mg/dL" },
          hemoglobin: { value: 14.2, unit: "g/dL", normalRange: "12-15 g/dL" }
        },
        patientNotes: "Feeling slightly tired lately, wanted to check my blood work.",
        recommendation: {
          reviewStatus: "approved",
          aiSuggestions: {
            healthScore: 75,
            urgencyLevel: "medium",
            treatmentPlan: {
              summary: "Glucose levels are slightly elevated, cholesterol is borderline high.",
              medications: [
                { name: "Metformin", dosage: "500mg", frequency: "Twice daily", notes: "Take with meals" }
              ],
              followUpTests: ["HbA1c test in 3 months", "Lipid panel in 6 weeks"]
            },
            lifestyleChanges: {
              diet: ["Reduce refined carbohydrates", "Increase fiber intake", "Mediterranean diet"],
              exercise: ["30 minutes moderate exercise daily", "Post-meal walks"],
              habits: ["7-8 hours sleep nightly", "Stress management"]
            },
            riskFactors: ["Pre-diabetic glucose levels", "Borderline high cholesterol"],
            preventiveRecommendations: ["Annual diabetes screening", "Regular lipid monitoring"]
          },
          finalRecommendations: {
            treatmentPlan: {
              summary: "Monitor glucose levels and implement lifestyle changes.",
              medications: [{ name: "Metformin", dosage: "500mg", frequency: "Twice daily" }]
            },
            lifestyleChanges: {
              diet: ["Low glycemic diet", "Reduce sugar intake"],
              exercise: ["Regular cardio exercise"]
            }
          },
          doctorId: { fullName: "Dr. Sarah Johnson", specialization: "Endocrinology" },
          doctorNotes: "Patient shows early signs of insulin resistance. Lifestyle modifications should be implemented immediately."
        }
      };
      setSelectedReport(demoReport);
      setReportDetails(demoReport);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Function to refresh data (useful after uploads or updates)
  const refreshData = () => {
    setDataFetched({
      healthReports: false,
      personalizedRecommendations: false
    });
    fetchHealthReports();
    fetchPersonalizedRecommendations();
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
                  <span className={`status-badge ${getStatusBadge(report.recommendation?.reviewStatus)}`}>
                    {!report.recommendation?.reviewStatus ? "PENDING" :
                     report.recommendation.reviewStatus === "pending" ? "DOCTOR WILL BE ASSIGNED SHORTLY" :
                     report.recommendation.reviewStatus === "under_review" ? `UNDER REVIEW BY ${report.recommendation.doctorId?.fullName || 'DOCTOR'}` :
                     report.recommendation.reviewStatus.replace("_", " ").toUpperCase()}
                  </span>
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
              <span className={`status-badge ${getStatusBadge(report.recommendation?.reviewStatus)}`}>
                {!report.recommendation?.reviewStatus ? "PENDING" :
                 report.recommendation.reviewStatus === "pending" ? "DOCTOR WILL BE ASSIGNED SHORTLY" :
                 report.recommendation.reviewStatus === "under_review" ? `UNDER REVIEW BY ${report.recommendation.doctorId?.fullName || 'DOCTOR'}` :
                 report.recommendation.reviewStatus.replace("_", " ").toUpperCase()}
              </span>
            </div>

            <div className="report-details">
              <p>
                <strong>Uploaded:</strong> {new Date(report.createdAt).toLocaleDateString()}
              </p>
              {report.recommendation?.doctorId && (
                <p>
                  <strong>Reviewed by:</strong> Dr. {report.recommendation.doctorId.fullName}
                </p>
              )}
            </div>

            <div className="report-actions">
              <button
                className="btn-details"
                onClick={() => {
                  fetchReportDetails(report._id);
                  setActiveTab("report-detail");
                }}
              >
                📋 View Details
              </button>
            </div>

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
      // Reset dataFetched state to allow refetching with updated profile
      setDataFetched({
        healthReports: false,
        personalizedRecommendations: false
      });
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
                <span>{user?.dateOfBirth ? Math.floor((new Date() - new Date(user.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))  : "Not specified"}</span>
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

  const renderReportDetail = () => {
    if (!reportDetails) {
      return (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading report details...</p>
        </div>
      );
    }

    return (
      <div className="report-detail-content">
        <div className="report-detail-header">
          <button 
            className="back-button"
            onClick={() => setActiveTab("reports")}
          >
            ← Back to Reports
          </button>
          <h2>Report Details</h2>
        </div>

        <div className="report-detail-grid">
          {/* Report Information Section */}
          <div className="detail-section report-info-section">
            <h3>📋 Report Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Report Type:</label>
                <span className={`report-type-badge ${reportDetails.reportType}`}>
                  {reportDetails.reportType?.toUpperCase()}
                </span>
              </div>
              <div className="info-item">
                <label>Upload Date: </label>
                <span>{new Date(reportDetails.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="info-item">
                <label>Status: </label>
                <span className={`status-badge ${getStatusBadge(reportDetails.recommendation?.reviewStatus)}`}>
                  {!reportDetails.recommendation?.reviewStatus ? "PENDING" :
                   reportDetails.recommendation.reviewStatus === "pending" ? "DOCTOR WILL BE ASSIGNED SHORTLY" :
                   reportDetails.recommendation.reviewStatus === "under_review" ? `UNDER REVIEW BY ${reportDetails.recommendation.doctorId?.fullName || 'DOCTOR'}` :
                   reportDetails.recommendation.reviewStatus.replace("_", " ").toUpperCase()}
                </span>
              </div>
              {reportDetails.recommendation?.doctorId && (
                <div className="info-item">
                  <label>Reviewed by:</label>
                  <span> Dr. {reportDetails.recommendation.doctorId.fullName}</span>
                </div>
              )}
            </div>
            
            {reportDetails.patientNotes && (
              <div className="patient-notes">
                <label>Your Notes:</label>
                <p>{reportDetails.patientNotes}</p>
              </div>
            )}
          </div>

          {/* Lab Results Section */}
          <div className="detail-section lab-results-section">
            <h3>🧪 Lab Results</h3>
            {reportDetails.reportType === 'blood' && reportDetails.bloodMetrics && (
              <div className="metrics-grid">
                {Object.entries(reportDetails.bloodMetrics).map(([key, metric]) => (
                  metric.value && (
                    <div key={key} className="metric-item">
                      <label>{key.charAt(0).toUpperCase() + key.slice(1)}:</label>
                      <div className="metric-value">
                        <span className="value">{metric.value} {metric.unit}</span>
                        <span className="normal-range">Normal: {metric.normalRange}</span>
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
            
            {reportDetails.reportType === 'urine' && reportDetails.urineMetrics && (
              <div className="metrics-grid">
                {Object.entries(reportDetails.urineMetrics).map(([key, metric]) => (
                  metric.value && (
                    <div key={key} className="metric-item">
                      <label>{key.charAt(0).toUpperCase() + key.slice(1)}:</label>
                      <div className="metric-value">
                        <span className="value">{metric.value}</span>
                        <span className="normal-range">Normal: {metric.normalRange}</span>
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>

          {/* AI Analysis Section - Only show if approved */}
          {reportDetails.recommendation?.reviewStatus === "approved" && reportDetails.recommendation?.aiSuggestions && (
            <div className="detail-section ai-analysis-section">
              <h3>🤖 AI Analysis</h3>
              <div className="ai-summary">
                {reportDetails.recommendation.aiSuggestions.healthScore && (
                  <div className="health-score-summary">
                    <label>Health Score:</label>
                    <div className="score-display">
                      <span className="score">{reportDetails.recommendation.aiSuggestions.healthScore}/100</span>
                      <span className={`urgency ${reportDetails.recommendation.aiSuggestions.urgencyLevel}`}>
                        {reportDetails.recommendation.aiSuggestions.urgencyLevel?.toUpperCase()} PRIORITY
                      </span>
                    </div>
                  </div>
                )}
                
                {reportDetails.recommendation.aiSuggestions.riskFactors?.length > 0 && (
                  <div className="risk-factors-summary">
                    <label>Risk Factors Identified:</label>
                    <ul>
                      {reportDetails.recommendation.aiSuggestions.riskFactors.map((risk, index) => (
                        <li key={index}>{risk}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Doctor Recommendations Section - Only show if approved */}
          {reportDetails.recommendation?.reviewStatus === "approved" && reportDetails.recommendation?.finalRecommendations && (
            <div className="detail-section doctor-recommendations-section">
              <h3>👨‍⚕️ Doctor Recommendations</h3>
              
              {reportDetails.recommendation.finalRecommendations.treatmentPlan && (
                <div className="treatment-plan">
                  <h4>Treatment Plan</h4>
                  <p>{reportDetails.recommendation.finalRecommendations.treatmentPlan.summary}</p>
                  
                  {reportDetails.recommendation.finalRecommendations.treatmentPlan.medications?.length > 0 && (
                    <div className="medications-list">
                      <h5>Prescribed Medications:</h5>
                      {reportDetails.recommendation.finalRecommendations.treatmentPlan.medications.map((med, index) => (
                        <div key={index} className="medication-card">
                          <div className="med-header">
                            <strong>{med.name}</strong>
                            <span className="dosage">{med.dosage}</span>
                          </div>
                          <div className="med-details">
                            <span>Frequency: {med.frequency}</span>
                            {med.notes && <span className="notes">Notes: {med.notes}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {reportDetails.recommendation.finalRecommendations.lifestyleChanges && (
                <div className="lifestyle-recommendations">
                  <h4>Lifestyle Recommendations</h4>
                  {reportDetails.recommendation.finalRecommendations.lifestyleChanges.diet?.length > 0 && (
                    <div className="lifestyle-category">
                      <h5>🥗 Diet:</h5>
                      <ul>
                        {reportDetails.recommendation.finalRecommendations.lifestyleChanges.diet.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {reportDetails.recommendation.finalRecommendations.lifestyleChanges.exercise?.length > 0 && (
                    <div className="lifestyle-category">
                      <h5>💪 Exercise:</h5>
                      <ul>
                        {reportDetails.recommendation.finalRecommendations.lifestyleChanges.exercise.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {reportDetails.recommendation.doctorNotes && (
                <div className="doctor-notes">
                  <h4>Doctor's Notes</h4>
                  <p>{reportDetails.recommendation.doctorNotes}</p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons - Only show if approved */}
          {reportDetails.recommendation?.reviewStatus === "approved" && (
            <div className="detail-section actions-section">
              <h3>Actions</h3>
              <div className="action-buttons">
                <button 
                  className="btn-insights"
                  onClick={() => {
                    setSelectedReportId(reportDetails._id);
                    setActiveTab("insights");
                  }}
                >
                  🤖 View Detailed AI Insights
                </button>
                <button 
                  className="btn-secondary"
                  onClick={() => window.print()}
                >
                  🖨️ Print Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing': return '📈';
      case 'decreasing': return '📉';
      case 'stable': return '➡️';
      default: return '❓';
    }
  };

  const renderPersonalizedPlan = () => {
    if (!personalizedRecommendations) {
      return (
        <div className="personalized-plan-content">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading your personalized health plan...</p>
          </div>
        </div>
      );
    }

    const { trendAnalysis, recommendations } = personalizedRecommendations;

    return (
      <div className="personalized-plan-content">
        <div className="plan-header">
          <h2>📊 Your Personalized Health Plan</h2>
          <p>Based on {personalizedRecommendations.reportsAnalyzed} reports over {personalizedRecommendations.timeRange}</p>
        </div>

        {/* Health Trends Section */}
        <div className="detail-section trends-section">
          <h3>📈 Health Trends Analysis</h3>
          <div className="trends-grid">
            {Object.entries(trendAnalysis).filter(([key]) => key !== 'overallHealthTrend').map(([metric, data]) => (
              <div key={metric} className={`trend-card ${data.concern ? 'concern' : ''}`}>
                <div className="trend-header">
                  <span className="trend-icon">{getTrendIcon(data.trend)}</span>
                  <h4>{metric.charAt(0).toUpperCase() + metric.slice(1)}</h4>
                </div>
                <div className="trend-info">
                  <span className={`trend-status ${data.trend}`}>
                    {data.trend.charAt(0).toUpperCase() + data.trend.slice(1)}
                  </span>
                  {data.concern && <span className="concern-badge">⚠️ Needs Attention</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Health Priorities Section */}
        {recommendations.priorities?.length > 0 && (
          <div className="detail-section priorities-section">
            <h3>🎯 Your Health Priorities</h3>
            <div className="priorities-list">
              {recommendations.priorities.map((priority, index) => (
                <div key={index} className="priority-item">
                  <span className="priority-number">{index + 1}</span>
                  <span className="priority-text">{priority}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Goals Section */}
        <div className="goals-grid">
          {recommendations.shortTermGoals?.length > 0 && (
            <div className="detail-section short-term-goals">
              <h3>📅 Short-term Goals (3 months)</h3>
              <ul className="goals-list">
                {recommendations.shortTermGoals.map((goal, index) => (
                  <li key={index} className="goal-item">{goal}</li>
                ))}
              </ul>
            </div>
          )}

          {recommendations.longTermGoals?.length > 0 && (
            <div className="detail-section long-term-goals">
              <h3>🎯 Long-term Goals (1 year)</h3>
              <ul className="goals-list">
                {recommendations.longTermGoals.map((goal, index) => (
                  <li key={index} className="goal-item">{goal}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Action Items Section */}
        {recommendations.actionItems?.length > 0 && (
          <div className="detail-section actions-plan-section">
            <h3>✅ Action Items</h3>
            <div className="action-items-grid">
              {recommendations.actionItems.map((action, index) => (
                <div key={index} className="action-item-card">
                  <input type="checkbox" id={`action-${index}`} className="action-checkbox" />
                  <label htmlFor={`action-${index}`} className="action-label">{action}</label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Success Metrics Section */}
        {recommendations.successMetrics?.length > 0 && (
          <div className="detail-section metrics-section">
            <h3>📈 Success Metrics to Track</h3>
            <div className="metrics-list">
              {recommendations.successMetrics.map((metric, index) => (
                <div key={index} className="metric-item">
                  <span className="metric-icon">📊</span>
                  <span className="metric-text">{metric}</span>
                </div>
              ))}
            </div>
          </div>
        )}
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
          <button className={`nav-tab ${activeTab === "personalized-plan" ? "active" : ""}`} onClick={() => setActiveTab("personalized-plan")}>
            My Health Plan
          </button>
          <button className={`nav-tab ${activeTab === "reports" ? "active" : ""}`} onClick={() => setActiveTab("reports")}>
            My Reports
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
        {activeTab === "upload" ? <HealthReportUpload onUploadSuccess={refreshData} /> : null}
        {activeTab === "reports" ? renderReports() : null}
        {activeTab === "report-detail" ? renderReportDetail() : null}
        {activeTab === "personalized-plan" ? renderPersonalizedPlan() : null}
        {activeTab === "insights" ? (
          <HealthInsights 
            reportId={selectedReportId} 
            onBack={() => setActiveTab("reports")}
          />
        ) : null}
        {activeTab === "profile" ? renderProfile() : null}
      </main>
    </div>
  );
};

export default PatientDashboard;
