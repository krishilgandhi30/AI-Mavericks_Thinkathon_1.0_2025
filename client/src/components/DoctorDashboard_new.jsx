import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState({});
    const [recommendations, setRecommendations] = useState([]);
    const [selectedRecommendation, setSelectedRecommendation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const [reviewData, setReviewData] = useState({
        doctorNotes: '',
        doctorFeedbackToAI: '',
        modifications: {
            treatmentPlan: {
                medications: [],
                procedures: [],
                followUpTests: [],
                summary: ''
            },
            lifestyleChanges: {
                diet: [],
                exercise: [],
                habits: [],
                precautions: [],
                summary: ''
            }
        }
    });

    useEffect(() => {
        fetchDashboardStats();
        fetchPendingRecommendations();
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            // Demo data for now - replace with actual API call when available
            setUser({
                name: 'Dr. Sample Doctor',
                email: 'doctor@healthcare.com',
                role: 'Doctor',
                specialization: 'General Medicine',
                licenseNumber: 'MD-2023-1234',
                experience: '5 years',
                hospital: 'City General Hospital',
                id: 'DOC123456'
            });
        } catch (error) {
            console.error('Error fetching user data:', error);
            navigate('/login');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    useEffect(() => {
        if (activeTab === 'pending') {
            fetchPendingRecommendations();
        } else if (activeTab === 'assigned') {
            fetchAssignedRecommendations();
        }
    }, [activeTab]);

    const fetchDashboardStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3334/api/doctor-review/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        }
    };

    const fetchPendingRecommendations = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3334/api/doctor-review/pending', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRecommendations(response.data.recommendations || []);
        } catch (error) {
            console.error('Error fetching pending recommendations:', error);
        }
    };

    const fetchAssignedRecommendations = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3334/api/doctor-review/assigned', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRecommendations(response.data.recommendations || []);
        } catch (error) {
            console.error('Error fetching assigned recommendations:', error);
        }
    };

    const assignToSelf = async (recommendationId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:3334/api/health-reports/${recommendationId}/assign`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Refresh the list
            fetchPendingRecommendations();
            fetchDashboardStats();
        } catch (error) {
            console.error('Error assigning recommendation:', error);
        }
    };

    const openRecommendationDetails = async (recommendation) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:3334/api/doctor-review/${recommendation._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedRecommendation(response.data.recommendation);
            
            // Initialize review data with existing modifications if any
            const rec = response.data.recommendation;
            setReviewData({
                doctorNotes: rec.doctorNotes || '',
                doctorFeedbackToAI: rec.doctorFeedbackToAI || '',
                modifications: rec.doctorModifications || {
                    treatmentPlan: {
                        medications: [],
                        procedures: [],
                        followUpTests: [],
                        summary: ''
                    },
                    lifestyleChanges: {
                        diet: [],
                        exercise: [],
                        habits: [],
                        precautions: [],
                        summary: ''
                    }
                }
            });
        } catch (error) {
            console.error('Error fetching recommendation details:', error);
        }
    };

    const approveRecommendation = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:3334/api/doctor-review/${selectedRecommendation._id}/approve`, {
                finalRecommendations: {
                    treatmentPlan: reviewData.modifications.treatmentPlan,
                    lifestyleChanges: reviewData.modifications.lifestyleChanges
                },
                doctorNotes: reviewData.doctorNotes
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Recommendation approved successfully!');
            setSelectedRecommendation(null);
            fetchDashboardStats();
        } catch (error) {
            console.error('Error approving recommendation:', error);
            alert('Error approving recommendation');
        }
    };

    const requestModifications = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:3334/api/doctor-review/${selectedRecommendation._id}/request-modifications`, {
                feedbackToAI: reviewData.doctorFeedbackToAI,
                requestedChanges: reviewData.modifications
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Modification request sent successfully!');
            setSelectedRecommendation(null);
            fetchDashboardStats();
        } catch (error) {
            console.error('Error requesting modifications:', error);
            alert('Error requesting modifications');
        }
    };

    const renderDashboard = () => (
        <div className="dashboard-overview">
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Pending Reviews</h3>
                    <p className="stat-number">{stats.pendingReviews || 0}</p>
                </div>
                <div className="stat-card">
                    <h3>Assigned to Me</h3>
                    <p className="stat-number">{stats.assignedToMe || 0}</p>
                </div>
                <div className="stat-card">
                    <h3>Completed Today</h3>
                    <p className="stat-number">{stats.completedToday || 0}</p>
                </div>
                <div className="stat-card">
                    <h3>Total Reviews</h3>
                    <p className="stat-number">{stats.totalReviews || 0}</p>
                </div>
            </div>
            
            <div className="recent-activity">
                <h3>Recent Activity</h3>
                {stats.recentActivity && stats.recentActivity.length > 0 ? (
                    <ul>
                        {stats.recentActivity.map((activity, index) => (
                            <li key={index}>{activity}</li>
                        ))}
                    </ul>
                ) : (
                    <p>No recent activity</p>
                )}
            </div>
        </div>
    );

    const renderRecommendationsList = () => (
        <div className="recommendations-container">
            <h2>{activeTab === 'pending' ? 'Pending Reviews' : 'My Assignments'}</h2>
            
            {loading ? (
                <div className="loading">Loading recommendations...</div>
            ) : (
                <div className="recommendations-grid">
                    {recommendations.map((rec) => (
                        <div key={rec._id} className="recommendation-card">
                            <div className="card-header">
                                <h4>Patient: {rec.patientId?.fullName}</h4>
                                <span className={`status ${rec.reviewStatus}`}>
                                    {rec.reviewStatus.replace('_', ' ').toUpperCase()}
                                </span>
                            </div>
                            <div className="card-body">
                                <p><strong>Report Type:</strong> {rec.reportId?.reportType}</p>
                                <p><strong>Urgency:</strong> 
                                    <span className={`urgency ${rec.aiSuggestions?.urgencyLevel}`}>
                                        {rec.aiSuggestions?.urgencyLevel?.toUpperCase()}
                                    </span>
                                </p>
                                <p><strong>Created:</strong> {new Date(rec.createdAt).toLocaleDateString()}</p>
                                {rec.aiSuggestions?.riskFactors?.length > 0 && (
                                    <p><strong>Risk Factors:</strong> {rec.aiSuggestions.riskFactors.length} identified</p>
                                )}
                            </div>
                            <div className="card-actions">
                                {activeTab === 'pending' ? (
                                    <button 
                                        className="btn-assign"
                                        onClick={() => assignToSelf(rec._id)}
                                    >
                                        Assign to Me
                                    </button>
                                ) : (
                                    <button 
                                        className="btn-review"
                                        onClick={() => openRecommendationDetails(rec)}
                                    >
                                        Review
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {recommendations.length === 0 && (
                        <div className="empty-state">
                            <p>No recommendations found.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    const renderProfile = () => {
        return (
            <div className="profile-section">
                <div className="profile-header">
                    <h2>Doctor Profile</h2>
                    <button className="btn btn-secondary">Edit Profile</button>
                </div>
                
                <div className="profile-content">
                    <div className="profile-card">
                        <div className="profile-avatar">
                            <div className="avatar-placeholder">
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'D'}
                            </div>
                        </div>
                        <div className="profile-info">
                            <h3>{user?.name || 'Dr. Sample Doctor'}</h3>
                            <p className="profile-role">Medical Doctor</p>
                        </div>
                    </div>
                    
                    <div className="profile-details">
                        <div className="info-section">
                            <h4>Personal Information</h4>
                            <div className="info-grid">
                                <div className="info-group">
                                    <label>Full Name</label>
                                    <span>{user?.name || 'Dr. Sample Doctor'}</span>
                                </div>
                                <div className="info-group">
                                    <label>Email</label>
                                    <span>{user?.email || 'doctor@healthcare.com'}</span>
                                </div>
                                <div className="info-group">
                                    <label>Specialization</label>
                                    <span>{user?.specialization || 'General Medicine'}</span>
                                </div>
                                <div className="info-group">
                                    <label>License Number</label>
                                    <span>{user?.licenseNumber || 'MD-2023-1234'}</span>
                                </div>
                                <div className="info-group">
                                    <label>Years of Experience</label>
                                    <span>{user?.experience || '5 years'}</span>
                                </div>
                                <div className="info-group">
                                    <label>Hospital/Clinic</label>
                                    <span>{user?.hospital || 'City General Hospital'}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="info-section">
                            <h4>Account Information</h4>
                            <div className="info-grid">
                                <div className="info-group">
                                    <label>User ID</label>
                                    <span>{user?.id || 'DOC123456'}</span>
                                </div>
                                <div className="info-group">
                                    <label>Role</label>
                                    <span>{user?.role || 'Doctor'}</span>
                                </div>
                                <div className="info-group">
                                    <label>Status</label>
                                    <span className="status-active">Active</span>
                                </div>
                                <div className="info-group">
                                    <label>Member Since</label>
                                    <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'January 2023'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (selectedRecommendation) {
        return (
            <div className="doctor-dashboard">
                <div className="review-header">
                    <button 
                        className="back-btn"
                        onClick={() => setSelectedRecommendation(null)}
                    >
                        ← Back to Dashboard
                    </button>
                    <h2>Review Recommendation</h2>
                </div>

                <div className="review-content">
                    <div className="recommendation-details">
                        <h3>AI Recommendations</h3>
                        <div className="ai-recommendations">
                            <div className="treatment-plan">
                                <h4>Treatment Plan</h4>
                                <p><strong>Summary:</strong> {selectedRecommendation.aiSuggestions?.treatmentPlan?.summary}</p>
                                
                                {selectedRecommendation.aiSuggestions?.treatmentPlan?.medications?.length > 0 && (
                                    <div>
                                        <h5>Medications:</h5>
                                        <ul>
                                            {selectedRecommendation.aiSuggestions.treatmentPlan.medications.map((med, idx) => (
                                                <li key={idx}>{med}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <div className="lifestyle-changes">
                                <h4>Lifestyle Changes</h4>
                                <p><strong>Summary:</strong> {selectedRecommendation.aiSuggestions?.lifestyleChanges?.summary}</p>
                                
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
                            </div>
                        </div>
                    </div>

                    <div className="doctor-review-form">
                        <h3>Doctor Review</h3>
                        
                        <div className="form-group">
                            <label>Doctor Notes</label>
                            <textarea
                                value={reviewData.doctorNotes}
                                onChange={(e) => setReviewData({...reviewData, doctorNotes: e.target.value})}
                                placeholder="Add your professional notes here..."
                                rows="4"
                            />
                        </div>

                        <div className="form-group">
                            <label>Feedback to AI System</label>
                            <textarea
                                value={reviewData.doctorFeedbackToAI}
                                onChange={(e) => setReviewData({...reviewData, doctorFeedbackToAI: e.target.value})}
                                placeholder="Provide feedback to improve AI recommendations..."
                                rows="3"
                            />
                        </div>

                        <div className="review-actions">
                            <button 
                                className="btn-approve"
                                onClick={approveRecommendation}
                            >
                                Approve Recommendation
                            </button>
                            <button 
                                className="btn-modify"
                                onClick={requestModifications}
                            >
                                Request Modifications
                            </button>
                            <button 
                                className="btn-cancel"
                                onClick={() => setSelectedRecommendation(null)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="doctor-dashboard">
            <nav className="dashboard-nav">
                <div className="nav-header">
                    <h1>Doctor Dashboard</h1>
                    <p>Review and manage patient recommendations</p>
                </div>
                <div className="nav-tabs">
                    <button 
                        className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        Dashboard
                    </button>
                    <button 
                        className={`nav-tab ${activeTab === 'pending' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        Pending Reviews
                    </button>
                    <button 
                        className={`nav-tab ${activeTab === 'assigned' ? 'active' : ''}`}
                        onClick={() => setActiveTab('assigned')}
                    >
                        My Assignments
                    </button>
                </div>
                <div className="nav-user">
                    <button 
                        className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        Profile
                    </button>
                    <span className="user-name">Dr. {user?.name || 'Doctor'}</span>
                    <button onClick={handleLogout} className="logout-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2"/>
                            <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2"/>
                            <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        Logout
                    </button>
                </div>
            </nav>

            <main className="dashboard-main">
                {activeTab === 'dashboard' && renderDashboard()}
                {(activeTab === 'pending' || activeTab === 'assigned') && renderRecommendationsList()}
                {activeTab === 'profile' && renderProfile()}
            </main>
        </div>
    );
};

export default DoctorDashboard;
