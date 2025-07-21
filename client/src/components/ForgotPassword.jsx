import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './ForgotPassword.css';

function ForgotPassword() {
	const [email, setEmail] = useState('');
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState(null);
	const [error, setError] = useState(null);
	const [token, setToken] = useState('');
	const [resetLink, setResetLink] = useState(null);
	const [focusedField, setFocusedField] = useState(null);
	const navigate = useNavigate();

	const handleEmailChange = (e) => {
		setEmail(e.target.value);
		if (error) {
			setError(null);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setMessage(null);
		setError(null);
		setResetLink(null);

		if (!email || !email.includes("@")) {
			setLoading(false);
			return setError("Please enter a valid email address");
		}

		try {
			const res = await axios.post("http://localhost:3334/api/auth/forgot-password", { email });
			setMessage(res.data.message || "Reset link sent to your email");
			setResetLink(res.data.resetLink);
			setToken(res.data.token);
		} catch (err) {
			console.error("Forgot Password Error:", err);
			setError(err.response?.data?.message || "Something went wrong");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="forgot-password-container">
			{/* Background Animation */}
			<div className="forgot-password-bg">
				<div className="floating-shape shape-1"></div>
				<div className="floating-shape shape-2"></div>
				<div className="floating-shape shape-3"></div>
				<div className="floating-shape shape-4"></div>
			</div>

			<div className="forgot-password-content">
				<div className="forgot-password-card">
					{/* Header */}
					<div className="forgot-password-header">
						<div className="forgot-password-icon">
							<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M16 12L22 6L16 0V3H6C4.89 3 4 3.89 4 5V7H6V5H16V12Z" fill="url(#gradient)" />
								<path d="M8 12H18V16C18 17.11 17.11 18 16 18H8C6.89 18 6 17.11 6 16V12H8Z" fill="url(#gradient)" />
								<defs>
									<linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
										<stop offset="0%" stopColor="#667eea" />
										<stop offset="100%" stopColor="#764ba2" />
									</linearGradient>
								</defs>
							</svg>
						</div>
						<h1 className="forgot-password-title">Forgot Password?</h1>
						<p className="forgot-password-subtitle">
							No worries! Enter your email address and we'll send you a link to reset your password.
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

					{/* Reset Link Info */}
					{resetLink && (
						<div className="alert alert-info">
							<p>For development purposes, you can directly reset your password:</p>
							<button 
								onClick={() => navigate(`/resetpassword/${token}`)}
								className="btn-secondary"
							>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{marginRight: '6px'}}>
									<path d="M15 3H6C4.89 3 4 3.89 4 5V19C4 20.11 4.89 21 6 21H18C19.11 21 20 20.11 20 19V8L15 3Z" stroke="currentColor" strokeWidth="2"/>
									<polyline points="15,3 15,8 20,8" stroke="currentColor" strokeWidth="2"/>
								</svg>
								Go to Reset Password
							</button>
						</div>
					)}

					{/* Form */}
					<form className="forgot-password-form" onSubmit={handleSubmit}>
						<div className="form-group">
							<label 
								htmlFor="email"
								className={`form-label ${focusedField === 'email' || email ? 'focused' : ''}`}
							>
								Email Address
							</label>
							<div className="input-wrapper">
								<svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
									<path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2"/>
									<polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/>
								</svg>
								<input
									id="email"
									type="email"
									placeholder="Enter your registered email"
									value={email}
									onChange={handleEmailChange}
									onFocus={() => setFocusedField('email')}
									onBlur={() => setFocusedField(null)}
									required
									className="form-input"
								/>
							</div>
						</div>

						<button 
							type="submit" 
							disabled={loading} 
							className={`submit-btn ${loading ? 'loading' : ''}`}
						>
							{loading ? (
								<>
									<div className="spinner"></div>
									<span>Sending...</span>
								</>
							) : (
								<>
									<span>Send Reset Link</span>
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
										<path d="M5 12H19" stroke="currentColor" strokeWidth="2"/>
										<path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2"/>
									</svg>
								</>
							)}
						</button>
					</form>

					{/* Footer */}
					<div className="forgot-password-footer">
						<Link to="/login" className="back-link">
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
								<path d="M19 12H5" stroke="currentColor" strokeWidth="2"/>
								<path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2"/>
							</svg>
							Back to Login
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ForgotPassword;
