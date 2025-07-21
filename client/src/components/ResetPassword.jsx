import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './ResetPassword.css';

function ResetPassword() {
	const { token } = useParams();
	const navigate = useNavigate();

	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState(null);
	const [error, setError] = useState(null);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [focusedField, setFocusedField] = useState(null);
	const [fieldErrors, setFieldErrors] = useState({});

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

	const handleNewPasswordChange = (e) => {
		setNewPassword(e.target.value);
		if (fieldErrors.newPassword) {
			setFieldErrors(prev => ({ ...prev, newPassword: "" }));
		}
	};

	const handleConfirmPasswordChange = (e) => {
		setConfirmPassword(e.target.value);
		if (fieldErrors.confirmPassword) {
			setFieldErrors(prev => ({ ...prev, confirmPassword: "" }));
		}
	};

	const validateForm = () => {
		const errors = {};

		if (newPassword.length < 6) {
			errors.newPassword = "Password must be at least 6 characters";
		}

		if (newPassword !== confirmPassword) {
			errors.confirmPassword = "Passwords do not match";
		}

		setFieldErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setMessage(null);
		setError(null);

		if (!validateForm()) {
			setLoading(false);
			return;
		}

		try {
			const res = await axios.post(`http://localhost:3334/api/auth/reset-password/${token}`, {
				newPassword,
			});
			setMessage(res.data.message || "Password reset successfully! Redirecting to login...");
			setTimeout(() => navigate("/login"), 3000);
		} catch (err) {
			console.error("Reset Error:", err);
			setError(err.response?.data?.message || "Something went wrong");
		} finally {
			setLoading(false);
		}
	};

	const passwordStrength = getPasswordStrength(newPassword);

	return (
		<div className="reset-password-container">
			{/* Background Animation */}
			<div className="reset-password-bg">
				<div className="floating-shape shape-1"></div>
				<div className="floating-shape shape-2"></div>
				<div className="floating-shape shape-3"></div>
				<div className="floating-shape shape-4"></div>
			</div>

			<div className="reset-password-content">
				<div className="reset-password-card">
					{/* Header */}
					<div className="reset-password-header">
						<div className="reset-password-icon">
							<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M9 12L11 14L15 10" stroke="url(#gradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
								<circle cx="12" cy="12" r="9" stroke="url(#gradient)" strokeWidth="2"/>
								<defs>
									<linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
										<stop offset="0%" stopColor="#667eea" />
										<stop offset="100%" stopColor="#764ba2" />
									</linearGradient>
								</defs>
							</svg>
						</div>
						<h1 className="reset-password-title">Reset Your Password</h1>
						<p className="reset-password-subtitle">
							Create a new password for your account. Make sure it's strong and unique.
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

					{/* Form */}
					<form className="reset-password-form" onSubmit={handleSubmit}>
						{/* New Password Field */}
						<div className="form-group">
							<label 
								htmlFor="newPassword"
								className={`form-label ${focusedField === 'newPassword' || newPassword ? 'focused' : ''}`}
							>
								New Password
							</label>
							<div className="input-wrapper">
								<svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
									<rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
									<circle cx="12" cy="16" r="1" fill="currentColor"/>
									<path d="M7 11V7A5 5 0 0 1 17 7V11" stroke="currentColor" strokeWidth="2"/>
								</svg>
								<input
									id="newPassword"
									type={showNewPassword ? "text" : "password"}
									placeholder="Enter new password"
									value={newPassword}
									onChange={handleNewPasswordChange}
									onFocus={() => setFocusedField('newPassword')}
									onBlur={() => setFocusedField(null)}
									required
									className={`form-input ${fieldErrors.newPassword ? 'error' : ''} ${newPassword ? 'filled' : ''}`}
								/>
								<button
									type="button"
									className="password-toggle"
									onClick={() => setShowNewPassword(!showNewPassword)}
								>
									{showNewPassword ? (
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
							{newPassword && (
								<div className="password-strength">
									<div>Password strength: <strong>{getStrengthText(passwordStrength)}</strong></div>
									<div className="strength-bar">
										<div className={`strength-fill ${getStrengthClass(passwordStrength)}`}></div>
									</div>
								</div>
							)}
							{fieldErrors.newPassword && (
								<p className="field-error">
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
										<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
										<line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
										<line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
									</svg>
									{fieldErrors.newPassword}
								</p>
							)}
						</div>

						{/* Confirm Password Field */}
						<div className="form-group">
							<label 
								htmlFor="confirmPassword"
								className={`form-label ${focusedField === 'confirmPassword' || confirmPassword ? 'focused' : ''}`}
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
									id="confirmPassword"
									type={showConfirmPassword ? "text" : "password"}
									placeholder="Confirm new password"
									value={confirmPassword}
									onChange={handleConfirmPasswordChange}
									onFocus={() => setFocusedField('confirmPassword')}
									onBlur={() => setFocusedField(null)}
									required
									className={`form-input ${fieldErrors.confirmPassword ? 'error' : ''} ${confirmPassword ? 'filled' : ''}`}
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
							{fieldErrors.confirmPassword && (
								<p className="field-error">
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
										<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
										<line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
										<line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
									</svg>
									{fieldErrors.confirmPassword}
								</p>
							)}
						</div>

						{/* Password Requirements */}
						<div className="password-requirements">
							<h4>Password Requirements:</h4>
							<div className="requirement">
								<svg viewBox="0 0 24 24" fill="none">
									{newPassword.length >= 6 ? (
										<circle cx="12" cy="12" r="10" fill="#22543d"/>
									) : (
										<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
									)}
									{newPassword.length >= 6 && (
										<path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
									)}
								</svg>
								At least 6 characters
							</div>
							<div className="requirement">
								<svg viewBox="0 0 24 24" fill="none">
									{/[A-Z]/.test(newPassword) ? (
										<circle cx="12" cy="12" r="10" fill="#22543d"/>
									) : (
										<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
									)}
									{/[A-Z]/.test(newPassword) && (
										<path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
									)}
								</svg>
								One uppercase letter
							</div>
							<div className="requirement">
								<svg viewBox="0 0 24 24" fill="none">
									{/[0-9]/.test(newPassword) ? (
										<circle cx="12" cy="12" r="10" fill="#22543d"/>
									) : (
										<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
									)}
									{/[0-9]/.test(newPassword) && (
										<path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
									)}
								</svg>
								One number
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
									<span>Resetting...</span>
								</>
							) : (
								<>
									<span>Reset Password</span>
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
										<path d="M5 12H19" stroke="currentColor" strokeWidth="2"/>
										<path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2"/>
									</svg>
								</>
							)}
						</button>
					</form>

					{/* Footer */}
					<div className="reset-password-footer">
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

export default ResetPassword;
