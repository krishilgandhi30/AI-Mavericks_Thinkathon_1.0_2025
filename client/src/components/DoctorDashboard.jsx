import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './DoctorDashboard.css';
import { FaUserMd } from 'react-icons/fa';
import api from '../utils/api.constant';
import axios from 'axios';

const DoctorDashboard = ({ userData }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState({});
    const [recommendations, setRecommendations] = useState([]);
    const [selectedRecommendation, setSelectedRecommendation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [editProfile, setEditProfile] = useState(false);
    const [editForm, setEditForm] = useState(null);
    const navigate = useNavigate();
    const userMenuRef = useRef(null);
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
  // If userData is provided as prop, use it instead of fetching
  if (userData) {
    setUser(userData);
    fetchDashboardStats();
  } else if (!user) {
    // Only fetch if no userData prop and user is not already loaded
    fetchUserData();
    fetchDashboardStats();
  }
}, [userData, user]); // Depend on both userData prop and user state

    // Fetch real profile from API
    const fetchUserData = async () => {
        try {
            // Check if we have a token before making the API call
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            
            // Use the same endpoint as RoleBasedDashboard
            const response = await axios.get('http://localhost:5000/api/users/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("Response from user data fetch:", response);
            
            setUser(response.data.user || response.data);
        } catch (error) {
            console.error('Error fetching user data:', error);
            localStorage.removeItem('token'); // Clear invalid token
            navigate('/login');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    // Prevent setting the same tab repeatedly
    const handleTabChange = (tab) => {
        if (activeTab !== tab && !loading) {
            setActiveTab(tab);
        }
    };

// Keep track of which tabs we've already fetched data for
const [fetchedTabs, setFetchedTabs] = useState(new Set());

useEffect(() => {
  // Only fetch if we haven't already fetched for this tab
  if (!fetchedTabs.has(activeTab)) {
    if (activeTab === 'pending') fetchPendingRecommendations();
    else if (activeTab === 'assigned') fetchAssignedRecommendations();
    else setRecommendations([]);
    
    // Mark this tab as fetched
    setFetchedTabs(prev => new Set([...prev, activeTab]));
  }
}, [activeTab, fetchedTabs]);

    const fetchDashboardStats = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            
            const response = await axios.get('http://localhost:5000/api/doctor-review/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            // Set default stats to prevent UI errors
            setStats({
                pendingReviews: 0,
                assignedToMe: 0,
                completedToday: 0,
                totalReviews: 0,
                recentActivity: []
            });
        }
    };

    const fetchPendingRecommendations = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            
            const response = await axios.get('http://localhost:5000/api/doctor-review/pending', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRecommendations(response.data.recommendations || []);
        } catch (error) {
            console.error('Error fetching pending recommendations:', error);
            setRecommendations([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchAssignedRecommendations = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            
            const response = await axios.get('http://localhost:5000/api/doctor-review/assigned', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRecommendations(response.data.recommendations || []);
        } catch (error) {
            console.error('Error fetching assigned recommendations:', error);
            setRecommendations([]);
        } finally {
            setLoading(false);
        }
    };

    const assignToSelf = async (recommendationId) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            
            await axios.post(`http://localhost:5000/api/health-reports/${recommendationId}/assign`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchPendingRecommendations();
            await fetchDashboardStats();
        } catch (error) {
            console.error('Error assigning recommendation:', error);
        } finally {
            setLoading(false);
        }
    };

    const openRecommendationDetails = async (recommendation) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            
            const response = await axios.get(`http://localhost:5000/api/doctor-review/${recommendation._id}`, {
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
            if (!token) return;
            
            await axios.post(`http://localhost:5000/api/doctor-review/${selectedRecommendation._id}/approve`, {
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
            if (!token) return;
            
            await axios.post(`http://localhost:5000/api/doctor-review/${selectedRecommendation._id}/request-modifications`, {
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

    // Add a loading spinner for recommendations
    const renderRecommendationsList = () => (
        <div className="recommendations-container">
            <h2>{activeTab === 'pending' ? 'Pending Reviews' : 'My Assignments'}</h2>
            {loading ? (
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <div>Loading recommendations...</div>
                </div>
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
                    {recommendations.length === 0 && !loading && (
                        <div className="empty-state">
                            <img src="/empty-state.svg" alt="No recommendations" style={{width: '120px', marginBottom: '1rem'}} />
                            <p>No recommendations found.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    const handleEditProfile = () => {
        setEditForm(user);
        setEditProfile(true);
    };
    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.put('/users/profile', editForm);
            setUser(response.data.user || response.data);
            setEditProfile(false);
        } catch (error) {
            alert('Failed to update profile');
        }
    };

    const renderProfile = () => {
        if (!user) return <div className="loading-spinner"><div className="spinner"></div><div>Loading profile...</div></div>;
        if (editProfile) {
            return (
                <div className="profile-section">
                    <form className="profile-edit-form" onSubmit={handleEditSubmit}>
                        <h2>Edit Profile</h2>
                        <div className="edit-grid">
                            <label>Full Name<input name="name" value={editForm.fullName} onChange={handleEditChange} /></label>
                            <label>Email<input name="email" value={editForm.email} onChange={handleEditChange} /></label>
                            <label>Specialization<input name="specialization" value={editForm.specialization} onChange={handleEditChange} /></label>
                            <label>License Number<input name="licenseNumber" value={editForm.licenseNumber} onChange={handleEditChange} /></label>
                            <label>Experience<input name="experience" value={editForm.yearsOfExperience} onChange={handleEditChange} /></label>
                            <label>Hospital/Clinic<input name="hospital" value={editForm.location} onChange={handleEditChange} /></label>
                        </div>
                        <div className="edit-actions">
                            <button type="submit" className="btn-save">Save</button>
                            <button type="button" className="btn-cancel" onClick={() => setEditProfile(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            );
        }
        return (
            <div className="profile-section">
                <div className="profile-header">
                    <div className="profile-avatar-large">
                        <FaUserMd size={48} style={{ color: '#fff' }} />
                    </div>
                    <div className="profile-header-info">
                        <h2>Dr. {user.fullName || 'Doctor'}</h2>
                        <span className="profile-role">{user.specialization || 'General Medicine'}</span>
                    </div>
                    <button className="btn-edit-profile" onClick={handleEditProfile}>Edit Profile</button>
                </div>
                <div className="profile-details-grid">
                    <div className="profile-detail-card">
                        <h4>Personal Info</h4>
                        <ul>
                            <li><strong>Full Name:</strong> {user.fullName}</li>
                            <li><strong>Email:</strong> {user.email}</li>
                            <li><strong>Specialization:</strong> {user.specialization}</li>
                            <li><strong>License No.:</strong> {user.licenseNumber}</li>
                            <li><strong>Experience:</strong> {user.yearsOfExperience} years</li>
                            <li><strong>Hospital/Clinic:</strong> {user.location}</li>
                        </ul>
                    </div>
                    <div className="profile-detail-card">
                        <h4>Account Info</h4>
                        <ul>
                            <li><strong>User ID:</strong> {user?._id ?? user?.id}</li>
                            <li><strong>Role:</strong> {user.role}</li>
                            <li><strong>Status:</strong> <span className="status-active">Active</span></li>
                            <li><strong>Member Since:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</li>
                        </ul>
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
                                                <li key={idx}>
                                                    {typeof med === 'string' ? med : (
                                                        <div>
                                                            <strong>{med.name}</strong> - {med.dosage}, {med.frequency}
                                                            {med.duration && <span> for {med.duration}</span>}
                                                            {med.notes && <div style={{fontSize: '0.9em', color: '#666', marginTop: '4px'}}>Note: {med.notes}</div>}
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

    // Navbar with user dropdown and animation
    return (
        <div className="doctor-dashboard">
            <nav className="dashboard-nav">
                <div className="nav-header">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                        <FaUserMd size={32} style={{ color: '#1a237e' }} />
                        <h1 style={{ margin: 0 }}>Doctor Dashboard</h1>
                    </span>
                    <p>Review and manage patient recommendations</p>
                </div>
                <div className="nav-tabs">
                    <button 
                        className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => handleTabChange('dashboard')}
                        disabled={loading}
                    >
                        Dashboard
                    </button>
                    <button 
                        className={`nav-tab ${activeTab === 'pending' ? 'active' : ''}`}
                        onClick={() => handleTabChange('pending')}
                        disabled={loading}
                    >
                        Pending Reviews
                    </button>
                    <button 
                        className={`nav-tab ${activeTab === 'assigned' ? 'active' : ''}`}
                        onClick={() => handleTabChange('assigned')}
                        disabled={loading}
                    >
                        My Assignments
                    </button>
                </div>
                <div className="nav-user" ref={userMenuRef}>
                    <div className="user-avatar" onClick={() => setShowUserMenu((v) => !v)}>
                        <span className="user-name">{user?.fullName || 'Doctor'}</span>
                        <svg className="dropdown-icon" width="16" height="16" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
                    </div>
                    {showUserMenu && (
                        <div className="user-dropdown animated-dropdown">
                            <button onClick={() => { setActiveTab('profile'); setShowUserMenu(false); }}>Profile</button>
                            <button onClick={handleLogout}>Logout</button>
                        </div>
                    )}
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
