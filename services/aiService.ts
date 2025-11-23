import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API
// Note: In a real production app, you might want to proxy this through a backend to hide the key,
// but for this client-side demo/MVP, we'll use the key directly from env.
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";

let genAI: GoogleGenerativeAI | null = null;

if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
} else {
    console.warn("Gemini API Key is missing. AI features will be disabled.");
}

export const categorizeTransaction = async (description: string): Promise<string | null> => {
    if (!genAI) {
        console.warn("AI service not initialized");
        return null;
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
        You are a financial assistant. Categorize the following transaction description into EXACTLY ONE of these categories:
        'Alimentation', 'Transport', 'Logement', 'Loisirs', 'Santé', 'Éducation', 'Shopping', 'Services', 'Autre'.
        
        Description: "${description}"
        
        Return ONLY the category name, nothing else. If you are unsure, return 'Autre'.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return text.trim();
    } catch (error) {
        console.error("Error categorizing transaction:", error);
        return null;
    }
};
