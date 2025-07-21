import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './DoctorDashboard_enhanced.css';
import { FaUserMd, FaRegUser, FaCog, FaSignOutAlt, FaClipboardList, FaChartBar, FaRegBell } from 'react-icons/fa';

const DoctorDashboard = ({ userData }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState({});
    const [recommendations, setRecommendations] = useState([]);
    const [selectedRecommendation, setSelectedRecommendation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(userData || null);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [editProfile, setEditProfile] = useState(false);
    const [editForm, setEditForm] = useState(null);
    const navigate = useNavigate();
    const userMenuRef = useRef(null);

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
            fetchDashboardStats();
        } else if (!user) {
            // Only fetch if no userData prop and user is not already loaded
            fetchUserData();
            fetchDashboardStats();
        }
    }, [userData, user]);

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            
            const response = await axios.get('http://localhost:5000/api/users/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setUser(response.data);
        } catch (error) {
            console.error('Error fetching user data:', error);
            localStorage.removeItem('token');
            navigate('/login');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
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
        } catch (error) {
            console.error('Error fetching recommendation details:', error);
        }
    };

    const handleEditProfile = () => {
        setEditForm({...user});
        setEditProfile(true);
        setShowUserMenu(false);
    };

    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            
            // Use the new API endpoint for updating user profile
            const response = await axios.put('http://localhost:5000/api/users/profile', editForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setUser(response.data);
            setEditProfile(false);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            if (error.response && error.response.data && error.response.data.message) {
                alert(`Failed to update profile: ${error.response.data.message}`);
            } else {
                alert('Failed to update profile. Please try again.');
            }
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
                            <li key={index}>
                                <div className="activity-icon">
                                    <FaClipboardList />
                                </div>
                                {activity}
                            </li>
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
                    {recommendations.length === 0 && (
                        <div className="empty-state">
                            <img src="/empty-state.svg" alt="No recommendations" />
                            <p>No recommendations found.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    const renderProfile = () => {
        if (!user) return <div className="loading-spinner"><div className="spinner"></div><div>Loading profile...</div></div>;
        
        if (editProfile) {
            return (
                <div className="profile-section">
                    <form className="profile-edit-form" onSubmit={handleEditSubmit}>
                        <h2>Edit Profile</h2>
                        <div className="edit-grid">
                            <label>
                                Full Name
                                <input name="fullName" value={editForm.fullName || ''} onChange={handleEditChange} />
                            </label>
                            <label>
                                Email
                                <input name="email" value={editForm.email || ''} onChange={handleEditChange} />
                            </label>
                            <label>
                                Specialization
                                <input name="specialization" value={editForm.specialization || ''} onChange={handleEditChange} />
                            </label>
                            <label>
                                License Number
                                <input name="licenseNumber" value={editForm.licenseNumber || ''} onChange={handleEditChange} />
                            </label>
                            <label>
                                Years of Experience
                                <input name="yearsOfExperience" type="number" value={editForm.yearsOfExperience || ''} onChange={handleEditChange} />
                            </label>
                            <label>
                                Hospital/Clinic
                                <input name="location" value={editForm.location || ''} onChange={handleEditChange} />
                            </label>
                        </div>
                        <div className="edit-actions">
                            <button type="submit" className="btn-save">Save Changes</button>
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
                        {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'D'}
                    </div>
                    <div className="profile-header-info">
                        <h2>{user.fullName || 'Doctor'}</h2>
                        <span className="profile-role">{user.specialization || 'Medical Doctor'}</span>
                    </div>
                    <button className="btn-edit-profile" onClick={handleEditProfile}>Edit Profile</button>
                </div>
                
                <div className="profile-details-grid">
                    <div className="profile-detail-card">
                        <h4>Personal Information</h4>
                        <ul>
                            <li>
                                <strong>Full Name</strong>
                                <span>{user.fullName || 'Not available'}</span>
                            </li>
                            <li>
                                <strong>Email</strong>
                                <span>{user.email || 'Not available'}</span>
                            </li>
                            <li>
                                <strong>Gender</strong>
                                <span>{user.gender || 'Not specified'}</span>
                            </li>
                            <li>
                                <strong>Specialization</strong>
                                <span>{user.specialization || 'Not specified'}</span>
                            </li>
                            <li>
                                <strong>License Number</strong>
                                <span>{user.licenseNumber || 'Not available'}</span>
                            </li>
                            <li>
                                <strong>Years of Experience</strong>
                                <span>{user.yearsOfExperience ? `${user.yearsOfExperience} years` : 'Not specified'}</span>
                            </li>
                            <li>
                                <strong>Hospital/Clinic</strong>
                                <span>{user.location || 'Not specified'}</span>
                            </li>
                        </ul>
                    </div>
                    
                    <div className="profile-detail-card">
                        <h4>Account Information</h4>
                        <ul>
                            <li>
                                <strong>User ID</strong>
                                <span>{user._id || 'Not available'}</span>
                            </li>
                            <li>
                                <strong>Username</strong>
                                <span>{user.username || 'Not available'}</span>
                            </li>
                            <li>
                                <strong>Role</strong>
                                <span>{user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Not specified'}</span>
                            </li>
                            <li>
                                <strong>Status</strong>
                                <span className="status-active">Active</span>
                            </li>
                            <li>
                                <strong>Member Since</strong>
                                <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not available'}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    };

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
                
                <div className="nav-user" ref={userMenuRef}>
                    <button 
                        className="user-profile-button"
                        onClick={() => setShowUserMenu(!showUserMenu)}
                    >
                        <div className="user-avatar">
                            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'D'}
                        </div>
                        <div className="user-info">
                            <span className="user-name">{user?.fullName || 'Doctor'}</span>
                            <span className="user-role">{user?.specialization || 'Medical Doctor'}</span>
                        </div>
                    </button>
                    
                    {showUserMenu && (
                        <div className="user-dropdown">
                            <div className="dropdown-header">
                                <p className="user-fullname">{user?.fullName || 'Doctor'}</p>
                                <p className="user-email">{user?.email || 'doctor@example.com'}</p>
                            </div>
                            <div className="dropdown-menu">
                                <button className="dropdown-item" onClick={() => {
                                    setActiveTab('profile');
                                    setShowUserMenu(false);
                                }}>
                                    <FaRegUser />
                                    My Profile
                                </button>
                                <button className="dropdown-item" onClick={handleEditProfile}>
                                    <FaCog />
                                    Account Settings
                                </button>
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
                {activeTab === 'dashboard' && renderDashboard()}
                {(activeTab === 'pending' || activeTab === 'assigned') && renderRecommendationsList()}
                {activeTab === 'profile' && renderProfile()}
            </main>
        </div>
    );
};

export default DoctorDashboard;