import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './HealthInsights.css';

const HealthInsights = ({ reportId, onBack }) => {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('current');

    useEffect(() => {
        if (reportId) {
            fetchHealthInsights();
            fetchReportDetails();
        }
        setLoading(false);
    }, [reportId]);
    
    const [reportDetails, setReportDetails] = useState(null);

    const fetchHealthInsights = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/api/ai-recommendations/insights/${reportId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setInsights(response.data.insights);
        } catch (error) {
            console.error('Error fetching health insights:', error);
            setError('Failed to fetch health insights');
        }
    };
    
    const fetchReportDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/api/health-reports/${reportId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReportDetails(response.data);
        } catch (error) {
            console.error('Error fetching report details:', error);
            // Don't set error as this is supplementary information
        }
    };

    const getHealthScoreColor = (score) => {
        if (score >= 80) return '#27ae60';
        if (score >= 60) return '#f39c12';
        return '#e74c3c';
    };

    const renderCurrentInsights = () => {
        if (!insights) return <div>No current insights available</div>;

        return (
            <div className="current-insights">
                <div className="insights-header">
                    <div className="health-score-display">
                        <div 
                            className="score-circle-large"
                            style={{ background: `conic-gradient(${getHealthScoreColor(insights.healthScore)} ${insights.healthScore * 3.6}deg, #e0e0e0 0deg)` }}
                        >
                            <div className="score-inner">
                                <span className="score-value">{insights.healthScore}</span>
                                <span className="score-max">/100</span>
                            </div>
                        </div>
                        <div className="score-details">
                            <h3>Current Health Score</h3>
                            <p className={`urgency-${insights.urgencyLevel}`}>
                                {insights.urgencyLevel?.toUpperCase()} Priority
                            </p>
                        </div>
                    </div>
                </div>

                <div className="insights-grid">
                    {insights.treatmentPlan?.medications?.length > 0 && (
                        <div className="insight-card medications-card">
                            <h4>💊 Recommended Medications</h4>
                            <div className="medications-list">
                                {insights.treatmentPlan.medications.map((med, index) => (
                                    <div key={index} className="medication-item">
                                        <div className="med-name">{med.name}</div>
                                        <div className="med-info">{med.dosage} - {med.frequency}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {insights.riskFactors?.length > 0 && (
                        <div className="insight-card risk-card">
                            <h4>⚠️ Risk Factors</h4>
                            <ul>
                                {insights.riskFactors.map((risk, index) => (
                                    <li key={index}>{risk}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {insights.preventiveRecommendations?.length > 0 && (
                        <div className="insight-card preventive-card">
                            <h4>🛡️ Preventive Care</h4>
                            <ul>
                                {insights.preventiveRecommendations.map((rec, index) => (
                                    <li key={index}>{rec}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {insights.lifestyleChanges && (
                        <div className="insight-card lifestyle-card">
                            <h4>🏃‍♂️ Lifestyle Changes</h4>
                            <div className="lifestyle-sections">
                                {insights.lifestyleChanges.diet?.length > 0 && (
                                    <div className="lifestyle-section">
                                        <h5>Diet:</h5>
                                        <ul>
                                            {insights.lifestyleChanges.diet.slice(0, 3).map((item, index) => (
                                                <li key={index}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {insights.lifestyleChanges.exercise?.length > 0 && (
                                    <div className="lifestyle-section">
                                        <h5>Exercise:</h5>
                                        <ul>
                                            {insights.lifestyleChanges.exercise.slice(0, 2).map((item, index) => (
                                                <li key={index}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderDoctorRecommendations = () => {
        if (!reportDetails || !reportDetails.recommendation) {
            return (
                <div className="doctor-recommendations empty">
                    <div className="empty-state">
                        <img src="/empty-state.svg" alt="No recommendations" style={{width: '120px', marginBottom: '1rem'}} />
                        <p>No doctor recommendations available yet.</p>
                        <p className="sub-text">A healthcare professional will review your report soon.</p>
                    </div>
                </div>
            );
        }

        const { recommendation } = reportDetails;
        const doctorApproved = recommendation.reviewStatus === 'approved';
        
        return (
            <div className="doctor-recommendations">
                <div className="doctor-header">
                    <div className="doctor-info">
                        <h3>{doctorApproved ? 'Doctor Approved Recommendations' : 'AI Generated Recommendations'}</h3>
                        {doctorApproved && recommendation.doctorId && (
                            <p className="reviewed-by">Reviewed by: Dr. {recommendation.doctorId.fullName} ({recommendation.doctorId.specialization})</p>
                        )}
                        {doctorApproved && recommendation.approvedAt && (
                            <p className="review-date">Approved on: {new Date(recommendation.approvedAt).toLocaleDateString()}</p>
                        )}
                    </div>
                    <div className="status-badge">
                        <span className={`status ${recommendation.reviewStatus}`}>
                            {recommendation.reviewStatus === 'approved' ? 'APPROVED' : 
                             recommendation.reviewStatus === 'rejected' ? 'REJECTED' : 
                             recommendation.reviewStatus === 'under_review' ? 'UNDER REVIEW' : 'PENDING'}
                        </span>
                    </div>
                </div>

                <div className="recommendations-content">
                    {/* Treatment Plan */}
                    {(doctorApproved ? recommendation.finalRecommendations?.treatmentPlan : recommendation.aiSuggestions?.treatmentPlan) && (
                        <div className="recommendation-section treatment-plan">
                            <h4>Treatment Plan</h4>
                            <p className="summary">
                                {doctorApproved 
                                    ? recommendation.finalRecommendations?.treatmentPlan?.summary 
                                    : recommendation.aiSuggestions?.treatmentPlan?.summary}
                            </p>
                            
                            {/* Medications */}
                            {(doctorApproved 
                                ? recommendation.finalRecommendations?.treatmentPlan?.medications?.length > 0
                                : recommendation.aiSuggestions?.treatmentPlan?.medications?.length > 0) && (
                                <div className="medications">
                                    <h5>Medications:</h5>
                                    <ul className="medication-list">
                                        {(doctorApproved 
                                            ? recommendation.finalRecommendations?.treatmentPlan?.medications
                                            : recommendation.aiSuggestions?.treatmentPlan?.medications).map((med, idx) => (
                                            <li key={idx} className="medication-item">
                                                {typeof med === 'string' ? med : (
                                                    <>
                                                        <strong>{med.name}</strong> - {med.dosage}, {med.frequency}
                                                        {med.duration && <span> for {med.duration}</span>}
                                                        {med.notes && <div className="med-notes">Note: {med.notes}</div>}
                                                    </>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Lifestyle Changes */}
                    {(doctorApproved ? recommendation.finalRecommendations?.lifestyleChanges : recommendation.aiSuggestions?.lifestyleChanges) && (
                        <div className="recommendation-section lifestyle-changes">
                            <h4>Lifestyle Changes</h4>
                            <p className="summary">
                                {doctorApproved 
                                    ? recommendation.finalRecommendations?.lifestyleChanges?.summary 
                                    : recommendation.aiSuggestions?.lifestyleChanges?.summary}
                            </p>
                            
                            {/* Diet */}
                            {(doctorApproved 
                                ? recommendation.finalRecommendations?.lifestyleChanges?.diet?.length > 0
                                : recommendation.aiSuggestions?.lifestyleChanges?.diet?.length > 0) && (
                                <div className="diet">
                                    <h5>Diet Recommendations:</h5>
                                    <ul>
                                        {(doctorApproved 
                                            ? recommendation.finalRecommendations?.lifestyleChanges?.diet
                                            : recommendation.aiSuggestions?.lifestyleChanges?.diet).map((item, idx) => (
                                            <li key={idx}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            {/* Exercise */}
                            {(doctorApproved 
                                ? recommendation.finalRecommendations?.lifestyleChanges?.exercise?.length > 0
                                : recommendation.aiSuggestions?.lifestyleChanges?.exercise?.length > 0) && (
                                <div className="exercise">
                                    <h5>Exercise Recommendations:</h5>
                                    <ul>
                                        {(doctorApproved 
                                            ? recommendation.finalRecommendations?.lifestyleChanges?.exercise
                                            : recommendation.aiSuggestions?.lifestyleChanges?.exercise).map((item, idx) => (
                                            <li key={idx}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Doctor Notes */}
                    {doctorApproved && recommendation.doctorNotes && (
                        <div className="recommendation-section doctor-notes">
                            <h4>Doctor's Notes</h4>
                            <div className="notes-content">
                                {recommendation.doctorNotes}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="health-insights loading">
                <div className="spinner"></div>
                <p>Generating AI health insights...</p>
            </div>
        );
    }

    return (
        <div className="health-insights">
            {/* Header with back button and navigation */}
            <div className="insights-header">
                <div className="insights-nav">
                    {onBack && (
                        <button className="back-button" onClick={onBack}>
                            ← Back to Reports
                        </button>
                    )}
                    <h2>AI Health Insights</h2>
                </div>
            </div>

            <div className="insights-tabs">
                <button 
                    className={`tab-button ${activeTab === 'current' ? 'active' : ''}`}
                    onClick={() => setActiveTab('current')}
                >
                    Current Report
                </button>
                <button 
                    className={`tab-button ${activeTab === 'doctor' ? 'active' : ''}`}
                    onClick={() => setActiveTab('doctor')}
                >
                    Doctor's Recommendations
                </button>
            </div>

            <div className="insights-content">
                {activeTab === 'current' && renderCurrentInsights()}
                {activeTab === 'doctor' && renderDoctorRecommendations()}
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}
        </div>
    );
};

export default HealthInsights;
