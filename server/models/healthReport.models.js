import mongoose from 'mongoose';

const healthReportSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reportType: { type: String, enum: ['blood', 'urine', 'other'], required: true },
    
    // Blood test metrics
    bloodMetrics: {
        hemoglobin: { value: Number, unit: { type: String, default: 'g/dL' }, normalRange: String },
        glucose: { value: Number, unit: { type: String, default: 'mg/dL' }, normalRange: String },
        cholesterol: { value: Number, unit: { type: String, default: 'mg/dL' }, normalRange: String },
        triglycerides: { value: Number, unit: { type: String, default: 'mg/dL' }, normalRange: String },
        hba1c: { value: Number, unit: { type: String, default: '%' }, normalRange: String },
        creatinine: { value: Number, unit: { type: String, default: 'mg/dL' }, normalRange: String },
        bun: { value: Number, unit: { type: String, default: 'mg/dL' }, normalRange: String },
        alt: { value: Number, unit: { type: String, default: 'U/L' }, normalRange: String },
        ast: { value: Number, unit: { type: String, default: 'U/L' }, normalRange: String }
    },
    
    // Urine test metrics
    urineMetrics: {
        protein: { value: String, normalRange: String },
        glucose: { value: String, normalRange: String },
        ketones: { value: String, normalRange: String },
        specificGravity: { value: Number, normalRange: String },
        ph: { value: Number, normalRange: String }
    },
    
    // General metrics (for backward compatibility)
    metrics: {
        hemoglobin: Number,
        glucose: Number,
        cholesterol: Number
    },
    
    // File upload information
    originalFileName: String,
    filePath: String,
    fileSize: Number,
    
    // Analysis status
    isAnalyzed: { type: Boolean, default: false },
    analysisDate: Date,
    
    uploadedAt: { type: Date, default: Date.now },
    
    // Additional notes from patient
    patientNotes: String
}, { timestamps: true });

const HealthReport = mongoose.model('HealthReport', healthReportSchema);
export default HealthReport;
