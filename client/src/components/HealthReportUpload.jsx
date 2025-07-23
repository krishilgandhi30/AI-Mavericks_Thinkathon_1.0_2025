import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './HealthReportUpload.css';

const HealthReportUpload = () => {
    // Track animation state for form elements
    const [animateMetric, setAnimateMetric] = useState(null);
    const [formProgress, setFormProgress] = useState(0);
    
    // Helper function for health score color
    const getHealthScoreColor = (score) => {
        if (score >= 80) return '#27ae60';
        if (score >= 60) return '#f39c12';
        return '#e74c3c';
    };
    const [reportData, setReportData] = useState({
        reportType: 'blood',
        patientNotes: '',
        bloodMetrics: {
            hemoglobin: { value: '', unit: 'g/dL', normalRange: '12-15 g/dL' },
            glucose: { value: '', unit: 'mg/dL', normalRange: '70-99 mg/dL' },
            cholesterol: { value: '', unit: 'mg/dL', normalRange: '<200 mg/dL' },
            triglycerides: { value: '', unit: 'mg/dL', normalRange: '<150 mg/dL' },
            hba1c: { value: '', unit: '%', normalRange: '<5.7%' },
            creatinine: { value: '', unit: 'mg/dL', normalRange: '0.6-1.3 mg/dL' },
            bun: { value: '', unit: 'mg/dL', normalRange: '7-20 mg/dL' },
            alt: { value: '', unit: 'U/L', normalRange: '7-56 U/L' },
            ast: { value: '', unit: 'U/L', normalRange: '10-40 U/L' }
        },
        urineMetrics: {
            protein: { value: '', normalRange: 'Negative' },
            glucose: { value: '', normalRange: 'Negative' },
            ketones: { value: '', normalRange: 'Negative' },
            specificGravity: { value: '', normalRange: '1.005-1.030' },
            ph: { value: '', normalRange: '4.6-8.0' }
        }
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);

    const handleInputChange = (category, metric, field, value) => {
        // Animate the metric being changed
        setAnimateMetric(metric);
        setTimeout(() => setAnimateMetric(null), 800);
        
        setReportData(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [metric]: {
                    ...prev[category][metric],
                    [field]: value
                }
            }
        }));
        
        // Update form progress
        updateFormProgress();
    };

    const handleBasicChange = (field, value) => {
        setReportData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Update form progress
        updateFormProgress();
    };
    
    // Calculate form completion progress
    const updateFormProgress = () => {
        let filledFields = 0;
        let totalFields = 1; // Start with 1 for report type
        
        // Count filled notes
        if (reportData.patientNotes.trim()) filledFields++;
        totalFields++;
        
        // Count filled metrics
        const metricsCategory = reportData.reportType === 'blood' ? 'bloodMetrics' : 'urineMetrics';
        const metrics = reportData[metricsCategory];
        
        Object.values(metrics).forEach(metric => {
            if (metric.value) filledFields++;
            totalFields++;
        });
        
        const progress = Math.round((filledFields / totalFields) * 100);
        setFormProgress(progress);
    };
    
    // Update progress when form data changes
    useEffect(() => {
        updateFormProgress();
    }, [reportData]);
    
    // Add animation effects when component mounts
    useEffect(() => {
        const animateItems = () => {
            const metricItems = document.querySelectorAll('.upload-metric-item');
            metricItems.forEach((item, index) => {
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, 100 * index);
            });
        };
        
        // Small delay to ensure DOM is ready
        setTimeout(animateItems, 100);
        
        // Add hover effect to metric items
        const addHoverEffects = () => {
            const metricItems = document.querySelectorAll('.upload-metric-item');
            metricItems.forEach(item => {
                item.addEventListener('mouseenter', () => {
                    const siblings = Array.from(item.parentNode.children).filter(child => child !== item);
                    siblings.forEach(sibling => {
                        sibling.style.opacity = '0.7';
                    });
                });
                
                item.addEventListener('mouseleave', () => {
                    const siblings = Array.from(item.parentNode.children);
                    siblings.forEach(sibling => {
                        sibling.style.opacity = '1';
                    });
                });
            });
        };
        
        setTimeout(addHoverEffects, 500);
        
        return () => {
            // Clean up event listeners
            const metricItems = document.querySelectorAll('.upload-metric-item');
            metricItems.forEach(item => {
                item.removeEventListener('mouseenter', () => {});
                item.removeEventListener('mouseleave', () => {});
            });
        };
    }, [reportData.reportType]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        
        // Scroll to top for better UX
        window.scrollTo({ top: 0, behavior: 'smooth' });

        try {
            const token = localStorage.getItem('token');
            
            // Prepare data for submission
            const submitData = {
                reportType: reportData.reportType,
                patientNotes: reportData.patientNotes,
                bloodMetrics: reportData.reportType === 'blood' ? reportData.bloodMetrics : undefined,
                urineMetrics: reportData.reportType === 'urine' ? reportData.urineMetrics : undefined
            };

            const response = await axios.post('http://localhost:5000/api/health-reports/upload', submitData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage('Health report uploaded and analyzed successfully!');
            setAnalysisResult(response.data.aiSuggestions);
            
            // Scroll to results after a short delay
            setTimeout(() => {
                const resultElement = document.querySelector('.analysis-result');
                if (resultElement) {
                    resultElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 500);
            
            // Reset form
            setReportData({
                ...reportData,
                patientNotes: '',
                bloodMetrics: Object.keys(reportData.bloodMetrics).reduce((acc, key) => {
                    acc[key] = { ...reportData.bloodMetrics[key], value: '' };
                    return acc;
                }, {}),
                urineMetrics: Object.keys(reportData.urineMetrics).reduce((acc, key) => {
                    acc[key] = { ...reportData.urineMetrics[key], value: '' };
                    return acc;
                }, {})
            });

        } catch (error) {
            console.error('Upload error:', error);
            setError(error.response?.data?.message || 'Failed to upload health report');
        } finally {
            setLoading(false);
        }
    };

    // Helper function to check if value is within normal range
    const isValueNormal = (value, normalRange) => {
        if (!value || !normalRange) return true;
        
        const numValue = parseFloat(value);
        
        if (normalRange.includes('-')) {
            const [min, max] = normalRange.split('-').map(v => parseFloat(v));
            return numValue >= min && numValue <= max;
        } else if (normalRange.includes('<')) {
            const max = parseFloat(normalRange.replace(/[^0-9.]/g, ''));
            return numValue < max;
        } else if (normalRange.includes('>')) {
            const min = parseFloat(normalRange.replace(/[^0-9.]/g, ''));
            return numValue > min;
        }
        
        return true;
    };
    
    const renderBloodMetrics = () => (
        <div className="metrics-grid">
            {Object.entries(reportData.bloodMetrics).map(([key, metric]) => (
                <div 
                    key={key} 
                    className={`upload-metric-item ${animateMetric === key ? 'animate-pulse' : ''}`}
                    style={{
                        animation: animateMetric === key ? 'pulse 0.8s ease-in-out' : 'none',
                        borderLeftColor: metric.value ? (isValueNormal(metric.value, metric.normalRange) ? '#27ae60' : '#e74c3c') : '#3498db'
                    }}
                >
                    <label className="metric-label">
                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                    </label>
                    <div className="metric-input-wrapper">
                        <input
                            type="number"
                            step="0.01"
                            value={metric.value}
                            onChange={(e) => handleInputChange('bloodMetrics', key, 'value', e.target.value)}
                            className="metric-input"
                            placeholder="Enter value"
                        />
                        <span className="metric-unit">{metric.unit}</span>
                    </div>
                    <span className="normal-range">Normal: {metric.normalRange}</span>
                    {metric.value && (
                        <div className="metric-status" style={{ 
                            color: isValueNormal(metric.value, metric.normalRange) ? '#27ae60' : '#e74c3c' 
                        }}>
                            {isValueNormal(metric.value, metric.normalRange) ? '✓ Normal' : '⚠️ Out of range'}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

    // Helper function to check if urine value is normal
    const isUrineValueNormal = (key, value, normalRange) => {
        if (!value) return true;
        
        if (key === 'specificGravity') {
            const numValue = parseFloat(value);
            return numValue >= 1.005 && numValue <= 1.030;
        } else if (key === 'ph') {
            const numValue = parseFloat(value);
            return numValue >= 4.6 && numValue <= 8.0;
        } else {
            // For protein, glucose, ketones - normal is "Negative"
            return value === 'Negative';
        }
    };
    
    const renderUrineMetrics = () => (
        <div className="metrics-grid">
            {Object.entries(reportData.urineMetrics).map(([key, metric]) => (
                <div 
                    key={key} 
                    className={`upload-metric-item ${animateMetric === key ? 'animate-pulse' : ''}`}
                    style={{
                        animation: animateMetric === key ? 'pulse 0.8s ease-in-out' : 'none',
                        borderLeftColor: metric.value ? (isUrineValueNormal(key, metric.value, metric.normalRange) ? '#27ae60' : '#e74c3c') : '#3498db'
                    }}
                >
                    <label className="metric-label">
                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                    </label>
                    <div className="metric-input-wrapper">
                        {key === 'specificGravity' || key === 'ph' ? (
                            <input
                                type="number"
                                step="0.01"
                                value={metric.value}
                                onChange={(e) => handleInputChange('urineMetrics', key, 'value', e.target.value)}
                                className="metric-input"
                                placeholder="Enter value"
                            />
                        ) : (
                            <select
                                value={metric.value}
                                onChange={(e) => handleInputChange('urineMetrics', key, 'value', e.target.value)}
                                className="metric-input"
                            >
                                <option value="">Select</option>
                                <option value="Negative">Negative</option>
                                <option value="Trace">Trace</option>
                                <option value="1+">1+</option>
                                <option value="2+">2+</option>
                                <option value="3+">3+</option>
                                <option value="4+">4+</option>
                            </select>
                        )}
                    </div>
                    <span className="normal-range">Normal: {metric.normalRange}</span>
                    {metric.value && (
                        <div className="metric-status" style={{ 
                            color: isUrineValueNormal(key, metric.value, metric.normalRange) ? '#27ae60' : '#e74c3c' 
                        }}>
                            {isUrineValueNormal(key, metric.value, metric.normalRange) ? '✓ Normal' : '⚠️ Abnormal'}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <div className="health-report-upload">
            <div className="upload-header">
                <h2>Upload Health Report</h2>
                <p>Enter your test results to get AI-generated health recommendations</p>
            </div>

            {message && (
                <div className="alert alert-success">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                        <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    {message}
                </div>
            )}

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

            <form onSubmit={handleSubmit} className="upload-form">
                <div className="form-progress-container">
                    <div className="form-progress-bar" style={{ width: `${formProgress}%` }}></div>
                    <span className="form-progress-text">{formProgress}% Complete</span>
                </div>
                
                <div className="form-group">
                    <label className="form-label">Report Type</label>
                    <div className="report-type-selector">
                        <div className="type-option">
                            <input
                                type="radio"
                                id="blood"
                                name="reportType"
                                value="blood"
                                checked={reportData.reportType === 'blood'}
                                onChange={(e) => handleBasicChange('reportType', e.target.value)}
                            />
                            <label htmlFor="blood" className="type-label">
                                <div className="type-icon">🩸</div>
                                <span>Blood Test</span>
                            </label>
                        </div>
                        <div className="type-option">
                            <input
                                type="radio"
                                id="urine"
                                name="reportType"
                                value="urine"
                                checked={reportData.reportType === 'urine'}
                                onChange={(e) => handleBasicChange('reportType', e.target.value)}
                            />
                            <label htmlFor="urine" className="type-label">
                                <div className="type-icon">🧪</div>
                                <span>Urine Test</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="metrics-section">
                    <h3>{reportData.reportType === 'blood' ? 'Blood Test Results' : 'Urine Test Results'}</h3>
                    {reportData.reportType === 'blood' ? renderBloodMetrics() : renderUrineMetrics()}
                </div>

                <div className="form-group">
                    <label className="form-label">Additional Notes</label>
                    <textarea
                        value={reportData.patientNotes}
                        onChange={(e) => handleBasicChange('patientNotes', e.target.value)}
                        className="form-textarea"
                        placeholder="Any symptoms, concerns, or additional information..."
                        rows="4"
                    />
                </div>

                <button 
                    type="submit" 
                    className="submit-btn" 
                    disabled={loading || formProgress < 30}
                    title={formProgress < 30 ? "Please fill in more fields" : ""}
                >
                    {loading ? (
                        <>
                            <div className="spinner"></div>
                            <span>Analyzing your health data...</span>
                        </>
                    ) : (
                        <>
                            <span className="btn-icon">🚀</span>
                            <span>Upload & Get AI Analysis</span>
                        </>
                    )}
                </button>
                
                {formProgress < 30 && !loading && (
                    <div className="form-hint">
                        Please fill in more fields to enable submission
                    </div>
                )}
            </form>

            {analysisResult && (
                <div className="analysis-result">
                    <div className="analysis-header">
                        <h3>
                            <span className="ai-icon">🤖</span>
                            AI Analysis Complete
                        </h3>
                        <div className="health-score">
                            <div 
                                className="score-circle"
                                style={{
                                    background: `conic-gradient(${getHealthScoreColor(analysisResult.healthScore || 75)} ${(analysisResult.healthScore || 75) * 3.6}deg, #e0e0e0 0deg)`
                                }}
                            >
                                <span className="score-number">{analysisResult.healthScore || 75}</span>
                                <span className="score-label">Health Score</span>
                            </div>
                            <div className={`urgency-badge urgency-${analysisResult.urgencyLevel || 'medium'}`}>
                                {analysisResult.urgencyLevel?.toUpperCase() || 'MEDIUM'} PRIORITY
                            </div>
                        </div>
                    </div>

                    {analysisResult.treatmentPlan?.emergencyWarnings?.length > 0 && (
                        <div className="emergency-warnings">
                            <h4>⚠️ Emergency Warnings</h4>
                            <ul>
                                {analysisResult.treatmentPlan.emergencyWarnings.map((warning, index) => (
                                    <li key={index} className="emergency-warning">{warning}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="result-section">
                        <h4>💊 Treatment Plan</h4>
                        <p>{analysisResult.treatmentPlan?.summary}</p>
                        {analysisResult.treatmentPlan?.medications?.length > 0 && (
                            <div className="medications">
                                <h5>Recommended Medications:</h5>
                                <div className="medication-cards">
                                    {analysisResult.treatmentPlan.medications.map((med, index) => (
                                        <div key={index} className="medication-card">
                                            <div className="med-header">
                                                <strong>{med.name}</strong>
                                                <span className="med-dosage">{med.dosage}</span>
                                            </div>
                                            <div className="med-details">
                                                <p><strong>Frequency:</strong> {med.frequency}</p>
                                                <p><strong>Duration:</strong> {med.duration}</p>
                                                {med.notes && <p className="med-notes"><strong>Notes:</strong> {med.notes}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {analysisResult.treatmentPlan?.followUpTests?.length > 0 && (
                            <div className="follow-up-tests">
                                <h5>Follow-up Tests:</h5>
                                <ul>
                                    {analysisResult.treatmentPlan.followUpTests.map((test, index) => (
                                        <li key={index}>{test}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    
                    <div className="result-section">
                        <h4>🏃‍♂️ Lifestyle Recommendations</h4>
                        <p>{analysisResult.lifestyleChanges?.summary}</p>
                        
                        <div className="lifestyle-grid">
                            {analysisResult.lifestyleChanges?.diet?.length > 0 && (
                                <div className="lifestyle-category">
                                    <h5>🥗 Diet:</h5>
                                    <ul>
                                        {analysisResult.lifestyleChanges.diet.map((item, index) => (
                                            <li key={index}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            {analysisResult.lifestyleChanges?.exercise?.length > 0 && (
                                <div className="lifestyle-category">
                                    <h5>💪 Exercise:</h5>
                                    <ul>
                                        {analysisResult.lifestyleChanges.exercise.map((item, index) => (
                                            <li key={index}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            {analysisResult.lifestyleChanges?.habits?.length > 0 && (
                                <div className="lifestyle-category">
                                    <h5>😴 Healthy Habits:</h5>
                                    <ul>
                                        {analysisResult.lifestyleChanges.habits.map((item, index) => (
                                            <li key={index}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            {analysisResult.lifestyleChanges?.supplements?.length > 0 && (
                                <div className="lifestyle-category">
                                    <h5>💊 Supplements:</h5>
                                    <ul>
                                        {analysisResult.lifestyleChanges.supplements.map((item, index) => (
                                            <li key={index}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    {analysisResult.riskFactors?.length > 0 && (
                        <div className="result-section risk-factors">
                            <h4>⚠️ Risk Factors Identified</h4>
                            <ul>
                                {analysisResult.riskFactors.map((risk, index) => (
                                    <li key={index}>{risk}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {analysisResult.preventiveRecommendations?.length > 0 && (
                        <div className="result-section preventive">
                            <h4>🛡️ Preventive Care</h4>
                            <ul>
                                {analysisResult.preventiveRecommendations.map((rec, index) => (
                                    <li key={index}>{rec}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="result-footer">
                        <div className="confidence-score">
                            <p><strong>AI Confidence:</strong> {Math.round((analysisResult.confidenceScore || 0.8) * 100)}%</p>
                        </div>
                        <p className="disclaimer">
                            <strong>Important:</strong> These AI-generated recommendations are for informational purposes only and require validation by a qualified healthcare professional before implementation.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HealthReportUpload;
