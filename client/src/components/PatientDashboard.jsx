import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import HealthReportUpload from './HealthReportUpload';
import './PatientDashboard.css';

const PatientDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [user, setUser] = useState(null);
    const [healthReports, setHealthReports] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserData();
        if (activeTab === 'reports') {
            fetchHealthReports();
        }
    }, [activeTab]);

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            
            const response = await axios.get('http://localhost:3334/api/users/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(response.data);
        } catch (error) {
            console.error('Error fetching user data:', error);
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                // Demo user data
                setUser({
                    _id: 'demo-patient',
                    fullName: 'John Doe',
                    username: 'johndoe',
                    email: 'john@example.com',
                    role: 'patient',
                    gender: 'male',
                    dateOfBirth: '1990-01-01'
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchHealthReports = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3334/api/health-reports/patient/reports', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHealthReports(response.data.reports);
        } catch (error) {
            console.error('Error fetching health reports:', error);
            // Demo data
            setHealthReports([
                {
                    _id: 'report1',
                    reportType: 'blood',
                    createdAt: new Date().toISOString(),
                    isAnalyzed: true,
                    recommendation: {
                        reviewStatus: 'approved',
                        finalRecommendations: {
                            treatmentPlan: {
                                summary: 'Your blood glucose levels are slightly elevated. Consider dietary changes and regular monitoring.',
                                medications: [
                                    { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' }
                                ]
                            },
                            lifestyleChanges: {
                                summary: 'Lifestyle modifications recommended',
                                diet: ['Reduce sugar intake', 'Increase fiber'],
                                exercise: ['30 minutes daily walking']
                            }
                        },
                        doctorId: { fullName: 'Dr. Smith', specialization: 'Endocrinology' }
                    }
                }
            ]);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const getStatusBadge = (status) => {
        const statusClasses = {
            'pending': 'status-pending',
            'under_review': 'status-review',
            'approved': 'status-approved',
            'rejected': 'status-rejected'
        };
        return statusClasses[status] || 'status-pending';
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
                        <h3>{healthReports.filter(r => r.isAnalyzed).length}</h3>
                        <p>AI Analyses</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">👨‍⚕️</div>
                    <div className="stat-content">
                        <h3>{healthReports.filter(r => r.recommendation?.reviewStatus === 'approved').length}</h3>
                        <p>Doctor Approved</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">⚡</div>
                    <div className="stat-content">
                        <h3>0</h3>
                        <p>Active Treatments</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-cards">
                <div className="action-card">
                    <h3>Upload New Report</h3>
                    <p>Upload your latest blood or urine test results to get AI-powered health recommendations.</p>
                    <button 
                        className="btn-primary"
                        onClick={() => setActiveTab('upload')}
                    >
                        Upload Report
                    </button>
                </div>

                <div className="recent-reports">
                    <h3>Recent Reports</h3>
                    {healthReports.length > 0 ? (
                        <div className="report-list">
                            {healthReports.slice(0, 3).map(report => (
                                <div key={report._id} className="report-item">
                                    <div className="report-info">
                                        <span className="report-type">{report.reportType.toUpperCase()}</span>
                                        <span className="report-date">
                                            {new Date(report.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <span className={`status-badge ${getStatusBadge(report.recommendation?.reviewStatus)}`}>
                                        {report.recommendation?.reviewStatus?.replace('_', ' ').toUpperCase() || 'PENDING'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="empty-state">No reports uploaded yet. Upload your first report to get started!</p>
                    )}
                    <button 
                        className="btn-secondary"
                        onClick={() => setActiveTab('reports')}
                    >
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
                {healthReports.map(report => (
                    <div key={report._id} className="report-card">
                        <div className="report-header">
                            <div className="report-type-badge">{report.reportType.toUpperCase()}</div>
                            <span className={`status-badge ${getStatusBadge(report.recommendation?.reviewStatus)}`}>
                                {report.recommendation?.reviewStatus?.replace('_', ' ').toUpperCase() || 'PENDING'}
                            </span>
                        </div>
                        
                        <div className="report-details">
                            <p><strong>Uploaded:</strong> {new Date(report.createdAt).toLocaleDateString()}</p>
                            {report.recommendation?.doctorId && (
                                <p><strong>Reviewed by:</strong> {report.recommendation.doctorId.fullName}</p>
                            )}
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
                        <div className="empty-icon">📋</div>
                        <h3>No Reports Yet</h3>
                        <p>Upload your first health report to get AI-powered recommendations.</p>
                        <button 
                            className="btn-primary"
                            onClick={() => setActiveTab('upload')}
                        >
                            Upload First Report
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    const renderProfile = () => (
        <div className="profile-section">
            <div className="profile-header">
                <h2>Profile Information</h2>
                <p>Manage your personal information</p>
            </div>
            
            <div className="profile-content">
                <div className="profile-card">
                    <div className="profile-info">
                        <div className="info-group">
                            <label>Full Name</label>
                            <p>{user?.fullName || 'Not provided'}</p>
                        </div>
                        
                        <div className="info-group">
                            <label>Email</label>
                            <p>{user?.email || 'Not provided'}</p>
                        </div>
                        
                        <div className="info-group">
                            <label>Username</label>
                            <p>{user?.username || 'Not provided'}</p>
                        </div>
                        
                        <div className="info-group">
                            <label>Role</label>
                            <p className="role-badge">{user?.role || 'Patient'}</p>
                        </div>
                        
                        {user?.dateOfBirth && (
                            <div className="info-group">
                                <label>Date of Birth</label>
                                <p>{new Date(user.dateOfBirth).toLocaleDateString()}</p>
                            </div>
                        )}
                        
                        {user?.gender && (
                            <div className="info-group">
                                <label>Gender</label>
                                <p>{user.gender}</p>
                            </div>
                        )}
                        
                        {user?.location && (
                            <div className="info-group">
                                <label>Location</label>
                                <p>{user.location}</p>
                            </div>
                        )}
                        
                        {user?.medicalHistory && (
                            <div className="info-group">
                                <label>Medical History</label>
                                <p>{user.medicalHistory}</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="profile-actions">
                        <button className="btn-primary">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2"/>
                                <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            Edit Profile
                        </button>
                        
                        <button className="btn-secondary">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                                <circle cx="12" cy="16" r="1" stroke="currentColor" strokeWidth="2"/>
                                <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            Change Password
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

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
                    <button 
                        className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        Dashboard
                    </button>
                    <button 
                        className={`nav-tab ${activeTab === 'upload' ? 'active' : ''}`}
                        onClick={() => setActiveTab('upload')}
                    >
                        Upload Report
                    </button>
                    <button 
                        className={`nav-tab ${activeTab === 'reports' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reports')}
                    >
                        My Reports
                    </button>
                </div>
                <div className="nav-user">
                    <button 
                        className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        Profile
                    </button>
                    <span className="user-name">{user?.fullName}</span>
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
                {activeTab === 'upload' && <HealthReportUpload />}
                {activeTab === 'reports' && renderReports()}
                {activeTab === 'profile' && renderProfile()}
            </main>
        </div>
    );
};

export default PatientDashboard;
