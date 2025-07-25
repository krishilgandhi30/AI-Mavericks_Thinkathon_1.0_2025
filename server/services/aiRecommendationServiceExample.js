// Example usage of the AIHealthRecommendationService with both OpenAI and Gemini

import AIHealthRecommendationService from './aiRecommendationService.js';

// Example report data
const sampleReportData = {
    reportType: "blood",
    bloodMetrics: {
        glucose: { value: "150" },
        cholesterol: { value: "220" },
        hemoglobin: { value: "12.5" }
    },
    doctorFeedbackToAI: "Patient has family history of diabetes"
};

// Example patient profile
const samplePatientProfile = {
    age: 45,
    gender: "female",
    bloodGroup: "A+",
    medicalHistory: ["hypertension"],
    currentMedications: ["lisinopril"]
};

// Example usage functions
async function exampleUsage() {
    console.log("=== AI Health Recommendation Service Examples ===\n");

    try {
        // Example 1: Use OpenAI (default)
        console.log("1. Using OpenAI (default):");
        const openaiResult = await AIHealthRecommendationService.getAIInsights(
            sampleReportData,
            samplePatientProfile
        );
        console.log("OpenAI Result:", JSON.stringify(openaiResult, null, 2));
        console.log("\n" + "=".repeat(50) + "\n");

        // Example 2: Explicitly use OpenAI
        console.log("2. Explicitly using OpenAI:");
        const explicitOpenaiResult = await AIHealthRecommendationService.getAIInsights(
            sampleReportData,
            samplePatientProfile,
            { provider: 'openai' }
        );
        console.log("Explicit OpenAI Result:", JSON.stringify(explicitOpenaiResult, null, 2));
        console.log("\n" + "=".repeat(50) + "\n");

        // Example 3: Use Gemini
        console.log("3. Using Gemini:");
        const geminiResult = await AIHealthRecommendationService.getAIInsights(
            sampleReportData,
            samplePatientProfile,
            { provider: 'gemini' }
        );
        console.log("Gemini Result:", JSON.stringify(geminiResult, null, 2));
        console.log("\n" + "=".repeat(50) + "\n");

        // Example 4: Use Gemini with fallback disabled
        console.log("4. Using Gemini with fallback disabled:");
        const geminiNoFallbackResult = await AIHealthRecommendationService.getAIInsights(
            sampleReportData,
            samplePatientProfile,
            { provider: 'gemini', fallbackProvider: false }
        );
        console.log("Gemini (No Fallback) Result:", JSON.stringify(geminiNoFallbackResult, null, 2));
        console.log("\n" + "=".repeat(50) + "\n");

        // Example 5: Test individual functions
        console.log("5. Testing individual OpenAI function:");
        const directOpenaiResult = await AIHealthRecommendationService.getOpenAIInsights(
            sampleReportData,
            samplePatientProfile
        );
        console.log("Direct OpenAI Result:", JSON.stringify(directOpenaiResult, null, 2));
        console.log("\n" + "=".repeat(50) + "\n");

        console.log("6. Testing individual Gemini function:");
        const directGeminiResult = await AIHealthRecommendationService.getGeminiInsights(
            sampleReportData,
            samplePatientProfile
        );
        console.log("Direct Gemini Result:", JSON.stringify(directGeminiResult, null, 2));

    } catch (error) {
        console.error("Error in example usage:", error);
    }
}

// Uncomment the line below to run the examples
// exampleUsage();

export {
    exampleUsage,
    sampleReportData,
    samplePatientProfile
};
