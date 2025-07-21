import React, { useState } from 'react';
import axios from 'axios';
import './HealthReportUpload.css';

const HealthReportUpload = () => {
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
    };

    const handleBasicChange = (field, value) => {
        setReportData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const token = localStorage.getItem('token');
            
            // Prepare data for submission
            const submitData = {
                reportType: reportData.reportType,
                patientNotes: reportData.patientNotes,
                bloodMetrics: reportData.reportType === 'blood' ? reportData.bloodMetrics : undefined,
                urineMetrics: reportData.reportType === 'urine' ? reportData.urineMetrics : undefined
            };

            const response = await axios.post('http://localhost:3334/api/health-reports/upload', submitData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage('Health report uploaded and analyzed successfully!');
            setAnalysisResult(response.data.aiSuggestions);
            
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

    const renderBloodMetrics = () => (
        <div className="metrics-grid">
            {Object.entries(reportData.bloodMetrics).map(([key, metric]) => (
                <div key={key} className="metric-item">
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
                </div>
            ))}
        </div>
    );

    const renderUrineMetrics = () => (
        <div className="metrics-grid">
            {Object.entries(reportData.urineMetrics).map(([key, metric]) => (
                <div key={key} className="metric-item">
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

                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? (
                        <>
                            <div className="spinner"></div>
                            Analyzing...
                        </>
                    ) : (
                        'Upload & Analyze'
                    )}
                </button>
            </form>

            {analysisResult && (
                <div className="analysis-result">
                    <h3>AI Analysis Complete</h3>
                    <div className="result-section">
                        <h4>Treatment Plan</h4>
                        <p>{analysisResult.treatmentPlan.summary}</p>
                        {analysisResult.treatmentPlan.medications.length > 0 && (
                            <div className="medications">
                                <h5>Recommended Medications:</h5>
                                <ul>
                                    {analysisResult.treatmentPlan.medications.map((med, index) => (
                                        <li key={index}>
                                            <strong>{med.name}</strong> - {med.dosage}, {med.frequency}
                                            {med.notes && <span className="med-notes"> ({med.notes})</span>}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    
                    <div className="result-section">
                        <h4>Lifestyle Changes</h4>
                        <p>{analysisResult.lifestyleChanges.summary}</p>
                        {analysisResult.lifestyleChanges.diet.length > 0 && (
                            <div className="lifestyle-category">
                                <h5>Diet:</h5>
                                <ul>
                                    {analysisResult.lifestyleChanges.diet.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {analysisResult.lifestyleChanges.exercise.length > 0 && (
                            <div className="lifestyle-category">
                                <h5>Exercise:</h5>
                                <ul>
                                    {analysisResult.lifestyleChanges.exercise.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {analysisResult.riskFactors.length > 0 && (
                        <div className="result-section risk-factors">
                            <h4>Risk Factors Identified</h4>
                            <ul>
                                {analysisResult.riskFactors.map((risk, index) => (
                                    <li key={index}>{risk}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="result-footer">
                        <p className="disclaimer">
                            <strong>Note:</strong> These recommendations are AI-generated and require validation by a healthcare professional.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HealthReportUpload;
