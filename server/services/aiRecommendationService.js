import OpenAI from 'openai';
// Enhanced AI Health Recommendation Service
class AIHealthRecommendationService {
    constructor() {
        // Initialize OpenAI (optional - you can use this with a real API key)
        // Commenting out OpenAI for now to avoid import issues
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }

    // Enhanced AI analysis with more sophisticated logic
    async generateHealthRecommendations(reportData, patientProfile = {}) {
        const { bloodMetrics, urineMetrics, reportType, patientNotes } = reportData;
        const { age, gender, medicalHistory = [], currentMedications = [] } = patientProfile;

        const analysis = {
            treatmentPlan: {
                medications: [],
                procedures: [],
                followUpTests: [],
                summary: '',
                emergencyWarnings: []
            },
            lifestyleChanges: {
                diet: [],
                exercise: [],
                habits: [],
                precautions: [],
                supplements: [],
                summary: ''
            },
            riskFactors: [],
            healthScore: 0,
            urgencyLevel: 'low',
            confidenceScore: 0.8,
            nextAppointmentSuggestion: 'routine',
            preventiveRecommendations: []
        };

        let healthScore = 100;
        let criticalFindings = [];

        if (reportType === 'blood' && bloodMetrics) {
            // Enhanced glucose analysis
            if (bloodMetrics.glucose?.value) {
                const glucose = parseFloat(bloodMetrics.glucose.value);
                if (glucose >= 200) {
                    criticalFindings.push('Severely elevated glucose - possible diabetic emergency');
                    analysis.urgencyLevel = 'high';
                    analysis.treatmentPlan.emergencyWarnings.push('Seek immediate medical attention for glucose levels above 200 mg/dL');
                    healthScore -= 30;
                } else if (glucose > 126) {
                    analysis.riskFactors.push('Elevated glucose levels - diabetes diagnosis criteria met');
                    analysis.treatmentPlan.medications.push({
                        name: 'Metformin',
                        dosage: '500mg',
                        frequency: 'Twice daily with meals',
                        duration: '3 months initially',
                        notes: 'Monitor blood glucose levels weekly. May cause GI upset - take with food.'
                    });
                    analysis.treatmentPlan.followUpTests.push('HbA1c test in 3 months');
                    analysis.treatmentPlan.followUpTests.push('Lipid panel in 6 weeks');
                    analysis.lifestyleChanges.diet.push('Carbohydrate counting and portion control');
                    analysis.lifestyleChanges.diet.push('Mediterranean diet pattern');
                    analysis.lifestyleChanges.exercise.push('150 minutes moderate aerobic activity per week');
                    analysis.urgencyLevel = 'high';
                    healthScore -= 20;
                } else if (glucose > 100) {
                    analysis.riskFactors.push('Pre-diabetic glucose levels - intervention opportunity');
                    analysis.lifestyleChanges.diet.push('Low glycemic index foods');
                    analysis.lifestyleChanges.diet.push('Reduce added sugars and refined carbohydrates');
                    analysis.lifestyleChanges.exercise.push('Post-meal walks to improve glucose uptake');
                    analysis.preventiveRecommendations.push('Annual diabetes screening');
                    healthScore -= 10;
                } else if (glucose >= 70) {
                    analysis.preventiveRecommendations.push('Maintain healthy glucose levels with balanced nutrition');
                } else {
                    analysis.riskFactors.push('Low glucose levels - possible hypoglycemia');
                    analysis.treatmentPlan.procedures.push('Investigate causes of hypoglycemia');
                    healthScore -= 15;
                }
            }

            // Enhanced cholesterol analysis with risk stratification
            if (bloodMetrics.cholesterol?.value) {
                const cholesterol = parseFloat(bloodMetrics.cholesterol.value);
                if (cholesterol > 300) {
                    criticalFindings.push('Extremely high cholesterol - urgent intervention needed');
                    analysis.urgencyLevel = 'high';
                    healthScore -= 25;
                } else if (cholesterol > 240) {
                    analysis.riskFactors.push('High cholesterol - cardiovascular risk');
                    analysis.treatmentPlan.medications.push({
                        name: 'Atorvastatin',
                        dosage: '20mg',
                        frequency: 'Once daily in the evening',
                        duration: '6 months with monitoring',
                        notes: 'Monitor liver function tests. Avoid grapefruit juice.'
                    });
                    analysis.lifestyleChanges.diet.push('DASH diet or Mediterranean diet');
                    analysis.lifestyleChanges.diet.push('Increase soluble fiber (oats, beans, fruits)');
                    analysis.lifestyleChanges.exercise.push('Aerobic exercise 150+ minutes/week');
                    analysis.treatmentPlan.followUpTests.push('Lipid panel in 6-8 weeks');
                    healthScore -= 15;
                } else if (cholesterol > 200) {
                    analysis.riskFactors.push('Borderline high cholesterol');
                    analysis.lifestyleChanges.diet.push('Heart-healthy diet with omega-3 fatty acids');
                    analysis.lifestyleChanges.diet.push('Limit saturated and trans fats');
                    analysis.lifestyleChanges.exercise.push('Regular cardiovascular exercise');
                    analysis.preventiveRecommendations.push('Annual lipid screening');
                    healthScore -= 8;
                }
            }

            // HbA1c analysis for long-term glucose control
            if (bloodMetrics.hba1c?.value) {
                const hba1c = parseFloat(bloodMetrics.hba1c.value);
                if (hba1c >= 6.5) {
                    analysis.riskFactors.push('Diabetes confirmed by HbA1c criteria');
                    analysis.treatmentPlan.followUpTests.push('Quarterly HbA1c monitoring');
                    healthScore -= 20;
                } else if (hba1c >= 5.7) {
                    analysis.riskFactors.push('Prediabetes - elevated diabetes risk');
                    analysis.preventiveRecommendations.push('Diabetes prevention program');
                    healthScore -= 10;
                }
            }

            // Kidney function assessment
            if (bloodMetrics.creatinine?.value) {
                const creatinine = parseFloat(bloodMetrics.creatinine.value);
                const normalUpper = gender === 'female' ? 1.1 : 1.3;
                if (creatinine > normalUpper * 1.5) {
                    analysis.riskFactors.push('Elevated creatinine - possible kidney dysfunction');
                    analysis.treatmentPlan.followUpTests.push('Complete metabolic panel');
                    analysis.treatmentPlan.followUpTests.push('Urine microalbumin');
                    analysis.lifestyleChanges.precautions.push('Monitor protein intake');
                    analysis.lifestyleChanges.precautions.push('Stay well hydrated');
                    healthScore -= 15;
                }
            }

            // Liver function assessment
            if (bloodMetrics.alt?.value || bloodMetrics.ast?.value) {
                const alt = parseFloat(bloodMetrics.alt?.value || 0);
                const ast = parseFloat(bloodMetrics.ast?.value || 0);
                if (alt > 56 || ast > 40) {
                    analysis.riskFactors.push('Elevated liver enzymes');
                    analysis.treatmentPlan.followUpTests.push('Comprehensive liver function tests');
                    analysis.lifestyleChanges.precautions.push('Limit alcohol consumption');
                    analysis.lifestyleChanges.precautions.push('Avoid hepatotoxic medications');
                    healthScore -= 12;
                }
            }

            // Hemoglobin analysis with gender-specific references
            if (bloodMetrics.hemoglobin?.value) {
                const hemoglobin = parseFloat(bloodMetrics.hemoglobin.value);
                const normalLower = gender === 'female' ? 12.0 : 13.8;
                const normalUpper = gender === 'female' ? 15.5 : 17.2;
                
                if (hemoglobin < normalLower) {
                    analysis.riskFactors.push('Low hemoglobin - possible anemia');
                    analysis.treatmentPlan.medications.push({
                        name: 'Iron supplement (Ferrous Sulfate)',
                        dosage: '65mg elemental iron',
                        frequency: 'Once daily on empty stomach',
                        duration: '3 months',
                        notes: 'Take with vitamin C for better absorption. May cause constipation.'
                    });
                    analysis.lifestyleChanges.diet.push('Iron-rich foods: lean meats, spinach, lentils, fortified cereals');
                    analysis.lifestyleChanges.supplements.push('Vitamin C to enhance iron absorption');
                    analysis.treatmentPlan.followUpTests.push('Complete blood count in 6 weeks');
                    analysis.treatmentPlan.followUpTests.push('Iron studies (ferritin, TIBC)');
                    healthScore -= 15;
                } else if (hemoglobin > normalUpper) {
                    analysis.riskFactors.push('Elevated hemoglobin - requires investigation');
                    analysis.treatmentPlan.followUpTests.push('Complete blood count with differential');
                    healthScore -= 10;
                }
            }
        }

        // Urine analysis
        if (reportType === 'urine' && urineMetrics) {
            if (urineMetrics.protein?.value && urineMetrics.protein.value !== 'Negative') {
                analysis.riskFactors.push('Protein in urine - possible kidney involvement');
                analysis.treatmentPlan.followUpTests.push('24-hour urine protein');
                analysis.treatmentPlan.followUpTests.push('Kidney function tests');
                healthScore -= 12;
            }

            if (urineMetrics.glucose?.value && urineMetrics.glucose.value !== 'Negative') {
                analysis.riskFactors.push('Glucose in urine - diabetes screening needed');
                analysis.treatmentPlan.followUpTests.push('Fasting blood glucose');
                analysis.treatmentPlan.followUpTests.push('HbA1c test');
                healthScore -= 15;
            }
        }

        // Generate comprehensive recommendations
        this.generateLifestyleRecommendations(analysis, patientProfile);
        this.generatePreventiveRecommendations(analysis, patientProfile);
        
        // Calculate final health score
        analysis.healthScore = Math.max(0, Math.min(100, healthScore));
        
        // Determine urgency level based on findings
        if (criticalFindings.length > 0) {
            analysis.urgencyLevel = 'high';
        } else if (analysis.riskFactors.length > 2) {
            analysis.urgencyLevel = 'medium';
        }

        // Generate summaries
        analysis.treatmentPlan.summary = this.generateTreatmentSummary(analysis);
        analysis.lifestyleChanges.summary = this.generateLifestyleSummary(analysis);

        return analysis;
    }

    generateLifestyleRecommendations(analysis, patientProfile) {
        const { age } = patientProfile;

        // Age-specific recommendations
        if (age > 50) {
            analysis.lifestyleChanges.exercise.push('Resistance training 2-3 times per week for bone health');
            analysis.lifestyleChanges.supplements.push('Vitamin D and Calcium for bone health');
            analysis.preventiveRecommendations.push('Annual bone density screening');
        }

        if (age > 40) {
            analysis.preventiveRecommendations.push('Annual cardiovascular screening');
            analysis.lifestyleChanges.diet.push('Anti-inflammatory foods: berries, leafy greens, fatty fish');
        }

        // General lifestyle recommendations
        analysis.lifestyleChanges.habits.push('7-9 hours of quality sleep per night');
        analysis.lifestyleChanges.habits.push('Stress management techniques (meditation, yoga)');
        analysis.lifestyleChanges.habits.push('Regular hydration (8-10 glasses water daily)');
        analysis.lifestyleChanges.precautions.push('Avoid smoking and limit alcohol consumption');
    }

    generatePreventiveRecommendations(analysis, patientProfile) {
        const { age, gender } = patientProfile;

        // Gender and age-specific screenings
        if (gender === 'female') {
            if (age >= 40) {
                analysis.preventiveRecommendations.push('Annual mammography screening');
            }
            if (age >= 21) {
                analysis.preventiveRecommendations.push('Regular Pap smear screening');
            }
        }

        if (gender === 'male' && age >= 50) {
            analysis.preventiveRecommendations.push('Prostate cancer screening discussion');
        }

        if (age >= 50) {
            analysis.preventiveRecommendations.push('Colorectal cancer screening');
        }

        // Universal recommendations
        analysis.preventiveRecommendations.push('Annual flu vaccination');
        analysis.preventiveRecommendations.push('Regular dental and eye examinations');
    }

    generateTreatmentSummary(analysis) {
        const medCount = analysis.treatmentPlan.medications.length;
        const testCount = analysis.treatmentPlan.followUpTests.length;
        const emergencyCount = analysis.treatmentPlan.emergencyWarnings.length;

        if (emergencyCount > 0) {
            return `URGENT: ${emergencyCount} critical finding(s) requiring immediate attention. Treatment plan includes ${medCount} medication(s) and ${testCount} follow-up test(s).`;
        } else if (medCount > 0) {
            return `Treatment plan includes ${medCount} recommended medication(s) and ${testCount} follow-up test(s) for monitoring.`;
        } else if (testCount > 0) {
            return `${testCount} follow-up test(s) recommended for further evaluation.`;
        } else {
            return 'No immediate treatment required. Continue preventive care and healthy lifestyle.';
        }
    }

    generateLifestyleSummary(analysis) {
        const totalRecommendations = analysis.lifestyleChanges.diet.length + 
                                   analysis.lifestyleChanges.exercise.length + 
                                   analysis.lifestyleChanges.habits.length;
        
        if (totalRecommendations > 5) {
            return 'Comprehensive lifestyle modifications recommended for optimal health outcomes.';
        } else if (totalRecommendations > 2) {
            return 'Several lifestyle changes recommended to improve health indicators.';
        } else {
            return 'Minimal lifestyle adjustments needed. Continue current healthy practices.';
        }
    }

    // Optional: Integration with real AI services like OpenAI
    async getAIInsights(reportData, patientProfile) {
        // This method can be used to integrate with actual AI services
        // Example with OpenAI GPT (requires API key)
        /*
        try {
            const prompt = `Analyze this health report and provide medical recommendations:
                Patient: ${patientProfile.age} year old ${patientProfile.gender}
                Report Type: ${reportData.reportType}
                Metrics: ${JSON.stringify(reportData.bloodMetrics || reportData.urineMetrics)}
                Notes: ${reportData.patientNotes}
                
                Please provide structured medical recommendations including treatment plans and lifestyle changes.`;

            const response = await this.openai.chat.completions.create({
                model: "gpt-4",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.3
            });

            return response.choices[0].message.content;
        } catch (error) {
            console.error('OpenAI API error:', error);
            return null;
        }
        */
        return null;
    }
}

export default new AIHealthRecommendationService();
