import OpenAI from "openai";
import axios from "axios";

// Enhanced AI Health Recommendation Service
class AIHealthRecommendationService {
  constructor() {
    // Initialize OpenAI with API key from environment variables
    const openaiApiKey = process.env.OPENAI_API_KEY || 'your-openai-api-key-here';
    console.log(`Initializing OpenAI with API key: ${openaiApiKey.substring(0, 5)}...${openaiApiKey.substring(openaiApiKey.length - 4)}`);
    this.openai = new OpenAI({
      apiKey: openaiApiKey
    });

    // Initialize Gemini configuration
    this.geminiApiKey = process.env.GEMINI_API_KEY || 'your-gemini-api-key-here';
    this.geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${this.geminiApiKey}`;
    console.log(`Gemini API configured with key: ${this.geminiApiKey.substring(0, 5)}...${this.geminiApiKey.substring(this.geminiApiKey.length - 4)}`);
  }

  // Enhanced AI analysis with more sophisticated logic
  async generateHealthRecommendations(reportData, patientProfile = {}) {
    const { bloodMetrics, urineMetrics, reportType } = reportData;
    const { gender } = patientProfile;

    const analysis = {
      treatmentPlan: {
        medications: [],
        procedures: [],
        followUpTests: [],
        summary: "",
        emergencyWarnings: [],
      },
      lifestyleChanges: {
        diet: [],
        exercise: [],
        habits: [],
        precautions: [],
        supplements: [],
        summary: "",
      },
      riskFactors: [],
      healthScore: 0,
      urgencyLevel: "low",
      confidenceScore: 0.8,
      nextAppointmentSuggestion: "routine",
      preventiveRecommendations: [],
    };

    let healthScore = 100;
    let criticalFindings = [];

    if (reportType === "blood" && bloodMetrics) {
      // Enhanced glucose analysis
      if (bloodMetrics.glucose?.value) {
        const glucose = parseFloat(bloodMetrics.glucose.value);
        if (glucose >= 200) {
          criticalFindings.push("Severely elevated glucose - possible diabetic emergency");
          analysis.urgencyLevel = "high";
          analysis.treatmentPlan.emergencyWarnings.push("Seek immediate medical attention for glucose levels above 200 mg/dL");
          healthScore -= 30;
        } else if (glucose > 126) {
          analysis.riskFactors.push("Elevated glucose levels - diabetes diagnosis criteria met");
          analysis.treatmentPlan.medications.push({
            name: "Metformin",
            dosage: "500mg",
            frequency: "Twice daily with meals",
            duration: "3 months initially",
            notes: "Monitor blood glucose levels weekly. May cause GI upset - take with food.",
          });
          analysis.treatmentPlan.followUpTests.push("HbA1c test in 3 months");
          analysis.treatmentPlan.followUpTests.push("Lipid panel in 6 weeks");
          analysis.lifestyleChanges.diet.push("Carbohydrate counting and portion control");
          analysis.lifestyleChanges.diet.push("Mediterranean diet pattern");
          analysis.lifestyleChanges.exercise.push("150 minutes moderate aerobic activity per week");
          analysis.urgencyLevel = "high";
          healthScore -= 20;
        } else if (glucose > 100) {
          analysis.riskFactors.push("Pre-diabetic glucose levels - intervention opportunity");
          analysis.lifestyleChanges.diet.push("Low glycemic index foods");
          analysis.lifestyleChanges.diet.push("Reduce added sugars and refined carbohydrates");
          analysis.lifestyleChanges.exercise.push("Post-meal walks to improve glucose uptake");
          analysis.preventiveRecommendations.push("Annual diabetes screening");
          healthScore -= 10;
        } else if (glucose >= 70) {
          analysis.preventiveRecommendations.push("Maintain healthy glucose levels with balanced nutrition");
        } else {
          analysis.riskFactors.push("Low glucose levels - possible hypoglycemia");
          analysis.treatmentPlan.procedures.push("Investigate causes of hypoglycemia");
          healthScore -= 15;
        }
      }

      // Enhanced cholesterol analysis with risk stratification
      if (bloodMetrics.cholesterol?.value) {
        const cholesterol = parseFloat(bloodMetrics.cholesterol.value);
        if (cholesterol > 300) {
          criticalFindings.push("Extremely high cholesterol - urgent intervention needed");
          analysis.urgencyLevel = "high";
          healthScore -= 25;
        } else if (cholesterol > 240) {
          analysis.riskFactors.push("High cholesterol - cardiovascular risk");
          analysis.treatmentPlan.medications.push({
            name: "Atorvastatin",
            dosage: "20mg",
            frequency: "Once daily in the evening",
            duration: "6 months with monitoring",
            notes: "Monitor liver function tests. Avoid grapefruit juice.",
          });
          analysis.lifestyleChanges.diet.push("DASH diet or Mediterranean diet");
          analysis.lifestyleChanges.diet.push("Increase soluble fiber (oats, beans, fruits)");
          analysis.lifestyleChanges.exercise.push("Aerobic exercise 150+ minutes/week");
          analysis.treatmentPlan.followUpTests.push("Lipid panel in 6-8 weeks");
          healthScore -= 15;
        } else if (cholesterol > 200) {
          analysis.riskFactors.push("Borderline high cholesterol");
          analysis.lifestyleChanges.diet.push("Heart-healthy diet with omega-3 fatty acids");
          analysis.lifestyleChanges.diet.push("Limit saturated and trans fats");
          analysis.lifestyleChanges.exercise.push("Regular cardiovascular exercise");
          analysis.preventiveRecommendations.push("Annual lipid screening");
          healthScore -= 8;
        }
      }

      // HbA1c analysis for long-term glucose control
      if (bloodMetrics.hba1c?.value) {
        const hba1c = parseFloat(bloodMetrics.hba1c.value);
        if (hba1c >= 6.5) {
          analysis.riskFactors.push("Diabetes confirmed by HbA1c criteria");
          analysis.treatmentPlan.followUpTests.push("Quarterly HbA1c monitoring");
          healthScore -= 20;
        } else if (hba1c >= 5.7) {
          analysis.riskFactors.push("Prediabetes - elevated diabetes risk");
          analysis.preventiveRecommendations.push("Diabetes prevention program");
          healthScore -= 10;
        }
      }

      // Kidney function assessment
      if (bloodMetrics.creatinine?.value) {
        const creatinine = parseFloat(bloodMetrics.creatinine.value);
        const normalUpper = gender === "female" ? 1.1 : 1.3;
        if (creatinine > normalUpper * 1.5) {
          analysis.riskFactors.push("Elevated creatinine - possible kidney dysfunction");
          analysis.treatmentPlan.followUpTests.push("Complete metabolic panel");
          analysis.treatmentPlan.followUpTests.push("Urine microalbumin");
          analysis.lifestyleChanges.precautions.push("Monitor protein intake");
          analysis.lifestyleChanges.precautions.push("Stay well hydrated");
          healthScore -= 15;
        }
      }

      // Liver function assessment
      if (bloodMetrics.alt?.value || bloodMetrics.ast?.value) {
        const alt = parseFloat(bloodMetrics.alt?.value || 0);
        const ast = parseFloat(bloodMetrics.ast?.value || 0);
        if (alt > 56 || ast > 40) {
          analysis.riskFactors.push("Elevated liver enzymes");
          analysis.treatmentPlan.followUpTests.push("Comprehensive liver function tests");
          analysis.lifestyleChanges.precautions.push("Limit alcohol consumption");
          analysis.lifestyleChanges.precautions.push("Avoid hepatotoxic medications");
          healthScore -= 12;
        }
      }

      // Hemoglobin analysis with gender-specific references
      if (bloodMetrics.hemoglobin?.value) {
        const hemoglobin = parseFloat(bloodMetrics.hemoglobin.value);
        const normalLower = gender === "female" ? 12.0 : 13.8;
        const normalUpper = gender === "female" ? 15.5 : 17.2;

        if (hemoglobin < normalLower) {
          analysis.riskFactors.push("Low hemoglobin - possible anemia");
          analysis.treatmentPlan.medications.push({
            name: "Iron supplement (Ferrous Sulfate)",
            dosage: "65mg elemental iron",
            frequency: "Once daily on empty stomach",
            duration: "3 months",
            notes: "Take with vitamin C for better absorption. May cause constipation.",
          });
          analysis.lifestyleChanges.diet.push("Iron-rich foods: lean meats, spinach, lentils, fortified cereals");
          analysis.lifestyleChanges.supplements.push("Vitamin C to enhance iron absorption");
          analysis.treatmentPlan.followUpTests.push("Complete blood count in 6 weeks");
          analysis.treatmentPlan.followUpTests.push("Iron studies (ferritin, TIBC)");
          healthScore -= 15;
        } else if (hemoglobin > normalUpper) {
          analysis.riskFactors.push("Elevated hemoglobin - requires investigation");
          analysis.treatmentPlan.followUpTests.push("Complete blood count with differential");
          healthScore -= 10;
        }
      }
    }

    // Urine analysis
    if (reportType === "urine" && urineMetrics) {
      if (urineMetrics.protein?.value && urineMetrics.protein.value !== "Negative") {
        analysis.riskFactors.push("Protein in urine - possible kidney involvement");
        analysis.treatmentPlan.followUpTests.push("24-hour urine protein");
        analysis.treatmentPlan.followUpTests.push("Kidney function tests");
        healthScore -= 12;
      }

      if (urineMetrics.glucose?.value && urineMetrics.glucose.value !== "Negative") {
        analysis.riskFactors.push("Glucose in urine - diabetes screening needed");
        analysis.treatmentPlan.followUpTests.push("Fasting blood glucose");
        analysis.treatmentPlan.followUpTests.push("HbA1c test");
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
      analysis.urgencyLevel = "high";
    } else if (analysis.riskFactors.length > 2) {
      analysis.urgencyLevel = "medium";
    }

    // Generate summaries
    analysis.treatmentPlan.summary = this.generateTreatmentSummary(analysis);
    analysis.lifestyleChanges.summary = this.generateLifestyleSummary(analysis);

    return analysis;
  }

  generateLifestyleRecommendations(analysis, patientProfile) {
    const { age, bloodGroup } = patientProfile;

    // Age-specific recommendations
    if (age > 50) {
      analysis.lifestyleChanges.exercise.push("Resistance training 2-3 times per week for bone health");
      analysis.lifestyleChanges.supplements.push("Vitamin D and Calcium for bone health");
      analysis.preventiveRecommendations.push("Annual bone density screening");
    }

    if (age > 40) {
      analysis.preventiveRecommendations.push("Annual cardiovascular screening");
      analysis.lifestyleChanges.diet.push("Anti-inflammatory foods: berries, leafy greens, fatty fish");
    }

    // Blood group specific recommendations
    if (bloodGroup) {
      if (bloodGroup.includes("A")) {
        analysis.lifestyleChanges.diet.push("Type A: Focus on plant-based diet with limited red meat");
        analysis.lifestyleChanges.exercise.push("Type A: Consider low-impact exercises like yoga and tai chi");
      } else if (bloodGroup.includes("B")) {
        analysis.lifestyleChanges.diet.push("Type B: Balance of meat and plants, avoid chicken and wheat");
        analysis.lifestyleChanges.exercise.push("Type B: Moderate exercise like walking and swimming");
      } else if (bloodGroup.includes("AB")) {
        analysis.lifestyleChanges.diet.push("Type AB: Mixed diet with seafood, avoid caffeine and alcohol");
        analysis.lifestyleChanges.exercise.push("Type AB: Calming exercise with moderate intensity");
      } else if (bloodGroup.includes("O")) {
        analysis.lifestyleChanges.diet.push("Type O: Higher protein diet with lean meats, limit grains");
        analysis.lifestyleChanges.exercise.push("Type O: Regular intense physical exercise recommended");
      }
    }

    // General lifestyle recommendations
    analysis.lifestyleChanges.habits.push("7-9 hours of quality sleep per night");
    analysis.lifestyleChanges.habits.push("Stress management techniques (meditation, yoga)");
    analysis.lifestyleChanges.habits.push("Regular hydration (8-10 glasses water daily)");
    analysis.lifestyleChanges.precautions.push("Avoid smoking and limit alcohol consumption");
  }

  generatePreventiveRecommendations(analysis, patientProfile) {
    const { age, gender, bloodGroup } = patientProfile;

    // Gender and age-specific screenings
    if (gender === "female") {
      if (age >= 40) {
        analysis.preventiveRecommendations.push("Annual mammography screening");
      }
      if (age >= 21) {
        analysis.preventiveRecommendations.push("Regular Pap smear screening");
      }
    }

    if (gender === "male" && age >= 50) {
      analysis.preventiveRecommendations.push("Prostate cancer screening discussion");
    }

    if (age >= 50) {
      analysis.preventiveRecommendations.push("Colorectal cancer screening");
    }

    // Blood group specific preventive recommendations
    if (bloodGroup) {
      if (bloodGroup.includes("A") || bloodGroup.includes("AB")) {
        analysis.preventiveRecommendations.push("Regular monitoring of heart health due to higher risk of cardiovascular issues");
      }
      if (bloodGroup.includes("O")) {
        analysis.preventiveRecommendations.push("Regular monitoring of stomach acidity and ulcer risk");
      }
      if (bloodGroup.includes("B")) {
        analysis.preventiveRecommendations.push("Monitor for autoimmune conditions which may have higher prevalence");
      }
    }

    // Universal recommendations
    analysis.preventiveRecommendations.push("Annual flu vaccination");
    analysis.preventiveRecommendations.push("Regular dental and eye examinations");
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
      return "No immediate treatment required. Continue preventive care and healthy lifestyle.";
    }
  }

  generateLifestyleSummary(analysis) {
    const totalRecommendations = analysis.lifestyleChanges.diet.length + analysis.lifestyleChanges.exercise.length + analysis.lifestyleChanges.habits.length;

    if (totalRecommendations > 5) {
      return "Comprehensive lifestyle modifications recommended for optimal health outcomes.";
    } else if (totalRecommendations > 2) {
      return "Several lifestyle changes recommended to improve health indicators.";
    } else {
      return "Minimal lifestyle adjustments needed. Continue current healthy practices.";
    }
  }

  // Helper function to create a standardized prompt for both AI services
  createHealthAnalysisPrompt(reportData, patientProfile) {
    const report = reportData.reportId || reportData;
    const metrics = report.bloodMetrics || report.urineMetrics || {};
    const reportType = report.reportType || "health";
    const doctorFeedback = reportData.doctorFeedbackToAI || "";

    return `Analyze this health report and provide medical recommendations:
      Patient: ${patientProfile.age || 30} year old ${patientProfile.gender || 'unknown'}, Blood Group: ${patientProfile.bloodGroup || 'unknown'}
      Report Type: ${reportType}
      Doctor Feedback: ${doctorFeedback}
      Metrics: ${JSON.stringify(metrics)}
      Based on the above data${doctorFeedback ? ' and doctor feedback' : ''}, provide a comprehensive health analysis in JSON format with the following structure:
      {
        "treatmentPlan": {
          "medications": [{"name": "...", "dosage": "...", "frequency": "...", "duration": "...", "notes": "..."}],
          "procedures": ["..."],
          "followUpTests": ["..."],
          "summary": "...",
          "emergencyWarnings": ["..."]
        },
        "lifestyleChanges": {
          "diet": ["..."],
          "exercise": ["..."],
          "habits": ["..."],
          "precautions": ["..."],
          "supplements": ["..."],
          "summary": "..."
        },
        "riskFactors": ["..."],
        "healthScore": 75,
        "urgencyLevel": "low|medium|high",
        "confidenceScore": 0.8,
        "nextAppointmentSuggestion": "routine|follow-up|urgent",
        "preventiveRecommendations": ["..."]
      }`;
  }

  // OpenAI-specific implementation
  async getOpenAIInsights(reportData, patientProfile) {
    console.log("Processing report data with OpenAI");

    try {
      const prompt = this.createHealthAnalysisPrompt(reportData, patientProfile);
      const doctorFeedback = reportData.doctorFeedbackToAI || "";

      console.log('Calling OpenAI API for health insights...');

      // Call OpenAI API
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 2000
      });

      console.log('OpenAI API response received for health insights');

      // Parse the response
      const aiResponse = response.choices[0].message.content;
      console.log("OpenAI response received");

      // Extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : null;

      if (jsonString) {
        const aiAnalysis = JSON.parse(jsonString);

        // Add note if this was based on doctor feedback
        if (doctorFeedback) {
          aiAnalysis.treatmentPlan.summary = `UPDATED BASED ON DOCTOR FEEDBACK: ${aiAnalysis.treatmentPlan.summary}`;
          aiAnalysis.confidenceScore = Math.min(1.0, (aiAnalysis.confidenceScore || 0.8) + 0.1);
        }

        aiAnalysis.aiProvider = "OpenAI";
        return aiAnalysis;
      } else {
        throw new Error("No valid JSON found in OpenAI response");
      }
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  // Gemini-specific implementation
  async getGeminiInsights(reportData, patientProfile) {
    console.log("Processing report data with Gemini");

    try {
      const prompt = this.createHealthAnalysisPrompt(reportData, patientProfile);
      
      const doctorFeedback = reportData.doctorFeedbackToAI || "";

      const requestBody = {
        contents: [{
          parts: [{ text: prompt }]
        }]
      };

      console.log("Sending request to Gemini API...");

      const response = await axios.post(this.geminiApiUrl, requestBody, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Gemini API response received for health insights');

      // Extract the JSON string from the API's response
      const rawText = response.data.candidates[0].content.parts[0].text;

      // Clean the response to ensure it's valid JSON
      let jsonString = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const jsonStart = jsonString.indexOf('{');
      const jsonEnd = jsonString.lastIndexOf('}');
      jsonString = jsonString.substring(jsonStart, jsonEnd + 1);

      // Parse the JSON string into an object
      const aiAnalysis = JSON.parse(jsonString);

      // Add note if this was based on doctor feedback
      if (doctorFeedback) {
        aiAnalysis.treatmentPlan.summary = `UPDATED BASED ON DOCTOR FEEDBACK: ${aiAnalysis.treatmentPlan.summary}`;
        aiAnalysis.confidenceScore = Math.min(1.0, (aiAnalysis.confidenceScore || 0.8) + 0.1);
      }

      aiAnalysis.aiProvider = "Gemini";
      console.log("Gemini recommendations processed:", aiAnalysis);
      return aiAnalysis;

    } catch (error) {
      console.error("Error calling Gemini API:", error.response ? error.response.data : error.message);
      throw error;
    }
  }

  // Main function that conditionally uses OpenAI or Gemini
  async getAIInsights(reportData, patientProfile, options = {}) {
    const { provider = 'openai', fallbackProvider = true } = options;

    console.log(`Processing report data with ${provider.toUpperCase()}`);

    try {
      let aiAnalysis;

      // Try the primary provider
      if (provider.toLowerCase() === 'gemini') {
        aiAnalysis = await this.getGeminiInsights(reportData, patientProfile);
      } else {
        aiAnalysis = await this.getOpenAIInsights(reportData, patientProfile);
      }

      return aiAnalysis;

    } catch (error) {
      console.error(`${provider.toUpperCase()} API error:`, error);

      // Try fallback provider if enabled
      if (fallbackProvider) {
        console.log(`Attempting fallback to ${provider.toLowerCase() === 'gemini' ? 'OpenAI' : 'Gemini'}...`);

        try {
          let fallbackAnalysis;

          if (provider.toLowerCase() === 'gemini') {
            // Fallback to OpenAI
            fallbackAnalysis = await this.getOpenAIInsights(reportData, patientProfile);
          } else {
            // Fallback to Gemini
            fallbackAnalysis = await this.getGeminiInsights(reportData, patientProfile);
          }

          fallbackAnalysis.isFallback = true;
          return fallbackAnalysis;

        } catch (fallbackError) {
          console.error('Fallback provider also failed:', fallbackError);
        }
      }

      // If all AI providers fail, fall back to built-in recommendations
      console.log('All AI providers failed, using built-in recommendations');
      const report = reportData.reportId || reportData;
      return this.generateHealthRecommendations(report, patientProfile);
    }
  }

  // Helper function to create a standardized prompt for personalized health plans
  createHealthPlanPrompt(reports, trends, patientProfile) {
    // Extract key metrics from all reports
    const reportMetrics = reports.map(report => {
      const metrics = {};
      if (report.bloodMetrics) {
        Object.entries(report.bloodMetrics).forEach(([key, value]) => {
          if (value && value.value) {
            metrics[key] = value.value;
          }
        });
      }
      if (report.urineMetrics) {
        Object.entries(report.urineMetrics).forEach(([key, value]) => {
          if (value && value.value) {
            metrics[key] = value.value;
          }
        });
      }
      return {
        date: report.createdAt,
        type: report.reportType,
        metrics
      };
    });

    return `Generate a personalized health plan based on multiple health reports over the past 6 months.

                        Patient Profile:
                        - Age: ${patientProfile.age}
                        - Gender: ${patientProfile.gender}
                        - Blood Group: ${patientProfile.bloodGroup || 'Unknown'}
                        - Medical History: ${patientProfile.medicalHistory?.join(', ') || 'None reported'}
                        - Current Medications: ${patientProfile.currentMedications?.join(', ') || 'None reported'}

                        Health Report Trends (${reports.length} reports analyzed):
                        ${JSON.stringify(trends, null, 2)}

                        Report Metrics Summary:
                        ${JSON.stringify(reportMetrics, null, 2)}

                        Based on this data, create a comprehensive personalized health plan in JSON format with the following structure:
                        {
                        "priorities": ["Priority 1", "Priority 2"],
                        "shortTermGoals": ["Goal 1", "Goal 2"],
                        "longTermGoals": ["Goal 1", "Goal 2"],
                        "actionItems": ["Action 1", "Action 2"],
                        "riskMitigation": ["Risk mitigation strategy 1", "Risk mitigation strategy 2"],
                        "successMetrics": ["Metric 1", "Metric 2"],
                        "dietaryRecommendations": ["Recommendation 1", "Recommendation 2"],
                        "exerciseRecommendations": ["Recommendation 1", "Recommendation 2"],
                        "lifestyleChanges": ["Change 1", "Change 2"],
                        "followUpSchedule": "Recommended follow-up schedule",
                        "summary": "Brief summary of the health plan"
                        }`;
  }

  // OpenAI-specific implementation for personalized health plans
  async getOpenAIPersonalizedPlan(reports, trends, patientProfile) {
    console.log("Generating personalized plan with OpenAI");

    try {
      const prompt = this.createHealthPlanPrompt(reports, trends, patientProfile);

      console.log('Calling OpenAI API for personalized health plan...');

      // Call OpenAI API
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 2000
      });

      console.log('OpenAI API response received for personalized plan');

      // Parse the response
      const aiResponse = response.choices[0].message.content;

      // Extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : null;

      if (jsonString) {
        const aiPlan = JSON.parse(jsonString);
        // Add metadata
        aiPlan.generatedBy = 'OpenAI';
        aiPlan.reportsAnalyzed = reports.length;
        aiPlan.timeRange = '6 months';
        aiPlan.aiProvider = 'OpenAI';
        return aiPlan;
      } else {
        throw new Error("No valid JSON found in OpenAI response");
      }
    } catch (error) {
      console.error('OpenAI API error for personalized plan:', error);
      throw error;
    }
  }

  // Gemini-specific implementation for personalized health plans
  async getGeminiPersonalizedPlan(reports, trends, patientProfile) {
    console.log("Generating personalized plan with Gemini");

    try {
      const prompt = this.createHealthPlanPrompt(reports, trends, patientProfile);

      const requestBody = {
        contents: [{
          parts: [{ text: prompt }]
        }]
      };

      console.log("Sending personalized plan request to Gemini API...");

      const response = await axios.post(this.geminiApiUrl, requestBody, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Gemini API response received for personalized plan');

      // Extract the JSON string from the API's response
      const rawText = response.data.candidates[0].content.parts[0].text;

      // Clean the response to ensure it's valid JSON
      let jsonString = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const jsonStart = jsonString.indexOf('{');
      const jsonEnd = jsonString.lastIndexOf('}');
      jsonString = jsonString.substring(jsonStart, jsonEnd + 1);

      // Parse the JSON string into an object
      const aiPlan = JSON.parse(jsonString);

      // Add metadata
      aiPlan.generatedBy = 'Gemini';
      aiPlan.reportsAnalyzed = reports.length;
      aiPlan.timeRange = '6 months';
      aiPlan.aiProvider = 'Gemini';
      
      console.log("Gemini personalized plan processed:", aiPlan);
      return aiPlan;

    } catch (error) {
      console.error("Error calling Gemini API for personalized plan:", error.response ? error.response.data : error.message);
      throw error;
    }
  }

  // Main function for generating AI-powered personalized health plans with provider options
  async generateAIPersonalizedPlan(reports, trends, patientProfile, options = {}) {
    const { provider = 'openai', fallbackProvider = true } = options;

    console.log(`Generating personalized plan with ${provider.toUpperCase()}`);

    try {
      let aiPlan;

      // Try the primary provider
      if (provider.toLowerCase() === 'gemini') {
        aiPlan = await this.getGeminiPersonalizedPlan(reports, trends, patientProfile);
      } else {
        aiPlan = await this.getOpenAIPersonalizedPlan(reports, trends, patientProfile);
      }

      return aiPlan;

    } catch (error) {
      console.error(`${provider.toUpperCase()} API error for personalized plan:`, error);

      // Try fallback provider if enabled
      if (fallbackProvider) {
        console.log(`Attempting fallback to ${provider.toLowerCase() === 'gemini' ? 'OpenAI' : 'Gemini'} for personalized plan...`);

        try {
          let fallbackPlan;

          if (provider.toLowerCase() === 'gemini') {
            // Fallback to OpenAI
            fallbackPlan = await this.getOpenAIPersonalizedPlan(reports, trends, patientProfile);
          } else {
            // Fallback to Gemini
            fallbackPlan = await this.getGeminiPersonalizedPlan(reports, trends, patientProfile);
          }

          fallbackPlan.isFallback = true;
          return fallbackPlan;

        } catch (fallbackError) {
          console.error('Fallback provider also failed for personalized plan:', fallbackError);
        }
      }

      // If all AI providers fail, fall back to built-in plan
      console.log('All AI providers failed, using built-in personalized plan');
      return this.generateFallbackPlan(reports, trends, patientProfile);
    }
  }

  // Fallback function to generate personalized plan if AI fails
  generateFallbackPlan(reports, trends, patientProfile) {
    const plan = {
      priorities: [],
      shortTermGoals: [],
      longTermGoals: [],
      actionItems: [],
      riskMitigation: [],
      successMetrics: [],
      dietaryRecommendations: [],
      exerciseRecommendations: [],
      lifestyleChanges: [],
      followUpSchedule: "3 months",
      summary: "Personalized health plan based on your recent health reports",
      generatedBy: "System"
    };

    // Analyze concerning trends
    if (trends.glucose.concern && trends.glucose.trend === 'increasing') {
      plan.priorities.push('Diabetes Prevention/Management');
      plan.shortTermGoals.push('Reduce blood glucose by 10% in 3 months');
      plan.actionItems.push('Implement carbohydrate counting');
      plan.actionItems.push('30-minute post-meal walks');
      plan.riskMitigation.push('Regular glucose monitoring');
      plan.successMetrics.push('Fasting glucose < 100 mg/dL');
      plan.dietaryRecommendations.push('Low glycemic index diet');
      plan.exerciseRecommendations.push('Regular moderate exercise, 150 minutes per week');
    }

    if (trends.cholesterol.concern && trends.cholesterol.trend === 'increasing') {
      plan.priorities.push('Cardiovascular Health');
      plan.shortTermGoals.push('Lower cholesterol levels within 6 months');
      plan.actionItems.push('Heart-healthy Mediterranean diet');
      plan.actionItems.push('150 minutes aerobic exercise weekly');
      plan.successMetrics.push('Total cholesterol < 200 mg/dL');
      plan.dietaryRecommendations.push('Reduce saturated fats and increase omega-3 fatty acids');
      plan.exerciseRecommendations.push('Cardiovascular exercise 3-5 times per week');
    }

    // Age-specific recommendations
    if (patientProfile.age > 50) {
      plan.longTermGoals.push('Maintain bone density and muscle mass');
      plan.actionItems.push('Resistance training 2-3x per week');
      plan.successMetrics.push('Annual bone density within normal range');
      plan.exerciseRecommendations.push('Weight-bearing exercises');
      plan.dietaryRecommendations.push('Calcium and vitamin D rich foods');
    }

    // General wellness goals
    plan.longTermGoals.push('Maintain optimal health metrics');
    plan.actionItems.push('Annual comprehensive health screening');
    plan.actionItems.push('Stress management and adequate sleep');
    plan.lifestyleChanges.push('Maintain 7-8 hours of quality sleep');
    plan.lifestyleChanges.push('Practice stress reduction techniques');

    return plan;
  };

  // Helper function to analyze trends across multiple reports
  analyzeTrends(reports) {
    const trends = {
      glucose: { trend: 'stable', values: [], concern: false },
      cholesterol: { trend: 'stable', values: [], concern: false },
      hemoglobin: { trend: 'stable', values: [], concern: false },
      overallHealthTrend: 'improving'
    };

    reports.forEach(report => {
      if (report.bloodMetrics) {
        if (report.bloodMetrics.glucose?.value) {
          trends.glucose.values.push({
            value: report.bloodMetrics.glucose.value,
            date: report.createdAt
          });
        }
        if (report.bloodMetrics.cholesterol?.value) {
          trends.cholesterol.values.push({
            value: report.bloodMetrics.cholesterol.value,
            date: report.createdAt
          });
        }
        if (report.bloodMetrics.hemoglobin?.value) {
          trends.hemoglobin.values.push({
            value: report.bloodMetrics.hemoglobin.value,
            date: report.createdAt
          });
        }
      }
    });

    // Calculate trends for each metric
    Object.keys(trends).forEach(metric => {
      if (trends[metric].values && trends[metric].values.length >= 2) {
        const values = trends[metric].values.sort((a, b) => new Date(a.date) - new Date(b.date));
        const recent = values.slice(-3).map(v => v.value);
        const older = values.slice(0, -3).map(v => v.value);

        if (recent.length > 0 && older.length > 0) {
          const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
          const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;

          const percentChange = ((recentAvg - olderAvg) / olderAvg) * 100;

          if (percentChange > 5) {
            trends[metric].trend = 'increasing';
            if (metric === 'glucose' || metric === 'cholesterol') {
              trends[metric].concern = percentChange > 10;
            }
          } else if (percentChange < -5) {
            trends[metric].trend = 'decreasing';
            if (metric === 'hemoglobin') {
              trends[metric].concern = percentChange < -10;
            }
          }
        }
      }
    });

    return trends;
  };
}

export default new AIHealthRecommendationService();
