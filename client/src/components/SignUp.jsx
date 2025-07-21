import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import './SignUp.css';

function SignUp() {
	const [formData, setFormData] = useState({
		username: "",
		fullName: "",
		email: "",
		password: "",
		confirmPassword: "",
		role: "patient",
		// Doctor specific fields
		specialization: "",
		licenseNumber: "",
		yearsOfExperience: "",
		// Patient specific fields
		dateOfBirth: "",
		gender: "other",
		medicalHistory: []
	});
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState({});
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [focusedField, setFocusedField] = useState(null);
	const [message, setMessage] = useState(null);
	const [error, setError] = useState(null);
	const navigate = useNavigate();

	const getPasswordStrength = (password) => {
		let score = 0;
		if (password.length >= 6) score++;
		if (password.length >= 8) score++;
		if (/[A-Z]/.test(password)) score++;
		if (/[0-9]/.test(password)) score++;
		if (/[^A-Za-z0-9]/.test(password)) score++;
		return score;
	};

	const getStrengthClass = (strength) => {
		if (strength <= 1) return 'strength-weak';
		if (strength <= 2) return 'strength-fair';
		if (strength <= 3) return 'strength-good';
		return 'strength-strong';
	};

	const getStrengthText = (strength) => {
		if (strength <= 1) return 'Weak';
		if (strength <= 2) return 'Fair';
		if (strength <= 3) return 'Good';
		return 'Strong';
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value
		}));
		// Clear error when user starts typing
		if (errors[name]) {
			setErrors(prev => ({
				...prev,
				[name]: ""
			}));
		}
		// Clear general error
		if (error) {
			setError(null);
		}
	};

	const validateForm = () => {
		const newErrors = {};

		if (!formData.fullName.trim()) {
			newErrors.fullName = "Full name is required";
		}

		if (!formData.username.trim()) {
			newErrors.username = "Username is required";
		} else if (formData.username.length < 3) {
			newErrors.username = "Username must be at least 3 characters";
		}

		if (!formData.email.trim()) {
			newErrors.email = "Email is required";
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email = "Email is invalid";
		}

		if (!formData.password) {
			newErrors.password = "Password is required";
		} else if (formData.password.length < 6) {
			newErrors.password = "Password must be at least 6 characters";
		}

		if (!formData.confirmPassword) {
			newErrors.confirmPassword = "Please confirm your password";
		} else if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = "Passwords do not match";
		}

		// Doctor-specific validation
		if (formData.role === 'doctor') {
			if (!formData.specialization) {
				newErrors.specialization = "Specialization is required for doctors";
			}
			if (!formData.licenseNumber) {
				newErrors.licenseNumber = "License number is required for doctors";
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const FormSubmit = async (e) => {
		e.preventDefault();
		
		if (!validateForm()) {
			return;
		}

		setLoading(true);
		setError(null);
		setMessage(null);

		try {
			const response = await axios.post("http://localhost:3334/api/auth/signup", {
				username: formData.username,
				fullName: formData.fullName,
				email: formData.email,
				password: formData.password,
				role: formData.role,
				// Doctor specific fields
				...(formData.role === 'doctor' && {
					specialization: formData.specialization,
					licenseNumber: formData.licenseNumber,
					yearsOfExperience: parseInt(formData.yearsOfExperience) || 0
				}),
				// Patient specific fields
				...(formData.role === 'patient' && {
					dateOfBirth: formData.dateOfBirth,
					gender: formData.gender,
					medicalHistory: formData.medicalHistory
				})
			});

			console.log("User created!", response.data);
			setMessage("Account created successfully! Redirecting to login...");
			setTimeout(() => {
				navigate("/login");
			}, 2000);
		} catch (err) {
			console.error("Signup error:", err);
			if (err.response && err.response.data && err.response.data.message) {
				setError(err.response.data.message);
			} else {
				setError("Something went wrong. Please try again.");
			}
		} finally {
			setLoading(false);
		}
	};

	const passwordStrength = getPasswordStrength(formData.password);

	return (
		<div className="signup-container">
			{/* Background Animation */}
			<div className="signup-bg">
				<div className="floating-shape shape-1"></div>
				<div className="floating-shape shape-2"></div>
				<div className="floating-shape shape-3"></div>
				<div className="floating-shape shape-4"></div>
			</div>

			<div className="signup-content">
				<div className="signup-card">
					{/* Header */}
					<div className="signup-header">
						<div className="signup-icon">
							<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="url(#gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
								<circle cx="8.5" cy="7" r="4" stroke="url(#gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
								<path d="M20 8V14" stroke="url(#gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
								<path d="M23 11H17" stroke="url(#gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
								<defs>
									<linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
										<stop offset="0%" stopColor="#667eea" />
										<stop offset="100%" stopColor="#764ba2" />
									</linearGradient>
								</defs>
							</svg>
						</div>
						<h1 className="signup-title">Join HealthCare AI</h1>
						<p className="signup-subtitle">
							Create your account and get personalized treatment recommendations validated by healthcare professionals.
						</p>
					</div>

					{/* Error Message */}
					{error && (
						<div className="alert alert-error">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
								<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
								<line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
								<line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
							</svg>
							{error}
						</div>
					)}

					{/* Success Message */}
					{message && (
						<div className="alert alert-success">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
								<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
								<path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2"/>
							</svg>
							{message}
						</div>
					)}

					{/* Features List */}
					<div className="features-list">
						<h4>What you'll get:</h4>
						<div className="feature-item">
							<svg viewBox="0 0 24 24" fill="none">
								<path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
								<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
							</svg>
							Connect with skilled professionals worldwide
						</div>
						<div className="feature-item">
							<svg viewBox="0 0 24 24" fill="none">
								<path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
								<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
							</svg>
							Exchange skills and learn new ones
						</div>
						<div className="feature-item">
							<svg viewBox="0 0 24 24" fill="none">
								<path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
								<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
							</svg>
							Build your professional network
						</div>
					</div>

					{/* Form */}
					<form className="signup-form" onSubmit={FormSubmit}>
						{/* First Row - Full Name and Username */}
						<div className="form-row">
							<div className="form-group">
								<label 
									className={`form-label ${focusedField === 'fullName' || formData.fullName ? 'focused' : ''}`}
								>
									Full Name
								</label>
								<div className="input-wrapper">
									<svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
										<path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2"/>
										<circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
									</svg>
									<input
										type="text"
										name="fullName"
										value={formData.fullName}
										onChange={handleChange}
										onFocus={() => setFocusedField('fullName')}
										onBlur={() => setFocusedField(null)}
										placeholder="Enter your full name"
										className={`form-input ${errors.fullName ? 'error' : ''} ${formData.fullName ? 'filled' : ''}`}
										required
									/>
								</div>
								{errors.fullName && (
									<p className="field-error">
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
											<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
											<line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
											<line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
										</svg>
										{errors.fullName}
									</p>
								)}
							</div>

							<div className="form-group">
								<label 
									className={`form-label ${focusedField === 'username' || formData.username ? 'focused' : ''}`}
								>
									Username
								</label>
								<div className="input-wrapper">
									<svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
										<path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2"/>
										<path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" strokeWidth="2"/>
									</svg>
									<input
										type="text"
										name="username"
										value={formData.username}
										onChange={handleChange}
										onFocus={() => setFocusedField('username')}
										onBlur={() => setFocusedField(null)}
										placeholder="Choose a username"
										className={`form-input ${errors.username ? 'error' : ''} ${formData.username ? 'filled' : ''}`}
										required
									/>
								</div>
								{errors.username && (
									<p className="field-error">
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
											<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
											<line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
											<line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
										</svg>
										{errors.username}
									</p>
								)}
							</div>
						</div>

						{/* Email Field */}
						<div className="form-group">
							<label 
								className={`form-label ${focusedField === 'email' || formData.email ? 'focused' : ''}`}
							>
								Email Address
							</label>
							<div className="input-wrapper">
								<svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
									<path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2"/>
									<polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/>
								</svg>
								<input
									type="email"
									name="email"
									value={formData.email}
									onChange={handleChange}
									onFocus={() => setFocusedField('email')}
									onBlur={() => setFocusedField(null)}
									placeholder="Enter your email"
									className={`form-input ${errors.email ? 'error' : ''} ${formData.email ? 'filled' : ''}`}
									required
								/>
							</div>
							{errors.email && (
								<p className="field-error">
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
										<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
										<line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
										<line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
									</svg>
									{errors.email}
								</p>
							)}
						</div>

						{/* Role Selection */}
						<div className="form-group">
							<label className="form-label">I am a</label>
							<div className="role-selection">
								<div className="role-option">
									<input
										type="radio"
										id="patient"
										name="role"
										value="patient"
										checked={formData.role === 'patient'}
										onChange={handleChange}
									/>
									<label htmlFor="patient" className="role-label">
										<div className="role-icon">
											<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
												<path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2"/>
												<circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
											</svg>
										</div>
										<div className="role-content">
											<h4>Patient</h4>
											<p>Get AI-generated health recommendations</p>
										</div>
									</label>
								</div>
								<div className="role-option">
									<input
										type="radio"
										id="doctor"
										name="role"
										value="doctor"
										checked={formData.role === 'doctor'}
										onChange={handleChange}
									/>
									<label htmlFor="doctor" className="role-label">
										<div className="role-icon">
											<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
												<path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" fill="none"/>
											</svg>
										</div>
										<div className="role-content">
											<h4>Doctor</h4>
											<p>Review and validate AI recommendations</p>
										</div>
									</label>
								</div>
							</div>
						</div>

						{/* Doctor-specific fields */}
						{formData.role === 'doctor' && (
							<>
								<div className="form-row">
									<div className="form-group">
										<label className={`form-label ${focusedField === 'specialization' || formData.specialization ? 'focused' : ''}`}>
											Specialization
										</label>
										<div className="input-wrapper">
											<svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
												<path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2"/>
											</svg>
											<select
												name="specialization"
												value={formData.specialization}
												onChange={handleChange}
												onFocus={() => setFocusedField('specialization')}
												onBlur={() => setFocusedField(null)}
												className={`form-input ${errors.specialization ? 'error' : ''} ${formData.specialization ? 'filled' : ''}`}
												required
											>
												<option value="">Select specialization</option>
												<option value="General Medicine">General Medicine</option>
												<option value="Cardiology">Cardiology</option>
												<option value="Endocrinology">Endocrinology</option>
												<option value="Nephrology">Nephrology</option>
												<option value="Hematology">Hematology</option>
												<option value="Other">Other</option>
											</select>
										</div>
										{errors.specialization && (
											<p className="field-error">
												<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
													<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
													<line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
													<line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
												</svg>
												{errors.specialization}
											</p>
										)}
									</div>

									<div className="form-group">
										<label className={`form-label ${focusedField === 'licenseNumber' || formData.licenseNumber ? 'focused' : ''}`}>
											License Number
										</label>
										<div className="input-wrapper">
											<svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
												<rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
												<line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
												<line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
												<line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
											</svg>
											<input
												type="text"
												name="licenseNumber"
												value={formData.licenseNumber}
												onChange={handleChange}
												onFocus={() => setFocusedField('licenseNumber')}
												onBlur={() => setFocusedField(null)}
												placeholder="Enter license number"
												className={`form-input ${errors.licenseNumber ? 'error' : ''} ${formData.licenseNumber ? 'filled' : ''}`}
												required
											/>
										</div>
										{errors.licenseNumber && (
											<p className="field-error">
												<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
													<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
													<line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
													<line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
												</svg>
												{errors.licenseNumber}
											</p>
										)}
									</div>
								</div>

								<div className="form-group">
									<label className={`form-label ${focusedField === 'yearsOfExperience' || formData.yearsOfExperience ? 'focused' : ''}`}>
										Years of Experience
									</label>
									<div className="input-wrapper">
										<svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
											<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
											<polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2"/>
										</svg>
										<input
											type="number"
											name="yearsOfExperience"
											value={formData.yearsOfExperience}
											onChange={handleChange}
											onFocus={() => setFocusedField('yearsOfExperience')}
											onBlur={() => setFocusedField(null)}
											placeholder="Years of experience"
											className={`form-input ${formData.yearsOfExperience ? 'filled' : ''}`}
											min="0"
											max="50"
										/>
									</div>
								</div>
							</>
						)}

						{/* Patient-specific fields */}
						{formData.role === 'patient' && (
							<div className="form-row">
								<div className="form-group">
									<label className={`form-label ${focusedField === 'dateOfBirth' || formData.dateOfBirth ? 'focused' : ''}`}>
										Date of Birth
									</label>
									<div className="input-wrapper">
										<svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
											<rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
											<line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
											<line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
											<line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
										</svg>
										<input
											type="date"
											name="dateOfBirth"
											value={formData.dateOfBirth}
											onChange={handleChange}
											onFocus={() => setFocusedField('dateOfBirth')}
											onBlur={() => setFocusedField(null)}
											className={`form-input ${formData.dateOfBirth ? 'filled' : ''}`}
										/>
									</div>
								</div>

								<div className="form-group">
									<label className={`form-label ${focusedField === 'gender' || formData.gender ? 'focused' : ''}`}>
										Gender
									</label>
									<div className="input-wrapper">
										<svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
											<circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
											<path d="M16 8V5a1 1 0 0 1 1-1h3M20 4l-4 4M8 16v3a1 1 0 0 1-1 1H4M4 20l4-4" stroke="currentColor" strokeWidth="2"/>
										</svg>
										<select
											name="gender"
											value={formData.gender}
											onChange={handleChange}
											onFocus={() => setFocusedField('gender')}
											onBlur={() => setFocusedField(null)}
											className={`form-input ${formData.gender ? 'filled' : ''}`}
										>
											<option value="other">Prefer not to say</option>
											<option value="male">Male</option>
											<option value="female">Female</option>
										</select>
									</div>
								</div>
							</div>
						)}

						{/* Password Field */}
						<div className="form-group">
							<label 
								className={`form-label ${focusedField === 'password' || formData.password ? 'focused' : ''}`}
							>
								Password
							</label>
							<div className="input-wrapper">
								<svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
									<rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
									<circle cx="12" cy="16" r="1" fill="currentColor"/>
									<path d="M7 11V7A5 5 0 0 1 17 7V11" stroke="currentColor" strokeWidth="2"/>
								</svg>
								<input
									type={showPassword ? "text" : "password"}
									name="password"
									value={formData.password}
									onChange={handleChange}
									onFocus={() => setFocusedField('password')}
									onBlur={() => setFocusedField(null)}
									placeholder="Create a password"
									className={`form-input ${errors.password ? 'error' : ''} ${formData.password ? 'filled' : ''}`}
									required
								/>
								<button
									type="button"
									className="password-toggle"
									onClick={() => setShowPassword(!showPassword)}
								>
									{showPassword ? (
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
											<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C7 20 2.73 16.39 1 12A18.45 18.45 0 0 1 5.06 5.06L17.94 17.94Z" stroke="currentColor" strokeWidth="2"/>
											<path d="M9.9 4.24A9.12 9.12 0 0 1 12 4C17 4 21.27 7.61 23 12A18.5 18.5 0 0 1 19.42 16.42" stroke="currentColor" strokeWidth="2"/>
											<path d="M1 1L23 23" stroke="currentColor" strokeWidth="2"/>
											<path d="M10.5 15.5A3 3 0 0 0 15.5 10.5" stroke="currentColor" strokeWidth="2"/>
										</svg>
									) : (
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
											<path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" strokeWidth="2"/>
											<circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
										</svg>
									)}
								</button>
							</div>
							{formData.password && (
								<div className="password-strength">
									<div>Password strength: <strong>{getStrengthText(passwordStrength)}</strong></div>
									<div className="strength-bar">
										<div className={`strength-fill ${getStrengthClass(passwordStrength)}`}></div>
									</div>
								</div>
							)}
							{errors.password && (
								<p className="field-error">
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
										<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
										<line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
										<line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
									</svg>
									{errors.password}
								</p>
							)}
						</div>

						{/* Confirm Password Field */}
						<div className="form-group">
							<label 
								className={`form-label ${focusedField === 'confirmPassword' || formData.confirmPassword ? 'focused' : ''}`}
							>
								Confirm Password
							</label>
							<div className="input-wrapper">
								<svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
									<rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
									<circle cx="12" cy="16" r="1" fill="currentColor"/>
									<path d="M7 11V7A5 5 0 0 1 17 7V11" stroke="currentColor" strokeWidth="2"/>
								</svg>
								<input
									type={showConfirmPassword ? "text" : "password"}
									name="confirmPassword"
									value={formData.confirmPassword}
									onChange={handleChange}
									onFocus={() => setFocusedField('confirmPassword')}
									onBlur={() => setFocusedField(null)}
									placeholder="Confirm your password"
									className={`form-input ${errors.confirmPassword ? 'error' : ''} ${formData.confirmPassword ? 'filled' : ''}`}
									required
								/>
								<button
									type="button"
									className="password-toggle"
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
								>
									{showConfirmPassword ? (
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
											<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C7 20 2.73 16.39 1 12A18.45 18.45 0 0 1 5.06 5.06L17.94 17.94Z" stroke="currentColor" strokeWidth="2"/>
											<path d="M9.9 4.24A9.12 9.12 0 0 1 12 4C17 4 21.27 7.61 23 12A18.5 18.5 0 0 1 19.42 16.42" stroke="currentColor" strokeWidth="2"/>
											<path d="M1 1L23 23" stroke="currentColor" strokeWidth="2"/>
											<path d="M10.5 15.5A3 3 0 0 0 15.5 10.5" stroke="currentColor" strokeWidth="2"/>
										</svg>
									) : (
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
											<path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" strokeWidth="2"/>
											<circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
										</svg>
									)}
								</button>
							</div>
							{errors.confirmPassword && (
								<p className="field-error">
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
										<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
										<line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
										<line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
									</svg>
									{errors.confirmPassword}
								</p>
							)}
						</div>

						<button
							type="submit"
							disabled={loading}
							className={`submit-btn ${loading ? 'loading' : ''}`}
						>
							{loading ? (
								<>
									<div className="spinner"></div>
									<span>Creating Account...</span>
								</>
							) : (
								<>
									<span>Create Account</span>
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
										<path d="M5 12H19" stroke="currentColor" strokeWidth="2"/>
										<path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2"/>
									</svg>
								</>
							)}
						</button>
					</form>

					{/* Footer */}
					<div className="signup-footer">
						<div className="login-link">
							<span>Already have an account? </span>
							<Link to="/login">Sign in here</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default SignUp;
