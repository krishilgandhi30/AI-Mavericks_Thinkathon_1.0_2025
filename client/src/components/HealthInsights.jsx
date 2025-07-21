import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './HealthInsights.css';

const HealthInsights = ({ reportId }) => {
    const [insights, setInsights] = useState(null);
    const [personalizedRecommendations, setPersonalizedRecommendations] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('current');

    useEffect(() => {
        if (reportId) {
            fetchHealthInsights();
        }
        fetchPersonalizedRecommendations();
    }, [reportId]);

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

    const fetchPersonalizedRecommendations = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/ai-recommendations/personalized', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPersonalizedRecommendations(response.data);
        } catch (error) {
            console.error('Error fetching personalized recommendations:', error);
            // Don't set error for personalized recommendations as it's optional
        } finally {
            setLoading(false);
        }
    };

    const getHealthScoreColor = (score) => {
        if (score >= 80) return '#27ae60';
        if (score >= 60) return '#f39c12';
        return '#e74c3c';
    };

    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'increasing': return '📈';
            case 'decreasing': return '📉';
            case 'stable': return '➡️';
            default: return '❓';
        }
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

    const renderPersonalizedPlan = () => {
        if (!personalizedRecommendations) return <div>No personalized recommendations available</div>;

        const { trendAnalysis, recommendations } = personalizedRecommendations;

        return (
            <div className="personalized-plan">
                <div className="plan-header">
                    <h3>📊 Your Health Trends</h3>
                    <p>Based on {personalizedRecommendations.reportsAnalyzed} reports over {personalizedRecommendations.timeRange}</p>
                </div>

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

                <div className="plan-sections">
                    {recommendations.priorities?.length > 0 && (
                        <div className="plan-section priorities">
                            <h4>🎯 Health Priorities</h4>
                            <ul>
                                {recommendations.priorities.map((priority, index) => (
                                    <li key={index} className="priority-item">{priority}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="goals-grid">
                        {recommendations.shortTermGoals?.length > 0 && (
                            <div className="plan-section short-term">
                                <h4>📅 Short-term Goals (3 months)</h4>
                                <ul>
                                    {recommendations.shortTermGoals.map((goal, index) => (
                                        <li key={index}>{goal}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {recommendations.longTermGoals?.length > 0 && (
                            <div className="plan-section long-term">
                                <h4>🎯 Long-term Goals (1 year)</h4>
                                <ul>
                                    {recommendations.longTermGoals.map((goal, index) => (
                                        <li key={index}>{goal}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {recommendations.actionItems?.length > 0 && (
                        <div className="plan-section actions">
                            <h4>✅ Action Items</h4>
                            <div className="action-items">
                                {recommendations.actionItems.map((action, index) => (
                                    <div key={index} className="action-item">
                                        <input type="checkbox" id={`action-${index}`} />
                                        <label htmlFor={`action-${index}`}>{action}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {recommendations.successMetrics?.length > 0 && (
                        <div className="plan-section metrics">
                            <h4>📈 Success Metrics</h4>
                            <ul>
                                {recommendations.successMetrics.map((metric, index) => (
                                    <li key={index}>{metric}</li>
                                ))}
                            </ul>
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
            <div className="insights-tabs">
                <button 
                    className={`tab-button ${activeTab === 'current' ? 'active' : ''}`}
                    onClick={() => setActiveTab('current')}
                >
                    Current Report
                </button>
                <button 
                    className={`tab-button ${activeTab === 'personalized' ? 'active' : ''}`}
                    onClick={() => setActiveTab('personalized')}
                >
                    Personalized Plan
                </button>
            </div>

            <div className="insights-content">
                {activeTab === 'current' && renderCurrentInsights()}
                {activeTab === 'personalized' && renderPersonalizedPlan()}
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
