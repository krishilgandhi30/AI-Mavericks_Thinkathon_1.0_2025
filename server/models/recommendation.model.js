import mongoose from 'mongoose';

const recommendationSchema = new mongoose.Schema({
    reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'HealthReport', required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    // AI Generated Content
    aiSuggestions: {
        treatmentPlan: {
            medications: [{ 
                name: String, 
                dosage: String, 
                frequency: String, 
                duration: String,
                notes: String 
            }],
            procedures: [String],
            followUpTests: [String],
            summary: String
        },
        lifestyleChanges: {
            diet: [String],
            exercise: [String],
            habits: [String],
            precautions: [String],
            summary: String
        },
        riskFactors: [String],
        urgencyLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
    },
    
    // Doctor Review Process
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewStatus: { 
        type: String, 
        enum: ['pending', 'under_review', 'approved', 'modified', 'rejected'], 
        default: 'pending' 
    },
    
    // Doctor Modifications
    doctorModifications: {
        treatmentPlan: {
            medications: [{ 
                name: String, 
                dosage: String, 
                frequency: String, 
                duration: String,
                notes: String 
            }],
            procedures: [String],
            followUpTests: [String],
            summary: String
        },
        lifestyleChanges: {
            diet: [String],
            exercise: [String],
            habits: [String],
            precautions: [String],
            summary: String
        },
        additionalNotes: String
    },
    
    // Final approved recommendations
    finalRecommendations: {
        treatmentPlan: {
            medications: [{ 
                name: String, 
                dosage: String, 
                frequency: String, 
                duration: String,
                notes: String 
            }],
            procedures: [String],
            followUpTests: [String],
            summary: String
        },
        lifestyleChanges: {
            diet: [String],
            exercise: [String],
            habits: [String],
            precautions: [String],
            summary: String
        }
    },
    
    // Review metadata
    doctorNotes: String,
    doctorFeedbackToAI: String,
    confidenceScore: { type: Number, min: 0, max: 1 },
    
    // Timestamps
    createdAt: { type: Date, default: Date.now },
    reviewedAt: Date,
    approvedAt: Date,
    lastModified: { type: Date, default: Date.now }
}, { timestamps: true });

// Update lastModified on every save
recommendationSchema.pre('save', function(next) {
    this.lastModified = new Date();
    next();
});

const Recommendation = mongoose.model('Recommendation', recommendationSchema);
export default Recommendation;