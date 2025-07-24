import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./PatientAnalysis.css";

const PatientAnalysis = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [reminderForm, setReminderForm] = useState({
    subject: "",
    message: "",
    actionItems: [""],
  });
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [reminderSent, setReminderSent] = useState(false);

  useEffect(() => {
    fetchPatientAnalysis();
  }, [patientId]);

  const fetchPatientAnalysis = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(`http://localhost:5000/api/doctor/patients/${patientId}/analysis`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPatient(response.data.patient);
      setAnalysis(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching patient analysis:", error);
      setLoading(false);
    }
  };

  const handleReminderChange = (e) => {
    const { name, value } = e.target;
    setReminderForm({
      ...reminderForm,
      [name]: value,
    });
  };

  const handleActionItemChange = (index, value) => {
    const newActionItems = [...reminderForm.actionItems];
    newActionItems[index] = value;
    setReminderForm({
      ...reminderForm,
      actionItems: newActionItems,
    });
  };

  const addActionItem = () => {
    setReminderForm({
      ...reminderForm,
      actionItems: [...reminderForm.actionItems, ""],
    });
  };

  const removeActionItem = (index) => {
    const newActionItems = reminderForm.actionItems.filter((_, i) => i !== index);
    setReminderForm({
      ...reminderForm,
      actionItems: newActionItems,
    });
  };

  const sendReminder = async (e) => {
    e.preventDefault();
    try {
      setSendingReminder(true);
      const token = localStorage.getItem("token");

      // Filter out empty action items
      const filteredActionItems = reminderForm.actionItems.filter((item) => item.trim() !== "");

      await axios.post(
        `http://localhost:5000/api/doctor/patients/${patientId}/send-reminder`,
        {
          subject: reminderForm.subject,
          message: reminderForm.message,
          actionItems: filteredActionItems,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setReminderSent(true);
      setSendingReminder(false);

      // Reset form after 3 seconds
      setTimeout(() => {
        setReminderSent(false);
        setShowReminderForm(false);
        setReminderForm({
          subject: "",
          message: "",
          actionItems: [""],
        });
      }, 3000);
    } catch (error) {
      console.error("Error sending reminder:", error);
      setSendingReminder(false);
      alert("Failed to send reminder. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="patient-analysis-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading patient analysis...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="patient-analysis-container">
        <div className="error-message">
          <h3>Patient Not Found</h3>
          <p>The requested patient data could not be found.</p>
          <button onClick={() => navigate("/dashboard")} className="back-button">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-analysis-container">

      <div className="review-content">
        <div className="review-navigation">
          <button className="back-button" onClick={() => navigate("/dashboard")}>
            ← Back to Dashboard
          </button>
          <div className="review-title-section">
            <h2>Patient Health Analysis</h2>
          </div>
        </div>
      </div>

      <div className="review-content">
        {/* Patient Information */}
        <div className="patient-info-section">
          <h3>Patient Information</h3>
          <div className="patient-info-grid">
            <div className="info-item">
              <strong>Name:</strong> {patient?.name || "N/A"}
            </div>
            <div className="info-item">
              <strong>Gender:</strong> {patient?.gender || "N/A"}
            </div>
            <div className="info-item">
              <strong>Age:</strong> {patient?.age || "N/A"}
            </div>
            <div className="info-item">
              <strong>Blood Group:</strong> {patient?.bloodGroup || "N/A"}
            </div>
            <div className="info-item">
              <strong>Email:</strong> {patient?.email || "N/A"}
            </div>
          </div>
        </div>

        <div className="analysis-summary-card">
          <div className="summary-header">
            <h3>Analysis Summary</h3>
            <span className="time-range">Last {analysis.timeRange}</span>
          </div>
          <div className="summary-stats">
            <div className="stat-item">
              <div className="stat-value">{analysis.reportsCount}</div>
              <div className="stat-label">Reports Analyzed</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{analysis.recommendations?.length || 0}</div>
              <div className="stat-label">Recommendations</div>
            </div>
          </div>
        </div>

        <div className="recommendations-section">
          <h3>Health Recommendations</h3>
          {analysis.recommendations && analysis.recommendations.length > 0 ? (
            <div className="recommendations-list">
              {analysis.recommendations.map((rec, index) => (
                <div key={rec._id || index} className="recommendation-card">
                  <div className="recommendation-header">
                    <h4>Report from {new Date(rec.createdAt).toLocaleDateString()}</h4>
                    <span className={`status ${rec.reviewStatus}`}>{rec.reviewStatus.replace("_", " ").toUpperCase()}</span>
                  </div>
                  <div className="recommendation-body">
                    {rec.finalRecommendations ? (
                      <>
                        <p>
                          <strong>Treatment Summary:</strong> {rec.finalRecommendations.treatmentPlan?.summary || "No summary available"}
                        </p>
                        <p>
                          <strong>Lifestyle Summary:</strong> {rec.finalRecommendations.lifestyleChanges?.summary || "No summary available"}
                        </p>

                        {rec.finalRecommendations.riskFactors && rec.finalRecommendations.riskFactors.length > 0 && (
                          <div className="risk-factors">
                            <h5>Risk Factors:</h5>
                            <ul>
                              {rec.finalRecommendations.riskFactors.map((risk, i) => (
                                <li key={i}>{risk}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {rec.finalRecommendations.treatmentPlan?.followUpTests && rec.finalRecommendations.treatmentPlan.followUpTests.length > 0 && (
                          <div className="follow-up-tests">
                            <h5>Follow-up Tests:</h5>
                            <ul>
                              {rec.finalRecommendations.treatmentPlan.followUpTests.map((test, i) => (
                                <li key={i}>{test}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    ) : rec.aiSuggestions ? (
                      <>
                        <p>
                          <strong>Treatment Summary:</strong> {rec.aiSuggestions.treatmentPlan?.summary || "No summary available"}
                        </p>
                        <p>
                          <strong>Lifestyle Summary:</strong> {rec.aiSuggestions.lifestyleChanges?.summary || "No summary available"}
                        </p>

                        {rec.aiSuggestions.riskFactors && rec.aiSuggestions.riskFactors.length > 0 && (
                          <div className="risk-factors">
                            <h5>Risk Factors:</h5>
                            <ul>
                              {rec.aiSuggestions.riskFactors.map((risk, i) => (
                                <li key={i}>{risk}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    ) : (
                      <p>No recommendations available</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No recommendations available for this patient in the last 6 months.</p>
            </div>
          )}
        </div>

        <div className="action-buttons">
          <button className="btn-send-reminder" onClick={() => setShowReminderForm(!showReminderForm)}>
            {showReminderForm ? "Cancel" : "Send Reminder to Patient"}
          </button>
        </div>

        {showReminderForm && (
          <div className="reminder-form-container">
            <h3>Send Health Reminder</h3>
            <form onSubmit={sendReminder} className="reminder-form">
              <div className="form-group">
                <label>Subject</label>
                <input type="text" name="subject" value={reminderForm.subject} onChange={handleReminderChange} placeholder="Health Reminder" required />
              </div>

              <div className="form-group">
                <label>Message</label>
                <textarea name="message" value={reminderForm.message} onChange={handleReminderChange} placeholder="Enter your message to the patient..." rows="4" required></textarea>
              </div>

              <div className="form-group">
                <label>Action Items</label>
                {reminderForm.actionItems.map((item, index) => (
                  <div key={index} className="action-item-input">
                    <input type="text" value={item} onChange={(e) => handleActionItemChange(index, e.target.value)} placeholder="Action item" />
                    <button type="button" className="btn-remove-item" onClick={() => removeActionItem(index)}>
                      ✕
                    </button>
                  </div>
                ))}
                <button type="button" className="btn-add-item" onClick={addActionItem}>
                  + Add Action Item
                </button>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-submit-reminder" disabled={sendingReminder}>
                  {sendingReminder ? "Sending..." : "Send Reminder"}
                </button>
              </div>

              {reminderSent && <div className="success-message">Reminder sent successfully to {patient.email}!</div>}
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientAnalysis;
