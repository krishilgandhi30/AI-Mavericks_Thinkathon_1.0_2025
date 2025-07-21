import axios from "axios";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../utils/auth';
import './Login.css';
import logo from '../assets/icon/medical-report.png';
import bg from '../assets/icon/login_background.png';

function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState({});
	const [showPassword, setShowPassword] = useState(false);
	const [focusedField, setFocusedField] = useState(null);
	const navigate = useNavigate();

	// Check if user is already logged in
	useEffect(() => {
		if (auth.isAuthenticated() && !auth.isTokenExpired()) {
			navigate('/dashboard');
		}
	}, [navigate]);

	const handleEmailChange = (e) => {
		setEmail(e.target.value);
		if (errors.email) {
			setErrors(prev => ({ ...prev, email: "" }));
		}
	};

	const handlePasswordChange = (e) => {
		setPassword(e.target.value);
		if (errors.password) {
			setErrors(prev => ({ ...prev, password: "" }));
		}
	};

	const validateForm = () => {
		const newErrors = {};

		if (!email.trim()) {
			newErrors.email = "Email is required";
		} else if (!/\S+@\S+\.\S+/.test(email)) {
			newErrors.email = "Email is invalid";
		}

		if (!password) {
			newErrors.password = "Password is required";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setLoading(true);

		try {
			const response = await axios.post('http://localhost:3334/api/auth/login', {
				email,
				password
			});

			auth.login(response.data.token);

			// Success animation before navigation
			setTimeout(() => {
				if(response.data.role === "admin") navigate('/admin')
				else navigate('/dashboard');
			}, 500);

		} catch (err) {
			console.error("Login error:", err);
			if (err.response && err.response.data && err.response.data.message) {
				setErrors({ general: err.response.data.message });
			} else {
				setErrors({ general: "Login failed. Please try again." });
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="login-container">
			{/* Background Animation */}
			<div className="login-bg">
				<div className="floating-shape shape-1"></div>
				<div className="floating-shape shape-2"></div>
				<div className="floating-shape shape-3"></div>
				<div className="floating-shape shape-4"></div>
			</div>

			<div className="login-content">
				<div className="login-card">
					{/* Header */}
					<div className="login-header">
						<div className="login-icon">
							<img src={logo} alt="Portal Icon" className="login-icon" />
						</div>
						<h1 className="login-title">Welcome Back!</h1>
						<p className="login-subtitle">Sign in to Doctor AI Portal.</p>
					</div>

					{/* Error Message */}
					{errors.general && (
						<div className="error-banner">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
								<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
								<line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2" />
								<line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2" />
							</svg>
							{errors.general}
						</div>
					)}

					{/* Form */}
					<form className="login-form" onSubmit={handleSubmit}>
						{/* Email Field */}
						<div className="form-group">
							<label className={`form-label ${focusedField === 'email' || email ? 'focused' : ''}`}>
								Email Address
							</label>
							<div className="input-wrapper">
								<svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
									<path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" />
									<polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" />
								</svg>
								<input
									type="email"
									value={email}
									onChange={handleEmailChange}
									onFocus={() => setFocusedField('email')}
									onBlur={() => setFocusedField(null)}
									placeholder="Enter your email"
									className={`form-input ${errors.email ? 'error' : ''} ${email ? 'filled' : ''}`}
									required
								/>
							</div>
							{errors.email && (
								<p className="field-error">
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
										<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
										<line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2" />
										<line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2" />
									</svg>
									{errors.email}
								</p>
							)}
						</div>

						{/* Password Field */}
						<div className="form-group">
							<label className={`form-label ${focusedField === 'password' || password ? 'focused' : ''}`}>
								Password
							</label>
							<div className="input-wrapper">
								<svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
									<rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
									<circle cx="12" cy="16" r="1" fill="currentColor" />
									<path d="M7 11V7A5 5 0 0 1 17 7V11" stroke="currentColor" strokeWidth="2" />
								</svg>
								<input
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={handlePasswordChange}
									onFocus={() => setFocusedField('password')}
									onBlur={() => setFocusedField(null)}
									placeholder="Enter your password"
									className={`form-input ${errors.password ? 'error' : ''} ${password ? 'filled' : ''}`}
									required
								/>
								<button
									type="button"
									className="password-toggle"
									onClick={() => setShowPassword(!showPassword)}
								>
									{showPassword ? (
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
											<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C7 20 2.73 16.39 1 12A18.45 18.45 0 0 1 5.06 5.06L17.94 17.94Z" stroke="currentColor" strokeWidth="2" />
											<path d="M9.9 4.24A9.12 9.12 0 0 1 12 4C17 4 21.27 7.61 23 12A18.5 18.5 0 0 1 19.42 16.42" stroke="currentColor" strokeWidth="2" />
											<path d="M1 1L23 23" stroke="currentColor" strokeWidth="2" />
											<path d="M10.5 15.5A3 3 0 0 0 15.5 10.5" stroke="currentColor" strokeWidth="2" />
										</svg>
									) : (
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
											<path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" strokeWidth="2" />
											<circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
										</svg>
									)}
								</button>
							</div>
							{errors.password && (
								<p className="field-error">
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
										<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
										<line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2" />
										<line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2" />
									</svg>
									{errors.password}
								</p>
							)}
						</div>

						{/* Submit Button */}
						<button
							type="submit"
							disabled={loading}
							className={`submit-btn ${loading ? 'loading' : ''}`}
						>
							{loading ? (
								<>
									<div className="spinner"></div>
									<span>Signing in...</span>
								</>
							) : (
								<>
									<span>Sign In</span>
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
										<path d="M5 12H19" stroke="currentColor" strokeWidth="2" />
										<path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" />
									</svg>
								</>
							)}
						</button>
					</form>

					{/* Footer Links */}
					<div className="login-footer">
						<Link to="/forgotpass" className="forgot-link">
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
								<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
								<path d="M9.09 9A3 3 0 0 1 15 9" stroke="currentColor" strokeWidth="2" />
								<path d="M12 17H12.01" stroke="currentColor" strokeWidth="2" />
							</svg>
							Forgot your password?
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Login;