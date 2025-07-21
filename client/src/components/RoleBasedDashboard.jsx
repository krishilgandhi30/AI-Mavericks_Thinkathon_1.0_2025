import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PatientDashboard from './PatientDashboard';
import DoctorDashboard from './DoctorDashboard';

const RoleBasedDashboard = () => {
	const [userRole, setUserRole] = useState(null);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		checkUserRole();
	}, []);

	const checkUserRole = async () => {
		try {
			const token = localStorage.getItem('token');
			if (!token) {
				navigate('/login');
				return;
			}

			const response = await axios.get('http://localhost:3334/api/users/profile', {
				headers: { Authorization: `Bearer ${token}` }
			});

			const user = response.data;
			setUserRole(user.role);
			setLoading(false);

		} catch (error) {
			console.error('Error fetching user role:', error);
			if (error.response?.status === 401) {
				localStorage.removeItem('token');
				navigate('/login');
			} else {
				// For demo purposes, default to patient role
				setUserRole('patient');
				setLoading(false);
			}
		}
	};

	if (loading) {
		return (
			<div className="loading-container">
				<div className="loading-content">
					<div className="spinner"></div>
					<p className="loading-text">Loading dashboard...</p>
				</div>
			</div>
		);
	}

	// Route based on user role
	if (userRole === 'doctor') {
		return <DoctorDashboard />;
	}

	// Default to regular PatientDashboard for patients
	return <PatientDashboard />;
};

export default RoleBasedDashboard;
